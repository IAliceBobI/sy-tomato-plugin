// □3 数据层 knownRevision 的客户端半边（bk-bottom 战役）。
// 内核契约（kernel/api/ref.go）：getBacklink2/getBacklinkDoc/getBackmentionDoc 带
// knownRevision 且与内核 hash 相等时，响应只含 {unchanged:true, revision}，数据字段
// 全空——unchanged 时一切数据必须走客户端缓存，本模块就是这份缓存的状态机。
// revision hash 已含查询参数（keyword/sort/containChildren），queryKey 变化天然 hash
// 不同；主动重置只是省一轮无效比对（对齐官方 app/src/layout/dock/Backlink.ts 的
// queryChanged 做法）。纯状态机零 siyuan 依赖，发请求的是调用方（bkUtils/入口条）。

export interface BkDocCacheEntry {
    revision: string;
    items: unknown[];
}

export interface BkListState {
    /** 影响返回结果的客户端参数指纹（keyword/排序/分页），变化即全量重来 */
    queryKey: string;
    /** getBacklink2 列表级 revision */
    listRevision: string;
    /** 来源文档 id → 文档级 revision + 上轮 items */
    docs: Map<string, BkDocCacheEntry>;
}

export function makeBkListState(): BkListState {
    return { queryKey: "", listRevision: "", docs: new Map() };
}

export function makeBkQueryKey(
    k: string, mk: string, sort: string, page: number, refDocCount: number, menDocCount: number,
) {
    return JSON.stringify([k, mk, sort, page, refDocCount, menDocCount]);
}

/** queryKey 变化时清空全部 revision（返回是否重置过）；分页也入 key 故翻页必全量 */
export function resetBkStateIfQueryChanged(state: BkListState, queryKey: string) {
    if (state.queryKey === queryKey) return false;
    state.queryKey = queryKey;
    state.listRevision = "";
    state.docs.clear();
    return true;
}

export function knownListRevision(state: BkListState) {
    return state.listRevision;
}

export function knownDocRevision(state: BkListState, docID: string) {
    return state.docs.get(docID)?.revision ?? "";
}

/**
 * getBacklink2 响应落地。unchanged → true（调用方短路：文档级请求全跳、UI 零变化）；
 * revision 无论变否照常落地（unchanged 时两者本就相等，对齐官方赋值语义）。
 */
export function applyListResponse(state: BkListState, resp: { unchanged?: boolean; revision?: string }) {
    if (resp?.revision) state.listRevision = resp.revision;
    return resp?.unchanged === true;
}

/**
 * getBacklinkDoc/getBackmentionDoc 响应落地。unchanged → 返回缓存 items（同引用，
 * 上轮一定查过才有 revision 可带）；否则记录 revision+items 并原样返回新 items。
 */
export function applyDocResponse<T>(state: BkListState, docID: string, resp: { unchanged?: boolean; revision?: string; items: T[] }): T[] {
    if (resp?.unchanged) return (state.docs.get(docID)?.items ?? []) as T[];
    if (resp?.revision) state.docs.set(docID, { revision: resp.revision, items: resp.items });
    return resp.items;
}

/** 以本轮来源文档集合修剪缓存（消失的文档不留孤儿，防长期驻留增长） */
export function pruneBkDocs(state: BkListState, liveDocIDs: Iterable<string>) {
    const live = new Set(liveDocIDs);
    for (const id of state.docs.keys()) {
        if (!live.has(id)) state.docs.delete(id);
    }
}

// ---- 入口条计数缓存（默认关可发现性）----
// getBacklink2 的 unchanged 响应不带 linkRefsCount/mentionsCount，计数必须缓存。
// 模块级缓存跨组件生命周期（入口条随文档开关频繁建撤，计数语义是文档级的）。

const entryCountCache = new Map<string, { revision: string; count: number }>();

export function cachedEntryCount(docID: string) {
    return entryCountCache.get(docID);
}

/** 计数=linkRefsCount+mentionsCount；unchanged → 返回缓存（无缓存异常序兜底 0） */
export function applyEntryCount(
    docID: string,
    resp: { unchanged?: boolean; revision?: string; linkRefsCount?: number; mentionsCount?: number },
) {
    if (resp?.unchanged) return entryCountCache.get(docID)?.count ?? 0;
    const count = (resp?.linkRefsCount ?? 0) + (resp?.mentionsCount ?? 0);
    entryCountCache.set(docID, { revision: resp?.revision ?? "", count });
    return count;
}
