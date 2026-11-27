// 划词快捷颜色（2026-11 流动兔反馈三件小改之二，设计 docs/superpowers/specs/2026-11-25-mindwire-small-batch-design.md
// 「二、快捷颜色」）：总开关打开后，划词工具条在连线钮后面多四个颜色钮，点一下＝给选中的字上思源
// 自带的文字颜色——走内核 setInlineMark，写进笔记的是 style="color: var(--b3-font-colorN)"，和用户
// 自己点思源调色板完全一样。四个钮各对应一个命令，命令的 langKey 与工具条项的 name 是同一个
// （共享键位，改一处两边生效）。它是独立功能：不看思维导线的三个开关；免费。
// 手机和平板这一期不出现这四个钮：内核在移动端把每个插件工具条项另外画到键盘上方，只取图标
// （app/src/mobile/util/keyboardToolbar.ts 的 updateMobilePluginToolbar），四个钮图标一样分不出颜色，
// 出不出插件也管不了。所以收集工具条项时就按前端形态判断，移动端不追加。判前端形态直接问
// getFrontend()（Events.ts 的 _isMobile 用的也是这个函数），不借 events.isMobile——那是插件加载时
// 才写下的值，收工具条项的时机不保证在它之后；直接问不依赖先后。
// 不做「再点一次取消颜色」：要恢复默认色用思源自带的外观面板。不加右键菜单项。
import { getAllEditor, getFrontend, IMenuItem, IProtyle, Protyle } from "siyuan";
import { quickColorEnable, quickColor1, quickColor2, quickColor3, quickColor4 } from "./libs/stores";
import { normalizeWordRange } from "./libs/domUtils";
import { toWin, winHotkey } from "./libs/winHotkey";
import { currentCustom } from "./libs/hotkeyCap";
import { gatedAddCommand } from "./libs/cmdGate";
import { verifyKeyTomato } from "./libs/user";
import { debugLog } from "./libs/logUtils";
import { markTarget, rememberLiteProtyle } from "./libs/mindWireLite";
import { siyuan } from "./libs/utils";
import { tomatoI18n } from "./tomatoI18n";
import type { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";

/** 键位表按插件名分命名空间（libs/hotkeyCap.ts 同名常量口径） */
const PLUGIN_NAME = "sy-tomato-plugin";

// 四个槽的默认键 ⇧⌥⌘3～6。官方 keymap 占着 ⌥⌘0～⌥⌘6 和 ⌥⌘9，本仓占着 ⌥⌘8、⇧⌥⌘1、⇧⌥⌘2，
// ⇧⌥⌘3～⇧⌥⌘6 两边都没人用（2026-11-26 按 docs/agents/debugging/kernel/ui/hotkey-choice.md 的流程
// 复核：官方 constants.ts 默认键、四个插件仓全部源码、桌面端菜单键位，按修饰键集合归一比对都是零命中）
export const QuickColor快捷颜色1 = winHotkey("ctrl+alt+shift+3", "QuickColor 1", "iconTheme", () => tomatoI18n.快捷颜色(1))
export const QuickColor快捷颜色2 = winHotkey("ctrl+alt+shift+4", "QuickColor 2", "iconTheme", () => tomatoI18n.快捷颜色(2))
export const QuickColor快捷颜色3 = winHotkey("ctrl+alt+shift+5", "QuickColor 3", "iconTheme", () => tomatoI18n.快捷颜色(3))
export const QuickColor快捷颜色4 = winHotkey("ctrl+alt+shift+6", "QuickColor 4", "iconTheme", () => tomatoI18n.快捷颜色(4))

export interface QuickColorSlot {
    hk: typeof QuickColor快捷颜色1;
    /** 这个槽用第几号思源内置字色 */
    color: typeof quickColor1;
}

/** 槽号：1～4（下标＝槽号−1，和命令名「快捷颜色 N」、默认键 ⇧⌥⌘(N+2) 一一对应） */
export type QuickColorSlotNo = 1 | 2 | 3 | 4;

export const QUICK_COLOR_SLOTS: QuickColorSlot[] = [
    { hk: QuickColor快捷颜色1, color: quickColor1 },
    { hk: QuickColor快捷颜色2, color: quickColor2 },
    { hk: QuickColor快捷颜色3, color: quickColor3 },
    { hk: QuickColor快捷颜色4, color: quickColor4 },
];

/** 色点走的自定义属性：index.scss 里钮内色点元素的背景色读它（自定义属性从钮继承给色点）。内核只给画
 *  图标，四个钮图标一样，颜色靠这个点显示 */
export const QUICK_COLOR_DOT_VAR = "--tomato-quick-color";

/** 工具条钮里色点元素的类名（同步时放进钮里，index.scss 给它定样式）。色点必须是真实元素：内核的悬停
 *  提示就画在工具条钮的伪元素上（.b3-tooltips::after，内容取 aria-label、默认透明、悬停才显示，
 *  app/src/assets/scss/component/_tooltips.scss）——原先色点也画在那上面，提示文字被顶掉、色点又被
 *  默认透明度藏住，静止时四个钮一模一样（2026-11-27 实例实测） */
export const QUICK_COLOR_DOT_CLASS = "tomato-quick-color-toolbar-dot";

/** 钮里没有色点就补一个，跟在内核放的图标后面。内核重建工具条项后新钮里只有图标，下一次同步补回 */
function ensureDot(btn: HTMLButtonElement): void {
    if (btn.querySelector(`:scope > .${QUICK_COLOR_DOT_CLASS}`)) return;
    const dot = document.createElement("span");
    dot.className = QUICK_COLOR_DOT_CLASS;
    // 提示（名字＋热键）在钮的 aria-label 上，色点只是装饰
    dot.setAttribute("aria-hidden", "true");
    btn.appendChild(dot);
}

/** 色号→上色用的值：1～13 的整数 → 思源内置字色 var(--b3-font-colorN)，其余一律回 1 号
 *  （设置文件可能被手改）。思源 3.8.6 之前的版本只有 1～7 号色，选了 8～13 号会显示成继承色，不做版本判断 */
export function quickColorValue(n: unknown): string {
    const ok = typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 13;
    return `var(--b3-font-color${ok ? n : 1})`;
}

/** 前端形态是不是手机、平板（getFrontend() 的两个移动端返回值；Events.ts 的 _isMobile 同一判法） */
export function isMobileFrontend(frontend: string | null | undefined): boolean {
    return frontend === "mobile" || frontend === "browser-mobile";
}

/** 划词工具条项：桌面端四个槽各一项，按槽号排；移动端形态一项都不给（文件头「移动端」一段）。
 *  恒附，不看总开关——显隐不靠收项那一刻的设置值，交给 selectionchange 同步在运行时读（syncQuickColorToolbar） */
export function quickColorToolbarItems(frontend: string | null | undefined): IMenuItem[] {
    if (isMobileFrontend(frontend)) return [];
    return QUICK_COLOR_SLOTS.map((slot, i) => ({
        name: slot.hk.langKey,
        // 思源自带的调色板图标（内核「颜色」菜单同款）
        icon: "iconTheme",
        tip: slot.hk.langText(),
        // 悬停提示显示在钮上方（内核自带工具条项同款）：内核按这个方位给钮加类 b3-tooltips__<方位>，
        // 提示靠它定位——不给就是 b3-tooltips__undefined，提示会盖在工具条自己身上（2026-11-27 实测）
        tipPosition: "n",
        hotkey: slot.hk.m,
        // 官方 click 实参=Protyle 包装类（ToolbarItem 调 getInstance()=>this），toolbar/setInlineMark
        // 在内层 .protyle（IProtyle）——MindWire/CommentBox e2e 实锤缺这层解包
        click: (protyle: Protyle) => quickColor.applyFromToolbar(protyle.protyle, (i + 1) as QuickColorSlotNo),
    }));
}

/** 工具条钮的提示：名字＋热键尾注，拼法同内核 ToolbarItem（tip + " " + updateHotkeyTip(hotkey)）；
 *  热键是空的就不拼尾注 */
export function quickColorLabel(name: string, hotkey: string | null | undefined): string {
    const key = hotkey?.trim();
    return key ? `${name} ${key}` : name;
}

/** 这个槽当前的提示。热键读键位表里的现值：内核只在构建工具条时拼一次，键帽里改了键它不会重建
 *  工具条，尾注就停在旧键上；这里每次同步都按现值重拼。条目还没有（命令没注册）→ 默认键；
 *  custom 是空串＝用户删了快捷键 → 没有尾注（hotkeyCap.ts currentCustom 的口径） */
function slotLabel(slot: QuickColorSlot): string {
    const custom = currentCustom(PLUGIN_NAME, slot.hk.langKey);
    return quickColorLabel(slot.hk.langText(), toWin(custom === undefined ? slot.hk.m : custom));
}

/** 划词工具条四钮的状态同步（MindWire syncWordWireToolbar 同一套）：显隐＝总开关开着＋选区有效
 *  （有字、在同一个块里、不在代码块里——normalizeWordRange 的默认判定，不启用空白选区取邻字，
 *  给空白上色没意思）＋选区落在本编辑器里。顺带刷色点和提示。编辑器列表由调用方给 */
export function syncQuickColorToolbar(protyles: IProtyle[], selRange: Range | null | undefined): void {
    const valid = quickColorEnable.get() ? normalizeWordRange(selRange) : null;
    const labels = QUICK_COLOR_SLOTS.map(slotLabel);
    const colors = QUICK_COLOR_SLOTS.map((slot) => quickColorValue(slot.color.get()));
    for (const protyle of protyles) {
        const toolbarEl = (protyle as any)?.toolbar?.element as HTMLElement | undefined;
        if (!toolbarEl) continue;
        const inEditor = !!valid && !!protyle?.wysiwyg?.element?.contains(valid.startContainer);
        QUICK_COLOR_SLOTS.forEach((slot, i) => {
            const btn = toolbarEl.querySelector(`button[data-type="${slot.hk.langKey}"]`) as HTMLButtonElement | null;
            if (!btn) return;
            // 不用 fn__none：内核「条目可见性」设置同用 fn__none 管隐藏，互写会打架（MindWire 评审 P1-4）；
            // style.display 独立通道，用户在外观设置里隐藏本钮后插件不再顶回
            btn.style.display = inEditor ? "" : "none";
            btn.style.setProperty(QUICK_COLOR_DOT_VAR, colors[i]);
            ensureDot(btn);
            const label = labels[i];
            if (btn.getAttribute("aria-label") !== label) btn.setAttribute("aria-label", label);
        });
    }
}

/** window 的当前选区；没有就 null。先判 rangeCount 再取：没选区时 getRangeAt(0) 会抛 IndexSizeError
 *  （MindWire currentTextRange 同款） */
function currentRange(): Range | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return sel.getRangeAt(0);
}

