// src/libs/graphViewMode.ts
// treemap 战役 □3（2026-09-17）起档 → graphmark 期1（2026-09-18）翻新：块关系图四档
// 档位纯逻辑——默认档/存档 normalize/旧存档迁移。档位按文档属性持久化
// custom-graph-mode（同 custom-graph-layout 的 setBlockAttrs 模式），无存档=默认 structure。

/** 四档：structure/full/treemap + marks（「只看标记」——期1 沿用 treemap 家族筛选渲染，
 *  期3 重定义为结构图标记路径视图；恒用户手动不进默认） */
export type GraphViewMode = "structure" | "full" | "treemap" | "marks";

/** 无存档时的默认档：恒 structure。graphmark 期1 bear 拍板（2026-09-18）——原
 *  GRAPH_TREEMAP_MIN_BLOCKS=300「大文档自动进方块档」分流退役、常量删除，方块家族降
 *  纯手动；blockCount 形参保留=调用方签名稳定，语义留档。full/marks 恒用户手动
 *  （全量档危险，巨书完整加载 10~40s 不该被自动路过；标记是筛选视图非默认态） */
export function defaultGraphMode(_blockCount: number): GraphViewMode {
    return "structure";
}

/** custom-graph-mode 属性值 normalize：四态透传，其余（旧值/垃圾/空）=undefined 走默认档 */
export function normalizeGraphMode(v: string | undefined): GraphViewMode | undefined {
    return v === "structure" || v === "full" || v === "treemap" || v === "marks" ? v : undefined;
}

/** graphmark 期1 旧存档迁移（读档纯函数，_changeDoc_ 消费）：
 *  - custom-graph-mode 四态透传——旧 marks（方块家族筛选语义）直接落新「只看标记」档
 *    （档名不变；渲染期3 重定义，存档连续无需改写）；
 *  - 旧 custom-graph-struct-marks=1（「结构视图只挂标记块」checkbox，随视图菜单退役）
 *    → structure（标记感知期3 到位前静默忽略不炸）；仅档位键无效时兜底——两键并存的
 *    正常历史形态=structure+开关，档位透传已得 structure；
 *  - 其余（垃圾/空）=undefined 走默认档 */
export function resolveArchivedGraphMode(
    attrs: Record<string, string | undefined> | null | undefined,
): GraphViewMode | undefined {
    const mode = normalizeGraphMode(attrs?.["custom-graph-mode"]);
    if (mode) return mode;
    if (attrs?.["custom-graph-struct-marks"] === "1") return "structure";
    return undefined;
}
