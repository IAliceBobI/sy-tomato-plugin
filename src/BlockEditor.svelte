<script lang="ts">
    import { onMount } from "svelte";
    import { createProtyle } from "./libs/bkUtils";
    import { DestroyManager } from "./libs/destroyer";
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    import { appendSuperBlock, getDocBlocks, OpenSyFile2 } from "./libs/docUtils";
    import { getTomatoPluginInstance, siyuan } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    import { isBigBlock } from "./BlockEditor";
    import { currentBockEditorDocID, currentProtyle, events } from "./libs/Events";
    import { navSourceBlock } from "./libs/stores";

    interface Props {
        dm: DestroyManager;
    }
    let { dm }: Props = $props();
    let docName = $state("");
    let blocks = $state<Block[]>([]);
    let editor = $state<HTMLElement>(null);
    let pob = $state<ReturnType<typeof createProtyle>>(null);
    let selectedBlockID = $state("");
    let currentDocID = "";
    let show = $state(false);

    onMount(async () => {
        dm?.add("close protyle", closeProtyle);
        await reloadBlocks();
        if (dm) {
            show = true;
        }
    });

    $effect(() => {
        if (currentDocID != $currentBockEditorDocID) {
            currentDocID = $currentBockEditorDocID;
            selectedBlockID = "";
            closeProtyle();
            reloadBlocks();
            if (!dm) {
                const { attrs } = events.getInfo($currentProtyle?.protyle);
                if (attrs["custom-book-writing"]) {
                    show = true;
                } else {
                    show = false;
                }
            }
        }
    });

    function defaultSelect() {
        if (selectedBlockID != "") return;
        for (const b of blocks) {
            if (b.content?.includes("outline")) {
                mountProtyle(b.id);
                return;
            }
        }
        mountProtyle(blocks.at(0)?.id);
    }

    async function reloadBlocks() {
        if (!$currentBockEditorDocID) return;
        const row = await siyuan.getRowByID($currentBockEditorDocID);
        if (!row.id) return;
        docName = row.content;
        const { root } = await getDocBlocks(row.id, row.content, false, true, 1);
        blocks = root.children.mapfilter((block) => {
            if (isBigBlock(block.div)) {
                block.content = block.div.firstElementChild.textContent;
                return block;
            }
        });
        defaultSelect();
    }

    function closeProtyle() {
        editor?.childNodes?.forEach((e) => e.parentElement?.removeChild(e));
        pob?.p?.destroy();
        pob?.ob?.disconnect();
        pob = null;
    }

    function mountProtyle(blockID: string) {
        if (!blockID) return;
        if (!editor) return;
        selectedBlockID = blockID;
        closeProtyle();
        editor.style.minHeight = "auto";
        pob = createProtyle(blockID, getTomatoPluginInstance());
        if (pob && pob.p && pob.ob) {
            editor.appendChild(pob.p.protyle.element);
        }
    }
    function locate() {
        OpenSyFile2(getTomatoPluginInstance(), selectedBlockID);
    }
</script>

<DialogSvelte
    maxWidth="200"
    show={show && $navSourceBlock}
    title={docName}
    {dm}
    savePositionKey="块编辑器 2025年9月1日22:06:25"
>
    {#snippet dialogInner()}
        <div class="sticky-header">
            <div class="btnLine">
                <button title={tomatoI18n.定位} class="b3-button b3-button--text tomato-button" onclick={locate}
                    >🎯</button
                >
                <button
                    title="♻️{tomatoI18n.刷新}"
                    class="b3-button b3-button--text tomato-button"
                    onclick={reloadBlocks}
                    >♻️
                </button>
                <button
                    title="➕{tomatoI18n.超级块}"
                    class="b3-button b3-button--text tomato-button"
                    onclick={async () => {
                        let text = "";
                        if (!dm) text = "outline";
                        const id = await appendSuperBlock($currentBockEditorDocID, text);
                        mountProtyle(id);
                    }}
                    >➕
                </button>
                {#if dm}
                    <button
                        title={tomatoI18n.退出}
                        class="b3-button b3-button--text tomato-button"
                        onclick={() => dm.destroyBy()}>🏃</button
                    >
                {/if}
            </div>
            {#each blocks as block (block.id)}
                <button
                    class:b3-button--outline={selectedBlockID != block.id}
                    class="b3-button tomato-button"
                    onclick={() => mountProtyle(block.id)}>[{block.content.slice(0, 15)}]</button
                >
            {/each}
        </div>
        <div bind:this={editor}></div>
    {/snippet}
</DialogSvelte>

<style>
    .btnLine {
        display: flex;
        width: 100%;
        gap: 8px;
    }
    .btnLine .b3-button {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px;
    }
    .sticky-header {
        position: sticky;
        top: -5px;
        z-index: 5;
        background: var(--b3-theme-surface);
        padding: 5px 0 0 0;
        margin: 0;
    }
</style>
