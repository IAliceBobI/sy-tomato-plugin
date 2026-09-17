// src/libs/graphStructure.ts
// graphbox □2 结构优先视图纯函数（2026-09-17）：容器子图判定/叶子归属爬链/徽标聚合/
// 引用边端点重定向/SQL 轻通道拼树。方案 A 拍板=默认只画容器块（文档根/标题/列表项/
// 超级块/引述），段落等叶子聚到最近容器祖先成徽标（「N 段 · X 字」），点徽标展开。
// 纯同步零 IO；通道无关——全量 DOM rows（小文档内存加工）与 SQL 轻行（大文档）两数据源
// 在此汇成同构产物，渲染层零分叉。
import type { GraphEdgeSpec } from "./graphCollapse";

/** 容器块=结构承载者：文档根 d/标题 h/列表项 i（l 壳在全量通道已被 shortenList 剔除，
 *  SQL 轻通道在 structureRowsFromSql 剔）/超级块 s/引述 b */
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
    /** 叶子 id → 归属容器 id（容器内叶子=parent 链上爬；顶层平铺叶子=idx 序前驱章节标题） */
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
        const key = s + "->" + t;
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

/** SQL 轻行 → 容器子图产物（与全量 getData 同构 {rows, links} + 结构信息）：
 *  - 容器行（d/h/i/s/b）拼树；**l 壳剔除**（i 重挂 l 的父，语义对齐全量通道 shortenList——
 *    无 DOM 通道的 marker/勾选前缀，SQL content 纯文本直用）
 *  - 孤儿容器（父不在集内，索引延迟/脏数据）挂文档根不丢
 *  - 叶子行不进 rows 只作聚合（字数优先 length 列）；归属爬链在全块 parent 映射上
 *    （叶子 parent 可以是叶子/已剔除的 l——穿透到最近容器） */
