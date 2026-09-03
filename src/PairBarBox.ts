// PairBarBox —— 块配对功能优先浮条控制器（□2 V1 + □3 V2 + 二轮 □3 双槽 + R3 □2 V4 功能优先）。
// 职责：四入口（快捷键/状态栏/内容右键/块 icon 菜单）→ 同一触发器推进一步；
// V4 模型：出场=六功能面板（配默认功能直跳框态；R4 起「上次功能」直跳退役、只存面板高亮）
// → 点功能按框数进框态（两框=[源可多,目标]、三框=搬运[起始,结束,目标]）→ ✓ 确认或快捷键
// 框齐即执行。无选区无光标时「最近用过的块」伪预填第一框（R4，stash>最近块>空）。
// 填框通道：点编辑器块回填焦点框（click_editorcontent）、gutter 拖块进指定框、
// 拖源 chip 到编辑器块=填目标框；选区暂存出场记、点功能后消费。三框区间解析
// （wysiwyg 顶层平铺闭区间+跨文档拦截）与区间预览数在本层（纯函数层收已解析 ids）。
// 执行链统一 execConfirm→execChain（含源=目标祖先/子孙拦截）；「上次功能/最近源块」petal 持久。
// 浮条挂 body（命令式组件，三层防线清理）。设计定稿：memory pairbar-r3-func-first-design。
import { IProtyle, Menu, getAllEditor } from "siyuan";
import { mount, unmount } from "svelte";
import { get, writable } from "svelte/store";
import { events, EventType } from "./libs/Events";
import { DATA_NODE_ID } from "./libs/gconst";
import {
    PAIR_FUNCS,
    SIYUAN_GUTTER_PREFIX,
    buildTransportOps,
    clampPos,
    gutterDropIDs,
    initialPairState,
    isRelatedTarget,
    pairBackToFuncs,
    pairBoxCount,
    pairCancel,
    pairClearBox,
    pairConfirm,
    pairFillBox,
    pairFirstEmpty,
    pairPickFunc,
    pairRangeSyncWanted,
    pairSetMode,
    pairTrigger,
    resolveRangeIDs,
    type PairErr,
    type PairEvent,
    type PairFuncID,
    type PairState,
    type PairTransportMode,
} from "./libs/pairBarState";
import {
    bilinkWithInsertingRefs,
    getTomatoPluginConfig,
    linkTwoElementsWithRef,
    siyuan,
} from "./libs/utils";
import * as utils from "./libs/utils";
import {
    pairBarDefaultFunc,
    pairBarEnabled,
    pairBarEntryHotkey,
    pairBarEntryIconMenu,
    pairBarEntryMenu,
    pairBarEntryStatus,
    pairBarLastFunc,
    pairBarLastSrcID,
} from "./libs/stores";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { lastVerifyResult } from "./libs/user";
import { winHotkey } from "./libs/winHotkey";
import { addIfVisible } from "./libs/menuManager";
import { openHelpDialog } from "./libs/helpDialog";
import helpDocs from "./help.json";
import { tomatoI18n } from "./tomatoI18n";
import {
    LinkBox修复双向链接,
    LinkBox删除双向链接,
    LinkBox链接到块底部,
    LinkBox双向互链选择块,
    LinkBox双向互链创建往返链,
    LinkBox嵌入互链选择,
    LinkBox嵌入互链创建,
    LinkBox关联两个块选择,
    LinkBox关联两个块创建,
    LinkBox互相插入引用于下方选择,
    LinkBox互相插入引用于下方创建,
    LinkBox查看所有同步位置,
    LinkBox同步块选择,
    LinkBox同步块创建,
    linkBox,
} from "./LinkBox";
import {
    CpBox批量删除大量连续内容块,
    CpBox批量移动大量连续内容块,
    CpBox批量复制大量连续内容块,
    LongContentOpsLock,
} from "./CpBox";
import { getPairCmd } from "./libs/pairCmdRegistry";
import PairBar from "./PairBar.svelte";

// 默认键位 ⌥⇧V：四插件 winHotkey 全量 + 官方 keymap 排除后 alt+shift 系唯一空位
// （⌥⇧P 被官方命令面板占用，其余字母/数字/标点均被占；键位可在思源键位表改）
export const PairBar触发 = winHotkey("alt+shift+v", "pairBarTrigger", "iconBoth", () => tomatoI18n.块配对浮条);

const BAR_ROOT_ID = "tomato-pair-bar-root";
const GB_CLEANUP_KEY = "tomatoPairBarCleanup";
const DROP_HINT_CLS = "tomato-pairbar-droptarget";
// 帮助文档（体验增强 □2）：篇目含用法速览/六功能一览/小贴士；token 快照已在 help.json
const PAIRBAR_HELP_URL = "https://awx9773btw.feishu.cn/docx/TYSCdAHHFoZUhrxy7IdcBri6n1c";

type PairBarApi = {
    /** funcs 面板点功能钮 → 进框态（换功能时控制器带区间映射） */
    pickFunc: (id: PairFuncID) => void;
    /** slots 态点当前功能图标 → 回 funcs 面板换功能 */
    backToFuncs: () => void;
    /** ✓ 显式确认即执行 */
    confirm: () => void;
    clearBox: (slot: 1 | 2 | 3) => void;
    cancel: () => void;
    /** 搬运三档切换（R5 □2）：纯视图态，切档不触发框间映射 */
    setMode: (mode: PairTransportMode) => void;
    dragStart: () => void;
    dragEnd: () => void;
    /** 框位 dragover/drop（拖块进框：认领思源 gutter 块拖拽，控制器判 MIME+preventDefault） */
    slotDragOver: (e: DragEvent, slot: 1 | 2 | 3) => void;
    slotDrop: (e: DragEvent, slot: 1 | 2 | 3) => void;
    /** ⋯ 溢出菜单：3 条单功能+分隔线+帮助 */
    more: (anchor: HTMLElement) => void;
    /** 背景空白区拖动起步（组件已排除 button/chip 并 preventDefault） */
    barDragStart: (e: { clientX: number; clientY: number }) => void;
    /** 触摸版起步（含双 tap=清记忆回默认检测，click 系 touch 不派发） */
    barTouchStart: (e: TouchEvent) => void;
    /** 双击背景=清记忆回默认位 */
    barResetPos: () => void;
};

