// □2 词级导线数据链纯函数（spec docs/tomato-mindwire-visual-spec.md §3/D12）。
// 词级锚点=批注同款 setInlineMark('a') 标记对：href 前缀 #tomato-mindwire-<wireId>
// 与批注 #tomato-anno- 天然隔离；关系类型存文档根块属性 custom-mindwire-relations
// （JSON map，改关系只写属性不动标记）；孤儿=线真没了的属性条目——不是「页面上没有」，长文档
// 内核只加载一部分块——重画时页面上没有的先当候选，问过内核索引确认后才回写（orphanAttrPatch）。
// 箭头（2026-11 流动兔反馈三件小改之一，设计 docs/superpowers/specs/2026-11-25-mindwire-small-batch-design.md
// 「一、箭头」）：一条线可带一个箭头，指向「后选的那个词」。同样不碰词上的标记，方向记在
// 文档根块属性 custom-mindwire-arrows（JSON map，线号→值），读写/清理/方向判定在下半段。
// 一条线在页面上可能不止两个端（连线词的一部分被上色/加粗，标记被切开）：紧挨着的片段先并成一个端点，
// 再取前两个端点，见 groupWordWires。
// 渲染接线见 MindWire.ts；曲线几何见 mindWireGeom.ts。

export const WORD_WIRE_HREF_PREFIX = "#tomato-mindwire-";
export const RELATIONS_ATTR = "custom-mindwire-relations";
/** 箭头记录的属性名（全小写：内核写入即小写化，带大写的名字读回恒 miss） */
export const ARROWS_ATTR = "custom-mindwire-arrows";

export type RelationKey = "related" | "echo" | "foreshadow" | "metaphor" | "contrast" | "cause";

/** 六档关系色（spec §4.7；color7 批注橙全板排除） */
export const RELATION_COLOR: Record<RelationKey, string> = {
    related: "var(--b3-font-color5)",
    echo: "var(--b3-font-color6)",
    foreshadow: "var(--b3-font-color8)",
    metaphor: "var(--b3-font-color9)",
    contrast: "var(--b3-font-color10)",
    cause: "var(--b3-font-color11)",
};

/** 关系色查表：未知/缺省 key 兜底「关联」灰5（新线默认档，语义诚实不强迫选色） */
export function relationColor(key: string | undefined): string {
    return RELATION_COLOR[key as RelationKey] ?? RELATION_COLOR.related;
}

/** wire id：mw + Date.now().toString(36) + 2 位随机 base36（spec §3.1）；now/rand 注入供测试 */
export function makeWireId(now: number = Date.now(), rand: () => number = Math.random): string {
    const digit = () => Math.floor(rand() * 36).toString(36);
    return "mw" + now.toString(36) + digit() + digit();
}

/** href → wireId：词级前缀命中剥前缀；批注/普通链接/裸串/空前缀一律 null */
export function wireIdFromHref(href: string | null | undefined): string | null {
    if (!href?.startsWith(WORD_WIRE_HREF_PREFIX)) return null;
    const id = href.slice(WORD_WIRE_HREF_PREFIX.length);
    return id || null;
}

/** 一个带链接的片段。joined＝紧挨着前一个同线号的片段（同一个词被切开后的下一截，wireFragmentsJoined 判）；
 *  第一个片段、复制粘贴出来的副本都是 false */
export interface WordWireItem<T> {
    href: string;
    end: T;
    joined?: boolean;
}

export interface GroupedWordWires<T> {
    /** 成对的线，两端按文档顺序。一条线在页面上可能不止两个带链接的片段：给多字连线词的一部分上色/
     *  加粗，内核会把这段标记切开，每个片段都带着同一个链接。先把紧挨着的片段并成一个端点（还是那个词），
     *  再取前两个端点：被切开的词不会被当成一对，真正的另一头不会丢（原先取前两个，切开的「坚」「持」
     *  会被当成一对）。不能简单取「第一个和最后一个」：同一篇文档里复制粘贴出来的副本跟原来的锚词不相邻，
     *  各算一个端点，取首尾会让线改连到副本上（2026-11-27 整体评审实跑）。端点取离另一头最近的那一片。
     *  整条线的片段全都紧挨着时不并（见函数里） */
    pairs: { wireId: string; ends: [T, T] }[];
    /** 没当成端点的片段，按线号、DOM 顺序：被切开的词里不靠外的那些片段、第三个及以后的端点（副本）。
     *  它们不是端点，但 CSS 圆点是按选择器给每个带链接的片段画的、线色只写在两端上——渲染层要拿这份去
     *  藏圆点（MindWire.ts drawWordOne），否则中间片段露出回退的 4 号色圆点，像一个没连线的端点 */
    middles: Map<string, T[]>;
    /** 单端 wireId（不成线；仍在 seen 里，孤儿判定不算它） */
    singles: Set<string>;
    /** DOM 中出现过的全部 wireId（孤儿差集的 DOM 侧全集） */
    seen: Set<string>;
}

