<script lang="ts">
    import { onMount } from "svelte";
    import { fabric } from "fabric";
    import { getID } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    import { DestroyManager } from "./libs/destroyer";

    interface Props {
        imgSpan: HTMLSpanElement;
        nextOverlays: Overlays;
        originOverlays: Overlays;
        dm: DestroyManager;
    }

    let {
        imgSpan,
        nextOverlays = $bindable(),
        originOverlays = $bindable(),
        dm,
    }: Props = $props();
    let canvas: fabric.Canvas;
    let drawingRect: fabric.Rect = null;
    let scaleValue: number = $state(1);

    // 组别和模式选项
    const modes = [
        { k: "group", v: tomatoI18n.分组 },
        { k: "single", v: tomatoI18n.不分组 },
    ];
    let selectedMode: string = $state("group");
    let groups = $state([]);
    let selectedGroup: string = $state("1");

    onMount(async () => {
        for (let id = 1; id < 36; id++) {
            groups.push(id2txt(id));
        }
        groups = groups;
        const imgID = getID(imgSpan);
        const imgSrc = imgSpan?.querySelector("img")?.getAttribute("src") ?? "";
        if (imgID && imgSrc) {
            const imgTag = new Image();
            imgTag.src = imgSrc;
            canvas = new fabric.Canvas("imgOverlayBoxCanvas", {
                stateful: true,
                selection: false,
                uniformScaling: false,
            });

            canvas.on("mouse:down", function (o) {
                const pointer = canvas.getPointer(o.e);
                const target = canvas.findTarget(o.e, false);
                if (!target) {
                    drawingRect = new fabric.Rect({
                        left: 0,
                        top: 0,
                        fill: "transparent",
                        stroke: "red",
                        strokeWidth: 2,
                    });
                    canvas.add(drawingRect);
                    drawingRect.set({ left: pointer.x, top: pointer.y });
                }
            });

            canvas.on("mouse:move", function (o) {
                if (!drawingRect) return;
                var pointer = canvas.getPointer(o.e);
                drawingRect.set({
                    width: pointer.x - drawingRect.left,
                    height: pointer.y - drawingRect.top,
                });
                canvas.renderAll();
            });

            canvas.on("mouse:up", function () {
                if (!drawingRect) return;
                canvas.remove(drawingRect);
                addRect(drawingRect);
                drawingRect = null;
            });

            imgTag.onload = (_e) => {
                const img = new fabric.Image(imgTag);
                canvas.setWidth(imgTag.width * 2);
                canvas.setHeight(imgTag.height * 2);
                if (imgTag.width > 1200) {
                    scaleValue = 1200 / imgTag.width;
                    canvas.setZoom(scaleValue);
                } else if (imgTag.height > 1200) {
                    scaleValue = 1200 / imgTag.height;
                    canvas.setZoom(scaleValue);
                }
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: 1,
                    scaleY: 1,
                });
                nextOverlays.originWidth = img.width;
                if (originOverlays?.originWidth) {
                    originOverlays.originWidth = img.width;
                    originOverlays.overlays?.forEach((o) => {
                        canvas.add(
                            createOverlay(
                                o.cID,
                                o.left,
                                o.top,
                                o.width,
                                o.height,
                                o.angle,
                            ),
                        );
                    });
                }
                canvas.renderAll();
            };
        }
    });

    export function destroy() {
        canvas?.getObjects().forEach((obj) => {
            nextOverlays.overlays.push({
                left: obj.left,
                top: obj.top,
                width: obj.getScaledWidth(),
                height: obj.getScaledHeight(),
                angle: obj.angle,
                cID: (obj as any)?.getObjects()[1]?.text,
            });
        });
        canvas?.dispose();
    }

    function id2txt(id: number) {
        let txt = "#";
        if (id < 10) {
            txt = String(id);
        } else if (id >= 10 && id < 10 + 26) {
            txt = String.fromCharCode(65 + id - 10);
        }
        return txt;
    }

    function createOverlayFromRect(rect: fabric.Rect, id: number) {
        let txt = "#";
        if (selectedMode === "group") {
            txt = selectedGroup;
        } else {
            txt = id2txt(id);
        }
        const o = createOverlay(
            txt,
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width,
            rect.height,
            rect.angle,
        );
        return o;
    }

    function createOverlay(
        cID = "@",
        left = 40,
        top = 40,
        width = 80,
        height = 80,
        angle = 0,
    ) {
        const rect = new fabric.Rect({
            fill: "#fae1cf",
            stroke: "#000",
            strokeWidth: 1,
            strokeUniform: true,
            noScaleCache: false,
            opacity: 0.68,
            width: width,
            height: height,
            originX: "center",
            originY: "center",
        });
        const text = new fabric.Text(cID, {
            originX: "center",
            originY: "center",
        });
        text.scaleToHeight(height);
        const group = new fabric.Group([rect, text], {
            left: left,
            top: top,
            width: width,
            height: height,
            originX: "center",
            originY: "center",
            angle: angle,
        });
        return group;
    }

    function addRect(rect: fabric.Rect) {
        const c = canvas.getObjects().length + 1;
        canvas.add(createOverlayFromRect(rect, c));
        canvas.renderAll();
    }

    function remove() {
        const len = canvas.getObjects().length;
        if (len > 0) {
            const last = canvas.getObjects()[len - 1];
            canvas.remove(last);
            canvas.renderAll();
        }
    }

    function exit() {
        dm.destroyBy();
    }

    function updateScale() {
        canvas.setZoom(scaleValue);
        canvas.requestRenderAll();
    }
</script>

<!-- 添加选项UI -->
<div class="overlay-options">
    <label for="modeSelect">{tomatoI18n.当前模式}:</label>
    <select class="b3-select" id="modeSelect" bind:value={selectedMode}>
        {#each modes as mode}
            <option value={mode.k}>{mode.v}</option>
        {/each}
    </select>

    {#if selectedMode === "group"}
        <label for="groupSelect">{tomatoI18n.选择组别}:</label>
        <select class="b3-select" id="groupSelect" bind:value={selectedGroup}>
            {#each groups as group}
                <option value={group}>{group}</option>
            {/each}
        </select>
    {/if}
</div>

<!-- 保留原有canvas容器 -->
<div id="canvasContainer">
    <button class="b3-button b3-button--outline tomato-button" onclick={remove}
        >{tomatoI18n.删除最后一个遮挡层}</button
    >
    <button class="b3-button b3-button--outline tomato-button" onclick={exit}
        >{tomatoI18n.保存并退出}</button
    >
    <input
        title={tomatoI18n.缩放}
        type="range"
        bind:value={scaleValue}
        oninput={() => updateScale()}
        min="0"
        max="2"
        step="0.1"
    />
    <canvas id="imgOverlayBoxCanvas"></canvas>
</div>

<style>
    .overlay-options {
        margin: 5px;
    }
</style>
