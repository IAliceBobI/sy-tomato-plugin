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
import { debugLog } from "../libs/logUtils";
import { floatingballBallList, floatingballDocOpenBottom, floatingballKeepBall, storeNoteBox_selectedNotebook } from "../libs/stores";
import { tomatoI18n } from "../tomatoI18n";
import { getFloatingBall, ballOverLimit, FloatingBall, getFloatingBallProtyleDialog, getFloatingBallProtyleDialogDM } from "../FloatingBall";
import { pickToggleBall, toggleDecision, isOpenDocTypeFloat, keepBallClickDecision, resolveFocusID, shouldPrefetchTail, fetchTailWindow } from "../libs/ballDocToggle";
import {
    FloatingBallDocType_autoclose,
    FloatingBallDocType_tab,
} from "../libs/gconst";
import ProtyleSv4Dialog from "../libs/ProtyleSv4Dialog.svelte";
import { mount, unmount } from "svelte";
import { DestroyManager } from "../libs/destroyer";
import type { BallAction } from "./index";

// 文档球：三种打开方式（tab/float/autoclose，fballfb □5 砍 dialog 型）+ $$dailynote
// 当天日志（每次点击现建）。
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
/** 落底定位 id（仅 tab 通道——OpenSyFile2→openTab 按 keepFocus 分流 action：跳底开=
 *  cb-get-focus+cb-get-outline 光标钉尾块块尾（bear 09-20 打开即续写豁免）；跳底关=
 *  cb-get-hl 只滚动（bear 09-15 禁聚焦政策）。对话框/悬浮窗内 new Protyle 构造不
 *  消费定位类 action——跳底走尾窗种档直载（fballtail □1/□2，docAction 预取+组件
 *  构造期 cb-get-rootscroll） */
const focusIDOf = (docID: string) =>
    resolveFocusID(docID, floatingballDocOpenBottom.get() === true, (id) => siyuan.getDocLastID(id));

export function unbindBall(ball: BallItem) {
    const list = floatingballBallList.get() ?? [];
    const idx = list.findIndex((b) => b.id === ball.id);
    if (idx >= 0) {
        list.splice(idx, 1);
        floatingballBallList.write();
    }
    dialogs.get(ball)?.destroy();
    dialogs.delete(ball);
    // fballfeedback □4b：销毁走探测式（不新建）——getFloatingBall/getFloatingBallProtyleDialog
    // 在 dm 不在时会顺手新建再销毁（净 0 浪费+重建瞬间有竞态窗）；悬浮窗已有 DM 探测版，
    // 球侧同款直查 globalThis 键
    getFloatingBallProtyleDialogDM(ball)?.destroyBy();
    const ballKey = FloatingBall.key(`ball#${ball.id}`);
    (globalThis[ballKey] as DestroyManager)?.destroyBy?.();
    // □7 DOM 直删兜底：球 dm 曾有死锁形态（构造回调内 openOnCreate 自毁竞态，FloatingBall.ts
    // □7 注释）——destroyBy 对死 dm 无效，按 floating-ball-key 属性直删 DOM 收尾（sweep 同款）
    document.querySelectorAll(`[floating-ball-key="${ballKey}"]`).forEach((e) => e.remove());
    delete (globalThis as any)[ballKey];
    // □4b 幽灵球兜底：idx<0=列表本无此球（历史泄漏孤儿：页面上活着但列表没有，右键/
    // 解除删除以列表为准对它必然无效，重启思源清全局态才消——陆杰 09-16 二分实验实锤）。
    // 此时上方链条全空转，按键前缀直扫收掉本球遗留的球/窗（悬浮窗键绑 docID 一并收）
    if (idx < 0) {
        const winKey = ball.action?.docID ? FloatingBall.key(`protyle#2#${ball.action.docID}`) : null;
        for (const k of Object.keys(globalThis)) {
            if (k === ballKey || (winKey && k === winKey)) {
                (globalThis[k] as DestroyManager)?.destroyBy?.();
                delete (globalThis as any)[k];
            }
        }
    }
}

