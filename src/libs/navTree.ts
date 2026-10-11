// 悬浮球十字罗盘导航（nav compass）数据层。
// 设计事实源：docs/checkpoints/2026-10-10-nav-compass-floatball.md「数据层 navTree.ts」节——
// 罗盘打开瞬间现拉（不做常驻监听），由当前文档 docID（调用方取 events.docID，本模块不耦合
// Events）解析 ↑父/↓首子/←前兄/→后兄 四方向目标与兄弟位次：
//   ① blocks SQL 拿 box+path（物理 .sy 路径、box 相对——exportNaming syPath 同口径；
//     SQL 形态沿 siyuanApi renameDocByID/removeDocByID 先例，id 为内核生成串无引号注入面）
//   ② listDocsByPath(父目录) 一次 → 全部兄弟+自己位次+左右邻居（sort=15 文档自定义序，
//     与文件树显示序同源；maxListCount=0 防 512 截尾）
//   ③ listDocsByPath(当前目录) 一次 → 子文档列表（→首子）
// 父文档 id 无需再查（执行期已查证，spec 所留「按 path 求父 id」悬案落地）：盘上目录段即
// 文档 id——kernel model/box.go Ls 直接 os.ReadDir(data/<box>/<path>)，exportNaming 的
// NODE_ID 段形态互证——父目录末段就是父 doc id，只补一次 SQL 拿父标题做 ↑ 预览。
// 会话内轻缓存：同 docID 重复打开罗盘不重拉；导航动作后调 invalidateNavCache() 失效重拉；
// 失败结果不进缓存（错误态点重试=真重拉）。
// 错误处理（spec「错误处理」节）：SQL/兄弟列举失败 → 返 null 由 UI 走方向键轻量错误态；
// 子目录列举 null=「无子」常态语义（siyuanApi code=-1 语义化，↓置灰）。日志一律 debugLog
// （libs/logUtils.ts，app="nav" 分流），禁 console.log。
import { siyuan } from "./siyuanApi";
import { debugLog } from "./logUtils";

/** 罗盘方向目标（null=该方向置灰：顶层无父/无子/首尾兄弟，不回绕） */
export interface NavDocTarget {
    id: string;
    name: string;
    /** .sy 物理路径（box 相对；跳转按 id，此字段调试/兜底用） */
    path: string;
}

export interface NavTree {
    docID: string;
    box: string;
    /** 当前文档名（兄弟列表里的自身项，免单独查） */
    currentName: string;
    /** 兄弟位次（1 基）与总数：罗盘中心 "3/8" */
    index: number;
    total: number;
    /** ↑ 顶层文档（父=笔记本）为 null */
    parent: NavDocTarget | null;
    /** ↓ 无子文档为 null */
    firstChild: NavDocTarget | null;
    /** ← 首兄为 null */
    prevSibling: NavDocTarget | null;
    /** → 尾兄为 null */
    nextSibling: NavDocTarget | null;
}

/** 方向键 id（罗盘组件/快捷键/流派映射共用） */
export type NavDir = "up" | "down" | "left" | "right";

/** 方向流派映射（navcompass 2026-10-11，spec 拍板 5 纯函数锚点）：默认 tree=
 *  ↑父 ↓首子 ←前兄 →后兄；hegemon=霸主流派 ←→父子 ↑↓前后篇（hierarchyNavigate
 *  习惯）。目标 null（边界）透传=调用方置灰，不回绕（拍板 6） */
export function navTargetOf(
    tree: Pick<NavTree, "parent" | "firstChild" | "prevSibling" | "nextSibling">,
    scheme: string,
    dir: NavDir,
): NavDocTarget | null {
    const map: Record<NavDir, NavDocTarget | null> = scheme === "hegemon"
        ? { up: tree.prevSibling, down: tree.nextSibling, left: tree.parent, right: tree.firstChild }
        : { up: tree.parent, down: tree.firstChild, left: tree.prevSibling, right: tree.nextSibling };
    return map[dir];
}

/** blocks.path（"/pid/cid.sy"，box 相对）→ 父目录路径（顶层="/"）。
 *  整链保留：内核 box.Ls 直接 ReadDir(data/box/p)，只传末级 id 二层起 ENOENT
 *  （exportNaming 2026-08-22 实测教训）。 */
export function parentDirOfPath(docPath: string): string {
    const i = docPath.lastIndexOf("/");
    return i <= 0 ? "/" : docPath.slice(0, i);
}

/** blocks.path → 自身子文档目录（"/pid/cid"；listDocsByPath 列它得子文档） */
export function childDirOfPath(docPath: string): string {
    return docPath.replace(/\.sy$/, "");
}

/** 父目录 → 父文档 id（目录段即文档 id；根 "/" 的父是笔记本非文档 → null） */
export function parentIDOfDir(parentDir: string): string | null {
    if (parentDir === "/" || parentDir === "") return null;
    const seg = parentDir.slice(parentDir.lastIndexOf("/") + 1);
    return seg || null;
}

