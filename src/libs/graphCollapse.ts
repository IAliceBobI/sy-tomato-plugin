// src/libs/graphCollapse.ts
// GraphBox 折叠机制纯函数（graphbox 翻新期 2，2026-09-04）：
// 折叠集（Set<nodeID>）驱动可见子图——折叠节点自身可见、子树全藏、角标 N 计数；
// 引用边端点落入折叠子树时重定向到最近可见祖先（原始端点保留，删边仍删真块引用）。
// 纯同步零 IO——持久化（custom-graph-collapsed）与渲染在 GraphBox.svelte，不进本文件。
//
// 期7（2026-09-04）变化：段落链不再走折叠机制——mergeParagraphChains（graphParaMerge.ts）
// 在数据预处理层把链子树整链合并为 ¶ 大节点（永不多节点化），本文件只管标题/子树折叠；
// expandSubtree（「展开全部段落」菜单的底座）随 ¶ 展开族退役一并删除。

// graphmind □4（2026-09-19）：档位口径=「显示到第 N 级标题」（N=1..6，h1~h6 大纲心智）。
// ExpandLevel 本体仍是折叠口径（level="N"=折叠相对级 ≥N 的标题——initialCollapsedRows
// 语义与单测钉死不动），「显示到 N 级 ⇔ 折叠档 N」换算走 showLevelToExpandLevel。
// graphrelayout □7（2026-09-20）：新档 "auto"=自适应最高标题级（bear 拍板「默认显示到
// 一级标题；没有一级只有二级就显示二级」）——设置消费层 settingShowLevelToExpand 换算
// （文档最高标题级经 base 归一化恒=相对第 1 级 ⇒ auto ⇔ 折叠档 1；无标题退 headings），
// 直通 initialCollapsedRows 的防御口径=折叠档 1（同 "1"）。
export type ExpandLevel = "auto" | "1" | "2" | "3" | "4" | "5" | "6" | "all" | "headings";

export interface TreeIndex {
    byId: Map<string, Block>;
    childrenOf: Map<string, string[]>;
    parentOf: Map<string, string>;
    /** 图内无父节点（文档根 parent 自指视为根；跨文档补点 parent 在图外亦为根） */
    roots: string[];
}

/** rows（getData/getGraphSkeleton 产物，DFS 序）→ 图内父子索引 */
export function buildTreeIndex(rows: Block[]): TreeIndex {
    const byId = new Map(rows.map(r => [r.id, r]));
    const childrenOf = new Map<string, string[]>();
    const parentOf = new Map<string, string>();
    const roots: string[] = [];
    for (const r of rows) {
        const pid = r.parent_id;
        if (pid && pid !== r.id && byId.has(pid)) {
            parentOf.set(r.id, pid);
            (childrenOf.get(pid) ?? childrenOf.set(pid, []).get(pid)!).push(r.id);
        } else {
            roots.push(r.id);
        }
    }
    return { byId, childrenOf, parentOf, roots };
}

/** 初始折叠集档位豁免（□8 评审 P2）：full 档超级块不进默认折叠——subflow 空间组默认
 *  展开（□8 前语义；□8 的 s 默认折叠是 structure 档拍板，误扩 full 档会让无存档文档
 *  首开 sb 从空间组退折叠卡） */
export interface CollapsedRowsOpts {
    keepSuperExpanded?: boolean;
}

/**
 * 初始折叠集（按 rows 出现序，确定性；期7 起只按标题层级，段落链已改走 ¶ 合并通道）：
 * level="N"：标题层级 ≥N 且有图内子节点的标题；level="all"：空集。
 * level="headings"（graphmind □2 新默认）：展开到文档最深标题级——标题全不折
 * （骨架全显、段落收徽章），与 all 的分野=列表容器仍默认折叠（bear 拍板
 * 「列表不在展开范围」不随默认档抬升）。
 * 叶子标题（无子树）不进集——空角标点击无反应（e2e 实锤）；文档根不折叠。
 * graphbox-listfix（2026-09-18 bear 拍板「列表不在展开范围也可以」）：非标题容器
 * 默认折叠——层级可见靠展开 toggle（+N 角标），all 同样全展开。
 * graphrelayout □8（bear 拍板「列表/超级块都是容器，向下打开」）：容器族=i/l/s 全默认
 * 折叠（●N 徽标自带展开/收缩）；级数档（1..6/auto/headings）只管标题层，容器不受
 * 级数选择器折叠影响（自己的 ●N 控制），唯 all 恒全展开。**s 折叠限 structure 档**——
 * full 档传 {keepSuperExpanded:true}（applyRowsAndLinks/applyShowLevel 消费），sb 保持
 * subflow 空间组默认展开；l 壳 full 档不入 rows（shortenList 剔壳）分支天然不涉。
 */
