import { Plugin } from "siyuan";
import { siyuan } from "./utils";
import { READINGPOINT } from "./gconst";
import { tomatoI18n } from "../tomatoI18n";
import { OpenSyFile2 } from "./docUtils";

export async function gotoBookmark(docID: string, plugin: Plugin) {
    const rows = await siyuan.sqlAttr(`select * from attributes where name='${READINGPOINT}' and root_id='${docID}'`);
    for (const row of rows) {
        await OpenSyFile2(plugin, row.block_id);
        break;
    }
    if (rows.length == 0) await siyuan.pushMsg(tomatoI18n.当前文档无书签, 2000);
}

export async function removeReadingPoint(docID: string) {
    const rows = await siyuan.sqlAttr(`select * from attributes where name='${READINGPOINT}' and root_id='${docID}'`);
    await siyuan.deleteBlocks(rows.map(row => row.block_id));
    await siyuan.removeRiffCards(rows.map(row => row.block_id));
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
