<script lang="ts">
    // notebox 战役 2026-09-06：回顾面板翻新=「日记导航器」——转正功能全家退役（用户拍板
    // A：有源收集带块引，源文档反链可见=变相已收集），顶部六月历（半年窗口，当月恒在
    // 末位）双击开日记、单击过滤队列；下方队列新→旧纯浏览。收集章 custom-tomato-idea-time。
    import { siyuan, getTomatoPluginInstance, timeUtil } from "./libs/utils";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { debugLog } from "./libs/logUtils";
    import { tomatoI18n } from "./tomatoI18n";
    import {
        buildMonthCells,
        buildQueue,
        fetchReviewData,
        previewText,
        type ReviewDay,
        type ReviewDoc,
    } from "./libs/dailyReview";

    let loading = $state(true);
    let error = $state(false);
    let days = $state<ReviewDay[]>([]);
    let docs = $state<ReviewDoc[]>([]);
    let filterDay = $state<string | null>(null);
    // 半年窗口起点月：初始=当月-5（当月恒在末位）；「‹ ›」一次翻半年
    type YM = { y: number; m: number };
    const { y, M } = timeUtil.nowYMDStrPad();
    let winStart = $state(addMonths({ y: +y, m: +M }, -5));

    function addMonths(base: YM, k: number): YM {
        const z = base.y * 12 + (base.m - 1) + k;
        return { y: Math.floor(z / 12), m: ((z % 12) + 12) % 12 + 1 };
    }

    // 跨午夜安全：每次派生现取今天（挂件常驻跨天时 today 标记/goToday 不漂移）
    function nowYmd() {
        const t = timeUtil.nowYMDStrPad();
        return t.y + t.M + t.d;
    }

    let months = $derived(Array.from({ length: 6 }, (_, i) => addMonths(winStart, i)));
    let counts = $derived.by(() => {
        const m: Record<string, number> = {};
        for (const d of days) m[d.day] = d.items.length;
        return m;
    });
    // 六个月历逐月现算（42 格纯函数开销可忽略，不做全局缓存——踩坑表）
    let calendars = $derived(
        months.map((ym) => ({ ym, cells: buildMonthCells(ym.y, ym.m, docs, counts, nowYmd()) })),
    );
    let docByDay = $derived(new Map(docs.map((d) => [d.day, d.docID])));
    let shownDays = $derived(filterDay ? days.filter((x) => x.day === filterDay) : days);
    let winLabel = $derived(`${fmtYM(months[0])} ~ ${fmtYM(months[5])}`);

    function fmtYM({ y, m }: YM) {
        return `${y}-${pad2(m)}`;
    }

    async function load() {
        loading = true;
        error = false;
        try {
            const { containers, docs: ds } = await fetchReviewData((stmt) => siyuan.sql(stmt));
            docs = ds;
            days = buildQueue(containers, ds);
        } catch (e) {
            error = true;
            debugLog("daily_review", `load failed: ${String(e)}`, "dailynote");
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        void load();
    });

    function pickDay(day: string) {
        filterDay = filterDay === day ? null : day;
    }
    function shiftWindow(delta: number) {
        winStart = addMonths(winStart, delta * 6);
    }
    function goToday() {
        const t = nowYmd();
        winStart = addMonths({ y: +t.slice(0, 4), m: +t.slice(4, 6) }, -5);
        filterDay = null;
    }
    function fmtDay(day: string) {
        return `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}`;
    }
    function baseName(hpath: string) {
        return hpath.split("/").filter(Boolean).pop() ?? hpath;
    }
    async function openDoc(id: string) {
        await OpenSyFile2(getTomatoPluginInstance(), id).catch(() => null);
    }
    // 双击格子=打开那天日记（无日记日无操作）
    function openDay(day: string) {
        const docID = docByDay.get(day);
        if (docID) void openDoc(docID);
    }
    // 源锚=容器 md 里第一个块引 id（add_ref 产物），点来源=直跳源块
    function openSource(md: string) {
        const m = md.match(/\(\((\d{14}-[a-z0-9]+)/);
        if (m) void openDoc(m[1]);
    }
    function pad2(n: number) {
        return String(n).padStart(2, "0");
    }
</script>

<div class="rvw">
    <div class="rvw__cals">
        <div class="rvw__cals-head">
            <div class="rvw__cals-nav">
                <button class="b3-button b3-button--text rvw__nav" onclick={() => shiftWindow(-1)}>‹</button>
                <span class="rvw__cals-title">{winLabel}</span>
                <button class="b3-button b3-button--text rvw__nav" onclick={() => shiftWindow(1)}>›</button>
            </div>
            <div class="rvw__cals-today">
                <span class="rvw__lg"><i class="rvw__bar"></i><em>{tomatoI18n.有日记}</em></span>
                <button class="b3-button b3-button--text rvw__today" onclick={goToday}>{tomatoI18n.今天}</button>
            </div>
        </div>
        <div class="rvw__cals-grid">
            {#each calendars as cal (fmtYM(cal.ym))}
                <div class="rvw__mini">
                    <div class="rvw__mini-title">{fmtYM(cal.ym)}</div>
                    <div class="rvw__grid rvw__week">
                        <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
                    </div>
                    <div class="rvw__grid">
                        {#each cal.cells as c, i (i)}
                            {#if c.day}
                                <button
                                    class="rvw__cell"
                                    class:rvw__cell--none={c.state === "none"}
                                    class:rvw__cell--has={c.state === "has"}
                                    class:rvw__cell--today={c.today}
                                    class:rvw__cell--sel={filterDay === c.day}
                                    onclick={() => pickDay(c.day!)}
                                    ondblclick={() => openDay(c.day!)}
                                    title={c.count > 0 ? tomatoI18n.当天n条.replace("{n}", String(c.count)) : ""}
                                >
                                    {+c.day.slice(6, 8)}
                                </button>
                            {:else}
                                <span class="rvw__cell rvw__cell--pad"></span>
                            {/if}
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="rvw__list">
        {#if loading}
            <div class="rvw__empty"><span class="rvw__spin"></span></div>
        {:else if error}
            <div class="rvw__empty">
                <span>{tomatoI18n.加载失败请重试}</span>
                <button class="b3-button b3-button--outline" onclick={() => void load()}>{tomatoI18n.重试}</button>
            </div>
        {:else if shownDays.length === 0}
            <div class="rvw__empty">{tomatoI18n.还没有收集的内容}</div>
        {:else}
            {#if filterDay}
                <div class="rvw__filterbar">
                    <span>{fmtDay(filterDay)}</span>
                    <button class="b3-button b3-button--text" onclick={() => (filterDay = null)}>{tomatoI18n.全部}</button>
                </div>
            {/if}
            {#each shownDays as day (day.day)}
                <section class="rvw__day">
                    <header class="rvw__day-head">
                        <span class="rvw__day-date">{#if filterDay !== day.day}{fmtDay(day.day)}{/if}<em class="rvw__day-cnt">{tomatoI18n.n条.replace("{n}", String(day.items.length))}</em></span>
                        <button class="b3-button b3-button--outline" onclick={() => void openDoc(day.docID)}>{tomatoI18n.打开这天日记}</button>
                    </header>
                    {#each day.items as it (it.id)}
                        <div class="rvw__row">
                            <span class="rvw__time">{it.time}</span>
                            <button class="rvw__text" title={tomatoI18n.打开这天日记} onclick={() => void openDoc(it.id)}>
                                {previewText(it.md) || "…"}
                            </button>
                            {#if it.refHpath}
                                <button class="rvw__src" title={it.refHpath} onclick={() => openSource(it.md)}>« {baseName(it.refHpath)}</button>
                            {/if}
                        </div>
                    {/each}
                </section>
            {/each}
        {/if}
    </div>
</div>

<style>
    .rvw {
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 100%;
        min-height: 0;
        padding: 0 12px;
    }

    /* ── 上：六月历（半年窗口，3 列×2 行） ─────────────────── */
    .rvw__cals {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .rvw__cals-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .rvw__cals-nav {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .rvw__nav {
        padding: 2px 10px;
        min-height: 24px;
    }
    .rvw__cals-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--b3-theme-on-background);
        font-variant-numeric: tabular-nums;
    }
    .rvw__cals-today {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .rvw__today {
        font-size: 12px;
        color: var(--b3-theme-primary);
        padding: 2px 4px;
        min-height: 24px;
    }
    .rvw__cals-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px 12px;
    }
    .rvw__mini {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
    }
    .rvw__mini-title {
        font-size: 11px;
        font-weight: 600;
        color: var(--b3-theme-on-surface);
        font-variant-numeric: tabular-nums;
    }
    .rvw__grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
    }
    .rvw__week span {
        text-align: center;
        font-size: 10px;
        line-height: 13px;
        color: var(--b3-theme-on-surface);
        opacity: 0.8;
    }
    .rvw__cell {
        position: relative;
        height: 20px;
        font-size: 10px;
        border: none;
        background: none;
        border-radius: 4px;
        cursor: pointer;
        color: var(--b3-theme-on-background);
        font-variant-numeric: tabular-nums;
    }
    .rvw__cell--pad {
        cursor: default;
    }
    .rvw__cell--none {
        color: var(--b3-theme-on-surface);
        opacity: 0.55;
    }
    .rvw__cell--has {
        color: var(--b3-theme-primary);
    }
    .rvw__cell--has::after {
        content: "";
        position: absolute;
        bottom: 1px;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 2px;
        border-radius: 1px;
        background: var(--b3-theme-primary);
    }
    .rvw__cell--today {
        outline: 1px solid var(--b3-theme-primary);
    }
    /* today 外框已足够标识——has 底部短条让位防双标记叠加（vision P1-1） */
    .rvw__cell--today.rvw__cell--has::after {
        display: none;
    }
    .rvw__cell--sel {
        background: var(--b3-theme-primary);
        color: var(--b3-theme-on-primary);
    }
    .rvw__cell--sel.rvw__cell--has::after {
        background: var(--b3-theme-on-primary);
    }
    .rvw__lg {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }
    /* 文字降透明度即可——容器级 opacity 会连坐图例色板（vision P1-4） */
    .rvw__lg em {
        font-style: normal;
        font-size: 11px;
        color: var(--b3-theme-on-surface);
        opacity: 0.8;
    }
    .rvw__bar {
        display: inline-block;
        width: 10px;
        height: 2px;
        border-radius: 1px;
        background: var(--b3-theme-primary);
    }

    /* ── 下：队列（新→旧纯浏览） ─────────────────── */
    .rvw__list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        border-top: 1px solid var(--b3-border-color);
        padding-top: 8px;
        padding-bottom: 8px;
    }
    .rvw__empty {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: 100%;
        color: var(--b3-theme-on-surface);
        opacity: 0.6;
        font-size: 13px;
    }
    .rvw__spin {
        width: 16px;
        height: 16px;
        border: 2px solid var(--b3-border-color);
        border-top-color: var(--b3-theme-primary);
        border-radius: 50%;
        animation: rvw-rot 0.8s linear infinite;
    }
    @keyframes rvw-rot {
        to { transform: rotate(360deg); }
    }
    .rvw__filterbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        color: var(--b3-theme-on-background);
        padding: 2px 0 6px;
    }
    .rvw__day {
        margin-bottom: 10px;
    }
    .rvw__day-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
    }
    .rvw__day-date {
        font-size: 13px;
        font-weight: 600;
        color: var(--b3-theme-on-background);
    }
    .rvw__day-cnt {
        font-style: normal;
        font-size: 11px;
        font-weight: 400;
        color: var(--b3-theme-on-surface);
        margin-left: 6px;
        opacity: 0.85;
    }
    .rvw__row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 3px 6px 3px 2px;
        border-radius: 4px;
    }
    .rvw__row:hover {
        background: var(--b3-list-hover);
    }
    .rvw__time {
        flex: 0 0 36px;
        font-size: 11px;
        color: var(--b3-theme-on-surface);
        opacity: 0.9;
        font-variant-numeric: tabular-nums;
    }
    .rvw__text {
        flex: 1;
        min-width: 0;
        text-align: left;
        font-size: 13px;
        color: var(--b3-theme-on-background);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .rvw__text:hover {
        color: var(--b3-theme-primary);
    }
    .rvw__src {
        flex: 0 0 auto;
        max-width: 26%;
        font-size: 11px;
        color: var(--b3-theme-on-surface);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        opacity: 0.85;
    }
    .rvw__src:hover {
        color: var(--b3-theme-primary);
        opacity: 1;
    }

    /* 窄屏（含移动端）：日历 3 列→2 列×3 行 */
    @media (max-width: 700px) {
        .rvw__cals-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>
