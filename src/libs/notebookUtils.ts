// 笔记本取用、文档树批量导出（markdown/块），以及若干基于 siyuan API 的
// 块/卡/日志小工具。从原 siyuanApi.ts 拆出（2026-08 重构），
// siyuanApi.ts 负责 re-export 保持历史导入路径。
import { siyuan } from "./siyuanApi";
import { Siyuan } from "./globals";
import { events } from "./Events";
import { getDocBlocks } from "./docUtils";
import { chunks } from "./miscUtils";
import { timeUtil } from "./timeUtil";

export function mylog(...data: any[]) {
    if (events.isMobile) {
        siyuan.appendDailyNoteBlock(events.boxID, data.join(" "))
    } else {
        console.info(...data)
    }
}

export function write2dailynote(txt: string) {
    const box = opennedNotebooks()?.at(0)?.id
    if (box) {
        siyuan.appendDailyNoteBlock(box, txt)
    }
}

export function opennedNotebooks() {
    return Siyuan?.notebooks?.filter(i => i.id && !i.closed)
}

export async function deleteBlock(id: string, row?: Block) {
    if (!row) row = await siyuan.sqlOne(`select type from blocks where id="${id}"`);
    if (row?.type === "d") {
        await siyuan.removeDocByIDSiyuan(id)
    } else {
        await siyuan.deleteBlock(id);
    }
}

export async function findDuplicatedDocs() {
    const rows = await siyuan.sql(` select id,content,hpath from blocks where content in (
            SELECT content FROM blocks WHERE type = 'd' GROUP BY content HAVING COUNT(*) > 1
        ) and type='d'`)
    rows.forEach(row => {
        console.info(row);
    })
}

export function addCardSetDueTime(cardID: string, sleepMs = 1000, deltaSecs = 0) {
    setTimeout(async () => {
        await siyuan.addRiffCards([cardID]);
        if (deltaSecs > 0) {
            setTimeout(async () => {
                await siyuan.reviewRiffCardByBlockID(cardID, 2);
                const due = timeUtil.getYYYYMMDDHHmmss(timeUtil.nowts() + deltaSecs);
                await siyuan.batchSetRiffCardsDueTimeByBlockID([{ id: cardID, due }]);
            }, sleepMs);
        }
    }, sleepMs);
}

export function getNotebookByName(name: string) {
    return Siyuan?.notebooks?.find(n => n.name == name)
}

export function getNotebookByID(id: string) {
    return Siyuan?.notebooks?.find(n => n.id == id)
}

export function getNotebookFirstOne() {
    return Siyuan?.notebooks?.find(n => n.closed != null && n.closed == false)
}

export async function getHpath(id: string) {
    if (!id) return "";
    const row = await siyuan.getRowByID(id);
    if (row) {
        let n = getNotebookByID(row.box)?.name ?? ""
        n = n + (row.hpath ?? "");
        if (n) return n;
    }
    return id;
}

export async function getMarkdownsByTrees(ids: string[], boxID = "") {
    const allDocRows: Block[] = await getTreeDocIDs(ids, boxID);

    const mds: Block[] = [];
    for (const rows of chunks(allDocRows, 50)) {
        mds.push(...await Promise.all(rows.map(async row => {
            const md = await siyuan.copyStdMarkdown(row.id);
            row.markdown = md;
            return row;
        })))
        siyuan.pushMsg(`copied: ${mds.length}/${allDocRows.length}`)
    }
    return mds;
}

export async function getBlocksByTrees(ids: string[], excludeID?: string) {
    const allDocRows: Block[] = await getTreeDocIDs(ids);
    const roots: Block[] = [];
    for (const rows of chunks(allDocRows, 50)) {
        roots.push(...await Promise.all(rows
            .filter(row => row.id !== excludeID)
            .map(async row => {
                const { root } = await getDocBlocks(row.id, "", false, false, 1);
                return root;
            })
        ))
        siyuan.pushMsg(`copied: ${roots.length}/${allDocRows.length}`)
    }
    return roots;
}

async function getTreeDocIDs(ids: string[], boxID = "", minUpdated = "", excat = false) {
    let allDocRows: Block[];
    if (boxID) {
        allDocRows = await siyuan.sql(`select id,ial,content,updated,path 
            from blocks where box='${boxID}' and type='d' and updated>'${minUpdated}' 
            order by updated asc limit 999999999`);
    } else {
        let or: string;
        if (excat) {
            const idin = ids.map(id => `"${id}"`).join(",");
            or = `id in (${idin})`;
        } else {
            or = ids.map(id => `path like '%${id}%'`).join(" or ");
        }
        allDocRows = await siyuan.sql(`select id,ial,content,updated,path 
            from blocks where (${or}) and type='d' and updated>'${minUpdated}' 
            order by updated asc limit 999999999`);
    }
    return allDocRows.sort((a, b) => a.path.localeCompare(b.path));
}
