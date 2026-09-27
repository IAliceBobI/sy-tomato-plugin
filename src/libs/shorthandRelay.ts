// □2 官方闪念速记吸收（dailynote-pipeline 战役 2026-09-06）：官方移动端速记（闪念速记）
// 经手机内核消费后落进笔记库中转文档（模式 B：ShorthandSavePath 日期模板=合并追加），
// 桌面端插件在 sync_end 把中转文档新块搬进日记管线（套 □1 收集块协议 v1）。
// 官方链路事实源：/opt/projects/siyuan/kernel/model/shortcuts.go（桌面内核不消费库外临时文件，
// 同步到桌面的已是笔记库文档 → 插件接力无竞争窗口）。
import { debugLog } from "./logUtils";
import { events } from "./Events";
import { collectBlockAttrs, lifelogAttrs, ymdFromCreated, LifeTag } from "./dailyCollect";
import { isEarlierIdea } from "./strUtils";
import { DomSuperBlockBuilder } from "./sydom";
import { coerceFlashBlockForm, kindChannel, prefixAliasBody, aliasRelayBody, relayBareEligible } from "./flashBlockForm";
import { parseNoteKinds, parseKindDecl } from "./quicknoteCore";
import { createRefDoc } from "./refDocUtils";
import { add_ref, dom2div, siyuan, sleep } from "./utils";
import { flash_thoughts_2_top, flashBlockForm, flashRelayByTime, flashStatTag, noteBoxAllKinds, shorthandRelayEnabled, shorthandRelayPathTpl, storeNoteBox_selectedNotebook } from "./stores";
import { tomatoI18n } from "../tomatoI18n";

/** 日记落点解析（NoteBox.getTargetID 注入——本模块不 import NoteBox：其 .svelte 依赖会
 *  炸 unit 测试链；同步签名 `(box) => Promise<docID | undefined>`） */
export type DailyTargetResolver = (box: string) => Promise<string>;

/** 块 created 时间戳（id 前 14 位）→ "HH:MM"；异常输入返回空串 */
export function hhmmFromCreated(created: string): string {
    if (!created || created.length < 12) return "";
    return `${created.slice(8, 10)}:${created.slice(10, 12)}`;
}

/** 顶层块按 id 前 14 位分条（内核 resetBlockIDsByTime 同条同刻铁证，getChildBlocks 无
 *  created 字段故取 id）；空内容块跳过（内核给搬空中转文档自动补占位空段，勿搬）；
 *  组间按刻升序复原输入序，组内保输入序；短 id 防御跳过 */
export function groupShorthandEntries(blocks: { id: string; content?: string }[]): { stamp: string; ids: string[] }[] {
    const byStamp = new Map<string, string[]>();
    for (const b of blocks) {
        const key = b.id?.slice(0, 14) ?? "";
        if (key.length < 14) continue;
        if (!b.content?.trim()) continue;
        const ids = byStamp.get(key);
        if (ids) ids.push(b.id);
        else byStamp.set(key, [b.id]);
    }
    return [...byStamp.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([stamp, ids]) => ({ stamp, ids }));
}

/** □3 落点 B：搬运条目的时间记录类型标记（落点 A 用面板所选类型；need-0926-17 起命中
 *  分类用命中词，未命中/无图标默认「速记」——bear 拍板口径） */
const RELAY_TAG_TYPE = "速记";

// ── need-0926-17 搬运分类增强：条目首图标 → noteBoxAllKinds 分类 ─────────────
// bear 口径：图标=条目首字符；命中分类复用面板同款锚机制（内置 8 emoji→alias 属性直写；
// 自定义词→createRefDoc+块首动态引用锚）+lifelog type=命中词；未命中/无图标默认「速记」
// （现状零改动）。noteBoxAllKinds 为唯一类型源（不新建图标映射设置）。

/** need-0926-17：条目内容首字符 → 命中分类词（纯函数，单测覆盖）。首字符=首个 Unicode
 *  码点（Array.from 语义——emoji 代理对取整个字形；变体选择符 🏞️ 的 VS16 形态差异免疫，
 *  比较两侧都取首码点）；命中判定=分类词首码点与条目首码点相同（emoji 单码点自然全等，
 *  多字自定义词「锻炼」以「锻」命中）；多词同首码点取 noteBoxAllKinds 配置序首个；
 *  空内容/未命中返回 undefined（调用方默认「速记」） */
export function relayEntryKind(content: string, kinds: string[]): string | undefined {
    const head = Array.from((content ?? "").trim());
    if (head.length === 0) return undefined;
    return kinds.find(k => {
        const cps = Array.from((k ?? "").trim());
        return cps.length > 0 && cps[0] === head[0];
    });
}

/** need-0926-13 搬运命中词分流产物：icon=剥「@别名」后缀显示名，action 三态 */
export interface RelayKindAction {
    icon: string;
    action: "aliasEmoji" | "aliasText" | "ref";
}

