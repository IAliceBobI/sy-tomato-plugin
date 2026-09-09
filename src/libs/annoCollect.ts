// 批注收集（2026-09-02 spec docs/tomato-anno-collect-design.md）：纯函数层——
// 幂等键/子树前缀/片段裁剪/引用行/节装配/同日替换边界定位。零 UI/零 siyuan 依赖，
// tests/unit/annoCollect.test.ts 锁定契约。取数与执行编排在文件下半段。
import { parseAnnotations } from "./annotationsAttr";
import type { AnnoPanelItem } from "./annoPanelList";
import { siyuan } from "./utils";
import { NewConfiguredLute } from "./globals";
import { lastVerifyResult, isMe } from "./user";
import { resolveDailyNotebookID } from "./annoDraft";
import { events } from "./Events";
import { tomatoI18n } from "../tomatoI18n";
import { annoCollectScope, annoCollectDest, annoCollectTargetDoc, commentBoxAnnoDraftNotebook } from "./stores";
import { debugLog } from "./logUtils";
// openUnlockDialog 走动态 import：unlockDialog → UnlockDialog.svelte 链会把 svelte 组件
// 卷进本模块，单测（node 环境无 svelte 插件）suite 级挂掉；CJS 打包动态导入被内联无副作用

export const COLLECT_ATTR = "custom-tomato-collect";

/** attributes 联查行（面板 loadAnnos 同款 + r=root_id 供分组） */
export interface AnnoCollectRow {
    id: string;
    v: string | null;
    c: string | null;
    r: string;
}

