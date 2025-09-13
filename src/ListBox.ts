import { IProtyle } from "siyuan";
import { getContenteditableElement as getContentEditableElement, moveCursor2Tail4List, siyuan, } from "./libs/utils";
import { EventType, events } from "./libs/Events";
import { BlockNodeEnum, DATA_TYPE, WEB_ZERO_SPACE } from "./libs/gconst";
import { delAllchecked, getDocListMd, uncheckAll } from "./libs/listUtils";
import { dont_break_list, listBoxCheckbox } from "./libs/stores";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { tomatoI18n } from "./tomatoI18n";
import { winHotkey } from "./libs/winHotkey";

export const ListBox取消勾选当前文档所有已完成的todo任务 = winHotkey("alt+shift+ctrl+G", "uncheckall 2025-5-12 08:00:51", "", () => tomatoI18n.取消勾选当前文档所有已完成的todo任务)
export const ListBox删除当前文档所有已完成的todo任务 = winHotkey("alt+shift+ctrl+H", "delAllchecked 2025-5-12 08:00:52", "", () => tomatoI18n.删除当前文档所有已完成的todo任务)

class ListBox {
    private plugin: BaseTomatoPlugin;
    private observer: MutationObserver;
    private protyle: IProtyle;

    async onload(plugin: BaseTomatoPlugin) {
        if (!listBoxCheckbox.get()) return;

        this.plugin = plugin;

        this.plugin.addCommand({
            langKey: ListBox取消勾选当前文档所有已完成的todo任务.langKey,
            langText: ListBox取消勾选当前文档所有已完成的todo任务.langText(),
            hotkey: ListBox取消勾选当前文档所有已完成的todo任务.m,
            callback: async () => {
                await uncheckAll(events.docID);
            },
        });

        this.plugin.addCommand({
            langKey: ListBox删除当前文档所有已完成的todo任务.langKey,
            langText: ListBox删除当前文档所有已完成的todo任务.langText(),
            hotkey: ListBox删除当前文档所有已完成的todo任务.m,
            callback: async () => {
                await delAllchecked(events.docID);
            },
        });

        this.plugin.protyleSlash.push(...[{
            filter: ["item", "single", "list", "列表", "单项", "dxlb", "lb"],
            html: tomatoI18n.插入单项列表,
            id: "insertSingleItemList 2025-06-16 10:45:05",
            async callback() {
                await insertItemList();
            }
        }]);

        if (dont_break_list.get()) {
            events.addListener("Tomato-ListBox-ListAsFile", (eventType, detail) => {
                if (eventType == EventType.loaded_protyle_static
                    || eventType == EventType.loaded_protyle_dynamic
                    || eventType == EventType.click_editorcontent
                    || eventType == EventType.switch_protyle
                ) {
                    navigator.locks.request("Tomato-ListBox-ListAsFile-onload", { ifAvailable: true }, async (lock) => {
                        const protyle: IProtyle = detail.protyle;
                        if (!protyle) return;
                        const notebookId = protyle.notebookId;
                        const nextDocID = protyle?.block?.rootID;
                        const element = protyle?.wysiwyg?.element;
                        if (lock && element && nextDocID && notebookId) {
                            if (this.protyle != protyle) {
                                this.protyle = protyle;
                                this.observer?.disconnect();
                                this.observer = new MutationObserver((mutationsList) => {
                                    mutationsList
                                        .map(e => [...e.addedNodes.values()])
                                        .flat()
                                        .filter(e => e instanceof HTMLElement)
                                        .filter((e: HTMLElement) => e.getAttribute(DATA_TYPE) == BlockNodeEnum.NODE_LIST_ITEM)
                                        .forEach(e => insertZSpace(e as any));
                                });
                                this.observer.observe(element, { subtree: true, childList: true });
                            }
                        }
                    });
                }
            });
        }
    }

    onunload() {
        this.observer?.disconnect();
        this.observer = null;
    }
}

async function insertItemList() {
    const { selected, ids } = await events.selectedDivs();
    if (selected.length > 0) {
        const div = selected[0];
        const id = ids[0];
        const edit = getContentEditableElement(div);
        if (id && edit) {
            const parts = edit.textContent.split("/");
            parts.pop();
            const txt = parts.join("/");
            const { md, id: newID } = getDocListMd(txt);
            await siyuan.insertBlockAfter(md, id);
            await siyuan.deleteBlock(id);
            moveCursor2Tail4List(newID);
            await siyuan.addRiffCards([newID])
        }
    }
}

function insertZSpace(e: HTMLElement) {
    const content = getContentEditableElement(e);
    if (content?.textContent === "") {
        content.textContent = WEB_ZERO_SPACE;
        if (content?.childElementCount > 0)
            document.getSelection().collapse(content, 1);
    }
}

export const listBox = new ListBox();
