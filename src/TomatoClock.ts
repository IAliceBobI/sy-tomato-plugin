import { Custom, Dialog, openTab, openWindow } from "siyuan";
import { count, getActiveDocID, isMainWin, isValidNumber, setTimeouts, shuffleArray, siyuan, tryFixCfg } from "./libs/utils";
import { STORAGE_TOMATO_TIME, STORAGE_TOMATO_STATS } from "./constants";
import { events } from "./libs/Events";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { DestroyManager } from "./libs/destroyer";
import TomatoVedio from "./TomatoClockVedio.svelte";
import { addIcon, isPinned, removeStatusBar } from "./libs/ui";
import { tomato_clocks, tomato_clocks_audio, tomato_clocks_break, tomato_clocks_change_bg, tomato_clocks_change_bg_dark, tomato_clocks_force_dialog, tomato_clocks_force_notice, tomato_clocks_focus, tomato_clocks_loop, tomato_clocks_notice, tomato_clocks_opacity, tomato_clocks_position_right, tomatoClockCheckbox, tomato_microbreak, tomato_microbreak_dialog, tomato_microbreak_duration, tomato_microbreak_max, tomato_microbreak_min, tomato_microbreak_notice, tomato_microbreak_notification } from "./libs/stores";
import MicroBreakDialog from "./MicroBreakDialog.svelte";
import { MicroBreakScheduler, clampMicroBreakDuration } from "./libs/MicroBreakCore";
import { tomatoI18n } from "./tomatoI18n";
import { verifyKeyTomato } from "./libs/user";
import { newID } from "stonev5-utils";
import { mount, unmount } from "svelte";
import { TomatoTimer, type TomatoPersist, type TomatoPhase, type TomatoRunConfig, type TomatoSnapshot, type TomatoCompleteVia } from "./libs/TomatoTimer";
import { dayKey, recordPomodoro, statsFor, type TomatoStatsData } from "./libs/TomatoStats";
import { FOCUS_ATTR, mergeFocusMinutes } from "./libs/TomatoFocus";
import { parseClocks } from "./libs/TomatoClockList";
import { NOTICE_AUDIO_URL } from "./libs/TomatoAudioList";
import { debugLog } from "./libs/logUtils";
import {
    armNoticeAudioUnlock,
    blockedGuidance,
    disarmNoticeAudioUnlock,
    playNoticeAudio as playNoticeAudioCh,
    raceNoticePlay,
    unlockNoticeAudio,
    type NoticeAudioResult,
} from "./libs/NoticeAudio";

