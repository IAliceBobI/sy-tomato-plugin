import { IProtyle } from "siyuan";
import { exportBlackList, exportCleanFiles, exportCleanFilesOn, exportCleanPath, exportIntervalSec, exportIntervalSecOn, exportPath, exportPathWin, exportWhiteList, exportWL4All, markdownExportBoxCheckbox, markdownExportPics } from "./libs/stores";
import { zipNways } from "./libs/functional";
import { siyuan, readAllFilePathIDs, Siyuan, chunks, sanitizePathSegment, getAttribute, getNotebookByID, osFs, osPath, timeUtil, sleep, NewLute, setAttribute, removeAttribute, getTomatoPluginInstance, getTomatoPluginConfig } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { events } from "./libs/Events";
import { lastVerifyResult, verifyKeyTomato } from "./libs/user";
import { getDocBlocks } from "./libs/docUtils";
import { winHotkey } from "./libs/winHotkey";
import { walkAndClean, cleanWalkPolicy, shouldAbortClean, WalkPolicy, NamingCtx, getNamingCtx } from "./libs/exportNaming";
import { pushUniq, setGlobal } from "stonev5-utils";

export const MarkdownExport增量导出 = winHotkey("alt+f6", "增量导出 2025-06-16 19:15:06", "", () => tomatoI18n.增量导出)
export const MarkdownExport确保导出符合配置 = winHotkey("alt+f7", "确保导出符合配置 2025-06-16 19:15:07", "", () => tomatoI18n.确保导出符合配置)
export const MarkdownExport全量导出 = winHotkey("alt+f8", "全量导出 2025-06-16 19:15:05", "", () => tomatoI18n.全量导出)


class MarkdownExportBox {
    protyle: IProtyle

    async onload() {
        if (!markdownExportBoxCheckbox.get()) return;
        if (!events.isDesktop) return;
        await verifyKeyTomato();

        getTomatoPluginInstance().addCommand({
            langKey: MarkdownExport全量导出.langKey,
            langText: MarkdownExport全量导出.langText(),
            hotkey: MarkdownExport全量导出.m,
            callback: () => {
                exportMd2Dir(true, true);
            },
        });

        getTomatoPluginInstance().addCommand({
            langKey: MarkdownExport增量导出.langKey,
            langText: MarkdownExport增量导出.langText(),
            hotkey: MarkdownExport增量导出.m,
            callback: () => {
                exportMd2Dir(false, true);
            },
        });

        getTomatoPluginInstance().addCommand({
            langKey: MarkdownExport确保导出符合配置.langKey,
            langText: MarkdownExport确保导出符合配置.langText(),
            hotkey: MarkdownExport确保导出符合配置.m,
            callback: () => {
                cleanExportedMds(true);
            },
        });

        // export workspace
        if (exportIntervalSecOn.get() && lastVerifyResult()) {
            let i = parseFloat(exportIntervalSec.get());
            if (Number.isNaN(i)) {
                i = 10;
            }
            if (i < 3) {
                i = 3;
                exportIntervalSec.write(i.toString())
            }
            clearInterval(setGlobal("export workspace Handle", setInterval(() => {
                exportMd2Dir(false, false);
            }, i * 1000)));
        }

        if (exportCleanFilesOn.get() && lastVerifyResult()) {
            let i = parseFloat(exportCleanFiles.get());
            if (Number.isNaN(i)) {
                i = 10;
            }
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
        });
    }
}

function ref2lnk(span: HTMLElement) {
    setAttribute(span, "data-type", "a")
    setAttribute(span, "data-href", "siyuan://blocks/" + getAttribute(span, "data-id"))
    removeAttribute(span, "data-subtype")
    removeAttribute(span, "data-id")
}

function getPath() {
    let path = exportPath.get()
    if (events.isWindows && exportPathWin.get()) {
        path = exportPathWin.get();
    }
    return path;
}

