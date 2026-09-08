// 速记器 quicknote（quicknote 战役 □1 2026-09-07；□4 窗口统一化 2026-09-07）：
// 全局唯一热键 ⌥J 唤起统一输入窗（拍照闪念 ⌥7 全局键随 □4 退役，入口收拢于此）。
// 方案 A：插件渲染进程借 @electron/remote 开自建 BrowserWindow（零思源前端、零插件加载）
// → 回传文本 → 复用 NoteBox 保存链（token 不出进程、写入逻辑零复刻）。前提=思源桌面端常驻。
//
// 回传通道=BroadcastChannel "quicknote"：小窗与主窗同 origin（127.0.0.1:<实例端口>），
// 渲染进程间直通、纯 web 标准。Electron 42 已移除 ipcRenderer.sendTo（□1 e2e 实锤：
// 页面发送静默失败无回执），preload/sendTo 方案随之退役。
//
// 窗口池化：首建后永不销毁，提交/Esc/失焦=hide、热键=show/hide toggle（□4 用户拍板：
// 再按即关）、二次起零等待草稿保留。池对象挂 globalThis——插件经 window.eval 重载无
// 模块缓存，挂 globalThis 后新实例可复用旧窗。
//
// 触发形态（□4）：external=外部轻窗（默认）；focus=带出思源主窗前台+打开拍照闪念
// 面板（Tab 形态，可拖出成浮窗——图片粘贴等全能力留思源内）。
import { openTab } from "siyuan";
import { events } from "./libs/Events";
import { debugLog } from "./libs/logUtils";
import { isMainWin, siyuan } from "./libs/utils";
import { OpenSyFile2 } from "./libs/navUtils";
import { get } from "svelte/store";
import { getTargetID, insertIntoDailynote, TAB_TYPE } from "./NoteBox";
import {
    noteBoxAllKinds,
    quickNoteCheckbox,
    quickNoteOpenMode,
    quickNoteRect,
    storeNoteBox_keep,
    storeNoteBox_recentText,
    storeNoteBox_selectedNotebook,
    storeNoteBox_selectedNoteType,
} from "./libs/stores";
import { parseNoteKinds, QN_CHANNEL, QN_ICON, qnCloseStale, qnFitRect, qnParseMsg, qnWindowRect } from "./libs/quicknoteCore";
import { winHotkey } from "./libs/winHotkey";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

const QN_W = 640;
const QN_H = 210; // □4：chips 行+底部按钮行进窗（原 160 纯输入）
/** □2 三可调下限：chips 行+输入框+按钮行压不死的最小可用面（原生热区缩放的下限约束） */
const QN_MIN_W = 480;
const QN_MIN_H = 140;
/** 透明度档位循环的落盘等待：moved/resized 结束事件本身低频，debounce 只兜连拖场景 */
const QN_RECT_DEBOUNCE = 500;
const G = globalThis as any;

/** 默认键 ⌥J（2026-09-07 □2 查重定稿：⌥⇧N 撞「创建快速笔记」；⌥ 单字母段 I/J/K/T/U 空闲中
 *  J 最顺手且 VSCode 无绑定；备选 ⌥⌘O——用户可经思源键位设置自改） */
export const QuickNote速记器全局 = winHotkey("alt+j", "QuickNote速记器", "", () => tomatoI18n.速记器);

class QuickNote {
    plugin: BaseTomatoPlugin;
    /** 回执通道（onload 时创建；postMessage 只达同 origin 其他窗口，主窗自发不自收） */
    private ch: BroadcastChannel | null = null;
    /** 最近一次热键唤起 show 的时刻（ms）——迟到 close 守卫的基准（qnCloseStale） */
    private lastShowAt = 0;
    /** □2 当前透明度（onload 从记忆恢复；opacity 协议/唤起恢复时更新并随 rect 落盘） */
    private curOpacity = 1;
    /** □2 moved/resized 记忆写盘的 debounce 句柄 */
    private rectTimer: ReturnType<typeof setTimeout> | null = null;
    /** 首建 loadURL 进行中：占池先于加载完成，期间二次热键须让路（show 未加载页=白窗一闪） */
    private winLoading = false;

