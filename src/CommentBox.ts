import { adaptHotkey, getAllEditor, IMenuItem, IProtyle, Protyle } from "siyuan";
import { events, EventType } from "./libs/Events";
import CommentBoxSvelte from "./CommentBox.svelte";
import { annoCollectDest, annoCollectTargetDoc, commentBoxAnnoToolbar, commentBoxCheckbox, commentBoxMenu } from "./libs/stores";
import { annoRangeUsable } from "./libs/domUtils";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
import { newID } from "stonev5-utils";
import { verifyKeyTomato } from "./libs/user";
import { mount, unmount } from "svelte";
import { annotations } from "./Annotations";
import { quickCollect, cachedDocName } from "./libs/annoCollect";
import { openAnnoCollectDialog } from "./AnnoCollectDialog";

const DOCK_TYPE = "dock_CommentBox";

export const CommentBox添加批注 = winHotkey("⇧⌥F", "comment box", "iconQuote", () => tomatoI18n.添加批注, false)
// F9 手动强刷 2026-09-01 放开（收费边界定稿：刷新是面板刚需动作非省力型）
export const CommentBox刷新文档正引 = winHotkey("F9", "comment refresh ref", "iconQuote", () => tomatoI18n.刷新文档正引, false)
// 批注 tab 通道（顶栏按钮/⇧⌥I 命令/custom_tab_CommentBox）2026-09-03 退役：用户拍板双入口收敛
// 只留 dock 面板（⌥⌘S）；CommentBoxSvelte 随之 dock-only。存量已开页签在 reload 后内核找不到
// 注册 type 自行关闭；用户 keymap 的 comment tab 孤儿键无害。

class CommentBox {
    plugin: BaseTomatoPlugin;
    settingCfg: TomatoSettings;
    svelteCallback: Func;
    svelteResize: () => void;
    svelte: CommentBoxSvelte;

