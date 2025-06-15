import { IProtyle } from "siyuan";
import { exportBlackList, exportCleanFiles, exportIntervalSec, exportPath, exportWhiteList, markdownExportBoxCheckbox } from "./libs/stores";
import { setGlobal } from "./libs/globalUtils";
import { zipNways } from "./libs/functional";
import { siyuan, readAllFilePathIDs, Siyuan, chunks, sanitizePathSegment, getAttribute, pushUniq, getNotebookByID, osFs, osPath, timeUtil, sleep } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { events } from "./libs/Events";
import { lastVerifyResult, verifyKeyTomato } from "./libs/user";

class MarkdownExportBox {
    protyle: IProtyle

    async onload() {
        if (!markdownExportBoxCheckbox.get()) return;
        if (!events.isDesktop) return;
        await verifyKeyTomato();

        // export workspace
        if (exportIntervalSec.get()) {
            let i = parseFloat(exportIntervalSec.get());
            if (i > 0) {
                if (i < 3) i = 3;
                clearInterval(setGlobal("export workspace Handle", setInterval(() => {
                    exportMd2Dir(false, false);
                }, i * 1000)));
            }
        }

        if (exportCleanFiles.get()) {
            let i = parseFloat(exportCleanFiles.get());
            if (i > 0) {
                if (i < 3) i = 3;
                clearInterval(setGlobal("cleanExportedMds 2025-06-13 16:06:30", setInterval(() => {
                    navigator.locks.request("lock cleanExportedMds 2025-06-13 15:17:27", { ifAvailable: true }, async (lock) => {
                        if (lock) {
                            cleanExportedMds(false);
                        }
                    });
                }, i * 60 * 1000)));
            }
        }

        events.addListener_open_menu_doctree("2025-06-14 17:40:38 添加到导出列表", (detial) => {
            const ids = [...detial.elements]
                .map(e => getAttribute(e, "data-node-id"))
                .filter(i => !!i);
            if (ids.length > 0) {
                detial.menu.addItem({
                    label: tomatoI18n.添加到导出工作空间的白名单,
                    iconHTML: "✅",
                    click: async () => {
                        const arr = pushUniq(null, ...exportWhiteList.get(), ...ids)
                        exportWhiteList.set(arr)
                        exportWhiteList.write();
                        await siyuan.pushMsg(tomatoI18n.添加了x个文件夹(ids.length))
                    }
                });
                if (lastVerifyResult()) {
                    detial.menu.addItem({
                        label: tomatoI18n.添加到导出工作空间的黑名单,
                        iconHTML: "🚫",
                        click: async () => {
                            const arr = pushUniq(null, ...exportBlackList.get(), ...ids)
                            exportBlackList.set(arr)
                            exportBlackList.write();
                            await siyuan.pushMsg(tomatoI18n.添加了x个文件夹(ids.length))
                        }
                    });
                }
            }
        });
    }
}

export async function exportMd2Dir(force = false, msg = true) {
    const dir = exportPath.get()
    if (!dir?.trim()) return;
    navigator.locks.request("lock exportMd2Dir 2025-06-13 15:17:27", { ifAvailable: true }, async (lock) => {
        if (lock) {
            await _exportMd2Dir(dir, force, msg);
        } else {
            if (msg) await siyuan.pushMsg(tomatoI18n.导出工作空间正在进行中请稍后再试);
        }
    });
}

async function _exportMd2Dir(dir: string, force = false, msg = true) {
    if (!dir?.trim()) return;
    const KEY = "tomato exportMd2Dir maxUpdated";
    if (force) localStorage.setItem(KEY, "")
    const maxUpdated = localStorage.getItem(KEY) ?? "";
    let docs = await siyuan.sql(`select * from blocks where type='d' and updated>'${maxUpdated}' order by updated asc limit 99999999`)
    // 白名单
    docs = docs.filter(d => {
        for (const w of exportWhiteList.get()) {
            if (d.path.indexOf(w) >= 0) return true;
        }
    });
    if (lastVerifyResult()) {
        // 黑名单
        docs = docs.filter(d => {
            for (const w of exportBlackList.get()) {
                if (d.path.indexOf(w) >= 0) return false;
            }
            return true;
        });
    }
    if (docs.length == 0) {
        if (msg) await siyuan.pushMsg(tomatoI18n.没有需要导出的文档);
        return
    }
    let acc = 0;
    for (const chunk of chunks(docs, 100)) {
        if (chunk.length == 0) continue;
        const fileNames = await parallelExport(chunk, dir)

        const updated = chunk.at(-1).updated;
        if (updated) localStorage.setItem(KEY, updated);

        if (msg) {
            acc += fileNames.length;
            await siyuan.pushMsg(`(${acc}/${docs.length})${tomatoI18n.导出工作空间}：${fileNames.join(", ")}`);
        }
    }
}

