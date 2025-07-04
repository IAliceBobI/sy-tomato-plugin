<!-- FloatingActionButton.svelte -->
<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { confirm, Protyle } from "siyuan";
    import { getTomatoPluginInstance } from "./libs/utils";
    import { floatingballDocList } from "./libs/stores";
    import { OpenSyFile2 } from "./libs/docUtils";
    import {
        getFloatingBallDocBtn,
        getFloatingBallProtyleDialog,
    } from "./FloatingBall";
    import { arrayDeleteFromLeft } from "stonev5-utils";
    import { tomatoI18n } from "./tomatoI18n";
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    export function destroy() {}

    interface Props {
        dm: DestroyManager;
        key: string;
        item: FloatingDocItem;
    }

    let { dm, key, item = $bindable() }: Props = $props();

    let protyleTarget: HTMLElement = $state();
    let show = $state(true);

    onMount(() => {
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
    });

    function exitProtyle() {
        item.openOnCreate = false;
        floatingballDocList.write();
        getFloatingBallDocBtn(item);
        getFloatingBallProtyleDialog(item)?.destroyBy();
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div>
    <DialogSvelte
        hideScrollbar={true}
        bind:show
        title={item.docName}
        savePositionKey={`${key}#floatingDialog`}
    >
        {#snippet dialogInner()}
            <button
                title={tomatoI18n.解除悬浮球与文档之间的绑定}
                onclick={() => {
                    confirm(tomatoI18n.解除悬浮球与文档之间的绑定, "⚠️", () => {
                        item.openOnCreate = false;
                        arrayDeleteFromLeft($floatingballDocList, (i) => {
                            return i.docID != item.docID;
                        });
                        floatingballDocList.write();
                        getFloatingBallProtyleDialog(item)?.destroyBy();
                        getFloatingBallDocBtn(item)?.destroyBy();
                    });
                }}
                class="b3-button b3-button--outline space">⛓️‍💥</button
            >
            <button
                onclick={exitProtyle}
                class="b3-button b3-button--outline space">🏃</button
            >
            <button
                onclick={() => {
                    OpenSyFile2(getTomatoPluginInstance(), item.docID);
                    exitProtyle();
                }}
                class="b3-button b3-button--outline space">🎯</button
            >
            <div class="protyleClass" bind:this={protyleTarget}></div>
        {/snippet}
    </DialogSvelte>
</div>

<style>
    .space {
        margin-top: 10px;
    }
</style>
