<script lang="ts">
    // □3 划线总览浮层（anno-round2 B 案）：全书划线+批注混排总览。
    // 顶部色筛选 chips（零操作语义=划线时选的色，CSS 变量名直引无色值硬表）；
    // 组头=分片/文档名+条数；组内混排：划线卡=色标+高亮原文 / 想法卡=批注文+灰引文
    // （视觉对齐 CommentBox .tomato-anno-item 卡族）；底部多选→收集（collectSelected）。
    // 卡体点击=跳原文块（OpenSyFile2 禁聚焦通道）；勾选框与跳转分区不抢事件。
    import { onMount } from "svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { resolveOverviewScope, filterByColors, type OverviewData, type OverviewItem } from "./libs/annoOverview";
    import { collectSelected, type SelectedItem } from "./libs/annoCollect";
    import { annoTextToHtml } from "./libs/annoKramdown";
    import { fmtAnnoTime } from "./libs/annoPanelList";
    import { commentBox } from "./CommentBox";
    import { OpenSyFile2 } from "./libs/docUtils";

    interface Props {
        seed: { bookID?: string; docID?: string };
        x: number;
        y: number;
        onClose: () => void;
    }
    let { seed, x, y, onClose }: Props = $props();

    let loading = $state(true);
    let failed = $state(false);
    let data: OverviewData | null = $state(null);
    let active = $state<string[]>([]); // 空=全部（chips 多选）
    let selected = $state<string[]>([]); // 数组重赋值（$state(new Set) add 不触发踩坑）
    let collecting = $state(false);

    onMount(async () => {
        try {
            data = await resolveOverviewScope(seed);
        } catch (e) {
            failed = true;
            console.error("[tomato anno] overview failed:", e);
        } finally {
            loading = false;
        }
    });

    // 定位（FloatPopover 三分支同族）：下方优先、上方翻、矮视口按实测贴锚；宽度定档
    // 520（内容密集型浮层，340 清单档太窄），maxH 75vh。窗口尺寸响应式（resize 重算）。
    let vw = $state(window.innerWidth);
    let vh = $state(window.innerHeight);
    let pop: HTMLElement = $state();
    let measuredH = $state(0);
    onMount(() => {
        const ro = new ResizeObserver(() => {
            measuredH = pop.offsetHeight;
        });
        ro.observe(pop);
        return () => ro.disconnect();
    });

    const pos = $derived.by(() => {
        const w = Math.min(520, vw - 16);
        const left = Math.min(Math.max(8, x - w / 2), Math.max(8, vw - 8 - w));
        const maxH = Math.min(Math.round(vh * 0.75), vh - 16);
        const below = y + 8;
        let style: string;
        if (below + maxH <= vh - 8) {
            style = `top:${below}px`;
        } else if (y - 8 >= maxH + 8) {
            style = `bottom:${vh - y + 8}px`;
        } else {
            const top3 = measuredH > 0 ? Math.max(8, y - 8 - measuredH) : Math.max(8, vh - 8 - maxH);
            style = `top:${top3}px`;
        }
        return { left, style, w, maxH };
    });

    // 展示层：过滤在组内做（组头条数跟过滤走）；空组隐藏
    const shownGroups = $derived((data?.groups ?? [])
        .map((g) => ({ meta: g.meta, items: filterByColors(g.items, active) }))
        .filter((g) => g.items.length > 0));
    const totalShown = $derived(shownGroups.reduce((n, g) => n + g.items.length, 0));

    // key → 条目+组名（收集映射走全量条目：过滤只影响可见性，已选跨过滤保留）
    const itemOf = $derived.by(() => {
        const m = new Map<string, { it: OverviewItem; docName: string }>();
        for (const g of data?.groups ?? []) {
            for (const it of g.items) m.set(it.key, { it, docName: g.meta.name });
        }
        return m;
    });

    // 选择集查询面走 Set（reasoning review P1-2：数组 includes 每勾一卡全列表重扫，
    // 大书万级条目点选即冻结；数组仍承载持久化序，Set 只是 derived 投影）
    const selSet = $derived(new Set(selected));

    function toggleChip(v: string) {
        active = active.includes(v) ? active.filter((x) => x !== v) : [...active, v];
    }
    function toggleSel(key: string) {
        selected = selected.includes(key) ? selected.filter((x) => x !== key) : [...selected, key];
    }
    function toggleGroup(g: { items: OverviewItem[] }) {
        const keys = g.items.map((i) => i.key);
        const all = keys.every((k) => selected.includes(k));
        selected = all ? selected.filter((k) => !keys.includes(k)) : [...new Set([...selected, ...keys])];
    }

    function jump(it: OverviewItem) {
        onClose();
        if (commentBox.plugin) void OpenSyFile2(commentBox.plugin, it.hostID);
    }

    async function doCollect(dest: "daily" | "file") {
        if (!data || selected.length === 0 || collecting) return;
        collecting = true;
        try {
            const sel: SelectedItem[] = selected
                .map((k) => itemOf.get(k))
                .filter((v): v is { it: OverviewItem; docName: string } => v != null)
                .map(({ it, docName }) => ({
                    key: it.key,
                    hostID: it.hostID,
                    docID: it.docID,
                    docName,
                    quote: it.quote,
                    markVar: it.markVar,
                    entry: it.entry,
                }));
            await collectSelected(sel, dest, data.scopeName);
        } finally {
            collecting = false;
        }
    }

    function onOutside(ev: MouseEvent) {
        if (!(ev.target as HTMLElement)?.closest?.(".tomato-anno-ov")) onClose();
    }

    function cut(s: string, n = 120) {
        const cps = [...s.replace(/\s+/g, " ").trim()];
        return cps.length > n ? cps.slice(0, n).join("") + "…" : cps.join("");
    }
