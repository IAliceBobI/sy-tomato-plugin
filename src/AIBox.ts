import { Dialog, IEventBusMap } from "siyuan";
import { getAllText } from "./libs/utils";
import { events } from "./libs/Events";
import { aiBoxCheckbox, aiBoxMenuShow, } from "./libs/stores";
import AIBoxMenu from "./AIBoxMenu.svelte";
import { DestroyManager } from "./libs/destroyer";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { winHotkey } from "./libs/winHotkey";
import { newID } from "stonev5-utils/lib/id";
import { mount } from "svelte";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];
export const AIBoxHotkey = winHotkey("⌥⇧S", "人工智能2024-6-9 01:58:39", "💻", () => tomatoI18n.人工智能)
class AIBox {
    private plugin: BaseTomatoPlugin;
    private dm: DestroyManager;

    async onload(plugin: BaseTomatoPlugin) {
        if (!aiBoxCheckbox.get()) return;

        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: AIBoxHotkey.langKey,
            langText: AIBoxHotkey.langText(),
            hotkey: AIBoxHotkey.m,
            editorCallback: async (protyle) => {
                const { selected, ids } = await events.selectedDivs(protyle);
                const id = ids.pop();
                await this.ai(id, getAllText(selected));
            },
        });

        if (aiBoxMenuShow.get()) {
            this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
                this.aiMenu(detail as any);
            });
        }
    }

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!aiBoxCheckbox.get()) return;
        if (aiBoxMenuShow.get()) {
            this.aiMenu(detail as any);
        }
    }

    aiMenu(detail: TomatoMenu) {
        const menu = detail.menu;
        menu.addItem({
            label: AIBoxHotkey.langText(),
            iconHTML: AIBoxHotkey.icon,
            accelerator: AIBoxHotkey.m,
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
            this.dm.getFn("run")()
            this.dm.destroyBy();
        } else {
            this.dm?.destroyBy();
            this.dm = new DestroyManager();
            const id = newID();
            const dialog = new Dialog({
                title: AIBoxHotkey.langText(),
                content: `<div id="${id}"></div>`,
                width: events.isMobile ? "90vw" : "700px",
                height: events.isMobile ? "180svw" : null,
                destroyCallback: () => {
                    this.dm?.destroyBy("1")
                },
            });
            const d = mount(AIBoxMenu, {
                target: dialog.element.querySelector("#" + id),
                props: {
                    dm: this.dm,
                    text,
                    anchorID,
                }
            });
            this.dm.add("1", () => { dialog.destroy() })
            this.dm.add("2", () => { d.destroy() })
            this.dm.add("dm", () => { this.dm = null; })
        }
    }
}

export const aiBox = new AIBox();


