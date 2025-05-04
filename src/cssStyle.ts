import { DATA_NODE_ID, DocAttrShowKey } from "./libs/gconst";
import { cardPriorityBoxAutoHide, cardPriorityBoxCheckbox, cssFlashThoughts, cssHomeEndIconLeft, cssListBackgound, cssNattyList, cssRefAsTags, cssRefSquareBrackets, cssRefStyle, cssShowFlashCardBlank, cssShowHomeEndIcon, cssShowMemo, dailyNoteCopyShowPath, showDocAttrs } from "./libs/stores";
import { verifyKeyTomato } from "./libs/user";
import { getAttribute, Siyuan } from "./libs/utils";

let observer: MutationObserver;
let _loaded = false;

export function loadCss() {
    navigator.locks.request("loadCss 2024-12-18 13:06:25", (lock) => {
        if (lock && !_loaded) {
            _loadCss();
            _loaded = true;
        }
    })
}

function _loadCss() {
    load_cardPriorityBoxCheckbox();

    load_cssRefStyle();

    load_cssRefSquareBrackets();

    load_cssFlashThoughts();

    load_cssShowMemo();

    load_cssShowFlashCardBlank();

    load_cssShowHomeEndIcon();

    load_cssHomeEndIconLeft();

    load_dailyNoteCopyShowPath();

    load_showDocAttrs();

    load_nattyList();

    load_listBackground();

    load_cssRefAsTags();
}

async function load_listBackground() {
    if (!cssListBackgound.get()) return;
    let style = document.createElement('style');
    style.innerText = `
        .protyle-wysiwyg div.list[data-subtype="u"] {
            background-color: var(--b3-font-background5);
        }
    `;
    document.head.appendChild(style);
}

