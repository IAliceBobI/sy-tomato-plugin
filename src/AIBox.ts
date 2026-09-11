import { confirm, Dialog, IEventBusMap } from "siyuan";
import { getAllText, siyuan } from "./libs/utils";
import { events } from "./libs/Events";
import { aiBoxCheckbox, aiBoxMenuShow, } from "./libs/stores";
import AIBoxMenu from "./AIBoxMenu.svelte";
import { DestroyManager } from "./libs/destroyer";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { winHotkey } from "./libs/winHotkey";
import { agentIconSymbolID } from "./agentIcon";
import { addIfVisible } from "./libs/menuManager";
import { newID } from "stonev5-utils";
import { mount, unmount } from "svelte";
import { OpenAIClient, diagnoseAIAsync } from "./libs/openAI";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];
export const AIBoxHotkey = winHotkey("⌥⇧S", "人工智能", agentIconSymbolID(), () => tomatoI18n.人工智能)
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
        addIfVisible(menu, AIBoxHotkey.langKey, {
            label: AIBoxHotkey.langText(),
            icon: AIBoxHotkey.icon,
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
            this.dm.add("2", () => { unmount(d) })
            this.dm.add("dm", () => { this.dm = null; })
        }
    }

    /** agentrev □3 健壮化：快照→getConf 两级诊断（启动后才配的 AI 也拿得到），未配置分态弹窗
     *  （annoAIGuideFor 指明缺什么）；请求失败/空响应由 do_completions 返回 undefined → toast 报错。 */
    public async runAI(text: string, anchorID: string) {
        const d = await diagnoseAIAsync();
        if ("reason" in d) {
            confirm(tomatoI18n.未配置AI, tomatoI18n.annoAIGuideFor(d.reason), () => { /* 引导即止 */ });
            return;
        }
        await siyuan.pushMsg(tomatoI18n.AI请求已发送, 2500);
        const client = new OpenAIClient(d.apiKey, d.baseURL);
        const ret = await client.do_completions(d.model, text, anchorID, true);
        if (!ret) await siyuan.pushMsg(tomatoI18n.AI请求失败, 3000);
        return ret;
    }
}

export const aiBox = new AIBox();