    /** 窗口池（globalThis 容忍 window.eval 重跑顶层；isDestroyed 后视为无池重建）。
     *  池键带协议版本（□4 起页面有 chips/keep 协议；close 迟到守卫升 v3；□2 三可调
     *  协议加 opacity+窗 resizable 升 v4）：reload 升级后旧版页面窗残留会顶替新版窗
     *  （show 出无新协议旧 UI），版本换键=强制重建；旧键窗 onload 顺手销毁 */
    private get win(): any | null { return G.__tomatoQuickNoteWin_v4 ?? null; }
    private set win(v: any) { G.__tomatoQuickNoteWin_v4 = v; }

    onload(plugin: BaseTomatoPlugin) {
        this.plugin = plugin;
        // 总开关（默认开；关闭=命令不注册/热键不响应，与拍照闪念同款冷生效）。
        // 关闭时顺手销毁现役池窗：通道/热键全注销后隐藏窗只会孤儿般占内存（qn-robust）
        if (!quickNoteCheckbox.get()) {
            this.destroyPooledWins();
            return;
        }
        // 桌面端专用：移动端/浏览器端（window.require 不存在）不注册命令不监听
        if (events.isMobile || typeof window.require !== "function") return;
        // □2 池窗跨 reload 存活，透明度是窗属性跟着窗走；实例字段跨 reload 重置须重读记忆
        this.curOpacity = quickNoteRect.get()?.opacity ?? 1;

        // 旧版池窗清理（□1~□3 无 chips/keep 协议、v2 无 close 迟到守卫、v3 无三可调）：
        // deploy 升级 reload 后残留会 show 出旧 UI/旧行为——直接销毁（仅插件 reload 升级
        // 场景出现一次，正常使用零触发）
        this.destroyPooledWins(["__tomatoQuickNoteWin", "__tomatoQuickNoteWin_v2", "__tomatoQuickNoteWin_v3"]);

        // 主窗收文：BroadcastChannel。插件经 window.eval 重载后旧实例的 channel 仍在监听
        // （同窗双 client=消息双投，e2e 实锤）——挂 globalThis 先 close 旧再建新
        try {
            G.__tomatoQuickNoteCh?.close?.();
            G.__tomatoQuickNoteCh = this.ch = new BroadcastChannel(QN_CHANNEL);
            this.ch.onmessage = (e: MessageEvent) => {
                debugLog("quicknote", `ch raw: ${JSON.stringify(e.data)?.slice(0, 120)}`, "quicknote");
                void this.onMsg(e.data);
            };
        } catch (e) {
            debugLog("quicknote", `ch listen fail ${e}`, "quicknote");
        }

        plugin.addCommand({
            langKey: QuickNote速记器全局.langKey,
            langText: QuickNote速记器全局.langText(),
            hotkey: QuickNote速记器全局.m,
            // callback=命令面板/自定义键入口：全局热键被其他实例抢注（后注册静默失败）
            // 时 dev 实例仍可从命令面板唤起——e2e 验证通道保命
            callback: () => void this.onHotkey(),
            globalCallback: () => void this.onHotkey(),
        });
    }

