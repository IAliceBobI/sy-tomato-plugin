// □8 批注卡块数据层——批注挂闪卡的 custom 块（anno-chat 同族：fence ;;;sy-tomato-plugin/anno-note、
// content=单行 JSON）。建卡动机（陆杰 09-16 反馈）：旧链 addRiffCards(原文块) 后官方复习界面
// 卡面只有原文、批注藏在块属性里不可见。
// 快照语义：annoText/replies=建卡时快照；渲染层先画快照（同步、孤儿安全）再异步现查回填
// （宿主块属性 findAnnotation(annoID)），宿主/条目已删=孤儿保快照；anchorSnapshot 恒快照（rp 同构）。
// 内核契约同 anno-chat：content 禁裸 ;;; 行（JSON.stringify 单行天然满足）、‸ 洗除防意外。
import type { AnnoReply } from "./annotationsAttr";

export const ANNO_NOTE_BLOCK_TYPE = "anno-note";
export const ANNO_NOTE_FENCE = ";;;sy-tomato-plugin/anno-note";

export interface AnnoNoteBlockData {
    v: 1;
    /** 批注条目 id（现查回填锚点） */
    annoID: string;
    /** 被批注源块 id（来源行现查 + 回原文跳转目标；插块锚点=源块正下方） */
    hostID: string;
    /** 批注正文快照（建卡时；kramdown，卡面 annoTextToHtml 渲染） */
    annoText: string;
    /** 锚文本快照（选区级=sel.txt；块级=首宿主块文本；clip 500 码点） */
    anchorSnapshot: string;
    /** 追加时间线快照（□9；新建链建卡时恒空） */
    replies: AnnoReply[];
    /** 建卡时刻（ms，身份行时间） */
    ts: number;
}

/** content 不得含裸 ;;; 行（中途出现即静默截断）——洗正文里的围栏样式字符以防意外 */
const sanitize = (s: string): string => s.replaceAll("‸", "");

export function buildAnnoNoteContent(data: AnnoNoteBlockData): string {
    return JSON.stringify({
        v: 1,
        annoID: data.annoID,
        hostID: data.hostID,
        annoText: sanitize(data.annoText),
        anchorSnapshot: sanitize(data.anchorSnapshot),
        replies: data.replies.map((r) => ({ text: sanitize(r.text), time: r.time })),
        ts: data.ts,
    });
}

/** 插块用围栏 markdown：围栏头+单行 content，无闭合 ;;;（md 通道内核落盘自动补；
 *  新块 id 从 insert 响应 doOperations[0].id 取，anno-chat/rpcard 同款） */
export function buildAnnoNoteBlockMD(content: string): string {
    return `${ANNO_NOTE_FENCE}\n${content}`;
}

/** 容错解析：坏 JSON/版本不符/必填缺失 → null（渲染层显占位）；replies 逐条净化、缺失容忍空数组 */
export function parseAnnoNoteContent(content: string): AnnoNoteBlockData | null {
    let raw: unknown;
    try {
        raw = JSON.parse(content);
    } catch {
        return null;
    }
    if (typeof raw !== "object" || raw == null) return null;
    const o = raw as Record<string, unknown>;
    if (o.v !== 1) return null;
    if (typeof o.annoID !== "string" || typeof o.hostID !== "string"
        || typeof o.annoText !== "string" || typeof o.anchorSnapshot !== "string") return null;
    const replies: AnnoReply[] = [];
    if (Array.isArray(o.replies)) {
        for (const item of o.replies) {
            if (typeof item !== "object" || item == null) continue;
            const it = item as Record<string, unknown>;
            if (typeof it.text !== "string" || it.text.length === 0) continue;
            replies.push({ text: it.text, time: typeof it.time === "number" && Number.isFinite(it.time) ? it.time : 0 });
        }
    }
    return {
        v: 1,
        annoID: o.annoID,
        hostID: o.hostID,
        annoText: o.annoText,
        anchorSnapshot: o.anchorSnapshot,
        replies,
        ts: typeof o.ts === "number" && Number.isFinite(o.ts) ? o.ts : 0,
    };
}

export const ANNO_NOTE_ANCHOR_CLIP = 500;

/** 锚快照截断（跨大块防 content 膨胀）：按码点截 500 + 省略号；首尾 ZWSP/空白先剥
 *  （空段块 textContent=\u200b，String.trim 剥不掉——不剥则卡面渲染「看似空白的摘录框」） */
export function clipAnnoNoteAnchor(txt: string): string {
    const stripped = txt.replace(/^[\s\u200b]+|[\s\u200b]+$/g, "");
    const cps = [...stripped];
    return cps.length <= ANNO_NOTE_ANCHOR_CLIP ? stripped : cps.slice(0, ANNO_NOTE_ANCHOR_CLIP).join("") + "…";
}
