import { IEventBusMap, IProtyle, openTab, } from "siyuan";
import { deleteBlock, siyuan, sleep, } from "./libs/utils";
import "./index.scss";
import { EventType, events } from "./libs/Events";
import { getIDFromCard, pressSkip, showCardAnswer, removeDocCards } from "./libs/cardUtils";
import { CardSettingsID, WEB_SPACE } from "./libs/gconst";
import { addFlashCard } from "./libs/listUtils";
import { cardBoxAddConcepts, cardBoxCheckbox, cardBoxSettingsShow, cardBoxSuperCard, cardBoxCardtab, writableWithGet } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { getDocTracer, locTree, OpenSyFile2 } from "./libs/docUtils";
import { closeAllDialog } from "./libs/keyboard";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { CardPriorityBox修改文档中闪卡优先级, CardPriorityBox分散推迟闪卡 } from "./CardPriorityBox";
import { winHotkey } from "./libs/winHotkey";
import { verifyKeyTomato } from "./libs/user";
import { mount } from "svelte";
import CardBoxFloatSvelte from "./CardBoxFloat.svelte";
import { setGlobal } from "stonev5-utils";

export const CardBox用选中的行创建超级块超级块制卡取消制卡 = winHotkey("shift+ctrl+1", "addFlashCard2025年5月4日13:53:52", "🗃️", () => tomatoI18n.用选中的行创建超级块超级块制卡取消制卡, false, cardBoxSuperCard)
export const CardBox复习时删除当前闪卡 = winHotkey("alt+F9", "delCard2025-5-10 12:40:25", "", () => tomatoI18n.复习时删除当前闪卡)
export const CardBox闪卡复习时打开闪卡设置 = winHotkey("⇧⌥U", "opensettings2025-5-10 13:12:14", "", () => tomatoI18n.闪卡复习时打开闪卡设置)
export const CardBox删除内容块 = winHotkey("⌘⇧9", "del card block 2024-12-19 00:24:07", "", () => tomatoI18n.删除内容块)
export const CardBox复习时跳过当前闪卡 = winHotkey("shift+alt+8", "skipCard2025-5-10 12:44:19", "", () => tomatoI18n.复习时跳过当前闪卡)
export const CardBox取消当前文档内所有闪卡 = winHotkey("F8", "remove cards in doc 2025-5-10 00:11:45", "", () => tomatoI18n.取消当前文档内所有闪卡)
export const CardBox清理所有失效的闪卡 = winHotkey("⌘⇧7", "clean invalid cards 2024年12月18日21:31:32", "", () => tomatoI18n.清理所有失效的闪卡)
export const CardBox定位闪卡 = winHotkey("⌘⌥J", "jump to card 2024年12月18日21:31:32", "", () => tomatoI18n.定位闪卡)

