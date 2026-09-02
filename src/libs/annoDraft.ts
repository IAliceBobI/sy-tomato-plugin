// □4 批注草稿链：草稿文档懒查找/懒创建 + 每弹窗独立草稿块（即用即删）+ 启动清扫。
// 拍板（handoff □4 mini-spec 倾向落地）：**关闭即删**——重开编辑弹窗从属性 text 回填草稿块，
// 等价「续写上条内容」且无残留态可管理；崩溃/中断残留由启动清扫兜底。
// - 草稿文档 = 全局单文档 ".tomato-批注草稿"。落点（2026-09-02 二轮拍板「藏上个月」）：
//   选定笔记本（用户设置 commentBoxAnnoDraftNotebook > 官方日记本判定 local-dailynoteid/单本 > 当前笔记本）
//   > 本内最近一篇日记的「上一个月目录」（当月在用易被翻见，上月是过去式无感；月段名非 YYYY-MM 时
//   退化到日记的祖父层；无日记结构则落本根）。上月目录不存在=自动造空月份文档（与真实月份同构）。
//   首次创建定终身：之后按标题全库扫描复用，跨月不搬家；设置面板默认显示日记本
//   （initAnnoDraftNotebookDefault 启动注入内存，不落盘=未配置语义不丢）
// - 每次开编辑弹窗预置 id 建独立超级块草稿（多窗口天然隔离）；保存/关闭即删，删除失败静默（清扫兜底）
// - 清扫只清不建：启动时若找到草稿文档则清空子块（注：多窗口同工作区极端场景会误伤他窗在编辑的草稿，
//   单窗口为主流用法，接受该边界——属性是 source of truth，草稿丢了重开编辑即恢复）
import { siyuan } from "./utils";
import { commentBoxAnnoDraftNotebook, DRAFT_NOTEBOOK_KEY } from "./stores";
import { events } from "./Events";
import { stripDraftShell } from "./annoKramdown";

export const DRAFT_DOC_TITLE = ".tomato-批注草稿";
/** 模块级缓存：同会话重复开弹窗免查；reload=新代模块自然失效（window.eval 无模块缓存，AGENTS 踩坑表） */
let cachedDocID = "";
/** 缓存已解析的草稿安家目录（hpath，""=本根；null=失效待重解析）+ 所属 box；壳删重建时免 conf+SQL 两查 */
let cachedDraftHome: string | null = null;
let cachedDraftHomeBox = "";

/** 活跃草稿登记簿（globalThis 跨模块代共享）：deploy 钩子的插件 reload 是惰性的——下次 UI 动作才真正换模块，
 *  新代 onload 的清扫会与「同一次点击刚打开的编辑弹窗草稿」赛跑误删（e2e 实锤两次）；
 *  清扫跳过登记在册的年轻草稿；条目带时间戳，孤儿登记（弹窗随旧代销毁未回调）10 分钟后照常可扫 */
const DRAFTS_REG = "tomatoAnnoActiveDrafts_zZmqus5PtYRi";
type DraftsMap = Map<string, number>;

function activeDrafts(): DraftsMap {
    const g = globalThis as Record<string, unknown>;
    if (!(g[DRAFTS_REG] instanceof Map)) g[DRAFTS_REG] = new Map();
    return g[DRAFTS_REG] as DraftsMap;
}

const DRAFT_ACTIVE_GRACE_MS = 10 * 60 * 1000;

/** 按标题全库找草稿壳（hpath 随落点可变，不能按路径直查）。
 *  SQL 按标题取文档行有索引延迟（AGENTS 踩坑表）——场景过筛：旧壳索引自早已就绪；
 *  新壳走 cachedDocID；用户手删壳后 SQL 残留 ~6s 由 checkBlockExist 校验识破（不赌索引） */
async function findDraftDocID(): Promise<string> {
    if (cachedDocID) {
        if (await siyuan.checkBlockExist(cachedDocID)) return cachedDocID;
        cachedDocID = ""; // 用户手删草稿文档 → 懒重建（mini-spec）
    }
    try {
        const rows = (await siyuan.sql(`select id from blocks where type='d' and content='${DRAFT_DOC_TITLE}'`)) ?? [];
        for (const r of rows) {
            if (r?.id && (await siyuan.checkBlockExist(r.id))) {
                cachedDocID = r.id;
                return r.id;
            }
        }
    } catch (e) {
        console.warn("[tomato anno] find draft doc failed:", e);
    }
    return "";
}

