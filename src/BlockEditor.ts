import { blockEditorBox, blockEditorMenu, qeFloatBall } from "./libs/stores";
import { getAttribute, getTomatoPluginInstance, siyuan } from "./libs/utils";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
import { tomatoI18n } from "./tomatoI18n";
import BlockEditorSvelte from "./BlockEditor.svelte";
import { mount, unmount } from "svelte";
import { DestroyManager } from "./libs/destroyer";
import { BlockNodeEnum, DATA_NODE_ID } from "./libs/gconst";
import { QEBall, loadQEBallPos, qeBallTip } from "./libs/qeBall";
import { currentBockEditorDocID } from "./libs/Events";

export const BlockEditor打开编辑器 = winHotkey("alt+shift+5", "BlockEditor打开编辑器", "iconEdit", () => tomatoI18n.块编辑器, false, blockEditorMenu)

// Svelte 5 mount() 返回组件 exports 对象（勿调 destroy——那是组件自己的导出函数）
type BlockEditorExports = {
    pinBlock: (blockID: string) => Promise<void>;
    collapse: () => void;
};

// 钉住态提升（spec §1.2）：Svelte $state 收起即丢，类字段跨收起/展开存活
type PinState = { blockID: string; docID: string; title: string; docName: string };

// 两层控制模型（□5 常驻球版，阅读点悬浮球同构）：存在层 = dm 非 null，入口统一
// 「球显隐 toggle」——⌥⇧5/状态栏钮：不在→spawnBall（收缩球形态出场）；在→收面板+销毁球
// 全关。onload 配置开（qeFloatBall）即挂常驻球。右键链路独走 spawnPanel（直接展开+钉住
// 该块）。形态层 = sv 展开（DialogSvelte 面板）或 ball 收缩（悬浮球）。任何存在层关闭
// 路径（快捷键/状态栏钮/标题栏×）都走 dm.destroyBy()——清场全挂在 dm 链上，收起（collapse）
// 只 unmount sv 不碰 dm，钉住态/面板尺寸（savePositionKey）因此保留。
class BlockEditor {
    private dm: DestroyManager = null;
    private sv: BlockEditorExports = null;
    private ball: QEBall = null;
    private pin: PinState = { blockID: "", docID: "", title: "", docName: "" };
    private followDocName = "";
    private unsubDoc: (() => void) | null = null;
    private statusEl: HTMLElement = null;
    // open-menu-content handler 提字段：unload 摘除用（dv-* reload 后模块顶层重跑出新实例，
    // 旧实例监听不摘=右键菜单双份重复项且旧闭包 store 未注入面板恒不渲染——2026-09-05 e2e 实锤）
    private menuHandler = async ({ detail }: any) => {
        // open-menu-content detail={protyle, range, element}（menus/protyle.ts:929 实证；
        // blockElements 是 click-blockicon 专属勿用）。emitToPlugins 同步收集——addIfVisible 前禁 await
        const menu = detail.menu;
        const blockID = getAttribute((detail as any).element, DATA_NODE_ID);
        addIfVisible(menu, BlockEditor打开编辑器.langKey, {
            label: BlockEditor打开编辑器.langText(),
            icon: BlockEditor打开编辑器.icon,
            accelerator: BlockEditor打开编辑器.m,
            click: () => this.pinFromMenu(blockID),
        }, BlockEditor打开编辑器.menu());
    };

    async onload() {
        if (!blockEditorBox.get()) return;
        getTomatoPluginInstance().addCommand({
            langKey: BlockEditor打开编辑器.langKey,
            langText: BlockEditor打开编辑器.langText(),
            hotkey: BlockEditor打开编辑器.m,
            callback: () => this.toggleExistence(),
        });
        getTomatoPluginInstance().eventBus.on("open-menu-content", this.menuHandler as any);
        this.mountStatusBtn();
        // □5 常驻球：配置开即挂（存在层生命周期从「toggle 后」提前到 onload）；位置=存档位
        if (qeFloatBall.get()) this.spawnBall();
    }

