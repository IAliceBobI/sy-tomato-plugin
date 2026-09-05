// 开发者本机调试日志（推本机 Grafana Loki，localhost:3100，见全局 loki skill）：
// isMe() 或 dev 实例才推（隔离实例不登录、isMe 恒 false，靠端口段放行；普通用户零
// 副作用——端口恰落在 dev 段的用户最坏多一次静默失败的 localhost fetch），
// fire-and-forget，任何失败静默——调试日志绝不影响主流程。
// 时间戳必须纳秒（毫秒 ×1e6）；同一 stream 并发推会乱序互拒（HTTP 400 丢行），
// instance label 分流（Electron=desktop，其余=browser），port label 再分实例
// （6806 主实例 / 6807+ 隔离实例并发互不干扰）。
import { isMe } from "./user";

const LOKI_PUSH_URL = "http://localhost:3100/loki/api/v1/push";

function instanceLabel(): string {
    return navigator?.userAgent?.includes("Electron") ? "desktop" : "browser";
}

// dev 实例判定只能靠端口段：本想读 workspaceDir（~/SiYuan-Dev*，主实例=~/SiYuan），
// 但内核 HideConfSecret 对 getConf 无条件清空 system 目录字段（kernel/model/conf.go
// 「HideConfSecret」节），前端恒拿到空串。端口段=make.sh devenv 族分配域（6807 共享
// 单例、6808+ 专属族；主实例恒 6806，用户常见改端口 8080/9000 在段外），上限收窄误伤面。
export function isDevPort(port: string | undefined): boolean {
    const p = Number(port);
    return p >= 6807 && p <= 6999;
}

function isDevInstance(): boolean {
    return isDevPort(globalThis.location?.port);
}

function portLabel(): string {
    // 非 browser 环境（纯 node 单测）无 location，占位保 label 值非空（Loki 拒空串）
    return globalThis.location?.port || "node";
}

// app：stream label 分流（LinkBox 既有查询用默认 "linkbox"；跨插件复用时传自己的
// 标识，如 sy-my-plugin Sign 面板传 "sign"，LogQL 按此分流互不混流）
export function debugLog(tag: string, msg: string, app: string = "linkbox"): void {
    if (!isMe() && !isDevInstance()) return;
    const line = `[${tag}] ${msg}`;
    console.debug(`[tomato] ${line}`);
    const ts = `${Date.now()}000000`;
    const body = JSON.stringify({
        streams: [{
            stream: { job: "tomato-plugin", app, instance: instanceLabel(), port: portLabel() },
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