/** 官方「日记本」判定（纯函数，单测覆盖；与前端 openDailyNote 同源语义，app/src/util/mount.ts）：
 *  local-dailynoteid（官方 key 历史拼写）= 上次建日记用的笔记本，须 open 有效；
 *  仅一个 open 笔记本时直选它（官方同款）；其余情况无确定日记本返回 ""（落点链滑到当前笔记本）。
 *  注：内核没有「日记本」配置项——DailyNoteSavePath 是 box 级且出厂人人有默认值，不可作判定（2026-09-02 查内核源码定案） */
export function dailyNotebookFromStorage(
    storage: Record<string, unknown> | undefined | null,
    openBooks: { id?: string }[]
): string {
    const last = storage?.["local-dailynoteid"];
    if (typeof last === "string" && last && openBooks.some((b) => b.id === last)) return last;
    if (openBooks.length === 1) return openBooks[0].id ?? "";
    return "";
}

/** 解析「用户点日记会去哪」：storage 镜像 + open 笔记本快照。失败返回 ""（落点链滑到下一档） */
export async function resolveDailyNotebookID(): Promise<string> {
    try {
        const storage = (window.siyuan as any)?.storage as Record<string, unknown> | undefined;
        return dailyNotebookFromStorage(storage, (await siyuan.lsNotebooks(false)) ?? []);
    } catch (e) {
        console.warn("[tomato anno] resolve daily notebook failed:", e);
        return "";
    }
}

/** 启动注入默认值（不落盘）：仅当用户从未配置过该键（undefined，非显式空串）且解析到日记本时写内存——
 *  目的一是设置面板默认显示日记本（知情透明），二是创建链直接取到值；显式选空=每次真解析跟随 */
export async function initAnnoDraftNotebookDefault(plugin: { settingCfg?: Record<string, unknown> }): Promise<void> {
    if (plugin.settingCfg && plugin.settingCfg[DRAFT_NOTEBOOK_KEY] !== undefined) return;
    const id = await resolveDailyNotebookID();
    if (id) commentBoxAnnoDraftNotebook.set(id);
}

/** 月目录名退一月（纯函数，单测覆盖）：'2026-09'→'2026-08'、'2026-01'→'2025-12'；非 YYYY-MM 返回 "" */
export function prevMonthName(name: string): string {
    const m = /^(\d{4})-(\d{2})$/.exec(name.trim());
    if (!m) return "";
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    if (mo < 1 || mo > 12) return "";
    const py = mo === 1 ? y - 1 : y;
    const pm = mo === 1 ? 12 : mo - 1;
    return `${py}-${String(pm).padStart(2, "0")}`;
}

/** 最近日记 → 草稿安家的目录 hpath（纯函数，单测覆盖）：
 *  优先「日记父目录的上一月」（当月在用易见，上月=过去式无感）；跨年退月时若祖父段是年层（YYYY）
 *  同步退年（与真实历史目录一致）；月段名非 YYYY-MM（定制模板）退化到祖父层（年层，同样冷门）；
 *  日记挂得太浅（无月层概念）返回 ""（上层落本根） */
export function draftHomeInDiary(diaryHPath: string): string {
    const segs = diaryHPath.split("/").filter(Boolean);
    if (segs.length < 3) return ""; // 日记直挂首段（如 /daily note/2026-09-02）：无月层
    const monthSeg = segs[segs.length - 2].trim();
    const stemSegs = segs.slice(0, segs.length - 2);
    const prev = prevMonthName(monthSeg);
    if (prev) {
        if (/^\d{4}-01$/.test(monthSeg)) {
            const yearIdx = stemSegs.length - 1;
            if (/^\d{4}$/.test((stemSegs[yearIdx] ?? "").trim())) {
                stemSegs[yearIdx] = String(parseInt(stemSegs[yearIdx], 10) - 1);
            }
        }
        return "/" + stemSegs.join("/") + "/" + prev;
    }
    if (segs.length >= 4) return "/" + stemSegs.join("/"); // 月段解析失败：退到祖父层
    return "";
}

