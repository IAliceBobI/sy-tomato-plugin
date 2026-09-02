// □3（2026-09-02）提及马克笔·编辑态保留：展示态高亮是内核 API 带 keyword/提及关键词
// 时烤进 dom 的 <mark>（highlight 参数默认 true，kernel/api/ref.go）；点进编辑态
// （createProtyle 真编辑器）dom 重载后消失。官方反链面板用 CSS Custom Highlight API
// 运行时叠加（app/src/protyle/render/searchMarkRender.ts：Range 集合 + CSS.highlights
// + ::highlight()，不动 DOM、编辑安全、卸载即消失），本模块复刻该协议（handoff 方案 A）。
//
// 与官方的两处刻意差异：
// - 官方注册名带 per-protyle uuid 且灌 protyle.highlight 内部对象（方案 B 弃：依赖内核
//   实例内部结构，升级风险高）；本模块统一注册名 bk-search-mark + 全量重建式——多卡并存
//   合并进一个 Highlight 实例，Range 天然锚定各自卡的 DOM，跨卡互不污染。
// - keywords 源头同官方 response.data.keywords（getBacklinkDoc/getBackmentionDoc 响应），
//   由 bkUtils.doGetBackLinks 透传到 BacklinkSv。提及卡无搜索词时 keywords 也非空
//   （mentionKeywords 来自文档名分词，kernel/model/backlink.go GetBackmentionDoc）。
//
// Chromium 105+ 才有 CSS Custom Highlight API（桌面端无忧），isSearchMarkSupported
// 守卫后零副作用降级。

export const BK_SEARCH_MARK_NAME = "bk-search-mark";

export function isSearchMarkSupported(): boolean {
    return typeof CSS !== "undefined" && !!(CSS as any).highlights
        && typeof (globalThis as any).Highlight === "function";
}

/** 官方 indexOf 语义：每个关键词在拼接文本里非重叠贪心匹配（命中后跳到词尾再找） */
export function findKeywordIndexes(text: string, keywords: string[]): [number, number][] {
    const out: [number, number][] = [];
    for (const key of keywords) {
        if (!key) continue;
        let start = text.indexOf(key);
        while (start !== -1) {
            out.push([start, start + key.length]);
            start = text.indexOf(key, start + key.length);
        }
    }
    return out;
}

/** 全局字符偏移 → [文本节点序号, 节点内偏移]。edge 边界归属对齐官方两处 while 的刻意
 *  不同：start 遇节点边界归下一节点首（cum<=off 则进位），end 归当前节点尾（cum<off
 *  才进位）——合并成一个条件会造出跨出节点尾的 Range。 */
export function locateTextOffset(
    cumSizes: number[],
    offset: number,
    edge: "start" | "end",
): [number, number] {
    let i = 0;
    if (edge === "start") {
        while (i < cumSizes.length && cumSizes[i] <= offset) i++;
    } else {
        while (i < cumSizes.length && cumSizes[i] < offset) i++;
    }
    return [i, offset - (i > 0 ? cumSizes[i - 1] : 0)];
}

/** TreeWalker 收集 root 下全部文本节点（官方同款遍历），为 keywords 生成 Range 集。
 *  root.textContent 与 TreeWalker 的拼接同为文档序，indexOf 偏移天然对位。 */
export function buildSearchRanges(root: Element, keywords: string[]): Range[] {
    const textNodes: Text[] = [];
    const cumSizes: number[] = [];
    let cum = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        textNodes.push(n as Text);
        cum += (n.textContent ?? "").length;
        cumSizes.push(cum);
    }
    if (!textNodes.length) return [];
    const text = root.textContent ?? "";
    const ranges: Range[] = [];
    for (const [s, e] of findKeywordIndexes(text, keywords)) {
        const [si, so] = locateTextOffset(cumSizes, s, "start");
        const [ei, eo] = locateTextOffset(cumSizes, e, "end");
        if (si >= textNodes.length || ei >= textNodes.length) continue;
        const range = document.createRange();
        range.setStart(textNodes[si], so);
        range.setEnd(textNodes[ei], eo);
        ranges.push(range);
    }
    return ranges;
}

export interface SearchMarkEntry {
    root: Element;
    keywords: string[];
}

/** 全量重建统一注册名：每张编辑态卡 attach/卸载都整表重算（替换不追加）。零命中即
 *  主动删注册名，不留空 Highlight 尸体。 */
export function setSearchMarks(entries: SearchMarkEntry[]): void {
    if (!isSearchMarkSupported()) return;
    const ranges = entries.flatMap(e =>
        e.keywords?.length ? buildSearchRanges(e.root, e.keywords) : []);
    if (!ranges.length) {
        clearSearchMarks();
        return;
    }
    const hl = new (globalThis as any).Highlight();
    for (const r of ranges) hl.add(r); // 逐个 add 防巨量 range 的构造器 spread 栈爆（官方同款写法）
    (CSS.highlights as Map<string, unknown>).set(BK_SEARCH_MARK_NAME, hl);
}

export function clearSearchMarks(): void {
    if (typeof CSS === "undefined" || !(CSS as any).highlights) return;
    (CSS.highlights as Map<string, unknown>).delete(BK_SEARCH_MARK_NAME);
}

// ---- owner 槽位（评审 P1-1）：多文档多页签=多面板并存，统一注册名下任一组件的
// 全量重建/清理都会互踩别家的高亮。owner 粒度注册表：每组件只写自己的槽位，写后
// 聚合所有槽位重建——面板 A 关闭只清 A 的槽位，B 的高亮原样保留。 ----

const ownerSlots = new Map<object, SearchMarkEntry[]>();

/** 本组件槽位写入（空 entries=删槽位，顺带清掉数据刷新/退出编辑残留的 detached
 *  Range）后聚合全部槽位重建统一注册名。owner 用组件级长寿命对象（如 bkState）。 */
export function setSearchMarksFor(owner: object, entries: SearchMarkEntry[]): void {
    if (entries.length) ownerSlots.set(owner, entries);
    else ownerSlots.delete(owner);
    setSearchMarks([...ownerSlots.values()].flat());
}

/** 组件销毁：只摘自己槽位再聚合（别的面板高亮不受牵连） */
export function clearSearchMarksFor(owner: object): void {
    ownerSlots.delete(owner);
    setSearchMarks([...ownerSlots.values()].flat());
}

/** 等内核把 blockId 内容载入 wysiwyg（首块出现）再回调——createProtyle 是异步加载，
 *  attach 时 wysiwyg 常为空壳，立即建 Range 会零命中。元素脱离文档（卡退出编辑/
 *  组件销毁摘 DOM）即停轮询；超时上限后尽力回调一次（空内容建 0 range 也无害）。 */
export function whenContentReady(
    protyle: { wysiwyg?: { element?: Element } },
    cb: () => void,
    intervalMs = 300,
    timeoutMs = 10000,
): void {
    const el = protyle?.wysiwyg?.element;
    if (!el) return;
    if (el.firstElementChild) {
        cb();
        return;
    }
    const t0 = Date.now();
    const tick = () => {
        if (!el.isConnected) return;
        if (el.firstElementChild || Date.now() - t0 >= timeoutMs) {
            cb();
            return;
        }
        setTimeout(tick, intervalMs);
    };
    setTimeout(tick, intervalMs);
}
