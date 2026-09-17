import { newID } from "stonev5-utils";
import { mount, unmount } from "svelte";
import FloatingBallSvelte from "./FloatingBall.svelte"
import FloatingBallProtyleDialog from "./FloatingBallProtyleDialog.svelte"
import { DestroyManager } from "./libs/destroyer";
import { events } from "./libs/Events";
import { FloatingBallDocType_float, FloatingBallDocType_tab, FloatingBallNotVIPLimit } from "./libs/gconst";
import { shortcut2string } from "./libs/keyboard";
import {
    floatingballBallList,
    floatingballDocList,
    floatingballDocMenu,
    floatingballDocTabMenu,
    floatingballEnable,
    floatingballKeyboardList,
} from "./libs/stores";
import { lastVerifyResult } from "./libs/user";
import { getTomatoPluginConfig, getTomatoPluginInstance } from "./libs/utils";
import { winHotkey } from "./libs/winHotkey";
import { gatedAddCommand } from "./libs/cmdGate";
import { addIfVisible } from "./libs/menuManager";
import { tomatoI18n } from "./tomatoI18n";
import { actionRegistry } from "./actions";
import { migrateLegacyBalls } from "./libs/ballMigration";
import { migrateKmLabelBalls } from "./libs/ballKeymap";
import { cascadeOffset } from "./libs/ballGeometry";
import { debugLog } from "./libs/logUtils";

export class FloatingBall {
    static readonly DMKey = "TomatoFloatingBtnDMKey";
    private dm: DestroyManager;
    private target: HTMLElement;
    private sv: any;

    static key(addr: string) {
        return FloatingBall.DMKey + "_" + addr;
    }

    private get key() {
        return FloatingBall.key(this.address);
    }

    private address: string;

    static newProgFloatingDm(addr: string) {
        let dm = globalThis[FloatingBall.key(addr)] as DestroyManager
        dm?.destroyBy();
        dm = new DestroyManager()
        globalThis[FloatingBall.key(addr)] = dm;
        return dm;
    }

    // teardown 可覆盖组件卸载方式：新组件（FloatingBall.svelte）一律 unmount(app) 正轨；
    // 保留件 FloatingBallProtyleDialog 沿用其「树不卸载」现状（AGENTS.md □4 拍板），传 () => {}
    constructor(address: string, dm: DestroyManager, svFactory: (target: HTMLElement) => any, teardown?: (sv: any) => void) {
        this.address = address;
        this.dm = dm
        this.target = document.body.appendChild(document.createElement("div"));
        this.target.setAttribute("floating-ball-key", this.key);
        this.sv = svFactory(this.target);
        this.dm.add("global", () => delete globalThis[FloatingBall.key(address)]);
        this.dm.add("sv", () => (teardown ?? ((sv) => unmount(sv)))(this.sv));
        this.dm.add("div", () => this.target.parentElement?.removeChild(this.target));
        this.dm.setData("e", this.target);
    }
}

export const FloatingBall添加文档 = winHotkey("shift+alt+ctrl+f5", "绑定文档到悬浮按钮", "iconPin", () => tomatoI18n.绑定文档到悬浮按钮, false, floatingballDocMenu)
export const FloatingBallTab添加文档 = winHotkey("shift+alt+h", "FloatingBallTab添加文档", "iconLayout", () => tomatoI18n.绑定文档到Tab, false, floatingballDocTabMenu)
// fbfeat □1：文档窗开关（与 ⌘⇧F7「显示/隐藏悬浮球」对偶——F7 切球本体/F8 切文档窗；
// 2026-09-15 现扫 keymap 255 键+四插件声明 ⌘⇧F8 空闲）
export const FloatingBall显示或隐藏悬浮文档 = winHotkey("⌘⇧F8", "toggleFloatingDoc", "iconEye", () => tomatoI18n.显示或隐藏悬浮文档)

