import { Dialog } from "siyuan";
import { mount } from "svelte";
import { newID } from "stonev5-utils";
import { DestroyManager } from "./libs/destroyer";
import { tomatoI18n } from "./tomatoI18n";
import UnlockDialog from "./UnlockDialog.svelte";
import type { Product } from "./libs/user";

// 统一解锁弹框薄壳（□1 付费体验改造）：状态条 / 灰档 TomatoVIP / 渐进与仿写锁卡点击
// 全部走这里，product 区分三插件。接线模式照 BuyDialog.ts（Dialog + DestroyManager +
// mount，destroyBy 顺序关 dialog→svelte→开闸）。宽度 min(360px, 100vw-48px)：桌面常显
// 360px，移动端自动收缩留 24px 边距。
export interface UnlockOptions {
    product: Product;
    // 激活成功后父侧落盘（saveData），UnlockDialog 内 await 完才 reload
    onActivated?: () => void | Promise<void>;
    // 仿写版：弹框打开时检测渐进已激活 → 顶部「一键免费解锁」格
    neighbor?: boolean;
    getApp?: () => any;
}

let dialogOpened = false;

export function openUnlockDialog(opts: UnlockOptions) {
    if (dialogOpened) return;
    dialogOpened = true;
    const id = newID();
    const dm = new DestroyManager();
    const dialog = new Dialog({
        title: tomatoI18n.解锁Pro,
        content: `<div id='${id}'></div>`,
        width: "min(360px, calc(100vw - 48px))",
        height: "auto",
        destroyCallback: () => {
            dm.destroyBy("1");
        },
    });
    const d = mount(UnlockDialog, {
        target: dialog.element.querySelector("#" + id),
        props: opts,
    });
    dm.add("1", () => dialog.destroy());
    dm.add("2", () => d.destroy());
    dm.add("3", () => (dialogOpened = false));
}
