import { DestroyManager } from "./libs/destroyer";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { getDocTracer } from "./libs/docUtils";
import { events } from "./libs/Events";
import { getTomatoPluginInstance, siyuan } from "./libs/utils";
import { sqlQuoteStr } from "./libs/strUtils";
import { winHotkey } from "./libs/winHotkey";
import { gatedAddCommand } from "./libs/cmdGate";
import { addIfVisible } from "./libs/menuManager";
import { tomatoI18n } from "./tomatoI18n";
import PrefixArticles from "./PrefixArticles.svelte"
import { newID } from "stonev5-utils";
import { adaptHotkey, Dialog } from "siyuan";
import { prefixArticlesEnable, prefixArticlesMenu, prefixArticlesSoftLimit, prefixArticlesTagsShow } from "./libs/stores";
import { matchPart, nameParts } from "./libs/prefixUtils";
import { mount, unmount } from "svelte";
import PrefixArticleParts from "./PrefixArticleParts.svelte"
export const PrefixArticles前缀文档树 = winHotkey("shift+alt+g", "前缀文档树", "iconSort", () => tomatoI18n.前缀文档树, false, prefixArticlesMenu)
export const PrefixArticlesDock = winHotkey("shift+alt+F5", "PrefixArticlesDock", "iconFiles", () => tomatoI18n.前缀文档树, false, prefixArticlesMenu)
// Tags 窗开关命令（tagsdecouple □2）：⇧⌥F6 与前缀树 dock（⇧⌥F5）成族；与面板 Tags 钮、窗 X 钮
// 同源 toggle prefixArticlesTagsShow（write 落盘）。不传 menu 族开关——该命令无右键菜单消费点，
// 族开关语义=「前缀树右键菜单条目显隐」，挂它反而制造「关右键菜单=状态栏钮失联」意外（review P2）
export const PrefixArticlesTags = winHotkey("shift+alt+F6", "PrefixArticlesTags", "iconTags", () => tomatoI18n.标签悬浮窗)

function toggleTagsWin() {
    prefixArticlesTagsShow.write(!prefixArticlesTagsShow.get());
}

// Tags 窗独立挂载（tagsdecouple □1）：body 直挂自持组件，不再随 dock 面板子树 mount/unmount——
// 面板关掉/隐藏时窗仍在（bear 拍板「它们俩应该是独立的」）；显隐纯由 prefixArticlesTagsShow
// 持久 store 驱动（DialogSvelte {#if show} 整树渲染，关=零 DOM）。先例=initDocNavigator 族。
let tagsSvelte: ReturnType<typeof mount> | null = null;
function mountArticleParts() {
    if (tagsSvelte) return; // 幂等防双窗
    tagsSvelte = mount(PrefixArticleParts, { target: document.body });
}
/** onunload 链收尾：插件卸载/重载时摘窗（官方 destroyPlugin 只清 dock/顶栏，body 直挂须自理） */
export function prefixArticlesOnunload() {
    if (tagsSvelte) {
        unmount(tagsSvelte);
        tagsSvelte = null;
    }
    removeTagsStatusBarBtn();
}

// 状态栏 Tags 钮（tagsdecouple □2）：点击 toggle 窗（与快捷键/面板钮同源）；窗开着时主色点亮
// （无官方 active 类，store 订阅切 color——同面板 Tags 钮 --on 语义）
let tagsBtnEl: HTMLElement | null = null;
let tagsBtnUnsub: (() => void) | null = null;
function addTagsStatusBarBtn(plugin: BaseTomatoPlugin) {
    if (tagsBtnEl) return; // 幂等防叠挂（与 mountArticleParts 对称；双挂会覆盖 unsub 句柄泄漏旧订阅）
    const label = PrefixArticlesTags.langText() + " " + PrefixArticlesTags.w();
    const tmp = document.createElement("template");
    tmp.innerHTML = `<div class="toolbar__item ariaLabel" role="button"><svg><use xlink:href="#${PrefixArticlesTags.icon}"></use></svg></div>`;
    const el = tmp.content.firstElementChild as HTMLElement;
    // w() 读 keymap custom（用户可改键）——label 走 setAttribute 天然转义，勿拼进 innerHTML（review P2）
    el.setAttribute("aria-label", label);
    el.addEventListener("click", () => toggleTagsWin());
    plugin.addStatusBar({ element: el, position: "left" });
    tagsBtnEl = el;
    tagsBtnUnsub = prefixArticlesTagsShow.subscribe((on) => {
        tagsBtnEl?.style.setProperty("color", on ? "var(--b3-theme-primary)" : "");
    });
}
function removeTagsStatusBarBtn() {
    tagsBtnUnsub?.();
    tagsBtnUnsub = null;
    if (tagsBtnEl) {
        tagsBtnEl.remove();
        // addStatusBar 只 push 不移除（TomatoClock 同坑）：同步摘注册防 detached 节点驻留
        const arr = (getTomatoPluginInstance() as any).statusBarIcons as Element[];
        const i = arr?.indexOf(tagsBtnEl) ?? -1;
        if (i >= 0) arr.splice(i, 1);
        tagsBtnEl = null;
    }
}

