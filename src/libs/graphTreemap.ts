// src/libs/graphTreemap.ts
// GraphBox 方块总览 treemap 纯函数（treemap 战役 □1，2026-09-17）：squarified treemap
// （Bruls et al. 2000 经典版，手写不引 d3-hierarchy——bear 拍板）。输入=容器树 rows +
// StructureInfo（buildStructureInfo 全量通道 / structureRowsFromOutline 骨架通道产物），
// 输出=矩形平铺列表（渲染层 GraphTreemap.svelte 消费）。纯同步零 IO，风格对齐 graphParaMerge。
//
// 设计约束（brainstorm 拍板，勿翻案）：
// - 面积权重=字数（叶子=length 列优先/退 content.length；容器=子树合计），非块数
// - 根矩形不输出（画布即文档），一级矩形=章节容器
// - 兄弟近似保序即可（squarify 降序填充本性，勿追求严格文档序）
// - 归并规则在算法层：输出矩形任一边 <minLeafPx（默认 4px）的叶子不输出，面积留在
//   父容器底色上（视觉=父矩形吞掉其面积）
// - 跨文档端点行（root_id 异于文档根）不进 treemap（GraphBox 反链补块防御）
import type { StructureInfo } from "./graphStructure";

export interface TreemapRect {
    id: string;
    kind: "container" | "leaf";
    /** 文档根=0（根矩形不输出，画布即文档）；一级容器=1 */
    depth: number;
    x: number;
    y: number;
    w: number;
    h: number;
    /** 叶子=自身字数；容器=子树字数合计（面积权重=字数，bear 拍板） */
    weight: number;
}

export interface TreemapOptions {
    /** 叶子矩形最短边下限 px，低于此值归并进父容器底色（拍板 ~4px，□3 实测可调 2~6） */
    minLeafPx?: number;
    /** 显式文档根块 id（review P2-3）：反链补块可能把外来文档根行排在 rows 前头，
     *  自动推断（首个自洽 type=d 行）会被劫持致整图蒸发。缺省退自动推断 */
    docID?: string;
    /** 下钻树顶（□3 双击章节）：以该标题节点为根铺满画布，子树外不进；缺省=文档根。
     *  不在块集内时退文档根（防御） */
    rootID?: string;
    /** 叶子权重覆盖（□5 标记模式）：回调返 0=剪枝该叶子（无标记块不出矩形）；
     *  缺省=weightOfLeaf 字数口径。容器权重恒=子树合计不受影响 */
    weightOf?: (b: Block) => number;
    /** 一级空章底值（□5 标记模式薄框，陆杰「无标记章节剩薄框」口径）：depth=1 容器
     *  子树权重合计 0 时不剪枝、给此值出薄框（深层空小节照旧剪枝——ε 套 ε 碎框；
     *  下钻态的 depth=1=下钻树顶直属小节，语义随树顶平移）。0/缺省=□1 原语义（空容器剪枝） */
    emptyContainerWeight?: number;
}

/** 叶子权重=字数：SQL 骨架通道 length 列优先（叶子行 content 通常空省流量），
 *  DOM 通道无 length 落 content.length。导出供标记模式覆盖回调内复用同口径 */
export function weightOfLeaf(b: Block): number {
    return b.length ?? (b.content ?? "").length;
}

/** 内部布局树节点：容器与叶子统一形态，weight 自底向上合计。
 *  type/row 供容器自重口径（graphbox-listfix：列表项 i 的项文本在 DOM 通道被
 *  shortenList 吸收进自身 content——不算自重则纯列表子树零权重整族剪枝） */
interface TNode {
    id: string;
    isLeaf: boolean;
    weight: number;
    depth: number;
    children: TNode[];
    type: string;
    row?: Block;
}

