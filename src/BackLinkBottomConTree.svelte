<script lang="ts">
    import BackLinkBottomConTree from './BackLinkBottomConTree.svelte';
    import { onMount } from "svelte";
    import { ConTreeNode } from "./libs/bkUtils";
    import { backLinkBottomBox } from "./BackLinkBottomBox";
    import { DestroyManager } from "./libs/destroyer";
    import { SPACE } from "./libs/gconst";
    import { OpenSyFile2 } from "./libs/docUtils";
    interface Props {
        trees: Map<string, ConTreeNode>;
        dm: DestroyManager;
        depth?: number;
    }

    let { trees, dm, depth = 0 }: Props = $props();
    onMount(() => {});
    export function destroy() {}
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="font">
    {#if trees?.size > 0}
        {#each trees as [k, v]}
            <button
                class="b3-button b3-button--text"
                onclick={(_event) => {
                    dm.destroyBy();
                    OpenSyFile2(backLinkBottomBox.plugin, v.value.id);
                }}
            >
                {SPACE.repeat(depth)} [[ {k.replaceAll("丨", "|").split("|").join(" | ")} ]]</button
            >
            <BackLinkBottomConTree trees={v.children} {dm} depth={depth + 1} />
        {/each}
    {/if}
</div>

<style>
    .font {
        font-size: medium;
    }
</style>