/** 窗口里现在的选区，要过了有效性判定（有字、在同一个块里、不在代码块里）且落在本编辑器里才算数
 *  （分屏下别把 A 屏选区写进 B 屏事务）；没有就 null */
function currentRangeIn(protyle: IProtyle): Range | null {
    const sel = normalizeWordRange(currentRange());
    return sel && protyle?.wysiwyg?.element?.contains(sel.startContainer) ? sel : null;
}

/** 工具条钮上色用的选区：点钮会吞选区（焦点漂移），窗口选区没了就回退 protyle.toolbar.range——内核划词
 *  渲染时留的那份（Toolbar.render），内核自己的工具条上色读的也是它；过同一有效性判定（含脱离文档
 *  拦截）。只给点钮这条路用，命令通道不回退（见 applyFromCommand） */
function toolbarRange(protyle: IProtyle): Range | null {
    return currentRangeIn(protyle) ?? normalizeWordRange(protyle?.toolbar?.range);
}

class QuickColor {
    private plugin: BaseTomatoPlugin;
    /** 划词工具条补态监听：document 级 selectionchange，onunload 摘除 */
    private onSelectionChange = () => this.syncToolbar();

    private syncToolbar() {
        syncQuickColorToolbar(getAllEditor().map(({ protyle }) => protyle), currentRange());
    }

