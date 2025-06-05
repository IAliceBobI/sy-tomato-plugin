import { getAllEditor, IEventBusMap, IProtyle, Protyle } from "siyuan";
import { mindWireCheckbox, mindWireColorfull, mindWireDocMenu, mindWireDynamicLine, mindWireEnable, mindWireGlobalMenu, mindWireLine, mindWireStarRefOnly, mindWireWidth, } from "./libs/stores";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { events, EventType } from "./libs/Events";
import { getAttribute, getID, isEditor, siyuan } from "./libs/utils";
import { murmurHash3 } from "./libs/hash";
import { setGlobal } from "./libs/globalUtils";
import { winHotkey } from "./libs/winHotkey";
import { tomatoI18n } from "./tomatoI18n";
import { lastVerifyResult, verifyKeyTomato } from "./libs/user";

export const MindWire启用或禁用思维导线 = winHotkey("ctrl+alt+enter", "MindWire global 2025-5-25 00:00:02", "🌍🧠", () => tomatoI18n.启用或禁用全局思维导线, false, mindWireGlobalMenu)
export const MindWire启用或禁用文档思维导线 = winHotkey("ctrl+shift+z", "MindWire doc 2025-5-25 00:00:02", "📜🧠", () => tomatoI18n.启用或禁用文档思维导线, false, mindWireDocMenu)
type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

class MindWire {
    plugin: BaseTomatoPlugin;
    protyle: IProtyle

    private globalEnable() {
        if (mindWireEnable.get()) {
            mindWireEnable.write(false)
            siyuan.pushMsg(tomatoI18n.禁用思维导线)
        } else {
            mindWireEnable.write(true)
            siyuan.pushMsg(tomatoI18n.启用思维导线)
        }
    }

    private mindMenu(detail: TomatoMenu) {
        const menu = detail.menu;
        if (MindWire启用或禁用思维导线.menu()) {
            menu.addItem({
                label: MindWire启用或禁用思维导线.langText(),
                iconHTML: MindWire启用或禁用思维导线.icon,
                accelerator: MindWire启用或禁用思维导线.m,
                click: () => this.globalEnable(),
            });
        }
        if (MindWire启用或禁用文档思维导线.menu()) {
            menu.addItem({
                label: MindWire启用或禁用文档思维导线.langText(),
                iconHTML: MindWire启用或禁用文档思维导线.icon,
                accelerator: MindWire启用或禁用文档思维导线.m,
                click: () => toggleDocMindWire(events.protyle?.protyle),
            });
        }
    }

    async onload(plugin: BaseTomatoPlugin) {
        if (!mindWireCheckbox.get()) return;
        this.plugin = plugin;
        await verifyKeyTomato()
        if (events.isMobile) return;

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
            if (eventType == EventType.loaded_protyle_static || eventType == EventType.loaded_protyle_dynamic || eventType == EventType.click_editorcontent || eventType == EventType.switch_protyle) {
                navigator.locks.request("lock 2025-5-24 17:24:27", { ifAvailable: true }, async (lock) => {
                    const element = detail?.protyle?.element;
                    if (lock && element && isEditor(detail?.protyle)) {
                        const attr = await siyuan.getBlockAttrs(detail.protyle.block.rootID)
                        const en = attr["custom-mindwire-enable"]

                        const clearBorder = () => {
                            getAllEditor().forEach(p => p.protyle.element.removeEventListener('wheel', listenWheel));
                            element
                                .querySelectorAll("[tomato-mind-wire-content]")
                                .forEach((e: HTMLElement) => {
                                    e.removeAttribute('tomato-mind-wire-content')
                                    e.style.border = "none"
                                });
                        }

                        if (mindWireEnable.get() && (en != "di")) {
                            this.protyle = detail.protyle;
                            clearBorder();
                            drawLines(element);
                            element.removeEventListener('wheel', listenWheel);
                            element.addEventListener('wheel', listenWheel);
                        } else {
                            clearBorder();
                            cleanWire()
                        }
                    }
                });
            }
        });

        const handle = setInterval(() => {
            if (getAllEditor().length == 0) {
                cleanWire();
            }
        }, 2000);
        const old = setGlobal("mind wire", handle)
        clearInterval(old);
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

