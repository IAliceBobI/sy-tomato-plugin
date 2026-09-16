<script lang="ts">
    // devbatch □3 微休息弹窗（陆杰 09-16）：工作时段内每随机间隔插入 N 秒小休息的主通道
    // （弹窗倒计时）；10 秒量级=轻量居中小窗，倒计时结束自动关（onDone 由宿主销毁 Dialog）。
    // 倒计时自治（组件内 interval）；纯 b3 变量着色，明暗双态自动适配。
    import { tomatoI18n } from "./tomatoI18n";

    let { durationSec, onDone }: { durationSec: number; onDone: () => void } = $props();

    // durationSec 恒定（宿主一次传入），倒计时起点取初值快照（svelte-ignore：意图即初值）
    // svelte-ignore state_referenced_locally
    const totalSec = durationSec;
    let remain = $state(totalSec);
    const pct = $derived(Math.max(0, Math.min(100, (remain / totalSec) * 100)));

    $effect(() => {
        const t = setInterval(() => {
            remain -= 1;
            if (remain <= 0) {
                clearInterval(t);
                onDone();
            }
        }, 1000);
        return () => clearInterval(t);
    });
</script>

<div class="microbreak">
    <div class="microbreak__count" aria-live="polite">{remain}</div>
    <div class="microbreak__hint">{tomatoI18n.微休息提示语}</div>
    <div class="microbreak__bar">
        <div class="microbreak__bar-fill" style="width: {pct}%"></div>
    </div>
</div>

<style>
    .microbreak {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        /* 水平 12px（vision P2）：进度条通栏贴边顶到弹窗圆角边线，留边呼吸 */
        padding: 10px 12px 6px 12px;
        user-select: none;
    }
    .microbreak__count {
        font-size: 2.6em;
        font-weight: 600;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        color: var(--b3-theme-primary);
    }
    .microbreak__hint {
        font-size: var(--b3-font-size, 14px);
        color: var(--b3-theme-on-surface-variant, var(--b3-theme-on-surface));
    }
    .microbreak__bar {
        width: 100%;
        height: 4px;
        border-radius: 2px;
        background: var(--b3-theme-surface-lighter, rgba(128, 128, 128, 0.2));
        overflow: hidden;
    }
    .microbreak__bar-fill {
        height: 100%;
        border-radius: 2px;
        background: var(--b3-theme-primary);
        transition: width 1s linear;
    }
</style>
