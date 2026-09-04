import { getAllEditor, IEventBusMap, IMenuItem, IProtyle, Protyle } from "siyuan";
import { mount, unmount } from "svelte";
import { mindWireCheckbox, mindWireColorfull, mindWireDocMenu, mindWireDynamicLine, mindWireEnable, mindWireGlobalMenu, mindWireLine, mindWireStarRefOnly, mindWireWidth, mindWireWordWire, } from "./libs/stores";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { events, EventType } from "./libs/Events";
import { getAttribute, getID, isEditor, normalizeWordRange, siyuan } from "./libs/utils";
import { murmurHash3 } from "./libs/hash";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
import { tomatoI18n } from "./tomatoI18n";
import { lastVerifyResult, verifyKeyTomato } from "./libs/user";
import { debugLog } from "./libs/logUtils";
import { blockWirePath, clampStubX, getEdgePoint, shiftRect, stubAvoidShift, stubDir, stubEdgeShift, stubPos, toolbarAvoidShift, toolbarPos, toContentRect, wireViewState, wordWireGeometry } from "./libs/mindWireGeom";
import { RELATIONS_ATTR, RELATION_COLOR, RelationKey, WORD_WIRE_HREF_PREFIX, checkWireEnd, cleanupRelations, groupWordWires, makeWireId, mergeTipKeepHotkey, parseRelations, relationColor, reviveWordPending, wireIdFromHref, wordClip, wordWireTip } from "./libs/mindWireData";
import MindWirePending from "./MindWirePending.svelte";

const dlog = (msg: string) => debugLog("mindwire", msg, "mindwire");

export const MindWire启用或禁用思维导线 = winHotkey("ctrl+alt+enter", "MindWire global", "iconGlobalGraph", () => tomatoI18n.启用或禁用全局思维导线, false, mindWireGlobalMenu)
export const MindWire启用或禁用文档思维导线 = winHotkey("ctrl+shift+z", "MindWire doc", "iconWire", () => tomatoI18n.启用或禁用文档思维导线, false, mindWireDocMenu)
// ⌥⌘L 撞官方 keymap editor.table.moveToLeft（e2e 实锤：官方分支先吞+幽灵 Enter 触发
// 全局导线开关）；官方 ⌥⌘ 字母仅 H/O/V/Y 空闲（H 有 macOS「隐藏其他」系统键嫌疑），
// 取 Y（Y 形分叉=连线意象；winHotkey 官方 keymap 对照是注释态，静态比对看不见这类撞）
export const MindWire划词连线 = winHotkey("ctrl+alt+y", "MindWire word", "iconWire", () => tomatoI18n.划词连线)
type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

// ---------------------------------------------------------------------------
// 渲染层地基（□1 · 内容坐标系，spec docs/tomato-mindwire-visual-spec.md §2）
// 层挂每个 protyle 的滚动容器内（absolute 随内容走），线全长一次画足、裁剪交给容器
// overflow，滚动期零重算；刷新走事件骨架 + MutationObserver/ResizeObserver，
// 旧「body 挂 svg + wheel 清空 200ms 重画 + 2s 轮询」整套退役。
// ---------------------------------------------------------------------------

const SVG_NS = "http://www.w3.org/2000/svg";
const LAYER_CLASS = "tomato-mind-wire-layer";
const SVG_CLASS = "tomato-mind-wire-svg";
const PATH_CLASS = "tomato-mind-wire-path";
const WORD_PATH_CLASS = "tomato-mind-wire-path--word";
const FLOW_CLASS = "tomato-mind-wire-path--flow";
const HIT_CLASS = "tomato-mind-wire-hit";
const HOT_CLASS = "tomato-mind-wire-hot";
const FLASH_CLASS = "tomato-mind-wire-flash";
const TOOLBAR_CLASS = "tomato-mind-wire-toolbar";
const STUB_CLASS = "tomato-mind-wire-stub";
/** 残端 chip 隐藏态（双端同屏/双端离屏）：visibility 保布局（挂载期 offsetWidth 可测），滚动期切换不触发重排 */
const STUB_OFF_CLASS = "tomato-mind-wire-stub--off";
/** chip 水平避让无可推位兜底态（□5 P1）：满行段落推不出 12px 间隙时毛玻璃紧凑态（背景 88%+blur2） */
const STUB_TIGHT_CLASS = "tomato-mind-wire-stub--tight";
const CONTENT_ATTR = "tomato-mind-wire-content";
const ACCENT_VAR = "--tomato-mind-wire-accent";
/** 两步流菜单项 key（menuManager 隐藏集体系，spec §4.3） */
const WORD_MENU_KEY = "m.mindwire.wordwire";
/** 划词工具条项名（二期 □1）=命令 langKey：共享 keymap.plugin 节点，键位改一处工具条/快捷键两通道同生效 */
const WORD_TOOLBAR_NAME = "MindWire word";

/** 关系名 i18n getter（spec §4.7 六档；RELATION_COLOR 键序即渲染序） */
const RELATION_KEYS = Object.keys(RELATION_COLOR) as RelationKey[];
const RELATION_I18N: Record<RelationKey, () => string> = {
    related: () => tomatoI18n.关联,
    echo: () => tomatoI18n.首尾呼应,
    foreshadow: () => tomatoI18n.伏笔,
    metaphor: () => tomatoI18n.比喻,
    contrast: () => tomatoI18n.对比,
    cause: () => tomatoI18n.因果,
};

interface WireLayer {
    /** 宿主 protyle（词级交互：改关系/删除写文档根属性需要 rootID 与 toolbar） */
    protyle: IProtyle;
    /** 宿主 protyle.element（锚点查询范围） */
    element: HTMLElement;
    layer: HTMLDivElement;
    svg: SVGSVGElement;
    /** 滚动容器（层的挂载父，坐标换算原点） */
    scroller: HTMLElement;
    mo: MutationObserver;
    ro: ResizeObserver;
    timer: number | undefined;
    /** 重画代际：await 门禁查询期间被新重画取代的旧代不再动 DOM */
    gen: number;
    /** 残端 chip 记录（□4 spec §4.2）：双 chip 挂层内锚词旁随内容走，滚动期只切显隐 */
    stubs: StubRec[];
    /** 滚动三态监听（rAF 节流切 chip 显隐；dispose 摘除） */
    scrollHandler: () => void;
    rafId: number;
    /** 锚词点击跳转（capture 拦截内核 a 链接处理；dispose 移除） */
    clickHandler: (e: Event) => void;
}

/** 残端 chip 记录：ys=两端内容坐标纵向区间（滚动期纯数字判定免布局读取）；
 *  chips[0] 挂端1旁、chips[1] 挂端2旁（方向由内容序在挂载时定死） */
interface StubRec {
    ys: [{ top: number; bottom: number }, { top: number; bottom: number }];
    chips: [HTMLButtonElement, HTMLButtonElement];
}

/** key = protyle.element（每编辑器一份层；isEditor 守卫下反链/搜索副本不进表） */
const wireLayers = new Map<HTMLElement, WireLayer>();

/** 滚动容器：.protyle-content，无则 wysiwyg.parentElement 兜底（spec §2.1） */
function scrollerOf(protyle: IProtyle): HTMLElement | null {
    const el = protyle?.element as HTMLElement;
    if (!el) return null;
    return (el.querySelector(".protyle-content") as HTMLElement)
        ?? (protyle?.wysiwyg?.element?.parentElement ?? null);
}

function clearAnchors(element: HTMLElement) {
    element?.querySelectorAll(`[${CONTENT_ATTR}]`).forEach((e: HTMLElement) => {
        e.removeAttribute(CONTENT_ATTR);
        e.style.border = "none";
    });
}

function disposeLayer(key: HTMLElement, wl: WireLayer) {
    wl.mo.disconnect();
    wl.ro.disconnect();
    if (wl.timer) clearTimeout(wl.timer);
    cancelAnimationFrame(wl.rafId);
    wl.scroller.removeEventListener("scroll", wl.scrollHandler);
    key.removeEventListener("click", wl.clickHandler, true);
    wl.layer.remove(); // chip 挂层内随层移除，stubs 数组随 wl 丢弃
    removeWireToolbar(); // 单例迷你条（一指针同时刻只可能挂在本层）
    wireLayers.delete(key);
}

function removeWireLayer(protyle: IProtyle) {
    const element = protyle?.element as HTMLElement;
    const wl = element && wireLayers.get(element);
    if (wl) disposeLayer(element, wl);
    clearAnchors(element);
}

