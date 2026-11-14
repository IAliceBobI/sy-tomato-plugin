// RiffNumberBox —— 闪卡编号（GitHub issue #84：卡多时方便定位与编辑）。
//
// 形态两处（单一开关 cardBoxRiffNumber「显示闪卡编号」控制，默认关）：
// 1. 块编号：每个闪卡块（IAL 有 custom-riff-decks）左上角小灰色圆圈序号。
//    编号=动态顺序号，按文档内 DOM 顺序连号（中间插卡后自动重排，不做稳定 ID）；
//    口径=一个闪卡块占一个号（不论该块几张卡）；嵌套闪卡（列表父子块都是卡）按
//    DOM 顺序一并连号。仅编辑器内显示——复习界面/悬浮预览/搜索预览/反链面板内的
//    protyle 走 TitleRiffBox 同款环境守卫链不挂（isCardUI 判定复用）。
// 2. 标题栏总数：文档标题属性行（.protyle-title .protyle-attr）显示本文档闪卡
//    总数（iconNumber + N，tooltip 说明口径）。口径=内核 getTreeRiffCards 的
//    total——官方复习界面「文档卡数」同款：含子文档、按张计数（一块可有多张卡：
//    图片挖空/一块多卡组）。#84 修复：旧实现按 DOM 已挂载块数（noOf.size）计数，
//    长文档动态加载下未挂载块漏计+一块多卡按 1 计，双双偏少。总数异步查内核，按
//    rootID+挂载块数缓存（稳定态零请求：打开查一次，制卡删卡/切文档后重查一次）；
//    块编号仍按块连号（定位用），编号上限可小于总数，两口径刻意不同。显隐门复用
//    TitleRiffBox 同款：只读模式/加密笔记本/「显示书签图标」关闭（属性行唯一
//    opacity:1 通道关闭）时不注入（跟 #82 复习按钮同一套门）。
//
// DOM 注入配方（先例：CardPriorityBar 挂块 .protyle-attr=内核序列化安全区，DOM
// 不进内核保存链）：编号徽标挂块属性行首（prepend 恒居行最左），CSS 把含徽标的
// 属性行重锚块左上（cardPriBarPos left-top 档同构）；徽标样式全走 --b3-* 主题
// 变量（暗色主题自动跟随）。样式表本模块自管（带标记注入、onload 清旧重注、
// onunload 摘除），不进 cssStyle.ts 的 load_* 注册表——编号 CSS 不依赖开关值
// （选择器 :has(.tomato-riff-no) 限定，零徽标时零效果），开关只控徽标挂/摘。
//
// 重排触发：四个高频 protyle 事件（events 基建自带 per-protyle 300ms trailing
// debounce）+ MutationObserver（attributes custom-riff-decks / childList，全 body
// 深观察 attributeFilter 收窄同 CardPriorityBox；自派发回调 300ms trailing
// debounce 后对全部打开编辑器重排）。重排走 diff（同代徽标值不变零写入、跨代/
// 失宿主才摘挂），稳定态零 DOM 写入=observer 不自激。
import { IProtyle, Protyle } from "siyuan";
import { EventType, events } from "./libs/Events";
import { getOpenedEditors, icon, isBacklinkUI, isCardUI, isPopoverUI, isSearchUI } from "./libs/utils";
import { cardBoxCheckbox, cardBoxRiffNumber } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { debugLog } from "./libs/logUtils";
import { siyuan } from "./libs/siyuanApi";
import { CUSTOM_RIFF_DECKS, TOMATO_BK_IGNORE } from "./libs/gconst";

// 代际标记（TitleRiffBox.ts 同款配方）：插件 reload 整轮重跑模块顶层，旧实例
// in-flight（debounce 落地）handler 可能在新实例清场之后注入——徽标/总数带代际
// 属性，发现异代旧物就地摘除换新，防跨代残留（盐前缀键防跨插件撞名）。
const gGen = globalThis as { __tomato_zZmqus5PtYRi_riffNoGen?: number };
const RIFF_NO_GEN = String((gGen.__tomato_zZmqus5PtYRi_riffNoGen = (gGen.__tomato_zZmqus5PtYRi_riffNoGen ?? 0) + 1));

