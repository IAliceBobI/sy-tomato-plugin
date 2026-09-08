// 阅读点翻新（readpoint 战役）纯函数层：新模型=原文块直挂 custom-tomato-readat 属性
// （值=YYYYMMDDHHmmss），老模型=超级块挂 custom-tomato-readingpoint（值=bookID）惰性兼容
// （spec：docs/tomato-reading-point-spec.md）。面板列表组装/搜索过滤/相对时间分档在此锁行为，
// SQL 侧只负责取数；不 import siyuan/utils 保证可单测（gconst 纯常量除外）。
import { RPCARD_FENCE } from "./gconst";

/** attributes join blocks 的 SQL 行（新/老共用形状；老行另有 updated） */
export interface RPSQLRow {
    block_id: string;
    value: string;
    root_id?: string;
    hpath?: string;
    box?: string;
    content?: string | null;
    updated?: string;
}

export interface RPEntry {
    /** 跳转目标：新点=原文块；老点=阅读点超级块自身（卡片内链接进原文） */
    blockID: string;
    docID: string;
    hpath: string;
    box: string;
    excerpt: string;
    /** 排序键 YYYYMMDDHHmmss（新=readat 值，老=updated；老点可能为空串排最后） */
    ts: string;
    legacy: boolean;
}

export type RPTimeKind = "justNow" | "minutes" | "hours" | "days" | "date";
export interface RPTimeDesc { kind: RPTimeKind; n?: number; date?: string }

function toEntry(r: RPSQLRow, legacy: boolean): RPEntry {
    return {
        blockID: r.block_id,
        docID: r.root_id ?? "",
        hpath: r.hpath ?? "",
        box: r.box ?? "",
        excerpt: (r.content ?? "").replace(/\s+/g, " ").trim(),
        ts: legacy ? (r.updated ?? "") : r.value,
        legacy,
    };
}

/** 新老合并：同块双属性留新去老；ts 降序，空 ts（老点无 updated）排最后 */
export function mergeReadingPoints(newRows: RPSQLRow[], legacyRows: RPSQLRow[]): RPEntry[] {
    const newEntries = newRows.map(r => toEntry(r, false));
    const newIDs = new Set(newEntries.map(e => e.blockID));
    const legacyEntries = legacyRows.map(r => toEntry(r, true)).filter(e => !newIDs.has(e.blockID));
    return [...newEntries, ...legacyEntries].sort((a, b) => {
        if (a.ts && b.ts) return a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0;
        if (a.ts) return -1;
        if (b.ts) return 1;
        return 0;
    });
}

/** 关键词过滤：命中 hpath 或摘录，大小写不敏感；空关键词全量 */
export function filterReadingPoints(entries: RPEntry[], kw: string): RPEntry[] {
    const k = kw.trim().toLowerCase();
    if (!k) return entries;
    return entries.filter(e => e.hpath.toLowerCase().includes(k) || e.excerpt.toLowerCase().includes(k));
}

/** 属性行（root_id=所在文档视角）——书级清点 join 的输入形状（readpoint □2-B 恢复一书一点）。
 *  readat 行的 block_id=点块、root_id=点所在文档；标记行 root_id=分片文档自身 */
export interface RPRootAttrRow {
    block_id?: string;
    root_id: string;
    value: string;
}

/** 同书其他文档的新格式阅读点块：readat 全量 × 分片标记（progmark/book-writing 双形态）
 *  按 root_id join 出「与 docID 同书」的点块，剔除当前文档自身的点（本文档唯一性另有通道）。
 *  bookID 空（非书内文档）=无兄弟点。纯函数锁 join 行为（SQL 只取数） */
export function siblingReadatBlocks(
    readatRows: RPRootAttrRow[],
    markRows: RPRootAttrRow[],
    writingRows: RPRootAttrRow[],
    docID: string,
    parseBook: (mark: string | undefined, writing: string | undefined) => string,
): string[] {
    const bookID = parseBook(
        markRows.find(r => r.root_id === docID)?.value,
        writingRows.find(r => r.root_id === docID)?.value,
    );
    if (!bookID) return [];
    const docBook = new Map<string, string>();
    for (const r of markRows) docBook.set(r.root_id, parseBook(r.value, undefined));
    for (const r of writingRows) if (!docBook.has(r.root_id)) docBook.set(r.root_id, parseBook(undefined, r.value));
    return readatRows
        .filter(r => r.root_id !== docID && r.block_id && docBook.get(r.root_id) === bookID)
        .map(r => r.block_id as string);
}

