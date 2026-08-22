// 同步块冲突判定纯函数（设计 §4.2/§4.4）。
// doSync 决策树的数据准备（getBlockAttrs / getGroupState）在引擎侧，这里只做无 IO 判定；
// 行为由 tests/unit/syncDecision.test.ts 按设计 §4.3 场景推演表逐行锁定。

export type SyncPeerState = {
    /** 副本块 ID */
    id: string;
    /** 副本版本 v_i；0 是「正在对齐」的传播过渡态，不参与判定 */
    version: number;
    /** 副本基线哈希；遗留组（升级前建的组）无此属性 */
    hash?: string;
};

export type SyncGroupState = {
    /** 被编辑副本（触发本次 doSync 的块 A） */
    base: {
        id: string;
        /** v_base：A 的版本 */
        version: number;
        /** h_base：A 上次已同步哈希（编辑基线）；缺失表示遗留组 */
        hash?: string;
    };
    /** 组内其他存活副本 */
    peers: SyncPeerState[];
    /** 组 custom-sync-status；"conflict" 表示已处于冲突态 */
    status?: string;
};

export type GroupAction = "propagate" | "conflict" | "skip";

/**
 * 冲突副本集 C = { i : h_i 存在 且 h_i ≠ h_base 且 v_i ≥ v_base 且 v_i ≠ 0 }（设计 §4.2）。
 * - v_i ≠ 0：排除传播过渡态。
 * - v_i ≥ v_base 且哈希不同：对方在我的基线版本之后改过内容 → 双方都有对方没见过的修改。
 * - v_i < v_base 且哈希不同：对方只是落后，安全覆盖（正常传播场景）。
 * h_base 缺失（遗留组）→ 空集：跳过冲突判定，本次传播顺带补全 hash。
 */
export function conflictPeers(state: SyncGroupState): SyncPeerState[] {
    const hBase = state.base.hash;
    if (!hBase) return [];
    return state.peers.filter(p =>
        p.hash != null && p.hash !== hBase && p.version >= state.base.version && p.version !== 0
    );
}

/**
 * doSync 的组级判定：
 * - skip：组已是 conflict 态（短路 0，防「标记写入 → ws 事件 → 再进 doSync」的事件风暴，也阻止冲突期继续传播）。
 * - conflict：C ≠ ∅，标冲突、不传播不动版本。
 * - propagate：可安全传播。
 */
export function decideGroupAction(state: SyncGroupState): GroupAction {
    if (state.status === "conflict") return "skip";
    if (conflictPeers(state).length > 0) return "conflict";
    return "propagate";
}

export type DeepScanVerdict = "consistent" | "rebaseline" | "pending" | "diverged";

/**
 * 深检裁决（设计 §5 实现修订，2026-08-21）：可达成员重算哈希 vs 存量基线。
 * - consistent：重算与存量全等，无未走引擎的变更。
 * - rebaseline：重算互相全等但 ≠ 存量——内容已一致、只是基线过时（用户手工把两边改齐 /
 *   旧版引擎传播不维护哈希 / 哈希规范化算法升级的存量迁移）。治愈：重定基线并清标记，
 *   不标冲突。「太容易冲突」体验陷阱的引擎侧出口：不用裁决按钮也能自愈。
 * - pending：互相不等但仅一份偏离基线（其余仍==基线）——一次尚未传播的单侧编辑（对方
 *   没有任何未见过的修改，§4.2 C=∅ 场景，编辑发生时插件未在运行/云同步单侧先到）。
 *   由调用方按「删除形/编辑形」分流（pendingIsDeletionShaped）。
 * - diverged：≥2 份互相不等的偏离——真实双方分叉，走嫌疑复查流程后交用户裁决。
 */
export function deepScanVerdict(recomputed: string[], stored: string): DeepScanVerdict {
    if (recomputed.length === 0) return "consistent";
    const first = recomputed[0];
    if (recomputed.some(h => h !== first)) {
        return recomputed.filter(h => h !== stored).length === 1 ? "pending" : "diverged";
    }
    return first === stored ? "consistent" : "rebaseline";
}

/**
 * pending 的分流（设计 §5 实现修订，2026-08-21 深检误判单侧编辑为冲突的修复）：
 * 偏离侧丢失了基线侧仍持有的 item-id = 删除形——外部 API 误删子块正是深检的本职场景
 * （§5 □5），自动传播会把删除扩散到全组，仍标 conflict 交用户裁决；
 * item-id 只增不减（结构完整只是内容变）= 编辑形，巡检自动以偏离侧为源传播，
 * 兑现「只改一份、其余最终一致」。两侧子块均无 item-id（未迁移遗留）时无凭据判删除，
 * 按 best effort 归编辑形。
 */
