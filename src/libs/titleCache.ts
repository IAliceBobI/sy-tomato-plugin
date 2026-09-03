// src/libs/titleCache.ts
// 空格转引用的标题内存缓存（spec §3）：决策毫秒级匹配不走 SQL。
// 懒加载 + 并发共享 promise + 60s TTL（过期先用旧值答、后台重拉不阻塞输入）+ 建文档写穿。
// 工厂注入 fetchTitles/now 供单测；默认单例走 siyuan.sql 全量文档标题。
import { siyuan } from "./siyuanApi";
import type { TitleRow } from "./spaceRefCore";

export type { TitleRow } from "./spaceRefCore";

export function createTitleCache(
    fetchTitles: () => Promise<TitleRow[]>,
    now: () => number = Date.now,
    ttlMs = 60_000,
) {
    let rows: TitleRow[] = [];
    let fetchedAt = 0;
    let pending: Promise<void> | null = null;

    const refresh = () => {
        if (pending) return pending;
        pending = (async () => {
            try {
                rows = (await fetchTitles()) ?? [];
                fetchedAt = now();
            } catch {
                // 拉取失败保旧值，下次触发再试
            } finally {
                pending = null;
            }
        })();
        return pending;
    };

    return {
        async get(): Promise<TitleRow[]> {
            if (rows.length === 0) await refresh();
            if (now() - fetchedAt > ttlMs) refresh(); // 后台重拉，不 await（旧值先答）
            return rows;
        },
        push(row: TitleRow) {
            rows.push(row);
        },
        peek(): TitleRow[] {
            return rows;
        },
    };
}

export const titleCache = createTitleCache(async () =>
    // limit 大数防内核 SQL 无 limit 截尾（type='d' 全量被截 64 行实测 2026-09-03，Tag2RefBox
    // 模糊查询同款配方）；Block 的 id 可选性与 TitleRow 不合，收窄 cast
    ((await siyuan.sql("select id, content, updated from blocks where type='d' limit 10000000")) ?? []) as TitleRow[]);
