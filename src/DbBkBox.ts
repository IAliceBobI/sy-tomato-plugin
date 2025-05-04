import { IEventBusMap, IProtyle, subMenu } from "siyuan";
import { DATA_AV_ID, DATA_ID, DATA_NODE_ID, DATABASE_BACKLINK, DATABASE_BACKLINK_AVID, DATABASE_BACKLINK_ContentID, DATABASE_BACKLINK_createdID, DATABASE_BACKLINK_mSelectID, DATABASE_BACKLINK_PKID, DATABASE_BACKLINK_updatedID, DATABASE_BACKLINK_viewID } from "./libs/gconst";
import { dbBkBoxCheckbox, dbBkBoxHideDatetime, dbBkBoxMaxBacklinkSize } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { AvBuilder, domNewLine } from "./libs/sydom";
import { getBlockDiv, NewNodeID, siyuan, timeUtil } from "./libs/utils";
import { doGetBackLinks } from "./libs/bkUtils";
import { OpenSyFile2 } from "./libs/docUtils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

class DbBkBox {
    plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        if (!dbBkBoxCheckbox.get()) return;
        this.plugin = plugin;

        this.plugin.addCommand({
            langKey: "dbbkrefresh2024-9-25 08:32:17",
            langText: tomatoI18n.刷新数据库反链,
            hotkey: "F9",
            editorCallback: async (protyle: IProtyle) => {
                this.refreshDBBK(protyle)
            },
        });

        this.plugin.eventBus.on("open-menu-content", async ({ detail }) => {
            this.refreshDBBKMenu(detail as any);
        });