export function linkDoc2floatBall(addDoc_docName: string, addDoc_docIcon: string, addDoc_useDialog: number, docID?: string) {
    if (!addDoc_docName) return;
    const icon = addDoc_docIcon || addDoc_docName;
    const list = floatingballBallList.get() ?? [];
    // 同文档同打开方式=重绑：原位更新保 id（球身份/位置不动），docID 治重名开错/改名断链
    const idx = list.findIndex((b) => b.type === "doc" && b.action?.docName === addDoc_docName && b.action?.openDocType === addDoc_useDialog);
    let ball: BallItem;
    if (idx >= 0) {
        ball = list[idx];
        ball.action.docID = docID || ball.action.docID || "";
        ball.action.docIcon = icon;
        ball.icon = icon;
    } else {
        const cascade = cascadeOffset(list.filter((b) => b.type === "doc").length);
        ball = {
            id: newID(),
            type: "doc",
            action: {
                docName: addDoc_docName,
                docID: docID ?? "",
                docIcon: icon,
                openDocType: addDoc_useDialog,
                openOnCreate: false,
            },
            icon,
            anchor: 8,
            offsetX: cascade.offsetX,
            offsetY: cascade.offsetY,
            enable: true,
            enableMobile: true,
        };
        list.push(ball);
    }
    floatingballBallList.set(list);
    floatingballBallList.write();
    getFloatingBall(ball);
}

// 旧数据迁移（一次性）：旧 doc/keyboard 两列表 + config 顶层像素位置散键 → 统一 BallItem。
// 新列表非空=已迁移；迁移后旧两列表清空、TomatoFloatingBtnDMKey_* 散键全删。
// 旧位置散键带 _<isMobile>_ 平台段，只迁当前平台（一次性换算，他平台位置弃）。
export function migrateLegacyFloatingBall() {
    const docList = floatingballDocList.get() ?? [];
    const kbList = floatingballKeyboardList.get() ?? [];
    if ((floatingballBallList.get()?.length ?? 0) > 0) return;
    if (docList.length === 0 && kbList.length === 0) return;
    const cfg = getTomatoPluginConfig();
    debugLog("fball", `migrate start doc=${docList.length} kb=${kbList.length} cfgOk=${cfg != null}`, "fball");
    const mobile = events.isMobile;
    const posOf = (addr: string) => ({
        x: cfg[`${FloatingBall.DMKey}_${addr}_${mobile}_offsetX`] as string | undefined,
        y: cfg[`${FloatingBall.DMKey}_${addr}_${mobile}_offsetY`] as string | undefined,
    });
    const balls = migrateLegacyBalls(
        docList, kbList, posOf,
        window.innerWidth, window.innerHeight,
        40, // 几何换算基准直径；实际渲染尺寸由 CSS 决定，误差由 clamp 兜底
        () => newID(),
        (it) => `keyboard#${shortcut2string(it)}`,
    );
    floatingballBallList.set(balls);
    floatingballDocList.set([]);
    floatingballKeyboardList.set([]);
    for (const k of Object.keys(cfg)) {
        if (k.startsWith(FloatingBall.DMKey + "_")) delete cfg[k];
    }
    floatingballBallList.write(); // 整文件落盘（新列表+清空的两旧列表+删净的散键一并持久化）
    debugLog("fball", `migrate done balls=${JSON.stringify(balls.map(b => ({ t: b.type, a: b.anchor, ox: b.offsetX, oy: b.offsetY })))}`, "fball");
}

// 超限球 id 集（期6 显性灰档）：非激活时按类型分组（doc/其他）各取前 FloatingBallNotVIPLimit
// 之外的球（计数口径=当前平台启用的球、序=数组序，对齐旧 slice 语义）。激活态恒空集。
// loadFloatingBall 明面跳过它们，设置列表全量显示但置灰（ConfCapture 灰档 UI）。
export function ballOverLimit(): Set<string> {
    const over = new Set<string>();
    if (lastVerifyResult()) return over;
    const list = (floatingballBallList.get() ?? []).filter(item => {
        return events.isMobile ? item.enableMobile !== false : item.enable !== false;
    });
    let docs = 0, others = 0;
    for (const b of list) {
        if (b.type === "doc") {
            if (docs >= FloatingBallNotVIPLimit) over.add(b.id);
            docs++;
        } else {
            if (others >= FloatingBallNotVIPLimit) over.add(b.id);
            others++;
        }
    }
    return over;
}

