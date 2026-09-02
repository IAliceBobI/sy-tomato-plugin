import { getAllEditor, IEventBusMap, IProtyle, Protyle } from "siyuan";
import { mindWireCheckbox, mindWireColorfull, mindWireDocMenu, mindWireDynamicLine, mindWireEnable, mindWireGlobalMenu, mindWireLine, mindWireStarRefOnly, mindWireWidth, } from "./libs/stores";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { events, EventType } from "./libs/Events";
import { getAttribute, getID, isEditor, siyuan } from "./libs/utils";
import { murmurHash3 } from "./libs/hash";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
import { tomatoI18n } from "./tomatoI18n";
import { lastVerifyResult, verifyKeyTomato } from "./libs/user";
import { blockWirePath, getEdgePoint, shiftRect } from "./libs/mindWireGeom";

export const MindWire启用或禁用思维导线 = winHotkey("ctrl+alt+enter", "MindWire global", "iconGlobalGraph", () => tomatoI18n.启用或禁用全局思维导线, false, mindWireGlobalMenu)
export const MindWire启用或禁用文档思维导线 = winHotkey("ctrl+shift+z", "MindWire doc", "iconGraph", () => tomatoI18n.启用或禁用文档思维导线, false, mindWireDocMenu)
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
const FLOW_CLASS = "tomato-mind-wire-path--flow";
const CONTENT_ATTR = "tomato-mind-wire-content";

interface WireLayer {
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
    wl.layer.remove();
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

    const wl: WireLayer = { element, layer, svg, scroller, mo: null, ro: null, timer: undefined, gen: 0 };
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

/** 全量重画：清锚点染色→收线对→逐对画线；锚点未渲染（虚拟滚动）跳过由下轮补 */
async function drawWireLayer(protyle: IProtyle, wl: WireLayer) {
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
        removeWireLayer(protyle);
        return;
    }

    clearAnchors(element);
    wl.svg.innerHTML = "";
    const cRect = wl.scroller.getBoundingClientRect();
    // 层高 = 内容全长（高度 100% 对 absolute 元素只是容器视口高，须显式铺满）
    wl.layer.style.height = wl.scroller.scrollHeight + "px";

    const set = new Set<string>();
    for (const [id1, id2] of collectPairs(element)) {
        if (set.has(id1 + id2) || set.has(id2 + id1)) continue;
        set.add(id1 + id2);
        set.add(id2 + id1);
        drawOne(wl, cRect, id1, id2);
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

function drawOne(wl: WireLayer, cRect: DOMRect, id1: string, id2: string) {
    const a1 = getAnchor(wl.element, id1);
    const a2 = getAnchor(wl.element, id2);
    if (!a1 || !a2) return;
    const p1 = getEdgePoint(shiftRect(a1.getBoundingClientRect(), cRect), shiftRect(a2.getBoundingClientRect(), cRect));
    const p2 = getEdgePoint(shiftRect(a2.getBoundingClientRect(), cRect), shiftRect(a1.getBoundingClientRect(), cRect));

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
}

function redrawWire(protyle: IProtyle) {
    const wl = ensureLayer(protyle);
    if (wl) drawWireLayer(protyle, wl);
}

class MindWire {
    plugin: BaseTomatoPlugin;

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
    }

    async onload(plugin: BaseTomatoPlugin) {
        if (!mindWireCheckbox.get()) return;
        this.plugin = plugin;
        await verifyKeyTomato()

        // 插件重载跨代残留：window.eval 无模块缓存，旧层 DOM 会被本轮继承，先清扫
        document.querySelectorAll(`.${LAYER_CLASS}`).forEach(e => e.remove());

        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            this.mindMenu(detail as any);
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
    }

    onunload() {
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
}

export const mindWire = new MindWire();