/** need-0926-13：搬运侧命中词 → 动作分流（纯函数，单测锚点）。入参=relayEntryKind 命中
 *  原始词（可能带「@别名」声明后缀，后缀在词尾不影响首码点命中）；undefined/剥后缀空词
 *  → undefined（调用方默认「速记」现状口径）。三态与面板 kindChannel 同源：内置 8 emoji
 *  或声明别名的自定义 emoji=aliasEmoji（alias 直写+正文零标记）/声明别名的文字词=
 *  aliasText（不建引用+正文「名称：」前缀，陆杰 09-26 拍板）/其余=ref（createRefDoc+
 *  块首引用锚现状，引用文档生态保留）。注：用户显式把「纯文本」写进设置串时 kindChannel
 *  返 plain，此处收 ref——need-17 现状即引用型处理，语义不变 */
export function relayKindAction(kind: string | undefined): RelayKindAction | undefined {
    if (!kind) return undefined;
    const d = parseKindDecl(kind);
    if (!d.icon) return undefined;
    const c = kindChannel(d.icon, d.aliasDeclared);
    return { icon: d.icon, action: c === "plain" ? "ref" : c };
}

// ── need-0926-11 搬运速记按记录时间归位 ─────────────────────────────────────
// bear 口径：①开关默认关（存量恒尾插/头插语义零改动）；②非速记块=透明穿越（找锚跳过
// 日记普通块继续找下一个速记块时间锚，不做「挡板」）；③无任何更晚时刻锚=尾插兜底；
// ④不重排存量日记（只插新块不动旧块）。

/** 归位锚扫描条目：日记顶层块（文档序）最小快照 */
export interface RelayAnchorBlock {
    id: string;
    /** custom-tomato-idea-time（HH:MM，剥 "⌛" 老格式后缀）；缺/空=非速记块（透明穿越） */
    ideaTime?: string;
    /** 块 created（id 前 14 位）——跨天搬运块=记录时刻，与 ideaTime 配对进红线比较 */
    created?: string;
}

/** 归位插入指令：head=插文档首（首个更晚块即文档首块/文档空）；after=插 anchorID 块后
 *  （anchorID=更晚块的前邻，可来自日记存量块或本批先插条目的尾块）——无更晚锚的尾插
 *  兜底=after 日记末块，同一形态 */
export type RelaySlot = { kind: "head" } | { kind: "after"; anchorID: string };

/** need-0926-11：归位规划（纯函数，单测覆盖）——逐条扫日记顶层块找「首个更晚时刻」
 *  速记块、插它前面；非速记块（无 idea-time）透明穿越；无更晚锚=落虚拟序末尾（尾插
 *  兜底）。同批多条天然收敛：每条定位在「含先插条目」的虚拟文档序上独立进行（先插条目
 *  即刻入序充当后续锚点，升序批与乱序批结果同收敛）。时刻先后=isEarlierIdea 红线
 *  （created 全时间戳优先——跨天搬运块正确性依赖；缺/畸形任一侧退 "2020-01-01 "+HH:MM
 *  平面）。tailID=该条插入物的末块 id（wrapped=预生成 sb 壳 id / bare=条末块 id / 队列
 *  块=块自身），供后续条目锚定引用。 */
export function planRelayTimeSlots(
    docBlocks: RelayAnchorBlock[],
    incoming: { created?: string; ideaTime: string; tailID: string }[],
): RelaySlot[] {
    const vdoc: RelayAnchorBlock[] = docBlocks.slice();
    const plans: RelaySlot[] = [];
    for (const inc of incoming) {
        let idx = vdoc.length;
        if (inc.ideaTime) { // 畸形条目（无时刻）不锚定=尾插兜底（"2020-01-01 "+"" 平面解析成 00:00 会误锚，勿走平面）
            for (let i = 0; i < vdoc.length; i++) {
                const b = vdoc[i];
                if (!b.ideaTime) continue; // 非速记块透明穿越（不做挡板）
                if (isEarlierIdea(
                    { id: "", time: inc.ideaTime, created: inc.created },
                    { id: "", time: b.ideaTime, created: b.created },
                )) {
                    idx = i; // 首个更晚时刻 → 插它前面
                    break;
                }
            }
        }
        plans.push(idx === 0 ? { kind: "head" } : { kind: "after", anchorID: vdoc[idx - 1].id });
        vdoc.splice(idx, 0, { id: inc.tailID, created: inc.created, ideaTime: inc.ideaTime });
    }
    return plans;
}

/** need-0926-11：日记顶层块归位锚扫描（shorthandRelay/NoteBox.moveFromQueue 两链共用）。
 *  文档序=getChildBlocks（真序唯此通道：blocks.sort=类型常量非兄弟序，在档）；idea-time
 *  走 attributes 表既有解析链（calcTimeInterval/dailyReview 同款；判向不碰 blocks.ial 列
 *  ——读写竞态家族红线），值剥 "⌛" 老格式后缀；created=id 前 14 位（GetChildBlocks 响应
 *  无 created 字段）。索引窗风险面与 calcTimeInterval 同等（前一批 bare 属性事务后 1~4s
 *  内的下一轮搬运可能漏读该块 → 透明穿越退位，位置偏差不损数据）。 */
