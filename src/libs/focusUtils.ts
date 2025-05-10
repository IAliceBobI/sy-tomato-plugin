import { events } from "./Events";
import { awaysExitFocusStore } from "./stores";
import { isCardByUpLook } from "./utils";

export function autoExitFocus() {
    if (awaysExitFocusStore.get() && !events.isMobile) {
        setTimeout(() => {
            findExitFocus();
        }, 1200);
    }
}

function findExitFocus() {
    const elements = document.querySelectorAll(`button[data-type="exit-focus"]`) as unknown as HTMLElement[];
    for (const e of elements) {
        if (!e.classList.contains("fn__none") && !isCardByUpLook(e)) {
            e.click();
            setTimeout(() => {
                doUnpin(e);
            }, 1000);
        }
    }
}

function doUnpin(e: HTMLElement) {
    const popover = findUpuntilPopover(e);
    const pinElement = popover?.querySelector("span[data-type='pin']");
    if (pinElement instanceof HTMLElement) {
        pinElement.click();
    }
}

function findUpuntilPopover(e: HTMLElement) {
    while (e) {
        if (e.classList.contains("block__popover--open")) {
            return e;
        }
        e = e.parentElement as HTMLElement;
    }
}