// 附件整理：扫描 assets、按年月搬运并替换块内引用。从原 docUtils.ts 拆出（2026-08 重构），
// docUtils.ts 现为 re-export 桶。
import { Constants } from "siyuan";
import { events } from "./Events";
import { siyuan, chunks, readAllFiles, timeUtil } from "./utils";
import { SPACE } from "./gconst";
import { toolbarTidyExt } from "./stores";
import { tomatoI18n, TomatoI18n } from "../tomatoI18n";
import { zipNways } from "./functional";

export type SyFileEntry = { content: string; modified: boolean };

export function buildExts(): string[] {
    return toolbarTidyExt.get()
        .replaceAll(SPACE, " ")
        .split(" ")
        .extend(...Constants.SIYUAN_ASSETS_IMAGE)
        .extend(...Constants.SIYUAN_ASSETS_AUDIO)
        .extend(...Constants.SIYUAN_ASSETS_VIDEO)
        .mapfilter(i => {
            i = i.trim()
            if (i) {
                if (i.startsWith(".")) {
                    return i
                } else {
                    return "." + i
                }
            }
        })
        .map(i => i.toLocaleLowerCase())
        .uniq()
}

export async function scanAssetFiles(exts?: string[]): Promise<{ isDir: boolean; isSymlink: boolean; name: string; updated: string }[]> {
    const extensions = exts ?? buildExts();
    const files = await siyuan.readDir("/data/assets");
    return files?.filter(file => !file.isDir && !file.isSymlink)
        ?.filter(file => {
            const name = file.name.toLowerCase();
            for (const ext of extensions) {
                if (name.endsWith(ext)) return true;
            }
        }) ?? [];
}

export async function readSyFiles(exts?: string[]): Promise<Map<string, SyFileEntry>> {
    const extensions = exts ?? buildExts();
    const pathes = await readAllFiles();
    const ret: [string, string][] = [];
    for (const ps of chunks(pathes, 50)) {
        const contents = await Promise.all(ps.map(f => siyuan.getFile(f)));
        ret.push(...zipNways(ps, contents));
        siyuan.pushMsg(`read: ${ret.length}/${pathes.length}`);
    }
    return new Map(
        ret.filter(([_k, f]) => {
            for (const e of extensions) {
                if (f.includes(e)) return true;
            }
        }).map(([k, v]) => [k, { content: v, modified: false }] as [string, SyFileEntry])
    );
}

export async function createTidySnapshot(): Promise<void> {
    await siyuan.createSnapshot("tomato-tidyAssets");
}

export async function moveAndReplace(
    files: { name: string }[],
    yearMonth?: string[]
): Promise<{ oldPath: string; newPath: string; success: boolean }[]> {
    const ym = yearMonth ?? timeUtil.dateFormatDay(new Date()).split("-");
    const records: { oldPath: string; newPath: string; success: boolean }[] = [];
    let i = 0;
    let count = 0;
    for (const fileArr of chunks(files, 100)) {
        ++i;
        for (const file of fileArr) {
            const oldpath = `assets/${file.name}`;
            const newpath = `assets/pics/${ym[0]}/${ym[1]}-${i}/${file.name}`;
            try {
                await siyuan.copyFile2("data/" + oldpath, "data/" + newpath);
                // 通过 assets 表找到引用该文件的 block，用 block API 更新（避免 putFile 被编辑器缓存覆盖）
                const refs = await siyuan.sqlAsset(`SELECT block_id FROM assets WHERE path='${oldpath}'`);
                for (const ref of refs ?? []) {
                    const { kramdown } = await siyuan.getBlockKramdown(ref.block_id);
                    if (kramdown) {
                        const newMd = kramdown.replaceAll(oldpath, newpath);
                        await siyuan.updateBlock(ref.block_id, newMd, "markdown");
                    }
                }
                await siyuan.removeFile("data/" + oldpath);
                records.push({ oldPath: oldpath, newPath: newpath, success: true });
            } catch (e) {
                records.push({ oldPath: oldpath, newPath: newpath, success: false });
            }
            count++;
            if (count % 20 === 0) siyuan.pushMsg(tomatoI18n.已经处理了x个块(count, files.length, 0));
        }
    }
    return records;
}

export async function saveModifiedFiles(syFiles: Map<string, SyFileEntry>): Promise<number> {
    const save = [...syFiles.entries()]?.filter(([_k, v]) => v.modified)?.map(([k, v]) => siyuan.putFile(k, v.content));
    if (!(save?.length > 0)) {
        siyuan.pushMsg("no modified files");
        return 0;
    }
    let saveCount = 0;
    for (const t of chunks(save, 50)) {
        await Promise.all(t);
        saveCount += t.length;
        siyuan.pushMsg(`save: ${saveCount}/${save.length}`);
    }
    return save.length;
}

export async function tidyAssets(tomatoI18n: TomatoI18n) {
    if (!events.isDesktop) {
        siyuan.pushMsg("can only run in desktop env.");
        return;
    }

    return navigator.locks.request("tomato-tidyAssets-lock", { ifAvailable: true }, async (lock) => {
        if (lock) {
            if (!(await siyuan.getConf())?.conf?.repo?.key) {
                await siyuan.pushMsg(tomatoI18n.你还没秘钥插件无法为您创建本地快照, 0)
                return;
            }

            const exts = buildExts();

            await createTidySnapshot();
            const pics = await scanAssetFiles(exts);
            if (!(pics?.length > 0)) {
                siyuan.pushMsg("pics not found");
                return;
            }

            await siyuan.pushMsg("load all pics");
            await moveAndReplace(pics);
            siyuan.pushMsg(tomatoI18n.assets整理了x个文件(pics.length));
            window.location.reload();
        } else {
            siyuan.pushMsg(tomatoI18n.assets整理还在进行中);
        }
    });
}

export const assetsApi = {
    buildExts,
    scanAssetFiles,
    readSyFiles,
    createSnapshot: createTidySnapshot,
    moveAndReplace,
    saveModifiedFiles,
    tidy: () => tidyAssets(tomatoI18n),
};
