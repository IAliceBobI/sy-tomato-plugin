import { IProtyle, Protyle } from "siyuan";
import { EventType, events } from "./libs/Events";
import {
    disableBK, enableBK,
} from "./libs/bkUtils";
import { getOpenedEditors, icon, isCardUI, isPopoverUI, isProtyleVisible, isSearchUI, removeBkDomResidue, siyuan, } from "./libs/utils";
import { installedBkWithGen, isBacklinkUI } from "./libs/domUtils";
import { MarkKey, TEMP_CONTENT, TOMATO_BK_IGNORE, BKMAKER_ADD, BKENTRY_ADD, BKGEN_ADD } from "./libs/gconst";
import BackLinkBottom from "./BackLinkBottom.svelte";
import { DestroyManager } from "./libs/destroyer";
import { tomatoI18n } from "./tomatoI18n";
import { back_link_dailynote_off, back_link_default_off, back_link_goto_bottom_btn, backLinkBottomBoxCheckbox, fastNoteBoxDisableBK, bk启用禁用文档的底部反链menu, back_link_refresh_off, bk_refresh_interval_sec, bk_visible_only } from "./libs/stores";
import { OpenSyFile2 } from "./libs/docUtils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { verifyKeyTomato } from "./libs/user";
import { debugLog } from "./libs/logUtils";
import { applyEntryCount, cachedEntryCount } from "./libs/bkRevision";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
import { newID } from "stonev5-utils";
import { mount, unmount } from "svelte";

// □10 评审 P2① 代际标记：插件 reload 整轮重跑模块顶层（前端 loader window.eval
// 无模块缓存），计数器挂 globalThis 跨代递增（盐前缀键防跨插件撞名）。旧实例
// in-flight handler 在新实例 removeAll() 之后落地挂载的容器由 installed() 按
// 代际识别摘除，旧实例轮询 interval 依 running() 判活、摘除后自清。
const gBkGen = globalThis as { __tomato_zZmqus5PtYRi_bkGen?: number };
const BK_GEN = String((gBkGen.__tomato_zZmqus5PtYRi_bkGen = (gBkGen.__tomato_zZmqus5PtYRi_bkGen ?? 0) + 1));

function bkEntryDivID(docID: string) {
    return "tomatoBKEntry" + docID;
}

function removeBkEntryBar(docID: string) {
    document.querySelectorAll(`div[${BKENTRY_ADD}="${bkEntryDivID(docID)}"]`).forEach(e => e.remove());
}

export class BKMaker {
    public goDownID: string;
    public disabled: boolean;
    public shouldFreeze: boolean; // maker.shouldFreeze = !$autoRefreshChecked;
    public container: HTMLElement;
    public docID: string;
    public lockName: string;
    public protyle: IProtyle;
    public plugin: BaseTomatoPlugin;
    public refreshBK: () => Promise<void>;
    /** 追踪可见性变化，从后台切回前台时立即补刷一次（issue #78） */
    private lastVisible = true;
    public dm = new DestroyManager(false, "backlink");
    public id = newID();

    constructor(blBox: BackLinkBottomBox, docID: string) {
        this.docID = docID;
        // 与 back_link_refresh_off 默认 true 保持一致，初始即冻结，
        // 消除 svelte onMount async 块回填前的时间窗口（issue #78）。
        this.shouldFreeze = back_link_refresh_off.get();
        this.plugin = blBox.plugin;
        this.lockName = "BackLinkBottomBox-BKMakerLock" + this.docID;
        this.goDownID = "godown" + docID;
    }

