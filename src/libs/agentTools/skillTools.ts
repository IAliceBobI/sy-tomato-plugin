// skills 工具（A 层，□4）：把插件工具使用文档（SKILL.md）作为工具暴露给 AI 按需拉取，
// 减少试错轮次=省 token（tasknote get_siyuan_skills 同模式）。文档编译期内联（?raw）——
// kernel goja 读不了插件包文件，内联=双门脸同源零运行时 IO；包内 skills/ 文件由
// vite-static-copy 同步分发（静态可见性，用户/浏览器可直接读）。
// 文档事实源=src/agentSkills/SKILL.md，改文档只改它。
import skillsMd from "../../agentSkills/SKILL.md?raw";
import { objectSchema, successResponse, wrapHandler, type ToolDefinition } from "./common";

/** 文档原文（单测/外露用；事实源=src/agentSkills/SKILL.md） */
export const skillsDoc = skillsMd;

const skillsDescription = [
  "番茄插件 AI 工具使用文档（pomodoro/search/coze 的参数契约、常见坑与配置指引）。",
  "首次调用番茄工具前或工具报错拿不准原因时拉取本文档，可减少试错轮次；无参数，返回全量 markdown。",
].join("");

export function createSkillsTool(): ToolDefinition {
  return {
    name: "skills",
    config: objectSchema(skillsDescription, {}),
    handler: wrapHandler(async () => successResponse({
      document: skillsMd,
      hint: "document=完整使用文档（markdown）；先读「通用契约」节再按需跳各工具节",
    })),
  };
}
