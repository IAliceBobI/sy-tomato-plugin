// □7 面板翻新纯函数层：批注分区数据装配 + 性能件（并发钳制/光标短路判定）
// + 批注绝对时间格式化（AnnoBubble 内联版提升共享，spec §5 同款语义）。
// 零 UI/零 siyuan 依赖，tests/unit/annoPanelList.test.ts 锁定契约。
import { parseAnnotations, type TomatoAnnotation } from "./annotationsAttr";

/** attributes 表联查行（同渐进 queryBookComments 的 SQL 形态：{id: block_id, v: 属性值, c: 块内容}） */
export interface AnnoPanelRow {
    id: string;
    v: string | null;
    c: string | null;
}

/** 面板批注条目：批注条目本体 + 宿主块定位信息（点击跳原文块用 hostID） */
export interface AnnoPanelItem {
    hostID: string;
    /** 该条批注挂链的宿主块总数（跨块批注 >1；面板「跨 N 块」徽标数据源，anno-round2 □7） */
    hostCount: number;
    blockContent: string;
    entry: TomatoAnnotation;
}

/** 行 → 面板条目列表：每块展开为条目后按 annoId 去重（陆杰 09-16：跨块批注多块各挂
 *  同 id 属性串，逐块展开=同一条记录重复 N 条；数据层不动——多块挂链是锚点机制），
 *  整列 time 降序；属性脏值/零有效条目的块整块跳过。重复条目保首个宿主块（点击定位
 *  落在批注覆盖的某一块即可；卡片引文走 entry.sel.txt 快照，与宿主块无关）；hostCount
 *  =同 id 宿主块计数（去重不丢「跨块」感知）。 */
export function annoPanelFromRows(rows: AnnoPanelRow[] | null | undefined): AnnoPanelItem[] {
    // 解析结果缓存（hostCount 预数一遍，块行不重复 parseAnnotations）
    const parsed: { id: string; content: string; entries: TomatoAnnotation[] }[] = [];
    for (const r of rows ?? []) {
        if (r?.id == null || r.id === "") continue;
        const entries = parseAnnotations(r.v);
        if (entries.length === 0) continue;
        parsed.push({ id: r.id, content: typeof r.c === "string" ? r.c : "", entries });
    }
    const hostCount = new Map<string, number>();
    for (const p of parsed) {
        for (const e of p.entries) hostCount.set(e.id, (hostCount.get(e.id) ?? 0) + 1);
    }
    const items: AnnoPanelItem[] = [];
    const seen = new Set<string>();
    for (const p of parsed) {
        for (const entry of p.entries) {
            if (seen.has(entry.id)) continue;
            seen.add(entry.id);
            items.push({ hostID: p.id, hostCount: hostCount.get(entry.id) ?? 1, blockContent: p.content, entry });
        }
    }
    items.sort((a, b) => b.entry.time - a.entry.time);
    return items;
}

/** 并发钳制 map：最多 limit 路并发跑 fn，结果按入参序返回；limit < 1 视为 1。
 *  任一 fn reject 则整体 reject（与 Promise.all 语义一致，调用方 catch 兜底）。 */
export async function mapLimit<T, R>(
    items: readonly T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
    const n = items.length;
    const results = new Array<R>(n);
    const max = Math.max(1, Math.floor(limit) || 1);
    let cursor = 0;
    async function worker(): Promise<void> {
        while (cursor < n) {
            const i = cursor++;
            results[i] = await fn(items[i], i);
        }
    }
    await Promise.all(Array.from({ length: Math.min(max, n) }, worker));
    return results;
}

/** 光标块短路判定：与上次刷新同块同文档且期间无 ws 事务（gen 相同）→ true（跳过重复刷新）。
 *  gen 是比较式而非消费式（reasoning P1-3）：刷新失败不会清脏，双实例共享同一份失效信号；
 *  force（F9/刷新按钮）在调用侧短路判定前拦截。 */
export function shouldSkipRefresh(
    prev: { blockID?: string; docID?: string; gen?: number } | null | undefined,
    next: { blockID: string; docID: string; gen: number },
): boolean {
    if (prev == null || prev.blockID == null || prev.docID == null) return false;
    if (prev.gen !== next.gen) return false;
    return prev.blockID === next.blockID && prev.docID === next.docID;
}

/** spec §5 同款绝对时间：当年 MM-DD HH:mm，跨年补全 YYYY-（tabular-nums 由 CSS 管） */
export function fmtAnnoTime(ms: number, now: number = Date.now()): string {
    const d = new Date(ms);
    const n = new Date(now);
    const p = (x: number) => String(x).padStart(2, "0");
    const mdhm = `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    return d.getFullYear() === n.getFullYear() ? mdhm : `${d.getFullYear()}-${mdhm}`;
}
