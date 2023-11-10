import {
    Dialog,
    Plugin,
    showMessage,
} from "siyuan";
import "./index.scss";

class TomatoClock {
    private plugin: Plugin;
    private timeoutID: number;
    private lastDelayMin: number;

    onload(plugin: Plugin) {
        this.plugin = plugin;
        this.lastDelayMin = 0;
        this.timeoutID = 0;
        this.addTomatoClock("iconTomato0", 0);
        this.addTomatoClock("iconTomato5", 5);
        this.addTomatoClock("iconTomato10", 10);
        this.addTomatoClock("iconTomato15", 15);
        this.addTomatoClock("iconTomato20", 20);
        this.addTomatoClock("iconTomato25", 25);
    }

    private addTomatoClock(icon: string, minute: number) {
        const name = this.plugin.i18n.name;
        let label = `${name}🍅${minute}${this.plugin.i18n.takeARestAfterMinutes}`;
        if (minute === 0) {
            label = `${name}🍅${this.plugin.i18n.cancelCountdown}`;
        }
        const statusIconTemp = document.createElement("template");
        statusIconTemp.innerHTML = `<div class="toolbar__item ariaLabel" aria-label="${label}">
    <svg> <use xlink:href="#${icon}"></use> </svg></div>`;
        statusIconTemp.content.firstElementChild.addEventListener("click", () => {
            clearTimeout(this.timeoutID);
            if (this.lastDelayMin > 0) {
                showMessage(`${name}🍅${this.plugin.i18n.cancelLastCountdown}: ${this.lastDelayMin}m`, 5000);
            }
            this.lastDelayMin = minute;
            if (minute > 0) {
                showMessage(`${name}🍅${this.plugin.i18n.startCountdown}: ${minute}m`, 5000);
                this.timeoutID = setTimeout(() => {
                    this.showTimeoutDialog(minute);
                    this.lastDelayMin = 0;
                }, minute * 60 * 1000);
            }
        });
        this.plugin.addStatusBar({
            element: statusIconTemp.content.firstElementChild as HTMLElement,
        });
    }

    private showTimeoutDialog(minute: number) {
        const name = this.plugin.i18n.name;
        new Dialog({
            title: `${name}🍅${minute} ${this.plugin.i18n.hasWorkedMinutes}`,
            content: `
                <div class="tomato-style__container">
                    <p class="tomato-style__centered-text">${this.plugin.i18n.takeARestPlease}</p>
                </div>
            `,
            width: "800px",
            height: "600px",
        });
    }
}

export const tomatoClock = new TomatoClock();