// fballfeedback □4b：悬浮球域全量收场（onload 清孤儿+onunload 正式摘除双用）——历史泄漏
// 根因=index.ts onunload 摘了 20 个域唯独没有悬浮球域，插件重载卸载期球 DOM（body 直挂
// 内核不摘）+globalThis DM 键全量残留：列表球靠 onload newProgFloatingDm 同键 destroyBy
// 自愈，列表外球（删除漏销/历史遗留）无人再触达=「幽灵球」永生——页面上活着但列表没有，
// 删除入口以列表为准对它必然无效，setPetalEnabled 卸载不清这层，只有重启思源整页刷新才
// 消（陆杰 09-16 二分实验实锤「列表没有+重启才消」）。onload 时机=清孤儿（本代未建键，
// 扫到的必是遗留）；onunload 时机=正式收场（destroyBy 走 dm 清场链：sv unmount+div 移
// 除+键删除；div 已移除时 parentElement? 静默安全）。
export function sweepFloatingBalls() {
    let keyN = 0;
    for (const k of Object.keys(globalThis)) {
        if (k.startsWith(FloatingBall.DMKey + "_")) {
            (globalThis[k] as DestroyManager)?.destroyBy?.();
            delete globalThis[k];
            keyN++;
        }
    }
    // destroyBy 链已各自摘 div，此处兜底扫残余（链中途静默失败的老代遗留）
    const doms = document.querySelectorAll("[floating-ball-key]");
    const domN = doms.length;
    doms.forEach(e => e.remove());
    if (domN || keyN) debugLog("fball", `sweep balls keys=${keyN} dom=${domN}`, "fball");
}

export function loadFloatingBall() {
    debugLog("fball", `loadFloatingBall enter enable=${floatingballEnable.get()} ballList=${JSON.stringify(floatingballBallList.get()?.length)} doc=${(floatingballDocList.get() ?? []).length} kb=${(floatingballKeyboardList.get() ?? []).length}`, "fball");
    sweepFloatingBalls();
    migrateLegacyFloatingBall();
    // □8 存量迁移（独立于上面那次：那边 ballList 非空即早退）：官方快捷键球 label
    // 原始键 → action.km。只读 keymap config（boot 早期就绪），不碰 languages。
    if (migrateKmLabelBalls(floatingballBallList.get() ?? [], (window as any).siyuan?.config?.keymap)) {
        floatingballBallList.write();
    }
    if (floatingballEnable.get()) {
        {
            gatedAddCommand(getTomatoPluginInstance(), FloatingBall显示或隐藏悬浮文档.langKey, {
                langText: FloatingBall显示或隐藏悬浮文档.langText(),
                hotkey: FloatingBall显示或隐藏悬浮文档.m,
                callback: () => {
                    // 语义组装在 docAction.toggle（最近球选择+float 显式关）；经注册表
                    // 调用防 FloatingBall↔docAction 静态 import 成环（CJS 打包顺序敏感）
                    void actionRegistry.doc.toggle?.();
                },
            });
            gatedAddCommand(getTomatoPluginInstance(), FloatingBallTab添加文档.langKey, {
                langText: FloatingBallTab添加文档.langText(),
                hotkey: FloatingBallTab添加文档.m,
                editorCallback: (protyle) => {
                    const { name, docID } = events.getInfo(protyle)
                    linkDoc2floatBall(name, "", FloatingBallDocType_tab.id, docID);
                },
            });
            gatedAddCommand(getTomatoPluginInstance(), FloatingBall添加文档.langKey, {
                langText: FloatingBall添加文档.langText(),
                hotkey: FloatingBall添加文档.m,
                editorCallback: (protyle) => {
                    const { name, docID } = events.getInfo(protyle)
                    linkDoc2floatBall(name, "", FloatingBallDocType_float.id, docID);
                },
            });
            // 两项菜单注入的公共体：open-menu-content（内容区右键）与 click-blockicon
            // （块柄右键）双通道同款——块柄走内核 gutter.renderMenu 只 emit click-blockicon
            // 不 emit open-menu-content（3.8.3 gutter/index.ts:1531 实证），单挂内容区通道
            // 则块柄右键「插件」子菜单恒缺席（09-16 陆杰反馈；BlockEditor blockIconHandler
            // 双通道先例）。两通道互斥不双份；卸载期监听摘除依赖内核 uninstall 整树摘（本域全线无 off）
            const addBindDocMenuItems = (menu: any, protyle: any) => {
                addIfVisible(menu, FloatingBall添加文档.langKey, {
                    icon: FloatingBall添加文档.icon,
                    accelerator: FloatingBall添加文档.m,
                    label: FloatingBall添加文档.langText(),
                    click: () => {
                        const { name, docID } = events.getInfo(protyle)
                        linkDoc2floatBall(name, "", FloatingBallDocType_float.id, docID);
                    },
                }, FloatingBall添加文档.menu());
                addIfVisible(menu, FloatingBallTab添加文档.langKey, {
                    icon: FloatingBallTab添加文档.icon,
                    accelerator: FloatingBallTab添加文档.m,
                    label: FloatingBallTab添加文档.langText(),
                    click: () => {
                        const { name, docID } = events.getInfo(protyle)
                        linkDoc2floatBall(name, "", FloatingBallDocType_tab.id, docID);
                    },
                }, FloatingBallTab添加文档.menu());
            };
            getTomatoPluginInstance().eventBus.on("open-menu-content", ({ detail }) => {
                addBindDocMenuItems(detail.menu, detail.protyle);
            });
            getTomatoPluginInstance().eventBus.on("click-blockicon", ({ detail }) => {
                addBindDocMenuItems(detail.menu, detail.protyle);
            });
        }
        {
            const over = ballOverLimit();
            // 期6 显性灰档：超限球明面不挂载，但完整可见于设置列表（置灰+VIP 徽标+解锁）
            const arr = (floatingballBallList.get() ?? []).filter(item => {
                if (events.isMobile) {
                    return item.enableMobile
                }
                return item.enable
            }).filter(item => actionRegistry[item.type]).filter(item => !over.has(item.id));
            debugLog("fball", `load balls list=${JSON.stringify(arr.map(b => b.type + "#" + b.id?.slice(-4)))} overLimit=${over.size}`, "fball");
            for (const item of arr) {
                getFloatingBall(item);
            }
        }
    }
}