export function pendingIsDeletionShaped(deviant: Element, baseline: Element): boolean {
    const itemIds = (el: Element) =>
        new Set(Array.from(el.querySelectorAll("[custom-sync-item-id]"), n => n.getAttribute("custom-sync-item-id")));
    const deviantIds = itemIds(deviant);
    return [...itemIds(baseline)].some(id => !deviantIds.has(id));
}

/**
 * 深检 pending 编辑形自动传播前的光标避让（2026-08-22 checkpoint □1-A）：
 * 深检传播（syncFromBlock → syncAllBlocks / 源自写）不带 editorSession、广播全量，
 * 组内副本正被编辑时传播事务会替换打字视图正文——光标跳五连修后仅剩的复发口。
 * 组内任一副本含选区锚点（含文本节点）即视为编辑进行中，调用方延后传播。
 */
export function editingInsideGroup(divs: (Element | null | undefined)[], anchor: Node | null | undefined): boolean {
    if (!anchor) return false;
    return (divs ?? []).some(d => d?.contains(anchor));
}

/**
 * 打字真编辑对版本守卫的豁免（2026-08-22 单字母不传播修复）：
 * runDoSyncLocked 的 domVer0 快速路径与 domVer≠vBase 早退，防的是「拿旧内容覆盖别人」——
 * 但 version 属性只是活 DOM 的渲染态：传播轮回声（editorSession 错位时打字视图不被排除）
 * 会把打字视图活 DOM 刷成 version=0，版本号治愈（checkSync +10s）到位前，用户打的一两个
 * 字母被当回声吞掉、静默搁浅。光标锚点在本副本内 + 内容哈希已偏离 DB 基线 = 用户正在
 * 此副本打字（编辑真值，内核侧必为最新），守卫须放行；锚点不在（回声/陈旧 DOM）则维持
 * 原防护。哈希缺失（遗留组）保守不豁免。
 */
export function anchorEditExemptsVersionGuards(anchorInside: boolean, hCur: string | null | undefined, hBase: string | null | undefined): boolean {
    return !!anchorInside && !!hCur && !!hBase && hCur !== hBase;
}

/** verMap 缓存项（2026-08-22 死锁修复）：版本高水位 + 上次传播的内容哈希 */
export type VerMapCache = { ver: number; hash: string };

/**
 * verMap 判重闸（2026-08-22 传播链死锁修复）：判重从「仅版本号」升级为「版本+上次传播哈希」。
 * 死锁链：回声风暴把版本推高（页面级 verMap 记住高位），checkSync 治愈以滞后 SQL 把组版本
 * 写回低位（回摆，见 monotonicHeal），此后真编辑算出的 syncVer 永远 ≤ cacheVer 被静默吞——
 * 打字传播、深检 syncFromBlock 同锁，整组死锁到插件重载。语义：
 * propagate = 正常递增放行；dup = 版本追不上且哈希相同（重复回声，原防重语义保留）；
 * allow = 版本追不上但哈希是新编辑（版本回摆后的真编辑，必须放行）。
 */
export function verMapGate(syncVer: number, cached: VerMapCache | undefined, hNew: string): "propagate" | "dup" | "allow" {
    if (!cached || syncVer > cached.ver) return "propagate";
    return cached.hash === hNew ? "dup" : "allow";
}

/**
 * 版本治愈的单调闸（2026-08-22 版本回摆修复）：checkSync/巡检治愈原来用 !== 判断，
 * 滞后 SQL 读出低位 maxVer 时会把高版本成员往回写（活实例 312 → 310），破坏版本
 * 单调性并与 verMap 高位共振死锁。治愈只升不降；cur > maxVer 说明 maxVer 是滞后读。
 */
export function monotonicHeal(cur: number, maxVer: number): boolean {
    return cur < maxVer;
}

/**
 * attributes 表行 (block_id, name, value) → 副本状态数组（设计 §4.4 步骤 2 的纯函数半，
 * IO 半在 LinkBox.getGroupState：发 SQL + checkBlockExist 存活过滤）。
 * version/hash/status 行按 block_id 透视合并；缺 version 行的副本按 0 计。
 */
export function pivotSyncPeers(rows: { block_id: string; name?: string; value?: string }[]): (SyncPeerState & { status?: string })[] {
    const byID = new Map<string, SyncPeerState & { status?: string }>();
    for (const row of rows ?? []) {
        if (!row?.block_id) continue;
        let peer = byID.get(row.block_id);
        if (!peer) {
            peer = { id: row.block_id, version: 0 };
            byID.set(row.block_id, peer);
        }
        switch (row.name) {
            case "custom-sync-version": peer.version = Number(row.value) || 0; break;
            case "custom-sync-hash": peer.hash = row.value; break;
            case "custom-sync-status": peer.status = row.value; break;
        }
    }
    return [...byID.values()];
}

