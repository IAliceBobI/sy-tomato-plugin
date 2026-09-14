import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { fastNoteBoxCheckbox } from "./libs/stores";
import { siyuan, } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import { OpenSyFile2 } from "./libs/docUtils";
import { events } from "./libs/Events";
import { getActiveProtyle } from "./libs/domUtils";
import { debugLog } from "./libs/logUtils";
import { createNote, switchDraft } from "./libs/switchDraft";
import { winHotkey } from "./libs/winHotkey";
import { gatedAddCommand } from "./libs/cmdGate";
import { getAllEditor } from "siyuan";

/** 冷启动兜底链诊断串（Loki 打点用，逻辑勿依赖）：单例态/激活页签选择器命中/
 *  getAllEditor 各编辑器页签宿主——getActiveProtyle 逐环环境事实全可见 */
function activeProtyleDiag(): string {
    const tab = document.querySelector(".layout__wnd--active > .fn__flex > .layout-tab-bar > .item--focus");
    const eds = getAllEditor();
    const panels = eds.map(p => p?.protyle?.element?.closest("[data-id]")?.getAttribute("data-id") ?? "-").join("|");
    return `mob=${events.isMobile} singleton=${!!events.protyle?.protyle} tab=${!!tab} tabID=${tab?.getAttribute("data-id") ?? "none"} eds=${eds.length} panels=${panels}`;
}

export const FastNoteBox创建快速笔记 = winHotkey("shift+alt+n", "创建快速笔记")
export const FastNoteBox打开最后一个笔记 = winHotkey("⌘⌥N", "打开最后一个笔记")
export const FastNoteBox草稿切换 = winHotkey("alt+F4", "草稿切换", "", () => tomatoI18n.草稿切换 + " · " + tomatoI18n.切换到文档背面, true)

class FastNoteBox {
    plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        if (!fastNoteBoxCheckbox.get()) return;
        // Pro 门禁在 createNote 内部（删原文前）逐次验证；onload 不做网络往返——
        // 挡在 addCommand 前会拖慢命令注册（插件重载战役 onload 纪律，qn-robust）
        this.plugin = plugin;
        gatedAddCommand(this.plugin, FastNoteBox创建快速笔记.langKey, {
            langText: tomatoI18n.创建快速笔记,
            hotkey: FastNoteBox创建快速笔记.m,
            callback: () => {
                navigator.locks.request("FastNoteBox2024-08-06 12:38:21", { mode: "exclusive" }, async (lock) => {
                    // 三级链（bear 2026-09-14 空笔记语义）：单例（热态）→ 激活页签 DOM
                    // （冷启动刷新后单例空窗 + ?id= 直开单例恒空，dev 实测 eds=1 可命中）
                    // → 仍空=空笔记（建文件+打开不需要编辑器）。打点留观察（09-14 排障）
                    if (!lock) return;
                    const p = events.protyle?.protyle ?? getActiveProtyle() ?? undefined;
                    debugLog("fastnote", `cmd p=${p ? "hit" : "empty->blank-note"} ${activeProtyleDiag()}`, "fastnote");
                    await createNote(this.plugin, p);
                })
            },
        });
        gatedAddCommand(this.plugin, FastNoteBox打开最后一个笔记.langKey, {
            langText: tomatoI18n.打开最后一个笔记,
            hotkey: FastNoteBox打开最后一个笔记.m,
            callback: () => {
                this.openNote()
            },
        });
        gatedAddCommand(this.plugin, FastNoteBox草稿切换.langKey, {
            langText: FastNoteBox草稿切换.langText(),
            hotkey: FastNoteBox草稿切换.m,
            callback: () => {
                if (FastNoteBox草稿切换.cmd()) {
                    switchDraft(this.plugin, events.protyle?.protyle ?? getActiveProtyle() ?? undefined)
                }
            },
        });
    }

    private async openNote() {
        const kName: keyof (AttrType) = "custom-fastnote";
        const rows = await siyuan.sqlAttr(`select root_id from attributes where name="${kName}" order by value desc limit 1`)
        if (!rows || rows.length == 0) {
            siyuan.pushMsg(tomatoI18n.找不到快速笔记)
            return
        }
        OpenSyFile2(this.plugin, rows[0].root_id)
    }
}

export const fastNoteBox = new FastNoteBox();
