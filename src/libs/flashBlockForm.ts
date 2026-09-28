// 速记/闪念落块形态开关（fballfb □4 2026-09-21）：陆杰「速记内容删不掉」根因=文本类落块
// 恒双层 superblock（删内容留壳→删壳撞内核报错）。本模块把「一条速记 → 待插产物」的形态
// 决策与构造收拢为纯函数，双通道共用：
//   - md 通道（NoteBox getContent2insert emoji/📌 分支）→ flashMD
//   - DOM 通道（分类引用分支）→ wrapFlashBlocksDOM
// 三态（store flashBlockForm）：super=超级块/para=段落块（默认，bear 09-21 拍板）/list=列表项块。
// 实测依据（6811 dev 实例 2026-09-21，内核 3.8.4）：
//   ① markdown 通道段落内嵌 IAL（独立成行）直挂 p 本体，预挂 id 被认领——一步形态可用；
//   ② 列表/任务双层结构内嵌 IAL 落在 NodeList 容器上，真 item（type 'i'）拿不到属性——
//     与在档坑「markdown 插任务列表=双层结构，属性挂容器=永不相交」同源，须两步
//     （插裸列表 → 响应首 id=容器 → getChildBlocks 取 item → setBlockAttrs 补属性）；
//   ③ 删列表项后空 NodeList 容器内核自动回收（无壳残留）——列表项形态删除体验干净。
import { doubleSupRows } from "./strUtils";
import { DomListBuilder, DomSuperBlockBuilder } from "./sydom";
import { getContenteditableElement } from "./domUtils";
import { DATA_NODE_ID } from "./gconst";
import { NewNodeID } from "./utils";
import { PLAIN_KIND } from "./quicknoteCore";

export type FlashBlockForm = "super" | "para" | "list";

export const FLASH_BLOCK_FORMS: readonly FlashBlockForm[] = ["super", "list", "para"];

/** 内置 emoji 类型集（need-0926-17 提取共享）：面板 getContent2insert emoji/📌 两分支
 *  直写 alias 的八个图标（noteBoxAllKinds 默认值前 8 项与之对应）。语义=命中此集走
 *  alias 直写通道（面板 flashMD / 搬运侧属性直挂），否则（自定义词如「锻炼」、用户自配
 *  其他 emoji）走 createRefDoc+块首引用锚通道——NoteBox.ts 与 shorthandRelay.ts 共用
 *  同一常量防两端口径漂移 */
export const FLASH_ALIAS_KINDS: readonly string[] = ["📌", "💡", "🏞️", "💪", "💬", "🍴", "📚", "💼"];

/** need-0926-10：文本落块通道分流（纯函数，单测锚点）——plain=纯文本裸块（无引用无
 *  alias，idea-type 标记+idea-time 照写）/alias=内置 emoji（alias 直写）/ref=自定义分类
 *  （createRefDoc+块首引用锚）。图片通道（isPic）无类型语义，由调用方首位自判不进本函数 */
export function flashChannel(icon: string): "plain" | "alias" | "ref" {
    const c = kindChannel(icon, false);
    if (c === "aliasEmoji" || c === "aliasText") return "alias"; // aliasText 不可达（声明恒 false），防御收编
    return c;
}

/** need-0926-13：类型通道四值（flashChannel 的别名细分版，面板/搬运共用）——
 *  plain=纯文本裸块 / aliasEmoji=emoji 别名（alias 直写+正文零标记）/ aliasText=文字
 *  别名（不建引用+正文「名称：」前缀）/ref=引用型（createRefDoc+块首引用锚） */
export type FlashKindChannel = "plain" | "aliasEmoji" | "aliasText" | "ref";

/** need-0926-13：首码点 emoji 判定（\p{Extended_Pictographic} 涵盖 VS16 组合形态；
 *  文字词恒 false——与 relayEntryKind 首码点语义对齐） */
export function isEmojiKind(icon: string): boolean {
    const head = Array.from((icon ?? "").trim())[0] ?? "";
    return head !== "" && /\p{Extended_Pictographic}/u.test(head);
}

