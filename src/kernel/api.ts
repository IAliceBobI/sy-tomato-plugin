// kernel 侧思源 API 薄封装：一律走 siyuan.client.fetch（内核代理 REST + 插件 JWT 自鉴权）。
// 端点与参数同前端 siyuanApi 逐一对齐；勿 import 前端 siyuanApi——其依赖 window/fetch/Lute 全局。
// （照 sy-recite-plugin/src/kernel/api.ts 精简，只留查询面。）
export async function call(path: `/${string}`, payload?: Record<string, any>): Promise<any> {
  const resp = await siyuan.client.fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
  const d = await resp.json();
  if (d && typeof d.code === "number" && d.code !== 0) {
    throw new Error(`API ${path} code=${d.code} ${String(d.msg ?? "").slice(0, 120)}`.trim());
  }
  // data 原样（可 null——写类端点 data 恒 null 不是失败）：勿回退响应壳对象，
  // 双门脸 postApi 契约=「code 0 即成功，data 原样返回」（review P1-2 对齐）
  return d?.data ?? null;
}

export async function sql<T = any>(stmt: string): Promise<T[]> {
  return (await call("/api/query/sql", { stmt })) ?? [];
}

export async function getBlockAttrs(id: string): Promise<Record<string, string>> {
  return (await call("/api/attr/getBlockAttrs", { id })) ?? {};
}

export async function setBlockAttrs(id: string, attrs: Record<string, string>): Promise<void> {
  await call("/api/attr/setBlockAttrs", { id, attrs });
}

// ── 外网通道（knowledgebox □4：智谱知识库 MCP 工具用）──
// 复刻自 sy-mainline-plugin/src/kernel/api.ts（remind 战役 P0 spike 实测通道，
// 契约记录在 docs/agents/debugging/kernel/mcp.md「内核外网通道」节）——改源头须同步。

// goja 无 btoa：纯 JS base64url（RawURLEncoding）编码器
const B64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
export function base64UrlEncode(s: string): string {
    const bytes: number[] = [];
    for (let i = 0; i < s.length; i++) {
        let c = s.charCodeAt(i);
        if (c > 0x7f) {
            if (c < 0x800) {
                bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
            } else {
                bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
            }
        } else {
            bytes.push(c);
        }
    }
    let out = "";
    for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
        out += B64URL_ALPHABET[b0 >> 2];
        out += B64URL_ALPHABET[((b0 & 3) << 4) | ((b1 ?? 0) >> 4)];
        if (b1 === undefined) break;
        out += B64URL_ALPHABET[((b1 & 15) << 2) | ((b2 ?? 0) >> 6)];
        if (b2 === undefined) break;
        out += B64URL_ALPHABET[b2 & 63];
    }
    return out;
}

export interface ProxyResponse {
  status: number;
  ok: boolean;
  body: string;
}

/** 经 /api/network/proxy 的外网请求（query 参 u/h=base64url(目标 URL/请求头)，方法+body+Content-Type 透传；
 *  插件 JWT 自带 admin 角色过鉴权门）。Content-Type 双保险：init.headers（resty 对 string body
 *  默认 text/plain 会被 proxy 原样置首）+ h 参（proxy 在其后 Add）——两处一致才保证目标收到 JSON。 */
export async function proxyRequest(
    target: string,
    method: string,
    bodyJson?: any,
    headers?: Record<string, string[]>,
): Promise<ProxyResponse> {
    let path = `/api/network/proxy?u=${base64UrlEncode(target)}`;
    if (headers && Object.keys(headers).length > 0) {
        path += `&h=${base64UrlEncode(JSON.stringify(headers))}`;
    }
    const init: any = { method, headers: { "Content-Type": "application/json; charset=utf-8" } };
    if (bodyJson !== undefined) {
        init.body = JSON.stringify(bodyJson);
    }
    const resp = await siyuan.client.fetch(path as `/${string}`, init);
    return { status: resp.status, ok: resp.ok, body: await resp.text() };
}
