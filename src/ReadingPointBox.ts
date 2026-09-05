import { newID } from "stonev5-utils";
import { events, EventType } from "./libs/Events";
import { Dialog, Menu } from "siyuan";
import { mount, unmount } from "svelte";
import { currentDocReadingPoint, gotoBookmark, removeReadingPoint, setReadingPoint } from "./libs/bookmark";
import { siyuan } from "./libs/utils";
import { ClassActive } from "./libs/gconst";
import { readingAddDeleteMenu, readingAddJumpMenu, readingAddRPmenu, readingFloatBallHidden, readingFloatBar, readingPointBoxCheckbox, readingStatusBar, readingTopBar } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import ReadingPoint from "./ReadingPoint.svelte"
import ReadingPointBall from "./ReadingPointBall.svelte"
import { DestroyManager } from "./libs/destroyer";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";

// 阅读点翻新（readpoint 战役，spec：docs/tomato-reading-point-spec.md）：
// 新模型=原文块直挂 custom-tomato-readat 属性（每文档一个，任何块类型可设），数据层在 libs/bookmark.ts。
// rpfloatbar 战役（2026-09-05，spec：docs/tomato-reading-point-floatball-spec.md）：主交互面升级为
// 悬浮球（球↔条双态，ReadingPointBall.svelte）；顶栏/状态栏钮语义统一=toggle 球显隐（readingFloatBar
// 关时回退打开面板）；「最近在读」面板保留为完整面板（条上「面板」钮进入）。

export const ReadingPointBox设置阅读点 = winHotkey("F7", "addBookmark", "iconBookmark", () => tomatoI18n.设置阅读点)
export const ReadingPointBox跳到当前文档的阅读点 = winHotkey("alt+f5", "gotoBookmark", "iconForward", () => tomatoI18n.跳到当前文档的阅读点)
export const ReadingPointBox删除当前文档的阅读点 = winHotkey("⌘F7", "deleteBookmark", "iconTrashcan", () => tomatoI18n.删除当前文档的阅读点)
export const ReadingPointBox查看阅读点 = winHotkey("ctrl+shift+enter", "showBookmarks", "", () => tomatoI18n.查看阅读点)

class ReadingPointBox {
    private plugin: BaseTomatoPlugin;
    private statusEl: HTMLElement | null = null;
    /** 切文档异步竞态防护：await 归来时序号已变则丢弃（同一钮不显示旧文档状态） */
    private statusSeq = 0;
    /** click_editorcontent 时的光标块快照：状态栏/菜单点击会把 DOM 选区偷走（focus 移出编辑器），
     *  事后读 events.lastBlockID 已空——真实用户点钮设点必中招，故点编辑器时就记住 */
    private lastEditorBlockID = "";
    /** 页签条点击捕获监听引用（unload 摘除用） */
    private tabClickRef: (e: Event) => void = () => { };
    /** 悬浮球（rpfloatbar 战役）：dm 管监听+卸载，target=body 宿主 div，sv=mount 返回 exports（refreshDocState/collapse） */
    private ballDm: DestroyManager | null = null;
    private ballTarget: HTMLElement | null = null;
    private ballSv: any = null;