/** need-0926-13：类型分流（纯函数，单测锚点）——icon 必须为剥后缀显示名（chipsKinds
 *  产物），声明布尔由调用方经 kindAliasDeclared 反查（搬运侧经 relayKindAction 一体化）。
 *  内置 8 emoji 天然别名（现状零标记）；自定义词带声明=升别名（emoji 零标记/文字留字
 *  前缀——陆杰 09-26 拍板）；无声明自定义词（含用户自配非内置 emoji）=引用型（存量
 *  零迁移，引用文档生态保留） */
export function kindChannel(icon: string, aliasDeclared: boolean): FlashKindChannel {
    if (icon === PLAIN_KIND) return "plain";
    if (FLASH_ALIAS_KINDS.includes(icon)) return "aliasEmoji";
    if (aliasDeclared) return isEmojiKind(icon) ? "aliasEmoji" : "aliasText";
    return "ref";
}

/** need-0926-13：别名型文字条目正文（面板/速记器通道）——「别名名称：内容」前缀，名称
 *  按设置字数完整展示不截断（陆杰 09-26 拍板，用户自述一般 4 字以内、字数不限）。
 *  text=纯正文（用户输入不含图标字符）直接前置不剥 */
export function aliasNoteBody(icon: string, text: string): string {
    return `${icon}：${(text ?? "").trim()}`;
}

/** need-0926-13：搬运通道正文——官方速记条目首字符=图标（need-17 首码点命中语义），
 *  先剥首部命中痕迹（以完整词开头剥整词，否则剥首码点——「锻炼 跑步」/「锻 跑步」两
 *  形态归一）再前缀；剥词后跟随的分隔符（空格/全半角冒号逗号顿号）一并清掉防
 *  「锻炼：： 跑步」；纯图标/空条目退「名称：」空内容前缀 */
export function aliasRelayBody(icon: string, content: string): string {
    const t = (content ?? "").trim();
    let rest = t.startsWith(icon) ? t.slice(icon.length) : Array.from(t).slice(1).join("");
    rest = rest.replace(/^[\s:：,，、]+/, "").trim();
    return aliasNoteBody(icon, rest);
}

/** need-0926-13：搬运侧文字别名正文改写（aliasRelayBody 的 DOM 版，引用锚循环同款
 *  getBlockDOM→dom2div→updateBlocks 通道）——contenteditable 文本整体替换（官方速记
 *  条目=纯文本段落无行内格式，textContent 直改可接受；带格式条目降级纯文本记 defaults）。
 *  无 contenteditable（纯列表/代码条目）返回 false 跳过（lifelog 宿主同款判型） */
export function prefixAliasBody(div: HTMLElement, icon: string): boolean {
    const ce = getContenteditableElement(div);
    if (!ce) return false;
    ce.textContent = aliasRelayBody(icon, ce.textContent ?? "");
    return true;
}

/** 设置值容错：非法/缺省值回 para（bear 09-21 拍板默认段落块；显式存过合法值的存量用户零迁移照旧） */
export function coerceFlashBlockForm(v: unknown): FlashBlockForm {
    return FLASH_BLOCK_FORMS.includes(v as FlashBlockForm) ? (v as FlashBlockForm) : "para";
}

/** 多行单行化：裸段落/列表项是单块语义，多行原样插会被拆多块（「多块内容只落首块」家族坑：
 *  属性只挂一块，其余块裸奔丢识别）。joiner 按内容语义：段落用空格、列表项/任务用 "; "
 *  （任务沿用 📌 历史行为） */
export function flashSingleLine(text: string, joiner: string): string {
    return text.split(/\n+/).map(s => s.trim()).filter(Boolean).join(joiner);
}

/** 一步形态的 IAL 串（独立成行挂段落块，预挂 id 被内核认领）。
 *  ideaType（need-0926-10）：纯文本类型的可追溯标记 custom-tomato-idea-type——与
 *  alias 互斥使用（纯文本不落 alias），emoji/引用两通道不传=零行为变化。
 *  need-0927-03 楼9 修订：纯文本形态（ideaType=PLAIN_KIND）不挂 custom-tomato-idea-time /
 *  custom-tomato-idea-type 两属性——idea-time 是间隔统计 calcTimeInterval 的拉链键，挂着即
 *  进链隔断相邻记录间隔（源头不落，cssStyle 排除规则留作存量兼容）；IAL 行保留 id=一步
 *  形态预挂 id 被内核认领的通道（返回 id 定位依赖），其余属性（alias）照落 */
