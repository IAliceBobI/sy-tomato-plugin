import { IProtyle, Plugin } from "siyuan";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { fastNoteBoxAdd2Flashcard, fastNoteBoxCheckbox, fastNoteBoxDelAfterCreating, storeNoteBox_fastnote } from "./libs/stores";
import * as utils from "./libs/utils";
import { getContextPath, siyuan, winHotkey } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { isReadonly, OpenSyFile2 } from "./libs/docUtils";
import { events } from "./libs/Events";
import { verifyKeyTomato } from "./libs/user";

export const FastNoteBox创建快速笔记 = winHotkey("⌘N")
export const FastNoteBox打开最后一个笔记 = winHotkey("⌘⌥N")
export const FastNoteBox草稿切换 = winHotkey("F4")

class FastNoteBox {
    plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        if (!fastNoteBoxCheckbox.get()) return;

        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: "2024-08-06 10:35:21",
            langText: tomatoI18n.创建快速笔记,
            hotkey: FastNoteBox创建快速笔记.m,
            callback: () => {
                navigator.locks.request("FastNoteBox2024-08-06 12:38:21", { mode: "exclusive" }, async () => {
                    await createNote(this.plugin, events.protyle?.protyle);
                })
            },
        });
        this.plugin.addCommand({
            langKey: "2024-08-06 10:35:22",
            langText: tomatoI18n.打开最后一个笔记,
            hotkey: FastNoteBox打开最后一个笔记.m,
            callback: () => {
                this.openNote()
            },
        });
        this.plugin.addCommand({
            langKey: "2024-9-13 09:32:44",
            langText: tomatoI18n.草稿切换 + " · " + tomatoI18n.切换到文档背面,
            hotkey: FastNoteBox草稿切换.m,
            callback: () => {
                switchDraft(this.plugin, events.protyle?.protyle)
            },
        });
    }

    private async openNote() {
        const kName: keyof (AttrType) = "custom-fastnote";
        const rows = await siyuan.sqlAttr(`select root_id from attributes where name="${kName}" order by value desc limit 1`)
        if (!rows || rows.length == 0) {
            siyuan.pushMsg("cannot find a fastnote")
            return
        }
        OpenSyFile2(this.plugin, rows[0].root_id)
    }
}

export const fastNoteBox = new FastNoteBox();

export async function switchDraft(plugin: Plugin, protyle: IProtyle) {
    if (!(await verifyKeyTomato())) {
        await siyuan.pushMsg(tomatoI18n.此功能需要激活VIP + ": " + tomatoI18n.草稿切换 + FastNoteBox草稿切换)
        return;
    }

    const docID = protyle?.block?.rootID;
    if (!docID) return;
    const title = protyle.title?.editElement?.textContent
    const bt = `backside-${title}`;
    const attrs = await siyuan.getBlockAttrs(docID);
    let draftID = attrs["custom-fastdraft"];
    let isFastNote = !!attrs["custom-fastnote"];
    if (await siyuan.checkBlockExist(draftID)) {
        await OpenSyFile2(plugin, draftID);
        if (isFastNote) {
            //close docID
            // document.querySelectorAll("span.item__text").forEach((e: HTMLElement) => {
            //     if (e.textContent === title) {
            //         const s = e.nextElementSibling as HTMLButtonElement;
            //         if (s?.click) s.click();
            //     }
            // });
        } else {
            await siyuan.setBlockAttrs(draftID, { title: bt })
        }
    } else {
        const newID = await createNote(plugin, protyle, false, {
            "custom-fastdraft": docID,
            "custom-off-tomatobacklink": "1",
        }, bt)
        await siyuan.setBlockAttrs(docID, { "custom-fastdraft": newID });
    }
}

async function createNote(plugin: Plugin, protyle: IProtyle, allowFlashcard = true, attrs: AttrType = {}, title = "") {
    let boxID = storeNoteBox_fastnote.getOr();
    if (!boxID || !protyle) return;
    const { selected, ids, cursorOnly } = await events.selectedDivs(protyle);
    if (ids.length <= 0) return;

    const { getPathMd } = await getContextPath(ids[0]);
    const path = `${getPathMd()}\n{: id="${utils.NewNodeID()}"}\n`
    const lute = utils.NewLute();
    const content = selected.map(d => {
        d = utils.cloneCleanDiv(d).div
        return lute.BlockDOM2Md(d.outerHTML);
    });
    const taskRo = isReadonly(protyle)
    const id = await createAndOpenFastNote(boxID, plugin, attrs, title, path + content.join("\n"));
    if (await verifyKeyTomato() && fastNoteBoxDelAfterCreating.get() && await taskRo === "false" && !cursorOnly) await siyuan.transactions(siyuan.transDeleteBlocks(ids));
    if (fastNoteBoxAdd2Flashcard.get() && allowFlashcard) {
        setTimeout(() => {
            siyuan.addRiffCards([id])
        }, 800);
    }
    return id;
}

export async function createAndOpenFastNote(boxID: string, plugin: Plugin, attrs: AttrType = {}, title: string = "", md = "") {
    const { y, M, d, h, m, s } = utils.timeUtil.nowYMDStrPad();
    if (!title) title = `f${y}-${M}-${d} ${h}:${m}:${s}`;
    const hpath = `/fast note/f${y}/f${y}-${M}/${title}`;
    const id = await siyuan.createDocWithMdIfNotExists(boxID, hpath, md, { ...attrs, "custom-fastnote": y + M + d + h + m + s });
    await OpenSyFile2(plugin, id);
    return id;
}
