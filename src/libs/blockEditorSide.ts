// 块编辑器侧边布局/侧栏比例的持久化薄壳（blockside □2/□3；lsfix 2026-10-13 家族战役）：
// 原走 localStorage「块编辑器布局_side」「块编辑器侧栏比例」——思源桌面 Electron 壳每次
// 启动给内核随机端口，origin 含端口变=localStorage 换格子清空，跨重启必丢（qeBallPos
// 同病根，群实报）。改走 settingFactory 工作空间档（stores.ts blockEditorSideLayout/
// blockEditorSideRatio）；localStorage 降级为旧档一次性收编源。收编即消费旧键
// （removeItem）——本组默认档非空（false/0.32），无法凭 store 值区分「无档」与「显式
// 存过默认值」（qeBallPos 的 null 档判别法不可用），不消费会回灌：用户显式关侧边布局
// 后，残留旧档 "1" 每次重启把布局顶回去。消费属于收编收尾（清旧源），非状态持久化。
import { blockEditorSideLayout, blockEditorSideRatio } from "./stores";

// 旧档收编源（lsfix 前的主档，仅 load 侧读一次）
const LS_SIDE_LAYOUT = "块编辑器布局_side";
const LS_SIDE_RATIO = "块编辑器侧栏比例";

/** 比例 clamp：15%~50%；非有限数回默认 0.32（NaN 防御，loadSideRatio 既有语义） */
function clampSideRatio(v: number): number {
    if (!Number.isFinite(v)) return 0.32;
    return Math.min(0.5, Math.max(0.15, v));
}

/** 旧档数字串解析（parseFloat；null/空串/垃圾回 0.32）——纯函数，单测直测 */
export function parseSideRatio(raw: string | null): number {
    return clampSideRatio(parseFloat(raw || ""));
}

/** 布局落盘（toggleLayout/旧档收编共用）：set 后紧跟 write 确定性落盘
 *  （settingFactory.set 只写内存不落盘，搭车不可靠——stores.ts 注释） */
export function saveSideLayout(v: boolean) {
    blockEditorSideLayout.set(v);
    void blockEditorSideLayout.write();
}

/** 比例落盘（拖条 pointerup/旧档收编共用）：同上，set+write 成对 */
export function saveSideRatio(v: number) {
    blockEditorSideRatio.set(v);
    void blockEditorSideRatio.write();
}

/** 布局读取：移动端恒 false 不读档（BlockEditor 既有守卫，收编同守卫）；store 真档优先
 *  （true≠默认 false 即真档，旧档不再回灌）；无真档时收编 localStorage 旧档（"1"=侧边，
 *  其余含垃圾串同 "0"）并落盘+消费旧键 */
export function loadSideLayout(isMobile: boolean): boolean {
    if (isMobile) return false;
    if (blockEditorSideLayout.get()) return true;
    const legacy = localStorage.getItem(LS_SIDE_LAYOUT);
    if (legacy == null) return false;
    const v = legacy === "1";
    saveSideLayout(v);
    localStorage.removeItem(LS_SIDE_LAYOUT);
    return v;
}

/** 比例读取：store 真档（≠默认 0.32）优先；无真档时收编旧档数字串（clamp 语义保留）
 *  并落盘+消费旧键 */
export function loadSideRatio(): number {
    const cur = blockEditorSideRatio.get();
    if (cur !== blockEditorSideRatio.default()) return clampSideRatio(cur);
    const legacy = localStorage.getItem(LS_SIDE_RATIO);
    if (legacy == null) return cur;
    const v = parseSideRatio(legacy);
    saveSideRatio(v);
    localStorage.removeItem(LS_SIDE_RATIO);
    return v;
}
