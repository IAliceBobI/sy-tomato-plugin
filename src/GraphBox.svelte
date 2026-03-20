<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import {
        SvelteFlow,
        MiniMap,
        SvelteFlowProvider,
        Controls,
        Background,
        type Edge,
        type Node,
        type Connection,
        type ColorMode,
        Position,
    } from "@xyflow/svelte";
    import "@xyflow/svelte/dist/style.css";
    import { Plugin, type IProtyle } from "siyuan";
    import { getData } from "./GraphBox";
    import { newID } from "stonev5-utils/lib/id";
    import {
        getBlockDiv,
        linkTwoElements,
        pmapNullVO,
        removeRefs,
        siyuan,
        Siyuan,
        sleep,
    } from "./libs/utils";
    import dagre from "@dagrejs/dagre";
    import GraphControl from "./GraphControl.svelte";
    import GraphMenu from "./GraphMenu.svelte";
    import EdgeWithLabel from "./EdgeWithLabel.svelte";
    import { BlockTypeNoContent } from "./libs/gconst";
    import {
        graphClick2Locate,
        graphHideStructEdges,
        graphMaxAllBlocks,
        graphMaxPBlocks,
    } from "./libs/stores";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { verifyKeyTomato } from "./libs/user";
    import { events } from "./libs/Events";

    interface ProposType {
        plugin: Plugin;
        dock: { element: HTMLElement; data: any };
        landscapeSwitchBtnID: string;
    }
    let { plugin, dock, landscapeSwitchBtnID }: ProposType = $props();
    let colorMode: ColorMode = $state("system");
    let canvas: HTMLElement;
    const nodes = writable<Node[]>([]);
    const edges = writable<Edge[]>([]);
    const snapGrid: [number, number] = [25, 25];
    const nodeWidth = 172;
    const nodeHeight = 36;
    let canvasHeight: number = $state();
    let canvasWidth: number = $state();
    let menuOpt: NodeMenu<Node> = $state();
    let lastDocID = "";
    let stop = false;
    let isVertical = false;
    const edgeTypes = { labeledEdge: EdgeWithLabel };
    export function destroy() {}

    // https://svelteflow.dev/examples/nodes/easy-connect
    onMount(() => {
        data().setCanvasSize = () => {
            canvas.style.width = `${dock.element.clientWidth}px`;
            canvas.style.height = `${dock.element.clientHeight}px`;
            stop =
                dock.element.clientWidth < 10 || dock.element.clientHeight < 10;
        };
        data().changeDoc = changeDoc;

        if (landscapeSwitchBtnID) {
            (async () => {
                let btn: HTMLButtonElement;
                while (!btn) {
                    btn = document.getElementById(
                        landscapeSwitchBtnID,
                    ) as HTMLButtonElement;
                    await sleep(1);
                }
                btn.addEventListener("click", async () => {
                    isVertical = !isVertical;
                    if (lastDocID) {
                        siyuan.setBlockAttrs(lastDocID, {
                            "custom-graph-isVertical": String(isVertical),
                        });
                    }
                    await relayout();
                });
            })();
        } else {
            (async () => {
                const docID = dock?.data?.docID;
                docID;
                const blockID = dock?.data?.blockID;
                data().setCanvasSize();
                await changeDoc(events?.protyle?.protyle);
                if (blockID) {
                    data().locateID(blockID);
                }
            })();
        }
    });

    async function changeDoc(protyle: IProtyle) {
        await navigator.locks.request(
            "tomato-graph-box-lock2024-11-4 20:09:58",
            { ifAvailable: true },
            async (lock) => {
                if (lock && protyle) {
                    await _changeDoc_(protyle);
                    await sleep(1000);
                }
            },
        );
    }

    async function _changeDoc_(protyle: IProtyle) {
        if (stop) return;
        const docName = protyle?.title?.editElement?.textContent;
        if (!docName) return;
        if (Siyuan.config.appearance.modeOS) {
            colorMode = "system";
        } else if (Siyuan.config.appearance.mode == 0) {
            colorMode = "light";
        } else {
            colorMode = "dark";
        }
        const docID = protyle.block.rootID;
        const taskLayoutDirection = getLayoutDirection(docID);

        // console.time("getData");
        const { rows, links } = await getData(
            docID,
            docName,
            graphMaxPBlocks.get(),
            graphMaxAllBlocks.get(),
        );
        // console.timeEnd("getData");
        $nodes.splice(0, $nodes.length);
        $edges.splice(0, $edges.length);
        rows.forEach((row, idx) => {
            if (row.type === "h")
                row.content = `${"#".repeat(parseInt(row.subtype[1]))} ${row.content}`;

            if (row.root_id === docID) row.docName = "";

            let label: string;
            if (BlockTypeNoContent.includes(row.type)) {
                label = `[${row.type}]`.toUpperCase();
            } else if (["c", "m", "t"].includes(row.type)) {
                label = `[${row.type}] ${row.content}`;
            } else if (row.type === "d") {
                label = "📄" + row.content;
            } else {
                if (row.docName == row.content) {
                    label = "📄" + row.content;
                } else {
                    let docName = row.docName;
                    if (docName) docName = `《${docName}》`;
                    label = (docName ?? "") + row.content;
                }
                label = label.slice(0, 30);
            }
            $nodes.push({
                id: row.id,
                data: { label },
                position: { x: 0, y: idx * 100 },
            });
        });
        const set = new Set<string>();
        links.forEach((link) => {
            if (graphHideStructEdges.get() && !link.isRef) return;
            const id = link.block_id + "-" + link.def_block_id;
            if (set.has(id)) return;
            set.add(id);
            addEdge(link);
        });
        spreadEdgeLabels($edges);
        await taskLayoutDirection;
        // 先设置 lastDocID，这样 relayout 才能正确加载保存的位置
        const isNewDoc = docID != lastDocID;
        if (isNewDoc) {
            lastDocID = docID;
        }
        await relayout();
        if (isNewDoc && data()?.locateID) {
            data()?.locateID($nodes.at(0)?.id);
        }
    }

    async function getLayoutDirection(docID: string) {
        if (docID != lastDocID) {
            const attr = await siyuan.getBlockAttrs(docID);
            if (attr["custom-graph-isVertical"] !== "true") {
                isVertical = false;
            } else {
                isVertical = true;
            }
        }
    }

    // 从文档属性读取已保存的位置
    async function loadNodePositions(docID: string): Promise<Record<string, { x: number; y: number }>> {
        const attr = await siyuan.getBlockAttrs(docID);
        const posStr = attr["custom-graph-node-positions"];
        if (posStr) {
            try {
                return JSON.parse(posStr);
            } catch (e) {
                console.warn("[GraphBox] Failed to parse positions:", e);
            }
        }
        return {};
    }

    // 保存节点位置到文档属性
    async function saveNodePositions(docID: string, nodes: Node[]) {
        const positions: Record<string, { x: number; y: number }> = {};
        nodes.forEach(node => {
            if (node.data?.isFixed) {
                positions[node.id] = { x: node.position.x, y: node.position.y };
            }
        });
        await siyuan.setBlockAttrs(docID, {
            "custom-graph-node-positions": JSON.stringify(positions)
        });
    }

    // 节点拖拽结束事件处理
    async function onNodeDragStop({ targetNode }: { targetNode: Node }) {
        // 标记节点为手动固定
        const n = $nodes.find(n => n.id === targetNode.id);
        if (n) {
            n.data = { ...n.data, isFixed: true };
        }
        // 保存位置
        if (lastDocID) {
            await saveNodePositions(lastDocID, $nodes);
        }
    }

    function addEdge(link: Ref) {
        const id = link.block_id + "-" + link.def_block_id;
        let label = link.content?.trim() ?? "";
        if (label === "*") label = "";
        $edges.push({
            id,
            source: link.block_id,
            target: link.def_block_id,
            label,
            type: label ? "labeledEdge" : undefined,
        });
    }

    function spreadEdgeLabels(edges: Edge[]) {
        const srcIdx = new Map<string, number>();
        for (const e of edges) {
            if (!e.label) continue;
            const idx = srcIdx.get(e.source) ?? 0;
            srcIdx.set(e.source, idx + 1);
            // Labels stay near source (t=0.1, 0.3, 0.5...).
            // Edges from different sources are spatially separated even when paths cross.
            (e as any).data = { ...((e as any).data ?? {}), labelT: 0.1 + idx * 0.2 };
        }
    }

    async function relayout() {
        const savedPositions = lastDocID ? await loadNodePositions(lastDocID) : {};
        getLayoutedElements($nodes, $edges, isVertical, savedPositions);
        $nodes = $nodes;
        $edges = $edges;
    }

    // 检测两个节点是否重叠
    function isOverlapping(
        pos1: { x: number; y: number },
        pos2: { x: number; y: number },
        width: number,
        height: number,
        padding: number
    ): boolean {
        return !(
            pos1.x + width + padding < pos2.x ||
            pos1.x > pos2.x + width + padding ||
            pos1.y + height + padding < pos2.y ||
            pos1.y > pos2.y + height + padding
        );
    }

    function getLayoutedElements(
        nodes: Node[],
        edges: Edge[],
        isVertical: boolean,
        savedPositions: Record<string, { x: number; y: number }> = {},
    ) {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        if (isVertical) {
            dagreGraph.setGraph({ rankdir: "TB" });
        } else {
            dagreGraph.setGraph({ rankdir: "LR" });
        }
        const nodeMap = new Map(nodes.map((n) => [n.id, n]));

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, {
                width: node.measured?.width ?? nodeWidth,
                height: node.measured?.height ?? nodeHeight,
            });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph, { ranker: "network-simplex" });
        // dagre.layout(dagreGraph, { ranker: "tight-tree" });
        // dagre.layout(dagreGraph, { ranker: "longest-path" });

        nodes.forEach((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            const dagrePos = {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            };

            // 如果有保存的位置，使用保存的位置，否则用 dagre 计算的位置
            if (savedPositions[node.id]) {
                node.position = savedPositions[node.id];
                node.data = { ...node.data, isFixed: true };
            } else {
                node.position = dagrePos;
            }

            if (isVertical) {
                node.targetPosition = Position.Top;
                node.sourcePosition = Position.Bottom;
            } else {
                node.targetPosition = Position.Left;
                node.sourcePosition = Position.Right;
            }
        });

        // 碰撞检测：新节点避免与固定节点重叠
        const fixedNodes = nodes.filter(n => savedPositions[n.id]);
        const newNodes = nodes.filter(n => !savedPositions[n.id]);
        const padding = 20; // 节点间距

        for (const newNode of newNodes) {
            let hasOverlap = true;
            let attempts = 0;
            const maxAttempts = 100;

            while (hasOverlap && attempts < maxAttempts) {
                hasOverlap = false;
                for (const fixedNode of fixedNodes) {
                    if (isOverlapping(newNode.position, fixedNode.position, nodeWidth, nodeHeight, padding)) {
                        hasOverlap = true;
                        // 向布局方向偏移
                        if (isVertical) {
                            newNode.position.y += nodeHeight + padding;
                        } else {
                            newNode.position.x += nodeWidth + padding;
                        }
                        break;
                    }
                }
                attempts++;
            }
        }
        // 回边处理：不交换 source/target，直接标记 isBackEdge，弧线从右边出接左边入
        edges.forEach((edge) => {
            const s = nodeMap.get(edge.source);
            const t = nodeMap.get(edge.target);
            if (s && t) {
                const isBackEdge = isVertical
                    ? s.position.y > t.position.y
                    : s.position.x > t.position.x;
                if (isBackEdge) {
                    const oldData: any = (edge as any).data ?? {};
                    (edge as any).data = {
                        ...oldData,
                        isBackEdge: true,
                        backEdgeDir: isVertical ? "left" : "down",
                    };
                    edge.type = "labeledEdge";
                }
            }
        });
        return { nodes, edges };
    }

    function data() {
        return dock.data as unknown as GraphDockData<any>;
    }

    function handleContextMenu({ event, node }) {
        menuOpt = null;
        event.preventDefault();
        menuOpt = {
            node,
            x: event.clientX,
            y: event.clientY,
            canvasHeight,
            canvasWidth,
        };
    }

    function handlePaneClick() {
        menuOpt = null;
    }

    async function ondelete({
        nodes,
        edges,
    }: {
        nodes: Node[];
        edges: Edge[];
    }) {
        for (const edge of edges) {
            await siyuan
                .getBlockDOM(edge.source)
                .then(({ dom }) => removeRefs(dom, edge.target, false));
            await siyuan
                .getBlockDOM(edge.target)
                .then(({ dom }) => removeRefs(dom, edge.source, false));
        }
        await siyuan.deleteBlocks(nodes.map((n) => n.id));
    }

    async function onconnect(conn: Connection) {
        const id1 = conn.source;
        const id2 = conn.target;
        if (id1 && id2) {
            const [div1, div2] = await pmapNullVO([id1, id2], getBlockDiv);
            await linkTwoElements(div1?.div, div2?.div);
            await relayout();
        }
    }
    async function nodeclick({ node, event }) {
        const pointer = event as PointerEvent;
        if (pointer.altKey) {
            OpenSyFile2(plugin, node.id);
        } else if (graphClick2Locate.get()) {
            if (await verifyKeyTomato()) {
                OpenSyFile2(plugin, node.id);
            }
        }
    }
</script>

<div
    bind:this={canvas}
    class="container"
    bind:clientHeight={canvasHeight}
    bind:clientWidth={canvasWidth}
>
    <SvelteFlowProvider>
        <SvelteFlow
            bind:nodes={$nodes}
            bind:edges={$edges}
            id={newID()}
            {colorMode}
            {snapGrid}
            {edgeTypes}
            fitView
            {ondelete}
            {onconnect}
            onnodecontextmenu={handleContextMenu}
            onpaneclick={handlePaneClick}
            onedgeclick={(event) => {
                event;
            }}
            onnodeclick={nodeclick}
            onnodedragstop={onNodeDragStop}
        >
            <Controls showLock={true} />
            <Background />
            <MiniMap />
            {#if menuOpt && menuOpt.node}
                <GraphMenu
                    onClick={handlePaneClick}
                    menuOpt={writable(menuOpt)}
                    {plugin}
                    {dock}
                />
            {/if}
        </SvelteFlow>
        <GraphControl {dock} {plugin} />
    </SvelteFlowProvider>
</div>

<style>
    .container {
        width: 800px;
        height: 800px;
    }
    :global(.svelte-flow__edges) {
        z-index: 1001 !important;
    }
</style>
