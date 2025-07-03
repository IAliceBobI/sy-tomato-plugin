<!-- FloatingActionButton.svelte -->
<script lang="ts">
    import { mount, onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { FloatingBallHelper } from "./libs/FloatingBallHelper";
    import ProtyleSv4Dialog from "./libs/ProtyleSv4Dialog.svelte";
    import { ClickHelper } from "./libs/ClickHelper";
    import {
        FloatingBallDocType_autoclose,
        FloatingBallDocType_dialog,
        FloatingBallDocType_float2,
        FloatingBallDocType_tab,
        SPACE,
    } from "./libs/gconst";
    import { confirm, Dialog } from "siyuan";
    import { newID } from "stonev5-utils/lib/id";
    import { events } from "./libs/Events";
    import { OpenSyFile2 } from "./libs/docUtils";
    import {
        closeTab,
        siyuan,
        getTomatoPluginInstance,
        getNotebookFirstOne,
    } from "./libs/utils";
    import { dialog2floating } from "./libs/DialogText";
    import {
        getFloatingBallDocBtn,
        getFloatingBallProtyle,
        getFloatingBallProtyleDialog,
    } from "./FloatingBall";
    import { tomatoI18n } from "./tomatoI18n";
    import {
        floatingballDocList,
        storeNoteBox_selectedNotebook,
    } from "./libs/stores";
    import { arrayDeleteFromLeft } from "stonev5-utils";

    interface Props {
        dm: DestroyManager;
        key: string;
        item: FloatingDocItem;
        // rest: any[];
    }
    let { dm, key, item /*...rest*/ }: Props = $props();
    let div: HTMLElement;
    let btnHelper = new ClickHelper();
    let dialog: Dialog = null;
    let ballHelper: FloatingBallHelper;

    onMount(() => {
        // rest;
        ballHelper = new FloatingBallHelper(key, div, dm);
    });

    export function destroy() {}

    export async function toggleOpen(event: MouseEvent) {
        if (event) {
            if (
                event.ctrlKey ||
                event.altKey ||
                event.shiftKey ||
                event.metaKey
            ) {
                confirm(tomatoI18n.解除悬浮球与文档之间的绑定, "⚠️", () => {
                    arrayDeleteFromLeft($floatingballDocList, (i) => {
                        return i.docID != item.docID;
                    });
                    item.openOnCreate = false;
                    floatingballDocList.write();
                    getFloatingBallProtyle(item)?.destroyBy();
                    getFloatingBallProtyleDialog(item)?.destroyBy();
                    getFloatingBallDocBtn(item)?.destroyBy();
                    return;
                });
            }
        }
        item.docID = "";
        if (item.docName === "$$dailynote") {
            if (storeNoteBox_selectedNotebook.get()) {
                item.docID = (
                    await siyuan.createDailyNote(
                        storeNoteBox_selectedNotebook.get(),
                    )
                ).id;
            } else {
                item.docID = (
                    await siyuan.createDailyNote(
                        getNotebookFirstOne()?.id ?? events.boxID,
                    )
                ).id;
            }
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
                case FloatingBallDocType_autoclose.id:
                    if (dialog != null) {
                        dialog.destroy();
                        dialog = null;
                    } else {
                        openByDialog(true);
                    }
                    break;
                case FloatingBallDocType_float2.id:
                    getFloatingBallProtyleDialog(item);
                    item.openOnCreate = true;
                    floatingballDocList.write();
                    getFloatingBallDocBtn(item)?.destroyBy();
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

    function openByDialog(autoclose = false) {
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
            disableClose: events.isMobile || autoclose ? false : true,
            hideCloseIcon: false,
        });
        if (!events.isMobile && !autoclose) {
            dialog2floating(dialog, ballHelper.getPosition());
            dialog.element.style.zIndex = "10";
        }

        const sv = mount(ProtyleSv4Dialog, {
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
            sv.destroy();
        });
    }
</script>

<div class="floating-button" bind:this={div}>
    {SPACE}
    <!-- svelte-ignore event_directive_deprecated -->
    <button
        onmousedown={(event) => {
            btnHelper.handleMouseDown(event);
        }}
        onmouseup={(event) => {
            btnHelper.handleMouseUp(event, toggleOpen);
        }}
        title={tomatoI18n.ctrl点击删除按钮 + "@" + item.docName}
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
