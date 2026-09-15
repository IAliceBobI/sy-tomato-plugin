// 失效引用/锚点链接检查清理（vipdoctree □4，2026-09-13）：检测层+手术层+Box 接线。
// 检测语义对齐官方 ListInvalidBlockRefs（kernel/model/search.go：块引用+指向块的锚点
// 链接，目标块不存在即失效），插件增量=①范围化（本文档/含子文档递归）②批量动作
// （转文本/删除，UI 在 RefCleanDialog.svelte）。2026-09-15 转全免费（bear 反馈拍板：
// 集市同类有免费开源竞品，检查免费/修要钱是钓鱼式切法）。
import { siyuan } from "./libs/siyuanApi";
import { tomatoI18n } from "./tomatoI18n";
import { addIfVisible } from "./libs/menuManager";
import { gatedAddCommand } from "./libs/cmdGate";
import { refCleanMenu } from "./libs/stores";
import { debugLog } from "./libs/logUtils";
import { openRefCleanDialog } from "./RefCleanDialog";
import type { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

/** 块 id 形态（内核 newID：14 位时间戳-随机后缀）。入参统一过此校验，兼防 SQL 注入 */
const ID_RE = /^[0-9]{14}-[a-z0-9]+$/;
/** 子树 SQL in 子查询分批上限：/api/query/sql 对无最外层 limit 的语句注入 64 截尾，50 < 64 */
const EXIST_BATCH = 50;

export interface RefCleanItem {
    kind: "ref" | "anchor";
    /** 失效目标块 id（引用 def_block_id / 锚点 href 指向块） */
    defID: string;
    /** 引用者块 id（手术对象） */
    blockID: string;
    /** 引用者所在文档 id */
    rootID: string;
    /** 锚文本/链接内文本（转文本模式保留的内容；解析失败时为空串） */
    text: string;
}

export interface RefCleanResult { ok: number; fail: number }

/** 子树文档集子查询：blocks 每行 path 含完整文档链，distinct root_id 即子树文档集
 *  （父行 path=/nb/父.sy、子=/nb/父/子.sy，handoff 09-13 实测）；tree=false 收敛单文档 */
function scopeSubquery(docID: string, tree: boolean): string {
    return tree
        ? `select distinct root_id from blocks where id = '${docID}' or path like '%/${docID}/%'`
        : `select '${docID}'`;
}

/** markdown 内锚点 URL 全局提取（? 参数被捕获组边界天然排除；;;; 围栏不影响） */
const ANCHOR_RE = /siyuan:\/\/blocks\/([0-9]{14}-[a-z0-9]+)/g;
/** 空 id 失效引用形态（目标先删后插入/粘贴场景，内核 Lute 渲染把 id 段置空：
 *  `(( '文本'))`——有效引用恒有 id 不会误伤；e2e 09-13 实锤）。完整闭合形态：
 *  LIKE 候选捞取与复核判据共用（挡代码块字面文本误报） */
const EMPTY_REF_FULL_RE = /\(\(\s*(?:'((?:[^']|\\')*)'|"((?:[^"]|\\")*)")\)\)/;

/** 存在性批查 → 不存在的 id 集（批 50 防注入 64 截尾） */
async function missingIDs(ids: string[]): Promise<Set<string>> {
    const missing = new Set<string>();
    for (let i = 0; i < ids.length; i += EXIST_BATCH) {
        const batch = ids.slice(i, i + EXIST_BATCH).filter((x) => ID_RE.test(x));
        if (!batch.length) continue;
        const rows = await siyuan.sql(
            `select id from blocks where id in (${batch.map((x) => `'${x}'`).join(",")})`);
        const exist = new Set(rows.map((r) => r.id));
        for (const x of batch) if (!exist.has(x)) missing.add(x);
    }
    return missing;
}