export function initialCollapsedRows(rows: Block[], level: ExpandLevel, base = 1, opts?: CollapsedRowsOpts): string[] {
    const tree = buildTreeIndex(rows);
    // "auto" 直通防御（正常经 settingShowLevelToExpand 已换算掉）：自适应=相对第 1 级起折叠
    const minHeading = level === "all" || level === "headings" ? 99 : level === "auto" ? 1 : parseInt(level, 10);
    const out: string[] = [];
    for (const r of rows) {
        if (r.type === "h" && r.subtype?.startsWith("h")) {
            // 相对层级=绝对 hN 平移 base-1（文档最小标题级归一化：H2 起步文档 base=2
            // 时章=h2 不再被默认 level=2 折掉——treemap 战役 □2 病灶③）
            const lv = parseInt(r.subtype.slice(1), 10) - base + 1;
            if (lv >= minHeading && (tree.childrenOf.get(r.id)?.length ?? 0) > 0) out.push(r.id);
        } else if (r.type === "i" || r.type === "l" || (r.type === "s" && !opts?.keepSuperExpanded)) {
            // 容器不在「展开层级」范围（不占标题层级）；无子树不折（空角标无意义同款）
            if (level !== "all" && (tree.childrenOf.get(r.id)?.length ?? 0) > 0) out.push(r.id);
        }
    }
    return out;
}

/**
 * 同文档刷新保留会话折叠态（graphbox-listfix，修「改原文结构→图塌回孤点找不着」）：
 * - prev ∩ curAlive：用户折叠的存活节点保持折叠
 * - defaults ∩ 新增节点（∉prevAlive）：本轮新出现的容器走默认推导（用户没见过=无用户态）
 * - prevAlive 有但 prev 没有的存活节点=用户展开态，保持展开（不被 defaults 打回）
 * - 已删除节点自然清除
 */
export function mergeCollapsedOnRefresh(
    prev: Iterable<string>,
    defaults: Iterable<string>,
    prevAlive: Set<string>,
    curAlive: Set<string>,
): Set<string> {
    const out = new Set<string>();
    for (const id of prev) if (curAlive.has(id)) out.add(id);
    for (const id of defaults) if (!prevAlive.has(id) && curAlive.has(id)) out.add(id);
    return out;
}

export interface VisibleInfo {
    /** 可见节点（折叠节点自身可见，其子树不可见） */
    visibleIds: Set<string>;
    /** 折叠节点 → 藏掉的节点数（角标 N；无子树的折叠项不产角标） */
    hiddenCount: Map<string, number>;
    /** 节点 → 子树节点数（含自身；>1 = 有可折叠内容，展开态显示 ⊖ 的依据） */
    subtreeSize: Map<string, number>;
}

/** 可见子图：折叠集沿树重算（可见 ⇔ 祖先链上无折叠节点） */
export function computeVisible(rows: Block[], collapsed: Iterable<string>): VisibleInfo {
    const tree = buildTreeIndex(rows);
    const collapsedSet = new Set(collapsed);
    const visibleIds = new Set<string>();
    const hiddenCount = new Map<string, number>();
    const subtreeSize = new Map<string, number>();

    // 后序 DFS：子树规模自底向上聚合；可见性沿父链判定（父折叠 ⇒ 整个子树不可见）
    const visit = (id: string, ancestorCollapsed: boolean): number => {
        const selfCollapsed = collapsedSet.has(id);
        if (!ancestorCollapsed) visibleIds.add(id);
        let size = 1;
        let hidden = 0;
        for (const cid of tree.childrenOf.get(id) ?? []) {
            const sub = visit(cid, ancestorCollapsed || selfCollapsed);
            size += sub;
            if (ancestorCollapsed || selfCollapsed) hidden += sub;
        }
        subtreeSize.set(id, size);
        if (selfCollapsed && !ancestorCollapsed && hidden > 0) hiddenCount.set(id, hidden);
        return size;
    };
    for (const r of tree.roots) visit(r, false);

    return { visibleIds, hiddenCount, subtreeSize };
}

