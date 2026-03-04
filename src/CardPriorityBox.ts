import { confirm, ICardData, IEventBusMap, Protyle } from "siyuan";
import { getAttribute, getID, isValidNumber, siyuan, stringToNumber, timeUtil, versionGreaterEqual, } from "./libs/utils";
import { CARD_PRIORITY_STOP, CUSTOM_RIFF_DECKS, TOMATO_CONTROL_ELEMENT } from "./libs/gconst";
import { DialogText } from "./libs/DialogText";
import { EventType, events } from "./libs/Events";
import CardPriorityBar from "./CardPriorityBar.svelte";
import { doStopCards, getIDFromCard } from "./libs/cardUtils";
import { auto_card_priority, cardPriorityBoxCheckbox, cardPriorityBoxPostponeCardMenu, cardPriorityBoxPriorityMenu, cardPriorityBoxSpradDelayMenu, cardPrioritySetPriInterval } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

export const CardPriorityBox修改文档中闪卡优先级 = winHotkey("F6", "cardPrioritySet2025-5-10 11:18:36")
export const CardPriorityBox分散推迟闪卡 = winHotkey("⌘⇧8", "delay all cards spread on x days 2024-12-19 14:41:11", "🌊🛑", () => tomatoI18n.分散推迟闪卡, true, cardPriorityBoxSpradDelayMenu)
export const CardPriorityBox推迟闪卡 = winHotkey("⌘F9", "delay all cards 2025-5-10 12:31:04")
export const CardPriority恢复所有暂停的闪卡 = winHotkey("⇧⌥Y", "resume all cards 2025-5-10 12:31:04")
import { winHotkey } from "./libs/winHotkey";
import { setGlobal, shuffleArray } from "stonev5-utils";
import { mount } from "svelte";

class CardPriorityBox {
    plugin: BaseTomatoPlugin;
    beforeReview: Map<string, DueCard>;
    private observer: MutationObserver;

