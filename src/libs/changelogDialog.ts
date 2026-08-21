import { Dialog } from "siyuan";
import { mount } from "svelte";
import Changelog from "./Changelog.svelte";
import { events } from "./Events";
import { DestroyManager } from "./destroyer";
import { newID } from "stonev5-utils";

export type ChangelogEntry = { tag: string; date: string; body: string };

export function openChangelogDialog(entries: ChangelogEntry[]) {    const dm = new DestroyManager();
    const id = newID();
    const dialog = new Dialog({
        title: "更新日志",
        content: `<div id="${id}" style="height:100%"></div>`,
        width: events.isMobile ? "90vw" : "700px",
        height: events.isMobile ? "180svw" : "700px",
        destroyCallback: () => {
            dm.destroyBy("dialog");
        },
    });
    const d = mount(Changelog, {
        target: dialog.element.querySelector("#" + id),
        props: { entries },
    });
    dm.add("dialog", () => dialog.destroy());
    dm.add("svelte", () => d.destroy());
}