function formatClock(ms: number): string {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const TAB_TYPE = "custom_tab_TomatoClock";

export const TomatoClockID = "jadfddMPDSSeedsOMWAJEgwyMpBOTxUaDSTHyShpHlJHKu";

function isTomatoClockBox() {
    return document.getElementById(TomatoClockID) != null;
}

class TomatoClock {
    plugin: BaseTomatoPlugin;
    private timer: TomatoTimer;
    private tickID: any;
    /** 状态栏常驻倒计时文本项（idle 隐藏；点击=循环模式跳下一段/单段模式弹剩余） */
    private countdownEl: HTMLElement | null = null;
    /** 数字番茄图标元素表（当前档高亮用） */
    private clockEls = new Map<number, HTMLElement>();
    /** 休息段小窗（循环模式；到点自动关）与窗内倒计时行 */
    private breakDialog: Dialog | null = null;
    private breakCountdownEl: HTMLElement | null = null;
    /** 今日轻统计（按日 map，长期保留不清理） */
    private stats: TomatoStatsData = {};
    /** 专注写回的绑定文档 id（□3）：start 时快照，回 idle 作废；空串=本轮不写回 */
    private focusDocID = "";
    private customTab: (options: any) => Custom;
    /** 明暗主题切换监听（□4）：计时中换主题即时换背景图，不再等下一次状态变化 */
    private themeObserver: MutationObserver | null = null;
    /** 微休息调度器（devbatch □3）：工作时段内随机时刻触发，snap 由 tick 透传 */
    private micro: MicroBreakScheduler | null = null;
    /** 微休息弹窗（到点自动关；同时至多一个，新触发顶掉旧窗）与窗内组件实例 */
    private microDialog: Dialog | null = null;
    private microComp: ReturnType<typeof mount> | null = null;

    /** □4 时序统一：index.async onload 已 await taskCfg（框架保序），双路竞态消化退役 */
    onload(plugin: BaseTomatoPlugin) {
        if (!tomatoClockCheckbox.get()) return;

        this.customTab;
        this.plugin = plugin;
        // 09-16 提示音加固：加载即挂首次交互兜底解锁（reload 后自动恢复计时、尚未点击的场景）
        armNoticeAudioUnlock(() => this.noticeAudioUrl());

        // 跨代残留清理：reload 惰性路径不调 onunload，上一代拖动中的预览层可能挂在 body 上
        deleteBgDiv(PREVIEW_ID);
        // data-theme-mode 挂在 <html>（思源 assets.ts setAttribute）；切换即按新主题重挂背景。
        // 跨代守卫（□7）：reload 惰性路径不调 onunload，旧代 observer 残留——代际号不匹配即自杀
        this.themeObserver = new MutationObserver((_m, obs) => {
            if (bgGenStale()) { obs.disconnect(); return; }
            void this.maintainBgImg();
        });
        this.themeObserver.observe(document.documentElement, { attributeFilter: ["data-theme-mode"] });

        this.timer = new TomatoTimer({
            now: () => Date.now(),
            onStateChange: (snap) => this.renderState(snap),
            onPhaseComplete: (finished, next, finishedMinutes, via) => {
                this.onPhaseComplete(finished, next, finishedMinutes, via);
            },
        });
        // 微休息（devbatch □3）：设置每 tick 热读（面板改完即生效），触发出三通道开关分发
        this.micro = new MicroBreakScheduler({
            now: () => Date.now(),
            enabled: () => tomato_microbreak.get(),
            minMs: () => Number(tomato_microbreak_min.get()) * 60_000,
            maxMs: () => Number(tomato_microbreak_max.get()) * 60_000,
            onFire: () => this.fireMicroBreak(),
        });

        // 重启恢复（W1）：新四字段格式；旧格式/过期数据由状态机判垃圾静默丢弃
        tryFixCfg(plugin.name, STORAGE_TOMATO_TIME)
            .then(() => this.plugin.loadData(STORAGE_TOMATO_TIME))
            .then(() => {
                let data = (this.plugin.data[STORAGE_TOMATO_TIME] ?? {}) as TomatoPersist;
                if (typeof data == "string") data = {} as any;
                if (this.timer.snapshot()) return; // 抢跑防御：loadData 链回来前用户已 start，以内存运行段为准
                // 先恢复绑定再 restore：restore 内部同步触发 renderState 落盘，晚赋值会把 persist 里的 focusDocID 覆盖丢
                this.focusDocID = typeof data.focusDocID == "string" ? data.focusDocID : "";
                const restored = this.timer.restore(data, this.runCfg());
                if (!restored) this.focusDocID = ""; // 垃圾/过期数据没恢复出段，绑定随之作废（防 stale）
                // 主题属性就绪前挂背景图无效，延迟兜底（沿旧实现）
                setTimeout(() => this.maintainBgImg(), 2000);
            });
        // 今日轻统计（□2）：按日 map 独立落盘，长期保留不清理
        tryFixCfg(plugin.name, STORAGE_TOMATO_STATS)
            .then(() => this.plugin.loadData(STORAGE_TOMATO_STATS))
            .then(() => {
                let s = (this.plugin.data[STORAGE_TOMATO_STATS] ?? {}) as TomatoStatsData;
                if (typeof s != "object" || !s || Array.isArray(s)) s = {};
                this.stats = s;
                this.renderCountdownIdle();
            });
        this.addStatusIcons();
        this.startTicking();

        this.customTab = plugin.addTab({
            type: TAB_TYPE,
            init() {
                const id = newID();
                this.element.innerHTML = `<div id="${id}"></div>`;
                this.data.dm = new DestroyManager();
                this.data.dm.add("custom-tab", () => { this.destroy(); });
                if (!isMainWin()) {
                    this.data.sv = mount(TomatoVedio, {
                        target: this.element.querySelector("#" + id),
                        props: {
                            vedioID: this.data.vedioID,
                            dm: this.data.dm,
                        }
                    });
                    this.data.dm.add("svelte", () => { if (this.data?.sv) unmount(this.data.sv); });
                    this.data.dm.add("close svg btn", () => document.getElementById("closeWindow").click());
                }
            },
            beforeDestroy() { },
            destroy() {
                this.data?.dm?.destroyBy("custom-tab");
            }
        });

        if (!events.isMobile) {
            setTimeouts(() => {
                if (isTomatoClockBox() && !isMainWin()) {
                    removeStatusBar(false);
                    if (!isPinned()) document.getElementById("pinWindow")?.click();
                }
            }, 200, 3000, 300);
        }
    }

    onunload() {
        bgMountSeq++; // 并发守卫（□7，评审 P1-1）：作废一切在飞挂载轮——卸载删层后不得被在飞 mount 回挂
        disarmNoticeAudioUnlock();
        clearInterval(this.tickID);
        this.closeBreakDialog();
        this.closeMicroBreakDialog(); // 微休息弹窗（□3）：卸载即撤，倒计时 interval 随组件 unmount 清
        this.themeObserver?.disconnect();
        this.themeObserver = null;
        deleteBgDiv(PREVIEW_ID);
        deleteColorDiv(); // 计时中卸载/禁用插件：真实背景层一并撤（评审 P2-1，残挂 body 无自愈入口）
    }

    private runCfg(): TomatoRunConfig {
        const br = Number(tomato_clocks_break.get());
        return {
            loop: tomato_clocks_loop.get(),
            breakMinutes: isFinite(br) && br > 0 ? br : 0,
        };
    }

    /** 每秒 tick：墙钟校验到期（治睡眠漂移）+ 刷新常驻倒计时与小窗倒计时 */
    private startTicking() {
        if (this.tickID) return;
        this.tickID = setInterval(() => {
            if (!this.timer) return;
            this.timer.tick();
            const snap = this.timer.snapshot();
            if (snap && this.countdownEl) this.updateCountdown(snap);
            if (snap && snap.phase == "break" && this.breakCountdownEl) {
                this.breakCountdownEl.textContent = formatClock(snap.remainingMs);
            }
            this.micro?.tick(snap); // 微休息（□3）：非 work 态/暂停内部自清，嵌套不打扰大循环
        }, 1000);
    }

    // ---------------- 渲染 ----------------

    private renderState(snap: TomatoSnapshot | null) {
        // focusDocID 由 UI 层随段透传（状态机不持有），idle 持久化为空省略字段
        this.plugin.saveData(STORAGE_TOMATO_TIME, { ...this.timer.toPersist(), focusDocID: this.focusDocID || undefined });
        if (!snap) { // 取消/结束回 idle：休息小窗别残留（含冻结倒计时）；绑定文档随之作废
            this.closeBreakDialog();
            this.focusDocID = "";
        }
        if (this.countdownEl) {
            if (snap) {
                this.countdownEl.style.display = "";
                this.updateCountdown(snap);
            } else {
                this.renderCountdownIdle();
            }
        }
        this.renderClockIcons(snap);
        this.maintainBgImg(snap);
    }

    private updateCountdown(snap: TomatoSnapshot) {
        if (!this.countdownEl) return;
        const prefix = snap.phase == "break" ? "☕" : "";
        const suffix = snap.paused ? " ⏸" : "";
        this.countdownEl.textContent = prefix + formatClock(snap.remainingMs) + suffix;
        this.countdownEl.setAttribute("aria-label",
            snap.loop ? tomatoI18n.点击跳到下一阶段 : `${tomatoI18n.番茄钟}🍅${tomatoI18n.查看剩余时间}`);
    }

    /** idle 态倒计时位显示今日番茄数（□2 轻统计：计时中 mm:ss / idle 🍅N 两态复用） */
    private renderCountdownIdle() {
        if (!this.countdownEl) return;
        if (this.timer?.snapshot()) return; // 计时中由 updateCountdown 管
        const t = this.todayStats();
        this.countdownEl.textContent = `🍅 ${t.pomo}`;
        this.countdownEl.setAttribute("aria-label", this.todayStatsText());
        this.countdownEl.style.display = "";
    }

    private todayStats() {
        return statsFor(this.stats, dayKey(new Date()));
    }

    private todayStatsText() {
        const t = this.todayStats();
        return `${tomatoI18n.番茄钟}🍅${tomatoI18n.今日番茄N个M分钟(t.pomo, t.min)}`;
    }

    private renderClockIcons(snap: TomatoSnapshot | null) {
        const name = tomatoI18n.番茄钟;
        for (const [minute, el] of this.clockEls) {
            if (minute === 0) continue; // 0 档=取消按钮，label 恒为「取消计时」（addTomatoClock 已设，勿覆盖）
            el.classList.remove("tomato-clock-running", "tomato-clock-paused");
            let label = `${name}🍅${minute}${tomatoI18n.分钟后休息}`;
            if (snap && minute == snap.workMinutes) {
                // 点击语义 A：当前档图标点击=暂停/恢复，label 随状态切换
                el.classList.add(snap.paused ? "tomato-clock-paused" : "tomato-clock-running");
                label = snap.paused
                    ? `${name}🍅${tomatoI18n.继续计时} (${minute}m)`
                    : `${name}🍅${tomatoI18n.暂停计时} (${minute}m)`;
            }
            el.setAttribute("aria-label", label);
        }
    }

    private async maintainBgImg(snap: TomatoSnapshot | null = this.timer?.snapshot()) {
        // 并发守卫（□7）：四触发源 fire-and-forget，首验未缓存时快速连触，后 resolve 的旧参数
        // 调用会覆盖新主题终态——自增 token，await 后不一致者放弃挂载，最新一轮说了算
        const seq = ++bgMountSeq;
        if (bgGenStale()) return; // 跨代守卫（□7）：旧代残留触发源（2s 兜底/旧 tick）全放弃
        const url = this.bgUrlForTheme();
        if (!url) {
            // 当前主题未配图（如 light 配了图、dark 空，计时中切主题）：须撤层而非早退遗留旧图
            deleteColorDiv();
            return;
        }
        // 工作段（含暂停）保留氛围；休息段让位视频小窗；idle 撤
        if (snap && snap.phase == "work") {
            await addColorDiv(url, () => seq !== bgMountSeq || bgGenStale())
        } else {
            deleteColorDiv()
        }
    }

    /** 当前主题对应的背景 URL（明/暗各自配置；主题属性未就绪返回空） */
    private bgUrlForTheme(): string {
        const mode = document.querySelector("[data-theme-mode]")?.getAttribute("data-theme-mode");
        if (!mode) return "";
        return (mode == "dark" ? tomato_clocks_change_bg_dark : tomato_clocks_change_bg).get();
    }

    // ---------------- 背景设置实时反馈（□4，供设置面板调用） ----------------

    /** 设置变更即时重挂：计时中改 URL/透明度即刻生效，不再等下一次计时状态变化 */
    refreshBgImg() {
        void this.maintainBgImg();
    }

    /** 全屏拖动预览（□4 滑块）：与真实背景同款 div 跟手变透明度；当前主题未配图则不预览。
     *  付费校验留给转真挂载时——预览≤数秒且行级 disabled 已挡未激活用户。
     *  zIndex 比真实层高 1：同值时后挂的 prepend 层在 DOM 序更前、绘制反被真实层盖住，
     *  预览读数会系统性偏移（评审 P1-1），预览必须明确压在真实层之上 */
    updateBgPreview(opacity: string) {
        const url = this.bgUrlForTheme();
        if (!url) return;
        const div = document.getElementById(PREVIEW_ID);
        if (div) {
            div.style.opacity = opacity;
        } else {
            mountBgDiv(PREVIEW_ID, url, opacity, "10000001");
        }
    }

    /** 预览收尾（松手/面板销毁）：撤预览层；计时中按真实配置重挂（此刻滑块值已 write 进 store） */
    endBgPreview() {
        deleteBgDiv(PREVIEW_ID);
        void this.maintainBgImg();
    }

    // ---------------- 状态栏元素 ----------------

    private addStatusIcons() {
        this.addCountdownItem();
        this.mountClockIcons();
    }

    /** 按当前配置挂档位图标（0 档=隐藏取消位 + 用户档）；重复挂前须先卸旧（remountStatusIcons） */
    private mountClockIcons() {
        for (const minute of [0, ...parseClocks(tomato_clocks.get())]) {
            this.addTomatoClock(minute);
        }
    }

    /** 即时重挂档位图标（□2：chips 勾选即时生效，不依赖整窗 reload）；
     * 常驻倒计时项不动；未挂载态（主开关 off 时插件加载，onload 未跑）跳过 */
    remountStatusIcons() {
        if (!this.countdownEl) return;
        for (const el of this.clockEls.values()) {
            el.remove();
            // SiYuan addStatusBar 只 push 不移除，同步摘掉防 detached 节点（带 listener）驻留内存
            const arr = (this.plugin as any).statusBarIcons as Element[];
            const i = arr?.indexOf(el) ?? -1;
            if (i >= 0) arr.splice(i, 1);
        }
        this.clockEls.clear();
        this.mountClockIcons();
        this.renderClockIcons(this.timer?.snapshot() ?? null);
    }

    /** 常驻倒计时文本项（D1，替代原眼睛图标） */
    private addCountdownItem() {
        const el = document.createElement("div");
        el.className = "toolbar__item ariaLabel";
        el.id = "tomato-countdown";
        el.style.display = "none";
        el.addEventListener("click", () => {
            const snap = this.timer?.snapshot();
            if (!snap) {
                void siyuan.pushMsg(this.todayStatsText(), 5000);
                return;
            }
            if (snap.loop) this.timer.skip();
            else this.showRemainingTime();
        });
        this.plugin.addStatusBar({
            element: el,
            position: tomato_clocks_position_right.get() ? "right" : "left",
        });
        this.countdownEl = el;
    }

    private async showRemainingTime() {
        const name = tomatoI18n.番茄钟;
        const snap = this.timer?.snapshot();
        if (!snap) {
            await siyuan.pushMsg(`${name}🍅` + tomatoI18n.未开始计时);
            return;
        }
        const totalSeconds = Math.floor(snap.remainingMs / 1000);
        await siyuan.pushMsg(tomatoI18n.剩余时间(name, Math.floor(totalSeconds / 60), totalSeconds % 60));
    }

    private addTomatoClock(minute: number) {
        const icon = `iconTomato${minute}`;
        addIcon(this.plugin, minute);

        const name = tomatoI18n.番茄钟;
        let label = `${name}🍅${minute}${tomatoI18n.分钟后休息}`;
        if (minute === 0) {
            label = `${name}🍅${tomatoI18n.取消计时}`;
        }
        const statusIconTemp = document.createElement("template");
        statusIconTemp.innerHTML = `<div class="toolbar__item ariaLabel" aria-label="${label}"><svg><use xlink:href="#${icon}"></use></svg></div>`;
        statusIconTemp.content.firstElementChild.addEventListener("click", async () => {
            unlockNoticeAudio(this.noticeAudioUrl()); // 09-16 加固：手势栈内静音解锁（幂等，开始计时正是最需要声音的时刻）
            const snap = this.timer.snapshot();
            if (minute === 0) {
                if (snap) {
                    this.timer.stop();
                    await siyuan.pushMsg(`${name}🍅${tomatoI18n.取消上次的计时}: ${Math.round(snap.durationMs / 60000)}m`, 5000);
                }
                return;
            }
            if (snap && minute == snap.workMinutes) {
                // 点击语义 A：当前档=暂停/恢复（休息段同理可暂停）
                const wasPaused = snap.paused;
                this.timer.pauseOrResume();
                await siyuan.pushMsg(`${name}🍅${wasPaused ? tomatoI18n.继续计时 : tomatoI18n.暂停计时}`, 3000);
                return;
            }
            // 新开/换档：循环开时=循环重起（换工作时长）；绑定文档随新段重取（□3）
            this.focusDocID = this.bindFocusDocID();
            this.timer.start(minute, this.runCfg());
            await siyuan.pushMsg(`${name}🍅${tomatoI18n.开始计时}: ${minute}m`, 5000);
        });
        const el = statusIconTemp.content.firstElementChild as HTMLElement;
        this.clockEls.set(minute, el);
        this.plugin.addStatusBar({
            element: el,
            position: tomato_clocks_position_right.get() ? "right" : "left",
        });
    }

    // ---------------- 到点/跳段副作用 ----------------

    /** 微休息触发（devbatch □3）：按三通道开关分发——弹窗倒计时（主）/轻提示（提示音+toast）/
     *  系统通知（桌面 Notification）。三开关全关时不打扰（间隔照常重掷，等于只记账无声版）。
     *  微休息期间工作计时照常走（嵌套非替代）。 */
    private fireMicroBreak() {
        const seconds = clampMicroBreakDuration(Number(tomato_microbreak_duration.get()));
        debugLog("microbreak", `fire duration=${seconds}s`, "tomato");
        if (tomato_microbreak_dialog.get()) this.showMicroBreakDialog(seconds);
        if (tomato_microbreak_notice.get()) {
            void this.playNoticeAudio(); // 复用到点提示音单例链（含解锁态），失败自有 Loki 打点
            void siyuan.pushMsg(`${tomatoI18n.微休息}: ${tomatoI18n.微休息提示语}`, seconds * 1000);
        }
        if (tomato_microbreak_notification.get()) this.pushMicroBreakNotification(seconds);
    }

    /** 微休息弹窗：轻量居中小窗+倒计时自治（组件内 interval，到 0 回调关闭）；新触发顶旧窗。
     *  显式关闭钮（vision P1-2）：时长可设 60s，不可逃弹窗不妥——header 补 ×（内核 Dialog
     *  桌面端默认无 ×，isMobile 限定），提前关只关窗、工作计时照常走。 */
    private showMicroBreakDialog(seconds: number) {
        this.closeMicroBreakDialog();
        const hostId = newID();
        const dialog = new Dialog({
            title: `${tomatoI18n.番茄钟}·${tomatoI18n.微休息}`,
            content: `<div id="${hostId}"></div>`,
            width: events.isMobile ? "80vw" : "280px",
            height: null,
            destroyCallback: () => {
                if (this.microDialog === dialog) {
                    this.microDialog = null;
                    this.unmountMicroComp();
                }
            },
        });
        // 关闭钮（vision P1-2 二轮修订）：内核 .b3-dialog__close 是 **svg 本体的类**、
        // 挂 .b3-dialog__container 直下（桌面端默认 fn__none、内核样式 18px+padding8+
        // 右上角定位全按这个形态给）——span 包一层塞 header=svg 拿不到尺寸约束渲染成
        // 漂浮大 ×。正解=完全复刻内核形态：裸 svg 直接 append 到 container。
        const container = dialog.element.querySelector(".b3-dialog__container");
        if (container instanceof HTMLElement) {
            const close = document.createElement("span");
            close.innerHTML = '<svg class="b3-dialog__close" style="display:block"><use xlink:href="#iconCloseRound"></use></svg>';
            const svg = close.firstElementChild as SVGSVGElement | null;
            if (svg) {
                svg.classList.remove("fn__none");
                svg.addEventListener("click", () => this.closeMicroBreakDialog());
                container.appendChild(svg);
            }
        }
        this.microDialog = dialog;
        this.microComp = mount(MicroBreakDialog, {
            target: dialog.element.querySelector("#" + hostId) as HTMLElement,
            props: { durationSec: seconds, onDone: () => this.closeMicroBreakDialog() },
        });
    }

    private closeMicroBreakDialog() {
        this.microDialog?.destroy();
    }

    private unmountMicroComp() {
        if (this.microComp) {
            unmount(this.microComp);
            this.microComp = null;
        }
    }

    /** 系统通知通道：桌面 Electron renderer 可用 web Notification；浏览器版权限拒绝/移动端
     *  不支持=静默跳过（有弹窗/轻提示兜底，通知只是加分项） */
    private pushMicroBreakNotification(seconds: number) {
        try {
            if (typeof Notification === "undefined") return;
            const title = `${tomatoI18n.番茄钟}·${tomatoI18n.微休息}`;
            if (Notification.permission === "default") {
                void Notification.requestPermission().then(p => {
                    if (p === "granted") new Notification(title, { body: tomatoI18n.微休息提示语 });
                });
                return;
            }
            if (Notification.permission === "granted") {
                new Notification(title, { body: `${tomatoI18n.微休息提示语}（${seconds}s）` });
            }
        } catch (e) {
            debugLog("microbreak", `notification fail ${String(e)}`, "tomato");
        }
    }

    private async onPhaseComplete(finished: TomatoPhase, next: TomatoSnapshot | null, finishedMinutes: number, via: TomatoCompleteVia) {
        const name = tomatoI18n.番茄钟;
        // 自然到点统一出声+记账；skip 是用户主动跳段，弹窗/toast 已是反馈，不叠声音不计数
        let audioBlocked = false;
        if (via === "expire") {
            audioBlocked = (await this.playNoticeAudio()) === "blocked";
            if (finished === "work") {
                this.recordStat(finishedMinutes);
                void this.writeBackFocus(finishedMinutes);
            }
        }
        if (finished === "work") {
            if (next) {
                // 自动循环：进休息段——弹休息小窗（带倒计时，到点自动关）
                await this.showBreakDialog(next, audioBlocked);
                await siyuan.pushMsg(`${name}${tomatoI18n.进入休息分钟(next.durationMs / 60000)}`, 5000);
            } else {
                // 单段模式到点：维持原强提醒行为
                await this.showTimeoutDialog(finishedMinutes, audioBlocked);
            }
            return;
        }
        // 休息段结束（自然到点或跳段）：关小窗、提示回工作
        this.closeBreakDialog();
        if (next) {
            await siyuan.pushMsg(`${name}${tomatoI18n.休息结束开始工作(next.workMinutes)}`, 5000);
        }
        // blocked 且无弹窗面可挂兜底钮（罕见：恢复计时后零交互到点），toast 引导一次；
        // toast 承诺「点击页面任意位置一次，下一轮即可恢复」——arm 兜底是首次交互一次性、
        // 到点 blocked 时多半已消费，弹 toast 前必须重挂（blockedGuidance：先 arm 后 toast，
        // 删 arm 行有测试钉）
        if (audioBlocked) {
            blockedGuidance(
                () => armNoticeAudioUnlock(() => this.noticeAudioUrl()),
                () => void siyuan.pushMsg(tomatoI18n.提示音被浏览器拦截, 5000),
            );
        }
    }

    /** 自然到点完成的工作段记账（□2：今日 N 番茄/M 分钟；只主窗记，防浮窗多实例双计） */
    private recordStat(minutes: number) {
        if (!isMainWin()) return;
        this.stats = recordPomodoro(this.stats, new Date(), minutes);
        this.plugin.saveData(STORAGE_TOMATO_STATS, this.stats);
    }

    /** 绑定文档（□3）：开关开且取得到激活文档才绑（progressive 同款组合：桌面 getActiveDocID / 移动端 events.docID）；空串=本轮不写回 */
    private bindFocusDocID(): string {
        if (!tomato_clocks_focus.get()) return "";
        return getActiveDocID() || events.docID || "";
    }

    /** 写回窗口判定（□3）：主窗或移动端才写。isMainWin 的 span[data-type=focus] 在移动端恒 false
     *  （那是桌面文件树面板专属元素且懒创建），会把拍板的移动端兜底写回整类拦死——对齐官方
     *  isWindow 判定（浮窗无 #toolbar）+ isMobile 补移动端。已知边角：双端 sync 同时恢复同段会双写（稀疏，接受） */
    private isWriteWin(): boolean {
        return events.isMobile || document.getElementById("toolbar") != null;
    }

    /** 绑定文档写回专注分钟（□3）：主窗/移动端写（防浮窗多实例双写）；文档已删/接口失败静默丢弃，零打扰 */
    private async writeBackFocus(minutes: number) {
        if (!this.isWriteWin()) return;
        const docID = this.focusDocID;
        if (!docID) return;
        try {
            const attrs = await siyuan.getBlockAttrs(docID);
            const next = mergeFocusMinutes(attrs?.[FOCUS_ATTR], minutes);
            await siyuan.setBlockAttrs(docID, { [FOCUS_ATTR]: next } as AttrType);
        } catch (e) {
            console.error("Failed to write focus minutes:", e);
        }
    }

    /** 休息小窗：Dialog + 视频区 + 顶部倒计时行；休息到点由 onPhaseComplete 自动关，
     *  用户提前关窗只关内容、休息计时照常走（状态栏倒计时仍在）。
     *  audioBlocked（09-16）：到点提示音被自动播放策略拦时，窗内挂「播放提示音」兜底钮。 */
    private async showBreakDialog(breakSnap: TomatoSnapshot, audioBlocked = false) {
        this.closeBreakDialog();
        const vedioID = await this.pickNoticeVedioID();
        const breakMinutes = breakSnap.durationMs / 60000;
        const dm = new DestroyManager();
        const id = newID();
        const cdID = newID();
        const audioRowID = newID();
        const audioBtnID = newID();
        const audioRow = audioBlocked ? this.audioFallbackHtml(audioRowID) : "";
        const dialog = new Dialog({
            title: `${tomatoI18n.番茄钟}☕${tomatoI18n.休息N分钟(breakMinutes)}`,
            content: `${audioRow}<div id="${cdID}" style="text-align:center;font-size:1.6em;padding:4px 0 8px 0;font-variant-numeric:tabular-nums;"></div><div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : "500px",
            height: events.isMobile ? "180vw" : null,
            destroyCallback: () => {
                dm.destroyBy("1");
                if (this.breakDialog === dialog) {
                    this.breakDialog = null;
                    this.breakCountdownEl = null;
                }
            },
        });
        const d = mount(TomatoVedio, {
            target: dialog.element.querySelector("#" + id),
            props: { vedioID, dm }
        });
        dm.add("1", () => dialog.destroy())
        dm.add("2", () => unmount(d))
        if (audioBlocked) this.wireAudioFallbackBtn(dialog, audioRowID, audioBtnID);
        this.breakDialog = dialog;
        this.breakCountdownEl = dialog.element.querySelector("#" + cdID);
        const snap = this.timer.snapshot();
        if (snap?.phase == "break" && this.breakCountdownEl) {
            this.breakCountdownEl.textContent = formatClock(snap.remainingMs);
        }
    }

    private closeBreakDialog() {
        this.breakDialog?.destroy();
    }

    /** 到点提示音 URL（设置自定义优先，空回落内置 mp3） */
    private noticeAudioUrl(): string {
        const custom = (tomato_clocks_audio.get() ?? "").trim();
        return custom || NOTICE_AUDIO_URL;
    }

    /** 到点提示音（09-16 加固）：单例通道（libs/NoticeAudio）+失败分类。返回 played/blocked/error，
     *  notice 关/非主窗返回 null。blocked=自动播放拦截（调用方挂「播放提示音」兜底钮/toast 引导）；
     *  error 且配了自定义音=沿用「播放失败」toast（用户配了说明在意，静默最坑）。播放结果 1.5s
     *  不落地（自定义外链加载慢）按已播处理——到点弹窗不被慢 URL 阻塞（竞速+迟到补 toast=raceNoticePlay） */
    private async playNoticeAudio(): Promise<NoticeAudioResult | null> {
        if (!tomato_clocks_notice.get()) return null;
        if (!this.isWriteWin()) return null;
        const custom = (tomato_clocks_audio.get() ?? "").trim();
        const r = await raceNoticePlay(
            playNoticeAudioCh(this.noticeAudioUrl()),
            () => {
                if (custom) void siyuan.pushMsg(tomatoI18n.提示音播放失败, 3000);
            },
        );
        if (r === "error" && custom) void siyuan.pushMsg(tomatoI18n.提示音播放失败, 3000);
        return r;
    }

    /** blocked 兜底行（行壳）：按钮本体由 wireAudioFallbackBtn 用 DOM+textContent 造——
     *  i18n 文案不进 innerHTML 拼接；点击必在手势栈内必响，成功即解锁后续轮次 */
    private audioFallbackHtml(rowID: string): string {
        return `<div id="${rowID}" style="padding:0 0 6px 0;text-align:center;"></div>`;
    }

    private wireAudioFallbackBtn(dialog: Dialog, rowID: string, btnID: string): void {
        const row = dialog.element.querySelector("#" + rowID);
        if (!row) return;
        const btn = document.createElement("button");
        btn.id = btnID;
        btn.className = "b3-button b3-button--outline";
        btn.textContent = tomatoI18n.播放提示音;
        // □13-① 结果反馈：点了钮零反应（error/blocked）不再裸丢返回值——失败 toast+按钮留场可
        // 重试；成功（含超时按已播）按钮退场（声音本身即反馈）
        btn.addEventListener("click", () => {
            btn.disabled = true;
            void this.playNoticeAudio().then((r) => {
                if (r === "blocked") {
                    blockedGuidance(
                        () => armNoticeAudioUnlock(() => this.noticeAudioUrl()),
                        () => void siyuan.pushMsg(tomatoI18n.提示音被浏览器拦截, 5000),
                    );
                    btn.disabled = false; // 手势栈内仍被拦（极边角）：留钮重试
                    return;
                }
                if (r === "error") {
                    // 「播放失败」toast 由 playNoticeAudio 内部按自定义音已出；无自定义音的 error 静默留钮
                    btn.disabled = false;
                    return;
                }
                row.remove();
            });
        });
        row.appendChild(btn);
    }

    /** 从设置指定的文档（及子文档）随机挑一个视频块 id；未配置返回空 */
    private async pickNoticeVedioID(): Promise<string> {
        const docName = tomato_clocks_force_notice.get();
        if (!docName) return "";
        const rows = await siyuan.sql(`select id from blocks where content="${docName}" and type='d' limit 1`);
        if (rows?.length > 0) {
            return await getRandVedioID(rows[0].id)
        }
        return "";
    }

    private async showTimeoutDialog(minute: number, audioBlocked = false) {
        const vedioID = await this.pickNoticeVedioID();
        const title = `${tomatoI18n.番茄钟}🍅${minute} ${tomatoI18n.分钟已到}`
        if (events.isBrowser || tomato_clocks_force_dialog.get()) {
            const dm = new DestroyManager();
            const id = newID();
            const audioRowID = newID();
            const audioBtnID = newID();
            const audioRow = audioBlocked ? this.audioFallbackHtml(audioRowID) : "";
            const dialog = new Dialog({
                title,
                content: `${audioRow}<div id="${id}"></div>`,
                width: events.isMobile ? "90vw" : "500px",
                height: events.isMobile ? "180vw" : null,
                destroyCallback: () => {
                    dm.destroyBy("1")
                },
            });
            const d = mount(TomatoVedio, {
                target: dialog.element.querySelector("#" + id),
                props: { vedioID, dm }
            });
            dm.add("1", () => { dialog.destroy() })
            dm.add("2", () => { unmount(d) })
            if (audioBlocked) this.wireAudioFallbackBtn(dialog, audioRowID, audioBtnID);
        } else {
            // 桌面浮窗面挂不进兜底钮（TomatoVedio 组件不在此构造）；blocked 极罕见（桌面端粘性
            // 激活即放行），toast 引导兜底；弹前重挂 arm 兑现「点击一次即恢复」的引导（blockedGuidance）
            if (audioBlocked) {
                blockedGuidance(
                    () => armNoticeAudioUnlock(() => this.noticeAudioUrl()),
                    () => void siyuan.pushMsg(tomatoI18n.提示音被浏览器拦截, 5000),
                );
            }
            const tab = await openTab({ // custom
                app: this.plugin.app,
                custom: {
                    icon: "iconInfo",
                    title,
                    data: { vedioID },
                    id: this.plugin.name + TAB_TYPE
                },
            });
            openWindow({
                width: 500,
                height: 400,
                tab,
            });
        }
    }
}

async function getRandVedioID(docID: string) {
    let id = "";
    let version = await getTomatoVedioVersoin(docID);
    for (const _i of count(3)) {
        const ids = await getVedioIDs(docID, version)
        if (ids.length > 0) {
            id = ids[0];
            await siyuan.setBlockAttrs(id, { "custom-tomatoclockvedioversion": version } as AttrType)
            break;
        }
        version = await incTomatoVedioVersoin(docID, version);
    }
    return id;
}

async function getTomatoVedioVersoin(docID: string) {
    const docAttr = await siyuan.getBlockAttrs(docID);
    return docAttr["custom-tomatoclockvedioversion"] ?? "0";
}

async function incTomatoVedioVersoin(docID: string, version: string) {
    const v = Number(version) || 0;
    const attr = {} as AttrType;
    attr["custom-tomatoclockvedioversion"] = String(v + 1);
    await siyuan.setBlockAttrs(docID, attr);
    return attr["custom-tomatoclockvedioversion"]
}

async function getVedioIDs(docID: string, version: string) {
    const docRow = await siyuan.getDocRowByBlockID(docID);
    if (!docRow?.path) return;
    const path = docRow.path.slice(0, -3)
    const rows = await siyuan.sql(`select id,type,content from blocks where
        path like "${path}%" and type!="d"
        and ial not like '%custom-tomatoclockvedioversion="${version}"%'`)
    const ids = rows.filter(i => {
        if (i.type == "iframe" || i.type == "video") return true;
        if (i.content) return true;
    }).map(i => i.id);
    return shuffleArray(ids);
}

const ID = "MyGoodColorDiv2024-08-01 21:02:02";
// □4 全屏拖动预览层：与真实背景同款 div，独立 ID 便可单独撤除/跨代按 ID 清残留
const PREVIEW_ID = ID + "-preview";

// 背景链路双守卫（□7，评审 P2-2/P2-3）：
// ① 并发 token——挂载经 addColorDiv await 验钥（首验未缓存，内含 currentTimeMs 真实 IO），
//    期间新调用进来时旧轮后 mount 会覆盖新终态；token 自增后只有最新一轮的挂载算数
let bgMountSeq = 0;
// ② 跨代守卫——前端 runCode 执行插件无模块缓存，reload 整轮重跑模块顶层却不调 onunload，
//    旧代 themeObserver/定时器残留且共用同 ID 层，可删/盖新代层；模块顶层每跑一轮=新一代，
//    globalThis 代际号+1，旧代比对不符即自杀/放弃
const BG_GEN_KEY = "__tomatoClockBgGen";
const bgGen: number = ((globalThis as any)[BG_GEN_KEY] = (((globalThis as any)[BG_GEN_KEY] as number) || 0) + 1);
function bgGenStale(): boolean {
    return (globalThis as any)[BG_GEN_KEY] !== bgGen;
}

function deleteBgDiv(id: string) {
    const div = document.getElementById(id) as HTMLElement;
    div?.parentElement?.removeChild(div);
}

function mountBgDiv(id: string, url: string, opacity: string, zIndex = "10000000") {
    deleteBgDiv(id);
    const colorDiv = document.createElement('div');
    colorDiv.id = id;
    // 双引号+转义：url 含双引号会被 CSS 解析丢弃（评审 P2-4）；单引号路径同理不再用单引号包
    colorDiv.style.backgroundImage = `url("${url.replace(/"/g, "%22")}")`;
    colorDiv.style.position = 'fixed';
    colorDiv.style.top = '0';
    colorDiv.style.left = '0';
    colorDiv.style.width = '100%';
    colorDiv.style.height = '100%';
    colorDiv.style.opacity = opacity;
    colorDiv.style.zIndex = zIndex;
    colorDiv.style.pointerEvents = 'none';
    document.body.prepend(colorDiv);
    return colorDiv;
}

function deleteColorDiv() {
    deleteBgDiv(ID);
}

async function addColorDiv(url: string, isStale?: () => boolean) {
    deleteColorDiv()
    if (!await verifyKeyTomato()) return;
    if (isStale?.()) return; // 验钥期间有更新的一轮/一代接管：放弃挂载（层已撤，让最新者挂）

    let opacity = tomato_clocks_opacity.get();
    if (!isValidNumber(Number(opacity))) opacity = "0.16"

    mountBgDiv(ID, url, opacity);
}

export const tomatoClock = new TomatoClock();
