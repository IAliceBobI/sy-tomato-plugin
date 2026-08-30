<script lang="ts">
    import { onMount } from "svelte";
    import { storeNoteBox_selectedNotebook } from "./libs/stores";
    import { siyuan } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";

    // 渐进 □2 复用扩展：bare=不渲染 label 文本（宿主行内自排文案）；
    // emptyLabel/emptyTitle 覆盖空选项语义；store 放宽兼容 settingFactory 家族
    // （onchange 探测落盘：notebookStoreFactory 有 save()，settingFactory 无 save
    // 则交宿主面板关闭时统一 saveData，此处不重复落盘）
    interface Props {
        store?: any;
        bare?: boolean;
        emptyLabel?: () => string;
        emptyTitle?: () => string;
    }

    let {
        store = storeNoteBox_selectedNotebook,
        bare = false,
        emptyLabel = () => tomatoI18n.自动,
        emptyTitle = () => tomatoI18n.自动选择一个笔记本,
    }: Props = $props();
    let notebooksPromise: Promise<LsNotebook[]> = $state();
    onMount(() => {
        // 只列开着的笔记本；存量值指向已关闭/已删笔记本时补失效占位项防 select 空白
        notebooksPromise = siyuan.lsNotebooks(false);
    });
</script>

{#if notebooksPromise}
    {#await notebooksPromise}
        <p>...waiting</p>
    {:then notebooks}
        <label>
            {#if !bare}{tomatoI18n.笔记本}{/if}
            <select
                bind:value={$store}
                class="b3-select"
                onchange={() => {
                    if (typeof store.save === "function") store.save();
                }}
            >
                <option value="" title={emptyTitle()}>
                    {emptyLabel()}
                </option>
                {#if $store && !notebooks.some((nb) => nb.id === $store)}
                    <option value={$store} selected>
                        {`${String($store).slice(0, 12)}… ${tomatoI18n.已失效请重新选择}`}
                    </option>
                {/if}
                {#each notebooks as nb}
                    <option value={nb.id} title="{tomatoI18n.选择} : {nb.name}">
                        {nb.name}
                    </option>
                {/each}
            </select></label
        >
    {/await}
{/if}
