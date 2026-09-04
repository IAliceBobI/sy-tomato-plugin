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

export function loadFloatingBall() {
    debugLog("fball", `loadFloatingBall enter enable=${floatingballEnable.get()} ballList=${JSON.stringify(floatingballBallList.get()?.length)} doc=${(floatingballDocList.get() ?? []).length} kb=${(floatingballKeyboardList.get() ?? []).length}`, "fball");
    migrateLegacyFloatingBall();
    // □8 存量迁移（独立于上面那次：那边 ballList 非空即早退）：官方快捷键球 label
    // 原始键 → action.km。只读 keymap config（boot 早期就绪），不碰 languages。
    if (migrateKmLabelBalls(floatingballBallList.get() ?? [], (window as any).siyuan?.config?.keymap)) {
        floatingballBallList.write();
    }
    if (floatingballEnable.get()) {
        {
            getTomatoPluginInstance().addCommand({
                langKey: FloatingBallTab添加文档.langKey,
                langText: FloatingBallTab添加文档.langText(),
                hotkey: FloatingBallTab添加文档.m,
                editorCallback: (protyle) => {
                    const { name, docID } = events.getInfo(protyle)
                    linkDoc2floatBall(name, "", FloatingBallDocType_tab.id, docID);
                },
            });
            getTomatoPluginInstance().addCommand({
                langKey: FloatingBall添加文档.langKey,
                langText: FloatingBall添加文档.langText(),
                hotkey: FloatingBall添加文档.m,
                editorCallback: (protyle) => {
                    const { name, docID } = events.getInfo(protyle)
                    linkDoc2floatBall(name, "", FloatingBallDocType_float.id, docID);
                },
            });
            getTomatoPluginInstance().eventBus.on("open-menu-content", ({ detail }) => {
                const menu = detail.menu;
                addIfVisible(menu, FloatingBall添加文档.langKey, {
                    icon: FloatingBall添加文档.icon,
                    accelerator: FloatingBall添加文档.m,
                    label: FloatingBall添加文档.langText(),
                    click: () => {
                        const { name, docID } = events.getInfo(detail.protyle)
                        linkDoc2floatBall(name, "", FloatingBallDocType_float.id, docID);
                    },
                }, FloatingBall添加文档.menu());
                addIfVisible(menu, FloatingBallTab添加文档.langKey, {
                    icon: FloatingBallTab添加文档.icon,
                    accelerator: FloatingBallTab添加文档.m,
                    label: FloatingBallTab添加文档.langText(),
                    click: () => {
                        const { name, docID } = events.getInfo(detail.protyle)
                        linkDoc2floatBall(name, "", FloatingBallDocType_tab.id, docID);
                    },
                }, FloatingBallTab添加文档.menu());
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
export function getFloatingBallProtyleDialog(ball: BallItem) {
    const address = `protyle#2#${ball.action?.docID}`
    const dm = globalThis[FloatingBall.key(address)] as DestroyManager;
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
            if (item.action?.openOnCreate && !events.isMobile && item.type === "doc") {
                actionRegistry.doc.execute(item, {});
            }
            return sv;
        });
        return dm
    }
}
