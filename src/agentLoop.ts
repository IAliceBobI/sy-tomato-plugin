// 面板工具循环（ai-agent □5）：轻 agent 编排——AI 流式回复中出现 tool_calls 就直调
// A 层工具（createFrontendToolCaller）回灌再答，小循环上限熔断（设计共识②：不做重 Agent）。
// 纯逻辑层：不 import Svelte、不碰 DOM、零网络——createStream 与 caller 全注入，单测直跑。

import type { ChatCompletionChunk, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { ToolDefinition, ToolResponse } from "./libs/agentTools";

/** 与 openAI.ts createStream 返回同构的最小面（async iterable of chunk） */
export interface AgentStreamLike {
    [Symbol.asyncIterator](): AsyncIterableIterator<ChatCompletionChunk>;
}

/** A 层 ToolDefinition → openai chat.completions 的 tools 参数（剥 handler 只留 schema） */
export function toOpenAITools(defs: ToolDefinition[]) {
    return defs.map(d => ({
        type: "function" as const,
        function: {
            name: d.name,
            description: d.config.description,
            parameters: d.config.inputSchema,
        },
    }));
}

// ---- tool_calls 流式增量拼接（openai 协议：首块 id+name，后续块按 index 拼_arguments） ----

export interface ToolCallAccum {
    parts: Map<number, { id: string; name: string; args: string }>;
}
export function newToolCallAccum(): ToolCallAccum {
    return { parts: new Map() };
}

export interface PendingToolCall {
    id: string;
    name: string;
    args: string;
}

/** 喂一个 chunk；无 tool_calls 返回 calls=null（文本块），有则累计并回当前快照 */
export function appendToolCallDelta(acc: ToolCallAccum, chunk: ChatCompletionChunk): { acc: ToolCallAccum; calls: PendingToolCall[] | null } {
    const deltas = chunk.choices?.at(0)?.delta?.tool_calls;
    if (!deltas?.length) return { acc, calls: null };
    for (const tc of deltas) {
        const prev = acc.parts.get(tc.index) ?? { id: "", name: "", args: "" };
        acc.parts.set(tc.index, {
            id: prev.id + (tc.id ?? ""),
            name: prev.name + (tc.function?.name ?? ""),
            args: prev.args + (tc.function?.arguments ?? ""),
        });
    }
    const calls = [...acc.parts.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => ({ ...v }));
    return { acc, calls };
}

// ---- 循环编排 ----

export type AgentEvent =
    | { type: "text"; delta: string }
    | { type: "reasoning"; delta: string }
    | { type: "tool_call"; call: PendingToolCall; result: ToolResponse; ms: number }
    | { type: "done"; turns: number };

export interface AgentLoopResult {
    ok: boolean;
    error?: string;
    /** 完整消息链（含工具往返），UI 拿去入会话历史 */
    messages?: ChatCompletionMessageParam[];
}

export interface AgentLoopOptions {
    /** 注入流创建（复用 openAI.ts createStream 语义：失败回 undefined）；每轮调用一次。
     *  tools=openai tools 参数（首轮起每轮都带——AI 任何时候都可决定调工具） */
    createStream: (
        messages: ChatCompletionMessageParam[],
        tools: { type: "function"; function: any }[],
        signal?: AbortSignal,
    ) => Promise<AgentStreamLike | undefined>;
    /** 工具直调面（createFrontendToolCaller 产物）；抛异常由本层包成失败 ToolResponse */
    caller: { call: (name: string, input: Record<string, any>) => Promise<ToolResponse> };
    /** 暴露给 AI 的工具集（ToolCaller.tools 原样传入，本层负责转 openai 参数形态） */
    tools: ToolDefinition[];
    /** 初始消息（含 system+历史+本次提问） */
    messages: ChatCompletionMessageParam[];
    signal?: AbortSignal;
    /** 工具轮上限（默认 4）：AI 连续只调工具不收尾时熔断 */
    maxTurns?: number;
    onEvent: (e: AgentEvent) => void;
}

/** 一轮流式消费：文本增量走事件、tool_calls 拼接；返回 {text, toolCalls} */
async function consumeStream(
    stream: AgentStreamLike,
    onEvent: (e: AgentEvent) => void,
): Promise<{ text: string; reasoning: string; toolCalls: PendingToolCall[] | null }> {
    let accum = newToolCallAccum();
    let text = "";
    let reasoning = "";
    let calls: PendingToolCall[] | null = null;
    for await (const chunk of stream) {
        const delta = chunk.choices?.at(0)?.delta as any;
        if (delta?.content) {
            text += delta.content;
            onEvent({ type: "text", delta: delta.content });
        }
        if (delta?.reasoning_content) {
            reasoning += delta.reasoning_content;
            onEvent({ type: "reasoning", delta: delta.reasoning_content });
        }
        const r = appendToolCallDelta(accum, chunk);
        accum = r.acc;
        calls = r.calls ?? calls;
    }
    return { text, reasoning, toolCalls: calls };
}

/** <think>…</think> 前缀剥离的纯字符串版（openAI.ts stripThinkTag 依赖 DOM，此处零 DOM） */
function stripThink(text: string): string {
    if (!text.startsWith("<think>")) return text;
    const end = text.indexOf("</think>");
    return end >= 0 ? text.slice(end + "</think>".length).trim() : "";
}

export async function runAgentLoop(opts: AgentLoopOptions): Promise<AgentLoopResult> {
    const maxTurns = opts.maxTurns ?? 4;
    const messages = [...opts.messages];
    const tools = toOpenAITools(opts.tools);
    for (let turn = 1; turn <= maxTurns; turn++) {
        if (opts.signal?.aborted) return { ok: false, error: "aborted", messages };
        const stream = await opts.createStream(messages, tools, opts.signal);
        if (!stream) return { ok: false, error: "stream_failed", messages };

        let consumed: Awaited<ReturnType<typeof consumeStream>>;
        try {
            consumed = await consumeStream(stream, opts.onEvent);
        } catch (e) {
            // 流中途断（网络掉线等）：MVP 不保留半截文本，直接报错（UI 按事件已渲染的部分自会留在屏上）
            return { ok: false, error: `stream_error: ${e instanceof Error ? e.message : String(e)}`, messages };
        }

        const toolCalls = consumed.toolCalls?.filter(c => c.id || c.name) ?? null;
        if (toolCalls?.length) {
            // 工具轮：assistant(tool_calls) → 逐个直调 → tool 结果回灌 → 下一轮
            messages.push({
                role: "assistant",
                content: consumed.text || null,
                tool_calls: toolCalls.map(c => ({
                    id: c.id,
                    type: "function" as const,
                    function: { name: c.name, arguments: c.args },
                })),
            });
            for (const call of toolCalls) {
                const t0 = Date.now();
                let result: ToolResponse;
                let input: Record<string, any>;
                try {
                    input = JSON.parse(call.args || "{}");
                    result = await opts.caller.call(call.name, input);
                } catch (e: any) {
                    // 参数坏 JSON 或 caller 抛异常：包成失败结果让 AI 自纠（勿炸循环）
                    result = { success: false, error: e instanceof Error ? e.message : String(e) };
                }
                opts.onEvent({ type: "tool_call", call, result, ms: Date.now() - t0 });
                messages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: JSON.stringify(result),
                });
            }
            continue; // 进入下一轮
        }

        // 文本收尾轮：空响应=上游异常收流
        const finalText = stripThink(consumed.text);
        if (!finalText.trim() && !consumed.reasoning.trim()) {
            return { ok: false, error: "empty_response", messages };
        }
        messages.push({ role: "assistant", content: finalText });
        opts.onEvent({ type: "done", turns: turn });
        return { ok: true, messages };
    }
    return { ok: false, error: "max_turns", messages };
}
