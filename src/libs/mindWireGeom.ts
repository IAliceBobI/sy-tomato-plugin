// □1 渲染层地基几何纯函数（spec docs/tomato-mindwire-visual-spec.md §2/§4.1/§5.3）。
// 内容坐标系（D1）：所有坐标相对滚动容器内容原点（rect 差值一次换算），层挂容器内
// 随滚动走，滚动期零重算。块级出线点为现役 getEdgePoint 行为原样迁移（块级现状不动）。

export interface Pt {
    x: number;
    y: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** 视口 rect → 内容坐标锚信息：cx=横向中心，top/bottom=内容坐标纵向，w=宽度 */
export function toContentRect(elRect: { left: number; top: number; bottom: number; width: number }, contentRect: { left: number; top: number }) {
    return {
        cx: elRect.left + elRect.width / 2 - contentRect.left,
        top: elRect.top - contentRect.top,
        bottom: elRect.bottom - contentRect.top,
        w: elRect.width,
    };
}

/** 视口 rect 四边平移到内容坐标（块级出线点入参；与 toContentRect 同族，供需要 left/right 的消费方） */
export function shiftRect(rect: { left: number; right: number; top: number; bottom: number }, origin: { left: number; top: number }) {
    return {
        left: rect.left - origin.left,
        right: rect.right - origin.left,
        top: rect.top - origin.top,
        bottom: rect.bottom - origin.top,
    };
}

/** 块级出线点：近水平取贴目标一侧的侧缘中点，近垂直取朝向目标的顶/底缘中点（现役逻辑迁移） */
export function getEdgePoint(source: { left: number; right: number; top: number; bottom: number }, target: { left: number; right: number; top: number; bottom: number }): Pt {
    const scx = (source.left + source.right) / 2;
    const scy = (source.top + source.bottom) / 2;
    const tcx = (target.left + target.right) / 2;
    const tcy = (target.top + target.bottom) / 2;

    const THRESHOLD = 20;
    const dx = Math.abs(scx - tcx);
    const dy = Math.abs(scy - tcy);

    if (dx > THRESHOLD && dx > dy) {
        return scx < tcx ? { x: source.right, y: scy } : { x: source.left, y: scy };
    }

    if (scy < tcy) {
        return { x: scx, y: source.bottom };
    } else if (scy > tcy) {
        return { x: scx, y: source.top };
    }

    return scx < tcx ? { x: source.right, y: scy } : { x: source.left, y: scy };
}

/** 块级直线 path（块级行为现状不动：直线、无端点装饰） */
export function blockWirePath(p1: Pt, p2: Pt): string {
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
}

/** 词级贝塞尔 path（spec §4.1.2）：同行=下垂弧 quadratic，跨行=垂直控制臂 S 形 cubic */
export function wordWirePath(p1: Pt, p2: Pt, w1: number, w2: number): string {
    if (Math.abs(p2.y - p1.y) <= 24) {
        let sag = clamp(Math.abs(p2.x - p1.x) * 0.2 + 12, 12, 40);
        if (Math.abs(p2.x - p1.x) < (w1 + w2) / 2) sag *= 1.5;
        return `M ${p1.x} ${p1.y} Q ${(p1.x + p2.x) / 2} ${Math.max(p1.y, p2.y) + sag} ${p2.x} ${p2.y}`;
    }
    const s = p2.y >= p1.y ? 1 : -1;
    const d = clamp(Math.abs(p2.y - p1.y) * 0.45 + 16, 16, 96);
    return `M ${p1.x} ${p1.y} C ${p1.x} ${p1.y + d * s} ${p2.x} ${p2.y - d * s} ${p2.x} ${p2.y}`;
}
