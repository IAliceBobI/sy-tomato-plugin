import { confirm, getAllEditor, IEventBusMap } from "siyuan";
import { events } from "./libs/Events";
import { CUSTOM_RIFF_DECKS, PROTYLE_WYSIWYG_SELECT } from "./libs/gconst";
import { imgBoxCheckbox, imgBoxShowMenu } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import html2canvas from 'html2canvas';
import { getAllText, siyuan, } from "./libs/utils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { winHotkey } from "./libs/winHotkey";
import { gatedAddCommand } from "./libs/cmdGate";
import { addIfVisible } from "./libs/menuManager";
import { debugLog } from "./libs/logUtils";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

export const ImgBoxHotKey = winHotkey("alt+shift+ctrl+I", "ImgBox")

// html2canvas 渲染走 iframe 克隆+svg 序列化，两类东西会丢：
// ① use 引用的 symbol 源（克隆 iframe 里没有文档级 symbol，圆点/勾选框等一律画不出）
// ② CSS 变量在暗色主题下解析成深色值，与强制浅底混色不可读
// 截图前在块根上就地修正，截图后恢复（见 captureStyleOverrides）
const LIGHT_THEME_VARS: Record<string, string> = {
    "--b3-theme-background": "#F0F0F0",
    "--b3-theme-surface": "#F0F0F0",
    "--b3-theme-on-background": "#333333",
    "--b3-theme-on-surface": "#333333",
    "--b3-protyle-code-background": "rgba(27, 31, 35, .05)",
};

