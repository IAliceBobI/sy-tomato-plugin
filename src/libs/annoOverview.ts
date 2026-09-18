// 划线总览（anno-round2 □3，B 案）：全书划线+批注总览的数据层。
// 上半=纯函数（彩字区间解析 / 片归属 / 条目合并 / 分组与色筛选），零 siyuan 依赖，
// tests/unit/annoOverview.test.ts 锁定契约；下半=取数编排（resolveOverviewScope）。
// 数据源双份：带底色彩字（annocolor □1 扩源——A 面板一步上色 span/语义样式/mark 叠样式
// 三通道全认，形态清单+真实样本=tests/unit/annoColorFixtures.ts；默认色 mark 无 style IAL
// 不可靠命中、纯字体色/自定义 hex/自定义样式 v1 不认〔边界〕）
// + 批注属性（custom-tomato-annotations，annoPanelFromRows 同源）。
// 颜色通道唯一=彩字区间反查（收集链 markVarOfAnchor 同族，归一函数共用），
// entry.color 建链未写恒缺省不作依据。
import { parseAnnotations, ANNO_HREF_PREFIX, type TomatoAnnotation } from "./annotationsAttr";
import { hostQuoteText } from "./annoCollect";
import { MarkKey, PDIGEST_CTIME, TEMP_CONTENT } from "./gconst";
// 彩字色源机器下沉 annoColorVar（annocolor □3：收集链同源消费防循环）；此处 re-export
// 维持历史 import 路径（libs 桶惯例）
export {
    bgVarOfStyle,
    markVarCss,
    markVarOfAnchor,
    normalizeBgVar,
    parseColorIntervals,
    type MarkInterval,
} from "./annoColorVar";
import { parseColorIntervals } from "./annoColorVar";

// ---------------- 纯函数区 ----------------

export interface PieceMarkInfo {
    bookID: string;
    point: number;
}

/** 文档 ial 列 → 片归属：custom-progmark 值形如 `TEMP#书ID,片序号`。
 *  digest 摘抄文档同前缀（`TEMP#书ID,时间戳`）语义不同——伴生属性第二刀：
 *  ial 含 custom-pdigest-ctime 一律 null（originTrace.pieceFilterSQL 同款）。 */
export function parsePieceIal(ial: string | null | undefined): PieceMarkInfo | null {
    if (!ial || ial.includes(`${PDIGEST_CTIME}="`)) return null;
    const m = ial.match(new RegExp(`${MarkKey}="([^"]+)"`));
    if (!m) return null;
    const v = m[1];
    if (!v.startsWith(`${TEMP_CONTENT}#`)) return null;
    const rest = v.slice(TEMP_CONTENT.length + 1);
    const i = rest.lastIndexOf(",");
    if (i <= 0) return null;
    const bookID = rest.slice(0, i);
    const point = Number(rest.slice(i + 1));
    if (!bookID || !Number.isInteger(point) || point < 0) return null;
    return { bookID, point };
}

/** 思源文档 id 形态白名单（14 位时间戳-6 位小写串）：IAL 派生值入 SQL 前的防线
 *  （引号=语法错被吞成假空态、%_=LIKE 通配跨书泄漏；种子侧 bookID/docID 同过一道） */
const SIYUAN_ID_RE = /^\d{14}-[a-z0-9]+$/;

/** 分片片名展示形：剥 `[NNNNN]` 序号前缀（progData.pieceDocName 产物；无前缀原样） */
export function pieceDisplayName(name: string): string {
    return name.replace(/^\[\d+\]/, "");
}

