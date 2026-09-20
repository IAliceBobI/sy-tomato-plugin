// src/libs/graphViewMode.ts
// treemap 战役 □3（2026-09-17）起档 → graphmark 期1（2026-09-18）翻新 → □4（2026-09-20）
// 默认档拍板翻转：块关系图四档档位纯逻辑——默认档/存档 normalize/旧存档迁移。档位按文档
// 属性持久化 custom-graph-mode（同 custom-graph-layout 的 setBlockAttrs 模式），无存档=
// 有标记 marks / 无标记 structure（defaultGraphMode）。

/** 四档：structure/full/treemap + marks（「只看标记」——期1 沿用 treemap 家族筛选渲染，
 *  期3 重定义为结构图标记路径视图；□4 起有标记文档可作默认档） */
export type GraphViewMode = "structure" | "full" | "treemap" | "marks";

/** 无存档时的默认档（□4 bear 2026-09-20 拍板，翻转 09-18 旧「恒 structure」）：有标记
 *  → marks（「有标记的 doc 优先展示标记视图」）、无标记 → structure。blockCount 形参
 *  保留=调用方签名稳定，语义留档（原 GRAPH_TREEMAP_MIN_BLOCKS=300 分流 09-18 已退役）。
 *  full/treemap 恒用户手动（全量档危险，巨书完整加载 10~40s 不该被自动路过）。
 *  调用时序纪律：hasMarks 须喂**首轮就绪的标记数据**（marksCache 落定后）——用缓存前
 *  的空集判档=闪档（先渲 structure 再翻 marks）；marks 档空标记回落 structure 的守卫
 *  在调用方（GraphBox.svelte settleGraphMode）三路同防（memo/存档/默认） */
export function defaultGraphMode(_blockCount: number, hasMarks = false): GraphViewMode {
    return hasMarks ? "marks" : "structure";
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
