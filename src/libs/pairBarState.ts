// PairBar —— 块配对功能优先浮条 V4 状态机纯逻辑（R3 □2，设计共识=memory pairbar-r3-func-first-design）。
// 模型：idle →(触发)→ funcs（六功能钮面板）→(点功能)→ slots（按功能框数渲染：
// 两框=[源可多块,目标]、三框=搬运[起始,结束,目标]）。配默认功能出场直跳 slots（R4 起
// 「上次功能」直跳退役，lastFunc 只存面板高亮）；funcs 态再触发=收面板；slots 态触发器=
// 填下一空框、框齐立即执行（拍板 A 三步合一，✓ 是鼠标流专属确认通道）；Esc/✕ 任意态取消。
// 选区暂存 stash：出场记、点功能后消费（R4 起无选区时控制器可合成「最近用过的块」伪 stash）。
// 三框区间解析是控制器职责（wysiwyg 顶层平铺序闭区间、起止跨文档拦截），纯函数层
// 只收已解析 ids；resolveRangeIDs 以注入 flat 的方式可单测。本层只做纯转移与门禁
// 判定（可单测）；DOM/思源 API 副作用在 PairBarBox 控制器。
import { cloneCleanDiv } from "./blockUtils";

export type PairPhase = "idle" | "funcs" | "slots";
export type PairFuncID = "bilink" | "embedBilink" | "refOnly" | "insRefs" | "sync" | "transport";
/** 搬运三档（R5 □2）：delete=起止两框闭区间删除（目标框纯视图收起，tgtID 数据保留）；
 *  不跨出场记忆——每次出场重置回 move（破坏性操作不被「上次用过」自动恢复，风险不对称） */
export type PairTransportMode = "move" | "copy" | "delete";
/** funcGated 仅剩「非法功能 id」兜底语义（R5 □1 总开关化：功能级开关门禁退役，只剩 VIP 档） */
export type PairErr = "noSource" | "noTarget" | "sameTarget" | "funcGated" | "vipGated" | "srcMulti";

export interface PairState {
    phase: PairPhase;
    /** 已选功能（slots 态恒有——进框态必经 pickFunc 或默认功能直跳；funcs 态=回面板前用的功能） */
    func: PairFuncID | null;
    /** 出场选区暂存（拍板 6）：funcs 态点功能自动填；换功能映射的兜底源 */
    stash: PairEvent | null;
    /** 框 1：两框=源（可多块，multiSrc 功能全用、单源功能取首块）；三框=起始块（单块） */
    srcIDs: string[];
    srcSummary: string;
    /** 框 2（仅三框）：结束块（起=止合法=单块区间） */
    endID: string | null;
    endSummary: string;
    /** 目标框（两框=框 2 / 三框=框 3）：单块（历史 target=首块语义） */
    tgtID: string | null;
    tgtSummary: string;
    /** 焦点框：点编辑器块回填进焦点框；null=框齐点块不改框（治旧 target 态点块即执行误触） */
    focusSlot: 1 | 2 | 3 | null;
    transportMode: PairTransportMode;
    /** 三框区间块数预览（控制器回填：起止齐后解析区间长度；null=未解析/跨文档。纯函数层不读写） */
    rangeCount: number | null;
}

export interface PairFuncSpec {
    id: PairFuncID;
    icon: string;
    vip: boolean;
    /** 同步块/嵌入互链/搬运用全部源；互链族取第一个（沿 markBlock 语义） */
    multiSrc: boolean;
    /** V4 框数：搬运=3（起始/结束/目标，区间=文档顺序闭区间全部顶层块）；其余=2（源可多选+目标） */
    boxes: 2 | 3;
    /** i18n 文案 key（tomatoI18n getter 名） */
    labelKey: string;
    /** tooltip 键位行的老命令 winHotkey langKey 引用（R5 □3）：互链族/同步块=[选, 建]，
     *  transport=[移, 复, 删]。只存 langKey 字符串（渲染层查常量表调 .w() 现读 keymap，
     *  与速查子菜单同一批常量=同源不漂移；本层不 import LinkBox/CpBox，单测链不受牵连） */
    hkKeys?: readonly [string, string] | readonly [string, string, string];
}

