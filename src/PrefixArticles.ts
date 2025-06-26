import { DestroyManager } from "./libs/destroyer";
import { getDocTracer } from "./libs/docUtils";
import { events } from "./libs/Events";
import { getTomatoPluginInstance } from "./libs/utils";
import { winHotkey } from "./libs/winHotkey";
import { tomatoI18n } from "./tomatoI18n";
import PrefixArticles from "./PrefixArticles.svelte"
import { newID } from "stonev5-utils/lib/id";
import { adaptHotkey, Dialog, Dock } from "siyuan";
import { prefixArticlesEnable, prefixArticlesMenu } from "./libs/stores";
export const PrefixArticles前缀文档树 = winHotkey("shift+alt+g", "前缀文档树 2025-06-26 00:20:18", "📖", () => tomatoI18n.前缀文档树, false, prefixArticlesMenu)
export const PrefixArticlesDock = winHotkey("shift+alt+F5", "PrefixArticlesDock 2025-06-26 00:20:18", "iconFilesTomato", () => tomatoI18n.前缀文档树, false, prefixArticlesMenu)

export function initPrefixArticles() {
    (async () => {
        const plugin = getTomatoPluginInstance();
        await plugin.taskCfg
        if (prefixArticlesEnable.get()) {
            if (!events.isMobile) {
                addDock();
            }
            plugin.addCommand({
                langKey: PrefixArticles前缀文档树.langKey,
                langText: PrefixArticles前缀文档树.langText(),
                hotkey: PrefixArticles前缀文档树.m,
                editorCallback: (protyle) => {
                    const { name, docID } = events.getInfo(protyle)
                    findArticlesByPrefix(name, docID);
                },
            });
            plugin.eventBus.on("open-menu-content", ({ detail }) => {
                const menu = detail.menu;
                if (PrefixArticles前缀文档树.menu()) {
                    menu.addItem({
                        iconHTML: PrefixArticles前缀文档树.icon,
                        accelerator: PrefixArticles前缀文档树.m,
                        label: PrefixArticles前缀文档树.langText(),
                        click: () => {
                            const { name, docID } = events.getInfo(detail.protyle)
                            findArticlesByPrefix(name, docID);
                        },
                    });
                }
            });
        } else {
            dm?.destroyBy();
        }
    })();
}

let dm: DestroyManager;
const DOCK_TYPE = "dock_PrefixArticles";
function addDock() {

    dm?.destroyBy()
    dm = new DestroyManager();
    let svelte: PrefixArticles
    const title = PrefixArticles前缀文档树.langText()
    const dock = getTomatoPluginInstance().addDock({
        type: DOCK_TYPE,
        config: {
            index: 4,
            position: "LeftBottom",
            size: { width: 200, height: 0 },
            icon: PrefixArticlesDock.icon,
            title,
            hotkey: PrefixArticlesDock.m,
        },
        data: {
        },
        resize() {
            svelte?.resize()
        },
        update() {
        },
        destroy() {
            dm?.destroyBy()
        },
        init: (dock: Dock) => {
            const eleID = newID();
            if (events.isMobile) {
                dock.element.innerHTML = `<div class="toolbar toolbar--border toolbar--dark">
                        <svg class="toolbar__icon"><use xlink:href="#${PrefixArticlesDock.icon}"></use></svg>
                            <div class="toolbar__text">${title}</div>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
            } else {
                dock.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
                        <div class="block__icons">
                            <div class="block__logo">
                                <svg class="block__logoicon"><use xlink:href="#${PrefixArticlesDock.icon}"></use></svg>${title}
                            </div>
                            <span class="fn__flex-1 fn__space"></span>
                            <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}"><svg><use xlink:href="#iconMin"></use></svg></span>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
            }
            svelte = new PrefixArticles({
                target: dock.element.querySelector("#" + eleID),
                props: {
                    dm,
                    isDock: true,
                }
            });
        },
    });
    // dm.add("log", () => console.log("destroy 11111111"));
    dm.add("dock", () => dock);
    dm.add("svelte", () => svelte?.$destroy())
}

async function findArticlesByPrefix(name: string, docID: string) {
    if (!name) return
    const prefixDocs: ArticlesPrefix[] = await getPrefixDocs(name);
    const id = newID();
    const dm = new DestroyManager()
    const dialog = new Dialog({
        title: PrefixArticles前缀文档树.langText(),
        content: `<div id='${id}'></div>`,
        width: events.isMobile ? "90vw" : "700px",
        height: events.isMobile ? "180svw" : "700px",
        hideCloseIcon: true,
        destroyCallback: () => {
            dm.destroyBy()
        },
        transparent: true,
    });
    const d = new PrefixArticles({
        target: dialog.element.querySelector("#" + id),
        props: {
            dm,
            prefixDocs,
            currentDocID: docID,
        }
    });
    dm.add("1", () => dialog.destroy())
    dm.add("2", () => d.$destroy())
}

export async function getPrefixDocs(name: string) {
    if (!name) return [];
    const tracer = await getDocTracer();
    const prefixDocs: ArticlesPrefix[] = [];

    for (const [id, block] of tracer.getDocMap().entries()) {
        const docName = block.content;
        const prefix = getCommonPrefix(name, docName);
        if (prefix.length > 0) {
            prefixDocs.push({ id, docName, prefix });
        }
    }
    prefixDocs.sort((a, b) => a.docName.localeCompare(b.docName));
    return prefixDocs;
}

function getCommonPrefix(a: string, b: string): string {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) {
        i++;
    }
    return a.slice(0, i);
}