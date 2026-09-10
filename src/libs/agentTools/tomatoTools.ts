// pomodoro MCP 工具实现（A 层核心，环境无关）：单工具 pomodoro + action 枚举（一期实验面，tpmcp □4）。
// get_focuses=专注记录查询——数据源实探结论：番茄计时跑前端内存（kernel 够不着），
// 落盘只有两处——①tomato-stats.json 按日聚合（Record<'YYYY-MM-DD',{pomo,min}>，
// 只记自然到点完成的工作段）②文档 IAL custom-tomato-focus 绑定文档累计专注分钟。
// 逐段明细（何时~何时专注了什么）不存在，返回形态=日聚合统计+文档专注榜，不装明细。
// 数据访问一律走注入的 ToolEnv（□1 同源化），本文件不碰任何运行时全局。
import { objectSchema, successResponse, errorResponse, wrapHandler, type ToolDefinition } from "./common";
import type { ToolEnv } from "./env";

const STORAGE_TOMATO_STATS = "tomato-stats.json";
/** 文档专注属性（值=累计分钟字符串；kernel 会把 custom key 小写化，必须全小写） */
const FOCUS_ATTR = "custom-tomato-focus";
const DAY_MS = 24 * 3600 * 1000;

// ============ get_flashcards 闪卡归属统计（tpmcp □5） ============
// 数据面探明结论（09-10 主实例实探+源码核实）：卡块判据=IAL custom-riff-decks（值=deckID
// 或逗号分隔多 deckID）；「今日到期数」唯一通道=getRiffDueCards（riff API，3.9.0 v2 全重写
// 在途踩「等 v2」红线）已砍；卡组名不在 SQL 面不做清单，只给按组计数。

/** 卡块归属属性名（思源制卡落 IAL；kernel 小写化 custom key，此名已全小写） */
const RIFF_DECKS_ATTR = "custom-riff-decks";
/** 渐进摘抄文档 ctime 属性名（值=bookID#ct，🔨# 前缀=素材推完；名同渐进 kernel progData.PDIGEST_CTIME） */
const PDIGEST_CTIME = "custom-pdigest-ctime";
/** 思源官方快制卡组 id（思源 app/src/constants.ts QUICK_DECK_ID，2023-02 引入后未变；番茄 addRiffCards 默认组）。
 *  ⚠️ 勿与旧观察值 20221228162116-3ux0xsp 混淆——那是 bear 主库的自建卡组「驾考」 */
const QUICK_DECK_ID = "20230218211946-2kw8jgx";
/** byDoc 返回上限（主库实测量级=334 持卡文档，全量进 MCP 响应太重；docCount 字段报总数） */
const BYDOC_CAP = 50;

/** ctime 值 → bookID（复刻自 sy-progressive-plugin/src/kernel/progData.parseBookIDFromCtime，改源头须同步） */
export function parseBookIDFromCtime(value: string): string {
  const v = value.startsWith("🔨#") ? value.slice("🔨#".length) : value;
  return v.split("#")[0] ?? "";
}

/** 闪卡聚合纯函数（单测靶）：属性行+块行+归书映射+文档名行 → AI 可判读结构 */
export function aggregateFlashcards(
  deckRows: { block_id: string; value: string }[],
  rootRows: { id: string; root_id: string }[],
  bookOfDoc: Map<string, string>,
  titleRows: { id: string; content: string; hpath: string }[],
) {
  const rootOf = new Map(rootRows.map(r => [r.id, String(r.root_id ?? "")]));
  const titleOf = new Map(titleRows.map(r => [r.id, String(r.content ?? "")]));
  const hpathOf = new Map(titleRows.map(r => [r.id, String(r.hpath ?? "")]));
  const total = deckRows.length;
  const staleAttrRows = deckRows.filter(r => !rootOf.has(r.block_id)).length;
  // 按宿主文档计数（块已删的残留属性行不进分组，计进 staleAttrRows）
  const docCount = new Map<string, number>();
  for (const r of deckRows) {
    const root = rootOf.get(r.block_id);
    if (root) docCount.set(root, (docCount.get(root) ?? 0) + 1);
  }
  // 按卡组计数（一卡多组在各组各计 1，ΣbyDeck.cards 可大于 total；只算存活卡块——
  // 块已删的残留属性行不代表在世卡，卡组面与文档面同口径排除）
  const deckAgg = new Map<string, number>();
  for (const r of deckRows) {
    if (!rootOf.has(r.block_id)) continue;
    for (const d of String(r.value ?? "").split(",").map(s => s.trim()).filter(Boolean)) {
      deckAgg.set(d, (deckAgg.get(d) ?? 0) + 1);
    }
  }
  // ctime 归书：渐进摘抄文档的卡聚到所属渐进书（书文档本体制的卡无 ctime，不在此列）
  const bookAgg = new Map<string, { cards: number; docs: number }>();
  for (const [doc, n] of docCount) {
    const book = bookOfDoc.get(doc);
    if (!book) continue;
    const agg = bookAgg.get(book) ?? { cards: 0, docs: 0 };
    agg.cards += n;
    agg.docs += 1;
    bookAgg.set(book, agg);
  }
  return {
    total,
    staleAttrRows,
    docCount: docCount.size,
    byDeck: [...deckAgg.entries()]
      .map(([deckID, cards]) => ({ deckID, cards, quick: deckID === QUICK_DECK_ID }))
      .sort((a, b) => b.cards - a.cards),
    byDoc: [...docCount.entries()]
      .map(([docID, cards]) => ({ docID, title: titleOf.get(docID) ?? "", hpath: hpathOf.get(docID) ?? "", cards }))
      .sort((a, b) => b.cards - a.cards)
      .slice(0, BYDOC_CAP),
    byBook: [...bookAgg.entries()]
      .map(([bookID, agg]) => ({ bookID, bookTitle: titleOf.get(bookID) ?? "", cards: agg.cards, docs: agg.docs }))
      .sort((a, b) => b.cards - a.cards),
  };
}