/** 六功能 spec：id 顺序即浮条图标横排顺序，也是设置默认功能下拉顺序（勿随意重排）。
 *  R5 □1 总开关化：gate 字段退役——功能注册全由 pairBarEnabled 总开关管（命令注册制，
 *  开关关=功能压根不在，浮条无需按功能灰态）；浮条灰态只剩 VIP 档 */
export const PAIR_FUNCS: PairFuncSpec[] = [
    { id: "bilink", icon: "iconLink", vip: false, multiSrc: false, boxes: 2, labelKey: "双向互链", hkKeys: ["bilinkSelectBlock", "bilinkSelectBlock roundtrip"] },
    { id: "embedBilink", icon: "iconSQL", vip: true, multiSrc: true, boxes: 2, labelKey: "嵌入互链", hkKeys: ["bilinkSelectBlock embed", "bilinkCreateLnk"] },
    { id: "refOnly", icon: "iconRef", vip: false, multiSrc: false, boxes: 2, labelKey: "关联两个块", hkKeys: ["bilinkSelectBlockRefOnly", "bilinkCreateLnkRefOnly"] },
    { id: "insRefs", icon: "iconBoth", vip: false, multiSrc: false, boxes: 2, labelKey: "互相插入引用", hkKeys: ["bidirection refs select", "bidirection refs create"] },
    { id: "sync", icon: "iconRefresh", vip: false, multiSrc: true, boxes: 2, labelKey: "同步块", hkKeys: ["list refs select", "list refs create"] },
    { id: "transport", icon: "iconMove", vip: false, multiSrc: true, boxes: 3, labelKey: "搬运", hkKeys: ["moveBlocks", "copyBlocks", "deleteBlocks"] },
];

export const initialPairState: PairState = {
    phase: "idle",
    func: null,
    stash: null,
    srcIDs: [],
    srcSummary: "",
    endID: null,
    endSummary: "",
    tgtID: null,
    tgtSummary: "",
    focusSlot: 1,
    transportMode: "move",
    rangeCount: null,
};

/** 拖 chip 的自定义 MIME（□3 V2）：内核/其它拖拽互不认领（渐进 □12 同款做法）；
 *  Firefox 须 setData 才启动拖拽。组件 dragstart 写、控制器 dragover 只看 dragging
 *  标志不验 MIME（事件源头必是自家 chip），常量放纯函数层供组件 import 防循环依赖。 */
export const PAIR_DRAG_MIME = "application/x-tomato-pair";

/** 思源 gutter 块拖拽的 dataTransfer 键前缀（拖块进框认领判据，二轮 □3）：
 *  完整 MIME = 前缀+块类型+ZWSP+子类型+ZWSP+ids(逗号分隔)+ZWSP+workspace——块 id 编在
 *  键名里（value 是整棵 wysiwyg innerHTML，太重不解析），types[] 拖拽中即可读。 */
export const SIYUAN_GUTTER_PREFIX = "application/siyuan-gutter";
const ZWSP = "\u200b";

/** 从 gutter 拖拽 MIME 键名解析块 id 序列（拖块进框）：非块拖拽键返回空。
 *  内核同前缀还有 AV 族变体（ViewTab/Col/GalleryItem/Group，editorCommonEvent.ts：
 *  segs 结构不同，Group 甚至把 groupId 直拼段尾）——segs[2] 不是块 id，一律不认领
 *  （二轮 □3 评审 P1-1：拖 AV 列头/看板分组经过框位不得被当块填入）。 */
