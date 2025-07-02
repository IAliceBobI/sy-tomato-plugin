<script lang="ts">
    import { Plugin, Dialog } from "siyuan";
    import { DestroyManager } from "./libs/destroyer";
    import { onMount } from "svelte";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { RPType } from "./ReadingPointBox";

    export let plugin: Plugin;
    export let dialog: Dialog;
    export let dm: DestroyManager;
    export let doms: RPType[];
    onMount(() => {
        plugin;
        dialog;
        dm;
    });
    export function destroy() {}
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="protyle-wysiwyg">
    {#each doms as { dom, row, line }}
        {#if row}
            <button
                class="b3-button b3-button--text"
                on:click={() => {
                    OpenSyFile2(plugin, row.id);
                    dm.destroyBy();
                }}>{@html line}</button
            >
        {:else}
            {@html dom}
        {/if}
    {/each}
</div>
