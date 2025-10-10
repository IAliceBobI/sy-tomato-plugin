import { Constants, IProtyle, openMobileFileById, openTab, openWindow, Plugin, Tab, TProtyleAction } from "siyuan";
import { events } from "./Events";
import { BLOCK_REF, BlockTypeContainer, BlockTypeContent, ClassActive, CUSTOM_RIFF_DECKS, DATA_ID, DATA_NODE_ID, DATA_NODE_INDEX, DATA_SUBTYPE, DATA_TYPE, SPACE } from "./gconst";
import { chunks, cleanText, getBlockDiv, getContenteditableElement, getDoOperations, NewNodeID, notEmptyStrDo, parseIAL, readAllFiles, removeInvisibleChars, siyuan, siyuanCache, timeUtil } from "./utils";
import { pinyin } from "pinyin-pro";
import { storeAttrManager, tag_to_ref_add_card, tag_to_ref_add_pinyin, toolbarTidyExt } from "./stores";
import { tomatoI18n, TomatoI18n } from "../tomatoI18n";
import { zipNways } from "./functional";
import { DefaultMap } from "./cache";
import { verifyKeyTomato } from "./user";
import { newID } from "stonev5-utils/lib/id";
import { domNewLine, DomSuperBlockBuilder } from "./sydom";

export function isMultiLineElement(md: string) {
    return md.startsWith("```")
        || md.startsWith("> ")
        || md.startsWith("$$")
        || md.startsWith("<div>")
        || md.startsWith("{{{row")
        || md.startsWith("{{{col");
}

export async function moveAllContentToDoc(tobeRmDocID: string, destDocID: string) {
    const ids = (await siyuan.getChildBlocks(tobeRmDocID)).map(b => b.id);
    await siyuan.moveBlocksAsChild(ids, destDocID);
}

export async function moveAllContentHere(tobeRmDocID: string, blockID: string) {
    if (!tobeRmDocID || !blockID) return [];
    const ids = (await siyuan.getChildBlocks(tobeRmDocID)).map(b => b.id);
    await siyuan.moveBlocksAfter(ids, blockID);
    return ids;
}

export async function mergeDocs(doc1: string, hereID: string) {
    if (!doc1 || !hereID) return;
    const doc2 = await siyuan.getDocIDByBlockID(hereID);
    doc1 = await siyuan.getDocIDByBlockID(doc1);
    if (!doc1 || !doc2) return;

    const newAttrs = await mergeMetaIntoDoc2(doc1, doc2);
    const oldAttrs = setDefaultAttr({} as any);
    oldAttrs.title = "moved";
    await siyuan.setBlockAttrs(doc1, oldAttrs); // clean doc1
    await siyuan.setBlockAttrs(doc2, newAttrs); // fulfill doc2
    await moveAllContentHere(doc1, hereID);
    await siyuan.flushTransaction();
    await siyuan.pushMsg(tomatoI18n.正在转移引用);
    await siyuan.transferBlockRef(doc1, doc2, false);
    await siyuan.pushMsg(tomatoI18n.正在尝试删除闪卡);
    await siyuan.removeRiffCards([doc1]);
    await siyuan.pushMsg(tomatoI18n.正在删除老文件);
    await siyuan.removeDocByID(doc1);
    window.location.reload();
}

async function mergeMetaIntoDoc2(doc1: string, doc2: string) {
    const newAttrs = setDefaultAttr(await siyuan.getBlockAttrs(doc2));
    const attrs = setDefaultAttr(await siyuan.getBlockAttrs(doc1));
    delete newAttrs.updated;
    delete newAttrs.id;
    delete newAttrs.scroll;

    const alias = [...newAttrs.alias.split(","), ...attrs.alias.split(","), attrs.name, attrs.title];
    newAttrs.alias = alias.filter(i => i.length > 0).join(",");
    if (!newAttrs.bookmark) {
        newAttrs.bookmark = attrs.bookmark;
    }
    if (!newAttrs.memo) {
        newAttrs.memo = attrs.memo;
    } else {
        if (attrs.memo) {
            newAttrs.memo += "；" + attrs.memo;
        }
    }

    for (const key in attrs) {
        if (key.startsWith("custom-")) {
            if (key == CUSTOM_RIFF_DECKS) continue;
            if (!newAttrs[key]) {
                newAttrs[key] = attrs[key];
            }
        }
    }
    return newAttrs;
}

