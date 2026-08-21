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
    return e?.id === "searchPreview"
}

export function isFloatUI(protyle: Protyle) {
    const e = protyle?.protyle?.element as HTMLElement;
    if (e.classList.contains("block__edit")) return true;
    return false;
}

export function isCardUI(protyle: Protyle) {
    const e = protyle?.protyle?.element as HTMLElement;
    return e?.classList?.contains("card__block");
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
