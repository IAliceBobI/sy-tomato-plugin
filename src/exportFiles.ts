import { confirm, IProtyle, Plugin } from "siyuan";
import { events } from "./libs/Events";
import { cleanDivOnly, cloneCleanDiv, downloadStringAsFile, getAttribute, getBlocksByTrees, getMarkdownsByTrees, removeAttribute, removeInvisibleChars, setAttribute, siyuan, } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { BlockNodeEnum, TOMATO_LINE_THROUGH } from "./libs/gconst";
import { findElement } from "./libs/listUtils";
import { OpenSyFile2 } from "./libs/docUtils";
import { DomSuperBlockBuilder } from "./libs/sydom";
import { verifyKeyTomato } from "./libs/user";


export function mergeDocMenuListener() {
    events.addListener_open_menu_doctree("2025-5-8 17:27:45合并文档", (detial) => {
        const ids = [...detial.elements]
            .map(e => getAttribute(e, "data-node-id"))
            .filter(i => !!i);
        if (ids.length > 0) {
            detial.menu.addItem({
                label: tomatoI18n.合并为单个文件 + " · " + tomatoI18n.移动,
                icon: "iconMove",
                click: async () => {
                    if (await verifyKeyTomato()) {
                        confirm(tomatoI18n.合并为单个文件, "⚠️" + tomatoI18n.此操作不可撤销, () => {
                            mergeDocs(ids)
                        })
                    } else {
                        siyuan.pushMsg(tomatoI18n.此功能需要激活VIP)
                    }
                }
            })
            detial.menu.addItem({
                label: tomatoI18n.合并为单个文件 + " · " + tomatoI18n.复制,
                icon: "iconCopy",
                click: async () => {
                    if (await verifyKeyTomato()) {
                        confirm(tomatoI18n.合并为单个文件, "⚠️" + tomatoI18n.此操作不可撤销, () => {
                            mergeDocs(ids, true)
                        })
                    } else {
                        siyuan.pushMsg(tomatoI18n.此功能需要激活VIP)
                    }
                }
            })
        }
    })
}

async function mergeDocs(ids: string[], isCopy = false) {
    const targetID = ids.at(0);
    if (!targetID) return
    const anchorID = await siyuan.getDocLastID(targetID);
    if (!anchorID) return
    const roots = await getBlocksByTrees(ids, targetID);
    if (isCopy) {
        const doms = roots.map(r => r.children.map(c => c.div)).flat().map(d => cloneCleanDiv(d).div.outerHTML)
        const ops = siyuan.transInsertBlocksAfter(doms, anchorID)
        await siyuan.transactions(ops);
    } else {
        const bs = roots.map(r => r.children.map(c => c.id)).flat()
        const ops = siyuan.transMoveBlocksAfter(bs, anchorID)
        await siyuan.transactions(ops);
        // for (const id of ids.slice(1)) {
        //     await siyuan.removeDocByIDSiyuan(id)
        // }
        // for (const { id } of roots) {
        //     if (await siyuan.checkBlockExist(id)) {
        //         await siyuan.removeDocByIDSiyuan(id)
        //     }
        // }
    }
}

export function initMenuListener() {
    events.addListener_open_menu_doctree("2025年2月18日21:03:56 导出菜单", (detial) => {
        const ids = [...detial.elements]
            .map(e => getAttribute(e, "data-node-id"))
            .filter(i => !!i);
        if (ids.length > 0) {
            detial.menu.addItem({
                label: tomatoI18n.导出所有文档到单个文件,
                icon: "iconUpload",
                click: () => { exportBigText(ids) }
            })
        }
    })
}

async function exportBigText(ids: string[]) {
    const rows = await getMarkdownsByTrees(ids);
    const bigText = rows
        .map(row => removeInvisibleChars(row.markdown, true))
        .filter(md => md.indexOf("\n") > 0)
        .join("\n\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n")
    downloadStringAsFile(bigText, "all.md");
}

export async function addComment2Sup(protyle: IProtyle, plugin: Plugin, comment = true) {
    const { selected, ids } = await events.selectedDivs(protyle);
    const su = new DomSuperBlockBuilder()

    if (comment) su.setAttr(TOMATO_LINE_THROUGH, "1")

    let lastID = "";
    selected.forEach(e => {
        const c = cleanDivOnly(e.cloneNode(true) as any);
        lastID = c.newID
        su.append(c.div);
    })
    const ops = siyuan.transInsertBlocksAfter([su.build().outerHTML], ids[ids.length - 1])
    ops.push(...siyuan.transDeleteBlocks(ids))
    await siyuan.transactions(ops)
    protyle.getInstance().reload(true);
    setTimeout(() => {
        if (lastID) {
            OpenSyFile2(plugin, lastID);
        }
    }, 200);
}

export function addFoldCmd(plugin: Plugin) {
    plugin.addCommand({
        langKey: "2025-2-22 17:26:341折叠",
        langText: "折叠fold",
        hotkey: "⌘↑",
        editorCallback: (protyle: IProtyle) => {
            changeBlockFold(protyle, plugin, true)
        },
    });
    plugin.addCommand({
        langKey: "2025-2-22 17:26:341展开",
        langText: "展开unfold",
        hotkey: "⌘↓",
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