import { Dock, IEventBusMap, IProtyle } from "siyuan";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { graphAddTopbarIcon, graphBoxCheckbox, graph定位到图中的节点Menu, graph打开块关系图Menu, graph标记此块Menu } from "./libs/stores";
import { siyuan, getDoOperations, sleep } from "./libs/utils";
import { events, EventType } from "./libs/Events";
import GraphBoxSvelte from "./GraphBox.svelte";
import { tomatoI18n } from "./tomatoI18n";
import { getDocBlocks } from "./libs/docUtils";
import { unfoldBlocks, nearestGraphAncestor, shortenParagraphLink } from "./libs/graphUnfold";
import { winHotkey } from "./libs/winHotkey";
import { gatedAddCommand } from "./libs/cmdGate";
import { addIfVisible } from "./libs/menuManager";
import { newID } from "stonev5-utils";
import { mount, unmount } from "svelte";
import { debugLog } from "./libs/logUtils";
import { filterCustomRows } from "./libs/graphContent";
import { structureRowsFromOutline, type LightBlockRow } from "./libs/graphStructure";
import { BLOCK_MARK_ATTR } from "./libs/graphMarks";
import { graph_float } from "./libs/stores";
import { graphFloatBox } from "./GraphFloatBox";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

const DOCK_TYPE = "dock_GraphBox"

// graphbox 期1 打点：graphbox 族统一 app="graphbox" stream label（logcli 查 {job="tomato-plugin",app="graphbox"}）
function gbLog(tag: string, msg: string) {
    debugLog(tag, msg, "graphbox");
}

/** dock 头栏与悬浮图面板头栏共用的控件组 HTML（graphfloat □3）：四档直切组+形态循环钮。
 *  两 ID 由调用方各自生成（每实例独立——GraphBox.svelte 按钮绑定按 ID 找 DOM，
 *  dock 实例与浮窗实例同文档共存互不串台） */
export function graphToolbarHTML(viewModeGroupID: string, landscapeSwitchBtnID: string): string {
    return `<span id="${viewModeGroupID}" class="tomato-graph-viewmodes" role="group" aria-label="${tomatoI18n.视图档位}">
                                <span id="${viewModeGroupID}-structure" role="button" tabindex="0" data-graph-mode="structure"
                                      class="block__icon block__icon--show b3-tooltips b3-tooltips__sw" aria-label="${tomatoI18n.结构视图}">
                                    <svg><use xlink:href="#iconPreview"></use></svg>
                                </span>
                                <span id="${viewModeGroupID}-marks" role="button" tabindex="0" data-graph-mode="marks"
                                      class="block__icon block__icon--show b3-tooltips b3-tooltips__sw" aria-label="${tomatoI18n.只看标记}">
                                    <svg><use xlink:href="#iconMark"></use></svg>
                                </span>
                                <span id="${viewModeGroupID}-treemap" role="button" tabindex="0" data-graph-mode="treemap"
                                      class="block__icon block__icon--show b3-tooltips b3-tooltips__sw" aria-label="${tomatoI18n.方块总览}">
                                    <svg><use xlink:href="#iconLayoutGrid"></use></svg>
                                </span>
                                <span class="tomato-graph-viewmodes__sep" aria-hidden="true"></span>
                                <span id="${viewModeGroupID}-full" role="button" tabindex="0" data-graph-mode="full"
                                      class="block__icon block__icon--show b3-tooltips b3-tooltips__sw" aria-label="${tomatoI18n.显示全部块}">
                                    <svg><use xlink:href="#iconListTree"></use></svg>
                                </span>
                            </span>
                            <span id="${landscapeSwitchBtnID}" role="button" tabindex="0"
                                  class="block__icon block__icon--show b3-tooltips b3-tooltips__sw" aria-label="${tomatoI18n.切换布局形态.replace("%1", tomatoI18n.形态横排向右)}">
                                <svg><use id="${landscapeSwitchBtnID}-icon" xlink:href="#iconGraphLayoutLR"></use></svg>
                            </span>`;
}

// 大文档「完整加载」后进入全量态：3s 轮询与 ws 自动刷新均降级手动（handoff □1 档 3）。
// 会话级 Set 不持久化——插件重载后重新预检回骨架态，用户再次「完整加载」才进全量态。
export const graphFullLoadedBigDocs = new Set<string>();

