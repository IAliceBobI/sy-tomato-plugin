<!-- FloatingActionButton.svelte -->
<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { FloatingBallHelper } from "./libs/FloatingBallHelper";
    import { ClickHelper } from "./libs/ClickHelper";
    import { confirm, Protyle } from "siyuan";
    import {
        getTomatoPluginConfig,
        getTomatoPluginInstance,
    } from "./libs/utils";
    import { floatingballDocList, floatingballEnable } from "./libs/stores";
    import { OpenSyFile2 } from "./libs/docUtils";
    import {
        getFloatingBallDocBtn,
        getFloatingBallProtyle,
    } from "./FloatingBall";
    import { arrayDeleteFromLeft } from "stonev5-utils";
    import { tomatoI18n } from "./tomatoI18n";

    interface Props {
        dm: DestroyManager;
        key: string;
        item: FloatingDocItem;
    }

    let { dm, key, item = $bindable() }: Props = $props();
    let div: HTMLElement = $state();
    let protyleTarget: HTMLElement = $state();
    let btnHelper = new ClickHelper();

    let width = $state(500);
    let height = $state(500);
    let resizing = false;
    let resizeDir = "";
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    export function destroy() {}
    // 加载本地存储的尺寸
    onMount(() => {
        new FloatingBallHelper(key, div, dm);
        const protyle = new Protyle(
            getTomatoPluginInstance().app,
            protyleTarget,
            {
                blockId: item.docID,
                action: ["cb-get-focus"],
                render: {
                    background: false,
                    title: false,
                    gutter: true,
                    scroll: true,
                    breadcrumb: false,
                    breadcrumbDocName: false,
                },
            },
        );
        dm.add("protyle", () => protyle.destroy());
        const w = getTomatoPluginConfig()[`${key}-width`];
        const h = getTomatoPluginConfig()[`${key}-height`];
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
        getTomatoPluginConfig()[`${key}-width`] = String(width);
        getTomatoPluginConfig()[`${key}-height`] = String(height);
        floatingballEnable.write();
        window.removeEventListener("mousemove", onResize);
        window.removeEventListener("mouseup", stopResize);
    }

    function exitProtyle() {
        item.openOnCreate = false;
        floatingballDocList.write();
        getFloatingBallDocBtn(item);
        getFloatingBallProtyle(item)?.destroyBy();
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div>
    <div class="floating-button" bind:this={div}>
        <div class="fn__flex-column">
            <button
                title={tomatoI18n.解除悬浮球与文档之间的绑定}
                onmousedown={(event) => {
                    btnHelper.handleMouseDown(event);
                }}
                onmouseup={(event) => {
                    btnHelper.handleMouseUp(event, () => {
                        confirm(
                            tomatoI18n.解除悬浮球与文档之间的绑定,
                            "⚠️",
                            () => {
                                item.openOnCreate = false;
                                arrayDeleteFromLeft(
                                    $floatingballDocList,
                                    (i) => {
                                        return i.docID != item.docID;
                                    },
                                );
                                floatingballDocList.write();
                                getFloatingBallProtyle(item)?.destroyBy();
                                getFloatingBallDocBtn(item)?.destroyBy();
                            },
                        );
                    });
                }}
                class="b3-button b3-button--outline space">⛓️‍💥</button
            >
            <button
                onmousedown={(event) => {
                    btnHelper.handleMouseDown(event);
                }}
                onmouseup={(event) => {
                    btnHelper.handleMouseUp(event, exitProtyle);
                }}
                class="b3-button b3-button--outline space">🏃</button
            >
            <button
                onmousedown={(event) => {
                    btnHelper.handleMouseDown(event);
                }}
                onmouseup={(event) => {
                    btnHelper.handleMouseUp(event, () => {
                        OpenSyFile2(getTomatoPluginInstance(), item.docID);
                        exitProtyle();
                    });
                }}
                class="b3-button b3-button--outline space">🎯</button
            >
        </div>
        <div
            class="protyleClass"
            style="width: {width}px; height: {height}px; border: 3px solid;"
            onmousedown={(event) => {
                btnHelper.handleMouseDown(event);
            }}
            onmouseup={(event) => {
                btnHelper.handleMouseUp(event, toggleOpen);
            }}
            bind:this={protyleTarget}
        ></div>
        <!-- 拖拽手柄 -->
        <div
            class="resize-handle resize-handle-se"
            onmousedown={(e) => startResize(e, "se")}
        ></div>
        <div
            class="resize-handle resize-handle-e"
            onmousedown={(e) => startResize(e, "e")}
        ></div>
        <div
            class="resize-handle resize-handle-s"
            onmousedown={(e) => startResize(e, "s")}
        ></div>
    </div>
</div>

<style>
    .space {
        margin-top: 10px;
    }
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
        z-index: 11;
        position: fixed;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
</style>
