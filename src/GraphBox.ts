import { Dock, IEventBusMap, IProtyle } from "siyuan";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { graphAddTopbarIcon, graphBoxCheckbox, graph定位到图中的节点Menu, graph打开块关系图Menu } from "./libs/stores";
import { siyuan, getDoOperations, sleep } from "./libs/utils";
import { events, EventType } from "./libs/Events";
import GraphBoxSvelte from "./GraphBox.svelte";
import { tomatoI18n } from "./tomatoI18n";
import { getDocBlocks } from "./libs/docUtils";
import { unfoldBlocks, nearestGraphAncestor } from "./libs/graphUnfold";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
import { newID } from "stonev5-utils";
import { mount } from "svelte";
import { debugLog } from "./libs/logUtils";
import { skeletonTreeFromHeadings, type HeadingRow } from "./libs/graphSkeleton";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

const DOCK_TYPE = "dock_GraphBox"

// graphbox 期1 打点：graphbox 族统一 app="graphbox" stream label（logcli 查 {job="tomato-plugin",app="graphbox"}）
function gbLog(tag: string, msg: string) {
    debugLog(tag, msg, "graphbox");
}

// 大文档「完整加载」后进入全量态：3s 轮询与 ws 自动刷新均降级手动（handoff □1 档 3）。
// 会话级 Set 不持久化——插件重载后重新预检回骨架态，用户再次「完整加载」才进全量态。
export const graphFullLoadedBigDocs = new Set<string>();

export const GraphBox定位到图中的节点 = winHotkey("⌘⌥E", "graphLocateNode", "", () => tomatoI18n.定位到图中的节点)
export const GraphBox打开块关系图 = winHotkey("⇧⌥E", "graphLocateNode open", "iconGraphBox", () => tomatoI18n.打开块关系图)

class GraphBox {
    plugin: BaseTomatoPlugin;
    private dock: Dock;
    // 智能刷新相关
    private lastRefreshedUpdated: string = ""; // 上次刷新时的文档 updated 时间戳
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private pollTimer: ReturnType<typeof setInterval> | null = null; // 3秒轮询定时器
    onload(plugin: BaseTomatoPlugin) {
        if (plugin.initCfg()) {
            this._onload(plugin)
        } else {
            (async () => {
                await plugin.taskCfg;
                this._onload(plugin);
            })();
        }
    }
    _onload(plugin: BaseTomatoPlugin) {
        if (!graphBoxCheckbox.get()) return;

        this.plugin = plugin;
        if (!events.isMobile) {
            this.addDock(); // 添加后有 bug，手机端在文档数更新后，无法显示 topbar icons.
        }

        this.plugin.addCommand({
            langText: GraphBox定位到图中的节点.langText(),
            langKey: GraphBox定位到图中的节点.langKey,
            hotkey: GraphBox定位到图中的节点.m,
            callback: this.locateNode.bind(this),
        });
        this.plugin.addCommand({
            langText: GraphBox打开块关系图.langText(),
            langKey: GraphBox打开块关系图.langKey,
            hotkey: GraphBox打开块关系图.m,
            callback: () => this.openGraphDock(),
        });
        if (!events.isMobile) {
            if (graphAddTopbarIcon.get()) {
                plugin.addTopBar({
                    icon: "iconGraphBox",
                    title: tomatoI18n.打开块关系图,
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
            const presetID = events.selectedDivsSync(detail.protyle).ids?.[0];
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
            if (st?.mode === "skeleton") {
                siyuan.pushMsg(tomatoI18n.定位骨架未含此块, 4000);
            } else if (st?.blockCount && st.maxBlocks && st.blockCount > st.maxBlocks) {
                siyuan.pushMsg(tomatoI18n.定位超上限.replace("%1", `${st.maxBlocks}`), 4000);
            } else {
                siyuan.pushMsg(tomatoI18n.定位未找到, 4000);
            }
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
    // 的 getDocNameByBlockID 兜底链，永不为空）
    private protyleForChangeDoc(protyle: IProtyle | undefined, docID: string, docName?: string): IProtyle {
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
                graphBox.getData(this as any).svelte.destroy();
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
                            <span id="${landscapeSwitchBtnID}" role="button" tabindex="0"
                                  class="block__icon b3-tooltips b3-tooltips__sw" aria-label="${tomatoI18n.切换布局形态.replace("%1", tomatoI18n.形态横排向右)}">
                                <svg><use id="${landscapeSwitchBtnID}-icon" xlink:href="#iconGraphLayoutLR"></use></svg>
                            </span>
                            <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min"><svg><use xlink:href="#iconMin"></use></svg></span>
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

function shortenParagraphLink(rows: Block[], maxPBlocks: number) {
    if (maxPBlocks >= 2) {
        const ps: Block[] = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.type === 'p') {
                ps.push(row)
            }
            if (row.type !== 'p' || i === rows.length - 1) {
                const rest = ps.length - maxPBlocks;
                if (rest > 0) {
                    const startIdx = ps.length / 2 - rest / 2
                    ps.slice(startIdx, startIdx + rest).forEach((r, idx) => {
                        if (idx > 0) r.data = 'del'
                        else r.content = "···"
                    });
                    ps.forEach((r, idx, arr) => {
                        const pre = arr[idx - 1];
                        if (pre?.data === 'del') r.parent_id = pre.parent_id;
                    });
                }
                ps.splice(0, ps.length);
            }
        }
    }
    return rows;
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

    const docNameCache = new Map<string, string>();
    for (const row of rows) {
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
    gbLog("graph.tree_build", `rows=${rows.length} links=${refs.length}`);
    return { rows, links: refs };
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

// graphbox 期1 骨架轻通道：SQL 标题行拼章节树 + 引用边照画（refs SQL 独立便宜）+ 跨文档端点补节点。
// 产物与全量 getData 同构 {rows, links}，渲染层 applyRowsAndLinks 零分叉。
export async function getGraphSkeleton(docID: string, docName: string) {
    const t0 = performance.now();
    const headings = (await siyuan.sql(
        // limit 显式给：思源 SQL API 无 limit 默认截 64 行（2026-09-04 dev 实测 100 标题只回 64）
        `select id,content,subtype,hpath from blocks where root_id="${docID}" and type='h' order by id limit 100000`
    )) as HeadingRow[] ?? [];
    gbLog("graph.skeleton_sql", `headings=${headings.length} ${Math.round(performance.now() - t0)}ms`);
    const { rows, links } = skeletonTreeFromHeadings(docID, docName, headings);
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
    const docNameCache = new Map<string, string>();
    for (const row of rows) {
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
    gbLog("graph.skeleton_build", `rows=${rows.length} links=${links.length + refs.length}`);
    return { rows, links: [...links, ...refs] };
}