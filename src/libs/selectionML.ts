// selectionML.ts —— 多行选择器（□9 升格共享件，bear 排期 2026-09-09）。
// 从 exportFiles 私有零件升格为统一选中工具家族正式件（与 selection.ts 同族）：
// selection.ts 管「读」（三级链解析当前选区），本件管「写」（逐块扩展/逐块取消——
// 移动端无 hover 浮条、拖蓝难的替代通道：编辑器顶栏三钮，挂内核同款
// protyle-wysiwyg--select 类，选完直接被 collectSelectedBlocks 一级链读走；
// □8 期4 渐进/仿写移动端逐块多选的复用底座）。
// 纯 DOM 参数：实例只吃 wysiwyg 元素与种子块数组，零 events 单例耦合（种子由
// 调用方注入，tomato 侧=selectedDivsSync，渐进/仿写侧=collectSelectedBlocks）。
//
// □9 修三毛病（评估实锤，按疼度）：
// ① 事件重建丢 trace：原挂载对四个 protyle 事件每次 new 全量重建，「逐块取消」
//    历史（trace）清零而残留高亮还挂 DOM——切页签往返后撤销次序断链、残留无人
//    认领。修=selectionMLRegistry 以 wysiwyg 为键 reuse-or-create：同键不重建只
//    reanchor（锚点随当前选区刷新；trace 与 DOM 选中类对账——内核普通点击
//    hideElements 清类后旧 trace 已无主，一并弃）；destroy_protyle 时 dispose。
// ② 无 data-node-id 兄弟误退层：原只试一次 previous/nextElementSibling，遇装饰
//    节点（无 id）返回假即爬父层。修=while 跳过无 id 兄弟，真边界（无更前/后
//    兄弟）才走退层分支。
// ③ cancelLast 全局查找误伤：原 document.querySelector 全页面——块引浮窗同 id
//    双 DOM 时取消的是浮窗那份。修=实例持有 wysiwyg 引用，查找限域其内。

import { IProtyle } from "siyuan";
import { DATA_NODE_ID, PROTYLE_WYSIWYG_SELECT } from "./gconst";
import { debugLog } from "./logUtils";

const idOf = (el: Element | null | undefined): string | null =>
    el?.getAttribute?.(DATA_NODE_ID) ?? null;

export class SelectionML {
    private wysiwyg: HTMLElement;
    private topElement: HTMLElement;
    private bottomElement: HTMLElement;
    private firstElement: HTMLElement;
    private trace: string[] = [];

    constructor(wysiwyg: HTMLElement, seed: HTMLElement[] = []) {
        this.wysiwyg = wysiwyg;
        this.reanchor(seed);
    }

    /** 锚点随当前选区刷新（不重建实例、不动已选类）；trace 与 DOM 选中类对账：
     *  内核清类（普通点击 hideElements / 内容重渲）后旧 trace 已无主高亮，弃掉，
     *  「点击编辑器后取消次序仍对」＝锚点归位新光标块、trace 从现实重建 */
    reanchor(seed: HTMLElement[] = []) {
        const alive = seed.filter(el => el && this.wysiwyg.contains(el));
        if (alive.length) {
            this.firstElement = alive[0];
            this.topElement = alive[0];
            this.bottomElement = alive[alive.length - 1];
        }
        // 锚点活性校验（review P2-1）：内核重渲替换块元素且 seed 为空时（如
        // switch 时光标未恢复），死引用滞留会让三钮在 detached 树上操作——死者
        // 回落 alive[0]（空则 undefined，空锚点惰性守卫已就位）
        if (this.topElement && !this.wysiwyg.contains(this.topElement)) this.topElement = alive[0];
        if (this.bottomElement && !this.wysiwyg.contains(this.bottomElement)) this.bottomElement = alive[0];
        if (this.firstElement && !this.wysiwyg.contains(this.firstElement)) this.firstElement = alive[0];
        this.trace = this.trace.filter(id =>
            this.blockByID(id)?.classList.contains(PROTYLE_WYSIWYG_SELECT));
    }

