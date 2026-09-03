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
    /** □3 提及马克笔：getBacklinkDoc/getBackmentionDoc 响应 keywords（编辑态高亮
     *  用）。unchanged 响应不含此字段，与 items 同走缓存。 */
    keywords: string[];
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
 * getBacklinkDoc/getBackmentionDoc 响应落地。unchanged → 返回缓存 items+keywords
 * （同引用，上轮一定查过才有 revision 可带）；否则记录 revision+items+keywords 并
 * 原样返回。keywords 响应缺省（老内核/引用侧空关键词）归一为空数组。
 */
export function applyDocResponse<T>(state: BkListState, docID: string, resp: {
    unchanged?: boolean; revision?: string; items: T[]; keywords?: string[];
}): { items: T[]; keywords: string[] } {
    if (resp?.unchanged) {
        const cached = state.docs.get(docID);
        return { items: (cached?.items ?? []) as T[], keywords: cached?.keywords ?? [] };
    }
    if (resp?.revision) {
        state.docs.set(docID, { revision: resp.revision, items: resp.items, keywords: resp.keywords ?? [] });
    }
    return { items: resp.items, keywords: resp.keywords ?? [] };
}

/** 以本轮来源文档集合修剪缓存（消失的文档不留孤儿，防长期驻留增长） */
export function pruneBkDocs(state: BkListState, liveDocIDs: Iterable<string>) {
    const live = new Set(liveDocIDs);
    for (const id of state.docs.keys()) {
        if (!live.has(id)) state.docs.delete(id);
    }
}

// ---- □13 数据失效通道（databaseIndexCommit）----
// 内核列表级 revision 只含 Path 元数据（kernel/api/ref_revision.go：ID/Box/Name/
// Number/HPath/Type/NodeType/SubType/Depth/Count/Folded——不含块内容也不含
// updated），纯内容编辑（引用块文字改）对列表 hash 不可见 → unchanged 短路 →
// 卡片内容永驻缓存。官方反链面板靠内核索引提交广播（ws databaseIndexCommit
// {rootIDs, backlinkChanged, backlinkFull}）主动失效（app/src Backlink.ts
// markIndexDirty：pendingRootIDs 命中的 contexts 丢弃 knownRevision 全量重查）。

/** 失效：列表 revision 必清（列表 hash 感知不到内容）；docs 级 revision 含 DOM，
 * 仅清 rootIDs 命中的来源文档（"bk:"/"me:" 双域键剥前缀比对）；不传 rootIDs
 * （手动立即刷新）全清。items 缓存保留——revision 已空，下一轮请求必全量回填。 */
export function invalidateBkRevisions(state: BkListState, rootIDs?: Set<string>) {
    if (state == null) return;
    state.listRevision = "";
    if (rootIDs == null) {
        for (const d of state.docs.values()) d.revision = "";
        return;
    }
    for (const [key, d] of state.docs) {
        const docID = key.replace(/^(bk|me):/, "");
        if (rootIDs.has(docID)) d.revision = "";
    }
}

/** 相关性（三态，□13 评审 P1-1）：返回 "src"=来源文档（已查过的 bk:/me: 域）命中
 * 或 backlinkFull——引用块被编辑/增删，可即时重查；"self"=仅面板目标文档命中——
 * 普通打字也广播，只失效不即时刷（REFRESH 分支整卡重建会闪烁+滚动归零，下轮
 * 轮询自然全量；保留 self 判定是为「目标文档改名→提及集合变化」的正确性）；
 * false=不相关（其他文档编辑不减噪）。对齐官方 markIndexDirty 只认来源文档集合。 */
export function bkIndexCommitRelated(state: BkListState, panelDocID: string, rootIDs: Set<string>, full: boolean): "src" | "self" | false {
    if (full) return "src";
    if (state?.docs) {
        for (const key of state.docs.keys()) {
            if (rootIDs.has(key.replace(/^(bk|me):/, ""))) return "src";
        }
    }
    if (rootIDs?.has(panelDocID)) return "self";
    return false;
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
