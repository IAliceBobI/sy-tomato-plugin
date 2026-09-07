/**
 * 图片遮挡数据层 v3（□2）：读时统一升级 v1/v2→v3，写方显式序列化落 v3。
 *
 * v3 = {v:3, shapes:[{t:"r"|"e", x,y,w,h, g}]}
 * - t：形状枚举（r=矩形 e=椭圆），留扩展位
 * - x/y/w/h：归一化 0~1——x/w 相对自然宽、y/h 相对自然高各自归一（根治旧格式单比例垂直错位）
 * - g：组号，0=无组（点击钉住同组联动用）
 *
 * 旧格式只在读时出现，写一次即升级：
 * - v2 {originWidth, overlays:[{left,top,width,height,angle,cID}]}：left/top 为中心 px 坐标。
 *   水平除 originWidth；垂直 v2 无 originHeight，用读链路传入的自然高近似（设计共识：旧数据
 *   本就垂直错位，可接受）。cID→g；angle 丢弃（矩形/椭圆正放）。
 * - v1 裸数组 [overlay,...]：与 v2 元素同构但无 originWidth，水平垂直都按传入 size 归一。
 */

export type OverlayShape = {
    t: "r" | "e";
    x: number;
    y: number;
    w: number;
    h: number;
    g: number;
};

export type OverlayData = {
    v: 3;
    shapes: OverlayShape[];
};

export type NaturalSize = { w: number; h: number };

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/** 零宽/零高条目过滤（clamp 后 ≤0 即画不出的脏数据） */
const drawable = (s: OverlayShape): boolean => s.w > 0 && s.h > 0;

const toNum = (n: unknown, fallback = 0): number => {
    const v = typeof n === "number" ? n : Number(n);
    return Number.isFinite(v) ? v : fallback;
};

/** v1/v2 条目（中心 px 坐标）→ v3 归一 shape；水平/垂直除数分传 */
const fromPxShape = (o: Record<string, unknown>, divW: number, divH: number): OverlayShape => {
    const w = toNum(o.width);
    const h = toNum(o.height);
    return {
        t: "r",
        x: clamp01((toNum(o.left) - w / 2) / divW),
        y: clamp01((toNum(o.top) - h / 2) / divH),
        w: clamp01(w / divW),
        h: clamp01(h / divH),
        g: Math.max(0, Math.round(toNum(o.cID))),
    };
};

export function parseOverlay(raw: string | null | undefined, size?: NaturalSize): OverlayData {
    const empty: OverlayData = { v: 3, shapes: [] };
    if (!raw) return empty;
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return empty;
    }
    if (Array.isArray(parsed)) {
        // v1：无 originWidth，size 缺失时 px 值视作已归一（除 1）
        const div = size ? size.w : 1;
        const divH = size ? size.h : 1;
        return { v: 3, shapes: (parsed as Record<string, unknown>[]).map(o => fromPxShape(o, div, divH)).filter(drawable) };
    }
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as any).shapes)) {
        // v3
        const shapes = (parsed as any).shapes as Record<string, unknown>[];
        return {
            v: 3,
            shapes: shapes.map((s): OverlayShape => ({
                t: s.t === "e" ? "e" : "r",
                x: clamp01(toNum(s.x)),
                y: clamp01(toNum(s.y)),
                w: clamp01(toNum(s.w)),
                h: clamp01(toNum(s.h)),
                g: Math.max(0, Math.round(toNum(s.g))),
            })).filter(drawable),
        };
    }
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as any).overlays)) {
        // v2：水平 originWidth；垂直优先自然高，回落 originWidth 近似
        const originW = toNum((parsed as any).originWidth);
        const divW = originW > 0 ? originW : 1;
        const divH = size && size.h > 0 ? size.h : divW;
        return { v: 3, shapes: ((parsed as any).overlays as Record<string, unknown>[]).map(o => fromPxShape(o, divW, divH)).filter(drawable) };
    }
    return empty;
}

export function serializeOverlay(data: OverlayData): string {
    if (!data.shapes.length) return "";
    return JSON.stringify(data);
}
