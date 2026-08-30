// TomatoTimer —— 番茄钟状态机纯逻辑内核（□1 拍板：暂停/继续 + 自动循环 + 常驻倒计时，2026-08-29）。
// 五态：idle / work / work-paused / break / break-paused（循环关时 break 态不可达）。
// 纯逻辑：不碰 DOM 与 siyuan API，时钟注入；UI 接线（状态栏/小窗/背景图/落盘）在 TomatoClock.ts。
// 到点驱动：UI 层每秒调 tick()，用墙钟校验到期（治系统睡眠漂移），setTimeout 仅作兜底。

export type TomatoPhase = "work" | "break";

/** 段结束方式：expire=自然到点（轻统计只认这种）；skip=用户主动跳段 */
export type TomatoCompleteVia = "expire" | "skip";

export type TomatoSnapshot = {
    phase: TomatoPhase;
    paused: boolean;
    remainingMs: number;
    durationMs: number;
    /** 当前循环的工作时长（分钟） */
    workMinutes: number;
    /** 是否处于自动循环模式 */
    loop: boolean;
};

/** 落盘格式（2026-08-29 新格式，不兼容旧 {minute, startTime}，旧数据静默丢弃）：
 *  空对象 {} = idle；elapsedMs=0 表示计时中，>0 表示暂停中已计时长（startAt 为段起点墙钟锚）。
 *  focusDocID=专注写回的绑定文档 id（□3）：状态机不读不写，UI 层组装/消费，随段透传。 */
export type TomatoPersist = {
    phase?: TomatoPhase;
    startAt?: number;
    elapsedMs?: number;
    workMinutes?: number;
    breakMinutes?: number;
    focusDocID?: string;
};

export type TomatoTimerOptions = {
    now(): number;
    onStateChange?(snap: TomatoSnapshot | null): void;
    /** 一段结束（自然到点或 skip）：finished=刚结束的阶段，next=接续的新段快照（null=回 idle），
     *  finishedMinutes=刚结束段的分钟数（UI 到点弹窗显示用），via=结束方式（统计只认 expire） */
    onPhaseComplete?(finished: TomatoPhase, next: TomatoSnapshot | null, finishedMinutes: number, via: TomatoCompleteVia): void;
};

/** start/restore 时传入的运行配置（UI 层从设置读取） */
export type TomatoRunConfig = {
    loop: boolean;
    breakMinutes: number;
};

type SegmentState = {
    phase: TomatoPhase;
    /** 计时中=段起点；恢复时等效 startAt=now-elapsed */
    startAt: number;
    durationMs: number;
    /** 0=计时中；>0=暂停中已计时长 */
    pausedElapsedMs: number;
    workMinutes: number;
    breakMinutes: number;
    loop: boolean;
};

const MINUTE_MS = 60_000;

export class TomatoTimer {
    private seg: SegmentState | null = null;

    constructor(private opts: TomatoTimerOptions) {}

    snapshot(): TomatoSnapshot | null {
        const seg = this.seg;
        if (!seg) return null;
        const paused = seg.pausedElapsedMs > 0;
        const elapsed = paused ? seg.pausedElapsedMs : this.opts.now() - seg.startAt;
        return {
            phase: seg.phase,
            paused,
            remainingMs: Math.max(0, seg.durationMs - elapsed),
            durationMs: seg.durationMs,
            workMinutes: seg.workMinutes,
            loop: seg.loop,
        };
    }

    /** 开始（或换档重起：旧段作废）。循环开时即进入循环模式的第一段工作。 */
    start(workMinutes: number, cfg: TomatoRunConfig) {
        this.seg = {
            phase: "work",
            startAt: this.opts.now(),
            durationMs: workMinutes * MINUTE_MS,
            pausedElapsedMs: 0,
            workMinutes,
            breakMinutes: cfg.breakMinutes,
            loop: cfg.loop,
        };
        this.opts.onStateChange?.(this.snapshot());
    }

