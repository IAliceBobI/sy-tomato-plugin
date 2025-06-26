import { adaptHotkey, Custom, Dialog, Dock, IProtyle, openTab, Tab } from "siyuan";
import { events, EventType } from "./libs/Events";
import { getAttribute, getDialogContainer, isEditor, setAttribute, siyuan, sleep, } from "./libs/utils";
import CommentBoxSvelte from "./CommentBox.svelte";
import { commentBoxCheckbox, commentBoxMenu, storeNoteBox_selectedNotebook } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { isReadonly } from "./libs/docUtils";
import { winHotkey } from "./libs/winHotkey";
import { DestroyManager } from "./libs/destroyer";
import CommentInput from "./CommentInput.svelte";
import { newID } from "stonev5-utils/lib/id";
import { verifyKeyTomato } from "./libs/user";
import { setTimeouts } from "stonev5-utils";
import { removeTopBarIcon } from "./libs/ui";

const DOCK_TYPE = "dock_CommentBox";
const TAB_TYPE = "custom_tab_CommentBox"

export const CommentBox添加批注到日记 = winHotkey("⇧⌥F", "comment box 2024-12-20 12:01:14", "iconQuoteTomato", () => tomatoI18n.添加批注到日记, false)
export const CommentBoxTab批注 = winHotkey("⇧⌥I", "comment tab 2025-6-7 12:24:11", "iconQuoteTomato", () => tomatoI18n.批注, false)
export const CommentBox刷新文档正引 = winHotkey("F9", "comment refresh ref 2025年6月12日17:51:13", "iconQuoteTomato", () => tomatoI18n.刷新文档正引, true)

class CommentBox {
    plugin: BaseTomatoPlugin;
    settingCfg: TomatoSettings;
    svelteCallback: Func;
    svelteResize: () => void;
    svelteCallbackTab: Func;
    svelteResizeTab: () => void;
    svelte: CommentBoxSvelte;
    private customTab: () => Custom;

    onload(plugin: BaseTomatoPlugin) {
        this.plugin = plugin;
        if (!events.isMobile) {
            removeTopBarIcon(CommentBoxTab批注.icon)
            plugin.addTopBar({
                icon: CommentBoxTab批注.icon,
                title: CommentBoxTab批注.langText() + CommentBoxTab批注.w(),
                position: "left",
                callback: () => this.openCommentTab(),
            });
        }

        (async () => {
            await plugin.taskCfg;
            this.settingCfg = plugin.settingCfg;
            await verifyKeyTomato();
            if (commentBoxCheckbox.get()) {
                if (!events.isMobile) {
                    this.addDock();
                }
                this._onload();
            } else {
                setTimeouts(() => {
                    removeTopBarIcon(CommentBoxTab批注.icon)
                }, 300, 4000, 500)
            }
        })();
    }

