// 知识库同步引擎（knowledgebox 原型期，2026-09-14）：
// 把白名单文档（含子树）增量同步到外部知识库平台（□3 起通道走 knowledgeChannel 层，
// 首发=智谱；同步引擎/问答面板/设置卡/MCP 四口共用该 adapter）。
// 存储：petal knowledge-sync.json
//   { list:  [{docID, title, hpath, addedAt}]
//     state: {[docID]: {hash, syncedAt, ok, err, changed?, childCount?, excludedCount?}}
//     excluded: [docID] —— 递归子树的子级排除黑名单（□8） }
// 增量判据：getDocTreeMarkdown 拼接全文 → djb2 hash（变更检测用途，非密码学）；
// 与 state.hash 不同（或无记录）才推——通道侧 uploadDoc 本身幂等（先删同名再建），
// 引擎层再加 hash 闸避免无谓外发。扫描（checkChanges）只算 hash 不打外网。
// 排除语义：排除节点及其全部子文档剪掉不入库；排除集独立于白名单存续（移出条目
// 不清排除——防止敏感内容随再次加入意外回流）。
import type { ToolEnv } from "./agentTools";
import type { KbChannel } from "./knowledgeChannel";
import type { Plugin } from "siyuan";
import { getTomatoPluginInstance, siyuan, sqlQuoteStr } from "./utils";

const STORE_PATH = "knowledge-sync.json";

export interface KSyncItem {
    docID: string;
    title: string;
    hpath: string;
    addedAt: number;
}
export interface KSyncState {
    /** null=内容全被排除（无内容该同步；平台副本已 purge）——hash 闸据此 skip 免重复 purge */
    hash: number | null;
    syncedAt: number;
    ok: boolean;
    err?: string;
    /** checkChanges 扫描标记：本地内容已偏离上次成功同步（同步时清除） */
    changed?: boolean;
    /** 最近一次导出的实际篇数/被排除篇数（面板「N 篇·排 M」徽章；同步/检查时刷新） */
    childCount?: number;
    excludedCount?: number;
}
export interface KSyncData {
    list: KSyncItem[];
    state: Record<string, KSyncState>;
    /** 排除黑名单（docID；旧文件缺省=无排除） */
    excluded?: string[];
}

function emptyData(): KSyncData {
    return { list: [], state: {}, excluded: [] };
}

/** 内存快照：右键菜单构建/文档树打标是同步时序（await 之后菜单已渲染完/扫描需即时判定），
 * 从最近一次 loadKS 的结果同步读。loadKS 是所有读写路径的必经点，尾部统一刷新。 */
let ksSnapshot: KSyncData = emptyData();
export function getKSSnapshot(): KSyncData {
    return ksSnapshot;
}

export async function loadKS(): Promise<KSyncData> {
    const plugin = getTomatoPluginInstance() as unknown as Plugin;
    try {
        // loadData 契约（agentToolBridge 同款）：缺文件回 ""，.json 回已解析对象
        const raw = await plugin.loadData(STORE_PATH);
        if (raw && typeof raw === "object") {
            const d = raw as KSyncData;
            if (Array.isArray(d.list) && d.state && typeof d.state === "object") {
                if (!Array.isArray(d.excluded)) d.excluded = [];
                ksSnapshot = d;
                return d;
            }
        }
    } catch { /* 坏文件当空库 */ }
    const d = emptyData();
    ksSnapshot = d;
    return d;
}

export async function saveKS(data: KSyncData): Promise<void> {
    const plugin = getTomatoPluginInstance() as unknown as Plugin;
    await plugin.saveData(STORE_PATH, JSON.stringify(data));
}

/** djb2（变更检测够用；32 位回退防负数作 JSON 键不稳） */
function djb2(s: string): number {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    }
    return h >>> 0;
}

/** 导出+剪枝+hash：排除子树整体剔除（保序拼接）；同时产出篇数统计（面板徽章） */
async function currentHash(env: ToolEnv, docID: string, excluded: string[]): Promise<{ hash: number | null; markdown: string; childCount: number; excludedCount: number }> {
    const rows = await env.getDocTreeMarkdown(docID);
    if (!rows?.length) return { hash: null, markdown: "", childCount: 0, excludedCount: 0 };
    let kill: Set<string> | null = null;
    if (excluded.length) kill = await excludedTreeIDs(env, excluded);
    const kept = kill ? rows.filter(r => !kill!.has(r.id)) : rows;
    if (!kept.length) return { hash: null, markdown: "", childCount: 0, excludedCount: rows.length };
    const markdown = kept.map(r => r.markdown).join("\n\n");
    return { hash: djb2(markdown), markdown, childCount: kept.length, excludedCount: rows.length - kept.length };
}

export async function addToSync(docID: string): Promise<KSyncData> {
    const data = await loadKS();
    if (data.list.some(i => i.docID === docID)) return data;
    const row = await siyuan.getRowByID(docID);
    data.list.push({
        docID,
        title: String(row?.content ?? docID),
        hpath: String(row?.hpath ?? ""),
        addedAt: Date.now(),
    });
    await saveKS(data);
    return data;
}

