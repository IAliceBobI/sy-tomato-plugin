// src/libs/graphPill.ts
// graphrelayout □9（2026-09-20）：内容块胶囊化纯函数——bear 拍板「内容块收成单行胶囊，
// hover 看内容」。段落=单行胶囊 ¶×N（相邻合并唯一，合并逻辑仍在 graphParaMerge 数据层）；
// 其他内容块按块型各自独立胶囊不合并；分割线 tb 渲染过滤不进图。
// 本文件=胶囊标签/摘要截断/hr 过滤的纯函数层（零 IO 零 i18n——类型词由调用方传键值），
// 渲染在 GraphNode.svelte（.gn-pill）+ hover 预览浮层 GraphPreview.svelte（graphPreview.ts）。
import { stripMarkSyntax } from "./graphMarks";

/** ¶×N 合并胶囊首轮估算尺寸（dagreW/dagreH；measured 精修接管，□2 两轮机制）。
 *  ~120×28 一行：label 极短（¶×N）宽恒 120；普型胶囊宽按 label 估（pillEstWidth） */
export const PARA_PILL_W = 120;
export const PILL_H = 28;
/** hover 预览摘要字数（拍板：首尾段各 ~100 字） */
export const SUMMARY_CHARS = 100;

/** 分割线块（NodeThematicBreak→'tb'）不进图 */
export function isHrRow(row: { type?: string }): boolean {
    return row.type === "tb";
}

/** hr 过滤（rows+links 联动，filterCustomRows 同款契约）：端点落在 tb 上的边连坐丢弃；
 *  无 tb 时原样返回（引用相等，零拷贝） */
export function filterHrGraph<T extends { id?: string; type?: string }, L extends { block_id?: string; def_block_id?: string }>(
    rows: T[],
    links: L[],
): { rows: T[]; links: L[] } {
    if (!rows.some(r => r.type === "tb")) return { rows, links };
    const kept = new Set(rows.filter(r => r.type !== "tb").map(r => r.id ?? ""));
    return {
        rows: rows.filter(r => r.type !== "tb"),
        links: links.filter(l => kept.has(l.block_id ?? "") && kept.has(l.def_block_id ?? "")),
    };
}

/** 胶囊单行文本：换行折空格（胶囊恒单行）+首尾 trim+超长截断加省略号 */
export function pillLine(text: string, max: number): string {
    const oneLine = (text ?? "").replace(/\s*\n\s*/g, " ").trim();
    if (oneLine.length <= max) return oneLine;
    return oneLine.slice(0, Math.max(0, max - 1)) + "…";
}

/** 预览摘要截断：保留换行（浮层多行 pre-wrap 渲染），超长截断加省略号。
 *  stripMarkSyntax 剥 ==高亮== 记法（图内纯文本展示与标记叶卡同口径） */
export function pillClip(text: string, max = SUMMARY_CHARS): string {
    const s = stripMarkSyntax(text ?? "").trim();
    if (s.length <= max) return s;
    return s.slice(0, Math.max(0, max - 1)) + "…";
}

/** 胶囊呈现规格（GraphNode .gn-pill 渲染） */
export interface PillSpec {
    /** 字形前缀（❯ ❝ ▦ ∑ ¶ ▶ ♪ ▣） */
    glyph: string;
    /** 单行文案（已截断） */
    label: string;
}

/** hover 预览内容规格（GraphPreview 浮层渲染；graphPreview.ts 消费） */
export interface PillPreview {
    /** 浮层标题行（类型词/文件名/段落链 N 段） */
    title: string;
    /** 通用正文行（代码前几行/表头/公式源/引用摘要…；空=只有标题） */
    lines: string[];
    /** 数据库 av 块 id（DOM 通道才带；在场=浮层惰性拉列名清单回填） */
    avID?: string;
}

/** 锚矩形（getBoundingClientRect 鸭子子集；浮层定位输入） */
export interface PreviewAnchor {
    left: number;
    top: number;
    bottom: number;
    width: number;
}

/**
 * 浮层定位（纯函数，单测锁数学）：默认锚**下方**左对齐（胶囊 hover 阅读动线）；
 * 下方放不下翻锚上方；左右/上下溢出钳视口边（gap 6 + 边距 4）。
 * 放 graphPill 而非 graphPreview：单测链不得引入 .svelte（vitest 无 svelte transform）。
 */
