// 闪卡工具面板（CardBoxFloat）跨插件面板段注册表。依赖方向铁律——tomato 是共享
// 底座不得 import progressive；渐进等插件经本注册表把自家段注入复习设置面板
// （注册表空=面板零变化，未装/未启用插件零影响）。渲染合同：render 收容器+当前
// 复习卡 ID，返回清理函数（面板翻卡/关闭时调用——段内异步写须以清理为停写信号）。
// ⚠存储必须挂 window：共享库会复制进渐进等插件 bundle（monorepo 相对路径 import
// 各自成包），模块级 Map=每 bundle 一份副本互不可见——注册写副本、面板读正本恒空。
export interface CardPanelSectionCtx {
    cardID: string;
}

export interface CardPanelSection {
    render(el: HTMLElement, ctx: CardPanelSectionCtx): void | (() => void);
}

/** 查询形态：注册时按 key 合并（面板 each 渲染需要 key 作 each_key） */
export interface RegisteredCardPanelSection extends CardPanelSection {
    key: string;
}

const WIN_KEY = "__tomatoCardPanelSections";
const CHANGE_EVENT = "tomato-card-panel-sections-changed";

function store(): Map<string, CardPanelSection> {
    const w = window as unknown as { [WIN_KEY]?: Map<string, CardPanelSection> };
    if (!w[WIN_KEY]) w[WIN_KEY] = new Map();
    return w[WIN_KEY];
}

export function registerCardPanelSection(key: string, section: CardPanelSection): void {
    store().set(key, section);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function unregisterCardPanelSection(key: string): void {
    store().delete(key);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function getCardPanelSections(): RegisteredCardPanelSection[] {
    return [...store().entries()].map(([key, section]) => ({ key, ...section }));
}

/** 面板侧监听注册变化（渐进 onload 注册可晚于面板挂载——事件兜底刷新快照） */
export function onCardPanelSectionsChanged(cb: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, cb);
    return () => window.removeEventListener(CHANGE_EVENT, cb);
}
