// 共享轻量工具条（libs/FloatBar.svelte）位置读写（lsfix 2026-10-13 家族战役）：位置原走
// localStorage（键=调用方 posKey，现消费者=渐进展开态浮条 prog-piece-floatbar-pos）——思源
// 桌面 Electron 壳每次启动给内核随机端口，origin 含端口变=localStorage 换格子清空，跨
// 重启必丢（qeBallPos 同病根，群实报）。改 floatBarPos store 字典档（键=posKey，调用方
// 寻址零改动）；localStorage 旧档由 loadFloatBarPos 读侧一次性收编。
import { floatBarPos } from "./stores";

/** 工具条位置存档读取：floatBarPos 字典[posKey] 档优先（isFinite 守卫，floatBallPos.
 *  loadFloatBallPos 同款）；无档时收编 localStorage[posKey] 旧档（JSON 单键 {x,y}，固定
 *  端口环境有真值，桌面端随机端口 origin 下恒空）并落新档。均无→null（调用方回默认位
 *  200,innerHeight-200） */
export function loadFloatBarPos(posKey: string): { x: number; y: number } | null {
    const saved = floatBarPos.get()[posKey];
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return saved;
    let legacy: { x: number; y: number } | null = null;
    try {
        const raw = localStorage.getItem(posKey);
        if (raw) {
            const p = JSON.parse(raw);
            const x = Number(p?.x);
            const y = Number(p?.y);
            if (Number.isFinite(x) && Number.isFinite(y)) legacy = { x, y };
        }
    } catch { /* 坏档（非 JSON/存储不可用）忽略，回收编失败路 */ }
    if (legacy) saveFloatBarPos(posKey, legacy);
    return legacy;
}

/** 工具条位置落盘（拖拽松手/旧档收编共用）：写字典[posKey] 后紧跟 write 确定性落盘
 *  （settingFactory.set 只写内存不落盘，搭车不可靠——stores.ts 注释） */
export function saveFloatBarPos(posKey: string, p: { x: number; y: number }) {
    floatBarPos.set({ ...floatBarPos.get(), [posKey]: p });
    void floatBarPos.write();
}
