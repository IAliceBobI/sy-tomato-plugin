// 批注 DOM 纯函数层（□3）：跨块选区拆分 / 块级条目判定 / 气泡定位。
// 零思源 API 依赖；DOM 操作走 happy-dom 可测，运行时在插件前端环境用全局 document。
// 关键契约：思源 setInlineMark 对 type:"a" 的跨块判定=range 首末容器的最近 data-node-id 块相同
// （toolbar/index.ts hasClosestBlock），故拆分粒度=最近块（段落级），非顶层块。
import type { TomatoAnnotation } from "./annotationsAttr";
import { ANNO_HREF_PREFIX } from "./annotationsAttr";

/** 块含无 sel 条目 ⇒ 是块级批注宿主，同步 .tomato-anno-block class（spec §6） */
export function hasBlockLevelEntry(entries: TomatoAnnotation[]): boolean {
    return entries.some((e) => e.sel == null);
}

/** 从 data-href 值剥批注 id；非本插件前缀返回 null（点击/hover 命中判定用） */
export function annoIdFromHref(href: string): string | null {
    return href.startsWith(ANNO_HREF_PREFIX) ? href.slice(ANNO_HREF_PREFIX.length) : null;
}

export interface BlockSubRange {
    /** 子 range 的最近 data-node-id 块（段落级） */
    block: HTMLElement;
    range: Range;
}

function closestBlock(node: Node): HTMLElement | null {
    let e: Element | null = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
    while (e) {
        if (e.hasAttribute("data-node-id")) return e as HTMLElement;
        e = e.parentElement;
    }
    return null;
}

/** 块的可编辑内容元素（镜像思源 getContenteditableElement 的本场景子集）。
 *  关键：NodeParagraph/Heading 的可编辑区=内层 firstElementChild，块尾 .protyle-attr（含 ZWSP）
 *  是其兄弟——以 editable 为基底 selectNodeContents 永远不会伸进 attr 区（P0-1 防线①）。
 *  嵌入/数学/HTML 块返回 null=跳过（只读，标记必败，防线②）；简化测试形态回退块自身。 */
function editableElementOf(block: HTMLElement): Element | null {
    const type = block.getAttribute("data-type") ?? "";
    if (type === "NodeBlockQueryEmbed" || type === "NodeMathBlock" || type === "NodeHTMLBlock") return null;
    if (type === "NodeParagraph" || type === "NodeHeading") {
        for (const child of block.children) {
            if (child.getAttribute("contenteditable") === "true") return child;
        }
        return block; // 简化测试形态（无内容包裹层）回退块自身
    }
    if (type === "NodeTable") return block.querySelector("table");
    if (type === "NodeCodeBlock") return block.querySelector(".hljs")?.lastElementChild ?? null;
    if (type === "NodeAttributeView") return block.querySelector(".av__title");
    const inner = block.querySelector("[data-node-id]");
    if (inner != null) return editableElementOf(inner as HTMLElement);
    return block.firstElementChild ?? block;
}

/** 把（可能跨块的）选区 range 按「最近 data-node-id 块」拆成块内子 range（镜像思源 getBlockRanges）。
 *  每个子 range 以块的可编辑内容为基底、首末块按原选区端点覆写（端点须落在可编辑区内，
 *  否则保持基底=全量——attr 区 ZWSP 端点被钳回，防线③）；去 ZWSP 后为空的子 range 丢弃（防线④）；
 *  嵌入块整体跳过。产出子 range 首末容器同块，可直接喂 setInlineMark('a')。 */
export function blockSubRanges(range: Range): BlockSubRange[] {
    const subs: BlockSubRange[] = [];
    const startBlock = closestBlock(range.startContainer);
    const endBlock = closestBlock(range.endContainer);
    const editor = startBlock?.closest(".protyle-wysiwyg");
    if (!startBlock || !endBlock || !editor) return subs;
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_ELEMENT);
    walker.currentNode = startBlock;
    let item: HTMLElement | null = startBlock;
    while (item) {
        // 嵌入块及其内部块一律跳过（只读区标记必败）
        if (item.getAttribute("data-type") !== "NodeBlockQueryEmbed"
            && !item.closest('[data-type="NodeBlockQueryEmbed"]')) {
            const editable = editableElementOf(item);
            if (editable != null && closestBlock(editable) === item) {
                const r = document.createRange();
                r.selectNodeContents(editable);
                if (item === startBlock && editable.contains(range.startContainer)) {
                    r.setStart(range.startContainer, range.startOffset);
                }
                if (item === endBlock && editable.contains(range.endContainer)) {
                    r.setEnd(range.endContainer, range.endOffset);
                }
                if (r.toString().replace(/\u200b/g, "") !== "") {
                    subs.push({ block: item, range: r });
                }
            }
        }
        if (item === endBlock) break;
        item = walker.nextNode() as HTMLElement | null;
    }
    return subs;
}

export interface PopPlacement {
    left: number;
    top: number;
    flip: boolean;
    arrowLeft: number;
}

const POP_GAP = 8;
const POP_VIEWPORT_MARGIN = 12;
/** spec §3.4：上方剩余空间 < 气泡高 + 16px 时翻下方 */
const POP_FLIP_EXTRA = 16;
const ARROW_SIZE = 8;

/** 气泡定位：默认挂点上方 8px，空间不足翻下方；水平以锚点中心对齐并钳制边界 12px 边距；
 *  箭头中心尽量指向锚点中心，钳制在气泡两缘 12px 内。
 *  vision P1-1：viewport.left = 钳制边界原点（调用侧传「视口 ∩ 锚点所在 protyle 容器」交集，
 *  气泡不越编辑区盖常驻面板/侧栏；缺省 0 = 整视口，与旧版语义一致） */
export function popPosition(
    anchor: { left: number; top: number; right: number; bottom: number },
    pop: { width: number; height: number },
    viewport: { left?: number; width: number; height: number },
): PopPlacement {
    const vl = viewport.left ?? 0;
    const anchorCenter = (anchor.left + anchor.right) / 2;
    const minLeft = vl + POP_VIEWPORT_MARGIN;
    const maxLeft = Math.max(minLeft, vl + viewport.width - POP_VIEWPORT_MARGIN - pop.width);
    const left = Math.min(Math.max(anchorCenter - pop.width / 2, minLeft), maxLeft);
    const flip = anchor.top < pop.height + POP_FLIP_EXTRA;
    const top = flip ? anchor.bottom + POP_GAP : anchor.top - pop.height - POP_GAP;
    const arrowMin = left + POP_VIEWPORT_MARGIN;
    const arrowMax = Math.max(arrowMin, left + pop.width - POP_VIEWPORT_MARGIN);
    const arrowCenter = Math.min(Math.max(anchorCenter, arrowMin), arrowMax);
    return { left, top, flip, arrowLeft: arrowCenter - left - ARROW_SIZE / 2 };
}
