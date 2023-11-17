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

        this.setting = new Setting({
            confirmCallback: () => {
                this.saveData(STORAGE_SETTINGS, {});
            }
        });
    }

    onLayoutReady() {
        schedule.onLayoutReady();
    }

    onunload() {
        console.log("unload tomato plugin");
    }
}