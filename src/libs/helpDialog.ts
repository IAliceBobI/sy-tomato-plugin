import { Dialog } from "siyuan";
import { mount } from "svelte";
import Help from "./Help.svelte";
import { events } from "./Events";
import { DestroyManager } from "./destroyer";
import { newID } from "stonev5-utils";

export type HelpDoc = { title: string; body: string };

/**
 * 打开帮助弹窗: 展示内嵌的文字版帮助 + 飞书完整文档(含截图/视频)链接。
 * data 为 src/help.json 的快照, 按文档 token 索引;
 * 找不到对应文档时回退为直接打开飞书链接(新增帮助文档但未更新快照时不受影响)。
 */
export function openHelpDialog(url: string, data: Record<string, HelpDoc>) {
    const m = url.match(/docx\/([A-Za-z0-9]+)/);
    const doc = m ? data[m[1]] : undefined;
    if (!doc) {
        window.open(url, "_blank");
        return;
    }
    const dm = new DestroyManager();
    const id = newID();
    const dialog = new Dialog({
        title: doc.title || "帮助",
        content: `<div id="${id}" style="height:100%"></div>`,
        width: events.isMobile ? "90vw" : "700px",
        height: events.isMobile ? "180svw" : "700px",
        destroyCallback: () => {
            dm.destroyBy("dialog");
        },
    });
    const d = mount(Help, {
        target: dialog.element.querySelector("#" + id),
        props: { doc: { ...doc, url } },
    });
    dm.add("dialog", () => dialog.destroy());
    dm.add("svelte", () => d.destroy());
}
