<script lang="ts">
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    import { CardSettingsID } from "./libs/gconst";
    import { tomatoI18n } from "./tomatoI18n";
    import { Writable } from "svelte/store";
    import { confirm } from "siyuan";
    import { deleteBlock, getTomatoPluginInstance, siyuan } from "./libs/utils";
    import { closeAllDialog } from "./libs/keyboard";
    import { locTree, OpenSyFile2 } from "./libs/docUtils";
    import {
        CardBox删除内容块,
        CardBox复习时删除当前闪卡,
        CardBox复习时跳过当前闪卡,
        CardBox定位闪卡,
    } from "./CardBox";
    import {
        CardPriorityBox修改文档中闪卡优先级,
        CardPriorityBox分散推迟闪卡,
        cardPriorityBox,
    } from "./CardPriorityBox";
    import { pressSkip, doStopCards, getIDFromCard } from "./libs/cardUtils";
    import TomatoVip from "./TomatoVIP.svelte";
    import { lastVerifyResult, verifyKeyTomato } from "./libs/user";
    import { cardBoxSpradEvenlyPostpone } from "./libs/stores";

    interface Props {
        element: Writable<HTMLElement>;
        id: Writable<string>;
        show: Writable<boolean>;
    }

    let { element, id, show }: Props = $props();
    let msg = $derived.by(() => {
        return $element?.textContent ?? "";
    });
    let delayDays = $state(0.1);
    let hours = $derived(delayDays * 24);
    let showMsg = $state(false);

    const title = tomatoI18n.复习时的快捷键(
        CardBox删除内容块.w(),
        CardBox复习时删除当前闪卡.w(),
        CardBox复习时跳过当前闪卡.w(),
        CardPriorityBox修改文档中闪卡优先级.w(),
        CardBox定位闪卡.w(),
        CardPriorityBox分散推迟闪卡.w(),
    );

    async function deleteCard() {
        await siyuan.removeRiffCards([$id]);
        pressSkip();
    }

    async function delayRestCards(spread: boolean) {
        const blocks = await cardPriorityBox?.getRestCards();
        await doStopCards(String(delayDays), blocks, spread);
        closeAllDialog();
    }

    async function delayCard() {
        await doStopCards(String(delayDays), [{ ial: { id: $id } }] as any);
        pressSkip();
    }

    async function setPri() {
        const cardID = await getIDFromCard();
        if (cardID) {
            const blocks = await siyuan
                .getRiffCardsByBlockIDs([cardID])
                .then((r) => {
                    return [...r.values()].flat();
                });
            cardPriorityBox?.updateDocPriorityBatchDialog(blocks);
        }
    }

    async function gotoCard() {
        closeAllDialog();
        OpenSyFile2(getTomatoPluginInstance(), $id);
        locTree($id);
    }

    async function deleteCardDeleteContent() {
        confirm("🗑️" + tomatoI18n.删除内容块, msg.slice(0, 50), async () => {
            await deleteBlock($id);
            await deleteCard();
        });
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<DialogSvelte
    maxWidth="200"
    show={$show}
    title={tomatoI18n.闪卡工具}
    zIndexPlus
    savePositionKey="card box sv 2025-07-22 10:33:26"
>
    {#snippet dialogInner()}
        <div class="tomatoflexCol">
            <div
                onmouseenter={() => (showMsg = true)}
                onmouseleave={() => (showMsg = false)}
                class="msg-container"
            >
                💁‍♀️
                {#if showMsg}
                    <p>{msg.slice(0, 500)}</p>
                {/if}
            </div>
            <div>
                {title}
            </div>
            <div>
                <button
                    class="b3-button b3-button--outline tomato-button"
                    onclick={deleteCardDeleteContent}
                    >🗑️{tomatoI18n.删除内容块}</button
                >
                <button
                    title="ctrl+9"
                    class="b3-button b3-button--outline tomato-button"
                    onclick={deleteCard}>🔕{tomatoI18n.取消制卡}</button
                >
                <button
                    class="b3-button b3-button--outline tomato-button"
                    onclick={gotoCard}>🔍{tomatoI18n.定位闪卡}</button
                >
                <button
                    class="b3-button b3-button--outline tomato-button"
                    onclick={setPri}>🔴🟡🟢{tomatoI18n.闪卡优先级}</button
                >
            </div>
            <div>
                <label>
                    <input
                        title={tomatoI18n.使用鼠标滚轮来调整}
                        min="0"
                        step="0.1"
                        bind:value={delayDays}
                        type="number"
                        class="b3-text-field"
                    />
                    {tomatoI18n.天}
                </label>
                <br />
                <button
                    class="b3-button b3-button--outline tomato-button"
                    onclick={delayCard}>📅{tomatoI18n.推迟x小时(hours)}</button
                >
                <br />
                <button
                    title={tomatoI18n.没处理过的闪卡都被推迟}
                    class="b3-button b3-button--outline tomato-button"
                    onclick={() => delayRestCards(false)}
                    >🌊📅{tomatoI18n.推迟余下闪卡x小时(hours)}</button
                >
                {#if $cardBoxSpradEvenlyPostpone}
                    <br />
                    <button
                        disabled={!lastVerifyResult()}
                        class="b3-button b3-button--outline tomato-button"
                        onclick={async () => {
                            if (await verifyKeyTomato()) {
                                await delayRestCards(true);
                            }
                        }}
                        >🌊{tomatoI18n.把剩余闪卡分散推迟在未来x小时内(
                            hours.toFixed(1),
                        )}
                        <TomatoVip codeValid={lastVerifyResult()}
                        ></TomatoVip></button
                    >
                {/if}
            </div>
        </div>
    {/snippet}
</DialogSvelte>
<div id={CardSettingsID}></div>

<style>
    input {
        width: 90px;
    }
    div,
    button {
        margin: 2px;
    }
    .tomatoflexCol {
        margin: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    /* 可以添加一些样式让交互更明显 */
    .msg-container {
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    .msg-container:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
</style>
