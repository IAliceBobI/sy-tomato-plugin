// □1（rpcard 战役 2026-09-08）阅读点制卡 custom 卡——reading-point 渲染器。
// 注册面同 anno-chat：plugin.customBlockRenders["reading-point"] = { render({element, content}) }；
// element=DIV.custom-block__content（块 id 在宿主 [data-node-id]，内核已做编辑器事件隔离）；
// 旧内核（<3.8.3）无此注册面 → 不注册，官方 renderFallback <pre> 显围栏原文兜底。
// 卡面（设计拍板=老版原样）：身份行（阅读点家族 #iconBookmark+相对时间）+ excerpt 设点快照
// （超长 CSS 折叠可展开）+「回原文继续读」按钮。
// 按钮链=先关后跳：复习界面宿主 → 官方正门 window.siyuan.dialogs.find(data-key=dialog-opencard)
// .destroy()（内核 openCardByData 重入关旧界面即此调用，destroy 回收 editor/焦点/登记表）；
// 编辑器宿主 → 仅聚焦原块。关闭失效回落=复习界面保留（跳转照常）。
// riff 3.9.0 v2 重写在途：升 3.9 前重验 addRiffCards/review 挂卡链（memory 预警）。
import { getTomatoPluginInstance } from "./libs/utils";
import { debugLog } from "./libs/logUtils";
import { tomatoI18n } from "./tomatoI18n";
import { RPCARD_BLOCK_TYPE } from "./libs/gconst";
import { buildSourceText, parseRPCardContent, relativeTime, splitHPath, unescapeBlockText, type RPCardSource } from "./libs/readingPointCore";
import { OpenSyFile2 } from "./libs/navUtils";
import { siyuan } from "./libs/siyuanApi";

/** 最小注册面接口（siyuan 1.2.5 类型声明无 customBlockRenders，结构化窄化避免 as any 满天飞） */
export interface CustomBlockPlugin {
    customBlockRenders?: Record<string, unknown>;
}

/** 特性检测：3.8.3+ 且渲染器已注册（<3.8.3 设点链回落原文块直入卡，ai-grade 同款模式） */
export function supportsReadingPointBlock(): boolean {
    try {
        const renders = (getTomatoPluginInstance() as CustomBlockPlugin | null)?.customBlockRenders;
        return !!renders && typeof renders[RPCARD_BLOCK_TYPE] === "object";
    } catch {
        return false;
    }
}

export function registerReadingPointCardRender(plugin: CustomBlockPlugin): void {
    if (!plugin.customBlockRenders) return; // <3.8.3：不注册，官方 fallback 兜底
    plugin.customBlockRenders[RPCARD_BLOCK_TYPE] = {
        render: ({ element, content }: { element: HTMLElement; content: string }) => {
            renderCard(element, content);
        },
    };
}

/** 复习界面 Dialog 登记项（结构化窄化：destroy/element 均为内核公开面，openCardByData 同款） */
interface ReviewDialog {
    destroy(): void;
    element: HTMLElement;
}

/** 官方正门关闭通道：window.siyuan.dialogs 里 data-key=dialog-opencard 且真包含本按钮的那个 */
function findReviewDialog(btn: HTMLElement): ReviewDialog | null {
    const dialogs = (window.siyuan as { dialogs?: ReviewDialog[] })?.dialogs ?? [];
    return dialogs.find((d) => d.element?.getAttribute("data-key") === "dialog-opencard" && d.element.contains(btn)) ?? null;
}

/** 渲染宿主名（Loki 打点用）：.card__main=复习界面（Dialog/页签两种宿主都有），否则=编辑器 */
function hostName(element: HTMLElement): string {
    return element.closest(".card__main") ? "review" : "editor";
}

