// □5 日记回顾面板纯逻辑（dailynote-pipeline 战役 2026-09-06；notebox 战役翻新为
// 日记导航器——转正功能全家退役，队列=日记文档里全部收集块纯浏览）：
// 收集块 = 识别章 custom-tomato-idea-time（□1 协议 v1）∩ 日记文档（custom-dailynote-%）。
// 月历两态吃同一份数据（无日记弱化 / 有日记主题色标记，count=当天条数供 hover title）。
// 组装/排序/预览/月历全为纯函数；fetchReviewData 注入 sql 通道便于单测。
export interface ReviewContainer {
    id: string;        // 容器块 id
    time: string;      // HH:MM 收集时刻
    root: string;      // 所属日记文档 id
    md: string;        // 容器完整 markdown（预览原料，自带全量后代）
    refHpath?: string; // 源文档 hpath（块收集/划词片段有；闪念无）
}
export interface ReviewDoc {
    docID: string;
    day: string; // YYYYMMDD（custom-dailynote-YYYYMMDD 的 value）
}
export interface ReviewDay {
    day: string;
    docID: string;
    items: ReviewContainer[];
}

/** 按天分组组装队列：天新→旧（最新在前，纯浏览导航序）、天内按时刻（再按 id 稳定）；
 * 只收日记文档里的容器（速记草稿等其它落点不进队列），无容器的天不生成空组 */
export function buildQueue(containers: ReviewContainer[], docs: ReviewDoc[]): ReviewDay[] {
    const docByRoot = new Map(docs.map((d) => [d.docID, d]));
    const byDay = new Map<string, ReviewDay>();
    for (const c of containers) {
        const doc = docByRoot.get(c.root);
        if (!doc) continue;
        let day = byDay.get(doc.day);
        if (!day) {
            day = { day: doc.day, docID: doc.docID, items: [] };
            byDay.set(doc.day, day);
        }
        day.items.push(c);
    }
    const days = [...byDay.values()];
    for (const d of days) d.items.sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id));
    return days.sort((a, b) => b.day.localeCompare(a.day));
}

const REF_WITH_TEXT = /\(\(\d{14}-[a-z0-9]+\s+'([^']*)'\)\)/g;
const REF_BARE = /\(\(\d{14}-[a-z0-9]+\)\)/g;
const IMAGE_MD = /!\[[^\]]*\]\([^)]*\)/g;
const SUPERBLOCK_ROW = /^\s*(?:\{\{\{row|\}\}\})\s*$/gm;
const WIKILINK = /\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g;
const HTML_TAG = /<[^>]+>/g;

/** 容器 markdown → 单行预览：块引取锚文本（裸引降级 ↗）、wikilink 取显示文本、
 * 图片转 [图]、剥 superblock 行包装与 HTML 标签、空白折叠；超长截断带省略号 */
export function previewText(md: string, maxLen = 80): string {
    if (!md) return "";
    const s = md
        .replace(REF_WITH_TEXT, "$1")
        .replace(REF_BARE, "↗")
        .replace(IMAGE_MD, "[图]")
        .replace(SUPERBLOCK_ROW, "")
        .replace(WIKILINK, "$1")
        .replace(HTML_TAG, "")
        .replace(/\s+/g, " ")
        .trim();
    if (s.length <= maxLen) return s;
    return s.slice(0, maxLen - 1) + "…";
}

export interface CalendarCell {
    day: string | null; // null = 月前/月尾占位
    state: "none" | "has"; // 无日记 / 有日记
    count: number; // 当天收集块条数（hover title 用）
    today: boolean;
}

/** ial 是否日记文档（custom-dailynote-% 前缀键=日记管线标识）。
 * □4 calcTimeInterval 前置判定：非日记文档直接跳过零 SQL（ial 读 protyle.background.ial 内存值） */
export function isDailyNoteIal(ial: Record<string, string> | undefined | null): boolean {
    if (!ial) return false;
    for (const k of Object.keys(ial)) {
        if (k.startsWith("custom-dailynote-")) return true;
    }
    return false;
}

/** 月历网格：周一起排固定 42 格（6 行）；day=YYYYMMDD。
 * counts: day → 当天收集块条数（供 hover title） */
export function buildMonthCells(
    year: number,
    month: number,
    docs: ReviewDoc[],
    counts: Record<string, number>,
    todayYmd: string,
): CalendarCell[] {
    const docDays = new Set(docs.map((d) => d.day));
    const pad = (n: number) => String(n).padStart(2, "0");
    const monthPrefix = `${year}${pad(month)}`;
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const leading = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
    const cells: CalendarCell[] = [];
    for (let i = 0; i < leading; i++) cells.push({ day: null, state: "none", count: 0, today: false });
    for (let d = 1; d <= daysInMonth; d++) {
        const day = `${monthPrefix}${pad(d)}`;
        cells.push({
            day,
            state: docDays.has(day) ? "has" : "none",
            count: counts[day] ?? 0,
            today: day === todayYmd,
        });
    }
    while (cells.length < 42) cells.push({ day: null, state: "none", count: 0, today: false });
    return cells.slice(0, 42);
}

/** 两条 SQL 拉全队列原料：容器（带日记文档过滤+源 hpath 左联）+ 日记文档表 */
export async function fetchReviewData(
    sql: (stmt: string) => Promise<any[]>,
): Promise<{ containers: ReviewContainer[]; docs: ReviewDoc[] }> {
    const containers = (await sql(
        `SELECT a.block_id AS id, a.value AS time, b.root_id AS root, b.markdown AS md, h.value AS refHpath
         FROM attributes AS a
         INNER JOIN blocks AS b ON b.id = a.block_id
         LEFT JOIN attributes AS h ON h.block_id = a.block_id AND h.name = 'custom-tomato-ref-hpath'
         WHERE a.name = 'custom-tomato-idea-time'
           AND b.root_id IN (SELECT block_id FROM attributes WHERE name LIKE 'custom-dailynote-%')`,
    )) as ReviewContainer[];
    const docs = (await sql(
        `SELECT block_id AS docID, value AS day FROM attributes WHERE name LIKE 'custom-dailynote-%'`,
    )) as ReviewDoc[];
    return {
        containers: containers.map((c) => ({ ...c, refHpath: c.refHpath ?? undefined })),
        docs,
    };
}
