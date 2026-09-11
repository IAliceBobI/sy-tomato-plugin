// □1（3.8.3 升级战役）批注 AI 讨论区落盘自定义块——anno-chat 渲染器。
// 注册面（exp/apirenew-report.md 硬事实）：plugin.customBlockRenders["anno-chat"] =
// { render({element, content, setContent}) => dispose? }；element=DIV.custom-block__content
// （块 id 在宿主 [data-node-id]，内核对 content 元素已做 30 类编辑器事件隔离，卡内按钮不扰编辑器）；
// 事务/切页签 dispose→render 成对；旧内核（<3.8.3）无此注册面 → renderFallback <pre> 显围栏原文。
// 卡形态（设计拍板）：头行（标题+meta+制卡钮）+ 笔记层（记录员 markdown 简渲染，无 Pro 档缺省）
// + 讨论层（默认折叠，点击展开完整讨论）；制卡钮=挂内建卡包后按钮退场（官方竖线标记自动出现）。
import { getTomatoPluginInstance, siyuan } from "./libs/utils";
import { debugLog } from "./libs/logUtils";
import { tomatoI18n } from "./tomatoI18n";
import { agentIconSymbolID } from "./agentIcon";
import { ANNO_CHAT_BLOCK_TYPE, parseAnnoChatContent, renderNoteLines, type AnnoChatBlockMsg } from "./libs/annoChatBlock";

/** 最小注册面接口（siyuan 1.2.5 类型声明无 customBlockRenders，结构化窄化避免 as any 满天飞） */
export interface CustomBlockPlugin {
    customBlockRenders?: Record<string, unknown>;
}

/** 特性检测：3.8.3+ 且渲染器已注册（旧内核=按钮隐藏防「沉淀黑洞」，AnnoChat 沉淀入口显隐判据） */
export function supportsAnnoChatBlock(): boolean {
    try {
        const renders = (getTomatoPluginInstance() as CustomBlockPlugin | null)?.customBlockRenders;
        return !!renders && typeof renders[ANNO_CHAT_BLOCK_TYPE] === "object";
    } catch {
        return false;
    }
}

export function registerAnnoChatRender(plugin: CustomBlockPlugin): void {
    if (!plugin.customBlockRenders) return; // <3.8.3：不注册，官方 fallback 兜底
    plugin.customBlockRenders[ANNO_CHAT_BLOCK_TYPE] = {
        render: ({ element, content }: { element: HTMLElement; content: string }) => {
            renderCard(element, content);
        },
    };
}

/** 宿主块 id：content 元素自身不带，上爬最近 [data-node-id]（探针同款判法） */
function blockIdOf(element: HTMLElement): string {
    return element.closest("[data-node-id]")?.getAttribute("data-node-id") ?? "";
}

