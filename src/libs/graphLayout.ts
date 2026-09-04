// src/libs/graphLayout.ts
// GraphBox 布局形态四态枚举纯函数（graphbox 期7，2026-09-04）：
// 横排 LR（默认）/ 横排 TB / 竖排 LR（文字竖排+树向右，窄 dock 主推）/ 竖排 TB。
// 纯同步零 IO——持久化（custom-graph-layout）与渲染在 GraphBox.svelte，不进本文件。
//
// 存量迁移拍板（handoff □7）：旧 custom-graph-isVertical 布尔 → true=横排 TB、false=横排 LR
// （旧「纵向」=树向下生长的横排文字形态，四态里语义最近的是 tb）；无值走设置默认。

export type LayoutForm = "lr" | "tb" | "vlr" | "vtb";

export const LAYOUT_FORMS: readonly LayoutForm[] = ["lr", "tb", "vlr", "vtb"] as const;

/** 任意输入（设置值/文档属性/e2e 注入）→ 合法形态；非法回退 fallback */
export function normalizeLayoutForm(v: string | undefined | null, fallback: LayoutForm = "lr"): LayoutForm {
    return (LAYOUT_FORMS as readonly string[]).includes(v ?? "") ? (v as LayoutForm) : fallback;
}

/** 树生长方向（dagre rankdir）：文字书写方向不影响树生长方向 */
export function rankdirOf(form: LayoutForm): "LR" | "TB" {
    return form === "lr" || form === "vlr" ? "LR" : "TB";
}

/** 文字是否竖排（writing-mode: vertical-rl） */
export function isTextVertical(form: LayoutForm): boolean {
    return form === "vlr" || form === "vtb";
}

/** 存量迁移：旧布尔形态属性 → 四态；无值/坏值 → null（调用方走设置默认） */
export function migrateIsVertical(v: string | undefined): LayoutForm | null {
    if (v === "true") return "tb";
    if (v === "false") return "lr";
    return null;
}

/** 循环切换（顶栏钮）：lr→tb→vlr→vtb→lr */
export function nextLayoutForm(form: LayoutForm): LayoutForm {
    return LAYOUT_FORMS[(LAYOUT_FORMS.indexOf(form) + 1) % LAYOUT_FORMS.length];
}

/** 形态短名（打点/调试；用户可见文案走 tomatoI18n） */
export function layoutFormLabel(form: LayoutForm): string {
    switch (form) {
        case "tb": return "horizontal-TB";
        case "vlr": return "vertical-LR";
        case "vtb": return "vertical-TB";
        default: return "horizontal-LR";
    }
}
