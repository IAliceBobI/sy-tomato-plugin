<!-- 思维导线两步间状态芯片（□3，spec §4.4/§5.2）：toast 级非浮条，fixed 顶部落位，
     pending 生命周期=组件生命周期；Esc/移动端 × 取消；出场 is-in 类下一帧加（0.15s），
     退场 dismiss() 摘类等 transitionend（220ms 兜底防后台 tab 不派发）后回调 onclosed -->
<script lang="ts">
    import { tomatoI18n } from "./tomatoI18n";

    let {
        word,              // 起点词文本（12 字截断由调用方 wordClip 处理）
        accent,            // CSS 颜色串（当前关系色，默认 --b3-font-color5）
        isMobile,
        oncancel,
        onclosed,          // 退场动画放完（或兜底超时）——调用方此时 unmount
    }: {
        word: string;
        accent: string;
        isMobile: boolean;
        oncancel: () => void;
        onclosed: () => void;
    } = $props();

    let root: HTMLDivElement;
    let closing = false;

    $effect(() => {
        requestAnimationFrame(() => root?.classList.add("is-in"));
    });

    function onkeydown(e: KeyboardEvent) {
        // 只认真键盘（复评 P2-1）：内核 wysiwyg/index.ts:4472 移动端块引用流程会向
        // window 合成派发 Esc（isTrusted=false），让位判定对合成键全部空过
        if (!e.isTrusted) return;
        if (e.key !== "Escape" || closing) return;
        // 让位判定（□2 评审 P1-4+复评 P1-1）：IME 组合态的 Esc=取消组词；内核浮层
        // 开着时第一次 Esc 关浮层、第二次才轮到芯片——避免「关个联想层顺手删了起点
        // 标记」（cancelPending 摘标记是写事务）。浮层开闭判定须用 fn__none 类：
        // 内核 Menu.removeImmediately 只加类不摘 element（isConnected 恒 true，e2e
        // 实锤开过一次菜单后 Esc 永久让位）；.b3-menu DOM 查询一并覆盖非单例 Menu
        // 实例（av 筛选等十余处 new Menu 不走 window.siyuan.menus.menu），单例读法
        // 留兜底。.protyle-toolbar 本体有意不进——终点词选中时工具条亮着「连到」，
        // 此刻 Esc 意图是弃线，取消应赢，内核顺手藏工具条无害
        if (e.isComposing || e.keyCode === 229) return;
        const menuEl = (globalThis as any).siyuan?.menus?.menu?.element as HTMLElement | undefined;
        if (document.querySelector(".b3-dialog--open, .protyle-hint:not(.fn__none), .protyle-util:not(.fn__none), .b3-menu:not(.fn__none)") ||
            (menuEl && !menuEl.classList.contains("fn__none"))) return;
        oncancel();
    }
    // capture（二期 □2）：内核 wysiwyg keydown 挂 protyle.element 冒泡阶段，Esc 多分支
    // stopPropagation——冒泡挂 window 收不到（□1 e2e 实锤两轮 Esc 不触发取消）；capture
    // 是传播首站恒可达；不拦传播，内核自己的 Esc 语义（关菜单/工具条）照常走
    $effect(() => {
        window.addEventListener("keydown", onkeydown, true);
        return () => window.removeEventListener("keydown", onkeydown, true);
    });

    let fired = false;
    export function dismiss() {
        if (closing || !root) return;
        closing = true;
        root.classList.remove("is-in");
        const done = () => {
            if (fired) return;
            fired = true;
            onclosed();
        };
        root.addEventListener("transitionend", done, { once: true });
        setTimeout(done, 220);
    }
</script>

<div class="tomato-mind-wire-pending" bind:this={root} style="--tomato-mind-wire-accent: {accent}" role="status">
    <span class="tomato-mind-wire-pending-dot"></span>
    <span class="tomato-mind-wire-pending-text">{tomatoI18n.已选}「{word}」 · {tomatoI18n.请选终点}</span>
    {#if isMobile}
        <button class="tomato-mind-wire-pending-x" aria-label={tomatoI18n.取消} onclick={() => { if (!closing) oncancel(); }}>
            <svg><use xlink:href="#iconClose"></use></svg>
        </button>
    {:else}
        <span class="tomato-mind-wire-pending-kbd">Esc</span>
        <span class="tomato-mind-wire-pending-tip">{tomatoI18n.取消}</span>
    {/if}
</div>

<style>
    .tomato-mind-wire-pending {
        position: fixed;
        top: 76px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10; /* 插件浮层安全档（spec 硬约束） */
        display: flex;
        align-items: center;
        gap: 6px;
        max-width: 80vw;
        padding: 6px 12px;
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        background: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        border-radius: 8px;
        box-shadow: var(--b3-tooltips-shadow);
        opacity: 0;
        translate: 0 4px;
        transition: opacity 0.15s ease-out, translate 0.15s ease-out;
    }
    /* is-in 由 JS 逐帧动态挂（出场时序），scoped 须 :global 组合防剪（踩坑索引先例） */
    .tomato-mind-wire-pending:global(.is-in) {
        opacity: 1;
        translate: 0 0;
    }
    .tomato-mind-wire-pending-dot {
        flex: none;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--tomato-mind-wire-accent);
    }
    .tomato-mind-wire-pending-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .tomato-mind-wire-pending-kbd {
        padding: 1px 5px;
        font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
        font-size: 11px;
        line-height: 1.4;
        color: var(--b3-theme-on-surface);
        background-color: var(--b3-theme-surface-lighter);
        border: solid 1px var(--b3-theme-surface-lighter);
        border-radius: 4px;
        box-shadow: inset 0 -1px 0 var(--b3-theme-surface-lighter);
    }
    .tomato-mind-wire-pending-x {
        width: 28px;
        height: 28px;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        display: grid;
        place-items: center;
        color: var(--b3-theme-on-surface);
    }
    .tomato-mind-wire-pending-x svg {
        width: 14px;
        height: 14px;
    }
</style>
