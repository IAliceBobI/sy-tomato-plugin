// 批注收集（2026-09-02 spec docs/tomato-anno-collect-design.md）：纯函数层——
// 幂等键/子树前缀/片段裁剪/引用行/节装配/同日替换边界定位。零 UI/零 siyuan 依赖，
// tests/unit/annoCollect.test.ts 锁定契约。取数与执行编排在文件下半段。
import { parseAnnotations, type TomatoAnnotation } from "./annotationsAttr";
import { stripAllAnnoLinks } from "./annoKramdown";
import { clipAnnoNoteAnchor } from "./annoNoteBlock";
import type { AnnoPanelItem } from "./annoPanelList";
import { fmtAnnoTime, mapLimit } from "./annoPanelList";
import { siyuan } from "./utils";
import { NewConfiguredLute } from "./globals";
import { lastVerifyResult, isMe } from "./user";
import { resolveDailyNotebookID } from "./annoDraft";
import { events } from "./Events";
import { tomatoI18n } from "../tomatoI18n";
import { annoCollectScope, annoCollectDest, annoCollectTargetDoc, annoCollectAnchor, annoCollectColor, commentBoxAnnoDraftNotebook } from "./stores";
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

/** 片段折叠（纯划线列表行用）：按码点截 limit 加 …，换行折叠为空格——列表项内引述单行
 *  保结构；引号不转义（旧锚文本通道 `((id "…"))` 才要求，引述块纯文本原样即可） */
export function clipFlatText(txt: string, limit = 100): string {
    const flat = txt.replace(/\s*(?:\r\n|\r|\n)+\s*/g, " ").trim();
    const cps = [...flat];
    return cps.length > limit ? cps.slice(0, limit).join("") + "…" : flat;
}

// ---------------- 陆杰 09-16 排版改造：sb 卡 + 纯划线列表 + 锚/颜色双开关 ----------------
// 形态契约（6811 实测 insertBlock markdown 通道四形态全落）：
// - 纵向 sb：`{{{row … }}}\n{: custom-tomato-anno-collected="annoID"}` → sb 块(type=s)+custom 落 sb
// - 引述多段：`> 段1\n>\n> 段2` → 单引述块多段；段间 `>` 空前缀行防拆两块
// - 尾锚：`((hostID "*"))` → 块引用文本锚（锚文本单 * 官方引用样式渲染，点击跳回原文；
//   思源无上标块引用形态，`*` 字面前缀会渲染成杂散双星号——vision 09-16 实锤）
// - 色号：`==文字=={: style="background-color: var(--b3-font-backgroundN);"}` → 官方 mark 行内 IAL

/** sb 内 custom 属性名（收集产物逐批注定位用；sb 挂卡等后续消费方的锚点） */
export const ANNO_COLLECTED_ATTR = "custom-tomato-anno-collected";

/** 官方 mark 色变量提取（颜色同步开关 ON 用）：宿主块 kramdown（getBlockKramdown 实测=
 *  IAL 后缀形态 `==[文本](#anchor)=={: style="background-color: var(--b3-font-backgroundN);"}`）
 *  中批注锚所处 mark 区间的色变量名（思源划线色板官方通道，明暗主题自适应）。
 *  邻域配对防串色：kramdown 块内容整块单行，行级粒度会取到同块其它划线的色（陆杰
 *  红=问题/蓝=实践体系下取错色=语义错乱）——开标记==须在锚前、闭合后缀在锚后、
 *  区间内恰一对 ==。锚不处于任何 mark 区间 → null = 该条导出无色。 */
export function markVarOfAnchor(kramdown: string, annoID: string): string | null {
    const idx = kramdown.indexOf(`#tomato-anno-${annoID}`);
    if (idx < 0) return null;
    const m = kramdown.slice(idx).match(/==\{: style="background-color: var\((--b3-font-background\d+)\);"\}/);
    if (!m || m.index === undefined) return null;
    const closeAt = idx + m.index;
    const openAt = kramdown.slice(0, idx).lastIndexOf("==");
    if (openAt < 0) return null;
    // 区间恰一对 ==（开+闭）：夹更多 = 闭合属于嵌套/相邻 mark，非包裹本锚
    const between = kramdown.slice(openAt, closeAt + 2);
    if ((between.match(/==/g) ?? []).length !== 2) return null;
    return m[1];
}

/** 引文 mark 包裹：写通道=行内 span 形态（Md2BlockDOM 实测认 span 不认 ==…=={: style} IAL
 *  后缀——后者是 getBlockKramdown 的输出形态，解析方向不回灌；读通道见 markVarOfAnchor） */
