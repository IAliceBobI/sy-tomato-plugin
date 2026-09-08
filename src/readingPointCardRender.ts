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
import { parseRPCardContent, relativeTime } from "./libs/readingPointCore";
import { OpenSyFile2 } from "./libs/navUtils";

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
    debugLog("rp_card_render", `ok=${!!data} host=${hostName(element)}`, "readpoint");
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