class PairBarBox {
    private plugin: BaseTomatoPlugin;
    private state = writable<PairState>(initialPairState);
    private target: HTMLElement | null = null;
    private app: any = null;
    private statusBtn: HTMLElement | null = null;
    private unsubs: (() => void)[] = [];
    /** execChain 重入哨兵（✓/触发键三步合一/多入口并发防双重执行） */
    private busy = false;
    /** 我们的 chip 拖拽中（document dragover/drop 只在此态响应，内核自家拖拽零干扰） */
    private dragging = false;
    /** dragstart 时预解析的源 DOM 缓存（dragover 高亮判定用；光标拖拽中不动，解析一次够） */
    private dragSrc: (HTMLElement | null)[] | null = null;
    /** 当前高亮的目标块 */
    private dropHint: HTMLElement | null = null;
    /** 位置拖动中（体验增强 □2：仅背景空白区 mousedown/touchstart 启动） */
    private posDragging = false;
    private posGrab = { dx: 0, dy: 0 };
    private posStartPt = { x: 0, y: 0 };
    /** 拖动实际位移过才持久化（单击背景不产生记忆，防「没拖过却记住默认位」） */
    private posMoved = false;
    /** 触摸双 tap 检测（touch 不派发 click/dblclick，须手写） */
    private lastTapAt = 0;

    async onload(plugin: BaseTomatoPlugin) {
        this.plugin = plugin;

        // 入口 1：快捷键（命令恒注册保键位表可改；入口开关只拦行为）
        this.plugin.addCommand({
            langKey: PairBar触发.langKey,
            langText: PairBar触发.langText(),
            hotkey: PairBar触发.m,
            callback: () => {
                if (!pairBarEntryHotkey.get()) return;
                void this.trigger();
            },
        });

        // 入口 2：状态栏按钮
        this.mountStatusButton();

        // 入口 3：内容右键菜单
        this.plugin.eventBus.on(EventType.open_menu_content, ({ detail }) => {
            if (!pairBarEntryMenu.get()) return;
            this.addMenuItem(detail);
        });

        // 入口 4：块 icon 菜单（click-blockicon，左键点块前小圆点唤出，非右键——□11 勘误口径）
        this.plugin.eventBus.on(EventType.click_blockicon, ({ detail }) => {
            if (!pairBarEntryIconMenu.get()) return;
            this.addMenuItem(detail);
        });

        // 点编辑器块回填进焦点框（引导模式的「点块推进」吸收为常驻行为，不再是设置开关）。
        // 焦点框为 null（框齐）时点块不改框——治旧 target 态点块即执行的误触病根。
        // 浮条在 body 下不在编辑器内，点浮条自身不触发本事件。
        this.plugin.eventBus.on(EventType.click_editorcontent, ({ detail }) => {
            const cur = get(this.state);
            if (cur.phase !== "slots" || cur.focusSlot === null) return;
            const protyle = (detail as any)?.protyle ?? this.curProtyle();
            if (!protyle) return;
            void this.fillFromEditor(cur.focusSlot, protyle);
        });
    }

    onunload() {
        this.hideBar();
        delete (globalThis as any)[GB_CLEANUP_KEY];
        // SiYuan addStatusBar 只 push 不移除，同步摘防 detached 节点驻留（TomatoClock 先例）
        this.statusBtn?.remove();
        const arr = (this.plugin as any)?.statusBarIcons as Element[];
        const i = arr?.indexOf(this.statusBtn ?? null) ?? -1;
        if (i >= 0) arr.splice(i, 1);
        this.statusBtn = null;
        this.unsubs.forEach(u => u());
        this.unsubs = [];
    }

    private addMenuItem(detail: any) {
        if (!pairBarEnabled.get()) return;
        addIfVisible(detail?.menu, PairBar触发.langKey, {
            icon: "iconBoth",
            accelerator: PairBar触发.m,
            label: PairBar触发.langText(),
            click: () => void this.trigger(),
        });
    }

    private mountStatusButton() {
        const t = document.createElement("template");
        t.innerHTML = `<div class="toolbar__item ariaLabel"><svg><use xlink:href="#iconBoth"></use></svg></div>`;
        const el = t.content.firstElementChild as HTMLElement;
        el.addEventListener("click", () => {
            if (!pairBarEntryStatus.get()) return;
            void this.trigger();
        });
        this.plugin.addStatusBar({ element: el, position: "left" });
        this.statusBtn = el;
        this.syncStatusLabel();
        // 开关正交：总开关/入口开关即时控制显隐（免 reload）
        const sync = () => {
            el.style.display = pairBarEnabled.get() && pairBarEntryStatus.get() ? "" : "none";
        };
        this.unsubs.push(pairBarEnabled.subscribe(sync), pairBarEntryStatus.subscribe(sync));
        // 总开关中途关闭：已开的浮条即时收（状态栏钮已有 sync，浮条本体补同款联动）
        this.unsubs.push(pairBarEnabled.subscribe(v => { if (!v) this.hideBar(); }));
        sync();
    }

    /** 状态栏 tooltip = 名称 + 快捷键（二轮 □1）：键位文本与键帽提示/浮条 hint 同源
     *  （PairBar触发.w() 现读 keymap，改键跟随）；.w() 只在调用时求值，浮条每次出场
     *  顺路刷新（showBar 调用），防改键后 tooltip 停留旧键位 */
    private syncStatusLabel() {
        this.statusBtn?.setAttribute("aria-label", `${tomatoI18n.块配对浮条} ${PairBar触发.w()}`);
    }

