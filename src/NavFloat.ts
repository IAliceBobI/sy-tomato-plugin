// 十字罗盘导航宿主（navcompass 2026-10-11）：第四悬浮球+点球变身的十字 D-pad 罗盘。
// 设计事实源 docs/checkpoints/2026-10-10-nav-compass-floatball.md——双端真悬浮球（手机
// 端优先）、球↔罗盘变身（同屏只显示一个，progressive 浮条先例）、位置共享同一 lsKey。
// 与悬浮反链/悬浮图两球的防遮挡：defPos 垂直错开（右侧球列 0.4/0.55/0.7 三档，
// graphfloat P1-3 教训）+ 让位机制接入第四球——观察既有 .tomato-bk-float-panel 的
// class/style 变化（开合/拖动），球记忆位压面板矩形时按 BkFloat applyBallNudge 同款
// 上→左→右→下择路临时偏移（只叠加渲染不写记忆位，拖球即吸收归位）。
// 手机礼仪（spec 拍板 12）：球默认右下拇指区；ballHost/罗盘 touchmove 拦截=阻断滚动
// 链与思源左右滑切页签；官方 mobile-keyboard 事件弹出隐藏球+罗盘、收起恢复；长按球
// 0.5s 直达本功能设置域（桌面端不设长按）。
// 打开文档分端（spec 拍板 13）：手机 openMobileFileById；桌面 openTab+removeCurrentTab
// 替换当前页签（浏览心智，不新开页签）+noFocusAfterOpen 禁聚焦善后（navUtils 全仓政策）。
import { mount, unmount } from "svelte";
import { writable } from "svelte/store";
import BkFloatBall from "./BkFloatBall.svelte";
import NavCompass from "./NavCompass.svelte";
import { getActiveEditor, getActiveTab, openMobileFileById, openTab, type Tab, type TProtyleAction } from "siyuan";
import { events, EventType } from "./libs/Events";
import { nav_compass_desktop, nav_compass_mobile, nav_compass_scheme } from "./libs/stores";
import { siyuan } from "./libs/utils";
import { gatedAddCommand } from "./libs/cmdGate";
import { winHotkey } from "./libs/winHotkey";
import { noFocusAfterOpen } from "./libs/navUtils";
import { getNavTree, invalidateNavCache, navTargetOf, type NavDir, type NavDocTarget, type NavTree } from "./libs/navTree";
import { tomatoI18n } from "./tomatoI18n";
import { debugLog } from "./libs/logUtils";
import type { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

/** 四方向桌面快捷键（spec 拍板 10：Ctrl+Alt+方向，避开思源内置 ⌘↑/⌘↓ 块折叠）。
 *  ⚠↑ 唯一例外=Ctrl+Alt+Shift+↑（2026-10-11 撞键实证修正，bear 裁定执行拍板意图）：
 *  Ctrl+Alt+↑（=⌥⌘↑）撞官方 editor.general.foldRecursive 默认键（constants.ts:555，
 *  wysiwyg/keydown.ts:692 编辑器内先消费+stopPropagation→罗盘向上恒死键），官方 ↑ 族
 *  四组合全占而 ⌥⇧⌘↑ 双通道查重空闲（constants.ts 全文+四插件仓）；未发版零迁移成本。
 *  勿以「统一四方向修饰键」为由改回 Ctrl+Alt+↑——那是出厂死键。←/→/↓ 三个维持
 *  Ctrl+Alt+方向（官方+四插件双通道均空闲）。
 *  ⚠↓ 已知第三方冲突（2026-10-11 视觉轮 e2e 实证，bear 裁定容忍不改键）：⌥⌘↓ 官方
 *  与四插件仓均空闲，但装了第三方 sy-plugin-enhance 的实例上其 En_DailyNote_GoNext
 *  同占 ⌥⌘↓，内核命令分发按插件加载序首匹配（keydown.ts:1868-1874）→ 该环境 ↓ 快捷
 *  键失效（罗盘点键通道不受影响），用户可在设置键帽改键。性质=第三方合法占空闲组合
 *  （非我方默认选错），为单一第三方改默认无原则性终点（winHotkey 跨插件同键「撞键
 *  容忍」⌥⇧⌘H 双绑在案先例）。 */
export const NavCompassUpHK = winHotkey("ctrl+alt+shift+up", "tomatoNavCompassUp", "iconUp", () => tomatoI18n.罗盘向上导航);
export const NavCompassDownHK = winHotkey("ctrl+alt+down", "tomatoNavCompassDown", "iconDown", () => tomatoI18n.罗盘向下导航);
export const NavCompassLeftHK = winHotkey("ctrl+alt+left", "tomatoNavCompassLeft", "iconLeft", () => tomatoI18n.罗盘向左导航);
export const NavCompassRightHK = winHotkey("ctrl+alt+right", "tomatoNavCompassRight", "iconRight", () => tomatoI18n.罗盘向右导航);

const NAV_HKS = [
    { dir: "up" as const, hk: NavCompassUpHK },
    { dir: "down" as const, hk: NavCompassDownHK },
    { dir: "left" as const, hk: NavCompassLeftHK },
    { dir: "right" as const, hk: NavCompassRightHK },
];

/** 位置记忆键：球与罗盘共享（变身前后同一落点；spec 拍板 4） */
const LS_BALL_POS = "tomato-navcompass-ball-pos";

const LONG_PRESS_MS = 500;

export class NavFloatBox {
    private plugin: BaseTomatoPlugin;
    /** 代际闸：unload 后 in-flight async（getNavTree/openTab await 归来）一律早退 */
    private alive = false;
    /** 端别：live 读（events.isMobile 在 events.onload 才定值，本类模块级单例构造在先——
     *  构造期快照会恒 false；bkFloatOn()/graphfloat 同为调用期读） */
    private get isMobile(): boolean {
        return events.isMobile;
    }

    private ballHost: HTMLElement = null;
    private compassHost: HTMLElement = null;
    private ballSv: ReturnType<typeof mount> = null;
    /** NavCompass 导出面（refresh(docID?) 供外部导航/文档切换后追平） */
    private compassSv: { refresh?: (docID?: string) => Promise<void> } | null = null;

    // 外部响应式状态：mount() 后经 writable store 下发组件（Svelte 5 外部更新正轨）
    private zeroCount = writable(0); // 罗盘球无徽标（恒 0=徽标隐藏）
    private ballHiddenStore = writable(false);
    private compassHiddenStore = writable(false);
    private ballShiftStore = writable<{ x: number; y: number } | null>(null);
    /** shift 镜像（渲染位−记忆位）：nudge 重算时反推记忆基准位用（BkFloat 同款） */
    private lastShift: { x: number; y: number } | null = null;

    private compassOpen = false;
    /** 手机长按球触发后吞掉随后的球 toggle（长按≠点击） */
    private suppressToggle = false;
    private longPressTimer: ReturnType<typeof setTimeout> | null = null;
    /** 长按武装期 window 三监听拆卸句柄（unload 兜底：武装窗口内被卸载不残留） */
    private lpDisarm: (() => void) | null = null;
    /** 既有悬浮面板（反链/图）开合拖动观察：触发本球让位重算 */
    private panelObserver: MutationObserver | null = null;
    private kbOff: (() => void) | null = null;
    /** 当前文档锚点（事件跟随维护，GraphFloatBox.curDocID 同款）：桌面端 events.docID
     *  只随 click-editorcontent 更新（Events.ts:167 要求 detail.event，而内核 switch-protyle
     *  [editor/util.ts:685] 与 loaded-protyle-static [onGet.ts:476] 的 detail 均无 event
     *  字段——切页签/新开文档不点编辑器时恒陈旧），罗盘与快捷键取数一律走 currentDocID() */
    private curDocID = "";
    /** 罗盘当前展示的文档（openCompass/导航成功/外部切换刷新时同步）——事件刷新去重用 */
    private compassDocID = "";

    /** 数据基点三级兜底：事件跟随值 → events.docID（点击更新链）→ getActiveEditor 现查
     *  （Events.currentProtyle 同形：tracked 先、live 兜底）。手机端 events.docID 恒新
     *  （isMobile 分支无 event 要求），本链两端皆正确 */
    private currentDocID(): string {
        return this.curDocID
            || events.docID
            || getActiveEditor()?.protyle?.block?.rootID
            || "";
    }

    /** 挂载决策（分端总开关，onload 读死=结构性键）：桌面/手机独立默认开 */
    static on(): boolean {
        return events.isMobile ? nav_compass_mobile.get() : nav_compass_desktop.get();
    }

    async onload(plugin: BaseTomatoPlugin) {
        this.plugin = plugin;
        this.alive = true;
        this.ballHost = document.body.appendChild(document.createElement("div"));
        this.compassHost = document.body.appendChild(document.createElement("div"));
        this.mountBall();

        // 桌面四方向快捷键（spec 拍板 10；gatedAddCommand=命令面板+keymap 条目+可改键）
        if (!this.isMobile) {
            for (const { dir, hk } of NAV_HKS) {
                gatedAddCommand(this.plugin, hk.langKey, {
                    langText: hk.langText(),
                    hotkey: hk.m,
                    callback: () => void this.navigateDir(dir),
                });
            }
        } else {
            this.setupMobileEtiquette();
        }

        // 文档跟随（GraphFloatBox 同款）：三级事件 last-wins 维护 curDocID 锚点（罗盘关着
        // 也维护——点球瞬间取到的一手基点）；罗盘开着期间外部切文档（点页签/其他入口）
        // → 与罗盘当前展示不同才刷新（同 doc 的 loaded 重载不空脉冲，数据层轻缓存外再省一跳 UI）
        events.addListener("NavFloat-compass-2026-10-11", (eventType, detail) => {
            if (!this.alive) return;
            if (eventType != EventType.switch_protyle
                && eventType != EventType.loaded_protyle_static
                && eventType != EventType.loaded_protyle_dynamic) return;
            const docID = detail?.protyle?.block?.rootID;
            if (!docID) return;
            this.curDocID = docID;
            if (this.compassOpen && docID !== this.compassDocID) {
                this.compassDocID = docID;
                void this.compassSv?.refresh?.(docID);
            }
        });

        this.watchFloatPanels();
        debugLog("navcompass", `onload mobile=${this.isMobile}`, "nav");
    }

    // ---- 球↔罗盘变身（同屏只显示一个；spec 拍板 4） ----

    private defPos(): { x: number; y: number } {
        if (this.isMobile) {
            // 右下拇指区（spec 拍板 12）：右缘 14px、下方 78% 高——避开底部键盘工具行
            return { x: window.innerWidth - 36 - 14, y: Math.round(window.innerHeight * 0.78) };
        }
        // 桌面：右侧球列第三档（悬浮反链 0.4 / 悬浮图 0.55 / 罗盘 0.7），避开右侧 dock 条 48px
        return { x: window.innerWidth - 36 - 48, y: Math.round(window.innerHeight * 0.7) };
    }

    private onBallToggle() {
        if (this.suppressToggle) {
            this.suppressToggle = false;
            return;
        }
        this.openCompass();
    }

    private mountBall() {
        if (this.ballSv || !this.ballHost) return;
        this.ballSv = mount(BkFloatBall, {
            target: this.ballHost,
            props: {
                count: this.zeroCount,
                hidden: this.ballHiddenStore,
                onToggle: () => this.onBallToggle(),
                panelKeyHint: () => "",
                shift: this.ballShiftStore,
                onShiftAbsorbed: () => this.setShift(null),
                lsKey: LS_BALL_POS,
                ballIcon: "Files", // 文件树同款（内核 sprite 实有，方向导航文档树语义）
                tip: tomatoI18n.展开或收起十字罗盘,
                defPos: () => this.defPos(),
            },
        });
        this.applyBallNudge();
    }

    private unmountBall() {
        if (!this.ballSv) return;
        unmount(this.ballSv);
        this.ballSv = null;
        // 球卸载后 shift store 里可能残留偏移——归零防下次挂载吃到陈旧偏移
        this.setShift(null);
    }

    private openCompass() {
        if (!this.alive || this.compassOpen) return;
        this.compassOpen = true;
        this.unmountBall(); // 变身：球隐藏（同屏只一个），罗盘接管共享落点
        this.compassDocID = this.currentDocID();
        this.compassSv = mount(NavCompass, {
            target: this.compassHost,
            props: {
                lsKey: LS_BALL_POS,
                defPos: () => this.defPos(),
                mobile: this.isMobile,
                hidden: this.compassHiddenStore,
                // 数据基点统一宿主供给（三级兜底，见 currentDocID 注）——组件不直读
                // events.docID（桌面端陈旧坑）
                getDocID: () => this.currentDocID(),
                onNavigate: async (t: NavDocTarget) => {
                    const ok = await this.navigate(t);
                    if (ok) this.compassDocID = t.id; // 组件内跳转的展示基准同步（事件刷新去重）
                    return ok;
                },
                onCollapse: () => this.closeCompass(),
            },
        }) as { refresh?: (docID?: string) => Promise<void> };
        debugLog("navcompass", `compass open doc=${this.compassDocID || "?"}`, "nav");
    }

    private closeCompass() {
        if (!this.compassOpen) return;
        this.compassOpen = false;
        if (this.compassSv) {
            unmount(this.compassSv as object);
            this.compassSv = null;
        }
        // 重挂=重读共享 lsKey（罗盘拖动后的新位置即球的新位置）+让位重算
        this.mountBall();
        debugLog("navcompass", "compass close", "nav");
    }

    // ---- 让位机制接入第四球（BkFloat applyBallNudge 同款，观察对象=既有两面板） ----

    private setShift(v: { x: number; y: number } | null) {
        this.lastShift = v;
        this.ballShiftStore.set(v);
    }

    /** 观察 .tomato-bk-float-panel（悬浮反链+悬浮图共用壳，onload 期即挂 DOM 常驻
     *  开合）的 class/style 变化——它们开合/拖动落定即重算本球让位。两壳挂载在
     *  NavFloat 之前（boxStep 链 graph→backLinkBottom→navcompass），一次性观察成立 */
    private watchFloatPanels() {
        const panels = Array.from(document.querySelectorAll<HTMLElement>(".tomato-bk-float-panel"));
        if (!panels.length) return;
        this.panelObserver = new MutationObserver(() => this.applyBallNudge());
        for (const p of panels) {
            this.panelObserver.observe(p, { attributes: true, attributeFilter: ["class", "style"] });
        }
    }

    /** 球记忆位压任一可见悬浮面板矩形时临时让位（上→左→右→下择路，GAP 8；只叠加
     *  渲染不写记忆位，拖球/面板移开即归位）。全无空间=保持原位（球恒压上层可点） */
    private applyBallNudge() {
        requestAnimationFrame(() => {
            if (!this.alive) return;
            const ball = this.ballHost?.querySelector<HTMLElement>(".tomato-bk-float-ball");
            if (!ball) {
                this.setShift(null);
                return;
            }
            const b = ball.getBoundingClientRect();
            const s = this.lastShift ?? { x: 0, y: 0 };
            const base = {
                left: b.left - s.x,
                top: b.top - s.y,
                right: b.right - s.x,
                bottom: b.bottom - s.y,
            };
            const panels = Array.from(document.querySelectorAll<HTMLElement>(".tomato-bk-float-panel"))
                .filter(p => p.offsetWidth > 0 && p.offsetHeight > 0);
            let target: { x: number; y: number } | null = null;
            const GAP = 8;
            for (const p of panels) {
                const pr = p.getBoundingClientRect();
                const hit = base.left < pr.right && base.right > pr.left && base.top < pr.bottom && base.bottom > pr.top;
                if (!hit) continue;
                target =
                    pr.top - GAP - b.height >= 0 ? { x: 0, y: pr.top - GAP - b.height - base.top } :
                    pr.left - GAP - b.width >= 0 ? { x: pr.left - GAP - b.width - base.left, y: 0 } :
                    pr.right + GAP + b.width <= window.innerWidth ? { x: pr.right + GAP - base.left, y: 0 } :
                    pr.bottom + GAP + b.height <= window.innerHeight ? { x: 0, y: pr.bottom + GAP - b.height - base.top } :
                    null;
                if (target) break; // 首个能腾出的面板为准（多面板同压=低频形态不精算）
            }
            this.setShift(target);
        });
    }

    // ---- 手机礼仪（spec 拍板 12） ----

    private setupMobileEtiquette() {
        // touchmove 拦截挂 ballHost（BkFloatBall 不改动，宿主容器层断滚动链+左右滑
        // 切页签——内核 touch 处理挂 document 冒泡，元素级 stopPropagation 先到；
        // touchstart 不 preventDefault：吞了合成 click 球就点不动了）
        const stopProp = (e: Event) => e.stopPropagation();
        const blockMove = (e: TouchEvent) => {
            e.stopPropagation();
            if (e.cancelable) e.preventDefault();
        };
        this.ballHost.addEventListener("touchstart", stopProp);
        this.ballHost.addEventListener("touchmove", blockMove, { passive: false });

        // 长按球 0.5s=直达本功能设置域（spec 拍板 12；桌面不设）。取消三监听挂 window
        // 且仅武装期在场（BkFloatBall 拖拽监听同款瞬时模式）：挂 ballHost 会漏「up 落在
        // 元素外」的指针（边缘起手 <5px 滑出球面：up 目标是页面内容、不冒泡经 ballHost）
        // ——计时器不清、500ms 后纯轻点误开设置（视觉 r2 复验实锤）；window 级挂载对
        // 任意 up 目标恒达（含 e2e 直派 window 的合成 up）
        let pid = -1;
        let sx = 0;
        let sy = 0;
        const clearLP = () => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
            disarmLP();
        };
        const lpMove = (e: PointerEvent) => {
            if (this.longPressTimer == null || e.pointerId !== pid) return;
            const dx = e.clientX - sx;
            const dy = e.clientY - sy;
            if (dx * dx + dy * dy >= 25) clearLP(); // 越阈=用户在拖球，取消长按
        };
        const lpUp = (e: PointerEvent) => {
            if (e.pointerId !== pid) return;
            clearLP();
        };
        const disarmLP = () => {
            window.removeEventListener("pointermove", lpMove);
            window.removeEventListener("pointerup", lpUp);
            window.removeEventListener("pointercancel", lpUp);
        };
        this.lpDisarm = disarmLP;
        this.ballHost.addEventListener("pointerdown", (e) => {
            if (e.button !== 0) return;
            pid = e.pointerId;
            sx = e.clientX;
            sy = e.clientY;
            clearLP();
            this.longPressTimer = setTimeout(() => {
                this.longPressTimer = null;
                disarmLP();
                this.suppressToggle = true; // 吞掉随后的球 toggle（长按≠点击）
                this.openNavSettings();
            }, LONG_PRESS_MS);
            window.addEventListener("pointermove", lpMove);
            window.addEventListener("pointerup", lpUp);
            window.addEventListener("pointercancel", lpUp);
        });

        // 官方 mobile-keyboard 事件（app/src/types/index.d.ts:115）：弹出隐藏球+罗盘、
        // 收起恢复。球走 hidden store（保挂载不失位置态）；罗盘走 hidden store（保开态，
        // 收起键盘自动回来）
        const onShow = () => {
            if (!this.alive) return;
            this.ballHiddenStore.set(true);
            this.compassHiddenStore.set(true);
            debugLog("navcompass", "mobile keyboard show → hide", "nav");
        };
        const onHide = () => {
            if (!this.alive) return;
            this.ballHiddenStore.set(false);
            this.compassHiddenStore.set(false);
        };
        this.plugin.eventBus.on("mobile-keyboard-show", onShow);
        this.plugin.eventBus.on("mobile-keyboard-hide", onHide);
        this.kbOff = () => {
            this.plugin.eventBus.off("mobile-keyboard-show", onShow);
            this.plugin.eventBus.off("mobile-keyboard-hide", onHide);
        };
    }

    private openNavSettings() {
        // 宿主容器长按已吞球点击；直达=预选本功能设置域+开设置面板（index.ts 公开面）
        (this.plugin as any).openNavCompassSettings?.();
        debugLog("navcompass", "long-press → settings", "nav");
    }

    // ---- 导航（spec 拍板 7/13：替换当前页签/手机 openMobileFileById） ----

    /** 流派解析（运行时逐次读 nav_compass_scheme=设置热切即时生效；映射本体=纯函数
     *  navTargetOf 单测锁死） */
    private targetOf(tree: NavTree, dir: NavDir): NavDocTarget | null {
        return navTargetOf(tree, nav_compass_scheme.get(), dir);
    }

    /** 快捷键通道（罗盘未开也可用）：现拉（有轻缓存）+流派解析+跳转；罗盘开着则追平刷新。
     *  基点走 currentDocID()（桌面端 events.docID 点击链陈旧坑，见字段注） */
    private async navigateDir(dir: NavDir) {
        if (!this.alive) return;
        const docID = this.currentDocID();
        if (!docID) return;
        const tree = await getNavTree(docID);
        if (!this.alive || !tree) return;
        const target = this.targetOf(tree, dir);
        if (!target) return;
        const ok = await this.navigate(target);
        if (ok && this.compassOpen) {
            this.compassDocID = target.id;
            void this.compassSv?.refresh?.(target.id);
        }
    }

    /** 分端打开；成功=失效轻缓存（spec 数据层节）。返回 false=打开失败（调用方 toast+重拉） */
    private async navigate(target: NavDocTarget): Promise<boolean> {
        debugLog("navcompass", `navigate → ${target.id} "${target.name}"`, "nav");
        if (this.isMobile) {
            try {
                openMobileFileById(this.plugin.app, target.id, ["cb-get-context"] as TProtyleAction[]);
                invalidateNavCache();
                return true; // mobile 通道无失败回执
            } catch (e) {
                debugLog("navcompass", `openMobileFileById failed: ${e}`, "nav");
                siyuan.pushMsg(tomatoI18n.罗盘目标已失效);
                return false;
            }
        }
        try {
            // 替换当前页签（spec 拍板 7）双保险：①removeCurrentTab 只在内核设置「在当前
            // 页签打开文件」开启时兑现（editor/util.ts:358-374，关闭时走 else 纯 addTab
            // ——2026-10-11 视觉轮 e2e 实证默认配置下每次导航涨一签）；②插件侧兜底=记录
            // 跳转前活动签（getActiveTab 官方 API=活动窗焦点签），开签后旧签非同签且未
            // 钉住则 close 之（Tab.close→Wnd.removeTab 原生通道；钉住签跳过=内核自身
            // 复用排除 item--pin 同语义，钉住=用户要留）
            const fromTab: Tab | undefined = getActiveTab();
            const fromID = fromTab?.id ?? "";
            const fromPinned = !!fromTab?.headElement?.classList?.contains("item--pin");
            const tab = await openTab({
                app: this.plugin.app,
                doc: { id: target.id, action: ["cb-get-context", "cb-get-hl"] as TProtyleAction[], zoomIn: false },
                removeCurrentTab: true,
                afterOpen: noFocusAfterOpen(),
            });
            if (!tab) {
                // openFileById 对已删/不可用块静默返 void（editor/util.ts:70-85）——罗盘
                // 数据陈旧的信号：toast+返 false 让组件自动重拉（spec 错误处理节）
                siyuan.pushMsg(tomatoI18n.罗盘目标已失效);
                return false;
            }
            if (fromID && tab.id !== fromID) {
                // 同签=文档已在当前签打开（switchTab 复用）；内核原位复用分支（设置开）
                // 旧签已被内核移除，close 亦安全（Tab 实例仍持 parent）——此处只兜 addTab 路径
                if (fromPinned) {
                    debugLog("navcompass", `keep pinned tab ${fromID} (kernel reuse-pin 同语义)`, "nav");
                } else {
                    fromTab.close();
                    debugLog("navcompass", `replace tab: closed ${fromID} → ${tab.id}`, "nav");
                }
            }
            invalidateNavCache();
            return true;
        } catch (e) {
            debugLog("navcompass", `openTab failed ${target.id}: ${e}`, "nav");
            siyuan.pushMsg(tomatoI18n.罗盘目标已失效);
            return false;
        }
    }

    unload() {
        this.alive = false;
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.lpDisarm?.();
        this.lpDisarm = null;
        this.panelObserver?.disconnect();
        this.panelObserver = null;
        this.kbOff?.();
        this.kbOff = null;
        this.compassOpen = false;
        if (this.compassSv) {
            unmount(this.compassSv as object);
            this.compassSv = null;
        }
        if (this.ballSv) {
            unmount(this.ballSv);
            this.ballSv = null;
        }
        this.ballHost?.remove();
        this.compassHost?.remove();
        this.ballHost = null;
        this.compassHost = null;
        this.curDocID = "";
        this.compassDocID = "";
    }
}

export const navFloatBox = new NavFloatBox();
