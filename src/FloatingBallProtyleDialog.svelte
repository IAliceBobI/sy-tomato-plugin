<!-- 悬浮文档 float 打开方式的实现件（期1 保留，props 从 FloatingDocItem 换统一 BallItem） -->
<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { confirm, Protyle } from "siyuan";
    import { getTomatoPluginInstance, siyuan } from "./libs/utils";
    import { floatingballBallList, floatingballDocOpenBottom } from "./libs/stores";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { getFloatingBall, getFloatingBallProtyleDialog } from "./FloatingBall";
    import { unbindBall } from "./actions/docAction";
    import { scrollDocBottomForDoc } from "./libs/ballDocToggle";
    import { debugLog } from "./libs/logUtils";
    import { tomatoI18n } from "./tomatoI18n";
    import DialogSvelte from "./libs/DialogSvelte.svelte";

    interface Props {
        dm: DestroyManager;
        key: string;
        ball: BallItem;
        docID?: string;
    }

    let { dm, key, ball, docID = "" }: Props = $props();

    // $$dailynote 球每天现建日记：渲染用解析出的 docID（不写回 ball.action——dm 键
    // 稳定性见 getFloatingBallProtyleDialog 注释）
    const winDocID = $derived(docID || ball.action.docID);

    let protyleTarget: HTMLElement = $state();
    let show = $state(true);

    onMount(() => {
        const protyle = new Protyle(
            getTomatoPluginInstance().app,
            protyleTarget,
            {
                blockId: winDocID,
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
        // 滚底（fbfeat □1 落底；□13 禁聚焦拍板后转纯滚动——打开即见最新内容，
        // 续写光标由用户点一下落，定位类 action 本就不走 new Protyle 构造）
        debugLog("fball", `floatwin mount bottom=${floatingballDocOpenBottom.get()} docID=${winDocID}`, "fball");
        if (floatingballDocOpenBottom.get() === true) {
            void scrollDocBottomForDoc(protyleTarget, winDocID, (id) => siyuan.getDocLastID(id));
        }
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
                    OpenSyFile2(getTomatoPluginInstance(), winDocID);
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
    /* fbfeat □1：长文档悬浮窗高度约束——无约束时 .protyleClass 被内容撑到全高，protyle
       内部滚动层（.protyle-content）不出滚动条，超出视口部分不可达（落底也滚不动）；
       约束后内部滚动生效，窗高随视口（220px≈标题栏+按钮行+留白）；max 下限防小视口
       （<220px 时 calc 为负=声明无效，静默退回撑全高存量行为） */
    .protyleClass {
        height: max(calc(100vh - 220px), 40vh);
    }
</style>
