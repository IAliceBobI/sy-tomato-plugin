// 附件整理：扫描 assets、按年月搬运并替换块内引用。从原 docUtils.ts 拆出（2026-08 重构），
// docUtils.ts 现为 re-export 桶。
import { Constants } from "siyuan";
import { events } from "./Events";
import { siyuan, chunks, readAllFiles, timeUtil } from "./utils";
import { SPACE } from "./gconst";
import { toolbarTidyExt } from "./stores";
import { reloadSelfPlugin } from "./pluginReload";
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

/** 搬运目标文件名净化：对齐内核 putFile 家族硬校验（util.FilterFileName+FilterUploadFileName，
 * kernel/api/file.go putFile→IsValidUploadFileName，issue 14658）——含 ' ( ) ! 等字符的名字
 * 会被 400 拒写。assets 根下的散文件常带这些字符（手动拷入的「截图 (1).png」等），不净化
 * 目标名则拷贝静默失败。规则：\ / : * ? " ' < > | 替换为 _；~ [ ] ( ) ! ` & { } = # % $ ; 删除；
 * 189 字节上限截断保扩展名（kernel/util TruncateLenFileName）。 */
export function sanitizeTidyFileName(name: string): string {
    let n = name.replace(/[\\/:*?"'<>|]/g, "_").replace(/[~[\]()!`&{}=%$#;]/g, "");
    const dot = n.lastIndexOf(".");
    const ext = dot > 0 ? n.slice(dot) : "";
    let stem = dot > 0 ? n.slice(0, dot) : n;
    const enc = new TextEncoder();
    while (stem && enc.encode(stem).length + enc.encode(ext).length > 189) {
        stem = stem.slice(0, -1);
    }
    return (stem + ext) || "renamed";
}

/** SQL 字符串字面量转义（单引号双写）。assets 表 path 直拼进 WHERE，文件名带单引号
 * 会让查询语法错误（siyuan.call 吞错返回 null，旧实现因此静默漏改引用=断链）。 */
export function sqlStr(s: string): string {
    return s.replaceAll("'", "''");
}

/** 当前工作空间 data 绝对目录（copyFile dest 必须绝对路径）。window.siyuan.workspaceDir
 * 恒空（HideConfSecret 家族）；config.system.dataDir 是内核注入的当前空间 data 目录
 * （实测 3.8.3 可用）。注意 getWorkspaces 返回全局空间列表（首项未必是当前空间），
 * 不可作 fallback——拿不到就返回空串让拷贝失败，验证后删防线保住原件（宁可不搬不错搬）。 */
export async function getDataDir(): Promise<string> {
    const d = (window as any).siyuan?.config?.system?.dataDir;
    return (typeof d === "string" && d) ? d : "";
}

/** 题头图引用地图：文档 IAL 的 title-img 不进 assets 表，搬走文件前先查出来逐文件改写，
 * 否则题头图断链。返回 [{id, value}]，value 为 title-img 原始值（可能带 ? 参数）。 */
async function collectTitleImageDocs(): Promise<{ id: string; value: string }[]> {
    // LIKE 只匹配常量前缀（路径里的 % _ 免当通配符），精确比对交给 getBlockAttrs 后的 includes
    const docs = await siyuan.sql(`SELECT id FROM blocks WHERE type='d' AND ial LIKE '%title-img=%' LIMIT 10000`);
    const ret: { id: string; value: string }[] = [];
    for (const doc of docs ?? []) {
        const attrs = await siyuan.getBlockAttrs(doc.id);
        const v = attrs?.["title-img"];
        if (v) ret.push({ id: doc.id, value: v });
    }
    return ret;
}

export async function moveAndReplace(
    files: { name: string }[],
    yearMonth?: string[]
): Promise<{ oldPath: string; newPath: string; success: boolean }[]> {
    const ym = yearMonth ?? timeUtil.dateFormatDay(new Date()).split("-");
    const records: { oldPath: string; newPath: string; success: boolean }[] = [];
    const dataDir = await getDataDir();
    const titleImgDocs = await collectTitleImageDocs();
    const usedPaths = new Set<string>();
    let i = 0;
    let count = 0;
    for (const fileArr of chunks(files, 100)) {
        ++i;
        for (const file of fileArr) {
            // 目标名净化 + 同批撞名兜底（净化可能把两个脏名收敛成同一个）
            let safeName = sanitizeTidyFileName(file.name);
            const newDir = `assets/pics/${ym[0]}/${ym[1]}-${i}`;
            while (usedPaths.has(`${newDir}/${safeName}`)) {
                const dot = safeName.lastIndexOf(".");
                safeName = (dot > 0 ? safeName.slice(0, dot) : safeName) + "-" + records.length + (dot > 0 ? safeName.slice(dot) : "");
            }
            const oldpath = `assets/${file.name}`;
            const newpath = `${newDir}/${safeName}`;
            try {
                // ① 内核侧拷贝（filelock.Copy 零内存中转，src/dest 无文件名字符校验）。
                //    siyuan.call 吞 code 成败不可辨，靠 ② 独立验证兜底
                await siyuan.copyFile(oldpath, `${dataDir}/${newpath}`);
                // ② 验证目标真实存在，不存在绝不删原件（旧实现在此静默丢文件）。
                //    statAsset 收 assets/ 资源相对路径（支持子目录），文件不存在时 data 为空
                const info = await siyuan.statAsset(newpath);
                if (!info) {
                    records.push({ oldPath: oldpath, newPath: newpath, success: false });
                    continue;
                }
                usedPaths.add(newpath);
                // ③ assets 表引用块逐个改写（SQL 转义防脏名语法错；孤儿记录 getBlockKramdown
                //    为 null 直接跳过，不算失败）
                let refFail = 0;
                const refs = await siyuan.sqlAsset(`SELECT block_id FROM assets WHERE path='${sqlStr(oldpath)}'`);
                for (const ref of refs ?? []) {
                    const { kramdown } = await siyuan.getBlockKramdown(ref.block_id);
                    if (!kramdown) continue;
                    const updated = await siyuan.updateBlock(ref.block_id, kramdown.replaceAll(oldpath, newpath), "markdown");
                    if (!updated) refFail++;
                }
                // ④ 题头图跟随改写（就地更新 value 防同值重复替换）
                for (const t of titleImgDocs) {
                    if (t.value.includes(oldpath)) {
                        const v = t.value.replaceAll(oldpath, newpath);
                        await siyuan.setBlockAttrs(t.id, { "title-img": v });
                        t.value = v;
                    }
                }
                // ⑤ 引用块改写有失败则不删原件（双份可接受，重跑即重试；断链不可接受）
                if (refFail > 0) {
                    records.push({ oldPath: oldpath, newPath: newpath, success: false });
                    continue;
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
            const records = await moveAndReplace(pics);
            const okCount = records.filter(r => r.success).length;
            const failCount = records.length - okCount;
            if (failCount > 0) {
                // 失败=原件保留原位未删（验证后删防线），重跑即重试
                siyuan.pushMsg(tomatoI18n.assets整理x成功y失败(okCount, failCount), 10000);
            } else {
                siyuan.pushMsg(tomatoI18n.assets整理了x个文件(okCount));
            }
            // 引用块已走 updateBlock 事务（广播刷新编辑器），重载插件即够
            await reloadSelfPlugin();
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