    /** 同一触发器推进一步（快捷键/状态栏/菜单共用）：idle 出场（funcs 面板或默认功能
     *  直跳框态）/ funcs 收面板 / slots 填下一空框（框齐即执行=拍板 A 三步合一） */
    async trigger() {
        if (!pairBarEnabled.get()) return;
        let cur = get(this.state);
        const opts = {
            defaultFunc: (pairBarDefaultFunc.get() || "") as PairFuncID | "",
            vip: lastVerifyResult() === true,
        };
        if (cur.phase === "idle") {
            const protyle = this.curProtyle();
            if (!protyle) {
                await siyuan.pushMsg(tomatoI18n.请先打开文档);
                return;
            }
            let ev: PairEvent = await this.readEv(protyle);
            // R4 预填兜底：无选区无光标时用「最近用过的块」合成伪事件（优先级 stash >
            // 最近块 > 空；cursorOnly 语义=两框/三框都只填第一框），供直跳预填/funcs 点功能消费
            if (ev.ids.length === 0) ev = await this.lastSrcEvent() ?? ev;
            // await 后复查（R4 评审 P1-2）：lastSrcEvent 可走内核网络拉长 await 窗口，双触发
            // （长按 key-repeat/快捷键+状态栏并发）第二发携 idle 旧快照返回会把第一发已直跳的
            // slots 打回 funcs / Esc 收条后浮条复活——idle 分支不再幂等，同 slots 分支防线
            if (get(this.state).phase !== "idle") return;
            const r = pairTrigger(cur, ev, opts);
            this.state.set(r.state);
            this.showBar();
            // 默认功能直跳框态的三框（搬运）：预填起止后解析区间预览
            if (r.state.phase === "slots") void this.syncRangeCount();
            return;
        }
        if (cur.phase === "funcs") {
            this.cancel();
            return;
        }
        // slots：填下一空框（须读选区）；框齐裸按=直接执行（不需要选区，ev 传空）
        let k = pairFirstEmpty(cur);
        let ev: PairEvent = { ids: [] };
        if (k) {
            const protyle = this.curProtyle();
            if (!protyle) {
                await siyuan.pushMsg(tomatoI18n.请先打开文档);
                return;
            }
            ev = await this.readEv(protyle);
            // readEv 可走内核网络（title 缺失/块 detached 时百 ms 级窗口）：await 后重读
            // 复查——间隙 Esc/关总开关已回 idle 时，旧快照 set 回去=「浮条已收 state 残留
            // slots」幽灵态（监听已摘无 UI 通道再取消）；idle 分支同款防线（R4 起 lastSrcEvent
            // 拉长窗口、直跳场景不幂等，见上）
            cur = get(this.state);
            if (cur.phase !== "slots") return;
            k = pairFirstEmpty(cur);
        }
        const r = pairTrigger(cur, ev, opts);
        if (r.err) {
            await this.toastErr(r.err, cur.func);
            return;
        }
        if (r.runFunc) {
            // confirm 只回 idle，执行所需的框数据从转移前状态重建（pairFillBox 纯函数无副作用）
            const filled = k ? pairFillBox(cur, k, ev).state : cur;
            await this.execConfirm(filled, r.runFunc);
            return;
        }
        this.state.set(r.state);
        // 填的是起/止框且起止齐 → 解析区间并提示跨文档。□1 顺序洞：只认槽 2 会令
        // 「先结束框后起始框」的填法 rangeCount 恒 null（✓ 三档恒灰）；填目标框不触发
        //（起止未变，防重复跨文档提示）
        if (k !== 3 && pairRangeSyncWanted(r.state)) void this.syncRangeCount(true);
    }

    /** 点编辑器块回填进焦点框（两框源框多块整组入；焦点框有内容=直接覆盖） */
    private async fillFromEditor(slot: 1 | 2 | 3, protyle: IProtyle) {
        if (get(this.state).phase !== "slots") return;
        const ev = await this.readEv(protyle);
        // await 后重读复查（Esc/关总开关已回 idle 时旧快照写回=幽灵 slots 态，slotDrop 同款范式）
        const cur = get(this.state);
        if (cur.phase !== "slots") return;
        const r = pairFillBox(cur, slot, ev);
        if (r.err) {
            await this.toastErr(r.err, cur.func);
            return;
        }
        this.state.set(r.state);
        // □1 顺序洞：填起/止任一框且起止齐即解析（槽 1 后填同样触发）；目标框不触发防重复跨文档提示
        if (slot !== 3 && pairRangeSyncWanted(r.state)) void this.syncRangeCount(true);
    }

    /** 框位 dragover：认领思源 gutter 块拖拽才放行（AV 族变体键解析不出块 id 不认领，
     *  dropEffect copy 增殖可拖视觉） */
    slotDragOver(e: DragEvent, _slot: 1 | 2 | 3) {
        const types = [...(e.dataTransfer?.types ?? [])];
        const mime = types.find(t => t.startsWith(SIYUAN_GUTTER_PREFIX));
        if (!mime || gutterDropIDs(mime).length === 0) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    }

    /** 框位 drop：从 gutter MIME 键名解析块 id 填该框（两框源框多块整组入） */
    async slotDrop(e: DragEvent, slot: 1 | 2 | 3) {
        const types = [...(e.dataTransfer?.types ?? [])];
        const mime = types.find(t => t.startsWith(SIYUAN_GUTTER_PREFIX));
        if (!mime) return;
        e.preventDefault();
        e.stopPropagation();
        const ids = gutterDropIDs(mime);
        if (ids.length === 0) return;
        const summary = await this.summaryOfID(ids[0]);
        // 多块进三框框 1：结束框 chip 须显末块文本（summaryLast）
        const summaryLast = ids.length > 1 ? await this.summaryOfID(ids[ids.length - 1]) : summary;
        const cur = get(this.state);
        const r = pairFillBox(cur, slot, { ids, summary, summaryLast });
        if (r.err) {
            await this.toastErr(r.err, cur.func);
            return;
        }
        this.state.set(r.state);
        // □1 顺序洞：填起/止任一框且起止齐即解析（多块整组进框①=首末同时进起止，原 slot===2 判据漏此路径）
        if (slot !== 3 && pairRangeSyncWanted(r.state)) void this.syncRangeCount(true);
    }

    /** chip ✕ 删框：清该框焦点落回（PairBar 组件回调） */
    clearBox(slot: 1 | 2 | 3) {
        this.state.update(s => pairClearBox(s, slot));
    }

    /** funcs 面板点功能钮 → 进框态（3→2 换功能带区间解析结果整段进源框） */
    async pickFunc(funcID: PairFuncID) {
        let cur = get(this.state);
        if (cur.phase !== "funcs") return;
        const opts: { rangeIDs?: string[] } = {};
        if (cur.func === "transport" && cur.srcIDs[0] && cur.endID && funcID !== "transport") {
            const range = await this.resolveRange(cur.srcIDs[0], cur.endID);
            if (range) opts.rangeIDs = range;
        }
        // resolveRange 可走内核 DOM 解析：await 后重读复查（回 funcs 后再 Esc=收浮条，
        // 旧快照写回=幽灵 funcs/slots 态，fillFromEditor 同款防线）
        cur = get(this.state);
        if (cur.phase !== "funcs") return;
        const r = pairPickFunc(cur, funcID, this.gates(), opts);
        if (r.err) {
            await this.toastErr(r.err, funcID);
            return;
        }
        this.state.set(r.state);
        void this.syncRangeCount();
        await this.syncEndSummary();
    }

    /** 2→3 换功能映射后补正结束框摘要：状态只存首块摘要（srcSummary），多源映射时
     *  结束块 chip 会张冠李戴显首块文本（2026-09-01 vision P0-2），末块文本须现查。
     *  末块 detached 时 summaryOfID 返空串不写（残留首块文本属可接受降级——块已不可解析） */
    private async syncEndSummary() {
        const cur = get(this.state);
        if (cur.phase !== "slots" || pairBoxCount(cur.func) !== 3 || !cur.endID || cur.endID === cur.srcIDs[0]) return;
        const text = await this.summaryOfID(cur.endID);
        if (text && text !== cur.endSummary) {
            this.state.update(s => (s.endID === cur.endID ? { ...s, endSummary: text } : s));
        }
    }

    /** slots 态点当前功能图标 → 回 funcs 面板（数据保留：重选恢复/换功能映射） */
    backToFuncs() {
        this.state.update(pairBackToFuncs);
    }

