import { confirm, IEventBusMap, IProtyle, Plugin } from "siyuan";
import { addLineThrough, cleanText, get_siyuan_lnk_md, getAllText, getAttribute, getSyElement, NewNodeID, parseIAL, siyuan, timeUtil, } from "./libs/utils";
import { events, EventType } from "./libs/Events";
import { BlockNodeEnum, CUSTOM_RIFF_DECKS, DATA_NODE_ID, DATA_TYPE, DocAttrShowKey, SPACE, VIRTUAL_BLOCK_REF } from "./libs/gconst";
import { addTodoBookmark, rmTodoBookmark } from "./libs/bookmark";
import { getDocBlocks, item2ref, mergeDocs, moveAllContentHere, openFileByName, OpenSyFile2, pinyinLongShort } from "./libs/docUtils";
import { DialogText } from "./libs/DialogText";
import { cleanBackLinks, disableBK, enableBK, insertBackLinks } from "./libs/bkUtils";
import { mixBoxCheckbox, storeOpenRefsMenu, storeAttrManager, storeFillMemoMenu, storeInsertXml, storeMergeDoc, storeMoveDocContentHere, storeRefreshStaticBkLnk, storeOpenRefsClick, storeCopyStdMD, showDocAttrs, mixBoxPinyin } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { text2tab } from "./libs/listUtils";
import { zipNways } from "./libs/functional";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { winHotkey } from "./libs/winHotkey";
import { lastVerifyResult, verifyKeyTomato } from "./libs/user";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

export const MixBox删除块以及闪卡 = winHotkey("ctrl+alt+D", "delete 2025-5-12 09:00:20", "", () => tomatoI18n.删除块以及闪卡)
export const MixBox内容制表 = winHotkey("alt+shift+T", "tab 2025-5-12 12:15:07", "", () => tomatoI18n.内容制表)
export const MixBox使内容模糊 = winHotkey("alt+shift+D", "blur 2025-5-12 12:15:08", "", () => tomatoI18n.使内容模糊)
export const MixBox跳转到剪贴板中ID的块 = winHotkey("alt+shift+J", "jump 2025-5-12 12:15:09", "", () => tomatoI18n.跳转到剪贴板中ID的块)
export const MixBox添加一个flag书签 = winHotkey("alt+shift+K", "flag 2025-5-12 12:15:11", "", () => tomatoI18n.添加一个flag书签)
export const MixBox删除所有flag书签 = winHotkey("alt+shift+0", "del flags 2025-5-12 12:15:11", "", () => tomatoI18n.删除所有flag书签)
export const MixBox空格隔开的所有内容都转为引用 = winHotkey("alt+shift+F3", "txt2ref 2025-5-12 12:15:11", "", () => tomatoI18n.空格隔开的所有内容都转为引用)
export const MixBox收集当前文档与子文档所有的未完成任务 = winHotkey("⌘⇧w", "收集当前文档与子文档所有的未完成任务 2025-5-12 12:15:11", "", () => tomatoI18n.收集当前文档与子文档所有的未完成任务)
export const MixBox列出当前文档与子文档中没被引用的文档 = winHotkey("⌘⇧q", "列出当前文档与子文档中没被引用的文档 2025-5-12 12:15:11", "", () => tomatoI18n.列出当前文档与子文档中没被引用的文档)
export const MixBox将选择文字与其拼音加入文档的别名 = winHotkey("⌘⇧Y", "将选择文字与其拼音加入文档的别名 2025-5-12 12:15:11", "🍅🎵", () => tomatoI18n.将选择文字与其拼音加入文档的别名 + "(pinyin)")
export const MixBox将选择文字加入文档的别名 = winHotkey("⌘⇧U", "MixBox将选择文字加入文档的别名 2025-5-12 12:15:11", "", () => tomatoI18n.将选择文字加入文档的别名)
export const MixBox定位所有引用Menu = winHotkey("⌥⇧A", "定位所有引用Menu 2025-5-12 12:15:11", "🍅📍🔗", () => tomatoI18n.定位所有引用Menu)
export const MixBox复制文档为标准Markdown = winHotkey("⌥⇧B", "复制文档为标准Markdown 2025-5-12 12:15:11", "🍅📜📋", () => tomatoI18n.复制文档为标准Markdown)
export const MixBox锁定内容 = winHotkey("⌥⇧L", "锁定内容 2025-5-12 12:15:11", "🍅🔒/🔓", () => tomatoI18n.锁定内容)
export const MixBox复制文档为纯文本 = winHotkey("alt+ctrl+shift+B", "复制文档为纯文本 2025-5-12 12:15:11", "", () => tomatoI18n.复制文档为纯文本)

