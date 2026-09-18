// 悬浮反链宿主（bkfloat □4 2026-09-17）：悬浮球+悬浮面板+快捷键+状态栏钮。
// 职责：当前文档追踪（BackLinkBottomBox.handleProtyle float 早退分流进来）→ 球徽标
// 计数（复用入口条同款 getBacklink2 containChildren=true + cachedEntryCount/applyEntryCount
// revision 缓存）；面板正文=mount(BackLinkBottom, BKMaker 同款 props)（BKMaker 仅作
// 接口壳不 doTheWork：container 指面板正文容器当查询根，刷新轮询由本类接管）。
// 记忆粒度全局一份：球位/面板几何+透明度/面板开合/球显隐，全 localStorage。
// float OFF/移动端路径零改动：本类只在 BackLinkBottomBox.onload（主开关 ON 后）实例化。
import { mount, unmount } from "svelte";
import { writable } from "svelte/store";
import BkFloatBall from "./BkFloatBall.svelte";
import BkFloatPanel from "./BkFloatPanel.svelte";
import BackLinkBottom from "./BackLinkBottom.svelte";
import { BKMaker, registerBkIndexCommitTarget } from "./BackLinkBottomBox";
import type { BackLinkBottomBox } from "./BackLinkBottomBox";
import type { Protyle } from "siyuan";
import { events } from "./libs/Events";
import { back_link_float, back_link_float_ball_stay, bk_refresh_interval_sec, bk_visible_only } from "./libs/stores";
import { icon, isProtyleVisible, siyuan } from "./libs/utils";
import { cachedEntryCount, applyEntryCount } from "./libs/bkRevision";
import { gatedAddCommand } from "./libs/cmdGate";
import { winHotkey } from "./libs/winHotkey";
import { tomatoI18n } from "./tomatoI18n";
import { DestroyManager } from "./libs/destroyer";
import { debugLog } from "./libs/logUtils";
import type { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

/** 面板开合快捷键（官方 addCommand 三合一通道注册，勿裸 commands.push）。
 * 键位定案 ctrl+alt+b（2026-09-17 6813 keymap 现扫 15764 键）：spec 首选 alt+b 撞官方
 * editor.general.backlinks（⌥b）、备选 alt+; 撞 sy-progressive-plugin 直接入槽（⌥;，
 * 09-09 审计过时）——取保 B 语义且扫描空闲的 ⌘⌥B（command 组合不产 macOS 特殊字符输入）。
 * ⚠已知残留撞键（confgather2 □2 查明）：官方 editor.table.moveToDown 默认=⌥⌘B
 * （表格四向移动 ⌥⌘T/L/B/R 助记族），光标在表格内时该键被内核表格导航消费、面板不响应；
 * 表格外正常。当时现扫漏了 editor.table 节。换键须呈 bear 拍板（肌肉记忆+keymap 迁移）。
 * ⚠查重正轨（□2 review P0 教训）：实例 keymap「现扫」不可信——官方默认键在 keymap 里的
 * 符号序是 ⇧⌘/⌥⌘（shift/option 在前），按 ⌘⇧/⌘⌥ 序字符串比对=假阴性两案（⌘⌥B 当年漏
 * editor.table、⌘⇧B 本次漏 editor.general.insertBefore）。定键一律对
 * /opt/projects/siyuan/app/src/constants.ts 全文 grep（官方默认键单一事实源）+ 四插件仓
 * winHotkey 形态双通道查重，物理等价比对按修饰键集合归一忽略符号序 */
export const BKFloatToggle = winHotkey("ctrl+alt+b", "tomatoBkFloatToggle", "iconLink", () => tomatoI18n.展开或收起悬浮反链);

/** 球显隐快捷键（confgather2 □2 2026-09-17）：状态栏钮/命令面板/反链域键帽三通道同一动作。
 * 键位 ⌘⇧X（ctrl+shift+x，X=隐藏/叉掉球）：constants.ts 全文+四插件仓 winHotkey 双通道
 * 查重空闲。B 族六形态全占：⇧⌘B=官方 editor.general.insertBefore（在上方插入空块，编辑器
 * 内主场景全失效+改文档副作用，□2 review P0 实锤）、⌥⌘B=官方表格族+本插件面板键、
 * ⌥⇧B=官方 focusBreadcrumb、⌘B=粗体、⌥B=官方反链面板、⌥⌘⇧B=MixBox 复制文档为纯文本。
 * ⇧⌘ 字母族双通道仅 D/I/O/R/V/X 空闲，其中 D/O/R/V(+I win 侧) 是 Chrome 浏览器版保留键
 * （书签管理器/收藏全部/强刷/纯文本粘贴/devtools——浏览器端页面收不到键，Electron/裸
 * Chromium 实测通过不可外推 Chrome 应用），唯 X 双平台干净故取之 */
export const BKFloatBallToggle = winHotkey("ctrl+shift+x", "tomatoBkFloatBallToggle", "iconEyeoff", () => tomatoI18n.显示或隐藏悬浮反链球);

// ---- localStorage 键（记忆粒度全局一份，DialogSvelte useBrowserStorage 同哲学） ----
const LS_OPEN = "tomato-bkfloat-open";
const LS_BALL_HIDDEN = "tomato-bkfloat-ball-hidden";

const refreshIntervalMs = () => Math.max(2, Number(bk_refresh_interval_sec.get()) || 15) * 1000;

export class FloatBacklinkBox {
    public plugin: BaseTomatoPlugin;
    private blBox: BackLinkBottomBox;
    /** 代际闸：unload 后 in-flight async（getBacklink2/getBlockAttrs await 归来）一律早退 */
    private alive = false;

    private ballHost: HTMLElement;
    private panelHost: HTMLElement;
    private ballSv: ReturnType<typeof mount> = null;
    private panelSv: ReturnType<typeof mount> = null;

    // 外部响应式状态：mount() 后经 writable store 下发组件（Svelte 5 外部更新正轨）
    private badgeStore = writable(0);
    private ballHiddenStore = writable(false);
    private ballShiftStore = writable<{ x: number; y: number } | null>(null);
    /** shift 镜像（渲染位−记忆位）：nudge 重算时从渲染 rect 反推记忆基准位用——重算时
     *  旧 shift 在场（面板二次拖到让位球上/resize/stay 切换），量渲染位当基准会让新
     *  shift 叠在旧偏移上=目标位漂移且错误态自锁（复评 P1-1）。写入统一走 setShift */
    private lastShift: { x: number; y: number } | null = null;
    private panelOpenStore = writable(false);
    private panelTitleStore = writable("");

    private curDocID = "";
    private curDetail: Protyle = null;
    private panelBodyEl: HTMLElement = null;
    private panelOpen = false;
    /** reload 恢复 Wish：onload 读档，首个 protyle 事件落地后开面板 */
    private pendingOpen = false;
    /** 用户显隐意图（状态栏钮/⌘⇧X 控制）；球实际显隐公式见 syncBallVisibility（含球驻留模式） */
    private userHidden = false;
    /** 面板正文挂载前对 wysiwyg inline paddingBottom 的快照（评审 P1-3：BackLinkBottom
     *  onMount 直写 0px+observer 对抗内核 padB——底部形态合理，悬浮形态编辑器白失打字机
     *  padB 且收起后不还原。零改动带不动组件，宿主侧补偿） */
    private padSnapshot: { el: HTMLElement; value: string } = null;

    private contentSv: ReturnType<typeof mount> = null;
    private contentTimer: ReturnType<typeof setInterval> = null;

    private badgeTimer: ReturnType<typeof setInterval> = null;
    private offInvalidate: () => void = null;
    /** 球驻留设置订阅退订句柄：设置值变化（本端面板 bind/他端 dataChange 热更）即时重算球显隐 */
    private offBallStay: () => void = null;
    private statusEl: HTMLElement = null;

    constructor(blBox: BackLinkBottomBox) {
        this.blBox = blBox;
    }

    async onload(plugin: BaseTomatoPlugin) {
        this.plugin = plugin;
        this.alive = true;
        this.userHidden = localStorage.getItem(LS_BALL_HIDDEN) === "1";
        this.pendingOpen = localStorage.getItem(LS_OPEN) === "1";
        this.syncBallVisibility();
        // 球驻留模式热生效：非结构性键不整重载，store 值变（面板 bind/他端 dataChange）即重算。
        // subscribe 首拍即回调一次，与上方 syncBallVisibility 幂等无副作用
        this.offBallStay = back_link_float_ball_stay.subscribe(() => {
            if (this.alive) {
                this.syncBallVisibility();
                this.applyBallNudge();
            }
        });

        // 挂载序即绘制序：面板先挂、球后挂（同 z-index 10 下后者在上=面板不压球）
        this.panelHost = document.body.appendChild(document.createElement("div"));
        this.ballHost = document.body.appendChild(document.createElement("div"));
        this.panelSv = mount(BkFloatPanel, {
            target: this.panelHost,
            props: {
                open: this.panelOpenStore,
                title: this.panelTitleStore,
                onCollapse: () => this.closePanel(),
                // 收起钮 tooltip 键位后缀（confgather2 □2）：函数 prop 现求值（改键后随渲染刷新），
                // 避免 BkFloat↔BkFloatPanel 循环 import
                panelKeyHint: () => BKFloatToggle.w(),
                onBody: (el: HTMLElement) => {
                    this.panelBodyEl = el;
                },
                // 拖拽/resize 落定后重算球让位（用户把面板拖到球上时球跳出让位）
                onGeoChange: () => this.applyBallNudge(),
            },
        });
        this.ballSv = mount(BkFloatBall, {
            target: this.ballHost,
            props: {
                count: this.badgeStore,
                hidden: this.ballHiddenStore,
                onToggle: () => this.togglePanel(),
                // 球 tooltip 提示的是面板开合键（球=面板入口；同上防循环 import 的函数 prop）
                panelKeyHint: () => BKFloatToggle.w(),
                // 共存模式防遮挡让位偏移（applyBallNudge 计算；null=原位）
                shift: this.ballShiftStore,
                onShiftAbsorbed: () => this.setShift(null),
            },
        });

        gatedAddCommand(this.plugin, BKFloatToggle.langKey, {
            langText: BKFloatToggle.langText(),
            hotkey: BKFloatToggle.m,
            callback: () => this.togglePanel(),
        });
        gatedAddCommand(this.plugin, BKFloatBallToggle.langKey, {
            langText: BKFloatBallToggle.langText(),
            hotkey: BKFloatBallToggle.m,
            callback: () => this.toggleBallHidden(),
        });

        this.addStatusBtn();

        // 数据失效通道（□13）：引用源被编辑/增删 → 徽标即时校准。缓存 revision 在
        // unchanged 短路下会回旧计数，命中即全量重查（force）
        this.offInvalidate = registerBkIndexCommitTarget(({ rootIDs, full }) => {
            if (!this.alive || !this.curDocID) return;
            if (full || rootIDs.has(this.curDocID)) this.updateBadge(true);
        });

        // 徽标低频轮询（对齐底部刷新间隔）：跨实例/跨端改动兜底；revision 缓存加持近零开销
        this.badgeTimer = setInterval(() => {
            if (this.alive && this.curDocID && !this.userHidden) this.updateBadge();
        }, refreshIntervalMs());
        debugLog("bkfloat", `onload hidden=${this.userHidden} pendingOpen=${this.pendingOpen}`, "bk");
    }

    /** 球实际显隐 = userHidden || (panelOpen && !球驻留)：
     *  共存模式（back_link_float_ball_stay 默认开，09-18 bear 需求）：面板展开球留驻，
     *  再点球收面板；关闭=旧互斥行为「面板展开球藏起」（评审 P1-6 收缩语义），收起恢复 */
    private syncBallVisibility() {
        const hidden = this.userHidden || (this.panelOpen && !back_link_float_ball_stay.get());
        this.ballHiddenStore.set(hidden);
    }

    /** shift 写入统一入口：维护 lastShift 镜像（不变式=渲染位−记忆位），见字段注 */
    private setShift(v: { x: number; y: number } | null) {
        this.lastShift = v;
        this.ballShiftStore.set(v);
    }

    /** 共存模式防遮挡让位（vision P1）：面板开启期间球的记忆位若与面板矩形相交，会浮在
     *  面板上压住头栏控件——临时让位到面板上方（空间不足依次左/右/下方），只下发视觉
     *  偏移不写球的 localStorage 记忆位，收起面板/拖球即回原位。旧互斥模式球本就藏、
     *  无此问题（恒清空偏移）。rAF 等 Svelte store→class 刷新后测量（hidden 翻转前
     *  rect 全零），幂等可重入；相交判定与偏移目标都对记忆基准位求（复评 P1-1） */
    private applyBallNudge() {
        requestAnimationFrame(() => {
            if (!this.alive) return;
            if (!this.panelOpen || !back_link_float_ball_stay.get() || !this.ballHost || !this.panelHost) {
                this.setShift(null);
                return;
            }
            const ball = this.ballHost.querySelector<HTMLElement>(".tomato-bk-float-ball");
            const panel = this.panelHost.querySelector<HTMLElement>(".tomato-bk-float-panel");
            if (!ball || !panel) return;
            const b = ball.getBoundingClientRect();
            const p = panel.getBoundingClientRect();
            const s = this.lastShift ?? { x: 0, y: 0 };
            // 渲染位=基准+shift：反推记忆基准位（重算时旧偏移在场不得计入）
            const base = {
                left: b.left - s.x,
                top: b.top - s.y,
                right: b.right - s.x,
                bottom: b.bottom - s.y,
            };
            const intersects = base.left < p.right && base.right > p.left && base.top < p.bottom && base.bottom > p.top;
            if (!intersects) {
                this.setShift(null);
                return;
            }
            const GAP = 8;
            // 让位目标按视口可用性择一：上→左→右→下（与球 clamp 同用 innerWidth/innerHeight 口径）
            const target =
                p.top - GAP - b.height >= 0 ? { x: 0, y: p.top - GAP - b.height - base.top } :
                p.left - GAP - b.width >= 0 ? { x: p.left - GAP - b.width - base.left, y: 0 } :
                p.right + GAP + b.width <= window.innerWidth ? { x: p.right + GAP - base.left, y: 0 } :
                p.bottom + GAP + b.height <= window.innerHeight ? { x: 0, y: p.bottom + GAP - base.top } :
                null;
            // 全无空间（视口近乎被面板占满）：保持原位——球恒压面板上层可点可拖，不算死锁
            this.setShift(target);
        });
    }

    /** BackLinkBottomBox.handleProtyle 的 float 早退分流：只追活动文档徽标+面板跟随，
     * 不做 per-doc gating（pull 查看器语义，spec 定案④） */
    handleProtyle(detail: Protyle, _eventType: string) {
        if (!this.alive) return;
        const protyle = detail?.protyle;
        const docID = protyle?.block?.rootID;
        if (!docID || !protyle?.element) return;
        if (docID === this.curDocID) {
            if (detail?.protyle?.element !== this.curDetail?.protyle?.element) {
                // 同文档页签重开（旧页签关→新页签开）：新 protyle 实例，旧 detail 的
                // element 已死——面板若开着必须重挂，否则组件/轮询闭包持死 protyle、
                // visible_only 下永不刷新（评审 P1-4）
                this.curDetail = detail;
                if (this.panelOpen) this.remountContent();
            } else {
                // 同文档引用刷新（静态重载等）：换新 detail 保 wysiwyg 观察有效
                this.curDetail = detail;
            }
            return;
        }
        // 活动文档判定：switch/click 事件目标恒可见；resweep 按编辑器序遍历可能以
        // 非活动页签收尾——可见者优先，无当前文档时接受首个兜底
        if (this.curDocID && !isProtyleVisible(protyle)) return;
        this.curDocID = docID;
        this.curDetail = detail;
        this.panelTitleStore.set(events.getInfo(protyle).name || "");
        this.updateBadge();
        if (this.pendingOpen) {
            this.pendingOpen = false;
            this.openPanel();
        } else if (this.panelOpen) {
            this.remountContent();
        }
    }

    togglePanel() {
        if (this.panelOpen) this.closePanel();
        else this.openPanel();
    }

    openPanel() {
        if (!this.alive || this.panelOpen) return;
        if (!this.curDetail || !this.curDocID) {
            debugLog("bkfloat", "openPanel skip: no active protyle yet", "bk");
            return;
        }
        this.panelOpen = true;
        this.panelOpenStore.set(true);
        this.syncBallVisibility();
        this.applyBallNudge();
        try {
            localStorage.setItem(LS_OPEN, "1");
        } catch { /* 会话内生效 */ }
        this.remountContent();
        debugLog("bkfloat", `panel open doc=${this.curDocID}`, "bk");
    }

    /** persist=false：非用户动作的收尾（插件 unload/reload）不落盘——重载不该重置
     *  用户开合记忆（评审 P2-11） */
    closePanel(persist = true) {
        if (!this.panelOpen) return;
        // 先卸正文（停其刷新 interval/observer + 还原 padB 快照），再收壳——顺序不可倒
        this.unmountContent();
        this.panelOpen = false;
        this.panelOpenStore.set(false);
        this.syncBallVisibility();
        // 让位偏移随面板收起解除（球回记忆原位；rAF 内 null 与 syncBallVisibility 顺序无耦合）
        this.setShift(null);
        if (persist) {
            try {
                localStorage.setItem(LS_OPEN, "0");
            } catch { /* 会话内生效 */ }
        }
        // 面板开着期间徽标轮询照跑（userHidden 才跳过），收起即见最新值；仍补一次校准
        if (this.curDocID) this.updateBadge();
        debugLog("bkfloat", "panel close", "bk");
    }

    /** 面板正文挂载（展开/切文档重挂）：BKMaker 仅作接口壳（container=查询根），
     * 刷新轮询对齐 BKMaker.doTheWork 同款语义（visible_only+shouldFreeze 由组件开关管） */
    private async remountContent() {
        this.unmountContent();
        const detail = this.curDetail;
        const docID = this.curDocID;
        if (!this.panelOpen || !detail || !docID) return;
        let attrs: AttrType;
        try {
            attrs = await siyuan.getBlockAttrs(docID);
        } catch (e) {
            // await 间隙文档可能被删除/竞态：静默降级（评审 P2-12）
            debugLog("bkfloat", `content attrs failed doc=${docID}: ${e}`, "bk");
            return;
        }
        // await 间隙面板可能已收起/切走：核验现场再挂
        if (!this.alive || !this.panelOpen || this.curDocID !== docID) return;
        if (!this.panelBodyEl) {
            debugLog("bkfloat", "remountContent skip: body not ready", "bk");
            return;
        }
        // P1-3 补偿：快照 wysiwyg inline paddingBottom——BackLinkBottom onMount 直写
        // 0px+observer 对抗内核 padB 重写（底部形态合理），悬浮形态编辑器不该失打字机
        // padB；unmountContent 时还原快照（组件已随 unmount 停 observer，还原不被对抗）
        const wysiwygEl = (detail as Protyle)?.protyle?.wysiwyg?.element as HTMLElement | undefined;
        if (wysiwygEl) {
            this.padSnapshot = { el: wysiwygEl, value: wysiwygEl.style.paddingBottom ?? "" };
        }
        const maker = new BKMaker(this.blBox, docID);
        maker.disabled = false;
        // 组件以 container 为查询根（本地过滤/截断补测/宽度模式），底部模式该指 bk 容器，
        // 这里指面板正文容器——BackLinkBottom 零改动带，仅宿主侧装配差异
        maker.container = this.panelBodyEl;
        const dm = new DestroyManager(false, "bkfloat-content");
        this.contentSv = mount(BackLinkBottom, {
            target: this.panelBodyEl,
            props: {
                maker,
                protyle: detail,
                attrs,
                dm,
            },
        });
        let lastVisible = true;
        this.contentTimer = setInterval(() => {
            if (!this.panelOpen) return;
            if (bk_visible_only.get()) {
                const visible = isProtyleVisible((detail as Protyle)?.protyle);
                if (!visible) {
                    lastVisible = false;
                    return;
                }
                if (!lastVisible) {
                    lastVisible = true;
                    maker.refreshBacklinks();
                    return;
                }
            }
            maker.refreshBacklinks();
        }, refreshIntervalMs());
        debugLog("bkfloat", `content mounted doc=${docID}`, "bk");
    }

    /** 收起=unmount 正文组件（其 onMount cleanup→dm.destroyBy 关 observer/protyle 复用树）+
     * 停本类刷新 interval（spec：停其刷新 interval）+还原挂载前的 wysiwyg padB 快照 */
    private unmountContent() {
        if (this.contentTimer) {
            clearInterval(this.contentTimer);
            this.contentTimer = null;
        }
        if (this.contentSv) {
            unmount(this.contentSv);
            this.contentSv = null;
        }
        if (this.padSnapshot) {
            const { el, value } = this.padSnapshot;
            this.padSnapshot = null;
            // 快照间隙编辑器可能已关（detached）：还原无意义
            if (el.isConnected) el.style.paddingBottom = value;
        }
    }

    /** 徽标计数：入口条同款（containChildren=true 恒真+revision 缓存）。
     * force=跳过缓存 revision 全量重查（失效通道命中用） */
    private async updateBadge(force = false) {
        const docID = this.curDocID;
        if (!docID) {
            this.badgeStore.set(0);
            return;
        }
        try {
            const cached = cachedEntryCount(docID);
            const resp = await siyuan.getBacklink2(docID, "", "", "3", "3", force ? "" : cached?.revision ?? "", true);
            if (!this.alive || this.curDocID !== docID) return;
            this.badgeStore.set(applyEntryCount(docID, resp));
        } catch (e) {
            debugLog("bkfloat", `badge failed doc=${docID}: ${e}`, "bk");
        }
    }

    // ---- 状态栏钮（TomatoClock.ts:338 先例：addStatusBar 只 push 不移除，
    //      卸载须手动 remove+statusBarIcons splice） ----
    private addStatusBtn() {
        const el = document.createElement("div");
        el.className = "toolbar__item ariaLabel";
        el.id = "tomato-bkfloat-status";
        this.renderStatusBtn(el);
        el.addEventListener("click", () => this.toggleBallHidden());
        this.plugin.addStatusBar({
            element: el,
            position: "left",
        });
        this.statusEl = el;
    }

    private renderStatusBtn(el: HTMLElement) {
        // tooltip 多行走 aria-label（static 属性字面量 \n 非换行教训——这里单行动态串无此问题）；
        // 键位后缀 .w() 现读 keymap（改键跟随；顶栏齿轮/日记顶栏钮同款先例）
        el.setAttribute(
            "aria-label",
            `${this.userHidden ? tomatoI18n.显示悬浮反链球 : tomatoI18n.隐藏悬浮反链球} ${BKFloatBallToggle.w()}`,
        );
        el.innerHTML = icon("Link", 14);
    }

    private toggleBallHidden() {
        this.userHidden = !this.userHidden;
        this.syncBallVisibility();
        try {
            localStorage.setItem(LS_BALL_HIDDEN, this.userHidden ? "1" : "0");
        } catch { /* 会话内生效 */ }
        if (this.statusEl) this.renderStatusBtn(this.statusEl);
        // 恢复显示入口补让位（复评 P1-2）：隐藏期间面板可能已挪到球记忆位上，直接恢复=
        // 球压面板头栏；rAF 等 unhide class 刷新后再量。隐藏方向无需（display:none 量全零）
        if (!this.userHidden) this.applyBallNudge();
        // 从隐藏恢复时徽标可能已过期（轮询期间被跳过）：立即校准
        if (!this.userHidden && this.curDocID) this.updateBadge();
        debugLog("bkfloat", `ball userHidden=${this.userHidden}`, "bk");
    }

    private removeStatusBtn() {
        if (!this.statusEl) return;
        this.statusEl.remove();
        const arr = (this.plugin as any).statusBarIcons as Element[];
        const i = arr?.indexOf(this.statusEl) ?? -1;
        if (i >= 0) arr.splice(i, 1);
        this.statusEl = null;
    }

    unload() {
        this.alive = false;
        // 插件 reload 是非用户动作：不落盘开合记忆（评审 P2-11）
        this.closePanel(false);
        if (this.badgeTimer) {
            clearInterval(this.badgeTimer);
            this.badgeTimer = null;
        }
        this.offInvalidate?.();
        this.offInvalidate = null;
        this.offBallStay?.();
        this.offBallStay = null;
        this.removeStatusBtn();
        if (this.ballSv) {
            unmount(this.ballSv);
            this.ballSv = null;
        }
        if (this.panelSv) {
            unmount(this.panelSv);
            this.panelSv = null;
        }
        this.ballHost?.remove();
        this.panelHost?.remove();
        this.ballHost = null;
        this.panelHost = null;
        this.panelBodyEl = null;
        this.curDocID = "";
        this.curDetail = null;
    }
}

/** float 模式挂载决策（BackLinkBottomBox 调用）：float ON 且桌面端 */
export function bkFloatOn(): boolean {
    return back_link_float.get() && !events.isMobile;
}
