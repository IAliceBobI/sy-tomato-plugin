<script lang="ts">
    import { onMount, Snippet } from "svelte";
    import { getTomatoPluginConfig } from "./utils";
    import { events } from "./Events";
    import { floatingballEnable } from "./stores";

    interface PropsType {
        show: boolean;
        title: string;
        dialogInner: Snippet;
        savePositionKey?: string;
    }

    let {
        savePositionKey = "",
        show = $bindable(true),
        title = $bindable("dialog"),
        dialogInner,
    }: PropsType = $props();

    // let dialogElement: HTMLElement = $state();
    let dialogElement: HTMLElement = $state();
    let isDragging = $state(false);
    let offsetX = $state(0);
    let offsetY = $state(0);
    let dialogTop = $state(0);
    let dialogLeft = $state(0);
    let showTitle = $derived.by(() => {
        const MAX_TITLE_LEN = 20;
        const suffix = title.length > MAX_TITLE_LEN ? ".." : "";
        return title.slice(0, MAX_TITLE_LEN) + suffix;
    });
    onMount(() => {
        if (savePositionKey) {
            loadPosition();
        }
    });

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

    function handleMouseUp() {
        isDragging = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        if (savePositionKey) {
            getTomatoPluginConfig()[key("offsetX")] = dialogElement.style.left;
            getTomatoPluginConfig()[key("offsetY")] = dialogElement.style.top;
            floatingballEnable.write(); // 任意一个key可以保存整体
        }
    }

    function key(k: string) {
        return `${savePositionKey}_${events.isMobile}_${k}`;
    }

    function loadPosition() {
        let x = getTomatoPluginConfig()[key("offsetX")];
        let y = getTomatoPluginConfig()[key("offsetY")];
        setPosition(x, y);
    }

    function setPosition(x?: string, y?: string) {
        if (!x) x = "200px";
        if (!y) y = "200px";

        // 解析像素值
        let left = parseInt(x, 10);
        let top = parseInt(y, 10);

        // 获取对话框尺寸
        let dialogWidth = dialogElement?.offsetWidth || 300;
        let dialogHeight = dialogElement?.offsetHeight || 200;

        // 限制在视口内
        const maxLeft = window.innerWidth - dialogWidth;
        const maxTop = window.innerHeight - dialogHeight;

        left = Math.max(0, Math.min(maxLeft, left));
        top = Math.max(0, Math.min(maxTop, top));

        dialogElement.style.left = `${left}px`;
        dialogElement.style.top = `${top}px`;
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if show}
    <div class="prefix-dialog-overlay">
        <div class="prefix-dialog" bind:this={dialogElement}>
            <div
                class="prefix-dialog-grabber"
                onmousedown={handleMouseDown}
                {title}
            >
                <!-- 拖动抓手区域 -->
                <div class="grabber-icon">≡</div>
                <div class="grabber-title">{showTitle}</div>
            </div>
            <div class="dialog-content">
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

    .dialog-content {
        padding: 20px;
        flex: 1;
    }
</style>
