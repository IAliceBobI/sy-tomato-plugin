// Coze 工具（A 层核心，□3）：知识库管理+智能体问答包成单工具 coze + action 枚举。
// 仅前端门脸装配（ToolEnv.canExternalHttp 门控——kernel goja 无外网 fetch 物理不可达
// api.coze.cn，外部 /mcp 列表保持干净）。契约事实源=原 libs/cozeAI.ts（v1 knowledge API）
// + Coze v3 chat 三步流（09-10 官方文档实锤：POST /v3/chat 非流式仅回元数据 → 轮询 GET
// /v3/chat/retrieve 至终态 → GET /v3/chat/message/list 取 type=answer；消息数组直接挂 data）。
// 能力迁自退役的 CozeSearchBox UI（bear 拍板：UI 破 API 好）。
import { objectSchema, successResponse, errorResponse, wrapHandler, type ToolDefinition } from "./common";
import type { ToolEnv } from "./env";

const COZE_BASE = "https://api.coze.cn";
/** Coze 文档名规范（沿用原 getCozeName：标题去点截 20 + "." + 思源 id——删除/重建按名对齐） */
export function getCozeName(name: string, id: string): string {
  return (name ?? "").replaceAll(".", "").slice(0, 20) + "." + id;
}

/** 文档名 → {title, docID}（getCozeName 的逆：末段=id、其余=标题） */
function parseCozeName(name: string): { title: string; docID: string } {
  const t = String(name ?? "").split(".");
  return { title: t.slice(0, -1).join("."), docID: t[t.length - 1] ?? "" };
}

/** Coze 侧用户标识（固定常量：勿用许可/登录身份跨服务外发，review P2） */
const COZE_USER = "siyuan-tomato";

interface CozeConfig {
  token: string;
  knowledgeID: string;
  appID: string;
}

async function ensureCfg(env: ToolEnv, need: "knowledge" | "bot") {
  const cfg: CozeConfig = await env.getCozeConfig();
  const missing: string[] = [];
  if (!cfg.token) missing.push("OAuth Token");
  if (need === "knowledge" && !cfg.knowledgeID) missing.push("知识库 ID");
  if (need === "bot" && !cfg.appID) missing.push("智能体 ID");
  if (missing.length) {
    return {
      err: errorResponse(`Coze 配置缺失：${missing.join("、")}——请在番茄设置→功能仓库→coze 知识库问答（AI 工具）区填写`),
      cfg,
    };
  }
  return { err: null as null, cfg };
}

function cozeHeaders(cfg: CozeConfig): Record<string, string> {
  return { Authorization: `Bearer ${cfg.token}`, "Agw-Js-Conv": "str" };
}

