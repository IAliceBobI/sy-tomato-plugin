<!-- 专门放到思源 dialog 内的 protyle 组件 -->
<!-- fballshort □2：壳层从裸内核 Dialog（固定 700×700、无存档无 resize——陆杰「对话框
     不记忆位置大小」）换自绘 DialogSvelte（拍板①~④）：存档四键+8 向 resize+拖动，
     存档键与 float 悬浮窗共用（docAction 侧拼装经 props 传入）；点外自动关=壳层
     clickOutsideClose prop（按压起点守卫在壳内）。onMount/onDestroy 的 protyle 逻辑不动 -->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./destroyer";
    import { Protyle } from "siyuan";
    import { getTomatoPluginInstance, siyuan } from "./utils";
    import { applyBottomPad, autocloseDialogShellProps, focusTailForTyping, seedFilePosition, tailReadPositionOf } from "./ballDocToggle";
    import { debugLog } from "./logUtils";
    import { events } from "./Events";
    import DialogSvelte from "./DialogSvelte.svelte";

    interface Props {
        dm: DestroyManager;
        docName?: string;
        docID?: string;
        /** 尾窗预取结果（fballtail □2 跳底直载，同 □1 float 窗）：真树序尾部 N 顶层
         *  子块 id，由调用方（docAction.openByDialog）在跳底开关开时预取传入；有值→
         *  onMount 种档直载（内核官方重开恢复管线 cb-get-rootscroll，一次请求一次
         *  渲染落底）；缺省（开关关/预取失败/空文档/docID 未解析）→普通头窗构造。
         *  跳底语义全由调用方经本 props 表达——共享组件不读悬浮球域设置（openBottom
         *  prop 已退役并入 tail 缺省，组件零域知识） */
        tail?: { id: string }[];
        /** 窗体存档键（fballshort □2 拍板①）：docAction 拼 `floatingDialogPositionKey(
         *  item.docID)` 传入——与 float 悬浮窗字节级共用，换打开方式位置习惯延续 */
        savePositionKey?: string;
    }

    let { dm, docName = "", docID = $bindable(""), tail, savePositionKey = "" }: Props = $props();
    // 壳尺寸 props（拍板②）：桌面=悬浮窗同款定高公式+min 420；mobile=90vw/180svw 档。
    // isMobile 会话内不变（events 单例启动时定），非响应式直取
    const shell = autocloseDialogShellProps(events.isMobile);
    let protyleTarget: HTMLElement = $state();

    onDestroy(() => {
        dm.destroyBy();
    });

    onMount(async () => {
        if (!docID) {
            const docs = await siyuan.getDocRowsByName(docName);
            docID = docs?.at(0)?.id;
        }
        if (docID) {
            // fballtail □2：跳底直载（同 □1 float 窗根治）——tail 有值→种 {startId=尾窗
            // 首块, endId=尾窗末块, scrollTop=大值 clamp 落底} 档，构造带 rootId+
            // cb-get-rootscroll 走内核 getDocByScroll 分支一次请求一次渲染直载尾窗
            // （无头窗/无轮询/无遮眼）；种档构造返回即还原（主实例官方阅读位置零污染，
            // seedFilePosition 现有模式照抄）。tail 缺省→普通头窗构造（原
            // scrollDocBottomForDoc「头窗+scrollIntoView 轮询」通道已退役——统一通道
            // 胜过特殊化；空文档本无跳底意义）。blockId 恒文档 id（fballfeedback □3
            // v2 教训：喂尾块 id=内核 mode 0 块聚焦形态，只剩尾块往上滚加载不出前文）
            const tailSeed = tailReadPositionOf(tail);
            const protyleOptions: any = {
                blockId: docID,
                render: {
                    background: false,
                    title: false,
                    gutter: true,
                    scroll: true,
                    breadcrumb: true,
                    breadcrumbDocName: false,
                },
            };
            let unseed: (() => void) | undefined;
            if (tailSeed) {
                protyleOptions.rootId = docID;
                protyleOptions.action = ["cb-get-rootscroll"];
                unseed = seedFilePosition(docID, tailSeed);
            }
            const protyle = new Protyle(
                getTomatoPluginInstance().app,
                protyleTarget,
                protyleOptions,
            );
            unseed?.();
            // fballfb □2 落底留白：跳底落位后尾行不贴视口底边（「跳底了就留白」，不加
            // 新开关）——dialog 链跳底=tailSeed 在场才发生（无回退链），同点挂标记类
            // （压制的 !important CSS 在本组件 style 段：内核 afterOnGet setPadding 会以
            // 内联覆写插件内联值）。fballshort □1 起量级跟窗体实际高走：挂类同时写
            // --fball-tail-pad 变量+ResizeObserver 跟窗 resize，还原函数接 dm=卸载即断
            // （fballshort □2 换 DialogSvelte 壳后窗体可 resize，RO 链即生效）。
            // 机制见 applyBottomPad 注释
            if (tailSeed) dm.add("tailPad", applyBottomPad(protyleTarget));
            dm.add("protyle", () => protyle.destroy());
            if (tailSeed) {
                // 直载生效打点（□3 e2e 判据=「tail-seed direct load」行在场且无
                // slider-jump/whenReady 行=直载生效）；不遮眼、不轮询——加载指示保留
                debugLog("fball", `tail-seed direct load (dialog) startId=${tailSeed.startId.slice(-6)} endId=${tailSeed.endId.slice(-6)} scrollTop=${tailSeed.scrollTop}`, "fball");
                // fballfb □14 跳底落光标（bear 09-21「随时可打字」）：同 float 窗——
                // 打开即续写语义，autoclose 型跳底体验与其一致；移动端程序 focus 不弹
                // 虚拟键盘（浏览器只对用户手势弹），静默落位无惊扰
                focusTailForTyping(protyleTarget, tailSeed.endId);
            }
        }
    });