/** 悬浮球展开条「最近在读」条目（rpfloatbar 战役）：hpath 末段=文档名（空/根路径→空串，
 *  视图兜底「（空）」）+ limit 裁剪（输入已按时间降序，截前 N 条） */
export interface RPBarItem {
    blockID: string;
    docName: string;
    ts: string;
    legacy: boolean;
}

export function toBarItems(entries: RPEntry[], limit: number): RPBarItem[] {
    if (limit <= 0) return [];
    return entries.slice(0, limit).map(e => ({
        blockID: e.blockID,
        docName: (e.hpath ?? "").split("/").pop() ?? "",
        ts: e.ts,
        legacy: e.legacy,
    }));
}

/** "YYYYMMDDHHmmss" → Date；格式坏返回 null */
export function parseRPTime(ts: string): Date | null {
    if (!/^\d{14}$/.test(ts)) return null;
    const d = new Date(
        Number(ts.slice(0, 4)), Number(ts.slice(4, 6)) - 1, Number(ts.slice(6, 8)),
        Number(ts.slice(8, 10)), Number(ts.slice(10, 12)), Number(ts.slice(12, 14)),
    );
    return isNaN(d.getTime()) ? null : d;
}

/** 相对时间分档（文案走 i18n，由视图映射）：刚刚 / N分钟前 / N小时前 / N天前 / 日期 */
export function relativeTime(ts: string, now: Date): RPTimeDesc | null {
    const d = parseRPTime(ts);
    if (!d) return null;
    let diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) diffMs = 0; // 时钟漂移防御：未来按刚刚
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return { kind: "justNow" };
    if (min < 60) return { kind: "minutes", n: min };
    const hour = Math.floor(min / 60);
    if (hour < 24) return { kind: "hours", n: hour };
    const day = Math.floor(hour / 24);
    if (day < 7) return { kind: "days", n: day };
    const p = (n: number) => String(n).padStart(2, "0");
    return { kind: "date", date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` };
}

// ---- rpcard 战役（2026-09-08）：阅读点 custom 卡 content 模型（纯函数层）----
// 卡块=custom 块 ;;;sy-tomato-plugin/reading-point（RPCARD_FENCE），content=单行 JSON。
// 内核契约：content 禁含纯 ;;; 行（isCustomBlockContentValid）——JSON.stringify 把换行转义成
// 字面 \n，单行天然满足，无需额外清洗。excerpt=设点时原文快照不实时追（设计拍板）。
export interface RPCardData {
    v: 1;
    /** 原文块 id（跳转锚 + 删点清理链的挂链对象） */
    origin: string;
    /** 设点时刻 YYYYMMDDHHmmss（与 readat 同格式，relativeTime 直接可用） */
    ts: string;
    /** 设点时原文快照 */
    excerpt: string;
}

export function buildRPCardContent(d: RPCardData): string {
    return JSON.stringify({ v: 1, origin: d.origin, ts: d.ts, excerpt: d.excerpt });
}

/** 容错解析：坏 JSON/版本不符/字段缺失 → null（渲染层显灰字占位） */
export function parseRPCardContent(content: string): RPCardData | null {
    let raw: unknown;
    try {
        raw = JSON.parse(content);
    } catch {
        return null;
    }
    if (typeof raw !== "object" || raw === null) return null;
    const o = raw as Record<string, unknown>;
    if (o.v !== 1) return null;
    if (typeof o.origin !== "string" || typeof o.ts !== "string" || typeof o.excerpt !== "string") return null;
    return { v: 1, origin: o.origin, ts: o.ts, excerpt: o.excerpt };
}

/** 插块用围栏 markdown：围栏头+单行 content，无闭合 ;;;（anno-chat 同款——md 通道不解析
 *  IAL 也不补闭合，内核落盘时自动补；真实块 ID 只能从 insert 响应 doOperations[0].id 取） */
export function buildRPCardBlockMD(content: string): string {
    return `${RPCARD_FENCE}\n${content}`;
}
