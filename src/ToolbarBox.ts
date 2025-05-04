import { Config, confirm, openTab } from "siyuan";
import { events } from "./libs/Events";
import { siyuan } from "./libs/utils";
import { ClassActive } from "./libs/gconst";
import { addIcon, createNumIcon } from "./libs/ui";
import { locateDoc, tidyAssets } from "./libs/docUtils";
import { toolbarBoxCheckbox, toolbarEN2CHBtn, toolbarTidy } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { verifyKeyTomato } from "./libs/user";

class ToolbarBox {
    public plugin: BaseTomatoPlugin;
    private ob: MutationObserver;
    private inter: any;
    private lastPart: HTMLElement;
    private cardElement: HTMLElement;

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
        if (!toolbarBoxCheckbox.get()) {
            return;
        }
        this.plugin = plugin;

        if (!events.isMobile) {
            plugin.addTopBar({
                icon: "iconRiffCard",
                title: plugin.i18n.spaceRepeat + "Alt+0",
                position: "left",
                callback: () => {
                    openTab({ app: plugin.app, card: { type: "all" } });
                }
            })
            plugin.addTopBar({
                icon: "iconRef",
                title: plugin.i18n.refreshVirRef + "ctrl+F8",
                position: "left",
                callback: refreshVirRef,
            })
            plugin.addTopBar({
                icon: "iconFocus",
                title: plugin.i18n.locateDoc + "Alt+1",
                position: "left",
                callback: () => { locateDoc(this.lastPart); },
            })
            if (toolbarTidy.get()) {
                plugin.addTopBar({
                    icon: "iconMove",
                    title: tomatoI18n.整理assets下的图片视频音频,
                    position: "left",
                    callback: () => {
                        confirm("⚠️" + tomatoI18n.整理assets下的图片视频音频,
                            tomatoI18n.即将创建快照,
                            () => tidyAssets(tomatoI18n));
                    }
                });
            }
        }

        verifyKeyTomato().then(v => {
            if (v && toolbarEN2CHBtn.get()) {
                plugin.addTopBar({
                    icon: addIcon(plugin, "CN"),
                    title: "        中文",
                    position: "left",
                    callback: async () => {
                        await changeLang("zh_CN");
                    }
                })
                plugin.addTopBar({
                    icon: addIcon(plugin, "EN"),
                    title: "        English",
                    position: "left",
                    callback: async () => {
                        await changeLang("en_US");
                    }
                })
                plugin.addTopBar({
                    icon: addIcon(plugin, "CT"),
                    title: "        中國臺灣",
                    position: "left",
                    callback: async () => {
                        await changeLang("zh_CHT");
                    }
                })
                plugin.addTopBar({
                    icon: addIcon(plugin, "JP"),
                    title: "        日本語",
                    position: "left",
                    callback: async () => {
                        await changeLang("ja_JP");
                    }
                })
                plugin.addTopBar({
                    icon: addIcon(plugin, "ES"),
                    title: "        es_ES",
                    position: "left",
                    callback: async () => {
                        await changeLang("es_ES");
                    }
                })
                plugin.addTopBar({
                    icon: addIcon(plugin, "FR"),
                    title: "        fr_FR",
                    position: "left",
                    callback: async () => {
                        await changeLang("fr_FR");
                    }
                })
            }
        });

        plugin.addCommand({
            langKey: "spaceRepeat",
            hotkey: "⌥0",
            callback: () => {
                openTab({ app: plugin.app, card: { type: "all" } });
            }
        });
        plugin.addCommand({
            langKey: "refreshVirRef",
            hotkey: "⌘F8",
            callback: refreshVirRef,
        });
        plugin.addCommand({
            langKey: "locateDoc",
            hotkey: "⌥1",
            callback: () => { locateDoc(this.lastPart); },
        });

        if (!events.isMobile) {
            this.ob = new MutationObserver((mutationsList) => {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'attributes') {
                        const target = mutation.target as HTMLElement;
                        if (mutation.attributeName === 'class' && target.classList?.contains(ClassActive)) {
                            this.lastPart = target;
                        }
                    }
                }
            });
            this.ob.observe(document.getElementById("layouts"), { attributes: true, childList: true, subtree: true });
        }
        if (!events.isMobile) {
            const currentPluginID = this.plugin.id;
            this.inter = setInterval(() => {
                console.debug("toolbar interval: pluginID: " + this.plugin.id)
                if (currentPluginID !== this.plugin.global.tomato_zZmqus5PtYRi.pluginID) {
                    clearTimeout(this.inter)
                } else {
                    this.showCardNumber();
                }
            }, 20000);
        }
    }

    onunload() {
        this.ob?.disconnect();
        this.ob = null;
        clearInterval(this.inter);
        this.inter = null;
    }

    private showCardNumber() {
        return navigator.locks.request("cardcount2024-10-8 16:33:36", { ifAvailable: true }, async lock => {
            if (lock) {
                if (!this.cardElement) {
                    for (const e of document.querySelectorAll('div[id^="plugin_sy-tomato-plugin_"]')) {
                        const icon = e?.firstElementChild?.firstElementChild?.getAttribute("xlink:href");
                        if (icon === "#iconRiffCard") {
                            this.cardElement = e as any;
                            break;
                        }
                    }
                }
                return _showCardNumber(this.cardElement);
            }
        })
    }
}

async function _showCardNumber(e: HTMLElement) {
    if (!e) return;
    const cards = await siyuan.getRiffDueCards()
    const num = cards?.unreviewedCount || 0;
    if (num === 0) {
        e.firstElementChild.outerHTML = `<svg><use xlink:href="#iconRiffCard"></use></svg>`
    } else {
        e.firstElementChild.outerHTML = createNumIcon(num)
    }
}

async function changeLang(lang: Config.TLang) {
    const c = await siyuan.getConf();
    c.conf.appearance.lang = lang;
    await siyuan.setAppearance(c.conf.appearance);
    window.location.reload();
}

async function refreshVirRef() {
    await siyuan.refreshVirtualBlockRef();
    events.protyleReload();
    await siyuan.pushMsg(tomatoI18n.已经刷新虚拟引用, 2000);
}

export const toolbarBox = new ToolbarBox();
