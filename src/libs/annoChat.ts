// □8 批注 AI 讨论区纯函数层（设计共识=handoff □8 拍板五决策）。
// 契约：
// - 消息模型 AnnoChatMsg：name=UI 显示名（可中文）；roleKey=API 侧 name，必须符合
//   ^[a-zA-Z0-9_-]{1,64}$（OpenAI name pattern，中文会被部分 provider 拒收）；
//   prompt 随 assistant 消息随身携带（缓存重开复用，不依赖角色表仍存在）
// - buildChatMessages：唯一 system=（角色 prompt 在前+上下文段在后）；上下文段固定
//   【原文】/【选区】/【批注】三行（选区仅选区级批注出现）；原文超 SOURCE_LIMIT 截断留标记；
//   历史超 HISTORY_LIMIT 滚掉最老；历史 assistant→name=roleKey、user 不带 name；末条恒为本次 user 输入
// - 对话缓存：内存级 Map（批注 id→消息数组），globalThis 跨模块代共享（防插件 reload 惰性换代的
//   跨代读取，annoDraft 登记簿同款手法）；插件重载不丢、思源重启自然清空；持久化拍板=不做
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface AnnoChatMsg {
    role: "user" | "assistant";
    /** UI 显示名（质疑者/联系者/自定义名/助手），user 消息不带 */
    name?: string;
    /** API 侧 name（skeptic/connector/custom-xxx），符合 OpenAI name pattern；user 不带 */
    roleKey?: string;
    /** 该 assistant 发言所用 system prompt（随身带，重开弹窗直接复用） */
    prompt?: string;
    content: string;
    time: number;
}

export interface AnnoChatCtx {
    /** 被批注块原文（纯文本，超限截断） */
    source: string;
    /** 批注正文（kramdown 原样，模型可读） */
    note: string;
    /** 选区级批注的选中文本（选区级才有） */
    sel?: string;
    /** 宿主文档 hpath（如 /读书/书名/章节；openEdit 时取，缺省不出段） */
    docTitle?: string;
    /** 宿主块前一个相邻块文本（超限截断；虚拟滚动未渲染则缺省） */
    prev?: string;
    /** 宿主块后一个相邻块文本（超限截断） */
    next?: string;
}

export interface AnnoRole {
    key: string;
    /** UI 显示名（内置角色走 i18nKey 解析，此字段为兜底中文） */
    name: string;
    i18nKey?: string;
    prompt: string;
    /** API 侧 name，缺省=key */
    roleKey?: string;
}

export const SOURCE_LIMIT = 2000;
export const HISTORY_LIMIT = 20;
/** 前后相邻块单侧上限（防上下文膨胀；handoff □3 拍板「各限几百字」） */
export const NEIGHBOR_LIMIT = 300;

export const ANNO_ROLES: AnnoRole[] = [
    {
        key: "skeptic",
        name: "质疑者",
        i18nKey: "质疑者",
        prompt:
            "你是质疑者。针对用户的批注与发言，找出最薄弱的环节，提出尖锐但建设性的质疑；直接指出问题，不要客套。如果用户的观点确实站得住脚，也要诚实承认并说明为什么。",
    },
    {
        key: "connector",
        name: "联系者",
        i18nKey: "联系者",
        prompt:
            "你是联系者。把用户的批注与其他领域、书中的其他概念、用户的既有知识联系起来，提供具体的跨领域联想和延伸，不要泛泛而谈。",
    },
];

export const RECORDER_PROMPT =
    "你是讨论记录员。压缩关于一段原文的多角色讨论成简洁读书笔记：只保留结论与关键洞察；『我』（用户）的发言代表我的立场优先保留；≤5 条 markdown 列表；不复述过程不客套。";

/** 简稳定 hash（djb2→36 进制）：自定义角色 key 由 prompt 决定，同 prompt 同 key */
function hash36(s: string): string {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(36);
}

/** 自定义角色显示名：提示词前 6 字（trim 后；超长补…；空/纯空白兜底「自定义」） */
export function customRoleName(prompt: string): string {
    const t = prompt.trim();
    if (!t) return "自定义";
    const head = Array.from(t).slice(0, 6).join("");
    return Array.from(t).length > 6 ? `${head}…` : head;
}

/** aiBoxPrompts 条目 → 可邀请的自定义角色（零新设置项拍板） */
export function customRole(prompt: string): AnnoRole {
    const t = prompt.trim() || "自定义";
    return { key: `custom-${hash36(t)}`, name: customRoleName(prompt), prompt: t, roleKey: `custom-${hash36(t)}` };
}

