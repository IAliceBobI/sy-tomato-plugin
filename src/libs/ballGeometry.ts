// 悬浮球位置几何（期1 锚点版）：九宫格锚点(0-8 行序：0左上/1中上/2右上/3中左/4中心/
// 5中右/6左下/7中下/8右下) + 像素偏移，渲染=基准位+偏移+clamp 屏内。旧实现位置存
// config 顶层动态散键（TomatoFloatingBtnDMKey_*_offsetX/Y），新模型进 BallItem 数据本体。
// 期3 拖拽吸附（角部 16px 清偏移）复用本文件的 nearestAnchor。

export const BALL_MARGIN = 16;
// 叠瓦步长：新球默认右下角，每颗比上一颗往左上错一档
export const BALL_CASCADE_STEP = 12;

// 锚点基准位（球左上角坐标）；未知锚点按右下(8)兜底
export function anchorBasePoint(anchor: number, vw: number, vh: number, size: number): { x: number; y: number } {
    const a = anchor >= 0 && anchor <= 8 ? Math.floor(anchor) : 8;
    const col = a % 3; // 0左 1中 2右
    const row = Math.floor(a / 3); // 0上 1中 2下
    const x = col === 0 ? BALL_MARGIN : col === 1 ? (vw - size) / 2 : vw - size - BALL_MARGIN;
    const y = row === 0 ? BALL_MARGIN : row === 1 ? (vh - size) / 2 : vh - size - BALL_MARGIN;
    return { x, y };
}

// 钳到屏内（球完整可见）
export function clampBallPos(x: number, y: number, vw: number, vh: number, size: number): { x: number; y: number } {
    return {
        x: Math.round(Math.max(0, Math.min(x, vw - size))),
        y: Math.round(Math.max(0, Math.min(y, vh - size))),
    };
}

// 渲染位 = 基准位 + 偏移 + clamp
export function ballPositionOf(
    anchor: number, offsetX: number, offsetY: number, vw: number, vh: number, size: number,
): { x: number; y: number } {
    const base = anchorBasePoint(anchor, vw, vh, size);
    return clampBallPos(base.x + (offsetX || 0), base.y + (offsetY || 0), vw, vh, size);
}

// 像素位（球左上角）→ 最近锚点 + 与该锚点基准位的差值偏移。
// 各轴按相邻锚点中心的中点分界取最近档；偏移可正可负（渲染时 clamp 保底）。
export function nearestAnchor(x: number, y: number, vw: number, vh: number, size: number): {
    anchor: number; offsetX: number; offsetY: number;
} {
    const centers = (total: number) => {
        const c0 = BALL_MARGIN + size / 2;
        const c1 = total / 2;
        const c2 = total - size / 2 - BALL_MARGIN;
        return [c0, c1, c2];
    };
    const nearestCol = (pos: number, total: number) => {
        const [c0, c1, c2] = centers(total);
        const d = [Math.abs(pos - c0), Math.abs(pos - c1), Math.abs(pos - c2)];
        return d.indexOf(Math.min(...d));
    };
    const col = nearestCol(x + size / 2, vw);
    const row = nearestCol(y + size / 2, vh);
    const anchor = row * 3 + col;
    const base = anchorBasePoint(anchor, vw, vh, size);
    return {
        anchor,
        offsetX: Math.round(x - base.x),
        offsetY: Math.round(y - base.y),
    };
}

// 角部吸附判定（期3）：球外接盒距屏幕四角 < SNAP_PX → 返回该角 anchor（0/2/6/8），否则
// null。盒距=盒边/盒角到角点的欧氏距离（盒盖住角点=0）。不用「球心−半径」外接圆语义：
// 球容器现阶段非正方形（空格垫宽 112×28，期4 外观才圆化），外接圆心被推远致贴角
// 恰差零点几像素不命中（e2e 实锤）；盒距对任意容器形状都稳定。
// 双角同时命中（窄视口）取更近者。
export const SNAP_PX = 16;

export function snapCorner(x: number, y: number, vw: number, vh: number, size: number): number | null {
    const boxDist = (px: number, py: number) => {
        const dx = px < x ? x - px : px > x + size ? px - x - size : 0;
        const dy = py < y ? y - py : py > y + size ? py - y - size : 0;
        return Math.hypot(dx, dy);
    };
    const corners: Array<[number, number, number]> = [
        [0, 0, 0], [vw, 0, 2], [0, vh, 6], [vw, vh, 8],
    ];
    let best: number | null = null;
    let bestD = SNAP_PX;
    for (const [px, py, anchor] of corners) {
        const d = boxDist(px, py);
        if (d < bestD) {
            bestD = d;
            best = anchor;
        }
    }
    return best;
}

// 新球默认右下角叠瓦：index 递增逐档往左上错开（clamp 后仍在右下角邻域）
export function cascadeOffset(index: number): { offsetX: number; offsetY: number } {
    const step = BALL_CASCADE_STEP * Math.max(0, Math.floor(index));
    const off = step === 0 ? 0 : -step;
    return { offsetX: off, offsetY: off };
}
