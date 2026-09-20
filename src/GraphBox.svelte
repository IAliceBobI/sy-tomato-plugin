<script lang="ts">
    import { onDestroy, onMount, tick } from "svelte";
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
    import { getData, getGraphStructure, precheckDocSize, graphFullLoadedBigDocs } from "./GraphBox";
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
        graphShowAllViewModes,
        graphShowNumbers,
    } from "./libs/stores";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { copyToClipboard } from "./libs/domUtils";
    import { debugLog } from "./libs/logUtils";
    import { pickGraphChannel, containerLabel } from "./libs/graphSkeleton";
    import {
        buildTreeIndex, initialCollapsedRows, computeVisible, filterEdges, expandAncestors,
        serializeCollapsed, parseCollapsed, mergeCollapsedOnRefresh,
        headingRangeOf, showLevelToExpandLevel, settingShowLevelToExpand, visibleHeadingLevel,
        type ExpandLevel, type GraphEdgeSpec, type RenderEdge,
    } from "./libs/graphCollapse";
    import { legacyLayoutConvergence } from "./libs/graphLayout";
    import { mergeParagraphChains, mergeStructureLeafRuns, joinParaText } from "./libs/graphParaMerge";
    // graphrelayout □9：内容块胶囊（标签/摘要/hr 过滤纯函数）+hover 预览浮层管理
    import {
        contentPillSpec, paraPillSpec, paraRunPreview, pillEstWidth,
        filterHrGraph, PARA_PILL_W, PILL_H, type PillWords,
    } from "./libs/graphPill";
    import { ensureGraphPreview, hideGraphPreview } from "./libs/graphPreview";
    import { redirectLinksToContainers, numberHeadingChain, chapterAnchorMap, structureRowsFromOutline, type StructureInfo } from "./libs/graphStructure";
    import GraphTreemap from "./GraphTreemap.svelte";
    import { defaultGraphMode, resolveArchivedGraphMode, type GraphViewMode } from "./libs/graphViewMode";
    import { fetchDocMarks, markTreeInfo, markAwareCollapsed, marksKeepSet, flatMarkContainers, markCssOf, stripMarkSyntax, type DocMarks, type MarkTreeInfo } from "./libs/graphMarks";
