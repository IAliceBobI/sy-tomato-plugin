import { DestroyManager } from "./libs/destroyer";
import { getDocTracer } from "./libs/docUtils";
import { events } from "./libs/Events";
import { getTomatoPluginInstance } from "./libs/utils";
import { winHotkey } from "./libs/winHotkey";
import { tomatoI18n } from "./tomatoI18n";
import PrefixArticles from "./PrefixArticles.svelte"
import { newID } from "stonev5-utils/lib/id";
import { adaptHotkey, Dialog, Dock } from "siyuan";
import { prefixArticlesEnable, prefixArticlesMenu, prefixArticlesSoftLimit } from "./libs/stores";
import { uniqueFilter } from "stonev5-utils";
export const PrefixArticles前缀文档树 = winHotkey("shift+alt+g", "前缀文档树 2025-06-26 00:20:18", "📖", () => tomatoI18n.前缀文档树, false, prefixArticlesMenu)
export const PrefixArticlesDock = winHotkey("shift+alt+F5", "PrefixArticlesDock 2025-06-26 00:20:18", "iconFilesTomato", () => tomatoI18n.前缀文档树, false, prefixArticlesMenu)

function __initPrefixArticles() {
    const plugin = getTomatoPluginInstance();
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
}

export function initPrefixArticles() {
    const plugin = getTomatoPluginInstance();
    if (plugin.initCfg()) {
        __initPrefixArticles()
    } else {
        (async () => {
            await plugin.taskCfg;
            __initPrefixArticles()
        })();
    }
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
                    dockElement: dock.element,
                }
            });
        },
    });
    dm.add("dock", () => dock);
    dm.add("svelte", () => svelte?.$destroy())
}

async function findArticlesByPrefix(name: string, docID: string) {
    if (!name) return
    const prefixDocs: ArticlesPrefix[] = await getPrefixDocs(docID, name);
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

export async function getPrefixDocs(docID: string, name: string) {
    if (!name) return [];
    const tracer = await getDocTracer();
    let prefixDocs: ArticlesPrefix[] = [];
    if (name.includes("|")) {
        for (const part of name.split("|").map(i => i.trim())) {
            for (const [id, block] of tracer.getDocMap().entries()) {
                const docName = block.content.trim();
                if (docName.includes(part)) {
                    prefixDocs.push({ id, docName, prefix: part });
                }
            }
        }
        prefixDocs = prefixDocs
            .filter(uniqueFilter(i => i.id))
            .sort((a, b) => a.docName.localeCompare(b.docName));
        return prefixDocs;
    } else {
        for (const [id, block] of tracer.getDocMap().entries()) {
            const docName = block.content;
            const prefix = getCommonPrefix(name, docName);
            if (prefix.length > 0) {
                prefixDocs.push({ id, docName, prefix });
            }
        }
        let max = parseInt(prefixArticlesSoftLimit.get());
        if (typeof max !== "number" || isNaN(max) || max < 1) {
            max = 50;
        }
        prefixDocs = getNearest(prefixDocs, max)
        prefixDocs = prefixDocs.sort((a, b) => a.docName.localeCompare(b.docName));
        prefixDocs = prune(prefixDocs, docID, max)
        prefixDocs = prefixDocs.sort((a, b) => a.docName.localeCompare(b.docName));
        return prefixDocs;
    }
}

function prune(prefixDocs: ArticlesPrefix[], docID: string, MAX_RESULTS: number) {
    const result: ArticlesPrefix[] = [];
    let left = prefixDocs.findIndex(d => d.id === docID)
    let right = left + 1
    let count = prefixDocs.length;
    while (count-- > 0) {
        const l = prefixDocs.at(left);
        if (l != null) {
            result.push(l)
            if (result.length >= MAX_RESULTS) break;
            left--;
        }

        const r = prefixDocs.at(right);
        if (r != null) {
            result.push(r)
            if (result.length >= MAX_RESULTS) break;
            right++;
        }
    }
    return result
}

function getNearest(prefixDocs: ArticlesPrefix[], MAX_RESULTS: number) {
    if (prefixDocs.length <= MAX_RESULTS) {
        return prefixDocs;
    }
    const groups: Map<number, ArticlesPrefix[]> = new Map();
    for (const doc of prefixDocs) {
        const len = doc.prefix.length;
        if (!groups.has(len)) {
            groups.set(len, []);
        }
        groups.get(len)?.push(doc);
    }
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => b - a);
    const result: ArticlesPrefix[] = [];
    for (const key of sortedKeys) {
        if (result.length >= MAX_RESULTS) break;
        let group = groups.get(key)
        result.push(...group);
    }
    return result;
}

function getCommonPrefix(a: string, b: string): string {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) {
        i++;
    }
    return a.slice(0, i);
}

// if (group.length <= remaining) {
//     result.push(...group);
//     remaining -= group.length;
// } else {
//     group = groups.get(key).sort((a, b) => a.docName.localeCompare(b.docName));
//     const toRemove = group.length - remaining;
//     // result.push(...group.slice(toRemove, undefined));
//     let left = 0;
//     let right = group.length - 1;
//     let removed = 0;
//     while (removed < toRemove && left < right) {
//         if (group[left].docName != name) {
//             group[left].mark = true;
//             removed++;
//         }
//         left++;
//         if (removed >= toRemove) break;
//         if (group[right].docName != name) {
//             group[right].mark = true;
//             removed++;
//         }
//         right--;
//         if (removed >= toRemove) break;
//     }
//     for (let i = 0; i < group.length; i++) {
//         if (group[i].mark == null) {
//             result.push(group[i]);
//         }
//     }
//     remaining = 0;
// }