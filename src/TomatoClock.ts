import { Custom, Dialog, openTab, openWindow } from "siyuan";
import "./index.scss";
import { count, isMainWin, isValidNumber, newID, setTimeouts, shuffleArray, siyuan, tryFixCfg } from "./libs/utils";
import { STORAGE_TOMATO_TIME } from "./constants";
import { events } from "./libs/Events";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { DestroyManager } from "./libs/destroyer";
import TomatoVedio from "./TomatoClockVedio.svelte";
import { addIcon, isPinned, removeStatusBar } from "./libs/ui";
import { tomato_clocks, tomato_clocks_change_bg, tomato_clocks_change_bg_dark, tomato_clocks_force_dialog, tomato_clocks_force_notice, tomato_clocks_opacity, tomato_clocks_position_right, tomatoClockCheckbox } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { verifyKeyTomato } from "./libs/user";

function formatDuration(milliseconds: number): { minutes: number, seconds: number } {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds };
}

type TomatoTime = {
    minute: number;
    startTime: number;
}

const TAB_TYPE = "custom_tab_TomatoClock";

export const TomatoClockID = "jadfddMPDSSeedsOMWAJEgwyMpBOTxUaDSTHyShpHlJHKu";

function isTomatoClockBox() {
    return document.getElementById(TomatoClockID) != null;
}

class TomatoClock {
    plugin: BaseTomatoPlugin;
    private timeoutID: any;
    private lastDelayMinute: number;
    private lastStartTime: number;
    private customTab: () => Custom;

    onload(plugin: BaseTomatoPlugin) {
        if (plugin.initCfg()) {
            this._onload(plugin)
        } else {
            (async () => {
                await plugin.taskCfg;
                this._onload(plugin);
            })();
        }
    }
    _onload(plugin: BaseTomatoPlugin) {
        if (!tomatoClockCheckbox.get()) return;

        this.customTab;
        this.plugin = plugin;
        this.lastDelayMinute = 0;

        tryFixCfg(plugin.name, STORAGE_TOMATO_TIME)
            .then(() => this.plugin.loadData(STORAGE_TOMATO_TIME))
            .then(() => {
                let data = (this.plugin.data[STORAGE_TOMATO_TIME] ?? {}) as TomatoTime;
                if (typeof data == "string") data = {} as any;
                if (data.minute > 0 && data.startTime > 0) {
                    const due = data.minute * 60 * 1000 + data.startTime;
                    const now = Date.now();
                    if (now < due) {
                        this.lastDelayMinute = data.minute;
                        this.lastStartTime = data.startTime;
                        this.timeoutID = setTimeout(() => {
                            this.showTimeoutDialog(data.minute);
                            this.lastDelayMinute = 0;
                            this.maintainBgImg();
                        }, due - now);
                    }
                    setTimeout(() => {
                        this.maintainBgImg();
                    }, 2000);
                }
            });
        this.addStatusIcons();

        this.customTab = plugin.addTab({
            type: TAB_TYPE,
            init() {
                const id = newID();
                this.element.innerHTML = `<div id="${id}"></div>`;
                this.data.dm = new DestroyManager();
                this.data.dm.add("custom-tab", () => { this.destroy(); });
                if (!isMainWin()) {
                    this.data.sv = new TomatoVedio({
                        target: this.element.querySelector("#" + id),
                        props: {
                            vedioID: this.data.vedioID,
                            dm: this.data.dm,
                        }
                    });
                    this.data.dm.add("svelte", () => { this.data?.sv?.$destroy(); });
                    this.data.dm.add("close svg btn", () => document.getElementById("closeWindow").click());
                }
            },
            beforeDestroy() { },
            destroy() {
                this.data?.dm?.destroyBy("custom-tab");
            }
        });

        if (!events.isMobile) {
            setTimeouts(() => {
                if (isTomatoClockBox() && !isMainWin()) {
                    removeStatusBar(false);
                    if (!isPinned()) document.getElementById("pinWindow")?.click();
                }
            }, 200, 3000, 300);
        }
    }