class MixBox {
    plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        if (!mixBoxCheckbox.get()) return;
        await verifyKeyTomato();

        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: MixBox删除块以及闪卡.langKey,
            langText: MixBox删除块以及闪卡.langText(),
            hotkey: MixBox删除块以及闪卡.m,
            editorCallback: (protyle: IProtyle) => {
                confirm(tomatoI18n.删除块以及闪卡, "⚠️", async () => {
                    const { ids, selected } = await events.selectedDivs(protyle);
                    const docID = protyle?.block?.rootID;
                    if (ids.includes(docID)) {
                        await siyuan.getTreeRiffCardsAll(docID)
                            .then(all => siyuan.removeRiffCards(all.map(i => i.id)))
                            .then(() => siyuan.removeRiffCards([docID]))
                            .then(() => siyuan.removeDocByID(docID))
                    } else {
                        const allIDs = selected.map(e =>
                            [...e.querySelectorAll(`[${CUSTOM_RIFF_DECKS}]`)]
                                .map(e => e.getAttribute(DATA_NODE_ID))
                        ).flat();
                        await siyuan.removeRiffCards([...allIDs, ...ids])
                            .then(() => siyuan.deleteBlocks(ids))
                    }
                    await siyuan.pushMsg("deleted!")
                })
            },
        });
        this.plugin.addCommand({
            langKey: MixBox内容制表.langKey,
            langText: MixBox内容制表.langText(),
            hotkey: MixBox内容制表.m,
            editorCallback: async (protyle: IProtyle) => {
                const { selected, ids } = await events.selectedDivs(protyle);
                const id = ids?.pop()
                if (id) {
                    const tab = text2tab(getAllText(selected))
                    await siyuan.insertBlockAfter(tab, id);
                }
            },
        });
        this.plugin.addCommand({
            langKey: MixBox使内容模糊.langKey,
            langText: MixBox使内容模糊.langText(),
            hotkey: MixBox使内容模糊.m,
            editorCallback: async (protyle: IProtyle) => {
                const { selected } = await events.selectedDivs(protyle);
                await addLineThrough(protyle, "custom-tomato-line-blur", selected);
            },
        });
        this.plugin.addCommand({
            langKey: MixBox跳转到剪贴板中ID的块.langKey,
            langText: MixBox跳转到剪贴板中ID的块.langText(),
            hotkey: MixBox跳转到剪贴板中ID的块.m,
            callback: async () => {
                let text = await navigator.clipboard.readText();
                text = text.replaceAll(/[\"\'\s\t]+/g, "")
                await OpenSyFile2(plugin, text.trim());
            },
        });
        this.plugin.addCommand({
            langKey: MixBox添加一个flag书签.langKey,
            langText: MixBox添加一个flag书签.langText(),
            hotkey: MixBox添加一个flag书签.m,
            editorCallback: async (protyle: IProtyle) => {
                const { ids } = await events.selectedDivs(protyle);
                await addTodoBookmark(ids);
            },
        });
        this.plugin.addCommand({
            langKey: MixBox删除所有flag书签.langKey,
            langText: MixBox删除所有flag书签.langText(),
            hotkey: MixBox删除所有flag书签.m,
            editorCallback: async (protyle: IProtyle) => {
                const { docID } = await events.selectedDivs(protyle);
                await rmTodoBookmark(docID);
            },
        });
        this.plugin.addCommand({
            langKey: MixBox空格隔开的所有内容都转为引用.langKey,
            langText: MixBox空格隔开的所有内容都转为引用.langText(),
            hotkey: MixBox空格隔开的所有内容都转为引用.m,
            editorCallback: async (protyle: IProtyle) => {
                const boxID = protyle.notebookId;
                const { selected, rangeText } = await events.selectedDivs(protyle);
                await item2ref(protyle, boxID, selected, rangeText);
            },
        });
        this.plugin.addCommand({
            langKey: MixBox锁定内容.langKey,
            langText: MixBox锁定内容.langText(),
            hotkey: MixBox锁定内容.m,
            callback: async () => {
                const { selected } = await events.selectedDivs();
                await this.fillMemo(selected);
            },
        });
        this.plugin.addCommand({
            langKey: MixBox收集当前文档与子文档所有的未完成任务.langKey,
            langText: MixBox收集当前文档与子文档所有的未完成任务.langText(),
            hotkey: MixBox收集当前文档与子文档所有的未完成任务.m,
            callback: async () => {
                await addTaskPage(this.plugin, events.protyle.protyle)
            },
        });
        this.plugin.addCommand({
            langKey: MixBox列出当前文档与子文档中没被引用的文档.langKey,
            langText: MixBox列出当前文档与子文档中没被引用的文档.langText(),
            hotkey: MixBox列出当前文档与子文档中没被引用的文档.m,
            callback: async () => {
                await addNoRefPage(this.plugin, events.protyle.protyle)
            },
        });
        this.plugin.addCommand({
            langKey: MixBox将选择文字与其拼音加入文档的别名.langKey,
            langText: MixBox将选择文字与其拼音加入文档的别名.langText(),
            hotkey: MixBox将选择文字与其拼音加入文档的别名.m,
            editorCallback: (protyle: IProtyle) => {
                addPinyin2DocAlias(protyle);
            },
        });
        this.plugin.addCommand({
            langKey: MixBox将选择文字加入文档的别名.langKey,
            langText: MixBox将选择文字加入文档的别名.langText(),
            hotkey: MixBox将选择文字加入文档的别名.m,
            editorCallback: (protyle: IProtyle) => {
                add2DocAlias(protyle);
            },
        });
        this.plugin.addCommand({
            langKey: MixBox定位所有引用Menu.langKey,
            langText: MixBox定位所有引用Menu.langText(),
            hotkey: MixBox定位所有引用Menu.m,
            editorCallback: (protyle: IProtyle) => {
                openRefs(this.plugin, protyle);
            },
        });
        this.plugin.addCommand({
            langKey: MixBox复制文档为标准Markdown.langKey,
            langText: MixBox复制文档为标准Markdown.langText(),
            hotkey: MixBox复制文档为标准Markdown.m,
            editorCallback: (protyle: IProtyle) => {
                copyStdMD(protyle);
            },
        });
        this.plugin.addCommand({
            langKey: MixBox复制文档为纯文本.langKey,
            langText: MixBox复制文档为纯文本.langText(),
            hotkey: MixBox复制文档为纯文本.m,
            editorCallback: (protyle: IProtyle) => {
                copyTextOnly(protyle);
            },
        });
        if (storeOpenRefsClick.get() && lastVerifyResult()) {
            events.addListener("storeOpenRefsClick2024-9-12 23:52:01", (eventType, detail) => {
                if (eventType == EventType.loaded_protyle_static
                    || eventType == EventType.loaded_protyle_dynamic
                    || eventType == EventType.click_editorcontent
                    || eventType == EventType.switch_protyle
                ) {
                    navigator.locks.request("2024-07-31 21:34:30", { ifAvailable: true }, async (lock) => {
                        if (lock) {
                            const protyle: IProtyle = detail.protyle;
                            if (!protyle?.background?.ial || !protyle?.notebookId) return;
                            const element: HTMLElement = protyle.wysiwyg.element
                            element.querySelectorAll(".protyle-attr--refcount").forEach((e: HTMLButtonElement) => {
                                if (e.addEventListener) e.addEventListener("click", refCountClick)
                            })
                        }
                    });
                }
            });
        }
        if (showDocAttrs.get()) {
            events.addListener("showDocAttrs2024-07-31 21:34:24", (eventType, detail) => {
                if (eventType == EventType.loaded_protyle_static
                    || eventType == EventType.loaded_protyle_dynamic
                    || eventType == EventType.click_editorcontent
                    || eventType == EventType.switch_protyle
                ) {
                    navigator.locks.request("lock2024-8-27 20:50:52", { ifAvailable: true }, async (lock) => {
                        if (lock) {
                            const protyle: IProtyle = detail.protyle;
                            if (!protyle?.background?.ial) return
                            const ial = { ...protyle?.background?.ial };
                            const docID = protyle?.block?.rootID;
                            const wysiwyg: HTMLElement = protyle?.wysiwyg?.element
                            if (!docID || !wysiwyg) return;
                            const top = wysiwyg.parentElement.querySelector(`div[data-node-id="${docID}"].protyle-wysiwyg--attr`)
                            if (top) {
                                delete ial["title"]
                                delete ial["type"]
                                delete ial["updated"];
                                delete ial["alias"];
                                delete ial["scroll"];
                                delete ial["style"];
                                delete ial["bookmark"];
                                delete ial["name"];
                                delete ial["custom-riff-decks"];
                                // delete ial["custom-off-tomatobacklink"];
                                delete ial["custom-tomatoUpdated"];
                                delete ial["custom-bkDisabledIDs"];
                                // delete ial["custom-sy-readonly"];
                                delete ial["custom-progmark"];
                                // delete ial["custom-fastnote"];
                                // delete ial["custom-card-priority-stop"];
                                // delete ial["custom-card-priority"];
                                delete ial["custom-pdigest-index"];
                                delete ial["custom-pdigest-parent-id"];
                                delete ial["custom-pdigest-last-id"];
                                delete ial["custom-pdigest-ctime"];
                                delete ial["custom-qf-doc-md5"];
                                delete ial["custom-qf-knowledge-file-id"];
                                delete ial["custom-qf-file-id"];
                                delete ial["picgo-file-map-key"];
                                const virAttrStr = Object.entries(ial)
                                    .sort((a, b) => a[0].localeCompare(b[0]))
                                    .map(([k, v]) => {
                                        k = k.replace("custom-", "");
                                        if (k.startsWith("dailynote-")) {
                                            k = "daily"
                                        }
                                        if (k.startsWith("dailycard-")) {
                                            k = "card"
                                        }
                                        if (k === "id") {
                                            v = v.split("-").at(1);
                                            k = ""
                                        }
                                        if (v && k) {
                                            return `【${k} ${v}】`
                                        } else {
                                            return `【${k}${v}】`
                                        }
                                    })
                                    .filter(i => !!i)
                                    .join("");
                                top.setAttribute(DocAttrShowKey, virAttrStr)
                            }
                        }
                    });
                }
            });
        }
        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            this.mergeDoc(detail as any);
            this.moveDocContentHere(detail as any);
            this.refreshStaticBkLnk(detail as any);
            this.disableStaticBkLnk(detail as any);
            this.insertXml(detail as any);
            this.addPinyin2alias(detail as any);
            this.fillMemoMenu(detail as any);
            this.openRefsMenu(detail as any);
            this.copyStdMDMenu(detail as any);
        });
    }

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!this.plugin) return;
        this.mergeDoc(detail as any);
        this.moveDocContentHere(detail as any);
        this.refreshStaticBkLnk(detail as any);
        this.disableStaticBkLnk(detail as any);
        this.insertXml(detail as any);
        this.addPinyin2alias(detail as any);
        this.fillMemoMenu(detail as any);
        this.openRefsMenu(detail as any);
        this.copyStdMDMenu(detail as any);
    }

    copyStdMDMenu(detail: TomatoMenu) {
        if (!storeCopyStdMD.get()) return
        const menu = detail.menu;
        menu.addItem({
            label: MixBox复制文档为标准Markdown.langText(),
            iconHTML: MixBox复制文档为标准Markdown.icon,
            accelerator: MixBox复制文档为标准Markdown.m,
            click: async () => {
                await copyStdMD(detail.protyle);
            },
        });
    }

    openRefsMenu(detail: TomatoMenu) {
        if (!storeOpenRefsMenu.get()) return
        const menu = detail.menu;
        menu.addItem({
            label: MixBox定位所有引用Menu.langText(),
            iconHTML: MixBox定位所有引用Menu.icon,
            accelerator: MixBox定位所有引用Menu.m,
            click: async () => {
                await openRefs(this.plugin, detail.protyle);
            },
        });
    }

    async fillMemo(selected: HTMLElement[]) {
        if (selected && selected.length > 0) {
            const newAttrs = []
            const ops = []
            selected.forEach((div, idx) => {
                if (!div) return
                const id = div.getAttribute(DATA_NODE_ID)
                const dataType = div.getAttribute(DATA_TYPE)
                if (id) {
                    const memo = div.getAttribute("memo")
                    const ro = getAttribute(div, "custom-tomato-readonly")
                    if (ro && memo) {
                        newAttrs.push({ id, attrs: { "memo": "", "custom-tomato-readonly": "" } as AttrType })
                        ops.push(siyuan.safeUpdateBlock(id, memo))
                    } else if (dataType === BlockNodeEnum.NODE_PARAGRAPH) {
                        const text = getAllText([selected[idx]])?.trim();
                        if (text) {
                            newAttrs.push({ id, attrs: { "memo": text, "custom-tomato-readonly": "1" } as AttrType })
                            ops.push(siyuan.safeUpdateBlock(id, ""))
                        }
                    }
                }
            })
            await Promise.all(ops);
            await siyuan.batchSetBlockAttrs(newAttrs);
        }
    }

    fillMemoMenu(detail: TomatoMenu) {
        if (!storeFillMemoMenu.get()) return
        const menu = detail.menu;
        menu.addItem({
            label: MixBox锁定内容.langText(),
            iconHTML: MixBox锁定内容.icon,
            accelerator: MixBox锁定内容.m,
            click: async () => {
                const { selected } = await events.selectedDivs();
                await this.fillMemo(selected);
            },
        });
    }

    addPinyin2alias(detail: TomatoMenu) {
        if (!mixBoxPinyin.get()) return;
        const menu = detail.menu;
        menu.addItem({
            label: MixBox将选择文字与其拼音加入文档的别名.langText(),
            iconHTML: MixBox将选择文字与其拼音加入文档的别名.icon,
            accelerator: MixBox将选择文字与其拼音加入文档的别名.m,
            click: () => {
                addPinyin2DocAlias(detail.protyle);
            },
        });
    }

    moveDocContentHere(detail: TomatoMenu) {
        if (!storeMoveDocContentHere.get()) return;
        detail.menu.addItem({
            label: tomatoI18n.把文档内容移动到这里,
            iconHTML: "🍅📃📩",
            accelerator: "",
            click: async () => {
                const { ids } = await events.selectedDivs(detail.protyle);
                new DialogText(
                    "📃📩" + tomatoI18n.填入要被清空的文档的ID文档里面的块ID也行会最终得到文档ID,
                    "",
                    async (input: string) => {
                        input = input.trim();
                        if (input) {
                            const docID = await siyuan.getDocIDByBlockID(input);
                            if (docID) {
                                const mv = await moveAllContentHere(docID, ids.pop());
                                await siyuan.pushMsg(`moved ${mv.length} blocks`);
                                events.protyleReload();
                            }
                        }
                    },
                );
            },
        });
    }

    mergeDoc(detail: TomatoMenu) {
        if (!storeMergeDoc.get()) return;
        const menu = detail.menu;
        menu.addItem({
            label: tomatoI18n.合并文档到这里,
            iconHTML: "🍅📃🈴",
            accelerator: "",
            click: async () => {
                const { ids } = await events.selectedDivs(detail.protyle);
                new DialogText(
                    "📃🈴" + tomatoI18n.填入要被清空的文档的ID文档里面的块ID也行会最终得到文档ID,
                    "",
                    async (input: string) => {
                        input = input.trim();
                        if (input) {
                            const docID = await siyuan.getDocIDByBlockID(input);
                            if (docID) {
                                await mergeDocs(docID, ids.pop());
                            }
                        }
                    },
                );
            },
        });
    }

    refreshStaticBkLnk(detail: TomatoMenu) {
        if (!storeRefreshStaticBkLnk.get()) return;
        const menu = detail.menu;
        menu.addItem({
            label: tomatoI18n.刷新静态反链,
            iconHTML: "🍅♻️🔗",
            accelerator: "",
            click: async () => {
                const { docID } = await events.selectedDivs(detail.protyle);
                await cleanBackLinks(docID);
                await insertBackLinks(docID);
                await disableBK(docID);
            },
        });
    }

    disableStaticBkLnk(detail: TomatoMenu) {
        if (!storeRefreshStaticBkLnk.get()) return;
        const menu = detail.menu;
        menu.addItem({
            label: tomatoI18n.删除静态反链,
            iconHTML: "🍅🧹🔗",
            accelerator: "",
            click: async () => {
                const { docID } = await events.selectedDivs(detail.protyle);
                await cleanBackLinks(docID);
                await enableBK(docID);
            },
        });
    }

    insertXml(detail: TomatoMenu) {
        if (!storeInsertXml.get()) return;
        const menu = detail.menu;
        menu.addItem({
            label: tomatoI18n.插入空的脑图流程图文件,
            iconHTML: "🍅＋🧠",
            accelerator: "",
            click: async () => {
                if (!events.isDesktop) {
                    siyuan.pushMsg("can only run in desktop env.");
                    return;
                }
                const { ids } = await events.selectedDivs(detail.protyle);
                if (ids?.length == 0) return
                new DialogText(
                    tomatoI18n.脑图名字,
                    "",
                    async (value: string) => {
                        if (!value) return;
                        const validExt = value.endsWith(".xmind") || value.endsWith(".drawio")
                        if (!validExt) {
                            value += ".drawio";
                        }
                        const { ext, name } = (() => {
                            const parts = value.split(".");
                            const ext = parts.pop();
                            return { ext, name: parts.join(".") };
                        })();

                        const { y, M } = timeUtil.nowYMDStrPad();

                        const newFile = `assets/mindmap/${y}/${y}${M}/${name}-${NewNodeID()}.` + ext;
                        await siyuan.copyFile2(
                            "/data/plugins/sy-tomato-plugin/i18n/empty." + ext,
                            `/data/${newFile}`,
                        );
                        await siyuan.insertBlockAfter(
                            `[${value}](${newFile})`,
                            ids[0],
                        );
                    },
                );
            },
        });
    }
}

