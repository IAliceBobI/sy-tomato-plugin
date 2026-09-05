<script lang="ts">
    import { onMount, tick } from "svelte";
    import { writable } from "svelte/store";
    import {
        SvelteFlow,
        MiniMap,
        SvelteFlowProvider,
        Controls,
        Background,
        Panel,
        MarkerType,
        type Edge,
        type Node,
        type Connection,
        type ColorMode,
        Position,
    } from "@xyflow/svelte";
    import "@xyflow/svelte/dist/style.css";
    import { Plugin, confirm, Menu, getAllEditor, type IProtyle } from "siyuan";
    import { getData, getGraphSkeleton, precheckDocSize, graphFullLoadedBigDocs } from "./GraphBox";
    import { newID } from "stonev5-utils";
    import {
        getBlockDiv,
        linkTwoElements,
        pmapNullVO,
        removeRefs,
        siyuan,
        Siyuan,
        sleep,
    } from "./libs/utils";
    import { hidePanelTip } from "./libs/panelTip";
    import dagre from "@dagrejs/dagre";
    import GraphControl from "./GraphControl.svelte";
    import EdgeWithLabel from "./EdgeWithLabel.svelte";
    import GraphNode from "./GraphNode.svelte";
    import GraphGroup from "./GraphGroup.svelte";
    import {
        graphDefaultExpandLevel,
        graphHideStructEdges,
        graphMaxAllBlocks,
        graphMaxPBlocks,
    } from "./libs/stores";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { copyToClipboard } from "./libs/domUtils";
    import { debugLog } from "./libs/logUtils";
    import { pickGraphChannel, formatCharsVolume } from "./libs/graphSkeleton";
    import {
        buildTreeIndex, initialCollapsedRows, computeVisible, filterEdges, expandAncestors,
        serializeCollapsed, parseCollapsed, type ExpandLevel, type GraphEdgeSpec, type RenderEdge,
    } from "./libs/graphCollapse";
    import {
        normalizeLayoutForm, rankdirOf, isTextVertical, migrateIsVertical, nextLayoutForm,
        type LayoutForm,
    } from "./libs/graphLayout";
    import { mergeParagraphChains } from "./libs/graphParaMerge";
    import { graphDefaultLayout } from "./libs/stores";
    import { tomatoI18n } from "./tomatoI18n";

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
    let lastDocID = "";
    // □2 闪烁治理指纹：同文档且 updated 未变 = 图数据必然未变，changeDoc 整次短路
    // （「打开所在文档」新页签/重复 loaded 事件/轮询必刷的白跑全被挡在构建前，零闪烁零成本）
    let lastFingerprint = "";
    let currentDocName = ""; // 完整加载时 getData 需要文档名（根节点 label）
    let stop = false;
    // 布局形态四态（期7）：lr/tb=横排文字，vlr/vtb=竖排文字（writing-mode）；
    // 树生长方向 rankdirOf(form)，持久化 custom-graph-layout（旧 custom-graph-isVertical 读时迁移）
    let layoutForm: LayoutForm = "lr";
    const edgeTypes = { labeledEdge: EdgeWithLabel };
    const nodeTypes = { tomatoNode: GraphNode, tomatoGroup: GraphGroup };

    // graphbox 期2 折叠机制：完整树数据只建一次，$nodes/$edges 只装可见子图——
    // 折叠/展开 toggle 重算可见集（computeVisible/filterEdges）+局部重布局，折叠态图永远小、dagre 永远快
    let allRows: Block[] = [];
    let allLinks: GraphEdgeSpec[] = [];
    let labels = new Map<string, string>();
    let collapsedSet = new Set<string>();
    // 期7 ¶×N 重设计：段落链在数据预处理层整链合并（链成员从 allRows 剔除、边端点重定向链头）
    let paraByText = new Map<string, string>();  // 链头 id → 全文合并（截断后）
    let paraCount = new Map<string, number>();   // 链头 id → 链内块数（¶×N badge）
    let paraRedirect = new Map<string, string>();// 链成员 id → 链头 id（locateID 定位链中段重定向）

    // graphbox 期1 三档状态：skeleton=骨架态显示提示条；stat 驱动文案；loading=全量构建遮罩；
    // manualRefresh=当前文档处于全量态大文档（轮询已降级）
    let graphMode: "full" | "skeleton" = $state("full");
    let graphStat: { cnt: number; totalLen: number } | null = $state(null);
    let graphLoading = $state(false);
    let graphManualRefresh = $state(false);

    function gbLog(tag: string, msg: string) {
        debugLog(tag, msg, "graphbox");
    }

    // MiniMap 节点分色（spec §10）：按状态（根/折叠/普通）而非边类型——2~4px 矩形两维编码无意义
    const minimapNodeColor = (n: Node) => {
        const d = n.data as any;
        if (n.id === lastDocID) return "var(--b3-theme-on-surface)";
        if (d?.isParaMerged || d?.collapsed) return "var(--b3-theme-primary-light)";
        return "var(--b3-theme-background-light)";
    };

    // 期2 P2 留观修复（期3 精修）：小图折叠首屏垂直贴下部=fitView 跑在容器尺寸就绪前——
    // 主动 fitView 后 5s 内容器尺寸变化（dock 面板展开/setCanvasSize 生效）后防抖重跑 fitView；
    // 窗口外不打扰（用户手动缩放不被打回）。锚点=_fitAt（fitView 时刻）而非 lastLayoutAt
    // （后者在 relayout 末尾才写，首轮尺寸变化的 effect 先跑时恒为 0=永跳过，dev 实锤沉底）
    $effect(() => {
        if (!canvasHeight || !canvasWidth) return;
        const fitAt = (data() as any)?._fitAt ?? 0;
        if (!fitAt || Date.now() - fitAt > 5000) return;
        const t = setTimeout(() => {
            data()?.fitView?.({ padding: 0.15, duration: 200 });
        }, 300);
        return () => clearTimeout(t);
    });

    // https://svelteflow.dev/examples/nodes/easy-connect
    onMount(() => {
        data().setCanvasSize = () => {
            // dock.element 无固有高（历史上靠本函数写死 style 撑起，读它=自反馈虚高）；
            // 高按视口减法：顶锚 canvas.getBoundingClientRect().top、底到视口底（思源左侧
            // dock 面板延伸到视口底），窗口变化走 dock resize 钩子重算
            const top = canvas.getBoundingClientRect().top;
            const h = Math.max(0, window.innerHeight - top - 6);
            const w = dock.element.clientWidth;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            stop = w < 10 || h < 10;
        };
        data().changeDoc = changeDoc;
        data().expandTo = expandTo;
        // 期7 ¶ 链中段定位重定向：目标块已并进 ¶ 大节点 → 图上节点=链头（GraphControl locateID 消费）
        data().paraRedirectOf = (id: string) => paraRedirect.get(id) ?? id;
        // 二期 □2 定位兜底数据通道：图内全块 id 集（locateNode 上爬祖先时的「图内」判定）
        data().graphIDsOf = () => new Set(allRows.map(r => r.id));
        // 期4 块→图定位链路消费：图当前文档/通道态/块上限（locateNode 的 toast 分支文案依据）
        data().getGraphState = () => ({
            mode: graphMode,
            docID: lastDocID,
            maxBlocks: graphMaxAllBlocks.get(),
            // 二期 □2：文档真实块数（precheck count）——「超上限」文案只留给真超限（cnt > maxBlocks）
            blockCount: graphStat?.cnt,
        });

        if (landscapeSwitchBtnID) {
            (async () => {
                let btn: HTMLElement;
                while (!btn) {
                    btn = document.getElementById(
                        landscapeSwitchBtnID,
                    ) as HTMLElement;
                    await sleep(1);
                }
                // 期7 形态循环钮：lr→tb→vlr→vtb→lr；图标四态回显+tooltip 报当前形态
                const formLabel = (f: LayoutForm) => ({
                    lr: tomatoI18n.形态横排向右, tb: tomatoI18n.形态横排向下,
                    vlr: tomatoI18n.形态竖排向右, vtb: tomatoI18n.形态竖排向下,
                })[f];
                const syncIcon = () => {
                    const use = document.getElementById(landscapeSwitchBtnID + "-icon");
                    use?.setAttribute("xlink:href", `#iconGraphLayout${layoutForm.toUpperCase()}`);
                    btn.setAttribute("aria-label", tomatoI18n.切换布局形态.replace("%1", formLabel(layoutForm)));
                };
                const onSwitch = async () => {
                    layoutForm = nextLayoutForm(layoutForm);
                    data().layoutForm = layoutForm;
                    syncIcon();
                    if (lastDocID) {
                        await siyuan.setBlockAttrs(lastDocID, {
                            "custom-graph-layout": layoutForm,
                            "custom-graph-isVertical": "", // 旧布尔键退役置空，防读时误迁移
                        });
                    }
                    await relayout(true, true); // remeasure：竖排节点尺寸≠横排 measured（P0 修复）
                };
                btn.addEventListener("click", onSwitch);
                btn.addEventListener("keydown", (ev: KeyboardEvent) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        void onSwitch();
                    }
                });
                syncIcon();
            })();
        }
        // 期4：openGraphTab 页签通道退役，本组件仅由 dock 挂载（landscapeSwitchBtnID 恒非空）；
        // 原 else 分支（tab 冷启动 setCanvasSize+changeDoc+locateID）随之删除
    });

    // changeDoc 与 onFullLoad 全量构建共用互斥锁：防止轮询/切文档的重建与「完整加载」交错
    // 把画面刷成 A 文档而状态留 B 文档（2026-09-04 dev 实锤竞态）
    const GRAPH_LOCK = "tomato-graph-box-lock2024-11-4 20:09:58";

    async function changeDoc(protyle: IProtyle, refreshOnly = false) {
        await navigator.locks.request(
            GRAPH_LOCK,
            { ifAvailable: true },
            async (lock) => {
                if (lock && protyle) {
                    await _changeDoc_(protyle, refreshOnly);
                    await sleep(1000);
                }
            },
        );
    }

    async function _changeDoc_(protyle: IProtyle, refreshOnly = false) {
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
        // □2 指纹短路：毫秒级 updated SQL 远贱于 getBlockDOM（巨书 25~39s），同文档未编辑
        // 直接跳过整次重建——节点 DOM 原样保留（引用不变=视觉零闪烁），折叠/视图态不受扰
        const updatedRow = await siyuan.sqlOne(`SELECT updated FROM blocks WHERE id = "${docID}" AND type = "d"`);
        const fingerprint = `${docID}|${updatedRow?.updated ?? ""}`;
        if (fingerprint === lastFingerprint) {
            gbLog("graph.short_circuit", `doc=${docID.slice(0, 8)} unchanged`);
            return;
        }
        currentDocName = docName;
        const taskLayoutForm = getLayoutForm(docID);

        // 预检三档：毫秒级 count SQL 分流，绝不无脑 getBlockDOM（巨书 25~39s/24MB）
        const stat = await precheckDocSize(docID);
        let channel = pickGraphChannel(stat?.cnt ?? 0, graphMaxAllBlocks.get());
        if (graphFullLoadedBigDocs.has(docID) && channel === "skeleton") {
            channel = "full"; // 本会话进过全量态的大文档保持全量（手动刷新不回骨架，用户已付过全量构建成本）
        }
        gbLog("graph.channel", `doc=${docID.slice(0, 8)} → ${channel}`);
        graphStat = stat;
        graphMode = channel;
        graphManualRefresh = graphFullLoadedBigDocs.has(docID);

        graphLoading = true;
        try {
            let rows: Block[], links: Ref[];
            if (channel === "skeleton") {
                ({ rows, links } = await getGraphSkeleton(docID, docName));
            } else {
                const t0 = performance.now();
                ({ rows, links } = await getData(
                    docID,
                    docName,
                    graphMaxPBlocks.get(),
                    graphMaxAllBlocks.get(),
                ));
                gbLog("graph.full", `rows=${rows.length} links=${links.length} ${Math.round(performance.now() - t0)}ms`);
            }
            await applyRowsAndLinks(rows, links, docID, channel === "skeleton");
        } finally {
            graphLoading = false;
        }
        await taskLayoutForm;
        // 先设置 lastDocID，这样 relayout 才能正确加载保存的位置
        const isNewDoc = docID != lastDocID;
        if (isNewDoc) {
            lastDocID = docID;
        }
        lastFingerprint = fingerprint; // 构建真正落地才落指纹（中途丢弃/异常不落）
        await relayout(!refreshOnly);
        if (isNewDoc && data()?.locateID) {
            data()?.locateID($nodes.at(0)?.id);
        }
    }

    // rows/links → 段落链合并（期7：链子树整链并 ¶ 大节点，链成员剔除+边端点重定向）→
    // 全量树数据（折叠只影响「渲染哪些」不影响「建什么」）→ 可见子图 $nodes/$edges
    // （全量与骨架两通道共用；骨架=纯结构，无视「隐藏结构连线」开关）
    async function applyRowsAndLinks(rows: Block[], links: Ref[], docID: string, isSkeleton: boolean) {
        const merged = mergeParagraphChains(rows, dedupeLinks(links, isSkeleton));
        allRows = merged.rows;
        allLinks = merged.links;
        paraByText = merged.paraByText;
        paraCount = merged.paraCount;
        paraRedirect = merged.linkRedirect;
        labels = new Map(allRows.map(row => [row.id, rowLabel(row, docID)]));
        // 折叠态：文档持久化（custom-graph-collapsed）优先；未 toggle 过的文档按「默认展开层级」推导。
        // ¶ 链头过滤：旧版把链头存进折叠集（展开族），期7 起链头恒 ¶ 大节点、折叠语义不适用
        const attr = await siyuan.getBlockAttrs(docID);
        const saved = parseCollapsed(attr?.["custom-graph-collapsed"]);
        collapsedSet = new Set(
            (saved ?? initialCollapsedRows(allRows, normalizeExpandLevel(graphDefaultExpandLevel.get())))
                .filter(id => !paraByText.has(id)),
        );
        applyCollapsedView();
    }

    function normalizeExpandLevel(v: string): ExpandLevel {
        return v === "1" || v === "2" || v === "3" || v === "all" ? v : "2";
    }

    function rowLabel(row: Block, docID: string): string {
        if (row.type === "h")
            row.content = `${"#".repeat(parseInt(row.subtype[1]))} ${row.content}`;

        if (row.root_id === docID) row.docName = "";

        // 期3（spec §8/§9）：📄 emoji 与 [X] 文字前缀退役——块类型图标/文档图标/《文档名》
        // 改由 GraphNode 按 data 字段（blockType/isDoc/docName）渲染，label 只装纯文本
        // 三期 □2：av/tb 无可读文本，占位文案兜底（提取层 noContentBlockLabel 返回空）
        if (row.type === "av") return tomatoI18n.属性视图块;
        if (row.type === "tb") return tomatoI18n.分割线块;
        return (row.content ?? "").slice(0, 30);
    }

    function dedupeLinks(links: Ref[], isSkeleton: boolean): GraphEdgeSpec[] {
        const seen = new Set<string>();
        const out: GraphEdgeSpec[] = [];
        links.forEach((link) => {
            if (!isSkeleton && graphHideStructEdges.get() && !link.isRef) return;
            const id = link.block_id + "-" + link.def_block_id;
            if (seen.has(id)) return;
            seen.add(id);
            out.push({
                id,
                source: link.block_id,
                target: link.def_block_id,
                label: link.content ?? "",
                isRef: !!link.isRef,
            });
        });
        return out;
    }

    // ¶×N 大节点全文（期7）：mergeParagraphChains 产物（链内全文合并+2000 字首尾截断），此处零加工

    // 折叠集 → 可见子图：$nodes 只装可见节点（type=tomatoNode 自定义节点带角标数据），
    // $edges 走 filterEdges（结构边随子可见过滤、引用边端点重定向到折叠祖先）。
    // 期3 subflow：sb/bq 未折叠且有可见直接子 → tomatoGroup 容器节点，可见子孙挂最近容器祖先
    // （xyflow parentId 相对坐标系），空间包含替代「容器→直接子」结构边
    function applyCollapsedView() {
        const tree = buildTreeIndex(allRows);
        const vis = computeVisible(allRows, collapsedSet);
        const groupIds = new Set<string>();
        for (const row of allRows) {
            if (!vis.visibleIds.has(row.id)) continue;
            // 思源块类型码：超级块='s'（NodeSuperBlock）、引述块='b'（NodeBlockquote）。
            // 三期 B'（2026-09-04 方向修正）：列表容器 l 退出 subflow 族——列表改脑图式
            // 树形分叉（i=分叉节点+吸收项内文本），容器壳语义只剩 s 与 b
            if ((row.type === "s" || row.type === "b") && !collapsedSet.has(row.id)
                && (tree.childrenOf.get(row.id) ?? []).some(cid => vis.visibleIds.has(cid))) {
                groupIds.add(row.id);
            }
        }
        const parentNodeFor = (id: string): string | undefined => {
            let cur = tree.parentOf.get(id);
            while (cur) {
                if (groupIds.has(cur)) return cur;
                cur = tree.parentOf.get(cur);
            }
            return undefined;
        };
        const nodeArr: Node[] = [];
        let idx = 0;
        for (const row of allRows) {
            if (!vis.visibleIds.has(row.id)) continue;
            const collapsed = collapsedSet.has(row.id);
            // 期7 ¶ 大节点判定改预处理打标（mergeParagraphChains），与折叠集解耦；
            // dagreW/H 仅作 measured 写回前的首轮估算（¶ 高钳 400，竖排窄卡 122）
            const isParaMerged = paraByText.has(row.id);
            const isGroup = groupIds.has(row.id);
            // 容器同款爬最近容器祖先（嵌套 subflow：引述块挂超级块内）；爬不到=顶层
            const parentId = parentNodeFor(row.id);
            // 折叠态 sb/bq 无正文，label 空卡片难辨——给容器名（GraphGroup 标题栏同款文案）
            let label = labels.get(row.id) ?? "";
            if ((row.type === "s" || row.type === "b") && !isGroup) {
                label = row.type === "b" ? tomatoI18n.引述块 : tomatoI18n.超级块;
            }
            // 跨文档/文档块图标数据（spec §8）：docName==content 的跨文档块与 type=d 同为文档语义
            const isDoc = row.type === "d" || (!!row.docName && row.docName === row.content);
            const crossDocName = !isDoc && row.docName && row.docName !== row.content ? row.docName : undefined;
            nodeArr.push({
                id: row.id,
                type: isGroup ? "tomatoGroup" : "tomatoNode",
                parentId,
                extent: parentId ? ("parent" as const) : undefined,
                zIndex: isGroup ? 0 : parentId ? 1 : undefined,
                data: {
                    label,
                    // hover tooltip 全文通道（GraphNode aria-label → panelTip 单例）；
                    // ¶×N 用合并全文（2000 字截断即其全文），其余= row.content 原文
                    fullText: isParaMerged ? paraByText.get(row.id)! : (row.content ?? ""),
                    paraText: isParaMerged ? paraByText.get(row.id)! : undefined,
                    collapsed,
                    isParaMerged,
                    groupKind: row.type === "b" ? "bq" : "sb",
                    sbLayout: row.type === "s" ? row.subtype : undefined,
                    blockType: row.type,
                    isDoc,
                    docName: crossDocName,
                    // ¶ badge ¶×N = 链内合并块数（期7 起与折叠 hiddenCount 语义分家）
                    hiddenCount: isParaMerged ? paraCount.get(row.id) : vis.hiddenCount.get(row.id),
                    hasChildren: (vis.subtreeSize.get(row.id) ?? 1) > 1,
                    // ¶ 横排 188 宽/竖排 122 宽，高钳 400（¶ 卡内滚）；普通节点竖排窄高 56×118
                    dagreW: isParaMerged ? (isTextVertical(layoutForm) ? 122 : 188) : isTextVertical(layoutForm) ? 56 : undefined,
                    dagreH: isParaMerged ? 400 : isTextVertical(layoutForm) ? 118 : undefined,
                    // ¶ 无展开概念（期7）：不挂 toggle；双击=滚动链头段
                    toggle: isParaMerged ? undefined : () => void toggleCollapseNode(row.id),
                    dblclick: () => void showBlockInEditor(row.id),
                },
                position: { x: 0, y: idx++ * 100 },
            });
        }
        const rendered = filterEdges(allLinks, vis.visibleIds, tree);
        const edgeArr: Edge[] = [];
        for (const e of rendered) {
            // 「容器→直接子块」结构边跳过：subflow 空间包含已表达（容器内其余层级结构边照画）
            if (!e.isRef && groupIds.has(tree.parentOf.get(e.rTarget) ?? "")) continue;
            addRenderEdge(e, edgeArr);
        }
        spreadEdgeLabels(edgeArr);
        // 官方通道更新（内部 store 赋值；onMount 前未挂时回退 nodes.set 首装）
        const gs = data()?.graphStore;
        if (gs) { gs.nodes = nodeArr; gs.edges = edgeArr; }
        else { nodes.set(nodeArr); edges.set(edgeArr); }
    }

    // 折叠/展开 toggle：重算可见子图 + 持久化 + 局部重布局（复用 relayout 的 dagre+fitView 通道）
    async function toggleCollapseNode(id: string) {
        if (collapsedSet.has(id)) collapsedSet.delete(id);
        else collapsedSet.add(id);
        gbLog("graph.collapse_toggle", `node=${id.slice(0, 8)} → ${collapsedSet.has(id) ? "collapse" : "expand"} visible=${computeVisible(allRows, collapsedSet).visibleIds.size}/${allRows.length}`);
        applyCollapsedView();
        if (lastDocID) await saveCollapsed(lastDocID);
        await relayout();
    }

    // 折叠态按文档持久化（仿 saveNodePositions 的 setBlockAttrs 模式；空集序列化 "[]" = 清空恢复默认推导）
    async function saveCollapsed(docID: string) {
        await siyuan.setBlockAttrs(docID, {
            "custom-graph-collapsed": serializeCollapsed(collapsedSet),
        });
    }

    // 展开目标 id 的祖先链（expandTo，期4 块→图定位链路消费）：目标在折叠子树内时不静默；
    // 返回是否有折叠变更（locateNode 据此等 relayout 尾部 fire-and-forget 的 fitView 落地再 setCenter）
    async function expandTo(id: string): Promise<boolean> {
        const tree = buildTreeIndex(allRows);
        if (!expandAncestors(tree, collapsedSet, id)) return false;
        gbLog("graph.expand_to", `node=${id.slice(0, 8)} visible=${computeVisible(allRows, collapsedSet).visibleIds.size}/${allRows.length}`);
        applyCollapsedView();
        if (lastDocID) await saveCollapsed(lastDocID);
        await relayout();
        return true;
    }

    // 骨架态「完整加载」：confirm 二次确认（预计 10~40s+大内存）→ loading 态全量 → 巨书全量态（轮询降级手动）。
    // 与 changeDoc 共锁 + 构建前后双查目标：确认弹窗停留期间/构建期间编辑器切走则丢弃，防画面与状态错位
    function onFullLoad() {
        const cnt = graphStat?.cnt ?? 0;
        const targetDocID = lastDocID;
        gbLog("graph.full_load_click", `blocks=${cnt}`);
        confirm(
            tomatoI18n.完整加载确认标题,
            tomatoI18n.完整加载确认文案.replace("%1", `${cnt}`),
            async () => {
                if (!targetDocID) return;
                await navigator.locks.request(
                    GRAPH_LOCK,
                    { ifAvailable: true },
                    async (lock) => {
                        if (!lock) return; // 有 changeDoc 在跑：让位（用户再点一次即可）
                        if (lastDocID !== targetDocID) return; // 确认期间已切走，丢弃
                        graphLoading = true;
                        try {
                            const t0 = performance.now();
                            const { rows, links } = await getData(
                                targetDocID,
                                currentDocName,
                                graphMaxPBlocks.get(),
                                graphMaxAllBlocks.get(),
                            );
                            if (lastDocID !== targetDocID) return; // 构建期间已切走，丢弃
                            await applyRowsAndLinks(rows, links, targetDocID, false);
                            await relayout();
                            graphFullLoadedBigDocs.add(targetDocID);
                            graphMode = "full";
                            graphManualRefresh = true;
                            gbLog("graph.full_loaded", `rows=${rows.length} ${Math.round(performance.now() - t0)}ms`);
                        } finally {
                            graphLoading = false;
                        }
                    },
                );
            },
        );
    }

    // 巨书全量态手动刷新（绕过 updated 时间戳守卫，直接重建）。
    // events.protyle 不能用：?id= 冷启动会话只来 loaded-protyle-static（detail 无 event 字段，
    // Events 单例写入门槛过不去）→ 恒空 → changeDoc(undefined) no-op（2026-09-04 收官 e2e 实锤，
    // 手动刷新钮打了点不重建）。手动刷新语义=重建图自身文档，用面板态伪造（同 GraphBox.ts
    // protyleForChangeDoc 配方，_changeDoc_ 只读 title/block 两字段）
    async function onManualRefresh() {
        gbLog("graph.manual_refresh", `doc=${(lastDocID || "").slice(0, 8)}`);
        if (!lastDocID) return;
        lastFingerprint = ""; // 手动刷新=强制重建语义，绕过指纹短路
        await changeDoc({
            title: { editElement: { textContent: currentDocName || lastDocID } },
            block: { rootID: lastDocID },
        } as unknown as IProtyle);
    }

    // 读文档布局形态：custom-graph-layout 四态优先 → 旧 custom-graph-isVertical 布尔迁移
    // （true→tb / false→lr）→ 设置默认 graphDefaultLayout。顶栏钮图标随态回显。
    async function getLayoutForm(docID: string) {
        if (docID != lastDocID) {
            const attr = await siyuan.getBlockAttrs(docID);
            const saved = attr?.["custom-graph-layout"] as string | undefined;
            layoutForm = saved
                ? normalizeLayoutForm(saved)
                : migrateIsVertical(attr?.["custom-graph-isVertical"] as string)
                  ?? normalizeLayoutForm(graphDefaultLayout.get() as string);
            data().layoutForm = layoutForm;
            // 顶栏钮状态回显（图标四态 + tooltip 报形态名）
            if (landscapeSwitchBtnID) {
                document.getElementById(landscapeSwitchBtnID + "-icon")
                    ?.setAttribute("xlink:href", `#iconGraphLayout${layoutForm.toUpperCase()}`);
                document.getElementById(landscapeSwitchBtnID)
                    ?.setAttribute("aria-label", tomatoI18n.切换布局形态.replace("%1", ({
                        lr: tomatoI18n.形态横排向右, tb: tomatoI18n.形态横排向下,
                        vlr: tomatoI18n.形态竖排向右, vtb: tomatoI18n.形态竖排向下,
                    })[layoutForm]));
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

    function addRenderEdge(e: RenderEdge, into: Edge[]) {
        let label = e.label?.trim() ?? "";
        if (label === "*") label = "";
            // 边双通道（spec §3）：引用边=主色实线+闭合箭头（视觉主角）；结构边=灰虚线无箭头（背景板）。
            // stroke 走 CSS var 随主题自动换态；回边（isBackEdge）几何不动、样式同通道。
            // （Edge.style 是 CSS 字符串非对象——与 Node.style 机制不同）
            into.push({
                id: e.id,
                source: e.rSource,
                target: e.rTarget,
                label,
                type: label ? "labeledEdge" : undefined,
                style: e.isRef
                    ? "stroke: var(--b3-theme-primary); stroke-width: 1.5;"
                    : "stroke: var(--b3-theme-on-surface-light); stroke-width: 1.25; stroke-dasharray: 4 3;",
                markerEnd: e.isRef
                    ? { type: MarkerType.ArrowClosed, width: 16, height: 16, color: "var(--b3-theme-primary)" }
                    : undefined,
            // 原始端点恒保留：折叠态引用边被重定向到折叠祖先，删边仍须删真块引用（ondelete/边右键消费）；
            // isRef 供边右键判定（结构边=背景板无右键语义）；label=完整锚文本（显示截断归 CSS 120px ellipsis）
            data: { origSource: e.source, origTarget: e.target, isRef: e.isRef },
        });
    }

    function spreadEdgeLabels(edges: Edge[]) {
        const srcIdx = new Map<string, number>();
        for (const e of edges) {
            if (!e.label) continue;
            const idx = srcIdx.get(e.source) ?? 0;
            srcIdx.set(e.source, idx + 1);
            // 同源多标签沿边错开且离开源/靶节点 1/5 边长以上（spec §3.4：0.22/0.44/0.66 封顶；
            // 旧 0.1 起步贴源点被节点盖住，期3 P0）
            (e as any).data = { ...((e as any).data ?? {}), labelT: Math.min(0.22 + idx * 0.22, 0.66) };
        }
    }

    // 渲染一帧让 xyflow 写回 node.measured（多行节点/¶×N 实际尺寸≠估算；两轮 dagre 的首轮后预热）
    async function warmupMeasured() {
        await tick();
        await new Promise(r => requestAnimationFrame(() => r(null)));
        await new Promise(r => requestAnimationFrame(() => r(null)));
    }

    async function relayout(refit = true, remeasure = false) {
        // 首布局先渲染一帧拿 measured（期3 P0：dagre 估算 172×36 与实际渲染尺寸不符是多行
        // 节点重叠的根因）——两轮：估算布局→渲染测量→measured 精修一轮。
        // remeasure（期7 形态切换）：既有 measured 是横排渲染的旧值（172×36），竖排节点实为
        // 40~56×118——不重测则 dagre 按旧尺寸排布=纵向重叠（vision P0 实锤）。先 commit 刷
        // form 渲染出竖排形态、等 xyflow 写回新 measured 再布局
        const rankdir = rankdirOf(layoutForm);
        const commit = () => {
            const vMark = rankdir === "TB" ? "⇓" : "⇉"; // 容器方向标记随树生长方向刷新（spec §7）
            const cloned = $nodes.map(n => ({
                ...n,
                data: n.type === "tomatoGroup"
                    ? { ...n.data, vMark, form: layoutForm }
                    : { ...n.data, form: layoutForm },
            }));
            const clonedEdges = $edges.map(e => ({ ...e }));
            const gs = data()?.graphStore;
            if (gs) { gs.nodes = cloned; gs.edges = clonedEdges; }
            else { nodes.set(cloned); edges.set(clonedEdges); }
        };
        if (remeasure) {
            commit(); // 渲染新形态（data.form 变更触发 GraphNode 竖排分支）
            await warmupMeasured();
        }
        await warmupMeasured();
        const savedPositions = lastDocID ? await loadNodePositions(lastDocID) : {};
        getLayoutedElements($nodes, $edges, layoutForm, savedPositions);
        if ($nodes.some(n => !n.measured)) {
            commit(); // 渲染一帧让 xyflow 写回 measured
            await warmupMeasured();
            getLayoutedElements($nodes, $edges, layoutForm, savedPositions);
        }
        commit();
        // fitView prop 仅初始化生效，节点重建后须手动适配视口（vision P1：骨架/全量首屏空白画布）；
        // fitView 经 GraphControl 借道（useSvelteFlow 须在 Provider 内取）；
        // refit=false=同文档内容刷新（自动刷新链）：保留当前视口，不打回用户/定位视图（期4 P1）
        if (refit) data()?.fitView?.({ padding: 0.15, duration: 200 });
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

    // subflow 容器内边距与标题栏高（.gg padding-top 同源；视觉数值 spec 定稿后同步）
    const GROUP_PAD = 10;
    const GROUP_HEAD_H = 22;

    // 内层布局：单个容器对其直接渲染子跑小 dagre（嵌套容器先递归定尺寸），写子节点相对坐标
    // （相对容器左上角，xyflow parentId 坐标系），返回容器包围尺寸
    function layoutGroup(
        groupId: string,
        nodeMap: Map<string, Node>,
        groupChildren: Map<string, Node[]>,
        edges: Edge[],
        form: LayoutForm,
    ): { w: number; h: number } {
        const kids = groupChildren.get(groupId) ?? [];
        for (const kid of kids) {
            if ((kid as any).type === "tomatoGroup" && groupChildren.has(kid.id)) {
                const wh = layoutGroup(kid.id, nodeMap, groupChildren, edges, form);
                kid.data = { ...kid.data, groupW: wh.w, groupH: wh.h };
                // 尺寸走 node.width/height 数字 prop（xyflow 官方通道，NodeWrapper 参与
                // measured 优先级与 nodeStyle 合成；node.style 须字符串，传对象=渲染成
                // [object Object]，容器塌成 1px 宽——dev 实锤）
                kid.width = wh.w;
                kid.height = wh.h;
            }
        }
        const g = new dagre.graphlib.Graph();
        g.setDefaultEdgeLabel(() => ({}));
        g.setGraph({ rankdir: rankdirOf(form) });
        kids.forEach(kid => {
            const isGroup = (kid as any).type === "tomatoGroup";
            g.setNode(kid.id, {
                // groupW 未算出（异常序）兜底 120，防 undefined 进 dagre 传染 NaN 坐标
                width: isGroup
                    ? (kid.data as any).groupW ?? 120
                    : kid.measured?.width ?? (kid.data as any).dagreW ?? nodeWidth,
                height: isGroup
                    ? (kid.data as any).groupH ?? 60
                    : kid.measured?.height ?? (kid.data as any).dagreH ?? nodeHeight,
            });
        });
        const kidIds = new Set(kids.map(k => k.id));
        const seen = new Set<string>();
        edges.forEach(e => {
            if (!kidIds.has(e.source) || !kidIds.has(e.target)) return;
            const key = e.source + "-" + e.target;
            if (seen.has(key)) return;
            seen.add(key);
            g.setEdge(e.source, e.target);
        });
        dagre.layout(g, { ranker: "network-simplex" });
        let maxX = 0, maxY = 0;
        kids.forEach(kid => {
            const n = g.node(kid.id);
            kid.position = {
                x: n.x - n.width / 2 + GROUP_PAD,
                y: n.y - n.height / 2 + GROUP_PAD + GROUP_HEAD_H,
            };
            maxX = Math.max(maxX, kid.position.x + n.width);
            maxY = Math.max(maxY, kid.position.y + n.height);
        });
        return { w: Math.max(maxX + GROUP_PAD, 60), h: Math.max(maxY + GROUP_PAD, 40) };
    }

    function getLayoutedElements(
        nodes: Node[],
        edges: Edge[],
        form: LayoutForm,
        savedPositions: Record<string, { x: number; y: number }> = {},
    ) {
        const rankdir = rankdirOf(form);
        const textV = isTextVertical(form);
        const nodeMap = new Map(nodes.map((n) => [n.id, n]));

        // ---- 内层：subflow 容器尺寸+子相对坐标（嵌套递归，最深的先固定）
        const groupChildren = new Map<string, Node[]>();
        for (const n of nodes) {
            if (!n.parentId) continue;
            (groupChildren.get(n.parentId) ?? groupChildren.set(n.parentId, []).get(n.parentId)!).push(n);
        }
        for (const n of nodes) {
            if ((n as any).type === "tomatoGroup" && groupChildren.has(n.id)) {
                const wh = layoutGroup(n.id, nodeMap, groupChildren, edges, form);
                n.data = { ...n.data, groupW: wh.w, groupH: wh.h };
                n.width = wh.w; // 数字 prop（同上：node.style 对象会渲染成 [object Object]）
                n.height = wh.h;
            }
        }

        // ---- 外层：顶层节点（容器视作单节点）跑全局 dagre
        const topNodes = nodes.filter(n => !n.parentId);
        const nodeIdTop = (id: string): string => {
            let cur = nodeMap.get(id);
            while (cur?.parentId) cur = nodeMap.get(cur.parentId);
            return cur?.id ?? id;
        };
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({ rankdir });
        topNodes.forEach((node) => {
            const isGroup = (node as any).type === "tomatoGroup";
            dagreGraph.setNode(node.id, {
                // 竖排普通节点窄高（56×118 首轮估算，measured 精修接管）
                width: isGroup
                    ? (node.data as any).groupW ?? 120
                    : node.measured?.width ?? (node as any).data?.dagreW ?? (textV ? 56 : nodeWidth),
                height: isGroup
                    ? (node.data as any).groupH ?? 60
                    : node.measured?.height ?? (node as any).data?.dagreH ?? (textV ? 118 : nodeHeight),
            });
        });
        const seenTopEdge = new Set<string>();
        edges.forEach((edge) => {
            const s = nodeIdTop(edge.source), t = nodeIdTop(edge.target);
            if (s === t) return; // 纯容器内部边（内层已布局）
            const key = s + "-" + t;
            if (seenTopEdge.has(key)) return;
            seenTopEdge.add(key);
            dagreGraph.setEdge(s, t);
        });

        const tDagre = performance.now();
        dagre.layout(dagreGraph, { ranker: "network-simplex" });

        // 三期 □1：脑图式 y 接管——dagre 的 crossing reduction（median 排序）不保证
        // 输入序（实测同层整列与文档序相反；换 ranker 同序=ordering 阶段与 ranker 无关），
        // 且子节点 y 贴 rank 邻居而非父（分叉感断裂）。y 布局整体接管为经典脑图算法：
        // 结构边序（=文档 DFS 序）先序遍历，叶子自上而下堆叠、内部节点 y=子树首尾中位
        // （子贴父、兄弟文档序）；x/rank 沿用 dagre。手动拖拽固定的子树整树保持 dagre
        // 原位占位（savedPositions 语义优先）；跨文档补块的孤儿节点不在结构树内、保持原位
        const NODE_GAP = 40; // 与 dagre 默认 nodesep 视觉密度同族
        const docOrderSiblings = new Map<string, string[]>();
        edges.forEach((edge) => {
            if ((edge as any).data?.isRef) return; // 结构边（父子）才承载文档序
            const s = nodeIdTop(edge.source), t = nodeIdTop(edge.target);
            if (s === t) return;
            const arr = docOrderSiblings.get(s) ?? docOrderSiblings.set(s, []).get(s)!;
            if (!arr.includes(t)) arr.push(t);
        });
        const fixedTop = new Set(topNodes.filter(n => savedPositions[n.id]).map(n => n.id));
        const readRange = (id: string): [number, number] => {
            const n = dagreGraph.node(id);
            let min = n.y - n.height / 2, max = n.y + n.height / 2;
            for (const k of docOrderSiblings.get(id) ?? []) {
                const [a, b] = readRange(k);
                min = Math.min(min, a); max = Math.max(max, b);
            }
            return [min, max];
        };
        let yCursor = 0;
        const yAssigned = new Map<string, number>();
        const subtreeY = (id: string): [number, number] => {
            const node = dagreGraph.node(id);
            const h = node?.height ?? nodeHeight;
            const kids = docOrderSiblings.get(id) ?? [];
            if (fixedTop.has(id) || kids.length === 0) {
                // fixed 整树保持 dagre 原位（子树成员都不动）；叶子按游标堆叠
                const y = fixedTop.has(id) ? node.y : yCursor + h / 2;
                if (!fixedTop.has(id)) yCursor += h + NODE_GAP;
                yAssigned.set(id, y);
                return fixedTop.has(id) ? readRange(id) : [y - h / 2, y + h / 2];
            }
            let min = Infinity, max = -Infinity;
            for (const k of kids) {
                if (fixedTop.has(k)) {
                    const [a, b] = readRange(k);
                    yCursor = Math.max(yCursor, b + NODE_GAP);
                    min = Math.min(min, a); max = Math.max(max, b);
                } else {
                    const [a, b] = subtreeY(k);
                    min = Math.min(min, a); max = Math.max(max, b);
                }
            }
            const y = (min + max) / 2;
            yAssigned.set(id, y);
            return [min, max];
        };
        // 结构真根=不在任何兄弟集合内的源点（doc/孤儿）；带子的顶层分叉节点（如嵌套
        // 列表项）不是根——重复跑会把其子树二次分配到游标尾端（e2e 实锤）
        const kidSet = new Set<string>();
        docOrderSiblings.forEach(kids => kids.forEach(k => kidSet.add(k)));
        for (const root of topNodes.map(n => n.id)) {
            if (docOrderSiblings.has(root) && !kidSet.has(root) && !fixedTop.has(root)) subtreeY(root);
        }
        yAssigned.forEach((y, id) => { dagreGraph.node(id).y = y; });
        gbLog("graph.dagre", `nodes=${nodes.length} tops=${topNodes.length} edges=${edges.length} ${Math.round(performance.now() - tDagre)}ms`);

        // 顶层节点绝对位置（savedPositions 固定 + 碰撞检测均只作用顶层——容器内子节点跟随容器）
        topNodes.forEach((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            const dagrePos = {
                x: nodeWithPosition.x - nodeWithPosition.width / 2,
                y: nodeWithPosition.y - nodeWithPosition.height / 2,
            };

            // 如果有保存的位置，使用保存的位置，否则用 dagre 计算的位置
            if (savedPositions[node.id]) {
                node.position = savedPositions[node.id];
                node.data = { ...node.data, isFixed: true };
            } else {
                node.position = dagrePos;
            }
        });

        // 碰撞检测：新顶层节点避免与固定节点重叠
        const fixedNodes = topNodes.filter(n => savedPositions[n.id]);
        const newNodes = topNodes.filter(n => !savedPositions[n.id]);
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
                        if (rankdir === "TB") {
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

        // Handle 方向统一（subflow 子节点同款；竖排文字不改树生长方向语义）
        nodes.forEach((node) => {
            if (rankdir === "TB") {
                node.targetPosition = Position.Top;
                node.sourcePosition = Position.Bottom;
            } else {
                node.targetPosition = Position.Left;
                node.sourcePosition = Position.Right;
            }
        });

        // 回边处理：不交换 source/target，直接标记 isBackEdge，弧线从右边出接左边入
        // （子节点 position 是容器相对坐标，判定用沿 parentId 链累加的绝对坐标）
        const absOf = (id: string): { x: number; y: number } | undefined => {
            const n = nodeMap.get(id);
            if (!n) return undefined;
            let x = n.position.x, y = n.position.y;
            let cur: Node | undefined = n;
            while (cur?.parentId) {
                cur = nodeMap.get(cur.parentId);
                if (!cur) break;
                x += cur.position.x;
                y += cur.position.y;
            }
            return { x, y };
        };
        edges.forEach((edge) => {
            const s = nodeMap.get(edge.source);
            const t = nodeMap.get(edge.target);
            if (s && t) {
                const sp = absOf(edge.source);
                const tp = absOf(edge.target);
                if (!sp || !tp) return;
                const isBackEdge = rankdir === "TB"
                    ? sp.y > tp.y
                    : sp.x > tp.x;
                if (isBackEdge) {
                    const oldData: any = (edge as any).data ?? {};
                    (edge as any).data = {
                        ...oldData,
                        isBackEdge: true,
                        backEdgeDir: rankdir === "TB" ? "left" : "down",
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

    // —— graphbox 期4 图→块交互 ——

    // 当前打开 rootID 文档的编辑器（events.protyle 冷启动 null，getAllEditor 全量兜底；
    // debugging/kernel/ui.md「思源 Menu 单例 vs 插件自建菜单」节同款配方）
    function editorOfRoot(rootID: string) {
        return (getAllEditor() as any[]).find(p => p?.protyle?.block?.rootID === rootID)?.protyle;
    }

    function rootIDOf(blockID: string): string {
        return allRows.find(r => r.id === blockID)?.root_id ?? blockID;
    }

    // 「在编辑器中显示」：同文档滚动+内核闪烁类（bgFade 同款 1024ms）；跨文档/窗口化
    // 渲染不在 DOM 时退化为 openTab cb-get-hl（内核 uri.ts 跳转链同款 action 组）
    async function showBlockInEditor(blockID: string) {
        const el = editorOfRoot(rootIDOf(blockID))?.wysiwyg?.element?.querySelector(`[data-node-id="${blockID}"]`);
        if (el) {
            el.scrollIntoView({ block: "center" });
            el.classList.add("protyle-wysiwyg--hl");
            setTimeout(() => el.classList.remove("protyle-wysiwyg--hl"), 1024);
            return;
        }
        await OpenSyFile2(plugin, blockID, null, ["cb-get-hl", "cb-get-context", "cb-get-rootscroll"]);
    }

    // 单击轻联动：编辑器对应块淡高亮（不滚动不抢焦点）；文档未开则静默（轻语义，不 toast 打扰）
    function softLinkEditorBlock(blockID: string) {
        editorOfRoot(rootIDOf(blockID))?.wysiwyg?.element
            ?.querySelectorAll(`[data-node-id="${blockID}"]`)
            .forEach(el => {
                el.classList.remove("tomato-graph-flash");
                void (el as HTMLElement).offsetWidth; // 重启动画
                el.classList.add("tomato-graph-flash");
                setTimeout(() => el.classList.remove("tomato-graph-flash"), 2000);
            });
    }

    async function copyText(text: string) {
        if (await copyToClipboard(text)) siyuan.pushMsg(tomatoI18n.已复制, 2000);
    }

    // 图上右键菜单单例通道（三期 □1）：independent Menu 每次新建不清旧——右键不产
    // click 事件，旧实例的 window click 捕获关闭监听等不到触发，元素悬在 body=
    // 「连点右键叠一排菜单」根因。开新前显式关旧（close()=摘监听+element.remove，
    // 双拆兜底）；节点/边两 handler 共用同一单例
    let liveCtxMenu: Menu | null = null;
    function closeLiveCtxMenu() {
        if (!liveCtxMenu) return;
        try { liveCtxMenu.close(); } catch { /* 已被全局点击拆过的二次拆除 */ }
        liveCtxMenu.element?.remove?.();
        liveCtxMenu = null;
    }

    // 节点右键：思源原生 Menu（independent 第三参防单例被同次冒泡清空；open 包 setTimeout）
    function handleNodeContextMenu({ event, node }: { event: MouseEvent; node: Node }) {
        event.preventDefault();
        closeLiveCtxMenu();
        const d = node.data as any;
        const menu = new (Menu as any)("tomatoGraphNodeMenu", undefined, true) as Menu;
        liveCtxMenu = menu;
        menu.addItem({ label: tomatoI18n.在编辑器中显示, click: () => void showBlockInEditor(node.id) });
        menu.addItem({ label: tomatoI18n.打开所在文档, click: () => void OpenSyFile2(plugin, node.id) });
        menu.addSeparator();
        // ¶ 大节点无展开/折叠语义（期7 永不多节点化）；isParaMerged 恒无子树角标分支
        if (!d.isParaMerged) {
            if (d.collapsed) {
                menu.addItem({ label: tomatoI18n.展开此节点, click: () => void d.toggle?.() });
            } else if (d.hasChildren) {
                menu.addItem({ label: tomatoI18n.折叠此节点, click: () => void d.toggle?.() });
            }
        }
        menu.addSeparator();
        menu.addItem({ label: tomatoI18n.复制块ID, click: () => void copyText(node.id) });
        // 块引格式同 Tag2RefBox 先例 ((id "text"))；文本剥引号防 IAL/引用语法串味，50 字封顶
        const refText = String(d.fullText ?? d.label ?? "").replace(/["']/g, "").slice(0, 50).trim() || node.id;
        menu.addItem({ label: tomatoI18n.复制为引用, click: () => void copyText(`((${node.id} "${refText}"))`) });
        gbLog("graph.node_menu", `id=${node.id.slice(0, 8)} para=${!!d.isParaMerged} collapsed=${!!d.collapsed}`);
        hidePanelTip(); // 右键时鼠标仍悬停节点，mouseleave 不触发（vision P2）；对齐内核「弹菜单即清 tooltip」
        setTimeout(() => menu.open({ x: event.clientX, y: event.clientY }), 0);
    }

    // 主动重查当前文档数据（changeDoc 伪造 protyle 两字段驱动，e2e 同款配方；
    // 供删引用后即时刷新，不等 3s 轮询）
    async function refreshCurrentDoc() {
        if (!lastDocID) return;
        await changeDoc({ title: { editElement: { textContent: currentDocName } }, block: { rootID: lastDocID } } as unknown as IProtyle);
    }

    // 删引用：ondelete 同款 removeRefs 双向，但用原始端点真块（折叠重定向防呆）
    async function deleteRefEdge(s: string, t: string) {
        await siyuan.getBlockDOM(s).then(({ dom }) => removeRefs(dom, t, false));
        await siyuan.getBlockDOM(t).then(({ dom }) => removeRefs(dom, s, false));
        gbLog("graph.edge_delete", `${s.slice(0, 8)}→${t.slice(0, 8)}`);
        await refreshCurrentDoc();
    }

    // 边右键（引用边）：复制锚文本/删除此引用(confirm)；结构边=背景板无右键语义
    function handleEdgeContextMenu({ event, edge }: { event: MouseEvent; edge: Edge }) {
        const d = (edge as any).data;
        if (!d?.isRef) return;
        event.preventDefault();
        closeLiveCtxMenu();
        const menu = new (Menu as any)("tomatoGraphEdgeMenu", undefined, true) as Menu;
        liveCtxMenu = menu;
        menu.addItem({ label: tomatoI18n.复制锚文本, click: () => void copyText(String(edge.label ?? "")) });
        menu.addSeparator();
        menu.addItem({
            label: tomatoI18n.删除此引用,
            click: () => confirm(tomatoI18n.删除引用确认标题, tomatoI18n.删除引用确认文案, () => void deleteRefEdge(d.origSource, d.origTarget)),
        });
        hidePanelTip(); // 同节点菜单（vision P2：右键悬停残留）
        setTimeout(() => menu.open({ x: event.clientX, y: event.clientY }), 0);
    }

    async function ondelete({
        nodes,
        edges,
    }: {
        nodes: Node[];
        edges: Edge[];
    }) {
        for (const edge of edges) {
            // 折叠态引用边端点被重定向过 → 用原始端点删真块引用（GraphBox 折叠机制约束：拖拽建引用/删边删引用不回归）
            const s = (edge as any).data?.origSource ?? edge.source;
            const t = (edge as any).data?.origTarget ?? edge.target;
            await siyuan
                .getBlockDOM(s)
                .then(({ dom }) => removeRefs(dom, t, false));
            await siyuan
                .getBlockDOM(t)
                .then(({ dom }) => removeRefs(dom, s, false));
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
    // 点击模型（期4）：单击=选中+编辑器轻联动（不滚动不抢焦点）；Alt+点击或双击=滚动到块。
    // 双击走 GraphNode 组件 data.dblclick 通道（Svelte Flow 无 nodedoubleclick 事件）。
    // graphClick2Locate VIP 门禁退役（导航刚需免费，语义本就不对）。
    async function nodeclick({ node, event }: { node: Node; event: MouseEvent }) {
        if ((event as PointerEvent).altKey) {
            await OpenSyFile2(plugin, node.id);
        } else {
            softLinkEditorBlock(node.id);
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
            {nodeTypes}
            minZoom={0.1}
            fitView
            {ondelete}
            {onconnect}
            onnodecontextmenu={handleNodeContextMenu}
            onedgecontextmenu={handleEdgeContextMenu}
            onedgeclick={(event) => {
                event;
            }}
            onnodeclick={nodeclick}
            onnodedragstop={onNodeDragStop}
        >
            <Controls showLock={true} />
            <Background gap={25} size={1.2} />
            {#if $nodes.length >= 30}
                <MiniMap pannable zoomable width={120} height={90} nodeColor={minimapNodeColor} />
            {/if}
            {#if graphMode === "skeleton"}
                <Panel position="top-center">
                    <div class="graph-skeleton-notice">
                        <span>{tomatoI18n.骨架提示.replace("%1", `${graphStat?.cnt ?? 0}`).replace("%2", formatCharsVolume(graphStat?.totalLen ?? 0, tomatoI18n.lang))}</span>
                        <button class="b3-button b3-button--outline" onclick={onFullLoad}>{tomatoI18n.完整加载}</button>
                    </div>
                </Panel>
            {/if}
            {#if graphManualRefresh}
                <Panel position="top-right">
                    <div class="graph-skeleton-notice">
                        <span>{tomatoI18n.自动刷新已暂停}</span>
                        <button class="b3-button b3-button--outline" onclick={onManualRefresh}>{tomatoI18n.刷新}</button>
                    </div>
                </Panel>
            {/if}
        </SvelteFlow>
        {#if graphLoading}
            <div class="graph-loading-mask">
                <div class="graph-loading-card">
                    <span class="graph-loading-spin"></span>
                    <span>{tomatoI18n.图加载中}</span>
                </div>
            </div>
        {/if}
        <GraphControl {dock} {plugin} />
    </SvelteFlowProvider>
</div>

<style>
    .container {
        position: relative;
        min-width: 200px;
        min-height: 200px;
    }
    /* 期3 层级治理（替换历史 edges z-index:1001 全局提级）：edges 回 xyflow 默认层（节点之下）。
     * 边标签不提级（spec §1 图层序「边标签 < 节点」：标签被节点盖住的概率已由 labelT
     * 0.22 起步错开大降，提级会反压节点文字——vision P1）；panel/loading 用低值相对排序，
     * 远离内核弹层计数器安全档 10（AGENTS「插件常驻浮层 z-index 安全档」） */
    /* Handle 去默认黑方块：6px 灰圆点退到节点之后（spec §0.2），hover/选中现主色 */
    .container :global(.svelte-flow__handle) {
        width: 6px;
        height: 6px;
        border: none;
        border-radius: 50%;
        background: var(--b3-theme-on-surface-light);
        opacity: 0.6;
        min-height: 0;
        min-width: 0;
    }
    .container :global(.svelte-flow__node:hover) :global(.svelte-flow__handle),
    .container :global(.svelte-flow__node.selected) :global(.svelte-flow__handle) {
        background: var(--b3-theme-primary);
        opacity: 1;
    }
    /* 网格点对齐思源边线色（spec §0.3） */
    .container :global(.svelte-flow__background pattern circle) {
        fill: var(--b3-border-color);
    }
    /* Controls 主题化：--b3 全变量，明暗零维护（spec §11） */
    .container :global(.svelte-flow__controls) {
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
    .container :global(.svelte-flow__controls-button) {
        background: var(--b3-theme-surface);
        border-bottom: 1px solid var(--b3-border-color);
        color: var(--b3-theme-on-surface);
        width: 26px;
        height: 26px;
    }
    .container :global(.svelte-flow__controls-button:hover) {
        background: var(--b3-list-hover);
    }
    /* MiniMap（spec §10）：surface 底+边框+6px 圆角；遮罩 80% surface */
    .container :global(.svelte-flow__minimap) {
        background: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
    .container :global(.svelte-flow__minimap-mask) {
        fill: color-mix(in srgb, var(--b3-theme-surface) 80%, transparent);
        stroke: var(--b3-border-color);
    }
    .graph-skeleton-notice {
        display: flex;
        flex-wrap: wrap; /* 窄面板（dock ~235px）下长文案+按钮自动折行，nowrap 会两端溢出被裁（vision P0） */
        align-items: center;
        gap: 4px 8px;
        max-width: calc(100% - 16px);
        min-width: 150px; /* 防 shrink-to-fit 收缩成 5 行高塔遮挡画布（vision P2 复审） */
        padding: 4px 10px;
        border-radius: var(--b3-border-radius-b);
        background: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        box-shadow: var(--b3-point-shadow); /* 提示条非对话框，轻投影够（spec §13） */
        white-space: normal;
    }
    .graph-loading-mask {
        position: absolute;
        inset: 0;
        z-index: 7; /* 压过 panel(6)/edgelabel(5)，仍在内核弹层计数器安全档 10 之下 */
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--b3-theme-background) 72%, transparent);
        pointer-events: auto; /* 构建期间挡住底层画布输入，防中途拖拽/点按造成状态错位（vision P2） */
    }
    .graph-loading-card {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: var(--b3-border-radius-b);
        background: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        color: var(--b3-theme-on-surface);
        font-size: 13px;
    }
    .graph-loading-spin {
        width: 14px;
        height: 14px;
        border: 2px solid var(--b3-border-color);
        border-top-color: var(--b3-theme-primary);
        border-radius: 50%;
        animation: graph-spin 0.8s linear infinite;
    }
    @keyframes graph-spin {
        to {
            transform: rotate(360deg);
        }
    }
    /* 提示条 Panel 压过边标签层(5)即可（原 1002 随 edges 1001 一并退役） */
    .container :global(.svelte-flow__panel) {
        z-index: 6;
    }
    /* 期4 定位脉冲：主色描边两轮渐隐（0.75s×2=1.5s），挂在 .svelte-flow__node 容器 */
    .container :global(.tomato-graph-pulse) {
        animation: tomato-graph-node-pulse 0.75s ease-in-out 2;
    }
    :global {
        @keyframes tomato-graph-node-pulse {
            0% {
                box-shadow: 0 0 0 3px var(--b3-theme-primary);
            }
            100% {
                box-shadow: 0 0 0 3px transparent;
            }
        }
    }
</style>