export interface GraphEdgeSpec {
    id: string;
    source: string;
    target: string;
    label: string;
    /** 引用边（结构边 false）——重定向只发生在引用边上 */
    isRef: boolean;
}

export interface RenderEdge extends GraphEdgeSpec {
    /** 渲染端点（引用边端点不可见时重定向到最近可见祖先；结构边恒等原始端点） */
    rSource: string;
    rTarget: string;
}

/** 端点不可见时上爬最近可见祖先；爬穿根仍不可见 → null（丢边） */
function nearestVisibleAncestor(id: string, visibleIds: Set<string>, tree: TreeIndex): string | null {
    let cur = tree.parentOf.get(id);
    while (cur) {
        if (visibleIds.has(cur)) return cur;
        cur = tree.parentOf.get(cur);
    }
    return null;
}

/**
 * 边过滤+重定向：
 * - 结构边（isRef=false）：target 可见才渲染（树性质保证 source 随之可见）
 * - 引用边：端点不可见 → 重定向最近可见祖先；两端同落一个折叠节点 → 丢弃
 * - 原始 source/target 恒保留（ondelete 删边删真块引用，勿用渲染端点）
 */
export function filterEdges(edges: GraphEdgeSpec[], visibleIds: Set<string>, tree: TreeIndex): RenderEdge[] {
    const out: RenderEdge[] = [];
    for (const e of edges) {
        if (!e.isRef) {
            if (visibleIds.has(e.target)) out.push({ ...e, rSource: e.source, rTarget: e.target });
            continue;
        }
        let rSource = e.source, rTarget = e.target;
        if (!visibleIds.has(rSource)) {
            const anc = nearestVisibleAncestor(rSource, visibleIds, tree);
            if (!anc) continue;
            rSource = anc;
        }
        if (!visibleIds.has(rTarget)) {
            const anc = nearestVisibleAncestor(rTarget, visibleIds, tree);
            if (!anc) continue;
            rTarget = anc;
        }
        if (rSource === rTarget) continue;
        out.push({ ...e, rSource, rTarget });
    }
    return out;
}

/** 展开目标 id 的全部图内祖先（expandTo 底座）：祖先移出折叠集；目标自身折叠态不动（折叠节点可见） */
export function expandAncestors(tree: TreeIndex, collapsed: Set<string>, id: string): boolean {
    let changed = false;
    let cur = tree.parentOf.get(id);
    while (cur) {
        if (collapsed.delete(cur)) changed = true;
        cur = tree.parentOf.get(cur);
    }
    return changed;
}

/** 持久化序列化：按 id 排序（确定性，文档属性 diff 友好） */
export function serializeCollapsed(ids: Iterable<string>): string {
    return JSON.stringify([...ids].sort());
}

// —— graphmind □4：标题级数一键展开收缩（共识#5）——

/** 文档实际标题级范围（「显示到第几级」选择器的档位检测）：
 *  仅统计本档标题（root_id===docID——跨文档端点行混入不参与，review P2-5 同款防线），
 *  base=最小绝对级（H2 起步文档归一化锚：相对 1 级=章），max=最大绝对级；
 *  无标题（或 docID 空）→ null（调用方隐藏选择器/退 headings 档）。 */
