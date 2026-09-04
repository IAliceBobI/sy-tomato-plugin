import { DestroyManager } from "./destroyer";
import { floatingballBallList } from "./stores";
import { ballPositionOf, nearestAnchor, snapCorner } from "./ballGeometry";
import { openBallMenu } from "./ballMenu";

// 悬浮球拖拽/位置/长按/右键（期1 锚点版+期3 交互）：位置 = BallItem.anchor(0-8 九宫格)
// +offsetX/Y 进数据本体（几何纯函数见 ballGeometry.ts）。渲染=锚点基准+偏移+clamp 屏内；
// 拖拽 mousedown 后位移超 DRAG_THRESHOLD 才算拖（防点击误判）；松手时球悬停角 16px
// 邻域（snapCorner）→ 吸附该角+清偏移+贴角渲染，否则最近锚点+偏移写回并落盘。
// 桌面 contextmenu=球菜单；移动端长按 >LONG_PRESS_MS 同菜单，期间抑制拖拽与点击。
// resize 按锚点重摆（自动随窗口换算）。
const DRAG_THRESHOLD = 4; // px，与 ClickHelper 点击判定阈值同源（那边 <4 才算点击，边界互斥）
const LONG_PRESS_MS = 500;

export class FloatingBallHelper {
    private item: BallItem;
    private dm: DestroyManager;
    private div: HTMLElement;
    private offsetX: number;
    private offsetY: number;
    private isDragging = false;
    private dragArmed = false;
    private dragStartX = 0;
    private dragStartY = 0;
    private longPressTimer: ReturnType<typeof setTimeout> | null = null;
    private longPressFired = false;

    constructor(div: HTMLElement, dm: DestroyManager, item: BallItem) {
        this.dm = dm;
        this.div = div;
        this.item = item;
        this.onMount();
    }

    // 几何直径：max(宽,高)——容器现阶段非正方形（SPACE 垫宽，期4 外观圆化后=真直径），
    // 一致取 max 保证渲染与换算同源
    private ballSize() {
        return Math.max(this.div.offsetWidth, this.div.offsetHeight) || 40;
    }

    private applyPosition() {
        const p = ballPositionOf(
            this.item.anchor ?? 8,
            this.item.offsetX ?? 0,
            this.item.offsetY ?? 0,
            window.innerWidth,
            window.innerHeight,
            this.ballSize(),
        );
        this.div.style.left = `${p.x}px`;
        this.div.style.top = `${p.y}px`;
    }

    onMount() {
        this.applyPosition();

        const mousedown = this.mousedown.bind(this);
        const touchstart = this.touchstart.bind(this);
        const contextmenu = this.contextmenu.bind(this);
        const resize = this.resize.bind(this);
        const mousemove = this.mousemove.bind(this);
        const touchmove = this.touchmove.bind(this);
        const mouseup = this.mouseup.bind(this);
        const touchend = this.touchend.bind(this);
        const touchcancel = this.touchcancel.bind(this);

        this.div.addEventListener("mousedown", mousedown);
        this.div.addEventListener("touchstart", touchstart, { passive: false });
        this.div.addEventListener("contextmenu", contextmenu);
        window.addEventListener("resize", resize);
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("touchmove", touchmove, { passive: false });
        document.addEventListener("mouseup", mouseup);
        document.addEventListener("touchend", touchend, { passive: false });
        document.addEventListener("touchcancel", touchcancel);
        this.dm.add("EventListener", () => {
            this.clearLongPress();
            this.div.removeEventListener("mousedown", mousedown);
            this.div.removeEventListener("touchstart", touchstart);
            this.div.removeEventListener("contextmenu", contextmenu);
            window.removeEventListener("resize", resize);
            document.removeEventListener("mousemove", mousemove);
            document.removeEventListener("touchmove", touchmove);
            document.removeEventListener("mouseup", mouseup);
            document.removeEventListener("touchend", touchend);
            document.removeEventListener("touchcancel", touchcancel);
        });
    }

    // 桌面右键=球菜单（编辑/停用/删除）；移动端浏览器长按会跟发系统 contextmenu，
    // 已由长按计时弹过菜单（longPressFired）则跳过防双弹
    private contextmenu(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (this.longPressFired) return;
        this.clearLongPress();
        this.cancelDrag();
        openBallMenu(this.item, e.clientX, e.clientY);
    }