export async function exportMd2Dir(force = false, msg = true) {
    const dir = getPath()
    if (!dir?.trim()) return;
    navigator.locks.request("lock exportMd2Dir 2025-06-13 15:17:27", { ifAvailable: true }, async (lock) => {
        if (lock) {
            await _exportMd2Dir(dir, force, msg);
            markdownExportBoxCheckbox.write();
        } else {
            if (msg) await siyuan.pushMsg(tomatoI18n.导出工作空间正在进行中请稍后再试);
        }
    });
}

async function _exportMd2Dir(dir: string, force = false, msg = true) {
    if (!dir?.trim()) return;
    const KEY = "tomato exportMd2Dir maxUpdated";
    if (force) {
        getTomatoPluginConfig()[KEY] = "";
    }
    const maxUpdated = getTomatoPluginConfig()[KEY] ?? "";
    let docs = await siyuan.sql(`select * from blocks where type='d' and updated>'${maxUpdated}' order by updated asc limit 99999999`)
    // 白名单
    if (!exportWL4All.get()) {
        if (exportWhiteList.get().length > 0) {
            docs = docs.filter(d => {
                for (const w of exportWhiteList.get()) {
                    if (d.path.indexOf(w) >= 0) return true;
                }
            });
        }
    }
    // 黑名单
    docs = docs.filter(d => {
        for (const w of exportBlackList.get()) {
            if (d.path.indexOf(w) >= 0) return false;
        }
        return true;
    });
    if (docs.length == 0) {
        if (msg) await siyuan.pushMsg(tomatoI18n.没有需要导出的文档);
        return
    }
    // 干净路径：ctx 懒构建——多数 tick 零文档直接返回，不付磁盘走法的钱（60s TTL 跨 tick 复用）。
    // 构建失败退旧 #id 路径（唯一性恒成立），下个 tick / 清理收敛，方向安全。
    let ctx: NamingCtx | null = null;
    if (exportCleanPath.get()) {
        try {
            ctx = await getNamingCtx();
        } catch (e) {
            ctx = null;
        }
    }
    let acc = 0;
    for (const chunk of chunks(docs, 100)) {
        if (chunk.length == 0) continue;
        const fileNames = await parallelExport(chunk, dir, ctx)

        const updated = chunk.at(-1).updated;
        if (updated) {
            getTomatoPluginConfig()[KEY] = updated
        }

        if (msg) {
            acc += fileNames.length;
            await siyuan.pushMsg(`(${acc}/${docs.length})${tomatoI18n.导出工作空间}：${fileNames.join(", ")}`);
        }
    }
}

async function parallelExport(docs: Block[], dir: string, ctx: NamingCtx | null = null) {
    const tasks = docs.map(async doc => {
        // ctx 未收录（TTL 窗口内新建/笔记本失联/构建失败）→ 退旧 #id 路径（唯一性恒成立）
        const safePath = ctx?.getExpPath(doc, dir) ?? getExpPath(doc, dir);
        await writeDocMd(doc, safePath);
        return doc.content
    });
    return Promise.all(tasks);
}

