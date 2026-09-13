import { DATA_NODE_ID, DocAttrShowKey, SPACE } from "./libs/gconst";
import { cardPriBarPos, cardPriorityBoxAutoHide, cardPriorityBoxCheckbox, cssFlashThoughts, cssHomeEndIconLeft, cssListBackgound, cssNattyList, cssRefAsTags, cssRefEffect, cssShowFlashCardBlank, cssShowHomeEndIcon, cssShowMemo, cssSuperBlockBorder, dailyNoteCopyShowPath, showDocAttrs, uiCleanDocTreeBadge, uiCleanDocTreeCompact, uiCleanEmptyHelp, uiCleanTabBarBtns, uiCleanTabClose, uiCleanTopbarStatus } from "./libs/stores";
import { verifyKeyTomato } from "./libs/user";
import { getAttribute, Siyuan } from "./libs/utils";

let observer: MutationObserver;
let _loaded = false;

// 本模块运行时注入的 style 统一打标：官方 destroyPlugin 只清插件资产 CSS，
// 不清 head 里运行时注入的 style——族缺口实锤 2026-09-12（超级块边框开关 OFF+保存
// 重载后旧规则残留继续生效）。loadCss 每轮先扫除旧标记样式再按当前开关值重注入=
// 关开关即生效，既有 15 个 load_* 开关同享（全关时重载后零注入=自然卸下）。
const STYLE_FLAG = "data-tomato-injected-style";

function appendTomatoStyle(css: string) {
    const style = document.createElement('style');
    style.setAttribute(STYLE_FLAG, "");
    style.innerText = css;
    document.head.appendChild(style);
}

