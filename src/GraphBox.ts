import { Custom, Dock, IEventBusMap, IProtyle, openTab } from "siyuan";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { graphAddTopbarIcon, graphBoxCheckbox, graph定位到图中的节点Menu, graph打开块关系图Menu } from "./libs/stores";
import { siyuan, } from "./libs/utils";
import { events, EventType } from "./libs/Events";
import GraphBoxSvelte from "./GraphBox.svelte";
import { tomatoI18n } from "./tomatoI18n";
import { getDocBlocks } from "./libs/docUtils";
import { DestroyManager } from "./libs/destroyer";
import { winHotkey } from "./libs/winHotkey";
import { newID } from "stonev5-utils/lib/id";
import { removeTopBarIcon } from "./libs/ui";
import { setTimeouts } from "stonev5-utils";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

const DOCK_TYPE = "dock_GraphBox"

const TAB_TYPE = "custom_tab_GraphBox"

export const GraphBox定位到图中的节点 = winHotkey("⌘⌥E", "graphLocateNode2024-11-5 08:29:27", "", () => tomatoI18n.定位到图中的节点)
export const GraphBox打开块关系图 = winHotkey("⇧⌥E", "graphLocateNode open 2024-12-16 14:56:28", "iconGraphTomato", () => tomatoI18n.打开块关系图)

class GraphBox {
    plugin: BaseTomatoPlugin;
    private customTab: () => Custom;
    private dock: Dock;

