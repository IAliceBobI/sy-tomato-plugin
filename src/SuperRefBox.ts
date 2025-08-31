import { dom2div, into } from "stonev5-utils";
import { superRefBoxCheckBox, superRefBoxGlobalFixMenu, superRefBoxGlobalLnkMenu } from "./libs/stores";
import { getBlockDiv, getTomatoPluginInstance, NewLute, setAttribute, siyuan, } from "./libs/utils";
import { winHotkey } from "./libs/winHotkey";
import { IProtyle } from "siyuan";
import { events, EventType } from "./libs/Events";
import { tomatoI18n } from "./tomatoI18n";
export const SuperRefBox全局加固引用 = winHotkey("alt+shift+ctrl+1", "SuperRefBox全局加固引用2025年8月30日16:24:14", "🦸🔗", () => tomatoI18n.全局加固文档引用, false, superRefBoxGlobalLnkMenu)
export const SuperRefBox全局修复引用 = winHotkey("alt+shift+ctrl+2", "SuperRefBox修复文档引用2025年8月30日16:24:12", "🦸🔗", () => tomatoI18n.全局修复文档引用, false, superRefBoxGlobalFixMenu)

class SuperRefBox {
    async onload() {
        if (!superRefBoxCheckBox.get()) return;
        getTomatoPluginInstance().addCommand({
            langKey: SuperRefBox全局加固引用.langKey,
            langText: SuperRefBox全局加固引用.langText(),
            hotkey: SuperRefBox全局加固引用.m,
            callback: async () => {
                await scanAllRefsFast()
            },
        });
        getTomatoPluginInstance().eventBus.on("open-menu-content", async ({ detail: { menu } }) => {
            if (SuperRefBox全局加固引用.menu()) {
                menu.addItem({
                    label: SuperRefBox全局加固引用.langText(),
                    iconHTML: SuperRefBox全局加固引用.icon,
                    accelerator: SuperRefBox全局加固引用.m,
                    click: async () => {
                        await scanAllRefsFast()
                        await siyuan.pushMsg(SuperRefBox全局加固引用.langText())
                    }
                });
            }
        });

        getTomatoPluginInstance().addCommand({
            langKey: SuperRefBox全局修复引用.langKey,
            langText: SuperRefBox全局修复引用.langText(),
            hotkey: SuperRefBox全局修复引用.m,
            editorCallback: async (protyle) => {
                await fixRefs(events.getInfo(protyle).docID)
            },
        });
        getTomatoPluginInstance().eventBus.on("open-menu-content", async ({ detail: { menu, protyle } }) => {
            if (SuperRefBox全局修复引用.menu()) {
                menu.addItem({
                    label: SuperRefBox全局修复引用.langText(),
                    iconHTML: SuperRefBox全局修复引用.icon,
                    accelerator: SuperRefBox全局修复引用.m,
                    click: async () => {
                        await fixRefs(events.getInfo(protyle).docID)
                        await siyuan.pushMsg(SuperRefBox全局修复引用.langText())
                    }
                });
            }
        });
        events.addListener("super ref fasten 2025年8月30日16:52:04", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static || eventType == EventType.destroy_protyle || eventType == EventType.loaded_protyle_dynamic || eventType == EventType.switch_protyle) {
                const protyle: IProtyle = detail.protyle;
                return navigator.locks.request("scanDocRefs 2025年8月30日21:21:21", { mode: "exclusive" }, async (lock) => {
                    if (lock) {
                        await scanRefs(events.getInfo(protyle).docID, true);
                    }
                });
            }
        });
    }
}

async function fixRefs(docID?: string) {
    return navigator.locks.request("fixRefs 2025年8月30日21:21:21", { ifAvailable: true }, async (lock) => {
        if (lock) {
            await siyuan.pushMsg(SuperRefBox全局修复引用.langText() + " running")
            await _fixMissingRef(docID);
            await _fixWithNewRef();
            await siyuan.pushMsg(SuperRefBox全局修复引用.langText() + " done")
        } else {
            await siyuan.pushMsg(SuperRefBox全局修复引用.langText() + " running")
        }
    });
}

async function _fixMissingRef(docID?: string) {
    if (!docID) return;
    let refAttrs = await siyuan.sqlAttr(`select block_id,name,value from attributes 
        where block_id in (select block_id from refs where root_id="${docID}") 
        and name like "custom-ref-snapshot-%"
        limit 999999`);
    const set = new Set<string>();

    refAttrs = await refAttrs.asyncMap(async refSnap => {
        // 找到指向的ID
        refSnap.name = refSnap.name.replace("custom-ref-snapshot-", "");
        const c = siyuan.checkBlockExist(refSnap.name)
        // 查找这个ID是否还在其他块的属性上
        const srcRefID = await siyuan.sqlAttr(`select id from attributes where name="custom-ref-id" and value="${refSnap.name}"`)
        // 如果没有，考虑复活
        if (srcRefID.length == 0 && !(await c)) return refSnap
    });
    refAttrs = refAttrs.mapfilter(i => i);

    const ops: IOperation[] = []
    const lute = NewLute()
    for (let { name, value, block_id } of refAttrs) {
        if (set.has(name)) continue;
        const div = dom2div(lute.Md2BlockDOM(value))
        setAttribute(div, "data-node-id", name)
        setAttribute(div, "custom-ref-id", name)
        ops.extendArr(siyuan.transInsertBlocksAfter([div.outerHTML], block_id)); // 复活被删除的块，让悬空引用恢复正常。
        set.add(name);
    }
    await siyuan.transactions(ops);
}

