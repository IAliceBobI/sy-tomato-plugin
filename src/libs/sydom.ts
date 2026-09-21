import { Lute } from "siyuan";
import { BLOCK_REF, BlockNodeEnum, CONTENT_EDITABLE, DATA_AV_ID, DATA_ID, DATA_NODE_ID, DATA_NODE_INDEX, DATA_SUBTYPE, DATA_TYPE, WEB_ZERO_SPACE } from "./gconst";
import { joinArray, dom2div, NewConfiguredLute, NewNodeID, siyuan, cloneCleanDiv, setAttribute } from "./utils";
import { DocTracer } from "./docUtils";

export function domHeading(id: string, text: string, subtype = "h1") {
    if (!id) id = NewNodeID();
    if (!text) text = "<<<<nodata>>>>";
    return `<div data-subtype="${subtype}" data-node-id="${id}" data-type="NodeHeading" class="${subtype}">
<div contenteditable="true" spellcheck="false">${text}</div>
<div class="protyle-attr" contenteditable="false">​</div>
</div>`;
}
// 旧名拼写遗留（domHdeading），ReadingPointBox 等历史调用方仍可用
export const domHdeading = domHeading;

export function domEmbedding(refID: string, id?: string) {
    if (!id) id = NewNodeID();
    const html = `<div data-content="select * from blocks where id='${refID}'" 
data-node-id="${id}" data-type="NodeBlockQueryEmbed" class="render-node" >
<div class="protyle-attr" contenteditable="false">​</div></div>`;
    function getDiv() {
        let div = document.createElement("div")
        div.firstElementChild.outerHTML = html;
        return div.firstElementChild as HTMLElement;
    }
    return { id, html, getDiv };
}

export function domBlankLine(id?: string, txt = "") {
    if (!id) id = NewNodeID();
    return `<div data-node-id="${id}" data-type="NodeParagraph" class="p">`
        + `<div contenteditable="true" spellcheck="false">${txt}</div>`
        + '<div class="protyle-attr" contenteditable="false">​</div>'
        + "</div>";
}

export function domRef(id: string, lnkToID: string, lnkTxt: string) {
    if (!id) id = NewNodeID();
    return `<div data-node-id="${id}" data-type="NodeParagraph" class="p">`
        + '<div contenteditable="true" spellcheck="false">'
        + `<span data-type="block-ref" data-id="${lnkToID}" data-subtype="d">${lnkTxt.trim()}</span>`
        + "</div>"
        + '<div class="protyle-attr" contenteditable="false">​</div>'
        + "</div>";
}

export function domLnk(id: string, lnkToID: string, lnkTxt: string) {
    if (!id) id = NewNodeID();
    return `<div data-node-id="${id}" data-type="NodeParagraph" class="p">`
        + '<div contenteditable="true" spellcheck="false">'
        + `<span data-type="a" data-href="siyuan://blocks/${lnkToID}">${lnkTxt.trim()}</span>`
        + "</div>"
        + '<div class="protyle-attr" contenteditable="false">​</div>'
        + "</div>";
}

export function domNewHr() {
    const hr = document.createElement("div")
    hr.innerHTML = `<div data-node-id="${NewNodeID()}" data-type="NodeThematicBreak" class="hr"><div></div></div>`
    return hr.firstElementChild as HTMLElement;
}

export function domNewHeading(text: string, subtype = "h1", id = "", fold = false) {
    const h = document.createElement("div");
    setAttribute(h, "data-type", BlockNodeEnum.NODE_HEADING);
    setAttribute(h, "data-subtype", subtype);
    if (!id) id = NewNodeID()
    setAttribute(h, "data-node-id", id);
    h.classList.add(subtype);

    const div = h.appendChild(document.createElement("div"))
    div.textContent = text;
    div.setAttribute(CONTENT_EDITABLE, "true")
    div.setAttribute("spellcheck", "false")
    h.appendChild(newAttr());

    if (fold) setAttribute(h, "fold", "1");
    return h;
}

