<!-- FloatingActionButton.svelte -->
<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { FloatingBallHelper } from "./libs/FloatingBallHelper";
    import ProtyleSv4Dialog from "./libs/ProtyleSv4Dialog.svelte";
    import { ClickHelper } from "./libs/ClickHelper";
    import { SPACE } from "./libs/gconst";
    import { Dialog } from "siyuan";
    import { newID } from "stonev5-utils/lib/id";
    import { events } from "./libs/Events";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { closeTab, siyuan, getPlugin } from "./libs/utils";
    import { dialog2floating } from "./libs/DialogText";
    import {
        getFloatingBallProtyle,
        newFloatingBallProtyle,
    } from "./FloatingBall";
    import { tomatoI18n } from "./tomatoI18n";

    export let dm: DestroyManager;
    export let key: string;
    export let docName: string;
    export let docIcon: string;
    export let useDialog: boolean;
    let div: HTMLElement;
    let btnHelper = new ClickHelper();
    let dialog: Dialog = null;
    let ballHelper: FloatingBallHelper;

    onMount(() => {
        ballHelper = new FloatingBallHelper(key, div, dm);
    });

    async function toggleOpen(_event: MouseEvent) {
        if (dialog != null) {
            dialog.destroy();
            dialog = null;
            return;
        }
        if (events.isMobile) {
            openByDialog();
            return;
        }
        // document.dispatchEvent(
        //     new KeyboardEvent("keydown", {
        //         key: "0",
        //         keyCode: 48,
        //         altKey: true,
        //         view: window,
        //         bubbles: true,
        //     }),
        // );
        const docs = await siyuan.getDocRowsByName(docName);
        if (docs?.length > 0) {
            if (useDialog) {
                const dm = getFloatingBallProtyle(docs.at(0).id);
                if (dm) {
                    dm.destroyBy();
                } else {
                    newFloatingBallProtyle(docs.at(0).id);
                }
            } else {
                if (!closeTab(docName)) {
                    await OpenSyFile2(getPlugin(), docs.at(0).id);
                }
            }
        } else {
            await siyuan.pushMsg(tomatoI18n.找不到文档 + ": " + docName);
        }
    }

    function openByDialog() {
        const dm = new DestroyManager();
        const id = newID();
        dialog = new Dialog({
            title: docName,
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : "700px",
            height: events.isMobile ? "180svw" : "700px",
            destroyCallback: () => {
                dm.destroyBy();
            },
            transparent: true,
            disableClose: events.isMobile ? false : true,
            hideCloseIcon: false,
        });
        if (!events.isMobile) {
            dialog2floating(dialog, ballHelper.getPosition());
        }
        const sv = new ProtyleSv4Dialog({
            target: dialog.element.querySelector("#" + id),
            props: {
                dm,
                docName,
            },
        });
        dm.add("dialog", () => {
            dialog?.destroy();
            dialog = null;
        });
        dm.add("svelte", () => {
            sv.$destroy();
        });
    }
</script>

<div class="floating-button" bind:this={div}>
    {SPACE}
    <button
        on:mousedown={(event) => {
            btnHelper.handleMouseDown(event);
        }}
        on:mouseup={(event) => {
            btnHelper.handleMouseUp(event, toggleOpen);
        }}
        title={docName}
        class="b3-button b3-button--outline"
    >
        {docIcon}
    </button>
    {SPACE}
</div>

<style>
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
