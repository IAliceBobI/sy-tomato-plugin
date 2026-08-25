import { Dialog } from "siyuan";
import { mount } from "svelte";
import { newID } from "stonev5-utils";
import { DestroyManager } from "./libs/destroyer";
import BuyTomato from "./BuyTomato.svelte";
import { events } from "./libs/Events";
import type { Product } from "./libs/user";

// 购买弹框薄壳（阶段 1.5）：用思源 Dialog + mount 包裹现有 BuyTomato 内容，
// BuyTomato.svelte 内容不动，product prop 区分番茄/渐进/仿写三插件（2026-08 三产品化，
// 原 isTomato 布尔改枚举）。
// 沿用 DigestProgressiveBox.openDialog 的 Dialog + DestroyManager + dm.destroyBy 接线模式。
let dialogOpened = false;

export function openBuyDialog(product: Product, title: string, activated = false) {
    if (dialogOpened) return;
    dialogOpened = true;
    const id = newID();
    const dm = new DestroyManager();
    const dialog = new Dialog({
        title,
        content: `<div id='${id}'></div>`,
        // 给二维码留出足够空间（参考仓库其他弹框宽度 500-600px）
        width: events.isMobile ? "92vw" : "560px",
        height: events.isMobile ? "auto" : "auto",
        destroyCallback: () => {
            dm.destroyBy("1")
        },
    });
    const d = mount(BuyTomato, {
        target: dialog.element.querySelector("#" + id),
        props: {
            product,
            activated,
        }
    });
    dm.add("1", () => dialog.destroy())
    dm.add("2", () => d.destroy())
    dm.add("3", () => dialogOpened = false)
}