function renderCard(element: HTMLElement, content: string): void {
    const data = parseAnnoChatContent(content);
    if (!data) {
        const tip = document.createElement("div");
        tip.className = "tomato-annochat-card__broken";
        tip.textContent = tomatoI18n.讨论内容无法解析;
        element.append(tip);
        return;
    }
    const card = document.createElement("div");
    card.className = "tomato-annochat-card";

    // ---- 头行：图标+标题+meta（N 条消息）+ 制卡钮（已挂卡不显）----
    // svg 图标一律 innerHTML 注入：DOM API setAttribute("xlink:href") 建字面冒号名属性
    // （非 xlink 命名空间），<use> 解析不到=图标占位不画（rpcard □1 vision 实锤同病顺修）
    const head = document.createElement("div");
    head.className = "tomato-annochat-card__head";
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.innerHTML = `<use xlink:href="#${agentIconSymbolID()}"></use>`;
    const title = document.createElement("span");
    title.className = "tomato-annochat-card__title";
    title.textContent = tomatoI18n.讨论沉淀;
    const meta = document.createElement("span");
    meta.className = "tomato-annochat-card__meta";
    meta.textContent = tomatoI18n.条消息.replace("{n}", String(data.msgs.length));
    const mkBtn = document.createElement("button");
    mkBtn.className = "tomato-annochat-card__mk";
    mkBtn.setAttribute("aria-label", tomatoI18n.制成闪卡);
    mkBtn.hidden = true; // 已挂卡检测通过才显（挂过的卡按钮退场=拍板）
    const mkIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    mkIcon.innerHTML = '<use xlink:href="#iconRiffCard"></use>';
    mkBtn.append(mkIcon, document.createTextNode(tomatoI18n.制成闪卡));
    head.append(icon, title, meta, mkBtn);
    card.append(head);

    // ---- 笔记层（无 Pro 档=纯讨论档案卡，缺省不渲染）----
    if (data.note) {
        const note = document.createElement("div");
        note.className = "tomato-annochat-card__note";
        for (const line of renderNoteLines(data.note)) {
            const el = document.createElement(line.type === "li" ? "div" : line.type === "p" ? "div" : "span");
            el.className = `tomato-annochat-card__n-${line.type}`;
            el.textContent = line.text ?? "";
            note.append(el);
        }
        card.append(note);
    }

    // ---- 讨论层（默认折叠；展开=完整讨论：角色标签+气泡静态流）----
    const msgsBox = document.createElement("div");
    msgsBox.className = "tomato-annochat-card__msgs";
    msgsBox.hidden = true;
    let prev: AnnoChatBlockMsg | undefined;
    for (const m of data.msgs) {
        const wrap = document.createElement("div");
        wrap.className = `tomato-annochat-card__m tomato-annochat-card__m--${m.role}`;
        // 角色标签：assistant 组首才显（连续同名合并，AnnoChat showRole 同语义；user 不带名）
        if (m.role === "assistant" && !(prev?.role === "assistant" && prev.name === m.name)) {
            const role = document.createElement("div");
            role.className = "tomato-annochat-card__mrole";
            role.textContent = m.name ?? "AI";
            wrap.append(role);
        }
        const text = document.createElement("div");
        text.className = "tomato-annochat-card__mtext";
        text.textContent = m.content;
        wrap.append(text);
        msgsBox.append(wrap);
        prev = m;
    }
    const toggle = document.createElement("button");
    toggle.className = "tomato-annochat-card__toggle";
    toggle.setAttribute("aria-expanded", "false");
    const tIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    tIcon.innerHTML = '<use xlink:href="#iconDown"></use>';
    const tLabel = document.createElement("span");
    tLabel.textContent = tomatoI18n.展开讨论;
    toggle.append(tIcon, tLabel);
    toggle.addEventListener("click", () => {
        const open = msgsBox.hidden;
        msgsBox.hidden = !open;
        toggle.setAttribute("aria-expanded", String(open));
        tLabel.textContent = open ? tomatoI18n.收起讨论 : tomatoI18n.展开讨论;
        tIcon.innerHTML = open ? '<use xlink:href="#iconUp"></use>' : '<use xlink:href="#iconDown"></use>';
    });
    card.append(toggle, msgsBox);
    element.append(card);

    // ---- 制卡：挂内建卡包（addRiffCards 默认 deck）→ 官方竖线标记自动出现、按钮退场 ----
    void setupMakeCard(mkBtn, blockIdOf(element));
}

/** 制卡按钮装配：先异步查 IAL custom-riff-decks（已挂卡=保持 hidden 退场），未挂才显+绑点击 */
async function setupMakeCard(btn: HTMLButtonElement, blockID: string): Promise<void> {
    if (!blockID) return;
    try {
        const attrs = await siyuan.getBlockAttrs(blockID);
        if (!btn.isConnected) return; // 渲染宿主已被替换（dispose 后晚归）
        if (attrs?.["custom-riff-decks"]) return; // 已是卡：按钮退场
    } catch {
        return; // 检测失败宁缺毋滥（按钮不显，刷新后重试）
    }
    btn.hidden = false;
    btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
            // siyuan.call 内核拒绝只 warn 不 throw（评审 P1-1）——判空防假成功（按钮退场后再无入口）
            const r = await siyuan.addRiffCards([blockID]);
            if (!r) throw new Error("addRiffCards rejected");
            btn.remove();
            void siyuan.pushMsg(tomatoI18n.已加入闪卡复习).catch?.(() => {});
            debugLog("anno_chat_block", `card_made id=${blockID}`, "anno");
        } catch {
            btn.disabled = false;
            void siyuan.pushMsg(tomatoI18n.闪卡创建失败).catch?.(() => {});
        }
    });
}
