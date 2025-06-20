import { Lute } from "siyuan";
import { BLOCK_REF, BlockNodeEnum, CONTENT_EDITABLE, DATA_AV_ID, DATA_ID, DATA_NODE_ID, DATA_NODE_INDEX, DATA_SUBTYPE, DATA_TYPE, WEB_ZERO_SPACE } from "./gconst";
import { joinArray, dom2div, NewLute, NewNodeID, siyuan, cloneCleanDiv, setAttribute } from "./utils";
import { DocTracer } from "./docUtils";

export function domHdeading(id: string, text: string, subtype = "h1") {
    if (!id) id = NewNodeID();
    if (!text) text = "<<<<nodata>>>>";
    return `<div data-subtype="${subtype}" data-node-id="${id}" data-type="NodeHeading" class="${subtype}">
<div contenteditable="true" spellcheck="false">${text}</div>
<div class="protyle-attr" contenteditable="false">​</div>
</div>`;
}

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

export abstract class DomBuilder {
    // can be override.
    append(...div: HTMLElement[]) {
        div.forEach(d => this.container.appendChild(d))
        return this;
    }
    build() {
        this.container.appendChild(newAttr());
        return this.container;
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
        this.append(div, sub.container); // 需要build后，有了protyle-attr才能加入，这里为了方便就忽略了。
        return sub;
    }

    append(...divs: HTMLElement[]) {
        divs.forEach(div => div.removeAttribute(DATA_NODE_INDEX))
        const l = document.createElement("div") as HTMLDivElement;
        l.setAttribute("data-marker", "*")
        l.setAttribute(DATA_SUBTYPE, "u");
        l.setAttribute(DATA_NODE_ID, NewNodeID())
        l.setAttribute(DATA_TYPE, BlockNodeEnum.NODE_LIST_ITEM)
        l.classList.add("li")
        l.appendChild(newListUDot());
        divs.forEach(div => l.appendChild(div))
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
    spans.push(...await cloneRefSpans(divs));
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
    constructor(layout: "row" | "col" = "row") {
        super()
        this.container.classList.add("sb")
        this.container.setAttribute(DATA_TYPE, BlockNodeEnum.NODE_SUPER_BLOCK)
        this.container.setAttribute("data-sb-layout", layout)
    }
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
                    <button class="b3-button b3-button--outline" data-type="av-add-bottom">
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
    if (!lute) lute = NewLute();
    return text
        .split("\n")
        .map(i => i.trim())
        .filter(i => !!i)
        .map(i => dom2div(lute.Md2BlockDOM(i)))
}
