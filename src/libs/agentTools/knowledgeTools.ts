// 知识库工具（knowledgebox □4）：把通道层（libs/knowledgeChannelCore 的智谱 adapter）
// 暴露成 MCP/Agent 双门脸同源工具。只读面起步——同步类写操作（uploadDoc/deleteDoc）
// 不进工具面（与 edit 工具的水线纪律同构：外部 AI 不拿到破坏性写权）。
// 依赖注入=ToolEnv.getKbChannel（可选面）：前端=Agent 面板直调，kernel=/mcp 经
// proxy 转发自足执行；缺面的门脸两工具不装配。
import { objectSchema, successResponse, errorResponse, type ToolDefinition, type ToolResponse } from "./common";
import type { ToolEnv } from "./env";

// knowledgebox □9 后 Key 在「知识库」域（不再挂 AI 助手域）；□6 发版材料核对时修正
const SETUP_HINT = "请在思源「设置 → 番茄 → 知识库」填写智谱 API Key，并在「知识库」面板把要检索的文档加入同步白名单";

export function createKnowledgeTools(env: ToolEnv): ToolDefinition[] {
  const getChannel = env.getKbChannel;
  if (!getChannel) return [];

  async function searchHandler(input: Record<string, any>): Promise<ToolResponse> {
    const query = String(input?.query ?? "").trim();
    if (!query) return errorResponse("query 不能为空");
    const topK = Number(input?.top_k ?? 8);
    const ch = await getChannel();
    const miss = ch.missingConfig();
    if (miss.length) return errorResponse(`知识库未配置：缺 ${miss.join("/")}。${SETUP_HINT}`);
    const results = await ch.retrieve(query, Number.isFinite(topK) ? topK : 8);
    return successResponse({
      count: results.length,
      // docID 非空时可反向定位思源原文块（块 id 可直接拼思源 URL）
      results: results.map(r => ({ text: r.text, score: r.score, docName: r.docName, docID: r.docID })),
    });
  }

  async function statusHandler(): Promise<ToolResponse> {
    const ch = await getChannel();
    const miss = ch.missingConfig();
    if (miss.length) {
      return successResponse({ configured: false, missing: miss, hint: SETUP_HINT });
    }
    // capacity 不依赖建库（账户级），先取；listDocs 走 ensureKb——未初始化（MCP 面不建库）
    // 时降级为 hint 而非整体失败：AI 拿到状态本身就该算成功
    const cap = await ch.capacity();
    let docCount: number | null = null;
    let vectorized: number | null = null;
    let hint: string | undefined;
    try {
      const docs = await ch.listDocs();
      docCount = docs.length;
      vectorized = docs.filter(d => d.stat === 1).length;
    } catch (e: any) {
      hint = e instanceof Error ? e.message : String(e);
    }
    return successResponse({
      configured: true,
      channel: ch.label,
      capacity: {
        usedWords: cap.usedWords, totalWords: cap.totalWords,
        usedBytes: cap.usedBytes, totalBytes: cap.totalBytes,
      },
      docCount,
      vectorized,
      ...(hint ? { hint } : {}),
    });
  }

  return [
    {
      name: "knowledge_search",
      config: objectSchema(
        "在番茄知识库中检索：内容来自用户在思源笔记里加入同步白名单的文档（已同步到智谱 BigModel），"
        + "返回最相关的原文切片（相似度分数+来源文档名，docID 非空=可定位回思源文档）。"
        + "适合回答与用户自己笔记内容相关的问题；笔记之外的通用知识勿用本工具",
        {
          query: { type: "string", description: "检索词（自然语言或关键词，限 1000 字）" },
          top_k: { type: "integer", description: "返回切片数（默认 8，上限 20）" },
        },
        ["query"],
      ),
      handler: searchHandler,
    },
    {
      name: "knowledge_status",
      config: objectSchema(
        "查看番茄知识库状态：是否已配置（智谱 API Key）、容量用量（字数/存储）、已同步文档数与向量化进度。"
        + "检索报错或疑似未配置时先调本工具",
        {},
      ),
      handler: statusHandler,
    },
  ];
}