export async function relayAnchorBlocks(dayID: string): Promise<RelayAnchorBlock[]> {
    const kids = await siyuan.getChildBlocks(dayID);
    const rows = await siyuan.sqlAttr(
        `select block_id,value from attributes where name="custom-tomato-idea-time" and root_id="${dayID}"`,
    );
    const timeOf = new Map((rows ?? []).map(r => [r.block_id, (r.value ?? "").split("⌛")[0]]));
    return (kids ?? []).map(k => ({
        id: k.id,
        created: k.id.slice(0, 14),
        ideaTime: timeOf.get(k.id) || undefined,
    }));
}

/** □3 落点 B：条目 → 时间记录标记入参（纯函数）。宿主=组内首个 type='p' 块（getChildBlocks
 *  的 type 为 SQL 短型 'p'，同 NoteBox firstParaBlock 判型）；content=条内全块内容空格
 *  join 后 trim；time/date 取记录时刻（stamp）——跨天搬运 date 须取记录日非搬运当天；
 *  组内无段落块（纯列表/代码条目）返回 undefined 不标记。need-0926-17：kind=命中分类词
 *  （relayEntryKind 产物），type 用命中词；缺省（未命中/无图标）默认「速记」（现状口径） */
export function relayEntryLifeTag(
    e: { stamp: string; ids: string[] },
    blocks: { id: string; type?: string; content?: string }[],
    kind?: string,
): { pID: string; tag: LifeTag } | undefined {
    const byId = new Map(blocks.map(b => [b.id, b]));
    const pID = e.ids.find(id => byId.get(id)?.type === "p");
    if (!pID) return undefined;
    return {
        pID,
        tag: {
            content: e.ids.map(id => byId.get(id)?.content ?? "").join(" ").trim(),
            type: kind || RELAY_TAG_TYPE,
            time: hhmmFromCreated(e.stamp),
            date: ymdFromCreated(e.stamp),
        },
    };
}

const RELAY_LOCK = "tomato-shorthand-relay-lock-2026-09-06";

/** need-0926-07：移动端开开关一次性提示决策（纯函数，ConfCapture.onShorthandRelayToggle 消费）
 *  ——开启瞬间 on && 移动端 && 未提示过才弹；桌面端/关闭方向/已提示过均不再弹（防重弹标记
 *  走 petal 设置 shorthandRelayMobileHinted，提示后由调用方 set）。自动通道不加即时 toast
 *  （移动端 sync_end 高频防刷屏，need-0926-07 拍板） */
export function shouldShowMobileRelayHint(on: boolean, mobile: boolean, hinted: boolean): boolean {
    return on && mobile && !hinted;
}

/** need-0926-07：手动 !docID 分诊（纯函数）——全库同 hpath 探测命中箱集里含解析箱之外的箱 =
 *  中转文档在别的笔记本（主因：官方保存位置未指定笔记本时，内核 consumeShorthands 兜底=第一个
 *  可用笔记本〔shortcuts.go selectShorthandSaveBox〕，而 getShorthandSavePath API 兜底=传入的
 *  日记落点笔记本〔filetree.go getShorthandSavePath〕——两侧兜底不一致）；命中里只有解析箱
 *  自身（索引竞态窗）或全库无命中 = 今日中转文档未建口径 */
export function docMissInOtherBox(hitBoxIDs: string[], resolveBox: string): boolean {
    return hitBoxIDs.some(id => id !== resolveBox);
}

/** need-0926-07：手动搬运静默分支的文案选择（纯函数，单测覆盖）——noPath=双通道皆无合并路径
 *  （need-19 改口径：桌面端无官方『闪念速记-保存位置』入口，引导移动端配置+插件自存模板）/
 *  noDoc=今日中转文档未建/otherBox=路径错位（{path}/{box} 占位与 {n} 同款 .Replace 协议）/
 *  empty=已全部搬完；自动通道不调本函数（维持静默防刷屏） */
export function relayManualMissHint(kind: "noPath" | "noDoc" | "otherBox" | "empty", path = "", boxNames = ""): string {
    switch (kind) {
        case "noPath": return tomatoI18n.官方速记未配置合并路径;
        case "noDoc": return tomatoI18n.官方速记今日无中转文档;
        case "otherBox": return tomatoI18n.官方速记路径不在解析笔记本.replace("{path}", path).replace("{box}", boxNames);
        case "empty": return tomatoI18n.官方速记无待搬运;
    }
}

