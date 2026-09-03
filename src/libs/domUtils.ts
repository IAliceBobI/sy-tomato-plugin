// 纯 DOM/protyle/编辑器工具（不触网络 API）。从原 utils.ts 拆出（2026-08 重构），utils.ts 现为 re-export 桶。
import { Dialog, IProtyle, Protyle, getAllEditor } from "siyuan";
import * as gconst from "./gconst";
import { events } from "./Events";
import { DestroyManager } from "./destroyer";
import { cleanText } from "./strUtils";

export function closeTab(title: string) {
    return closeTabByTitle([{ title, id: "1" }], "2");
}

export function closeTabByTitle(tabs: AttrType[], excludeDocID: string) {
    let closed = false;
    if (tabs?.length > 0) {
        const openedTabs = [...document.querySelectorAll(`span.item__text`)];
        for (const tab of tabs) {
            if (tab.id === excludeDocID) continue;
            const f = openedTabs.find(o => o.textContent === tab.title);
            if (f) {
                (f.nextElementSibling as HTMLButtonElement)?.click();
                closed = true;
            }
        }
    }
    return closed;
}

export function getProtyleByDocID(docID: string) {
    return getAllEditor().filter(protyle => protyle.protyle.block.rootID === docID)
}

export function getOpenedEditors() {
    return getAllEditor().map(p => {
        return {
            ial: p?.protyle?.background?.ial as unknown as AttrType,
            protyle: p,
        }
    })
}

/**
 * 当前激活编辑器页签的 protyle。与思源官方 isCurrentEditor（app/src/editor/util.ts）
 * 同源：`.layout__wnd--active > .fn__flex > .layout-tab-bar > .item--focus` 拿激活
 * 页签 data-id，再从 getAllEditor 里匹配该页签的 protyle。
 * **按页签宿主（closest [data-id]）匹配**：块引浮窗/搜索预览等非页签 protyle 即使
 * rootID 相同也不命中——需要「排除浮窗劫持、只要真页签编辑器」的身份校验场景用本函数
 * （□8 P2-2 命令通道，只比 rootID 的旧写法会把浮窗预览同文档误当激活编辑器）。
 * 移动端无此 DOM 结构返回 null。
 */
export function getActiveProtyle(): IProtyle | null {
    if (events.isMobile) return null;
    const activeTab = document.querySelector(".layout__wnd--active > .fn__flex > .layout-tab-bar > .item--focus");
    const dataID = activeTab?.getAttribute("data-id");
    if (!dataID) return null;
    for (const p of getAllEditor()) {
        // 编辑器 protyle 所在 panel 与页签头共享 data-id；浮窗/搜索预览等非页签
        // protyle 的最近 [data-id] 祖先不等于激活页签 id，不会误命中
        const panel = p?.protyle?.element?.closest("[data-id]");
        if (panel?.getAttribute("data-id") === dataID) {
            return p?.protyle ?? null;
        }
    }
    return null;
}

/**
 * 当前激活编辑器页签里的文档 ID（getActiveProtyle 薄封装）。
 * 桌面端 events.docID 只在点击编辑器内容时更新（文档树点开文档不算），需要
 * 「眼前显示的文档」时用本函数；移动端无此 DOM 结构返回空串（events.docID
 * 随 loaded 事件更新，无此问题）。找不到（面板全关/结构变更）返回空串。
 */
export function getActiveDocID(): string {
    return getActiveProtyle()?.block?.rootID ?? "";
}

export function setAttribute(e: any, name: keyof AttrType, value: string) {
    if (e?.setAttribute) e.setAttribute(name, value);
}

export function getAttribute(e: any, name: keyof AttrType): string {
    if (e?.getAttribute) return e.getAttribute(name)
}

export function getChildElements(e: any): HTMLElement[] {
    if (e?.getAttribute && e.childNodes) {
        return [...e.childNodes]
            .filter((e: any) => e.getAttribute) as any
    }
    return []
}

export function removeAttribute(e: any, name: keyof AttrType) {
    if (e?.removeAttribute) return e.removeAttribute(name)
}

