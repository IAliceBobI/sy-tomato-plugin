// src/libs/graphPreview.ts
// graphrelayout □9：图视图自绘 hover 预览浮层（胶囊 hover 看内容）——生命周期管理层。
// 为什么不用既有通道：原生 title 放不下几千字全文（□9 拍板弃用）；b3-tooltips 居中
// 锚定裁切家族坑在档；panelTip 单例纯文本行——胶囊预览要标题+计数+首尾段结构化排版，
// 独立组件承载。也不碰内核共享 #tooltip（被浮条/浮窗压住坑在档）。
// 定位数学=previewPos 纯函数（graphPill.ts，单测锁数学）；组件渲染一帧后量实际尺寸再落
// 坐标（visibility 隐藏防首帧闪角）——与 □2 布局「先量后排」同思路。
// 本文件引入 GraphPreview.svelte（vitest 单测链禁止引入 .svelte——无 transform），纯函数
// 一律放 graphPill.ts；测试只 import graphPill。
// 生命周期：body 挂载单例组件，globalThis 跨代守卫（插件重载双投同族坑——旧代组件绑
// 旧代 store 成死层，gen 不匹配卸旧挂新）；GraphBox onMount ensureGraphPreview /
// index.ts 卸载链 destroyGraphPreview。Svelte 5 mount()→unmount() 正轨。
import { mount, unmount } from "svelte";
import GraphPreview from "../GraphPreview.svelte";
import type { PillPreview, PreviewAnchor } from "./graphPill";
import { siyuan } from "./siyuanApi";
// 显示态三函数（set/update 同锚守卫/clear）在纯模块 graphPreviewStore——vitest 单测链
// 禁引 .svelte，enter→leave→resolve 迟到回包丢弃时序在该层锁测（□9 评审 P1）
import {
    graphPreviewStore, setPreviewState, updatePreviewState, clearPreviewState,
} from "./graphPreviewStore";

export type { PreviewAnchor } from "./graphPill";
export type { GraphPreviewSpec } from "./graphPreviewStore";
export { graphPreviewStore };

const HOST_ID = "tomato-graph-preview-host";

/** 代际 token（window.eval 无模块缓存——插件重载后旧代组件引用旧代 store，新代 show
 *  永远打不进旧组件；gen 不匹配即卸旧挂新，同代重复调用零成本复用） */
const GEN = Symbol("tomatoGraphPreviewGen");

/** 滚动即弃防线（panelTip 同款）：fixed 浮层不随锚，滚动容器滚走后悬空在错位处。
 *  scroll 不冒泡但捕获可达 window，一处覆盖一切滚动容器；挂模块级一次永不摘除 */
let scrollGuardArmed = false;
function armScrollGuard() {
    if (scrollGuardArmed) return;
    scrollGuardArmed = true;
    window.addEventListener("scroll", hideGraphPreview, true);
}

/** 幂等建/取单例（同代复用；跨代旧实例先卸再挂新） */
function ensureInstance(): void {
    const g = globalThis as any;
    let host = document.getElementById(HOST_ID);
    if (!host) {
        host = document.createElement("div");
        host.id = HOST_ID;
        document.body.appendChild(host);
    }
    g.__tomatoGraphPreviewHost = host;
    if (g.__tomatoGraphPreviewApp && g.__tomatoGraphPreviewGen !== GEN) {
        try { unmount(g.__tomatoGraphPreviewApp as object); } catch { /* 旧代已死容忍 */ }
        g.__tomatoGraphPreviewApp = null;
    }
    if (!g.__tomatoGraphPreviewApp) {
        g.__tomatoGraphPreviewApp = mount(GraphPreview, { target: host });
        g.__tomatoGraphPreviewGen = GEN;
    }
}

/** 宿主（GraphBox）挂载期预取：浮层单例先就位（首个 hover 零延迟；幂等） */
export function ensureGraphPreview(): void {
    ensureInstance();
}

/** 显示预览（锚=胶囊元素；组件量自身尺寸后按 previewPos 落位） */
export function showGraphPreview(spec: PillPreview, anchor: PreviewAnchor): void {
    armScrollGuard();
    ensureInstance();
    setPreviewState(spec, anchor);
}

/** 就地更新内容（av 列名清单惰性回填）：同锚守卫在 updatePreviewState——leave 后迟到
 *  回包不再复现浮层（□9 评审 P1 红线修） */
export function updateGraphPreview(spec: PillPreview, anchor: PreviewAnchor): void {
    updatePreviewState(spec, anchor);
}

export function hideGraphPreview(): void {
    clearPreviewState();
}

/** 插件卸载收尾：组件 unmount 正轨 + 宿主摘除不留尸体 */
export function destroyGraphPreview(): void {
    const g = globalThis as any;
    if (g.__tomatoGraphPreviewApp) {
        try { unmount(g.__tomatoGraphPreviewApp as object); } catch { /* 旧代实例已死容忍 */ }
        g.__tomatoGraphPreviewApp = null;
    }
    document.getElementById(HOST_ID)?.remove();
}

/** av 列名清单（□9 拍板 hover=列名清单）：DOM 通道 data-av-id 在场才可拉；
 *  getAttributeView 响应形态=av.keyValues[].key.name（3.8.4 实测；keyViews 旧形态兜底）。
 *  失败/无列=空数组（浮层保持占位标题） */
export async function avColumnLines(avID: string): Promise<string[]> {
    try {
        const raw = (await siyuan.call("/api/av/getAttributeView", { id: avID })) as
            | { av?: { keyValues?: { key?: { name?: string } }[]; keyViews?: { name?: string }[] } }
            | { keyValues?: { key?: { name?: string } }[]; keyViews?: { name?: string }[] }
            | null;
        const avObj: { keyValues?: { key?: { name?: string } }[]; keyViews?: { name?: string }[] } =
            ("av" in (raw ?? {}) ? (raw as { av: object }).av : raw) ?? {};
        const names: string[] = (avObj.keyValues ?? []).map((kv) => (kv?.key?.name ?? "").trim())
            .concat((avObj.keyViews ?? []).map((k) => (k?.name ?? "").trim()))
            .filter(Boolean);
        return [...new Set(names)];
    } catch {
        return [];
    }
}
