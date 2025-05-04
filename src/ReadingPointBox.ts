import { Siyuan, add_href, cleanText, getBlockDiv, getID, newID, removeSiyuanLnks, siyuan, siyuanCache, sleep, timeUtil } from "./libs/utils";
import "./index.scss";
import { events } from "./libs/Events";
import { BlockNodeEnum, DATA_NODE_ID, DATA_SUBTYPE, DATA_TYPE, IN_BOOK_INDEX, MarkKey, PARAGRAPH_INDEX, READINGPOINT, RefIDKey, SiyuanNotebook } from "./libs/gconst";
import { zipNways } from "./libs/functional";
import { getBookID } from "./libs/progressive";
import { gotoBookmark, removeReadingPoint } from "./libs/bookmark";
import { Md5 } from "ts-md5";
import { domBlankLine, domHdeading, domLnk, domNewLine, DomSuperBlockBuilder } from "./libs/sydom";
import { OpenSyFile2 } from "./libs/docUtils";
import { readingAdd2Card, readingDialog, readingPointBoxCheckbox, readingPointWithEnv, readingSaveFile, readingTopBar, storeNoteBox_selectedNotebook } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import ReadingPoint from "./ReadingPoint.svelte"
import { DestroyManager } from "./libs/destroyer";
import { Dialog } from "siyuan";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { verifyKeyTomato } from "./libs/user";

export type RPType = { dom: string, row?: Block, line?: string };

class ReadingPointBox {
    private plugin: BaseTomatoPlugin;
    private rpDocID = "";
    private lastDocID: string;

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
        if (!readingPointBoxCheckbox.get()) {
            return;
        }
        this.plugin = plugin;

        if (readingTopBar.get()) {
            plugin.addTopBar({
                icon: "iconBookmark",
                title: plugin.i18n.topBarTitleShowContents,
                position: "left",
                callback: async () => {
                    await this.showContentsWithLock();
                }
            });
        }

        if (readingSaveFile.get() && !readingDialog.get()) { // 统一保存到文件
            siyuan
                .sqlOne(`select id from blocks where type='d' and content="${readingSaveFile.get()}" limit 1`)
                .then(b => {
                    this.rpDocID = b?.id;
                })
        }

        this.plugin.addCommand({
            langKey: "addBookmark",
            hotkey: "⌘2",
            callback: async () => {
                const { selected, ids } = await events.selectedDivs();
                for (const [div, id] of zipNways(selected, ids)) {
                    this.addReadPointLock(id, div);
                    break;
                }
            },
        });

