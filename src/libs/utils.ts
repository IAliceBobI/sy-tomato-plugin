import { Config, Constants, Lute, Protyle, fetchSyncPost, confirm, IProtyle, getAllEditor } from "siyuan";
import { v4 as uuid } from "uuid";
import * as gconst from "./gconst";
import * as moment from "moment-timezone";
import { TomatoI18n } from "../tomatoI18n";
import { zipNways } from "./functional";
import { Md5 } from "ts-md5";
import { events } from "./Events";
import { linkBoxUseLnkOrRef } from "./stores";
import { getDocBlocks } from "./docUtils";
import { domRef, DomSuperBlockBuilder } from "./sydom";
import { DestroyManager } from "./destroyer";
import { parseCustomTag } from "./ial";

export function closeTabByTitle(tabs: AttrType[], excludeDocID: string) {
    if (tabs?.length > 0) {
        const openedTabs = [...document.querySelectorAll(`span.item__text`)];
        for (const t of tabs) {
            if (t.id === excludeDocID) continue;
            const f = openedTabs.find(o => o.textContent === t.title);
            (f?.nextElementSibling as HTMLButtonElement)?.click();
        }
    }
}

export function getOpenedEditors() {
    return getAllEditor().map(p => {
        return {
            ial: p?.protyle?.background?.ial as unknown as AttrType,
            protyle: p,
        }
    })
}

export function mylog(...data: any[]) {
    if (events.isMobile) {
        siyuan.appendDailyNoteBlock(events.boxID, data.join(" "))
    } else {
        console.info(...data)
    }
}

export function notEmptyStrDo(s: string, cb: (s: string) => void) {
    s = s?.trim()
    if (s) cb(s);
}

export function set(obj: Object, path: string, value: any) {
    if (!obj) obj = {}
    if (!path) {
        obj = value;
    } else {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (typeof current[part] !== 'object' || current[part] === null) {
                current[part] = {};
            }
            current = current[part];
        }
        current[parts[parts.length - 1]] = value;
    }
    return obj
}

export function newProxy() {
    return new Proxy({}, {
        get(target, prop) {
            if (!(prop in target)) {
                target[prop] = new Proxy({}, this);
            }
            return target[prop];
        }
    });
}

export async function deleteBlock(id: string, row?: Block) {
    if (!row) row = await siyuan.sqlOne(`select type from blocks where id="${id}"`);
    if (row?.type === "d") {
        await siyuan.removeDocByIDSiyuan(id)
    } else {
        await siyuan.deleteBlock(id);
    }
}

export function write2dailynote(txt: string) {
    const box = opennedNotebooks()?.at(0)?.id
    if (box) {
        siyuan.appendDailyNoteBlock(box, txt)
    }
}

export function opennedNotebooks() {
    return Siyuan?.notebooks?.filter(i => i.id && !i.closed)
}

export function stringToNumber(str: string) {
    const num = Number(str);
    return isNaN(num) ? 0 : num;
}

export function joinArray<T>(array: T[], factory: () => T): T[] {
    if (!array) return [];
    return array.flatMap((value, index, arr) => {
        if (index === arr.length - 1) {
            return [value];
        }
        return [value, factory()];
    });
}

export function arrayDeleteFromLeft<T>(list: T[], keep: (i: T, idx: number, arr: T[]) => boolean) {
    for (let i = 0; i < list.length; i++) {
        if (!keep(list[i], i, list)) {
            list.splice(i, 1);
            i--;
        }
    }
    return list;
}

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

export function extractTextFromMarkdown(markdown: string): string {
    return markdown
        .replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        .replaceAll("*", "")
        .replaceAll(" ", "")
        .replaceAll("---", "")
}

export async function pmapNull<A, T>(list: Array<A>, fn: (a: A) => Promise<T>) {
    const a = await Promise.all(list.map(i => fn(i)))
    return list.map((i, idx) => { return { k: i, v: a[idx] }; })
}

export async function pmap<A, T>(list: Array<A>, fn: (a: A) => Promise<T | null | undefined>) {
    return pmapNull(list, fn).then(l => l.filter(({ v }) => v != null));
}

export async function pmapNullVO<A, T>(list: Array<A>, fn: (a: A) => Promise<T>) {
    return Promise.all(list.map(i => fn(i)))
}

export async function pmapVO<A, T>(list: Array<A>, fn: (a: A) => Promise<T | null | undefined>) {
    return pmapNullVO(list, fn).then(l => l.filter(v => v != null));
}

export class RefObj<T> { v: T; constructor(v: T) { this.v = v; } }

export function joinByComma(all: string, id: string) {
    if (all) {
        const a = all.split(",")
        a.push(id)
        return [...(new Set(a)).values()].join(",")
    }
    return id
}

export async function findDuplicatedDocs() {
    const rows = await siyuan.sql(` select id,content,hpath from blocks where content in (
            SELECT content FROM blocks WHERE type = 'd' GROUP BY content HAVING COUNT(*) > 1
        ) and type='d'`)
    rows.forEach(row => {
        console.info(row);
    })
}

export function addCardSetDueTime(cardID: string, sleepMs = 1000, deltaSecs = 0) {
    setTimeout(async () => {
        await siyuan.addRiffCards([cardID]);
        setTimeout(async () => {
            await siyuan.reviewRiffCardByBlockID(cardID, 2);
            const due = timeUtil.getYYYYMMDDHHmmss(timeUtil.nowts() + deltaSecs);
            await siyuan.batchSetRiffCardsDueTimeByBlockID([{ id: cardID, due }]);
        }, sleepMs);
    }, sleepMs);
}

export function getMd5(str: string) {
    const md5 = new Md5();
    md5.appendStr(str);
    return md5.end().toString();
}

export function pushNotNull<T>(arr: T[] | undefined, ...items: T[]): T[] {
    if (!arr) arr = [];
    if (items != null) {
        for (const i of items) {
            if (i != null) {
                arr.push(i);
            }
        }
    }
    return arr;
}

export function push<T>(arr: T[] | undefined, ...items: T[]): T[] {
    if (!arr) arr = [];
    arr.push(...items);
    return arr;
}

export function setAttribute(e: any, name: keyof AttrType, value: string) {
    if (e?.setAttribute) e.setAttribute(name, value);
}

export function getAttribute(e: any, name: keyof AttrType): string {
    if (e?.getAttribute) return e.getAttribute(name)
}

export function getChildElements(e: any): HTMLElement[] {
    if (e?.getAttribute && e.childNodes) {
        return [...e.childNodes]
            .filter((e: any) => e.getAttribute) as any
    }
    return []
}

export function removeAttribute(e: any, name: keyof AttrType) {
    if (e?.removeAttribute) return e.removeAttribute(name)
}

export function strIncludeAttr(str: string, name: keyof AttrType) {
    return str?.includes(name);
}

export function convertMinutesToTimeFormat(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours == 0) {
        return `${remainingMinutes}m`;
    }
    return `${hours}h${remainingMinutes}m`;
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

export function versionGreaterEqual(v: string) {
    const currentV = Siyuan.config.system.kernelVersion;
    return compareVersions(currentV, v) >= 0;
}

export function compareVersions(version1: string, version2: string) {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        const num1 = v1[i] || 0;
        const num2 = v2[i] || 0;

        if (num1 < num2) {
            return -1;
        } else if (num1 > num2) {
            return 1;
        }
    }
    return 0;
}

function recursiveFlat(tree: RetListDocTreeDir, ids: Set<string> = new Set()) {
    if (!tree) return ids;
    tree.path = (tree.path ?? "") + "/" + tree.id;
    ids.add(tree.path + ".sy");
    if (tree.children) {
        for (const c of tree.children) {
            c.path = tree.path;
            recursiveFlat(c, ids);
        }
    }
    return ids;
}

async function getAllFileIDs() {
    return siyuan.lsNotebooks().then(async (books) => {
        const list = await Promise.all(books.map(i => siyuan.listDocTree(i.id, "/")))
        return zipNways(books, list).filter(all => all[1].tree != null).map(([b, { tree }]) => {
            return tree.map(i => {
                i.box = b.id
                i.path = "/" + b.id
                return i;
            })
        }).flat()
    }).then((trees) => {
        return trees.map(tree => recursiveFlat(tree)).reduce((init, v) => {
            for (const i of v.values()) {
                init.add(i);
            }
            return init;
        }, new Set())
    })
}

export function downloadStringAsFile(content: string, filename: string, mimeType: string = 'text/plain') {
    // 创建一个 Blob 对象
    const blob = new Blob([content], { type: mimeType });

    // 创建一个指向 Blob 的 URL
    const url = URL.createObjectURL(blob);

    // 创建一个 <a> 标签
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // 模拟点击 <a> 标签以触发下载
    a.click();

    // 释放 URL 对象
    URL.revokeObjectURL(url);
}

export async function readAllFiles() {
    const pathes1 = await getAllFileIDs().then(p => [...p.values()].map(i => "/data" + i));
    const dbPath = "/data/storage/av";
    const pathes2 = siyuan.readDir(dbPath).then(i => {
        return i?.filter(i => i.name.endsWith(".json"))?.map(i => dbPath + "/" + i.name) ?? []
    })
    return Promise.all([pathes1, pathes2]).then(all => all.flat())
}

export async function getPluginSpec(name: string): Promise<PluginSpec> {
    return (await siyuan.getJson(`/data/plugins/${name}/plugin.json`)) ?? {};
}

export async function tryFixCfg(pluginName: string, fileName: string) {
    try {
        const path = `data\\storage\\petal\\${pluginName}\\${fileName}`;
        const ret = await siyuan.getJson(path);
        if (!ret) {
            await siyuan.removeFile(path)
        }
    } catch { }
}

