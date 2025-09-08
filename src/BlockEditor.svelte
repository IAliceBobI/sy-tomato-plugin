<script lang="ts">
    import { onMount } from "svelte";
    import { createProtyle } from "./libs/bkUtils";
    import { DestroyManager } from "./libs/destroyer";
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    import { appendSuperBlock, getDocBlocks, OpenSyFile2 } from "./libs/docUtils";
    import { getTomatoPluginInstance, siyuan } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    import { isBigBlock } from "./BlockEditor";

    // if (isMe()) {
    //     const handleKeyDown = (event: KeyboardEvent) => {
    //         if (event.shiftKey && event.key === "F4") {
    //             event.preventDefault();
    //             dm.destroyBy();
    //         }
    //     };
    //     window.addEventListener("keydown", handleKeyDown);
    //     dm.add("remove keydown listener", () => {
    //         window.removeEventListener("keydown", handleKeyDown);
    //     });
    // }
    // pob.p.protyle.ws.ws.addEventListener("message", (ev) => {
    //     for (const op of getDoOperations(JSON.parse(ev.data))) {
    //         if (op.action == "delete") {
    //             if (op.id === blockID) {
    //                 dm.destroyBy();
    //                 return;
    //             }
    //         }
    //     }
    // });

    interface Props {
        blockID: string;
        dm: DestroyManager;
    }
    let { blockID, dm }: Props = $props();
    let docName = $state("");
    let blocks = $state<Block[]>([]);
    let editor = $state<HTMLElement>(null);
    let pob = $state<ReturnType<typeof createProtyle>>(null);
    let selectedBlockID = $state(blockID);
    let docID = $state("");

    onMount(async () => {
        dm.add("close protyle", closeProtyle);
        await reloadBlocks();
    });

    async function reloadBlocks() {
        const row = await siyuan.getDocRowByBlockID(blockID);
        docName = row.content;
        docID = row.id;
        const { root } = await getDocBlocks(row.id, row.content, false, true, 1);
        blocks = root.children.mapfilter((block) => {
            if (isBigBlock(block.div)) {
                block.content = block.div.textContent;
                return block;
            }
        });
    }

    function closeProtyle() {
        editor?.childNodes?.forEach((e) => e.parentElement?.removeChild(e));
        pob?.p?.destroy();
        pob?.ob?.disconnect();
        pob = null;
    }

    function mountProtyle(blockID: string) {
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

<DialogSvelte maxWidth="200" show={true} title={docName} {dm} savePositionKey="块编辑器 2025年9月1日22:06:25">
    {#snippet dialogInner()}
        <div class="btnLine">
            <button title={tomatoI18n.定位} class="b3-button b3-button--text tomato-button" onclick={locate}>🎯</button>
            <button class="b3-button b3-button--text tomato-button" onclick={reloadBlocks}>♻️{tomatoI18n.刷新}</button>
            <button
                class="b3-button b3-button--text tomato-button"
                onclick={async () => {
                    const id = await appendSuperBlock(docID);
                    mountProtyle(id);
                }}>➕{tomatoI18n.超级块}</button
            >
            <button
                title={tomatoI18n.退出}
                class="b3-button b3-button--text tomato-button"
                onclick={() => dm.destroyBy()}>🏃</button
            >
        </div>
        {#each blocks as block (block.id)}
            <button
                class:b3-button--outline={selectedBlockID != block.id}
                class="b3-button tomato-button"
                onclick={() => mountProtyle(block.id)}>{block.content.slice(0, 12)}</button
            >
        {/each}
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
</style>