        this.plugin.eventBus.on("open-menu-av", ({ detail }) => {
            const protyle = detail.protyle
            const dbDiv = detail.element
            const menu = detail.menu
            const divs = detail.selectRowElements
            this.dbMenu(protyle, dbDiv, menu, divs);
        });
    }

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!this.plugin) return;
        this.refreshDBBKMenu(detail as any);
    }

    private refreshDBBKMenu(detail: TomatoMenu) {
        const menu = detail.menu;
        menu.addItem({
            label: tomatoI18n.刷新数据库反链,
            iconHTML: "🍅🔄💾",
            accelerator: "F9",
            click: () => {
                this.refreshDBBK(detail.protyle)
            },
        });
    }

    private async refreshDBBK(protyle: IProtyle) {
        return navigator.locks.request("refreshDBBK2024-9-25 23:53:14", { ifAvailable: true }, async (lock) => {
            if (lock) return this.doRefreshDBBK(protyle);
        });
    }

    private async doRefreshDBBK(protyle: IProtyle) {
        const docID = protyle?.block?.rootID;
        if (!docID) return;
        const docName = protyle?.title?.editElement?.textContent;
        if (!docName) return;
        siyuan.pushMsg(tomatoI18n.刷新数据库反链 + "……")
        const ops: IOperation[] = [];
        const taskInitAv = siyuan
            .sqlAttr(`select block_id from attributes where name="${DATABASE_BACKLINK}" and value="${docID}"`)
            .then(async rows => {
                if (rows?.length > 0) {
                    const div = (await getBlockDiv(rows[0].block_id))?.div
                    if (!div) return {}
                    const avID = div.getAttribute(DATA_AV_ID)
                    let pkID = div.getAttribute(DATABASE_BACKLINK_PKID)
                    let mSelectID = div.getAttribute(DATABASE_BACKLINK_mSelectID)
                    let contentID = div.getAttribute(DATABASE_BACKLINK_ContentID)
                    let viewID = div.getAttribute(DATABASE_BACKLINK_viewID)
                    let updatedID = div.getAttribute(DATABASE_BACKLINK_updatedID)
                    let createdID = div.getAttribute(DATABASE_BACKLINK_createdID)
                    let blockID = rows[0].block_id;
                    return { avID, pkID, mSelectID, contentID, viewID, blockID, updatedID, createdID };
                }
                return {}
            })
            .then(async ({ avID, pkID, mSelectID, contentID, viewID, blockID, updatedID, createdID }) => {
                if (!avID || !pkID || !mSelectID || !contentID || !viewID || !updatedID || !createdID) {
                    const avBuilder = new AvBuilder();
                    await avBuilder.init();
                    avID = avBuilder.avID;
                    viewID = avBuilder.db.viewID;
                    pkID = avBuilder.db.view.columns[0].id;
                    contentID = NewNodeID();
                    mSelectID = NewNodeID();
                    updatedID = NewNodeID();
                    createdID = NewNodeID();
                    blockID = avBuilder.id;
                    const sSelectID = avBuilder.db.view.columns[1].id;
                    avBuilder.setAttr(DATABASE_BACKLINK, docID);
                    avBuilder.setAttr(DATABASE_BACKLINK_AVID, avID);
                    avBuilder.setAttr(DATABASE_BACKLINK_PKID, pkID);
                    avBuilder.setAttr(DATABASE_BACKLINK_mSelectID, mSelectID);
                    avBuilder.setAttr(DATABASE_BACKLINK_ContentID, contentID);
                    avBuilder.setAttr(DATABASE_BACKLINK_viewID, viewID);
                    avBuilder.setAttr(DATABASE_BACKLINK_updatedID, updatedID);
                    avBuilder.setAttr(DATABASE_BACKLINK_createdID, createdID);

                    ops.push(...siyuan.transInsertBlocksAsChildOf([avBuilder.build().outerHTML], docID)) // insert block to doc
                    ops.push(siyuan.transSetAttrViewViewName(avID, viewID, "Backlinks")); // update view name
                    ops.push(siyuan.transSetAttrViewName(avID, docName.replaceAll("|", "").replaceAll(/\s+/g, ""))); // update db name
                    ops.push(siyuan.transUpdateAttrViewCol(avID, pkID, "Backlink", "block")); // update pk col name
                    ops.push(siyuan.transRemoveAttrViewCol(avID, sSelectID)); // remove single selection

                    // create columns 
                    ops.push(siyuan.transAddAttrViewCol(avID, "Created", createdID, "date", pkID));
                    ops.push(siyuan.transAddAttrViewCol(avID, "Updated", updatedID, "date", pkID));
                    ops.push(siyuan.transAddAttrViewCol(avID, "Content", contentID, "text", pkID));
                    ops.push(siyuan.transAddAttrViewCol(avID, "Refs", mSelectID, "mSelect", pkID));

                    // set calc option
                    ops.push(siyuan.transSetAttrViewColCalc(avID, blockID, pkID, "Count all"));
                    ops.push(siyuan.transSetAttrViewColCalc(avID, blockID, mSelectID, "Count values"));
                    ops.push(siyuan.transSetAttrViewColCalc(avID, blockID, updatedID, "Range"));
                    ops.push(siyuan.transSetAttrViewColCalc(avID, blockID, createdID, "Range"));

                    // wrap content column
                    ops.push(siyuan.transSetAttrViewColWrap(avID, blockID, pkID, true));
                    ops.push(siyuan.transSetAttrViewColWrap(avID, blockID, mSelectID, true));
                    ops.push(siyuan.transSetAttrViewColWrap(avID, blockID, contentID, true));
                    ops.push(siyuan.transSetAttrViewColWrap(avID, blockID, updatedID, true));
                    ops.push(siyuan.transSetAttrViewColWrap(avID, blockID, createdID, true));

                    // sort by updated desc
                    ops.push(siyuan.transSetAttrViewSorts(avID, blockID, updatedID, "DESC"));

                    // hide columns
                    if (dbBkBoxHideDatetime.get()) {
                        ops.push(siyuan.transSetAttrViewColHidden(avID, blockID, updatedID));
                        ops.push(siyuan.transSetAttrViewColHidden(avID, blockID, createdID));
                    }
                }
                return { avID, pkID, mSelectID, contentID, viewID, blockID, updatedID, createdID }
            });

        const { linkItems, backLinks, block2mSelect, block2lnks } = await doGetBackLinks(docID, "", "", dbBkBoxMaxBacklinkSize.get(), 0, docName)

        const { avID, mSelectID, contentID, blockID, updatedID, createdID } = await taskInitAv;

        // add concept pk
        ops.push(siyuan.transInsertAttrViewBlock(avID, blockID, linkItems.map(lnk => {
            return {
                isDetached: false,
                id: lnk.id,
            } as IOperationSrcs
        })));
        // add backlink pk
        ops.push(siyuan.transInsertAttrViewBlock(avID, blockID, backLinks.map(bk => {
            return {
                isDetached: false,
                id: bk.blockID,
            } as IOperationSrcs
        })));
        // add concept ref
        ops.push(...siyuan.transUpdateAttrViewCellBatch(linkItems.map((lnk) => {
            const mSelect = new Map()
            mSelect.set(lnk.text, { content: lnk.text, color: genColor() })
            mSelect.set("🏷️", { content: "🏷️" })
            lnk.conceptTree.forEach((i) => {
                mSelect.set(i, { content: i, color: genColor() })
            })
            if (/[0-9]{4}-[0-9]{2}-[0-9]{2}/g.test(lnk.text)) mSelect.set("🗓️", { content: "🗓️" })
            return {
                avID,
                rowID_BlockID: lnk.id,
                colID: mSelectID,
                value: { mSelect: [...mSelect.values()] } as IAVCellValue,
            }
        })));
        // add concept content
        ops.push(...siyuan.transUpdateAttrViewCellBatch(linkItems.map((lnk) => {
            return {
                avID,
                rowID_BlockID: lnk.id,
                colID: contentID,
                value: { text: { content: lnk.text } } as IAVCellValue,
            }
        })));
        // add backlink ref
        ops.push(...siyuan.transUpdateAttrViewCellBatch(backLinks.map(b => {
            const mSelect = new Map()
            block2mSelect.get(b.blockID)?.forEach(e => {
                e.color = genColor()
                mSelect.set(e.content, e)
            })
            block2lnks.get(b.blockID)?.forEach(lnk => {
                lnk.conceptTree.forEach((i) => {
                    mSelect.set(i, { content: i, color: genColor() })
                })
            })
            return {
                avID,
                rowID_BlockID: b.blockID,
                colID: mSelectID,
                value: { mSelect: [...mSelect.values()] } as IAVCellValue,
            }
        })));
        // add backlink content
        ops.push(...siyuan.transUpdateAttrViewCellBatch(backLinks.map(b => {
            return {
                avID,
                rowID_BlockID: b.blockID,
                colID: contentID,
                value: { text: { content: b.bkDiv.textContent } } as IAVCellValue,
            }
        })));
        // add backlink updated
        ops.push(...siyuan.transUpdateAttrViewCellBatch(backLinks.map(b => {
            const content = timeUtil.dateFromYYYYMMDDHHmmssShort(b.backlink.updated).getTime()
            return {
                avID,
                rowID_BlockID: b.blockID,
                colID: updatedID,
                value: { date: { isNotTime: false, hasEndDate: false, isNotEmpty: true, content } } as IAVCellValue,
            }
        })));
        // add backlink created
        ops.push(...siyuan.transUpdateAttrViewCellBatch(backLinks.map(b => {
            const content = timeUtil.dateFromYYYYMMDDHHmmssShort(b.backlink.created).getTime()
            return {
                avID,
                rowID_BlockID: b.blockID,
                colID: createdID,
                value: { date: { isNotTime: false, hasEndDate: false, isNotEmpty: true, content } } as IAVCellValue,
            }
        })));
        // update
        ops.push(siyuan.transDoUpdateUpdated(blockID)); // 可以看见，不需要reload
        await siyuan.transactions(ops);
        siyuan.pushMsg(tomatoI18n.刷新数据库反链 + " done!")
    }

    private dbMenu(protyle: IProtyle, dbDiv: HTMLElement, menu: subMenu, divs: HTMLElement[]) {
        divs = Array.from(divs);
        const targetDocID = dbDiv.getAttribute(DATABASE_BACKLINK)
        if (!targetDocID) return;
        const dbBlockID = dbDiv.getAttribute(DATA_NODE_ID)
        const avID = dbDiv.getAttribute(DATA_AV_ID)
        if (!avID) return;
        menu.addItem({
            label: tomatoI18n.刷新数据库反链,
            iconHTML: "🔄💾",
            accelerator: "F9",
            click: () => {
                this.refreshDBBK(protyle);
            },
        });
        menu.addItem({
            label: tomatoI18n.将选中的内容移到下边,
            iconHTML: "🚚👇",
            accelerator: "",
            click: () => {
                const ids = divs.map(row => row.getAttribute(DATA_ID))
                if (ids.length == 0) return;
                const t = timeUtil.getYYYYMMDDHHmmss();
                const ops = [];
                ops.push(...ids.map(id => {
                    return [
                        ...siyuan.transMoveBlocksAfter([id], dbBlockID),
                        ...siyuan.transInsertBlocksAfter([domNewLine().outerHTML], dbBlockID),
                        siyuan.transDoUpdateUpdated(id, t),
                    ]
                }).flat());
                siyuan.transactions(ops)
                    .then(() => OpenSyFile2(this.plugin, ids[ids.length - 1]))
            },
        });
        let cleanMenu = false;
        let colID = "";
        let blockID = "";
        const refTexts = [];
        for (const row of divs) {
            blockID = row.getAttribute(DATA_ID);
            for (const cell of row.querySelectorAll(`div.av__cell[data-dtype="mSelect"]`)) {
                colID = cell.getAttribute("data-col-id");
                if (!cleanMenu) {
                    cleanMenu = true;
                    menu.addItem({
                        label: "🧹",
                        iconHTML: "",
                        accelerator: "",
                        click: () => {
                            const op = siyuan.transSetAttrViewFilters(avID, blockID, [{
                                operator: "Contains",
                                column: colID,
                                value: { type: "mSelect", "mSelect": [] },
                            }]);
                            siyuan.transactions([op]);
                        },
                    });
                }
                for (const span of cell.querySelectorAll(`span`)) {
                    menu.addItem({
                        label: "🔍" + span.textContent,
                        iconHTML: "",
                        accelerator: "",
                        click: () => {
                            const op = siyuan.transSetAttrViewFilters(avID, blockID, [{
                                operator: "Contains",
                                column: colID,
                                value: {
                                    type: "mSelect",
                                    "mSelect": [{
                                        content: span.textContent,
                                        color: "1",
                                    }]
                                },
                            }]);
                            siyuan.transactions([op]);
                        },
                    });
                    menu.addItem({
                        label: "🚫" + span.textContent,
                        iconHTML: "",
                        accelerator: "",
                        click: () => {
                            siyuan.getAttributeView(avID).then(db => {
                                const filters: IAVFilter[] = db.av.views?.find(i => i.id == db.av.viewID)?.table?.filters ?? [];
                                const newFilters = JSON.parse(JSON.stringify(filters)) as IAVFilter[];
                                const filter = newFilters.find(f => f.column == colID)
                                filter.value.mSelect = filter.value.mSelect.filter(i => i.content != span.textContent)
                                const op1 = siyuan.transSetAttrViewFilters(avID, blockID, newFilters);
                                const op2 = siyuan.transSetAttrViewFilters(avID, blockID, filters);
                                siyuan.transactions([op1], [op2]);
                            })
                        },
                    });
                    refTexts.push(span.textContent)
                }
            }
        }
        menu.addItem({
            label: "🔍💯" + refTexts.join(",").slice(0, 20) + "...",
            iconHTML: "",
            accelerator: "",
            click: () => {
                const op = siyuan.transSetAttrViewFilters(avID, blockID, [{
                    operator: "Contains",
                    column: colID,
                    value: {
                        type: "mSelect",
                        "mSelect": refTexts.map(r => {
                            return {
                                content: r,
                                color: "1",
                            }
                        })
                    },
                }]);
                siyuan.transactions([op]);
            },
        });
    }
}

let colorIdx = 1;

function genColor(num?: number) {
    if (num != null) {
        return ((num || 0) % 13 + 1).toString();
    } else {
        return (colorIdx++ % 13 + 1).toString();
    }
}

export const dbBkBox = new DbBkBox();