/** 总览条目：anno=想法卡（批注条目在场），mark=纯划线卡（无批注的官方划线） */
export interface OverviewItem {
    key: string;
    kind: "anno" | "mark";
    /** 宿主块（跳转定位用） */
    hostID: string;
    /** 跨块批注全部宿主（首宿主=hostID；annofix-0918 □2 收集保真——选择集链按宿主序列
     *  拉结构化引文）；单块条目缺省（hostID 即全部） */
    hostIDs?: string[];
    /** 所在文档（root，分组键） */
    docID: string;
    /** 划线色变量；缺=无色（未划线的批注） */
    markVar?: string;
    /** 所属二级标题（最近上级 h2 文本；缺=无 h2 不分节）——anno-fix □4 */
    section?: string;
    /** 所属 h2 块 id（节身份判据：书内同名 h2 文本判据会误并，reasoning review P2-1） */
    sectionID?: string;
    /** 卡面引文：sel.txt 快照 > mark 区间文本 > 宿主净化 */
    quote: string;
    entry?: TomatoAnnotation;
    /** 组内阅读序（assignOverviewOrder 填；缺省 0） */
    order: number;
}

/** 批注行（attributes 联查：id=宿主块 / v=属性串 / r=root / md=宿主 kramdown 供色与引文反查 /
 *  p=parent_id（祖先链归并判据，anno-fix-0917 □2） */
export interface OverviewAnnoRow {
    id: string;
    v: string | null;
    r: string;
    md?: string | null;
    p?: string | null;
}

/** mark 行（LIKE 命中块：r=root / md=宿主 kramdown / p=parent_id） */
export interface OverviewMarkRow {
    id: string;
    r: string;
    md: string | null;
    p?: string | null;
}

/**
 * 双源行 → 总览条目：批注属性逐块展开、跨块同 id 去重保首宿主（annoPanelFromRows /
 * collectGroups 同语义——跨块批注只出一条卡）；锚落在 mark 区间的条目染区间色、
 * 引文退 mark 区间文本；无锚区间（纯划线）独立成划线卡。批注块与 mark 块的并集都过
 * 纯 mark 提取（同块可「批注 + 另一段纯划线」共存），docID 直取行内 r。
 */