/** 片段列表 → wireId 分组配对（T=锚 span，泛型保纯函数可测） */
export function groupWordWires<T>(items: WordWireItem<T>[]): GroupedWordWires<T> {
    const byId = new Map<string, { end: T; joined: boolean }[]>();
    for (const { href, end, joined } of items) {
        const id = wireIdFromHref(href);
        if (!id) continue;
        const arr = byId.get(id);
        if (arr) arr.push({ end, joined: !!joined });
        else byId.set(id, [{ end, joined: !!joined }]);
    }
    const pairs: { wireId: string; ends: [T, T] }[] = [];
    const middles = new Map<string, T[]>();
    const singles = new Set<string>();
    for (const [wireId, frags] of byId) {
        // 紧挨着的片段并成一个端点（同一个词）
        const joined: T[][] = [];
        for (const frag of frags) {
            const last = joined[joined.length - 1];
            if (frag.joined && last) last.push(frag.end);
            else joined.push([frag.end]);
        }
        // 整条线的片段全都紧挨着：分不清是「一个词被切开、另一头已经没了」还是「一条线的两头正好挨着」
        // （「因」连「果」，中间一个字都没有）。后一种并完线就没了，所以不并，每片各算一个端点
        const ends = joined.length === 1 ? frags.map((frag) => [frag.end]) : joined;
        if (ends.length < 2) {
            singles.add(wireId);
            continue;
        }
        const [first, second] = ends;
        pairs.push({ wireId, ends: [first[first.length - 1], second[0]] });
        const mid = [...first.slice(0, -1), ...second.slice(1)];
        for (const more of ends.slice(2)) mid.push(...more);
        if (mid.length) middles.set(wireId, mid);
    }
    return { pairs, middles, singles, seen: new Set(byId.keys()) };
}

const WORD_WIRE_SPAN = `span[data-type~="a"][data-href^="${WORD_WIRE_HREF_PREFIX}"]`;
const ZERO_WIDTH = /[\u200B\u2060\uFEFF]/g;

/** 块里的文本节点，按文档顺序 */
function* textNodesOf(root: Node): Generator<Text> {
    for (let n = root.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3) yield n as Text;
        else yield* textNodesOf(n);
    }
}

/** 「同一个块」的判定单位：带块号的块，外加表格格子——表格里没打开内层编辑器的格子，里面的内容不带块号
 *  （临时段落是打开编辑器时才生成的，util/tableCellRich.ts），只按块号找会一路找到整张表，
 *  相邻两格的锚词就被当成一个词切开的两片 */
const FRAGMENT_BLOCK = "[data-node-id], td, th";

/** 两个同线号的片段是不是紧挨着——同一个词被切开后的相邻两截（上色/加粗只覆盖了词的一部分）：
 *  在同一个块里，从前一片段的末尾到后一片段的开头之间没有真字（零宽字符不算：内核在行内代码、
 *  上下标这类元素前后会塞）。中间隔了别的字，或者跨了块（同一篇文档里复制粘贴出来的副本），都不算。
 *  不能只看是不是相邻兄弟：行内格式是嵌套的，切开后的两片可能一片裹在 strong/em 里 */
export function wireFragmentsJoined(prev: Node, next: Node): boolean {
    const block = prev.parentElement?.closest(FRAGMENT_BLOCK);
    if (!block || block !== next.parentElement?.closest(FRAGMENT_BLOCK)) return false;
    let started = false;
    for (const node of textNodesOf(block)) {
        const host = node.parentElement?.closest(WORD_WIRE_SPAN);
        if (host === next) return started;
        if (host === prev) started = true;
        else if (started && node.data.replace(ZERO_WIDTH, "")) return false;
    }
    return false;
}

/** 文档根块属性 JSON 容错解析：坏 JSON/非对象 → 空 map（渲染走默认色，不抛） */
export function parseRelations(attr: string | null | undefined): Record<string, string> {
    if (!attr) return {};
    try {
        const v = JSON.parse(attr);
        return v && typeof v === "object" && !Array.isArray(v) ? v : {};
    } catch {
        return {};
    }
}

