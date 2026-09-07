<script lang="ts">
    import { onMount } from "svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import type { OverlayShape } from "./libs/imgOverlayData";
    import {
        OverlayEditModel, normToScreen, screenToNorm, viewScaleAt,
    } from "./libs/imgOverlayEdit";
    type NatSize = { w: number; h: number };
    type View = { scale: number; ox: number; oy: number };
    type Handle = "nw" | "ne" | "sw" | "se";

    interface Props {
        imgSrc: string;
        natSize: NatSize;
        initialShapes: OverlayShape[];
        /** □5：当前图在内置卡包（工具条 toggle 初始态） */
        deckOn: boolean;
        /** □5：制卡 toggle，返回 toggle 后归属 */
        onToggleDeck: () => Promise<boolean>;
        /** 保存并退出按钮 → 关弹窗（保存在 dialog 销毁链统一收口） */
        onExit: () => void;
    }

    let { imgSrc, natSize, initialShapes, deckOn, onToggleDeck, onExit }: Props = $props();

    // ── 状态 ──
    // svelte-ignore state_referenced_locally(编辑器只在打开时取初始 shapes，后续以 model 为源)
    const model = new OverlayEditModel(initialShapes);
    let shapes = $state<OverlayShape[]>(model.shapes);
    let view = $state<View>({ scale: 1, ox: 0, oy: 0 });
    let tool = $state<"r" | "e">("r");
    let selected = $state<Set<number>>(new Set());
    let groupSel = $state(0); // 组号选择器：0=无组
    let spaceDown = $state(false);
    // svelte-ignore state_referenced_locally(工具条 toggle 只取打开时 deckOn 初值，弹窗每次打开重建，之后由 onToggleDeck 回写)
    let deck = $state(deckOn);
    let canvasEl: HTMLElement;

    type Mode = "idle" | "draw" | "move" | "resize" | "pan";
    let mode: Mode = "idle";
    let drawStart = { x: 0, y: 0 };
    let drawing = $state<OverlayShape | null>(null);
    let dragLast = { x: 0, y: 0 };
    let resizeHandle: Handle = "se";
    let resizeIdx = -1;
    // 双指 pinch
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchBase: { dist: number; view: View; mid: { x: number; y: number } } | null = null;

    const GROUPS = Array.from({ length: 36 }, (_, i) => i);
    const HANDLES: Handle[] = ["nw", "ne", "sw", "se"];

    const sync = () => { shapes = model.shapes; };

    export function getShapes(): OverlayShape[] {
        return model.shapes;
    }

    // ── 视口：fit-to-view（打开时与「适应」按钮） ──
    function fitView() {
        if (!canvasEl) return;
        const cw = canvasEl.clientWidth - 32, ch = canvasEl.clientHeight - 32;
        if (cw <= 0 || ch <= 0 || !natSize.w) return;
        const scale = Math.min(cw / natSize.w, ch / natSize.h, 4);
        view = {
            scale,
            ox: (canvasEl.clientWidth - natSize.w * scale) / 2,
            oy: (canvasEl.clientHeight - natSize.h * scale) / 2,
        };
    }

    // 弹窗内容区从 min-height 撑到最终高度跨多帧，单帧 rAF 拿到的画布尺寸偏小 → fit 垂直偏上；
    // ResizeObserver 在布局稳定后持续 re-fit，用户手动改变视口后停手
    let interacted = false;
    onMount(() => {
        const ro = new ResizeObserver(() => { if (!interacted) fitView(); });
        ro.observe(canvasEl);
        return () => ro.disconnect();
    });

    // ── 坐标 ──
    const toNorm = (e: PointerEvent | WheelEvent) => {
        const r = canvasEl.getBoundingClientRect();
        return screenToNorm({ x: e.clientX - r.left, y: e.clientY - r.top }, natSize, view);
    };

    function shapeScreen(s: OverlayShape) {
        const c = normToScreen(s, natSize, view);
        return {
            left: c.x - (s.w * natSize.w * view.scale) / 2,
            top: c.y - (s.h * natSize.h * view.scale) / 2,
            width: s.w * natSize.w * view.scale,
            height: s.h * natSize.h * view.scale,
        };
    }

    // ── 指针交互（鼠标+触摸统一 pointer events；双指=pinch） ──
    function onPointerDown(e: PointerEvent) {
        interacted = true;
        try { canvasEl.setPointerCapture(e.pointerId); } catch { /* 合成事件无活动指针时忽略 */ }
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
            // 进入 pinch：双指缩放平移
            const [a, b] = [...pointers.values()];
            pinchBase = {
                dist: Math.hypot(a.x - b.x, a.y - b.y),
                view: { ...view },
                mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
            };
            mode = "pan";
            drawing = null;
            return;
        }
        const t = e.target as HTMLElement;
        dragLast = { x: e.clientX, y: e.clientY };
        if (spaceDown || e.button === 1) {
            mode = "pan";
            return;
        }
        const handleEl = t.closest("[data-handle]") as HTMLElement | null;
        if (handleEl && selected.size === 1) {
            mode = "resize";
            resizeHandle = handleEl.dataset.handle as Handle;
            resizeIdx = [...selected][0];
            model.pushUndo();
            return;
        }
        const shapeEl = t.closest("[data-idx]") as HTMLElement | null;
        if (shapeEl) {
            const idx = Number(shapeEl.dataset.idx);
            if (e.shiftKey) {
                const next = new Set(selected);
                next.has(idx) ? next.delete(idx) : next.add(idx);
                selected = next;
            } else if (!selected.has(idx)) {
                selected = new Set([idx]);
            }
            if (selected.size) {
                mode = "move";
                model.pushUndo();
            }
            return;
        }
        // 空白：新画（或单击取消选中）
        if (!e.shiftKey) selected = new Set();
        mode = "draw";
        drawStart = toNorm(e);
        drawing = { t: tool, x: drawStart.x, y: drawStart.y, w: 0, h: 0, g: 0 };
    }

    function onPointerMove(e: PointerEvent) {
        if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (mode === "pan" && pinchBase && pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            const r = canvasEl.getBoundingClientRect();
            const scaled = viewScaleAt(
                pinchBase.view,
                Math.max(0.1, dist / Math.max(1, pinchBase.dist)),
                { x: pinchBase.mid.x - r.left, y: pinchBase.mid.y - r.top },
                natSize,
            );
            view = { ...scaled, ox: scaled.ox + (mid.x - pinchBase.mid.x), oy: scaled.oy + (mid.y - pinchBase.mid.y) };
            return;
        }
        if (mode === "pan") {
            view = { ...view, ox: view.ox + (e.clientX - dragLast.x), oy: view.oy + (e.clientY - dragLast.y) };
            dragLast = { x: e.clientX, y: e.clientY };
            return;
        }
        if (mode === "draw" && drawing) {
            const p = toNorm(e);
            drawing = {
                ...drawing,
                x: (drawStart.x + p.x) / 2,
                y: (drawStart.y + p.y) / 2,
                w: Math.abs(p.x - drawStart.x),
                h: Math.abs(p.y - drawStart.y),
            };
            return;
        }
        if (mode === "move" && selected.size) {
            const dx = (e.clientX - dragLast.x) / (natSize.w * view.scale);
            const dy = (e.clientY - dragLast.y) / (natSize.h * view.scale);
            model.nudge(selected, dx, dy);
            dragLast = { x: e.clientX, y: e.clientY };
            sync();
            return;
        }
        if (mode === "resize" && resizeIdx >= 0) {
            const dx = (e.clientX - dragLast.x) / (natSize.w * view.scale);
            const dy = (e.clientY - dragLast.y) / (natSize.h * view.scale);
            model.resizeDirect(resizeIdx, resizeHandle, dx, dy);
            dragLast = { x: e.clientX, y: e.clientY };
            sync();
        }
    }

    function onPointerUp(e: PointerEvent) {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinchBase = null;
        if (mode === "draw") {
            if (drawing && drawing.w > 0.005 && drawing.h > 0.005) {
                model.addShape(drawing);
                sync();
            }
            drawing = null;
        }
        mode = "idle";
    }

    // ── 滚轮：鼠标锚点缩放 ──
    function onWheel(e: WheelEvent) {
        e.preventDefault();
        interacted = true;
        const r = canvasEl.getBoundingClientRect();
        view = viewScaleAt(view, e.deltaY < 0 ? 1.12 : 1 / 1.12,
            { x: e.clientX - r.left, y: e.clientY - r.top }, natSize);
    }

    // ── 键盘（容器 tabindex 接焦） ──
    function onKeydown(e: KeyboardEvent) {
        if (e.code === "Space") { spaceDown = true; e.preventDefault(); return; }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
            e.preventDefault();
            if (e.shiftKey) model.redo(); else model.undo();
            selected = new Set();
            sync();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
            e.preventDefault();
            model.redo(); selected = new Set(); sync();
            return;
        }
        if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault();
            model.removeAt(selected);
            selected = new Set();
            sync();
        }
    }
    function onKeyup(e: KeyboardEvent) {
        if (e.code === "Space") spaceDown = false;
    }

    // ── 工具条动作 ──
    function doUndo() { model.undo(); selected = new Set(); sync(); }
    function doRedo() { model.redo(); selected = new Set(); sync(); }
    function doDelete() {
        if (!selected.size) return;
        model.removeAt(selected);
        selected = new Set();
        sync();
    }
    function doGroup(g: number) {
        groupSel = g;
        if (!selected.size) return;
        model.setGroup(selected, g);
        sync();
    }
