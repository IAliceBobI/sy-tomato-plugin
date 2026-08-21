// 块树读取与填充（getDocBlocks/fillChildren）、markdown 转 DOM、超级块追加。
// 从原 docUtils.ts 拆出（2026-08 重构），docUtils.ts 现为 re-export 桶。
import { siyuan, NewNodeID, getBlockDiv, removeInvisibleChars } from "./utils";
import { BlockTypeContainer, BlockTypeContent, DATA_NODE_ID, DATA_NODE_INDEX, DATA_SUBTYPE, DATA_TYPE } from "./gconst";
import { events } from "./Events";
import { domNewLine, DomSuperBlockBuilder } from "./sydom";

export async function getTmpBlockID(text = "") {
    const box = events.boxID;
    const id = NewNodeID();
    await siyuan.appendDailyNoteBlock(box, `${text}\n{: id="${id}"}`);
    return id;
}

export async function md2divs(text: string) {
    const tmpID = await getTmpBlockID(`{{{row\n${text}\n}}}`);
    const { div } = await getBlockDiv(tmpID);
    const divs = [...(div.childNodes)]
        .filter((e: HTMLElement) => e.getAttribute && e.getAttribute(DATA_NODE_ID)) as HTMLElement[];
    await siyuan.deleteBlock(tmpID);
    return { divs, ids: divs.map(d => d.getAttribute(DATA_NODE_ID)) };
}

function getShortName(longName: string): string | undefined {
    const nodeNameMapping = {
        "NodeDocument": "d",
        "NodeHeading": "h",
        "NodeList": "l",
        "NodeListItem": "i",
        "NodeCodeBlock": "c",
        "NodeMathBlock": "m",
        "NodeTable": "t",
        "NodeBlockquote": "b",
        "NodeSuperBlock": "s",
        "NodeParagraph": "p",
        "NodeHTMLBlock": "html",
        "NodeBlockQueryEmbed": "query_embed",
        "NodeAttributeView": "av",
        "NodeKramdownBlockIAL": "ial",
        "NodeIFrame": "iframe",
        "NodeWidget": "widget",
        "NodeThematicBreak": "tb",
        "NodeVideo": "video",
        "NodeAudio": "audio"
    };
    return nodeNameMapping[longName];
}

/**
 * 获取元素内容，排除引用锚点文本
 * 引用元素的格式: <span data-type="block-ref" ...>anchor text</span>
 */
function getContentWithoutRefs(element: HTMLElement): string {
    // 克隆节点以避免修改原始DOM
    const clone = element.cloneNode(true) as HTMLElement;
    // 移除所有引用元素
    clone.querySelectorAll('[data-type="block-ref"]').forEach(ref => ref.remove());
    return clone.textContent || "";
}

export async function fillChildren(root: Block, div: HTMLElement, setContent: boolean, emptyContent: boolean, level: number, maxLevel: number) {
    if (level > maxLevel) return;
    if (!root.children) root.children = [];
    for (const _e of div.childNodes) {
        const e = _e as HTMLElement;
        if (!e.getAttribute) continue;
        const child: Block = {
            id: e.getAttribute(DATA_NODE_ID),
            type: getShortName(e.getAttribute(DATA_TYPE)),
        };
        if (!child.id) continue;
        child.div = e;
        if (setContent) {
            if (BlockTypeContent.includes(child.type)) {
                if (child.type === 'm') {
                    child.content = e.getAttribute('data-content').trim();
                } else {
                    // 排除引用锚点文本：只获取非引用元素的内容
                    child.content = removeInvisibleChars(getContentWithoutRefs(e), true)
                }
                if (!emptyContent) {
                    if (!child.content) continue;
                }
            }
        }
        child.subtype = e.getAttribute(DATA_SUBTYPE);
        if (child.type === 's') {
            child.subtype = e.getAttribute('data-sb-layout');
        }
        child.idx = parseInt(e.getAttribute(DATA_NODE_INDEX));
        child.docName = root.content;
        child.root_id = root.root_id;
        child.parent_id = root.id;
        child.parent = root;
        child.children = [];
        root.children.push(child);
        if (BlockTypeContainer.includes(child.type)) fillChildren(child, e, setContent, emptyContent, level + 1, maxLevel);
    }
    return { root, div }
}

export async function getDocBlocks(docID: string, docName = "", setContent = true, emptyContent = true, maxLevel = Number.MAX_SAFE_INTEGER) {
    const docBlock: Block = { id: docID, type: "d", docName, content: docName, subtype: "", root_id: docID, parent_id: docID };
    const { root, div } = await siyuan
        .getBlockDOM(docBlock.id)
        .then(({ dom }) => {
            const div = document.createElement('div')
            div.innerHTML = "<div>" + dom + "</div>";
            return fillChildren(docBlock, div.firstElementChild as HTMLElement, setContent, emptyContent, 1, maxLevel);
        });
    return { root, div };
}

export async function getTreeRows(docID: string) {
    const block = await siyuan.getRowByID(docID)
    if (!block?.path) return []
    const rows = await siyuan.sql(`select id,content from blocks where type='d' and path like "${block.path.slice(0, -3)}%"`)
    return rows ?? []
}

// export async function docSupers(docID: string, docName: string) {
//     const { root } = await getDocBlocks(docID, docName, false, true, 1);
//     return root.children
//         .filter(b => b.type == 's')
//         .toMapUniq(b => {
//             const t = getEntityTitle(b.div, false).join("~")
//             if (t) return [t, b]
//         })
// }

export async function appendSuperBlock(docID: string, selectedText?: string) {
    const superBlock = new DomSuperBlockBuilder();
    if (!selectedText) {
        selectedText = ""
    }
    const lastID = await siyuan.getDocLastID(docID);
    superBlock.append(domNewLine(selectedText))
    superBlock.setAttr("custom-block-editor", "1")
    await siyuan.insertBlockBefore(superBlock.build().outerHTML, lastID, "dom")
    return superBlock.id;
}
