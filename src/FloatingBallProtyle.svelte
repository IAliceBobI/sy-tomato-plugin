<!-- FloatingActionButton.svelte -->
<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { FloatingBallHelper } from "./libs/FloatingBallHelper";
    import { ClickHelper } from "./libs/ClickHelper";
    import { Protyle } from "siyuan";
    import { getPlugin } from "./libs/utils";

    export let dm: DestroyManager;
    export let key: string;
    export let id: string;
    let div: HTMLElement;
    let protyleTarget: HTMLElement;
    let btnHelper = new ClickHelper();

    let width = 500;
    let height = 500;
    let resizing = false;
    let resizeDir = "";
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    // 加载本地存储的尺寸
    onMount(() => {
        new FloatingBallHelper(key, div, dm);

        const protyle = new Protyle(getPlugin().app, protyleTarget, {
            blockId: id,
            action: ["cb-get-focus"],
            render: {
                background: false,
                title: false,
                gutter: true,
                scroll: false,
                breadcrumb: false,
                breadcrumbDocName: false,
            },
        });
        dm.add("protyle", () => protyle.destroy());

        const w = localStorage.getItem(`${key}-width`);
        const h = localStorage.getItem(`${key}-height`);
        if (w) width = parseInt(w);
        if (h) height = parseInt(h);
    });

    async function toggleOpen(_event: MouseEvent) {}

    function startResize(e: MouseEvent, dir: string) {
        e.stopPropagation();
        resizing = true;
        resizeDir = dir;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = width;
        startHeight = height;
        window.addEventListener("mousemove", onResize);
        window.addEventListener("mouseup", stopResize);
    }

    function onResize(e: MouseEvent) {
        if (!resizing) return;
        if (resizeDir === "se") {
            width = Math.max(100, startWidth + (e.clientX - startX));
            height = Math.max(100, startHeight + (e.clientY - startY));
        } else if (resizeDir === "e") {
            width = Math.max(100, startWidth + (e.clientX - startX));
        } else if (resizeDir === "s") {
            height = Math.max(100, startHeight + (e.clientY - startY));
        }
    }

    function stopResize() {
        resizing = false;
        // 存储尺寸到 localStorage
        localStorage.setItem(`${key}-width`, String(width));
        localStorage.setItem(`${key}-height`, String(height));
        window.removeEventListener("mousemove", onResize);
        window.removeEventListener("mouseup", stopResize);
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
    <div class="floating-button" bind:this={div}>
        <div
            class="protyleClass"
            style="width: {width}px; height: {height}px; border: 3px solid;"
            on:mousedown={(event) => {
                btnHelper.handleMouseDown(event);
            }}
            on:mouseup={(event) => {
                btnHelper.handleMouseUp(event, toggleOpen);
            }}
            bind:this={protyleTarget}
        ></div>
        <!-- 拖拽手柄 -->
        <div
            class="resize-handle resize-handle-se"
            on:mousedown={(e) => startResize(e, "se")}
        ></div>
        <div
            class="resize-handle resize-handle-e"
            on:mousedown={(e) => startResize(e, "e")}
        ></div>
        <div
            class="resize-handle resize-handle-s"
            on:mousedown={(e) => startResize(e, "s")}
        ></div>
    </div>
</div>

<style>
    .protyleClass {
        position: relative;
        box-sizing: border-box;
        border-color: var(--b3-font-color3);
    }
    .resize-handle {
        position: absolute;
        width: 14px;
        height: 14px;
        background-color: var(--b3-font-color3);
        opacity: 0.7;
        z-index: 11;
        border-radius: 3px;
        cursor: pointer;
    }
    .resize-handle-se {
        right: -7px;
        bottom: -7px;
        cursor: se-resize;
    }
    .resize-handle-e {
        right: -7px;
        top: 50%;
        transform: translateY(-50%);
        cursor: e-resize;
    }
    .resize-handle-s {
        left: 50%;
        bottom: -7px;
        transform: translateX(-50%);
        cursor: s-resize;
    }
    .floating-button {
        z-index: 20;
        position: fixed;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
</style>
