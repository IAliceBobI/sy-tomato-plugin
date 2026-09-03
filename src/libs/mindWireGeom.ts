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

/** 词级贝塞尔完整几何（二期 □3 spec §12：d + 线中点 + 两端锚定信息）。
 *  迷你条悬在中点上方 8px（spec §4.5）；ends 供圆点双路（CSS 类名/svg dotY）消费 */
export interface WordWireGeometry {
    d: string;
    /** t=0.5 中点（de Casteljau；迷你条定位消费） */
    mid: Pt;
    ends: [WordWireEnd, WordWireEnd];
}

/** 词级锚词盒（toContentRect 产出形，drawWordOne 的 a1/a2 直传零适配） */
export interface WordBox {
    cx: number;
    top: number;
    bottom: number;
    w: number;
}

/** 词级线端锚定信息（§12.2 R2/R3/R5）：edge 供 CSS 类名 toggle，dotY 供跨行 svg circle */
export interface WordWireEnd {
    edge: "bottom" | "top";
    /** 线端点 y（bottom+8 / top−eTop） */
    y: number;
    /** 圆点中心 y（svg circle 消费；CSS 点走类名固定 ±7px） */
    dotY: number;
}

const SAME_LINE_DY = 24; // 同行阈值（现状值不变；判定载体换盒中心，等高盒数值恒等）
const EP_GAP = 8;        // 端点出线距（底缘现状值，顶缘镜像）
const DOT_AFTER = 3.5;   // 端点→圆点中心距（8−4.5，底缘现状不变量的镜像基）

/** 顶缘出线距（§12.2 R3）：默认 8 与底缘镜像；上方空间不足线性收 4~8。
 *  gapAbove 复用 availAboveOf（□5 chip 下置同款量，零新增布局读） */
export function topAnchorOffset(gapAbove: number): number {
    return clamp(gapAbove * 0.5, 4, EP_GAP);
}

/** 词级贝塞尔完整几何（spec §12.2，一次判定无迭代）：同行（盒中心纵向差≤24）=
 *  双底缘下垂弧现状原样（sag 数学 □5 拍板不动）；跨行=方向感知缘——对端在上→本端
 *  顶缘 (cx, top−eTop) 出线（用户反馈「线从上下来不穿词、落在词顶」），控制臂改按
 *  端点纵距 span 计算+短距封顶（span<29 倒挂时防大臂甩进两端词带） */
export function wordWireGeometry(
    b1: WordBox, b2: WordBox,
    gapAbove1 = Infinity, gapAbove2 = Infinity,
): WordWireGeometry {
    const cy1 = (b1.top + b1.bottom) / 2;
    const cy2 = (b2.top + b2.bottom) / 2;
    const dx = Math.abs(b2.cx - b1.cx);
    if (Math.abs(cy2 - cy1) <= SAME_LINE_DY) {
        let sag = clamp(dx * 0.2 + 12, 12, 40);
        if (dx < (b1.w + b2.w) / 2) sag *= 1.5;
        const y1 = b1.bottom + EP_GAP;
        const y2 = b2.bottom + EP_GAP;
        const qx = (b1.cx + b2.cx) / 2;
        const qy = Math.max(y1, y2) + sag;
        return {
            d: `M ${b1.cx} ${y1} Q ${qx} ${qy} ${b2.cx} ${y2}`,
            mid: { x: (b1.cx + 2 * qx + b2.cx) / 4, y: (y1 + 2 * qy + y2) / 4 },
            ends: [
                { edge: "bottom", y: y1, dotY: b1.bottom + (EP_GAP - DOT_AFTER) },
                { edge: "bottom", y: y2, dotY: b2.bottom + (EP_GAP - DOT_AFTER) },
            ],
        };
    }
    // 缘判定：对端在上→本端顶缘（盒中点一次比较，≥ 兜底底缘与 stubDir 同款）
    const e1 = cy2 >= cy1 ? "bottom" : "top";
    const e2 = cy1 >= cy2 ? "bottom" : "top";
    const off1 = e1 === "top" ? topAnchorOffset(gapAbove1) : EP_GAP;
    const off2 = e2 === "top" ? topAnchorOffset(gapAbove2) : EP_GAP;
    const y1 = e1 === "bottom" ? b1.bottom + off1 : b1.top - off1;
    const y2 = e2 === "bottom" ? b2.bottom + off2 : b2.top - off2;
    // 控制臂：臂各自背离本端词（底缘 +1 / 顶缘 −1，指进词间走廊）；短距封顶防甩进词带
    const span = Math.abs(y2 - y1);
    const arm = Math.min(clamp(span * 0.45 + 16, 16, 96), Math.max(span, 12));
    const a1 = e1 === "bottom" ? 1 : -1;
    const a2 = e2 === "bottom" ? 1 : -1;
    const c1y = y1 + arm * a1;
    const c2y = y2 + arm * a2;
    return {
        d: `M ${b1.cx} ${y1} C ${b1.cx} ${c1y} ${b2.cx} ${c2y} ${b2.cx} ${y2}`,
        // C1.x=p1.x、C2.x=p2.x → 中点 x 即两端均值；C1y+C2y≡y1+y2 → mid.y=(y1+y2)/2
        mid: {
            x: (b1.cx + b2.cx) / 2,
            y: (y1 + 3 * c1y + 3 * c2y + y2) / 8,
        },
        ends: [
            { edge: e1, y: y1, dotY: e1 === "bottom" ? b1.bottom + (EP_GAP - DOT_AFTER) : y1 + DOT_AFTER },
            { edge: e2, y: y2, dotY: e2 === "bottom" ? b2.bottom + (EP_GAP - DOT_AFTER) : y2 + DOT_AFTER },
        ],
    };
}

