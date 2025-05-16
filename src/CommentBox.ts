import { adaptHotkey, Dock, IProtyle } from "siyuan";
import { events, EventType } from "./libs/Events";
import { add_ref, cloneCleanDiv, extendMap, getAllText, getAttribute, getContextPath, newID, NewNodeID, setAttribute, setTimeouts, siyuan, } from "./libs/utils";
import CommentBoxSvelte from "./CommentBox.svelte";
import { commentBoxAddFlashCard, commentBoxAddUnderline, commentBoxCheckbox, commentBoxMenu, storeNoteBox_selectedNotebook } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { isReadonly } from "./libs/docUtils";
import { DialogTextArea } from "./libs/DialogText";
import { domNewHeading, domNewLine, DomSuperBlockBuilder } from "./libs/sydom";
import { winHotkey } from "./libs/winHotkey";

const DOCK_TYPE = "dock_CommentBox";

export const CommentBox添加批注到日记 = winHotkey("⇧⌥F", "comment box 2024-12-20 12:01:14")

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
            langKey: CommentBox添加批注到日记.langKey,
            langText: tomatoI18n.添加批注到日记,
            hotkey: CommentBox添加批注到日记.m,
            callback: () => {
                this.findDivs(events.protyle.protyle, false);
            },
        });

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            if (commentBoxMenu.get()) {
                menu.addItem({
                    icon: "iconQuoteTomato",
                    accelerator: CommentBox添加批注到日记.m,
                    label: tomatoI18n.添加批注到日记,
                    click: () => {
                        this.findDivs(detail.protyle, false);
                    },
                });
            }
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
        if (commentBoxMenu.get()) {
            const protyle: IProtyle = detail.protyle;
            detail.menu.addItem({
                icon: "iconQuoteTomato",
                accelerator: CommentBox添加批注到日记.m,
                label: tomatoI18n.添加批注到日记,
                click: () => {
                    this.findDivs(protyle, false);
                }
            });
        }
    }

    private async findDivs(protyle: IProtyle, _newFile: boolean) {
        const ro = isReadonly(protyle)
        const { ids, selected, rangeText, range } = await events.selectedDivs(protyle);
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
            text.trim().split("\n").forEach(l => builder.append(domNewLine(l)))

            const heandingID = NewNodeID();
            if (newDivs.length == 1) {
                setAttribute(newDivs.at(0), "fold", "1");
                builder.append(newDivs.at(0));
            } else {
                const txtLen = txt.length;
                const maxLen = 32;
                txt = txt.slice(0, maxLen)
                if (txtLen > maxLen) {
                    txt += "..."
                }
                const h = domNewHeading(txt, "h6", heandingID, true);
                setAttribute(h, "custom-comment-heading", "1")
                builder.append(h);
                builder.append(...newDivs)

                newDivs.forEach(div => {
                    setAttribute(div, "fold", "1")
                    setAttribute(div, "heading-fold", "1")
                });
            }

            const { id: docID } = await createDailyNoteTask;
            const tail = await siyuan.getDocLastID(docID);
            ops.push(...siyuan.transInsertBlocksAfter([builder.build().outerHTML], tail))
            await siyuan.transactions(ops);

            if (commentBoxAddFlashCard.get()) {
                siyuan.addRiffCards([builder.id])
            }

            if (commentBoxAddUnderline.get() && await ro != "true" && newDivs.length == 1) {
                const hasUnderline = (e: HTMLElement) => {
                    if (e?.tagName === "SPAN") {
                        if (getAttribute(e, "data-type") === "u") {
                            return true;
                        }
                    }
                }
                try {
                    const a = range?.startContainer?.parentElement;
                    const b = range?.endContainer?.parentElement;
                    protyle.toolbar.setInlineMark(protyle, "u", "range");
                    if (hasUnderline(a) || hasUnderline(b)) {
                        protyle.toolbar.setInlineMark(protyle, "u", "range");
                    }
                } catch (e) {
                }
            }

            if (newDivs.length > 1) {
                setTimeouts(() => {
                    newDivs.forEach(div => {
                        document
                            .querySelectorAll(`div[data-node-id="${getAttribute(div, "data-node-id")}"]`)
                            .forEach(e => {
                                e?.parentElement?.removeChild(e);
                            });
                    });
                }, 500, 3000, 800);
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
