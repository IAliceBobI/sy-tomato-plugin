// 块编辑器收缩球（二期期1，模型=docs/checkpoints/2026-09-05-1823-handoff-usertest-fixes.md □5）：
// 收缩态 = 36px 悬浮球（iconEdit，与右键菜单项同 icon 视觉同族）。点击=展开、拖拽=移动
// （位移平方和阈值判定）；钉住态挂 iconPin 迷你角标；hover 气泡 = aria-label + b3-tooltips
// （钉住态「📌 文档名 › 节标题」与面板面包屑同构，跟随态=当前文档名）；z-index=10 常驻
// 浮层安全档。位置模型=纯像素 x/y，clamp 屏内（复用 ballGeometry）、localStorage 持久化。
// □5 起常驻（onload 即挂），拖拽通道=pointer 事件 + setPointerCapture（抄 ReadingBallHelper
// □4 骨架：旧 mouse 通道的 document mousemove 挂载正常却从不被 trusted 事件触发——真机
// 拖不动的同款怪癖；捕获期 pointermove/up 定向派发到本元素绕开。tap/拖拽全 pointer 层
// 单源，球本体合成 click 由 clickGuard 吞防双触发）。
import { clampBallPos } from "./ballGeometry";
import { icon } from "./domUtils";

export const QE_BALL_SIZE = 36;
const LS_X = "块编辑器收缩球_x";
const LS_Y = "块编辑器收缩球_y";
const CLICK_THRESHOLD = 4; // px，分量平方和比对（FloatingBallHelper 同源）

// ---------- 纯函数（单测 tests/unit/qeBall.test.ts） ----------

/** 位置存档解析：非正整数/缺失判无存档（坏档不落 0,0 兜底位——那是面板原点语义） */
export function parseQEBallPos(rx: string | null, ry: string | null): { x: number; y: number } | null {
    if (!rx || !ry) return null;
    if (!/^\d+$/.test(rx) || !/^\d+$/.test(ry)) return null;
    return { x: Number(rx), y: Number(ry) };
}

/** 球 hover 气泡：钉住态=「📌 文档名 › 节标题」（面板 pinCrumb 同构）；title 空=文档级钉住
 *  （□5 📌 钉当前文档/右键钉文档标题块）只显文档名，不重复不猜节名；跟随态=当前文档名 */
export function qeBallTip(pinned: { docName: string; title: string } | null, followDocName: string): string {
    if (pinned) return pinned.title ? `📌 ${pinned.docName} › ${pinned.title}` : `📌 ${pinned.docName}`;
    return followDocName || "";
}

/** 点击判定：位移分量平方和 ≤ 阈值平方（拖拽判定的补集，边界互斥） */
export function isQEBallClick(dx: number, dy: number, threshold = CLICK_THRESHOLD): boolean {
    return dx * dx + dy * dy <= threshold * threshold;
}

export function loadQEBallPos(): { x: number; y: number } | null {
    return parseQEBallPos(localStorage.getItem(LS_X), localStorage.getItem(LS_Y));
}

// ---------- 球元素（命令式挂 body，样式在 index.scss .qe-ball 系） ----------

export interface QEBallOpts {
    x: number;
    y: number;
    /** 点击=展开 */
    onClick: () => void;
    /** 气泡内容（钉住态面包屑 / 跟随态文档名） */
    tip: () => string;
    /** 钉住角标显隐 */
    pinned: () => boolean;
}

export class QEBall {
    readonly el: HTMLElement;
    private opts: QEBallOpts;
    private isDragging = false;
    private armed = false;
    private startX = 0;
    private startY = 0;
    private grabDX = 0;
    private grabDY = 0;

    constructor(opts: QEBallOpts) {
        this.opts = opts;
        const t = document.createElement("template");
        t.innerHTML = `<div class="qe-ball b3-tooltips b3-tooltips__n" role="button">
            ${icon("iconEdit", 18)}
            <span class="qe-ball__pin">${icon("iconPin", 10)}</span>
        </div>`;
        this.el = t.content.firstElementChild as HTMLElement;
        this.setPos(opts.x, opts.y);
        this.refresh();
        document.body.appendChild(this.el);

        this.el.addEventListener("pointerdown", this.onDown);
        this.el.addEventListener("pointermove", this.onMove);
        this.el.addEventListener("pointerup", this.onUp);
        this.el.addEventListener("pointercancel", this.onCancel);
        this.el.addEventListener("click", this.clickGuard, true);
        window.addEventListener("resize", this.onResize);
    }

    /** 当前渲染位（展开时面板起点） */
    pos(): { x: number; y: number } {
        return { x: this.el.offsetLeft, y: this.el.offsetTop };
    }

    /** 摆位（clamp 屏内；不落盘——收起联动摆位与拖拽落盘分开） */
    setPos(x: number, y: number) {
        const p = clampBallPos(x, y, window.innerWidth, window.innerHeight, QE_BALL_SIZE);
        this.el.style.left = `${p.x}px`;
        this.el.style.top = `${p.y}px`;
    }

    /** tooltip/角标重刷（钉住态变更、跟随态切文档时调） */
    refresh() {
        this.el.setAttribute("aria-label", this.opts.tip());
        this.el.classList.toggle("qe-ball--pinned", this.opts.pinned());
    }

    destroy() {
        this.el.removeEventListener("pointerdown", this.onDown);
        this.el.removeEventListener("pointermove", this.onMove);
        this.el.removeEventListener("pointerup", this.onUp);
        this.el.removeEventListener("pointercancel", this.onCancel);
        this.el.removeEventListener("click", this.clickGuard, true);
        window.removeEventListener("resize", this.onResize);
        this.el.remove();
    }

    private onDown = (e: PointerEvent) => {
        if (!e.isPrimary || e.button !== 0) return;
        e.preventDefault();
        this.armed = true;
        this.isDragging = false;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.grabDX = e.clientX - this.el.offsetLeft;
        this.grabDY = e.clientY - this.el.offsetTop;
        // 指针捕获：后续 pointermove/up 定向派发到本元素，不依赖 document 冒泡
        // （旧 mouse 通道 trusted 派发怪癖的正解，见文件头）
        try { this.el.setPointerCapture(e.pointerId); } catch { }
    };

    private onMove = (e: PointerEvent) => {
        if (!this.armed) return;
        if (!this.isDragging) {
            if (isQEBallClick(e.clientX - this.startX, e.clientY - this.startY)) return;
            this.isDragging = true;
            this.el.classList.add("qe-ball--dragging");
        }
        this.setPos(e.clientX - this.grabDX, e.clientY - this.grabDY);
    };

    private onUp = (e: PointerEvent) => {
        try { this.el.releasePointerCapture(e.pointerId); } catch { }
        if (!this.armed) return;
        this.armed = false;
        if (this.isDragging) {
            this.isDragging = false;
            this.el.classList.remove("qe-ball--dragging");
            const p = this.pos();
            localStorage.setItem(LS_X, String(p.x));
            localStorage.setItem(LS_Y, String(p.y));
            return;
        }
        this.opts.onClick();
    };

    // 系统手势等打断拖拽（pointer 流被取消不保证 pointerup）：收尾防悬在 dragging 态
    private onCancel = () => {
        this.armed = false;
        this.isDragging = false;
        this.el.classList.remove("qe-ball--dragging");
    };

    /** 球本体合成 click 一律吞：tap 语义已由 pointerup 单源承担，不吞会双触发（先展开再被合成 click 打断） */
    private clickGuard = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    private onResize = () => {
        this.setPos(this.el.offsetLeft, this.el.offsetTop);
    };
}
