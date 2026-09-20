// 悬浮图宿主（graphfloat □3 2026-09-19）：悬浮球+悬浮面板看当前文档块关系图。
// bear 口述「类似底部反链的悬浮功能：小悬浮球+快捷键悬浮起来看结果」——形态与悬浮
// 反链成对（BkFloatBall/BkFloatPanel 组件复用参数化）；图体=GraphBoxSvelte 独立第二
// 实例（dock 保留：定位/聚焦/菜单全部现有入口不撤），经伪 dock { element: 面板正文
// 容器, data: 独立暴露对象 } 挂载——组件的 data()/GraphControl 全挂伪 data，与 dock
// 实例互不覆盖；fit:"host" 量容器填满（画布几何脱离 dock 视口减法公式）。
// 生命周期关键决策：关面板不 unmount 图组件（display:none 保挂——重开零数据重拉，
// 巨书 getBlockDOM 25~39s 场景重开即所得）；面板藏起期间宿主不调 setCanvasSize
// （测量归零→stop 误置→changeDoc 早退锁死），重开时重测量+跟进当前文档。
// 刷新链：面板 open 才活（3s updated 指纹轮询+switch/loaded 事件跟随，藏起=零开销）；
// 不自挂 ws（Events.addWsListener 无 remove 且 dock 侧 "tomato-graph-auto-refresh-2025"
// 已占名——轮询指纹兜底覆盖 ws 场景）。记忆粒度全局一份（球位/面板几何由组件自带
// localStorage；开合+球显隐本类记），全 localStorage。
import { mount, unmount } from "svelte";
import { writable } from "svelte/store";
import BkFloatBall from "./BkFloatBall.svelte";
import BkFloatPanel from "./BkFloatPanel.svelte";
import GraphBoxSvelte from "./GraphBox.svelte";
import { graphBox, graphToolbarHTML, graphFullLoadedBigDocs } from "./GraphBox";
import { events, EventType } from "./libs/Events";
import { siyuan, sleep } from "./libs/utils";
import { gatedAddCommand } from "./libs/cmdGate";
import { winHotkey } from "./libs/winHotkey";
import { graphFloatJumpClose } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { newID } from "stonev5-utils";
import { debugLog } from "./libs/logUtils";
import type { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import type { IProtyle } from "siyuan";

/** 面板开合快捷键：⌘⌥⇧E——E=图命令族字母（⌘⌥E 定位到图中节点/⇧⌥E 打开 dock 图），
 *  三修饰档与 ⌘⌥⇧M（标记此块）/⌘⌥⇧F（聚焦此块）同族。定键 09-19 双通道扫描：官方
 *  constants.ts 无 ctrl+alt+shift+E；四插件仓 winHotkey 物理等价（修饰键集合+主键）无
 *  冲突——⌘⌥⇧G 撞 ListBox 取消勾选任务（alt+shift+ctrl+G）故弃 G 取 E。Chrome 浏览器
 *  保留键族均为双修饰，三修饰组合不在保留族（⌘⌥⇧M/F 同档先例双平台实测通过） */
export const GraphFloatToggle = winHotkey("⌘⌥⇧E", "tomatoGraphFloatToggle", "iconGraphBox", () => tomatoI18n.展开或收起悬浮图);

/** 球显隐快捷键（gfloatnav 09-19 自无默认键命令升级——悬浮反链球 BKFloatBallToggle 有键
 *  有键帽的对称补齐）：⌘⌥⇧Q=球（Qiú）助记。定键双通道扫描：官方 constants.ts 三修饰段
 *  零条目；四插件 winHotkey 三修饰已占 B/E/F/G/M/O/R+F5/F9，Q 空闲。langKey 沿用原命令
 *  字面量=命令开关态不丢；此前无默认键故无旧键迁移 */
export const GraphFloatBallToggle = winHotkey("⌘⌥⇧Q", "tomatoGraphFloatBallToggle", "iconEyeoff", () => tomatoI18n.显示或隐藏悬浮图球);

// ---- localStorage 键（记忆粒度全局一份；面板几何/球位在组件内自带） ----
const LS_OPEN = "tomato-gfloat-open";
const LS_BALL_HIDDEN = "tomato-gfloat-ball-hidden";

function gfLog(tag: string, msg: string) {
    debugLog(tag, msg, "graphbox");
}

class GraphFloatBox {
    private plugin: BaseTomatoPlugin;
    /** 代际闸：unload 后 in-flight async（mount/轮询 SQL await 归来）一律早退 */
    private alive = false;

    private panelHost: HTMLElement;
    private ballHost: HTMLElement;
    private panelSv: ReturnType<typeof mount> = null;
    private ballSv: ReturnType<typeof mount> = null;
    private graphSv: ReturnType<typeof mount> = null;
    /** 图实例伪 dock：element=面板正文容器（host fit 备用），data=独立暴露对象
     *  （GraphBoxSvelte onMount 往里挂 setCanvasSize/changeDoc/…，GraphControl 同） */
    private pseudoDock: { element: HTMLElement; data: any } | null = null;

    // 外部响应式状态：mount() 后经 writable store 下发组件（Svelte 5 外部更新正轨）
    private panelOpenStore = writable(false);
    private panelTitleStore = writable("");
    private ballHiddenStore = writable(false);
    private ballShiftStore = writable<{ x: number; y: number } | null>(null);
    /** shift 镜像（渲染位−记忆位）：nudge 重算时从渲染 rect 反推记忆基准位用（BkFloat 同款） */
    private lastShift: { x: number; y: number } | null = null;

    private panelOpen = false;
    /** 用户显隐意图（命令控制）；图球恒驻留（面板展开球不藏——点球收面板的入口保活，
     *  反链 back_link_float_ball_stay 默认开的等价简化，不做设置） */
    private userHidden = false;
    /** reload 恢复 Wish：onload 读档，首个 protyle 事件落地后开面板 */
    private pendingOpen = false;
    private panelBodyEl: HTMLElement | null = null;
    /** 浮窗实例专属控件 ID（与 dock 实例独立，GraphBoxSvelte 按 ID 绑定不串台） */
    private readonly viewModeGroupID = newID();
    // graphmind □4：级数选择器（与 dock 头栏同款控件组；graphrelayout □2 形态循环钮退役）

    private readonly showLevelSelectID = newID();

    private pollTimer: ReturnType<typeof setInterval> | null = null;
    /** 同文档 updated 指针：空=重开后首轮必比对（组件内指纹短路兜底，白推零成本） */
    private lastRefreshedUpdated = "";
    private curDocID = "";
    private curDocName = "";

    async onload(plugin: BaseTomatoPlugin) {
        this.plugin = plugin;
        this.alive = true;
        this.userHidden = localStorage.getItem(LS_BALL_HIDDEN) === "1";
        this.pendingOpen = localStorage.getItem(LS_OPEN) === "1";
        this.ballHiddenStore.set(this.userHidden);

        // 挂载序即绘制序：面板先挂、球后挂（同 z-index 10 下后者在上=面板不压球，BkFloat 同款）
        this.panelHost = document.body.appendChild(document.createElement("div"));
        this.ballHost = document.body.appendChild(document.createElement("div"));
        this.panelSv = mount(BkFloatPanel, {
            target: this.panelHost,
            props: {
                open: this.panelOpenStore,
                title: this.panelTitleStore,
                fallbackTitle: tomatoI18n.悬浮图,
                bare: true, // 画布正文精确填满（padding 会让 setCanvasSize 溢出出滚动条）
                onCollapse: () => this.closePanel(),
                // 收起钮 tooltip 键位后缀：函数 prop 现求值（改键后随渲染刷新）
                panelKeyHint: () => GraphFloatToggle.w(),
                onBody: (el: HTMLElement) => {
                    this.panelBodyEl = el;
                },
                onTools: (el: HTMLElement) => {
                    // dock 头栏同款控件组（四档直切；graphrelayout □2 形态循环钮退役）——
                    // ID 独立，绑定由 GraphBoxSvelte onMount 按 ID 完成（与 dock 通道同一套逻辑）
                    el.innerHTML = graphToolbarHTML(this.viewModeGroupID, this.showLevelSelectID);
                },
                // 拖拽/resize 落定后：重测量画布+重算球让位
                onGeoChange: () => this.onPanelGeoChange(),
            },
        });
        this.ballSv = mount(BkFloatBall, {
            target: this.ballHost,
            props: {
                count: writable(0), // 图球无徽标（恒 0=徽标隐藏）
                hidden: this.ballHiddenStore,
                onToggle: () => this.togglePanel(),
                panelKeyHint: () => GraphFloatToggle.w(),
                shift: this.ballShiftStore,
                onShiftAbsorbed: () => this.setShift(null),
                lsKey: "tomato-gfloat-ball-pos",
                ballIcon: "GraphBox",
                tip: tomatoI18n.展开或收起悬浮图,
                // 默认位与反链球垂直错开（review P1-3）：两球同 fallback 位=图球后挂恒盖死反链球
                defPos: () => ({ x: window.innerWidth - 36 - 48, y: Math.round(window.innerHeight * 0.55) }),
            },
        });

        gatedAddCommand(this.plugin, GraphFloatToggle.langKey, {
            langText: GraphFloatToggle.langText(),
            hotkey: GraphFloatToggle.m,
            callback: () => this.togglePanel(),
        });
        gatedAddCommand(this.plugin, GraphFloatBallToggle.langKey, {
            langText: GraphFloatBallToggle.langText(),
            hotkey: GraphFloatBallToggle.m,
            callback: () => this.toggleBallHidden(),
        });

        // 文档跟随+reload 恢复：pendingOpen 分支在 panelOpen 判定前（首事件即开面板）。
        // 藏起期间零跟随零开销（图组件保挂但无人看，重开 followDoc 追平）
        events.addListener("tomato-graph-float-2026-09-19", (eventType, detail) => {
            if (!this.alive) return;
            if (eventType != EventType.loaded_protyle_static
                && eventType != EventType.loaded_protyle_dynamic
                && eventType != EventType.switch_protyle) return;
            const protyle = detail?.protyle;
            const newDocID = protyle?.block?.rootID;
            if (!newDocID) return;
            this.curDocID = newDocID;
            const name = protyle?.title?.editElement?.textContent;
            if (name) {
                this.curDocName = name;
                this.panelTitleStore.set(name);
            }
            if (this.pendingOpen) {
                this.pendingOpen = false;
                this.openPanel();
                return;
            }
            if (this.panelOpen) this.followDoc(protyle);
        });
        gfLog("gfloat.onload", `hidden=${this.userHidden} pendingOpen=${this.pendingOpen}`);
    }

    togglePanel() {
        if (this.panelOpen) this.closePanel();
        else this.openPanel();
    }

    /** 图内导航收面板（gfloatnav）：跳转读原文场景用户已离开图，收起=大纲式闭环。
     *  每次导航实时读开关（设置改动免重载即时生效）；面板重开零数据重拉成本 */
    private onNavClose() {
        if (!this.alive || !this.panelOpen) return;
        if (graphFloatJumpClose.get()) this.closePanel();
    }

    openPanel() {
        if (!this.alive || this.panelOpen) return;
        this.panelOpen = true;
        this.panelOpenStore.set(true);
        try {
            localStorage.setItem(LS_OPEN, "1");
        } catch { /* 会话内生效 */ }
        this.applyBallNudge();
        if (!this.graphSv) {
            void this.mountGraph();
        } else {
            // 重开：重测量（面板几何在藏起期间可能已变/窗口 resize）+跟进当前文档
            void (async () => {
                await sleep(50); // 面板 display 恢复渲染后再量（藏起期间宿主不调测量）
                if (!this.alive || !this.panelOpen) return;
                this.pseudoDock?.data?.setCanvasSize?.();
                this.followDoc(undefined);
            })();
        }
        this.startPolling();
        gfLog("gfloat.panel_open", `doc=${this.curDocID.slice(0, 8)}`);
    }

    /** persist=false：插件 unload/reload 的收尾不落盘（重载不该重置用户开合记忆） */
    closePanel(persist = true) {
        if (!this.panelOpen) return;
        this.panelOpen = false;
        this.panelOpenStore.set(false);
        this.setShift(null);
        this.stopPolling();
        if (persist) {
            try {
                localStorage.setItem(LS_OPEN, "0");
            } catch { /* 会话内生效 */ }
        }
        gfLog("gfloat.panel_close", "");
    }

    /** 图组件首挂（面板首次打开）：面板 display 已恢复→量容器→mount（onMount 自拉
     *  当前文档 mount_pull）→补一次尺寸测量（relayout/fitView 前容器就绪） */
    private async mountGraph() {
        for (let i = 0; i < 40 && !this.panelBodyEl; i++) await sleep(25); // 壳 $effect 上报兜底
        if (!this.alive || !this.panelOpen || !this.panelBodyEl || this.graphSv) return;
        await sleep(50); // open store→class 刷新后再 mount（display:none 下测量归零）
        // 二次复查含 graphSv（review P2-1）：open→close→open 压进首开后 50ms 内，
        // 两个 mountGraph 并发均过首查——此处的 graphSv 已置防后到者再挂（双挂=泄漏一棵组件树）
        if (!this.alive || !this.panelOpen || this.graphSv) return;
        this.pseudoDock = { element: this.panelBodyEl, data: { svelte: null } };
        try {
            this.graphSv = mount(GraphBoxSvelte, {
                target: this.panelBodyEl,
                props: {
                    plugin: this.plugin,
                    dock: this.pseudoDock,
                    viewModeGroupID: this.viewModeGroupID,
                    showLevelSelectID: this.showLevelSelectID,
                    fit: "host",
                    // 图内导航即收面板（gfloatnav）：双击/Alt点/右键跳转/树双击/标记叶单击——
                    // 「悬浮图当大纲用」闭环（跳走=使命完成）。dock 实例不传=行为不变
                    onNavigate: () => this.onNavClose(),
                },
            }) as any;
            this.pseudoDock.data.svelte = this.graphSv;
        } catch (e) {
            gfLog("gfloat.mount_err", `${e}`);
            return;
        }
        await sleep(50); // 组件 onMount 挂 setCanvasSize 后补测一次（mount_pull 拉数据到位前）
        this.pseudoDock?.data?.setCanvasSize?.();
        gfLog("gfloat.mounted", "");
    }

    /** 图组件换文档（事件/轮询/重开追平共用）；protyle 可空=内部经 events 单例取 */
    private async followDoc(protyle?: IProtyle) {
        const d = this.pseudoDock?.data;
        if (!d?.svelte || !d.changeDoc) { gfLog("gfloat.follow_skip", "no-data"); return; }
        const cur = this.curDocID || events.docID || protyle?.block?.rootID;
        if (!cur) { gfLog("gfloat.follow_skip", "no-cur"); return; }
        if (d.getGraphState?.().docID === cur) { gfLog("gfloat.follow_skip", `synced doc=${cur.slice(0, 8)}`); return; } // 已同步（组件内指纹短路兜底）
        gfLog("gfloat.follow_push", `doc=${cur.slice(0, 8)} from=${d.getGraphState?.().docID?.slice(0, 8)}`);
        const p = graphBox.protyleForChangeDoc(protyle, cur, this.curDocName);
        await d.changeDoc(p);
        gfLog("gfloat.follow_doc", `doc=${cur.slice(0, 8)} now=${d.getGraphState?.().docID?.slice(0, 8)}`);
    }

    // ---- 刷新链（open 才活）：3s updated 指纹轮询——组件内同款指纹短路，白推零重建 ----
    private startPolling() {
        if (this.pollTimer) return;
        this.lastRefreshedUpdated = ""; // 重开首轮必比对（追平藏起期间的变更）
        this.pollTimer = setInterval(() => void this.pollOnce(), 3000);
    }

    private stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }

    /** graphrelayout □5：dock 侧 ws 监听转发——块属性写（updateAttrs，含块级标记 toggle）
     *  的标记轻通道通知。浮窗不自挂 ws（Events.addWsListener 无 remove，GraphBox.ts 的
     *  "tomato-graph-auto-refresh-2025" 已覆盖全实例），由 dock 监听判定命中时调这里；
     *  面板未开/已卸载=静默 no-op（toggleBlockMark 只通知 dock 实例的既有形态在此补齐） */
    notifyMarksChanged() {
        if (!this.alive || !this.panelOpen) return;
        this.pseudoDock?.data?.marksChanged?.();
    }

    private async pollOnce() {
        if (!this.alive || !this.panelOpen) return;
        const d = this.pseudoDock?.data;
        if (!d?.svelte) return;
        // cur 三级兜底（review P2-3）：?id= 直开/重载空窗期 curDocID 恒空（事件早于订阅），
        // events.docID 同空——取图组件自身 docID（mount_pull 已拉）保轮询/刷新不死于空窗
        const cur = this.curDocID || events.docID || d.getGraphState?.().docID;
        if (!cur) return;
        if (graphFullLoadedBigDocs.has(cur)) return; // 巨书全量态：自动刷新降级手动（面板刷新钮）
        // 定位/聚焦脉冲窗口内不刷新（expandTo 写属性→ws 回流重建会打断脉冲，GraphBox 同款）
        if (d.suppressAutoRefreshUntil && Date.now() < d.suppressAutoRefreshUntil) return;
        if (d.getGraphState?.().docID !== cur) {
            void this.followDoc(undefined);
            return;
        }
        try {
            const row = await siyuan.sqlOne(`SELECT updated FROM blocks WHERE id = "${cur}" AND type = "d"`);
            if (!this.alive || !this.panelOpen) return;
            if (row?.updated && row.updated === this.lastRefreshedUpdated) return;
            // events 单例空窗期 protyle 可为空——changeDoc 内部空 protyle 静默 return，
            // 走 protyleForChangeDoc 伪造兜底（curDocName 事件跟随期已记，永不为空）
            const p = graphBox.protyleForChangeDoc(events.protyle?.protyle, cur, this.curDocName);
            // 指纹后置提交（review P1-2）：changeDoc 抢锁失败（返回 false）不提交——
            // 预提交×锁丢弃=后续轮询在指纹比对处短路，丢一次刷新且不自愈
            const ran = await d.changeDoc(p, true); // refreshOnly=同文档不 fitView（保视口）
            if (ran) this.lastRefreshedUpdated = row?.updated || "";
        } catch (e) {
            gfLog("gfloat.poll_err", `${e}`);
        }
    }

    // ---- 球让位（BkFloat applyBallNudge 同款：球记忆位压面板矩形时临时偏移让出） ----
    private setShift(v: { x: number; y: number } | null) {
        this.lastShift = v;
        this.ballShiftStore.set(v);
    }

    private applyBallNudge() {
        requestAnimationFrame(() => {
            if (!this.alive) return;
            if (!this.panelOpen || !this.ballHost || !this.panelHost) {
                this.setShift(null);
                return;
            }
            const ball = this.ballHost.querySelector<HTMLElement>(".tomato-bk-float-ball");
            const panel = this.panelHost.querySelector<HTMLElement>(".tomato-bk-float-panel");
            if (!ball || !panel) return;
            const b = ball.getBoundingClientRect();
            const p = panel.getBoundingClientRect();
            const s = this.lastShift ?? { x: 0, y: 0 };
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
            const target =
                p.top - GAP - b.height >= 0 ? { x: 0, y: p.top - GAP - b.height - base.top } :
                p.left - GAP - b.width >= 0 ? { x: p.left - GAP - b.width - base.left, y: 0 } :
                p.right + GAP + b.width <= window.innerWidth ? { x: p.right + GAP - base.left, y: 0 } :
                p.bottom + GAP + b.height <= window.innerHeight ? { x: 0, y: p.bottom + GAP - b.height - base.top } :
                null;
            this.setShift(target);
        });
    }

    /** 面板拖拽/resize/窗口 resize 落定：重测量画布（canvasWidth/Height $state 变化
     *  →组件 $effect 在 fitView 后 5s 窗内自动 refit）+球让位重算 */
    private onPanelGeoChange() {
        if (!this.alive || !this.panelOpen) return; // 藏起期间不测量（归零会置 stop 锁死）
        this.pseudoDock?.data?.setCanvasSize?.();
        this.applyBallNudge();
    }

    private toggleBallHidden() {
        this.userHidden = !this.userHidden;
        this.ballHiddenStore.set(this.userHidden);
        try {
            localStorage.setItem(LS_BALL_HIDDEN, this.userHidden ? "1" : "0");
        } catch { /* 会话内生效 */ }
        // 恢复显示补让位（隐藏期间面板可能已挪到球记忆位上）；隐藏方向无需（display:none 测全零）
        if (!this.userHidden) this.applyBallNudge();
        gfLog("gfloat.ball_hidden", `${this.userHidden}`);
    }

    unload() {
        this.alive = false;
        this.closePanel(false); // 插件 reload 非用户动作：不落盘开合记忆
        this.stopPolling();
        if (this.graphSv) {
            unmount(this.graphSv);
            this.graphSv = null;
        }
        if (this.ballSv) {
            unmount(this.ballSv);
            this.ballSv = null;
        }
        if (this.panelSv) {
            unmount(this.panelSv);
            this.panelSv = null;
        }
        this.panelHost?.remove();
        this.ballHost?.remove();
        this.panelHost = null;
        this.ballHost = null;
        this.panelBodyEl = null;
        this.pseudoDock = null;
        this.curDocID = "";
        this.curDocName = "";
    }
}

export const graphFloatBox = new GraphFloatBox();