export function computeTreemap(
    rows: Block[],
    info: StructureInfo,
    canvasWidth: number,
    canvasHeight: number,
    opts?: TreemapOptions,
): TreemapRect[] {
    const minLeafPx = opts?.minLeafPx ?? 4;
    if (rows.length === 0 || canvasWidth <= 0 || canvasHeight <= 0) return [];
    const byId = new Map(rows.map(r => [r.id, r]));
    // 树顶：rootID（下钻根=标题节点，□3）→ docID 显式 → 首个自洽 d 行 → 首个 d 行；
    // rootID 不在块集时退文档根（防御）
    const rootRow = (opts?.rootID ? byId.get(opts.rootID) : undefined)
        ?? (opts?.docID ? byId.get(opts.docID) : undefined)
        ?? rows.find(r => r.type === "d" && r.root_id === r.id)
        ?? rows.find(r => r.type === "d");
    if (!rootRow) return [];
    const rootID = rootRow.id;

    // 本文档容器集：StructureInfo.containers 里 root_id 与文档根一致的（跨文档端点行剔除）
    const containers = new Set<string>([rootID]);
    for (const id of info.containers) {
        const r = byId.get(id);
        if (r && r.id !== rootID && r.root_id === rootRow.root_id) containers.add(id);
    }

    // 容器挂父：沿 parent_id 上爬穿透非容器到最近容器祖先（buildStructureInfo.climb 同语义），
    // 断链/爬到顶挂文档根不丢；环防御
    const mountMemo = new Map<string, string>();
    const mountOf = (id: string): string => {
        if (mountMemo.has(id)) return mountMemo.get(id)!;
        const seen = new Set<string>();
        let hit = rootID;
        let pid = byId.get(id)?.parent_id ?? "";
        while (pid && !seen.has(pid)) {
            if (containers.has(pid)) { hit = pid; break; }
            seen.add(pid);
            pid = byId.get(pid)?.parent_id ?? "";
        }
        mountMemo.set(id, hit);
        return hit;
    };
    const nodes = new Map<string, TNode>();
    const rootNode: TNode = { id: rootID, isLeaf: false, weight: 0, depth: 0, children: [], type: "d", row: rootRow };
    nodes.set(rootID, rootNode);
    // 容器挂父分组 → 从树顶 DFS 建树（depth 天然递增；下钻 rootID 时树外容器不可达
    // 不建节点——其 directLeaves 挂载循环查 nodes 剔除，防 undefined.children）
    const childContainers = new Map<string, string[]>();
    for (const id of containers) {
        if (id === rootID) continue;
        const p = mountOf(id);
        if (p === id) continue;
        (childContainers.get(p) ?? childContainers.set(p, []).get(p)!).push(id);
    }
    const linkChildren = (cid: string, depth: number) => {
        for (const c of childContainers.get(cid) ?? []) {
            const n: TNode = { id: c, isLeaf: false, weight: 0, depth, children: [], type: byId.get(c)?.type ?? "", row: byId.get(c) };
            nodes.set(c, n);
            nodes.get(cid)!.children.push(n);
            linkChildren(c, depth + 1);
        }
    };
    linkChildren(rootID, 1);
    // 直属叶子挂容器：零权重不建节点（4px 归并的极限形态，参与布局只会产 0 尺寸矩形）；
    // 同 id 重复物理行去重（blocks 表偶发脏行——Svelte keyed each 重复 key 冻结形态在档）
    const leafWeight = opts?.weightOf ?? weightOfLeaf;
    const seenLeafIds = new Set<string>();
    for (const [cid, leaves] of info.directLeaves) {
        const owner = nodes.get(cid);
        if (!owner) continue; // 挂在跨文档/脏数据容器上的叶子
        for (const lf of leaves) {
            if (lf.root_id !== rootRow.root_id || seenLeafIds.has(lf.id)) continue;
            const w = leafWeight(lf);
            if (w <= 0) continue;
            seenLeafIds.add(lf.id);
            const n: TNode = { id: lf.id, isLeaf: true, weight: w, depth: owner.depth + 1, children: [], type: lf.type, row: lf };
            owner.children.push(n);
        }
    }
    // 权重自底向上合计+剪枝（review P0）：零权重子树（空标题章等）不进布局——
    // 参与布局只会成为末行 0/0=NaN 矩形。□5 薄框：depth=1 空章不剪、给 ε 出薄框
    // （children 已空=纯色框无嵌套，深层空容器照旧剪——ε 套 ε 碎框防线）
    const emptyW = opts?.emptyContainerWeight ?? 0;
    const calc = (n: TNode): number => {
        if (n.isLeaf) return n.weight;
        n.children = n.children.filter(c => calc(c) > 0);
        // graphbox-listfix：列表项容器自重=自身字数（DOM 通道项文本吸收进 i.content，
        // 不算则无直属叶子的纯列表子树零权重剪光；SQL 通道项内 p 已计叶子、自身=项
        // 文本行不 double——标题/引述容器不含自重，□1「面积=字数」口径不回归）
        const own = n.type === "i" && n.row ? leafWeight(n.row) : 0;
        n.weight = n.children.reduce((s, c) => s + c.weight, 0) + own;
        if (n.children.length === 0 && own > 0) n.isLeaf = true; // 叶容器：无子可钻按 leaf 落矩形
        if (n.weight <= 0 && emptyW > 0 && n.depth === 1) {
            n.weight = emptyW;
            n.children = [];
        }
        return n.weight;
    };
    calc(rootNode);
    if (rootNode.weight <= 0) return [];

    const out: TreemapRect[] = [];
    layoutChildren(rootNode.children, 0, 0, canvasWidth, canvasHeight, out, minLeafPx);
    return out;
}