export function previewPos(
    anchor: PreviewAnchor,
    w: number,
    h: number,
    vw: number,
    vh: number,
    gap = 6,
    edge = 4,
): { left: number; top: number } {
    // 水平：左对齐锚，右溢钳右缘（超视口宽的巨型浮层钳不出负值）
    let left = anchor.left;
    if (left + w > vw - edge) left = vw - w - edge;
    if (left < edge) left = edge;
    // 垂直：默认下方；下方放不下翻上方；翻后仍放不下（上下都挤）=贴上边缘
    let top = anchor.bottom + gap;
    if (top + h > vh - edge) top = anchor.top - h - gap;
    if (top < edge) top = Math.max(edge, Math.min(vh - h - edge, anchor.bottom + gap));
    return { left, top };
}

/** ¶ 胶囊规格：合并链=「¶×N」（N=链内总段数=paraCount+1，链头计入——paraCount 表
 *  语义「成员数」不动，显示层 +1，□9 defaults）；单段=「¶」+首行摘要（相邻合并唯一，
 *  落单段不硬凑 ×1） */
export function paraPillSpec(totalBlocks: number, sampleText: string): PillSpec {
    if (totalBlocks > 1) return { glyph: "¶", label: `¶×${totalBlocks}` };
    const first = (sampleText ?? "").split("\n").find(s => s.trim().length > 0) ?? "";
    return { glyph: "¶", label: pillLine(first, 10) || "¶" };
}

/** ¶ 合并链 hover 预览：块数+首尾段各 ~100 字摘要（拍板口径）。
 *  runText=joinParaText 产物（\n 分段；clipParaText 的 2000 字截断只裁中段，
 *  首尾段边界不破——split 首行末行即链首尾段） */
export function paraRunPreview(totalBlocks: number, runText: string, title: string): PillPreview {
    const paras = (runText ?? "").split("\n").map(s => s.trim()).filter(s => s.length > 0);
    const lines: string[] = [];
    if (paras.length) lines.push(pillClip(paras[0]));
    if (paras.length > 1) lines.push(pillClip(paras[paras.length - 1]));
    return { title: title.replace("%1", `${totalBlocks}`), lines };
}

/** 表格行数：markdown 竖线行优先（| --- | 分隔行不计）；无 markdown 时退正文换行数
 *  （DOM 通道 tableCellText 是单行串，此兜底给 1）；两者皆缺=0（调用方决定退化标签） */
export function tableRowCount(markdown: string | undefined, content: string): number {
    const rows = (markdown ?? "").split("\n").filter(l => {
        const t = l.trim();
        if (!t.startsWith("|") || !t.endsWith("|")) return false;
        return !/^\|[\s:|-]+\|$/.test(t); // 分隔行（| --- | --- |）不算数据行
    }).length;
    if (rows > 0) return rows;
    return Math.max((content ?? "").split("\n").filter(s => s.trim().length > 0).length, 0);
}

/** 表头行（markdown 首个非分隔竖线行）→ 单元格「 · 」连接；无 markdown=退正文原样单行 */
export function tableHeaderLine(markdown: string | undefined, content: string): string {
    for (const l of (markdown ?? "").split("\n")) {
        const t = l.trim();
        if (!t.startsWith("|") || !t.endsWith("|")) continue;
        if (/^\|[\s:|-]+\|$/.test(t)) continue;
        return t.slice(1, -1).split("|").map(c => c.trim()).filter(Boolean).join(" · ");
    }
    return (content ?? "").split("\n")[0] ?? "";
}

/** 媒体文件名（markdown 通道）：图片 ![alt](assets/x.png) / 音视频 <video|audio src="assets/x.mp3">；
 *  取 src basename 剥查询串；非媒体 markdown=null */
export function mediaNameFromMarkdown(md: string | undefined): string | null {
    const s = (md ?? "").trim();
    const img = s.match(/^!\[[^\]]*\]\(([^)]+)\)$/);
    if (img?.[1]) return basename(img[1]);
    const av = s.match(/<(?:video|audio)[^>]*\ssrc="([^"]+)"/);
    if (av?.[1]) return basename(av[1]);
    return null;
}

