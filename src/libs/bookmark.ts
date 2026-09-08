import { Plugin, Constants } from "siyuan";
import { siyuan, timeUtil } from "./utils";
import { READAT, READINGPOINT } from "./gconst";
import { tomatoI18n } from "../tomatoI18n";
import { OpenSyFile2 } from "./docUtils";
import { getBookID, parseBookID } from "./progressive";
import { readingAdd2Card } from "./stores";
import { mergeReadingPoints, siblingReadatBlocks, type RPEntry, type RPSQLRow, type RPRootAttrRow } from "./readingPointCore";
import { debugLog } from "./logUtils";

// 阅读点数据层（readpoint 战役重写，spec：docs/tomato-reading-point-spec.md）：
// 新模型=原文块直挂 custom-tomato-readat 属性（值=时间戳），每文档一个；老模型=超级块挂
// custom-tomato-readingpoint（值=bookID）惰性兼容——设/删时顺带清理（一次按键即迁移），不写迁移脚本。

/** 块所在文档的阅读点（新格式）：[{blockID, ts}] */
async function newPointsOfDoc(docID: string) {
    const rows = await siyuan.sqlAttr(`select block_id, value from attributes where name="${READAT}" and root_id="${docID}"`);
    return rows.map(r => ({ blockID: r.block_id, ts: r.value }));
}

/** 老格式清理目标：书级（value=bookID，目录文档集中存放也能命中）∪ 本文档内物理存放（插在原文后的） */
async function legacyPointIDsOfDoc(docID: string, bookID?: string) {
    const key = bookID ?? (await getBookID(docID)).bookID;
    const bookKey = key || docID;
    const rows = await siyuan.sqlAttr(
        `select block_id from attributes where name="${READINGPOINT}" and (value="${bookKey}" or root_id="${docID}") limit 10000000`,
    );
    return rows.map(r => r.block_id);
}

/** 同书其他分片文档的新格式阅读点块（一书一点老语义，readpoint □2-B 恢复）：渐进书/写作书
 *  任何分片设点都顶掉全书其他分片的点（bear 老版行为口述+git 461f4513~1 实锤）。
 *  全量查询必须尾置 limit：/api/query/sql 对无最外层 limit 的语句注入 Search.Limit=64 静默截尾
 *  （内核 sql.go，先例 siyuanApi.ts getDocRowsByName）——大库下一书一点悄悄失效 */
async function siblingReadatOf(docID: string, bookID?: string): Promise<string[]> {
    // 非书文档零 SQL 早退（getBookID=单文档属性查询；setReadingPoint 已查过时透传复用）
    if (bookID === undefined) bookID = (await getBookID(docID)).bookID;
    if (!bookID) return [];
    const [readatRows, markRows, writingRows] = await Promise.all([
        siyuan.sqlAttr(`select block_id, root_id from attributes where name="${READAT}" limit 10000000`) as Promise<RPRootAttrRow[]>,
        siyuan.sqlAttr(`select root_id, value from attributes where name="custom-progmark" limit 10000000`) as Promise<RPRootAttrRow[]>,
        siyuan.sqlAttr(`select root_id, value from attributes where name="custom-book-writing" limit 10000000`) as Promise<RPRootAttrRow[]>,
    ]);
    return siblingReadatBlocks(readatRows ?? [], markRows ?? [], writingRows ?? [], docID, parseBookID);
}

/** 制卡联动（readpoint □2-B 恢复）：设点=原文块入闪卡（默认 QUICK 牌组，与渐进制卡链同款
 *  复习入口一致）+ 立即评一次 Good + due=now——复习卡=「回原文继续读」的锚，这就是与渐进
 *  复习流的联动。清卡随开关（开关开=插件管理这批卡生命周期：设=加/顶=换/删=清；关=不碰卡）。
 *  ⚠️riff 3.9.0 v2 重写预警：此链 API 面临重构，升级须重验 */
async function addPointCard(blockID: string, ts: string) {
    if (!readingAdd2Card.get()) return;
    const added = await siyuan.addRiffCards([blockID]);
    // siyuan.call 吞 code!=0 返 null 不 throw：判 null 打失败点，不拖垮设点主链
    if (!added) {
        debugLog("rp_card_fail", `${blockID} addRiffCards null`, "readpoint");
        return;
    }
    debugLog("rp_card_add", blockID, "readpoint");
    // review 须等卡就绪（add 后立即评踩空，先例 addCardSetDueTime sleepMs=1000）；延迟尾链
    // fire-and-forget——不拖设点主链与 navigator.locks 锁
    setTimeout(() => {
        void (async () => {
            try {
                // Rating: 2=Hard（内核 Again=1/Hard=2/Good=3；老版同传 2，保持行为等价）
                await siyuan.reviewRiffCardByBlockID(blockID, 2);
                await siyuan.batchSetRiffCardsDueTimeByBlockID([{ id: blockID, due: ts }]);
                debugLog("rp_card_due", `${blockID} due=${ts}`, "readpoint");
            } catch (e) {
                console.error("[tomato][rp] addPointCard:", e);
                debugLog("rp_card_fail", `${blockID} ${String(e)}`, "readpoint");
            }
        })();
    }, 1000);
}

