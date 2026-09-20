<script lang="ts">
    // □3 划线总览浮层（anno-round2 B 案）：全书划线+批注混排总览。
    // 顶部色筛选 chips（零操作语义=划线时选的色，CSS 变量名直引无色值硬表）；
    // 组头=分片/文档名+条数；组内混排：划线卡=色标+高亮原文 / 想法卡=批注文+灰引文
    // （视觉对齐 CommentBox .tomato-anno-item 卡族）；底部多选→收集（collectSelected）。
    // 选择模式（annofix-0918 □1 方案 A 微信读书式，陆杰「常显复选框影响观感」）：
    // 默认纯浏览无框无动作条；头部「选择」进多选（框+全选/收集动作条+点卡即勾），
    // 收集完成或取消退出回纯浏览（选择集清空）。卡体点击=跳原文块（OpenSyFile2
    // 禁聚焦通道），仅浏览态；选择模式点卡=勾选，勾选框与跳转分区不抢事件。
    import { onMount } from "svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { resolveOverviewScope, filterByColors, markVarCss, type OverviewData, type OverviewItem } from "./libs/annoOverview";
    import { collectSelected, type SelectedItem } from "./libs/annoCollect";
    import { annoTextToHtml } from "./libs/annoKramdown";
    import { fmtAnnoTime } from "./libs/annoPanelList";
    import { commentBox } from "./CommentBox";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { debugLog } from "./libs/logUtils";

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
    // 选择模式态（方案 A）：false=纯浏览（无框无动作条），true=多选（框+收集动作条）
    let selMode = $state(false);

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
    // 全选面（当前可见项，跟 chips 过滤走；已选跨过滤保留语义不变）
    const visibleKeys = $derived(shownGroups.flatMap((g) => g.items.map((i) => i.key)));
    const visibleSet = $derived(new Set(visibleKeys));
    const allVisibleSel = $derived(visibleKeys.length > 0 && visibleKeys.every((k) => selSet.has(k)));

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
    function toggleSelectAll() {
        // 取消全选=只剔可见项（过滤外已选保留），全选=可见项并入
        selected = allVisibleSel
            ? selected.filter((k) => !visibleSet.has(k))
            : [...new Set([...selected, ...visibleKeys])];
    }
    function exitSel() {
        selMode = false;
        selected = [];
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
                    ...(it.hostIDs?.length ? { hostIDs: it.hostIDs } : {}),
                    docID: it.docID,
                    docName,
                    quote: it.quote,
                    markVar: it.markVar,
                    entry: it.entry,
                }));
            debugLog("anno_overview", `doCollect selected=${selected.length} sel=${sel.length} withVar=${sel.filter((s) => s.markVar).length}`, "anno");
            await collectSelected(sel, dest, data.scopeName);
            // 收集链自带 pushMsg 回执（成功/失败均 toast，内部吞异常不 reject）——
            // 完成即退出模式回纯浏览（方案 A；失败重选成本可接受，unlock 弹窗分支同）
            exitSel();
        } finally {
            collecting = false;
        }
    }

    function onOutside(ev: MouseEvent) {
        // 选择模式中外点不关浮层（微信读书式：防误触丢选择集，退出走显式取消/Esc）
        if (selMode) return;
        if (!(ev.target as HTMLElement)?.closest?.(".tomato-anno-ov")) onClose();
    }

    function cut(s: string, n = 120) {
        const cps = [...s.replace(/\s+/g, " ").trim()];
        return cps.length > n ? cps.slice(0, n).join("") + "…" : cps.join("");
    }
</script>

