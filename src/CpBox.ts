import { siyuan, winHotkey } from "./libs/utils";
import "./index.scss";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { cpBoxCheckbox } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { OpenSyFile2 } from "./libs/docUtils";
import { events } from "./libs/Events";

const LongContentOpsLock = "LongContentOpsLock";

export const CpBox批量删除大量连续内容块 = winHotkey("⌘⇧L")
export const CpBox批量移动大量连续内容块 = winHotkey("⌘L")
export const CpBox批量复制大量连续内容块 = winHotkey("⌘O")

class CpBox {
    private plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        if (!cpBoxCheckbox.get()) return;

        this.plugin = plugin;
        this.plugin.addCommand({
            langKey: "deleteBlocks 2025-5-10 23:28:29",
            langText: tomatoI18n.批量删除大量连续内容块,
            hotkey: CpBox批量删除大量连续内容块.m,
            callback: async () => {
                navigator.locks.request(LongContentOpsLock, { ifAvailable: true }, async (lock) => {
                    if (lock) {
                        await this.deleteBlocks();
                    } else {
                        siyuan.pushMsg(this.plugin.i18n.wait4finish);
                    }
                });
            },
        });
        this.plugin.addCommand({
            langKey: "moveBlocks 2025-5-10 23:29:52",
            langText: tomatoI18n.批量移动大量连续内容块,
            hotkey: CpBox批量移动大量连续内容块.m,
            callback: async () => {
                navigator.locks.request(LongContentOpsLock, { ifAvailable: true }, async (lock) => {
                    if (lock) {
                        await this.moveBlocks(false);
                    } else {
                        siyuan.pushMsg(this.plugin.i18n.wait4finish);
                    }
                });
            },
        });
        this.plugin.addCommand({
            langKey: "copyBlocks 2025-5-10 23:31:46",
            langText: tomatoI18n.批量复制大量连续内容块,
            hotkey: CpBox批量复制大量连续内容块.m,
            callback: async () => {
                navigator.locks.request(LongContentOpsLock, { ifAvailable: true }, async (lock) => {
                    if (lock) {
                        await this.moveBlocks(true);
                    } else {
                        siyuan.pushMsg(this.plugin.i18n.wait4finish);
                    }
                });
            },
        });
    }

    private async deleteBlocks() {
        const protyle = events.protyle.protyle;
        siyuan.pushMsg(tomatoI18n.批量删除正在检查数据);
        await siyuan.deleteBlocksUtil();
        protyle.getInstance().reload(false);
        await siyuan.pushMsg("batch deleted!");
    }

    private async moveBlocks(ops: boolean) {
        const protyle = events.protyle.protyle;
        siyuan.pushMsg(tomatoI18n.批量复制移动正在检查数据);
        const blocks = await siyuan.moveBlocksUtil(ops);
        if (blocks?.length > 0) {
            await OpenSyFile2(this.plugin, blocks[blocks.length - 1].id)
            await OpenSyFile2(this.plugin, blocks[0].id)
            protyle.getInstance().reload(false);
        }
        await siyuan.pushMsg("batch moved!");
    }
}

export const cpBox = new CpBox();
