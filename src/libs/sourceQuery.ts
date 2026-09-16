// □8 共享抽取：块 id 反查来源三件套（rp 复习卡 2026-09-09 起源，anno-note/anno-chat 复习卡共用）。
// 来源行方案拍板=现查：渲染时拿块 id 反查文档标题/最近标题块/父路径——零迁移、改名跟最新；
// 查空（孤儿卡）/失败=静默不显（调用方置 hidden 由本层翻转）。
import { siyuan } from "./siyuanApi";
import { debugLog } from "./logUtils";
import { buildSourceText, splitHPath, unescapeBlockText, type RPCardSource } from "./readingPointCore";

/** origin/hostID 反查来源三件：行 join 文档 hpath → 父链爬最近标题块。
 *  块已删（孤儿卡）=行查不到 → null */
export async function fetchBlockSource(origin: string): Promise<RPCardSource | null> {
    const rows = (await siyuan.sql(
        `SELECT b.type AS btype, b.content AS bcontent, b.parent_id AS parent, r.hpath AS hpath
         FROM blocks b INNER JOIN blocks r ON r.id = b.root_id WHERE b.id = '${origin}'`,
    )) as { btype: string; bcontent: string | null; parent: string | null; hpath: string | null }[];
    const row = rows?.[0];
    if (!row) return null;
    const { docTitle, parentPath } = splitHPath(row.hpath ?? "");
    const section = await nearestSectionHeading(row.btype, row.bcontent, row.parent);
    return { docTitle: unescapeBlockText(docTitle), parentPath, section: unescapeBlockText(section) };
}

/** 最近标题块：目标块自身是标题→取自身文本；否则沿父链上爬（文档行 parent_id 恒空=自然
 *  终止；上限 16 层防环防失控） */
async function nearestSectionHeading(btype: string, bcontent: string | null, parentID: string | null): Promise<string> {
    if (btype === "h") return collapseSpaces(bcontent);
    let id = parentID ?? "";
    for (let i = 0; i < 16 && id; i++) {
        const rows = (await siyuan.sql(
            `SELECT type, content, parent_id FROM blocks WHERE id = '${id}'`,
        )) as { type: string; content: string | null; parent_id: string | null }[];
        const row = rows?.[0];
        if (!row) break;
        if (row.type === "h") return collapseSpaces(row.content);
        id = row.parent_id ?? "";
    }
    return "";
}

function collapseSpaces(s: string | null): string {
    return (s ?? "").replace(/\s+/g, " ").trim();
}

/** 来源行现查回填：查到才显（title=完整 hpath 兜底超长截断）；查空/异常=保持 hidden 静默降级。
 *  label=打点族标签（rp 卡传 "readpoint" 保观测连续，默认 "anno"） */
export async function fillSourceRow(el: HTMLElement, origin: string, label = "anno"): Promise<void> {
    let s: RPCardSource | null = null;
    try {
        s = await fetchBlockSource(origin);
    } catch { /* SQL 链失败=来源行缺席，卡面其余照常 */ }
    const text = s ? buildSourceText(s) : "";
    debugLog("card_source", `ok=${!!s} len=${text.length}`, label);
    if (!text) return;
    el.textContent = text;
    el.title = `${s!.parentPath}/${s!.docTitle}`;
    el.hidden = false;
}
