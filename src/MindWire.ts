import { getAllEditor, IProtyle, Protyle } from "siyuan";
import { mindWireCheckbox, mindWireDynamicLine, mindWireEnable, } from "./libs/stores";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { events, EventType } from "./libs/Events";
import { getAttribute, getID, siyuan } from "./libs/utils";
import { murmurHash3 } from "./libs/hash";
import { BEST_COLORS, } from "./GraphBox";
import { setGlobal } from "./libs/globalUtils";
import { winHotkey } from "./libs/winHotkey";
import { tomatoI18n } from "./tomatoI18n";

export const MindWire启用或禁用思维导线 = winHotkey("ctrl+alt+enter", "MindWire 2025-5-25 00:00:02", "", () => tomatoI18n.启用或禁用思维导线)

class MindWire {
    plugin: BaseTomatoPlugin;
    protyle: IProtyle

    async onload(plugin: BaseTomatoPlugin) {
        if (!mindWireCheckbox.get()) return;
        this.plugin = plugin;

        this.plugin.addCommand({
            langKey: MindWire启用或禁用思维导线.langKey,
            langText: MindWire启用或禁用思维导线.langText(),
            hotkey: MindWire启用或禁用思维导线.m,
            callback: () => {
                if (mindWireEnable.get()) {
                    mindWireEnable.write(false)
                    siyuan.pushMsg(tomatoI18n.禁用思维导线)
                } else {
                    mindWireEnable.write(true)
                    siyuan.pushMsg(tomatoI18n.启用思维导线)

                }
            },
        });

        events.addListener("mind wire events 2025-5-24 17:24:22", (eventType, detail: Protyle) => {
            if (eventType == EventType.loaded_protyle_static || eventType == EventType.loaded_protyle_dynamic || eventType == EventType.click_editorcontent || eventType == EventType.switch_protyle) {
                navigator.locks.request("lock 2025-5-24 17:24:27", { ifAvailable: true }, async (lock) => {
                    const element = detail?.protyle?.element;
                    if (lock && element && getAttribute(element, "data-id")) {
                        if (mindWireEnable.get()) {
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

const svgID = "tomato-mind-wire-svg-container"

function drawLines(e: HTMLElement) {
    cleanWire();
    [...e.querySelectorAll(`span[data-type="block-ref"]`)]
        .map(s => {
            const id1 = getID(s);
            const id2 = getAttribute(s, "data-id");
            if (id1 && id2 && id1 != id2) {
                return [id1, id2];
            }
        })
        .forEach(([id1, id2]) => drawWire(id1, id2));
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
    if (Math.abs(y1 - y2) < 1000) {
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
    const color = BEST_COLORS.at(hashcolor % BEST_COLORS.length)
    path.setAttribute('stroke', color);
    svg.appendChild(path);
}

export const mindWire = new MindWire();

function calcCurvePathData(x2: number, x1: number, y2: number, y1: number) {
    const curveIntensity = Math.abs(x2 - x1) * 2.1; // 动态弯曲强度
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

