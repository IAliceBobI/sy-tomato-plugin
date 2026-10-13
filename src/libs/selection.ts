// selection.ts —— 统一选中解析工具（□8 期1，bear 拍板 2026-09-09）。
// 跨插件（tomato/progressive/recite）「作用于选中块」入口共用的三级链纯函数：
//   一级=块多选（gconst 双横线类，全层级查询→子块上爬容器去重，□7 教训）；
//   二级=拖蓝 range 枚举覆盖顶层块（思源 3.8 issue 8554 拖蓝不再转块选，□6）；
//   三级=光标焦点块兜底（bear「光标所在的块也接受」；contains 守卫防跨面板）。
// 纯 DOM 参数：range（recite 侧 toolbar.range 回退链由调用方解包）与 cursorEl
// （getCursorElement 结果）均注入，零单例耦合零副作用，单测直给假 DOM。
//
// 返回值数据面按消费方分家（bear □8「不同的应用拿不同的内容」）：闪卡挖空类拿
// rangeText（块内拖蓝=想挖这段字），块级消费方（keep/靶/摘抄）拿 blocks——同一选区
// 各取所需；level 标命中链级（tomato cursorOnly ↔ "cursor"）。
// 硬契约（review P1-3）：rangeText 仅 level="range" 时有效、range 仅活（isConnected）
// 时透传——detached 的陈旧 toolbar.range cloneContents 照样吐旧文本，其他 level 照给
// 会自相矛盾，文本消费方只在真拖蓝态取用。
//
// fine 档（fbfeat □5，群反馈 650189）：摘抄/制卡族 opt-in——一二级不再「嵌套块归
// 容器整块」，拿用户真选的块（容器部分被盖=下钻子块；块选标记=标记块本体，仅
// 「祖先也在选集则归祖先」防碎片）。v3.4.0 老代码即此语义（读思源块选标记本体）；
// □8 期1 统一时收成容器粒度，容器内拖蓝摘抄整锅端=回归。tomato 顶层流（keep/靶）
// 不传 fine 维持原语义。

import { blocksUnderRange, fineBlocksUnderRange } from "./domUtils";
import { DATA_NODE_ID, PROTYLE_WYSIWYG_SELECT } from "./gconst";

export type SelectionLevel = "select" | "range" | "cursor" | "none";

export interface SelectionResult {
    /** 涉及的块（默认档=顶层块，嵌套块归容器整块，文档序去重；fine 档=用户真选的
     *  块，见文件头 fine 注释） */
    blocks: HTMLElement[];
    /** 命中链级：块选/拖蓝/光标兜底/全空 */
    level: SelectionLevel;
    /** 选区纯文本——仅 level="range" 时有效，其余恒 ""（见文件头硬契约） */
    rangeText: string;
    /** 调用方解包的 range（detached 不透传；非 level="range" 时仍透传活 range——分屏下
     *  可能是他面板选区，勿在非拖蓝级单独消费，收紧示范见 Events.collectInfo） */
    range?: Range;
    /** 结果被 blockEl 单块覆盖（右键块不在链结果集内）——诊断打点用，逻辑勿依赖 */
    viaBlockEl?: boolean;
}

