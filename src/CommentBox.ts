import { adaptHotkey, Dock, IProtyle } from "siyuan";
import { events, EventType } from "./libs/Events";
import { add_ref, cloneCleanDiv, extendMap, getAllText, getAttribute, getContextPath, newID, setAttribute, siyuan } from "./libs/utils";
import CommentBoxSvelte from "./CommentBox.svelte";
import { commentBoxAddFlashCard, commentBoxAddUnderline, commentBoxCheckbox, storeNoteBox_selectedNotebook } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { isReadonly } from "./libs/docUtils";
import { DialogTextArea } from "./libs/DialogText";
import { DomListBuilder, domNewLine, DomSuperBlockBuilder } from "./libs/sydom";

const DOCK_TYPE = "dock_CommentBox";

class CommentBox {
    plugin: BaseTomatoPlugin;
    settingCfg: TomatoSettings;
    svelteCallback: (protyle: IProtyle) => void;
    svelteResize: () => void;
    svelte: CommentBoxSvelte;

    onunload() {
    }

    onload(plugin: BaseTomatoPlugin) {
        if (plugin.initCfg()) {
            this._onload(plugin)
        } else {
            (async () => {
                await plugin.taskCfg;
                this._onload(plugin);
            })();
        }
    }

    _onload(plugin: BaseTomatoPlugin) {
        if (!commentBoxCheckbox.get()) return;
        this.plugin = plugin;
        this.settingCfg = plugin.settingCfg;

        this.plugin.addCommand({
            langKey: "comment box 2024-12-20 12:01:14",
            langText: tomatoI18n.添加批注到日记,
            hotkey: "⇧⌥F",
            callback: () => {
                this.findDivs(events.protyle.protyle, false);
            },
        });
        // this.plugin.addCommand({
        //     langKey: "comment box NewFile 2024-12-20 12:01:27",
        //     langText: tomatoI18n.添加批注到新文件,
        //     hotkey: "⇧⌥G",
        //     callback: () => {
        //         this.findDivs(events.protyle.protyle, true);
        //     },
        // });

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            menu.addItem({
                icon: "iconQuoteTomato",
                accelerator: "⇧⌥F",
                label: tomatoI18n.添加批注到日记,
                click: () => {
                    this.findDivs(detail.protyle, false);
                },
            });
        });

        if (!events.isMobile) {
            this.addDock(); // 添加后有 bug，手机端在文档数更新后，无法显示 topbar icons.
            events.addListener("tomato-comment-box-2024年12月19日21:48:42", (eventType, detail) => {
                if (eventType == EventType.click_editorcontent) {
                    if (this.svelteCallback) {
                        this.svelteCallback(detail.protyle);
                    }
                }
            });
        }
    }

    blockIconEvent(detail: any) {
        if (!this.plugin) return;
        const protyle: IProtyle = detail.protyle;
        detail.menu.addItem({
            icon: "iconQuoteTomato",
            accelerator: "⇧⌥F",
            label: tomatoI18n.添加批注到日记,
            click: () => {
                this.findDivs(protyle, false);
            }
        });
    }

    private async findDivs(protyle: IProtyle, _newFile: boolean) {
        const ro = isReadonly(protyle)
        const { ids, selected, rangeText } = await events.selectedDivs(protyle);
        if (!selected || selected.length == 0) return;
        let boxID = storeNoteBox_selectedNotebook.getOr();
        if (!boxID) boxID = events.boxID;
        const createDailyNoteTask = siyuan.createDailyNote(boxID);
        const rpath = getContextPath(ids[0]).then(a => a.getPathStr());
        const ops: IOperation[] = [];
        const newDivs: HTMLElement[] = [];
        new DialogTextArea(tomatoI18n.添加批注, "", async (text) => {
            const builder = new DomSuperBlockBuilder();

            let txt = getAllText(selected, "")
            if (rangeText) {
                const div = domNewLine(rangeText.trim());
                add_ref(div, ids[0], "*", true, false)
                newDivs.push(div)
            } else {
                const new2old = new Map<string, string>();
                const cloned = selected.map(s => {
                    const { new2old: m, div } = cloneCleanDiv(s, true)
                    extendMap(new2old, m);
                    return div;
                });
                newDivs.push(...cloned);
                cloned
                    .map(div => {
                        const all: HTMLElement[] = [...div.querySelectorAll(`div[data-node-id][data-type="NodeParagraph"]`)] as any;
                        if (all.length == 0) return [div];
                        return all;
                    })
                    .flat()
                    .forEach((div) => {
                        add_ref(div, new2old.get(getAttribute(div, "data-node-id")), "*", true, true)
                        setAttribute(div, "custom-comment-bk-id", builder.id);
                        div.style.backgroundColor = "";
                    })
            }

            builder.setAttr("custom-lnk-bottom", "1");
            builder.setAttr("custom-tomato-ref-hpath", await rpath);
            if (newDivs.length == 1) {
                setAttribute(newDivs[0], "fold", "1");
                builder.append(newDivs[0]);
            } else {
                const list = new DomListBuilder();
                const txtLen = txt.length;
                const maxLen = 40;
                txt = txt.slice(0, maxLen)
                if (txtLen > maxLen) {
                    txt += "..."
                }
                list.append2FirstItem(domNewLine(txt));
                newDivs.forEach(div => {
                    list.append2FirstItem(div);
                })
                const c = list.build();
                c.firstElementChild.setAttribute("fold", "1");
                builder.append(c)
            }
            text.split("\n").forEach(l => builder.append(domNewLine(l)))

            const { id: docID } = await createDailyNoteTask;
            const tail = await siyuan.getTailChildBlocks(docID, 1);
            ops.push(...siyuan.transInsertBlocksAfter([builder.build().outerHTML], tail[0].id))
            await siyuan.transactions(ops);

            if (commentBoxAddFlashCard.get()) {
                siyuan.addRiffCards([builder.id])
            }

            if (commentBoxAddUnderline.get() && await ro != "true") {
                try {
                    protyle.toolbar.setInlineMark(protyle, "u", "range");
                } catch (e) {
                }
            }
        });
    }

    private addDock() {
        const title = tomatoI18n.批注//`${tomatoI18n.批注}(${tomatoI18n.包含正反链})`
        this.plugin.addDock({
            type: DOCK_TYPE,
            config: {
                position: "RightBottom",
                size: { width: 200, height: 0 },
                icon: "iconQuoteTomato",
                title,
                hotkey: "⌥⌘S",
            },
            data: {
            },
            resize() {
                if (commentBox.svelteResize) commentBox.svelteResize();
            },
            update() {
            },
            destroy() {
                commentBox.svelte.$destroy();
            },
            init: (dock: Dock) => {
                const eleID = newID();
                if (events.isMobile) {
                    dock.element.innerHTML = `<div class="toolbar toolbar--border toolbar--dark">
                        <svg class="toolbar__icon"><use xlink:href="#iconQuoteTomato"></use></svg>
                            <div class="toolbar__text">${title}</div>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                } else {
                    dock.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
                        <div class="block__icons">
                            <div class="block__logo">
                                <svg class="block__logoicon"><use xlink:href="#iconQuoteTomato"></use></svg>${title}
                            </div>
                            <span class="fn__flex-1 fn__space"></span>
                            <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}"><svg><use xlink:href="#iconMin"></use></svg></span>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                }
                commentBox.svelte = new CommentBoxSvelte({
                    target: dock.element.querySelector("#" + eleID),
                    props: {
                        dock,
                    }
                }) as any;
            },
        });
    }
}

export const commentBox = new CommentBox();
