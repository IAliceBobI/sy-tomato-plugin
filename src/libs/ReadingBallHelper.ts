import { DestroyManager } from "./destroyer";
import { readingFloatBallPos, type RPBallPos } from "./stores";
import { ballPositionOf, clampBallPos } from "./ballGeometry";

// 阅读点悬浮球拖拽/位置/长按/右键（rpfloatbar 战役；□4 自由拖动重写）。
// □4 重写背景：mouse+touch 双通道在真机/e2e trusted 输入下拖不动——Helper 的
// document mousemove 监听挂载正常（CDP DOMDebugger 实证）却从不被 trusted 事件触发，
// 而同轮后挂的裸探针正常（usertest 实测 2026-09-05，运行时派发层怪癖，合成事件一切
// 正好=当时 e2e 全绿的真因）。对策=整体切 pointer 事件 + setPointerCapture：捕获期间
// pointermove/up 定向派发到本元素，不依赖 document 冒泡，绕开该怪癖（pointer 通道
// trusted 可达性已探针实证 4/4）。
// 模型：位置=RPBallPos 自由位 x/y（拖拽松手写入）优先，旧锚点+偏移存量原样渲染不迁移；
// 拖拽即位置=指针-抓取偏移，实时 clamp 视口内（自由拖动任意位置，九宫格吸附已退役——
// 用户拍板「跟其他悬浮球一样随意拖」）。长按菜单仅 pointerType=touch（桌面按住不弹，
// 与旧 mouse 通道行为等价）；桌面右键=contextmenu 照旧。
// 点击判定不在本层：球 button 的 mouse 链走 ClickHelper（位移阈值 4px 同源互斥）；
// 拖拽/长按松手由本层捕获期 click 吞一次防误触。
const DRAG_THRESHOLD = 4;
const LONG_PRESS_MS = 500;

export interface ReadingBallHelperCallbacks {
    /** 桌面右键 / 移动端长按：弹球菜单（宿主构建） */
    onMenu: (x: number, y: number) => void;
    /** 拖拽启动（位移超阈值瞬间）：宿主收起展开条 */
    onDragStart: () => void;
    /** 轻点（非拖非长按的抬手）：展开/收起条——pointer 捕获把 mouse 兼容事件重定向到
     *  wrapper，button 的 ClickHelper mouse 链收不到，点击语义由 pointer 层承担 */
    onTap: () => void;
}

export class ReadingBallHelper {
    private dm: DestroyManager;
    private div: HTMLElement;
    private size: number;
    private cb: ReadingBallHelperCallbacks;
    private offsetX = 0;
    private offsetY = 0;
    private isDragging = false;
    private dragArmed = false;
    private dragStartX = 0;
    private dragStartY = 0;
    private longPressTimer: ReturnType<typeof setTimeout> | null = null;
    private longPressFired = false;

    constructor(div: HTMLElement, dm: DestroyManager, size: number, cb: ReadingBallHelperCallbacks) {
        this.dm = dm;
        this.div = div;
        this.size = size;
        this.cb = cb;
        this.onMount();
    }

    private pos(): RPBallPos {
        const p = readingFloatBallPos.get();
        return { anchor: p?.anchor ?? 5, offsetX: p?.offsetX ?? 0, offsetY: p?.offsetY ?? 0, x: p?.x, y: p?.y };
    }

    private applyPosition() {
        const p = this.pos();
        const q = p.x != null && p.y != null
            ? clampBallPos(p.x, p.y, window.innerWidth, window.innerHeight, this.size)
            : ballPositionOf(p.anchor, p.offsetX, p.offsetY, window.innerWidth, window.innerHeight, this.size);
        this.div.style.left = `${q.x}px`;
        this.div.style.top = `${q.y}px`;
    }

    /** 拖完自由位 clamp 落盘（吸附已退役：位置即松手位，只保证不出视口） */
    private savePosition() {
        const q = clampBallPos(this.div.offsetLeft, this.div.offsetTop, window.innerWidth, window.innerHeight, this.size);
        readingFloatBallPos.set({ anchor: 0, offsetX: 0, offsetY: 0, x: q.x, y: q.y });
        void readingFloatBallPos.write();
        this.applyPosition();
    }

