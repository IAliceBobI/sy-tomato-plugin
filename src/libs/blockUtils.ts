// 块 DOM 操作：引用/链接注入、cleanDiv 克隆清洗、超级块取消等。
// 从原 utils.ts 拆出（2026-08 重构），utils.ts 现为 re-export 桶。
// 注意：与 siyuanApi.ts 存在循环 import（方法体内互调），与原 utils.ts 内部一致，CJS 打包安全。
import { IProtyle } from "siyuan";
import * as gconst from "./gconst";
import { domRef, DomSuperBlockBuilder } from "./sydom";
import { linkBoxUseLnkOrRef } from "./stores";
import { siyuan } from "./siyuanApi";
import { NewNodeID, NewLute } from "./globals";
import { cleanText, newIDRegexp, get_siyuan_lnk_md } from "./strUtils";
import { joinArray } from "./miscUtils";
import { getAttribute, dom2div, getContenteditableElement } from "./domUtils";

export async function removeRefs(domStr: string, refID: string, turn2href = true) {
    if (!domStr) return;
    const div = dom2div(domStr);
    const id = div.getAttribute(gconst.DATA_NODE_ID);
    let changed = false;
    div.querySelectorAll(
        `span[data-type="block-ref"][data-id="${refID}"]`,
    ).forEach((e) => {
        changed = true;
        if (turn2href) {
            e.removeAttribute(gconst.DATA_SUBTYPE);
            const id = e.getAttribute(gconst.DATA_ID);
            e.removeAttribute(gconst.DATA_ID);
            e.setAttribute(gconst.DATA_TYPE, "a");
            e.setAttribute("data-href", `siyuan://blocks/${id}`);
        } else {
            e.parentElement.removeChild(e);
        }
    });
    if (changed) await siyuan.updateBlocks([{ id, domStr: div.outerHTML }]);
}

export function getDoOperations(detail: WsMain) {
    if (detail.cmd !== "transactions") return [];
    const transactions: gconst.TransactionData[] = detail.data as any;
    if (!Array.isArray(transactions)) return [];
    return transactions.flatMap(i => {
        if (i.doOperations?.length > 0 && i.undoOperations?.length === i.doOperations?.length) {
            i.doOperations.forEach((d, idx, arr) => {
                if (d.action === "delete") {
                    arr[idx] = i.undoOperations[idx]
                    arr[idx].action = "delete"
                }
            })
        }
        return i.doOperations ?? [];
    });
}

export async function bilinkWithInsertingRefs(div1: HTMLElement, div2: HTMLElement, _protyle?: IProtyle) {
    const id1 = div1?.getAttribute(gconst.DATA_NODE_ID)
    const id2 = div2?.getAttribute(gconst.DATA_NODE_ID)
    if (!id2 || !id1) return;

    const task = async (div: HTMLElement) => {
        const id = div?.getAttribute(gconst.DATA_NODE_ID)
        const txt = cleanText(div.textContent);
        if (!txt) return;
        return siyuan.getDocRowByBlockID(id).then(row => {
            const sb = new DomSuperBlockBuilder();
            sb.append(dom2div(domRef("", id, div.textContent)))
            sb.setAttr("custom-tomato-reflink", row.content)
            return sb.build().outerHTML
        })
    }
    const [html1, html2] = await Promise.all([task(div1), task(div2)])
    const ops: IOperation[] = []
    if (html1) ops.push(...siyuan.transInsertBlocksAfter([html1], id2))
    if (html2) ops.push(...siyuan.transInsertBlocksAfter([html2], id1))
    await siyuan.transactions(ops);
}

export async function linkTwoElementsWithRef(div1: HTMLElement, div2: HTMLElement, protyle?: IProtyle) {
    return linkTwoElements(div1, div2, protyle, linkBoxUseLnkOrRef.get())
}

export async function linkTwoElements(div1: HTMLElement, div2: HTMLElement, protyle?: IProtyle, isLnk = false) {
    const id1 = div1?.getAttribute(gconst.DATA_NODE_ID)
    const id2 = div2?.getAttribute(gconst.DATA_NODE_ID)
    if (!id2 || !id1) return;
    const dev2Text = cleanText(div2.textContent)?.trim() ?? "";
    if (dev2Text) {
        const oldDiv1HTML = div1.outerHTML;
        if (isLnk) {
            add_href(div1, id2, " * ");
        } else {
            add_ref(div1, id2, " * ");
        }
        if (protyle) {
            protyle.getInstance().updateTransaction(id1, div1.outerHTML, oldDiv1HTML);
        } else {
            await siyuan.updateBlocks([{ id: id1, domStr: div1.outerHTML }])
        }
    } else {
        const divRefTxt = div1.textContent.replaceAll("'", "").replaceAll('"', '').replace("\n", "");
        const oldDiv2HTML = div2.outerHTML;
        if (isLnk) {
            add_href(div2, id1, divRefTxt, false);
        } else {
            add_ref(div2, id1, divRefTxt, false);
        }
        if (protyle) {
            protyle.getInstance().updateTransaction(id2, div2.outerHTML, oldDiv2HTML);
        } else {
            await siyuan.updateBlocks([{ id: id2, domStr: div2.outerHTML }])
        }
    }
}

