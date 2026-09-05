<script lang="ts">
    import { onMount } from "svelte";
    import { Plugin } from "siyuan";
    import { DestroyManager } from "./libs/destroyer";
    import { ReadingBallHelper } from "./libs/ReadingBallHelper";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { listReadingPoints } from "./libs/bookmark";
    import { toBarItems, relativeTime, type RPBarItem } from "./libs/readingPointCore";
    import { tomatoI18n } from "./tomatoI18n";

    // 阅读点悬浮球（rpfloatbar 战役，spec：docs/tomato-reading-point-floatball-spec.md）：
    // 收缩态=球（双态状态灯：有点点亮/无点半暗），单击展开成条（动作区四钮+最近在读 5 条），
    // 拖拽/长按/右键在 ReadingBallHelper（位置持久化 readingFloatBallPos）。菜单由宿主
    // （ReadingPointBox）构建经 actions 传入——避免反向 import winHotkey 常量循环依赖。
    // Svelte 5 正轨：export function 进 mount 返回的 exports（宿主推文档点态），卸载走 unmount。

    interface Props {
        plugin: Plugin;
        dm: DestroyManager;
        actions: {
            setPoint(): void;
            jump(): void;
            del(): void;
            panel(): void;
            hide(): void;
            openMenu(x: number, y: number): void;
        };
    }
    let { plugin, dm, actions }: Props = $props();

    const BALL_SIZE = 36;
    const RECENT_LIMIT = 5;

    let wrapEl: HTMLElement;

    let expanded = $state(false);
    /** 当前文档点态（ReadingPointBox.refreshStatus 推送；null=无点） */
    let docCur = $state<{ blockID: string; ts: string } | null>(null);
    let items = $state<RPBarItem[]>([]);
    let loadingItems = $state(false);
    /** 球在屏幕左半时条左对齐展开（右对齐会出屏） */
    let alignLeft = $state(false);
    /** 球贴近屏顶时条翻到球下方（默认在上方，会出上边） */
    let flipDown = $state(false);

    export function refreshDocState(cur: { blockID: string; ts: string } | null) {
        docCur = cur;
    }
    export function collapse() {
        expanded = false;
    }

    function timeText(ts: string) {
        return tomatoI18n.阅读点时间(relativeTime(ts, new Date()));
    }

    async function loadItems() {
        loadingItems = true;
        try {
            items = toBarItems(await listReadingPoints(), RECENT_LIMIT);
        } finally {
            loadingItems = false;
        }
    }

    function toggle() {
        expanded = !expanded;
        if (expanded) {
            void loadItems();
            // 展开方向：球中心在屏幕左半→条左对齐，否则右对齐；球贴近屏顶→条翻下方
            alignLeft = wrapEl.offsetLeft + wrapEl.offsetWidth / 2 < window.innerWidth / 2;
            flipDown = wrapEl.offsetTop < 170;
        }
    }

    async function jumpItem(it: RPBarItem) {
        expanded = false;
        await OpenSyFile2(plugin, it.blockID);
    }

    onMount(() => {
        new ReadingBallHelper(wrapEl, dm, BALL_SIZE, {
            onMenu: (x, y) => actions.openMenu(x, y),
            onDragStart: () => { expanded = false; },
            onTap: () => toggle(),
        });
        // 点条外收起（捕获期判 wrapper 外）
        const onDocClick = (e: Event) => {
            if (expanded && !wrapEl.contains(e.target as Node)) expanded = false;
        };
        document.addEventListener("click", onDocClick, true);
        dm.add("rpfball-outclick", () => document.removeEventListener("click", onDocClick, true));
    });
</script>