/** 路径首段名（box conf 的 dailyNoteSavePath 首段=日记根目录名，作 SQL like 锚） */
export function hPathFirstSeg(p: string): string {
    return (p.split("/").map((s) => s.trim()).filter(Boolean)[0] ?? "");
}

/** 本内最近一篇日记的 hpath：box conf 日记模板首段作锚 → SQL 最新 type='d'。
 *  box conf 拿不到/无日记/查无结果返回 ""（落本根）。注：目录文档同为 type='d' 且可能 id 更新，
 *  若取到中间层目录，draftHomeInDiary 对其退层失败会自然落空——可接受的边界（取最新命中的主路径是叶子日记） */
async function latestDiaryHPath(box: string): Promise<string> {
    try {
        // siyuan.call 已解包响应 data 层（siyuanApi 先例：sql 直接把返回当数组用）
        const resp = (await siyuan.call("/api/notebook/getNotebookConf", { notebook: box })) as {
            conf?: { dailyNoteSavePath?: string };
        };
        const root = hPathFirstSeg(resp?.conf?.dailyNoteSavePath ?? "");
        if (!root) return "";
        const row = await siyuan.sqlOne(
            `select hpath from blocks where box="${box}" and type='d' and hpath like "/${root}/%" order by id desc limit 1`
        );
        return (row as { hpath?: string })?.hpath ?? "";
    } catch (e) {
        console.warn("[tomato anno] latest diary lookup failed:", e);
        return "";
    }
}

export async function ensureDraftDocID(): Promise<string> {
    const found = await findDraftDocID();
    if (found) return found;
    // 选定笔记本：用户设置 > 官方日记本判定（注入未完成的竞态兜底）> 当前笔记本
    let box = commentBoxAnnoDraftNotebook.get();
    if (!box) box = await resolveDailyNotebookID();
    if (!box) box = events.boxID;
    if (!box) return "";
    // 落点目录：最近日记的上月目录（缓存命中免 conf+SQL 两查；""=落本根）
    let home: string;
    if (cachedDraftHomeBox === box && cachedDraftHome !== null) {
        home = cachedDraftHome;
    } else {
        home = draftHomeInDiary(await latestDiaryHPath(box));
        cachedDraftHomeBox = box;
        cachedDraftHome = home;
    }
    const docHPath = home ? `${home}/${DRAFT_DOC_TITLE}` : `/${DRAFT_DOC_TITLE}`;
    try {
        // 中间目录（如空月份）不存在则先造（与真实月份文档同构；不赌 createDocWithMd 自动建层）
        if (home) {
            const ids = await siyuan.getIDsByHPath(home, box);
            if (!(Array.isArray(ids) ? ids[0] : ids)) await siyuan.createDocWithMd(box, home, "");
        }
        const id = await siyuan.createDocWithMd(box, docHPath, "");
        if (id) {
            cachedDocID = id;
            return id;
        }
        cachedDraftHome = null; // 落点失效（如目录被删）：清缓存让下次重解析
        return "";
    } catch (e) {
        console.warn("[tomato anno] create draft doc failed:", e);
        cachedDraftHome = null;
        return "";
    }
}