/** Coze body 内业务码非 0 = 失败（HTTP 层仍 200） */
function cozeFail(ret: any, what: string) {
  const code = Number(ret?.code);
  if (Number.isFinite(code) && code !== 0) {
    return `Coze ${what} 失败 code=${code} ${String(ret?.msg ?? "").slice(0, 100)}`.trim();
  }
  return null;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** 分页聚合知识库文档清单（复刻原 coze_get_all_files，页数封顶防死循环） */
async function listAllDocs(env: ToolEnv, cfg: CozeConfig) {
  const all: { document_id: string; name: string }[] = [];
  for (let page = 1; page <= 50; page++) {
    const ret = await env.postExternal(`${COZE_BASE}/open_api/knowledge/document/list`, {
      dataset_id: cfg.knowledgeID, page, size: 100,
    }, cozeHeaders(cfg));
    const fail = cozeFail(ret, "document/list");
    if (fail) throw new Error(fail);
    if (Array.isArray(ret?.document_infos)) all.push(...ret.document_infos);
    if (all.length >= Number(ret?.total ?? 0)) break;
  }
  return all;
}

/** UTF-8 安全 base64（btoa 直塞中文炸）；coze 工具仅前端门脸装配，btoa/TextEncoder 可用 */
function encodeToBase64(str: string): string {
  let binary = "";
  for (const b of new TextEncoder().encode(str)) binary += String.fromCharCode(b);
  return btoa(binary);
}

async function runCoze(env: ToolEnv, input: Record<string, any>) {
  const action = String(input.action ?? "");
  switch (action) {
    case "list_docs": {
      const { err, cfg } = await ensureCfg(env, "knowledge");
      if (err) return err;
      const all = await listAllDocs(env, cfg);
      return successResponse({
        total: all.length,
        docs: all.map(f => {
          const { title, docID } = parseCozeName(f.name);
          // 非本工具上传的文档（名字含点）末段不是思源 id：原样透出全名免误导
          const sane = /^\d{14}-[0-9a-z]{7}$/.test(docID);
          return { docID: sane ? docID : "", title: sane ? title : f.name, documentID: f.document_id };
        }),
        hint: "docs=Coze 知识库当前文档清单（docID=思源文档 id，title=上传时的标题）；空=尚未上传或配置的 knowledgeID 无效",
      });
    }
    case "upload_doc": {
      const { err, cfg } = await ensureCfg(env, "knowledge");
      if (err) return err;
      const docID = String(input.docID ?? "").trim();
      if (!docID) return errorResponse("docID 缺失：请提供思源文档 id（上传该文档及其全部子文档）");
      const rows = await env.getDocTreeMarkdown(docID);
      if (!rows?.length) return errorResponse(`文档 ${docID} 无内容或不存在`);
      const host = rows.find(r => r.id === docID) ?? rows[0];
      const name = getCozeName(String(host.content ?? ""), docID);
      // 先删同名旧版（幂等重建）
      for (const f of await listAllDocs(env, cfg)) {
        if (f.name === name) {
          const del = await env.postExternal(`${COZE_BASE}/open_api/knowledge/document/delete`,
            { document_ids: [f.document_id] }, cozeHeaders(cfg));
          const delFail = cozeFail(del, "document/delete");
          if (delFail) return errorResponse(delFail);
        }
      }
      const ret = await env.postExternal(`${COZE_BASE}/open_api/knowledge/document/create`, {
        dataset_id: cfg.knowledgeID,
        chunk_strategy: { remove_extra_spaces: true, remove_urls_emails: true, chunk_type: 0 },
        format_type: 0,
        document_bases: [{
          source_info: { file_type: "md", file_base64: encodeToBase64(rows.map(r => r.markdown).join("\n\n")) },
          name,
        }],
      }, cozeHeaders(cfg));
      const fail = cozeFail(ret, "document/create");
      if (fail) return errorResponse(fail);
      return successResponse({ uploaded: name, docs: rows.length, hint: "已重建知识库文档（先删旧版再上传）" });
    }
    case "delete_doc": {
      const { err, cfg } = await ensureCfg(env, "knowledge");
      if (err) return err;
      const name = String(input.name ?? "").trim();
      if (!name) return errorResponse("name 缺失：要删除的知识库文档名（list_docs 里的 docID 拼标题形态，或原样 name）");
      const hit = (await listAllDocs(env, cfg)).filter(f => f.name === name);
      if (!hit.length) return successResponse({ deleted: 0, hint: `未找到名为 ${name} 的文档` });
      let deleted = 0;
      for (const f of hit) {
        const del = await env.postExternal(`${COZE_BASE}/open_api/knowledge/document/delete`,
          { document_ids: [f.document_id] }, cozeHeaders(cfg));
        const delFail = cozeFail(del, "document/delete");
        if (delFail) return errorResponse(`${delFail}（已删 ${deleted}/${hit.length}）`);
        deleted++;
      }
      return successResponse({ deleted });
    }
    case "ask": {
      const { err, cfg } = await ensureCfg(env, "bot");
      if (err) return err;
      const query = String(input.query ?? "").trim();
      if (!query) return errorResponse("query 缺失：要问智能体的问题");
      // v3 chat（v2 已官方废弃）：非流式响应=仅元数据立即返回（无论是否处理完毕），须轮询
      // /v3/chat/retrieve 至终态再 GET /v3/chat/message/list 取回答（09-10 官方文档实锤：
      // stream=false 时 auto_save_history 必须为 true；消息数组直接挂 data、无 items 层）
      const chat = await env.postExternal(`${COZE_BASE}/v3/chat`, {
        bot_id: cfg.appID,
        user_id: COZE_USER,
        stream: false,
        auto_save_history: true,
        additional_messages: [{ role: "user", content: query, content_type: "text" }],
      }, cozeHeaders(cfg));
      const chatFail = cozeFail(chat, "chat");
      if (chatFail) return errorResponse(chatFail);
      const convID = String(chat?.data?.conversation_id ?? "");
      const chatID = String(chat?.data?.id ?? "");
      if (!convID || !chatID) {
        return errorResponse(`Coze chat 响应缺会话标识（data=${JSON.stringify(chat?.data ?? {}).slice(0, 100)}）`);
      }
      // 轮询对话详情至终态：首查立即（chat 常已顺手完成），后续 ≥1s 间隔（官方建议），
      // 30 次封顶≈33s；requires_action=智能体带需回调的插件工具，本通道无法续跑
      let status = "";
      let lastError = "";
      for (let i = 0; i < 30; i++) {
        if (i > 0) await sleep(1100);
        const ret = await env.getExternal(
          `${COZE_BASE}/v3/chat/retrieve?conversation_id=${encodeURIComponent(convID)}&chat_id=${encodeURIComponent(chatID)}`,
          cozeHeaders(cfg));
        const fail = cozeFail(ret, "chat/retrieve");
        if (fail) return errorResponse(fail);
        status = String(ret?.data?.status ?? "");
        lastError = String(ret?.data?.last_error?.msg ?? "");
        if (status !== "created" && status !== "in_progress") break;
      }
      if (status === "requires_action") {
        return errorResponse("Coze 对话停在 requires_action（智能体配置了需回调的工具插件，本通道无法续跑）——请在 coze 侧调整智能体");
      }
      if (status !== "completed") {
        return errorResponse(`Coze 对话未完成（status=${status || "轮询超时"}${lastError ? `：${lastError.slice(0, 100)}` : ""}）`);
      }
      const list = await env.getExternal(
        `${COZE_BASE}/v3/chat/message/list?conversation_id=${encodeURIComponent(convID)}&chat_id=${encodeURIComponent(chatID)}`,
        cozeHeaders(cfg));
      const listFail = cozeFail(list, "message/list");
      if (listFail) return errorResponse(listFail);
      const messages: { type: string; content: string }[] = Array.isArray(list?.data) ? list.data : [];
      const answer = messages.filter(m => m.type === "answer").map(m => m.content).join("\n");
      const followUps = messages.filter(m => m.type === "follow_up").map(m => m.content);
      return successResponse({
        answer,
        followUps,
        conversationID: convID,
        hint: "answer=智能体回答（已挂知识库检索）；followUps=建议的追问；空 answer=智能体没说话可换个问法",
      });
    }
    default:
      return errorResponse(`未知 action：${input.action}（可用：list_docs/upload_doc/delete_doc/ask）`);
  }
}

const cozeDescription = [
  "Coze 知识库与智能体工具（番茄 AI 工具层；面板直调可用——桌面/浏览器均可，外部 /mcp 工具列表不含本工具）：",
  "管理已传文档、向挂了知识库的智能体提问。",
  "list_docs()=知识库文档清单；upload_doc(docID)=上传该文档及全部子文档（markdown 合并，",
  "先删旧版幂等重建）；delete_doc(name)=按名删除；ask(query)=问智能体（须配智能体 ID）。",
  "配置（OAuth Token/知识库 ID/智能体 ID）在番茄设置→功能仓库的 coze 区；未配置时会给指引。",
].join("");

export function createCozeTool(env: ToolEnv): ToolDefinition {
  return {
    name: "coze",
    config: objectSchema(cozeDescription, {
      action: {
        type: "string",
        enum: ["list_docs", "upload_doc", "delete_doc", "ask"],
        description: "list_docs=知识库清单；upload_doc=上传文档树；delete_doc=按名删；ask=问智能体",
      },
      docID: {
        type: "string",
        description: "upload_doc 用：思源文档 id（上传该文档及其全部子文档）",
      },
      name: {
        type: "string",
        description: "delete_doc 用：知识库文档名（list_docs 可查）",
      },
      query: {
        type: "string",
        description: "ask 用：要问的问题",
      },
    }, ["action"]),
    handler: wrapHandler(async input => runCoze(env, input)),
  };
}
