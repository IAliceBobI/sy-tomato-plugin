import { IProtyle, Protyle } from "siyuan";
import { EventType, events } from "./libs/Events";
import {
    disableBK, enableBK,
} from "./libs/bkUtils";
import { icon, isCardUI, isPopoverUI, isProtyleVisible, isSearchUI, siyuan, } from "./libs/utils";
import { MarkKey, TEMP_CONTENT, TOMATO_BK_IGNORE } from "./libs/gconst";
import BackLinkBottom from "./BackLinkBottom.svelte";
import { DestroyManager } from "./libs/destroyer";
import { tomatoI18n } from "./tomatoI18n";
import { back_link_dailynote_off, back_link_default_off, back_link_goto_bottom_btn, backLinkBottomBoxCheckbox, fastNoteBoxDisableBK, bk启用禁用文档的底部反链menu, back_link_refresh_off, bk_refresh_interval_sec, bk_visible_only } from "./libs/stores";
import { OpenSyFile2 } from "./libs/docUtils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { verifyKeyTomato } from "./libs/user";
import { debugLog } from "./libs/logUtils";
import { applyEntryCount, cachedEntryCount } from "./libs/bkRevision";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
import { newID } from "stonev5-utils";
import { mount } from "svelte";

const BKMAKER_ADD = "BKMAKER_ADD";
const BKENTRY_ADD = "BKENTRY_ADD";

function bkEntryDivID(docID: string) {
    return "tomatoBKEntry" + docID;
}

function removeBkEntryBar(docID: string) {
    document.querySelectorAll(`div[${BKENTRY_ADD}="${bkEntryDivID(docID)}"]`).forEach(e => e.remove());
}

export class BKMaker {
    public goDownID: string;
    public disabled: boolean;
    public shouldFreeze: boolean; // maker.shouldFreeze = !$autoRefreshChecked;
    public container: HTMLElement;
    public docID: string;
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
            debugLog("bk.mount.done", `doc=${this.docID} interval=${Math.max(2, Number(bk_refresh_interval_sec.get()) || 15)}s freeze=${this.shouldFreeze}`, "bk");
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

export const BK启用禁用文档的底部反链 = winHotkey("shift+alt+9", "BK启用禁用文档的底部反链", "iconDock", () => tomatoI18n.enableBK启用禁用文档的底部反链,)

class BackLinkBottomBox {
    public plugin: BaseTomatoPlugin;
    public settingCfg: TomatoSettings;

