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

import { blocksUnderRange } from "./domUtils";
import { DATA_NODE_ID, PROTYLE_WYSIWYG_SELECT } from "./gconst";

export type SelectionLevel = "select" | "range" | "cursor" | "none";

export interface SelectionResult {
    /** 涉及的顶层块（嵌套块归容器整块，文档序去重） */
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
    opts: { range?: Range; cursorEl?: Element | null; blockEl?: HTMLElement } = {},
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
    let blocks = dedup(hits.map(topOf));
    if (blocks.length) return finish(blocks, "select");

    blocks = dedup(blocksUnderRange(wysiwyg, range));
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
