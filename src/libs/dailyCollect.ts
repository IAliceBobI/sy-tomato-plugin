// 日记管线收集块协议 v1（dailynote-pipeline 战役 □1，2026-09-06）：
// 日记收集块 = superblock 容器 + custom-tomato-idea-time（必带识别键，HH:MM 收集时刻；
// 消费方：calcTimeInterval 相邻间隔、cssFlashThoughts 时间戳显示）+ custom-tomato-ref-hpath
// （可选，源文档路径）+ alias（可选，类型/图标）。复制块另保留 custom-super-list="1"
// 作视觉标记（CSS 下边框），老块零迁移、读侧零兼容层。

/** 收集块容器属性构造：无源（闪念）不落空 ref-hpath 键——省略即「无源可溯」语义 */
export function collectBlockAttrs(time: string, refHpath?: string): AttrType {
    const attrs: AttrType = { "custom-tomato-idea-time": time };
    if (refHpath) attrs["custom-tomato-ref-hpath"] = refHpath;
    return attrs;
}

/** 移动端当日日记 pin 跨天守卫：从未 pin 或 pin 日已非今日 → 重新取当日日记 */
export function shouldRepinDailyNote(pinnedYMD: string | undefined, nowYMD: string): boolean {
    return pinnedYMD !== nowYMD;
}