function basename(src: string): string {
    return src.split(/[?#]/)[0].split("/").filter(Boolean).pop() ?? "";
}

/** 胶囊尺寸首轮估算（dagreW；measured 精修接管）：glyph 16px+左右 padding 20+label
 *  按 12px/字（CJK 粗估），钳 [88, 300] */
export function pillEstWidth(label: string): number {
    return Math.min(Math.max(88, 36 + (label ?? "").length * 12), 300);
}

/** 内容块胶囊总装（structLeaf 非标记叶按块型；□9 拍板词形）：
 *  c=❯ 代码 / b=❝ 引用 / t=▦ 表 N 行 / m=∑ 公式 / video·audio·image=图标+文件名 /
 *  av=▦ 属性视图 / 其余（html·iframe·widget·query_embed）=▫+首行。相邻不合并各自独立。
 *  word=类型词表（i18n 由调用方注入，本文件零 i18n）；markdown/tableRows/media 为
 *  通道能力补集（SQL 轻通道 getRows 带 markdown 列 / DOM 通道 fillChildren 直提） */
export interface PillWords {
    code: string; quote: string; table: string; tableRows: string; tableRowsLine: string;
    math: string; audio: string; video: string; av: string;
    /** ¶ 合并链预览标题（"%1"=段数占位） */
    paraChain: string;
}
export function contentPillSpec(
    type: string,
    content: string,
    words: PillWords,
    opts?: { markdown?: string; tableRows?: number; tableHead?: string; media?: string; avID?: string },
): { pill: PillSpec; preview: PillPreview } {
    const text = content ?? "";
    switch (type) {
        case "c": {
            // 前 5 行（DOM 通道首行=语言标记）
            const lines = text.split("\n").filter(s => s.trim().length > 0).slice(0, 5).map(s => pillClip(s, 80));
            return { pill: { glyph: "❯", label: words.code }, preview: { title: words.code, lines } };
        }
        case "b":
            return { pill: { glyph: "❝", label: words.quote }, preview: { title: words.quote, lines: [pillClip(text)] } };
        case "t": {
            const rows = opts?.tableRows && opts.tableRows > 0
                ? opts.tableRows
                : tableRowCount(opts?.markdown, text);
            const header = opts?.tableHead || tableHeaderLine(opts?.markdown, text);
            const label = rows > 0 ? words.tableRows.replace("%1", `${rows}`) : words.table;
            const lines: string[] = [];
            if (header) lines.push(pillClip(header, 80));
            if (rows > 0) lines.push(words.tableRowsLine.replace("%1", `${rows}`));
            return { pill: { glyph: "▦", label }, preview: { title: words.table, lines } };
        }
        case "m": {
            const lines = text.split("\n").filter(s => s.trim().length > 0).slice(0, 10).map(s => pillClip(s, 120));
            return { pill: { glyph: "∑", label: words.math }, preview: { title: words.math, lines } };
        }
        case "video":
        case "audio": {
            const name = opts?.media || mediaNameFromMarkdown(opts?.markdown) || pillLine(text, 16) || (type === "audio" ? words.audio : words.video);
            return {
                pill: { glyph: type === "audio" ? "♪" : "▶", label: pillLine(name, 16) },
                preview: { title: `${type === "audio" ? words.audio : words.video} · ${name}`, lines: [] },
            };
        }
        case "av":
            return {
                pill: { glyph: "▦", label: words.av },
                preview: { title: words.av, lines: [], avID: opts?.avID || undefined }, // avID 在场=浮层惰性拉列名清单回填（DOM 通道 data-av-id）
            };
        default: {
            // 图片：仅含图片的段落。media 在场=权威信号（fillChildren 只对剥 img span 后
            // 无正文的段落设 media——alt 文本在 img span 内会进 content，但「仅含图片」
            // 判定已由探针完成）；markdown 通道=整段单图正则
            const mediaName = opts?.media || mediaNameFromMarkdown(opts?.markdown);
            if (type === "p" && mediaName) {
                return {
                    pill: { glyph: "▣", label: pillLine(mediaName, 16) },
                    preview: { title: mediaName, lines: [] },
                };
            }
            // 其余未点名类型（html/iframe/widget/query_embed）+普通落单段落
            const first = (text ?? "").split("\n").find(s => s.trim().length > 0) ?? "";
            const glyph = type === "p" ? "¶" : "▫";
            const label = pillLine(first, 10) || (type === "p" ? "¶" : "▫");
            return { pill: { glyph, label }, preview: { title: label, lines: text.trim() ? [pillClip(text, 200)] : [] } };
        }
    }
}
