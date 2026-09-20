<script lang="ts">
    // graphbox 期2（2026-09-04）：GraphBox 自定义节点——折叠角标与 ¶×N 段落链大节点。
    // 期3：视觉按 docs/graphbox-visual-spec.md 定稿（§2 普通/§4 折叠/§5 角标/§8 跨文档
    // 图标/§9 块类型图标），全部走 --b3 主题变量。
    // graphrelayout □9（2026-09-20）：内容块胶囊化——bear 拍板「内容块收成单行胶囊，hover
    // 看内容」。¶×N 合并链=「¶×N」单行胶囊（graphmind □3 双态卡/展开交互整族退役，全文走
    // hover 预览浮层）；structLeaf 普通叶=按块型胶囊（graphPill 纯函数组态）；标记叶卡
    // （蓝条两段式）语义载体保留不动。预览浮层=GraphPreview 单例（graphPreview.ts），
    // 非 b3-tooltips 非内核共享 tooltip。
    // graphrelayout □2：布局形态四态退役——文字恒横排；角标 pointerdown/click 双
    // stopPropagation：防触发节点拖拽与 nodeclick（Alt 跳转）。
    import { Handle, Position, type NodeProps } from "@xyflow/svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { showPanelTip, hidePanelTip } from "./libs/panelTip";
    import { formatCharsVolume } from "./libs/graphSkeleton";
    import {
        showGraphPreview, hideGraphPreview, updateGraphPreview, avColumnLines,
        type PreviewAnchor,
    } from "./libs/graphPreview";
    import type { PillSpec, PillPreview } from "./libs/graphPill";

    let { data, targetPosition, sourcePosition }: NodeProps = $props();
    // data: { label, pill?, preview?, collapsed, isParaMerged, hiddenCount, hasChildren, toggle,
    //         blockType?, docName?, isDoc?, structLeaf?, structMark?, structBadge?... }

    function onToggle(e: MouseEvent) {
        e.stopPropagation();
        (data as any).toggle?.();
    }
    // □2 结构态徽标（「N 段 · X 字」pill）：点按=展开/收起该容器直属叶子
    function onBadgeToggle(e: MouseEvent) {
        e.stopPropagation();
        (data as any).toggleBadge?.();
    }
    // 期3 ●N 标记角标：点按=摊开/收起本容器标记叶卡
    function onMarkToggle(e: MouseEvent) {
        e.stopPropagation();
        (data as any).onMarkToggle?.();
    }
    function stopDrag(e: PointerEvent) {
        e.stopPropagation();
    }
    // 期4 双击=滚动到块（Svelte Flow 无 nodedoubleclick 事件，组件原生 dblclick 承载）；
    // 角标双击只 stopPropagation 防误触
    function onDblClick(e: MouseEvent) {
        e.stopPropagation();
        (data as any).dblclick?.();
    }
    function stopDbl(e: MouseEvent) {
        e.stopPropagation();
    }

    // □9 胶囊（¶ 合并链与按块型内容胶囊共用形制）+hover 预览内容（graphPill 组态）
    const pill = $derived((data as any).pill as PillSpec | undefined);
    const preview = $derived((data as any).preview as PillPreview | undefined);
    // av 列名清单惰性回填的会话去重（同一 av 块只拉一次）
    let avFetched = "";

    // 胶囊 hover：show 浮层（组件自量尺寸落位）；av 块再惰性拉列名清单回填
    function onPillEnter(e: MouseEvent) {
        if (!preview) return;
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const anchor: PreviewAnchor = { left: r.left, top: r.top, bottom: r.bottom, width: r.width };
        showGraphPreview(preview, anchor);
        if (preview.avID && preview.avID !== avFetched) {
            avFetched = preview.avID;
            void avColumnLines(preview.avID).then(lines => {
                if (lines.length) updateGraphPreview({ ...preview, lines }, anchor);
            });
        }
    }
    function onPillLeave() {
        hideGraphPreview();
    }

    // 块类型 → 内置图标（spec §9；三期 □2：补 tb=iconLine、iframe 原 iconEmbed 无 symbol 改
    // iconGlobe、widget 自 iconHTML5 改 iconPlugin 消与 html 同形——全席位经 sprite 实测存在）
    const TYPE_ICON: Record<string, string> = {
        c: "iconCode", m: "iconMath", t: "iconTable",
        widget: "iconPlugin", html: "iconHTML5", iframe: "iconGlobe",
        query_embed: "iconSQL", av: "iconDatabase",
        video: "iconVideo", audio: "iconRecord", tb: "iconLine",
        l: "iconList", i: "iconListItem", b: "iconQuote", s: "iconSuper",
    };
    const blockType = $derived((data as any).blockType as string | undefined);
    const typeIcon = $derived(blockType ? TYPE_ICON[blockType] ?? null : null);
    // □4 MarginNote 式内容卡片：□9 起只剩标记叶卡形态（structMark 蓝条两段式语义载体，
    // 普通叶已被内容胶囊取代——structLeaf 无 structMark 的组合不再产节点）
    const structLeaf = $derived(!!(data as any).structLeaf);
    const structMark = $derived((data as any).structMark as string | undefined);
    const markDot = $derived((data as any).markDot as { n: number; color: string } | undefined);
    // □4 章节编号独立字段（弱化浅灰前缀——双编号场景两段语义可分）
    const number = $derived((data as any).number as string | undefined);
    // □2 徽标：{leaves, chars, expanded}——文本「N 段 · X 字」本体即信息，aria 同源
    const badge = $derived((data as any).structBadge as { leaves: number; chars: number; expanded: boolean } | undefined);
    const badgeLabel = $derived(badge
        ? (badge.expanded ? tomatoI18n.徽标已展开点击收起 : tomatoI18n.徽标段字)
            .replace("%1", `${badge.leaves}`).replace("%2", `${badge.chars}`)
        : "");
    const docName = $derived((data as any).docName as string | undefined);
    const isDoc = $derived(!!(data as any).isDoc);
