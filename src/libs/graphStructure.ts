// src/libs/graphStructure.ts
// graphbox □2 结构优先视图纯函数（2026-09-17）：容器子图判定/叶子归属爬链/徽标聚合/
// 引用边端点重定向/SQL 轻通道拼树。方案 A 拍板=默认只画容器块，段落等叶子聚到最近
// 容器祖先成徽标（「N 段 · X 字」），点徽标展开。容器集演化：□2=标题树（列表/超级块/
// 引述退化进徽标）→ listfix=列表项 i 节点化 → graphrelayout □8（2026-09-20 bear 拍板
// 「列表块和超级块都是容器，向下打开；任务列表同列表只多勾选」）=列表壳 l/超级块 s
// 升格容器节点（默认收起 ●N，点击展开=列表项/sb 直接子块，递归适用）；引述 b=内容
// 胶囊维持徽标退化。
// 纯同步零 IO；通道无关——全量 DOM rows（小文档内存加工，壳行缺失按 listShellId 戳
// 合成）与 SQL 轻行（大文档）两数据源在此汇成同构产物，渲染层零分叉。
import type { GraphEdgeSpec } from "./graphCollapse";

/** 容器块=结构承载者：文档根 d/标题 h/列表项 i/列表壳 l/超级块 s（graphrelayout □8
 *  起 l 壳升格容器节点——全量通道仍被 shortenList 剔壳不入图，本判定供骨架通道与
 *  空态卡判据）；引述 b=块级容器但 bear 09-20 拍板「内容胶囊非容器」，骨架档维持
 *  徽标退化，□8 勿升格 */
export function isStructureContainer(type: string | undefined): boolean {
    return type === "d" || type === "h" || type === "i" || type === "l" || type === "s" || type === "b";
}

/** 块的挂载根：沿 parent 链剥掉叶子层（p→p 串链等），返回最近的容器祖先 id。
 *  思源文档树标题与内容是**兄弟**关系（标题不包含内容）——本函数只在真容器子树内生效；
 *  顶层平铺叶子的章节归属用文档序前驱标题（buildStructureInfo 主循环维护 lastHeading） */
export interface LeafAgg {
    /** 直属叶子块数（子容器的叶子归子容器，不重复计） */
    leaves: number;
    /** 直属叶子字数合计（DOM 通道=content.length；SQL 通道=length 列口径） */
    chars: number;
}

export interface StructureInfo {
    containers: Set<string>;
    /** 叶子 id → 归属容器 id（容器内叶子=parent 链上爬；顶层平铺叶子=idx 序前驱章节标题）。
     *  ⚠ treemap □2 起键 ⊄ 叶子：骨架下退化容器（b 引述与缺席 outline 的标题——□8 起
     *  s/l 已升格容器节点不再记入，见 structureRowsFromOutline 主循环 b/h 分支）也记入
     *  （供引用边端点重定向，不进徽标聚合）——遍历勿按「键⊆叶子」假设 */
    containerOfLeaf: Map<string, string>;
    /** 容器 id → 直属叶子（容器内=树序；顶层平铺=rows 序；SQL 通道叶子为无 content 桩，展开时按需取） */
    directLeaves: Map<string, Block[]>;
    /** 容器 id → 徽标聚合量 */
    leafAgg: Map<string, LeafAgg>;
}

/** 全量 rows → 结构信息（rows 须 DFS/文档序）。归属两路：
 *  ① 容器内叶子：沿 parent 链上爬最近容器祖先（seriesAllNodes 串链后链中段叶子
 *     parent=前一段 p 须穿透；环状/断链防御）
 *  ② 顶层平铺叶子（parent 链爬到文档根）：思源标题与内容是兄弟关系，章节归属=
 *     文档序上前方最近的顶层标题（hpath 语义的平铺版；无前驱标题=文档根） */
