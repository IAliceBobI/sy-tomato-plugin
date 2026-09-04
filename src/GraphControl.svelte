<script lang="ts">
    import { useSvelteFlow, useStore, type Node } from "@xyflow/svelte";
    import { Plugin } from "siyuan";
    import { onMount, tick } from "svelte";
    import { siyuan } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";

    const { setCenter, getNodes, fitView, getZoom } = useSvelteFlow();
    const flowStore = useStore();

    interface Props {
        plugin: Plugin;
        dock: { element: HTMLElement; data: any };
    }

    let { plugin, dock }: Props = $props();

    onMount(() => {
        plugin;
        // graphbox 期3：官方更新通道借道——relayout 的位置/style 更新走内部 store 赋值
        // （useSvelteFlow 的 updateNode 内部即 store.nodes=...；bind:nodes={$store} 对
        // writable 的 prop 同步在 runes 组件不可靠，dev 实锤 dagre 已跑而 DOM 停在初始位）
        getData().graphStore = flowStore;
        // graphbox 期1：借道 Provider 内上下文把 fitView 递给顶层 relayout（首屏视口适配，vision P1）
        // 期3 精修：fitView 完成后读 zoom——横向布局缩至 <0.25（大文档展开态钳 ~0.13）时
        // toast 提示可换形态（期2 P2 留观），60s 节流防每次 relayout 刷屏；
        // 期7 口径：已是竖排形态（vlr/vtb）不再提示
        getData().fitView = async (opts?: { padding?: number; duration?: number }) => {
            (getData() as any)._fitAt = Date.now();
            await fitView(opts);
            setTimeout(() => {
                const zoom = getZoom();
                const d = getData() as any;
                const f = d.layoutForm;
                if (zoom >= 0.25 || f === "vlr" || f === "vtb") return;
                const now = Date.now();
                if (now - (d._lastZoomTipAt ?? 0) < 60000) return;
                d._lastZoomTipAt = now;
                siyuan.pushMsg(tomatoI18n.图较大建议切换纵向.replace("%1", `${Math.round(zoom * 100)}`), 4000);
            }, 400);
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