// ── need-0926-19 官方速记中转路径模板：纯移动端配置场景的自存兜底通道 ──────────
// 背景：官方「闪念速记-保存位置/路径模板」仅移动端设置 UI 有入口（app/src/config/tabs/
// fileTab.ts isMobileKernelContainer 门控）且写各设备本机 conf.json、conf 不进同步 →
// 桌面端 ShorthandSaveBox/Path 恒空 → relayOnce 的官方通道恒空 = 搬运死路。插件自存
// 同款模板（shorthandRelayPathTpl）优先渲染定位，本机 conf 只作兜底。

/** go 布局参考段表（长度降序，一次遍历贪心最长匹配防值污染）。事实源=kernel model/
 *  template.go：sprig.TxtFuncMap 的 date 布局=Go 参考时间 Mon Jan 2 15:04:05 MST 2006。
 *  子集边界：年/月/日/星期/时分秒/AM-PM（搬运面日期模板全覆盖）；小数秒/时区段（.000/
 *  Z07:00/MST）不实现——不认识的参考段原样保留（与 Go 对非参考字面量的行为一致） */
const GO_LAYOUT_SEGS: [string, (d: Date) => string][] = [
    ["January", d => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()]],
    ["Monday", d => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()]],
    ["2006", d => String(d.getFullYear()).padStart(4, "0")],
    ["Jan", d => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]],
    ["Mon", d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]],
    ["01", d => String(d.getMonth() + 1).padStart(2, "0")],
    ["02", d => String(d.getDate()).padStart(2, "0")],
    ["03", d => String(d.getHours() % 12 || 12).padStart(2, "0")],
    ["04", d => String(d.getMinutes()).padStart(2, "0")],
    ["05", d => String(d.getSeconds()).padStart(2, "0")],
    ["06", d => String(d.getFullYear() % 100).padStart(2, "0")],
    ["15", d => String(d.getHours()).padStart(2, "0")],
    ["PM", d => (d.getHours() < 12 ? "AM" : "PM")],
    ["pm", d => (d.getHours() < 12 ? "am" : "pm")],
    ["1", d => String(d.getMonth() + 1)],
    ["2", d => String(d.getDate())],
    ["3", d => String(d.getHours() % 12 || 12)],
    ["4", d => String(d.getMinutes())],
    ["5", d => String(d.getSeconds())],
];

/** go 布局串 → now 各段值（一次遍历贪心最长匹配；非参考段字符原样复制） */
function renderGoLayout(layout: string, now: Date): string {
    let out = "";
    let i = 0;
    outer: while (i < layout.length) {
        for (const [seg, fn] of GO_LAYOUT_SEGS) {
            if (layout.startsWith(seg, i)) {
                out += fn(now);
                i += seg.length;
                continue outer;
            }
        }
        out += layout[i];
        i++;
    }
    return out;
}

/** 模板段受控子集：{{now | date "布局"}}（空格容忍）——kernel 渲染面搬运路径模板的
 *  实际形态；不匹配返回 false（子集外，调用方整体退官方通道不瞎渲染） */
const SELF_TPL_SEG = /^\s*now\s*\|\s*date\s+"([^"]*)"\s*$/;

/** need-0926-19①：官方速记中转路径模板渲染（纯函数，单测覆盖）——go 模板受控子集。
 *  空串/纯空白 → null（自存通道关闭=纯官方通道现状）；子集外 {{...}} 段 → null
 *  （sprig 全函数族过大，宁可退官方通道）；静态路径（无模板变量）原样返回（官方
 *  『不使用模板变量=追加到固定文档』的模式 B 同样可定位）；其余按段渲染拼接 */
export function renderShorthandTemplate(tpl: string, now: Date = new Date()): string | null {
    const s = tpl ?? "";
    if (!s.trim()) return null;
    let out = "";
    let rest = s;
    for (;;) {
        const m = rest.match(/\{\{([^{}]*)\}\}/);
        if (!m) return out + rest;
        if (!SELF_TPL_SEG.test(m[1])) return null;
        out += rest.slice(0, m.index!) + renderGoLayout(m[1].match(SELF_TPL_SEG)![1], now);
        rest = rest.slice(m.index! + m[0].length);
    }
}

/** need-0926-19②：通道优先级决策（纯函数，单测覆盖）——self=自存模板渲染成功（优先，
 *  即便本机 conf 同时有值）/conf=自存不可用退本机官方通道（存量链路现状）/none=双通道
 *  皆无（手动通道弹「未配置」新文案：引导移动端配置+核对插件自存模板）。confPath=官方
 *  API 已渲染好的本机 conf 路径（桌面端恒空=本 need 的根因） */
export type RelayPathPlan = { kind: "self"; path: string } | { kind: "conf"; path: string } | { kind: "none" };

export function relayPathPlan(tpl: string, confPath: string, now: Date = new Date()): RelayPathPlan {
    const selfPath = renderShorthandTemplate(tpl, now);
    if (selfPath) return { kind: "self", path: selfPath };
    if (confPath) return { kind: "conf", path: confPath };
    return { kind: "none" };
}