function renderCard(element: HTMLElement, content: string): void {
    const data = parseRPCardContent(content);
    const host = hostName(element);
    debugLog("rp_card_render", `ok=${!!data} host=${host}`, "readpoint");
    if (!data) {
        const tip = document.createElement("div");
        tip.className = "tomato-rp-card__broken";
        tip.textContent = tomatoI18n.卡面内容无法解析;
        element.append(tip);
        return;
    }
    const card = document.createElement("div");
    card.className = "tomato-rp-card";

    // ---- 身份行：阅读点家族图标 + 标题 + 相对时间（设点时刻快照）----
    // svg 图标一律 innerHTML 注入：DOM API setAttribute("xlink:href") 建的是字面冒号名
    // 属性（非 xlink 命名空间），<use> 解析不到=图标占位不画（vision P1 实锤；内核模板
    // 走 innerHTML 由 parser 自动映射命名空间故无恙）
    const head = document.createElement("div");
    head.className = "tomato-rp-card__head";
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.innerHTML = '<use xlink:href="#iconBookmark"></use>';
    const title = document.createElement("span");
    title.className = "tomato-rp-card__title";
    title.textContent = tomatoI18n.阅读点;
    const meta = document.createElement("span");
    meta.className = "tomato-rp-card__meta";
    meta.textContent = tomatoI18n.阅读点时间(relativeTime(data.ts, new Date()));
    head.append(icon, title, meta);
    card.append(head);

    // ---- 来源行（2026-09-09 群反馈）：仅复习界面宿主——《文档》· 小节 · /路径全显示。
    // 编辑器宿主卡就在原文下方，标题是噪音故不渲染。现查回填（存量卡零迁移、改名跟最新），
    // 查空（孤儿卡）/失败=静默不显
    if (host === "review") {
        const source = document.createElement("div");
        source.className = "tomato-rp-card__source";
        source.hidden = true; // 现查到才显，空行不占高
        card.append(source);
        void fillSourceRow(source, data.origin);
    }

    // ---- excerpt 快照：设点时原文全文（超长折叠，溢出才显展开钮）----
    const body = document.createElement("div");
    body.className = "tomato-rp-card__excerpt";
    body.textContent = data.excerpt;
    const more = document.createElement("button");
    more.className = "tomato-rp-card__more";
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

    // ---- 回原文继续读：先关复习界面（官方正门）后跳原块 ----
    const go = document.createElement("button");
    go.className = "tomato-rp-card__go";
    go.setAttribute("aria-label", tomatoI18n.回原文继续读);
    const gIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    gIcon.innerHTML = '<use xlink:href="#iconForward"></use>';
    go.append(gIcon, document.createTextNode(tomatoI18n.回原文继续读));
    go.addEventListener("click", () => void goOrigin(go, data.origin));
    card.append(go);
    element.append(card);

    // 折叠溢出检测须在挂载后测（挂载前 scrollHeight 恒 0）
    requestAnimationFrame(() => {
        if (body.scrollHeight > body.clientHeight + 4) more.hidden = false;
    });
}

/** 先关后跳：复习界面宿主=官方正门 destroy（openCardByData 重入同款）；编辑器宿主=仅聚焦原块 */
async function goOrigin(btn: HTMLElement, origin: string): Promise<void> {
    const plugin = getTomatoPluginInstance();
    if (!plugin || !origin) return;
    let closed = false;
    if (btn.closest(".card__main")) {
        const dialog = findReviewDialog(btn);
        if (dialog) {
            dialog.destroy();
            closed = true;
        }
    }
    debugLog("rp_card_go", `origin=${origin} closed=${closed}`, "readpoint");
    await OpenSyFile2(plugin, origin);
}

/** 来源行现查回填：查到才显（title=完整 hpath 兜底超长截断）；查空/异常=保持 hidden 静默降级 */
async function fillSourceRow(el: HTMLElement, origin: string): Promise<void> {
    let s: RPCardSource | null = null;
    try {
        s = await fetchRPCardSource(origin);
    } catch { /* SQL 链失败=来源行缺席，卡面其余照常 */ }
    const text = s ? buildSourceText(s) : "";
    debugLog("rp_card_source", `ok=${!!s} len=${text.length}`, "readpoint");
    if (!text) return;
    el.textContent = text;
    el.title = `${s.parentPath}/${s.docTitle}`;
    el.hidden = false;
}

/** origin 反查来源三件：origin 行 join 文档 hpath → 父链爬最近标题块。
 *  origin 已删（孤儿卡）=行查不到 → null */
async function fetchRPCardSource(origin: string): Promise<RPCardSource | null> {
    const rows = (await siyuan.sql(
        `SELECT b.type AS btype, b.content AS bcontent, b.parent_id AS parent, r.hpath AS hpath
         FROM blocks b INNER JOIN blocks r ON r.id = b.root_id WHERE b.id = '${origin}'`,
    )) as { btype: string; bcontent: string | null; parent: string | null; hpath: string | null }[];
    const row = rows?.[0];
    if (!row) return null;
    const { docTitle, parentPath } = splitHPath(row.hpath ?? "");
    const section = await nearestSectionHeading(row.btype, row.bcontent, row.parent);
    return { docTitle: unescapeBlockText(docTitle), parentPath, section: unescapeBlockText(section) };
}

/** 最近标题块：设点块自身是标题→取自身文本；否则沿父链上爬（文档行 parent_id 恒空=自然
 *  终止；上限 16 层防环防失控） */
async function nearestSectionHeading(btype: string, bcontent: string | null, parentID: string | null): Promise<string> {
    if (btype === "h") return collapseSpaces(bcontent);
    let id = parentID ?? "";
    for (let i = 0; i < 16 && id; i++) {
        const rows = (await siyuan.sql(
            `SELECT type, content, parent_id FROM blocks WHERE id = '${id}'`,
        )) as { type: string; content: string | null; parent_id: string | null }[];
        const row = rows?.[0];
        if (!row) break;
        if (row.type === "h") return collapseSpaces(row.content);
        id = row.parent_id ?? "";
    }
    return "";
}

function collapseSpaces(s: string | null): string {
    return (s ?? "").replace(/\s+/g, " ").trim();
}