export const GraphBox定位到图中的节点 = winHotkey("⌘⌥E", "graphLocateNode", "", () => tomatoI18n.定位到图中的节点)
export const GraphBox打开块关系图 = winHotkey("⇧⌥E", "graphLocateNode open", "iconGraphBox", () => tomatoI18n.打开块关系图)
// graphmark 期2：块级标记 toggle。定键 09-19 实弹复核（物理等价扫=修饰键集合+主键，
// 大小写/符号序无关——handoff 原扫被渐进小写 ⇧⌥m 与官方 ⇧⌘M 序两盲区骗过）：
// M 族二修饰全占（⌥⇧M=渐进分片模式/⌘⇧M=官方跳到父块/⌥M=toggleWin/⌥⌘M=memo/⌘M=
// inline-math），唯 ⌘⌥⇧M 三修饰实测空闲（win+浏览器版保留族均无冲突）——默认落此档，
// 键位终选呈 bear 挑（备选 ⌥⇧S 等见队列记录）。图上合并进 DocMarks（第三宽锚）；
// 正文反馈=左边条
export const GraphBox标记此块 = winHotkey("⌘⌥⇧M", "graphBlockMark", "iconMark", () => tomatoI18n.标记此块)
// graphmark 期4：图上聚焦光标块——一跳邻域高亮+其余淡化，点空白/再按恢复全景。
// 定键 09-19 实弹复核（物理等价扫=修饰键集合+主键）：F 族字母键全仓零占用，官方
// 默认占 ⌘F/⇧⌘F（Chrome 全屏保留族）/⌥F/⌥⌘F，唯 ⌘⌥⇧F 三修饰空闲——与打标
// ⌘⌥⇧M 同族（M=Mark / F=Focus），键位终选呈 bear 挑
export const GraphBox聚焦此块 = winHotkey("⌘⌥⇧F", "graphBlockFocus", "iconFocus", () => tomatoI18n.聚焦光标块)