/** 孤儿差集：属性条目 − 已知在世的线号（页面上扫到的 ∪ 内核答标记还在文档里的，见 orphanAttrPatch；
 *  别只喂页面扫集——长文档里没加载的块会被当成孤儿）。seen 含单端。返回回写值——null=无孤儿不写；
 *  JSON=清理后余量；""=清空到零（思源惯例空串=删属性）。坏 JSON 返回 null 宁留不误清 */
export function cleanupRelations(attr: string | null | undefined, aliveWireIds: Set<string>): string | null {
    const map = parseRelations(attr);
    const keys = Object.keys(map);
    if (keys.length === 0) return null;
    const orphans = keys.filter((k) => !aliveWireIds.has(k));
    if (orphans.length === 0) return null;
    orphans.forEach((k) => delete map[k]);
    return Object.keys(map).length ? JSON.stringify(map) : "";
}

// ---------------------------------------------------------------------------
// 删除钮记下的线（2026-11-27 整体评审后改成按文档分开）。孤儿清理时这些线号不必走「问索引＋正文
// 复核」那两级（索引滞后几百毫秒，等它会让「删线后记录没了」变成看运气）。按文档分开的原因：内核
// 菜单「复制文档」出来的副本带着同一批线号，副本里删掉一条线，不能让原文档里同号的活线跟着被清
// （原先只按线号记）。清理成功即忘掉；没清成的最多留 DELETED_WIRE_TTL_MS 再过期，免得撤销把这条线
// 恢复回来之后还被记成「已删」。
// ---------------------------------------------------------------------------

/** 文档根 id → 线号 → 删的时刻 */
export type DeletedWires = Map<string, Map<string, number>>;
export const DELETED_WIRE_TTL_MS = 30 * 1000;

function pruneDeletedWires(reg: DeletedWires, now: number): void {
    for (const [rootID, m] of reg) {
        for (const [wireId, at] of m) {
            if (now - at > DELETED_WIRE_TTL_MS) m.delete(wireId);
        }
        if (!m.size) reg.delete(rootID);
    }
}

/** 记下「这篇文档里这几条线是插件自己摘掉的」（删除钮） */
export function noteDeletedWires(reg: DeletedWires, rootID: string, wireIds: string[], now = Date.now()): void {
    pruneDeletedWires(reg, now);
    let m = reg.get(rootID);
    if (!m) reg.set(rootID, (m = new Map()));
    wireIds.forEach((id) => m!.set(id, now));
}

/** 这篇文档里「插件自己摘掉、还没过期」的线号；没有 → undefined。顺手清掉各文档里过期的 */
export function deletedWireIds(reg: DeletedWires, rootID: string, now = Date.now()): Set<string> | undefined {
    pruneDeletedWires(reg, now);
    const m = reg.get(rootID);
    return m?.size ? new Set(m.keys()) : undefined;
}

/** 清理成功（或者不需要了）就忘掉 */
export function forgetDeletedWires(reg: DeletedWires, rootID: string, wireIds: string[]): void {
    const m = reg.get(rootID);
    if (!m) return;
    wireIds.forEach((id) => m.delete(id));
    if (!m.size) reg.delete(rootID);
}

// ---------------------------------------------------------------------------
// 箭头（设计 2026-11-25-mindwire-small-batch-design.md「一、箭头」）。值四种：off-fwd/off-rev
// =记了方向、箭头关着；fwd/rev=箭头开着。fwd=起点在前、终点在后（顺着读），rev=反过来。
// 两个时刻写它：连线成线时（记方向，箭头关着；孤儿续连则开关沿用只换方向）、迷你条
// 「箭头」钮（开↔关）。读的时候任何不认识的值都当「没有」；坏 JSON 不抛。
// ---------------------------------------------------------------------------

export type ArrowValue = "off-fwd" | "off-rev" | "fwd" | "rev";

const ARROW_VALUES: ReadonlySet<string> = new Set<ArrowValue>(["off-fwd", "off-rev", "fwd", "rev"]);

/** 箭头属性 JSON 容错解析：坏 JSON/非对象 → 空 map；任何不认识的值都当「没有」（不进 map，不抛） */
export function parseArrows(attr: string | null | undefined): Record<string, ArrowValue> {
    const out: Record<string, ArrowValue> = {};
    for (const [wireId, value] of Object.entries(parseRelations(attr))) {
        if (ARROW_VALUES.has(value)) out[wireId] = value as ArrowValue;
    }
    return out;
}

