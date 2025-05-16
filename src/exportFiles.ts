import { confirm, IProtyle, Plugin } from "siyuan";
import { events } from "./libs/Events";
import { cleanDivOnly, cloneCleanDiv, downloadStringAsFile, getAttribute, getBlocksByTrees, getMarkdownsByTrees, removeInvisibleChars, siyuan, } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { TOMATO_LINE_THROUGH } from "./libs/gconst";
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