export function overviewItemsFromRows(annoRows: OverviewAnnoRow[], markRows: OverviewMarkRow[]): OverviewItem[] {
    const items: OverviewItem[] = [];
    const seen = new Set<string>();
    const byBlock = new Map<string, { docID: string; kd: string }>();
    // 宿主序列先全量收集再产出（collectGroups 双遍同款——首见即产出会把后续宿主漏出
    // hostIDs；到达序，收集链 annotateHostInfo 内部按文档序重排）
    const hostsOfAnno = new Map<string, string[]>();
    const parsedAnnos: { r: OverviewAnnoRow; intervals: ReturnType<typeof parseColorIntervals>; entries: TomatoAnnotation[] }[] = [];
    for (const r of annoRows ?? []) {
        if (r?.id == null || r.id === "") continue;
        byBlock.set(r.id, { docID: typeof r.r === "string" ? r.r : "", kd: typeof r.md === "string" ? r.md : "" });
        const intervals = parseColorIntervals(r.md);
        const entries = parseAnnotations(r.v);
        for (const entry of entries) {
            const hs = hostsOfAnno.get(entry.id) ?? [];
            hs.push(r.id);
            hostsOfAnno.set(entry.id, hs);
        }
        parsedAnnos.push({ r, intervals, entries });
    }
    for (const { r, intervals, entries } of parsedAnnos) {
        for (const entry of entries) {
            if (seen.has(entry.id)) continue;
            seen.add(entry.id);
            const hit = intervals.find((iv) => iv.annoIDs.includes(entry.id));
            const quote = entry.sel?.txt || hit?.text || (r.md ? hostQuoteText(r.md) : "");
            const hosts = hostsOfAnno.get(entry.id) ?? [r.id];
            const it: OverviewItem = {
                key: `anno:${entry.id}`,
                kind: "anno",
                hostID: hosts[0],
                docID: byBlock.get(r.id)!.docID,
                quote,
                order: 0,
                entry,
            };
            if (hosts.length > 1) it.hostIDs = hosts;
            if (hit) it.markVar = hit.markVar;
            items.push(it);
        }
    }
    for (const r of markRows ?? []) {
        if (r?.id == null || r.id === "" || byBlock.has(r.id)) continue;
        byBlock.set(r.id, { docID: typeof r.r === "string" ? r.r : "", kd: r.md ?? "" });
    }
    // 祖先链归并（anno-fix-0917 □2）：划线真宿主=最深层块；li/列表容器/sb 等祖先块的
    // markdown 字面含子树划线副本（LIKE 同步命中）——命中行集内，祖先是任一行 parent 链
    // 上可达者的块不参与纯划线提取（保最深）。判据=parent 链非「文本+色指纹」，不误杀
    // 用户真在两处划同文本的合法重复；anno 卡走属性通道不受影响。p 缺席（列缺席/旧形态）
    // =零归并。hops 上限防脏环（buildHostRanks 同款先例）。
    const parentOf = new Map<string, string>();
    for (const r of annoRows ?? []) if (r?.id && r.p) parentOf.set(r.id, r.p);
    for (const r of markRows ?? []) if (r?.id && r.p) parentOf.set(r.id, r.p);
    const redundant = new Set<string>();
    for (const [bid] of byBlock) {
        let cur = parentOf.get(bid) ?? "";
        for (let hops = 0; cur && hops < 64; hops++) {
            if (byBlock.has(cur)) redundant.add(cur);
            cur = parentOf.get(cur) ?? "";
        }
    }
    for (const [blockID, info] of byBlock) {
        if (redundant.has(blockID)) continue;
        let idx = 0;
        for (const iv of parseColorIntervals(info.kd)) {
            if (iv.annoIDs.length > 0) continue;
            // 残渣防线：区间文本含锚 href 子串=疑似未识别锚（未来 kramdown 形态变体），
            // 宁缺勿脏——出卡会把锚语法裸露进卡面/收集产物（reasoning review P1-1 半边）
            if (iv.text.includes(`${ANNO_HREF_PREFIX}`)) continue;
            items.push({
                key: `mark:${blockID}#${idx}`,
                kind: "mark",
                hostID: blockID,
                docID: info.docID,
                markVar: iv.markVar,
                quote: iv.text,
                order: 0,
            });
            idx++;
        }
    }
    return items;
}

/** 阅读序回填：orderOf miss（<0）垫大数保稳定（getChildBlocks 失败/块已删） */
export function assignOverviewOrder(items: OverviewItem[], orderOf: (hostID: string) => number): OverviewItem[] {
    return items.map((it, i) => {
        const o = orderOf(it.hostID);
        return { ...it, order: o >= 0 ? o : Number.MAX_SAFE_INTEGER - items.length + i };
    });
}

/** 分组元数据：片（point）/书文档（isBook）/普通文档（point=null） */
export interface DocMeta {
    docID: string;
    name: string;
    point: number | null;
    isBook?: boolean;
}

export interface OverviewGroup {
    meta: DocMeta;
    items: OverviewItem[];
}

/** 条目 → 文档分组：组序=书组先 → point 升序 → null 垫尾；组内 order 升序（key 稳定）；
 *  meta 表外的条目落匿名组（name 空串，防御：块 root 已删时 SQL 不该出现，兜底不炸）。
 *  空组不产出。 */
export function groupOverviewItems(items: OverviewItem[], metas: DocMeta[]): OverviewGroup[] {
    const byDoc = new Map<string, OverviewItem[]>();
    for (const it of items) {
        if (!byDoc.has(it.docID)) byDoc.set(it.docID, []);
        byDoc.get(it.docID)!.push(it);
    }
    const metaOf = new Map(metas.map((m) => [m.docID, m]));
    const groups: OverviewGroup[] = [];
    for (const [docID, list] of byDoc) {
        const meta = metaOf.get(docID) ?? { docID, name: "", point: null };
        list.sort((a, b) => a.order - b.order || (a.key < b.key ? -1 : 1));
        groups.push({ meta, items: list });
    }
    groups.sort((a, b) => Number(b.meta.isBook ?? false) - Number(a.meta.isBook ?? false)
        || (a.meta.point ?? Infinity) - (b.meta.point ?? Infinity)
        || (a.meta.docID < b.meta.docID ? -1 : 1));
    return groups;
}

