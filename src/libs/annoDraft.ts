// □4 批注草稿链：草稿文档懒查找/懒创建 + 每弹窗独立草稿块（即用即删）+ 启动清扫。
// 拍板（handoff □4 mini-spec 倾向落地）：**关闭即删**——重开编辑弹窗从属性 text 回填草稿块，
// 等价「续写上条内容」且无残留态可管理；崩溃/中断残留由启动清扫兜底。
// - 草稿文档 = 全局单文档 ".tomato-批注草稿"，落在 storeNoteBox 选定笔记本（getOr 兜底链：设置→当前笔记本）；
//   查找走 lsNotebooks × getIDsByHPath 文件树直查（无 SQL 索引延迟，AGENTS 踩坑表口径），命中任意笔记本即复用
// - 每次开编辑弹窗预置 id 建独立超级块草稿（多窗口天然隔离）；保存/关闭即删，删除失败静默（清扫兜底）
// - 清扫只清不建：启动时若找到草稿文档则清空子块（注：多窗口同工作区极端场景会误伤他窗在编辑的草稿，
//   单窗口为主流用法，接受该边界——属性是 source of truth，草稿丢了重开编辑即恢复）
import { siyuan } from "./utils";
import { storeNoteBox_selectedNotebook } from "./stores";
import { stripDraftShell } from "./annoKramdown";

export const DRAFT_DOC_TITLE = ".tomato-批注草稿";
const DRAFT_HPATH = `/${DRAFT_DOC_TITLE}`;
/** 模块级缓存：同会话重复开弹窗免查；reload=新代模块自然失效（window.eval 无模块缓存，AGENTS 踩坑表） */
let cachedDocID = "";

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

async function findDraftDocID(): Promise<string> {
    if (cachedDocID) {
        if (await siyuan.checkBlockExist(cachedDocID)) return cachedDocID;
        cachedDocID = ""; // 用户手删草稿文档 → 懒重建（mini-spec）
    }
    try {
        for (const book of await siyuan.lsNotebooks(false)) {
            const ids = await siyuan.getIDsByHPath(DRAFT_HPATH, book.id);
            const hit = Array.isArray(ids) ? ids[0] ?? "" : "";
            if (hit) {
                cachedDocID = hit;
                return hit;
            }
        }
    } catch (e) {
        console.warn("[tomato anno] find draft doc failed:", e);
    }
    return "";
}

export async function ensureDraftDocID(): Promise<string> {
    const found = await findDraftDocID();
    if (found) return found;
    const box = storeNoteBox_selectedNotebook.getOr();
    if (!box) return "";
    try {
        const id = await siyuan.createDocWithMd(box, DRAFT_HPATH, "");
        if (id) cachedDocID = id;
        return id ?? "";
    } catch (e) {
        console.warn("[tomato anno] create draft doc failed:", e);
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
