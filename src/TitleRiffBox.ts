// TitleRiffBox —— 文档标题栏「复习本文档闪卡」按钮（GitHub issue #82：用户 80% 的卡
// 是思源自制卡，希望不进菜单、一键复习当前文档的卡）。
//
// 形态：注入 .protyle-title 下的 .protyle-attr（原生书签/命名/别名/备注属性行，标题区
// 右上角）。div 形态吃内核原生样式（_attr.scss 的 `> div:not(.protyle-attr--refcount)`
// 规则：12px svg、on-surface 色值、hover、margin 全同款，零自绘 CSS）；tooltip 走内核
// ariaLabel 全局悬浮通道（popover.ts mouseover 委托，data-position=north 与原生备注
// 图标同向）。图标=内核 iconRiffCard（docs/材料/可以用的图标.md 在册）。
// 点击=openTab card type:"doc"（内核 newCardTab.ts:56 走 getTreeRiffDueCards 按文档
// 子树复习；与 CardBox 右键「复习此文档及子文档」同一界面，无到期卡=官方空状态）。
//
// 只读/加密笔记本门跟随原生入口（openTitleMenu.ts:204 / boot/globalEvent/keydown.ts:356
// 同款）：window.siyuan.config.readonly 或 isEncryptedBox(笔记本) 时原生复习入口是
// 隐藏而非置灰——按钮跟随隐藏（注入前早退）。同理还有「显示书签图标」关闭门：该配置下
// 标题属性行 opacity:0（详见 handleProtyle 内注），隐形钮仍可交互=幽灵区，不注入。
import { IProtyle, openTab, Protyle } from "siyuan";
import { EventType, events } from "./libs/Events";
import { getOpenedEditors, icon, isBacklinkUI, isCardUI, isPopoverUI, isSearchUI } from "./libs/utils";
import { cardBoxCheckbox, cardBoxReviewTitleBtn } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { debugLog } from "./libs/logUtils";
import { TOMATO_BK_IGNORE } from "./libs/gconst";

// 代际标记（BackLinkBottomBox.ts:24-29 □10 评审 P2① 同款配方）：插件 reload 整轮重跑
// 模块顶层（前端 loader window.eval 无模块缓存），旧实例 in-flight（四高频 protyle 事件
// 300ms trailing debounce）handler 可能在新实例清场之后落地注入——按钮带代际属性，注入
// 前发现异代旧钮就地摘除换新，防跨代残留（盐前缀键防跨插件撞名）。
const gGen = globalThis as { __tomato_zZmqus5PtYRi_titleRiffGen?: number };
const TITLE_RIFF_GEN = String((gGen.__tomato_zZmqus5PtYRi_titleRiffGen = (gGen.__tomato_zZmqus5PtYRi_titleRiffGen ?? 0) + 1));

// 按钮 DOM 标记属性（幂等判定/全量清场用；单模块消费，不进 gconst 公共清单）
const TITLE_RIFF_ADD = "data-tomato-title-riff";

/** 全量摘除本插件注入的标题栏复习钮（任意代际）。onload 先清上一代残留、onunload 收尾用 */
function removeAllTitleRiffBtns() {
    document.querySelectorAll(`[${TITLE_RIFF_ADD}]`).forEach(e => e.remove());
}

/** 内核 isEncryptedBox 同款（app/src/util/pathName.ts:817）：只认笔记本静态加密标记，
 * 与解锁状态无关——原生 openTitleMenu 对加密本恒藏复习入口，跟随 */
function isEncryptedBox(notebookId: string): boolean {
    if (!notebookId) return false;
    const notebooks = (window.siyuan as any)?.notebooks ?? [];
    return !!notebooks.find((n: any) => n?.id === notebookId && n?.encrypted);
}

function isDocFlow(detail: Protyle) {
    return (detail?.protyle?.element as HTMLElement)?.classList?.contains("docs-flow__protyle");
}

class TitleRiffBox {
    private plugin: BaseTomatoPlugin;
    /** 开关 store 订阅注销器（onunload 收尾） */
    private unsubSwitch: (() => void) | null = null;

