import { pushReplaceBy } from "stonev5-utils";
import FloatingBallDocBtn from "./FloatingBallDocBtn.svelte"
import FloatingBallKeyboardBtn from "./FloatingBallKeyboardBtn.svelte"
import FloatingBallProtyle from "./FloatingBallProtyle.svelte"
import { DestroyManager } from "./libs/destroyer";
import { events } from "./libs/Events";
import { FloatingBallDocType_float, FloatingBallNotVIPLimit } from "./libs/gconst";
import { shortcut2string } from "./libs/keyboard";
import { floatingballDocList, floatingballDocMenu, floatingballEnable, floatingballKeyboardList } from "./libs/stores";
import { lastVerifyResult } from "./libs/user";
import { getTomatoPluginInstance } from "./libs/utils";
import { winHotkey } from "./libs/winHotkey";
import { tomatoI18n } from "./tomatoI18n";
import { mount } from "svelte";

export class FloatingBall {
    static readonly DMKey = "TomatoFloatingBtnDMKey";
    private dm: DestroyManager;
    private target: HTMLElement;
    private sv: any;
    private address: string;

    static key(addr: string) {
        return FloatingBall.DMKey + "_" + addr;
    }

    private get key() {
        return FloatingBall.key(this.address);
    }

    static newProgFloatingDm(addr: string) {
        let dm = globalThis[FloatingBall.key(addr)] as DestroyManager
        dm?.destroyBy();
        dm = new DestroyManager()
        globalThis[FloatingBall.key(addr)] = dm;
        return dm;
    }

    constructor(address: string, dm: DestroyManager, svFactory: (target: HTMLElement) => any) {
        this.address = address;
        this.dm = dm
        this.target = document.body.appendChild(document.createElement("div"));
        this.target.setAttribute("floating-ball-key", this.key);
        this.sv = svFactory(this.target);
        this.dm.add("global", () => delete globalThis[FloatingBall.key(address)]);
        this.dm.add("sv", () => this.sv.destroy());
        this.dm.add("div", () => this.target.parentElement?.removeChild(this.target));
        this.dm.setData("e", this.target);
    }
}

export const FloatingBall添加文档 = winHotkey("shift+alt+h", "绑定文档到悬浮按钮 2025-06-23 11:22:43", "🔗", () => tomatoI18n.绑定文档到悬浮按钮, false, floatingballDocMenu)

export function linkDoc2floatBall(addDoc_docName: string, addDoc_docIcon: string, addDoc_useDialog: number) {
    if (addDoc_docName) {
        let icon = addDoc_docIcon;
        if (!icon) {
            icon = addDoc_docName;
        }
        pushReplaceBy(
            floatingballDocList.get(),
            {
                docName: addDoc_docName,
                docIcon: icon,
                openDocType: addDoc_useDialog,
                enable: true,
                enableMobile: true,
            },
            (item) => item.docName + "#" + item.openDocType,
        );
        floatingballDocList.write();
        getFloatingBallDocBtn({
            docName: addDoc_docName,
            docIcon: icon,
            openDocType: addDoc_useDialog,
        })
    }
}

export function loadFloatingBall() {
    if (floatingballEnable.get()) {
        {
            getTomatoPluginInstance().addCommand({
                langKey: FloatingBall添加文档.langKey,
                langText: FloatingBall添加文档.langText(),
                hotkey: FloatingBall添加文档.m,
                editorCallback: (protyle) => {
                    const { name } = events.getInfo(protyle)
                    linkDoc2floatBall(name, "", FloatingBallDocType_float.id);
                },
            });
            getTomatoPluginInstance().eventBus.on("open-menu-content", ({ detail }) => {
                const menu = detail.menu;
                if (FloatingBall添加文档.menu()) {
                    menu.addItem({
                        iconHTML: FloatingBall添加文档.icon,
                        accelerator: FloatingBall添加文档.m,
                        label: FloatingBall添加文档.langText(),
                        click: () => {
                            const { name } = events.getInfo(detail.protyle)
                            linkDoc2floatBall(name, "", FloatingBallDocType_float.id);
                        },
                    });
                }
            });
        }
        {
            let arr = (floatingballDocList.get() ?? []).filter(item => {
                if (events.isMobile) {
                    return item.enableMobile
                }
                return item.enable
            });
            if (!lastVerifyResult()) {
                arr = arr.slice(0, FloatingBallNotVIPLimit);
            }
            for (const item of arr) {
                getFloatingBallDocBtn(item);
            }
        }
        {
            let arr = (floatingballKeyboardList.get() ?? []).filter(item => {
                if (events.isMobile) {
                    return item.enableMobile
                }
                return item.enable
            });
            if (!lastVerifyResult()) {
                arr = arr.slice(0, FloatingBallNotVIPLimit);
            }
            for (const item of arr) {
                getFloatingBallKeyboardBtn(item);
            }
        }
    }
}

// 悬浮文档
export function getFloatingBallProtyle(item: FloatingDocItem) {
    const address = `protyle#${item.docID}`
    const dm = globalThis[FloatingBall.key(address)] as DestroyManager;
    if (dm) {
        return dm;
    } else {
        const dm = FloatingBall.newProgFloatingDm(address);
        new FloatingBall(address, dm, (target) => {
            return mount(FloatingBallProtyle, {
                target,
                props: {
                    dm,
                    key: FloatingBall.key(address),
                    item,
                }
            });
        });
        return dm;
    }
}

// 悬浮文档的按钮
export function getFloatingBallDocBtn(item: FloatingDocItem): DestroyManager {
    if (!item) return;
    const address = `doc#${item.docName}#${item.openDocType}`
    const dm = globalThis[FloatingBall.key(address)] as DestroyManager
    if (dm) {
        return dm
    } else {
        const dm = FloatingBall.newProgFloatingDm(address);
        new FloatingBall(address, dm, (target) => {
            const sv = mount(FloatingBallDocBtn, {
                target,
                props: {
                    dm,
                    key: FloatingBall.key(address),
                    item,
                }
            });
            if (item.openOnCreate && !events.isMobile) sv.toggleOpen(null);
            return sv;
        });
        return dm
    }
}

// 悬浮快捷键的按钮
export function getFloatingBallKeyboardBtn(shortcut: FloatingKeyboardItem): DestroyManager {
    const address = `keyboard#${shortcut2string(shortcut)}`
    const dm = globalThis[FloatingBall.key(address)] as DestroyManager
    if (dm) {
        return dm
    } else {
        const dm = FloatingBall.newProgFloatingDm(address);
        new FloatingBall(address, dm, (target) => {
            return mount(FloatingBallKeyboardBtn, {
                target,
                props: {
                    dm,
                    key: FloatingBall.key(address),
                    shortcut,
                }
            });
        });
        return dm
    }
}
