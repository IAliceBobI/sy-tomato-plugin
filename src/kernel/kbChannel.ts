// kernel 侧知识库通道（knowledgebox □4）：/mcp 的 knowledge_search/knowledge_status 在
// kernel 进程内自足执行——外网经 /api/network/proxy 转发（goja 无 fetch，通道契约见
// mcp.md「内核外网通道」节）。不走 rpc 转前端：kernel→前端仅 broadcast 无回执（request-
// response 须自建协议），goja 无 setTimeout 无法超时守卫，前端忙=MCP 调用永久挂起；
// proxy 线=单一事实源（knowledgeChannelCore 的智谱 adapter 一份代码双门脸注入不同 KbHttp）。
import { createZhipuChannel, DEFAULT_KB_NAME, META_PATH, type KbChannel, type KbHttp } from "../libs/knowledgeChannelCore";
import { proxyRequest } from "./api";

// settings 键位置：tomato-settings.json 平铺键（与前端 settingFactory 落盘同文件同键）
const SETTINGS_PATH = "tomato-settings.json";
const cfgBox = { apiKey: "", kbName: "" };

async function readJson(path: string): Promise<any> {
    try {
        const d = await (await siyuan.storage.get(path)).json();
        return d && typeof d === "object" ? d : null;
    } catch {
        return null; // 不存在/坏文件 → null（懒初始化，缺文件不算错）
    }
}

/** 每次工具调用前刷新：前端改 Key 后无需重启内核即可生效（kernel 不监听 petal 变更） */
async function refreshCfg(): Promise<void> {
    const d = await readJson(SETTINGS_PATH);
    cfgBox.apiKey = String(d?.zhipuApiKey ?? "");
    cfgBox.kbName = String(d?.zhipuKbName ?? "");
}

// proxy 版 KbHttp：MCP 只读面只走 get/post（检索/容量/列表）；postForm/sse=写面/流式面，
// kernel 门脸用不到——防御性抛清晰错误（同 tools/env.ts canExternalHttp 先例）
function createProxyKbHttp(): KbHttp {
    async function json(method: string, url: string, body?: any, headers?: Record<string, string>): Promise<any> {
        const h: Record<string, string[]> = {};
        for (const [k, v] of Object.entries(headers ?? {})) h[k] = [v];
        const resp = await proxyRequest(url, method, body, h);
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status} ${resp.body.slice(0, 120)}`.trim());
        }
        try {
            return JSON.parse(resp.body);
        } catch {
            throw new Error(`外网响应非 JSON：${resp.body.slice(0, 120)}`.trim());
        }
    }
    return {
        post: (url, body, headers) => json("POST", url, body, headers),
        get: (url, headers) => json("GET", url, undefined, headers),
        delete: (url, headers) => json("DELETE", url, undefined, headers),
        async postForm(): Promise<any> {
            throw new Error("kernel 面不支持 multipart 上传（同步写操作不进 MCP）");
        },
        async sse(): Promise<void> {
            throw new Error("kernel 面不支持 SSE 流式问答（走前端面板）");
        },
    };
}

let channel: KbChannel | null = null;

/** ToolEnv.getKbChannel 的 kernel 实现：通道记忆化（ensureKb in-flight 守卫跨 handler 生效），
 *  cfg 读 mutable 快照（ZhipuCfg.apiKey() 同步签名 ↔ goja 读 storage 异步，入口刷新折中）。 */
export async function getKbChannel(): Promise<KbChannel> {
    await refreshCfg();
    if (!channel) {
        channel = createZhipuChannel(createProxyKbHttp(), {
            apiKey: () => cfgBox.apiKey,
            kbName: () => cfgBox.kbName.trim() || DEFAULT_KB_NAME,
            // MCP 只读面不建库：首调未初始化引导用户先在面板同步一次（建库=写面语义）
            createIfMissing: false,
            log: (m) => { void siyuan.logger.info("[kernel] [kb]", m); },
            getKbID: async () => await readJson(META_PATH),
            // 偶发写（首连复用库/库名变更），触发前端插件整重载一次——可接受，非常态路径
            setKbID: async (kbID, kbName) => {
                await siyuan.storage.put(META_PATH, JSON.stringify({ kbID, kbName }));
            },
        });
    }
    return channel;
}
