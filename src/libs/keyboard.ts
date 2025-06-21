import { events } from "./Events";

export function escOnElement(e: HTMLElement) {
    if (e) {
        const escEvent = new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            charCode: 27,
            keyCode: 27,
            view: window,
            bubbles: true,
        });
        e.dispatchEvent(escEvent);
    }
}

export function closeAllDialog() {
    document.querySelectorAll(`svg.b3-dialog__close`).forEach(e => click(e));
}

export function click(e: Node) {
    if (!e?.dispatchEvent) return;
    e.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    }));
}

export function preventKeyboard(event: KeyboardEvent) {
    // $autoRefreshChecked = false;
    if (event.defaultPrevented) {
        return;
    }
    if (event.ctrlKey && event.key == "c") {
        return;
    }
    event.preventDefault();
}

export function shortcut2string(shortcut: FloatingKeyboardItem) {
    let parts: string[] = [];
    if (events.isMac) {
        if (shortcut.ctrlKey) parts.push('⌘');
        if (shortcut.altKey) parts.push('⌥');
        if (shortcut.shiftKey) parts.push('⇧');
    } else {
        if (shortcut.ctrlKey) parts.push('Ctrl');
        if (shortcut.altKey) parts.push('Alt');
        if (shortcut.shiftKey) parts.push('Shift');
    }
    // 处理特殊键显示
    let key = shortcut.key;
    const keyMap: Record<string, string> = {
        ArrowLeft: '←',
        ArrowUp: '↑',
        ArrowRight: '→',
        ArrowDown: '↓',
        Escape: 'Esc',
        ' ': 'Space',
    };
    if (keyMap[key]) key = keyMap[key];
    parts.push(key);
    return parts.join('+');
}