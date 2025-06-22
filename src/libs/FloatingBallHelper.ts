import { DestroyManager } from "./destroyer";
import { events } from "./Events";
import { floatingballEnable } from "./stores";
import { getTomatoPluginConfig } from "./utils";


export class FloatingBallHelper {
    private offsetX: number;
    private offsetY: number;
    private inner_width: number;
    private inner_height: number;
    private isDragging = false;
    private dm: DestroyManager
    private _key: string;
    private div: HTMLElement;

    key(k: string) {
        return `${this._key}_${events.isMobile}_${k}`
    }

    getPosition() {
        let x = getTomatoPluginConfig()[this.key("offsetX")]
        let y = getTomatoPluginConfig()[this.key("offsetY")]
        return { x, y }
    }

    private loadPosition() {
        const { x, y } = this.getPosition();
        this.setPosition(x, y);
    }

    private setPosition(x?: string, y?: string) {
        if (!x) x = "200px";
        if (!y) y = "200px";
        this.div.style.left = x;
        this.div.style.top = y;
        this.inner_width = window.innerWidth;
        this.inner_height = window.innerHeight;
    }

    onMount() {
        this.loadPosition();

        const mousedown = this.mousedown.bind(this);
        const touchstart = this.touchstart.bind(this);
        const resize = this.resize.bind(this);
        const mousemove = this.mousemove.bind(this);
        const touchmove = this.touchmove.bind(this);
        const mouseup = this.mouseup.bind(this);
        const touchend = this.touchend.bind(this);

        this.div.addEventListener("mousedown", mousedown);
        this.div.addEventListener("touchstart", touchstart); // 添加触摸开始事件监听
        window.addEventListener("resize", resize);
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("touchmove", touchmove); // 添加触摸移动事件监听
        document.addEventListener("mouseup", mouseup);
        document.addEventListener("touchend", touchend); // 添加触摸结束事件监听
        this.dm.add("EventListener", () => {
            this.div.removeEventListener("mousedown", mousedown);
            this.div.removeEventListener("touchstart", touchstart); // 移除触摸开始监听
            window.removeEventListener("resize", resize);
            document.removeEventListener("mousemove", mousemove);
            document.removeEventListener("touchmove", touchmove); // 移除触摸移动监听
            document.removeEventListener("mouseup", mouseup);
            document.removeEventListener("touchend", touchend); // 移除触摸结束监听
        });
    }

    constructor(key: string, div: HTMLElement, dm: DestroyManager) {
        this.dm = dm;
        this.div = div;
        this._key = key;
        this.onMount();
    }

    // 触摸开始时触发（复用鼠标按下逻辑）
    // 修改触摸开始事件处理，避免拦截子按钮点击
    private touchstart(e: TouchEvent) {
        const target = e.target as HTMLElement;
        if (target.closest("button")) {
            return;
        }
        e.preventDefault(); // 仅在拖动悬浮球时阻止默认行为
        const touch = e.touches[0];
        this.mousedown({
            clientX: touch.clientX,
            clientY: touch.clientY,
        } as MouseEvent);
    }

    // 触摸移动时触发（复用鼠标移动逻辑）
    private touchmove(e: TouchEvent) {
        const touch = e.touches[0];
        this.mousemove({
            clientX: touch.clientX,
            clientY: touch.clientY,
        } as MouseEvent);
    }

    // 触摸结束时触发（复用鼠标抬起逻辑）
    private touchend() {
        this.mouseup();
    }

    private mouseup() {
        if (this.isDragging) {
            this.isDragging = false;
            getTomatoPluginConfig()[this.key("offsetX")] = this.div.style.left;
            getTomatoPluginConfig()[this.key("offsetY")] = this.div.style.top;
            floatingballEnable.write(); // 任意一个key可以保存整体
        }
        this.inner_width = window.innerWidth;
        this.inner_height = window.innerHeight;
    }

    private mousemove(e: MouseEvent) {
        if (this.isDragging) {
            this.div.style.left = `${e.clientX - this.offsetX}px`;
            this.div.style.top = `${e.clientY - this.offsetY}px`;
        }
    }

    private mousedown(e: MouseEvent) {
        this.isDragging = true;
        this.offsetX = e.clientX - this.div.offsetLeft;
        this.offsetY = e.clientY - this.div.offsetTop;
    }

    private resize() {
        let x = Number(this.div.style.left.slice(0, -2));
        let y = Number(this.div.style.top.slice(0, -2));
        x = (x * window.innerWidth) / this.inner_width;
        y = (y * window.innerHeight) / this.inner_height;
        if (x + 20 >= window.innerWidth) {
            this.div.style.left = window.innerWidth - 100 + "px";
        } else {
            this.div.style.left = x + "px";
        }
        if (y + 20 >= window.innerHeight) {
            this.div.style.top = window.innerHeight - 100 + "px";
        } else {
            this.div.style.top = y + "px";
        }
        this.inner_width = window.innerWidth;
        this.inner_height = window.innerHeight;
    }
}
