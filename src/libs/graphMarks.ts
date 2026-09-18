// src/libs/graphMarks.ts
// treemap 战役 □4（2026-09-17）：按文档拉「标记块集合」数据通道（块级图无行内粒度，
// 行内级标记目标挂所在块——设计共识）。只出数据不做 UI（□5 标记模式消费）。
//
// 识别口径（陆杰 20:14 拍板：行内划线 + 文字背景色 + 思源划线全收，含自定义颜色）：
// - SQL 宽锚 `background-color:` 任意值——色板 var(--b3-font-backgroundN) / card 系
//   var(--b3-card-*) / 自定义 #hex / rgb()，一网打尽（annoOverview 双锚只认色板变量，
//   自定义 hex 落无色分组的病灶本通道不犯）；裸 == mark 走第二锚。
// - 块级集合无法区分「字面 ==配对== 文本」与真 mark（markdown 列同形）——宽收是
//   设计选择：误收代价=标记模式面积多算一块，中文正文字面配对 == 罕见。
// - 形态证据：6810 标记验证D 落盘 + 主实例只读摸底（card/parent-style/嵌套），
//   fixture 见 tests/unit/graphMarks.test.ts 头部注释。
// 纯函数零 IO；fetchDocMarks 是唯一 IO 薄层（手工断言覆盖）。
// □5 起生产面已接线：GraphBox marks 档（ensureMarks SWR 旁路）+ 划线总览自定义色分组
// （normalizeBgVar 透传同口径——markVar 值域=色板键或 hex/rgb 字面值，消费过 markVarCss）。
import { siyuan } from "./siyuanApi";

/** 裸/带样式 mark 家族：两 `==` 间至少一个非 = 非换行非空白字符——Lute mark 语法
 *  `==` 与文字间不容空格，字符类排除 \s 整类杀掉「a == b and c == d」双比较运算
 *  误报（review P2-4）且不伤 CJK/单字符真 mark（`==无样式默认==`/`==x==` 照命中） */
const BARE_MARK_RE = /==[^=\n\s]+==/;

/** background-color 值提取：值止于 `"` `;` `}` `'`（IAL 引号/HTML 分号/防御边界） */
const BG_COLOR_RE = /background-color:\s*([^;"'}]+)/g;

/** 行内标记宽锚（SQL 用）：background-color 任意值 + 裸 == 家族 */
const MARKS_SQL_WHERE = `markdown like '%background-color:%' or markdown like '%==%'`;

export function marksSql(docIDs: string[]): string {
    const inList = docIDs.filter(Boolean).map(id => `'${id}'`).join(",");
    // 空域守卫：1=0 恒空（in () 空集形态送内核行为未定义，勿赌）
    if (!inList) return "select id, root_id as r, markdown as md from blocks where 1=0 limit 0";
    return `select id, root_id as r, markdown as md from blocks
        where root_id in (${inList}) and type != 'c' and (${MARKS_SQL_WHERE}) limit 50000`;
}

/** 是否含 mark 划线（裸或有样式 IAL 同形，块级不可分） */
export function hasBareMark(md: string): boolean {
    return BARE_MARK_RE.test(md);
}

/** 提取块内全部 background-color 值（保序去重）。供 □5 反哺划线总览自定义色分组
 *  （parseMarkColors 产物即分组键候选，色板 var 与自定义 hex 同通道） */
export function parseMarkColors(md: string): string[] {
    const out: string[] = [];
    for (const m of md.matchAll(BG_COLOR_RE)) {
        const v = m[1].trim();
        if (v && !out.includes(v)) out.push(v);
    }
    return out;
}

/** 块级标记判定：背景色宽锚或 mark 家族 */
export function isMarkBlock(md: string): boolean {
    return md.includes("background-color:") || hasBareMark(md);
}

export interface MarkInfo {
    /** 块内 background-color 值（保序去重） */
    colors: string[];
    /** 含 == mark 划线（vs 纯 span 背景色） */
    bare: boolean;
}

export type DocMarks = Map<string, MarkInfo>;

/** SQL 行集合 → 块集（防御：无 id / 无标记行滤除——SQL 已过滤，双保险） */
export function collectMarkRows(rows: Array<{ id?: string; md?: string }>): DocMarks {
    const m: DocMarks = new Map();
    for (const r of rows) {
        if (!r?.id || !r?.md) continue;
        const colors = parseMarkColors(r.md);
        const bare = hasBareMark(r.md);
        if (!colors.length && !bare) continue;
        m.set(r.id, { colors, bare });
    }
    return m;
}

/** 按文档拉标记块集合（IO 薄层）：treemap 标记模式 / 划线总览反哺共用 */
export async function fetchDocMarks(docID: string): Promise<DocMarks> {
    if (!docID) return new Map();
    const rows = (await siyuan.sql(marksSql([docID]))) ?? [];
    return collectMarkRows(rows as Array<{ id?: string; md?: string }>);
}
