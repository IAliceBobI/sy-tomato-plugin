import { IProtyleOptions, Lute, Plugin, Protyle } from "siyuan";
import { BLOCK_REF, BlockNodeEnum, DATA_ID, DATA_NODE_ID, DATA_SUBTYPE, DATA_TYPE, IN_BOOK_INDEX, SPACE, STATICLINK, TOMATO_BK_IGNORE, TOMATO_BK_STATIC, UPDATED } from "./gconst";
import { NewLute, cleanDivOnly, dom2div, getAttribute, getID, isValidNumber, set_href, siyuan } from "./utils";
import { tomatoI18n } from "../tomatoI18n";
import { back_link_passup_heading, back_link_passup_quote, back_link_passup_super, storeAttrManager } from "./stores";
import { SortType } from "./types";
import { applyDocResponse, applyListResponse, BkListState, knownDocRevision, knownListRevision, makeBkQueryKey, pruneBkDocs, resetBkStateIfQueryChanged } from "./bkRevision";
import { newID } from "stonev5-utils";

// export async function shouldInsertDiv(lastID: string, docID: string) {
//     const allIDs = await siyuan.getTailChildBlocks(docID, 5);
//     if (isIterable(allIDs)) {
//         for (const { id } of allIDs) {
//             if (id === lastID) {
//                 return true;
//             }
//         }
//     }
//     return false;
// }

export function getLastElementID(item: HTMLElement) {
    return item?.lastElementChild?.getAttribute(DATA_NODE_ID) ?? "";
}

export async function cleanBackLinks(docID: string) {
    const rows = await siyuan.getDocAttrs(docID, TOMATO_BK_STATIC);
    const bk = (await Promise.all(rows.map(r => siyuan.getRowByID(r.block_id))))
        .filter(b => b.subtype == "h1");
    for (const i of bk) {
        const { doOperations } = await siyuan.getHeadingDeleteTransaction(i.id);
        await siyuan.transactions(doOperations);
    }
}

function getInBookIdx(div: HTMLElement) {
    if (!div) return;
    let abIdx = div.getAttribute(IN_BOOK_INDEX);
    if (!abIdx) abIdx = div.querySelector(`[${IN_BOOK_INDEX}]`)?.getAttribute(IN_BOOK_INDEX);
    const parts = abIdx?.split("#");
    if (parts?.length >= 1) {
        const [a, b] = parts;
        let na = Number(a);
        let nb = Number(b);
        if (!isValidNumber(na)) na = 0;
        if (!isValidNumber(nb)) nb = 0;
        return [na, nb];
    }
}

export const sortDiv = (a: BacklinkSv, b: BacklinkSv) => {
    if (a.isMention != b.isMention) {
        if (a.isMention === true) return 1; // a > b
        if (b.isMention === true) return -1; // a < b
    }
    if (a.atBottom != b.atBottom) {
        if (a.atBottom === true) return 1; // a > b
        if (b.atBottom === true) return -1;  // a < b
    }
    const abIdx = getInBookIdx(a.bkDiv);
    const bbIdx = getInBookIdx(b.bkDiv);
    if (abIdx && bbIdx) {
        const [ai1, ai2] = abIdx;
        const [bi1, bi2] = bbIdx;
        if (ai1 == bi1) {
            return ai2 - bi2;
        } else {
            return ai1 - bi1;
        }
    }
    return 0;
};