const FLASHCARDS_HINT = [
  "total=全库卡块数（番茄制卡+用户自建卡组都算）；byDeck=按卡组计数（quick=true=思源快制卡组，",
  "番茄制卡默认落此；卡组名在内核 riff 库不在 SQL 面，故不报名）；byDoc=按宿主文档计数 top 50",
  "（docCount=持卡文档总数，hpath=笔记本内路径）；byBook=渐进摘抄文档归书统计",
  "（cards=该书制卡数/docs=持卡摘抄文档数，bookTitle 空=书已删）；staleAttrRows=块已删的残留属性行。",
].join("");

async function getFlashcards(env: ToolEnv) {
  const [deckRows, ctimeRows] = await Promise.all([
    env.sql<{ block_id: string; value: string }>(
      `select block_id, value from attributes where name='${RIFF_DECKS_ATTR}' limit 10000000`),
    env.sql<{ block_id: string; value: string }>(
      `select block_id, value from attributes where name='${PDIGEST_CTIME}' limit 10000000`),
  ]);
  const cards = deckRows ?? [];
  const bookOfDoc = new Map<string, string>();
  for (const r of ctimeRows ?? []) {
    if (!r.value?.includes("#")) continue;
    const book = parseBookIDFromCtime(r.value);
    if (book) bookOfDoc.set(r.block_id, book);
  }
  if (!cards.length) {
    return successResponse({
      total: 0, staleAttrRows: 0, docCount: 0,
      byDeck: [], byDoc: [], byBook: [], hint: FLASHCARDS_HINT,
    });
  }
  const inList = cards.map(r => `'${r.block_id}'`).join(",");
  const rootRows = await env.sql<{ id: string; root_id: string }>(
    `select id, root_id from blocks where id in (${inList}) limit 10000000`) ?? [];
  // 文档名一批拉：宿主文档 ∪ 有卡摘抄文档归到的渐进书
  const docIds = [...new Set(rootRows.map(r => String(r.root_id ?? "")).filter(Boolean))];
  const bookIds = [...new Set(docIds.map(d => bookOfDoc.get(d)).filter(Boolean) as string[])];
  const titleIds = [...new Set([...docIds, ...bookIds])];
  const tList = titleIds.length ? titleIds.map(i => `'${i}'`).join(",") : "''";
  const titleRows = await env.sql<{ id: string; content: string; hpath: string }>(
    `select id, content, hpath from blocks where type='d' and id in (${tList}) limit 10000000`) ?? [];
  return successResponse({
    ...aggregateFlashcards(cards, rootRows, bookOfDoc, titleRows),
    hint: FLASHCARDS_HINT,
  });
}