export function flashIAL(id: string, time: string, alias?: string, ideaType?: string): string {
    if (ideaType === PLAIN_KIND) {
        return alias ? `{: id="${id}" alias="${alias}"}` : `{: id="${id}"}`;
    }
    const typeAttr = ideaType ? ` custom-tomato-idea-type="${ideaType}"` : "";
    return alias
        ? `{: id="${id}" custom-tomato-idea-time="${time}" alias="${alias}"${typeAttr}}`
        : `{: id="${id}" custom-tomato-idea-time="${time}"${typeAttr}}`;
}

/** 两步形态插完后补挂的条目属性对象（挂 item 本体）。ideaType 语义同 flashIAL；
 *  need-0927-03：纯文本形态（ideaType=PLAIN_KIND）零 time/type（alias 等其余属性照落
 *  ——纯文本通道不传 alias，此处仅为口径对称），调用方对空对象跳过写属性 */
export function flashAttrs(time: string, alias?: string, ideaType?: string): { [k: string]: string } {
    if (ideaType === PLAIN_KIND) {
        return alias ? { "alias": alias } : {};
    }
    const a: { [k: string]: string } = { "custom-tomato-idea-time": time };
    if (alias) a["alias"] = alias;
    if (ideaType) a["custom-tomato-idea-type"] = ideaType;
    return a;
}

export interface FlashMD {
    /** 待插 markdown（twoStep 形态不含 IAL） */
    md: string;
    /** 一步形态=预挂块 id（近期列表跳转/校验用）；两步形态=undefined（插完由调用方回填 item id） */
    id?: string;
    /** 真=插入后须解析容器→item 两步补属性（双层结构 IAL 挂容器坑，实测②） */
    twoStep?: boolean;
}

/** md 通道产物（一条速记 → 待插 markdown+属性挂载方案）。
 *  task（📌）：勾选语义不降级——任何形态恒任务列表项（super=现状 sb 包任务；para/list=裸任务项）。
 *  ideaType（need-0926-10）：纯文本类型可追溯标记，随 IAL/两步属性同挂（两步形态由调用方
 *  插完以 flashAttrs(time, undefined, ideaType) 补挂）；need-0927-03 楼9 修订起纯文本形态
 *  只产 id 占位 IAL（time/type 两属性源头不落，见 flashIAL） */
export function flashMD(text: string, time: string, form: FlashBlockForm, alias?: string, task = false, ideaType?: string): FlashMD {
    const id = NewNodeID();
    if (form === "super") {
        // 历史行为原样：任务合并单行；非任务多行原样进 sb（sb 内多块）
        const t = task ? `* [ ] ${flashSingleLine(text, "; ")}` : text;
        return { md: doubleSupRows(t, flashIAL(id, time, alias, ideaType)), id };
    }
    if (task) {
        // 任务双层结构同列表坑：两步挂属性（实测②）
        return { md: `* [ ] ${flashSingleLine(text, "; ")}`, twoStep: true };
    }
    if (form === "para") {
        return { md: `${flashSingleLine(text, " ")}\n${flashIAL(id, time, alias, ideaType)}`, id };
    }
    return { md: `- ${flashSingleLine(text, "; ")}`, twoStep: true };
}

export interface FlashDOM {
    /** 待插事务 HTML（DOM 通道走 insertBlocks* 数组通道，多块平铺=多元素） */
    htmls: string[];
    /** 条目属性所在块 id（近期列表跳转/校验/lifelog 宿主定位用） */
    blockID: string;
    /** 非 super 形态=true（调用方据此把 lifelog 标记直接挂宿主而非容器下钻） */
    bare: boolean;
}

/** DOM 通道包装（分类引用分支三态共享）。blocks=已构造内容块（domNewLine/md2Divs 产物，
 *  均预挂 data-node-id）；textDiv=内容锚块（首含 contenteditable，add_ref 已由调用方挂）。
 *  para：多块平铺直落，条目属性（idea-time）挂 textDiv（内容锚=lifelog p 宿主）；
 *  list：DomListBuilder 单 li 收全部块，属性挂 li（textDiv 在 li 内仍是 lifelog p 宿主）；
 *  super：现状双层 sb（L1 收 L2 收 blocks），属性挂 L1。 */