function markWrap(text: string, markVar: string | undefined): string {
    return markVar ? `<span data-type="mark" style="background-color: var(${markVar});">${text}</span>` : text;
}

/** 引述块文案（保形多段）：整条 500 码点截断对齐 anno-note 锚快照语义（防巨块收集膨胀）；
 *  空白段剔陬、段间 `>` 空前缀行保持单引述块多段；末段行尾接上标锚（开关一） */
function quoteBlockMarkdown(raw: string, markVar: string | undefined, anchorTail: string): string {
    const clipped = clipAnnoNoteAnchor(raw);
    const paras = clipped.split("\n").map((l) => l.trim()).filter((l) => l !== "");
    if (paras.length === 0) return "";
    return paras
        .map((p, i) => {
            const tail = i === paras.length - 1 ? anchorTail : "";
            return `> ${markWrap(p, markVar)}${tail}`;
        })
        .join("\n>\n");
}

/** sectionBlocks 装配选项（陆杰 09-16 排版改造） */
export interface SectionOpts {
    tree: boolean;
    /** 引述末尾跳回原文锚（开关一；OFF 省略 ((hostID "*")) 尾锚） */
    anchor: boolean;
    /** annoID → 宿主反查信息（开关二；markVar=划线色变量（缺=无色），quoteText=宿主
     *  kramdown 净化文本（块级批注无 sel 时的引文源——blockContent 列是残缺简写形态，
     *  锚 href/mark 半标记裸露，实弹 09-16 实锤不可直用） */
    hostInfo?: Map<string, { markVar?: string; quoteText?: string }>;
}

/** 条目引文来源：选区快照优先；块级批注用宿主 kramdown 净化文本；末退块内容 */
function itemQuoteText(it: { blockContent: string; entry: TomatoAnnotation }, hostInfo?: SectionOpts["hostInfo"]): string {
    if (it.entry.sel?.txt) return it.entry.sel.txt;
    const q = hostInfo?.get(it.entry.id)?.quoteText;
    if (q) return q;
    return it.blockContent;
}

/** 有想法的批注 → 纵向 sb 卡：想法段（kramdown 原样可多段）+ 追加行时间线 + 原文引述块 */
function annoSbMarkdown(it: { hostID: string; blockContent: string; entry: TomatoAnnotation }, opts: SectionOpts): string {
    const parts: string[] = [it.entry.text];
    for (const r of it.entry.replies ?? []) parts.push(`${fmtAnnoTime(r.time)} ${r.text}`);
    const anchorTail = opts.anchor ? ` ((${it.hostID} "*"))` : "";
    const quote = quoteBlockMarkdown(itemQuoteText(it, opts.hostInfo), opts.hostInfo?.get(it.entry.id)?.markVar, anchorTail);
    if (quote) parts.push(quote);
    return `{{{row\n${parts.join("\n\n")}\n}}}\n{: ${ANNO_COLLECTED_ATTR}="${it.entry.id}"}`;
}

