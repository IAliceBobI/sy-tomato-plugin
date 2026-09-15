// 前缀文档树纯函数层（prefixui □2）：命中谓词与标签聚合从组件/入口抽出，供
// PrefixArticles.ts（getPrefixDocs）与 PrefixArticleParts.svelte（Tags 窗组区）共用防两处漂移，
// 零依赖（不 import siyuan/svelte/store）——单测链可直连（.svelte 转型缺失=套件级静默挂）。

/** Tags 窗 chip 聚合条目：count=含该 part 的文档数（chip 徽章） */
export interface PartAgg {
    part: string;
    /** 该 part 最新一次变动时间（排序键：倒序=最近动过的标签靠前） */
    updated: string;
    count: number;
}

/** 前缀文档树命中谓词：文档名或标签含 part 即入组（getPrefixDocs 同款语义，只抽不改） */
export function matchPart(
    block: { content?: string | null; tag?: string | null },
    part: string,
): boolean {
    const docName = block.content?.trim() ?? "";
    const tag = block.tag?.trim() ?? "";
    return docName.includes(part) || tag.includes(part);
}

/**
 * 文档名分段（prefixui □7 单一事实源）：丨归一为 |、split、**去末段（标题本体）**、
 * trim、空段剔除——aggregateParts（Tags 云）与 getPrefixDocs（跟随列表）共用。
 * 去末段=readParts 历史语义：标题词不当标签（bear 病灶=「人性 | 恶」的「恶」子串
 * 命中「喜恶」→侧栏 2 篇 vs 云 1 篇；两侧同规后对齐）。
 */
export function nameParts(raw: string): string[] {
    return raw
        .replaceAll("丨", "|")
        .split("|")
        .slice(0, -1)
        .map((i) => i.trim())
        .filter((i) => !!i);
}

/**
 * 全库标签聚合（原 PrefixArticleParts.readParts 主体）：
 * 文档名按丨/|分段去掉末段（标题本体）+ IAL tag 按#拆，trim 去空后聚合——
 * 每 part 取最新 updated、统计去重文档数，整体按 updated 倒序。
 */
export function aggregateParts(
    blocks: Iterable<{
        id?: string;
        content?: string | null;
        tag?: string | null;
        updated?: string;
    }>,
): PartAgg[] {
    const latest = new Map<string, PartAgg>();
    const docSets = new Map<string, Set<string>>();
    for (const block of blocks) {
        const parts = [
            ...nameParts(block.content ?? ""),
            ...(block.tag ?? "").split("#").map((i) => i.trim()),
        ].filter((i) => !!i);
        for (const part of parts) {
            let ids = docSets.get(part);
            if (!ids) {
                ids = new Set();
                docSets.set(part, ids);
            }
            ids.add(block.id ?? "");
            const old = latest.get(part);
            if (!old || (block.updated ?? "") > (old.updated ?? "")) {
                latest.set(part, { part, updated: block.updated ?? "", count: 0 });
            }
        }
    }
    const result = [...latest.values()];
    for (const agg of result) {
        agg.count = docSets.get(agg.part)?.size ?? 1;
    }
    return result.sort((a, b) => -a.updated.localeCompare(b.updated));
}

/**
 * Tags 窗组区文档聚合（prefixui □5 交集语义，bear 反馈「以筛选为目的」）：
 * 文档须同时含全部所选标签（matchPart 子串语义，一个不中即早退）；
 * 命中徽章=parts 传入序首个命中（调用方传 chip 云序=云内靠前者认领）；
 * 排序比较器注入（titleSort 在 PrefixArticles.ts，零依赖原则不反向 import），
 * slice 封顶留给调用方（total=返回长度）。
 */
export function groupDocsByParts(
    blocks: Iterable<{ id?: string; content?: string | null; tag?: string | null }>,
    parts: string[],
    cmp: (a: ArticlesPrefix, b: ArticlesPrefix) => number,
): ArticlesPrefix[] {
    if (parts.length === 0) return [];
    const docs: ArticlesPrefix[] = [];
    for (const block of blocks) {
        let hit: string | null = null;
        let all = true;
        for (const part of parts) {
            if (matchPart(block, part)) {
                if (hit === null) hit = part;
            } else {
                all = false;
                break;
            }
        }
        if (all && hit !== null) {
            docs.push({ id: block.id ?? "", docName: block.content?.trim() ?? "", prefix: hit });
        }
    }
    docs.sort(cmp);
    return docs;
}

/**
 * 徽章口径与组区对齐的命中计数（matchPart 子串语义）：chip 徽章数=点开组区的篇数
 * （段级计数会少算「宝宝巴士」这类子串命中与末段标题，7 vs 9 用户最先当 bug 报）。
 * O(parts×docs) 短串扫描，窗口打开/刷新时一次性；巨库若实测成瓶颈再优化，勿预设分叉。
 */
export function countPartMatches(
    blocks: Iterable<{ content?: string | null; tag?: string | null }>,
    parts: string[],
): Map<string, number> {
    const counts = new Map<string, number>();
    const docList = [...blocks];
    for (const part of parts) {
        let n = 0;
        for (const block of docList) {
            if (matchPart(block, part)) n++;
        }
        counts.set(part, n);
    }
    return counts;
}