/** 开弹窗建独立草稿块（超级块容器，□1 Spike 契约形态）。
 *  不走 markdown 预置 IAL id（`}}}\n{: id=}` 形态内核会额外插一个空段落兄弟块，e2e 实锤）；
 *  sb id 从事务返回的 doOperations 里按 NodeSuperBlock 解析。
 *  插入后等 SQL 索引落地才返回：protyle 首拉经索引解析 rootID，新鲜插入的 ~2.6s 索引窗口内
 *  首拉会渲染成空文档（e2e 实测），等到索引可见再挂编辑器是确定性防线 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function newDraftBlock(text: string): Promise<string> {
    const docID = await ensureDraftDocID();
    if (!docID) return "";
    // 基线空段清理（□2 创建统一）：内核在文档删空时自动补一个空 p（sweep 的稳态基线），
    // 它排在草稿 sb 之前=弹窗里的第一行空行——空草稿场景用户点/聚焦第一行会把字打进基线段
    // 而非 sb（readDraftText 读 sb 永远为空，e2e 实锤「批注内容为空」死循环）；编辑链路因
    // sb 自带可见文本从未暴露。开窗前清掉（跳过登记在册的活跃草稿）；关窗删 sb 后内核会再补，
    // 一次开窗多一轮事务可接受
    try {
        const children = (await siyuan.getChildBlocks(docID)) ?? [];
        const active = activeDrafts();
        const junk = children
            .filter((c) => c.type === "p" && (c.content ?? "").replace(/\u200b/g, "").trim() === "")
            .filter((c) => !active.has(c.id))
            .map((c) => c.id)
            .filter(Boolean);
        if (junk.length > 0) await siyuan.deleteBlocks(junk);
    } catch { /* 清不掉不阻塞：多一行空行仅影响聚焦目标 */ }
    // 空种子用 ZWSP：内核对纯空内容（`{{{row\n\n}}}`）会退化成无子 sb（kramdown 读回空串，
    // 实验实锤），ZWSP 能落成「sb 内含可编辑空段」；落库侧由 stripDraftShell 剥首尾 ZWSP 兜底
    const seed = text.replace(/\u200b/g, "").trim() === "" ? "\u200b" : text;
    let id = "";
    try {
        const txs = await siyuan.insertBlockAsChildOf(`{{{row\n${seed}\n}}}`, docID);
        const ops = (Array.isArray(txs) ? txs : []).flatMap((t: { doOperations?: unknown[] }) => (t?.doOperations ?? []) as { action?: string; id?: string; data?: string }[]);
        const sb = ops.find((o) => o.action === "insert" && typeof o.data === "string" && o.data.includes('data-type="NodeSuperBlock"'));
        id = sb?.id ?? ops.find((o) => o.action === "insert")?.id ?? "";
        if (!id) throw new Error("draft insert: no id in transaction response");
    } catch (e) {
        console.warn("[tomato anno] create draft block failed:", e);
        return "";
    }
    for (let i = 0; i < 24; i++) {
        try {
            const row = await siyuan.sqlOne(`select id from blocks where id="${id}" limit 1`);
            if (row?.id) {
                activeDrafts().set(id, Date.now());
                return id;
            }
        } catch { /* 重试兜底 */ }
        await sleep(350);
    }
    console.warn("[tomato anno] draft block index not visible in 8s, mount anyway:", id);
    activeDrafts().set(id, Date.now());
    return id;
}

/** 取草稿块 kramdown 并剥壳（去 {{{row/}}}/容器 IAL + 子块 IAL 行） */
export async function readDraftText(blockID: string): Promise<string> {
    const resp = await siyuan.getBlockKramdown(blockID);
    return stripDraftShell((resp as { kramdown?: string })?.kramdown ?? "");
}

/** 删草稿块：静默失败（启动清扫兜底）；空 id 直接过；同步摘登记簿 */
export async function deleteDraftBlock(blockID: string): Promise<void> {
    if (!blockID) return;
    activeDrafts().delete(blockID);
    try {
        await siyuan.deleteBlock(blockID);
    } catch {
        /* 清扫兜底 */
    }
}

/** 启动清扫：清空草稿文档残留子块（只清不建，未用过批注的用户零打扰）。
 *  内核在文档删空时会自动补一个空段保文档非空（e2e 实锤）——空段是稳态基线，
 *  跳过它可免每次重载做一轮「删除→内核再补空段」的无谓事务；
 *  登记在册的年轻草稿（活跃编辑弹窗）跳过——防惰性 reload 场景清扫与刚开的弹窗赛跑（e2e 实锤） */
export async function sweepDraftDoc(): Promise<void> {
    try {
        const docID = await findDraftDocID();
        if (!docID) return;
        const children = (await siyuan.getChildBlocks(docID)) ?? [];
        const active = activeDrafts();
        const now = Date.now();
        const ids = children
            .filter((c) => c.type !== "p" || (c.content ?? "").trim() !== "")
            .filter((c) => {
                const ts = active.get(c.id);
                return !(ts != null && now - ts < DRAFT_ACTIVE_GRACE_MS);
            })
            .map((c) => c.id)
            .filter(Boolean);
        if (ids.length > 0) await siyuan.deleteBlocks(ids);
    } catch (e) {
        console.warn("[tomato anno] draft sweep failed:", e);
    }
}
