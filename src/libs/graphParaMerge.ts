// src/libs/graphParaMerge.ts
// GraphBox ¶×N 段落链重设计纯函数（graphbox 期7，2026-09-04）：
// 段落链**永不多节点化、无展开概念**（□4 处理中用户拍板）——链头子树在数据预处理层
// 整链合并为 ¶ 大节点（链内全文合并+首尾截断），链成员从 rows 剔除、引用边端点重定向
// 到链头、链内结构边（重定向后自环）丢弃。折叠集/可见子图机制不再感知段落链。
// 纯同步零 IO——持久化与渲染在 GraphBox.svelte，不进本文件。
import { buildTreeIndex, type GraphEdgeSpec, type TreeIndex } from "./graphCollapse";

/** 段落链头：type='p' 且父不是 p（链成员排除）且图内子节点中存在 type='p'
 *  （seriesAllNodes 把连续段落串成 p→p 竖链：链头=链上第一个 p）。
 *  □9：媒体段落（仅含图片，media 在场）不当链头——媒体胶囊独立呈现不被 ¶×N 吞并。
 *  期7 从 graphCollapse.ts 迁入（initialCollapsedRows 不再消费它，合并检测在此消费） */
export function isParagraphChainHead(row: Block, tree: TreeIndex): boolean {
    if (row.type !== "p" || row.media) return false;
    const pid = tree.parentOf.get(row.id);
    if (pid && tree.byId.get(pid)?.type === "p") return false;
    return (tree.childrenOf.get(row.id) ?? []).some(cid => tree.byId.get(cid)?.type === "p");
}

/** 全文截断：≤1800 字原样；超限=首 head + 「……（省略 N 字）」+ 尾 tail
 *  （□4 拍板：2000 字上限=1200+600，省略标记按实际省略字数动态） */
export function clipParaText(text: string, head = 1200, tail = 600): string {
    if (text.length <= head + tail) return text;
    const omitted = text.length - head - tail;
    return text.slice(0, head) + `……（省略 ${omitted} 字）` + text.slice(-tail);
}

export interface ParaMergeResult {
    /** 链成员剔除后的 rows（链头保留；无链=原数组引用） */
    rows: Block[];
    /** 端点重定向后的 links（链内自环结构边丢弃；无链=原数组引用） */
    links: GraphEdgeSpec[];
    /** 链头 id → 链内全文合并文本（DFS 序 \n 分隔，已截断） */
    paraByText: Map<string, string>;
    /** 链头 id → 链内合并块数（¶×N badge；链头自身不计） */
    paraCount: Map<string, number>;
    /** 链成员 id → 链头 id（locateID 定位链中段的重定向通道） */
    linkRedirect: Map<string, string>;
}

/**
 * 段落链合并（applyRowsAndLinks 之后、buildTreeIndex/computeVisible 之前调用一次）：
 * - 链子树中的 **p 子孙**按 DFS 序合并进链头 ¶ 节点（二期 □1 收窄：非 p 子孙
 *   保留为链头的正常子节点——串链白名单=仅连续 p 后链头子树实际纯 p，此处防御性收窄）
 * - 链成员从 rows 剔除；结构边 source/target 落链内 → 重定向后自环丢弃；
 *   引用边端点落链内 → 重定向到链头（多条重定向撞端点对时保留多条，id 加序号保唯一）
 */
export function mergeParagraphChains(rows: Block[], links: GraphEdgeSpec[]): ParaMergeResult {
    const tree = buildTreeIndex(rows);
    const heads = new Set<string>();
    for (const r of rows) {
        if (isParagraphChainHead(r, tree)) heads.add(r.id);
    }
    const empty = new Map<string, string>();
    if (heads.size === 0) {
        return { rows, links, paraByText: empty, paraCount: new Map<string, number>(), linkRedirect: new Map<string, string>() };
    }

    // 链成员=各链头子树中的 p 子孙（DFS 前序）。二期 □1 合并白名单=仅 p：
    // 非 p 子孙（列表/引述等结构承载者）保留为链头的正常子节点，不剔不重定向不进文本
    const linkRedirect = new Map<string, string>();
    const paraByText = new Map<string, string>();
    const paraCount = new Map<string, number>();
    for (const h of heads) {
        const frags: string[] = [];
        let count = 0;
        if (tree.byId.get(h)?.content) frags.push(tree.byId.get(h)!.content); // 链头自身正文（链上第一段）
        const stack = [...(tree.childrenOf.get(h) ?? [])];
        while (stack.length) {
            const cur = stack.shift()!;
            const curRow = tree.byId.get(cur);
            // 非 p 子孙=链头的正常子节点（子树整体保留）；□9 媒体段落同不入链（保留独立节点）
            if (curRow?.type !== "p" || curRow.media) continue;
            linkRedirect.set(cur, h);
            count++;
            if (tree.byId.get(cur)?.content) frags.push(tree.byId.get(cur)!.content);
            stack.unshift(...(tree.childrenOf.get(cur) ?? []));
        }
        paraCount.set(h, count);
        paraByText.set(h, clipParaText(frags.join("\n")));
    }

    const outRows = rows.filter(r => !linkRedirect.has(r.id));
    const seen = new Set<string>();
    const outLinks: GraphEdgeSpec[] = [];
    for (const e of links) {
        const s = linkRedirect.get(e.source) ?? e.source;
        const t = linkRedirect.get(e.target) ?? e.target;
        if (s === t) continue; // 链内结构边（父子都在链内）
        let id = s + "-" + t;
        if (seen.has(id)) {
            let n = 2;
            while (seen.has(`${id}#${n}`)) n++;
            id = `${id}#${n}`;
        }
        seen.add(id);
        outLinks.push({ ...e, id, source: s, target: t });
    }
    return { rows: outRows, links: outLinks, paraByText, paraCount, linkRedirect };
}