    /** ✓ 显式确认即执行（组件回调；框齐钮才亮，纯函数层全量校验兜底） */
    async confirm() {
        const cur = get(this.state);
        if (cur.phase !== "slots") return;
        const r = pairConfirm(cur, this.gates());
        if (r.err) {
            await this.toastErr(r.err, cur.func);
            return;
        }
        if (r.runFunc) await this.execConfirm(cur, r.runFunc);
    }

    cancel() {
        this.state.set(pairCancel(get(this.state)));
        this.hideBar();
    }

    setMode(mode: PairTransportMode) {
        this.state.update(s => pairSetMode(s, mode));
    }

    // ---------------- 三框区间解析（wysiwyg 顶层平铺序闭区间） ----------------

    /** 起始块所在 wysiwyg 的顶层平铺 id 序 → resolveRangeIDs 闭区间。起始块解析不到
     *  活编辑器（文档已关）→ null（与跨文档统一拦截，提示走起止须同文档） */
    private async resolveRange(startID: string, endID: string): Promise<string[] | null> {
        if (!startID || !endID) return null;
        const startDiv = await this.resolveDivByID(startID);
        const wysiwyg = startDiv?.closest(".protyle-wysiwyg") as HTMLElement | null;
        if (!wysiwyg) return null;
        const flat = ([...wysiwyg.querySelectorAll(":scope > div[data-node-id]")] as HTMLElement[])
            .map(d => d.getAttribute(DATA_NODE_ID))
            .filter(Boolean) as string[];
        return resolveRangeIDs(startID, endID, flat);
    }

    /** 三框起止齐后回填区间预览数（✓ 影响面文本「移动 N 块」）；解析失败置 null。
     *  warnCrossDoc：由填起/止框的动作调用时提示起止不同文档（其余路径静默） */
    private async syncRangeCount(warnCrossDoc = false): Promise<void> {
        const cur = get(this.state);
        if (!pairRangeSyncWanted(cur)) {
            if (cur.rangeCount !== null) this.state.update(s => ({ ...s, rangeCount: null }));
            return;
        }
        const range = await this.resolveRange(cur.srcIDs[0], cur.endID);
        const n = range ? range.length : null;
        // await 窗口内起/止框被改（清框重填/覆盖）时旧解析结果不得写回（慢 sync 后落
        // 会压掉新对的预览数，旧 null 落最后=✓ 卡灰——同款症状的窄产道，评审 P1；
        // syncEndSummary 同款「对身份」守卫先例）
        this.state.update(s => (s.srcIDs[0] === cur.srcIDs[0] && s.endID === cur.endID
            ? (s.rangeCount === n ? s : { ...s, rangeCount: n })
            : s));
        if (!range && warnCrossDoc) await siyuan.pushMsg(tomatoI18n.起止须同文档);
    }

    // ---------------- ⋯ 溢出菜单（体验增强 □2：3 条单功能+帮助） ----------------

    /** ⋯ 钮：菜单项恒显示（拍板），门禁在点击时查。构造三坑走 helpMenu.ts 同款：
     *  independent 第三参防单例被同次 click 冒泡清空；open 包 setTimeout 防边缘。 */
    more(anchor: HTMLElement) {
        const menu = new (Menu as any)("tomatoPairBarMore", undefined, true) as Menu;
        menu.addItem(this.quickRefItem());
        menu.addItem({
            label: LinkBox链接到块底部.langText(),
            accelerator: LinkBox链接到块底部.m,
            click: () => void this.runOverflowCmd("lnk2bottom"),
        });
        menu.addItem({
            label: LinkBox修复双向链接.langText(),
            accelerator: LinkBox修复双向链接.m,
            click: () => void this.runOverflowCmd("fixLnk"),
        });
        menu.addItem({
            label: LinkBox删除双向链接.langText(),
            accelerator: LinkBox删除双向链接.m,
            click: () => void this.runOverflowCmd("delLnk"),
        });
        menu.addSeparator();
        menu.addItem({
            label: tomatoI18n.帮助,
            click: () => openHelpDialog(PAIRBAR_HELP_URL, helpDocs),
        });
        const rect = anchor.getBoundingClientRect();
        setTimeout(() => menu.open({ x: rect.left, y: rect.bottom + 4 }), 0);
    }

    /** 快捷键速查子菜单（R5 □3）：四组=浮条触发+互链族 8+同步块 3+长内容 3，项可点执行。
     *  键位 .w() 现读 keymap（每次点 ⋯ 现构造菜单=永远新鲜，沿状态栏 tooltip 先例）；
     *  点击查 langKey→callback 注册表直调（登记点=LinkBox/CpBox addCommand，总开关关
     *  =表空=落空，正确语义）；VIP 门禁（嵌入互链）在命令 callback 内部自验不变。
     *  组名用 disabled 菜单项（灰显不可点=纯标题语义）。 */
    private quickRefItem(): any {
        type Hk = { langKey: string; langText(): string; w(): string };
        const groups: Array<[string, Hk[]]> = [
            [tomatoI18n.互链族, [
                LinkBox双向互链选择块, LinkBox双向互链创建往返链,
                LinkBox嵌入互链选择, LinkBox嵌入互链创建,
                LinkBox关联两个块选择, LinkBox关联两个块创建,
                LinkBox互相插入引用于下方选择, LinkBox互相插入引用于下方创建,
            ]],
            [tomatoI18n.同步块, [
                LinkBox查看所有同步位置, LinkBox同步块选择, LinkBox同步块创建,
            ]],
            [tomatoI18n.长内容工具, [
                CpBox批量删除大量连续内容块, CpBox批量移动大量连续内容块, CpBox批量复制大量连续内容块,
            ]],
        ];
        const submenu: any[] = [{
            label: PairBar触发.langText(),
            icon: PairBar触发.icon,
            accelerator: PairBar触发.w(),
            // 浮条已开着：点击=同一触发器推进一步（funcs 收面板/slots 填下一空框），与快捷键/状态栏同款
            click: () => void this.trigger(),
        }];
        for (const [group, cmds] of groups) {
            submenu.push({ type: "separator" }, { label: group, disabled: true });
            for (const c of cmds) {
                submenu.push({
                    label: c.langText(),
                    accelerator: c.w(),
                    click: () => this.runQuickCmd(c.langKey),
                });
            }
        }
        return { label: tomatoI18n.快捷键速查, icon: "iconKeymap", submenu };
    }

    /** 速查直调（R5 □3）：先收浮条再执行（一次性操作不进接力流，沿 runOverflowCmd 先例）；
     *  editorCallback 型命令传当前 protyle，callback 型（长内容）忽略该参 */
    private runQuickCmd(langKey: string) {
        const fn = getPairCmd(langKey);
        if (!fn) return;
        const protyle = this.curProtyle();
        this.hideBar();
        void fn(protyle);
    }