import { focusNeighborhood, noStructureRows } from "./libs/graphFocus";
    import { tomatoI18n } from "./tomatoI18n";

    interface ProposType {
        plugin: Plugin;
        dock: { element: HTMLElement; data: any };
        viewModeGroupID: string;
        /** graphmind □4：「显示到第几级」选择器控件 ID（dock/浮窗各自生成，按 ID 绑定；
         *  空串=宿主未提供该控件（历史挂载面兜底）——级数功能整链静默不挂 */
        showLevelSelectID?: string;
        /** 画布尺寸策略（graphfloat □3）：dock=视口减法（左栏面板延伸到视口底，原有行为）；
         *  host=量父容器填满（悬浮面板正文容器，flex:1 有确定尺寸）。dock.data 挂载面两通道
         *  同构——悬浮窗传伪 dock { element: 面板正文容器, data: 独立暴露对象 } 即第二实例 */
        fit?: "dock" | "host";
        /** 图内导航回调（gfloatnav）：双击/Alt点/右键跳转/树双击/标记叶单击等「跳去读」
         *  动作完成后触发——悬浮图实例传=跳转收面板（大纲式闭环）；dock 实例缺省=不调 */
        onNavigate?: () => void;
    }
    let { plugin, dock, viewModeGroupID, showLevelSelectID = "", fit = "dock", onNavigate }: ProposType = $props();
    let colorMode: ColorMode = $state("system");
    let canvas: HTMLElement;
    const nodes = writable<Node[]>([]);
    const edges = writable<Edge[]>([]);
    const snapGrid: [number, number] = [25, 25];
    // graphmind □2：横排首轮估算宽与 .gn max-width 300 同步（GraphNode 注释互指；measured 精修接管）
    const nodeWidth = 300;
    const nodeHeight = 36;
    let canvasHeight: number = $state();
    let canvasWidth: number = $state();
    let lastDocID = $state.raw("");
    // □2 闪烁治理指纹：同文档且 updated 未变 = 图数据必然未变，changeDoc 整次短路
    // （「打开所在文档」新页签/重复 loaded 事件/轮询必刷的白跑全被挡在构建前，零闪烁零成本）
    let lastFingerprint = "";
    // □4 档位会话记忆（globalThis 跨插件重载存活——deploy/热重载重挂组件不丢）：读档最优先，
    // 兜 setBlockAttrs 写后立读窗口的缓存回填（读回「无该键」旧 IAL → 档位被打回默认+指纹
    // 短路锁死的震荡链，坑⑧同族）。写点=setGraphMode/onFullLoad 落笔处。
    // review P2-5（有意为之）：memo 优先于 IAL=会话语义——他窗/属性面板手改 custom-graph-mode
    // 本窗不感知（切走再切回仍读本窗记忆），低频可辩护
    const graphModeMemo: Map<string, GraphViewMode> = ((globalThis as any).__tomatoGraphModeMemo ??= new Map());
    let currentDocName = $state.raw(""); // 完整加载时 getData 需要文档名（根节点 label；□3 起 treemap props 消费）
    let stop = false;
    // graphrelayout □2 四态退役（bear 拍板恒 LR 向右生长）：layoutForm/tb/vlr/vtb 整族退役，
    // 树生长 rankdir 恒 "LR"、文字恒横排；旧档（custom-graph-layout 非 lr/isVertical 非空）
    // 开图时 convergeLayoutForm 读旧写新收敛（graphLayout.ts legacyLayoutConvergence）
    const edgeTypes = { labeledEdge: EdgeWithLabel };
    const nodeTypes = { tomatoNode: GraphNode, tomatoGroup: GraphGroup };

    // graphbox 期2 折叠机制：完整树数据只建一次，$nodes/$edges 只装可见子图——
    // 折叠/展开 toggle 重算可见集（computeVisible/filterEdges）+局部重布局，折叠态图永远小、dagre 永远快
    let allRows: Block[] = $state.raw([] as Block[]); // □3 起 treemap props 消费（raw=引用替换零深代理）
    let allLinks: GraphEdgeSpec[] = [];
    // treemap □4：结构态原始引用边（dedupeLinks 产物、redirect 重定向前——叶子端点粒度
    // 保留，GraphTreemap 聚焦匹配消费；raw=引用替换零深代理，与 allRows 同款）
    let structRefLinks: GraphEdgeSpec[] = $state.raw([] as GraphEdgeSpec[]);
    let labels = new Map<string, string>();
    let collapsedSet = new Set<string>();
    // 期7 ¶×N 重设计：段落链在数据预处理层整链合并（链成员从 allRows 剔除、边端点重定向链头）
    let paraByText = new Map<string, string>();  // 链头 id → 全文合并（截断后）
    let paraCount = new Map<string, number>();   // 链头 id → 链内块数（¶×N badge）
    let paraRedirect = new Map<string, string>();// 链成员 id → 链头 id（locateID 定位链中段重定向）
    // graphrelayout □3：structure 档合并链成员序（链头 id → 链成员 id 数组，mergeStructureLeafRuns
    // 产物）——徽标展开叶子循环渲染 ¶ 合并卡消费（SQL 通道 content 补齐后兜底重拼全文）；
    // full 档文本在 applyRowsAndLinks 预拼完成不消费此表，切档全量替换自然清退
    let paraRunMembers = new Map<string, string[]>();
    // graphrelayout □9：¶ 合并框双态（graphmind □3 paraExpanded 收起/展开）退役——bear 拍板
    // 「内容块收成单行胶囊」，¶×N 恒单行胶囊、全文走 hover 预览浮层（graphPreview.ts），
    // 展开交互链（paraExpanded 集/toggleParaMerge/paraExpand·onParaToggle 数据）整族清退

    // graphbox □2 通道语义反转（2026-09-17）：渲染默认=structure（结构优先：容器树+徽标），
    // full=显式切换档（会话记忆 graphFullLoadedBigDocs=用户对该文档选过全量）。旧 skeleton
    // 骨架标题树通道退役（结构 SQL 通道覆盖其能力且更轻）。
    // graphmark 期1：档位=面板头部四钮直切；「只挂标记块」checkbox（luji0918 □2）随视图
    // 菜单退役——存档迁移见 resolveArchivedGraphMode，标记感知展开期3 落地。
    // □4（2026-09-20 bear 拍板）：默认档翻转=有标记的 doc 优先 marks 档（settleGraphMode，
    // 无手动档且首轮标记就绪后定）；marks 档标记容器全摊开（flatMarkContainers）
    let graphMode: GraphViewMode = $state("structure");
    // □5 标记模式：标记块集合（graphmark 期3 起双档消费——marks 档路径过滤+structure
    // 档标记感知展开/●N 角标；raw=引用替换传导）。SWR 语义：缓存先显（切档零闪烁）+
    // 每次进档/开档后台重拉刷新（划新线后重拉即新数据）。完成判据=marksReqID 末者胜出
    // （fetchDocMarks 毫秒级远快于 changeDoc 全链——lastDocID 秒级后才落恒假=首屏卡死
    // 形态，treemap □5 实锤）。fresh 判据=marksFP 键集指纹：无变化不重渲染（防 SWR
    // 重拉引发无谓 relayout 视口跳动）；structure/marks 档外不落（防瞬时污染 treemap/full）
    let docMarks: DocMarks | undefined = $state.raw(undefined);
    const marksCache = new Map<string, DocMarks>();
    let marksReqID = 0;
    let marksSettledDoc = $state("");  // 拉取完成的文档（空态卡判据——加载中不闪空态；模板消费须 $state）
    let marksFP = "";                  // 标记键集指纹（SWR 无变化短路，脚本内消费）
    // 期3 标记感知态：结构树 × 标记集 推导产物（构建时推导；marks 重拉时重算）
    let markCtx: MarkTreeInfo | null = null;
    let markShowContainers = new Set<string>(); // 摊开标记叶卡的容器（会话态不持久化）
    // □3 评审 P1 配套：已自动摊开过的标记容器（会话记忆）——新打标容器首次出现自动摊开
    // （□4「标记的都得展开」在轻通道同款生效），用户手动收起（toggleMarkCards delete）
    // 不退出本集=后续重算不打回；冷载/重建全摊开路径整集对齐
    let markSeenContainers = new Set<string>();
    let marksKeep = new Set<string>();          // marks 档渲染过滤集（标记路径子图）
    // 期4 聚焦模式：目标块一跳邻域高亮+其余淡化（graphFocus 纯函数）。容器聚焦态类走
    // 模板 class: 响应式（$state.raw 目标切换即挂/摘）；节点/边邻域类走 DOM classList
    // 切换不进节点 data（防重渲染闪烁），节点重建（折叠/徽标/relayout）后
    // scheduleFocusRefresh 补刷；目标消失（折叠收走/切档/切文档）自动退出全景。
    // 不重布局不挪图
    let focusTarget = $state.raw("");
    let focusNb = new Set<string>();
    // 期4 无结构空态（判据=noStructureRows 纯函数）：structure 档纯平铺段落文档中央
    // 提示卡；「知道了」按文档会话态收起（数组重赋值触发——$state Set add 不重渲染）
    let structEmptyDismissed = $state<string[]>([]);
    async function ensureMarks(docID: string): Promise<void> {
        if (!docID) return;
        const req = ++marksReqID;
        docMarks = marksCache.get(docID) ?? new Map();
        try {
            const m = await fetchDocMarks(docID);
            if (req !== marksReqID) return;
            marksCache.set(docID, m);
            marksSettledDoc = docID;
            // □4：数据先落再判档（docMarks/marksFP 与 graphMode 解耦——默认档决策已挪到
            // 标记就绪之后，拉取期 graphMode 可能仍是旧文档档位；treemap/full 不消费标记，
            // 数据落了也无渲染面污染）。重渲染仍限 structure/marks 且同文档结构就绪
            const fp = [...m.keys()].sort().join(",");
            const changed = fp !== marksFP;
            marksFP = fp;
            docMarks = m;
            if (changed && (graphMode === "structure" || graphMode === "marks")
                && structInfo && structDocID === docID && allRows.length) {
                refreshMarkCtx();
                applyCollapsedView();
                await relayout(false); // 节点集变更（过滤/角标/卡）须重排；refit=false 保视口
            }
        } catch (e) {
            gbLog("graph.marks_err", `${e}`);
        }
    }
    /** 标记感知态重算（纯内存，不渲染）：markCtx/过滤集/摊开容器清退+¶ 链四表重算
     *  （□3 评审 P1：外部打标轻通道同样须断链重分组，否则新标记段滞留合并卡且其标记卡
     *  被徽标循环 pushedLeaves 防重集吞掉）——折叠集不动（会话折叠态保持，listfix 纪律）；
     *  调用方自责 applyCollapsedView */
    function refreshMarkCtx() {
        if (!structInfo || !allRows.length) return;
        markCtx = markTreeInfo(allRows, structInfo, docMarks);
        marksKeep = marksKeepSet(allRows, markCtx);
        // 摊开容器：新出现的标记容器自动摊开（□4「标记的都得展开」轻通道同款生效——
        // 外部 setBlockAttrs 新打标不触发全量重建，若只清退不摊新，其标记卡永不出现）；
        // 已见容器保持现状（用户手动收起不被打回）；最后清退已删卡容器
        spreadNewMarkContainers();
        markShowContainers = new Set([...markShowContainers].filter(id => markCtx?.cards.has(id)));
        recomputeParaRuns();
    }
    /** 新标记容器首见自动摊开（markSeenContainers 会话记忆，冷载/重建/轻通道三路同纪律） */
    function spreadNewMarkContainers() {
        for (const cid of markCtx?.cards.keys() ?? []) {
            if (!markSeenContainers.has(cid)) {
                markSeenContainers.add(cid);
                markShowContainers.add(cid);
            }
        }
    }
    /** □4 默认档定档（bear 2026-09-20 拍板）：手动档（会话 memo/IAL 存档）优先不动；
     *  无手动档 → defaultGraphMode（有标记 marks/无标记 structure）——**必须喂首轮就绪的
     *  marksCache**（ensureMarks await 完成后调用，防闪档：首渲染即终态档）；marks 档
     *  空标记守卫三路同防（memo/存档/默认命中 marks 而 0 标记=空图，回落 structure）。
     *  sameDoc 不经本函数（同文档刷新不打断在档 UX——索引窗假阴性误逐出 marks 档） */
    function settleGraphMode(target: GraphViewMode | null, docID: string): GraphViewMode {
        const size = marksCache.get(docID)?.size ?? 0;
        const settled = target ?? defaultGraphMode(graphStat?.cnt ?? 0, size > 0);
        return settled === "marks" && size === 0 ? "structure" : settled;
    }
    // —— 期4 聚焦模式（graphFocus 邻域纯函数消费）——
    /** 邻域类刷进 DOM：容器挂聚焦态类，节点/边按邻域集挂 tomato-graph-nb、中心挂
     *  nb-center（主色描边）。边=两端都在邻域才亮（兄弟经父的连接路径可见）。 */
    function refreshFocusClasses() {
        if (!canvas) return;
        const nodeArr = $nodes, edgeArr = $edges;
        if (focusTarget && !nodeArr.some(n => n.id === focusTarget)) {
            clearFocus(); // 目标已不在图上（被折叠收走/档内漂移）——自动退出全景
            return;
        }
        focusNb = focusTarget
            ? focusNeighborhood(
                focusTarget,
                nodeArr.map(n => ({ id: n.id, parentId: n.parentId })),
                edgeArr.map(e => ({ source: e.source, target: e.target, isRef: !!(e.data as any)?.isRef })),
            )
            : new Set<string>();
        for (const el of canvas.querySelectorAll<HTMLElement>(".svelte-flow__node")) {
            const id = el.getAttribute("data-id") ?? "";
            el.classList.toggle("tomato-graph-nb", focusNb.has(id));
            el.classList.toggle("tomato-graph-nb-center", id === focusTarget);
        }
        // review P2：边按 id 建索引再查（巨书全量档数千边，DOM 边 × find 是数十 ms 单帧）
        const edgeById = new Map(edgeArr.map(e => [e.id, e]));
        for (const el of canvas.querySelectorAll<HTMLElement>(".svelte-flow__edge")) {
            const e = edgeById.get(el.getAttribute("data-id") ?? "");
            el.classList.toggle("tomato-graph-nb", !!e && focusNb.has(e.source) && focusNb.has(e.target));
        }
    }
    let focusRaf = 0;
    /** rAF 合并补刷：applyCollapsedView/relayout 写 store 后 DOM 下一帧才重建，直刷扑空 */
    function scheduleFocusRefresh() {
        if (focusRaf) return;
        focusRaf = requestAnimationFrame(() => { focusRaf = 0; refreshFocusClasses(); });
    }
    function setFocusNode(id: string, mode: "toggle" | "set" = "toggle") {
        if (focusTarget === id) {
            // toggle=同目标再按退出全景（点空白/命令再按同块）；set=兜底重定向撞上当前
            // 聚焦点（聚焦其子块上爬到此）=保持聚焦不动作（review P1-1）
            if (mode === "toggle") clearFocus();
            return;
        }
        focusTarget = id;
        refreshFocusClasses();
        gbLog("graph.focus_on", `node=${id.slice(0, 8)} nb=${focusNb.size}`); // 成功分支（目标消失路径 refreshFocusClasses 已自动清+单独留痕）
    }
    function clearFocus() {
        if (!focusTarget) return;
        gbLog("graph.focus_off", "");
        focusTarget = "";
        refreshFocusClasses();
    }
    let graphStat: { cnt: number; totalLen: number } | null = $state(null);
    let graphLoading = $state(false);
    let graphManualRefresh = $state(false);
    // □2 结构态：叶子归属/聚合（buildStructureInfo 或 SQL 通道产物）；leafShowContainers=
    // 点徽标展开的容器（会话态不持久化——与折叠持久化错键语义，第一版不混用）；
    // leafContent=SQL 通道叶子按需正文（DOM 通道叶子正文在 directLeaves 的 Block 上）
    let structInfo: StructureInfo | null = $state.raw(null); // □3 起 treemap props 消费（raw=引用替换零深代理）
    // 结构态数据所属文档：lastDocID 在构建成功后才落（失败路径不切档），构建期徽标判定用本值
    // （期3 起空态卡模板消费=判标记拉取与结构数据同文档，$state 化）
    let structDocID = $state("");
    // 期4 无结构空态派生：structure 档+结构数据同文档+无容器行+未收起（docMarks 计数
    // 在模板按 marksSettledDoc 守卫——加载中不出「只看标记」按钮；声明序在
    // structInfo/structDocID 后=derived 依赖序，前向引用 svelte-check TS2448）
    const noStruct = $derived(
        graphMode === "structure" && !graphLoading && !!lastDocID && structInfo !== null
        && structDocID === lastDocID && !structEmptyDismissed.includes(lastDocID)
        && noStructureRows(allRows, lastDocID),
    );
    // □4 章节编号独立字段（GraphNode 弱化渲染浅灰前缀；labels 不再拼接）
    let structNumbers = new Map<string, string>();
    let leafShowContainers = new Set<string>();
    let leafContent = new Map<string, string>();
    // □9 SQL 通道叶子按需 markdown 列（表格行数/媒体文件名胶囊判定；与 leafContent 同
    // 生命周期，DOM 通道叶子消费自身字段不走此表）
    let leafMarkdown = new Map<string, string>();
    // □2 小文档全量数据缓存：结构⇄全量切换零重建（大文档走 confirm 完整加载链不缓存）
    let fullRowsCache: { rows: Block[]; links: Ref[] } | null = null;

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

    // graphmind □2 P1→P0（UI 验收两轮修复）：fitView 可读下限 + 最优可见带。
    // 第一轮 P1：fit 计算值被 minZoom 0.35 钳住（实测 scale 0.35），徽章 11px 渲染 6px
    // 目视不可辨——修=可读下限 0.8（评审 0.9 验证可读的近值）。第二轮 P0：打开文档链路
    // locateID($nodes.at(0)) 的 setCenter(1.2) 把根居中，而 LR tidy 树根在垂直中位——
    // 1.2 视口只覆盖根列（实测 2/34 节点相交、面板 80~90% 空白）=矫枉过正。
    // graphmind □7fix（四场景终检 P1 清零）：上述「0.8 可读下限+最优可见带」策略整体退役，
    // 统一改真 fitView（整树入画布、中心对齐）。终检实锤四病：①scale 恒 0.8 不按内容收缩
    // （S1 34 节点 25 个在面板外、S3 16 节点标记叶卡右缘外）；②扫描带「cnt > bestN」严格
    // 大于=全树入带时首采样带（c=lo 极值带）恒胜，内容被推到视口边（S4 小图垂直贴底，
    // ty≈vh/2+0.8·bandW/2 实算吻合——期3 注释宣称已修的形态复发）；③恒含根约束带在大树
    // 下够不到核心内容（S2 31 个合并框全部在屏上方外）。可读性取舍翻转：全树可见优先，
    // 细节阅读靠 minimap（全量档）+用户缩放（minZoom prop 0.1→0.02 放开巨树真 fit 下限，
    // wheel 缩出依然自由）；maxZoom 1 封顶防小图放大失当。locateID 通道本体不动
    // （编辑器块→图定位 GraphBox.ts locateNode 消费，显式定位 setCenter 1.2 语义不变）
    const FIT_PAD = 0.15;
    const FIT_MIN = 0.02;
    function fitReadable() {
        const vf = data();
        if (!vf?.fitView) return;
        const tops = $nodes.filter(n => !n.parentId);
        if (!tops.length) return;
        // _fitAt 就地显式设置（5s 补跑窗锚点；GraphControl 桥层对每笔 fit 也会设——
        // 此处冗余但自洽：fitReadable 不依赖桥层实现细节）
        (data() as any)._fitAt = Date.now();
        // duration 0=终态确定无动画（防与定位链路 setCenter 动画交错——在档坑）
        void vf.fitView({ padding: FIT_PAD, duration: 0, minZoom: FIT_MIN, maxZoom: 1 });
    }

    // 期2 P2 留观修复（期3 精修）：小图折叠首屏垂直贴下部=fitView 跑在容器尺寸就绪前——
    // 主动 fitView 后 5s 内容器尺寸变化（dock 面板展开/setCanvasSize 生效）后防抖重跑 fitView；
    // 窗口外不打扰（用户手动缩放不被打回）。锚点=_fitAt（fitView 时刻）而非 lastLayoutAt
    // （后者在 relayout 末尾才写，首轮尺寸变化的 effect 先跑时恒为 0=永跳过，dev 实锤沉底）
    // graphmind □7fix：补跑同走 fitReadable（真 fit 统一语义）
    $effect(() => {
        if (!canvasHeight || !canvasWidth) return;
        const fitAt = (data() as any)?._fitAt ?? 0;
        if (!fitAt || Date.now() - fitAt > 5000) return;
        const t = setTimeout(() => {
            fitReadable();
        }, 300);
        return () => clearTimeout(t);
    });

    // https://svelteflow.dev/examples/nodes/easy-connect
    onDestroy(() => {
        // □9 评审 P2：hover 中以无 mouseleave 路径关面板（快捷键 toggle dock/悬浮图程序化
        // 关闭）时胶囊 DOM 拆除不派发 mouseleave——图视图任一实例卸载即收浮层（浮层单例
        // 语义一致；组件卸载链=index.ts destroyGraphPreview 整体拆除）
        hideGraphPreview();
    });
    onMount(() => {
        // □9：hover 预览浮层单例预取（首个胶囊 hover 零延迟；卸载链=index.ts destroyGraphPreview）
        ensureGraphPreview();
        // treemap □2 vision P0：主题热切换后画布色滞留（colorMode 此前只在切文档时从
        // appearance config 刷新）——MutationObserver 跟 html[data-theme-mode]（3.8.3 判据）
        const themeObserver = new MutationObserver(() => {
            const m = document.documentElement.getAttribute("data-theme-mode");
            const next: ColorMode = m === "dark" ? "dark" : m === "light" ? "light" : "system";
            if (next !== colorMode) colorMode = next;
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme-mode"] });
        data().setCanvasSize = () => {
            if (fit === "host") {
                // 悬浮面板通道：canvas 父级（面板正文容器）flex:1 有确定尺寸，量自身填满。
                // ⚠面板 display:none 期间宿主不得调本函数（测量归零→stop 误置→changeDoc
                // 早退锁死），宿主只在 open 态调用
                const host = canvas.parentElement;
                const w = host?.clientWidth ?? 0;
                const h = host?.clientHeight ?? 0;
                canvas.style.width = `${w}px`;
                canvas.style.height = `${h}px`;
                stop = w < 10 || h < 10;
                return;
            }
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
        // 期3：本组件外打标（GraphBox.ts toggleBlockMark）后的通知钩子——标记写不碰
        // updated（指纹短路不含标记集），显式触发 SWR 重拉让 ●N/过滤集即时跟进。
        // graphrelayout □5 起触发面扩容：GraphBox.ts ws 监听对 updateAttrs op（任何块
        // 属性写，含外部通道打标）同调本钩子——退避序列吸收索引窗（6809 实测 09-20：
        // setBlockAttrs→ial 列 2.44s、updateBlock 划线→markdown 列 2.98s 可见；常态
        // 第三发 t≈4.7s 已兜住），第四发 10s=分钟级索引抖动极端态的廉价保险（data-race
        // 家族在档抖幅），位移即停零渲染噪声。
        // review P1：文档身份入口捕获逐轮校验——打标后快速切走再切回，循环不得把
        // 重拉吞成新文档的「指纹位移」假阳性（lastDocID 在 _changeDoc_ 尾部才落，
        // 守卫不能进 ensureMarks 本体）
        data().marksChanged = () => {
            const docID = lastDocID;
            if (!docID) return;
            void (async () => {
                const before = marksFP;
                for (const delay of [0, 1200, 3500, 10000]) {
                    if (delay) await sleep(delay);
                    if (lastDocID !== docID) return; // 已切走：原文档的重拉由切回时的构建承接
                    await ensureMarks(docID);
                    if (marksFP !== before) return;
                }
            })();
        };
        // 期4 聚焦外部入口（快捷键命令在 GraphBox.ts；节点右键菜单在本组件内）：
        // ¶ 链成员重定向链头；折叠子树内先 expandTo 展开祖先；返回是否聚焦成功
        // （false=图上无此块，命令层上爬图内祖先兜底——locateNode 同款配对）
        data().focusNode = async (id: string, mode: "toggle" | "set" = "toggle"): Promise<boolean> => {
            if (!id || graphMode === "treemap") return false;
            const target = paraRedirect.get(id) ?? id;
            if (!$nodes.some(n => n.id === target)) {
                // 折叠子树内：展开祖先链（保视口不 fitView 打回全览——聚焦承诺不挪图）；
                // 写 custom-graph-collapsed 会位移 updated → ws 回流同文档重建打断淡化类，
                // locateID 同款 2.2s 自动刷新抑制窗
                const expanded = await expandTo(target, true);
                if (expanded) (data() as any).suppressAutoRefreshUntil = Date.now() + 2200;
            }
            if (!$nodes.some(n => n.id === target)) return false;
            setFocusNode(target, mode); // toggle=同目标再进退出（命令直连）；set=兜底重定向保持聚焦（review P1-1）
            return true;
        };
        // □4 首挂主动拉：?id= 直开/插件重载后事件空窗（switch-protyle 早于订阅、轮询吃
        // events 单例空窗）曾致面板恒空档——挂载即从 getAllEditor 直取编辑器拉一轮。
        // review P1-1：活动 Wnd 优先（.layout__wnd--active 判据）防分屏下初始化到非焦点
        // 文档；空窗期轮询/openGraphDock 的 events.docID 同空无自愈，选错=错档直到手动切
        if (!lastDocID) {
            const editors = (getAllEditor() as any[]).filter(e => e?.protyle?.block?.rootID && e?.protyle?.title?.editElement?.textContent);
            const p = (editors.find(e => e.protyle.wysiwyg?.element?.closest(".layout__wnd--active")) ?? editors[0])?.protyle;
            if (p) {
                gbLog("graph.mount_pull", `doc=${p.block.rootID.slice(0, 8)}`);
                void changeDoc(p).catch(e => gbLog("graph.mount_pull_err", `${e}`));
            }
        }
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

        // gfloat P2：卸载旗标+时限帽——下方两处 getElementById 自旋环在「元素永不上桌」
        // （卸载竞态/容器异常）时无限空转泄闭包，每次重载泄一条；cleanup 置位即出环，
        // 10s 硬帽兜底 cleanup 未跑到的异常路径
        let disposed = false;
        // graphrelayout □2：顶栏布局形态循环钮整族退役（恒 LR 无形态可切）——原
        // landscapeSwitchBtnID 绑定块（自旋等 DOM+循环切换+图标回显+IAL 落档）随钮删除
        // graphmark 期1：档位平铺按钮组——四钮单击直切（full 钮走 setGraphMode 内的
        // 缓存/确认链，大文档保护不撤）；键盘 Enter/Space 同形态钮一族
        if (viewModeGroupID) {
            (async () => {
                let group: HTMLElement;
                const t0 = Date.now();
                while (!group) {
                    if (disposed || Date.now() - t0 > 10000) return;
                    group = document.getElementById(viewModeGroupID) as HTMLElement;
                    await sleep(1);
                }
                for (const btn of Array.from(group.querySelectorAll<HTMLElement>("[data-graph-mode]"))) {
                    const mode = btn.dataset.graphMode as GraphViewMode;
                    btn.addEventListener("click", () => void setGraphMode(mode));
                    btn.addEventListener("keydown", (ev: KeyboardEvent) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            void setGraphMode(mode);
                        }
                    });
                }
                syncViewModeBtns();
            })();
        }
        // graphmind □4：「显示到第几级」级数选择器——change 即全图收缩/展开到该级
        // （applyShowLevel 重置手动态；档位/回显值由 syncShowLevelUI 按文档动态维护）
        if (showLevelSelectID) {
            (async () => {
                let sel: HTMLSelectElement;
                while (!sel) {
                    sel = document.getElementById(showLevelSelectID) as HTMLSelectElement;
                    await sleep(1);
                }
                sel.addEventListener("change", () => {
                    // graphrelayout □7：「自动」档（自适应最高标题级）即时生效——同显式选级
                    // 语义（重置手动态+持久化+钉回显），换算走 settingShowLevelToExpand
                    if (sel.value === "auto") {
                        void applyShowLevel("auto");
                        return;
                    }
                    const v = parseInt(sel.value, 10);
                    if (Number.isFinite(v) && v >= 1) void applyShowLevel(v);
                });
                syncShowLevelUI();
            })();
        }
        // graphmind □6：视图收敛开关热更——设置面板保存（bind 直写 store）/他端写 petal
        // （热更钩子刷新 store）都经此订阅即时回显/收起 full/treemap 按钮组，无需插件重载
        const unsubAllViewModes = graphShowAllViewModes.subscribe(() => syncViewModeBtns());
        // 期4：openGraphTab 页签通道退役，本组件仅由 dock/浮窗挂载；
        // 原 else 分支（tab 冷启动 setCanvasSize+changeDoc+locateID）随之删除
        return () => {
            disposed = true; // gfloat P2：吹停在途自旋环（见上方 disposed 注释）
            themeObserver.disconnect(); // 插件 reload 卸载时清 observer 防累积
            if (focusRaf) cancelAnimationFrame(focusRaf); // review P2：在途补刷随卸载取消
            unsubAllViewModes(); // graphmind □6：视图收敛开关订阅随卸载退订
        };
    });

    // changeDoc 与 onFullLoad 全量构建共用互斥锁：防止轮询/切文档的重建与「完整加载」交错
    // 把画面刷成 A 文档而状态留 B 文档（2026-09-04 dev 实锤竞态）
    const GRAPH_LOCK = "tomato-graph-box-lock2024-11-4 20:09:58";

    // 返回是否真跑（gfloat review P1-2）：true=持锁执行（含组件内指纹短路——数据未变
    // 也是正确终态）；false=GRAPH_LOCK 被占（ifAvailable 抢锁失败静默放弃）——轮询类
    // 调用方据此决定是否提交 updated 指纹（预提交×锁丢弃=丢一次刷新且不自愈）
    async function changeDoc(protyle: IProtyle, refreshOnly = false): Promise<boolean> {
        return await navigator.locks.request(
            GRAPH_LOCK,
            { ifAvailable: true },
            async (lock) => {
                if (lock && protyle) {
                    await _changeDoc_(protyle, refreshOnly);
                    await sleep(1000);
                    return true;
                }
                return false;
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
        // □9：hover 预览浮层随文档切换清退（胶囊节点已随重建消失，浮层不能悬空残留）
        hideGraphPreview();
        currentDocName = docName;
        // graphrelayout □2 四态退役：旧档收敛读旧写新（fire-and-forget 不阻塞构建；
        // setBlockAttrs 不碰 updated——□5 实锤，指纹短路不 bust；写后下轮零写入）
        void convergeLayoutForm(docID);

        // □2 预检分流（渲染恒=结构优先初始）：小文档 DOM 全量数据源（缓存供切换档零重建）、
        // 大文档 SQL 结构轻通道（绝不无脑 getBlockDOM——巨书 25~39s/24MB）；会话内选过
        // 全量档的大文档（graphFullLoadedBigDocs）直取全量渲染（用户已付过构建成本）。
        // treemap □3 档位：custom-graph-mode 存档优先 → 块数分流默认（>300 进方块档）；
        // 大文档存档 full 但会话无全量数据=降级（全量须确认链，不该被自动路过）
        const [stat, modeAttrs0] = await Promise.all([
            precheckDocSize(docID),
            siyuan.getBlockAttrs(docID).catch(() => ({}) as Record<string, string>),
        ]);
        // □4 实锤（引用验证C 方块档随机打回结构档）：getBlockAttrs 空 map 闪烁（cache/
        // BlockTree 竞态，09-13 三验在档）曾被当「无存档」落默认档 → 档位震荡。合法态 IAL
        // 恒含 id/title 基础字段，空 map=异常 → 重试一次；再空走 SQL ial 列双兜底（读档恢复
        // 一次性场景非判向——ial 列写后立读窗的禁令只限比较现值链）
        let modeAttrs = modeAttrs0;
        if (!modeAttrs || !Object.keys(modeAttrs).length) {
            await sleep(150);
            modeAttrs = await siyuan.getBlockAttrs(docID).catch(() => ({}) as Record<string, string>);
            if (!modeAttrs || !Object.keys(modeAttrs).length) {
                const ialRow = await siyuan.sqlOne(`select ial from blocks where id='${docID}'`).catch(() => null);
                modeAttrs = ialRow?.ial ? {
                    // review P2-2：struct-marks 键不提取=其迁移目标（structure）恒等默认档，
                    // 两侧结果恒等；期3 若改默认档/复用该键名须回补对称提取
                    "custom-graph-mode": ialRow.ial.match(/custom-graph-mode="([^"]*)"/)?.[1] ?? "",
                } : modeAttrs;
                if (modeAttrs?.["custom-graph-mode"]) gbLog("graph.mode_ial_fallback", `doc=${docID.slice(0, 8)} mode=${modeAttrs["custom-graph-mode"]}`);
            }
        }
        const fullData = graphFullLoadedBigDocs.has(docID)
            || pickGraphChannel(stat?.cnt ?? 0, graphMaxAllBlocks.get()) === "full";
        // □4 修复（档位震荡）：同文档重跑保持当前档（switch-protyle 回声/轮询不重设档位）；
        // 切文档时读档优先级=会话记忆 > 存档属性（graphmark 期1 迁移：resolveArchivedGraphMode
        // ——旧 marks 透传/旧 struct-marks=1 → structure）> 默认档——会话记忆兜住
        // setBlockAttrs 写后立读缓存回填窗（读回「无该键」旧 IAL → 档位被打回默认+指纹
        // 短路锁死，坑⑧同族）。□4 起默认档延后决策（null 占位）：默认=有标记→marks
        // （bear 拍板），判定须等首轮标记数据就绪（settleGraphMode，防闪档）
        const sameDoc = lastDocID === docID;
        // graphmind □6（共识#1）视图收敛：旧文档存档 custom-graph-mode ∈ {full,treemap} 的
        // 档位尊重不重置——「显式用过=视为已开设置」（hiddenMenuItems 同款心智）：读档命中
        // 即落盘开 graphShowAllViewModes（按钮组随 store 订阅即时回显，档位本身照常按存档
        // 渲染）。只认 IAL 存档（会话 memo 不算——本会话从未有过 full/treemap 入口时 memo
        // 也不可能命中这两档）；write 走 saveData 恒带 app 排除本窗，不触发自窗重载
        const archivedMode = sameDoc ? undefined : resolveArchivedGraphMode(modeAttrs);
        if ((archivedMode === "full" || archivedMode === "treemap") && !graphShowAllViewModes.get()) {
            void graphShowAllViewModes.write(true);
            gbLog("graph.viewmodes_optin", `doc=${docID.slice(0, 8)} archived=${archivedMode}`);
        }
        let targetMode: GraphViewMode | null = sameDoc
            ? graphMode
            : (graphModeMemo.get(docID)
                ?? archivedMode
                ?? null); // □4：默认档延后（标记就绪后 settleGraphMode 定）
        if (targetMode === "full" && !fullData) targetMode = "structure";
        graphStat = stat;
        graphManualRefresh = graphFullLoadedBigDocs.has(docID);

        graphLoading = true;
        try {
            if (targetMode === "full") {
                const t0 = performance.now();
                const { rows, links } = await getData(
                    docID,
                    docName,
                    graphMaxPBlocks.get(),
                    graphMaxAllBlocks.get(),
                    updatedRow?.updated ?? "", // gfloat P2⑤：双实例共享全量拉取缓存键
                );
                gbLog("graph.full", `rows=${rows.length} links=${links.length} ${Math.round(performance.now() - t0)}ms`);
                fullRowsCache = { rows, links };
                graphMode = "full";
                gbLog("graph.channel", `doc=${docID.slice(0, 8)} → full(dom)${graphFullLoadedBigDocs.has(docID) ? "+fullmem" : ""}`);
                await applyRowsAndLinks(rows, links, docID);
            } else {
                // structure 与 treemap 数据同源（outline 骨架），渲染层按 graphMode 分叉
                // （期3 起 marks=结构树路径过滤渲染；structure=标记感知展开——两档都要
                // 标记集，与结构构建并行拉、构建前就位供默认折叠推导）。□4：默认档/
                // marks 空图守卫在 marksP await 后、结构渲染前定档——首渲染即终态档
                const marksP = ensureMarks(docID);
                if (fullData) {
                    const t0 = performance.now();
                    const { rows, links } = await getData(
                        docID,
                        docName,
                        graphMaxPBlocks.get(),
                        graphMaxAllBlocks.get(),
                        updatedRow?.updated ?? "", // gfloat P2⑤：双实例共享全量拉取缓存键
                    );
                    gbLog("graph.full", `rows=${rows.length} links=${links.length} ${Math.round(performance.now() - t0)}ms`);
                    fullRowsCache = { rows, links };
                    await marksP;
                    if (!sameDoc) targetMode = settleGraphMode(targetMode, docID);
                    gbLog("graph.channel", `doc=${docID.slice(0, 8)} → ${targetMode}(dom)${graphFullLoadedBigDocs.has(docID) ? "+fullmem" : ""}`);
                    graphMode = targetMode;
                    await applyOutlineSkeleton(rows, links, docID, docName);
                } else {
                    fullRowsCache = null;
                    const r = await getGraphStructure(docID, docName);
                    await marksP;
                    if (!sameDoc) targetMode = settleGraphMode(targetMode, docID);
                    gbLog("graph.channel", `doc=${docID.slice(0, 8)} → ${targetMode}(sql)`);
                    graphMode = targetMode;
                    await applyStructureView(r.rows, r.links, docID, r.info);
                }
            }
        } finally {
            graphLoading = false;
        }
        // 先设置 lastDocID，这样 relayout 才能正确加载保存的位置
        const isNewDoc = docID != lastDocID;
        if (isNewDoc) {
            lastDocID = docID;
            clearFocus(); // 期4：聚焦态不跨文档（邻域=当前渲染子图的一跳）
        }
        syncViewModeBtns(); // □3：档位可能随存档变化（active 态+布局钮显隐回显）
        lastFingerprint = fingerprint; // 构建真正落地才落指纹（中途丢弃/异常不落）
        // □1 保留 refit（!refreshOnly）之一：打开文档/初次挂载=全新节点集初次入画，用户预期
        // 整树入画全览（fitReadable 合理场景；交互链四族+onconnect 已全改 refit=false 见
        // relayout 注释——本处与 applyShowLevel 是仅有的两个 refit=true 合理场景）。
        // refreshOnly=true（自动刷新链）仍 false 不动视口
        if (graphMode !== "treemap") await relayout(!refreshOnly); // review P2：treemap 档无 xyflow 布局语义（期3 起 marks=结构树渲染，有布局）
        // graphmind □2 P0：打开文档不再 locateID($nodes.at(0)) ——setCenter(1.2) 把根居中，
        // 而 LR tidy 树根在垂直中位，1.2 视口只覆盖根列（实测 2/34 节点相交、面板 80~90%
        // 空白，三次开面板同值复现）。打开终态恒=relayout 尾部的 fitReadable（□7fix 起=
        // 真 fit 整树入画布）。locateID 通道本体保留：编辑器块→图定位（GraphBox.ts locateNode
        // 消费）仍 setCenter(1.2) 显式定位语义不变
    }

    // rows/links → 段落链合并（期7：链子树整链并 ¶ 大节点，链成员剔除+边端点重定向）→
    // 全量树数据（折叠只影响「渲染哪些」不影响「建什么」）→ 可见子图 $nodes/$edges
    // （全量档渲染组装；□2 起结构态走 applyStructureView）
    async function applyRowsAndLinks(rows: Block[], links: Ref[], docID: string) {
        structInfo = null;
        structDocID = "";
        leafShowContainers = new Set();
        // □9 hr 过滤（bear 拍板「分割线不显示」）：tb 行剔出图，端点连坐边丢弃
        // （DOM 全量通道已在 getData 源头滤过，此处为 fullRowsCache 旧缓存等旁路兜底）
        ({ rows, links } = filterHrGraph(rows, links));
        const merged = mergeParagraphChains(rows, dedupeLinks(links, false));
        allRows = merged.rows;
        allLinks = merged.links;
        paraByText = merged.paraByText;
        paraCount = merged.paraCount;
        paraRedirect = merged.linkRedirect;
        paraRunMembers = new Map(); // □3：structure 档链成员序表不跨档残留（full 档文本已预拼不消费）
        labels = new Map(allRows.map(row => [row.id, rowLabel(row, docID)]));
        // 折叠态：文档持久化（custom-graph-collapsed）优先；未 toggle 过的文档按「默认显示到第几级」推导
        // （graphmind □4 新口径：设置值=显示到 N 级 → settingShowLevelToExpand 换算折叠档；
        // base=文档最小标题级归一化——H2 起步文档全档同源，此前 full 档漏归一化的缺口一并补上）。
        // ¶ 链头过滤：旧版把链头存进折叠集（展开族），期7 起链头恒 ¶ 大节点、折叠语义不适用
        const attr = await siyuan.getBlockAttrs(docID);
        const saved = parseCollapsed(attr?.["custom-graph-collapsed"]);
        const hRange = headingRangeOf(allRows, docID);
        collapsedSet = new Set(
            (saved ?? initialCollapsedRows(
                allRows,
                settingShowLevelToExpand(normalizeExpandLevel(graphDefaultExpandLevel.get()), hRange),
                hRange?.base ?? 1,
                { keepSuperExpanded: true }, // □8 评审 P2：full 档 sb 保持 subflow 空间组默认展开（□8 前语义）
            ))
                .filter(id => !paraByText.has(id)),
        );
        applyCollapsedView();
    }

    function byIdRow(rows: Block[], id: string): Block {
        return rows.find(r => r.id === id) ?? rows[0];
    }

    function normalizeExpandLevel(v: string): ExpandLevel {
        // graphmind □4：口径=「显示到第 N 级标题」（1..6；□2 起 "headings"=最深标题级）。
        // graphrelayout □7：合法集加 "auto"（自适应最高标题级，新默认），坏值兜底同换。
        // 旧值 1/2/3（折叠起点口径）字面保留按新口径解释——存量迁移与坏值兜底见 index.ts 装载段
        return ["auto", "1", "2", "3", "4", "5", "6", "all", "headings"].includes(v) ? v as ExpandLevel : "auto";
    }

    // treemap 战役 □2 方案 A：DOM 全量通道换 outline 真值骨架（与 SQL 通道同构——
    // 骨架=大纲面板标题树；标题层节点化+徽标聚直属叶子；listfix 起 i、□8 起 l/s 升格
    // 容器节点（DOM 壳行按 listShellId 戳合成），引述 b 维持徽标退化；结构边重建只留
    // 标题链+容器链，引用边保留 isRef 筛选；跨文档端点行恒保留为节点——
    // applyStructureView 的 keep 逻辑依赖其在场）。
    // 锚必传：getData 产物经 parallelHeanders 层级化=树 DFS 序（标题链提前），前驱锚
    // 归属必须按 getChildBlocks 物理平铺序（接线实锤：1.2 吸整章 4·168；□8 容器插入
    // 后壳/超级块同样按物理序挂前驱章节锚）
    async function applyOutlineSkeleton(rows: Block[], links: Ref[], docID: string, docName: string) {
        const entryFP = lastFingerprint; // □4：await 期间的位移探针（见下方丢弃判据注释）
        const [outline, order] = await Promise.all([
            siyuan.getDocOutline(docID).catch(e => {
                gbLog("graph.outline_err", `${e}`); // review P2-3：outline 失败=骨架塌 [doc]，留痕防无痕钉死
                return [] as GetDocOutline[];
            }),
            siyuan.getChildBlocks(docID)
                .then(kids => new Map(kids.map((k, i) => [k.id as string, i])))
                .catch(e => {
                    gbLog("graph.order_err", `${e}`); // review P2-2：锚失败=传序兜底（DOM 树序错序形态），留痕
                    return new Map<string, number>();
                }),
        ]);
        const sk = structureRowsFromOutline(outline, rows, docID, docName, order);
        // □4 修正（切回误杀）：丢弃判据原为 lastDocID!==docID——它在 await 间隙恒=上一轮文档，
        // 「切走又切回」的正常回流被误判过时：数据丢弃但 _changeDoc_ 尾部照落指纹 → 死锁空面板。
        // 改判 fingerprint 位移：await 期间有新轮完成（真切走）才丢，后发先至=末者胜
        if (lastFingerprint !== entryFP) return;
        const refLinks = links.filter(l => (l as GraphEdgeSpec).isRef);
        const foreign = rows.filter(r => r.root_id !== docID);
        await applyStructureView([...sk.rows, ...foreign], [...sk.links, ...refLinks], docID, sk.info);
    }

    // □3 评审 P2②：标记叶 id 集单一派生——合并链 excluded（链在标记段处断开）与徽标
    // 渲染让位（标记段不渲染普通卡）两处同源消费，代码级同源杜绝注释对齐漂移
    function markLeafIdsOf(ctx: MarkTreeInfo | null): Set<string> {
        return new Set([...(ctx?.cards.values() ?? [])].flatMap(ls => ls.map(l => l.id)));
    }

    // □3 评审 P1：¶ 链四表重算单点（structure 档）——applyStructureView 组装与
    // marksChanged 轻通道（refreshMarkCtx）共用。轻通道此前不重算=外部 setBlockAttrs
    // 给链中段打标后段落滞留合并卡、其标记卡被徽标循环 pushedLeaves 防重集吞掉（违反
    // 「链在标记段处断开」不变量与 □4「标记的都得展开」）。标记叶不进链（excluded）——
    // □4「标记的都得展开」标记卡通道独占呈现，链在标记段处断开、两侧各自成链。
    // SQL 轻通道叶子为无 content 桩，paraByText 文本此处尽在场 content 预拼（DOM 通道
    // 即完整），渲染层徽标展开时 joinParaText 恒重算为准。徽标聚合/leafAgg 勿动
    // （「N 段 · X 字」报数=容器直属叶子真值，合并是显示层重组）。展开态按链头存活
    // 过滤（applyRowsAndLinks 同款）：同文档刷新保留仍存活的链头、消失的链头清退
    function recomputeParaRuns() {
        if (!structInfo) return;
        // □9 媒体段落（仅含图片，media 在场）不参与相邻合并——独立媒体胶囊呈现
        const excluded = markLeafIdsOf(markCtx);
        for (const leaves of structInfo.directLeaves.values()) {
            for (const l of leaves) if (l.media) excluded.add(l.id);
        }
        const runs = mergeStructureLeafRuns(structInfo.directLeaves.values(), excluded);
        paraByText = runs.paraByText;
        paraCount = runs.paraCount;
        paraRedirect = runs.paraRedirect;
        paraRunMembers = runs.runMembers;
    }

    // □2 结构态组装：allRows=容器树+跨文档端点（叶子不进 allRows——归属/聚合已在 info），
    // 引用边叶子端点重定向到容器（徽标承载引用语义）；结构边恒保留（容器树就是视图本体，
    // 「隐藏结构连线」开关不适用）。折叠态=容器树默认展开层级推导（会话态不持久化，
    // 与全量档的 custom-graph-collapsed 键语义分开，第一版不混用）
    async function applyStructureView(rows: Block[], links: Ref[], docID: string, info: StructureInfo) {
        // graphbox-listfix：同文档刷新（改原文→ws 回流）保留会话折叠/徽标展开态——
        // 否则图塌回默认推导小簇+refreshOnly 旧视口 → 「图找不着」（主实例 09:29 实锤
        // 30 秒内三次手动重开徽标）。切文档=全新推导。上轮态在 allRows 重赋值前取
        const sameDoc = structDocID === docID;
        const prevCollapsed = sameDoc ? collapsedSet : new Set<string>();
        const prevAlive = new Set(allRows.map(r => r.id));
        const prevLeafShow = sameDoc ? leafShowContainers : new Set<string>();
        structInfo = info;
        structDocID = docID;
        const keep = new Set<string>(info.containers);
        for (const r of rows) {
            // 跨文档端点行（引用边另一头的块，root_id≠本档）恒保留为节点——
            // 勿用 docName 判：fillChildren 给本档全部块都带 docName=文档名（历史噪音）
            if (r.root_id !== docID) keep.add(r.id);
        }
        const structRows = rows.filter(r => keep.has(r.id));
        // □3 vision 方案 A：DOM 通道顶层容器（shortenList 挂回 doc 的列表项/sb/引述）章节
        // 领地重挂——树形与 SQL 通道对齐，默认展开层级才能压住列表项（默认只显章/节列）。
        // listfix：骨架层 i 已挂章节锚（parent_id≠根），重挂天然跳过
        const anchors = chapterAnchorMap(structRows, docID);
        if (anchors.size) {
            const doc = structRows.find(r => r.id === docID);
            for (const r of structRows) {
                const a = anchors.get(r.id);
                if (!a || !doc?.children) continue;
                const at = doc.children.indexOf(r);
                if (at >= 0) doc.children.splice(at, 1);
                r.parent_id = a;
                (byIdRow(structRows, a).children ??= []).push(r);
            }
        }
        allRows = structRows;
        const deduped = dedupeLinks(links, true);
        structRefLinks = deduped.filter(e => e.isRef); // □4：重定向前留存（叶子粒度）
        allLinks = redirectLinksToContainers(deduped, info)
            .map(e => anchors.has(e.target) && e.source === docID
                ? { ...e, source: anchors.get(e.target)!, id: anchors.get(e.target) + "->" + e.target }
                : e);
        // □3 章节自动编号（思绪大纲感 1/1.1，graphShowNumbers 可关——标题自带序号的文档防双编号）；
        // □4 起编号走独立字段（GraphNode 浅灰弱化前缀——标题自带序号文档的「1.1 1.1」两段语义可分）
        structNumbers = graphShowNumbers.get() ? numberHeadingChain(structRows, docID) : new Map<string, string>();
        labels = new Map(structRows.map(row => {
            const base = rowLabel(row, docID);
            return [row.id, structNumbers.has(row.id) ? base.replace(/^#+\s*/, "") : base];
        }));
        // graphmind □4：标题级检测单一事实源 headingRangeOf（原 minHeadingLv 内联循环收编；
        // 相对级=绝对级−base+1，H2 起步文档 base=2 归一化——treemap □2 病灶③语义保留）。
        // 默认折叠推导=设置新口径（显示到 N 级）经 settingShowLevelToExpand 换算折叠档
        const hRange = headingRangeOf(structRows, docID);
        const defaults = initialCollapsedRows(
            structRows,
            settingShowLevelToExpand(normalizeExpandLevel(graphDefaultExpandLevel.get()), hRange),
            hRange?.base ?? 1,
        );
        // graphmark 期3 标记感知展开：默认折叠叠加标记路径强制展开（预算制——种子=最小
        // 含标记容器、祖先出折叠集；超出预算的路径留收拢靠 ●N 可达）。仅默认推导叠加，
        // 会话折叠态（sameDoc merge）优先级不变——用户手动收起的标记路径不被打回
        markCtx = markTreeInfo(structRows, info, docMarks);
        const markDefaults = markCtx ? markAwareCollapsed(structRows, defaults, markCtx) : defaults;
        const curAlive = new Set(structRows.map(r => r.id));
        // graphmind □4 P0：折叠态持久化读回——结构档冷加载（sameDoc=false）此前只走默认
        // 推导，saveCollapsed 写了不读=级数选择/手动折叠整页重开后全丢（UI 验收 P0 实锤：
        // IAL=[第1章] reload 后 34 全展开）。语义与 full 档 applyRowsAndLinks 同款：
        // custom-graph-collapsed 存在（含 "[]" 显式全展开）=用户态整体优先；无持久化值才走
        // 默认推导（标记感知展开仅默认态叠加）。saved 死 id 滤活集（编辑后 reload 残留已删
        // 容器）。sameDoc=true 不读（会话 merge 已是最新，_changeDoc_ 入口的 modeAttrs 读
        // 不透传——setGraphMode 等调用点无现成 attrs，构建链多一次 getBlockAttrs 无感）
        const savedAttr = sameDoc ? null : await siyuan.getBlockAttrs(docID).catch(() => null);
        const saved = sameDoc ? null : parseCollapsed(savedAttr?.["custom-graph-collapsed"]);
        // await 位移探针（entryFP 同款纪律）：getBlockAttrs 期间新一轮构建接管（切文档/档位
        // 重建都换 info 对象）→ 本轮丢弃，防旧文档 saved 叠新文档 allRows 的错位渲染
        if (!sameDoc && structInfo !== info) return;
        // graphrelayout □3（评审第 1 轮 low）：链四表重算放探针之后——await 期间新一轮
        // 接管即弃，para* 与 allRows/collapsedSet 同纪律不再提前写全局
        recomputeParaRuns();
        collapsedSet = sameDoc
            ? mergeCollapsedOnRefresh(prevCollapsed, markDefaults, prevAlive, curAlive)
            : new Set(saved ? saved.filter(id => curAlive.has(id)) : markDefaults);
        // 徽标展开态同款保留：展开的容器仍在本档容器集才留（删块自然清退）
        leafShowContainers = new Set([...prevLeafShow].filter(id => info.containers.has(id)));
        // 标记叶卡摊开（□4 bear 拍板「标记的都得展开」）：新文档=全部标记容器直接摊开
        // （MARK_LEAF_FLAT_LIMIT=30 阈值退役）；会话态保留+清退已删卡容器+新增标记容器
        // 自动摊开（markSeenContainers 三路同纪律）；marks 档过滤集同步重算
        marksKeep = marksKeepSet(structRows, markCtx);
        if (sameDoc) {
            markShowContainers = new Set([...markShowContainers].filter(id => markCtx?.cards.has(id)));
        } else {
            markShowContainers = flatMarkContainers(markCtx);
        }
        spreadNewMarkContainers();
        // □4 全摊开配套：标记叶正文按需补拉（SQL 结构通道 directLeaves=无 content 桩，
        // toggleMarkCards 同款通道；只拉摊开容器即渲染的卡，封顶防病态巨量标记拖挂——
        // 超限卡显示「…」占位，●N 收起再摊开即走既有按需通道）
        const flatLeaves = [...markShowContainers].flatMap(cid => markCtx?.cards.get(cid) ?? []);
        const missingLeaves = flatLeaves.filter(l => !l.content && !leafContent.has(l.id)).map(l => l.id);
        if (missingLeaves.length && missingLeaves.length <= 1000) {
            try {
                const rows = await siyuan.getRows(missingLeaves, "content,type,subtype,root_id,parent_id", false); // 标记叶卡通道：markLeafIds 与胶囊叶互斥，不涉胶囊判定（□9 评审 P3）
                for (const r of rows) leafContent.set(r.id, r.content ?? "");
            } catch (e) {
                gbLog("graph.markleaf_fetch_err", `${e}`);
            }
        }
        if (structInfo !== info) return; // await 位移复核：新一轮接管即弃（leafContent 幂等无害）
        applyCollapsedView();
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

    // □2 参数语义更名：structEdgesForced=结构边恒保留（结构态=容器树是视图本体）；
    // 全量档 false=尊重「隐藏结构连线」开关
    function dedupeLinks(links: Ref[], structEdgesForced: boolean): GraphEdgeSpec[] {
        const seen = new Set<string>();
        const out: GraphEdgeSpec[] = [];
        links.forEach((link) => {
            if (!structEdgesForced && graphHideStructEdges.get() && !link.isRef) return;
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

    // ¶×N 大节点全文（期7）：mergeParagraphChains 产物（链内全文合并+2000 字首尾截断），此处零加工；
    // graphmind □3 显示层双态（共识#4）：收起=首尾各一段+「⋯ N 块 ⋯」省略标记、展开=原文序
    // 全段+序号——分段渲染在 GraphNode（paraText.split），数据层链合并不动

    // 折叠集 → 可见子图：$nodes 只装可见节点（type=tomatoNode 自定义节点带角标数据），
    // $edges 走 filterEdges（结构边随子可见过滤、引用边端点重定向到折叠祖先）。
    // 期3 subflow：sb/bq 未折叠且有可见直接子 → tomatoGroup 容器节点，可见子孙挂最近容器祖先
    // （xyflow parentId 相对坐标系），空间包含替代「容器→直接子」结构边
    function applyCollapsedView() {
        const tree = buildTreeIndex(allRows);
        const vis = computeVisible(allRows, collapsedSet);
        // 期3：marks 档=结构树标记路径过滤（同一棵树的折叠态照常作用，其余分支不渲染）
        const isStructure = (graphMode === "structure" || graphMode === "marks") && !!structInfo;
        const effVisible = graphMode === "marks" && structInfo
            ? new Set([...vis.visibleIds].filter(id => marksKeep.has(id)))
            : vis.visibleIds;
        const groupIds = new Set<string>();
        for (const row of allRows) {
            if (!effVisible.has(row.id)) continue;
            // 思源块类型码：超级块='s'（NodeSuperBlock）、引述块='b'（NodeBlockquote）。
            // 三期 B'（2026-09-04 方向修正）：列表容器 l 退出 subflow 族——列表改脑图式
            // 树形分叉（i=分叉节点+吸收项内文本），容器壳语义只剩 s 与 b。
            // graphrelayout □8：subflow（tomatoGroup 空间包含）限定 full 档——结构/marks
            // 档的 s 已升格容器树节点（bear：容器形态与标题卡视觉同族），不再空间化
            if (graphMode === "full" && (row.type === "s" || row.type === "b") && !collapsedSet.has(row.id)
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
            if (!effVisible.has(row.id)) continue;
            const collapsed = collapsedSet.has(row.id);
            // 期7 ¶ 大节点判定改预处理打标（mergeParagraphChains），与折叠集解耦；
            // dagreW/H 仅作 measured 写回前的首轮估算（¶ 高钳 400，竖排窄卡 122）
            const isParaMerged = paraByText.has(row.id);
            const isGroup = groupIds.has(row.id);
            // 容器同款爬最近容器祖先（嵌套 subflow：引述块挂超级块内）；爬不到=顶层
            const parentId = parentNodeFor(row.id);
            // 折叠态 sb/bq 无正文，label 空卡片难辨——给容器名（containerLabel 单一事实源，
            // GraphGroup 标题栏同款；□8 评审 P3 收编）。□8：结构档 l/s 为树节点且壳行恒无
            // 正文（SQL 轻行不带 content、DOM 合成壳无正文），展开态同兜底容器名
            let label = labels.get(row.id) ?? "";
            const clabel = !isGroup ? containerLabel(row.type) : undefined;
            if (clabel) label = clabel;
            // 跨文档/文档块图标数据（spec §8）：docName==content 的跨文档块与 type=d 同为文档语义
            const isDoc = row.type === "d" || (!!row.docName && row.docName === row.content);
            const crossDocName = !isDoc && row.docName && row.docName !== row.content ? row.docName : undefined;
            // □2 结构态徽标：容器直属叶子聚合量（「N 段 · X 字」pill，点按展开/收起）。
            // review P2-3：marks 档徽标退役——徽标放行的是全部直属叶子（含无标记），
            // 与「只看标记=其余分支不渲染」档位承诺冲突；该档标记叶走 ●N 角标通道
            // □2 徽标只挂本档容器：跨文档端点行可能被 buildStructureInfo 误聚出量（端点段落的
            // parent=端点文档根在 rows 里）——挂了会与端点节点本身重复渲染（keyed each 同 key）
            const agg = graphMode === "structure" && row.root_id === structDocID ? structInfo!.leafAgg.get(row.id) : undefined;
            // 期3 ●N 标记角标：子树标记计数+首色（折叠祖先上的量也可见=路径可达性线索）；
            // 点击=摊开本容器标记叶卡 / 无自身标记则展开本节点（标记在深层）
            const markN = isStructure ? (markCtx?.subtreeCount.get(row.id) ?? 0) : 0;
            // □9 胶囊：¶ 合并链=「¶×N」单行胶囊（N=链内总段数=paraCount+1 链头计入），
            // 全文走 hover 预览（块数+首尾段各 ~100 字）；双态卡/展开交互 □9 退役
            const paraTotal = isParaMerged ? (paraCount.get(row.id) ?? 0) + 1 : 0;
            const paraRun = isParaMerged ? paraByText.get(row.id)! : "";
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
                    fullText: isParaMerged ? paraRun : (row.content ?? ""),
                    collapsed,
                    isParaMerged,
                    groupKind: row.type === "b" ? "bq" : "sb",
                    sbLayout: row.type === "s" ? row.subtype : undefined,
                    blockType: row.type,
                    isDoc,
                    docName: crossDocName,
                    // □9 胶囊数据（GraphNode .gn-pill 渲染）+hover 预览内容（graphPreview 浮层）
                    pill: isParaMerged ? paraPillSpec(paraTotal, paraRun) : undefined,
                    preview: isParaMerged ? paraRunPreview(paraTotal, paraRun, tomatoI18n.胶囊段落链) : undefined,
                    // ¶ badge ¶×N = 链内合并块数（期7 起与折叠 hiddenCount 语义分家）
                    hiddenCount: isParaMerged ? paraCount.get(row.id) : vis.hiddenCount.get(row.id),
                    hasChildren: (vis.subtreeSize.get(row.id) ?? 1) > 1,
                    // □9 胶囊尺寸首轮估算（¶×N 恒 120×28 单行；measured 精修接管——□2 两轮机制）
                    dagreW: isParaMerged ? PARA_PILL_W : undefined,
                    dagreH: isParaMerged ? PILL_H : undefined,
                    // ¶ 不挂子树折叠 toggle（链成员已并入）；双击=滚动链头段
                    toggle: isParaMerged ? undefined : () => void toggleCollapseNode(row.id),
                    // □4 章节编号独立字段（弱化前缀渲染）
                    number: isStructure ? structNumbers.get(row.id) : undefined,
                    // □2 徽标数据（结构态容器专属； expanded 态随 leafShowContainers）
                    structBadge: agg ? { ...agg, expanded: leafShowContainers.has(row.id) } : undefined,
                    toggleBadge: agg ? () => void toggleBadge(row.id) : undefined,
                    // 期3 ●N 角标数据+点击（结构/只看标记两档同通道）
                    markDot: markN > 0 && markCtx
                        ? { n: markN, color: markCtx.subtreeColor.get(row.id) ?? "var(--b3-theme-primary)" }
                        : undefined,
                    onMarkToggle: isStructure ? () => void toggleMarkCards(row.id) : undefined,
                    dblclick: () => void showBlockInEditor(row.id),
                },
                position: { x: 0, y: idx++ * 100 },
            });
        }
        const rendered = filterEdges(allLinks, effVisible, tree);
        const edgeArr: Edge[] = [];
        for (const e of rendered) {
            // 「容器→直接子块」结构边跳过：subflow 空间包含已表达（容器内其余层级结构边照画）
            if (!e.isRef && groupIds.has(tree.parentOf.get(e.rTarget) ?? "")) continue;
            addRenderEdge(e, edgeArr);
        }
        // □2 结构态展开叶子：点徽标放行该容器直属叶子（逐段节点；容器折叠时叶子随子树隐藏）。
        // 叶子不在 allRows（归属在 structInfo），此处独立补节点+容器→叶子结构边
        if (isStructure) {
            const pushedLeaves = new Set<string>(); // 双通道（徽标/标记）同容器防同 id 重复 key
            // □3：标记叶集（markLeafIdsOf 与合并分组 excluded 同源派生，评审 P2②）——标记
            // 段不渲染普通 structLeaf 卡，让位标记叶卡通道（避免同段双卡：合并链在标记段
            // 断开时，落单标记段由标记卡独占呈现）
            const markLeafIds = markLeafIdsOf(markCtx);
            // review P2-3：徽标展开叶子只在 structure 档渲染（marks 档徽标退役，
            // 残留 leafShowContainers 会话态不向该档外溢）
            if (graphMode === "structure") {
                for (const cid of leafShowContainers) {
                    if (!effVisible.has(cid)) continue;
                    const leaves = structInfo!.directLeaves.get(cid) ?? [];
                    const leavesById = new Map(leaves.map(l => [l.id, l]));
                    for (const leaf of leaves) {
                        if (pushedLeaves.has(leaf.id)) continue;
                        // □3 ¶ 合并卡 → □9 胶囊化：链头渲染「¶×N」单行胶囊（N=链内总段数），
                        // 链成员不渲染节点不画边（全档口径一致）；全文走 hover 预览（块数+
                        // 首尾段各 ~100 字），双态卡/展开交互 □9 退役。
                        // 全文实时拼（joinParaText 与组装端同源，评审 P2①）：DOM 通道
                        // 叶子自带 content；SQL 通道 toggleBadge 补拉进 leafContent——
                        // 组装时 paraByText 预拼可能缺段，此处恒以最新正文重算
                        const runMembers = paraRunMembers.get(leaf.id);
                        if (runMembers) {
                            pushedLeaves.add(leaf.id);
                            for (const m of runMembers) pushedLeaves.add(m);
                            const runBlocks = [leaf, ...runMembers.map(m => leavesById.get(m)!)].filter(b => !!b);
                            const runText = joinParaText(runBlocks, b => leafContent.get(b.id) || b.content || "");
                            const paraTotal = runMembers.length + 1;
                            nodeArr.push({
                                id: leaf.id,
                                type: "tomatoNode",
                                data: {
                                    label: "",
                                    fullText: runText,
                                    collapsed: false,
                                    isParaMerged: true,
                                    blockType: "p",
                                    // □9 胶囊数据+hover 预览（与 full 档同款词表）
                                    pill: paraPillSpec(paraTotal, runText),
                                    preview: paraRunPreview(paraTotal, runText, tomatoI18n.胶囊段落链),
                                    // ¶ badge ¶×N=链内块数（成员口径，显示层 +1 计链头）
                                    hiddenCount: paraCount.get(leaf.id),
                                    hasChildren: false,
                                    // □9 胶囊 120×28 首轮估算（measured 精修接管——□2 两轮机制）
                                    dagreW: PARA_PILL_W,
                                    dagreH: PILL_H,
                                    // 不挂子树折叠 toggle（链成员已并入）；双击=滚动链头段
                                    toggle: undefined,
                                    dblclick: () => void showBlockInEditor(leaf.id),
                                },
                                position: { x: 0, y: idx++ * 100 },
                            });
                            addRenderEdge(
                                { id: `${cid}->${leaf.id}`, source: cid, target: leaf.id, label: "", isRef: false, rSource: cid, rTarget: leaf.id },
                                edgeArr,
                            );
                            continue;
                        }
                        // □3 标记段让位：不进合并链的标记叶不渲染普通卡（标记卡通道独占；
                        // 该通道按 markShowContainers 摊开态自行渲染——用户收起 ●N 即主动隐藏）
                        if (markLeafIds.has(leaf.id)) continue;
                        pushedLeaves.add(leaf.id);
                        const text = leafContent.get(leaf.id) || leaf.content || "";
                        // □9 内容块胶囊（bear 拍板「内容块收成单行胶囊，hover 看内容」）：
                        // 两段式内容卡退役（标记叶卡蓝条两段式语义载体保留不动），按块型
                        // 独立胶囊（相邻不合并）——c=❯ 代码 / b=❝ 引用 / t=▦ 表 N 行 /
                        // m=∑ 公式 / 媒体=图标+文件名 / av=▦ 属性视图 / p=¶+首行摘要
                        const words = pillWords();
                        const { pill, preview } = contentPillSpec(leaf.type, text, words, {
                            markdown: leafMarkdown.get(leaf.id) ?? leaf.markdown,
                            tableRows: leaf.tableRows,
                            tableHead: leaf.tableHead,
                            media: leaf.media,
                            avID: leaf.avID,
                        });
                        nodeArr.push({
                            id: leaf.id,
                            type: "tomatoNode",
                            data: {
                                label: "",
                                fullText: text,
                                collapsed: false,
                                isParaMerged: false,
                                blockType: leaf.type,
                                structLeaf: true,
                                // □9 胶囊数据+hover 预览内容
                                pill,
                                preview,
                                // □9 胶囊尺寸首轮估算（measured 精修接管——□2 两轮机制）
                                dagreW: pillEstWidth(pill.label),
                                dagreH: PILL_H,
                                dblclick: () => void showBlockInEditor(leaf.id),
                            },
                            position: { x: 0, y: idx++ * 100 },
                        });
                        addRenderEdge(
                            { id: `${cid}->${leaf.id}`, source: cid, target: leaf.id, label: "", isRef: false, rSource: cid, rTarget: leaf.id },
                            edgeArr,
                        );
                    }
                }
            }
            // 期3 标记叶卡：●N 摊开的容器渲染其标记叶（两段卡染标记色+单击跳原文——
            // luji0918 □2 直挂配方复活，git 21f6af5e 考古；仅摊开且容器可见才挂卡——
            // 预算收拢路径先展开祖先再点 ●N，两段可达）。叶本体已是可见树节点时跳过
            // （keyed each 同 id 重复 key 冻结防线）
            if (markCtx) {
                for (const [cid, leaves] of markCtx.cards) {
                    if (!markShowContainers.has(cid) || !effVisible.has(cid)) continue;
                    for (const leaf of leaves) {
                        if (pushedLeaves.has(leaf.id) || effVisible.has(leaf.id)) continue;
                        pushedLeaves.add(leaf.id);
                        const raw = leafContent.get(leaf.id) || leaf.content || "";
                        const text = stripMarkSyntax(raw);
                        // graphmind □5（共识#6）：markCardTexts 标题/正文切分退役——标题行
                        // 与正文重复不再显示；bodyText 恒=全文完整显示（宽 300 封顶高自适应，
                        // 2 行钳 structClamp 退役），label 仅竖排窄卡形态消费（横排标记叶
                        // 不渲染标题栏，GraphNode aria 恒走 fullText）
                        const firstLine = text.split("\n")[0] || "…";
                        const bodyText = text || firstLine;
                        // 首轮高度估算含折行（300px 卡正文区 ~17 CJK 字/行；无标题栏=
                        // body 12px padding+2px 边框+行高 ~17）；measured 二轮精修接管，高不封顶
                        const bodyLines = Math.max(
                            bodyText.split("\n").reduce((n, ln) => n + Math.max(1, Math.ceil(ln.length / 17)), 0), 1);
                        nodeArr.push({
                            id: leaf.id,
                            type: "tomatoNode",
                            data: {
                                label: firstLine.slice(0, 30),
                                fullText: text,
                                bodyText,
                                collapsed: false,
                                isParaMerged: false,
                                blockType: leaf.type,
                                structLeaf: true,
                                structMark: markCssOf(docMarks?.get(leaf.id)),
                                // graphmind □2：卡宽与 .gn-card max-width 300 同步；□5 高不封顶
                                // （2 行钳随标题栏一起退役，bodyLines 全量估算 measured 精修接管）
                                dagreW: 300,
                                dagreH: 14 + bodyLines * 17,
                                clickJump: true,
                                dblclick: () => void showBlockInEditor(leaf.id),
                            },
                            position: { x: 0, y: idx++ * 100 },
                        });
                        addRenderEdge(
                            { id: `${cid}->${leaf.id}`, source: cid, target: leaf.id, label: "", isRef: false, rSource: cid, rTarget: leaf.id },
                            edgeArr,
                        );
                    }
                }
            }
        }
        spreadEdgeLabels(edgeArr);
        // 官方通道更新（内部 store 赋值；onMount 前未挂时回退 nodes.set 首装）
        const gs = data()?.graphStore;
        if (gs) { gs.nodes = nodeArr; gs.edges = edgeArr; }
        else { nodes.set(nodeArr); edges.set(edgeArr); }
        scheduleFocusRefresh(); // 期4：可见集变更后邻域类补刷（目标可能随折叠漂走）
    }

    // □9 胶囊词表（i18n 注入纯函数层——graphPill 零 i18n 纪律，此处每次组装现取现用）
    function pillWords(): PillWords {
        return {
            code: tomatoI18n.胶囊代码,
            quote: tomatoI18n.胶囊引用,
            table: tomatoI18n.胶囊表格名,
            tableRows: tomatoI18n.胶囊表格,
            tableRowsLine: tomatoI18n.胶囊表格行数,
            math: tomatoI18n.胶囊公式,
            audio: tomatoI18n.胶囊音频,
            video: tomatoI18n.胶囊视频,
            av: tomatoI18n.胶囊属性视图,
            paraChain: tomatoI18n.胶囊段落链,
        };
    }

    // □2 徽标展开/收起：放行该容器直属叶子（大文档叶子正文按需 getRows——SQL 通道首取不带
    // 叶子 content；DOM 通道叶子正文在 directLeaves 的 Block 上零请求）
    async function toggleBadge(cid: string) {
        const pin = capturePin(cid); // □1 点击时刻快照（getRows await 前）
        if (!structInfo) return;
        if (leafShowContainers.has(cid)) {
            leafShowContainers.delete(cid);
        } else {
            const stubs = structInfo.directLeaves.get(cid) ?? [];
            const missing = stubs.filter(l => !l.content && !leafContent.has(l.id)).map(l => l.id);
            if (missing.length) {
                try {
                    const rows = await siyuan.getRows(missing, "content,type,subtype,root_id,parent_id,markdown", false); // □9 +markdown：表格行数/媒体文件名胶囊判定
                    for (const r of rows) {
                        leafContent.set(r.id, r.content ?? "");
                        if (r.markdown) leafMarkdown.set(r.id, r.markdown);
                    }
                } catch (e) {
                    gbLog("graph.leaf_fetch_err", `${e}`);
                }
            }
            leafShowContainers.add(cid);
        }
        gbLog("graph.badge_toggle", `node=${cid.slice(0, 8)} → ${leafShowContainers.has(cid) ? "expand" : "collapse"} leaves=${structInfo.directLeaves.get(cid)?.length ?? 0}`);
        applyCollapsedView();
        await relayout(false); // □1 交互不重适配视口（bear dogfood 根因位）
        pinViewportTo(pin); // □1 被点标题节点钉回点击前屏幕位置
    }

    // 期3 ●N 角标点击：有自身标记叶卡=摊开/收起该容器标记叶卡（大文档叶子正文按需
    // getRows，同徽标通道）；无卡可摊（子树标记全在深层，含标题/i 行自身命中）=展开
    // 本节点——深层 ●N 露头（预算收拢路径两段可达）；review P2-6：selfCount>0 但 cards
    // 缺键（树节点自身命中）也落展开分支，防「角标点不动」死点击
    async function toggleMarkCards(cid: string) {
        if (!structInfo) return;
        if ((markCtx?.selfCount.get(cid) ?? 0) > 0 && markCtx!.cards.has(cid)) {
            const pin = capturePin(cid); // □1 点击时刻快照（getRows await 前；else 折叠分支由 toggleCollapseNode 自钉）
            if (markShowContainers.has(cid)) {
                markShowContainers.delete(cid);
            } else {
                const stubs = markCtx?.cards.get(cid) ?? [];
                const missing = stubs.filter(l => !l.content && !leafContent.has(l.id)).map(l => l.id);
                if (missing.length) {
                    try {
                        const rows = await siyuan.getRows(missing, "content,type,subtype,root_id,parent_id", false);
                        for (const r of rows) leafContent.set(r.id, r.content ?? "");
                    } catch (e) {
                        gbLog("graph.markleaf_fetch_err", `${e}`);
                    }
                }
                markShowContainers.add(cid);
            }
            gbLog("graph.markcards_toggle", `node=${cid.slice(0, 8)} → ${markShowContainers.has(cid) ? "expand" : "collapse"} cards=${markCtx?.cards.get(cid)?.length ?? 0}`);
            applyCollapsedView();
            await relayout(false); // □1 交互不重适配视口
            pinViewportTo(pin); // □1 被点容器钉回点击前屏幕位置
        } else if (collapsedSet.has(cid)) {
            await toggleCollapseNode(cid);
        }
    }

    // □3 档位切换（graphmark 期1 起按钮组直切）：structure/treemap 数据同源（outline 骨架），
    // 互切零重建只换渲染层；full 走原确认链/缓存链（大文档保护不撤）。档位按文档持久化
    // custom-graph-mode（setBlockAttrs 模式，原 getLayoutForm 布局档同款）。
    async function setGraphMode(mode: GraphViewMode) {
        if (!lastDocID || mode === graphMode) return;
        clearFocus(); // 期4：聚焦态随档位失效（邻域=当前渲染子图的一跳，跨档无意义）
        // review P1-4：入口捕获文档身份，每个 await 后判变——重建期间切走即中止（防档位
        // 写到别的文档头上/与 _changeDoc_ 交错重建）；快速连点按钮=后发先至末者胜出
        const docID = lastDocID;
        gbLog("graph.view_toggle", `doc=${docID.slice(0, 8)} → ${mode}`);
        if (mode === "full") {
            if (fullRowsCache) {
                graphMode = "full";
                await applyRowsAndLinks(fullRowsCache.rows, fullRowsCache.links, docID);
                if (lastDocID !== docID) return;
                await relayout(true);
                syncViewModeBtns();
            } else {
                onFullLoad(); // confirm 完整加载链（成功后自落 full+持久化）
                return;
            }
        } else {
            if (graphMode === "full") {
                graphFullLoadedBigDocs.delete(docID);
                graphManualRefresh = false;
            }
            graphMode = mode;
            // 期3：structure/marks 两档都消费标记集（SWR 重拉——划新线后重进档即新数据）
            if (mode === "marks" || mode === "structure") void ensureMarks(docID);
            if (!structInfo || structDocID !== docID) {
                if (fullRowsCache) {
                    await applyOutlineSkeleton(fullRowsCache.rows, fullRowsCache.links, docID, currentDocName);
                } else {
                    const r = await getGraphStructure(docID, currentDocName);
                    if (lastDocID !== docID) return;
                    await applyStructureView(r.rows, r.links, docID, r.info);
                }
            } else {
                // 同文档切档零重建：渲染层重刷（marks 档过滤生效/退回全结构）
                refreshMarkCtx();
                applyCollapsedView();
            }
            if (mode !== "treemap") await relayout(true); // 回 xyflow 档重挂布局；treemap=纯渲染层
        }
        if (lastDocID !== docID) return;
        graphModeMemo.set(docID, mode); // 会话记忆先于落盘（写后立读窗内也读得到）
        // review P2-1：同笔清退役键 custom-graph-struct-marks（「只挂标记块」checkbox 已退役，
        // 防 期3 标记感知若复用该键名时存量 "1" 成污染源——custom-graph-isVertical 同款纪律）
        siyuan.setBlockAttrs(docID, { "custom-graph-mode": mode, "custom-graph-struct-marks": "" }).catch(() => { });
        syncViewModeBtns();
    }

    // 档位按钮组态回显（graphmark 期1）：当前档钮挂 active 类（primary 高亮）。
    // graphmind □6：full/treemap 两钮+主次分隔线随 graphShowAllViewModes 开关显隐（默认
    // 只出 structure/marks 两钮；渲染期初值在 graphToolbarHTML，运行期翻转全走本函数）
    function syncViewModeBtns() {
        const group = viewModeGroupID ? document.getElementById(viewModeGroupID) : null;
        if (!group) return;
        const showAll = graphShowAllViewModes.get();
        for (const el of Array.from(group.querySelectorAll<HTMLElement>(
            '[data-graph-mode="treemap"], [data-graph-mode="full"], .tomato-graph-viewmodes__sep',
        ))) {
            el.style.display = showAll ? "" : "none";
        }
        for (const btn of Array.from(group.querySelectorAll<HTMLElement>("[data-graph-mode]"))) {
            const on = btn.dataset.graphMode === graphMode;
            btn.classList.toggle("tomato-graph-viewmode-on", on);
            btn.setAttribute("aria-pressed", on ? "true" : "false");
        }
        syncShowLevelUI(); // graphmind □4：treemap 档隐藏/回档重显+换文档档位刷新（本函数在 lastDocID 落定后被调）
    }

    // 折叠/展开 toggle：重算可见子图 + 持久化 + 局部重布局（复用 relayout 的 dagre+fitView 通道）
    async function toggleCollapseNode(id: string) {
        const pin = capturePin(id); // □1 点击时刻快照
        if (collapsedSet.has(id)) collapsedSet.delete(id);
        else collapsedSet.add(id);
        gbLog("graph.collapse_toggle", `node=${id.slice(0, 8)} → ${collapsedSet.has(id) ? "collapse" : "expand"} visible=${computeVisible(allRows, collapsedSet).visibleIds.size}/${allRows.length}`);
        applyCollapsedView();
        syncShowLevelUI(); // graphmind □4：手动折叠改变可见级——无钉（未显式选级）时派生跟进；有钉不动（级视图之上的修补）
        if (lastDocID) await saveCollapsed(lastDocID);
        await relayout(false); // □1 交互不重适配视口
        pinViewportTo(pin); // □1 被点折叠卡钉回点击前屏幕位置
    }

    // 折叠态按文档持久化（setBlockAttrs 通道；空集序列化 "[]" = 清空恢复默认推导）
    async function saveCollapsed(docID: string) {
        await siyuan.setBlockAttrs(docID, {
            "custom-graph-collapsed": serializeCollapsed(collapsedSet),
        });
    }

    // □4 回显钉（按文档会话态）：显式选级后选择器恒显所选级——手动微调是级视图之上的
    // 修补不动钉（任务语义「级数选择重置手动态，之后仍可手动微调」）；无钉（文档打开/
    // 持久化态）才走派生。派生有结构性盲区：badge-only 标题（无子容器、直属段落走徽章，
    // 如空壳 h2/末级小节）永不可折恒可见，计入=选 1 级回显漂 2，不计入=最深级派不出——
    // 派生只配当缺省，不配当回显主通道（6809 实测「1.1 节」空壳 h2 实锤）。
    // graphrelayout □7：钉值加 "auto"（工具栏选「自动」档同钉）
    const showLevelPinned = new Map<string, number | "auto">();

    // graphmind □4：级数一键收缩/展开（共识#5）——collapsedSet 整体重置为「显示到第 N 级」
    // 推导集（折叠 ≥N 级标题=第 N 级折叠卡可见、第 N+1 级起全藏——P0 修正口径；
    // 列表容器仍默认折叠=listfix 拍板不随级数抬升），手动态就此
    // 重置；落 custom-graph-collapsed 与手动折叠同键共存——此后手动微调照常走 toggleCollapseNode
    // 的持久化通道。标记感知展开不叠加（显式选级=严格级视图；●N 角标仍在折叠祖先上指路）。
    // graphrelayout □7："auto"=自适应最高标题级——换算走 settingShowLevelToExpand
    // （文档最高标题级经 base 归一化恒=相对第 1 级 ⇒ 折叠档 1；无标题 range=null 早退）
    async function applyShowLevel(show: number | "auto") {
        if (!lastDocID || !allRows.length) return;
        const range = headingRangeOf(allRows, lastDocID);
        if (!range) return;
        const level = show === "auto"
            ? settingShowLevelToExpand("auto", range)
            : showLevelToExpandLevel(show, range.max - range.base + 1);
        collapsedSet = new Set(initialCollapsedRows(allRows, level, range.base,
            graphMode === "full" ? { keepSuperExpanded: true } : undefined)); // □8 评审 P2：full 档级数重置同样不折 sb
        showLevelPinned.set(lastDocID, show); // 显式选择钉住回显（见上方钉注释）
        gbLog("graph.show_level", `show=${show} → level=${level} collapsed=${collapsedSet.size}`);
        applyCollapsedView();
        await saveCollapsed(lastDocID);
        // □1 保留 refit=true 之二：级数选择器=用户主动换级（全图级收缩/展开），预期重排+整树
        // 全览（与 toggleBadge 等单点交互不同——那是「点谁钉谁」不打扰视口的场景）
        await relayout(true); // 全图级收缩/展开：重排+重适配视口（fitReadable 真 fit）
        syncShowLevelUI();
    }

    // 选择器档位/回显维护：档=「自动」（graphrelayout □7，自适应最高标题级=设置默认档
    // 同源）+当前文档实际标题相对级 1..maxRel（无标题文档/treemap 档/未挂控件 → 隐藏）；
    // 回显值=本会话显式选过的档（钉，含 "auto"）优先，否则按当前显示态派生数字。
    // 档列表或回显值真变才重刷 options（签名比对）——防自动刷新路径把用户正开着的选择器
    // 下拉打掉
    function syncShowLevelUI() {
        if (!showLevelSelectID) return;
        const sel = document.getElementById(showLevelSelectID) as HTMLSelectElement | null;
        if (!sel) return;
        const range = lastDocID && graphMode !== "treemap" && allRows.length
            ? headingRangeOf(allRows, lastDocID)
            : null;
        if (!range) {
            sel.style.display = "none";
            sel.innerHTML = "";
            (sel as any)._gmSig = "";
            return;
        }
        const maxRel = range.max - range.base + 1;
        const pinned = showLevelPinned.get(lastDocID);
        // graphrelayout □7：默认档=auto 时无钉回显「自动」（默认档在场可见）；显式选级后按钉
        // 回显。headings/数字档默认仍按显示态派生（既有口径不变——派生值与那些档的实况同形）
        const cur = pinned === "auto" || (!pinned && normalizeExpandLevel(graphDefaultExpandLevel.get()) === "auto")
            ? "auto"
            : String(Math.min(Math.max(
                pinned ?? visibleHeadingLevel(allRows, collapsedSet, lastDocID), 1), maxRel));
        const sig = `${maxRel}:${cur}`;
        if ((sel as any)._gmSig === sig) {
            sel.style.display = "";
            return;
        }
        (sel as any)._gmSig = sig;
        sel.innerHTML = `<option value="auto"${cur === "auto" ? " selected" : ""}>${tomatoI18n.自动}</option>`
            + Array.from({ length: maxRel }, (_, i) =>
                `<option value="${i + 1}"${String(i + 1) === cur ? " selected" : ""}>${i + 1}</option>`).join("");
        sel.value = cur;
        sel.style.display = "";
    }

    // 展开目标 id 的祖先链（expandTo，期4 块→图定位链路消费）：目标在折叠子树内时不静默；
    // 返回是否有折叠变更（locateNode 据此等 relayout 尾部 fire-and-forget 的 fitView 落地再 setCenter）。
    // keepView=true（期4 聚焦通道）：relayout 不 fitView——聚焦承诺不挪图（定位路径保持默认 fitView）
    async function expandTo(id: string, keepView = false): Promise<boolean> {
        const tree = buildTreeIndex(allRows);
        if (!expandAncestors(tree, collapsedSet, id)) return false;
        gbLog("graph.expand_to", `node=${id.slice(0, 8)} visible=${computeVisible(allRows, collapsedSet).visibleIds.size}/${allRows.length}`);
        applyCollapsedView();
        syncShowLevelUI(); // graphmind □4：定位展开祖先链加深可见级——无钉时派生跟进
        if (lastDocID) await saveCollapsed(lastDocID);
        await relayout(!keepView);
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
                            // gfloat P2⑤：手动全量同样走共享缓存键——另一实例已拉同指纹则秒回
                            const updRow = await siyuan.sqlOne(`SELECT updated FROM blocks WHERE id = "${targetDocID}" AND type = "d"`);
                            const { rows, links } = await getData(
                                targetDocID,
                                currentDocName,
                                graphMaxPBlocks.get(),
                                graphMaxAllBlocks.get(),
                                updRow?.updated ?? "",
                            );
                            if (lastDocID !== targetDocID) return; // 构建期间已切走，丢弃
                            fullRowsCache = null; // 大文档不缓存全量数据（内存守恒；切回结构走 SQL 轻通道）
                            await applyRowsAndLinks(rows, links, targetDocID);
                            await relayout();
                            graphFullLoadedBigDocs.add(targetDocID);
                            graphMode = "full";
                            graphManualRefresh = true;
                            graphModeMemo.set(targetDocID, "full");
                            siyuan.setBlockAttrs(targetDocID, { "custom-graph-mode": "full", "custom-graph-struct-marks": "" }).catch(() => { }); // □3 档位存档（确认链入口；退役键同笔清理=review P2-1）
                            syncViewModeBtns();
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

    // graphrelayout □2 四态退役：旧档收敛（读旧写新，graphLayout.ts legacyLayoutConvergence
    // 纯函数承载判定）——custom-graph-layout 非 lr / 旧布尔 custom-graph-isVertical 非空的
    // 存量文档开图时一次性写回 lr+置空。原 getLayoutForm（四态读档+设置默认+顶栏钮回显）
    // 随恒 LR 退役；setBlockAttrs 不碰 updated（□5 实锤）故不 bust 指纹短路
    async function convergeLayoutForm(docID: string) {
        try {
            const attr = await siyuan.getBlockAttrs(docID);
            const write = legacyLayoutConvergence(attr);
            if (write) {
                await siyuan.setBlockAttrs(docID, write);
                gbLog("graph.layout_converge", `doc=${docID.slice(0, 8)} → lr`);
            }
        } catch (e) {
            gbLog("graph.layout_converge_err", `${e}`);
        }
    }

    // graphrelayout □6：拖拽位置存档整链退役（bear 拍板「图是结构视图不是自由画布，重排永远
    // 自动紧凑归位，拖动只当临时挪开看看」）——loadNodePositions/saveNodePositions/onNodeDragStop
    // 删除，遗留 IAL custom-graph-node-positions 惰性废弃（不再读不主动清，读到也忽略）；
    // SvelteFlow 拖拽本身保留（nodesDraggable 默认 true），任何重排自动归位

    function addRenderEdge(e: RenderEdge, into: Edge[]) {
        let label = e.label?.trim() ?? "";
        if (label === "*") label = "";
            // 边双通道（spec §3）：引用边=主色实线+闭合箭头（视觉主角；□3 加 opacity .55——纯叠加渲染后长线扫屏噪声，淡化保树形主角）；结构边=灰虚线无箭头（背景板）。
            // graphmind □2 柔和贝塞尔（学官方 listMindmap 视觉：defaultLine=--b3-border-color、
            // 1.5px、虚线 6 4、圆端帽——代码不搬）：曲率统一在 EdgeWithLabel 组件注入（全部边
            // type=labeledEdge，无 label 时组件只画 path）。stroke 走 CSS var 随主题自动换态；
            // 回边（isBackEdge）几何不动、样式同通道。（Edge.style 是 CSS 字符串非对象——与 Node.style 机制不同）
            into.push({
                id: e.id,
                source: e.rSource,
                target: e.rTarget,
                label,
                type: "labeledEdge",
                style: e.isRef
                    ? "stroke: var(--b3-theme-primary); stroke-width: 1.5; stroke-linecap: round; opacity: 0.55;"
                    : "stroke: var(--b3-border-color); stroke-width: 1.5; stroke-linecap: round; stroke-dasharray: 6 4;",
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

    // —— graphrelayout □1 视口交互钉（bear dogfood：标题一点击整图缩小、节点跑到哪不知道；
    // 双击展开同病——根因=交互链全走 relayout 默认 refit=true→fitReadable 整树真 fit〔minZoom
    // 0.02〕把视口打回全览）。交互链四族+onconnect 改 refit=false（视口 zoom+x/y 完全不动），
    // 再做「点谁钉原地」补偿：交互必然触发重排（节点集变化、其他节点挪位），重排后把被操作
    // 节点保持在其交互前的屏幕位置——交互前快照 getViewport() + 该节点中心（flow 绝对坐标
    // ×zoom+视口偏移=屏幕位置，纯 flow 数学两拍同基准），重排后按新布局位置差平移视口（zoom
    // 恒不动；被点节点未挪位则三值严格不动）。补偿=useSvelteFlow 借道 setViewport 直写三值
    // （GraphControl 注册），在事件回调链直接调安全——setViewport/setCenter 族在 $effect 内
    // 同步调会炸 effect_update_depth_exceeded（在档坑），勿进 $effect ——
    interface ViewportPin { id: string; zoom: number; vx: number; vy: number; cx: number; cy: number }
    /** subflow 子节点 position 是容器相对坐标：沿 parentId 链累加绝对坐标（GraphControl.locateID 同款） */
    function absFlowCenter(id: string): { cx: number; cy: number } | null {
        const byId = new Map($nodes.map(m => [m.id, m]));
        const n = byId.get(id);
        if (!n) return null;
        let x = n.position.x, y = n.position.y, cur: Node | undefined = n;
        while (cur?.parentId) {
            cur = byId.get(cur.parentId);
            if (!cur) break;
            x += cur.position.x; y += cur.position.y;
        }
        const w = (n as any).measured?.width ?? 172, h = (n as any).measured?.height ?? 36;
        return { cx: x + w / 2, cy: y + h / 2 };
    }
    /** 交互前快照（点击时刻=await 前）：视口三值+被点节点中心 flow 绝对坐标 */
    function capturePin(id: string): ViewportPin | null {
        const getVP = data()?.getViewport;
        if (!getVP) return null;
        const vp = getVP();
        const c = absFlowCenter(id);
        if (!vp || !c) return null;
        return { id, zoom: vp.zoom, vx: vp.x, vy: vp.y, cx: c.cx, cy: c.cy };
    }
    /** 重排后补偿：视口平移量 =（旧中心-新中心）×zoom，被点节点屏幕位置复原 */
    function pinViewportTo(pin: ViewportPin | null) {
        if (!pin) return;
        const setVP = data()?.setViewport;
        const c = setVP ? absFlowCenter(pin.id) : null;
        if (!setVP || !c) return; // 防御：节点重排后消失/桥层缺=不补偿（relayout 已 refit=false，视口仍不动）
        const dx = (pin.cx - c.cx) * pin.zoom, dy = (pin.cy - c.cy) * pin.zoom;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return; // 布局未挪被点节点：视口三值严格不动
        setVP({ x: pin.vx + dx, y: pin.vy + dy, zoom: pin.zoom }, { duration: 0 });
    }

    async function relayout(refit = true) {
        // 首布局先渲染一帧拿 measured（期3 P0：dagre 估算 172×36 与实际渲染尺寸不符是多行
        // 节点重叠的根因）——两轮：估算布局→渲染测量→measured 精修一轮。
        // graphrelayout □2：remeasure 形参随四态退役（原服务竖排形态切换的重测，恒 LR 后
        // 尺寸通道只有横排一种，两轮 measured 对一切重排生效）
        const commit = () => {
            const cloned = $nodes.map(n => ({ ...n, data: { ...n.data } }));
            const clonedEdges = $edges.map(e => ({ ...e }));
            const gs = data()?.graphStore;
            if (gs) { gs.nodes = cloned; gs.edges = clonedEdges; }
            else { nodes.set(cloned); edges.set(clonedEdges); }
        };
        await warmupMeasured();
        getLayoutedElements($nodes, $edges);
        if ($nodes.some(n => !n.measured)) {
            commit(); // 渲染一帧让 xyflow 写回 measured
            await warmupMeasured();
            getLayoutedElements($nodes, $edges);
        }
        commit();
        // fitView prop 仅初始化生效，节点重建后须手动适配视口（vision P1：骨架/全量首屏空白画布）；
        // fitView 经 GraphControl 借道（useSvelteFlow 须在 Provider 内取）；
        // refit=false=同文档内容刷新（自动刷新链）：保留当前视口，不打回用户/定位视图（期4 P1）。
        // graphmind □7fix：fitReadable=真 fit（整树入画布中心对齐，min/maxZoom 显式传参；
        // □2 的 0.8 可读下限+可见带策略被四场景终检 P1 否决退役——取舍翻转为全树可见优先）
        // graphrelayout □1：refit=true 仅存两个合理场景——_changeDoc_ 打开文档链（!refreshOnly，
        // 初次入画全览）与 applyShowLevel 级数选择器（用户主动换级）；交互链四族
        // （toggleBadge/toggleMarkCards/toggleCollapseNode）+onconnect 已全改
        // refit=false（bear dogfood：交互重适配=整图缩小节点跑飞），钉位补偿见 capturePin/pinViewportTo
        if (refit) fitReadable();
        scheduleFocusRefresh(); // 期4：relayout commit 克隆节点后邻域类补刷
    }

    // subflow 容器内边距与标题栏高（.gg padding-top 同源；视觉数值 spec 定稿后同步）
    const GROUP_PAD = 10;
    const GROUP_HEAD_H = 22;

    // 内层布局：单个容器对其直接渲染子跑小 dagre（嵌套容器先递归定尺寸），写子节点相对坐标
    // （相对容器左上角，xyflow parentId 坐标系），返回容器包围尺寸。
    // graphrelayout □2：form 形参随四态退役，rankdir 恒 LR
    function layoutGroup(
        groupId: string,
        nodeMap: Map<string, Node>,
        groupChildren: Map<string, Node[]>,
        edges: Edge[],
    ): { w: number; h: number } {
        const kids = groupChildren.get(groupId) ?? [];
        for (const kid of kids) {
            if ((kid as any).type === "tomatoGroup" && groupChildren.has(kid.id)) {
                const wh = layoutGroup(kid.id, nodeMap, groupChildren, edges);
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
        g.setGraph({ rankdir: "LR" }); // graphrelayout □2：恒 LR
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
            // □3：引用边不参与布局（只渲染叠加）——拉扯容器内子树错位/挤压同层
            if ((e as any).data?.isRef) return;
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

    // graphrelayout □2：form 形参随四态退役，rankdir 恒 LR（y 接管脑图堆叠恒生效）
    // graphrelayout □6：savedPositions 形参随拖拽位置存档退役——重排恒纯紧凑
    function getLayoutedElements(
        nodes: Node[],
        edges: Edge[],
    ) {
        const nodeMap = new Map(nodes.map((n) => [n.id, n]));

        // ---- 内层：subflow 容器尺寸+子相对坐标（嵌套递归，最深的先固定）
        const groupChildren = new Map<string, Node[]>();
        for (const n of nodes) {
            if (!n.parentId) continue;
            (groupChildren.get(n.parentId) ?? groupChildren.set(n.parentId, []).get(n.parentId)!).push(n);
        }
        for (const n of nodes) {
            if ((n as any).type === "tomatoGroup" && groupChildren.has(n.id)) {
                const wh = layoutGroup(n.id, nodeMap, groupChildren, edges);
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
        // graphrelayout □2 间距回松（bear「最好不要碰撞在一起」+ 截图自验观感定稿）：
        // nodesep 46→60、ranksep 28→60——旧值是「0.8 可读下限」窄视口时代的紧凑化（该策略
        // □7fix 已退役）；LR 卡宽 300 封顶下 ranksep 28 列间净距过挤、46 徽章悬垂下净距吃紧，
        // 双双回松到 60（列间/兄弟间呼吸感对齐官方脑图密度）。y 接管堆叠间距 NODE_GAP 同族回松见下
        dagreGraph.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 60 });
        topNodes.forEach((node) => {
            const isGroup = (node as any).type === "tomatoGroup";
            dagreGraph.setNode(node.id, {
                width: isGroup
                    ? (node.data as any).groupW ?? 120
                    : node.measured?.width ?? (node as any).data?.dagreW ?? nodeWidth,
                height: isGroup
                    ? (node.data as any).groupH ?? 60
                    : node.measured?.height ?? (node as any).data?.dagreH ?? nodeHeight,
            });
        });
        const seenTopEdge = new Set<string>();
        edges.forEach((edge) => {
            // □3：引用边不参与布局（只渲染叠加）——跨文档端点不受 rank 拉扯；展开叶列
            // 间距由 nodesep 显式给（默认 50 在 pill 悬垂下视觉净距不足，vision P2）
            if ((edge as any).data?.isRef) return;
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
        // （子贴父、兄弟文档序）；x/rank 沿用 dagre。跨文档补块的孤儿节点不在结构树内、
        // 保持原位。graphrelayout □6：手动拖拽固定子树的原位占位（savedPositions 语义）
        // 随拖拽位置存档退役——重排恒纯紧凑堆叠，无空隙
        // graphrelayout □2：原 rankdir==="LR" 包裹随 TB 态退役展开为恒跑（TB 专属的
        // 「回归 dagre 原生树」分支失去存在意义——四态退役见 graphLayout.ts）
        {
            const NODE_GAP = 40; // graphrelayout □2：28→40 间距回松（y 接管堆叠间距，与 nodesep/ranksep 60 同族；截图自验定稿）
            const docOrderSiblings = new Map<string, string[]>();
            edges.forEach((edge) => {
                if ((edge as any).data?.isRef) return; // 结构边（父子）才承载文档序
                const s = nodeIdTop(edge.source), t = nodeIdTop(edge.target);
                if (s === t) return;
                const arr = docOrderSiblings.get(s) ?? docOrderSiblings.set(s, []).get(s)!;
                if (!arr.includes(t)) arr.push(t);
            });
            let yCursor = 0;
            const yAssigned = new Map<string, number>();
            const subtreeY = (id: string): [number, number] => {
                const node = dagreGraph.node(id);
                const h = node?.height ?? nodeHeight;
                const kids = docOrderSiblings.get(id) ?? [];
                if (kids.length === 0) {
                    // 叶子按游标堆叠（□6：无 fixed 分支，恒纯紧凑无空隙）
                    const y = yCursor + h / 2;
                    yCursor += h + NODE_GAP;
                    yAssigned.set(id, y);
                    return [y - h / 2, y + h / 2];
                }
                let min = Infinity, max = -Infinity;
                for (const k of kids) {
                    const [a, b] = subtreeY(k);
                    min = Math.min(min, a); max = Math.max(max, b);
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
                if (docOrderSiblings.has(root) && !kidSet.has(root)) subtreeY(root);
            }
            yAssigned.forEach((y, id) => { dagreGraph.node(id).y = y; });
            // □2 vision P1-1 修复：y 接管后孤儿节点（跨文档端点，无结构边）的 dagre y 与重排后
            // 的结构树失配→盒叠。孤儿续排在结构树底部（右对齐树缘内侧的水平横列）——不撑宽
            // 画布 bbox（首版右侧纵列曾把 fitView 压缩到 14% 的 P1 回归），零碰撞+语义=外部附录
            {
                const placed = topNodes.filter(n => yAssigned.has(n.id));
                const orphans = topNodes.filter(n => !yAssigned.has(n.id));
                if (placed.length && orphans.length) {
                    const treeRight = Math.max(...placed.map(n => {
                        const nd = dagreGraph.node(n.id);
                        return (nd?.x ?? 0) + (nd?.width ?? nodeWidth) / 2;
                    }));
                    const baseY = Math.max(...placed.map(n => {
                        const nd = dagreGraph.node(n.id);
                        return (nd?.y ?? 0) + (nd?.height ?? nodeHeight) / 2;
                    })) + NODE_GAP * 2;
                    let oy = baseY;
                    orphans.sort((a, b) => (dagreGraph.node(a.id)?.y ?? 0) - (dagreGraph.node(b.id)?.y ?? 0));
                    for (const o of orphans) {
                        const nd = dagreGraph.node(o.id);
                        const h = nd?.height ?? nodeHeight;
                        nd.x = Math.max(treeRight - (nd?.width ?? nodeWidth) / 2, (nd?.width ?? nodeWidth) / 2);
                        nd.y = oy + h / 2;
                        oy += h + NODE_GAP;
                    }
                }
            }
        }
        gbLog("graph.dagre", `nodes=${nodes.length} tops=${topNodes.length} edges=${edges.length} ${Math.round(performance.now() - tDagre)}ms`);

        // 顶层节点绝对位置（□6：savedPositions 分支与固定节点碰撞检测随存档退役——恒 dagre
        // 紧凑位，容器内子节点跟随容器）
        topNodes.forEach((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            node.position = {
                x: nodeWithPosition.x - nodeWithPosition.width / 2,
                y: nodeWithPosition.y - nodeWithPosition.height / 2,
            };
        });

        // Handle 方向统一（subflow 子节点同款；恒 LR=左入右出）
        nodes.forEach((node) => {
            node.targetPosition = Position.Left;
            node.sourcePosition = Position.Right;
        });

        // marks P2③：结构边按几何长度降透明度——大树梳状边密带（根→N 章的长边束在根
        // 汇入区融成实线带）压淡骨架、保局部短边可读；只处理双端点均顶层的边（嵌套子流
        // 边在容器相对坐标系，跳过免炸）。引用边（视觉主角 opacity .55）与标签边不动。
        // 地板 0.25 防浅底灰虚线整体不可见（vision 约束）
        {
            const posOf = new Map(topNodes.map(n => [n.id, n.position] as const));
            for (const e of edges) {
                if ((e as any).data?.isRef || (e as any).data?.skipLenFade) continue;
                const s = posOf.get(e.source), t = posOf.get(e.target);
                if (!s || !t) continue;
                const d = Math.hypot(t.x - s.x, t.y - s.y);
                const opacity = Math.max(0.25, Math.min(1, 1 - (d - 120) / 900));
                if (opacity >= 0.99) continue;
                e.style = `stroke: var(--b3-theme-on-surface-light); stroke-width: 1.25; stroke-dasharray: 4 3; opacity: ${opacity.toFixed(2)};`;
            }
        }

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
                const isBackEdge = sp.x > tp.x; // 恒 LR：x 逆向=回边
                if (isBackEdge) {
                    const oldData: any = (edge as any).data ?? {};
                    (edge as any).data = {
                        ...oldData,
                        isBackEdge: true,
                        backEdgeDir: "down",
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
    // 渲染不在 DOM 时退化为 openTab cb-get-hl（内核 uri.ts 跳转链同款 action 组）。
    // gfloatnav：滚动/开档两条分支都算「跳去读」——末尾统一 fire onNavigate（悬浮图收面板）
    async function showBlockInEditor(blockID: string) {
        const el = editorOfRoot(rootIDOf(blockID))?.wysiwyg?.element?.querySelector(`[data-node-id="${blockID}"]`);
        if (el) {
            el.scrollIntoView({ block: "center" });
            el.classList.add("protyle-wysiwyg--hl");
            setTimeout(() => el.classList.remove("protyle-wysiwyg--hl"), 1024);
            onNavigate?.();
            return;
        }
        await OpenSyFile2(plugin, blockID, null, ["cb-get-hl", "cb-get-context", "cb-get-rootscroll"]);
        onNavigate?.();
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
        menu.addItem({ label: tomatoI18n.打开所在文档, click: () => void OpenSyFile2(plugin, node.id).then(() => onNavigate?.()) });
        // 期4 聚焦：一跳邻域高亮+其余淡化；同节点再点=退出全景（toggle 语义与标签同步）
        menu.addItem({
            label: focusTarget === node.id ? tomatoI18n.退出聚焦 : tomatoI18n.聚焦此块,
            click: () => setFocusNode(node.id),
        });
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
            await relayout(false); // □1 手动连线：用户正盯着连线两端——重适配会把目标打回全览，视口不动
        }
    }
    // 点击模型（期4）：单击=选中+编辑器轻联动（不滚动不抢焦点）；Alt+点击或双击=滚动到块。
    // 双击走 GraphNode 组件 data.dblclick 通道（Svelte Flow 无 nodedoubleclick 事件）。
    // graphClick2Locate VIP 门禁退役（导航刚需免费，语义本就不对）。
    // luji0918 □2：标记叶（clickJump）单击=跳原文位置（滚动+闪烁定位不落光标——禁聚焦
    // 拍板；陆杰「点击节点跳原文」）——轻联动对标记叶无信息量，跳转是它的本体语义
    async function nodeclick({ node, event }: { node: Node; event: MouseEvent }) {
        if ((event as PointerEvent).altKey) {
            await OpenSyFile2(plugin, node.id);
            onNavigate?.();
        } else if ((node.data as any).clickJump) {
            await showBlockInEditor(node.id);
        } else if (graphMode === "structure" && (node.data as any).toggleBadge) {
            // graphmind □2：点标题节点本体=展开/收起其段落卡（脑图心智主通道；徽章 pill 点击
            // 同款语义）——编辑器轻联动对该类节点让位（双击滚动/Alt 跳转仍在）
            await toggleBadge(node.id);
        } else {
            softLinkEditorBlock(node.id);
        }
    }
</script>

<div
    bind:this={canvas}
    class="container"
    class:tomato-graph-focusing={!!focusTarget}
    bind:clientHeight={canvasHeight}
    bind:clientWidth={canvasWidth}
>
    {#if graphMode === "treemap"}
        <!-- treemap □3：方块总览渲染层（与 xyflow 画布互斥；{#key lastDocID}=文档身份重挂
             〔下钻/选中态随切文档重置〕，同文档数据刷新走 allRows/structInfo/structRefLinks
             的 $state.raw 引用替换传导——review P2-6 陈注释纠偏）。graphmark 期3：marks 档
             迁回结构树渲染（标记路径过滤），旧 treemap marks 消费退役 -->
        {#key lastDocID}
            <GraphTreemap rows={allRows} info={structInfo!} docID={lastDocID} docName={currentDocName}
                refLinks={structRefLinks} onOpenDoc={id => void OpenSyFile2(plugin, id).then(() => onNavigate?.())} />
        {/key}
    {:else}
    <SvelteFlowProvider>
        <SvelteFlow
            bind:nodes={$nodes}
            bind:edges={$edges}
            id={newID()}
            {colorMode}
            {snapGrid}
            {edgeTypes}
            {nodeTypes}
            minZoom={FIT_MIN}
            fitView
            {ondelete}
            {onconnect}
            onnodecontextmenu={handleNodeContextMenu}
            onedgecontextmenu={handleEdgeContextMenu}
            onedgeclick={(event) => {
                event;
            }}
            onnodeclick={nodeclick}
            onpaneclick={() => clearFocus()}
        >
            <Controls showLock={true} />
            <Background gap={25} size={1.2} />
            <!-- □3：结构态藏 MiniMap——窄树条带导航价值低且库 viewBox 计算失真成「空白面板」（vision P1-4）；全量态保留 -->
            {#if graphMode !== "structure" && $nodes.length >= 30}
                <MiniMap pannable zoomable width={120} height={90} nodeColor={minimapNodeColor} />
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
        <GraphControl {dock} {plugin} />
    </SvelteFlowProvider>
    {/if}
    <!-- graphmark 期3：只看标记档全无标记=空态卡（共识文案：划线/背景色后这里成为知识地图；
         marksSettledDoc 守卫=拉取完成才判空，加载中不闪空态） -->
    {#if graphMode === "marks" && !graphLoading && structInfo && structDocID === lastDocID && marksSettledDoc === lastDocID && (docMarks?.size ?? 0) === 0}
        <!-- 期4 vision P1：全幅半透明背景幕挡画布残影（身后节点 selected 态蓝框透出破坏
             空态语义；同 loading mask 形态，卡 z6 在幕上） -->
        <div class="graph-empty-scrim"></div>
        <div class="graph-marks-empty" role="status">
            <svg class="graph-marks-empty-icon"><use xlink:href="#iconMark"></use></svg>
            <div class="graph-marks-empty-title">{tomatoI18n.还没有标记}</div>
            <div class="graph-marks-empty-body">{tomatoI18n.知识地图空态正文}</div>
            <button class="b3-button b3-button--outline" onclick={() => void setGraphMode("structure")}>{tomatoI18n.回结构视图}</button>
        </div>
    {/if}
    <!-- graphmark 期4：无结构文档空态卡（structure 档且除 doc 根外无容器行——纯平铺
         段落；大列表 listfix 已节点化不算）。按实况出口：有标记→只看标记（X 处）；
         恒给方块总览+知道了（会话态按文档收起）。样式复用 marks 空态卡族 -->
    {#if noStruct}
        <div class="graph-empty-scrim"></div>
        <div class="graph-marks-empty" role="status">
            <svg class="graph-marks-empty-icon"><use xlink:href="#iconGraphBox"></use></svg>
            <div class="graph-marks-empty-title">{tomatoI18n.无结构空态标题}</div>
            <div class="graph-marks-empty-body">{tomatoI18n.无结构空态正文}</div>
            {#if marksSettledDoc === lastDocID && (docMarks?.size ?? 0) > 0}
                <button class="b3-button b3-button--outline" onclick={() => void setGraphMode("marks")}>{tomatoI18n.只看标记处数.replace("%1", `${docMarks!.size}`)}</button>
            {/if}
            <!-- graphmind □6：treemap 入口随视图收敛开关（共识#1 收进设置默认关） -->
            {#if $graphShowAllViewModes}
                <button class="b3-button b3-button--outline" onclick={() => void setGraphMode("treemap")}>{tomatoI18n.方块总览看段落分布}</button>
            {/if}
            <button class="b3-button b3-button--outline" onclick={() => { structEmptyDismissed = [...structEmptyDismissed, lastDocID]; }}>{tomatoI18n.知道了}</button>
        </div>
    {/if}
    {#if graphLoading}
        <div class="graph-loading-mask">
            <div class="graph-loading-card">
                <span class="graph-loading-spin"></span>
                <span>{tomatoI18n.图加载中}</span>
            </div>
        </div>
    {/if}
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
    /* graphmark 期3：只看标记档空态卡（对齐官方空态卡形态——surface 底/边框/轻投影居中；
       与 □4 无结构空态同族，届时抽组件） */
    .graph-marks-empty {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 6;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        max-width: calc(100% - 32px);
        padding: 18px 22px;
        border-radius: var(--b3-border-radius-b);
        background: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        box-shadow: var(--b3-point-shadow);
        text-align: center;
    }
    .graph-marks-empty-icon {
        width: 22px;
        height: 22px;
        color: var(--b3-theme-on-surface-light);
    }
    .graph-marks-empty-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--b3-theme-on-surface);
    }
    .graph-marks-empty-body {
        font-size: 12px;
        line-height: 1.6;
        color: var(--b3-theme-on-surface-light);
    }
    /* 期4 vision P1：空态卡背景幕——挡身后画布残影（selected 态蓝框/把手透出破坏空态
       语义），与 loading mask 同形态；幕 z5 < 卡 z6，pointer-events 挡误操作 */
    .graph-empty-scrim {
        position: absolute;
        inset: 0;
        z-index: 5;
        background: color-mix(in srgb, var(--b3-theme-background) 72%, transparent);
    }
    /* graphmark 期4 聚焦模式：邻域外节点/边淡化（DOM 类切换不动节点数据——防重渲染
       闪烁）；中心节点主色描边（gn/gn-card/gn-para 三形态穿透）。transition 挂基础态
       =进/退两向都平滑；引用边 path 自带 inline opacity 0.55 与包装层相乘再淡一级 */
    .container :global(.svelte-flow__node),
    .container :global(.svelte-flow__edge) {
        transition: opacity 0.2s;
    }
    .container.tomato-graph-focusing :global(.svelte-flow__node:not(.tomato-graph-nb)) {
        opacity: 0.22;
    }
    .container.tomato-graph-focusing :global(.svelte-flow__edge:not(.tomato-graph-nb)) {
        opacity: 0.1;
    }
    .container.tomato-graph-focusing :global(.svelte-flow__node.tomato-graph-nb-center .gn),
    .container.tomato-graph-focusing :global(.svelte-flow__node.tomato-graph-nb-center .gn-card),
    .container.tomato-graph-focusing :global(.svelte-flow__node.tomato-graph-nb-center .gn-para),
    /* review P1-2：subflow 容器（sb/bq=tomatoGroup，根类 .gg 自带 dashed 边）聚焦时
       中心标记只换色不改形（dashed 语义保留） */
    .container.tomato-graph-focusing :global(.svelte-flow__node.tomato-graph-nb-center .gg) {
        border-color: var(--b3-theme-primary);
        box-shadow: 0 0 0 2px var(--b3-theme-primary-lightest);
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
