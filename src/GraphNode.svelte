<script lang="ts">
    // graphbox 期2（2026-09-04）：GraphBox 自定义节点——折叠角标与 ¶×N 段落链大节点。
    // 期3：视觉按 docs/graphbox-visual-spec.md 定稿（§2 普通/§4 折叠/§5 角标/§6 ¶卡/
    // §8 跨文档图标/§9 块类型图标），全部走 --b3 主题变量。
    // 期7：①布局形态四态——vlr/vtb 时节点文字竖排（writing-mode: vertical-rl，CJK 直立
    // 拉丁旋转 90°），窄 dock 纵向叠多层子节点；②¶×N 重设计=链内全文合并展示
    // （2000 字首尾截断+max-height 400px 内滚动），无展开概念——footer/角标/菜单项全退役。
    // 角标 pointerdown/click 双 stopPropagation：防触发节点拖拽与 nodeclick（Alt 跳转）。
    import { Handle, Position, type NodeProps } from "@xyflow/svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { showPanelTip, hidePanelTip } from "./libs/panelTip";

    let { data, targetPosition, sourcePosition }: NodeProps = $props();
    // data: { label, paraText?, collapsed, isParaMerged, hiddenCount, hasChildren, toggle,
    //         blockType?, docName?, isDoc?, form? }

    function onToggle(e: MouseEvent) {
        e.stopPropagation();
        (data as any).toggle?.();
    }
    function stopDrag(e: PointerEvent) {
        e.stopPropagation();
    }
    // 期4 双击=滚动到块（Svelte Flow 无 nodedoubleclick 事件，组件原生 dblclick 承载）；
    // ¶ 大节点双击=滚动到链头段（spec 期7）；角标双击只 stopPropagation 防误触
    function onDblClick(e: MouseEvent) {
        e.stopPropagation();
        (data as any).dblclick?.();
    }
    function stopDbl(e: MouseEvent) {
        e.stopPropagation();
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
    const docName = $derived((data as any).docName as string | undefined);
    const isDoc = $derived(!!(data as any).isDoc);
    // 期7 竖排分支（form 由 relayout commit 写进 data；形态切换不重建节点，只刷 form）
    const textV = $derived((data as any).form === "vlr" || (data as any).form === "vtb");
    // 竖排列档（spec §16）：label >8 字升 2 列档（118px 高钳单列容 8.8 字；前缀不计入）
    const v2col = $derived(((data as any).label ?? "").length > 8);
    // ¶ tooltip 巨幕防御（spec §17 P2）：合并全文截 300 字进 panelTip（卡片内已有全文+滚动）
    const paraTip = $derived(((data as any).fullText ?? "").slice(0, 300));
</script>

{#if (data as any).isParaMerged}
    <div
        class="gn-para" class:gn-para-v={textV}
        role="group"
        ondblclick={onDblClick}
        aria-label={paraTip}
        onmouseenter={(e) => showPanelTip(e.currentTarget as HTMLElement)}
        onmouseleave={hidePanelTip}
    >
        <div class="gn-para-head">
            <span class="gn-para-badge">¶×{(data as any).hiddenCount}</span>
        </div>
        <div class="gn-para-text">{(data as any).paraText}</div>
    </div>
{:else}
    <div
        class="gn" class:gn-v={textV} class:gn-v--2col={textV && v2col} class:gn-collapsed={(data as any).collapsed}
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
        <span class="gn-label">{(data as any).label}</span>
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
        max-width: 172px; /* 与 dagre nodeWidth=172 常量一致，勿单方面改（spec §2）；
                             border-box 使总盒宽=172（padding+边框含内，vision 三轮 P1） */
        min-width: 64px;
        padding: 5px 10px;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        background: var(--b3-theme-background);
        color: var(--b3-theme-on-background);
        font-size: 12px;
        line-height: 1.4;
        word-break: break-all;
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
    .gn-label {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        overflow: hidden;
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
        border: 1px solid var(--b3-border-color);
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

    /* ===== 期7 竖排普通节点（spec §16）：窄高条定宽两档——V1 单列 40px / V2 双列 56px
     * （列厚=line-height 1.4×12px=16.8；左右 padding 10 与横排 .gn 物理同构）。
     * flex 主轴随 writing-mode 旋转（inline 轴=纵向）；图标（replaced element）不旋转立于首列顶部；
     * 《》由 CJK 字体 vert 特性自动转竖排形。角标保持右上角（方案 A，spec §16 拍板）。 */
    .gn-v {
        writing-mode: vertical-rl;
        text-orientation: mixed; /* 拉丁横躺 90°（spec §19 拍板），显式声明防继承污染 */
        align-items: flex-start; /* 竖排下 baseline 无意义，改起点对齐（spec §16） */
        align-content: start;
        width: 40px;
        min-width: 0;
        max-width: none;
        max-height: 118px; /* ≈8 字/列整字截断；2 列 clamp 对应横排 2 行预算（spec §2） */
        min-height: 64px;
        padding: 8px 10px;
        overflow: hidden;
    }
    /* 竖排 line-clamp 的「行」即「列」（spec §16）：声明组零改动生效，按档覆盖 1/2 */
    .gn-v .gn-label {
        -webkit-line-clamp: 1;
        line-clamp: 1;
        max-width: none;
    }
    .gn-v--2col {
        width: 56px;
    }
    .gn-v--2col .gn-label {
        -webkit-line-clamp: 2;
        line-clamp: 2;
    }

    /* ===== ¶×N 段落链大节点（期7 重设计）：链内全文合并展示——「内容卡」而非「折叠状态」。
     * 灰系实线+¶ badge（spec §6 语义延续）；2000 字截断在数据侧（graphParaMerge），视觉钳
     * max-height 400px 内滚动（防巨型节点把 fitView 缩爆）；无展开概念，footer/角标已退役。 */
    .gn-para {
        box-sizing: border-box;
        display: block;
        width: 188px;
        max-width: 188px;
        padding: 7px 10px;
        background: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
    }
    .gn-para-head {
        display: flex;
        align-items: baseline;
        gap: 6px;
    }
    .gn-para-badge {
        flex: none;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.2px;
        color: var(--b3-theme-primary);
    }
    .gn-para-text {
        margin-top: 3px;
        max-height: 400px;
        overflow: auto; /* 高钳内滚（spec §17）：横排滚 y、竖排块流向左自动滚 x，同一声明换轴零分叉 */
        scrollbar-width: thin;
        word-break: break-all;
        white-space: pre-line; /* 链内多段 \n 分段显示（graphParaMerge 以 \n 合并） */
        font-size: 11px;
        line-height: 1.5;
        color: var(--b3-theme-on-surface);
    }
    .gn-para-text::-webkit-scrollbar {
        width: 4px;
        height: 4px;
    }
    .gn-para-text::-webkit-scrollbar-thumb {
        background: var(--b3-border-color);
        border-radius: 2px;
    }
    .gn-para-text::-webkit-scrollbar-thumb:hover {
        background: var(--b3-theme-on-surface-light);
    }
    /* 竖排 ¶ 卡（spec §17）：多列宽卡（122px ≈ 7 列），文字竖排、高钳同 400；
     * badge 行保持横排（数字+× 记号竖排不可读） */
    .gn-para-v {
        writing-mode: vertical-rl;
        width: auto;
        max-width: 122px;
        min-width: 64px;
        padding: 8px 7px;
    }
    .gn-para-v .gn-para-head {
        writing-mode: horizontal-tb;
        flex: none;
    }
    .gn-para-v .gn-para-text {
        margin-top: 0;
        margin-left: 3px; /* 竖排块流向左：badge 在首列右侧 */
        max-height: 400px;
    }
</style>