export function buildStructureInfo(rows: Block[], docID?: string): StructureInfo {
    const byId = new Map(rows.map(r => [r.id, r]));
    const containers = new Set<string>();
    for (const r of rows) if (isStructureContainer(r.type)) containers.add(r.id);

    const climbMemo = new Map<string, string | undefined>();
    const climb = (id: string, seen: Set<string>): string | undefined => {
        if (climbMemo.has(id)) return climbMemo.get(id);
        if (seen.has(id)) return undefined; // 环防御
        seen.add(id);
        const cur = byId.get(id);
        if (!cur) return undefined;
        if (containers.has(id)) return id;
        const hit = cur.parent_id ? climb(cur.parent_id, seen) : undefined;
        climbMemo.set(id, hit);
        return hit;
    };
    const rootID = docID ?? byId.get(rows[0]?.id ?? "")?.root_id ?? "";
    const addLeaf = (r: Block, owner: string, out: StructureInfo) => {
        out.containerOfLeaf.set(r.id, owner);
        (out.directLeaves.get(owner) ?? out.directLeaves.set(owner, []).get(owner)!).push(r);
        const agg = out.leafAgg.get(owner) ?? { leaves: 0, chars: 0 };
        agg.leaves++;
        agg.chars += (r.content ?? "").length;
        out.leafAgg.set(owner, agg);
    };

    const out: StructureInfo = { containers, containerOfLeaf: new Map(), directLeaves: new Map(), leafAgg: new Map() };
    // 章节锚序列：不在 s/b/i 容器内的标题（挂标题链下的 h2 算章节）。parallelHeanders
    // 层级化挪动后 rows 数组序≠文档序，锚按 idx 排序（data-node-index=真文档序，拖拽
    // 重排也准）；idx 缺失退 id 时间戳序≈文档序（骨架通道同款容忍）
    const headingSeq = rows
        .filter(r => r.type === "h")
        .map(r => ({ r, c: climb(r.id, new Set()) }))
        .filter(({ c }) => c === rootID || (c !== undefined && byId.get(c)?.type === "h"))
        .map(({ r }) => r)
        .sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0) || (a.id < b.id ? -1 : 1));
    for (const r of rows) {
        if (containers.has(r.id)) continue;
        const chainHit = climb(r.id, new Set());
        if (chainHit && chainHit !== rootID) {
            addLeaf(r, chainHit, out); // ① 容器内叶子
            continue;
        }
        if (chainHit === rootID || (!chainHit && r.parent_id === rootID)) {
            // ② 顶层平铺叶子→idx 序前驱最近章节标题（无前驱=文档根）
            let owner = rootID;
            for (const h of headingSeq) {
                const hi = h.idx ?? 0, li = r.idx ?? 0;
                if (hi < li || (hi === li && h.id < r.id)) owner = h.id;
                else break;
            }
            addLeaf(r, owner, out);
        }
        // 爬不到根也不在容器内（脏数据）：不归属不丢图（渲染层叶子可见性自行判）
    }
    return out;
}

/** 引用边端点重定向：端点是叶子→改挂其容器祖先（徽标承载引用语义）；重定向后自环丢弃、
 *  同序对去重（反向互链=两条有向边各自保留）。无叶子端点=原数组引用返回（零拷贝） */
export function redirectLinksToContainers<T extends GraphEdgeSpec>(links: T[], info: StructureInfo): T[] {
    if (!links.some(l => info.containerOfLeaf.has(l.source) || info.containerOfLeaf.has(l.target))) {
        return links;
    }
    const seen = new Set<string>();
    const out: T[] = [];
    for (const e of links) {
        const s = info.containerOfLeaf.get(e.source) ?? e.source;
        const t = info.containerOfLeaf.get(e.target) ?? e.target;
        if (s === t) continue; // 双端同容器=自环
        // 去重 key 分边通道（treemap □2 接线实锤）：嵌套骨架的结构边（章→节）与重定向后
        // 同 pair 的引用边（章内段落→节内引述）语义不同（引用=叠加渲染），同 key 去重
        // 会把引用边静默吞掉
        const key = (e.isRef ? "R:" : "S:") + s + "->" + t;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(e.source === s && e.target === t ? e : { ...e, source: s, target: t });
    }
    return out;
}