class GraphBox {
    plugin: BaseTomatoPlugin;
    private dock: Dock;
    // 智能刷新相关
    private lastRefreshedUpdated: string = ""; // 上次刷新时的文档 updated 时间戳
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private pollTimer: ReturnType<typeof setInterval> | null = null; // 3秒轮询定时器
    /** □4 时序统一：index.async onload 已 await taskCfg（框架保序），双路竞态消化退役 */
    onload(plugin: BaseTomatoPlugin) {
        if (!graphBoxCheckbox.get()) return;

        this.plugin = plugin;
        if (!events.isMobile) {
            this.addDock(); // 添加后有 bug，手机端在文档数更新后，无法显示 topbar icons.
        }

        gatedAddCommand(this.plugin, GraphBox定位到图中的节点.langKey, {
            langText: GraphBox定位到图中的节点.langText(),
            hotkey: GraphBox定位到图中的节点.m,
            callback: this.locateNode.bind(this),
        });
        gatedAddCommand(this.plugin, GraphBox打开块关系图.langKey, {
            langText: GraphBox打开块关系图.langText(),
            hotkey: GraphBox打开块关系图.m,
            callback: () => this.openGraphDock(),
        });
        gatedAddCommand(this.plugin, GraphBox标记此块.langKey, {
            langText: GraphBox标记此块.langText(),
            hotkey: GraphBox标记此块.m,
            callback: () => this.toggleBlockMark(events.currentProtyle()),
        });
        gatedAddCommand(this.plugin, GraphBox聚焦此块.langKey, {
            langText: GraphBox聚焦此块.langText(),
            hotkey: GraphBox聚焦此块.m,
            callback: () => this.focusBlock(events.currentProtyle()),
        });
        if (!events.isMobile) {
            if (graphAddTopbarIcon.get()) {
                plugin.addTopBar({
                    icon: "iconGraphBox",
                    title: GraphBox打开块关系图.langText() + " " + GraphBox打开块关系图.w(),
                    position: "left",
                    callback: () => this.openGraphDock(),
                });
            }
        }
        events.addListener("tomato-graph-box-2024-07-01 17:16:01", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.switch_protyle
            ) {
                // 切换文档：直接刷新图（内容完全不同，无需时间戳比对）。
                // □2 闪烁治理：不再重置 lastRefreshedUpdated——重置会让下个 3s 轮询
                // 时间戳比对必不等→第二次重建（「打开所在文档」闪两下的第二闪）；
                // 同文档重复事件由 svelte 侧指纹短路挡住，切文档后轮询即便白跑一次
                // 也被短路（视觉零伤害）
                const newDocID = detail?.protyle?.block?.rootID;
                if (newDocID) {
                    this.getData()?.changeDoc(detail?.protyle);
                }
            }
        });
        // 3秒轮询检查文档更新（走防抖）
        this.pollTimer = setInterval(() => {
            this.scheduleRefresh();
        }, 3000);
        // 自动刷新：WebSocket 事件走防抖
        events.addWsListener("tomato-graph-auto-refresh-2025", (wsData: WsMain) => {
            const ops = getDoOperations(wsData);
            if (ops.length === 0) return;
            const currentDocID = events.docID;
            if (!currentDocID) return;

            const related = ops.some(op =>
                op.id === currentDocID ||
                op.parentID === currentDocID
            );
            if (!related) return;

            this.scheduleRefresh();
        });
        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            this.locateNodeMenu(detail as any);
        });
        // graphfloat □3：悬浮图（球+浮窗独立第二实例，dock 保留不动）——设置默认开、
        // 桌面端闸（图移动端本就不可用：addDock 仅桌面+菜单项 !isMobile）；graph_float
        // 为结构性键（onload 读死，改设置保存→插件级重载生效，back_link_float 同语义）
        if (!events.isMobile && graph_float.get()) {
            void graphFloatBox.onload(this.plugin);
        }
    }

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!graphBoxCheckbox.get()) return;
        this.locateNodeMenu(detail as any);
    }

    // 统一防抖入口：所有刷新请求都走这里
    private scheduleRefresh() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.debounceTimer = null;
            const currentDocID = events.docID;
            if (currentDocID) {
                this.checkAndRefresh(currentDocID);
            }
        }, 300); // 300ms 防抖
    }

    // 检查文档 updated 时间戳，决定是否需要刷新
    private async checkAndRefresh(docID: string) {
        try {
            if (graphFullLoadedBigDocs.has(docID)) return; // 巨书全量态：自动刷新降级手动（Panel 刷新按钮）
            // 期4 P1：定位脉冲窗口内不刷新（expandTo 写属性→ws 回流的 changeDoc 会重建节点
            // DOM 打断脉冲+fitView 打回 setCenter）；窗口后 updated 若仍≠last 会正常补刷
            const d = this.getData() as any;
            if (d?.suppressAutoRefreshUntil && Date.now() < d.suppressAutoRefreshUntil) return;
            // 查询文档当前的 updated 时间戳
            const row = await siyuan.sqlOne(`SELECT updated FROM blocks WHERE id = "${docID}" AND type = "d"`);
            const currentUpdated = row?.updated;

            // 如果时间戳没有变化，跳过刷新
            if (currentUpdated && currentUpdated === this.lastRefreshedUpdated) {
                return;
            }

            // 时间戳有变化，执行刷新；refreshOnly=同文档内容刷新不 fitView（保用户/定位视图）
            this.lastRefreshedUpdated = currentUpdated || "";
            this.getData()?.changeDoc(events.protyle?.protyle, true);
        } catch (e) {
            console.warn("[GraphBox] checkAndRefresh error:", e);
        }
    }

    // 清理定时器
    destroy() {
        graphFloatBox.unload(); // graphfloat □3：悬浮图收尾（球/面板/图组件 unmount）
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    }

    // 期4：页签通道退役统一 dock——幂等激活左下 dock 并拉取当前编辑器文档
    // （首次开启 dock init 异步挂 svelte，轮询等就绪；图空/非当前文档时主动 changeDoc）
    openGraphDock() {
        this.ensureDockVisible();
        (async () => {
            for (let i = 0; i < 40 && !this.getData()?.svelte; i++) await sleep(50);
            const data = this.getData();
            const curDoc = events.docID;
            if (data?.svelte && curDoc && data.getGraphState?.().docID !== curDoc) {
                const { docName } = await events.selectedDivs(events.protyle?.protyle);
                await data.changeDoc(this.protyleForChangeDoc(undefined, curDoc, docName));
            }
        })();
    }

    locateNodeMenu(detail: TomatoMenu) {
        const menu = detail.menu;
        if (!events.isMobile) {
            // 菜单打开时预取目标块（定位光标化）：菜单项被点击时全局 selection 已被
            // 点菜单动作破坏（focusNode 落到菜单 DOM），实时取光标块必空——只有块
            // 选中态 CSS 类通道幸存，这就是「必须选中块才能定位」的根因。事件触发
            // 此刻光标仍在块内，闭包捕获（划词工具条同款纪律）。
            const preset = events.selectedDivsSync(detail.protyle);
            const presetID = preset.ids?.[0];
            addIfVisible(menu, GraphBox定位到图中的节点.langKey, {
                label: GraphBox定位到图中的节点.langText(),
                icon: "iconGraphBox",
                accelerator: GraphBox定位到图中的节点.m,
                click: () => this.locateNode(detail.protyle, presetID),
            }, graph定位到图中的节点Menu.get());
            addIfVisible(menu, GraphBox打开块关系图.langKey, {
                label: GraphBox打开块关系图.langText(),
                icon: "iconGraphBox",
                accelerator: GraphBox打开块关系图.m,
                click: () => this.openGraphDock(),
            }, graph打开块关系图Menu.get());
            // 期2 块级标记：toggle 打在光标所在块（el 同款闭包预取，供方向读活 DOM）
            addIfVisible(menu, GraphBox标记此块.langKey, {
                label: GraphBox标记此块.langText(),
                icon: "iconMark",
                accelerator: GraphBox标记此块.m,
                click: () => this.toggleBlockMark(detail.protyle, presetID, preset.selected?.[0]),
            }, graph标记此块Menu.get());
        }
    }

    /** 期2 块级标记 toggle：光标所在块写/删 custom-tomato-mark IAL（值 "1"/空串删键）。
     *  方向判定优先读活 DOM 属性（setBlockAttrs 广播 updateAttrs op 跨窗即刷、无
     *  getBlockAttrs 写后立读闪烁窗——连续双 toggle 秒窗内 IAL 读通道可能回旧态致方向
     *  反）；无 DOM（lastBlockID 兜底链）才退 IAL 直读。图数据靠 marks 档 SWR 重进档
     *  感知（updateAttrs op 不中图的 ws 刷新域判定，见 graphMarks 注释） */
    async toggleBlockMark(protyle?: IProtyle, presetID?: string, presetEl?: HTMLElement) {
        const { ids, selected } = await events.selectedDivs(protyle);
        const id = presetID || ids?.[0] || events.lastBlockID;
        const el = presetEl ?? selected?.[0];
        gbLog("graph.blockmark_req", `id=${(id || "").slice(0, 8)}${presetID ? " src=menu-preset" : ""}`);
        if (!id) {
            siyuan.pushMsg(tomatoI18n.定位需先选中块, 3000);
            return;
        }
        try {
            let marked: boolean;
            if (el?.getAttribute) {
                marked = (el.getAttribute(BLOCK_MARK_ATTR) ?? "") !== "";
            } else {
                const attrs = await siyuan.getBlockAttrs(id);
                marked = !!(attrs && attrs[BLOCK_MARK_ATTR]);
            }
            await siyuan.setBlockAttrs(id, { [BLOCK_MARK_ATTR]: marked ? "" : "1" });
            siyuan.pushMsg(marked ? tomatoI18n.已取消标记此块 : tomatoI18n.已标记此块, 3000);
            gbLog("graph.blockmark_done", `${marked ? "off" : "on"} id=${id.slice(0, 8)}`);
            // 期3：标记写不碰 updated（图指纹短路不含标记集），显式通知图组件 SWR 重拉
            // （●N 角标/只看标记过滤集即时跟进；不在 dock/未挂载=静默 no-op）
            (this.getData() as { marksChanged?: () => void })?.marksChanged?.();
        } catch (e) {
            gbLog("graph.blockmark_err", `${e}`);
            siyuan.pushMsg(tomatoI18n.标记此块失败, 3000);
        }
    }

    // 期4 块→图定位完整链路：开 dock→图上非该文档自动切换→expandTo→居中脉冲→
    // 找不到 toast 原因（骨架态/超上限），永不静默（现状病灶=dock 未开/文档不同/折叠/截断全静默）
    // presetID=菜单打开时预取的目标块（光标在块内即可定位）；命令通道无预取走实时取块
    private async locateNode(protyle?: IProtyle, presetID?: string) {
        const { ids, docID, docName } = await events.selectedDivs(protyle);
        const id = presetID || ids?.[0] || events.lastBlockID;
        gbLog("graph.locate_req", `id=${(id || "").slice(0, 8)} doc=${(docID || "").slice(0, 8)}${presetID ? " src=menu-preset" : ""}`);
        if (!id) {
            siyuan.pushMsg(tomatoI18n.定位需先选中块, 3000);
            return;
        }
        this.ensureDockVisible();
        for (let i = 0; i < 60 && !this.getData()?.svelte; i++) await sleep(50); // dock init 异步挂载
        const data = this.getData();
        if (!data?.svelte || !data.changeDoc) {
            siyuan.pushMsg(tomatoI18n.定位dock未就绪, 3000);
            return;
        }
        if (docID && data.getGraphState?.().docID !== docID) {
            await data.changeDoc(this.protyleForChangeDoc(protyle, docID, docName));
        }
        // treemap □3 review P1-3 兜底：方块档 GraphControl 已卸载（locateID 置空）——
        // 明示不支持而非 stale 闭包静默空转；矩形级定位映射=□4「选中态扩工具条」规划
        if (!data.locateID) {
            gbLog("graph.locate_skip", `mode=${data.getGraphState?.().mode}`);
            siyuan.pushMsg(tomatoI18n.方块档暂不支持定位, 3000);
            return;
        }
        const found = await data.locateID(id);
        gbLog("graph.locate_done", `found=${found}`);
        if (!found) {
            // 二期 □2 定位兜底：目标块不在图内（¶ 合并/截断剔除等）→ 沿真实 parent 链
            // 上爬最近的图内祖先重定向定位（永不静默也永不误导——「超上限」只留给真超限）
            const anc = await this.locateGraphAncestor(data, id);
            if (anc && await data.locateID(anc)) {
                siyuan.pushMsg(tomatoI18n.定位已并入所在节点, 3000);
                return;
            }
            const st = data.getGraphState?.();
            if (st?.blockCount && st.maxBlocks && st.blockCount > st.maxBlocks) {
                siyuan.pushMsg(tomatoI18n.定位超上限.replace("%1", `${st.maxBlocks}`), 4000);
            } else {
                siyuan.pushMsg(tomatoI18n.定位未找到, 4000);
            }
        }
    }

    /** graphmark 期4：聚焦光标块（图上一跳邻域高亮+其余淡化，GraphBox.svelte focusNode
     *  通道）。目标并进 ¶ 大节点/不在图内 → SQL 上爬最近图内祖先兜底（locateNode 同款
     *  配对）；同目标再按=退出全景（toggle 在 svelte 侧 setFocusNode） */
    private async focusBlock(protyle?: IProtyle) {
        const { ids, docID, docName } = await events.selectedDivs(protyle);
        const id = ids?.[0] || events.lastBlockID;
        gbLog("graph.focus_req", `id=${(id || "").slice(0, 8)} doc=${(docID || "").slice(0, 8)}`);
        if (!id) {
            siyuan.pushMsg(tomatoI18n.定位需先选中块, 3000);
            return;
        }
        this.ensureDockVisible();
        for (let i = 0; i < 60 && !this.getData()?.svelte; i++) await sleep(50); // dock init 异步挂载
        const data = this.getData();
        if (!data?.svelte || !data.focusNode) {
            siyuan.pushMsg(tomatoI18n.定位dock未就绪, 3000);
            return;
        }
        if (docID && data.getGraphState?.().docID !== docID) {
            await data.changeDoc(this.protyleForChangeDoc(protyle, docID, docName));
        }
        if (data.getGraphState?.().mode === "treemap") {
            siyuan.pushMsg(tomatoI18n.方块档暂不支持聚焦, 3000);
            return;
        }
        if (await data.focusNode(id)) return;
        const anc = await this.locateGraphAncestor(data, id);
        // review P1-1：兜底重定向传 set 模式——上爬目标撞上当前聚焦点（聚焦 A 后光标移到
        // A 的子块再按）=保持聚焦，toggle 语义只属「同一块再按」；此时 toast 是真话
        if (anc && await data.focusNode(anc, "set")) {
            siyuan.pushMsg(tomatoI18n.已聚焦所在节点, 3000);
            return;
        }
        const st = data.getGraphState?.();
        if (st?.blockCount && st.maxBlocks && st.blockCount > st.maxBlocks) {
            siyuan.pushMsg(tomatoI18n.定位超上限.replace("%1", `${st.maxBlocks}`), 4000);
        } else {
            siyuan.pushMsg(tomatoI18n.聚焦未找到, 4000);
        }
    }

    /** 二期 □2：SQL 拉当前文档全量 id→parent_id 映射，沿链上爬最近图内祖先（跨文档块查无父=undefined） */
    private async locateGraphAncestor(data: GraphDockData<GraphBoxSvelte>, id: string): Promise<string | undefined> {
        const st = data.getGraphState?.();
        const graphIDs = data.graphIDsOf?.();
        if (!st?.docID || !graphIDs) return undefined;
        const rows = await siyuan.sql(
            `select id,parent_id from blocks where root_id="${st.docID}" limit 100000`,
        );
        const parentOf = new Map(rows.map(r => [r.id, r.parent_id]));
        return nearestGraphAncestor(id, pid => parentOf.get(pid) ?? undefined, graphIDs);
    }

    // changeDoc 只读 title.editElement.textContent 与 block.rootID 两字段；events 单例侧
    // protyle 的 title 可能未渲染（标题异步/未激活页签）→ docName 空被 _changeDoc_ 静默
    // return（期4 e2e 实锤）。真 protyle 标题空时按同款两字段伪造（docName 走 selectedDivs
    // 的 getDocNameByBlockID 兜底链，永不为空）。
    // graphfloat □3 起 export：悬浮图宿主复用同款伪造（单一事实源）
    protyleForChangeDoc(protyle: IProtyle | undefined, docID: string, docName?: string): IProtyle {
        const p = protyle ?? events.protyle?.protyle;
        if (p?.title?.editElement?.textContent) return p;
        return {
            title: { editElement: { textContent: docName || docID } },
            block: { rootID: docID },
        } as unknown as IProtyle;
    }

    // 幂等确保 dock 面板可见——toggleModel(type, show=true) 对已激活面板是 toggle 收起语义
    // （内核 dock/index.ts show 分支先摘 active），先判激活态；panelVisible=false 的
    // restorePanel 分支可安全重入（仅展开面板区不收起）。
    // type 必须用内核 addDock 的完整键 plugin.name+DOCK_TYPE（DOM data-type/toggleModel/
    // leftDock.data 三处同源；传裸 DOCK_TYPE=querySelector 落空+内核 target null 直接
    // TypeError，2026-09-04 e2e 实锤）
    private ensureDockVisible() {
        const layoutDock = (window.siyuan as any).layout?.leftDock;
        if (!layoutDock) return;
        const fullType = this.plugin.name + DOCK_TYPE;
        const item = document.querySelector(`.dock__item[data-type="${fullType}"]`);
        const active = item?.classList.contains("dock__item--active");
        if (!active || layoutDock.panelVisible === false) {
            layoutDock.toggleModel(fullType, true);
        }
    }

    private getData(model?: Dock): GraphDockData<GraphBoxSvelte> {
        if (!model) model = this.dock;
        return model?.data as any
    }

    private addDock() {
        const landscapeSwitchBtnID = newID();
        // graphmark 期1：档位平铺按钮组（结构/只看标记/方块/全部块四钮直切+当前档高亮，
        // bear 拍板 2026-09-18）——原单钮下拉菜单退役；--show=官方常显修饰符（block__icon
        // 基类 opacity:0 面板悬浮才亮）；「全部块」前细分隔线做主次分组（大文档确认链不撤）
        const viewModeGroupID = newID();
        // siyuan@1.2.5 的 addDock.init 类型漏了 dock 参数（运行时 Custom 构造器仍 this.init(this) 传参），
        // init 是用词法 this 的箭头函数，不能改成 this 参数形式，整体 as any 保住现有语义
        this.plugin.addDock({
            type: DOCK_TYPE,
            config: {
                position: "LeftBottom",
                size: { width: 1000, height: 1000 },
                icon: "iconGraphBox",
                title: tomatoI18n.块关系图,
                hotkey: "⌥⌘Z",
            },
            data: {
                svelte: null,
            },
            resize(this) {
                graphBox.getData(this as any).setCanvasSize()
            },
            update(this) {
                // graphBox.getData(this).setCanvasSize() 这里会在同步时，更新文档树时，自动弹出dock框。
            },
            destroy(this) {
                unmount(graphBox.getData(this as any).svelte);
            },
            init: (dock) => {
                const eleID = newID();
                if (events.isMobile) {
                    dock.element.innerHTML = `<div class="toolbar toolbar--border toolbar--dark">
                        <svg class="toolbar__icon"><use xlink:href="#iconGraphBox"></use></svg>
                            <div class="toolbar__text">${tomatoI18n.块关系图}</div>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                } else {
                    dock.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
                        <div class="block__icons">
                            <div class="block__logo">
                                <svg class="block__logoicon"><use xlink:href="#iconGraphBox"></use></svg>${tomatoI18n.块关系图}
                            </div>
                            <span class="fn__flex-1 fn__space"></span>
                            ${graphToolbarHTML(viewModeGroupID, landscapeSwitchBtnID)}
                            <span data-type="min" class="block__icon block__icon--show b3-tooltips b3-tooltips__sw" aria-label="Min"><svg><use xlink:href="#iconMin"></use></svg></span>
                        </div>
                        <div id="${eleID}" class="fn__flex-1"></div>
                    </div>`;
                }
                this.dock = dock as any;
                try {
                    graphBox.getData(dock as any).svelte = mount(GraphBoxSvelte, {
                        target: dock.element.querySelector("#" + eleID),
                        props: {
                            dock: dock as any,
                            plugin: this.plugin,
                            landscapeSwitchBtnID,
                            viewModeGroupID,
                        }
                    }) as any;
                } catch (e) {
                    console.error(e);
                }
            },
        } as any);
    }
}