export function extractLinksFromElement(div: HTMLElement) {
    const ids: Set<string> = new Set();
    for (const e of div.querySelectorAll(`[${gconst.DATA_TYPE}~="${gconst.BLOCK_REF}"]`)) {
        const id = e.getAttribute(gconst.DATA_ID);
        ids.add(id);
    }
    return [...ids.values()];
}

export async function clean_broken_href(e: HTMLElement) {
    const RefRegex = newIDRegexp();
    for (const ele of [...e.querySelectorAll("span[data-href]")]) {
        const href = ele.getAttribute("data-href")
        if (href) {
            for (const m of href.matchAll(RefRegex)) {
                const id = m[0];
                if (id) {
                    if (! await siyuan.checkBlockExist(id)) {
                        ele.parentElement.removeChild(ele);
                    }
                }
            }
        }
    }
}

export function clean_href(e: HTMLElement, id: string) {
    e.querySelectorAll("span[data-href]").forEach(e => {
        if (e.getAttribute("data-href")?.includes(id)) {
            e.parentElement.removeChild(e)
        }
    })
}

export function add_href(e: HTMLElement, id: string, txt: string, atEnd = true) {
    const edit = getContenteditableElement(e);
    if (edit) {
        const span = document.createElement("span") as HTMLElement;
        if (atEnd) {
            edit.appendChild(span)
        } else {
            if (edit.firstChild) {
                edit.insertBefore(span, edit.firstChild)
            } else {
                edit.appendChild(span)
            }
        }
        set_href(span, id, txt);
    }
}

export function prepend_refs(e: HTMLElement, spans: HTMLElement[], newline = false) {
    if (!(spans?.length > 0)) return;
    const edit = getContenteditableElement(e);
    if (!edit) return;
    if (!edit.firstChild) edit.appendChild(document.createTextNode(""))
    spans = joinArray<HTMLElement>(spans, () => document.createTextNode(gconst.SPACE) as any);
    if (newline) {
        spans.push(document.createTextNode("\n") as any)
    } else {
        spans.push(document.createTextNode(gconst.SPACE) as any)
    }
    spans.reverse().forEach(s => {
        edit.insertBefore(s, edit.firstChild)
    })
}

export function add_ref(e: HTMLElement, id: string, txt: string, staticLnk = true, atEnd = true) {
    const edit = getContenteditableElement(e);
    if (edit) {
        const span = document.createElement("span") as HTMLElement;
        if (atEnd) {
            edit.appendChild(document.createTextNode(" "))
            edit.appendChild(span)
        } else {
            const f = edit.firstChild;
            if (f) {
                edit.insertBefore(span, f)
                edit.insertBefore(document.createTextNode(" "), f)
            } else {
                edit.appendChild(span)
                edit.appendChild(document.createTextNode(" "))
            }
        }
        set_ref(span, id, txt, staticLnk);
    }
}

export function set_ref(e: HTMLElement, id: string, txt?: string, staticLnk = true) {
    e.setAttribute(gconst.DATA_TYPE, gconst.BLOCK_REF);
    e.setAttribute(gconst.DATA_SUBTYPE, staticLnk ? "s" : "d");
    e.setAttribute(gconst.DATA_ID, id);
    if (txt) e.textContent = txt;
}

export function set_href(e: HTMLElement, id: string, txt?: string) {
    e.setAttribute(gconst.DATA_TYPE, "a");
    id = id.split("?")[0];
    e.setAttribute(gconst.BlockNodeEnum.DATA_HREF, `siyuan://blocks/${id}?focus=1`);
    if (txt) e.textContent = txt;
}

export function cloneCleanDiv(div: HTMLElement, useIDMap = false) {
    return cleanDivOnly(div?.cloneNode(true) as any, useIDMap);
}

/**
 * 克隆同步块，保留子元素的原始 ID
 * 用于同步块更新，避免破坏嵌套块（如 tip 块）的内部结构
 */
