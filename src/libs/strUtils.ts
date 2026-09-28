// 字符串/正则/markdown 文本工具。从原 utils.ts 拆出（2026-08 重构），utils.ts 现为 re-export 桶。
import { Md5 } from "ts-md5";
import { parseCustomTag } from "./ial";
import { NewNodeID } from "./globals";
import { chunks } from "./miscUtils";

export function stringToNumber(str: string) {
    const num = Number(str);
    return isNaN(num) ? 0 : num;
}

export function extractTextFromMarkdown(markdown: string): string {
    return markdown
        .replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        .replaceAll("*", "")
        .replaceAll(" ", "")
        .replaceAll("---", "")
}

export function replaceAll(str: string, find: string, replace: string): string {
    return str.replace(new RegExp(find, "g"), replace);
}

export function removeInvisibleChars(str: string, trim = false): string {
    // 使用正则表达式匹配所有不可见字符并替换为空字符串
    if (trim) {
        return str.replace(/^[\s\u200B-\u200D\uFEFF]+|[\s\u200B-\u200D\uFEFF]+$/g, '');
    } else {
        return str.replace(/[\u200B-\u200D\uFEFF]/g, '');
    }
}

export function cleanText(text: string): string {
    return text ? text.split('\u200B').join('').split('\u200D').join('').trim() : "";
}

export function removeSiyuanLnks(c: string) {
    return c.replaceAll(/siyuan:\/\/blocks\/.{22}(\?focus=1)?/g, "")
}

