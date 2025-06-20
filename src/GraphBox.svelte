<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import {
        SvelteFlow,
        Connection,
        MiniMap,
        SvelteFlowProvider,
        Controls,
        ColorMode,
        Background,
        type Edge,
        type Node,
        Position,
    } from "@xyflow/svelte";
    import "@xyflow/svelte/dist/style.css";
    import { Plugin, IProtyle } from "siyuan";
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
    import GraphNode from "./GraphNode.svelte";
    import dagre from "@dagrejs/dagre";
    import GraphControl from "./GraphControl.svelte";
    import GraphMenu from "./GraphMenu.svelte";
    import { BlockTypeNoContent } from "./libs/gconst";
    import {
        graphClick2Locate,
        graphMaxAllBlocks,
        graphMaxPBlocks,
    } from "./libs/stores";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { verifyKeyTomato } from "./libs/user";
    import { events } from "./libs/Events";

    export let plugin: Plugin;
    export let dock: { element: HTMLElement; data: any };
    export let landscapeSwitchBtnID: string;
    let colorMode: ColorMode = "system";
    let canvas: HTMLElement;
    const nodes = writable<Node[]>([]);
    const edges = writable<Edge[]>([]);
    const snapGrid: [number, number] = [25, 25];
    const nodeTypes = {
        block: GraphNode,
    };
    const nodeWidth = 172;
    const nodeHeight = 36;
    let canvasHeight: number;
    let canvasWidth: number;
    let menuOpt: NodeMenu<Node>;
    let lastDocID = "";
    let stop = false;
    let isVertical = false;

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
                btn.addEventListener("click", () => {
                    isVertical = !isVertical;
                    if (lastDocID) {
                        siyuan.setBlockAttrs(lastDocID, {
                            "custom-graph-isVertical": String(isVertical),
                        });
                    }
                    relayout();
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
                type: "default",
                // type: "block",
                data: {
                    label,
                    // text: label,
                    // color: nodeColors.getColorForRootID(row.root_id),
                } as GraphNodeData,
                position: { x: 0, y: idx * 100 },
            });
        });
        const set = new Set<string>();
        links.forEach((link) => {
            const id1 = link.block_id + "-" + link.def_block_id;
            const id2 = link.def_block_id + "-" + link.block_id;
            if (set.has(id1) || set.has(id2)) return;
            set.add(id1);
            set.add(id2);
            addEdge(link);
        });
        await taskLayoutDirection;
        relayout();
        if (docID != lastDocID && data()?.locateID) {
            lastDocID = docID;
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

    function addEdge(link: Ref) {
        const id = link.block_id + "-" + link.def_block_id;
        let label = link.content?.trim() ?? "";
        if (label === "*") label = "";
        // const style = `stroke:var(--b3-font-color1);`;
        $edges.push({
            id,
            source: link.block_id,
            target: link.def_block_id,
            // type: "default",
            label,
            // style,
        });
    }

    function relayout() {
        getLayoutedElements($nodes, $edges, isVertical);
        $nodes = $nodes;
        $edges = $edges;
    }

    function getLayoutedElements(
        nodes: Node[],
        edges: Edge[],
        isVertical: boolean,
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
            node.position = {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            };
            if (isVertical) {
                node.targetPosition = Position.Top;
                node.sourcePosition = Position.Bottom;
            } else {
                node.targetPosition = Position.Left;
                node.sourcePosition = Position.Right;
            }
        });
        // 出入链接调整一下，不然会拧巴着.
        edges.forEach((edge) => {
            const s = nodeMap.get(edge.source);
            const t = nodeMap.get(edge.target);
            if (s && t) {
                if (isVertical) {
                    if (s.position.y > t.position.y) {
                        const tmp = edge.source;
                        edge.source = edge.target;
                        edge.target = tmp;
                    }
                } else {
                    if (s.position.x > t.position.x) {
                        const tmp = edge.source;
                        edge.source = edge.target;
                        edge.target = tmp;
                    }
                }
            }
        });
        return { nodes, edges };
    }

    function data() {
        return dock.data as unknown as GraphDockData<any>;
    }

    function handleContextMenu({ detail: { event, node } }) {
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
            relayout();
        }
    }
    async function nodeclick({ detail }: any) {
        const pointer = detail?.event as PointerEvent;
        const node = detail?.node as Node;
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
            id={newID()}
            {nodeTypes}
            {colorMode}
            {nodes}
            {edges}
            {snapGrid}
            fitView
            {ondelete}
            {onconnect}
            on:nodecontextmenu={handleContextMenu}
            on:paneclick={handlePaneClick}
            on:edgeclick={(event) => {
                event;
            }}
            on:nodeclick={nodeclick}
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
</style>