/** SQL 轻行（getRows select id,type,subtype,content,parent_id[,length]）：大文档结构数据源 */
export interface LightBlockRow {
    id: string;
    type: string;
    subtype: string;
    content: string;
    parent_id: string;
    /** 可选：blocks.length 列（≈content 字符量）——有则徽标字数用它（叶子行 content 通常空取省流量） */
    length?: number;
    /** graphrelayout □9 胶囊呈现补集透传（DOM 通道 fillChildren 直提）：表格行数/媒体
     *  文件名/av 块 id——addLeaf 重建叶子 Block 时原样携带，防直提字段在中途丢失 */
    tableRows?: number;
    tableHead?: string;
    media?: string;
    avID?: string;
}

/** 章节自动编号（□3，2026-09-17，思绪大纲感）：标题链 DFS 序 1 / 1.1 / 1.1.1。
 *  只编文档根标题链（parallelHeanders/SQL 通道均已把标题层级化挂链）；s/b/i 容器
 *  内的标题与列表/超级块/引述本身不参与（图标语义自足+有序列表自带序号防双编号）。
 *  深层回到浅层时深层计数清零（1.1 → 2 → 2.1 而非 2.2） */
export function numberHeadingChain(rows: Block[], rootID: string): Map<string, string> {
    const childrenOf = new Map<string, Block[]>();
    for (const r of rows) {
        if (r.id === rootID) continue;
        (childrenOf.get(r.parent_id) ?? childrenOf.set(r.parent_id, []).get(r.parent_id)!).push(r);
    }
    const out = new Map<string, string>();
    const counters: number[] = [];
    const walk = (parent: string, depth: number) => {
        for (const c of childrenOf.get(parent) ?? []) {
            if (c.type !== "h") continue; // 非标题不编不递归（其内标题一并跳过）
            counters[depth] = (counters[depth] ?? 0) + 1;
            counters.length = depth + 1; // 深层计数清零
            const label = counters.slice(0, depth + 1).join(".");
            out.set(c.id, label);
            walk(c.id, depth + 1);
        }
    };
    walk(rootID, 0);
    return out;
}

/** 顶层非标题容器的章节领地锚（□3 vision 方案 A 配套）：挂文档根的列表/超级块/引述
 *  → idx 序前驱最近章节标题（与骨架通道叶子的前驱章节锚语义对齐——DOM 通道
 *  shortenList 把 i 挂回 doc 顶层是领地概念之前的行为，导致「doc→sb→H2 与 doc→H1→H2
 *  等深」怪相+默认展开层级压不住列表项）。□8：列表壳 l 同列（合成壳 parent=doc 与
 *  SQL 壳行同形，applyStructureView 领地重挂依赖本表）。返回 容器 id → 锚标题 id */
export function chapterAnchorMap(rows: Block[], rootID: string): Map<string, string> {
    const out = new Map<string, string>();
    // 遍历序=rows 数组序（getData 产物=DFS 文档序）——data-node-index 是**层内局部序**
    // （嵌套列表项 idx=2 < 顶层标题 idx=5），跨层排 idx 会把容器排到标题前锚错章
    const byId = new Map(rows.map(r => [r.id, r]));
    const topHeadingIds = new Set(rows
        .filter(r => r.type === "h" && (r.parent_id === rootID || byId.get(r.parent_id ?? "")?.type === "h"))
        .map(r => r.id));
    let anchor: string | undefined;
    for (const r of rows) {
        if (r.id === rootID) continue;
        if (r.type === "h" && topHeadingIds.has(r.id)) { anchor = r.id; continue; }
        if ((r.type === "i" || r.type === "l" || r.type === "s" || r.type === "b") && r.parent_id === rootID && anchor) {
            out.set(r.id, anchor);
        }
    }
    return out;
}

