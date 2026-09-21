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
    import { applyBottomPad, focusTailForTyping, jumpDocBottomViaSlider, readDocPosition, seedFilePosition, tailReadPositionOf, type DocReadPosition } from "./libs/ballDocToggle";
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
    let loadingEl: HTMLElement = $state();
    let show = $state(true);

    onMount(() => {
        // 跳底（fballtail □1 根治，陆杰 09-19「先空白→闪一下→才跳转到底部」）：主路=尾窗
        // 种档直载（预取尾窗经 props.tail 传入，见 openBottom/tailSeed 段——一次请求一次
        // 渲染落底，无头窗/无 goEnd/无轮询/无遮眼）；blockId 恒文档 id（fballfeedback □3
        // v2 教训：此前喂真尾块 id 实为内核 mode 0 块聚焦形态，悬浮窗只剩尾块、往上滚加
        // 载不出前文）。回退兜底=jumpDocBottomViaSlider 合成点内核滚动条「跳到底部」钮
        // goEnd 正轨（getDoc mode 4 一次落尾窗+scrollCenter 滚到尾块，往上滚动态加载
        // 前文=整篇可达）——预取失败/空才走，保留勿删。
        // luji0918 □1 修法②（记忆位置——开关关时的「上次看到哪」语义；开关关+有档
        // 也回档，自洽）：重开走内核 cb-get-rootscroll 分支——构造期读 FILEPOSITION 走
        // getDocByScroll 直载 [startId,endId] 窗口+scrollTop 直恢（官方重开恢复管线，长
        // 文档懒加载下 DOM scrollIntoView 够不到未渲染块，此为唯一正轨；尾窗直载=同一
        // 管线的「窗口=尾部+scrollTop 大值」形态）。档种入内核存储供构造同步消费、构造
        // 返回即还原（主实例官方阅读位置零污染）。$$dailynote 每天现建日记：docID≠
        // action.docID 时档属旧文档，记录与恢复都跳过、恒走尾窗种档。
        const dailyNote = !!docID && docID !== ball.action?.docID;
        const lastRead = dailyNote ? undefined : ball.action?.lastRead as DocReadPosition | undefined;
        const restore = lastRead?.startId && lastRead?.endId ? lastRead : undefined;
        // fballfb □2（bear 09-21 拍板）：开关开=必跳底——不再被 restore 档抢占（此前
        // `!restore && 开关` 球存过 lastRead 就恢复、开关开了也不跳，与 tab 链行为分裂，
        // 陆杰 08:15 反馈+bear 实锤）；开关关=维持现行 restore 优先语义（有档回档）。
        // 判定与 docAction 预取侧同口径（两处错位=白跑请求或漏跳底）
        const openBottom = floatingballDocOpenBottom.get() === true;
        // fballtail □1 跳底分支：tailSeed 有值→种 {startId=尾窗首块, endId=尾窗末块,
        // scrollTop=TAIL_SCROLL_TOP} 档直载（与 restore 共用 cb-get-rootscroll 构造
        // 分支，种档对象二选一——fballfb □2 起跳底优先于 restore）；tail 预取失败/空→
        // tailSeed=undefined→下方回退现行遮眼+slider 链
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
        const seed = tailSeed ?? restore;
        if (seed) {
            protyleOptions.rootId = winDocID;
            protyleOptions.action = ["cb-get-rootscroll"];
            unseed = seedFilePosition(winDocID, seed);
        }
        const protyle = new Protyle(
            getTomatoPluginInstance().app,
            protyleTarget,
            protyleOptions,
        );
        unseed?.();
        // fballfb □2 落底留白：跳底落位后尾行不贴视口底边（「跳底了就留白」，不加新
        // 开关）——直载与回退 slider 链都跳底，故 openBottom 开即挂标记类（压制的
        // !important CSS 在本组件 style 段：内核 afterOnGet setPadding 会以内联覆写
        // 插件内联值，挂类+样式表 !important 才压得住）。机制见 applyBottomPad 注释
        if (openBottom) applyBottomPad(protyleTarget);
        // fballfb □6 白屏一闪修法：protyle 空窗期占位（非遮眼）。根因=Dialog 上屏→
        // protyle 首块渲染之间的间隙无任何占用者——内核自家 loading 要 300ms 才上
        // （快机渲染 60ms 完成则永不出现；回退遮眼链更把已渲染内容藏到 jump 收敛），
        // 亮色主题下空窗=纯白一片=陆杰「快捷键打开窗口一瞬间白屏」（本机亮色+350ms
        // 节流复现：纯空窗 ~300ms 实测）。占位=透明底小环，内容真可见（首块在场且
        // 容器未 visibility:hidden——回退遮眼链）或内核 loading 已接管（≥300ms，避免
        // 双 spinner 叠画）即撤；遮眼期自动复现、uncover 即再撤（style 变更走 observer）。
        // fail-safe 双保险：底色透明+pointer-events:none——谓词漏撤最坏=一枚小环浮在
        // 内容上不挡读写；20s 死态兜底撤环防永转。直载链快路径占位至多存在 fetch
        // 往返期（遮的是本来就空的空区，内容一到同批撤）——非 fballtail「不遮眼」
        // 注释所指的遮眼 loading，语义不回退。
        const setLoading = (on: boolean) => loadingEl?.classList.toggle("fn__none", !on);
        const contentVisible = () =>
            !!protyleTarget.querySelector(".protyle-wysiwyg [data-node-id]") && protyleTarget.style.visibility !== "hidden";
        const kernelLoading = () => !!protyleTarget.querySelector(".fn__loading");
        const probeLoading = () => setLoading(!(contentVisible() || kernelLoading()));
        probeLoading();
        const loadingMo = new MutationObserver(probeLoading);
        loadingMo.observe(protyleTarget, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
        dm.add("protyleLoading", () => loadingMo.disconnect());
        setTimeout(() => { loadingMo.disconnect(); setLoading(false); }, 20000);
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
                // fballfb □14 跳底落光标（bear 09-21「随时可打字」）：打开即续写，与 tab
                // 通道 focusIDOf 豁免同语义——new Protyle 不消费定位 action，DOM 自实现
                // 轮询（细节见 focusTailForTyping 注释）；expectedTailId=尾窗末块（直载
                // 链渲染末块即真尾）
                focusTailForTyping(protyleTarget, tailSeed.endId);
            } else {
                // 回退兜底（预取失败/空文档/props 缺省）：luji0918 □1 修法①（遮眼）——
                // 头窗构造→goEnd 落底间的可见间隙=「先顶部再跳底部」两段式观感根因，
                // 跳底全程 visibility:hidden，jumpDocBottomViaSlider 任何终态经 onDone
                // 恢复显示；同步抛错兜底也恢复。
                debugLog("fball", "tail fallback: old hide+slider chain (tail prefetch miss)", "fball");
                protyleTarget.style.visibility = "hidden";
                const uncover = () => { protyleTarget.style.visibility = ""; };
                try {
                    // fballfb □14：滚底收敛后才落光标（遮眼期 visibility:hidden 焦点/
                    // 光标放不住）；abort/TIMEOUT 不放——未到底时渲染末块非真尾，光标
                    // 钉中段=语义错位，优雅降级=点尾块原生落光标
                    jumpDocBottomViaSlider(protyleTarget, 15000, (why) => {
                        uncover();
                        if (why === "settled") focusTailForTyping(protyleTarget);
                    });
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
            <div class="protyle-wrap">
                <div class="protyleClass" bind:this={protyleTarget}></div>
                <!-- fballfb □6：空窗期占位环（透明底小 spinner）——构造期 fetch 在途时
                     窗内有活干而非纯白一片；真内容可见/内核 loading 接管即撤（onMount
                     probeLoading 谓词驱动），细节见 script 注释 -->
                <div class="protyle-loading" bind:this={loadingEl}><div class="protyle-loading-ring"></div></div>
            </div>
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
    .protyle-wrap {
        position: relative;
    }
    /* fballfb □6 空窗期占位：absolute 盖的是「本来为空」的 protyle 区，透明底+不收
       指针=fail-safe（谓词漏撤最坏一枚小环浮于内容，不挡读写不挡滚）；主题变量带
       fallback（「不存在的 b3 变量+var() 无 fallback=整条声明静默失效」在档坑） */
    .protyle-loading {
        position: absolute;
        inset: 0;
        z-index: 4;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    }
    .protyle-loading-ring {
        width: 22px;
        height: 22px;
        box-sizing: border-box;
        border-radius: 50%;
        border: 2px solid var(--b3-border-color, rgba(128, 128, 128, 0.45));
        border-top-color: var(--b3-theme-primary, #3575f0);
        animation: fball-loading-spin 0.8s linear infinite;
    }
    @keyframes fball-loading-spin {
        to {
            transform: rotate(360deg);
        }
    }
    /* fballfb □2 落底留白（跳底时 onMount 挂 fball-tail-pad，见 applyBottomPad）：
       量级=容器高一半（内核打字机 getPadding 同源语义），公式与上方 .protyleClass
       高度式同构（max 两支各取半）；!important 压内核 afterOnGet resize→setPadding
       的内联 style.padding 覆写（e2e 实测内联 16px 顶掉插件内联值）。padding 挂滚动
       容器内容元素=可滚入的滚动区非死区；:global=内核运行时挂载 DOM（在档坑） */
    .protyleClass :global(.protyle-wysiwyg.fball-tail-pad) {
        padding-bottom: max(calc((100vh - 220px) / 2), 20vh) !important;
    }
</style>
