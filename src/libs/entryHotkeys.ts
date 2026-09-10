// 入口级快捷键常量（featgate □1 自 index.ts 迁出 2026-09-10）：设置入口与大刷新。
// 迁出原因=commandGroups.ts（设置「命令开关」域注册表）需引用 tomatoBigReloadHK，
// 原地留在 index.ts 会成环（index → IndexConf → ConfCommands → commandGroups → index
// 的模块初始化竞态，常量在 index 尾部定义晚于头部 import 求值）；独立小模块两向皆无环。
// ConfGeneral.svelte 引用同步改道至本模块。
import { winHotkey } from "./winHotkey";
import { tomatoI18n } from "../tomatoI18n";

export const tomatoSettingsOpenHK = winHotkey("ctrl+;", "tomato settings", "", () => tomatoI18n.番茄工具箱配置)
// ⇧⌘⌥R：R=Reload 语义；三修饰字母官方 keymap 不占（⌥⌘ 字母仅 H/O/V/Y 空闲且 Y 已被
// ctrl+alt+y 占用、H 撞 macOS hide-others），全仓 winHotkey 清单无冲突
export const tomatoBigReloadHK = winHotkey("ctrl+alt+shift+r", "big reload", "iconBigRefresh", () => tomatoI18n.大刷新)
