import { siyuan, } from "./libs/utils";
import "./index.scss";
import { events } from "./libs/Events";
import { DATA_NODE_ID } from "./libs/gconst";
import { findListTypeByElement } from "./libs/listUtils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { tomatoI18n } from "./tomatoI18n";
import { winHotkey } from "./libs/winHotkey";

export const ScheduleCopyID = winHotkey("shift+alt+3", "copy id 2025-5-12 18:46:16", "", () => tomatoI18n.复制ID)

class Schedule {
    private plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: ScheduleCopyID.langKey,
            langText: ScheduleCopyID.langText(),
            hotkey: ScheduleCopyID.m,
            callback: () => {
                this.showScheduleDialog(events.lastBlockID);
            },
        });
    }

    private async showScheduleDialog(blockID: string) {
        if (!blockID) return;
        const { id: listID, found } = findListTypeByElement(document.querySelector(`div[data-node-id="${blockID}"]`))
        siyuan.getDocIDByBlockID(blockID).then((id) => {
            console.info(`DocID: ${id}`)
            console.info(`BlockID: ${blockID}`)
            if (listID) console.info(`ListID: ${listID}`)
        })
        await copyID(blockID);
        const all = document.querySelectorAll(`div[${DATA_NODE_ID}="${blockID}"]`);
        if (all?.length == 1) console.info(all[0])
        else console.info(all)
        if (found) console.info(found)
    }
}

export async function copyID(idMsg: string) {
    await navigator.clipboard.writeText(idMsg);
    await siyuan.pushMsg(`copy ID ${idMsg}`);
}

export const schedule = new Schedule();