export function gutterDropIDs(mimeType: string): string[] {
    if (!mimeType.startsWith(SIYUAN_GUTTER_PREFIX)) return [];
    const segs = mimeType.slice(SIYUAN_GUTTER_PREFIX.length).split(ZWSP);
    if ((segs[0] ?? "").toLowerCase().startsWith("nodeattributeview")) return [];
    return (segs[2] ?? "").split(",").filter(Boolean);
}

/** 浮条位置钳制进视口（体验增强 □2：拖动松手/出场共用）——记忆位置落在视口外
 *  （窗口缩小/分辨率变化后）时收边，防浮条漂出屏幕不可达。浮条尺寸动态（flex-wrap
 *  换行），w/h 由调用方现场量传。浮条比视口宽时贴左（max(0,·) 不翻转）。 */
export function clampPos(x: number, y: number, vw: number, vh: number, w: number, h: number): { x: number; y: number } {
    return {
        x: Math.max(0, Math.min(x, vw - w)),
        y: Math.max(0, Math.min(y, vh - h)),
    };
}

/** 填框事件载荷：控制器现读 selectedDivs / gutter drop 后传入（ids=块 id 序列，summary=首块文本切片）。
 *  summaryLast=末块文本切片：多块载荷起止分显（三框结束框 chip 须显末块文本，共用首块
 *  summary 会张冠李戴，2026-09-01 vision 实锤）；缺省回落 summary（单块/旧调用兼容）。
 *  cursorOnly=selectedDivs 光标兜底标记（无块选/拖蓝，仅光标焦点块）——三框预填判据：
 *  光标只进起始框、结束留空等用户选（2026-09-01 用户拍板）；真实选区（含单块）首末进起止。 */
export interface PairEvent {
    ids: string[];
    summary?: string;
    summaryLast?: string;
    cursorOnly?: boolean;
    /** R4 伪预填标记：控制器把「最近用过的块」合成单块 cursorOnly 事件（无选区无光标时
     *  的第一框预填兜底）；纯函数层行为同 cursorOnly，仅面板 hint 据此分显文案 */
    lastSrc?: boolean;
}

/** 门禁上下文（R5 □1 总开关化后只剩 VIP 档）：vip=lastVerifyResult() */
export interface PairGateCtx {
    vip: boolean;
}

/** 门禁上下文缺省值：不设防（控制器总会传真实快照；纯函数层面缺上下文≠拦截） */
const UNGATED: PairGateCtx = { vip: true };

/** 图标灰态/点击拦截统一判据：VIP 功能未验证 → vipGated；放行 null */
export function pairGateErr(spec: PairFuncSpec, ctx?: Partial<PairGateCtx>): PairErr | null {
    if (spec.vip && !(ctx?.vip ?? UNGATED.vip)) return "vipGated";
    return null;
}

type PairResult = { state: PairState; err?: PairErr; attemptFunc?: PairFuncID };

// ---------------- 框数/就绪判定（UI 与转移函数共用） ----------------

/** 功能框数：搬运 3、其余 2；func 未设按两框缺省（不该出现的态，防御）。
 *  R5 □2 搬运三档：mode 参=当前「有效框数」——transport+delete 返回 2（目标框纯视图收起）；
 *  缺省调用恒返回 spec.boxes（最大框数=数据形态框数——填/清的框 ② 语义分支与换功能
 *  映射类别判定用它，不受删除档视图收起影响）。 */
export function pairBoxCount(func: PairFuncID | null | undefined, mode?: PairTransportMode): 2 | 3 {
    const n = PAIR_FUNCS.find(f => f.id === func)?.boxes ?? 2;
    return n === 3 && mode === "delete" ? 2 : n;
}

/** 第一个未填的框号（填框推进目标）：框 i 填没填 = 目标框看 tgtID、其余看对应字段；
 *  全填返回 null（框齐）。删除档=起止两框齐即框齐（目标框纯视图不参与判定） */
