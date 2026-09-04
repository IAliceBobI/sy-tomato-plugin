// isMe 专属「显示付费标记」预览开关（2026-09-03 作者查看模式）：已激活后番茄皇冠
// （TomatoVIP）与渐进/仿写货架 Pro 角标全隐身，作者反而看不出哪些项收费——本开关
// 打开时这些付费标记强制回归，但只标注不锁功能（锁视觉/灰档语义不动）。
// 挂 localStorage（作者本机状态，不进 petal 设置）+ globalThis 单例：t/p/r 三插件
// 各自 bundle，模块级导出的 store 会是三份实例，挂 globalThis 让三家共享同一份——
// 任一面板里 toggle（帮助菜单 isMe 分支），其他已开面板即时跟随；reload 后由
// ??= 容忍重挂（同 winHotkey 注册表先例）。
import { writableWithGet } from "./stores";

const KEY = "tomato_dev_proPreview";

function make() {
    return writableWithGet(localStorage.getItem(KEY) === "1");
}

export const devProPreview = ((globalThis as any).__tomatoDevProPreview ??= make());

export function toggleDevProPreview() {
    devProPreview.set(!devProPreview.get());
    localStorage.setItem(KEY, devProPreview.get() ? "1" : "0");
}