export function cloneForSync(div: HTMLElement, targetID: string): HTMLElement {
    if (!div) return null;
    const clone = div.cloneNode(true) as HTMLElement;

    // 移除选中样式
    clone.classList.remove("protyle-wysiwyg--select");

    // 设置 contenteditable 为 true
    clone.querySelectorAll(`div[${gconst.CONTENT_EDITABLE}="false"]`)
        .forEach(e => e.setAttribute(gconst.CONTENT_EDITABLE, "true"));

    // 只更新超级块的 ID 为目标 ID，保留所有子元素的原始 ID
    clone.setAttribute(gconst.DATA_NODE_ID, targetID);

    // 移除 riff 标记
    clone.removeAttribute(gconst.CUSTOM_RIFF_DECKS);
    clone.querySelectorAll(`[${gconst.CUSTOM_RIFF_DECKS}]`)
        .forEach((e: HTMLElement) => e.removeAttribute(gconst.CUSTOM_RIFF_DECKS));

    return clone;
}

// ---- 同步块子块 ID 重映射（设计 §8.2，阶段 2 实验开关 linkBoxSyncRemapChildID） ----
// 现状 cloneForSync 把源副本子块 data-node-id 原样写入所有副本 → 同 ID 多文档并存，
// 子块级索引/搜索/反链只命中「当前副本」、删当前副本会让幸存副本索引全灭（§8.1 三宗罪）。
// 重映射让每个副本的子块永远持自己的 ID：item-id 匹配保目标 ID、位置启发式做一次性迁移、
// 其余换新 ID。IO（getBlockDOM 拉目标 DOM）在调用方 syncAllBlocks，这里全部是纯函数。

// 目标侧子块索引：byItemID 是稳态主表（item-id → 目标现有 data-node-id），
// blocks 是目标全部后代块的文档序序列，供无 item-id 子块的位置迁移启发式对位。
export interface SyncChildIDIndex {
    byItemID: Map<string, string>;
    blocks: { nodeID: string; itemID: string; dataType: string }[];
}

export function buildSyncChildIDIndex(targetDiv: HTMLElement): SyncChildIDIndex {
    const byItemID = new Map<string, string>();
    const blocks = [...(targetDiv?.querySelectorAll(`div[${gconst.DATA_NODE_ID}]`) ?? [])]
        .map((e: HTMLElement) => {
            const nodeID = getAttribute(e, gconst.DATA_NODE_ID);
            const itemID = getAttribute(e, "custom-sync-item-id");
            if (itemID) byItemID.set(itemID, nodeID);
            return { nodeID, itemID, dataType: getAttribute(e, gconst.DATA_TYPE) };
        });
    return { byItemID, blocks };
}

export function remapChildIDs(clone: HTMLElement, index: SyncChildIDIndex): void {
    if (!clone) return;
    // 本次已写出的目标 ID：同 ID 双写正是要消灭的病灶（脏数据双 item-id 也要拦住），绝不重犯
    const claimed = new Set<string>();
    ([...clone.querySelectorAll(`div[${gconst.DATA_NODE_ID}]`)] as HTMLElement[]).forEach((e, i) => {
        let id = "";
        const itemID = getAttribute(e, "custom-sync-item-id");
        if (itemID) {
            const mapped = index.byItemID.get(itemID);
            // a. item-id 命中 → 复用目标现有 ID，目标侧索引/外部引用保持稳定
            if (mapped && !claimed.has(mapped)) id = mapped;
        }
        if (!id) {
            // b. 一次性迁移启发式（§8.3 首开迁移）：目标同位置块无 item-id（遗留组）、同 data-type
            //    且未被占用 → 保住目标 ID。目标块有 item-id 时绝不按位置抢——新增子块插中间会
            //    偷走别人的稳定 ID 造成同事务双写（单测「③ 新增子块」锁死）。
            const t = index.blocks[i];
            if (t && !t.itemID && !claimed.has(t.nodeID)
                && t.dataType === getAttribute(e, gconst.DATA_TYPE)) id = t.nodeID;
        }
        if (!id) id = NewNodeID(); // c. 新增/对不上号的子块 → 全新 ID
        claimed.add(id);
        e.setAttribute(gconst.DATA_NODE_ID, id);
    });
}

/**
 * 同步传播克隆制备：cloneForSync 之后按需做子块 ID 重映射（设计 §8.2）。
 * targetDOM 是目标块当前的 getBlockDOM 产物，仅当 linkBoxSyncRemapChildID 开启时由调用方传入；
 * 缺省（开关关/拿不到目标 DOM）时克隆与 cloneForSync 现状逐字节一致（单测④锁定零改动）。
 */