export function pairFirstEmpty(s: PairState): 1 | 2 | 3 | null {
    const boxes = pairBoxCount(s.func);
    if (s.srcIDs.length === 0) return 1;
    if (boxes === 3 && !s.endID) return 2;
    if (s.func === "transport" && s.transportMode === "delete") return null;
    if (!s.tgtID) return boxes;
    return null;
}

/** 全框填齐判定（✓ 亮出条件） */
export function pairBoxesFilled(s: PairState): boolean {
    return pairFirstEmpty(s) === null;
}

/** 从选区暂存预填框区（出场直跳/funcs 点功能共用）：两框整组进源框；三框首/末进起止框
 *  （光标 cursorOnly 只进起始，结束留空——光标≠选区，单块区间仍可手选同块达成） */
function prefilledFromStash(func: PairFuncID, stash: PairEvent | null): Pick<PairState, "srcIDs" | "srcSummary" | "endID" | "endSummary"> {
    const ids = stash?.ids ?? [];
    if (pairBoxCount(func) === 3) {
        const first = ids[0] ?? null;
        const last = stash && !stash.cursorOnly && ids.length > 0 ? ids[ids.length - 1] : null;
        return { srcIDs: first ? [first] : [], srcSummary: first ? (stash?.summary ?? "") : "", endID: last, endSummary: last ? (stash?.summaryLast ?? stash?.summary ?? "") : "" };
    }
    return { srcIDs: [...ids], srcSummary: ids.length > 0 ? (stash?.summary ?? "") : "", endID: null, endSummary: "" };
}

/**
 * 同一触发器推进一步（快捷键/状态栏按钮/菜单项共用）：
 * - idle → funcs 功能面板（选区进 stash 不进框）；配置了可用功能则直跳 slots 预填
 *   （拍板 5/7：设置默认功能优先，没设用上次功能零配置兜底；设置默认被门禁拦回
 *   funcs 面板不静默用上次功能顶替——显式配置该可见地失效）。
 * - funcs → 收面板回 idle（□1 语义沿）。
 * - slots → 填下一空框（两框源框多块整组入/其余取首块）；这一填正好框齐则立即
 *   执行（拍板 A 三步合一，✓ 是鼠标流通道）；框本已齐（无框可填）=直接执行。
 */
export function pairTrigger(s: PairState, ev: PairEvent, opts: { defaultFunc?: PairFuncID | ""; vip?: boolean }): PairResult & { runFunc?: PairFuncID } {
    const ctx = { vip: opts.vip };
    if (s.phase === "idle") {
        // 预选功能只认设置里的默认功能（显式配置，R4 2026-09-01 起「上次功能」直跳退役：
        // 老用户被上次恰好用的功能直跳框态咬过——出场一律先面板自己选；lastFunc 只存面板高亮）
        const want = opts.defaultFunc || "";
        const spec = PAIR_FUNCS.find(f => f.id === want);
        if (spec && !pairGateErr(spec, ctx)) {
            const pre = prefilledFromStash(spec.id, ev);
            return {
                state: {
                    ...initialPairState,
                    phase: "slots",
                    func: spec.id,
                    stash: ev.ids.length > 0 ? ev : null,
                    ...pre,
                    focusSlot: pre.srcIDs.length === 0 ? 1 : (pairFirstEmpty({ ...initialPairState, func: spec.id, ...pre }) ?? null),
                },
            };
        }
        return { state: { ...initialPairState, phase: "funcs", stash: ev.ids.length > 0 ? ev : null } };
    }
    if (s.phase === "funcs") return { state: initialPairState };
    // slots：填下一空框；填完框齐（或本已框齐）→ 三步合一立即执行
    const k = pairFirstEmpty(s);
    if (!k) return pairConfirm(s, ctx);
    // 有空框待填而无选区/光标块（框齐裸按后的执行不需要选区，先走上面的 confirm）
    if (ev.ids.length === 0) return { state: s, err: k === pairBoxCount(s.func) ? "noTarget" : "noSource" };
    const filled = pairFillBox(s, k, ev);
    if (filled.err) return filled;
    if (pairBoxesFilled(filled.state)) {
        const c = pairConfirm(filled.state, ctx);
        // 这一按的主意图是填框、执行是顺势：门禁/多源类拦截静默降级（面板自显灰态），
        // 与框齐后裸按（主意图=执行，报错正当）区分
        if (c.runFunc) return c;
        return { state: c.state };
    }
    return filled;
}