export function isObject(value: any): boolean {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function isMainWin() {
    const focusBtn = document.querySelector('span[data-type="focus"]');
    return focusBtn != null;
}

export function* count(end: number) {
    for (let i = 0; i < end; i++) {
        yield i;
    }
}

export function* getRange(start: number, end: number) {
    for (let i = start; i < end; i++) {
        yield i;
    }
}

export function setTimeouts(cb: Func, start: number, end: number, step: number) {
    for (; start <= end; start += step) {
        setTimeout(cb, start);
    }
}

export function attrNewLine() {
    return `{: id="${NewNodeID()}"}`;
}

export function removeHtmlTags(htmlStr: string) {
    if (htmlStr.includes("&") || htmlStr.includes("<")) {
        const temp = document.createElement("div");
        temp.innerHTML = htmlStr;
        return temp.textContent || temp.innerText;
    }
    return htmlStr;
}

export function htmlEscape(str: string) {
    return str.replace(/&/g, "&amp;")  // 转义 &
        .replace(/</g, "&lt;")  // 转义 <
        .replace(/>/g, "&gt;")  // 转义 >
        .replace(/"/g, "&quot;")  // 转义 双引号
        .replace(/'/g, "&#039;"); // 转义 单引号
}

export function htmlUnescape(str: string) {
    return str.replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&#039;/g, "'");
}

export function ial2str(ial: AttrType): string {
    return "{: " + [...Object.entries(ial)].reduce((l, i) => {
        l.push(`${i[0]}="${i[1]}"`);
        return l;
    }, []).join(" ") + "}";
}

export function parseIAL(ial: string) {
    const obj = {} as AttrType;
    if (ial) {
        // const attrs = ial.matchAll(/([^\s]+)="([^\s]+)"/g);
        // for (const attr of attrs) obj[attr[1]] = attr[2];
        const attrs = parseCustomTag(ial)
        return attrs;
    }
    return obj;
}

export function setFocusToEditableDiv(editableDiv: HTMLElement) {
    editableDiv.focus();
    const range = document.createRange();
    range.selectNodeContents(editableDiv);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

export function moveCursor2Tail(id: string) {
    const newDIV = document.querySelector(`div[${gconst.DATA_NODE_ID}="${id}"] div[contenteditable="true"]`);
    if (newDIV) document.getSelection().collapse(newDIV, 1);
}

export function extractLinksFromElement(div: HTMLElement) {
    const ids: Set<string> = new Set();
    for (const e of div.querySelectorAll(`[${gconst.DATA_TYPE}~="${gconst.BLOCK_REF}"]`)) {
        const id = e.getAttribute(gconst.DATA_ID);
        ids.add(id);
    }
    return [...ids.values()];
}

export function getRandFloat0tox(x: number) {
    return Math.random() * x;
}

export function replaceAll(str: string, find: string, replace: string): string {
    return str.replace(new RegExp(find, "g"), replace);
}

export function getRandInt0tox(x: number) {
    return Math.floor(Math.random() * x);
}

export function dom2div(dom: string) {
    const div = document.createElement("div") as HTMLElement;
    if (!dom) return div;
    div.innerHTML = dom;
    return div.firstElementChild as HTMLElement;
}

export function arrayRemove<T>(array: T[], element: T) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
    return array;
}

export function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function isSearchUI(protyle: Protyle) {
    const e = protyle?.protyle?.element as HTMLElement;
    return e?.id === "searchPreview"
}

export function isFloatUI(protyle: Protyle) {
    const e = protyle?.protyle?.element as HTMLElement;
    if (e.classList.contains("block__edit")) return true;
    return false;
}

export function isCardUI(protyle: Protyle) {
    const e = protyle?.protyle?.element as HTMLElement;
    return e?.classList?.contains("card__block");
}

export function isCardByUpLook(e: HTMLElement) {
    if (!e) return false;
    if (e.classList?.contains("card__block") === true) {
        return true
    }
    return isCardByUpLook(e?.parentElement);
}

export function sortedMap<K, V>(map: Map<K, V>, compareFn?: (a: [K, V], b: [K, V]) => number) {
    return new Map([...map.entries()].sort(compareFn));
}

export function newIDRegexp() {
    return new RegExp(/[0-9]{14}-[0-9a-z]{7}/g);
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

export function get_siyuan_lnk_md(id: string, text: string, empty = false) {
    if (empty || !id || !text) return ""
    return `[${text}](siyuan://blocks/${id}?focus=1)`;
}

export function extendMap<K, V>(targetMap: Map<K, V>, sourceMap: Map<K, V>): Map<K, V> {
    for (const [key, value] of sourceMap.entries()) {
        targetMap.set(key, value);
    }
    return targetMap;
}

export function cloneCleanDiv(div: HTMLElement, useIDMap = false) {
    return cleanDivOnly(div?.cloneNode(true) as any, useIDMap);
}

export function cleanDivOnly(div: HTMLElement, useIDMap = false) {
    if (!div) return {};
    div.classList.remove("protyle-wysiwyg--select")
    div.querySelectorAll(`div[${gconst.CONTENT_EDITABLE}="false"]`).forEach(e => e.setAttribute(gconst.CONTENT_EDITABLE, "true"));

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

export function getCursorElement() {
    const selection = document.getSelection();
    return getSyElement(selection?.focusNode as any) as HTMLElement;
}

export function getID(e: HTMLElement | Element | Node, attrs?: string[]) {
    const s = getSyElement(e, attrs);
    if (s) {
        return s.getAttribute(gconst.DATA_NODE_ID);
    }
    return "";
}

export function getSyElement(e1: HTMLElement | Element | Node, attrs?: string[]) {
    const e = e1 as HTMLElement;
    if (!e) return;
    if (e.getAttribute) {
        const id = e.getAttribute(gconst.DATA_NODE_ID);
        if (id) {
            if (attrs) {
                for (const attr of attrs) if (e.hasAttribute(attr)) return e;
            } else {
                return e;
            }
        }
    }
    return getSyElement(e.parentElement, attrs);
}

export function getAllContentEditableElements(element: Element) {
    if (!element) return [];
    return [...element.querySelectorAll(`[${gconst.CONTENT_EDITABLE}="true"]`)];
}

export function getAllText(element: Element[], join = "\n") {
    const txt = element
        .map(getAllContentEditableElements)
        .flat()
        .reduce((a, e) => {
            a.push(e.textContent ?? "");
            return a;
        }, [])
        .filter(i => !!i)
        .join(join);
    return cleanText(txt);
}

export function getAllContentEditableText(element: Element, join = "\n") {
    return getAllText([element], join);
}

export function getContenteditableElement(element: Element) {
    if (!element) return element;
    const ed = element.getAttribute(gconst.CONTENT_EDITABLE);
    if ((ed === "true" || ed === "false") && !element.classList.contains("protyle-wysiwyg")) return element;
    let e = element.querySelector(`[${gconst.CONTENT_EDITABLE}="true"]`);
    if (!e) e = element.querySelector(`[${gconst.CONTENT_EDITABLE}="false"]`);
    return e;
}

export function styleColor(bgcolor: string, color: string) {
    return `<style>button{display: inline-block; padding: 10px 20px; background-color: ${bgcolor}; color: ${color}; text-align: center; text-decoration: none; font-size: 16px; border: none; border-radius: 4px; cursor: pointer;}button.large { padding: 12px 24px; font-size: 24px; }button.small { padding: 8px 16px; font-size: 14px; }</style>`;
}

export function replaceRef2Lnk(md: string) {
    if (!md) return;
    const RefRegex = getRefRegexp();
    const matches = Array.from(md.matchAll(RefRegex));
    for (const match of matches) {
        const id = match[1];
        const txt = match[2];
        const lnk = get_siyuan_lnk_md(id, txt.slice(1, -1));
        md = md.replace(match[0], lnk);
    }
    return md;
}

export function extractIDs(txt: string) {
    // 20240607225626-o9dqy2r
    const RefRegex = newIDRegexp();
    const matches = txt.matchAll(RefRegex);
    const set = new Set<string>();
    for (const m of matches) {
        if (m[0]) set.add(m[0])
    }
    return set;
}

export function getRefRegexp() {
    // [1] for id, [2] for text
    return new RegExp(/\(\(([0-9]{14}-[0-9a-z]{7}) (("[^"]*?")|('[^']*?'))\)\)/g);
}

export function getRefRegexpSingleQuote() {
    // [1] for id, [2] for text
    return new RegExp(/\(\(([0-9]{14}-[0-9a-z]{7}) '([^']*?)'\)\)/g);
}

export function getRefRegexpDoubleQuote() {
    // [1] for id, [2] for text
    return new RegExp(/\(\(([0-9]{14}-[0-9a-z]{7}) "([^"]*?)"\)\)/g);
}

export function extractRefsUniq(txt: string, set?: Set<string>, excludedIDs?: string[], excludedTexts?: string[]) {
    const ids: ReturnType<typeof extractRefs> = []
    if (!set) set = new Set();
    else set.clear();
    for (const id of extractRefs(txt, excludedIDs, excludedTexts)) {
        if (!set.has(id.id)) {
            set.add(id.id)
            ids.push(id);
        }
    }
    return ids;
}

export function extractRefs(txt: string, excludedIDs?: string[], excludedTexts?: string[]) {
    const RefRegex = getRefRegexp();
    return [...txt.matchAll(RefRegex)]
        .map(m => {
            return { id: m[1], text: m[2].slice(1, -1).trim() };
        })
        .filter(id => {
            let flag = true;
            if (excludedIDs) {
                flag &&= !excludedIDs.includes(id.id)
            }
            if (!flag) return false;

            if (excludedTexts) {
                flag &&= !excludedTexts.includes(id.text)
            }
            return flag;
        })
}

export function extractLinks(txt: string) {
    const RefRegex = getRefRegexp();
    const ids: string[] = [];//id
    const links: string[] = [];//whole
    const idLnks: { id: string, txt: string }[] = [];//id, text
    const matches = txt.matchAll(RefRegex);
    for (const match of matches) {
        const id = match[1] ?? "";
        if (id) {
            ids.push(id);
            links.push(match[0]);
            idLnks.push({ id, txt: match[2].slice(1, -1) });
        }
    }
    return { ids, links, idLnks };
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function removeInvisibleChars(str: string, trim = false): string {
    // 使用正则表达式匹配所有不可见字符并替换为空字符串
    if (trim) {
        return str.replace(/^[\s\u200B-\u200D\uFEFF]+|[\s\u200B-\u200D\uFEFF]+$/g, '');
    } else {
        return str.replace(/[\u200B-\u200D\uFEFF]/g, '');
    }
}

export function cleanText(text: string): string {
    return text ? text.split('\u200B').join('').split('\u200D').join('').trim() : "";
}

export function removeSiyuanLnks(c: string) {
    return c.replaceAll(/siyuan:\/\/blocks\/.{22}(\?focus=1)?/g, "")
}

export function removeAllLnks(markdown: string) {
    // markdown = markdown.replace(/(http)|(https)|(siyuan):\/\/(.*?) /, "$4");
    markdown = markdown.replace(/\[(.*?)\]\(.*?\)/, "$1");
    markdown = markdown.replace(/\(\((.*?) ('|")(.*?)('|")\)\)/, "$3");
    return markdown;
}

export function remove_1StarLnks(markdown: string) {
    markdown = markdown.replace(/\[\*]\(siyuan:\/\/blocks\/.{22}.*?\)/g, "");
    return markdown;
}

export function siyuanLnk2text(markdown: string) {
    markdown = markdown.replace(/\[.*?\]\(.*?\)/g, "$1");
    return markdown;
}

export function toJSON(obj: any, maxDepth = 10, currentDepth = 0, seen = new Set()) {
    if (seen.has(obj)) {
        return '[Circular]';
    }
    seen.add(obj);
    if (currentDepth >= maxDepth) {
        return '[MaxDepthReached]';
    }
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => toJSON(item, maxDepth, currentDepth + 1, seen));
    }
    const result = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = toJSON(obj[key], maxDepth, currentDepth + 1, seen);
        }
    }
    return result;
}

export const Siyuan: gconst.SiyuanType = (globalThis as any).siyuan;

export const NewLute: () => Lute = (globalThis as any).Lute.New;

// export function NewLute() {
//     const setLute = (options: any) => {
//         const lute = window.Lute.New();
//         lute.SetSpellcheck(window.siyuan.config.editor.spellcheck);
//         lute.SetProtyleMarkNetImg(window.siyuan.config.editor.displayNetImgMark);
//         lute.SetFileAnnotationRef(true);
//         lute.SetHTMLTag2TextMark(true);
//         lute.SetTextMark(true);
//         lute.SetHeadingID(false);
//         lute.SetYamlFrontMatter(false);
//         lute.PutEmojis(options.emojis);
//         lute.SetEmojiSite(options.emojiSite);
//         lute.SetHeadingAnchor(options.headingAnchor);
//         lute.SetInlineMathAllowDigitAfterOpenMarker(true);
//         lute.SetToC(false);
//         lute.SetIndentCodeBlock(false);
//         lute.SetParagraphBeginningSpace(true);
//         lute.SetSetext(false);
//         lute.SetFootnotes(false);
//         lute.SetLinkRef(false);
//         lute.SetSanitize(options.sanitize);
//         lute.SetChineseParagraphBeginningSpace(options.paragraphBeginningSpace);
//         lute.SetRenderListStyle(options.listStyle);
//         lute.SetImgPathAllowSpace(true);
//         lute.SetKramdownIAL(true);
//         lute.SetTag(true);
//         lute.SetSuperBlock(true);
//         lute.SetMark(true);
//         lute.SetInlineAsterisk(window.siyuan.config.editor.markdown.inlineAsterisk);
//         lute.SetInlineUnderscore(window.siyuan.config.editor.markdown.inlineUnderscore);
//         lute.SetSup(window.siyuan.config.editor.markdown.inlineSup);
//         lute.SetSub(window.siyuan.config.editor.markdown.inlineSub);
//         lute.SetTag(window.siyuan.config.editor.markdown.inlineTag);
//         lute.SetInlineMath(window.siyuan.config.editor.markdown.inlineMath);
//         lute.SetGFMStrikethrough1(false);
//         lute.SetGFMStrikethrough(window.siyuan.config.editor.markdown.inlineStrikethrough);
//         lute.SetMark((window.siyuan.config.editor.markdown as any).inlineMark);
//         lute.SetSpin(true);
//         lute.SetProtyleWYSIWYG(true);
//         if (options.lazyLoadImage) {
//             lute.SetImageLazyLoading(options.lazyLoadImage);
//         }
//         lute.SetBlockRef(true);
//         if (window.siyuan.emojis[0].items.length > 0) {
//             const emojis = {};
//             window.siyuan.emojis[0].items.forEach(item => {
//                 emojis[item.keywords] = options.emojiSite + "/" + item.unicode;
//             });
//             lute.PutEmojis(emojis);
//         }
//         return lute;
//     };

//     // 1. 优化查找函数（仅匹配 .editor.protyle 结尾路径）
//     function findProtylePaths(obj: any) {
//         const results = [];
//         const seen = new Set();

//         function walk(obj: any, path = '') {
//             if (!obj || seen.has(obj)) return;
//             seen.add(obj);

//             for (const [key, value] of Object.entries(obj)) {
//                 const currentPath = path ? `${path}.${key}` : key;

//                 // 检查是否以 .editor.protyle 结尾
//                 if (currentPath.endsWith('.editor.protyle')) {
//                     results.push({ path: currentPath, value });
//                 }

//                 if (typeof value === 'object') {
//                     walk(value, currentPath);
//                 }
//             }
//         }

//         walk(obj);
//         return results;
//     }

//     // 2. 获取目标对象
//     const protylePaths = findProtylePaths(window.siyuan);
//     const firstProtyle = protylePaths[0]?.value;

//     if (firstProtyle) {
//         // 3. 动态设置 lute 并调用
//         firstProtyle.lute = setLute({
//             emojiSite: firstProtyle.options?.hint?.emojiPath,
//             emojis: firstProtyle.options?.hint?.emoji,
//             headingAnchor: false,
//             listStyle: firstProtyle.options?.preview?.markdown?.listStyle,
//             paragraphBeginningSpace: firstProtyle.options?.preview?.markdown?.paragraphBeginningSpace,
//             sanitize: firstProtyle.options?.preview?.markdown?.sanitize,
//         });

//         // 4. 获取lute实例
//         return firstProtyle.lute;
//     } else {
//         console.warn('未找到符合条件的 protyle 对象');
//         return Lute.New();
//     }
// }

export const NewNodeID: () => string = (globalThis as any).Lute.NewNodeID;

export const BlockDOM2Content: (html: string) => string = (globalThis as any).Lute.BlockDOM2Content;

export function divideArrayIntoParts<T>(array: T[], n: number): T[][] {
    n = Math.ceil(array.length / n);
    return chunks(array, n);
}

export function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export function isBoolean(value: any): boolean {
    return typeof value === "boolean";
}

export function chunks<T>(array: T[], n: number): T[][] {
    const newArr: T[][] = [];
    for (let i = 0; i < array.length; i += n) {
        const part = array.slice(i, i + n);
        if (part.length > 0) newArr.push(part);
    }
    return newArr;
}

export function findBookOpennedFirst(bookID: string, bookIDList: string[]): string {
    if (bookIDList.length === 0) return bookID;
    if (bookIDList.indexOf(bookID) === -1) {
        return bookIDList[0];
    }
    return bookID;
}

export function newID() {
    return "ID" + uuid().replace(/-/g, "");
}

export function dir(path: string) {
    const parts = path.split("/");
    const file = parts.pop();
    return [parts.join("/"), file];
}

export function isValidNumber(num: number) {
    return typeof num === "number" && !isNaN(num);
}

export function isStringNumber(str: string): boolean {
    return !isNaN(+str);
}

export const timeUtil = {
    nowYMD(d1?: Date) {
        const [ymd, hms] = timeUtil.nowStr(d1).split(" ")
        const [y, M, d] = ymd.split("-")
        const [h, m, s] = hms.split(":")
        return { y: Number(y), M: Number(M), d: Number(d), h: Number(h), m: Number(m), s: Number(s) }
    },
    nowYMDStrPad(d1?: Date) {
        const [ymd, hms] = timeUtil.nowStr(d1).split(" ")
        const [y, M, d] = ymd.split("-")
        const [h, m, s] = hms.split(":")
        return { y: y.padStart(2, "0"), M: M.padStart(2, "0"), d: d.padStart(2, "0"), h: h.padStart(2, "0"), m: m.padStart(2, "0"), s: s.padStart(2, "0") }
    },
    nowYMDStr(secs = 0) {
        const date = timeUtil.now(secs);
        const [ymd, hms] = timeUtil.nowStr(date).split(" ")
        const [y, M, d] = ymd.split("-")
        const [h, m, s] = hms.split(":")
        const y1 = y.padStart(2, "0");
        const M1 = M.padStart(2, "0")
        const d1 = d.padStart(2, "0")
        const h1 = h.padStart(2, "0")
        const m1 = m.padStart(2, "0")
        const s1 = s.padStart(2, "0")
        return { date: y1 + M1 + d1, time: h1 + m1 + s1, datesplit: `${y1}-${M1}-${d1}` }
    },
    nowStr(d?: Date) {
        if (!d) d = new Date()
        return timeUtil.dateFormat(d)
    },
    nowts(secs = 0) {
        return timeUtil.now(secs).getTime() / 1000;
    },
    now(secs = 0) {
        const ts = new Date().getTime() + secs * 1000;
        return new Date(ts);
    },
    getYYYYMMDDHHmmssPlus0(myTimestamp?: number) {
        if (myTimestamp == null) myTimestamp = (new Date().getTime()) / 1000;
        // let myDate = moment.unix(myTimestamp).tz("America/Los_Angeles"); 
        const myDate = moment.unix(myTimestamp).utcOffset("+0000");
        return myDate.format("YYYYMMDDHHmmss");
    },
    getYYYYMMDDHHmmssPlus8(myTimestamp?: number) {
        if (myTimestamp == null) myTimestamp = (new Date().getTime()) / 1000;
        const myDate = moment.unix(myTimestamp).utcOffset("+0800");
        return myDate.format("YYYYMMDDHHmmss");
    },
    getYYYYMMDDHHmmss(myTimestamp?: number) {
        if (myTimestamp == null) myTimestamp = (new Date().getTime()) / 1000;
        const myDate = moment.unix(myTimestamp);
        return myDate.format("YYYYMMDDHHmmss");
    },
    dateFormat(date?: Date) {
        if (date == null) date = new Date();
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month value needs +1 as it starts from 0.
        const day = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    },
    dateFormatTime(date: Date) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return hours + ":" + minutes + ":" + seconds;
    },
    dateFormatDay(date: Date) {
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return year + "-" + month + "-" + day;
    },
    /**
     * @param date 2024-07-30 08:07:11
     */
    dateFromYYYYMMDDHHmmss(date: string) {
        return new Date(date);
    },
    /**
    * @param date 20240730080711
    */
    dateFromYYYYMMDDHHmmssShort(originalDateStr: string) {
        const year = originalDateStr.slice(0, 4);
        const month = originalDateStr.slice(4, 6);
        const day = originalDateStr.slice(6, 8);
        const hours = originalDateStr.slice(8, 10);
        const minutes = originalDateStr.slice(10, 12);
        const seconds = originalDateStr.slice(12);
        const formattedDateStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return new Date(formattedDateStr);
    },
    checkTimeFormat(input: string) {
        const timeRegex = /^(\d{4})-(\d{1,2})-(\d{1,2}) ?(\d{1,2}):(\d{1,2}):(\d{1,2})$/;

        return timeRegex.test(input);
    },
    makesureDateTimeFormat(input: string) {
        const timeRegex = /^(\d{4})-(\d{1,2})-(\d{1,2}) ?(\d{1,2}):(\d{1,2}):(\d{1,2})$/;
        const zeroPad = (value: string) => {
            const v = value?.toString() ?? "";
            return padStart(v, 2, "0");
        };
        const formattedTimeString = input.replace(timeRegex, (_match, year, month, day, hour, minute, second) => {
            return `${year}-${zeroPad(month)}-${zeroPad(day)} ${zeroPad(hour)}:${zeroPad(minute)}:${zeroPad(second)}`;
        });
        if (new Date(formattedTimeString).toDateString() === "Invalid Date") {
            return "";
        }
        return formattedTimeString;
    },
};

export const siyuan = {
    async pushMsg(msg: string, timeoutMs = 7000) {
        const url = "/api/notification/pushMsg";
        msg += `<span style="display: none;">${new Date().getTime()}<span>`;
        const response = await fetchSyncPost(url, { msg, timeout: timeoutMs });
        if (response.code != 0) {
            throw Error(`${url}: code=${response.code}, msg=${response.msg}`);
        }
        return response.data;
    },
    async currentTime(secs = 0) {
        return timeUtil.dateFormat(new Date(await siyuan.currentTimeMs(secs)));
    },
    async currentTimeMs(secs = 0) {
        const response = await fetchSyncPost("/api/system/currentTime", {});
        return response.data + secs * 1000;
    },
    async copyFile(src: string, dest: string) {
        return siyuan.call("/api/file/copyFile", { src, dest });
    },
    async readDir(path: string): Promise<{ isDir: boolean, isSymlink: boolean, name: string, updated: string }[]> {
        // await utils_zZmqus5PtYRi.siyuan.readDir("/data/plugins/sy-tomato-plugin/i18n")
        return siyuan.call("/api/file/readDir", { path });
    },
    async performSync(upload = false, mobileSwitch = false) {
        return siyuan.call("/api/sync/performSync", { upload, mobileSwitch });
    },
    async performBootSync() {
        return siyuan.call("/api/sync/performBootSync", {});
    },
    async listCloudSyncDir() {
        return siyuan.call("/api/sync/listCloudSyncDir", {});
    },
    async removeFile(path: string) {
        return siyuan.call("/api/file/removeFile", { path });
    },
    async copyFile2(src: string, dest: string) {
        // await utils_zZmqus5PtYRi.siyuan.copyFile("/data/plugins/sy-tomato-plugin/i18n/empty.xmind","/data/assets/abc.xmind")
        const bs = await siyuan.getFileBinary(src);
        return siyuan.putFile(dest, bs);
    },
    async putFile(path: string, value: any) {
        let file: File;
        if (value instanceof ArrayBuffer) {
            const uint8Array = new Uint8Array(value);
            file = new File([new Blob([uint8Array])], path.split("/").pop());
        } else if (typeof value === "object") {
            file = new File([new Blob([JSON.stringify(value)], {
                type: "application/json"
            })], path.split("/").pop());
        } else {
            file = new File([new Blob([value])], path.split("/").pop());
        }
        const formData = new FormData();
        formData.append("path", path);
        formData.append("file", file);
        formData.append("isDir", "false");
        const method = "POST";
        const resp = await fetch("/api/file/putFile", {
            method,
            body: formData,
        });
        const data = await resp.json();
        if (data.code && data.code != 0) {
            console.error("code=%s %s", data.code, data.msg);
            return null;
        }
        return data.data;
    },
    async getFileBinary(path: string): Promise<ArrayBuffer> {
        try {
            const method = "POST";
            const headers = { "Content-Type": "application/json" };
            const response = await fetch("/api/file/getFile", {
                method,
                headers,
                body: JSON.stringify({ path }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const blobData = await response.blob();
            return blobData.arrayBuffer();
        } catch (error) {
            console.error("Error fetching file binary:", error);
            throw error; // re-throw the error so it can be caught by the caller, if needed  
        }
    },
    async getFile(path: string) {
        const method = "POST";
        const headers = { "Content-Type": "application/json" };
        const data = await fetch("/api/file/getFile", {
            method,
            headers,
            body: JSON.stringify({ path }),
        });
        return data.text();
    },
    async getJson(path: string) {
        const txt = await siyuan.getFile(path);
        try {
            return JSON.parse(txt);
        } catch (e) {
            console.error(e)
        }
    },
    // =================================
    async call(url: string, reqData: any) {
        const method = "POST";
        const headers = { "Content-Type": "application/json" };
        try {
            const data = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(reqData),
            });
            const json = await data.json();
            if (json?.code && json?.code != 0) {
                console.warn(`p5: ${json?.code} ${json?.msg} ${JSON.stringify(reqData)}`);
                return null;
            }
            if (json?.data === undefined)
                return data;
            return json.data;
        } catch (e) {
            console.warn(e, url, reqData);
        }
    },
    transSetAttrViewColWrap(avID: string, blockID: string, colID: string, wrap = true) {
        const op = {} as IOperation;
        op.action = "setAttrViewColWrap";
        op.avID = avID;
        op.blockID = blockID;
        op.id = colID;
        op.data = wrap;
        return op;
    },
    transSetAttrViewColHidden(avID: string, blockID: string, colID: string, hide = true) {
        const op = {} as IOperation;
        op.action = "setAttrViewColHidden";
        op.avID = avID;
        op.blockID = blockID;
        op.id = colID;
        op.data = hide
        return op;
    },
    transSetAttrViewSorts(avID: string, blockID: string, colID: string, order: "ASC" | "DESC") {
        const op = {} as IOperation;
        op.action = "setAttrViewSorts";
        op.avID = avID;
        op.blockID = blockID;
        op.data = [{ column: colID, order }]
        return op;
    },
    transSetAttrViewColCalc(avID: string, blockID: string, colID: string, operator: CalcOperator) {
        const op = {} as IOperation;
        op.action = "setAttrViewColCalc";
        op.avID = avID;
        op.data = { operator };
        op.blockID = blockID;
        op.id = colID;
        return op;
    },
    transSetAttrViewFilters(avID: string, blockID: string, filters: IAVFilter[]) {
        const op = {} as IOperation;
        op.action = "setAttrViewFilters";
        op.avID = avID;
        op.data = filters;
        op.blockID = blockID;
        return op;
    },
    transSetAttrViewViewName(avID: string, viewID: string, name: string) {
        const op = {} as IOperation;
        op.action = "setAttrViewViewName";
        op.avID = avID;
        op.id = viewID;
        op.data = name;
        return op;
    },
    transUpdateAttrViewCol(avID: string, colId: string, name: string, type?: TAVCol) {
        const op = {} as IOperation;
        op.action = "updateAttrViewCol";
        op.id = colId;
        op.avID = avID;
        op.name = name;
        op.type = type;
        return op;
    },
    transSetAttrViewName(avID: string, name: string) {
        const op = {} as IOperation;
        op.action = "setAttrViewName";
        op.id = avID;
        op.data = name;
        return op;
    },
    transRemoveAttrViewCol(avID: string, colID: string) {
        const op = {} as IOperation;
        op.action = "removeAttrViewCol";
        op.avID = avID;
        op.id = colID;
        return op;
    },
    transAddAttrViewCol(avID: string, name: string, id = NewNodeID(), type: TAVCol = "text", previousID = "") {
        const op = {} as IOperation;
        op.action = "addAttrViewCol";
        op.avID = avID;
        op.name = name;
        op.previousID = previousID;
        op.type = type;
        op.id = id;
        return op;
    },
    transUpdateAttrViewCellBatch(args: { avID: string, cellID?: string, colID: string, rowID_BlockID: string, value: IAVCellValue }[]) {
        return args.map(arg => {
            const op = {} as IOperation;
            op.action = "updateAttrViewCell";
            op.avID = arg.avID;
            op.id = arg.cellID;
            op.keyID = arg.colID;
            op.rowID = arg.rowID_BlockID;
            op.data = arg.value;
            return op;
        })
    },
    transInsertAttrViewBlock(avID: string, blockID: string, srcs: IOperationSrcs[], previousID = "", ignoreFillFilter = true) {
        const op = {} as IOperation;
        op.action = "insertAttrViewBlock";
        op.avID = avID;
        op.blockID = blockID;
        op.previousID = previousID;
        op.ignoreFillFilter = ignoreFillFilter;
        op.srcs = srcs;
        return op;
    },
    transDoUpdateUpdated(blockID: string, data = timeUtil.getYYYYMMDDHHmmss()) {
        const op = {} as IOperation;
        op.action = "doUpdateUpdated";
        op.id = blockID
        op.data = data
        return op;
    },
    async getAttributeView(id: string): Promise<GetAttributeView> {
        return siyuan.call("/api/av/getAttributeView", { id });
    },
    async renderAttributeView(id: string, pageSize = 50, page = 1, query = "", viewID = ""): Promise<RenderAttributeView> {
        return siyuan.call("/api/av/renderAttributeView", { id, pageSize, query, page, viewID });
    },
    async removeUnusedAsset(path: string): Promise<{ path: string }> {
        return siyuan.call("/api/asset/removeUnusedAsset", { path });
    },
    async removeUnusedAssets(): Promise<{ paths: string[] }> {
        return siyuan.call("/api/asset/removeUnusedAssets", {});
    },
    async getMissingAssets(): Promise<{ missingAssets: string[] }> {
        return siyuan.call("/api/asset/getMissingAssets", {});
    },
    async getUnusedAssets(): Promise<{ unusedAssets: string[] }> {
        return siyuan.call("/api/asset/getUnusedAssets", {});
    },
    async getDocCreateSavePath(notebookID: string): Promise<{ path: string }> {
        const notebook = notebookID;
        return siyuan.call("/api/filetree/getDocCreateSavePath", { notebook });
    },
    async getRefCreateSavePath(notebookID: string): Promise<{ path: string }> {
        const notebook = notebookID;
        return siyuan.call("/api/filetree/getRefCreateSavePath", { notebook });
    },
    async openNotebook(notebookID: string) {
        const notebook = notebookID;
        return siyuan.call("/api/notebook/openNotebook", { notebook });
    },
    async lsNotebooks(closed?: boolean): Promise<LsNotebook[]> {
        const resp = await siyuan.call("/api/notebook/lsNotebooks", {});
        if (closed == null) {
            return resp["notebooks"];
        }
        const l = [];
        for (const book of resp["notebooks"]) {
            if (book.closed === closed) {
                l.push(book);
            }
        }
        return l;
    },
    async sqlAsset(stmt: string): Promise<Asset[]> {
        // from assets
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlSpan(stmt: string): Promise<Span[]> {
        // from spans
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlRef(stmt: string): Promise<Ref[]> {
        // from refs
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlAttr(stmt: string): Promise<Attributes[]> {
        // from attributes
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sql(stmt: string): Promise<Block[]> {
        // from blocks
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlOne(stmt: string): Promise<Block> {
        const ret = await siyuan.sql(stmt);
        if (ret.length >= 1) {
            return ret[0];
        }
        return {} as Block;
    },
    async getParentRowByID(id: string) {
        if (id) {
            return siyuan.sql(`select * from blocks where id in (
                select parent_id from blocks where id="${id}" limit 1
            ) limit 1`).then(rows => rows?.at(0));
        }
    },
    async getDocRowsByName(name: string): Promise<Block[]> {
        if (!name) return []
        return siyuan.sql(`select * from blocks where content="${name}" and type="d" limit 10000000`)
    },
    async getDocAttrs(docID: string, name: string): Promise<Attributes[]> {
        return siyuan.sqlAttr(`select * from attributes where root_id="${docID}" and name="${name}"`);
    },
    async getBlockIndex(id: string): Promise<number> {
        return await siyuan.call("/api/block/getBlockIndex", { id });
    },
    async getBlocksIndexes(ids: string[]): Promise<Record<string, number>> {
        return await siyuan.call("/api/block/getBlocksIndexes", { ids });
    },
    async getBlockBreadcrumb(id: string, excludeTypes: string[] = []): Promise<BreadcrumbPath[]> {
        return await siyuan.call("/api/block/getBlockBreadcrumb", { id, excludeTypes });
    },
    async setUILayout(layout: Config.IUiLayout) {
        return siyuan.call("/api/system/setUILayout", { layout });
    },
    async getConf(): Promise<{ conf: Config.IConf, start: boolean }> {
        return siyuan.call("/api/system/getConf", {});
    },
    async flushTransaction(): Promise<any> {
        return await siyuan.call("/api/sqlite/flushTransaction", {});
    },
    async createDocWithMdIfNotExists(notebookID: string, path_readable: string, markdown: string, attr?: AttrType): Promise<string> {
        return navigator.locks.request("tomato.siyuan.createDocWithMdIfNotExists", { mode: "exclusive" }, async (_lock) => {
            const row = await siyuan.sqlOne(`select id from blocks where box="${notebookID}" and hpath="${path_readable}" and type='d' limit 1`);
            const docID = row?.id ?? "";
            if (!docID) {
                return siyuan.createDocWithMd(notebookID, path_readable, markdown, "", attr);
            }
            return docID;
        });
    },
    async createDocWithMd(notebookID: string, path_readable: string, markdown: string, id = "", attr?: any) {
        const notebook = notebookID;
        const path = path_readable;
        let params: any;
        if (id) {
            params = { notebook, path, markdown, id };
        } else {
            params = { notebook, path, markdown };
        }
        id = await siyuan.call("/api/filetree/createDocWithMd", params);
        if (attr) await siyuan.setBlockAttrs(id, attr);
        return id;
    },
    async getDocRowByBlockID(id: string) {
        return siyuan.sqlOne(`select * from blocks where id in (select root_id from blocks where id="${id}") limit 1`);
    },
    async removeDoc(notebookID: string, path_not_readable: string) {
        return siyuan.call("/api/filetree/removeDoc", { notebook: notebookID, path: path_not_readable });
    },
    async renameDocByID(docID: string, title: string) {
        const row = await siyuan.sqlOne(`select box,path from blocks where type='d' and id="${docID}"`);
        if (row?.box && row?.path) {
            return siyuan.renameDoc(row.box, row.path, title);
        }
    },
    async renameDoc(notebookID: string, path_not_readable: string, title: string) {
        return siyuan.call("/api/filetree/renameDoc", { notebook: notebookID, title, path: path_not_readable });
    },
    async moveDocs(fromPaths: string[], toPath: string, toNotebook: string, callback?: string) {
        if (callback)
            return siyuan.call("/api/filetree/moveDocs", { fromPaths, toPath, toNotebook, callback });
        return siyuan.call("/api/filetree/moveDocs", { fromPaths, toPath, toNotebook });
    },
    async duplicateDoc(id: string): Promise<{ "id": string, "notebook": string, "path": string, "hPath": string }> {
        return siyuan.call("/api/filetree/duplicateDoc", { id });
    },
    async removeDocByIDSiyuan(docID: string) {
        return siyuan.call("/api/filetree/removeDocByID", { id: docID });
    },
    async removeDocByID(docID: string) {
        let count = 10;
        while (count-- > 0) {
            const row = await this.sqlOne(`select box, path from blocks where id="${docID}" and type="d"`);
            const box = row?.box ?? "";
            const path = row?.path ?? "";
            if (box && path) {
                return siyuan.removeDoc(box, path);
            }
            await sleep(1000);
        }
        return {};
    },
    async insertLocalAssets(id: string, assetPaths: string, isUpload = false): Promise<any> {
        return siyuan.call("/api/asset/insertLocalAssets", { id, assetPaths, isUpload });
    },
    async getDocOutline(id: string): Promise<GetDocOutline[]> {
        return siyuan.call("/api/outline/getDocOutline", { id });
    },
    async resolveAssetPath(path: string): Promise<string> {
        // get abs path in the OS.
        return siyuan.call("/api/asset/resolveAssetPath", { path });
    },
    async renameAsset(oldPath: string, newName: string): Promise<any> {
        // copy file to assets/ and then raname
        return siyuan.call("/api/asset/renameAsset", { oldPath, newName });
    },
    async createSnapshot(memo = "created by sy-tomato-plugin") {
        const ret = await siyuan.call("/api/repo/createSnapshot", { memo });
        siyuan.pushMsg("snapshot created");
        return ret;
    },
    async purgeRepo() {
        return siyuan.call("/api/repo/purgeRepo", {});
    },
    async purgeCloudRepo() {
        return siyuan.call("/api/repo/purgeCloudRepo", {});
    },
    async getDocImageAssets(id: string): Promise<string[]> {
        // find and list images only
        return siyuan.call("/api/asset/getDocImageAssets", { id });
    },
    async transferBlockRef(fromID: string, toID: string, reloadUI = true): Promise<any> {
        return siyuan.call("/api/block/transferBlockRef", { fromID, toID, reloadUI });
    },
    async createDailyNote(notebook: string): Promise<{ id: string }> {
        return siyuan.call("/api/filetree/createDailyNote", { notebook });
    },
    async checkBlockExist(id: string): Promise<boolean> {
        if (!id) return false;
        return siyuan.call("/api/block/checkBlockExist", { id });
    },
    async getBlockDOM(id: string): Promise<{ dom: string, id: string }> {
        return siyuan.call("/api/block/getBlockDOM", { id });
    },
    async setBlockAttrs(id: string, attrs: AttrType) {
        return siyuan.call("/api/attr/setBlockAttrs", { id, attrs });
    },
    transbatchSetBlockAttrs(blockAttrs: { id: string, attrs: AttrType }[]) {
        return blockAttrs.map(b => {
            const op = {} as IOperation;
            op.action = "setAttrs";
            op.id = b.id;
            op.data = JSON.stringify(b.attrs);
            return op;
        });
    },
    async batchSetBlockAttrsTrans(blockAttrs: { id: string, attrs: AttrType }[]) {
        return siyuan.transactions(siyuan.transbatchSetBlockAttrs(blockAttrs));
    },
    transBatchUpdateAttrs(blockAttrs: { id: string, old: AttrType, new: AttrType }[]) {
        return blockAttrs.map(b => {
            const op = {} as IOperation;
            op.action = "updateAttrs";
            op.id = b.id;
            op.data = JSON.stringify({ old: b.old, new: b.new });
            return op;
        });
    },
    async batchUpdateAttrsTrans(blockAttrs: { id: string, old: AttrType, new: AttrType }[]) {
        return siyuan.transactions(siyuan.transBatchUpdateAttrs(blockAttrs));
    },
    async batchSetBlockAttrs(blockAttrs: { id: string, attrs: AttrType }[]) {
        if (blockAttrs.length > 0) return siyuan.call("/api/attr/batchSetBlockAttrs", { blockAttrs });
    },
    async batchGetBlockAttrs(ids: string[]): Promise<{ [blockID: string]: AttrType }> {
        return siyuan.call("/api/attr/batchGetBlockAttrs", { ids });
    },
    async getBlockAttrs(id: string): Promise<AttrType> {
        const r = await siyuan.call("/api/attr/getBlockAttrs", { id });
        return r ?? {}
    },
    async getNotebookConf(notebookID: string): Promise<GetNotebookConf> {
        return siyuan.call("/api/notebook/getNotebookConf", { "notebook": notebookID });
    },
    async getDocIDByBlockID(id: string): Promise<string> {
        if (!id) return ""
        const row = await siyuan.sqlOne(`select root_id from blocks where id='${id}'`);
        return row["root_id"] ?? "";
    },
    async getRowByID(id: string) {
        const row = await siyuan.sqlOne(`select * from blocks where id='${id}'`);
        return row;
    },
    async getRows(chilrenIDs: string[], selected = "*", ordered = true, ands: string[] = [], allowNull = false): Promise<Block[]> {
        if (!chilrenIDs || chilrenIDs.length == 0) return [];
        selected = selected.trim();
        if (selected != "*") {
            const s = new Set(selected.split(","));
            s.add("id");
            selected = [...s.values()].join(",");
        }
        const placeholders = chilrenIDs.map(id => `"${id}"`).join(",");
        const sqlBuilder = [];
        sqlBuilder.push(`SELECT ${selected} FROM blocks WHERE id IN (${placeholders})`);
        ands.forEach(a => sqlBuilder.push("AND " + a));
        sqlBuilder.push("limit 100000000");
        const rows = await siyuan.sql(sqlBuilder.join(" "));
        if (ordered) {
            const rowMap = rows.reduce((m, r) => {
                m.set(r.id, r);
                return m;
            }, new Map());
            if (allowNull) {
                return chilrenIDs.map(id => rowMap.get(id));
            } else {
                return chilrenIDs.map(id => rowMap.get(id)).filter(i => i != null);
            }
        }
        return rows;
    },
    async getChildBlocks(id: string): Promise<GetChildBlocks[]> {
        if (!id) return [];
        return siyuan.call("/api/block/getChildBlocks", { id });
    },
    async getIDsByHPath(hpath: string, notebookID: string) {
        // return ['20231102203317-gj54aex']
        return siyuan.call("/api/filetree/getIDsByHPath", { path: hpath, notebook: notebookID });
    },
    async getTag(sort: number) {
        return siyuan.call("/api/tag/getTag", { sort });
    },
    async copyStdMarkdown(id: string): Promise<string> {
        if (!id) return ""
        return siyuan.call("/api/lute/copyStdMarkdown", { id });
    },
    async copyStdMarkdownForPromptKeepTitle(id: string): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("---").at(0)
    },
    async copyStdMarkdownForPromptWithoutTitle(id: string): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("---").at(0).split("\n").slice(1).join("\n")
    },
    async copyStdMarkdownWithoutTitle(id: string): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("\n").slice(1).join("\n")
    },
    async copyStdMarkdownForPromptLastN(id: string, num: number): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("---").slice(-num).join("\n")
    },
    async getContentWordCount(content: string): Promise<GetBlocksWordCount> {
        return siyuan.call("/api/block/getContentWordCount", { content });
    },
    async getBlocksWordCount(ids: string[]): Promise<GetBlocksWordCount> {
        // if ids.length > 1, like wordCount will be the sum of blocks.
        return siyuan.call("/api/block/getBlocksWordCount", { ids });
    },
    // don't append to doc after clearAll
    async clearAll(docID: string) {
        const blocks = await siyuan.getChildBlocks(docID);
        return siyuan.deleteBlocks(blocks.map((b: any) => b["id"]));
    },
    transDeleteBlocks(ids: string[]) {
        return ids?.map(id => {
            const op = {} as IOperation;
            op.action = "delete";
            op.id = id;
            return op;
        }) ?? [];
    },
    async deleteBlock(id: string) {
        return siyuan.call("/api/block/deleteBlock", { id });
    },
    async deleteBlocks(ids: string[]) {
        if (ids?.length > 0)
            return siyuan.transactions(siyuan.transDeleteBlocks(ids));
    },
    transMoveBlocksAfter(ids: string[], previousID: string) {
        return ids.slice().reverse().map(id => {
            const op = {} as IOperation;
            op.action = "move";
            op.id = id;
            op.previousID = previousID;
            return op;
        });
    },
    async moveBlocksAfter(ids: string[], previousID: string) {
        return siyuan.transactions(siyuan.transMoveBlocksAfter(ids, previousID));
    },
    async moveBlockAfter(id: string, previousID: string) {
        return siyuan.call("/api/block/moveBlock", { id, previousID });
    },
    async moveBlockAsChild(id: string, parentID: string) {
        return siyuan.call("/api/block/moveBlock", { id, parentID });
    },
    transMoveBlocksAsChild(ids: string[], parentID: string) {
        return ids.slice().reverse().map(id => {
            const op = {} as IOperation;
            op.action = "move";
            op.id = id;
            op.parentID = parentID;
            return op;
        });
    },
    async moveBlocksAsChild(ids: string[], parentID: string) {
        return siyuan.transactions(siyuan.transMoveBlocksAsChild(ids, parentID));
    },
    async getDocLastID(id: string) {
        return siyuan.getTailChildBlocks(id, 1).then(r => r?.at(0)?.id)
    },
    async getTailChildBlocks(id: string, n: number): Promise<[{ id: string, type: string }]> {
        return siyuan.call("/api/block/getTailChildBlocks", { id, n });
    },
    async getBlockKramdown(id: string): Promise<GetBlockKramdown> {
        return siyuan.call("/api/block/getBlockKramdown", { id });
    },
    async refreshVirtualBlockRef() {
        return siyuan.call("/api/setting/refreshVirtualBlockRef", {});
    },
    async setAppearance(conf: Config.IAppearance) {
        return siyuan.call("/api/setting/setAppearance", conf);
    },
    async updateBlock(id: string, data: string, dataType = "markdown") {
        return siyuan.call("/api/block/updateBlock", { id, data, dataType });
    },
    async safeUpdateBlock(id: string, data: string, dataType = "markdown") {
        let i = 20;
        do {
            const e = await siyuan.checkBlockExist(id);
            if (e) {
                return siyuan.call("/api/block/updateBlock", { id, data, dataType });
            }
            await sleep(400);
        } while (--i > 0);
    },
    transUpdateBlocks(ops: { id: string, domStr: string }[]) {
        ops = ops.filter(op => !!op.id);
        if (!(ops.length > 0)) return [];
        return ops.map(({ id, domStr }) => {
            const op = {} as IOperation;
            op.action = "update"; // dom
            op.id = id;
            op.data = domStr;
            return op;
        });
    },
    async updateBlocks(ops: { id: string, domStr: string }[]) {
        return siyuan.transactions(siyuan.transUpdateBlocks(ops));
    },
    async getBlockMarkdownAndContent(id: string): Promise<GetBlockMarkdownAndContent> {
        const row = await siyuan.sqlOne(`select markdown, content from blocks where id="${id}"`);
        return { markdown: row?.markdown ?? "", content: row?.content ?? "", id };
    },
    async transactions(doOperations: IOperation[], undoOperations: IOperation[] = []) {
        if (doOperations.length == 0 && undoOperations.length == 0) return;
        return siyuan.call("/api/transactions", {
            session: Constants.SIYUAN_APPID,
            app: Constants.SIYUAN_APPID,
            transactions: [{
                doOperations, undoOperations
            }],
            reqId: new Date().getTime(),
        });
    },
    async getHeadingDeleteTransaction(id: string): Promise<{ timestamp: number, doOperations: IOperation[], undoOperations: IOperation[] }> {
        return siyuan.call("/api/block/getHeadingDeleteTransaction", { id });
    },
    async getHeadingChildrenIDs(id: string): Promise<string[]> {
        return siyuan.call("/api/block/getHeadingChildrenIDs", { id });
    },
    async getHeadingChildrenDOM(id: string) {
        return siyuan.call("/api/block/getHeadingChildrenDOM", { id });
    },
    async listDocsByPath(notebookID: string, notReadablePath: string, sort = 15): Promise<RetListDocsByPath> {
        return siyuan.call("/api/filetree/listDocsByPath", { notebook: notebookID, path: notReadablePath, sort });
    },
    async listDocTree(notebookID: string, notReadablePath: string): Promise<RetListDocTree> {
        return siyuan.call("/api/filetree/listDocTree", { notebook: notebookID, path: notReadablePath });
    },
    async getRefIDs(id: string) {
        return siyuan.call("/api/block/getRefIDs", { id });
    },
    async getBackmentionDoc(defID: string, refTreeID: string, keyword: string = ""): Promise<GetBackmentionDoc> {
        const containChildren = (Siyuan.config.editor as any).backlinkContainChildren;
        const args = { defID, refTreeID, keyword, containChildren };
        return siyuan.call("/api/ref/getBackmentionDoc", args);
    },
    async getBacklinkDoc(defID: string, refTreeID: string, keyword: string = ""): Promise<GetBacklinkDoc> {
        const containChildren = (Siyuan.config.editor as any).backlinkContainChildren;
        const args = { defID, refTreeID, keyword, containChildren };
        return siyuan.call("/api/ref/getBacklinkDoc", args);
    },
    async getBacklink2(id: string, k = "", mk = "", sort = "3", mSort = "3"): Promise<GetBacklink2> {
        const containChildren = (Siyuan.config.editor as any).backlinkContainChildren;
        //     SortModeNameASC                // 0：文件名字母升序
        //     SortModeNameDESC               // 1：文件名字母降序
        //     SortModeUpdatedASC             // 2：文件更新时间升序
        //     SortModeUpdatedDESC            // 3：文件更新时间降序
        //     SortModeAlphanumASC            // 4：文件名自然数升序
        //     SortModeAlphanumDESC           // 5：文件名自然数降序
        //     SortModeCustom                 // 6：自定义排序
        //     SortModeRefCountASC            // 7：引用数升序
        //     SortModeRefCountDESC           // 8：引用数降序
        //     SortModeCreatedASC             // 9：文件创建时间升序
        //     SortModeCreatedDESC            // 10：文件创建时间降序
        //     SortModeSizeASC                // 11：文件大小升序
        //     SortModeSizeDESC               // 12：文件大小降序
        //     SortModeSubDocCountASC         // 13：子文档数升序
        //     SortModeSubDocCountDESC        // 14：子文档数降序
        //     SortModeFileTree               // 15：使用文档树排序规则
        //     SortModeUnassigned = 256       // 256：未指定排序规则，按照笔记本优先于文档树获取排序规则
        const args = { id, k, mk, sort, mSort, containChildren };
        return siyuan.call("/api/ref/getBacklink2", args);
    },
    async appendDailyNoteBlock(notebook: string, data: string, dataType = "markdown"): Promise<gconst.TransactionData[]> {
        return siyuan.call("/api/block/appendDailyNoteBlock", { notebook, data, dataType });
    },
    async prependDailyNoteBlock(notebook: string, data: string, dataType = "markdown"): Promise<gconst.TransactionData[]> {
        return siyuan.call("/api/block/prependDailyNoteBlock", { notebook, data, dataType });
    },
    async insertBlockAfter(data: string, previousID: string, dataType = "markdown") {
        return siyuan.call("/api/block/insertBlock", { data, dataType, previousID });
    },
    async insertBlockBefore(data: string, nextID: string, dataType = "markdown") {
        return siyuan.call("/api/block/insertBlock", { data, dataType, nextID });
    },
    async insertBlockAsChildOf(data: string, parentID: string, dataType = "markdown") {
        return siyuan.call("/api/block/insertBlock", { data, dataType, parentID });
    },
    transInsertBlocksBefore(domStrs: string[], nextID: string) {
        return domStrs.slice().reverse().map(data => {
            const op = {} as IOperation;
            op.action = "insert";
            op.data = data;
            op.nextID = nextID;
            return op;
        });
    },
    transInsertBlocksAfter(domStrs: string[], previousID: string) {
        return domStrs.slice().reverse().map(data => {
            const op = {} as IOperation;
            op.action = "insert";
            op.data = data;
            op.previousID = previousID;
            return op;
        });
    },
    transInsertBlocksAsChildOf(domStrs: string[], parentID: string) {
        return domStrs.slice().reverse().map(data => {
            const op = {} as IOperation;
            op.action = "insert";
            op.data = data;
            op.parentID = parentID;
            return op;
        });
    },
    async insertBlocksAfter(domStrs: string[], id: string) {
        if (!id) return;
        return siyuan.transactions(siyuan.transInsertBlocksAfter(domStrs, id));
    },
    async insertBlocksAsChildOf(domStrs: string[], parentID: string) {
        return siyuan.transactions(siyuan.transInsertBlocksAsChildOf(domStrs, parentID));
    },
    transAppendBlocks(ids: string[], parentID: string) {
        return ids.map(id => {
            const op = {} as IOperation;
            op.action = "append";
            op.id = id;
            op.parentID = parentID;
            return op;
        });
    },
    async appendBlocks(domStrs: string[], parentID: string) {
        const tail = await siyuan.getTailChildBlocks(parentID, 1).then(i => {
            if (i) return i[0]?.id
        })
        if (tail) return siyuan.transactions(siyuan.transInsertBlocksAfter(domStrs, tail));
    },
    async appendBlock(data: string, parentID: string, dataType = "markdown"): Promise<gconst.TransactionData[]> {
        return siyuan.call("/api/block/appendBlock", { data, dataType, parentID });
    },
    async checkUpdate(showMsg = false) {
        return siyuan.call("/api/system/checkUpdate", { showMsg });
    },
    async getBlockInfo(id: string): Promise<GetBlockInfo> {
        return siyuan.call("/api/block/getBlockInfo", { id });
    },
    async getDocInfo(id: string): Promise<GetDocInfo> {
        return siyuan.call("/api/block/getDocInfo", { id });
    },
    async removeBookmarks(docID: string, keepBlockID: string) {
        const bookmark = "";
        const rows = await siyuan.sql(`select id from blocks where root_id='${docID}' and ial like '%bookmark=%' limit 1000`);
        for (const row of rows) {
            const id = row["id"];
            if (keepBlockID === id) continue;
            await siyuan.setBlockAttrs(id, { bookmark });
        }
    },
    async addBookmark(id: string, bookmark: string) {
        return siyuan.setBlockAttrs(id, { bookmark });
    },
    async getTreeRiffCardsAll(id: string): Promise<GetCardRetBlock[]> {
        const total: GetCardRetBlock[] = [];
        for (let i = 1; ; i++) {
            const ret = await siyuan.getTreeRiffCards(id, i);
            if (!ret?.blocks) break;
            total.push(...ret.blocks);
            if (total.length >= ret.total) break;
            if (i >= ret.pageCount + 3) break;
        }
        return total;
    },
    async getTreeRiffCards(id: string, page: number, pageSize = 10000): Promise<GetCardRet> {
        return siyuan.call("/api/riff/getTreeRiffCards", { id, page, pageSize });
    },
    transAddRiffCards(blockIDs: string[]) {
        const op = {} as IOperation;
        op.action = "addFlashcards";
        op.deckID = Constants.QUICK_DECK_ID
        op.blockIDs = blockIDs;
        return op;
    },
    transRemoveRiffCards(blockIDs: string[]) {
        const op = {} as IOperation;
        op.action = "removeFlashcards";
        op.deckID = Constants.QUICK_DECK_ID
        op.blockIDs = blockIDs;
        return op;
    },
    async addRiffCards(blockIDs: Array<string>, deckID = Constants.QUICK_DECK_ID): Promise<AddRiffCards> {
        return siyuan.call("/api/riff/addRiffCards", { blockIDs, deckID });
    },
    async skipReviewRiffCard(cardID: string, deckID = Constants.QUICK_DECK_ID) {
        return siyuan.call("/api/riff/skipReviewRiffCard", { cardID, deckID });
    },
    async reviewRiffCard(cardID: string, rating: number, deckID = Constants.QUICK_DECK_ID) {
        return siyuan.call("/api/riff/reviewRiffCard", { cardID, rating, deckID });
    },
    async reviewRiffCardByBlockID(blockID: string, rating: number, deckID = Constants.QUICK_DECK_ID) {
        const all = await siyuan.getRiffCardsByBlockIDs([blockID]);
        if (all.has(blockID)) {
            const card = all.get(blockID).slice().pop();
            if (card) {
                return siyuan.reviewRiffCard(card.riffCardID, rating, deckID);
            }
        }
    },
    async getRiffCards(page = 1, pageSize = 1000, deckID = ""): Promise<GetCardRet> {
        return siyuan.call("/api/riff/getRiffCards", { "id": deckID, page, pageSize });
    },
    async getRiffCardsByBlockIDs(blockIDs: string[]) {
        const ret: GetCardRet = await siyuan.call("/api/riff/getRiffCardsByBlockIDs", { blockIDs });
        return ret?.blocks?.reduce((m, b) => {
            const cs = m.get(b.id) ?? [];
            cs.push(b);
            m.set(b.id, cs);
            return m;
        }, new Map<string, GetCardRetBlock[]>());
    },
    async batchSetRiffCardsDueTimeByBlockID(blockDues: { id: string, due: string }[]) {
        const all = await siyuan.getRiffCardsByBlockIDs(blockDues.map(c => c.id));
        const cardDues = blockDues.map(block => {
            return all.get(block.id)?.map(card => {
                return { id: card.riffCardID, due: block.due };
            });
        }).filter(c => !!c).flat();
        return siyuan.batchSetRiffCardsDueTimeByCardID(cardDues);
    },
    async batchSetRiffCardsDueTimeByCardID(cardDues: { id: string, due: string }[]) {
        // "due": "20240224214412"
        return siyuan.call("/api/riff/batchSetRiffCardsDueTime", { cardDues });
    },
    async getRiffCardsAll(pageSize = 1000) {
        const total: Map<string, GetCardRetBlock[]> = new Map();
        // let j = 0;
        for (let i = 1; ; i++) {
            const ret = await siyuan.getRiffCards(i, pageSize);
            if (!ret?.blocks) break;
            ret.blocks.forEach(i => { // 存在一个块多卡。
                const a = total.get(i.id) ?? [];
                a.push(i);
                total.set(i.id, a);
            });
            // j+=ret.blocks.length;
            // xx.log(total.size, j,ret.total)
            if (total.size >= ret.total) break;
            if (i >= ret.pageCount + 1) break;
        }
        return total;
    },
    async getRiffDueCards(deckID = ""): Promise<GetDueCardRet> {
        return siyuan.call("/api/riff/getRiffDueCards", { deckID });
    },
    async getRiffDecks() {
        return siyuan.call("/api/riff/getRiffDecks", {});
    },
    async removeRiffCards(blockIDs: Array<string>, deckID = "") {
        if (!blockIDs || blockIDs.length == 0) return null;
        return siyuan.call("/api/riff/removeRiffCards", { deckID, blockIDs });
    },
    async updateEmbedBlock(id: string, content: string) {
        return siyuan.call("/api/search/updateEmbedBlock", { id, content });
    },
    async findListType(thisID: string) {
        let theUpperestListID = "";
        let theMD = "";
        let count = 500;
        while (count > 0) {
            count -= 1;
            const thisBlock = await siyuan.getRowByID(thisID);
            if (!theMD) {
                theMD = thisBlock["content"];
                if (!theMD) theMD = " ";
            }
            const thisType = thisBlock["type"];
            if (thisType === "l") {
                theUpperestListID = thisID;
            }
            else if (thisType === "d" || thisType === undefined) {
                break;
            }
            if (!thisID) break;
            thisID = thisBlock["parent_id"];
            if (!thisType) break;
        }
        return [theUpperestListID, theMD];
    },
    async deleteBlocksUtil() {
        const { aacc1, aacc2 } = await findAACC();
        {
            if (!aacc1?.id) {
                siyuan.pushMsg("aacc1 not found")
                return
            } else if (!aacc2?.id) {
                siyuan.pushMsg("aacc2 not found")
                return
            } else if (aacc1.root_id !== aacc2.root_id) {
                siyuan.pushMsg("aacc1 aacc2 must be in the same doc")
                return
            }
        }
        let doDelete = false;
        const { root: { children } } = await getDocBlocks(aacc1.root_id, "", false, false, 1);
        const blocks = [];
        for (const child of children) {
            if (child.id === aacc1.id) {
                doDelete = true;
            }
            if (doDelete) {
                blocks.push(child.id);
            }
            if (child.id === aacc2.id) break;
        }
        if (blocks.length === 0) {
            return blocks
        }
        await siyuan.deleteBlocks(blocks);
    },
    async moveBlocksUtil(copy = false) {
        const blocks: Block[] = [];
        const { aacc1, aacc2, aacc3 } = await findAACC();
        {
            if (!aacc1?.id) {
                siyuan.pushMsg("aacc1 not found")
                return blocks
            } else if (!aacc2?.id) {
                siyuan.pushMsg("aacc2 not found")
                return blocks
            } else if (!aacc3?.id) {
                siyuan.pushMsg("aacc3 not found")
                return blocks
            } else if (aacc1.root_id !== aacc2.root_id) {
                siyuan.pushMsg("aacc1 aacc2 must be in the same doc")
                return blocks
            }
        }
        {
            let found = false;
            const { root: { children } } = await getDocBlocks(aacc1.root_id, "", false, false, 1);
            for (const child of children) {
                if (child.id === aacc1.id) {
                    found = true;
                    continue;
                }
                if (child.id === aacc2.id) break;
                if (found) {
                    blocks.push(child);
                }
            }
        }
        if (blocks.length === 0) {
            return blocks
        }
        const ops = [];
        if (copy) {
            const htmls = blocks.map(b => {
                const c = cleanDivOnly(b.div);
                b.div = c.div
                b.id = c.newID
                return b.div;
            }).map(div => div.outerHTML);
            ops.push(...siyuan.transInsertBlocksAfter(htmls, aacc3.id));
        } else {
            ops.push(...siyuan.transMoveBlocksAfter(blocks.map(b => b.id), aacc3.id));
        }
        ops.push(...siyuan.transDeleteBlocks([aacc1.id, aacc2.id, aacc3.id]))
        await siyuan.transactions(ops);
        return blocks;
    },
    async getBlockKramdownWithoutID(id: string, newAttrs: string[] = [], prefix?: string, suffix?: string,) {
        const { kramdown } = await siyuan.getBlockKramdown(id);
        const lines: Array<string> = kramdown.split("\n");
        let attrs = lines.pop();
        if (lines.length > 0) {
            if (prefix) {
                lines[0] = prefix + lines[0];
            }
            if (suffix) {
                lines[lines.length - 1] += suffix;
            }
        }
        const IDRegexp = /id="[^"]+"/;
        const RIFFRegexp = /custom-riff-decks="[^"]+"/;
        attrs = attrs.replace(IDRegexp, "");
        attrs = attrs.replace(RIFFRegexp, "");
        if (newAttrs) {
            attrs = attrs.trim();
            attrs = attrs.slice(0, attrs.length - 1); // rm the '}'
            for (const newattr of newAttrs) {
                attrs += " " + newattr + " ";
            }
            attrs += "}";
        }
        if (attrs != "{: }") {
            lines.push(attrs);
        }
        return lines.join("\n");
    },
    async removeBrokenCards(tomatoI18n: TomatoI18n): Promise<{ bigText: string, allIDs: Set<string> }> {
        if (!events.isDesktop) {
            siyuan.pushMsg("can only run in desktop env.");
            return;
        }
        return navigator.locks.request("removeBrokenCardsLock", { ifAvailable: true }, async (lock) => {
            if (!lock) return;
            if (!(await siyuan.getConf())?.conf?.repo?.key) {
                await siyuan.pushMsg(tomatoI18n.你还没秘钥插件无法为您创建本地快照, 0)
                return;
            }
            siyuan.pushMsg(tomatoI18n.正在确认无效闪卡请耐心等待, 1800);
            const bigText = await getAllFilesAsBigText()
            const allIDs = extractIDs(bigText);
            const invalidCardIDs = [];
            for (const card of [...(await siyuan.getRiffCardsAll()).values()].flat()) {
                if (!allIDs.has(card.id)) {
                    invalidCardIDs.push(card.id);
                }
            }
            if (invalidCardIDs.length > 0) {
                const MAX = 10;
                const lnks = invalidCardIDs.slice(0, MAX).map(id => `<a href="siyuan://blocks/${id}">${id}</a>`).join("<br>")
                let suffix = ""
                if (invalidCardIDs.length > MAX) suffix = "<br>……"
                confirm("⚠️" + tomatoI18n.准备删除失效闪卡(invalidCardIDs.length), tomatoI18n.即将创建快照 + "<br>" + lnks + suffix, async () => {
                    await siyuan.createSnapshot(tomatoI18n.清理所有失效的闪卡);
                    await siyuan.removeRiffCards(invalidCardIDs);
                    await siyuan.pushMsg(tomatoI18n.清理所有失效的闪卡 + " : " + invalidCardIDs.length)
                })
            } else {
                confirm("😄", tomatoI18n.没有失效闪卡)
            }
            return { bigText, allIDs }
        });
    },
    async getDocNameByBlockID(blockID: string) {
        let row = await siyuan.sqlOne(
            `select root_id from blocks where id="${blockID}"`,
        );
        if (row?.root_id) {
            row = await siyuan.sqlOne(
                `select content from blocks where id="${row.root_id}"`,
            );
            if (row?.content) {
                return row.content;
            }
        }
        return "";
    }
};

export const siyuanCache = {
    createDocWithMdIfNotExists: createCache(siyuan.createDocWithMdIfNotExists),
    getRiffCardsByBlockIDs: createCache(siyuan.getRiffCardsByBlockIDs),
};

async function findAACC() {
    return await siyuan
        .sql(`select id,root_id,content from blocks where type='p' and content in ("aacc1","aacc2","aacc3")`)
        .then(rows => {
            let aacc1: Block;
            let aacc2: Block;
            let aacc3: Block;
            rows.forEach(row => {
                switch (row.content) {
                    case 'aacc1':
                        aacc1 = row;
                        break;
                    case 'aacc2':
                        aacc2 = row;
                        break;
                    case 'aacc3':
                        aacc3 = row;
                        break;
                }
            });
            return { aacc1, aacc2, aacc3 };
        });
}

export async function getMarkdownsByTrees(ids: string[], boxID = "") {
    const allDocRows: Block[] = await getTreeDocIDs(ids, boxID);

    const mds: Block[] = [];
    for (const rows of chunks(allDocRows, 50)) {
        mds.push(...await Promise.all(rows.map(async row => {
            const md = await siyuan.copyStdMarkdown(row.id);
            row.markdown = md;
            return row;
        })))
        siyuan.pushMsg(`copied: ${mds.length}/${allDocRows.length}`)
    }
    return mds;
}

export async function getBlocksByTrees(ids: string[], excludeID?: string) {
    const allDocRows: Block[] = await getTreeDocIDs(ids);
    const roots: Block[] = [];
    for (const rows of chunks(allDocRows, 50)) {
        roots.push(...await Promise.all(rows
            .filter(row => row.id !== excludeID)
            .map(async row => {
                const { root } = await getDocBlocks(row.id, "", false, false, 1);
                return root;
            })
        ))
        siyuan.pushMsg(`copied: ${roots.length}/${allDocRows.length}`)
    }
    return roots;
}

async function getTreeDocIDs(ids: string[], boxID = "", minUpdated = "", excat = false) {
    let allDocRows: Block[];
    if (boxID) {
        allDocRows = await siyuan.sql(`select id,ial,content,updated,path 
            from blocks where box='${boxID}' and type='d' and updated>'${minUpdated}' 
            order by updated asc limit 999999999`);
    } else {
        let or: string;
        if (excat) {
            const idin = ids.map(id => `"${id}"`).join(",");
            or = `id in (${idin})`;
        } else {
            or = ids.map(id => `path like '%${id}%'`).join(" or ");
        }
        allDocRows = await siyuan.sql(`select id,ial,content,updated,path 
            from blocks where (${or}) and type='d' and updated>'${minUpdated}' 
            order by updated asc limit 999999999`);
    }
    return allDocRows.sort((a, b) => a.path.localeCompare(b.path));
}

export async function getAllFilesAsBigText() {
    return await readAllFiles()
        .then(async pathes => {
            const ret: string[] = []
            for (const ps of chunks(pathes, 50)) {
                const contents = await Promise.all(ps.map(f => siyuan.getFile(f)))
                ret.push(...contents);
            }
            return ret;
        })
        .then(files => files.join(""));
}

export async function cleanDataview(bigText?: string) {
    if (!events.isDesktop) {
        siyuan.pushMsg("can only run in desktop env.");
        return;
    }
    siyuan.pushMsg("Start to delete invalid databases.")
    if (!bigText) {
        await siyuan.createSnapshot("delete invalid databases.");
        bigText = await getAllFilesAsBigText()
    }
    let avIDs = await siyuan.readDir("/data/storage/av")
        .then(list => list.map(i => {
            const parts = i.name.split(".")
            const ext = parts.pop()
            if (ext === "json") {
                return parts.join(".")
            }
        }))
        .then(i => i.filter(j => !!j))
    avIDs = avIDs.filter(id => !bigText.includes(`"AttributeViewID":"${id}"`))
    for (const id of avIDs) {
        await siyuan.removeFile(`/data/storage/av/${id}.json`);
        siyuan.pushMsg("delete database: " + id)
    }
    siyuan.pushMsg(`${avIDs.length} invalid databases have been deleted.`)
}

export function createCache
    <T extends Func, R extends Awaited<ReturnType<T>>, P extends Parameters<T>>
    (originalFunction: T): (...args: [number, ...P]) => Promise<R> {
    const cache = new Map<string, { value: R; timestamp: number }>();
    return async function cachedFunction(cacheTime: number, ...args: P): Promise<R> {
        const currentTime = Date.now();
        for (const [k, v] of cache.entries()) {
            if (currentTime - v.timestamp > cacheTime) {
                cache.delete(k);
            }
        }

        const key = JSON.stringify(args);
        if (cache.has(key)) {
            const { value } = cache.get(key);
            return value;
        }

        const result: R = await originalFunction(...args);
        cache.set(key, { value: result, timestamp: Date.now() });
        return result;
    };
}

function padStart(input: string, targetLength: number, padString: string): string {
    const inputLength = input.length;
    if (inputLength >= targetLength) {
        return input;
    }
    const paddingLength = targetLength - inputLength;
    const padding = padString.repeat(Math.ceil(paddingLength / padString.length)).slice(0, paddingLength);
    return padding + input;
}

export function splitByMiddle(str: string): [string, string] {
    const middleIndex = Math.floor(str.length / 2);
    const part1 = str.substring(0, middleIndex);
    const part2 = str.substring(middleIndex);
    return [part1, part2];
}
export function keepContext(text: string, keyword: string, count: number): string {
    let parts = text.split(keyword);
    if (parts.length == 1) return text;
    {
        const newParts = [];
        newParts.push(parts[0]);
        for (let i = 1; i < parts.length - 1; i++) {
            newParts.push(...splitByMiddle(parts[i]));
        }
        newParts.push(parts[parts.length - 1]);
        parts = newParts;
    }

    for (let i = 0; i < parts.length; i++) {
        const len = parts[i].length;
        if (i % 2 == 0) {
            const start = Math.max(len - count, 0);
            if (start > 0) {
                parts[i] = ".." + parts[i].slice(start, len) + keyword;
            } else {
                parts[i] = parts[i].slice(start, len) + keyword;
            }
        } else {
            if (count < len) {
                parts[i] = parts[i].slice(0, count) + "..";
            } else {
                parts[i] = parts[i].slice(0, count);
            }
        }
    }
    return parts.join("");
}

export function doubleSupRows(text: string, attrStr = "") {
    if (attrStr) attrStr = "\n" + attrStr;
    return `{{{row\n{{{row\n${text}\n}}}\n}}}${attrStr}`;
}

export class TabBuilder {
    private md: string[];
    private colSize: number;
    private haveHead = false;
    private docName: string;
    constructor(docName: string, colSize = 4) {
        if (!colSize || colSize < 2) colSize = 2;
        this.colSize = colSize;
        this.md = [];
        this.docName = docName;
    }
    addRows(...heads: string[]) {
        for (const row of chunks(heads, this.colSize)) {
            if (row.length < this.colSize) {
                const l = row.length;
                for (let i = 0; i < this.colSize - l; i++) {
                    row.push("");
                }
            }
            if (!this.haveHead) {
                this.haveHead = true;
                this.md.push(`|${row.map((_v, idx, arr) => {
                    if (idx == 0) return `{: colspan="${arr.length}" rowspan="1"}《${this.docName}》`;
                    return '{: class="fn__none"}';
                }).join("|")}|`);
                this.md.push(`|${row.map(() => ":---:").join("|")}|`);
            }
            this.md.push(`|${row.join("|")}|`);
        }
    }
    build() {
        return this.md.join("\n");
    }
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

export function saveRestorePagePosition(scrollPositionKey: string, dm: DestroyManager, dialog: HTMLElement, focus = false) {
    if (!dialog || !dm) return;
    function handleScroll() {
        localStorage.setItem(scrollPositionKey, dialog.scrollTop.toString());
    };
    dialog.addEventListener("scroll", handleScroll);
    dm.add(scrollPositionKey, () =>
        dialog.removeEventListener("scroll", handleScroll),
    );
    const savedScroll = localStorage.getItem(scrollPositionKey);
    if (savedScroll) {
        dialog.scrollTop = parseInt(savedScroll, 10);
    }
    if (focus) {
        dialog.focus();
    }
}

export function icon(name: string, size = 20) {
    if (name.startsWith("icon")) name = name.slice(4)
    if (size) {
        return `<svg width="${size}px" height="${size}px"><use xlink:href="#icon${name}"></use></svg>`;
    }
    return `<svg><use xlink:href="#icon${name}"></use></svg>`;
}

export function getDocLastElement(protyle: IProtyle) {
    return protyle?.wysiwyg?.element?.lastElementChild;
}
