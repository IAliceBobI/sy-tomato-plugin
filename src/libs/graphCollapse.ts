// src/libs/graphCollapse.ts
// GraphBox 折叠机制纯函数（graphbox 翻新期 2，2026-09-04）：
// 折叠集（Set<nodeID>）驱动可见子图——折叠节点自身可见、子树全藏、角标 N 计数；
// 引用边端点落入折叠子树时重定向到最近可见祖先（原始端点保留，删边仍删真块引用）。
// 纯同步零 IO——持久化（custom-graph-collapsed）与渲染在 GraphBox.svelte，不进本文件。
//
// 期7（2026-09-04）变化：段落链不再走折叠机制——mergeParagraphChains（graphParaMerge.ts）
// 在数据预处理层把链子树整链合并为 ¶ 大节点（永不多节点化），本文件只管标题/子树折叠；
// expandSubtree（「展开全部段落」菜单的底座）随 ¶ 展开族退役一并删除。

export type ExpandLevel = "1" | "2" | "3" | "all";

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

/**
 * 初始折叠集（按 rows 出现序，确定性；期7 起只按标题层级，段落链已改走 ¶ 合并通道）：
 * level="N"：标题层级 ≥N 且有图内子节点的标题；level="all"：空集。
 * 叶子标题（无子树）不进集——空角标点击无反应（e2e 实锤）；文档根不折叠。
 */
export function initialCollapsedRows(rows: Block[], level: ExpandLevel): string[] {
    const tree = buildTreeIndex(rows);
    const minHeading = level === "all" ? 99 : parseInt(level, 10);
    const out: string[] = [];
    for (const r of rows) {
        if (r.type === "h" && r.subtype?.startsWith("h")) {
            const lv = parseInt(r.subtype.slice(1), 10);
            if (lv >= minHeading && (tree.childrenOf.get(r.id)?.length ?? 0) > 0) out.push(r.id);
        }
    }
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