export function loadCss() {
    navigator.locks.request("loadCss 2024-12-18 13:06:25", (lock) => {
        if (lock && !_loaded) {
            document.querySelectorAll(`style[${STYLE_FLAG}]`).forEach(el => el.remove());
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

    load_uiClean();
}

async function load_listBackground() {
    if (!cssListBackgound.get()) return;
    appendTomatoStyle(`
        .protyle-wysiwyg div.list[data-subtype="u"] {
            background-color: var(--b3-font-background5);
        }
    `)
}

async function load_nattyList() {
    if (!cssNattyList.get()) return;
    appendTomatoStyle(`
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
    `)
}

async function load_cardPriorityBoxCheckbox() {
    if (!cardPriorityBoxCheckbox.get()) return;
    load_cardPriBarPos();
    if (!cardPriorityBoxAutoHide.get()) return;
    if (!await verifyKeyTomato()) return;
    // !important 必带：按钮条组件 scoped 样式 .container>div{display:inline-flex}（cardrenew
    // □3 引入，约 0,2,2）压过这里的 display:none（0,1,1）——曾致 autoHide 静默失效（1548 □2
    // 实测：鼠标移出块条不隐藏）。两条同 important 时 hover 规则特异性更高，悬停显示仍赢
    appendTomatoStyle(`
        div[custom-riff-decks]:hover {
            div[cardPriBar] {
                display: inherit !important;
            }
        }
        div[cardPriBar] {
            display: none !important;
        }
    `)
}

// 按钮条位置档位（1548 □1 四形态下拉）：内核 _attr.scss 把 protyle-attr 钉死块右上
// （absolute right:0 top:-12px），宽视口下条离内容越远。非 right 档覆盖对齐；DOM 不动
// （protyle-attr=内核序列化安全区）。选择器限定含 cardPriBar 的卡块属性行，勿裸
// .protyle-attr（官方 id/memo/refcount 元素共用此类，用户开「显示块属性」时跟条同
// 属性行一起挪位，语义一致可接受）。opacity:1 因内核属性行默认 opacity:0，重定位后
// 不再依赖 --attr 内核修饰类恒常显；hover 显隐由 autoHide 的 display 规则正交控制
function load_cardPriBarPos() {
    const pos = cardPriBarPos.get();
    // 白名单外（默认 right 与手改 json 的野值）=内核原生块右上，零注入
    if (pos !== "left-top" && pos !== "block-tail" && pos !== "block-head") return;
    const attr = `div[custom-riff-decks] > .protyle-attr:has(div[cardPriBar])`;
    let css = "";
    if (pos === "left-top") {
        css = `${attr} { left: 0 !important; right: auto !important; }`;
    } else if (pos === "block-tail") {
        // 随内容流贴左：static 化脱钩内核 absolute（零遮挡零压字，每卡 +24px 高）
        css = `${attr} { left: 0 !important; right: auto !important; top: auto !important; position: static !important; opacity: 1 !important; }`;
    } else {
        // block-head：条仍 absolute 贴块容器 padding box 左上（top:0），块容器 padding-top
        // 腾出 24px 条高专属空间=左上的零遮挡版（悬空压字风险版见 left-top）
        css = `${attr} { left: 0 !important; right: auto !important; top: 0 !important; opacity: 1 !important; }`
            + `div[custom-riff-decks]:has(> .protyle-attr div[cardPriBar]) { padding-top: 24px; }`;
    }
    appendTomatoStyle(css)
}

// 引用效果五档（2026-09-03 多档化，cssRefStyle/cssRefSquareBrackets 双开关合并）：
// none=思源默认 / brackets=淡显双方括号 / icon=去色半透明链接图标 / shadow=悬停浮起+色线（旧款精修）/
// highlight=悬停淡黄底色。颜色全走 --b3-* 主题变量，明暗模式自动适配；inline 元素禁布局位移
// （无 padding/margin/字号变化，方括号与图标的 ::before 宽度是既有档位的可接受代价）。
async function load_cssRefEffect() {
    const effect = cssRefEffect.get();
    if (effect === "none") return;
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
    appendTomatoStyle(css[effect] ?? "")
}

async function load_cssRefAsTags() {
    const TAG = "tomato-ref-as-tag"
    if (!(await verifyKeyTomato())) return;
    const tags = cssRefAsTags.get()?.trim();
    if (!tags) return;
    const list = tags.trim().replaceAll("，", ",").split(",").map(i => i?.trim()).filter(i => !!i)
    if (list.length == 0) return;
    appendTomatoStyle(`
        span[${TAG}] {
            color: var(--b3-font-color5) !important;
            background-color: var(--b3-font-background5) !important;
            border-radius: var(--b3-border-radius) !important;
        }
    `)

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
    appendTomatoStyle(`
        .protyle-scroll {
            left: 10px !important;
        }
    `)
}

function load_showDocAttrs() {
    if (!showDocAttrs.get()) return;
    appendTomatoStyle(`
        div[${DocAttrShowKey}]::after {
            content: attr(${DocAttrShowKey});
            color: var(--b3-font-color2);
            opacity: 0.7;
        }
    `)
}

function load_dailyNoteCopyShowPath() {
    if (!dailyNoteCopyShowPath.get()) return;
    appendTomatoStyle(`
        .protyle-wysiwyg div[custom-tomato-ref-hpath]::before {
            content: attr(custom-tomato-ref-hpath);
            opacity: 0.5;
            font-size: medium;
            color: var(--b3-font-color5);
            padding-left: 15px;
        }
    `)
}

function load_cssShowHomeEndIcon() {
    if (!cssShowHomeEndIcon.get()) return;
    appendTomatoStyle(`
        .protyle-scroll__down,.protyle-scroll__up {
            opacity: 1 !important;
            color: var(--b3-font-color1) !important;
        }
    `)
}

function load_cssShowFlashCardBlank() {
    if (!cssShowFlashCardBlank.get()) return;
    appendTomatoStyle(`
        .card__block--hidemark span[data-type~=mark]:hover {
            font-size: ${Siyuan.config.editor.fontSize}px !important;
        }
        .card__block--hidemark span[data-type~=mark]:hover::before {
            content: "${SPACE + SPACE}";
        }
    `)
}

function load_cssShowMemo() {
    if (!cssShowMemo.get()) return;
    appendTomatoStyle(`
        .protyle-wysiwyg div[memo]:not([custom-prog-button]):not([custom-book-button])::before {
            content: "✒️" attr(memo);
            color: var(--b3-font-color4);
            background-color: var(--b3-font-background4);
        }
    `)
}

function load_superblock_border() {
    if (!cssSuperBlockBorder.get()) return;
    appendTomatoStyle(`
        .protyle-wysiwyg div[data-type="NodeSuperBlock"] {
            border: 1px solid var(--b3-font-color7);
        }
    `)
}

function load_cssFlashThoughts() {
    if (!cssFlashThoughts.get()) return;
    appendTomatoStyle(`
        /* □3 时间戳胶囊化：11px 等宽+1px 边框圆角胶囊（极淡主色底，与主面板 chips 同语言）、去浮雕阴影 */
        .protyle-wysiwyg div[custom-tomato-idea-time]::before {
            content: attr(custom-tomato-idea-time);
            font-size: 11px;
            font-weight: 500;
            font-variant-numeric: tabular-nums;
            border: 1px solid var(--b3-border-color);
            border-radius: 8px;
            background-color: var(--b3-theme-primary-lightest);
            padding: 1px 6px;
            margin-right: 6px;
            margin-top: 2px;
            align-self: flex-start;
        }
        /* 间隔值：行尾 12px 淡灰字常显（无色块；09-07 用户反馈 10px 看不清调大，opacity 同步提一档）；
           垂直居中防悬空（vision P1）、左距 8px 防贴正文——flex row 下 ::after 为 flex 项不会被顶换行，最坏挤压内容盒 */
        .protyle-wysiwyg div[custom-tomato-idea-interval]::after {
            content: attr(custom-tomato-idea-interval);
            font-size: 12px;
            color: var(--b3-theme-on-surface);
            opacity: 0.65;
            margin-left: 8px;
            align-self: center;
        }
        /* 容器恢复默认字色，flex row 保留（图片 compose 多行块横排） */
        .protyle-wysiwyg div[custom-tomato-idea-time] {
            display: flex !important;
            flex-direction: row !important;
        }
    `)
}

// 外观域·界面净化 6 开关（uiclean 2026-09-12，自 seller index.scss 写死规则迁移改造）。
// 选择器相对 seller 原版修正三处：
// ① aria-label 中文锚点（「引用」「修改图标」）换类名锚点——英文界面同样生效，且不受内核
//   「点击图标=展开」设置影响（内核 layout/dock/Files.ts:2073 计数角标=popover__block counter、
//   :2093 文档/笔记本行图标=b3-list-item__icon）；
// ② span[data-type="more"] 加 .layout-tab-bar--readonly 限定——裸选择器误伤收件箱/文件树等
//   面板头的 ⋯ 钮（内核 Wnd.ts:191 页签下拉与 Inbox.ts:67 面板头两处同名）；
// ③ 关闭钮与主页签条对齐加 :not(.layout-tab-bar--readonly) 限定（readonly 条本无关闭钮，防御性）。
// 文档图标用 .sy__file 容器限定（Files.ts:93 面板根独占类；.file-tree 是全体 dock 面板共用类，
// 会误伤书签/标签/反链面板的同名行图标）。
function load_uiClean() {
    const rules: string[] = [];
    if (uiCleanTabClose.get()) {
        rules.push(`ul.layout-tab-bar:not(.layout-tab-bar--readonly) span.item__close { display: none !important; }`);
    }
    if (uiCleanTabBarBtns.get()) {
        rules.push(`.layout-tab-bar--readonly span[data-type="new"],
.layout-tab-bar--readonly span[data-type="more"] { display: none !important; }`);
    }
    if (uiCleanTopbarStatus.get()) {
        rules.push(`span[data-type="inbox"], #statusHelp { display: none !important; }`);
    }
    if (uiCleanEmptyHelp.get()) {
        rules.push(`#editorEmptyHelp, #editorEmptyNewNotebook, #editorEmptyFile { display: none !important; }`);
    }
    if (uiCleanDocTreeBadge.get()) {
        // 计数角标全局隐藏（所有面板的 popover__block counter 与 seller 实效一致）；文档图标限文件树面板
        rules.push(`.popover__block.counter, .sy__file .b3-list-item__icon { display: none !important; }`);
    }
    if (uiCleanDocTreeCompact.get()) {
        // toggle 规则作用面含全部 b3-list 家族（seller 原样），设置文案按此写诚实
        rules.push(`.b3-list-item__toggle { margin: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; height: 26px !important; }
.b3-list-item[data-type="navigation-file"] { padding-left: 0 !important; }`);
    }
    if (!rules.length) return;
    appendTomatoStyle(rules.join("\n"));
}


