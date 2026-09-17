// src/libs/graphContent.ts
// GraphBox per-type 正文提取与 custom 块过滤（graphbox □1，2026-09-17）。
// 全量通道 fillChildren 的内容分支按类型分流到这里；DOM 形态按 6810 全类型
// 测试文档 getBlockDOM 实测锚定（fixtures 见 tests/unit/graphContent.test.ts）。
// 纯函数零 IO；channel 无关——骨架通道的 custom 过滤同用 filterCustomRows。

/** 正文内不可见字符全量剥除：removeInvisibleChars(str, true) 只去首尾，段内
 *  ZWSP/ZWJ/词连接符（行内 code 标记边界 ​⁠code​ 家族）会漏进 label */
const INVISIBLE_RE = /[\u200B-\u200D\u2060\uFEFF]/g;

/** 段落/标题类正文：保留引用锚点文本（原 getContentWithoutRefs 剥锚点会把
 *  「引用段落 ((x '锚')) 与 ((y '锚'))。」挖成「引用段落 与 。」空洞），段内
 *  不可见字符全量剥除 */
export function blockText(div: HTMLElement): string {
    return (div.textContent ?? "").replace(INVISIBLE_RE, "").trim();
}

/** 代码块正文：语言行 + 代码本体换行分隔。textContent 直取会把语言标记
 *  （.protyle-action__language）与首行代码粘连成 "pythondef hello():"。
 *  代码本体取 .hljs 内 contenteditable 容器（保缩进换行）；结构变化时回退
 *  剥工具栏克隆通道 */
export function codeBlockText(div: HTMLElement): string {
    const lang = div.querySelector(".protyle-action__language")?.textContent?.trim();
    const codeEl = div.querySelector('.hljs [contenteditable="true"]') as HTMLElement | null;
    let body: string;
    if (codeEl) {
        body = codeEl.textContent ?? "";
    } else {
        const clone = div.cloneNode(true) as HTMLElement;
        clone.querySelectorAll(".protyle-action, .protyle-attr").forEach(n => n.remove());
        body = clone.textContent ?? "";
    }
    body = body.replace(INVISIBLE_RE, "").replace(/\s+$/, "");
    return lang ? `${lang}\n${body}` : body;
}

/** 表格正文：单元格文本空格连接。textContent 直取会把全部单元格无缝粘连
 *  （"表头一表头二表头三单元甲…"不可读） */
export function tableCellText(div: HTMLElement): string {
    const cells = [...div.querySelectorAll("th, td")]
        .map(c => (c.textContent ?? "").replace(INVISIBLE_RE, "").trim())
        .filter(Boolean);
    return cells.join(" ");
}

/** custom 块过滤（bear 拍板 2026-09-17）：;;;插件/类型 围栏块 content=纯 JSON，
 *  图上要么全空卡（DOM 通道提取无正文）要么 JSON 乱码（SQL 通道 content 列），
 *  两通道统一剔除；端点落在被剔块上的边连坐丢弃（引用边为主——custom 恒叶子，
 *  结构边子端不可能为 custom）。无 custom 时原样返回（引用相等，零拷贝） */
export function filterCustomRows<T extends { block_id?: string; def_block_id?: string }>(
    rows: Block[],
    links: T[],
): { rows: Block[]; links: T[] } {
    if (!rows.some(r => r.type === "custom")) return { rows, links };
    const kept = new Set(rows.filter(r => r.type !== "custom").map(r => r.id));
    return {
        rows: rows.filter(r => r.type !== "custom"),
        links: links.filter(l => kept.has(l.block_id ?? "") && kept.has(l.def_block_id ?? "")),
    };
}
