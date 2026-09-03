import { DATA_NODE_ID, DocAttrShowKey, SPACE } from "./libs/gconst";
import { cardPriorityBoxAutoHide, cardPriorityBoxCheckbox, cssFlashThoughts, cssHomeEndIconLeft, cssListBackgound, cssNattyList, cssRefAsTags, cssRefEffect, cssShowFlashCardBlank, cssShowHomeEndIcon, cssShowMemo, cssSuperBlockBorder, dailyNoteCopyShowPath, showDocAttrs } from "./libs/stores";
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

    load_cssRefEffect();

    load_superblock_border();

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
        }
        div[cardPriBar] {
            display: none;
        }
    `;
    document.head.appendChild(style);
}

// 引用效果五档（2026-09-03 多档化，cssRefStyle/cssRefSquareBrackets 双开关合并）：
// none=思源默认 / brackets=淡显双方括号 / icon=去色半透明链接图标 / shadow=悬停浮起+色线（旧款精修）/
// highlight=悬停淡黄底色。颜色全走 --b3-* 主题变量，明暗模式自动适配；inline 元素禁布局位移
// （无 padding/margin/字号变化，方括号与图标的 ::before 宽度是既有档位的可接受代价）。
async function load_cssRefEffect() {
    const effect = cssRefEffect.get();
    if (effect === "none") return;
    let style = document.createElement('style');
    const css: Record<string, string> = {
        // 0.2 在深色主题几乎隐形，0.3 两种模式稳定可辨；豁免行防与「渲染为标签」叠成 [["@xx]] 双重注记
        "brackets": `
            span[data-type="block-ref"]::before { content: "[["; opacity: 0.3; }
            span[data-type="block-ref"]::after { content: "]]"; opacity: 0.3; }
            span[tomato-ref-as-tag]::before { content: none; }
            span[tomato-ref-as-tag]::after { content: none; }
        `,
        // grayscale 去 emoji 彩色渲染（跨平台不一致且抢戏），克制度由颜色通道承担、字号保持同体系
        "icon": `
            span[data-type="block-ref"]::before {
                content: "🔗";
                opacity: 0.45;
                filter: grayscale(1);
                font-size: 0.9em;
            }
            span[tomato-ref-as-tag]::before { content: none; }
        `,
        // 旧款 2px 2px 4px 右下投影偏重且与下划线不同轴（观感「字发虚」）；精修为正下 1px+2px 模糊，
        // 与 box-shadow 色线同轴成「双线」，140ms 过渡消除 hover 闪现（静态外观零变化）
        "shadow": `
            span[data-type="block-ref"] {
                transition: text-shadow 140ms ease, box-shadow 140ms ease;
            }
            span[data-type="block-ref"]:hover {
                text-shadow: 0 1px 2px var(--b3-font-color2);
                box-shadow: 0 2px 0 var(--b3-font-color3);
            }
        `,
        // 淡黄底与思源划词标记同族（--b3-font-background2）；刻意不加 padding/border-radius 防撑开行内盒
        "highlight": `
            span[data-type="block-ref"] {
                transition: background-color 140ms ease;
            }
            span[data-type="block-ref"]:hover {
                background-color: var(--b3-font-background2);
            }
        `,
    };
    style.innerText = css[effect] ?? "";
    document.head.appendChild(style);
}

async function load_cssRefAsTags() {
    const TAG = "tomato-ref-as-tag"
    if (!(await verifyKeyTomato())) return;
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
            content: "${SPACE + SPACE}";
        }
    `;
    document.head.appendChild(style);
}

function load_cssShowMemo() {
    if (!cssShowMemo.get()) return;
    let style = document.createElement('style');
    style.innerText = `
        .protyle-wysiwyg div[memo]:not([custom-prog-button]):not([custom-book-button])::before {
            content: "✒️" attr(memo);
            color: var(--b3-font-color4);
            background-color: var(--b3-font-background4);
        }
    `;
    document.head.appendChild(style);
}

function load_superblock_border() {
    if (!cssSuperBlockBorder.get()) return;
    let style = document.createElement('style');
    style.innerText = `
        .protyle-wysiwyg div[data-type="NodeSuperBlock"] {
            border: 1px solid var(--b3-font-color7);
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

