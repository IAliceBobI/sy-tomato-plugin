import { IProtyle, Plugin } from "siyuan";
import { events } from "./Events";
import { BlockNodeEnum, CUSTOM_RIFF_DECKS, DATA_NODE_ID, DATA_TYPE } from "./gconst";
import { NewNodeID, cloneCleanDiv, count, dom2div, getAttribute, pmap, prepend_refs, siyuan } from "./utils";
import { domNewLine, DomSuperBlockBuilder, getSpans } from "./sydom";
import { DocTracer, OpenSyFile2 } from "./docUtils";
import { lastVerifyResult } from "./user";

export async function delAllchecked(docID: string) {
    if (!docID) return;
    const kramdowns = await Promise.all((await siyuan.sql(`select id from blocks 
        where type='i' and subType='t' and root_id="${docID}"
        and (markdown like "* [X] %" or markdown like "- [X] %")
        limit 30000
    `)).map(b => siyuan.getBlockKramdown(b.id)));
    await siyuan.deleteBlocks(kramdowns.map(b => b.id));
    await siyuan.pushMsg(`removed ${kramdowns.length} todos`);
}

export async function uncheckAll(docID: string) {
    if (!docID) return;
    const doms = await Promise.all((await siyuan.sql(`select id from blocks 
        where type='i' and subType='t' and root_id="${docID}"
        and (markdown like "* [X] %" or markdown like "- [X] %")
        limit 30000
    `)).map(b => siyuan.getBlockDOM(b.id)));
    await siyuan.updateBlocks(doms.map(({ id, dom }) => {
        const div = dom2div(dom);
        div.classList.remove("protyle-task--done");
        return { id, domStr: div.outerHTML };
    }));
    setTimeout(() => {
        events.protyleReload();
    }, 1000);
    await siyuan.pushMsg(`unchecked ${doms.length} todos`);
}

export async function addFlashCard(protyle: IProtyle, docTracer: DocTracer, plugin: Plugin, addRef: boolean) {
    if (!protyle) return;
    const { selected, ids } = await events.selectedDivs(protyle);
    if (!selected || selected.length <= 0) return;
    if (!await pmap(ids, siyuan.checkBlockExist)
        .then(list => {
            return list.reduce((init, { v }) => init && v, true);
        })
    ) {
        return;
    }
    siyuan.pushMsg("create list")
    if (selected.length == 1) {
        const { id, found } = findElement(selected[0], true, (e) => {
            return getAttribute(e, "data-type") === BlockNodeEnum.NODE_SUPER_BLOCK
        });
        if (id) {
            if (getAttribute(found, "custom-riff-decks")) {
                await siyuan.removeRiffCards([id]);
            } else {
                await siyuan.addRiffCards([id]);
            }
        } else {
            return await convert2list(selected, ids, docTracer, plugin, addRef);
        }
    } else {
        return await convert2list(selected, ids, docTracer, plugin, addRef);
    }
}

let convert2listNotVIPLimit = 3;
async function convert2list(selected: HTMLElement[], ids: string[], docTracer: DocTracer, plugin: Plugin, addRef: boolean) {
    if (!(selected.length > 0)) return;

    const { spans } = await (async () => {
        let spans: HTMLElement[] = []
        if (!lastVerifyResult()) {
            convert2listNotVIPLimit--;
        }
        if (addRef && convert2listNotVIPLimit > 0) {
            spans = await getSpans(selected, docTracer)
        }
        return { spans };
    })();

    const sup = new DomSuperBlockBuilder();
    sup.setAttr("custom-super-card-box", "1")

    let firstID = "";
    if (spans.length > 0) {
        const ref = domNewLine();
        firstID = getAttribute(ref, "data-node-id")
        prepend_refs(ref, spans)
        sup.append(ref)
    }

    selected.map((div,) => {
        const c = cloneCleanDiv(div);
        if (!firstID) firstID = c.newID
        sup.append(c.div)
    })

    const domStr = sup.build().outerHTML;
    const ops = siyuan.transInsertBlocksAfter([domStr], ids[ids.length - 1])
    ops.push(...siyuan.transDeleteBlocks(ids))
    await siyuan.transactions(ops)
    setTimeout(() => {
        if (firstID) {
            OpenSyFile2(plugin, firstID);
        }
    }, 200);
    return sup.id
}