</script>

<!-- fballshort □2 换壳：DialogSvelte 自绘浮层（grabber 标题栏+× 钮〔dm 销毁链〕+8 向
     resize 把手+拖动存档）。hideScrollbar 与 float 悬浮窗同款（protyleMount 定高填满
     dialog-content 无溢出，防亚像素溢出闪滚动条） -->
<DialogSvelte
    hideScrollbar={true}
    show={true}
    title={docName}
    savePositionKey={savePositionKey}
    {dm}
    clickOutsideClose={true}
    width={shell.width}
    height={shell.height}
    minWidth={shell.minWidth}
>
    {#snippet dialogInner()}
        <!-- fballtail □4：挂载点高度约束（同悬浮窗 fbfeat □1 病根）——无约束时 .protyle
             被尾窗内容撑到全高（96 块=4928px），末块沉在外层滚动区深处、.protyle-content
             自身不出滚动（种档 scrollTop clamp 无落点，屏内只见窗口首段=视觉"停在顶部"）；
             约束后内部滚动生效，直载落底=末块贴底可见。fballshort □2 起高度链=窗体定高
             公式（拍板②）→ dialog-content（flex:1，definite）→ 本类 100% 精确填满；用户
             resize/存档回放改窗高时每层取实高，链依然成立 -->
        <div class="protyleMount" bind:this={protyleTarget}></div>
    {/snippet}
</DialogSvelte>

<style>
    .protyleMount {
        height: 100%;
    }
    /* fballfb □2 落底留白（跳底时 onMount 挂 fball-tail-pad，见 applyBottomPad）：
       !important 压内核 afterOnGet resize→setPadding 的内联 style.padding 覆写
       （悬浮窗侧 e2e 实测内联 16px 顶掉插件内联值）。fballshort □1 量级跟窗体
       实际高走：主值=--fball-tail-pad（applyBottomPad 写入，值=窗内容区高一半，
       窗 resize 经 ResizeObserver 更新——旧公式全主视口单位，用户 resize 后窗高
       与视口脱钩、留白≥窗内容区高=跳底后视口整落留白区全空白）；fallback 保留
       旧公式（dialog 高固定 700px、body≈650px，min(40vh,325px) 落 30~40vh 档）
       =变量未写上（异常路径）时行为退现状。padding 挂滚动容器内容元素=可滚入的
       滚动区非死区；:global=内核运行时挂载 DOM（在档坑） */
    .protyleMount :global(.protyle-wysiwyg.fball-tail-pad) {
        padding-bottom: var(--fball-tail-pad, min(40vh, 325px)) !important;
    }
</style>
