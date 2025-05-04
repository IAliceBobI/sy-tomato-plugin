import { IProtyle } from "siyuan";
import { events } from "./libs/Events";
import { add_href, add_ref, cloneCleanDiv, closeTabByTitle, getContextPath, getOpenedEditors, Siyuan, siyuan, timeUtil } from "./libs/utils";
import { DATA_NODE_ID } from "./libs/gconst";
import { dailyNoteBoxCheckbox, dailyNoteCopy, dailyNoteCopyAnchorText, dailyNoteCopyComment, dailyNoteCopyFlashCard, dailyNoteCopyInsertPR, dailyNoteCopySimple, dailyNoteCopyUpdateBG, dailyNoteCopyUseRef, dailyNoteGoToBottom, dailyNoteMoveToBottom, readingPointBoxCheckbox, storeNoteBox_selectedNotebook } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { readingPointBox } from "./ReadingPointBox";
import { domNewLine, DomSuperBlockBuilder } from "./libs/sydom";
import { DialogText } from "./libs/DialogText";
import { createAndOpenFastNote } from "./FastNoteBox";
import { isReadonly, OpenSyFile2 } from "./libs/docUtils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

class DailyNoteBox {
    private plugin: BaseTomatoPlugin;

    blockIconEvent(detail: any) {
        if (!this.plugin) return;
        const protyle: IProtyle = detail.protyle;
        detail.menu.addItem({
            iconHTML: "🍅🏑",
            accelerator: "⌘6",
            label: this.plugin.i18n.moveBlock2today,
            click: () => {
                this.findDivs(protyle, false, false);
            }
        });

        if (dailyNoteCopy.get() || dailyNoteCopySimple.get()) {
            detail.menu.addItem({
                iconHTML: "🍅🌀",
                accelerator: "⌘⇧6",
                label: tomatoI18n.复制到dailynote,
                click: () => {
                    this.findDivs(protyle, true, false);
                }
            });
            detail.menu.addItem({
                iconHTML: "🍅🌀📜",
                accelerator: "⌥⇧C",
                label: tomatoI18n.复制到dailynoteNewFile,
                click: () => {
                    this.findDivs(detail.protyle, true, true);
                },
            });
        }
    }

    onload(plugin: BaseTomatoPlugin) {
        if (plugin.initCfg()) {
            this._onload(plugin)
        } else {
            (async () => {
                await plugin.taskCfg;
                this._onload(plugin);
            })();
        }
    }