    unload() {
        // 在场面板/球连存在层一起清；eventBus 监听摘除（防 reload 后双份菜单项，见 menuHandler 注释）；
        // 状态栏钮常驻元素须摘（addStatusBar 只 push 不移除，番茄钟先例）
        getTomatoPluginInstance()?.eventBus?.off?.("open-menu-content", this.menuHandler as any);
        this.dm?.destroyBy();
        const el = this.statusEl;
        if (!el) return;
        el.remove();
        const arr = (getTomatoPluginInstance() as any)?.statusBarIcons as Element[];
        const i = arr?.indexOf(el) ?? -1;
        if (i >= 0) arr.splice(i, 1);
        this.statusEl = null;
    }

    /** 存在层 toggle（快捷键 ⌥⇧5 / 状态栏钮，□5 语义=球显隐）：不在→收缩球出场；在→全关（收面板+销毁球+钉住态清） */
    private toggleExistence() {
        if (this.dm) this.dm.destroyBy();
        else this.spawnBall();
    }

    /** 右键链路：未开则开（展开面板）并钉住该块、已展开则换钉；收缩态自动展开+换钉（右键就是要看） */
    private pinFromMenu(blockID: string) {
        if (!blockID) return;
        if (!this.dm) {
            this.spawnPanel(blockID);
        } else if (this.sv) {
            void this.sv.pinBlock(blockID);
        } else {
            this.expandPanel(blockID);
        }
    }

    /** 存在层建立公共段：dm 清场链（sv/球/订阅/钉住态/状态栏钮熄灭/dm 置空） */
    private establish() {
        this.dm = new DestroyManager();
        this.dm.add("sv", () => this.unmountPanel());
        this.dm.add("ball", () => this.destroyBall());
        this.dm.add("unsub", () => this.unsubDocID());
        this.dm.add("pin", () => { this.pin = { blockID: "", docID: "", title: "", docName: "" }; });
        // 顺序敏感：dm 置空须在 status 前——refreshStatusBtn 读 this.dm 判亮灭（Map 插入序执行）
        this.dm.add("dm", () => this.dm = null);
        this.dm.add("status", () => this.refreshStatusBtn());
    }

    /** 存在层建立（收缩球形态）：toggle/onload 入路——球落 localStorage 存档位，跟随态订阅文档切换 */
    private spawnBall() {
        this.establish();
        this.mountBall(loadQEBallPos() ?? { x: 16, y: 16 });
        this.followDocSubscribe();
        this.seedFollowDocName();
        this.refreshStatusBtn();
    }

    /** 跟随态球 tooltip 初始填充：store 空时（3.8.2 切文档路径断供）DOM 直查当前文档，面板 followDocID 同款兜底。
     *  ?id= 直开与插件 onload 竞态下文档 DOM 未渲染——loaded-protyle-static 必发，一次性重试（内核 onGet 无条件发射） */
    private seedFollowDocName() {
        if (this.pin.blockID) return;
        const fill = (id?: string) => {
            if (!id || !this.ball) return;
            siyuan.getRowByID(id).then((row) => {
                if (row?.content && this.ball) {
                    this.followDocName = row.content;
                    this.ball.refresh();
                }
            }).catch(() => { });
        };
        const el = document.querySelector(".protyle:not(.fn__none) .protyle-title[data-node-id]");
        const id = el?.getAttribute("data-node-id");
        if (id) { fill(id); return; }
        const plugin = getTomatoPluginInstance();
        const retry = () => {
            plugin.eventBus.off("loaded-protyle-static", retry);
            const el2 = document.querySelector(".protyle:not(.fn__none) .protyle-title[data-node-id]");
            fill(el2?.getAttribute("data-node-id"));
        };
        plugin.eventBus.on("loaded-protyle-static", retry as any);
        this.dm?.add("seedRetry", () => plugin.eventBus?.off?.("loaded-protyle-static", retry as any));
    }

    /** 存在层建立（展开面板形态）：右键入路——直接展开+钉住指定块 */
    private spawnPanel(pinBlockID?: string) {
        this.establish();
        this.mountPanel(pinBlockID);
        this.refreshStatusBtn();
    }

    private mountPanel(pinBlockID?: string, posOverride?: { x: number; y: number }) {
        this.sv = mount(BlockEditorSvelte, {
            target: document.body,
            props: {
                dm: this.dm,
                // 钉住态重建（收起→展开）：pinBlockID 显式换钉优先，否则收起前的钉传回
                pinBlockID: pinBlockID ?? (this.pin.blockID || undefined),
                posOverride,
                onPinChange: (p: PinState) => { this.pin = p; },
                onDocName: (n: string) => { this.followDocName = n; },
                onCollapse: () => this.collapse(),
            },
        }) as BlockEditorExports;
    }

