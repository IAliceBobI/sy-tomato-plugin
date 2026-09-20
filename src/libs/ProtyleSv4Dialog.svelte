<!-- 专门放到思源 dialog 内的 protyle 组件 -->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./destroyer";
    import { Protyle } from "siyuan";
    import { getTomatoPluginInstance, siyuan } from "./utils";
    import { seedFilePosition, tailReadPositionOf } from "./ballDocToggle";
    import { debugLog } from "./logUtils";

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
    }

    let { dm, docName = "", docID = $bindable(""), tail }: Props = $props();
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
            dm.add("protyle", () => protyle.destroy());
            if (tailSeed) {
                // 直载生效打点（□3 e2e 判据=「tail-seed direct load」行在场且无
                // slider-jump/whenReady 行=直载生效）；不遮眼、不轮询——加载指示保留
                debugLog("fball", `tail-seed direct load (dialog) startId=${tailSeed.startId.slice(-6)} endId=${tailSeed.endId.slice(-6)} scrollTop=${tailSeed.scrollTop}`, "fball");
            }
        }
    });
</script>

<!-- fballtail □4：挂载点高度约束（同悬浮窗 fbfeat □1 病根）——无约束时 .protyle
     被尾窗内容撑到全高（96 块=4928px），末块沉在 .b3-dialog__body 滚动区深处、
     .protyle-content 自身不出滚动（种档 scrollTop clamp 无落点，屏内只见窗口
     首段=视觉"停在顶部"）；约束后内部滚动生效，直载落底=末块贴底可见。
     dialog 高度固定（openByDialog 700px），body 高 definite，100% 精确填满 -->
<div class="protyleMount" bind:this={protyleTarget}></div>

<style>
    .protyleMount {
        height: 100%;
    }
</style>
