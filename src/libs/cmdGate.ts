// 命令开关机制（featgate 战役 2026-09-10，bear 拍板 B 全面版）：番茄所有功能入口可开关。
// 单设置键 commandToggles 存 map（命令 langKey→bool，缺省=全开——老用户零感知，与
// hiddenMenuItems 单键模式同款）；gatedAddCommand=条件注册（关=不注册）——思源命令
// 面板无隐藏单条命令的原生机制（已实测），插件侧条件注册是唯一通道。改动需插件级
// 重载生效（onload 期读死，storageHotReload STRUCTURAL_KEYS 已登记）。
// □3~□6 铺量纪律：① gatedAddCommand 调用点必须在 onload 的 `await this.taskCfg`
// 之后（时序红线见函数注，□1 review P0 实锤）；② 命令迁入时同步登记 commandGroups.ts
// 注册表（设置「命令开关」域数据源）；③ 豁免清单（不走 gatedAddCommand 的裸注册）=
// copyId/fold 折叠对/quickNote/AIBox（已有独立注册门控 store，族开关即
// 单条开关，双开关打架故豁免）+设置入口命令（自指死锁）+速记搬运（shorthandRelayEnabled
// 功能联动）——重跑裸 addCommand 审计时勿再旗标（□6 拍板）。
// 注册表 COMMAND_GROUPS 与本文件分离防循环 import（Box 模块 import 本文件机制，
// 注册表 import Box 模块常量）。
import type { ICommand, Plugin } from "siyuan";
import { commandToggles } from "./stores";

/** langKey 的命令开关态：缺省=开（map 无键即 true），显式 false 才关 */
export function cmdOn(langKey: string): boolean {
    return commandToggles.get()[langKey] !== false;
}

/** toggle 写入纯函数（ConfCommands 域与单测共用）：关=落 false 键；再开=清键回缺省
 *  ——map 恒只存显式关项（sparse，petal 体积不随开关历史膨胀）；无变化返回原引用 */
export function nextCommandToggles(cur: Record<string, boolean>, langKey: string, on: boolean): Record<string, boolean> {
    if (on) {
        if (!(langKey in cur)) return cur;
        const rest = { ...cur };
        delete rest[langKey];
        return rest;
    }
    if (cur[langKey] === false) return cur;
    return { ...cur, [langKey]: false };
}

/** 注册点对账集（featgate □6 审计）：gatedAddCommand 记 langKey；ConfCommands 挂载时与
 *  COMMAND_GROUPS 求差集 debugLog（dev 门控零噪音）——防注册点与注册表漂移（langKey
 *  字面量双写类无 winHotkey 常量做单一事实源的命令）。注意族关=调用点根本不执行=键
 *  不进集，对账结论只对「已执行过的注册」有效（全量对账须全族开） */
const registeredKeys = new Set<string>();
/** 非 gatedAddCommand 通道的自定义注册包装（如 addPairCmd）登记对账键用——否则该通道
 *  键不进集=对账盲区（□6 review P2-A）；addPairCmd 族 17 条靠此覆盖 */
export function recordCmdKey(langKey: string) {
    registeredKeys.add(langKey);
}

/** 命令条件注册：commandToggles 开（缺省）才 plugin.addCommand，关=不注册。
 *  ⚠时序红线（featgate □1 review P0 实锤）：调用点必须在 onload 的 `await this.taskCfg`
 *  之后——loadStore 在 taskCfg 异步链内，之前读 store=模块默认值（恒全开，开关失效）。
 *  返回 addCommand 回值（铺量期若需命令引用留口子），未注册=undefined */
export function gatedAddCommand(plugin: Pick<Plugin, "addCommand">, langKey: string, def: Omit<ICommand, "langKey">) {
    registeredKeys.add(langKey);
    if (cmdOn(langKey)) return plugin.addCommand({ langKey, ...def });
    return undefined;
}
export { registeredKeys };