function ensureLayer(protyle: IProtyle): WireLayer | null {
    const element = protyle?.element as HTMLElement;
    const scroller = scrollerOf(protyle);
    if (!element || !scroller || !protyle?.wysiwyg?.element) return null;
    const old = wireLayers.get(element);
    if (old) return old;

    const layer = document.createElement("div");
    layer.className = LAYER_CLASS;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", SVG_CLASS);
    layer.appendChild(svg);
    scroller.appendChild(layer);
    // absolute 层的 containing block：滚动容器 static 时会向上逃逸到别的定位祖先
    if (getComputedStyle(scroller).position === "static") scroller.style.position = "relative";

    // 锚词点击=点线跳转同款（□3 spec §4.5）：capture 阶段拦截（内核对 data-type="a" 的
    // 链接点击处理先于我们），拖选产生的非 collapsed 选区不触发（按下即拖动是选词）
    const clickHandler = (e: Event) => {
        if (!(mindWireEnable.get() && mindWireWordWire.get())) return;
        const span = (e.target as HTMLElement)?.closest?.(`span[data-type="a"][data-href^="${WORD_WIRE_HREF_PREFIX}"]`);
        if (!span || !element.contains(span)) return;
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) return;
        e.preventDefault();
        e.stopPropagation();
        const href = getAttribute(span, "data-href");
        const other = [...element.querySelectorAll(`span[data-href="${href}"]`)]
            .find((s) => s !== span) as HTMLElement | undefined;
        if (other) {
            other.scrollIntoView({ behavior: "smooth", block: "center" });
            flashSpan(other);
        }
        flashSpan(span as HTMLElement);
    };
    element.addEventListener("click", clickHandler, true);

    const wl: WireLayer = { protyle, element, layer, svg, scroller, mo: null, ro: null, timer: undefined, gen: 0, stubs: [], scrollHandler: () => {}, rafId: 0, clickHandler };
    // 滚动三态（□4 spec §4.1.4）：只切残端 chip 显隐（rAF 节流合并滚动帧），
    // 线本体/裁剪零滚动监听（内容坐标系自然涌现）；chip 几何挂载时定死随内容走
    wl.scrollHandler = () => {
        if (wl.rafId) return;
        wl.rafId = requestAnimationFrame(() => {
            wl.rafId = 0;
            updateStubs(wl);
        });
    };
    scroller.addEventListener("scroll", wl.scrollHandler, { passive: true });
    // 刷新时机（spec §2.2）：内容增删/关键属性变更 debounce 200ms 全量重画；
    // attributeFilter 排除自身写入（CONTENT_ATTR/style），防自触发循环
    wl.mo = new MutationObserver(() => scheduleRedraw(protyle, wl));
    wl.mo.observe(protyle.wysiwyg.element, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-node-id", "data-type", "data-id", "data-href", "custom-lnk-my-id", "custom-lnk-to-ids", "custom-mindwire-enable"],
    });
    wl.ro = new ResizeObserver(() => scheduleRedraw(protyle, wl));
    wl.ro.observe(scroller);
    wireLayers.set(element, wl);
    return wl;
}

function scheduleRedraw(protyle: IProtyle, wl: WireLayer) {
    if (wl.timer) clearTimeout(wl.timer);
    wl.timer = window.setTimeout(() => {
        wl.timer = undefined;
        drawWireLayer(protyle, wl);
    }, 200);
}

/** 清词级锚词痕迹（accent 变量+跨行类+hot/flash/降级藏点残留）：重画前/门禁拒绝态/单端孤儿统一还原（与块级 clearAnchors 同模式） */
function clearWordMarks(element: HTMLElement) {
    element?.querySelectorAll(`span[data-type="a"][data-href^="${WORD_WIRE_HREF_PREFIX}"]`).forEach((e: HTMLElement) => {
        e.style.removeProperty(ACCENT_VAR);
        e.classList.remove("tomato-mind-wire-ml", "tomato-mind-wire-nodot", "tomato-mind-wire-top", HOT_CLASS, FLASH_CLASS);
    });
}

/** 门禁拒绝态：清空画（层壳与 observer 保留——custom-mindwire-enable 属性变更仍被
 *  监听，恢复 en 时 MutationObserver 可自行回画；dispose 只属于层生命周期终点） */
function blankLayer(wl: WireLayer) {
    wl.svg.innerHTML = "";
    wl.layer.style.height = "";
    removeStubs(wl);
    removeWireToolbar(); // 迷你条/chip 挂层（非 svg），须单独清
    clearAnchors(wl.element);
    clearWordMarks(wl.element);
}

/** 全量重画：清锚点染色→收线对→逐对画线；锚点未渲染（虚拟滚动）跳过由下轮补 */
async function drawWireLayer(protyle: IProtyle, wl: WireLayer) {
    try {
        const element = protyle?.element as HTMLElement;
        if (!element || !document.contains(element)) {
            if (element) disposeLayer(element, wl);
            return;
        }
        const gen = ++wl.gen;
        const attr = await siyuan.getBlockAttrs(protyle.block.rootID)
        if (wl.gen != gen) return;
        const en = attr?.["custom-mindwire-enable"]
        if (!(mindWireEnable.get() && en != "di")) {
            dlog(`draw skip gate enable=${mindWireEnable.get()} en=${en}`);
            blankLayer(wl);
            return;
        }

        clearAnchors(element);
        clearWordMarks(element);
        wl.svg.innerHTML = "";
        removeWireToolbar(); // 迷你条闭包引用旧 path/span，重画后必须重建
        removeStubs(wl); // 残端 chip 同理（与迷你条单例分开管理）
        const sc = wl.scroller;
        // 内容坐标原点 = 滚动容器视口左上 − 已滚距离（rect 差值只对齐容器视口顶，
        // 非 scrollTop=0 时重画必须补偿，否则线整体上偏 scrollTop）
        const origin = { left: sc.getBoundingClientRect().left, top: sc.getBoundingClientRect().top - sc.scrollTop };
        // 层高 = 内容全长（高度 100% 对 absolute 元素只是容器视口高，须显式铺满）
        wl.layer.style.height = sc.scrollHeight + "px";

        const set = new Set<string>();
        let n = 0;
        for (const [id1, id2] of collectPairs(element)) {
            if (set.has(id1 + id2) || set.has(id2 + id1)) continue;
            set.add(id1 + id2);
            set.add(id2 + id1);
            drawOne(wl, origin, id1, id2);
            n++;
        }
        // 词级线（□2 数据链，spec §3）：标记 span 对按 wireId 配对 → 词级贝塞尔。
        // 关 mindWireWordWire 时不扫不清（功能关着不动数据）
        let nw = 0;
        wl.layer.removeAttribute("data-degrade");
        if (mindWireWordWire.get()) {
            const relations = parseRelations(attr?.[RELATIONS_ATTR]);
            const { pairs, seen } = collectWordWires(element);
            // 长文自动降级 D11（spec §4.1.5）：>120 条=砍装饰（流动+圆点）不砍功能
            // （整线/跳转/残端 chip/迷你条保留）；线数回落自动恢复。层属性=e2e 断言锚。
            // 值必须写实 "1"：toggleAttribute 只设空串，[data-degrade="1"] 选择器与
            // 断言均不命中（□5 D11 造数补验实锤，CSS 藏点+断言此前恒假）
            const degraded = pairs.length > 120;
            if (degraded) {
                wl.layer.setAttribute("data-degrade", "1");
            } else {
                wl.layer.removeAttribute("data-degrade");
            }
            for (const { wireId, ends } of pairs) {
                drawWordOne(wl, origin, wireId, ends[0], ends[1], relations[wireId], protyle, degraded);
                nw++;
            }
            // 孤儿清理（spec §3.2）：属性条目 − DOM 扫集，差集非空才回写（避免无谓写）
            const cleaned = cleanupRelations(attr?.[RELATIONS_ATTR], seen);
            if (cleaned != null) {
                try {
                    await siyuan.setBlockAttrs(protyle.block.rootID, { [RELATIONS_ATTR]: cleaned } as AttrType);
                    dlog(`orphan cleanup root=${protyle.block.rootID} cleaned="${cleaned}"`);
                } catch (err) {
                    dlog(`orphan cleanup error ${err}`);
                }
            }
        }
        dlog(`draw ok root=${protyle.block.rootID} pairs=${n} word=${nw} scrollTop=${sc.scrollTop}`);
        // 残端 chip 水平钳制（spec §4.2）+ 占位带避让（□5 P1）：挂载循环结束后统一测量
        // （免逐个交错读写强制回流）；visibility 隐藏态保布局，offsetWidth 可测。避让先于
        // 钳制（避让后的位置仍受层缘 8px 钳制约束）；最后按当前滚动位首判显隐
        const layerW = wl.layer.clientWidth;
        for (const rec of wl.stubs) {
            for (const c of rec.chips) {
                const half = c.offsetWidth / 2;
                if (half <= 0) continue;
                const left = parseFloat(c.style.left);
                const top = parseFloat(c.style.top);
                const h = c.offsetHeight || 24;
                const obstacles = probeChipObstacles(wl, { left: left - half, top, w: half * 2, h });
                if (obstacles.length) {
                    const { dx, tight } = stubAvoidShift({ left: left - half, right: left + half, top, bottom: top + h }, obstacles, layerW);
                    if (tight) c.classList.add(STUB_TIGHT_CLASS);
                    else if (dx) c.style.left = left + dx + "px";
                }
                c.style.left = clampStubX(parseFloat(c.style.left), half, layerW) + "px";
            }
        }
        updateStubs(wl);
    } catch (err) {
        dlog(`draw error ${err}`);
    }
}