export function domNewLine(text = "", ...refs: HTMLElement[]) {
    const l = document.createElement("div");
    l.setAttribute(DATA_NODE_ID, NewNodeID())
    l.setAttribute(DATA_TYPE, BlockNodeEnum.NODE_PARAGRAPH)
    l.classList.add("p")
    const div = l.appendChild(document.createElement("div"))
    div.setAttribute(CONTENT_EDITABLE, "true")
    div.setAttribute("spellcheck", "false")
    if (!refs) refs = [];
    refs.splice(0, 0, document.createTextNode(text) as any)
    joinArray(refs, () => document.createTextNode("  ") as any).forEach(i => div.append(i))
    l.appendChild(newAttr());
    return l
}

function newListUDot() {
    const attr = document.createElement("div");
    attr.classList.add("protyle-action");
    attr.setAttribute("draggable", "true");
    const svg = attr.appendChild(document.createElement("svg"))
    const use = svg.appendChild(document.createElement("use"))
    use.setAttribute("xlink:href", "#iconDot")
    return attr;
}

function newAttr() {
    const attr = document.createElement("div");
    attr.classList.add("protyle-attr");
    attr.setAttribute(CONTENT_EDITABLE, "false");
    attr.textContent = WEB_ZERO_SPACE;
    return attr;
}

/** append 入参统一规整为已 build 的 HTMLElement：builder 自动 build（消灭嵌套忘 build 坑） */
export function buildDOM(d: HTMLElement | DomBuilder): HTMLElement {
    return d instanceof DomBuilder ? d.build() : d;
}

export abstract class DomBuilder {
    // can be override.
    append(...div: (HTMLElement | DomBuilder)[]) {
        div.forEach(d => {
            const el = buildDOM(d);
            // build 后 protyle-attr 已是末元素，新子块须插它之前保持结构合法
            if (this.built) this.container.insertBefore(el, this.container.lastElementChild);
            else this.container.appendChild(el);
        })
        return this;
    }
    build() {
        if (!this.built) {
            this.container.appendChild(newAttr());
            this.built = true;
        }
        return this.container;
    }
    /** 事务直用：build 并以 HTML 字符串返回（幂等，可重复调用） */
    html() {
        return this.build().outerHTML;
    }
    //----
    cloneDiv() {
        return cloneCleanDiv(this.container)
    }
    setAttrs(attr: AttrType) {
        Object.entries(attr).forEach(([k, v]) => this.setAttr(k as any, v))
        return this;
    }
    setAttr(k: AttrKey, v: string) {
        this.container.setAttribute(k, v);
        return this;
    }
    //---- container
    private _container: HTMLDivElement = document.createElement("div");
    get container(): HTMLDivElement {
        return this._container;
    }
    /** build 幂等标记：重复 build 不叠加 protyle-attr */
    private built = false;
    //---- id
    private _id = NewNodeID();
    get id(): string {
        return this._id;
    }
    setID(i: string) {
        this._id = i;
        this.container.setAttribute(DATA_NODE_ID, i)
        return this;
    }
    //---- constructor
    constructor() {
        this.container.setAttribute(DATA_NODE_ID, this.id)
    }
}

export class DomListBuilder extends DomBuilder {
    constructor() {
        super();
        this.container.classList.add("list")
        this.container.setAttribute(DATA_TYPE, BlockNodeEnum.NODE_LIST)
        this.container.setAttribute(DATA_SUBTYPE, "u")
    }

    append2FirstItem(div: HTMLElement) {
        const dot = this.container.firstElementChild;
        if (!dot) {
            this.append(div);
        } else {
            div.removeAttribute(DATA_NODE_INDEX)
            dot.lastElementChild.insertAdjacentElement("beforebegin", div)
        }
        return this;
    }

    newList(div: HTMLElement) {
        const sub = new DomListBuilder();
        this.append(div, sub); // append 收 builder 自动 build（含 protyle-attr），无漏 build 风险
        return sub;
    }