export async function insertBackLinks(docID: string) {
    const lute: Lute = NewLute();
    const allRefs: RefCollector = new Map();
    const backlink2 = await siyuan.getBacklink2(docID);
    let md = [`# ${tomatoI18n.静态反链}\n{: ${TOMATO_BK_STATIC}="1" }`];
    if (!backlink2) return;

    const links = (await Promise.all(backlink2.backlinks.map(backlink => {
        return siyuan.getBacklinkDoc(docID, backlink.id);
    })))
        .map((i) => i.backlinks)
        .flat()
        .filter((bk) => !!bk);

    const backLinks = links.map((bk) => {
        const bkDiv = dom2div(bk.dom);
        return { bk, bkDiv } as BacklinkSv;
    });
    await Promise.all(backLinks.map((backLink) => path2div(backLink, docID, allRefs)));
    await Promise.all(backLinks.map((backLink) => scanAllRef(backLink, backLink.bkDiv, docID, allRefs)));

    const lnkLine = [...allRefs.values()].reduce((md, i) => {
        md.push(`[[[${i.text}]]](siyuan://blocks/${i.id}?focus=1)<sup>${i.count}</sup>`);
        return md;
    }, []).join(SPACE.repeat(2));
    if (lnkLine) md.push(lnkLine + `\n{: ${STATICLINK}="1" }`);

    backLinks.sort(sortDiv);
    md = backLinks.reduce((list, { bk }) => {
        if (pushPath(bk, list, docID)) {
            pushDom(bk, lute, list);
        }
        return list;
    }, md);

    const content = md.join("\n");
    await siyuan.appendBlock(content, docID);
}

function pushDom(bk: Backlink, lute: Lute, list: string[]) {
    const div = document.createElement("div") as HTMLElement;
    div.innerHTML = bk.dom;
    cleanDivOnly(div.firstElementChild as any);
    div.querySelectorAll(`[${DATA_SUBTYPE}="h1"]`).forEach((e: HTMLElement) => {
        e.setAttribute(DATA_SUBTYPE, "h2");
    });
    div.querySelectorAll(`[${DATA_TYPE}~="${BLOCK_REF}"]`).forEach((e: HTMLElement) => {
        const id = e.getAttribute(DATA_ID);
        set_href(e, id);
    });
    const md = lute.BlockDOM2Md(div.innerHTML);
    list.push(md);
}

function pushPath(bk: Backlink, list: string[], docID: string) {
    const file = bk.blockPaths[0];
    const target = bk.blockPaths[bk.blockPaths.length - 1];
    if (docID == file?.id) return false;
    file.name = file.name?.split("/")?.pop() ?? "";
    bk.blockPaths[0] = file;
    target.name = "[@]";
    bk.blockPaths[bk.blockPaths.length - 1] = target;
    const path = bk.blockPaths.map(p => `[${p.name}](siyuan://blocks/${p.id})`);
    list.push(`📃${path.join("---")}\n{: ${STATICLINK}="1" }`);
    return true;
}

export async function path2div(backlinkSv: BacklinkSv, docID: string, allRefs: RefCollector) {
    for (const blockPath of backlinkSv.bk.blockPaths.slice(0, -1)) {
        if (blockPath.type == BlockNodeEnum.NODE_DOCUMENT) {
            const fileName = blockPath.name.split("/").pop();
            await addRef(backlinkSv, fileName, blockPath.id, docID, allRefs);
            if (backlinkSv.attrs) backlinkSv.attrs.isThisDoc = blockPath.id == docID;
        } else if (blockPath.type == BlockNodeEnum.NODE_HEADING) {
            await addRef(backlinkSv, blockPath.name, blockPath.id, docID, allRefs);
        } else {
            const { dom } = await siyuan.getBlockDOM(blockPath.id);
            await scanAllRef(backlinkSv, dom2div(dom), docID, allRefs);
        }
    }
}

export async function scanAllRef(backlinkSv: BacklinkSv, div: HTMLElement, docID: string, allRefs: RefCollector) {
    for (const element of div.querySelectorAll(
        `[${DATA_TYPE}~="${BLOCK_REF}"]`,
    )) {
        const id = element.getAttribute(DATA_ID);
        const txt = element.textContent;
        if (txt && txt.length > 1) {
            await addRef(backlinkSv, txt, id, docID, allRefs, getID(element));
        }
    }
}

/** 概念 chip 可见性唯一判定源（□2）：hideThis=「暂时隐藏本文档链接」即时 UI 开关不进数据层。
 *  计数与 chips 渲染必须同用本函数，否则数画分裂。
 *  日期口径（□6 锚点收紧）：名字的**末段**就是日期（可带路径前缀/c 前缀/@第N周-星期X 后缀）
 *  才算日记文档名不当概念——「2026-01-01 发布计划」类正常概念名不再误拦。 */