    onunload() {
        this.observer?.disconnect();
        this.observer = null;
    }

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!cardPriorityBoxCheckbox.get()) return;
        const cards = detail?.blockElements?.filter(e => getAttribute(e, "custom-riff-decks"))
        if (cards?.length > 0) {
            detail.menu.addItem({
                iconHTML: "🏆",
                label: tomatoI18n.为闪卡设置优先级,
                click: () => {
                    this.updatePrioritySelected(detail.blockElements);
                }
            });
            detail.menu.addItem({
                iconHTML: "🛑",
                label: tomatoI18n.推迟与取消推迟,
                click: (_e, event) => {
                    for (const e of detail.blockElements) {
                        this.stopCard(event, e);
                    }
                }
            });
        }
    }

    private async scanCard2addPriority() {
        return navigator.locks.request("lock scanCard2addPriority 2025-6-7 00:25:52", { ifAvailable: true }, async (lock) => {
            if (lock) {
                let cards = await siyuan.getRiffCardsAllFlat()
                cards = cards.filter(c => c.ial != null && !c.ial["custom-card-priority"])
                await siyuan.batchSetBlockAttrs(cards.map(c => {
                    return { id: c.id, attrs: { "custom-card-priority": "50" } }
                }))
            }
        })
    }

    async onload(plugin: BaseTomatoPlugin) {
        if (!cardPriorityBoxCheckbox.get()) return;
        this.plugin = plugin;
        this.beforeReview = new Map();

        const interval = parseFloat(cardPrioritySetPriInterval.get())
        if (interval > 0) {
            clearInterval(setGlobal("scanCard2addPriority 2025-6-7 00:03:48", setInterval(() => {
                this.scanCard2addPriority();
            }, interval * 60 * 1000)));
        }

        const cardPrioritySet = async () => {
            // 检查间隔重复界面是否可见（活跃状态）
            const cardMainElement = document.querySelector('div.card__main');
            const isCardReviewActive = cardMainElement && !cardMainElement.classList.contains('fn__none');

            const cardID = isCardReviewActive ? await getIDFromCard() : null;
            if (cardID) {
                const blocks = await siyuan.getRiffCardsByBlockIDs([cardID])
                    .then(r => {
                        return [...r.values()].flat()
                    })
                this.updateDocPriorityBatchDialog(blocks);
            } else {
                const docID = events.protyle?.protyle?.block?.rootID;
                if (!docID) return;
                const blocks = await siyuan.getTreeRiffCardsAll(docID);
                this.updateDocPriorityBatchDialog(blocks);
            }
        }

        this.plugin.addCommand({
            langKey: CardPriorityBox修改文档中闪卡优先级.langKey,
            langText: tomatoI18n.修改文档中闪卡优先级,
            hotkey: CardPriorityBox修改文档中闪卡优先级.m,
            callback: cardPrioritySet,
        });

        const delay = async (spread = false) => {
            let blocks: GetCardRetBlock[];
            if (await getIDFromCard()) {
                blocks = await this.getRestCards()
            } else {
                blocks = await siyuan.getTreeRiffCardsAll(events.docID);
            }
            this.stopCards(blocks, spread)
        }

        this.plugin.addCommand({
            langKey: CardPriorityBox分散推迟闪卡.langKey,
            langText: CardPriorityBox分散推迟闪卡.langText(),
            hotkey: CardPriorityBox分散推迟闪卡.m,
            callback: () => {
                if (CardPriorityBox分散推迟闪卡.cmd()) {
                    delay(true)
                }
            }
        });

        this.plugin.addCommand({
            langKey: CardPriorityBox推迟闪卡.langKey,
            langText: tomatoI18n.推迟闪卡,
            hotkey: CardPriorityBox推迟闪卡.m,
            callback: () => delay(),
        });

        const resumeAll = async (detail: Protyle) => {
            const docID = detail?.protyle?.block?.rootID;
            if (!docID) return;
            const blocks = (await siyuan.sqlAttr(`select block_id from attributes where name="${CARD_PRIORITY_STOP}" limit 999999999999`))
                .map(attr => {
                    return { ial: { id: attr.block_id } };
                });
            confirm(tomatoI18n.恢复所有暂停的闪卡, `${tomatoI18n.数量} : ${blocks.length}`, () => {
                doStopCards("0", blocks as any);
            })
        }

        this.plugin.addCommand({
            langKey: CardPriority恢复所有暂停的闪卡.langKey,
            langText: tomatoI18n.恢复所有暂停的闪卡,
            hotkey: CardPriority恢复所有暂停的闪卡.m,
            callback: () => resumeAll(events.protyle),
        });

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            if (CardPriorityBox分散推迟闪卡.menu()) {
                menu.addItem({
                    label: CardPriorityBox分散推迟闪卡.langText(),
                    iconHTML: CardPriorityBox分散推迟闪卡.icon,
                    accelerator: CardPriorityBox分散推迟闪卡.m,
                    click: () => delay(true),
                });
            }

            if (cardPriorityBoxPriorityMenu.get()) {
                menu.addItem({
                    label: tomatoI18n.修改文档中闪卡优先级,
                    iconHTML: "🌊🏆",
                    accelerator: CardPriorityBox修改文档中闪卡优先级.m,
                    click: cardPrioritySet,
                });
            }

            if (cardPriorityBoxPostponeCardMenu.get()) {
                menu.addItem({
                    label: tomatoI18n.推迟闪卡,
                    accelerator: CardPriorityBox推迟闪卡.m,
                    iconHTML: "🌊🛑",
                    click: () => delay(),
                });
            }
        });

        this.observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "attributes" && mutation.attributeName === CUSTOM_RIFF_DECKS) {
                    this.addBtns(mutation.target as any);
                    this.resumeCards(mutation.target as any);
                }
                mutation.removedNodes.forEach((n) => {
                    const e = n as HTMLElement;
                    if (e.getAttribute) {
                        const c = getAttribute(e, "custom-card-priority-doc-id")
                        this.addBtns(document.getElementById(c), true);
                    }
                })
                mutation.addedNodes.forEach((n) => {
                    this.addBtns(n as any);
                    this.resumeCards(n as any);
                })
            }
        });
        this.observer.observe(document.body, { attributes: true, childList: true, subtree: true });

        if (auto_card_priority.get()) {
            this.plugin.eventBus.on(EventType.click_flashcard_action as any, async ({ detail }: { detail: { type: string, card: DueCard } }) => {
                const id = detail?.card?.blockID;
                if (!id) return;
                // -1显示答案, -2上一步, -3跳过, 1重来, 2困难, 3良好, 4简单
                if (detail.type === "1" && String(detail.card.state) === "1") {
                    const attr = await siyuan.getBlockAttrs(id);
                    const p = readPriority(attr);
                    this.updateDocPriorityBatchDialog([{ ial: attr } as any], p + 1, false, () => { });
                } else if (detail.type === "4" && String(detail.card.state) === "4") {
                    const attr = await siyuan.getBlockAttrs(id);
                    const p = readPriority(attr);
                    this.updateDocPriorityBatchDialog([{ ial: attr } as any], p - 1, false, () => { });
                }
            });
        }
    }

    private resumeCards(element: HTMLElement) {
        if (!element.getAttribute || !element.lastElementChild) return;
        if (!getAttribute(element, "custom-riff-decks")) return;
        let id = getAttribute(element, "data-node-id");
        if (!id) {
            id = getAttribute(element, "custom-card-priority-id");
        }
        if (!id) {
            return;
        }
        const stop = getAttribute(element, "custom-card-priority-stop");
        if (!stop) return;
        resumeCardsDeleteAttr([{ "custom-card-priority-stop": stop, id }]);
    }

    private addBtns(element: HTMLElement, isDoc = false) {
        navigator.locks.request("card priority add btns 2024-12-8 11:18:07", (lock) => {
            if (lock) this._addBtns(element, isDoc);
        })
    }
    private _addBtns(element: HTMLElement, isDoc = false) {
        if (!element?.getAttribute || !element.lastElementChild) return;
        if (!getAttribute(element, "custom-riff-decks")) return;
        if (!getAttribute(element, "data-node-id")) return;
        if (element.lastElementChild.classList.contains("protyle-attr")) {
            if (isDoc) {
                const oldCtrls = element.lastElementChild.querySelector(`div[${TOMATO_CONTROL_ELEMENT}]`);
                if (oldCtrls) return;
            } else {
                element.lastElementChild.querySelectorAll(`div[${TOMATO_CONTROL_ELEMENT}]`)
                    .forEach(e => e.parentElement.removeChild(e));
            }
            mount(CardPriorityBar, {
                target: element.lastElementChild,
                props: {
                    cardElement: element,
                    plugin: this.plugin,
                }
            });
        }
    }

    async getRestCards() {
        const blocks = (await siyuan.getRiffDueCards()).cards.filter(due => {
            const oldDue = this.beforeReview.get(due.blockID);
            if (oldDue) {
                if (oldDue.state === due.state) {
                    return true;
                }
            }
            return false;
        }).map(due => {
            return { ial: { id: due.blockID } } as unknown as GetCardRetBlock;
        });
        return blocks;
    }


    async stopCard(event: MouseEvent, cardElement: HTMLElement) {
        event.stopPropagation();
        const id = getID(cardElement, [CUSTOM_RIFF_DECKS]);
        if (!id) return;
        const attrs = await siyuan.getBlockAttrs(id);
        if (attrs[CARD_PRIORITY_STOP]) {
            await resumeCard([id], true);
            await siyuan.pushMsg(tomatoI18n.恢复闪卡);
        } else {
            await this.stopCards([{ ial: { id } }] as any);
        }
    }

    async stopCards(blocks: GetCardRetBlock[], spread = false, days = "") {
        let text: string;
        if (spread) {
            text = tomatoI18n.准备分散推迟x个闪卡(blocks.length)
        } else {
            text = tomatoI18n.准备推迟x个闪卡(blocks.length)
        }
        if (days) {
            await doStopCards(days, blocks, spread);
        } else {
            new DialogText(
                text,
                "2",
                async (days: string) => {
                    await doStopCards(days, blocks, spread);
                },
            );
        }
    }

    async updatePrioritySelected(elements: HTMLElement[], priority?: number, dialog?: boolean, cb?: Func) {
        let blocks: { ial: AttrType }[];
        if (versionGreaterEqual("3.1")) {
            blocks = await siyuan.batchGetBlockAttrs(elements.map(div => getID(div, [CUSTOM_RIFF_DECKS])).filter(i => !!i))
                .then(data => Object.values(data).map(ial => {
                    return { ial };
                }))
                .then(ials => ials.filter(b => !!b.ial[CUSTOM_RIFF_DECKS]))
        } else {
            blocks = (await Promise.all(elements.map(div => {
                return getID(div, [CUSTOM_RIFF_DECKS]);
            }).filter(i => !!i).map(id => siyuan.getBlockAttrs(id)))).map(ial => {
                return { ial };
            }).filter(b => !!b.ial[CUSTOM_RIFF_DECKS]);
        }
        return this.updateDocPriorityBatchDialog(blocks as any, priority, dialog, cb);
    }

    async updateDocPriorityBatchDialog(blocks: GetCardRetBlock[], priority?: number, dialog?: boolean, cb?: Func) {
        if (blocks.length == 0) {
            siyuan.pushMsg(tomatoI18n.找不到闪卡);
            return;
        }
        const txt = blocks.map(b => b.content).join("🧱")
        const validNum = isValidNumber(priority);
        if (dialog || !validNum) {
            if (!validNum) {
                priority = 50;
                await siyuan.batchGetBlockAttrs(blocks.map(b => b.id))
                    .then(allAttr => {
                        blocks.forEach(b => {
                            b.attrs = allAttr[b.id]
                            const p = b.attrs["custom-card-priority"];
                            if (p) {
                                priority = stringToNumber(p);
                            }
                        });
                    });
            }
            new DialogText(tomatoI18n.为x张卡输入新的优先级(blocks.length), String(priority), async (priorityTxt: string) => {
                const priority = Number(priorityTxt);
                if (isValidNumber(priority)) {
                    await this.updateDocPriorityLock(priority, blocks, cb, priorityTxt.startsWith("-") || priorityTxt.startsWith("+"));
                } else {
                    await siyuan.pushMsg(tomatoI18n.您的输入有误 + "：" + priorityTxt);
                }
            }, false, txt.slice(0, 50));
        } else {
            await this.updateDocPriorityLock(priority, blocks, cb);
        }
    }

    // update the entire doc cards
    private updateDocPriorityLock(newPriority: number, blocks: GetCardRetBlock[], cb?: Func, isDelta = false) {
        return navigator.locks.request("CardPriorityBox.updateDocPriorityLock", { ifAvailable: true }, async (lock) => {
            if (lock) {
                // await siyuan.pushMsg(tomatoI18n.设置闪卡优先级为 + `：${newPriority}`, 2000);
                const count = await this.updateDocPriority(newPriority, blocks, cb, isDelta);
                if (count > 1) {
                    await siyuan.pushMsg(tomatoI18n.已经调整了x个闪卡的优先级(count), 2000);
                }
            } else {
                await siyuan.pushMsg(tomatoI18n.正在修改优先级, 2000);
            }
        });
    }

    private async updateDocPriority(newPriority: number, blocks: GetCardRetBlock[], cb?: Func, isDelta = false) {
        const params = blocks.map(block => {
            const ial = block.ial as unknown as AttrType;
            const priority = readPriority(ial);
            if (isDelta) {
                const attrs = {} as AttrType;
                attrs["custom-card-priority"] = String(ensureValidPriority(priority + newPriority));
                return { id: ial.id, attrs };
            }

            newPriority = ensureValidPriority(newPriority);
            if (newPriority != priority) {
                const attrs = {} as AttrType;
                attrs["custom-card-priority"] = String(newPriority);
                return { id: ial.id, attrs };
            }
        }).filter(i => !!i);
        await siyuan.batchSetBlockAttrs(params);
        if (cb) {
            cb(newPriority);
        } else {
            setTimeout(() => {
                events.protyleReload();
            }, 500);
        }
        return params.length;
    }

    async updateCards(options: ICardData) {
        if (!options?.cards?.length) return options;
        if (!this.plugin) return options;
        const OldLen = options.cards.length;
        if (OldLen <= 1) return options;

        let attrList: AttrType[];
        if (versionGreaterEqual("3.1")) {
            attrList = await siyuan.batchGetBlockAttrs(options.cards.map(card => card.blockID)).then(data => Object.values(data));
        } else {
            attrList = await Promise.all(options.cards.map(card => siyuan.getBlockAttrs(card.blockID)));
        }

        await resumeCardsDeleteAttr(attrList);

        type CARD = { card: typeof options.cards[0], p: number };
        const cardsMap = options.cards.reduce((m, c) => {
            m.set(c.blockID, { card: c, p: 0 });
            return m;
        }, new Map<string, CARD>());

        const { review, stop } = attrList.reduce(({ hasPiece, review, stop }, attr) => {
            if (attr?.id) {
                const card = cardsMap.get(attr.id).card;
                const p = readPriority(attr);
                review.set(attr.id, { card, p });
            }
            return { hasPiece, review, stop };
        }, { hasPiece: false, review: new Map<string, CARD>(), stop: new Map<string, CARD>() });

        await Promise.all([...stop.values()].map(c => siyuan.skipReviewRiffCard(c.card.cardID)));

        options.cards = [...review.values()].map((c) => c.card);
        options.cards = shuffleArray(options.cards)
        options.cards.sort((a, b) => review.get(b.blockID).p - review.get(a.blockID).p);
        // const len = options.cards.length;
        // const n = Math.floor(len * 5 / 100);
        // if (n > 0 && len > n) {
        //     const lastN = options.cards.slice(len - n);
        //     options.cards = options.cards.slice(0, len - n);
        //     for (const e of lastN) {
        //         const randPosition = Math.floor(Math.random() * (len / 3));
        //         options.cards.splice(randPosition, 0, e);
        //     }
        // }
        this.beforeReview = (await siyuan.getRiffDueCards()).cards
            .filter(c => options.cards.findIndex((v) => v.blockID === c.blockID) >= 0)
            .reduce((m, c) => {
                m.set(c.blockID, c);
                return m;
            }, new Map());
        return options;
    }

    public async resumeCardByIDs(blockIDs: string[], setDue = false) {
        return resumeCard(blockIDs, setDue);
    }
}

