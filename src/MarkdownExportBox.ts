import { IProtyle } from "siyuan";
import { exportBlackList, exportCleanFiles, exportCleanFilesOn, exportIntervalSec, exportIntervalSecOn, exportPath, exportWhiteList, markdownExportBoxCheckbox, markdownExportPics } from "./libs/stores";
import { setGlobal } from "./libs/globalUtils";
import { zipNways } from "./libs/functional";
import { siyuan, readAllFilePathIDs, Siyuan, chunks, sanitizePathSegment, getAttribute, pushUniq, getNotebookByID, osFs, osPath, timeUtil, sleep, NewLute, setAttribute, removeAttribute, getPlugin } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { events } from "./libs/Events";
import { lastVerifyResult, verifyKeyTomato } from "./libs/user";
import { getDocBlocks } from "./libs/docUtils";
import { winHotkey } from "./libs/winHotkey";

export const MarkdownExport增量导出 = winHotkey("alt+f6", "增量导出 2025-06-16 19:15:06", "", () => tomatoI18n.增量导出)
export const MarkdownExport确保导出符合配置 = winHotkey("alt+f7", "确保导出符合配置 2025-06-16 19:15:07", "", () => tomatoI18n.确保导出符合配置)
export const MarkdownExport全量导出 = winHotkey("alt+f8", "全量导出 2025-06-16 19:15:05", "", () => tomatoI18n.全量导出)


class MarkdownExportBox {
    protyle: IProtyle