/** 纯划线（无想法）条目 → 无序列表行：`- > 引文`；整组聚合一个列表块（陆杰「逐条」） */
function plainListItems(items: { hostID: string; blockContent: string; entry: TomatoAnnotation }[], opts: SectionOpts): string | null {
    const lines: string[] = [];
    for (const it of items) {
        const snippet = clipFlatText(itemQuoteText(it, opts.hostInfo));
        if (!snippet) continue;
        const anchorTail = opts.anchor ? ` ((${it.hostID} "*"))` : "";
        lines.push(`- > ${markWrap(snippet, opts.hostInfo?.get(it.entry.id)?.markVar)}${anchorTail}`);
    }
    return lines.length > 0 ? lines.join("\n") : null;
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
    // hostCount 先全量数完再产出（annoPanelFromRows 同款双遍，防首行产出时计数不全）
    const parsed: { id: string; root: string; content: string; entries: ReturnType<typeof parseAnnotations> }[] = [];
    for (const r of rows ?? []) {
        if (r?.id == null || r.id === "") continue;
        const entries = parseAnnotations(r.v);
        if (entries.length > 0) parsed.push({ id: r.id, root: r.r, content: typeof r.c === "string" ? r.c : "", entries });
    }
    const hostCount = new Map<string, number>();
    for (const p of parsed) for (const e of p.entries) hostCount.set(e.id, (hostCount.get(e.id) ?? 0) + 1);
    for (const p of parsed) {
        for (const entry of p.entries) {
            if (byId.has(entry.id)) continue; // 跨块批注只收一条，引用行指向首宿主
            byId.set(entry.id, { hostID: p.id, hostCount: hostCount.get(entry.id) ?? 1, blockContent: p.content, entry });
            if (!docOf.has(p.root)) docOf.set(p.root, new Set());
            docOf.get(p.root)!.add(entry.id);
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
 *  陆杰 09-16 排版改造：有想法=纵向 sb 卡（想法+引述保形多段+上标锚，闪卡正反面联动）；
 *  纯划线=组内无序列表逐条；tree=true 时每组前渲染 ### 《组名》（单文档模式无组标题）。
 *  空文本判定容 ZWSP（空段快照=纯划线语义）。 */
export function sectionBlocks(heading: string, groups: AnnoCollectGroup[], opts: SectionOpts): string[] {
    const isEmptyText = (t: string) => t.replace(/[\s\u200b]/g, "") === "";
    const blocks: string[] = [heading];
    for (const g of groups) {
        if (opts.tree) blocks.push(`### 《${g.docName}》`);
        const plains: { hostID: string; blockContent: string; entry: TomatoAnnotation }[] = [];
        for (const it of g.items) {
            if (isEmptyText(it.entry.text)) plains.push(it);
            else blocks.push(annoSbMarkdown(it, opts));
        }
        const list = plainListItems(plains, opts);
        if (list) blocks.push(list);
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
    // events.protyle 是 Protyle 包装类，lute 在内层 IProtyle 上（直取包装层恒空=恒走
    // 兜底，09-16 实弹根因）；双形态容错后再兜 NewConfiguredLute
    const shared = (events.protyle as unknown as { protyle?: { lute?: { Md2BlockDOM: (md: string) => string } }, lute?: { Md2BlockDOM: (md: string) => string } })?.protyle?.lute
        ?? (events.protyle as unknown as { lute?: { Md2BlockDOM: (md: string) => string } })?.lute;
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
            await ensureSectionAttrs(txs, targetDocID, attrValue, blocks);
            return;
        }
    }
    const tail = await siyuan.getDocLastID(targetDocID);
    const txs = tail
        ? await siyuan.insertBlocksAfter(doms, tail)
        : await siyuan.transactions(siyuan.transInsertBlocksAsChildOf(doms, targetDocID));
    await ensureSectionAttrs(txs, targetDocID, attrValue, blocks);
}

/** insert markdown 通道的 IAL 不进 attributes 索引表（e2e 实锤：blocks 表 markdown 可见、
 *  attributes 表恒空；setBlockAttrs 写的才进）——幂等定位链依赖三层查找，故每条插入路径
 *  完成后从事务返回补写 setBlockAttrs + 更新内存缓存：
 *  ①节标题块（data 含 COLLECT_ATTR 的 insert op）→ 幂等键；
 *  ②sb 卡（data 含 NodeSuperBlock 的 insert op，与 blocks 内 sb 序对齐）→ 逐批注定位锚
 *  （Md2BlockDOM 产物无 data-node-id，事务通道 custom-* 恒丢——两硬契约之一，实弹 09-16
 *  实锤 s 块 ial 零属性）。失败不阻塞：幂等退化为末尾追加 / sb 属性缺位（无数据损坏）。 */
async function ensureSectionAttrs(txs: unknown, targetDocID: string, attrValue: string, blocks: string[]): Promise<void> {
    try {
        const ops = (Array.isArray(txs) ? txs : []).flatMap((t: any) => (t?.doOperations ?? []) as any[]);
        const op = ops.find((o) => o?.action === "insert" && typeof o.data === "string" && o.data.includes(COLLECT_ATTR));
        if (op?.id) {
            await siyuan.setBlockAttrs(op.id, { [COLLECT_ATTR]: attrValue } as any);
            sectionCache.set(`${targetDocID}|${attrValue}`, op.id);
        }
        const sbMDs = blocks.filter((b) => b.startsWith("{{{row"));
        const sbOps = ops.filter((o) => o?.action === "insert" && typeof o.data === "string" && o.data.includes("NodeSuperBlock"));
        for (let k = 0; k < sbOps.length && k < sbMDs.length; k++) {
            const m = sbMDs[k].match(/\{: custom-tomato-anno-collected="([^"]+)"\}\s*$/);
            if (m) await siyuan.setBlockAttrs(sbOps[k].id, { [ANNO_COLLECTED_ATTR]: m[1] } as any);
        }
    } catch (e) {
        console.warn("[tomato anno] ensure section attrs failed:", e);
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

/** 宿主 kramdown → 块级批注引文文本：剥锚链接/块 IAL 尾/mark 样式包装（fetchSource 同款净化
 *  + mark 展平——引文色由 markVar 通道统一重放，kramdown 残留的半标记会裸露到引文里） */
export function hostQuoteText(kramdown: string): string {
    return stripAllAnnoLinks(kramdown.replace(/\n\{:[^\n]*\}\s*$/, ""))
        .replace(/==(.+?)==\{: style="[^"]*"\}/g, "$1")
        .replace(/==/g, "");
}

/** 宿主反查（开关二颜色 + 块级批注引文净化双动机）：按宿主块去重拉 kramdown——
 *  ①锚所处 mark 区间色变量（颜色同步 ON）；②无 sel 条目的净化引文文本（无条件——
 *  blockContent 列是残缺简写形态不可直用，实弹 09-16 实锤）。
 *  同块多条目共享一次取数；失败不阻塞收集（该条目无色/退 blockContent 降级）。 */
async function annotateHostInfo(groups: AnnoCollectGroup[], colorOn: boolean): Promise<NonNullable<SectionOpts["hostInfo"]>> {
    const byHost = new Map<string, AnnoCollectGroup["items"]>();
    for (const g of groups) {
        for (const it of g.items) {
            const needQuote = !it.entry.sel?.txt;
            if (!colorOn && !needQuote) continue; // 颜色 OFF 时只服务无 sel 条目的引文净化
            if (!byHost.has(it.hostID)) byHost.set(it.hostID, []);
            byHost.get(it.hostID)!.push(it);
        }
    }
    const info = new Map<string, { markVar?: string; quoteText?: string }>();
    await mapLimit([...byHost.entries()], 4, async ([hostID, items]) => {
        try {
            const kd = (await siyuan.getBlockKramdown(hostID))?.kramdown ?? "";
            for (const it of items) {
                const rec: { markVar?: string; quoteText?: string } = {};
                if (colorOn) {
                    const v = markVarOfAnchor(kd, it.entry.id);
                    if (v) rec.markVar = v;
                }
                if (!it.entry.sel?.txt) rec.quoteText = hostQuoteText(kd);
                if (rec.markVar || rec.quoteText) info.set(it.entry.id, rec);
            }
        } catch {
            // 单块失败=该块条目降级（无色/退 blockContent），收集主链不受影响
        }
    });
    return info;
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
        // 陆杰排版改造双开关：锚（跳回原文）+ 颜色同步（mark 色反查）
        const colorOn = annoCollectColor.get();
        const sectionOpts = {
            tree: scope === "tree",
            anchor: annoCollectAnchor.get(),
            hostInfo: await annotateHostInfo(groups, colorOn),
        };
        // clipboard/file 保持扁平不分桶（纯文本/单文档无日期归位问题），节日期=收集日
        const flatBlocks = async () => {
            const now = new Date();
            const attrValue = collectKeyValue(dayStamp(now), input.scopeDocID);
            const heading = sectionHeadingMD(
                (await collectDocName(input.scopeDocID)) || "?",
                `${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
                attrValue,
            );
            return { attrValue, blocks: sectionBlocks(heading, groups, sectionOpts) };
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
                await writeSection(targetDocID, sectionBlocks(heading, dayGroups, sectionOpts), attrValue);
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

// ---------------- □3 划线总览多选收集（anno-round2）：即席选择集通道 ----------------

/** 总览选中条目（浮层侧从 OverviewItem+组元映射而来；key=条目稳定键供选择幂等哈希） */
export interface SelectedItem {
    key: string;
    hostID: string;
    docID: string;
    docName: string;
    quote: string;
    markVar?: string;
    /** 批注条目本体；缺=纯 mark 划线（伪条目通道） */
    entry?: TomatoAnnotation;
}

/** djb2 → 8 位十六进制（选择集幂等键的短哈希；碰撞=两不同选择共用节，可接受的退化） */
function hash8(s: string): string {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0");
}

/** 选择集装配计划（纯函数，tests/unit/annoCollect.test.ts 锁定契约） */
export interface SelectedPlan {
    groups: AnnoCollectGroup[];
    hostInfo: NonNullable<SectionOpts["hostInfo"]>;
    multi: boolean;
    attrValue: string;
    heading: string;
}

/** 选择集 → 装配计划：保选择序按 docID 分组（Map 键序=首见序）；伪条目 id 与 hostInfo
 *  单遍同源；无 sel 真条目（块级）引文走 quoteText；节键=day|sel:hash8(排序 keys)。 */
export function selectedCollectPlan(
    items: SelectedItem[],
    scopeName: string,
    now: number,
): SelectedPlan {
    const byDoc = new Map<string, { docName: string; items: SelectedItem[] }>();
    for (const it of items) {
        if (!byDoc.has(it.docID)) byDoc.set(it.docID, { docName: it.docName, items: [] });
        byDoc.get(it.docID)!.items.push(it);
    }
    const d = new Date(now);
    const hostInfo: NonNullable<SectionOpts["hostInfo"]> = new Map();
    const groups: AnnoCollectGroup[] = [...byDoc.entries()].map(([docID, g]) => ({
        docID,
        docName: g.docName,
        items: g.items.map((it, i) => {
            const entry = it.entry ?? { id: `marksel-${hash8(it.key)}-${i}`, text: "", time: now, sel: { txt: it.quote } };
            const rec: { markVar?: string; quoteText?: string } = {};
            if (it.markVar) rec.markVar = it.markVar;
            if (!entry.sel?.txt && it.quote) rec.quoteText = it.quote;
            if (rec.markVar || rec.quoteText) hostInfo.set(entry.id, rec);
            // 选择集链不消费 hostCount（收集面只用 hostID 定锚），伪条目语义自洽填 1
            return { hostID: it.hostID, hostCount: 1, blockContent: "", entry };
        }),
    }));
    const attrValue = collectKeyValue(dayStamp(d), `sel:${hash8([...items].map((i) => i.key).sort().join("|"))}`);
    const heading = sectionHeadingMD(scopeName || "?", `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`, attrValue);
    return { groups, hostInfo, multi: byDoc.size > 1, attrValue, heading };
}

/**
 * 多选收集：与 runCollect 的分野——选择集是即席语义，不做 scope 全量重算/按日分桶/
 * removeStaleSections（全量重算会把「本次没选的历史批注」从节里删掉，语义错）。
 * 节键=`day|sel:<hash8(排序后 keys)>`：同选择重收集幂等替换、异选择各自追加成节，
 * runCollect 的空节清理按 `|scopeID` 后缀匹配永不波及 sel 键。
 * 多文档组（书域）→ VIP 门（runCollect tree 同款：灰档弹统一解锁框零写入）；
 * 纯 mark 无 entry → 伪条目 text=""（sectionBlocks 纯划线支路=无序列表行+markWrap 色）。
 */
export async function collectSelected(items: SelectedItem[], dest: "daily" | "file", scopeName: string): Promise<void> {
    if (items.length === 0) return;
    const plan = selectedCollectPlan(items, scopeName, Date.now());
    if (plan.multi && !lastVerifyResult() && !isMe()) {
        const { openUnlockDialog } = await import("../unlockDialog");
        openUnlockDialog({ product: "tomato" });
        return;
    }
    try {
        const blocks = sectionBlocks(plan.heading, plan.groups, {
            tree: plan.multi,
            anchor: annoCollectAnchor.get(),
            hostInfo: plan.hostInfo,
        });
        const now = new Date();
        if (dest === "daily") {
            const box = dailyCollectBoxID(commentBoxAnnoDraftNotebook.get(), await resolveDailyNotebookID());
            if (!box) {
                siyuan.pushMsg(tomatoI18n.未找到日记笔记本);
                return;
            }
            const targetDocID = await findOrCreateDailyDoc(box, dayStamp(now));
            if (!targetDocID) {
                siyuan.pushMsg(tomatoI18n.未找到日记笔记本);
                return;
            }
            await writeSection(targetDocID, blocks, plan.attrValue);
            siyuan.pushMsg(`${tomatoI18n.已收集} ${items.length} ${tomatoI18n.条批注} → ${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${tomatoI18n.日记}`);
            debugLog("anno_collect", `selected daily items=${items.length} groups=${plan.groups.length}`, "anno");
            return;
        }
        // dest=file：目标记忆失效即清（下次需重选，runCollect 同款）
        const targetDocID = annoCollectTargetDoc.get();
        if (!targetDocID || !(await siyuan.checkBlockExist(targetDocID))) {
            annoCollectTargetDoc.set("");
            void annoCollectTargetDoc.write();
            siyuan.pushMsg(tomatoI18n.收集目标已失效请重选);
            return;
        }
        await writeSection(targetDocID, blocks, plan.attrValue);
        siyuan.pushMsg(`${tomatoI18n.已收集} ${items.length} ${tomatoI18n.条批注} → 《${await collectDocName(targetDocID)}》`);
        debugLog("anno_collect", `selected file target=${targetDocID} items=${items.length}`, "anno");
    } catch (e) {
        console.warn("[tomato anno] collectSelected failed:", e);
        debugLog("anno_collect", `selected error=${String(e)}`, "anno");
        siyuan.pushMsg(tomatoI18n.收集失败);
    }
}