    onload(plugin: BaseTomatoPlugin) {
        // 闪卡工具总开关（Checkbox 族=isStructuralKey 正则自动覆盖，改后保存自动整重载）
        if (!cardBoxCheckbox.get()) return;
        // 移动端标题区形态不同（#toolbarName 输入框，无 .protyle-title 属性行），先按桌面做
        if (events.isMobile) return;
        this.plugin = plugin;
        // 无论开关状态，reload 后先清上一实例残留（in-flight 注入孤儿，□10 缺陷 A 同款）
        removeAllTitleRiffBtns();
        events.addListener("TitleRiffBox 2026-10-28", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.switch_protyle
                || eventType == EventType.click_editorcontent
            ) {
                this.handleProtyle(detail, eventType);
            }
        });
        // reload 清残留后主动补挂：不切页签/不点编辑器就没有 protyle 事件，按钮不会自己
        // 回来（BackLinkBottomBox resweep 同款；标题属性区未就绪的编辑器随下次事件再试）
        for (const ed of getOpenedEditors()) {
            this.handleProtyle(ed.protyle, "reload-resweep");
        }
        // 开关即时生效（cardBoxReviewTitleBtn 逐事件活读=非结构性键，不进 STRUCTURAL_KEYS）：
        // 关=立即全摘；开=对在场编辑器补挂（subscribe 订阅即回调，onload 期这轮与上方 resweep 幂等重叠）
        this.unsubSwitch = cardBoxReviewTitleBtn.subscribe(on => {
            if (!on) {
                removeAllTitleRiffBtns();
            } else {
                for (const ed of getOpenedEditors()) {
                    this.handleProtyle(ed.protyle, "switch-resweep");
                }
            }
        });
        debugLog("titleriff.onload", `gen=${TITLE_RIFF_GEN}`, "titleriff");
    }

    onunload() {
        this.unsubSwitch?.();
        this.unsubSwitch = null;
        removeAllTitleRiffBtns();
        debugLog("titleriff.onunload", "buttons swept");
    }

    /** detail=事件 detail 或 Protyle 包装类（结构同构，均以 .protyle 取 IProtyle）。
     *  每个 protyle 实例一份：按 detail 自带的 title 元素注入，分屏多开各自成钮；
     *  切文档/聚焦由内核重写 .protyle-attr innerHTML 自然清钮，下次 protyle 事件重挂 */
    private handleProtyle(detail: Protyle, eventType = "") {
        if (!cardBoxReviewTitleBtn.get()) return;
        // 环境守卫（BackLinkBottomBox 决策链同款）：复习界面/悬浮预览/搜索预览/反链面板/
        // 弹窗内的自建 protyle 同样发 loaded-protyle 事件，不拦会把按钮挂进复习界面/预览
        const protyle: IProtyle = detail?.protyle;
        if (!protyle?.element) return;
        if (protyle.element.getAttribute(TOMATO_BK_IGNORE)) return;
        if (isPopoverUI(detail)) return;
        if (isBacklinkUI(detail)) return;
        if (isSearchUI(detail)) return;
        if (isCardUI(detail)) return;
        if (isDocFlow(detail)) return;
        const titleEle = protyle.title?.element;
        if (!titleEle) return; // 卡片/预览等无标题 protyle 的结构兜底
        const docID = protyle.block?.rootID;
        if (!docID) return;
        // 聚焦态隐藏标题（hideTitleOnZoom）=不可见，不注入；退出聚焦内核重渲染后事件重挂
        if (titleEle.classList.contains("fn__none")) return;
        // 「显示书签图标」关闭（displayBookmarkIcon=false）时标题元素无 protyle-wysiwyg--attr
        // 类（Title.ts:42-44 构造期按配置加类）=属性行唯一 opacity:1 通道关闭（_attr.scss:6
        // 基线 opacity:0，_wysiwyg.scss:801 覆盖选择器即该类）。opacity:0 不禁 pointer-events：
        // 行内钮=每个文档标题右上角一个隐形仍可点+悬停弹 tooltip 的幽灵交互区（原生该配置下
        // 属性行 :empty display:none 本无可点物）——与只读/加密门同理，跟随隐藏，不注入
        if (!titleEle.classList.contains("protyle-wysiwyg--attr")) return;
        // 标题属性区未就绪即静默跳过——「下次 protyle 事件再试」（addIcon2Title 同语义）
        const attrRow = titleEle.querySelector(":scope > .protyle-attr");
        if (!attrRow) return;
        // 原生入口同款门（openTitleMenu.ts:204 / keydown.ts:356）：只读模式与加密笔记本
        // 下原生复习入口隐藏（非置灰）——按钮跟随隐藏；已在场的旧钮就地摘除（状态切换自愈）
        if ((window.siyuan as any)?.config?.readonly) {
            debugLog("titleriff.skip", "readonly mode", "titleriff");
            attrRow.querySelector(`[${TITLE_RIFF_ADD}]`)?.remove();
            return;
        }
        if (isEncryptedBox(protyle.notebookId)) {
            debugLog("titleriff.skip", `encrypted box=${protyle.notebookId}`, "titleriff");
            attrRow.querySelector(`[${TITLE_RIFF_ADD}]`)?.remove();
            return;
        }
        // 幂等：在场钮代 ≥ 本代即跳过（含同代；在场代更高＝更新实例已挂载，旧 in-flight
        // handler 不得摘换——domUtils.installedBkWithGen 同款规则，双向不等会摘新挂旧出
        // 旧闭包僵尸）；低代/无代残留（旧实例 in-flight 注入，Number(null/NaN) 恒小于本代）
        // 就地摘除换新
        const old = attrRow.querySelector(`[${TITLE_RIFF_ADD}]`);
        if (old) {
            if (Number(old.getAttribute(TITLE_RIFF_ADD)) >= Number(TITLE_RIFF_GEN)) return;
            old.remove();
        }
        const btn = document.createElement("div");
        btn.className = "tomato-title-riff ariaLabel";
        btn.setAttribute(TITLE_RIFF_ADD, TITLE_RIFF_GEN);
        btn.setAttribute("role", "button");
        btn.setAttribute("aria-label", tomatoI18n.复习此文档及子文档);
        btn.setAttribute("data-position", "north");
        btn.innerHTML = icon("iconRiffCard", 12);
        btn.onclick = (ev: MouseEvent) => {
            // 拦冒泡：原生 .protyle-attr 容器有整行 click 监听（getDocInfo 往返+commonClick）
            ev.stopPropagation();
            const rootID = protyle.block?.rootID;
            if (!rootID) return;
            // 标题实时取：editElement.textContent=标题输入框当前值，改名后不旧
            const title = protyle.title?.editElement?.textContent?.trim();
            debugLog("titleriff.click", `doc=${rootID}`);
            openTab({
                app: this.plugin.app,
                card: { type: "doc", id: rootID, title },
            });
        };
        attrRow.appendChild(btn);
        debugLog("titleriff.mount", `doc=${docID} type=${eventType}`, "titleriff");
    }
}

export const titleRiffBox = new TitleRiffBox();
