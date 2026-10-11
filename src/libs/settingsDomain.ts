// 设置域导航预选（navcompass 2026-10-11）：IndexConf navActive 的 localStorage 键单一
// 事实源 + 预选写入通道。手机长按罗盘球 0.5s 直达本功能设置域（spec 拍板 12）——面板
// mount 恢复 navActive 即读此键（IndexConf onMount 恢复段）；预选失败=回落上次域无副作用。
// 独立 ts 模块而非 IndexConf 导出：tsc 的 *.svelte shim 只认默认导出，svelte 具名导出
// 过不了 check-t（TS2614）。
export const TOMATO_SETTINGS_NAV_KEY = "tomato_settings_NavKeyItemKey_LE2WBlXRG9LGVH2AA3VwzehW1";

export function preselectSettingsDomain(id: string) {
    try {
        localStorage.setItem(TOMATO_SETTINGS_NAV_KEY, id);
    } catch { /* 预选失败=回落上次域 */ }
}
