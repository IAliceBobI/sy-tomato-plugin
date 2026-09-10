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
