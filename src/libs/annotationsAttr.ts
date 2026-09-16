// 批注属性模型纯函数层（□2）：custom-tomato-annotations 属性串 ↔ 条目数组的全部语义。
// 零 UI/零思源 API 依赖，可被渐进侧跨插件导入（queryBookComments 判「选区=条目有 sel」）。
// 契约要点（tests/unit/annotationsAttr.test.ts 锁定）：
// - 属性串是外部边界（内核 IAL/用户手改可改键序塞脏数据），parse 容错净化，未知字段前向兼容保留
// - 软限 2000 字是信号不是拦截：存取照常，isOverLimit/oversizedIds 供 UI 层 toast
// - serialize([]) === ""：删空即清属性键，不留 "[]" 空壳
// - append 同 id 幂等（跨块场景=多块各挂同 id，各块属性串独立）；update/remove 未命中返回原串
// - 写入侧设防：非法条目/脏 patch 直接 throw（编程错误应炸不应静默产出 parse 即丢的坏串）
// - patch.color 为 null = 删键（□4「恢复默认色」入口）；text/time 必填无删除语义不许 null
import { newID } from "stonev5-utils";

export const ANNOTATIONS_ATTR = "custom-tomato-annotations";
export const ANNO_HREF_PREFIX = "#tomato-anno-";
export const ANNO_TEXT_SOFT_LIMIT = 2000;
/** □9 评论式追加软限（信号不拦截，对齐主文 2000 软限哲学）：单条 500 字 + 每批注 20 条 */
export const ANNO_REPLY_TEXT_SOFT_LIMIT = 500;
export const ANNO_REPLY_MAX_COUNT = 20;

/** □9 追加条目：思考路径时间线的一格（主 text=首条正文语义、主 time 不被追加刷新） */
export interface AnnoReply {
    text: string;
    time: number;
}

export interface TomatoAnnotation {
    id: string;
    /** 批注正文（kramdown，草稿块剥壳产物） */
    text: string;
    /** 最后修改时间（ms）：创建时=创建时刻，编辑保存链显式传新值刷新；
     *  update 不隐式刷新，要刷显式传 patch.time；追加（appendReply）不刷新 */
    time: number;
    /** 选区批注才有：被标记的原文快照，仅面板预览辅助 */
    sel?: { txt: string };
    color?: string;
    /** □9 评论式追加时间线（无=旧形态照跑；sanitize 保证要么缺省要么非空净化数组） */
    replies?: AnnoReply[];
}

export type AnnotationPatch = { text?: string; color?: string | null; time?: number };

export function makeAnnotation(input: { text: string; sel?: { txt: string }; color?: string; id?: string }): TomatoAnnotation {
    // 可选 id 透传（□2 创建弹窗统一 AnnoEdit）：预生成 id 让「创建期 AI 对话缓存 key」与落库条目同源，
    // 保存后重开编辑对话可续；空串视为缺省自造
    const e: TomatoAnnotation = { id: input.id || newID(), text: input.text, time: Date.now() };
    if (input.sel != null) e.sel = { ...input.sel };
    if (input.color != null) e.color = input.color;
    const clean = sanitize(e);
    if (clean == null) throw new Error("makeAnnotation: 非法输入（text 必须是字符串）");
    return clean;
}

/** 净化单条：缺 id/text 视为坏条目（返回 null）；time 缺失宽容为 0；sel/color 非法丢弃 */
function sanitize(raw: unknown): TomatoAnnotation | null {
    if (typeof raw !== "object" || raw == null) return null;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== "string" || r.id.length === 0) return null;
    if (typeof r.text !== "string") return null;
    const e = { ...r } as Record<string, unknown> & TomatoAnnotation;
    e.time = typeof r.time === "number" && Number.isFinite(r.time) ? r.time : 0;
    if (r.sel != null && typeof r.sel === "object" && typeof (r.sel as { txt?: unknown }).txt === "string") {
        e.sel = { ...(r.sel as { txt: string }) };
    } else {
        delete e.sel;
    }
    if (typeof r.color !== "string") delete e.color;
    // □9 replies 逐条净化：text 非 string/空串丢条、time 宽容 0；清空删键（不留 "[]" 壳）
    if (Array.isArray(r.replies)) {
        const rs: AnnoReply[] = [];
        for (const item of r.replies) {
            if (typeof item !== "object" || item == null) continue;
            const it = item as Record<string, unknown>;
            if (typeof it.text !== "string" || it.text.length === 0) continue;
            rs.push({ text: it.text, time: typeof it.time === "number" && Number.isFinite(it.time) ? it.time : 0 });
        }
        if (rs.length > 0) e.replies = rs;
        else delete e.replies;
    } else {
        delete e.replies;
    }
    return e;
}

export function parseAnnotations(attr: string | null | undefined): TomatoAnnotation[] {
    if (attr == null || attr === "") return [];
    let parsed: unknown;
    try {
        parsed = JSON.parse(attr);
    } catch {
        return [];
    }
    if (!Array.isArray(parsed)) return [];
    const list: TomatoAnnotation[] = [];
    for (const raw of parsed) {
        const e = sanitize(raw);
        if (e != null) list.push(e);
    }
    return list;
}

/** 不设防出口：入参条目应经 makeAnnotation/appendAnnotation 产出（已过写入校验）；
 * 渐进侧若手构条目批量走此函数，需自行保证 id/text/time 字段类型 */
