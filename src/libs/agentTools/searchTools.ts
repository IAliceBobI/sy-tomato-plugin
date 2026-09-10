// 知识库检索工具（A 层核心，□2）：semantic/fts 双通道包成单工具 search + engine 参数。
// 契约事实源（思源源码 3.8.3，review P0 实锤后修正）：
// - kernel/api/search.go parseSearchBlockArgs：query/page/pageSize/paths——paths 只认
//   NodeID 段（14 位时间戳-7 位随机串）：裸 boxID=聚焦笔记本、boxID/docID…=物理文档树
//   ID 路径（单段 docID=聚焦该文档及子文档）。人类可读 hpath 段过不了 IsValidSearchBoxPath，
//   且失败是「整条静默丢弃连 box 一起」→ 请求退化成全库搜索还 code 0——工具层必须预校验。
// - kernel/model/embedding.go:437/441：未配嵌入、嵌入服务调用失败，semanticSearchBlock
//   都静默返回空 blocks→auto 模式=探测可用性 + 空结果二发 fts 兜底。
// 返回按 token 经济学裁剪：每块紧凑结构+可转述给用户的块链接，摘要截断 CONTENT_CAP。
import { objectSchema, successResponse, errorResponse, wrapHandler, type ToolDefinition } from "./common";
import type { ToolEnv } from "./env";

const CONTENT_CAP = 160;
const LIMIT_DEFAULT = 8;
const LIMIT_MAX = 20;
const SEMANTIC_ENDPOINT = "/api/search/semanticSearchBlock";
const FTS_ENDPOINT = "/api/search/fullTextSearchBlock";
/** 思源 NodeID 形态（lute ast.IsNodeIDPattern：14 位时间戳 + '-' + 7 位小写字母数字） */
const NODE_ID_RE = /^\d{14}-[0-9a-z]{7}$/;

/** 内核 model.Block → AI 可判读紧凑结构（多余字段全裁掉省 token） */
function trimBlocks(raw: any[]): {
  id: string; type: string; content: string; hPath: string; box: string; rootID: string; updated: string; link: string;
}[] {
  return (raw ?? []).map((b: any) => {
    // fts 通道的 content 带 <mark> 高亮标签（搜索引擎产物，AI 上下文里是噪音）——剥掉
    const content = String(b?.content ?? "").replace(/<\/?mark>/g, "").replace(/\s+/g, " ").trim();
    const snippet = content.length > CONTENT_CAP ? content.slice(0, CONTENT_CAP) : content;
    const id = String(b?.id ?? "");
    // link 文本剥 []（markdown 链接语法字符，如代码内容 arr[0] 会截断链接）并折叠由此产生的连续空白
    const label = snippet.replace(/[\[\]]/g, " ").replace(/\s+/g, " ").trim();
    return {
      id,
      type: String(b?.type ?? ""),
      content: snippet,
      hPath: String(b?.hPath ?? ""),
      box: String(b?.box ?? ""),
      rootID: String(b?.rootID ?? ""),
      updated: String(b?.updated ?? ""),
      link: `[${label}](siyuan://blocks/${id})`,
    };
  });
}

async function callSearch(env: ToolEnv, endpoint: string, payload: Record<string, any>) {
  const data = await env.postApi(endpoint, payload);
  return {
    blocks: trimBlocks(Array.isArray(data?.blocks) ? data.blocks : []),
    matchedBlockCount: Number(data?.matchedBlockCount) || 0,
    matchedRootCount: Number(data?.matchedRootCount) || 0,
  };
}

const HINT = [
  "engine=实际使用的通道（semantic=语义/fts=关键词）；degraded=true=语义不可用或语义空结果已回退关键词；",
  "blocks[].link 可原样转述给用户点击（siyuan:// 协议）；hPath=笔记本内文档路径；matchedBlockCount=命中总块数",
  "（blocks 只含当前页 limit 条，可传 page 翻页）；box=笔记本 id、path=文档 id 或文档树 id 路径（聚焦该文档及子文档）。",
].join("");

const FALLBACK_HINT = "语义通道空结果（真无命中或嵌入服务调用失败均可能），已回退关键词检索；";