/** 箭头记录孤儿清理：与 cleanupRelations 同款（属性条目 − 已知在世的线号）。
 *  线没了记录跟着删；单端在世不算孤儿——孤儿起点拾回续连后开关要沿用原值 */
export function cleanupArrows(attr: string | null | undefined, aliveWireIds: Set<string>): string | null {
    return cleanupRelations(attr, aliveWireIds);
}

// ---------------------------------------------------------------------------
// 孤儿清理的判定（2026-11-26 评审发现后重做）。孤儿＝线真没了（文档里它的标记一个都不剩），
// 不是「页面上没有」：长文档内核只加载一部分块（dynamicLoadBlocks，默认 192），打开文档这一下
// 就有块不在页面上，滚动时还会把远处的块卸掉（内核默认配置）。只看页面，没加载的线全成孤儿
// ——实例实测：300 段的文档一打开，第 97 段之后的线，关系色和箭头记录当场被删。
// 所以属性里有、页面上没有的线号只是候选，要两级确认才算没了：
//   ① 问内核索引（便宜，每次重画都问得起）：连线标记在 blocks.markdown 里是原样的
//      [词](#tomato-mindwire-线号)；
//   ② 索引说没了的，再读文档正文复核：索引是异步队列、会滞后（实例实测：改块后约 350ms 跟上，
//      新建文档超过 1.5s），正文是事务当时落盘的（实例实测：刚建完索引里 0 块，正文里标记已可数）。
// 插件自己摘掉标记的线不必走这两步。任何一步没问到，一条都不删。
// ---------------------------------------------------------------------------

/** 孤儿候选：各属性的键并集 − 页面扫集（含单端）。按属性的书写顺序，先 relations 后 arrows */
export function absentWireIds(seen: Set<string>, ...attrs: (string | null | undefined)[]): string[] {
    const out: string[] = [];
    for (const attr of attrs) {
        for (const id of Object.keys(parseRelations(attr))) {
            if (!seen.has(id) && !out.includes(id)) out.push(id);
        }
    }
    return out;
}

/** 查询语句：这篇文档一行——n＝索引里这篇文档的块数（0＝索引不认识这篇文档），每个线号一列
 *  c0..＝带这个线号标记的块数。按 (#tomato-mindwire-线号) 匹配，带闭合括号，mw1 串不到 mw12 */