    append(...divs: (HTMLElement | DomBuilder)[]) {
        const els = divs.map(d => buildDOM(d));
        els.forEach(el => el.removeAttribute(DATA_NODE_INDEX))
        const l = document.createElement("div") as HTMLDivElement;
        l.setAttribute("data-marker", "*")
        l.setAttribute(DATA_SUBTYPE, "u");
        l.setAttribute(DATA_NODE_ID, NewNodeID())
        l.setAttribute(DATA_TYPE, BlockNodeEnum.NODE_LIST_ITEM)
        l.classList.add("li")
        l.appendChild(newListUDot());
        els.forEach(el => l.appendChild(el))
        l.appendChild(newAttr());
        this.container.append(l);
        return this;
    }
}

export async function getSpans(divs: HTMLElement[], docTracer?: DocTracer) {
    const spans = [];
    if (docTracer) {
        spans.push(...divs
            .map(div => docTracer.match(div.textContent))
            .flat()
            .map(doc => {
                const s = document.createElement("span") as HTMLElement;
                s.setAttribute(DATA_TYPE, "block-ref")
                s.setAttribute(DATA_SUBTYPE, "d")
                s.setAttribute(DATA_ID, doc.id)
                s.textContent = doc.content;
                return s;
            })
        )
    }
    spans.push(...await cloneRefSpans(divs, false));
    const map = new Map<string, HTMLElement>();
    spans.forEach(s => {
        if (s?.getAttribute) {
            map.set(s.getAttribute(DATA_ID), s)
        }
    })
    return [...map.values()];
}

export async function cloneRefSpans(divs: HTMLElement[], turn2lnk = true) {
    const names = divs.map(div => [...div.querySelectorAll(`span[data-type="virtual-block-ref"]`)].map(i => i.textContent)).flat();
    const spans = divs.map(div => {
        return [...div.querySelectorAll(`span[data-type="block-ref"]`)].map(i => {
            const trim = i.textContent.trim()
            if (trim == "*" || trim == "@" || trim == "+" || trim == "&") return;
            // ref -> lnk
            const s = i.cloneNode(true);
            if (turn2lnk) {
                i.setAttribute(DATA_TYPE, "a");
                i.removeAttribute(DATA_SUBTYPE);
                const id = i.getAttribute(DATA_ID);
                i.removeAttribute(DATA_ID);
                i.setAttribute("data-href", `siyuan://blocks/${id}`);
            }
            return s as HTMLElement;
        })
    }).flat();
    if (names?.length > 0) {
        const cs = names.map(n => `"${n}"`).join(",")
        const s = await siyuan
            .sql(`select id,content from blocks where type='d' and content in (${cs})`)
            .then(rows => {
                return rows.map(row => {
                    const span = document.createElement("span") as HTMLElement;
                    span.textContent = row.content
                    span.setAttribute(DATA_TYPE, BLOCK_REF);
                    span.setAttribute(DATA_SUBTYPE, "d");
                    span.setAttribute(DATA_ID, row.id);
                    return span;
                })
            });
        spans.push(...s);
    }
    return spans;
}

export class DomSuperBlockBuilder extends DomBuilder {
    /** layout 语义按思源原生（与直觉相反，2026-08-24 实测 computed style 铁证）：
     * "row"=行布局→flex-direction:column 垂直堆叠；"col"=列布局→flex-direction:row 左右并排。
     * 要「左右两栏、栏内垂直多块」= 外层 "col" + 内层 "row"。 */
    constructor(layout: "row" | "col" = "row") {
        super()
        this.container.classList.add("sb")
        this.container.setAttribute(DATA_TYPE, BlockNodeEnum.NODE_SUPER_BLOCK)
        this.container.setAttribute("data-sb-layout", layout)
    }
}