/** 深检复核用的直读成员状态：getBlockAttrs 读出的活块（读空的幽灵/已删块由调用方剔除） */
export type LivePeer = SyncPeerState & { status?: string };
/** 属性写入项；值 null 表示删除该属性（清 conflict 标记用），与 setBlockAttrs 语义一致 */
export type AttrWrite = { id: string; attrs: Record<string, string | null> };
export type ScanRecheckPlan = { diverged: boolean; mark: string[]; heal: AttrWrite[] };

/**
 * 深检 SQL 分叉组的内核直读复核（2026-08-21 □7：滞后快照误标全组冲突）。
 * scanAllGroups 的数据源是 SQL attributes 表——索引滞后快照：新副本入组/传播过渡窗口内
 * hash/version 行滞后（旧值或缺失），按 SQL 定罪会把过渡态误标成全组冲突（用户实测
 * 2026-08-21 23:20:49 sync_end 深检全组标 conflict，打字传播成功后才自愈消失）。
 * SQL 判「分叉」的组必须以 getBlockAttrs 直读结果为准走本函数：
 * - 分叉只看内容哈希，version 不参与——version 是单调计数器，倾斜（新副本 v=1 未对齐）
 *   是过渡态不是内容分叉（checkSync 同样只按哈希判）；
 * - 真分叉只标有哈希凭据的成员——无哈希成员（入组半程/遗留）标了会在 doSync 形成
 *   skip 黏住（healed 检查对无哈希成员永不成立）；
 * - 不分叉（含全 null 遗留组）→ 治愈：version 对齐 maxVer + 清 conflict 标记，
 *   皆无需写时零写入（防抖）。
 */
export function scanRecheckPlan(live: LivePeer[]): ScanRecheckPlan {
    const hashes = new Set((live ?? []).map(p => p.hash).filter(h => h != null));
    if (hashes.size > 1) {
        return { diverged: true, mark: live.filter(p => p.hash != null).map(p => p.id), heal: [] };
    }
    const maxVer = live.reduce((pre, cur) => cur.version > pre ? cur.version : pre, 0);
    const heal: AttrWrite[] = [];
    for (const p of live) {
        const attrs: Record<string, string | null> = {};
        if (p.version !== maxVer) attrs["custom-sync-version"] = maxVer.toString();
        if (p.status === "conflict") attrs["custom-sync-status"] = null;
        if (Object.keys(attrs).length > 0) heal.push({ id: p.id, attrs });
    }
    return { diverged: false, mark: [], heal };
}

/** 可注入的定时器（单测传虚拟时钟；生产缺省走全局 setTimeout/clearTimeout） */
export type DebounceTimer = {
    set: (fn: () => void, ms: number) => unknown;
    clear: (handle: unknown) => void;
};

/**
 * trailing 去抖（□6 连续打字防抖截断修复，2026-08-21）：窗口从最后一个 op 起算。
 * 旧 scheduleDoSync 是固定窗口不重置——打字中途到期就把页面 DOM 的中间态（如 MN）传播出去，
 * 尾字剩到下一轮，还常伴随传播事务把共享子块 ID 克隆进目标引发 blocktree 翻转。
 * trailing 下打字不停轮次不发，停手 settleMs 后一轮带走全部；到期取窗口内最后一个值。
 * settle 的另一半语义保留：给 ws 广播/内核索引一点静置时间再判定（四轮起判定已内核直读，
 * 不再依赖 SQL 索引收敛，但静置仍避免与在途回声交错）。
 */
export function createTrailingDebouncer<V>(
    settleMs: number,
    fire: (key: string, value: V) => void,
    timer: DebounceTimer = {
        set: (fn, ms) => setTimeout(fn, ms),
        clear: h => clearTimeout(h as ReturnType<typeof setTimeout>),
    },
) {
    const pending = new Map<string, V>();
    const handles = new Map<string, unknown>();
    return {
        touch(key: string, value: V) {
            pending.set(key, value); // 后到的值覆盖：以最新事务时点为准
            const old = handles.get(key);
            if (old !== undefined) timer.clear(old);
            handles.set(key, timer.set(() => {
                handles.delete(key);
                const latest = pending.get(key);
                pending.delete(key);
                if (latest !== undefined) fire(key, latest);
            }, settleMs));
        },
    };
}
