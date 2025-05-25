import { getAllEditor, IEventBusMap, IProtyle, Protyle } from "siyuan";
import { mindWireCheckbox, mindWireDocMenu, mindWireDynamicLine, mindWireEnable, mindWireGlobalMenu, } from "./libs/stores";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { events, EventType } from "./libs/Events";
import { getAttribute, getID, siyuan } from "./libs/utils";
import { murmurHash3 } from "./libs/hash";
import { setGlobal } from "./libs/globalUtils";
import { winHotkey } from "./libs/winHotkey";
import { tomatoI18n } from "./tomatoI18n";

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
                    if (lock && element && getAttribute(element, "data-id")) {
                        const attr = await siyuan.getBlockAttrs(detail.protyle.block.rootID)
                        const en = attr["custom-mindwire-enable"]
                        if (mindWireEnable.get() && (en != "di")) {
                            this.protyle = detail.protyle;

                            getAllEditor().forEach(p => p.protyle.element.removeEventListener('wheel', listenWheel));
                            element
                                .querySelectorAll(".tomato-mind-wire-content")
                                .forEach(e => e.classList.remove("tomato-mind-wire-content"));

                            drawLines(element);
                            element.removeEventListener('wheel', listenWheel);
                            element.addEventListener('wheel', listenWheel);
                        } else {
                            getAllEditor().forEach(p => p.protyle.element.removeEventListener('wheel', listenWheel));
                            element
                                .querySelectorAll(".tomato-mind-wire-content")
                                .forEach(e => e.classList.remove("tomato-mind-wire-content"));

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

function drawLines(elem: HTMLElement) {
    cleanWire();
    const idPairs = [...elem.querySelectorAll(`span[data-type="block-ref"]`)]
        .map(e => {
            const id1 = getID(e);
            const id2 = getAttribute(e, "data-id");
            if (id1 && id2 && id1 != id2) {
                return [id1, id2];
            }
        });

    idPairs.push(...[...elem.querySelectorAll(`div[custom-lnk-my-id]`)]
        .map(e => {
            const id1 = getAttribute(e, "data-node-id");
            const id2s = getAttribute(e, "custom-lnk-to-ids")
                ?.split(",")
                ?.map(lnk => {
                    const e = elem.querySelector(`div[custom-lnk-my-id="${lnk}"]`)
                    return getAttribute(e, "data-node-id")
                })
                ?.filter(i => !!i) ?? [];
            return id2s.map(i => [id1, i])
        })
        .flat())
    const set = new Set<string>();
    idPairs.forEach(([id1, id2]) => {
        if (set.has(id1 + id2) || set.has(id2 + id1)) return;
        set.add(id1 + id2)
        set.add(id2 + id1)
        drawWire(id1, id2)
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

function drawWire(id1: string, id2: string) {
    let svg = document.getElementById(svgID) as unknown as SVGSVGElement;

    const node1 = document.querySelector(`div[data-node-id="${id1}"] > div[contenteditable]`)
    const node2 = document.querySelector(`div[data-node-id="${id2}"] > div[contenteditable]`)
    if (!node1 || !node2) return;

    node1.classList.add('tomato-mind-wire-content')
    node2.classList.add('tomato-mind-wire-content')

    const rect1 = node1.getBoundingClientRect();
    const rect2 = node2.getBoundingClientRect();

    const slots = 200;
    const hash1 = murmurHash3(id1) % slots
    const hash2 = murmurHash3(id2) % slots

    const x1 = rect1.left + window.scrollX + hash1;
    const x2 = rect2.left + window.scrollX + hash2;

    const y1 = rect1.top + window.scrollY + rect1.height / 2;
    const y2 = rect2.top + window.scrollY + rect2.height / 2;

    // 创建曲线路径
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // 计算两点几何关系
    let pathData: string;
    if (Math.abs(y1 - y2) < 500 && Math.abs(x1 - x2) < 500) {
        pathData = calcCirclePathData(x2, x1, y2, y1);
    } else {
        pathData = calcCurvePathData(x2, x1, y2, y1);
    }

    path.setAttribute('d', pathData);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    if (mindWireDynamicLine.get()) {
        path.classList.add('tomato-mind-wire-connector-animation')
    } else {
        path.classList.add('tomato-mind-wire-connector')
    }
    const hashcolor = murmurHash3(id1 + id2)
    const color = `var(--b3-font-color${1 + (hashcolor % 12)})`
    // const color = BEST_COLORS.at(hashcolor % BEST_COLORS.length)
    path.setAttribute('stroke', color);
    svg.appendChild(path);
}

export const mindWire = new MindWire();

function calcCurvePathData(x2: number, x1: number, y2: number, y1: number) {
    const curveIntensity = Math.abs(x2 - x1) * 0.3; // 动态弯曲强度
    const pathData = `M ${x1} ${y1} 
                    Q ${x1 + curveIntensity} ${y1},
                        ${(x1 + x2) / 2} ${(y1 + y2) / 2}
                    T ${x2} ${y2}`;
    return pathData;
}

function calcCirclePathData(x2: number, x1: number, y2: number, y1: number) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const bendDirection = 1; // 控制方向：1=向右，-1=向左

    // 计算圆弧参数
    const radius = distance / 2;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI; // 转换为角度制
    const sweepFlag = bendDirection > 0 ? 1 : 0; // 控制绘制方向

    // 生成正确的圆弧路径命令（关键修正点）
    const pathData = `M ${x1},${y1} 
                 A ${radius} ${radius} ${angle} 0 ${sweepFlag} ${x2},${y2}`;
    return pathData;
}

