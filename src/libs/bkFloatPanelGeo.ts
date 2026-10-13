// 悬浮反链/悬浮图共用面板几何持久化（lsfix 2026-10-13 家族战役）：BkFloatPanel.svelte
// 的拖拽/resize/透明度档原走 localStorage「tomato-bkfloat-panel」单键 JSON——思源桌面
// Electron 壳每次启动给内核随机端口，origin 含端口变=localStorage 换格子清空，跨重启必丢
// （qeBallPos 同病根），改 bkFloatPanelGeo 工作空间档。LS_KEY 为硬编码常量非参数：
// BkFloat 与 GraphFloatBox 两宿主共用同一份几何=现状语义保持，勿拆两键；localStorage
// 旧档由 loadBkFloatPanelGeo 一次性收编（saveGeo/loadGeo 语义自组件迁出，组件零
// localStorage 直连）。
import { bkFloatPanelGeo } from "./stores";

/** 面板几何存档：x/y/w/h 像素 + o 透明度 0.4~1.0 */
export interface BkFloatPanelGeo {
    x: number;
    y: number;
    w: number;
    h: number;
    o: number;
}

/** 透明度下限即头栏滑杆 min（0.40），上限恒 1.00 */
export const BK_FLOAT_PANEL_MIN_OPACITY = 0.4;
/** 旧档收编源（lsfix 前主档，仅 loadBkFloatPanelGeo 读） */
export const BK_FLOAT_PANEL_LS_KEY = "tomato-bkfloat-panel";

/** 旧档解析（原组件 loadGeo 语义原样迁出）：x/y/w/h 任一非有限判坏档→null（调用方回
 *  默认右下 520×420）；o 单独宽恕——非有限回 1、有限 clamp 到 [0.4,1]（不弃整档） */
export function parseBkFloatPanelGeo(raw: string | null): BkFloatPanelGeo | null {
    if (!raw) return null;
    try {
        const p = JSON.parse(raw) as Partial<BkFloatPanelGeo> | null;
        const x = Number(p?.x);
        const y = Number(p?.y);
        const w = Number(p?.w);
        const h = Number(p?.h);
        if (![x, y, w, h].every(Number.isFinite)) return null;
        const o = Number(p?.o);
        return {
            x,
            y,
            w,
            h,
            o: Number.isFinite(o) ? Math.max(BK_FLOAT_PANEL_MIN_OPACITY, Math.min(1, o)) : 1,
        };
    } catch {
        return null;
    }
}

/** 面板几何读档：bkFloatPanelGeo 档优先（xywh 非有限=手改坏档弃用防 NaN 像素，o 非有限
 *  单独宽恕回 1）；无档时收编 localStorage 旧档（固定端口环境有真值，桌面端随机端口
 *  origin 下恒空）并落新档。均无→null（调用方回默认右下 520×420） */
export function loadBkFloatPanelGeo(): BkFloatPanelGeo | null {
    const p = bkFloatPanelGeo.get();
    if (p && [p.x, p.y, p.w, p.h].every(Number.isFinite)) {
        return Number.isFinite(p.o) ? p : { ...p, o: 1 };
    }
    const legacy = parseBkFloatPanelGeo(localStorage.getItem(BK_FLOAT_PANEL_LS_KEY));
    if (legacy) saveBkFloatPanelGeo(legacy);
    return legacy;
}

/** 面板几何落盘（拖拽/resize 松手、透明度 change 提交、旧档收编共用）：set 后紧跟
 *  write 确定性落盘（settingFactory.set 只写内存不落盘，搭车不可靠——stores.ts 注释） */
export function saveBkFloatPanelGeo(geo: BkFloatPanelGeo) {
    bkFloatPanelGeo.set(geo);
    void bkFloatPanelGeo.write();
}