    _onload(plugin: BaseTomatoPlugin) {
        if (!dailyNoteBoxCheckbox.get()) {
            return;
        }
        this.plugin = plugin;

        plugin.addTopBar({
            icon: "iconLeft",
            title: tomatoI18n.上一个日志 + "Alt+Q",
            position: "left",
            callback: () => {
                this.openDailyNote(-1000 * 60 * 60 * 24);
            }
        });
        plugin.addTopBar({
            icon: "iconRight",
            title: tomatoI18n.下一个日志 + "Alt+W",
            position: "left",
            callback: () => {
                this.openDailyNote(1000 * 60 * 60 * 24);
            }
        });

        this.plugin.addCommand({
            langKey: "previousNote",
            hotkey: "⌥Q",
            callback: () => {
                this.openDailyNote(-1000 * 60 * 60 * 24);
            },
        });
        this.plugin.addCommand({
            langKey: "nextNote",
            hotkey: "⌥W",
            callback: () => {
                this.openDailyNote(1000 * 60 * 60 * 24);
            },
        });
        this.plugin.addCommand({
            langKey: "moveBlock2today",
            hotkey: "⌘6",
            editorCallback: (protyle) => {
                this.findDivs(protyle, false, false);
            },
        });
        if (dailyNoteCopy.get() || dailyNoteCopySimple.get()) {
            this.plugin.addCommand({
                langKey: "cp2dailynote2024-08-12 21:00:35",
                langText: tomatoI18n.复制到dailynote,
                hotkey: "⌘⇧6",
                callback: () => {
                    this.findDivs(events.protyle.protyle, true, false);
                },
            });
            this.plugin.addCommand({
                langKey: "cp2dailynoteNewFile2024-8-16 15:34:14",
                langText: tomatoI18n.复制到dailynoteNewFile,
                hotkey: "⌥⇧C",
                callback: () => {
                    this.findDivs(events.protyle.protyle, true, true);
                },
            });
        }
        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            menu.addItem({
                label: this.plugin.i18n.moveBlock2today,
                iconHTML: "🍅🏑",
                accelerator: "⌘6",
                click: () => {
                    this.findDivs(detail.protyle, false, false);
                },
            });
            if (dailyNoteCopy.get() || dailyNoteCopySimple.get()) {
                menu.addItem({
                    iconHTML: "🍅🌀",
                    accelerator: "⌘⇧6",
                    label: tomatoI18n.复制到dailynote,
                    click: () => {
                        this.findDivs(detail.protyle, true, false);
                    },
                });
                menu.addItem({
                    iconHTML: "🍅🌀📜",
                    accelerator: "⌥⇧C",
                    label: tomatoI18n.复制到dailynoteNewFile,
                    click: () => {
                        this.findDivs(detail.protyle, true, true);
                    },
                });
            }
        });
    }

    async findDailyNote(boxID: string, ymd: string, deltaMs: number) {
        if (ymd) {
            if (deltaMs < 0) {
                const rows = await siyuan.sql(`select B.id from (select block_id from attributes 
                    where box='${boxID}' 
                    and name < 'custom-dailynote-${ymd}' 
                    and name like 'custom-dailynote-%' 
                    order by name desc limit 1) as A inner join blocks as B 
                    on A.block_id = B.id 
                    and B.ial like "%custom-dailynote-%"`);
                for (const d of rows) {
                    return d.id;
                }
            } else {
                const rows = await siyuan.sql(`select B.id from (select block_id from attributes 
                    where box='${boxID}' 
                    and name > 'custom-dailynote-${ymd}' 
                    and name like 'custom-dailynote-%' 
                    order by name asc limit 1) as A inner join blocks as B 
                    on A.block_id = B.id 
                    and B.ial like "%custom-dailynote-%"`);
                for (const d of rows) {
                    return d.id;
                }
            }
        }
        return "";
    }

    private getDailynoteID(deltaMs: number) {
        if (events.isMobile) {
            return { tab: [], id: events.docID }
        }

        let tabs = getOpenedEditors()
        tabs = tabs
            .filter(({ ial }) => {
                for (const [k, v] of Object.entries(ial)) {
                    if (k.startsWith("custom-dailynote-")) {
                        ial['tomato-dailynote'] = v
                        return true
                    }
                }
            })
            .sort((a, b) => {
                const a1 = a.ial["tomato-dailynote"]
                const b1 = b.ial["tomato-dailynote"]
                return a1.localeCompare(b1);
            });

        const c = tabs.find(t => t.ial.id === events.docID)
        if (c) return { id: c.ial.id, tabs }

        if (deltaMs > 0) {
            return { id: tabs.at(-1)?.ial.id, tabs }
        } else {
            return { id: tabs.at(0)?.ial.id, tabs }
        }
    }

    async openDailyNote(deltaMs: number) {
        if (deltaMs == 0) return;
        let boxID = storeNoteBox_selectedNotebook.getOr();
        if (!boxID) boxID = Siyuan.notebooks?.find(i => !i.closed)?.id;
        if (!boxID) {
            siyuan.pushMsg(tomatoI18n.请先打开笔记本);
            return;
        }

        let { id: currentDocID, tabs } = this.getDailynoteID(deltaMs)
        let targetDocID: string;
        if (currentDocID) {
            const attrs = await siyuan.getBlockAttrs(currentDocID);
            let ymd: string;
            for (const key in attrs) {
                if (key.startsWith("custom-dailynote-")) {
                    ymd = attrs[key];
                }
            }
            targetDocID = await this.findDailyNote(boxID, ymd, deltaMs);
        }
        if (!targetDocID) {
            const { y, M, d } = timeUtil.nowYMDStrPad()
            const attr = await siyuan.sqlAttr(`select block_id from attributes where box="${boxID}" and name="custom-dailynote-${y + M + d}"`)
            targetDocID = attr?.at(0)?.block_id;
        }
        if (!targetDocID) {
            if (Siyuan.config.sync.enabled) {
                await siyuan.performSync();
            }
            targetDocID = (await siyuan.createDailyNote(boxID)).id;
        }
        if (targetDocID) {
            if (events.isMobile) {
                await OpenSyFile2(this.plugin, targetDocID);
            } else {
                if (dailyNoteGoToBottom.get() === true) {
                    const tail = await siyuan.getTailChildBlocks(targetDocID, 2);
                    for (const t of tail) {
                        if (t.id) {
                            await OpenSyFile2(this.plugin, t.id);
                            break;
                        }
                    }
                }
                closeTabByTitle(tabs.map(t => t.ial), targetDocID);
            }
        }
    }

    private async findDivs(protyle: IProtyle, copy: boolean, newFile: boolean) {
        const { ids, selected } = await events.selectedDivs(protyle);
        const ro = await isReadonly(protyle)
        if (copy && dailyNoteCopyComment.get() && dailyNoteCopySimple.get() === false) {
            new DialogText(tomatoI18n.添加批注, "", (text) => {
                this.doFindDivs(ids, selected, ro, copy, text, newFile);
            }, true);
        } else {
            return this.doFindDivs(ids, selected, ro, copy, "", newFile);
        }
    }

    private async doFindDivs(ids: string[], selected: HTMLElement[], ro: string, copy = false, text = "", newFile: boolean) {
        let boxID = storeNoteBox_selectedNotebook.getOr();
        if (!boxID) boxID = events.boxID;
        try {
            const { id: docID } = await siyuan.createDailyNote(boxID);
            if (!selected || selected.length == 0) return;
            if (copy && dailyNoteCopySimple.get()) {
                const htmls = selected.map(div => cloneCleanDiv(div).div.outerHTML)
                if (dailyNoteMoveToBottom.get()) {
                    const tail = await siyuan.getTailChildBlocks(docID, 1);
                    await siyuan.insertBlocksAfter(htmls, tail[0].id);
                } else {
                    await siyuan.insertBlocksAsChildOf(htmls, docID);
                }
            } else if (copy) {
                const rpath = (await getContextPath(ids[0])).getPathStr();
                let anchorText = dailyNoteCopyAnchorText.get()?.trim()
                if (!anchorText) anchorText = "  *  "
                const newDivs = selected.map(div => cloneCleanDiv(div))
                    .map((div, idx) => {
                        if (idx == 0 && !newFile) {
                            if (dailyNoteCopyUseRef.get()) {
                                add_ref(div.div, div.id, anchorText)
                            } else {
                                add_href(div.div, div.id, anchorText)
                            }
                        }
                        div.div.style.backgroundColor = "";
                        return div.div;
                    });

                if (dailyNoteCopyInsertPR.get()) {
                    if (readingPointBoxCheckbox.get()) {
                        readingPointBox.addReadPointLock(ids[ids.length - 1], selected[selected.length - 1])
                    } else {
                        siyuan.pushMsg(tomatoI18n.请先打开阅读点功能)
                    }
                }

                if (text) newDivs.push(domNewLine("🗨️ " + text));
                let ops = [];
                if (dailyNoteCopyUpdateBG.get() && ro === "false") {
                    ops = siyuan.transUpdateBlocks(selected.map(div => {
                        const id = div.getAttribute(DATA_NODE_ID)
                        div.style.backgroundColor = "var(--b3-font-background7)";
                        return { id, domStr: div.outerHTML }
                    }));
                }
                let cardID = "";

                if (newFile) {
                    const fileID = await createAndOpenFastNote(boxID, this.plugin)
                    cardID = fileID;
                    const ref = domNewLine();
                    if (dailyNoteCopyUseRef.get()) {
                        add_ref(ref, ids[0], rpath);
                    } else {
                        add_href(ref, ids[0], rpath);
                    }
                    newDivs.splice(0, 0, ref, domNewLine())
                    ops.push(...siyuan.transInsertBlocksAsChildOf(newDivs.map(i => i.outerHTML), fileID))
                } else {
                    const builder = newDivs.reduce((b, c) => {
                        b.append(c)
                        return b
                    }, new DomSuperBlockBuilder());
                    builder.setAttr("custom-super-list", "1");
                    const container = builder.build();
                    cardID = builder.id;

                    container.setAttribute("custom-tomato-ref-hpath", rpath);
                    const htmlStr = container.outerHTML;

                    if (dailyNoteMoveToBottom.get()) {
                        const tail = await siyuan.getTailChildBlocks(docID, 1);
                        ops.push(...siyuan.transInsertBlocksAfter([htmlStr], tail[0].id))
                    } else {
                        ops.push(...siyuan.transInsertBlocksAsChildOf([htmlStr], docID))
                    }
                }
                await siyuan.transactions(ops);
                if (dailyNoteCopyFlashCard.get()) {
                    siyuan.addRiffCards([cardID])
                }
            } else {
                if (dailyNoteMoveToBottom.get()) {
                    const tail = await siyuan.getTailChildBlocks(docID, 1);
                    await siyuan.moveBlocksAfter(ids, tail[0].id);
                } else {
                    await siyuan.moveBlocksAsChild(ids, docID);
                }
            }
        } catch (_e) {
            await siyuan.pushMsg(tomatoI18n.您配置的笔记本x是否已经打开了(boxID));
        }
    }
}

export const dailyNoteBox = new DailyNoteBox();
