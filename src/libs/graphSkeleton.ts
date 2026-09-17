// src/libs/graphSkeleton.ts
// GraphBox 预检分流+体量文案归一（graphbox 翻新期 1 起；□2 通道反转后骨架标题树通道退役，
// skeletonTreeFromHeadings 删除——结构 SQL 通道 graphStructure.ts 覆盖其能力且更轻）。
// 纯同步零 IO。

/** 预检分流（□2 语义=数据源选择）：块数 ≤ 阈值走 DOM 全量数据源（渲染仍结构优先）；
 *  超限走 SQL 结构轻通道。阈值复用 graphMaxAllBlocks 设置（handoff □1 拍板） */
export function pickGraphChannel(blockCount: number, threshold: number): "full" | "skeleton" {
    return blockCount <= threshold ? "full" : "skeleton";
}

/** 体量文案：zh 万/千归一、en 千位 k；纯函数 lang 参数化（tomatoI18n.lang 旧码值域） */
export function formatCharsVolume(totalLen: number, lang: string): string {
    if (lang.startsWith("en")) {
        return totalLen >= 1000 ? `${(totalLen / 1000).toFixed(1)}k` : `${totalLen}`;
    }
    if (totalLen >= 10000) {
        return `${(totalLen / 10000).toFixed(1)}${lang === "zh_CHT" ? "萬" : "万"}`;
    }
    if (totalLen >= 1000) {
        return `${(totalLen / 1000).toFixed(1)}千`;
    }
    return `${totalLen}`;
}