/** 色筛选 chips：value=markVar 或 ""（无色）；色板 --b3-font-backgroundN 按数字序 →
 *  自定义字面色值（hex/rgb，□5 起）字母序 → 无色垫尾 */
export function colorChipsOf(items: OverviewItem[]): { value: string; count: number }[] {
    const byVar = new Map<string, number>();
    for (const it of items) {
        const v = it.markVar ?? "";
        byVar.set(v, (byVar.get(v) ?? 0) + 1);
    }
    const num = (v: string) => {
        const m = v.match(/--b3-font-background(\d+)/);
        return m ? Number(m[1]) : Infinity;
    };
    return [...byVar.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => (a.value === "" ? 1 : b.value === "" ? -1 : num(a.value) - num(b.value) || (a.value < b.value ? -1 : 1)));
}

/** 色筛选：active 空/null=全部；含 "" 表无色档 */
export function filterByColors(items: OverviewItem[], active: string[] | null): OverviewItem[] {
    if (active == null || active.length === 0) return items;
    const set = new Set(active);
    return items.filter((it) => set.has(it.markVar ?? ""));
}

// ---------------- 取数编排（siyuan 依赖；行为验证走 6811 实弹） ----------------

import { siyuan } from "./utils";
import { mapLimit } from "./annoPanelList";
import { debugLog } from "./logUtils";
import { ANNOTATIONS_ATTR } from "./annotationsAttr";

/** 总览数据成品：浮层一次消费（组+chips），scopeName=标题/收集节名 */
export interface OverviewData {
    bookID?: string;
    scopeName: string;
    groups: OverviewGroup[];
    chips: { value: string; count: number }[];
}

/** 片集查询：LIKE 前缀（书ID 后逗号定界防前缀撞车）+ digest 伴生属性第二刀 */
function pieceDocSQL(bookID: string): string {
    return `select id, content, ial from blocks where type='d'
        and ial like '%${MarkKey}="${TEMP_CONTENT}#${bookID},%'
        and ial not like '%${PDIGEST_CTIME}="%' limit 5000`;
}

async function fetchMetas(bookID: string): Promise<DocMeta[]> {
    const metas: DocMeta[] = [];
    const book = await siyuan.sqlOne(`select id, content from blocks where id='${bookID}' and type='d'`);
    if (book?.id) metas.push({ docID: book.id, name: book.content ?? "", point: null, isBook: true });
    const rows = (await siyuan.sql(pieceDocSQL(bookID))) ?? [];
    for (const r of rows as { id?: string; content?: string; ial?: string }[]) {
        if (!r?.id) continue;
        const pm = parsePieceIal(r.ial);
        if (!pm) continue; // 查询已第二刀，此处防御脏值
        metas.push({ docID: r.id, name: pieceDisplayName(r.content ?? ""), point: pm.point });
    }
    return metas;
}

/** 宿主 → 最近上级 h2 块 id（含自身，anno-fix □4 微信读书式分节）：只认 h2（陆杰口径
 *  「只需要二级标题」，h1/h3 不分节）。返回**块 id** 非 text——节身份判据用 id（书内
 *  多篇同名 h2「小结」类常见，文本判据在色筛选后会同名误并，reasoning review P2-1）。
 *  parentOf/h2Text 来自 buildHostRanks 的全树一趟 SQL；cache 跨宿主复用（同链祖先结果
 *  回填，均摊低）。null=链上无 h2（不分节）；空内容 h2 不认（无信息，有意行为）。
 *  导出供单测；hops 上限防脏环自指。 */
