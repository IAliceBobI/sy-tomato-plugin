import { IProtyle, Plugin } from "siyuan";
import { OpenSyFile2, isReadonly } from "./docUtils";
import { events } from "./Events";
import { storeNoteBox_fastnote, fastNoteBoxDelAfterCreating, fastNoteBoxAdd2Flashcard, fastNoteBoxDocPrefix } from "./stores";
import { verifyKeyTomato } from "./user";
import { siyuan, getContextPath, cloneCleanDiv, NewLute, NewNodeID, timeUtil } from "./utils";
import { getNotebookByID } from "./notebookUtils";
import { tomatoI18n } from "../tomatoI18n";

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
        if (!newID) return; // 创建失败已 toast——空 id 落属性会把既有 fastdraft 链抹掉
        await siyuan.setBlockAttrs(docID, { "custom-fastdraft": newID });
    }
}


export async function createNote(plugin: Plugin, protyle: IProtyle, allowFlashcard = true, attrs: AttrType = {}, title = "") {
    // 失败静默是原实现最大可用性问题（qn-robust）：按键无反应无从排查——补 toast 反馈。
    // 顺序：先 protyle（无文档=最常见可自救态）；boxID 空需 store 未配+getOr 兜底
    // events.boxID 也无笔记本上下文，纯防御位（getOr 兜底当前笔记本，有文档在开即非空）
    if (!protyle) {
        siyuan.pushMsg(tomatoI18n.请先打开一个文档);
        return;
    }
    const boxID = storeNoteBox_fastnote.getOr();
    if (!boxID) {
        siyuan.pushMsg(tomatoI18n.请先配置快速笔记的落点笔记本);
        return;
    }
    // 陈旧配置防御（qn-robust e2e 实锤）：配置的笔记本已被删/关时内核报「查询笔记本失败」
    // 且 createDocWithMd 链路无任何用户可见反馈——建前先验笔记本在列且未关
    const nb = getNotebookByID(boxID);
    if (!nb || nb.closed) {
        siyuan.pushMsg(tomatoI18n.快速笔记落点笔记本不可用);
        return;
    }
    const { selected, ids, cursorOnly } = await events.selectedDivs(protyle);
    if (!ids || ids.length <= 0) {
        siyuan.pushMsg(tomatoI18n.请先选中内容或放置光标);
        return;
    }

    const { getPathMd } = await getContextPath(ids[0]);
    const path = `${getPathMd()}\n{: id="${NewNodeID()}"}\n`
    const lute = NewLute();
    const content = selected.map(d => {
        d = cloneCleanDiv(d).div
        return lute.BlockDOM2Md(d.outerHTML);
    });
    const taskRo = isReadonly(protyle)
    const id = await createAndOpenFastNote(protyle, boxID, plugin, attrs, title, path + content.join("\n"));
    if (!id) return null; // 创建失败已 toast——原文不删（防内容双向落空）、卡不加（review P1-1）
    if (await verifyKeyTomato() && fastNoteBoxDelAfterCreating.get() && await taskRo === "false" && !cursorOnly) await siyuan.transactions(siyuan.transDeleteBlocks(ids));
    if (fastNoteBoxAdd2Flashcard.get() && allowFlashcard) {
        setTimeout(() => {
            siyuan.addRiffCards([id])
        }, 800);
    }
    return id;
}

export async function createAndOpenFastNote(protyle: IProtyle, boxID: string, plugin: Plugin, attrs: AttrType = {}, title: string = "", md = "") {
    const { y, M, d, h, m, s } = timeUtil.nowYMDStrPad();
    if (!title) title = `f${y}-${M}-${d} ${h}:${m}:${s}`;
    if (fastNoteBoxDocPrefix.get()) {
        const { name } = events.getInfo(protyle)
        title = `${name} | ${title}`
    }
    const hpath = `/fast note/f${y}/f${y}-${M}/${title}`;
    const id = await siyuan.createDocWithMdIfNotExists(boxID, hpath, md, { ...attrs, "custom-fastnote": y + M + d + h + m + s });
    if (!id) {
        // 创建失败（内核异常/路径被拒等）原样静默——收敛点统一兜底（qn-robust）
        siyuan.pushMsg(tomatoI18n.快速笔记创建失败);
        return null;
    }
    await OpenSyFile2(plugin, id);
    return id;
}
