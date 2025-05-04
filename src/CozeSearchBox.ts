import { Dialog, IEventBusMap } from "siyuan";
import { DestroyManager } from "./libs/destroyer";
import { tomatoI18n } from "./tomatoI18n";
import { events } from "./libs/Events";
import { getAllText, newID, siyuan } from "./libs/utils";
import CozeSearchBoxMenu from "./CozeSearchBoxMenu.svelte"
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { cozeSearchBoxCheckbox } from "./libs/stores";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

class CozeSearchBox {
    private plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        if (!cozeSearchBoxCheckbox.get()) return;
        this.plugin = plugin;

        this.plugin.addCommand({
            langKey: "coze 2025-1-6 11:44:34",
            langText: "coze" + tomatoI18n.知识库问答,
            hotkey: "⌘⇧S",
            callback: async () => {
                try {
                    const { selected, ids } = await events.selectedDivs();
                    const id = ids.pop();
                    await this.semantic(id, getAllText(selected));
                } catch {
                    await this.semantic("", "");
                }
            },
        });

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            this.aiMenu(detail as any);
        });
    }

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!this.plugin) return;
        this.aiMenu(detail as any);
    }

    aiMenu(detail: TomatoMenu) {
        const menu = detail.menu;
        menu.addItem({
            label: "coze" + tomatoI18n.知识库问答,
            iconHTML: "🍅🔍",
            accelerator: "⌘⇧S",
            click: async () => {
                const { selected, ids } = await events.selectedDivs(detail.protyle);
                const id = ids.pop();
                await this.semantic(id, getAllText(selected));
            },
        });
    }

    private async semantic(anchorID: string, text: string) {
        if (events.isBrowser) {
            siyuan.pushMsg("can not run in browser env.");
            return;
        }
        const dm = new DestroyManager();
        const id = newID();
        const dialog = new Dialog({
            title: "coze" + tomatoI18n.知识库问答,
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : "400px",
            height: events.isMobile ? "180svw" : null,
            destroyCallback: () => {
                dm.destroyBy("1")
            },
        });
        const d = new CozeSearchBoxMenu({
            target: dialog.element.querySelector("#" + id),
            props: {
                dm,
                text,
                anchorID,
                plugin: this.plugin,
            }
        });
        dm.add("1", () => { dialog.destroy() })
        dm.add("2", () => { d.$destroy() })
    }
}

export const cozeSearchBox = new CozeSearchBox();


