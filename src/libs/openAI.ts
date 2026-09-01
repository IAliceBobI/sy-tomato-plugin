import OpenAI from 'openai';
import { cancelSuperBlock, NewNodeID, Siyuan, siyuan, } from './utils';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// 1. 构造 messages —— 纯函数
export function buildMessages(text: string): ChatCompletionMessageParam[] {
    return [{ role: "user", content: text }];
}

// 2. 发起流式请求 —— 这步炸 = 配置/网络/模型问题；signal 可选（□8 批注 AI 讨论区 Esc 中断用）
export async function createStream(
    openai: OpenAI, model: string, messages: ChatCompletionMessageParam[], signal?: AbortSignal
): Promise<Stream<ChatCompletionChunk> | undefined> {
    try {
        return await openai.chat.completions.create({ model, messages, stream: true }, signal ? { signal } : undefined);
    } catch (e) {
        console.error(e, messages);
        return undefined;
    }
}

// 3. 流式拼接一个 chunk —— 纯函数（核心可测逻辑）
export interface StreamState {
    texts: string[];
    reasoning_texts: string[];
    count: number;
}
export function appendChunk(
    state: StreamState, chunk: ChatCompletionChunk
): { state: StreamState; display: string } {
    const delta = chunk.choices?.at(0)?.delta;
    const texts = [...state.texts, delta?.content ?? ""];
    const reasoning_texts = [...state.reasoning_texts, (delta as any)?.reasoning_content ?? ""];
    const count = state.count + 1;
    let display = texts.join("").trim();
    if (!display) {
        const reasoning = reasoning_texts.join("").trim();
        display = reasoning || `thinking ${count}...`;
    }
    return { state: { texts, reasoning_texts, count }, display };
}

// 4. 剥 <think> 标签 —— DOM 操作，导出
export function stripThinkTag(html: string): string {
    if (!html.startsWith("<think>")) return html;
    const div = document.createElement("div");
    div.innerHTML = html;
    const t = div.querySelector("think");
    div.removeChild(t);
    return div.innerHTML;
}

// 5. 从思源 AI 配置取首个可用 provider + model
// 思源 2026-07 起把单 provider（config.ai.openAI.{apiBaseURL,apiModel,apiKey}）
// 迁移为多 provider（config.ai.providers[]），这里读新结构。
// 注：siyuan npm 类型包仍声明 IAI.openAI（旧结构），尚未跟上内核，故用本地类型断言。
interface SiyuanAIProvider {
    enabled?: boolean;
    apiKey?: string;
    baseURL?: string;
    models?: { enabled?: boolean; name?: string }[];
}
export function getOfficialConfig(): { apiKey: string; baseURL: string; model: string } | undefined {
    const providers = (Siyuan.config?.ai as any)?.providers as SiyuanAIProvider[] | undefined;
    if (!Array.isArray(providers)) return;
    for (const p of providers) {
        if (!p?.enabled || !p.apiKey || !p.baseURL) continue;
        const m = (p.models || []).find((mm) => mm?.enabled && mm.name);
        if (m) return { apiKey: p.apiKey, baseURL: p.baseURL, model: m.name };
    }
}

/** 两级兜底取思源 AI 配置（□8 批注 AI 讨论区；recite aiGrade.getAIConfig 同款语义回迁共享库）：
 *  window.siyuan.config 是启动快照，思源启动后才配的密钥拿不到 → /api/system/getConf 实时读。
 *  两级都无 → undefined 由调用方弹引导。 */
export async function getAIConfig(): Promise<{ apiKey: string; baseURL: string; model: string } | undefined> {
    const snap = getOfficialConfig();
    if (snap) return snap;
    try {
        const ret = await siyuan.getConf();
        const providers = (ret?.conf?.ai as any)?.providers as SiyuanAIProvider[] | undefined;
        if (Array.isArray(providers)) {
            for (const p of providers) {
                if (!p?.enabled || !p.apiKey || !p.baseURL) continue;
                const m = (p.models || []).find((mm) => mm?.enabled && mm.name);
                if (m) return { apiKey: p.apiKey, baseURL: p.baseURL, model: m.name };
            }
        }
    } catch (e) {
        console.warn("[tomato] getConf fallback failed:", e);
    }
    return undefined;
}

export class OpenAIClient {
    private openai: OpenAI;
    constructor(apiKey: string, baseURL: string) {
        this.openai = new OpenAI({
            apiKey,
            baseURL,
            dangerouslyAllowBrowser: true,
        });
    }

    async createStreamPublic(model: string, messages: ChatCompletionMessageParam[], signal?: AbortSignal) {
        return createStream(this.openai, model, messages, signal);
    }

    // 非流式一次拿全（recite AI 拆分用：整篇送 AI 回 JSON 定位，无逐块写回不必流式）。
    // 错误语义照 createStream：请求失败 catch 后返回 undefined，由调用方弹提示止损
    async createCompletionPublic(model: string, messages: ChatCompletionMessageParam[]) {
        try {
            return await this.openai.chat.completions.create({ model, messages });
        } catch (e) {
            console.error(e, messages);
            return undefined;
        }
    }

    static async getModel(key: string, baseURL: string, model: string, noSup = false) {
        const openAI = new OpenAIClient(key, baseURL);
        return (prompt: string, anchorID = "") => {
            return openAI.do_completions(model, prompt, anchorID, noSup)
        };
    }

    static getOfficalModel(noSup = false) {
        const aiCfg = getOfficialConfig();
        if (aiCfg) {
            const openAI = new OpenAIClient(aiCfg.apiKey, aiCfg.baseURL);
            return (prompt: string, anchorID = "") => {
                return openAI.do_completions(aiCfg.model, prompt, anchorID, noSup)
            };
        }
    }

    private async do_completions(model: string, useInputTxt: string, anchorID: string, noSup: boolean) {
        const messages = buildMessages(useInputTxt);
        const stream = await createStream(this.openai, model, messages);
        if (!stream) return;

        let targetID = "";
        if (anchorID) {
            targetID = NewNodeID();
            await siyuan.insertBlockAfter(`{: id="${targetID}"}`, anchorID);
        }

        const write = (txt: string) => targetID
            ? siyuan.safeUpdateBlock(targetID, `{{{row\n\n${txt}\n\n}}}\n{: id="${targetID}" custom-ai-response="1"}`)
            : undefined;

        let state: StreamState = { texts: [], reasoning_texts: [], count: 0 };
        let aiRespTxt = "";
        for await (const chunk of stream) {
            const r = appendChunk(state, chunk);
            state = r.state;
            aiRespTxt = r.display;
            if (state.count % 50 === 0) await write(aiRespTxt);
        }

        aiRespTxt = stripThinkTag(aiRespTxt);
        await write(aiRespTxt);
        if (noSup && targetID) {
            await cancelSuperBlock(targetID);
        }
        return { targetID, aiRespTxt };
    }
}