    /** 上色：总开关关着直接返回；没有效选区不写。有选区 → 按选区位置定该用哪个编辑器 → 把选区副本
     *  交给内核 → 走思源自带的文字颜色接口（和外观面板点色块同一条路：Font.ts appearanceMenu）。交副本是
     *  因为写标记会重建块里的文本节点，原选区对象不能直接给出去。选区由两个入口各自取好递进来。
     *
     *  编辑器不能直接用递进来的那个（2026-11-27 mw-small 实测，内核 3.8.12；评审复查）：鼠标点进表格
     *  单元格后，这一格换成内层小编辑器，块 id 是临时的。命令面板执行前内核先把选区恢复回来，递给命令的
     *  却是外层编辑器——选区嵌在外层正文里，「选区落在本编辑器里」的判定拦不住，拿外层写＝把临时块 id
     *  当真块发给内核，内核报「load tree […] failed: block not found」弹关不掉的「状态异常」。所以和连线
     *  同一个判定（markTarget，mindWireLite.ts）：这一格右键过、内核把内层编辑器递给了插件 → 走内层
     *  写；没右键过拿不到 → 不写、提示（内层编辑器只有菜单事件里内核才递给插件，别的入口都拿不到）。
     *  落在别的内层编辑器里（列表脑图节点等）也不写：拿外层写内核会弹「内容已更新，请重新编辑」的错误条。
     *  两种情况各给一句提示 */
    private paint(protyle: IProtyle, range: Range | null, slot: QuickColorSlotNo) {
        if (!quickColorEnable.get()) return;
        if (!range) return;
        const { writer, block } = markTarget(range.startContainer, protyle);
        if (!writer) {
            debugLog("quickcolor", `paint slot=${slot} skip: lite editor (${block}) not writable`, "quickcolor");
            siyuan.pushMsg(block === "cell" ? tomatoI18n.表格单元格用工具条外观钮上色 : tomatoI18n.这里不支持快捷上色);
            return;
        }
        if (!writer?.toolbar?.setInlineMark) return;
        const color = quickColorValue(QUICK_COLOR_SLOTS[slot - 1].color.get());
        try {
            writer.toolbar.range = range.cloneRange();
            writer.toolbar.setInlineMark(writer, "text", "range", { type: "color", color });
        } catch (err) {
            debugLog("quickcolor", `apply slot=${slot} error ${err}`, "quickcolor");
        }
    }

