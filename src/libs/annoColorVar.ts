// 彩字色源机器（annocolor □2/□3）：kramdown 彩字区间解析 + 色值归一。
// 独立模块防循环：annoOverview（总览）与 annoCollect（收集引文染色）双向消费，
// 前者本就 import 后者（hostQuoteText），色源须沉到两者之下的公共层。
// 形态清单与真实样本=tests/unit/annoColorFixtures.ts（F1~F15，6810 真实 UI 通道采样）。
import { ANNO_HREF_PREFIX } from "./annotationsAttr";

/** kramdown 内一条彩字区间：净化文本 + 色分组键（色板键或自定义字面色值，□5 起值域
 *  扩——消费 var() 包裹须过 markVarCss）+ 区间内批注锚 id 集 */
export interface MarkInterval {
    text: string;
    markVar: string;
    annoIDs: string[];
}

/** 语义样式（A 面板 style1 错误/警告/信息/成功）背景变量 → 色板等价键。
 *  主题 daylight/midnight 里 --b3-font-background1..4 就定义为 var(--b3-card-{四色}-background)
 *  ——语义样式 fallback 即同源 card 色，视觉同色归并进同组（annocolor □1 实证）。 */
const SEMANTIC_BG_TO_PALETTE: Record<string, string> = {
    error: "--b3-font-background1",
    warning: "--b3-font-background2",
    info: "--b3-font-background3",
    success: "--b3-font-background4",
};

/** 背景色样式值 → 分组键（markVar）。认：色板 `var(--b3-font-backgroundN)`（span/mark 两通道
 *  同值）；语义样式 `var(--b3-inline-builtin-{四色}-background-color, var(--b3-card-…))`（归一）；
 *  自定义颜色字面值——hex/rgb()/rgba()/hsl()/hsla() 原样透传（treemap □5 反哺：陆杰 20:14
 *  实锤划线总览只认色板变量、8 条自定义 hex 落无色分组；值即分组键兼 CSS color）。
 *  不认（边界，发版口径）：自定义样式 var(--b3-inline-style-…)（块级解不出具体色）、
 *  带任意 fallback 的 var、命名色（red）、其余杂值。 */
const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FUNC_COLOR_RE = /^(?:rgb|rgba|hsl|hsla)\([^()]*\)$/;
export function normalizeBgVar(styleValue: string): string | null {
    const v = styleValue.trim();
    let m = v.match(/^var\((--b3-font-background\d+)\)$/);
    if (m) return m[1];
    m = v.match(/^var\(--b3-inline-builtin-(error|warning|info|success)-background-color,/);
    if (m) return SEMANTIC_BG_TO_PALETTE[m[1]];
    if (HEX_COLOR_RE.test(v) || FUNC_COLOR_RE.test(v)) return v;
    return null;
}

/** markVar → CSS color 值（消费面统一适配，□5 起 markVar 值域含字面色值）：色板键
 *  （--b3-… 裸变量名）补 var() 包裹；hex/rgb() 等字面值原样（var() 参数必须是
 *  自定义属性名，字面值直塞=整条声明非法静默失效）。 */
export function markVarCss(v: string): string {
    return v.startsWith("--") ? `var(${v})` : v;
}

/** style 串提取 background-color 值并归一（属性序无关；语义/色板值内无分号）；
 *  无 background-color 或不认 → null */
export function bgVarOfStyle(style: string): string | null {
    const m = style.match(/background-color:\s*([^;]+);?/);
    return m ? normalizeBgVar(m[1]) : null;
}

/** 彩字区间整体正则，三分支交替（exec 按文档序产出；annocolor □1 真实采样 F1~F15）：
 *  ① mark：==INNER=={: style="…"}——单属性色板 + 多属性（语义双属性/mark 叠字色/
 *     粗体+底色 ==**x**==）泛化；INNER 禁 `=`（== 即闭合，跨区间吞并把无色 mark 卷进有色区间）
 *  ② span：<span data-type="text…" style="…">INNER</span>——A 面板一步上色（用户自然通道，
 *     主实例 51:8 压倒多数）；INNER 无 `<`（行内锚/加粗皆非标签形态；嵌套 span 截断=已知限制）
 *  ③ 锚段：[T](#tomato-anno-ID){: style="…"}——批注把彩字劈三段（span|锚|span / mark 三段），
 *     锚自带样式 IAL=带锚区间；无样式 IAL 的普通锚不匹配
 *  分支匹配后统一过 bgVarOfStyle：无底色（纯字色 span）/不认色值（hex/自定义）在此拦下。 */
const COLOR_PIECE_RE = new RegExp(
    `==((?:[^=]|=(?!=))*)==\\{: style="([^"]*)"\\}`
    + `|<span data-type="([^"]*)" style="([^"]*)">([^<]*)</span>`
    + `|\\[([^\\]\\n]*)\\]\\(${ANNO_HREF_PREFIX}([0-9a-zA-Z-]+)\\)\\{: style="([^"]*)"\\}`,
    "g");
// 锚 id 字符集同 annoKramdown.stripAllAnnoLinks（[0-9a-zA-Z-]+）；前缀无正则元字符直拼。
// 文本段容 ] 转义形态（Lute 对 [a\]b](#…) 的输出，reasoning review P1-1）：裸 ] 提前断配
// 会让锚区间解不出→色丢+重复卡+残渣三联缺陷；捕获后去转义还原显示文本
const ANCHOR_RE = new RegExp(`\\[((?:[^\\\\\\]]|\\\\.)*)\\]\\(${ANNO_HREF_PREFIX}([0-9a-zA-Z-]+)\\)`, "g");
const unescapeKramdownText = (t: string) => t.replace(/\\(.)/g, "$1");

/** 提取块 kramdown 的全部彩字区间（文档序，span/mark/锚段三形态统一）：剥锚链接得净化
 *  文本、锚 id 收进 annoIDs；无底色与不认色值的片静默跳过。 */
export function parseColorIntervals(kramdown: string | null | undefined): MarkInterval[] {
    if (!kramdown) return [];
    const out: MarkInterval[] = [];
    COLOR_PIECE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = COLOR_PIECE_RE.exec(kramdown)) != null) {
        let inner: string;
        let style: string;
        let anchorID = "";
        if (m[1] !== undefined) { inner = m[1]; style = m[2]; } // ① mark
        else if (m[3] !== undefined) { inner = m[5]; style = m[4]; } // ② span
        else { inner = m[6]; anchorID = m[7]; style = m[8]; } // ③ 锚段
        const markVar = bgVarOfStyle(style);
        if (!markVar) continue;
        const annoIDs: string[] = [];
        if (anchorID !== "") annoIDs.push(anchorID);
        ANCHOR_RE.lastIndex = 0;
        let a: RegExpExecArray | null;
        while ((a = ANCHOR_RE.exec(inner)) != null) annoIDs.push(a[2]);
        out.push({ text: unescapeKramdownText(inner.replace(ANCHOR_RE, (_m, t: string) => t)), markVar, annoIDs });
    }
    return out;
}

/** 批注锚所处彩字区间的色变量（收集引文染色/总览想法卡染色共用通道；annocolor □3 起
 *  span/语义/锚段三劈全形态统一——旧邻域配对逻辑由区间解析天然覆盖：锚不在任何彩字
 *  区间 → null=该条无色）。 */
export function markVarOfAnchor(kramdown: string, annoID: string): string | null {
    return parseColorIntervals(kramdown).find((iv) => iv.annoIDs.includes(annoID))?.markVar ?? null;
}
