import { addIfVisible } from "./libs/menuManager";
import { Dialog, IProtyle } from "siyuan";
import ImgOverlayEditor from "./ImgOverlayBox.svelte";
import { EventType, events } from "./libs/Events";
import { getID, siyuan } from "./libs/utils";
import { ATTR_PIC_OVERLAY, OVERLAY_DIV } from "./constants";
import { CUSTOM_RIFF_DECKS } from "./libs/gconst";
import { imgOverlayCheckbox } from "./libs/stores";
import { debugLog } from "./libs/logUtils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { tomatoI18n } from "./tomatoI18n";
import { newID } from "stonev5-utils";
import { mount, unmount } from "svelte";
import { DestroyManager } from "./libs/destroyer";
import { OverlayData, parseOverlay, serializeOverlay } from "./libs/imgOverlayData";

/** 内置卡包（□1 实证 kernel getAllDueFlashcards 显式跳过非内置包——官方复习入口只吐内置包，自建包不进复习） */
const RIFF_DECK_BUILTIN = "20230218211946-2kw8jgx";

class ImgOverlayBox {
    private plugin: BaseTomatoPlugin;
    async onload(plugin: BaseTomatoPlugin) {
        if (!imgOverlayCheckbox.get()) return;

        this.plugin = plugin;
        this.plugin.eventBus.on(EventType.open_menu_image, ({ detail }) => {
            addIfVisible(detail.menu, "m.imgOverlay.add", {
                label: tomatoI18n.添加图片遮挡层,
                icon: "iconEyeoff",
                click: () => { this.overlayEditor(detail.element, detail.protyle); }
            });
            addIfVisible(detail.menu, "m.imgOverlay.deck", {
                label: tomatoI18n.加入闪卡,
                icon: "iconRiffCard",
                click: () => { this.toggleFlashcard(getID(detail.element)); }
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
                    const img = element.querySelector("img");
                    if (!img) continue;
                    // 读时统一升级 v3（v1/v2 自动转换；v2 垂直用自然高近似）
                    const nat = img.naturalWidth > 0 ? { w: img.naturalWidth, h: img.naturalHeight } : undefined;
                    const raw = element.getAttribute(ATTR_PIC_OVERLAY);
                    showOverlayStyle(raw, parseOverlay(raw, nat), img);
                }
            }
        });
    }

    blockIconEvent(detail: any) {
        if (!imgOverlayCheckbox.get()) return;
        const imgs = (detail.blockElements as HTMLElement[]).filter(e => e.querySelector(`span[data-type="img"]`))
        if (imgs.length > 0) {
            addIfVisible(detail.menu, "m.imgOverlay.add", {
                icon: "iconEyeoff",
                label: tomatoI18n.添加图片遮挡层,
                click: () => {
                    for (const element of imgs) {
                        this.overlayEditor(element, detail.protyle);
                        break;
                    }
                }
            });
        }
    }

    /**
     * □5 制卡 toggle：事务通道制卡——裸写 custom-riff-decks 属性不生成卡片（卡片数据在
     * storage/riff/<deckID>.cards，属性由内核 doAdd/doRemoveFlashcards 顺手维护）。
     * @returns toggle 后的卡包归属（true=已加入）
     */
    async toggleFlashcard(imgID: string): Promise<boolean> {
        if (!imgID) return false;
        try {
            const attrs = await siyuan.getBlockAttrs(imgID);
            const inDeck = (attrs[CUSTOM_RIFF_DECKS] || "").split(",").filter(Boolean).includes(RIFF_DECK_BUILTIN);
            await siyuan.transactions([{
                action: inDeck ? "removeFlashcards" : "addFlashcards",
                deckID: RIFF_DECK_BUILTIN,
                blockIDs: [imgID],
            } as any]);
            siyuan.pushMsg(inDeck ? tomatoI18n.已移出闪卡 : tomatoI18n.已加入闪卡);
            return !inDeck;
        } catch (e) {
            // 失败回读真实态（编辑器按钮文案不漂移），不打断调用方
            debugLog("imgOverlay", "deck toggle failed: " + e);
            const attrs = await siyuan.getBlockAttrs(imgID);
            return (attrs[CUSTOM_RIFF_DECKS] || "").split(",").includes(RIFF_DECK_BUILTIN);
        }
    }

