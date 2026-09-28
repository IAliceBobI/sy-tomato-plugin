import { DATA_NODE_ID, DocAttrShowKey, SPACE } from "./libs/gconst";
import { cardPriBarPos, cardPriorityBoxAutoHide, cardPriorityBoxCheckbox, cssFlashThoughts, cssFlashThoughtsTask, cssHomeEndIconLeft, cssListBackgound, cssNattyList, cssRefAsTags, cssRefEffect, cssShowFlashCardBlank, cssShowHomeEndIcon, cssShowMemo, cssSuperBlockBorder, dailyNoteCopyShowPath, graphBlockMarkBar, graphBoxCheckbox, showDocAttrs, uiCleanDocTreeBadge, uiCleanDocTreeCompact, uiCleanEmptyHelp, uiCleanTabBarBtns, uiCleanTabClose, uiCleanTopbarStatus } from "./libs/stores";
import { verifyKeyTomato } from "./libs/user";
import { getAttribute, Siyuan } from "./libs/utils";
import { BLOCK_MARK_ATTR } from "./libs/graphMarks";
// need-0926-10：纯文本类型排除规则的属性值单一事实源（与落块侧同源防漂移）
import { PLAIN_KIND } from "./libs/quicknoteCore";

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

    load_blockMarkBar();

    load_uiClean();
}

// graphmark 期2：块级标记正文左边条——custom IAL 由内核渲染进块 DOM 属性（setBlockAttrs
// 即刷），属性选择器规则零 DOM 注入。inset box-shadow 形态：零布局位移（border 会
// 推字、padding 让位会缩进）且不与引述块 border-left 打架。色=主题主色：
// - 暗色 55% 混透明（vision 实拍：清晰可辨不刺眼，通过）；
// - 亮色 82%（vision P1：55% 混白后 ≈2.1:1 踩不过非文本 3:1 线，82%≈3.2:1 过线；
//   「淡色」档与对比度线冲突已呈 bear——回落 55% 只改此一个数值）。
// 与修订痕迹色条（渐进紫罗兰 #7c5bd6 家族）色相错开；随 --b3-theme-primary 自适应。
function load_blockMarkBar() {
    if (!graphBoxCheckbox.get()) return;
    if (!graphBlockMarkBar.get()) return;
    appendTomatoStyle(`
        .protyle-wysiwyg div[data-node-id][${BLOCK_MARK_ATTR}] {
            box-shadow: inset 3px 0 0 color-mix(in srgb, var(--b3-theme-primary) 55%, transparent);
        }
        html:not([data-theme-mode="dark"]) .protyle-wysiwyg div[data-node-id][${BLOCK_MARK_ATTR}] {
            box-shadow: inset 3px 0 0 color-mix(in srgb, var(--b3-theme-primary) 82%, transparent);
        }
    `)
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
    appendTomatoStyle(flashThoughtsCSS(cssFlashThoughtsTask.get()));
}

/** need-0926-12 ⑤⑦：闪念时间胶囊/间隔角标 CSS 产物纯函数（单测注入产物断言源）。
 *  taskTime=false 时追加任务项（📌→l/i subtype=t）排除规则：时间胶囊+间隔角标成对关。
 *  全局开关 cssFlashThoughts 语义不动（false=本函数不被调用，零注入）。
 *
 *  ⑦ 定位归一（行尾锚定）内核依据（siyuan _wysiwyg.scss，3.8.4 源码实测）：
 *  - `.protyle-wysiwyg [data-node-id].li::before`（≈:171）带 position:absolute + left:17px +
 *    top:calc(1.625em+12px)（列表竖线标记位）——本插件显示规则 (0,3,2) 只赢 content 系属性，
 *    未声明的 position/left/top 由内核 (0,3,1) 规则供值穿透 → **.li 形态（list/任务两步挂属性
 *    到 item，flashBlockForm.ts）时间胶囊被 absolute 拉离行首流位**（单行 .li 高≈34px，胶囊
 *    top≈38px 悬到内容行下方；li 内多块横排时落入第二行区域），而间隔 ::after 仍在流内行尾
 *    ——两伪元素锚点体系分裂（一 absolute 一流内），特定内容宽度/换行形态下几何交叉重叠
 *    （「1m 压 13:11 左上角」）。para（p 无内核伪元素 absolute 规则）/super（sb 同）形态不漂。
 *  - 归一=全部回行内流：::before 显式 position:static 拉回流内行首（.li 变体补 margin-left:34px
 *    让位勾选框——内核 `.li>[data-node-id]{margin-left:34px}` 只作用真实子块，伪元素须自带），
 *    ::after 显式 position:static + flex-shrink:0 + nowrap 钉死流内完整尾项（行尾锚定，防挤压
 *    换行/截断）；内容块 margin-left 归零防与 ::before 双重 34px 空档。
 *  特异性账（覆盖链逐条核对）：显示变体 (0,3,2) > 内核 .li::before (0,3,1)；归零规则
 *  (0,4,1) > 内核 `.li>[data-node-id]` (0,4,0)；排除规则 (0,4,2)（[data-subtype] 加档）压
 *  显示变体与内核 fold 变体 (0,4,1)；排除配套恢复 (0,5,1) 压归零规则（见下）。
 *
 *  need-0927-01 态稳收编：内核 --hl/--select/--select-mode::after 高亮框规则 (0,1,1) 的
 *  width:100%/height:100%/background-color 会穿透本函数的间隔角标 ::after（选择器只压
 *  content/position 系）——hover gutter（块挂 --hl）/框选（--select）时角标变 100% 宽
 *  不可收缩 flex 项，内容被挤成一字一行竖列（陆杰 09-27 反馈，6811 实锤）。修=间隔角标
 *  规则显式收编三值（width:auto/height:auto/background-color:transparent），横排对内核
 *  注入物恒稳；.protyle-attr 实测 absolute 钉角（块自带 position:relative）不参与 flex
 *  排布，无需收编。 */