    /** 形态层收起：面板折叠回球——球回自己存档位（球位仅球拖动落盘，不受面板位影响，
     *  usertest3 □7，与 □6 面板独立记忆对偶）；钉住态/面板尺寸各自保留 */
    private collapse() {
        this.sv?.collapse(); // 只取 closeProtyle 摘实例副作用（已不报面板位）
        this.unmountPanel();
        this.mountBall(loadQEBallPos() ?? { x: 16, y: 16 });
        this.followDocSubscribe();
    }

    /** 形态层展开：面板开在球的当前位置（无球=localStorage 存档位） */
    private expandPanel(pinBlockID?: string) {
        const pos = this.ball?.pos() ?? loadQEBallPos();
        this.destroyBall();
        this.unsubDocID();
        this.mountPanel(pinBlockID, pos ?? undefined);
    }

    private mountBall(pos: { x: number; y: number }) {
        this.ball = new QEBall({
            ...pos,
            onClick: () => this.expandPanel(),
            tip: () => qeBallTip(
                this.pin.blockID ? { docName: this.pin.docName, title: this.pin.title } : null,
                this.followDocName,
            ),
            pinned: () => !!this.pin.blockID,
        });
    }

    /** 跟随态收缩球 tooltip 随切文档更新：sv 已卸载，数据源转 store 订阅自查
     *  （SQL 标题有索引延迟，tooltip 提示用途可容忍） */
    private followDocSubscribe() {
        if (this.pin.blockID) return;
        this.unsubDoc = currentBockEditorDocID.subscribe((id) => {
            if (!id || !this.ball) return;
            siyuan.getRowByID(id).then((row) => {
                if (row?.content && this.ball) {
                    this.followDocName = row.content;
                    this.ball.refresh();
                }
            }).catch(() => { });
        });
    }

    private unmountPanel() {
        if (this.sv) {
            unmount(this.sv);
            this.sv = null;
        }
    }

    private destroyBall() {
        this.ball?.destroy();
        this.ball = null;
    }

    private unsubDocID() {
        this.unsubDoc?.();
        this.unsubDoc = null;
    }

    // ---------------- 状态栏钮（存在层第三入口） ----------------

    private mountStatusBtn() {
        const el = document.createElement("div");
        el.className = "toolbar__item ariaLabel";
        el.id = "tomato-qe-status";
        el.innerHTML = `<svg><use xlink:href="#iconEdit"></use></svg>`;
        el.setAttribute("aria-label", tomatoI18n.块编辑器);
        el.addEventListener("click", () => this.toggleExistence());
        getTomatoPluginInstance().addStatusBar({ element: el, position: "left" });
        this.statusEl = el;
        this.refreshStatusBtn();
    }

    /** 亮灭态反映存在层在不在：亮=主题强调色（纯灰与相邻原生图标零区分度，阅读点钮 vision 评审同款结论） */
    private refreshStatusBtn() {
        const el = this.statusEl;
        if (!el) return;
        if (this.dm) {
            el.style.opacity = "";
            el.style.color = "var(--b3-theme-primary)";
        } else {
            el.style.opacity = "0.4";
            el.style.color = "";
        }
    }
}

export function isBigBlock(e: HTMLElement) {
    const t = getAttribute(e, "data-type")
    return t === BlockNodeEnum.NODE_SUPER_BLOCK
        || t === BlockNodeEnum.NODE_LIST
        || t === BlockNodeEnum.NODE_BLOCKQUOTE
        || t === BlockNodeEnum.NODE_TABLE
        || t === BlockNodeEnum.NODE_CODE_BLOCK
        || t === BlockNodeEnum.NODE_MATH_BLOCK
        || t === BlockNodeEnum.NODE_HTML_BLOCK
        || t === BlockNodeEnum.NODE_ATTRIBUTE_VIEW
        || t === BlockNodeEnum.NODE_BLOCK_QUERY_EMBED
}

export const blockEditor = new BlockEditor();
