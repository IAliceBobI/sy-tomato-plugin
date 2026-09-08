// □1（3.8.3 升级战役）批注 AI 讨论区落盘自定义块——纯函数层。
// 设计拍板（handoff 2026-09-07-1941 □1 五分叉）：
// - 双层卡：content=单行 JSON（note 压缩笔记层 + msgs 完整讨论层）；render 默认显笔记、
//   点击展开讨论；旧版内核回退 <pre> 显原文（官方 renderFallback 已兜）
// - 门禁 A'：沉淀免费（note 缺省=纯讨论档案卡）；压缩层跟 Pro（无 Pro 不产笔记层）
// - 命名：块类型 anno-chat，围栏 ;;;sy-tomato-plugin/anno-chat；无存量兼容负担
// 内核契约（09-08 rpcard 契约测试修订）：content 中途裸 ;;; 行=静默截断非拒写（code 0、内容截到该行）——
// JSON.stringify 单行天然满足（换行转义为字面 \n）；blockId=宿主 [data-node-id]（content 元素自身无）。
import type { AnnoChatMsg } from "./annoChat";

export const ANNO_CHAT_BLOCK_TYPE = "anno-chat";
export const ANNO_CHAT_FENCE = ";;;sy-tomato-plugin/anno-chat";

/** 落盘消息（讨论层快照）：丢 time/prompt/roleKey（回放只需角色名+内容+方向） */
export interface AnnoChatBlockMsg {
    role: "user" | "assistant";
    /** assistant 的显示名（质疑者/联系者/AI/记录员），user 不带 */
    name?: string;
    content: string;
}

export interface AnnoChatBlockData {
    v: 1;
    /** 压缩笔记层（记录员 markdown，≤5 条列表）；缺省=纯讨论档案卡（无 Pro 档） */
    note?: string;
    msgs: AnnoChatBlockMsg[];
    /** 被批注源块 id（插块锚点=源块正下方；溯源用） */
    hostID: string;
    ts: number;
}

/** content 不得含裸 ;;; 行（中途出现即静默截断）——洗 note/消息里的围栏样式字符以防意外 */
const sanitize = (s: string): string => s.replaceAll("‸", "");

export function buildAnnoChatContent(data: AnnoChatBlockData): string {
    const clean: AnnoChatBlockData = {
        v: 1,
        msgs: data.msgs.map((m) => ({
            role: m.role,
            ...(m.role === "assistant" && m.name ? { name: m.name } : {}),
            content: sanitize(m.content),
        })),
        hostID: data.hostID,
        ts: data.ts,
    };
    if (data.note && data.note.trim()) clean.note = sanitize(data.note);
    return JSON.stringify(clean);
}

export function buildAnnoChatBlockMD(content: string): string {
    return `${ANNO_CHAT_FENCE}\n${content}`;
}

/** 容错解析：坏 JSON/版本不符/结构不对 → null（渲染层显占位）；msgs 逐条洗脏数据 */
export function parseAnnoChatContent(content: string): AnnoChatBlockData | null {
    let raw: unknown;
    try {
        raw = JSON.parse(content);
    } catch {
        return null;
    }
    if (typeof raw !== "object" || raw === null) return null;
    const o = raw as Record<string, unknown>;
    if (o.v !== 1) return null;
    if (!Array.isArray(o.msgs) || typeof o.hostID !== "string") return null;
    const msgs: AnnoChatBlockMsg[] = [];
    for (const m of o.msgs) {
        if (typeof m !== "object" || m === null) continue;
        const r = m as Record<string, unknown>;
        if (r.role !== "user" && r.role !== "assistant") continue;
        if (typeof r.content !== "string") continue;
        msgs.push({
            role: r.role,
            ...(r.role === "assistant" && typeof r.name === "string" ? { name: r.name } : {}),
            content: r.content,
        });
    }
    const data: AnnoChatBlockData = { v: 1, msgs, hostID: o.hostID, ts: typeof o.ts === "number" ? o.ts : 0 };
    if (typeof o.note === "string" && o.note.trim()) data.note = o.note;
    return data;
}

/** 历史里最后一条记录员笔记（沉淀时「已有笔记则复用」判据） */
export function latestRecorderNote(msgs: AnnoChatMsg[]): string | undefined {
    let note: string | undefined;
    for (const m of msgs) {
        if (m.role === "assistant" && m.roleKey === "recorder" && m.content.trim()) note = m.content;
    }
    return note;
}

/** 快照软顶（评审 P2-1）：内存缓存无界（pushChat 不截断+globalThis 到重启），跨天累积百条时
 *  单块 data-content 可到数百 KB（DOM 属性+.sy+undo 栈三处放大）。保最近条数+总字符预算，
 *  超限头部丢弃补省略行（完整讨论层的拍板在常规量级下不受影响） */
const SNAPSHOT_MAX_MSGS = 100;
const SNAPSHOT_CHAR_BUDGET = 64 * 1024;
const SNAPSHOT_OMIT_MSG: AnnoChatBlockMsg = { role: "user", content: "（更早讨论已省略）" };

/** 内存历史 → 落盘快照（丢 time/prompt/roleKey；user 不带 name；软顶截断见上） */
export function toBlockMsgs(msgs: AnnoChatMsg[]): AnnoChatBlockMsg[] {
    const all = msgs.map((m) => ({
        role: m.role,
        ...(m.role === "assistant" && m.name ? { name: m.name } : {}),
        content: m.content,
    }));
    if (all.length <= SNAPSHOT_MAX_MSGS && all.reduce((s, m) => s + m.content.length, 0) <= SNAPSHOT_CHAR_BUDGET) {
        return all;
    }
    // 从尾部倒收（最新优先），双顶（条数+字符）先触先止；有丢弃则头部补省略行
    const kept: AnnoChatBlockMsg[] = [];
    let budget = SNAPSHOT_CHAR_BUDGET;
    for (let i = all.length - 1; i >= 0; i--) {
        const c = all[i].content.length;
        if (kept.length >= SNAPSHOT_MAX_MSGS || budget - c < 0) break;
        budget -= c;
        kept.unshift(all[i]);
    }
    if (kept.length > 0 && kept[0] !== all[0]) kept.unshift({ ...SNAPSHOT_OMIT_MSG });
    return kept;
}

export interface AnnoNoteLine {
    type: "li" | "p" | "gap";
    text?: string;
}

/** 笔记层 markdown 简渲染数据层（渲染器消费）：记录员输出=≤5 条 markdown 列表，
 *  列表行（短横线、星号、数字点 开头）→ li、普通行 → p、空行 → gap；不引完整 markdown 引擎（快照只读） */
export function renderNoteLines(note: string): AnnoNoteLine[] {
    return note.split(/\r\n|\r|\n/).map((line): AnnoNoteLine => {
        const t = line.trim();
        if (!t) return { type: "gap" };
        const li = /^([-*]|\d{1,3}[.)])\s+(.*)$/.exec(t);
        if (li) return { type: "li", text: li[2] };
        return { type: "p", text: t };
    }).filter((l, i, arr) => !(l.type === "gap" && (i === 0 || i === arr.length - 1 || arr[i - 1]?.type === "gap")));
}
