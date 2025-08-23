import { IProtyle, Plugin } from "siyuan";
import { getAttribute, removeAttribute, setAttribute, setFocusToEditableDiv, siyuan, } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { OpenSyFile2 } from "./libs/docUtils";
import { events } from "./libs/Events";
import { BlockNodeEnum, COMMENT_SUPERBLOCK_FOLD, TOMATO_ATTR_BAR } from "./libs/gconst";
import { findElement } from "./libs/listUtils";
import { winHotkey } from "./libs/winHotkey";
import AttrBar from "./AttrBar.svelte";
import { commentBoxCheckbox, foldTypes } from "./libs/stores";
import { setGlobal } from "stonev5-utils";
import { mount } from "svelte";

export const addFoldCmd折叠 = winHotkey("alt+↑", "2025-5-11 16:00:08折叠", "", () => tomatoI18n.折叠)
export const addFoldCmd展开 = winHotkey("alt+↓", "2025-5-11 16:00:04展开", "", () => tomatoI18n.展开)

export function addFoldCmd(plugin: Plugin) {
    plugin.addCommand({
        langKey: addFoldCmd折叠.langKey,
        langText: addFoldCmd折叠.langText(),
        hotkey: addFoldCmd折叠.m,
        editorCallback: (protyle: IProtyle) => {
            changeBlockFold(protyle, plugin, true)
        },
    });
    plugin.addCommand({
        langKey: addFoldCmd展开.langKey,
        langText: addFoldCmd展开.langText(),
        hotkey: addFoldCmd展开.m,
        editorCallback: (protyle: IProtyle) => {
            changeBlockFold(protyle, plugin, false)
        },
    });
}

function handleQuoteSuper(targetElement: HTMLElement, protyle: IProtyle, fold: boolean) {
    const { found } = findElement(targetElement, false, (e) => {
        const t = getAttribute(e, "data-type");
        if (t === BlockNodeEnum.NODE_BLOCKQUOTE || t === BlockNodeEnum.NODE_SUPER_BLOCK)
            return true
    });
    if (found) {
        doFoldByElement(found, protyle, fold);
        return true;
    }
}

function handleList(targetElement: HTMLElement, protyle: IProtyle, fold: boolean) {
    const doFind = (el: HTMLElement) => {
        return findElement(el, false, (e) => {
            const t = getAttribute(e, "data-type");
            if (t === BlockNodeEnum.NODE_LIST_ITEM) return true
        });
    }
    const { found } = doFind(targetElement);
    if (found) {
        if (found.querySelector(`div[data-type="NodeList"]`) || fold == false) {//has sub list
            doFoldByElement(found, protyle, fold);
            return true;
        } else {
            const { found: found_parent } = doFind(found.parentElement);
            if (found_parent) {
                doFoldByElement(found_parent, protyle, fold);
                return true;
            }
        }
    }
}

async function changeBlockFold(protyle: IProtyle, plugin: Plugin, fold: boolean) {
    const { selected, ids } = await events.selectedDivs(protyle)
    const targetElement = selected?.at(0);
    if (!targetElement) return;
    if (handleQuoteSuper(targetElement, protyle, fold)) return;
    if (handleList(targetElement, protyle, fold)) return;

    const id = getAttribute(targetElement, "data-node-id")
    const t = getAttribute(targetElement, "data-type")
    if (t === BlockNodeEnum.NODE_HEADING) {
        await foldAndReload(id, fold, protyle)
    } else if (t === BlockNodeEnum.NODE_PARAGRAPH) {
        const e = findPreviousElementSibling(targetElement, (e) => {
            return getAttribute(e, "data-type") === BlockNodeEnum.NODE_HEADING
        });
        const targetID = getAttribute(e, "data-node-id")
        if (targetID) {
            await foldAndReload(targetID, fold, protyle)
        } else {
            const parent = await siyuan.getParentRowByID(id);
            if (parent?.type === 'h') {
                await foldAndReload(parent.id, fold, protyle)
            } else {
                await foldAll(fold, plugin, protyle, ids)
            }
        }
    }
}