export function sectionUpOf(
    hostID: string,
    parentOf: Map<string, string>,
    h2Text: Map<string, string>,
    cache?: Map<string, string | null>,
): string | null {
    const path: string[] = [];
    let cur = hostID;
    let result: string | null = null;
    for (let hops = 0; cur && hops < 64; hops++) {
        if (cache) {
            const cached = cache.get(cur);
            if (cached !== undefined) {
                result = cached;
                break;
            }
        }
        if (h2Text.has(cur)) {
            result = cur;
            break;
        }
        path.push(cur);
        cur = parentOf.get(cur) ?? "";
    }
    if (cache) for (const p of path) cache.set(p, result);
    return result;
}

/** 阅读序 rank：getChildBlocks 顶层序（真序唯一通道）+ parent 链上爬兜底（嵌套块归其
 *  顶层祖先序，SQL 行序兜底稳）；单文档失败=空表（调用方退行序）。rank=顶层 idx。
 *  □4 扩展：同一趟全树 SQL 顺产 sections（宿主→最近上级 h2 块 id）+h2Text（id→标题文本）。
 *  content 列 case when 收窄（reasoning review P2-2：巨书 50000 行只为提 h2，payload 3~5 倍放大）。 */
async function buildHostRanks(
    roots: string[],
    hostDoc: Map<string, string>,
): Promise<{ ranks: Map<string, number>; sections: Map<string, string>; h2Text: Map<string, string> }> {
    const ranks = new Map<string, number>();
    const sections = new Map<string, string>();
    const h2Text = new Map<string, string>();
    const tops = new Map<string, string[]>();
    const needRoots = [...new Set(hostDoc.values())].filter((r) => roots.includes(r));
    await mapLimit(needRoots, 4, async (root) => {
        try {
            const kids = await siyuan.getChildBlocks(root);
            tops.set(root, (kids ?? []).map((k) => k.id));
        } catch {
            tops.set(root, []);
        }
    });
    const inList = needRoots.map((r) => `'${r}'`).join(",");
    const parentOf = new Map<string, string>();
    if (hostDoc.size > 0) {
        const rows = (await siyuan.sql(`select id, parent_id,
            case when type = 'h' and subtype = 'h2' then content else '' end as content
            from blocks where root_id in (${inList}) limit 50000`)) ?? [];
        for (const r of rows as { id?: string; parent_id?: string | null; content?: string }[]) {
            if (!r?.id) continue;
            parentOf.set(r.id, r.parent_id ?? "");
            if (r.content) h2Text.set(r.id, r.content); // 空 content h2 不认（有意：无信息）
        }
    }
    const secCache = new Map<string, string | null>();
    for (const [hostID, docID] of hostDoc) {
        const secID = sectionUpOf(hostID, parentOf, h2Text, secCache);
        if (secID) sections.set(hostID, secID);
        const topIds = tops.get(docID);
        if (!topIds) continue; // 块 root 不在元集（已删/跨库）→ miss 垫尾
        let cur: string = hostID;
        for (let hops = 0; cur && hops < 64; hops++) {
            const idx = topIds.indexOf(cur);
            if (idx >= 0) {
                ranks.set(hostID, idx);
                break;
            }
            cur = parentOf.get(cur) ?? "";
        }
    }
    return { ranks, sections, h2Text };
}

// type != 'c'：代码块里粘的字面 kramdown 形态（教程/帮助文档）不出假划线卡（review P2）。
// 宽锚 `background-color:`（treemap □5 反哺：旧双锚〔色板变量+inline-builtin，annocolor □1
// 主实例实证 57 块全命中〕是新锚子串——自定义 hex/rgb 块 8 条落无色分组的陆杰实锤病灶在
// SQL 层，宽锚后块进得来）。多命中块解析不出区间=自然无害（normalizeBgVar 边界拦下）。
const COLOR_SQL_WHERE = `markdown like '%background-color:%'`;
const MARK_SQL = (inList: string) => `select id, root_id as r, markdown as md, parent_id as p from blocks
    where root_id in (${inList}) and type != 'c' and (${COLOR_SQL_WHERE}) limit 20000`;