    /** 工具条钮通道：点钮会吞选区，窗口选区没了就回退内核留存的那份（toolbarRange） */
    applyFromToolbar(protyle: IProtyle, slot: QuickColorSlotNo) {
        this.paint(protyle, toolbarRange(protyle), slot);
    }

    /** 命令通道（快捷键、命令面板都经 editorCallback 进来）：只认窗口里现在的选区。这条路没有东西顶掉
     *  选区，不回退内核留存的 toolbar.range——那份只在鼠标松开时刷新（app/src/protyle/wysiwyg/index.ts），
     *  用户按方向键把选区收起后它还是上一次选的字；回退它＝没选字按快捷键也给上一次选的字上色、写进
     *  笔记（2026-11-27 评审实测） */
    applyFromCommand(protyle: IProtyle, slot: QuickColorSlotNo) {
        this.paint(protyle, currentRangeIn(protyle), slot);
    }

    /** 官方划词工具条扩展（Plugin.updateProtyleToolbar 委托自 index.ts）：内核在工具条构建和
     *  插件装卸时调，每次都按当时的前端形态给项——移动端不给（文件头「移动端」一段） */
    updateProtyleToolbar(toolbar: Array<string | IMenuItem>): Array<string | IMenuItem> {
        toolbar.push(...quickColorToolbarItems(getFrontend()));
        return toolbar;
    }

    async onload(plugin: BaseTomatoPlugin) {
        // 补态监听先于后面任何一步挂上：工具条项恒附（内核已收项），总开关关着的冷启动若无监听，
        // 四个钮会裸露成点了没反应的死钮；同步体里读开关，关着就自动隐藏
        document.addEventListener("selectionchange", this.onSelectionChange);
        this.plugin = plugin;
        // 单元格里右键时内核递来的是这一格的内层编辑器，记下来，上色按选区位置取用（paint →
        // markTarget，mindWireLite.ts）。不借思维导线那个登记监听：那个要思维导线总开关开着才挂，
        // 快捷颜色是独立功能、不看那三个开关
        this.plugin.eventBus.on("open-menu-content", ({ detail }) => {
            rememberLiteProtyle((detail as any)?.protyle);
        });
        await verifyKeyTomato()
        // 四个命令＝四个槽，editorCallback 不弹菜单、选区不被顶掉，比工具条钮还稳。
        // langKey 与工具条项的 name 相同：键位表里是同一个条目
        QUICK_COLOR_SLOTS.forEach((slot, i) => {
            gatedAddCommand(this.plugin, slot.hk.langKey, {
                langText: slot.hk.langText(),
                hotkey: slot.hk.m,
                editorCallback: (protyle: IProtyle) => this.applyFromCommand(protyle, (i + 1) as QuickColorSlotNo),
            });
        });
    }

    onunload() {
        document.removeEventListener("selectionchange", this.onSelectionChange);
    }
}

export const quickColor = new QuickColor();