async function load_nattyList() {
    if (!cssNattyList.get()) return;
    let style = document.createElement('style');
    style.innerText = `
        .protyle-wysiwyg {
            .li[data-subtype="u"]::before {
                content: none !important;
            }

            .li[data-subtype="u"]>.protyle-action[draggable="true"] {
                opacity: 0;
            }

            div[data-node-index][data-subtype="u"]>div>div {
                margin-left: 0 !important;
            }

            div[data-node-index][data-subtype="u"]>div>div.protyle-action {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

async function load_cardPriorityBoxCheckbox() {
    if (!cardPriorityBoxCheckbox.get()) return;
    if (!cardPriorityBoxAutoHide.get()) return;
    if (!await verifyKeyTomato()) return;
    let style = document.createElement('style');
    style.innerText = `
        div[custom-riff-decks]:hover {
            div[cardPriBar] {
                display: inherit;
            }
            // box-shadow: 0 0 0 3px var(--b3-protyle-inline-mark-background) inset !important;
        }
        div[cardPriBar] {
            display: none;
        }
    `;
    document.head.appendChild(style);
}

async function load_cssRefStyle() {
    if (!cssRefStyle.get()) return;
    let style = document.createElement('style');
    /* box-shadow 水平偏移量 | 垂直偏移量 | 模糊半径 | 阴影颜色 */
    style.innerText = `
        // span[data-type="block-ref"]:before {
        //     content: "🔗";
        //     opacity: 0.5;
        //     font-size: xx-small;
        // }
        span[data-type="block-ref"]:hover {
            text-shadow: 2px 2px 4px var(--b3-font-color2);
            box-shadow: 0px 1.5px 0px var(--b3-font-color3);
        }
    `;
    document.head.appendChild(style);
}

function load_cssRefSquareBrackets() {
    if (!cssRefSquareBrackets.get()) return;
    if (cssRefStyle.get()) return;
    let style = document.createElement('style');
    // style.id = 'tomato-cssRefSquareBrackets';
    style.innerText = `
        span[data-type="block-ref"]::before {
            content:"[[";
            opacity: 0.2;
        }
        span[data-type="block-ref"]::after {
            content:"]]";
            opacity: 0.2;
        }
    `;
    document.head.appendChild(style);
    // var styleElement = document.getElementById('customStyle');
    // if (styleElement) {
    //   styleElement.parentNode.removeChild(styleElement);
    // }
}

async function load_cssRefAsTags() {
    const TAG = "tomato-ref-as-tag"
    if (! await verifyKeyTomato()) return;
    const tags = cssRefAsTags.get()?.trim();
    if (!tags) return;
    const list = tags.trim().replaceAll("，", ",").split(",").map(i => i?.trim()).filter(i => !!i)
    if (list.length == 0) return;
    let style = document.createElement('style');
    style.innerText = `
        span[${TAG}] {
            color: var(--b3-font-color5) !important;
            background-color: var(--b3-font-background5) !important;
            border-radius: var(--b3-border-radius) !important;
        }
    `;
    document.head.appendChild(style);

    observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            mutation.addedNodes.forEach(((e: HTMLElement) => {
                if (!e.getAttribute || !e.classList) return;
                if (!getAttribute(e, DATA_NODE_ID)) return
                if (getAttribute(e, "data-position")) return
                if (e.classList.contains("protyle-breadcrumb__item")) return
                e.querySelectorAll(`span[data-type="block-ref"]`).forEach((e: HTMLElement) => {
                    if (e.getAttribute(TAG)) return;
                    const txt = e.textContent
                    for (const t of list) {
                        if (txt.startsWith(t)) {
                            e.setAttribute(TAG, "1")
                        }
                    }
                });
            }))
        }
    });
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
}

function load_cssHomeEndIconLeft() {
    if (!cssHomeEndIconLeft.get()) return;
    let style = document.createElement('style');
    style.innerText = `
        .protyle-scroll {
            left: 10px !important;
        }
    `;
    document.head.appendChild(style);
}

function load_showDocAttrs() {
    if (!showDocAttrs.get()) return;
    let style = document.createElement('style');
    style.innerText = `
        div[${DocAttrShowKey}]::after {
            content: attr(${DocAttrShowKey});
            color: var(--b3-font-color2);
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
}

function load_dailyNoteCopyShowPath() {
    if (!dailyNoteCopyShowPath.get()) return;
    let style = document.createElement('style');
    style.innerText = `
        .protyle-wysiwyg div[custom-tomato-ref-hpath]::before {
            content: attr(custom-tomato-ref-hpath);
            opacity: 0.5;
            font-size: medium;
            color: var(--b3-font-color5);
            padding-left: 15px;
        }
    `;
    document.head.appendChild(style);
}

function load_cssShowHomeEndIcon() {
    if (!cssShowHomeEndIcon.get()) return;
    let style = document.createElement('style');
    style.innerText = `
        .protyle-scroll__down,.protyle-scroll__up {
            opacity: 1 !important;
            color: var(--b3-font-color1) !important;
        }
    `;
    document.head.appendChild(style);
}

function load_cssShowFlashCardBlank() {
    if (!cssShowFlashCardBlank.get()) return;
    let style = document.createElement('style');
    style.innerText = `
        .card__block--hidemark span[data-type~=mark]:hover {
            font-size: ${Siyuan.config.editor.fontSize}px !important;
        }
        .card__block--hidemark span[data-type~=mark]:hover::before {
            content: "🙋➡️";
        }
    `;
    document.head.appendChild(style);
}

function load_cssShowMemo() {
    if (!cssShowMemo.get()) return;
    let style = document.createElement('style');
    style.innerText = `
        .protyle-wysiwyg div[memo]:not([custom-prog-button]):not([custom-book-button])::before {
            content: attr(memo);
            color: var(--b3-font-color4);
            background-color: var(--b3-font-background4);
        }
    `;
    document.head.appendChild(style);
}

function load_cssFlashThoughts() {
    if (!cssFlashThoughts.get()) return;
    let style = document.createElement('style');
    style.innerText = `
        .protyle-wysiwyg div[custom-tomato-idea-time]::before {
            content: attr(custom-tomato-idea-time);
            font-size: small;
            background-color: var(--b3-font-background3);
        }
        .protyle-wysiwyg div[custom-tomato-idea-interval]::after {
            content: attr(custom-tomato-idea-interval);
            font-size: small;
            background-color: var(--b3-font-background1);
        }
        .protyle-wysiwyg div[custom-tomato-idea-time] {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            color: var(--b3-font-color3);
            display: flex !important;
            flex-direction: row !important;
        }
    `;
    document.head.appendChild(style);
}

