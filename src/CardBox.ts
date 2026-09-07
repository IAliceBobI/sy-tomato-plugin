import { IEventBusMap, IProtyle, openTab, } from "siyuan";
import { isVisible, siyuan, } from "./libs/utils";
import "./index.scss";
import { EventType, events } from "./libs/Events";
import { getIDFromCard, pressSkip, removeDocCards, skipThenRemoveCards } from "./libs/cardUtils";
import { CardSettingsID } from "./libs/gconst";
import { addFlashCard } from "./libs/listUtils";
import { cardBoxAddConcepts, cardBoxCheckbox, cardBoxSettingsShow, cardBoxSuperCard, cardBoxCardtab, card_refresh_visible_only, writableWithGet } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { getDocTracer, locTree, OpenSyFile2 } from "./libs/docUtils";
import { closeAllDialog } from "./libs/keyboard";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
import { verifyKeyTomato } from "./libs/user";
import { mount, unmount } from "svelte";
import CardBoxFloatSvelte from "./CardBoxFloat.svelte";
import { debugLog } from "./libs/logUtils";
import { setGlobal } from "stonev5-utils";

export const CardBox用选中的行创建超级块超级块制卡取消制卡 = winHotkey("shift+ctrl+1", "addFlashCard", "iconRiffCard", () => tomatoI18n.用选中的行创建超级块超级块制卡取消制卡, false, cardBoxSuperCard)
export const CardBox复习时删除当前闪卡 = winHotkey("alt+F9", "delCard", "", () => tomatoI18n.复习时删除当前闪卡)
export const CardBox闪卡复习时打开闪卡设置 = winHotkey("⇧⌥U", "opensettings", "", () => tomatoI18n.闪卡复习时打开闪卡设置)
export const CardBox删除内容块 = winHotkey("⌘⇧9", "del card block", "", () => tomatoI18n.删除内容块)
export const CardBox复习时跳过当前闪卡 = winHotkey("shift+alt+8", "skipCard", "", () => tomatoI18n.复习时跳过当前闪卡)
export const CardBox取消当前文档内所有闪卡 = winHotkey("F8", "remove cards in doc", "", () => tomatoI18n.取消当前文档内所有闪卡)
export const CardBox清理所有失效的闪卡 = winHotkey("⌘⇧7", "clean invalid cards", "", () => tomatoI18n.清理所有失效的闪卡)
export const CardBox定位闪卡 = winHotkey("⌘⌥J", "jump to card", "", () => tomatoI18n.定位闪卡)

