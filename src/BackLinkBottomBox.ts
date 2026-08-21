import { Dialog, IProtyle, Protyle } from "siyuan";
import { EventType, events } from "./libs/Events";
import {
    ConTreeNode,
    disableBK, enableBK,
} from "./libs/bkUtils";
import { icon, isCardUI, isFloatUI, isProtyleVisible, isSearchUI, siyuan, } from "./libs/utils";
import { MarkKey, TEMP_CONTENT, TOMATO_BK_IGNORE } from "./libs/gconst";
import BackLinkBottom from "./BackLinkBottom.svelte";
import { DestroyManager } from "./libs/destroyer";
import BKConTree from "./BackLinkBottomConTree.svelte";
import { tomatoI18n } from "./tomatoI18n";
import { back_link_dailynote_off, back_link_default_off, back_link_goto_bottom_btn, backLinkBottomBoxCheckbox, fastNoteBoxDisableBK, back_link_show_floatUI, bk启用禁用文档的底部反链menu, back_link_refresh_off, bk_refresh_interval_sec, bk_visible_only } from "./libs/stores";
import { OpenSyFile2 } from "./libs/docUtils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { verifyKeyTomato } from "./libs/user";
import { winHotkey } from "./libs/winHotkey";
import { newID } from "stonev5-utils";
import { mount } from "svelte";

const BKMAKER_ADD = "BKMAKER_ADD";

export class BKMaker {
    public goDownID: string;
    public disabled: boolean;
    public shouldFreeze: boolean; // maker.shouldFreeze = !$autoRefreshChecked;
    public container: HTMLElement;
    public docID: string;
    public docName: string;
    public lockName: string;
    public protyle: IProtyle;
    public plugin: BaseTomatoPlugin;
    public refreshBK: () => Promise<void>;
    /** 追踪可见性变化，从后台切回前台时立即补刷一次（issue #78） */
    private lastVisible = true;
    public dm = new DestroyManager(false, "backlink");
    public id = newID();

    constructor(blBox: BackLinkBottomBox, docID: string) {
        this.docID = docID;
        // 与 back_link_refresh_off 默认 true 保持一致，初始即冻结，
        // 消除 svelte onMount async 块回填前的时间窗口（issue #78）。
        this.shouldFreeze = back_link_refresh_off.get();
        this.plugin = blBox.plugin;
        this.lockName = "BackLinkBottomBox-BKMakerLock" + this.docID;
        this.goDownID = "godown" + docID;
    }

    doTheWork(protyle: Protyle, attrs: AttrType) {
        navigator.locks.request(this.lockName + "B", { mode: "exclusive" }, (lock) => {
            if (!lock) return;

            if (this.disabled) {
                BKMaker.removeBkDiv(this.docID);
                return;
            }
            if (BKMaker.installed(this.docID)) return;

            this.noPadding(this.container);
            this.protyle = protyle.protyle;
            this.container = document.createElement("div");
            this.container.setAttribute(BKMAKER_ADD, BKMaker.getBkDivID(this.docID));
            this.container.id = this.id;
            this.insertBkPanel(this.container);
            this.container.style.paddingLeft = "0px"
            this.container.style.paddingRight = "0px"

            const sv = mount(BackLinkBottom, {
                target: this.container,
                props: {
                    maker: this,
                    protyle,
                    attrs,
                    dm: this.dm,
                }
            });
            const handler = setInterval(() => {
                if (!this.running()) {
                    this.dm.destroyBy("from maker")
                    clearInterval(handler);
                } else {
                    // issue #78: 后台页签不刷新反链，避免多个页签并行轮询导致 CPU 占用过高发烫
                    if (bk_visible_only.get()) {
                        const visible = isProtyleVisible(this.protyle);
                        if (!visible) {
                            this.lastVisible = false;
                            return;
                        }
                        // 从后台切回前台，立即补刷一次（补偿后台期间未刷新的数据）
                        if (!this.lastVisible) {
                            this.lastVisible = true;
                            this.refreshBacklinks();
                            return;
                        }
                    }
                    this.refreshBacklinks();
                }
            }, Math.max(2, Number(bk_refresh_interval_sec.get()) || 15) * 1000);
            this.dm.add("maker del sv", () => sv.destroy())
        })
    }

    static getBkDivID(docID: string) {
        return "tomatoBKDiv" + docID;
    }

    running() {
        return document.getElementById(this.id) != null
    }

    static installed(docID: string) {
        return document.querySelector(`div[${BKMAKER_ADD}="${BKMaker.getBkDivID(docID)}"]`) != null
    }

    static removeBkDiv(docID: string) {
        document.querySelectorAll(`div[${BKMAKER_ADD}="${BKMaker.getBkDivID(docID)}"]`).forEach(e => e.parentElement.removeChild(e))
    }

    async refreshBacklinks() {
        return navigator.locks.request(this.lockName + "B", { ifAvailable: true }, async (lock) => {
            if (this.refreshBK && lock && !this.shouldFreeze) {
                return this.refreshBK();
            }
        });
    }

    private insertBkPanel(div: HTMLElement) {
        if (!this.disabled) {
            this.noPadding(div);
            const item: HTMLElement = this.protyle.wysiwyg.element;
            item.insertAdjacentElement("afterend", div);
        }
    }

    private noPadding(div: HTMLElement) {
        if (div && this.protyle?.wysiwyg?.element?.style) {
            this.protyle.wysiwyg.element.style.paddingBottom = "0px";
            div.style.paddingLeft = this.protyle.wysiwyg.element.style.paddingLeft;
            div.style.paddingRight = this.protyle.wysiwyg.element.style.paddingRight;
        }
    }
}

