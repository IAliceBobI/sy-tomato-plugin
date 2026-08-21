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
