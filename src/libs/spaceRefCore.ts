// src/libs/spaceRefCore.ts
// 空格转引用（SpaceRefBox）纯函数核心——零 DOM 依赖全单测（spec §3 模块结构）。
// DOM 读取在 Box 层做完传入：extractWord 吃「光标前文本」，replaceAnchored 吃整块 markdown。
// spec: docs/superpowers/specs/2026-09-03-space-ref-design.md

export type TitleRow = { id: string; content: string; updated: string };

export type Decision =
    | { kind: "exact" | "fuzzy"; title: TitleRow }
    | { kind: "create" }
    | { kind: "skip-single" }
    | { kind: "skip-long" }
    | { kind: "skip-empty" };

// 边界字符 = 空白或标点；\s 覆含全角空格 U+3000，\p{P} 覆盖中英标点（Tag2RefBox @@ 语法同款类）
const BOUNDARY = /[\s\p{P}]/u;
const MAX_WORD = 20;
const MAX_ANCHOR = 12;

/** 取词：输入光标前全部文本（含刚敲的空格）→ 跳过尾部空白，向前扫到最近边界。
 *  词空返回 null；anchor = 词开始位置之前最近 ≤12 个字符（词在块首则空串）。 */
export function extractWord(textBeforeCursor: string): { word: string; anchor: string } | null {
    let i = textBeforeCursor.length;
    while (i > 0 && /\s/.test(textBeforeCursor[i - 1])) i--;
    const end = i;
    while (i > 0 && !BOUNDARY.test(textBeforeCursor[i - 1])) i--;
    const word = textBeforeCursor.slice(i, end);
    if (!word) return null;
    return { word, anchor: textBeforeCursor.slice(Math.max(0, i - MAX_ANCHOR), i) };
}

const codePoints = (s: string) => [...s].length;

/** 决策（静默，按序）：边界拦截 → 精确（=== 区分大小写，多条 updated 最新）→
 *  单字只许精确 → 包含（不区分大小写，content 码点最短，平手 updated 最新）→ 新建。 */
export function decide(word: string, titles: TitleRow[]): Decision {
    if (!word) return { kind: "skip-empty" };
    if (codePoints(word) > MAX_WORD) return { kind: "skip-long" };
    const exact = titles.filter(t => t.content === word);
    if (exact.length > 0) {
        return { kind: "exact", title: exact.reduce((a, b) => (b.updated > a.updated ? b : a)) };
    }
    if (codePoints(word) === 1) return { kind: "skip-single" };
    const lower = word.toLowerCase();
    const fuzzy = titles.filter(t => t.content.toLowerCase().includes(lower));
    if (fuzzy.length > 0) {
        const best = fuzzy.reduce((a, b) => {
            const la = codePoints(a.content), lb = codePoints(b.content);
            return lb < la || (lb === la && b.updated > a.updated) ? b : a;
        });
        return { kind: "fuzzy", title: best };
    }
    return { kind: "create" };
}

/** 锚定替换：md 串中找「锚+词」组合的最后一个匹配位（锚为空则词的最后一次出现），
 *  只替换该处词为 syntax。锚与词都匹配不上 → null（Box 层记 Loki 后放弃本次）。 */
export function replaceAnchored(md: string, word: string, anchor: string, syntax: string): string | null {
    const needle = anchor + word;
    const idx = md.lastIndexOf(needle);
    if (idx < 0) return null;
    return md.slice(0, idx + anchor.length) + syntax + md.slice(idx + needle.length);
}

export function refSyntaxFor(type: "ref" | "lnk", title: TitleRow): string {
    return type === "lnk" ? `[[${title.id}|${title.content}]]` : `((${title.id} '${title.content}'))`;
}
