// 文档树「在库内」标记器（knowledgebox □8）：
// 白名单条目根 = 状态点（同面板徽章色语言：蓝已同步/黄待同步/红失败/空心未同步）；
// 条目子树内部文档 = 浅标记（半透明主色）；排除节点及其子孙 = 禁止标记（⊘）。
// 纯 DOM 注入零落盘（三件套：只读载体+纯注入+幂等清残留）；数据源 = knowledgeSync
// 内存快照 getKSSnapshot（loadKS 必经点统一刷新），数据变化路径调 kbTreeMarkRefresh。
// 自触发防御：sweep 幂等（变体+tooltip 全同则零 mutation），稳态不触发 observer。
import { getKSSnapshot } from "./libs/knowledgeSync";
import { tomatoI18n } from "./tomatoI18n";
import { debugLog } from "./libs/logUtils";

const MARK_CLASS = "sy-kb-mark";
const STYLE_FLAG = "data-tomato-kb-tree-style";
/** 打标器专用样式（不进 cssStyle loadCss 家族：随知识库功能开关联动而非独立开关） */
const MARK_CSS = `
.sy-kb-mark { position: relative; flex: none; width: 7px; height: 7px; border-radius: 50%; margin: 0 2px 0 4px; }
.sy-kb-mark--ok { background: var(--b3-theme-primary); }
.sy-kb-mark--chg { background: var(--b3-theme-secondary); }
.sy-kb-mark--fail { background: var(--b3-theme-error); }
.sy-kb-mark--none { background: transparent; border: 1px solid var(--b3-theme-on-surface-light); }
.sy-kb-mark--sub { background: color-mix(in srgb, var(--b3-theme-primary) 35%, transparent); }
/* 亮色浅点提一档（vision P2-2：35% 在白底 ≈1.2:1 过弱） */
html[data-theme-mode="light"] .sy-kb-mark--sub { background: color-mix(in srgb, var(--b3-theme-primary) 50%, transparent); }
/* 行高亮/选中态浅点提亮（vision P1-1：35% 落在选中底 ≈1.5:1 近不可见——用户正注视的场景反而失效） */
.b3-list-item:hover > .sy-kb-mark--sub,
.b3-list-item--focus > .sy-kb-mark--sub { background: color-mix(in srgb, var(--b3-theme-primary) 70%, transparent); }
.sy-kb-mark--excl { background: transparent; border: 1px solid var(--b3-theme-on-surface-light); overflow: hidden; }
.sy-kb-mark--excl::after {
    content: ""; position: absolute; left: -1px; top: 3px; width: 9px; height: 0;
    border-top: 1px solid var(--b3-theme-on-surface-light);
    transform: rotate(-45deg); transform-origin: center;
}
`;

type Variant = "ok" | "chg" | "fail" | "none" | "sub" | "excl";

/** 行 data-path → 祖先 id 链（含自身；剥 .sy；首空段=notebook 剥掉）。
 *  子文档物理目录 = 父文档 id 不带 .sy，故各段即完整祖先链。 */
export function pathAncestorIDs(dataPath: string): string[] {
    return dataPath.split("/").filter(Boolean).map(seg => seg.replace(/\.sy$/, ""));
}

function entryVariant(state: { ok: boolean; changed?: boolean } | undefined): Variant {
    if (!state) return "none";
    if (!state.ok) return "fail";
    if (state.changed) return "chg";
    return "ok";
}

function variantLabel(v: Variant, syncedAt?: number): string {
    switch (v) {
        case "ok": {
            const t = syncedAt ? new Date(syncedAt) : null;
            const hh = t ? String(t.getHours()).padStart(2, "0") : "";
            const mm = t ? String(t.getMinutes()).padStart(2, "0") : "";
            return `${tomatoI18n.已同步} ${hh}:${mm}`;
        }
        case "chg": return tomatoI18n.待同步;
        case "fail": return tomatoI18n.同步失败;
        case "none": return tomatoI18n.未同步;
        case "sub": return tomatoI18n.在知识库内;
        case "excl": return tomatoI18n.已从知识库排除;
    }
}

/** 单行目标态：null=无标；判定优先级 排除 > 条目根 > 子树内（sets=sweep 级预构建，review P2-1） */
function desiredMark(anc: string[], listIDs: Set<string>, exclIDs: Set<string>, state: Record<string, { ok: boolean; changed?: boolean; syncedAt?: number }>): { v: Variant; label: string; syncedAt?: number } | null {
    if (anc.some(id => exclIDs.has(id))) return { v: "excl", label: variantLabel("excl") };
    const self = anc[anc.length - 1];
    if (listIDs.has(self)) {
        const st = state[self];
        const v = entryVariant(st);
        return { v, label: variantLabel(v, st?.syncedAt), syncedAt: st?.syncedAt };
    }
    if (anc.some(id => listIDs.has(id))) return { v: "sub", label: variantLabel("sub") };
    return null;
}

