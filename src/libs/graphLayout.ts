// src/libs/graphLayout.ts
// 布局形态恒 LR（graphrelayout □2，2026-09-20 bear 拍板：「不用给用户选横竖了，直接默认
// 向右侧生长（LR 横排），最好不要碰撞在一起」）——原四态枚举（lr/tb/vlr/vtb）整族退役：
// normalizeLayoutForm/rankdirOf/isTextVertical/migrateIsVertical/nextLayoutForm/layoutFormLabel
// 全删（恒 LR 后无分支可言），树生长 rankdir 恒 "LR"、文字恒横排。
//
// 本文件只剩旧档收敛纯函数：读旧写新（学 migrateIsVertical 迁移先例）——
// custom-graph-layout 非 lr、或旧布尔 custom-graph-isVertical 非空的存量文档，
// 打开图时一次性写回 lr（layout=lr + isVertical 置空），写后下轮读到已收敛零写入。
// 持久化与渲染在 GraphBox.svelte，不进本文件。纯同步零 IO。

/** 旧档收敛判据：attrs 含非 lr 的 custom-graph-layout 或非空 custom-graph-isVertical 时，
 *  返回须写回的收敛属性；已收敛/无旧档/空 attrs（getBlockAttrs 空闪烁窗）返回 null 零写入 */
export function legacyLayoutConvergence(
    attrs: Record<string, string> | undefined | null,
): Record<string, string> | null {
    if (!attrs) return null;
    const layout = attrs["custom-graph-layout"];
    const isVertical = attrs["custom-graph-isVertical"];
    const needLayout = !!layout && layout !== "lr";
    const needClear = !!isVertical;
    if (!needLayout && !needClear) return null;
    return { "custom-graph-layout": "lr", "custom-graph-isVertical": "" };
}
