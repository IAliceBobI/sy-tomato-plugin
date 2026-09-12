import { getTomatoPluginInstance, siyuan, } from "./libs/utils";
import { events } from "./libs/Events";
import { DATA_NODE_ID } from "./libs/gconst";
import { findListTypeByElement } from "./libs/listUtils";
import { tomatoI18n } from "./tomatoI18n";
import { winHotkey } from "./libs/winHotkey";
import { copyIdCheckbox } from "./libs/stores";

export const ScheduleCopyID = winHotkey("shift+alt+3", "copy id", "", () => tomatoI18n.复制ID)

class Schedule {
    async onload() {
        // 纯命令族开关（快捷键卡行开关，关=命令面板项+快捷键齐消失）
        if (!copyIdCheckbox.get()) return;
        getTomatoPluginInstance().addCommand({
            langKey: ScheduleCopyID.langKey,
            langText: ScheduleCopyID.langText(),
            hotkey: ScheduleCopyID.m,
            callback: () => {
                this.showScheduleDialog(events.lastBlockID); // getCursorElement
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