function applyMark(row: HTMLElement, want: { v: Variant; label: string; syncedAt?: number } | null): void {
    const cur = row.querySelector(`:scope > .${MARK_CLASS}`) as HTMLElement | null;
    if (!want) {
        if (cur) cur.remove();
        return;
    }
    const aria = want.v === "ok" || want.v === "chg" || want.v === "fail" || want.v === "none" ? want.label : undefined;
    const key = `${want.v}|${aria ?? ""}`;
    if (cur && `${cur.getAttribute("data-kb")}|${cur.getAttribute("aria-label") ?? ""}` === key) return;  // 稳态零 mutation
    if (cur) {
        // 更新路径补齐 tooltip 类（review P1-1：className 整赋值会把插入路径挂的 b3-tooltips 抹掉）
        cur.className = `${MARK_CLASS} ${MARK_CLASS}--${want.v}${aria ? " b3-tooltips b3-tooltips__e" : ""}`;
        cur.setAttribute("data-kb", want.v);
        if (aria) cur.setAttribute("aria-label", aria); else cur.removeAttribute("aria-label");
        return;
    }
    const span = document.createElement("span");
    span.className = `${MARK_CLASS} ${MARK_CLASS}--${want.v}`;
    span.setAttribute("data-kb", want.v);
    if (aria) span.setAttribute("aria-label", aria);
    // 根状态点挂 tooltip（同步状态/时间）；子标/禁止标语义自明不挂（信息平铺，tooltip 只兜底）
    if (aria) span.classList.add("b3-tooltips", "b3-tooltips__e");
    const text = row.querySelector(":scope > .b3-list-item__text");
    row.insertBefore(span, text ? text.nextSibling : null);
}

let observer: MutationObserver | null = null;
let sweepTimer: ReturnType<typeof setTimeout> | undefined;
let sweepScheduled = false;

export function sweepKbTreeMarks(): void {
    const snap = getKSSnapshot();
    // 空态快道（review P2-1）：list/excluded 皆空=无任何目标态，清残即返回（不做全行扫描）
    if (!snap.list.length && !(snap.excluded ?? []).length) {
        if (document.querySelector(`.${MARK_CLASS}`)) {
            document.querySelectorAll(`.${MARK_CLASS}`).forEach(e => e.remove());
        }
        return;
    }
    // sets 预构建一次（review P2-1：原实现每行重建两个 Set，打字风暴下白耗）
    const listIDs = new Set(snap.list.map(i => i.docID));
    const exclIDs = new Set(snap.excluded ?? []);
    document.querySelectorAll(".file-tree li[data-node-id][data-type='navigation-file']").forEach(el => {
        const row = el as HTMLElement;
        const anc = pathAncestorIDs(row.getAttribute("data-path") ?? "");
        if (!anc.length) return;
        applyMark(row, desiredMark(anc, listIDs, exclIDs, snap.state));
    });
}

function scheduleSweep(): void {
    if (sweepScheduled) return;
    sweepScheduled = true;
    clearTimeout(sweepTimer);
    sweepTimer = setTimeout(() => {
        sweepScheduled = false;
        try { sweepKbTreeMarks(); } catch (e: any) { debugLog("knowledge", `tree mark sweep error: ${e?.message ?? e}`, "knowledgebox"); }
    }, 200);
}

/** 数据变化路径（加/排/移/同步完成）手动触发重扫（走 debounce 与 observer 合流） */
export function kbTreeMarkRefresh(): void {
    scheduleSweep();
}

export function startKbTreeMark(): void {
    stopKbTreeMark();
    if (!document.querySelector(`style[${STYLE_FLAG}]`)) {
        const style = document.createElement("style");
        style.setAttribute(STYLE_FLAG, "");
        style.innerText = MARK_CSS;
        document.head.appendChild(style);
    }
    observer = new MutationObserver(scheduleSweep);
    observer.observe(document.body, { childList: true, subtree: true });
    scheduleSweep();
    debugLog("knowledge", "tree mark started", "knowledgebox");
}

export function stopKbTreeMark(): void {
    observer?.disconnect();
    observer = null;
    clearTimeout(sweepTimer);
    sweepScheduled = false;
    document.querySelectorAll(`.${MARK_CLASS}`).forEach(e => e.remove());
    document.querySelectorAll(`style[${STYLE_FLAG}]`).forEach(e => e.remove());
}