    /** 限 wysiwyg 域查块（修③：document 级查找会误中块引浮窗的同 id 副本） */
    private blockByID(id: string): HTMLElement | null {
        return this.wysiwyg.querySelector(`div[${DATA_NODE_ID}="${id}"]`);
    }

    private traceElement(e: Element) {
        e.classList.add(PROTYLE_WYSIWYG_SELECT);
        const id = idOf(e);
        if (id && !this.trace.includes(id)) this.trace.push(id);
    }

    private untraceElement(e: Element) {
        const id = idOf(e);
        const idx = this.trace.findIndex(i => i == id)
        if (idx >= 0) {
            this.trace.splice(idx, 1)
        }
    }

    private unselect(d: Element) {
        d.querySelectorAll("." + PROTYLE_WYSIWYG_SELECT).forEach((e) => {
            e.classList.remove(PROTYLE_WYSIWYG_SELECT);
            this.untraceElement(e);
        });
    }

    private scrollIntoView(d: Element) {
        d.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }

    private selectDivUp(d: Element) {
        const id = idOf(d);
        if (id) {
            this.scrollIntoView(d);
            this.topElement = d as HTMLElement;
            this.traceElement(this.topElement)
            return true;
        }
    }

    /** 向前/向后找最近带 id 的兄弟（修②：跳过无 data-node-id 装饰节点） */
    private siblingWithID(el: Element, dir: "prev" | "next"): HTMLElement | null {
        let cur = dir == "prev" ? el.previousElementSibling : el.nextElementSibling;
        while (cur && !idOf(cur)) {
            cur = dir == "prev" ? cur.previousElementSibling : cur.nextElementSibling;
        }
        return cur as HTMLElement | null;
    }

    selectUp() {
        if (!this.topElement) return;
        if (this.trace.length == 0) this.traceElement(this.topElement)
        const prev = this.siblingWithID(this.topElement, "prev");
        if (prev) {
            this.selectDivUp(prev);
            return;
        }
        // 真边界（本层无更前的真块）才退层；wysiwyg 根无 id，到顶静默不选
        const parent = this.topElement.parentElement;
        if (parent && parent !== this.wysiwyg && this.selectDivUp(parent)) {
            this.bottomElement = this.topElement;
            this.unselect(this.topElement.parentElement);
            this.traceElement(this.topElement)
        }
    }

    private selectDivDown(d: Element) {
        const id = idOf(d);
        if (id) {
            this.scrollIntoView(d);
            this.bottomElement = d as HTMLElement;
            this.traceElement(this.bottomElement)
            return true;
        }
    }

    selectDown() {
        if (!this.bottomElement) return;
        if (this.trace.length == 0) this.traceElement(this.bottomElement)
        const next = this.siblingWithID(this.bottomElement, "next");
        if (next) {
            this.selectDivDown(next);
            return;
        }
        const parent = this.bottomElement.parentElement;
        if (parent && parent !== this.wysiwyg && this.selectDivDown(parent)) {
            this.topElement = this.bottomElement;
            this.unselect(this.bottomElement.parentElement);
            this.traceElement(this.bottomElement)
        }
    }

    cancelLast() {
        const id = this.trace.pop();
        if (id) {
            const e = this.blockByID(id);
            if (e) {
                this.scrollIntoView(e);
                e.classList.remove(PROTYLE_WYSIWYG_SELECT)
            }
        }

        if (this.trace.length == 0) {
            if (!this.firstElement) return;
            this.topElement = this.firstElement
            this.bottomElement = this.firstElement
            this.scrollIntoView(this.firstElement);
            this.traceElement(this.firstElement);
        }
    }

