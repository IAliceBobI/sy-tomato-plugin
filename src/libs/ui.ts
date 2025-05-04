import { Plugin } from "siyuan"

export function removeStatusBar(removeTabBar = true) {
    const status = document.getElementById("status");
    status.style.display = "none";

    document.querySelectorAll('span[data-type="new"]').forEach((e: HTMLElement) => {
        if (e.style) e.style.display = "none";
    });
    document.querySelectorAll('span[data-type="more"]').forEach((e: HTMLElement) => {
        if (e.style) e.style.display = "none";
    });
    document.querySelectorAll("ul.layout-tab-bar.layout-tab-bar--readonly.fn__flex-1").forEach((e: HTMLElement) => {
        if (e.style) {
            e.style.paddingRight = "70px";
            // e.parentElement.style.height = "30px"
        }
    });
    document.getElementById("minWindow").style.display = "none";
    document.getElementById("maxWindow").style.display = "none";
    // document.getElementById("closeWindow").style.display = "none";
    if (removeTabBar) {
        document.querySelectorAll('.fn__flex.layout-tab-bar').forEach((e: HTMLElement) => {
            if (e.style) e.style.display = "none";
        });
    }
}

export function isPinned() {
    const div = document.getElementById("pinWindow");
    if (!div) return false;
    // iconUnpin for pinned status
    return div.querySelector('use')?.getAttribute("xlink:href") === "#iconUnpin";
}

export function addIcon(plugin: Plugin, minute: number | string) {
    const id = "iconTomato" + minute;
    plugin.addIcons(`<symbol id="${id}" viewBox="0 0 32 32"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="20" font-weight="bold">${minute}</text>
    </svg></symbol>`);
    return id;
}

export function createNumIcon(num: number) {
    if (num >= 0 && num <= 9) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <text x="50%" y="67%" text-anchor="middle" dominant-baseline="middle" font-size="40" font-weight="bold">${num}</text>
        </svg>`;
    }
    if (num >= 10) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle" font-size="28" font-weight="bold">9+</text>
        </svg>`;
    }
    if (num < 0 && num >= -9) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle" font-size="28" font-weight="bold">${num}</text>
        </svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle" font-size="28" font-weight="bold">-n</text>
        </svg>`;
}