export const mixBox = new MixBox();

async function add2DocAlias(protyle: IProtyle) {
    let { rangeText, docID } = await events.selectedDivs(protyle);
    if (rangeText && docID) {
        rangeText = rangeText.replaceAll('，', "").replaceAll(',', "");
        const store = storeAttrManager();
        await store.loadList(docID, "alias");
        store.addListString(rangeText);
        await store.save();
        await siyuan.pushMsg(store.getValue().join(","));
    }
    // const docs = await siyuan.sql(`select * from blocks where type='d' limit 999999999`)
    // function isValidString(input: string): boolean {
    //     const regex = /^[a-zA-Z,，\-\|:： @]*$/;
    //     return regex.test(input);
    // }
    // for (const d of docs) {
    //     if (d.alias.length > 0) {
    //         // if (isValidString(d.alias)) {
    //         //     await siyuan.setBlockAttrs(d.id, { "alias": "" })
    //         // }
    //     }
    // }
}

async function addPinyin2DocAlias(protyle: IProtyle) {
    let { rangeText, docID } = await events.selectedDivs(protyle);
    if (rangeText && docID) {
        rangeText = rangeText.replaceAll(/,|，/g, "");
        const { short } = pinyinLongShort(rangeText);
        const store = storeAttrManager();
        await store.loadList(docID, "alias");
        store.addListString(rangeText, short);
        await store.save();
        await siyuan.pushMsg(store.getValue().join(","));
    }
}