async function runSearch(env: ToolEnv, input: Record<string, any>) {
  const query = String(input.query ?? "").trim();
  if (!query) {
    return errorResponse("query 缺失：请提供检索词");
  }
  const engine = String(input.engine ?? "auto");
  if (!["auto", "semantic", "fts"].includes(engine)) {
    return errorResponse(`engine 非法：${engine}（用 'auto'（默认）/'semantic'/'fts'）`);
  }
  let limit = Number(input.limit);
  if (!Number.isFinite(limit) || limit < 1) limit = LIMIT_DEFAULT;
  limit = Math.min(Math.floor(limit), LIMIT_MAX);
  let page = Number(input.page);
  if (!Number.isFinite(page) || page < 1) page = 1;

  const box = String(input.box ?? "").trim();
  const path = String(input.path ?? "").trim();
  const payload: Record<string, any> = { query, page, pageSize: limit };
  if (box || path) {
    if (!box) {
      return errorResponse("path 过滤须伴 box（思源检索通道 paths=boxID/docID 形态）");
    }
    // 预校验（防内核 IsValidSearchBoxPath 静默整条丢弃→伪装成功的全库搜索）
    if (!NODE_ID_RE.test(box)) {
      return errorResponse(
        `box 非法：'${box.slice(0, 40)}' 不是笔记本 id（形如 20230101120000-abcdefg，非笔记本名）；可用 /api/notebook/lsNotebooks 查 id`,
      );
    }
    if (path) {
      const segs = path.split("/").map(s => s.trim()).filter(Boolean);
      if (!segs.length || !segs.every(s => NODE_ID_RE.test(s))) {
        return errorResponse(
          `path 非法：'${path.slice(0, 60)}' 须为文档 id 或文档树 id 路径（形如 20230101130000-xyzwxyz，可多段 / 相连；不支持人类可读标题路径）`,
        );
      }
      payload.paths = [`${box}/${segs.join("/")}`];
    } else {
      payload.paths = [box];
    }
  }

  if (engine === "fts") {
    const r = await callSearch(env, FTS_ENDPOINT, payload);
    return successResponse({ ...r, engine: "fts", degraded: false, hint: HINT });
  }
  const { available } = await env.semanticSearchAvailable();
  if (!available) {
    if (engine === "semantic") {
      return errorResponse(
        "语义检索不可用：未配置嵌入模型（思源设置→AI→嵌入，配置后内核自动为全库建索引，一次性成本约几块钱）。"
        + "可改用 engine:'fts' 关键词检索。",
      );
    }
    const r = await callSearch(env, FTS_ENDPOINT, payload);
    return successResponse({ ...r, engine: "fts", degraded: true, hint: HINT });
  }
  const r = await callSearch(env, SEMANTIC_ENDPOINT, payload);
  // 空结果二发 fts：嵌入服务调用失败与真无命中在返回面不可区分（都静默空），兜一手
  if (r.matchedBlockCount === 0) {
    const f = await callSearch(env, FTS_ENDPOINT, payload);
    if (f.matchedBlockCount > 0) {
      return successResponse({ ...f, engine: "fts", degraded: true, hint: FALLBACK_HINT + HINT });
    }
  }
  return successResponse({ ...r, engine: "semantic", degraded: false, hint: HINT });
}

const searchDescription = [
  "知识库内容块检索（番茄 AI 工具层，只读免费）：按自然语言语义或关键词在全库/指定范围找内容块。",
  "engine='auto'（默认，语义可用走语义、语义空结果回退关键词）|'semantic'（强制语义，未配嵌入模型会报错并给配置指引）",
  "|'fts'（关键词）。box=笔记本 id；path=文档 id 或文档树 id 路径（聚焦该文档及子文档，不支持标题路径）——",
  "两者都只认思源 id 形态（20230101120000-abcdefg）。limit=每页块数（默认 8，上限 20）；page=页码（默认 1，勿深翻）。",
  "返回紧凑块结构+siyuan:// 链接（转述给用户可点击溯源），适合作为问答/总结的上下文来源。",
].join("");

export function createSearchTool(env: ToolEnv): ToolDefinition {
  return {
    name: "search",
    config: objectSchema(searchDescription, {
      query: {
        type: "string",
        description: "检索词（自然语言或关键词）",
      },
      engine: {
        type: "string",
        enum: ["auto", "semantic", "fts"],
        description: "检索通道：auto=自动（默认）、semantic=语义（须配嵌入模型）、fts=关键词",
      },
      box: {
        type: "string",
        description: "笔记本 id（形如 20230101120000-abcdefg，非笔记本名）",
      },
      path: {
        type: "string",
        description: "文档 id 或文档树 id 路径（聚焦该文档及子文档；不支持人类可读标题路径）",
      },
      limit: {
        type: "number",
        description: "每页块数（默认 8，上限 20）",
      },
      page: {
        type: "number",
        description: "页码（默认 1；matchedBlockCount 报总数，勿深翻）",
      },
    }, ["query"]),
    handler: wrapHandler(async input => runSearch(env, input)),
  };
}
