// 知识库面板 Box（knowledgebox 原型期，2026-09-14）：
// dock 面板（KnowledgePanel 双区=同步管理+问答）+ 命令 + 文档树右键「同步到知识库」
// + 间歇自动同步。通道=libs/knowledgeChannel（□3 智谱首发；hash 增量闸在 knowledgeSync）。
// 清理纪律：autoTimer 挂本模块 onunload 导出，index.ts onunload 清单调用（导出助手
// timer 泄漏教训在案——禁用后 interval 继续跑）。
import { DestroyManager } from "./libs/destroyer";
import { events } from "./libs/Events";
import { getTomatoPluginInstance, siyuan } from "./libs/utils";
import { winHotkey } from "./libs/winHotkey";
import { gatedAddCommand } from "./libs/cmdGate";
import { addIfVisible } from "./libs/menuManager";
import { tomatoI18n } from "./tomatoI18n";
import KnowledgePanel from "./KnowledgePanel.svelte";
import { newID } from "stonev5-utils";
import { adaptHotkey } from "siyuan";
import { knowledgeBoxCheckbox, knowledgeAutoSyncMin, knowledgeMenu } from "./libs/stores";
import { mount, unmount } from "svelte";
import { addToSync, inSync, removeFromSync, syncAll, excludeDocs, unexcludeDocs, loadKS, getKSSnapshot, isSyncBusy } from "./libs/knowledgeSync";
import { startKbTreeMark, stopKbTreeMark, kbTreeMarkRefresh, pathAncestorIDs } from "./KnowledgeTreeMark";
import { createFrontendToolEnv } from "./agentToolBridge";
import { createDefaultChannel } from "./libs/knowledgeChannel";
import { debugLog } from "./libs/logUtils";

export const KnowledgeBox知识库面板 = winHotkey("alt+F10", "知识库面板", "iconDatabase", () => tomatoI18n.知识库同步, false, knowledgeMenu)

let dm: DestroyManager;
let autoTimer: ReturnType<typeof setInterval> | null = null;
let lastAutoSync = 0;
const DOCK_TYPE = "dock_KnowledgeBox";