function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function isValidDay(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** range 解析 → [start, end]（含两端，YYYY-MM-DD）；非法 null */
function parseRange(range: string, now: number): [string, string] | null {
  const today = dayKey(new Date(now));
  if (!range || range === "today") return [today, today];
  if (range === "week") return [dayKey(new Date(now - 6 * DAY_MS)), today];
  if (range === "month") return [dayKey(new Date(now - 29 * DAY_MS)), today];
  const m = range.match(/^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/);
  if (m) return [m[1], m[2]];
  if (isValidDay(range)) return [range, range];
  return null;
}

async function readStats(env: ToolEnv): Promise<Record<string, { pomo?: number; min?: number }>> {
  const d = await env.readPluginJson(STORAGE_TOMATO_STATS);
  return d && typeof d === "object" ? d : {};
}

async function getFocuses(env: ToolEnv, input: Record<string, any>) {
  const range = String(input.range ?? "today");
  const [start, end] = parseRange(range, Date.now()) ?? [null, null];
  if (!start) {
    return errorResponse(`range 非法：${range}（用 'today'/'week'/'month'/'YYYY-MM-DD'/'YYYY-MM-DD..YYYY-MM-DD'）`);
  }
  const stats = await readStats(env);
  // YYYY-MM-DD 字典序=时间序，直接窗口过滤（稀疏 map：无记录日不占位）
  const days = Object.keys(stats).filter(k => k >= start && k <= end && isValidDay(k)).sort()
    .map(k => {
      const v = stats[k] ?? {};
      const pomo = Number(v.pomo), min = Number(v.min);
      return {
        date: k,
        pomo: Number.isFinite(pomo) && pomo > 0 ? Math.floor(pomo) : 0,
        min: Number.isFinite(min) && min > 0 ? Math.floor(min) : 0,
      };
    });
  const totals = {
    pomo: days.reduce((s, d) => s + d.pomo, 0),
    min: days.reduce((s, d) => s + d.min, 0),
    activeDays: days.filter(d => d.pomo > 0).length,
  };
  // 文档专注榜（累计值无日期维度，全库榜）
  const rows = await env.sql<{ block_id: string; value: string }>(
    `select block_id, value from attributes where name='${FOCUS_ATTR}' limit 10000000`) ?? [];
  const ids = rows.map(r => r.block_id);
  const inList = ids.length ? ids.map(i => `'${i}'`).join(",") : "''";
  const docRows = await env.sql<{ id: string; content: string }>(
    `select id, content from blocks where type='d' and id in (${inList}) limit 10000000`) ?? [];
  const titleOf = new Map(docRows.map(r => [r.id, String(r.content ?? "")]));
  const docs = rows
    .map(r => {
      const n = Number(r.value);
      return {
        docID: r.block_id,
        title: titleOf.get(r.block_id) ?? "",
        focusMinutes: Number.isFinite(n) && n > 0 ? Math.floor(n) : 0,
      };
    })
    .filter(d => d.focusMinutes > 0)
    .sort((a, b) => b.focusMinutes - a.focusMinutes)
    .slice(0, 20);
  return successResponse({
    range: `${start}..${end}`,
    days, totals, docs,
    hint: "days/totals=按日聚合（只记自然到点完成的番茄段，跳过/中止不计；pomo=番茄数 min=分钟数）；docs=绑定文档累计专注榜（全库累计无日期维度，top 20）",
  });
}

const pomodoroDescription = [
    "番茄工具箱（番茄钟+闪卡）的时间轴查询通道（一期实验，只读免费）。",
    "get_focuses(range)=专注记录：过去一段时间的番茄统计（按日番茄数/分钟数+汇总）+",
    "绑定文档累计专注榜。range 支持 'today'/'week'/'month'/单日/起止区间。",
    "get_flashcards()=闪卡归属统计：全库卡块数+按卡组/宿主文档计数+渐进书归书聚合",
    "（到期数属内核 riff 调度库，3.9.0 v2 重写在途暂不暴露）。",
    "与 progressive 工具互补：本工具看过去（专注了多久/制了多少卡），progressive 看现在与未来（复习与排期）。",
].join("");

export function createPomodoroTool(env: ToolEnv): ToolDefinition {
    return {
        name: "pomodoro",
        config: objectSchema(pomodoroDescription, {
            action: {
                type: "string",
                enum: ["get_focuses", "get_flashcards", "echo"],
                description: "get_focuses=专注统计+文档专注榜；get_flashcards=闪卡归属统计；echo=通道自检",
            },
            range: {
                type: "string",
                description: "get_focuses 用：'today'（默认）/'week'（近 7 天）/'month'（近 30 天）/'YYYY-MM-DD'/'YYYY-MM-DD..YYYY-MM-DD'",
            },
            message: {
                type: "string",
                description: "echo 用：回显文本，可省略",
            },
        }, ["action"]),
        handler: wrapHandler(async input => {
            switch (String(input.action ?? "")) {
                case "echo":
                    return successResponse({ echo: typeof input.message === "string" ? input.message : "pong", plugin: "sy-tomato-plugin" });
                case "get_focuses": return await getFocuses(env, input);
                case "get_flashcards": return await getFlashcards(env);
                default:
                    return errorResponse(`未知 action：${input.action}（可用：get_focuses/get_flashcards/echo）`);
            }
        }),
    };
}