/** 一层孩子铺进矩形（squarify 主体）：孩子降序填充，行内比较最差纵横比决定收/分行 */
function layoutChildren(children: TNode[], x: number, y: number, w: number, h: number, out: TreemapRect[], minLeafPx: number): void {
    if (children.length === 0 || w <= 0 || h <= 0) return;
    let remaining = children.reduce((s, c) => s + c.weight, 0);
    const queue = [...children].sort((a, b) => b.weight - a.weight);
    let rx = x, ry = y, rw = w, rh = h;
    let row: TNode[] = [];
    let rowSum = 0, rowMax = 0, rowMin = Infinity;
    let qi = 0; // 下标游标（shift O(n²) 换线性，review P2-5）
    while (qi < queue.length) {
        const c = queue[qi].weight;
        const short = Math.min(rw, rh);
        const worstWithC = row.length === 0 ? Infinity : Math.max(
            (short * short * Math.max(rowMax, c)) / ((rowSum + c) * (rowSum + c)),
            ((rowSum + c) * (rowSum + c)) / (short * short * Math.min(rowMin, c)),
        );
        const worstRow = row.length === 0 ? Infinity : Math.max(
            (short * short * rowMax) / (rowSum * rowSum),
            (rowSum * rowSum) / (short * short * rowMin),
        );
        if (row.length === 0 || worstWithC <= worstRow) {
            const n = queue[qi++];
            row.push(n);
            rowSum += n.weight;
            rowMax = Math.max(rowMax, n.weight);
            rowMin = Math.min(rowMin, n.weight);
        } else {
            ({ rx, ry, rw, rh, remaining } = layoutRow(row, rowSum, rx, ry, rw, rh, remaining, out, minLeafPx));
            row = [];
            rowSum = 0; rowMax = 0; rowMin = Infinity;
        }
    }
    if (row.length > 0) {
        layoutRow(row, rowSum, rx, ry, rw, rh, remaining, out, minLeafPx);
    }
}

/** 铺一行：沿短边方向行厚=s/remaining 占比，行内孩子沿长边按权重分。
 *  返回扣除本行后的剩余矩形与剩余权重 */
function layoutRow(
    row: TNode[], s: number, rx: number, ry: number, rw: number, rh: number,
    remaining: number, out: TreemapRect[], minLeafPx: number,
): { rx: number; ry: number; rw: number; rh: number; remaining: number } {
    if (rw >= rh) {
        // 竖条贴左：行厚沿宽方向，孩子沿高分
        const d = (rw * s) / remaining;
        let cy = ry;
        for (const n of row) {
            const ch = (rh * n.weight) / s;
            place(n, rx, cy, d, ch, out, minLeafPx);
            cy += ch;
        }
        return { rx: rx + d, ry, rw: rw - d, rh, remaining: remaining - s };
    }
    // 横条贴顶：行厚沿高方向，孩子沿宽分
    const d = (rh * s) / remaining;
    let cx = rx;
    for (const n of row) {
        const cw = (rw * n.weight) / s;
        place(n, cx, ry, cw, d, out, minLeafPx);
        cx += cw;
    }
    return { rx, ry: ry + d, rw, rh: rh - d, remaining: remaining - s };
}

/** 落矩形：容器=输出+子树递归；叶子=最短边达 minLeafPx 才输出（否则归并进父底色）。
 *  首行 NaN/非正宽高防御（review P0 兜底——零权重子树剪枝后理论到不了，防御浮点尘埃） */