    onMount() {
        this.applyPosition();

        const pointerdown = this.pointerdown.bind(this);
        const pointermove = this.pointermove.bind(this);
        const pointerup = this.pointerup.bind(this);
        const pointercancel = this.pointercancel.bind(this);
        const contextmenu = this.contextmenu.bind(this);
        const resize = this.resize.bind(this);
        const clickGuard = this.clickGuard.bind(this);

        this.div.addEventListener("pointerdown", pointerdown);
        this.div.addEventListener("pointermove", pointermove);
        this.div.addEventListener("pointerup", pointerup);
        this.div.addEventListener("pointercancel", pointercancel);
        this.div.addEventListener("contextmenu", contextmenu);
        this.div.addEventListener("click", clickGuard, true);
        window.addEventListener("resize", resize);
        this.dm.add("ReadingBallHelper", () => {
            this.clearLongPress();
            this.div.removeEventListener("pointerdown", pointerdown);
            this.div.removeEventListener("pointermove", pointermove);
            this.div.removeEventListener("pointerup", pointerup);
            this.div.removeEventListener("pointercancel", pointercancel);
            this.div.removeEventListener("contextmenu", contextmenu);
            this.div.removeEventListener("click", clickGuard, true);
            window.removeEventListener("resize", resize);
        });
    }

    // 桌面右键=球菜单；移动端长按会跟发系统 contextmenu，已由长按计时弹过则跳过防双弹
    private contextmenu(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (this.longPressFired) return;
        this.clearLongPress();
        this.cancelDrag();
        this.cb.onMenu(e.clientX, e.clientY);
    }

    private clearLongPress() {
        if (this.longPressTimer != null) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    private cancelDrag() {
        this.dragArmed = false;
        this.isDragging = false;
        this.div.classList.remove("rpfball-dragging");
        this.applyPosition();
    }

    /** 球本体的合成 click 一律吞：tap 语义已由 pointer 层 onTap 承担（pointerup 直调），
     *  不吞会双触发 toggle（tap 的 pointerup 展开+合成 click 再收起，移动端实测）；
     *  条面板区（.rpfbar 内的按钮）click 放行不受影响 */
    private clickGuard(e: MouseEvent) {
        const t = e.target as HTMLElement | null;
        if (!t) return;
        if (t.closest(".rpfball") || t === this.div) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    private pointerdown(e: PointerEvent) {
        if (!e.isPrimary) return; // 多指只认主指针
        this.longPressFired = false;
        this.dragArmed = true;
        this.isDragging = false;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.offsetX = e.clientX - this.div.offsetLeft;
        this.offsetY = e.clientY - this.div.offsetTop;
        // 指针捕获：后续 pointermove/up 定向派发到本元素，不依赖 document 冒泡
        // （老 mouse 通道 trusted 派发怪癖的正解，见文件头）
        try { this.div.setPointerCapture(e.pointerId); } catch { }
        this.clearLongPress();
        if (e.pointerType === "touch") {
            // 长按菜单仅触摸（桌面按住不弹=旧 mouse 通道行为等价）；位移超阈值时 pointermove 取消
            this.longPressTimer = setTimeout(() => {
                this.longPressTimer = null;
                this.longPressFired = true;
                this.cancelDrag();
                this.cb.onMenu(e.clientX, e.clientY);
            }, LONG_PRESS_MS);
        }
    }

    private pointermove(e: PointerEvent) {
        if (!this.dragArmed) return;
        if (!this.isDragging) {
            const dx = e.clientX - this.dragStartX;
            const dy = e.clientY - this.dragStartY;
            if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
            this.clearLongPress();
            this.isDragging = true;
            this.div.classList.add("rpfball-dragging");
            this.cb.onDragStart();
        }
        // 自由拖动：实时边界钳制（球完整可见，不出视口）
        const q = clampBallPos(e.clientX - this.offsetX, e.clientY - this.offsetY, window.innerWidth, window.innerHeight, this.size);
        this.div.style.left = `${q.x}px`;
        this.div.style.top = `${q.y}px`;
    }

    private pointerup(e: PointerEvent) {
        this.clearLongPress();
        try { this.div.releasePointerCapture(e.pointerId); } catch { }
        if (!this.dragArmed) return;
        this.dragArmed = false;
        if (this.longPressFired) {
            this.longPressFired = false;
            this.cancelDrag();
            return;
        }
        if (!this.isDragging) {
            this.cb.onTap(); // 轻点（位移 < 阈值全程）
            return;
        }
        this.isDragging = false;
        this.div.classList.remove("rpfball-dragging");
        this.savePosition();
    }

    // 系统手势/来电等打断拖拽（pointer 流被取消不保证 pointerup）：收尾防悬在 dragging 态
    private pointercancel() {
        this.clearLongPress();
        this.longPressFired = false;
        this.cancelDrag();
    }

    private resize() {
        this.applyPosition();
    }
}
