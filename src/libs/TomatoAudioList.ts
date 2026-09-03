// 提示音选择化数据层（设置面板翻新 □3）：预置音色登记表 + 存储值↔下拉选项映射 + 自定义 URL 合法性。
// 纯逻辑无 DOM；UI 在 ConfPomodoro.svelte，播放链路在 TomatoClock.playNoticeAudio。
// 存储语义零迁移：tomato_clocks_audio 空=默认双音；选中预置=存它的打包路径（内核 serve，播放链路零改动）；
// 其余一切值（含存量 Windows 本地路径——Chromium 安全模型必拒，面板上回落 custom 并标红引导换 assets 路径）。

/** 内置到点提示音 URL（viteStaticCopy 打进 audio/，运行时由内核 serve） */
export const NOTICE_AUDIO_URL = "/plugins/sy-tomato-plugin/audio/notice.mp3";

export type AudioOptionId = "default" | "bell" | "chime" | "woodblock" | "custom";

export const AUDIO_PRESETS: ReadonlyArray<{ id: Exclude<AudioOptionId, "custom">; url: string }> = [
    { id: "default", url: NOTICE_AUDIO_URL },
    { id: "bell", url: "/plugins/sy-tomato-plugin/audio/bell.mp3" },
    { id: "chime", url: "/plugins/sy-tomato-plugin/audio/chime.mp3" },
    { id: "woodblock", url: "/plugins/sy-tomato-plugin/audio/woodblock.mp3" },
];

/** 选中「默认」时写入的存储值：空串=回落内置默认音（与老语义一致） */
export const DEFAULT_AUDIO_STORE = "";

/** 存储值 → 下拉选项：空白=default；命中预置路径=该预置；其余=custom（含存量非法路径，面板标红引导） */
export function audioOptionOf(value: string | null | undefined): AudioOptionId {
    const v = (value ?? "").trim();
    if (!v) return "default";
    const hit = AUDIO_PRESETS.find((p) => p.url === v);
    return hit ? hit.id : "custom";
}

/** 下拉选项 → 存储值：预置=其打包路径；custom 不在此定值（输入框内容才是，空则暂不写覆盖） */
export function audioStoreOf(id: Exclude<AudioOptionId, "custom">): string {
    return id === "default" ? DEFAULT_AUDIO_STORE : AUDIO_PRESETS.find((p) => p.id === id)!.url;
}

/** 自定义 URL 合法性：http(s) 外链，或站内图片/音频通道——/assets/… 绝对路径与 assets/… 相对路径
 *  （与 isValidBgUrl 同机制对齐：前端 <base href=根> 使相对形式解析为 /assets/… 独立路由，
 *  desktop/mobile 双端 2026-08-30 实测 GET 200）。
 *  Windows 绝对路径（C:\…）与 file:// 均不匹配——Chromium 安全模型下必拒，前置拦截在面板标红。 */
export function isValidAudioUrl(value: string): boolean {
    const v = value.trim();
    return /^https?:\/\//i.test(v) || v.startsWith("/") || v.startsWith("assets/");
}

/** 生成 assets 落盘文件名（「选择文件」上传通道）：时间戳+随机段防撞名，tomato- 前缀标明来源 */
export function uploadAssetName(fileName: string, now = new Date()): string {
    const ext = (fileName.match(/\.[a-z0-9]{1,5}$/i)?.[0] ?? ".mp3").toLowerCase();
    const pad = (n: number) => String(n).padStart(2, "0");
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `tomato-${ts}-${Math.random().toString(36).slice(2, 6)}${ext}`;
}