function setDefaultAttr(attrs: AttrType) {
    if (!attrs.alias) attrs.alias = "";
    if (!attrs.name) attrs.name = "";
    if (!attrs.title) attrs.title = "";
    if (!attrs.memo) attrs.memo = "";
    if (!attrs.bookmark) attrs.bookmark = "";
    return attrs;
}

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

export class SingleTab {
    private openedTab: Tab;
    private plugin: Plugin;
    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }
    async open(id: string, position?: WindowOpenStyle, lastID?: string) {
        if (!id) return;
        this.openedTab?.close();
        // const arg = {
        //     app: this.plugin.app,
        //     doc: {
        //         id,
        //         zoomIn: false,
        //         action: ["cb-get-hl", "cb-get-context"],
        //     },
        // } as Parameters<typeof openTab>[0];
        this.openedTab = await OpenSyFile2(this.plugin, id, position, null, null, lastID);
    }
}

export async function focusSiyuan() {
    if (events.boxID) {
        const { id: dayID } = await siyuan.createDailyNote(events.boxID);
        if (dayID) window.location.href = `siyuan://blocks/${dayID}`;
    }
}

/**
 * @param action ["cb-get-context", "cb-get-focus", "cb-get-hl"]
 * @param position nop 0, front 1, back 2, right 3, bottom 4, move 5
 * @returns 
 */
export async function OpenSyFile2(
    plugin: Plugin,
    docID: string,
    position?: WindowOpenStyle,
    action?: TProtyleAction[],
    afterOpen?: () => void,
    originID?: string,
) {
    if (!docID) return
    if (position == "0" || position == "nop") {
        return;
    } else if (events.isMobile) {
        openMobileFileById(plugin.app, docID);
    } else {
        if (action == null) action = ["cb-get-context", "cb-get-focus"];
        let keepCursor = null;
        switch (position) {
            case "5":
            case "move":
                openWindow({ doc: { id: docID } })
                return;
            case "1":
            case "front":
            default:
                position = null;
                keepCursor = false;
                break;
            case "2":
            case "back":
                position = null;
                keepCursor = true;
                break;
            case "3":
            case "right":
                position = "right"
                keepCursor = true;
                break;
            case "4":
            case "bottom":
                position = "bottom"
                keepCursor = true;
                break;
            case "6":
            case "peek":
                position = null;
                keepCursor = false;
                const tmp = afterOpen;
                afterOpen = () => {
                    if (originID) {
                        setTimeout(() => {
                            openTab({
                                app: plugin.app,
                                doc: { id: originID, action, zoomIn: false },
                                position: position as any,
                                keepCursor,
                            })
                        }, 1500);
                    }
                    if (tmp) tmp();
                }
                break;
        }
        return openTab({
            app: plugin.app,
            doc: { id: docID, action, zoomIn: false },
            position: position as any,
            keepCursor,
            afterOpen,
        });
    }
}

// // recommand: ["cb-get-context", "cb-get-focus"]
// export async function OpenSyFile(plugin: Plugin, docID: string, action?: TProtyleAction[], zoomIn?: boolean, position?: "right" | "bottom", afterOpen?: () => void) {
//     if (events.isMobile) {
//         openMobileFileById(plugin.app, docID);
//     } else {
//         return openTab({
//             app: plugin.app,
//             doc: { id: docID, action, zoomIn },
//             position,
//             afterOpen,
//         });
//     }
// }

export async function getHierarchyConcepts(docName: string) {
    const con = hierarchyArr(docName).map(i => `content="${i}"`);
    con.push(`content like "%${docName}%"`);
    return siyuan
        .sql(`select id,content from blocks where type='d' and ( ${con.join(" or ")} )`)
        .then(rows => rows?.sort((a, b) => a.content.localeCompare(b.content)));
}

function hierarchyArr(text: string) {
    const set = new Set<string>();
    if (text) {
        const pathList = text.replaceAll("丨", "|").split("|").map(i => i.trim()).filter(i => i.length > 0);
        constructPath(pathList.slice());
        constructPath(pathList.slice().reverse());
        pathList.forEach(i => set.add(i));
    }
    return [...set.values()];
    function constructPath(path: string[]) {
        while (path.length > 0) {
            set.add(path.join("|"));
            set.add(path.join(" | "));
            path.pop();
        }
    }
}

