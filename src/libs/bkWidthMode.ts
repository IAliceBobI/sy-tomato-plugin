// □4 面板宽度模式（2026-09-02）：全宽（随 protyle-content 拉满，历史现状）↔
// 跟随编辑器（内容盒对齐 .protyle-wysiwyg 文字列）。跟随=面板容器 margin-left/right
// 取 wysiwyg 的 inline padding（内核 setPadding 写入 initUI.ts:353，窗口/分屏
// 变化时重算）；容器是 wysiwyg 的 afterend 兄弟且自身 padding 恒 0（doTheWork），
// margin 抵消后无叠加。样式走 inline style 而非 class：容器是 JS 裸建 div，
// Svelte scoped CSS 剪不到（AGENTS.md 踩坑表）。

export type BkWidthMode = "full" | "follow";

/** 跟随模式的容器样式；full 返回空对象（margin 清空语义由 applyBkWidthMode 承担） */
export function bkWidthModeStyle(
    mode: BkWidthMode,
    wysPaddingLeft: string,
    wysPaddingRight: string,
): { marginLeft?: string; marginRight?: string } {
    if (mode === "follow") {
        return { marginLeft: wysPaddingLeft, marginRight: wysPaddingRight };
    }
    return {};
}

/** 把宽度模式落到面板容器；重复调用幂等（内核重算 padding 后同步用） */
export function applyBkWidthMode(panel: HTMLElement, mode: BkWidthMode, wysiwyg: HTMLElement) {
    const s = bkWidthModeStyle(mode, wysiwyg.style.paddingLeft, wysiwyg.style.paddingRight);
    panel.style.marginLeft = s.marginLeft ?? "";
    panel.style.marginRight = s.marginRight ?? "";
}