    /** 暂停/恢复 toggle；idle 时 no-op */
    pauseOrResume() {
        const seg = this.seg;
        if (!seg) return;
        if (seg.pausedElapsedMs > 0) {
            seg.startAt = this.opts.now() - seg.pausedElapsedMs;
            seg.pausedElapsedMs = 0;
        } else {
            seg.pausedElapsedMs = Math.max(0, this.opts.now() - seg.startAt);
        }
        this.opts.onStateChange?.(this.snapshot());
    }

    stop() {
        this.seg = null;
        this.opts.onStateChange?.(null);
    }

    /** 跳到下一阶段（放弃本段剩余，下一段完整起算）；非循环态 no-op */
    skip() {
        if (!this.seg || !this.seg.loop) return;
        this.enterNextPhase("skip");
    }

    /** 每秒由 UI 层调用：墙钟已过本段 deadline 则完成当前段并自动接续 */
    tick() {
        const seg = this.seg;
        if (!seg || seg.pausedElapsedMs > 0) return;
        if (this.opts.now() < seg.startAt + seg.durationMs) return;
        this.enterNextPhase("expire");
    }

    toPersist(): TomatoPersist {
        const seg = this.seg;
        if (!seg) return {};
        return {
            phase: seg.phase,
            startAt: seg.startAt,
            elapsedMs: seg.pausedElapsedMs,
            workMinutes: seg.workMinutes,
            breakMinutes: seg.breakMinutes,
        };
    }

    /** 从落盘恢复（W1）：垃圾/过期数据返回 null 并保持 idle。 */
    restore(data: TomatoPersist, cfg: TomatoRunConfig): TomatoSnapshot | null {
        if (data?.phase !== "work" && data?.phase !== "break") return null;
        if (typeof data.startAt !== "number" || !isFinite(data.startAt)) return null;
        const workMinutes = Number(data.workMinutes);
        const breakMinutes = Number(data.breakMinutes);
        if (!(workMinutes > 0) || !(breakMinutes >= 0)) return null;
        const elapsedMs = Number(data.elapsedMs ?? 0);
        if (!(elapsedMs >= 0) || !isFinite(elapsedMs)) return null;
        const durationMs = (data.phase === "work" ? workMinutes : breakMinutes) * MINUTE_MS;
        if (!(durationMs > 0)) return null;
        const paused = elapsedMs > 0;
        if (!paused && this.opts.now() >= data.startAt + durationMs) return null;
        this.seg = {
            phase: data.phase,
            startAt: data.startAt,
            durationMs,
            pausedElapsedMs: elapsedMs,
            workMinutes,
            breakMinutes,
            loop: cfg.loop,
        };
        const snap = this.snapshot();
        this.opts.onStateChange?.(snap);
        return snap;
    }

    private enterNextPhase(via: TomatoCompleteVia) {
        const seg = this.seg!;
        const finished = seg.phase;
        const finishedMinutes = seg.durationMs / MINUTE_MS;
        if (finished === "work" && seg.loop && seg.breakMinutes > 0) {
            this.switchSegment("break", seg.breakMinutes * MINUTE_MS);
            this.emitComplete(finished, finishedMinutes, via);
        } else if (finished === "break" && seg.loop) {
            this.switchSegment("work", seg.workMinutes * MINUTE_MS);
            this.emitComplete(finished, finishedMinutes, via);
        } else {
            this.seg = null;
            this.opts.onPhaseComplete?.(finished, null, finishedMinutes, via);
            this.opts.onStateChange?.(null);
        }
    }

    private switchSegment(phase: TomatoPhase, durationMs: number) {
        const seg = this.seg!;
        seg.phase = phase;
        seg.startAt = this.opts.now();
        seg.durationMs = durationMs;
        seg.pausedElapsedMs = 0;
    }

    private emitComplete(finished: TomatoPhase, finishedMinutes: number, via: TomatoCompleteVia) {
        const next = this.snapshot();
        this.opts.onPhaseComplete?.(finished, next, finishedMinutes, via);
        this.opts.onStateChange?.(next);
    }
}