function place(n: TNode, x: number, y: number, w: number, h: number, out: TreemapRect[], minLeafPx: number): void {
    if (!(w > 0) || !(h > 0)) return;
    if (n.isLeaf) {
        if (Math.min(w, h) >= minLeafPx) {
            out.push({ id: n.id, kind: "leaf", depth: n.depth, x, y, w, h, weight: n.weight });
        }
        return;
    }
    out.push({ id: n.id, kind: "container", depth: n.depth, x, y, w, h, weight: n.weight });
    // graphbox-listfix（vision P1 标签叠影）：容器内缩出标签条区域（顶部 ~20px）再铺
    // 子树——否则嵌套链「子矩形占满父矩形」（squarify 天性），深层列表拍平成边线+
    // 父子标签同锚点叠印。矮容器（<40px）不缩防子区域挤没（showLabel 同款不渲染标签）
    const inset = h >= 40 ? 20 : 0;
    layoutChildren(n.children, x, y + inset, w, h - inset, out, minLeafPx);
}

// ---- treemap □4：引用聚焦匹配（纯函数）----
// 输入须已是引用边（isRef 过滤在数据源侧 GraphBox）。选中叶子=精确端点匹配（段落
// 粒度的引用直觉）；选中容器=子树闭包（直属叶子经 containerOfLeaf 归一、嵌套容器经
// parentOf 链上爬）——「该章节（含其内容）的引用」语义，与结构档徽标承载一致。
// 跨文档端点（两映射都查不到）链=自身，作为 peer 正常进列表（渲染层无矩形不高亮，
// 列表点跳原文可达）。行内级目标已在数据源侧挂所在块（块级图无行内粒度，设计共识）。

export interface RefLinkLike {
    source: string;
    target: string;
    label?: string;
}

export interface RefPeer {
    /** 边的另一端块 id（叶子/容器/跨文档块） */
    peerId: string;
    /** 引用锚文本 */
    label: string;
}

export interface RefFocusContext {
    /** 叶子 id → 归属容器 id（StructureInfo.containerOfLeaf） */
    containerOfLeaf: Map<string, string>;
    /** 容器 id → 父容器 id（rows 的 parent_id 映射） */
    parentOf: Map<string, string>;
}

/** 端点 → 锚链集合（叶子先归一到容器，再沿容器链上爬到根；含自身） */
function anchorChainOf(id: string, ctx: RefFocusContext): Set<string> {
    const chain = new Set<string>();
    let cur: string | undefined = ctx.containerOfLeaf.get(id) ?? id;
    for (let hops = 0; cur && !chain.has(cur) && hops < 64; hops++) {
        chain.add(cur);
        cur = ctx.parentOf.get(cur);
    }
    return chain;
}

/** 引用聚焦匹配：selectedId 的出边（它引用的）与入边（引用它的），锚文本透传
 *  （同 peer 多锚=多条，工具条按边计数） */
export function matchRefFocus(
    links: RefLinkLike[],
    selectedId: string,
    ctx: RefFocusContext,
): { outgoing: RefPeer[]; incoming: RefPeer[] } {
    const outgoing: RefPeer[] = [];
    const incoming: RefPeer[] = [];
    if (!selectedId) return { outgoing, incoming };
    // 叶子=精确粒度；容器=子树闭包（containerOfLeaf 只对叶子有值）
    const isLeaf = ctx.containerOfLeaf.has(selectedId);
    const hit = (end: string): boolean =>
        isLeaf ? end === selectedId : anchorChainOf(end, ctx).has(selectedId);
    for (const l of links) {
        if (hit(l.source)) outgoing.push({ peerId: l.target, label: l.label ?? "" });
        if (hit(l.target)) incoming.push({ peerId: l.source, label: l.label ?? "" });
    }
    return { outgoing, incoming };
}

/** □4 高亮重定向：peer 端点无矩形（b 壳等不在容器树的块、被归并叶子）→ 沿锚链
 *  上爬最近有矩形的容器承载描边；跨文档端点链=自身恒无矩形 → undefined（不高亮，
 *  工具条列表点跳原文仍可达）。对齐 redirectLinksToContainers 的「叶子端点挂容器」先例 */
export function resolveHighlightId(
    peerId: string,
    rectIds: Set<string>,
    ctx: RefFocusContext,
): string | undefined {
    let cur: string | undefined = peerId;
    for (let hops = 0; cur && hops < 64; hops++) {
        if (rectIds.has(cur)) return cur;
        // 下一跳：叶子先归一容器（containerOfLeaf），容器沿树爬父（parentOf）
        cur = ctx.containerOfLeaf.get(cur) ?? ctx.parentOf.get(cur);
    }
    return undefined;
}
