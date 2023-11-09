import { Plugin, openTab } from "siyuan";
import {
    getDocIDByBlockID, getRowByID, getNotebookConf,
    removeBookmarks, addBookmark, addRiffCards, findListType,
    deleteBlocks, moveBlocks, removeBrokenCards, pushMsg, sleep, getFile, lsNotebooks,
    findBookOpennedFirst, openNotebook,
    clearAll, insertBlockAsChildOf, sql, createDocWithMdIfNotExists, listDocsByPath
} from './utils';
import "./index.scss";


class ToolBox {
    private lastBlockID: string;
    private boxID: string;
    private plugin: Plugin;
    private timeoutID: number;
    private contentIDs: { [key: string]: string[] };

    onload(plugin: Plugin) {
        this.contentIDs = {}
        this.plugin = plugin
        this.plugin.eventBus.on("click-editorcontent", ({ detail }: any) => {
            this.lastBlockID = detail?.event?.srcElement?.parentElement?.getAttribute("data-node-id") ?? this.lastBlockID
            this.boxID = detail?.protyle?.notebookId ?? this.boxID
        });
        this.plugin.eventBus.on("open-menu-doctree", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID
        });
        this.plugin.eventBus.on("loaded-protyle-static", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID
        });
        this.plugin.eventBus.on("loaded-protyle-dynamic", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID
        });
        this.plugin.eventBus.on("switch-protyle", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID
        });
        this.plugin.eventBus.on("destroy-protyle", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID
        });
        this.plugin.addCommand({
            langKey: "addFlashCard",
            hotkey: "⌘1",
            globalCallback: async () => {
                await this.addFlashCard()
            },
        });
        this.plugin.addCommand({
            langKey: "addBookmark",
            hotkey: "⌘2",
            globalCallback: async () => {
                await this.addReadPoint()
            },
        });
        this.plugin.addCommand({
            langKey: "removeBrokenCards",
            hotkey: "",
            globalCallback: async () => {
                const ids = await removeBrokenCards()
                if (ids.length) {
                    pushMsg(`${this.plugin.i18n.removedBrokenCards}${ids}`)
                } else {
                    pushMsg(this.plugin.i18n.thereIsNoInvalidCards)
                }
            },
        });
        this.plugin.addCommand({
            langKey: "deleteBlocks",
            hotkey: "",
            globalCallback: async () => {
                const docID = await deleteBlocks()
                if (docID) {
                    openTab({
                        app: this.plugin.app,
                        doc: { id: docID },
                    })
                } else {
                    pushMsg(this.plugin.i18n.deleteBlocksHelp, 0)
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
                    })
                    if (doc1 !== doc2) {
                        openTab({
                            app: this.plugin.app,
                            doc: { id: doc2 },
                        })
                    }
                } else
                    pushMsg(this.plugin.i18n.moveBlocksHelp, 0)
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
                    })
                    if (doc1 !== doc2) {
                        openTab({
                            app: this.plugin.app,
                            doc: { id: doc2 },
                        })
                    }
                } else
                    pushMsg(this.plugin.i18n.moveBlocksHelp, 0)
            },
        });
        this.plugin.addTopBar({
            icon: "iconContents",
            title: this.plugin.i18n.topBarTitleShowContents,
            position: "right",
            callback: () => {
                this.showContents()
            }
        });
    }

    private async setNotebookID() {
        const localCfg = await getFile("/data/storage/local.json")
        this.boxID = localCfg["local-dailynoteid"] ?? ""
        this.boxID = findBookOpennedFirst(this.boxID, await lsNotebooks(false))
        if (!this.boxID) {
            this.boxID = findBookOpennedFirst(this.boxID, await lsNotebooks(true))
            if (!this.boxID) {
                console.log("there is no notebook!")
                return
            }
        }
        const cfg = await getNotebookConf(this.boxID)
        if (cfg.conf.closed) {
            await openNotebook(this.boxID)
            await sleep(3000)
        }
        return cfg;
    }

    private async insertContents(docID: string) {
        const resp = await listDocsByPath(this.boxID, "/", 256)
        resp.files.reverse()
        for (const file of resp.files) {
            const fromWhere = `from blocks where path like '${file.path.replace(/\.sy$/, "")}%' and box='${this.boxID}' and ial like '%bookmark=%'`
            const rows = await sql(`select id ${fromWhere} limit 1`)
            if (rows.length > 0) {
                const sqlStr = `select * ${fromWhere} order by updated desc`
                await insertBlockAsChildOf(`{{${sqlStr}}}`, docID)
                await insertBlockAsChildOf(`###### ${file.name.replace(/\.sy$/, "")}`, docID)
            }
        }
    }

    private async showContents() {
        if (!this.boxID) {
            await this.setNotebookID()
        }
        if (!this.contentIDs[this.boxID]) {
            this.contentIDs[this.boxID] = []
        }
        const cfg = await getNotebookConf(this.boxID)
        const sqlStr = `select id from blocks where box='${this.boxID}' and ial like '%bookmark=%' limit 1`
        const rows = await sql(sqlStr)
        if (rows.length > 0) {
            let docID = ""
            if (this.contentIDs[this.boxID].length > 0) {
                this.contentIDs[this.boxID] = this.contentIDs[this.boxID].slice(-1)
                docID = this.contentIDs[this.boxID][0]
            } else {
                docID = await createDocWithMdIfNotExists(this.boxID, "/📚" + cfg.name, "");
                this.contentIDs[this.boxID].push(docID)
            }
            await clearAll(docID)
            await this.insertContents(docID)
            openTab({
                app: this.plugin.app,
                doc: { id: docID },
            })
        } else {
            try {
                pushMsg(cfg.name + this.plugin.i18n.thereIsNoBookmark)
            } catch (e) {
                console.log(e)
                this.boxID = ""
            }
        }
    }

    private async addFlashCard() {
        if (!this.lastBlockID) {
            pushMsg(this.plugin.i18n.clickOneBlockFirst)
            return
        }
        const id = this.lastBlockID;
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
        if (!this.lastBlockID) {
            pushMsg(this.plugin.i18n.clickOneBlockFirst)
            return
        }
        const id = this.lastBlockID
        const docID = await getDocIDByBlockID(id);

        const docInfo = await getRowByID(docID);
        const path: Array<string> = docInfo['hpath'].split("/");
        path.pop()
        let title = path[path.length - 1]
        if (title === "") {
            const boxConf = await getNotebookConf(docInfo['box'])
            title = boxConf['name']
        }
        await addBookmark(id, title);
        clearTimeout(this.timeoutID)
        this.timeoutID = setTimeout(async () => {
            await removeBookmarks(docID, id);
        }, 1000);
    }
}

export const toolBox = new ToolBox();
