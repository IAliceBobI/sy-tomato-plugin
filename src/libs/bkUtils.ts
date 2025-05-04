import { IProtyleOptions, Lute, Plugin, Protyle } from "siyuan";
import { BLOCK_REF, BlockNodeEnum, DATA_ID, DATA_NODE_ID, DATA_SUBTYPE, DATA_TYPE, IN_BOOK_INDEX, SPACE, STATICLINK, TOMATO_BK_IGNORE, TOMATO_BK_STATIC, UPDATED } from "./gconst";
import { NewLute, NewNodeID, cleanDivOnly, dom2div, getAttribute, getID, get_siyuan_lnk_md, isValidNumber, newID, set_href, siyuan } from "./utils";
import { tomatoI18n } from "../tomatoI18n";
import { getHierarchyConcepts, OpenSyFile2 } from "./docUtils";
import { back_link_passup_heading, back_link_passup_quote, back_link_passup_super, storeAttrManager } from "./stores";
import { SortType } from "./types";

export function icon(name: string, size?: number) {
    if (size) {
        return `<svg width="${size}px" height="${size}px"><use xlink:href="#icon${name}"></use></svg>`;
    }
    return `<svg><use xlink:href="#icon${name}"></use></svg>`;
}

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

export async function addRef(backlinkSv: BacklinkSv, txt: string, id: string, docID: string, allRefs: RefCollector, dataNodeID?: string) {
    if (txt.trim() == "*") return;
    // if (
    //     Array.from(
    //         txt.matchAll(/^c?\d{4}-\d{2}-\d{2}(@第\d+周-星期.{1})?$/g),
    //     ).length > 0
    // )
    //     return;

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

export class ConTreeNode {
    value: LinkItem;
    children = new Map<string, ConTreeNode>();
    constructor(items: LinkItem[], value = null) {
        this.value = value;
        items.forEach(i => {
            this.children.set(i.text, new ConTreeNode([], i));
        })
    }
    group() {
        let tidy: boolean;
        do {
            tidy = false;
            for (const cn1 of this.children.values()) {
                for (const cn2 of this.children.values()) {
                    const t1 = cn1.value.text;
                    const t2 = cn2.value.text;
                    if (t1 === t2) continue;
                    else if (t1.startsWith(t2)) {
                        cn2.children.set(t1, cn1);
                        this.children.delete(t1);
                        tidy = true;
                    } else if (t2.startsWith(t1)) {
                        cn1.children.set(t2, cn2);
                        this.children.delete(t2);
                        tidy = true;
                    }
                }
            }
        } while (tidy);
    }
}

class ConTree {
    private linkItems: LinkItem[];
    private root: ConTreeNode;
    constructor(linkItems: LinkItem[]) {
        this.linkItems = linkItems.map((i) => {
            i.text = i.text
                .split("|")
                .map((i) => i.trim())
                .join("|");
            return i;
        })
        this.root = new ConTreeNode(this.linkItems);
    }
    build() {
        this.doBuild(this.root);
        return this.root.children;
    }
    private doBuild(node: ConTreeNode) {
        node.group();
        for (const cn of node.children.values()) {
            this.doBuild(cn);
        }
    }
}

export function getConceptTrees(linkItems: LinkItem[]) {
    const tree = new ConTree(linkItems);
    return tree.build();
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
    docName: string,
    idsFilter: ReturnType<typeof storeAttrManager> = null,
    page = 0
) {
    const allRefs: RefCollector = new Map();
    const allRefsHierarchy: RefCollector = new Map();
    const task3 = getHierarchyConcepts(docName).then(async ret => {
        await Promise.all(ret.map((r) => addRef(null, r.content, r.id, docID, allRefsHierarchy)))
        return ret;
    });
    const backLinks = await siyuan.getBacklink2(docID, globalSearchText, globalSearchText, sortBy, sortBy)
        .then(async bkDocs => {
            if (!bkDocs) return [];
            const bk = Promise
                .all( // promieList -> promise
                    bkDocs.backlinks.slice(page * refDocCount, (page + 1) * refDocCount)
                        .map(async bkDoc => { // map() returns promieList
                            const items = await siyuan.getBacklinkDoc(docID, bkDoc.id, globalSearchText);
                            return items.backlinks.map(bkItem => {
                                return { isMention: false, bkDoc, bkItem }
                            })
                        })
                )
                .then(i => i.flat()); // doc[item[]] -> item[]
            const me = Promise
                .all( // promieList -> promise
                    bkDocs.backmentions.slice(page * menDocCount, (page + 1) * menDocCount)
                        .map(async bkDoc => { // map() returns promieList
                            const items = await siyuan.getBackmentionDoc(docID, bkDoc.id, globalSearchText);
                            return items.backmentions.map(bkItem => {
                                return { isMention: true, bkDoc, bkItem }
                            })
                        })
                )
                .then(i => i.flat()); // doc[item[]] -> item[]
            return [...(await bk), ...(await me)];
        })
        .then(async bks => {
            return bks
                .filter(i => i.bkItem?.dom != null)
                .map(({ isMention, bkItem, bkDoc }) => {
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
                    } as BacklinkSv;
                })
                .filter(i => i != null)
        })
        .then(bks => {
            const set = new Set<string>();
            return bks.filter(bk => {
                const id = getAttribute(bk.bkDiv, "custom-sync-item-id")
                if (id) {
                    if (set.has(id)) {
                        return false;
                    }
                    set.add(id);
                }
                return true;
            });
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
    await Promise.all([...task1, ...task2, task3]);
    const linkItems = [...allRefs.values()].sort((a, b) =>
        a.text.localeCompare(b.text),
    );
    const linkItemsHierarchy = [...allRefs.values(), ...allRefsHierarchy.values()].sort((a, b) =>
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
        i.conceptTree = i.text?.split("|")?.map(i => i.trim()) ?? []
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

    await Promise.all(taskGetDom);
    return { linkItems, linkItemsHierarchy, backLinks, block2mSelect, block2lnks, hierarchyConcepts: await task3 }
}

export async function insertConcepts(plugin: Plugin, docID: string, hierarchyConcepts: Block[]) {
    return siyuan
        .sqlSpan(`select markdown from spans where root_id="${docID}" limit 10000000`)
        .then(rows => rows.map(row => row.markdown).join("") + " " + docID)
        .then(text => hierarchyConcepts.filter(row => !text.includes(row.id)))
        .then(cons => cons.map(row => {
            const id = NewNodeID();
            return { id, lnk: `${get_siyuan_lnk_md(row.id, row.content)}\n{: id="${id}"}` };
        }))
        .then(async lnks => {
            if (lnks.length > 0) {
                await siyuan.insertBlockAsChildOf(lnks.map(l => l.lnk).join("\n"), docID)
                await OpenSyFile2(plugin, lnks[0].id);
            }
            siyuan.pushMsg(`${lnks.length}/${hierarchyConcepts.length} have been inserted already.`, 2000)
        });
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
        bk.protyle = null;
    }
}