    _onload() {
        this.plugin.addCommand({
            langKey: CommentBox添加批注到日记.langKey,
            langText: CommentBox添加批注到日记.langText(),
            hotkey: CommentBox添加批注到日记.m,
            callback: () => {
                this.findDivs(events.protyle.protyle, false);
            },
        });

        this.plugin.addCommand({
            langKey: CommentBox刷新文档正引.langKey,
            langText: CommentBox刷新文档正引.langText(),
            hotkey: CommentBox刷新文档正引.m,
            callback: () => {
                if (this.svelteCallback) {
                    this.svelteCallback(events.protyle.protyle, true);
                } else if (this.svelteCallbackTab) {
                    this.svelteCallbackTab(events.protyle.protyle, true);
                }
            },
        });

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            if (commentBoxMenu.get()) {
                menu.addItem({
                    icon: CommentBox添加批注到日记.icon,
                    accelerator: CommentBox添加批注到日记.m,
                    label: CommentBox添加批注到日记.langText(),
                    click: () => {
                        this.findDivs(detail.protyle, false);
                    },
                });
            }
        });

        if (!events.isMobile) {
            events.addListener("tomato comment inline 2025-6-9 18:28:36", (eventType, detail) => {
                if (eventType == EventType.loaded_protyle_static
                    || eventType == EventType.loaded_protyle_dynamic
                    || eventType == EventType.switch_protyle
                    || eventType == EventType.click_editorcontent
                ) {
                    this.inlineComment(detail.protyle);
                }
            });

            events.addListener("tomato-comment-box-2024年12月19日21:48:42", (eventType, detail) => {
                if (eventType == EventType.click_editorcontent) {
                    if (this.svelteCallback) {
                        this.svelteCallback(detail.protyle);
                    }
                    if (this.svelteCallbackTab) {
                        this.svelteCallbackTab(detail.protyle);
                    }
                }
            });

            this.plugin.addCommand({
                langKey: CommentBoxTab批注.langKey,
                langText: CommentBoxTab批注.langText(),
                hotkey: CommentBoxTab批注.m,
                callback: () => this.openCommentTab(),
            });

            this.customTab;
            this.customTab = this.plugin.addTab({
                type: TAB_TYPE,
                resize() {
                    if (commentBox.svelteResizeTab) commentBox.svelteResizeTab();
                },
                init(this) {
                    const id = newID();
                    this.element.innerHTML = `<div id="${id}"></div>`;
                    this.data.sm = new DestroyManager();
                    const svelte = new CommentBoxSvelte({
                        target: this.element.querySelector("#" + id),
                        props: {
                            dock: this as any,
                            isDock: false,
                        }
                    });
                    this.data.sm.add("tab", () => { this.destroy(); });
                    this.data.sm.add("svelte", () => { svelte.$destroy(); });
                },
                beforeDestroy() { },
                destroy() {
                    this.data.sm.destroyBy("tab");
                }
            });
        }
    }

    private tab: Tab;
    async openCommentTab() {
        if (this.tab) {
            this.tab.close();
            this.tab = null;
        } else {
            this.tab = await openTab({
                position: "right",
                app: this.plugin.app,
                custom: {
                    icon: CommentBoxTab批注.icon,
                    title: CommentBoxTab批注.langText(),
                    data: { docID: events.docID, blockID: events.lastBlockID },
                    id: this.plugin.name + TAB_TYPE
                },
            });
        }
    }

    blockIconEvent(detail: any) {
        if (!commentBoxCheckbox.get()) return;
        if (commentBoxMenu.get()) {
            const protyle: IProtyle = detail.protyle;
            detail.menu.addItem({
                icon: CommentBox添加批注到日记.icon,
                accelerator: CommentBox添加批注到日记.m,
                label: CommentBox添加批注到日记.langText(),
                click: () => {
                    this.findDivs(protyle, false);
                }
            });
        }
    }

    private async do_inlineComment(protyle: IProtyle) {
        const divs = [...protyle.element.querySelectorAll(`div[data-node-id]`)];
        const ids = divs.map(div => getAttribute(div, "data-node-id"))
        let inField = ids.map(id => `'${id}'`).join(",");

        // block_id ---> def_block_id。 comment box 中，1个block_id不会引用多个def_block_id。
        let idMap = await siyuan
            .sqlRef(`select block_id,def_block_id from refs where def_block_id in (${inField})`)
            .then(rows => {
                return new Map(rows.map(row => [row.block_id, row.def_block_id]));
            });
        inField = [...idMap.keys()].map(id => `'${id}'`).join(",");

        idMap = await siyuan
            .sqlAttr(`select value,block_id from attributes where name="custom-comment-bk-id" and block_id in (${inField})`)
            .then(rows => {
                return new Map(rows.map(row => {
                    const def_block_id = idMap.get(row.block_id)
                    return [row.value, def_block_id]
                }));
            });

        inField = [...idMap.keys()].map(id => `'${id}'`).join(",");
        idMap = await siyuan
            .sql(`select id,markdown from blocks where id in (${inField})`)
            .then(rows => {
                return new Map(rows.map(row => {
                    const md = (row.markdown ?? "").split("{{{row").at(1)?.trim();
                    const def_block_id = idMap.get(row.id)
                    return [def_block_id, md]
                }));
            });

        for (const div of divs) {
            const id = getAttribute(div, "data-node-id");
            const md = idMap.get(id)
            if (!md) continue;
            setAttribute(div, "data-inline-comment", md)
        }
    }

    private inlineComment(protyle: IProtyle) {
        if (!protyle || !protyle.element) return;
        if (!isEditor(protyle)) return;
        navigator.locks.request("inlineComment 2025-6-9 18:31:03", { ifAvailable: true }, async (lock) => {
            if (lock) {
                await this.do_inlineComment(protyle)
                await sleep(800);
            }
        })
    }

    private async findDivs(protyle: IProtyle, _newFile: boolean) {
        const ro = isReadonly(protyle)
        const { ids, selected, rangeText, range } = await events.selectedDivs(protyle);
        if (!selected || selected.length == 0) return;
        let boxID = storeNoteBox_selectedNotebook.getOr();
        if (!boxID) boxID = events.boxID;

        const id = newID();
        const dm = new DestroyManager();
        const dialog = new Dialog({
            title: tomatoI18n.添加批注,
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : null,
            height: events.isMobile ? null : null,
            transparent: true,
            destroyCallback() {
                dm.destroyBy("dialog");
            },
            resizeCallback(_type: string) {
                dm.getFn("resizeCallback")(getDialogContainer(dialog));
            }
        });
        dm.add("dialog", () => dialog.destroy());
        const svelte = new CommentInput({
            target: dialog.element.querySelector("#" + id),
            props: {
                dm,
                protyle,
                boxID,
                ro,
                ids,
                selected,
                rangeText,
                range,
            }
        });
        dm.add("svelte", () => svelte.$destroy());
    }

    private addDock() {
        const title = tomatoI18n.批注//`${tomatoI18n.批注}(${tomatoI18n.包含正反链})`
        this.plugin.addDock({
            type: DOCK_TYPE,
            config: {
                position: "RightBottom",
                size: { width: 200, height: 0 },
                icon: CommentBox添加批注到日记.icon,
                title,
                hotkey: "⌥⌘S",
            },
            data: {
            },
            resize() {
                if (commentBox.svelteResize) commentBox.svelteResize();
            },
            update() {
            },
            destroy() {
                commentBox.svelte.$destroy();
            },
            init: (dock: Dock) => {
                const eleID = newID();
                if (events.isMobile) {
                    dock.element.innerHTML = `<div class="toolbar toolbar--border toolbar--dark">
                        <svg class="toolbar__icon"><use xlink:href="#iconQuoteTomato"></use></svg>
                            <div class="toolbar__text">${title}</div>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                } else {
                    dock.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
                        <div class="block__icons">
                            <div class="block__logo">
                                <svg class="block__logoicon"><use xlink:href="#iconQuoteTomato"></use></svg>${title}
                            </div>
                            <span class="fn__flex-1 fn__space"></span>
                            <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}"><svg><use xlink:href="#iconMin"></use></svg></span>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                }
                commentBox.svelte = new CommentBoxSvelte({
                    target: dock.element.querySelector("#" + eleID),
                    props: {
                        dock,
                    }
                }) as any;
            },
        });
    }
}

export const commentBox = new CommentBox();