    /** 3 条单功能执行链（LinkBox 老命令开放直调）：源解析（框 1 优先，
     *  框空取当前光标块新鲜读）→先收浮条再执行（一次性操作不进接力流） */
    private async runOverflowCmd(func: "lnk2bottom" | "fixLnk" | "delLnk") {
        const cur = get(this.state);
        let div: HTMLElement | null = null;
        if (cur.srcIDs.length > 0) {
            div = (await this.resolveDivsOf([cur.srcIDs[0]]))[0] ?? null;
        } else {
            const p = this.curProtyle();
            if (p) {
                const { selected } = await events.selectedDivs(p);
                div = selected?.[0] ?? null;
            }
        }
        if (!div) {
            await siyuan.pushMsg(tomatoI18n.请先选中块);
            return;
        }
        const protyle = this.curProtyle();
        if (!protyle) {
            await siyuan.pushMsg(tomatoI18n.请先打开文档);
            return;
        }
        this.hideBar();
        try {
            if (func === "lnk2bottom") {
                // 「块底部」=源所在文档底部：锁源在 A 切页签到 B 时不得漂到 B（评审 P2-3）；
                // 源文档已关（detached 兜底 div）时 find 落空回退当前文档（可接受降级）
                const srcProtyle = getAllEditor().find(p => p.protyle?.element?.contains(div))?.protyle;
                await linkBox.link2bottom(srcProtyle ?? protyle, div);
            }
            else if (func === "fixLnk") await linkBox.fixLnk(protyle, div);
            else await linkBox.delLnk(protyle, div);
        } catch (e) {
            console.error("[pairBar] overflow cmd failed:", e);
            await siyuan.pushMsg(tomatoI18n.源块不可用);
        }
    }

    // ---------------- 位置拖动+记忆（体验增强 □2：桌面/移动各记一份） ----------------

    /** 悬浮球 key 模式（FloatingBallHelper 先例）：pairBarPos_{isMobile}_x/y，存数字 */
    private posKey(k: "x" | "y") {
        return `pairBarPos_${events.isMobile}_${k}`;
    }

    private barEl(): HTMLElement | null {
        return this.target?.querySelector(".tomato-pairbar") ?? null;
    }

    /** 位置 → 行内样式（含视口钳制）；清 translateX(-50%) 居中，left/top 直接生效 */
    private applyBarPos(x: number, y: number, bar: HTMLElement) {
        const p = clampPos(x, y, window.innerWidth, window.innerHeight, bar.offsetWidth, bar.offsetHeight);
        bar.style.left = `${p.x}px`;
        bar.style.top = `${p.y}px`;
        bar.style.transform = "none";
        return p;
    }

    /** 出场应用记忆位置（钳制进视口）；无记忆=CSS 默认 76px 居中不动 */
    private restoreSavedPos() {
        const cfg = getTomatoPluginConfig() as any;
        const x = cfg[this.posKey("x")];
        const y = cfg[this.posKey("y")];
        if (typeof x !== "number" || typeof y !== "number") return;
        const bar = this.barEl();
        if (bar) this.applyBarPos(x, y, bar);
    }

    barDragStart(e: { clientX: number; clientY: number }) {
        const bar = this.barEl();
        if (!bar) return;
        const rect = bar.getBoundingClientRect();
        this.posDragging = true;
        this.posMoved = false;
        this.posGrab = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
        this.posStartPt = { x: e.clientX, y: e.clientY };
        // CSS 默认（left:50%+translateX）先固化成行内像素，后续 left/top 直接覆盖
        this.applyBarPos(rect.left, rect.top, bar);
    }

    /** 触摸起步：先做双 tap 检测（touch 不派生 dblclick），双 tap=清记忆回默认；
     *  多指（pinch 误触）不当事——第二指 touchstart 距首指 <350ms 会误判双 tap。
     *  targetTouches 限浮条自身触点（touches 是全页面触点，他处按住会误判多指） */
    barTouchStart(e: TouchEvent) {
        if (e.targetTouches.length > 1) return;
        const t = e.touches[0];
        const now = performance.now();
        if (now - this.lastTapAt < 350) {
            this.lastTapAt = 0;
            this.barResetPos();
            return;
        }
        this.lastTapAt = now;
        this.barDragStart(t);
    }

    private onPosMove = (e: { clientX: number; clientY: number }) => {
        if (!this.posDragging) return;
        // 丢 mouseup 自愈（拖动中切窗/他处释放）：buttons=0 即无键按住，收尾防追鼠标
        const btns = (e as MouseEvent).buttons;
        if (typeof btns === "number" && btns === 0) {
            this.onPosUp();
            return;
        }
        const bar = this.barEl();
        if (!bar) return;
        if (Math.abs(e.clientX - this.posStartPt.x) > 2 || Math.abs(e.clientY - this.posStartPt.y) > 2) {
            this.posMoved = true;
        }
        this.applyBarPos(e.clientX - this.posGrab.dx, e.clientY - this.posGrab.dy, bar);
    };

    /** document 级 touchmove 须显式 passive:false 才能防页面滚动 */
    private onPosTouchMove = (e: TouchEvent) => {
        if (!this.posDragging) return;
        e.preventDefault();
        this.onPosMove(e.touches[0]);
    };

    private onPosUp = () => {
        if (!this.posDragging) return;
        this.posDragging = false;
        const bar = this.barEl();
        // 单击背景（未拖动）：清行内样式后回写记忆位（无记忆=还原 CSS 默认）——
        // 无条件只清会让记忆位出场闪跳回默认（复评回归：key 还在，下次出场又跳回）
        if (!this.posMoved) {
            if (bar) {
                bar.style.left = "";
                bar.style.top = "";
                bar.style.transform = "";
            }
            this.restoreSavedPos();
            return;
        }
        if (!bar) return;
        const rect = bar.getBoundingClientRect();
        const p = this.applyBarPos(rect.left, rect.top, bar); // 松手钳制进视口再存
        const cfg = getTomatoPluginConfig() as any;
        cfg[this.posKey("x")] = p.x;
        cfg[this.posKey("y")] = p.y;
        void pairBarEnabled.write(); // 任意 key 保存整体（FloatingBallHelper mouseup 先例）
    };

    /** 双击背景=清记忆回默认位（76px 居中）：清行内样式回落 CSS 默认 */
    barResetPos() {
        const cfg = getTomatoPluginConfig() as any;
        delete cfg[this.posKey("x")];
        delete cfg[this.posKey("y")];
        void pairBarEnabled.write();
        const bar = this.barEl();
        if (bar) {
            bar.style.left = "";
            bar.style.top = "";
            bar.style.transform = "";
        }
    }

    // ---------------- 拖框 1 chip 到编辑器块 = 填目标框（HTML5 drag，渐进 □12 先例） ----------------

