// TomatoFocus —— 番茄钟专注写回（□3 拍板：绑定文档累计专注分钟，2026-08-29）。
// 口径：文档 IAL 单属性 custom-tomato-focus 存累计分钟；只记自然到点完成的工作段（UI 层判 via）；
// 本期只写不读，属性名是给闪卡/渐进生态留的读取约定。纯逻辑不碰 siyuan API，接线在 TomatoClock.ts。

/** 文档 IAL 属性名（值=累计专注分钟数字符串）。必须全小写：内核会把 custom key 小写化存储，
 *  驼峰名的读取端会恒 miss（custom-tomatoClockVedioVersion 先例即中招） */
export const FOCUS_ATTR = "custom-tomato-focus";

/** 旧值（磁盘 IAL，脏值按 0、floor 与 TomatoStats.statsFor 同口径）+ 新分钟数 → 写回值 */
export function mergeFocusMinutes(oldVal: string | undefined | null, addMinutes: number): string {
    const n = Number(oldVal);
    const prev = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    return String(prev + Math.floor(addMinutes));
}
