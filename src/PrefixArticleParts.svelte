<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { DocTracer, getDocTracer, OpenSyFile2 } from "./libs/docUtils";
    import { getTomatoPluginInstance, siyuan } from "./libs/utils";
    interface PropsType {
        dm?: DestroyManager;
        show?: boolean;
    }
    interface PartDate {
        part: string;
        updated: string;
        docID: string;
    }
    let { dm, show = $bindable(true) }: PropsType = $props();
    let tracer: DocTracer;
    let targets: PartDate[] = $state([]);

    async function readParts() {
        const map = new Map<string, PartDate>();
        for (const block of tracer.getDocMap().values()) {
            if (block.content.includes("|") || block.content.includes("丨")) {
                block.content
                    ?.replaceAll("丨", "|")
                    ?.split("|")
                    ?.slice(0, -1)
                    ?.forEach((p) => {
                        map.delete(p);
                        map.set(p, {
                            part: p,
                            updated: block.updated,
                            docID: block.id,
                        });
                    });
            }
        }
        targets = [...map.values()].sort((a, b) => {
            return -a.updated.localeCompare(b.updated);
        });
    }

    async function refresh() {
        await readParts();
        await siyuan.pushMsg(tomatoI18n.刷新, 1000);
    }

    onMount(async () => {
        tracer = await getDocTracer();
        readParts();
    });

    function exit() {
        if (dm) {
            dm.destroyBy();
        } else {
            show = false;
        }
    }
    async function goto(block: PartDate) {
        await OpenSyFile2(getTomatoPluginInstance(), block.docID);
    }
</script>

{#snippet buttons()}
    <div class="action-btns">
        <button class="b3-button b3-button--outline" onclick={refresh}>
            {tomatoI18n.刷新}
        </button>
        <button class="b3-button b3-button--outline" onclick={exit}>
            {tomatoI18n.退出}
        </button>
    </div>
{/snippet}

<DialogSvelte
    bind:show
    title="Tags"
    savePositionKey="prefix parts 2025-07-04 10:48:44"
>
    {#snippet dialogInner()}
        <div>
            {@render buttons()}
            <div class="list">
                {#each targets as block}
                    <button
                        title={block.part}
                        class="b3-button b3-button--text"
                        onclick={() => goto(block)}>{block.part}</button
                    >
                {/each}
            </div>
            {@render buttons()}
        </div>
    {/snippet}
</DialogSvelte>

<style>
    .list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        overflow: auto;
        box-sizing: border-box;
        align-items: flex-start;
    }
    .action-btns {
        display: flex;
        justify-content: flex-end;
        gap: 20px;
        margin: 6px;
    }
    .list > button {
        flex: 0 0 auto;
        width: fit-content;
        box-sizing: border-box;
        background: var(--b3-theme-surface, #f5f5f5);
        border-radius: 4px;
        padding: 8px 12px;
        margin-bottom: 4px;
        word-break: break-all;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: pre-line;
    }
</style>