        this.plugin.addCommand({
            langKey: "showBookmarks",
            hotkey: "⌘4",
            callback: async () => {
                await this.showContentsWithLock();
            },
        });
        this.plugin.addCommand({
            langKey: "gotoBookmark",
            hotkey: "F7",
            callback: async () => {
                gotoBookmark(events.docID, this.plugin);
            },
        });
        this.plugin.addCommand({
            langKey: "deleteBookmark",
            hotkey: "⌘F7",
            callback: async () => {
                removeReadingPoint(events.docID);
            },
        });

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            menu.addItem({
                label: this.plugin.i18n.addBookmark,
                iconHTML: "🍅＋🔖",
                accelerator: "⌘2",
                click: () => {
                    const blockID = detail?.element?.getAttribute("data-node-id") ?? "";
                    if (blockID) {
                        this.addReadPointLock(blockID, detail?.element);
                    }
                },
            });
            menu.addItem({
                label: this.plugin.i18n.gotoBookmark,
                iconHTML: "🍅🕊️🔖",
                accelerator: "F7",
                click: () => {
                    gotoBookmark(events.docID, this.plugin);
                },
            });
            menu.addItem({
                label: this.plugin.i18n.deleteBookmark,
                iconHTML: "🍅🗑️🔖",
                accelerator: "",
                click: () => {
                    removeReadingPoint(events.docID);
                },
            });
        });
    }

    blockIconEvent(detail: any) {
        if (!this.plugin) return;
        detail.menu.addItem({
            iconHTML: "🍅＋🔖",
            label: this.plugin.i18n.addBookmark,
            accelerator: "⌘2",
            click: () => {
                for (const element of detail.blockElements) {
                    const blockID = getID(element);
                    if (blockID) {
                        this.addReadPointLock(blockID, element);
                        break;
                    }
                }
            }
        });
        detail.menu.addItem({
            iconHTML: "🍅🕊️🔖",
            label: this.plugin.i18n.gotoBookmark,
            accelerator: "F7",
            click: () => {
                gotoBookmark(events.docID, this.plugin);
            },
        });
    }

    addReadPointLock(blockID: string, div: HTMLElement) {
        navigator.locks.request("AddReadingPointLock2024-11-25 21:02:37", { ifAvailable: true }, async (lock) => {
            if (lock) {
                const run = async () => {
                    siyuan.pushMsg(tomatoI18n.正在添加阅读点, 2000);
                    await this.addReadPoint(blockID, div);
                    await sleep(1000);
                }
                if (div.getAttribute(DATA_TYPE) == BlockNodeEnum.NODE_HEADING
                    || div.getAttribute(DATA_TYPE) == BlockNodeEnum.NODE_PARAGRAPH
                    || div.getAttribute(DATA_TYPE) == BlockNodeEnum.NODE_CODE_BLOCK
                    || div.getAttribute(DATA_TYPE) == BlockNodeEnum.NODE_MATH_BLOCK
                    || div.getAttribute(DATA_TYPE) == BlockNodeEnum.NODE_TABLE
                ) {
                    await run();
                    return;
                }
                div = div.querySelector(`[${DATA_TYPE}="${BlockNodeEnum.NODE_PARAGRAPH}"]`) as HTMLElement;
                if (div) {
                    blockID = div.getAttribute(DATA_NODE_ID)
                    await run();
                    return;
                }
            } else {
                siyuan.pushMsg(this.plugin.i18n.wait4finish);
            }
        });
    }

    private async insertContents(docID: string, noteCfg: SiyuanNotebook) {
        const taskAttrs = siyuan.getBlockAttrs(docID);
        const md5 = new Md5();
        const { doms } = await this.getReadingPointRows(md5, noteCfg);
        const hash = md5.end().toString();
        const attrs = await taskAttrs;
        if (hash !== attrs["custom-tomato-rp-content-hash"]) {
            const ops = [];

            const newAttr = {} as AttrType;
            newAttr["custom-tomato-rp-content-hash"] = hash;
            newAttr["custom-sy-readonly"] = "";
            newAttr["custom-off-tomatobacklink"] = "1";
            ops.push(...siyuan.transbatchSetBlockAttrs([{ id: docID, attrs: newAttr }]));

            ops.push(...await siyuan.getChildBlocks(docID)
                .then(blocks => siyuan.transDeleteBlocks(blocks.map(b => b.id))));
            ops.push(...siyuan.transInsertBlocksAsChildOf(doms.map(i => i.dom), docID));
            await siyuan.transactions(ops);
            await siyuan.pushMsg(tomatoI18n.更新阅读点目录, 2000);
        } else {
            await siyuan.pushMsg(tomatoI18n.阅读点目录已是最新, 2000);
        }
    }

    private async getReadingPointRows(md5: Md5, noteCfg: SiyuanNotebook) {
        const doms: RPType[] = [];
        const rows = await siyuan.sql(`select id,hpath,content from blocks where id in 
            (select block_id from attributes where name="bookmark" and value!="🛑 Suspended Cards")
        `);
        if (rows?.length > 0) {
            let i = 1;
            for (const row of rows) {
                const h = `${noteCfg.name}${row.hpath}`
                md5?.appendStr(h);
                doms.push({ dom: domHdeading(null, h, "h6") })
                const l = `【${i++}】` + removeSiyuanLnks(row.content);
                md5?.appendStr(l);
                doms.push({ dom: domLnk(null, row.id, l), row, line: domBlankLine(null, l) })
            }
        }
        return { doms }
    }

    private async showContentsWithLock() {
        navigator.locks.request("CreateDocLock2024-11-25 21:02:52", { ifAvailable: true }, async (lock) => {
            if (lock) {
                if (readingDialog.get()) {
                    const { cfg } = await getContentsDocID(false);
                    this.showDialog(cfg);
                } else {
                    if (this.rpDocID) {
                        OpenSyFile2(this.plugin, this.rpDocID);
                    } else {
                        const { docID, cfg } = await getContentsDocID();
                        if (docID) {
                            OpenSyFile2(this.plugin, docID);
                            await this.insertContents(docID, cfg);
                        }
                    }
                }
            }
        });
    }

    private async showDialog(noteCfg: SiyuanNotebook) {
        const { doms } = await this.getReadingPointRows(null, noteCfg);
        const dm = new DestroyManager();
        const id = newID();
        const dialog = new Dialog({
            title: tomatoI18n.阅读点,
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : "700px",
            height: events.isMobile ? "180vw" : "700px",
            destroyCallback: () => {
                dm.destroyBy("1")
            },
        });
        const d = new ReadingPoint({
            target: dialog.element.querySelector("#" + id),
            props: {
                plugin: this.plugin,
                dialog,
                dm,
                doms,
            }
        });
        dm.add("1", () => { dialog.destroy() })
        dm.add("2", () => { d.$destroy() })
    }

    private async addReadPoint(blockID: string, div: HTMLElement) {
        if (!blockID) blockID = events.lastBlockID;
        if (!blockID) {
            siyuan.pushMsg(this.plugin.i18n.clickOneBlockFirst);
            return;
        }
        const docInfo = await siyuan.getDocRowByBlockID(blockID)
        const docID = docInfo.id;
        if (!docInfo["hpath"]) return;
        const path: Array<string> = docInfo["hpath"].split("/");
        path.pop();
        let title = path[path.length - 1];
        if (title === "") {
            const boxConf = await siyuan.getNotebookConf(docInfo["box"]);
            title = boxConf["name"];
        }

        let { bookID } = await getBookID(docID);
        if (!bookID) bookID = docID;
        const oldIDs = await findAllReadingPoints(bookID) ?? [];
        await this.addCardReadingPoint(blockID, div, docInfo, title, bookID, oldIDs);
    }

    private async addCardReadingPoint(blockID: string, div: HTMLElement, docInfo: Block, title: string, bookID: string, oldIDs: string[]) {
        const list = new DomSuperBlockBuilder();
        {
            const line = domNewLine(tomatoI18n.阅读点);
            add_href(line, blockID, docInfo.content);
            list.append(line)
        }
        if (cleanText(div.textContent)) {
            list.append(domNewLine(`${div.textContent}`))
        }

        let contentsName = readingSaveFile.get();
        if (!this.rpDocID) {
            const { rpDocName } = await getContentsDocID(false);
            contentsName = rpDocName
        }
        if (readingPointWithEnv.get() && await verifyKeyTomato()) {
            await addEnv(docInfo, contentsName, list);
        }
        if (oldIDs && oldIDs.length > 0) {
            const id = oldIDs.pop();
            const domStr = await getDomStr(id, list);
            const ops = siyuan.transDeleteBlocks(oldIDs);

            if (this.rpDocID) {
                ops.push(...siyuan.transMoveBlocksAsChild([id], this.rpDocID));
            } else {
                ops.push(...siyuan.transMoveBlocksAfter([id], blockID));
            }

            ops.push(...siyuan.transUpdateBlocks([{ id, domStr }]));
            ops.push(...siyuan.transbatchSetBlockAttrs([{ id, attrs: { "bookmark": title, "custom-tomato-readingpoint": bookID } as AttrType }]));
            ops.push(siyuan.transRemoveRiffCards(oldIDs));
            if (readingAdd2Card.get()) {
                ops.push(siyuan.transRemoveRiffCards(oldIDs));
                ops.push(siyuan.transAddRiffCards([id]));
                // Rating 描述了闪卡复习的评分。
                // type Rating int8
                // const (
                //     Again Rating = iota + 1 // 完全不会，必须再复习一遍
                //     Hard                    // 有点难
                //     Good                    // 一般
                //     Easy                    // 很容易
                // )
                await siyuan.reviewRiffCardByBlockID(id, 2);
                const due = timeUtil.getYYYYMMDDHHmmss(timeUtil.nowts());
                await siyuan.batchSetRiffCardsDueTimeByBlockID([{ id, due }]);
            }
            ops.push(siyuan.transDoUpdateUpdated(id));
            await siyuan.transactions(ops).then(() => {
                if (!this.lastDocID || this.lastDocID != docInfo.id) {
                    this.lastDocID = docInfo.id;
                    events.protyleReload()
                }
            })
        } else {
            const div = list.build()
            div.setAttribute("bookmark", title)
            div.setAttribute(READINGPOINT, bookID)
            if (this.rpDocID) {
                await siyuan.insertBlocksAsChildOf([div.outerHTML], this.rpDocID);
            } else {
                await siyuan.insertBlocksAfter([div.outerHTML], blockID);
            }
            if (readingAdd2Card.get()) {
                setTimeout(() => siyuan.addRiffCards([list.id]), 800);
            }
        }
    }
}

