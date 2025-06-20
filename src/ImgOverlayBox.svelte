<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { fabric } from "fabric";
    import { getID } from "./libs/utils";
    import { Dialog } from "siyuan";
    import { tomatoI18n } from "./tomatoI18n";

    export let imgSpan: HTMLSpanElement;
    export let nextOverlays: Overlays;
    export let originOverlays: Overlays;
    export let dialog: Dialog;
    let canvas: fabric.Canvas;
    let drawingRect: fabric.Rect = null;
    let scaleValue: number = 1;

    onMount(async () => {
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

    onDestroy(() => {
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
    });

    function createOverlayFromRect(rect: fabric.Rect, id: number) {
        let txt = "#";
        if (id < 10) {
            txt = String(id);
        } else if (id >= 10 && id < 10 + 26) {
            txt = String.fromCharCode(65 + id - 10);
        }
        return createOverlay(
            txt,
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width,
            rect.height,
            rect.angle,
        );
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
        dialog?.destroy();
    }

    function updateScale() {
        canvas.setZoom(scaleValue);
        canvas.requestRenderAll();
    }
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="b3-dialog__content">
    <button class="b3-button b3-button--outline" on:click={remove}
        >{tomatoI18n.删除最后一个遮挡层}</button
    >
    <button class="b3-button b3-button--outline" on:click={exit}>{tomatoI18n.保存并退出}</button>
    <input
        title={tomatoI18n.缩放}
        type="range"
        bind:value={scaleValue}
        on:input={() => updateScale()}
        min="0"
        max="2"
        step="0.1"
    />
    <canvas id="imgOverlayBoxCanvas"></canvas>
</div>
