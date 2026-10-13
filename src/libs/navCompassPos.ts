// 十字罗盘位置持久化（lsfix 2026-10-13 家族战役）：NavCompass.svelte 的拖拽位原走
// localStorage（宿主 NavFloat.ts 传入 lsKey，罗盘与收缩球共享同键=「变身前后同一落点」
// 语义）——思源桌面 Electron 壳每次启动给内核随机端口，origin 含端口变=localStorage
// 换格子清空，跨重启必丢（qeBallPos 同病根），改 floatBallPos 字典档（键=原 lsKey，
// BkFloatBall/悬浮图球同字典共存、互不牵连）；localStorage 旧档由 loadNavCompassPos
// 一次性收编（loadPos/savePos 语义自组件迁出，组件零 localStorage 直连）。
import { floatBallPos } from "./stores";

/** 旧档解析（原组件 loadPos 语义原样迁出）：JSON 串 {x,y}，x/y 任一非有限判坏档→null */
export function parseNavCompassPos(raw: string | null): { x: number; y: number } | null {
    if (!raw) return null;
    try {
        const p = JSON.parse(raw) as Partial<{ x: number; y: number }> | null;
        const x = Number(p?.x);
        const y = Number(p?.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        return { x, y };
    } catch {
        return null;
    }
}

/** 罗盘位置读档：floatBallPos[lsKey] 档优先（x/y 非有限=手改坏档弃用，防 NaN 像素打进
 *  style）；无档时收编 localStorage 旧档（固定端口环境有真值，桌面端随机端口 origin 下
 *  恒空）并落新档。均无→null（调用方回 defPos） */
export function loadNavCompassPos(lsKey: string): { x: number; y: number } | null {
    const p = floatBallPos.get()[lsKey];
    if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) return p;
    const legacy = parseNavCompassPos(localStorage.getItem(lsKey));
    if (legacy) saveNavCompassPos(lsKey, legacy);
    return legacy;
}

/** 罗盘位置落盘（拖拽松手/旧档收编共用）：字典整份 set 后紧跟 write 确定性落盘
 *  （settingFactory.set 只写内存不落盘，搭车不可靠——stores.ts 注释）。展开保序：
 *  只动 lsKey 一键，字典里其他球（反链/图球）的记忆不受牵连 */
export function saveNavCompassPos(lsKey: string, pos: { x: number; y: number }) {
    floatBallPos.set({ ...floatBallPos.get(), [lsKey]: pos });
    void floatBallPos.write();
}