/** □4 时序统一：index.async onload 已 await taskCfg（框架保序），双路竞态消化退役 */
export function initPrefixArticles() {
    const plugin = getTomatoPluginInstance();
    if (prefixArticlesEnable.get()) {
        if (!events.isMobile) {
            addDock();
            // 移动端不常驻（review P1-2）：90vw×70vh 窗盖编辑区且移动端无 dock=无 Tags 钮
            // 入口，X 关闭曾是会话级=「重启复现」观感；桌面常驻语义先行，移动端形态待立项
            mountArticleParts();
        }
        // plugin.addCommand({
        //     langKey: PrefixArticlesAllParts.langKey,
        //     langText: PrefixArticlesAllParts.langText(),
        //     hotkey: PrefixArticlesAllParts.m,
        //     callback: () => {
        //         openParts();
        //     },
        // });
        gatedAddCommand(plugin, PrefixArticles前缀文档树.langKey, {
            langText: PrefixArticles前缀文档树.langText(),
            hotkey: PrefixArticles前缀文档树.m,
            editorCallback: (protyle) => {
                const { name, docID } = events.getInfo(protyle)
                findArticlesByPrefix(name, docID);
            },
        });
        if (!events.isMobile) {
            // Tags 窗开关通道（tagsdecouple □2）：窗仅桌面 mount，命令/状态栏钮同步桌面限定
            // （移动端注册=点了无效果死钮）。callback 非 editorCallback——窗不依赖编辑器
            gatedAddCommand(plugin, PrefixArticlesTags.langKey, {
                langText: PrefixArticlesTags.langText(),
                hotkey: PrefixArticlesTags.m,
                callback: () => {
                    toggleTagsWin();
                },
            });
            addTagsStatusBarBtn(plugin);
        }
        plugin.eventBus.on("open-menu-content", ({ detail }) => {
            const menu = detail.menu;
            addIfVisible(menu, PrefixArticles前缀文档树.langKey, {
                icon: PrefixArticles前缀文档树.icon,
                accelerator: PrefixArticles前缀文档树.m,
                label: PrefixArticles前缀文档树.langText(),
                click: () => {
                    const { name, docID } = events.getInfo(detail.protyle)
                    findArticlesByPrefix(name, docID);
                },
            }, PrefixArticles前缀文档树.menu());
        });
    } else {
        dm?.destroyBy();
        prefixArticlesOnunload();
    }
}

let dm: DestroyManager;
const DOCK_TYPE = "dock_PrefixArticles";
function addDock() {
    dm?.destroyBy()
    dm = new DestroyManager();
    let svelte: any
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
        init: (dock) => {
            const eleID = newID();
            if (events.isMobile) {
                dock.element.innerHTML = `<div class="toolbar toolbar--border toolbar--dark">
                        <svg class="toolbar__icon"><use xlink:href="#${PrefixArticlesDock.icon}"></use></svg>
                            <div class="toolbar__text">${title}</div>
                        </div>
                        <div id="${eleID}" class="fn__flex-1" style="min-height:0;overflow-y:auto;"></div>
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
                        <div id="${eleID}" class="fn__flex-1 fn__flex-column" style="min-height:0;"></div>
                    </div>`;
            }
            svelte = mount(PrefixArticles, {
                target: dock.element.querySelector("#" + eleID),
                props: {
                    dm,
                    isDock: true,
                    dockElement: dock.element as any,
                }
            });
        },
    } as any); // addDock.init 的 dock 参数同 GraphBox：1.2.5 类型漏了，运行时仍传
    dm.add("dock", () => dock);
    dm.add("svelte", () => { if (svelte) unmount(svelte); })
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
    const d = mount(PrefixArticles, {
        target: dialog.element.querySelector("#" + id),
        props: {
            dm,
            prefixDocs,
            currentDocID: docID,
        }
    });
    dm.add("1", () => dialog.destroy())
    dm.add("2", () => unmount(d))
}