    doTheWork(protyle: Protyle, attrs: AttrType) {
        navigator.locks.request(this.lockName + "B", { mode: "exclusive" }, (lock) => {
            if (!lock) return;

            if (this.disabled) {
                BKMaker.removeBkDiv(this.docID);
                return;
            }
            if (BKMaker.installed(this.docID)) return;

            this.noPadding(this.container);
            this.protyle = protyle.protyle;
            this.container = document.createElement("div");
            this.container.setAttribute(BKMAKER_ADD, BKMaker.getBkDivID(this.docID));
            this.container.setAttribute(BKGEN_ADD, BK_GEN);
            this.container.id = this.id;
            this.insertBkPanel(this.container);
            this.container.style.paddingLeft = "0px"
            this.container.style.paddingRight = "0px"

            const sv = mount(BackLinkBottom, {
                target: this.container,
                props: {
                    maker: this,
                    protyle,
                    attrs,
                    dm: this.dm,
                }
            });
            debugLog("bk.mount.done", `doc=${this.docID} interval=${Math.max(2, Number(bk_refresh_interval_sec.get()) || 15)}s freeze=${this.shouldFreeze}`, "bk");
            const handler = setInterval(() => {
                if (!this.running()) {
                    this.dm.destroyBy("from maker")
                    clearInterval(handler);
                } else {
                    // issue #78: 后台页签不刷新反链，避免多个页签并行轮询导致 CPU 占用过高发烫
                    if (bk_visible_only.get()) {
                        const visible = isProtyleVisible(this.protyle);
                        if (!visible) {
                            this.lastVisible = false;
                            return;
                        }
                        // 从后台切回前台，立即补刷一次（补偿后台期间未刷新的数据）
                        if (!this.lastVisible) {
                            this.lastVisible = true;
                            this.refreshBacklinks();
                            return;
                        }
                    }
                    this.refreshBacklinks();
                }
            }, Math.max(2, Number(bk_refresh_interval_sec.get()) || 15) * 1000);
            this.dm.add("maker del sv", () => unmount(sv))
        })
    }

    static getBkDivID(docID: string) {
        return "tomatoBKDiv" + docID;
    }

    running() {
        return document.getElementById(this.id) != null
    }

    static installed(docID: string) {
        // 异代容器（旧实例 in-flight 挂载的孤儿）就地摘除并视为未安装，
        // 语义实现在 domUtils.installedBkWithGen（单测在那里，□10 评审 P2①）
        return installedBkWithGen(BKMaker.getBkDivID(docID), BK_GEN)
    }

    static removeBkDiv(docID: string) {
        document.querySelectorAll(`div[${BKMAKER_ADD}="${BKMaker.getBkDivID(docID)}"]`).forEach(e => e.parentElement.removeChild(e))
    }

    /** 插件 reload 后旧实例的 Svelte 容器/入口条成 DOM 孤儿，installed() 见残留即跳过
     * 重挂 → 面板永久僵尸（切页签才自愈）。onload 全量摘除；旧实例轮询 interval 依
     * running()（getElementById）判活，残留摘除后下个 tick 自清。语义实现在
     * domUtils.removeBkDomResidue（单测在那里）。 */
    static removeAll() {
        removeBkDomResidue();
    }

    async refreshBacklinks() {
        return navigator.locks.request(this.lockName + "B", { ifAvailable: true }, async (lock) => {
            if (this.refreshBK && lock && !this.shouldFreeze) {
                return this.refreshBK();
            }
        });
    }

    private insertBkPanel(div: HTMLElement) {
        if (!this.disabled) {
            this.noPadding(div);
            const item: HTMLElement = this.protyle.wysiwyg.element;
            item.insertAdjacentElement("afterend", div);
        }
    }

    private noPadding(div: HTMLElement) {
        if (div && this.protyle?.wysiwyg?.element?.style) {
            this.protyle.wysiwyg.element.style.paddingBottom = "0px";
            div.style.paddingLeft = this.protyle.wysiwyg.element.style.paddingLeft;
            div.style.paddingRight = this.protyle.wysiwyg.element.style.paddingRight;
        }
    }
}

