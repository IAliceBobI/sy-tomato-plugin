<script lang="ts">
    // graphbox 期3（2026-09-04）：超级块/引述块 subflow 容器节点。
    // 子块由 xyflow 按 parentId 相对坐标渲染在容器矩形内（库不做 DOM 嵌套，纯坐标系相对化），
    // 容器自身只画背景+标题栏；宽高由布局阶段（GraphBox.layoutGroup）算出写进 width/height prop。
    // 视觉数值=docs/graphbox-visual-spec.md §7（surface 壳+虚线 6px 圆角+标题栏 22px）。
    import { Handle, Position, type NodeProps } from "@xyflow/svelte";
    import { tomatoI18n } from "./tomatoI18n";

    let { data, targetPosition, sourcePosition }: NodeProps = $props();
    // data: { groupKind: "sb"|"bq", vMark?, collapsed, hiddenCount, hasChildren, toggle }
    // vMark：容器内子块排布方向（随全局横纵切换更新）⇉/⇓，缺字形回退 →/↓
    // 三期 B'：list groupKind 退役（列表改脑图式树形分叉，容器壳只剩 sb/bq）

    const groupKind = $derived(((data as any).groupKind ?? "sb") as "sb" | "bq");

    function onToggle(e: MouseEvent) {
        e.stopPropagation();
        (data as any).toggle?.();
    }
    function stopDrag(e: PointerEvent) {
        e.stopPropagation();
    }
    // 期4 双击=滚动到块（Svelte Flow 无 nodedoubleclick 事件，组件原生 dblclick 承载）
    function onDblClick(e: MouseEvent) {
        e.stopPropagation();
        (data as any).dblclick?.();
    }
    function stopDbl(e: MouseEvent) {
        e.stopPropagation();
    }
</script>

<div class="gg" class:gg-quote={groupKind === "bq"} class:gg-collapsed={(data as any).collapsed} role="group" ondblclick={onDblClick}>
    {#if !(data as any).collapsed}
        <div class="gg-head">
            {#if groupKind === "bq"}
                <span class="gg-mark gg-mark-bq">│</span>
            {:else}
                <span class="gg-mark">{(data as any).vMark ?? "⇉"}</span>
            {/if}
            <span class="gg-title">{groupKind === "bq" ? tomatoI18n.引述块 : tomatoI18n.超级块}</span>
        </div>
    {/if}
    {#if (data as any).collapsed && (data as any).hiddenCount > 0}
        <button
            class="gg-toggle gg-toggle--collapsed"
            aria-label={tomatoI18n.展开此节点}
            onclick={onToggle}
            onpointerdown={stopDrag}
            ondblclick={stopDbl}
        >+{(data as any).hiddenCount}</button>
    {:else if !(data as any).collapsed && (data as any).hasChildren}
        <button
            class="gg-toggle"
            aria-label={tomatoI18n.折叠此节点}
            onclick={onToggle}
            onpointerdown={stopDrag}
            ondblclick={stopDbl}
        >−</button>
    {/if}
</div>

<Handle type="target" position={targetPosition ?? Position.Left} />
<Handle type="source" position={sourcePosition ?? Position.Right} />

<style>
    /* 容器壳（spec §7）：surface 底+边框色虚线+6px 圆角；padding 上=标题栏 22+6 与布局
     * 常量 GROUP_HEAD_H/GROUP_PAD 对齐（子块坐标从 32,10 起） */
    .gg {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 28px 10px 10px;
        /* 二期 □1 vision 实审：b3-border-color 在暗色下与底色近同、嵌套壳不可辨——
         * 描边加深一档（与 .gg-mark 同色族），亮暗两帧容器轮廓均可辨 */
        border: 1.5px dashed var(--b3-theme-on-surface-light);
        border-radius: var(--b3-border-radius);
        background: var(--b3-theme-surface);
    }
    /* 折叠态容器＝子树折叠语义：蓝系（与 GraphNode .gn-collapsed 同规） */
    .gg-collapsed {
        width: auto;
        height: auto;
        padding: 5px 10px;
        border: 1.5px dashed var(--b3-theme-primary-light);
        border-radius: var(--b3-border-radius);
        background: var(--b3-theme-primary-lightest);
        min-width: 64px;
    }
    .gg-head {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 22px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 0 8px;
        border-bottom: 1px dashed var(--b3-border-color);
        font-size: 10px;
        color: var(--b3-theme-on-surface-light);
    }
    .gg-mark {
        flex: none;
        font-size: 11px;
        font-weight: 600;
        color: var(--b3-theme-on-surface);
    }
    .gg-mark-bq {
        font-size: 12px;
    }
    .gg-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    /* 引述块：左缘 2px 实线竖标（呼应思源引述块编辑器原型的灰竖线） */
    :global(.svelte-flow__node) .gg-quote {
        border-left: 2px solid var(--b3-theme-on-surface-light);
    }
    /* 折叠角标复用 .gn-toggle 规（状态即颜色） */
    .gg-toggle {
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
    }
    .gg-toggle--collapsed {
        border: none;
        background: var(--b3-theme-primary);
        color: var(--b3-theme-on-primary);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    }
    .gg-toggle:hover {
        border-color: transparent;
        background: var(--b3-theme-primary);
        color: var(--b3-theme-on-primary);
    }
</style>