export function initKnowledgeBox() {
    const plugin = getTomatoPluginInstance();
    if (knowledgeBoxCheckbox.get() && !events.isMobile) {
        syncDockMemory(plugin.name);
        addDock();
        gatedAddCommand(plugin, KnowledgeBox知识库面板.langKey, {
            langText: KnowledgeBox知识库面板.langText(),
            hotkey: KnowledgeBox知识库面板.m,
            callback: () => { toggleDock(); },
        });
        // 文档树「在库内」标记（□8）：快照预热后首扫（loadKS 是快照唯一刷新点）
        loadKS().then(() => kbTreeMarkRefresh());
        startKbTreeMark();
        // 思源右键菜单同步构建：监听回调必须同步 addItem（await 之后菜已渲染完，项进不去）——
        // 加入/移出/排除的名单判断挪进 click（幂等：重复加入跳过、移出不存在的 id 无害）；
        // 排除/取消排除两项的显隐用内存快照同步判定（冷启动毫秒窗内快照空=项缺席，预热后恢复）
        events.addListener_open_menu_doctree("2026-9-14 15:30:00知识库同步", (detail) => {
            // type 门禁（review P1-3）：只收文档右键（doc=单文档/docs=多选；notebook/notebooks/items
            // 混入 notebook id 会被 addToSync 收编成「整本外发」条目——CardBox 同款先例）
            if (detail.type !== "doc" && detail.type !== "docs") return;
            const els = [...detail.elements] as HTMLElement[];
            const ids = els.map(e => e.getAttribute("data-node-id")).filter(i => !!i) as string[];
            if (ids.length === 0) return;
            // 祖先链判定（□8）：data-path 各段即完整祖先 id 链（子文档物理目录=父文档 id）
            const ancs = els.map(e => pathAncestorIDs(e.getAttribute("data-path") ?? ""));
            const snap = getKSSnapshot();
            const listIDs = new Set(snap.list.map(i => i.docID));
            const exclSet = new Set(snap.excluded ?? []);
            const inScope = (anc: string[]) => anc.some(id => listIDs.has(id));
            const isExcl = (anc: string[]) => anc.some(id => exclSet.has(id));
            const selfID = (anc: string[]) => anc[anc.length - 1] ?? "";
            // 写口忙闸（review P0-1）：syncAll/checkChanges 持旧 data 期间写盘会被整体覆盖回滚
            // （排除标记被抹→下轮自动同步把排除内容重新外发）——忙时提示稍后
            const busyGate = () => {
                if (isSyncBusy()) { siyuan.pushMsg(tomatoI18n.请稍后); return true; }
                return false;
            };
            addIfVisible(detail.menu, "m.knowledge.add", {
                label: tomatoI18n.同步到知识库,
                icon: "iconDatabase",
                click: async () => {
                    if (busyGate()) return;
                    // click 时现取快照（review P2-2：菜单构建到点击之间数据可能已被其他窗口变更）
                    const live = getKSSnapshot();
                    const liveList = new Set(live.list.map(i => i.docID));
                    const coveredAnc = (anc: string[]) => anc.some(id => liveList.has(id));
                    const fresh: string[] = [];
                    const covered: string[] = [];
                    for (let k = 0; k < ids.length; k++) {
                        if (coveredAnc(ancs[k])) { covered.push(ids[k]); continue; }  // 已在某条目子树内（含自身是条目）→ 拦截防重复入库
                        if (!(await inSync(ids[k]))) {
                            await addToSync(ids[k]);
                            fresh.push(ids[k]);
                        }
                    }
                    kbTreeMarkRefresh();
                    siyuan.pushMsg(fresh.length ? `${tomatoI18n.已加入}（${fresh.length}）`
                        : covered.length ? `${tomatoI18n.已在同步范围内}（${covered.length}）` : tomatoI18n.已在同步白名单);
                },
            }, KnowledgeBox知识库面板.menu());
            addIfVisible(detail.menu, "m.knowledge.remove", {
                label: tomatoI18n.移出知识库同步,
                icon: "iconTrashcan",
                click: async () => {
                    if (busyGate()) return;
                    await removeFromSync(ids);
                    kbTreeMarkRefresh();
                    siyuan.pushMsg(tomatoI18n.已移出);
                },
            }, KnowledgeBox知识库面板.menu());
            // 排除（□8）：子树内且未被排除的行才显示；排除=该文档及全部子文档不入库
            addIfVisible(detail.menu, "m.knowledge.exclude", {
                label: tomatoI18n.从知识库排除,
                icon: "iconEyeoff",
                click: async () => {
                    if (busyGate()) return;
                    const live = getKSSnapshot();
                    const liveExcl = new Set(live.excluded ?? []);
                    const hits = ids.filter((_, k) => inScope(ancs[k]) && !ancs[k].some(id => liveExcl.has(id)));
                    if (!hits.length) return;
                    await excludeDocs(hits);
                    kbTreeMarkRefresh();
                    siyuan.pushMsg(`${tomatoI18n.已排除}（${hits.length}）`);
                },
            }, KnowledgeBox知识库面板.menu() && ancs.some(anc => inScope(anc) && !isExcl(anc)));
            // 取消排除：只在排除节点自身行显示（子孙行要取消得找到排除的那个节点）
            addIfVisible(detail.menu, "m.knowledge.unexclude", {
                label: tomatoI18n.取消排除,
                icon: "iconUndo",
                click: async () => {
                    if (busyGate()) return;
                    const liveExcl = new Set(getKSSnapshot().excluded ?? []);
                    const hits = ids.filter((_, k) => liveExcl.has(selfID(ancs[k])));
                    if (!hits.length) return;
                    await unexcludeDocs(hits);
                    kbTreeMarkRefresh();
                    siyuan.pushMsg(tomatoI18n.已取消排除);
                },
            }, KnowledgeBox知识库面板.menu() && ancs.some(anc => exclSet.has(selfID(anc))));
        });
        startAutoTimer();
    } else {
        dm?.destroyBy();
        stopAutoTimer();
        stopKbTreeMark();
    }
}

