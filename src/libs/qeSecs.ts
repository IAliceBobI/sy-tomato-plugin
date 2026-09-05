// 快编辑器节列表组装（期5 方案 A 轻通道，2026-09-05 拍板）：getChildBlocks 平铺行 →
// 节列表纯函数。独立轻文件零依赖（BlockEditor.ts 是重入口——其 stores→utils→globals
// 顶层 Lute 链在 vitest 炸，纯函数单测进不来）。锁 tests/unit/blockEditorSecs.test.ts。

// 容器块短码（getChildBlocks 通道）：NodeSuperBlock=s / NodeList=l / NodeBlockquote=b /
// NodeTable=t / NodeCodeBlock=c / NodeMathBlock=m / NodeHTMLBlock=html /
// NodeAttributeView=av / NodeBlockQueryEmbed=query_embed——内核 treenode.TypeAbbr 表实证
// （treenode/node.go:392-403），与 BlockEditor.isBigBlock 的 BlockNodeEnum 枚举一一对应
export function isBigBlockType(type: string) {
    return type === "s" || type === "l" || type === "b" || type === "t" || type === "c"
        || type === "m" || type === "html" || type === "av" || type === "query_embed";
}

/** getChildBlocks 平铺行 → 节列表：优先 heading 分节（点击=聚焦整节）；
 *  无 heading 退回容器块列表。 */
export function secsFromChildRows(rows: GetChildBlocks[]): Block[] {
    if (!rows?.length) return [];
    const top: Block[] = rows.map(r => ({
        id: r.id, type: r.type, subtype: r.subType || "", content: r.content || "",
    }));
    const hs = top.filter(b => b.type == "h");
    if (hs.length > 0) return hs;
    return top.filter(b => isBigBlockType(b.type));
}
