// src/libs/graphPreviewStore.ts
// graphrelayout □9 评审 P1：hover 预览浮层的显示态纯模块（svelte/store 层，零 .svelte
// 依赖——vitest 单测链禁引 .svelte，update 同锚守卫的 enter→leave→resolve 时序在此锁测）。
// 生命周期（挂/卸组件、滚动防线、代际守卫）在 graphPreview.ts 包装；本文件只管 store 状态。
import { writable } from "svelte/store";
import type { PillPreview, PreviewAnchor } from "./graphPill";

/** 单例显示态（GraphPreview 订阅；写入口仅下面三个函数）——内容+锚，定位组件自算 */
export type GraphPreviewSpec = PillPreview & { anchor: PreviewAnchor };
export const graphPreviewStore = writable<GraphPreviewSpec | null>(null);

/** 显示（hover enter）：整体替换，锚对象引用成为本次 hover 会话的身份凭证 */
export function setPreviewState(spec: PillPreview, anchor: PreviewAnchor): void {
    graphPreviewStore.set({ ...spec, anchor });
}

/**
 * 就地更新内容（av 列名清单惰性回填通道）：**仅当当前仍显示同一锚**（同一锚对象引用）
 * 才接受——enter 后快速 leave（hide 置 null）或已 hover 别的胶囊（锚已换）时，迟到的
 * 网络回包不得复现浮层（幽灵复现红线：浮层 pointer-events:none 不会自愈）。同锚时
 * 内容合并、锚不动（组件按 store 变更重定位，同引用无位移）。
 */
export function updatePreviewState(spec: PillPreview, anchor: PreviewAnchor): void {
    graphPreviewStore.update(s => (s && s.anchor === anchor ? { ...s, ...spec, anchor } : s));
}

/** 收起（mouseleave/滚动/切文档/宿主卸载）：置 null，迟到回包经 update 同锚守卫自然丢弃 */
export function clearPreviewState(): void {
    graphPreviewStore.set(null);
}