export function collectSelectedBlocks(
    wysiwyg: HTMLElement,
    opts: { range?: Range; cursorEl?: Element | null; blockEl?: HTMLElement; fine?: boolean } = {},
): SelectionResult {
    // 子块上爬最近 wysiwyg 直接子级（与 blocksUnderRange「只认直接子级块」语义对齐）
    const topOf = (el: Element | null): HTMLElement | null => {
        let cur: HTMLElement | null = el as HTMLElement | null;
        while (cur && cur.parentElement !== wysiwyg) cur = cur.parentElement;
        return cur;
    };
    const rangeTextOf = (r: Range | undefined): string => {
        try {
            return r?.cloneContents?.().textContent ?? "";
        } catch { return ""; }
    };
    const seen = new Set<string>();
    const dedup = (els: (HTMLElement | null)[]): HTMLElement[] => {
        const out: HTMLElement[] = [];
        for (const el of els) {
            const id = el?.getAttribute?.(DATA_NODE_ID);
            if (!el || !id || seen.has(id)) continue;
            seen.add(id);
            out.push(el);
        }
        return out;
    };

    const range = opts.range;
    const outRange = range && (range.startContainer as any)?.isConnected ? range : undefined;
    const finish = (blocks: HTMLElement[], level: SelectionLevel): SelectionResult => {
        // 右键块语义（□8 期2 下沉，recite/progressive 右键入口共用）：blockEl 在链结果集
        // 内（含被容器包含——内核 contextmenu 的 element=最内层块，链结果=顶层容器）→
        // 全集（拖蓝/块选中右键成员）；不在 → 单块（「右键别处即清选中」直觉，含
        // toolbar.range 陈旧时不再误作用旧拖蓝）。viaBlockEl 标记覆盖路径防打点失真。
        if (!opts.blockEl) return { blocks, level, rangeText: level === "range" ? rangeTextOf(range) : "", range: outRange };
        if (blocks.some(el => el === opts.blockEl || el.contains(opts.blockEl))) {
            return { blocks, level, rangeText: level === "range" ? rangeTextOf(range) : "", range: outRange };
        }
        return { blocks: [opts.blockEl], level, rangeText: "", range: outRange, viaBlockEl: true };
    };
    const hits = [...wysiwyg.querySelectorAll(`.${PROTYLE_WYSIWYG_SELECT}`)] as HTMLElement[];
    // fine 档一级不爬容器（标记块=用户点的块本体），仅祖先去重：容器与子同时被标
    // 记时归容器（容器被选=整容器语义，且防同选集碎片化——□7 教训的去重目标不变）
    let blocks = dedup(opts.fine
        ? hits.filter(h => !hits.some(o => o !== h && o.contains(h)))
        : hits.map(topOf));
    if (blocks.length) return finish(blocks, "select");

    blocks = dedup(opts.fine ? fineBlocksUnderRange(wysiwyg, range) : blocksUnderRange(wysiwyg, range));
    if (blocks.length) return finish(blocks, "range");

    // 光标三级仅一二级皆空才走（真 collapsed）；焦点可能在别的页签/面板——不在本
    // protyle 内维持空（getCursorElement 走全局 selection，blocksUnderRange 同款守卫）。
    // 注：topOf 结果若无 data-node-id（理论防御位——思源顶层子级实际恒有 id）会被 dedup
    // 丢弃落到 level="none"；tomato 侧另有 cursor 级换回内层块的映射，见 Events.collectInfo
    const cur = topOf(opts.cursorEl ?? null);
    if (cur && wysiwyg.contains(cur)) {
        blocks = dedup([cur]);
        if (blocks.length) return finish(blocks, "cursor");
    }
    return finish([], "none");
}

/** 活选区优先的 range 解析（□8 期4 移动端三钮 seed 共用，reciteSelection 同款回退链
 *  下沉）：起点在本 wysiwyg 的活选区优先；缺失/在他文档回退 toolbar.range（内核普通
 *  点击不回写 toolbar.range，「拖蓝→点别处→按快捷键」曾被陈旧旧拖蓝架空的 review
 *  P1-2 修正）；都没有再落回 live（collapsed 也收——光标兜底链的输入） */
export function resolveSeedRange(wysiwyg: HTMLElement, live?: Range, toolbarRange?: Range | null): Range | undefined {
    if (live && wysiwyg.contains(live.startContainer)) return live;
    return toolbarRange ?? live;
}

// ---- 摘抄智能默认（2026-10-12）：拖蓝覆盖分类纯函数 ----
// 「完整圈住 vs 部分圈住」按 range 边界与块内容边界关系算：整盖=整块摘（摘抄现行为），
// 部分盖=截选中文字进摘抄（截取 HTML 过 Lute 保行内样式）。消费方=progressive 摘抄
// 管线（initDi→digestUtils.getDigestMd covers 通道），输入即 fine 档返回的块集
// （fineBlocksUnderRange 递归后的叶子/整盖容器），本函数只做边界判定不动选区。

/** 单块覆盖项：full=完整圈住（整块摘现行为）；部分圈住时 clip=range 与块内容的
 *  交集 range（cloneContents 取保样式 HTML），full=true 时缺省 */
export interface RangeCoverItem {
    /** 被考察的块（与入参 blocks 同引用，getDigestMd 按引用对位） */
    block: HTMLElement;
    full: boolean;
    clip?: Range;
}

