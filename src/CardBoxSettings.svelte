<script lang="ts">
    import { confirm, Plugin, IProtyle } from "siyuan";
    import { deleteBlock, siyuan } from "./libs/utils";
    import { onDestroy } from "svelte";
    import { closeAllDialog } from "./libs/keyboard";
    import { doStopCards, getIDFromCard, pressSkip } from "./libs/cardUtils";
    import { cardPriorityBox } from "./CardPriorityBox";
    import { locTree, OpenSyFile2 } from "./libs/docUtils";
    import { DestroyManager } from "./libs/destroyer";
    import { tomatoI18n } from "./tomatoI18n";
    import { cardBoxSpradEvenlyPostpone } from "./libs/stores";
    import { lastVerifyResult, verifyKeyTomato } from "./libs/user";
    import TomatoVIP from "./TomatoVIP.svelte";

    interface Props {
        protyle: IProtyle;
        dm: DestroyManager;
        dialogDiv: HTMLElement;
        plugin: Plugin;
        msg: string;
        id: string;
    }

    let { protyle, dm, dialogDiv, plugin, msg, id }: Props = $props();

    protyle;
    dialogDiv;
    let delayDays = $state(0.1);
    let hours = $derived(delayDays * 24);

    onDestroy(() => {
        dm.destroyBy("svelte");
    });

    export function destroy() {
        dm.destroyBy();
    }

    async function deleteCard() {
        await siyuan.removeRiffCards([id]);
        destroy();
        pressSkip();
    }

    async function delayRestCards(spread: boolean) {
        const blocks = await cardPriorityBox?.getRestCards();
        await doStopCards(String(delayDays), blocks, spread);
        destroy();
        closeAllDialog();
    }

    async function delayCard() {
        await doStopCards(String(delayDays), [
            { ial: { id } },
        ] as GetCardRetBlock[]);
        destroy();
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
        destroy();
        closeAllDialog();
        OpenSyFile2(plugin, id);
        locTree(id);
    }

    async function deleteCardDeleteContent() {
        confirm("⚠️", "🗑️" + tomatoI18n.删除内容块, async () => {
            await deleteBlock(id);
            await deleteCard();
        });
    }
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="protyle-wysiwyg">
    <div class="tomatoflexCol">
        <div>
            {@html msg}
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
            <button class="b3-button b3-button--outline tomato-button" onclick={gotoCard}
                >🔍{tomatoI18n.定位闪卡}</button
            >
            <button class="b3-button b3-button--outline tomato-button" onclick={setPri}
                >🔴🟡🟢{tomatoI18n.闪卡优先级}</button
            >
        </div>

        <!-- {#if cardElement}
            <div title={tomatoI18n.数值大的优先复习}>
                <CardPriorityBar {cardElement} {plugin} isInSettings={true}
                ></CardPriorityBar>
            </div>
        {/if} -->

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
            <button class="b3-button b3-button--outline tomato-button" onclick={delayCard}
                >📅{tomatoI18n.推迟x小时(hours)}</button
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
                    <TomatoVIP codeValid={lastVerifyResult()}
                    ></TomatoVIP></button
                >
            {/if}
        </div>
    </div>
</div>

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
</style>