export const graphBox = new GraphBox();


export const BASIC_COLORS: readonly string[] = ["black", "silver", "gray", "white", "maroon", "red", "purple", "fuchsia", "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua"];

// "transparent",
export const ALL_COLORS: readonly string[] = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"];

export const SOFT_COLORS: readonly string[] = ["aliceblue", "antiquewhite", "aquamarine", "azure", "beige", "bisque", "blanchedalmond", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "gainsboro", "ghostwhite", "gold", "goldenrod", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "limegreen", "linen", "magenta", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "oldlace", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "rebeccapurple", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "thistle", "tomato", "turquoise", "violet", "wheat", "whitesmoke", "yellowgreen"]

export const BEST_COLORS: readonly string[] = [
    "aliceblue", "antiquewhite", "aquamarine", "azure", "beige", "bisque",
    "blanchedalmond", "blueviolet", "burlywood", "cadetblue", "chocolate",
    "cornflowerblue", "cornsilk", "cyan", "darkblue", "darkcyan", "darkgoldenrod",
    "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkorange",
    "darkorchid", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray",
    "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue",
    "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "gainsboro",
    "ghostwhite", "gold", "grey", "honeydew", "hotpink", "indigo", "ivory",
    "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue",
    "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen",
    "lightgrey", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
    "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "linen",
    "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumslateblue",
    "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose",
    "moccasin", "navajowhite", "oldlace", "orange", "orchid", "palegoldenrod",
    "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru",
    "pink", "plum", "powderblue", "rebeccapurple", "rosybrown", "royalblue",
    "saddlebrown", "sandybrown", "seagreen", "seashell", "skyblue", "slateblue",
    "slategray", "slategrey", "snow", "steelblue", "tan", "thistle", "turquoise",
    "violet", "wheat", "whitesmoke", "yellowgreen"
]

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export class ColorSelector {
    getColorForRootID(rootID: string): string {
        let c = this.colorCache.get(rootID);
        if (c) return c;
        const hash = hashString(rootID);
        const colorIndex = hash % this.colors.length;
        c = this.colors[colorIndex];
        this.colorCache.set(rootID, c);
        return c;
    }
    private colorCache = new Map<string, string>();
    private colors: string[]
    constructor(colors: string[]) {
        this.colors = colors;
    }
}

