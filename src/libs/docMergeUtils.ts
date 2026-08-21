// 文档合并/移动/元数据搬迁。从原 docUtils.ts 拆出（2026-08 重构），docUtils.ts 现为 re-export 桶。
import { siyuan } from "./utils";
import { CUSTOM_RIFF_DECKS } from "./gconst";
import { tomatoI18n } from "../tomatoI18n";

export function isMultiLineElement(md: string) {
    return md.startsWith("```")
        || md.startsWith("> ")
        || md.startsWith("$$")
        || md.startsWith("<div>")
        || md.startsWith("{{{row")
        || md.startsWith("{{{col");
}

export async function moveAllContentToDoc(tobeRmDocID: string, destDocID: string) {
    const ids = (await siyuan.getChildBlocks(tobeRmDocID)).map(b => b.id);
    await siyuan.moveBlocksAsChild(ids, destDocID);
}

export async function moveAllContentHere(tobeRmDocID: string, blockID: string) {
    if (!tobeRmDocID || !blockID) return [];
    const ids = (await siyuan.getChildBlocks(tobeRmDocID)).map(b => b.id);
    await siyuan.moveBlocksAfter(ids, blockID);
    return ids;
}

export async function mergeDocs(doc1: string, hereID: string) {
    if (!doc1 || !hereID) return;
    const doc2 = await siyuan.getDocIDByBlockID(hereID);
    doc1 = await siyuan.getDocIDByBlockID(doc1);
    if (!doc1 || !doc2) return;

    const newAttrs = await mergeMetaIntoDoc2(doc1, doc2);
    const oldAttrs = setDefaultAttr({} as any);
    oldAttrs.title = "moved";
    await siyuan.setBlockAttrs(doc1, oldAttrs); // clean doc1
    await siyuan.setBlockAttrs(doc2, newAttrs); // fulfill doc2
    await moveAllContentHere(doc1, hereID);
    await siyuan.flushTransaction();
    await siyuan.pushMsg(tomatoI18n.正在转移引用);
    await siyuan.transferBlockRef(doc1, doc2, false);
    await siyuan.pushMsg(tomatoI18n.正在尝试删除闪卡);
    await siyuan.removeRiffCards([doc1]);
    await siyuan.pushMsg(tomatoI18n.正在删除老文件);
    await siyuan.removeDocByID(doc1);
    window.location.reload();
}

async function mergeMetaIntoDoc2(doc1: string, doc2: string) {
    const newAttrs = setDefaultAttr(await siyuan.getBlockAttrs(doc2));
    const attrs = setDefaultAttr(await siyuan.getBlockAttrs(doc1));
    delete newAttrs.updated;
    delete newAttrs.id;
    delete newAttrs.scroll;

    const alias = [...newAttrs.alias.split(","), ...attrs.alias.split(","), attrs.name, attrs.title];
    newAttrs.alias = alias.filter(i => i.length > 0).join(",");
    if (!newAttrs.bookmark) {
        newAttrs.bookmark = attrs.bookmark;
    }
    if (!newAttrs.memo) {
        newAttrs.memo = attrs.memo;
    } else {
        if (attrs.memo) {
            newAttrs.memo += "；" + attrs.memo;
        }
    }

    for (const key in attrs) {
        if (key.startsWith("custom-")) {
            if (key == CUSTOM_RIFF_DECKS) continue;
            if (!newAttrs[key]) {
                newAttrs[key] = attrs[key];
            }
        }
    }
    return newAttrs;
}

function setDefaultAttr(attrs: AttrType) {
    if (!attrs.alias) attrs.alias = "";
    if (!attrs.name) attrs.name = "";
    if (!attrs.title) attrs.title = "";
    if (!attrs.memo) attrs.memo = "";
    if (!attrs.bookmark) attrs.bookmark = "";
    return attrs;
}
