<!-- FloatingActionButton.svelte -->
<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { FloatingBallHelper } from "./libs/FloatingBallHelper";
    import ProtyleSv4Dialog from "./libs/ProtyleSv4Dialog.svelte";
    import { ClickHelper } from "./libs/ClickHelper";
    import {
        FloatingBallDocType_dialog,
        FloatingBallDocType_tab,
        SPACE,
    } from "./libs/gconst";
    import { Dialog } from "siyuan";
    import { newID } from "stonev5-utils/lib/id";
    import { events } from "./libs/Events";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { closeTab, siyuan, getTomatoPluginInstance } from "./libs/utils";
    import { dialog2floating } from "./libs/DialogText";
    import {
        getFloatingBallDocBtn,
        getFloatingBallProtyle,
    } from "./FloatingBall";
    import { tomatoI18n } from "./tomatoI18n";
    import { floatingballDocList } from "./libs/stores";

    export let dm: DestroyManager;
    export let key: string;
    export let item: FloatingDocItem;
    let div: HTMLElement;
    let btnHelper = new ClickHelper();
    let dialog: Dialog = null;
    let ballHelper: FloatingBallHelper;

    onMount(() => {
        ballHelper = new FloatingBallHelper(key, div, dm);
    });

    export async function toggleOpen(_event: MouseEvent) {
        item.docID = "";
        if (item.docName === "$$dailynote") {
            item.docID = (await siyuan.createDailyNote(events.boxID)).id;
        }
        if (events.isMobile) {
            if (dialog != null) {
                dialog.destroy();
                dialog = null;
            } else {
                openByDialog();
            }
            return;
        }
        if (!item.docID) {
            const docs = await siyuan.getDocRowsByName(item.docName);
            item.docID = docs?.at(0)?.id ?? "";
        }
        if (item.docID) {
            switch (item.openDocType) {
                case FloatingBallDocType_tab.id:
                    if (closeTab(item.docName)) {
                        //
                    } else {
                        await OpenSyFile2(
                            getTomatoPluginInstance(),
                            item.docID,
                        );
                    }
                    break;
                case FloatingBallDocType_dialog.id:
                    if (dialog != null) {
                        dialog.destroy();
                        dialog = null;
                    } else {
                        openByDialog();
                    }
                    break;
                default:
                    getFloatingBallProtyle(item);
                    item.openOnCreate = true;
                    floatingballDocList.write();
                    getFloatingBallDocBtn(item)?.destroyBy();
                    break;
            }
        } else {
            await siyuan.pushMsg(tomatoI18n.找不到文档 + ": " + item.docName);
        }
    }

    function openByDialog() {
        const dm = new DestroyManager();
        const id = newID();
        dialog = new Dialog({
            title: item.docName,
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
            dialog.element.style.zIndex = "10";
        }
        const sv = new ProtyleSv4Dialog({
            target: dialog.element.querySelector("#" + id),
            props: {
                dm,
                docName: item.docName,
                docID: item.docID,
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
        title={item.docName}
        class="b3-button b3-button--outline"
    >
        {item.docIcon}
    </button>
    {SPACE}
</div>

<style>
    .floating-button {
        z-index: 12;
        position: fixed;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
</style>