export function strIncludeAttr(str: string, name: keyof AttrType) {
    return str?.includes(name);
}

export function setFocusToEditableDiv(editableDiv: HTMLElement) {
    editableDiv.focus();
    const range = document.createRange();
    range.selectNodeContents(editableDiv);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

export function moveCursor2HeadProtyle(protyle: IProtyle, id: string) {
    const newDIV = protyle.element.querySelector(`div[data-node-id="${id}"]`)
    if (newDIV) {
        document.getSelection().collapse(newDIV, 0);
    }
}

export function moveCursor2TailInProtyle(protyle: IProtyle, id: string) {
    const newDIV = protyle.element.querySelector(`div[data-node-id="${id}"]`)
    if (newDIV) {
        if (getAttribute(newDIV.nextElementSibling, "data-node-id")) {
            document.getSelection().collapse(newDIV.nextElementSibling, 0)
        } else {
            document.getSelection().collapse(newDIV, 1);
        }
    }
}

export function moveCursor2TailByDiv(newDIV: HTMLElement) {
    if (newDIV) document.getSelection().collapse(newDIV, 1);
}

export function moveCursor2Tail4List(id: string) {
    const newDIV = document.querySelector(`div[${gconst.DATA_NODE_ID}="${id}"] > div[contenteditable="true"]`);
    if (newDIV) document.getSelection().collapse(newDIV, 0);
}

export function getCursorElement() {
    const selection = document.getSelection();
    return getSyElement(selection?.focusNode as any) as HTMLElement;
}

/** 原生 range 覆盖的顶层块（文档序）。
    思源 3.8（issue 8554）起内容区拖蓝跨块保留文本选区、不再自动转块选，
    用它与 Esc 转块选后的 querySelectorAll 语义对齐：只认 wysiwyg 直接子级的
    data-node-id 块（嵌套块归容器整块），range 不在 container 内返回空。 */
export function blocksUnderRange(container: HTMLElement, range: Range): HTMLElement[] {
    if (!range || range.collapsed || !container.contains(range.startContainer)) return [];
    return [...container.children].filter(
        b => b.hasAttribute(gconst.DATA_NODE_ID) && range.intersectsNode(b)
    ) as HTMLElement[];
}

/** 词级导线选区有效性（MindWire currentTextRange 提纯，二期 □1 工具条/快捷键通道复用）：
 *  非 collapsed + 有实文本 + 单块（setInlineMark 'a' 跨块静默失败）+ 非代码块。
 *  实文本剥零宽空格后判（内核同款语义 toolbar/index.ts:240——块重建后选区常落在
 *  ZWSP 上，不剥会被热键抓成空词起点）。工具条点击/快捷键触发时选区被顶掉，
 *  回退 protyle.toolbar.range 走同一判定。 */
export function normalizeWordRange(range: Range | null | undefined): Range | null {
    if (!range || range.collapsed) return null;
    // startContainer 已脱离文档 = 陈旧兜底 range（内核事务重建块 DOM 后 toolbar.range 残留
    // 旧引用，closest 在脱离子树上照样命中块 div 会误判有效——评审 P1-2；window 选区恒 connected 零误伤）
    if (!range.startContainer?.isConnected) return null;
    if (!range.toString().replace(/\u200b/g, "").trim()) return null;
    const asEl = (n: Node) => (n.nodeType === 3 ? n.parentElement : (n as HTMLElement));
    const startBlock = asEl(range.startContainer)?.closest?.("div[data-node-id]");
    const endBlock = asEl(range.endContainer)?.closest?.("div[data-node-id]");
    if (!startBlock || !endBlock || startBlock !== endBlock) return null;
    if (startBlock.getAttribute("data-type") === "NodeCodeBlock") return null;
    return range;
}

/** 批注选区有效性（□4 划词工具条通道）：非 collapsed + 未脱离文档 + 落在本编辑器内。
 *  与 normalizeWordRange 的差异：批注允许跨块选区（blockSubRanges 逐块拆），不吃它的
 *  单块/非代码块约束；分屏守卫同款——别把 A 屏选区写进 B 屏（MindWire wordWireRange
 *  评审 P1-1）。protyle 缺省（无编辑器上下文）时只做前两档判定 */
export function annoRangeUsable(range: Range | null | undefined, protyle?: IProtyle): boolean {
    if (!range || range.collapsed) return false;
    // startContainer 已脱离文档 = 陈旧兜底 range（内核事务重建块 DOM 后 toolbar.range 残留
    // 旧引用，normalizeWordRange P1-2 同款），写回全局 selection 会造出幽灵选区
    if (!range.startContainer?.isConnected) return false;
    const el = protyle?.wysiwyg?.element;
    if (el && !el.contains(range.startContainer)) return false;
    return true;
}

export function getID(e: HTMLElement | Element | Node, attrs?: string[]) {
    const s = getSyElement(e, attrs);
    if (s) {
        return s.getAttribute(gconst.DATA_NODE_ID);
    }
    return "";
}

export function getSyElement(e1: HTMLElement | Element | Node, attrs?: string[]) {
    const e = e1 as HTMLElement;
    if (!e) return;
    if (e.getAttribute) {
        const id = e.getAttribute(gconst.DATA_NODE_ID);
        if (id) {
            if (attrs) {
                for (const attr of attrs) if (e.hasAttribute(attr)) return e;
            } else {
                return e;
            }
        }
    }
    return getSyElement(e.parentElement, attrs);
}

export function getAllContentEditableElements(element: Element) {
    if (!element) return [];
    const result: Element[] = [];
    // 检查元素本身是否有 contenteditable 属性（不管是 true 还是 false，只读模式下是 false）
    const ce = element.getAttribute(gconst.CONTENT_EDITABLE);
    if (ce === "true" || ce === "false") {
        // 排除 protyle-attr 这类非内容元素
        if (!element.classList.contains("protyle-attr") && !element.classList.contains("protyle-wysiwyg")) {
            result.push(element);
        }
    }
    // 查找后代元素（包括 contenteditable="true" 和 "false"）
    const children = element.querySelectorAll(`[${gconst.CONTENT_EDITABLE}]`);
    for (const child of children) {
        // 排除 protyle-attr 这类非内容元素
        if (!child.classList.contains("protyle-attr")) {
            result.push(child);
        }
    }
    return result;
}

export function getAllText(element: Element[], join = "\n") {
    const txt = element
        .map(getAllContentEditableElements)
        .flat()
        .reduce((a, e) => {
            a.push(e.textContent ?? "");
            return a;
        }, [])
        .filter(i => !!i)
        .join(join);
    return cleanText(txt);
}

export function getAllContentEditableText(element: Element, join = "\n") {
    return getAllText([element], join);
}

export function getContenteditableElement(element: Element) {
    if (!element) return element;
    const ed = element.getAttribute(gconst.CONTENT_EDITABLE);
    if ((ed === "true" || ed === "false") && !element.classList.contains("protyle-wysiwyg")) return element;
    let e = element.querySelector(`[${gconst.CONTENT_EDITABLE}="true"]`);
    if (!e) e = element.querySelector(`[${gconst.CONTENT_EDITABLE}="false"]`);
    return e;
}

export function dom2div(dom: string) {
    const div = document.createElement("div") as HTMLElement;
    if (!dom) return div;
    div.innerHTML = dom;
    return div.firstElementChild as HTMLElement;
}

export function isSearchUI(protyle: Protyle) {
    const e = protyle?.protyle?.element as HTMLElement;
    // searchUnRefPreview=搜索「未引用块」预览，与 searchPreview 同场景（内核 search/util.ts:252/262）
    return e?.id === "searchPreview" || e?.id === "searchUnRefPreview"
}

/** 内核悬浮浮层（BlockPanel 容器 .block__popover，内核 Panel.ts:71）内的 protyle：
 * 悬停块引/反链计数弹出的预览浮层加载也 emit loaded-protyle-static，守卫链不认
 * 会把完整反链面板挂进浮层、盖住真面板（2026-09-02 □1 实锤）。浮层编辑器容器
 * 一律带 block__edit 类（Panel.ts:553，纯预览与可编辑浮窗无 DOM 二分），故只认
 * popover 容器祖先、不豁免 block__edit，一律无条件拦——「在悬浮窗内显示底部反链」
 * 设置项与 block__edit 判定 isFloatUI 恒等于 popover 内=死开关/死代码，已随
 * □7 a1（2026-09-02 用户拍板）整体退役。 */
export function isPopoverUI(protyle: Protyle) {
    const e = protyle?.protyle?.element as HTMLElement;
    return !!e?.closest(".block__popover");
}

export function isCardUI(protyle: Protyle) {
    const e = protyle?.protyle?.element as HTMLElement;
    return e?.classList?.contains("card__block");
}

/** 内核反链面板（sy__backlink 三型容器）/对话框（b3-dialog）内的编辑器：不发
 * loaded-protyle 事件、事件守卫链覆盖不到，onload resweep（getAllEditor 全量）
 * 会给它们误挂面板（□10 评审 P1）；tomato 自家面板容器在页签编辑器内容区、
 * 不在其内。 */
export function isBacklinkUI(protyle: Protyle) {
    const e = protyle?.protyle?.element as HTMLElement;
    return !!e?.closest(".sy__backlink, .b3-dialog");
}

/** 面板容器的代际标记属性（□10 评审 P2①），常量单源 gconst.BKGEN_ADD。 */

/** BKMaker.installed 的代际增强版：容器无代际标记（极老版本插件挂的残留）或
 * 代数**低于**当前模块实例（旧实例 in-flight handler 在新实例 removeAll() 之后
 * 落地挂载的孤儿，窗口≈一次 API 往返）→ 就地摘除并返回 false；旧实例轮询
 * interval 依 running()（getElementById）判活、摘除后自清。容器代**更高**＝更新
 * 实例已挂载（反向交错：旧 handler 恢复晚于新面板落地）→ 返回 true 让旧 handler
 * 自然跳过——双向字符串不等会把新面板摘掉、挂出旧闭包僵尸（评审 P1-2）；页内
 * 计数器单调递增、页 reload 归零必伴随 DOM 同灭，不存在「容器代更高却应被
 * 当前实例替换」的合法场景。 */
export function installedBkWithGen(bkDivID: string, gen: string): boolean {
    const el = document.querySelector(`div[${gconst.BKMAKER_ADD}="${bkDivID}"]`);
    if (el == null) return false;
    const cur = el.getAttribute(gconst.BKGEN_ADD);
    if (cur == null || Number(cur) < Number(gen)) {
        el.remove();
        return false;
    }
    return true;
}

/** 全量摘除底部反链的 DOM 残留（面板容器 BKMAKER_ADD / 入口条 BKENTRY_ADD）。
 * 插件 reload 把旧实例 Svelte 树打孤儿后，BKMaker.installed() 见残留容器跳过重挂
 * → 该文档面板永久僵尸、仅切页签自愈（□10 缺陷 A）。onload 时调用本函数清场；
 * 旧实例轮询 interval 依 running()（getElementById）判活，残留摘除后下个 tick 自清。
 * 属性名常量单源 gconst.ts（□10 评审 P2）。 */
export function removeBkDomResidue() {
    [...document.querySelectorAll(`[${gconst.BKMAKER_ADD}],div[${gconst.BKENTRY_ADD}]`)]
        .forEach(d => d.parentElement?.removeChild(d));
}

export function isCardByUpLook(e: HTMLElement) {
    if (!e) return false;
    if (e.classList?.contains("card__block") === true) {
        return true
    }
    return isCardByUpLook(e?.parentElement);
}

/**
 * 判断一个 DOM 元素当前是否对用户可见。
 *
 * 实测结论（2026-07，思源 3.7.1）：后台页签的 protyle 容器被设为
 * `display:none`（而非从 DOM 卸载），因此 `offsetParent === null` 且
 * `getBoundingClientRect().width === 0`。三者任一即可判定，组合最稳妥。
 */
export function isVisible(el: Element | null | undefined): boolean {
    if (!el || !el.isConnected) return false;
    // offsetParent === null 表示 display:none（或祖先为 fixed/sticky，下方排除）
    if ((el as HTMLElement).offsetParent === null) {
        const cs = getComputedStyle(el);
        // protyle 容器通常是普通定位，fixed/sticky 的极少，单独排除避免误判
        if (cs.position !== "fixed" && cs.position !== "sticky") return false;
    }
    // 兜底：宽高为 0 也算不可见
    const rect = (el as HTMLElement).getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

/**
 * 判断一个 protyle 编辑器当前是否对用户可见。
 * 手机端单页签始终可见；桌面端依赖 protyle.element 的可见性。
 */
export function isProtyleVisible(protyle: IProtyle | any): boolean {
    if (events.isMobile) return true;
    return isVisible(protyle?.element);
}

export function getDocLastElement(protyle: IProtyle) {
    return protyle?.wysiwyg?.element?.lastElementChild;
}

export function isEditor(protyle: IProtyle) {
    return !!getAttribute(protyle.element, "data-id") || events.isMobile
}

export function getDialogContainer(dialog: Dialog) {
    return dialog?.element?.querySelector("div.b3-dialog > div.b3-dialog__container")
}

export function getProtylesByID(id: string) {
    return getAllEditor()
        ?.filter(protyle => {
            const e = protyle?.protyle?.element?.querySelector(`div[data-node-id="${id}"]`)
            return e != null
        }) ?? []
}

export function icon(name: string, size = 20) {
    if (name.startsWith("icon")) name = name.slice(4)
    if (size) {
        return `<svg width="${size}px" height="${size}px"><use xlink:href="#icon${name}"></use></svg>`;
    }
    return `<svg><use xlink:href="#icon${name}"></use></svg>`;
}

export function saveRestorePagePosition(scrollPositionKey: string, dm: DestroyManager, dialog: HTMLElement, focus = false) {
    if (!dialog || !dm) return;
    function handleScroll() {
        localStorage.setItem(scrollPositionKey, dialog.scrollTop.toString());
    };
    dialog.addEventListener("scroll", handleScroll);
    dm.add(scrollPositionKey, () =>
        dialog.removeEventListener("scroll", handleScroll),
    );
    const savedScroll = localStorage.getItem(scrollPositionKey);
    if (savedScroll) {
        dialog.scrollTop = parseInt(savedScroll, 10);
    }
    if (focus) {
        dialog.focus();
    }
}

/**
 * 同步组成员的页面活副本（□6 数据丢失链修复，2026-08-21）：按 super 块 ID 在本页 DOM 找
 * 带同步标记的可编辑副本，找不到返回 null（调用方回落内核 getBlockDiv）。
 * 共享子块 ID 模式（remap 关）下 blocktree 随传播翻转，编辑侧内核副本会停在旧内容——
 * 深检 classifyByDOM / 裁决 syncFromBlock 以内核 DOM 为源会被滞后快照骗（实测 2026-08-21：
 * 深检以停在旧内容的源为据 pending 编辑形自动传播，把新内容从全组回滚掉）。
 * embed 里的渲染副本不算（只读影子，内核 IAL 才是真身），super 块 ID 每副本唯一无需光标优先。
 */
export function liveSyncDiv(id: string): HTMLElement | null {
    const divs = document.querySelectorAll<HTMLElement>(`div[data-node-id="${id}"]`);
    for (const d of divs) {
        if (!d.getAttribute("custom-sync-block-id")) continue;
        if (d.closest('[data-type="NodeBlockQueryEmbed"]')) continue;
        return d;
    }
    return null;
}

/**
 * 兼容移动端的剪贴板写入：先走 Clipboard API，失败或不存在（思源移动端 webview）
 * 回落 execCommand。返回是否复制成功，调用方据此决定提示语。
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (e) {
        console.log("Clipboard API failed, falling back to execCommand");
    }
    try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (success) return true;
    } catch (e) {
        console.error("execCommand copy failed:", e);
    }
    return false;
}
