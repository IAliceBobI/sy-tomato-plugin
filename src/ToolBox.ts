import { Plugin, openTab } from "siyuan";
import { siyuan, sleep, findBookOpennedFirst } from "./utils";
import "./index.scss";
import { events } from "./Events";
import * as utils from "./utils";

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
                        siyuan.pushMsg(this.plugin.i18n.wait4finish);
                    }
                });
            },
        });
        this.plugin.addCommand({
            langKey: "removeBrokenCards",
            hotkey: "",
            globalCallback: async () => {
                const ids = await siyuan.removeBrokenCards();
                if (ids.length) {
                    siyuan.pushMsg(`${this.plugin.i18n.removedBrokenCards}${ids}`);
                } else {
                    siyuan.pushMsg(this.plugin.i18n.thereIsNoInvalidCards);
                }
            },
        });
        this.plugin.addCommand({
            langKey: "deleteBlocks",
            hotkey: "",
            globalCallback: async () => {
                const docID = await siyuan.deleteBlocks();
                if (docID) {
                    openTab({
                        app: this.plugin.app,
                        doc: { id: docID },
                    });
                } else {
                    siyuan.pushMsg(this.plugin.i18n.deleteBlocksHelp, 0);
                }
            },
        });
        this.plugin.addCommand({
            langKey: "moveBlocks",
            hotkey: "",
            globalCallback: async () => {
                const [doc1, doc2] = await siyuan.moveBlocks(false);
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
                    siyuan.pushMsg(this.plugin.i18n.moveBlocksHelp, 0);
            },
        });
        this.plugin.addCommand({
            langKey: "copyBlocks",
            hotkey: "",
            globalCallback: async () => {
                const [doc1, doc2] = await siyuan.moveBlocks(true);
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
                    siyuan.pushMsg(this.plugin.i18n.moveBlocksHelp, 0);
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
        const localCfg = await siyuan.getFile("/data/storage/local.json");
        events.boxID = localCfg["local-dailynoteid"] ?? "";
        events.boxID = findBookOpennedFirst(events.boxID, await siyuan.lsNotebooks(false));
        try {
            await siyuan.getNotebookConf(events.boxID);
        } catch (e) {
            await siyuan.openNotebook(events.boxID);
            await sleep(3000);
        }
    }

    private async insertContents(docID: string) {
        const resp = await siyuan.listDocsByPath(events.boxID, "/", 256);
        resp.files.reverse();
        for (const file of resp.files) {
            const fromWhere = `from blocks where path like '${file.path.replace(/\.sy$/, "")}%' and box='${events.boxID}' and ial like '%bookmark=%'`;
            const rows = await siyuan.sql(`select id ${fromWhere} limit 1`);
            if (rows.length > 0) {
                const sqlStr = `select * ${fromWhere} order by updated desc`;
                await siyuan.insertBlockAsChildOf(`{{${sqlStr}}}`, docID);
                await siyuan.insertBlockAsChildOf(`###### ${file.name.replace(/\.sy$/, "")}`, docID);
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
        const cfg = await siyuan.getNotebookConf(events.boxID);
        const sqlStr = `select id from blocks where box='${events.boxID}' and ial like '%bookmark=%' limit 1`;
        const rows = await siyuan.sql(sqlStr);
        if (rows.length > 0) {
            const docID = await siyuan.createDocWithMdIfNotExists(events.boxID, "/📚" + cfg.name, "");
            await siyuan.clearAll(docID);
            await this.insertContents(docID);
            openTab({
                app: this.plugin.app,
                doc: { id: docID },
            });
        } else {
            try {
                siyuan.pushMsg(cfg.name + this.plugin.i18n.thereIsNoBookmark);
            } catch (e) {
                console.log(e);
                events.boxID = "";
            }
        }
    }

    private async addFlashCard() {
        if (!events.lastBlockID) {
            siyuan.pushMsg(this.plugin.i18n.clickOneBlockFirst);
            return;
        }
        const id = events.lastBlockID;
        let count = 30;
        let md = "";
        while (count > 0) {
            count -= 1;
            const [listID, mdret] = await siyuan.findListType(id);
            md = mdret;
            if (listID) {
                await siyuan.addRiffCards([listID]);
                break;
            }
            await sleep(200);
        }
        if (count <= 0) {
            siyuan.pushMsg(md + "<br>" + this.plugin.i18n.reindex, 0);
        }
    }

    private async addReadPoint() {
        if (!events.lastBlockID) {
            siyuan.pushMsg(this.plugin.i18n.clickOneBlockFirst);
            return;
        }
        const id = events.lastBlockID;
        const docID = await siyuan.getDocIDByBlockID(id);

        const docInfo = await siyuan.getRowByID(docID);
        if (!docInfo["hpath"]) return;
        const path: Array<string> = docInfo["hpath"].split("/");
        path.pop();
        let title = path[path.length - 1];
        if (title === "") {
            const boxConf = await siyuan.getNotebookConf(docInfo["box"]);
            title = boxConf["name"];
        }
        await siyuan.addBookmark(id, title);
        await siyuan.removeBookmarks(docID, id);
    }
}

export const toolBox = new ToolBox();