/** 装饰边界节点判据（review 2026-10-12 #3）：真实思源块 DOM 的非正文边界——块尾
 *  .protyle-attr（IAL 渲染容器，contenteditable=false 内含 ZWSP，DOM 全序上恒位于
 *  可见文本末位之后）、块首 .protyle-action（列表柄/折叠箭头，恒在正文之前）、自家
 *  摘抄痕迹 span.prog-digest-mark（块首注入，contenteditable=false）。裸最深规范化
 *  会走进它们：「拖到块末字后松手」的端点落在正文末位，恒够不着尾装饰深处 → 整盖
 *  被误判部分盖（6807 实测：正文 div+.protyle-attr 含 \u200b，单块整拖 full:false，
 *  免费用户整段拖蓝被 Pro 门禁误拦）。整盖/截取锚点一律跳过装饰取正文边界。 */
const isEdgeDecor = (n: Node): boolean =>
    n instanceof HTMLElement
    && (n.classList.contains("protyle-attr") || n.classList.contains("protyle-action") || n.classList.contains("prog-digest-mark"));

/** 块内容边界锚点：最深规范化（DOM 全序里 (容器, 子节点数) 恒严格大于「块内末文本
 *  末位」，拖蓝终点几乎总落在后者，裸 selectNodeContents 比较会把「拖到块内容末尾」
 *  误判为未整盖），下钻途中跳过装饰边界节点（isEdgeDecor）——锚点恒落在可编辑正文
 *  的首/末位置 */
const deepestContent = (n: Node, last: boolean): Node => {
    let c = n;
    while (true) {
        let next = last ? c.lastChild : c.firstChild;
        while (next && isEdgeDecor(next)) next = last ? next.previousSibling : next.nextSibling;
        if (!next) break;
        c = next;
    }
    return c;
};

/** 块内容全序边界（跳装饰，deepestContent 锚点）——整盖判定与截取块边界共用 */
function contentBoundsRange(block: Element): Range {
    const r = document.createRange();
    r.selectNodeContents(block);
    if (block.firstChild) {
        const first = deepestContent(block, false);
        const last = deepestContent(block, true);
        r.setStart(first, 0);
        r.setEnd(last, last.nodeType === 3 ? (last as Text).length : last.childNodes.length);
    }
    return r;
}

/** range 是否完整圈住块内容（锚点=正文边界，装饰不计入——「拖到块末」即整盖） */
function rangeFullyCovers(range: Range, block: Element): boolean {
    const r = contentBoundsRange(block);
    return range.compareBoundaryPoints(Range.START_TO_START, r) <= 0
        && range.compareBoundaryPoints(Range.END_TO_END, r) >= 0;
}

/** range 与块内容的交集 range：两端各取较晚/较早边界点（intersectsNode 已保证相交，
 *  交集非空故 setStart 先于 setEnd 不越序）。块边界端点同走 contentBoundsRange——
 *  截取片段不携装饰节点（.protyle-attr/ZWSP 不进 clip 产物）。构造失败返 null
 *  （防御位，调用方跳过）。 */
function intersectRange(range: Range, block: Element): Range | null {
    const br = contentBoundsRange(block);
    let sNode: Node = br.startContainer, sOff = br.startOffset;
    let eNode: Node = br.endContainer, eOff = br.endOffset;
    if (range.compareBoundaryPoints(Range.START_TO_START, br) >= 0) {
        sNode = range.startContainer; sOff = range.startOffset;
    }
    if (range.compareBoundaryPoints(Range.END_TO_END, br) <= 0) {
        eNode = range.endContainer; eOff = range.endOffset;
    }
    try {
        const out = document.createRange();
        out.setStart(sNode, sOff);
        out.setEnd(eNode, eOff);
        return out;
    } catch {
        return null;
    }
}

/** 拖蓝 range 对块集的整盖/部分盖分类（文档序随入参；TDD 见 tests/unit/selectionCover.test.ts）。
 *  range 缺失/collapsed（块选/光标态 collectInfo 不透传 range）→ 空结果，消费方恒走
 *  整块摘现行为；不相交块（陈旧引用防御位）跳过不产出条目。 */
export function coverItemsUnderRange(range: Range | undefined | null, blocks: HTMLElement[]): RangeCoverItem[] {
    if (!range || range.collapsed || blocks.length === 0) return [];
    const out: RangeCoverItem[] = [];
    for (const b of blocks) {
        if (!range.intersectsNode(b)) continue;
        if (rangeFullyCovers(range, b)) {
            out.push({ block: b, full: true });
            continue;
        }
        const clip = intersectRange(range, b);
        if (clip) out.push({ block: b, full: false, clip });
    }
    return out;
}