// 注入物 DOM 标记属性（幂等判定/全量清场用；单模块消费，不进 gconst 公共清单）
const RIFF_NO_ADD = "data-tomato-riff-no";    // 块编号徽标（值=代际；徽标序号走 dataset）
const RIFF_CNT_ADD = "data-tomato-riff-count"; // 标题栏总数（值=代际）
const RIFF_NO_STYLE = "data-tomato-riffno-style"; // 自管样式表标记

/** 全量摘除本插件注入的编号徽标与标题栏总数（任意代际）。onload 先清上一代残留、
 *  onunload 收尾、开关关闭即时生效共用 */
function removeAllRiffNumbers() {
    document.querySelectorAll(`[${RIFF_NO_ADD}],[${RIFF_CNT_ADD}]`).forEach(e => e.remove());
}

/** 本模块样式表自管（cssStyle.ts 的 appendTomatoStyle 是私有且走 load_* 注册表；
 *  这里独立标记注入/清场，生命周期与模块对齐） */
function injectRiffNoStyle() {
    document.querySelectorAll(`style[${RIFF_NO_STYLE}]`).forEach(e => e.remove());
    const style = document.createElement("style");
    style.setAttribute(RIFF_NO_STYLE, "");
    style.textContent = `
/* 含编号徽标的闪卡块属性行常显：内核属性行基线 opacity:0（_attr.scss:6，hover
   才显），徽标要求常显——父级透明度合成子元素无法穿透，必须整行 opacity:1；
   同行原生书签/命名图标随之常显的副作用与 cardPriBarPos 非默认档先例一致 */
div[custom-riff-decks] > .protyle-attr:has(.tomato-riff-no) {
    opacity: 1 !important;
}
/* 重锚块左上（cardPriBarPos left-top 档同构）：left:0 right:auto，top 保持内核
   -12px 悬空块上边线。:not(:has([cardPriBar])) 排除同住着 CardPriorityBar 按钮条
   的行——不排除会把用户在 cardPriBarPos 选的条位置档（默认 right=块右上）一并
   拽到左上；该组合下徽标随行留在右上（常显已由上一条保证，仅位置跟随条档） */
div[custom-riff-decks] > .protyle-attr:has(.tomato-riff-no):not(:has([cardPriBar])) {
    left: 0 !important;
    right: auto !important;
}
/* 小灰色圆圈编号徽标：色值/底色全 --b3-* 主题变量（暗色自动跟随），等宽数字 */
div[custom-riff-decks] > .protyle-attr > .tomato-riff-no {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 15px;
    height: 15px;
    padding: 0 3px;
    border: 1px solid var(--b3-theme-on-surface-light);
    border-radius: 50%;
    color: var(--b3-theme-on-surface);
    font-size: 10px;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    background-color: var(--b3-theme-surface);
    user-select: none;
    cursor: default;
}
`;
    document.head.appendChild(style);
}

/** 内核 isEncryptedBox 同款（TitleRiffBox.ts 内同源复制）：只认笔记本静态加密标记 */
function isEncryptedBox(notebookId: string): boolean {
    if (!notebookId) return false;
    const notebooks = (window.siyuan as any)?.notebooks ?? [];
    return !!notebooks.find((n: any) => n?.id === notebookId && n?.encrypted);
}

function isDocFlow(detail: Protyle) {
    return (detail?.protyle?.element as HTMLElement)?.classList?.contains("docs-flow__protyle");
}

