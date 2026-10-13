<!-- 十字罗盘（navcompass 2026-10-11）：点悬浮球变身的 D-pad 方向导航。
     设计事实源 docs/checkpoints/2026-10-10-nav-compass-floatball.md——四方向键围绕中心
     （当前文档名+兄弟位次 3/8），键上预览目标文档名（桌面全名/手机 CSS ellipsis 自适应，
     均不做固定字数截断）；边界方向置灰不回绕；listDocsByPath 失败=轻量错误态点键重试。
     交互三收起口：点外 / Esc / 点中心；整体拖动复用 BkFloatBall 同款 5px 位移阈值+
     window 监听+pointercancel 兜底——pointer capture 刻意延迟到「越阈确非点击」才上
     （svelte.md 坑：pointerdown 即捕获会把后续 pointerup/click 重定向到捕获元素，
     内嵌方向键的 onclick 全灭）；越阈后另以根节点 capture 期 click 守卫兜底吞误点。
     位置与球共享同一 lsKey（变身语义：同屏只一个，落 floatBallPos 字典档——lsfix
     2026-10-13：桌面 Electron 随机端口 origin 下 localStorage 跨重启必丢，旧档读侧
     一次性收编，见 libs/navCompassPos.ts）；手机端 touchmove 拦截=阻断滚动链
     与思源左右滑切页签手势（touchstart 只 stopPropagation 不 preventDefault——
     preventDefault 会吞合成 click，方向键点不动）。 -->
