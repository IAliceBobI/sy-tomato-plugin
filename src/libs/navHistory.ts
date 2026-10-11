// 十字罗盘「翻页跟随浏览历史」模式的数据层（navflip 2026-10-11）。
// 语义（bear 拍板：历史回退+尽头续读）：全时间线记录浏览过的文档；翻页轴的「前向」=历史回退
// （回到上一个浏览过的文档，跨文件夹），「后向」=历史前进；已在最新处再翻后向=兜底落到下一篇
// 兄弟文档（续读新篇）——旧轨迹回看与顺序阅读两不误。浏览器式分叉：中途回退后打开新文档=
// 截断其后前向分支再追加。
// 存储：localStorage（浏览轨迹是本机行为，不进设置文件防 settings 落盘搭车、不进插件数据防
// 云同步扰动）；封顶 200 条丢最旧。事件记录名缺省回填：先在轨迹里找同 id 旧名。
// 纯函数（visitAppend/steppedTo/back·forwardTargetOf）为单测锚点；IO 薄壳 loadState/save。

import type { NavDocTarget } from "./navTree";

export interface NavHistoryEntry {
    /** 文档 id */
    i: string;
    /** 文档名（浏览时快照，预览用；改名后旧轨迹仍显示旧名，下次访问刷新） */
    n: string;
}

export interface NavHistoryState {
    v: 1;
    /** 浏览轨迹（时间序，尾=最新） */
    t: NavHistoryEntry[];
    /** 游标（当前所处下标；-1=空轨迹） */
    c: number;
    /** 各父文档下最后浏览的子文档 id（进入子文件夹位置记忆 navflip-r2）：父 id → 子 id。
     *  早态轨迹数据无此字段，读取侧恒按 ?? {} 兜底；visitAppend 视其为旁路字段透传保留。
     *  不设上限——条目=两个 id 串 ~50B，千文件夹级重度用户也仅数十 KB，远低于配额 */
    p?: Record<string, string>;
}

export const NAV_HISTORY_CAP = 200;

export function emptyNavHistory(): NavHistoryState {
    return { v: 1, t: [], c: -1 };
}

/** 浏览到 id：=游标处 → 仅刷名；否则截断前向分支+追加+封顶丢最旧（游标恒指尾） */
export function visitAppend(s: NavHistoryState, id: string, name: string): NavHistoryState {
    if (!id) return s;
    if (s.c >= 0 && s.t[s.c]?.i === id) {
        if (!name || s.t[s.c].n === name) return s;
        const t = s.t.slice();
        t[s.c] = { i: id, n: name };
        return { ...s, t };
    }
    const t = s.t.slice(0, s.c + 1);
    t.push({ i: id, n: name || s.t.find((e) => e.i === id)?.n || "" });
    if (t.length > NAV_HISTORY_CAP) t.splice(0, t.length - NAV_HISTORY_CAP);
    // p（位置记忆）是旁路字段不属于轨迹操作，透传保留（丢=recordVisit 组合写会清记忆）
    return { v: 1, t, c: t.length - 1, p: s.p };
}

/** 罗盘历史跳转落地：id 恰为游标相邻（±1）才移游标——普通新访问（不相邻）不误吞，
 *  照常走 visitAppend 的追加/分叉路径 */
export function steppedTo(s: NavHistoryState, id: string): NavHistoryState {
    if (s.c >= 0 && s.t[s.c]?.i === id) return s;
    if (s.c + 1 < s.t.length && s.t[s.c + 1]?.i === id) return { ...s, c: s.c + 1 };
    if (s.c - 1 >= 0 && s.t[s.c - 1]?.i === id) return { ...s, c: s.c - 1 };
    return s;
}

export function backTargetOf(s: NavHistoryState): NavDocTarget | null {
    const e = s.c - 1 >= 0 ? s.t[s.c - 1] : null;
    return e ? { id: e.i, name: e.n, path: "" } : null;
}

export function forwardTargetOf(s: NavHistoryState): NavDocTarget | null {
    const e = s.c + 1 < s.t.length ? s.t[s.c + 1] : null;
    return e ? { id: e.i, name: e.n, path: "" } : null;
}

/** 位置记忆写入（navflip-r2）：浏览到 parentID 下的 childID——同父覆写（每父只留最后
 *  一篇）；parentID 空（顶层文档，父=笔记本）不入。独立于翻页轴（进文件夹的心智与
 *  翻页模式正交，sibling/history 两模式共享） */
export function markChildView(s: NavHistoryState, parentID: string, childID: string): NavHistoryState {
    if (!parentID || !childID || parentID === childID) return s; // 自指=脏值兜底不入
    if (s.p?.[parentID] === childID) return s;
    return { ...s, p: { ...(s.p ?? {}), [parentID]: childID } };
}

// ---- IO 薄壳（localStorage；损坏/隐私模式静默归零，浏览历史非关键数据） ----

const LS_KEY = "sy-tomato-plugin__nav-history-v1";

let state: NavHistoryState | null = null;

function loadState(): NavHistoryState {
    if (state) return state;
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
            const p = JSON.parse(raw);
            if (p?.v === 1 && Array.isArray(p.t)
                && Number.isInteger(p.c) && p.c >= -1 && p.c < p.t.length) {
                state = {
                    v: 1,
                    t: p.t.filter((e: NavHistoryEntry) => typeof e?.i === "string"),
                    c: p.c,
                    ...(p.p && typeof p.p === "object" ? { p: p.p as Record<string, string> } : {}),
                };
                return state;
            }
        }
    } catch { /* 损坏归零 */ }
    state = emptyNavHistory();
    return state;
}

function saveState(next: NavHistoryState) {
    state = next;
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch { /* 存储满/隐私模式：轨迹仅会话内生效 */ }
}

/** 浏览事件记录（switch/loaded protyle 时调；name 可空——取自事件标题元素，缺省回填旧名；
 *  parentID 可空=当前文档的父文档 id（protyle.block.parentID，顶层为空）——带上即顺笔
 *  写入位置记忆 p，与轨迹一次落盘） */
export function recordVisit(id: string, name: string, parentID?: string) {
    saveState(markChildView(visitAppend(loadState(), id, name), parentID ?? "", id));
}

/** 进入子文件夹的位置记忆快照（罗盘「进入子文档」方向键取目标用；随 histTick 同源失效） */
export function childViews(): Record<string, string> {
    return loadState().p ?? {};
}

/** 罗盘历史跳转成功后同步游标（先于 switch 事件到达，事件侧 id===t[c] 幂等收敛） */
export function navHistoryStepTo(id: string) {
    const cur = loadState();
    const next = steppedTo(cur, id);
    if (next !== cur) saveState(next);
}

/** 翻页轴历史目标（无历史/空轨迹 → 双 null，方向键由兄弟序兜底或置灰） */
export function navHistoryTargets(): { back: NavDocTarget | null; forward: NavDocTarget | null } {
    const s = loadState();
    return { back: backTargetOf(s), forward: forwardTargetOf(s) };
}

/** 单测/调试通道：替换底层状态（传 null=清缓存，下次访问从 localStorage 重读） */
export function __setNavHistoryForTest(s: NavHistoryState | null) {
    state = s;
}
