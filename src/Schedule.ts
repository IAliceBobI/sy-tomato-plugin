import { Dialog, Plugin, Protyle, } from "siyuan";
import { dateFromYYYYMMDDHHmmss, currentTime, pushMsg, newID } from './utils';
import "./index.scss";

const STORAGE_SCHEDULE = "schedule.json";

class Schedule {
    onload(plugin: Plugin) {
        plugin.data[STORAGE_SCHEDULE] = {}
        this.plugin = plugin;
        this.plugin.eventBus.on("click-editorcontent", ({ detail }: any) => {
            let id = detail?.event?.srcElement?.parentElement?.getAttribute("data-node-id")
            this.lastBlockID = id ?? "";
        });
        this.addCommands();
    }

    onLayoutReady() {
        this.plugin.loadData(STORAGE_SCHEDULE).then(() => {
            this.loopSchedule();
        })
    }

    private async showScheduleDialog() {
        let inputID = newID()
        let btnScheduleID = newID()

        const dialog = new Dialog({
            title: "⏰ " + this.plugin.i18n.setDateTitle,
            content: `<div class="b3-dialog__content">
    <div class="schedule-style__id">${this.lastBlockID}</div>
    <div class="fn__hr"></div>
    <input type="text" id="${inputID}" class="schedule-style__input-field" />
    <button id="${btnScheduleID}" class="schedule-style__button">${this.plugin.i18n.setDate}</button><br>
    <div class="fn__hr"></div>
    <div id="protyle" style="height: 380px;"></div>
    </div>`,
            width: "560px",
            height: "540px",
        });

        new Protyle(this.plugin.app, dialog.element.querySelector("#protyle"), {
            blockId: this.lastBlockID,
        });

        const inputField = document.getElementById(inputID) as HTMLInputElement;
        inputField.value = await currentTime(10);

        const btnSchedule = document.getElementById(btnScheduleID) as HTMLButtonElement;
        btnSchedule.addEventListener("click", () => {
            this.addSchedule(inputField.value)
            dialog.destroy()
        });
    }

    private async addSchedule(inputValue: string) {
        if (!this.lastBlockID) return
        let data = this.plugin.data[STORAGE_SCHEDULE] ?? {};
        data[this.lastBlockID] = inputValue;
        await this.plugin.saveData(STORAGE_SCHEDULE, data)
        await this.doSchedule(this.lastBlockID, data);
        await pushMsg(`<h1>${this.plugin.i18n.schedule}</h1>
        <br>${this.lastBlockID} ${this.plugin.i18n.scheduleAt} ${inputValue}`);
    }

    private showTimeoutDialog(blockID: string, theTime: string) {
        const dialog = new Dialog({
            title: `${this.plugin.i18n.remind}: ${theTime}`,
            content: `<div id="protyle" style="height: 200px;"></div>`,
            width: "560px",
            height: "540px",
        });
        new Protyle(this.plugin.app, dialog.element.querySelector("#protyle"), {
            blockId: blockID,
        });
    }

    private async doSchedule(blockID: string, data: any) {
        const nowMs = new Date().getTime();
        const ms = dateFromYYYYMMDDHHmmss(data[blockID]).getTime();
        let delay = ms - nowMs;
        if (delay < 0) delay = 0;
        setTimeout(async (blockID: string, theTime: string) => {
            this.showTimeoutDialog(blockID, theTime);
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

    private addCommands() {
        this.plugin.addCommand({
            langKey: "schedule",
            hotkey: "⌘3",
            globalCallback: async () => {
                await this.showScheduleDialog()
            },
        });
    }

    // -------------------------------------------
    private lastBlockID: string;
    private plugin: Plugin;
}

export const schedule = new Schedule();
