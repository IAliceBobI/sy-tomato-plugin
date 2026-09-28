// 速记器 quicknote 纯函数核心（quicknote 战役 □1 2026-09-07）。
// 窗口管理/IPC 接线在 src/QuickNote.ts；本文件只放可单测的纯逻辑。

/** 固定默认类型：拍照闪念七类之一「想法」——速记不选类时的兜底，落块与面板收集块完全同构 */
export const QN_ICON = "💡";

/** need-0926-10：纯文本内置类型标识（陆杰 09-26 拍板方案 A：保留属性仅免显示）。
 *  值=固定中文「纯文本」，对齐「闪念」属性值口径（数据面不随 UI 语言漂移）；UI 显示层
 *  走 i18n（tomatoI18n.纯文本，zh/en/cht/ja 齐全——批注域既有键复用）；落块语义=不建引用
 *  不落 alias 的裸内容块，类型可追溯靠 custom-tomato-idea-type=本值（need-15 派生链
 *  第二还原键，近期列表/统计/搬运归位照进照认）。消费面：flashBlockForm（分流+产物）、
 *  NoteBox/cssStyle/quicknote.html（页面侧判等用同值字面量，静态页无模块系统） */
export const PLAIN_KIND = "纯文本";

/** 小窗 ↔ 主窗唯一 IPC 频道（BroadcastChannel；插件侧 on 同名） */
export const QN_CHANNEL = "quicknote";

/** 小窗 → 插件 的合法消息形态（□4 窗口统一化扩协议：hello/openDaily/sync/icon/keep/submit 带类型；
 *  qn-actions □2 扩 opacity 透明度档位）。
 *  close 带可选 at=blur 因果时刻（迟到守卫见 qnCloseStale） */
export type QnMsg =
    | { type: "hello" }
    | { type: "close"; at?: number }
    | { type: "openDaily" }
    | { type: "sync" }
    | { type: "opacity"; v: number }
    | { type: "icon"; icon: string }
    | { type: "keep"; keep: boolean }
    | { type: "submit"; text: string; icon?: string; keep?: boolean };

/** IPC 消息解析与防御：文本/图标 trim、空值拒绝、可选字段非法即剔除；非法负载一律 null（调用方静默丢弃） */
export function qnParseMsg(data: unknown): QnMsg | null {
    if (typeof data !== "object" || data == null) return null;
    const { type } = data as Record<string, unknown>;
    if (type === "close") {
        const { at } = data as Record<string, unknown>;
        return typeof at === "number" ? { type: "close", at } : { type: "close" };
    }
    if (type === "hello") return { type: "hello" };
    if (type === "openDaily") return { type: "openDaily" };
    if (type === "sync") return { type: "sync" };
    if (type === "opacity") {
        const { v } = data as Record<string, unknown>;
        // 档位循环钮的合法域：有限数且 (0,1]（≤0 全透明不可用，>1 无意义）
        if (typeof v !== "number" || !Number.isFinite(v) || v <= 0 || v > 1) return null;
        return { type: "opacity", v };
    }
    if (type === "icon") {
        const { icon } = data as Record<string, unknown>;
        if (typeof icon !== "string") return null;
        const i = icon.trim();
        if (!i) return null;
        return { type: "icon", icon: i };
    }
    if (type === "keep") {
        const { keep } = data as Record<string, unknown>;
        if (typeof keep !== "boolean") return null;
        return { type: "keep", keep };
    }
    if (type !== "submit") return null;
    const { text, icon, keep } = data as Record<string, unknown>;
    if (typeof text !== "string") return null;
    const t = text.trim();
    if (!t) return null;
    const msg: QnMsg = { type: "submit", text: t };
    if (typeof icon === "string" && icon.trim()) (msg as any).icon = icon.trim();
    if (typeof keep === "boolean") (msg as any).keep = keep;
    return msg;
}

/** 自定义图标串 → 类型数组（与 NoteBox 面板 NoteTypes 同规则：全角归半角/trim/去空/空兜底 💡） */
export function parseNoteKinds(kinds: string): string[] {
    const arr = (kinds ?? "")
        .replaceAll("，", ",")
        .split(",")
        .map((i) => i.trim())
        .filter((i) => !!i);
    return arr.length > 0 ? arr : ["💡"];
}