</script>

<svelte:window onkeydown={(e) => canvasEl?.contains(document.activeElement) && onKeydown(e)}
    onkeyup={(e) => canvasEl?.contains(document.activeElement) && onKeyup(e)} />

<div class="iov-editor">
    <div class="iov-toolbar">
        <div class="iov-seg">
            <button class="iov-tool" class:iov-tool--on={tool === "r"} title={tomatoI18n.矩形}
                onclick={() => (tool = "r")}><i class="iov-icon iov-icon--rect"></i></button>
            <button class="iov-tool" class:iov-tool--on={tool === "e"} title={tomatoI18n.椭圆}
                onclick={() => (tool = "e")}><i class="iov-icon iov-icon--ellipse"></i></button>
        </div>
        <label class="iov-group">
            {tomatoI18n.组号}
            <select class="b3-select iov-group__sel" value={groupSel} onchange={(e) => doGroup(Number((e.target as HTMLSelectElement).value))}>
                {#each GROUPS as g (g)}
                    <option value={g}>{g === 0 ? tomatoI18n.无组 : g}</option>
                {/each}
            </select>
        </label>
        <div class="iov-sep"></div>
        <button class="b3-button b3-button--outline iov-btn" onclick={doUndo}>{tomatoI18n.撤销}</button>
        <button class="b3-button b3-button--outline iov-btn" onclick={doRedo}>{tomatoI18n.重做}</button>
        <button class="b3-button b3-button--outline iov-btn" onclick={doDelete}>{tomatoI18n.删除选中}</button>
        <button class="b3-button b3-button--outline iov-btn" onclick={fitView}>{tomatoI18n.适应视图}</button>
        <div class="iov-sep iov-flex"></div>
        <button class="b3-button b3-button--outline iov-btn" title={tomatoI18n.图片遮挡编辑器}
            onclick={async () => { deck = await onToggleDeck(); }}>{deck ? tomatoI18n.移出闪卡 : tomatoI18n.加入闪卡}</button>
        <button class="b3-button b3-button--text iov-btn iov-btn--save" onclick={onExit}>{tomatoI18n.保存并退出}</button>
    </div>

    <!-- svelte-ignore a11y_no_noninteractive_tabindex(自定义画布交互面，键盘 Delete/撤销走容器) -->
    <div class="iov-canvas" bind:this={canvasEl} role="application" tabindex="0"
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        onpointerup={onPointerUp}
        onpointercancel={onPointerUp}
        onwheel={onWheel}>
        <img class="iov-img" src={imgSrc} alt=""
            style:left="{view.ox}px" style:top="{view.oy}px"
            style:width="{natSize.w * view.scale}px" style:height="{natSize.h * view.scale}px"
            draggable="false" />
        {#each shapes as s, i (i)}
            {@const r = shapeScreen(s)}
            <div class="iov-shape" class:iov-shape--sel={selected.has(i)} class:iov-shape--ellipse={s.t === "e"}
                data-idx={i}
                style:left="{r.left}px" style:top="{r.top}px"
                style:width="{r.width}px" style:height="{r.height}px">
                {#if s.g > 0}<span class="iov-badge">{s.g}</span>{/if}
                {#if selected.has(i) && selected.size === 1}
                    {#each HANDLES as h (h)}
                        {@const hr = { nw: [0, 0], ne: [r.width, 0], sw: [0, r.height], se: [r.width, r.height] }[h]}
                        <i class="iov-handle" data-handle={h}
                            style:left="{hr[0] - 5}px" style:top="{hr[1] - 5}px"></i>
                    {/each}
                {/if}
            </div>
        {/each}
        {#if drawing}
            {@const dr = shapeScreen(drawing)}
            <div class="iov-shape iov-shape--drawing" class:iov-shape--ellipse={drawing.t === "e"}
                style:left="{dr.left}px" style:top="{dr.top}px"
                style:width="{dr.width}px" style:height="{dr.height}px"></div>
        {/if}
    </div>
</div>

<style>
    .iov-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 420px;
        outline: none;
    }
    .iov-toolbar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px;
        flex-wrap: wrap;
    }
    .iov-seg {
        display: flex;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        overflow: hidden;
    }
    .iov-tool {
        border: none;
        background: var(--b3-theme-background);
        padding: 4px 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
    }
    .iov-tool--on {
        background: var(--b3-theme-primary-lightest);
        box-shadow: inset 0 0 0 1px var(--b3-theme-primary);
    }
    .iov-icon {
        display: inline-block;
        width: 14px;
        height: 12px;
        border: 2px solid var(--b3-theme-on-surface);
    }
    .iov-icon--ellipse { border-radius: 50%; }
    .iov-group {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--b3-theme-on-surface);
    }
    .iov-group__sel { width: 64px; }
    .iov-sep {
        width: 1px;
        align-self: stretch;
        background: var(--b3-border-color);
        margin: 2px 2px;
    }
    .iov-flex { flex: 1; width: auto; background: transparent; }
    .iov-btn { font-size: 12px; }
    .iov-btn--save { font-weight: 500; }
    .iov-canvas {
        flex: 1;
        position: relative;
        overflow: hidden;
        background: var(--b3-theme-surface);
        border-radius: var(--b3-border-radius);
        touch-action: none;
        outline: none;
        cursor: crosshair;
    }
    .iov-canvas:has(.iov-shape:hover) { cursor: move; }
    .iov-img {
        position: absolute;
        user-select: none;
        pointer-events: none;
        box-shadow: 0 0 0 1px var(--b3-border-color);
    }
    .iov-shape {
        position: absolute;
        background: var(--b3-font-background8);
        border: 1px solid var(--b3-border-color);
        opacity: 0.68;
        cursor: move;
    }
    .iov-shape--ellipse { border-radius: 50%; }
    .iov-shape--sel {
        border-color: var(--b3-theme-primary);
        border-width: 2px;
        opacity: 0.85;
    }
    .iov-shape--drawing { border-style: dashed; opacity: 0.5; }
    .iov-badge {
        position: absolute;
        top: 2px;
        left: 4px;
        font-size: 11px;
        line-height: 1.2;
        color: var(--b3-font-color5);
        pointer-events: none;
    }
    .iov-handle {
        position: absolute;
        width: 10px;
        height: 10px;
        background: var(--b3-theme-background);
        border: 1.5px solid var(--b3-theme-primary);
        border-radius: 2px;
    }
    .iov-handle[data-handle="nw"], .iov-handle[data-handle="se"] { cursor: nwse-resize; }
    .iov-handle[data-handle="ne"], .iov-handle[data-handle="sw"] { cursor: nesw-resize; }
</style>