function getLeaves(trees: RetListDocTreeDir[], list: Set<string> = new Set()) {
    if (trees?.length > 0) {
        for (const tree of trees) {
            if (tree.children?.length > 0) {
                getLeaves(tree.children, list)
            } else {
                list.add(tree.id)
            }
        }
    }
    return list
}

async function addNoRefPage(plugin: BaseTomatoPlugin, protyle: IProtyle) {
    const { docRow, allIDs } = await (async () => {
        const [ids, docRow] = await getLeaveIDs(protyle);
        const allIDs = [...ids.values()]
        return { docRow, allIDs };
    })();

    if (allIDs.length == 0) {
        siyuan.pushMsg("cannot find any docs.")
        return;
    }

    const haveRefIDsTask = (async () => {
        const sqlIDS = allIDs.map(i => `"${i}"`).join(",");
        const haveRefRows = await siyuan.sqlRef(`select distinct def_block_root_id from refs where def_block_root_id in (${sqlIDS}) limit 100000000`)
        const haveRefIDs = new Set(haveRefRows.map(row => row.def_block_root_id))
        return { haveRefIDs }
    })();

    let docRows = await siyuan.getRows(allIDs, "hpath,ial", false)
    const { haveRefIDs } = await haveRefIDsTask;

    const getMdCate = (has: boolean) => {
        const mdCate: string[] = []
        const docRowCate = docRows
            .filter(docRow => docRow.ial.includes("custom-category"))
            .filter(docRow => {
                if (has) {
                    return haveRefIDs.has(docRow.id)
                } else {
                    return !haveRefIDs.has(docRow.id)
                }
            })
        mdCate.push(...docRowCate.map(row => {
            const attrs = parseIAL(row.ial)
            const cate = attrs["custom-category"] ?? "";
            return `${cate.padStart(5, SPACE)}：${get_siyuan_lnk_md(row.id, row.hpath)}`;
        }))
        mdCate.sort((a, b) => a.localeCompare(b));
        return { mdCate };
    }

    const { mdCate } = getMdCate(false)
    const { mdCate: mdRefCate } = getMdCate(true)

    const getDocs = async (has: boolean) => {
        const mdEmpty: string[] = []
        const mdEmptyIDs: string[] = []
        const mdContent: string[] = []
        const rows = docRows
            .filter(docRow => !docRow.ial.includes("custom-category"))
            .filter(docRow => {
                if (has) {
                    return haveRefIDs.has(docRow.id)
                } else {
                    return !haveRefIDs.has(docRow.id)
                }
            })
        zipNways(await Promise.all(rows.map(row => siyuan.copyStdMarkdown(row.id))), rows).forEach(([text, block]) => {
            text = cleanText(text.trim().split("\n").slice(1).join("\n"));
            const lnk = get_siyuan_lnk_md(block.id, block.hpath);
            if (!text) {
                mdEmpty.push(lnk)
                mdEmptyIDs.push(block.id)
            } else {
                mdContent.push(lnk)
            }
        })
        return { mdEmpty, mdEmptyIDs, mdContent };
    }

    const { mdEmpty, mdEmptyIDs, mdContent } = await getDocs(false);
    const { mdEmpty: mdRefEmpty, mdContent: mdRefContent } = await getDocs(true);

    plugin.global.tomato_zZmqus5PtYRi.rmContentEmptyRefs = () => {
        mdEmptyIDs.forEach(id => siyuan.removeDocByID(id))
    }

    const md = [
        "# 有引用，有类别",
        ...mdRefCate,
        "# 无引用，有类别",
        ...mdCate,
        "# 有引用，无内容",
        ...mdRefEmpty,
        "# 无引用，无内容",
        `tomato_zZmqus5PtYRi.rmContentEmptyRefs()`,
        ...mdEmpty,
        "# 有引用，有内容",
        ...mdRefContent,
        "# 无引用，有内容",
        ...mdContent,
    ]
    const id = await siyuan.createDocWithMdIfNotExists(protyle.notebookId, `${docRow.hpath}/refs-${docRow.content}`, "", { "custom-off-tomatobacklink": "1" })
    await siyuan.clearAll(id);
    await siyuan.insertBlockAsChildOf(md.join("\n"), id)
    await OpenSyFile2(plugin, id)
}