/** need-0926-19②：自存模板通道的中转文档定位——先解析箱后全库扫（官方保存位置未指定
 *  笔记本时内核兜底=第一个可用笔记本〔shortcuts.go selectShorthandSaveBox〕≠解析箱，
 *  need-0926-07 已证）；探测失败吞错留痕（miss=退本机 conf 通道，不抢戏） */
async function locateTransitDoc(path: string, boxArg: string): Promise<{ box: string; docID: string } | undefined> {
    try {
        const own = await siyuan.getIDsByHPath(path, boxArg);
        if (own?.length) return { box: boxArg, docID: own[0] };
        const books = (await siyuan.lsNotebooks(false)) ?? [];
        for (const b of books) {
            if (b.id === boxArg) continue;
            const ids = await siyuan.getIDsByHPath(path, b.id);
            if (ids?.length) return { box: b.id, docID: ids[0] };
        }
    } catch (err) {
        debugLog("shorthand_relay", `locate transit fail path=${path}: ${err}`, "dailynote");
    }
    return undefined;
}

/** need-0926-07 手动 !docID 分诊探测：扫全部开放笔记本同 hpath，命中集走纯函数分诊给一句可读
 *  提示；诊断面任何失败吞错留痕（主链本就静默，诊断提示锦上添花不抢戏） */
async function diagnoseDocMiss(path: string, box: string): Promise<void> {
    try {
        const books = (await siyuan.lsNotebooks(false)) ?? [];
        const hitBoxes: string[] = [];
        const hitNames: string[] = [];
        for (const b of books) {
            const ids = await siyuan.getIDsByHPath(path, b.id);
            if (ids?.length) {
                hitBoxes.push(b.id);
                hitNames.push(b.name);
            }
        }
        debugLog("shorthand_relay", `diagnose miss path=${path} box=${box} hits=${hitNames.join(",")}`, "dailynote");
        const kind = docMissInOtherBox(hitBoxes, box) ? "otherBox" : "noDoc";
        siyuan.pushMsg(relayManualMissHint(kind, path, hitNames.join("、")));
    } catch (err) {
        debugLog("shorthand_relay", `diagnose miss fail: ${err}`, "dailynote");
    }
}

/** 搬运入口（手动命令 manual=true / sync_end 自动）：locks ifAvailable + 5s 冷却防抖；
 *  getTarget=日记落点解析（注入）；afterRelay=need-0926-18 真搬运成功后的回调（带
 *  dayID，间隔重算等下游挂点用；空手早退路径不触发——sync_end 高频防多余 calc） */
export async function relayShorthands(manual: boolean, getTarget: DailyTargetResolver, afterRelay?: (dayID: string) => void): Promise<void> {
    // □5 移动端守卫：官方速记搬运设计=移动端只写冷区中转文档、桌面端整理进日记；移动端
    // sync_end 也搬运=两端并发改日记→云端同步冲突丢内容（飞书用户实锤报障）。自动通道
    // 静默返回（移动端 sync_end 高频），手动通道给提示（守卫写法同 NoteBox moveFromQueue）
    if (events.isMobile) {
        if (manual) siyuan.pushMsg(tomatoI18n.官方速记搬运须在桌面端执行);
        return;
    }
    await navigator.locks.request(RELAY_LOCK, { ifAvailable: true }, async (lock) => {
        if (!lock) return;
        try {
            await relayOnce(manual, getTarget, afterRelay);
        } finally {
            await sleep(5000);
        }
    });
}

