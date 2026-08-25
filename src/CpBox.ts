import { siyuan, } from "./libs/utils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { cpBoxCheckbox, deleteBlocksMenu } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { getDocBlocks, OpenSyFile2 } from "./libs/docUtils";
import { events } from "./libs/Events";
import { winHotkey } from "./libs/winHotkey";
import { IProtyle } from "siyuan";

const LongContentOpsLock = "LongContentOpsLock";

export const CpBox批量删除大量连续内容块 = winHotkey("alt+shift+;", "deleteBlocks 2025-5-10 23:28:29", "🧹", () => tomatoI18n.批量删除大量连续内容块, false, deleteBlocksMenu)
export const CpBox批量移动大量连续内容块 = winHotkey("alt+shift+'", "moveBlocks 2025-5-10 23:29:52")
export const CpBox批量复制大量连续内容块 = winHotkey("alt+shift+q", "copyBlocks 2025-5-10 23:31:46")

class CpBox {
    private plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        if (!cpBoxCheckbox.get()) return;

        this.plugin = plugin;

        const deleteBlocks = async () => {
            navigator.locks.request(LongContentOpsLock, { ifAvailable: true }, async (lock) => {
                if (lock) {
                    await this.deleteBlocks();
                } else {
                    siyuan.pushMsg(tomatoI18n.请等待上个操作完成);
                }
            });
        };


        this.plugin.addCommand({
            langKey: CpBox批量删除大量连续内容块.langKey,
            langText: CpBox批量删除大量连续内容块.langText(),
            hotkey: CpBox批量删除大量连续内容块.m,
            callback: deleteBlocks,
        });
        this.plugin.addCommand({
            langKey: CpBox批量移动大量连续内容块.langKey,
            langText: tomatoI18n.批量移动大量连续内容块,
            hotkey: CpBox批量移动大量连续内容块.m,
            callback: async () => {
                navigator.locks.request(LongContentOpsLock, { ifAvailable: true }, async (lock) => {
                    if (lock) {
                        await this.moveBlocks(false);
                    } else {
                        siyuan.pushMsg(tomatoI18n.请等待上个操作完成);
                    }
                });
            },
        });
        this.plugin.addCommand({
            langKey: CpBox批量复制大量连续内容块.langKey,
            langText: tomatoI18n.批量复制大量连续内容块,
            hotkey: CpBox批量复制大量连续内容块.m,
            callback: async () => {
                navigator.locks.request(LongContentOpsLock, { ifAvailable: true }, async (lock) => {
                    if (lock) {
                        await this.moveBlocks(true);
                    } else {
                        siyuan.pushMsg(tomatoI18n.请等待上个操作完成);
                    }
                });
            },
        });
        this.plugin.eventBus.on("open-menu-content", async ({ detail }) => {
            const menu = detail.menu;
            if (CpBox批量删除大量连续内容块.menu()) {
                menu.addItem({
                    label: CpBox批量删除大量连续内容块.langText(),
                    iconHTML: CpBox批量删除大量连续内容块.icon,
                    accelerator: CpBox批量删除大量连续内容块.m,
                    click: deleteBlocks,
                });
                menu.addItem({
                    label: tomatoI18n.清理文档内容到子文档,
                    iconHTML: "🚛",
                    accelerator: "",
                    click: () => {
                        this.moveAll2SubDoc(detail.protyle);
                    },
                });
                menu.addItem({
                    label: tomatoI18n.清理文档内容,
                    iconHTML: "🧹",
                    accelerator: "",
                    click: () => {
                        this.moveAll(detail.protyle);
                    },
                });
            }
        });
    }

    private async moveAll2SubDoc(protyle: IProtyle) {
        const info = events.getInfo(protyle);
        const row = siyuan.getRowByID(info.docID);
        const { div, root } = await getDocBlocks(info.docID, "", false, true, 1)
        const title = div.textContent.slice(0, 15);
        const path = `${(await row).hpath}/${title}`
        const subDocID = await siyuan.createDocWithMd(info.notebookId, path, "")
        const ids = root.children.map(b => b.id)
        await siyuan.moveBlocksAsChild(ids, subDocID)
    }

    private async moveAll(protyle: IProtyle) {
        const info = events.getInfo(protyle);
        const blocks = await siyuan.getChildBlocks(info.docID)
        await siyuan.deleteBlocks(blocks.map(i => i.id))
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