/** 检测：失效块引用（refs 反查目标不在 blocks）+ 失效锚点链接（markdown LIKE 捞候选
 *  →解析→存在性批查）。refs.root_id=引用者所在文档 ✓（子树过滤字段，handoff 实测）。 */
export async function detectInvalidRefs(docID: string, tree: boolean): Promise<RefCleanItem[]> {
    if (!ID_RE.test(docID)) return [];
    const scope = scopeSubquery(docID, tree);
    const out: RefCleanItem[] = [];
    try {
        // ① 失效块引用（官方同款判据：left join 目标为空）
        const refRows = await siyuan.sqlRef(
            `select r.block_id, r.def_block_id, r.content, r.root_id from refs r ` +
            `left join blocks b on b.id = r.def_block_id ` +
            `where b.id is null and r.root_id in (${scope}) limit 9999999`);
        for (const r of refRows) {
            if (r.block_id && r.def_block_id)
                out.push({ kind: "ref", defID: r.def_block_id, blockID: r.block_id, rootID: r.root_id ?? "", text: r.content ?? "" });
        }
        // ② 失效锚点链接：候选（markdown 含 siyuan://blocks/）→ 解析 defID → 批查存在性
        const candRows = await siyuan.sql(
            `select id, root_id, markdown from blocks where markdown like '%siyuan://blocks/%' ` +
            `and root_id in (${scope}) limit 9999999`);
        // blockID → 该块解析出的 defID 集
        const anchorMap = new Map<string, { rootID: string; ids: Set<string>; md: string }>();
        for (const b of candRows) {
            const ids = new Set<string>();
            for (const m of b.markdown.matchAll(ANCHOR_RE)) ids.add(m[1]);
            if (ids.size) anchorMap.set(b.id, { rootID: b.root_id ?? "", ids, md: b.markdown });
        }
        const allIDs = [...new Set([...anchorMap.values()].flatMap((v) => [...v.ids]))];
        const missing = await missingIDs(allIDs);
        // 锚点内文本提取（展示用）：按 defID 提取首个 span/链接形态的文本组
        const anchorText = (md: string, defID: string): string => {
            let m = md.match(new RegExp(`<span data-type="a" data-href="siyuan://blocks/${defID}(?:\\?[^"]*)?">([^<]*)</span>`));
            if (m) return m[1];
            m = md.match(new RegExp(`\\[([^\\]]*)\\]\\(siyuan://blocks/${defID}(?:\\?[^)]*)?\\)`));
            return m ? m[1] : "";
        };
        for (const [blockID, v] of anchorMap) {
            for (const defID of v.ids) {
                if (!missing.has(defID)) continue;
                out.push({ kind: "anchor", defID, blockID, rootID: v.rootID, text: v.md ? anchorText(v.md, defID) : "" });
            }
        }
        // ③ 空 id 失效引用（refs 表不记录此形态——e2e 09-13 实锤）：markdown LIKE 捞
        //  候选+完整正则精验（挡代码块字面文本）。defID 置空串（kramdown 本无 id），
        //  手术走 replaceInvalid 的空 id 分支；复核读按空 id 形态消失判定
        const emptyCands = await siyuan.sql(
            `select id, root_id, markdown from blocks where (markdown like '%(( ''%' or markdown like '%(( \"%') ` +
            `and root_id in (${scope}) limit 9999999`);
        for (const b of emptyCands) {
            const m = b.markdown.match(EMPTY_REF_FULL_RE);
            if (!m) continue;
            out.push({ kind: "ref", defID: "", blockID: b.id, rootID: b.root_id ?? "", text: m[1] ?? m[2] ?? "" });
        }
        debugLog("refclean", `detect doc=${docID} tree=${tree}: ${out.length} items ` +
            `(ref=${out.filter((i) => i.kind === "ref").length}, anchor=${out.filter((i) => i.kind === "anchor").length})`);
        // 复核过滤（索引残留防御，e2e 09-13 实锤：转文本后 refs/markdown 行 1~4s 才刷新，
        // 立即重查会列幽灵项）：按块 getBlockKramdown 直读（零延迟），ref 项保留 ⇔ 块含
        // defID 或含空 id 失效形态；anchor 项保留 ⇔ 块含 defID
        const kdCache = new Map<string, string>();
        const kdOf = async (id: string): Promise<string> => {
            if (!kdCache.has(id)) {
                try { kdCache.set(id, (await siyuan.getBlockKramdown(id)).kramdown); }
                catch { kdCache.set(id, ""); }
            }
            return kdCache.get(id) ?? "";
        };
        const verified: RefCleanItem[] = [];
        for (const it of out) {
            const kd = await kdOf(it.blockID);
            const pass = it.defID
                ? kd.includes(it.defID) || (it.kind === "ref" && EMPTY_REF_FULL_RE.test(kd))
                : EMPTY_REF_FULL_RE.test(kd);
            if (pass) verified.push(it);
        }
        if (verified.length !== out.length)
            debugLog("refclean", `filter index-ghosts: ${out.length} -> ${verified.length}`);
        return verified;
    } catch (e) {
        debugLog("refclean", `detect error: ${e}`);
    }
    return out;
}