/** 段落块 builder：text 纯文本落块（不解析 markdown，要解析用 md2Divs）；无参 = 空段块占位 */
export class DomParaBuilder extends DomBuilder {
    constructor(text = "") {
        super()
        this.container.classList.add("p")
        this.container.setAttribute(DATA_TYPE, BlockNodeEnum.NODE_PARAGRAPH)
        const div = this.container.appendChild(document.createElement("div"))
        div.setAttribute(CONTENT_EDITABLE, "true")
        div.setAttribute("spellcheck", "false")
        div.textContent = text
    }
}

/**
 * 思源 markdown 方言的行内 HTML 标签族 → configured Lute 认识的 span data-type 形态。
 * 思源自己的 markdown 通道（SQL blocks.markdown 列 / createDocWithMd / updateBlock）把
 * 下划线序列化为 <u>、上下标 <sub>/<sup>、键盘 <kbd>、带色高亮 <mark style>——这套
 * HTML 方言标签在 NewConfiguredLute 的 ProtyleWYSIWYG 旗标下被 Lute 当纯文本转义输出
 * （&lt;u&gt; 字面），下游 innerHTML/事务 HTML 通道照字面落盘=文档里裸显 HTML 标签
 * （09-21 recite □A：对比文档左栏原文下划线裸显 <u>，bear 实报）。实测 span data-type
 * 形态 Lute 正确保留（嵌套还合并复合词表 data-type="strong u"），故 md→DOM 解析前
 * 把方言标签转成 span 形态（属性原样透传，语义等价）。裸 Lute（旗标全关）走标签透传
 * 不炸，但插件统一走 configured——预处理对本函数全部消费方纯改进。
 */
export function siyuanMdInlineHtmlToSpan(md: string): string {
    return md
        .replace(/<(u|sub|sup|kbd|mark)((?:\s[^>]*)?)>/g, '<span data-type="$1"$2>')
        .replace(/<\/(u|sub|sup|kbd|mark)>/g, "</span>");
}

/** 行内 IAL 体（{: k="v" …}，==x== 紧贴闭合定界的携带形态）保守属性形态——形态不符
 *  （未引值/含尖括号/非 k=v 列表）整处不转保持字面（宁字面勿坏——防把任意文本注入
 *  span 属性位）。Lute 对合法体（含 id）逐属性原样透传，此处同款。 */
const MARK_IAL_ATTRS = /^[A-Za-z_][\w-]*(?:="[^"<>]*"|='[^'<>]*')?(?:\s+[A-Za-z_][\w-]*(?:="[^"<>]*"|='[^'<>]*')?)*$/;
/** ==x== 配对 → span data-type="mark"（仿 Lute SetMark(true) 实测判定，6809 探针取证）：
 *  开/闭定界符必须恰两连等号（lookbehind/lookahead 挡 === 家族与 setext 标题）；开定界
 *  后非空白+闭定界前非空白（flanking——空格隔断不转）；内容可含单 = 不可含 ==（`a=b`
 *  转而 `a===b` 不转）；内容可为任意非 = 字符（含换行/嵌套 **粗**——嵌套由 Md2BlockDOM
 *  二次解析成复合词表 span，与旗标输出一致）；紧贴闭合定界的行内 IAL {: …} 一并吞并。 */
const MARK_PAIR = /(?<!=)==(?=\S)((?:[^=]|=(?!=))+?)(?<=[^\s=])==(?!=)(\{:[^}]*\})?/g;

function replaceMarkPairs(seg: string): string {
    return seg.replace(MARK_PAIR, (whole: string, content: string, ial?: string) => {
        if (ial) {
            const body = ial.slice(2, -1).trim();
            if (!MARK_IAL_ATTRS.test(body)) return whole;
            return `<span data-type="mark" ${body}>${content}</span>`;
        }
        return `<span data-type="mark">${content}</span>`;
    });
}