/**
 * 点功能钮（funcs 面板）→ 进框态：
 * - 初选（funcs 态 func 为空）：stash 预填框区（两框整组进源/三框首末进起止）。
 * - 重选同一功能（回面板后）：框内容原样恢复（暂存重填拍板）。
 * - 换功能：按新功能框数映射现有内容——2→3 源组首/末块进起止；3→2 控制器可传
 *   rangeIDs（区间解析结果整段进源框），缺省回落起/止两端；2→2 原样保留只换功能。
 * 目标框与 transportMode 恒保留。门禁失败不进框态（面板上本就灰态，此为点击兜底）。
 */
export function pairPickFunc(s: PairState, func: PairFuncID, ctx?: Partial<PairGateCtx>, opts?: { rangeIDs?: string[] }): PairResult {
    if (s.phase !== "funcs") return { state: s };
    const spec = PAIR_FUNCS.find(f => f.id === func);
    if (!spec) return { state: s, err: "funcGated" };
    const gate = pairGateErr(spec, ctx);
    if (gate) return { state: s, err: gate, attemptFunc: func };
    if (s.func === func) return { state: { ...s, phase: "slots", rangeCount: null, focusSlot: pairFirstEmpty({ ...s, phase: "slots" }) ?? null } };
    let next: Pick<PairState, "srcIDs" | "srcSummary" | "endID" | "endSummary">;
    if (!s.func) {
        next = prefilledFromStash(func, s.stash);
    } else if (pairBoxCount(s.func) === pairBoxCount(func)) {
        next = { srcIDs: [...s.srcIDs], srcSummary: s.srcSummary, endID: s.endID, endSummary: s.endSummary };
    } else if (pairBoxCount(func) === 3) {
        // 2→3：源组首/末块映射进起止框（无源=空框起步）；状态里只存首块摘要，
        // 末块文本由控制器 pickFunc 后 syncEndSummary 现查补正（多源时首块文本张冠李戴）。
        // 注：此路径不区分光标/选区来源（srcIDs 无从溯源，单源起=止=「搬运这一个块」
        // 语义完整可执行）——与「光标直跳三框只填起始」的有意取舍（review P2-1）
        const ids = s.srcIDs;
        next = {
            srcIDs: ids.length > 0 ? [ids[0]] : [],
            srcSummary: ids.length > 0 ? s.srcSummary : "",
            endID: ids.length > 0 ? ids[ids.length - 1] : null,
            endSummary: ids.length > 0 ? s.srcSummary : "",
        };
    } else {
        // 3→2：区间解析结果整段进源框（控制器注入），缺省起/止两端兜底
        const ids = opts?.rangeIDs ?? [s.srcIDs[0], s.endID].filter(Boolean) as string[];
        next = { srcIDs: ids, srcSummary: ids.length > 0 ? s.srcSummary : "", endID: null, endSummary: "" };
    }
    const st: PairState = { ...s, ...next, phase: "slots", func, rangeCount: null };
    return { state: { ...st, focusSlot: pairFirstEmpty(st) ?? null } };
}

/**
 * 填框（点编辑器块回填进焦点框 / gutter 拖块进指定框 / 焦点框有内容点块直接覆盖 /
 * chip 拖编辑器填目标框——支持乱序，填完焦点跳下一空框）：
 * 框 1 两框=多块整组入、三框=取首块；框 2 三框=结束块（起=止合法）；目标框恒取首块。
 * 目标命中源（两框=源组、三框=起/止）→ sameTarget 拦在填框层（保持原框不动）。
 */
