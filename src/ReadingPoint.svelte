<script lang="ts">
    import { Plugin } from "siyuan";
    import { DestroyManager } from "./libs/destroyer";
    import { onMount } from "svelte";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { deleteReadingPointEntry, listReadingPoints } from "./libs/bookmark";
    import { filterReadingPoints, relativeTime, type RPEntry } from "./libs/readingPointCore";
    import { siyuan } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";

    // 「最近在读」面板（readpoint 战役）：按时间倒序的阅读点列表，搜索/跳转/单条删除；
    // 老格式阅读点惰性显示（「旧版」徽章，点击打开阅读点卡片）。

    interface Props {
        plugin: Plugin;
        dm: DestroyManager;
        hotkey: string;
    }

    let { plugin, dm, hotkey }: Props = $props();

    let entries = $state<RPEntry[]>([]);
    let kw = $state("");
    let loading = $state(true);

    const shown = $derived(filterReadingPoints(entries, kw));

    async function refresh() {
        loading = true;
        entries = await listReadingPoints();
        loading = false;
    }
    onMount(() => { void refresh(); });

    function timeText(ts: string) {
        return tomatoI18n.阅读点时间(relativeTime(ts, new Date()));
    }

    async function jump(e: RPEntry) {
        await OpenSyFile2(plugin, e.blockID);
        dm.destroyBy();
    }

    async function del(e: RPEntry) {
        await deleteReadingPointEntry(e);
        await siyuan.pushMsg(tomatoI18n.已删除阅读点, 2000);
        await refresh();
    }
</script>

<div class="rp-panel">
    <input class="b3-text-field rp-search" placeholder={tomatoI18n.搜索文档或摘录} bind:value={kw} />
    <div class="rp-list">
        {#if loading}
            <div class="rp-empty">{tomatoI18n.加载中}</div>
        {:else if shown.length === 0}
            <div class="rp-empty">{entries.length > 0 ? tomatoI18n.无匹配结果 : tomatoI18n.暂无阅读点.replace("{hotkey}", hotkey)}</div>
        {:else}
            {#each shown as e (e.blockID)}
                <div
                    class="rp-item"
                    role="button"
                    tabindex="0"
                    onclick={() => void jump(e)}
                    onkeydown={(ev) => { if (ev.key === "Enter") void jump(e); }}
                >
                    <div class="rp-item__main">
                        <div class="rp-item__path">
                            {e.hpath}
                            {#if e.legacy}<span class="rp-badge">{tomatoI18n.旧版}</span>{/if}
                        </div>
                        <div class="rp-item__excerpt">{e.excerpt || tomatoI18n.空内容}</div>
                    </div>
                    <div class="rp-item__side">
                        {#if timeText(e.ts)}<span class="rp-item__time">{timeText(e.ts)}</span>{/if}
                        <button
                            class="b3-button b3-button--cancel rp-del"
                            aria-label={tomatoI18n.删除}
                            onclick={(ev) => { ev.stopPropagation(); void del(e); }}
                        >
                            <svg><use xlink:href="#iconTrashcan"></use></svg>
                        </button>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .rp-panel {
        display: flex;
        flex-direction: column;
        max-height: min(560px, 68vh);
        overflow: hidden;
        padding-bottom: 8px;
    }
    .rp-search {
        flex: none;
        margin: 8px 16px;
    }
    .rp-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        padding: 4px 8px 12px;
    }
    .rp-empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--b3-theme-on-surface);
        opacity: 0.6;
        font-size: 13px;
        padding: 24px 12px;
        text-align: center;
    }
    .rp-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        margin: 2px 4px;
        border-radius: var(--b3-border-radius, 4px);
        cursor: pointer;
        min-width: 0;
    }
    .rp-item:hover {
        background-color: var(--b3-list-hover);
    }
    .rp-item__main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .rp-item__path {
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        opacity: 0.75;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .rp-badge {
        display: inline-block;
        vertical-align: middle;
        margin-left: 6px;
        padding: 0 5px;
        border-radius: 3px;
        font-size: 11px;
        line-height: 18px;
        color: var(--b3-card-info-color);
        background-color: var(--b3-card-info-background);
    }
    .rp-item__excerpt {
        font-size: 13px;
        color: var(--b3-theme-on-background);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .rp-item__side {
        flex: none;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .rp-item__time {
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        opacity: 0.55;
        white-space: nowrap;
    }
    .rp-del {
        padding: 4px;
        border: none;
        height: auto;
        /* visibility 占位而非 display:none：hover 出现时不把时间列顶横移（vision 复评 P2-2） */
        visibility: hidden;
    }
    .rp-del svg {
        width: 14px;
        height: 14px;
    }
    .rp-item:hover .rp-del,
    .rp-item:focus-within .rp-del {
        visibility: visible;
    }
</style>
