<script lang="ts">
    import { onMount } from "svelte";
    import { storeNoteBox_selectedNotebook } from "./libs/stores";
    import { siyuan } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";

    interface Props {
        store?: typeof storeNoteBox_selectedNotebook;
    }

    let { store = storeNoteBox_selectedNotebook }: Props = $props();
    let notebooksPromise: Promise<LsNotebook[]> = $state();
    onMount(() => {
        notebooksPromise = siyuan.lsNotebooks(false);
    });
</script>

{#if notebooksPromise}
    {#await notebooksPromise}
        <p>...waiting</p>
    {:then notebooks}
        <label>
            {tomatoI18n.笔记本}
            <select
                bind:value={$store}
                class="b3-select"
                onchange={() => {
                    store.save();
                }}
            >
                <option value="" title={tomatoI18n.自动选择一个笔记本}>
                    {tomatoI18n.自动}
                </option>
                {#each notebooks as nb}
                    <option value={nb.id} title="{tomatoI18n.选择} : {nb.name}">
                        [{nb.name}]
                    </option>
                {/each}
            </select></label
        >
    {/await}
{/if}