export function pairFillBox(s: PairState, slot: 1 | 2 | 3, ev: PairEvent): PairResult {
    if (s.phase !== "slots" || ev.ids.length === 0) return { state: s };
    // 有效框数守卫：删除档框 ③ 通道关闭（slot>2 no-op）
    if (slot > pairBoxCount(s.func, s.transportMode)) return { state: s };
    // 框 ② 语义分支用最大框数（数据形态）：transport 框 ② 恒=结束框，不随删除档变
    const boxes = pairBoxCount(s.func);
    let next: PairState;
    if (slot === 1) {
        if (boxes === 2) {
            next = { ...s, srcIDs: [...ev.ids], srcSummary: ev.summary ?? "" };
        } else {
            // 三框框 1 收到多块（拖放/键盘流带选区）：首末进起止框（与选区暂存同语义，
            // 结束摘要用末块文本切片），单块只进起始、结束框保持不动（空=留用户选）；
            // 焦点自然跳下一空框（firstEmpty）
            next = {
                ...s,
                srcIDs: [ev.ids[0]],
                srcSummary: ev.summary ?? "",
                endID: ev.ids.length > 1 ? ev.ids[ev.ids.length - 1] : s.endID,
                endSummary: ev.ids.length > 1 ? (ev.summaryLast ?? ev.summary ?? "") : s.endSummary,
            };
        }
    } else if (boxes === 3 && slot === 2) {
        next = { ...s, endID: ev.ids[0], endSummary: ev.summary ?? "" };
    } else {
        const t = ev.ids[0];
        const src = boxes === 3 ? [s.srcIDs[0], s.endID].filter(Boolean) : s.srcIDs;
        if (src.includes(t)) return { state: s, err: "sameTarget" };
        next = { ...s, tgtID: t, tgtSummary: ev.summary ?? "" };
    }
    return { state: { ...next, focusSlot: pairFirstEmpty(next) ?? null } };
}

/** chip ✕ 删框：清该框，焦点落回该框待重填。删除档框 ③ no-op（tgtID 残留数据不动）；
 *  框 ② 语义按最大框数：transport 恒清结束框 */
export function pairClearBox(s: PairState, slot: 1 | 2 | 3): PairState {
    if (s.phase !== "slots" || slot > pairBoxCount(s.func, s.transportMode)) return s;
    if (slot === 1) return { ...s, srcIDs: [], srcSummary: "", focusSlot: 1, rangeCount: null };
    if (slot === 2 && pairBoxCount(s.func) === 3) return { ...s, endID: null, endSummary: "", focusSlot: 2, rangeCount: null };
    return { ...s, tgtID: null, tgtSummary: "", focusSlot: pairBoxCount(s.func) };
}

/** slots 态点当前功能图标 → 回 funcs 面板换功能（数据保留：重选同功能=恢复、换功能=映射）。
 *  stash 清空：选区暂存只服务出场初选（pairPickFunc 的 !s.func 分支），回面板后
 *  funcs 提示「已记住选区」是虚报——用户清框回面板重点功能=空框起步（review P2-3） */
export function pairBackToFuncs(s: PairState): PairState {
    if (s.phase !== "slots") return s;
    return { ...s, phase: "funcs", focusSlot: 1, rangeCount: null, stash: null };
}

/**
 * ✓ 显式确认即执行（原 V3 runFunc 语义；框齐才亮钮，此函数仍全量校验兜底）：
 * 框缺块 → 门禁 → 单源功能遇多源（srcMulti）→ 目标命中源（两框=源组/三框=起止，
 * 区间内部命中由控制器执行前用区间解析拦截）→ 回 idle，控制器按 runFunc 执行。
 * 删除档（R5 □2）无目标框语义：noTarget/sameTarget 均豁免（tgtID 纯残留数据）。
 */