export function removeAllLnks(markdown: string) {
    // markdown = markdown.replace(/(http)|(https)|(siyuan):\/\/(.*?) /, "$4");
    markdown = markdown.replace(/\[(.*?)\]\(.*?\)/, "$1");
    markdown = markdown.replace(/\(\((.*?) ('|")(.*?)('|")\)\)/, "$3");
    return markdown;
}

export function remove_1StarLnks(markdown: string) {
    markdown = markdown.replace(/\[\*]\(siyuan:\/\/blocks\/.{22}.*?\)/g, "");
    return markdown;
}

export function siyuanLnk2text(markdown: string) {
    markdown = markdown.replace(/\[.*?\]\(.*?\)/g, "$1");
    return markdown;
}

export function get_siyuan_lnk_md(id: string, text: string, empty = false, title = "") {
    if (empty || !id || !text) return ""
    if (title) {
        return `[${text}](siyuan://blocks/${id}?focus=1 "${title}")`;
    }
    return `[${text}](siyuan://blocks/${id}?focus=1)`;
}

export function replaceRef2Lnk(md: string) {
    if (!md) return;
    const RefRegex = getRefRegexp();
    const matches = Array.from(md.matchAll(RefRegex));
    for (const match of matches) {
        const id = match[1];
        const txt = match[2];
        const lnk = get_siyuan_lnk_md(id, txt.slice(1, -1));
        md = md.replace(match[0], lnk);
    }
    return md;
}

export function newIDRegexp() {
    return new RegExp(/[0-9]{14}-[0-9a-z]{7}/g);
}

export function extractIDs(txt: string) {
    // 20240607225626-o9dqy2r
    const RefRegex = newIDRegexp();
    const matches = txt.matchAll(RefRegex);
    const set = new Set<string>();
    for (const m of matches) {
        if (m[0]) set.add(m[0])
    }
    return set;
}

export function getRefRegexp() {
    // [1] for id, [2] for text
    return new RegExp(/\(\(([0-9]{14}-[0-9a-z]{7}) (("[^"]*?")|('[^']*?'))\)\)/g);
}

export function getRefRegexpSingleQuote() {
    // [1] for id, [2] for text
    return new RegExp(/\(\(([0-9]{14}-[0-9a-z]{7}) '([^']*?)'\)\)/g);
}

export function getRefRegexpDoubleQuote() {
    // [1] for id, [2] for text
    return new RegExp(/\(\(([0-9]{14}-[0-9a-z]{7}) "([^"]*?)"\)\)/g);
}

export function extractRefsUniq(txt: string, set?: Set<string>, excludedIDs?: string[], excludedTexts?: string[]) {
    const ids: ReturnType<typeof extractRefs> = []
    if (!set) set = new Set();
    else set.clear();
    for (const id of extractRefs(txt, excludedIDs, excludedTexts)) {
        if (!set.has(id.id)) {
            set.add(id.id)
            ids.push(id);
        }
    }
    return ids;
}

export function extractRefs(txt: string, excludedIDs?: string[], excludedTexts?: string[]) {
    const RefRegex = getRefRegexp();
    return [...txt.matchAll(RefRegex)]
        .map(m => {
            return { id: m[1], text: m[2].slice(1, -1).trim() };
        })
        .filter(id => {
            let flag = true;
            if (excludedIDs) {
                flag &&= !excludedIDs.includes(id.id)
            }
            if (!flag) return false;

            if (excludedTexts) {
                flag &&= !excludedTexts.includes(id.text)
            }
            return flag;
        })
}

export function extractLinks(txt: string) {
    const RefRegex = getRefRegexp();
    const ids: string[] = [];//id
    const links: string[] = [];//whole
    const idLnks: { id: string, txt: string }[] = [];//id, text
    const matches = txt.matchAll(RefRegex);
    for (const match of matches) {
        const id = match[1] ?? "";
        if (id) {
            ids.push(id);
            links.push(match[0]);
            idLnks.push({ id, txt: match[2].slice(1, -1) });
        }
    }
    return { ids, links, idLnks };
}

export function removeHtmlTags(htmlStr: string) {
    if (htmlStr.includes("&") || htmlStr.includes("<")) {
        const temp = document.createElement("div");
        temp.innerHTML = htmlStr;
        return temp.textContent || temp.innerText;
    }
    return htmlStr;
}

export function htmlEscape(str: string) {
    return str.replace(/&/g, "&amp;")  // 转义 &
        .replace(/</g, "&lt;")  // 转义 <
        .replace(/>/g, "&gt;")  // 转义 >
        .replace(/"/g, "&quot;")  // 转义 双引号
        .replace(/'/g, "&#039;"); // 转义 单引号
}

export function htmlUnescape(str: string) {
    return str.replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&#039;/g, "'");
}

export function ial2str(ial: AttrType): string {
    return "{: " + [...Object.entries(ial)].reduce((l, i) => {
        l.push(`${i[0]}="${i[1]}"`);
        return l;
    }, []).join(" ") + "}";
}

export function parseIAL(ial: string) {
    const obj = {} as AttrType;
    if (ial) {
        // const attrs = ial.matchAll(/([^\s]+)="([^\s]+)"/g);
        // for (const attr of attrs) obj[attr[1]] = attr[2];
        const attrs = parseCustomTag(ial)
        return attrs;
    }
    return obj;
}

export function attrNewLine() {
    return `{: id="${NewNodeID()}"}`;
}

export function getMd5(str: string) {
    if (str == null) str = "";
    const md5 = new Md5();
    md5.appendStr(str);
    return md5.end().toString();
}

export function toJSON(obj: any, maxDepth = 10, currentDepth = 0, seen = new Set()) {
    if (seen.has(obj)) {
        return '[Circular]';
    }
    seen.add(obj);
    if (currentDepth >= maxDepth) {
        return '[MaxDepthReached]';
    }
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => toJSON(item, maxDepth, currentDepth + 1, seen));
    }
    const result = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = toJSON(obj[key], maxDepth, currentDepth + 1, seen);
        }
    }
    return result;
}

export function splitByMiddle(str: string): [string, string] {
    const middleIndex = Math.floor(str.length / 2);
    const part1 = str.substring(0, middleIndex);
    const part2 = str.substring(middleIndex);
    return [part1, part2];
}

export function keepContext(text: string, keyword: string, count: number): string {
    let parts = text.split(keyword);
    if (parts.length == 1) return text;
    {
        const newParts = [];
        newParts.push(parts[0]);
        for (let i = 1; i < parts.length - 1; i++) {
            newParts.push(...splitByMiddle(parts[i]));
        }
        newParts.push(parts[parts.length - 1]);
        parts = newParts;
    }

    for (let i = 0; i < parts.length; i++) {
        const len = parts[i].length;
        if (i % 2 == 0) {
            const start = Math.max(len - count, 0);
            if (start > 0) {
                parts[i] = ".." + parts[i].slice(start, len) + keyword;
            } else {
                parts[i] = parts[i].slice(start, len) + keyword;
            }
        } else {
            if (count < len) {
                parts[i] = parts[i].slice(0, count) + "..";
            } else {
                parts[i] = parts[i].slice(0, count);
            }
        }
    }
    return parts.join("");
}

export function doubleSupRows(text: string, attrStr = "") {
    if (attrStr) attrStr = "\n" + attrStr;
    return `{{{row\n{{{row\n${text}\n}}}\n}}}${attrStr}`;
}

/** SQLite 字符串字面量包裹：单引号双写转义（SQL 标准）。用户配置串（落点文件名/
 *  自定义类型名）拼 SQL 必经此——裸拼含引号会炸语句，内核静默返 null 无从排查 */
export function sqlQuoteStr(s: string): string {
    return `'${s.replaceAll("'", "''")}'`;
}

export function getLastNumberFromString(str: string): number | null {
    // 匹配字符串末尾的一个或多个数字
    const match = str.match(/\d+$/);
    if (match) {
        // 将匹配到的数字字符串转换为数字
        return parseInt(match[0], 10);
    }
    // 没有找到数字
    return null;
}

const ILLEGAL_CHARS_REGEX = /[\x00\/\\:*?"<>|]/g;  // \x00 代表空字符 [5](@ref)[4](@ref)

export function sanitizePathSegment(segment: string): string {
    // 保留 Windows 驱动器标识（如 C:）
    // if (segment.length === 2 && segment[1] === ':') {
    //     return segment;
    // }
    return segment.replace(ILLEGAL_CHARS_REGEX, '_'); // 替换为下划线
}

export function styleColor(bgcolor: string, color: string) {
    return `<style>button{display: inline-block; padding: 10px 20px; background-color: ${bgcolor}; color: ${color}; text-align: center; text-decoration: none; font-size: 16px; border: none; border-radius: 4px; cursor: pointer;}button.large { padding: 12px 24px; font-size: 24px; }button.small { padding: 8px 16px; font-size: 14px; }</style>`;
}

export function convertMinutesToTimeFormat(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours == 0) {
        return `${remainingMinutes}m`;
    }
    return `${hours}h${remainingMinutes}m`;
}

/** 块 id/created 时间戳（YYYYMMDDHHmmss）→ 毫秒；非 14 位数字返回 NaN */
export function parseIDTimestamp(s: string): number {
    if (!/^\d{14}$/.test(s ?? "")) return NaN;
    const d = new Date(
        s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6, 8) +
        "T" + s.slice(8, 10) + ":" + s.slice(10, 12) + ":" + s.slice(12, 14));
    return d.getTime();
}

/** 相邻收集块间隔分钟数（ceil）：created 全时间戳优先（跨天正确——搬运块与当天块
 *  相隔真实小时数），缺/畸形任一侧退回 "2020-01-01 "+HH:MM 平面（老语义：同分钟
 *  早退）。返回 null=相等早退，调用方不写属性。 */
export function intervalMinutesBetween(a: { created?: string; time: string }, b: { created?: string; time: string }): number | null {
    const at = parseIDTimestamp(a.created ?? "");
    const bt = parseIDTimestamp(b.created ?? "");
    let atime: number, btime: number;
    if (!isNaN(at) && !isNaN(bt)) {
        if (at == bt) return null;
        atime = at;
        btime = bt;
    } else {
        if (a.time == b.time) return null;
        atime = (new Date("2020-01-01 " + a.time)).getTime();
        btime = (new Date("2020-01-01 " + b.time)).getTime();
    }
    return Math.ceil(Math.abs(atime - btime) / (1000 * 60));
}

// ── 速记间隔归属（need-0926-18）──────────────────────────────────────────────
// 「间隔计算模式」两档（对齐用户参照插件的「时间计算模式」）：
//   start=开始模式（默认=存量语义）：间隔算「本条到下一条」、写在较早条身上；
//   end=结束模式：间隔算「上一条到当前」、写在较晚条身上。
// 存量属性不迁移；模式只决定「归属写入位置」，间隔分钟数与先后判定逻辑零改动。
export type IdeaIntervalMode = "start" | "end";

/** 模式值收拢（存量/手改坏值退回默认 start；strUtils 落点=calcTimeInterval 单测同文件域） */
export function coerceIdeaIntervalMode(v: unknown): IdeaIntervalMode {
    return v === "end" ? "end" : "start";
}

/** 间隔归属条目形态（ID_Time 结构子集；interval=盘上现值，仅 calc diff 用，规划本身不读） */
export interface IdeaIntervalEntry {
    id: string;
    time: string;
    created?: string;
}

/** a 是否早于 b——**红线：照搬 NoteBox.updateTimeInterval 原比较逻辑（created 全时间戳
 *  优先，跨天搬运块正确性依赖它；缺/畸形任一侧退回 "2020-01-01 "+HH:MM 平面），只搬不改** */
export function isEarlierIdea(a: IdeaIntervalEntry, b: IdeaIntervalEntry): boolean {
    const at = parseIDTimestamp(a.created ?? "");
    const bt = parseIDTimestamp(b.created ?? "");
    return (!isNaN(at) && !isNaN(bt))
        ? at < bt
        : (new Date("2020-01-01 " + a.time)).getTime() < (new Date("2020-01-01 " + b.time)).getTime();
}

/** 间隔归属规划（need-0926-18 纯函数，单测覆盖）：输入按文档序排好的速记条，输出
 *  「每条应有的间隔值」map——在 map 里=应写该值，不在 map 里=应清除（模式切换后旧
 *  位置的残留靠全量 diff 清掉，空串清值由 cssStyle :not([=""]) 兜底零渲染）。
 *  start=写在较早条（升序文档序下=最新一条恒无间隔，存量语义）；end=写在较晚条
 *  （=最早一条无间隔，「距上一条」直觉语义）。相邻对时间相等=早退不写维持原值
 *  （intervalMinutesBetween null 语义原样）。 */
export function planIdeaIntervals(times: IdeaIntervalEntry[], mode: IdeaIntervalMode): Map<string, string> {
    const desired = new Map<string, string>();
    for (let i = 1; i < times.length; i++) {
        const a = times[i - 1], b = times[i];
        const minutes = intervalMinutesBetween(a, b);
        if (minutes == null) continue;
        const interval = convertMinutesToTimeFormat(minutes);
        const aEarlier = isEarlierIdea(a, b);
        // start=较早者身上（现状 aEarlier 分支）；end=较晚者身上
        const target = (mode === "start") === aEarlier ? a : b;
        desired.set(target.id, interval);
    }
    return desired;
}

/** need-0928-01：存量不计时摘除规划（纯函数，单测覆盖）——calcTimeInterval 拉链时对
 *  挂 custom-tomato-idea-time 且类型标记（idea-type/alias 属性值）命中不计时声明名单
 *  的存量块摘 time+interval（陆杰飞书 om_x100b64940882dcacb2631b2f714bb32：喝水类高频
 *  分类记录隔断真正要统计间隔的时间记录链；摘后分类标记保留=可统计次数）。
 *  入参：ids=拉链候选（挂 idea-time 的块）、attrOf=各块类型标记查表（调用方从
 *  attributes 表快照构造）、notTimedNames=设置串声明的不计时显示名集
 *  （parseNoteKindDecls 预展开，kindNotTimedDeclared 的批量版）。返回=命中摘除 id 列表
 *  （调用方从拉链剔除+盘上摘两键，摘属性前 getBlockAttrs IAL 直读复核——读写竞态
 *  家族纪律）。引用型存量块（分类标记=引用锚非属性）天然不命中；类型标记在但不在
 *  名单=正常计时不动；值空白不算（trim 口径对齐属性读取链） */
export function planNotTimedStrips(
    ids: string[],
    attrOf: (id: string) => { ideaType?: string; alias?: string },
    notTimedNames: Set<string>,
): string[] {
    const hit = (v?: string) => {
        const t = (v ?? "").trim();
        return !!t && notTimedNames.has(t);
    };
    return ids.filter(id => {
        const { ideaType, alias } = attrOf(id);
        return hit(ideaType) || hit(alias);
    });
}

export class TabBuilder {
    private md: string[];
    private colSize: number;
    private haveHead = false;
    private docName: string;
    constructor(docName: string, colSize = 4) {
        if (!colSize || colSize < 2) colSize = 2;
        this.colSize = colSize;
        this.md = [];
        this.docName = docName.replaceAll(/[\s\|]/g, "");
    }
    addRows(...heads: string[]) {
        for (const row of chunks(heads, this.colSize)) {
            if (row.length < this.colSize) {
                const l = row.length;
                for (let i = 0; i < this.colSize - l; i++) {
                    row.push("");
                }
            }
            if (!this.haveHead) {
                this.haveHead = true;
                this.md.push(`|${row.map((_v, idx, arr) => {
                    if (idx == 0) return `{: colspan="${arr.length}" rowspan="1"}《${this.docName}》`;
                    return '{: class="fn__none"}';
                }).join("|")}|`);
                this.md.push(`|${row.map(() => ":---:").join("|")}|`);
            }
            this.md.push(`|${row.join("|")}|`);
        }
    }
    build() {
        return this.md.join("\n");
    }
}

// 导入MD/文本的换行翻倍（□5）：逐行成块（txt 日志语义）只作用围栏外——代码块内 \n
// 翻倍会击穿原始内容。``` 切分后奇数段=围栏内（配对前提；未配对围栏按奇偶兜底，
// 与主流渲染器口径一致）。exportFiles.doImportMD 用。
export function doubleLnOutsideFences(md: string): string {
    return md.split("```")
        .map((part, i) => i % 2 == 1 ? part : part.replaceAll("\n", "\n\n"))
        .join("```");
}
