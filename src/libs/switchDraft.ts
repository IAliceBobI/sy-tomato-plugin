import { IProtyle, Plugin } from "siyuan";
import { OpenSyFile2, isReadonly } from "./docUtils";
import { events } from "./Events";
import { storeNoteBox_fastnote, fastNoteBoxDelAfterCreating, fastNoteBoxAdd2Flashcard, fastNoteBoxDocPrefix } from "./stores";
import { verifyKeyTomato } from "./user";
import { siyuan, getContextPath, cloneCleanDiv, NewLute, NewNodeID, timeUtil } from "./utils";
import { DATA_NODE_ID } from "./gconst";
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


export async function createNote(plugin: Plugin, protyle?: IProtyle, allowFlashcard = true, attrs: AttrType = {}, title = "") {
    // protyle 缺失不再拦截（bear 2026-09-14 空笔记语义）：它只服务于摘选中/溯源头/
    // 只读判定，建文件+打开本身不需要——刷新后 events 单例冷启动空窗照常可建空
    // 笔记；boxID 走 store+getOr 兜底，同样不依赖 protyle
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
    // 无选中/无光标不再 toast 拦截（bear 2026-09-14 需求）：改建空快速笔记，溯源
    // path 头照带——面包屑 API 对文档 id 返回 name 空（主实例实测），种子须用文档
    // 内块 id（wysiwyg 首个 data-node-id，纯 DOM 零往返）；空笔记 cursorOnly 恒
    // true，删原文链不触发
    const seedID = ids?.[0]
        ?? protyle?.wysiwyg?.element?.querySelector(`div[${DATA_NODE_ID}]`)?.getAttribute(DATA_NODE_ID)
        ?? "";
    const { getPathMd } = seedID ? await getContextPath(seedID) : { getPathMd: () => "" };
    const path = `${getPathMd()}\n{: id="${NewNodeID()}"}\n`
    const lute = NewLute();
    const content = selected.map(d => {
        d = cloneCleanDiv(d).div
        return lute.BlockDOM2Md(d.outerHTML);
    });
    // ids 非空蕴含 protyle 非空（selectedDivs 有 element/docID 才有 ids）；空笔记无
    // 原文可删，isReadonly(undefined) 会 throw——短路假值即可（判据不被消费）
    const taskRo = ids.length > 0 ? isReadonly(protyle) : Promise.resolve("false")
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

export async function createAndOpenFastNote(protyle: IProtyle | undefined, boxID: string, plugin: Plugin, attrs: AttrType = {}, title: string = "", md = "") {
    const { y, M, d, h, m, s } = timeUtil.nowYMDStrPad();
    if (!title) title = `f${y}-${M}-${d} ${h}:${m}:${s}`;
    if (fastNoteBoxDocPrefix.get()) {
        const { name } = events.getInfo(protyle)
        if (name) title = `${name} | ${title}` // 空 protyle（冷启动）getInfo 回 {}——name 缺失不加前缀防 "undefined | f..."
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
