import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { fastNoteBoxCheckbox } from "./libs/stores";
import { siyuan, } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { OpenSyFile2 } from "./libs/docUtils";
import { events } from "./libs/Events";
import { createNote, switchDraft } from "./libs/switchDraft";
import { winHotkey } from "./libs/winHotkey";
import { verifyKeyTomato } from "./libs/user";

export const FastNoteBox创建快速笔记 = winHotkey("shift+alt+n", "创建快速笔记2024-08-06 10:35:21")
export const FastNoteBox打开最后一个笔记 = winHotkey("⌘⌥N", "2024-08-06 10:35:22")
export const FastNoteBox草稿切换 = winHotkey("alt+F4", "草稿切换 2024-9-13 09:32:44", "", () => tomatoI18n.草稿切换 + " · " + tomatoI18n.切换到文档背面, true)

class FastNoteBox {
    plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        if (!fastNoteBoxCheckbox.get()) return;
        await verifyKeyTomato()
        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: FastNoteBox创建快速笔记.langKey,
            langText: tomatoI18n.创建快速笔记,
            hotkey: FastNoteBox创建快速笔记.m,
            callback: () => {
                navigator.locks.request("FastNoteBox2024-08-06 12:38:21", { mode: "exclusive" }, async () => {
                    await createNote(this.plugin, events.protyle?.protyle);
                })
            },
        });
        this.plugin.addCommand({
            langKey: FastNoteBox打开最后一个笔记.langKey,
            langText: tomatoI18n.打开最后一个笔记,
            hotkey: FastNoteBox打开最后一个笔记.m,
            callback: () => {
                this.openNote()
            },
        });
        this.plugin.addCommand({
            langKey: FastNoteBox草稿切换.langKey,
            langText: FastNoteBox草稿切换.langText(),
            hotkey: FastNoteBox草稿切换.m,
            callback: () => {
                if (FastNoteBox草稿切换.cmd()) {
                    switchDraft(this.plugin, events.protyle?.protyle)
                }
            },
        });
    }

    private async openNote() {
        const kName: keyof (AttrType) = "custom-fastnote";
        const rows = await siyuan.sqlAttr(`select root_id from attributes where name="${kName}" order by value desc limit 1`)
        if (!rows || rows.length == 0) {
            siyuan.pushMsg("cannot find a fastnote")
            return
        }
        OpenSyFile2(this.plugin, rows[0].root_id)
    }
}

export const fastNoteBox = new FastNoteBox();