    /** chip dragstart（组件回调）：预解析源 DOM 缓存——dragover 高亮判定高频调用，
     *  拖拽中光标不动解析结果稳定；含 null 项无妨（isRelatedTarget 内防御）。
     *  三框（搬运）拖起始块 chip：排除源=整段区间（拖进区间内部不当目标） */
    dragStart() {
        this.dragging = true;
        const cur = get(this.state);
        if (cur.phase !== "slots") return;
        void (async () => {
            let ids = cur.srcIDs;
            if (cur.func === "transport" && cur.endID) {
                ids = (await this.resolveRange(cur.srcIDs[0], cur.endID)) ?? [...cur.srcIDs, cur.endID];
            }
            this.dragSrc = await this.resolveDivsOf(ids);
        })();
    }

    dragEnd() {
        this.dragging = false;
        this.dragSrc = null;
        this.setDropHint(null);
    }

    /** dragover/drop 共用的目标判定：closest 块 → 限激活编辑器内（跨页签/文档 drop
     *  无效，设计拍板跨文档走快捷键）→ 排除源亲缘块（源上不高亮） */
    private dropCandidate(ev: DragEvent): HTMLElement | null {
        const t = (ev.target as Element)?.closest?.("div[data-node-id]") as HTMLElement | null;
        if (!t) return null;
        const wysiwyg = this.curProtyle()?.wysiwyg?.element;
        if (!wysiwyg || !wysiwyg.contains(t)) return null;
        if (this.dragSrc && isRelatedTarget(this.dragSrc.filter(Boolean) as HTMLElement[], t)) return null;
        return t;
    }

    private setDropHint(el: HTMLElement | null) {
        if (this.dropHint === el) return;
        this.dropHint?.classList.remove(DROP_HINT_CLS);
        this.dropHint = el;
        el?.classList.add(DROP_HINT_CLS);
    }

    /** document capture 段：drop 目标在 protyle 内，须先于内核自家 drop handler 看到；
     *  仅自己 chip 拖拽中响应（内核块拖拽/外部文件拖入零干扰放行） */
    private onDocDragOver = (ev: DragEvent) => {
        if (!this.dragging) return;
        const cand = this.dropCandidate(ev);
        this.setDropHint(cand);
        if (cand) {
            ev.preventDefault();
            ev.stopPropagation();
            ev.dataTransfer!.dropEffect = "move";
        }
    };

    private onDocDrop = (ev: DragEvent) => {
        if (!this.dragging) return;
        const cand = this.dropCandidate(ev);
        this.dragEnd();
        if (!cand) return;
        ev.preventDefault();
        ev.stopPropagation();
        const protyle = this.curProtyle();
        if (!protyle) return;
        void this.dropFillTgt(cand, protyle);
    };

    /** 拖 chip 到编辑器块：填目标框（V4 确认模型：拖放只填框，✓/快捷键才是执行——
     *  V3 的「顺势执行」随三步合一改版退役） */
    private async dropFillTgt(div: HTMLElement, _protyle: IProtyle) {
        const cur = get(this.state);
        if (cur.phase !== "slots") return;
        const id = div.getAttribute(DATA_NODE_ID);
        if (!id) return;
        const r = pairFillBox(cur, pairBoxCount(cur.func), { ids: [id], summary: this.summaryOf(div) });
        if (r.err) {
            await this.toastErr(r.err, cur.func);
            return;
        }
        this.state.set(r.state);
    }

    /** dragend 兜底（组件内 ondragend 为主；Esc 取消拖拽等旁路也走这） */
    private onDocDragEnd = () => {
        if (this.dragging) this.dragEnd();
    };

    /** 源块 DOM 现解析：页面活副本优先（跨文档页签可能已切），内核兜底 */
    private async resolveDivsOf(ids: string[]): Promise<(HTMLElement | null)[]> {
        const divs: (HTMLElement | null)[] = [];
        for (const id of ids) {
            divs.push(await this.resolveDivByID(id));
        }
        return divs;
    }

    /** 单块 DOM 解析（目标框/源共用）：页面活副本优先，内核 getBlockDiv 兜底 */
    private async resolveDivByID(id: string): Promise<HTMLElement | null> {
        const hits = [...document.querySelectorAll(`div[data-node-id="${id}"]`)] as HTMLElement[];
        let live = hits[0];
        const anchor = getSelection()?.anchorNode;
        if (anchor) {
            const hit = hits.find(d => d.contains(anchor));
            if (hit) live = hit;
        }
        return live ?? (await utils.getBlockDiv(id))?.div ?? null;
    }

    /** 确认执行前置：搬运先解析区间（文档平铺闭区间）+ 区间含目标拦截；删除档整段
     *  删除分流（无目标/protyle 需求）；其余功能源=框 1 源组（单源功能执行时取首块）。
     *  目标解析失败清目标框 */
    private async execConfirm(st: PairState, func: PairFuncID) {
        let srcIDs = st.srcIDs;
        if (func === "transport") {
            const range = await this.resolveRange(st.srcIDs[0] ?? "", st.endID ?? "");
            if (!range) {
                await siyuan.pushMsg(tomatoI18n.起止须同文档);
                return;
            }
            const isDel = st.transportMode === "delete";
            // 目标落在区间内部（非端点，sameTarget 端点检查抓不到）：move 会把目标搬进自己；
            // 删除档无目标框语义，tgtID 纯残留数据不参与拦截
            if (!isDel && st.tgtID && range.includes(st.tgtID)) {
                await siyuan.pushMsg(tomatoI18n.目标与源相同);
                return;
            }
            if (isDel) {
                await this.execDelete(range);
                return;
            }
            srcIDs = range;
        }
        const protyle = this.curProtyle();
        if (!protyle) {
            await siyuan.pushMsg(tomatoI18n.请先打开文档);
            return;
        }
        const target = await this.resolveDivByID(st.tgtID!);
        if (!target) {
            await siyuan.pushMsg(tomatoI18n.目标块不可用);
            this.state.set(pairClearBox(get(this.state), pairBoxCount(func)));
            return;
        }
        await this.execChain(st, func, srcIDs, target, protyle);
    }

