// □3 片段级复制到 dailynote（dailynote-pipeline 战役 2026-09-06）：块内划词选区 →
// 只复制选中片段（纯文本+源块引用锚）进日记，替代「划词也复制整块」现状。
// 判定复用 mindWire 沉淀的 normalizeWordRange（libs/domUtils.ts：非折叠+实文本+单块+
// 非代码块+connected）；容器套 □1 收集块协议 v1（dailyCollect.collectBlockAttrs）。
// A2 纯净档（陆杰 2026-10-11）：rich 参携带选区行内节点克隆（保留行内样式），
// buildPlainFragment* 直落段落零协议属性；A3 锚三态（ref/href/none）。
import { collectBlockAttrs } from "./dailyCollect";
import { DomParaBuilder, DomSuperBlockBuilder, domNewLine } from "./sydom";
import { normalizeWordRange } from "./domUtils";
import { add_href, add_ref } from "./blockUtils";
import { DATA_NODE_ID } from "./gconst";

/** 有效选区 → 片段信息；无效（折叠/跨块/空文本/代码块）返回 null（调用方走块级链）；
 *  rich=true（A2 纯净档）额外携带选区行内节点克隆 nodes（Range.cloneContents，事务
 *  HTML 通道与块级复制同款=行内 span 样式可活）；克隆失败/全空/表格块整选不带
 *  nodes=调用方退化纯文本（frag.nodes 缺省即退化，无第二条重链路） */
export function fragmentFromRange(range: Range | null | undefined, container: HTMLElement, rich = false): { text: string; sourceID: string; nodes?: Node[] } | null {
    const r = normalizeWordRange(range);
    if (!r) return null;
    const startBlock = (r.startContainer.nodeType === 3 ? r.startContainer.parentElement : r.startContainer as HTMLElement)
        ?.closest?.("div[data-node-id]") as HTMLElement | null;
    // 选区可能落在 protyle 容器外的面板（悬浮 protyle 等）——不在本编辑器内不劫持
    if (!startBlock || (container && !container.contains(startBlock))) return null;
    const sourceID = startBlock.getAttribute("data-node-id");
    const text = r.toString().trim();
    if (!sourceID || !text) return null;
    const out: { text: string; sourceID: string; nodes?: Node[] } = { text, sourceID };
    // 表格块整选（startBlock 即 NodeTable）克隆 table 进段落会畸形——退化纯文本
    // （normalizeWordRange 只排了代码块，此处补表格）
    if (rich && startBlock.getAttribute("data-type") !== "NodeTable") {
        const nodes = cloneInlineNodes(r);
        if (nodes) out.nodes = nodes;
    }
    return out;
}

/** 选区行内节点克隆（A2 主路径）：剥首尾空白文本节点（对齐 .trim() 口径：整段空白
 *  文本节点丢弃+边界文本节点裁边侧空白）+滤携带 data-node-id 的元素（防病态块级
 *  混入——normalizeWordRange 单块保证理论上排除，此处保底）；全空返 null */
function cloneInlineNodes(range: Range): Node[] | null {
    let frag: DocumentFragment;
    try {
        frag = range.cloneContents();
    } catch (_e) {
        return null;
    }
    frag.querySelectorAll(`[${DATA_NODE_ID}]`).forEach(el => el.remove());
    const nodes = [...frag.childNodes];
    const isWsText = (n: Node) => n.nodeType === 3 && !(n.textContent ?? "").trim();
    while (nodes.length && isWsText(nodes[0])) nodes.shift();
    while (nodes.length && isWsText(nodes[nodes.length - 1])) nodes.pop();
    if (nodes.length) {
        const trimEdge = (n: Node, re: RegExp) => {
            if (n.nodeType === 3 && n.textContent) n.textContent = n.textContent.replace(re, "");
        };
        trimEdge(nodes[0], /^\s+/);
        trimEdge(nodes[nodes.length - 1], /\s+$/);
    }
    return nodes.length ? nodes : null;
}

/** 片段协议容器：superblock（协议 v1 属性）+ 片段段落（选区文本+尾挂源锚）；
 *  anchorMode（A3 三态，默认 "ref" 维持现状）：ref=add_ref / href=add_href / none=不挂锚 */
export function buildFragmentContainer(text: string, sourceID: string, anchorText: string, time: string, rpath: string, anchorMode: "ref" | "href" | "none" = "ref"): DomSuperBlockBuilder {
    const para = new DomParaBuilder(text);
    if (anchorMode === "ref") {
        add_ref(para.container, sourceID, anchorText);
    } else if (anchorMode === "href") {
        add_href(para.container, sourceID, anchorText);
    }
    const builder = new DomSuperBlockBuilder();
    builder.append(para);
    builder.setAttrs(collectBlockAttrs(time, rpath));
    return builder;
}

/** A2 纯净档片段段落：无 superblock 壳、零 custom 属性、不挂锚（协议零属性=不进
 *  时间间隔统计链与近期列表，与速记纯文本同口径，属预期）；nodes 有则行内克隆
 *  直落 contenteditable div、缺省退化纯文本 */
export function buildPlainFragmentPara(input: { text: string; nodes?: Node[] }): DomParaBuilder {
    return new DomParaBuilder(input.nodes ? "" : input.text, input.nodes);
}

/** A2 纯净档两块组：恒落 [片段段落, 空段]——尾插时空段垫底成下条间隔、头插
 *  （AsChildOf=顶端）时空段隔开旧内容，头尾两向均恰一条空行 */
export function buildPlainFragmentBlocks(input: { text: string; nodes?: Node[] }): HTMLElement[] {
    return [buildPlainFragmentPara(input).build(), domNewLine()];
}