    private async maintainBgImg() {
        const mode = document.querySelector("[data-theme-mode]")?.getAttribute("data-theme-mode");
        if (!mode) return;
        let url = tomato_clocks_change_bg.get();
        if (mode == "dark") {
            url = tomato_clocks_change_bg_dark.get();
        }
        if (!url) return;
        if (!this.lastDelayMinute) {
            deleteColorDiv()
        } else {
            await addColorDiv(url)
        }
    }

    private addStatusIcons() {
        let clocks: string = tomato_clocks.get() ?? "5,10,15,25";
        const washed = [0];
        for (const clock of clocks.split(/[,，]/g)) {
            const n = Number(clock.trim());
            if (n > 0) {
                washed.push(n);
            }
        }
        this.addTomatoPeeker();
        clocks = washed.sort((a, b) => a - b).map(i => {
            this.addTomatoClock(i);
            return String(i);
        }).join(",");
        tomato_clocks.set(clocks);
    }

    private getRemainingTime() {
        if (this.lastDelayMinute == 0) return 0;
        const elapsedTime = Date.now() - this.lastStartTime;
        let remainingTime = this.lastDelayMinute * 60 * 1000 - elapsedTime;
        if (remainingTime < 0) remainingTime = 0;
        return remainingTime;
    }

    private async showRemainingTime() {
        const name = this.plugin.i18n.name;
        const { minutes, seconds } = formatDuration(this.getRemainingTime());
        if (minutes == 0 && seconds == 0) await siyuan.pushMsg(`${name}🍅` + tomatoI18n.未开始计时);
        else await siyuan.pushMsg(tomatoI18n.剩余时间(name, minutes, seconds));
    }

    private addTomatoPeeker() {
        const name = this.plugin.i18n.name;
        const statusIconTemp = document.createElement("template");
        statusIconTemp.innerHTML = `<div class="toolbar__item ariaLabel" aria-label="${name}🍅${tomatoI18n.查看剩余时间}"><svg><use xlink:href="#iconEye"></use></svg></div>`;
        statusIconTemp.content.firstElementChild.addEventListener("click", this.showRemainingTime.bind(this));
        this.plugin.addStatusBar({
            element: statusIconTemp.content.firstElementChild as HTMLElement,
            position: tomato_clocks_position_right.get() ? "right" : "left",
        });
    }

    private addTomatoClock(minute: number) {
        const icon = `iconTomato${minute}`;
        addIcon(this.plugin, minute);

        const name = this.plugin.i18n.name;
        let label = `${name}🍅${minute}${this.plugin.i18n.takeARestAfterMinutes}`;
        if (minute === 0) {
            label = `${name}🍅${this.plugin.i18n.cancelCountdown}`;
        }
        const statusIconTemp = document.createElement("template");
        statusIconTemp.innerHTML = `<div class="toolbar__item ariaLabel" aria-label="${label}"><svg><use xlink:href="#${icon}"></use></svg></div>`;
        statusIconTemp.content.firstElementChild.addEventListener("click", async () => {
            clearTimeout(this.timeoutID);
            if (this.lastDelayMinute > 0) {
                await this.showRemainingTime();
                await siyuan.pushMsg(`${name}🍅${this.plugin.i18n.cancelLastCountdown}: ${this.lastDelayMinute}m`, 5000);
            }
            this.lastDelayMinute = minute;
            this.lastStartTime = Date.now();
            if (minute > 0) {
                await siyuan.pushMsg(`${name}🍅${this.plugin.i18n.startCountdown}: ${minute}m`, 5000);
                this.plugin.saveData(STORAGE_TOMATO_TIME, { minute, startTime: this.lastStartTime });
                this.timeoutID = setTimeout(async () => {
                    await this.showTimeoutDialog(minute);
                    this.lastDelayMinute = 0;
                    this.maintainBgImg();
                }, minute * 60 * 1000);
            } else {
                this.plugin.saveData(STORAGE_TOMATO_TIME, { minute: 0, startTime: 0 });
            }
            this.maintainBgImg();
        });
        this.plugin.addStatusBar({
            element: statusIconTemp.content.firstElementChild as HTMLElement,
            position: tomato_clocks_position_right.get() ? "right" : "left",
        });
    }