    /** 统一执行链：源解析 → 祖先/子孙拦截（□2 评审转出①）→ 收浮条执行。
     *  busy 哨兵防多入口并发；拦截类失败保持浮条（用户换目标重试），源不可用收浮条。 */
    private async execChain(st: PairState, func: PairFuncID, srcIDs: string[], target: HTMLElement, protyle: IProtyle) {
        if (this.busy) return;
        this.busy = true;
        try {
            const srcDivs = await this.resolveDivsOf(srcIDs);
            if (srcDivs.some(d => !d)) {
                this.state.set(initialPairState);
                this.hideBar();
                await siyuan.pushMsg(tomatoI18n.源块不可用);
                return;
            }
            // 源=目标的祖先/子孙（如源=超级块、目标=其子块）：ID 相等检查抓不到，
            // 不拦会让 transport 把子块 move 进自己祖先（□2 评审转出①）
            if (isRelatedTarget(srcDivs as HTMLElement[], target)) {
                await siyuan.pushMsg(tomatoI18n.目标与源相同);
                return;
            }
            // 先收浮条再执行（执行可能慢，状态条不再响应）
            this.state.set(initialPairState);
            this.hideBar();
            try {
                const ok = await this.executeWith({ ...st, func }, srcDivs as HTMLElement[], target, protyle);
                if (ok) {
                    await siyuan.pushMsg(tomatoI18n.配对完成);
                    // 「上次功能」记忆：funcs 面板高亮用（R4 起直跳退役）
                    pairBarLastFunc.set(func);
                    void pairBarLastFunc.write();
                    // 「最近用过的块」预填记忆（R4）：首源块（搬运=起始块）——下次出场
                    // 无选区无光标时的伪 stash 预填源
                    if (st.srcIDs[0]) {
                        pairBarLastSrcID.set(st.srcIDs[0]);
                        void pairBarLastSrcID.write();
                    }
                } else await siyuan.pushMsg(tomatoI18n.源块不可用);
            } catch (e) {
                console.error("[pairBar] execute failed:", e);
                await siyuan.pushMsg(tomatoI18n.源块不可用);
            }
        } finally {
            this.busy = false;
        }
    }

    /** 删除档执行（R5 □2 搬运三档）：闭区间 ids 整段 deleteBlocks（思源删除可从历史
     *  恢复，按拍板零确认弹窗）；并发防护=LongContentOpsLock（跨入口：老批量删除命令
     *  同锁）+ busy 哨兵（浮条多入口防重入）。lastFunc 记面板高亮；lastSrcID 不记——
     *  源块已删，记了下次出场解析不到白发一次内核请求。 */
    private async execDelete(ids: string[]) {
        if (this.busy) return;
        this.busy = true;
        try {
            // 先收浮条再执行（与 execChain 同款：执行期间状态条不再响应）
            this.state.set(initialPairState);
            this.hideBar();
            await navigator.locks.request(LongContentOpsLock, { ifAvailable: true }, async (lock) => {
                if (!lock) {
                    await siyuan.pushMsg(tomatoI18n.请等待上个操作完成);
                    return;
                }
                await siyuan.deleteBlocks(ids);
                await siyuan.pushMsg(tomatoI18n.已删除块数(ids.length));
                pairBarLastFunc.set("transport");
                void pairBarLastFunc.write();
            });
        } finally {
            this.busy = false;
        }
    }

    private async executeWith(st: PairState, srcDivs: HTMLElement[], target: HTMLElement, protyle: IProtyle): Promise<boolean> {
        const spec = PAIR_FUNCS.find(f => f.id === st.func);
        if (!spec || !target) return false;
        const useAll = spec.multiSrc ? srcDivs : [srcDivs[0]];
        switch (st.func) {
            case "bilink":
                await linkBox.addLnkTwoDivs(protyle, useAll[0], target);
                break;
            case "embedBilink":
                await linkBox.addEmbedLnkTwoDivs(protyle, useAll, target);
                break;
            case "refOnly":
                await linkTwoElementsWithRef(useAll[0], target, protyle);
                break;
            case "insRefs":
                await bilinkWithInsertingRefs(useAll[0], target, protyle);
                break;
            case "sync":
                await linkBox.addSyncLink(protyle, useAll, target);
                break;
            case "transport":
                // 删除档在 execConfirm 已分流走 execDelete，此分支只剩 move/copy
                await this.transport(useAll, target, st.transportMode === "copy");
                break;
        }
        return true;
    }

    /** 搬运：源块范围 → 目标块后（复制=cloneCleanDiv 换新 ID 插入，活 DOM 原块不动——P0；
     *  移动=transMoveBlocksAfter 搬走保序）。复用 moveBlocksUtil 的构件，aacc 标记链路不进浮条 */
    private async transport(srcDivs: HTMLElement[], target: HTMLElement, copy: boolean) {
        const targetID = target.getAttribute(DATA_NODE_ID);
        if (!targetID) return;
        const ops = buildTransportOps(srcDivs, targetID, copy, {
            insertAfter: (htmls, id) => siyuan.transInsertBlocksAfter(htmls, id),
            moveAfter: (ids, id) => siyuan.transMoveBlocksAfter(ids, id),
        });
        await siyuan.transactions(ops);
    }

    private async readEv(protyle: IProtyle) {
        const { selected, cursorOnly } = await events.selectedDivs(protyle);
        const ids = ((selected ?? []).map(d => d.getAttribute(DATA_NODE_ID)).filter(Boolean)) as string[];
        const summary = ids.length > 0 ? this.summaryOf(selected[0]) : "";
        // cursorOnly/summaryLast 透传纯函数层：光标预填判据（光标只进起始）+ 末块摘要（结束框 chip 分显）
        const summaryLast = ids.length > 1 ? this.summaryOf(selected[ids.length - 1]) : summary;
        return { ids, summary, summaryLast, cursorOnly };
    }

    /** R4 预填兜底：「最近用过的块」→ 单块 cursorOnly 伪事件（无选区无光标时的第一框预填源，
     *  lastSrc 标记供面板 hint 分显文案）。块已删/解析不到返回 null 并顺手清 store（跨文档
     *  块经活页/内核 getBlockDiv 兜底仍可用，仅真删块才失效——防每次出场白发内核请求） */
    private async lastSrcEvent(): Promise<PairEvent | null> {
        const id = pairBarLastSrcID.get();
        if (!id) return null;
        const div = await this.resolveDivByID(id);
        if (!div) {
            pairBarLastSrcID.set("");
            void pairBarLastSrcID.write();
            return null;
        }
        const summary = this.summaryOf(div);
        return { ids: [id], summary, summaryLast: summary, cursorOnly: true, lastSrc: true };
    }

    /** 源摘要：剥锚点链接 span（互链执行后块内会带 [->*] 标记，混进 chip 是噪音） */
    private summaryOf(div: HTMLElement) {
        const editable = utils.getContenteditableElement(div) as HTMLElement | null;
        const c = (editable ?? div).cloneNode(true) as HTMLElement;
        c.querySelectorAll("span[data-type=\"a\"]").forEach(e => e.parentElement?.removeChild(e));
        return (c.textContent ?? "").trim().slice(0, 24);
    }

    /** 按 id 取块摘要（gutter drop 用：只有 id 没有现成 DOM） */
    private async summaryOfID(id: string) {
        const div = await this.resolveDivByID(id);
        return div ? this.summaryOf(div) : "";
    }