export function structureRowsFromSql(
    lightRows: LightBlockRow[],
    docID: string,
    docName: string,
    /** 文档序锚：块 id → 平铺序号（getChildBlocks 通道——批量创建的块 id 尾部随机且
     *  hpath 永久停在文档级不回填，两者都非真序；标题恒为顶层块故编号全靠此锚。
     *  缺失回退 id 序（真实文档渐进编辑时 id 序≈文档序） */
    order?: Map<string, number>,
): { rows: Block[]; links: Ref[]; info: StructureInfo } {
    const ordered = order?.size
        ? [...lightRows].sort((a, b) => (order.get(a.id) ?? 1e9) - (order.get(b.id) ?? 1e9) || (a.id < b.id ? -1 : 1))
        : lightRows;
    const parentOfAll = new Map<string, string>();
    for (const r of lightRows) if (r.id !== docID) parentOfAll.set(r.id, r.parent_id);

    const byId = new Map(lightRows.map(r => [r.id, r]));
    const mk = (r: LightBlockRow, parentId: string): Block => ({
        id: r.id, type: r.type, subtype: r.subtype, content: r.content,
        root_id: docID, parent_id: parentId, docName: "",
    });

    // l 壳穿透：容器的挂载父=l 壳链向上最近的非 l 祖先
    const mountParent = (id: string, seen: Set<string>): string => {
        let cur = parentOfAll.get(id) ?? docID;
        while (byId.get(cur)?.type === "l") {
            if (seen.has(cur)) break;
            seen.add(cur);
            cur = parentOfAll.get(cur) ?? docID;
        }
        return cur;
    };

    const doc: Block = { id: docID, type: "d", content: docName, subtype: "", root_id: docID, parent_id: docID, docName: "" };
    const rows: Block[] = [];
    const links: Ref[] = [];
    const containerById = new Map<string, Block>([[docID, doc]]);
    // 章节领地（骨架 hpath 语义的 SQL 平铺版，id 时间戳序≈文档序——骨架通道同款容忍）：
    // - 标题按 subtype 层级挂最近低级标题（h1→doc，h2→前面最近的 h1…），领地到下一标题止
    // - 真父为文档根的容器（列表/超级块/引述）挂当前章节标题（章节内容的心智模型）
    // - 真父为 s/b/i/l 的容器挂真父（l 壳穿透）
    // 顶层判定：mountParent 链上无 s/b/i（纯 l 壳穿透到 doc）
    const inContentContainer = (id: string, seen: Set<string>): boolean => {
        let cur = parentOfAll.get(id);
        while (cur && cur !== docID) {
            const t = byId.get(cur)?.type;
            if (t === "s" || t === "b" || t === "i" || t === "l") return true;
            if (seen.has(cur)) return true;
            seen.add(cur);
            cur = parentOfAll.get(cur);
        }
        return false;
    };
    const headingStack: Block[] = []; // 各层级最近的章节标题（[h1, h2, ...] 按 subtype 深度）
    let currentHeading: Block = doc;
    const addContainer = (r: LightBlockRow, parent: Block) => {
        const row = mk(r, parent.id);
        (parent.children ??= []).push(row);
        rows.push(row);
        links.push({ block_id: parent.id, def_block_id: row.id, content: "" });
        containerById.set(r.id, row);
        return row;
    };
    for (const r of ordered) {
        if (r.id === docID || !isStructureContainer(r.type) || r.type === "l") continue;
        const top = !inContentContainer(r.id, new Set());
        if (r.type === "h") {
            const depth = parseInt(r.subtype?.[1] ?? "1", 10) || 1;
            if (top) {
                while (headingStack.length >= depth) headingStack.pop();
                const parent = headingStack[headingStack.length - 1] ?? doc;
                currentHeading = addContainer(r, parent);
                headingStack.push(currentHeading);
                continue;
            }
            addContainer(r, containerById.get(mountParent(r.id, new Set())) ?? doc); // 容器内标题挂容器
            continue;
        }
        const pid = mountParent(r.id, new Set());
        const parent = pid === docID && top ? currentHeading : (containerById.get(pid) ?? doc);
        addContainer(r, parent);
    }

    // 叶子聚合（两遍合一，id 序推进）：顶层平铺叶子→当前章节锚 leafHeading
    // （与容器遍历的章节领地同款语义）；容器内叶子爬真 parent 链到最近容器
    const info: StructureInfo = { containers: new Set(containerById.keys()), containerOfLeaf: new Map(), directLeaves: new Map(), leafAgg: new Map() };
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
    const addLeaf = (r: LightBlockRow, owner: string) => {
        info.containerOfLeaf.set(r.id, owner);
        (info.directLeaves.get(owner) ?? info.directLeaves.set(owner, []).get(owner)!).push(mk(r, owner));
        const agg = info.leafAgg.get(owner) ?? { leaves: 0, chars: 0 };
        agg.leaves++;
        agg.chars += r.length ?? (r.content ?? "").length;
        info.leafAgg.set(owner, agg);
    };
    let leafHeading: Block = doc; // 顶层章节锚（文档序推进；h 挂 s/b/i 容器内的不推进）
    for (const r of ordered) {
        if (r.id === docID) continue;
        const top = !inContentContainer(r.id, new Set());
        if (r.type === "h") {
            if (top) { const row = containerById.get(r.id); if (row) leafHeading = row; }
            continue;
        }
        if (isStructureContainer(r.type) || r.type === "l") continue; // 容器不产叶子聚合
        if (top && mountParent(r.id, new Set()) === docID) {
            addLeaf(r, leafHeading.id); // 顶层平铺叶子→章节锚
            continue;
        }
        const owner = climb(r.id, new Set());
        if (owner) addLeaf(r, owner); // 容器内叶子（含 l 壳内项文本块）
    }
    return { rows: [doc, ...rows], links, info };
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
 *  → idx 序前驱最近章节标题（与 SQL 通道 structureRowsFromSql 的领地语义对齐——DOM 通道
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
