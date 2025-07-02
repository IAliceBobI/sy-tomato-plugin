<script lang="ts">
    import { Snippet } from "svelte";

    interface PropsType {
        show: boolean;
        title: string;
        dialogInner: Snippet;
    }

    let {
        show = $bindable(true),
        title = $bindable("dialog"),
        dialogInner,
    }: PropsType = $props();

    let dialogElement: HTMLElement = $state();
    let isDragging = $state(false);
    let offsetX = $state(0);
    let offsetY = $state(0);
    let dialogTop = $state(0);
    let dialogLeft = $state(0);

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
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if show}
    <div class="prefix-dialog-overlay">
        <div class="prefix-dialog" bind:this={dialogElement}>
            <div class="prefix-dialog-grabber" onmousedown={handleMouseDown}>
                <!-- 拖动抓手区域 -->
                <div class="grabber-icon">≡</div>
                <div class="grabber-title">{title}</div>
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
        min-width: 320px;
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
        user-select: none;
        color: var(--b3-theme-on-background);
        font-weight: 500;
    }

    .dialog-content {
        padding: 20px;
        flex: 1;
    }
</style>
