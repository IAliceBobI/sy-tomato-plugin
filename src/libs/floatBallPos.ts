// 悬浮球三球位置字典读写（lsfix 2026-10-13 家族战役）：BkFloatBall 组件族（悬浮反链
// tomato-bkfloat-ball-pos/悬浮图 tomato-gfloat-ball-pos/罗盘 tomato-navcompass-ball-pos）
// 位置原走 localStorage——思源桌面 Electron 壳每次启动给内核随机端口，origin 含端口变=
// localStorage 换格子清空，跨重启必丢（qeBallPos 同病根，群实报）。改 floatBallPos store
// 字典档（键=原 localStorage lsKey，三宿主 BkFloat/GraphFloatBox/NavFloat 零改动）；
// localStorage 旧档由 loadFloatBallPos 读侧一次性收编。
import { floatBallPos } from "./stores";

/** 球位存档读取：floatBallPos 字典[lsKey] 档优先（isFinite 守卫，qeBall.loadQEBallPos
 *  同款）；无档时收编 localStorage[lsKey] 旧档（JSON 单键 {x,y}，固定端口环境有真值，
 *  桌面端随机端口 origin 下恒空）并落新档。均无→null（调用方回 defPos 默认位） */
export function loadFloatBallPos(lsKey: string): { x: number; y: number } | null {
    const saved = floatBallPos.get()[lsKey];
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return saved;
    let legacy: { x: number; y: number } | null = null;
    try {
        const raw = localStorage.getItem(lsKey);
        if (raw) {
            const p = JSON.parse(raw);
            const x = Number(p?.x);
            const y = Number(p?.y);
            if (Number.isFinite(x) && Number.isFinite(y)) legacy = { x, y };
        }
    } catch { /* 坏档（非 JSON/存储不可用）忽略，回收编失败路 */ }
    if (legacy) saveFloatBallPos(lsKey, legacy);
    return legacy;
}

/** 球位落盘（拖拽松手/旧档收编共用）：写字典[lsKey] 后紧跟 write 确定性落盘
 *  （settingFactory.set 只写内存不落盘，搭车不可靠——stores.ts 注释） */
export function saveFloatBallPos(lsKey: string, p: { x: number; y: number }) {
    floatBallPos.set({ ...floatBallPos.get(), [lsKey]: p });
    void floatBallPos.write();
}
