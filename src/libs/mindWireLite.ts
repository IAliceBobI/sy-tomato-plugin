// 内层小编辑器里的写入归属（2026-11-26～27 mw-small 实测，内核 3.8.12）。内核有五处用
// mountProtyleLiteFragment 建内层小编辑器（protyle.lite）：表格单元格、数据库富文本格、列表脑图节点、
// 文档标题、智能体输入框。内核给每个编辑器根写 data-protyle-lite="true"/"false"（protyle/index.ts 构造器），
// 从节点往上第一个带它的元素就是节点所在的编辑器。
// 表格单元格：鼠标一进单元格，内核就把这一格换成内层小编辑器（tableCellRichEditor.ts），里面的块 id
// 是临时的——内层编辑器的事务不发给内核，由内核在收尾时整表提交。右键菜单事件 open-menu-content 的
// detail.protyle 递来的是这个内层编辑器，events.protyle 记的仍是外层的；拿外层往里写（setInlineMark）
// 等于把临时块 id 当真块发给内核，内核报「load tree [...] failed: block not found」弹「状态异常」
// （内容倒是被内核的单元格提交捎带落盘了）。
// 用法：open-menu-content 里 rememberLiteProtyle(detail.protyle)，写/摘标记前 markTarget(节点, 外层编辑器)
// 取该用哪个编辑器、写不了的话卡在哪。只有表格单元格这一种登记后走内层写（实测过，标记会回到正文层的
// 表格里，线画得出来）；文档标题、数据库富文本格、列表脑图节点不在正文层里或按纯文本画，线画不出来——
// 一律不登记、不写，右键过也不写（原先只认表格，这几种右键菜单照样出「关联起点」，点了照样弹框，
// 2026-11-27 复审实测）。
//
// 没经右键的入口拿不到单元格的内层编辑器（2026-11-27 mw-small 实测，内核 3.8.12）：内核只在上面的右键
// 菜单事件里把它递给插件——内层编辑器是 pluginExtensions:false 建的，loaded/click/destroy/paste
// 这些事件一概不发；对象只存在内核模块私有的 WeakMap 里（tableCellRichContext.ts），没挂在任何
// 元素或 window.siyuan 上。命令面板里执行「词级导线」，递给命令的是外层编辑器，选区却可以落在
// 内层里：没右键过，下面的登记反查就落空。这时不能退回外层写（内核照旧弹「状态异常」）：
// markTarget 只看 DOM 判「在哪种内层编辑器里」，这种情况下不给编辑器，调用方不写、按 block 提示。
// 附：在单元格里真按快捷键，内核不会调到插件的命令（编辑态的插件快捷键由各自的正文层派发，
// protyle/wysiwyg/commonHotkey.ts；内层编辑器这一路关着，它转发到外层的按键又不经过外层正文层）
// ——复现别指望真按键，走命令面板或直接调命令回调。
import type { IProtyle } from "siyuan";

const cellLiteByHost = new WeakMap<Element, IProtyle>();

const CELL_SELECTOR = '[data-type="NodeTable"] td, [data-type="NodeTable"] th';

const asElement = (node: Node | null | undefined): Element | null =>
    node?.nodeType === 3 ? node.parentElement : node as Element | null;

/** 节点往上第一个带 data-protyle-lite 的编辑器根：是内层编辑器 → 返回它；先碰到的是外层（"false"）、
 *  或者哪里都不带 → null */
function liteHostOf(node: Node | null | undefined): Element | null {
    for (let el = asElement(node); el; el = el.parentElement) {
        const lite = el.getAttribute?.("data-protyle-lite");
        if (lite != null) return lite === "true" ? el : null;
    }
    return null;
}

/** 登记内核递来的内层编辑器（按根元素）：只有挂在表格单元格里的才登记——别处的内层编辑器
 *  不支持连线/快捷上色；右键没在编辑的格时内核递来的是外层编辑器（根元素包着整篇），也不算 */
export function rememberLiteProtyle(protyle: IProtyle | null | undefined): void {
    if (!protyle?.element?.closest?.(CELL_SELECTOR)) return;
    cellLiteByHost.set(protyle.element, protyle);
}

/** 节点落在哪个已登记的单元格编辑器里 → 那个内层编辑器；不在（含编辑器已关、根元素
 *  脱离文档）→ null */
export function liteProtyleOf(node: Node | null | undefined): IProtyle | null {
    for (let el = asElement(node); el; el = el.parentElement) {
        const lite = cellLiteByHost.get(el);
        if (lite?.element.isConnected) return lite;
    }
    return null;
}

/** 节点是否落在打开着的表格单元格内层编辑器里——只看 DOM，不依赖登记 */
export function inCellLiteEditor(node: Node | null | undefined): boolean {
    return !!liteHostOf(node)?.closest(CELL_SELECTOR);
}

/** 写不了的话卡在哪：cell=落在表格单元格的内层编辑器里、这一格没右键过（右键过就能写）；
 *  other=落在别的内层编辑器里（文档标题、数据库富文本格、列表脑图节点——不支持，右键过也不写） */
export type LiteBlock = "cell" | "other";

/** 写/摘词级标记该用哪个编辑器（MindWire setWordMark/removeWordMark、QuickColor paint 共用）：
 *  落在已登记的单元格内层里 → 内层；调用方递来的编辑器本身就是节点所在的单元格内层 → 直接用它；
 *  不在内层编辑器里 → 调用方递来的外层编辑器；
 *  落在单元格内层里但没登记（没经右键的入口）→ 不给（writer=null，block="cell"）——这次不能写，
 *  拿外层写内核会弹「状态异常」；落在别的内层编辑器里 → 同样不给（block="other"），调用方按 block 提示 */
export function markTarget(node: Node | null | undefined, protyle: IProtyle | null | undefined): { writer: IProtyle | null; block: LiteBlock | null } {
    const lite = liteProtyleOf(node);
    if (lite) return { writer: lite, block: null };
    const host = liteHostOf(node);
    if (!host) return { writer: protyle ?? null, block: null };
    const inCell = !!host.closest(CELL_SELECTOR);
    if (inCell && protyle?.lite && protyle.element === host) return { writer: protyle, block: null };
    return { writer: null, block: inCell ? "cell" : "other" };
}

/** 只要「该用哪个编辑器」：写不了时为 null（要分提示文案的调用方用 markTarget） */
export function wordMarkWriter(node: Node | null | undefined, protyle: IProtyle | null | undefined): IProtyle | null {
    return markTarget(node, protyle).writer;
}
