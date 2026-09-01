// 面板 tooltip 自建单例（□5 顶栏翻新引入；配方=渐进浮条 floatTip.ts 同款搬运，TIP_ID 独立
// 避让 progressive 的 #prog-float-tip——两插件可能同场驻留，共享 id 会互相 hide/destroy）。
// 为什么自建而不用 b3-tooltips / 内核 #tooltip：b3-tooltips 纯 CSS 气泡居中锚定，
// 面板 ov:auto/窄板两端必裁切；内核共享 #tooltip 单例会被 block/popover.ts 的
// document 级 mouseover 监听对非候选元素补刀隐藏+同钮锁死（渐进 □1 实锤）。
// 自建元素对思源隐藏生态隐身；复用 .tooltip 全局类（fixed/320px 折行/zoomIn 300ms，
// 与原生观感一致）；pointer-events:none 由 index.scss 的 #tomato-panel-tip 规则常驻。

export interface TipAnchorRect {
    /** 锚元素视口坐标（getBoundingClientRect 子集；bottom 与 top 分开传，翻转判断用） */
    left: number;
    top: number;
    bottom: number;
    width: number;
}

export interface TipPos {
    left: number;
    top: number;
}

/** 防溢定位（纯函数，单测锁数学；语义对齐思源 showTooltip north 分支
 *  app/src/dialog/tooltip.ts：居中锚 → 右缘钳 → 左缘钳；北侧空间不足翻南侧。
 *  gap 默认 5 对齐旧 CSS 气泡 margin-bottom 观感（原生 space=0.5）；母本另供
 *  progressive floatTip 取件（□6 收敛双份拷贝），改这里须同步看渐进浮条。 */
export function northTipPos(
    anchor: TipAnchorRect,
    tipW: number,
    tipH: number,
    vw: number,
    vh: number,
    gap = 5,
): TipPos {
    // 水平：气泡中心对齐锚中心，右溢钳右缘、左溢钳 0（顺序保证 tip 超视口宽时不出负值）
    let left = anchor.left - (tipW - anchor.width) / 2;
    if (left + tipW > vw) left = vw - tipW;
    left = Math.max(0, left);
    // 垂直：默认置锚上方；锚贴近视口顶（上方放不下）翻到锚下方，翻后底溢再钳底缘
    let top = anchor.top - tipH - gap;
    if (top < 0) top = anchor.bottom + gap;
    if (top + tipH > vh) top = Math.max(0, vh - tipH);
    return { left, top };
}

const TIP_ID = "tomato-panel-tip";

// 滚动即弃防线（□3 上提单例）：scroll 不冒泡但捕获可达 window，一处覆盖一切滚动容器；
// fixed tip 不随锚，滚轮时鼠标不动无 mouseleave，不弃会悬空在错位处。挂模块级一次、
// 永不摘除（多面板共享受益）——Svelte mount() 树不卸载的现状下组件级 cleanup 永不跑，
// 组件各自挂会随每次开关面板泄漏一份，上提后彻底不依赖组件生命周期
let scrollGuardArmed = false;
function armScrollGuard() {
    if (scrollGuardArmed) return;
    scrollGuardArmed = true;
    window.addEventListener("scroll", hidePanelTip, true);
}

/** 幂等建/取面板 tip 元素（挂 body 尾；z 序随 .tooltip 类与原生 tip 同档） */
function ensureTipEl(): HTMLElement | null {
    let el = document.getElementById(TIP_ID);
    if (!el) {
        el = document.createElement("div");
        el.id = TIP_ID;
        el.className = "tooltip";
        document.body.appendChild(el);
    }
    return el;
}

/** 显示/移位：textContent 纯文本（多行制 \n 交给 .tooltip 的 break-spaces 换行） */
export function showPanelTip(el: HTMLElement) {
    armScrollGuard();
    const tip = ensureTipEl();
    const text = el.getAttribute("aria-label");
    if (!tip || !text) return; // aria-label 缺失静默无 tip，功能不受损
    tip.className = "tooltip"; // 清上轮 fn__none 即显示
    tip.textContent = text;
    tip.removeAttribute("style"); // 清上轮定位再测宽（原生 showTooltip 同款）
    const r = el.getBoundingClientRect();
    const pos = northTipPos(
        { left: r.left, top: r.top, bottom: r.bottom, width: r.width },
        tip.clientWidth, tip.clientHeight, innerWidth, innerHeight,
    );
    tip.style.left = `${pos.left}px`;
    tip.style.top = `${pos.top}px`;
}

export function hidePanelTip() {
    document.getElementById(TIP_ID)?.classList.add("fn__none");
}

/** 面板卸载收尾：整元素摘除不留尸体（下次 hover 自动重建） */
export function destroyPanelTip() {
    document.getElementById(TIP_ID)?.remove();
}