/** 线中点迷你条锚位（spec §4.5）：left/top=中点（上浮 8px 由 CSS transform 承担）；
 *  距层顶 <40px 翻到线下方（below 变体 translateY(+8px)，防被滚动容器顶裁）。
 *  □5 P2 补：条挂内容坐标随滚动走，上浮 8px+条高 ~28px 后越**滚动视口顶**同样被容器
 *  overflow 裁掉（DOM alive/computed visible 但用户看不见，vision 像素实锤）——below
 *  判定改按 viewTop=scrollTop 与层顶取严：中点离两顶任一 <40px 即翻下方 */
export function toolbarPos(mid: Pt, viewTop = 0): { left: number; top: number; below: boolean } {
    return { left: mid.x, top: mid.y, below: mid.y < Math.max(40, viewTop + 40) };
}

// ---------------------------------------------------------------------------
// 滚动三态 + 线头残端（□4 · spec §4.1.4/§4.2）。双端离屏不画由容器 overflow 裁剪
// 自然涌现（零代码）；本组纯函数锁滚动期 chip 显隐判定与残端锚位/钳制/方向。
// 双 chip 预建：chip 挂层内锚词旁随内容走（位置/方向重画时由内容序定死），
// 滚动事件只剩 rAF 切显隐——线本体与 chip 几何零滚动重算（D1 不破）。
// ---------------------------------------------------------------------------

export type WireViewState =
    | { state: "both" }
    | { state: "none" }
    | { state: "stub"; visibleEnd: 0 | 1; dir: "down" | "up" };

/** 三态判定（spec §4.1.4）：端与视口相交即可见（贴缘/跨缘半截不算离屏——
 *  锚词还有像素在屏上，用户看得见它，不需要 chip 指路）；单端离屏时
 *  dir=离屏端相对可见端的方向（chevron 朝向），两端对称 */
export function wireViewState(
    end1: { top: number; bottom: number },
    end2: { top: number; bottom: number },
    view: { top: number; bottom: number },
): WireViewState {
    const vis = (e: { top: number; bottom: number }) => e.bottom >= view.top && e.top <= view.bottom;
    const v1 = vis(end1);
    const v2 = vis(end2);
    if (v1 && v2) return { state: "both" };
    if (!v1 && !v2) return { state: "none" };
    if (v1) return { state: "stub", visibleEnd: 0, dir: end2.top > view.bottom ? "down" : "up" };
    return { state: "stub", visibleEnd: 1, dir: end1.top > view.bottom ? "down" : "up" };
}

/** 残端 chip 锚位（spec §4.2）：下离屏=锚词底缘+14px；上离屏=顶缘−38px（chip 高~24 含
 *  chevron）；left=锚词中心 x（CSS translateX(-50%) 居中锚定）。
 *  □5 拍板：availAbove=锚词上方可用空间（到上邻块底/层顶），上态且空间 <38px 时
 *  下置到词底+14（与 down 态同位、chevron 仍朝上）——防 chip 越块顶与上一块底边框
 *  贴碰；块级锚不传（骑块顶是块级既有形态，下置会盖块内首行文字） */
export function stubPos(anchor: { cx: number; top: number; bottom: number }, dir: "down" | "up", availAbove = Infinity): { left: number; top: number } {
    if (dir === "up" && availAbove < 38) return { left: anchor.cx, top: anchor.bottom + 14 };
    return dir === "down"
        ? { left: anchor.cx, top: anchor.bottom + 14 }
        : { left: anchor.cx, top: anchor.top - 38 };
}

/** 残端 chip 视口缘让位（□5 拍板）：chip 挂内容坐标随滚动走，锚词恰在视口顶/底缘时
 *  chip 被裁半个——滚动 rAF 里按视口算 marginTop 精确推回缘内（顶越推正/底越推负，
 *  各留 4px 余量；缘内零让位）。chip 高按 ~24 计（视觉 22+热区皮） */
export function stubEdgeShift(chipTop: number, view: { top: number; bottom: number }): number {
    const CHIP_H = 24;
    if (chipTop < view.top) return view.top - chipTop + 4;
    if (chipTop + CHIP_H > view.bottom) return view.bottom - chipTop - CHIP_H - 4;
    return 0;
}