    onload(plugin: BaseTomatoPlugin) {
        this.plugin = plugin;
        if (!events.isMobile) {
            removeTopBarIcon(GraphBox打开块关系图.icon)
            plugin.addTopBar({
                icon: GraphBox打开块关系图.icon,
                title: GraphBox打开块关系图.langText(),
                position: "left",
                callback: () => this.openGraphTab(),
            });
        }
        (async () => {
            await plugin.taskCfg;
            if (graphBoxCheckbox.get()) {
                this.addDock();
                this._onload(plugin);
                if (!graphAddTopbarIcon.get()) {
                    setTimeouts(() => {
                        removeTopBarIcon(GraphBox打开块关系图.icon)
                    }, 300, 4000, 500)
                }
            } else {
                setTimeouts(() => {
                    // delete plugin.getDocks()[plugin.name + DOCK_TYPE]
                    // removeDockIcon(plugin.name + DOCK_TYPE)
                    removeTopBarIcon(GraphBox打开块关系图.icon)
                }, 300, 4000, 500)
            }
        })();
    }
    _onload(plugin: BaseTomatoPlugin) {
        this.customTab;
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
            callback: () => this.openGraphTab(),
        });
        events.addListener("tomato-graph-box-2024-07-01 17:16:01", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.click_editorcontent
                || eventType == EventType.switch_protyle
            ) {
                this.getData()?.changeDoc(detail?.protyle);
            }
        });
        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            this.locateNodeMenu(detail as any);
        });

        this.customTab = this.plugin.addTab({
            type: TAB_TYPE,
            init(this) {
                const id = newID();
                this.element.innerHTML = `<div id="${id}"></div>`;
                this.data.sm = new DestroyManager();
                const svelte = new GraphBoxSvelte({
                    target: this.element.querySelector("#" + id),
                    props: {
                        dock: this as any,
                        plugin,
                        landscapeSwitchBtnID: "",
                    }
                });
                this.data.sm.add("custom", () => { this.destroy(); });
                this.data.sm.add("svelte", () => { svelte.$destroy(); });
            },
            beforeDestroy() { },
            destroy() {
                this.data.sm.destroyBy("custom");
            }
        });
    }

    blockIconEvent(detail: IEventBusMap["click-blockicon"]) {
        if (!graphBoxCheckbox.get()) return;
        this.locateNodeMenu(detail as any);
    }

    async openGraphTab() {
        await openTab({
            app: this.plugin.app,
            position: "right",
            custom: {
                icon: "iconGraphTomato",
                title: tomatoI18n.块关系图,
                data: { docID: events.docID, blockID: events.lastBlockID },
                id: this.plugin.name + TAB_TYPE
            },
        });
    }

    locateNodeMenu(detail: TomatoMenu) {
        const menu = detail.menu;
        if (!events.isMobile) {
            if (graph定位到图中的节点Menu.get()) {
                menu.addItem({
                    label: GraphBox定位到图中的节点.langText(),
                    icon: "iconGraphTomato",
                    accelerator: GraphBox定位到图中的节点.m,
                    click: () => this.locateNode(detail.protyle),
                });
            }
            if (graph打开块关系图Menu.get()) {
                menu.addItem({
                    label: GraphBox打开块关系图.langText(),
                    icon: "iconGraphTomato",
                    accelerator: GraphBox打开块关系图.m,
                    click: () => this.openGraphTab(),
                });
            }
        }
    }

    private async locateNode(protyle: IProtyle) {
        const { ids } = await events.selectedDivs(protyle)
        await this.getData()?.locateID(ids[0]);
    }

    private getData(model?: Dock): GraphDockData<GraphBoxSvelte> {
        if (!model) model = this.dock;
        return model?.data as any
    }

    private addDock() {
        const landscapeSwitchBtnID = newID();
        this.plugin.addDock({
            type: DOCK_TYPE,
            config: {
                position: "LeftBottom",
                size: { width: 1000, height: 1000 },
                icon: "iconGraphTomato",
                title: tomatoI18n.块关系图,
                hotkey: "⌥⌘Z",
            },
            data: {
                svelte: null,
            },
            resize(this: Dock) {
                graphBox.getData(this).setCanvasSize()
            },
            update(this: Dock) {
                // graphBox.getData(this).setCanvasSize() 这里会在同步时，更新文档树时，自动弹出dock框。
            },
            destroy(this: Dock) {
                graphBox.getData(this).svelte.$destroy();
            },
            init: (dock: Dock) => {
                const eleID = newID();
                if (events.isMobile) {
                    dock.element.innerHTML = `<div class="toolbar toolbar--border toolbar--dark">
                        <svg class="toolbar__icon"><use xlink:href="#iconGraphTomato"></use></svg>
                            <div class="toolbar__text">${tomatoI18n.块关系图}</div>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                } else {
                    dock.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
                        <div class="block__icons">
                            <div class="block__logo">
                                <svg class="block__logoicon"><use xlink:href="#iconGraphTomato"></use></svg>${tomatoI18n.块关系图}
                            </div>
                            <div class="block__logo">
                                <button id="${landscapeSwitchBtnID}" class="b3-button b3-button--outline">${tomatoI18n.切换横向与纵向}</button>
                            </div>
                            <span class="fn__flex-1 fn__space"></span>
                            <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min"><svg><use xlink:href="#iconMin"></use></svg></span>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                }
                this.dock = dock;
                try {
                    graphBox.getData(dock).svelte = new GraphBoxSvelte({
                        target: dock.element.querySelector("#" + eleID),
                        props: {
                            dock,
                            plugin: this.plugin,
                            landscapeSwitchBtnID,
                        }
                    });
                } catch (e) {
                    console.error(e);
                }
            },
        });
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

function seriesAllNodes(root: Block) {
    const children = root?.children?.slice();
    const len = children?.length;
    if (!(len > 0)) return;
    for (let i = 1; i < children.length; i++) {
        const c = children[i];
        if (c.type === 'h') continue;
        const p = children[i - 1];
        p.children.push(c);
        c.parent = p;
        c.parent_id = p.id;
        c.data = 'm'
    }
    root.children = children.filter(c => c.data !== 'm')
    children.forEach(c => delete c.data)
    return root;
}

function parallelHeanders(root: Block, subtypeParent: string, subtypeChild: string) {
    const children = root?.children?.slice();
    const len = children?.length;
    if (!(len > 0)) return;
    let found = false;
    let p: Block;
    for (let i = 1; i < children.length; i++) {
        if (children[i - 1].subtype === subtypeParent) {
            p = children[i - 1];
            if (!p.children) p.children = [];
        }
        if (children[i - 1].subtype < subtypeParent) {
            p = null;
        }
        const c = children[i];
        if (p && c.subtype === subtypeChild) {
            p.children.push(c);
            c.parent = p;
            c.parent_id = p.id;
            c.data = 'm'
            found = true;
        }
    }
    if (found) {
        root.children = children.filter(c => c.data !== 'm')
        children.forEach(c => delete c.data)
    }
    return root;
}

function shortenList(block: Block) {
    if (!block) return;
    // block.isInList = true;
    if (!(block?.children?.length > 0)) return;
    if (block.type === 'i' || block.type === 'l') {
        block.children.forEach(c => c.parent_id = block.parent_id)
        block.data = 'del'
    }
    block.children.forEach(shortenList);
}

function unfoldBlocks(root: Block, all: Block[] = []) {
    if (!root) return;
    all.push(root);
    if (root.type === 'l') {
        shortenList(root)
    } else if (root.subtype === 'col') {
        // ignore
    } else {
        seriesAllNodes(root);

        parallelHeanders(root, "h5", "h6");
        parallelHeanders(root, "h4", "h6");
        parallelHeanders(root, "h3", "h6");
        parallelHeanders(root, "h2", "h6");
        parallelHeanders(root, "h1", "h6");

        parallelHeanders(root, "h4", "h5");
        parallelHeanders(root, "h3", "h5");
        parallelHeanders(root, "h2", "h5");
        parallelHeanders(root, "h1", "h5");

        parallelHeanders(root, "h3", "h4");
        parallelHeanders(root, "h2", "h4");
        parallelHeanders(root, "h1", "h4");

        parallelHeanders(root, "h2", "h3");
        parallelHeanders(root, "h1", "h3");

        parallelHeanders(root, "h1", "h2");
    }
    root.children?.forEach(c => unfoldBlocks(c, all));
    return all;
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

export async function getData(docID: string, docName: string, maxPBlocks: number, blockLimit: number) {
    const taskRefs = siyuan.sqlRef(`
        select root_id,def_block_parent_id,content,def_block_root_id,def_block_id,block_id from refs 
        where root_id="${docID}" 
        or def_block_parent_id="${docID}" 
        or def_block_root_id="${docID}" 
        or def_block_id="${docID}" 
        or block_id="${docID}" 
    `);
    let refs: Ref[];
    const rows = await getDocBlocks(docID, docName, true, false)
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
                    r.content = r.content?.slice(0, 4) ?? "";
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
            if (r.type === 'i' || r.type === 'l') {
                if (!(r.children?.length > 0)) {
                    return false;
                }
            }
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
    return { rows, links: refs };
}