// ── treemap 战役 □2 方案 A（2026-09-17）：outline 真值骨架 ──────────────────
// 章节骨架改用内核 getDocOutline 当真值（跟左栏大纲面板永远一致——陆杰 19:47 实锤
// 「一」章缺失/杂块混链后 bear 拍板）；段落体量徽标在骨架上自算归属（文档序前驱
// 标题锚法）；sb/引述/列表容器退化进徽标（不再节点化，容器语义损失先接受）。
// 6810 真样本核过 outline 嵌套契约：顶层节点子标题在 blocks[]、次层起在 children[]
// （混合双通道）；name（顶层）/content（次层）带 HTML 实体（nameIsHTML）。

/** outline 节点最小结构（getDocOutline 响应的鸭子子集，直接传内核类型亦可） */
export interface OutlineNode {
    id: string;
    subType: string;
    /** 顶层节点标题文本（含 HTML 实体；次层节点真样本 name="" 落 content） */
    name?: string;
    content?: string;
    blocks?: OutlineNode[];
    children?: OutlineNode[] | null;
}

/** 常见 HTML 实体解码（outline 的 name/content 带 &nbsp; 等，nameIsHTML=true） */
export function decodeHTMLEntities(s: string): string {
    return s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
}

/** DOM 通道行（LightBlockRow + shortenList 的壳戳，鸭子兼容 Block） */
export type ShellStampRow = LightBlockRow & { listShellId?: string };

/**
 * □8 DOM 通道 l 壳合成：shortenList 已剔壳行的行集（i 带 listShellId 戳、壳行不在场）
 * 重建壳行并重挂成员（成员 parent→壳 id），与 SQL 通道（壳行在场）汇成同构输入。
 * - 零合成直通：戳指壳已在块集（SQL 通道）原数组引用返回（零拷贝）
 * - 不改传入对象：fullRowsCache 跨档复用（full 档依赖 i.parent=物理父），成员行浅拷贝
 * - 合成壳插首成员前（无 order 时保传入序=壳先于项，y 布局 DFS 文档序）
 * - 嵌套壳同样合成（嵌套 i 戳指嵌套壳、parent=外层 i）：sb 套列表逐级还原
 */
export function synthesizeListShells<T extends ShellStampRow>(blocks: T[]): T[] {
    const ids = new Set(blocks.map(r => r.id));
    const reattach = new Map<T, string>(); // 成员行 → 缺失壳 id
    for (const r of blocks) {
        const shell = r.listShellId;
        if (!shell || shell === r.id || ids.has(shell)) continue;
        reattach.set(r, shell);
    }
    if (!reattach.size) return blocks;
    const synthed = new Set<string>();
    const out: T[] = [];
    for (const r of blocks) {
        const shell = reattach.get(r);
        if (shell === undefined) {
            out.push(r);
            continue;
        }
        if (!synthed.has(shell)) {
            // 合成壳：id/壳 id、type=l、parent=首成员原 parent（shortenList 重挂语义：同壳
            // 顶层项共父=l 的挂父）、subtype 随首成员（u/o/t 即列表种类）；壳自身无戳
            synthed.add(shell);
            out.push({ ...r, id: shell, type: "l", subtype: r.subtype, content: "", length: 0, listShellId: undefined });
        }
        out.push({ ...r, parent_id: shell });
    }
    return out;
}

/**
 * outline 真值骨架：getDocOutline 标题树 + 全块轻行 → 与全量 getData 同构产物
 * {rows, links, info}。rows=标题层级树（doc→h→h…，挂链=outline 嵌套真值，不再
 * headingStack 推断）+ 容器节点（listfix：列表项 i；□8：列表壳 l/超级块 s）；info=叶子
 * 归属（全块按文档序前驱标题锚/宿主容器归挂；引述 b 维持徽标退化）——rendering 层
 * 消费形态与旧通道零分叉。
 * blocks 两通道通用：SQL 轻行（length 列字数）或 DOM 全量 rows（content.length 字数，
 * 鸭子兼容 LightBlockRow；跨文档行 root_id≠docID 自动剔除；DOM 行先经
 * synthesizeListShells 还原壳）。
 */
