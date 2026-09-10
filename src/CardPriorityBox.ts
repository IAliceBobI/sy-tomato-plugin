import { confirm, ICardData, IEventBusMap, Protyle } from "siyuan";
import { getAttribute, getID, isValidNumber, siyuan, stringToNumber, timeUtil, versionGreaterEqual, } from "./libs/utils";
import { CARD_PRIORITY_STOP, CUSTOM_RIFF_DECKS, TOMATO_CONTROL_ELEMENT } from "./libs/gconst";
import { DialogText } from "./libs/DialogText";
import { EventType, events } from "./libs/Events";
import CardPriorityBar from "./CardPriorityBar.svelte";
import { doStopCards, getIDFromCard, getRestCards } from "./libs/cardUtils";
import { auto_card_priority, cardPriorityBoxCheckbox, cardPriorityBoxPostponeCardMenu, cardPriorityBoxPriorityMenu, cardPriorityBoxSpradDelayMenu, cardPrioritySetPriInterval } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

export const CardPriorityBox修改文档中闪卡优先级 = winHotkey("F6", "cardPrioritySet")
export const CardPriorityBox分散推迟闪卡 = winHotkey("⌘⇧8", "delay all cards spread on x days", "iconSpreadEven", () => tomatoI18n.分散推迟闪卡, true, cardPriorityBoxSpradDelayMenu)
export const CardPriorityBox推迟闪卡 = winHotkey("⌘F9", "delay all cards")
export const CardPriority恢复所有暂停的闪卡 = winHotkey("⇧⌥Y", "resume all cards")
import { winHotkey } from "./libs/winHotkey";
import { gatedAddCommand } from "./libs/cmdGate";
import { addIfVisible } from "./libs/menuManager";
import { getGlobal, setGlobal, shuffleArray } from "stonev5-utils";
import { mount, unmount } from "svelte";
import { debugLog } from "./libs/logUtils";

// 按钮条组件 exports 登记（cardrenew □2）：Svelte 5 mount() 返回 exports，销毁必须
// unmount(x)——此前返回值直接丢弃，重挂只 removeChild 摘 DOM，旧组件实例的闭包/$effect
// 全部滞留（每次块重渲染泄一个）。key=按钮条容器 div 自身，WeakMap 随 DOM 回收
const barExports = new WeakMap<HTMLElement, Record<string, any>>();

// 组件+DOM 双清（幂等）：unload 重挂链、observer 摘除链、onunload 全量清理共用
function removeBar(bar: HTMLElement) {
    const ex = barExports.get(bar);
    if (ex) {
        unmount(ex);
        barExports.delete(bar);
        debugLog("CardPriority", `removeBar: unmount 旧组件（残留泄漏根修）`, "cardpri");
    }
    bar.parentElement?.removeChild(bar);
}

class CardPriorityBox {
    plugin: BaseTomatoPlugin;
    private observer: MutationObserver;

    // setGlobal 定时器键（跨代清理模式：onload 清上一代残留，onunload 对称兜底）
    private static readonly scanTimerKey = "scanCard2addPriority 2025-6-7 00:03:48";

