// 面板专属工具（ai-agent □6）：edit（受控编辑）+ run_js（试验场）。
// 与通用装配（createTomatoTools，进 MCP 面）分家——写/执行能力只走面板门脸：
// ① env 可选面=能力水线（kernel env 不实现 writeBlock/runUserJS，即使误装配也不生效）；
// ② 本装配只被 AgentPanel 的 createPanelToolCaller 消费，外层再包人审确认闸
//   （edit=diff 预览、run_js=代码人审——安全铁律：AI 生成代码执行前人必须看过）。
import { objectSchema, wrapHandler, type ToolDefinition } from "./common";
import type { ToolEnv } from "./env";
import { createReadTool } from "./readTools";

export function createEditTool(env: ToolEnv): ToolDefinition | null {
    // 能力水线：无写面（kernel env / 测试 stub）不装配——MCP 面恒无写权限
    if (!env.writeBlock || !env.readBlockMarkdown) return null;
    return {
        name: "edit",
        config: objectSchema(
            "编辑用户文档里的一个块（改写/替换内容）。默认会先给用户看修改预览，确认后才真正写入"
            + "（用户可在设置中关闭该确认，关闭后直接写入）；被拒绝时请勿原样重试，换方案或直接把"
            + "新内容贴在回答里。blockID 从【用户当前文档】"
            + "正文的 {: id=\"...\"} 行取（每个块开头都有）。markdown=该块的完整新内容（整块替换，非局部）。",
            {
                blockID: { type: "string", description: "目标块 id（20 位时间戳-随机串形态）" },
                markdown: { type: "string", description: "替换后的整块 markdown（不含块 id 属性行）" },
            },
            ["blockID", "markdown"],
        ),
        handler: wrapHandler(async (input) => {
            const { markdown } = await env.writeBlock!(String(input.blockID ?? ""), String(input.markdown ?? ""));
            return { success: true, data: { applied: true, markdown } };
        }),
    };
}

export function createRunJsTool(env: ToolEnv): ToolDefinition | null {
    if (!env.runUserJS) return null;
    return {
        name: "run_js",
        config: objectSchema(
            "在插件页面环境里执行一段 JavaScript 做计算或批量查询（可用 window.siyuan 内核 API、"
            + "fetch、console；无 import/require；5 秒超时）。代码默认会先展示给用户，确认后才执行"
            + "（用户可在设置中关闭该确认）。写法约定：写成 async 代码体，return 的值作为结果返回（自动 JSON 序列化）。",
            {
                code: { type: "string", description: "JS 代码体（async，return 结果）" },
            },
            ["code"],
        ),
        handler: wrapHandler(async (input) => {
            const { result } = await env.runUserJS!(String(input.code ?? ""));
            return { success: true, data: { result } };
        }),
    };
}

/** 面板专属装配：通用四工具之外的写/执行/读面（依赖 env 可选能力，缺则自动瘦身）。
 *  agentrev □4：read（块/文档全文拉取）进面板——kernel env 无 readBlockMarkdown，MCP 面不出现。 */
export function createPanelOnlyTools(env: ToolEnv): ToolDefinition[] {
    return [createEditTool(env), createRunJsTool(env), createReadTool(env)].filter((t): t is ToolDefinition => !!t);
}

/** 人审闸标记：调用方（AgentPanel 确认闸）据此拦截弹窗；非写类直接放行 */
export function needsHumanReview(toolName: string): boolean {
    return toolName === "edit" || toolName === "run_js";
}
