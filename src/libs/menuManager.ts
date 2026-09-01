// 右键菜单逐项隐藏（□4，2026-08-31 用户点名「菜单项太多想隐藏部分」）：
// 单一隐藏集 hiddenMenuItems（string[]）管全部右键菜单项；addItem 统一走 addIfVisible，
// 命令体系项 key=winHotkey langKey（稳定、与快捷键注册同源），无命令直写项用
// "m.<模块>.<语义>" 前缀造 key（带点前缀天然不与 langKey 撞车）。
// 与既有开关的关系：winHotkey 第六参 store（功能区总开关）保留不动，gate 参数
// 透传其判定结果——总开关关或 key 在隐藏集，任一命中即不显示；快捷键/命令零改动。
import { hiddenMenuItems } from "./stores";

/** 隐藏集读取统一出口：非数组脏值（手改 petal JSON 等）收敛为空，写路径经此取值即自愈 */
export function menuHiddenKeys(): string[] {
    const v = hiddenMenuItems.get();
    return Array.isArray(v) ? v : [];
}

export function menuKeyHidden(key: string): boolean {
    return menuHiddenKeys().includes(key);
}

/**
 * 统一 addItem 包装：命中隐藏集或 gate 判 false 时跳过。
 * menu/item 形参不收紧到 siyuan Menu/IMenuItem：detail.menu 是本仓自定义 subMenu
 * 接口，且 accelerator 运行时支持而 IMenuItem 类型未声明（历史 addItem 均直传）。
 * @param gate 可选显隐门（通常传 winHotkey 的 .menu()——store 总开关+vip 门禁）
 * @returns addItem 的返回值；被隐藏时返回 null（调用方一般无需消费）
 */
export function addIfVisible(menu: any, key: string, item: any, gate?: boolean) {
    if (menu == null) return null;
    if (gate === false) return null;
    if (menuKeyHidden(key)) return null;
    return menu.addItem(item);
}
