import { adaptHotkey, Custom, Dialog, Dock, IProtyle, openTab, openWindow } from "siyuan";
import { events, EventType } from "./libs/Events";
import { add_ref, convertMinutesToTimeFormat, doubleSupRows, isMainWin, NewNodeID, setTimeouts, siyuan, sleep, timeUtil, } from "./libs/utils";
import NoteBoxSvelte from "./NoteBox.svelte";
import { TOMATO_IDEA_QUEUE } from "./libs/gconst";
import { DestroyManager } from "./libs/destroyer";
import { avoiding_cloud_synchronization_conflicts, flash_thoughts_2_top, flash_thoughts_target_file, flashThoughtUseDialog, noteBoxCheckbox, storeNoteBox_fastnote, storeNoteBox_pin, storeNoteBox_selectedNotebook, storeNoteBox_selectedNoteType } from "./libs/stores";
import { isPinned, removeStatusBar } from "./libs/ui";
import { createRefDoc, OpenSyFile2 } from "./libs/docUtils";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { verifyKeyTomato } from "./libs/user";
import { DomSuperBlockBuilder, domNewLine } from "./libs/sydom";
import { winHotkey } from "./libs/winHotkey";
import { newID } from "stonev5-utils/lib/id";

const DOCK_TYPE = "dock_NoteBox";
const TAB_TYPE = "custom_tab_NoteBox";
export const NoteBoxID = "jadfddMPTrpeULuAwloOMWAJEgwyMpBOTxUaDSTHyShpHlJHKu";

function pinWindowEventHandler(_event: PointerEvent) {
    storeNoteBox_pin.save(isPinned());
}

function removeIcons() {
    removeStatusBar();

    // pinWindow
    document.getElementById("pinWindow")?.addEventListener("click", pinWindowEventHandler);
    if (storeNoteBox_pin.get() === true) {
        if (!isPinned()) {
            document.getElementById("pinWindow")?.click();
        }
    }
}

function isNoteBox() {
    return document.getElementById(NoteBoxID) != null;
}

export const NoteBox拍照闪念全局 = winHotkey("ctrl+q", "拍照闪念全局 2025-5-12 13:50:14", "", () => tomatoI18n.拍照闪念全局)

class NoteBox {
    plugin: BaseTomatoPlugin;
    private custom: () => Custom;
    settingCfg: TomatoSettings;
    // private ticker: any;
    // private notebookID: string;
    mobilePinnedDailynoteID: string;