/** 手术替换单条失效项在 kramdown 中的全部形态（引用三形态+锚点两形态+裸引用）。
 *  totext=保留捕获组现场文本（比 refs 快照新）；remove=整体删除。changed 供复核计数。 */
function replaceInvalid(md: string, it: RefCleanItem, mode: "totext" | "remove"): { md: string; changed: boolean } {
    const id = it.defID;
    const keep = mode === "totext";
    // 顺序敏感：先具体 span/链接形态，后裸 ((id))——防宽形态先吞窄形态的文本组
    const pats: RegExp[] = [
        new RegExp(`<span data-type="a" data-href="siyuan://blocks/${id}(?:\\?[^"]*)?">([^<]*)</span>`),
        new RegExp(`\\[([^\\]]*)\\]\\(siyuan://blocks/${id}(?:\\?[^)]*)?\\)`),
        new RegExp(`<span data-type="block-ref" data-id="${id}">([^<]*)</span>`),
        new RegExp(`\\(\\(${id} '((?:[^']|\\\\')*)'\\)\\)`),
        new RegExp(`\\(\\(${id} "((?:[^"]|\\\\")*)"\\)\\)`),
        new RegExp(`\\(\\(${id}\\)\\)`),
    ];
    let changed = false;
    for (const re of pats) {
        md = md.replace(re, (_m, g1) => {
            changed = true;
            const text = keep ? (g1 ?? it.text ?? "") : "";
            return text;
        });
    }
    // 空 id 失效形态（ref 项专属；有效引用恒有 id 不误伤）
    if (it.kind === "ref" && !changed) {
        for (const re of [/\(\(\s*'((?:[^']|\\')*)'\)\)/, /\(\(\s*"((?:[^"]|\\")*)"\)\)/]) {
            md = md.replace(re, (_m, g1) => {
                changed = true;
                return keep ? (g1 ?? it.text ?? "") : "";
            });
        }
    }
    return { md, changed };
}

/** 批量手术：按引用者块分组（一块多失效项一次 updateBlock 处理完），逐块
 *  getBlockKramdown→正则替换→updateBlock→复核读。remove 后整块空→deleteBlock 兜底
 *  （updateBlock 空 data 内核拒收）。复核走 getBlockKramdown 直读——refs 表有索引
 *  延迟勿用于验真（「写后立读」坑）。返回逐项计数。 */