/** 线对收集：块引用 + 互链（均限定本编辑器内；跨编辑器锚点在内容坐标系下无法表达，跳过） */
function collectPairs(element: HTMLElement): [string, string][] {
    const pairs: [string, string][] = [];
    element.querySelectorAll(`span[data-type="block-ref"]`).forEach((e: HTMLElement) => {
        if (mindWireStarRefOnly.get() && e.textContent.trim() != "*") return;
        const id2 = getAttribute(e, "data-id");
        const id1 = getID(e);
        if (id1 && id2 && id1 != id2) pairs.push([id1, id2]);
    });
    element.querySelectorAll(`div[custom-lnk-my-id]`).forEach((e: HTMLElement) => {
        const id1 = getAttribute(e, "data-node-id");
        getAttribute(e, "custom-lnk-to-ids")
            ?.split(",")
            ?.forEach(lnk => {
                const t = element.querySelector(`div[custom-lnk-my-id="${lnk}"]`);
                const id2 = t ? getAttribute(t as HTMLElement, "data-node-id") : "";
                if (id1 && id2 && id1 != id2) pairs.push([id1, id2]);
            });
    });
    return pairs;
}

/** 词级线收集（spec §3）：本编辑器内词级标记 span 按 wireId 分组配对；
 *  前缀选择器天然不命中批注（#tomato-anno-）与普通链接 */
function collectWordWires(element: HTMLElement) {
    const items: { href: string; end: HTMLElement }[] = [];
    element.querySelectorAll(`span[data-type="a"][data-href^="${WORD_WIRE_HREF_PREFIX}"]`).forEach((e: HTMLElement) => {
        const href = getAttribute(e, "data-href");
        if (href) items.push({ href, end: e });
    });
    return groupWordWires(items);
}

/** 跨行 inline span 的 getBoundingClientRect 是联合盒（横向中心落在两行间空白），
 *  端点几何取 Range.getClientRects 的第一行 fragment（读序起点行）；无 range 时回退联合盒 */
function firstFragmentRect(s: HTMLElement): { rect: DOMRect; multiline: boolean } {
    try {
        const range = document.createRange();
        range.selectNodeContents(s);
        const rects = range.getClientRects();
        if (rects.length > 1) return { rect: rects[0], multiline: true };
        if (rects.length === 1) return { rect: rects[0], multiline: false };
    } catch { /* 回退联合盒 */ }
    return { rect: s.getBoundingClientRect(), multiline: false };
}

/** 词级单线（spec §4.1+§12）：方向感知锚点——同行双底缘 +8px 下出线（现状），跨行对端
 *  在上→本端顶缘出线；缘/端点/圆点几何全在 wordWireGeometry 一次判定。
 *  accent 写两端 span inline（圆点/hot/flash 同源）；rect 全零=未渲染跳过由下轮补。
 *  跨行词的 CSS ::after 圆点挂实现定义 fragment 会与端点分离（P0-1）：改由 svg circle
 *  画点（dotY=端点靠词一侧 3.5px，底/顶缘同构），CSS 点藏掉。
 *  □3：同 d 隐形命中走廊（pointer-events:stroke）挂交互——hover 高亮/点线跳转/长按迷你条
 *  □4 D11：降级档（>120 条）不加流动、藏圆点（跨行 svg circle 同跳过——CSS 只藏 ::after 罩不到它） */
function drawWordOne(wl: WireLayer, origin: { left: number; top: number }, wireId: string, s1: HTMLElement, s2: HTMLElement, relation: string | undefined, protyle: IProtyle, degraded: boolean) {
    const f1 = firstFragmentRect(s1);
    const f2 = firstFragmentRect(s2);
    if ((!f1.rect.width && !f1.rect.height) || (!f2.rect.width && !f2.rect.height)) return;
    const a1 = toContentRect(f1.rect, origin);
    const a2 = toContentRect(f2.rect, origin);
    const color = mindWireColorfull.get() && lastVerifyResult()
        ? relationColor(relation)
        : "var(--b3-font-color4)";
    s1.style.setProperty(ACCENT_VAR, color);
    s2.style.setProperty(ACCENT_VAR, color);
    s1.classList.toggle("tomato-mind-wire-ml", f1.multiline);
    s2.classList.toggle("tomato-mind-wire-ml", f2.multiline);
    s1.classList.toggle("tomato-mind-wire-nodot", degraded);
    s2.classList.toggle("tomato-mind-wire-nodot", degraded);

    // 上方空间 hoist 共用（□3 spec §12.6.3：顶缘端点收窄与 □5 chip 下置同一量，零新增布局读）
    const gap1 = availAboveOf(s1, a1.top, origin.top);
    const gap2 = availAboveOf(s2, a2.top, origin.top);
    // □3 方向感知锚点（spec §12）：跨行时对端在上→本端顶缘出线，几何（缘/端点/圆点）全在
    // wordWireGeometry 内一次判定；top 类名给 CSS ::after 圆点翻字顶（svg 路走 ends.dotY）
    const geo = wordWireGeometry(a1, a2, gap1, gap2);
    s1.classList.toggle("tomato-mind-wire-top", geo.ends[0].edge === "top");
    s2.classList.toggle("tomato-mind-wire-top", geo.ends[1].edge === "top");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("class", `${PATH_CLASS} ${WORD_PATH_CLASS}`);
    path.setAttribute("d", geo.d);
    path.style.stroke = color;
    path.style.strokeWidth = mindWireWidth.get().toString() + "px";
    // 虚实/流动三档同块级；词级 dasharray 用 "6 4" 新值（块级保持 "10"，spec §4.1.3）
    if (mindWireLine.get() && lastVerifyResult()) {
        path.style.strokeDasharray = "none";
    } else {
        path.style.strokeDasharray = "6 4";
        if (mindWireDynamicLine.get() && !degraded) path.classList.add(FLOW_CLASS);
    }
    wl.svg.appendChild(path);

    // 跨行端点：CSS 圆点已藏，svg 补画（dotY 按 缘：底缘=字底+4.5 / 顶缘=(top−eTop)+3.5，
    // spec §12.3）；降级档藏圆点时跨行端同跳过（线端点本身即视觉锚，spec §4.1.5）
    const ends = [
        { cx: a1.cx, end: geo.ends[0] },
        { cx: a2.cx, end: geo.ends[1] },
    ];
    for (const [{ cx, end }, ml] of [[ends[0], f1.multiline], [ends[1], f2.multiline]] as const) {
        if (!ml || degraded) continue;
        const dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("class", "tomato-mind-wire-dot");
        dot.setAttribute("cx", cx.toString());
        dot.setAttribute("cy", end.dotY.toString());
        dot.setAttribute("r", "2.5");
        dot.style.fill = color;
        dot.style.stroke = "var(--b3-theme-background)";
        dot.style.strokeWidth = "1px";
        wl.svg.appendChild(dot);
    }

    // 命中走廊（□3 spec §4.5）：与可见 path 同 d、stroke:none + pointer-events:stroke
    const hit = document.createElementNS(SVG_NS, "path");
    hit.setAttribute("class", HIT_CLASS);
    hit.setAttribute("d", geo.d);
    wl.svg.appendChild(hit);
    attachWireInteraction(wl, protyle, wireId, path, hit, s1, s2, geo.mid, relation);
    // 残端 chip（□4）：标签取对端词；点击与点线/锚词跳转共用 jumpWire。
    // □5 拍板：锚上方可用空间（到所在块上一有盒兄弟）<38px 时上态 chip 下置防贴碰
    // （□3 后 gap 已在上方 hoist，此处直传共用——chip 几何零改动，spec §12.5）
    attachStubs(wl, a1, a2, s1.textContent ?? "", s2.textContent ?? "", color, () => jumpWire(wl, s1, s2),
        [gap1, gap2]);
}

/** 锚词上方可用空间（内容坐标）：锚词 top 减所在块上一个有盒兄弟的底缘（文档
 *  顶/无兄弟时减 0=层顶）。零高度兄弟（hr 残影等）跳过继续上溯 */
function availAboveOf(span: HTMLElement, anchorTop: number, originTop: number): number {
    let prev = span.closest("div[data-node-id]")?.previousElementSibling as HTMLElement | null;
    while (prev && prev.getBoundingClientRect().height === 0) prev = prev.previousElementSibling as HTMLElement | null;
    const obstacleBottom = prev ? prev.getBoundingClientRect().bottom - originTop : 0;
    return anchorTop - obstacleBottom;
}

// ---------------------------------------------------------------------------
// 线交互（□3 · spec §4.5）：走廊 hover 高亮两端 / 点线跳转+闪高亮 / 线中点迷你条
// （6 关系色点+×删除；触屏长按 350ms 唤出）；迷你条单例挂层内、重画/换线即重建。
// ---------------------------------------------------------------------------