export function structureRowsFromOutline(
    outline: OutlineNode[],
    blocks: LightBlockRow[] | Block[],
    docID: string,
    docName: string,
    /** 文档序锚（getChildBlocks 平铺序；缺省=传入序） */
    order?: Map<string, number>,
): { rows: Block[]; links: Ref[]; info: StructureInfo } {
    // □8：DOM 通道壳行合成（SQL 通道直通）——此后 i.parent=l、壳行在场，两通道同构
    const unified = synthesizeListShells(blocks as ShellStampRow[]);
    // 块物理位置=沿 parent 链爬到最近的锚集成员（getChildBlocks 顶层物理序——标题物理
    // 恒顶层；嵌套块〔sb/列表内〕无自身锚，跟宿主容器锚位走，防落尾部归末章）；环防御
    const parentOfAll = new Map<string, string>();
    for (const r of unified) {
        if (r.id !== docID && r.parent_id && r.id !== r.parent_id) parentOfAll.set(r.id, r.parent_id);
    }
    const blockById = new Map(unified.map(r => [r.id, r]));
    // luji0918 □2 P0：DOM 通道 shortenList 把 i 重挂 l 的挂父且 l 壳行滤出 blocks——
    // i 自身不在 order、爬链跳过 l 直达根 → blockPos=1e9 落尾部，主循环 anchor 已被
    // 标题链推到末章=列表整族挂错章（vision 实锤「列表项二被标记丁」挂 1.2 章二）。
    // 桥=shortenList 盖在 i 行上的 listShellId 戳：每跳先查 order 再按戳回查壳锚位
    // （顶层 l 恒在 order；嵌套 l 的壳不在 order 时继续爬父链，外层 i 的壳戳接棒；
    // □8 起合成壳行已注入——顶层壳自身就在 order，嵌套壳爬父链到外层项的戳）
    const blockPos = (id: string): number => {
        let cur = id;
        const seen = new Set<string>();
        while (cur && !seen.has(cur)) {
            if (order?.has(cur)) return order.get(cur)!;
            const shell = (blockById.get(cur) as { listShellId?: string } | undefined)?.listShellId;
            if (shell && order?.has(shell)) return order.get(shell)!;
            seen.add(cur);
            cur = parentOfAll.get(cur) ?? "";
        }
        return 1e9;
    };
    // 双通道行（SQL 轻行/DOM 全量 rows）数据同构，统一按轻行消费（Block 的可选字段
    // 都是物理在场的——id/type/subtype/parent_id 读写两侧一致）
    // graphbox-listfix：tie-break 去掉 id 时间戳兜底改保传入序（sort 稳定）——嵌套块的
    // blockPos 爬到宿主锚位即并列（DOM 通道 l 壳行已滤时甚至全落尾部），按 id 序排会把
    // 子项排到父项前（挂链虽已免疫，但 rows/links 构建序=y 脑图文档序仍乱——vision
    // 实锤深层项序不符文档序）。传入序=DOM DFS 物理序（真文档序）；SQL 通道传序=查询
    // 返回序（无锚时同现状容忍）
    const ordered: LightBlockRow[] = order?.size
        ? [...unified].sort((a, b) => blockPos(a.id) - blockPos(b.id))
        : unified; // 无锚=传序（调用方排好；锚拉失败的兜底日志在接线层 catch——review P2-2 折衷）

    // outline 树 DFS 展开（=文档序标题序列）；blocks/children 双通道都走（真样本顶层用
    // blocks 次层用 children，防御性双收）；脏行（id 空/重复/块集外幽灵标题）跳过
    const outlineIds = new Set<string>();
    const rows: Block[] = [];
    const links: Ref[] = [];
    const walk = (nodes: OutlineNode[] | null | undefined, parentId: string) => {
        for (const n of nodes ?? []) {
            if (!n?.id || outlineIds.has(n.id) || !blockById.has(n.id)) continue;
            outlineIds.add(n.id);
            rows.push({
                id: n.id, type: "h", subtype: n.subType || "h1",
                content: decodeHTMLEntities(n.name || n.content || ""),
                root_id: docID, parent_id: parentId, docName: "",
            });
            links.push({ block_id: parentId, def_block_id: n.id, content: "" });
            walk(n.blocks, n.id);
            walk(n.children, n.id);
        }
    };
    walk(outline, docID);
    const doc: Block = { id: docID, type: "d", content: docName, subtype: "", root_id: docID, parent_id: docID, docName: "" };

    // 叶子归属：ordered 全块序，标题行推进锚（容器内标题不在 outline=不推进）；叶子=
    // 非 d/h/l/s/b/i 的行（p/c/t…全进徽标）；退化容器（s/b/l 壳与非 outline 标题）不进
    // 徽标聚合但记入 containerOfLeaf——供引用边端点重定向（引述/超级块是常见 ref 目标，
    // review P1-1：不记则整条边静默蒸发）。**注意：containerOfLeaf 键 ⊄ 叶子**（消费方=
    // redirectLinksToContainers 与日志）。同 id 重复物理行只计首次（blocks 表偶发脏行，
    // 防 keyed each 重复 key 冻结——review P2-1）。directLeaves 透传 length（treemap □1
    // weightOfLeaf 消费）
    //
    // graphbox-listfix（2026-09-18 bear 反馈）：列表项 i 容器化进树（嵌套层级=缩进层次，
    // 纯列表文档不再塌 [doc] 孤点）；挂链=沿 parent 爬穿透 l 壳/退化壳（s/b）到容器集
    // 成员（已挂 i/标题），爬到 doc 挂章节锚（文档序前驱标题——sb 内列表穿透退化壳跟
    // sb 内段落同锚语义）。**i 集先全量预收集再挂链**：ordered 处理序无父子拓扑保证
    // （DOM 通道 l 壳行已滤→嵌套 i 的 blockPos 爬不到物理锚全落尾部按 id 时间戳序、
    // SQL 通道同壳内 id 序也乱——6810 实锤：父 i 未处理=不在容器集，子 i 爬穿到 doc
    // 平铺挂锚=层级丢失）；预收集后挂链免疫处理序，父 i 恒在集。项内文本块（SQL 形态
    // 在场；DOM 形态已被 shortenList 吸收）归所属 i 的徽标。
    const info: StructureInfo = { containers: new Set([docID, ...outlineIds]), containerOfLeaf: new Map(), directLeaves: new Map(), leafAgg: new Map() };
    const seenRows = new Set<string>();
    for (const r of ordered) {
        // 预收集条件与主循环一致：去重+本档（跨文档行无挂链资格；root_id 判定同下）
        if (r.id === docID || seenRows.has(r.id)) continue;
        seenRows.add(r.id);
        const rid = (r as Block).root_id;
        if (rid && rid !== docID) continue;
        // 容器集=i/l/s（listfix：列表项；□8：列表壳/超级块升格；引述 b 不升格）。
        // **i/l 集先全量预收集再挂链**：ordered 处理序无父子拓扑保证（嵌套壳/子项的
        // blockPos 爬不到物理锚全落尾部）——预收集后挂链免疫处理序，父恒在集
        if (r.type === "i" || r.type === "l" || r.type === "s") info.containers.add(r.id);
    }
    const mountOf = (id: string): string => {
        const seen = new Set<string>();
        let pid = parentOfAll.get(id) ?? "";
        while (pid && pid !== id && !seen.has(pid)) {
            if (info.containers.has(pid)) return pid;
            seen.add(pid);
            pid = parentOfAll.get(pid) ?? "";
        }
        return docID;
    };
    const addLeaf = (r: LightBlockRow, owner: string) => {
        const leaf: Block = { id: r.id, type: r.type, subtype: r.subtype, content: r.content ?? "", root_id: docID, parent_id: r.parent_id, docName: "", length: r.length };
        // □9 胶囊呈现补集透传（DOM 通道直提字段；SQL 通道 undefined=渲染层按 markdown 列补）
        if (r.tableRows !== undefined) leaf.tableRows = r.tableRows;
        if (r.tableHead) leaf.tableHead = r.tableHead;
        if (r.media) leaf.media = r.media;
        if (r.avID) leaf.avID = r.avID;
        info.containerOfLeaf.set(r.id, owner);
        (info.directLeaves.get(owner) ?? info.directLeaves.set(owner, []).get(owner)!).push(leaf);
        const agg = info.leafAgg.get(owner) ?? { leaves: 0, chars: 0 };
        agg.leaves++;
        agg.chars += r.length ?? (r.content ?? "").length;
        info.leafAgg.set(owner, agg);
    };
    const climbMemo = new Map<string, string | undefined>();
    const climb = (id: string, seen: Set<string>): string | undefined => {
        if (climbMemo.has(id)) return climbMemo.get(id);
        if (seen.has(id)) return undefined;
        seen.add(id);
        if (info.containers.has(id)) return id;
        const p = parentOfAll.get(id);
        const hit = p ? climb(p, seen) : undefined;
        climbMemo.set(id, hit);
        return hit;
    };
    let anchor = docID;
    const processed = new Set<string>();
    // 物理文档序键（□8 评审 P2）：ordered 迭代号=真文档序（blockPos 锚序+稳定并列保传入
    // 序）——标题行在 walk 已先推完、容器行主循环才推，直接以推送序出边会破文档序
    const docSeq = new Map<string, number>();
    let seq = 0;
    for (const r of ordered) {
        if (r.id === docID || processed.has(r.id)) continue;
        processed.add(r.id);
        const rid = (r as Block).root_id;
        if (rid && rid !== docID) continue; // DOM 通道跨文档端点行防御
        docSeq.set(r.id, seq++);
        if (outlineIds.has(r.id)) { anchor = r.id; continue; }
        // 容器节点：i（listfix）/l、s（□8 升格）——挂宿主容器（嵌套：项挂壳、壳挂 sb、
        // sb 套 sb），物理爬到 doc 者挂前驱章节锚（文档序，锚序坑见 chapterAnchorMap）
        if (r.type === "i" || r.type === "l" || r.type === "s") {
            const owner = mountOf(r.id);
            const parent = owner === docID ? anchor : owner;
            rows.push({ id: r.id, type: r.type, subtype: r.subtype ?? "", content: r.content ?? "", root_id: docID, parent_id: parent, docName: "" });
            links.push({ block_id: parent, def_block_id: r.id, content: "" });
            continue;
        }
        // 引述 b 维持徽标退化（bear：内容胶囊非容器）——记 containerOfLeaf 供 ref 端点
        // 重定向，不进徽标聚合不节点化（review P1-1 语义保留）
        if (r.type === "b") {
            info.containerOfLeaf.set(r.id, anchor);
            continue;
        }
        // 非 outline 标题（sb/引述/列表内标题）：退化为宿主容器直属叶子（□8——sb 内
        // 标题进 sb 徽标可展开；此前纯记 containerOfLeaf=静默蒸发，sb 容器化后须可见）
        if (r.type === "h") {
            const owner = climb(r.id, new Set());
            addLeaf(r, owner && owner !== docID ? owner : anchor);
            continue;
        }
        // 叶子归属：容器链命中（项内文本归 i；sb 内段落归 sb）退前驱章节锚
        const owner = climb(r.id, new Set());
        addLeaf(r, owner && owner !== docID ? owner : anchor);
    }
    // □8 评审 P2（实测：容器恒排同章小节标题后）：walk 先推完全部标题结构边、容器边在
    // 主循环才推，而 y 接管的兄弟序纯按边数组序构建（GraphBox docOrderSiblings）→ 同章
    // 内「标题、容器」渲染序≠物理文档序。按 docSeq 稳定重排：rows 全体（chapterAnchorMap
    // 遍历序=文档序契约同享）+ links 同父兄弟段（跨父对 0 保序，父组相对位次不动）
    rows.sort((a, b) => (docSeq.get(a.id) ?? Infinity) - (docSeq.get(b.id) ?? Infinity));
    links.sort((a, b) => a.block_id === b.block_id
        ? (docSeq.get(a.def_block_id) ?? Infinity) - (docSeq.get(b.def_block_id) ?? Infinity)
        : 0);
    return { rows: [doc, ...rows], links, info };
}