export function conceptChipVisible(concept: Pick<LinkItem, "text" | "attrs">, hideThis: boolean): boolean {
    if (/(^|\/)c?\d{4}-\d{2}-\d{2}(@第\d+周-星期.{1})?$/.test(concept.text)) return false;
    return !(hideThis && concept.attrs.isThisDoc);
}

export async function addRef(backlinkSv: BacklinkSv, txt: string, id: string, docID: string, allRefs: RefCollector, dataNodeID?: string) {
    if (txt.trim() == "*") return;

    if (!dataNodeID) dataNodeID = id;
    const key = id + txt;
    const value: LinkItem = allRefs.get(key) ?? { count: 0, dataNodeIDSet: new Set(), blockIDs: new Set(), attrs: {} } as LinkItem;
    if (backlinkSv) value.blockIDs.add(backlinkSv.blockID)

    if (!value.dataNodeIDSet.has(dataNodeID)) {
        value.count += 1;
        value.dataNodeIDSet.add(dataNodeID);
        value.id = id;
        value.text = txt;
        value.attrs = {
            isThisDoc:
                id == docID ||
                (await getRootID(dataNodeID)) == docID,
        };
        allRefs.set(key, value);
    }
}

async function getRootID(dataNodeID: string) {
    const row = await siyuan.sqlOne(`select root_id from blocks where id="${dataNodeID}" limit 1`);
    return row?.root_id ?? "";
}

export async function disableBK(docID: string) {
    await siyuan.setBlockAttrs(docID, { "custom-off-tomatobacklink": "1" } as AttrType);
    await siyuan.pushMsg(tomatoI18n.禁用底部反链);
}

export async function enableBK(docID: string) {
    await siyuan.setBlockAttrs(docID, { "custom-off-tomatobacklink": "2" } as AttrType);
    await siyuan.pushMsg(tomatoI18n.启用底部反链);
}

export function delGutter(e: HTMLElement) {
    e?.querySelectorAll(".protyle-gutters")?.forEach((e) => {
        e.innerHTML = "";
    });
}

// =======================

refPassUp;
async function refPassUp(bks: BacklinkSv[]) {
    if (back_link_passup_heading.get()
        || back_link_passup_quote.get()
        || back_link_passup_super.get()
    ) {
        const ids = bks
            .filter(b => {
                const t = getAttribute(b.bkDiv, "data-type");
                return t == BlockNodeEnum.NODE_PARAGRAPH // listItem 不能传递到 list, listItem 为向下传递。
            })
            .map(b => getAttribute(b.bkDiv, "data-node-id"));
        const children = await siyuan.sql(`
            select a.id as parent_id, a.type as parent_type, b.id
            FROM blocks AS a 
            INNER JOIN 
            (select id,parent_id from blocks where parent_id!=root_id and id in (${ids.map(i => `"${i}"`).join(",")})) AS b
            on b.parent_id = a.id
        `);
        bks.forEach(bk => {
            const c = children.find(c => c.id == bk.blockID);
            if (!c) return;
            bk.parentType = c.parent_type;
            if (back_link_passup_heading.get() && c.parent_type === "h") {
                bk.parentID = c.parent_id;
            }
            if (back_link_passup_quote.get() && c.parent_type === "b") {
                bk.parentID = c.parent_id;
            }
            if (back_link_passup_super.get() && c.parent_type === "s") {
                bk.parentID = c.parent_id;
            }
        });
    }
    return bks;
}

