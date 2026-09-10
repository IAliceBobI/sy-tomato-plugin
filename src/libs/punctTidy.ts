// 标点自动整理引擎（2026-09-10 puncttidy 战役：自 sy-seller-plugin my-utils.tidyPunctuation 抽取纯函数化，
// 番茄与 seller 双消费同一实现——修 bug 一处生效）。
//
// 两档规则：
// - 普适档（恒开）：。。→…… + ‘’“”奇偶配对重排 + 句末（……。！——？）后跟 “→” 方向纠正
// - 扩展档（opts.ext，速记折叠族，默认关）：成对单引号四形态/··→『、》》/《《→箭头、
//   『』【】配对、句末+『→』、，”→……”、，』→……』
//
// 语义契约（照抄 seller 现网行为，勿「顺手优化」）：
// - 三段式执行：①折叠组（顺序敏感，后续 replaceAll 吃前序产物）→②奇偶配对重排→③句末方向修正
// - 配对计数器跨 texts 元素共享累计——奇偶状态机匹配打字过程（刚打的开引号悬着=奇数态）
// - replaceAllIf=仅当串以 old 结尾才全文替换（打字中场景守卫，串中同形处不误杀）
// - 每元素独立过三段（endsWith 按节点判），只有计数器是跨元素状态
//
// 调用硬契约（计数器语义的前提，传错=与现网静默分叉）：
// - texts 必须是**同一块内全部 text node** 的 textContent，按 childNodes 文档序，每块恰好一次调用
//   （只传被编辑的节点=奇偶态从 0 起算，前置引号态丢失；块级收集/守卫/光标/落盘见 □2 接线层）
// - changed 仅为全局标志；逐节点判变由调用方按值比较 texts[i] !== 原值（caret offset 映射依赖它）
//
// 光标 offset 映射与触发预筛（/[“”‘’『』【】·。《》]/ 无命中快速返回）属接线层，本模块不管。

import type { IProtyle } from "siyuan";
import { getAttribute, getContenteditableElement, getID, getSyElement, siyuan } from "./utils";
import { BlockNodeEnum, CONTENT_EDITABLE } from "./gconst";
import { debugLog } from "./logUtils";

export interface PunctTidyOpts {
    /** 扩展档开关；false/省略=仅普适档，true=普适+扩展（seller 现行为全量） */
    ext?: boolean;
}

export function tidyTexts(texts: string[], opts: PunctTidyOpts = {}): { texts: string[]; changed: boolean } {
    const ext = opts.ext ?? false;
    const out: string[] = [];
    let changed = false;
    let single = 0;
    let double = 0;
    let vertical = 0;
    let quote = 0;
    for (const original of texts) {
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

        if (txt !== original) {
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
    if (!/[“”‘’『』【】·。《》]/.test(edit?.textContent ?? "")) return;

    const nodes: Text[] = [];
    edit.childNodes.forEach(n => {
        if (n.nodeType === 3) nodes.push(n as Text);
    });
    const { texts, changed } = tidyTexts(nodes.map(n => n.textContent ?? ""), opts);
    if (!changed) return;

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
            caret.offset = caret.offset >= (n.textContent?.length ?? 0)
                ? txt.length
                : Math.min(caret.offset, txt.length);
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
