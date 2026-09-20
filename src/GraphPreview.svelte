<script lang="ts">
    // graphrelayout □9：胶囊 hover 预览浮层组件（body 挂载单例，graphPreview.ts 管理生命周期）。
    // 自绘层：非原生 title 非 b3-tooltips 非内核共享 tooltip（在档坑各有一案）。
    // 定位自算：store 只载内容+锚矩形，组件渲染后量实际尺寸走 previewPos 落坐标——
    // 落位前 visibility 隐藏，防首帧闪在 (0,0)。浅暗色两态走 --b3 主题变量自动换装+暗色
    // 显式阴影分支（判据 html[data-theme-mode=dark]，3.8.3 无 .dark class——在档坑）；
    // z-index 安全档 10（内核弹层计数器首弹窗即 11）。
    import { graphPreviewStore } from "./libs/graphPreview";
    import { previewPos } from "./libs/graphPill";

    const spec = $derived($graphPreviewStore);
    let el: HTMLElement = $state() as any;
    let placed = $state(false);

    // 内容或锚变化→重定位（量实际尺寸，防「估算尺寸×真实排版」漂移出视口边）
    $effect(() => {
        const s = spec;
        if (!s || !el) return;
        const w = el.offsetWidth || 160;
        const h = el.offsetHeight || 40;
        const pos = previewPos(s.anchor, w, h, window.innerWidth, window.innerHeight);
        el.style.left = `${pos.left}px`;
        el.style.top = `${pos.top}px`;
        placed = true;
    });
</script>

{#if spec}
    <div
        bind:this={el}
        class="gp"
        class:gp--hidden={!placed}
        style="left:{spec.anchor.left}px;top:{spec.anchor.bottom + 6}px"
        role="tooltip"
        data-gp-title={spec.title}
    >
        <div class="gp-title">{spec.title}</div>
        {#if spec.lines.length}
            <div class="gp-body">
                {#each spec.lines as line, i (i)}
                    <div class="gp-line">{line}</div>
                {/each}
            </div>
        {/if}
    </div>
{/if}

<style>
    .gp {
        position: fixed;
        z-index: 10; /* 常驻浮层安全档：内核弹层计数器首弹窗即 11（在档坑） */
        max-width: 360px;
        padding: 7px 10px;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        background: var(--b3-theme-surface);
        color: var(--b3-theme-on-surface);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14);
        font-size: 12px;
        line-height: 1.5;
        pointer-events: none; /* 浮层不截获指针——mouseleave 语义归胶囊本体 */
    }
    /* 首帧未落位隐藏（防 (0,0) 闪现）；$effect 落位后翻可见 */
    .gp--hidden {
        visibility: hidden;
    }
    .gp-title {
        font-weight: 600;
        font-size: 11px;
        color: var(--b3-theme-on-background);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .gp-body {
        margin-top: 4px;
        padding-top: 4px;
        border-top: 1px solid var(--b3-border-color);
    }
    .gp-line {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        color: var(--b3-theme-on-surface);
    }
    .gp-line + .gp-line {
        margin-top: 3px;
    }
    /* 暗色两态（判据 html[data-theme-mode=dark]）：surface 系变量自动换装，唯一显式
       分支是阴影加重（暗底上浅影不可见——浅色 rgba .14 在 midnight 上无层次） */
    :global(html[data-theme-mode="dark"]) .gp {
        background: var(--b3-theme-surface);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }
</style>