class CardBox {
    private plugin: BaseTomatoPlugin;

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!cardBoxCheckbox.get()) return;
        if (CardBox用选中的行创建超级块超级块制卡取消制卡.menu()) {
            detail.menu.addItem({
                accelerator: CardBox用选中的行创建超级块超级块制卡取消制卡.m,
                iconHTML: CardBox用选中的行创建超级块超级块制卡取消制卡.icon,
                label: CardBox用选中的行创建超级块超级块制卡取消制卡.langText(),
                click: async () => {
                    await addFlashCard(detail.protyle, await getDocTracer(), this.plugin, cardBoxAddConcepts.get())
                },
            });
        }
    }

    async onload(plugin: BaseTomatoPlugin) {
        if (!cardBoxCheckbox.get()) return;
        await verifyKeyTomato();
        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: CardBox用选中的行创建超级块超级块制卡取消制卡.langKey,
            langText: CardBox用选中的行创建超级块超级块制卡取消制卡.langText(),
            hotkey: CardBox用选中的行创建超级块超级块制卡取消制卡.m,
            editorCallback: async (protyle: IProtyle) => {
                addFlashCard(protyle, await getDocTracer(), this.plugin, cardBoxAddConcepts.get());
            },
        });
        this.plugin.addCommand({
            langKey: CardBox取消当前文档内所有闪卡.langKey,
            langText: CardBox取消当前文档内所有闪卡.langText(),
            hotkey: CardBox取消当前文档内所有闪卡.m,
            callback: () => {
                removeDocCards(events.docID);
            },
        });
        this.plugin.addCommand({
            langKey: CardBox复习时删除当前闪卡.langKey,
            langText: CardBox复习时删除当前闪卡.langText(),
            hotkey: CardBox复习时删除当前闪卡.m,
            callback: () => {
                this.delCard(false);
            },
        });
        this.plugin.addCommand({
            langKey: CardBox删除内容块.langKey,
            langText: CardBox删除内容块.langText(),
            hotkey: CardBox删除内容块.m,
            callback: () => {
                this.delCard(true);
            },
        });
        this.plugin.addCommand({
            langKey: CardBox闪卡复习时打开闪卡设置.langKey,
            langText: CardBox闪卡复习时打开闪卡设置.langText(),
            hotkey: CardBox闪卡复习时打开闪卡设置.m,
            callback: async () => {
                const cardID = await getIDFromCard();
                if (cardID) {
                    this.openSettings()
                }
            },
        });
        this.plugin.addCommand({
            langKey: CardBox复习时跳过当前闪卡.langKey,
            langText: CardBox复习时跳过当前闪卡.langText(),
            hotkey: CardBox复习时跳过当前闪卡.m,
            callback: pressSkip,
        });
        this.plugin.addCommand({
            langKey: CardBox清理所有失效的闪卡.langKey,
            langText: CardBox清理所有失效的闪卡.langText(),
            hotkey: CardBox清理所有失效的闪卡.m,
            callback: () => {
                siyuan.removeBrokenCards(tomatoI18n)
            },
        });
        this.plugin.addCommand({
            langKey: CardBox定位闪卡.langKey,
            langText: CardBox定位闪卡.langText(),
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
        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            if (CardBox用选中的行创建超级块超级块制卡取消制卡.menu()) {
                menu.addItem({
                    label: CardBox用选中的行创建超级块超级块制卡取消制卡.langText(),
                    iconHTML: CardBox用选中的行创建超级块超级块制卡取消制卡.icon,
                    accelerator: CardBox用选中的行创建超级块超级块制卡取消制卡.m,
                    click: async () => {
                        await addFlashCard(detail.protyle, await getDocTracer(), this.plugin, cardBoxAddConcepts.get())
                    },
                });
            }
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
                    navigator.locks.request("cardbox lock 2025-07-22 10:29:30", { ifAvailable: true }, (lock) => {
                        if (lock) this.addBtns(protyle)
                    })
                }
            }
        });

        if (!events.isMobile) {
            if (cardBoxCardtab.get()) {
                clearInterval(setGlobal("tomato open card 2025-07-24 10:07:05",
                    setInterval(async () => {
                        if (!document.querySelector(`.card__action`)) {
                            const cards = await siyuan.getRiffDueCards()
                            const num = cards?.unreviewedCount || 0;
                            if (num > 0) {
                                await openTab({
                                    app: this.plugin.app,
                                    card: { type: "all" },
                                    keepCursor: true,
                                    removeCurrentTab: false,
                                    openNewTab: true,
                                });
                            }
                        }
                    }, 20000)
                ));
            }
        }
    }

    private cardID = writableWithGet("")
    private cardPath = writableWithGet("")
    private addBtns(protyle: IProtyle) {
        const id = protyle.block.id;
        if (!id) return;
        this.initSkipBtn();
        this.initSettingsBtn();
        this.cardID.set(id)
        siyuan.getBlockBreadcrumb(id).then((p) => {
            const cardElement = protyle.contentElement.querySelectorAll(`div[data-node-id] > div[contenteditable="true"]`);
            const text = [...cardElement].map(a => a.textContent).join("  ")
            const path = p.map((p) => p.name);
            path.push(text)
            this.cardPath.set(path.join(" ➔ ").slice(0, 400))
        });
        const cardSvID = document.getElementById(CardSettingsID)
        if (!cardSvID) {
            const target = document.querySelector(`[data-type="count"]`);
            if (target) {
                mount(CardBoxFloatSvelte, {
                    target,
                    props: {
                        id: this.cardID,
                        cardPath: this.cardPath,
                    }
                });
            }
        }
    }

    private async delCard(delBlock: boolean) {
        const cardID = await getIDFromCard();
        if (cardID) {
            await siyuan.removeRiffCards([cardID]);
            if (delBlock) {
                await deleteBlock(cardID);
            }
            if (showCardAnswer()) await sleep(300);
            await pressSkip();
            await siyuan.pushMsg(tomatoI18n.取消制卡);
        }
    }

    private getHK() {
        return tomatoI18n.复习时的快捷键(CardBox删除内容块.w(), CardBox复习时删除当前闪卡.w(), CardBox复习时跳过当前闪卡.w(), CardPriorityBox修改文档中闪卡优先级.w(), CardBox定位闪卡.w(), CardPriorityBox分散推迟闪卡.w());
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
            nextBtn.addEventListener("click", pressSkip);
        }
    }

    private openSettings() {
        cardBoxSettingsShow.write(!cardBoxSettingsShow.get())
    }

    private initSettingsBtn() {
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
            btn.setAttribute("aria-label", CardBox闪卡复习时打开闪卡设置.w());
            btn.innerHTML = "<div class=\"card__icon\">⚙️</div> " + tomatoI18n.设置;
            btn.title = this.getHK();
            btn.setAttribute("data-type", "-100");
            btn.classList.add(...btnPrevious.classList);
            btn.addEventListener("click", () => this.openSettings());
        }
    }
}

export const cardBox = new CardBox();