/**
 * 种子 → 总览数据：bookID 直查书+片集；docID 先判片归属（是片→所在书，否则单文档域）。
 * 双源联查（批注属性带 markdown / mark LIKE）→ 阅读序回填 → 分组+chips。
 * 取数失败上抛（浮层 loading/failed 态分叉），打点 anno_overview。
 */
export async function resolveOverviewScope(seed: { bookID?: string; docID?: string }): Promise<OverviewData> {
    const t0 = Date.now();
    let bookID = SIYUAN_ID_RE.test(seed.bookID ?? "") ? (seed.bookID as string) : "";
    if (!bookID && seed.docID && SIYUAN_ID_RE.test(seed.docID)) {
        const row = await siyuan.sqlOne(`select id, content, ial from blocks where id='${seed.docID}'`);
        const bid = parsePieceIal(row?.ial)?.bookID ?? "";
        if (SIYUAN_ID_RE.test(bid)) bookID = bid;
    }
    let metas: DocMeta[] = [];
    if (bookID) {
        metas = await fetchMetas(bookID);
    } else if (seed.docID) {
        const row = await siyuan.sqlOne(`select id, content from blocks where id='${seed.docID}' and type='d'`);
        if (row?.id) metas = [{ docID: row.id, name: row.content ?? "", point: null }];
    }
    const roots = metas.map((m) => m.docID);
    const inList = roots.map((r) => `'${r}'`).join(",");
    let items: OverviewItem[] = [];
    let scopeName = "";
    if (roots.length > 0) {
        const annoRows = roots.length === 1
            ? ((await siyuan.sql(`select a.block_id as id, a.value as v, b.root_id as r, b.markdown as md, b.parent_id as p
                from attributes a join blocks b on b.id = a.block_id
                where a.name = '${ANNOTATIONS_ATTR}' and b.root_id = '${roots[0]}' limit 10000`)) ?? [])
            : ((await siyuan.sql(`select a.block_id as id, a.value as v, b.root_id as r, b.markdown as md, b.parent_id as p
                from attributes a join blocks b on b.id = a.block_id
                where a.name = '${ANNOTATIONS_ATTR}' and b.root_id in (${inList}) limit 10000`)) ?? []);
        const markRows = (await siyuan.sql(MARK_SQL(inList))) ?? [];
        items = overviewItemsFromRows(annoRows as OverviewAnnoRow[], markRows as OverviewMarkRow[]);
        const hostDoc = new Map<string, string>();
        for (const r of [...(annoRows as OverviewAnnoRow[]), ...(markRows as OverviewMarkRow[])]) {
            if (r?.id) hostDoc.set(r.id, r.r);
        }
        const { ranks, sections, h2Text } = await buildHostRanks(roots, hostDoc);
        items = assignOverviewOrder(items, (h) => ranks.get(h) ?? -1);
        // □4 分节回填（节身份=sectionID，文本仅展示——同名 h2 不误并；阅读序组内聚簇，UI 按 id 变化插节头）
        for (const it of items) {
            const h2ID = sections.get(it.hostID);
            if (h2ID) {
                it.sectionID = h2ID;
                it.section = h2Text.get(h2ID) ?? "";
            }
        }
        // 书文档已删时兜底取 point 最小片名（metas 无序，盲取 metas[0] 是随机片名——review P2）
        scopeName = metas.find((m) => m.isBook)?.name
            || [...metas].sort((a, b) => (a.point ?? Infinity) - (b.point ?? Infinity))[0]?.name
            || "";
    }
    const groups = groupOverviewItems(items, metas);
    debugLog("anno_overview", `book=${bookID || "-"} roots=${roots.length} groups=${groups.length} items=${items.length} ms=${Date.now() - t0}`, "anno");
    return { bookID: bookID || undefined, scopeName, groups, chips: colorChipsOf(items) };
}
