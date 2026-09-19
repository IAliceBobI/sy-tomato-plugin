// src/libs/graphMarks.ts
// treemap 战役 □4（2026-09-17）：按文档拉「标记块集合」数据通道（块级图无行内粒度，
// 行内级标记目标挂所在块——设计共识）。只出数据不做 UI（□5 标记模式消费）。
//
// 识别口径（陆杰 20:14 拍板：行内划线 + 文字背景色 + 思源划线全收，含自定义颜色）：
// - SQL 宽锚 `background-color:` 任意值——色板 var(--b3-font-backgroundN) / card 系
//   var(--b3-card-*) / 自定义 #hex / rgb()，一网打尽（annoOverview 双锚只认色板变量，
//   自定义 hex 落无色分组的病灶本通道不犯）；裸 == mark 走第二锚。
// - 块级集合无法区分「字面 ==配对== 文本」与真 mark（markdown 列同形）——宽收是
//   设计选择：误收代价=标记模式面积多算一块，中文正文字面配对 == 罕见。
// - 形态证据：6810 标记验证D 落盘 + 主实例只读摸底（card/parent-style/嵌套），
//   fixture 见 tests/unit/graphMarks.test.ts 头部注释。
// 纯函数零 IO；fetchDocMarks 是唯一 IO 薄层（手工断言覆盖）。
// □5 起生产面已接线：GraphBox marks 档（ensureMarks SWR 旁路）+ 划线总览自定义色分组
// （normalizeBgVar 透传同口径——markVar 值域=色板键或 hex/rgb 字面值，消费过 markVarCss）。
import { siyuan } from "./siyuanApi";
import type { StructureInfo } from "./graphStructure";

/** 块级标记 IAL 键（graphmark 期2）：右键「标记此块」/⌘⌥⇧M toggle 写入（GraphBox.ts），
 *  正文左边条选择器（cssStyle.ts）与 SQL 第三宽锚共用本常量做单一事实源。
 *  值恒 "1"（v1 单块单色）；删除=写空串。随块生死零残留（IAL 数据跟着块走）。 */
export const BLOCK_MARK_ATTR = "custom-tomato-mark";

/** 裸/带样式 mark 家族：两 `==` 间至少一个非 = 非换行非空白字符——Lute mark 语法
 *  `==` 与文字间不容空格，字符类排除 \s 整类杀掉「a == b and c == d」双比较运算
 *  误报（review P2-4）且不伤 CJK/单字符真 mark（`==无样式默认==`/`==x==` 照命中） */
const BARE_MARK_RE = /==[^=\n\s]+==/;

