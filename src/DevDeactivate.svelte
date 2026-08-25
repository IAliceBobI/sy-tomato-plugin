<script lang="ts">
    // 开发者（isMe）专属「取消激活」按钮：已激活后激活卡/购买按钮全隐藏，本组件是
    // 唯一可见的退出激活通道（购买页 owned-banner 与两插件设置页共用）。
    // isMe() 读的 window.siyuan.user 由前端启动异步填充，非响应式源——组件渲染时
    // 未到位则 {#if} 永不重算（冷启动后立刻开面板按钮不出现）。短轮询兜底补渲染。
    import { isMe } from "./libs/user";
    import { deactivateDev } from "./libs/devDeactivate";

    let me = $state(isMe());
    $effect(() => {
        if (me) return;
        const timer = setInterval(() => {
            if (isMe()) me = true;
        }, 300);
        const stop = setTimeout(() => clearInterval(timer), 5000);
        return () => {
            clearInterval(timer);
            clearTimeout(stop);
        };
    });
</script>

{#if me}
    <button
        class="b3-button b3-button--text dev-deactivate"
        onclick={deactivateDev}
    >
        取消激活
    </button>
{/if}

<style>
    /* 开发者调试入口：弱化不抢视觉（不面向用户，文案不走 i18n） */
    .dev-deactivate {
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        opacity: 0.6;
    }
</style>
