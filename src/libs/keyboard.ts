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