/** 上下文段：【文档】定位行（有 hpath 才出）；【原文】超限截断留标记；【选区】仅选区级出现；
 *  【前文】【后文】宿主块相邻块（各自 NEIGHBOR_LIMIT 截断，虚拟滚动未渲染时缺省不出段） */
function contextBlock(ctx: AnnoChatCtx): string {
    const parts: string[] = ["以下是用户正在阅读的原文和 TA 写的批注。"];
    if (ctx.docTitle) parts.push(`【文档】${ctx.docTitle}`);
    let src = ctx.source ?? "";
    if (src.length > SOURCE_LIMIT) src = src.slice(0, SOURCE_LIMIT) + "…（原文过长，已截断）";
    parts.push(`【原文】${src}`);
    if (ctx.sel) parts.push(`【选区】${ctx.sel}`);
    const nb = (t: string | undefined) =>
        !t ? "" : t.length > NEIGHBOR_LIMIT ? t.slice(0, NEIGHBOR_LIMIT) + "…（已截断）" : t;
    if (nb(ctx.prev)) parts.push(`【前文】${nb(ctx.prev)}`);
    if (nb(ctx.next)) parts.push(`【后文】${nb(ctx.next)}`);
    parts.push(`【批注】${ctx.note ?? ""}`);
    return parts.join("\n");
}

/** 历史 AnnoChatMsg → API messages（assistant 带 roleKey 作 name，user 不带） */
function historyToMessages(history: AnnoChatMsg[]): ChatCompletionMessageParam[] {
    return history.slice(-HISTORY_LIMIT).map((m) =>
        m.role === "user"
            ? { role: "user" as const, content: m.content }
            : { role: "assistant" as const, name: m.roleKey, content: m.content },
    );
}

/**
 * 构造一次发言请求：[system(角色 prompt+上下文)] + [截断后历史] + [本次 user 输入]。
 * role 缺省=助手（无角色 prompt，system 只有上下文段）。
 */
export function buildChatMessages(
    ctx: AnnoChatCtx,
    history: AnnoChatMsg[],
    input: string,
    role?: AnnoRole,
): ChatCompletionMessageParam[] {
    const sys = role?.prompt ? `${role.prompt}\n\n${contextBlock(ctx)}` : contextBlock(ctx);
    return [
        { role: "system", content: sys },
        ...historyToMessages(history),
        { role: "user", content: input },
    ];
}

/** 快捷邀请的 user 消息（模板 {r}=角色显示名；模板来自 i18n，默认中文） */
export function inviteMessage(roleName: string, tmpl = "请{r}对以上讨论发表看法"): AnnoChatMsg {
    return { role: "user", content: tmpl.replace("{r}", roleName), time: Date.now() };
}

/** 压缩成笔记请求：记录员 system + 截断后历史 + 压缩指令（指令模板来自 i18n） */
export function compressMessages(
    ctx: AnnoChatCtx,
    history: AnnoChatMsg[],
    cmd = "请把以上讨论压缩成读书笔记",
): ChatCompletionMessageParam[] {
    return [
        { role: "system", content: `${RECORDER_PROMPT}\n\n${contextBlock(ctx)}` },
        ...historyToMessages(history),
        { role: "user", content: cmd },
    ];
}

/** 对话缓存容器：globalThis 跨模块代共享（key 带随机后缀防撞） */
const CHAT_CACHE_REG = "tomatoAnnoChatCache_zZmqus5PtYRi";
type ChatCacheMap = Map<string, AnnoChatMsg[]>;

function chatCache(): ChatCacheMap {
    const g = globalThis as Record<string, unknown>;
    if (!(g[CHAT_CACHE_REG] instanceof Map)) g[CHAT_CACHE_REG] = new Map();
    return g[CHAT_CACHE_REG] as ChatCacheMap;
}

/** 取该批注的对话历史（活引用：重开弹窗回放用；勿在外部突变） */
export function chatHistoryOf(annoId: string): AnnoChatMsg[] {
    const m = chatCache();
    let arr = m.get(annoId);
    if (!arr) {
        arr = [];
        m.set(annoId, arr);
    }
    return arr;
}

/** 追加一条（流完成才调——失败/中断的半截不进历史，设计共识） */
export function pushChat(annoId: string, msg: AnnoChatMsg): void {
    chatHistoryOf(annoId).push(msg);
}

/** 清空该批注对话（删批注时由 Annotations 调用） */
export function clearChat(annoId: string): void {
    chatCache().delete(annoId);
}