export async function tidyAssets(tomatoI18n: TomatoI18n) {
    if (!events.isDesktop) {
        siyuan.pushMsg("can only run in desktop env.");
        return;
    }

    type Modify = { content: string, modified: boolean };
    return navigator.locks.request("tomato-tidyAssets-lock", { ifAvailable: true }, async (lock) => {
        if (lock) {
            if (!(await siyuan.getConf())?.conf?.repo?.key) {
                await siyuan.pushMsg(tomatoI18n.你还没秘钥插件无法为您创建本地快照, 0)
                return;
            }
            const exts = toolbarTidyExt.get()
                .replaceAll(SPACE, " ")
                .split(" ")
                .extend(...Constants.SIYUAN_ASSETS_IMAGE)
                .extend(...Constants.SIYUAN_ASSETS_AUDIO)
                .extend(...Constants.SIYUAN_ASSETS_VIDEO)
                .mapfilter(i => {
                    i = i.trim()
                    if (i) {
                        if (i.startsWith(".")) {
                            return i
                        } else {
                            return "." + i
                        }
                    }
                })
                .map(i => i.toLocaleLowerCase())
                .uniq()

            const files = await readAllFiles().then(async pathes => {
                const ret: [string, string][] = []
                for (const ps of chunks(pathes, 50)) {
                    const contents = await Promise.all(ps.map(f => siyuan.getFile(f)));
                    ret.push(...zipNways(ps, contents));
                    siyuan.pushMsg(`read: ${ret.length}/${pathes.length}`)
                }
                return ret;
            }).then((files) => {
                return files.filter(([_k, f]) => {
                    for (const e of exts) {
                        if (f.includes(e)) return true;
                    }
                }).map(([k, v]) => {
                    return [k, { content: v, modified: false }] as [string, Modify]
                })
            }).then((files) => {
                return new Map(files)
            });
            await siyuan.pushMsg("load all files");
            await siyuan.createSnapshot("tomato-tidyAssets");
            const pics = (await siyuan.readDir("/data/assets"))
                ?.filter(file => !file.isDir && !file.isSymlink)
                ?.filter(file => {
                    const name = file.name.toLowerCase();
                    for (const ext of exts) {
                        if (name.endsWith(ext)) return true;
                    }
                });
            if (!(pics?.length > 0)) {
                siyuan.pushMsg("pics not found")
                return
            }

            const ym = timeUtil.dateFormatDay(new Date()).split("-");
            let i = 0;
            let count = 0;
            let blockCount = 0;
            await siyuan.pushMsg("load all pics");
            for (const fileArr of chunks(pics, 100)) {
                ++i;
                for (const file of fileArr) {
                    const oldpath = `assets/${file.name}`;
                    const newpath = `assets/pics/${ym[0]}/${ym[1]}-${i}/${file.name}`;
                    await siyuan.copyFile2("data/" + oldpath, "data/" + newpath);
                    // const rows = await siyuan.sqlAsset(`select block_id from assets where path='${oldpath}'`)
                    for (let file of files.values()) {
                        if (file.content.includes(oldpath)) {
                            file.content = file.content.replaceAll(oldpath, newpath);
                            file.modified = true;
                            blockCount++;
                        }
                    }
                    await siyuan.removeFile("data/" + oldpath);
                    count++;
                    if (count % 20 === 0) siyuan.pushMsg(tomatoI18n.已经处理了x个块(count, pics.length, blockCount));
                }
            }
            await siyuan.pushMsg("save files");
            const save = [...files.entries()]?.filter(([_k, v]) => v.modified)?.map(([k, v]) => siyuan.putFile(k, v.content))
            if (!(save?.length > 0)) {
                siyuan.pushMsg("no modified files")
                return;
            }

            let saveCount = 0;
            for (const t of chunks(save, 50)) {
                await Promise.all(t);
                saveCount += t.length;
                siyuan.pushMsg(`save: ${saveCount}/${save.length}`)
            }
            siyuan.pushMsg(tomatoI18n.assets整理了x个文件(pics.length))
            window.location.reload();
        } else {
            siyuan.pushMsg(tomatoI18n.assets整理还在进行中)
        }
    })
}