export const BK启用禁用文档的底部反链 = winHotkey("shift+alt+9", "BK启用禁用文档的底部反链", "iconDock", () => tomatoI18n.enableBK启用禁用文档的底部反链,)

class BackLinkBottomBox {
    public plugin: BaseTomatoPlugin;
    public settingCfg: TomatoSettings;

    async onload(plugin: BaseTomatoPlugin) {
        debugLog("bk.onload", `checkbox=${backLinkBottomBoxCheckbox.get()}`, "bk");
        // 无论开关状态，reload 后先清上一实例残留（□10 缺陷 A）
        BKMaker.removeAll();
        if (!backLinkBottomBoxCheckbox.get()) return;

        this.plugin = plugin;
        this.settingCfg = plugin.settingCfg;

        const editorCallback = async (protyle: IProtyle) => {
            const docID = protyle?.block?.rootID;
            if (docID) {
                if (await isBkOff(docID)) {
                    await enableBK(docID);
                } else {
                    await disableBK(docID);
                }
            }
        };
        this.plugin.addCommand({
            langKey: BK启用禁用文档的底部反链.langKey,
            langText: BK启用禁用文档的底部反链.langText(),
            hotkey: BK启用禁用文档的底部反链.m,
            editorCallback,
        });

        if (bk启用禁用文档的底部反链menu.get()) {
            this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
                const menu = detail.menu;
                addIfVisible(menu, BK启用禁用文档的底部反链.langKey, {
                    label: BK启用禁用文档的底部反链.langText(),
                    icon: BK启用禁用文档的底部反链.icon,
                    click: () => editorCallback(detail.protyle),
                });
            });
        }

        events.addListener("BackLinkBottomBox", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.switch_protyle
                || eventType == EventType.click_editorcontent
            ) {
                navigator.locks.request("BackLinkBottomBoxLock", { mode: "exclusive" }, async (lock) => {
                    if (lock) {
                        const protyle = detail.protyle as IProtyle;
                        debugLog("bk.evt", `${eventType} doc=${protyle?.block?.rootID ?? "?"} el=${!!protyle?.element}`, "bk");
                        await this.handleProtyle(detail, eventType, { clearResidue: events.isMobile });
                    }
                });
            }
        });

        // reload 清残留后主动补挂：不切页签/不点编辑器就没有 protyle 事件，面板
        // 不会自己回来（□10 缺陷 A 空窗期）。走 handleProtyle 与事件路径同一条
        // 决策链（□10 评审 P2②：TOMATO_BK_IGNORE 下沉、disabled 分支的 default_off
        // 入口条复活一并对齐——此前 resweep 直达 attachMaker 绕过元素级忽略标记）。
        for (const ed of getOpenedEditors()) {
            this.handleProtyle(ed.protyle, "reload-resweep")
                .catch(e => debugLog("bk.resweep", `attach failed: ${e}`, "bk"));
        }
    }

    /** 单 protyle 的挂载决策链（事件路径与 onload resweep 共用，□10 评审 P2②）：
     * 环境守卫（IGNORE/popover/反链面板/搜索/闪卡/docflow）→ 可选清场 → disabled
     * 分支（摘面板+腾位+default_off 入口条）→ attachMaker。detail 为事件 detail
     * 或 Protyle 包装类（结构同构，均以 .protyle 取 IProtyle）。
     * opts.clearResidue：移动端单实例复用（切文档不重建）的全量清残留——只允许
     * 事件路径传，且必须在 IGNORE/popover 守卫**之后**：BK 面板自家卡片的自建
     * protyle（带 TOMATO_BK_IGNORE）载入也发 loaded-protyle-static、靠 IGNORE 早退，
     * 清场若在其前会把承载卡片的活面板整锅摘掉=移动端面板挂上即自毁（评审 P0-1）；
     * resweep 循环多编辑器同样不可清（互相摘刚挂的面板）。 */
    private async handleProtyle(detail: Protyle, eventType: string, opts?: { clearResidue?: boolean }) {
        const protyle = detail?.protyle;
        if (!protyle?.element) return;
        if (protyle.element.getAttribute(TOMATO_BK_IGNORE)) {
            debugLog("bk.evt.skip", "TOMATO_BK_IGNORE on element", "bk");
            return;
        }
        // 悬浮浮层（.block__popover，含纯预览/编辑浮窗，无 DOM 二分）内的
        // protyle 一概不挂面板/入口条（□1 吞面板根因）。上提到 attrs 往返
        // 之前：同步拒掉，覆盖 disabled 分支 mountBkEntryBar 的姊妹入口
        if (isPopoverUI(detail)) {
            debugLog("bk.evt.skip", "popoverUI", "bk");
            return;
        }
        // 以下环境守卫与 attachMaker 内同名守卫幂等双查：disabled 分支也必须拦
        // ——resweep 的 getAllEditor 含内核反链面板/搜索预览内的编辑器，disabled
        // 文档的预览 protyle 走 disabled 分支会把 200px 垫高+入口条插进 dock
        // 面板（评审 P1-3）；enabled 路径由 attachMaker 兜底入口条开启钮。
        if (isBacklinkUI(detail)) {
            debugLog("bk.evt.skip", "backlinkUI/dialogUI", "bk");
            return;
        }
        if (isSearchUI(detail)) {
            debugLog("bk.evt.skip", "searchUI", "bk");
            return;
        }
        if (isCardUI(detail)) {
            debugLog("bk.evt.skip", "cardUI", "bk");
            return;
        }
        if (isDocFlow(detail)) {
            debugLog("bk.evt.skip", "docFlow", "bk");
            return;
        }

        const docID = protyle.block.rootID;
        if (!docID) {
            debugLog("bk.evt.skip", "no rootID", "bk");
            return;
        }

        if (opts?.clearResidue) {
            removeBkDomResidue();
        }

        const attrs = await siyuan.getBlockAttrs(docID);
        const disabled = await isBkOff(docID, attrs);
        if (disabled) {
            debugLog("bk.evt.skip", `disabled doc=${docID}`, "bk");
            BKMaker.removeBkDiv(docID);
            protyle.wysiwyg.element.style.paddingBottom = "200px";
            // □3 默认关可发现性：计数>0 才渲染 28px 极轻入口条（spec §10）
            if (back_link_default_off.get()) {
                this.mountBkEntryBar(detail, docID);
            }
            return;
        }

        removeBkEntryBar(docID);
        await this.attachMaker(detail, eventType, attrs);
    }

    /** 从环境检查到 BKMaker 挂载的完整链（handleProtyle 与入口条开启钮两路直达）。
     * attrsIn：调用方已取过 attrs 时透传省一次 API 往返（也收窄 reload 代际竞态
     * 窗口）；入口条路径不传——enableBK 刚写过属性，须重取。 */
    private async attachMaker(detail: Protyle, eventType = "", attrsIn?: AttrType) {
        const protyle = detail?.protyle;
        const docID = protyle?.block?.rootID;
        if (!docID) return;
        if (BKMaker.installed(docID)) return;
        const attrs = attrsIn ?? await siyuan.getBlockAttrs(docID);
        // TOMATO_BK_IGNORE 下沉（□10 评审 P2②）：元素级忽略标记原先只在事件路径
        // 查，resweep（getAllEditor）/入口条路径绕过。本地属性读取零开销，事件
        // 路径经 handleProtyle 的双查保持幂等。
        if (protyle?.element?.getAttribute?.(TOMATO_BK_IGNORE)) {
            debugLog("bk.evt.skip", "TOMATO_BK_IGNORE on element", "bk");
            return;
        }
        // 文档级禁用：入口条路径直达本函数，缺此检查 reload 会给 custom-off
        // 文档/默认关用户强行复活面板（评审 P0）。入口条路径安全：enableBK 先
        // setBlockAttrs 写 "2" 再进来，重取 attrs 必放行。
        if (await isBkOff(docID, attrs)) {
            debugLog("bk.evt.skip", `isBkOff doc=${docID}`, "bk");
            return;
        }
        // 内核反链面板（sy__backlink 三型）/对话框内的编辑器不在事件守卫链覆盖面，
        // resweep 会误挂（评审 P1）；tomato 自家面板容器在页签编辑器内容区、不在其内。
        if (isBacklinkUI(detail)) {
            debugLog("bk.evt.skip", "backlinkUI/dialogUI", "bk");
            return;
        }
        if (isPopoverUI(detail)) {
            debugLog("bk.evt.skip", "popoverUI", "bk");
            return;
        }
        if (isSearchUI(detail)) {
            debugLog("bk.evt.skip", "searchUI", "bk");
            return;
        }
        if (isCardUI(detail)) {
            debugLog("bk.evt.skip", "cardUI", "bk");
            return;
        }
        if (isDocFlow(detail)) {
            debugLog("bk.evt.skip", "docFlow", "bk");
            return;
        }
        if (await skipByAttrs(docID, attrs)) {
            debugLog("bk.evt.skip", `skipByAttrs doc=${docID} keys=${Object.keys(attrs).join(",")}`, "bk");
            return;
        }

        // create maker
        let maker = new BKMaker(this, docID);
        maker.disabled = false;
        debugLog("bk.mount", `doTheWork doc=${docID} type=${eventType}`, "bk");

        maker.doTheWork(detail, attrs);
        if (back_link_goto_bottom_btn.get() && await verifyKeyTomato() && !events.isMobile) {
            this.addIcon2Title(maker);
        }
    }

    /**
     * □3 默认关入口条：列表级反链计数（knownRevision 加持，未变化近零开销），
     * >0 才渲染；点击整条=enableBK 后走 attachMaker 挂载面板。
     */
    private async mountBkEntryBar(detail: Protyle, docID: string) {
        removeBkEntryBar(docID);
        let count: number;
        try {
            const cached = cachedEntryCount(docID);
            const resp = await siyuan.getBacklink2(docID, "", "", "3", "3", cached?.revision ?? "");
            count = applyEntryCount(docID, resp);
        } catch (e) {
            debugLog("bk.entry", `count failed doc=${docID}: ${e}`, "bk");
            return;
        }
        if (count <= 0) {
            debugLog("bk.entry", `count=0 skip doc=${docID}`, "bk");
            return;
        }
        // await 间隙文档可能已切走或重新开启：挂载前核验现场
        const wysiwyg = detail?.protyle?.wysiwyg?.element;
        if (!document.contains(wysiwyg) || BKMaker.installed(docID)) return;
        removeBkEntryBar(docID);

        const bar = document.createElement("div");
        bar.classList.add("tomato-bk-entry-bar");
        bar.setAttribute(BKENTRY_ADD, bkEntryDivID(docID));
        bar.setAttribute("aria-label", tomatoI18n.底部反链入口文案.replace("{n}", String(count)));
        bar.innerHTML = icon("LayoutBottom", 14);
        const text = document.createElement("span");
        text.className = "tomato-bk-entry-bar__text";
        text.textContent = tomatoI18n.底部反链入口文案.replace("{n}", String(count));
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tomato-bk-entry-bar__btn";
        btn.textContent = tomatoI18n.开启;
        bar.append(text, btn);
        bar.onclick = async () => {
            debugLog("bk.entry", `enable doc=${docID}`, "bk");
            await enableBK(docID);
            removeBkEntryBar(docID);
            await this.attachMaker(detail);
        };
        wysiwyg.insertAdjacentElement("afterend", bar);
        debugLog("bk.entry", `mounted doc=${docID} count=${count}`, "bk");
    }
    private addIcon2Title(maker: BKMaker) {
        if (!maker) return;
        if (document.getElementById(maker.goDownID)) return;
        const ICONS_SIZE = 13;
        const titleEle = document.querySelector(
            `div.protyle-wysiwyg--attr[data-node-id="${maker.docID}"]`,
        );
        if (!titleEle) return;
        const button = titleEle.appendChild(document.createElement("button"));
        button.title = tomatoI18n.跳到底部反链;
        button.id = maker.goDownID;
        button.classList.add("gap");
        button.classList.add("b3-button");
        button.classList.add("b3-button--text");
        button.innerHTML = icon("Down", ICONS_SIZE);
        button.onclick = async () => {
            const id = await siyuan.getDocLastID(maker.docID);
            await OpenSyFile2(this.plugin, id);
        };
    }
}


