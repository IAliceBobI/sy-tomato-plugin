<!-- 悬浮文档 float 打开方式的实现件（期1 保留，props 从 FloatingDocItem 换统一 BallItem） -->
<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { confirm, Protyle } from "siyuan";
    import { getTomatoPluginInstance } from "./libs/utils";
    import { floatingballBallList } from "./libs/stores";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { getFloatingBall, getFloatingBallProtyleDialog } from "./FloatingBall";
    import { unbindBall } from "./actions/docAction";
    import { tomatoI18n } from "./tomatoI18n";
    import DialogSvelte from "./libs/DialogSvelte.svelte";

    interface Props {
        dm: DestroyManager;
        key: string;
        ball: BallItem;
    }

    let { dm, key, ball }: Props = $props();

    let protyleTarget: HTMLElement = $state();
    let show = $state(true);

    onMount(() => {
        const protyle = new Protyle(
            getTomatoPluginInstance().app,
            protyleTarget,
            {
                blockId: ball.action.docID,
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
        ball.action.openOnCreate = false;
        floatingballBallList.write();
        getFloatingBall(ball);
        getFloatingBallProtyleDialog(ball)?.destroyBy();
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div>
    <DialogSvelte
        hideScrollbar={true}
        bind:show
        title={ball.action.docName}
        savePositionKey={`${key}#floatingDialog`}
    >
        {#snippet dialogInner()}
            <button
                title={tomatoI18n.解除悬浮球与文档之间的绑定}
                onclick={() => {
                    confirm(tomatoI18n.解除悬浮球与文档之间的绑定, "⚠️", () => {
                        unbindBall(ball);
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
                    OpenSyFile2(getTomatoPluginInstance(), ball.action.docID);
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
