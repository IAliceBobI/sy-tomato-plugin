// TomatoStats —— 番茄钟轻统计（□2 拍板：今日 N 番茄 / M 分钟，2026-08-29）。
// 口径：本地自然日 key；只记自然到点完成的工作段（skip 不计）；按日 map 滚动存插件 storage，不清理。
// 纯逻辑，不碰 DOM 与 siyuan API；UI 接线（落盘/状态栏展示）在 TomatoClock.ts。

export type TomatoDayStat = { pomo: number; min: number };

export type TomatoStatsData = Record<string, TomatoDayStat>;

/** 本地自然日 key（YYYY-MM-DD，月/日补零） */
export function dayKey(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
}

/** 记一个完成的番茄（minutes=该段工作分钟数）；不可变，返回新对象 */
export function recordPomodoro(data: TomatoStatsData, at: Date, minutes: number): TomatoStatsData {
    const key = dayKey(at);
    const prev = statsFor(data, key);
    return { ...data, [key]: { pomo: prev.pomo + 1, min: prev.min + minutes } };
}

/** 读某日统计；缺失/垃圾值按零值处理（数据来自磁盘，防御读取） */
export function statsFor(data: TomatoStatsData, key: string): TomatoDayStat {
    const v = (data as any)?.[key];
    const pomo = Number(v?.pomo);
    const min = Number(v?.min);
    return {
        pomo: Number.isFinite(pomo) && pomo > 0 ? Math.floor(pomo) : 0,
        min: Number.isFinite(min) && min > 0 ? Math.floor(min) : 0,
    };
}
