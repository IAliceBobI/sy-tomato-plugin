import { adaptHotkey, Custom, IProtyle, openTab, Tab } from "siyuan";
import { events, EventType } from "./libs/Events";
import CommentBoxSvelte from "./CommentBox.svelte";
import { annoCollectDest, annoCollectTargetDoc, commentBoxCheckbox, commentBoxMenu } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
import { DestroyManager } from "./libs/destroyer";
import { newID } from "stonev5-utils";
import { verifyKeyTomato } from "./libs/user";
import { mount } from "svelte";
import { annotations } from "./Annotations";
import { quickCollect, cachedDocName } from "./libs/annoCollect";
import { openAnnoCollectDialog } from "./AnnoCollectDialog";

const DOCK_TYPE = "dock_CommentBox";
const TAB_TYPE = "custom_tab_CommentBox"

export const CommentBox添加批注到日记 = winHotkey("⇧⌥F", "comment box", "iconQuoteTomato", () => tomatoI18n.添加批注到日记, false)
export const CommentBoxTab批注 = winHotkey("⇧⌥I", "comment tab", "iconQuoteTomato", () => tomatoI18n.批注, false)
// F9 手动强刷 2026-09-01 放开（收费边界定稿：刷新是面板刚需动作非省力型）
export const CommentBox刷新文档正引 = winHotkey("F9", "comment refresh ref", "iconQuoteTomato", () => tomatoI18n.刷新文档正引, false)

class CommentBox {
    plugin: BaseTomatoPlugin;
    settingCfg: TomatoSettings;
    svelteCallback: Func;
    svelteResize: () => void;
    svelteCallbackTab: Func;
    svelteResizeTab: () => void;
    svelte: CommentBoxSvelte;
    private customTab: (options: any) => Custom;

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
        verifyKeyTomato();
        annotations.onload(plugin);

        this.plugin.addCommand({
            langKey: CommentBox添加批注到日记.langKey,
            langText: CommentBox添加批注到日记.langText(),
            hotkey: CommentBox添加批注到日记.m,
            callback: () => {
                this.findDivs(events.protyle.protyle, false);
            },
        });

        this.plugin.addCommand({
            langKey: CommentBox刷新文档正引.langKey,
            langText: CommentBox刷新文档正引.langText(),
            hotkey: CommentBox刷新文档正引.m,
            callback: () => {
                if (this.svelteCallback) {
                    this.svelteCallback(events.protyle.protyle, true);
                } else if (this.svelteCallbackTab) {
                    this.svelteCallbackTab(events.protyle.protyle, true);
                }
            },
        });

