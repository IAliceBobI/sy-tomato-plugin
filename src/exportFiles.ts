import { confirm, IProtyle, Plugin, Protyle } from "siyuan";
import { events, EventType } from "./libs/Events";
import { cleanDivOnly, cloneCleanDiv, downloadStringAsFile, getAttribute, getBlocksByTrees, getMarkdownsByTrees, isEditor, removeInvisibleChars, siyuan, } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { TOMATO_LINE_THROUGH } from "./libs/gconst";
import { OpenSyFile2 } from "./libs/docUtils";
import { DomSuperBlockBuilder } from "./libs/sydom";
import { isMe, verifyKeyTomato } from "./libs/user";
import { addSelectionBtnsDesktop, addSelectionBtnsMobile, noteBoxCheckbox } from "./libs/stores";
import { SelectionML } from "./libs/SelectionML";
import { noteBox } from "./NoteBox";
import { mount, unmount } from "svelte";
import NavigatorBoxSvelte from "./NavigatorBox.svelte";
import BlockEditorSvelte from "./BlockEditor.svelte";


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

export function exportAsOneFile() {
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
type Params = { s: SelectionML };
function _addSelectionButton() {
    const params = {} as Params;
    events.addListener("selection btns 2025-5-19 21:37:49", (eventType, detail: Protyle) => {
        if (eventType == EventType.loaded_protyle_static || eventType == EventType.loaded_protyle_dynamic || eventType == EventType.click_editorcontent || eventType == EventType.switch_protyle) {
            navigator.locks.request("lock 2025-5-19 21:38:34", { mode: "exclusive" }, async (lock) => {
                if (lock) {
                    const protyle: IProtyle = detail.protyle;
                    if (!protyle) return;
                    if (isEditor(protyle)) {
                        params.s = new SelectionML(events.selectedDivsSync(protyle));
                        addSelectPrevButton(protyle, params)
                        addSelectNextButton(protyle, params)
                        addCancelButton(protyle, params)
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

function addSelectPrevButton(protyle: IProtyle, s: Params) {
    addCustomButton(protyle, 'tomato-prev', tomatoI18n.向上选择, "Up", () => {
        s.s?.selectUp()
    });
}

function addSelectNextButton(protyle: IProtyle, s: Params) {
    addCustomButton(protyle, 'tomato-next', tomatoI18n.向下选择, "Down", () => {
        s.s?.selectDown()
    });
}

function addCancelButton(protyle: IProtyle, s: Params) {
    addCustomButton(protyle, 'tomato-cancel', tomatoI18n.取消最后一次选择的内容, "Redo", () => {
        s.s?.cancelLast();
    });
}

export function addCustomButton(protyle: IProtyle, dataType: string, ariaLabel: string, icon: string, clickHandler: () => void) {
    const lockBtn = protyle.element.querySelector(`button[data-type="readonly"]`) as HTMLButtonElement;
    if (!lockBtn) return;
    const btn = protyle.element.querySelector(`button[data-type="${dataType}"]`);
    if (btn) return;
    const customBtn = document.createElement('button');
    customBtn.setAttribute('data-type', dataType);
    customBtn.setAttribute('aria-label', ariaLabel);
    customBtn.classList.add('block__icon', 'fn__flex-center', 'ariaLabel');
    customBtn.innerHTML = `<svg><use xlink:href="#icon${icon}"></use></svg>`;
    customBtn.addEventListener('click', clickHandler);
    lockBtn.parentNode?.insertBefore(customBtn, lockBtn);
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