export const docAction: BallAction = {
    type: "doc",
    defaultConfig() {
        return { type: "doc", icon: "📄" };
    },
    async execute(ball: BallItem, _ctx?: { event?: MouseEvent; element?: HTMLElement }) {
        rememberLastDocBall(ball);
        const item = (ball.action ??= {});
        // fballfb □3：「打开后保留悬浮球」开→点球即开合（float 型窗活着→关，与 ⌘⇧F8
        // toggle 同一决策，keepBallClickDecision=keep 开关×toggleDecision 组合）。判定
        // 放在 docID 解析前——$$dailynote 的关窗点击不该顺带触发当日日记现建
        // （createDailyNote 有建文档副作用）。keep 模式球从不自毁（下方 float 分支跳过
        // 反杀），关窗无需复球链；openOnCreate 只在遗留 true（开关关期开窗后切开关的
        // 历史态）时清+写盘，免无谓 petal 写。mobile 的 float 窗走 dialogs 通道不经
        // protyle#2# dm 键，此探测恒 miss 不受影响
        if (keepBallClickDecision(floatingballKeepBall.get() === true, ball, getFloatingBallProtyleDialogDM(ball) != null) === "close") {
            if (item.openOnCreate) {
                item.openOnCreate = false;
                floatingballBallList.write();
            }
            getFloatingBallProtyleDialogDM(ball)?.destroyBy();
            return;
        }
        let docID = item.docID || "";
        if (item.docName === "$$dailynote") {
            const nb = storeNoteBox_selectedNotebook.get()
                || getNotebookFirstOne()?.id
                || events.boxID;
            // fballtail □7：nb 三级兜底全空（全新空间未开笔记本）时 createDailyNote
            // 返回 null，裸取 .id 抛 TypeError 断 execute——球点击零反馈静默失败
            // （e2e pageerror 实锤）；判空提示后早退，等用户开了笔记本再用
            if (!nb) {
                await siyuan.pushMsg(tomatoI18n.无可用笔记本请先打开, 2500);
                return;
            }
            docID = (await siyuan.createDailyNote(nb)).id;
        }
        if (events.isMobile) {
            if (dialogs.get(ball) != null) {
                dialogs.get(ball).destroy();
            } else {
                // fballtail □2：补传 docID（桌面分支同款）——mobile 同链直载须拿到解析值
                // 预取尾窗（$$dailynote 现建日记的 docID 也只在 execute 侧解析）
                openByDialog(ball, docID);
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
                // fballtail □1：跳底直载预取——openBottom 开恒查尾窗（fballfb □2 bear
                // 09-21 拍板「开关开=必跳底」：此前 restore 档优先于跳底，球存过
                // lastRead 就恢复、开关开了也不跳，与 tab 链行为分裂——陆杰 08:15 反馈
                // +bear 实锤；旧 restore/dailyNote 参与判定的语义已退役）。尾窗=真树序
                // 尾部 N 块（N 与内核窗口上限同源），经 props 传入悬浮窗组件构造期种档
                // 直载（内核官方重开恢复管线，一次请求一次渲染落底）；预取失败/空→
                // undefined→组件回退现行遮眼+slider 链。预取 await 在开窗前（一次
                // getTailChildBlocks 往返），换「窗开瞬间即构造且直落底部」无中间画帧。
                // 窗已开（execute 幂等「确保开」路径）时直接跳过预取免白跑。开关判定与
                // 组件侧同口径（两处错位=白跑请求或漏跳底，fballtail 注释原话）
                const tail = getFloatingBallProtyleDialogDM(ball) == null && shouldPrefetchTail(
                    floatingballDocOpenBottom.get() === true,
                ) ? await fetchTailWindow(docID, (id, n) => siyuan.getTailChildBlocks(id, n))
                  : undefined;
                getFloatingBallProtyleDialog(ball, docID, tail);
                // fballfb □3：「打开后保留悬浮球」开→不反杀球本体+不写 openOnCreate
                // （球一直在，无需「重载后复活+自动开窗」链——窗不再跨重载存活）；
                // 关→维持现状二选一（开窗即杀球+openOnCreate 写盘，重载后球复活自动
                // 开窗再自毁）。else-if=遗留迁移：开关关期写盘的 true 在 keep 模式已无
                // 意义，开窗时顺手清掉收敛语义（不清则每次重载都自动开窗直到首次关窗）
                if (floatingballKeepBall.get() !== true) {
                    item.openOnCreate = true;
                    floatingballBallList.write();
                    getFloatingBall(ball)?.destroyBy();
                } else if (item.openOnCreate) {
                    item.openOnCreate = false;
                    floatingballBallList.write();
                }
                return;
            }
            switch (item.openDocType) {
                case FloatingBallDocType_tab.id:
                    // $$dailynote 页签标题≠绑定名（$$dailynote），按标题关恒 miss——按解析出的 docID 关
                    if (item.docName === "$$dailynote" ? closeTabByDocID(docID) : closeTab(item.docName)) {
                        //
                    } else {
                        // bear 09-20：跳底开=打开即续写——keepFocus 豁免禁聚焦（同日记
                        // 跳底，光标钉尾块块尾）；跳底关=维持禁聚焦政策不动
                        const atBottom = floatingballDocOpenBottom.get() === true;
                        await OpenSyFile2(getTomatoPluginInstance(), await focusIDOf(docID),
                            null, null, null, null, atBottom);
                    }
                    break;
                // fballfb □5：dialog 型（id=2）退役——存量已 migrateDialogDocBalls 迁 float，
                // 谓词分支在前兜底（2 判 float），switch 不再有 2 的合法入口
                case FloatingBallDocType_autoclose.id:
                    if (dialogs.get(ball) != null) {
                        dialogs.get(ball).destroy();
                    } else {
                        openByDialog(ball, docID);
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
    // →当前平台第一个启用的 doc 球兜底）。autoclose/tab 型 execute 内建 toggle；
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

async function openByDialog(ball: BallItem, docID = "") {
    const item = ball.action ?? {};
    const dm = new DestroyManager();
    // fballtail □2：跳底直载预取（同 □1 float 分支）——开关开才查尾窗（真树序尾部
    // N 块，N 与内核窗口上限同源），经 props 传入 ProtyleSv4Dialog 构造期种档直载
    // （内核官方重开恢复管线，一次请求一次渲染落底）；预取失败/空/docID 未解析→
    // undefined→组件普通头窗构造（原 scrollDocBottomForDoc「头窗+轮询滚底」通道已
    // 退役——统一通道胜过特殊化）。本链无 restore 面（lastRead 记录/恢复是 float
    // 窗特性）——开关开恒预取，与现行「开恒滚底」语义一致。预取 await 在开窗前
    // （一次 getTailChildBlocks 往返），换「窗开瞬间即构造且直落底部」无中间画帧；
    // mobile 同链（execute isMobile 分支同传 docID）。
    // fballfb □5：dialog 型（拖动常驻+disableClose）退役后本通道只剩 autoclose（桌面）
    // 与 mobile 两形态，都是「点外即关」——disableClose 恒 false、dialog2floating
    // 拖动常驻分支随参数删除（原 autoclose 布尔已无行为差异）
    const tail = shouldPrefetchTail(floatingballDocOpenBottom.get() === true)
        ? await fetchTailWindow(docID, (bid, n) => siyuan.getTailChildBlocks(bid, n))
        : undefined;
    debugLog("fball", `dialog tail prefetch ${tail ? tail.length + " blocks" : "miss"} doc=${(docID || item.docID || "-").slice(-6)}`, "fball");
    const id = newID();
    const dialog = new Dialog({
        title: item.docName,
        // fballtail □4：content 根 div 须带高度（.b3-dialog__body 高 definite）——
        // 裸 div 高度 auto 时组件 .protyleMount 的 100% 相对非 definite 高退化
        // 不解析（在档坑：block 容器里子代 height:100% 不解析），protyle 又被内容撑全高
        content: `<div id="${id}" style="height:100%"></div>`,
        width: events.isMobile ? "90vw" : "700px",
        height: events.isMobile ? "180svw" : "700px",
        destroyCallback: () => {
            dm.destroyBy();
            if (dialogs.get(ball) === dialog) dialogs.delete(ball);
        },
        transparent: true,
        disableClose: false,
        hideCloseIcon: false,
    });
    dialogs.set(ball, dialog);

    const sv = mount(ProtyleSv4Dialog, {
        target: dialog.element.querySelector("#" + id),
        props: {
            dm,
            docName: item.docName,
            // docID 透传（$$dailynote 每次点击现建，解析值只作参数不写回 item——
            // 写回会让 float 的 dm 键随日期漂移，跨天 toggle 探测 miss 开双窗）
            docID: docID || item.docID,
            // 跳底语义全在此 props（openBottom prop 已退役并入 tail 缺省——共享组件
            // 不读悬浮球域设置，开关判定留在调用方）
            tail,
        },
    });
    dm.add("dialog", () => {
        dialog?.destroy();
    });
    dm.add("svelte", () => {
        unmount(sv);
    });
}