function refsSqlFor(docID: string) {
    // limit 必须显式给：思源 SQL API 对不带 limit 的查询默认截 64 行（AGENTS「SQL 截尾」坑，
    // 2026-09-04 dev 实测 100 条引用边只回 64——全量管线历史行为一并修掉）
    return `
        select root_id,def_block_parent_id,content,def_block_root_id,def_block_id,block_id from refs
        where root_id="${docID}"
        or def_block_parent_id="${docID}"
        or def_block_root_id="${docID}"
        or def_block_id="${docID}"
        or block_id="${docID}"
        limit 100000
    `;
}

export async function getData(docID: string, docName: string, maxPBlocks: number, blockLimit: number) {
    const tRefs = performance.now();
    const taskRefs = siyuan.sqlRef(refsSqlFor(docID));
    taskRefs.then(rs => gbLog("graph.sql_ref", `refs=${rs.length} ${Math.round(performance.now() - tRefs)}ms`));
    let refs: Ref[];
    const tDom = performance.now();
    const domP = getDocBlocks(docID, docName, true, false);
    domP.then(() => gbLog("graph.get_block_dom", `${Math.round(performance.now() - tDom)}ms`));
    const rows = await domP
        .then(({ root }) => unfoldBlocks(root))
        .then(rows => shortenParagraphLink(rows, maxPBlocks))
        .then(rows => rows.filter(r => r.data !== 'del'))
        .then(rows => rows.slice(0, blockLimit))
        .then(async rows => {
            const rowIDs = new Set(rows.map(r => r.id));
            // let order = 0;
            const orderedRefs = rows
                .reduce((l, n) => {
                    let content = "";
                    // if (!n.isInList) {
                    // content = (order++).toString();
                    // }
                    l.push({ block_id: n.parent_id, def_block_id: n.id, content })
                    return l;
                }, [] as Ref[]);
            refs = await taskRefs;
            const ids = refs
                .map((r) => {
                    r.isRef = true;
                    return [
                        r.root_id,
                        r.def_block_parent_id,
                        r.def_block_root_id,
                        r.def_block_id,
                        r.block_id,
                    ];
                })
                .flat()
                .filter(i => !rowIDs.has(i));
            refs.splice(0, 0, ...orderedRefs)
            rows.push(... await siyuan.getRows([...new Set(ids)], "content,type,subtype,root_id,parent_id", false));
            return rows;
        })
        .then(rows => rows.filter(r => {
            // 三期 B'：i 恒保留（树内=吸收后的分叉节点；跨文档补块=SQL content 直填），
            // 仅无内容孤儿 i 防御性丢弃；l 壳已被 shortenList 剔除，此处只拦跨文档补块的空壳 l
            if (r.type === 'l') return (r.children?.length ?? 0) > 0;
            if (r.type === 'i') return (r.children?.length ?? 0) > 0 || !!r.content;
            return true;
        }));

    // □1 custom 块过滤（bear 拍板）：本档 DOM 通道（NodeCustomBlock→'custom' 空卡）
    // 与引用端点 SQL 补块（content=纯 JSON 乱码）在此统一剔除，端点连坐边丢弃
    const filtered = filterCustomRows(rows, refs);
    refs = filtered.links;

    const docNameCache = new Map<string, string>();
    for (const row of filtered.rows) {
        if (row.root_id != docID) {
            const otherID = row.root_id;
            let otherName = docNameCache.get(otherID);
            if (!otherName) {
                otherName = (await siyuan.getRowByID(otherID))?.content;
                docNameCache.set(otherID, otherName);
            }
            row.docName = otherName;
        }
    }
    gbLog("graph.tree_build", `rows=${filtered.rows.length} links=${refs.length}`);
    return { rows: filtered.rows, links: refs };
}

