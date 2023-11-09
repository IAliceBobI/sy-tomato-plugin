import { Plugin, openTab } from "siyuan";
import { getDocIDByBlockID, getRowByID, getNotebookConf, removeBookmarks, addBookmark, addRiffCards, findListType, deleteBlocks, moveBlocks, removeBrokenCards, pushMsg, sleep, getFile, lsNotebooks, findBookOpennedFirst, openNotebook, createDocWithMdIfNotExists, createDocWithMd, clearAll, insertBlockAsChildOf } from './utils';
import "./index.scss";


class ToolBox {
    private lastBlockID: string;
    private lastNotebookID: string;
    private plugin: Plugin;
    private timeoutID: number;

    onload(plugin: Plugin) {
        this.plugin = plugin
        this.plugin.eventBus.on("click-editorcontent", ({ detail }: any) => {
            this.lastBlockID = detail?.event?.srcElement?.parentElement?.getAttribute("data-node-id") ?? this.lastBlockID
            this.lastNotebookID = detail?.protyle?.notebookId ?? this.lastNotebookID
        });
        this.plugin.eventBus.on("open-menu-doctree", ({ detail }: any) => {
            this.lastNotebookID = detail?.protyle?.notebookId ?? this.lastNotebookID
        });
        this.plugin.eventBus.on("loaded-protyle-static", ({ detail }: any) => {
            this.lastNotebookID = detail?.protyle?.notebookId ?? this.lastNotebookID
        });
        this.plugin.eventBus.on("loaded-protyle-dynamic", ({ detail }: any) => {
            this.lastNotebookID = detail?.protyle?.notebookId ?? this.lastNotebookID
        });
        this.plugin.eventBus.on("switch-protyle", ({ detail }: any) => {
            this.lastNotebookID = detail?.protyle?.notebookId ?? this.lastNotebookID
        });
        this.plugin.eventBus.on("destroy-protyle", ({ detail }: any) => {
            this.lastNotebookID = detail?.protyle?.notebookId ?? this.lastNotebookID
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
                if (await deleteBlocks())
                    window.location.reload()
                else {
                    pushMsg(this.plugin.i18n.deleteBlocksHelp, 0)
                }
            },
        });
        this.plugin.addCommand({
            langKey: "moveBlocks",
            hotkey: "",
            globalCallback: async () => {
                if (await moveBlocks(false))
                    window.location.reload()
                else
                    pushMsg(this.plugin.i18n.moveBlocksHelp, 0)

            },
        });
        this.plugin.addCommand({
            langKey: "copyBlocks",
            hotkey: "",
            globalCallback: async () => {
                if (await moveBlocks(true))
                    window.location.reload()
                else
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

    private async showContents() {
        if (!this.lastNotebookID) {
            const localCfg = await getFile("/data/storage/local.json")
            this.lastNotebookID = localCfg["local-dailynoteid"] ?? ""
            this.lastNotebookID = findBookOpennedFirst(this.lastNotebookID, await lsNotebooks(false))
            if (!this.lastNotebookID) {
                console.log("there is no openned notebook!")
                return
            }
            await openNotebook(this.lastNotebookID)
        }
        const docID = await createDocWithMdIfNotExists(this.lastNotebookID, "/📚📚📚", "");
        await clearAll(docID)
        const markdown = `{{select * from blocks where ial like '%bookmark=%' order by updated desc }}`;
        await insertBlockAsChildOf(markdown, docID)
        openTab({
            app: this.plugin.app,
            doc: { id: docID },
        })
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
