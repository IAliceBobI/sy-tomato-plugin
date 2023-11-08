import { Plugin, } from "siyuan";
import { getDocIDByBlockID, getRowByID, getNotebookConf, removeBookmarks, addBookmark, addRiffCards, findListType } from './utils';
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
    }

    private async addFlashCard() {
        if (!this.lastBlockID) return
        const realID = await findListType(this.lastBlockID)
        await addRiffCards([realID])
    }

    private async addReadPoint() {
        if (!this.lastBlockID) return
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
