// agent-script 固化块（ai-agent □6 固化仓库·命令档）：AI 现场写的 JS 存成笔记 custom 块，
// 插件加载时扫仓库文档注册成命令（点名触发零常驻）。格式抄 annoChatBlock 契约：
// 围栏 ;;;sy-tomato-plugin/agent-script；content=单行 JSON（JSON.stringify 换行转义=天然无裸 ;;; 行）。
// 纯函数层零 DOM——build/parse 可单测（tests/unit/agentDiff.test.ts 同文件钉死往返）。
import { siyuan } from "./utils";

export const AGENT_SCRIPT_BLOCK_TYPE = "agent-script";
export const AGENT_SCRIPT_FENCE = ";;;sy-tomato-plugin/agent-script";
/** 固化仓库文档标题（首用自动创建于默认笔记本根） */
export const AGENT_SCRIPT_DOC_TITLE = "AI 助手脚本仓库";

export interface AgentScriptData {
    v: 1;
    /** 命令面板显示名（用户可改块内 JSON） */
    name: string;
    /** JS 源码（run_js 同一执行面：前端 window 域 new Function） */
    code: string;
    ts: number;
}

/** content 不得含裸 ;;; 行——洗源码里的围栏样式字符防意外截断（annoChatBlock sanitize 同款） */
const sanitize = (s: string): string => s.replaceAll("‸", "");

export function buildAgentScriptContent(data: AgentScriptData): string {
    const clean: AgentScriptData = {
        v: 1,
        name: sanitize(data.name),
        code: sanitize(data.code),
        ts: data.ts,
    };
    return `${AGENT_SCRIPT_FENCE}\n${JSON.stringify(clean)}\n;;;`;
}

// ---- agentrev □5 提示词固化块：同机制第二物种（脚本=AI 写的 JS；提示词=用户存的指令文本）。
// 命令零常驻（bear ⑤「提示词其实就是 command，它不进入上下文」）：块只作存储，命令回调
// 触发时现读注入面板会话，不占 system。
export const AGENT_PROMPT_BLOCK_TYPE = "agent-prompt";
export const AGENT_PROMPT_FENCE = ";;;sy-tomato-plugin/agent-prompt";
/** 提示词仓库文档标题（设置卡首用自动创建于默认笔记本根，与脚本仓库分档） */
export const AGENT_PROMPT_DOC_TITLE = "AI 助手提示词仓库";

export interface AgentPromptData {
    v: 1;
    /** 命令面板显示名（用户可改块内 JSON） */
    name: string;
    /** 提示词正文（触发时作为用户消息注入面板会话） */
    prompt: string;
    ts: number;
}

export function buildAgentPromptContent(data: AgentPromptData): string {
    const clean: AgentPromptData = {
        v: 1,
        name: sanitize(data.name),
        prompt: sanitize(data.prompt),
        ts: data.ts,
    };
    return `${AGENT_PROMPT_FENCE}\n${JSON.stringify(clean)}\n;;;`;
}

/** 从 custom 块 content 解析；非 JSON/缺字段回 null 不炸（与脚本块同款剥围栏行） */
export function parseAgentPromptContent(content: string): AgentPromptData | null {
    try {
        const raw = (content ?? "")
            .split("\n")
            .filter(l => l.trim() && !l.trim().startsWith(";;;"))
            .join("");
        const obj = JSON.parse(raw);
        if (obj && typeof obj === "object" && typeof obj.prompt === "string" && typeof obj.name === "string") {
            return { v: 1, name: obj.name, prompt: obj.prompt, ts: typeof obj.ts === "number" ? obj.ts : 0 };
        }
        return null;
    } catch {
        return null;
    }
}

/** 提示词仓库文档定位（写后立查索引延迟同脚本仓库，首建后立扫由调用方 sleep 兜） */
export async function findAgentPromptDocID(): Promise<string | null> {
    const rows = await siyuan.sql(
        `select id from blocks where type='d' and content='${AGENT_PROMPT_DOC_TITLE.replace(/'/g, "''")}' limit 1`,
    );
    return rows?.[0]?.id ?? null;
}

/** 从 custom 块 content（围栏内 JSON 行）解析；非 JSON/缺字段回 null 不炸 */
export function parseAgentScriptContent(content: string): AgentScriptData | null {
    try {
        // content 可能带围栏整块或裸 JSON 行（查询 SQL 取回的是 content 列），剥围栏行后取首个 JSON 行
        const raw = (content ?? "")
            .split("\n")
            .filter(l => l.trim() && !l.trim().startsWith(";;;"))
            .join("");
        const obj = JSON.parse(raw);
        if (obj && typeof obj === "object" && typeof obj.code === "string" && typeof obj.name === "string") {
            return { v: 1, name: obj.name, code: obj.code, ts: typeof obj.ts === "number" ? obj.ts : 0 };
        }
        return null;
    } catch {
        return null;
    }
}

/** 仓库文档定位：SQL 查 hpath 匹配（写后立查有索引延迟窗口——首建后立扫由调用方 sleep 兜） */
export async function findAgentScriptDocID(): Promise<string | null> {
    const rows = await siyuan.sql(
        `select id from blocks where type='d' and content='${AGENT_SCRIPT_DOC_TITLE.replace(/'/g, "''")}' limit 1`,
    );
    return rows?.[0]?.id ?? null;
}
