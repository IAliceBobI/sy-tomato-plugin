import { TEMP_CONTENT } from "./gconst";
import { siyuan } from "./utils";

export async function getBookIDByBlock(blockID: string) {
    const docRow = await siyuan.getDocRowByBlockID(blockID);
    return getBookID(docRow?.id);
}

/** 从分片标记属性值解析书 ID（progmark/book-writing 双形态，无标记返回空串）。
 *  与 getBookID 同一解析逻辑抽出（readpoint □2-B 书级清点 join 复用），改解析须两处同源 */
export function parseBookID(mark: string | undefined, writing: string | undefined): string {
    if (mark) {
        const last = mark.split(TEMP_CONTENT).pop().split("#").pop();
        return last.split(",")[0];
    }
    if (writing) {
        return writing.split("#")[0];
    }
    return "";
}

export async function getBookID(docID: string): Promise<{ bookID: string, pieceNum: number }> {
    const ret = { bookID: "", pieceNum: NaN } as Awaited<ReturnType<typeof getBookID>>;
    if (docID) {
        const attrs = await siyuan.getBlockAttrs(docID);
        ret.bookID = parseBookID(attrs["custom-progmark"], attrs["custom-book-writing"]);
        if (ret.bookID) {
            const mark = attrs["custom-progmark"];
            if (mark) {
                const last = mark.split(TEMP_CONTENT).pop().split("#").pop();
                ret.pieceNum = Number(last.split(",")[1]);
            } else {
                ret.pieceNum = parseInt(attrs["custom-book-writing"].split("#").pop(), 10);
            }
        }
    }
    return ret;
}
