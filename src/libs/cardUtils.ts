import { tomatoI18n } from "../tomatoI18n";
import { events } from "./Events";
import { CUSTOM_RIFF_DECKS } from "./gconst";
import { getAttribute, isValidNumber, siyuan, timeUtil } from "./utils";

export async function removeDocCards(docID: string) {
    if (!docID) return;
    const ids = (await siyuan.sql(`select block_id as id from attributes 
        where name="${CUSTOM_RIFF_DECKS}"
        and root_id="${docID}"
        limit 30000
    `)).map(row => row.id);
    await siyuan.removeRiffCards(ids);
}

export async function doStopCards(days: string, blocks: GetCardRetBlock[], spread = false) {
    // if (spread) { // 通过代码使用的同学可以不用VIP
    //     if (!lastVerifyResult()) {
    //         await siyuan.pushMsg(tomatoI18n.此功能需要激活VIP)
    //     }
    // }
    if (!(blocks && blocks.length)) return;
    const numDays = Number(days);
    if (isValidNumber(numDays)) {
        function spreadByDays(idx: number) {
            return (idx + 1) * (numDays / blocks.length)
        }
        await siyuan.pushMsg(tomatoI18n.开始执行)
        await siyuan.batchSetBlockAttrs(blocks.map((b, idx) => {
            const newAttrs = {} as AttrType;
            if (numDays <= 0) {
                newAttrs["custom-card-priority-stop"] = "";
                newAttrs.bookmark = "";
            } else {
                let datetimeStr: string;
                if (spread) {
                    datetimeStr = timeUtil.dateFormat(timeUtil.now(spreadByDays(idx) * 24 * 60 * 60));
                } else {
                    datetimeStr = timeUtil.dateFormat(timeUtil.now(numDays * 24 * 60 * 60));
                }
                newAttrs["custom-card-priority-stop"] = datetimeStr;
                newAttrs.bookmark = "🛑 Suspended Cards";
            }
            newAttrs["custom-card-priority-id"] = b.ial.id;
            return { id: b.ial.id, attrs: newAttrs };
        }));

        await siyuan.batchSetRiffCardsDueTimeByBlockID(blocks.map((b, idx) => {
            let due: string;
            if (spread) {
                due = timeUtil.getYYYYMMDDHHmmss(timeUtil.nowts(spreadByDays(idx) * 24 * 60 * 60));
            } else {
                due = timeUtil.getYYYYMMDDHHmmss(timeUtil.nowts(numDays * 24 * 60 * 60));
            }
            return {
                id: b.ial.id,
                due,
            };
        }));

        setTimeout(() => {
            events.protyleReload();
        }, 500);
        await siyuan.pushMsg(tomatoI18n.推迟x个闪卡y天(blocks.length, days));
    }
}

export function showCardAnswer() {
    const btnSpace = document.body.querySelector('div.card__action:not(.fn__none) > button[data-type="-1"]') as HTMLButtonElement;
    if (btnSpace) {
        btnSpace.click();
        return true;
    }
    return false;
}

export function pressSkip() {
    const btnSkip = document.body.querySelector('button[data-type="-3"]') as HTMLButtonElement;
    if (btnSkip) {
        btnSkip.click();
        return true;
    }
    return false;
}

export async function getIDFromCard() {
    const blockInDocCard = document.querySelector(`div.card__main div[data-doc-type="NodeDocument"][custom-riff-decks] > div[data-node-id]`);
    const subBlockID = getAttribute(blockInDocCard as any, "data-node-id");
    let cardID = await siyuan.getDocIDByBlockID(subBlockID);

    if (!cardID) {
        const card = document.querySelector(`div.card__main div[data-node-id][custom-riff-decks]`);
        cardID = getAttribute(card as any, "data-node-id");
    }
    return cardID;
}