</script>

{#if pill}
    <!-- □9 内容块单行胶囊（¶ 合并链与按块型内容胶囊共用形制；分支须在 structLeaf 前——
         类型叶节点同时带 structLeaf+pill 两标志，structLeaf 已只剩标记卡语义载体）：
         glyph+label 恒单行（block+line-height——flex 容器上 text-overflow:ellipsis 静默
         不生效在档坑，勿改 flex 布局）；hover=预览浮层；双击=滚动到源块。
         相邻胶囊不合并（仅段落相邻合并，合并逻辑在数据层） -->
    <div
        class="gn-pill"
        role="group"
        aria-label={(data as any).fullText || pill.label}
        ondblclick={onDblClick}
        onmouseenter={onPillEnter}
        onmouseleave={onPillLeave}
    >
        <span class="gn-pill-glyph">{pill.glyph}</span><span class="gn-pill-label">{pill.label}</span>
    </div>
{:else if structLeaf}
    <!-- graphmind □5（共识#6）标记叶卡（□9 起本分支唯一形态）：标题栏文字行退役（首行与
         正文重复），色相由左缘色条独扛（--gn-mark，卡体 .gn-card--mark）；正文完整显示 -->
    <div
        class="gn-card"
        class:gn-card--mark={!!structMark}
        style={structMark ? `--gn-mark:${structMark}` : ""}
        role="group"
        ondblclick={onDblClick}
        aria-label={(data as any).fullText || (data as any).label}
        onmouseenter={(e) => showPanelTip(e.currentTarget as HTMLElement)}
        onmouseleave={hidePanelTip}
    >
        {#if !structMark}
            <div class="gn-card-head">
                {#if typeIcon}<svg class="gn-card-icon"><use xlink:href="#{typeIcon}"></use></svg>{/if}
                <span class="gn-card-title">{(data as any).label}</span>
            </div>
        {/if}
        {#if (data as any).bodyText}
            <div class="gn-card-body">{(data as any).bodyText}</div>
        {/if}
    </div>
{:else}
    <div
        class="gn" class:gn-collapsed={(data as any).collapsed}
        role="group"
        ondblclick={onDblClick}
        aria-label={(data as any).fullText || (data as any).label}
        onmouseenter={(e) => showPanelTip(e.currentTarget as HTMLElement)}
        onmouseleave={hidePanelTip}
    >
        {#if isDoc}
            <svg class="gn-typeicon"><use xlink:href="#iconDocTomato"></use></svg>
        {:else if typeIcon}
            <svg class="gn-typeicon"><use xlink:href="#{typeIcon}"></use></svg>
        {:else if blockType && blockType !== "p" && blockType !== "h" && blockType !== "d"}
            <!-- [X] 只兜真正未识别的类型（spec §9）；p/h/d 是正文类无需前缀（vision P1：[P] 噪声回归） -->
            <span class="gn-typeabbr">[{blockType.toUpperCase()}]</span>
        {/if}
        {#if docName}
            <span class="gn-docname">《{docName}》</span>
        {/if}
        {#if number}<span class="gn-num">{number}</span>{/if}
        {#if markDot}
            <button
                class="gn-markpill"
                style="--gn-mark:{markDot.color}"
                aria-label={tomatoI18n.处标记.replace("%1", `${markDot.n}`)}
                title={tomatoI18n.处标记.replace("%1", `${markDot.n}`)}
                onclick={onMarkToggle}
                onpointerdown={stopDrag}
                ondblclick={stopDbl}
            ><span class="gn-markpill-dot"></span>{markDot.n}</button>
        {/if}
        <span class="gn-label">{(data as any).label}</span>
        {#if badge}
            <button
                class="gn-badge"
                class:gn-badge--open={badge.expanded}
                aria-label={badgeLabel}
                title={badgeLabel}
                onclick={onBadgeToggle}
                onpointerdown={stopDrag}
                ondblclick={stopDbl}
            >{badge.leaves} · {formatCharsVolume(badge.chars, tomatoI18n.lang)}{badge.expanded ? "▾" : "▸"}</button>
        {/if}
        {#if (data as any).collapsed && (data as any).hiddenCount > 0}
            <button
                class="gn-toggle gn-toggle--collapsed"
                aria-label={tomatoI18n.展开此节点}
                onclick={onToggle}
                onpointerdown={stopDrag}
                ondblclick={stopDbl}
            >+{(data as any).hiddenCount}</button>
        {:else if !(data as any).collapsed && (data as any).hasChildren}
            <button
                class="gn-toggle"
                aria-label={tomatoI18n.折叠此节点}
                onclick={onToggle}
                onpointerdown={stopDrag}
                ondblclick={stopDbl}
            >−</button>
        {/if}
    </div>
{/if}

<Handle type="target" position={targetPosition ?? Position.Left} />
<Handle type="source" position={sourcePosition ?? Position.Right} />

<style>
    .gn {
        box-sizing: border-box;
        position: relative;
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        /* graphmind □2 脑图卡片规格（学官方 _list-mindmap 视觉，代码不搬）：max-width 300
         * 封顶 + 高度不限不截断（label 放开行数钳自然换行）。与 dagre nodeWidth=300 首轮
         * 估算常量一致，勿单方面改；border-box 使总盒宽=300（padding+边框含内） */
        max-width: 300px;
        min-width: 64px;
        padding: 4px 12px;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        background: var(--b3-theme-background);
        color: var(--b3-theme-on-background);
        font-size: 12px;
        line-height: 1.5;
        /* □3 vision P2：拉丁词 break-all 腰斩（H1-INTRO→INTR/O）——anywhere 整词优先断 CJK 随断 */
        overflow-wrap: anywhere;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    .gn:hover {
        border-color: var(--b3-theme-primary-light);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }
    :global(.svelte-flow__node.selected) .gn {
        border-color: var(--b3-theme-primary);
        box-shadow: 0 0 0 2px var(--b3-theme-primary-lightest), 0 1px 4px rgba(0, 0, 0, 0.1);
    }
    /* 折叠态（子树折叠）＝蓝系染主色：淡蓝底+粗虚线+实心角标三重信号（spec §4） */
    .gn-collapsed {
        background: var(--b3-theme-primary-lightest);
        border: 1.5px dashed var(--b3-theme-primary-light);
        color: var(--b3-theme-on-background);
    }
    /* 二轮终审 P1（9-C 实锤）：暗色下 primary-lightest 底过暗、与文字对比接近不可读——
       暗色分支底色改 primary 混背景 16%（蓝调语义保留）+前景混白提亮到可读档 */
    :global(html[data-theme-mode="dark"]) .gn-collapsed {
        background: color-mix(in srgb, var(--b3-theme-primary) 16%, var(--b3-theme-background));
        color: color-mix(in srgb, var(--b3-theme-on-background) 92%, #ffffff);
    }
    /* graphmind □2：高度不限不截断——行数钳退役（宽 300 封顶内自然换行；脑图骨架标题完整可见） */
    .gn-label {
        overflow-wrap: anywhere;
        min-width: 0;
    }
    .gn-typeicon {
        width: 14px;
        height: 14px;
        margin-inline-end: 4px; /* 逻辑属性（spec §16）：横排=右侧距、竖排=列内向下次距，一处双态 */
        vertical-align: -2px;
        color: var(--b3-theme-on-surface-light);
        flex: none;
        align-self: center;
    }
    .gn-typeabbr {
        font-size: 10px;
        color: var(--b3-theme-on-surface-light);
        margin-inline-end: 4px;
        flex: none;
    }
    .gn-docname {
        font-size: 11px;
        color: var(--b3-theme-on-surface-light);
        margin-inline-end: 2px;
    }
    /* ⊕/⊖ 折叠角标：状态即颜色——折叠 +N=主色实心药丸，展开 −=灰描边（spec §5） */
    .gn-toggle {
        position: absolute;
        top: -7px;
        right: -7px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        /* □3 vision P2：白底细边可发现性差——border-color 提浓一档（on-surface 30% 混合） */
        border: 1px solid color-mix(in srgb, var(--b3-theme-on-surface) 30%, transparent);
        border-radius: 8px;
        background: var(--b3-theme-background);
        color: var(--b3-theme-on-surface-light);
        font-size: 10px;
        line-height: 16px;
        text-align: center;
        cursor: pointer;
        box-shadow: none;
    }
    .gn-toggle--collapsed {
        border: none;
        background: var(--b3-theme-primary);
        color: var(--b3-theme-on-primary);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    }
    .gn-toggle:hover {
        border-color: transparent;
        background: var(--b3-theme-primary);
        color: var(--b3-theme-on-primary);
    }
    /* □2 结构态徽标 pill：直属叶子聚合量（挂节点底部中央，点击展开/收起）。
     * 展开态实心主色（与折叠角标形制呼应），默认弱化轻量 */
    .gn-badge {
        position: absolute;
        left: 50%;
        bottom: -11px;
        transform: translateX(-50%);
        height: 18px;
        padding: 0 8px;
        border: 1px solid var(--b3-border-color);
        border-radius: 9px;
        background: var(--b3-theme-background);
        color: var(--b3-theme-on-surface-light);
        font-size: 11px;
        line-height: 16px;
        white-space: nowrap;
        cursor: pointer;
        box-shadow: none;
    }
    /* □4 MarginNote 式标记叶卡（□9 起仅标记形态在产）：正文 pre-wrap 按行（代码语言行
     * 恢复）+break-word（拉丁词不腰斩）；暗态走主题变量自动换装。宽 300 封顶高自适应 */
    .gn-card {
        box-sizing: border-box;
        width: max-content;
        min-width: 120px;
        max-width: 300px;
        border: 1px solid var(--b3-border-color);
        border-radius: 6px;
        background: var(--b3-theme-background);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        cursor: default;
    }
    .gn-card-head {
        display: flex;
        align-items: center;
        gap: 5px;
        height: 22px;
        padding: 0 7px;
        background: var(--b3-theme-primary);
        color: var(--b3-theme-on-primary);
        font-size: 11px;
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: none;
    }
    .gn-card-icon {
        flex: none;
        width: 12px;
        height: 12px;
        fill: currentColor;
    }
    .gn-card-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .gn-card-body {
        padding: 6px 8px;
        font-size: 11px;
        line-height: 1.5;
        color: var(--b3-theme-on-surface);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }
    /* graphmind □5（共识#6）标记叶：色相由左缘色条独扛——luji0918 □2 的 3px 提 4px
       强化辨识；卡体=主题底+完整正文（宽 300 封顶高自适应） */
    .gn-card--mark {
        border-left: 4px solid var(--gn-mark, var(--b3-theme-primary));
    }
    /* graphmark 期3 ●N 标记角标：色点+计数小药丸（子树标记量；点按摊开标记叶卡）。
       弱化轻量形制与徽标 pill 呼应，色点承载标记色相（共识「小色点+数字不做色块」） */
    .gn-markpill {
        flex: none;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        height: 16px;
        margin-inline-end: 4px;
        padding: 0 5px;
        border: 1px solid var(--b3-border-color);
        border-radius: 8px;
        background: var(--b3-theme-background);
        color: var(--b3-theme-on-surface); /* 期4 vision P2：10px 数字亮色 3.0:1 不足提档（6.05:1）；暗色分支回 on-surface-light（8.6:1） */
        font-size: 10px;
        line-height: 14px;
        cursor: pointer;
        box-shadow: none;
    }
    .gn-markpill:hover {
        border-color: transparent;
        background: var(--b3-theme-primary-lightest);
        color: var(--b3-theme-on-surface);
    }
    /* 期4 vision P2：数字亮色 3.0:1（10px 小字）不足——提 --b3-theme-on-surface（6.05:1）；
       暗色 on-surface-light 本就 8.6:1，分支保持原值（暗色判据=html[data-theme-mode]，
       3.8.3 无 .dark class）。基础 color 在上方 .gn-markpill 主块 */
    :global(html[data-theme-mode="dark"]) .gn-markpill {
        color: var(--b3-theme-on-surface-light);
    }
    .gn-markpill-dot {
        flex: none;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--gn-mark, var(--b3-theme-primary));
        box-shadow: 0 0 0 1px var(--b3-border-color);
    }
    /* □4 章节编号弱化前缀（浅灰常规字重——双编号场景自动编号段与标题自带序号段语义可分） */
    .gn-num {
        margin-right: 4px;
        color: var(--b3-theme-on-surface-light);
        font-weight: 400;
        font-size: 10px;
    }
    .gn-badge:hover,
    .gn-badge--open {
        border-color: transparent;
        background: var(--b3-theme-primary);
        color: var(--b3-theme-on-primary);
    }

    /* ===== □9 内容块单行胶囊 =====
     * block+line-height 单行截断（在档坑：display:flex 容器上 text-overflow:ellipsis
     * 静默不生效=行尾硬裁半个字形，故不用 flex）；pill 全圆角形制与徽标/角标呼应；
     * hover 提亮一档+预览浮层（GraphPreview 单例）；
     * 浅暗色两态走 --b3 变量自动换装，暗色判据 html[data-theme-mode=dark]（无 .dark class） */
    .gn-pill {
        box-sizing: border-box;
        display: block;
        max-width: 300px;
        height: 28px;
        padding: 0 10px;
        border: 1px solid var(--b3-border-color);
        border-radius: 14px;
        background: var(--b3-theme-surface);
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        line-height: 26px; /* 28 高−2 边框；单行截断=block+line-height+nowrap+ellipsis 组合 */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: default;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    .gn-pill:hover {
        border-color: var(--b3-theme-primary-light);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
    :global(.svelte-flow__node.selected) .gn-pill {
        border-color: var(--b3-theme-primary);
    }
    .gn-pill-glyph {
        display: inline-block;
        min-width: 14px;
        margin-right: 5px;
        color: var(--b3-theme-primary);
        font-size: 11px;
        text-align: center;
        /* 暗色主题蓝 on-surface 混底 2.2:1 不足（gn-para-badge 在档先例）：color-mix 掺白提亮 */
    }
    :global(html[data-theme-mode="dark"]) .gn-pill-glyph {
        color: color-mix(in srgb, var(--b3-theme-primary) 65%, white);
    }
    .gn-pill-label {
        display: inline-block;
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: top;
    }
    /* graphrelayout □9：¶ 合并框双态族（.gn-para-*) 与 graphmind □3 交互整体退役——
       全文改走 hover 预览浮层，胶囊恒单行 */
</style>