export async function removeFromSync(docIDs: string[]): Promise<KSyncData> {
    const data = await loadKS();
    const kill = new Set(docIDs);
    data.list = data.list.filter(i => !kill.has(i.docID));
    for (const id of docIDs) delete data.state[id];
    // 刻意不动 excluded：黑名单独立存续（头部注释语义）
    await saveKS(data);
    return data;
}

export async function inSync(docID: string): Promise<boolean> {
    const data = await loadKS();
    return data.list.some(i => i.docID === docID);
}

/** 加入排除黑名单（幂等去重） */
export async function excludeDocs(docIDs: string[]): Promise<KSyncData> {
    const data = await loadKS();
    const set = new Set(data.excluded ?? []);
    docIDs.forEach(id => set.add(id));
    data.excluded = [...set];
    await saveKS(data);
    return data;
}

/** 移出排除黑名单（不存在则无操作） */
export async function unexcludeDocs(docIDs: string[]): Promise<KSyncData> {
    const data = await loadKS();
    const kill = new Set(docIDs);
    data.excluded = (data.excluded ?? []).filter(id => !kill.has(id));
    await saveKS(data);
    return data;
}

/** 排除节点全子树 id 集合（含自身）。SQL 两发：① 排除节点拿 path（/nb/…/xxx.sy，
 *  子文档物理目录=父文档 id）② path 前缀 like 拿子树全部文档行（前缀剥 .sy 加 '/'，
 *  带 .sy 只匹配父自身）。like 值过 sqlQuoteStr（□5 直拼前科）。抛错向上传成同步失败
 *  （隐私方向保守：宁可不同步，不可把用户明确排除的内容外发）。 */
async function excludedTreeIDs(env: ToolEnv, excluded: string[]): Promise<Set<string>> {
    const out = new Set<string>(excluded);
    const ids = excluded.map(sqlQuoteStr).join(",");
    const rows = await env.sql(`select id, path from blocks where type='d' and id in (${ids})`);
    const likes = (rows as { path?: string }[])
        .filter(r => r?.path && typeof r.path === "string")
        .map(r => r.path.replace(/\.sy$/, "") + "/%");
    if (likes.length) {
        const cond = likes.map(p => `path like ${sqlQuoteStr(p)}`).join(" or ");
        const subs = await env.sql(`select id from blocks where type='d' and (${cond})`);
        for (const r of subs as { id?: string }[]) if (r?.id) out.add(r.id);
    }
    return out;
}

export interface SyncProgress {
    docID: string;
    title: string;
    done: number;
    total: number;
    ok: boolean;
    skipped?: boolean;
    err?: string;
}

/**
 * 单文档同步：hash 闸 + channel.uploadDoc（幂等重建）。返回 true=有实质推送（成功或失败都更新 state）。
 */
export async function syncDoc(env: ToolEnv, channel: KbChannel, data: KSyncData, docID: string, preList?: import("./knowledgeChannel").KbDocInfo[]): Promise<{ pushed: boolean; ok: boolean; err?: string }> {
    const item = data.list.find(i => i.docID === docID);
    if (!item) return { pushed: false, ok: false, err: "不在同步白名单" };
    let hash: number | null;
    let markdown = "";
    let childCount = 0, excludedCount = 0;
    try {
        ({ hash, markdown, childCount, excludedCount } = await currentHash(env, docID, data.excluded ?? []));
    } catch (e: any) {
        data.state[docID] = { hash: 0, syncedAt: Date.now(), ok: false, err: `导出失败：${e?.message ?? e}` };
        return { pushed: true, ok: false, err: data.state[docID].err };
    }
    if (hash == null) {
        if (childCount === 0 && excludedCount > 0) {
            // 已是全排除稳态（上轮已 purge）：hash 闸命中 skip，免重复 purge（listDocs 外网）
            const prevAll = data.state[docID];
            if (prevAll?.ok && prevAll.hash === null) {
                prevAll.excludedCount = excludedCount;
                return { pushed: false, ok: true };
            }
            // 内容全部被排除（review P1-2）：best-effort 清平台旧副本——否则此前上传的完整
            // 内容（含被排除部分）在平台永久留存而 UI 无感知，违背排除语义。清完记 ok
            // （本地无该同步的内容=与平台一致），hash 存 null 供上方的稳态 skip 命中
            try {
                // 守卫（review ③）：适配器缺席 purgeDoc 时 ?. 静默等价「purge 成功」——
                // 对隐私保证做假证明（平台副本可能还在而闸门宣称已清），显式抛错走失败自愈
                if (typeof channel.purgeDoc !== "function") throw new Error("通道未实现平台清理");
                await channel.purgeDoc(docID, item.title, preList);
                data.state[docID] = { hash: null, syncedAt: Date.now(), ok: true, childCount: 0, excludedCount };
                return { pushed: true, ok: true };
            } catch (e: any) {
                const err = `排除后清理平台失败：${String(e?.message ?? e).slice(0, 150)}`;
                data.state[docID] = { hash: null, syncedAt: Date.now(), ok: false, err, childCount: 0, excludedCount };
                return { pushed: true, ok: false, err };
            }
        }
        const err = "文档不存在或无内容";
        data.state[docID] = { hash: 0, syncedAt: Date.now(), ok: false, err, childCount, excludedCount };
        return { pushed: true, ok: false, err };
    }
    const prev = data.state[docID];
    if (prev?.ok && prev.hash === hash) {
        prev.changed = false;
        prev.childCount = childCount;
        prev.excludedCount = excludedCount;
        return { pushed: false, ok: true };
    }
    try {
        await channel.uploadDoc(docID, item.title, markdown, preList);
        data.state[docID] = { hash, syncedAt: Date.now(), ok: true, childCount, excludedCount };
        return { pushed: true, ok: true };
    } catch (e: any) {
        const err = String(e?.message ?? e).slice(0, 200);
        data.state[docID] = { hash, syncedAt: Date.now(), ok: false, err, childCount, excludedCount };
        return { pushed: true, ok: false, err };
    }
}

