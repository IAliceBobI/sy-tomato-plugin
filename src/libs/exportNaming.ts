// 导出工作空间·干净路径（exportCleanPath）的命名引擎与清理遍历。
// 事实源是磁盘枚举而非 SQL（blocks 表按需索引，未在编辑器打开过的文档不在其中，实测 1617 文档只返回 64 条），
// 设计见 docs/export-clean-path-design.md。
// 注意：/api/filetree/listDocTree 只返回 {id, children} ID 树（无标题），标题用每目录一次
// listDocsByPath 补齐（model.File 带 name/titleEmpty，同样基于磁盘、未索引文档也在）。
// import 走 utils 桶而非直连 siyuanApi/globals——gconst↔utils 环的求值顺序会炸 text 链（单测实测）。
import { siyuan, sanitizePathSegment, osPath } from "./utils";

// ---------- 取数器（HTTP 通道注入，单测喂假数据） ----------
export interface NamingFetchers {
    lsNotebooks(): Promise<LsNotebook[]>;
    readDir(path: string): Promise<{ isDir: boolean; name: string }[] | null>;
    listDocTree(notebookID: string, notReadablePath: string): Promise<RetListDocTree | null>;
    listDocsByPath(notebookID: string, notReadablePath: string): Promise<RetListDocsByPath | null>;
}

// ---------- 清理遍历用的路径器注入（vitest ESM 下 require 不可用，注入本来就是可测性正解） ----------
export interface CleanOsPath {
    join(...parts: string[]): string;
    dirname(p: string): string;
    basename(p: string, ext?: string): string;
    normalize(p: string): string;
}

// ---------- 折叠键 / 兜底 ----------
// 折叠键：sanitize → NFKD → 小写。NFC/NFD 变体、大小写差异（macOS APFS / Windows NTFS
// 大小写与归一化不敏感文件系统上会落同一文件）全部折叠为同键；磁盘上写原样 sanitized 名。
// 过度折叠的代价只是多带 #id，方向恒安全。
function foldKey(title: string): string {
    return sanitizePathSegment(title).normalize("NFKD").toLowerCase();
}

// Windows 保留设备名，不分平台恒开（导出目录要可搬运）。检查的是文件段的基名。
const WIN_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/;

// 兜底退 #id 清单（任一命中该段即退）——宁可不干净，不可不正确：
// 1. sanitize 后为空；2. 全是点（.. 会路径穿越逃出导出目录，安全问题）；3. 结尾带点或空格（Windows 拒写）；
// 4. 折叠后命中 Windows 保留设备名；5. 内核 titleEmpty 标志为真。（6. 笔记本名查不到在根段处理）
function needFallback(sanitized: string, folded: string, titleEmpty: boolean): boolean {
    if (!sanitized) return true;
    if (/^\.+$/.test(sanitized)) return true;
    if (/[. ]$/.test(sanitized)) return true;
    if (WIN_RESERVED.test(folded)) return true;
    if (titleEmpty) return true;
    return false;
}

// ---------- 内部树 ----------
interface DocNode {
    box: string;      // 笔记本 id
    id: string;       // 文档块 id
    syPath: string;   // 全量 .sy 路径，如 "/20250208…-box/20240511…-doc.sy"（同时是 nodes 的 key）
    title: string;    // 取自身节点（listDocsByPath 的 name），不从 hpath 链推导，免疫 hpath/path 深度错位
    seg: string;      // 本段路径名（干净名或退 #id 后的名）
    segs: string[];   // 根段起的完整段链（含本段）
}

// 根层条目 / 内核 ID 树节点的内部表示（hasDir：磁盘上存在同名子目录，即有子文档）
interface RawChild { id: string; children: RawChild[]; hasDir: boolean }

const NODE_ID = /^\d{14}-[a-z0-9]+$/;

export class NamingCtx {
    constructor(private books: LsNotebook[], private nodes: Map<string, DocNode>,
        private rootSeg: Map<string, string>, private totalDocs: number) { }

    docCount() { return this.totalDocs; }