// html2canvas 主线程同步重段期间界面冻结，先让「正在复制」toast 上屏再进截图段才有反馈
function nextPaint(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

// html2canvas 克隆 svg 时会把计算样式拷成 inline style（fill: rgb(..)/stroke-width: 0px），
// inline 优先级高于 presentation attribute——symbol 声明的表现属性必须同步钉进 inline style
// 才能在克隆体上活下来（否则 stroke 型图标按 fill 黑默认渲染成实心块）
const SYMBOL_ATTR_TO_CSS: Record<string, string> = {
    "fill": "fill",
    "stroke": "stroke",
    "stroke-width": "stroke-width",
    "stroke-linecap": "stroke-linecap",
    "stroke-linejoin": "stroke-linejoin",
};

/** 截图前就地样式覆盖（浅色强制/去圆角/暗色变量翻转/svg use 内联），返回恢复函数数组。
 *  调用方 finally 归还——html2canvas 中途抛错也不能把编辑器块样式留在覆盖态 */
function captureStyleOverrides(element: HTMLElement): Array<() => void> {
    const restores: Array<() => void> = [];
    const style = element.style;

    const prevColor = style.color;
    const prevBg = style.backgroundColor;
    const prevRadius = style.borderRadius;
    style.setProperty('color', '#333333', 'important');
    style.setProperty('background-color', '#F0F0F0', 'important');
    // 块自带圆角在多块纵向拼接的交界处留缺口，截图期统一取直
    style.setProperty('border-radius', '0', 'important');
    restores.push(() => {
        style.color = prevColor;
        style.backgroundColor = prevBg;
        style.borderRadius = prevRadius;
    });

    if (document.documentElement.getAttribute("data-theme-mode") === "dark") {
        const names = Object.keys(LIGHT_THEME_VARS);
        const prevVars = names.map(n => style.getPropertyValue(n));
        names.forEach(n => style.setProperty(n, LIGHT_THEME_VARS[n]));
        restores.push(() => names.forEach((n, i) => {
            if (prevVars[i]) style.setProperty(n, prevVars[i]);
            else style.removeProperty(n);
        }));
    }

    // svg use → symbol 内容内联进各 svg（只换 innerHTML 保持节点身份）。symbol 根上的
    // 表现属性（fill/stroke 系列）必须一并搬移——stroke 型图标（勾选框等）丢了 fill="none"
    // 会按 SVG 默认 fill:black 渲染成实心块；顺带把 currentColor 钉成实色——svg 序列化成
    // 独立 image 后无继承上下文，current 解析不出
    element.querySelectorAll("svg use").forEach(useEl => {
        const use = useEl as SVGElement;
        const svg = use.ownerSVGElement;
        if (!svg) return;
        const href = use.getAttribute("xlink:href") || use.getAttribute("href") || "";
        const symbol = href.startsWith("#") ? document.getElementById(href.slice(1)) : null;
        if (!symbol || symbol.tagName.toLowerCase() !== "symbol") return;
        const prevInner = svg.innerHTML;
        const prevStyleAttr = svg.getAttribute("style");
        const prevAttrs: Array<[string, string | null]> = [];
        for (const attr of symbol.attributes) {
            if (attr.name === "id") continue;
            prevAttrs.push([attr.name, svg.getAttribute(attr.name)]);
            svg.setAttribute(attr.name, attr.value);
            const cssProp = SYMBOL_ATTR_TO_CSS[attr.name];
            if (cssProp) svg.style.setProperty(cssProp, attr.value);
        }
        svg.style.color = getComputedStyle(svg).color;
        svg.innerHTML = symbol.innerHTML;
        restores.push(() => {
            svg.innerHTML = prevInner;
            prevAttrs.forEach(([n, v]) => {
                if (v !== null) svg.setAttribute(n, v); else svg.removeAttribute(n);
            });
            if (prevStyleAttr) svg.setAttribute("style", prevStyleAttr); else svg.removeAttribute("style");
        });
    });

    // iframe 跨源内容取不到（contentDocument 访问即抛 SecurityError），截图期换成等尺寸占位框
    element.querySelectorAll("iframe").forEach(frame => {
        const ph = document.createElement("div");
        ph.style.cssText = `display:flex;align-items:center;justify-content:center;border:1px solid #c9c9c9;background:#eaeaea;border-radius:4px;box-sizing:border-box;width:${frame.offsetWidth}px;height:${frame.offsetHeight}px;font-size:12px;color:#888;overflow:hidden;`;
        ph.textContent = frame.getAttribute("src") || "iframe";
        frame.replaceWith(ph);
        restores.push(() => ph.replaceWith(frame));
    });

    return restores;
}

class ImgBox {
    private plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        if (!imgBoxCheckbox.get()) return;
        this.plugin = plugin;
        gatedAddCommand(this.plugin, ImgBoxHotKey.langKey, {
            langText: tomatoI18n.复制为图片,
            hotkey: ImgBoxHotKey.m,
            callback: async () => {
                // 冷启动兜底：events._protyle 唯一写入点=click-editorcontent（真点过编辑器内容），
                // 未点击过时快捷键路径会静默 no-op——layout 反查 active 编辑器补位
                let protyle = events.protyle?.protyle;
                if (!protyle) {
                    const active = (document.querySelector(".layout__wnd--active .protyle-wysiwyg")
                        ?? document.querySelector(".protyle-wysiwyg")) as HTMLElement | null;
                    protyle = active
                        ? getAllEditor().find(editor => editor?.protyle?.wysiwyg?.element === active)?.protyle
                        : undefined;
                }
                const { selected } = await events.selectedDivs(protyle);
                await this.copyDiv(selected)
            },
        });
        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            this.copyDivMenu(detail as any);
        });
    }

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!imgBoxCheckbox.get()) return;
        this.copyDivMenu(detail as any);
    }

    private async copyDiv(divs: HTMLElement[]) {
        if (divs?.length > 2) {
            confirm("⚠️", tomatoI18n.如果块很多请放到超级块内否则会很慢, () => {
                this._copyDiv(divs)
            })
        } else {
            this._copyDiv(divs)
        }
    }
    private async _copyDiv(divs: HTMLElement[]) {
        if (!(divs?.length > 0)) return
        const canvases: HTMLCanvasElement[] = [];

        siyuan.pushMsg(tomatoI18n.正在复制为图片请等待)
        await nextPaint()

        for (const element of divs) {
            element.classList.remove(PROTYLE_WYSIWYG_SELECT);
            const txt = getAllText([element])
            // 无文本但有可视内容的块（图片/音视频/iframe/分割线）不能按文本判空静默跳过
            const hasVisual = element.getAttribute("data-type") === "NodeThematicBreak"
                || !!element.querySelector("img, video, audio, iframe, embed, object");
            if (!txt && !hasVisual) continue;

            const custom_riff_decks = element.getAttribute(CUSTOM_RIFF_DECKS)
            if (custom_riff_decks) element.removeAttribute(CUSTOM_RIFF_DECKS)
            const restores = captureStyleOverrides(element);
            try {
                canvases.push(await html2canvas(element));
            } catch (e) {
                // 单块截图失败跳过，不拖垮整批（全败走下方空结果提示）
                debugLog("capture_fail", `html2canvas: ${e}`, "copyimg")
            } finally {
                restores.forEach(restore => restore());
                if (custom_riff_decks) element.setAttribute(CUSTOM_RIFF_DECKS, custom_riff_decks)
                // style 写空值会残留空 style 属性（DOM 噪音+块 diff），清干净
                if (!element.style.cssText) element.removeAttribute("style")
            }
            if (divs.length > 1) await nextPaint()
        }

        if (canvases.length === 0) {
            siyuan.pushMsg(tomatoI18n.没有可复制的图片内容, 6000)
            return;
        }

        // Create a new canvas to hold the combined image
        const combinedCanvas = document.createElement('canvas');
        const ctx = combinedCanvas.getContext('2d');

        if (!ctx) {
            debugLog("capture_fail", "2d context unavailable", "copyimg")
            return;
        }

        // Calculate the total width and height for the combined canvas
        let maxWidth = 0;
        let totalHeight = 0;

        for (const canvas of canvases) {
            maxWidth = Math.max(maxWidth, canvas.width);
            totalHeight += canvas.height;
        }

        // 浏览器 canvas 尺寸上限护栏：超限导出是空白图，不如明示失败
        if (maxWidth > 32767 || totalHeight > 32767) {
            siyuan.pushMsg(tomatoI18n.复制失败请重试, 6000)
            return;
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
        try {
            combinedCanvas.toBlob(async (blob) => {
                if (!blob) return;
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    siyuan.pushMsg(tomatoI18n.复制完成)
                } catch (e) {
                    // 剪贴板被占用/权限拒绝等——此前是静默 unhandled，用户只会觉得复制了个寂寞
                    debugLog("capture_fail", `clipboard write: ${e}`, "copyimg")
                    siyuan.pushMsg(tomatoI18n.复制失败请重试, 6000)
                }
            }, 'image/png');
        } catch (e) {
            // 跨域资源污染画布时 toBlob 同步抛 SecurityError
            debugLog("capture_fail", `toBlob: ${e}`, "copyimg")
            siyuan.pushMsg(tomatoI18n.复制失败请重试, 6000)
        }
    }

    private copyDivMenu(detail: TomatoMenu) {
        if (imgBoxShowMenu.get()) {
            const menu = detail.menu;
            addIfVisible(menu, "m.imgBox.copyAsImage", {
                label: tomatoI18n.复制为图片,
                icon: "iconCamera",
                accelerator: ImgBoxHotKey.m,
                click: async () => {
                    const { selected } = await events.selectedDivs(detail.protyle);
                    await this.copyDiv(selected)
                },
            });
        }
    }

}

export const imgBox = new ImgBox();