<div bind:this={wrapEl} class="rpfball-wrap" style="--rp-bs: {BALL_SIZE}px">
    {#if expanded}
        <!-- onmousedown 阻断冒泡：条=面板区，不参与球的拖拽武装（ReadingBallHelper 挂
             wrapper 级 mousedown，条内 down 冒泡会武装 dragArmed——动作钮点击期间任何
             document mousemove>4px 即判拖拽收条；切断之） -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="rpfbar" class:rpfbar--left={alignLeft} class:rpfbar--down={flipDown} onmousedown={(e) => e.stopPropagation()}>
            <div class="rpfbar__actions">
                <button
                    class="b3-button rpfbar__btn" aria-label={tomatoI18n.设置阅读点}
                    onclick={() => actions.setPoint()}
                ><svg><use xlink:href="#iconBookmark"></use></svg></button>
                <button
                    class="b3-button rpfbar__btn" aria-label={tomatoI18n.跳到当前文档的阅读点}
                    disabled={!docCur} title={docCur ? timeText(docCur.ts) : ""}
                    onclick={() => actions.jump()}
                ><svg><use xlink:href="#iconForward"></use></svg></button>
                <button
                    class="b3-button rpfbar__btn" aria-label={tomatoI18n.删除当前文档的阅读点}
                    disabled={!docCur}
                    onclick={() => actions.del()}
                ><svg><use xlink:href="#iconTrashcan"></use></svg></button>
                <button
                    class="b3-button rpfbar__btn" aria-label={tomatoI18n.查看阅读点}
                    onclick={() => { expanded = false; actions.panel(); }}
                ><svg><use xlink:href="#iconList"></use></svg></button>
            </div>
            <div class="rpfbar__recent">
                {#if loadingItems}
                    <span class="rpfbar__hint">{tomatoI18n.加载中}</span>
                {:else if items.length === 0}
                    <span class="rpfbar__hint">{tomatoI18n.还没有阅读点}</span>
                {:else}
                    {#each items as it (it.blockID)}
                        <button class="rpfbar__item" onclick={() => void jumpItem(it)}>
                            <span class="rpfbar__name">
                                {it.docName || tomatoI18n.空内容}
                                {#if it.legacy}<span class="rpfbar__badge">{tomatoI18n.旧版}</span>{/if}
                            </span>
                            {#if timeText(it.ts)}<span class="rpfbar__time">{timeText(it.ts)}</span>{/if}
                        </button>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
    <button
        class="rpfball"
        class:rpfball--lit={!!docCur}
        aria-label={docCur && timeText(docCur.ts) ? `${tomatoI18n.阅读点悬浮球} · ${timeText(docCur.ts)}` : tomatoI18n.阅读点悬浮球}
    ><svg><use xlink:href="#iconBookmark"></use></svg></button>
    <!-- 点击/拖拽/长按全在 ReadingBallHelper（pointer 层，□4）：tap 合成 mouse/click 链
         会二次触发 toggle，球 button 的 ClickHelper mouse 接线退役（pointerup onTap 单源） -->
</div>

<style>
    .rpfball-wrap {
        /* 10 = 浮层安全档（恒低于内核弹层最小 z11，高于 protyle 常驻 ≤9） */
        z-index: 10;
        position: fixed;
        cursor: pointer;
        /* 移动端防滚动劫持：wrapper+button 两层声明（FloatingBall 先例） */
        touch-action: none;
    }
    .rpfball {
        touch-action: none;
        width: var(--rp-bs, 36px);
        height: var(--rp-bs, 36px);
        padding: 0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--b3-theme-surface);
        color: var(--b3-theme-on-surface);
        border: 1px solid var(--b3-border-color);
        box-shadow: var(--b3-tooltips-shadow);
        transition: transform 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
        flex: none;
    }
    .rpfball svg {
        width: calc(var(--rp-bs, 36px) * 0.55);
        height: calc(var(--rp-bs, 36px) * 0.55);
    }
    .rpfball:hover {
        transform: scale(1.08);
    }
    /* 双态状态灯：有点=主题色点亮（与状态栏钮同语义）；无点=半暗 */
    .rpfball--lit {
        color: var(--b3-theme-primary);
    }
    .rpfball-wrap:not(:has(.rpfball--lit)) .rpfball {
        opacity: 0.55;
    }
    /* 拖拽中（Helper 运行时挂类，:global 组合防 scoped 剪） */
    .rpfball-wrap:global(.rpfball-dragging) .rpfball {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.28);
    }

    /* ---- 展开条：absolute 悬浮于球上方（不占流——wrapper 尺寸恒=球，
    拖拽锚定/吸附换算与展开态解耦，收展时球不跳动） ---- */
    .rpfbar {
        position: absolute;
        bottom: calc(100% + 10px);
        right: 0;
        width: min(420px, calc(100vw - 24px));
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px;
        border-radius: var(--b3-border-radius, 6px);
        background-color: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        box-shadow: var(--b3-tooltips-shadow);
        cursor: default;
    }
    /* 球在屏幕左半时 flip 左对齐（右对齐会出屏） */
    .rpfbar--left {
        right: auto;
        left: 0;
    }
    /* 球贴近屏顶时条翻到球下方 */
    .rpfbar--down {
        bottom: auto;
        top: calc(100% + 10px);
    }
    .rpfbar__actions {
        display: flex;
        gap: 4px;
    }
    .rpfbar__btn {
        flex: none;
        padding: 6px;
        height: auto;
        border: none;
        border-radius: var(--b3-border-radius, 4px);
    }
    .rpfbar__btn svg {
        width: 16px;
        height: 16px;
    }
    .rpfbar__btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }
    .rpfbar__recent {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        min-height: 24px;
        align-items: center;
    }
    .rpfbar__hint {
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        opacity: 0.6;
        padding: 2px 4px;
        white-space: nowrap;
    }
    .rpfbar__item {
        flex: none;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 3px 8px;
        border: none;
        border-radius: var(--b3-border-radius, 4px);
        background-color: transparent;
        color: var(--b3-theme-on-background);
        font-size: 12px;
        cursor: pointer;
        white-space: nowrap;
    }
    .rpfbar__item:hover {
        background-color: var(--b3-list-hover);
    }
    .rpfbar__name {
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .rpfbar__badge {
        display: inline-block;
        vertical-align: middle;
        margin-left: 4px;
        padding: 0 4px;
        border-radius: 3px;
        font-size: 10px;
        line-height: 16px;
        color: var(--b3-card-info-color);
        background-color: var(--b3-card-info-background);
    }
    .rpfbar__time {
        font-size: 11px;
        color: var(--b3-theme-on-surface);
        opacity: 0.55;
    }
</style>