async function _fixWithNewRef() {
    const srcAttrs = await siyuan.sqlAttr(`
        select block_id,value from attributes where name="custom-ref-id" and value!=block_id limit 999999
    `);

    for (const srcAttr of srcAttrs) {
        const oldID = srcAttr.value;
        const newID = srcAttr.block_id;
        // 找已经丢失的源块
        if (!await siyuan.checkBlockExist(oldID)) {
            // 找指向丢失的源块的引用
            const danglings = siyuan.sqlRef(`select block_id from refs where def_block_id="${oldID}" limit 999999`)
            const { markdown } = await siyuan.getBlockMarkdownAndContent(newID);
            const ops = [];
            // 悬空引用，指向新的块。
            for (const { block_id: danglingRefBlockID } of await danglings) {
                const { div } = await getBlockDiv(danglingRefBlockID); // 这个块内的引用悬空了，需要更新这个块中的 span 引用。
                div.setAttribute("custom-ref-snapshot-" + newID, markdown);
                div.removeAttribute("custom-ref-snapshot-" + oldID);
                div.querySelectorAll(`span[data-id="${oldID}"][data-type="block-ref"]`).forEach(e => {
                    setAttribute(e, "data-id", newID)
                });
                ops.extendArr(siyuan.transUpdateBlocks([{ id: danglingRefBlockID, domStr: div.outerHTML }]))
            }
            ops.extendArr(siyuan.transbatchSetBlockAttrs([{ id: newID, attrs: { "custom-ref-id": newID } }]))
            await siyuan.transactions(ops);
        }
    }
}

async function scanAllRefsFast() {
    return navigator.locks.request("scanAllRefsFast 2025年8月30日21:21:21", { ifAvailable: true }, async (lock) => {
        if (lock) {
            await siyuan.pushMsg(SuperRefBox全局加固引用.langText() + " running")
            await scanRefs("", false);
            await siyuan.pushMsg(SuperRefBox全局加固引用.langText() + " done")
        } else {
            await siyuan.pushMsg(SuperRefBox全局加固引用.langText() + " running")
        }
    });
}

async function scanRefs(docID: string, force: boolean) {
    const allRefs = await into(async () => {
        let wherePart = ""
        if (docID) {
            wherePart = ` where root_id="${docID}" `
        }
        return siyuan.sqlRef(`select def_block_id,block_id from refs ${wherePart} limit 99999999`);
    });

    const refRows = siyuan.getRows(allRefs.map(i => i.block_id).uniq(), "ial") //读取引用
    const srcRows = await siyuan.getRows(allRefs.map(i => i.def_block_id).uniq(), "ial,markdown,content") // 读取源

    const task1 = into(async () => {
        // 更新源的属性
        const params = srcRows.mapfilter(row => {
            if (row && !row.ial.includes("custom-ref-id")) {
                // 没有指向自己的属性，则添加。
                const newAttr = {} as AttrType;
                newAttr["custom-ref-id"] = row.id;
                return { id: row.id, attrs: newAttr }
            }
        });
        await siyuan.batchSetBlockAttrs(params); // 更新源，自己绑定自己的ID。
    });
    const task2 = into(async () => {
        const srcMap = srcRows.toMapUniq(r => [r.id, r]);
        const ref2src = allRefs.toMap(r => [r.block_id, r.def_block_id]);
        const params = (await refRows)
            .mapfilter(refBock => {
                if (refBock) {
                    return ref2src
                        .get(refBock.id)
                        .map(srcID => {
                            return { srcID, refBock }
                        });
                }
            })
            .flat()
            .mapfilter(({ srcID, refBock }) => {
                if (!refBock.ial.includes("custom-ref-snapshot-" + srcID) || force) {
                    // 没有快照，则添加
                    const src = srcMap.getOr(srcID, {})
                    const md = src.markdown || src.content;
                    if (md) {
                        const newAttr = {} as AttrType;
                        newAttr["custom-ref-snapshot-" + src.id] = md;
                        return { id: refBock.id, attrs: newAttr }
                    }
                }
            })
        await siyuan.batchSetBlockAttrs(params); // 给引用加快照
    });
    await task1
    await task2
}

export const superRefBox = new SuperRefBox();
