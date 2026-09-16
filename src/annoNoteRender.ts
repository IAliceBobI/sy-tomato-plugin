// □8 批注卡块渲染器——anno-note（陆杰 09-16 反馈：批注制闪卡后复习界面只有原文没有批注）。
// 注册面同 anno-chat：plugin.customBlockRenders["anno-note"] = { render({element, content}) }；
// element=DIV.custom-block__content（块 id 在宿主 [data-node-id]）；旧内核不注册走官方 fallback。
// 卡面：身份行（批注家族 #iconQuote+「批注」+建卡时间）→ [复习宿主限定] 来源行（现查，孤儿静默）
// + 原文摘录（anchorSnapshot 快照，超长 CSS 折叠，rp 同构）→ 批注正文 → replies 时间线（□9）
// →「回原文」钮（先关后跳=libs/cardNav）。
// 刷新语义：先画建卡快照（同步、孤儿安全）→ 异步现查宿主块属性回填正文/replies（编辑被删/
// 宿主被删=孤儿保快照）；anchor 摘录恒快照（rp 同构拍板）。
import { getTomatoPluginInstance, siyuan } from "./libs/utils";
import { debugLog } from "./libs/logUtils";
import { tomatoI18n } from "./tomatoI18n";
import { ANNO_NOTE_BLOCK_TYPE, parseAnnoNoteContent, type AnnoNoteBlockData } from "./libs/annoNoteBlock";
import { ANNOTATIONS_ATTR, findAnnotation } from "./libs/annotationsAttr";
import { annoTextToHtml } from "./libs/annoKramdown";
import { fmtAnnoTime } from "./libs/annoPanelList";
import { cardHostName, goOriginCloseFirst } from "./libs/cardNav";
import { fillSourceRow } from "./libs/sourceQuery";

/** 最小注册面接口（siyuan 1.2.5 类型声明无 customBlockRenders，结构化窄化避免 as any 满天飞） */
export interface CustomBlockPlugin {
    customBlockRenders?: Record<string, unknown>;
}

/** 特性检测：3.8.3+ 且渲染器已注册（挂卡链 doSave 判据——旧内核回落直挂原文块旧行为） */
export function supportsAnnoNoteBlock(): boolean {
    try {
        const renders = (getTomatoPluginInstance() as CustomBlockPlugin | null)?.customBlockRenders;
        return !!renders && typeof renders[ANNO_NOTE_BLOCK_TYPE] === "object";
    } catch {
        return false;
    }
}

export function registerAnnoNoteRender(plugin: CustomBlockPlugin): void {
    if (!plugin.customBlockRenders) return; // <3.8.3：不注册，官方 fallback 兜底
    plugin.customBlockRenders[ANNO_NOTE_BLOCK_TYPE] = {
        render: ({ element, content }: { element: HTMLElement; content: string }) => {
            renderCard(element, content);
        },
    };
}

/** 快照正文+时间线装配（首画与现查回填共用；回填换 innerHTML/重建即刷新） */
function renderBodyParts(textEl: HTMLElement, repliesEl: HTMLElement, annoText: string, replies: { text: string; time: number }[]): void {
    textEl.innerHTML = annoTextToHtml(annoText);
    repliesEl.textContent = "";
    for (const r of replies) {
        const row = document.createElement("div");
        row.className = "tomato-annonote-card__reply";
        const time = document.createElement("span");
        time.className = "tomato-annonote-card__rtime";
        time.textContent = fmtAnnoTime(r.time);
        const text = document.createElement("div");
        text.className = "tomato-annonote-card__rtext";
        text.innerHTML = annoTextToHtml(r.text);
        row.append(time, text);
        repliesEl.append(row);
    }
    repliesEl.hidden = replies.length === 0;
}