/** 单文档一组；递归时每个含批注子文档一组 */
export interface AnnoCollectGroup {
    docID: string;
    docName: string;
    items: AnnoPanelItem[];
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export function dayStamp(d: Date): string {
    return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
}

export function collectKeyValue(day: string, scopeID: string): string {
    return `${day}|${scopeID}`;
}

/** ymd → 内核日记协议属性名（DailyNoteBox.findDailyNote / 回顾同款识别键） */
export function dailyNoteAttrName(ymd: string): string {
    return `custom-dailynote-${ymd}`;
}

/** ymd → 补建日记文档名 YYYY-MM-DD（与用户 DailyNoteSavePath 模板可能不一致，接受偏差：
 *  属性挂对即被认作日记，模板渲染插件侧做不了 Go template） */
export function dailyNoteDocTitle(ymd: string): string {
    return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

/** 历史日记补建路径 = 今天日记同目录 + 目标日期名（根直挂时 dir 为空串） */
export function backfillDailyPath(todayHpath: string, ymd: string): string {
    const dir = todayHpath.slice(0, todayHpath.lastIndexOf("/"));
    return `${dir}/${dailyNoteDocTitle(ymd)}`;
}

/** 文档 path → 子树前缀：/a/b.sy → /a/b/（文档级父子只在 path 层，渐进 progData 先例） */
export function subtreePrefix(path: string): string {
    if (!path.endsWith(".sy")) return "";
    return path.slice(0, -3) + "/";
}

/** 片段：按码点截 limit 加 …，文本内 " 转义 \"（块引用锚文本语法要求）；
 *  换行折叠为空格——跨块批注 sel.txt 与容器块 content 天然含 \n，锚文本是行内语法 */
export function clipSnippet(txt: string, limit = 100): string {
    const flat = txt.replace(/\s*(?:\r\n|\r|\n)+\s*/g, " ").trim();
    const cps = [...flat];
    const cut = cps.length > limit ? cps.slice(0, limit).join("") + "…" : flat;
    return cut.replaceAll('"', '\\"');
}

export function refLineMarkdown(hostID: string, snippet: string): string {
    return `> ((${hostID} "${snippet}"))`;
}

/** 「收集 → 当天日记」落本：用户设置（含启动注入的官方默认，initAnnoDraftNotebookDefault）
 *  > 官方判定；皆空返回 "" 报错指路——不兜底当前笔记本（静默落随手所在本太魔法；
 *  草稿链有第三档是草稿语义无感，收集是用户明确要「去日记」的动作）。
 *  与草稿链 ensureDraftDocID 前两档同序（annoDraft.ts）。 */
export function dailyCollectBoxID(configured: string, officialResolved: string): string {
    return configured || officialResolved;
}

export function sectionHeadingMD(scopeName: string, md: string, attrValue: string): string {
    return `## 📥 《${scopeName}》批注收集 · ${md}\n{: ${COLLECT_ATTR}="${attrValue}"}`;
}

/** 行 → 分组条目：块展开 + 跨块同 entry.id 去重（取首宿主）+ 组内 time 降序 + 组间按最新批注降序 */
export function collectGroups(rows: AnnoCollectRow[], names: Record<string, string>): AnnoCollectGroup[] {
    const byId = new Map<string, AnnoPanelItem>();
    const docOf = new Map<string, Set<string>>(); // docID → entryIDs（保首见序）
    for (const r of rows ?? []) {
        if (r?.id == null || r.id === "") continue;
        for (const entry of parseAnnotations(r.v)) {
            if (byId.has(entry.id)) continue; // 跨块批注只收一条，引用行指向首宿主
            byId.set(entry.id, { hostID: r.id, blockContent: typeof r.c === "string" ? r.c : "", entry });
            if (!docOf.has(r.r)) docOf.set(r.r, new Set());
            docOf.get(r.r)!.add(entry.id);
        }
    }
    const groups: AnnoCollectGroup[] = [];
    for (const [docID, ids] of docOf) {
        const items = [...ids].map((id) => byId.get(id)!).sort((a, b) => b.entry.time - a.entry.time);
        groups.push({ docID, docName: names[docID] ?? "", items });
    }
    groups.sort((a, b) => Math.max(...b.items.map((i) => i.entry.time)) - Math.max(...a.items.map((i) => i.entry.time)));
    return groups;
}

/** 按批注最后修改日（entry.time 的本地时区 ymd）分桶：一条批注只住一天，
 *  文档组跨天拆分各归各天；桶内仍按文档分组（组内 time 降序、组间按桶内最新
 *  批注降序——collectGroups 同语义拆分后重算，输出序不依赖输入序）；天序最新在前。 */
export function groupByDay(groups: AnnoCollectGroup[]): Map<string, AnnoCollectGroup[]> {
    const byDay = new Map<string, AnnoCollectGroup[]>();
    for (const g of groups) {
        const split = new Map<string, AnnoCollectGroup>();
        for (const it of g.items) {
            const day = dayStamp(new Date(it.entry.time));
            let sg = split.get(day);
            if (!sg) {
                sg = { docID: g.docID, docName: g.docName, items: [] };
                split.set(day, sg);
            }
            sg.items.push(it);
        }
        for (const [day, sg] of split) {
            sg.items.sort((a, b) => b.entry.time - a.entry.time);
            byDay.set(day, [...(byDay.get(day) ?? []), sg]);
        }
    }
    for (const [day, bucket] of byDay) {
        bucket.sort((a, b) => Math.max(...b.items.map((i) => i.entry.time)) - Math.max(...a.items.map((i) => i.entry.time)));
        byDay.set(day, bucket);
    }
    return new Map([...byDay.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))); // ymd 定长字典序=时间序
}

/** 整节块数组（每块一个元素，供事务 insert ops / 剪贴板文本 join）。
 *  卡片 = entry.text 原样（kramdown 富文本走 markdown 通道无损迁移）+ 引用行；
 *  tree=true 时每组前渲染 ### 《组名》（单文档模式无组标题）。 */
export function sectionBlocks(heading: string, groups: AnnoCollectGroup[], tree: boolean): string[] {
    const blocks: string[] = [heading];
    for (const g of groups) {
        if (tree) blocks.push(`### 《${g.docName}》`);
        for (const it of g.items) {
            if (it.entry.text) blocks.push(it.entry.text);
            const snippet = clipSnippet(it.entry.sel?.txt || it.blockContent);
            if (snippet) blocks.push(refLineMarkdown(it.hostID, snippet));
        }
    }
    return blocks;
}

export interface SectionPlan {
    delIDs: string[];
    insertBlocks: string[];
    /** 旧标题前一块（原位替换锚点）；有 previousID 即非首块 */
    previousID?: string;
    /** 仅当旧标题是文档首块时=headingID（占位标记，值不消费——调用方用 parentID=文档 id 头插=原位） */
    parentID?: string;
}

/** 同日替换边界定位：旧标题起，到下一个 h1/h2 前的全部顶层块删除；
 *  h3/h4… 不截断（只认同级节边界；收集节内的 ### 组标题在删除范围内、不会被误当边界）。 */
export function planReplaceSection(
    children: { id: string; type: string; subType?: string }[],
    headingID: string,
    blocks: string[],
): SectionPlan | null {
    const idx = children.findIndex((c) => c?.id === headingID);
    if (idx < 0) return null;
    const delIDs: string[] = [];
    for (let i = idx; i < children.length; i++) {
        const c = children[i];
        if (i > idx && c.type === "h" && (c.subType === "h1" || c.subType === "h2")) break;
        delIDs.push(c.id);
    }
    const plan: SectionPlan = { delIDs, insertBlocks: blocks };
    if (idx === 0) plan.parentID = headingID;
    else plan.previousID = children[idx - 1].id;
    return plan;
}

// ---------------- 取数与执行编排（siyuan 依赖；行为验证走 e2e，spec §9.2） ----------------

export interface CollectInput {
    scopeDocID: string;
    scope?: "doc" | "tree";
    dest?: "clipboard" | "daily" | "file";
    /** dest=file 时必带；缺省读 annoCollectTargetDoc store */
    targetDoc?: string;
    /** 自动归档模式（批注保存后 fire-and-forget）：成功零回执（每次保存都弹会吵），
     *  失败照常 toast；scope 恒 doc。全量重算（非单天）——搬家语义要求旧节同步收缩 */
    auto?: boolean;
}

/** 当前文档：与面板 loadAnnos 同款 SQL（root_id 子查询），limit 10000 同款护栏；
 *  递归子树：根 path 前缀匹配（文档级父子只在 path 层），嵌套子查询不拼大 IN */
export async function fetchCollectRows(scope: "doc" | "tree", scopeDocID: string): Promise<AnnoCollectRow[]> {
    if (!scopeDocID) return [];
    if (scope === "doc") {
        const rows = await siyuan.sql(`select a.block_id as id, a.value as v, b.content as c, b.root_id as r
            from attributes a left join blocks b on b.id = a.block_id
            where a.name = 'custom-tomato-annotations'
            and a.block_id in (select id from blocks where root_id = '${scopeDocID}') limit 10000`);
        return ((rows ?? []) as AnnoCollectRow[]);
    }
    const p = (await siyuan.sqlOne(`select path from blocks where id='${scopeDocID}'`))?.path ?? "";
    const pfx = subtreePrefix(p);
    if (!pfx) return [];
    const rows = await siyuan.sql(`select a.block_id as id, a.value as v, b.content as c, b.root_id as r
        from attributes a left join blocks b on b.id = a.block_id
        where a.name = 'custom-tomato-annotations'
        and a.block_id in (select id from blocks where root_id in
            (select id from blocks where type='d' and (id='${scopeDocID}' or path like '${pfx}%')))
        limit 10000`);
    return ((rows ?? []) as AnnoCollectRow[]);
}

/** 子树文档名表（含根）：type='d' 行 content */
export async function subtreeDocNames(scopeDocID: string): Promise<Record<string, string>> {
    const names: Record<string, string> = {};
    const root = await siyuan.sqlOne(`select id, content, path from blocks where id='${scopeDocID}' and type='d'`);
    if (root?.id) names[root.id] = root.content ?? "";
    if (root?.path) {
        const pfx = subtreePrefix(root.path);
        if (pfx) {
            const rows = (await siyuan.sql(`select id, content from blocks where type='d' and path like '${pfx}%' limit 5000`)) ?? [];
            for (const r of rows) if (r?.id) names[r.id] = r.content ?? "";
        }
    }
    return names;
}

/** 文档名缓存：右键级联菜单同步构建（内核在事件同步段 show 菜单，async addItem 赶不上），
 *  文件项名字只读缓存——收集链路（runCollect/对话框选定）跑过一次后常驻有名 */
const docNameCache = new Map<string, string>();

export function cachedDocName(docID: string): string {
    return docID ? (docNameCache.get(docID) ?? "") : "";
}

export async function collectDocName(docID: string): Promise<string> {
    if (docID && docNameCache.has(docID)) return docNameCache.get(docID)!;
    const row = await siyuan.sqlOne(`select content from blocks where id='${docID}' and type='d'`);
    const name = row?.content ?? "";
    if (docID && name) docNameCache.set(docID, name);
    return name;
}

/** 幂等定位三层：内存缓存（同 session 连点秒命中）→ attributes 表（setBlockAttrs 通道，
 *  秒级索引）→ blocks.ial like（kramdown IAL 原文，另一条索引节奏兜底；e2e 实锤 insert
 *  通道 IAL 不进 attributes、连点窗口单查必 miss 双节）。缓存键含 target：同 attrValue
 *  可同时落日记与指定文件两个目标。 */
const sectionCache = new Map<string, string>(); // `${targetDocID}|${attrValue}` -> headingID

async function findSectionHeading(targetDocID: string, attrValue: string): Promise<string> {
    const key = `${targetDocID}|${attrValue}`;
    const cached = sectionCache.get(key);
    if (cached) return cached;
    const byAttr = await siyuan.sqlOne(`select a.block_id as id from attributes a
        join blocks on blocks.id = a.block_id
        where a.name = '${COLLECT_ATTR}' and a.value = '${attrValue}' and blocks.root_id = '${targetDocID}' limit 1`);
    if (byAttr?.id) return byAttr.id;
    const byIal = await siyuan.sqlOne(`select id from blocks
        where root_id = '${targetDocID}' and ial like '%${COLLECT_ATTR}="${attrValue}"%' limit 1`);
    return byIal?.id ?? "";
}

/** 落盘：同日原位替换（删旧+插新同一事务，杜绝「删了旧的没写进新的」中间态）；
 *  首次/跨天末尾追加（每天一节留历史轨迹）。
 *  注1：旧节是文档首块时用 parentID 头插（内核 doInsert0 PrependChild）= 新节落回原位。
 *  注2：事务 insert op 的 data 期望 BlockDOM——markdown 直传会被内核当字面段落
 *  （e2e 实锤 ## 标题/块引用全落成 p，引用跳转失效），须先 Md2BlockDOM。 */
let _lute: { Md2BlockDOM: (md: string) => string } | null = null;
function luteForCollect(): { Md2BlockDOM: (md: string) => string } {
    if (_lute) return _lute;
    // 裸 NewLute 不解析块引用等行内语法（SetBlockRef 等旗标默认关）——引用行整条落成
    // 字面 ((id "…")) 文本、卡片富文本全平（2026-09-04 群反馈「收集后没转成引用」根因，
    // annodaily 实例 DOM 实锤 span[data-type=block-ref] 计数为 0）。首选编辑器共享 Lute
    // （官方 getLute 全配置单例，与粘贴通道同款、随用户编辑器设置）；无编辑器时兜底
    // 自建实例开最小旗标集（BlockRef 管 引用行，Spin/WYSIWYG/TextMark 管卡片富文本）。
    // 惰性：模块顶层建会在单测 node 环境炸（无 globalThis.Lute）
    const shared = (events.protyle as unknown as { lute?: { Md2BlockDOM: (md: string) => string } })?.lute;
    if (shared?.Md2BlockDOM) _lute = shared;
    else _lute = NewConfiguredLute() as unknown as { Md2BlockDOM: (md: string) => string };
    return _lute;
}

async function writeSection(targetDocID: string, blocks: string[], attrValue: string): Promise<void> {
    const doms = blocks.map((b) => luteForCollect().Md2BlockDOM(b));
    const headingID = await findSectionHeading(targetDocID, attrValue);
    if (headingID) {
        const children = (await siyuan.getChildBlocks(targetDocID)) ?? [];
        const plan = planReplaceSection(children as any, headingID, blocks);
        if (plan) {
            const ins = plan.previousID
                ? siyuan.transInsertBlocksAfter(doms, plan.previousID)
                : siyuan.transInsertBlocksAsChildOf(doms, targetDocID);
            const txs = await siyuan.transactions([...siyuan.transDeleteBlocks(plan.delIDs), ...ins]);
            await ensureSectionAttr(txs, targetDocID, attrValue);
            return;
        }
    }
    const tail = await siyuan.getDocLastID(targetDocID);
    const txs = tail
        ? await siyuan.insertBlocksAfter(doms, tail)
        : await siyuan.transactions(siyuan.transInsertBlocksAsChildOf(doms, targetDocID));
    await ensureSectionAttr(txs, targetDocID, attrValue);
}

/** insert markdown 通道的 IAL 不进 attributes 索引表（e2e 实锤：blocks 表 markdown 可见、
 *  attributes 表恒空；setBlockAttrs 写的才进）——幂等定位链依赖三层查找，故每条插入路径
 *  完成后从事务返回找新节标题块（data 含属性名的 insert op）补写 setBlockAttrs + 更新
 *  内存缓存。失败不阻塞：幂等退化为末尾追加（多一节，无数据损坏）。 */
async function ensureSectionAttr(txs: unknown, targetDocID: string, attrValue: string): Promise<void> {
    try {
        const ops = (Array.isArray(txs) ? txs : []).flatMap((t: any) => (t?.doOperations ?? []) as any[]);
        const op = ops.find((o) => o?.action === "insert" && typeof o.data === "string" && o.data.includes(COLLECT_ATTR));
        if (op?.id) {
            await siyuan.setBlockAttrs(op.id, { [COLLECT_ATTR]: attrValue } as any);
            sectionCache.set(`${targetDocID}|${attrValue}`, op.id);
        }
    } catch (e) {
        console.warn("[tomato anno] ensure section attr failed:", e);
    }
}

/** 找/建某天的日记文档：attributes 精确查 → blocks.ial 兜底 → 今天走内核幂等通道 →
 *  历史天补建（今天日记同目录 + YYYY-MM-DD 名 + 挂 custom-dailynote-YYYYMMDD，
 *  思源认作该日日记）。setBlockAttrs 二次补写不可省：createDocWithMd 的 attr 只落
 *  ial 不进 attributes 表（ensureSectionAttr 同款坑），下次收集的精确查询才认得。 */
export async function findOrCreateDailyDoc(box: string, ymd: string): Promise<string> {
    const attrName = dailyNoteAttrName(ymd);
    const byAttr = await siyuan.sqlOne(`select block_id as id from attributes where box='${box}' and name='${attrName}'`);
    if (byAttr?.id) return byAttr.id;
    const byIal = await siyuan.sqlOne(`select id from blocks where box='${box}' and type='d' and ial like '%${attrName}="${ymd}"%'`);
    if (byIal?.id) return byIal.id;
    // box 无效（复刻空间残留设置等）内核返 code0+null——空值上抛可读错误，勿today.id 直炸
    const today = await siyuan.createDailyNote(box); // 今天幂等存在；历史补建取其目录
    if (!today?.id) return "";
    if (ymd === dayStamp(new Date())) return today.id;
    let hpath = (await siyuan.sqlOne(`select hpath from blocks where id='${today.id}'`))?.hpath ?? "";
    if (!hpath) {
        // 今天日记刚建完 blocks 行未进索引（同秒窗口，e2e 实锤补建日记落根目录）——歇一拍重查
        await new Promise((r) => setTimeout(r, 1200));
        hpath = (await siyuan.sqlOne(`select hpath from blocks where id='${today.id}'`))?.hpath ?? "";
    }
    const docID = await siyuan.createDocWithMd(box, backfillDailyPath(hpath, ymd), "", "", { [attrName]: ymd } as any);
    await siyuan.setBlockAttrs(docID, { [attrName]: ymd } as any);
    return docID;
}

/** 执行编排：VIP 门 → 取数 → 装配 → 目标解析 → 幂等写入/剪贴板 → pushMsg 回执。
 *  daily 去向=按日归档：按批注最后修改日分桶 → 逐天找/建日记 → 全量重写该天节（搬家
 *  天然达成：改过批注从旧节消失进新节）→ 空节清理 → 回执「→ X 天日记」。 */
export async function runCollect(input: CollectInput): Promise<void> {
    const scope = input.scope ?? "doc";
    const dest = input.dest ?? "daily";
    if (!input.scopeDocID) return;
    // VIP 门（灰档零试用拍板）：递归未激活直接弹统一解锁框，零写入零试用计数
    if (scope === "tree" && !lastVerifyResult() && !isMe()) {
        const { openUnlockDialog } = await import("../unlockDialog");
        openUnlockDialog({ product: "tomato" });
        return;
    }
    let count = 0;
    try {
        const rows = await fetchCollectRows(scope, input.scopeDocID);
        const groups = collectGroups(rows, await subtreeDocNames(input.scopeDocID));
        count = groups.reduce((n, g) => n + g.items.length, 0);
        if (count === 0) {
            // 删光后收集仍要走空节清理（keepKeys 空=该 scope 旧节全删）——提前 return
            // 跳过 removeStaleSections 的话，已删批注会在日记节永久残留（review P1）
            if (dest === "daily") {
                const box = dailyCollectBoxID(commentBoxAnnoDraftNotebook.get(), await resolveDailyNotebookID());
                if (box) await removeStaleSections(box, new Set<string>(), input.scopeDocID);
            }
            if (!input.auto) siyuan.pushMsg(tomatoI18n.未发现批注);
            return;
        }
        const byDay = groupByDay(groups);
        debugLog("anno_collect", `scope=${scope} dest=${dest} groups=${groups.length} items=${count} days=${byDay.size}`, "anno");
        // clipboard/file 保持扁平不分桶（纯文本/单文档无日期归位问题），节日期=收集日
        const flatBlocks = async () => {
            const now = new Date();
            const attrValue = collectKeyValue(dayStamp(now), input.scopeDocID);
            const heading = sectionHeadingMD(
                (await collectDocName(input.scopeDocID)) || "?",
                `${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
                attrValue,
            );
            return { attrValue, blocks: sectionBlocks(heading, groups, scope === "tree") };
        };
        if (dest === "clipboard") {
            const { blocks } = await flatBlocks();
            await navigator.clipboard.writeText(blocks.join("\n\n"));
            siyuan.pushMsg(`${tomatoI18n.已收集} ${count} ${tomatoI18n.条批注} → ${tomatoI18n.剪贴板}`);
            return;
        }
        if (dest === "daily") {
            const box = dailyCollectBoxID(commentBoxAnnoDraftNotebook.get(), await resolveDailyNotebookID());
            if (!box) {
                siyuan.pushMsg(tomatoI18n.未找到日记笔记本);
                return;
            }
            const scopeName = (await collectDocName(input.scopeDocID)) || "?";
            const keepKeys = new Set<string>();
            for (const [ymd, dayGroups] of byDay) {
                const targetDocID = await findOrCreateDailyDoc(box, ymd);
                if (!targetDocID) { // box 无效（残留设置指向不存在笔记本）=日记本缺失语义
                    siyuan.pushMsg(tomatoI18n.未找到日记笔记本);
                    return;
                }
                const attrValue = collectKeyValue(ymd, input.scopeDocID);
                keepKeys.add(attrValue);
                const heading = sectionHeadingMD(scopeName, `${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`, attrValue);
                await writeSection(targetDocID, sectionBlocks(heading, dayGroups, scope === "tree"), attrValue);
            }
            await removeStaleSections(box, keepKeys, input.scopeDocID);
            const [first] = byDay.keys();
            const destName = byDay.size === 1
                ? `${first.slice(4, 6)}-${first.slice(6, 8)} ${tomatoI18n.日记}`
                : `${byDay.size} ${tomatoI18n.天日记}`;
            if (!input.auto) siyuan.pushMsg(`${tomatoI18n.已收集} ${count} ${tomatoI18n.条批注} → ${destName}`);
            debugLog("anno_collect", `done days=${byDay.size} count=${count} auto=${input.auto ? 1 : 0}`, "anno");
            return;
        }
        // dest=file：目标记忆失效即清（下次需重选）
        const targetDocID = input.targetDoc ?? "";
        if (!targetDocID || !(await siyuan.checkBlockExist(targetDocID))) {
            annoCollectTargetDoc.set("");
            void annoCollectTargetDoc.write();
            siyuan.pushMsg(tomatoI18n.收集目标已失效请重选);
            return;
        }
        const { attrValue, blocks } = await flatBlocks();
        await writeSection(targetDocID, blocks, attrValue);
        siyuan.pushMsg(`${tomatoI18n.已收集} ${count} ${tomatoI18n.条批注} → 《${await collectDocName(targetDocID)}》`);
        debugLog("anno_collect", `done target=${targetDocID} count=${count}`, "anno");
    } catch (e) {
        console.warn("[tomato anno] collect failed:", e);
        debugLog("anno_collect", `error=${String(e)}`, "anno");
        siyuan.pushMsg(tomatoI18n.收集失败);
    }
}

/** 空节清理（搬家后续）：整个日记笔记本内，该 scope（钥匙 |scopeID 后缀）不在本次
 *  重算钥匙集的节 → 整节删除（planReplaceSection 同款边界）。必须扫全 box 而非只扫
 *  本次写入的文档——空节所在文档恰恰因「该天无批注」不被写入（2026-09-09 e2e 实锤）。
 *  file 目标文档同形钥匙（file 节=收集日|scopeID 形态）防误伤：跳过当前 file 目标。 */
async function removeStaleSections(box: string, keepKeys: Set<string>, scopeID: string): Promise<void> {
    const fileTarget = annoCollectTargetDoc.get();
    const rows = (await siyuan.sql(`select a.block_id as id, a.value, b.root_id as root from attributes a join blocks b on a.block_id=b.id
        where a.name='${COLLECT_ATTR}' and b.box='${box}' and a.value like '%|${scopeID}'`)) ?? [];
    for (const r of rows as { id?: string; value?: string | null; root?: string }[]) {
        if (!r?.id || !r.value || !r.root || keepKeys.has(r.value)) continue;
        if (fileTarget && r.root === fileTarget) continue;
        const children = (await siyuan.getChildBlocks(r.root)) ?? [];
        const plan = planReplaceSection(children as any, r.id, []);
        if (plan && plan.delIDs.length > 0) await siyuan.transactions(siyuan.transDeleteBlocks(plan.delIDs));
        sectionCache.delete(`${r.root}|${r.value}`); // 删后缓存指空块：不清则下次 miss 定位安全降级末尾追加
    }
}

/** 快通道（右键子菜单/命令）：scope 沿用上次记忆，dest 写记忆后执行；file 需先有目标记忆 */
export async function quickCollect(scopeDocID: string, dest: "clipboard" | "daily" | "file"): Promise<void> {
    const scope = annoCollectScope.get() === "tree" ? "tree" : "doc";
    annoCollectDest.set(dest);
    void annoCollectDest.write();
    await runCollect({ scopeDocID, scope, dest, targetDoc: dest === "file" ? annoCollectTargetDoc.get() : undefined });
}