/** 水平矩形（内容坐标；stubAvoidShift/toolbarAvoidShift 的障碍/浮件输入形） */
export interface HRect {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

/** 浮件与障碍的水平重叠判定（垂直相交 + 水平重叠，均严格不等——贴边=恰好留出间隙的分隔） */
function hOverlaps(f: HRect, o: HRect): boolean {
    return f.top < o.bottom && f.bottom > o.top && f.left < o.right && f.right > o.left;
}

/** 残端 chip 水平避让（□5 P1：chip 下置压字）：chip 矩形与障碍（chip 占位带内的文本块
 *  矩形，含窄标题块）垂直相交且水平重叠时，推到障碍联合区间外留 CLEAR 间隙，位移取小侧；
 *  两侧都推不进层内（层缘留 8px 与 clampStubX 同款）→ tight=true 由 CSS 毛玻璃紧凑态兜底
 *  （缩小牺牲可读性、整体半透明双文字互透更难读，vision □5 评审否掉） */
export function stubAvoidShift(chip: HRect, obstacles: HRect[], layerW: number): { dx: number; tight: boolean } {
    const CLEAR = 12;
    const chipW = chip.right - chip.left;
    const inBand = obstacles.filter((o) => chip.top < o.bottom && chip.bottom > o.top);
    if (!inBand.some((o) => hOverlaps(chip, o))) return { dx: 0, tight: false };
    // 联合区间：垂直带内障碍按水平位置排序，间隙容不下 chip（<chipW+2×CLEAR）即连成一段
    // ——避免推出近端障碍又落进远端障碍、或挤进视觉上仍贴字的窄缝
    const spans = inBand.map((o) => ({ left: o.left, right: o.right })).sort((a, b) => a.left - b.left);
    const merged: { left: number; right: number }[] = [];
    for (const s of spans) {
        const last = merged[merged.length - 1];
        if (last && s.left - last.right < chipW + 2 * CLEAR) last.right = Math.max(last.right, s.right);
        else merged.push({ left: s.left, right: s.right });
    }
    // chip 所在段=与 chip 水平重叠的联合段（入段前提已保证存在）
    const seg = merged.find((m) => chip.left < m.right && chip.right > m.left)!;
    const okAt = (dx: number) => {
        const nl = chip.left + dx;
        const nr = chip.right + dx;
        return nl >= 8 && nr <= layerW - 8 && !inBand.some((o) => nl < o.right && nr > o.left);
    };
    const cand: number[] = [];
    const dr = seg.right + CLEAR - chip.left;
    if (okAt(dr)) cand.push(dr);
    const dl = seg.left - CLEAR - chip.right;
    if (okAt(dl)) cand.push(dl);
    if (!cand.length) return { dx: 0, tight: true };
    cand.sort((a, b) => Math.abs(a) - Math.abs(b));
    return { dx: cand[0], tight: false };
}

/** 迷你条避弧水平让位（□5 P2：迷你条与弧交叠）：条与弧 bbox（细线近似为盒，外扩 8px
 *  线宽/视觉余量）相交时推到盒外留 12px，位移取小侧——近垂直弧下移无效只水平让
 *  （vision □5 评审）；layerW 可选，传入时越界侧不可行（层 overflow 裁切比压弧更伤） */
export function toolbarAvoidShift(bar: HRect, arcBox: HRect | null, layerW = Infinity): number {
    if (!arcBox || !hOverlaps(bar, arcBox)) return 0;
    const PAD = 8;
    const CLEAR = 12;
    const box = { left: arcBox.left - PAD, right: arcBox.right + PAD, top: arcBox.top - PAD, bottom: arcBox.bottom + PAD };
    const okAt = (dx: number) => bar.left + dx >= 8 && bar.right + dx <= layerW - 8;
    const cand: number[] = [];
    const dr = box.right + CLEAR - bar.left;
    if (okAt(dr)) cand.push(dr);
    const dl = box.left - CLEAR - bar.right;
    if (okAt(dl)) cand.push(dl);
    if (!cand.length) return 0; // 两侧越层：保持原位（瞬态条可容忍，不硬推）
    cand.sort((a, b) => Math.abs(a) - Math.abs(b));
    return cand[0];
}

/** 残端 chip 水平钳制：中心 x 限制在 [8+半宽, 层宽−8−半宽]，左右留 8px 边距；
 *  层比 chip 还窄（lo≥hi）时贴左——左缘 8px 边距优先，右半溢出由层 overflow 裁 */
export function clampStubX(left: number, halfWidth: number, layerWidth: number): number {
    const lo = 8 + halfWidth;
    const hi = layerWidth - 8 - halfWidth;
    return lo >= hi ? lo : clamp(left, lo, hi);
}

/** chip 方向（内容序定死，与滚动无关）：对端纵向中点在本端下方 → down。
 *  挂「较上端」旁的 chip 显示时必然是下端离屏（下端在视口上方则上端更不可见），
 *  故方向在重画时即可判定；中点相等（同行）兜底 down */
export function stubDir(self: { top: number; bottom: number }, other: { top: number; bottom: number }): "down" | "up" {
    return (other.top + other.bottom) / 2 >= (self.top + self.bottom) / 2 ? "down" : "up";
}
