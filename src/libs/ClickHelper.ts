export class ClickHelper {
    private startX = 0;
    private startY = 0;
    private isMouseDown = false;

    handleMouseDown(event: MouseEvent) {
        this.isMouseDown = true;
        this.startX = event.clientX;
        this.startY = event.clientY;
    }

    handleMouseUp(event: MouseEvent, cb: Func) {
        if (!this.isMouseDown) return;
        this.isMouseDown = false;
        const dx = event.clientX - this.startX;
        const dy = event.clientY - this.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // 4 = FloatingBallHelper.DRAG_THRESHOLD 同源：d<4 点击 / d≥4 拖拽，边界互斥
        // （旧值 5 会在 4~5px 区间「既拖又点」双触发）
        if (distance < 4) {
            cb(event);
        }
    }
}
