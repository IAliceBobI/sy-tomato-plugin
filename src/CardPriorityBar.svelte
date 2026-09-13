<script lang="ts">
    import { confirm, Plugin } from "siyuan";
    import { onMount } from "svelte";
    import { cardPriorityBox } from "./CardPriorityBox";
    import {
        CARD_PRIORITY,
        CARD_PRIORITY_STOP,
        DATA_NODE_ID,
        TOMATO_CONTROL_ELEMENT,
    } from "./libs/gconst";
    import { newID } from "stonev5-utils";
    import {
        getContenteditableElement,
        isValidNumber,
        siyuan,
        siyuanCache,
        timeUtil,
    } from "./libs/utils";
    import { events } from "./libs/Events";
    import { locTree, OpenSyFile2 } from "./libs/docUtils";
    import { tomatoI18n } from "./tomatoI18n";
    import {
        card_priority_slider_hide,
        card_priority_stopBtn_hide,
    } from "./libs/stores";
    import { closeAllDialog } from "./libs/keyboard";

    interface Props {
        cardElement: HTMLElement;
        isInSettings?: boolean;
        plugin: Plugin;
    }

    let { cardElement, isInSettings = false, plugin }: Props = $props();

    let priText: HTMLElement = $state();
    let controlAttr: AttrType = $state();
    let cardID: string = $state();
    let priority: number = $state(0);
    // 推迟态感知（cardrenew □3）：推迟中的卡显示恢复图标（iconPlay），否则显示推迟
    // 图标（iconPause）；属性写入后块 DOM 更新触发重挂，随挂载重读——图标恒跟真实态
    let stopActive = $state(false);
    let textContent: string;

    onMount(async () => {
        {
            const e = getContenteditableElement(cardElement) as HTMLElement;
            textContent =
                e?.textContent?.slice(0, 50) ??
                cardElement.textContent?.slice(0, 50);
        }
        cardID = cardElement.getAttribute(DATA_NODE_ID);
        stopActive = !!cardElement.getAttribute(CARD_PRIORITY_STOP);
        if (cardElement.classList.contains("protyle-title")) {
            const attrs = await siyuan.getBlockAttrs(cardID);
            priority = Number(attrs["custom-card-priority"] ?? "50");
        } else {
            priority = Number(cardElement.getAttribute(CARD_PRIORITY) ?? "50");
        }

        if (!isValidNumber(priority)) priority = 50;
        controlAttr = {} as AttrType;
        controlAttr[TOMATO_CONTROL_ELEMENT] = "1";
        controlAttr["custom-card-priority-id"] = cardID;
        const docTitleElement = document.querySelector(
            `div.protyle-top>div.protyle-title[data-node-id="${cardID}"]`,
        );
        if (docTitleElement) {
            docTitleElement.id = newID();
            controlAttr["custom-card-priority-id"] = cardID;
            controlAttr["custom-card-priority-doc-id"] = docTitleElement.id;
        }

        {
            const all = await siyuanCache.getRiffCardsByBlockIDs(5 * 1000, [
                cardID,
            ]);
            // await 归来时组件可能已被属性写触发的重挂拆卸（doStopCards 竞态，bind:this 清空），
            // 判活早退防 priText 赋值落空抛 pageerror（audit □30）
            if (!priText) return;
            const cards = all.get(cardID) ?? [];
            for (const card of cards) {
                if (card.riffCard) {
                    priText.title = tomatoI18n
                        .复习时间复习次数(
                            timeUtil.dateFormat(new Date(card.riffCard.due)),
                            card.riffCard.reps,
                        )
                        .trim();
                    priText.style.fontWeight = "bold";
                    break;
                }
            }
        }
    });

    async function subOne(event: MouseEvent) {
        event.stopPropagation();
        await cardPriorityBox.updatePrioritySelected(
            [cardElement],
            priority - 1,
            false,
            (p) => {
                priority = p;
                cardElement.setAttribute(CARD_PRIORITY, p);
            },
        );
    }
    async function addOne(event: MouseEvent) {
        event.stopPropagation();
        await cardPriorityBox.updatePrioritySelected(
            [cardElement],
            priority + 1,
            false,
            (p) => {
                priority = p;
                cardElement.setAttribute(CARD_PRIORITY, p);
            },
        );
    }
    async function stopCard(event: MouseEvent) {
        // 图标翻转不在本地做：stopCard 走 DialogText 异步输入天数，点击瞬间属性未定；
        // 推迟/恢复写属性后内核更新块 DOM→observer 重挂本条→stopActive 随挂载重读真实态
        await cardPriorityBox.stopCard(event, cardElement);
    }
    async function locate(event: MouseEvent) {
        event.stopPropagation();
        closeAllDialog();
        OpenSyFile2(plugin, cardID);
        locTree(cardID);
    }
    async function removeCard(event: MouseEvent) {
        event.stopPropagation();
        confirm("⚠️" + tomatoI18n.取消制卡, textContent, async () => {
            await siyuan.removeRiffCards([cardID]);
            cardElement
                .querySelectorAll(`[${TOMATO_CONTROL_ELEMENT}]`)
                .forEach((e) => {
                    e.parentElement.removeChild(e);
                });
        });
    }
    async function updateCard(event: MouseEvent) {
        event.stopPropagation();
        await cardPriorityBox.updatePrioritySelected(
            [cardElement],
            priority,
            false,
            (p) => {
                priority = p;
                cardElement.setAttribute(CARD_PRIORITY, p);
            },
        );
    }
    async function updateCardByInput(event: MouseEvent) {
        event.stopPropagation();
        await cardPriorityBox.updatePrioritySelected(
            [cardElement],
            priority,
            true,
            (p) => {
                priority = p;
                cardElement.setAttribute(CARD_PRIORITY, p);
            },
        );
    }
