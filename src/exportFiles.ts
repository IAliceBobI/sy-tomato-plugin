import { addIfVisible } from "./libs/menuManager";
import { confirm, IProtyle, Plugin, Protyle } from "siyuan";
import { events, EventType } from "./libs/Events";
import { cleanDivOnly, cloneCleanDiv, downloadStringAsFile, getAttribute, getBlocksByTrees, getMarkdownsByTrees, getTomatoPluginInstance, isEditor, removeInvisibleChars, siyuan, } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { TOMATO_LINE_THROUGH } from "./libs/gconst";
import { OpenSyFile2 } from "./libs/docUtils";
import { DomSuperBlockBuilder } from "./libs/sydom";
import { isMe, verifyKeyTomato } from "./libs/user";
import { addSelectionBtnsDesktop, addSelectionBtnsMobile, noteBoxCheckbox } from "./libs/stores";
import { addCustomButton, addSelectionMLButtons, disposeSelectionML, getSelectionML } from "./libs/selectionML";
import { debugLog } from "./libs/logUtils";
import { noteBox } from "./NoteBox";
import { mount, unmount } from "svelte";
import NavigatorBoxSvelte from "./NavigatorBox.svelte";
import BlockEditorSvelte from "./BlockEditor.svelte";
import { DialogText } from "./libs/DialogText";
import { osFs } from "stonev5-utils";


export function mergeDocMenuListener() {
    events.addListener_open_menu_doctree("2025-5-8 17:27:45合并文档", (detial) => {
        const ids = [...detial.elements]
            .map(e => getAttribute(e, "data-node-id"))
            .filter(i => !!i);
        if (ids.length > 0) {
            addIfVisible(detial.menu, "m.exportFiles.mergeMove", {
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
            addIfVisible(detial.menu, "m.exportFiles.mergeCopy", {
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

export function exportAsOneFile() {
    events.addListener_open_menu_doctree("2025年2月18日21:03:56 导出菜单", (detial) => {
        const ids = [...detial.elements]
            .map(e => getAttribute(e, "data-node-id"))
            .filter(i => !!i);
        if (ids.length > 0) {
            addIfVisible(detial.menu, "m.exportFiles.exportAll", {
                label: tomatoI18n.导出所有文档到单个文件,
                icon: "iconUpload",
                click: () => { exportBigText(ids) }
            })
        }
    })
}

export function importMD() {
    events.addListener_open_menu_doctree("2025年10月14日13:15:00导入MD", (detial) => {
        const ids = [...detial.elements]
            .map(e => getAttribute(e, "data-node-id"))
            .filter(i => !!i);
        if (ids.length > 0) {
            addIfVisible(detial.menu, "m.exportFiles.importMD", {
                label: tomatoI18n.导入markdownOrText,
                icon: "iconDownload",
                click: () => {
                    new DialogText(tomatoI18n.请填写文件的路径, "", (mdPath) => {
                        doImportMD(ids.at(0), mdPath)
                    }, false, tomatoI18n.utf8Encoding)
                }
            })
        }
    })
}

async function doImportMD(docID: string, mdPath: string) {
    const row = await siyuan.getRowByID(docID)
    const fs = osFs()
    if (fs.readFile && row?.id) {
        let file = await fs.readFile(mdPath, { encoding: "utf-8" })
        file = file.trim();
        const title = file.slice(0, 15).replaceAll("\n", "");
        file = file.replaceAll("\n", "\n\n")
        row.hpath = row.hpath.split("/").slice(0, -1).extend(title).join("/")
        const id = await siyuan.createDocWithMd(row.box, row.hpath, file);
        await OpenSyFile2(getTomatoPluginInstance(), id);
    }
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

export function addSelectionButton() {
    if (events.isMobile) {
        if (addSelectionBtnsMobile.get()) {
            _addSelectionButton()
        }
    } else {
        if (addSelectionBtnsDesktop.get()) {
            _addSelectionButton()
        }
    }
}
function _addSelectionButton() {
    events.addListener("selection btns 2025-5-19 21:37:49", (eventType, detail: Protyle) => {
        const protyle: IProtyle = detail?.protyle;
        if (!protyle) return;
        if (eventType == EventType.destroy_protyle) {
            // □9 修①：destroy 出册清实例+残留选中类
            const wysiwyg = protyle.wysiwyg?.element;
            if (wysiwyg) disposeSelectionML(wysiwyg);
            return;
        }
        if (eventType == EventType.loaded_protyle_static || eventType == EventType.loaded_protyle_dynamic || eventType == EventType.click_editorcontent || eventType == EventType.switch_protyle) {
            navigator.locks.request("lock 2025-5-19 21:38:34", { mode: "exclusive" }, async (lock) => {
                if (lock) {
                    if (isEditor(protyle)) {
                        // review P2-3：destroy 已出册后 300ms debounce 尾巴可能在
                        // detached protyle 上复活实例+挂按钮，connected 才继续
                        if (!protyle.element?.isConnected) return;
                        // □9 修①：reuse-or-create——同 wysiwyg 跨事件不重建（trace 跨页签
                        // 往返续命），命中时仅 reanchor 刷新锚点
                        const wysiwyg = protyle.wysiwyg?.element as HTMLElement;
                        if (!wysiwyg) return;
                        const s = getSelectionML(wysiwyg, () => events.selectedDivsSync(protyle).selected);
                        debugLog("selectionml", `evt=${eventType} root=${protyle.block?.rootID ?? ""} trace=${s.state.trace.length}`, "selectionml");
                        addSelectionMLButtons(protyle, wysiwyg, {
                            prev: tomatoI18n.向上选择,
                            next: tomatoI18n.向下选择,
                            cancel: tomatoI18n.取消最后一次选择的内容,
                        });
                        if (noteBoxCheckbox.get() && events.isMobile) {
                            noteBoxShow(protyle)
                        }
                    }
                }
            });
        }
    });
}

function noteBoxShow(protyle: IProtyle) {
    addCustomButton(protyle, 'tomato-note-box', tomatoI18n.拍照闪念, "Camera", () => {
        noteBox.showInDialog()
    });
}

export function initDocNavigator() {
    if (isMe()) {
        let navigatorBoxSvelte = mount(NavigatorBoxSvelte, { target: document.body })
        let blockEditorSvelte = mount(BlockEditorSvelte, { target: document.body, props: { dm: null } })
        return () => {
            if (navigatorBoxSvelte) {
                unmount(navigatorBoxSvelte)
                unmount(blockEditorSvelte)
                navigatorBoxSvelte = null
            }
        }
    }
    return () => { }
}