export function headingRangeOf(rows: Block[], docID: string): { base: number; max: number } | null {
    if (!docID) return null;
    let base = 9, max = 0;
    for (const r of rows) {
        if (r.type === "h" && r.root_id === docID && r.subtype?.startsWith("h")) {
            const lv = parseInt(r.subtype.slice(1), 10) || 0;
            if (lv >= 1 && lv <= 6) {
                base = Math.min(base, lv);
                max = Math.max(max, lv);
            }
        }
    }
    return max === 0 || base === 9 ? null : { base, max };
}

/** 「显示到第 N 级」→ 折叠档换算（graphmind □4 P0 修正口径）：initialCollapsedRows
 *  语义=「层级 ≥L 且有子树者进折叠集」，而**折叠成员自身可见**（折叠卡形态）、子树全藏——
 *  故「显示到第 N 级」（h1..h(N-1) 展开+hN 折叠卡、h(N+1)+ 全藏）⇔ 折叠档=L=N 本身
 *  （首版误写 show+1：折叠 h(N+1) 只藏其子树，h(N+1) 折叠卡仍可见=第 N+1 级泄漏，
 *  UI 验收 P0「选 N 实显 N+1 级」实锤）。N ≥ 文档最深相对级（maxRel）→ headings 档
 *  语义（标题全不折、列表容器仍默认折叠——「显示到最深级」=回默认骨架）。 */
export function showLevelToExpandLevel(show: number, maxRel: number): ExpandLevel {
    if (show >= maxRel) return "headings";
    return String(Math.min(Math.max(show, 1), 6)) as ExpandLevel;
}

/** 设置值 → 折叠档（设置新口径=「显示到第 N 级标题」；headings/all 透传）：
 *  数字档按文档实际级范围换算；无标题文档退 headings（无标题可折，空推导同语义）。
 *  graphrelayout □7："auto"=自适应最高标题级——文档最高标题级（headingRangeOf 的 base，
 *  绝对级）经 base 归一化恒=相对第 1 级，故 auto ⇔ 显示到相对第 1 级 ⇔ 折叠档 1：
 *  有 h1 显示到 h1、只有 h2 显示到 h2（章=折叠卡）；无标题同数字档退 headings（标题层
 *  无物可显，杂项照常）；单级文档（maxRel=1 无更深可折）落 headings=标题全不折。
 *  旧口径（折叠起点，值 N 实显 N-1 级）存量值的读时迁移见 index.ts 装载段。 */
export function settingShowLevelToExpand(setting: ExpandLevel, range: { base: number; max: number } | null): ExpandLevel {
    if (setting === "headings" || setting === "all") return setting;
    if (!range) return "headings";
    if (setting === "auto") return showLevelToExpandLevel(1, range.max - range.base + 1);
    return showLevelToExpandLevel(parseInt(setting, 10), range.max - range.base + 1);
}

/** 当前显示到的最深标题相对级（选择器回显=按实际显示态推导，手动折叠后同步实况）：
 *  可见即计（computeVisible 折叠节点自身可见=该级折叠卡形态，就是「显示到第 N 级」的
 *  N 级本体——P0 修正口径；「未折叠」过滤是首版错口径配套，会把选 N（折叠 hN）误报 N-1）。
 *  无标题/无可见标题 → 0（调用方按需钳 1）。 */
export function visibleHeadingLevel(rows: Block[], collapsed: Iterable<string>, docID: string): number {
    const range = headingRangeOf(rows, docID);
    if (!range) return 0;
    const vis = computeVisible(rows, collapsed);
    let deepest = 0;
    for (const r of rows) {
        if (r.type !== "h" || r.root_id !== docID || !r.subtype?.startsWith("h")) continue;
        if (!vis.visibleIds.has(r.id)) continue;
        const lv = parseInt(r.subtype.slice(1), 10) || 0;
        if (lv >= 1 && lv <= 6) deepest = Math.max(deepest, lv - range.base + 1);
    }
    return deepest;
}

/** 反序列化：坏 JSON / 非字符串数组 → null（调用方按无持久化值重新推导初始折叠集） */
export function parseCollapsed(s: string | undefined): string[] | null {
    if (!s) return null;
    try {
        const v = JSON.parse(s);
        if (!Array.isArray(v) || !v.every(i => typeof i === "string")) return null;
        return v;
    } catch {
        return null;
    }
}