/** 闪高亮重放（spec §4.6）：加类前先移除+强制 reflow，animationend 自摘；1.2s 兜底（后台 tab 不派发） */
function flashSpan(s: HTMLElement) {
    if (!s?.isConnected) return;
    s.classList.remove(FLASH_CLASS);
    void s.offsetWidth;
    s.classList.add(FLASH_CLASS);
    const off = () => s.classList.remove(FLASH_CLASS);
    s.addEventListener("animationend", off, { once: true });
    setTimeout(off, 1200);
}

/** 点线跳转（spec §4.5）：整线=两端闪；一端离屏=平滑滚到离屏端（block:center）+其词闪高亮 */
function jumpWire(wl: WireLayer, s1: HTMLElement, s2: HTMLElement) {
    if (!s1.isConnected || !s2.isConnected) return;
    const sc = wl.scroller.getBoundingClientRect();
    const off = (s: HTMLElement) => {
        const r = s.getBoundingClientRect();
        return r.bottom < sc.top || r.top > sc.bottom;
    };
    const away = [s1, s2].filter(off);
    if (away.length) away[away.length - 1].scrollIntoView({ behavior: "smooth", block: "center" });
    flashSpan(s1);
    flashSpan(s2);
}

/** 迷你条单例：一次只一条线的（spec §4.5），换线/重画/删线即拆 */
let wireToolbar: HTMLDivElement | null = null;
function removeWireToolbar() {
    wireToolbar?.remove();
    wireToolbar = null;
}

/** 关系写入（spec §3.2/D12）：只动文档根属性不碰标记 DOM，写后重画刷新两端 accent */
async function setRelation(protyle: IProtyle, wireId: string, key: RelationKey) {
    try {
        const attr = await siyuan.getBlockAttrs(protyle.block.rootID);
        const map = parseRelations(attr?.[RELATIONS_ATTR]);
        map[wireId] = key;
        await siyuan.setBlockAttrs(protyle.block.rootID, { [RELATIONS_ATTR]: JSON.stringify(map) } as AttrType);
    } catch (err) {
        dlog(`setRelation error ${err}`);
    } finally {
        removeWireToolbar();
        redrawWire(protyle);
    }
}

/** 删除线（spec §4.5 × 钮）：逐端反选摘除标记（事务可 Ctrl+Z）；每摘一端内核重建块 DOM，
 *  必须按 href 现查下一端（旧引用已 detach）；属性条目由重画 cleanupRelations 差集兜 */
async function deleteWordWire(protyle: IProtyle, wireId: string) {
    const href = WORD_WIRE_HREF_PREFIX + wireId;
    let guard = 0;
    while (guard++ < 4) {
        const span = protyle.element?.querySelector(`span[data-href="${href}"]`) as HTMLElement | null;
        if (!span || !span.isConnected) break;
        if (!removeWordMark(protyle, span)) break;
    }
    removeWireToolbar();
    redrawWire(protyle);
    dlog(`delete wire ${wireId}`);
}

/** 走廊交互挂接：桌面 pointerenter=hot+迷你条、leave=还原+300ms 延迟隐藏（给指针移入
 *  迷你条留路）；触屏无 hover——长按 350ms 唤迷你条；click=点线跳转（拖选不触发 click） */
function attachWireInteraction(
    wl: WireLayer, protyle: IProtyle, wireId: string,
    path: SVGPathElement, hit: SVGPathElement, s1: HTMLElement, s2: HTMLElement,
    mid: { x: number; y: number }, relation: string | undefined,
) {
    let hideTimer: number | undefined;
    const setHot = (on: boolean) => {
        path.style.strokeWidth = (mindWireWidth.get() + (on ? 1 : 0)) + "px";
        for (const s of [s1, s2]) s.classList.toggle(HOT_CLASS, on);
    };
    const hideToolbar = () => {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = window.setTimeout(removeWireToolbar, 300);
    };
    const showToolbar = () => {
        removeWireToolbar();
        // viewTop=当前滚动位（□5 P2：中点贴视口顶时上浮会被容器 overflow 裁掉，翻 below）
        const pos = toolbarPos(mid, wl.scroller.scrollTop);
        const bar = document.createElement("div");
        bar.className = TOOLBAR_CLASS + (pos.below ? " tomato-mind-wire-toolbar--below" : "");
        bar.style.left = pos.left + "px";
        bar.style.top = pos.top + "px";
        // 关系色点行：Pro 门禁（colorfull+验签）关时迷你条退化为纯删除条（spec §4.5）
        if (mindWireColorfull.get() && lastVerifyResult()) {
            for (const key of RELATION_KEYS) {
                const dot = document.createElement("button");
                dot.className = "tomato-mind-wire-rel-dot";
                dot.style.color = RELATION_COLOR[key];
                dot.setAttribute("aria-pressed", String(key === relation));
                dot.title = RELATION_I18N[key]();
                dot.addEventListener("click", () => void setRelation(protyle, wireId, key));
                bar.appendChild(dot);
            }
            const sep = document.createElement("span");
            sep.className = "tomato-mind-wire-toolbar-sep";
            bar.appendChild(sep);
        }
        const x = document.createElement("button");
        x.className = "tomato-mind-wire-x";
        x.setAttribute("aria-label", tomatoI18n.删除导线);
        x.innerHTML = `<svg><use xlink:href="#iconClose"></use></svg>`;
        x.addEventListener("click", () => void deleteWordWire(protyle, wireId));
        bar.appendChild(x);
        bar.addEventListener("pointerenter", () => { if (hideTimer) { clearTimeout(hideTimer); hideTimer = undefined; } });
        bar.addEventListener("pointerleave", hideToolbar);
        wl.layer.appendChild(bar);
        wireToolbar = bar;
        // □5 P2 避弧：弧 bbox（细线近似为盒）与条相交时水平让位（近垂直弧下移无效，
        // vision □5 评审）——挂层后测实矩形换算内容坐标，让位后不再二次钳制（瞬态件）
        const bb = path.getBBox();
        if (bb.width || bb.height) {
            const lr = wl.layer.getBoundingClientRect();
            const br = bar.getBoundingClientRect();
            const dx = toolbarAvoidShift(
                { left: br.left - lr.left, right: br.right - lr.left, top: br.top - lr.top, bottom: br.bottom - lr.top },
                { left: bb.x, right: bb.x + bb.width, top: bb.y, bottom: bb.y + bb.height },
                wl.layer.clientWidth);
            if (dx) bar.style.left = parseFloat(bar.style.left) + dx + "px";
        }
    };

    hit.addEventListener("pointerenter", (e) => {
        if ((e as PointerEvent).pointerType === "touch") return;
        setHot(true);
        showToolbar();
    });
    hit.addEventListener("pointerleave", (e) => {
        if ((e as PointerEvent).pointerType === "touch") return;
        setHot(false);
        hideToolbar();
    });
    let holdTimer: number | undefined;
    hit.addEventListener("pointerdown", (e) => {
        if ((e as PointerEvent).pointerType !== "touch") return;
        holdTimer = window.setTimeout(showToolbar, 350);
    });
    const cancelHold = () => {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = undefined; }
    };
    hit.addEventListener("pointerup", cancelHold);
    hit.addEventListener("pointercancel", cancelHold);
    hit.addEventListener("click", () => jumpWire(wl, s1, s2));
}

// ---------------------------------------------------------------------------
// 滚动三态 + 线头残端（□4 · spec §4.1.4/§4.2）：双 chip 预建挂层内锚词旁
// （内容坐标随滚动走，方向由两端内容序定死——挂「较上端」的 chip 显示时必然是
// 下端离屏）；滚动事件 rAF 节流只切显隐，线本体/裁剪零滚动监听（D1 不破）。
// ---------------------------------------------------------------------------

/** chip 占位带文本探测（□5 P1）：box=层内容坐标拟占位矩形，3 点采样（横向 25/50/75%），
 *  命中 wysiwyg 内文本时返回该行行盒（Range.getClientRects 取含采样点的 rect，行级水平
 *  边界——块盒满宽会把段落末行右侧空白误判成无空隙）。采样带在视口外时同步虚拟滚动
 *  （设-探-恢复，scroll 事件异步派发，同步窗口内无监听执行=零闪烁）。层 pointer-events:none
 *  与 chip visibility:hidden 都被 elementFromPoint 穿透；弧 path 不在 wysiwyg 内天然排除 */
