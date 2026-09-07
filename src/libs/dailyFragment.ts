// □3 片段级复制到 dailynote（dailynote-pipeline 战役 2026-09-06）：块内划词选区 →
// 只复制选中片段（纯文本+源块引用锚）进日记，替代「划词也复制整块」现状。
// 判定复用 mindWire 沉淀的 normalizeWordRange（libs/domUtils.ts：非折叠+实文本+单块+
// 非代码块+connected）；容器套 □1 收集块协议 v1（dailyCollect.collectBlockAttrs）。
import { collectBlockAttrs } from "./dailyCollect";
import { DomParaBuilder, DomSuperBlockBuilder } from "./sydom";
import { normalizeWordRange } from "./domUtils";
import { add_ref } from "./blockUtils";

/** 有效选区 → 片段信息；无效（折叠/跨块/空文本/代码块）返回 null（调用方走块级链） */
export function fragmentFromRange(range: Range | null | undefined, container: HTMLElement): { text: string; sourceID: string } | null {
    const r = normalizeWordRange(range);
    if (!r) return null;
    const startBlock = (r.startContainer.nodeType === 3 ? r.startContainer.parentElement : r.startContainer as HTMLElement)
        ?.closest?.("div[data-node-id]") as HTMLElement | null;
    // 选区可能落在 protyle 容器外的面板（悬浮 protyle 等）——不在本编辑器内不劫持
    if (!startBlock || (container && !container.contains(startBlock))) return null;
    const sourceID = startBlock.getAttribute("data-node-id");
    const text = r.toString().trim();
    if (!sourceID || !text) return null;
    return { text, sourceID };
}

/** 片段协议容器：superblock（协议 v1 属性）+ 片段段落（选区文本+尾挂源锚 ref） */
export function buildFragmentContainer(text: string, sourceID: string, anchorText: string, time: string, rpath: string): DomSuperBlockBuilder {
    const para = new DomParaBuilder(text);
    add_ref(para.container, sourceID, anchorText);
    const builder = new DomSuperBlockBuilder();
    builder.append(para);
    builder.setAttrs(collectBlockAttrs(time, rpath));
    return builder;
}
