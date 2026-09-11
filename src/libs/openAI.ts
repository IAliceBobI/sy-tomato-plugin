import OpenAI from 'openai';
import { cancelSuperBlock, NewNodeID, Siyuan, siyuan, } from './utils';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// 1. 构造 messages —— 纯函数
export function buildMessages(text: string): ChatCompletionMessageParam[] {
    return [{ role: "user", content: text }];
}

// 2. 发起流式请求 —— 这步炸 = 配置/网络/模型问题；signal 可选（□8 批注 AI 讨论区 Esc 中断用）；
// tools 可选（ai-agent □5 面板工具循环：不传=普通问答，传=AI 可发 tool_calls）
export async function createStream(
    openai: OpenAI, model: string, messages: ChatCompletionMessageParam[], signal?: AbortSignal,
    tools?: { type: "function"; function: any }[],
): Promise<Stream<ChatCompletionChunk> | undefined> {
    try {
        const body = {
            model, messages, stream: true as const,
            ...(tools?.length ? { tools } : {}),
        };
        return await openai.chat.completions.create(body, signal ? { signal } : undefined);
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
/** 老结构（思源 <3.7.0）：单 provider 三件套。内核 3.7.0 起启动自动迁移，但老版本前端
 *  getConf 返回的就是它——不读则老用户 AI 四功能全废（木卫三 09-09 报障根因）。 */
interface SiyuanAILegacy {
    apiBaseURL?: string;
    apiModel?: string;
    apiKey?: string;
}
export type AIDiagReason = "noProvider" | "providerDisabled" | "providerIncomplete" | "noModel";
export type AIDiagnosis =
    | { ok: true; apiKey: string; baseURL: string; model: string }
    | { ok: false; reason: AIDiagReason };

/** AI 配置判定：providers 优先、老结构兜底；拿不到时按「离可用最近的一步」归因
 *  （分态提示用——弹窗须指明缺什么，勿再笼统「去设置配置」）。 */
export function diagnoseAI(providers: SiyuanAIProvider[] | undefined, legacy?: SiyuanAILegacy): AIDiagnosis {
    if (Array.isArray(providers)) {
        for (const p of providers) {
            if (!p?.enabled || !p.apiKey || !p.baseURL) continue;
            const m = (p.models || []).find((mm) => mm?.enabled && mm.name);
            if (m) return { ok: true, apiKey: p.apiKey, baseURL: p.baseURL, model: m.name };
        }
    }
    if (legacy?.apiKey && legacy.apiBaseURL && legacy.apiModel)
        return { ok: true, apiKey: legacy.apiKey, baseURL: legacy.apiBaseURL, model: legacy.apiModel };
    const list = Array.isArray(providers) ? providers.filter(Boolean) : [];
    if (list.some((p) => p.enabled && p.apiKey && p.baseURL)) return { ok: false, reason: "noModel" };
    if (list.some((p) => p.apiKey && p.baseURL)) return { ok: false, reason: "providerDisabled" };
    if (list.length) return { ok: false, reason: "providerIncomplete" };
    return { ok: false, reason: "noProvider" };
}

function diagToCfg(d: AIDiagnosis): { apiKey: string; baseURL: string; model: string } | undefined {
    return d.ok ? { apiKey: d.apiKey, baseURL: d.baseURL, model: d.model } : undefined;
}

export function getOfficialConfig(): { apiKey: string; baseURL: string; model: string } | undefined {
    const ai = (Siyuan.config?.ai as any);
    return diagToCfg(diagnoseAI(ai?.providers as SiyuanAIProvider[] | undefined, ai?.openAI as SiyuanAILegacy | undefined));
}

/** 两级兜底取思源 AI 配置（□8 批注 AI 讨论区；recite aiGrade.getAIConfig 同款语义回迁共享库）：
 *  window.siyuan.config 是启动快照，思源启动后才配的密钥拿不到 → /api/system/getConf 实时读。
 *  两级都无 → undefined 由调用方弹引导。 */
export async function getAIConfig(): Promise<{ apiKey: string; baseURL: string; model: string } | undefined> {
    const snap = getOfficialConfig();
    if (snap) return snap;
    try {
        const ret = await siyuan.getConf();
        const ai = (ret?.conf?.ai as any);
        return diagToCfg(diagnoseAI(ai?.providers as SiyuanAIProvider[] | undefined, ai?.openAI as SiyuanAILegacy | undefined));
    } catch (e) {
        console.warn("[tomato] getConf fallback failed:", e);
    }
    return undefined;
}

/** 判定失败也要知道缺什么（分态提示通道）：快照→getConf 两级收集后诊断，getConf 失败退快照结论。 */
export async function diagnoseAIAsync(): Promise<AIDiagnosis> {
    const aiSnap = (Siyuan.config?.ai as any);
    const dSnap = diagnoseAI(aiSnap?.providers as SiyuanAIProvider[] | undefined, aiSnap?.openAI as SiyuanAILegacy | undefined);
    if (dSnap.ok) return dSnap;
    try {
        const ret = await siyuan.getConf();
        const ai = (ret?.conf?.ai as any);
        return diagnoseAI(ai?.providers as SiyuanAIProvider[] | undefined, ai?.openAI as SiyuanAILegacy | undefined);
    } catch {
        return dSnap;
    }
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

    async createStreamPublic(model: string, messages: ChatCompletionMessageParam[], signal?: AbortSignal, tools?: { type: "function"; function: any }[]) {
        return createStream(this.openai, model, messages, signal, tools);
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

    /** 流式问答并把结果写进 anchorID 后方块（AIBox 主链路；progressive 生词 AI 经 getOfficalModel 同达）。
     *  agentrev □3 健壮化：目标块懒插（首个写入才插——请求失败不再留空 sb 孤儿块）、
     *  空响应/中断且无实质内容时清块并返回 undefined（调用方弹失败提示）。
     *  返回 undefined 三态：请求失败 / 空响应 / 中断且一字未出；有部分内容时保留返回。 */
    async do_completions(model: string, useInputTxt: string, anchorID: string, noSup: boolean) {
        const messages = buildMessages(useInputTxt);
        const stream = await createStream(this.openai, model, messages);
        if (!stream) return undefined;

        let targetID = "";
        const ensureTarget = async () => {
            if (targetID || !anchorID) return;
            targetID = NewNodeID();
            await siyuan.insertBlockAfter(`{: id="${targetID}"}`, anchorID);
        };
        const write = async (txt: string) => {
            await ensureTarget();
            return targetID
                ? siyuan.safeUpdateBlock(targetID, `{{{row\n\n${txt}\n\n}}}\n{: id="${targetID}" custom-ai-response="1"}`)
                : undefined;
        };
        const finalize = async (raw: string) => {
            // hasReal=流里真出过正文/思考（appendChunk 无内容时 display 是「thinking N...」
            // 占位文案——中断时不能把它当正文落块）
            const hasReal = !!(state.texts.join("").trim() || state.reasoning_texts.join("").trim());
            const txt = stripThinkTag(raw).trim();
            if (!txt || !hasReal) {
                if (targetID) await siyuan.deleteBlock(targetID).catch(() => undefined);
                return undefined;
            }
            await write(txt);
            if (noSup && targetID) {
                await cancelSuperBlock(targetID);
            }
            return { targetID, aiRespTxt: txt };
        };

        let state: StreamState = { texts: [], reasoning_texts: [], count: 0 };
        let aiRespTxt = "";
        try {
            for await (const chunk of stream) {
                const r = appendChunk(state, chunk);
                state = r.state;
                aiRespTxt = r.display;
                if (state.count % 50 === 0) await write(aiRespTxt);
            }
        } catch (e) {
            // 收流中断（网络断等）：已出的实质内容按完成态落块保留，一字未出则清块报失败
            console.error("[tomato] AI 收流中断：", e);
            return finalize(aiRespTxt);
        }
        return finalize(aiRespTxt);
    }
}