export function pairConfirm(s: PairState, ctx?: Partial<PairGateCtx>): PairResult & { runFunc?: PairFuncID } {
    if (s.phase !== "slots") return { state: s };
    const boxes = pairBoxCount(s.func);
    if (s.srcIDs.length === 0 || (boxes === 3 && !s.endID)) return { state: s, err: "noSource" };
    const isDel = s.func === "transport" && s.transportMode === "delete";
    if (!isDel && !s.tgtID) return { state: s, err: "noTarget" };
    const spec = PAIR_FUNCS.find(f => f.id === s.func);
    if (!spec) return { state: s, err: "funcGated" };
    const gate = pairGateErr(spec, ctx);
    if (gate) return { state: s, err: gate };
    if (!spec.multiSrc && s.srcIDs.length > 1) return { state: s, err: "srcMulti" };
    if (!isDel) {
        const src = boxes === 3 ? [s.srcIDs[0], s.endID!] : s.srcIDs;
        if (src.includes(s.tgtID)) return { state: s, err: "sameTarget" };
    }
    return { state: initialPairState, runFunc: s.func };
}

/** 三框区间解析（纯函数，flat=控制器注入的文档顶层平铺 id 序）：文档顺序闭区间
 *  （含两端、起止倒序自动正序化、起=止=单块区间）；任一端不在平铺序（跨文档/
 *  已删/文档已关）返回 null——控制器据此提示「起止须在同一文档」。 */
export function resolveRangeIDs(startID: string, endID: string, flat: string[]): string[] | null {
    const i = flat.indexOf(startID);
    const j = flat.indexOf(endID);
    if (i < 0 || j < 0) return null;
    return flat.slice(Math.min(i, j), Math.max(i, j) + 1);
}

/** Esc/× 任意态取消 → idle */
export function pairCancel(_s: PairState): PairState {
    return initialPairState;
}

/** 搬运三档切换（R5 □2：move|copy|delete）：选中搬运进框态即可切（与填框并行操作），
 *  其余 no-op；切档=纯视图态**不触发框间映射**——tgtID/endID 数据保留，切回 move/copy
 *  目标框自动重显（起止未变 rangeCount 也不动，「删除 N 块」与「移动 N 块」同源）。 */
export function pairSetMode(s: PairState, mode: PairTransportMode): PairState {
    if (s.phase !== "slots" || s.func !== "transport" || s.transportMode === mode) return s;
    return { ...s, transportMode: mode };
}

/** 搬运 ops 构造（依赖注入 trans 工厂保纯函数可测；reasoning 评审 P0-1：复制必须
 *  cloneCleanDiv 换新 ID——活副本原块 ID 原地不动，否则页面/内核块 ID 分叉打错块） */
export function buildTransportOps(
    srcDivs: HTMLElement[],
    targetID: string,
    copy: boolean,
    trans: {
        insertAfter: (htmls: string[], id: string) => IOperation[];
        moveAfter: (ids: string[], id: string) => IOperation[];
    },
): IOperation[] {
    if (copy) {
        const htmls = srcDivs.map(d => cloneCleanDiv(d).div.outerHTML);
        return [...trans.insertAfter(htmls, targetID)];
    }
    const ids = srcDivs.map(d => d.getAttribute("data-node-id")).filter(Boolean) as string[];
    return [...trans.moveAfter(ids, targetID)];
}

/** 源与目标互为祖先/子孙判定（□2 评审转出①）：源=超级块、目标=其子块这类场景
 *  sameTarget 的 ID 相等检查抓不到，transport 会把子块 move 进自己祖先——控制器在
 *  执行前用它拦截。ID 相同不算（sameTarget 纯函数层已管）；detached 源 contains
 *  自然不命中，无害。 */
export function isRelatedTarget(srcDivs: HTMLElement[], target: HTMLElement | null | undefined): boolean {
    if (!target) return false;
    return srcDivs.some(d => d?.contains(target) || target.contains(d));
}