export function prepareSyncClone(superDiv: HTMLElement, targetID: string, targetDOM?: string): HTMLElement {
    const clone = cloneForSync(superDiv, targetID);
    if (targetDOM != undefined) {
        remapChildIDs(clone, buildSyncChildIDIndex(dom2div(targetDOM)));
    }
    return clone;
}

export function cleanDivOnly(div: HTMLElement, useIDMap = false) {
    if (!div) return {};
    div.classList.remove("protyle-wysiwyg--select")
    div.querySelectorAll(`[${gconst.CONTENT_EDITABLE}="false"]`).forEach(e => e.setAttribute(gconst.CONTENT_EDITABLE, "true"));

    let new2old: Map<string, string>;
    if (useIDMap) new2old = new Map();

    // new ids
    const id = div.getAttribute(gconst.DATA_NODE_ID);
    const newID = NewNodeID();
    {
        div.setAttribute(gconst.DATA_NODE_ID, newID);
        new2old?.set(newID, id)
    }

    div.querySelectorAll(`[${gconst.DATA_NODE_ID}]`).forEach((e: HTMLElement) => {
        const id = e.getAttribute(gconst.DATA_NODE_ID);
        const newID = NewNodeID();
        e.setAttribute(gconst.DATA_NODE_ID, newID);
        new2old?.set(newID, id)
    });

    // rm riff marks
    div.removeAttribute(gconst.CUSTOM_RIFF_DECKS);
    div.querySelectorAll(`[${gconst.CUSTOM_RIFF_DECKS}]`).forEach((e: HTMLElement) => {
        e.removeAttribute(gconst.CUSTOM_RIFF_DECKS);
    });
    return { id, div, newID, new2old };
}

function cleanDiv_AddSpan(div: HTMLElement, isLnk: boolean, id: string, anchor: string) {
    const isTab = div.getAttribute(gconst.DATA_TYPE) === gconst.BlockNodeEnum.NODE_TABLE;
    let target: HTMLElement;
    if (isTab) {
        anchor = anchor.trim();
        target = div.querySelector("table > thead > tr > th:nth-child(1)")
    } else {
        target = div.querySelector("[contenteditable=\"true\"]")
    }
    const span = target?.appendChild(document.createElement("span"));
    if (span) {
        if (isLnk) set_href(span, id, anchor);
        else set_ref(span, id, anchor);
        return true;
    }
}

function cleanDiv_GetAll(div: HTMLElement, id: string) {
    return [
        ...div.querySelectorAll(`[${gconst.DATA_ID}="${id}"]`),
        ...div.querySelectorAll(`[${gconst.BlockNodeEnum.DATA_HREF}="siyuan://blocks/${id}?focus=1"]`),
    ];
}

export async function getContextPath(id: string) {
    const parts = await siyuan.getBlockBreadcrumb(id).then(pathes => {
        if (!pathes) {
            return [];
        }
        pathes = pathes.filter(i => !!i.name && i.type !== gconst.BlockNodeEnum.NODE_PARAGRAPH);
        if (pathes.length == 1) {
            return pathes;
        }
        const bk = pathes.slice();
        const last1 = pathes[pathes.length - 1]
        if (last1?.type == null) return [];
        if (last1.type == gconst.BlockNodeEnum.NODE_LIST_ITEM) {
            pathes.pop()
        }
        // const last2 = pathes[pathes.length - 2]
        // if (last1.type == gconst.BlockNodeEnum.NODE_PARAGRAPH) {
        //       pathes.pop()
        //       if (last2.name.includes(last1.name) && last2.type !== gconst.BlockNodeEnum.NODE_HEADING) {
        //           pathes.pop()
        //       }
        // }
        if (pathes.length > 0)
            return pathes;
        else
            return bk;
    });
    if (parts.length > 0) {
        parts[0].name = parts[0].name.split("/").pop();
    }
    const getPathMd = () => {
        return parts
            .map(i => get_siyuan_lnk_md(i.id, i.name))
            .map(i => `[${i}]`)
            .join(" > ")
    }
    const getPathStr = () => {
        if (parts.length > 0) {
            return parts.map(i => i.name).map(i => `[${i}]`).join(" > ");
        }
        return id;
    }
    return { parts, getPathStr, getPathMd }
};

