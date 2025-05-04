import { Dialog, IProtyle, } from "siyuan";
import { deleteBlock, getContenteditableElement, newID, siyuan, sleep } from "./libs/utils";
import "./index.scss";
import { EventType, events } from "./libs/Events";
import CardBoxSettings from "./CardBoxSettings.svelte";
import { getIDFromCard, pressSkip, showCardAnswer, removeDocCards } from "./libs/cardUtils";
import { WEB_SPACE } from "./libs/gconst";
import { addFlashCard } from "./libs/listUtils";
import { DestroyManager } from "./libs/destroyer";
import { cardBoxBuildSupCard, cardBoxCheckbox } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { getDocTracer, locTree, OpenSyFile2 } from "./libs/docUtils";
import { closeAllDialog } from "./libs/keyboard";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

class CardBox {
    private plugin: BaseTomatoPlugin;
    async onload(plugin: BaseTomatoPlugin) {
        if (!cardBoxCheckbox.get()) return;
        this.plugin = plugin;
        if (cardBoxBuildSupCard.get()) {
            this.plugin.addCommand({
                langKey: "addFlashCard2025年5月4日13:53:52",
                langText: tomatoI18n.用选中的行创建超级块超级块制卡取消制卡,
                hotkey: "⌘1",
                editorCallback: async (protyle: IProtyle) => {
                    addFlashCard(protyle, await getDocTracer(), this.plugin);
                },
            });
        }
        this.plugin.addCommand({
            langKey: "removeDocCards",
            hotkey: "",
            callback: () => {
                removeDocCards(events.docID);
            },
        });
        this.plugin.addCommand({
            langKey: "delCard",
            hotkey: "⌘9",
            callback: () => {
                this.delCard(false);
            },
        });
        this.plugin.addCommand({
            langKey: "del card block 2024-12-19 00:24:07",
            langText: tomatoI18n.删除内容块,
            hotkey: "⌘⇧9",
            callback: () => {
                this.delCard(true);
            },
        });
        this.plugin.addCommand({
            langKey: "skipCard",
            hotkey: "⌘8",
            callback: async () => this.skip()
        });
        this.plugin.addCommand({
            langKey: "clean invalid cards 2024年12月18日21:31:32",
            langText: tomatoI18n.清理所有失效的闪卡,
            hotkey: "⌘⇧7",
            callback: () => {
                siyuan.removeBrokenCards(tomatoI18n)
            },
        });
        this.plugin.addCommand({
            langKey: "jump to card 2024年12月18日21:31:32",
            langText: tomatoI18n.定位闪卡,
            hotkey: "⌘⌥J",
            callback: () => {
                getIDFromCard().then(cardID => {
                    if (cardID) {
                        closeAllDialog();
                        OpenSyFile2(this.plugin, cardID);
                        locTree(cardID);
                    }
                })
            },
        });
        events.addListener("CardBox", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.switch_protyle
                || eventType == EventType.click_editorcontent
            ) {
                const protyle = detail.protyle as IProtyle;
                if (!protyle) return;
                if (protyle?.element?.classList?.contains("card__block")) {
                    const id = protyle.block.id;
                    let msg = "";
                    {
                        const e = getContenteditableElement(protyle.contentElement);
                        msg = `block ID：${id}<br>${tomatoI18n.请确认原文内容}：<br>` + e?.textContent?.slice(0, 50);
                    }
                    if (!id) {
                        return;
                    }
                    this.initSkipBtn();
                    this.initSettingsBtn(msg, id, protyle);
                }
            }
        });
    }

    private async delCard(delBlock: boolean) {
        const cardID = await getIDFromCard();
        if (cardID) {
            await siyuan.removeRiffCards([cardID]);
            if (delBlock) {
                await deleteBlock(cardID);
            }
            if (showCardAnswer()) await sleep(300);
            pressSkip();
            await siyuan.pushMsg(tomatoI18n.取消制卡);
        }
    }

    private async skip() {
        if (showCardAnswer()) await sleep(300);
        pressSkip();
    }

    private initSkipBtn() {
        const btnPrevious = document.body.querySelector(
            'button[data-type="-2"]'
        ) as HTMLButtonElement;
        if (btnPrevious) {
            btnPrevious.parentElement.querySelectorAll("[TomatoCardSkipBtn]").forEach(e => e?.parentElement?.removeChild(e));
            const nextBtn = btnPrevious.insertAdjacentElement("afterend", document.createElement("button")) as HTMLButtonElement;

            const span = btnPrevious.insertAdjacentElement("afterend", document.createElement("span"));
            span.classList.add("fn__space");
            span.setAttribute("TomatoCardSkipBtn", "1");

            nextBtn.title = tomatoI18n.复习时的快捷键;
            nextBtn.setAttribute("TomatoCardSkipBtn", "1");
            nextBtn.classList.add(...btnPrevious.classList);
            nextBtn.style.width = btnPrevious.style.width;
            nextBtn.style.minWidth = btnPrevious.style.minWidth;
            nextBtn.style.display = btnPrevious.style.display;
            nextBtn.innerHTML = `Skip${WEB_SPACE}<svg><use xlink:href="#iconRight"></use></svg>`;
            nextBtn.addEventListener("click", () => this.skip());
        }
    }

    private initSettingsBtn(msg: string, id: string, protyle: IProtyle) {
        const btnPrevious = document.body.querySelector(
            'button[data-type="-3"]'
        ) as HTMLButtonElement;
        const container = btnPrevious?.parentElement?.parentElement;
        if (container) {
            container.querySelectorAll("[TomatoCardDelBtn]").forEach(e => e?.parentElement?.removeChild(e));
            const div = container.appendChild(document.createElement("div")) as HTMLDivElement;
            div.setAttribute("TomatoCardDelBtn", "1");
            div.appendChild(document.createElement("span")) as HTMLSpanElement;
            const btn = div.appendChild(document.createElement("button")) as HTMLButtonElement;
            btn.innerHTML = "<div class=\"card__icon\">⚙️</div> Settings";
            btn.title = tomatoI18n.删卡定位推迟;
            btn.setAttribute("data-type", "-100");
            btn.setAttribute("aria-label", tomatoI18n.复习时的快捷键);
            btn.classList.add(...btnPrevious.classList);
            btn.addEventListener("click", () => {
                const dm = new DestroyManager();
                const btnId = newID();
                const dialog = new Dialog({
                    title: btn.title,
                    content: `<div id="${btnId}"></div>`,
                    width: events.isMobile ? "90vw" : "700px",
                    height: events.isMobile ? "180svw" : null,
                    destroyCallback: () => {
                        dm.destroyBy("dialog")
                    }
                });
                dm.add("dialog", () => dialog.destroy())
                const sv = new CardBoxSettings({
                    target: dialog.element.querySelector("#" + btnId),
                    props: {
                        protyle,
                        dm,
                        plugin: this.plugin,
                        dialogDiv: document.querySelector(".b3-dialog__container"),
                        msg,
                        id,
                    }
                });
                dm.add("svelte", () => sv.$destroy());
            });
        }
    }
}

export const cardBox = new CardBox();