    /** destroy_protyle 清理：按本实例 trace 逐 id 清残留选中类（review P2-2——
     *  不动内核原生块选/其他实例的类；trace 经对账恒 ⊆ 本实例高亮集，内核已清
     *  过的是 no-op） */
    dispose() {
        for (const id of this.trace) {
            this.blockByID(id)?.classList.remove(PROTYLE_WYSIWYG_SELECT);
        }
        this.trace = [];
    }

    /** 诊断快照（Loki 埋点用，逻辑勿依赖） */
    get state(): { trace: string[]; top: string | null; bottom: string | null } {
        return {
            trace: [...this.trace],
            top: idOf(this.topElement),
            bottom: idOf(this.bottomElement),
        };
    }
}

/** per-wysiwyg 实例册（修①）：WeakMap 键随 DOM 回收，destroy 事件万一漏发也不漏内存 */
const selectionMLRegistry = new WeakMap<HTMLElement, SelectionML>();

/** reuse-or-create：同 wysiwyg 跨事件复用同一实例（trace 跨重建续命），命中时仅
 *  reanchor 刷新锚点；种子由调用方注入（tomato=selectedDivsSync 的 selected） */
export function getSelectionML(wysiwyg: HTMLElement, seed: () => HTMLElement[] = () => []): SelectionML {
    let s = selectionMLRegistry.get(wysiwyg);
    if (!s) {
        s = new SelectionML(wysiwyg, seed());
        selectionMLRegistry.set(wysiwyg, s);
    } else {
        s.reanchor(seed());
    }
    return s;
}

/** destroy_protyle：实例出册 + 清本 wysiwyg 残留选中类（只动册内已知键，不碰
 *  其他编辑器的内核态选中） */
export function disposeSelectionML(wysiwyg: HTMLElement) {
    const s = selectionMLRegistry.get(wysiwyg);
    if (!s) return;
    debugLog("selectionml", `dispose trace=${s.state.trace.length}`, "selectionml");
    s.dispose();
    selectionMLRegistry.delete(wysiwyg);
}

/** 编辑器顶栏自建按钮（内核 block__icon 位次=readonly 钮前，幂等重复挂即早退） */
export function addCustomButton(protyle: IProtyle, dataType: string, ariaLabel: string, icon: string, clickHandler: () => void) {
    const lockBtn = protyle.element.querySelector(`button[data-type="readonly"]`) as HTMLButtonElement;
    if (!lockBtn) return;
    const btn = protyle.element.querySelector(`button[data-type="${dataType}"]`);
    if (btn) return;
    const customBtn = document.createElement('button');
    customBtn.setAttribute('data-type', dataType);
    customBtn.setAttribute('aria-label', ariaLabel);
    customBtn.classList.add('block__icon', 'fn__flex-center', 'ariaLabel');
    customBtn.innerHTML = `<svg><use xlink:href="#icon${icon}"></use></svg>`;
    customBtn.addEventListener('click', clickHandler);
    lockBtn.parentNode?.insertBefore(customBtn, lockBtn);
}

/** 三钮挂载工厂（向上/向下/取消最后一次选择）。labels 由调用方注入（tomato=
 *  tomatoI18n，渐进/仿写期4 接入传各自文案）；data-type/图标/位次=红线不动 */
export function addSelectionMLButtons(protyle: IProtyle, wysiwyg: HTMLElement, labels: { prev: string; next: string; cancel: string }) {
    const act = (name: string, fn: (s: SelectionML) => void) => () => {
        const s = getSelectionML(wysiwyg);
        fn(s);
        debugLog("selectionml", `${name} ${JSON.stringify(s.state)}`, "selectionml");
    };
    addCustomButton(protyle, 'tomato-prev', labels.prev, "Up", act("up", s => s.selectUp()));
    addCustomButton(protyle, 'tomato-next', labels.next, "Down", act("down", s => s.selectDown()));
    addCustomButton(protyle, 'tomato-cancel', labels.cancel, "Redo", act("cancel", s => s.cancelLast()));
}
