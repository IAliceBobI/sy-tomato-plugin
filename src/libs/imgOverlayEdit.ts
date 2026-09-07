/**
 * 图片遮挡编辑器纯逻辑层（□3）：快照式撤销栈 + 视口坐标换算。
 * Svelte 组件（ImgOverlayBox.svelte）是薄壳，本层可单测：
 * 编辑操作序列 → shapes 断言全部落在这。
 */

import { OverlayShape } from "./imgOverlayData";

export type NaturalSize = { w: number; h: number };
export type View = { scale: number; ox: number; oy: number };
export type Handle = "nw" | "ne" | "sw" | "se";

const clone = (shapes: OverlayShape[]): OverlayShape[] => shapes.map(s => ({ ...s }));
const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export class OverlayEditModel {
    shapes: OverlayShape[];
    private undoStack: OverlayShape[][] = [];
    private redoStack: OverlayShape[][] = [];

    constructor(initial: OverlayShape[] = []) {
        this.shapes = clone(initial);
    }

    private snap(): void {
        this.undoStack.push(clone(this.shapes));
        if (this.undoStack.length > 200) this.undoStack.shift();
        this.redoStack = [];
    }

    /** 连续拖动（move/resize/draw）入口：pointerdown 时入栈一次，帧流直改不再入栈 */
    pushUndo(): void {
        this.snap();
    }

    /** 无快照移动（拖动帧流用；undo 粒度由 pushUndo 控制） */
    nudge(ids: Set<number>, dx: number, dy: number): void {
        this.shapes = this.shapes.map((s, i) => ids.has(i)
            ? { ...s, x: clamp01(s.x + dx), y: clamp01(s.y + dy) }
            : s);
    }

    addShape(s: OverlayShape): void {
        this.snap();
        this.shapes.push({ ...s });
    }

    removeAt(ids: Set<number>): void {
        if (!ids.size) return;
        this.snap();
        this.shapes = this.shapes.filter((_, i) => !ids.has(i));
    }

    moveBy(ids: Set<number>, dx: number, dy: number): void {
        if (!ids.size) return;
        this.snap();
        this.shapes = this.shapes.map((s, i) => ids.has(i)
            ? { ...s, x: clamp01(s.x + dx), y: clamp01(s.y + dy) }
            : s);
    }

    /**
     * 手柄缩放（归一增量，顶点位移语义：dx/dy=该角顶点的位移，屏幕系 y 向下正）。
     * 中心随半量移动；w/h 随对侧边增减（nw 左移 dx<0 → w 增）。
     */
    resizeAt(id: number, handle: Handle, dx: number, dy: number): void {
        this.snap();
        this.resizeDirect(id, handle, dx, dy);
    }

    /** 无快照缩放（拖动帧流用） */
    resizeDirect(id: number, handle: Handle, dx: number, dy: number): void {
        const s = this.shapes[id];
        if (!s) return;
        let w = s.w + (handle.includes("e") ? dx : -dx);
        let h = s.h + (handle.includes("s") ? dy : -dy);
        // 最小尺寸 0.02 防缩没
        w = Math.max(0.02, w);
        h = Math.max(0.02, h);
        const x = s.x + dx / 2;
        const y = s.y + dy / 2;
        this.shapes[id] = { ...s, x: clamp01(x), y: clamp01(y), w: clamp01(w), h: clamp01(h) };
    }

    setGroup(ids: Set<number>, g: number): void {
        if (!ids.size) return;
        this.snap();
        this.shapes = this.shapes.map((s, i) => ids.has(i) ? { ...s, g: Math.max(0, Math.round(g)) } : s);
    }

    undo(): boolean {
        const prev = this.undoStack.pop();
        if (!prev) return false;
        this.redoStack.push(clone(this.shapes));
        this.shapes = prev;
        return true;
    }

    redo(): boolean {
        const next = this.redoStack.pop();
        if (!next) return false;
        this.undoStack.push(clone(this.shapes));
        this.shapes = next;
        return true;
    }
}

/** 归一中心 → 屏幕 px（x*w*scale+ox / y*h*scale+oy） */
export function normToScreen(p: { x: number; y: number }, nat: NaturalSize, view: View): { x: number; y: number } {
    return { x: p.x * nat.w * view.scale + view.ox, y: p.y * nat.h * view.scale + view.oy };
}

/** 屏幕 px → 归一（normToScreen 的逆） */
export function screenToNorm(p: { x: number; y: number }, nat: NaturalSize, view: View): { x: number; y: number } {
    return { x: (p.x - view.ox) / (nat.w * view.scale), y: (p.y - view.oy) / (nat.h * view.scale) };
}

/** 滚轮锚点缩放：保持锚点（屏幕坐标）不动，scale × factor，夹 [0.05, 20] */
export function viewScaleAt(view: View, factor: number, anchorScreen: { x: number; y: number }, nat: NaturalSize): View {
    const scale = Math.min(20, Math.max(0.05, view.scale * factor));
    const anchorNorm = screenToNorm(anchorScreen, nat, view);
    return {
        scale,
        ox: anchorScreen.x - anchorNorm.x * nat.w * scale,
        oy: anchorScreen.y - anchorNorm.y * nat.h * scale,
    };
}
