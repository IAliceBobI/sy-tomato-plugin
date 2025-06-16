import { getPlugin, siyuan, } from "./libs/utils";
import "./index.scss";
import { events } from "./libs/Events";
import { DATA_NODE_ID } from "./libs/gconst";
import { findListTypeByElement } from "./libs/listUtils";
import { tomatoI18n } from "./tomatoI18n";
import { winHotkey } from "./libs/winHotkey";

export const ScheduleCopyID = winHotkey("shift+alt+3", "copy id 2025-5-12 18:46:16", "", () => tomatoI18n.复制ID)

/*
*    *    *    *    *    * 
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (1 - 7) (7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59)
*/
class Schedule {
    async onload() {
        getPlugin().addCommand({
            langKey: ScheduleCopyID.langKey,
            langText: ScheduleCopyID.langText(),
            hotkey: ScheduleCopyID.m,
            callback: () => {
                this.showScheduleDialog(events.lastBlockID);
            },
        });
        // getPlugin().protyleSlash.push({
        //     filter: ["schedule", "time", "cron", "daily", "plan", "date", "日期", "计划", "定期", "定时", "提醒", "日程", "dq", "tx", "ds", "rq", "jh", "rc"],
        //     html: tomatoI18n.计划提醒,
        //     id: "Schedule protyleSlash 2025-06-16 10:37:25",
        //     callback(protyle: Protyle, nodeElement: HTMLElement) {
        //         new DialogTextArea("写一句话，由AI辅助设定时间", "五秒后提醒我，美好的事情即将发生！", async (prompt) => {
        //             // 示例：每分钟的第30秒执行
        //             const cron = '30 * * * * *';
        //             const nextTimestamps = getNextCronTimestamps(prompt, 2);
        //             console.log(nextTimestamps.map(t => timeUtil.getYYYYMMDDHHmmss(t)));
        //         });
        //     }
        // });
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
