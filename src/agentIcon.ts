// agentqa □2：番茄自有 AI 图标（iconTomatoAgent）——官方 3.8.3 AI 助手同用 iconSparkles 撞脸
// （bear「哪怕换个颜色也行」），复制官方 path 换固定番茄红。消费面：AgentBox dock+面板头 /
// AIBox 块菜单 / AnnoEdit+annoChatRender 批注聊天钮。
// 注入必须走 innerHTML（DOM API 造 svg 属性不进命名空间的既有坑）；id 守卫幂等（插件
// reload 不重复注入，window.eval 重跑模块顶层无碍）。
const SPRITE_ID = "tomato-agent-sprite";
const SYMBOL_ID = "iconTomatoAgent";

/** 番茄红（浅深主题底上都可读的图形色；图标不适用 4.5:1 正文对比线） */
export const TOMATO_AGENT_RED = "#e74c3c";

// path 复制自 litheness icon.js 的 iconSparkles（viewBox/stroke 形态同源）；色走 CSS 变量
// 而非固定属性——custom property 可穿透 <use> shadow tree，dock 选中态蓝药丸上转白
// （agentqa □2 vision P1：固定红对主题蓝亮度对比仅 1.1:1；白=同构官方选中转白惯例），
// 其余场景回落番茄红（index.scss 兜底值同源）
const SYMBOL_BODY =
    `<symbol id="${SYMBOL_ID}" viewBox="0 0 24 24" fill="none" style="stroke: var(--tomato-agent-red, ${TOMATO_AGENT_RED})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/>` +
    `<path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/>` +
    `<path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>` +
    `</symbol>`;

export function agentIconSymbolID(): string {
    return SYMBOL_ID;
}

/** 幂等注入自有 AI 图标 sprite；onload 早段调用一次，全窗口消费面共享。
 *  既有 sprite 直接重写内容（而非跳过）——插件 reload 不换页，旧 sprite 会钉住旧
 *  样式/旧 path，重写让升级即时生效 */
export function ensureTomatoAgentIcon() {
    let sprite = document.getElementById(SPRITE_ID);
    if (sprite) {
        sprite.innerHTML = SYMBOL_BODY;
        return;
    }
    document.body.insertAdjacentHTML("beforeend",
        `<svg id="${SPRITE_ID}" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${SYMBOL_BODY}</svg>`);
}
