import {
    Plugin,
} from "siyuan";
import "./index.scss";
import { ICONS } from "./icons";
import { tomatoClock } from "./TomatoClock";
import { schedule } from "./Schedule";
import { toolBox } from "./ToolBox";
import { events } from "./Events";


export default class ThePlugin extends Plugin {
    onload() {
        this.addIcons(ICONS);
        events.onload(this);
        tomatoClock.onload(this);
        schedule.onload(this);
        toolBox.onload(this);
    }

    onLayoutReady() {
        schedule.onLayoutReady();
    }

    onunload() {
        console.log("unload tomato plugin");
    }
}