export function wrapFlashBlocksDOM(
    blocks: HTMLElement[],
    textDiv: HTMLElement,
    form: FlashBlockForm,
    time: string,
): FlashDOM {
    if (form === "para") {
        textDiv.setAttribute("custom-tomato-idea-time", time);
        return { htmls: blocks.map(b => b.outerHTML), blockID: textDiv.getAttribute(DATA_NODE_ID) ?? "", bare: true };
    }
    if (form === "list") {
        const lb = new DomListBuilder();
        lb.append(...blocks);
        const li = lb.container.firstElementChild as HTMLElement | null;
        if (!li) {
            // 防御：append 至少产一个 li，此分支理论不可达——退化 sb 保落块不断链
            return wrapFlashBlocksDOM(blocks, textDiv, "super", time);
        }
        li.setAttribute("custom-tomato-idea-time", time);
        return { htmls: [lb.build().outerHTML], blockID: li.getAttribute(DATA_NODE_ID) ?? lb.id, bare: true };
    }
    const L1 = new DomSuperBlockBuilder();
    const L2 = new DomSuperBlockBuilder();
    for (const b of blocks) L2.append(b);
    L1.append(L2.build());
    L1.setAttr("custom-tomato-idea-time", time);
    return { htmls: [L1.build().outerHTML], blockID: L1.id, bare: false };
}

/** 队列合并（NoteBox.moveFromQueue）lifelog 标记的源行（blocks 表 getRows 产物，实测形态
 *  2026-09-26 dev 6807 + 主实例真实数据双源核对）：content 列=内核纯文本渲染（块引用
 *  `((id '锚文本'))` 已还原为锚文本）；markdown 列保留 kramdown 原文（引用语法在）；
 *  alias 列=块 alias 属性值（emoji 分支 IAL 挂 p 本体直落） */
export interface QueueFlashRow {
    content?: string;
    markdown?: string;
    alias?: string;
}

/** DOM 通道（自定义分类）分类锚：块首部动态引用（add_ref atEnd=false 挂最前），
 *  markdown 形态=((id '分类名'))（动态单引号/静态双引号两形态，实测均见） */
const HEAD_REF_RE = /^\s*\(\(\d{14}-[a-z0-9]+\s+['"](.+?)['"]\)\)/;

/** need-0926-14：队列合并 type 还原——alias 属性（emoji 分支）优先，其次 idea-type 属性
 *  （need-0926-10 纯文本块：无 alias 无锚，唯一类型源），再次 markdown 首部块引用锚文本
 *  （DOM 通道分类锚），兜底「闪念」（固定中文属性值不 i18n，历史口径）。
 *  ideaType 为可选参：老收集块（idea-type=📚）不经队列搬运链，队列块只有纯文本带
 *  idea-type——既有调用不传=还原结果零变化 */
export function flashTypeFromQueueBlock(md: string, alias?: string, ideaType?: string): string {
    const a = (alias ?? "").trim();
    if (a) return a;
    const t = (ideaType ?? "").trim();
    if (t) return t;
    const m = (md ?? "").match(HEAD_REF_RE);
    if (m && m[1].trim()) return m[1].trim();
    return "闪念";
}

/** need-0926-14：队列合并 lifelog 标记的 content/type 纯函数源——content 列直用（纯文本，
 *  修「markdown 列 ((id 'xx')) 引用原文混进 custom-lifelog-content 污染时迹类插件检测」，
 *  markdown 仅 fallback），type 走还原链（ideaType 语义见 flashTypeFromQueueBlock） */
export function queueLifelogSource(row: QueueFlashRow, ideaType?: string): { content: string; type: string } {
    return {
        content: (row.content ?? row.markdown ?? "").trim(),
        type: flashTypeFromQueueBlock(row.markdown ?? "", row.alias, ideaType),
    };
}

/** 搬运免壳判定（shorthandRelay）：para/list 形态下，恰一个块且为段落（type 'p'）的条目
 *  可免容器直搬（块自身挂收集属性）；多块条目/非 p 块（图/列表/代码）维持 sb 收纳——
 *  裸形态装不下多块，壳对多块收纳必要（「按内容语义定」） */
export function relayBareEligible(
    form: FlashBlockForm,
    ids: string[],
    typeOf: (id: string) => string | undefined,
): boolean {
    if (form === "super") return false;
    return ids.length === 1 && typeOf(ids[0]) === "p";
}
