import { Config, confirm, openTab } from "siyuan";
import { events } from "./libs/Events";
import { siyuan, } from "./libs/utils";
import { ClassActive, SPACE } from "./libs/gconst";
import { addIcon, createNumIcon } from "./libs/ui";
import { locateDoc, tidyAssets } from "./libs/docUtils";
import { toolbarEN2CHBtn, toolbarlocatedoc, toolbarrefreshVr, toolbarspacerepeat, toolbarTidy } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { winHotkey } from "./libs/winHotkey";
import { gatedAddCommand } from "./libs/cmdGate";
import { setGlobal } from "stonev5-utils";

export const ToolBarBox间隔重复 = winHotkey("alt+backspace", "间隔重复", "iconRiffCard", () => tomatoI18n.复习闪卡)
export const ToolBarBox刷新虚拟引用 = winHotkey("alt+delete", "刷新虚拟引用", "iconRef", () => tomatoI18n.刷新虚拟引用)
export const ToolBarBox突出定位文档 = winHotkey("alt+enter", "突出定位文档", "iconFocus", () => tomatoI18n.突出定位文档)
export const ToolBarBox整理assets下的图片视频音频 = winHotkey("ctrl+alt+shift+F9", "整理assets下的图片视频音频", "iconMove", () => tomatoI18n.整理assets下的图片视频音频)

class ToolbarBox {
    public plugin: BaseTomatoPlugin;
    private ob: MutationObserver;
    private lastPart: HTMLElement;
    private cardElement: HTMLElement;

    /** □4 时序统一：index.async onload 已 await taskCfg（框架保序），双路竞态消化退役 */
    onload(plugin: BaseTomatoPlugin) {
        // master toolbarBoxCheckbox 已退役（2026-09-06 开关归拢）：钮开关在通用域
        // 「快捷键与开关」卡各自成行，命令恒注册（钮显隐族语义，照大刷新先例）
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

        // 语言切换六钮（2026-09-15 转免费，bear 反馈拍板：价值撑不起 Pro，挂门反而稀释含金量）。
        // 必须传 BCP 47 码（kernel util.LangLegacyToBCP47 权威映射）：内核 setAppearance 对
        // appearance.lang 原样落盘、只规范顶层 Conf.Lang，而前端 UI 语言匹配只认 BCP——
        // 传历史码（zh_CN 等）= 内核 code 0 落盘但 reload 后 UI 语言不变（langfix 6810 实锤，
        // en_US 侥幸能用是前端默认语言恰为 en；zh_CN 回切必卡死）
        if (toolbarEN2CHBtn.get()) {
            plugin.addTopBar({
                icon: addIcon(plugin, "CN"),
                title: "        中文",
                position: "left",
                callback: async () => {
                    await changeLang("zh-CN");
                }
            })
            plugin.addTopBar({
                icon: addIcon(plugin, "EN"),
                title: "        English",
                position: "left",
                callback: async () => {
                    await changeLang("en");
                }
            })
            plugin.addTopBar({
                icon: addIcon(plugin, "CT"),
                title: "        中國臺灣",
                position: "left",
                callback: async () => {
                    await changeLang("zh-TW");
                }
            })
            plugin.addTopBar({
                icon: addIcon(plugin, "JP"),
                title: "        日本語",
                position: "left",
                callback: async () => {
                    await changeLang("ja");
                }
            })
            plugin.addTopBar({
                icon: addIcon(plugin, "ES"),
                title: "        es_ES",
                position: "left",
                callback: async () => {
                    await changeLang("es");
                }
            })
            plugin.addTopBar({
                icon: addIcon(plugin, "FR"),
                title: "        fr_FR",
                position: "left",
                callback: async () => {
                    await changeLang("fr");
                }
            })
        }

        // featgate □1 试点：四命令迁 gatedAddCommand（commandToggles 逐条关=命令面板项+
        // 快捷键齐不注册；族总开关仍管顶栏钮注册，两层开关语义独立）
        gatedAddCommand(plugin, ToolBarBox整理assets下的图片视频音频.langKey, {
            langText: ToolBarBox整理assets下的图片视频音频.langText(),
            hotkey: ToolBarBox整理assets下的图片视频音频.m,
            callback: tidy,
        });
        gatedAddCommand(plugin, ToolBarBox间隔重复.langKey, {
            langText: ToolBarBox间隔重复.langText(),
            hotkey: ToolBarBox间隔重复.m,
            callback: () => openTab({ app: plugin.app, card: { type: "all" } })
        });
        gatedAddCommand(plugin, ToolBarBox刷新虚拟引用.langKey, {
            langText: ToolBarBox刷新虚拟引用.langText(),
            hotkey: ToolBarBox刷新虚拟引用.m,
            callback: refreshVirRef,
        });
        gatedAddCommand(plugin, ToolBarBox突出定位文档.langKey, {
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

async function changeLang(lang: string) {
    const c = await siyuan.getConf();
    // lang 必须是 BCP 47 码（调用点注释有实锤详情）：内核 setAppearance 把 appearance.lang
    // 原样落盘且只规范顶层 Conf.Lang，前端 UI 语言匹配不认历史码——传 zh_CN 等=落盘成功
    // 但 reload 后 UI 不变（09-15 langfix 6810 实锤，en_US 侥幸能用纯属前端默认语言巧合）
    c.conf.appearance.lang = lang as Config.TLang;
    await siyuan.setAppearance(c.conf.appearance);
    // 换的是内核 appearance.lang（思源本体 UI 语言），插件级 reloadSelfPlugin 刷不动
    // 思源 chrome。整页 reload 白名单两处（插件重载统一战役 □1 判定 + 2026-09-06 大刷新
    // 迁入）：此处（换语言必须刷 chrome）与 index.ts 大刷新钮（用户点名的绝对刷新语义）
    window.location.reload();
}

async function refreshVirRef() {
    await siyuan.refreshVirtualBlockRef();
    events.protyleReload();
    await siyuan.pushMsg(tomatoI18n.已经刷新虚拟引用, 2000);
}

export const toolbarBox = new ToolbarBox();
