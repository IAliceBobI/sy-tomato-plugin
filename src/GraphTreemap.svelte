<!-- src/GraphTreemap.svelte
  treemap 战役 □3（2026-09-17）：块关系图第三视图档「方块总览」渲染层——磁盘清理工具
  形态的 squarified treemap（算法=libs/graphTreemap.computeTreemap，□1 产物）。
  数据=结构视图同源（outline 真值骨架 rows+StructureInfo，□2 产物），渲染层与 xyflow
  画布互斥（GraphBox.svelte 按 graphMode 条件挂载，xyflow 那套节点/边 writable 不动）。

  设计约束（brainstorm 拍板，勿翻案）：
  - 画布即文档（根矩形不输出）；一级矩形=章、章内叶子块小矩形铺底（体量直觉靠叶子撑出）
  - 面积权重=字数非块数；叶子 <4px 归并进章底色（算法层已滤）
  - 双击章节下钻（子树铺满画布）+面包屑（文档›章›节）可点返回（信息平铺不藏 hover）
  - 单击=选中态（□4 扩工具条/引用高亮）；下钻态组件内 $state，切档/切文档由父层重挂重置
  - 明暗走主题变量形态：CSS 自定义属性 + html[data-theme-mode=dark] 分支（3.8.3 判据）
-->
<script lang="ts">
    import { computeTreemap, matchRefFocus, resolveHighlightId, type RefLinkLike, type TreemapRect } from "./libs/graphTreemap";
    import type { StructureInfo } from "./libs/graphStructure";
    import { containerLabel, formatCharsVolume } from "./libs/graphSkeleton";
    import { tomatoI18n } from "./tomatoI18n";

    let { rows, info, docID, docName, refLinks = [], onOpenDoc }: {
        rows: Block[];
        info: StructureInfo;
        docID: string;
        docName: string;
        /** 引用边（重定向前原始端点=叶子粒度；isRef 已在数据源侧过滤） */
        refLinks?: RefLinkLike[];
        /** 跳原文（OpenSyFile2 禁聚焦通道；peer 可为块 id） */
        onOpenDoc?: (id: string) => void;
    } = $props();

    let canvasBoxEl: HTMLElement;
    let cw = $state(0);
    let ch = $state(0);

    // 下钻栈：[{id, label}]——空=整文档（画布即文档根）；切档/切文档由父层重挂整组件重置
    let drill = $state<{ id: string; label: string; hue: number }[]>([]);
    let selectedId = $state<string | undefined>(undefined);

    // review P1-1：量的是 .tm-canvas（非含面包屑的根）——下钻面包屑出现时画布真变尺寸，
    // RO 自然重算，矩形铺满区=实际画布（否则按根高铺的矩形底部被裁 ~29px）
    $effect(() => {
        if (!canvasBoxEl) return;
        const ro = new ResizeObserver(entries => {
            const r = entries[0]?.contentRect;
            if (r) { cw = Math.round(r.width); ch = Math.round(r.height); }
        });
        ro.observe(canvasBoxEl);
        return () => ro.disconnect();
    });

    // graphmark 期3：marks 档迁回结构树渲染（标记路径过滤）——本组件 marks 权重覆盖/
    // 标记色底消费退役（方块家族降纯手动档，bear 拍板「旧 marks 默认退役」）
    const rects = $derived.by(() => {
        if (!cw || !ch || !info) return [] as TreemapRect[];
        // review P3：下钻目标被编辑删除时死链自愈（面包屑滤掉块集外章节退全景）
        const live = drill.filter(d => rows.some(r => r.id === d.id));
        if (live.length !== drill.length) drill = live;
        const rootID = live.at(-1)?.id;
        try {
            return computeTreemap(rows, info, cw, ch, { docID, rootID });
        } catch {
            return [] as TreemapRect[];
        }
    });

    // 章色（golden-angle 轮换）沿 DFS 序传递：computeTreemap 输出序=先父后子，
    // 栈式回退（depth 弹栈）让嵌套容器/叶子继承所属一级章的 hue
    const hueOfId = $derived.by(() => {
        const m = new Map<string, number>();
        const stack: Array<{ depth: number; hue: number }> = [];
        let wheel = 0;
        // 下钻态（vision P1-1）：一级 hue 锚定下钻根在全景的 hue + 24° 小步进（层级连续感，
        // 不重开 golden-angle 大轮换）；全景态=golden-angle
        const drillBase = drill.at(-1)?.hue;
        for (const r of rects) {
            while (stack.length && stack[stack.length - 1].depth >= r.depth) stack.pop();
            if (r.depth === 1) {
                wheel++;
                stack.push({ depth: 1, hue: drillBase !== undefined ? (drillBase + wheel * 24) % 360 : (wheel * 137.508) % 360 });
            } else if (r.kind === "container") {
                stack.push({ depth: r.depth, hue: stack[stack.length - 1]?.hue ?? 210 });
            }
            m.set(r.id, stack[stack.length - 1]?.hue ?? 210);
        }
        return m;
    });

    const crumbs = $derived([{ id: "", label: docName }, ...drill]);

    // □4 引用聚焦：选中块 → 出边 peer（主题色描边）与入边 peer（强调色描边）匹配。
    // ctx 两映射：containerOfLeaf=info 现成；parentOf=容器树 parent_id（含跨文档行无妨，
    // 其链=自身）。matchRefFocus 纯函数（单测覆盖），此处零逻辑
    const parentOf = $derived(new Map(rows.map(r => [r.id, r.parent_id ?? ""])));
    const focus = $derived.by(() => {
        if (!selectedId || !refLinks.length) return null;
        return matchRefFocus(refLinks, selectedId, { containerOfLeaf: info.containerOfLeaf, parentOf });
    });
    const rectIds = $derived(new Set(rects.map(r => r.id))); // review P2-7：单份构建
    const outPeers = $derived.by(() => {
        // review P2-1：选中自身排除（归并叶子 peer 上爬回选中容器时无再描边意义，
        // 且虚线 peer 声明在后会盖掉选中实线语义）
        if (!focus) return new Set<string>();
        // peer 无矩形（b 壳/归并叶子/跨文档）→ 锚链最近有矩形容器承载描边（纯函数单测覆盖）
        return new Set(focus.outgoing.map(p => resolveHighlightId(p.peerId, rectIds, { containerOfLeaf: info.containerOfLeaf, parentOf })).filter((x): x is string => !!x && x !== selectedId));
    });
    const inPeers = $derived.by(() => {
        if (!focus) return new Set<string>();
        return new Set(focus.incoming.map(p => resolveHighlightId(p.peerId, rectIds, { containerOfLeaf: info.containerOfLeaf, parentOf })).filter((x): x is string => !!x && x !== selectedId));
    });
    const focusActive = $derived(selectedId !== undefined && !!focus);

    function onWindowKeydown(e: KeyboardEvent) {
        if (e.key === "Escape" && selectedId !== undefined) selectedId = undefined;
    }

    /** 工具条条目摘要：锚文本优先（≈目标块摘要——思源锚文本默认取自目标块文字），
     *  空锚回退 peer 块摘要（容器行在 rows；叶子不在 rows 时落 id 尾 6 位） */
    function peerText(p: { peerId: string; label: string }): string {
        return p.label || labelOf(p.peerId);
    }

    const labelOf = (id: string): string => {
        const r = rows.find(x => x.id === id);
        const text = r?.content?.replace(/^#+\s*/, "");
        // □8 合成壳行 content=""（synthesizeListShells）——空串 replace 仍空串，
        // 壳格标签条曾只剩裸字数（vision P1）；容器名走 containerLabel 共用兜底
        if (text) return text;
        return (r && containerLabel(r.type)) || id.slice(-6);
    };

    function onRectClick(e: MouseEvent, r: TreemapRect) {
        e.stopPropagation();
        selectedId = selectedId === r.id ? undefined : r.id;
    }

    function onRectDblclick(e: Event, r: TreemapRect) {
        if (r.kind !== "container") return;
        e.stopPropagation();
        drill = [...drill, { id: r.id, label: labelOf(r.id), hue: hueOfId.get(r.id) ?? 210 }];
        selectedId = undefined;
    }

    function onCrumb(idx: number) {
        drill = drill.slice(0, Math.max(0, idx)); // idx=0 → 整文档；idx=k → 下钻链截到第 k 步
        selectedId = undefined;
    }

    // 容器标签可读性门槛：矩形太小不渲染文本（P2-4 挂账的渲染侧兜底）
    const showLabel = (r: TreemapRect) => r.kind === "container" && r.w >= 48 && r.h >= 22;
</script>

<div class="treemap-root">
    {#if crumbs.length > 1}
        <div class="tm-crumbs" role="toolbar">
            {#each crumbs as c, i (i)}
                {#if i > 0}<span class="tm-crumbs-sep">›</span>{/if}
                <button class="tm-crumbs-item" class:tm-crumbs-item--cur={i === crumbs.length - 1}
                    title={c.label} onclick={() => onCrumb(i)}>{c.label}</button>
            {/each}
        </div>
    {/if}
    <!-- svelte a11y：canvas 容器 role=none（纯点击清选中，非交互控件语义）。 -->
    <div class="tm-canvas" role="none" class:tm-dimmed={focusActive} bind:this={canvasBoxEl} onclick={() => (selectedId = undefined)}>
        {#each rects as r (r.id)}
            {@const hue = hueOfId.get(r.id) ?? 210}
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -- 动态 role（container=button/leaf=img）静态分析推不出分支 -->
            <div class="tm-rect tm-rect--{r.kind} d{Math.min(r.depth, 3)}" data-block-id={r.id}
                class:tm-rect--sel={selectedId === r.id}
                class:tm-rect--fout={outPeers.has(r.id)}
                class:tm-rect--fin={inPeers.has(r.id)}
                style="left:{r.x}px;top:{r.y}px;width:{r.w}px;height:{r.h}px;--tm-h:{Math.round(hue)}"
                role={r.kind === "container" ? "button" : "img"}
                tabindex={r.kind === "container" ? 0 : undefined}
                aria-label={r.kind === "container" ? labelOf(r.id) : undefined}
                onclick={e => onRectClick(e, r)}
                ondblclick={e => onRectDblclick(e, r)}
                onkeydown={e => {
                    if (e.key === "Enter" && r.kind === "container") onRectDblclick(e, r);
                }}>
                {#if showLabel(r)}
                    <span class="tm-label"><b class="tm-label-name">{labelOf(r.id)}</b>
                        <em class="tm-label-chars">{formatCharsVolume(r.weight, tomatoI18n.lang)}</em></span>
                {/if}
            </div>
        {/each}
        {#if rects.length === 0}
            <div class="tm-empty">…</div>
        {/if}
        <!-- □4 引用聚焦工具条（信息平铺：计数+条目全显，点击跳原文——OpenSyFile2 禁聚焦通道）。
             vision P0 复评：挂在 .tm-canvas 内（真可视区）——treemap-root 的 inset:0 含 dock
             底部拖拽条区，bottom 锚它曾致第二行 chips 探出可视区被拦腰裁切 -->
        {#if selectedId !== undefined && focus}
            <!-- review P2-2：容器层止冒泡——head 行文字/gap 缝隙点击曾冒泡到画布 onclick 清掉整个聚焦态。
                 svelte-ignore：纯防冒泡层非交互本体（按钮各自有键盘语义），canvas 同款 ignore 先例 -->
            <!-- svelte-ignore a11y_click_events_have_key_events, a11y_interactive_supports_focus -->
            <div class="tm-focusbar" role="toolbar" aria-label={tomatoI18n.引用聚焦}
                onclick={e => e.stopPropagation()}>
                <div class="tm-focusbar-head">
                    <span class="tm-focusbar-count tm-focusbar-count--out">{tomatoI18n.它引用的} <b>{focus.outgoing.length}</b></span>
                    <span class="tm-focusbar-sep">·</span>
                    <span class="tm-focusbar-count tm-focusbar-count--in">{tomatoI18n.引用它的} <b>{focus.incoming.length}</b></span>
                    <button class="tm-focusbar-close" aria-label={tomatoI18n.取消} onclick={() => (selectedId = undefined)}>✕</button>
                </div>
                {#if focus.outgoing.length || focus.incoming.length}
                    <div class="tm-focusbar-list">
                        {#each focus.outgoing as p, i (i)}
                            <button class="tm-peer tm-peer--out" title={labelOf(p.peerId)}
                                onclick={e => { e.stopPropagation(); onOpenDoc?.(p.peerId); }}>
                                <span class="tm-peer-dir">→</span>{peerText(p)}</button>
                        {/each}
                        {#each focus.incoming as p, i (i)}
                            <button class="tm-peer tm-peer--in" title={labelOf(p.peerId)}
                                onclick={e => { e.stopPropagation(); onOpenDoc?.(p.peerId); }}>
                                <span class="tm-peer-dir">←</span>{peerText(p)}</button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
<svelte:window onkeydown={onWindowKeydown} />

<style>
    .treemap-root {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        background: var(--b3-theme-background);
        overflow: hidden;
    }
    .tm-crumbs {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 2px;
        padding: 4px 8px;
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        border-bottom: 1px solid var(--b3-border-color);
        background: var(--b3-theme-surface);
    }
    .tm-crumbs-item {
        border: none;
        background: none;
        padding: 2px 6px;
        border-radius: var(--b3-border-radius);
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
        max-width: 14em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .tm-crumbs-item:hover { background: var(--b3-list-hover); }
    .tm-crumbs-item--cur { font-weight: 500; color: var(--b3-theme-on-surface); }
    .tm-crumbs .tm-crumbs-item:not(.tm-crumbs-item--cur) { color: var(--b3-theme-primary); }
    .tm-crumbs .tm-crumbs-item:not(.tm-crumbs-item--cur):hover { text-decoration: underline; }
    .tm-crumbs-sep { opacity: 0.4; }
    .tm-canvas {
        position: relative;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        padding: 2px; /* vision P2：末行章节条防下缘裁切 */
    }
    /* 章色=CSS 变量形态（--tm-h 由内联 style 给），明暗两态在 :global 分支换 s/l */
    .tm-rect {
        position: absolute;
        box-sizing: border-box;
        overflow: hidden;
        user-select: none;
    }
    /* vision P0-2/P1-2：半透明阶梯叠面板底（亮色容器 10%→叶子 24%，叶子比容器深一档；
       暗色更透防实心拼布 16%/32%）；容器 z-index:1 防 DFS 序后画的叶子盖标题条（P0-1） */
    .tm-rect--container {
        background: hsl(var(--tm-h) 55% 46% / 0.10);
        border: 1px solid hsl(var(--tm-h) 52% 44% / 0.35);
        border-radius: 4px;
        cursor: zoom-in;
        z-index: 1;
    }
    .tm-rect--container.d2 { background: hsl(var(--tm-h) 46% 46% / 0.13); border-color: hsl(var(--tm-h) 44% 44% / 0.38); }
    .tm-rect--container.d3 { background: hsl(var(--tm-h) 38% 46% / 0.16); border-color: hsl(var(--tm-h) 36% 44% / 0.40); }
    .tm-rect--leaf {
        background: hsl(var(--tm-h) 60% 44% / 0.24);
        border-radius: 2px;
        cursor: pointer;
    }
    .tm-rect--leaf:hover { background: hsl(var(--tm-h) 62% 42% / 0.34); }
    :global(html[data-theme-mode="dark"]) .tm-rect--container { background: hsl(var(--tm-h) 42% 52% / 0.15); border-color: hsl(var(--tm-h) 38% 56% / 0.38); }
    :global(html[data-theme-mode="dark"]) .tm-rect--container.d2 { background: hsl(var(--tm-h) 34% 52% / 0.18); border-color: hsl(var(--tm-h) 30% 56% / 0.40); }
    :global(html[data-theme-mode="dark"]) .tm-rect--container.d3 { background: hsl(var(--tm-h) 28% 52% / 0.20); border-color: hsl(var(--tm-h) 24% 56% / 0.42); }
    :global(html[data-theme-mode="dark"]) .tm-rect--leaf { background: hsl(var(--tm-h) 45% 52% / 0.34); } /* vision P2：格纹可辨度 */
    :global(html[data-theme-mode="dark"]) .tm-rect--leaf:hover { background: hsl(var(--tm-h) 48% 54% / 0.40); }
    .tm-rect--sel {
        outline: 2px solid var(--b3-theme-primary);
        outline-offset: -2px;
        z-index: 4; /* 选中恒最高（fout=3/fin=2） */
    }
    /* □4 引用聚焦：实线=选中、虚线=peer、色相=方向（正向=主题色与 xyflow 引用边同语义、
       反向=强调色）；聚焦态其余矩形压暗（瞬态——点空白/Esc/✕ 取消）。vision P0：思源主题
       无 --b3-theme-warning 变量（var 无 fallback 整条声明失效描边不画）——warning 系
       用 --b3-card-warning-color（两态自适应）+ 终端兜底 */
    .tm-canvas.tm-dimmed .tm-rect:not(.tm-rect--sel):not(.tm-rect--fout):not(.tm-rect--fin) {
        opacity: 0.45; /* vision P2：亮色 0.35 分层抹平；暗色实测两档均可辨 */
    }
    .tm-rect--fout {
        outline: 2px dashed var(--b3-theme-primary);
        outline-offset: -2px;
        z-index: 3; /* vision P2：fout 容器轮廓被相邻 fin 叶子同 z 覆盖（选中=4 恒最高） */
    }
    .tm-rect--fin {
        outline: 2px dashed var(--b3-card-warning-color, #b45309);
        outline-offset: -2px;
        z-index: 2;
    }
    .tm-focusbar {
        position: absolute;
        left: 8px;
        right: 8px;
        /* vision P0（三轮对质实锤）：思源底部状态栏（#status，高 ~33px）横贯面板下方
           层叠遮挡——bottom:8px 曾把第二行 chips 压进状态栏底下拦腰遮字。抬到状态栏上 */
        bottom: 42px;
        z-index: 5;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 6px 8px;
        border-radius: var(--b3-border-radius-b);
        border: 1px solid var(--b3-border-color);
        background: var(--b3-theme-surface);
        box-shadow: var(--b3-dialog-shadow);
        max-height: calc(100% - 50px);
        overflow: auto;
    }
    .tm-focusbar-head {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--b3-theme-on-surface);
    }
    .tm-focusbar-count--out { color: var(--b3-theme-primary); }
    .tm-focusbar-count--in { color: var(--b3-card-warning-color, #b45309); }
    .tm-focusbar-sep { opacity: 0.4; }
    .tm-focusbar-close {
        margin-left: auto;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        padding: 4px 6px; /* vision P2：可点区提到 ~24px */
        border-radius: var(--b3-border-radius);
    }
    .tm-focusbar-close:hover { background: var(--b3-list-hover); }
    .tm-focusbar-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }
    .tm-peer {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        max-width: 16em;
        border: 1px solid transparent;
        border-radius: var(--b3-border-radius);
        background: var(--b3-list-hover);
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        line-height: 18px;
        padding: 2px 7px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .tm-peer:hover { background: var(--b3-theme-primary-lightest); }
    .tm-peer--out { border-color: var(--b3-theme-primary); }
    .tm-peer--in { border-color: var(--b3-card-warning-color, #b45309); }
    .tm-peer-dir { opacity: 0.6; flex-shrink: 0; }
    .tm-label {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 1px 5px;
        font-size: 11px;
        line-height: 16px;
        background: hsl(var(--tm-h) 55% 40% / 0.22);
        border-radius: 3px 3px 0 0;
        pointer-events: none;
    }
    :global(html[data-theme-mode="dark"]) .tm-label { background: hsl(var(--tm-h) 42% 60% / 0.25); }
    .tm-label-name {
        font-weight: 600;
        color: var(--b3-theme-on-surface);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .tm-label-chars {
        font-style: normal;
        opacity: 0.65;
        flex-shrink: 0;
        color: var(--b3-theme-on-surface);
    }
    .tm-empty {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--b3-theme-on-surface);
        opacity: 0.4;
    }
</style>
