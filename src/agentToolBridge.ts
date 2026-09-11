// 前端门脸（ai-agent □1）：把 A 层工具（src/libs/agentTools，与 kernel MCP 同源）接上
// 浏览器环境——SQL 走 siyuanApi 的 siyuan.call（window fetch+内核鉴权），JSON 存储走
// plugin.loadData（与 kernel siyuan.storage 同目录同数据）。□5 内部面板用 createFrontendToolCaller
// 直接函数调用，不走 /mcp（面板可用性不绑实例级 MCP 暴露开关，也无 HTTP/握手开销）。
// □3 起：外网 HTTP（coze）与文档树导出只在此门脸可用（kernel goja 无 fetch）。
import type { Plugin } from "siyuan";
import { siyuan, getMarkdownsByTrees } from "./libs/siyuanApi";
import { debugLog } from "./libs/logUtils";
import { agentKnowledgeDocs, agentSkillDocs, cozeSearchAppID, cozeSearchKnowledgeID, cozeSearchOauthTokenID } from "./libs/stores";
import { createToolCaller, type ToolCaller, type ToolEnv } from "./libs/agentTools";

export function createFrontendToolEnv(plugin: Plugin): ToolEnv {
  return {
    async sql<T = any>(stmt: string): Promise<T[]> {
      // siyuan.call 失败回 null/undefined（code!=0 / HTTP 异常 / data 缺失透传 Response）；
      // 成功时 /api/query/sql 的 data 恒为数组——非数组即失败，按契约抛（勿吞成假零，
      // kernel 门脸同语义：api.sql code!=0 即 throw，wrapHandler 兜成 errorResponse）
      const r = await siyuan.call("/api/query/sql", { stmt });
      if (!Array.isArray(r)) throw new Error(`sql failed: ${stmt.slice(0, 80)}`);
      return r as T[];
    },
    async readPluginJson(path: string): Promise<any> {
      try {
        // loadData 真实契约（6809 实测）：缺文件回 ""，.json 文件回「已解析对象」
        // （内核按扩展名给 application/json，Response.json() 自动解析）——勿再 JSON.parse
        const raw = await plugin.loadData(path);
        if (raw && typeof raw === "object") return raw;
        if (typeof raw === "string" && raw) {
          const parsed = JSON.parse(raw);
          return parsed && typeof parsed === "object" ? parsed : null;
        }
        return null;
      } catch {
        return null;
      }
    },
    async postApi(path: string, payload: Record<string, any>): Promise<any> {
      // siyuan.call 失败回 null/undefined（code!=0 / HTTP 异常）；data===undefined 的怪例会
      // 透传 Response 对象（siyuanApi.call 实现）——两者都按失败抛（review P1-2：勿吞=假零）
      const r = await siyuan.call(path, payload);
      if (r == null || typeof Response !== "undefined" && r instanceof Response) {
        throw new Error(`api failed: ${path}`);
      }
      return r;
    },
    async semanticSearchAvailable(): Promise<{ available: boolean }> {
      // 前端进程内直读全局配置（与内核 getConf 同源数据），判据=内核 isEmbeddingEnabled
      const emb = (window as any).siyuan?.config?.ai?.embedding;
      return { available: !!emb && !!emb.enabled && String(emb.apiKey ?? "").length > 0 };
    },
    // 外网 HTTP + 文档树导出（coze 类工具通道，仅前端门脸）
    canExternalHttp: true,
    async postExternal(url: string, body: any, headers?: Record<string, string>): Promise<any> {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(headers ?? {}) },
        body: JSON.stringify(body ?? {}),
      });
      if (!resp.ok) {
        // 非 JSON 错误体（网关 5xx HTML 等）别让 resp.json() 抛成无状态信息
        const text = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} ${text.slice(0, 120)}`.trim());
      }
      return await resp.json();
    },
    async getExternal(url: string, headers?: Record<string, string>): Promise<any> {
      const resp = await fetch(url, { method: "GET", headers: { ...(headers ?? {}) } });
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} ${text.slice(0, 120)}`.trim());
      }
      return await resp.json();
    },
    async getDocTreeMarkdown(docID: string): Promise<{ id: string; content: string; markdown: string }[]> {
      // silent=不弹 copied 进度 toast（AI 后台调工具不该打扰用户）
      const rows = await getMarkdownsByTrees([docID], "", true);
      return rows.map(r => ({ id: r.id, content: String(r.content ?? ""), markdown: String(r.markdown ?? "") }));
    },
    async getCozeConfig() {
      return {
        token: cozeSearchOauthTokenID.get(),
        knowledgeID: cozeSearchKnowledgeID.get(),
        appID: cozeSearchAppID.get(),
      };
    },
    // ---- □6 写/执行面（可选能力=水线：仅前端门脸实现；kernel env 缺这些面 → edit/run_js 不进 MCP）----
    async writeBlock(blockID: string, markdown: string) {
      // updateBlock 走事务写盘；data 恒 null（写类端点契约），失败由 siyuan.call 抛——真伪复核由调用方（面板撤销快照）兜
      await siyuan.updateBlock(blockID, markdown);
      return { markdown };
    },
    async readBlockMarkdown(blockID: string) {
      const { kramdown } = await siyuan.getBlockKramdown(blockID);
      return { markdown: kramdown ?? "" };
    },
    // agentrev □4：用户挑选的 Agent 上下文文档（领域知识/Skill）——skills 工具按此挂用户 Skill 段
    getAgentDocs() {
      return Promise.resolve({
        knowledge: (agentKnowledgeDocs.get() ?? []) as string[],
        skills: (agentSkillDocs.get() ?? []) as string[],
      });
    },
    async runUserJS(code: string) {
      // 前端 window 域执行（⚠️ 非安全沙箱——真防线=AgentPanel 调用前的代码人审闸）：
      // new Function 包 async 体+return；Promise.race 5s 超时熔断（放弃等待，脚本本身无法强杀）
      const TIMEOUT_MS = 5000;
      // 构造进 try：AI 常产畸形代码（匿名 function 声明等）——new Function 构造期即抛 SyntaxError
      let exec: () => Promise<any>;
      try {
        exec = new Function(`return (async () => {\n${code}\n})()`) as () => Promise<any>;
      } catch (e: any) {
        throw new Error(`代码语法错误：${e instanceof Error ? e.message : String(e)}`);
      }
      let value: any;
      try {
        value = await Promise.race([
          exec(),
          new Promise((_, rej) => setTimeout(() => rej(new Error("run_js 超时（5s）")), TIMEOUT_MS)),
        ]);
      } catch (e: any) {
        throw new Error(e instanceof Error ? e.message : String(e));
      }
      // 小模型常见形态兜底：代码只定义了函数没调用（末表达式=函数对象）→自动调用一次
      if (typeof value === "function") {
        try {
          value = await Promise.race([
            (value as () => any)(),
            new Promise((_, rej) => setTimeout(() => rej(new Error("run_js 超时（5s）")), TIMEOUT_MS)),
          ]);
        } catch (e: any) {
          value = `（函数自动调用失败：${e instanceof Error ? e.message : String(e)}）`;
        }
      }
      // 序列化防护：循环引用/undefined → JSON.stringify 兜底文本；undefined 给 AI 可自纠的明确反馈
      let result: string;
      try {
        result = JSON.stringify(value) ?? "undefined（代码没有 return 值——请确认代码末尾 return 计算结果）";
      } catch {
        result = String(value);
      }
      return { result };
    },
  };
}

/** 面板直调面：与 MCP handler 同名同参同返回；每次调用推 Loki（app=aiagent 流，isMe/dev 端口门控） */
export function createFrontendToolCaller(plugin: Plugin): ToolCaller {
  const inner = createToolCaller(createFrontendToolEnv(plugin));
  return {
    tools: inner.tools,
    async call(name, input) {
      const t0 = Date.now();
      const r = await inner.call(name, input);
      debugLog("tool",
        `${name} ${String(input?.action ?? "")} → ${r.success ? "ok" : `err ${r.error ?? ""}`.slice(0, 120)} ${Date.now() - t0}ms`,
        "aiagent");
      return r;
    },
  };
}
