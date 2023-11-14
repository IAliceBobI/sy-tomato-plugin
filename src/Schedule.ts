import { Dialog, Plugin, Protyle, } from "siyuan";
import { siyuan, newID, timeUtil } from "./utils";
import "./index.scss";
import { events } from "./Events";

const STORAGE_SCHEDULE = "schedule.json";

class Schedule {
    private plugin: Plugin;

    onload(plugin: Plugin) {
        this.plugin = plugin;
        this.plugin.data[STORAGE_SCHEDULE] = {};
        this.plugin.addCommand({
            langKey: "schedule",
            hotkey: "⌘3",
            globalCallback: async () => {
                await this.showScheduleDialog();
            },
        });
    }

    onLayoutReady() {
        this.plugin.loadData(STORAGE_SCHEDULE).then(() => {
            this.loopSchedule();
        });
    }

    private async showScheduleDialog() {
        const inputID = newID();
        const btnScheduleID = newID();
        const btnAddADayID = newID();
        let idMsg = this.plugin.i18n.clickOneBlockFirst;
        if (events.lastBlockID) {
            idMsg = events.lastBlockID;
        }

        const dialog = new Dialog({
            title: "⏰ " + this.plugin.i18n.setDateTitle,
            content: `<div class="b3-dialog__content">
    <div class="schedule-style__id">${idMsg}</div>
    <div class="fn__hr"></div>
    <input type="text" id="${inputID}" class="schedule-style__input-field" />
    <button id="${btnAddADayID}" class="schedule-style__button">${this.plugin.i18n.btnAddADay}</button>
    <button id="${btnScheduleID}" class="schedule-style__button">${this.plugin.i18n.setDate}</button><br>
    <div class="fn__hr"></div>
    <div id="protyle" style="height: 380px;"></div>
    </div>`,
            width: "600px",
            height: "540px",
        });

        new Protyle(this.plugin.app, dialog.element.querySelector("#protyle"), {
            blockId: events.lastBlockID,
        });

        if (!events.lastBlockID) {
            return;
        }

        const inputField = document.getElementById(inputID) as HTMLInputElement;
        inputField.value = await siyuan.currentTime(10);

        const btnSchedule = document.getElementById(btnScheduleID) as HTMLButtonElement;
        btnSchedule.addEventListener("click", async () => {
            const timestr = inputField.value.trim();
            if (timeUtil.checkTimeFormat(timestr)) {
                const tidiedStr = timeUtil.makesureDateTimeFormat(timestr);
                if (tidiedStr) {
                    this.addSchedule(tidiedStr);
                    dialog.destroy();
                    return;
                }
            }
            inputField.value = await siyuan.currentTime(30);
        });

        const btnAddADay = document.getElementById(btnAddADayID) as HTMLButtonElement;
        btnAddADay.addEventListener("click", async () => {
            const timestr = inputField.value.trim();
            if (timeUtil.checkTimeFormat(timestr)) {
                const tidiedStr = timeUtil.makesureDateTimeFormat(timestr);
                if (tidiedStr) {
                    const newTime = new Date(new Date(tidiedStr).getTime() + 1000 * 60 * 60 * 24);
                    inputField.value = timeUtil.dateFormat(newTime);
                    return;
                }
            }
            inputField.value = await siyuan.currentTime(30);
        });
    }

    private async addSchedule(inputValue: string) {
        if (!events.lastBlockID) return;
        const data = this.plugin.data[STORAGE_SCHEDULE] ?? {};
        data[events.lastBlockID] = inputValue;
        await this.plugin.saveData(STORAGE_SCHEDULE, data);
        await this.doSchedule(events.lastBlockID, data);
        await siyuan.pushMsg(`<h1>${this.plugin.i18n.scheduleSetSuccess}</h1>
        <br>${this.plugin.i18n.scheduledAt} ${inputValue}`, 8 * 1000);
    }

    private async showTimeoutDialog(blockID: string, theTime: string) {
        if (await siyuan.checkBlockExist(blockID)) {
            const dialog = new Dialog({
                title: `${this.plugin.i18n.remind}: ${theTime}`,
                content: "<div id=\"protyle\" style=\"height: 480px;\"></div>",
                width: "560px",
                height: "540px",
            });
            new Protyle(this.plugin.app, dialog.element.querySelector("#protyle"), {
                blockId: blockID,
            });
        }
    }

    private async doSchedule(blockID: string, data: any) {
        const nowMs = new Date().getTime();
        const ms = timeUtil.dateFromYYYYMMDDHHmmss(data[blockID]).getTime();
        let delay = ms - nowMs;
        if (delay < 0) delay = 0;
        setTimeout(async (blockID: string, theTime: string) => {
            await this.showTimeoutDialog(blockID, theTime);
            delete data[blockID];
            await this.plugin.saveData(STORAGE_SCHEDULE, data);
        }, delay, blockID, data[blockID]);
    }

    private loopSchedule() {
        const data = this.plugin.data[STORAGE_SCHEDULE] ?? {};
        for (const keyBlockID in data) {
            this.doSchedule(keyBlockID, data);
        }
    }
}

export const schedule = new Schedule();