export interface SiblingParse {
    total: number;
    /** 1 基位次；不在列表=0（竞态/被隐藏过滤，调用方按错误态处理走重试） */
    index: number;
    current: RetListDocsByPathFile | null;
    prev: RetListDocsByPathFile | null;
    next: RetListDocsByPathFile | null;
}

/** 兄弟列表+当前 docID → 位次与左右邻居（纯函数，单测锚点）。files 顺序即内核返回序 */
export function parseSiblings(files: RetListDocsByPathFile[], docID: string): SiblingParse {
    const idx = files.findIndex(f => f?.id === docID);
    return {
        total: files.length,
        index: idx >= 0 ? idx + 1 : 0,
        current: idx >= 0 ? files[idx] : null,
        prev: idx > 0 ? files[idx - 1] : null,
        next: idx >= 0 && idx < files.length - 1 ? files[idx + 1] : null,
    };
}

/** 取数器注入（exportNaming NamingFetchers 同款：单测喂假数据，不打真实内核） */
export interface NavFetchers {
    /** docID → {box, path}（blocks SQL；未索引/已删/非文档 → null） */
    docRow(docID: string): Promise<{ box: string; path: string } | null>;
    /** 列目录（null=空目录或失败——siyuanApi.listDocsByPath 的 code=-1 语义化） */
    listDocs(box: string, dirPath: string): Promise<RetListDocsByPath | null>;
    /** 文档标题（blocks content；查不到 → ""，只影响预览名不影响跳转） */
    docName(docID: string): Promise<string>;
}

export function defaultNavFetchers(): NavFetchers {
    return {
        docRow: async (docID) => {
            const row = await siyuan.sqlOne(`select box,path from blocks where type='d' and id="${docID}"`);
            return row?.box && row?.path ? { box: row.box as string, path: row.path as string } : null;
        },
        listDocs: (box, dirPath) => siyuan.listDocsByPath(box, dirPath, 15, 0),
        docName: async (docID) => {
            // 父 id 即文档根块，直接取 content（getDocNameByBlockID 的两跳在此可一步到位）
            const row = await siyuan.sqlOne(`select content from blocks where id="${docID}"`);
            return row?.content ?? "";
        },
    };
}

// 会话内轻缓存（spec：同 docID 重复打开罗盘不重拉；导航动作后失效重拉）
const navCache = new Map<string, NavTree>();

/** 失效轻缓存：导航动作后（跳转即换 docID，回访旧 doc 不得吃陈旧树）无参全清；
 *  也可定向失效单个 docID */
export function invalidateNavCache(docID?: string): void {
    if (docID === undefined) navCache.clear();
    else navCache.delete(docID);
}

function toTarget(f: RetListDocsByPathFile): NavDocTarget {
    return { id: f.id, name: f.name ?? "", path: f.path ?? "" };
}

/**
 * 解析当前文档的十字导航树。成功进缓存；任何失败返 null（不缓存，UI 错误态点重试即真重拉）。
 * 三次 IO（兄弟列举/子列举/父标题）在 docRow 之后并行。
 */
export async function getNavTree(docID: string, fetchers: NavFetchers = defaultNavFetchers()): Promise<NavTree | null> {
    if (!docID) return null;
    const hit = navCache.get(docID);
    if (hit) return hit;
    let tree: NavTree | null = null;
    try {
        tree = await buildNavTree(docID, fetchers);
    } catch (err) {
        debugLog("nav_tree", `getNavTree docID=${docID} unexpected: ${err}`, "nav");
        return null;
    }
    if (tree) {
        navCache.set(docID, tree);
    } else {
        debugLog("nav_tree", `getNavTree miss docID=${docID} (sql empty / listing fail / doc not in siblings)`, "nav");
    }
    return tree;
}

async function buildNavTree(docID: string, fetchers: NavFetchers): Promise<NavTree | null> {
    const row = await fetchers.docRow(docID);
    if (!row) return null;
    const parentDir = parentDirOfPath(row.path);
    const childDir = childDirOfPath(row.path);
    const parentID = parentIDOfDir(parentDir);
    const [sibListing, childListing, parentName] = await Promise.all([
        fetchers.listDocs(row.box, parentDir),
        fetchers.listDocs(row.box, childDir),
        parentID ? fetchers.docName(parentID) : Promise.resolve(""),
    ]);
    // 自己必在父目录里——兄弟列举 null 只能是失败/竞态，走错误态重试（区别于子目录
    // null=「无子」常态：那里 code=-1 是空壳容器的正常回包）
    if (!sibListing) return null;
    const sib = parseSiblings(sibListing.files ?? [], docID);
    if (!sib.current) return null;
    const kids = childListing?.files ?? [];
    return {
        docID,
        box: row.box,
        currentName: sib.current.name ?? "",
        index: sib.index,
        total: sib.total,
        parent: parentID
            ? { id: parentID, name: parentName ?? "", path: `${parentDir}.sy` }
            : null,
        firstChild: kids.length > 0 ? toTarget(kids[0]) : null,
        prevSibling: sib.prev ? toTarget(sib.prev) : null,
        nextSibling: sib.next ? toTarget(sib.next) : null,
    };
}
