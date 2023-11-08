import { Dialog, Plugin, Protyle, } from "siyuan";
import { dateFromYYYYMMDDHHmmss, currentTime, pushMsg, newID, makesureDateTimeFormat, checkTimeFormat, dateFormat, checkBlockExist } from './utils';
import "./index.scss";

const STORAGE_SCHEDULE = "schedule.json";

class Schedule {
    private lastBlockID: string;
    private plugin: Plugin;

    onload(plugin: Plugin) {
        this.plugin = plugin;
        this.plugin.data[STORAGE_SCHEDULE] = {}
        this.plugin.eventBus.on("click-editorcontent", ({ detail }: any) => {
            let id = detail?.event?.srcElement?.parentElement?.getAttribute("data-node-id")
            this.lastBlockID = id ?? "";
        });
        this.plugin.addCommand({
            langKey: "schedule",
            hotkey: "⌘3",
            globalCallback: async () => {
                await this.showScheduleDialog()
            },
        });
    }

    onLayoutReady() {
        this.plugin.loadData(STORAGE_SCHEDULE).then(() => {
            this.loopSchedule();
        })
    }

    private async showScheduleDialog() {
        let inputID = newID()
        let btnScheduleID = newID()
        let btnAddADayID = newID()
        let idMsg = this.plugin.i18n.clickOneBlockFirst
        if (this.lastBlockID) {
            idMsg = this.lastBlockID
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
            blockId: this.lastBlockID,
        });

        if (!this.lastBlockID) {
            return
        }

        const inputField = document.getElementById(inputID) as HTMLInputElement;
        inputField.value = await currentTime(10);

        const btnSchedule = document.getElementById(btnScheduleID) as HTMLButtonElement;
        btnSchedule.addEventListener("click", async () => {
            const timestr = inputField.value.trim();
            if (checkTimeFormat(timestr)) {
                const tidiedStr = makesureDateTimeFormat(timestr);
                if (tidiedStr) {
                    this.addSchedule(tidiedStr)
                    dialog.destroy()
                    return
                }
            }
            inputField.value = await currentTime(30);
        });

        const btnAddADay = document.getElementById(btnAddADayID) as HTMLButtonElement;
        btnAddADay.addEventListener("click", async () => {
            const timestr = inputField.value.trim();
            if (checkTimeFormat(timestr)) {
                const tidiedStr = makesureDateTimeFormat(timestr);
                if (tidiedStr) {
                    const newTime = new Date(new Date(tidiedStr).getTime() + 1000 * 60 * 60 * 24)
                    inputField.value = dateFormat(newTime)
                    return
                }
            }
            inputField.value = await currentTime(30);
        });
    }

    private async addSchedule(inputValue: string) {
        if (!this.lastBlockID) return
        let data = this.plugin.data[STORAGE_SCHEDULE] ?? {};
        data[this.lastBlockID] = inputValue;
        await this.plugin.saveData(STORAGE_SCHEDULE, data)
        await this.doSchedule(this.lastBlockID, data);
        await pushMsg(`<h1>${this.plugin.i18n.scheduleSetSuccess}</h1>
        <br>${this.plugin.i18n.scheduledAt} ${inputValue}`, 8 * 1000);
    }

    private async showTimeoutDialog(blockID: string, theTime: string) {
        if (await checkBlockExist(blockID)) {
            const dialog = new Dialog({
                title: `${this.plugin.i18n.remind}: ${theTime}`,
                content: `<div id="protyle" style="height: 480px;"></div>`,
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
        const ms = dateFromYYYYMMDDHHmmss(data[blockID]).getTime();
        let delay = ms - nowMs;
        if (delay < 0) delay = 0;
        setTimeout(async (blockID: string, theTime: string) => {
            await this.showTimeoutDialog(blockID, theTime);
            delete data[blockID];
            await this.plugin.saveData(STORAGE_SCHEDULE, data);
        }, delay, blockID, data[blockID])
    }

    private loopSchedule() {
        let data = this.plugin.data[STORAGE_SCHEDULE] ?? {};
        for (const keyBlockID in data) {
            this.doSchedule(keyBlockID, data);
        }
    }
}

export const schedule = new Schedule();