    onload(plugin: BaseTomatoPlugin) {
        if (plugin.initCfg()) {
            this._onload(plugin)
        } else {
            (async () => {
                await plugin.taskCfg;
                if (!(await verifyKeyTomato())) {
                    avoiding_cloud_synchronization_conflicts.set(false);
                }
                this._onload(plugin);
            })();
        }
    }
    _onload(plugin: BaseTomatoPlugin) {
        if (!noteBoxCheckbox.get()) return;

        this.plugin = plugin;
        this.settingCfg = plugin.settingCfg;

        if (!events.isMobile) {
            this.addDock(); // 添加后有 bug，手机端在文档数更新后，无法显示 topbar icons.
        }

        this.addTab();
        if (events.isMobile) {
            this.plugin.addTopBar({
                icon: "iconCameraTomato",
                title: this.plugin.i18n.noteBox,
                position: "left",
                callback: () => {
                    this.showInDialog();
                },
            });
            const syncIcon = this.plugin.addTopBar({
                icon: "iconCloudTomatoEnd",
                title: tomatoI18n.同步数据,
                position: "left",
                callback: () => {
                    siyuan.performSync(true);
                },
            });
            events.addListener("note-box ws 2024-12-15 09:11:501", (eventType, detail) => {
                if (eventType === EventType.sync_fail) {
                    syncIcon.firstElementChild?.firstElementChild?.setAttribute("xlink:href", "#iconCloudTomatoFail")
                    siyuan.pushMsg(detail.msg, 3000);
                }
                if (eventType === EventType.sync_start) {
                    syncIcon.firstElementChild?.firstElementChild?.setAttribute("xlink:href", "#iconCloudTomatoStart")
                }
                if (eventType === EventType.sync_end) {
                    syncIcon.firstElementChild?.firstElementChild?.setAttribute("xlink:href", "#iconCloudTomatoEnd")
                }
            });
        }

        events.addListener("tomato-note-box-2024-11-29 10:40:12", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.click_editorcontent
                || eventType == EventType.switch_protyle
            ) {
                navigator.locks.request("tomato-note-box-lock-2024-07-01 17:16:02", { ifAvailable: true }, async (lock) => {
                    if (lock) {
                        try {
                            const protyle: IProtyle = detail?.protyle;
                            const docID = protyle?.block?.rootID;
                            if (!avoiding_cloud_synchronization_conflicts.get()) {
                                await this.calcTimeInterval(docID)
                            } else {
                                if (!events.isMobile) {
                                    await this.calcTimeInterval(docID)
                                }
                            }
                        } finally {
                            await sleep(5000)
                        }
                    }
                });
            }
        });

        if (avoiding_cloud_synchronization_conflicts.get() && !events.isMobile) {
            events.addListener("tomato-note-box-file-queue", (eventType, _detail) => {
                if (eventType == EventType.loaded_protyle_static
                    || eventType == EventType.loaded_protyle_dynamic
                    || eventType == EventType.click_editorcontent
                    || eventType == EventType.switch_protyle
                ) {
                    navigator.locks.request("tomato-note-box-file-queue-lock", { ifAvailable: true }, async (lock) => {
                        if (lock) {
                            const boxID = storeNoteBox_fastnote.getOr();
                            this.moveFromQueue(boxID);
                            await sleep(5000)
                        }
                    });
                }
            });
        }

        if (!events.isMobile) {
            setTimeouts(() => {
                if (isNoteBox() && !isMainWin()) {
                    removeIcons();
                }
            }, 200, 3000, 300);
        }
    }

    private async calcTimeInterval(docID: string) {
        if (!docID) return;
        const [timeMap, intervalMap] = await siyuan
            .sqlAttr(`select name,block_id,value from attributes 
                where (name="custom-tomato-idea-time" or name="custom-tomato-idea-interval") 
                and root_id = "${docID}"`
            )
            .then(rows => {
                const t = new Map(rows.filter(i => i.name == "custom-tomato-idea-time").map(row => [row.block_id, row.value]))
                const i = new Map(rows.filter(i => i.name == "custom-tomato-idea-interval").map(row => [row.block_id, row.value]))
                return [t, i]
            });

        if (timeMap.size == 0) return
        const ids = await siyuan.getBlocksIndexes([...timeMap.keys()])
            .then(obj => Object.entries(obj).sort((a, b) => a[1] - b[1]).map(entr => entr[0]))
            .then(ids => ids
                .map(id => {
                    const time = (timeMap.get(id) ?? "").split("⌛")[0]; // for old
                    if (!time) return null
                    const interval = intervalMap.get(id) ?? "";
                    return { id, time, interval } as ID_Time
                })
                .filter(i => !!i)
            )
        for (let i = 1; i < ids.length; i++) {
            await this.updateTimeInterval(ids[i - 1], ids[i])
        }
    }

    private async updateTimeInterval(a: ID_Time, b: ID_Time) {
        if (a.time == b.time) return
        const P = "2020-01-01 "
        const atime = (new Date(P + a.time)).getTime()
        const btime = (new Date(P + b.time)).getTime()
        const interval = convertMinutesToTimeFormat(Math.ceil(Math.abs(atime - btime) / (1000 * 60)))
        if (Math.min(atime, btime) == atime) {
            if (interval != a.interval) {
                await siyuan.setBlockAttrs(a.id, { "custom-tomato-idea-interval": interval })
            }
        } else {
            if (interval != b.interval) {
                await siyuan.setBlockAttrs(b.id, { "custom-tomato-idea-interval": interval })
            }
        }
    }

    private getCloseSvg() {
        for (const e of document.querySelectorAll("span.item__text")) {
            if (e.textContent.startsWith(this.plugin.i18n.noteBox)) {
                // <span class="item__text">拍照闪念(移动端规避云端同步冲突)</span>
                // <span class="item__close"><svg><use xlink:href="#iconClose"></use></svg></span>
                return e.nextElementSibling as HTMLButtonElement;
            }
        }
    }

    private addDock() {
        this.plugin.addDock({
            type: DOCK_TYPE,
            config: {
                position: "LeftBottom",
                size: { width: 200, height: 0 },
                icon: "iconCameraTomato",
                title: tomatoI18n.拍照闪念,
                hotkey: "⌥⌘W",
            },
            data: {
                svelte: null,
            },
            resize() {
            },
            update() {
            },
            destroy() {
            },
            init: (dock: Dock) => {
                const eleID = newID();
                let suffix = "";
                if (avoiding_cloud_synchronization_conflicts.get()) {
                    suffix = `(${tomatoI18n.移动端规避云端同步冲突})`;
                }
                if (events.isMobile) {
                    dock.element.innerHTML = `<div class="toolbar toolbar--border toolbar--dark">
                        <svg class="toolbar__icon"><use xlink:href="#iconCamera"></use></svg>
                            <div class="toolbar__text">${tomatoI18n.拍照闪念}${suffix}</div>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                } else {
                    dock.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
                        <div class="block__icons">
                            <div class="block__logo">
                                <svg class="block__logoicon"><use xlink:href="#iconCamera"></use></svg>${tomatoI18n.拍照闪念}${suffix}
                            </div>
                            <span class="fn__flex-1 fn__space"></span>
                            <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}"><svg><use xlink:href="#iconMin"></use></svg></span>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                }
                dock.data.svelte = new NoteBoxSvelte({
                    target: dock.element.querySelector("#" + eleID),
                    props: {}
                }) as any;
            },
        });
    }

    private addTab() {
        this.custom;
        this.plugin.addCommand({
            langKey: NoteBox拍照闪念全局.langKey,
            langText: NoteBox拍照闪念全局.langText(),
            hotkey: NoteBox拍照闪念全局.m,
            globalCallback: async () => {
                if (flashThoughtUseDialog.get()) {
                    await this.showInDialog();
                } else {
                    await this.showInput();
                }
            },
        });
        this.custom = this.plugin.addTab({
            type: TAB_TYPE,
            init() {
                const id = newID();
                this.element.innerHTML = `<div id="${id}"></div>`;
                this.data.sm = new DestroyManager();
                this.data.sm.add("custom-tab", () => { this.destroy(); });
                if (!isMainWin()) {
                    this.data.sv = new NoteBoxSvelte({
                        target: this.element.querySelector("#" + id),
                        props: { sm: this.data.sm }
                    });
                    this.data.sm.add("svelte", () => { this.data.sv.$destroy(); });
                }
            },
            beforeDestroy() { },
            destroy() {
                this.data.sm.destroyBy("custom-tab");
                noteBox.getCloseSvg()?.click();
            }
        });
    }

    private async showInDialog() {
        const dm = new DestroyManager();
        const id = newID();
        const dialog = new Dialog({
            title: tomatoI18n.拍照闪念,
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : "500px",
            height: events.isMobile ? "150vw" : "500px",
            destroyCallback: () => {
                dm.destroyBy("1")
            },
        });
        const d = new NoteBoxSvelte({
            target: dialog.element.querySelector("#" + id),
            props: {
                sm: dm,
                isDialog: true,
            }
        });
        dm.add("1", () => { dialog.destroy() })
        dm.add("2", () => { d.$destroy() })
    }

    private async showInput() {
        // if (isMainWin) {
        //     const { BrowserWindow } = require('@electron/remote')
        //     if (BrowserWindow) {
        //         const windowOptions = {
        //             width: 800,
        //             height: 600,
        //             show: false,
        //         };
        //         const mainWindow = new BrowserWindow(windowOptions);
        //         mainWindow.loadURL("data:text/html;charset=utf-8,");
        //         mainWindow.webContents.executeJavaScript(`document.write("Hello, World!");`);
        //         mainWindow.show();
        //     }
        // }
        // return;

        // TODO: save to file, update timestamp in the file every five secs.
        // if timestamp too old, delete the file and open new tab
        if (isNoteBox()) {
            this.getCloseSvg()?.click();
        }
        if (isMainWin()) {
            let suffix = "";
            if (avoiding_cloud_synchronization_conflicts.get()) {
                suffix = `(${tomatoI18n.移动端规避云端同步冲突})`;
            }
            const noteBoxTab = await openTab({ // custom
                app: this.plugin.app,
                custom: {
                    icon: "iconCameraTomato",
                    title: this.plugin.i18n.noteBox + suffix,
                    data: {},
                    id: this.plugin.name + TAB_TYPE
                },
            });
            openWindow({
                width: 480,
                height: 240,
                tab: noteBoxTab,
            });
        }
    }


    private async moveFromQueue(box: string) {
        if (!box) return;
        const rows = await siyuan.sqlAttr(`select * from attributes where name="${TOMATO_IDEA_QUEUE}"`);
        if (rows.length == 0) {
            return;
        }
        const ideaIDs = (await Promise.all(rows.map(row => siyuan.getChildBlocks(row.root_id)))).flat().map(c => c.id);
        const ideas = await siyuan.getRows(ideaIDs, "created", false, [/*`box="${box}"`,*/ "markdown is not null", "LENGTH(markdown) > 0"]);
        if (ideas.length == 0) {
            await Promise.all(rows.map(row => siyuan.removeDoc(box, row.path)));
            return;
        }
        ideas.sort((a, b) => {
            return a.created.localeCompare(b.created);
        });
        const dayID = await getTargetID(box);
        if (!dayID) return;

        let ops = [];
        if (flash_thoughts_2_top.get()) {
            ops = siyuan.transMoveBlocksAsChild(ideas.map(i => i.id).reverse(), dayID);
        } else {
            const tails = await siyuan.getTailChildBlocks(dayID, 1);
            if (tails.length > 0) {
                const tailID = tails[0].id;
                if (tailID && await siyuan.checkBlockExist(tailID)) {
                    ops = siyuan.transMoveBlocksAfter(ideas.map(i => i.id), tailID);
                }
            }
        }
        if (ops.length > 0) {
            await siyuan.transactions(ops);
            setTimeout(() => {
                for (const { id } of ideas.slice().reverse()) {
                    OpenSyFile2(this.plugin, id);
                    break;
                }
            }, 1000);
        }
    }
}

export async function getTargetID(box: string) {
    if (!box) box = events.boxID;
    if (!box) return;
    const targetFile = flash_thoughts_target_file.get()?.trim();
    if (targetFile) {
        const row = await siyuan.sqlOne(`select id from blocks where type='d' and content="${targetFile}" limit 1`)
        if (row?.id)
            return row.id;
        siyuan.pushMsg(`${tomatoI18n.拍照闪念}：${tomatoI18n.找不到您配置的文件}："${targetFile}"`)
    }
    const note = await siyuan.createDailyNote(box);
    if (events.isMobile) {
        if (!noteBox.mobilePinnedDailynoteID) noteBox.mobilePinnedDailynoteID = note.id;
        return noteBox.mobilePinnedDailynoteID;
    }
    return note.id;
}

export const noteBox = new NoteBox();

export function getTime() {
    const d = new Date();
    const time = timeUtil.dateFormatTime(d);
    return time.split(":").slice(0, 2).join(":");
}

export function getAttr(t?: string) {
    if (t) {
        return `{: id="${NewNodeID()}" custom-tomato-idea-time="${getTime()}" alias="${t}"}`;
    } else {
        return `{: id="${NewNodeID()}" custom-tomato-idea-time="${getTime()}"}`;
    }
}

async function getContent2insert(text: string, isPic: boolean) {
    const boxID = storeNoteBox_selectedNotebook.getOr();
    text = text.trim();
    const icon = storeNoteBox_selectedNoteType.get().trim();
    if (isPic) {
        return text;
    } else if (["💡", "🏞️", "💪", "💬", "🍴", "📚", "💼"].includes(icon)) {
        return doubleSupRows(text, getAttr(icon));
    } else if (icon === "📌") {
        text = "* [ ] " + text.replaceAll(/\n+/g, "; ");
        return doubleSupRows(text, getAttr(icon));
    } else {
        const id = await createRefDoc(boxID, icon);
        const L1 = new DomSuperBlockBuilder();
        const L2 = new DomSuperBlockBuilder();
        const textDiv = domNewLine(text);
        L2.append(textDiv);
        L1.append(L2.build());
        add_ref(textDiv, id, icon, false, false);
        L1.setAttr("custom-tomato-idea-time", getTime());
        const dayID = await getTargetDoc();
        const html = L1.build().outerHTML;
        if (flash_thoughts_2_top.get()) {
            // 只能放到这里，不能放到insertIntoDailynote，只能插入到编辑器，刷新消失。
            //
            // 未解之谜！！！
            await siyuan.insertBlocksAsChildOf([html], dayID);
        } else {
            const lastID = await siyuan.getDocLastID(dayID);
            await siyuan.insertBlocksAfter([html], lastID);
        }
    }
}

// save to dailynote
export async function insertIntoDailynote(text: string, isPic = false) {
    const dayID = await getTargetDoc();
    text = await getContent2insert(text, isPic);
    if (!text) return;
    if (flash_thoughts_2_top.get()) {
        await siyuan.insertBlockAsChildOf(text, dayID);
    } else {
        await siyuan.appendBlock(text, dayID);
    }
}

async function getTargetDoc() {
    const boxID = storeNoteBox_selectedNotebook.getOr();
    const id = await getTargetID(boxID);
    if (!id) return;
    if (avoiding_cloud_synchronization_conflicts.get() && events.isMobile) {
        const row = await siyuan.getRowByID(id);
        if (row?.hpath?.length > 0) {
            const qID = NewNodeID();
            const attrs = {};
            attrs[TOMATO_IDEA_QUEUE] = "1";
            return siyuan.createDocWithMd(
                boxID,
                `${row.hpath}/${qID}`,
                "",
                qID,
                attrs,
            );
        }
    }
    return id;
}