    onunload() {
        this.observer?.disconnect();
        this.observer = null;
        // 对称清定时器：onload 的跨代清理只在「开关开+interval>0」路径执行——开关关掉或
        // interval 改 0 后重载，旧 timer 无人清=后台永跑（navigator.locks 只防并发不防僵尸）
        clearInterval(getGlobal(CardPriorityBox.scanTimerKey));
        // 全量摘现存按钮条：插件重载（配置热生效 A 层）后旧条 DOM 滞留页面，点击走已死
        // 旧闭包；摘净后 onload 重扫由新实例接管
        const bars = document.querySelectorAll(`div[${TOMATO_CONTROL_ELEMENT}]`);
        bars.forEach(e => removeBar(e as HTMLElement));
        debugLog("CardPriority", `onunload: observer 断开+定时器清理+摘按钮条 ${bars.length} 条`, "cardpri");
    }

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!cardPriorityBoxCheckbox.get()) return;
        const cards = detail?.blockElements?.filter(e => getAttribute(e, "custom-riff-decks"))
        if (cards?.length > 0) {
            // featgate □2 死角补口：块图标菜单两项补 gate——复用复习卡片菜单既有开关
            // （同一功能两入口一开关，ConfFlashcard 行已有，设置面板零新增行）
            addIfVisible(detail.menu, "m.cardPriority.setPri", {
                icon: "iconStar",
                label: tomatoI18n.为闪卡设置优先级,
                click: () => {
                    this.updatePrioritySelected(detail.blockElements);
                }
            }, cardPriorityBoxPriorityMenu.get());
            addIfVisible(detail.menu, "m.cardPriority.stop", {
                icon: "iconPause",
                label: tomatoI18n.推迟与取消推迟,
                click: (_e, event) => {
                    for (const e of detail.blockElements) {
                        this.stopCard(event, e);
                    }
                }
            }, cardPriorityBoxPostponeCardMenu.get());
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

        const interval = parseFloat(cardPrioritySetPriInterval.get())
        if (interval > 0) {
            clearInterval(setGlobal(CardPriorityBox.scanTimerKey, setInterval(() => {
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

        gatedAddCommand(this.plugin, CardPriorityBox修改文档中闪卡优先级.langKey, {
            langText: tomatoI18n.修改文档中闪卡优先级,
            hotkey: CardPriorityBox修改文档中闪卡优先级.m,
            callback: cardPrioritySet,
        });

        const delay = async (spread = false) => {
            let blocks: GetCardRetBlock[];
            if (await getIDFromCard()) {
                // 全量取卡统一走 cardUtils.getRestCards（分页全量+due 过滤，不受每日限额
                // 截断——2026-09-07 修复；原类方法版依赖 beforeReview 快照比 state，快照源
                // 受官方队列（限额内）二次截断，且 due<=now 已天然排除已评分卡）
                blocks = await getRestCards()
            } else {
                blocks = await siyuan.getTreeRiffCardsAll(events.docID);
            }
            this.stopCards(blocks, spread)
        }

        gatedAddCommand(this.plugin, CardPriorityBox分散推迟闪卡.langKey, {
            langText: CardPriorityBox分散推迟闪卡.langText(),
            hotkey: CardPriorityBox分散推迟闪卡.m,
            callback: () => {
                if (CardPriorityBox分散推迟闪卡.cmd()) {
                    delay(true)
                }
            }
        });

        gatedAddCommand(this.plugin, CardPriorityBox推迟闪卡.langKey, {
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

        // □1b 恢复粒度（resume-granularity，2026-09-07 拍板）：按文档树恢复——内核
        // getTreeRiffCards 树语义自带「含子文档」递归与子块卡命中（卡块 root_id 即所在
        // 子文档，无需上爬），ial 携带全部自定义属性可直接按 stop 过滤；多选文档合并
        // 一次 confirm（各自取树后汇总张数）
        const resumeDocStops = async (docIDs: string[]) => {
            const stopped: GetCardRetBlock[] = [];
            for (const id of docIDs) {
                const cards = await siyuan.getTreeRiffCardsAll(id);
                stopped.push(...cards.filter(c => c.ial?.[CARD_PRIORITY_STOP]));
            }
            if (!stopped.length) {
                await siyuan.pushMsg(tomatoI18n.此文档及子文档内没有暂停的闪卡);
                return;
            }
            confirm(tomatoI18n.恢复文档暂停闪卡, tomatoI18n.将恢复n张暂停闪卡含子文档(stopped.length), () => {
                doStopCards("0", stopped);
            })
        }

        gatedAddCommand(this.plugin, CardPriority恢复所有暂停的闪卡.langKey, {
            langText: tomatoI18n.恢复所有暂停的闪卡,
            hotkey: CardPriority恢复所有暂停的闪卡.m,
            callback: () => resumeAll(events.protyle),
        });

        // 文档级恢复命令（无默认键，留用户键位设置自绑——winHotkey 工厂 m 空即 throw
        // 故直传 langKey，CommentBox 命令化同款）；当前文档含子文档
        gatedAddCommand(this.plugin, "resume doc cards", {
            langText: tomatoI18n.恢复文档暂停闪卡,
            editorCallback: (protyle) => {
                void resumeDocStops([protyle.block.rootID]);
            },
        });

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            addIfVisible(menu, CardPriorityBox分散推迟闪卡.langKey, {
                label: CardPriorityBox分散推迟闪卡.langText(),
                icon: CardPriorityBox分散推迟闪卡.icon,
                accelerator: CardPriorityBox分散推迟闪卡.m,
                click: () => delay(true),
            }, CardPriorityBox分散推迟闪卡.menu());

            addIfVisible(menu, CardPriorityBox修改文档中闪卡优先级.langKey, {
                label: tomatoI18n.修改文档中闪卡优先级,
                icon: "iconRiffCard",
                accelerator: CardPriorityBox修改文档中闪卡优先级.m,
                click: cardPrioritySet,
            }, cardPriorityBoxPriorityMenu.get());

            addIfVisible(menu, CardPriorityBox推迟闪卡.langKey, {
                label: tomatoI18n.推迟闪卡,
                accelerator: CardPriorityBox推迟闪卡.m,
                icon: "iconClock",
                click: () => delay(),
            }, cardPriorityBoxPostponeCardMenu.get());

            // □1b：编辑器右键=当前文档（含子文档）；菜单 key 与文档树入口同一串
            // （menuManager 一处藏两处消）
            addIfVisible(menu, "m.cardPriority.resumeDoc", {
                label: tomatoI18n.恢复文档暂停闪卡,
                icon: "iconPlay",
                click: () => {
                    const docID = events.protyle?.protyle?.block?.rootID;
                    if (docID) void resumeDocStops([docID]);
                },
            }, cardPriorityBoxPostponeCardMenu.get());
        });

        // □1b：文档树右键=对着书/章节点恢复（用户主场景）；笔记本级节点无 data-node-id
        // 自然跳过，多选文档合并处理
        this.plugin.eventBus.on("open-menu-doctree", ({ detail }) => {
            const docIDs = [...detail.elements].map(e => (e as HTMLElement).getAttribute("data-node-id")).filter(Boolean) as string[];
            if (!docIDs.length) return;
            addIfVisible(detail.menu, "m.cardPriority.resumeDoc", {
                label: tomatoI18n.恢复文档暂停闪卡,
                icon: "iconPlay",
                click: () => void resumeDocStops(docIDs),
            }, cardPriorityBoxPostponeCardMenu.get());
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
                        // 官方重建 protyle-attr 摘掉旧按钮条：组件 exports 随之 unmount
                        // （自身即按钮条或内嵌按钮条都收）
                        if (e.hasAttribute(TOMATO_CONTROL_ELEMENT)) removeBar(e);
                        e.querySelectorAll?.(`div[${TOMATO_CONTROL_ELEMENT}]`)?.forEach(b => removeBar(b as HTMLElement));
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
        // attributeFilter：attributes 通道只放行制卡属性——打字等一切块属性变化（updated
        // 等）原先进回调空跑，是全 body 深观察的最大噪音源
        this.observer.observe(document.body, {
            attributes: true, attributeFilter: [CUSTOM_RIFF_DECKS], childList: true, subtree: true
        });

        // 重载接管：onunload 已把旧代按钮条全量摘净，重扫现存卡块挂新条（新实例闭包）。
        // 开销=一次选择器扫全 DOM + 现存卡块数（通常个位数~几十）
        document.querySelectorAll(`[custom-riff-decks]`).forEach(e => this.addBtns(e as HTMLElement));

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
            const oldCtrls = element.lastElementChild.querySelectorAll(`div[${TOMATO_CONTROL_ELEMENT}]`);
            if (isDoc) {
                if (oldCtrls.length > 0) return;
            } else {
                // 摘旧=组件 unmount+DOM 移除双清（原先只 removeChild，组件实例泄漏）
                oldCtrls.forEach(e => removeBar(e as HTMLElement));
            }
            const target = element.lastElementChild;
            const ex = mount(CardPriorityBar, { target, props: {
                cardElement: element,
                plugin: this.plugin,
            }});
            // mount 同步渲染，target.lastElementChild 即按钮条容器 div（其 TOMATO_CONTROL_
            // ELEMENT 标记属性由 onMount 异步打上，WeakMap key 只认 DOM 引用不依赖属性）
            barExports.set(target.lastElementChild as HTMLElement, ex);
        }
    }

    // getRestCards 类方法已退役（2026-09-07）：与 cardUtils.getRestCards 合一（全量取卡
    // 通道）；beforeReview 快照比 state 的过滤随全量通道天然满足（已评分卡 due 必在未来）


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
            // ⚠️ 契约：cb 收到的是「目标值」仅在 !isDelta 成立——isDelta=true 时 newPriority
            // 是增量（±N），回调拿 delta 会算错。现行调用方（CardPriorityBar ±1 按钮）恒走
            // 绝对值路径不触发；将来若有 isDelta+cb 组合，此处须改传 ensure 后的绝对值
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

        // （cardrenew □2 体检）原 reduce 的 stop Map 从未被写入、下游 skipReviewRiffCard
        // 恒空调用，属死代码已清——未到期 stop 的卡 due 被推到未来，官方队列天然不派发，
        // 无需 skip 清队；hasPiece 同为未用残留一并移除。另补 cardsMap 命中守卫（attrs
        // 返回与 cards 不一致时原代码 cardsMap.get(...).card 直接 TypeError）
        const review = new Map<string, CARD>();
        for (const attr of attrList) {
            const hit = attr?.id ? cardsMap.get(attr.id) : undefined;
            if (hit) review.set(attr.id, { card: hit.card, p: readPriority(attr) });
        }

        options.cards = [...review.values()].map((c) => c.card);
        options.cards = shuffleArray(options.cards)
        options.cards.sort((a, b) => review.get(b.blockID).p - review.get(a.blockID).p);
        debugLog("CardPriority", `updateCards: ${options.cards.length} 卡按优先级降序重排（首=${review.get(options.cards[0].blockID)?.p} 尾=${review.get(options.cards.at(-1)!.blockID)?.p}）`, "cardpri");
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
        // beforeReview 快照已随 getRestCards 类方法退役（2026-09-07 全量取卡修复）：
        // 快照源 getRiffDueCards 受限额截断、又被官方队列（限额内）二次过滤，取卡端换成
        // 分页全量后该快照反而是漏卡源头
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