export const readingPointBox = new ReadingPointBox();

async function findAllReadingPoints(bookID: string) {
    const rows = await siyuan.sqlAttr(`select block_id from attributes where name="${READINGPOINT}" and value="${bookID}"`);
    const ids = rows.map(r => r.block_id);
    return ids;
}

async function addEnv(docInfo: Block, rpDocName: string, list: DomSuperBlockBuilder) {
    const docIDs = [...document.body.querySelectorAll("div.protyle-title.protyle-wysiwyg--attr")].map(e => e.getAttribute(DATA_NODE_ID));
    [...document.body.querySelectorAll("li[data-initdata]")].forEach(e => {
        const d = e.getAttribute("data-initdata");
        const title = e.querySelector(".item__text")?.textContent;
        const j: DocTabInitData = JSON.parse(d);
        if (d && j) {
            docIDs.push(j.rootId);
            events.readingPointMap.set(j.rootId, {
                docID: j.rootId, blockID: j.blockId, title, time: new Date(),
            });
        }
    });
    for (const docIDInPage of docIDs) {
        const doc = events.readingPointMap.get(docIDInPage);
        if (docInfo.id == docIDInPage) continue;
        if (doc.title == rpDocName) continue;
        let bID = doc.blockID;
        if (bID) {
            const docIDQuery = await siyuan.getDocIDByBlockID(bID);
            if (docIDQuery != docIDInPage) bID = "";
        }
        if (doc) {
            const line = domNewLine();
            add_href(line, doc.docID, doc.title ?? "[[Doc]]");
            if (bID) {
                add_href(line, bID, `[[${tomatoI18n.光标}]]`);
            }
            list.append(line);
        }
    }
}

