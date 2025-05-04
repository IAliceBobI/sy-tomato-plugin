import { Dialog, IProtyle } from "siyuan";
import ImgOverlayEditor from "./ImgOverlayBox.svelte";
import { EventType, events } from "./libs/Events";
import { getID, isValidNumber, newID, siyuan } from "./libs/utils";
import { ATTR_PIC_OVERLAY, OVERLAY_DIV } from "./constants";
import { imgOverlayCheckbox } from "./libs/stores";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { tomatoI18n } from "./tomatoI18n";

class ImgOverlayBox {
    private plugin: BaseTomatoPlugin;
    async onload(plugin: BaseTomatoPlugin) {
        if (!imgOverlayCheckbox.get()) return;

        this.plugin = plugin;
        this.plugin.eventBus.on(EventType.open_menu_image, ({ detail }) => {
            detail.menu.addItem({
                label: this.plugin.i18n.addPicOverlay,
                iconHTML: "🍅🛡️🖼️",
                click: () => { this.overlayEditor(detail.element, detail.protyle); }
            });
        });
        events.addListener("ImgOverlayBox", (eventType: string, detail: any) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.switch_protyle
                || eventType == EventType.click_editorcontent
            ) {
                const elements = detail?.protyle?.element?.querySelectorAll(`[${ATTR_PIC_OVERLAY}]`) ?? [];
                for (const element of elements) {
                    const overlays: Overlays = JSON.parse(tryFromOldFormat(element.getAttribute(ATTR_PIC_OVERLAY)));
                    const img = element.querySelector("img");
                    if (!img) continue;
                    // if (img.parentElement.querySelector(`[${OVERLAY_DIV}="1"]`)) continue;
                    showOverlayStyle(overlays, img);
                }
            }
        });
    }

    blockIconEvent(detail: any) {
        if (!this.plugin) return;
        detail.menu.addItem({
            iconHTML: "🍅🛡️🖼️",
            label: this.plugin.i18n.addPicOverlay,
            click: () => {
                for (const element of detail.blockElements) {
                    this.overlayEditor(element, detail.protyle);
                    break;
                }
            }
        });
    }

    async overlayEditor(imgSpan: HTMLSpanElement, _protyle: IProtyle) {
        const id = newID();
        let editor: ImgOverlayEditor = null;
        const nextOverlays: Overlays = { originWidth: 0, overlays: [] };
        const imgID = getID(imgSpan);
        let size = "600px";
        if (events.isMobile) size = "92vw";
        const dialog = new Dialog({
            title: tomatoI18n.图片制卡支持拖拽画矩形,
            content: `<div id="${id}"></div>`,
            width: size,
            height: size,
            destroyCallback() {
                if (editor) editor.$destroy();
                let value = JSON.stringify(nextOverlays);
                if (value == "{}") value = "";
                const attrs = {};
                attrs[ATTR_PIC_OVERLAY] = value;
                siyuan.setBlockAttrs(imgID, attrs);
                showOverlayStyle(nextOverlays, imgSpan?.querySelector("img"));
            },
        });
        const attr = await siyuan.getBlockAttrs(imgID);
        const fm = tryFromOldFormat(attr[ATTR_PIC_OVERLAY]);
        const originOverlays: Overlays = JSON.parse(fm);
        editor = new ImgOverlayEditor({
            target: dialog.element.querySelector("#" + id),
            props: {
                imgSpan,
                nextOverlays,
                originOverlays,
                dialog,
            }
        });
    }
}

function tryFromOldFormat(overlayJson: string) {
    let v = overlayJson ?? "{}";
    if (v.startsWith("[")) { // compatible with old format.
        v = `{"overlays":${v}}`;
    }
    return v;
}

function getCoefficient(currentWidth: number, originalWidth: number): number {
    if (!isValidNumber(currentWidth)) currentWidth = 0;
    if (!isValidNumber(originalWidth)) originalWidth = 0;
    if (currentWidth > 0 && originalWidth > 0) {
        return currentWidth / originalWidth;
    }
    return 1;
}

function showOverlayStyle(overlays: Overlays, img: HTMLImageElement) {
    if (!img) return;
    const p = img.parentElement;
    p.querySelectorAll(`[${OVERLAY_DIV}="1"]`).forEach(e => {
        e.parentElement.removeChild(e);
    });
    const co = getCoefficient(img.width, overlays.originWidth);
    for (const o of overlays.overlays) {
        const divElement = document.createElement("div");
        img.parentElement.appendChild(divElement);

        divElement.setAttribute(OVERLAY_DIV, "1");
        divElement.style.position = "absolute";
        divElement.style.top = `${(o.top - o.height / 2) * co}px`;
        divElement.style.left = `${(o.left - o.width / 2) * co}px`;
        divElement.style.width = `${o.width * co}px`;
        divElement.style.height = `${o.height * co}px`;
        divElement.style.background = "var(--b3-font-background8)";

        const textElement = document.createElement("span");
        divElement.appendChild(textElement);

        textElement.setAttribute(OVERLAY_DIV, "1");
        textElement.textContent = o.cID;
        textElement.style.color = "var(--b3-font-color5)";
        textElement.style.position = "absolute";
        textElement.style.top = "50%";
        textElement.style.left = "50%";
        textElement.style.transform = "translate(-50%, -50%)";
        textElement.style.backgroundColor = "transparent";

        divElement.addEventListener("mouseover", function () {
            divElement.style.backgroundColor = "transparent";
            textElement.style.color = "transparent";
        });
        divElement.addEventListener("mouseout", function () {
            divElement.style.backgroundColor = "var(--b3-font-background8)";
            textElement.style.color = "var(--b3-font-color5)";
        });
    }
}

export const imgOverlayBox = new ImgOverlayBox();
