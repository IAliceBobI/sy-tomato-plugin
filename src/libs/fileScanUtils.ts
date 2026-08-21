// 文件全量扫描 / 无效数据库清理 / 插件配置文件健康检查。
// 从原 siyuanApi.ts 拆出（2026-08 重构），siyuanApi.ts 负责 re-export 保持历史导入路径。
import { siyuan } from "./siyuanApi";
import { events } from "./Events";
import { chunks } from "./miscUtils";

function recursiveFlat(tree: RetListDocTreeDir, ids: Set<string> = new Set()) {
    if (!tree) return ids;
    tree.path = (tree.path ?? "") + "/" + tree.id;
    ids.add(tree.path + ".sy");
    if (tree.children) {
        for (const c of tree.children) {
            c.path = tree.path;
            recursiveFlat(c, ids);
        }
    }
    return ids;
}

async function getAllFileIDs() {
    // 思源 3.7.2+ 起 /api/filetree/listDocTree 增加了 IsSubPath 越界校验，
    // path:"/" 经 filepath.Join 后等于 notebook 根目录本身，而 gulu.IsSubPath 对
    // 「路径相等」返回 false，故被拒（code -1 "path escapes notebook directory"）。
    // 改用 readDir 列举 notebook 根目录的顶层条目，再对每个子目录调用 listDocTree 取子树。
    // 详见 https://github.com/IAliceBobI/sy-tomato-plugin/issues/79
    const books = await siyuan.lsNotebooks();
    const nodeIDPattern = /^\d{14}-[a-z0-9]+$/;
    const allIDs = new Set<string>();
    await Promise.all(books.map(async (b) => {
        try {
            const entries = await siyuan.readDir("/data/" + b.id);
            if (!entries) return;
            for (const e of entries) {
                if (e.isDir) {
                    if (!nodeIDPattern.test(e.name)) continue; // 跳过 .siyuan 等非文档目录
                    const dirID = e.name;
                    const sub = await siyuan.listDocTree(b.id, "/" + dirID);
                    if (!sub?.tree) continue;
                    for (const root of sub.tree) {
                        root.box = b.id;
                        root.path = "/" + b.id + "/" + dirID;
                        for (const p of recursiveFlat(root)) allIDs.add(p);
                    }
                } else if (e.name.endsWith(".sy")) {
                    const id = e.name.slice(0, -3);
                    if (!nodeIDPattern.test(id)) continue;
                    allIDs.add("/" + b.id + "/" + e.name);
                }
            }
        } catch (e) {
            // 单个 notebook 失败（加密锁定 / 已关闭 / 权限不足）不中断整体
        }
    }));
    return allIDs;
}

export async function readAllFiles(av = true) {
    const pathes1 = getAllFileIDs().then(p => [...p.values()].map(i => "/data" + i));
    let pathes2: string[] = [];
    if (av) {
        const dbPath = "/data/storage/av";
        pathes2 = await siyuan.readDir(dbPath).then(i => {
            return i?.filter(i => i.name.endsWith(".json"))?.map(i => dbPath + "/" + i.name) ?? []
        })
    }
    return [await pathes1, pathes2].flat()
}

export async function readAllFilePathIDs(whitelistIDs: string[], blacklistIDs: string[], av: boolean) {
    let pathes = await readAllFiles(av);
    if (whitelistIDs?.length > 0) {
        pathes = pathes.filter(p => {
            for (const v of whitelistIDs) {
                if (p.includes(v)) return true;
            }
        })
    }
    if (blacklistIDs?.length > 0) {
        pathes = pathes.filter(p => {
            for (const v of blacklistIDs) {
                if (p.includes(v)) return false;
            }
            return true;
        })
    }
    pathes = pathes.map(p => p.replace("/data/storage/av/", "").replace("/data/", "")).filter(p => !!p);
    const ids = pathes.map(path => {
        // if (!path.includes(".sy")) {
        //     throw new Error(`Invalid file path: "${path}". Expected a path containing ".sy".`);
        // }
        path = path.slice(0, -3);
        return path.split("/")
    }).flat().filter(i => !!i)
    return { ids, pathes };
}

export async function getPluginSpec(name: string): Promise<PluginSpec> {
    return (await siyuan.getJson(`/data/plugins/${name}/plugin.json`)) ?? {};
}

export async function tryFixCfg(pluginName: string, fileName: string) {
    try {
        const path = `data/storage/petal/${pluginName}/${fileName}`;
        const ret = await siyuan.getJson(path);
        if (!ret) {
            await siyuan.removeFile(path)
        }
    } catch { }
}

export async function getAllFilesAsBigText() {
    return await readAllFiles()
        .then(async pathes => {
            const ret: string[] = []
            for (const ps of chunks(pathes, 50)) {
                const contents = await Promise.all(ps.map(f => siyuan.getFile(f)))
                ret.push(...contents);
            }
            return ret;
        })
        .then(files => files.join(""));
}

export async function cleanDataview(bigText?: string) {
    if (!events.isDesktop) {
        siyuan.pushMsg("can only run in desktop env.");
        return;
    }
    siyuan.pushMsg("Start to delete invalid databases.")
    if (!bigText) {
        await siyuan.createSnapshot("delete invalid databases.");
        bigText = await getAllFilesAsBigText()
    }
    let avIDs = await siyuan.readDir("/data/storage/av")
        .then(list => list.map(i => {
            const parts = i.name.split(".")
            const ext = parts.pop()
            if (ext === "json") {
                return parts.join(".")
            }
        }))
        .then(i => i.filter(j => !!j))
    avIDs = avIDs.filter(id => {
        const v1 = bigText.includes(`"AttributeViewID":"${id}"`)
        const v2 = bigText.includes(`"AttributeViewID": "${id}"`)
        return !(v1 || v2)
    });
    for (const id of avIDs) {
        await siyuan.removeFile(`/data/storage/av/${id}.json`);
        siyuan.pushMsg("delete database: " + id)
    }
    siyuan.pushMsg(`${avIDs.length} invalid databases have been deleted.`)
}
