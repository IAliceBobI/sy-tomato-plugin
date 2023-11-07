import {
    Dialog,
    Plugin,
    showMessage,
} from "siyuan";
import "./plugin.scss";

class TomatoClock {
    private plugin: Plugin
    private timeoutID: number
    private lastDelayMin: number

    init(plugin: Plugin) {
        this.plugin = plugin
        this.lastDelayMin = 0
        this.timeoutID = 0
        this.addTomatoClock("iconTomato0", 0)
        this.addTomatoClock("iconTomato5", 5)
        this.addTomatoClock("iconTomato10", 10)
        this.addTomatoClock("iconTomato15", 15)
        this.addTomatoClock("iconTomato20", 20)
        this.addTomatoClock("iconTomato25", 25)
    }

    private addTomatoClock(icon: string, minute: number) {
        let label = `番茄钟：${minute}分钟后休息。`
        if (minute === 0) {
            label = "番茄钟：取消计时。"
        }
        const statusIconTemp = document.createElement("template");
        statusIconTemp.innerHTML = `<div class="toolbar__item ariaLabel" aria-label="${label}">
    <svg> <use xlink:href="#${icon}"></use> </svg></div>`;
        statusIconTemp.content.firstElementChild.addEventListener("click", () => {
            clearTimeout(this.timeoutID);
            showMessage(`番茄钟：取消上次的计时：${this.lastDelayMin}m`, 5000)
            this.lastDelayMin = minute
            if (minute > 0) {
                this.timeoutID = setTimeout(() => {
                    this.showTimeoutDialog(minute)
                    this.lastDelayMin = 0
                }, minute * 60 * 1000);
            }
        });
        this.plugin.addStatusBar({
            element: statusIconTemp.content.firstElementChild as HTMLElement,
        });
    }

    private showTimeoutDialog(minute: number) {
        new Dialog({
            title: `番茄钟：${minute} 分钟已到`,
            content: `
                <div class="tomato-style__container">
                    <p class="tomato-style__centered-text">😊休息一会儿吧！</p>
                </div>
            `,
            width: "800px",
            height: "600px",
        });
    }
}

export const tomatoClock = new TomatoClock()