    private async showTimeoutDialog(minute: number) {
        const docName = tomato_clocks_force_notice.get();
        let vedioID = "";
        if (docName) {
            const rows = await siyuan.sql(`select id from blocks where content="${docName}" and type='d' limit 1`);
            if (rows?.length > 0) {
                vedioID = await getRandVedioID(rows[0].id)
            }
        }
        const title = `${this.plugin.i18n.name}🍅${minute} ${this.plugin.i18n.hasWorkedMinutes}`
        if (events.isBrowser || tomato_clocks_force_dialog.get()) {
            const dm = new DestroyManager();
            const id = newID();
            const dialog = new Dialog({
                title,
                content: `<div id="${id}"></div>`,
                width: events.isMobile ? "90vw" : "500px",
                height: events.isMobile ? "180vw" : null,
                destroyCallback: () => {
                    dm.destroyBy("1")
                },
            });
            const d = new TomatoVedio({
                target: dialog.element.querySelector("#" + id),
                props: { vedioID, dm }
            });
            dm.add("1", () => { dialog.destroy() })
            dm.add("2", () => { d.$destroy() })
        } else {
            const tab = await openTab({ // custom
                app: this.plugin.app,
                custom: {
                    icon: "iconInfo",
                    title,
                    data: { vedioID },
                    id: this.plugin.name + TAB_TYPE
                },
            });
            openWindow({
                width: 500,
                height: 400,
                tab,
            });
        }
    }
}

async function getRandVedioID(docID: string) {
    let id = "";
    let version = await getTomatoVedioVersoin(docID);
    for (const _i of count(3)) {
        const ids = await getVedioIDs(docID, version)
        if (ids.length > 0) {
            id = ids[0];
            await siyuan.setBlockAttrs(id, { "custom-tomatoClockVedioVersion": version } as AttrType)
            break;
        }
        version = await incTomatoVedioVersoin(docID, version);
    }
    return id;
}

async function getTomatoVedioVersoin(docID: string) {
    const docAttr = await siyuan.getBlockAttrs(docID);
    return docAttr["custom-tomatoClockVedioVersion"] ?? "0";
}

async function incTomatoVedioVersoin(docID: string, version: string) {
    const v = Number(version) || 0;
    const attr = {} as AttrType;
    attr["custom-tomatoClockVedioVersion"] = String(v + 1);
    await siyuan.setBlockAttrs(docID, attr);
    return attr["custom-tomatoClockVedioVersion"]
}

async function getVedioIDs(docID: string, version: string) {
    const docRow = await siyuan.getDocRowByBlockID(docID);
    if (!docRow?.path) return;
    const path = docRow.path.slice(0, -3)
    const rows = await siyuan.sql(`select id,type,content from blocks where 
        path like "${path}%" and type!="d"
        and ial not like '%custom-tomatoClockVedioVersion="${version}"%'`)
    const ids = rows.filter(i => {
        if (i.type == "iframe" || i.type == "video") return true;
        if (i.content) return true;
    }).map(i => i.id);
    return shuffleArray(ids);
}

const ID = "MyGoodColorDiv2024-08-01 21:02:02";
function deleteColorDiv() {
    const div = document.getElementById(ID) as HTMLElement;
    div?.parentElement?.removeChild(div);
}

async function addColorDiv(url: string) {
    deleteColorDiv()
    if (!await verifyKeyTomato()) return;

    let opacity = tomato_clocks_opacity.get();
    if (!isValidNumber(Number(opacity))) opacity = "0.16"

    const colorDiv = document.createElement('div');
    colorDiv.id = ID;
    colorDiv.style.backgroundImage = `url('${url}')`;
    colorDiv.style.position = 'fixed';
    colorDiv.style.top = '0';
    colorDiv.style.left = '0';
    colorDiv.style.width = '100%';
    colorDiv.style.height = '100%';
    colorDiv.style.opacity = opacity;
    colorDiv.style.zIndex = '10000000';
    colorDiv.style.pointerEvents = 'none';
    document.body.prepend(colorDiv);
}

export const tomatoClock = new TomatoClock();