class CardBox {
    private plugin: BaseTomatoPlugin;

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!cardBoxCheckbox.get()) return;
        addIfVisible(detail.menu, CardBox用选中的行创建超级块超级块制卡取消制卡.langKey, {
            accelerator: CardBox用选中的行创建超级块超级块制卡取消制卡.m,
            icon: CardBox用选中的行创建超级块超级块制卡取消制卡.icon,
            label: CardBox用选中的行创建超级块超级块制卡取消制卡.langText(),
            click: async () => {
                await addFlashCard(detail.protyle, await getDocTracer(), this.plugin, cardBoxAddConcepts.get())
            },
        }, CardBox用选中的行创建超级块超级块制卡取消制卡.menu());
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
            addIfVisible(menu, CardBox用选中的行创建超级块超级块制卡取消制卡.langKey, {
                label: CardBox用选中的行创建超级块超级块制卡取消制卡.langText(),
                icon: CardBox用选中的行创建超级块超级块制卡取消制卡.icon,
                accelerator: CardBox用选中的行创建超级块超级块制卡取消制卡.m,
                click: async () => {
                    await addFlashCard(detail.protyle, await getDocTracer(), this.plugin, cardBoxAddConcepts.get())
                },
            }, CardBox用选中的行创建超级块超级块制卡取消制卡.menu());
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
                        // issue #78: 仅当应用前台可见且有可见编辑器时才检查待复习卡片，
                        // 避免后台/无活动时空转打网络请求 + 误触发自动开页签。
                        if (card_refresh_visible_only.get()) {
                            if (document.visibilityState !== 'visible') return;
                            const hasVisibleEditor = [...document.querySelectorAll('.protyle:not(.card__block)')]
                                .some(el => isVisible(el));
                            if (!hasVisibleEditor) return;
                        }
                        if (!document.querySelector(`.card__action`)) {
                            const existsCard = document.querySelectorAll(`li[data-initdata]`)
                                .values()
                                .toArray()
                                .map(li => li.getAttribute('data-initdata'))
                                .map(str => {
                                    try {
                                        return JSON.parse(str)
                                    } catch (e) { }
                                })
                                .filter(json => json?.["customModelType"] == "siyuan-card")
                                .length > 0;
                            if (!existsCard) {
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
                        }
                    }, 20000)
                ));
            }
        }
    }

    private cardID = writableWithGet("")
    private cardPath = writableWithGet("")
    private lastCardID = ""
    private floatComp: ReturnType<typeof mount> | null = null
    private floatObserver: MutationObserver | null = null

    private addBtns(protyle: IProtyle) {
        const id = protyle.block.id;
        if (!id) return;
        // 同卡且面板标记 div 仍在文档=一切就位：短路高频重入（click_editorcontent 每点一下
        // 都触发），省掉按钮全量重建与 getBlockBreadcrumb 网络往返。翻页换卡 id 会变；面板
        // DOM 被官方翻页重写（genCardCount 重写 count innerHTML）时标记 div 消失，均不短路
        if (id === this.lastCardID && document.getElementById(CardSettingsID)) return;
        this.lastCardID = id;
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
                this.mountFloat(target);
            }
        }
    }

    private mountFloat(target: Element) {
        // 复用场景（重开复习页签等）先清旧实例再挂新，防止孤儿累积
        this.unmountFloat();
        this.floatComp = mount(CardBoxFloatSvelte, {
            target,
            props: {
                id: this.cardID,
                cardPath: this.cardPath,
            }
        });
        // 官方翻页重写 count 容器 innerHTML、关页签摘整棵 DOM，组件自身无从感知——标记 div
        // （组件渲染产物 CardSettingsID）离开文档即 unmount，防孤儿组件滞留（store 订阅与
        // window resize 监听泄漏）；unmount 后下次 addBtns 事件重挂新实例
        this.floatObserver = new MutationObserver(() => {
            if (this.floatComp && !document.getElementById(CardSettingsID)) {
                this.unmountFloat();
            }
        });
        this.floatObserver.observe(document.body, { childList: true, subtree: true });
    }

    private unmountFloat() {
        if (this.floatComp) {
            try {
                unmount(this.floatComp);
            } catch { /* DOM 已被官方先行摘除的跨代残留，销毁失败无妨（PairBarBox 先例） */ }
            this.floatComp = null;
        }
        this.floatObserver?.disconnect();
        this.floatObserver = null;
    }

    unload() {
        this.unmountFloat();
        this.lastCardID = "";
    }

    private async delCard(delBlock: boolean) {
        const cardID = await getIDFromCard();
        if (cardID) {
            await skipThenRemoveCards(cardID, delBlock);
            await siyuan.pushMsg(tomatoI18n.取消制卡);
        }
    }

    // Skip 注入钮已撤（2026-09-07 用户反馈）：官方评分行自带「跳过 (0)」评分钮（openCard
    // 模板 data-type="-3"），插件再注一个「跳过›」=同屏两个跳过+左列多占一行，破坏官方
    // 布局对称；跳过功能保留在命令/快捷键 ⌥⇧8（面板键帽小组可查）

    private openSettings() {
        cardBoxSettingsShow.write(!cardBoxSettingsShow.get())
    }

    private initSettingsBtn() {
        // data-type 值是官方实现细节、改版易变；「简单」评分钮的特征类 b3-button--success 兜底。
        // 两路都落空=官方复习界面结构已变：console.warn 留用户报障线索 + debugLog 打点，不再静默丢齿轮
        const btnPrevious = (document.body.querySelector('button[data-type="4"]')
            ?? document.body.querySelector('.card__action button.b3-button--success')) as HTMLButtonElement | null;
        if (!btnPrevious) {
            console.warn("[tomato] 闪卡齿轮未注入：未找到官方评分按钮（data-type=4 与 b3-button--success 均无），官方复习界面结构可能已改版");
            debugLog("CardBox", "initSettingsBtn: 评分按钮选择器双双落空，齿轮未注入", "cardbox");
            return;
        }
        const container = btnPrevious.parentElement?.parentElement;
        if (container) {
            container.querySelectorAll("[TomatoCardDelBtn]").forEach(e => e?.parentElement?.removeChild(e));

            // 创建一个新的 wrapper div，模仿其他评分按钮的结构
            const wrapper = document.createElement("div");
            wrapper.setAttribute("TomatoCardDelBtn", "1");

            // 官方评分钮 wrapper 的首槽=次复习间隔 label（翻页 JS 填），齿轮无间隔概念留空——
            // 「设置」文字进按钮内（emoji+文字与官方评分钮同构，2026-09-07 用户反馈回退：
            // icon-only 白钮与旁边评分卡形态割裂「跟旁边的按钮不一样」）
            const span = document.createElement("span");
            span.textContent = "";
            wrapper.appendChild(span);

            // 创建按钮：⚙️ emoji+「设置」文字+全抄「简单」钮类（success 绿）——与官方评分钮
            // 完全同构（用户反馈「老样子跟官方融合的挺好」）；tooltip/aria 保留修正版
            // （功能名+动态键位，原 getHK 5 行快捷键表系误挂）
            const btn = document.createElement("button");
            btn.title = `${tomatoI18n.闪卡复习时打开闪卡设置} ${CardBox闪卡复习时打开闪卡设置.w()}`;
            btn.setAttribute("aria-label", btn.title);
            btn.innerHTML = "<div class=\"card__icon\">⚙️</div> " + tomatoI18n.设置;
            btn.setAttribute("data-type", "-100");
            btn.classList.add(...btnPrevious.classList);
            btn.addEventListener("click", () => this.openSettings());

            // 把按钮放进 wrapper
            wrapper.appendChild(btn);

            // 在"简单(4)"按钮容器后面插入；间距走官方 fn__space span（与官方按钮间结构一致），
            // 不再硬编码 marginRight=8px
            const simpleContainer = btnPrevious.parentElement;
            simpleContainer.after(wrapper);
            const space = document.createElement("span");
            space.className = "fn__space";
            space.setAttribute("TomatoCardDelBtn", "1");
            wrapper.after(space);
        }
    }
}

export const cardBox = new CardBox();