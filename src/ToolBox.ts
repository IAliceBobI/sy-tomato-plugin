import { Plugin, openTab } from "siyuan";
import {
    getDocIDByBlockID, getRowByID, getNotebookConf,
    removeBookmarks, addBookmark, addRiffCards, findListType,
    deleteBlocks, moveBlocks, removeBrokenCards, pushMsg, sleep, getFile, lsNotebooks,
    findBookOpennedFirst, openNotebook,
    clearAll, insertBlockAsChildOf, sql, createDocWithMdIfNotExists, listDocsByPath
} from "./utils";
import "./index.scss";
import { events } from "./Events";

class ToolBox {
    private plugin: Plugin;
    private timeoutID: number;
    private contentIDs: { [key: string]: string[] };

    onload(plugin: Plugin) {
        this.contentIDs = {};
        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: "addFlashCard",
            hotkey: "⌘1",
            globalCallback: async () => {
                await this.addFlashCard();
            },
        });
        this.plugin.addCommand({
            langKey: "addBookmark",
            hotkey: "⌘2",
            globalCallback: async () => {
                await this.addReadPoint();
            },
        });
        this.plugin.addCommand({
            langKey: "removeBrokenCards",
            hotkey: "",
            globalCallback: async () => {
                const ids = await removeBrokenCards();
                if (ids.length) {
                    pushMsg(`${this.plugin.i18n.removedBrokenCards}${ids}`);
                } else {
                    pushMsg(this.plugin.i18n.thereIsNoInvalidCards);
                }
            },
        });
        this.plugin.addCommand({
            langKey: "deleteBlocks",
            hotkey: "",
            globalCallback: async () => {
                const docID = await deleteBlocks();
                if (docID) {
                    openTab({
                        app: this.plugin.app,
                        doc: { id: docID },
                    });
                } else {
                    pushMsg(this.plugin.i18n.deleteBlocksHelp, 0);
                }
            },
        });
        this.plugin.addCommand({
            langKey: "moveBlocks",
            hotkey: "",
            globalCallback: async () => {
                const [doc1, doc2] = await moveBlocks(false);
                if (doc1) {
                    openTab({
                        app: this.plugin.app,
                        doc: { id: doc1 },
                    });
                    if (doc1 !== doc2) {
                        openTab({
                            app: this.plugin.app,
                            doc: { id: doc2 },
                        });
                    }
                } else
                    pushMsg(this.plugin.i18n.moveBlocksHelp, 0);
            },
        });
        this.plugin.addCommand({
            langKey: "copyBlocks",
            hotkey: "",
            globalCallback: async () => {
                const [doc1, doc2] = await moveBlocks(true);
                if (doc1) {
                    openTab({
                        app: this.plugin.app,
                        doc: { id: doc1 },
                    });
                    if (doc1 !== doc2) {
                        openTab({
                            app: this.plugin.app,
                            doc: { id: doc2 },
                        });
                    }
                } else
                    pushMsg(this.plugin.i18n.moveBlocksHelp, 0);
            },
        });
        this.plugin.addCommand({
            langKey: "showBookmarks",
            hotkey: "⌘4",
            globalCallback: async () => {
                this.showContents();
            },
        });
        this.plugin.addTopBar({
            icon: "iconContents",
            title: this.plugin.i18n.topBarTitleShowContents,
            position: "right",
            callback: () => {
                this.showContents();
            }
        });
    }

    private async setNotebookID() {
        const localCfg = await getFile("/data/storage/local.json");
        events.boxID = localCfg["local-dailynoteid"] ?? "";
        events.boxID = findBookOpennedFirst(events.boxID, await lsNotebooks(false));
        if (!events.boxID) {
            events.boxID = findBookOpennedFirst(events.boxID, await lsNotebooks(true));
            if (!events.boxID) {
                console.log("there is no notebook!");
                return;
            }
        }
        const cfg = await getNotebookConf(events.boxID);
        if (cfg.conf.closed) {
            await openNotebook(events.boxID);
            await sleep(3000);
        }
        return cfg;
    }

    private async insertContents(docID: string) {
        const resp = await listDocsByPath(events.boxID, "/", 256);
        resp.files.reverse();
        for (const file of resp.files) {
            const fromWhere = `from blocks where path like '${file.path.replace(/\.sy$/, "")}%' and box='${events.boxID}' and ial like '%bookmark=%'`;
            const rows = await sql(`select id ${fromWhere} limit 1`);
            if (rows.length > 0) {
                const sqlStr = `select * ${fromWhere} order by updated desc`;
                await insertBlockAsChildOf(`{{${sqlStr}}}`, docID);
                await insertBlockAsChildOf(`###### ${file.name.replace(/\.sy$/, "")}`, docID);
            }
        }
    }

    private async showContents() {
        if (!events.boxID) {
            await this.setNotebookID();
        }
        if (!this.contentIDs[events.boxID]) {
            this.contentIDs[events.boxID] = [];
        }
        const cfg = await getNotebookConf(events.boxID);
        const sqlStr = `select id from blocks where box='${events.boxID}' and ial like '%bookmark=%' limit 1`;
        const rows = await sql(sqlStr);
        if (rows.length > 0) {
            let docID = "";
            if (this.contentIDs[events.boxID].length > 0) {
                this.contentIDs[events.boxID] = this.contentIDs[events.boxID].slice(-1);
                docID = this.contentIDs[events.boxID][0];
            } else {
                docID = await createDocWithMdIfNotExists(events.boxID, "/📚" + cfg.name, "");
                this.contentIDs[events.boxID].push(docID);
            }
            await clearAll(docID);
            await this.insertContents(docID);
            openTab({
                app: this.plugin.app,
                doc: { id: docID },
            });
        } else {
            try {
                pushMsg(cfg.name + this.plugin.i18n.thereIsNoBookmark);
            } catch (e) {
                console.log(e);
                events.boxID = "";
            }
        }
    }

    private async addFlashCard() {
        if (!events.lastBlockID) {
            pushMsg(this.plugin.i18n.clickOneBlockFirst);
            return;
        }
        const id = events.lastBlockID;
        let count = 30;
        while (count > 0) {
            count -= 1;
            const listID = await findListType(id);
            if (listID) {
                await addRiffCards([listID]);
                break;
            }
            await sleep(200);
        }
    }

    private async addReadPoint() {
        if (!events.lastBlockID) {
            pushMsg(this.plugin.i18n.clickOneBlockFirst);
            return;
        }
        const id = events.lastBlockID;
        const docID = await getDocIDByBlockID(id);

        const docInfo = await getRowByID(docID);
        if (!docInfo["hpath"]) return;
        const path: Array<string> = docInfo["hpath"].split("/");
        path.pop();
        let title = path[path.length - 1];
        if (title === "") {
            const boxConf = await getNotebookConf(docInfo["box"]);
            title = boxConf["name"];
        }
        await addBookmark(id, title);
        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(async () => {
            await removeBookmarks(docID, id);
        }, 1000);
    }
}

export const toolBox = new ToolBox();
