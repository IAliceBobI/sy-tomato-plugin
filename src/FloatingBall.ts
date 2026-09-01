import { pushReplaceBy } from "stonev5-utils";
import FloatingBallDocBtn from "./FloatingBallDocBtn.svelte"
import FloatingBallKeyboardBtn from "./FloatingBallKeyboardBtn.svelte"
import FloatingBallProtyleDialog from "./FloatingBallProtyleDialog.svelte"
import { DestroyManager } from "./libs/destroyer";
import { events } from "./libs/Events";
import { FloatingBallDocType_float, FloatingBallDocType_tab, FloatingBallNotVIPLimit } from "./libs/gconst";
import { shortcut2string } from "./libs/keyboard";
import { floatingballDocList, floatingballDocMenu, floatingballDocTabMenu, floatingballEnable, floatingballKeyboardList } from "./libs/stores";
import { lastVerifyResult } from "./libs/user";
import { getTomatoPluginInstance } from "./libs/utils";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
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

export const FloatingBall添加文档 = winHotkey("shift+alt+ctrl+f5", "绑定文档到悬浮按钮", "iconPin", () => tomatoI18n.绑定文档到悬浮按钮, false, floatingballDocMenu)
export const FloatingBallTab添加文档 = winHotkey("shift+alt+h", "FloatingBallTab添加文档", "iconLayout", () => tomatoI18n.绑定文档到Tab, false, floatingballDocTabMenu)

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
                langKey: FloatingBallTab添加文档.langKey,
                langText: FloatingBallTab添加文档.langText(),
                hotkey: FloatingBallTab添加文档.m,
                editorCallback: (protyle) => {
                    const { name } = events.getInfo(protyle)
                    linkDoc2floatBall(name, "", FloatingBallDocType_tab.id);
                },
            });
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
                addIfVisible(menu, FloatingBall添加文档.langKey, {
                    icon: FloatingBall添加文档.icon,
                    accelerator: FloatingBall添加文档.m,
                    label: FloatingBall添加文档.langText(),
                    click: () => {
                        const { name } = events.getInfo(detail.protyle)
                        linkDoc2floatBall(name, "", FloatingBallDocType_float.id);
                    },
                }, FloatingBall添加文档.menu());
                addIfVisible(menu, FloatingBallTab添加文档.langKey, {
                    icon: FloatingBallTab添加文档.icon,
                    accelerator: FloatingBallTab添加文档.m,
                    label: FloatingBallTab添加文档.langText(),
                    click: () => {
                        const { name } = events.getInfo(detail.protyle)
                        linkDoc2floatBall(name, "", FloatingBallDocType_tab.id);
                    },
                }, FloatingBallTab添加文档.menu());
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

// 悬浮文档 dialog
export function getFloatingBallProtyleDialog(item: FloatingDocItem) {
    const address = `protyle#2#${item.docID}`
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
