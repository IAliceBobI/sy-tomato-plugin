// onDataChanged 多端热更基建（siyuan383 □3，2026-09-07 拍板甲案·三插件全上）。
//
// 机制链（3.8.3）：官方 saveData 自带 app 参数 → 内核 putFile 写 petal 即广播「排除发起方」
// （PushPluginStorageDataChanged → dataChangePlugins）→ 其他前端 loader 判
// onDataChanged === Plugin.prototype.onDataChanged：未覆盖=自动整插件重载（多前端
// 「写 petal 互相打断」的根源——主窗重载时速记器小窗被 teardown 关窗）；覆盖=只调钩子，
// 自管热更。唯一重载入口 setPetalEnabled 只能全员广播或排除单 app，没有「只重载自己」
// 的定向通道——钩子内的真收益只能来自「读新值+局部应用」。
//
// 本模块=两端对称共用的热更通道：
//   B 端钩子（他端写入）：重读 → diff → 替换 settingCfg → 注册表刷 store（响应式 UI
//   无闪断热更）；结构性键命中才 reloadSelfPlugin 全员兜底（低频场景退化到现状行为）。
//   A 端保存链（本端落盘后）：调同一函数=落盘对账 + 生效判定——常规键不再整重载。
//
// ⚠️ 登记纪律：新增「onload 注册门控读设置」（顶栏钮/dock 族）或「一次性 style 注入」
// （cssStyle.ts load_* 族）的键必须进 STRUCTURAL_KEYS，否则他端静默不生效（钩子已承诺
// 自管，内核不再兜底重载）。
import { STORAGE_SETTINGS } from "../constants";
import { debugLog } from "./logUtils";
import { reloadSettingStores } from "./stores";

/** 结构性键显式清单：onload 期注册读死（顶栏钮/dock 门控）或 cssStyle 一次性注入族——
 *  改动须整插件重载才生效。*Checkbox 总开关族由 isStructuralKey 的正则覆盖。 */
const STRUCTURAL_KEYS = new Set([
    // ToolbarBox / DailyNoteBox / GraphBox / ReadingPointBox 顶栏钮注册门控（onload if 读死）
    "toolbarspacerepeat", "toolbarrefreshVr", "toolbarlocatedoc", "toolbarTidy", "toolbarEN2CHBtn",
    "dailyNotetopbarleft", "dailyNotetopbarright", "dailyNoteReviewTopbar",
    "graphAddTopbarIcon", "readingTopBar", "readingStatusBar",
    "bigReloadTopbar", // 大刷新顶栏钮（注册在 onload）
    "commandToggles", // 命令开关 map（featgate：gatedAddCommand 注册门控在 onload 读死）
    // 速记搬运双消费时效统一（featgate □1 review P1）：sync_end 动态读即改即生效，
    // 手动搬运命令 onload 门控读死——不登记则开关改后命令面板项静默滞后（点了照搬）
    "shorthandRelayEnabled",
    "prefixArticlesEnable", // PrefixArticles dock
    // 注册门控族（review P1-2 补齐：一次性挂载/监听，中途改需 reload 才生效）
    "pairBarEnabled", // 接力浮条总开关（CpBox/LinkBox 注册门）
    "punctTidyEnable", // 打字标点自动整理 observer 注册门（PunctTidyBox onload；子开关 punctTidyExtRules 回调实时读非结构性）
    "blockEditorBox", "qeFloatBall", // 块编辑器总门+球（BlockEditor onload）
    "spaceRefEnabled", // 空格转引用 document 三监听（SpaceRefBox onload）
    "floatingballEnable", // 悬浮球命令注册族（FloatingBall onload）
    "addSelectionBtnsMobile", "addSelectionBtnsDesktop", // 划词工具条 onLayoutReady 一次性注册
    "initProgFloatBtnsDisable", // 渐进浮条系统总开关（禁用态组件从未挂载，渐进键共用此表）
    "mobileTopBar", // 渐进移动端顶栏（组件 init 一次性读，仅移动端受害）
    "noteBoxMobileSync", // 番茄移动端顶栏同步钮（featgate □2：NoteBox onload 注册读死）
    // cssStyle.ts load_* 一次性注入族（无 subscribe，热更不重应用）
    "cardPriBarPos", "cardPriorityBoxAutoHide",
    "cssRefEffect", "cssSuperBlockBorder", "cssFlashThoughts", "cssShowMemo",
    "cssShowFlashCardBlank", "cssShowHomeEndIcon", "cssHomeEndIconLeft",
    "dailyNoteCopyShowPath", "showDocAttrs", "cssNattyList", "cssListBackgound", "cssRefAsTags",
    // 外观域·界面净化 6 开关（uiclean 2026-09-12：load_uiClean 一次性注入族同上）
    "uiCleanTabClose", "uiCleanTabBarBtns", "uiCleanTopbarStatus",
    "uiCleanEmptyHelp", "uiCleanDocTreeBadge", "uiCleanDocTreeCompact",
]);

