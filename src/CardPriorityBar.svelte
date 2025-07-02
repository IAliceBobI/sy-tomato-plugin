<script lang="ts">
    import { confirm, Plugin } from "siyuan";
    import { onMount } from "svelte";
    import { cardPriorityBox } from "./CardPriorityBox";
    import {
        CARD_PRIORITY,
        DATA_NODE_ID,
        TOMATO_CONTROL_ELEMENT,
        WEB_SPACE,
    } from "./libs/gconst";
    import { newID } from "stonev5-utils/lib/id";
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
    let whiteSpace = $state(WEB_SPACE);
    let textContent: string;
    export function destroy() {}

    onMount(async () => {
        {
            const e = getContenteditableElement(cardElement) as HTMLElement;
            textContent =
                e?.textContent?.slice(0, 50) ??
                cardElement.textContent?.slice(0, 50);
        }
        cardID = cardElement.getAttribute(DATA_NODE_ID);
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

        if (events.isMobile) whiteSpace = "";
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
        cardPriorityBox.stopCard(event, cardElement);
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

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div {...controlAttr} class="container">
    <div {...{ cardPriBar: "1" }}>
        <button title={tomatoI18n.定位闪卡} onclick={locate}>🔍</button>
        {@html whiteSpace}
        {#if !isInSettings}
            <button title={tomatoI18n.取消制卡} onclick={removeCard}>🚫</button
            >
            {@html whiteSpace}
        {/if}
        {#if !events.isMobile}
            <button
                class="fontColor"
                title={tomatoI18n.闪卡优先级 + "-1"}
                onclick={subOne}>－</button
            >
        {/if}
        <button
            class="fontColor"
            title={tomatoI18n.点击修改优先级}
            bind:this={priText}
            onclick={updateCardByInput}>{priority}</button
        >
        {#if !events.isMobile}
            <button
                class="fontColor"
                title={tomatoI18n.闪卡优先级 + "+1"}
                onclick={addOne}>＋</button
            >
        {/if}
        {@html whiteSpace}
        {#if !isInSettings && !$card_priority_stopBtn_hide}
            <button title={tomatoI18n.推迟与取消推迟} onclick={stopCard}
                >🛑</button
            >
            {@html whiteSpace}
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
    input {
        height: 1px;
    }
    .container {
        border: none;
    }
    button {
        background-color: transparent;
        border: none;
    }
    .fontColor {
        color: var(--b3-font-color1);
    }
</style>