/**
 * 思源 ==高亮== 行内语法 → configured Lute 认识的 span data-type="mark" 形态
 * （□F，2026-09-21 recite）。内核把高亮序列化为 ==文本==（纯）/==文本=={: style="…"}
 * （带色，行内 IAL 形态）——NewConfiguredLute 未开 SetMark 旗标（官方 setLute 有；
 * anno 家族共享面不动旗标，45169bf5 同判例），Md2BlockDOM 把 ==x== 落字面文本 →
 * 出卷照抄块/对比左栏/NoteBox 混排通道裸显 ==x==（与 <u> 同族但通道不同：语法旗标
 * 缺席 vs HTML 方言转义）。产物形态仿 SetMark(true) 实测输出：span data-type="mark"
 * +IAL 属性透传。码区守卫：围栏代码块（```/~~~ 行对，未闭合吞到底）与行内码段
 * （等长反引号串配对）内的 == 是字面不转（Lute 同判）；跨码段的 ==配对保守不转。
 * 输入已是 span 形态无 == 配对，幂等。
 */
export function siyuanMdMarkSyntaxToSpan(md: string): string {
    if (!md || !md.includes("==")) return md;
    const n = md.length;
    const inCode = new Uint8Array(n); // 1=码区（围栏/行内码段），== 字面不动
    // ① 围栏代码块：开栏行（行首 ≤3 空格 + ```/~~~ 串）到同字符等长闭合行（独占行）；
    // 未闭合=吞到串尾（Lute 同判）
    let fence: { ch: string; len: number; start: number } | null = null;
    for (let pos = 0, lineStart = 0; pos <= n; pos++) {
        if (pos < n && md[pos] !== "\n") continue;
        const line = md.slice(lineStart, pos);
        const open = line.match(/^\s{0,3}(`{3,}|~{3,})/);
        if (!fence) {
            if (open) fence = { ch: open[1][0], len: open[1].length, start: lineStart };
        } else {
            const close = line.match(/^\s{0,3}(`{3,}|~{3,})\s*$/);
            if (close && close[1][0] === fence.ch && close[1].length >= fence.len) {
                for (let k = fence.start; k < pos; k++) inCode[k] = 1;
                fence = null;
            }
        }
        lineStart = pos + 1;
    }
    if (fence) for (let k = fence.start; k < n; k++) inCode[k] = 1;
    // ② 行内码段（围栏外）：反引号串只与等长反引号串闭合（CommonMark 同款），无闭合=字面
    for (let p = 0; p < n; p++) {
        if (inCode[p] || md[p] !== "`") continue;
        let openLen = 0;
        while (p + openLen < n && md[p + openLen] === "`") openLen++;
        let q = p + openLen, closeAt = -1;
        while (q < n) {
            if (md[q] === "`") {
                let run = 0;
                while (q + run < n && md[q + run] === "`") run++;
                if (run === openLen) { closeAt = q; break; }
                q += run;
            } else q++;
        }
        if (closeAt >= 0) {
            for (let k = p; k < closeAt + openLen; k++) inCode[k] = 1;
            p = closeAt + openLen - 1; // for 自增到闭合串后
        } else p += openLen - 1;
    }
    // ③ 非码区逐段做 ==配对→span 转换，码区字符原样直通
    let out = "";
    let segStart = -1;
    for (let p = 0; p < n; p++) {
        if (!inCode[p]) {
            if (segStart < 0) segStart = p;
        } else {
            if (segStart >= 0) { out += replaceMarkPairs(md.slice(segStart, p)); segStart = -1; }
            out += md[p];
        }
    }
    if (segStart >= 0) out += replaceMarkPairs(md.slice(segStart, n));
    return out;
}

/**
 * markdown → protyle 块 DOM 数组（Md2BlockDOM 是 protyle 粘贴同款官方转换通道）。
 * 产物统一换新 data-node-id（Md2BlockDOM 生成的 id 不保证唯一语义，显式换掉防撞号）；
 * attrs 挂首块（custom-* 属性直接作为 DOM 属性，内核落库时转为 IAL）。
 * 软换行多行（"行1\n行2"）产出单块（与 kramdown 一段一块语义一致）。
 */