export function findElement(e: HTMLElement, outerMost: boolean, predict: (e: HTMLElement) => boolean) {
    let id: string;
    let found: HTMLElement;
    for (; e; e = e.parentElement) {
        const tmpID = e.getAttribute(DATA_NODE_ID);
        if (tmpID && predict(e)) {
            found = e;
            id = tmpID;
            if (!outerMost) break;
        }
    }
    return { id, found };
}

export function findElementByAttr(e: HTMLElement, attrs: AttrType, outerMost = true) {
    let id: string;
    let found: HTMLElement;
    const attrList = [...Object.entries(attrs)];
    for (; e; e = e.parentElement) {
        const tmpID = e.getAttribute(DATA_NODE_ID);
        let pass = true;
        if (tmpID) {
            for (const [k, v] of attrList) {
                if (v == null) {
                    if (!e.getAttribute(k)) {
                        pass = false
                        break;
                    }
                } else {
                    if (e.getAttribute(k) !== v) {
                        pass = false
                        break;
                    }
                }
            }
            if (pass) {
                found = e;
                id = tmpID;
                if (!outerMost) break;
            }
        }
    }
    return { id, found };
}

/// 找到最外层的列表
export function findListTypeByElement(e: HTMLElement) {
    let id: string;
    let isCard: boolean;
    let found: HTMLElement;
    for (; e; e = e.parentElement) {
        const tmpID = e.getAttribute(DATA_NODE_ID);
        const dataType = e.getAttribute(DATA_TYPE);
        if (tmpID && dataType == BlockNodeEnum.NODE_LIST) {
            found = e;
            id = tmpID;
            isCard = e.hasAttribute(CUSTOM_RIFF_DECKS);
        }
    }
    return { id, isCard, found };
}

export class AttrBuilder {
    private list = [];
    private _id: string;
    public get id(): string {
        return this._id;
    }
    private set id(value: string) {
        this._id = value;
    }
    constructor(id = "", initID = false) {
        if (initID) {
            this.id = NewNodeID();
            this.list.push(`id="${this.id}"`);
        } else if (id) {
            this.id = id;
            this.list.push(`id="${this.id}"`);
        }
    }
    add(name: string, value: any) {
        if (name != null && value != null) {
            this.list.push(`${name}="${value}"`);
        }
        return this;
    }
    build() {
        if (this.list.length == 0) return "";
        return `{: ${this.list.join(" ")}}`; // nospace dont touch
    }
}

export function getDocListMd(text = "") {
    const id = NewNodeID();
    let attr = "";
    return {
        md: `* {: id="${NewNodeID()}"}${text}
  {: id="${NewNodeID()}"}
  {: id="${NewNodeID()}"}
  {: id="${NewNodeID()}"}
{: id="${id}"${attr}}`,
        id
    };
}

export function text2tab(text: string) {
    if (!text) return;
    text = text.trim()
    const tabList: string[][] = [];
    let maxCol = 0
    for (let line of text.split("\n")) {
        line = line.trim()
        if (!line) continue;
        const row = line.split("|");
        const rowList = []
        tabList.push(rowList)
        if (maxCol < row.length) maxCol = row.length
        for (const item of line.split("|")) {
            rowList.push(item)
        }
    }

    let firstRow = true
    const outList = []
    for (const row of tabList) {
        const add = maxCol - row.length;
        if (add > 0) {
            for (const _i of count(add)) {
                row.push("")
            }
        }
        outList.push(row.join("|"))
        if (firstRow) {
            firstRow = false;
            outList.push(row.map(_i => "---").join("|"))
        }
    }
    return outList.join("\n")
}