export async function doGetBackLinks(
    docID: string,
    globalSearchText = "",
    sortBy = "",
    refDocCount = Number.MAX_SAFE_INTEGER,
    menDocCount = Number.MAX_SAFE_INTEGER,
    idsFilter: ReturnType<typeof storeAttrManager> = null,
    page = 0,
    bkState: BkListState = null,
) {
    // □3 knownRevision：queryKey 含 keyword/排序/分页（翻页必全量）；未变携带上轮 revision，
    // 列表级 unchanged → 文档级请求与本地重组全部跳过（近零开销轮询）
    if (bkState) {
        resetBkStateIfQueryChanged(bkState, makeBkQueryKey(globalSearchText, globalSearchText, sortBy, page, refDocCount, menDocCount));
    }
    const listResp = await siyuan.getBacklink2(docID, globalSearchText, globalSearchText, sortBy, sortBy, bkState ? knownListRevision(bkState) : "");
    if (bkState && applyListResponse(bkState, listResp)) {
        return { unchanged: true } as any;
    }
    const allRefs: RefCollector = new Map();
    const { backLinks, bkDocs } = await Promise.resolve(listResp)
        .then(async bkDocs => {
            if (!bkDocs) return { bks: [], bkDocs };
            // 文档级缓存 key 加 bk:/me: 前缀：同一来源文档的引用与提及是两个 API、两个 revision 域
            const bkTask = bkDocs.backlinks.slice(page * refDocCount, (page + 1) * refDocCount)
                .map(async bkDoc => {
                    const key = "bk:" + bkDoc.id;
                    const resp = await siyuan.getBacklinkDoc(docID, bkDoc.id, globalSearchText, bkState ? knownDocRevision(bkState, key) : "");
                    const { items, keywords } = bkState
                        ? applyDocResponse(bkState, key, { unchanged: resp?.unchanged, revision: resp?.revision, items: resp?.backlinks ?? [], keywords: resp?.keywords })
                        : { items: resp?.backlinks ?? [], keywords: resp?.keywords ?? [] };
                    return items.map(bkItem => {
                        return { isMention: false, bkDoc, bkItem, keywords }
                    });
                });
            const meTask = bkDocs.backmentions.slice(page * menDocCount, (page + 1) * menDocCount)
                .map(async bkDoc => {
                    const key = "me:" + bkDoc.id;
                    const resp = await siyuan.getBackmentionDoc(docID, bkDoc.id, globalSearchText, bkState ? knownDocRevision(bkState, key) : "");
                    const { items, keywords } = bkState
                        ? applyDocResponse(bkState, key, { unchanged: resp?.unchanged, revision: resp?.revision, items: resp?.backmentions ?? [], keywords: resp?.keywords })
                        : { items: resp?.backmentions ?? [], keywords: resp?.keywords ?? [] };
                    return items.map(bkItem => {
                        return { isMention: true, bkDoc, bkItem, keywords }
                    })
                });
            const bk = Promise.all(bkTask).then(i => i.flat());
            const me = Promise.all(meTask).then(i => i.flat());
            if (bkState) {
                pruneBkDocs(bkState, [
                    ...bkDocs.backlinks.map(d => "bk:" + d.id),
                    ...bkDocs.backmentions.map(d => "me:" + d.id),
                ]);
            }
            return { bks: [...(await bk), ...(await me)], bkDocs };
        })
        .then(async t => {
            const bks = t.bks
                .filter(i => i.bkItem?.dom != null)
                .map(({ isMention, bkItem, bkDoc, keywords }) => {
                    const bkDiv = dom2div(bkItem.dom);
                    const dataType = bkDiv.getAttribute(DATA_TYPE)
                    if (dataType === BlockNodeEnum.NODE_BLOCK_QUERY_EMBED) return;
                    const id = bkDiv.getAttribute(DATA_NODE_ID);

                    // check empty pathes
                    if (bkItem?.blockPaths?.length === 0) {
                        bkItem.blockPaths.push({ id: bkDoc.id, name: bkDoc.name, type: BlockNodeEnum.NODE_DOCUMENT, subType: "", children: null })
                        bkItem.blockPaths.push({ id, name: "", type: BlockNodeEnum.NODE_PARAGRAPH, subType: "", children: null })
                    }

                    return {
                        updated: bkDiv.getAttribute(UPDATED) ?? "",
                        bk: bkItem,
                        id: newID(),
                        attrs: {},
                        bkDiv,
                        isMention,
                        backlink: bkDoc,
                        blockID: id,
                        atBottom: idsFilter?.getListString()?.has(id) ?? false,
                        sortBy,
                        keywords,
                    } as BacklinkSv;
                })
                .filter(i => i != null);
            return { t, bks }
        })
        .then(t => {
            const set = new Set<string>();
            const backLinks = t.bks.filter(bk => {
                const id = getAttribute(bk.bkDiv, "custom-sync-item-id")
                if (id) {
                    if (set.has(id)) {
                        return false;
                    }
                    set.add(id);
                }
                return true;
            });
            return { backLinks, bkDocs: t.t.bkDocs }
        })

    // 向上传递
    // const bkOnly = await refPassUp(backLinks.filter((i) => !i.isMention));
    const bkOnly = backLinks.filter((i) => !i.isMention);
    const taskGetDom = backLinks.filter(bl => bl.parentID).map(bl => siyuan.getBlockDOM(bl.parentID).then(d => bl.bk.dom = d.dom))

    const task1 = bkOnly.map((backLink) =>
        path2div(backLink, docID, allRefs),
    );
    const task2 = bkOnly.map((backLink) =>
        scanAllRef(backLink, backLink.bkDiv, docID, allRefs),
    );
    await Promise.all([...task1, ...task2]);
    const linkItems = [...allRefs.values()].sort((a, b) =>
        a.text.localeCompare(b.text),
    );
    backLinks.sort((a, b) => {
        switch (a.sortBy) {
            case SortType.UpdatedASC:
                return a.updated.localeCompare(b.updated)
            case SortType.UpdatedDESC:
                return -a.updated.localeCompare(b.updated)
            case SortType.CreatedASC:
                return a.blockID.localeCompare(b.blockID)
            case SortType.CreatedDESC:
                return -a.blockID.localeCompare(b.blockID)
            default:
                return 0;
        }
    });
    backLinks.sort(sortDiv);
    linkItems.forEach(i => {
        i.conceptTree = i.text?.replaceAll("丨", "|").split("|")?.map(i => i.trim()) ?? []
    })
    // for database backlink
    const { block2mSelect, block2lnks } = (() => {
        // block -> lnks
        const block2lnks = linkItems.reduce((m, lnk) => {
            lnk.blockIDs.forEach(b => {
                const list = m.get(b) ?? new Set();
                list.add(lnk)
                m.set(b, list);
            });
            return m
        }, new Map<string, Set<LinkItem>>());
        // block -> mSelect
        const block2mSelect = new Map<string, IAVCellSelectValue[]>();
        [...block2lnks.entries()].forEach(([k, v]) => {
            block2mSelect.set(k, [...v.values()].filter(v => v.id != docID).map((v) => {
                return { content: v.text } as IAVCellSelectValue
            }))
        });
        return { block2mSelect, block2lnks };
    })();

    const { maxPage } = (() => {
        const bkCount = bkDocs?.backlinks?.length ?? 0;
        const meCount = bkDocs?.backmentions?.length ?? 0;
        const bkPage = Math.ceil(bkCount / refDocCount)
        const mePage = Math.ceil(meCount / menDocCount)
        return { maxPage: Math.max(bkPage, mePage) };
    })();

    await Promise.all(taskGetDom);
    return { linkItems, backLinks, block2mSelect, block2lnks, maxPage }
}

