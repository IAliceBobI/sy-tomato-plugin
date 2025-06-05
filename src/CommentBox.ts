import { adaptHotkey, Dialog, Dock, IProtyle } from "siyuan";
import { events, EventType } from "./libs/Events";
import { getDialogContainer, newID, } from "./libs/utils";
import CommentBoxSvelte from "./CommentBox.svelte";
import { commentBoxCheckbox, commentBoxMenu, storeNoteBox_selectedNotebook } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { isReadonly } from "./libs/docUtils";
import { winHotkey } from "./libs/winHotkey";
import { DestroyManager } from "./libs/destroyer";
import CommentInput from "./CommentInput.svelte";

const DOCK_TYPE = "dock_CommentBox";

export const CommentBox添加批注到日记 = winHotkey("⇧⌥F", "comment box 2024-12-20 12:01:14")

class CommentBox {
    plugin: BaseTomatoPlugin;
    settingCfg: TomatoSettings;
    svelteCallback: (protyle: IProtyle) => void;
    svelteResize: () => void;
    svelte: CommentBoxSvelte;

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

        const id = newID();
        const dm = new DestroyManager();
        const dialog = new Dialog({
            title: tomatoI18n.添加批注,
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : null,
            height: events.isMobile ? null : null,
            hideCloseIcon: true,
            transparent: true,
            destroyCallback() {
                dm.destroyBy("dialog");
            },
            resizeCallback(_type: string) {
                dm.getFn("resizeCallback")(getDialogContainer(dialog));
            }
        });
        dm.add("dialog", () => dialog.destroy());
        const svelte = new CommentInput({
            target: dialog.element.querySelector("#" + id),
            props: {
                dm,
                protyle,
                boxID,
                ro,
                ids,
                selected,
                rangeText,
                range,
            }
        });
        dm.add("svelte", () => svelte.$destroy());
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