async function removePointCards(ids: string[]) {
    if (ids.length == 0 || !readingAdd2Card.get()) return;
    // deckID 必须显式限定 QUICK（默认 ""=跨全牌组删卡，会误删用户手动卡；老版即 QUICK 限定）
    const removed = await siyuan.removeRiffCards(ids, Constants.QUICK_DECK_ID);
    if (!removed) {
        debugLog("rp_card_fail", `${ids.join(",")} removeRiffCards null`, "readpoint");
        return;
    }
    debugLog("rp_card_remove", ids.join(","), "readpoint");
}

/** 设点：清同文档新格式旧属性+同书其他分片的点（一书一点）+同书老格式块 → 原文块挂
 *  readat=now（+制卡联动）。返回 false=块无效 */
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
    const { bookID } = await getBookID(docID);
    const legacyIDs = (await legacyPointIDsOfDoc(docID, bookID)).filter(id => id != blockID);
    await cleanLegacyPoints(legacyIDs);
    attrOps.pop();
    attrOps.push({ id: blockID, attrs: { [READAT]: ts, [READINGPOINT]: "" } as AttrType });
    // 书级唯一：同书其他分片的新格式点一并顶掉（同文档旧点已在 attrOps 里清）
    const siblings = (await siblingReadatOf(docID, bookID)).filter(id => id != blockID);
    for (const id of siblings) attrOps.push({ id, attrs: { [READAT]: "" } as AttrType });
    await siyuan.batchSetBlockAttrs(attrOps);
    // 制卡联动：新点入卡；被顶掉的旧点/兄弟点清卡（顺序在后：挂属性成功才算「点成立」）
    const displaced = olds.filter(o => o.blockID != blockID).map(o => o.blockID);
    debugLog("rp_set", `doc=${docID} block=${blockID} sibs=${siblings.length} displaced=${displaced.length}`, "readpoint");
    await removePointCards([...displaced, ...siblings]);
    await addPointCard(blockID, ts);
    return true;
}

/** 删块+删其闪卡（老格式阅读点块可能挂卡；老版即 QUICK 牌组限定，勿跨牌组误删手动卡）。
 *  顺序必须先删卡后删块：内核 ValidateFlashcardBlockIDs 校验块树，块已删则删卡报
 *  「不存在符合条件的内容块」静默失败→孤儿卡永久死锁（先例 cardUtils.ts skipThenRemoveCards） */
async function cleanLegacyPoints(ids: string[]) {
    if (ids.length == 0) return;
    await siyuan.removeRiffCards(ids, Constants.QUICK_DECK_ID);
    await siyuan.deleteBlocks(ids);
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

/** 删除当前文档的阅读点：新格式摘属性（+清卡），老格式删块+删卡 */
export async function removeReadingPoint(docID: string) {
    const rows = await newPointsOfDoc(docID);
    if (rows.length > 0) {
        await siyuan.batchSetBlockAttrs(rows.map(r => ({ id: r.blockID, attrs: { [READAT]: "" } as AttrType })));
        await removePointCards(rows.map(r => r.blockID));
    }
    await cleanLegacyPoints(await legacyPointIDsOfDoc(docID));
}

/** 面板列表：新老两查合并（排序/去重在 readingPointCore 纯函数层）。
 *  注意 attributes.id 是属性行自身 ID，目标块在 block_id 列（2026-09-05 e2e 实锤，join 错列全落空） */
export async function listReadingPoints(): Promise<RPEntry[]> {
    const [newRows, legacyRows] = await Promise.all([
        siyuan.sql(`select a.block_id, a.value, a.root_id, a.box, b.content, b.hpath from attributes a left join blocks b on a.block_id=b.id where a.name="${READAT}" limit 10000000`) as Promise<RPSQLRow[]>,
        siyuan.sql(`select a.block_id, a.value, a.root_id, a.box, b.content, b.hpath, b.updated from attributes a left join blocks b on a.block_id=b.id where a.name="${READINGPOINT}" limit 10000000`) as Promise<RPSQLRow[]>,
    ]);
    return mergeReadingPoints(newRows ?? [], legacyRows ?? []);
}

/** 面板单条删除：新点摘属性（+清卡）；老点删块+删卡 */
export async function deleteReadingPointEntry(e: RPEntry) {
    if (e.legacy) {
        await cleanLegacyPoints([e.blockID]);
    } else {
        await siyuan.setBlockAttrs(e.blockID, { [READAT]: "" } as AttrType);
        await removePointCards([e.blockID]);
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
