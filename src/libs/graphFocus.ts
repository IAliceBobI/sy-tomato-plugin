// src/libs/graphFocus.ts
// graphmark 期4：聚焦模式邻域纯函数 + 无结构文档判定（structure 档空态卡判据）。
// 纯同步零 IO；DOM 类切换/交互接线在 GraphBox.svelte，不进本文件。
//
// 邻域心智模型（设计共识）：以目标块为中心**高亮一跳邻域**——父链全链（路径上下文
// 可见）+ 兄弟 + 直接子块 + 引用进出边对端；其余节点/边淡化半透明，不重布局不挪图。
// 输入是**渲染层**形态（$nodes/$edges 产物）而非 allRows：结构态叶子/标记叶卡不在
// allRows（归属在 structInfo），渲染层才是邻域的完整真值。
//
// 树关系双通道（与 applyCollapsedView 渲染形态对齐）：
// - 结构边（isRef=false）：source=parent → target=child；
// - subflow 容器（sb/bq）与直接子的结构边被跳过（空间包含已表达），关系走节点的
//   parentId。引用边不承载树关系（只算对端）。

import { isStructureContainer } from "./graphStructure";

export interface FocusNodeSpec {
    id: string;
    /** subflow 容器 id（xyflow parentId 相对坐标系） */
    parentId?: string;
}

export interface FocusEdgeSpec {
    source: string;
    target: string;
    isRef: boolean;
}

/**
 * 目标块的一跳邻域：{目标} ∪ 父链全链 ∪ 兄弟 ∪ 直接子 ∪ 引用边对端。
 * 目标不在节点集=返回仅含目标的集（调用方据此清聚焦，勿静默换中心）。
 */
export function focusNeighborhood(
    target: string,
    nodes: FocusNodeSpec[],
    edges: FocusEdgeSpec[],
): Set<string> {
    const out = new Set<string>([target]);
    const idSet = new Set(nodes.map(n => n.id));
    if (!idSet.has(target)) return out;
    // 树关系：结构边优先，parentId 补 subflow 缺边（双边并存幂等）
    const parentOf = new Map<string, string>();
    const childrenOf = new Map<string, string[]>();
    const link = (parent: string, child: string) => {
        if (parentOf.has(child)) return; // 幂等；罕见冲突保首（结构边优先于 parentId）
        parentOf.set(child, parent);
        (childrenOf.get(parent) ?? childrenOf.set(parent, []).get(parent)!).push(child);
    };
    for (const e of edges) {
        if (!e.isRef) link(e.source, e.target);
    }
    for (const n of nodes) {
        if (n.parentId) link(n.parentId, n.id);
    }
    // 父链全链（环防御）
    let cur = parentOf.get(target);
    const seen = new Set<string>([target]);
    while (cur && !seen.has(cur)) {
        seen.add(cur);
        out.add(cur);
        cur = parentOf.get(cur);
    }
    const parent = parentOf.get(target);
    if (parent) {
        for (const sib of childrenOf.get(parent) ?? []) out.add(sib); // 兄弟（含自身幂等）
    }
    for (const c of childrenOf.get(target) ?? []) out.add(c); // 直接子（一跳封顶）
    for (const e of edges) {
        if (!e.isRef) continue;
        if (e.source === target) out.add(e.target);
        if (e.target === target) out.add(e.source);
    }
    return out;
}

/**
 * 无结构文档判定（structure 档空态卡）：本档除 doc 根外无任何容器行（h/i/s/b——
 * listfix 起列表项 i 已节点化=有大列表不算无结构）。跨文档端点行（root_id≠本档）
 * 与叶子行不算结构（allRows 防御性混入不误判）。rows=结构态 allRows（容器+端点）。
 */
export function noStructureRows(rows: Block[], docID: string): boolean {
    if (!rows.length) return true;
    for (const r of rows) {
        if (r.id === docID || r.root_id !== docID) continue;
        if (isStructureContainer(r.type)) return false;
    }
    return true;
}
