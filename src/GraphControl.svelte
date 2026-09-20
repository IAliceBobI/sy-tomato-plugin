<script lang="ts">
    import { useSvelteFlow, useStore, type Node } from "@xyflow/svelte";
    import { Plugin } from "siyuan";
    import { onMount, onDestroy, tick } from "svelte";
    // graphrelayout □2：siyuan/tomatoI18n import 随「zoom 过小提示切纵向」toast 退役移除

    // graphrelayout □2：getZoom 随「zoom 过小提示切纵向」toast 退役一并移除
    const { setCenter, getNodes, fitView, setViewport, getViewport } = useSvelteFlow();
    const flowStore = useStore();

    interface Props {
        plugin: Plugin;
        dock: { element: HTMLElement; data: any };
    }

    let { plugin, dock }: Props = $props();

    // treemap □3 review P1-3：treemap 档本组件卸载（GraphBox 按 mode 条件挂载）——
    // 置空 dock.data 注册防 locateNode 走 stale SvelteFlow 闭包静默空转
    onDestroy(() => {
        const d = getData();
        if (d) {
            d.graphStore = null;
            d.fitView = null;
            d.setViewport = null;
            d.locateID = null;
        }
    });

    onMount(() => {
        plugin;
        // graphbox 期3：官方更新通道借道——relayout 的位置/style 更新走内部 store 赋值
        // （useSvelteFlow 的 updateNode 内部即 store.nodes=...；bind:nodes={$store} 对
        // writable 的 prop 同步在 runes 组件不可靠，dev 实锤 dagre 已跑而 DOM 停在初始位）
        getData().graphStore = flowStore;
        // graphmind □2 P1：setViewport 借道（fitReadable 的根锚定分支——fitView 可读下限）
        getData().setViewport = setViewport;
        // graphrelayout □1：getViewport 借道（交互链视口钉——capturePin 交互前快照）
        getData().getViewport = getViewport;
        // graphbox 期1：借道 Provider 内上下文把 fitView 递给顶层 relayout（首屏视口适配，vision P1）
        // graphmind □7fix：opts 放开 min/maxZoom 透传（原手写窄类型把 @xyflow/system
        // FitViewOptionsBase 的两键挡在类型层——fitReadable 真 fit 需显式传参）
        // graphrelayout □2：fitView 后的「zoom 过小建议切纵向」toast 整族退役（期3 精修引入，
        // 期7 收窄为非竖排态提示）——四态退役恒 LR 后无形态可切，提示失去对象
        getData().fitView = async (opts?: { padding?: number; duration?: number; minZoom?: number; maxZoom?: number }) => {
            (getData() as any)._fitAt = Date.now();
            await fitView(opts);
        };
        // 期4：expandTo(折叠祖先链)→绝对坐标 setCenter(zoom 1.2)→主色描边脉冲两轮；
        // 返回是否命中（locateNode 据此 toast 找不到的原因）。
        // 期7：目标块并进 ¶ 大节点（链成员无图上节点）→ 重定向链头 ¶ 节点高亮脉冲
        getData().locateID = async (id: string): Promise<boolean> => {
            if (!id) return false;
            const target = getData().paraRedirectOf?.(id) ?? id;
            // 期4 P1：定位脉冲窗口内抑制自动刷新——expandTo 写 custom-graph-collapsed 会让
            // updated 变化，ws/轮询回流 changeDoc→relayout 重建节点 DOM 打断脉冲+fitView 打回 setCenter
            (getData() as any).suppressAutoRefreshUntil = Date.now() + 2200;
            const expanded = await getData().expandTo?.(target);
            if (expanded) {
                // relayout 尾部的 fitView(200ms) 是 fire-and-forget——不等它落地就 setCenter
                // 会两动画交错致 setCenter 失效（dev 实锤 zoom 恒停 fitView 值）；真展开时等一拍
                await new Promise(r => setTimeout(r, 260));
            }
            await tick();
            const ns = getNodes();
            const n = ns.find(m => m.id === target);
            if (!n) return false;
            // subflow 子节点 position 是容器相对坐标：沿 parentId 链累加绝对坐标
            const byId = new Map(ns.map(m => [m.id, m]));
            let x = n.position.x, y = n.position.y, cur: Node | undefined = n;
            while (cur?.parentId) {
                cur = byId.get(cur.parentId);
                if (!cur) break;
                x += cur.position.x;
                y += cur.position.y;
            }
            const w = n.measured?.width ?? 172, h = n.measured?.height ?? 36;
            setCenter(x + w / 2, y + h / 2, { zoom: 1.2, duration: 300 });
            // 定位=显式视图意图：关闭「fitView 后 5s 内容器尺寸变化重跑 fitView」窗口
            // （补刷 relayout 引起尺寸变化→$effect 重跑 fitView 会打回 setCenter，0.139 竞态根因）
            (getData() as any)._fitAt = 0;
            document.querySelectorAll(`div[data-id="${target}"].svelte-flow__node`).forEach((e: HTMLElement) => {
                e.classList.remove("tomato-graph-pulse");
                void e.offsetWidth; // reflow 重启动画
                e.classList.add("tomato-graph-pulse");
                setTimeout(() => e.classList.remove("tomato-graph-pulse"), 1600);
            });
            return true;
        };
    });

    function getData() {
        return dock.data as unknown as GraphDockData<any>;
    }
</script>
