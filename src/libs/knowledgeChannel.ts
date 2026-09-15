// 知识库通道前端门脸（knowledgebox □3/□4）：adapter 本体在 knowledgeChannelCore.ts
// （零环境依赖，kernel MCP 口共用），本文件只留浏览器实现与前端装配——re-export 保旧
// import 路径（KnowledgeBox/KnowledgePanel/ConfAgent/knowledgeSync/单测均 import 本文件）。
import { debugLog } from "./logUtils";
import { getTomatoPluginInstance } from "./utils";
import { zhipuApiKey, zhipuKbName } from "./stores";
import { createZhipuChannel, DEFAULT_KB_NAME, META_PATH } from "./knowledgeChannelCore";
import type { KbChannel, KbHttp } from "./knowledgeChannelCore";

export type {
    KbSseEvent, KbHttp, KbDocInfo, KbCapacity, KbChunk, KbChannel, ZhipuCfg,
} from "./knowledgeChannelCore";
export {
    getKbDocName, parseKbDocName, SIYUAN_ID_RE, META_PATH, DEFAULT_KB_NAME, createZhipuChannel,
} from "./knowledgeChannelCore";

async function fetchJson(resp: Promise<Response>): Promise<any> {
    const r = await resp;
    if (!r.ok) {
        const text = await r.text().catch(() => "");
        throw new Error(`HTTP ${r.status} ${text.slice(0, 120)}`.trim());
    }
    return r.json();
}

/** 前端 fetch 实现（桌面/浏览器门脸；kernel 侧见 kernel/kbChannel.ts 的 proxy 版） */
export function createFrontendKbHttp(): KbHttp {
    return {
        post: (url, body, headers) => fetchJson(fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(headers ?? {}) },
            body: JSON.stringify(body),
        })),
        get: (url, headers) => fetchJson(fetch(url, { method: "GET", headers: { ...(headers ?? {}) } })),
        delete: (url, headers) => fetchJson(fetch(url, { method: "DELETE", headers: { ...(headers ?? {}) } })),
        async postForm(url, fields, file, headers) {
            const fd = new FormData();
            for (const [k, v] of Object.entries(fields)) fd.append(k, v);
            fd.append("files", new File([file.content], file.name, { type: "text/markdown" }));
            return fetchJson(fetch(url, { method: "POST", headers: { ...(headers ?? {}) }, body: fd }));
        },
        async sse(url, body, headers, onEvent) {
            // fetch 无默认超时（review P1-5）：SSE 黑洞（VPN 掉线等）会永久挂起 askBusy——
            // 120s 强制 abort 兜底（正常 ReAct 全链远短于此）；onEvent 抛错也 cancel 收尾
            const ac = new AbortController();
            // 浏览器 abort 只给裸 DOMException 英文——timer 路径先抛中文超时语义再 abort
            let timedOut = false;
            const timer = setTimeout(() => { timedOut = true; ac.abort(); }, 120_000);
            let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
            try {
                const resp = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "text/event-stream", ...headers },
                    body: JSON.stringify(body),
                    signal: ac.signal,
                });
                if (!resp.ok || !resp.body) {
                    const text = await resp.text().catch(() => "");
                    throw new Error(`HTTP ${resp.status} ${text.slice(0, 200)}`.trim());
                }
                reader = resp.body.getReader();
                const decoder = new TextDecoder();
                let buf = "";
                for (;;) {
                    const { done, value } = await reader.read();
                    if (done) {
                        buf += decoder.decode(); // 尾冲刷：末块劈在多字节字符中间时兜齐
                        break;
                    }
                    buf = (buf + decoder.decode(value, { stream: true })).replace(/\r\n/g, "\n");
                    let idx: number;
                    // SSE 事件以空行分隔；data: 与 JSON 间有无空格两种形态都兼容
                    // （CRLF 先归一——代理/网关改写 \r\n\r\n 时整流不解析）
                    while ((idx = buf.indexOf("\n\n")) >= 0) {
                        const chunk = buf.slice(0, idx);
                        buf = buf.slice(idx + 2);
                        const line = chunk.split("\n").find(l => l.startsWith("data:"));
                        if (!line) continue;
                        try {
                            onEvent(JSON.parse(line.slice(5).trim()));
                        } catch { /* 非 JSON 行（keep-alive 注释等）跳过 */ }
                    }
                }
            } catch (e) {
                if (timedOut) throw new Error("智谱问答超时（120 秒）");
                throw e;
            } finally {
                clearTimeout(timer);
                reader?.cancel().catch(() => { });
                ac.abort(); // 流已读完再 abort 无副作用，兜连接回收
            }
        },
    };
}

// ─────────────────────── 前端装配（petal meta + 设置读取） ───────────────────────

async function loadMeta(): Promise<{ kbID: string; kbName: string } | null> {
    const plugin = getTomatoPluginInstance() as any;
    try {
        const raw = await plugin.loadData(META_PATH);
        if (raw && typeof raw === "object" && (raw as any).kbID) return raw as { kbID: string; kbName: string };
    } catch { /* 坏文件当未建库 */ }
    return null;
}

async function saveMeta(m: { kbID: string; kbName: string }): Promise<void> {
    const plugin = getTomatoPluginInstance() as any;
    await plugin.saveData(META_PATH, JSON.stringify(m));
}

/** 前端默认通道（当前唯一=智谱；后续 ima 接入时此处变注册表/下拉）。
 *  记忆化模块单例：autoTimer/面板/设置卡各处调用共享同一实例——ensureKb 的 in-flight
 *  守卫随之跨入口生效（review P2：每 tick 新实例会在首配窗口跨实例双建库） */
let defaultChannel: KbChannel | null = null;
export function createDefaultChannel(): KbChannel {
    if (!defaultChannel) {
        defaultChannel = createZhipuChannel(createFrontendKbHttp(), {
            apiKey: () => zhipuApiKey.get(),
            kbName: () => (zhipuKbName.get() || "").trim() || DEFAULT_KB_NAME,
            getKbID: loadMeta,
            setKbID: (kbID, kbName) => saveMeta({ kbID, kbName }),
            log: (m) => debugLog("knowledge", m, "knowledgebox"),
        });
    }
    return defaultChannel;
}