</script>

<svelte:window
    onkeydown={(e) => {
        if (e.key === "Escape") onClose();
    }}
    onmousedown={onOutside}
    onresize={() => { vw = window.innerWidth; vh = window.innerHeight; }}
/>

<div
    class="tomato-anno-ov"
    role="dialog"
    aria-label={tomatoI18n.全书划线总览}
    bind:this={pop}
    style="left:{pos.left}px;{pos.style};width:{pos.w}px;max-height:{pos.maxH}px"
>
    <div class="tomato-anno-ov__head">
        <span class="tomato-anno-ov__title">
            {tomatoI18n.全书划线总览}{#if data?.scopeName}<span class="tomato-anno-ov__scope"> · {data.scopeName}</span>{/if}
        </span>
        <button
            class="tomato-anno-ov__close"
            aria-label={tomatoI18n.退出}
            onclick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        ><svg><use xlink:href="#iconClose"></use></svg></button>
    </div>

    {#if loading}
        <div class="tomato-anno-ov__hint">{tomatoI18n.加载中}</div>
    {:else if failed}
        <div class="tomato-anno-ov__hint">{tomatoI18n.加载失败请重试}</div>
    {:else if !data || data.groups.length === 0}
        <div class="tomato-anno-ov__hint">{tomatoI18n.本书暂无划线与批注}</div>
    {:else}
        <!-- 色筛选 chips：全部档 + 逐色档（点选多选，零操作语义=划线时选的色） -->
        <div class="tomato-anno-ov__chips">
            <button
                class="tomato-anno-ov__chip"
                class:tomato-anno-ov__chip--on={active.length === 0}
                onclick={() => (active = [])}
            >{tomatoI18n.全部} {data.chips.reduce((n, c) => n + c.count, 0)}</button>
            {#each data.chips as c (c.value)}
                <button
                    class="tomato-anno-ov__chip"
                    class:tomato-anno-ov__chip--on={active.includes(c.value)}
                    title={c.value === "" ? tomatoI18n.无色 : c.value}
                    onclick={() => toggleChip(c.value)}
                >
                    {#if c.value === ""}
                        <span class="tomato-anno-ov__dot tomato-anno-ov__dot--none"></span>
                    {:else}
                        <span class="tomato-anno-ov__dot" style="background: color-mix(in srgb, var({c.value}) 60%, var(--b3-theme-on-surface));"></span>
                    {/if}
                    {c.count}
                </button>
            {/each}
        </div>

        <div class="tomato-anno-ov__body">
            {#each shownGroups as g (g.meta.docID)}
                <div class="tomato-anno-ov__group">
                    <div class="tomato-anno-ov__ghead">
                        <button
                            class="tomato-anno-ov__gname"
                            title={g.meta.name}
                            onclick={() => toggleGroup(g)}
                        >{g.meta.name || "…"}</button>
                        <span class="tomato-anno-ov__gcount" aria-label={tomatoI18n.共N条(g.items.length)}>{g.items.length}</span>
                    </div>
                    {#each g.items as it (it.key)}
                        <div class="tomato-anno-ov__card" class:tomato-anno-ov__card--sel={selSet.has(it.key)}>
                            <label class="tomato-anno-ov__checkwrap">
                                <input
                                    class="tomato-anno-ov__check"
                                    type="checkbox"
                                    checked={selSet.has(it.key)}
                                    onchange={() => toggleSel(it.key)}
                                />
                            </label>
                            <div
                                class="tomato-anno-ov__cardbody"
                                role="button"
                                tabindex="0"
                                title={tomatoI18n.定位}
                                onclick={() => jump(it)}
                                onkeydown={(e) => {
                                    if (e.key === "Enter") jump(it);
                                }}
                            >
                                {#if it.kind === "anno" && it.entry!.text.replace(/[\s\u200b]/g, "") !== ""}
                                    <div class="tomato-anno-ov__meta">
                                        {#if it.markVar}<span class="tomato-anno-ov__dot" style="background: color-mix(in srgb, var({it.markVar}) 60%, var(--b3-theme-on-surface));"></span>{:else}<span class="tomato-anno-ov__dot tomato-anno-ov__dot--placeholder"></span>{/if}
                                        <span class="tomato-anno-ov__time">{fmtAnnoTime(it.entry!.time)}</span>
                                    </div>
                                    <div class="tomato-anno-ov__text">{@html annoTextToHtml(it.entry!.text)}</div>
                                    {#if it.quote}<div class="tomato-anno-ov__quote">{cut(it.quote)}</div>{/if}
                                {:else}
                                    <div class="tomato-anno-ov__mark"
                                        style={it.markVar ? `--ov-mark: var(${it.markVar});` : ""}
                                    >{cut(it.quote)}</div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {/each}
            {#if totalShown === 0}
                <div class="tomato-anno-ov__hint">{tomatoI18n.本书暂无划线与批注}</div>
            {/if}
        </div>

        <div class="tomato-anno-ov__foot">
            <span class="tomato-anno-ov__selcount">{tomatoI18n.已选条数(selected.length)}</span>
            <button
                class="b3-button b3-button--small"
                disabled={selected.length === 0 || collecting}
                onclick={() => void doCollect("daily")}
            >{tomatoI18n.收集到当天日记}</button>
            <button
                class="b3-button b3-button--text"
                disabled={selected.length === 0 || collecting}
                onclick={() => void doCollect("file")}
            >{tomatoI18n.收集到文件}</button>
        </div>
    {/if}
</div>

<style>
    /* 容器：prog-popover 视觉族（b3 变量全自适应明暗），z=1000（常驻浮层安全档上、内核弹层下） */
    .tomato-anno-ov {
        position: fixed;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        border-radius: 8px;
        border: 1px solid var(--b3-border-color);
        background: var(--b3-theme-surface);
        box-shadow: var(--b3-dialog-shadow, var(--b3-point-shadow));
        overflow: hidden;
        z-index: 1000;
        animation: tomato-anno-ov-in 0.14s ease-out;
    }
    @keyframes tomato-anno-ov-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .tomato-anno-ov__head {
        flex: none;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 8px;
        border-bottom: 1px solid var(--b3-border-color);
    }
    .tomato-anno-ov__title {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.4;
        color: var(--b3-theme-on-surface);
    }
    .tomato-anno-ov__scope {
        font-weight: 400;
        opacity: 0.66;
    }
    .tomato-anno-ov__close {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        padding: 0;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
    }
    .tomato-anno-ov__close:hover { background-color: var(--b3-list-hover); }
    .tomato-anno-ov__close svg { width: 14px; height: 14px; }

    .tomato-anno-ov__hint {
        padding: 20px 12px;
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        opacity: 0.6;
        text-align: center;
    }

    /* chips 行：sticky 钉顶（长清单滚动不丢筛选） */
    .tomato-anno-ov__chips {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 6px 8px;
        background: var(--b3-theme-surface);
        border-bottom: 1px solid var(--b3-border-color);
    }
    .tomato-anno-ov__chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        font-size: 11px;
        line-height: 1.5;
        border: 1px solid var(--b3-border-color);
        border-radius: 999px;
        background: transparent;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
    }
    .tomato-anno-ov__chip:hover { background-color: var(--b3-list-hover); }
    .tomato-anno-ov__chip--on {
        border-color: var(--b3-theme-primary);
        color: var(--b3-theme-primary);
        background: color-mix(in srgb, var(--b3-theme-primary) 8%, transparent);
    }
    .tomato-anno-ov__dot {
        flex: none;
        width: 10px;
        height: 10px;
        border-radius: 999px;
        border: 1px solid var(--b3-border-color);
    }
    .tomato-anno-ov__dot--placeholder {
        background: transparent;
        border-color: transparent;
    }
    .tomato-anno-ov__dot--none {
        background: transparent;
        /* 无色档：斜杠表达「无」 */
        background-image: linear-gradient(45deg, transparent 44%, var(--b3-theme-on-surface) 46%, var(--b3-theme-on-surface) 54%, transparent 56%);
        opacity: 0.66;
    }

    .tomato-anno-ov__body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 4px 0;
    }

    .tomato-anno-ov__group { margin-bottom: 4px; }
    .tomato-anno-ov__ghead {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px 2px;
    }
    .tomato-anno-ov__gname {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
        padding: 0;
        border: none;
        background: transparent;
        font-size: 11px;
        font-weight: 600;
        color: var(--b3-theme-on-surface);
        opacity: 0.78;
        cursor: pointer;
    }
    .tomato-anno-ov__gname:hover { opacity: 1; }
    .tomato-anno-ov__gcount {
        flex: none;
        min-width: 18px;
        padding: 0 6px;
        font-size: 10px;
        line-height: 16px;
        text-align: center;
        border-radius: 999px;
        color: var(--b3-theme-on-surface);
        background: var(--b3-theme-background-light, var(--b3-theme-surface-light));
        opacity: 0.85;
    }

    /* 卡片：CommentBox .tomato-anno-item 卡族视觉对齐（本组件 scoped 自持副本） */
    .tomato-anno-ov__card {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin: 0 8px 6px;
        padding: 6px 8px;
        border: 1px solid var(--b3-border-color);
        border-radius: 8px;
        background: var(--b3-theme-background);
    }
    .tomato-anno-ov__card--sel {
        border-color: var(--b3-theme-primary);
        background: color-mix(in srgb, var(--b3-theme-primary) 6%, var(--b3-theme-background));
    }
    .tomato-anno-ov__checkwrap {
        flex: none;
        display: flex;
        align-items: flex-start;
        padding: 2px 5px 5px 2px;
        margin: -2px 0 -5px -2px; /* 热区外扩到 24px 档不顶卡内边距（vision 终审 P2-1 修） */
        cursor: pointer;
    }
    .tomato-anno-ov__check {
        flex: none;
        width: 14px;
        height: 14px;
        accent-color: var(--b3-theme-primary);
        cursor: pointer;
    }
    .tomato-anno-ov__cardbody {
        flex: 1;
        min-width: 0;
        cursor: pointer;
        border-radius: 4px;
    }
    .tomato-anno-ov__meta {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 2px;
    }
    .tomato-anno-ov__time {
        font-size: 10px;
        font-variant-numeric: tabular-nums;
        color: var(--b3-theme-on-surface);
        opacity: 0.55;
    }
    .tomato-anno-ov__text {
        font-size: 13px;
        line-height: 1.6;
        color: var(--b3-theme-on-surface);
        word-break: break-word;
    }
    /* 批注富文本子集（innerHTML 注入须 :global；annoTextToHtml 已转义） */
    .tomato-anno-ov__text :global(p) { margin: 0 0 4px; }
    .tomato-anno-ov__text :global(ul), .tomato-anno-ov__text :global(ol) { margin: 0 0 4px; padding-left: 18px; }
    .tomato-anno-ov__text :global(li) { margin: 2px 0; }
    .tomato-anno-ov__text :global(strong) { font-weight: 600; }
    .tomato-anno-ov__text :global(code) {
        padding: 1px 4px;
        border-radius: 3px;
        background: var(--b3-theme-surface-light);
        font-size: 0.9em;
    }
    .tomato-anno-ov__text :global(a) { color: var(--b3-protyle-inline-link-color); }
    .tomato-anno-ov__text :global(> :last-child) { margin-bottom: 0; }
    .tomato-anno-ov__quote {
        margin-top: 4px;
        padding-left: 8px;
        border-left: 2px solid var(--b3-border-color);
        font-size: 12px;
        line-height: 1.6;
        color: var(--b3-theme-on-surface);
        opacity: 0.6;
        word-break: break-word;
    }
    /* 划线卡：mark 底色染 18%（CSS 变量名直引，明暗随主题） */
    .tomato-anno-ov__mark {
        font-size: 13px;
        line-height: 1.7;
        color: var(--b3-theme-on-surface);
        word-break: break-word;
        border-radius: 4px;
        padding: 1px 3px 1px 6px;
        border-left: 3px solid color-mix(in srgb, var(--ov-mark, var(--b3-border-color)) 75%, var(--b3-theme-on-surface));
        background: color-mix(in srgb, var(--ov-mark, var(--b3-theme-surface-light)) 38%, transparent);
    }

    /* 底栏：sticky 钉底（BookCardsPopover deck-wrap 同款防滚出视野） */
    .tomato-anno-ov__foot {
        position: sticky;
        bottom: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-top: 1px solid var(--b3-border-color);
        background: var(--b3-theme-surface);
    }
    .tomato-anno-ov__selcount {
        flex: 1;
        min-width: 0;
        font-size: 11px;
        color: var(--b3-theme-on-surface);
        opacity: 0.66;
    }
</style>
