// 悬浮反链面板开合/球显隐布尔记忆持久化（lsfix 2026-10-13 家族战役）：BkFloat.ts 的
// 开合重开态（pendingOpen）与用户显隐意图（userHidden）原走 localStorage
// 「tomato-bkfloat-open」/「tomato-bkfloat-ball-hidden」"1"/"0"——思源桌面 Electron 壳
// 每次启动给内核随机端口，origin 含端口变=localStorage 换格子清空，跨重启必丢（qeBallPos
// 同病根），改 bkFloatPanelOpen/bkFloatBallHidden 工作空间档。⚠布尔档默认 false 无
// null 哨兵（qeBallPos 式「store 档优先」判不了无档）：收编采取「键在即收、收讫删键」
// ——收编后 removeItem，防旧档 "1" 在用户显式存 false 后的下次读档顶回 true；桌面端
// 随机端口下键恒空=零收编纯 store 读写。GraphFloatBox 两键同构（graphFloatPanelOpen/
// graphFloatBallHidden，其站点同款迁移）。
import { bkFloatBallHidden, bkFloatPanelOpen } from "./stores";

/** settingFactory 布尔档的最小消费面（结构化类型，工厂实例天然满足） */
interface BoolFlagStore {
    get(): boolean;
    set(v: boolean): void;
    write(v?: boolean): Promise<void>;
}

/** 旧档收编源（lsfix 前主档，仅本模块读；值形态 "1"/"0"，非 "1" 一律按 false——原语义） */
const LS_OPEN = "tomato-bkfloat-open";
const LS_BALL_HIDDEN = "tomato-bkfloat-ball-hidden";

/** 布尔记忆读档：localStorage 旧键在=旧版真迹，收编（"1"→true，余值含 "0"→false）进
 *  store 并落盘、删键（一次性收编，布尔档无哨兵的理由见头注）；键不在=已收编过/桌面端
 *  随机端口，store 档即权威 */
function loadBoolFlag(store: BoolFlagStore, legacyKey: string): boolean {
    const raw = localStorage.getItem(legacyKey);
    if (raw != null) {
        const v = raw === "1";
        store.set(v);
        void store.write();
        try { localStorage.removeItem(legacyKey); } catch { /* 删不掉=下次重收，幂等无害 */ }
        return v;
    }
    return store.get();
}

/** 布尔记忆落盘（开面板/收面板/显隐 toggle 共用）：set 后紧跟 write 确定性落盘
 *  （settingFactory.set 只写内存不落盘，搭车不可靠——stores.ts 注释） */
function saveBoolFlag(store: BoolFlagStore, v: boolean) {
    store.set(v);
    void store.write();
}

/** 悬浮反链面板开合重开态读档：true=重启后首个 protyle 事件落地自动开面板
 *  （FloatBacklinkBox.pendingOpen 恢复 Wish） */
export function loadBkFloatPanelOpen(): boolean {
    return loadBoolFlag(bkFloatPanelOpen, LS_OPEN);
}

/** 悬浮反链面板开合重开态落盘：openPanel=true / closePanel persist 时=false；
 *  插件 unload 收尾 persist=false 不写档（重载不重置用户开合记忆，P2-11 既有语义
 *  由调用方保证，本函数无参直写） */
export function saveBkFloatPanelOpen(v: boolean) {
    saveBoolFlag(bkFloatPanelOpen, v);
}

/** 悬浮反链球显隐意图读档（状态栏钮/⌘⇧X toggle 的用户标记；球实际显隐公式在
 *  FloatBacklinkBox.syncBallVisibility，含球驻留模式） */
export function loadBkFloatBallHidden(): boolean {
    return loadBoolFlag(bkFloatBallHidden, LS_BALL_HIDDEN);
}

/** 悬浮反链球显隐意图落盘（toggleBallHidden） */
export function saveBkFloatBallHidden(v: boolean) {
    saveBoolFlag(bkFloatBallHidden, v);
}
