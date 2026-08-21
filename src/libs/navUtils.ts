// 界面导航：打开文件/标签页管理/文档树定位/dock 取用。从原 docUtils.ts 拆出（2026-08 重构），
// docUtils.ts 现为 re-export 桶。
import { IProtyle, openMobileFileById, openTab, openWindow, Plugin, Tab, TProtyleAction } from "siyuan";
import { events } from "./Events";
import { siyuan } from "./utils";
import { ClassActive } from "./gconst";

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
