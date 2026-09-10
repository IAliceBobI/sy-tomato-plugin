import { createTomatoTools, type ToolDefinition } from "../../libs/agentTools";
import { createKernelEnv } from "./env";

export type { ToolDefinition } from "../../libs/agentTools";

// kernel 门脸：把 A 层工具（src/libs/agentTools，环境无关核心）接上 kernel 环境注册成 MCP。
// 工具语义/清单的单一事实源在 libs/agentTools/index.ts 的 createTomatoTools（前端门脸同源）。
export function createMcpRegistry(): ToolDefinition[] {
  return createTomatoTools(createKernelEnv());
}
