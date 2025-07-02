<script lang="ts">
    import { onMount } from "svelte";
    import { ConTreeNode } from "./libs/bkUtils";
    import { backLinkBottomBox } from "./BackLinkBottomBox";
    import { DestroyManager } from "./libs/destroyer";
    import { SPACE } from "./libs/gconst";
    import { OpenSyFile2 } from "./libs/docUtils";
    export let trees: Map<string, ConTreeNode>;
    export let dm: DestroyManager;
    export let depth = 0;
    onMount(() => {});
    export function destroy() {}
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="font">
    {#if trees?.size > 0}
        {#each trees as [k, v]}
            <button
                class="b3-button b3-button--text"
                on:click={(_event) => {
                    dm.destroyBy();
                    OpenSyFile2(backLinkBottomBox.plugin, v.value.id);
                }}
            >
                {SPACE.repeat(depth)} [[ {k.replaceAll("丨", "|").split("|").join(" | ")} ]]</button
            >
            <svelte:self trees={v.children} {dm} depth={depth + 1} />
        {/each}
    {/if}
</div>

<style>
    .font {
        font-size: medium;
    }
</style>
