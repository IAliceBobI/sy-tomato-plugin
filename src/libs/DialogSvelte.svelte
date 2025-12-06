<script lang="ts">
    import { onMount, Snippet, tick } from "svelte";
    import { getProgressivePluginConfig, getTomatoPluginConfig, icon } from "./utils";
    import { events } from "./Events";
    import { userID } from "./stores";
    import { DestroyManager } from "./destroyer";
    import { tomatoI18n } from "../tomatoI18n";

    interface PropsType {
        show: boolean;
        title: string;
        savePositionKey?: string;
        hideScrollbar?: boolean;
        dialogInner: Snippet;
        minWidth?: number;
        minHeight?: number;
        maxWidth?: string;
        maxHeight?: string;
        width?: string;
        height?: string;
        dm?: DestroyManager;
        useBrowserStorage?: boolean;
        isProgressive?: boolean;
        zIndexPlus?: boolean;
        // 新增属性：基础z-index值，用于多层级窗体
        baseZIndex?: number;
        draggable?: boolean;
        resizable?: boolean;
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
        isProgressive = false,
        zIndexPlus = false,
        // 默认基础z-index为12，可通过属性调整
        baseZIndex = 12,
        draggable = true,
        resizable = true,
    }: PropsType = $props();

    let dialogElement: HTMLElement | null = $state(null);
    let isDragging = $state(false);
    let isResizing = $state(false);
    let offsetX = $state(0);
    let offsetY = $state(0);
    let resizeDirection = $state("");
    let currentZIndex = $state(baseZIndex);
    let showTitle = $derived.by(() => {
        const MAX_TITLE_LEN = 20;
        const suffix = title.length > MAX_TITLE_LEN ? ".." : "";
        return title.slice(0, MAX_TITLE_LEN) + suffix;
    });

    // 清理事件监听器的辅助函数 - 使用 Pointer Events
    function cleanupEventListeners() {
        document.removeEventListener("pointermove", handleDragMove);
        document.removeEventListener("pointerup", handleDragEnd);
        document.removeEventListener("pointermove", handleResize);
        document.removeEventListener("pointerup", handleResizeEnd);
        // 兜底：保留旧的事件监听器清理（兼容性）
        document.removeEventListener("mousemove", handleDragMove);
        document.removeEventListener("mouseup", handleDragEnd);
        document.removeEventListener("touchmove", handleDragMove);
        document.removeEventListener("touchend", handleDragEnd);
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", handleResizeEnd);
        document.removeEventListener("touchmove", handleResize);
        document.removeEventListener("touchend", handleResizeEnd);
    }

    onMount(() => {
        // 组件卸载时确保清理所有事件监听器
        return () => {
            cleanupEventListeners();
        };
    });

    $effect(() => {
        if (show && dialogElement) {
            // 确保样式正确应用
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

            // 设置z-index
            dialogElement.style.zIndex = zIndexPlus ? "999" : currentZIndex.toString();

            // 延迟加载位置，确保元素已渲染
            tick().then(() => {
                if (savePositionKey) {
                    loadPosition();
                } else {
                    // 如果没有保存的位置，居中显示
                    centerDialog();
                }
            });
        }
    });

    // 当对话框被点击时，提升z-index使其位于顶层
    function bringToFront() {
        if (!dialogElement) return;

        // 找到当前页面中所有对话框的最大z-index
        const dialogs = document.querySelectorAll(".prefix-dialog");
        let maxZIndex = baseZIndex;

        dialogs.forEach((dialog) => {
            const zIndex = parseInt(getComputedStyle(dialog).zIndex || "0", 10);
            if (zIndex > maxZIndex) {
                maxZIndex = zIndex;
            }
        });

        // 将当前对话框z-index设置为比最大的大1
        currentZIndex = maxZIndex + 1;
        dialogElement.style.zIndex = currentZIndex.toString();
    }

    // 新增：将对话框居中显示的方法
    function centerDialog() {
        if (!dialogElement) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const dialogWidth = dialogElement.offsetWidth;
        const dialogHeight = dialogElement.offsetHeight;

        const left = Math.max(0, (viewportWidth - dialogWidth) / 2);
        const top = Math.max(0, (viewportHeight - dialogHeight) / 2);

        dialogElement.style.left = `${left}px`;
        dialogElement.style.top = `${top}px`;
    }

    function getEventPosition(event: MouseEvent | TouchEvent | PointerEvent) {
        // Pointer Events 和 Mouse Events 都有 clientX/clientY
        if (event instanceof PointerEvent || event instanceof MouseEvent) {
            return {
                clientX: event.clientX,
                clientY: event.clientY,
            };
        }
        // Touch Events
        if (event instanceof TouchEvent && event.touches.length > 0) {
            return {
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY,
            };
        }
        // 兜底：假设有 clientX/clientY 属性
        const e = event as unknown as { clientX: number; clientY: number };
        return {
            clientX: e.clientX ?? 0,
            clientY: e.clientY ?? 0,
        };
    }

    // 拖动相关函数 - 使用 Pointer Events
    function handleDragStart(event: MouseEvent | TouchEvent | PointerEvent) {
        if (!draggable || !dialogElement || isResizing) return;

        event.stopPropagation();
        event.preventDefault();

        // 拖动时将当前对话框置于顶层
        bringToFront();

        isDragging = true;

        const rect = dialogElement.getBoundingClientRect();
        const { clientX, clientY } = getEventPosition(event);

        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        // 先移除可能存在的监听器，避免重复绑定
        cleanupEventListeners();

        // 使用 Pointer Events（统一处理鼠标和触控）
        if (event instanceof PointerEvent) {
            // 捕获指针，确保事件持续跟踪
            (event.target as HTMLElement)?.setPointerCapture?.(event.pointerId);
        }

        document.addEventListener("pointermove", handleDragMove, { passive: false });
        document.addEventListener("pointerup", handleDragEnd);
    }

    function handleDragMove(event: MouseEvent | TouchEvent | PointerEvent) {
        if (!isDragging || !dialogElement) return;

        // 对于触控事件，阻止默认行为（防止页面滚动）
        if (event instanceof PointerEvent && event.pointerType === "touch") {
            event.preventDefault();
        } else if ("touches" in event) {
            event.preventDefault();
        }

        const { clientX, clientY } = getEventPosition(event);

        // 计算新位置
        const newTop = clientY - offsetY;
        const newLeft = clientX - offsetX;

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

    function handleDragEnd(event?: MouseEvent | TouchEvent | PointerEvent) {
        if (!isDragging) return;

        isDragging = false;
        
        // 释放指针捕获
        if (event instanceof PointerEvent && event.target) {
            (event.target as HTMLElement)?.releasePointerCapture?.(event.pointerId);
        }

        cleanupEventListeners();

        if (savePositionKey) {
            savePosition();
        }
    }

    // 调整大小相关函数 - 使用 Pointer Events
    function handleResizeStart(event: MouseEvent | TouchEvent | PointerEvent, direction: string) {
        if (!resizable || !dialogElement || isDragging) return;

        event.stopPropagation();
        event.preventDefault();

        // 调整大小时将当前对话框置于顶层
        bringToFront();

        isResizing = true;
        resizeDirection = direction;

        const rect = dialogElement.getBoundingClientRect();
        const { clientX, clientY } = getEventPosition(event);

        offsetX = clientX;
        offsetY = clientY;

        // 保存当前对话框尺寸
        dialogElement.style.width = `${rect.width}px`;
        dialogElement.style.height = `${rect.height}px`;

        // 先移除可能存在的监听器，避免重复绑定
        cleanupEventListeners();

        // 使用 Pointer Events（统一处理鼠标和触控）
        if (event instanceof PointerEvent) {
            // 捕获指针，确保事件持续跟踪
            (event.target as HTMLElement)?.setPointerCapture?.(event.pointerId);
        }

        document.addEventListener("pointermove", handleResize, { passive: false });
        document.addEventListener("pointerup", handleResizeEnd);
    }

    function handleResize(event: MouseEvent | TouchEvent | PointerEvent) {
        if (!isResizing || !dialogElement || !resizeDirection) return;

        // 对于触控事件，阻止默认行为（防止页面滚动/缩放）
        if (event instanceof PointerEvent && event.pointerType === "touch") {
            event.preventDefault();
        } else if ("touches" in event) {
            event.preventDefault();
        }

        const { clientX, clientY } = getEventPosition(event);
        const rect = dialogElement.getBoundingClientRect();
        let newWidth = rect.width;
        let newHeight = rect.height;
        let newLeft = rect.left;
        let newTop = rect.top;

        // 根据调整方向计算新尺寸和位置
        if (resizeDirection.includes("e")) {
            newWidth = Math.max(minWidth, rect.width + (clientX - offsetX));
        } else if (resizeDirection.includes("w")) {
            const deltaX = clientX - offsetX;
            newWidth = Math.max(minWidth, rect.width - deltaX);
            newLeft = rect.left + deltaX;
        }

        if (resizeDirection.includes("s")) {
            newHeight = Math.max(minHeight, rect.height + (clientY - offsetY));
        } else if (resizeDirection.includes("n")) {
            const deltaY = clientY - offsetY;
            newHeight = Math.max(minHeight, rect.height - deltaY);
            newTop = rect.top + deltaY;
        }

        // 确保对话框不超出视口
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // 边界检查增强
        if (newLeft < 0) {
            newWidth += newLeft;
            newLeft = 0;
        }

        if (newTop < 0) {
            newHeight += newTop;
            newTop = 0;
        }

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

        // 更新鼠标/触摸点偏移量
        offsetX = clientX;
        offsetY = clientY;
    }

    function handleResizeEnd(event?: MouseEvent | TouchEvent | PointerEvent) {
        if (!isResizing) return;

        isResizing = false;
        resizeDirection = "";
        
        // 释放指针捕获
        if (event instanceof PointerEvent && event.target) {
            (event.target as HTMLElement)?.releasePointerCapture?.(event.pointerId);
        }

        cleanupEventListeners();

        if (savePositionKey) {
            savePosition();
        }
    }

    function key(k: string) {
        return `${savePositionKey}_${events.isMobile}_${k}`;
    }

    function loadPosition() {
        if (!dialogElement || !savePositionKey) return;

        try {
            let x: string | null = null;
            let y: string | null = null;
            let w: string | null = null;
            let h: string | null = null;

            if (useBrowserStorage) {
                x = localStorage.getItem(key("offsetX"));
                y = localStorage.getItem(key("offsetY"));
                w = localStorage.getItem(key("width"));
                h = localStorage.getItem(key("height"));
            } else {
                const cfg = getCfg();
                x = cfg[key("offsetX")] || null;
                y = cfg[key("offsetY")] || null;
                w = cfg[key("width")] || null;
                h = cfg[key("height")] || null;
            }

            setPosition(x, y, w, h);
        } catch (error) {
            console.error("Failed to load dialog position:", error);
            // 加载失败时居中显示
            centerDialog();
        }
    }

    function getCfg() {
        if (isProgressive) {
            return getProgressivePluginConfig();
        }
        return getTomatoPluginConfig();
    }

    function savePosition() {
        if (!dialogElement || !savePositionKey) return;

        try {
            if (useBrowserStorage) {
                if (dialogElement.style.left) localStorage.setItem(key("offsetX"), dialogElement.style.left);
                if (dialogElement.style.top) localStorage.setItem(key("offsetY"), dialogElement.style.top);
                if (dialogElement.style.width) localStorage.setItem(key("width"), dialogElement.style.width);
                if (dialogElement.style.height) localStorage.setItem(key("height"), dialogElement.style.height);
            } else {
                const cfg = getCfg();
                if (dialogElement.style.left) cfg[key("offsetX")] = dialogElement.style.left;
                if (dialogElement.style.top) cfg[key("offsetY")] = dialogElement.style.top;
                if (dialogElement.style.width) cfg[key("width")] = dialogElement.style.width;
                if (dialogElement.style.height) cfg[key("height")] = dialogElement.style.height;
                userID.write();
            }
        } catch (error) {
            console.error("Failed to save dialog position:", error);
        }
    }

    function setPosition(x?: string | null, y?: string | null, width?: string | null, height?: string | null) {
        if (!dialogElement) return;

        // 如果没有保存的位置，居中显示
        if (!x || !y) {
            centerDialog();
            return;
        }

        // 解析像素值
        let left = parseInt(x, 10);
        let top = parseInt(y, 10);
        let w = width ? parseInt(width, 10) : dialogElement.offsetWidth;
        let h = height ? parseInt(height, 10) : dialogElement.offsetHeight;

        // 检查是否为有效数字
        if (isNaN(left) || isNaN(top)) {
            centerDialog();
            return;
        }

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
        if (width && !isNaN(w)) {
            dialogElement.style.width = `${dialogWidth}px`;
        }
        if (height && !isNaN(h)) {
            dialogElement.style.height = `${dialogHeight}px`;
        }
    }

    // 窗口大小变化时重新调整位置，防止对话框超出视口
    function handleWindowResize() {
        if (dialogElement && show) {
            setPosition(
                dialogElement.style.left,
                dialogElement.style.top,
                dialogElement.style.width,
                dialogElement.style.height,
            );
        }
    }

    // 添加窗口大小变化监听
    window.addEventListener("resize", handleWindowResize);
    // 组件卸载时移除监听
    onMount(() => {
        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
    });
</script>

{#if show}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="prefix-dialog-overlay"
        class:prefix-dialog-overlay-up={zIndexPlus}
        onmousedown={(e) => e.stopPropagation()}
        ontouchstart={(e) => e.stopPropagation()}
        style="z-index: {zIndexPlus ? 998 : baseZIndex - 1}"
    >
        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <div
            class="prefix-dialog"
            bind:this={dialogElement}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onmousedown={bringToFront}
        >
            <!-- 拖动区域 -->
            <div
                class="prefix-dialog-grabber"
                onpointerdown={handleDragStart}
                onmousedown={handleDragStart}
                ontouchstart={handleDragStart}
                class:no-drag={!draggable}
                id="dialog-title"
            >
                <div class="grabber-icon">≡</div>
                <div class="grabber-title">{showTitle}</div>
                {#if dm}
                    <button
                        title={tomatoI18n.退出}
                        class="close-button"
                        onclick={(e) => {
                            e.stopPropagation();
                            dm.destroyBy();
                        }}
                    >
                        {@html icon("iconClose", 15)}
                    </button>
                {/if}
            </div>

            <!-- 调整大小手柄 -->
            {#if resizable}
                <div
                    class="resizer nw"
                    onpointerdown={(e) => handleResizeStart(e, "nw")}
                    onmousedown={(e) => handleResizeStart(e, "nw")}
                    ontouchstart={(e) => handleResizeStart(e, "nw")}
                    aria-label="调整窗口大小（西北方向）"
                ></div>
                <div
                    class="resizer n"
                    onpointerdown={(e) => handleResizeStart(e, "n")}
                    onmousedown={(e) => handleResizeStart(e, "n")}
                    ontouchstart={(e) => handleResizeStart(e, "n")}
                    aria-label="调整窗口大小（北方向）"
                ></div>
                <div
                    class="resizer ne"
                    onpointerdown={(e) => handleResizeStart(e, "ne")}
                    onmousedown={(e) => handleResizeStart(e, "ne")}
                    ontouchstart={(e) => handleResizeStart(e, "ne")}
                    aria-label="调整窗口大小（东北方向）"
                ></div>
                <div
                    class="resizer e"
                    onpointerdown={(e) => handleResizeStart(e, "e")}
                    onmousedown={(e) => handleResizeStart(e, "e")}
                    ontouchstart={(e) => handleResizeStart(e, "e")}
                    aria-label="调整窗口大小（东方向）"
                ></div>
                <div
                    class="resizer se"
                    onpointerdown={(e) => handleResizeStart(e, "se")}
                    onmousedown={(e) => handleResizeStart(e, "se")}
                    ontouchstart={(e) => handleResizeStart(e, "se")}
                    aria-label="调整窗口大小（东南方向）"
                ></div>
                <div
                    class="resizer s"
                    onpointerdown={(e) => handleResizeStart(e, "s")}
                    onmousedown={(e) => handleResizeStart(e, "s")}
                    ontouchstart={(e) => handleResizeStart(e, "s")}
                    aria-label="调整窗口大小（南方向）"
                ></div>
                <div
                    class="resizer sw"
                    onpointerdown={(e) => handleResizeStart(e, "sw")}
                    onmousedown={(e) => handleResizeStart(e, "sw")}
                    ontouchstart={(e) => handleResizeStart(e, "sw")}
                    aria-label="调整窗口大小（西南方向）"
                ></div>
                <div
                    class="resizer w"
                    onpointerdown={(e) => handleResizeStart(e, "w")}
                    onmousedown={(e) => handleResizeStart(e, "w")}
                    ontouchstart={(e) => handleResizeStart(e, "w")}
                    aria-label="调整窗口大小（西方向）"
                ></div>
            {/if}

            <!-- 内容区域 -->
            <div class:dialog-content={!hideScrollbar} class:dialog-content-hide-scrollbar={hideScrollbar}>
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
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    }

    .prefix-dialog-overlay-up {
        z-index: 998 !important;
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
        overflow-y: hidden;
        overflow-x: hidden;
    }

    .prefix-dialog-grabber {
        padding: 10px 15px;
        cursor: move;
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--b3-border-color);
        border-radius: 8px 8px 0 0;
        background: var(--b3-toolbar-background);
        user-select: none; /* 防止拖动时文本被选中 */
        touch-action: none; /* 防止触控滚动/缩放干扰拖动 */
    }

    .prefix-dialog-grabber.no-drag {
        cursor: default;
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
        padding: 3px 8px;
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

    /* 调整大小手柄样式 - 增大交互区域 */
    .resizer {
        position: absolute;
        background-color: transparent;
        z-index: 2; /* 确保在对话框内容之上 */
        touch-action: none; /* 防止触控滚动/缩放干扰调整大小 */
    }

    .resizer.nw {
        top: -8px;
        left: -8px;
        width: 16px;
        height: 16px;
        cursor: nwse-resize;
    }

    .resizer.n {
        top: -8px;
        left: 16px;
        right: 16px;
        height: 16px;
        cursor: ns-resize;
    }

    .resizer.ne {
        top: -8px;
        right: -8px;
        width: 16px;
        height: 16px;
        cursor: nesw-resize;
    }

    .resizer.e {
        top: 16px;
        right: -8px;
        bottom: 16px;
        width: 16px;
        cursor: ew-resize;
    }

    .resizer.se {
        bottom: -8px;
        right: -8px;
        width: 16px;
        height: 16px;
        cursor: nwse-resize;
        /* 东南方向手柄是最常用的，增加视觉提示 */
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 0 0 8px 0;
    }

    .resizer.s {
        bottom: -8px;
        left: 16px;
        right: 16px;
        height: 16px;
        cursor: ns-resize;
    }

    .resizer.sw {
        bottom: -8px;
        left: -8px;
        width: 16px;
        height: 16px;
        cursor: nesw-resize;
    }

    .resizer.w {
        top: 16px;
        left: -8px;
        bottom: 16px;
        width: 16px;
        cursor: ew-resize;
    }

    /* 为触摸设备增大交互区域 */
    @media (pointer: coarse) {
        .resizer {
            width: 24px;
            height: 24px;
        }

        .resizer.nw,
        .resizer.ne,
        .resizer.sw,
        .resizer.se {
            margin: -12px;
        }

        .prefix-dialog-grabber {
            padding: 15px;
        }
    }
</style>