export function md2Divs(md: string, attrs?: AttrType, lute?: Lute): HTMLElement[] {
    if (!md?.trim()) return [];
    if (!lute) lute = NewConfiguredLute();
    const host = document.createElement("div");
    // 预处理族两步（□A HTML 方言标签 + □F ==高亮== 语法）：进 Lute 前把思源 markdown
    // 通道的行内方言归一到 configured 旗标认识的 span data-type 形态，一处修全家
    host.innerHTML = lute.Md2BlockDOM(siyuanMdInlineHtmlToSpan(siyuanMdMarkSyntaxToSpan(md)));
    const divs = [...host.children].filter((el): el is HTMLElement => el instanceof HTMLElement);
    divs.forEach((d, i) => {
        d.setAttribute(DATA_NODE_ID, NewNodeID());
        if (i === 0 && attrs) Object.entries(attrs).forEach(([k, v]) => d.setAttribute(k, v));
    });
    return divs;
}

export class AvBuilder extends DomBuilder {
    private _avID = NewNodeID();
    public get avID() {
        return this._avID;
    }
    private _db: RenderAttributeView;
    public get db(): RenderAttributeView {
        return this._db;
    }
    private avContainer = document.createElement("div") as HTMLElement;
    async init() {
        this._db = await siyuan.renderAttributeView(this.avID)
        this.container.setAttribute(DATA_AV_ID, this.avID)
        this.addHeader();
        this.addScroll();
    }
    constructor() {
        super()
        this.container.classList.add("av")
        this.container.setAttribute(DATA_TYPE, BlockNodeEnum.NODE_ATTRIBUTE_VIEW)
        this.container.setAttribute(CONTENT_EDITABLE, "false")
        this.container.setAttribute("data-av-type", "table")
        this.container.setAttribute("data-page-size", "50")
        this.container.setAttribute("data-render", "true")
        this.container.appendChild(this.avContainer);
        this.avContainer.classList.add("av__container")
        this.avContainer.style.setProperty("--av-background", "var(--b3-theme-background)");
    }
    private addScroll() {
        const pkID = this.db.view.columns[0].id
        const selectID = this.db.view.columns[1].id
        const scroll = this.avContainer.appendChild(document.createElement("div"));
        scroll.outerHTML = `<div class="av__scroll">
        <div class="av__body">
            <div class="av__row av__row--header"><div class="av__firstcol av__colsticky"><svg><use xlink:href="#iconUncheck"></use></svg></div><div class="av__cell av__cell--header" data-col-id="${pkID}" draggable="true" data-icon="" data-dtype="block" data-wrap="false" data-pin="false" style="width: 200px;">
    <svg class="av__cellheadericon"><use xlink:href="#iconKey"></use></svg>
    <span class="av__celltext fn__flex-1">主键</span>
    
    <div class="av__widthdrag"></div>
</div><div class="av__cell av__cell--header" data-col-id="${selectID}" draggable="true" data-icon="" data-dtype="select" data-wrap="false" data-pin="false" style="width: 200px;">
    <svg class="av__cellheadericon"><use xlink:href="#iconListItem"></use></svg>
    <span class="av__celltext fn__flex-1">单选</span>
    
    <div class="av__widthdrag"></div>
</div><div class="block__icons" style="min-height: auto">
    <div class="block__icon block__icon--show" data-type="av-header-more"><svg><use xlink:href="#iconMore"></use></svg></div>
    <div class="fn__space"></div>
    <div class="block__icon block__icon--show ariaLabel" aria-label="添加列" data-type="av-header-add" data-position="4bottom"><svg><use xlink:href="#iconAdd"></use></svg></div>
</div>
</div>
            <div class="av__row--util">
                <div class="av__colsticky">
                    <button class="b3-button b3-button--outline tomato-button" data-type="av-add-bottom">
                        <svg><use xlink:href="#iconAdd"></use></svg>
                        添加
                    </button>
                    <span class="fn__space"></span>
                    <button class="b3-button b3-button--outline fn__none">
                        <svg data-type="av-load-more"><use xlink:href="#iconArrowDown"></use></svg>
                        <span data-type="av-load-more">
                            加载更多
                        </span>
                        <svg data-type="set-page-size" data-size="50"><use xlink:href="#iconMore"></use></svg>
                    </button>
                </div>
            </div>
            <div class="av__row--footer"><div class="av__calc" data-col-id="${pkID}" data-dtype="block" data-operator="" style="width: 200px"><svg><use xlink:href="#iconDown"></use></svg>计算</div><div class="av__calc" data-col-id="${selectID}" data-dtype="select" data-operator="" style="width: 200px"><svg><use xlink:href="#iconDown"></use></svg>计算</div></div>
        </div>
    </div>`.replaceAll("\n", "");
    }
    private addHeader() {
        const header = this.avContainer.appendChild(document.createElement("div"));
        header.outerHTML = `<div class="av__header">
        <div class="fn__flex av__views">
            <div class="layout-tab-bar fn__flex">
                <div data-id="${this.db.view.id}" class="item item--focus">
    <svg class="item__graphic"><use xlink:href="#iconTable"></use></svg>
    <span class="item__text">${this.db.view.name}</span>
</div>
            </div>
            <div class="fn__space"></div>
            <span data-type="av-add" class="block__icon ariaLabel" data-position="8bottom" aria-label="添加视图">
                <svg><use xlink:href="#iconAdd"></use></svg>
            </span>
            <div class="fn__flex-1"></div>
            <div class="fn__space"></div>
            <span data-type="av-switcher" class="block__icon">
                <svg><use xlink:href="#iconDown"></use></svg>
                <span class="fn__space"></span>
                <small>1</small>
            </span>
            <div class="fn__space"></div>
            <span data-type="av-filter" class="block__icon">
                <svg><use xlink:href="#iconFilter"></use></svg>
            </span>
            <div class="fn__space"></div>
            <span data-type="av-sort" class="block__icon">
                <svg><use xlink:href="#iconSort"></use></svg>
            </span>
            <div class="fn__space"></div>
            <span data-type="av-search-icon" class="block__icon">
                <svg><use xlink:href="#iconSearch"></use></svg>
            </span>
            <div style="position: relative" class="fn__flex">
                <input style="width:0;padding-left: 0;padding-right: 0;" data-type="av-search" class="b3-text-field b3-text-field--text" placeholder="搜索" data-old-padding-right="0px"><svg class="b3-form__icon-clear ariaLabel fn__none" aria-label="清空" style="height:28px;width:1em">
<use xlink:href="#iconCloseRound"></use></svg>
            </div>
            <div class="fn__space"></div>
            <span data-type="av-more" class="block__icon">
                <svg><use xlink:href="#iconMore"></use></svg>
            </span>
            <div class="fn__space"></div>
            <span data-type="av-add-more" class="block__icon ariaLabel" data-position="8bottom" aria-label="添加条目">
                <svg><use xlink:href="#iconAdd"></use></svg>
            </span>
            <div class="fn__space"></div>
        </div>
        <div contenteditable="true" spellcheck="false" class="av__title" data-title="" data-tip="标题"></div>
        <div class="av__counter fn__none"></div>
    </div>`.replaceAll("\n", "");
    }
    build() {
        const cursor = this.avContainer.appendChild(document.createElement("div"));
        cursor.innerHTML = '<div class="av__cursor" contenteditable="true">​</div>'
        return super.build();
    }
}

export function text2divs(text: string, lute?: Lute) {
    if (!lute) lute = NewConfiguredLute();
    return text
        .split("\n")
        .map(i => i.trim())
        .filter(i => !!i)
        .map(i => dom2div(lute.Md2BlockDOM(i)))
}