export async function cleanDiv(div: HTMLElement, setRef: boolean, setOrigin: boolean, moreLnks: boolean, context: boolean, isLnk: boolean) {
    let onlyOne = !moreLnks;
    const ret = cleanDivOnly(div);
    div = ret.div;
    const id = ret.id;

    let originExsists = false;
    let setTheRef = false;
    let setPath = false;
    {
        const originID = div.getAttribute(gconst.RefIDKey) ?? "";
        if (originID) {
            if (setOrigin && div.getAttribute(gconst.DATA_TYPE) != gconst.BlockNodeEnum.NODE_CODE_BLOCK) {
                const all = cleanDiv_GetAll(div, originID);
                if (all.length == 0) {
                    if (cleanDiv_AddSpan(div, isLnk, originID, "  @  ")) {
                        setTheRef = true;
                        originExsists = true;
                    }
                } else {
                    all.forEach((e: HTMLElement) => {
                        if (e.innerText.trim() == "*") {
                            const id = e.getAttribute(gconst.DATA_ID);
                            if (id) {
                                if (isLnk) set_href(e, id, "  @  ");
                                else set_ref(e, id, "  @  ");
                            } else {
                                e.textContent = "  @  ";
                            }
                            setTheRef = true;
                            originExsists = true;
                        }
                    });
                }
            }
            if (context) {
                const path = (await getContextPath(originID)).getPathStr();
                if (path) {
                    div.setAttribute(gconst.ORIGIN_HPATH, path);
                    setPath = true;
                }
            }
        }
    }
    {
        if (originExsists && onlyOne) setRef = false;
        if (setRef && div.getAttribute(gconst.DATA_TYPE) != gconst.BlockNodeEnum.NODE_CODE_BLOCK) {
            if (cleanDiv_GetAll(div, id).length == 0) {
                if (cleanDiv_AddSpan(div, isLnk, id, "  *  ")) {
                    setTheRef = true;
                }
            } else {
                setTheRef = true;
            }
        }
        if (context) {
            const path = (await getContextPath(id)).getPathStr();
            if (path) {
                div.setAttribute(gconst.REF_HPATH, path);
                setPath = true;
            }
        }
    }
    return { id, div, setTheRef, setPath };
}

export async function getBlockDiv(id: string) {
    const ret = await siyuan.getBlockDOM(id);
    if (!ret) return {};
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = ret.dom;
    tempDiv = tempDiv.firstElementChild as HTMLDivElement;
    return { div: tempDiv, id };
}

export async function addLineThrough(protyle: IProtyle, attr: keyof AttrType, selected: HTMLElement[]) {
    if (selected.length == 0) return;

    const map = selected.map(e => {
        if (e.getAttribute("data-type") === "NodeParagraph") return [e];
        return [...e.querySelectorAll('[data-type="NodeParagraph"]')];
    }).flat().reduce((m, e) => {
        const id = e.getAttribute(gconst.DATA_NODE_ID);
        m.set(id, e as any);
        return m;
    }, new Map<string, HTMLElement>());
    selected = [...map.values()] as HTMLElement[];

    const attrsOld = await siyuan.getBlockAttrs(selected[0].getAttribute(gconst.DATA_NODE_ID));
    const attrs: AttrType = {} as any;
    let rm = true;
    if (attrsOld[attr]) {
        attrs[attr] = "" as never;
    } else {
        attrs[attr] = "1" as never;
        rm = false;
    }

    selected.forEach(element => {
        if (rm) {
            element.removeAttribute(attr);
        } else {
            element.setAttribute(attr, "1");
        }
    });

    const ops = siyuan.transbatchSetBlockAttrs([...map.keys()].map((id) => {
        return { id, attrs };
    }));
    protyle.getInstance().transaction(ops as any);
}

export function blockDOM2StdMd(...divs: Element[]) {
    divs = divs.map(d => d.cloneNode(true)) as any;
    makeAllRefsText(divs);
    const lute = NewLute();
    return divs.map(o => lute.BlockDOM2StdMd(o.outerHTML)).join("\n\n");
}

function makeAllRefsText(div: Element[]) {
    return getAllRef(div).forEach(e => e.outerHTML = e.textContent)
}

function getAllRef(div: Element[]) {
    return div.map(i => i.querySelectorAll(`span[data-type="block-ref"]`).values().toArray()).flat()
}

export async function cancelSuperBlock(targetID: string) {
    if (!targetID) return;
    const { dom } = await siyuan.getBlockDOM(targetID);
    if (!dom) return;
    const div = dom2div(dom);
    if (!div) return;
    const doms = [...div.children]
        .filter(e => getAttribute(e, "data-node-id"))
        .map(e => cloneCleanDiv(e as any).div.outerHTML);
    const ops = siyuan.transInsertBlocksAfter(doms, targetID);
    ops.push(...siyuan.transDeleteBlocks([targetID]));
    await siyuan.transactions(ops);
}
