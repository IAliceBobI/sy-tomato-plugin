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
    import { jumpDocBottomViaSlider, readDocPosition, seedFilePosition, tailReadPositionOf, type DocReadPosition } from "./libs/ballDocToggle";
    import { debugLog } from "./libs/logUtils";
    import { tomatoI18n } from "./tomatoI18n";
    import DialogSvelte from "./libs/DialogSvelte.svelte";

    interface Props {
        dm: DestroyManager;
        key: string;
        ball: BallItem;
        docID?: string;
        /** 尾窗预取结果（fballtail □1 跳底直载）：真树序尾部 N 顶层子块 id，由
         *  docAction.execute float 分支预取传入；缺省（预取失败/空/不该跳底）→
         *  onMount 回退现行「遮眼+jumpDocBottomViaSlider」链 */
        tail?: { id: string }[];
    }

    let { dm, key, ball, docID = "", tail }: Props = $props();

    // $$dailynote 球每天现建日记：渲染用解析出的 docID（不写回 ball.action——dm 键
    // 稳定性见 getFloatingBallProtyleDialog 注释）
    const winDocID = $derived(docID || ball.action.docID);

    let protyleTarget: HTMLElement = $state();
    let show = $state(true);

    onMount(() => {
        // 跳底（fballtail □1 根治，陆杰 09-19「先空白→闪一下→才跳转到底部」）：主路=尾窗
        // 种档直载（预取尾窗经 props.tail 传入，见 openBottom/tailSeed 段——一次请求一次
        // 渲染落底，无头窗/无 goEnd/无轮询/无遮眼）；blockId 恒文档 id（fballfeedback □3
        // v2 教训：此前喂真尾块 id 实为内核 mode 0 块聚焦形态，悬浮窗只剩尾块、往上滚加
        // 载不出前文）。回退兜底=jumpDocBottomViaSlider 合成点内核滚动条「跳到底部」钮
        // goEnd 正轨（getDoc mode 4 一次落尾窗+scrollCenter 滚到尾块，往上滚动态加载
        // 前文=整篇可达）——预取失败/空才走，保留勿删。
        // luji0918 □1 修法②（记忆位置，优先于跳底开关——「上次看到哪」语义；开关关+有档
        // 也回档，自洽）：重开走内核 cb-get-rootscroll 分支——构造期读 FILEPOSITION 走
        // getDocByScroll 直载 [startId,endId] 窗口+scrollTop 直恢（官方重开恢复管线，长
        // 文档懒加载下 DOM scrollIntoView 够不到未渲染块，此为唯一正轨；尾窗直载=同一
        // 管线的「窗口=尾部+scrollTop 大值」形态）。档种入内核存储供构造同步消费、构造
        // 返回即还原（主实例官方阅读位置零污染）。$$dailynote 每天现建日记：docID≠
        // action.docID 时档属旧文档，记录与恢复都跳过、恒走尾窗种档。
        const dailyNote = !!docID && docID !== ball.action?.docID;
        const lastRead = dailyNote ? undefined : ball.action?.lastRead as DocReadPosition | undefined;
        const restore = lastRead?.startId && lastRead?.endId ? lastRead : undefined;
        // fballtail □1 跳底分支：tailSeed 有值→种 {startId=尾窗首块, endId=尾窗末块,
        // scrollTop=TAIL_SCROLL_TOP} 档直载（与 restore 共用 cb-get-rootscroll 构造
        // 分支，种档对象二选一——restore 优先）；tail 预取失败/空→tailSeed=undefined
        // →下方回退现行遮眼+slider 链
        const openBottom = !restore && floatingballDocOpenBottom.get() === true;
        const tailSeed = openBottom ? tailReadPositionOf(tail) : undefined;
        const protyleOptions: any = {
            blockId: winDocID,
            render: {
                background: false,
                title: false,
                gutter: true,
                scroll: true,
                breadcrumb: false,
                breadcrumbDocName: false,
            },
        };
        let unseed: (() => void) | undefined;
        if (restore || tailSeed) {
            protyleOptions.rootId = winDocID;
            protyleOptions.action = ["cb-get-rootscroll"];
            unseed = seedFilePosition(winDocID, restore ?? tailSeed!);
        }
        const protyle = new Protyle(
            getTomatoPluginInstance().app,
            protyleTarget,
            protyleOptions,
        );
        unseed?.();
        dm.add("protyle", () => {
            // luji0918 □1 修法②：关闭即记录。exitProtyle/toggle 关/unbind/sweep 全走
            // destroyBy，本 cb 首位执行时 DOM 未摘、scrollTop 可读；渲染未就绪=保持旧档。
            // toggle 关不经 exitProtyle，持久化写在记录处自足（不依赖调用方先 write）。
            if (!dailyNote) {
                const pos = readDocPosition(protyleTarget);
                if (pos) {
                    ball.action.lastRead = pos;
                    floatingballBallList.write();
                }
            }
            protyle.destroy();
        });
        debugLog("fball", `floatwin mount bottom=${floatingballDocOpenBottom.get()} restore=${restore ? restore.startId.slice(-6) : "-"} tail=${tailSeed ? tailSeed.endId.slice(-6) : "-"} doc=${winDocID.slice(-6)}`, "fball");
        if (openBottom) {
            if (tailSeed) {
                // 直载生效：构造已带尾窗档，此处仅打点（□3 e2e 判据=「tail-seed 直载」
                // 行在场且无 slider-jump 行）；不遮眼、不轮询——加载指示保留
                debugLog("fball", `tail-seed direct load startId=${tailSeed.startId.slice(-6)} endId=${tailSeed.endId.slice(-6)} scrollTop=${tailSeed.scrollTop}`, "fball");
            } else {
                // 回退兜底（预取失败/空文档/props 缺省）：luji0918 □1 修法①（遮眼）——
                // 头窗构造→goEnd 落底间的可见间隙=「先顶部再跳底部」两段式观感根因，
                // 跳底全程 visibility:hidden，jumpDocBottomViaSlider 任何终态经 onDone
                // 恢复显示；同步抛错兜底也恢复。
                debugLog("fball", "tail fallback: old hide+slider chain (tail prefetch miss)", "fball");
                protyleTarget.style.visibility = "hidden";
                const uncover = () => { protyleTarget.style.visibility = ""; };
                try {
                    jumpDocBottomViaSlider(protyleTarget, 15000, uncover);
                } catch {
                    uncover();
                }
            }
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
