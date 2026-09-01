// □3 批注气泡共享 store：Annotations 管理器写入、AnnoBubble.svelte 订阅渲染。
// anchor=挂点元素（标记 span / 块级宿主块），□4 编辑/删除回调经它找回 holder 与重开气泡上下文。
import { writable } from "svelte/store";
import type { TomatoAnnotation } from "./annotationsAttr";

export interface AnnoPopState {
    mode: "preview" | "view";
    entries: TomatoAnnotation[];
    /** 挂点（标记 span / 块级色条宿主块）的视口矩形，popPosition 用 */
    rect: { left: number; top: number; right: number; bottom: number };
    zIndex: number;
    /** 挂点元素本体（□4 编辑/删除回调用；span 可能被内核重渲染替换，用前判 isConnected） */
    anchor: HTMLElement;
}

export const annoPop = writable<AnnoPopState | null>(null);