/** need-0926-13：自定义图标「别名型」声明后缀——词尾带此后缀（如「锻炼@别名」）=别名型
 *  图标：不建引用文档（陆杰 09-26 17:01 拍板——文字型正文开头留「别名名称：内容」前缀、
 *  名称按设置字数完整展示不截断；emoji 型维持正文零标记）。语法取向（后缀 vs 全局默认+
 *  例外表）拍板=后缀：noteBoxAllKinds 唯一类型源不新增设置项+逐词声明精确；存量无声明
 *  词默认引用型=零迁移。后缀字面量「别名」固定中文不 i18n（数据面语法标记，对齐
 *  PLAIN_KIND「纯文本」口径） */
export const KIND_ALIAS_SUFFIX = "@别名";

/** need-0928-01：自定义图标「不计时」声明后缀——词尾再叠一个 @（如「学习@」/
 *  「喝水@别名@」）=该类不落时间记录属性（custom-tomato-idea-time 源头不写，间隔
 *  统计 calcTimeInterval 的拉链键缺失=不隔断相邻时间记录的间隔；alias/idea-type/
 *  引用锚/lifelog 分类标记全保留，可统计次数）。陆杰飞书反馈
 *  om_x100b64940882dcacb2631b2f714bb32：喝水类高频分类记录把真正要统计间隔的
 *  时间记录链隔断。尾 @ 是通用
 *  后缀（与 @别名 正交组合，三形态全支持：引用型/别名型/内置 emoji 加尾 @）；双 @
 *  （「喝水@别名@」）不撞现有语法（endsWith("@别名") 对其为 false），存量零迁移；
 *  字面量「@」固定不 i18n（数据面语法标记，对齐 KIND_ALIAS_SUFFIX 口径） */
export const KIND_NOT_TIMED_SUFFIX = "@";

/** need-0926-13：词级声明结构（icon=剥后缀显示名，chips 显示与落块分流同名源）；
 *  need-0928-01 增 notTimed（尾 @ 不计时声明，与 aliasDeclared 独立并存） */
export interface NoteKindDecl {
    icon: string;
    aliasDeclared: boolean;
    notTimed: boolean;
}

/** 词 → 声明结构（先剥尾 @ 不计时再剥「@别名」别名声明——「喝水@别名@」双后缀两级
 *  全剥；尾 @ 必须最末（病态形态「喝水@@别名」以「名」结尾不剥尾 @，别名后缀照剥）；
 *  前后空白 trim 防御） */
export function parseKindDecl(kind: string): NoteKindDecl {
    const k = (kind ?? "").trim();
    const notTimed = k.endsWith(KIND_NOT_TIMED_SUFFIX);
    const afterNotTimed = notTimed ? k.slice(0, -KIND_NOT_TIMED_SUFFIX.length).trim() : k;
    const aliasDeclared = afterNotTimed.endsWith(KIND_ALIAS_SUFFIX);
    return {
        icon: aliasDeclared ? afterNotTimed.slice(0, -KIND_ALIAS_SUFFIX.length).trim() : afterNotTimed,
        aliasDeclared,
        notTimed,
    };
}

/** 设置串 → 声明数组（parseNoteKinds 同规则切词再剥后缀；剥后缀空词丢弃——纯「@别名」
 *  /纯「@」残词无显示名不进 chips；空串兜底 💡 语义透传 parseNoteKinds） */
export function parseNoteKindDecls(kinds: string): NoteKindDecl[] {
    return parseNoteKinds(kinds)
        .map(parseKindDecl)
        .filter(d => !!d.icon);
}

/** need-0926-13：显示名反查声明（落块分流用——chips 选中态存剥后缀显示名，声明信息只在
 *  设置串，落块时反查）。匹配=任一剥后缀同名词声明即别名（「锻炼」与「锻炼@别名」并存
 *  =配置冗余，宽容取别名侧）；空名/空串恒 false */
export function kindAliasDeclared(icon: string, kinds: string): boolean {
    const target = (icon ?? "").trim();
    if (!target) return false;
    return parseNoteKindDecls(kinds).some(d => d.icon === target && d.aliasDeclared);
}