export function createProtyle(blockId: string, plugin: Plugin, render?: IProtyleOptions['render']) {
    const div = document.createElement("div") as HTMLElement;
    div.setAttribute(TOMATO_BK_IGNORE, "1");
    div.style.minHeight = "auto";
    if (!render) render = {
        background: false,
        title: false,
        gutter: true,
        scroll: false,
        breadcrumb: false,
        breadcrumbDocName: false,
    }
    const p = new Protyle(plugin.app, div, { blockId, render });
    p.protyle.element.addEventListener("mouseleave", () => {
        delGutter(p.protyle.element);
    });
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === "style") {
                p.protyle.wysiwyg.element.style.padding = "0px";
            }
        });
    });
    observer.observe(p.protyle.wysiwyg.element, {
        attributes: true,
        childList: false,
        characterData: false,
    });
    return { p, ob: observer };
}

export function closeProtyle(...bks: BacklinkSv<Protyle>[]) {
    for (const bk of bks) {
        bk.ob?.disconnect();
        bk.ob = null;
        bk.protyle?.destroy();
        // 内核 destroy() 不把 element 从 DOM 摘除（只摘 class/observers，2026-09-01 查内核源码
        // 实证）——卡 DOM 若被 keyed each 复用，尸体 element 会残留在卡内与新实例堆叠，必须自摘
        bk.protyle?.protyle?.element?.remove();
        bk.protyle = null;
    }
}