<script lang="ts">
    import { onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import { icon } from "./libs/utils";
    import { nav_compass_scheme, nav_compass_flip } from "./libs/stores";
    import { loadNavCompassPos, saveNavCompassPos } from "./libs/navCompassPos";
    import { getNavTree, navDirTargets, type NavDocTarget, type NavTree } from "./libs/navTree";
    import { childViews, navHistoryTargets } from "./libs/navHistory";
    import { tomatoI18n } from "./tomatoI18n";

    interface Props {
        /** 位置记忆键——与球共享（变身前后同一落点） */
        lsKey: string;
        /** 无记忆时的默认位（与球同一函数：球先挂时球已用 defPos 兜底） */
        defPos: () => { x: number; y: number };
        /** 手机端形态（小键 CSS ellipsis；touch 拦截） */
        mobile: boolean;
        /** 宿主下发的临时隐层（mobile-keyboard 弹出隐藏、收起恢复） */
        hidden: Writable<boolean>;
        /** 方向导航出口（宿主负责分端打开）；返回 false=打开失败（宿主已 toast） */
        onNavigate: (target: NavDocTarget) => Promise<boolean>;
        /** 收起回球（点外/Esc/点中心） */
        onCollapse: () => void;
        /** 当前文档基点（宿主三级兜底供给）：组件不直读 events.docID——桌面端它只随
         *  click-editorcontent 更新（Events.ts:167 要 detail.event，而 switch-protyle/
         *  loaded-protyle-static 的内核回包无该字段），切页签不点编辑器时陈旧 */
        getDocID: () => string;
    }
    let { lsKey, defPos, mobile, hidden, onNavigate, onCollapse, getDocID }: Props = $props();

    const DRAG_THRESHOLD = 5;

    type DirKey = "up" | "down" | "left" | "right";

    let host: HTMLElement = $state();
    let dragging = $state(false);
    let tree = $state<NavTree | null>(null);
    /** loading→ready / loading→error；错误态点任一方向键=重试 */
    let phase = $state<"loading" | "ready" | "error">("loading");
    /** 导航在途标记（防连点重复开文档） */
    let navigating = false;

    // ---- 拖拽原语（BkFloatBall 同款，capture 时机见文件头注） ----
    let x = 0;
    let y = 0;
    let armed = false;
    let moved = false;
    let activePointerId = -1;
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    /** 拖拽后的第一次 click 吞掉（capture 期守卫）；下一次 pointerdown 复位 */
    let suppressClick = false;

    function clamp(v: number, min: number, max: number) {
        return Math.max(min, Math.min(max, v));
    }

    function applyPos() {
        if (!host) return;
        // 罗盘比球大得多：展开即整体夹回视口（spec 手机端礼仪；桌面同口径不亏）
        const w = host.offsetWidth || 0;
        const h = host.offsetHeight || 0;
        x = clamp(x, 0, Math.max(0, window.innerWidth - w));
        y = clamp(y, 0, Math.max(0, window.innerHeight - h));
        host.style.left = `${x}px`;
        host.style.top = `${y}px`;
    }

    function loadPos() {
        // floatBallPos 字典档优先（lsKey 与球共享同一键），无档回 defPos 兜底位
        // （lsfix 2026-10-13：localStorage 旧档由 loadNavCompassPos 读侧一次性收编）
        const p = loadNavCompassPos(lsKey) ?? defPos();
        x = p.x;
        y = p.y;
        applyPos();
    }

    function savePos() {
        // set 后紧跟 write 确定性落盘（settingFactory.set 只写内存，搭车不可靠）
        saveNavCompassPos(lsKey, { x, y });
    }

    function onDown(e: PointerEvent) {
        if (!host || e.button !== 0) return;
        armed = true;
        moved = false;
        suppressClick = false;
        activePointerId = e.pointerId;
        sx = e.clientX;
        sy = e.clientY;
        ox = e.clientX - host.offsetLeft;
        oy = e.clientY - host.offsetTop;
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onCancel);
    }

    function onMove(e: PointerEvent) {
        if (!armed || !host || e.pointerId !== activePointerId) return;
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        if (!moved && dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
        if (!moved) {
            moved = true;
            suppressClick = true;
            // 越阈=确非点击，此刻才捕获：后续 click 重定向到根节点（方向键 onclick 不再
            // 误触发）+指针出窗仍收 pointerup；pointerdown 期捕获会把键的点击整个吃掉
            try {
                host.setPointerCapture?.(activePointerId);
            } catch { /* 事件流仍走 window 监听 */ }
        }
        dragging = true;
        x = e.clientX - ox;
        y = e.clientY - oy;
        applyPos();
    }

    function onUp(e: PointerEvent) {
        if (!armed || e.pointerId !== activePointerId) return;
        removeDragListeners();
        try {
            host?.releasePointerCapture?.(e.pointerId);
        } catch { /* 无捕获可释放 */ }
        armed = false;
        const wasDrag = moved;
        moved = false;
        dragging = false;
        if (wasDrag) savePos();
        // 非拖拽（轻点）：click 自然走方向键/中心 onclick；拖拽：suppressClick 守卫吞
    }

    /** pointercancel 收尾：只清理复位，不落盘不触发点击（打断≠点击） */
    function onCancel(e: PointerEvent) {
        if (e.pointerId !== activePointerId) return;
        removeDragListeners();
        armed = false;
        moved = false;
        dragging = false;
    }

    function removeDragListeners() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
    }

    /** capture 期 click 守卫：拖拽后紧跟的 click 一律吞掉（stopPropagation 早于方向键 handler） */
    function onRootClickCapture(e: MouseEvent) {
        if (suppressClick) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    // ---- 点外/Esc 收起 ----
    function onOutsideDown(e: PointerEvent) {
        const t = e.target as Node | null;
        if (host && t && !host.contains(t)) onCollapse();
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Escape" && !$hidden) onCollapse();
    }

    // ---- 数据与方向解析 ----
    let fetchGen = 0;

    /** 拉取/重拉导航树（宿主在文档切换/外部导航后也调）；docID 缺省=当前文档 */
    export async function refresh(docID?: string) {
        const id = docID || getDocID();
        if (!id) {
            tree = null;
            phase = "error";
            return;
        }
        const gen = ++fetchGen;
        phase = "loading";
        const t = await getNavTree(id);
        if (gen !== fetchGen) return; // 后到结果弃（期间又触发了新拉取）
        tree = t;
        phase = t ? "ready" : "error";
        histTick++;
    }

    /** refresh 轮次：浏览轨迹在 localStorage（非响应式源，游标随导航/外部访问移动），
     *  hist 缓存若只依赖 flip store 则导航后不失效（2026-10-11 e2e 实证：罗盘开着连点
     *  ↑↓ 预览停在旧游标视角、↑ 显示自指文档名）——随每轮 refresh 翻新 */
    let histTick = $state(0);

    /** 翻页模式的历史目标（navflip：仅 history 模式取用。导航成功后 refresh 换新 tree，
     *  游标已由宿主 navigate 内 steppedTo 先行同步，histTick 令本快照随之翻新） */
    const hist = $derived.by(() => {
        histTick;
        return $nav_compass_flip === "history" ? navHistoryTargets() : null;
    });

    /** 流派+翻页映射：映射本体=navTree.ts navDirTargets 纯函数（单测锁死）；批量取四向。
     *  lastChildViews=进入子文件夹位置记忆（navflip-r2，与 hist 同源 localStorage 非响应式，
     *  在本 derived 内现读=随 tree/histTick 翻新） */
    const dirTargets: Record<DirKey, NavDocTarget | null> | null = $derived.by(() => {
        if (!tree) return null;
        return navDirTargets(tree, $nav_compass_scheme, $nav_compass_flip, hist, childViews());
    });

    /** 进入子文档键的标签：位置记忆命中（目标≠首子）显示「上次浏览」，否则「首子文档」 */
    const entryLabel = $derived.by(() => {
        if (!tree?.firstChild || !dirTargets) return tomatoI18n.罗盘导航到首子文档;
        const key: DirKey = $nav_compass_scheme === "hegemon" ? "right" : "down";
        return dirTargets[key]?.id !== tree.firstChild.id
            ? tomatoI18n.罗盘导航到上次浏览
            : tomatoI18n.罗盘导航到首子文档;
    });

    /** 各方向的语义标签（随流派/翻页模式翻转；aria-label/键内兜底文案共用）。history 模式：
     *  后向=历史前进，无前进目标（已在最新处）=兜底续读下一篇，沿用「后一篇」标签 */
    const dirLabel: Record<DirKey, string> = $derived.by(() => {
        const scheme = $nav_compass_scheme;
        const back = tomatoI18n.罗盘导航到上一个浏览;
        const fwd = hist?.forward ? tomatoI18n.罗盘导航到下一个浏览 : tomatoI18n.罗盘导航到后一篇;
        if ($nav_compass_flip === "history") {
            return scheme === "hegemon"
                ? { up: back, down: fwd, left: tomatoI18n.罗盘导航到父文档, right: entryLabel }
                : { up: tomatoI18n.罗盘导航到父文档, down: entryLabel, left: back, right: fwd };
        }
        if (scheme === "hegemon") {
            return {
                up: tomatoI18n.罗盘导航到前一篇,
                down: tomatoI18n.罗盘导航到后一篇,
                left: tomatoI18n.罗盘导航到父文档,
                right: entryLabel,
            };
        }
        return {
            up: tomatoI18n.罗盘导航到父文档,
            down: entryLabel,
            left: tomatoI18n.罗盘导航到前一篇,
            right: tomatoI18n.罗盘导航到后一篇,
        };
    });

    async function tapDir(dir: DirKey) {
        if (phase === "error") {
            void refresh(); // 错误态点键=重试（spec 错误处理节）
            return;
        }
        const target = dirTargets?.[dir];
        if (!target || navigating) return;
        navigating = true;
        let ok = false;
        try {
            ok = await onNavigate(target);
        } finally {
            navigating = false;
        }
        if (!ok) {
            void refresh(); // 目标失效/打开失败：宿主已 toast，数据自动重拉（spec 错误处理节）
            return;
        }
        // 导航成功后宿主 navigate() 已失效轻缓存并重拉新树——组件端用目标 id 追平
        // （不等 protyle 事件，跳转即刷）
        void refresh(target.id);
    }

    onMount(() => {
        loadPos();
        void refresh();
        window.addEventListener("resize", applyPos);
        window.addEventListener("keydown", onKeydown);
        window.addEventListener("pointerdown", onOutsideDown, true);
        // 手机礼仪（spec 拍板 12）：touchmove 拦截=阻断滚动链+思源左右滑切页签（内核
        // touch 处理挂 document 冒泡，元素级 stopPropagation 先到）；touchstart 只断传播
        // ——preventDefault 会吞后续合成 click，方向键就点不动了
        const stopProp = (e: Event) => e.stopPropagation();
        const blockMove = (e: TouchEvent) => {
            e.stopPropagation();
            if (e.cancelable) e.preventDefault();
        };
        host.addEventListener("touchstart", stopProp);
        host.addEventListener("touchmove", blockMove, { passive: false });
        return () => {
            window.removeEventListener("resize", applyPos);
            window.removeEventListener("keydown", onKeydown);
            window.removeEventListener("pointerdown", onOutsideDown, true);
            host?.removeEventListener("touchstart", stopProp);
            host?.removeEventListener("touchmove", blockMove);
            removeDragListeners();
        };
    });
</script>

<div
    bind:this={host}
    class="tomato-nav-compass"
    class:dragging
    class:hidden={$hidden}
    class:mobile
    class:loading={phase === "loading"}
    role="group"
    aria-label={tomatoI18n.十字罗盘}
    onpointerdown={onDown}
    onclickcapture={onRootClickCapture}
>
    <button
        type="button"
        class="nv-key nv-up"
        class:disabled={phase === "ready" && !dirTargets?.up}
        disabled={phase === "loading" || (phase === "ready" && !dirTargets?.up)}
        aria-label={`${dirLabel.up}${dirTargets?.up ? `：${dirTargets.up.name}` : `：${tomatoI18n.无方向可导航}`}`}
        title={dirTargets?.up ? `${dirLabel.up}：${dirTargets.up.name}` : dirLabel.up}
        onclick={() => tapDir("up")}
    >
        {#if phase === "error"}
            <span class="nv-arrow nv-err">{@html icon("Refresh", 16)}</span>
        {:else}
            <span class="nv-arrow">{@html icon("Up", 16)}</span>
        {/if}
        {#if dirTargets?.up}
            <span class="nv-name">{dirTargets.up.name}</span>
        {:else if phase === "ready"}
            <span class="nv-name nv-none">{tomatoI18n.无方向可导航}</span>
        {/if}
    </button>
    <button
        type="button"
        class="nv-key nv-left"
        class:disabled={phase === "ready" && !dirTargets?.left}
        disabled={phase === "loading" || (phase === "ready" && !dirTargets?.left)}
        aria-label={`${dirLabel.left}${dirTargets?.left ? `：${dirTargets.left.name}` : `：${tomatoI18n.无方向可导航}`}`}
        title={dirTargets?.left ? `${dirLabel.left}：${dirTargets.left.name}` : dirLabel.left}
        onclick={() => tapDir("left")}
    >
        {#if phase === "error"}
            <span class="nv-arrow nv-err">{@html icon("Refresh", 16)}</span>
        {:else}
            <span class="nv-arrow">{@html icon("Left", 16)}</span>
        {/if}
        {#if dirTargets?.left}
            <span class="nv-name">{dirTargets.left.name}</span>
        {:else if phase === "ready"}
            <span class="nv-name nv-none">{tomatoI18n.无方向可导航}</span>
        {/if}
    </button>
    <button
        type="button"
        class="nv-center"
        aria-label={tomatoI18n.罗盘当前文档}
        title={tree?.currentName || tomatoI18n.罗盘当前文档}
        onclick={() => onCollapse()}
    >
        <span class="nv-doc">{phase === "loading" ? tomatoI18n.罗盘加载中 : (tree?.currentName || tomatoI18n.罗盘当前文档)}</span>
        {#if phase === "ready" && tree}
            <span class="nv-pos">{tree.index}/{tree.total}</span>
        {:else if phase === "error"}
            <span class="nv-pos nv-err">{tomatoI18n.罗盘加载失败点击重试}</span>
        {/if}
    </button>
    <button
        type="button"
        class="nv-key nv-right"
        class:disabled={phase === "ready" && !dirTargets?.right}
        disabled={phase === "loading" || (phase === "ready" && !dirTargets?.right)}
        aria-label={`${dirLabel.right}${dirTargets?.right ? `：${dirTargets.right.name}` : `：${tomatoI18n.无方向可导航}`}`}
        title={dirTargets?.right ? `${dirLabel.right}：${dirTargets.right.name}` : dirLabel.right}
        onclick={() => tapDir("right")}
    >
        {#if phase === "error"}
            <span class="nv-arrow nv-err">{@html icon("Refresh", 16)}</span>
        {:else}
            <span class="nv-arrow">{@html icon("Right", 16)}</span>
        {/if}
        {#if dirTargets?.right}
            <span class="nv-name">{dirTargets.right.name}</span>
        {:else if phase === "ready"}
            <span class="nv-name nv-none">{tomatoI18n.无方向可导航}</span>
        {/if}
    </button>
    <button
        type="button"
        class="nv-key nv-down"
        class:disabled={phase === "ready" && !dirTargets?.down}
        disabled={phase === "loading" || (phase === "ready" && !dirTargets?.down)}
        aria-label={`${dirLabel.down}${dirTargets?.down ? `：${dirTargets.down.name}` : `：${tomatoI18n.无方向可导航}`}`}
        title={dirTargets?.down ? `${dirLabel.down}：${dirTargets.down.name}` : dirLabel.down}
        onclick={() => tapDir("down")}
    >
        {#if phase === "error"}
            <span class="nv-arrow nv-err">{@html icon("Refresh", 16)}</span>
        {:else}
            <span class="nv-arrow">{@html icon("Down", 16)}</span>
        {/if}
        {#if dirTargets?.down}
            <span class="nv-name">{dirTargets.down.name}</span>
        {:else if phase === "ready"}
            <span class="nv-name nv-none">{tomatoI18n.无方向可导航}</span>
        {/if}
    </button>
</div>

<style>
    .tomato-nav-compass {
        position: fixed;
        /* 10 = 浮层安全档（css-layout.md：恒低于内核弹层最小 z11、高于 protyle ≤9） */
        z-index: 10;
        display: grid;
        grid-template-areas:
            ". up ."
            "left center right"
            ". down .";
        gap: 6px;
        padding: 8px;
        border-radius: 14px;
        background: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        box-shadow:
            0 0 0 2px var(--b3-theme-background),
            var(--b3-tooltips-shadow);
        /* 拖拽防滚动劫持 + 防拖出选区 */
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        --nv-key: 88px;
        --nv-center: 104px;
    }
    .tomato-nav-compass.mobile {
        --nv-key: 60px;
        --nv-center: 76px;
    }
    .tomato-nav-compass.hidden {
        display: none;
    }
    .nv-up { grid-area: up; }
    .nv-left { grid-area: left; }
    .nv-center { grid-area: center; }
    .nv-right { grid-area: right; }
    .nv-down { grid-area: down; }
    /* 竖臂对称（视觉 r2 P1）：中心列宽由中心键撑（桌面 104/手机 76），定宽 ↑↓ 键
       （88/60）吃不满列，grid 默认 stretch 退化 start=左贴死右留 16px、竖臂中心左偏
       8px——补 justify-self:center 归中（横臂左右键各自成列无空带，不需要） */
    .nv-up,
    .nv-down {
        justify-self: center;
    }
    /* 横臂解放拉伸（视觉终审 P1）：中排行高由 center min-height 撑起，grid 默认 stretch
       把 ←→ 拉到与 center 齐高而 ↑↓ 保持内容高=四臂不齐 D-pad 形变；center 对齐=高度
       回内容高，四臂同构同高，且在 center 行内垂直居中不贴顶 */
    .nv-left,
    .nv-right {
        align-self: center;
    }

    .nv-key,
    .nv-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        border-radius: 10px;
        border: 1px solid var(--b3-border-color);
        background: var(--b3-theme-background);
        color: var(--b3-theme-on-surface);
        padding: 6px 4px;
        cursor: pointer;
        touch-action: none;
        transition: background-color 0.12s ease;
    }
    .nv-key {
        width: var(--nv-key);
    }
    .nv-center {
        width: var(--nv-center);
        min-height: calc(var(--nv-key) * 0.8);
    }
    .nv-key:hover:not(:disabled),
    .nv-center:hover {
        background: var(--b3-list-hover);
    }
    .nv-key:disabled {
        cursor: default;
        opacity: 0.38;
    }
    .nv-arrow {
        line-height: 0;
        pointer-events: none;
    }
    .nv-arrow :global(svg) {
        pointer-events: none;
    }
    /* 预览名：block+三件套（ellipsis 挂文本元素自身，勿挂 flex 容器——css-layout.md 坑） */
    .nv-name {
        display: block;
        max-width: 100%;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
        line-height: 1.3;
        opacity: 0.78;
        pointer-events: none;
    }
    .nv-none {
        opacity: 0.4;
    }
    .nv-doc {
        display: block;
        max-width: 100%;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.4;
        pointer-events: none;
    }
    .nv-pos {
        font-size: 11px;
        line-height: 1.2;
        opacity: 0.6;
        font-variant-numeric: tabular-nums;
        pointer-events: none;
    }
    .nv-err {
        color: var(--b3-theme-error);
        opacity: 0.9;
    }
    .nv-pos.nv-err {
        max-width: var(--nv-center);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .tomato-nav-compass.dragging {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.28);
    }
    /* 加载态：全体键呼吸（不闪错误色，防抖到真结果） */
    .tomato-nav-compass.loading .nv-key:not(:disabled),
    .tomato-nav-compass.loading .nv-center {
        animation: nv-pulse 1.1s ease-in-out infinite;
    }
    @keyframes nv-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.55; }
    }
</style>