// graphbox 期1 预检：count+length 毫秒级（AGENTS 性能锚点：巨书 getBlockDOM 25~39s/24MB 绝不无脑全量）。
// 失败返回 null，调用方按 full 容错（= 现状行为）。索引延迟（刚建文档回旧行）可容忍——骨架只是预览。
export async function precheckDocSize(docID: string): Promise<{ cnt: number; totalLen: number } | null> {
    try {
        const t0 = performance.now();
        const row: any = await siyuan.sqlOne(`select count(*) as cnt, sum(length) as totalLen from blocks where root_id="${docID}"`);
        const stat = { cnt: row?.cnt ?? 0, totalLen: row?.totalLen ?? 0 };
        gbLog("graph.precheck", `doc=${docID.slice(0, 8)} blocks=${stat.cnt} len=${stat.totalLen} ${Math.round(performance.now() - t0)}ms`);
        return stat;
    } catch (e) {
        gbLog("graph.precheck_err", `${e}`);
        return null;
    }
}

// graphbox □2 结构通道（大文档数据源，2026-09-17；treemap 战役 □2 改 outline 真值骨架）：
// SQL 全块轻字段 + getDocOutline 标题树 → 纯标题骨架+徽标聚合（前驱标题锚归属）+ 引用边
// （叶子端点重定向到标题）。产物与全量 getData 同构 {rows, links} 外加 info（StructureInfo），
// 渲染层零分叉。骨架跟左栏大纲面板永远一致（方案 A，bear 拍板）。
export async function getGraphStructure(docID: string, docName: string) {
    const t0 = performance.now();
    // □3 文档序锚=getChildBlocks 平铺序（id 批量随机+hpath 不回填都非真序；标题恒顶层）
    const orderP = siyuan.getChildBlocks(docID)
        .then(kids => new Map(kids.map((k, i) => [k.id as string, i])))
        .catch(() => new Map<string, number>());
    const [light, outline, order] = await Promise.all([
        // limit 显式给：思源 SQL API 无 limit 默认截 64 行（2026-09-04 dev 实测）
        siyuan.sql(`select id,type,subtype,parent_id,length from blocks where root_id="${docID}" order by id limit 100000`),
        siyuan.getDocOutline(docID).catch(() => [] as GetDocOutline[]),
        orderP,
    ]) as [LightBlockRow[], GetDocOutline[], Map<string, number>];
    gbLog("graph.structure_sql", `light=${light?.length ?? 0} outline=${outline?.length ?? 0} ${Math.round(performance.now() - t0)}ms`);
    const { rows, links, info } = structureRowsFromOutline(outline ?? [], light ?? [], docID, docName, order);
    const rowIDs = new Set(rows.map(r => r.id));
    const refs = await siyuan.sqlRef(refsSqlFor(docID));
    const ids = refs
        .map((r) => {
            r.isRef = true;
            return [r.root_id, r.def_block_parent_id, r.def_block_root_id, r.def_block_id, r.block_id];
        })
        .flat()
        .filter(i => i && !rowIDs.has(i));
    rows.push(...await siyuan.getRows([...new Set(ids)], "content,type,subtype,root_id,parent_id", false));
    // □1 custom 块过滤（端点补块 content=纯 JSON 乱码）+ □2 引用边叶子端点重定向到容器
    const filtered = filterCustomRows(rows, [...links, ...refs]);
    const docNameCache = new Map<string, string>();
    for (const row of filtered.rows) {
        if (row.root_id != docID) {
            const otherID = row.root_id;
            let otherName = docNameCache.get(otherID);
            if (!otherName) {
                otherName = (await siyuan.getRowByID(otherID))?.content;
                docNameCache.set(otherID, otherName);
            }
            row.docName = otherName;
        }
    }
    gbLog("graph.structure_build", `rows=${filtered.rows.length} leaves=${info.containerOfLeaf.size} ${Math.round(performance.now() - t0)}ms`);
    return { rows: filtered.rows, links: filtered.links, info };
}