    async onload() {
        if (!markdownExportBoxCheckbox.get()) return;
        if (!events.isDesktop) return;
        await verifyKeyTomato();

        getPlugin().addCommand({
            langKey: MarkdownExport全量导出.langKey,
            langText: MarkdownExport全量导出.langText(),
            hotkey: MarkdownExport全量导出.m,
            callback: () => {
                exportMd2Dir(true, true);
            },
        });

        getPlugin().addCommand({
            langKey: MarkdownExport增量导出.langKey,
            langText: MarkdownExport增量导出.langText(),
            hotkey: MarkdownExport增量导出.m,
            callback: () => {
                exportMd2Dir(false, true);
            },
        });

        getPlugin().addCommand({
            langKey: MarkdownExport确保导出符合配置.langKey,
            langText: MarkdownExport确保导出符合配置.langText(),
            hotkey: MarkdownExport确保导出符合配置.m,
            callback: () => {
                cleanExportedMds(true);
            },
        });

        // export workspace
        if (exportIntervalSecOn.get()) {
            let i = parseFloat(exportIntervalSec.get());
            if (i < 3) {
                i = 3;
                exportIntervalSec.write(i.toString())
            }
            clearInterval(setGlobal("export workspace Handle", setInterval(() => {
                exportMd2Dir(false, false);
            }, i * 1000)));
        }

        if (exportCleanFilesOn.get()) {
            let i = parseFloat(exportCleanFiles.get());
            if (i < 3) {
                i = 3;
                exportCleanFiles.write(i.toString())
            }
            clearInterval(setGlobal("cleanExportedMds 2025-06-13 16:06:30", setInterval(() => {
                navigator.locks.request("lock cleanExportedMds 2025-06-13 15:17:27", { ifAvailable: true }, async (lock) => {
                    if (lock) {
                        cleanExportedMds(false);
                    }
                });
            }, i * 60 * 1000)));
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

function ref2lnk(span: HTMLElement) {
    setAttribute(span, "data-type", "a")
    setAttribute(span, "data-href", "siyuan://blocks/" + getAttribute(span, "data-id"))
    removeAttribute(span, "data-subtype")
    removeAttribute(span, "data-id")
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
    const ospath = osPath();
    const tasks = docs.map(async doc => {
        const safePath = getExpPath(doc, dir);
        await fs.mkdir(ospath.dirname(safePath), { recursive: true });
        let md = ""
        if (markdownExportPics.get()) {
            const destMdDir = ospath.dirname(safePath);
            const prefix = ospath.basename(safePath).replaceAll("-", "").replaceAll("#", "") + ".";

            for (const f of await fs.readdir(destMdDir)) {
                if (f.startsWith(prefix)) {
                    try {
                        await fs.unlink(ospath.join(destMdDir, f));
                    } catch (e) { }
                }
            }

            async function setSrcAndCopyPic(e: Element, attr: AttrKey) {
                const dataFilePath = getAttribute(e, attr);
                const fileName = prefix + ospath.basename(dataFilePath)
                setAttribute(e, attr, fileName);
                const destFile = ospath.join(destMdDir, fileName);
                try {
                    await fs.access(destFile);
                    // File exists, do not copy
                } catch {
                    // File does not exist, copy it
                    await fs.copyFile(
                        ospath.join(Siyuan.config.system.dataDir, dataFilePath),
                        destFile
                    );
                }
            }
            const { div } = await getDocBlocks(doc.id, doc.content, false, true, 1)
            div.querySelectorAll(`span[data-type="block-ref"]`).forEach(e => {
                ref2lnk(e as any);
            })
            for (const e of div.querySelectorAll(`[data-src^="assets/"]`)) {
                await setSrcAndCopyPic(e, "data-src")
            }

            for (const e of div.querySelectorAll(`[src^="assets/"]`)) {
                await setSrcAndCopyPic(e, "src")
            }

            for (const e of div.querySelectorAll(`[data-href^="assets/"]`)) {
                await setSrcAndCopyPic(e, "data-href")
            }

            for (const e of div.querySelectorAll(`[href^="assets/"]`)) {
                await setSrcAndCopyPic(e, "href")
            }
            const lute = NewLute()
            md = lute.BlockDOM2StdMd(div.innerHTML);
        } else {
            md = await siyuan.copyStdMarkdown(doc.id);
        }
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
            const { ids, pathes } = await readAllFilePathIDs(exportWhiteList.get(), lastVerifyResult() ? exportBlackList.get() : [], false);
            const validIDs = new Set(ids);
            const patheSet = new Set(pathes);

            // 因为导出的地方有笔记本目录，patheSet只有.sy文件。所以补充上，防止误删。
            Siyuan.notebooks.forEach(n => patheSet.add(`${n.id}.sy`));

            Siyuan.notebooks.map(n => n.id).forEach(i => validIDs.add(i));
            await readAndDel(dir, validIDs, patheSet);
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

async function readAndDel(dirPath: string, validIDs: Set<string>, pathes: Set<string>) {
    const fs = osFs();
    const ospath = osPath();
    try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        for (const item of items) {
            const fullPath = ospath.join(dirPath, item.name);
            const dirID = getIDFromPortion(item.name);
            if (item.isDirectory()) {
                // no ".md"
                if (!validIDs.has(dirID)) {
                    await fs.rm(fullPath, { recursive: true, force: true })
                    continue;
                }
                if (!pathes.has(getSyPath(fullPath))) {
                    await fs.rm(fullPath, { recursive: true, force: true })
                    continue;
                }
                await readAndDel(fullPath, validIDs, pathes)
            } else {
                // has ".md"
                const fileName = dirID;
                const fileID = ospath.basename(fileName, ".md");
                let allow = fileName.endsWith(".md")
                if (!markdownExportPics.get()) {
                    allow = true;
                }
                if (allow && !validIDs.has(fileID)) {
                    await fs.rm(fullPath, { force: true })
                }
                if (allow && !pathes.has(getSyPath(fullPath))) {
                    await fs.rm(fullPath, { force: true })
                }
            }
        }
    } catch (e) { }
}

function getSyPath(fullPath: string) {
    const dir = exportPath.get()
    let syPath = fullPath
        .replace(dir, "")
        .split(/[\\/]/g) // windows or linux path
        .map(i => i.split("#").at(-1))
        .filter(i => !!i)
        .join("/");
    if (syPath.endsWith(".md"))
        syPath = syPath.slice(0, -3) + ".sy"
    else
        syPath += ".sy"
    return syPath
}

function getIDFromPortion(p: string) {
    return p.split("#").at(-1);
}

export const markdownExportBox = new MarkdownExportBox();
