// agentqa □3 对话持久化·纯逻辑层（无 runes，可单测）：按文档分线程存 localStorage。
// 线程模型：key=文档 id（空=_global 全局线程）；值={msgs 文本对, draft, used 时间戳}。
// 容量防线三层：单条正文截断 / 每线程尾部条数 / 总线程数 LRU+序列化体积淘汰（防 5MB 爆）。
// 只存已完成文本对（role+content+docTitle）——工具卡/思考过程/撤销快照是会话瞬态，不落盘。
// 多窗口并发写=last-write-wins（拍板可接受，不做锁）；JSON 损坏=逐线程校验丢弃不炸面板。

export interface StoredMsg {
    role: "user" | "assistant";
    content: string;
    docTitle?: string;
}
export interface StoredThread {
    msgs: StoredMsg[];
    draft?: string;
    used: number;
}

export const THREADS_KEY = "sy-tomato-plugin/agent/threads";
export const GLOBAL_THREAD = "_global";
/** 单条正文持久化截断（再长的回答 UI 看尾、AI 滑窗取尾，头截无害） */
export const MSG_CHAR_CAP = 8000;
/** 每线程尾部留存条数 */
export const MSG_CAP = 50;
/** 线程总数 LRU 上限 */
export const THREAD_CAP = 16;
/** 序列化体积软顶（字符数），超了从最旧线程开始甩 */
const SIZE_CAP = 2_000_000;

export function threadKeyOf(docID: string): string {
    const k = (docID ?? "").trim();
    return k || GLOBAL_THREAD;
}

/** 读+逐线程校验：单线程坏只丢该线程；整体 JSON 坏=空表重来 */
export function loadThreads(ls: Storage | null | undefined): Record<string, StoredThread> {
    if (!ls) return {};
    let raw: string | null = null;
    try {
        raw = ls.getItem(THREADS_KEY);
    } catch { return {}; }
    if (!raw) return {};
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch { return {}; }
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: Record<string, StoredThread> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        const t = validThread(v);
        if (t) out[k] = t;
    }
    return out;
}

function validThread(v: unknown): StoredThread | null {
    if (typeof v !== "object" || v === null) return null;
    const t = v as Record<string, unknown>;
    if (!Array.isArray(t.msgs)) return null;
    const msgs: StoredMsg[] = [];
    for (const m of t.msgs) {
        if (typeof m !== "object" || m === null) continue;
        const { role, content } = m as Record<string, unknown>;
        if ((role === "user" || role === "assistant") && typeof content === "string") {
            msgs.push({ role, content, docTitle: typeof m.docTitle === "string" ? m.docTitle : undefined });
        }
    }
    // 空壳线程（无消息无草稿）不进内存——下次落盘自然甩掉（启动期 _global 噪音自愈）
    if (!msgs.length && typeof t.draft !== "string") return null;
    return { msgs, draft: typeof t.draft === "string" ? t.draft : undefined, used: Number(t.used) || 0 };
}

/** 完成消息 → 持久形态（截断+剥瞬态字段）；空内容不落盘（历史过滤器本就不喂 AI） */
export function msgToStored(m: { role: "user" | "assistant"; content: string; docTitle?: string }): StoredMsg | null {
    const content = (m.content ?? "").slice(0, MSG_CHAR_CAP);
    if (!content.trim()) return null;
    return { role: m.role, content, docTitle: m.docTitle };
}

export function trimThreadMsgs(msgs: StoredMsg[]): StoredMsg[] {
    return msgs.length > MSG_CAP ? msgs.slice(msgs.length - MSG_CAP) : msgs;
}

/** 落盘：LRU 截线程数 → 体积软顶甩最旧 → quota 异常再甩一半重试一次；失败静默（debugLog 在调用层） */
export function saveThreads(ls: Storage | null | undefined, map: Record<string, StoredThread>): boolean {
    if (!ls) return false;
    let pool = { ...map };
    // LRU：按 used 降序留 THREAD_CAP 条
    let keys = Object.keys(pool).sort((a, b) => (pool[b].used ?? 0) - (pool[a].used ?? 0));
    if (keys.length > THREAD_CAP) {
        const keep = new Set(keys.slice(0, THREAD_CAP));
        for (const k of keys) if (!keep.has(k)) delete pool[k];
    }
    const shedOldest = () => {
        keys = Object.keys(pool).sort((a, b) => (pool[b].used ?? 0) - (pool[a].used ?? 0));
        if (keys.length > 1) delete pool[keys[keys.length - 1]];
    };
    let json = JSON.stringify(pool);
    while (json.length > SIZE_CAP && Object.keys(pool).length > 1) {
        shedOldest();
        json = JSON.stringify(pool);
    }
    try {
        ls.setItem(THREADS_KEY, json);
        return true;
    } catch {
        // quota：甩一半再试一把（丢历史优于炸聊天）
        keys = Object.keys(pool).sort((a, b) => (pool[b].used ?? 0) - (pool[a].used ?? 0));
        for (const k of keys.slice(Math.ceil(keys.length / 2))) delete pool[k];
        try {
            ls.setItem(THREADS_KEY, JSON.stringify(pool));
            return true;
        } catch {
            return false;
        }
    }
}