function probeChipObstacles(wl: WireLayer, box: { left: number; top: number; w: number; h: number }): { left: number; right: number; top: number; bottom: number }[] {
    const out: { left: number; right: number; top: number; bottom: number }[] = [];
    const seen = new Set<Element>();
    for (const xr of [0.25, 0.5, 0.75]) {
        const lr = wl.layer.getBoundingClientRect();
        const vx = lr.left + box.left + box.w * xr;
        const vy = lr.top + box.top + box.h / 2;
        // 带中点在视口外：虚拟滚动挪到视口中部（保存-恢复防浮点漂移）
        const needScroll = vy < 0 || vy > window.innerHeight;
        const saved = wl.scroller.scrollTop;
        if (needScroll) wl.scroller.scrollTop = saved + vy - window.innerHeight / 2;
        try {
            const lr2 = needScroll ? wl.layer.getBoundingClientRect() : lr;
            const y2 = lr.top + box.top + box.h / 2 - (lr.top - lr2.top);
            const el = document.elementFromPoint(vx, y2);
            if (!el?.closest?.(".protyle-wysiwyg")) continue;
            if (!Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? "").trim())) continue;
            if (seen.has(el)) continue;
            // 行盒=命中元素内与采样点同行的 text node 矩形联合（文字实宽；块盒满宽会把
            // 段落末行右侧空白误判成无空隙、窄标题误判成满行——selectNodeContents 整块
            // 在 Chromium 返回聚合块盒，不可用）
            const range = document.createRange();
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
            for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                if (!(n.textContent ?? "").trim()) continue;
                range.selectNode(n);
                for (const r of range.getClientRects()) {
                    if (y2 >= r.top && y2 <= r.bottom && r.width > 0) {
                        left = Math.min(left, r.left);
                        right = Math.max(right, r.right);
                        top = Math.min(top, r.top);
                        bottom = Math.max(bottom, r.bottom);
                    }
                }
            }
            if (right < left) continue;
            seen.add(el);
            const org = wl.layer.getBoundingClientRect();
            out.push({ left: left - org.left, right: right - org.left, top: top - org.top, bottom: bottom - org.top });
        } finally {
            if (needScroll) wl.scroller.scrollTop = saved;
        }
    }
    return out;
}

/** 残端 chip 制造（spec §4.2 模板）：chevron+色点+目标词标签（8 字截断），
 *  accent=线色同源；点击=jumpWire（滚到离屏端+双端闪，离屏端检测在役）。
 *  availAbove=锚上方可用空间（词级；上态 <38px 下置防贴碰，spec §4.2 □5 拍板）。
 *  □5 P1：上置位拟占带内有字形（availAbove 块级测不到的块内上一行/贴邻窄块）也下置 */
function makeStub(
    wl: WireLayer, anchor: { cx: number; top: number; bottom: number }, dir: "down" | "up",
    word: string, color: string, onJump: () => void, availAbove = Infinity,
): HTMLButtonElement {
    const pos = stubPos(anchor, dir, availAbove);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `${STUB_CLASS} tomato-mind-wire-stub--${dir} ${STUB_OFF_CLASS}`;
    chip.style.left = pos.left + "px";
    chip.style.top = pos.top + "px";
    chip.style.setProperty(ACCENT_VAR, color);
    chip.innerHTML = `<svg class="tomato-mind-wire-stub-arrow"><use xlink:href="#iconArrowDown"></use></svg><span class="tomato-mind-wire-stub-dot"></span>`;
    const label = document.createElement("span");
    label.className = "tomato-mind-wire-stub-label";
    label.textContent = wordClip(word.trim(), 8);
    chip.appendChild(label);
    chip.setAttribute("aria-label", `${tomatoI18n.连到}：「${wordClip(word.trim(), 8)}」`);
    chip.addEventListener("click", onJump);
    wl.layer.appendChild(chip);
    if (dir === "up" && pos.top === anchor.top - 38) {
        const w = chip.offsetWidth;
        if (w && probeChipObstacles(wl, { left: pos.left - w / 2, top: pos.top, w, h: 24 }).length) {
            chip.style.top = anchor.bottom + 14 + "px";
        }
    }
    return chip;
}

/** 双 chip 挂接（词级/块级共用）：两端各一（锚自己旁、标签取对端词），
 *  rec.ys 预存内容坐标供滚动期纯数字判定；availAbove 可选 [端1,端2] 上方可用空间
 *  （词级传——上态贴碰下置用；块级不传，骑块顶是块级既有形态） */
function attachStubs(
    wl: WireLayer,
    a1: { cx: number; top: number; bottom: number }, a2: { cx: number; top: number; bottom: number },
    word1: string, word2: string, color: string,
    onJump: () => void, availAbove?: [number, number],
) {
    const c1 = makeStub(wl, a1, stubDir(a1, a2), word2, color, onJump, availAbove?.[0]);
    const c2 = makeStub(wl, a2, stubDir(a2, a1), word1, color, onJump, availAbove?.[1]);
    wl.stubs.push({
        ys: [{ top: a1.top, bottom: a1.bottom }, { top: a2.top, bottom: a2.bottom }],
        chips: [c1, c2],
    });
}

function removeStubs(wl: WireLayer) {
    for (const rec of wl.stubs) rec.chips.forEach((c) => c.remove());
    wl.stubs = [];
}

/** 三态显隐：视口=滚动容器 [scrollTop, scrollTop+clientHeight] 映射到内容坐标，
 *  wireViewState 判定后只切 --off 类（visibility 不触发重排）；
 *  □5 拍板：可见 chip 贴视口顶/底缘被裁时 marginTop 精确让位（stubEdgeShift） */
function updateStubs(wl: WireLayer) {
    const top = wl.scroller.scrollTop;
    const view = { top, bottom: top + wl.scroller.clientHeight };
    for (const rec of wl.stubs) {
        const st = wireViewState(rec.ys[0], rec.ys[1], view);
        rec.chips.forEach((chip, i) => {
            const on = st.state === "stub" && st.visibleEnd === i;
            chip.classList.toggle(STUB_OFF_CLASS, !on);
            const mt = on ? stubEdgeShift(parseFloat(chip.style.top), view) : 0;
            const mtPx = mt + "px";
            if (chip.style.marginTop !== mtPx) chip.style.marginTop = mtPx;
        });
    }
}

// ---------------------------------------------------------------------------
// 划词两步流（□3 · spec §4.3/§4.4）：第一步「关联起点」即写起点标记（单端不成线只
// 圆点，跨刷新不丢——比内存存选区稳）；第二步「连到」写终点标记+首写关系条目成线；
// pending 期间状态芯片（MindWirePending，Esc/移动端 × 取消=摘起点标记）。
// ---------------------------------------------------------------------------

interface WordPending {
    wireId: string;
    /** 起点词全文（显示处 wordClip 截断） */
    word: string;
    rootId: string;
}
let pending: WordPending | null = null;
let pendingChip: { dismiss: () => void } | null = null;

/** 划词选区判定（菜单项显隐与两步写入共用）：window 选区过词级有效性提纯
 *  （非 collapsed + 单块（a 类型跨块 setInlineMark 直接 return 静默失败，
 *  词粒度划选天然单块）+ 非代码块 + 有实文本，判定体在 domUtils normalizeWordRange） */
function currentTextRange(): Range | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return normalizeWordRange(sel.getRangeAt(0));
}

/** 工具条/快捷键触发时的选区兜底（二期 □1）：选区未被顶掉走 window 选区（须落在本
 *  编辑器内——分屏下别把 A 屏选区写进 B 屏事务，评审 P1-1）；被顶掉（工具条点击吞选区/
 *  焦点漂移）回退 protyle.toolbar.range——内核划词渲染时留存，与 setWordMark 的前置赋值
 *  同一通道，过同一有效性判定（含脱离文档拦截） */
function wordWireRange(protyle: IProtyle): Range | null {
    const sel = currentTextRange();
    if (sel && protyle.wysiwyg?.element?.contains(sel.startContainer)) return sel;
    return normalizeWordRange(protyle?.toolbar?.range);
}

/** 划词工具条两态钮状态同步（二期 □1）：内核只在工具条构建/插件装载时收项、划词
 *  渲染不重调，挂 document selectionchange 补态——显隐=三层开关+选区落在本编辑器且
 *  有效；aria-label 两态换写（wordWireTip 同源右键菜单），保留内核拼的热键尾注 */
function syncWordWireToolbar() {
    const tip = wordWireTip(pending?.word ?? null, tomatoI18n.关联起点, tomatoI18n.连到);
    const selRange = currentTextRange();
    getAllEditor().forEach(({ protyle }) => {
        const btn = (protyle as any)?.toolbar?.element?.querySelector(`button[data-type="${WORD_TOOLBAR_NAME}"]`) as HTMLButtonElement | null;
        if (!btn) return;
        const gates = mindWireCheckbox.get() && mindWireWordWire.get() && mindWireEnable.get();
        const inEditor = !!selRange && !!protyle.wysiwyg?.element?.contains(selRange.startContainer);
        // 不用 fn__none：内核「条目可见性」设置同用 fn__none 管隐藏，互写会打架（评审 P1-4）；
        // style.display 独立通道，用户在外观设置里隐藏本钮后插件不再顶回
        btn.style.display = gates && inEditor ? "" : "none";
        btn.setAttribute("aria-label", mergeTipKeepHotkey(btn.getAttribute("aria-label") ?? "", tip));
    });
}

