// 批注 kramdown 文本处理纯函数层（□4）：草稿超级块壳剥除 / 锚点链接摘除 / 气泡富文本渲染。
// 零思源 API/DOM 依赖；所有函数对用户内容先转义后插标签（XSS 防线）。
import { ANNO_HREF_PREFIX } from "./annotationsAttr";

/** 五大 HTML 实体转义；annoTextToHtml 的第一道工序，用户内容永不裸插值 */
export function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const IAL_LINE_RE = /^\s*\{:\s.*\}$/;
/** 行内 IAL 片段（列表项段落等形态：`- {: id="x" updated="y"}文本`）——须含 id="…" 才剥，防误吃正文 */
const IAL_INLINE_RE = /\{:\s[^{}\n]*id="[^"]*"[^{}\n]*\}\s?/g;
const SB_OPEN_RE = /^\{\{\{(row|cols)\s*$/; // 用户可在草稿内切列布局（reasoning P2-6）

/**
 * 草稿超级块壳剥除（□1 Spike 契约）：去首行 `{{{row` + 末两行（`}}}` 与容器 IAL 行），
 * 再剥夹杂在内容中的子块 IAL——整行形态（含缩进，列表项续行）与行内形态（列表项段落 IAL
 * 在 marker 后内联，e2e 实锤）都剥；行内形态须含 id="…" 防误伤正文。
 * 防御：壳形态不符时只剥能识别的部分，内容行「中段出现 {: …}」不误伤（须整行 IAL 才剥）。
 */
export function stripDraftShell(kramdown: string): string {
    const lines = kramdown.split("\n");
    if (lines.length > 0 && SB_OPEN_RE.test(lines[0])) lines.shift();
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
    const last = lines[lines.length - 1];
    if (last != null && IAL_LINE_RE.test(last)) {
        // 末行是容器 IAL（形如 {: id="…" …}，可能带缩进）→ 连同其前的 }}} 一起剥
        lines.pop();
        if (lines.length > 0 && lines[lines.length - 1].trim() === "}}}") lines.pop();
    } else if (last === "}}}") {
        lines.pop();
    }
    return lines
        .filter((l) => !IAL_LINE_RE.test(l))
        .map((l) => l.replace(IAL_INLINE_RE, ""))
        .join("\n")
        // 首尾 ZWSP 与空行一并剥除（□2 创建统一 + reasoning P2-1）：空种子是 ZWSP 段（内核会退化
        // 纯空 sb），用户输入与种子同段粘连后首/尾可能带 \u200b，也可能「种子段回车+另起段输入」
        // 形成 \u200b\n\n 混合——两步 replace 会在第一步被 ZWSP 挡住残留空行，须单字符类一步扫；
        // 不可见字符对用户零价值，剥首尾不伤中段内容
        .replace(/^[\n\u200b]+|[\n\u200b]+$/g, "");
}

/**
 * 从块 kramdown 摘除指定批注的锚点链接：`[文本](#tomato-anno-<id>)` → `文本`（删除链路）。
 * 只匹配本条 id 的 href，普通链接与其他批注的标记零影响；id 做 regex escape。
 * 锚后可带行内 IAL 尾（`{: style="…"}`——annocolor 上色锚的真实形态），一并吸收防孤儿
 * 残留（裸文本后的行内 IAL 不被 Lute 吸收=字面落进引文，6812 实弹实锤）。
 */
export function stripAnnoLinks(kramdown: string, annoId: string): string {
    const re = new RegExp(`\\[([^\\]]*)\\]\\(${escapeRegExp(ANNO_HREF_PREFIX + annoId)}\\)(?:\\{:[^{}\\n]*\\})?`, "g");
    return kramdown.replace(re, "$1");
}

/** 摘除全部批注锚点链接（`[文本](#tomato-anno-*)` → `文本`）。
 *  AI 讨论上下文的原文/前后相邻块专用：块内携带的批注标记是 UI 标记非内容，全剥防噪音进 prompt。
 *  锚后行内 IAL 尾同吸收（上色锚形态，见 stripAnnoLinks）。 */
export function stripAllAnnoLinks(kramdown: string): string {
    return kramdown.replace(new RegExp(`\\[([^\\]]*)\\]\\(${escapeRegExp(ANNO_HREF_PREFIX)}[0-9a-zA-Z-]+\\)(?:\\{:[^{}\\n]*\\})?`, "g"), "$1");
}

/** 剥全部块 IAL（整行形态〔含缩进/引文 `>` 前缀——b 容器 kramdown 的段落 IAL 挂在 `> ` 行
 *  上，6812 实测〕+行内形态〔须含 id="…" 防误伤正文〕）。
 *  引文复制链专用（annofeed0917 □3 A 案）：id 必须剥——insertBlock markdown 通道会**认领**
 *  显式 id（与事务 HTML 通道恒重生成相反，踩坑表在档），复制链带上原 id=同 id 物理重复行
 *  （keyed each 冻结级风险源）；updated/custom 等属性同剥（快照不带源块元数据）。 */
export function stripBlockIALs(kramdown: string): string {
    const quotedIAL = /^\s*(?:>\s*)*\{:\s.*\}$/;
    return kramdown
        .split("\n")
        .filter((l) => !quotedIAL.test(l) && !IAL_LINE_RE.test(l))
        .map((l) => l.replace(IAL_INLINE_RE, ""))
        .join("\n");
}

/** `==文本=={: style="…" …}` → `<span data-type="mark" style="…">文本</span>`（annofeed0917 □3 A 案）。
 *  Md2BlockDOM 双通道能力差异（踩坑表）：`==x=={: style}` 是 getBlockKramdown 的**输出形态**，
 *  解析方向不回灌——结构化引文回插必须转行内 span 形态；IAL 里非 style 属性丢弃
 *  （id 同 stripBlockIALs 理由须剥）。残缺的裸 `==` 展平（hostQuoteText 同款）。 */
export function markToSpans(kramdown: string): string {
    const out = kramdown.replace(/==([^=\n]+)==\{:\s*([^{}\n]*)\}/g, (_m, text: string, attrs: string) => {
        const style = /style="([^"]*)"/.exec(attrs)?.[1];
        return style != null
            ? `<span data-type="mark" style="${style}">${text}</span>`
            : `<span data-type="mark">${text}</span>`;
    });
    return out.replace(/==/g, "");
}

/** 本条目锚区间重放（annofeed0917 □6 review P1-2）：结构化引文整块语义下「想法对应原文
 *  哪段」的定位信号由锚链接重放为 mark span 承载——须在 stripAllAnnoLinks（剥他家锚）
 *  之前跑。markVar 缺省（颜色同步 OFF/锚不在彩字区间）=原文零改动，与 markWrap「色重放
 *  是唯一上色通道」语义对齐：不上色时不做标记。 */
export function replayAnnoMark(kramdown: string, annoId: string, markVar?: string): string {
    if (!markVar) return kramdown;
    const re = new RegExp(`\\[([^\\]]*)\\]\\(${escapeRegExp(ANNO_HREF_PREFIX + annoId)}\\)(?:\\{:[^{}\\n]*\\})?`, "g");
    return kramdown.replace(re, (_m, t: string) => `<span data-type="mark" style="background-color: var(${markVar});">${t}</span>`);
}

/** 代码围栏分段（annofeed0917 □6 review P1-4）：```/~~~ 围栏内内容**原样**——IAL 剥除/
 *  `==` 兜底剥除/锚剥除都是改写内容级操作，进代码块=内容损坏（`a == b` 被删成 `a  b`、
 *  字面 `{: id="x"}` 行被整行吃掉）。围栏开闭行归代码段；未闭合围栏（脏数据）其后全部
 *  按代码保护（宁可不净化，不可改写内容）。 */
function splitCodeFences(kramdown: string): { code: boolean; text: string }[] {
    const segs: { code: boolean; lines: string[] }[] = [{ code: false, lines: [] }];
    for (const l of kramdown.split("\n")) {
        if (/^\s*(?:```|~~~)/.test(l)) {
            if (segs[segs.length - 1].code) {
                segs[segs.length - 1].lines.push(l);
                segs.push({ code: false, lines: [] });
            } else {
                segs.push({ code: true, lines: [l] });
            }
        } else {
            segs[segs.length - 1].lines.push(l);
        }
    }
    return segs.filter((s) => s.lines.length > 0).map((s) => ({ code: s.code, text: s.lines.join("\n") }));
}

/** 宿主 kramdown → 结构化引文块（annofeed0917 □3 A 案逐块快照）：剥锚链接+剥 IAL+mark 转
 *  span；strong/em/code/列表/引用块/块引用原样保留。own=本条目锚区间重放（P1-2，仅非代码
 *  段、须在剥锚前）。末尾裸引文标记行/空行剔（b 容器 kramdown 的段 IAL 行剥后残留 `>`
 *  空行，回插=多一段空引文段）。空结果=该块无可引内容。 */
export function hostQuoteBlock(kramdown: string, own?: { annoId: string; markVar?: string }): string {
    const clean = (t: string) => markToSpans(stripBlockIALs(stripAllAnnoLinks(replayAnnoMark(t, own?.annoId ?? "", own?.markVar))));
    const cleaned = splitCodeFences(kramdown)
        .map((s) => (s.code ? s.text : clean(s.text)))
        .join("\n");
    const lines = cleaned.split("\n");
    while (lines.length > 0 && /^[>\s]*$/.test(lines[lines.length - 1])) lines.pop();
    return lines.join("\n").replace(/^[\n\u200b]+|[\n\u200b]+$/g, "");
}

/** 结构化引文块的纯文本投影（纯划线列表行用）：自家生成的 mark span 展平为内文本
 *  （`**` 等源码残留与 hostQuoteText 旧形态同款，接受）；单块内多行折空格。 */
export function flattenQuoteBlock(block: string): string {
    return block
        .replace(/<span data-type="mark"(?: [^>]*)?>([^<]*)<\/span>/g, "$1")
        .replace(/\s*(?:\r\n|\r|\n)+\s*/g, " ")
        .trim();
}

/** 行内标记（先 escape 后应用；code 占位保护→strong→em→链接；不完整标记保持字面）。
 *  导出供 anno-chat 沉淀卡两层消费（笔记层 li/p 文本+讨论层消息体，pre-wrap 下 \n 原样保留换行） */
export function inlineHtml(text: string): string {
    const s = escapeHtml(text);
    // code 优先且占位保护（reasoning P2-5①）：内容里的 **/链接语法不再被后续正则二次解析成嵌套标签
    const codes: string[] = [];
    let out = s.replace(/`([^`\n]+)`/g, (_m, c: string) => {
        codes.push(`<code>${c}</code>`);
        return `\u0000${codes.length - 1}\u0000`;
    });
    out = out.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    // 链接白名单：http(s)/mailto/# 渲染 <a>，其余 scheme 保留字面（防 javascript:；已转义安全）；
    // URL 允许一层圆括号嵌套（维基链接 Foo_(bar) 不截断，reasoning P2-5②）
    out = out.replace(
        /\[([^\]\n]*)\]\(((?:[^()\n]|\([^()\n]*\))+)\)/g,
        (m, txt: string, url: string) => {
            if (/^(https?:|mailto:|#)/i.test(url)) {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer">${txt}</a>`;
            }
            return m;
        },
    );
    return out.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => codes[Number(i)] ?? "");
}

const UL_RE = /^[-*]\s+/;
const OL_RE = /^\d+[.]\s+/;

/**
 * kramdown 子集 → 安全 HTML（spec §4：p / ul / ol / strong / em / code（+白名单链接）覆盖常用形态）。
 * 规则：空行分段；段内软换行 → <br>；连续列表行归组；内容先行内转义再插标签。
 */
export function annoTextToHtml(text: string): string {
    const lines = text.split("\n");
    const out: string[] = [];
    let para: string[] = [];
    let list: { ordered: boolean; items: string[] } | null = null;

    const flushPara = () => {
        if (para.length > 0) {
            out.push(`<p>${para.map(inlineHtml).join("<br>")}</p>`);
            para = [];
        }
    };
    const flushList = () => {
        if (list != null) {
            const tag = list.ordered ? "ol" : "ul";
            out.push(`<${tag}>${list.items.map((i) => `<li>${inlineHtml(i)}</li>`).join("")}</${tag}>`);
            list = null;
        }
    };

    for (const raw of lines) {
        const line = raw.trimEnd();
        if (line.trim() === "") {
            flushPara();
            flushList();
            continue;
        }
        if (UL_RE.test(line)) {
            flushPara();
            if (list?.ordered) flushList();
            list ??= { ordered: false, items: [] };
            list.items.push(line.replace(UL_RE, ""));
            continue;
        }
        if (OL_RE.test(line)) {
            flushPara();
            if (list && !list.ordered) flushList();
            list ??= { ordered: true, items: [] };
            list.items.push(line.replace(OL_RE, ""));
            continue;
        }
        flushList();
        para.push(line);
    }
    flushPara();
    flushList();
    return out.join("");
}