    // 相对导出根的段链（末段已带 .md）。doc 不在树中（TTL 窗口内新建 / 笔记本失联）→ null，调用方退旧 #id 路径。
    getExpSegments(doc: { box?: string; path?: string }): string[] | null {
        const n = this.nodes.get(`/${doc.box ?? ""}${doc.path ?? ""}`);
        if (!n) return null;
        return [...n.segs.slice(0, -1), `${n.seg}.md`];
    }

    getExpPath(doc: { box?: string; path?: string }, dir: string,
        osp: { join(...parts: string[]): string; normalize(p: string): string } = osPath()): string | null {
        const segs = this.getExpSegments(doc);
        if (!segs) return null;
        return osp.normalize(osp.join(dir, ...segs));
    }

    // 期望路径集合（干净模式清理的事实源）：文件全路径 + 所有目录前缀 + 所有打开笔记本的根目录段。
    // 过滤顺序与导出流完全一致：先白（wl4all 旁路）后黑；消歧已在建树时对全量树完成，不受过滤影响。
    expectedPathSet(dir: string, osp: CleanOsPath, filter: { wl: string[]; bl: string[]; wl4all: boolean }): { paths: Set<string>; ids: Set<string> } {
        const paths = new Set<string>();
        const ids = new Set<string>();
        const keep = (n: DocNode) => {
            if (!filter.wl4all && filter.wl?.length > 0 && !filter.wl.some(w => n.syPath.includes(w))) return false;
            if (filter.bl?.some(b => n.syPath.includes(b))) return false;
            return true;
        };
        for (const n of this.nodes.values()) {
            if (!keep(n)) continue;
            ids.add(n.id);
            let cur = dir;
            const dirSegs = n.segs.slice(0, -1);
            for (let i = 0; i < dirSegs.length; i++) {
                cur = osp.join(cur, dirSegs[i]);
                paths.add(cur);
            }
            paths.add(osp.join(cur, `${n.seg}.md`));
        }
        for (const b of this.books) {
            paths.add(osp.join(dir, this.rootSeg.get(b.id) ?? b.id));   // 打开笔记本根目录段无条件保留（同今天 Siyuan.notebooks 保护）
            ids.add(b.id);
        }
        return { paths, ids };
    }
}