class RiffNumberBox {
    private observer: MutationObserver | null = null;
    /** 自派发 mutation 重排的 trailing debounce 定时器（onunload 清） */
    private sweepTimer: ReturnType<typeof setTimeout> | null = null;
    /** 开关 store 订阅注销器（onunload 收尾） */
    private unsubSwitch: (() => void) | null = null;
    /** onunload 置位：in-flight 总数请求落地前先查，卸载后不再触 DOM（防停用后回调
     *  把总数徽标又注回来；reload 场景另由模块代际守卫兜底） */
    private dead = false;
    /** 总数请求序号：同 rootID 后发请求顶掉先发（在途期间挂载块数再变=旧响应作废） */
    private totalReqSeq = 0;
    /** 内核闪卡总数缓存（#84 口径修正），键=编辑器元素（protyle.element）：count=上次
     *  查询 total；rootID+mounted=失效键（换文档/制卡删卡改挂载数→重查）；seq=在途
     *  请求去重与顶掉判定。按编辑器分键而非按 rootID——同文档多开分屏各自挂载块数
     *  可不同（动态加载进度差），单键会 ping-pong 互顶（A 的响应触发 B 重查、B 的响
     *  应再触发 A，请求风暴）；页签关闭留残条随实例回收，量级=会话内开过的页签数 */
    private riffTotalCache = new Map<HTMLElement, { rootID: string; count: number; mounted: number; pending: boolean; seq: number }>();

