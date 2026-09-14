// 四插件「AI 接入（MCP）」引导事实源（mcpcopy 战役 2026-09-11；2026-09-14 插件参数化——
// 各插件设置面板复制本插件的提示词，不再共用同一份）。
// 指南文档=飞书《把 AI 助手接进思源（MCP 接入指南）》（公开态）；提示词与文档第 3 步
// 「自接线提示词」保持同文——改文案两处同步。
export const MCP_GUIDE_URL = "https://my.feishu.cn/docx/BkRldeWJ7o3T4ExE2fdciZbgnRV";

export type McpPluginKind = "tomato" | "progressive" | "recite" | "project";

// 第 4 步的本插件段：从哪个插件的面板复制，就只讲那个插件的工具（步骤 1~3 端点接线同构共用）。
const STEP4_ZH: Record<McpPluginKind, string> = {
    tomato: "番茄插件工具的用法不确定时，先调用 skills 工具读取说明再干活；",
    progressive: "渐进学习插件工具（progressive）可查书单进度、到期队列与排期，替我推迟重访；",
    recite: "仿写练习插件工具（recite）可通读原文、查询练习与判卷，替我装配练习现场（build_drill 是 Pro 能力，未激活时按返回的引导文案转述我）；",
    project: "项目容器插件工具（project/task/calendar/line）可替我管理项目与任务、同步飞书日历提醒（line 工具勿对项目外文档使用）；",
};

const STEP4_EN: Record<McpPluginKind, string> = {
    tomato: "when unsure how to use the Tomato Toolbox tools, read the skills tool first before acting;",
    progressive: "the Progressive Learning tool (progressive) can check my reading queue and schedule, and defer reviews for me;",
    recite: "the Recite Practice tool (recite) can read source texts, query practice and grading, and assemble practice drills for me (build_drill is a Pro capability — if not activated, relay the guidance text it returns to me);",
    project: "the Project Container tools (project/task/calendar/line) can manage my projects and tasks, and sync Feishu calendar reminders (never use the line tool on documents outside a project);",
};

function promptZh(plugin: McpPluginKind): string {
    return `我想把本机的思源笔记（SiYuan）通过 MCP 接入你，请帮我自动完成接线：

1. 思源的 MCP 端点是 http://127.0.0.1:<端口>/mcp，思源第一个工作空间恒定监听 6806。
   请先探测它：向 http://127.0.0.1:6806/mcp 发起 POST 请求（请求头 Content-Type: application/json
   和 Accept: application/json, text/event-stream），请求体：
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"1.0"}}}
   响应里 serverInfo.name 等于 "SiYuan" 就是命中。
2. 如果 6806 探测不通，我会把思源「设置 → 关于 → 在浏览器上使用」里列出的端口填在这里：____，
   请对 http://127.0.0.1:<该端口>/mcp 重复上面的探测。
3. 探测命中后：若返回 401 或要求鉴权，向我要 API 令牌（在思源「设置 → 关于 → API 令牌」）；
   然后生成一份你这款工具的 MCP 配置（名称 siyuan，远程 HTTP 类型，地址用探测命中的那个，
   需要鉴权时加请求头 Authorization: Token <令牌>）。如果你能直接编辑自己的 MCP 配置文件，
   直接写入并告诉我怎么让它生效；否则把配置和添加步骤输出给我照做。
4. MCP 连上之后：先列出当前可用的思源工具（名字带 plugin__ 前缀的是插件工具，末尾的随机后缀
   每台电脑不同，以实际列表为准，不要凭记忆硬编码）；${STEP4_ZH[plugin]}查询类操作直接做，写入、修改、删除类操作先征得我同意。`;
}

function promptEn(plugin: McpPluginKind): string {
    return `I want to connect my local SiYuan notes to you via MCP. Please set it up for me:

1. The SiYuan MCP endpoint is http://127.0.0.1:<port>/mcp; the first SiYuan workspace always
   listens on 6806. Probe it first: POST to http://127.0.0.1:6806/mcp with headers
   Content-Type: application/json and Accept: application/json, text/event-stream, body:
   {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"1.0"}}}
   The probe succeeds if the response's serverInfo.name equals "SiYuan".
2. If 6806 is unreachable, I will fill in the port shown in SiYuan under Settings → About
   ("Use in Browser") here: ____ — then retry the probe against http://127.0.0.1:<port>/mcp.
3. Once probed: if you get 401 or an auth challenge, ask me for the API token (SiYuan
   Settings → About → API token); then produce the MCP config for this tool (name siyuan,
   remote HTTP type, using the working address, plus header Authorization: Token <token> if
   auth is required). If you can edit your own MCP config file, write it directly and tell me
   how to make it take effect; otherwise output the config and steps for me to apply.
4. After connecting: list the available SiYuan tools first (plugin-provided tools carry a
   plugin__ prefix whose random suffix differs per machine — always trust the live list, never
   hard-code names); ${STEP4_EN[plugin]}queries may run directly, but ask before any write/update/delete.`;
}

export function mcpSetupPrompt(lang: string, plugin: McpPluginKind = "tomato"): string {
    return lang?.startsWith("zh") ? promptZh(plugin) : promptEn(plugin);
}