    /** □4 时序统一：index.async onload 已 await taskCfg（框架保序），双路竞态消化退役 */
    onload(plugin: BaseTomatoPlugin) {
        // 划词工具条批注钮补态监听先于总开关早退挂上（MindWire 同款评审 P1-3）：工具条项
        // 恒附（构造期内核已收项早于设置落库），checkbox 关闭态冷启动若无监听，按钮裸露成
        // 点击无反馈的死按钮；sync gates 含 checkbox，off 态自动隐藏
        document.addEventListener("selectionchange", this.onSelectionChange);
        if (!commentBoxCheckbox.get()) return;
        this.plugin = plugin;
        this.settingCfg = plugin.settingCfg;
        verifyKeyTomato();
        annotations.onload(plugin);

        this.plugin.addCommand({
            langKey: CommentBox添加批注.langKey,
            langText: CommentBox添加批注.langText(),
            hotkey: CommentBox添加批注.m,
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

        // 三直发项命令化（2026-09-04 □2 拍板）：同上无默认键留用户键位设置自绑；langKey 与
        // 右键菜单项同一 key（菜单/命令面板显隐走 hiddenMenuItems 一处藏两处消失）；file 项
        // 无「菜单有目标记忆才显示」前提——命令无记忆时 fallback 开收集小窗，不闷声没反应
        this.plugin.addCommand({
            langKey: "anno collect clipboard",
            langText: `${tomatoI18n.收集批注} → ${tomatoI18n.剪贴板}`,
            editorCallback: (protyle: IProtyle) => {
                void quickCollect(protyle.block.rootID, "clipboard");
            },
        });
        this.plugin.addCommand({
            langKey: "anno collect daily",
            langText: `${tomatoI18n.收集批注} → ${tomatoI18n.当天日记}`,
            editorCallback: (protyle: IProtyle) => {
                void quickCollect(protyle.block.rootID, "daily");
            },
        });
        this.plugin.addCommand({
            langKey: "anno collect file",
            langText: `${tomatoI18n.收集批注} → ${tomatoI18n.收集到文件}`,
            editorCallback: (protyle: IProtyle) => {
                const rootID = protyle.block.rootID;
                if (annoCollectTargetDoc.get()) {
                    void quickCollect(rootID, "file");
                } else {
                    openAnnoCollectDialog(rootID);
                }
            },
        });

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            if (commentBoxMenu.get()) {
                addIfVisible(menu, CommentBox添加批注.langKey, {
                    icon: CommentBox添加批注.icon,
                    accelerator: CommentBox添加批注.m,
                    label: CommentBox添加批注.langText(),
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
                }
            });
        }
    }

    blockIconEvent(detail: any) {
        if (!commentBoxCheckbox.get()) return;
        if (commentBoxMenu.get()) {
            const protyle: IProtyle = detail.protyle;
            addIfVisible(detail.menu, CommentBox添加批注.langKey, {
                icon: CommentBox添加批注.icon,
                accelerator: CommentBox添加批注.m,
                label: CommentBox添加批注.langText(),
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
        addIfVisible(menu, "anno collect clipboard", {
            icon: "iconCopy",
            label: `${tomatoI18n.收集批注} → ${tomatoI18n.剪贴板}`,
            click: () => void quickCollect(rootID, "clipboard"),
        });
        addIfVisible(menu, "anno collect daily", {
            icon: "iconCalendar",
            label: `${tomatoI18n.收集批注} → ${tomatoI18n.当天日记}`,
            click: () => void quickCollect(rootID, "daily"),
        });
        if (targetDoc && targetName) {
            addIfVisible(menu, "anno collect file", {
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

    // ---------- 划词工具条入口（□4 2026-09-03，MindWire 后本仓第二用） ----------

    /** 官方划词工具条扩展（Plugin.updateProtyleToolbar 委托自 index.ts）：恒附项——
     *  插件构造期收项早于设置落库，门禁交给 selectionchange 同步（syncAnnoToolbar）；
     *  name=命令 langKey 共享 keymap 节点，⌥⇧F 改键两通道生效 */
    updateProtyleToolbar(toolbar: Array<string | IMenuItem>): Array<string | IMenuItem> {
        toolbar.push({
            name: CommentBox添加批注.langKey,
            icon: CommentBox添加批注.icon,
            tip: CommentBox添加批注.langText(),
            hotkey: CommentBox添加批注.m,
            // 官方 click 实参=Protyle 包装类（ToolbarItem 调 getInstance()=>this），
            // selectedDivs/create 在内层 .protyle（IProtyle）——MindWire e2e 实锤缺这层解包
            click: (protyleWrap: Protyle) => {
                const protyle = protyleWrap.protyle;
                this.ensureAnnoSelection(protyle);
                void annotations.create(protyle);
            },
        });
        return toolbar;
    }

    /** 工具条点击吞选区兜底（MindWire wordWireRange 同坑实证）：annotations.create 内部走
     *  events.selectedDivs 的 document.getSelection() 通道，选区被吞/焦点漂移时把内核划词
     *  渲染留存的 protyle.toolbar.range 写回全局 selection——划词场景选区天然在手，比右键
     *  通道还干净；两路都无效则不动（create 内部退化光标块路径，与右键通道行为一致） */
    private ensureAnnoSelection(protyle: IProtyle) {
        const sel = document.getSelection();
        let cur: Range | null = null;
        try { cur = sel?.rangeCount ? sel.getRangeAt(0) : null; } catch { }
        if (annoRangeUsable(cur, protyle)) return;
        const tr = (protyle as any)?.toolbar?.range as Range | null | undefined;
        if (!annoRangeUsable(tr, protyle)) return;
        sel?.removeAllRanges();
        sel?.addRange(tr);
    }

    /** 划词工具条批注钮显隐同步：内核只在工具条构建/插件装载时收项、划词渲染不重调，
     *  挂 document selectionchange 补态——显隐=批注总开关+入口开关+选区落在本编辑器。
     *  不用 fn__none：内核「条目可见性」设置同用 fn__none 管隐藏互写会打架（MindWire
     *  评审 P1-4）；style.display 独立通道，用户在外观设置里隐藏本钮后插件不再顶回 */
    private syncAnnoToolbar() {
        let selRange: Range | null = null;
        try { selRange = document.getSelection()?.getRangeAt(0) ?? null; } catch { }
        getAllEditor().forEach(({ protyle }) => {
            const btn = (protyle as any)?.toolbar?.element?.querySelector(
                `button[data-type="${CommentBox添加批注.langKey}"]`,
            ) as HTMLElement | null;
            if (!btn) return;
            const gates = commentBoxCheckbox.get() && commentBoxAnnoToolbar.get();
            btn.style.display = gates && annoRangeUsable(selRange, protyle) ? "" : "none";
        });
    }

    private onSelectionChange = () => this.syncAnnoToolbar();

    onunload() {
        document.removeEventListener("selectionchange", this.onSelectionChange);
    }

    private addDock() {
        const title = tomatoI18n.批注//`${tomatoI18n.批注}(${tomatoI18n.包含正反链})`
        this.plugin.addDock({
            type: DOCK_TYPE,
            config: {
                position: "RightBottom",
                size: { width: 200, height: 0 },
                icon: CommentBox添加批注.icon,
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
                unmount(commentBox.svelte);
            },
            init: (dock) => {
                const eleID = newID();
                if (events.isMobile) {
                    dock.element.innerHTML = `<div class="toolbar toolbar--border toolbar--dark">
                        <svg class="toolbar__icon"><use xlink:href="#iconQuote"></use></svg>
                            <div class="toolbar__text">${title}</div>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                } else {
                    dock.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
                        <div class="block__icons">
                            <div class="block__logo">
                                <svg class="block__logoicon"><use xlink:href="#iconQuote"></use></svg>${title}
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
