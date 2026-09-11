// A 层工具注册表（环境无关）：createTomatoTools 给两个门脸装配同一套工具；
// createToolCaller 是前端门脸的直调面（面板/AI 循环用），与 MCP handler 同名同参同返回——
// 「外部 /mcp 调工具」与「内部面板调工具」走同一份代码（ai-agent □1）。
import { createPomodoroTool } from "./tomatoTools";
import { createSearchTool } from "./searchTools";
import { createCozeTool } from "./cozeTools";
import { createSkillsTool } from "./skillTools";
import { wrapHandler, type ToolDefinition, type ToolResponse } from "./common";
import type { ToolEnv } from "./env";

export type { ToolDefinition, ToolHandler, ToolResponse } from "./common";
export { successResponse, errorResponse, objectSchema, wrapHandler } from "./common";
export type { ToolEnv } from "./env";
export { createPomodoroTool, parseBookIDFromCtime, aggregateFlashcards } from "./tomatoTools";
export { createSearchTool } from "./searchTools";
export { createCozeTool, getCozeName } from "./cozeTools";
export { createSkillsTool, skillsDoc } from "./skillTools";

/** 装配 tomato 全部工具（pomodoro+search+skills+coze，后续期工具在此追加）。
 *  装配点统一再包一层 wrapHandler（双重 wrap 无害）——个别工具忘 wrap 也不漏异常给内核。
 *  coze 依赖外网 HTTP：kernel 门脸（canExternalHttp=false）不装配，外部 /mcp 列表保持干净；
 *  skills 纯静态内联零环境依赖，双门脸恒装配（agentrev □4：前端门脸 env 具 getAgentDocs
 *  → skills 另挂用户 Skill 段；kernel 门脸保持纯手册，MCP 能力面不变）。 */
export function createTomatoTools(env: ToolEnv): ToolDefinition[] {
    const tools = [createPomodoroTool(env), createSearchTool(env), createSkillsTool(env)];
  if (env.canExternalHttp) tools.push(createCozeTool(env));
  return tools.map(t => ({ ...t, handler: wrapHandler(t.handler) }));
}

export interface ToolCaller {
  tools: ToolDefinition[];
  /** 与 MCP 调用同契约：按局部名调工具，返回 ToolResponse */
  call(name: string, input: Record<string, any>): Promise<ToolResponse>;
}

export function createToolCaller(env: ToolEnv, extraTools?: ToolDefinition[]): ToolCaller {
  const tools = [...createTomatoTools(env), ...(extraTools ?? []).map(t => ({ ...t, handler: wrapHandler(t.handler) }))];
  const byName = new Map(tools.map(t => [t.name, t]));
  return {
    tools,
    async call(name, input) {
      const tool = byName.get(name);
      if (!tool) {
        return { success: false, error: `未知工具：${name}（可用：${tools.map(t => t.name).join("/")}）` };
      }
      return tool.handler(input ?? {});
    },
  };
}