/** background-color 值提取：值止于 `"` `;` `}` `'`（IAL 引号/HTML 分号/防御边界） */
const BG_COLOR_RE = /background-color:\s*([^;"'}]+)/g;

/** 行内标记宽锚（SQL 用）：background-color 任意值 + 裸 == 家族 + 块级标记 IAL（期2 第三锚） */
const MARKS_SQL_WHERE = `markdown like '%background-color:%' or markdown like '%==%' or ial like '%${BLOCK_MARK_ATTR}="%'`;

export function marksSql(docIDs: string[]): string {
    const inList = docIDs.filter(Boolean).map(id => `'${id}'`).join(",");
    // 空域守卫：1=0 恒空（in () 空集形态送内核行为未定义，勿赌）
    if (!inList) return "select id, root_id as r, markdown as md, ial from blocks where 1=0 limit 0";
    return `select id, root_id as r, markdown as md, ial from blocks
        where root_id in (${inList}) and type != 'c' and (${MARKS_SQL_WHERE}) limit 50000`;
}

/** 是否含 mark 划线（裸或有样式 IAL 同形，块级不可分） */
export function hasBareMark(md: string): boolean {
    return BARE_MARK_RE.test(md);
}

/** 提取块内全部 background-color 值（保序去重）。供 □5 反哺划线总览自定义色分组
 *  （parseMarkColors 产物即分组键候选，色板 var 与自定义 hex 同通道） */
export function parseMarkColors(md: string): string[] {
    const out: string[] = [];
    for (const m of md.matchAll(BG_COLOR_RE)) {
        const v = m[1].trim();
        if (v && !out.includes(v)) out.push(v);
    }
    return out;
}

/** 块级标记判定：背景色宽锚或 mark 家族 */
export function isMarkBlock(md: string): boolean {
    return md.includes("background-color:") || hasBareMark(md);
}

export interface MarkInfo {
    /** 块内 background-color 值（保序去重） */
    colors: string[];
    /** 含 == mark 划线（vs 纯 span 背景色） */
    bare: boolean;
    /** 块级标记（期2 custom-tomato-mark IAL）：行内+块标同块=算一处（单条目双信号）；
     *  图上不区分来源，块级固定主题色（colors 空走 markCssOf 兜底） */
    blockMark: boolean;
}

export type DocMarks = Map<string, MarkInfo>;

/** 块级标记 IAL 命中：`custom-tomato-mark="` 带引号前缀锚——近名属性
 *  （custom-tomato-marker 等）不误收（引号后紧跟值才匹配） */
export function hasBlockMarkAttr(ial?: string): boolean {
    return !!ial?.includes(`${BLOCK_MARK_ATTR}="`);
}

/** SQL 行集合 → 块集（防御：无 id / 无标记行滤除——SQL 已过滤，双保险） */
export function collectMarkRows(rows: Array<{ id?: string; md?: string; ial?: string }>): DocMarks {
    const m: DocMarks = new Map();
    for (const r of rows) {
        if (!r?.id) continue;
        const colors = parseMarkColors(r.md ?? "");
        const bare = hasBareMark(r.md ?? "");
        const blockMark = hasBlockMarkAttr(r.ial);
        if (!colors.length && !bare && !blockMark) continue;
        m.set(r.id, { colors, bare, blockMark });
    }
    return m;
}

/** 按文档拉标记块集合（IO 薄层）：treemap 标记模式 / 划线总览反哺共用。
 *  期2 起含块级标记源（ial 第三锚）。setBlockAttrs 广播 updateAttrs op（跨窗 DOM 同刷
 *  =左边条即时生效的机制本尊）但不碰 updated、且 op.id=块 id 无 parentID——图的 ws
 *  刷新域判定（id/parentID===docID）不命中，marks 数据靠 SWR 重进档感知；期3 标记
 *  感知展开可改听 updateAttrs op 做实时失效 */
export async function fetchDocMarks(docID: string): Promise<DocMarks> {
    if (!docID) return new Map();
    const rows = (await siyuan.sql(marksSql([docID]))) ?? [];
    return collectMarkRows(rows as Array<{ id?: string; md?: string; ial?: string }>);
}

/** 标记色 CSS 值：块内首个 background-color（色板 var() 随主题自适应/自定义 hex 直用）；
 *  bare 无色 mark 与防御缺值退主题主色。treemap marks 档与 structure 标记叶共用
 *  （原 GraphTreemap 内联实现上提单一事实源） */
export function markCssOf(mk?: { colors: string[] }): string {
    return mk?.colors?.[0] || "var(--b3-theme-primary)";
}

/** 展示层剥裸 mark 语法（luji0918 □2）：blocks.content 对裸 == 划线保留 `==文字==`
 *  形态（content 列=kramdown 行内语法保留），标记叶卡片直显会带 == 噪音——消费侧已
 *  知该块是标记块（marks.has 前置），成对剥离。字面 ==（比较运算文本）在标记块内
 *  会被误剥——展示层折衷，数据层不动（isMarkBlock 判定仍走窄锚） */
export function stripMarkSyntax(text: string): string {
    return text.replace(/==([^=\n]+)==/g, "$1");
}

// ── graphmark 期3（2026-09-19）：标记感知展开+只看标记档（纯函数） ──────────
// 心智模型（设计共识）：三个视图=同一棵结构树的三种过滤/折叠态——structure 档默认
// 折叠叠加「标记路径强制展开」（预算制）；marks 档=渲染层过滤只留标记路径。本组
// 函数只做推导零 IO；渲染/持久化在 GraphBox.svelte。markedLeavesOf（luji0918 □2
// 直挂口径）随 A 空壳态退役删除——i 行命中改走树节点自身 dot，git 21f6af5e 可考古。

import { buildTreeIndex, type TreeIndex } from "./graphCollapse";

/** 标记叶摊开阈值：≤ 此值直接摊开标记叶卡（bear 拍板「标记多就少显示，让用户自己点」）；
 *  超出=种子容器收拢显 ●N，点击展开该容器标记叶 */
export const MARK_LEAF_FLAT_LIMIT = 30;

/** 标记感知展开的展开容器总数封顶（共识 50~80 取上限）：标记路径按文档序优先占预算
 *  （共享祖先只计一次增量），无标记分支被挤收=已拍板可接受 */
export const MARK_CONTAINER_BUDGET = 80;

/** 标记树推导产物：结构树 × 标记集合 的挂载/计数/种子 */
export interface MarkTreeInfo {
    /** 树节点 id → 自身挂载标记数（叶标记按 directLeaves 归挂 + 标题/i 行自身命中） */
    selfCount: Map<string, number>;
    /** 树节点 id → 子树标记总数（含自身；●N 角标数据，折叠祖先也可见量） */
    subtreeCount: Map<string, number>;
    /** 树节点 id → 子树首标记色（DFS 文档序首个；块标退主题色） */
    subtreeColor: Map<string, string>;
    /** 容器 id → 标记叶卡列表（非树节点命中的挂载，directLeaves 序） */
    cards: Map<string, Block[]>;
    /** 标记叶卡总量（≤MARK_LEAF_FLAT_LIMIT 判据） */
    cardTotal: number;
    /** 有标记挂载的树节点（含自身命中行），rows 文档序——展开/过滤种子 */
    seeds: string[];
}

/** 标记集合 → 结构树挂载/计数/种子。无标记返回 null（调用方走无标记分支：structure
 *  纯默认折叠 / marks 档空态卡）。树外无归属命中（脏数据）静默跳过不炸 */
export function markTreeInfo(rows: Block[], info: StructureInfo, marks: DocMarks | undefined | null): MarkTreeInfo | null {
    if (!marks || !marks.size) return null;
    const tree = buildTreeIndex(rows);
    const selfCount = new Map<string, number>();
    const firstColor = new Map<string, string>();
    const cards = new Map<string, Block[]>();
    let cardTotal = 0;
    // 叶标记：directLeaves 命中归挂容器（文档序稳定——色取首个）
    for (const [cid, leaves] of info.directLeaves) {
        for (const lf of leaves) {
            const mk = marks.get(lf.id);
            if (!mk || tree.byId.has(lf.id)) continue; // 树内行防双计（脏数据防御）
            selfCount.set(cid, (selfCount.get(cid) ?? 0) + 1);
            if (!firstColor.has(cid)) firstColor.set(cid, markCssOf(mk));
            (cards.get(cid) ?? cards.set(cid, []).get(cid)!).push(lf);
            cardTotal++;
        }
    }
    // 树节点自身命中（标题/i 行的行内或块级标记）：节点本体承载（●N dot），不产卡
    for (const r of rows) {
        const mk = marks.get(r.id);
        if (!mk) continue;
        selfCount.set(r.id, (selfCount.get(r.id) ?? 0) + 1);
        if (!firstColor.has(r.id)) firstColor.set(r.id, markCssOf(mk));
    }
    // 子树聚合（后序 DFS：计数求和、色=自身首色 ?? 子女首个带色）
    const subtreeCount = new Map<string, number>();
    const subtreeColor = new Map<string, string>();
    const visit = (id: string): void => {
        let c = selfCount.get(id) ?? 0;
        let color = firstColor.get(id);
        for (const cid of tree.childrenOf.get(id) ?? []) {
            visit(cid);
            c += subtreeCount.get(cid) ?? 0;
            color ??= subtreeColor.get(cid);
        }
        if (c > 0) {
            subtreeCount.set(id, c);
            subtreeColor.set(id, color!);
        }
    };
    for (const r of tree.roots) visit(r);
    const seeds = rows.filter(r => selfCount.has(r.id)).map(r => r.id);
    return { selfCount, subtreeCount, subtreeColor, cards, cardTotal, seeds };
}

/** 标记感知默认折叠：defaults（initialCollapsedRows 产物）叠加标记路径强制展开——
 *  种子按文档序贪心移除祖先出折叠集（种子自身=「最小含标记容器」保持默认态）；
 *  展开容器总数（有子节点且不在折叠集）超预算即跳过该种子（其标记留在折叠祖先的
 *  ●N 里，点击展开仍可达）。返回新折叠集 */
export function markAwareCollapsed(rows: Block[], defaults: Iterable<string>, mti: MarkTreeInfo, budget = MARK_CONTAINER_BUDGET): Set<string> {
    const out = new Set(defaults);
    const tree = buildTreeIndex(rows);
    const hasKids = (id: string) => (tree.childrenOf.get(id)?.length ?? 0) > 0;
    let expanded = 0;
    for (const id of tree.childrenOf.keys()) {
        if (hasKids(id) && !out.has(id)) expanded++;
    }
    for (const seed of mti.seeds) {
        if (!tree.byId.has(seed)) continue; // 脏数据防御
        const chain: string[] = [];
        let cur = tree.parentOf.get(seed);
        while (cur) { chain.push(cur); cur = tree.parentOf.get(cur); }
        const cost = chain.filter(id => out.has(id) && hasKids(id)).length;
        if (expanded + cost > budget) continue;
        for (const id of chain) {
            if (out.delete(id) && hasKids(id)) expanded++;
        }
    }
    return out;
}

/** marks 档渲染过滤集：标记叶祖先链 ∪ 种子 ∪ doc 根——其余节点/边不渲染（渲染层
 *  过滤，数据仍 structureRowsFromOutline 同源）。无标记=空集（调用方走空态卡） */
export function marksKeepSet(rows: Block[], mti: MarkTreeInfo | null): Set<string> {
    const keep = new Set<string>();
    if (!mti) return keep;
    const tree: TreeIndex = buildTreeIndex(rows);
    for (const seed of mti.seeds) {
        if (!tree.byId.has(seed)) continue;
        keep.add(seed);
        let cur = tree.parentOf.get(seed);
        while (cur) { keep.add(cur); cur = tree.parentOf.get(cur); }
    }
    return keep;
}