export const BK启用禁用文档的底部反链 = winHotkey("shift+alt+9", "BK启用禁用文档的底部反链 2025-5-12 14:05:47", "📴🔗", () => tomatoI18n.enableBK启用禁用文档的底部反链,)

class BackLinkBottomBox {
    public plugin: BaseTomatoPlugin;
    public settingCfg: TomatoSettings;

    async onload(plugin: BaseTomatoPlugin) {
        if (!backLinkBottomBoxCheckbox.get()) return;

        this.plugin = plugin;
        this.settingCfg = plugin.settingCfg;

        const editorCallback = async (protyle: IProtyle) => {
            const docID = protyle?.block?.rootID;
            if (docID) {
                if (await isBkOff(docID)) {
                    await enableBK(docID);
                } else {
                    await disableBK(docID);
                }
            }
        };
        this.plugin.addCommand({
            langKey: BK启用禁用文档的底部反链.langKey,
            langText: BK启用禁用文档的底部反链.langText(),
            hotkey: BK启用禁用文档的底部反链.m,
            editorCallback,
        });

        if (bk启用禁用文档的底部反链menu.get()) {
            this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
                const menu = detail.menu;
                menu.addItem({
                    label: BK启用禁用文档的底部反链.langText(),
                    iconHTML: BK启用禁用文档的底部反链.icon,
                    click: () => editorCallback(detail.protyle),
                });
            });
        }

        events.addListener("BackLinkBottomBox", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.switch_protyle
                || eventType == EventType.click_editorcontent
            ) {
                navigator.locks.request("BackLinkBottomBoxLock", { mode: "exclusive" }, async (lock) => {
                    if (lock) {
                        const protyle = detail.protyle as IProtyle;
                        if (!protyle?.element) return;
                        if (protyle.element.getAttribute(TOMATO_BK_IGNORE)) return;

                        const docID = protyle.block.rootID;
                        if (!docID) return;

                        if (events.isMobile) {
                            [...document.querySelectorAll(`[${BKMAKER_ADD}]`)]
                                .forEach(d => d.parentElement?.removeChild(d));
                        }

                        const attrs = await siyuan.getBlockAttrs(docID);
                        const disabled = await isBkOff(docID, attrs);
                        if (disabled) {
                            BKMaker.removeBkDiv(docID);
                            protyle.wysiwyg.element.style.paddingBottom = "200px";
                            return;
                        }

                        if (BKMaker.installed(docID)) return;
                        if (!back_link_show_floatUI.get() && isFloatUI(detail)) return;
                        if (isSearchUI(detail)) return;
                        if (isCardUI(detail)) return;
                        if (isDocFlow(detail)) return;
                        if (await skipByAttrs(docID, attrs)) return;

                        // create maker
                        let maker = new BKMaker(this, docID);
                        maker.disabled = false;

                        // update current doc
                        maker.docName = protyle.title?.editElement?.textContent;
                        maker.doTheWork(detail, attrs);
                        if (back_link_goto_bottom_btn.get() && await verifyKeyTomato() && !events.isMobile) {
                            this.addIcon2Title(maker);
                        }
                    }
                });
            }
        });
    }
    private addIcon2Title(maker: BKMaker) {
        if (!maker) return;
        if (document.getElementById(maker.goDownID)) return;
        const ICONS_SIZE = 13;
        const titleEle = document.querySelector(
            `div.protyle-wysiwyg--attr[data-node-id="${maker.docID}"]`,
        );
        if (!titleEle) return;
        const button = titleEle.appendChild(document.createElement("button"));
        button.title = tomatoI18n.跳到底部反链;
        button.id = maker.goDownID;
        button.classList.add("gap");
        button.classList.add("b3-button");
        button.classList.add("b3-button--text");
        button.innerHTML = icon("Down", ICONS_SIZE);
        button.onclick = async () => {
            const id = await siyuan.getDocLastID(maker.docID);
            await OpenSyFile2(this.plugin, id);
        };
    }
}


async function skipByAttrs(docID: string, attrs?: AttrType) {
    if (attrs == null) attrs = await siyuan.getBlockAttrs(docID);
    const markKey = attrs[MarkKey] ?? "";
    if (markKey.includes(TEMP_CONTENT)) return true;

    for (const [k] of Object.entries(attrs)) {
        if (back_link_dailynote_off.get()) {
            if (k.startsWith("custom-dailynote-")) {
                return true;
            }
        }
        if (k.startsWith("custom-dailycard-")) {
            return true;
        }
        if (k.startsWith("custom-book-writing")) {
            return true;
        }
        if (fastNoteBoxDisableBK.get()) {
            if (k === "custom-fastnote") {
                return true;
            }
        }
    }

    return false;
}

function isDocFlow(detail: Protyle) {
    return detail?.protyle?.element?.classList?.contains("docs-flow__protyle");
}

async function isBkOff(nextDocID: string, attrs?: AttrType) {
    if (attrs == null) attrs = await siyuan.getBlockAttrs(nextDocID);
    const v = attrs["custom-off-tomatobacklink"];
    if (back_link_default_off.get()) {
        return !v || v === "1";
    } else {
        return v === "1";
    }
}

export async function showBkConTree(trees: Map<string, ConTreeNode>) {
    const dm = new DestroyManager();
    const id = newID();
    const dialog = new Dialog({
        title: tomatoI18n.hierarchical层级概念深林,
        content: `<div id="${id}"></div>`,
        width: events.isMobile ? "90vw" : "700px",
        destroyCallback: () => {
            dm.destroyBy("1")
        },
    });
    const d = mount(BKConTree, {
        target: dialog.element.querySelector("#" + id),
        props: {
            trees,
            dm,
        }
    });
    dm.add("1", () => { dialog.destroy() })
    dm.add("2", () => { d.destroy() })
}

export const backLinkBottomBox = new BackLinkBottomBox();