const svgID = "tomato-mind-wire-svg-container"

function drawLines(_elem: HTMLElement) {
    cleanWire();
    const idPairs = [...document.querySelectorAll(`span[data-type="block-ref"]`)]
        .map(e => {
            if (mindWireStarRefOnly.get()) {
                if (e.textContent.trim() != "*")
                    return;
            }
            const id2 = getAttribute(e, "data-id");
            const id1 = getID(e);
            if (id1 && id2 && id1 != id2) {
                return [id1, id2];
            }
        }).filter(i => i != null);

    idPairs.push(...[...document.querySelectorAll(`div[custom-lnk-my-id]`)]
        .map(e => {
            const id1 = getAttribute(e, "data-node-id");
            const id2s = getAttribute(e, "custom-lnk-to-ids")
                ?.split(",")
                ?.map(lnk => {
                    const e = document.querySelector(`div[custom-lnk-my-id="${lnk}"]`)
                    return getAttribute(e, "data-node-id")
                })
                ?.filter(i => i != null) ?? [];
            return id2s.map(i => { return [id1, i] })
        })
        .flat())
    const set = new Set<string>();
    idPairs.forEach(pair => {
        if (pair && pair.length == 2) {
            const id1 = pair.at(0)
            const id2 = pair.at(1)
            if (id1 && id2 && id1 != id2) {
                if (set.has(id1 + id2) || set.has(id2 + id1)) return;
                set.add(id1 + id2)
                set.add(id2 + id1)
                drawWire(id1, id2)
            }
        }
    });
}

function cleanWire() {
    let svg = document.getElementById(svgID) as unknown as SVGSVGElement;
    if (!svg) {
        svg = document.body.appendChild(
            document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        );
        svg.id = svgID;
    }
    svg.innerHTML = ''; // 清空旧线条 
}

function listenWheel(_event: WheelEvent) {
    cleanWire();
    setTimeout(() => {
        drawLines(mindWire.protyle.element)
    }, 200);
}

function getAnchor(id: string) {
    let anchor = document.querySelector(`div[data-node-id="${id}"] > div[contenteditable] > span[data-type="block-ref"]`)
    if (!anchor) {
        anchor = document.querySelector(`div[data-node-id="${id}"] > div[contenteditable] > span[data-type="a"]`)
    }
    if (!anchor) {
        anchor = document.querySelector(`div[data-node-id="${id}"] > div[contenteditable] > span`)
    }
    if (!anchor) {
        anchor = document.querySelector(`div[data-node-id="${id}"] > div[contenteditable]`)
    }
    if (!anchor) {
        anchor = document.querySelector(`div[data-node-id="${id}"]`)
    }
    if (anchor) {
        anchor.setAttribute('tomato-mind-wire-content', "1")
        return { e: anchor as HTMLElement }
    }
    return {}
}

function getCenter(rect: DOMRect) {
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return { cx, cy }
}

function getEdgePoint(source: DOMRect, target: DOMRect) {
    const sc = getCenter(source);
    const tc = getCenter(target);

    const THRESHOLD = 20;
    const dx = Math.abs(sc.cx - tc.cx);
    const dy = Math.abs(sc.cy - tc.cy);

    if (dx > THRESHOLD && dx > dy) {
        if (sc.cx < tc.cx) {
            return { x: source.right, y: sc.cy };
        } else {
            return { x: source.left, y: sc.cy };
        }
    }

    if (sc.cy < tc.cy) {
        return { x: sc.cx, y: source.bottom };
    } else if (sc.cy > tc.cy) {
        return { x: sc.cx, y: source.top };
    }

    if (sc.cx < tc.cx) {
        return { x: source.right, y: sc.cy };
    } else {
        return { x: source.left, y: sc.cy };
    }
}