export async function applyRefClean(items: RefCleanItem[], mode: "totext" | "remove"): Promise<RefCleanResult> {
    const byBlock = new Map<string, RefCleanItem[]>();
    for (const it of items) {
        if (!ID_RE.test(it.blockID)) continue;
        if (it.defID && !ID_RE.test(it.defID)) continue; // 空 defID=空 id 失效引用形态
        const g = byBlock.get(it.blockID);
        if (g) g.push(it);
        else byBlock.set(it.blockID, [it]);
    }
    let ok = 0, fail = 0;
    for (const [blockID, group] of byBlock) {
        try {
            const before = await siyuan.getBlockKramdown(blockID);
            let md = before.kramdown;
            let touched = 0;
            for (const it of group) {
                const r = replaceInvalid(md, it, mode);
                if (r.changed) { md = r.md; touched++; }
            }
            if (!touched) {
                fail += group.length;
                debugLog("refclean", `no-pattern-match block=${blockID} ids=${group.map((i) => i.defID).join(",")}`);
                continue;
            }
            if (md.replace(/\n?\{: id=[^}]*\}\s*$/, "").trim() === "") {
                // remove 后整块空：deleteBlock 兜底；复核=读应 not found（读到=假删除计 fail）
                await siyuan.deleteBlock(blockID);
                try {
                    await siyuan.getBlockKramdown(blockID);
                    fail += group.length;
                    debugLog("refclean", `delete-residue block=${blockID}`);
                } catch {
                    ok += touched;
                    fail += group.length - touched;
                }
                continue;
            }
            await siyuan.updateBlock(blockID, md, "markdown");
            // 复核读：任一 defID 仍在 kramdown，或 ref 项仍残留空 id 失效形态
            // （getBlockKramdown 直读，勿走 refs 索引——写后立读假残留坑）
            const after = await siyuan.getBlockKramdown(blockID);
            const residue = group.some((it) =>
                it.defID
                    ? after.kramdown.includes(it.defID) || EMPTY_REF_FULL_RE.test(after.kramdown)
                    : EMPTY_REF_FULL_RE.test(after.kramdown));
            if (residue) {
                fail += group.length;
                debugLog("refclean", `residue-after-update block=${blockID}`);
            } else ok += touched;
            fail += group.length - touched;
        } catch (e) {
            fail += group.length;
            debugLog("refclean", `apply error block=${blockID}: ${e}`);
        }
    }
    debugLog("refclean", `apply mode=${mode}: ok=${ok} fail=${fail}`);
    return { ok, fail };
}

class RefCleanBox {
    plugin: BaseTomatoPlugin;

    onload(plugin: BaseTomatoPlugin) {
        this.plugin = plugin;
        // 命令面板一条：当前文档（无默认键直传 langKey，不占键位；□4 拍板①）
        gatedAddCommand(plugin, "refCleanCheckDoc", {
            langText: tomatoI18n.检查失效引用,
            editorCallback: (protyle: any) => {
                const docID = protyle?.block?.rootID;
                if (docID) openRefCleanDialog(docID);
            },
        });
        // 文档树右键单文档（type 守卫同 □1 先例；多选 docs 不加——子树语义单文档）
        plugin.eventBus.on("open-menu-doctree", ({ detail }) => {
            if (detail.type !== "doc") return;
            const docID = detail.elements?.[0]?.getAttribute("data-node-id");
            if (!docID) return;
            addIfVisible(detail.menu, "m.refClean.checkDoc", {
                label: tomatoI18n.检查失效引用,
                icon: "iconTrashcan",
                click: () => openRefCleanDialog(docID),
            }, refCleanMenu.get());
        });
        // 编辑器内右键当前文档（menu key 同串一处藏两处消，□1 同款）
        plugin.eventBus.on("open-menu-content", ({ detail }) => {
            addIfVisible(detail.menu, "m.refClean.checkDoc", {
                label: tomatoI18n.检查失效引用,
                icon: "iconTrashcan",
                click: () => {
                    const docID = detail.protyle?.block?.rootID;
                    if (docID) openRefCleanDialog(docID);
                },
            }, refCleanMenu.get());
        });
    }
}

export const refCleanBox = new RefCleanBox();
