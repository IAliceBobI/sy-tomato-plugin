// □2 官方闪念速记吸收（dailynote-pipeline 战役 2026-09-06）：官方移动端速记（闪念速记）
// 经手机内核消费后落进笔记库中转文档（模式 B：ShorthandSavePath 日期模板=合并追加），
// 桌面端插件在 sync_end 把中转文档新块搬进日记管线（套 □1 收集块协议 v1）。
// 官方链路事实源：/opt/projects/siyuan/kernel/model/shortcuts.go（桌面内核不消费库外临时文件，
// 同步到桌面的已是笔记库文档 → 插件接力无竞争窗口）。
import { debugLog } from "./logUtils";
import { events } from "./Events";
import { collectBlockAttrs, lifelogAttrs, ymdFromCreated, LifeTag } from "./dailyCollect";
import { DomSuperBlockBuilder } from "./sydom";
import { coerceFlashBlockForm, relayBareEligible } from "./flashBlockForm";
import { siyuan, sleep } from "./utils";
import { flash_thoughts_2_top, flashBlockForm, flashStatTag, shorthandRelayEnabled, storeNoteBox_selectedNotebook } from "./stores";
import { tomatoI18n } from "../tomatoI18n";

/** 日记落点解析（NoteBox.getTargetID 注入——本模块不 import NoteBox：其 .svelte 依赖会
 *  炸 unit 测试链；同步签名 `(box) => Promise<docID | undefined>`） */
export type DailyTargetResolver = (box: string) => Promise<string>;

/** 块 created 时间戳（id 前 14 位）→ "HH:MM"；异常输入返回空串 */
export function hhmmFromCreated(created: string): string {
    if (!created || created.length < 12) return "";
    return `${created.slice(8, 10)}:${created.slice(10, 12)}`;
}

/** 顶层块按 id 前 14 位分条（内核 resetBlockIDsByTime 同条同刻铁证，getChildBlocks 无
 *  created 字段故取 id）；空内容块跳过（内核给搬空中转文档自动补占位空段，勿搬）；
 *  组间按刻升序复原输入序，组内保输入序；短 id 防御跳过 */
export function groupShorthandEntries(blocks: { id: string; content?: string }[]): { stamp: string; ids: string[] }[] {
    const byStamp = new Map<string, string[]>();
    for (const b of blocks) {
        const key = b.id?.slice(0, 14) ?? "";
        if (key.length < 14) continue;
        if (!b.content?.trim()) continue;
        const ids = byStamp.get(key);
        if (ids) ids.push(b.id);
        else byStamp.set(key, [b.id]);
    }
    return [...byStamp.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([stamp, ids]) => ({ stamp, ids }));
}

/** □3 落点 B：搬运条目的时间记录类型标记（落点 A 用面板所选类型，官方速记搬运恒「速记」） */
const RELAY_TAG_TYPE = "速记";

/** □3 落点 B：条目 → 时间记录标记入参（纯函数）。宿主=组内首个 type='p' 块（getChildBlocks
 *  的 type 为 SQL 短型 'p'，同 NoteBox firstParaBlock 判型）；content=条内全块内容空格
 *  join 后 trim；time/date 取记录时刻（stamp）——跨天搬运 date 须取记录日非搬运当天；
 *  组内无段落块（纯列表/代码条目）返回 undefined 不标记 */
export function relayEntryLifeTag(
    e: { stamp: string; ids: string[] },
    blocks: { id: string; type?: string; content?: string }[],
): { pID: string; tag: LifeTag } | undefined {
    const byId = new Map(blocks.map(b => [b.id, b]));
    const pID = e.ids.find(id => byId.get(id)?.type === "p");
    if (!pID) return undefined;
    return {
        pID,
        tag: {
            content: e.ids.map(id => byId.get(id)?.content ?? "").join(" ").trim(),
            type: RELAY_TAG_TYPE,
            time: hhmmFromCreated(e.stamp),
            date: ymdFromCreated(e.stamp),
        },
    };
}

const RELAY_LOCK = "tomato-shorthand-relay-lock-2026-09-06";

/** 搬运入口（手动命令 manual=true / sync_end 自动）：locks ifAvailable + 5s 冷却防抖；
 *  getTarget=日记落点解析（注入） */
export async function relayShorthands(manual: boolean, getTarget: DailyTargetResolver): Promise<void> {
    // □5 移动端守卫：官方速记搬运设计=移动端只写冷区中转文档、桌面端整理进日记；移动端
    // sync_end 也搬运=两端并发改日记→云端同步冲突丢内容（飞书用户实锤报障）。自动通道
    // 静默返回（移动端 sync_end 高频），手动通道给提示（守卫写法同 NoteBox moveFromQueue）
    if (events.isMobile) {
        if (manual) siyuan.pushMsg(tomatoI18n.官方速记搬运须在桌面端执行);
        return;
    }
    await navigator.locks.request(RELAY_LOCK, { ifAvailable: true }, async (lock) => {
        if (!lock) return;
        try {
            await relayOnce(manual, getTarget);
        } finally {
            await sleep(5000);
        }
    });
}

