<!-- 悬浮反链球（bkfloat □4）：36px 圆+当前文档反链数徽标（0 条隐藏徽标、99+ 封顶）。
     拖拽=pointer events+5px 位移阈值区分点击/拖动（DialogSvelte 同族），位置视口夹取+
     localStorage 记忆；点击（未越阈值）回宿主 toggle 面板。外观对齐思源悬浮球家族
     （FloatingBall.svelte 同语汇：b3 主题变量明暗自适应、z-index 10 常驻浮层安全档）。
     计数/显隐由宿主 BkFloat.ts 经 writable store 下发（mount() 外部响应式更新正轨）。 -->
<script lang="ts">
    import { onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import { icon } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";

    interface Props {
        count: Writable<number>;
        hidden: Writable<boolean>;
        onToggle: () => void;
        /** 面板开合键位提示（confgather2 □2）：函数 prop 挂载期求值一次（aria-label 表达式
         *  无响应式依赖，不随徽标/显隐重渲——改键后旧键位驻留至重挂载，顶栏齿轮先例同病） */
        panelKeyHint: () => string;
        /** 共存模式防遮挡让位偏移（宿主 applyBallNudge 计算；null=原位）。仅叠加渲染，
         *  不改写 x/y 记忆位；拖球启动时偏移被吸收进基准位并经 onShiftAbsorbed 清源 */
        shift: Writable<{ x: number; y: number } | null>;
        onShiftAbsorbed: () => void;
        /** 复用参数化（graphfloat □3）：位置记忆键/图标名/tooltip 主文案——悬浮图球传
         *  独立值，默认=悬浮反链原值（BkFloat.ts 零改动） */
        lsKey?: string;
        ballIcon?: string;
        tip?: string;
        /** 默认位（无 localStorage 记忆时的落点；函数形态窗口尺寸现求）。悬浮图球传
         *  错开位——两球默认位完全重叠时图球后挂恒盖死反链球（gfloat review P1-3） */
        defPos?: () => { x: number; y: number };
    }
    let { count, hidden, onToggle, panelKeyHint, shift, onShiftAbsorbed, lsKey = "tomato-bkfloat-ball-pos", ballIcon = "Link", tip = "", defPos }: Props = $props();

    const SIZE = 36;
    const DRAG_THRESHOLD = 5;

    let host: HTMLElement = $state();
    let dragging = $state(false);
    let x = 0;
    let y = 0;
    let shiftVal = { x: 0, y: 0 };
    let armed = false;
    let moved = false;
    let activePointerId = -1;
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;

    function clamp(v: number, min: number, max: number) {
        return Math.max(min, Math.min(max, v));
    }

    function applyPos() {
        if (!host) return;
        // Math.max(0,..)：视口小于球时退化为 0，避免负区间锁死（DialogSvelte 同款）。
        // 夹取只作用于基准位（x/y）：让位偏移由宿主按面板矩形算定，目标位已在视口内
        x = clamp(x, 0, Math.max(0, window.innerWidth - SIZE));
        y = clamp(y, 0, Math.max(0, window.innerHeight - SIZE));
        host.style.left = `${x + shiftVal.x}px`;
        host.style.top = `${y + shiftVal.y}px`;
    }

    // 让位偏移响应（宿主 store 下发）：值变即按新偏移重渲；null 归位（面板收起）
    $effect(() => {
        const s = $shift;
        shiftVal = s ?? { x: 0, y: 0 };
        applyPos();
    });

    function loadPos() {
        const fallback = () => {
            // 默认位避让右侧 dock 条（48px：dock ~32px + 间距；已拖动用户走 localStorage 不受影响）
            const p = defPos?.() ?? {
                x: window.innerWidth - SIZE - 48,
                y: Math.round(window.innerHeight * 0.4),
            };
            x = p.x;
            y = p.y;
        };
        try {
            const raw = localStorage.getItem(lsKey);
            if (raw) {
                const p = JSON.parse(raw);
                x = Number(p?.x);
                y = Number(p?.y);
                if (!Number.isFinite(x) || !Number.isFinite(y)) fallback();
            } else {
                fallback();
            }
        } catch {
            fallback();
        }
        applyPos();
    }

    function savePos() {
        try {
            localStorage.setItem(lsKey, JSON.stringify({ x, y }));
        } catch {
            /* 存储满/隐私模式：位置仅会话内生效 */
        }
    }

    function onDown(e: PointerEvent) {
        if (!host || e.button !== 0) return;
        armed = true;
        moved = false;
        activePointerId = e.pointerId;
        sx = e.clientX;
        sy = e.clientY;
        ox = e.clientX - host.offsetLeft;
        oy = e.clientY - host.offsetTop;
        // capture 失败（指针已释放/合成事件无活动指针）不阻断拖拽监听挂载
        try {
            host.setPointerCapture?.(e.pointerId);
        } catch { /* 事件流仍走 window 监听 */ }
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        // 系统手势/窗口切换等打断（pointer 流被取消不保证 pointerup）：兜底清理，
        // 否则残留的 window pointerup 会在下一次任意点击触发 onToggle（评审 P1-2）
        window.addEventListener("pointercancel", onCancel);
    }

    function onMove(e: PointerEvent) {
        if (!armed || !host || e.pointerId !== activePointerId) return;
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        // 位移阈值内不算拖（点击判定），越阈即拖
        if (!moved && dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
        if (!moved) {
            moved = true;
            // 让位中的真拖拽启动（越阈=确非点击）：把视觉偏移吸收进基准位（offsetLeft/Top=
            // 实际渲染位，此刻位移仅阈值级，视觉无跳变）并清源——宿主置 null→effect 重设
            // shiftVal=0 重渲同一像素；本地先清零防后续 applyPos 叠双份偏移。
            // 点击路径不过此（收面板时宿主直接清源，球回记忆原位）
            if (shiftVal.x || shiftVal.y) {
                x = host.offsetLeft;
                y = host.offsetTop;
                shiftVal = { x: 0, y: 0 };
                onShiftAbsorbed();
            }
        }
        dragging = true;
        x = e.clientX - ox;
        y = e.clientY - oy;
        applyPos();
    }

    function onUp(e: PointerEvent) {
        // 未按下/异指针的 pointerup 不处理（防残留监听误触发 toggle）
        if (!armed || e.pointerId !== activePointerId) return;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        try {
            host?.releasePointerCapture?.(e.pointerId);
        } catch { /* 无捕获可释放 */ }
        armed = false;
        const wasDrag = moved;
        moved = false;
        dragging = false;
        if (wasDrag) {
            savePos();
        } else {
            onToggle();
        }
    }

    /** pointercancel 收尾：只清理复位，不落盘不 toggle（打断≠点击） */
    function onCancel() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        armed = false;
        moved = false;
        dragging = false;
    }

    onMount(() => {
        loadPos();
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
    });

    function onResize() {
        applyPos();
    }
</script>

<div bind:this={host} class="tomato-bk-float-ball" class:dragging class:hidden={$hidden}>
    <button
        class="tomato-bk-float-ball__btn b3-tooltips b3-tooltips__n"
        aria-label={`${tip || tomatoI18n.展开或收起悬浮反链} ${panelKeyHint()}`}
        onpointerdown={onDown}
    >{@html icon(ballIcon, 18)}</button>
    {#if $count > 0}
        <span class="tomato-bk-float-ball__badge">{$count > 99 ? "99+" : $count}</span>
    {/if}
</div>

<style>
    .tomato-bk-float-ball {
        position: fixed;
        /* 10 = 浮层安全档（恒低于内核弹层最小 z11，高于 protyle 常驻 ≤9）；
           与面板同档，宿主挂载序保证球后挂恒压面板（面板不压球） */
        z-index: 10;
        width: 36px;
        height: 36px;
        /* 拖拽防滚动劫持（FloatingBall.svelte 同款） */
        touch-action: none;
    }
    .tomato-bk-float-ball.hidden {
        display: none;
    }
    .tomato-bk-float-ball__btn {
        width: 36px;
        height: 36px;
        padding: 0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--b3-theme-surface);
        color: var(--b3-theme-on-surface);
        border: 1px solid var(--b3-border-color);
        /* 描边环：主题底色 2px 环把球从任意底色（含白底卡片）上分离出来（评审 P2-8，
           b3 语言=徽标同款环） */
        box-shadow:
            0 0 0 2px var(--b3-theme-background),
            var(--b3-tooltips-shadow);
        cursor: pointer;
        touch-action: none;
        transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
    }
    .tomato-bk-float-ball__btn:hover {
        transform: scale(1.08);
        background: var(--b3-theme-surface);
        color: var(--b3-theme-on-surface);
    }
    .tomato-bk-float-ball.dragging .tomato-bk-float-ball__btn {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.28);
    }
    .tomato-bk-float-ball__btn :global(svg) {
        pointer-events: none;
    }
    .tomato-bk-float-ball__badge {
        position: absolute;
        top: -5px;
        right: -7px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 8px;
        background: var(--b3-theme-error);
        color: #fff;
        font-size: 10px;
        line-height: 16px;
        text-align: center;
        font-variant-numeric: tabular-nums;
        pointer-events: none;
        /* 主题底色描边环：亮暗底上都跟球面分离清晰 */
        box-shadow: 0 0 0 2px var(--b3-theme-background);
    }
</style>
