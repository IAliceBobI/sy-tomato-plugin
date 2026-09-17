// 块树读取与填充（getDocBlocks/fillChildren）、markdown 转 DOM、超级块追加。
// 从原 docUtils.ts 拆出（2026-08 重构），docUtils.ts 现为 re-export 桶。
import { siyuan, NewNodeID, getBlockDiv } from "./utils";
import { BlockTypeContainer, BlockTypeContent, DATA_NODE_ID, DATA_NODE_INDEX, DATA_SUBTYPE, DATA_TYPE } from "./gconst";
import { events } from "./Events";
import { domNewLine, DomSuperBlockBuilder } from "./sydom";
import { blockText, codeBlockText, tableCellText } from "./graphContent";

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
        "NodeAudio": "audio",
        // graphbox □1：custom 块（;;;插件/类型 围栏）有了类型码才能在数据层被
        // filterCustomRows 识别剔除（此前 type=undefined 落 noContentBlockLabel 渲染成全空卡）
        "NodeCustomBlock": "custom",
    };
    return nodeNameMapping[longName];
}

/** 无正文块的 label 提取（graphbox 三期 □2，2026-09-04）：块全集进图后节点可辨。
 *  通道按 getBlockDOM 实测形态（6808 探查）：
 *  - query_embed：顶层 data-content（SQL 原文；公式块 m 同款通道）
 *  - html：子元素 <protyle-html data-content>（顶层无此属性），剥标签留可读文字
 *  - iframe：内层 iframe[src]；widget：内层 iframe[data-src] 取 /widgets/<名> 的挂件名段
 *  - video/audio：内层媒体元素 src 取文件名（剥查询串）
 *  - av/tb 无可读文本，返回空——占位文案（i18n）归渲染层 GraphBox.rowLabel
 *  截断归 rowLabel 的 30 字裁剪，此处给全文（hover tooltip 同源）。 */
export function noContentBlockLabel(div: HTMLElement, type: string): string {
    switch (type) {
        case "query_embed":
            return div.getAttribute("data-content")?.trim() ?? "";
        case "html":
            return (div.querySelector("protyle-html")?.getAttribute("data-content") ?? "")
                .replace(/<[^>]*>/g, "").trim();
        case "iframe":
            return div.querySelector("iframe")?.getAttribute("src") ?? "";
        case "widget": {
            const el = div.querySelector("iframe");
            const src = el?.getAttribute("data-src") || el?.getAttribute("src") || "";
            return src.match(/\/widgets\/([^/?#]+)/)?.[1] ?? src;
        }
        case "video":
        case "audio": {
            const src = div.querySelector("video, audio")?.getAttribute("src") ?? "";
            return src.split(/[?#]/)[0].split("/").filter(Boolean).pop() ?? "";
        }
        default:
            return "";
    }
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
                } else if (child.type === 't') {
                    // graphbox □1：表格按单元格连接，防全单元格无缝粘连
                    child.content = tableCellText(e);
                } else if (child.type === 'c') {
                    // graphbox □1：语言行+代码正文换行分隔，防语言标记与代码粘连
                    child.content = codeBlockText(e);
                } else {
                    // graphbox □1：保留引用锚点文本（剥锚点会把引用段挖成空洞），
                    // 段内不可见字符全量剥除（行内 code 标记边界 ZWSP 家族）
                    child.content = blockText(e);
                }
                if (!emptyContent) {
                    if (!child.content) continue;
                }
            } else {
                // 无正文块 label（graphbox □2）：GraphBox 是唯一 setContent=true 调用方，
                // 其他调用方（CpBox 等走 setContent=false）不进此分支零影响
                child.content = noContentBlockLabel(e, child.type);
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
