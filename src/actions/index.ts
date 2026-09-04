import { docAction } from "./docAction";
import { shortcutAction } from "./shortcutAction";
import { urlAction } from "./urlAction";
import { pluginCmdAction } from "./pluginCmdAction";

// 悬浮球动作类型注册表（期1 地基+期2 三新类型）。官方快捷键球复用 shortcut 执行器，
// 差异只在配置来源（keymap 选择，见 libs/ballKeymap.ts）。统一组件 FloatingBall.svelte
// 按注册表分派渲染与执行。

export interface BallAction {
    type: BallItem["type"];
    defaultConfig(): Partial<BallItem>;
    execute(ball: BallItem, ctx?: { event?: MouseEvent; element?: HTMLElement }): any;
    display(ball: BallItem): string;
    tooltip(ball: BallItem): string;
    ConfigPanel?: any; // 期5：设置面板类型专属配置区组件
}

export const actionRegistry: Record<string, BallAction> = {
    doc: docAction,
    shortcut: shortcutAction,
    url: urlAction,
    plugincmd: pluginCmdAction,
};