</script>

<!-- cardrenew □3 同构翻新：emoji 全换思源 iconFont 线稿（官方注入物同构立场），flex gap
     替代 {@html whiteSpace} 间距 hack；衬底容器=官方工具条形态（surface 底+border+圆角）
     根治裸排骑块描边线；点击区 20px。cardPriBar 属性=自动隐藏功能（cssStyle.ts）依赖勿删 -->
<div {...controlAttr} class="container">
    <div {...{ cardPriBar: "1" }}>
        <button title={tomatoI18n.定位闪卡} onclick={locate}
            ><svg><use xlink:href="#iconSearch"></use></svg></button
        >
        {#if !isInSettings}
            <button title={tomatoI18n.取消制卡} onclick={removeCard}
                ><svg><use xlink:href="#iconClose"></use></svg></button
            >
        {/if}
        {#if !events.isMobile}
            <button
                class="fontColor"
                title={tomatoI18n.闪卡优先级 + "-1"}
                onclick={subOne}><svg><use xlink:href="#iconLine"></use></svg></button
            >
        {/if}
        <button
            class="fontColor pri-num"
            title={tomatoI18n.点击修改优先级}
            bind:this={priText}
            onclick={updateCardByInput}>{priority}</button
        >
        {#if !events.isMobile}
            <button
                class="fontColor"
                title={tomatoI18n.闪卡优先级 + "+1"}
                onclick={addOne}><svg><use xlink:href="#iconAdd"></use></svg></button
            >
        {/if}
        {#if !isInSettings && !$card_priority_stopBtn_hide}
            <button title={tomatoI18n.推迟与取消推迟} onclick={stopCard}
                ><svg><use xlink:href={stopActive ? "#iconPlay" : "#iconPause"}></use></svg></button
            >
        {/if}
        {#if isInSettings || !$card_priority_slider_hide}
            {#if !events.isMobile}
                <label>
                    <input
                        class="slider"
                        title={tomatoI18n.拖动闪卡优先级}
                        type="range"
                        onclick={updateCard}
                        bind:value={priority}
                        min="0"
                        max="100"
                        list={cardID + "-priority-labels"}
                    />
                    <datalist id={cardID + "-priority-labels"}>
                        <option value="0"> </option>
                        <option value="25"> </option>
                        <option value="50"> </option>
                        <option value="75"> </option>
                        <option value="100"> </option>
                    </datalist>
                </label>
            {/if}
        {/if}
    </div>
</div>

<style>
    /* 官方工具条同构：surface 底+1px border+圆角，浮于块描边线上不再裸排；
       全取 --b3-* 变量暗色主题免费跟随 */
    .container {
        border: 1px solid var(--b3-border-color);
        border-radius: 4px;
        background-color: var(--b3-theme-surface);
        padding: 1px;
    }
    .container > div {
        display: inline-flex;
        align-items: center;
        gap: 1px;
    }
    button {
        /* 20px 点击区（原裸排 10~14px）+ 居中图标，hover 官方列表态 */
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        padding: 0;
        margin: 0;
        border: none;
        border-radius: 3px;
        background-color: transparent;
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        line-height: 1;
    }
    button:hover {
        background-color: var(--b3-list-hover);
        color: var(--b3-theme-primary);
    }
    button svg {
        width: 14px;
        height: 14px;
    }
    /* 优先级数值徽标：等宽数字居中（0~100 一到三位），font-color1 保留强调 */
    .pri-num {
        min-width: 20px;
        font-variant-numeric: tabular-nums;
    }
    input {
        height: 1px;
    }
    .fontColor {
        color: var(--b3-font-color1);
    }
    .fontColor:hover {
        color: var(--b3-theme-primary);
    }
</style>