    /** □4 时序统一：index.async onload 已 await taskCfg（框架保序），双路竞态消化退役 */
    onload(plugin: BaseTomatoPlugin) {
        if (!readingPointBoxCheckbox.get()) {
            return;
        }
        this.plugin = plugin;

        if (readingTopBar.get()) {
            plugin.addTopBar({
                icon: "iconBookmark",
                title: tomatoI18n.阅读点,
                position: "left",
                callback: () => this.onEntryClick(),
            });
        }
        if (readingStatusBar.get()) {
            this.mountStatusBar();
        }
        if (readingFloatBar.get()) {
            this.mountBall();
        }
        plugin.eventBus.on("switch-protyle", () => {
            this.lastEditorBlockID = "";
            void this.refreshStatus();
        });
        // 初始加载补偿：?id= 直开的文档在插件 onload 前就发完了 switch-protyle（错过监听），
        // 文档加载完成必发 loaded-protyle-static（内核 onGet 无条件发射）——补一次刷新（rpfloatbar e2e 实锤）
        plugin.eventBus.on("loaded-protyle-static", () => void this.refreshStatus());
        plugin.eventBus.on(EventType.click_editorcontent, () => {
            const id = events.lastBlockID;
            if (id) this.lastEditorBlockID = id;
            // 编辑器活动≈文档上下文已切换（switch-protyle 只在 openFile 路径发，纯页签切换不发）
            void this.refreshStatus();
        });
        // 页签点击无专门事件（同窗口切换不发 switch-protyle）：捕获 window click，命中页签条即刷钮态
        this.tabClickRef = (e: Event) => {
            const t = e.target as HTMLElement;
            if (t?.closest?.(".layout-tab-bar")) void this.refreshStatus();
        };
        window.addEventListener("click", this.tabClickRef, true);

        plugin.addCommand({
            langKey: ReadingPointBox设置阅读点.langKey,
            langText: ReadingPointBox设置阅读点.langText(),
            hotkey: ReadingPointBox设置阅读点.m,
            callback: () => void this.addFromSelection(),
        });
        plugin.addCommand({
            langKey: ReadingPointBox查看阅读点.langKey,
            langText: ReadingPointBox查看阅读点.langText(),
            hotkey: ReadingPointBox查看阅读点.m,
            callback: () => this.showPanel(),
        });
        plugin.addCommand({
            langKey: ReadingPointBox跳到当前文档的阅读点.langKey,
            langText: ReadingPointBox跳到当前文档的阅读点.langText(),
            hotkey: ReadingPointBox跳到当前文档的阅读点.m,
            callback: () => void gotoBookmark(this.curDocID(), this.plugin),
        });
        plugin.addCommand({
            langKey: ReadingPointBox删除当前文档的阅读点.langKey,
            langText: ReadingPointBox删除当前文档的阅读点.langText(),
            hotkey: ReadingPointBox删除当前文档的阅读点.m,
            callback: () => void this.removeCurrent(),
        });

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            if (readingAddRPmenu.get()) {
                addIfVisible(menu, ReadingPointBox设置阅读点.langKey, {
                    label: ReadingPointBox设置阅读点.langText(),
                    icon: ReadingPointBox设置阅读点.icon,
                    accelerator: ReadingPointBox设置阅读点.m,
                    click: () => {
                        // 右键的是哪个块就设哪个（detail.element），不走选区解析
                        const blockID = detail?.element?.getAttribute("data-node-id") ?? "";
                        this.addReadPointLock(blockID);
                    },
                });
            }
            if (readingAddJumpMenu.get()) {
                addIfVisible(menu, ReadingPointBox跳到当前文档的阅读点.langKey, {
                    label: ReadingPointBox跳到当前文档的阅读点.langText(),
                    icon: ReadingPointBox跳到当前文档的阅读点.icon,
                    accelerator: ReadingPointBox跳到当前文档的阅读点.m,
                    click: () => {
                        void gotoBookmark(this.curDocID(), this.plugin);
                    },
                });
            }
            if (readingAddDeleteMenu.get()) {
                addIfVisible(menu, ReadingPointBox删除当前文档的阅读点.langKey, {
                    label: ReadingPointBox删除当前文档的阅读点.langText(),
                    icon: ReadingPointBox删除当前文档的阅读点.icon,
                    accelerator: ReadingPointBox删除当前文档的阅读点.m,
                    click: () => {
                        void this.removeCurrent();
                    },
                });
            }
        });
    }

    blockIconEvent(detail: any) {
        if (!readingPointBoxCheckbox.get()) return;
        if (readingAddRPmenu.get()) {
            addIfVisible(detail.menu, ReadingPointBox设置阅读点.langKey, {
                label: ReadingPointBox设置阅读点.langText(),
                icon: ReadingPointBox设置阅读点.icon,
                accelerator: ReadingPointBox设置阅读点.m,
                click: () => {
                    for (const element of detail.blockElements) {
                        const blockID = element.getAttribute("data-node-id");
                        if (blockID) {
                            this.addReadPointLock(blockID);
                            break;
                        }
                    }
                },
            });
        }
        if (readingAddJumpMenu.get()) {
            addIfVisible(detail.menu, ReadingPointBox跳到当前文档的阅读点.langKey, {
                label: ReadingPointBox跳到当前文档的阅读点.langText(),
                icon: ReadingPointBox跳到当前文档的阅读点.icon,
                accelerator: ReadingPointBox跳到当前文档的阅读点.m,
                click: () => {
                    void gotoBookmark(this.curDocID(), this.plugin);
                },
            });
        }
    }

    unload() {
        window.removeEventListener("click", this.tabClickRef, true);
        this.ballDm?.destroyBy();
        this.ballDm = null;
        const el = this.statusEl;
        if (!el) return;
        // SiYuan addStatusBar 只 push 不移除，同步摘掉防 detached 节点（带 listener）驻留内存（番茄钟先例）
        el.remove();
        const arr = (this.plugin as any)?.statusBarIcons as Element[];
        const i = arr?.indexOf(el) ?? -1;
        if (i >= 0) arr.splice(i, 1);
        this.statusEl = null;
    }

    /** 外部入口（DailyNote 复制顺手设点/渐进摘抄设点）：签名保持兼容，div 参数已不消费（摘录改从 SQL 取） */
    addReadPointLock(blockID = "", _div?: HTMLElement) {
        navigator.locks.request("AddReadingPointLock2026-09-05", { ifAvailable: true }, async (lock) => {
            try {
                if (!lock) {
                    siyuan.pushMsg(tomatoI18n.请等待上个操作完成);
                    return;
                }
                if (!blockID) blockID = await this.resolveTargetBlockID();
                if (!blockID) {
                    siyuan.pushMsg(tomatoI18n.请先点击一个内容块);
                    return;
                }
                const ok = await setReadingPoint(blockID);
                await siyuan.pushMsg(ok ? tomatoI18n.已设置阅读点 : tomatoI18n.docNotFound, 2000);
                this.refreshStatusAfterWrite();
            } catch (e) {
                // UI 动作永不静默崩：锁回调里的 rejection 无人接，必须自己兜住上 console
                console.error("[tomato][rp] addReadPointLock:", e);
            }
        });
    }

    /** 当前文档 ID：DOM 直查激活窗口的可见编辑器优先（:not(.fn__none) 滤隐藏页签）——events.docID
     *  依赖 switch-protyle 的 detail.event 门槛、reload/页签切换后常陈旧（e2e 实锤），只作兜底 */
    private curDocID(): string {
        const el = document.querySelector(`.${ClassActive} .protyle:not(.fn__none) .protyle-title[data-node-id]`)
            ?? document.querySelector(".protyle:not(.fn__none) .protyle-title[data-node-id]");
        const id = el?.getAttribute("data-node-id");
        if (id) return id;
        return events.docID;
    }

    /** 设点目标解析：选区第一块 → 编辑器光标块快照（选区被 UI 点击偷走后仍可用）→ 视口首个可见块 */
    private async resolveTargetBlockID(): Promise<string> {
        // selectedDivs 在 events.protyle 为空时（插件 reload 后未再切文档）走 {} 早退分支，须防 undefined
        const { ids } = (await events.selectedDivs()) ?? {};
        if (ids?.length) return ids[0];
        if (this.lastEditorBlockID) return this.lastEditorBlockID;
        return this.firstVisibleBlockID();
    }

    /** 兜底：无选区无光标快照时取视口内首个可见内容块（「我正读到这」的滚动位置语义）；
     *  events.protyle 同样受 reload 空态影响，DOM 直查激活窗口兜底 */
    private firstVisibleBlockID(): string {
        const fromState = (events.protyle as any)?.protyle?.wysiwyg?.element as HTMLElement | undefined;
        const wysiwyg = fromState
            ?? ([...document.querySelectorAll(".layout__wnd--active .protyle-wysiwyg")] as HTMLElement[])
                .find(w => w.getBoundingClientRect().height > 0);
        if (!wysiwyg) return "";
        const top = wysiwyg.getBoundingClientRect().top;
        for (const child of wysiwyg.children) {
            const el = child as HTMLElement;
            const id = el.getAttribute("data-node-id");
            if (!id) continue;
            if (el.getBoundingClientRect().bottom > top + 8) return id;
        }
        return "";
    }

    /** 命令/状态栏菜单入口 */
    private addFromSelection() {
        this.addReadPointLock();
    }

    private async removeCurrent() {
        try {
            await removeReadingPoint(this.curDocID());
            await siyuan.pushMsg(tomatoI18n.已删除阅读点, 2000);
            this.refreshStatusAfterWrite();
        } catch (e) {
            // actions.del 的 void 吞 rejection，UI 动作永不静默崩（addReadPointLock 同款纪律）
            console.error("[tomato][rp] removeCurrent:", e);
        }
    }

    // ---------------- 状态栏指示钮 ----------------

    private mountStatusBar() {
        const el = document.createElement("div");
        el.className = "toolbar__item ariaLabel";
        el.id = "tomato-rp-status";
        el.innerHTML = `<svg><use xlink:href="#iconBookmark"></use></svg>`;
        el.addEventListener("click", () => void this.onStatusClick());
        el.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openStatusMenu(e);
        });
        // 移动端长按开菜单（pointerType=mouse 走 contextmenu 不走此通道，渐进舰队书卡先例）
        let lpTimer = 0;
        const lpClear = () => {
            if (lpTimer) {
                clearTimeout(lpTimer);
                lpTimer = 0;
            }
        };
        el.addEventListener("pointerdown", (e) => {
            if (e.pointerType === "mouse") return;
            lpTimer = window.setTimeout(() => {
                lpTimer = 0;
                this.openStatusMenu(e);
            }, 500);
        });
        ["pointerup", "pointercancel", "pointermove"].forEach(t => el.addEventListener(t, lpClear));
        this.plugin.addStatusBar({ element: el, position: "left" });
        this.statusEl = el;
        void this.refreshStatus();
    }

    /** 顶栏/状态栏入口统一语义：readingFloatBar 开→toggle 球显隐；关→回退打开面板 */
    private onEntryClick() {
        if (readingFloatBar.get() && this.ballSv) {
            void this.toggleBall();
        } else {
            this.showPanel();
        }
    }

    /** 单击状态栏钮=入口统一语义（原双态跳/设已由悬浮球承接） */
    private async onStatusClick() {
        this.onEntryClick();
    }

    /** 设/删点后的多刷：写后立即查可能仍读到旧 attributes（内核 SQL 写读延迟窗口秒级且
     *  波动，e2e 实锤两个方向：设点后读到空=球半暗假象、删点后读到旧值=球亮着假象）——
     *  0/1.2s/3s 三段补刷；期间任何事件刷新以 seq 竞态丢弃旧结果，无叠加副作用 */
    private refreshStatusAfterWrite() {
        void this.refreshStatus();
        setTimeout(() => void this.refreshStatus(), 1200);
        setTimeout(() => void this.refreshStatus(), 3000);
    }

    private async refreshStatus() {
        const seq = ++this.statusSeq;
        const cur = await currentDocReadingPoint(this.curDocID());
        if (seq !== this.statusSeq) return;
        // 球：推送当前文档点态（mount 返回 exports，AGENTS 踩坑表语义）
        this.ballSv?.refreshDocState?.(cur);
        // 状态栏钮：开关语义反馈——球在场=点亮，球隐藏=半暗（点态指示已由球本体承接）
        const el = this.statusEl;
        if (el) {
            const ballOn = readingFloatBar.get() && !readingFloatBallHidden.get();
            el.style.opacity = ballOn ? "" : "0.4";
            el.style.color = ballOn ? "var(--b3-theme-primary)" : "";
            el.setAttribute("aria-label", ballOn ? tomatoI18n.隐藏悬浮球 : tomatoI18n.显示悬浮球);
        }
    }

    /** 状态栏钮右键/长按菜单：independent 第三参防 click 冒泡单例坑（AGENTS 踩坑表，openBookMenu 同款） */
    private openStatusMenu(ev: { clientX: number, clientY: number }) {
        const menu = new (Menu as any)("tomatoRpStatusMenu", undefined, true) as Menu;
        if (readingFloatBar.get() && this.ballSv) {
            menu.addItem({
                label: readingFloatBallHidden.get() ? tomatoI18n.显示悬浮球 : tomatoI18n.隐藏悬浮球,
                icon: "iconEyeoff",
                click: () => void this.toggleBall(),
            });
        }
        menu.addItem({
            label: ReadingPointBox查看阅读点.langText(),
            click: () => this.showPanel(),
        });
        setTimeout(() => menu.open({
            x: ev.clientX > 0 ? ev.clientX : innerWidth / 2,
            y: ev.clientY > 0 ? ev.clientY : innerHeight / 2,
        }), 0);
    }

    // ---------------- 悬浮球（rpfloatbar 战役） ----------------

    private mountBall() {
        if (this.ballSv) return;
        this.ballDm = new DestroyManager();
        this.ballTarget = document.body.appendChild(document.createElement("div"));
        this.ballTarget.id = "tomato-rp-fball";
        this.ballSv = mount(ReadingPointBall, {
            target: this.ballTarget,
            props: {
                plugin: this.plugin,
                dm: this.ballDm,
                actions: {
                    setPoint: () => this.addFromSelection(),
                    jump: () => void gotoBookmark(this.curDocID(), this.plugin),
                    del: () => void this.removeCurrent(),
                    panel: () => this.showPanel(),
                    hide: () => void this.toggleBall(),
                    openMenu: (x: number, y: number) => this.openBallMenu(x, y),
                },
            },
        });
        // Svelte 5 mount 返回 exports，卸载一律 unmount 正轨（AGENTS 踩坑表）
        this.ballDm.add("sv", () => { unmount(this.ballSv); this.ballSv = null; });
        this.ballDm.add("div", () => { this.ballTarget?.remove(); this.ballTarget = null; });
        this.applyBallHidden();
        void this.refreshStatus();
    }

    private applyBallHidden() {
        if (this.ballTarget) this.ballTarget.style.display = readingFloatBallHidden.get() ? "none" : "";
    }

    /** toggle 球显隐（顶栏/状态栏/球菜单三入口同源）；display 切换保留实例，监听不重建 */
    private async toggleBall() {
        const next = !readingFloatBallHidden.get();
        readingFloatBallHidden.set(next);
        await readingFloatBallHidden.write();
        this.applyBallHidden();
        this.ballSv?.collapse?.();
        void this.refreshStatus();
        await siyuan.pushMsg(next ? tomatoI18n.已隐藏悬浮球 : tomatoI18n.已显示悬浮球, 1500);
    }

    /** 球右键/长按菜单（ReadingBallHelper 经组件 actions 转发；independent 第三参防单例坑） */
    private openBallMenu(x: number, y: number) {
        const menu = new (Menu as any)("tomatoRpBallMenu", undefined, true) as Menu;
        menu.addItem({
            label: ReadingPointBox设置阅读点.langText(),
            icon: ReadingPointBox设置阅读点.icon,
            click: () => void this.addFromSelection(),
        });
        menu.addItem({
            label: ReadingPointBox跳到当前文档的阅读点.langText(),
            icon: ReadingPointBox跳到当前文档的阅读点.icon,
            click: () => void gotoBookmark(this.curDocID(), this.plugin),
        });
        menu.addItem({
            label: ReadingPointBox删除当前文档的阅读点.langText(),
            icon: ReadingPointBox删除当前文档的阅读点.icon,
            click: () => void this.removeCurrent(),
        });
        menu.addItem({
            label: ReadingPointBox查看阅读点.langText(),
            click: () => this.showPanel(),
        });
        menu.addItem({
            label: tomatoI18n.隐藏悬浮球,
            icon: "iconEyeoff",
            click: () => void this.toggleBall(),
        });
        setTimeout(() => menu.open({
            x: x > 0 ? x : innerWidth / 2,
            y: y > 0 ? y : innerHeight / 2,
        }), 0);
    }

    // ---------------- 「最近在读」面板 ----------------

    private showPanel() {
        const dm = new DestroyManager();
        const id = newID();
        // 高度不传=内容自适应（思源 Dialog auto 撑开），面板内 max-height 兜底长列表
        const dialog = new Dialog({
            title: tomatoI18n.最近在读,
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "92vw" : "640px",
            destroyCallback: () => dm.destroyBy("1"),
        });
        const target = dialog.element.querySelector("#" + id) as HTMLElement;
        const app = mount(ReadingPoint, {
            target,
            props: {
                plugin: this.plugin,
                dm,
                hotkey: ReadingPointBox设置阅读点.m || "F7",
            },
        });
        dm.add("1", () => { dialog.destroy() });
        // Svelte 5 mount 返回 exports，组件级收尾一律 unmount（AGENTS 踩坑表）
        dm.add("2", () => { unmount(app) });
    }
}

export const readingPointBox = new ReadingPointBox();