/**
 * structure 档直属叶子序列的连续段落链分组（graphrelayout □3，2026-09-20）。
 * structure 档 rows=容器树（叶子不进 allRows，归属在 StructureInfo.directLeaves），
 * full 档的树 DFS 合并不适用——此处对**各容器直属叶子保序序列**线性扫描分组，
 * 产物口径与 mergeParagraphChains 对齐（paraByText 全文截断 / paraCount 链内块数
 * 链头自身不计 / paraRedirect 链成员→链头），渲染层（GraphBox 徽标展开叶子循环）
 * 按同款 ¶×N 双态卡消费。分组与树 DFS 形态不同无法共用核心，共用面=clipParaText
 * 与产物口径——两通道各自全量替换宿主全局态，切档自然清退。
 * - 成链条件：同容器叶子序列中**相邻连续 ≥2 个 type='p'** 且都不在 excluded
 *   （单 p 不成链照常独立卡；非 p 叶子隔断处链断开）
 * - excluded=标记叶 id 集（□4「标记的都得展开」标记卡通道独占呈现）——链在标记段
 *   处断开，标记段两侧各自重新成链，标记段自身不进任何产物
 * - paraByText 文本：content 在场的段按序 join("\n") 后 clipParaText；content 缺失段
 *   跳过（mergeParagraphChains 同款 `if content` 口径）——SQL 轻通道叶子为无 content
 *   桩，值可能为空串，渲染层在 leafContent 补齐后兜底重拼（runMembers 提供链成员序）
 * 纯同步零 IO。
 */
export interface LeafRunMerge {
    /** 链头 id → 合并文本（按叶子序 \n join，已截断；SQL 桩通道可能为空串） */
    paraByText: Map<string, string>;
    /** 链头 id → 链内块数（成员数，链头自身不计——与 mergeParagraphChains.paraCount 同口径） */
    paraCount: Map<string, number>;
    /** 链成员 id → 链头 id（locateID 定位链中段重定向通道，同 linkRedirect） */
    paraRedirect: Map<string, string>;
    /** 链头 id → 链成员 id 序（渲染层 SQL 通道 content 补齐后的兜底重拼通道） */
    runMembers: Map<string, string[]>;
}

/**
 * 合并全文拼装（□3 评审 P2①共用面）：[链头, ...成员] 逐块经 contentOf 取文、
 * 跳过空段、\n join 后 clipParaText 截断。双端消费：
 * - mergeStructureLeafRuns（组装期，contentOf=b.content——DOM 通道完整/SQL 桩为空）
 * - GraphBox 徽标展开渲染（contentOf=leafContent 补拉覆盖‖b.content——SQL 通道
 *   toggleBadge getRows 后即为真，恒以此为准）
 * 抽函数保证两端拼装逻辑代码级同源，杜绝注释对齐漂移。
 */
export function joinParaText(blocks: Block[], contentOf: (b: Block) => string): string {
    return clipParaText(blocks.map(b => contentOf(b)).filter(s => s.length > 0).join("\n"));
}

export function mergeStructureLeafRuns(directLeaves: Iterable<Block[]>, excluded: Set<string>): LeafRunMerge {
    const paraByText = new Map<string, string>();
    const paraCount = new Map<string, number>();
    const paraRedirect = new Map<string, string>();
    const runMembers = new Map<string, string[]>();
    for (const leaves of directLeaves) {
        let i = 0;
        while (i < leaves.length) {
            // 链头候选：p 且不在 excluded，且后继紧邻仍是一段可入链的 p（≥2 才成链）
            const head = leaves[i];
            if (head?.type !== "p" || excluded.has(head.id) || !isRunnableLeaf(leaves[i + 1], excluded)) {
                i++;
                continue;
            }
            const memberRows: Block[] = [];
            let j = i + 1;
            while (isRunnableLeaf(leaves[j], excluded)) {
                memberRows.push(leaves[j]!);
                paraRedirect.set(leaves[j]!.id, head.id);
                j++;
            }
            paraByText.set(head.id, joinParaText([head, ...memberRows], b => b.content ?? ""));
            paraCount.set(head.id, memberRows.length);
            runMembers.set(head.id, memberRows.map(b => b.id));
            i = j;
        }
    }
    return { paraByText, paraCount, paraRedirect, runMembers };
}

/** 可入链叶子：type='p' 且不在 excluded（undefined/标记段/非 p 都断链） */
function isRunnableLeaf(row: Block | undefined, excluded: Set<string>): boolean {
    return !!row && row.type === "p" && !excluded.has(row.id);
}