// 悬浮文档 dialog（float 打开方式实现件；dm 键 protyle#2#<docID> 去重）
/** float 悬浮窗开态只读探测（toggle 决策用）：活着返回其 dm，不在返回 undefined——
 *  不像 getFloatingBallProtyleDialog 会顺手建窗 */
export function getFloatingBallProtyleDialogDM(ball: BallItem): DestroyManager | undefined {
    return globalThis[FloatingBall.key(`protyle#2#${ball.action?.docID}`)] as DestroyManager | undefined;
}
export function getFloatingBallProtyleDialog(ball: BallItem, docID?: string) {
    // dm 键恒绑 item.docID（稳定性优先：$$dailynote 每天新 id 不进键，跨天 toggle
    // 探测不漂移）；docID 参数=本次渲染用的解析值（$$dailynote 现建日记等场景）
    const address = `protyle#2#${ball.action?.docID}`;
    const dm = getFloatingBallProtyleDialogDM(ball);
    if (dm) {
        return dm;
    } else {
        const dm = FloatingBall.newProgFloatingDm(address);
        new FloatingBall(address, dm, (target) => {
            return mount(FloatingBallProtyleDialog, {
                target,
                props: {
                    dm,
                    key: FloatingBall.key(address),
                    ball,
                    docID: docID || ball.action?.docID,
                }
            });
        }, () => { /* 保留件沿用「树不卸载」现状 */ });
        return dm;
    }
}

// 悬浮球（合一组件；dm 键 ball#<id>）
export function getFloatingBall(item: BallItem): DestroyManager {
    if (!item) return;
    const address = `ball#${item.id}`
    const dm = globalThis[FloatingBall.key(address)] as DestroyManager
    if (dm) {
        return dm
    } else {
        const dm = FloatingBall.newProgFloatingDm(address);
        new FloatingBall(address, dm, (target) => {
            const sv = mount(FloatingBallSvelte, {
                target,
                props: {
                    dm,
                    item,
                }
            });
            return sv;
        });
        // fballfeedback □7（bear 反馈「解绑断不了」根因）：openOnCreate 的 execute 挪出
        // 构造回调并延迟一拍——execute float 分支会 getFloatingBall(ball).destroyBy() 反杀
        // 球本体，原先在 svFactory 内同步跑时 FloatingBall 构造未返回、dm.add(global/sv/div)
        // 三段回调尚未注册：destroyBy 打在空 dm 上（destroied=true 且啥都没销毁），随后塞进
        // 的回调永不执行=球 div 永久残留+dm 死锁，此后解绑/删除/sweep 的 destroyBy 全无效
        // （窗开着时 reload 遗留 petal openOnCreate=true → 插件加载即自动开窗 → 必中）
        if (item.action?.openOnCreate && !events.isMobile && item.type === "doc") {
            setTimeout(() => {
                if (!dm.destroyed) actionRegistry.doc.execute(item, {});
            }, 0);
        }
        return dm
    }
}