    /**
     * 编辑器弹窗（□3 重做）：保存链单一收口——任何退出（保存按钮/X/ESC）都经
     * dialog.destroy → destroyCallback → dm.destroyBy("dialog") → persist（显式序列化
     * getShapes → 写块属性 → 刷新渲染）→ unmount（只清 DOM/监听）。
     * 组件 onDestroy 不承载任何数据。
     */
    async overlayEditor(imgSpan: HTMLSpanElement, _protyle: IProtyle) {
        const id = newID();
        const imgID = getID(imgSpan);
        const img = imgSpan?.querySelector("img");
        if (!imgID || !img) return;
        const nat = { w: img.naturalWidth || 1, h: img.naturalHeight || 1 };
        const attr = await siyuan.getBlockAttrs(imgID);
        const data: OverlayData = parseOverlay(attr[ATTR_PIC_OVERLAY], nat);
        const deckOn = (attr[CUSTOM_RIFF_DECKS] || "").split(",").filter(Boolean).includes(RIFF_DECK_BUILTIN);

        const dm = new DestroyManager();
        const dialog = new Dialog({
            title: tomatoI18n.图片遮挡编辑器,
            content: `<div id="${id}" class="iov-dialog-body"></div>`,
            width: "min(94vw, 1400px)",
            height: "min(90vh, 940px)",
            destroyCallback() {
                dm.destroyBy("dialog");
            },
        });
        const editor = mount(ImgOverlayEditor, {
            target: dialog.element.querySelector("#" + id),
            props: {
                imgSrc: img.getAttribute("src") ?? "",
                natSize: nat,
                initialShapes: data.shapes,
                deckOn,
                onToggleDeck: () => this.toggleFlashcard(imgID),
                onExit: () => dialog.destroy(),
            }
        });
        // persist 先注册先执行：getShapes 须在 unmount 前读到组件状态
        dm.add("persist", () => {
            const value = serializeOverlay({ v: 3, shapes: editor.getShapes() });
            const attrs = {};
            attrs[ATTR_PIC_OVERLAY] = value;
            siyuan.setBlockAttrs(imgID, attrs);
            showOverlayStyle(value, parseOverlay(value, nat), img);
        });
        dm.add("svelte", () => unmount(editor));
        dm.add("dialog", () => dialog.destroy());
    }
}

/** 幂等 diff 签名标记（挂层容器上，值=原始属性串；同值=数据未变只补缺层） */
const IOV_SIG = "data-iov-sig";

/**
 * 笔记内遮挡层渲染（□4 翻新）：幂等 diff + % 定位 + CSS 类 + hover/钉住零监听揭开。
 * - % 定位相对 img 外层 relative 包装盒（实测其盒=img 盒）→ 图片/窗口缩放零监听自适应
 * - 幂等 diff：sig（原始属性值）同=数据未变，逐位补缺层（内核重渲染抹层只补不重建，不闪）；
 *   sig 变（编辑器保存）=拆旧全建
 * - hover 揭开纯 CSS（:hover，见 index.scss）；点击=同组联动钉住（再点收回）；
 *   复习容器（.card__main 祖先，□1 实证锚点）内不挂 click（防与官方键盘评分打架）
 */
function showOverlayStyle(raw: string, data: OverlayData, img: HTMLImageElement) {
    if (!img) return;
    const host = img.parentElement;
    if (!host) return;
    if (host.getAttribute(IOV_SIG) !== raw) {
        host.querySelectorAll(`[${OVERLAY_DIV}="1"]`).forEach(e => e.remove());
        host.setAttribute(IOV_SIG, raw);
    }
    const inReview = !!img.closest(".card__main");
    data.shapes.forEach((o, i) => {
        if (host.querySelector(`[${OVERLAY_DIV}="1"][data-iov-i="${i}"]`)) return;
        const div = document.createElement("div");
        div.className = "iov-ovl" + (o.t === "e" ? " iov-ovl--e" : "") + (inReview ? " iov-ovl--static" : "");
        div.setAttribute(OVERLAY_DIV, "1");
        div.dataset.iovI = String(i);
        div.dataset.g = String(o.g);
        div.style.left = `${(o.x - o.w / 2) * 100}%`;
        div.style.top = `${(o.y - o.h / 2) * 100}%`;
        div.style.width = `${o.w * 100}%`;
        div.style.height = `${o.h * 100}%`;
        if (o.g > 0) {
            const badge = document.createElement("span");
            badge.className = "iov-badge";
            badge.textContent = String(o.g);
            div.appendChild(badge);
        }
        if (!inReview) {
            div.addEventListener("click", () => {
                const pinned = div.classList.toggle("iov-ovl--pinned");
                // 同组联动（g=0 时 data-g="0" 只匹配自身=独立钉住）
                host.querySelectorAll<HTMLElement>(`[${OVERLAY_DIV}="1"][data-g="${o.g}"]`).forEach(el => {
                    el.classList.toggle("iov-ovl--pinned", pinned);
                });
            });
        }
        host.appendChild(div);
    });
}

export const imgOverlayBox = new ImgOverlayBox();
