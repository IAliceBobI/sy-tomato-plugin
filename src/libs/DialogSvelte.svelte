<script lang="ts">
    import { onMount, Snippet } from "svelte";
    import { getTomatoPluginConfig, icon } from "./utils";
    import { events } from "./Events";
    import { floatingballEnable } from "./stores";
    import { DestroyManager } from "./destroyer";
    import { tomatoI18n } from "../tomatoI18n";

    interface PropsType {
        savePositionKey?: string;
        show: boolean;
        hideScrollbar?: boolean;
        title: string;
        dialogInner: Snippet;
        minWidth?: number;
        minHeight?: number;
        maxWidth?: string;
        maxHeight?: string;
        width?: string;
        height?: string;
        dm?: DestroyManager;
        useBrowserStorage?: boolean;
    }

    let {
        savePositionKey = "",
        show = $bindable(true),
        hideScrollbar = false,
        title = $bindable("dialog"),
        dialogInner,
        minWidth = 200,
        minHeight = 150,
        maxWidth = undefined,
        maxHeight = undefined,
        width = undefined,
        height = undefined,
        dm = undefined,
        useBrowserStorage = false,
    }: PropsType = $props();

    let dialogElement: HTMLElement = $state();
    let isDragging = $state(false);
    let isResizing = $state(false);
    let offsetX = $state(0);
    let offsetY = $state(0);
    let dialogTop = $state(0);
    let dialogLeft = $state(0);
    let resizeDirection = $state(""); // 记录调整大小的方向
    let showTitle = $derived.by(() => {
        const MAX_TITLE_LEN = 20;
        const suffix = title.length > MAX_TITLE_LEN ? ".." : "";
        return title.slice(0, MAX_TITLE_LEN) + suffix;
    });

    onMount(() => {
        if (dialogElement) {
            if (maxHeight != null) {
                dialogElement.style.height = maxHeight;
                dialogElement.style.maxHeight = maxHeight;
            }
            if (maxWidth != null) {
                dialogElement.style.width = maxWidth;
                dialogElement.style.maxWidth = maxWidth;
            }
            if (height != null) {
                dialogElement.style.height = height;
            }
            if (width != null) {
                dialogElement.style.width = width;
            }
            if (minWidth != null) {
                dialogElement.style.minWidth = `${minWidth}px`;
            }
            if (minHeight != null) {
                dialogElement.style.minHeight = `${minHeight}px`;
            }
        }
        // 初始设置位置
        if (show && savePositionKey) {
            loadPosition();
        }
    });

    $effect(() => {
        if (show && savePositionKey) {
            loadPosition();
        }
    });

    // 拖动相关函数
    function handleMouseDown(event: MouseEvent) {
        if (!dialogElement) return;

        isDragging = true;

        // 计算鼠标在对话框中的相对位置
        const rect = dialogElement.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        // 保存当前对话框位置
        dialogTop = rect.top;
        dialogLeft = rect.left;

        // 添加事件监听器
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        // 防止拖动时选中文本
        event.preventDefault();
    }

    function handleMouseMove(event: MouseEvent) {
        if (!isDragging || !dialogElement) return;

        // 计算新位置
        const newTop = dialogTop + (event.clientY - offsetY - dialogTop);
        const newLeft = dialogLeft + (event.clientX - offsetX - dialogLeft);

        // 限制在视口内
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const dialogHeight = dialogElement.offsetHeight;
        const dialogWidth = dialogElement.offsetWidth;

        const maxTop = viewportHeight - dialogHeight;
        const maxLeft = viewportWidth - dialogWidth;

        const constrainedTop = Math.max(0, Math.min(maxTop, newTop));
        const constrainedLeft = Math.max(0, Math.min(maxLeft, newLeft));

        // 应用新位置
        dialogElement.style.top = `${constrainedTop}px`;
        dialogElement.style.left = `${constrainedLeft}px`;
    }

    // 调整大小相关函数
    function handleResizeStart(event: MouseEvent, direction: string) {
        if (!dialogElement) return;

        isResizing = true;
        resizeDirection = direction;

        const rect = dialogElement.getBoundingClientRect();
        offsetX = event.clientX;
        offsetY = event.clientY;

        // 保存当前对话框尺寸
        dialogElement.style.width = `${rect.width}px`;
        dialogElement.style.height = `${rect.height}px`;

        // 添加事件监听器
        document.addEventListener("mousemove", handleResize);
        document.addEventListener("mouseup", handleResizeEnd);

        // 防止调整大小时选中文本
        event.preventDefault();
    }

    function handleResize(event: MouseEvent) {
        if (!isResizing || !dialogElement) return;

        const rect = dialogElement.getBoundingClientRect();
        let newWidth = rect.width;
        let newHeight = rect.height;
        let newLeft = rect.left;
        let newTop = rect.top;

        // 根据调整方向计算新尺寸和位置
        if (resizeDirection.includes("e")) {
            newWidth = Math.max(
                minWidth,
                rect.width + (event.clientX - offsetX),
            );
        } else if (resizeDirection.includes("w")) {
            const deltaX = event.clientX - offsetX;
            newWidth = Math.max(minWidth, rect.width - deltaX);
            newLeft = rect.left + deltaX;
        }

        if (resizeDirection.includes("s")) {
            newHeight = Math.max(
                minHeight,
                rect.height + (event.clientY - offsetY),
            );
        } else if (resizeDirection.includes("n")) {
            const deltaY = event.clientY - offsetY;
            newHeight = Math.max(minHeight, rect.height - deltaY);
            newTop = rect.top + deltaY;
        }

        // 确保对话框不超出视口
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        if (newLeft + newWidth > viewportWidth) {
            newWidth = viewportWidth - newLeft;
        }

        if (newTop + newHeight > viewportHeight) {
            newHeight = viewportHeight - newTop;
        }

        // 应用新尺寸和位置
        dialogElement.style.width = `${newWidth}px`;
        dialogElement.style.height = `${newHeight}px`;
        dialogElement.style.left = `${newLeft}px`;
        dialogElement.style.top = `${newTop}px`;

        // 更新鼠标偏移量
        offsetX = event.clientX;
        offsetY = event.clientY;
    }

    function handleMouseUp() {
        isDragging = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        if (savePositionKey) {
            savePosition();
        }
    }

    function handleResizeEnd() {
        isResizing = false;
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", handleResizeEnd);

        if (savePositionKey) {
            savePosition();
        }
    }

    function key(k: string) {
        return `${savePositionKey}_${events.isMobile}_${k}`;
    }

    function loadPosition() {
        if (events.isMobile) {
            dialogElement.style.left = "10px";
            dialogElement.style.top = "10px";
            return;
        }
        if (!dialogElement) return;
        if (!savePositionKey) return;
        if (useBrowserStorage) {
            let x = localStorage.getItem(key("offsetX"));
            let y = localStorage.getItem(key("offsetY"));
            let width = localStorage.getItem(key("width"));
            let height = localStorage.getItem(key("height"));
            setPosition(x, y, width, height);
        } else {
            let x = getTomatoPluginConfig()[key("offsetX")];
            let y = getTomatoPluginConfig()[key("offsetY")];
            let width = getTomatoPluginConfig()[key("width")];
            let height = getTomatoPluginConfig()[key("height")];
            setPosition(x, y, width, height);
        }
    }

    function savePosition() {
        if (events.isMobile) return;
        if (!dialogElement) return;
        if (!savePositionKey) return;
        if (useBrowserStorage) {
            if (dialogElement.style.left)
                localStorage.setItem(key("offsetX"), dialogElement.style.left);
            if (dialogElement.style.top)
                localStorage.setItem(key("offsetY"), dialogElement.style.top);
            if (dialogElement.style.width)
                localStorage.setItem(key("width"), dialogElement.style.width);
            if (dialogElement.style.height)
                localStorage.setItem(key("height"), dialogElement.style.height);
        } else {
            if (dialogElement.style.left)
                getTomatoPluginConfig()[key("offsetX")] =
                    dialogElement.style.left;
            if (dialogElement.style.top)
                getTomatoPluginConfig()[key("offsetY")] =
                    dialogElement.style.top;
            if (dialogElement.style.width)
                getTomatoPluginConfig()[key("width")] =
                    dialogElement.style.width;
            if (dialogElement.style.height)
                getTomatoPluginConfig()[key("height")] =
                    dialogElement.style.height;
            floatingballEnable.write(); // 任意一个key可以保存整体
        }
    }

    function setPosition(
        x?: string,
        y?: string,
        width?: string,
        height?: string,
    ) {
        if (events.isMobile) return;
        if (!dialogElement) return;

        if (!x) x = (window.innerWidth - dialogElement.offsetWidth) / 2 + "px";
        if (!y)
            y = (window.innerHeight - dialogElement.offsetHeight) / 2 + "px";

        // 解析像素值
        let left = parseInt(x, 10);
        let top = parseInt(y, 10);
        let w = width ? parseInt(width, 10) : dialogElement.offsetWidth;
        let h = height ? parseInt(height, 10) : dialogElement.offsetHeight;

        // 获取对话框尺寸
        let dialogWidth = Math.max(minWidth, w);
        let dialogHeight = Math.max(minHeight, h);

        // 限制在视口内
        const maxLeft = window.innerWidth - dialogWidth;
        const maxTop = window.innerHeight - dialogHeight;

        left = Math.max(0, Math.min(maxLeft, left));
        top = Math.max(0, Math.min(maxTop, top));

        dialogElement.style.left = `${left}px`;
        dialogElement.style.top = `${top}px`;
        if (width) {
            dialogElement.style.width = `${dialogWidth}px`;
        }
        if (height) {
            dialogElement.style.height = `${dialogHeight}px`;
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if show}
    <div class="prefix-dialog-overlay">
        <div class="prefix-dialog" bind:this={dialogElement}>
            <!-- 拖动区域 -->
            <div
                class="prefix-dialog-grabber"
                onmousedown={handleMouseDown}
                {title}
            >
                <div class="grabber-icon">≡</div>
                <div class="grabber-title">{showTitle}</div>
                {#if dm}
                    <button
                        title={tomatoI18n.退出}
                        class="close-button"
                        onclick={() => dm.destroyBy()}
                    >
                        {@html icon("iconClose", 15)}
                    </button>
                {/if}
            </div>

            <!-- 调整大小手柄 -->
            <div
                class="resizer nw"
                onmousedown={(e) => handleResizeStart(e, "nw")}
            ></div>
            <div
                class="resizer n"
                onmousedown={(e) => handleResizeStart(e, "n")}
            ></div>
            <div
                class="resizer ne"
                onmousedown={(e) => handleResizeStart(e, "ne")}
            ></div>
            <div
                class="resizer e"
                onmousedown={(e) => handleResizeStart(e, "e")}
            ></div>
            <div
                class="resizer se"
                onmousedown={(e) => handleResizeStart(e, "se")}
            ></div>
            <div
                class="resizer s"
                onmousedown={(e) => handleResizeStart(e, "s")}
            ></div>
            <div
                class="resizer sw"
                onmousedown={(e) => handleResizeStart(e, "sw")}
            ></div>
            <div
                class="resizer w"
                onmousedown={(e) => handleResizeStart(e, "w")}
            ></div>

            <!-- 内容区域 -->
            <div
                class:dialog-content={!hideScrollbar}
                class:dialog-content-hide-scrollbar={hideScrollbar}
            >
                {@render dialogInner()}
            </div>
        </div>
    </div>
{/if}

<style>
    .prefix-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 12;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    }

    .prefix-dialog {
        background: var(--b3-theme-background);
        border-radius: 8px;
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
        min-width: 50px;
        max-width: 90vw;
        pointer-events: all;
        position: absolute;
        transition: transform 0.2s ease-out;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }

    .prefix-dialog-grabber {
        padding: 10px 15px;
        cursor: move;
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--b3-border-color);
        border-radius: 8px 8px 0 0;
        background: var(--b3-toolbar-background);
    }

    .grabber-icon {
        user-select: none;
        color: var(--b3-theme-on-background);
        font-size: 16px;
        margin-right: 10px;
    }

    .grabber-title {
        flex: 1;
        font-size: xx-small;
        user-select: none;
        color: var(--b3-theme-on-background);
        font-weight: 500;
    }

    .close-button {
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--b3-theme-on-background);
        font-size: 16px;
        padding: 0 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .close-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .dialog-content {
        padding: 5px;
        flex: 1;
        min-height: 100px;
        overflow: auto;
    }

    .dialog-content-hide-scrollbar {
        padding: 5px;
        flex: 1;
        min-height: 100px;
        overflow: auto;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */
    }
    .dialog-content-hide-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome/Safari/Webkit */
    }

    /* 调整大小手柄样式 */
    .resizer {
        position: absolute;
        background-color: transparent;
        z-index: 1;
    }

    .resizer.nw {
        top: -5px;
        left: -5px;
        width: 10px;
        height: 10px;
        cursor: nwse-resize;
    }

    .resizer.n {
        top: -5px;
        left: 50%;
        width: calc(100% - 10px);
        height: 10px;
        transform: translateX(-50%);
        cursor: ns-resize;
    }

    .resizer.ne {
        top: -5px;
        right: -5px;
        width: 10px;
        height: 10px;
        cursor: nesw-resize;
    }

    .resizer.e {
        top: 50%;
        right: -5px;
        width: 10px;
        height: calc(100% - 10px);
        transform: translateY(-50%);
        cursor: ew-resize;
    }

    .resizer.se {
        bottom: -5px;
        right: -5px;
        width: 10px;
        height: 10px;
        cursor: nwse-resize;
    }

    .resizer.s {
        bottom: -5px;
        left: 50%;
        width: calc(100% - 10px);
        height: 10px;
        transform: translateX(-50%);
        cursor: ns-resize;
    }

    .resizer.sw {
        bottom: -5px;
        left: -5px;
        width: 10px;
        height: 10px;
        cursor: nesw-resize;
    }

    .resizer.w {
        top: 50%;
        left: -5px;
        width: 10px;
        height: calc(100% - 10px);
        transform: translateY(-50%);
        cursor: ew-resize;
    }
</style>