    /** 当前编辑器：events 绑定优先（热路径）；冷启动（?id= 直开未点击）events 未绑时回落
     *  getAllEditor——光标锚定优先（单 wnd 多页签时两个 protyle 同属激活 wnd，按 wnd 判
     *  恒取第一个会拿错文档——光标所在编辑器才是真激活，resolveDivsOf 同款思想），
     *  无光标（冷启动未点击）再退 wnd 激活判定（旧命令走 editorCallback 由思源递 protyle，
     *  浮条走 callback 须自取——冷启动触发浮条直接 toast 的实锤修复） */
    private curProtyle(): IProtyle | undefined {
        const fromEvents = events.protyle?.protyle;
        if (fromEvents) return fromEvents;
        const editors = getAllEditor();
        const anchor = getSelection()?.anchorNode;
        if (anchor) {
            const byCursor = editors.find(p => p.protyle?.element?.contains(anchor));
            if (byCursor) return byCursor.protyle;
        }
        const active = editors.find(p => p.protyle?.element?.closest(".layout__wnd--active"));
        return (active ?? editors[0])?.protyle;
    }

    private gates() {
        return { vip: lastVerifyResult() === true };
    }

    private labelOf(func?: PairFuncID | null) {
        const spec = PAIR_FUNCS.find(f => f.id === func);
        return spec ? (tomatoI18n as any)[spec.labelKey] as string : "";
    }

    private async toastErr(err: PairErr, func?: PairFuncID | null) {
        switch (err) {
            case "noSource":
            case "noTarget":
                await siyuan.pushMsg(tomatoI18n.请先选中块);
                break;
            case "sameTarget":
                await siyuan.pushMsg(tomatoI18n.目标与源相同);
                break;
            case "vipGated":
                await siyuan.pushMsg(tomatoI18n.需要Pro(this.labelOf(func)));
                break;
            case "srcMulti":
                await siyuan.pushMsg(tomatoI18n.仅支持单块源(this.labelOf(func)));
                break;
        }
    }

    // ---------------- 浮条挂载（命令式 body 组件，三层防线清理） ----------------

    private onKeydown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && get(this.state).phase !== "idle") {
            this.cancel();
        }
    };

    private showBar() {
        if (this.target) return;
        // 防线 1：globalThis 跨代——仅清「别的实例」的残留（同一实例上一次 hideBar 已自清，
        // 无条件回调会把 trigger 刚设好的 phase 重置回 idle，浮条挂成空壳——□2 e2e 实锤）
        const prev = (globalThis as any)[GB_CLEANUP_KEY] as { tag?: unknown; fn?: () => void } | undefined;
        if (prev && prev.tag !== this) {
            try { prev.fn?.(); } catch { /* 跨代残留已 detached，清不掉无妨 */ }
        }
        // 防线 2：固定 id 清残留（reload 未走 onunload 的 DOM 尸体）
        document.getElementById(BAR_ROOT_ID)?.remove();
        this.target = document.body.appendChild(document.createElement("div"));
        this.target.id = BAR_ROOT_ID;
        const api: PairBarApi = {
            pickFunc: id => void this.pickFunc(id),
            backToFuncs: () => this.backToFuncs(),
            confirm: () => void this.confirm(),
            clearBox: s => this.clearBox(s),
            cancel: () => this.cancel(),
            setMode: m => this.setMode(m),            dragStart: () => this.dragStart(),
            dragEnd: () => this.dragEnd(),
            slotDragOver: (e, s) => this.slotDragOver(e, s),
            slotDrop: (e, s) => void this.slotDrop(e, s),
            more: a => this.more(a),
            barDragStart: e => this.barDragStart(e),
            barTouchStart: e => this.barTouchStart(e),
            barResetPos: () => this.barResetPos(),
        };
        this.app = mount(PairBar, {
            target: this.target,
            props: {
                pairState: this.state,
                api,
                hotkeyText: PairBar触发.w(),
                // funcs 面板高亮上次功能（R4 轻量版：只高亮不抢焦点；出场快照够——
                // 执行成功即收浮条，下次出场重 mount 读新值）
                lastFunc: (pairBarLastFunc.get() || "") as PairFuncID | "",
            },
        });
        // 有记忆=JS 设 left/top（出场钳制进视口）；无记忆保持 CSS 默认 76px 居中
        this.restoreSavedPos();
        // 顺路刷新状态栏 tooltip 键位文本（改键后随出场跟随）
        this.syncStatusLabel();
        document.addEventListener("keydown", this.onKeydown, true);
        // 拖 chip：document capture 段（drop 目标在 protyle 内，先于内核 handler 看到）
        document.addEventListener("dragover", this.onDocDragOver, true);
        document.addEventListener("drop", this.onDocDrop, true);
        document.addEventListener("dragend", this.onDocDragEnd, true);
        // 拖浮条背景：document 级推进/收尾（touchmove 显式 passive:false 才能防页面滚动；
        // touchcancel=OS 手势打断（边缘返回/下拉通知），不收尾则 posDragging 卡死→
        // 全文档 touchmove 被 preventDefault 页面滚不动（评审 P1-1））
        document.addEventListener("mousemove", this.onPosMove, true);
        document.addEventListener("mouseup", this.onPosUp, true);
        document.addEventListener("touchmove", this.onPosTouchMove, { capture: true, passive: false });
        document.addEventListener("touchend", this.onPosUp, true);
        document.addEventListener("touchcancel", this.onPosUp, true);
        (globalThis as any)[GB_CLEANUP_KEY] = { tag: this, fn: () => this.hideBar() };
    }

    private hideBar() {
        document.removeEventListener("keydown", this.onKeydown, true);
        document.removeEventListener("dragover", this.onDocDragOver, true);
        document.removeEventListener("drop", this.onDocDrop, true);
        document.removeEventListener("dragend", this.onDocDragEnd, true);
        document.removeEventListener("mousemove", this.onPosMove, true);
        document.removeEventListener("mouseup", this.onPosUp, true);
        document.removeEventListener("touchmove", this.onPosTouchMove, true);
        document.removeEventListener("touchend", this.onPosUp, true);
        document.removeEventListener("touchcancel", this.onPosUp, true);
        this.posDragging = false; // 拖动中途被收（Esc/菜单执行）：终止状态防幽灵 mouseup 写记忆
        this.dragEnd(); // 拖拽中途被收（Esc/总开关关闭）：清高亮与拖拽态
        if (this.app) {
            try { unmount(this.app); } catch { /* 跨代残留已 detached，销毁失败无妨 */ }
            this.app = null;
        }
        this.target?.remove();
        document.getElementById(BAR_ROOT_ID)?.remove();
        this.target = null;
        this.state.set(initialPairState);
    }
}

export const pairBarBox = new PairBarBox();
