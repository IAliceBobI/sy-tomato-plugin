import {
    Plugin,
} from "siyuan";
import "./index.scss";
import { ICONS } from "./icons";
import { tomatoClock } from "./TomatoClock";
import { schedule } from "./Schedule";


export default class ThePlugin extends Plugin {
    onload() {
        this.addIcons(ICONS);
        tomatoClock.init(this);
        schedule.onload(this)
    }

    onLayoutReady() {
        schedule.onLayoutReady();
    }

    onunload() {
    }
}