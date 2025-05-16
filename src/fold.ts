import { IProtyle, Plugin } from "siyuan";
import { getAttribute, removeAttribute, setAttribute, siyuan, } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { OpenSyFile2 } from "./libs/docUtils";
import { events } from "./libs/Events";
import { BlockNodeEnum } from "./libs/gconst";
import { findElement } from "./libs/listUtils";
import { winHotkey } from "./libs/winHotkey";

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
async function changeBlockFold(protyle: IProtyle, plugin: Plugin, fold: boolean) {
    const { selected, ids } = await events.selectedDivs(protyle)
    const targetElement = selected?.at(0);
    if (!targetElement) return;

    const { found } = findElement(targetElement, false, (e) => {
        const t = getAttribute(e, "data-type");
        if (t === BlockNodeEnum.NODE_BLOCKQUOTE
            || t === BlockNodeEnum.NODE_SUPER_BLOCK
            || t === BlockNodeEnum.NODE_LIST
        ) return true
    });
    if (found) {
        doFoldByElement(found, protyle, fold);
        return;
    }

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
}

function findPreviousElementSibling(e: HTMLElement, f: (a: HTMLElement) => boolean) {
    while (e != null) {
        if (f(e)) {
            return e;
        }
        e = e.previousElementSibling as any;
    }
}