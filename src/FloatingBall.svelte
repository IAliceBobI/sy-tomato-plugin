<!-- 悬浮球统一组件（期1 地基+期4 外观 C）：wrapper（fixed 定位/拖拽/吸附描边层）>
     button（球视觉本体：圆形裁剪）+ label（球外常显标签）。融合派底子=--b3-theme-* 变量
     明暗自适应零特判；大小三档/透明度/显示标签走 BallItem 字段 CSS var 接线；
     动效只两处（悬停 scale 1.08 / 拖拽 scale 1.05+阴影加深），出场动画不做（克制）。
     取代退役的 FloatingBallDocBtn / FloatingBallKeyboardBtn。Svelte 5 正轨：不写
     export function destroy(){} 死范式，卸载由 FloatingBall.ts 管理器 dm.add("sv")
     走 unmount(app)。 -->
<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { FloatingBallHelper } from "./libs/FloatingBallHelper";
    import { ClickHelper } from "./libs/ClickHelper";
    import { actionRegistry } from "./actions";

    interface Props {
        dm: DestroyManager;
        item: BallItem;
    }
    let { dm, item }: Props = $props();
    let div: HTMLElement;
    let btnHelper = new ClickHelper();

    // 外观默认：中档 36px / 不透明 / 不显标签（size 三档 28/36/44）
    let ballSize = $derived(item.size === 28 || item.size === 44 ? item.size : 36);
    let ballOpacity = $derived(Math.min(1, Math.max(0.5, item.opacity ?? 1)));

    onMount(() => {
        new FloatingBallHelper(div, dm, item);
    });

    async function toggleOpen(event: MouseEvent) {
        await actionRegistry[item.type]?.execute(item, { event });
    }
</script>

<div
    bind:this={div}
    class="floating-button"
    style="--bs: {ballSize}px; --bo: {ballOpacity}"
>
    <!-- svelte-ignore event_directive_deprecated -->
    <button
        onmousedown={(event) => {
            btnHelper.handleMouseDown(event);
        }}
        onmouseup={(event) => {
            btnHelper.handleMouseUp(event, toggleOpen);
        }}
        aria-label={actionRegistry[item.type]?.tooltip(item)}
        class="b3-button tomato-button b3-tooltips b3-tooltips__n"
    >
        {actionRegistry[item.type]?.display(item)}
    </button>
    {#if item.showLabel}
        <!-- 无用户命名也显示（tooltip 链恒有兜底：doc=文档名 / shortcut=km 查表命令名或
             键位串，□8 起跟随界面语言）；tooltip 自身已含 label 优先判断 -->
        <span class="fball-label">{actionRegistry[item.type]?.tooltip(item)}</span>
    {/if}
</div>

<style>
    .floating-button {
        /* 10 = 浮层安全档（恒低于内核弹层最小 z11，高于 protyle 常驻 ≤9） */
        z-index: 10;
        position: fixed;
        display: flex;
        cursor: pointer;
        /* 尺寸由内层球本体撑起（正方形成立=几何函数 size 假设落地）；标签绝对定位球外不占流 */
        /* 移动端拖拽防滚动劫持：touch-action 生效看触摸起始元素，wrapper+button 两层都声明
           （recite 浮条同款先例）；与 Helper 的 touchmove 拖拽中 preventDefault 成对 */
        touch-action: none;
    }
    .floating-button button {
        touch-action: none;
        width: var(--bs, 36px);
        height: var(--bs, 36px);
        padding: 0;
        border-radius: 50%;
        /* 透明度只混色球面与图标（color-mix），边框/阴影保全值——容器 opacity 会把轮廓
            连带淡化成「隐形环」（vision 终审 P2 实测），分离后低透明档轮廓清晰 */
        background: color-mix(in srgb, var(--b3-theme-surface) calc(var(--bo, 1) * 100%), transparent);
        color: color-mix(in srgb, var(--b3-theme-on-surface) calc(var(--bo, 1) * 100%), transparent);
        border: 1px solid var(--b3-border-color);
        box-shadow: var(--b3-tooltips-shadow);
        font-size: calc(var(--bs, 36px) * 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        text-overflow: clip;
        overflow: hidden; /* 圆形裁剪：长文字/大图标溢出裁掉（标签在球外不受影响） */
        transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            background 0.15s ease,
            color 0.15s ease;
    }
    /* 动效一：悬停轻放大+球面回实 */
    .floating-button button:hover {
        transform: scale(1.08);
        background: var(--b3-theme-surface);
        color: var(--b3-theme-on-surface);
    }
    /* 动效二：拖拽中微放大+阴影加深（Helper 运行时挂类，:global 组合防 scoped 剪） */
    .floating-button:global(.fball-dragging) button {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.28);
        background: var(--b3-theme-surface);
        color: var(--b3-theme-on-surface);
    }
    /* 期3 角部吸附预览：拖拽悬停角邻域时描边（挂 wrapper 层不被球裁剪） */
    .floating-button:global(.fball-snap-hint) {
        outline: 2px dashed var(--b3-theme-primary);
        outline-offset: 3px;
    }
    /* 常显标签：球下方小字，text-shadow 双层描边应对复杂底色（on-surface：明色 4.96:1
        过 AA，暗色 8.59:1——on-surface-light 明色仅 3.01:1 被 vision 终审判 P1） */
    .fball-label {
        position: absolute;
        top: calc(100% + 3px);
        left: 50%;
        transform: translateX(-50%);
        font-size: 11px;
        line-height: 1.2;
        color: var(--b3-theme-on-surface);
        white-space: nowrap;
        text-shadow:
            0 0 4px var(--b3-theme-background),
            0 0 4px var(--b3-theme-background);
        pointer-events: none;
    }
</style>
