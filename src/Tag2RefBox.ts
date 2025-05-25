import { IProtyle, Lute } from "siyuan";
import { EventType, events } from "./libs/Events";
import { BlockNodeEnum, DATA_NODE_ID, DATA_TYPE, SPACE } from "./libs/gconst";
import { getAllContentEditableText, NewLute, siyuan, } from "./libs/utils";
import { createRefDoc } from "./libs/docUtils";
import { tag2RefBoxCheckbox, tag2RefSearchLnk, tag2RefSearchRef } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { domLnk, domRef } from "./libs/sydom";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { winHotkey } from "./libs/winHotkey";

export const Tag2RefBox模糊查找引用Ref = winHotkey("shift+alt+4", "模糊查找引用Ref 2025-5-12 18:46:16", "🔍", () => tomatoI18n.模糊查找引用 + "(ref)")
export const Tag2RefBox模糊查找引用Lnk = winHotkey("shift+alt+7", "模糊查找引用Lnk 2025-5-12 18:46:16", "🔍", () => tomatoI18n.模糊查找链接 + "(lnk)")

class Tag2RefBox {
    public plugin: BaseTomatoPlugin;
    private observer: MutationObserver;
    private protyle: IProtyle;

    async onload(plugin: BaseTomatoPlugin) {
        if (!tag2RefBoxCheckbox.get()) return;

        this.plugin = plugin;

        this.plugin.addCommand({
            langKey: Tag2RefBox模糊查找引用Ref.langKey,
            langText: Tag2RefBox模糊查找引用Ref.langText(),
            hotkey: Tag2RefBox模糊查找引用Ref.m,
            editorCallback: (protyle: IProtyle) => {
                this.fuzzySearch(protyle, "ref");
            },
        });
        this.plugin.addCommand({
            langKey: Tag2RefBox模糊查找引用Lnk.langKey,
            langText: Tag2RefBox模糊查找引用Lnk.langText(),
            hotkey: Tag2RefBox模糊查找引用Lnk.m,
            editorCallback: (protyle: IProtyle) => {
                this.fuzzySearch(protyle, "lnk");
            },
        });
        this.plugin.eventBus.on(EventType.open_menu_content, ({ detail }) => {
            if (tag2RefSearchRef.get()) {
                detail.menu.addItem({
                    iconHTML: Tag2RefBox模糊查找引用Ref.icon,
                    accelerator: Tag2RefBox模糊查找引用Ref.m,
                    label: Tag2RefBox模糊查找引用Ref.langText(),
                    click: () => {
                        this.fuzzySearch(detail.protyle, "ref");
                    }
                });
            }
            if (tag2RefSearchLnk.get()) {
                detail.menu.addItem({
                    iconHTML: Tag2RefBox模糊查找引用Lnk.icon,
                    accelerator: Tag2RefBox模糊查找引用Lnk.m,
                    label: Tag2RefBox模糊查找引用Lnk.langText(),
                    click: () => {
                        this.fuzzySearch(detail.protyle, "lnk");
                    }
                });
            }
        });

        events.addListener("Tomato-Tag2RefBox", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.click_editorcontent
                || eventType == EventType.switch_protyle
            ) {
                navigator.locks.request("Tomato-Tag2RefBox-onload", { ifAvailable: true }, async (lock) => {
                    const protyle: IProtyle = detail.protyle;
                    if (!protyle) return;
                    const notebookId = protyle.notebookId;
                    const nextDocID = protyle?.block?.rootID;
                    const element = protyle?.wysiwyg?.element;
                    if (lock && element && nextDocID && notebookId) {
                        if (this.protyle != protyle) {
                            this.protyle = protyle;
                            this.observer?.disconnect();
                            const lute = NewLute();
                            this.observer = new MutationObserver((mutationsList) => {
                                const es = mutationsList.map(i => [...i.addedNodes.values(), i.previousSibling]).flat() as HTMLElement[];
                                navigator.locks.request("Tomato-Tag2RefBox-findAllTagLock", { mode: "exclusive" }, async (lock) => {
                                    if (lock) {
                                        const s = new Set<string>();
                                        for (const e of es) {
                                            if (e && e.getAttribute && e.querySelectorAll) {
                                                const dateType = e.getAttribute(DATA_TYPE);
                                                if (dateType !== BlockNodeEnum.NODE_PARAGRAPH) {
                                                    for (const p of e.querySelectorAll(`div[${DATA_TYPE}="${BlockNodeEnum.NODE_PARAGRAPH}"]`)) {
                                                        await this.findAllTag(protyle, notebookId, p as any, lute, s);
                                                    }
                                                } else {
                                                    await this.findAllTag(protyle, notebookId, e as any, lute, s);
                                                }
                                            }
                                        }
                                    }
                                });
                            });
                            this.observer.observe(element, { childList: true, subtree: true });
                        }
                    }
                });
            }
        });
    }

    onunload() {
        this.observer?.disconnect();
        this.observer = null;
    }

    private async fuzzySearch(protyle: IProtyle, t: "ref" | "lnk") {
        const { rangeText, ids, selected } = await events.selectedDivs(protyle);
        if (ids.length > 0 && selected.length > 0) {
            const id = ids[0];
            let selectedText = "";
            if (rangeText) {
                selectedText = rangeText;
            } else {
                selectedText = getAllContentEditableText(selected[0]);
            }
            siyuan.pushMsg("fuzzy search: " + selectedText)
            if (selectedText) {
                const select = "select id,content from blocks where type='d'";
                const cons = selectedText
                    .replaceAll(" ", "|")
                    .split("|")
                    .map(i => i.trim())
                    .filter(i => !!i)
                    .map(i => ` content like "%${i}%" `)
                    .join(" and ");
                let rows = await siyuan.sql(`${select} and ${cons} limit 10000000`);
                if (rows.length > 0) {
                    const doms = rows
                        .sort((a, b) => a.content.localeCompare(b.content))
                        .map(i => {
                            if (t == "ref") {
                                return domRef(null, i.id, i.content)
                            } else {
                                return domLnk(null, i.id, i.content)
                            }
                        })
                        .reverse();
                    await siyuan.transactions(siyuan.transInsertBlocksBefore(doms, id))
                }
            }
        }
    }

    private async findAllTag(_protyle: IProtyle, notebookId: string, element: HTMLElement, lute: Lute, filter: Set<string>) {
        if (!element || !element.getAttribute || !element.querySelectorAll) return;
        const id = element.getAttribute(DATA_NODE_ID);
        if (!id) return;
        if (filter.has(id)) return;
        filter.add(id);
        const htmlStr = element.outerHTML;
        const ori = lute.BlockDOM2StdMd(htmlStr).trim();
        let mdStd = ori;

        async function newRefs(refText: string): Promise<Block[]> {
            if (refText.startsWith("@")) {
                return siyuan.sql(`select id,content from blocks where type='d' and content like "%${refText.slice(1)}%"`);
            } else {
                refText = refText.split("|").map(i => i.trim()).filter(i => i.length > 0).join(" | ");
                const id = await createRefDoc(notebookId, refText);
                return [{ id, content: refText }]
            }
        }
        for (const lnk of mdStd.matchAll(/@@(@?[^\s\p{P}　]+)@?/gu)) {
            const whole = lnk[0];
            let refText = lnk[1];
            const refs = await newRefs(refText)
                .then(list => list.reduce((l, b) => {
                    l.push(`((${b.id} '${b.content}'))`)
                    return l;
                }, [] as string[]));
            if (refs.length > 0) mdStd = mdStd.replace(whole, refs.join(SPACE));
        }
        if (ori !== mdStd) {
            const attrs = lute.BlockDOM2Md(htmlStr).trim().split("\n").pop();
            setTimeout(() => {
                siyuan.safeUpdateBlock(id, mdStd + "\n" + attrs);
            }, 200);
        }
    }
}

export const tag2RefBox = new Tag2RefBox();
