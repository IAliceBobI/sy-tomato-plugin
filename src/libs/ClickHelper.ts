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
        if (distance < 5) {
            cb(event);
        }
    }
}