// 共享写盘：图片分支（资源前缀改名 + 旧前缀清理）与 copyStdMarkdown 分支。
// parallelExport 与 checkSync 补写共用——修掉此前 checkSync 图片模式下补写内容仍引用
// assets/ 原路径、与导出时前缀改名不一致的 bug（spec「共享写盘函数」节）。
async function writeDocMd(doc: Block, safePath: string) {
    const fs = osFs();
    const ospath = osPath();
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

        for (const e of div.querySelectorAll(`span[data-type="text"]`)) {
            e.outerHTML = e.textContent;
        }
        const lute = NewLute()
        md = lute.BlockDOM2StdMd(div.innerHTML);
    } else {
        md = await siyuan.copyStdMarkdown(doc.id);
    }
    await fs.writeFile(safePath, md, { encoding: 'utf8' });
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
            const dir = getPath()
            if (!dir?.trim()) return;
            if (exportCleanPath.get()) {
                // 干净模式：期望集合成员判定（spec「清理流反转」节）。
                // 三道中止闸：① ctx 构建抛异常 → 中止并报错；② 枚举到 0 个文档 → 中止
                // （绝不拿空期望集合遍历删除）；③ 残余 SQL 带显式 limit（checkSync 原有 limit 9999999）。
                let ctx: NamingCtx;
                try {
                    ctx = await getNamingCtx(true);   // 清理永远现建：删除决策必须基于当下真相
                } catch (e) {
                    await siyuan.pushMsg("❌" + tomatoI18n.构建导出目录清单失败已中止清理);
                    return;
                }
                if (shouldAbortClean(ctx)) {
                    await siyuan.pushMsg("❌" + tomatoI18n.导出目录清单为空已中止清理);
                    return;
                }
                const { paths, ids } = ctx.expectedPathSet(dir, osPath(), {
                    wl: exportWhiteList.get(), bl: exportBlackList.get(), wl4all: exportWL4All.get(),
                });
                await walkAndClean(dir, osFs(), osPath(), cleanWalkPolicy(paths, markdownExportPics.get(), osPath()));
                await checkSync(dir, ids, ctx);
            } else {
                // 旧模式：ID/sy 双查，行为不变
                const { ids, pathes } = await readAllFilePathIDs(exportWhiteList.get(), exportBlackList.get(), false);
                const validIDs = new Set(ids);
                const patheSet = new Set(pathes);

                // 因为导出的地方有笔记本目录，patheSet只有.sy文件。所以补充上，防止误删。
                Siyuan.notebooks.forEach(n => patheSet.add(`${n.id}.sy`));
                Siyuan.notebooks.map(n => n.id).forEach(i => validIDs.add(i));
                await walkAndClean(dir, osFs(), osPath(), oldWalkPolicy(validIDs, patheSet));
                await checkSync(dir, validIDs);
            }
            if (msg) {
                await siyuan.pushMsg("✅" + tomatoI18n.确保导出符合配置)
            }
        }
    });
}

async function checkSync(expDir: string, validIDs: Set<string>, ctx: NamingCtx | null = null) {
    const fs = osFs();
    for (const batch of chunks([...validIDs], 300)) {
        const ids = batch.map(i => `"${i}"`).join(",")
        // content 列：图片分支 getDocBlocks 需要（共享 writeDocMd）
        const rows = await siyuan.sql(`select box,id,path,hpath,content,updated from blocks where id in (${ids}) limit 9999999 `)
        for (const row of rows) {
            sleep(10);
            const path = ctx?.getExpPath(row, expDir) ?? getExpPath(row, expDir)
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
            await writeDocMd(row, path);
        }
    }
}

// 旧模式策略（开关关）：ID/sy 双查，判定式与被替换的原递归删除函数逐条对齐，行为不变。
// keep = 目录段 ID 在 validIDs 且 .sy 路径在 pathes；文件在图片模式关时全查、开时仅 .md 参与（其余保留）。
// 注意 fileID 取自 portion（最后一个 # 之后）再去 .md——直接 basename 全名会得到「标题#id」误删旧模式文件。
function oldWalkPolicy(validIDs: Set<string>, pathes: Set<string>): WalkPolicy {
    return {
        keepDir: (name, fullPath) =>
            validIDs.has(getIDFromPortion(name)) && pathes.has(getSyPath(fullPath)),
        keepFile: (name, fullPath) => {
            const fileName = getIDFromPortion(name);
            let allow = fileName.endsWith(".md");
            if (!markdownExportPics.get()) {
                allow = true;
            }
            if (!allow) return true;
            const fileID = osPath().basename(fileName, ".md");
            return validIDs.has(fileID) && pathes.has(getSyPath(fullPath));
        },
    };
}

function getSyPath(fullPath: string) {
    const dir = getPath()
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
