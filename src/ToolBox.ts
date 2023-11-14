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
import utils from "./utils";

const CreateDocLock = "CreateDocLock";
const AddReadingPointLock = "AddReadingPointLock";

class ToolBox {
    private static readonly GLOBAL_THIS: Record<string, any> = globalThis;
    private plugin: Plugin;

    onload(plugin: Plugin) {
        ToolBox.GLOBAL_THIS["toolBox_zZmqus5PtYRi"] = this;
        ToolBox.GLOBAL_THIS["toolBoxUtils_zZmqus5PtYRi"] = utils;
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
                navigator.locks.request(AddReadingPointLock, { ifAvailable: true }, async (lock) => {
                    if (lock) {
                        await this.addReadPoint();
                        await sleep(2000);
                    } else {
                        pushMsg(this.plugin.i18n.wait4finish);
                    }
                });
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
                await this.showContentsWithLock();
            },
        });
        this.plugin.addTopBar({
            icon: "iconContents",
            title: this.plugin.i18n.topBarTitleShowContents,
            position: "right",
            callback: async () => {
                await this.showContentsWithLock();
            }
        });
    }

    private async setNotebookID() {
        const localCfg = await getFile("/data/storage/local.json");
        events.boxID = localCfg["local-dailynoteid"] ?? "";
        events.boxID = findBookOpennedFirst(events.boxID, await lsNotebooks(false));
        try {
            await getNotebookConf(events.boxID);
        } catch (e) {
            await openNotebook(events.boxID);
            await sleep(3000);
        }
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

    private async showContentsWithLock() {
        navigator.locks.request(CreateDocLock, { ifAvailable: true }, async (lock) => {
            if (lock) {
                await this.showContents();
                await sleep(4000);
            }
        });
    }
    private async showContents() {
        if (!events.boxID) {
            await this.setNotebookID();
        }
        const cfg = await getNotebookConf(events.boxID);
        const sqlStr = `select id from blocks where box='${events.boxID}' and ial like '%bookmark=%' limit 1`;
        const rows = await sql(sqlStr);
        if (rows.length > 0) {
            const docID = await createDocWithMdIfNotExists(events.boxID, "/📚" + cfg.name, "");
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
        let md = "";
        while (count > 0) {
            count -= 1;
            const [listID, mdret] = await findListType(id);
            md = mdret;
            if (listID) {
                await addRiffCards([listID]);
                break;
            }
            await sleep(200);
        }
        if (count <= 0) {
            pushMsg(md + "<br>" + this.plugin.i18n.reindex, 0);
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
        await removeBookmarks(docID, id);
    }
}

export const toolBox = new ToolBox();