/** need-0928-01：显示名反查不计时声明（kindAliasDeclared 同款机制——chips 选中态存
 *  剥后缀显示名，声明信息只在设置串，落块时反查）。匹配=任一剥后缀同名词声明即不
 *  计时（「喝水」与「喝水@」并存=配置冗余，宽容取声明侧）；与别名声明独立并存互
 *  不影响；空名/空串恒 false。calcTimeInterval 存量摘侧批量场景用 parseNoteKindDecls
 *  预展开成 Set 提性能（见 strUtils.planNotTimedStrips） */
export function kindNotTimedDeclared(icon: string, kinds: string): boolean {
    const target = (icon ?? "").trim();
    if (!target) return false;
    return parseNoteKindDecls(kinds).some(d => d.icon === target && d.notTimed);
}

/** need-0926-10：chips 数据源（面板/小窗共用）+need-0926-13 声明后缀剥除：显示名=剥
 *  「@别名」后的词（选中态与落块分流同名源）+剥后缀同名去重（「锻炼」与「锻炼@别名」
 *  并存防 chips 重复项）+ 恒附加纯文本内置类型（尾项；已含则不重复）。need-0928-01 起
 *  尾 @ 不计时后缀同剥（parseKindDecl 两级全剥，显示名不含任何声明后缀；「喝水@别名@」
 *  显示名=「喝水」与「喝水」声明词去重合一）。纯文本是内置 UI
 *  类型不进 noteBoxAllKinds 设置串（用户自定义串零迁移）；shorthandRelay 首字符分类命中
 *  用裸 parseNoteKinds（后缀在词尾不影响首码点匹配；纯文本非文本分类不参与命中——两侧
 *  口径由此分流，防「纯」字正文误挂引用锚） */
export function chipsKinds(kinds: string): string[] {
    const uniq = [...new Set(parseNoteKindDecls(kinds).map(d => d.icon))];
    const base = uniq.length > 0 ? uniq : ["💡"];
    return base.includes(PLAIN_KIND) ? base : [...base, PLAIN_KIND];
}

/** 迟到 close 判定：toggle 收起（win.hide）触发页面 blur，200ms 防抖的 close 在 hidden
 *  页面被 Chromium 节流，可在下一次热键 show 之后才到达——无条件执行会把刚唤起的窗
 *  收掉（用户实测「第三次 ⌥J 闪现」）。close 带因果时刻 at（blur 发生时刻，非发出
 *  时刻），at ≤ 最近一次 show 时刻 ⇒ 过期丢弃。无 at（旧版页面）不丢弃，向后兼容 */
export function qnCloseStale(at: number | undefined, lastShowAt: number): boolean {
    return typeof at === "number" && at <= lastShowAt;
}

/** 窗口定位：鼠标屏 workArea 水平居中 + 垂直上 1/3 中线；窗口大于屏时收到屏内不越原点 */
export function qnWindowRect(
    workArea: { x: number; y: number; width: number; height: number },
    width: number,
    height: number,
): { x: number; y: number; width: number; height: number } {
    const w = Math.min(width, workArea.width);
    const h = Math.min(height, workArea.height);
    return {
        width: w,
        height: h,
        x: workArea.x + Math.max(0, Math.round((workArea.width - w) / 2)),
        y: workArea.y + Math.max(0, Math.round(workArea.height / 3 - h / 2)),
    };
}

/** 记忆 bounds × 当前全部屏 workArea 求交：任一屏有交集（含部分压边）=记忆仍有效原样
 *  返回（原地原样弹出，贴边摆位不强行拉回）；全部无交集（拔显示器/改分辨率）=null，
 *  调用方回落默认定位。窄条交集（如 width=0）不算命中 */
export function qnFitRect(
    saved: { x: number; y: number; width: number; height: number } | null | undefined,
    workAreas: { x: number; y: number; width: number; height: number }[],
): { x: number; y: number; width: number; height: number } | null {
    if (!saved || workAreas.length === 0) return null;
    const hit = workAreas.some((a) =>
        saved.x < a.x + a.width && saved.x + saved.width > a.x
        && saved.y < a.y + a.height && saved.y + saved.height > a.y);
    return hit ? saved : null;
}
