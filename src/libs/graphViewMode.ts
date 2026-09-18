// src/libs/graphViewMode.ts
// treemap 战役 □3（2026-09-17）：块关系图三档视图档位纯逻辑——分流常量/存档 normalize。
// bear 拍板：>300 块默认进方块档（**常量写死不开设置项**——graphMaxAllBlocks=800 是
// 全量档骨架阈值，两者语义不同勿互改）；档位按文档属性持久化 custom-graph-mode
// （同 custom-graph-layout 的 setBlockAttrs 模式），无存档=按块数分流默认。

/** 四档：structure/full/treemap + marks（□5 只看标记——treemap 家族数据过滤变体，
 *  与 treemap 同渲染层、面积=标记块字数、无标记章剩 ε 薄框；恒用户手动不进默认分流） */
export type GraphViewMode = "structure" | "full" | "treemap" | "marks";

/** 方块总览默认进入阈值（块数，bear 拍板 300——陆杰 315 块已竖链到天边） */
export const GRAPH_TREEMAP_MIN_BLOCKS = 300;

/** 无存档时的默认档：大文档进方块档、小文档结构优先；full/marks 恒用户手动（全量档危险，
 *  巨书完整加载 10~40s 不该被自动路过——三档菜单拍板的同款理由；标记是筛选视图非默认态） */
export function defaultGraphMode(blockCount: number): GraphViewMode {
    return blockCount > GRAPH_TREEMAP_MIN_BLOCKS ? "treemap" : "structure";
}

/** custom-graph-mode 属性值 normalize：四态透传，其余（旧值/垃圾/空）=undefined 走默认分流 */
export function normalizeGraphMode(v: string | undefined): GraphViewMode | undefined {
    return v === "structure" || v === "full" || v === "treemap" || v === "marks" ? v : undefined;
}