export function wirePresenceSql(rootId: string, wireIds: string[]): string {
    if (!wireIds.length) return "";
    const q = (s: string) => s.replace(/'/g, "''");
    const cols = wireIds.map((id, i) => `SUM(CASE WHEN markdown LIKE '%(${WORD_WIRE_HREF_PREFIX}${q(id)})%' THEN 1 ELSE 0 END) AS c${i}`);
    return `SELECT COUNT(1) AS n,${cols.join(",")} FROM blocks WHERE root_id='${q(rootId)}'`;
}

/** 查询结果 → 标记还在文档里的线号集合。不知道时返回 null（调用方一条都不删）：返回的不是行
 *  数组、没有行，或者索引里这篇文档一个块都没有（索引没建好/在重建——这时「查不到」说明不了线没了） */
export function presentWireIds(rows: unknown, wireIds: string[]): Set<string> | null {
    if (!Array.isArray(rows) || !rows.length) return null;
    const row = rows[0] as Record<string, unknown> | null;
    if (!row || typeof row !== "object" || !(Number(row.n) > 0)) return null;
    const out = new Set<string>();
    wireIds.forEach((id, i) => {
        if (Number(row[`c${i}`]) > 0) out.add(id);
    });
    return out;
}

/** 第二级——拿文档正文复核（exportMdContent 的 content）：正文里找不到标记 [词](#tomato-mindwire-线号)
 *  的线号才算没了。段落、标题、列表、表格、引用里都是这一种写法。没拿到正文（读失败/空）→ 一个都
 *  不确认没了。按带闭合括号的整段标记找，mw1 的标记不替 mw12 作数 */
export function wiresMissingFrom(content: string | null | undefined, wireIds: string[]): string[] {
    if (!content) return [];
    return wireIds.filter((id) => !content.includes(`(${WORD_WIRE_HREF_PREFIX}${id})`));
}

export interface OrphanPatchInput {
    relations: string | null | undefined;
    arrows: string | null | undefined;
    /** 页面上扫到的线号（含单端） */
    seen: Set<string>;
    /** 内核确认「文档里已经没有这个线号的标记」的候选线号（索引粗筛＋正文复核都过了）。只该含被
     *  问过的线号：没问过的即使页面上没有也不能当它没了（比如等内核回话期间别的编辑器刚连出来
     *  的线）。null/不传＝没确认成，一条都不删 */
    goneFromDoc?: Set<string> | null;
    /** 插件自己刚摘掉两端标记的线号（删除钮）：不必走内核那两级确认 */
    knownDeleted?: Set<string>;
}

export interface OrphanPatch {
    /** 要写回的属性值（只含真变了的那个/些属性）；""＝清空到零 */
    relations?: string;
    arrows?: string;
    /** 这一批确认没了、已被清掉的线号 */
    gone: string[];
}

/** 孤儿清理的完整判定（纯函数）：候选里真没了的才删，返回要写回的属性；没有要删的 → null。
 *  没被删的候选算「在世」，两个属性按同一份在世集合求差，一次写回 */
export function orphanAttrPatch(input: OrphanPatchInput): OrphanPatch | null {
    const candidates = absentWireIds(input.seen, input.relations, input.arrows);
    const gone = candidates.filter((id) => input.knownDeleted?.has(id) || !!input.goneFromDoc?.has(id));
    if (!gone.length) return null;
    const alive = new Set([...input.seen, ...candidates.filter((id) => !gone.includes(id))]);
    const relations = cleanupRelations(input.relations, alive);
    const arrows = cleanupArrows(input.arrows, alive);
    if (relations == null && arrows == null) return null;
    const patch: OrphanPatch = { gone };
    if (relations != null) patch.relations = relations;
    if (arrows != null) patch.arrows = arrows;
    return patch;
}

/** 两个节点的公共祖先（都连在文档上才找得到；不在同一棵树 → null） */
function commonAncestor(a: Node, b: Node): Node | null {
    const chain = new Set<Node>();
    for (let n: Node | null = a; n; n = n.parentNode) chain.add(n);
    for (let n: Node | null = b; n; n = n.parentNode) {
        if (chain.has(n)) return n;
    }
    return null;
}

/** 文档位置定方向（连线成线时、写终点标记之前调用——写标记会让内核重建这一块的页面结构，
 *  之后再比位置就失效了）：终点选区的起点在起点词之后 → true（fwd），之前 → false（rev）。
 *  按位置比、不按节点身份比：Node.compareDocumentPosition 比的是节点，而选区边界常落在元素
 *  容器上（记成「第几个子节点」），起点词又是这个容器的后代，按节点比会一律判成「在前」。
 *  同一个位置的两种写法（元素容器 × 文本节点）只有从公共祖开头数文本长度才等价
 *  （domUtils selectionBlankSide/blankNeighborRange 同款）。
 *  返回 null=算不出（任一端脱离文档、不在同一棵树，或终点选区起点落在起点词里面——那是
 *  「起点终点相同」，调用方先拦）：调用方不写记录 */
export function wireArrowForward(
    start: Node | null | undefined,
    end: Pick<Range, "startContainer" | "startOffset"> | null | undefined,
): boolean | null {
    const container = end?.startContainer;
    if (!start?.isConnected || !container?.isConnected) return null;
    const root = commonAncestor(start, container);
    if (!root) return null;
    // 从公共祖先开头到某个位置的文本长度＝这个位置的刻度
    const depth = (node: Node, offset: number) => {
        const probe = document.createRange();
        probe.setStart(root, 0);
        probe.setEnd(node, offset);
        return probe.toString().length;
    };
    const wordStart = depth(start, 0);
    const wordEnd = depth(start, start.childNodes.length);
    const at = depth(container, end!.startOffset);
    if (at >= wordEnd) return true;
    if (at <= wordStart) return false;
    return null;
}

/** 改一条线的箭头记录、返回写回的属性值：只动 wireId 这一条，其余条目原样留着——值不认识
 *  的也不滤（不认识只是读的时候当没有，动别的线不替用户删数据；与 cleanupRelations「宁留
 *  脏数据不误清」、setRelation 全量保留同一口径），坏 JSON/非对象才整份重来。这条线原来的值
 *  拆成「开没开」「哪个方向」交给 next 定新值：不认识的值=关着＋顺着读 */
function writeArrowValue(
    attr: string | null | undefined, wireId: string,
    next: (on: boolean, dir: "fwd" | "rev") => ArrowValue,
): string {
    const map = parseRelations(attr);
    const cur = parseArrows(attr)[wireId];
    const on = cur === "fwd" || cur === "rev";
    const dir = cur === "rev" || cur === "off-rev" ? "rev" : "fwd";
    map[wireId] = next(on, dir);
    return JSON.stringify(map);
}

/** 成线时写记录：这条线没有记录（或值不认识）→ 箭头关着＋现算方向 off-fwd/off-rev（新连的线
 *  不带箭头）；已有记录（孤儿拾回续连）→ 开关沿用原值、只换方向。返回写回值（JSON） */
export function recordWireArrow(attr: string | null | undefined, wireId: string, forward: boolean): string {
    return writeArrowValue(attr, wireId, (on) => `${on ? "" : "off-"}${forward ? "fwd" : "rev"}`);
}

/** 迷你条「箭头」钮：开↔关，方向不动。没有记录的线（功能上线前连的）第一次点按顺着读写 fwd */
export function toggleWireArrow(attr: string | null | undefined, wireId: string): string {
    return writeArrowValue(attr, wireId, (on, dir) => `${on ? "off-" : ""}${dir}`);
}

/** 箭头画在哪一端：配对给出的两端本来就是文档顺序（groupWordWires），fwd 的箭头在第二端、
 *  rev 在第一端；关着/没有记录 → null（不画） */
export function arrowEndIndex(value: ArrowValue | undefined): 0 | 1 | null {
    if (value === "fwd") return 1;
    if (value === "rev") return 0;
    return null;
}

export type WireEndCheck = "ok" | "same" | "crossdoc";

/** 两步流第二步边界判定（spec §4.3 边界表，□3）：终点选区命中的既有标记 wireId
 *  与 pending 同线 → same（起点终点相同）；rootId 不同 → crossdoc（仅限本文档）；
 *  划在别的线上（一词多线复用）是合法端 → ok */
export function checkWireEnd(
    pending: { wireId: string; rootId: string },
    target: { selWireId: string | null; rootId: string },
): WireEndCheck {
    if (target.selWireId === pending.wireId) return "same";
    if (target.rootId !== pending.rootId) return "crossdoc";
    return "ok";
}

/** 词文本截断：芯片起点词 12 字（spec §4.4）/ 残端标签 8 字（spec §4.2） */
export function wordClip(text: string, n: number = 12): string {
    return text.length > n ? text.slice(0, n) + "…" : text;
}

/** 单端锚词拾回（二期 □2 孤儿自救）：孤儿起点标记 span 的 href+文本重建 WordPending，
 *  wireId 沿用原线 id（不新造——续连成线须与存量 span/属性条目同 id）；词文本剥
 *  ZWSP+内部换行（跨行 span；芯片 nowrap 渲染与截断计数不含它）+trim，与 startWordWire
 *  词快照同规；href 坏前缀/空词/空 rootId 一律 null 不拾 */
export function reviveWordPending(
    href: string | null, text: string, rootId: string,
): { wireId: string; word: string; rootId: string } | null {
    const wireId = wireIdFromHref(href);
    const word = text.replace(/[\u200b\n]/g, "").trim();
    if (!wireId || !word || !rootId) return null;
    return { wireId, word, rootId };
}

/** 两步流两态文案单一事实源（二期 □1）：右键菜单/划词工具条 tooltip/命令通道同源。
 *  pendingWord 空串视为无 pending（startWordWire 的 range.toString().trim() 保证非空）。 */
export function wordWireTip(pendingWord: string | null, i18nStart: string, i18nConnect: string): string {
    if (!pendingWord) return i18nStart;
    return `${i18nConnect}：「${wordClip(pendingWord)}」`;
}

/** 两态换 tip 时保留内核拼进 aria-label 的热键尾注（ToolbarItem：tip + " " + updateHotkeyTip）。
 *  tip 本身可含空格，从尾部剥一个词元判是否键形（mac 修饰字形须起始、win 修饰名、裸 F 档；
 *  mac 不加 ^ 锚会把「含修饰字形的普通词」误当热键保留并逐轮自延续垃圾尾——评审 P2-1） */
export function mergeTipKeepHotkey(label: string, nextTip: string): string {
    const idx = label.lastIndexOf(" ");
    const last = idx > -1 ? label.slice(idx + 1) : "";
    const isHotkey = /^[⌘⌥⇧⌃]/.test(last) || /^(Ctrl|Shift|Alt)/.test(last) || /^F\d+$/.test(last);
    return isHotkey ? `${nextTip} ${last}` : nextTip;
}
