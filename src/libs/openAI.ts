import OpenAI from 'openai';
import { cancelSuperBlock, NewNodeID, Siyuan, siyuan, } from './utils';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class OpenAIClient {
    private openai: OpenAI;
    constructor(apiKey: string, baseURL: string) {
        this.openai = new OpenAI({
            apiKey,
            baseURL,
            dangerouslyAllowBrowser: true,
        });
    }

    static async getModel(key: string, baseURL: string, model: string, noSup = false) {
        const openAI = new OpenAIClient(key, baseURL);
        return (prompt: string, anchorID = "") => {
            return openAI.do_completions(model, prompt, anchorID, noSup)
        };
    }

    static getOfficalModel(noSup = false) {
        const aiCfg = Siyuan.config?.ai?.openAI;
        if (aiCfg.apiBaseURL && aiCfg.apiModel) {
            const openAI = new OpenAIClient(aiCfg.apiKey, aiCfg.apiBaseURL);
            return (prompt: string, anchorID = "") => {
                return openAI.do_completions(Siyuan.config.ai.openAI.apiModel, prompt, anchorID, noSup)
            };
        }
    }

    private async do_completions(model: string, useInputTxt: string, anchorID: string, noSup: boolean) {
        let aiRespTxt: string;
        let texts: string[] = [];
        let reasoning_texts: string[] = [];
        let stream: Stream<ChatCompletionChunk>;
        const messages: ChatCompletionMessageParam[] = [{ role: "user", content: useInputTxt }]
        try {
            stream = await this.openai.chat.completions.create({
                model,
                messages,
                stream: true,
            });
        } catch (e) {
            console.error(e, messages)
            return;
        }

        let targetID = "";
        if (anchorID) {
            targetID = NewNodeID();
            await siyuan.insertBlockAfter(`{: id="${targetID}"}`, anchorID);
        }

        const write = () => {
            if (targetID) {
                return siyuan.safeUpdateBlock(
                    targetID,
                    `{{{row\n\n${aiRespTxt}\n\n}}}\n{: id="${targetID}" custom-ai-response="1"}`,
                );
            }
        }

        let i = 0;
        for await (const chunk of stream) {
            const delta = chunk.choices?.at(0)?.delta;
            texts.push(delta?.content ?? "");
            reasoning_texts.push((delta as any)?.reasoning_content ?? "");
            aiRespTxt = texts.join("").trim();
            if (!aiRespTxt) {
                const reasoning = reasoning_texts.join("").trim();
                if (reasoning) {
                    aiRespTxt = reasoning;
                } else {
                    aiRespTxt = `thinking ${i}...`
                }
            }
            if (i++ % 50 === 0) await write();
        }

        if (aiRespTxt.startsWith("<think>")) {
            const div = document.createElement("div")
            div.innerHTML = aiRespTxt;
            const t = div.querySelector("think")
            div.removeChild(t);
            aiRespTxt = div.innerHTML;
        }

        await write();
        if (noSup && targetID) {
            await cancelSuperBlock(targetID);
        }
        return { targetID, aiRespTxt };
    }
}
