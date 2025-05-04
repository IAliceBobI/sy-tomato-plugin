import { Dialog, IEventBusMap } from "siyuan";
import { getAllText, newID, } from "./libs/utils";
import { events } from "./libs/Events";
import { aiBoxCheckbox, } from "./libs/stores";
import AIBoxMenu from "./AIBoxMenu.svelte";
import { DestroyManager } from "./libs/destroyer";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

class AIBox {
    private plugin: BaseTomatoPlugin;
    private dm: DestroyManager;

    async onload(plugin: BaseTomatoPlugin) {
        if (!aiBoxCheckbox.get()) return;

        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: "2024-6-9 01:58:39",
            langText: tomatoI18n.人工智能,
            hotkey: "⌥⇧S",
            editorCallback: async (protyle) => {
                const { selected, ids } = await events.selectedDivs(protyle);
                const id = ids.pop();
                await this.ai(id, getAllText(selected));
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
            label: tomatoI18n.人工智能,
            iconHTML: "🍅💻",
            accelerator: "⌥⇧S",
            click: async () => {
                const { selected, ids } = await events.selectedDivs(detail.protyle);
                const id = ids.pop();
                await this.ai(id, getAllText(selected));
            },
        });
    }

    private async ai(anchorID: string, text: string) {
        if (!anchorID) return;
        if (this.dm) {
            this.dm.run();
            this.dm.destroyBy();
        } else {
            this.dm = new DestroyManager();
            const id = newID();
            const dialog = new Dialog({
                title: tomatoI18n.人工智能,
                content: `<div id="${id}"></div>`,
                width: events.isMobile ? "90vw" : "700px",
                height: events.isMobile ? "180svw" : null,
                destroyCallback: () => {
                    this.dm.destroyBy("1")
                },
            });
            const d = new AIBoxMenu({
                target: dialog.element.querySelector("#" + id),
                props: {
                    dm: this.dm,
                    text,
                    anchorID,
                }
            });
            this.dm.add("1", () => { dialog.destroy() })
            this.dm.add("2", () => { d.$destroy() })
            this.dm.add("dm", () => { this.dm = null; })
        }
    }
}

export const aiBox = new AIBox();


