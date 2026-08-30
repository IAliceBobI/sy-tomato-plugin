// TomatoClockList —— 番茄钟时长档位串（store key tomato-clocks）的解析/序列化（□2 chips 配置化数据层）。
// 语义沿 addStatusIcons 既有 wash：>0 通过（0 档=隐藏取消位，不进用户配置）、全半角逗号、
// 去重升序；store 保持逗号串，老数据直接兼容。纯逻辑，不碰 DOM 与 siyuan API；
// UI 接线（chips/即时重挂）在 ConfClock.svelte 与 TomatoClock.ts。

/** 预设常用档（分钟）；chips 平铺顺序即此序 */
export const PRESET_CLOCKS = [5, 10, 15, 20, 25, 30, 45, 60];

/** 档位上限（预设+自定义合计，不含隐藏 0 档）——每档占状态栏一个图标，防拥挤 */
export const MAX_CLOCKS = 8;

function wash(list: number[]): number[] {
    return [...new Set(list.filter((n) => Number.isFinite(n) && n > 0))].sort((a, b) => a - b);
}

/** 容错解析：全半角逗号分隔、容忍空白/垃圾值/0 档残留，去重升序 */
export function parseClocks(raw?: string | null): number[] {
    if (!raw) return [];
    return wash(raw.split(/[,，]/g).map((s) => Number(s.trim())));
}

/** 序列化回 store 逗号串（同样去重升序、剔非正值）；空表 → 空串 */
export function clocksToStore(list: number[]): string {
    return wash(list).join(",");
}
