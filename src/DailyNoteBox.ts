import { IProtyle } from "siyuan";
import { events } from "./libs/Events";
import { add_href, add_ref, cloneCleanDiv, closeTabByTitle, getAllText, getContextPath, getNotebookFirstOne, getOpenedEditors, getProtyleByDocID, Siyuan, siyuan, timeUtil, } from "./libs/utils";
import { DATA_NODE_ID } from "./libs/gconst";
import { dailyNoteBoxCheckbox, dailyNoteCopyAnchorText, dailyNoteCopyComment, dailyNoteCopyFlashCard, dailyNoteCopyInsertPR, dailyNoteCopyMenu, dailyNoteCopySimple, dailyNoteCopyUpdateBG, dailyNoteCopyUseRef, dailyNoteGoToBottom, dailyNoteGoToBottomMenu, dailyNoteMoveLeaveLnk, dailyNoteMoveToBottom, dailyNotetopbarleft, dailyNotetopbarright, readingPointBoxCheckbox, storeNoteBox_selectedNotebook } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { readingPointBox } from "./ReadingPointBox";
import { domLnk, domNewLine, DomSuperBlockBuilder } from "./libs/sydom";
import { DialogText } from "./libs/DialogText";
import { isReadonly, OpenSyFile2 } from "./libs/docUtils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { createAndOpenFastNote } from "./libs/switchDraft";
import { winHotkey } from "./libs/winHotkey";
import { lastVerifyResult, verifyKeyTomato } from "./libs/user";

export const DailyNoteBox上一个日志 = winHotkey("⌥Q", "previousNote 2025-5-11 08:40:40", "iconLeft", () => tomatoI18n.上一个日志,)
export const DailyNoteBox下一个日志 = winHotkey("⌥W", "nextNote 2025-5-11 08:42:17", "iconRight", () => tomatoI18n.下一个日志,)
export const DailyNoteBox移动内容到dailynote = winHotkey("shift+alt+6", "moveBlock2today 2025-5-11 09:20:29", "🏑", () => tomatoI18n.移动内容到dailynote, false, dailyNoteGoToBottomMenu)

export const DailyNoteBox复制到dailynote = winHotkey("⌘⇧6", "DailyNoteBox复制到dailynote2025-5-11 14:12:36", "🌀", () => tomatoI18n.复制到dailynote)
export const DailyNoteBox复制到dailynoteNewFile = winHotkey("⌥⇧C", "DailyNoteBox复制到dailynoteNewFile 2025-5-11 14:19:29", "🌀📜", () => tomatoI18n.复制到dailynoteNewFile)

class DailyNoteBox {
    private plugin: BaseTomatoPlugin;

    blockIconEvent(detail: any) {
        if (!dailyNoteBoxCheckbox.get()) return;
        const protyle: IProtyle = detail.protyle;

        if (DailyNoteBox移动内容到dailynote.menu()) {
            detail.menu.addItem({
                iconHTML: DailyNoteBox移动内容到dailynote.icon,
                accelerator: DailyNoteBox移动内容到dailynote.m,
                label: DailyNoteBox移动内容到dailynote.langText(),
                click: () => {
                    this.findDivs(protyle, false, false);
                }
            });
        }

        if (dailyNoteCopyMenu.get()) {
            detail.menu.addItem({
                iconHTML: DailyNoteBox复制到dailynote.icon,
                accelerator: DailyNoteBox复制到dailynote.m,
                label: tomatoI18n.复制到dailynote,
                click: () => {
                    this.findDivs(protyle, true, false);
                }
            });
            detail.menu.addItem({
                iconHTML: DailyNoteBox复制到dailynoteNewFile.icon,
                accelerator: DailyNoteBox复制到dailynoteNewFile.m,
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
                await verifyKeyTomato()
                this._onload(plugin);
            })();
        }
    }