async function skipByAttrs(docID: string, attrs?: AttrType) {
    if (attrs == null) attrs = await siyuan.getBlockAttrs(docID);
    const markKey = attrs[MarkKey] ?? "";
    if (markKey.includes(TEMP_CONTENT)) return true;

    for (const [k] of Object.entries(attrs)) {
        if (back_link_dailynote_off.get()) {
            if (k.startsWith("custom-dailynote-")) {
                return true;
            }
        }
        if (k.startsWith("custom-dailycard-")) {
            return true;
        }
        if (k.startsWith("custom-book-writing")) {
            return true;
        }
        if (fastNoteBoxDisableBK.get()) {
            if (k === "custom-fastnote") {
                return true;
            }
        }
    }

    return false;
}

function isDocFlow(detail: Protyle) {
    return detail?.protyle?.element?.classList?.contains("docs-flow__protyle");
}

async function isBkOff(nextDocID: string, attrs?: AttrType) {
    if (attrs == null) attrs = await siyuan.getBlockAttrs(nextDocID);
    const v = attrs["custom-off-tomatobacklink"];
    if (back_link_default_off.get()) {
        return !v || v === "1";
    } else {
        return v === "1";
    }
}

export const backLinkBottomBox = new BackLinkBottomBox();

// ---- □13 数据失效通道（databaseIndexCommit 分发）----
// 内核列表级 revision 不含块内容（ref_revision.go），纯内容编辑 → unchanged 短路 →
// 卡片内容永驻缓存；官方反链面板靠内核索引提交广播主动失效。Events.addWsListener
// 无 remove API（Map.set 同名覆盖）：多面板实例各自注册会互相覆盖+卸载残留死闭包，
// 注册表收敛在模块级单点，组件登记回调、卸载时注销。
export type BkIndexCommitPayload = { rootIDs: Set<string>; full: boolean };
const bkIndexCommitTargets = new Set<(d: BkIndexCommitPayload) => void>();

/** 面板登记失效回调（回调内自判 bkIndexCommitRelated 相关性与失效/刷新时机），
 * 返回注销函数 */
export function registerBkIndexCommitTarget(cb: (d: BkIndexCommitPayload) => void) {
    bkIndexCommitTargets.add(cb);
    return () => bkIndexCommitTargets.delete(cb);
}

events.addWsListener("tomato bk data invalidation 2026-09-03", (ws: WsMain) => {
    if (ws?.cmd !== "databaseIndexCommit") return;
    const d = ws.data as { rootIDs?: string[]; backlinkChanged?: boolean; backlinkFull?: boolean };
    if (!d?.backlinkChanged) return;
    const payload: BkIndexCommitPayload = { rootIDs: new Set(d.rootIDs ?? []), full: d.backlinkFull === true };
    debugLog("bk.invalidate", `roots=${payload.rootIDs.size} full=${payload.full}`, "bk");
    for (const cb of [...bkIndexCommitTargets]) {
        try {
            cb(payload);
        } catch (e) {
            debugLog("bk.invalidate", `cb failed: ${e}`, "bk");
        }
    }
});
