<script lang="ts">
    import { onMount } from "svelte";
    import type { Snippet } from "svelte";
    import { icon } from "./utils";
    import { tomatoI18n } from "../tomatoI18n";

    // 轻量工具条容器（spec: 2026-08-24 prog-floatbar-design）：纯 position:fixed div +
    // 原生事件拖拽 + localStorage 存位置（设备属性，不走插件配置跨设备同步）。
    // 样板 sy-recite-plugin/src/FloatBar.svelte，泛化为共享组件。
    interface PropsType {
        posKey: string;
        title?: string;
        zIndex?: number;
        barClass?: string;
        onClose?: () => void;
        children: Snippet;
    }
    let {
        posKey,
        title = "",
        // 10 = 浮层安全档：内核弹层（Dialog/Menu）走 ++window.siyuan.zIndex 自 11 起，
    // 恒在其下（z12 会盖住首个弹窗——渐进加书弹窗被浮条遮、实弹 DOM 复核 2026-08-30）；
    // protyle 常驻元素 ≤9，10 仍浮于编辑器内容之上
    zIndex = 10,
        barClass = "",
        onClose,
        children,
    }: PropsType = $props();

    let bar: HTMLElement = $state();
    // □14 双浮条撞位：消费方只有渐进两浮条（v5 未发布无存量），默认位挪左下象限与
    // recite 浮条 (200,200) 左上错开；拖过一次后 localStorage 位置记忆接管
    let x = $state(200);
    let y = $state(Math.max(0, window.innerHeight - 200));

    // svelte-ignore state_referenced_locally
    // 位置键挂载时读一次即可（实例生命周期内不变，显隐变化走外层 {#if} 重挂载）
    try {
        const pos = JSON.parse(localStorage.getItem(posKey) ?? "null");
        if (pos?.x != null && pos?.y != null) {
            x = pos.x;
            y = pos.y;
        }
    } catch { /* 坏数据回默认位置 */ }

    function clamp() {
        if (!bar) return;
        // Math.max(0, ...) 双保险：即使量出浮条超视口（resize 竞态等）也退化为 0，不产生负区间锁死
        x = Math.max(0, Math.min(x, Math.max(0, window.innerWidth - bar.offsetWidth)));
        y = Math.max(0, Math.min(y, Math.max(0, window.innerHeight - bar.offsetHeight)));
    }

    function save() {
        try {
            localStorage.setItem(posKey, JSON.stringify({ x, y }));
        } catch { /* 私有模式等存储不可用时静默 */ }
    }

    function startDrag(e: MouseEvent) {
        if ((e.target as HTMLElement).closest("button")) return; // 按钮可点，不触发拖动
        const offX = e.clientX - x;
        const offY = e.clientY - y;
        const move = (ev: MouseEvent) => {
            x = ev.clientX - offX;
            y = ev.clientY - offY;
            clamp();
        };
        const up = () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
            save();
        };
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
    }

    function startDragTouch(e: TouchEvent) {
        if ((e.target as HTMLElement).closest("button")) return;
        // body 已滚出滚动区（矮视口溢出时）则让位原生滚动，不拖拽不 preventDefault——
        // 否则触摸永远滚不到被裁的按钮（review P2：恰恰在最需要滚的场景被劫持）
        const b = (e.target as HTMLElement).closest(".floatbar-body") as HTMLElement | null;
        if (b && b.scrollHeight > b.clientHeight) return;
        const t = e.touches[0];
        const offX = t.clientX - x;
        const offY = t.clientY - y;
        const move = (ev: TouchEvent) => {
            ev.preventDefault(); // document 级 touchmove 须 passive:false 才能阻止页面滚动
            x = ev.touches[0].clientX - offX;
            y = ev.touches[0].clientY - offY;
            clamp();
        };
        const up = () => {
            document.removeEventListener("touchmove", move);
            document.removeEventListener("touchend", up);
            save();
        };
        document.addEventListener("touchmove", move, { passive: false });
        document.addEventListener("touchend", up);
    }

    onMount(() => {
        clamp(); // 存的位置可能超当前视口（换设备/改窗口后）
        const onResize = () => clamp();
        window.addEventListener("resize", onResize);
        // 内容长高（子面板展开等）时底部可能溢出视口——拖拽/resize 之外的第三个钳位时机；
        // clamp 同值不触发 Svelte 更新，无回环（渐进 □10 平铺区常驻后实测必踩）
        const ro = new ResizeObserver(() => clamp());
        ro.observe(bar);
        return () => {
            window.removeEventListener("resize", onResize);
            ro.disconnect();
        };
    });
</script>

<div
    class="floatbar {barClass}"
    role="toolbar"
    tabindex="-1"
    aria-label={title || "float bar"}
    bind:this={bar}
    style="left:{x}px;top:{y}px;z-index:{zIndex}"
    onmousedown={startDrag}
    ontouchstart={startDragTouch}
>
    {#if title || onClose}
        <div class="floatbar-head">
            <div class="floatbar-title">{title}</div>
            {#if onClose}
                <button
                    class="b3-tooltips b3-tooltips__n floatbar-close"
                    aria-label={tomatoI18n.退出}
                    onclick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                >{@html icon("iconClose", 14)}</button>
            {/if}
        </div>
    {/if}
    <div class="floatbar-body">
        {@render children()}
    </div>
</div>

<style>
    /* 防锁死双保险之 CSS 半：max-width 限制 + body flex-wrap，按钮多自动换行，
       浮条物理上不超视口宽（另一半是 clamp 里的 Math.max(0, ...)） */
    .floatbar {
        position: fixed;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 4px;
        border-radius: 6px;
        background: var(--b3-theme-surface);
        box-shadow: var(--b3-point-shadow);
        cursor: move;
        user-select: none;
        max-width: calc(100vw - 16px);
        max-height: calc(100vh - 16px);
    }
    .floatbar-head {
        display: flex;
        align-items: center;
        gap: 2px;
    }
    /* width:0 使标题不参与浮条 shrink-to-fit 宽度计算（宽度由按钮行决定），
       min-width:calc(100%-24px) 拉齐按钮行，超长省略号截断 */
    .floatbar-title {
        width: 0;
        min-width: calc(100% - 24px);
        box-sizing: border-box;
        padding: 0 4px 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.4;
        color: var(--b3-theme-on-surface);
        opacity: 0.7;
    }
    .floatbar-close {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        padding: 0;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
    }
    .floatbar-close:hover {
        background-color: var(--b3-list-hover);
    }
    .floatbar-body {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        max-width: 100%;
        /* 矮视口里按钮多到超 max-height 时（低频折行+高级四组），旧版溢出盒外悬出
           视口不可达（□25：clamp 只保证盒在界内）；min-height:0 允许 flex 收缩，
           溢出转为条内滚动，一切按钮可达 */
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
    }
</style>