    _onload(plugin: BaseTomatoPlugin) {
        if (!dailyNoteBoxCheckbox.get()) {
            return;
        }
        this.plugin = plugin;
        if (dailyNotetopbarleft.get()) {
            plugin.addTopBar({
                icon: DailyNoteBox上一个日志.icon,
                title: DailyNoteBox上一个日志.langText() + DailyNoteBox上一个日志.w(),
                position: "left",
                callback: () => {
                    this.openDailyNote(-1000 * 60 * 60 * 24);
                }
            });
        }

        if (dailyNotetopbarright.get()) {
            plugin.addTopBar({
                icon: DailyNoteBox下一个日志.icon,
                title: DailyNoteBox下一个日志.langText() + DailyNoteBox下一个日志.w(),
                position: "left",
                callback: () => {
                    this.openDailyNote(1000 * 60 * 60 * 24);
                }
            });
        }

        this.plugin.addCommand({
            langText: DailyNoteBox上一个日志.langText(),
            langKey: DailyNoteBox上一个日志.langKey,
            hotkey: DailyNoteBox上一个日志.m,
            callback: () => {
                this.openDailyNote(-1000 * 60 * 60 * 24);
            },
        });
        this.plugin.addCommand({
            langText: DailyNoteBox下一个日志.langText(),
            langKey: DailyNoteBox下一个日志.langKey,
            hotkey: DailyNoteBox下一个日志.m,
            callback: () => {
                this.openDailyNote(1000 * 60 * 60 * 24);
            },
        });


        this.plugin.addCommand({
            langText: DailyNoteBox移动内容到dailynote.langText(),
            langKey: DailyNoteBox移动内容到dailynote.langKey,
            hotkey: DailyNoteBox移动内容到dailynote.m,
            editorCallback: (protyle) => {
                this.findDivs(protyle, false, false);
            },
        });


        this.plugin.addCommand({
            langKey: DailyNoteBox复制到dailynote.langKey,
            langText: tomatoI18n.复制到dailynote,
            hotkey: DailyNoteBox复制到dailynote.m,
            callback: () => {
                this.findDivs(events.protyle.protyle, true, false);
            },
        });

        if (!dailyNoteCopySimple.get()) {
            this.plugin.addCommand({
                langKey: DailyNoteBox复制到dailynoteNewFile.langKey,
                langText: tomatoI18n.复制到dailynoteNewFile,
                hotkey: DailyNoteBox复制到dailynoteNewFile.m,
                callback: () => {
                    this.findDivs(events.protyle.protyle, true, true);
                },
            });
        }

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            if (dailyNoteGoToBottomMenu.get()) {
                menu.addItem({
                    label: DailyNoteBox移动内容到dailynote.langText(),
                    iconHTML: DailyNoteBox移动内容到dailynote.icon,
                    accelerator: DailyNoteBox移动内容到dailynote.m,
                    click: () => {
                        this.findDivs(detail.protyle, false, false);
                    },
                });
            }
            if (dailyNoteCopyMenu.get()) {
                menu.addItem({
                    iconHTML: DailyNoteBox复制到dailynote.icon,
                    accelerator: DailyNoteBox复制到dailynote.m,
                    label: tomatoI18n.复制到dailynote,
                    click: () => {
                        this.findDivs(detail.protyle, true, false);
                    },
                });
                menu.addItem({
                    iconHTML: DailyNoteBox复制到dailynoteNewFile.icon,
                    accelerator: DailyNoteBox复制到dailynoteNewFile.m,
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
            .filter(({ ial }) => !!ial)
            .filter(({ ial }) => {
                for (const [k, v] of Object.entries(ial)) {
                    if (k.startsWith("custom-dailynote-")) {
                        ial["tomato-dailynote"] = v
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
        if (!boxID) boxID = getNotebookFirstOne()?.id;
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
                if (dailyNoteGoToBottom.get() === true && lastVerifyResult()) {
                    const id = await siyuan.getDocLastID(targetDocID)
                    if (id) {
                        await OpenSyFile2(this.plugin, id);
                    } else {
                        await OpenSyFile2(this.plugin, targetDocID);
                    }
                } else {
                    await OpenSyFile2(this.plugin, targetDocID);
                }
                closeTabByTitle(tabs.map(t => t.ial), targetDocID);
            }
        }
    }

    private async findDivs(protyle: IProtyle, copy: boolean, newFile: boolean) {
        const { ids, selected } = await events.selectedDivs(protyle);
        const ro = await isReadonly(protyle)
        if (!dailyNoteCopyComment.get() || !copy || dailyNoteCopySimple.get()) {
            return this.doFindDivs(ids, selected, ro, copy, "", newFile);
        } else {
            new DialogText(tomatoI18n.添加批注, "", (text) => {
                this.doFindDivs(ids, selected, ro, copy, text, newFile);
            }, true);
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
                const ops = []
                if (dailyNoteMoveLeaveLnk.get()) {
                    const lnk = domLnk("", ids.at(0), getAllText(selected, "").replaceAll("\n", "").slice(0, 30))
                    ops.push(...siyuan.transInsertBlocksAfter([lnk], ids.at(0)));
                }
                if (dailyNoteMoveToBottom.get()) {
                    ops.push(...siyuan.transMoveBlocksAfter(ids, await siyuan.getDocLastID(docID)))
                } else {
                    ops.push(...siyuan.transMoveBlocksAsChild(ids, docID))
                }
                await siyuan.transactions(ops)
                getProtyleByDocID(docID).forEach(p => p.reload(false))
                // await OpenSyFile2(this.plugin, ids.at(-1));
            }
        } catch (_e) {
            await siyuan.pushMsg(tomatoI18n.您配置的笔记本x是否已经打开了(boxID));
        }
    }
}

export const dailyNoteBox = new DailyNoteBox();