export async function resumeCard(blockIDs: string[], setDue = false) {
    if (blockIDs.length == 0) return;
    const newAttrs = {} as AttrType;
    newAttrs["custom-card-priority-stop"] = "";
    newAttrs.bookmark = "";
    await siyuan.batchSetBlockAttrs(blockIDs.map(b => {
        return { id: b, attrs: newAttrs };
    }));
    if (setDue) {
        const due = timeUtil.getYYYYMMDDHHmmss(timeUtil.nowts());
        await siyuan.batchSetRiffCardsDueTimeByBlockID(blockIDs.map((b) => {
            return {
                id: b,
                due,
            };
        }));
    }
    if (blockIDs.length > 0) {
        setTimeout(() => {
            events.protyleReload();
        }, 500);
    }
}

function resumeCardsDeleteAttr(attrList: AttrType[]) {
    const now = timeUtil.dateFormat();
    const ids = attrList.filter(attrList => {
        const date = attrList["custom-card-priority-stop"];
        if (date && now >= date) {
            delete attrList["custom-card-priority-stop"];
            return true;
        }
        return false;
    })
        .map(attrList => attrList.id).filter(i => !!i);
    return resumeCard(ids);
}

function readPriority(ial: AttrType) {
    if (!ial) return 50;
    let priority = Number(ial["custom-card-priority"]);
    if (!isValidNumber(priority)) {
        priority = 50;
    }
    return priority;
}

function ensureValidPriority(priority: number) {
    if (priority > 100) priority = 100;
    if (priority < 0) priority = 0;
    return priority;
}

export const cardPriorityBox = new CardPriorityBox();
