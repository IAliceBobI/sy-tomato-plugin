<!-- 悬浮文档 float 打开方式的实现件（期1 保留，props 从 FloatingDocItem 换统一 BallItem） -->
<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { confirm, Protyle } from "siyuan";
    import { getTomatoPluginInstance, icon } from "./libs/utils";
    import { floatingballBallList, floatingballDocOpenBottom } from "./libs/stores";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { getFloatingBall, getFloatingBallProtyleDialog } from "./FloatingBall";
    import { unbindBall } from "./actions/docAction";
    import { jumpDocBottomViaSlider } from "./libs/ballDocToggle";
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
        // 跳底（fballfeedback □3 v2，bear 09-17 反馈「只见最后一个块」）：blockId 恒文档
        // id=整篇头窗构造——此前喂真尾块 id 实为内核 mode 0 块聚焦形态（悬浮窗只剩尾块、
        // 往上滚加载不出前文，尾窗通道设想不成立）；跳底改 jumpDocBottomViaSlider：合成
        // 点击内核滚动条「跳到底部」钮=goEnd 正轨（getDoc mode 4 一次落尾窗+scrollCenter
        // 滚到尾块，往上滚动态加载前文=整篇可达）。开关关→头窗从头（老行为）。
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
        debugLog("fball", `floatwin mount bottom=${floatingballDocOpenBottom.get()} doc=${winDocID.slice(-6)}`, "fball");
        if (floatingballDocOpenBottom.get() === true) {
            jumpDocBottomViaSlider(protyleTarget);
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
            <!-- fballfeedback □4a：按钮行钉窗顶——原先在滚动流内，往下读长文档时跟着内容
                 滚出顶边被裁（陆杰反馈「连着按钮也往上滑动，所以会被挡住」） -->
            <div class="win-actions">
                <!-- emoji 换 sprite 图标钮（09-17 bear：emoji 丑）——28px 方形热区与窗体标题
                     钮同构；iconLinkOff=断链解除/iconDown=收起（DialogSvelte 收起钮同款）/
                     iconFocus=定位跳原文，均活内核 sprite 实有（iconoff 探针点名） -->
                <button
                    aria-label={tomatoI18n.解除悬浮球与文档之间的绑定}
                    title={tomatoI18n.解除悬浮球与文档之间的绑定}
                    onclick={() => {
                        confirm(tomatoI18n.解除悬浮球与文档之间的绑定, "⚠️", () => {
                            unbindBall(ball);
                        });
                    }}
                    class="win-btn">{@html icon("iconLinkOff", 15)}</button
                >
                <button
                    aria-label="退出悬浮窗"
                    title="退出悬浮窗"
                    onclick={exitProtyle}
                    class="win-btn">{@html icon("iconDown", 15)}</button
                >
                <button
                    aria-label="定位到原文档"
                    title="定位到原文档"
                    onclick={() => {
                        OpenSyFile2(getTomatoPluginInstance(), winDocID);
                        exitProtyle();
                    }}
                    class="win-btn">{@html icon("iconFocus", 15)}</button
                >
            </div>
            <div class="protyleClass" bind:this={protyleTarget}></div>
        {/snippet}
    </DialogSvelte>
</div>

<style>
    .win-actions {
        /* BlockEditor sticky-header 同款：-8px 补偿 DialogSvelte dialog-content
           padding-top，滚动时行贴窗顶不露缝；表面色遮滚动内容透字 */
        position: sticky;
        top: -8px;
        z-index: 5;
        background: var(--b3-theme-background);
        margin-top: 10px;
    }
    .win-btn {
        /* 28px 方形图标钮：与 DialogSvelte 标题栏 close-button 同构（b3-button 文字钮
           换图标后内边距违和，直接用同款热区） */
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--b3-theme-on-background);
        width: 28px;
        height: 28px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: background-color 0.2s;
    }
    .win-btn:hover {
        background-color: var(--b3-list-hover, rgba(0, 0, 0, 0.075));
    }
    /* fbfeat □1：长文档悬浮窗高度约束——无约束时 .protyleClass 被内容撑到全高，protyle
       内部滚动层（.protyle-content）不出滚动条，超出视口部分不可达（落底也滚不动）；
       约束后内部滚动生效，窗高随视口（220px≈标题栏+按钮行+留白）；max 下限防小视口
       （<220px 时 calc 为负=声明无效，静默退回撑全高存量行为） */
    .protyleClass {
        height: max(calc(100vh - 220px), 40vh);
    }
</style>