export function getDockByType(type: string) {
    const layout: any = (window.siyuan as any)?.layout;
    if (layout?.leftDock?.data[type] != null) {
        return layout.leftDock.data[type]
    }
    if (layout?.rightDock?.data[type] != null) {
        return layout.rightDock.data[type]
    }
    if (layout?.bottomDock?.data[type] != null) {
        return layout.bottomDock.data[type]
    }
};

export async function locTree(cardID: string) {
    const tree = getDockByType("file");
    if (tree?.selectItem) {
        const info = await siyuan.getBlockInfo(cardID);
        if (info) {
            let notebookId = info.box;
            let path = info.path;
            docTreeOpenClose(false)
            tree.selectItem(notebookId, path);
        }
    }
}

export function gotoFile(lastPart?: HTMLElement) {
    const collapseBtn = document.querySelector('[data-type="collapse"]') as HTMLButtonElement;
    collapseBtn?.click();

    lastPart?.classList?.add(ClassActive);

    const focusBtn = document.querySelector('[data-type="focus"]') as HTMLButtonElement;
    focusBtn?.click();

    lastPart?.classList?.remove(ClassActive);
}

export function docTreeOpenClose(openOrClose = false) {
    const docTreeBtn = document.querySelector('[data-type="file"]') as HTMLButtonElement;
    if (openOrClose) {
        docTreeBtn?.click();
    } else {
        const opened = docTreeBtn.classList.contains("dock__item--active");
        if (!opened) {
            docTreeBtn.click();
        }
    }
}

export async function isReadonly(protyle: IProtyle) {
    return await siyuan.getBlockAttrs(protyle.block.rootID)
        .then(attr => attr["custom-sy-readonly"] ?? "false")
        .then(ro => String(ro));
}

export function locateDoc(lastPart?: HTMLElement, close = false) {
    const docTreeBtn = document.querySelector('[data-type="file"]') as HTMLButtonElement;
    if (docTreeBtn) {
        const opened = docTreeBtn.classList.contains("dock__item--active");
        if (!opened) {
            docTreeBtn.click();
            gotoFile(lastPart);
        } else {
            if (close) {
                docTreeBtn.click();
            } else {
                gotoFile(lastPart);
            }
        }
    }
}

export async function openFileByName(plugin: Plugin, name: string, goEnd = true) {
    const row = await siyuan.sqlOne(`select id from blocks where content="${name}" and type="d" limit 1`)
    if (row?.id) {
        if (goEnd) {
            return OpenSyFile2(plugin, await siyuan.getDocLastID(row.id));
        } else {
            return OpenSyFile2(plugin, row.id);
        }
    }
}

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
                    child.content = removeInvisibleChars(e.textContent, true)
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

// export function getSegments(content: string) {
//     const segmenter = new Intl.Segmenter("zh-Hans-CN", {
//         granularity: "word",
//     });
//     const segments = segmenter.segment(content);
//     return segments;
// }

export function calcWords(content: string) {
    if (!content) return 0;
    let count = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (
            char >= '\u4e00' && char <= '\u9fff' || // 中文字符
            char === '，' || char === '。' || char === '！' || char === '？' || // 中文标点
            char === '；' || char === '：' || char === '“' || char === '”' ||
            char === '‘' || char === '’' || char === '（' || char === '）' ||
            char === '、' || char === '《' || char === '》' || char === '【' ||
            char === '】'
        ) {
            count++;
        }
    }
    return count;
}

export async function getDocTracer(): Promise<DocTracer> {
    function get() {
        return window.tomato_zZmqus5PtYRi_doc_tracer;
    }
    function set(x: DocTracer) {
        window.tomato_zZmqus5PtYRi_doc_tracer = x
    }
    return navigator.locks.request("doctracer2025年3月16日00:48:04", async (lock) => {
        if (lock) {
            if (get()) {
                return get();
            }
            const t = new DocTracer();
            await t.init()
            set(t)
            return t;
        }
    });
}

