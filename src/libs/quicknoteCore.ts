// 速记器 quicknote 纯函数核心（quicknote 战役 □1 2026-09-07）。
// 窗口管理/IPC 接线在 src/QuickNote.ts；本文件只放可单测的纯逻辑。

/** 固定默认类型：拍照闪念七类之一「想法」——速记不选类时的兜底，落块与面板收集块完全同构 */
export const QN_ICON = "💡";

/** 小窗 ↔ 主窗唯一 IPC 频道（BroadcastChannel；插件侧 on 同名） */
export const QN_CHANNEL = "quicknote";

/** 小窗 → 插件 的合法消息形态（□4 窗口统一化扩协议：hello/openDaily/sync/icon/keep/submit 带类型；
 *  qn-actions □2 扩 opacity 透明度档位）。
 *  close 带可选 at=blur 因果时刻（迟到守卫见 qnCloseStale） */
export type QnMsg =
    | { type: "hello" }
    | { type: "close"; at?: number }
    | { type: "openDaily" }
    | { type: "sync" }
    | { type: "opacity"; v: number }
    | { type: "icon"; icon: string }
    | { type: "keep"; keep: boolean }
    | { type: "submit"; text: string; icon?: string; keep?: boolean };

/** IPC 消息解析与防御：文本/图标 trim、空值拒绝、可选字段非法即剔除；非法负载一律 null（调用方静默丢弃） */
export function qnParseMsg(data: unknown): QnMsg | null {
    if (typeof data !== "object" || data == null) return null;
    const { type } = data as Record<string, unknown>;
    if (type === "close") {
        const { at } = data as Record<string, unknown>;
        return typeof at === "number" ? { type: "close", at } : { type: "close" };
    }
    if (type === "hello") return { type: "hello" };
    if (type === "openDaily") return { type: "openDaily" };
    if (type === "sync") return { type: "sync" };
    if (type === "opacity") {
        const { v } = data as Record<string, unknown>;
        // 档位循环钮的合法域：有限数且 (0,1]（≤0 全透明不可用，>1 无意义）
        if (typeof v !== "number" || !Number.isFinite(v) || v <= 0 || v > 1) return null;
        return { type: "opacity", v };
    }
    if (type === "icon") {
        const { icon } = data as Record<string, unknown>;
        if (typeof icon !== "string") return null;
        const i = icon.trim();
        if (!i) return null;
        return { type: "icon", icon: i };
    }
    if (type === "keep") {
        const { keep } = data as Record<string, unknown>;
        if (typeof keep !== "boolean") return null;
        return { type: "keep", keep };
    }
    if (type !== "submit") return null;
    const { text, icon, keep } = data as Record<string, unknown>;
    if (typeof text !== "string") return null;
    const t = text.trim();
    if (!t) return null;
    const msg: QnMsg = { type: "submit", text: t };
    if (typeof icon === "string" && icon.trim()) (msg as any).icon = icon.trim();
    if (typeof keep === "boolean") (msg as any).keep = keep;
    return msg;
}

/** 自定义图标串 → 类型数组（与 NoteBox 面板 NoteTypes 同规则：全角归半角/trim/去空/空兜底 💡） */
export function parseNoteKinds(kinds: string): string[] {
    const arr = (kinds ?? "")
        .replaceAll("，", ",")
        .split(",")
        .map((i) => i.trim())
        .filter((i) => !!i);
    return arr.length > 0 ? arr : ["💡"];
}

/** 迟到 close 判定：toggle 收起（win.hide）触发页面 blur，200ms 防抖的 close 在 hidden
 *  页面被 Chromium 节流，可在下一次热键 show 之后才到达——无条件执行会把刚唤起的窗
 *  收掉（用户实测「第三次 ⌥J 闪现」）。close 带因果时刻 at（blur 发生时刻，非发出
 *  时刻），at ≤ 最近一次 show 时刻 ⇒ 过期丢弃。无 at（旧版页面）不丢弃，向后兼容 */
export function qnCloseStale(at: number | undefined, lastShowAt: number): boolean {
    return typeof at === "number" && at <= lastShowAt;
}

/** 窗口定位：鼠标屏 workArea 水平居中 + 垂直上 1/3 中线；窗口大于屏时收到屏内不越原点 */
export function qnWindowRect(
    workArea: { x: number; y: number; width: number; height: number },
    width: number,
    height: number,
): { x: number; y: number; width: number; height: number } {
    const w = Math.min(width, workArea.width);
    const h = Math.min(height, workArea.height);
    return {
        width: w,
        height: h,
        x: workArea.x + Math.max(0, Math.round((workArea.width - w) / 2)),
        y: workArea.y + Math.max(0, Math.round(workArea.height / 3 - h / 2)),
    };
}

/** 记忆 bounds × 当前全部屏 workArea 求交：任一屏有交集（含部分压边）=记忆仍有效原样
 *  返回（原地原样弹出，贴边摆位不强行拉回）；全部无交集（拔显示器/改分辨率）=null，
 *  调用方回落默认定位。窄条交集（如 width=0）不算命中 */
export function qnFitRect(
    saved: { x: number; y: number; width: number; height: number } | null | undefined,
    workAreas: { x: number; y: number; width: number; height: number }[],
): { x: number; y: number; width: number; height: number } | null {
    if (!saved || workAreas.length === 0) return null;
    const hit = workAreas.some((a) =>
        saved.x < a.x + a.width && saved.x + saved.width > a.x
        && saved.y < a.y + a.height && saved.y + saved.height > a.y);
    return hit ? saved : null;
}