export async function buildNamingCtx(fetchers: NamingFetchers): Promise<NamingCtx> {
    // lsNotebooks 不捕获：整体失败（内核不可达/鉴权）要抛出去触发清理的中止闸
    const books = (await fetchers.lsNotebooks()).filter(b => !!b?.id && !b.closed);

    // 根层：笔记本按折叠键分组，同名组全部保留 #boxid
    const rootSeg = new Map<string, string>();
    {
        const buckets = new Map<string, LsNotebook[]>();
        for (const b of books) {
            const k = foldKey(b.name ?? "");
            if (!buckets.has(k)) buckets.set(k, []);
            buckets.get(k).push(b);
        }
        for (const [k, group] of buckets) {
            for (const b of group) {
                const s = sanitizePathSegment(b.name ?? "");
                rootSeg.set(b.id, (group.length > 1 || needFallback(s, k, false)) ? `${s}#${b.id}` : s);
            }
        }
    }

    const nodes = new Map<string, DocNode>();
    let total = 0;

    // 某一级目录的子文档标题：一次 listDocsByPath（磁盘真相，未索引文档也在）。
    // dirSyPath 必须是完整目录路径（如 /boxid/父id）——内核 box.Ls 直接 os.ReadDir(data/box/path)，
    // 只传末级 id 在二层起 ENOENT，整层标题全空退 #id（2026-08-22 实测 daily card/c2024 全部带后缀的根因）。
    const titleLevel = async (box: string, dirSyPath: string): Promise<Map<string, { name: string; titleEmpty: boolean }>> => {
        const m = new Map<string, { name: string; titleEmpty: boolean }>();
        let files: RetListDocsByPathFile[] = [];
        try {
            files = ((await fetchers.listDocsByPath(box, dirSyPath || "/"))?.files) ?? [];
        } catch (e) { }   // 单层标题列举失败 → 该层全部按空标题兜底（退 #id，方向安全）
        for (const f of files) {
            if (f?.id) m.set(f.id, { name: f.name ?? "", titleEmpty: !!f.titleEmpty });
        }
        return m;
    };

    // 给同一父目录下的子文档分配段：同父折叠键分桶，桶内 ≥2 → 整桶保留 #id；兜底清单命中也退 #id
    // dirSyPath 是父目录的全量 .sy 路径（根层为 ""），syPath 必须拼全链——getExpSegments 按完整路径查表。
    const buildLevel = async (box: string, dirSyPath: string, parentSegs: string[], idChildren: RawChild[]): Promise<void> => {
        const titles = await titleLevel(box, dirSyPath);
        const made = idChildren.map(c => {
            const t = titles.get(c.id) ?? { name: "", titleEmpty: true };   // 标题查不到 → 按空标题兜底
            return { box, id: c.id, title: t.name, titleEmpty: t.titleEmpty, syPath: `/${box}${dirSyPath}/${c.id}.sy` };
        });
        const buckets = new Map<string, number>();   // foldKey → count
        for (const m of made) {
            const k = foldKey(m.title);
            buckets.set(k, (buckets.get(k) ?? 0) + 1);
        }
        const byID = new Map<string, DocNode>();
        for (const m of made) {
            const s = sanitizePathSegment(m.title);
            const k = foldKey(m.title);
            const disambig = (buckets.get(k) ?? 0) > 1 || needFallback(s, k, m.titleEmpty);
            const seg = disambig ? `${s}#${m.id}` : s;
            const node: DocNode = { box: m.box, id: m.id, syPath: m.syPath, title: m.title, seg, segs: [...parentSegs, seg] };
            nodes.set(node.syPath, node);
            total++;
            byID.set(m.id, node);
        }
        for (const c of idChildren) {
            if (c.children?.length) {
                const node = byID.get(c.id);
                if (node) await buildLevel(box, `${dirSyPath}/${c.id}`, node.segs, c.children);
            }
        }
    };

    await Promise.all(books.map(async (b) => {
        try {
            const entries = (await fetchers.readDir(`/data/${b.id}`)) ?? [];
            // 根层条目 → 去重后的子文档列表（X.sy 与同名目录 X/ 是同一文档，目录版带子树）
            const rootChildren = new Map<string, RawChild>();
            for (const e of entries) {
                let id: string | null = null;
                let hasDir = false;
                if (e.isDir && NODE_ID.test(e.name)) { id = e.name; hasDir = true; }
                else if (!e.isDir && e.name.endsWith(".sy") && NODE_ID.test(e.name.slice(0, -3))) id = e.name.slice(0, -3);
                if (!id) continue;   // 跳过 .siyuan 等非文档条目
                const existing = rootChildren.get(id);
                if (existing) existing.hasDir = existing.hasDir || hasDir;
                else rootChildren.set(id, { id, children: [], hasDir });
            }
            for (const rc of rootChildren.values()) {
                if (!rc.hasDir) continue;
                // 3.7.2+ listDocTree(path:"/") 被越界校验拒（issue #79），根目录用 readDir 列举后逐目录取子树
                try {
                    rc.children = ((await fetchers.listDocTree(b.id, `/${rc.id}`))?.tree ?? []) as unknown as RawChild[];
                } catch (e) { }
            }
            await buildLevel(b.id, "", [rootSeg.get(b.id) ?? b.id], [...rootChildren.values()]);
        } catch (e) {
            // 单个笔记本失败（加密锁定/已关闭/权限不足）不中断整体，其文档走调用方旧路径兜底
        }
    }));

    return new NamingCtx(books, nodes, rootSeg, total);
}

// 清理中止闸②：全工作空间一个文档都枚举不到 → 几乎必然是 API/权限异常，绝不拿空期望集合遍历删除
export function shouldAbortClean(ctx: NamingCtx): boolean {
    return ctx.docCount() === 0;
}

export function defaultNamingFetchers(): NamingFetchers {
    return {
        lsNotebooks: () => siyuan.lsNotebooks(),
        readDir: (p) => siyuan.readDir(p),
        listDocTree: (b, p) => siyuan.listDocTree(b, p),
        // maxListCount: 0 → 内核取 math.MaxInt，防 FileTree.MaxListCount 静默截尾（同 SQL 无 LIMIT 被 64 截尾的坑）；
        // showHidden: true → 隐藏文档标题也能拿到，拿不到时只会多带 #id（方向安全）。
        listDocsByPath: (b, p) => siyuan.call("/api/filetree/listDocsByPath",
            { notebook: b, path: p, sort: 15, maxListCount: 0, showHidden: true }),
    };
}

