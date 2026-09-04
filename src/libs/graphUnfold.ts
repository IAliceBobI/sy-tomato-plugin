// src/libs/graphUnfold.ts
// GraphBox 文档树→图数据预处理纯函数（自 GraphBox.ts 迁入，graphbox 二期 □1，2026-09-04）：
// 串链（seriesAllNodes）+ 标题层级化（parallelHeanders）+ 列表树形分叉（shortenList）
// + 递归驱动（unfoldBlocks）。纯同步零 IO。
//
// 二期 □1 语义（用户拍板：合并只作用于连续段落，列表/标题/超级块等结构承载者保持结构形态）：
// - 串链白名单=仅连续 p——c 非 p 不入链、前驱非 p 断链；列表/引述/代码块等一律
//   不被挂到任何前驱块下（一期病灶：topic p→l1→l2 整文档串链，链头 p 的子树
//   （=列表整树）被 mergeParagraphChains 吞成 ¶×18 大节点）。
//
// 三期 B' 语义（用户方向修正：列表要脑图式树形分叉而非容器装着）：容器只留给超级块 s
// 与引述块 b；列表剔壳 l、i 升格分叉节点+吸收项内文本（见 shortenList 注释）。

/** 串链：连续段落 p 串成 p→p 竖链（供 mergeParagraphChains 合并 ¶×N） */
export function seriesAllNodes(root: Block) {
    const children = root?.children?.slice();
    const len = children?.length;
    if (!(len > 0)) return;
    for (let i = 1; i < children.length; i++) {
        const c = children[i];
        if (c.type !== 'p') continue;
        const p = children[i - 1];
        if (p.type !== 'p') continue;
        p.children.push(c);
        c.parent = p;
        c.parent_id = p.id;
        c.data = 'm'
    }
    root.children = children.filter(c => c.data !== 'm')
    // 只清自家串链标记：'del'（shortenList 剔除/吸收标记）语义不同，误清会让
    // 项内容复活入图（三期 B'——吸收标记在 i 的 children 里，i 递归跑串链时被扫掉）
    children.forEach(c => { if (c.data === 'm') delete c.data })
    return root;
}

export function parallelHeanders(root: Block, subtypeParent: string, subtypeChild: string) {
    const children = root?.children?.slice();
    const len = children?.length;
    if (!(len > 0)) return;
    let found = false;
    let p: Block;
    for (let i = 1; i < children.length; i++) {
        if (children[i - 1].subtype === subtypeParent) {
            p = children[i - 1];
            if (!p.children) p.children = [];
        }
        if (children[i - 1].subtype < subtypeParent) {
            p = null;
        }
        const c = children[i];
        if (p && c.subtype === subtypeChild) {
            p.children.push(c);
            c.parent = p;
            c.parent_id = p.id;
            c.data = 'm'
            found = true;
        }
    }
    if (found) {
        root.children = children.filter(c => c.data !== 'm')
        children.forEach(c => { if (c.data === 'm') delete c.data })
    }
    return root;
}

/** 列表预处理（三期 B' 脑图式树形分叉，2026-09-04）：剔容器壳 l（直接子块 i 重定向
 *  挂 l 的父），i 保留为分叉节点——吸收项内全部非 l 子块文本（\n 合成；被吸收子块
 *  标 del 不入图），嵌套 l 剔除后其子（嵌套 i）挂父项下=分叉。容器壳语义只剩超级块
 *  s 与引述块 b（渲染侧 applyCollapsedView 同步收窄）。
 *  序号/勾选前缀走 div 通道（fillChildren 已存 child.div，纯函数层零 IO）：
 *  - 有序项 data-marker（如 "3."；任务项 marker="*" 故须 subtype==='o' 才作序号）
 *  - 任务项勾选态=li 类 protyle-task--done（内核 list.ts:149/153）→ ☑/☐ */
export function shortenList(block: Block) {
    if (!block) return;
    block.children?.forEach(c => shortenList(c));
    if (block.type === 'l') {
        block.children.forEach(c => c.parent_id = block.parent_id);
        block.data = 'del';
    } else if (block.type === 'i') {
        const parts: string[] = [];
        for (const c of block.children ?? []) {
            if (c.type === 'l') continue; // 嵌套壳已剔除，孙辈嵌套 i 已重定向挂本项（分叉）
            if (c.content) parts.push(c.content);
            c.data = 'del'; // 吸收语义：内容并入节点卡，子块不入图
        }
        block.content = listItemPrefix(block) + parts.join('\n');
    }
}

function listItemPrefix(item: Block): string {
    const div = (item as any).div;
    if (item.subtype === 't') {
        return div?.classList?.contains?.('protyle-task--done') ? '☑ ' : '☐ ';
    }
    if (item.subtype === 'o') {
        const marker = div?.getAttribute?.('data-marker') as string | null;
        if (marker && /\d/.test(marker)) return `${marker} `;
    }
    return '';
}

/** 递归预处理：l 走列表通道；其余串链+标题层级化。返回 DFS 序全块清单 */
export function unfoldBlocks(root: Block, all: Block[] = []) {
    if (!root) return;
    all.push(root);
    if (root.type === 'l') {
        shortenList(root)
    } else if (root.subtype === 'col') {
        // ignore
    } else {
        seriesAllNodes(root);

        parallelHeanders(root, "h5", "h6");
        parallelHeanders(root, "h4", "h6");
        parallelHeanders(root, "h3", "h6");
        parallelHeanders(root, "h2", "h6");
        parallelHeanders(root, "h1", "h6");

        parallelHeanders(root, "h4", "h5");
        parallelHeanders(root, "h3", "h5");
        parallelHeanders(root, "h2", "h5");
        parallelHeanders(root, "h1", "h5");

        parallelHeanders(root, "h3", "h4");
        parallelHeanders(root, "h2", "h4");
        parallelHeanders(root, "h1", "h4");

        parallelHeanders(root, "h2", "h3");
        parallelHeanders(root, "h1", "h3");

        parallelHeanders(root, "h1", "h2");
    }
    root.children?.forEach(c => unfoldBlocks(c, all));
    return all;
}

/** 定位兜底（二期 □2）：目标块不在图内（被 ¶ 合并/maxPBlocks 截断剔除/折叠等）时，
 *  沿真实 parent 链向上找最近的图内祖先（locateNode 据此重定向定位——永不静默也永不
 *  误导：不再把「找不到」误报成「超上限」）。环状/断链防死循环。 */
export function nearestGraphAncestor(
    startID: string,
    parentOf: (id: string) => string | undefined | null,
    graphIDs: Set<string>,
): string | undefined {
    const seen = new Set<string>([startID]);
    let cur = parentOf(startID);
    while (cur && !seen.has(cur)) {
        if (graphIDs.has(cur)) return cur;
        seen.add(cur);
        cur = parentOf(cur);
    }
    return undefined;
}
