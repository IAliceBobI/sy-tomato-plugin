import { Plugin } from "siyuan";
import { events } from "./Events";
import * as constants from "./constants";
import { siyuan } from "./utils";
import * as utils from "./utils";

class LinkBox {
    private plugin: Plugin;

    onload(plugin: Plugin) {
        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: "bilink",
            hotkey: "⌥/",
            editorCallback: async (protyle) => {
                const ids = this.getSelectedIDs(protyle);
                if (ids.length == 0) ids.push(events.lastBlockID);
                for (const id of ids)
                    await this.addLink(id);
            },
        });
        this.plugin.eventBus.on("open-menu-content", async ({ detail }) => {
            const menu = detail.menu;
            menu.addItem({
                label: this.plugin.i18n.bilink,
                icon: "iconLink",
                accelerator: "⌥/",
                click: () => {
                    const blockID = detail?.element?.getAttribute("data-node-id") ?? "";
                    if (blockID) this.addLink(blockID);
                },
            });
        });
    }

    private async addLink(blockID: string) {
        const { markdown } = await siyuan.getBlockMarkdownAndContent(blockID);
        const lnks = utils.extractLinks(markdown);
        if (lnks.length <= 0) return;
        const docID = await siyuan.getDocIDByBlockID(blockID)
        if (!docID) return;
        const { content } = await siyuan.getBlockMarkdownAndContent(docID);
        if (!content) return;
        const lute = utils.NewLute();
        for (const link of lnks) {
            const row = await siyuan.sqlOne(`select type from blocks where id="${link}"`);
            const idType = row?.type ?? "";
            if (!idType) continue;
            const backLink = `[((${blockID} "${content}"))]`
            if (idType == "d") {
                await siyuan.insertBlockAsChildOf(backLink, link);
            } else {
                const { dom } = await siyuan.getBlockDOM(link)
                const md = lute.BlockDOM2Md(dom).trim();
                if (md.includes(backLink)) continue;
                const parts = md.split("\n");
                if (parts.length >= 2) {
                    const lastLine = parts[parts.length - 2];
                    parts[parts.length - 2] = lastLine + backLink;
                }
                await siyuan.updateBlock(link, parts.join("\n"))
            }
        }
    }

    private getSelectedIDs(protyle: any) {
        const multiLine = protyle?.element?.getElementsByTagName("div") as HTMLDivElement[] ?? [];
        const ids = [];
        for (const div of multiLine) {
            if (div.classList.contains(constants.PROTYLE_WYSIWYG_SELECT)) {
                const id = div.getAttribute(constants.DATA_NODE_ID);
                div.classList.remove(constants.PROTYLE_WYSIWYG_SELECT);
                ids.push(id);
            }
        }
        return ids;
    }
}

export const linkBox = new LinkBox();
