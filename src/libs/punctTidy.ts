// 标点自动整理引擎（2026-09-10 puncttidy 战役：自 sy-seller-plugin my-utils.tidyPunctuation 抽取纯函数化，
// 番茄与 seller 双消费同一实现——修 bug 一处生效）。
//
// 两档规则：
// - 普适档（恒开）：。。→…… + ‘’“”奇偶配对重排 + 句末（……。！——？）后跟 “→” 方向纠正
// - 扩展档（opts.ext，速记折叠族，默认关）：成对单引号四形态/··→『、》》/《《→箭头、
//   『』【】配对、句末+『→』、，”→……”、，』→……』
//
// 语义契约（照抄 seller 现网行为，勿「顺手优化」）：
// - 四段式执行：⓪自定义映射（□7，可配）→①折叠组（顺序敏感，后续 replaceAll 吃前序产物）
//   →②奇偶配对重排→③句末方向修正
// - 配对计数器跨 texts 元素共享累计——奇偶状态机匹配打字过程（刚打的开引号悬着=奇数态）
// - replaceAllIf=仅当串以 old 结尾才全文替换（打字中场景守卫，串中同形处不误杀）
// - 每元素独立过①~③（endsWith 按节点判），只有计数器是跨元素状态
//
// 调用硬契约（计数器语义的前提，传错=与现网静默分叉）：
// - texts 必须是**同一块内全部 text node** 的 textContent，按 childNodes 文档序，每块恰好一次调用
//   （只传被编辑的节点=奇偶态从 0 起算，前置引号态丢失；块级收集/守卫/光标/落盘见 □2 接线层）
// - changed 仅为全局标志；逐节点判变由调用方按值比较 texts[i] !== 原值（caret offset 映射依赖它）
//
// 光标 offset 映射与触发预筛（buildPunctPrefilter，map 键须并入否则纯 ASCII 标点文本进不了引擎）
// 属接线层，本模块不管。

import type { IProtyle } from "siyuan";
import { getAttribute, getContenteditableElement, getID, getSyElement, siyuan } from "./utils";
import { BlockNodeEnum, CONTENT_EDITABLE } from "./gconst";
import { debugLog } from "./logUtils";

export interface PunctTidyOpts {
    /** 扩展档开关；false/省略=仅普适档，true=普适+扩展（seller 现行为全量） */
    ext?: boolean;
    /** □7 自定义输入映射（源字符→目标串）；空/省略=零打扰。stage ⓪ 在折叠组之前逐字替换，
     *  带 CJK 上下文守卫（it's/3.14/纯英文引号不误伤）——见 parsePunctMap/applyMap */
    map?: Map<string, string>;
}

/** 自定义映射解析（□7）：一行一条「源→目标」；源=单字符，目标=非空串（可多字符）；
 *  空行/# 注释/非法行（无分隔符、多字键、空目标）静默跳过——设置文本框的自由输入容错 */
export function parsePunctMap(src: string): Map<string, string> {
    const m = new Map<string, string>();
    for (const line of src.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const i = t.indexOf("→");
        if (i < 0) continue;
        const key = t.slice(0, i).trim();
        const val = t.slice(i + 1).trim();
        // astral 单码点键拒收：applyMap 按 UTF-16 码元扫描永不匹配（review P2 静默洞）
        if (Array.from(key).length !== 1 || key.codePointAt(0)! > 0xFFFF || !val) continue;
        m.set(key, val);
    }
    return m;
}

/** 守卫的「中文语境」判定：CJK 统一表意/扩展A/兼容 + 中文标点与全角形式 + 中文排版引号省略号破折号
 *  + 假名（\u3040-\u30FF，ja 用户）+ 谚文（\uAC00-\uD7AF，ko 用户）——插件六语种在发，
 *  语境判定须覆盖（review P2：曾漏假名而半角片假名反在 FF00-FFEF 内自相矛盾） */