/** 选区锚点落着的既有词级标记 wireId（「划在起点同一 span」判定用） */
function selExistingWireId(range: Range): string | null {
    const asEl = (n: Node) => (n.nodeType === 3 ? n.parentElement : (n as HTMLElement));
    const span = asEl(range.startContainer)?.closest?.(`span[data-type="a"][data-href^="${WORD_WIRE_HREF_PREFIX}"]`);
    return span ? wireIdFromHref(getAttribute(span, "data-href")) : null;
}

/** 写词级标记（批注同款 API，Annotations.ts:393 先例）；写后清菜单防 linkMenu 残留 */
function setWordMark(protyle: IProtyle, range: Range, href: string): boolean {
    try {
        protyle.toolbar.range = range.cloneRange();
        protyle.toolbar.setInlineMark(protyle, "a", "range", { type: "a", color: href });
        (globalThis as any).siyuan?.menus?.menu?.remove();
        return true;
    } catch (err) {
        dlog(`setWordMark error ${err}`);
        return false;
    }
}

/** 反选摘除标记（spec §11 验证点 1）：range 须落在 span 的 text node 上
 *  （startContainer.nodeType===3）——rangeTypes 才会从 parent span 收到 data-type="a"，
 *  不带 textObj 调用即走 shouldRemove 移除路径（updateBatchTransaction 可 Ctrl+Z） */
function removeWordMark(protyle: IProtyle, span: HTMLElement): boolean {
    const first = span.firstChild;
    const last = span.lastChild;
    if (!first || !last || first.nodeType !== 3 || last.nodeType !== 3) return false;
    try {
        const range = document.createRange();
        range.setStart(first, 0);
        range.setEnd(last, (last.textContent ?? "").length);
        protyle.toolbar.range = range;
        protyle.toolbar.setInlineMark(protyle, "a", "range");
        (globalThis as any).siyuan?.menus?.menu?.remove();
        return true;
    } catch (err) {
        dlog(`removeWordMark error ${err}`);
        return false;
    }
}

/** 关系条目首写（默认「关联」灰，spec §4.7：线成后迷你条改色，不强迫先选） */
async function ensureRelation(protyle: IProtyle, wireId: string) {
    try {
        const attr = await siyuan.getBlockAttrs(protyle.block.rootID);
        const map = parseRelations(attr?.[RELATIONS_ATTR]);
        if (map[wireId]) return;
        map[wireId] = "related";
        await siyuan.setBlockAttrs(protyle.block.rootID, { [RELATIONS_ATTR]: JSON.stringify(map) } as AttrType);
    } catch (err) {
        dlog(`ensureRelation error ${err}`);
    }
}

/** 按 wireId 找编辑器内标记 span（Esc 取消/替换起点时摘除用；找不到=用户已手动删词，静默过） */
function findEndSpan(protyle: IProtyle, wireId: string): HTMLElement | null {
    return protyle?.element?.querySelector(`span[data-href="${WORD_WIRE_HREF_PREFIX}${wireId}"]`) as HTMLElement | null;
}

/** 闪两端（线成确认反馈，spec §4.3 第二步）：写入重建 DOM 后现查新 span */
function flashWireEnds(protyle: IProtyle, wireId: string) {
    protyle.element?.querySelectorAll(`span[data-href="${WORD_WIRE_HREF_PREFIX}${wireId}"]`).forEach((s) => flashSpan(s as HTMLElement));
}

function showPendingChip() {
    hidePendingChip();
    if (!pending) return;
    const app = mount(MindWirePending, {
        target: document.body,
        props: {
            word: wordClip(pending.word),
            accent: "var(--b3-font-color5)",
            isMobile: events.isMobile,
            oncancel: () => cancelPending(),
            onclosed: () => unmount(app),
        },
    });
    pendingChip = { dismiss: () => app.dismiss() };
}

function hidePendingChip() {
    pendingChip?.dismiss();
    pendingChip = null;
}

/** 取消 pending（Esc/芯片 ×）：摘起点标记（若还在 DOM）+ 芯片退场；span 不在 DOM
 *  （内核重建间隙/用户已删词）不再纯静默——dlog 记命中态，标记若仍在文档以单端
 *  圆点存在，点击锚词拾回可再删（二期 □2 后无死路） */
function cancelPending() {
    const p = pending;
    pending = null;
    hidePendingChip();
    syncWordWireToolbar();
    if (!p) return;
    // fallback 收紧为同根才用（□2 P2-3）：异文档编辑器里 findEndSpan 恒 miss，只产误导日志
    const fallback = events.protyle?.protyle;
    const prot = protyleByRootId(p.rootId)
        ?? (fallback?.block?.rootID === p.rootId ? fallback : null);
    if (!prot) {
        // 兜底也找不到（文档已关页签）：标记留在文档，可拾回再删；无死路不打断芯片退场
        dlog(`pending cancel ${p.wireId} no-protyle`);
        return;
    }
    const span = findEndSpan(prot, p.wireId);
    if (span) {
        removeWordMark(prot, span);
        redrawWire(prot);
    }
    dlog(`pending cancel ${p.wireId} span=${span ? "hit" : "miss"}`);
}

/** DOM 元素 → 所属编辑器（拾回点击定位目标 protyle；分屏下按 DOM 归属判，不依赖激活态）。
 *  isEditor 守卫（评审 P1-2）：反链面板/搜索预览等嵌入副本只渲染部分块——成线在其内
 *  会被数成单端误判孤儿，一律跳过只在真编辑器里判 */
function protyleByElement(el: HTMLElement): IProtyle | null {
    for (const { protyle } of getAllEditor()) {
        if (isEditor(protyle) && protyle?.element?.contains(el)) return protyle;
    }
    return null;
}

/** 文档根 id → 所属编辑器（cancelPending 摘标记定位）：events.protyle 是「最后点击的
 *  编辑器」——拾回点击 preventDefault 拦 click-editorcontent 后/冷启动未点过内容时为
 *  空或旧值（e2e 实锤芯片退场标记不摘），pending.rootId 才是摘除的语义归属 */
function protyleByRootId(rootId: string): IProtyle | null {
    for (const { protyle } of getAllEditor()) {
        if (isEditor(protyle) && protyle?.block?.rootID === rootId) return protyle;
    }
    return null;
}

/** 孤儿拾回（二期 □2）：点击单端锚词 span → 沿用原 wireId 重建 pending + 芯片重现，
 *  之后照常「连到」成线 / Esc 摘除——孤儿圆点由此获得删除与续连双出口。已有 pending
 *  且非同线=替换语义（摘旧起点标记，与 startWordWire 替换一致）；同线重拾幂等（点着的
 *  span 就是起点本体，不能摘自己）。调用方已保证开关在开 + span 单端 */
function reviveWordWire(protyle: IProtyle, span: HTMLElement) {
    const p = reviveWordPending(getAttribute(span, "data-href"), span.textContent ?? "", protyle.block.rootID);
    if (!p) return;
    // 同线同文档重拾幂等短路（□2 P2-1：点着的 span 就是起点本体，重挂芯片必闪出场
    // 动画）；wireId 同而 rootId 异=块复制出的跨文档副本（复评 P2-2），走替换分支
    // 改挂本端防「B 文档连终点恒 crossdoc」困局
    if (pending?.wireId === p.wireId && pending?.rootId === p.rootId) {
        dlog(`pending revive idem ${p.wireId}`);
        return;
    }
    if (pending) {
        // 替换摘旧按 pending 的语义归属定位（□2 P1-3）：被点击编辑器与 pending 可能异
        // 文档（芯片跨文档常驻），在被点击编辑器里查旧标记恒 miss 留脏孤儿；同 wireId
        // 跨文档副本场景 fallback 到被点击编辑器会命中刚点的 span 自噬（终签 P2）——
        // 宁 miss 走 replace-miss 日志，旧标记留 A 文档可再拾回
        const oldProt = protyleByRootId(pending.rootId)
            ?? (pending.wireId === p.wireId ? null : protyle);
        const old = oldProt ? findEndSpan(oldProt, pending.wireId) : null;
        if (old && oldProt) removeWordMark(oldProt, old);
        else dlog(`pending revive replace-miss ${pending.wireId}`);
    }
    pending = p;
    showPendingChip();
    syncWordWireToolbar();
    dlog(`pending revive ${p.wireId} word=${p.word}`);
}

// ---------------------------------------------------------------------------
// 块级线（现役行为原样：直线/裸端点/hash 色，spec §4.9 块级现状不动）
// ---------------------------------------------------------------------------

