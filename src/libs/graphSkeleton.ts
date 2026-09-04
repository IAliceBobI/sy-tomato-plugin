// src/libs/graphSkeleton.ts
// GraphBox 骨架轻通道纯函数（graphbox 翻新期 1，2026-09-03）：
// 预检分流（≤graphMaxAllBlocks 全量/超限骨架）+ SQL 标题行按 hpath 拼章节树 + 体量文案归一。
// 纯同步零 IO——SQL/网络调用在 GraphBox.ts 的 getGraphSkeleton，不进本文件。
// 骨架是预览语义：同级按 id（时间戳序≈文档序）、孤儿挂根不丢，不追求完美序。

export interface HeadingRow {
    id: string;
    content: string;
    subtype: string; // "h1".."h6"
    hpath: string;   // 标题链路径，如 "/第一章/第一节"；标题自身含 "/" 的歧义容忍
}

/** 预检分流：块数 ≤ 阈值走全量管线；超限走骨架（阈值复用 graphMaxAllBlocks 设置，handoff □1 拍板） */
export function pickGraphChannel(blockCount: number, threshold: number): "full" | "skeleton" {
    return blockCount <= threshold ? "full" : "skeleton";
}

function parentPath(hpath: string): string {
    const i = hpath.lastIndexOf("/");
    return i <= 0 ? "" : hpath.slice(0, i);
}

/**
 * 标题行拼章节树：rows[0] 恒为文档根（type="d"），标题 parent 链按 hpath 逐级上挂。
 * 结构边 links 与全量管线 orderedRefs 同构（{block_id: 父, def_block_id: 子, content: ""}），
 * 渲染层 applyRowsAndLinks 零分叉共用。headings 须已按 id 排序（SQL order by id，同级保序）。
 */
export function skeletonTreeFromHeadings(docID: string, docName: string, headings: HeadingRow[]): { rows: Block[]; links: Ref[] } {
    const doc: Block = { id: docID, type: "d", content: docName, subtype: "", root_id: docID, parent_id: docID, docName: "" };
    const rows: Block[] = [doc];
    const links: Ref[] = [];
    const byPath = new Map<string, Block>([["", doc]]);
    for (const hd of headings) {
        const parent = byPath.get(parentPath(hd.hpath)) ?? doc; // 父级缺失（索引延迟）挂根不丢
        const row: Block = {
            id: hd.id, type: "h", subtype: hd.subtype, content: hd.content,
            root_id: docID, parent_id: parent.id, docName: "",
        };
        (parent.children ??= []).push(row);
        rows.push(row);
        links.push({ block_id: parent.id, def_block_id: row.id, content: "" });
        byPath.set(hd.hpath, row); // 同名标题后者覆盖——骨架预览语义容忍
    }
    return { rows, links };
}

/** 体量文案：zh 万/千归一、en 千位 k；纯函数 lang 参数化（tomatoI18n.lang 旧码值域） */
export function formatCharsVolume(totalLen: number, lang: string): string {
    if (lang.startsWith("en")) {
        return totalLen >= 1000 ? `${(totalLen / 1000).toFixed(1)}k` : `${totalLen}`;
    }
    if (totalLen >= 10000) {
        return `${(totalLen / 10000).toFixed(1)}${lang === "zh_CHT" ? "萬" : "万"}`;
    }
    if (totalLen >= 1000) {
        return `${(totalLen / 1000).toFixed(1)}千`;
    }
    return `${totalLen}`;
}