const CJK_CTX = /[\u2014\u2018-\u201D\u2026\u3000-\u303F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/;

/** stage ⓪ 逐字替换：仅当左邻（输出侧——已替换的产物使连续键成链，好..→好。。）或右邻（原文侧）
 *  是中文语境字符才替换；左右邻跨 text node 接续（左=上一节点输出尾字符〔空节点不顶掉〕，
 *  右=越过空节点的下一非空节点首字符——两向对称跳空，review P2）——纯英文/数字/URL
 *  （it's、3.14、example.com）不受打扰 */
function applyMap(texts: string[], map: Map<string, string>): string[] {
    const out: string[] = [];
    let prevTail = "";
    for (let k = 0; k < texts.length; k++) {
        const txt = texts[k];
        let buf = "";
        for (let i = 0; i < txt.length; i++) {
            const c = txt[i];
            if (map.has(c)) {
                const left = buf ? buf[buf.length - 1] : prevTail;
                let right = txt[i + 1];
                if (right === undefined) {
                    for (let j = k + 1; j < texts.length; j++) {
                        if (texts[j]) { right = texts[j][0]; break; }
                    }
                }
                if ((left && CJK_CTX.test(left)) || (right && CJK_CTX.test(right))) {
                    buf += map.get(c)!;
                    continue;
                }
            }
            buf += c;
        }
        if (buf) prevTail = buf[buf.length - 1];
        out.push(buf);
    }
    return out;
}

/** 触发预筛（接线层用）：基线中文标点字符集；map 非空时键字符并入（正则转义——`-` 必须转，
 *  否则字符类内遇低码点后随键直接 Range out of order 抛错，被 observer 的 try/catch 吞成
 *  「映射静默全灭」；review P0）——否则纯 ASCII 标点文本（如 it's）在进引擎前就被预筛 return，
 *  映射永不执行（□7 实现硬坑） */
export function buildPunctPrefilter(map?: Map<string, string>): RegExp {
    if (!map?.size) return /[“”‘’『』【】·。《》]/;
    const keys = [...map.keys()].map(c => c.replace(/[-.*+?^${}()|[\]\\]/g, "\\$&")).join("");
    return new RegExp(`[“”‘’『』【】·。《》${keys}]`);
}

export function tidyTexts(texts: string[], opts: PunctTidyOpts = {}): { texts: string[]; changed: boolean } {
    const ext = opts.ext ?? false;
    // stage ⓪（□7）：映射先于折叠组执行——changed 对输入原文判定（mapped 与 texts 同下标对齐）
    const mapped = opts.map?.size ? applyMap(texts, opts.map) : texts;
    const out: string[] = [];
    let changed = false;
    let single = 0;
    let double = 0;
    let vertical = 0;
    let quote = 0;
    let idx = 0;
    for (const original of mapped) {
        const input = texts[idx++];
        let txt = original;
        // ① 折叠组（普适项 。。 与扩展项字符集不相交，分组书写等价于 seller 原顺序链）
        if (ext) {
            txt = txt.replaceAll("··", "『")
                .replaceAll("‘’", "『")
                .replaceAll("’‘", "『")
                .replaceAll("‘‘", "『")
                .replaceAll("’’", "『")
                .replaceAll("》》", " -> ")
                .replaceAll("《《", " <- ");
        }
        txt = txt.replaceAll("。。", "……");

        // ② 奇偶配对重排：族内第偶数个（0 起）=开引号形态、第奇数个=闭引号形态
        const buffer: string[] = [];
        for (const c of txt) {
            if (c === "‘" || c === "’") {
                buffer.push(single++ % 2 === 0 ? "‘" : "’");
            } else if (c === "“" || c === "”") {
                buffer.push(double++ % 2 === 0 ? "“" : "”");
            } else if (ext && (c === "『" || c === "』")) {
                buffer.push(vertical++ % 2 === 0 ? "『" : "』");
            } else if (ext && (c === "【" || c === "】")) {
                buffer.push(quote++ % 2 === 0 ? "【" : "】");
            } else {
                buffer.push(c);
            }
        }
        txt = buffer.join("");

        // ③ 句末方向修正（普适=“；ext 追加『与逗号族）
        for (const i of ["……", "。", "！", "——", "？"]) {
            txt = replaceAllIf(txt, i + "“", i + "”");
            if (ext) {
                txt = replaceAllIf(txt, i + "『", i + "』");
            }
        }
        if (ext) {
            txt = replaceAllIf(txt, "，”", "……”");
            txt = replaceAllIf(txt, "，』", "……』");
        }

        if (txt !== input) {
            changed = true;
        }
        out.push(txt);
    }
    return { texts: out, changed };
}

function replaceAllIf(txt: string, old: string, replacement: string) {
    if (txt.endsWith(old)) {
        return txt.replaceAll(old, replacement);
    }
    return txt;
}

/** 光标 offset 前缀差映射（review P1-1）：老 clamp（末尾直取/中间 min 钉旧值）在多字符目标
 *  （如 -→——）句中会把光标钉在旧 offset 劈开替换产物（下一键打成 —字—）。改为：末尾直取新末；
 *  最长公共前缀内不动；否则 offset 平移长度差并夹新末——单点编辑场景精确，收缩/扩张两向都对 */
export function mapCaret(oldS: string, newS: string, off: number): number {
    if (off >= oldS.length) return newS.length;
    let p = 0;
    const n = Math.min(oldS.length, newS.length, off);
    while (p < n && oldS[p] === newS[p]) p++;
    return off <= p ? off : Math.min(off + (newS.length - oldS.length), newS.length);
}

/** 环映射断路记忆（review P1-2）：blockID → 最近两轮输入签名。模块级单例，tomato/seller 共享；
 *  seller 不传 map 恒走不动点基线，永不命中 */
const ringGuard = new Map<string, [string, string]>();

/** 块级处理（接线层，自 seller my-utils.tidyPunctuation 抽取，2026-09-10 puncttidy □2）：
 *  守卫（段落块/非 AI 响应/可编辑）→ 全量 text node 收集（文档序，奇偶契约的机械保证）
 *  → 引擎整理 → DOM 写回 + 光标恢复 → transUpdateBlocks 构造 ops + protyle 事务落盘。
 *  observer 换绑/防误杀（paste 窗口/单批块数）在 PunctTidyBox，本函数只管单块。 */
export function tidyPunctuationBlock(protyle: IProtyle, el: HTMLElement, opts: PunctTidyOpts = {}) {
    if (el.getAttribute("custom-ai-response")) return;
    if (getAttribute(el, "data-type") !== BlockNodeEnum.NODE_PARAGRAPH) return;
    el = getSyElement(el) as HTMLElement;
    if (!el) return;
    const id = getID(el);
    if (!id) return;
    if (!el.querySelector(`[${CONTENT_EDITABLE}="true"]`)) return;
    const edit = getContenteditableElement(el);
    if (!buildPunctPrefilter(opts.map).test(edit?.textContent ?? "")) return;

    const nodes: Text[] = [];
    edit.childNodes.forEach(n => {
        if (n.nodeType === 3) nodes.push(n as Text);
    });
    const inputs = nodes.map(n => n.textContent ?? "");
    const { texts, changed } = tidyTexts(inputs, opts);
    if (!changed) return;

    // 环映射断路（review P1-2）：基线三段是一次过收敛的不动点（内核回声再触发一轮 changed=false
    // 直通自愈），stage ⓪ 是任意函数不保证不动点——。→！+！→。 这类环配置会借事务回声无限乒乓
    // （每轮一条内核事务，undo/ws 污染）。记每块最近两轮输入；本轮输出命中任一历史输入=回到了
    // 到过的状态=在环上，不写断链。≥4 长度环拦不住（病理配置接受）；LRU 上限防泄漏。
    const outSig = texts.join("\u0000");
    const hist = ringGuard.get(id);
    if (hist?.some(h => h === outSig)) return;
    const inputSig = inputs.join("\u0000");
    ringGuard.delete(id);
    ringGuard.set(id, hist ? [inputSig, hist[0]] : [inputSig, ""]);
    if (ringGuard.size > 64) ringGuard.delete(ringGuard.keys().next().value as string);

    // 打字中途纠正时光标就在被替换的 Text 内，Chromium 对程序化 textContent 修改会把
    // selection offset 重置为 0（光标跳块首），须记录并在替换后显式恢复
    const sel = document.getSelection();
    let caret: { node: Node, offset: number } | null = null;
    if (sel?.rangeCount > 0 && sel.anchorNode?.nodeType === 3 && edit.contains(sel.anchorNode)) {
        caret = { node: sel.anchorNode, offset: sel.anchorOffset };
    }
    nodes.forEach((n, i) => {
        const txt = texts[i];
        if (txt === n.textContent) return;
        if (caret?.node === n) {
            caret.offset = mapCaret(n.textContent ?? "", txt, caret.offset);
        }
        n.textContent = txt;
    });
    if (caret && sel) {
        const range = document.createRange();
        range.setStart(caret.node, caret.offset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    const ops = siyuan.transUpdateBlocks([{ id, domStr: el.outerHTML }]);
    // getInstance 拿不到（protyle 已销毁等）= 跳过落盘静默退出：DOM 已整理，内核回声会再触发一轮
    // changed=false 直通，不抛（review P2-3）
    const inst = protyle.getInstance?.();
    if (inst) inst.transaction(ops as any);
    debugLog("punctTidy", `tidied block ${id}`);
}
