// kernel 门脸的 ToolEnv 实现：SQL 走内核代理 REST（siyuan.client.fetch，插件 JWT 自鉴权），
// JSON 存储走 siyuan.storage（根=data/storage/petal/sy-tomato-plugin/，与前端 loadData 同目录）。
// 逻辑本体在 src/libs/agentTools（A 层），本文件只做环境接线（ai-agent □1）。
import type { ToolEnv } from "../../libs/agentTools";
import * as api from "../api";

export function createKernelEnv(): ToolEnv {
  return {
    sql: <T>(stmt: string) => api.sql<T>(stmt),
    async readPluginJson(path: string): Promise<any> {
      try {
        const d = await (await siyuan.storage.get(path)).json();
        // 契约收窄：只放对象/数组过水线，标量落 null（与前端门脸等价，review P2-1）
        return d && typeof d === "object" ? d : null;
      } catch {
        // ToolEnv 契约：不存在/坏值兜成 null 不抛（核心层会归一成空聚合）
        return null;
      }
    },
    postApi: (path: string, payload: Record<string, any>) => api.call(path as `/${string}`, payload),
    async semanticSearchAvailable(): Promise<{ available: boolean }> {
      try {
        // getConf data 形态={conf,start,isPublish}（kernel/api/system.go:850 实测）；
        // 非 admin 角色会被 HideConfSecret 掩 key→探测落 false，方向安全（最多误降级）
        const d = await api.call("/api/system/getConf", {});
        const emb = d?.conf?.ai?.embedding;
        return { available: !!emb && !!emb.enabled && String(emb.apiKey ?? "").length > 0 };
      } catch {
        return { available: false };
      }
    },
    // kernel goja 无 fetch，外网能力物理不存在：coze 类工具靠 canExternalHttp=false 不装配，
    // 以下外网成员只为 ToolEnv 接口完整（不会被调到；防御性抛清晰错误）
    canExternalHttp: false,
    async postExternal(): Promise<any> {
      throw new Error("kernel 侧无外网 HTTP 通道（goja 无 fetch）");
    },
    async getExternal(): Promise<any> {
      throw new Error("kernel 侧无外网 HTTP 通道（goja 无 fetch）");
    },
    async getDocTreeMarkdown(): Promise<{ id: string; content: string; markdown: string }[]> {
      throw new Error("kernel 侧无文档导出通道");
    },
    async getCozeConfig(): Promise<{ token: string; knowledgeID: string; appID: string }> {
      return { token: "", knowledgeID: "", appID: "" };
    },
  };
}
