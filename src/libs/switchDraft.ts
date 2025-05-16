import { IProtyle, Plugin } from "siyuan";
import { OpenSyFile2, isReadonly } from "./docUtils";
import { events } from "./Events";
import { storeNoteBox_fastnote, fastNoteBoxDelAfterCreating, fastNoteBoxAdd2Flashcard } from "./stores";
import { verifyKeyTomato } from "./user";
import { siyuan, getContextPath, cloneCleanDiv, NewLute, NewNodeID, timeUtil } from "./utils";

export async function switchDraft(plugin: Plugin, protyle: IProtyle) {
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


export async function createNote(plugin: Plugin, protyle: IProtyle, allowFlashcard = true, attrs: AttrType = {}, title = "") {
    let boxID = storeNoteBox_fastnote.getOr();
    if (!boxID || !protyle) return;
    const { selected, ids, cursorOnly } = await events.selectedDivs(protyle);
    if (ids.length <= 0) return;

    const { getPathMd } = await getContextPath(ids[0]);
    const path = `${getPathMd()}\n{: id="${NewNodeID()}"}\n`
    const lute = NewLute();
    const content = selected.map(d => {
        d = cloneCleanDiv(d).div
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
    const { y, M, d, h, m, s } = timeUtil.nowYMDStrPad();
    if (!title) title = `f${y}-${M}-${d} ${h}:${m}:${s}`;
    const hpath = `/fast note/f${y}/f${y}-${M}/${title}`;
    const id = await siyuan.createDocWithMdIfNotExists(boxID, hpath, md, { ...attrs, "custom-fastnote": y + M + d + h + m + s });
    await OpenSyFile2(plugin, id);
    return id;
}