async function tryFixTracerByLike(like: string) {
    if (!like || like.trim() === "") return
    navigator.locks.request("tryFixTracerByLike 2025-07-02 14:07:26", { ifAvailable: true }, async (locks) => {
        if (locks) {
            const rows = await siyuan.sql(`select * from blocks where type='d' and ( ${like} ) limit 9999999`)
            const tracer = await getDocTracer();
            tracer.update(rows, false)
        }
    })
}

export function titleSort(a: ArticlesPrefix, b: ArticlesPrefix) {
    return a.docName.localeCompare(b.docName, undefined, { numeric: true, sensitivity: 'base' });
}

/** 组区/跟随列表共用封顶：prefixArticlesSoftLimit 解析（非法值兜底 50） */
export function getSoftLimit() {
    const max = parseInt(prefixArticlesSoftLimit.get());
    if (typeof max !== "number" || isNaN(max) || max < 1) {
        return 50;
    }
    return max;
}

export async function getPrefixDocs(docID: string, name: string, force = false) {
    if (!name) return [];
    const tracer = await getDocTracer();
    let prefixDocs: ArticlesPrefix[] = [];

    const max = getSoftLimit();
    const tags = await siyuan.getRowByID(docID)
        .then(r => r.tag ?? "")
        .then(t => t.split("#").map(i => i.trim()))
        .then(tags => {
            // 名字分段=去末段（□7 与 Tags 云同规，nameParts 单一事实源）：
            // 末段标题词不再参与相关文档匹配（bear「喜恶」病灶），IAL tag 通道不受影响
            tags.push(...nameParts(name))
            return tags
        })
        .then(r => r.filter(i => !!i))
    // 有标签源（名字段或 IAL tag）即按标签子串匹配；公共前缀分支只留给无任何标签源的
    // 普通文档。□7 前条件是 >1（旧分段含末段恒 ≥2 掩盖了单段名场景），去末段后单段名
    // 文档 tags=[该段] 落 else=首字公共前缀混入无关文档（「人性|恶」带进「人物」），修正为 >0；
    // 尾空段名 a| 随之 else→if（tags=[a]），与云 chip「a」同现对齐
    if (tags.length > 0) {
        if (force) {
            await tryFixTracerByLike(tags.map(p => `content like ${sqlQuoteStr("%" + p + "%")}`).join(" or "))
        }
        for (const part of tags) {
            for (const [id, block] of tracer.getDocMap().entries()) {
                const docName = block.content?.trim() ?? "";
                if (matchPart(block, part)) {
                    prefixDocs.push({ id, docName, prefix: part });
                }
            }
        }
        prefixDocs = prefixDocs.uniq(i => i.id);
        prefixDocs = getNearest(prefixDocs, max)
        prefixDocs = prefixDocs.sort(titleSort);
        prefixDocs = prune(prefixDocs, docID, max)
        prefixDocs = prefixDocs.sort(titleSort);
        return prefixDocs
    } else {
        if (force) {
            await tryFixTracerByLike(prefixDocs.map(p => `content like ${sqlQuoteStr(p.prefix.trim() + "%")}`).join(" or "))
        }
        for (const [id, block] of tracer.getDocMap().entries()) {
            const docName = block.content;
            const prefix = getCommonPrefix(name, docName);
            if (prefix.length > 0) {
                prefixDocs.push({ id, docName, prefix });
            }
        }
        prefixDocs = getNearest(prefixDocs, max)
        prefixDocs = prefixDocs.sort(titleSort);
        prefixDocs = prune(prefixDocs, docID, max)
        prefixDocs = prefixDocs.sort(titleSort);
        return prefixDocs;
    }
}

function prune(prefixDocs: ArticlesPrefix[], docID: string, MAX_RESULTS: number) {
    const result: ArticlesPrefix[] = [];
    let idx = prefixDocs.findIndex(d => d.id === docID)
    // 当前文档不在候选集（前缀失联/tracer 过期）：at(-1)=末元素错锚+窗口从两头错位拼——
    // 退化为取排序后前 MAX 条（调用方已 titleSort，语义=最靠近字典序头部的一组）
    if (idx < 0) return prefixDocs.slice(0, MAX_RESULTS);
    let left = idx - 1
    let right = idx + 1
    result.push(prefixDocs.at(idx))
    let count = prefixDocs.length;
    while (count-- > 0) {
        if (left >= 0) {
            const l = prefixDocs.at(left);
            result.push(l)
            if (result.length >= MAX_RESULTS) break;
            left--;
        }

        if (right < prefixDocs.length) {
            const r = prefixDocs.at(right);
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
