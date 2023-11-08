import { Plugin } from "siyuan";
import { getDocIDByBlockID, getRowByID, getNotebookConf, removeBookmarks, addBookmark, addRiffCards, findListType, deleteBlocks, moveBlocks, removeBrokenCards, pushMsg } from './utils';
import "./index.scss";


class ToolBox {
    private lastBlockID: string;
    private plugin: Plugin;
    private timeoutID: number;

    onload(plugin: Plugin) {
        this.plugin = plugin
        this.plugin.eventBus.on("click-editorcontent", ({ detail }: any) => {
            let id = detail?.event?.srcElement?.parentElement?.getAttribute("data-node-id")
            this.lastBlockID = id ?? "";
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
                await deleteBlocks()
                window.location.reload()
            },
        });
        this.plugin.addCommand({
            langKey: "moveBlocks",
            hotkey: "",
            globalCallback: async () => {
                await moveBlocks(false)
                window.location.reload()
            },
        });
        this.plugin.addCommand({
            langKey: "copyBlocks",
            hotkey: "",
            globalCallback: async () => {
                await moveBlocks(true)
                window.location.reload()
            },
        });
    }

    private async addFlashCard() {
        if (!this.lastBlockID) {
            pushMsg(this.plugin.i18n.clickOneBlockFirst)
            return
        }
        const id = this.lastBlockID;
        pushMsg(this.plugin.i18n.flashCardWaitForTheIndex)
        setTimeout(async () => {
            const realID = await findListType(id)
            await addRiffCards([realID])
        }, 3000);
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