        // 批注收集（2026-09-02）：无默认快捷键（新键须过 winHotkey 规范化+官方 keymap
        // 全仓比对流程，留给用户键位设置自绑），故不走 winHotkey 工厂（m 空会 throw）。
        // 按上次记忆的 dest 直接执行 + pushMsg 回执
        this.plugin.addCommand({
            langKey: "anno collect",
            langText: tomatoI18n.收集批注,
            editorCallback: (protyle: IProtyle) => {
                const dest = annoCollectDest.get();
                void quickCollect(protyle.block.rootID, dest === "clipboard" || dest === "file" ? dest : "daily");
            },
        });

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            if (commentBoxMenu.get()) {
                addIfVisible(menu, CommentBox添加批注到日记.langKey, {
                    icon: CommentBox添加批注到日记.icon,
                    accelerator: CommentBox添加批注到日记.m,
                    label: CommentBox添加批注到日记.langText(),
                    click: () => {
                        this.findDivs(detail.protyle, false);
                    },
                });
                // 3.8.x 右键块任意处走 gutter 菜单（click-blockicon）、选中文本右键才走
                // open-menu-content——两通道都挂（与「添加批注」对齐），见 addCollectItems
                this.addCollectItems(menu, detail.protyle);
            }
        });

        if (!events.isMobile) {
            this.addDock(); // 添加后有 bug，手机端在文档数更新后，无法显示 topbar icons.
            events.addListener("tomato-comment-box-2024年12月19日21:48:42", (eventType, detail) => {
                if (eventType == EventType.click_editorcontent) {
                    if (this.svelteCallback) {
                        this.svelteCallback(detail.protyle);
                    }
                    if (this.svelteCallbackTab) {
                        this.svelteCallbackTab(detail.protyle);
                    }
                }
            });

            plugin.addTopBar({
                icon: CommentBoxTab批注.icon,
                title: CommentBoxTab批注.langText() + CommentBoxTab批注.w(),
                position: "left",
                callback: () => this.openCommentTab(),
            });

            this.plugin.addCommand({
                langKey: CommentBoxTab批注.langKey,
                langText: CommentBoxTab批注.langText(),
                hotkey: CommentBoxTab批注.m,
                callback: () => this.openCommentTab(),
            });

            this.customTab;
            this.customTab = this.plugin.addTab({
                type: TAB_TYPE,
                resize() {
                    if (commentBox.svelteResizeTab) commentBox.svelteResizeTab();
                },
                init(this) {
                    const id = newID();
                    this.element.innerHTML = `<div id="${id}"></div>`;
                    this.data.sm = new DestroyManager();
                    const svelte = mount(CommentBoxSvelte, {
                        target: this.element.querySelector("#" + id),
                        props: {
                            dock: this as any,
                            isDock: false,
                        }
                    });
                    this.data.sm.add("tab", () => { this.destroy(); });
                    this.data.sm.add("svelte", () => { svelte.destroy(); });
                },
                beforeDestroy() { },
                destroy() {
                    this.data.sm.destroyBy("tab");
                }
            });
        }
    }

    private tab: Tab;
    async openCommentTab() {
        if (this.tab) {
            this.tab.close();
            this.tab = null;
        } else {
            this.tab = await openTab({
                position: "right",
                app: this.plugin.app,
                custom: {
                    icon: CommentBoxTab批注.icon,
                    title: CommentBoxTab批注.langText(),
                    data: { docID: events.docID, blockID: events.lastBlockID }, // getCursorElement
                    id: this.plugin.name + TAB_TYPE
                },
            });
        }
    }

    blockIconEvent(detail: any) {
        if (!commentBoxCheckbox.get()) return;
        if (commentBoxMenu.get()) {
            const protyle: IProtyle = detail.protyle;
            addIfVisible(detail.menu, CommentBox添加批注到日记.langKey, {
                icon: CommentBox添加批注到日记.icon,
                accelerator: CommentBox添加批注到日记.m,
                label: CommentBox添加批注到日记.langText(),
                click: () => {
                    this.findDivs(protyle, false);
                }
            });
            this.addCollectItems(detail.menu, protyle);
        }
    }

    /** 批注收集右键项（spec §5.3，快通道平铺）：范围沿用上次记忆，文件项有目标记忆才显示。
     *  必须同步构建——内核在事件同步段 show 菜单，async addItem 赶不上显示；
     *  文件名走 cachedDocName 缓存。挂两通道：click-blockicon（右键块任意处）+
     *  open-menu-content（选中文本右键）——「添加批注」同款双挂。
     *  注：嵌套 submenu 在内核「插件」组渲染链上不显示（dev 3.8.2 e2e 实锤）——降级平铺。 */
    private addCollectItems(menu: any, protyle: IProtyle) {
        const rootID = protyle?.block?.rootID;
        if (!rootID) return;
        const targetDoc = annoCollectTargetDoc.get();
        const targetName = cachedDocName(targetDoc);
        addIfVisible(menu, "anno collect", {
            icon: "iconDownload",
            label: tomatoI18n.收集批注,
            click: () => openAnnoCollectDialog(rootID),
        });
        addIfVisible(menu, "m.annoCollect.clipboard", {
            icon: "iconCopy",
            label: `${tomatoI18n.收集批注} → ${tomatoI18n.剪贴板}`,
            click: () => void quickCollect(rootID, "clipboard"),
        });
        addIfVisible(menu, "m.annoCollect.daily", {
            icon: "iconCalendar",
            label: `${tomatoI18n.收集批注} → ${tomatoI18n.当天日记}`,
            click: () => void quickCollect(rootID, "daily"),
        });
        if (targetDoc && targetName) {
            addIfVisible(menu, "m.annoCollect.file", {
                icon: "iconFile",
                label: `${tomatoI18n.收集批注} → ${tomatoI18n.收集到文件}：《${targetName}》`,
                click: () => void quickCollect(rootID, "file"),
            });
        }
    }


    private async findDivs(protyle: IProtyle, _newFile: boolean) {
        // □3 起改走新批注链路（属性存储+锚点标记）；旧 CommentInput 产物链 □5 删净
        await annotations.create(protyle);
    }

    private addDock() {
        const title = tomatoI18n.批注//`${tomatoI18n.批注}(${tomatoI18n.包含正反链})`
        this.plugin.addDock({
            type: DOCK_TYPE,
            config: {
                position: "RightBottom",
                size: { width: 200, height: 0 },
                icon: CommentBox添加批注到日记.icon,
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
                commentBox.svelte.destroy();
            },
            init: (dock) => {
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
                commentBox.svelte = mount(CommentBoxSvelte, {
                    target: dock.element.querySelector("#" + eleID),
                    props: {
                        dock: dock as any,
                    }
                }) as any;
            },
        } as any); // addDock.init 的 dock 参数同 GraphBox：1.2.5 类型漏了，运行时仍传
    }
}

export const commentBox = new CommentBox();
