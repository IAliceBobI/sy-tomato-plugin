// src/libs/graphStructure.ts
// graphbox □2 结构优先视图纯函数（2026-09-17）：容器子图判定/叶子归属爬链/徽标聚合/
// 引用边端点重定向/SQL 轻通道拼树。方案 A 拍板=默认只画容器块（文档根/标题/列表项/
// 超级块/引述），段落等叶子聚到最近容器祖先成徽标（「N 段 · X 字」），点徽标展开。
// 纯同步零 IO；通道无关——全量 DOM rows（小文档内存加工）与 SQL 轻行（大文档）两数据源
// 在此汇成同构产物，渲染层零分叉。
import type { GraphEdgeSpec } from "./graphCollapse";

/** 容器块=结构承载者：文档根 d/标题 h/列表项 i（l 壳在全量通道已被 shortenList 剔除，
 *  骨架通道不进容器集）/超级块 s/引述 b */
export function isStructureContainer(type: string | undefined): boolean {
    return type === "d" || type === "h" || type === "i" || type === "s" || type === "b";
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
     *  ⚠ treemap □2 起键 ⊄ 叶子：structureRowsFromOutline 骨架下退化容器（s/b/l 壳与
     *  非 outline 标题）也记入（供引用边端点重定向，不进徽标聚合）——遍历勿按「键⊆叶子」假设 */
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
 *  等深」怪相+默认展开层级压不住列表项）。返回 容器 id → 锚标题 id */
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
        if ((r.type === "i" || r.type === "s" || r.type === "b") && r.parent_id === rootID && anchor) {
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

/**
 * outline 真值骨架：getDocOutline 标题树 + 全块轻行 → 与全量 getData 同构产物
 * {rows, links, info}。rows=纯标题层级树（doc→h→h…，挂链=outline 嵌套真值，不再
 * headingStack 推断）；info=叶子归属（全块按文档序前驱标题锚归挂，sb/引述/列表
 * 容器退化进锚的徽标）——rendering 层消费形态与旧通道零分叉。
 * blocks 两通道通用：SQL 轻行（length 列字数）或 DOM 全量 rows（content.length 字数，
 * 鸭子兼容 LightBlockRow；跨文档行 root_id≠docID 自动剔除）。
 */
export function structureRowsFromOutline(
    outline: OutlineNode[],
    blocks: LightBlockRow[] | Block[],
    docID: string,
    docName: string,
    /** 文档序锚（getChildBlocks 平铺序；缺省=传入序） */
    order?: Map<string, number>,
): { rows: Block[]; links: Ref[]; info: StructureInfo } {
    // 块物理位置=沿 parent 链爬到最近的锚集成员（getChildBlocks 顶层物理序——标题物理
    // 恒顶层；嵌套块〔sb/列表内〕无自身锚，跟宿主容器锚位走，防落尾部归末章）；环防御
    const parentOfAll = new Map<string, string>();
    for (const r of blocks as LightBlockRow[]) {
        if (r.id !== docID && r.parent_id && r.id !== r.parent_id) parentOfAll.set(r.id, r.parent_id);
    }
    const blockById = new Map((blocks as LightBlockRow[]).map(r => [r.id, r]));
    // luji0918 □2 P0：DOM 通道 shortenList 把 i 重挂 l 的挂父且 l 壳行滤出 blocks——
    // i 自身不在 order、爬链跳过 l 直达根 → blockPos=1e9 落尾部，主循环 anchor 已被
    // 标题链推到末章=列表整族挂错章（vision 实锤「列表项二被标记丁」挂 1.2 章二）。
    // 桥=shortenList 盖在 i 行上的 listShellId 戳：每跳先查 order 再按戳回查壳锚位
    // （顶层 l 恒在 order；嵌套 l 的壳不在 order 时继续爬父链，外层 i 的壳戳接棒）
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
        ? [...(blocks as LightBlockRow[])].sort((a, b) => blockPos(a.id) - blockPos(b.id))
        : (blocks as LightBlockRow[]); // 无锚=传序（调用方排好；锚拉失败的兜底日志在接线层 catch——review P2-2 折衷）

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
        if (r.type === "i") info.containers.add(r.id);
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
    for (const r of ordered) {
        if (r.id === docID || processed.has(r.id)) continue;
        processed.add(r.id);
        const rid = (r as Block).root_id;
        if (rid && rid !== docID) continue; // DOM 通道跨文档端点行防御
        if (outlineIds.has(r.id)) { anchor = r.id; continue; }
        if (r.type === "i") {
            const owner = mountOf(r.id);
            const parent = owner === docID ? anchor : owner;
            rows.push({ id: r.id, type: "i", subtype: r.subtype ?? "", content: r.content ?? "", root_id: docID, parent_id: parent, docName: "" });
            links.push({ block_id: parent, def_block_id: r.id, content: "" });
            continue;
        }
        if (r.type === "h" || r.type === "l" || r.type === "s" || r.type === "b") {
            info.containerOfLeaf.set(r.id, anchor);
            continue;
        }
        // 叶子归属：容器链命中（项内文本归 i；sb 内段落穿退化壳到 doc）退前驱章节锚
        const owner = climb(r.id, new Set());
        addLeaf(r, owner && owner !== docID ? owner : anchor);
    }
    return { rows: [doc, ...rows], links, info };
}
