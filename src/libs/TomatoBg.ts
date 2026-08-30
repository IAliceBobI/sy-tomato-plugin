// 背景图自定义（设置面板翻新 □4）数据层：透明度 store↔滑块映射 + 背景 URL 合法性 + 上传文件名。
// 纯逻辑无 DOM；UI 在 ConfClock.svelte，挂载链路在 TomatoClock（addColorDiv/预览三件套）。
// 存储语义零迁移：tomato_clocks_opacity 保持 "0.16" 小数串（滑块整数百分比双向映射）；
// 明暗两行 URL 各自独立（VS Code 式，用户偏好锚），空串=未设置（计时中无背景）。

/** 透明度默认值（与 store 工厂默认 "0.16" 一致；非法存量回落） */
export const DEFAULT_OPACITY = 0.16;

/** 背景 URL 合法性：http(s) 外链，或站内图片通道——/assets/… 绝对路径与 assets/… 相对路径
 *  （后者是用户存量习惯；前端页面带 <base href=根>，相对形式实际解析为 /assets/… 内核独立路由，
 *  desktop/mobile 双端 2026-08-30 实测 GET 200。勿按文档基址 /stage/build/… 手拼路径复测——
 *  那条路 404，浏览器相对解析不走它）。
 *  Windows 绝对路径（C:\…）与 file:// 不匹配——Chromium 安全模型必拒，面板标红引导走「选择文件」上传。 */
export function isValidBgUrl(value: string): boolean {
    const v = value.trim();
    return /^https?:\/\//i.test(v) || v.startsWith("/") || v.startsWith("assets/");
}

/** store 小数串 → 滑块整数百分比：非法回落 16%，越界钳到 0~100，四舍五入对齐 1% 步进 */
export function opacityPercentOf(value: string | null | undefined): number {
    const s = (value ?? "").trim();
    if (!s) return Math.round(DEFAULT_OPACITY * 100); // Number("")===0 陷阱：空串须先拦，否则滑块掉到 0%
    const n = Number(s);
    if (!Number.isFinite(n)) return Math.round(DEFAULT_OPACITY * 100);
    return Math.round(Math.min(1, Math.max(0, n)) * 100);
}

/** 滑块整数百分比 → store 小数串：两位小数，16 ↔ "0.16" 与存量格式逐字一致 */
export function opacityToStore(percent: number): string {
    const n = Number.isFinite(percent) ? Math.min(100, Math.max(0, Math.round(percent))) : Math.round(DEFAULT_OPACITY * 100);
    return (n / 100).toFixed(2);
}

/** 生成 assets 落盘文件名（「选择文件」上传通道）：时间戳+随机段防撞名，tomato-bg- 前缀标明来源 */
export function bgUploadAssetName(fileName: string, now = new Date()): string {
    const ext = (fileName.match(/\.[a-z0-9]{1,5}$/i)?.[0] ?? ".png").toLowerCase();
    const pad = (n: number) => String(n).padStart(2, "0");
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `tomato-bg-${ts}-${Math.random().toString(36).slice(2, 6)}${ext}`;
}