/** in-flight 守卫（review P1-2）：autoTimer 到期与手动「立即同步」并发时两个 syncAll 实例
 *  各自 loadKS 迭代、同文档 uploadDoc 先删后传交错 → 平台侧留同名双份且之后 hash 闸
 *  永久 skip 无自愈——single-flight 让并发调用共享同一次执行 */
let syncAllInflight: Promise<{ ok: number; fail: number; skip: number }> | null = null;
let checkChangesInflight: Promise<KSyncData> | null = null;

/** 写操作门禁（review P0-1）：syncAll/checkChanges 持有旧 data 对象期间（窗口以十秒计），
 *  外部写（加/移/排除）落盘会被循环中的整体覆盖回滚——排除标记被抹掉后下轮自动同步
 *  把用户明确排除的内容重新外发。所有写口先查本函数，忙则提示稍后。 */
export function isSyncBusy(): boolean {
    return syncAllInflight != null || checkChangesInflight != null;
}

/** 全量同步白名单（逐条串行——外部 API 打并发易限流），onProgress 每条回调；返回汇总 */
export async function syncAll(env: ToolEnv, channel: KbChannel, onProgress?: (p: SyncProgress) => void): Promise<{ ok: number; fail: number; skip: number }> {
    if (syncAllInflight) return syncAllInflight;
    syncAllInflight = doSyncAll(env, channel, onProgress).finally(() => { syncAllInflight = null; });
    return syncAllInflight;
}

async function doSyncAll(env: ToolEnv, channel: KbChannel, onProgress?: (p: SyncProgress) => void): Promise<{ ok: number; fail: number; skip: number }> {
    const data = await loadKS();
    let ok = 0, fail = 0, skip = 0;
    // 拉一次平台清单供幂等删除按名对齐（全部循环复用，免每文档全量翻页）；
    // 拉取失败留给 uploadDoc 单文档路径自兜。内容未变的文档 hash 闸在 syncDoc 内拦，
    // 是否真推无法预判（hash 现算），白名单非空即拉一次成本可忽略
    let preList: import("./knowledgeChannel").KbDocInfo[] | undefined;
    if (data.list.length) {
        try { preList = await channel.listDocs(); } catch { /* 单文档路径自兜 */ }
    }
    for (let i = 0; i < data.list.length; i++) {
        const item = data.list[i];
        const r = await syncDoc(env, channel, data, item.docID, preList);
        if (!r.pushed) {
            skip++;
            onProgress?.({ docID: item.docID, title: item.title, done: i + 1, total: data.list.length, ok: true, skipped: true });
            continue;
        }
        r.ok ? ok++ : fail++;
        onProgress?.({ docID: item.docID, title: item.title, done: i + 1, total: data.list.length, ok: r.ok, err: r.err });
        // 每条落一次盘：中断不丢已同步进度（通道重建是幂等的，重跑安全）
        await saveKS(data);
    }
    await saveKS(data);
    return { ok, fail, skip };
}

/** 只算 hash 标记 changed（不打外网）：面板「检查变更」/自动同步前的轻量预检；
 *  顺带刷新 childCount/excludedCount（排除变化即使内容 hash 未变也该反映到徽章）。
 *  in-flight 门禁同 syncAll（review P0-1：持有 data 对象期间外部写会被整体覆盖回滚） */
export async function checkChanges(env: ToolEnv): Promise<KSyncData> {
    if (checkChangesInflight) return checkChangesInflight;
    checkChangesInflight = doCheckChanges(env).finally(() => { checkChangesInflight = null; });
    return checkChangesInflight;
}

async function doCheckChanges(env: ToolEnv): Promise<KSyncData> {
    const data = await loadKS();
    for (const item of data.list) {
        try {
            const { hash, childCount, excludedCount } = await currentHash(env, item.docID, data.excluded ?? []);
            const prev = data.state[item.docID];
            if (prev?.ok && hash != null && prev.hash !== hash) {
                prev.changed = true;
            } else if (prev) {
                prev.changed = false;
            }
            if (prev) {
                prev.childCount = childCount;
                prev.excludedCount = excludedCount;
            }
        } catch { /* 单条导出失败不动 state，同步时自然暴露 */ }
    }
    await saveKS(data);
    return data;
}
