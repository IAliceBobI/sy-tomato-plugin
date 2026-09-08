import { sleep } from "stonev5-utils";
import { tomatoI18n } from "../tomatoI18n";
import { events } from "./Events";
import { BUILTIN_DECK_ID, CUSTOM_RIFF_DECKS } from "./gconst";
import { debugLog } from "./logUtils";
import { deleteBlock, getAttribute, isValidNumber, siyuan, timeUtil } from "./utils";

export async function removeDocCards(docID: string) {
    if (!docID) return;
    const ids = (await siyuan.sql(`select block_id as id from attributes 
        where name="${CUSTOM_RIFF_DECKS}"
        and root_id="${docID}"
        limit 30000
    `)).map(row => row.id);
    await siyuan.removeRiffCards(ids);
}

// □7 推迟时长显示单位阶梯化（spreaddelay 战役，2026-09-07 拍板）：大值小时读感差
// （2900 小时），贪心升档为高档单位。unit 与 tomatoI18n 单位词键同名，i18n 层直查。
export type DurationUnit = "分钟" | "小时" | "天" | "月" | "年";

// 月按 30 天、年按 365 天简化算；「能有高的单位就用高的」= 从高到低取第一个换算值 ≥1 的档
export function ladderDuration(hours: number): { value: string, unit: DurationUnit } {
    if (!isFinite(hours) || hours <= 0) return { value: "0", unit: "分钟" };
    const units: [DurationUnit, number][] = [
        ["年", 365 * 24],
        ["月", 30 * 24],
        ["天", 24],
        ["小时", 1],
        ["分钟", 1 / 60],
    ];
    for (const [unit, per] of units) {
        const v = hours / per;
        if (v >= 1) {
            // 一位小数四舍五入去尾零（4.03 月→4、100h→4.2 天）
            return { value: String(Math.round(v * 10) / 10), unit };
        }
    }
    return { value: "0", unit: "分钟" };
}

// 本地化时长串（「4 月」/"4 months"）：单位词走 tomatoI18n 同名键；CJK 语系无空格拼接
export function durationText(hours: number): string {
    const { value, unit } = ladderDuration(hours);
    const lang = tomatoI18n.lang;
    return lang === "zh_CN" || lang === "zh_CHT" || lang === "ja_JP"
        ? `${value}${tomatoI18n[unit]}`
        : `${value} ${tomatoI18n[unit]}`;
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
        try {
            await siyuan.pushMsg(tomatoI18n.开始执行)
            await siyuan.batchSetBlockAttrs(blocks.map((b, idx) => {
                const newAttrs = {} as AttrType;
                if (numDays <= 0) {
                    newAttrs["custom-card-priority-stop"] = "";
                    // 书签已退役（2026-09-07 拍板）不再写入，恢复仍清 bookmark 兜底：
                    // 多端同步下旧版插件推迟的卡会把书签同步回来，恢复时顺手自愈
                    newAttrs.bookmark = "";
                } else {
                    let datetimeStr: string;
                    if (spread) {
                        datetimeStr = timeUtil.dateFormat(timeUtil.now(spreadByDays(idx) * 24 * 60 * 60));
                    } else {
                        datetimeStr = timeUtil.dateFormat(timeUtil.now(numDays * 24 * 60 * 60));
                    }
                    newAttrs["custom-card-priority-stop"] = datetimeStr;
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
            await siyuan.pushMsg(tomatoI18n.推迟x个闪卡y时长(blocks.length, durationText(numDays * 24)));
        } catch (err) {
            // 大批量两步（写块属性/批量改期）中途断网或超时会停在半完成态（标记写了 due
            // 没改，或反之）——恢复链路按块属性扫可自愈；此处告知用户+Loki 打点留痕，
            // 再上抛给调用方（命令通道有自己的兜底语境）
            debugLog("CardBox", `doStopCards 失败（可能半完成）: ${err}`, "cardbox");
            await siyuan.pushMsg(tomatoI18n.推迟闪卡失败请重试);
            throw err;
        }
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

export async function pressSkip() {
    if (showCardAnswer()) await sleep(300);
    // 官方复习界面按窗口宽度渲染两套 .card__action 布局（隐藏套里同样有 -3 跳过钮）——
    // 文档序盲取第一个会拿到隐藏钮，click 无效（cardrenew □4 e2e 实锤：count 不动）。
    // 可见候选优先，全隐兜底原值（无复习界面时维持原语义）
    const btnSkip = ([...document.body.querySelectorAll('button[data-type="-3"]')] as HTMLButtonElement[])
        .find(b => b.offsetParent !== null)
        ?? document.body.querySelector('button[data-type="-3"]') as HTMLButtonElement;
    if (btnSkip) {
        btnSkip.click();
        return true;
    }
    return false;
}

// 复习界面删卡统一通道：必须先跳过翻页再删卡删块——内核 2026-08-14 起（f2800e2da）
// 校验块存在性，先删块会让后续 removeRiffCards/skipReviewRiffCard 报「不存在符合条件的内容块」。
// skip 后需等官方 skipReviewRiffCard 落地再删卡，避免两请求竞态撞同一校验。
export async function skipThenRemoveCards(blockID: string, delBlock = false) {
    await pressSkip();
    await sleep(400);
    await siyuan.removeRiffCards([blockID]);
    if (delBlock) {
        await deleteBlock(blockID);
    }
}

export async function getRestCards() {
    // 全量取卡（2026-09-07 健壮性修复）：原通道 getRiffDueCards 的 cards 受每日新卡/复习
    // 上限过滤（内核 getDeckDueCards 限额），积压>限额时「分散推迟」只推限额子集=静默
    // 漏卡（推不完的第二天照常冒出，toast 数量看起来还正常）。改走 getRiffCardsAll 分页
    // 全量 + 到期过滤，显式限定 builtin deck（官方复习队列语义；deckID 空串=全部卡
    // 含自建卡包，范围过大）。
    // 到期判定必须逐块取当下时刻：New 态未调度卡（reps=0）的 due 是内核响应时动态
    // 生成的 now 而非静态存储值（e2e 实锤：同一卡两次响应 due 微秒互异），若在请求前
    // 取一次 now 比较，动态 due 恒晚于它=新卡恒漏（判定串 18F 零收卡）；判定发生在
    // await 响应之后，逐块取时刻则动态 due≤判定时刻恒成立。已评分卡 due 必在未来
    // （FSRS 间隔）、已改期卡为静态值，均天然不受影响，无需快照比 state。
    // 一块多卡按块去重（同块多张卡由 batchSetRiffCardsDueTimeByBlockID 展开为同 due）
    const all = await siyuan.getRiffCardsAllFlat(undefined, BUILTIN_DECK_ID);
    const byBlock = new Map<string, GetCardRetBlock>();
    for (const b of all) {
        if (b.riffCard && new Date(b.riffCard.due) <= new Date()) byBlock.set(b.id, b);
    }
    const ret = [...byBlock.values()].map(b => {
        return { ial: { id: b.id } } as unknown as GetCardRetBlock;
    });
    debugLog("CardBox", `getRestCards: 全量 ${all.length} 张、到期去重 ${ret.length} 块`, "cardbox");
    return ret;
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