async function getDomStr(id: string, list: DomSuperBlockBuilder) {
    const div = list.build();
    const { div: oldDiv } = await getBlockDiv(id);
    if (!oldDiv) return "<div></div>";
    oldDiv.getAttributeNames().forEach(name => {
        if (name == MarkKey) return;
        if (name == RefIDKey) return;
        if (name == PARAGRAPH_INDEX) return;
        if (name == IN_BOOK_INDEX) return;
        if (name == DATA_TYPE) return;
        if (name == DATA_SUBTYPE) return;
        if (name == "class") return;
        div.setAttribute(name, oldDiv.getAttribute(name));
    });
    return div.outerHTML;
}

async function getContentsDocID(create = true) {
    let boxID = storeNoteBox_selectedNotebook.getOr();
    const cfg = Siyuan.notebooks.find(v => v.id == boxID);
    if (!boxID || !cfg || cfg.closed) {
        await siyuan.pushMsg(tomatoI18n.请先打开笔记本);
        return {};
    }
    const rpDocName = "📚" + cfg.name;
    let docID = "";
    if (create) {
        docID = await siyuanCache.createDocWithMdIfNotExists(5000, boxID, "/" + rpDocName, "", { "custom-off-tomatobacklink": "1" });
    }
    return { docID, cfg, rpDocName }
}