async function foldAndReload(targetID: string, fold: boolean, protyle: IProtyle) {
    if (targetID) {
        if (fold) {
            await siyuan.setBlockAttrs(targetID, { "fold": "1" })
        } else {
            await siyuan.setBlockAttrs(targetID, { "fold": "" })
        }
        protyle.getInstance().reload(true);
    }
}

async function foldAll(fold: boolean, plugin: Plugin, protyle: IProtyle, ids: string[]) {
    const params = [
        ...protyle.element.querySelectorAll(`div[data-type="${BlockNodeEnum.NODE_SUPER_BLOCK}"]`),
        ...protyle.element.querySelectorAll(`div[data-type="${BlockNodeEnum.NODE_BLOCKQUOTE}"]`),
    ]
        .map(e => getAttribute(e, "data-node-id"))
        .map(id => {
            return { id, attrs: { "fold": fold ? "1" : "" } }
        });
    await siyuan.batchSetBlockAttrs(params);
    setTimeout(() => {
        OpenSyFile2(plugin, ids.at(0))
    }, 200);
    return params.length > 0;
}

function doFoldByElement(e: HTMLElement, protyle: IProtyle, fold: boolean) {
    const id = getAttribute(e, "data-node-id")
    const old = e.outerHTML
    const hasFold = e.hasAttribute("fold");
    if (fold) {
        if (!hasFold) {
            setAttribute(e, "fold", "1")
            protyle.getInstance().updateTransaction(id, e.outerHTML, old)
        }
    } else {
        if (hasFold) {
            removeAttribute(e, "fold")
            protyle.getInstance().updateTransaction(id, e.outerHTML, old)
        }
    }
    setFocusToEditableDiv(e)
}

function findPreviousElementSibling(e: HTMLElement, f: (a: HTMLElement) => boolean) {
    while (e != null) {
        if (f(e)) {
            return e;
        }
        e = e.previousElementSibling as any;
    }
}

export function addFoldingAttrBarBtns() {
    if (commentBoxCheckbox.get() || foldTypes.get().length > 0) {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "attributes" && mutation.attributeName === "fold") {
                    addBar(mutation.target as any);
                }
                mutation.addedNodes.forEach(e => addBar(e as any))
            }
        });
        setGlobal("addAttrBarBtns 2025-6-7 13:44:59", observer)?.disconnect();
        observer.observe(document.body, { attributes: true, childList: true, subtree: true });
        // events.addListener("addAttrBarBtns 2025-6-7 20:02:36", (eventType, detail: Protyle) => {
        //     if (eventType == EventType.loaded_protyle_static || eventType == EventType.loaded_protyle_dynamic || eventType == EventType.click_editorcontent || eventType == EventType.switch_protyle) {
        //         navigator.locks.request("lock 2025-6-7 20:02:46", { ifAvailable: true }, (lock) => {
        //             if (lock) {
        //                 const protyle: IProtyle = detail.protyle;
        //                 if (!protyle) return;
        //                 addBar(plugin, protyle.element)
        //             }
        //         });
        //     }
        // });
    }
}

function addBar(element: HTMLElement) {
    if (!element.getAttribute) return;
    element.querySelectorAll(`div[${COMMENT_SUPERBLOCK_FOLD}]`).forEach(e => {
        findTarget2addBar(e as any);
    })
    findTarget2addBar(element);
    if (
        foldTypes.get().includes(BlockNodeEnum.NODE_LIST_ITEM) &&
        getAttribute(element, "data-type") == BlockNodeEnum.NODE_LIST
    ) {
        for (const item of element.querySelectorAll(`div[data-type="NodeList"][data-node-id]`)) {
            findTarget2addBar(item as any);
        }
    }
};

function findTarget2addBar(e: HTMLElement) {
    if (!e.lastElementChild) return;
    if (foldTypes.get().includes(getAttribute(e, "data-type")) || e.hasAttribute(COMMENT_SUPERBLOCK_FOLD)) {
        if (e.lastElementChild.classList.contains("protyle-attr")) {
            e.lastElementChild.querySelectorAll(`div[${TOMATO_ATTR_BAR}]`).forEach(e => e.parentElement.removeChild(e));
            mount(AttrBar, {
                target: e.lastElementChild,
                props: {
                    element: e,
                    attrElement: e.lastElementChild as any,
                }
            })
        }
    }
}