export class DocTracer {
    private inited = false;
    private timestamp = "";
    private docMap: Map<string, Block> = new Map(); // id->block
    private contentMap: DefaultMap<string, Set<string>> = new DefaultMap(() => new Set()); // content->ids
    getDocMap(): ReadonlyMap<string, Block> {
        return this.docMap as ReadonlyMap<string, Block>;
    }
    match(text: string) {
        const matched = new Map<string, Block>()
        text = text?.trim()?.toLocaleLowerCase();
        if (!text) return [];
        for (const [content, ids] of this.contentMap.entries()) {
            if (text.includes(content)) {
                for (const id of ids) {
                    const block = this.docMap.get(id)
                    if (!block) {
                        ids.delete(id);
                    } else {
                        this.trySetAttrs(block);
                        if (block.titles?.has(content)) { // 最新的block确实有这个content
                            matched.set(block.id, block);
                            // 同时加入此block的别名等
                            block.titles.forEach(title => this.contentMap.get(title).forEach(id => {
                                const block = this.docMap.get(id);
                                if (block?.titles?.has(title)) matched.set(block.id, block);
                            }));
                        }
                    }
                }
            }
        }
        return [...matched.values()];
    }
    private trySetAttrs(block: Block) {
        if (!block.attrs) {
            if (block.ial) {
                block.attrs = parseIAL(block.ial);
                this.setBlock(block);
            } else {
                siyuan.getBlockAttrs(block.id).then(attrs => {
                    block.attrs = attrs;
                    this.setBlock(block);
                });
            }
        }
    }
    private setBlock(b: Block) {
        if (b.attrs) {
            if (!b.titles) b.titles = new Set();
            b.titles.clear();
            const cb = (s: string) => b.titles.add(s.toLocaleLowerCase())
            notEmptyStrDo(b.content, cb)
            b.attrs?.alias?.replaceAll("，", ",")?.split(",")?.forEach(p => {
                notEmptyStrDo(p, cb)
            });
            notEmptyStrDo(b.attrs?.title, cb)
            b.titles.forEach(c => this.contentMap.get(c).add(b.id))
        }
    }
    async tryGetDocs(docID: string) {
        const rows = await siyuan.sql(`select * from blocks where type='d' and id="${docID}"`)
        this.update(rows);
    }
    async update(rows: Block[], updateTime = false) {
        rows.forEach(row => {
            if (updateTime && row.updated > this.timestamp) {
                this.timestamp = row.updated;
            }
            row.attrs = parseIAL(row.ial)
            delete row.attrs["title-img"];
            this.docMap.set(row.id, row);
            this.setBlock(row);
        });
    }
    private async getDocs() {
        await navigator.locks.request("DocTracer 2024-12-1 23:48:00", async (lock) => {
            if (lock) {
                const rows = await siyuan.sql(`select * from blocks where type='d' and updated>'${this.timestamp}' limit 999999999`)
                this.update(rows, true);
            }
        });
    }
    async init() {
        if (this.inited) return;
        this.inited = true;
        await this.getDocs();
        events.addWsListener("DocTracer ws 2024-12-1 10:34:13", (detail) => {
            for (const ops of getDoOperations(detail)) {
                switch (ops.action) {
                    case "updateAttrs":
                        const row = this.docMap.get(ops.id);
                        if (row && ops.data?.new) {
                            row.attrs = ops.data?.new
                            this.setBlock(row);
                        }
                        break;
                    default:
                        break;
                }
            }
            switch (detail.cmd) {
                case "removeDoc":
                    detail.data?.ids?.forEach(id => this.removeDoc(id))
                    break;
                case "create":
                    setTimeout(() => {
                        this.getDocs()
                    }, 2000);
                    break;
                case "rename":
                    const row = this.docMap.get(detail.data.id);
                    if (row) {
                        row.content = detail.data.title;
                        this.setBlock(row);
                    }
                    break;
                default:
                    break;
            }
        });
    }
    removeDoc(id: string) {
        return this.docMap.delete(id);
    }
}

export class DebouncedTaskExecutor<T> {
    private lockName: string;
    private lastTask: T;
    constructor() {
        this.lockName = newID();
    }
    run(task: T, cb: (_t: T) => Promise<void>) {
        navigator.locks.request(this.lockName, { ifAvailable: true }, async (lock) => {
            if (lock) {
                await cb(task);
                while (this.lastTask) {
                    const t = this.lastTask;
                    this.lastTask = null;
                    if (t) await cb(t);
                }
            } else {
                this.lastTask = task;
            }
        })
    }
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
