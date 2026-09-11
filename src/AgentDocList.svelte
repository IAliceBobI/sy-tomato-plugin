<script lang="ts">
    // agentrev □4 Agent 上下文文档选择列表（ConfAgent 领域知识/Skill 两卡共用）：
    // 已选=行式（图标+标题+✕ 删）；添加=行内搜索（300ms 防抖 SQL 按标题/路径查文档，点结果即选）。
    // 设置只存文档 id，标题运行时反查（改名不断链）；已删文档显示占位行可手清。
    import { siyuan } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    import { sqlInList } from "./libs/agentContext";

    /** settingFactory 产物面（string[] 文档 id） */
    interface DocStore {
        subscribe: (fn: (v: string[]) => void) => () => void;
        get(): string[];
        set(v: string[]): void;
        write(v?: string[]): Promise<void>;
    }
    interface Props {
        store: DocStore;
    }
    let { store }: Props = $props();

    /** id→标题缓存：undefined=未解析（瞬时），""=查无（已删/移动） */
    let titles = $state<Record<string, string>>({});
    let search = $state("");
    let results = $state<{ id: string; title: string; hpath: string }[]>([]);
    let searching = $state(false);
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function resolveTitles(missing: string[]) {
        try {
            const rows = await siyuan.sql(`select id, content from blocks where id in (${sqlInList(missing)})`);
            const next = { ...titles };
            for (const id of missing) {
                next[id] = String((rows ?? []).find((r: any) => String(r.id) === id)?.content ?? "").trim();
            }
            titles = next;
        } catch {
            // SQL 失败保持未解析态（显示 id 截断），下次重渲染重试
        }
    }

    // 列表变化→补解析新增 id 的标题（读 titles 计算缺口；写入后缺口清零自然停）
    $effect(() => {
        const missing = ($store ?? []).filter(id => !(id in titles));
        if (missing.length) void resolveTitles(missing);
    });

    function onSearchInput() {
        if (timer) clearTimeout(timer);
        const q = search.trim();
        if (!q) {
            results = [];
            searching = false;
            return;
        }
        searching = true;
        timer = setTimeout(async () => {
            try {
                const esc = q.replace(/'/g, "''");
                const rows = await siyuan.sql(
                    `select id, content, hpath from blocks where type='d' and (content like '%${esc}%' or hpath like '%${esc}%')`
                    + ` order by updated desc limit 12`);
                results = (rows ?? []).map((r: any) => ({
                    id: String(r.id),
                    title: String(r.content ?? "").trim(),
                    hpath: String(r.hpath ?? ""),
                }));
            } catch {
                results = [];
            }
            searching = false;
        }, 300);
    }

    function add(id: string) {
        const cur = [...($store ?? [])];
        if (!cur.includes(id)) void store.write([...cur, id]);
        search = "";
        results = [];
    }

    function remove(id: string) {
        void store.write(($store ?? []).filter(x => x !== id));
    }

    function nameOf(id: string): { text: string; missing: boolean } {
        const t = titles[id];
        if (t === undefined) return { text: id.slice(0, 14), missing: false };
        return t ? { text: t, missing: false } : { text: tomatoI18n.文档缺失, missing: true };
    }
</script>

<div class="agentdocs">
    {#if ($store ?? []).length}
        <div class="agentdocs__list">
            {#each $store as id (id)}
                {@const n = nameOf(id)}
                <div class="agentdocs__row">
                    <svg class="agentdocs__icon"><use xlink:href="#iconFile"></use></svg>
                    <span class="agentdocs__name" class:agentdocs__name--missing={n.missing} title={n.text}>{n.text}</span>
                    <span class="fn__flex-1"></span>
                    <span class="b3-tooltips b3-tooltips__sw agentdocs__del block__icon block__icon--show"
                          aria-label={tomatoI18n.删除} role="button" tabindex="0"
                          onclick={() => remove(id)}
                          onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); remove(id); } }}>
                        <svg><use xlink:href="#iconClose"></use></svg>
                    </span>
                </div>
            {/each}
        </div>
    {:else}
        <div class="agentdocs__empty">{tomatoI18n.未选择文档}</div>
    {/if}
    <div class="agentdocs__addrow">
        <span class="agentdocs__addlabel">+ {tomatoI18n.添加文档}</span>
        <input class="b3-text-field agentdocs__search" placeholder={tomatoI18n.搜索文档占位}
               bind:value={search} oninput={onSearchInput} />
    </div>
    {#if search.trim()}
        {#if results.length}
            <div class="agentdocs__results">
                {#each results as r (r.id)}
                    <button class="agentdocs__result" onclick={() => add(r.id)}
                            class:agentdocs__result--sel={($store ?? []).includes(r.id)}>
                        <svg class="agentdocs__icon"><use xlink:href="#iconFile"></use></svg>
                        <span class="agentdocs__rtitle">{r.title || r.id.slice(0, 14)}</span>
                        <span class="agentdocs__rpath" title={r.hpath}>{r.hpath}</span>
                    </button>
                {/each}
            </div>
        {:else if !searching}
            <div class="agentdocs__noresult">{tomatoI18n.无匹配文档}</div>
        {/if}
    {/if}
</div>

<style>
    .agentdocs {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .agentdocs__list {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .agentdocs__row {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 26px;
        padding: 1px 2px;
    }
    .agentdocs__icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        color: var(--b3-theme-on-surface-light);
    }
    .agentdocs__name {
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .agentdocs__name--missing {
        color: var(--b3-theme-on-surface-light);
        font-style: italic;
    }
    .agentdocs__del svg {
        width: 13px;
        height: 13px;
    }
    .agentdocs__empty {
        font-size: 12px;
        color: var(--b3-theme-on-surface-light);
        padding: 2px 0;
    }
    .agentdocs__addrow {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .agentdocs__addlabel {
        font-size: 12px;
        color: var(--b3-theme-on-surface-light);
        white-space: nowrap;
    }
    .agentdocs__search {
        flex: 1;
        font-size: 12px;
    }
    .agentdocs__results {
        display: flex;
        flex-direction: column;
        gap: 2px;
        max-height: 180px;
        overflow-y: auto;
    }
    .agentdocs__result {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 6px;
        border: 0;
        border-radius: var(--b3-border-radius-b, 4px);
        background: transparent;
        cursor: pointer;
        text-align: left;
        color: var(--b3-theme-on-surface);
    }
    .agentdocs__result:hover {
        background: var(--b3-list-item-hover);
    }
    .agentdocs__result--sel {
        color: var(--b3-theme-on-surface-light);
        cursor: default;
    }
    .agentdocs__rtitle {
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex-shrink: 1;
        min-width: 60px;
    }
    .agentdocs__rpath {
        font-size: 11px;
        color: var(--b3-theme-on-surface-light);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        direction: rtl; /* 长路径保右端（叶子文档名）可见 */
        text-align: right;
    }
    .agentdocs__noresult {
        font-size: 12px;
        color: var(--b3-theme-on-surface-light);
        padding: 2px 0;
    }
</style>