async function parallelExport(docs: Block[], dir: string) {
    const fs = osFs();
    const path = osPath();
    const tasks = docs.map(async doc => {
        const safePath = getExpPath(doc, dir);
        await fs.mkdir(path.dirname(safePath), { recursive: true });
        const md = await siyuan.copyStdMarkdown(doc.id);
        await fs.writeFile(safePath, md, { encoding: 'utf8' });
        return doc.content
    });
    return Promise.all(tasks);
}

function getExpPath(doc: Block, dir: string) {
    const path = osPath();
    const hpathParts = doc?.hpath?.split("/")?.slice(1) ?? [];
    const pathParts = doc?.path?.split("/")?.slice(1) ?? [];
    if (hpathParts.length == 0 || pathParts.length == 0) return "";

    hpathParts.splice(0, 0, getNotebookByID(doc.box)?.name ?? "");
    pathParts.splice(0, 0, doc.box);

    const sypath = zipNways(hpathParts, pathParts)
        .map(([h, p]) => h + "#" + p)
        .filter(i => !!i && i != "#")
        .map(i => sanitizePathSegment(i));

    const docName = sypath.pop().slice(0, -3) + ".md";
    const safePath = path.normalize(path.join(dir, ...sypath, docName));
    return safePath;
}

export async function cleanExportedMds(msg = true) {
    navigator.locks.request("lock cleanExportedMds 2025-06-13 15:17:27", { ifAvailable: true }, async (lock) => {
        if (lock) {
            const dir = exportPath.get()
            if (!dir?.trim()) return;
            const validIDs = await readAllFilePathIDs(exportWhiteList.get(), lastVerifyResult() ? exportBlackList.get() : [], false);
            Siyuan.notebooks.map(n => n.id).forEach(i => validIDs.add(i));
            await readAndDel(dir, validIDs);
            await checkSync(dir, validIDs);
            if (msg) {
                await siyuan.pushMsg("✅" + tomatoI18n.确保导出符合配置)
            }
        }
    });
}

async function checkSync(expDir: string, validIDs: Set<string>) {
    const fs = osFs();
    const ospth = osPath();
    for (const batch of chunks([...validIDs], 300)) {
        const ids = batch.map(i => `"${i}"`).join(",")
        const rows = await siyuan.sql(`select box,id,path,hpath,updated from blocks where id in (${ids}) limit 9999999 `)
        for (const row of rows) {
            sleep(10);
            const path = getExpPath(row, expDir)
            if (!path) continue;
            let mtime: Date;
            try {
                mtime = await fs.stat(path).then(s => s.mtime)
            } catch (e) { }
            if (mtime) {
                const dbTime = timeUtil.dateFromYYYYMMDDHHmmssShort(row.updated);
                if (dbTime <= mtime) {
                    continue;
                }
            }
            const md = await siyuan.copyStdMarkdown(row.id);
            await fs.mkdir(ospth.dirname(path), { recursive: true });
            await fs.writeFile(path, md)
        }
    }
}

async function readAndDel(dirPath: string, validIDs: Set<string>) {
    const fs = osFs();
    const path = osPath();
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const dirID = getIDFromPortion(item.name);
        if (item.isDirectory()) {
            if (!validIDs.has(dirID)) {
                fs.rm(fullPath, { recursive: true, force: true })
            } else {
                await readAndDel(fullPath, validIDs)
            }
        } else {
            const fileID = path.basename(dirID, ".md");
            if (!validIDs.has(fileID)) {
                fs.rm(fullPath, { force: true })
            }
        }
    }
}

function getIDFromPortion(p: string) {
    return p.split("#").at(-1);
}

export const markdownExportBox = new MarkdownExportBox();