    private async onHotkey() {
        debugLog("quicknote_hotkey", "", "quicknote");
        // 全局热键理应路由主窗；守卫防分离窗进程各建小窗
        if (!isMainWin()) return;
        // □4 形态分支：focus=带出思源主窗+打开拍照闪念面板（无外部窗参与）
        if (quickNoteOpenMode.get() === "focus") {
            await this.openInMainWin();
            return;
        }
        let win = this.win;
        let pooled = 1;
        if (win?.isDestroyed()) this.win = win = null;
        // □4 toggle 语义（用户拍板）：可见=收起，不可见=唤起
        if (win?.isVisible()) {
            this.hide();
            return;
        }
        // 首建加载在途：第一次热键的 show 已在链上，此处抢 show=白窗一闪，静默让路
        if (this.winLoading) return;
        if (!win) {
            pooled = 0;
            win = await this.createWindow();
            if (!win) {
                siyuan.pushMsg(tomatoI18n.速记器打开失败, 2000);
                return;
            }
        }
        try {
            const { screen } = window.require("@electron/remote");
            // □2 记忆恢复：有记忆且与当前某屏仍有交集=原地原样弹出（部分压边保留用户
            // 摆位）；完全出屏（拔显示器/改分辨率）回落默认「鼠标屏居中上 1/3」。
            // setBounds 会触发 moved/resized → debounce 写回同值，幂等无害
            const saved = quickNoteRect.get();
            win.setBounds(qnFitRect(saved, screen.getAllDisplays().map((d: any) => d.workArea))
                ?? qnWindowRect(
                    screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea, QN_W, QN_H));
            try { win.setOpacity(this.curOpacity); } catch { /* 窗已亡 */ }
            win.show();
            win.focus();
            this.lastShowAt = Date.now();
            // 面板侧可能改过类型/连续输入——唤起时推最新态（池化窗不重跑 load 的 hello）
            this.pushState();
            debugLog("quicknote_show", `ok pooled=${pooled}`, "quicknote");
        } catch (e) {
            debugLog("quicknote_show", `fail ${e}`, "quicknote");
        }
    }

    /** focus 形态：思源主窗前台 + 打开拍照闪念 Tab 面板（原 ⌥7 的 openTab 段收编） */
    private async openInMainWin() {
        try {
            const remote = window.require("@electron/remote");
            const main = remote.getCurrentWindow();
            if (main.isMinimized?.()) main.restore();
            main.show();
            main.focus();
        } catch { /* remote 不可用时仍照常开面板（面板在主窗内） */ }
        await openTab({
            app: this.plugin.app,
            custom: {
                icon: "iconCamera",
                title: tomatoI18n.拍照闪念,
                data: {},
                id: this.plugin.name + TAB_TYPE,
            },
        });
    }

    /** 首建窗口：按鼠标屏定位 → loadURL（端口随实例变，从插件运行环境推导勿写死） */
    private async createWindow(): Promise<any | null> {
        this.winLoading = true;
        try {
            const { BrowserWindow, screen } = window.require("@electron/remote");
            const rect = qnWindowRect(
                screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea, QN_W, QN_H);
            const win = new BrowserWindow({
                ...rect,
                frame: false,
                alwaysOnTop: true,
                show: false,
                // □2 尺寸可调：macOS Electron frameless 实测（40.8 darwin）resizable:true
                // 自带边缘/右下角原生热区，页面无须自绘手柄；min=chips/输入/按钮压不死下限
                resizable: true,
                minWidth: QN_MIN_W,
                minHeight: QN_MIN_H,
                skipTaskbar: true,
            });
            // 先占池再异步加载：加载窗内二次热键不重建（review P2 双击竞态）
            this.win = win;
            try {
                await win.loadURL(`${location.origin}/plugins/sy-tomato-plugin/quicknote/quicknote.html`);
            } catch (e) {
                this.win = null;
                win.destroy?.();
                throw e;
            }
            // □2 位置/尺寸记忆：moved/resized 是「手势结束」级事件（非 move 高频流），
            // debounce 收尾写盘兜连拖；恢复用 setBounds 也会触发——写回同值幂等
            win.on("moved", () => this.saveRect());
            win.on("resized", () => this.saveRect());
            return win;
        } catch (e) {
            debugLog("quicknote", `create fail ${e}`, "quicknote");
            return null;
        } finally {
            this.winLoading = false;
        }
    }