function getConnectPoint(anchor1: HTMLElement, anchor2: HTMLElement) {
    // const x = rect1.left + window.scrollX;
    // const y = rect1.top + window.scrollY + rect1.height / 2;
    if (!anchor1 || !anchor2) return {};
    const rect1 = anchor1.getBoundingClientRect();
    const rect2 = anchor2.getBoundingClientRect();
    const { x: x1, y: y1 } = getEdgePoint(rect1, rect2);
    const { x: x2, y: y2 } = getEdgePoint(rect2, rect1);
    return { x1: x1, y1: y1, x2: x2, y2: y2 }
}

function drawWire(id1: string, id2: string) {
    let svg = document.getElementById(svgID) as unknown as SVGSVGElement;
    const { e: anchor1 } = getAnchor(id1)
    const { e: anchor2 } = getAnchor(id2)
    const { x1, y1, x2, y2 } = getConnectPoint(anchor1, anchor2)
    if (!(x1 > 5)) return
    if (!(x2 > 5)) return
    if (!(y1 > 5)) return
    if (!(y2 > 5)) return

    // 创建曲线路径
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // 计算两点几何关系
    // 选择连线的形状
    // const deltaY = Math.abs(y1 - y2)
    // const deltaX = Math.abs(x1 - x2)
    // const L1 = 50;
    // const L2 = 400;
    // let pathData: string;
    // if (deltaY < L1) {
    //     pathData = calcCurvePathData(x2, x1, y2, y1, 0.01);
    // } else if (deltaY < L2 && deltaX < L2) {
    //     pathData = calcCurvePathData(x2, x1, y2, y1, 0.1);
    // } else {
    //     pathData = calcCurvePathData(x2, x1, y2, y1);
    // }
    const pathData = calcStraightPathData(x2, x1, y2, y1);

    path.setAttribute('d', pathData);
    let color = "var(--b3-font-color4)"
    if (mindWireColorfull.get() && lastVerifyResult()) {
        const hashcolor = murmurHash3(id1 + id2)
        color = `var(--b3-font-color${1 + (hashcolor % 12)})`
    }
    borderAndLine(path, color)
    borderAndLine(anchor1, color)
    borderAndLine(anchor2, color)
    svg.appendChild(path);
}

function borderAndLine(e: HTMLElement | SVGElement, c: string) {
    e.style.stroke = c;
    e.style.strokeWidth = mindWireWidth.get().toString() + "px";
    e.style.borderWidth = e.style.strokeWidth;
    e.style.borderColor = c;
    e.style.fill = "none"
    e.style.strokeDasharray = "10"
    setLine(e)
}

function setLine(e: HTMLElement | SVGElement) {
    if (mindWireLine.get() && lastVerifyResult()) {
        e.style.strokeDasharray = "none"
        e.style.borderStyle = "solid"
    } else {
        e.style.borderStyle = "dashed";
        if (mindWireDynamicLine.get()) {
            e.classList.add('tomato-mind-wire-connector-animation')
        }
    }
}

export const mindWire = new MindWire();

function calcStraightPathData(x2: number, x1: number, y2: number, y1: number) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
}

// calcCurvePathData
// function calcCurvePathData(x2: number, x1: number, y2: number, y1: number, t = 0.3) {
//     const curveIntensity = Math.abs(x2 - x1) * t; // 动态弯曲强度
//     const pathData = `M ${x1} ${y1} 
//                     Q ${x1 + curveIntensity} ${y1},
//                         ${(x1 + x2) / 2} ${(y1 + y2) / 2}
//                     T ${x2} ${y2}`;
//     return pathData;
// }

// calcCirclePathData
// function calcCirclePathData(x2: number, x1: number, y2: number, y1: number) {
//     const dx = x2 - x1;
//     const dy = y2 - y1;
//     const distance = Math.sqrt(dx * dx + dy * dy);
//     const bendDirection = 1; // 控制方向：1=向右，-1=向左

//     // 计算圆弧参数
//     const radius = distance / 2;
//     const angle = Math.atan2(dy, dx) * 180 / Math.PI; // 转换为角度制
//     const sweepFlag = bendDirection > 0 ? 1 : 0; // 控制绘制方向

//     // 生成正确的圆弧路径命令（关键修正点）
//     const pathData = `M ${x1},${y1} 
//                  A ${radius} ${radius} ${angle} 0 ${sweepFlag} ${x2},${y2}`;
//     return pathData;
// }

