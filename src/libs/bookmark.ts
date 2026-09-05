import { Plugin } from "siyuan";
import { siyuan, timeUtil } from "./utils";
import { READAT, READINGPOINT } from "./gconst";
import { tomatoI18n } from "../tomatoI18n";
import { OpenSyFile2 } from "./docUtils";
import { getBookID } from "./progressive";
import { mergeReadingPoints, type RPEntry, type RPSQLRow } from "./readingPointCore";

// 阅读点数据层（readpoint 战役重写，spec：docs/tomato-reading-point-spec.md）：
// 新模型=原文块直挂 custom-tomato-readat 属性（值=时间戳），每文档一个；老模型=超级块挂
// custom-tomato-readingpoint（值=bookID）惰性兼容——设/删时顺带清理（一次按键即迁移），不写迁移脚本。

/** 块所在文档的阅读点（新格式）：[{blockID, ts}] */
async function newPointsOfDoc(docID: string) {
    const rows = await siyuan.sqlAttr(`select block_id, value from attributes where name="${READAT}" and root_id="${docID}"`);
    return rows.map(r => ({ blockID: r.block_id, ts: r.value }));
}

/** 老格式清理目标：书级（value=bookID，目录文档集中存放也能命中）∪ 本文档内物理存放（插在原文后的） */
async function legacyPointIDsOfDoc(docID: string) {
    const { bookID } = await getBookID(docID);
    const bookKey = bookID || docID;
    const rows = await siyuan.sqlAttr(
        `select block_id from attributes where name="${READINGPOINT}" and (value="${bookKey}" or root_id="${docID}")`,
    );
    return rows.map(r => r.block_id);
}

/** 设点：清同文档新格式旧属性+同书老格式块 → 原文块挂 readat=now。返回 false=块无效 */
export async function setReadingPoint(blockID: string): Promise<boolean> {
    const docRow = await siyuan.getDocRowByBlockID(blockID);
    if (!docRow?.id) return false;
    const docID = docRow.id;
    const ts = timeUtil.getYYYYMMDDHHmmss(timeUtil.nowts());
    const olds = await newPointsOfDoc(docID);
    const attrOps = olds
        .filter(o => o.blockID != blockID)
        .map(o => ({ id: o.blockID, attrs: { [READAT]: "" } as AttrType }));
    attrOps.push({ id: blockID, attrs: { [READAT]: ts } as AttrType });
    // 目标块若恰好是老点块（老点挂原文块上的场景）：不删它，只清别处的老点——先删后挂=挂到死 id 静默落空；
    // 其自身的老属性名同事务摘除（完成该块的格式迁移）
    const legacyIDs = (await legacyPointIDsOfDoc(docID)).filter(id => id != blockID);
    await cleanLegacyPoints(legacyIDs);
    attrOps.pop();
    attrOps.push({ id: blockID, attrs: { [READAT]: ts, [READINGPOINT]: "" } as AttrType });
    await siyuan.batchSetBlockAttrs(attrOps);
    return true;
}

/** 删块+删其闪卡（老格式阅读点块可能挂卡） */
async function cleanLegacyPoints(ids: string[]) {
    if (ids.length == 0) return;
    await siyuan.deleteBlocks(ids);
    await siyuan.removeRiffCards(ids);
}

/** 跳到当前文档的阅读点：新格式直跳原文块；老格式兜底打开阅读点卡片（内含原文链接） */
export async function gotoBookmark(docID: string, plugin: Plugin) {
    const rows = await newPointsOfDoc(docID);
    if (rows.length > 0) {
        await OpenSyFile2(plugin, rows[0].blockID);
        return;
    }
    const legacy = await siyuan.sqlAttr(`select block_id from attributes where name="${READINGPOINT}" and root_id="${docID}"`);
    if (legacy.length > 0) {
        await OpenSyFile2(plugin, legacy[0].block_id);
        return;
    }
    await siyuan.pushMsg(tomatoI18n.当前文档无阅读点, 2000);
}

/** 删除当前文档的阅读点：新格式摘属性，老格式删块+删卡 */
export async function removeReadingPoint(docID: string) {
    const rows = await newPointsOfDoc(docID);
    if (rows.length > 0) {
        await siyuan.batchSetBlockAttrs(rows.map(r => ({ id: r.blockID, attrs: { [READAT]: "" } as AttrType })));
    }
    await cleanLegacyPoints(await legacyPointIDsOfDoc(docID));
}

/** 面板列表：新老两查合并（排序/去重在 readingPointCore 纯函数层）。
 *  注意 attributes.id 是属性行自身 ID，目标块在 block_id 列（2026-09-05 e2e 实锤，join 错列全落空） */
export async function listReadingPoints(): Promise<RPEntry[]> {
    const [newRows, legacyRows] = await Promise.all([
        siyuan.sql(`select a.block_id, a.value, a.root_id, a.box, b.content, b.hpath from attributes a left join blocks b on a.block_id=b.id where a.name="${READAT}"`) as Promise<RPSQLRow[]>,
        siyuan.sql(`select a.block_id, a.value, a.root_id, a.box, b.content, b.hpath, b.updated from attributes a left join blocks b on a.block_id=b.id where a.name="${READINGPOINT}"`) as Promise<RPSQLRow[]>,
    ]);
    return mergeReadingPoints(newRows ?? [], legacyRows ?? []);
}

/** 面板单条删除：新点摘属性；老点删块+删卡 */
export async function deleteReadingPointEntry(e: RPEntry) {
    if (e.legacy) {
        await cleanLegacyPoints([e.blockID]);
    } else {
        await siyuan.setBlockAttrs(e.blockID, { [READAT]: "" } as AttrType);
    }
}

/** 状态栏钮态：当前文档有无阅读点（含老格式兜底），有则带回时间戳供 tooltip */
export async function currentDocReadingPoint(docID: string): Promise<{ blockID: string, ts: string } | null> {
    if (!docID) return null;
    const rows = await newPointsOfDoc(docID);
    if (rows.length > 0) return { blockID: rows[0].blockID, ts: rows[0].ts };
    const legacy = await siyuan.sqlAttr(`select block_id from attributes where name="${READINGPOINT}" and root_id="${docID}"`);
    if (legacy.length > 0) return { blockID: legacy[0].block_id, ts: "" };
    return null;
}

export async function rmTodoBookmark(docID: string) {
    const rows = await siyuan.sqlAttr(`select * from attributes where name='bookmark' and value='🚩' and root_id='${docID}'`);
    await siyuan.batchSetBlockAttrs(rows.map(row => {
        return { id: row.block_id, attrs: { bookmark: "" } as AttrType };
    }));
}

export async function addTodoBookmark(ids: string[]) {
    for (const id of ids) {
        const attr = await siyuan.getBlockAttrs(id);
        if (attr.bookmark == "🚩")
            await siyuan.setBlockAttrs(id, { bookmark: "" } as AttrType);
        else if (!attr.bookmark)
            await siyuan.setBlockAttrs(id, { bookmark: "🚩" } as AttrType);
    }
}