/** 锚点五级回退（现役 getAnchor 原样迁移，查询范围从全编辑器收窄到本 element） */
function getAnchor(element: HTMLElement, id: string): HTMLElement | null {
    return element.querySelector(`div[data-node-id="${id}"] > div[contenteditable] > span[data-type="block-ref"]`)
        ?? element.querySelector(`div[data-node-id="${id}"] > div[contenteditable] > span[data-type="a"]`)
        ?? element.querySelector(`div[data-node-id="${id}"] > div[contenteditable] > span`)
        ?? element.querySelector(`div[data-node-id="${id}"] > div[contenteditable]`)
        ?? element.querySelector(`div[data-node-id="${id}"]`);
}

function wireColor(id1: string, id2: string) {
    if (mindWireColorfull.get() && lastVerifyResult()) {
        const hashcolor = murmurHash3(id1 + id2)
        return `var(--b3-font-color${1 + (hashcolor % 12)})`
    }
    return "var(--b3-font-color4)"
}

/** 锚块染色（现役 borderAndLine 的 border 侧，视觉照旧） */
function paintAnchor(e: HTMLElement, c: string) {
    e.setAttribute(CONTENT_ATTR, "1");
    e.style.borderColor = c;
    e.style.borderWidth = mindWireWidth.get().toString() + "px";
    if (mindWireLine.get() && lastVerifyResult()) {
        e.style.borderStyle = "solid";
    } else {
        e.style.borderStyle = "dashed";
    }
}

function drawOne(wl: WireLayer, origin: { left: number; top: number }, id1: string, id2: string) {
    const a1 = getAnchor(wl.element, id1);
    const a2 = getAnchor(wl.element, id2);
    if (!a1 || !a2) return;
    const r1 = shiftRect(a1.getBoundingClientRect(), origin);
    const r2 = shiftRect(a2.getBoundingClientRect(), origin);
    const p1 = getEdgePoint(r1, r2);
    const p2 = getEdgePoint(r2, r1);

    paintAnchor(a1, wireColor(id1, id2));
    paintAnchor(a2, wireColor(id1, id2));

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("class", PATH_CLASS);
    path.setAttribute("d", blockWirePath(p1, p2));
    path.style.stroke = wireColor(id1, id2);
    path.style.strokeWidth = mindWireWidth.get().toString() + "px";
    // 虚实/流动三档（块级 dasharray 保持 "10" 现状，spec §4.1.3）
    if (mindWireLine.get() && lastVerifyResult()) {
        path.style.strokeDasharray = "none";
    } else {
        path.style.strokeDasharray = "10";
        if (mindWireDynamicLine.get()) path.classList.add(FLOW_CLASS);
    }
    wl.svg.appendChild(path);
    // 残端 chip（□4，块级同适用三态）：锚=块 rect 中心/上下缘，标签=对端文本前 8 字；
    //  星引用锚文本恒为「*」零信息（mindWireStarRefOnly 连线全是它），回退取所在块文本
    const c = wireColor(id1, id2);
    const blockWord = (a: HTMLElement) => {
        const t = (a.closest("div[data-node-id]")?.textContent ?? a.textContent ?? "").trim();
        return t || (a.textContent ?? "*").trim();
    };
    attachStubs(
        wl,
        { cx: (r1.left + r1.right) / 2, top: r1.top, bottom: r1.bottom },
        { cx: (r2.left + r2.right) / 2, top: r2.top, bottom: r2.bottom },
        blockWord(a1), blockWord(a2), c,
        () => jumpWire(wl, a1, a2),
    );
}

function redrawWire(protyle: IProtyle) {
    const wl = ensureLayer(protyle);
    if (wl) drawWireLayer(protyle, wl);
}

