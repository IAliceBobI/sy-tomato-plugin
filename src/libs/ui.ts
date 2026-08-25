import { Plugin } from "siyuan"
import { getChildElements } from "./utils";
import { getDirectTextContent } from "./tools";

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

export function searchSettings(settingsDiv: HTMLElement, searchKey: string) {
    const sk = searchKey.toLocaleLowerCase();
    // 过滤候选：面板直接子元素（激活卡/搜索栏/保存行）+ 卡片壳（conf-group）内的单个
    // settingBox——2026-08 卡片化重构后 settingBox 不再是直接子元素，粒度仍保持「单条」
    const groups = getChildElements(settingsDiv);
    const candidates = groups.flatMap((e) =>
        e.classList.contains("conf-group")
            ? ([...e.querySelectorAll(".settingBox")] as HTMLElement[])
            : [e]);
    candidates.forEach((e) => {
        e.style.display = "";
    });
    groups.forEach((e) => {
        e.style.display = "";
    });
    settingsDiv.querySelectorAll(".tomato-highlight").forEach(e => {
        e.classList.remove("tomato-highlight")
    })
    if (sk) {
        candidates.forEach((e) => {
            if (e.hasAttribute("data-search")) return;
            if (e.hasAttribute("data-hide")) {
                e.style.display = "none";
                return;
            }
            if (!e.textContent.toLocaleLowerCase().includes(sk)) {
                e.style.display = "none";
                return;
            }
        });
        // 组内全空则隐藏整张卡片壳，避免剩空卡边框
        groups.forEach((e) => {
            if (!e.classList.contains("conf-group")) return;
            const anyVisible = [...e.querySelectorAll(".settingBox")]
                .some((b) => (b as HTMLElement).style.display !== "none");
            e.style.display = anyVisible ? "" : "none";
        });
        settingsDiv.querySelectorAll("div,strong").forEach(e => {
            if (getDirectTextContent(e).toLocaleLowerCase().includes(sk)) {
                e.classList.add("tomato-highlight")
            }
        })
    }
}

export function removeTopBarIcon(icon: string) {
    document.querySelectorAll(`div[data-menu="true"][id^="plugin_sy-tomato-plugin_"]`)
        .forEach(div => {
            const use = div.querySelector("svg > use")
            if (use.getAttribute("xlink:href") === "#" + icon) {
                div.parentElement.removeChild(div);
            }
        })
}

export function hideElement(e: any) {
    if (e?.style) {
        e.style.display = "none"
    }
}
export function showElement(e: any) {
    if (e?.style) {
        e.style.display = "block"
    }
}

export function removeDockIcon(dockType: string) {
    document.querySelectorAll(`span[data-type="${dockType}"]`)
        .forEach(span => {
            hideElement(span);
            // span.parentElement.removeChild(span);
        });
}