async function getLeaveIDs(protyle: IProtyle) {
    const docID = protyle.block.rootID;
    const notebookId = protyle.notebookId;
    const docRow = await siyuan.getDocRowByBlockID(docID);
    const tree = await siyuan.listDocTree(notebookId, docRow.path.slice(0, -3));
    const ids = getLeaves(tree?.tree);
    return [ids, docRow] as [Set<string>, Block];
}

async function addTaskPage(plugin: Plugin, protyle: IProtyle) {
    const docID = protyle.block.rootID
    const docRow = await siyuan.getDocRowByBlockID(docID)
    const sql = `{{select * from blocks where hpath like "${docRow.hpath}%" and type="l" and subtype="t" and (markdown like "* [ ] %" or markdown like "- [ ] %")}}`;
    const id = await siyuan.createDocWithMdIfNotExists(protyle.notebookId, `${docRow.hpath}/tasks-${docRow.content}`, sql, { "custom-off-tomatobacklink": "1" })
    await OpenSyFile2(plugin, id)
}

async function doOpenRefs(div: HTMLElement, virtualLnk = true) {
    if (div) {
        const set = new Set<string>();
        const task1 = siyuan
            .sqlRef(`select distinct block_id from refs where def_block_id="${div.getAttribute(DATA_NODE_ID)}"`)
            .then(rows => rows?.forEach(row => set.add(row.block_id)))
        if (virtualLnk) {
            const cons = [...div.querySelectorAll(`span[${DATA_TYPE}="${VIRTUAL_BLOCK_REF}"]`)]
                .map(span => span.textContent.trim())
                .filter(i => !!i)
                .map(i => `"${i}"`)
                .join(",")
            await siyuan
                .sql(`select distinct id from blocks where type='d' and content in (${cons})`)
                .then(rows => rows?.forEach(row => set.add(row.id)))
        }
        await task1;
        for (const id of set.values()) {
            OpenSyFile2(mixBox.plugin, id);
        }
    }
}

async function openRefs(pugin: Plugin, protyle: IProtyle) {
    const { selected, rangeText } = await events.selectedDivs(protyle);
    if (rangeText) {
        await openFileByName(pugin, rangeText.trim())
    } else {
        await doOpenRefs(selected?.at(0) as any);
    }
}

async function copyStdMD(protyle: IProtyle) {
    const docID = protyle?.block?.rootID
    if (docID) {
        const text = await siyuan.copyStdMarkdown(docID);
        await navigator.clipboard.writeText(text);
        await siyuan.pushMsg("copied markdown!")
    }
}

async function copyTextOnly(protyle: IProtyle) {
    const docID = protyle?.block?.rootID
    if (docID) {
        const { div } = await getDocBlocks(docID, "", false, true, 1);
        const txt = [...div.querySelectorAll(`div[contenteditable]`)].map(d => d.textContent).join("\n")
        await navigator.clipboard.writeText(txt);
        await siyuan.pushMsg("copied text!")
    }
}

function refCountClick(event: PointerEvent) {
    if (!event) return;
    const div = event.target as HTMLElement
    const e = getSyElement(div)
    doOpenRefs(e as any, false);
}