<svelte:window
    onkeydown={(e) => {
        if (e.key === "Escape") {
            if (selMode) exitSel();
            else onClose();
        }
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
            class="tomato-anno-ov__selbtn"
            class:tomato-anno-ov__selbtn--on={selMode}
            onclick={(e) => {
                e.stopPropagation();
                if (selMode) exitSel();
                else selMode = true;
            }}
        >{selMode ? tomatoI18n.取消 : tomatoI18n.选择}</button>
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
                        <span class="tomato-anno-ov__dot" style="--ov-dot-color: {markVarCss(c.value)};"></span>
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
                            class:tomato-anno-ov__gname--act={selMode}
                            title={g.meta.name}
                            onclick={() => { if (selMode) toggleGroup(g); }}
                        >{g.meta.name || "…"}</button>
                        <span class="tomato-anno-ov__gcount" aria-label={tomatoI18n.共N条(g.items.length)}>{g.items.length}</span>
                    </div>
                    {#each g.items as it, i (it.key)}
                        {#if it.section && it.sectionID !== g.items[i - 1]?.sectionID}
                            <div class="tomato-anno-ov__sec" title={it.section}><span class="tomato-anno-ov__sec-t">{it.section}</span></div>
                        {/if}
                        <div class="tomato-anno-ov__card" class:tomato-anno-ov__card--sel={selMode && selSet.has(it.key)}>
                            {#if selMode}
                                <label class="tomato-anno-ov__checkwrap">
                                    <input
                                        class="tomato-anno-ov__check"
                                        type="checkbox"
                                        checked={selSet.has(it.key)}
                                        onchange={() => toggleSel(it.key)}
                                    />
                                </label>
                            {/if}
                            <div
                                class="tomato-anno-ov__cardbody"
                                role="button"
                                aria-pressed={selMode ? selSet.has(it.key) : undefined}
                                tabindex="0"
                                title={selMode ? undefined : tomatoI18n.定位}
                                onclick={() => { if (selMode) toggleSel(it.key); else jump(it); }}
                                onkeydown={(e) => {
                                    if (e.key === "Enter") {
                                        if (selMode) toggleSel(it.key);
                                        else jump(it);
                                    }
                                }}
                            >
                                {#if it.kind === "anno" && it.entry!.text.replace(/[\s\u200b]/g, "") !== ""}
                                    <div class="tomato-anno-ov__meta">
                                        {#if it.markVar}<span class="tomato-anno-ov__dot" style="--ov-dot-color: {markVarCss(it.markVar)};"></span>{:else}<span class="tomato-anno-ov__dot tomato-anno-ov__dot--placeholder"></span>{/if}
                                        <span class="tomato-anno-ov__time">{fmtAnnoTime(it.entry!.time)}</span>
                                    </div>
                                    <div class="tomato-anno-ov__text">{@html annoTextToHtml(it.entry!.text)}</div>
                                    {#if it.quote}<div class="tomato-anno-ov__quote">{cut(it.quote)}</div>{/if}
                                {:else}
                                    <div class="tomato-anno-ov__mark"
                                        style={it.markVar ? `--ov-mark: ${markVarCss(it.markVar)};` : ""}
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

        {#if selMode}
            <div class="tomato-anno-ov__foot">
                <span class="tomato-anno-ov__selcount">{tomatoI18n.已选条数(selected.length)}</span>
                <button
                    class="b3-button b3-button--text"
                    disabled={collecting}
                    onclick={toggleSelectAll}
                >{allVisibleSel ? tomatoI18n.取消全选 : tomatoI18n.全选}</button>
                <button
                    class="b3-button b3-button--text"
                    disabled={selected.length === 0 || collecting}
                    onclick={() => void doCollect("file")}
                >{tomatoI18n.收集到文件}</button>
                <button
                    class="b3-button b3-button--small"
                    disabled={selected.length === 0 || collecting}
                    onclick={() => void doCollect("daily")}
                >{tomatoI18n.收集到当天日记}</button>
            </div>
        {/if}
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
    /* 头部「选择/取消」双态钮（方案 A 入口；chip 视觉族轻量文字钮非 b3-button） */
    .tomato-anno-ov__selbtn {
        flex: none;
        padding: 2px 10px;
        margin-right: 2px;
        font-size: 11px;
        line-height: 1.5;
        border: 1px solid var(--b3-border-color);
        border-radius: 999px;
        background: transparent;
        color: var(--b3-theme-on-surface);
        opacity: 0.85;
        cursor: pointer;
    }
    .tomato-anno-ov__selbtn:hover { background-color: var(--b3-list-hover); opacity: 1; }
    .tomato-anno-ov__selbtn--on {
        border-color: var(--b3-theme-primary);
        color: var(--b3-theme-primary);
        opacity: 1;
        /* 与 chip--on 同族语言：选中态补 8% 主色 tint（vision P2-5） */
        background: color-mix(in srgb, var(--b3-theme-primary) 8%, transparent);
    }

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
        /* 着色 dot 公式在此（inline 只喂 --ov-dot-color）——暗色分支混白提亮：
           暗主题色板源色深（bg8=#3a0c09 量级）×on-surface 中灰（#9aa0a6）=1.6:1
           接近不可辨（vision P1 实测）；45% 源色+55% 白 → bg8≈#a69290 ≈4.7:1 */
        background: color-mix(in srgb, var(--ov-dot-color) 60%, var(--b3-theme-on-surface));
    }
    :global(html[data-theme-mode="dark"]) .tomato-anno-ov__dot {
        background: color-mix(in srgb, var(--ov-dot-color) 45%, white);
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
        cursor: default;
    }
    /* 选择模式内组头=整组快选（浏览态纯标题，不可点语义走游标区分） */
    .tomato-anno-ov__gname--act { cursor: pointer; }
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

    /* 二级标题节头（anno-fix □4 微信读书式分节）：弱于组头一级（组=文档、节=h2）。
       省略号挂内层 span（flex 容器上 text-overflow 静默不生效——踩坑表同族，vision P2-1） */
    .tomato-anno-ov__sec {
        display: flex;
        align-items: center;
        gap: 4px;
        margin: 2px 10px 0;
        padding: 4px 0 2px;
        font-size: 11px;
        line-height: 1.4;
        color: var(--b3-theme-on-surface);
        opacity: 0.56;
    }
    .tomato-anno-ov__sec-t {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .tomato-anno-ov__sec::before {
        content: "";
        flex: none;
        width: 3px;
        height: 10px;
        border-radius: 2px;
        background: var(--b3-theme-primary-lighter, var(--b3-theme-primary));
        opacity: 0.8;
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
        /* annofix-0918 □7 P2-2（tailbatch □5）：四边 5px+等量负 margin——热区 21→24px 档，
           padding/margin 同侧等值相消=复选框视觉位置与卡内文字间距零变化（右侧 margin
           保 0：与正文的 5px 视觉间隙不动） */
        padding: 5px;
        margin: -5px 0 -5px -5px;
        cursor: pointer;
        /* 选择模式常显（annofix-0918 □1 方案 A 取代 anno-fix □4 hover 显隐）：
           纯浏览态整块不渲染=无占位无痕迹，框只在选择模式内出现 */
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
    /* 可点性提示（vision P2-6）：浏览态跳原文/选择模式点卡即勾，hover 微底色 */
    .tomato-anno-ov__cardbody:hover { background: color-mix(in srgb, var(--b3-list-hover) 50%, transparent); }
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
    /* 划线卡：mark 底色染 18%（CSS 变量名直引，明暗随主题）。暗色分支先混白再染：
       暗主题色板源色深（bg8 量级）×transparent 直染=轮廓消失（vision P1 实测 1.03:1），
       内层 40% 混白提亮后 18% 弱染，色编码在暗色下可读 */
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
    :global(html[data-theme-mode="dark"]) .tomato-anno-ov__mark {
        border-left-color: color-mix(in srgb, var(--ov-mark, var(--b3-border-color)) 50%, white);
        background: color-mix(in srgb, color-mix(in srgb, var(--ov-mark, var(--b3-theme-surface-light)) 40%, white) 18%, transparent);
    }

    /* 底栏：sticky 钉底（BookCardsPopover deck-wrap 同款防滚出视野）；窄窗兜底换行（vision P2-3） */
    .tomato-anno-ov__foot {
        position: sticky;
        bottom: 0;
        display: flex;
        flex-wrap: wrap;
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
