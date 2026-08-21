// 引用文档创建（item2ref/createRefDoc）与拼音标注。从原 docUtils.ts 拆出（2026-08 重构），
// docUtils.ts 现为 re-export 桶。
import { IProtyle } from "siyuan";
import { siyuan, siyuanCache, cleanText, getContenteditableElement } from "./utils";
import { BLOCK_REF, DATA_ID, DATA_NODE_ID, DATA_SUBTYPE, DATA_TYPE } from "./gconst";
import { pinyin } from "pinyin-pro";
import { storeAttrManager, tag_to_ref_add_card, tag_to_ref_add_pinyin } from "./stores";
import { verifyKeyTomato } from "./user";

export async function createRefDoc(notebookId: string, name: string, category?: string) {
    const updateAttr = async (id: string) => {
        if (!id) return;
        const attr = {} as AttrType;
        if (category)
            attr["custom-category"] = category;
        if (await addPinYin(name, id, attr) || category) {
            await siyuan.setBlockAttrs(id, attr);
        }
    };

    const row = await siyuan.sqlOne(`select id from blocks where type='d' and content='${name}' limit 1`);
    if (row?.id) {
        await updateAttr(row.id);
        return row.id;
    }

    const { path } = await siyuan.getRefCreateSavePath(notebookId);
    const id = await siyuanCache.createDocWithMdIfNotExists(5000, notebookId, path + name, "");
    if (tag_to_ref_add_card.get()) {
        await siyuan.addRiffCards([id]);
    }
    setTimeout(() => updateAttr(id), 5000);
    return id;
}

async function addPinYin(name: string, docID: string, attr: AttrType) {
    if (await verifyKeyTomato() && tag_to_ref_add_pinyin.get() && name && docID) {
        const { short } = pinyinLongShort(name);
        if (short != name) {
            const store = storeAttrManager();
            await store.loadList(docID, "alias")
            attr["custom-pinyin"] = "";
            store.addListString(short);
            attr.alias = store.get().alias;
            return true;
        }
    }
}

export function pinyinLongShort(name: string) {
    let long = "";
    let short = "";
    if (name) {
        const pyLong = pinyin(name, { toneType: "none", type: "array" });
        long = pyLong.join("");
        short = pyLong.map(i => i.charAt(0)).join("");
    }
    return { short, long };
}

export function pinyinAll(name: string, sep = "/") {
    if (name) {
        const pyLong = pinyin(name, { toneType: "symbol", multiple: true, type: "all" });
        const pys = pyLong
            .filter(i => {
                i.origin = cleanText(i.origin) ?? "";
                i.origin = i.origin.trim();
                return i.origin.length > 0;
            })
            .map(i => {
                const pys = i.polyphonic.filter(j => j != i.pinyin)
                pys.splice(0, 0, i.pinyin)
                return { origin: i.origin, pys }
            })
            .filter(({ pys }) => pys.filter(i => !!i).length > 0);

        const space = "     ";
        const allPY = pys.map(({ origin, pys }) => {
            return `${origin}${pys.join(sep)}`
        }).join(space);
        const onePY = pys.map(({ origin, pys }) => {
            return `${origin}${pys[0]}`
        }).join(space);
        const pyOnly = pys.map(({ pys }) => {
            return pys[0]
        }).join(space);
        const originOnly = pys.map(({ origin }) => {
            return origin
        }).join(space);
        return { allPY, onePY, pyOnly, originOnly };
    }
    return {}
}

function mergeAdjacentTextNodes(parentElement: Element) {
    for (let i = 0; i < parentElement.childNodes.length; i++) {
        const currentNode = parentElement.childNodes[i];
        // Check if the current and next nodes are text nodes
        if (currentNode.nodeType === Node.TEXT_NODE && i + 1 < parentElement.childNodes.length) {
            const nextNode = parentElement.childNodes[i + 1];
            if (nextNode.nodeType === Node.TEXT_NODE) {
                // Merge the text content
                currentNode.textContent = currentNode.textContent + nextNode.textContent;
                // Remove the next text node
                parentElement.removeChild(nextNode);
                // Since we removed a node, we need to adjust the index to avoid skipping the next node in the loop
                i--;
            }
        }
    }
}

export async function item2ref(protyle: IProtyle, boxID: string, elements: HTMLElement[], rangeText: string, category?: string) {
    const docID = protyle?.block?.rootID;
    if (!docID) return;
    if (category && !rangeText) {
        return siyuan.setBlockAttrs(docID, { "custom-category": category });
    }
    if (!rangeText) rangeText = "";
    rangeText = rangeText.trim();
    const ops = [];
    for (const e of elements) {
        const id = e?.getAttribute(DATA_NODE_ID);
        const edit = getContenteditableElement(e);
        if (!id || !edit?.textContent) continue;
        mergeAdjacentTextNodes(edit)
        const nodes = [...edit.childNodes]; // avoiding dead looping
        let i = 0;
        for (const t of nodes) {
            if (t.nodeType != 3) continue;  // text node
            if (rangeText) {
                const parts = t.textContent.split(new RegExp(rangeText, "g"));
                for (let i = 0; i < parts.length; i++) {
                    if (i == parts.length - 1) {
                        t.parentElement.insertBefore(document.createTextNode(parts[i]), t);
                        break;
                    }

                    const span = document.createElement("span") as HTMLElement;
                    span.setAttribute(DATA_TYPE, BLOCK_REF);
                    span.setAttribute(DATA_SUBTYPE, "d");
                    const newDocID = await createRefDoc(boxID, rangeText, category);
                    span.setAttribute(DATA_ID, newDocID);
                    span.textContent = rangeText;
                    t.parentElement.insertBefore(document.createTextNode(parts[i]), t);
                    t.parentElement.insertBefore(span, t);
                }
                t.parentNode.removeChild(t);
            } else {
                const parts = t.textContent.split(/##/g, 2);
                let inserted = false;
                for (const item of parts[0].split(/[ 　]/g)) {
                    if (!item) continue;
                    const span = document.createElement("span") as HTMLElement;
                    span.setAttribute(DATA_TYPE, BLOCK_REF);
                    span.setAttribute(DATA_SUBTYPE, "d");
                    const newDocID = await createRefDoc(boxID, item, category);
                    span.setAttribute(DATA_ID, newDocID);
                    span.textContent = item;
                    if (i++ > 0) t.parentElement.insertBefore(document.createTextNode(" "), t);
                    t.parentElement.insertBefore(span, t);
                    inserted = true;
                }
                if (inserted) {
                    if (parts.length > 1) {
                        let txt = parts.slice(1).join("").trim();
                        if (txt) {
                            txt = "## " + txt;
                            t.parentElement.insertBefore(document.createTextNode(txt), t);
                        }
                    }
                    t.parentNode.removeChild(t);
                }
            }
        }
        ops.push(...siyuan.transUpdateBlocks([{ id, domStr: e.outerHTML }]));
    }
    protyle.getInstance().transaction(ops);
}

export function quotationMark(txt: string) {
    const buffer: string[] = [];
    let cOne = 0;
    let cTwo = 0;
    const one = () => {
        if (cOne++ % 2 === 0) return "‘";
        return "’";
    };
    const two = () => {
        if (cTwo++ % 2 === 0) return "“";
        return "”";
    };
    for (const c of txt) {
        if (c === "'") {
            buffer.push(one());
        } else if (c === '"') {
            buffer.push(two());
        } else {
            buffer.push(c);
        }
    }
    return buffer.join("");
}