function renderCard(element: HTMLElement, content: string): void {
    const data = parseAnnoNoteContent(content);
    const host = cardHostName(element);
    debugLog("annonote_card", `ok=${!!data} host=${host}`, "anno");
    if (!data) {
        const tip = document.createElement("div");
        tip.className = "tomato-annonote-card__broken";
        tip.textContent = tomatoI18n.卡面内容无法解析;
        element.append(tip);
        return;
    }
    const card = document.createElement("div");
    card.className = "tomato-annonote-card";
    // 现查刷新寻址标（vision P1：追加/编辑后 Annotations 侧 refreshAnnoNoteCards 按 annoID
    // 就地更新已渲染卡面，免整页 reload 才同步）
    card.dataset.annoId = data.annoID;
    card.dataset.hostId = data.hostID;

    // ---- 身份行：批注家族图标 + 标题 + 建卡时间（恒快照，现查回填不刷）----
    // svg 图标一律 innerHTML 注入（字面冒号属性不进命名空间=图标不画，rpcard/annochat 同病同修）
    const head = document.createElement("div");
    head.className = "tomato-annonote-card__head";
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.innerHTML = '<use xlink:href="#iconQuote"></use>';
    const title = document.createElement("span");
    title.className = "tomato-annonote-card__title";
    title.textContent = tomatoI18n.批注;
    const meta = document.createElement("span");
    meta.className = "tomato-annonote-card__meta";
    meta.textContent = fmtAnnoTime(data.ts);
    head.append(icon, title, meta);
    card.append(head);

    // ---- 来源行+原文摘录：仅复习界面宿主（编辑器宿主卡就在原文下方，重复是噪音；rp 同构）。
    // 来源行=现查回填（改名跟最新、孤儿静默）；摘录=anchorSnapshot 快照，超长 CSS 折叠
    if (host === "review") {
        const source = document.createElement("div");
        source.className = "tomato-annonote-card__source";
        source.hidden = true; // 现查到才显，空行不占高
        card.append(source);
        void fillSourceRow(source, data.hostID);

        if (data.anchorSnapshot.replace(/^[\s\u200b]+|[\s\u200b]+$/g, "")) {
            const body = document.createElement("div");
            body.className = "tomato-annonote-card__excerpt";
            body.textContent = data.anchorSnapshot;
            const more = document.createElement("button");
            more.className = "tomato-annonote-card__more";
            more.hidden = true; // 溢出检测通过才显（rAF 后测 scrollHeight）
            const moreLabel = document.createElement("span");
            moreLabel.textContent = tomatoI18n.展开全文;
            more.append(moreLabel);
            more.addEventListener("click", () => {
                const open = !body.classList.contains("is-open");
                body.classList.toggle("is-open", open);
                moreLabel.textContent = open ? tomatoI18n.收起 : tomatoI18n.展开全文;
            });
            card.append(body, more);
            requestAnimationFrame(() => {
                if (body.scrollHeight > body.clientHeight + 4) more.hidden = false;
            });
        }
    }

    // ---- 批注正文 + replies 时间线（快照先行，下方现查回填覆盖）----
    const textEl = document.createElement("div");
    textEl.className = "tomato-annonote-card__text";
    const repliesEl = document.createElement("div");
    repliesEl.className = "tomato-annonote-card__replies";
    renderBodyParts(textEl, repliesEl, data.annoText, data.replies);
    card.append(textEl, repliesEl);

    // ---- 回原文：先关复习界面（官方正门）后跳被批注源块 ----
    const go = document.createElement("button");
    go.className = "tomato-annonote-card__go";
    go.setAttribute("aria-label", tomatoI18n.回原文);
    const gIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    gIcon.innerHTML = '<use xlink:href="#iconForward"></use>';
    go.append(gIcon, document.createTextNode(tomatoI18n.回原文));
    go.addEventListener("click", () => void goOriginCloseFirst(go, data.hostID));
    card.append(go);
    element.append(card);

    // ---- 异步现查回填：批注后来被编辑/追加了，卡面正文与时间线跟最新（两宿主都做；
    //  宿主块或条目已删=孤儿，静默保快照）----
    void refreshFromLive(textEl, repliesEl, data);
}

async function refreshFromLive(textEl: HTMLElement, repliesEl: HTMLElement, data: AnnoNoteBlockData): Promise<void> {
    if (!data.annoID || !data.hostID) return;
    try {
        const attrs = await siyuan.getBlockAttrs(data.hostID);
        const entry = findAnnotation(attrs?.[ANNOTATIONS_ATTR], data.annoID);
        if (!entry || !textEl.isConnected) return; // 孤儿/渲染宿主已被替换（dispose 后晚归）
        renderBodyParts(textEl, repliesEl, entry.text, entry.replies ?? []);
        debugLog("annonote_card", `refresh anno=${data.annoID} replies=${entry.replies?.length ?? 0}`, "anno");
    } catch { /* 现查失败保快照 */ }
}

/** 批注被追加/编辑后就地刷新已渲染的 anno-note 卡面（正文+replies 跟最新；无卡=零开销）。
 *  Annotations 写链成功后调用；孤儿卡 refreshFromLive 内部自守（findAnnotation 未命中不动） */
export function refreshAnnoNoteCards(annoID: string): void {
    if (!annoID) return;
    document.querySelectorAll(`.tomato-annonote-card[data-anno-id="${annoID}"]`).forEach((cardEl) => {
        const card = cardEl as HTMLElement;
        const textEl = card.querySelector<HTMLElement>(".tomato-annonote-card__text");
        const repliesEl = card.querySelector<HTMLElement>(".tomato-annonote-card__replies");
        if (!textEl || !repliesEl) return;
        void refreshFromLive(textEl, repliesEl, {
            v: 1, annoID, hostID: card.dataset.hostId ?? "", annoText: "", anchorSnapshot: "", replies: [], ts: 0,
        });
    });
}