    onload() {
        // 闪卡工具总开关（Checkbox 族=isStructuralKey 正则自动覆盖，改后保存自动整重载）
        if (!cardBoxCheckbox.get()) return;
        // 移动端形态本期不做（TitleRiffBox #82 先例：标题区 #toolbarName 无属性行）
        if (events.isMobile) return;
        // 无论开关状态，reload 后先清上一实例残留（in-flight 注入孤儿，TitleRiffBox 同款）
        removeAllRiffNumbers();
        injectRiffNoStyle();
        events.addListener("RiffNumberBox 2026-11-14", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.switch_protyle
                || eventType == EventType.click_editorcontent
            ) {
                this.handleProtyle(detail, eventType);
            }
        });
        // 块级变化（制卡/取消制卡属性变化、插块/删块/内核重渲染重写属性行）→ 重排。
        // attributeFilter 只放行制卡属性收窄 attributes 噪音（CardPriorityBox 同款）；
        // 回调不区分目标区域——重排只对打开的页签编辑器做，复习界面/预览内的变化
        // 天然不消费；自挂徽标也触发 childList，diff 稳定态零写入即收敛
        this.observer = new MutationObserver(() => {
            if (!cardBoxRiffNumber.get()) return;
            if (this.sweepTimer) clearTimeout(this.sweepTimer);
            this.sweepTimer = setTimeout(() => {
                this.sweepTimer = null;
                this.sweepOpenedEditors("mutation-sweep");
            }, 300);
        });
        this.observer.observe(document.body, {
            attributes: true, attributeFilter: [CUSTOM_RIFF_DECKS], childList: true, subtree: true
        });
        // reload 清残留后主动补挂：不切页签/不点编辑器就没有 protyle 事件，编号不会
        // 自己回来（TitleRiffBox resweep 同款；属性行未就绪的编辑器随下次事件再试）
        this.sweepOpenedEditors("reload-resweep");
        // 开关即时生效（cardBoxRiffNumber 逐事件活读=非结构性键，不进 STRUCTURAL_KEYS）：
        // 关=立即全摘；开=对在场编辑器补挂（subscribe 订阅即回调，与上方 resweep 幂等重叠）
        this.unsubSwitch = cardBoxRiffNumber.subscribe(on => {
            if (!on) {
                removeAllRiffNumbers();
            } else {
                this.sweepOpenedEditors("switch-resweep");
            }
        });
        debugLog("riffno.onload", `gen=${RIFF_NO_GEN}`, "riffno");
    }

    onunload() {
        this.dead = true; // 先闸住 in-flight 总数回调，再清场
        this.unsubSwitch?.();
        this.unsubSwitch = null;
        this.observer?.disconnect();
        this.observer = null;
        if (this.sweepTimer) {
            clearTimeout(this.sweepTimer);
            this.sweepTimer = null;
        }
        removeAllRiffNumbers();
        document.querySelectorAll(`style[${RIFF_NO_STYLE}]`).forEach(e => e.remove());
        debugLog("riffno.onunload", "badges+counters swept");
    }

    private sweepOpenedEditors(eventType: string) {
        for (const ed of getOpenedEditors()) {
            this.handleProtyle(ed.protyle, eventType);
        }
    }

    /** detail=事件 detail 或 Protyle 包装类（结构同构，均以 .protyle 取 IProtyle）。
     *  环境守卫链与 TitleRiffBox.handleProtyle 同款：复习界面（isCardUI）/悬浮预览/
     *  搜索预览/反链面板/弹窗内的自建 protyle 同样发 protyle 事件，不拦会把编号挂进
     *  复习界面与预览（issue #84 明确复习时不显示） */
    private handleProtyle(detail: Protyle, eventType = "") {
        if (!cardBoxRiffNumber.get()) return;
        const protyle: IProtyle = detail?.protyle;
        if (!protyle?.element) return;
        if (protyle.element.getAttribute(TOMATO_BK_IGNORE)) return;
        if (isPopoverUI(detail)) return;
        if (isBacklinkUI(detail)) return;
        if (isSearchUI(detail)) return;
        if (isCardUI(detail)) return;
        if (isDocFlow(detail)) return;
        this.renumber(protyle, eventType);
    }

    /** 对单个编辑器重排：按 DOM 顺序给闪卡块连号（嵌套父子卡一并连号）+ 更新标题栏
     *  总数。diff 语义：同代徽标序号不变零写入（observer 自激收敛）；序号变了/新卡
     *  块→写或挂；宿主已非卡块（取消制卡）或跨代残留→摘 */
    private renumber(protyle: IProtyle, eventType = "") {
        const wysiwyg = protyle.wysiwyg?.element;
        if (!wysiwyg) return;
        // querySelectorAll 返回文档序=DOM 顺序连号（含嵌套闪卡的父子块）
        const blocks = [...wysiwyg.querySelectorAll(`[${CUSTOM_RIFF_DECKS}]`)] as HTMLElement[];
        const noOf = new Map<HTMLElement, number>();
        let no = 0;
        for (const b of blocks) noOf.set(b, ++no);
        // 1. 在场徽标：宿主仍是卡块且同代→按需更新序号；否则摘（失宿主/异代）。
        //    宿主按 data-node-id 认（块固有属性恒在）——不能按 custom-riff-decks 认：
        //    嵌套父子卡中子块取消制卡时，子块徽标向上 closest 会误命中仍是卡块的
        //    父块，残留一个显示父块编号的错位徽标
        const seen = new Set<HTMLElement>();
        wysiwyg.querySelectorAll(`[${RIFF_NO_ADD}]`).forEach(el => {
            const badge = el as HTMLElement;
            const host = badge.closest("[data-node-id]") as HTMLElement | null;
            const n = host ? noOf.get(host) : undefined;
            if (n == null || Number(badge.getAttribute(RIFF_NO_ADD)) !== Number(RIFF_NO_GEN)) {
                badge.remove();
                return;
            }
            if (badge.dataset.no !== String(n)) {
                badge.dataset.no = String(n);
                badge.textContent = String(n);
            }
            seen.add(host);
        });
        // 2. 新卡块挂徽标：挂属性行首（prepend 恒居行最左，避让 CardPriorityBar 按钮条
        //    等同住客）；属性行未就绪（无 .protyle-attr 子元素）静默跳过，下次事件再试
        for (const [b, n] of noOf) {
            if (seen.has(b)) continue;
            const attr = b.lastElementChild;
            if (!attr?.classList?.contains("protyle-attr")) continue;
            const badge = document.createElement("div");
            badge.className = "tomato-riff-no";
            badge.setAttribute(RIFF_NO_ADD, RIFF_NO_GEN);
            badge.dataset.no = String(n);
            badge.textContent = String(n);
            attr.prepend(badge);
        }
        this.updateTitleCount(protyle, noOf.size);
        debugLog("riffno.renumber", `doc=${protyle.block?.rootID} blocks=${noOf.size} type=${eventType}`, "riffno");
    }

    /** 标题栏总数：注入点与显隐门复用 TitleRiffBox 同款（.protyle-title 下属性行；
     *  聚焦隐藏标题/「显示书签图标」关闭（无 protyle-wysiwyg--attr 类=属性行唯一
     *  opacity:1 通道关闭）/只读/加密笔记本时不注入，跟 #82 复习按钮同一套门）。
     *  口径（#84 修复）：总数改取内核 getTreeRiffCards 的 total（官方复习界面「文档
     *  卡数」同款：含子文档、按张计数），替换旧 noOf.size（DOM 已挂载块数：长文档
     *  动态加载未挂载块漏计、一块多卡按 1 计，双双偏少）。异步：先注占位徽标，数到
     *  手后落地；按 rootID+挂载块数缓存，稳定态零请求（打开查一次，制卡删卡/切文档
     *  后重查一次） */
    private updateTitleCount(protyle: IProtyle, mounted: number) {
        const titleEle = protyle.title?.element;
        if (!titleEle) return; // 卡片/预览等无标题 protyle 的结构兜底
        if (titleEle.classList.contains("fn__none")) return; // 聚焦态隐藏标题=不可见
        if (!titleEle.classList.contains("protyle-wysiwyg--attr")) return; // 属性行 opacity:0 幽灵交互区，不注入
        const attrRow = titleEle.querySelector(":scope > .protyle-attr");
        if (!attrRow) return; // 属性行未就绪，下次 protyle 事件再试
        if ((window.siyuan as any)?.config?.readonly) {
            attrRow.querySelector(`[${RIFF_CNT_ADD}]`)?.remove();
            return;
        }
        if (isEncryptedBox(protyle.notebookId)) {
            attrRow.querySelector(`[${RIFF_CNT_ADD}]`)?.remove();
            return;
        }
        const rootID = protyle.block?.rootID;
        if (!rootID) return; // 无根块 id=无查询键（异常结构），不注入
        const edKey = protyle.element;
        if (!edKey) return;
        const cached = this.riffTotalCache.get(edKey);
        // 稳定态零请求：同编辑器同文档且挂载块数没变（未制卡/删卡）→缓存直读
        if (cached && !cached.pending && cached.rootID === rootID && cached.mounted === mounted) {
            this.renderTitleCount(attrRow, cached.count);
            return;
        }
        // 同键请求在途（开文档事件簇连发去重）：占位/旧数已在场就等落地，不重复发
        if (cached?.pending && cached.rootID === rootID && cached.mounted === mounted
            && attrRow.querySelector(`[${RIFF_CNT_ADD}]`)) {
            return;
        }
        // 首查/失效重查（制卡删卡改挂载数、同页签换文档、在途中块数又变 seq 顶旧）：
        // 占位先上（同文档已落地过的旧数沿用显示，换文档不沿用），再异步查内核
        const stale = cached && !cached.pending && cached.rootID === rootID ? cached.count : null;
        this.renderTitleCount(attrRow, stale);
        const seq = ++this.totalReqSeq;
        this.riffTotalCache.set(edKey, { rootID, count: stale ?? 0, mounted, pending: true, seq });
        this.fetchTreeRiffTotal(edKey, rootID, seq);
    }

    /** 标题栏总数唯一 DOM 写入点（TitleRiffBox 同款幂等规则）：在场代更高=更新实例
     *  已挂载，不碰；同代=就地改数字/aria（data-count 未变零写入，observer 不自激）；
     *  低代/无代=摘除重建。count=null=占位态（数位空、无 aria），数到手同代就地补 */
    private renderTitleCount(attrRow: Element, count: number | null) {
        const old = attrRow.querySelector(`[${RIFF_CNT_ADD}]`);
        if (old) {
            const gen = Number(old.getAttribute(RIFF_CNT_ADD));
            if (gen > Number(RIFF_NO_GEN)) return; // 更新实例已挂载，旧 in-flight 不得改
            if (gen === Number(RIFF_NO_GEN)) {
                if (old.getAttribute("data-count") !== String(count)) {
                    old.setAttribute("data-count", String(count));
                    if (count == null) {
                        old.removeAttribute("aria-label");
                    } else {
                        old.setAttribute("aria-label", tomatoI18n.本文档闪卡共n张(count));
                    }
                    const num = old.querySelector(".tomato-riff-count-num");
                    if (num) num.textContent = count == null ? "" : String(count);
                }
                return;
            }
            old.remove(); // 低代/无代残留（旧实例 in-flight 注入）
        }
        const cnt = document.createElement("div");
        cnt.className = "tomato-riff-count ariaLabel";
        cnt.setAttribute(RIFF_CNT_ADD, RIFF_NO_GEN);
        cnt.setAttribute("data-count", String(count));
        cnt.setAttribute("role", "text");
        if (count != null) cnt.setAttribute("aria-label", tomatoI18n.本文档闪卡共n张(count));
        cnt.setAttribute("data-position", "north");
        cnt.innerHTML = icon("iconNumber", 12) + `<span class="tomato-riff-count-num">${count == null ? "" : count}</span>`;
        attrRow.appendChild(cnt);
    }

    /** 查内核文档子树闪卡总数（getTreeRiffCards page=1/pageSize=1 只取 total，不拉
     *  卡列表）。落地三重守卫：dead（onunload 后不触 DOM）、模块代际（reload 后新
     *  实例已清场重挂，旧实例 in-flight 落地会注回旧代徽标→丢弃）、seq（同编辑器
     *  更新请求已顶掉本次→交给新请求落地）。数到手写缓存后走 sweepOpenedEditors
     *  重排落地——借 renumber 全套环境守卫（开关已关/只读态自动不注），同文档多开
     *  分屏各自上数；失败只摘占位不重排（重排会立即重发请求，内核持续报错时死循环），
     *  缓存删掉让下次 protyle 事件自然重试 */
    private async fetchTreeRiffTotal(edKey: HTMLElement, rootID: string, seq: number) {
        const gen = Number(RIFF_NO_GEN);
        try {
            const ret = await siyuan.getTreeRiffCards(rootID, 1, 1);
            if (this.dead || gGen.__tomato_zZmqus5PtYRi_riffNoGen !== gen) return;
            const entry = this.riffTotalCache.get(edKey);
            if (!entry || entry.seq !== seq) return;
            const total = ret?.total;
            if (typeof total !== "number" || !Number.isFinite(total)) {
                this.riffTotalCache.delete(edKey);
                debugLog("riffno.total.bad", `doc=${rootID} resp=${JSON.stringify(ret)}`, "riffno");
                for (const ed of getOpenedEditors()) {
                    const p = ed.protyle?.protyle;
                    if (p?.block?.rootID !== rootID) continue;
                    p.title?.element?.querySelector(`:scope > .protyle-attr > [${RIFF_CNT_ADD}]`)?.remove();
                }
                return;
            }
            entry.pending = false;
            entry.count = total;
            debugLog("riffno.total", `doc=${rootID} total=${total}`, "riffno");
            this.sweepOpenedEditors("total-arrived");
        } catch (e) {
            if (this.dead || gGen.__tomato_zZmqus5PtYRi_riffNoGen !== gen) return;
            this.riffTotalCache.delete(edKey);
            debugLog("riffno.total.err", `doc=${rootID} err=${e}`, "riffno");
        }
    }
}

export const riffNumberBox = new RiffNumberBox();
