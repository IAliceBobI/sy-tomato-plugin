import { Config, confirm, openTab } from "siyuan";
import { events } from "./libs/Events";
import { siyuan, } from "./libs/utils";
import { ClassActive, SPACE } from "./libs/gconst";
import { addIcon, createNumIcon } from "./libs/ui";
import { locateDoc, tidyAssets } from "./libs/docUtils";
import { toolbarBoxCheckbox, toolbarEN2CHBtn, toolbarlocatedoc, toolbarrefreshVr, toolbarspacerepeat, toolbarTidy } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { verifyKeyTomato } from "./libs/user";
import { winHotkey } from "./libs/winHotkey";
import { setGlobal } from "stonev5-utils";

export const ToolBarBox间隔重复 = winHotkey("alt+backspace", "间隔重复 2025-5-12 19:34:21", "iconRiffCard", () => tomatoI18n.复习闪卡)
export const ToolBarBox刷新虚拟引用 = winHotkey("alt+delete", "刷新虚拟引用 2025-5-12 19:34:22", "iconRef", () => tomatoI18n.刷新虚拟引用)
export const ToolBarBox突出定位文档 = winHotkey("alt+enter", "突出定位文档 2025-5-12 19:34:24", "iconFocus", () => tomatoI18n.突出定位文档)
export const ToolBarBox整理assets下的图片视频音频 = winHotkey("ctrl+alt+shift+F9", "整理assets下的图片视频音频 2025-5-12 19:34:26", "iconMove", () => tomatoI18n.整理assets下的图片视频音频)

class ToolbarBox {
    public plugin: BaseTomatoPlugin;
    private ob: MutationObserver;
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


        const tidy = () => {
            confirm("⚠️" + ToolBarBox整理assets下的图片视频音频.langText(),
                tomatoI18n.即将创建快照,
                () => tidyAssets(tomatoI18n));
        }

        if (!events.isMobile) {
            if (toolbarspacerepeat.get()) {
                plugin.addTopBar({
                    icon: ToolBarBox间隔重复.icon,
                    title: ToolBarBox间隔重复.langText() + ToolBarBox间隔重复.w(),
                    position: "left",
                    callback: () => {
                        openTab({ app: plugin.app, card: { type: "all" } });
                    }
                })
            }
            if (toolbarrefreshVr.get()) {
                plugin.addTopBar({
                    icon: ToolBarBox刷新虚拟引用.icon,
                    title: ToolBarBox刷新虚拟引用.langText() + ToolBarBox刷新虚拟引用.w(),
                    position: "left",
                    callback: refreshVirRef,
                })
            }
            if (toolbarlocatedoc.get()) {
                plugin.addTopBar({
                    icon: ToolBarBox突出定位文档.icon,
                    title: ToolBarBox突出定位文档.langText() + ToolBarBox突出定位文档.w(),
                    position: "left",
                    callback: () => { locateDoc(this.lastPart); },
                })
            }
            if (toolbarTidy.get()) {
                plugin.addTopBar({
                    icon: ToolBarBox整理assets下的图片视频音频.icon,
                    title: ToolBarBox整理assets下的图片视频音频.langText() + SPACE + ToolBarBox整理assets下的图片视频音频.w(),
                    position: "left",
                    callback: tidy,
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
            langKey: ToolBarBox整理assets下的图片视频音频.langKey,
            langText: ToolBarBox整理assets下的图片视频音频.langText(),
            hotkey: ToolBarBox整理assets下的图片视频音频.m,
            callback: tidy,
        });
        plugin.addCommand({
            langKey: ToolBarBox间隔重复.langKey,
            langText: ToolBarBox间隔重复.langText(),
            hotkey: ToolBarBox间隔重复.m,
            callback: () => openTab({ app: plugin.app, card: { type: "all" } })
        });
        plugin.addCommand({
            langKey: ToolBarBox刷新虚拟引用.langKey,
            langText: ToolBarBox刷新虚拟引用.langText(),
            hotkey: ToolBarBox刷新虚拟引用.m,
            callback: refreshVirRef,
        });
        plugin.addCommand({
            langKey: ToolBarBox突出定位文档.langKey,
            langText: ToolBarBox突出定位文档.langText(),
            hotkey: ToolBarBox突出定位文档.m,
            callback: () => locateDoc(this.lastPart),
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
        if (toolbarspacerepeat.get()) {
            if (!events.isMobile) {
                clearInterval(setGlobal("tomato showCardNumber 2025-06-13 15:33:11",
                    setInterval(() => {
                        this.showCardNumber();
                    }, 20000)
                ));
            }
        }
    }

    onunload() {
        this.ob?.disconnect();
        this.ob = null;
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
