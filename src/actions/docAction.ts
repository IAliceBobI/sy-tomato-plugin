import { Dialog } from "siyuan";
import { newID } from "stonev5-utils";
import { events } from "../libs/Events";
import { OpenSyFile2 } from "../libs/docUtils";
import {
    closeTab,
    siyuan,
    getTomatoPluginInstance,
    getNotebookFirstOne,
} from "../libs/utils";
import { dialog2floating } from "../libs/DialogText";
import { floatingballBallList, storeNoteBox_selectedNotebook } from "../libs/stores";
import { tomatoI18n } from "../tomatoI18n";
import { getFloatingBall, getFloatingBallProtyleDialog } from "../FloatingBall";
import {
    FloatingBallDocType_autoclose,
    FloatingBallDocType_dialog,
    FloatingBallDocType_float,
    FloatingBallDocType_tab,
} from "../libs/gconst";
import ProtyleSv4Dialog from "../libs/ProtyleSv4Dialog.svelte";
import { mount } from "svelte";
import { DestroyManager } from "../libs/destroyer";
import type { BallAction } from "./index";

// 文档球：四种打开方式（tab/dialog/float/autoclose）+ $$dailynote 当天日志（每次点击现建）。
// 期1 两大修复之一在此生效：绑定时落 docID（execute 优先走 docID；缺 docID 才按名搜，
// 搜到自愈写回），治重名开错/改名断链。
// 期3 起修饰键删除暗手势退役——删除唯一入口收敛到右键/长按菜单（libs/ballMenu.ts）。

// dialog 打开方式的会话态（每球至多一个 Dialog；不落 settings 故不入 BallItem）
const dialogs = new WeakMap<BallItem, Dialog>();

export function unbindBall(ball: BallItem) {
    const list = floatingballBallList.get() ?? [];
    const idx = list.findIndex((b) => b.id === ball.id);
    if (idx >= 0) list.splice(idx, 1);
    floatingballBallList.write();
    dialogs.get(ball)?.destroy();
    dialogs.delete(ball);
    getFloatingBallProtyleDialog(ball)?.destroyBy();
    getFloatingBall(ball)?.destroyBy();
}

export const docAction: BallAction = {
    type: "doc",
    defaultConfig() {
        return { type: "doc", icon: "📄" };
    },
    async execute(ball: BallItem, _ctx?: { event?: MouseEvent; element?: HTMLElement }) {
        const item = (ball.action ??= {});
        let docID = item.docID || "";
        if (item.docName === "$$dailynote") {
            const nb = storeNoteBox_selectedNotebook.get()
                || getNotebookFirstOne()?.id
                || events.boxID;
            docID = (await siyuan.createDailyNote(nb)).id;
        }
        if (events.isMobile) {
            if (dialogs.get(ball) != null) {
                dialogs.get(ball).destroy();
            } else {
                openByDialog(ball);
            }
            return;
        }
        if (!docID) {
            const docs = await siyuan.getDocRowsByName(item.docName);
            docID = docs?.at(0)?.id ?? "";
            if (docID) {
                // 自愈：按名搜到后写回，后续点击不再受重名/改名影响
                item.docID = docID;
                floatingballBallList.write();
            }
        }
        if (docID) {
            switch (item.openDocType) {
                case FloatingBallDocType_tab.id:
                    if (closeTab(item.docName)) {
                        //
                    } else {
                        await OpenSyFile2(getTomatoPluginInstance(), docID);
                    }
                    break;
                case FloatingBallDocType_dialog.id:
                    if (dialogs.get(ball) != null) {
                        dialogs.get(ball).destroy();
                    } else {
                        openByDialog(ball);
                    }
                    break;
                case FloatingBallDocType_autoclose.id:
                    if (dialogs.get(ball) != null) {
                        dialogs.get(ball).destroy();
                    } else {
                        openByDialog(ball, true);
                    }
                    break;
                case FloatingBallDocType_float.id:
                default:
                    getFloatingBallProtyleDialog(ball);
                    item.openOnCreate = true;
                    floatingballBallList.write();
                    getFloatingBall(ball)?.destroyBy();
                    break;
            }
        } else {
            await siyuan.pushMsg(tomatoI18n.找不到文档 + ": " + item.docName);
        }
    },
    display(ball: BallItem) {
        return ball.icon || ball.action?.docIcon || ball.action?.docName;
    },
    tooltip(ball: BallItem) {
        return ball.label || ball.action?.docName || "";
    },
};

function openByDialog(ball: BallItem, autoclose = false) {
    const item = ball.action ?? {};
    const dm = new DestroyManager();
    const id = newID();
    const dialog = new Dialog({
        title: item.docName,
        content: `<div id="${id}"></div>`,
        width: events.isMobile ? "90vw" : "700px",
        height: events.isMobile ? "180svw" : "700px",
        destroyCallback: () => {
            dm.destroyBy();
            if (dialogs.get(ball) === dialog) dialogs.delete(ball);
        },
        transparent: true,
        disableClose: events.isMobile || autoclose ? false : true,
        hideCloseIcon: false,
    });
    dialogs.set(ball, dialog);
    if (!events.isMobile && !autoclose) {
        dialog2floating(dialog, { x: "", y: "" });
        dialog.element.style.zIndex = "10";
    }

    const sv = mount(ProtyleSv4Dialog, {
        target: dialog.element.querySelector("#" + id),
        props: {
            dm,
            docName: item.docName,
            docID: item.docID,
        },
    });
    dm.add("dialog", () => {
        dialog?.destroy();
    });
    dm.add("svelte", () => {
        sv.destroy();
    });
}
