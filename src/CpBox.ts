import { siyuan, } from "./libs/utils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { deleteBlocksMenu, pairBarEnabled } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { getDocBlocks, OpenSyFile2 } from "./libs/docUtils";
import { events } from "./libs/Events";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
import { regPairCmd } from "./libs/pairCmdRegistry";
import { IProtyle } from "siyuan";

/** 长内容批量操作跨入口并发锁（R5 □2 起浮条删除档与老三键共用同款防并发） */
export const LongContentOpsLock = "LongContentOpsLock";

export const CpBox批量删除大量连续内容块 = winHotkey("alt+shift+;", "deleteBlocks", "iconTrashcan", () => tomatoI18n.批量删除大量连续内容块, false, deleteBlocksMenu)
// langText 第四参补齐（R5 □3）：速查子菜单/tooltip 键位行消费 langText()/.w()，缺参即崩
export const CpBox批量移动大量连续内容块 = winHotkey("alt+shift+'", "moveBlocks", "", () => tomatoI18n.批量移动大量连续内容块)
export const CpBox批量复制大量连续内容块 = winHotkey("alt+shift+q", "copyBlocks", "", () => tomatoI18n.批量复制大量连续内容块)

class CpBox {
    private plugin: BaseTomatoPlugin;

    async onload(plugin: BaseTomatoPlugin) {
        // R5 □1 总开关化：长内容工具命令注册随块配对工具总开关（开关控制注册，中途改需 reload）
        if (!pairBarEnabled.get()) return;

        this.plugin = plugin;

        // addCommand+速查登记二合一（R5 □3）：⋯ 菜单速查子菜单点击查表直调
        const addPairCmd = (cmd: any) => {
            this.plugin.addCommand(cmd);
            regPairCmd(cmd.langKey, cmd.editorCallback ?? cmd.callback);
        };

        const deleteBlocks = async () => {
            navigator.locks.request(LongContentOpsLock, { ifAvailable: true }, async (lock) => {
                if (lock) {
                    await this.deleteBlocks();
                } else {
                    siyuan.pushMsg(tomatoI18n.请等待上个操作完成);
                }
            });
        };


        addPairCmd({
            langKey: CpBox批量删除大量连续内容块.langKey,
            langText: CpBox批量删除大量连续内容块.langText(),
            hotkey: CpBox批量删除大量连续内容块.m,
            callback: deleteBlocks,
        });
        addPairCmd({
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
        addPairCmd({
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
            addIfVisible(menu, CpBox批量删除大量连续内容块.langKey, {
                label: CpBox批量删除大量连续内容块.langText(),
                icon: CpBox批量删除大量连续内容块.icon,
                accelerator: CpBox批量删除大量连续内容块.m,
                click: deleteBlocks,
            }, CpBox批量删除大量连续内容块.menu());
            if (CpBox批量删除大量连续内容块.menu()) {
                addIfVisible(menu, "m.cpBox.clean2SubDoc", {
                    label: tomatoI18n.清理文档内容到子文档,
                    icon: "iconFolder",
                    accelerator: "",
                    click: () => {
                        this.moveAll2SubDoc(detail.protyle);
                    },
                });
                addIfVisible(menu, "m.cpBox.cleanAll", {
                    label: tomatoI18n.清理文档内容,
                    icon: "iconClear",
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