const NAMING_TTL_MS = 60 * 1000;
let ttlCache: { ctx: NamingCtx; at: number } | null = null;

// 导出 tick 复用（60s TTL——磁盘走法是几百个 HTTP 调用，不许落在每个有活干的 tick 上）；
// 清理决策必须基于当下真相 → 清理调用方传 force=true 现建（spec「TTL 缓存」节）。
export async function getNamingCtx(force = false, fetchers: NamingFetchers = defaultNamingFetchers()): Promise<NamingCtx> {
    if (!force && ttlCache && Date.now() - ttlCache.at < NAMING_TTL_MS) return ttlCache.ctx;
    const ctx = await buildNamingCtx(fetchers);
    ttlCache = { ctx, at: Date.now() };
    return ctx;
}

// ---------- 清理遍历（fs/ospath 注入：vitest ESM 下 require 不可用，注入本来就是可测性正解） ----------
export interface CleanFs {
    readdir(path: string, opts?: { withFileTypes?: boolean }): Promise<{ name: string; isDirectory(): boolean }[]>;
    rm(path: string, opts?: { recursive?: boolean; force?: boolean }): Promise<void>;
}

export interface WalkPolicy {
    keepDir(name: string, fullPath: string): boolean;
    keepFile(name: string, fullPath: string): boolean;
}

// 单一递归遍历 + 可注入验证策略：条目在策略里判保留，不在 → 删（目录整树删）。
export async function walkAndClean(dirPath: string, fs: CleanFs, osp: CleanOsPath, policy: WalkPolicy): Promise<void> {
    let items: { name: string; isDirectory(): boolean }[];
    try {
        items = await fs.readdir(dirPath, { withFileTypes: true });
    } catch (e) {
        return;   // 目录列举失败（不存在等）静默跳过，与旧 readAndDel 的整体 try/catch 语义一致
    }
    for (const item of items) {
        const fullPath = osp.join(dirPath, item.name);
        try {
            if (item.isDirectory()) {
                if (!policy.keepDir(item.name, fullPath)) {
                    await fs.rm(fullPath, { recursive: true, force: true });
                    continue;
                }
                await walkAndClean(fullPath, fs, osp, policy);
            } else if (!policy.keepFile(item.name, fullPath)) {
                await fs.rm(fullPath, { force: true });
            }
        } catch (e) { }   // 单条目失败跳过，不中断同层其余条目
    }
}

// 干净模式策略：期望集合成员判定。图片模式开着时，非 .md 文件按「同目录期望 md 的资源前缀」
// 匹配保留（前缀 = basename 去 - 和 # 加 .，与导出时 parallelExport 的公式逐字一致）——
// 顺带修掉今天孤儿图片无限累积的问题；图片模式关时仅 .md 在期望集合，其余全删（与现状语义一致）。
export function cleanWalkPolicy(expected: Set<string>, picsOn: boolean, osp: CleanOsPath): WalkPolicy {
    const prefixesByDir = new Map<string, Set<string>>();
    for (const p of expected) {
        if (!p.endsWith(".md")) continue;
        const d = osp.dirname(p);
        const prefix = osp.basename(p).replaceAll("-", "").replaceAll("#", "") + ".";
        if (!prefixesByDir.has(d)) prefixesByDir.set(d, new Set());
        prefixesByDir.get(d).add(prefix);
    }
    return {
        keepDir: (_name, fullPath) => expected.has(fullPath),
        keepFile: (_name, fullPath) => {
            if (expected.has(fullPath)) return true;
            if (!picsOn) return false;
            const prefixes = prefixesByDir.get(osp.dirname(fullPath));
            if (!prefixes) return false;
            const base = osp.basename(fullPath);
            for (const p of prefixes) {
                if (base.startsWith(p)) return true;
            }
            return false;
        },
    };
}
