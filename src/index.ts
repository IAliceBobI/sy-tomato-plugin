import {
    Plugin, Setting,
} from "siyuan";
import "./index.scss";
import { ICONS } from "./icons";
import { tomatoClock } from "./TomatoClock";
import { schedule } from "./Schedule";
import { toolBox } from "./ToolBox";
import { events } from "./Events";
import { STORAGE_SETTINGS } from "./constants";


export default class ThePlugin extends Plugin {
    onload() {
        this.addIcons(ICONS);
        events.onload(this);
        tomatoClock.onload(this);
        schedule.onload(this);
        toolBox.onload(this);

        const textareaElement = document.createElement("textarea");
        this.setting = new Setting({
            confirmCallback: () => {
                this.saveData(STORAGE_SETTINGS, { readonlyText: textareaElement.value });
            }
        });
        this.setting.addItem({
            title: "Readonly text, 0 close, 1 open",
            createActionElement: () => {
                textareaElement.className = "b3-text-field fn__block";
                textareaElement.placeholder = "0 close, 1 open";
                textareaElement.value = this.data[STORAGE_SETTINGS]?.readonlyText ?? 1;
                return textareaElement;
            },
        });
    }

    onLayoutReady() {
        this.loadData(STORAGE_SETTINGS);
        schedule.onLayoutReady();
    }

    onunload() {
        console.log("unload tomato plugin");
    }
}