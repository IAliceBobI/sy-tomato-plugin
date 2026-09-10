import type { IAgentCapabilityConfig } from "siyuan/kernel";

// 工具层公共件（A 层，环境无关）：kernel 门脸（MCP 注册）与前端门脸（面板直调）共享。
// 工具返回值统一 ToolResponse 结构（success/data/error），让调用方 AI 拿到可判读的结果
// 而非裸异常文本。勿在此 import 任何运行时环境（window/fetch/siyuan 全局）——环境差异
// 一律走 env.ts 的 ToolEnv 注入（ai-agent □1 同源化定案：甲形态）。

export interface ToolResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ToolHandler = (input: Record<string, any>) => Promise<ToolResponse>;

export interface ToolDefinition {
  /** 插件内局部名；内核会加 plugin__<插件名>__<名>__<hash> 前缀暴露给模型 */
  name: string;
  config: IAgentCapabilityConfig;
  handler: ToolHandler;
}

export function successResponse<T>(data: T): ToolResponse<T> {
  return { success: true, data };
}

export function errorResponse(error: string): ToolResponse {
  return { success: false, error };
}

export function objectSchema(
  description: string,
  properties: Record<string, any>,
  required?: string[],
): IAgentCapabilityConfig {
  return {
    description,
    inputSchema: {
      type: "object",
      properties,
      required: required ?? [],
    } as IAgentCapabilityConfig["inputSchema"],
  };
}

/** 兜住 handler 抛出的异常，转成 errorResponse 而非让内核记一条失败调用 */
export function wrapHandler(handler: ToolHandler): ToolHandler {
  return async (input: Record<string, any>) => {
    try {
      return await handler(input);
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      return errorResponse(message);
    }
  };
}