    async onload(plugin: BaseTomatoPlugin) {
        debugLog("bk.onload", `checkbox=${backLinkBottomBoxCheckbox.get()}`, "bk");
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
                addIfVisible(menu, BK启用禁用文档的底部反链.langKey, {
                    label: BK启用禁用文档的底部反链.langText(),
                    icon: BK启用禁用文档的底部反链.icon,
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
                        debugLog("bk.evt", `${eventType} doc=${protyle?.block?.rootID ?? "?"} el=${!!protyle?.element}`, "bk");
                        if (!protyle?.element) return;
                        if (protyle.element.getAttribute(TOMATO_BK_IGNORE)) {
                            debugLog("bk.evt.skip", "TOMATO_BK_IGNORE on element", "bk");
                            return;
                        }
                        // 悬浮浮层（.block__popover，含纯预览/编辑浮窗，无 DOM 二分）内的
                        // protyle 一概不挂面板/入口条（□1 吞面板根因）。上提到 attrs 往返
                        // 之前：同步拒掉，覆盖 disabled 分支 mountBkEntryBar 的姊妹入口
                        if (isPopoverUI(detail)) {
                            debugLog("bk.evt.skip", "popoverUI", "bk");
                            return;
                        }

                        const docID = protyle.block.rootID;
                        if (!docID) {
                            debugLog("bk.evt.skip", "no rootID", "bk");
                            return;
                        }

                        if (events.isMobile) {
                            [...document.querySelectorAll(`[${BKMAKER_ADD}],div[${BKENTRY_ADD}]`)]
                                .forEach(d => d.parentElement?.removeChild(d));
                        }

                        const attrs = await siyuan.getBlockAttrs(docID);
                        const disabled = await isBkOff(docID, attrs);
                        if (disabled) {
                            debugLog("bk.evt.skip", `disabled doc=${docID}`, "bk");
                            BKMaker.removeBkDiv(docID);
                            protyle.wysiwyg.element.style.paddingBottom = "200px";
                            // □3 默认关可发现性：计数>0 才渲染 28px 极轻入口条（spec §10）
                            if (back_link_default_off.get()) {
                                this.mountBkEntryBar(detail, docID);
                            }
                            return;
                        }

                        removeBkEntryBar(docID);
                        await this.attachMaker(detail, eventType);
                    }
                });
            }
        });
    }

    /** 从环境检查到 BKMaker 挂载的完整链（事件驱动与入口条开启钮共用） */
    private async attachMaker(detail: Protyle, eventType = "") {
        const protyle = detail?.protyle;
        const docID = protyle?.block?.rootID;
        if (!docID) return;
        if (BKMaker.installed(docID)) return;
        const attrs = await siyuan.getBlockAttrs(docID);
        if (isPopoverUI(detail)) {
            debugLog("bk.evt.skip", "popoverUI", "bk");
            return;
        }
        if (isSearchUI(detail)) {
            debugLog("bk.evt.skip", "searchUI", "bk");
            return;
        }
        if (isCardUI(detail)) {
            debugLog("bk.evt.skip", "cardUI", "bk");
            return;
        }
        if (isDocFlow(detail)) {
            debugLog("bk.evt.skip", "docFlow", "bk");
            return;
        }
        if (await skipByAttrs(docID, attrs)) {
            debugLog("bk.evt.skip", `skipByAttrs doc=${docID} keys=${Object.keys(attrs).join(",")}`, "bk");
            return;
        }

        // create maker
        let maker = new BKMaker(this, docID);
        maker.disabled = false;
        debugLog("bk.mount", `doTheWork doc=${docID} type=${eventType}`, "bk");

        maker.doTheWork(detail, attrs);
        if (back_link_goto_bottom_btn.get() && await verifyKeyTomato() && !events.isMobile) {
            this.addIcon2Title(maker);
        }
    }

    /**
     * □3 默认关入口条：列表级反链计数（knownRevision 加持，未变化近零开销），
     * >0 才渲染；点击整条=enableBK 后走 attachMaker 挂载面板。
     */
    private async mountBkEntryBar(detail: Protyle, docID: string) {
        removeBkEntryBar(docID);
        let count: number;
        try {
            const cached = cachedEntryCount(docID);
            const resp = await siyuan.getBacklink2(docID, "", "", "3", "3", cached?.revision ?? "");
            count = applyEntryCount(docID, resp);
        } catch (e) {
            debugLog("bk.entry", `count failed doc=${docID}: ${e}`, "bk");
            return;
        }
        if (count <= 0) {
            debugLog("bk.entry", `count=0 skip doc=${docID}`, "bk");
            return;
        }
        // await 间隙文档可能已切走或重新开启：挂载前核验现场
        const wysiwyg = detail?.protyle?.wysiwyg?.element;
        if (!document.contains(wysiwyg) || BKMaker.installed(docID)) return;
        removeBkEntryBar(docID);

        const bar = document.createElement("div");
        bar.classList.add("tomato-bk-entry-bar");
        bar.setAttribute(BKENTRY_ADD, bkEntryDivID(docID));
        bar.setAttribute("aria-label", tomatoI18n.底部反链入口文案.replace("{n}", String(count)));
        bar.innerHTML = icon("LayoutBottom", 14);
        const text = document.createElement("span");
        text.className = "tomato-bk-entry-bar__text";
        text.textContent = tomatoI18n.底部反链入口文案.replace("{n}", String(count));
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tomato-bk-entry-bar__btn";
        btn.textContent = tomatoI18n.开启;
        bar.append(text, btn);
        bar.onclick = async () => {
            debugLog("bk.entry", `enable doc=${docID}`, "bk");
            await enableBK(docID);
            removeBkEntryBar(docID);
            await this.attachMaker(detail);
        };
        wysiwyg.insertAdjacentElement("afterend", bar);
        debugLog("bk.entry", `mounted doc=${docID} count=${count}`, "bk");
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

export const backLinkBottomBox = new BackLinkBottomBox();