    /** 小窗初始态推送：类型集/当前类型/连续输入/透明度（与 NoteBox 面板共享同一组存储） */
    private pushState() {
        this.ch?.postMessage({
            type: "state",
            icons: parseNoteKinds(noteBoxAllKinds.get()),
            icon: storeNoteBox_selectedNoteType.get() || QN_ICON,
            keep: get(storeNoteBox_keep),
            opacity: this.curOpacity,
        });
    }

    private async onMsg(data: unknown) {
        // 所有权守卫：分离窗/浮窗的同源插件实例也会收到广播（globalThis 每窗
        // 独立、this.win 恒 null），不守卫=每窗各存一份；池化窗口只属于建它的主窗上下文，
        // 主窗 window.eval 重载后 globalThis 存活、归属不丢（review P0-1）
        if (!this.win || this.win.isDestroyed?.()) return;
        const msg = qnParseMsg(data);
        if (!msg) return;
        if (msg.type === "close") {
            // 迟到守卫：blur 的因果时刻早于最近一次 show ⇒ 描述的是已被热键唤起
            // 覆盖的旧失焦（hidden 页面 timer 节流迟到），执行=刚 show 的窗被收掉闪现
            if (qnCloseStale(msg.at, this.lastShowAt)) {
                debugLog("quicknote", `close stale drop at=${msg.at} show=${this.lastShowAt}`, "quicknote");
                return;
            }
            this.hide();
            return;
        }
        if (msg.type === "hello") {
            this.pushState();
            return;
        }
        if (msg.type === "icon") {
            storeNoteBox_selectedNoteType.save(msg.icon);
            return;
        }
        if (msg.type === "keep") {
            storeNoteBox_keep.set(msg.keep); // subscribe 自动落盘，面板/小窗共享
            return;
        }
        if (msg.type === "openDaily") {
            // 带出思源主窗：用户常在 VSCode 等外部应用唤起小窗点日历——主窗在后台时
            // 日记已在后台窗打开但屏幕毫无变化=「没反应」。onMsg 跑在主窗插件上下文，
            // getCurrentWindow=主窗；先 show 主窗再开日记最后收小窗，避免屏幕闪空档
            try {
                const main = window.require("@electron/remote").getCurrentWindow();
                if (main.isMinimized?.()) main.restore();
                main.show();
                main.focus();
            } catch { /* remote 不可用仍照常开日记 */ }
            const id = await getTargetID(storeNoteBox_selectedNotebook.getOr());
            if (id) await OpenSyFile2(this.plugin, id);
            this.hide();
            return;
        }
        if (msg.type === "sync") {
            void siyuan.performSync(true);
            return;
        }
        if (msg.type === "opacity") {
            this.curOpacity = msg.v;
            try { this.win?.setOpacity(msg.v); } catch { /* 窗已亡 */ }
            debugLog("quicknote", `opacity ${msg.v}`, "quicknote");
            this.saveRect(true); // 档位循环低频点击，即时落盘
            return;
        }
        await this.onSubmit(msg);
    }

    /** □2 记忆写盘：当前窗 bounds+透明度整体落 quickNoteRect（write 落盘非 set）。
     *  immediate=true 跳 debounce（opacity 点击）；否则 debounce 收尾（moved/resized） */
    private saveRect(immediate = false) {
        const grab = () => {
            this.rectTimer = null;
            try {
                const b: { x: number; y: number; width: number; height: number } | undefined = this.win?.getBounds?.();
                if (b) void quickNoteRect.write({ ...b, opacity: this.curOpacity });
            } catch { /* 窗已亡则无事可做 */ }
        };
        if (this.rectTimer) clearTimeout(this.rectTimer);
        if (immediate) grab();
        else this.rectTimer = setTimeout(grab, QN_RECT_DEBOUNCE);
    }

    private hide() {
        try {
            if (this.win && !this.win.isDestroyed()) this.win.hide();
        } catch { /* 窗已亡则无事可做 */ }
    }