export function flashThoughtsCSS(taskTime: boolean): string {
    const css = `
        /* □3 时间戳胶囊化：11px 等宽+1px 边框圆角胶囊（极淡主色底，与主面板 chips 同语言）、去浮雕阴影 */
        .protyle-wysiwyg div[custom-tomato-idea-time]::before,
        /* □4 列表项形态（fballfb 2026-09-21）：内核 .li::before 标记位规则特异性更高会盖掉
           attr 胶囊（content 显示 "" 实测）——并列 .li 变体抬一档特异性对齐段落/超块形态 */
        .protyle-wysiwyg div.li[custom-tomato-idea-time]::before {
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
            /* ⑦ 归一：显式压内核 .li::before 的 absolute 拉扯（p/sb 无害=默认值） */
            position: static;
        }
        /* ⑦ .li 形态 ::before 回流内后让位勾选框（内核 .protyle-action absolute 占 0~34px；
           伪元素不沾内核 [data-node-id] 子选择器让位规则，须自带同款 34px） */
        .protyle-wysiwyg div.li[custom-tomato-idea-time]::before {
            margin-left: 34px;
        }
        /* ⑦ .li 形态内容块让位归零（元素限定符抬一档压内核 .li>[data-node-id]{margin-left:34px}，
           防与 ::before 的 34px 让位叠加出双重空档；普通 .li 无速记属性不受影响） */
        .protyle-wysiwyg div.li[custom-tomato-idea-time] > [data-node-id] {
            margin-left: 0;
        }
        /* 间隔值：行尾 12px 淡灰字常显（无色块；09-07 用户反馈 10px 看不清调大，opacity 同步提一档）；
           垂直居中防悬空（vision P1）、左距 8px 防贴正文——flex row 下 ::after 为 flex 项不会被顶换行，最坏挤压内容盒；
           ⑦ 归一：显式 position:static（防任何内核/形态 absolute 伪元素规则）+ flex-shrink:0
           + nowrap（不收缩不折行=恒完整钉在行尾）。
           need-0926-18：:not([=""]) 兜底=模式切换/清残留时空串值（setBlockAttrs 清值后属性仍在）
           零渲染零 8px 占位。
           need-0927-01 态稳收编：内核选中/悬停态高亮框 .protyle-wysiwyg--hl/--select/--select-mode::after
           （_wysiwyg.scss ~762，(0,1,1)）声明 width:100%/height:100%/background-color——本规则
           (0,3,2) 只赢 content/position 系，未声明三值在 hover gutter（块挂 --hl）或框选
           （--select）时穿透：角标变 100% 宽 flex-shrink:0 的巨型 flex 项，同容器内容块被挤到
           min-content（一字一行竖列，专属实例 6811 实锤复现+修复验证）。显式收编三值=任意态下
           角标恒为行尾小字、容器 flex row 恒稳；代价=速记块上内核选中高亮框不可见（现状该高亮
           本就被角标独占 ::after 破坏成 570px 色条，收编后仅不再炸布局，非新增破坏面） */
        .protyle-wysiwyg div[custom-tomato-idea-interval]:not([custom-tomato-idea-interval=""])::after,
        /* □4 列表项形态：与 ::before 同款 .li 特异性变体（内核 li 伪元素规则防御） */
        .protyle-wysiwyg div.li[custom-tomato-idea-interval]:not([custom-tomato-idea-interval=""])::after {
            content: attr(custom-tomato-idea-interval);
            font-size: 12px;
            color: var(--b3-theme-on-surface);
            opacity: 0.65;
            margin-left: 8px;
            align-self: center;
            position: static;
            flex-shrink: 0;
            white-space: nowrap;
            width: auto;
            height: auto;
            background-color: transparent;
        }
        /* 容器恢复默认字色，flex row 保留（图片 compose 多行块横排） */
        .protyle-wysiwyg div[custom-tomato-idea-time] {
            display: flex !important;
            flex-direction: row !important;
        }
        /* need-0926-10：纯文本类型（custom-tomato-idea-type=PLAIN_KIND，陆杰 09-26 拍板方案 A
           「保留属性仅免显示」）不显示时间胶囊+间隔角标——机制同 need-12 任务项排除变体
           （[idea-type] 加一档特异性）：base 排除 (0,3,2)/(0,4,2) 压 base 显示变体
           (0,2,2)/(0,3,2)（para/super 形态属性挂 p/sb 本体）；.li 变体 (0,4,2)/(0,5,2) 压
           .li 显示变体 (0,3,2)/(0,4,2)（list 形态挂 item）。恒追加（类型固有语义，
           与 cssFlashThoughtsTask 开关正交）；cssFlashThoughts 全局关=本函数不被调用零注入 */
        .protyle-wysiwyg div[custom-tomato-idea-type="${PLAIN_KIND}"][custom-tomato-idea-time]::before,
        .protyle-wysiwyg div.li[custom-tomato-idea-type="${PLAIN_KIND}"][custom-tomato-idea-time]::before {
            content: none;
        }
        .protyle-wysiwyg div[custom-tomato-idea-type="${PLAIN_KIND}"][custom-tomato-idea-interval]:not([custom-tomato-idea-interval=""])::after,
        .protyle-wysiwyg div.li[custom-tomato-idea-type="${PLAIN_KIND}"][custom-tomato-idea-interval]:not([custom-tomato-idea-interval=""])::after {
            content: none;
        }
        /* need-0926-10 排除配套：.li 形态 ::before 无盒不占位后内容块回 34px 让位（普通列表
           圆点/勾选框 protyle-action absolute 占 0~34px，不恢复则内容贴左缘重叠）；恢复
           (0,5,1) 严格压归零规则 (0,4,1)（[idea-type] 加档，同 need-12 excludeRestore 手法） */
        .protyle-wysiwyg div.li[custom-tomato-idea-type="${PLAIN_KIND}"][custom-tomato-idea-time] > [data-node-id] {
            margin-left: 34px;
        }
    `;
    if (taskTime) return css;
    return css + `
        /* ⑤ 任务项（📌→l/i subtype=t）不显示时间标识：时间胶囊+间隔角标成对关。
           排除规则 (0,4,2)/(0,5,2) 压显示变体 (0,3,2)/(0,4,2，need-0926-18 加 :not 空串
           兜底后) 与内核 .li::before (0,3,1)/fold 变体 (0,4,1)——间隔排除侧同步带 :not
           保「严格高于」不落源序平级；单行任务项内核竖线 height 负值本就不显，content:none
           无可见副作用 */
        .protyle-wysiwyg div.li[data-subtype="t"][custom-tomato-idea-time]::before,
        .protyle-wysiwyg div.li[data-subtype="t"][custom-tomato-idea-interval]:not([custom-tomato-idea-interval=""])::after {
            content: none;
        }
        /* ⑤ 排除配套：::before 不占位后内容块让位恢复内核 34px（勾选框 absolute 占 0~34px，
           不恢复则内容贴左缘与勾选框重叠）；特异性 (0,5,1) 压上方归零规则 (0,4,1)。
           普通列表项（subtype=u）不命中——其时间胶囊仍在流内占位、归零规则自洽 */
        .protyle-wysiwyg div.li[data-subtype="t"][custom-tomato-idea-time] > [data-node-id] {
            margin-left: 34px;
        }
    `;
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


