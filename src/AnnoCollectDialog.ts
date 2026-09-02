// 批注收集小窗薄壳（unlockDialog.ts 同款）：dialogOpened 防重入 + Dialog + mount +
// DestroyManager 三层收尾（关窗/dialog.destroy 双向幂等）。
import { Dialog } from "siyuan";
import { mount, unmount } from "svelte";
import { newID } from "stonev5-utils";
import { DestroyManager } from "./libs/destroyer";
import { tomatoI18n } from "./tomatoI18n";
import AnnoCollectDialog from "./AnnoCollectDialog.svelte";

let dialogOpened = false;

export function openAnnoCollectDialog(docID: string) {
    if (dialogOpened || !docID) return;
    dialogOpened = true;
    const id = newID();
    const dm = new DestroyManager();
    const dialog = new Dialog({
        title: tomatoI18n.收集批注,
        content: `<div id='${id}'></div>`,
        width: "min(480px, calc(100vw - 48px))",
        height: "auto",
        destroyCallback: () => dm.destroyBy("1"),
    });
    // unmount 正轨（mount() 返回 exports 对象，d.destroy() 是老范式死代码——踩坑表）
    const app = mount(AnnoCollectDialog, {
        target: dialog.element.querySelector("#" + id),
        props: { docID, dm },
    });
    dm.add("1", () => dialog.destroy());
    dm.add("2", () => unmount(app));
    dm.add("3", () => (dialogOpened = false));
}