async function relayOnce(manual: boolean, getTarget: DailyTargetResolver, afterRelay?: (dayID: string) => void): Promise<void> {
    const boxArg = storeNoteBox_selectedNotebook.getOr();
    // need-0926-19②：通道优先级走 relayPathPlan 纯函数（单测锚点：自存模板>本机 conf>未配置
    // 文案）——纯移动端配置场景官方链路死路的兜底（桌面端 conf 恒空）。先取本机官方通道
    // （开销与现状同：一次 API），再与自存模板一起决策；self 命中后日记落点仍走解析箱
    // （用户插件配置语义；官方通道保持现状传参——桌面 conf 空回退 boxArg，两通道行为统一）
    const r = (await siyuan.call("/api/filetree/getShorthandSavePath", { notebook: boxArg })) ?? {};
    let box = r.box ?? "";
    let path = r.path ?? "";
    debugLog("shorthand_relay", `savePath box=${box} path=${path} manual=${manual}`, "dailynote");
    let docID: string | undefined;
    let fromSelf = false;
    const plan = relayPathPlan(shorthandRelayPathTpl.get(), path);
    if (plan.kind === "none") {
        // 官方模式 A（每条一独立文档）+自存模板未命中不属搬运范围：手动触发给引导（need-19
        // 改口径=移动端配置+插件自存模板兜底，不再引导桌面端不存在的设置项），自动触发静默
        if (manual) siyuan.pushMsg(relayManualMissHint("noPath"));
        return;
    }
    if (plan.kind === "self") {
        const hit = await locateTransitDoc(plan.path, boxArg);
        if (hit) {
            box = hit.box;
            path = plan.path;
            docID = hit.docID;
            fromSelf = true;
            debugLog("shorthand_relay", `self tpl path=${path} box=${box} manual=${manual}`, "dailynote");
        }
        // miss（模板与移动端不一致/今日无速记）→ box/path 保持官方返回继续走 conf 定位
    }
    if (!docID) {
        const docIDs = await siyuan.getIDsByHPath(path, box);
        docID = docIDs?.[0];
        if (!docID) {
            // need-0926-07：今日中转文档未建/路径不在解析笔记本下两因原先同为一行静默 return——手动
            // 通道探测分诊给可读提示（diagnoseDocMiss），自动通道维持静默（sync_end 高频防刷屏）
            if (manual) await diagnoseDocMiss(path, box);
            return;
        }
    }

    const children = await siyuan.getChildBlocks(docID);
    const entries = groupShorthandEntries(children);
    if (entries.length === 0) {
        // need-0926-07：中转文档在而条目空（常见=已全部搬完，内核给搬空文档补占位空段被
        // groupShorthandEntries 过滤）——手动通道补一句可读提示，自动通道维持静默
        if (manual) siyuan.pushMsg(relayManualMissHint("empty"));
        return;
    }

    // need-19：自存通道命中箱可能是全库扫到的箱（官方保存位置未指定箱时内核兜底=第一个
    // 可用笔记本），日记落点仍取解析箱；官方通道保持现状传参
    const dayID = await getTarget(fromSelf ? boxArg : box);
    if (!dayID) return;

    // need-0926-17 分类增强：条目首图标 → noteBoxAllKinds 分类（面板同源唯一配置）。
    // need-0926-13：命中后按「@别名」声明分流（relayKindAction）——内置/声明 emoji →
    // alias 直写（正文零标记）；声明文字词 → aliasText 不建引用+正文「名称：」前缀
    // （下方锚循环）；未声明自定义词 → createRefDoc+块首引用锚（现状）；未命中/无图标
    // → undefined，全链路退「速记」现状口径。内容源=条内全块 content join
    // （relayEntryLifeTag 同款），首字符判定纯函数 relayEntryKind
    const relayKinds = parseNoteKinds(noteBoxAllKinds.get());
    const kindOf = new Map<{ ids: string[] }, string | undefined>(entries.map(e => [e, relayEntryKind(
        e.ids.map(id => children.find(b => b.id === id)?.content ?? "").join(" ").trim(),
        relayKinds,
    )] as const));
    /** need-0926-13：命中词 → {icon 剥后缀, action 分流}（每条一次，各消费面共用） */
    const actOf = (e: { ids: string[] }): RelayKindAction | undefined => relayKindAction(kindOf.get(e));
    /** 别名型（emoji/文字）命中 → alias 直写值；ref/未命中=undefined 不落 alias 键 */
    const aliasOf = (e: { ids: string[] }): string | undefined => {
        const a = actOf(e);
        return a && a.action !== "ref" ? a.icon : undefined;
    };
    /** need-0926-13：文字别名命中 → idea-type 标记值（与 alias 同值双写，need-15 派生链
     *  第二还原键）；emoji/ref/未命中=undefined 不落键 */
    const ideaTypeOf = (e: { ids: string[] }): string | undefined => {
        const a = actOf(e);
        return a && a.action === "aliasText" ? a.icon : undefined;
    };

    // 条级容器（□1 协议 v1：idea-time=条输入时刻；ref-hpath 无源省略）。□4 落块形态跟随
    // 开关（fballfb 2026-09-21）：para/list 形态下「恰一块且为段落」的条目免壳直搬（块自身
    // 挂收集属性）；多块/非 p 条目维持 sb 收纳（裸形态装不下多块，壳对收纳必要——
    // relayBareEligible 纯函数，单测覆盖）。混合期（开关切换后旧 sb 条目与新裸条目并存）
    // 两组各自保序，组间按 wrapped→bare 分层
    const form = coerceFlashBlockForm(flashBlockForm.get());
    const typeOf = (id: string) => children.find(b => b.id === id)?.type;
    const bareEntries = entries.filter(e => relayBareEligible(form, e.ids, typeOf));
    const wrappedEntries = entries.filter(e => !bareEntries.includes(e));

    const builders = wrappedEntries.map(e => {
        const b = new DomSuperBlockBuilder();
        // need-0926-17：内置 emoji 命中分类 alias 直写（面板 emoji 分支 IAL 同款通道）；
        // need-0926-13：声明别名同入（文字别名另挂 idea-type 第二还原键）
        b.setAttrs(collectBlockAttrs(hhmmFromCreated(e.stamp), undefined, aliasOf(e), ideaTypeOf(e)));
        return b;
    });
    let ops: any[] = [];
    if (flashRelayByTime.get()) {
        // need-0926-11 归位分支：逐条按记录时刻锚定（首个更晚时刻速记块前；透明穿越/
        // 尾插兜底见 planRelayTimeSlots），wrapped/bare 混合按 entries 时间序（打破尾插
        // 语义下 wrapped→bare 组间分层）；头插开关让位——归位语义自带位置决策，flash_
        // thoughts_2_top 的 feed 语义与按时刻归位矛盾，仅归位关闭时才生效（口径④）。
        // 壳 id 先于规划全部生成（tailID 预知，后续条目锚可引用先插壳）；事务 op 序贯
        // 应用：逐条「插壳/搬块 → 下一条锚定引用前条尾块」同事务内自洽
        const anchors = await relayAnchorBlocks(dayID);
        const wrapOf = new Map<number, DomSuperBlockBuilder>();
        const slots = planRelayTimeSlots(anchors, entries.map((e, i) => {
            const wrappedIdx = wrappedEntries.indexOf(e);
            if (wrappedIdx >= 0) wrapOf.set(i, builders[wrappedIdx]);
            return {
                created: e.stamp,
                ideaTime: hhmmFromCreated(e.stamp),
                tailID: wrappedIdx >= 0
                    ? builders[wrappedIdx].id
                    : (e.ids[e.ids.length - 1] ?? ""),
            };
        }));
        entries.forEach((e, i) => {
            const slot = slots[i];
            const anchorID = slot.kind === "after" ? slot.anchorID : "";
            const b = wrapOf.get(i);
            if (b) {
                if (anchorID) ops.push(...siyuan.transInsertBlocksAfter([b.html()], anchorID));
                else ops.push(...siyuan.transInsertBlocksAsChildOf([b.html()], dayID));
                ops.push(...siyuan.transMoveBlocksAsChild(e.ids, b.id));
            } else if (anchorID) {
                ops.push(...siyuan.transMoveBlocksAfter(e.ids, anchorID));
            } else {
                ops.push(...siyuan.transMoveBlocksAsChild(e.ids, dayID));
            }
        });
        debugLog("shorthand_relay", `time-order relay entries=${entries.length} anchorBlocks=${anchors.length}`, "dailynote");
    } else {
    if (flash_thoughts_2_top.get()) {
        // 头插：AsChildOf=插父块首（transXxx 内部 reverse 保正序）
        ops.push(...siyuan.transInsertBlocksAsChildOf(builders.map(b => b.html()), dayID));
    } else {
        const tailID = await siyuan.getDocLastID(dayID);
        if (tailID) ops.push(...siyuan.transInsertBlocksAfter(builders.map(b => b.html()), tailID));
        else ops.push(...siyuan.transInsertBlocksAsChildOf(builders.map(b => b.html()), dayID));
    }
    // 块挂进各自容器。transMoveBlocksAsChild 净契约（6808 双目标实证 2026-09-06 □7）：
    // 文档/superblock 容器两类目标内核均逐 op 前插，helper 内 reverse 恰好抵消——
    // 调用方传什么序落什么序，直接传 e.ids 正序；此前「容器目标走 InsertAfter 需传前
    // reverse」系误断（双重反转=容器内块序倒置，多块条目可复现）；容器 id 由前端生成
    // 随 insert DOM 落库保留（cardID 同款）
    wrappedEntries.forEach((e, i) => {
        ops.push(...siyuan.transMoveBlocksAsChild(e.ids, builders[i].id));
    });
    // □4 bare 条目直搬（无 sb 壳）：头插=整组一次 AsChild（净契约同上正序）；尾插=滚动
    // 锚逐条 After（锚=前一条末块，跟在 wrapped 末容器/文档尾块之后）
    if (bareEntries.length > 0) {
        if (flash_thoughts_2_top.get()) {
            ops.push(...siyuan.transMoveBlocksAsChild(bareEntries.flatMap(e => e.ids), dayID));
        } else {
            let anchor = builders.length > 0
                ? builders[builders.length - 1].id
                : await siyuan.getDocLastID(dayID);
            for (const e of bareEntries) {
                if (!anchor) break;
                ops.push(...siyuan.transMoveBlocksAfter(e.ids, anchor));
                anchor = e.ids[e.ids.length - 1] ?? anchor;
            }
            if (!anchor) ops.push(...siyuan.transMoveBlocksAsChild(bareEntries.flatMap(e => e.ids), dayID));
        }
    }
    }
    await siyuan.transactions(ops);
    // need-0926-17 自定义分类锚 + need-0926-13 别名分流（事务后逐条处理首个段落块）：
    //   aliasEmoji（内置/声明 emoji）→ 零标记跳过（alias 属性已随容器/裸块挂载）；
    //   aliasText（声明文字词）→ 不建引用，正文前缀改写（剥命中痕迹+「名称：」前缀，
    //     陆杰 09-26 拍板——面板 aliasNoteBody 同构）；
    //   ref（未声明自定义词/用户自配 emoji）→ createRefDoc 建引用文档 + 条目首段块首
    //     动态引用（面板 add_ref(textDiv, id, icon, false, false) 同款通道，读侧 markdown
    //     首部引用锚还原链对齐）。
    // 走 getBlockDOM 全量 DOM 写回（update op 不洗 custom-* 属性——裸 kramdown 通道会整段
    // 洗，Annotations □3 实测同族）；先于下方 bare/lifelog 属性挂载（改内容在前挂属性
    // 在后）。同批同分类 refID 复用（createRefDoc 幂等但省 SQL 往返）；无段落块条目跳过
    // （lifelog 宿主同款判型，纯列表/代码条目无从挂 contenteditable）；单条失败吞错
    // 留痕不阻断（搬运主链已成功，锚属锦上添花）
    const refIDs = new Map<string, string>();
    for (const e of entries) {
        const a = actOf(e);
        if (!a) continue;
        try {
            const pID = e.ids.find(id => children.find(b => b.id === id)?.type === "p");
            if (!pID) continue;
            if (a.action === "aliasEmoji") continue;
            if (a.action === "aliasText") {
                const { dom } = await siyuan.getBlockDOM(pID);
                const div = dom2div(dom);
                if (prefixAliasBody(div, a.icon)) {
                    await siyuan.updateBlocks([{ id: pID, domStr: div.outerHTML }]);
                    debugLog("shorthand_relay", `kind alias prefix icon=${a.icon} p=${pID}`, "dailynote");
                }
                continue;
            }
            let refID = refIDs.get(a.icon);
            if (!refID) {
                refID = await createRefDoc(boxArg, a.icon);
                refIDs.set(a.icon, refID);
            }
            const { dom } = await siyuan.getBlockDOM(pID);
            const div = dom2div(dom);
            add_ref(div, refID, a.icon, false, false);
            await siyuan.updateBlocks([{ id: pID, domStr: div.outerHTML }]);
            debugLog("shorthand_relay", `kind anchor kind=${a.icon} p=${pID} ref=${refID}`, "dailynote");
        } catch (err) {
            debugLog("shorthand_relay", `kind anchor fail kind=${kindOf.get(e)}: ${err}`, "dailynote");
        }
    }
    // □4 bare 条目属性挂块自身（事务后 setBlockAttrs，单条失败吞错留痕不阻断搬运主链）；
    // need-0926-17：内置 emoji 命中分类 alias 同挂（与 idea-time 同层）；need-0926-13：
    // 别名型命中同入（文字别名另挂 idea-type 第二还原键）
    for (const e of bareEntries) {
        try {
            await siyuan.setBlockAttrs(e.ids[0], collectBlockAttrs(hhmmFromCreated(e.stamp), undefined, aliasOf(e), ideaTypeOf(e)));
        } catch (err) {
            debugLog("shorthand_relay", `bare attrs fail stamp=${e.stamp}: ${err}`, "dailynote");
        }
    }
    // □3 落点 B：开关开时逐条补时间记录标记（与 □2 落点 A 同协议，生态四键识别面）。
    // 单条失败吞错留痕不阻断（搬运主链已成功，标记属锦上添花）；无段落块条目跳过；
    // need-0926-17：type=命中分类词（未命中/无图标默认「速记」）；need-0926-13：文字
    // 别名条目 content 对齐前缀改写后的正文（剥命中痕迹+「名称：」前缀，与盘上块同文）
    if (flashStatTag.get()) {
        for (const e of entries) {
            try {
                const a = actOf(e);
                const hit = relayEntryLifeTag(e, children, a?.icon);
                if (hit) {
                    if (a?.action === "aliasText") {
                        hit.tag.content = aliasRelayBody(a.icon, hit.tag.content);
                    }
                    await siyuan.setBlockAttrs(hit.pID, lifelogAttrs(hit.tag));
                }
            } catch (err) {
                debugLog("flashlog", `relay tag fail stamp=${e.stamp}: ${err}`, "dailynote");
            }
        }
    }
    debugLog("shorthand_relay", `done doc=${docID} entries=${entries.length} blocks=${children.length}`, "dailynote");
    siyuan.pushMsg(tomatoI18n.已搬运速记到日记.replace("{n}", String(entries.length)));
    // need-0926-18：真搬运成功才回调（间隔重算等下游挂点；上方各早退路径不触发）
    afterRelay?.(dayID);
}

/** sync_end 自动触发（插件官方 eventBus 事件名，Events.ts:32 同源）；开关关闭时零开销；
 *  getTarget=日记落点解析（注入）；afterRelay 转传（need-0926-18 搬运后间隔重算） */
export function bindShorthandRelay(
    plugin: { eventBus: { on: (t: string, cb: () => void) => void } },
    getTarget: DailyTargetResolver,
    afterRelay?: (dayID: string) => void,
) {
    plugin.eventBus.on("sync-end", () => {
        if (!shorthandRelayEnabled.get()) return;
        void relayShorthands(false, getTarget, afterRelay);
    });
}