// dock 记忆校正：内核加载时用 local-plugin-docks 记忆整包覆盖插件传入的 config
// （loader.ts addPluginDock），icon/title 改名后老用户的 dock 图标/标题会被旧记忆
// 钉住——addDock 前就地把记忆的展示字段校正为当前值（icon/title 是插件资产，任何
// 非当前值都归一；position/index/size/show 是用户布局资产不动，hotkey 走 keymap
// 通道自愈不碰），并经 setLocalStorageVal 主动落盘（app=自身排除广播回声）——
// 换名迁移配方见 docs/agents/debugging/kernel/ui.md「dock 图标名持久化」。
function syncDockMemory(pluginName: string) {
    const all = (window.siyuan as any).storage?.["local-plugin-docks"];
    const mem = all?.[pluginName]?.[pluginName + DOCK_TYPE];
    if (!mem) return;
    const title = KnowledgeBox知识库面板.langText();
    if (mem.icon === KnowledgeBox知识库面板.icon && mem.title === title) return;
    mem.icon = KnowledgeBox知识库面板.icon;
    mem.title = title;
    siyuan.call("/api/storage/setLocalStorageVal", {
        key: "local-plugin-docks", val: all, app: (window.siyuan as any).appId,
    });
}

function startAutoTimer() {
    stopAutoTimer();
    // 60s 心跳比对「距上次全量同步 ≥ N 分钟」：间隔设置变更 60s 内自然生效，勿重建 timer
    autoTimer = setInterval(async () => {
        const min = parseInt(knowledgeAutoSyncMin.get());
        if (!Number.isFinite(min) || min <= 0) return;
        if (Date.now() - lastAutoSync < min * 60_000) return;
        lastAutoSync = Date.now();
        try {
            const r = await syncAll(createFrontendToolEnv(getTomatoPluginInstance() as any), createDefaultChannel());
            debugLog("knowledge", `auto sync: ${r.ok} ok / ${r.fail} fail / ${r.skip} skip`, "knowledgebox");
            kbTreeMarkRefresh();
        } catch (e: any) {
            debugLog("knowledge", `auto sync error: ${e?.message ?? e}`, "knowledgebox");
        }
    }, 60_000);
}

function stopAutoTimer() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
}

export function knowledgeBoxOnunload() {
    stopAutoTimer();
    dm?.destroyBy();
    stopKbTreeMark();
    // doctree 监听常驻 Events Map 同名覆盖（仓内惯例：重载安全，随插件实例销亡）
}

function toggleDock() {
    // dock 已开时命令=聚焦（内核无公开 toggle API，原型先走 open——重复调用内核自去重）
    (getTomatoPluginInstance() as any).openDock?.(DOCK_TYPE) ?? dm;
}

function addDock() {
    dm?.destroyBy()
    dm = new DestroyManager();
    let svelte: any
    const title = KnowledgeBox知识库面板.langText()
    const dock = getTomatoPluginInstance().addDock({
        type: DOCK_TYPE,
        config: {
            index: 5,
            position: "RightBottom",
            size: { width: 0, height: 300 },
            icon: KnowledgeBox知识库面板.icon,
            title,
            hotkey: KnowledgeBox知识库面板.m,
        },
        data: {
        },
        resize() {
        },
        update() {
        },
        destroy() {
            dm?.destroyBy()
        },
        init: (dock: any) => {
            const eleID = newID();
            dock.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
                    <div class="block__icons">
                        <div class="block__logo">
                            <svg class="block__logoicon"><use xlink:href="#${KnowledgeBox知识库面板.icon}"></use></svg>${title}
                        </div>
                        <span class="fn__flex-1 fn__space"></span>
                        <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}"><svg><use xlink:href="#iconMin"></use></svg></span>
                    </div>
                    <div id="${eleID}" class="fn__flex-1 fn__flex-column" style="min-height:0"></div>
                </div>`;
            svelte = mount(KnowledgePanel, {
                target: dock.element.querySelector("#" + eleID),
            });
        },
    } as any);
    dm.add("dock", () => dock);
    dm.add("svelte", () => { if (svelte) unmount(svelte); })
}
