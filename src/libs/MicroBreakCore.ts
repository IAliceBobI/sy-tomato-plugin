// 微休息调度器纯逻辑（devbatch □3，2026-09-16 陆杰 om_x100b65a2d13758acb1f472e0282f3ef；
// 形态=bear 放行回帖 om_x100b65906ecc88a4c4a36aea3f02bf5 定稿）：番茄**工作时段内**每随机
// 3~5 分钟插 10 秒小休息——弹窗倒计时为主，轻提示/系统通知各开关自由选；与工作/休息大循环
// **嵌套非替代**（微休息期间工作计时照常走，Achuan-2「任务笔记管理」参考形态：预生成整阶段
// 时刻+默认关）。纯逻辑：不碰 DOM/siyuan API，时钟与随机源注入（单测直测，沿 TomatoTimer/
// splitInPlaceCore 先例）；UI 接线在 TomatoClock.ts。
//
// 段语义：
// - 只有 work 态计时中驱动（break/idle/paused 全部清时刻表）——暂停打断节奏，恢复后重新
//   随机起算（比墙钟顺延简单且语义自然：暂停≠还在工作）；
// - 触发即重掷下一时刻（预生成整阶段时刻：整段工作时间轴上的微休息序列一次定一格），
//   先重掷后回调（onFire 抛异常不会把 nextAt 留在过去=每秒重触发轰炸）；
// - 区间热生效自愈：tick 时发现 nextAt 押在新区间上限之外（用户把上限改小）→ 就地重掷；
//   改大不用管（旧时刻仍在有效区间，下一轮起用新区间）；
// - 防呆：下限至少 1 分钟（防连续轰炸），min>max 自动交换，时长 clamp 5~60 秒。
import type { TomatoSnapshot } from "./TomatoTimer";

export type MicroBreakOptions = {
    now(): number;
    /** 以下每 tick 热读（设置面板改完即生效，无需通知本调度器） */
    enabled(): boolean;
    minMs(): number;
    maxMs(): number;
    /** 触发回调（UI 层按三通道开关弹窗/轻提示/系统通知） */
    onFire(): void;
    /** 随机源 [0,1)，默认 Math.random（单测注入固定值锁区间边界） */
    rng?: () => number;
};

const MIN_INTERVAL_MS = 60_000;

export class MicroBreakScheduler {
    private nextAt: number | null = null;

    constructor(private opts: MicroBreakOptions) {}

    /** 下一时刻（工作态外/关闭= null；单测与实弹断言通道） */
    peekNextAt(): number | null {
        return this.nextAt;
    }

    /** 每秒由 UI 层接线调用（TomatoClock.startTicking）；snap=null/暂停/非 work 全部清表 */
    tick(snap: TomatoSnapshot | null): void {
        if (!this.opts.enabled() || !snap || snap.phase !== "work" || snap.paused) {
            this.nextAt = null;
            return;
        }
        const now = this.opts.now();
        const [lo, hi] = this.intervalRange();
        if (this.nextAt == null || this.nextAt - now > hi) this.nextAt = now + this.rollInterval(lo, hi);
        if (now >= this.nextAt) {
            this.nextAt = now + this.rollInterval(lo, hi);
            this.opts.onFire();
        }
    }

    private intervalRange(): [number, number] {
        const a = this.opts.minMs();
        const b = this.opts.maxMs();
        const lo = Math.max(MIN_INTERVAL_MS, Math.min(a, b));
        return [lo, Math.max(lo, Math.max(a, b))];
    }

    private rollInterval(lo: number, hi: number): number {
        const r = (this.opts.rng ?? Math.random)();
        return lo + r * (hi - lo);
    }
}

/** 微休息时长 clamp（设置面板 min/max 属性之外的运行时防呆：5~60 秒） */
export function clampMicroBreakDuration(seconds: number): number {
    const n = Number(seconds);
    if (!isFinite(n)) return 10;
    return Math.min(60, Math.max(5, Math.round(n)));
}
