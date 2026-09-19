<!-- 悬浮反链面板外壳（bkfloat □4）：position:fixed 单例挂 body；头栏=文档标题+透明度
     滑杆（0.40~1.00 step 0.05 默认 1.0）+收起钮；正文容器由宿主 BkFloat.ts mount
     BackLinkBottom（BKMaker 同款 props）；右下 SE 角 resize 手柄。拖拽/resize/几何/
     透明度 localStorage 记忆（DialogSvelte pointer 实现+key 模式，简化为 SE 单向）。
     显隐走 hidden class 而非 {#if}：bodyEl 恒在，正文组件生命周期完全由宿主管
     （收起=宿主先 unmount 正文停其刷新，再翻 open），容器测量类副作用不重烧。 -->
<script lang="ts">
    import { onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import { icon } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";

    interface Props {
        open: Writable<boolean>;
        title: Writable<string>;
        onCollapse: () => void;
        /** 正文容器就绪回调（一次）：宿主往里 mount BackLinkBottom */
        onBody: (el: HTMLElement) => void;
        /** 面板开合键位提示（confgather2 □2）：收起钮 tooltip 后缀，函数 prop 现求值防循环 import */
        panelKeyHint: () => string;
        /** 几何落定回调（拖拽/resize/窗口 resize 后）：宿主重算共存模式球让位 */
        onGeoChange?: () => void;
        /** 头栏工具区容器就绪回调（一次）：宿主往里塞专属控件（悬浮图=四档钮组+形态钮，
         *  graphfloat □3）；悬浮反链不传=无工具区 */
        onTools?: (el: HTMLElement) => void;
        /** 标题兜底文案（宿主未推 title 时显示；默认=悬浮反链，悬浮图传「悬浮图」） */
        fallbackTitle?: string;
        /** 裸正文模式（悬浮图）：去 padding+overflow hidden——画布类正文须精确填满
         *  容器（clientWidth 即内容宽，padding 会让 setCanvasSize 溢出出滚动条） */
        bare?: boolean;
    }
    let { open, title, onCollapse, onBody, panelKeyHint, onGeoChange, onTools, fallbackTitle = "", bare = false }: Props = $props();

    const LS_KEY = "tomato-bkfloat-panel";
    const MIN_W = 320;
    const MIN_H = 260;
    /** 默认宽高（spec：~520×420）与落位：右下角、离底 60px 让开状态栏 */
    const DEF_W = 520;
    const DEF_H = 420;
    const BOTTOM_CLEAR = 60;
    const EDGE = 24;
    /** 透明度下限即滑杆 min（0.40），上限 1.00 */
    const MIN_OPACITY = 0.4;

    let root: HTMLElement = $state();
    let bodyEl: HTMLElement = $state();
    let opacity = $state(1);
    let x = 0;
    let y = 0;
    let w = DEF_W;
    let h = DEF_H;

    interface Geo {
        x: number;
        y: number;
        w: number;
        h: number;
        o: number;
    }

    function clampV(v: number, min: number, max: number) {
        return Math.max(min, Math.min(max, v));
    }

    function applyGeo() {
        if (!root) return;
        w = clampV(w, MIN_W, Math.max(MIN_W, window.innerWidth - 2 * EDGE));
        h = clampV(h, MIN_H, Math.max(MIN_H, window.innerHeight - BOTTOM_CLEAR - EDGE));
        // Math.max(0,..)：视口小于面板时退化为 0，避免负区间把位置锁死（DialogSvelte 同款）
        x = clampV(x, 0, Math.max(0, window.innerWidth - w));
        y = clampV(y, 0, Math.max(0, window.innerHeight - h));
        root.style.left = `${x}px`;
        root.style.top = `${y}px`;
        root.style.width = `${w}px`;
        root.style.height = `${h}px`;
        root.style.opacity = String(clampV(opacity, MIN_OPACITY, 1));
    }

    function loadGeo() {
        const fallback = () => {
            w = DEF_W;
            h = DEF_H;
            opacity = 1;
            x = Math.max(0, window.innerWidth - DEF_W - EDGE);
            y = Math.max(0, window.innerHeight - DEF_H - BOTTOM_CLEAR);
        };
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const p = JSON.parse(raw) as Partial<Geo>;
                w = Number(p?.w);
                h = Number(p?.h);
                x = Number(p?.x);
                y = Number(p?.y);
                const o = Number(p?.o);
                opacity = Number.isFinite(o) ? clampV(o, MIN_OPACITY, 1) : 1;
                if (![w, h, x, y].every(Number.isFinite)) fallback();
            } else {
                fallback();
            }
        } catch {
            fallback();
        }
        applyGeo();
    }

    function saveGeo() {
        try {
            const p: Geo = { x, y, w, h, o: opacity };
            localStorage.setItem(LS_KEY, JSON.stringify(p));
        } catch {
            /* 存储满/隐私模式：几何仅会话内生效 */
        }
    }

    // ---- 头栏拖动（DialogSvelte pointer 实现同族） ----
    let dragging = $state(false);
    let offX = 0;
    let offY = 0;

    /** 交互子元素早退：滑杆/按钮/选择器在头栏内，pointerdown 冒泡进拖拽会把
     *  range 拖动杀死（preventDefault）+ setPointerCapture 重定向后续事件
     *  （评审 P0 实锤：鼠标拖滑杆面板被拖走）。工具区（悬浮图四档钮组等 span
     *  形态控件，非 button 元素）整区早退——capture 会吞 span 钮的 click（同族坑） */
    function interactiveTarget(e: PointerEvent): boolean {
        return !!(e.target as HTMLElement)?.closest?.("input, button, select, textarea, .tomato-bk-float-panel__tools");
    }

    function dragDown(e: PointerEvent) {
        if (!root || e.button !== 0 || interactiveTarget(e)) return;
        e.stopPropagation();
        e.preventDefault();
        dragging = true;
        const rect = root.getBoundingClientRect();
        offX = e.clientX - rect.left;
        offY = e.clientY - rect.top;
        // capture 失败（指针已释放/合成事件无活动指针）不阻断拖拽监听挂载
        try {
            (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
        } catch { /* 事件流仍走 window 监听 */ }
        window.addEventListener("pointermove", dragMove);
        window.addEventListener("pointerup", dragUp);
        // 系统手势/窗口切换等打断（pointer 流被取消不保证 pointerup）：兜底收尾防 stuck-drag
        window.addEventListener("pointercancel", dragCancel);
    }

    function dragMove(e: PointerEvent) {
        if (!dragging || !root) return;
        if (e.pointerType === "touch") e.preventDefault();
        x = e.clientX - offX;
        y = e.clientY - offY;
        // 拖动只夹位置，尺寸不动
        x = clampV(x, 0, Math.max(0, window.innerWidth - w));
        y = clampV(y, 0, Math.max(0, window.innerHeight - h));
        root.style.left = `${x}px`;
        root.style.top = `${y}px`;
    }

    function dragUp(e: PointerEvent) {
        window.removeEventListener("pointermove", dragMove);
        window.removeEventListener("pointerup", dragUp);
        window.removeEventListener("pointercancel", dragCancel);
        try {
            (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
        } catch { /* 无捕获可释放 */ }
        if (!dragging) return;
        dragging = false;
        saveGeo();
        onGeoChange?.();
    }

    /** pointercancel 收尾：清理监听复位状态，不落盘（打断≠完成一次拖动）。
     *  cancel 前位移已实时应用（几何可能已变），补 onGeoChange 让宿主重算球让位 */
    function dragCancel() {
        window.removeEventListener("pointermove", dragMove);
        window.removeEventListener("pointerup", dragUp);
        window.removeEventListener("pointercancel", dragCancel);
        dragging = false;
        onGeoChange?.();
    }

    // ---- SE 角 resize ----
    let resizing = false;
    let rsX = 0;
    let rsY = 0;
    let rsW = 0;
    let rsH = 0;

    function resizeDown(e: PointerEvent) {
        if (!root || e.button !== 0) return;
        e.stopPropagation();
        e.preventDefault();
        resizing = true;
        const rect = root.getBoundingClientRect();
        rsX = e.clientX;
        rsY = e.clientY;
        rsW = rect.width;
        rsH = rect.height;
        try {
            (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
        } catch { /* 事件流仍走 window 监听 */ }
        window.addEventListener("pointermove", resizeMove);
        window.addEventListener("pointerup", resizeUp);
        window.addEventListener("pointercancel", resizeCancel);
    }

    function resizeMove(e: PointerEvent) {
        if (!resizing || !root) return;
        if (e.pointerType === "touch") e.preventDefault();
        w = clampV(rsW + (e.clientX - rsX), MIN_W, Math.max(MIN_W, window.innerWidth - x));
        h = clampV(rsH + (e.clientY - rsY), MIN_H, Math.max(MIN_H, window.innerHeight - y));
        root.style.width = `${w}px`;
        root.style.height = `${h}px`;
    }

    function resizeUp(e: PointerEvent) {
        window.removeEventListener("pointermove", resizeMove);
        window.removeEventListener("pointerup", resizeUp);
        window.removeEventListener("pointercancel", resizeCancel);
        try {
            (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
        } catch { /* 无捕获可释放 */ }
        if (!resizing) return;
        resizing = false;
        saveGeo();
        onGeoChange?.();
    }

    /** pointercancel 收尾：清理监听复位状态，不落盘（打断≠完成；几何可能已变，补回调） */
    function resizeCancel() {
        window.removeEventListener("pointermove", resizeMove);
        window.removeEventListener("pointerup", resizeUp);
        window.removeEventListener("pointercancel", resizeCancel);
        resizing = false;
        onGeoChange?.();
    }

    // ---- 透明度滑杆：input 跟手只改内存+style，change（松手/键盘步进提交）才落盘
    //      （评审 P2：拖动中每 tick 写 localStorage 浪费） ----
    function onOpacityInput(el: HTMLInputElement) {
        const v = Number(el.value) / 100;
        opacity = clampV(v, MIN_OPACITY, 1);
        if (root) root.style.opacity = String(opacity);
    }

    function onOpacityChange() {
        saveGeo();
    }

    onMount(() => {
        loadGeo();
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("pointermove", dragMove);
            window.removeEventListener("pointerup", dragUp);
            window.removeEventListener("pointercancel", dragCancel);
            window.removeEventListener("pointermove", resizeMove);
            window.removeEventListener("pointerup", resizeUp);
            window.removeEventListener("pointercancel", resizeCancel);
        };
    });

    function onResize() {
        applyGeo();
        onGeoChange?.();
    }

    // 正文容器就绪上报（一次性语义由宿主保证：bodyEl 恒在只会上报一次）
    $effect(() => {
        if (bodyEl) onBody(bodyEl);
    });

    // 头栏工具区容器就绪上报（同一次性语义；未传 onTools 则不渲染）
    let toolsEl: HTMLElement = $state();
    $effect(() => {
        if (toolsEl) onTools?.(toolsEl);
    });
</script>

<div bind:this={root} class="tomato-bk-float-panel" class:hidden={!$open}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <header class="tomato-bk-float-panel__head" onpointerdown={dragDown}>
        <span class="tomato-bk-float-panel__title" title={$title}>{$title || fallbackTitle || tomatoI18n.悬浮反链}</span>
        {#if onTools}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span class="tomato-bk-float-panel__tools" bind:this={toolsEl}></span>
        {/if}
        <input
            class="b3-slider tomato-bk-float-panel__opacity"
            type="range"
            min="40"
            max="100"
            step="5"
            value={opacity * 100}
            aria-label={tomatoI18n.透明度}
            oninput={(e) => onOpacityInput(e.currentTarget)}
            onchange={onOpacityChange}
        />
        <button
            class="tomato-bk-float-panel__btn b3-tooltips b3-tooltips__n"
            aria-label={`${tomatoI18n.收起} ${panelKeyHint()}`}
            onclick={(e) => {
                e.stopPropagation();
                onCollapse();
            }}
        >{@html icon("Down", 14)}</button>
    </header>
    <div bind:this={bodyEl} class="tomato-bk-float-panel__body" class:tomato-bk-float-panel__body--bare={bare}></div>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="tomato-bk-float-panel__resizer"
        onpointerdown={resizeDown}
        aria-label="resize"
    ></div>
</div>

<style>
    .tomato-bk-float-panel {
        position: fixed;
        /* 10 = 浮层安全档：压过编辑器内容，恒低于内核弹层（菜单/对话框 z11+）；
           与球同档且宿主先挂本面板后挂球=同 z 下球绘制在上（面板不压球） */
        z-index: 10;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
        background: var(--b3-theme-background);
        border: 1px solid var(--b3-border-color);
        border-radius: 8px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
        min-width: 320px;
        min-height: 260px;
        /* 半透明档（透明度 0.4~1.0）下层文字与卡面文字交叠不可读：透出内容模糊化，
           滑杆调透明度的行为不变（评审 P1-7） */
        backdrop-filter: blur(10px);
    }
    .tomato-bk-float-panel.hidden {
        display: none;
    }
    .tomato-bk-float-panel__head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px 6px 12px;
        border-bottom: 1px solid var(--b3-border-color);
        background: var(--b3-theme-background);
        cursor: move;
        user-select: none;
        touch-action: none;
        flex-shrink: 0;
    }
    .tomato-bk-float-panel__title {
        flex: 1;
        min-width: 0;
        font-size: 13px;
        font-weight: 500;
        color: var(--b3-theme-on-background);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    /* 头栏工具区（悬浮图）：flex 收缩保护+钮间距；内部钮形态由宿主（dock 头栏同款
       block__icon 族）自带，容器只管布局 */
    .tomato-bk-float-panel__tools {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 2px;
    }
    .tomato-bk-float-panel__opacity {
        flex-shrink: 0;
        width: 88px;
        height: 16px;
    }
    .tomato-bk-float-panel__btn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--b3-theme-on-background);
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .tomato-bk-float-panel__btn:hover {
        background-color: var(--b3-list-hover, rgba(0, 0, 0, 0.075));
    }
    .tomato-bk-float-panel__btn :global(svg) {
        pointer-events: none;
    }
    .tomato-bk-float-panel__body {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: 6px 8px;
        box-sizing: border-box;
    }
    .tomato-bk-float-panel__body--bare {
        padding: 0;
        overflow: hidden;
    }
    .tomato-bk-float-panel__resizer {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 18px;
        height: 18px;
        cursor: nwse-resize;
        touch-action: none;
        z-index: 2;
        /* 斜纹 grip：常显低对比可发现，hover 增强（评审 P2-9：纯隐形热区不可发现） */
        background-image: repeating-linear-gradient(
            -45deg,
            transparent 0 4px,
            var(--b3-border-color) 4px 5px
        );
        border-radius: 0 0 7px 0;
        opacity: 0.55;
        transition: opacity 0.15s;
    }
    .tomato-bk-float-panel__resizer:hover {
        opacity: 1;
        background-image: repeating-linear-gradient(
            -45deg,
            transparent 0 4px,
            var(--b3-theme-on-surface-light, var(--b3-border-color)) 4px 5px
        );
    }
</style>
