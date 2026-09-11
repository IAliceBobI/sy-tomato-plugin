// 领域知识/Skill 上下文注入（agentrev □4，bear ③④ 拍板）：领域知识=直接披露（全文常驻
// 随 system 注入）、Skill=渐进披露（只注名字+简介，全文由 skills 工具按需拉）。
// 纯逻辑层：IO（SQL 标题反查/块全文读）全注入，不 import siyuan/Svelte——单测直跑（agentLoop 同款分层）。

export interface DocSnapshot {
    id: string;
    /** SQL 反查的文档标题；查无=空串（注入段回退 id 截断） */
    title: string;
    /** kramdown 全文（超 KNOWLEDGE_DOC_LIMIT 已截断） */
    text: string;
    /** false=读取失败（文档已删/移动/网络错）——注入段降级为占位行，不炸整段 */
    ok: boolean;
    truncated: boolean;
}

/** 单篇领域知识注入上限（字符）：与当前文档快照（默认 12000、agentqa □4 起可配）同款截断策略，上限放宽一档（用户点名挑选的资料） */
export const KNOWLEDGE_DOC_LIMIT = 16000;
/** Skill 简介截断（字符） */
export const SKILL_BRIEF_LIMIT = 160;

// agentqa □4 上下文治理（bear 拍板 B 参数可配）：历史滑窗+当前文档快照长度的默认值与钳位。
// 历史值语义=含当问总条数（下限 2=至少当问+1 条过往）；领域知识 16k/每篇不做可配（内部实现细节）。
export const HISTORY_MSGS_DEFAULT = 8;
export const HISTORY_MSGS_MIN = 2;
export const HISTORY_MSGS_MAX = 40;
export const DOC_SNAPSHOT_DEFAULT = 12000;
export const DOC_SNAPSHOT_MIN = 2000;
export const DOC_SNAPSHOT_MAX = 50000;

/** 历史滑窗取值：空/坏值（null/undefined/空串/NaN/0）回默认 8，钳 2~40；number input 的字符串数值也吃 */
export function clampHistoryMsgs(v: unknown): number {
    const n = Math.round(Number(v) || HISTORY_MSGS_DEFAULT);
    return Math.min(HISTORY_MSGS_MAX, Math.max(HISTORY_MSGS_MIN, n));
}

/** 文档快照长度取值（字符）：空/坏值回默认 12000，钳 2000~50000 */
export function clampDocSnapshotLimit(v: unknown): number {
    const n = Math.round(Number(v) || DOC_SNAPSHOT_DEFAULT);
    return Math.min(DOC_SNAPSHOT_MAX, Math.max(DOC_SNAPSHOT_MIN, n));
}

/** 历史窗口挑选（纯函数供单测）：过滤进行中/空消息后取尾 n-1 条为过往对话（n=含当问总条数，
 *  当问由调用侧随后补上）；n=8 与旧内联 filter+slice(-8,-1) 逐字节等价 */
export function pickHistoryMsgs<T extends { status?: string; content: string }>(msgs: readonly T[], n: number): T[] {
    return msgs.filter(m => !m.status && m.content.trim()).slice(-n, -1);
}

export interface DocFetchers {
    /** 批量标题反查（blocks 表文档行 content=标题）；失败抛异常由 fetchDocSnapshots 兜 */
    titles(ids: string[]): Promise<Record<string, string>>;
    /** 按文档 id 读全文 kramdown */
    kramdown(id: string): Promise<string>;
}

/** SQL in 列表的字面量拼接（id 含单引号会破坏语句——统一转义；id 来自自家设置与索引库，非用户自由文本面） */
export function sqlInList(ids: string[]): string {
    return ids.map(id => `'${id.replace(/'/g, "''")}'`).join(",");
}

export async function fetchDocSnapshots(ids: string[], f: DocFetchers): Promise<DocSnapshot[]> {
    const uniq = [...new Set(ids.filter(Boolean))];
    if (!uniq.length) return [];
    let titleMap: Record<string, string> = {};
    try {
        titleMap = await f.titles(uniq) ?? {};
    } catch {
        // 标题反查整批失败不致命：逐文档回退 id 截断
    }
    return Promise.all(uniq.map(async id => {
        const title = String(titleMap[id] ?? "");
        try {
            const raw = ((await f.kramdown(id)) ?? "").trim();
            const truncated = raw.length > KNOWLEDGE_DOC_LIMIT;
            return { id, title, text: truncated ? raw.slice(0, KNOWLEDGE_DOC_LIMIT) : raw, ok: true, truncated };
        } catch {
            return { id, title, text: "", ok: false, truncated: false };
        }
    }));
}

/** 简介提炼：剥 IAL 属性行（{: id="…"} 纯噪音）与标题井号前缀，空白折叠后截断 */
export function briefOf(text: string): string {
    const s = text
        .split("\n")
        .filter(l => !/^\s*\{:.*\}\s*$/.test(l))
        .map(l => l.replace(/^\s*#+\s*/, "").trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    return s.length > SKILL_BRIEF_LIMIT ? s.slice(0, SKILL_BRIEF_LIMIT) + "…" : s;
}

/** 领域知识 system 段（直接披露：全文常驻）；空列表回空串=零注入 */
export function buildKnowledgeSection(snaps: DocSnapshot[]): string {
    if (!snaps.length) return "";
    const body = snaps.map(s => {
        const name = s.title || s.id.slice(0, 21);
        if (!s.ok) return `### ${name}\n（读取失败：文档可能已删除或移动）`;
        return `### ${name}\n${s.text || "（空文档）"}`
            + (s.truncated ? "\n（全文超长已截断仅前半部分；需要余下内容时用 read 工具按本文档 id 拉取）" : "");
    }).join("\n\n");
    return `## 领域知识（用户挑选的资料——与用户问题相关时优先依据它们作答）\n${body}`;
}

/** Skill system 段（渐进披露：只注名字+简介，全文走 skills 工具）；无可用 Skill 回空串 */
export function buildSkillSection(snaps: DocSnapshot[]): string {
    const okSnaps = snaps.filter(s => s.ok && (s.title || s.text));
    if (!okSnaps.length) return "";
    const lines = okSnaps.map(s => {
        const name = (s.title || s.id).replace(/\s+/g, " ").trim();
        return `- ${name}：${briefOf(s.text)}`;
    });
    return `## 技能（用户挑选的 Skill，此处仅名字与简介）\n`
        + `回答涉及以下技能主题的问题时，先调 skills 工具（name 参数=技能名）拉取全文再答：\n${lines.join("\n")}`;
}
