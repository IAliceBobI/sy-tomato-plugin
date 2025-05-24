import { getAllEditor, IProtyle, Protyle } from "siyuan";
import { mindWireCheckbox, } from "./libs/stores";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { events, EventType } from "./libs/Events";
import { getAttribute, getID } from "./libs/utils";
import { murmurHash3 } from "./libs/hash";
import { BEST_COLORS, } from "./GraphBox";
import { setGlobal } from "./libs/globalUtils";

class MindWire {
    plugin: BaseTomatoPlugin;
    protyle: IProtyle

    async onload(plugin: BaseTomatoPlugin) {
        if (!mindWireCheckbox.get()) return;
        this.plugin = plugin;

        events.addListener("mind wire events 2025-5-24 17:24:22", (eventType, detail: Protyle) => {
            if (eventType == EventType.loaded_protyle_static || eventType == EventType.loaded_protyle_dynamic || eventType == EventType.click_editorcontent || eventType == EventType.switch_protyle) {
                navigator.locks.request("lock 2025-5-24 17:24:27", { ifAvailable: true }, async (lock) => {
                    const element = detail?.protyle?.element;
                    if (lock && element && getAttribute(element, "data-id")) {
                        getAllEditor().forEach(p => p.protyle.element.removeEventListener('wheel', listenWheel));
                        this.protyle = detail.protyle;
                        element.querySelectorAll(".tomato-mind-wire-content").forEach(e => e.classList.remove("tomato-mind-wire-content"));
                        drawLines(element);
                        element.removeEventListener('wheel', listenWheel);
                        element.addEventListener('wheel', listenWheel);
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
    const curveIntensity = Math.abs(x2 - x1) * 0.3; // 动态弯曲强度
    const pathData = `M ${x1} ${y1} 
                            Q ${x1 + curveIntensity} ${y1},
                              ${(x1 + x2) / 2} ${(y1 + y2) / 2}
                            T ${x2} ${y2}`;
    path.setAttribute('d', pathData);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('class', 'tomato-mind-wire-connector');

    const hashcolor = murmurHash3(id1 + id2)
    const color = BEST_COLORS.at(hashcolor % BEST_COLORS.length)
    path.setAttribute('stroke', color);
    svg.appendChild(path);
}

export const mindWire = new MindWire();


