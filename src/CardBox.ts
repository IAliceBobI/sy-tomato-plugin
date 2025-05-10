import { Dialog, IProtyle, } from "siyuan";
import { deleteBlock, getContenteditableElement, newID, siyuan, sleep, winHotkey } from "./libs/utils";
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
import { CardPriorityBox修改文档中闪卡优先级, CardPriorityBox分散推迟闪卡 } from "./CardPriorityBox";

export const CardBox用选中的行创建超级块超级块制卡取消制卡 = winHotkey("⌘1")
export const CardBox复习时删除当前闪卡 = winHotkey("F9")
export const CardBox闪卡复习时打开闪卡设置 = winHotkey("⇧⌥U")
export const CardBox删除内容块 = winHotkey("⌘⇧9")
export const CardBox复习时跳过当前闪卡 = winHotkey("⌘8")
export const CardBox取消当前文档内所有闪卡 = winHotkey("F8")
export const CardBox清理所有失效的闪卡 = winHotkey("⌘⇧7")
export const CardBox定位闪卡 = winHotkey("⌘⌥J")

class CardBox {
    private plugin: BaseTomatoPlugin;
    async onload(plugin: BaseTomatoPlugin) {
        if (!cardBoxCheckbox.get()) return;
        this.plugin = plugin;
        if (cardBoxBuildSupCard.get()) {
            this.plugin.addCommand({
                langKey: "addFlashCard2025年5月4日13:53:52",
                langText: tomatoI18n.用选中的行创建超级块超级块制卡取消制卡,
                hotkey: CardBox用选中的行创建超级块超级块制卡取消制卡.m,
                editorCallback: async (protyle: IProtyle) => {
                    addFlashCard(protyle, await getDocTracer(), this.plugin);
                },
            });
        }
        this.plugin.addCommand({
            langKey: "remove cards in doc 2025-5-10 00:11:45",
            langText: tomatoI18n.取消当前文档内所有闪卡,
            hotkey: CardBox取消当前文档内所有闪卡.m,
            callback: () => {
                removeDocCards(events.docID);
            },
        });
        this.plugin.addCommand({
            langKey: "delCard2025-5-10 12:40:25",
            langText: tomatoI18n.复习时删除当前闪卡,
            hotkey: CardBox复习时删除当前闪卡.m,
            callback: () => {
                this.delCard(false);
            },
        });
        this.plugin.addCommand({
            langKey: "del card block 2024-12-19 00:24:07",
            langText: tomatoI18n.删除内容块,
            hotkey: CardBox删除内容块.m,
            callback: () => {
                this.delCard(true);
            },
        });
        this.plugin.addCommand({
            langKey: "opensettings2025-5-10 13:12:14",
            langText: tomatoI18n.闪卡复习时打开闪卡设置,
            hotkey: CardBox闪卡复习时打开闪卡设置.m,
            callback: async () => {
                const cardID = await getIDFromCard();
                if (cardID) {
                    const { id, msg } = this.getMsgAndID(events.protyle.protyle);
                    this.openSettings(events.protyle.protyle, msg, id)
                }
            },
        });
        this.plugin.addCommand({
            langKey: "skipCard2025-5-10 12:44:19",
            langText: tomatoI18n.复习时跳过当前闪卡,
            hotkey: CardBox复习时跳过当前闪卡.m,
            callback: async () => this.skip()
        });
        this.plugin.addCommand({
            langKey: "clean invalid cards 2024年12月18日21:31:32",
            langText: tomatoI18n.清理所有失效的闪卡,
            hotkey: CardBox清理所有失效的闪卡.m,
            callback: () => {
                siyuan.removeBrokenCards(tomatoI18n)
            },
        });
        this.plugin.addCommand({
            langKey: "jump to card 2024年12月18日21:31:32",
            langText: tomatoI18n.定位闪卡,
            hotkey: CardBox定位闪卡.m,
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
        events.addListener("CardBox2025-5-9 23:55:35", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.switch_protyle
                || eventType == EventType.click_editorcontent
            ) {
                const protyle = detail.protyle as IProtyle;
                if (!protyle) return;
                if (protyle?.element?.classList?.contains("card__block")) {
                    const { id, msg } = this.getMsgAndID(protyle);
                    if (!id) return;
                    this.initSkipBtn();
                    this.initSettingsBtn(msg, id, protyle);
                }
            }
        });
    }

    private getMsgAndID(protyle: IProtyle) {
        const id = protyle.block.id;
        let msg = "";
        {
            const e = getContenteditableElement(protyle.contentElement);
            msg = `block ID：${id}<br>${tomatoI18n.请确认原文内容}：<br>` + e?.textContent?.slice(0, 50);
        }
        return { id, msg };
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

    private getHK() {
        return tomatoI18n.复习时的快捷键(CardBox删除内容块.w, CardBox复习时删除当前闪卡.w, CardBox复习时跳过当前闪卡.w, CardPriorityBox修改文档中闪卡优先级.w, CardBox定位闪卡.w, CardPriorityBox分散推迟闪卡.w);
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

            nextBtn.title = this.getHK();
            nextBtn.setAttribute("TomatoCardSkipBtn", "1");
            nextBtn.classList.add(...btnPrevious.classList);
            nextBtn.style.width = btnPrevious.style.width;
            nextBtn.style.minWidth = btnPrevious.style.minWidth;
            nextBtn.style.display = btnPrevious.style.display;
            nextBtn.innerHTML = `Skip${WEB_SPACE}<svg><use xlink:href="#iconRight"></use></svg>`;
            nextBtn.addEventListener("click", () => this.skip());
        }
    }

    private openSettings(protyle: IProtyle, msg: string, id: string) {
        const dm = new DestroyManager();
        const btnId = newID();
        const dialog = new Dialog({
            title: this.getHK(),
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
            btn.setAttribute("aria-label", CardBox闪卡复习时打开闪卡设置.w);
            btn.innerHTML = "<div class=\"card__icon\">⚙️</div> " + tomatoI18n.设置;
            btn.title = this.getHK();
            btn.setAttribute("data-type", "-100");
            btn.classList.add(...btnPrevious.classList);
            btn.addEventListener("click", () => this.openSettings(protyle, msg, id));
        }
    }
}

export const cardBox = new CardBox();