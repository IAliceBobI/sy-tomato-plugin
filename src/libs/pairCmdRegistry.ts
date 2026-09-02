/** 快捷键速查直调注册表（R5 □3）：LinkBox/CpBox addCommand 时顺手登记
 *  langKey → callback，⋯ 菜单速查子菜单点击查表直调（沿 runOverflowCmd 开放直调
 *  先例，不依赖已消失的 window.siyuan.plugins）。
 *  总开关关 = 注册链不跑 = 表空，速查点击查表落空属正确语义（命令压根没注册）。
 *  嵌入互链等 VIP 门禁在命令 callback 内部自验（lastVerifyResult），直调不改门禁语义。
 *  登记点与 addCommand 同函数同 langKey，模块顶层无副作用（单测 import pairBarState
 *  不受牵连），声明性键位引用见 PairFuncSpec.hkKeys。 */

export type PairCmdFn = (protyle?: unknown) => unknown;

const pairCmds = new Map<string, PairCmdFn>();

export function regPairCmd(langKey: string, fn: PairCmdFn) {
    if (langKey && fn) pairCmds.set(langKey, fn);
}

export function getPairCmd(langKey: string): PairCmdFn | undefined {
    return pairCmds.get(langKey);
}