    private clearLongPress() {
        if (this.longPressTimer != null) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    // 取消进行中的拖拽并把球摆回数据位（长按/右键触发时用）
    private cancelDrag() {
        this.dragArmed = false;
        this.isDragging = false;
        this.div.classList.remove("fball-snap-hint", "fball-dragging");
        this.applyPosition();
    }

    // 触摸开始：球视觉本体就是 button（wrapper 由它撑满、label 不可点），触摸必落其上，
    // 一律武装拖拽——点/拖由位移阈值区分、长按由计时（超时弹菜单）。preventDefault 勿加：
    // 会杀 touchend 后浏览器合成的 mouse 事件（点击链=button 上 ClickHelper）。防滚动劫持
    // 由 CSS touch-action:none（wrapper+button 两层）承担，touchmove 拖拽中再 preventDefault 兜底。
    private touchstart(e: TouchEvent) {
        const touch = e.touches[0];
        this.longPressFired = false;
        this.dragStartX = touch.clientX;
        this.dragStartY = touch.clientY;
        this.clearLongPress();
        this.longPressTimer = setTimeout(() => {
            this.longPressTimer = null;
            this.longPressFired = true;
            this.cancelDrag();
            openBallMenu(this.item, touch.clientX, touch.clientY);
        }, LONG_PRESS_MS);
        this.mousedown({
            clientX: touch.clientX,
            clientY: touch.clientY,
        } as MouseEvent);
    }

    private touchmove(e: TouchEvent) {
        const touch = e.touches[0];
        if (!this.isDragging) {
            const dx = touch.clientX - this.dragStartX;
            const dy = touch.clientY - this.dragStartY;
            if (dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
                this.clearLongPress(); // 位移超阈值=拖拽意图，取消长按
            }
        }
        if (this.longPressFired) {
            e.preventDefault();
            return;
        }
        this.mousemove({
            clientX: touch.clientX,
            clientY: touch.clientY,
        } as MouseEvent);
        // 拖拽中阻止浏览器把触摸接管为滚动/下拉刷新（touch-action:none 之外的事件层兜底，
        // 老容器/特殊 webview 下 CSS 失效时仍保触摸流完整）
        if (this.isDragging) {
            e.preventDefault();
        }
    }

    private touchend(e: TouchEvent) {
        this.clearLongPress();
        const wasDragging = this.isDragging;
        if (this.longPressFired) {
            // 长按已触发：吞掉本次抬手（阻止合成 click 执行动作）
            e.preventDefault();
            this.longPressFired = false;
            this.cancelDrag();
            return;
        }
        // 拖拽松手同样吞合成 click——球跟手，触点下就是球本体，click 必中球=意外
        // 触发动作（拖完弹 Dialog 实锤）；tap 场景不吞（ClickHelper 靠合成事件链）
        if (wasDragging) e.preventDefault();
        this.mouseup();
    }

    // 系统手势/来电等打断拖拽（touch 流被取消不 guarantees touchend）：收尾防悬在
    // dragging 态；菜单/动效状态一并复位（recite 浮条 pointercancel 同款教训）
    private touchcancel() {
        this.clearLongPress();
        this.longPressFired = false;
        this.cancelDrag();
    }

    private mouseup() {
        this.clearLongPress();
        if (!this.dragArmed) return;
        this.dragArmed = false;
        if (!this.isDragging) return;
        this.isDragging = false;
        this.div.classList.remove("fball-snap-hint", "fball-dragging");
        const size = this.ballSize();
        const snap = snapCorner(this.div.offsetLeft, this.div.offsetTop, window.innerWidth, window.innerHeight, size);
        if (snap != null) {
            this.item.anchor = snap;
            this.item.offsetX = 0;
            this.item.offsetY = 0;
        } else {
            const r = nearestAnchor(this.div.offsetLeft, this.div.offsetTop, window.innerWidth, window.innerHeight, size);
            this.item.anchor = r.anchor;
            this.item.offsetX = r.offsetX;
            this.item.offsetY = r.offsetY;
        }
        floatingballBallList.write();
        this.applyPosition(); // 吸附位与松手位不同（跳贴角）
    }

    private mousemove(e: MouseEvent) {
        if (!this.dragArmed) return;
        if (!this.isDragging) {
            const dx = e.clientX - this.dragStartX;
            const dy = e.clientY - this.dragStartY;
            if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
            this.isDragging = true;
            this.div.classList.add("fball-dragging"); // 拖拽动效（scale+阴影，期4）
        }
        const x = e.clientX - this.offsetX;
        const y = e.clientY - this.offsetY;
        this.div.style.left = `${x}px`;
        this.div.style.top = `${y}px`;
        // 角部吸附预览：悬停角邻域时描边提示
        const snap = snapCorner(this.div.offsetLeft, this.div.offsetTop, window.innerWidth, window.innerHeight, this.ballSize());
        this.div.classList.toggle("fball-snap-hint", snap != null);
    }

    private mousedown(e: MouseEvent) {
        this.dragArmed = true;
        this.isDragging = false;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.offsetX = e.clientX - this.div.offsetLeft;
        this.offsetY = e.clientY - this.div.offsetTop;
    }

    private resize() {
        this.applyPosition();
    }
}
