// 开发者本机调试日志（推本机 Grafana Loki，localhost:3100，见全局 loki skill）：
// isMe() 才推（普通用户零副作用），fire-and-forget，任何失败静默——调试日志绝不影响主流程。
// 时间戳必须纳秒（毫秒 ×1e6）；桌面/浏览器多前端并发推同一 stream 会乱序互拒（HTTP 400 丢行），
// 用 instance label 分流（Electron=desktop，其余=browser）。
import { isMe } from "./user";

const LOKI_PUSH_URL = "http://localhost:3100/loki/api/v1/push";

function instanceLabel(): string {
    return navigator?.userAgent?.includes("Electron") ? "desktop" : "browser";
}

export function debugLog(tag: string, msg: string): void {
    if (!isMe()) return;
    const line = `[${tag}] ${msg}`;
    console.debug(`[tomato] ${line}`);
    const ts = `${Date.now()}000000`;
    const body = JSON.stringify({
        streams: [{
            stream: { job: "tomato-plugin", app: "linkbox", instance: instanceLabel() },
            values: [[ts, line]],
        }],
    });
    try {
        fetch(LOKI_PUSH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
        }).catch(() => { });
    } catch { /* 静默 */ }
}
