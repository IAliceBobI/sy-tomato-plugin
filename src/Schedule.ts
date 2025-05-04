import { siyuan } from "./libs/utils";
import "./index.scss";
import { events } from "./libs/Events";
import { DATA_NODE_ID } from "./libs/gconst";
import { findListTypeByElement } from "./libs/listUtils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

class Schedule {
    private plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        this.plugin = plugin;
        this.plugin.addCommand({
            langText: "copy id",
            langKey: "2025年3月20日08:57:12 copy id",
            hotkey: "",
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
