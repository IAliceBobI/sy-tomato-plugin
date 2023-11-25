import { Plugin } from "siyuan";

class LinkBox {
    private plugin: Plugin;

    onload(plugin: Plugin) {
        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: "addFlashCard",
            hotkey: "",
            globalCallback: async () => {
                await this.addLink();
            },
        });
        this.plugin.eventBus.on("open-menu-content", async ({ detail }) => {
            const menu = detail.menu;
            menu.addItem({
                label: this.plugin.i18n.addFlashCard,
                icon: "iconFlashcard",
                click: () => {
                    const blockID = detail?.element?.getAttribute("data-node-id") ?? "";
                    if (blockID) {
                        this.addLink(blockID);
                    }
                },
            });
        });
    }
    private async addLink(blockID?: string) {
        throw new Error("Method not implemented.");
    }
}

export const linkBox = new LinkBox();