async function relayOnce(manual: boolean, getTarget: DailyTargetResolver): Promise<void> {
    const boxArg = storeNoteBox_selectedNotebook.getOr();
    const { box, path } = await siyuan.call("/api/filetree/getShorthandSavePath", { notebook: boxArg });
    debugLog("shorthand_relay", `savePath box=${box} path=${path} manual=${manual}`, "dailynote");
    if (!path) {
        // 官方模式 A（每条一独立文档）不属搬运范围：手动触发给引导，自动触发静默
        if (manual) siyuan.pushMsg(tomatoI18n.官方速记未配置合并路径);
        return;
    }
    const docIDs = await siyuan.getIDsByHPath(path, box);
    const docID = docIDs?.[0];
    if (!docID) return; // 今日中转文档未建 = 今日无速记

    const children = await siyuan.getChildBlocks(docID);
    const entries = groupShorthandEntries(children);
    if (entries.length === 0) return;

    const dayID = await getTarget(box);
    if (!dayID) return;

    // 条级容器（□1 协议 v1：idea-time=条输入时刻；ref-hpath 无源省略）。□4 落块形态跟随
    // 开关（fballfb 2026-09-21）：para/list 形态下「恰一块且为段落」的条目免壳直搬（块自身
    // 挂收集属性）；多块/非 p 条目维持 sb 收纳（裸形态装不下多块，壳对收纳必要——
    // relayBareEligible 纯函数，单测覆盖）。混合期（开关切换后旧 sb 条目与新裸条目并存）
    // 两组各自保序，组间按 wrapped→bare 分层
    const form = coerceFlashBlockForm(flashBlockForm.get());
    const typeOf = (id: string) => children.find(b => b.id === id)?.type;
    const bareEntries = entries.filter(e => relayBareEligible(form, e.ids, typeOf));
    const wrappedEntries = entries.filter(e => !bareEntries.includes(e));

    const builders = wrappedEntries.map(e => {
        const b = new DomSuperBlockBuilder();
        b.setAttrs(collectBlockAttrs(hhmmFromCreated(e.stamp)));
        return b;
    });
    let ops: any[] = [];
    if (flash_thoughts_2_top.get()) {
        // 头插：AsChildOf=插父块首（transXxx 内部 reverse 保正序）
        ops.push(...siyuan.transInsertBlocksAsChildOf(builders.map(b => b.html()), dayID));
    } else {
        const tailID = await siyuan.getDocLastID(dayID);
        if (tailID) ops.push(...siyuan.transInsertBlocksAfter(builders.map(b => b.html()), tailID));
        else ops.push(...siyuan.transInsertBlocksAsChildOf(builders.map(b => b.html()), dayID));
    }
    // 块挂进各自容器。transMoveBlocksAsChild 净契约（6808 双目标实证 2026-09-06 □7）：
    // 文档/superblock 容器两类目标内核均逐 op 前插，helper 内 reverse 恰好抵消——
    // 调用方传什么序落什么序，直接传 e.ids 正序；此前「容器目标走 InsertAfter 需传前
    // reverse」系误断（双重反转=容器内块序倒置，多块条目可复现）；容器 id 由前端生成
    // 随 insert DOM 落库保留（cardID 同款）
    wrappedEntries.forEach((e, i) => {
        ops.push(...siyuan.transMoveBlocksAsChild(e.ids, builders[i].id));
    });
    // □4 bare 条目直搬（无 sb 壳）：头插=整组一次 AsChild（净契约同上正序）；尾插=滚动
    // 锚逐条 After（锚=前一条末块，跟在 wrapped 末容器/文档尾块之后）
    if (bareEntries.length > 0) {
        if (flash_thoughts_2_top.get()) {
            ops.push(...siyuan.transMoveBlocksAsChild(bareEntries.flatMap(e => e.ids), dayID));
        } else {
            let anchor = builders.length > 0
                ? builders[builders.length - 1].id
                : await siyuan.getDocLastID(dayID);
            for (const e of bareEntries) {
                if (!anchor) break;
                ops.push(...siyuan.transMoveBlocksAfter(e.ids, anchor));
                anchor = e.ids[e.ids.length - 1] ?? anchor;
            }
            if (!anchor) ops.push(...siyuan.transMoveBlocksAsChild(bareEntries.flatMap(e => e.ids), dayID));
        }
    }
    await siyuan.transactions(ops);
    // □4 bare 条目属性挂块自身（事务后 setBlockAttrs，单条失败吞错留痕不阻断搬运主链）
    for (const e of bareEntries) {
        try {
            await siyuan.setBlockAttrs(e.ids[0], collectBlockAttrs(hhmmFromCreated(e.stamp)));
        } catch (err) {
            debugLog("shorthand_relay", `bare attrs fail stamp=${e.stamp}: ${err}`, "dailynote");
        }
    }
    // □3 落点 B：开关开时逐条补时间记录标记（与 □2 落点 A 同协议，生态四键识别面）。
    // 单条失败吞错留痕不阻断（搬运主链已成功，标记属锦上添花）；无段落块条目跳过
    if (flashStatTag.get()) {
        for (const e of entries) {
            try {
                const hit = relayEntryLifeTag(e, children);
                if (hit) await siyuan.setBlockAttrs(hit.pID, lifelogAttrs(hit.tag));
            } catch (err) {
                debugLog("flashlog", `relay tag fail stamp=${e.stamp}: ${err}`, "dailynote");
            }
        }
    }
    debugLog("shorthand_relay", `done doc=${docID} entries=${entries.length} blocks=${children.length}`, "dailynote");
    siyuan.pushMsg(tomatoI18n.已搬运速记到日记.replace("{n}", String(entries.length)));
}

/** sync_end 自动触发（插件官方 eventBus 事件名，Events.ts:32 同源）；开关关闭时零开销；
 *  getTarget=日记落点解析注入 */
export function bindShorthandRelay(
    plugin: { eventBus: { on: (t: string, cb: () => void) => void } },
    getTarget: DailyTargetResolver,
) {
    plugin.eventBus.on("sync-end", () => {
        if (!shorthandRelayEnabled.get()) return;
        void relayShorthands(false, getTarget);
    });
}
