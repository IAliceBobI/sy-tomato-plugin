// □5 日记回顾面板薄壳（AnnoCollectDialog.ts 同款）：dialogOpened 防重入 + Dialog +
// mount + DestroyManager 三层收尾（关窗/dialog.destroy 双向幂等）。浏览型面板给固定
// 可滚高度（非 auto 内容撑开）。
import { Dialog } from "siyuan";
import { mount, unmount } from "svelte";
import { newID } from "stonev5-utils";
import { DestroyManager } from "./libs/destroyer";
import { tomatoI18n } from "./tomatoI18n";
import ReviewDialog from "./ReviewDialog.svelte";

let dialogOpened = false;

export function openReviewDialog() {
    if (dialogOpened) return;
    dialogOpened = true;
    const id = newID();
    const dm = new DestroyManager();
    const dialog = new Dialog({
        title: tomatoI18n.回顾日记,
        content: `<div id='${id}' style="height:100%"></div>`,
        width: "min(860px, calc(100vw - 48px))",
        // 六月历形态实测：min(600, vh-200) 矮视口把队列压成个位数 px——放宽下限+压缩
        // mini 格（20px）后队列区矮视口也有 ~150px、常规屏 ~300px
        height: "min(680px, calc(100vh - 120px))",
        destroyCallback: () => dm.destroyBy("1"),
    });
    // unmount 正轨（mount() 返回 exports 对象，d.destroy() 是老范式死代码——踩坑表）
    const app = mount(ReviewDialog, {
        target: dialog.element.querySelector("#" + id),
    });
    dm.add("1", () => dialog.destroy());
    dm.add("2", () => unmount(app));
    dm.add("3", () => (dialogOpened = false));
}