class MindWire {
    plugin: BaseTomatoPlugin;
    /** 划词工具条补态监听（二期 □1）：document 级 selectionchange，onunload 摘除 */
    private onSelectionChange = () => syncWordWireToolbar();
    /** 孤儿拾回点击监听（二期 □2）：document click capture（先于内核 element 冒泡链，
     *  拦链接打开/选区默认行为）；命中单端锚词（孤儿）→ 拾回重现芯片；成线锚词（同
     *  href ≥2 span）不拦——点击交互另有归属。onunload 摘除 */
    private onWordMarkClick = (e: MouseEvent) => {
        // gate 含 checkbox 而成线锚词跳转（ensureLayer clickHandler）不含：拾回属两步流
        // 功能族（wordWire），跳转属线交互渲染族——门禁集合有意不同（□2 评审 P2-2）
        if (!(mindWireCheckbox.get() && mindWireWordWire.get() && mindWireEnable.get())) return;
        const span = (e.target as HTMLElement | null)?.closest?.(`span[data-type="a"][data-href^="${WORD_WIRE_HREF_PREFIX}"]`) as HTMLElement | null;
        if (!span || !span.isConnected) return;
        const protyle = protyleByElement(span);
        if (!protyle) return;
        // 拖选让位（评审 P1-1，ensureLayer clickHandler 同款）：按下即拖动选词 mouseup 仍
        // 派发 click 且选区非 collapsed——是选词手势不是点击，不当拾回
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) return;
        const href = getAttribute(span, "data-href");
        // 单端判定：同 href ≥2 span=成线不拦（放行给 ensureLayer 的跳转链）；wireId 仅
        // [0-9a-z] 可直接进属性选择器
        const ends = protyle.element?.querySelectorAll(`span[data-type="a"][data-href="${href}"]`);
        if (!ends || ends.length !== 1) return;
        e.preventDefault();
        e.stopPropagation();
        reviveWordWire(protyle, span);
    };

    private globalEnable() {
        if (mindWireEnable.get()) {
            mindWireEnable.write(false)
            siyuan.pushMsg(tomatoI18n.禁用思维导线)
        } else {
            mindWireEnable.write(true)
            siyuan.pushMsg(tomatoI18n.启用思维导线)
        }
        // 开关翻转即刻刷新可见编辑器（旧实现要等下一次点击/切换页签）
        getAllEditor().forEach(p => {
            if (isEditor(p.protyle)) {
                mindWireEnable.get() ? redrawWire(p.protyle) : removeWireLayer(p.protyle);
            }
        });
    }

    private mindMenu(detail: TomatoMenu) {
        const menu = detail.menu;
        addIfVisible(menu, MindWire启用或禁用思维导线.langKey, {
            label: MindWire启用或禁用思维导线.langText(),
            icon: MindWire启用或禁用思维导线.icon,
            accelerator: MindWire启用或禁用思维导线.m,
            click: () => this.globalEnable(),
        }, MindWire启用或禁用思维导线.menu());
        addIfVisible(menu, MindWire启用或禁用文档思维导线.langKey, {
            label: MindWire启用或禁用文档思维导线.langText(),
            icon: MindWire启用或禁用文档思维导线.icon,
            accelerator: MindWire启用或禁用文档思维导线.m,
            click: () => toggleDocMindWire(events.protyle?.protyle),
        }, MindWire启用或禁用文档思维导线.menu());
        this.wordWireMenu(menu);
    }

    /** 划词两步流菜单（□3 spec §4.3）：显隐=门禁链+划词选区有效（单块非空）；
     *  无 pending=「关联起点」一项；有 pending=「连到：××」（主意图在前）+
     *  「关联起点」（替换起点，芯片文案热更新）两项 */
    private wordWireMenu(menu: any) {
        if (!(mindWireCheckbox.get() && mindWireWordWire.get() && mindWireEnable.get())) return;
        const protyle = events.protyle?.protyle;
        if (!protyle) return;
        // 菜单构造时判定选区（划词右键选区仍在）；点击回调里再验一次防选区被菜单交互顶掉
        if (!currentTextRange()) return;
        addIfVisible(menu, WORD_MENU_KEY, pending ? {
            label: wordWireTip(pending.word, tomatoI18n.关联起点, tomatoI18n.连到),
            icon: "iconWire",
            click: () => void this.finishWordWire(protyle),
        } : {
            label: tomatoI18n.关联起点,
            icon: "iconWire",
            click: () => this.startWordWire(protyle),
        });
        if (pending) {
            addIfVisible(menu, WORD_MENU_KEY, {
                label: tomatoI18n.关联起点,
                icon: "iconWire",
                click: () => this.startWordWire(protyle),
            });
        }
    }

    /** 第一步/替换起点（spec §4.3）：写起点标记（单端不成线只圆点，刷新不丢）+
     *  芯片出场；pending 期重复执行=摘旧标记换新起点（芯片文案随重挂热更新）。
     *  preRange=工具条/快捷键通道传入的兜底选区（右键菜单路径不传，走现场选区） */
    private startWordWire(protyle: IProtyle, preRange?: Range | null) {
        const range = preRange ?? currentTextRange();
        if (!range) return;
        if (pending) {
            const old = findEndSpan(protyle, pending.wireId);
            if (old) removeWordMark(protyle, old);
            pending = null;
        }
        const wireId = makeWireId();
        const href = WORD_WIRE_HREF_PREFIX + wireId;
        // 词文本必须在 setWordMark 前取：内核写标记会手术块 DOM（选已标记词时 extract
        // 重建文本节点），事后 range 指向脱离节点 toString 读出空串（e2e 实锤空词起点）；
        // ZWSP 一并剥净（评审 P2-2：词内隐形字符会进芯片文案与截断计数）；跨行选区
        // 内部换行同剥（□2 P2-4：芯片 nowrap 渲染与截断计数不含它，与 revive 同规）
        const word = range.toString().replace(/[\u200b\n]/g, "").trim();
        // 替换起点失败不留孤儿芯片（评审 P2-3：pending 已清而芯片还挂着旧词，Esc/× 变空操作）
        if (!setWordMark(protyle, range, href)) {
            hidePendingChip();
            syncWordWireToolbar();
            return;
        }
        pending = { wireId, word, rootId: protyle.block.rootID };
        showPendingChip();
        syncWordWireToolbar();
        dlog(`pending start ${wireId} word=${pending.word}`);
    }

    /** 第二步连终点（spec §4.3）：同词/跨文档边界 toast 且 pending 保留；
     *  成线=关系条目首写（属性先落防丢）→ 终点标记 → 主动重画+两端闪高亮 */
    private async finishWordWire(protyle: IProtyle, preRange?: Range | null) {
        const p = pending;
        if (!p) return;
        const range = preRange ?? currentTextRange();
        if (!range) return;
        const check = checkWireEnd(
            { wireId: p.wireId, rootId: p.rootId },
            { selWireId: selExistingWireId(range), rootId: protyle.block.rootID },
        );
        if (check === "same") {
            siyuan.pushMsg(tomatoI18n.起点终点相同);
            return;
        }
        if (check === "crossdoc") {
            siyuan.pushMsg(tomatoI18n.词级导线仅限本文档);
            return;
        }
        await ensureRelation(protyle, p.wireId);
        if (!setWordMark(protyle, range, WORD_WIRE_HREF_PREFIX + p.wireId)) return;
        pending = null;
        hidePendingChip();
        redrawWire(protyle);
        flashWireEnds(protyle, p.wireId);
        syncWordWireToolbar();
        dlog(`wire done ${p.wireId}`);
    }

    /** 入口三通道统一两态入口（二期 □1）：划词工具条项与命令快捷键共用（右键菜单
     *  仍走 wordWireMenu 双验路径）；无 pending=标起点，有 pending=连终点 */
    private wordWireAction(protyle: IProtyle) {
        if (!(mindWireCheckbox.get() && mindWireWordWire.get() && mindWireEnable.get())) return;
        const range = wordWireRange(protyle);
        if (!range) return;
        if (pending) void this.finishWordWire(protyle, range);
        else this.startWordWire(protyle, range);
    }

    /** 官方划词工具条扩展（Plugin.updateProtyleToolbar 委托自 index.ts，二期 □1 本仓
     *  首用）：恒附项——插件构造期收项早于设置落库，门禁与两态交给 selectionchange
     *  同步（syncWordWireToolbar）；name=命令 langKey 共享 keymap 节点，键位可改 */
    updateProtyleToolbar(toolbar: Array<string | IMenuItem>): Array<string | IMenuItem> {
        toolbar.push({
            name: WORD_TOOLBAR_NAME,
            icon: "iconWire",
            tip: wordWireTip(pending?.word ?? null, tomatoI18n.关联起点, tomatoI18n.连到),
            hotkey: MindWire划词连线.m,
            // 官方 click 实参=Protyle 包装类（ToolbarItem 调 getInstance()=>this），
            // toolbar/setInlineMark 在内层 .protyle（IProtyle）——e2e 实锤缺这层解包
            click: (protyle: Protyle) => this.wordWireAction(protyle.protyle),
        });
        return toolbar;
    }

    async onload(plugin: BaseTomatoPlugin) {
        dlog(`onload checkbox=${mindWireCheckbox.get()}`);
        // 补态监听先于总开关早退挂上（评审 P1-3）：工具条项恒附（构造期内核已收项），
        // checkbox 关闭态冷启动若无监听，按钮裸露成点击无反馈的死按钮；sync 的 gates
        // 含 checkbox，off 态自动隐藏；拾回点击同策略常驻（监听体内运行时 gate）
        document.addEventListener("selectionchange", this.onSelectionChange);
        document.addEventListener("click", this.onWordMarkClick, true);
        if (!mindWireCheckbox.get()) return;
        this.plugin = plugin;

        // 事件监听须先于 verifyKeyTomato 的网络往返注册：loaded-protyle-* 在窗口期
        // 先发走会永久错过（旧实现靠 wheel 重画无意兜住此竞态，内容坐标系删 wheel 后裸露）
        events.addListener("mind wire events 2025-5-24 17:24:22", (eventType, detail: Protyle) => {
            // destroy 的 detail=IProtyle 本体（Events.ts setReadingPointMap 对其单独绕行）
            if (eventType == EventType.destroy_protyle) {
                removeWireLayer((detail as any)?.protyle ?? detail);
                return;
            }
            if (eventType == EventType.loaded_protyle_static || eventType == EventType.loaded_protyle_dynamic || eventType == EventType.click_editorcontent || eventType == EventType.switch_protyle) {
                navigator.locks.request("lock 2025-5-24 17:24:27", { ifAvailable: true }, async (lock) => {
                    const element = detail?.protyle?.element;
                    if (lock && element && isEditor(detail?.protyle)) {
                        if (mindWireEnable.get()) {
                            redrawWire(detail.protyle);
                        } else {
                            removeWireLayer(detail.protyle);
                        }
                    }
                });
            }
        });
        await verifyKeyTomato()

        // 插件重载跨代残留：window.eval 无模块缓存，旧层 DOM 会被本轮继承，先清扫
        document.querySelectorAll(`.${LAYER_CLASS}`).forEach(e => e.remove());

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            this.mindMenu(detail as any);
        });

        // □5 拍板：抑制思源原生链接 tooltip 对导线锚词泄露裸 wireId
        // （before-show-tooltip 官方钩子置空 message，批注 Annotations.ts 同款配方）
        this.plugin.eventBus.on("before-show-tooltip", (e) => {
            const t = (e as any).detail?.target;
            if (t?.closest?.(`span[data-type="a"][data-href^="${WORD_WIRE_HREF_PREFIX}"]`)) {
                (e as any).detail.message = "";
            }
        });

        this.plugin.addCommand({
            langKey: MindWire启用或禁用思维导线.langKey,
            langText: MindWire启用或禁用思维导线.langText(),
            hotkey: MindWire启用或禁用思维导线.m,
            callback: () => this.globalEnable(),
        });

        this.plugin.addCommand({
            langKey: MindWire启用或禁用文档思维导线.langKey,
            langText: MindWire启用或禁用文档思维导线.langText(),
            hotkey: MindWire启用或禁用文档思维导线.m,
            editorCallback: (protyle: IProtyle) => toggleDocMindWire(protyle),
        });

        // 二期 □1 入口三通道之一：命令快捷键一键两态（editorCallback 不弹菜单，
        // 选区不被顶掉，比右键菜单更稳；与工具条项共享 keymap 节点 WORD_TOOLBAR_NAME）
        this.plugin.addCommand({
            langKey: MindWire划词连线.langKey,
            langText: MindWire划词连线.langText(),
            hotkey: MindWire划词连线.m,
            editorCallback: (protyle: IProtyle) => this.wordWireAction(protyle),
        });

        // 补画当前已打开的编辑器（deploy 钩子 setPetalEnabled 重载插件时 loaded 事件
        // 不会再发；onload 与文档加载的竞态也由此自愈）
        if (mindWireEnable.get()) {
            // rootID 空=编辑器尚未完成初始化（reload 竞态窗口），交还给 loaded 事件补
            getAllEditor().forEach(p => {
                if (isEditor(p.protyle) && p.protyle?.block?.rootID) redrawWire(p.protyle);
            });
        }
    }

    onunload() {
        document.removeEventListener("selectionchange", this.onSelectionChange);
        document.removeEventListener("click", this.onWordMarkClick, true);
        // 两步流会话态收尾：芯片退场；pending 起点标记不摘（单端无害，数据侧 singles 语义）
        pending = null;
        hidePendingChip();
        removeWireToolbar();
        for (const [element, wl] of [...wireLayers]) {
            disposeLayer(element, wl);
        }
    }
}

async function toggleDocMindWire(protyle: IProtyle) {
    const { docID } = events.getInfo(protyle)
    if (!docID) return;
    const oldAttr = await siyuan.getBlockAttrs(docID)
    const old = oldAttr["custom-mindwire-enable"]
    const attr = {} as AttrType
    if (!old || old == "en") {
        attr["custom-mindwire-enable"] = "di"
    } else {
        attr["custom-mindwire-enable"] = ""
    }
    await siyuan.setBlockAttrs(docID, attr)
    // 属性变更走 MutationObserver 有 200ms debounce，主动重画让菜单/快捷键即时反馈
    if (mindWireEnable.get()) redrawWire(protyle);
}

export const mindWire = new MindWire();
