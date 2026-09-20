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

/** 禁聚焦善后（bear 09-16 森林图反馈推广 t/p/r；project openDocNoFocus 80e8d2e7 同款）：
 *  思源 3.8.3 原生打开即聚焦——开文档=标题输入框获焦、块定位通道=光标落块（action 不防，
 *  文件树/?id= 原生通道同形实锤）。openTab 完成后归还键盘焦点+清选区，防误打误改
 *  （blur 先例=内核 openFile 开 PDF 同款）。双拍兜底：afterOpen 在新页签内容加载
 *  （onGet 落焦点）之前触发，晚拍 1100ms 覆盖慢加载窗口。OpenSyFile2 全部调用面
 *  （t 的图谱/复习/批注/日记等、p/r 跨插件导入）经此一处收口。 */
export function noFocusAfterOpen(afterOpen?: () => void): (model?: any) => void {
    // model 收域（review P1）：afterOpen 携带本次打开的 Editor model——善后只对
    // 该 protyle 容器内的焦点/选区出手，防 400/1100ms 窗口内误伤用户自己正编辑的
    // 其他文档（back 后台打开路径尤其：隐藏页签本无落焦，宽拍纯属打扰）；model 空
    // （pdf 加载中/跨窗口/asset·custom 页签）=无收域目标，跳过两拍
    let root: HTMLElement | undefined;
    return (model?: any) => {
        root = model?.editor?.protyle?.element;
        for (const delay of [400, 1100]) {
            setTimeout(() => {
                const ae = document.activeElement;
                if (root && ae instanceof HTMLElement && root.contains(ae)) ae.blur();
                const sel = window.getSelection();
                if (root && sel?.rangeCount && sel.anchorNode && root.contains(sel.anchorNode)) sel.removeAllRanges();
            }, delay);
        }
        afterOpen?.();
    };
}

/**
 * @param action ["cb-get-context", "cb-get-hl"]（默认；cb-get-focus 已按禁聚焦政策退役；
 *               09-16 起另织入 noFocusAfterOpen 双拍 blur 善后——action 只管滚动定位，
 *               归还焦点由善后拍兜底）
 * @param position nop 0, front 1, back 2, right 3, bottom 4, move 5
 * @param keepFocus 禁聚焦豁免（09-20 日记跳底）：true=action 落 cb-get-focus+cb-get-outline
 *               （光标钉目标块块尾可续写）且跳过 blur 善后。仅「打开即写」场景用（日记
 *               跳底），其余调用面维持禁聚焦政策
 * @returns
 */
export async function OpenSyFile2(
    plugin: Plugin,
    docID: string,
    position?: WindowOpenStyle,
    action?: TProtyleAction[],
    afterOpen?: () => void,
    originID?: string,
    keepFocus = false,
) {
    if (!docID) return
    if (position == "0" || position == "nop") {
        return;
    } else if (events.isMobile) {
        openMobileFileById(plugin.app, docID);
    } else {
        // bear 09-15 拍板全插件禁聚焦：打开文档只滚动定位（cb-get-hl），不落光标；
        // keepFocus 豁免：cb-get-focus 落光标 + cb-get-outline 令 focusBlock toStart=false
        // 光标落块尾（内核 selection.ts focusBlock 双分支实测语义）
        if (action == null) action = keepFocus
            ? ["cb-get-context", "cb-get-focus", "cb-get-outline"]
            : ["cb-get-context", "cb-get-hl"];
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
                                // peek 1500ms 后复原文档=又一次原生打开，同样吃善后
                                afterOpen: noFocusAfterOpen(),
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
            afterOpen: keepFocus ? afterOpen : noFocusAfterOpen(afterOpen),
        });
    }
}

// // recommand: ["cb-get-context", "cb-get-hl"]
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