/** 结构性键判定：显式清单 + *Checkbox/*CheckBox 总开关族（Box 注册门控，宁多重载不漏） */
export function isStructuralKey(key: string): boolean {
    return STRUCTURAL_KEYS.has(key) || /checkbox$/i.test(key);
}

/** diff 两份 settingCfg，返回值有变化的键（含删除键）；值全 JSON 可序列化，按 stringify 比 */
export function diffSettingKeys(oldCfg: unknown, newCfg: Record<string, unknown>): string[] {
    if (!oldCfg || typeof oldCfg !== "object") return Object.keys(newCfg);
    const changed: string[] = [];
    const keys = new Set([...Object.keys(oldCfg), ...Object.keys(newCfg)]);
    for (const k of keys) {
        const a = (oldCfg as Record<string, unknown>)[k], b = newCfg[k];
        if (JSON.stringify(a) !== JSON.stringify(b)) changed.push(k);
    }
    return changed;
}

export interface HotReloadResult {
    /** 值有变化的全部键（打点/诊断用） */
    changed: string[];
    /** 其中命中结构性键的（命中即已触发整重载） */
    structural: string[];
}

/** 重读落盘 → diff → 替换 settingCfg → 注册表刷 store。返回变更/结构性键集——
 *  **结构性重载由调用方决策**（钩子链热更动作全部跑完再 reload，防渐进数据刷新
 *  被 teardown 410 掐断后落进 catch 再重载一轮）。
 *  file 参数化：tomato/仿写用 STORAGE_SETTINGS，渐进传 STORAGE_Prog_SETTINGS
 *  （渐进的共享 store 键与自有设置同落该文件）。
 *  oldCfg：保存方链路必传「saveData 前的落盘值」（面板 bind 编辑在保存前已进内存 cfg，
 *  快照内存=diff 恒空结构性漏判；读盘才是编辑前值）；钩子链（他端写入）不传，本端
 *  内存 cfg 即旧值。 */
export async function syncSettingsFromDisk(
    plugin: { name: string; settingCfg: any; loadData: (f: string) => Promise<any> },
    file: string = STORAGE_SETTINGS,
    oldCfg?: unknown,
): Promise<HotReloadResult> {
    const fresh = await plugin.loadData(file);
    if (!fresh || typeof fresh !== "object") return { changed: [], structural: [] };
    const changed = diffSettingKeys(oldCfg ?? plugin.settingCfg, fresh);
    plugin.settingCfg = fresh;
    reloadSettingStores(fresh, changed);
    const structural = changed.filter(isStructuralKey);
    debugLog("storageHotReload", `${plugin.name} 热更 ${changed.length} 键${structural.length ? `（结构性 ${structural.length}，由调用方重载）` : ""}${changed.length ? `：${changed.join(",")}` : ""}`);
    return { changed, structural };
}
