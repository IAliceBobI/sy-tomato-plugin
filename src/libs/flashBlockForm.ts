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
import { DATA_NODE_ID } from "./gconst";
import { NewNodeID } from "./utils";

export type FlashBlockForm = "super" | "para" | "list";

export const FLASH_BLOCK_FORMS: readonly FlashBlockForm[] = ["super", "list", "para"];

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

/** 一步形态的 IAL 串（独立成行挂段落块，预挂 id 被内核认领） */
export function flashIAL(id: string, time: string, alias?: string): string {
    return alias
        ? `{: id="${id}" custom-tomato-idea-time="${time}" alias="${alias}"}`
        : `{: id="${id}" custom-tomato-idea-time="${time}"}`;
}

/** 两步形态插完后补挂的条目属性对象（挂 item 本体） */
export function flashAttrs(time: string, alias?: string): { [k: string]: string } {
    const a: { [k: string]: string } = { "custom-tomato-idea-time": time };
    if (alias) a["alias"] = alias;
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
 *  task（📌）：勾选语义不降级——任何形态恒任务列表项（super=现状 sb 包任务；para/list=裸任务项） */
export function flashMD(text: string, time: string, form: FlashBlockForm, alias?: string, task = false): FlashMD {
    const id = NewNodeID();
    if (form === "super") {
        // 历史行为原样：任务合并单行；非任务多行原样进 sb（sb 内多块）
        const t = task ? `* [ ] ${flashSingleLine(text, "; ")}` : text;
        return { md: doubleSupRows(t, flashIAL(id, time, alias)), id };
    }
    if (task) {
        // 任务双层结构同列表坑：两步挂属性（实测②）
        return { md: `* [ ] ${flashSingleLine(text, "; ")}`, twoStep: true };
    }
    if (form === "para") {
        return { md: `${flashSingleLine(text, " ")}\n${flashIAL(id, time, alias)}`, id };
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
