import { Dialog } from "siyuan";
import { newID } from "stonev5-utils";
import { events } from "../libs/Events";
import { OpenSyFile2 } from "../libs/docUtils";
import {
    closeTab,
    closeTabByDocID,
    siyuan,
    getTomatoPluginInstance,
    getNotebookFirstOne,
} from "../libs/utils";
import { dialog2floating } from "../libs/DialogText";
import { floatingballBallList, floatingballDocOpenBottom, storeNoteBox_selectedNotebook } from "../libs/stores";
import { tomatoI18n } from "../tomatoI18n";
import { getFloatingBall, ballOverLimit, getFloatingBallProtyleDialog, getFloatingBallProtyleDialogDM } from "../FloatingBall";
import { pickToggleBall, toggleDecision, isOpenDocTypeFloat, resolveFocusID } from "../libs/ballDocToggle";
import {
    FloatingBallDocType_autoclose,
    FloatingBallDocType_dialog,
    FloatingBallDocType_tab,
} from "../libs/gconst";
import ProtyleSv4Dialog from "../libs/ProtyleSv4Dialog.svelte";
import { mount, unmount } from "svelte";
import { DestroyManager } from "../libs/destroyer";
import type { BallAction } from "./index";

// 文档球：四种打开方式（tab/dialog/float/autoclose）+ $$dailynote 当天日志（每次点击现建）。
// 期1 两大修复之一在此生效：绑定时落 docID（execute 优先走 docID；缺 docID 才按名搜，
// 搜到自愈写回），治重名开错/改名断链。
// 期3 起修饰键删除暗手势退役——删除唯一入口收敛到右键/长按菜单（libs/ballMenu.ts）。

// dialog 打开方式的会话态（每球至多一个 Dialog；不落 settings 故不入 BallItem）
const dialogs = new WeakMap<BallItem, Dialog>();

// fbfeat □1：最近使用的 doc 球 id（⌘⇧F8 toggle 的目标）。挂 globalThis——petal 写会触发
// 前端插件整重载把模块级内存态归零，跨代存活只有全局对象（ws 事务监听配对坑同款）
const LastDocBallKey = "TomatoFloatingLastDocBall";
function rememberLastDocBall(ball: BallItem) {
    (globalThis as any)[LastDocBallKey] = ball.id;
}
/** 落底定位 id（仅 tab 通道——OpenSyFile2→openTab 默认 action=cb-get-hl 滚到尾块
 *  （bear 09-15 禁聚焦政策，navUtils 默认值已去 cb-get-focus）；对话框/悬浮窗内
 *  new Protyle 构造不消费 action，滚底走 ballDocToggle.scrollDocBottom） */
const focusIDOf = (docID: string) =>
    resolveFocusID(docID, floatingballDocOpenBottom.get() === true, (id) => siyuan.getDocLastID(id));

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
        rememberLastDocBall(ball);
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
            // float 语义走谓词分支（非法/缺失 openDocType 兜底按 float——谓词与
            // toggleDecision 共用，两处判定错位会让兜底球的悬浮窗永远关不掉）
            if (isOpenDocTypeFloat(item.openDocType)) {
                getFloatingBallProtyleDialog(ball, docID);
                item.openOnCreate = true;
                floatingballBallList.write();
                getFloatingBall(ball)?.destroyBy();
                return;
            }
            switch (item.openDocType) {
                case FloatingBallDocType_tab.id:
                    // $$dailynote 页签标题≠绑定名（$$dailynote），按标题关恒 miss——按解析出的 docID 关
                    if (item.docName === "$$dailynote" ? closeTabByDocID(docID) : closeTab(item.docName)) {
                        //
                    } else {
                        await OpenSyFile2(getTomatoPluginInstance(), await focusIDOf(docID));
                    }
                    break;
                case FloatingBallDocType_dialog.id:
                    if (dialogs.get(ball) != null) {
                        dialogs.get(ball).destroy();
                    } else {
                        openByDialog(ball, false, docID);
                    }
                    break;
                case FloatingBallDocType_autoclose.id:
                    if (dialogs.get(ball) != null) {
                        dialogs.get(ball).destroy();
                    } else {
                        openByDialog(ball, true, docID);
                    }
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
    // fbfeat □1：⌘⇧F8「显示/隐藏悬浮文档」——目标=最近使用的 doc 球（无记录/被删/禁用
    // →当前平台第一个启用的 doc 球兜底）。dialog/autoclose/tab 型 execute 内建 toggle；
    // float 型开着时 execute 是幂等「确保开」，须显式走退场链（exitProtyle 同款：
    // openOnCreate 清+复球+关窗——直杀 dm 会绕过球复活，recipe-floatball 实锤）
    async toggle() {
        const ball = pickToggleBall(
            floatingballBallList.get() ?? [],
            (globalThis as any)[LastDocBallKey],
            events.isMobile,
            ballOverLimit(), // VIP 超限灰档球挂载明面跳过，toggle 同不放行
        );
        if (!ball) {
            await siyuan.pushMsg(tomatoI18n.请先绑定文档到悬浮球);
            return;
        }
        if (toggleDecision(ball, getFloatingBallProtyleDialogDM(ball) != null) === "close") {
            ball.action.openOnCreate = false;
            floatingballBallList.write();
            getFloatingBall(ball);
            getFloatingBallProtyleDialogDM(ball)?.destroyBy();
            return;
        }
        await this.execute(ball, {});
    },
};

function openByDialog(ball: BallItem, autoclose = false, docID = "") {
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
            // docID 透传（$$dailynote 每次点击现建，解析值只作参数不写回 item——
            // 写回会让 float 的 dm 键随日期漂移，跨天 toggle 探测 miss 开双窗）
            docID: docID || item.docID,
            openBottom: floatingballDocOpenBottom.get() === true,
        },
    });
    dm.add("dialog", () => {
        dialog?.destroy();
    });
    dm.add("svelte", () => {
        unmount(sv);
    });
}