    /** 销毁给定键族的池窗（globalThis 置空）：开关关闭=全量（含现役 v4）防孤儿窗占内存；
     *  正常 onload 只清历史版本键（reload 升级后旧协议窗残留会 show 出旧 UI）。
     *  兜底（qn-robust）：整页 reload 时 globalThis 池随旧渲染上下文蒸发，真
     *  BrowserWindow 由主进程持有→孤儿隐藏到思源退出——枚举主进程真窗补刀（URL 限定
     *  quicknote.html 防误杀；现役 v4 池窗按 id 豁免=插件 reload 存活语义不破） */
    private destroyPooledWins(keys = ["__tomatoQuickNoteWin", "__tomatoQuickNoteWin_v2",
        "__tomatoQuickNoteWin_v3", "__tomatoQuickNoteWin_v4"]) {
        for (const k of keys) {
            const w = G[k];
            if (w) {
                try { if (!w.isDestroyed?.()) w.destroy?.(); } catch { /* 已亡 */ }
                G[k] = null;
            }
        }
        try {
            if (typeof window.require !== "function") return; // 移动端/浏览器端无自建窗
            // 枚举是进程级、豁免只认本窗 globalThis——分离窗/块窗的插件实例 this.win 恒 null（零豁免）
            // 会把主窗现役池窗连同未提交草稿误杀（review P0-1），只许主窗清。判据用 pathname（核心
            // openNewWindow 给分离窗固定加载 window.html，URL 在文档期即定）；isMainWin 的 focus span
            // 在 onload 时布局未渲染恒 false 会连主窗一起拒（qn-robust e2e 实锤，勿换回）
            if (location.pathname.includes("/window.html")) return;
            const live = G.__tomatoQuickNoteWin_v4;
            const liveID = live && !live.isDestroyed?.() ? live.id : null;
            const { BrowserWindow } = window.require("@electron/remote");
            for (const w of BrowserWindow.getAllWindows()) {
                if (w.id === liveID) continue;
                let url = "";
                try { url = w.webContents?.getURL?.() ?? ""; } catch { /* 加载中/已亡 */ }
                if (!url.includes("/plugins/sy-tomato-plugin/quicknote/quicknote.html")) continue;
                try { w.destroy?.(); } catch { /* 已亡 */ }
            }
        } catch { /* remote 不可用/枚举中途窗亡——本轮放弃，下次 onload 再清 */ }
    }

    /** 保存编排：同构收集块落当天日记（类型=小窗 chips 现值）→ recentText → 回执小窗。
     *  失败=小窗红字保留内容不隐藏（重按 Enter 重试）；成功=清空，连续输入开着不收窗 */
    private async onSubmit(msg: { text: string; icon?: string; keep?: boolean }) {
        debugLog("quicknote_submit", msg.text.slice(0, 80), "quicknote");
        try {
            const id = await insertIntoDailynote(msg.text, false, msg.icon ?? QN_ICON);
            // siyuan.call 对内核错误静默返 null（insertIntoDailynote 不抛）——done 回执前
            // 核验落块存在，防「假成功清草稿」静默丢数据（review P1-1）
            if (!id || !(await siyuan.checkBlockExist(id))) {
                throw new Error(tomatoI18n.速记器保存校验失败);
            }
            storeNoteBox_recentText.save({ id, type: msg.icon ?? QN_ICON, text: msg.text });
            debugLog("quicknote_saved", `ok id=${id}`, "quicknote");
            this.ch?.postMessage({ type: "done" });
            if (!msg.keep) this.hide();
        } catch (e) {
            const reason = String((e as any)?.message ?? e);
            debugLog("quicknote_saved", `fail ${reason}`, "quicknote");
            this.ch?.postMessage({ type: "failed", msg: reason });
        }
    }

    /** 插件禁用/reload 卸载时收尾：关监听+收窗。勿 destroy 窗——池化语义跨重载存活 */
    onunload() {
        try { this.ch?.close(); } catch { /* 已关 */ }
        G.__tomatoQuickNoteCh = null;
        this.hide();
    }
}

export const quickNoteBox = new QuickNote();
