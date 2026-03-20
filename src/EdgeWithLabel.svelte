<script lang="ts">
    import { BaseEdge, EdgeLabel, getBezierPath } from "@xyflow/svelte";
    import type { EdgeProps } from "@xyflow/svelte";

    let {
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        markerEnd,
        markerStart,
        style,
        label,
        data,
    }: EdgeProps = $props();

    function cubicPoint(p0: number, p1: number, p2: number, p3: number, t: number) {
        const mt = 1 - t;
        return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
    }

    const isBackEdge = $derived(!!(data as any)?.isBackEdge);
    const arcOffset = $derived((data as any)?.arcOffset ?? Math.abs(targetX - sourceX) * 0.15 + 25);
    // backEdgeDir: "down"=LR布局弧向下（+Y），"left"=TB布局弧向左（-X）
    const backEdgeDir = $derived((data as any)?.backEdgeDir ?? "down");
    const midX = $derived((sourceX + targetX) / 2);
    const midY = $derived((sourceY + targetY) / 2);

    const edgePath = $derived(
        isBackEdge
            ? backEdgeDir === "down"
                ? `M ${sourceX} ${sourceY} C ${midX} ${sourceY + arcOffset} ${midX} ${targetY + arcOffset} ${targetX} ${targetY}`
                : `M ${sourceX} ${sourceY} C ${sourceX - arcOffset} ${midY} ${targetX - arcOffset} ${midY} ${targetX} ${targetY}`
            : getBezierPath({
                  sourceX,
                  sourceY,
                  targetX,
                  targetY,
                  sourcePosition,
                  targetPosition,
              })[0],
    );

    const t = $derived((data as any)?.labelT ?? 0.2);
    const labelX = $derived(
        isBackEdge
            ? backEdgeDir === "down"
                ? cubicPoint(sourceX, midX, midX, targetX, t)
                : cubicPoint(sourceX, sourceX - arcOffset, targetX - arcOffset, targetX, t)
            : sourceX + (targetX - sourceX) * t,
    );
    const labelY = $derived(
        isBackEdge
            ? backEdgeDir === "down"
                ? cubicPoint(sourceY, sourceY + arcOffset, targetY + arcOffset, targetY, t)
                : cubicPoint(sourceY, midY, midY, targetY, t)
            : sourceY + (targetY - sourceY) * t,
    );
</script>

<BaseEdge path={edgePath} {markerEnd} {markerStart} {style} />
{#if label}
    <EdgeLabel x={labelX} y={labelY} class="edge-label-custom">
        {label}
    </EdgeLabel>
{/if}

<style>
    :global(.edge-label-custom) {
        background: var(--b3-theme-background, #fff);
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        border: 1px solid var(--b3-border-color, #ddd);
        white-space: nowrap;
    }
</style>