export function serializeAnnotations(list: TomatoAnnotation[]): string {
    if (list.length === 0) return "";
    return JSON.stringify(list);
}

/** 追加条目（跨块=多块各挂同 id，各块属性串独立调用）；同 id 已存在幂等返回原串，防 UI 双击重复挂 */
export function appendAnnotation(attr: string | null | undefined, entry: TomatoAnnotation): string {
    const clean = sanitize(entry);
    if (clean == null) throw new Error(`appendAnnotation: 非法条目（id/text 必填且为字符串）: ${JSON.stringify(entry)}`);
    const list = parseAnnotations(attr);
    if (list.some((e) => e.id === clean.id)) return attr ?? "";
    list.push(clean);
    return serializeAnnotations(list);
}

export function updateAnnotation(attr: string | null | undefined, id: string, patch: AnnotationPatch): string {
    if (patch.text !== undefined && typeof patch.text !== "string") throw new Error("updateAnnotation: patch.text 必须是 string");
    if (patch.time !== undefined && (typeof patch.time !== "number" || !Number.isFinite(patch.time))) throw new Error("updateAnnotation: patch.time 必须是有限数字");
    if (patch.color !== undefined && patch.color !== null && typeof patch.color !== "string") throw new Error("updateAnnotation: patch.color 必须是 string 或 null");
    const hasChange = patch.text !== undefined || patch.color !== undefined || patch.time !== undefined;
    if (!hasChange) return attr ?? "";
    let hit = false;
    const next = parseAnnotations(attr).map((e) => {
        if (e.id !== id) return e;
        hit = true;
        const c = { ...e };
        if (patch.text !== undefined) c.text = patch.text;
        if (patch.color === null) delete c.color;
        else if (patch.color !== undefined) c.color = patch.color;
        if (patch.time !== undefined) c.time = patch.time;
        return c;
    });
    if (!hit) return attr ?? "";
    return serializeAnnotations(next);
}

export function removeAnnotation(attr: string | null | undefined, id: string): string {
    const list = parseAnnotations(attr);
    const next = list.filter((e) => e.id !== id);
    if (next.length === list.length) return attr ?? "";
    return serializeAnnotations(next);
}

/** □9 评论式追加：目标批注 replies 尾加一条（不动主 text/主 time——按日期归档搬家依据不被
 *  追加刷新）；条目未命中返回原串（update 同语义）；reply.text 非法直接 throw（写入侧设防）。
 *  浅拷贝条目+新数组：防跨条目共享 replies 引用被后续序列化互相污染 */
export function appendReply(attr: string | null | undefined, id: string, reply: AnnoReply): string {
    if (typeof reply.text !== "string") throw new Error("appendReply: reply.text 必须是 string");
    let hit = false;
    const next = parseAnnotations(attr).map((e) => {
        if (e.id !== id) return e;
        hit = true;
        return { ...e, replies: [...(e.replies ?? []), { text: reply.text, time: reply.time }] };
    });
    if (!hit) return attr ?? "";
    return serializeAnnotations(next);
}

export function findAnnotation(attr: string | null | undefined, id: string): TomatoAnnotation | undefined {
    return parseAnnotations(attr).find((e) => e.id === id);
}

function overCodepoints(text: string, limit: number): boolean {
    // 按码点计数：emoji/CJK 扩展 B 是代理对，UTF-16 length 双计会误报
    return [...text].length > limit;
}

export function isOverLimit(text: string): boolean {
    return overCodepoints(text, ANNO_TEXT_SOFT_LIMIT);
}

/** □9 单条追加软限（信号不拦截，UI 层 toast 用） */
export function isReplyOverLimit(text: string): boolean {
    return overCodepoints(text, ANNO_REPLY_TEXT_SOFT_LIMIT);
}

export function oversizedIds(list: TomatoAnnotation[]): string[] {
    return list.filter((e) => isOverLimit(e.text)).map((e) => e.id);
}

export const ANNO_SEL_CLIP = 200;

/** sel 原文快照截断（跨大选区防属性按块数膨胀，□3 reasoning P1-3）：按码点截 200 + 省略号 */
export function clipAnnoSelText(txt: string): string {
    const cps = [...txt];
    return cps.length <= ANNO_SEL_CLIP ? txt : cps.slice(0, ANNO_SEL_CLIP).join("") + "…";
}

const HREF_RE = new RegExp(`(?:^|[\\s<])(?:data-)?href="${ANNO_HREF_PREFIX}([^"]+)"`, "g");

/** 从块 HTML 提取锚点标记 id（DOM 形态 data-href、导出形态 a href 双兼容），保序去重 */
export function annoHrefIds(html: string): string[] {
    const ids: string[] = [];
    for (const m of html.matchAll(HREF_RE)) {
        if (!ids.includes(m[1])) ids.push(m[1]);
    }
    return ids;
}

/** 孤儿 = 块内有标记但属性无对应条目（渲染层退化为原生子样式）；反向（属性有标记无）不在此处理 */
export function orphanAnnoIds(html: string, attr: string | null | undefined): string[] {
    const have = new Set(parseAnnotations(attr).map((e) => e.id));
    return annoHrefIds(html).filter((id) => !have.has(id));
}
