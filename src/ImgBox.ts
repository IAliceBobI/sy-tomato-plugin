import { IEventBusMap } from "siyuan";
import { events } from "./libs/Events";
import { CUSTOM_RIFF_DECKS, PROTYLE_WYSIWYG_SELECT } from "./libs/gconst";
import { imgBoxCheckbox } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import html2canvas from 'html2canvas';
import { getAllText, siyuan } from "./libs/utils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

class ImgBox {
    private plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        if (!imgBoxCheckbox.get()) return;
        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: "ImgBox2024-07-03 18:38:32",
            langText: tomatoI18n.复制为图片,
            hotkey: "⌥⇧I",
            callback: async () => {
                const { selected } = await events.selectedDivs();
                await this.copyDiv(selected)
            },
        });
        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            this.copyDivMenu(detail as any);
        });
    }

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!this.plugin) return;
        this.copyDivMenu(detail as any);
    }

    private async copyDiv(divs: HTMLElement[]) {
        const canvases: HTMLCanvasElement[] = [];

        for (const element of divs) {
            element.classList.remove(PROTYLE_WYSIWYG_SELECT);
            const txt = getAllText([element])
            if (!txt) continue;

            // Save original styles
            const originalColor = element.style.color;
            const originalBackgroundColor = element.style.backgroundColor;

            // element.style.setProperty('color', '#5D473B', 'important');
            // element.style.setProperty('background-color', '#F5F5DC', 'important');
            element.style.setProperty('color', '#333333', 'important');
            element.style.setProperty('background-color', '#F0F0F0', 'important');
            const custom_riff_decks = element.getAttribute(CUSTOM_RIFF_DECKS)
            if (custom_riff_decks) element.removeAttribute(CUSTOM_RIFF_DECKS)

            siyuan.pushMsg(tomatoI18n.正在复制为图片请等待)
            const canvas = await html2canvas(element);
            canvases.push(canvas);

            // Restore original styles
            element.style.color = originalColor;
            element.style.backgroundColor = originalBackgroundColor;
            if (custom_riff_decks) element.setAttribute(CUSTOM_RIFF_DECKS, custom_riff_decks)
        }

        if (canvases.length === 0) {
            console.error('No valid div elements found');
            return;
        }

        // Create a new canvas to hold the combined image
        const combinedCanvas = document.createElement('canvas');
        const ctx = combinedCanvas.getContext('2d');

        if (!ctx) {
            console.error('Could not get 2D context for combined canvas');
            return;
        }

        // Calculate the total width and height for the combined canvas
        let maxWidth = 0;
        let totalHeight = 0;

        for (const canvas of canvases) {
            maxWidth = Math.max(maxWidth, canvas.width);
            totalHeight += canvas.height;
        }

        combinedCanvas.width = maxWidth;
        combinedCanvas.height = totalHeight;

        // Draw each canvas onto the combined canvas
        let offsetY = 0;
        for (const canvas of canvases) {
            ctx.drawImage(canvas, 0, offsetY);
            offsetY += canvas.height;
        }

        // Convert the combined canvas to a Blob and copy it to the clipboard
        combinedCanvas.toBlob(async (blob) => {
            if (blob) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                siyuan.pushMsg(tomatoI18n.复制完成)
            }
        }, 'image/png');
    }

    private copyDivMenu(detail: TomatoMenu) {
        const menu = detail.menu;
        menu.addItem({
            label: tomatoI18n.复制为图片,
            iconHTML: "🍅🖼️📋",
            accelerator: "⌥⇧I",
            click: async () => {
                const { selected } = await events.selectedDivs(detail.protyle);
                await this.copyDiv(selected)
            },
        });
    }

}

export const imgBox = new ImgBox();
