<script lang="ts">
    import { onMount, tick } from "svelte";
    import { createProtyle } from "./libs/bkUtils";
    import { DestroyManager } from "./libs/destroyer";
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    import { appendSuperBlock, OpenSyFile2 } from "./libs/docUtils";
    import { getTomatoPluginInstance, icon, removeInvisibleChars, siyuan } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    import { secsFromChildRows } from "./libs/qeSecs";
    import { currentBockEditorDocID, currentProtyle, events } from "./libs/Events";
    import { navSourceBlock } from "./libs/stores";

    interface Props {
        dm: DestroyManager;
        pinBlockID?: string;
        /** 球位展开联动（二期期1）：面板初始位置覆盖（透传 DialogSvelte posOverride） */
        posOverride?: { x: number; y: number };
        /** 钉住态上报（期1 提升至 ts 层）：pinBlock/unpin/➕ 变更时同步——收起=unmount 后 $state 丢失，ts 字段跨收起存活 */
        onPinChange?: (p: { blockID: string; docID: string; title: string; docName: string }) => void;
        /** 文档名上报（跟随态收缩球的 tooltip 数据源） */
        onDocName?: (name: string) => void;
        /** 收起回调（ts 层 collapse：只折叠回球，钉住态/面板尺寸保留）——usertest2 □6 起
         *  接到 DialogSvelte onClose：× 关闭与收起同语义（常驻球模型下面板不该整体关掉） */
        onCollapse?: () => void;
    }
    let { dm, pinBlockID = "", posOverride = undefined, onPinChange, onDocName, onCollapse }: Props = $props();
    let docName = $state("");
    let blocks = $state<Block[]>([]);
    let editor = $state<HTMLElement>(null);
    let pob = $state<ReturnType<typeof createProtyle>>(null);
    let selectedBlockID = $state("");
    let currentDocID = "";
    let show = $state(false);
    // 钉住态（第二视口）：右键显式钉住后与 currentBockEditorDocID 解耦，切页签/翻页不重置
    let pinnedBlockID = $state("");
    let pinnedDocID = $state("");
    let pinnedTitle = $state("");
    let topBlocks: GetChildBlocks[] = [];
    // 节列表折叠（fballfeedback □6）：标题多的文档列表占半屏挤没正文；收起后 .qeContent 占满。
    // 手动操作优先——手动收/展过（secTouched）后，钉块自动收起/unpin 自动展开不再翻转
    let secCollapsed = $state(false);
    let secTouched = false;
    // 侧边布局（blockside □2）：左目录右内容两栏独立滚动。移动端恒上下（钮不渲染）；
    // 记忆走 localStorage 不进设置面板（brainstorm 定稿）；与 secCollapsed 正交——收起语义
    // 只属上下布局，侧边布局下节列表=侧栏主体恒展开（钉单块不自动收侧栏同此守卫）
    const SIDE_LAYOUT_KEY = "块编辑器布局_side";
    let sideLayout = $state(!events.isMobile && localStorage.getItem(SIDE_LAYOUT_KEY) === "1");
    // 侧栏比例（blockside □3）：15%~50% clamp；拖动事件驱动直写 $state（勿 $effect 回放——依赖集
    // 含被写状态会被旧值打回，复习界面拖不动+振荡同根因）；pointerup 落 localStorage
    const SIDE_RATIO_KEY = "块编辑器侧栏比例";
    let sideRatio = $state(loadSideRatio());

    function loadSideRatio(): number {
        const v = parseFloat(localStorage.getItem(SIDE_RATIO_KEY) || "");
        return isNaN(v) ? 0.32 : Math.min(0.5, Math.max(0.15, v));
    }

    function startSideDrag(e: PointerEvent & { currentTarget: HTMLElement }) {
        e.preventDefault();
        const handle = e.currentTarget;
        const split = handle.parentElement;
        if (!split) return;
        // setPointerCapture：拖出元素丢事件防护（DialogSvelte 手柄同款先例）
        handle.setPointerCapture(e.pointerId);
        const move = (ev: PointerEvent) => {
            const rect = split.getBoundingClientRect();
            if (rect.width <= 0) return;
            sideRatio = Math.min(0.5, Math.max(0.15, (ev.clientX - rect.left) / rect.width));
        };
        const up = (ev: PointerEvent) => {
            handle.releasePointerCapture?.(ev.pointerId);
            handle.removeEventListener("pointermove", move);
            handle.removeEventListener("pointerup", up);
            localStorage.setItem(SIDE_RATIO_KEY, String(sideRatio));
        };
        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", up);
    }

    function toggleSecs() {
        secCollapsed = !secCollapsed;
        secTouched = true;
    }

    function toggleLayout() {
        sideLayout = !sideLayout;
        if (!events.isMobile) localStorage.setItem(SIDE_LAYOUT_KEY, sideLayout ? "1" : "0");
        if (sideLayout) secCollapsed = false;
        // 布局分支切换=editor 容器换新节点，protyle 须重挂（与点击节的实例重建同款成本）
        const cur = selectedBlockID;
        if (cur) tick().then(() => mountProtyle(cur));
    }

    function syncPin() {
        onPinChange?.({ blockID: pinnedBlockID, docID: pinnedDocID, title: pinnedTitle, docName });
    }

    onMount(async () => {
        dm?.add("close protyle", closeProtyle);
        // 先出窗再挂内容：bind:this 的 editor 要等 {#if show} 渲染后才存在，
        // 钉住路径 mountProtyle 排在 pinBlock 尾部，show 晚置会空挂（原跟随态靠 $effect 兜底重跑掩盖）
        if (dm) {
            show = true;
        }
        if (pinBlockID) {
            await pinBlock(pinBlockID);
        } else {
            await reloadBlocks();
        }
    });

    $effect(() => {
        if (pinnedBlockID) return;
        if (currentDocID != $currentBockEditorDocID) {
            currentDocID = $currentBockEditorDocID;
            selectedBlockID = "";
            closeProtyle();
            reloadBlocks();
            if (!dm) {
                const { attrs } = events.getInfo($currentProtyle?.protyle);
                if (attrs["custom-book-writing"]) {
                    show = true;
                } else {
                    show = false;
                }
            }
        }
    });

    /** 钉住/换钉（右键链路）：加载块所在文档的节列表并聚焦该块；heading 块聚焦即整节（内核 getDoc 语义）。
     *  blockID=rootID（钉文档本身，📌 钮/右键文档标题）时节标题置空——文档级钉住只显文档名不重复 */
    export async function pinBlock(blockID: string) {
        if (!blockID) return;
        const info = await siyuan.getBlockInfo(blockID);
        if (!info?.rootID) {
            await reloadBlocks();
            return;
        }
        pinnedDocID = info.rootID;
        docName = info.rootTitle || info.rootID;
        const row = await siyuan.getRowByID(blockID);
        pinnedTitle = blockID === info.rootID
            ? ""
            : removeInvisibleChars(row?.content || "", true).slice(0, 20);
        pinnedBlockID = blockID;
        selectedBlockID = "";
        // 钉单块自动收起节列表（弹窗只看这个块）；钉文档（blockID==rootID）不收——节列表即导航主体；
        // 侧边布局不收（列表=侧栏主体，blockside □2 守卫）
        if (!secTouched && !sideLayout) secCollapsed = blockID !== info.rootID;
        closeProtyle();
        await reloadBlocks(false);
        mountProtyle(blockID);
        show = true;
        syncPin();
    }

    function unpin() {
        pinnedBlockID = "";
        pinnedDocID = "";
        pinnedTitle = "";
        currentDocID = "";
        // 回跟随态恢复展开（自动收起只服务钉单块期间）
        if (!secTouched) secCollapsed = false;
        syncPin();
    }

    /** 收起前置（ts 层 collapse 调）：摘 protyle 实例（球位已独立记忆，不再报面板位，usertest3 □7） */
    export function collapse(): void {
        closeProtyle();
    }

    /** 跟随态目标文档：store 优先；空则 DOM 直查兜底（3.8.2 switch-protyle detail={protyle}
     *  无 event 字段，Events 的 detail.event 门槛恒 false=切文档路径断供，只剩点块撑着——
     *  启动后不点块直接开面板/钉住会拿空 ID；ReadingPointBox.curDocID 同款兜底先例） */
    function followDocID(): string {
        if ($currentBockEditorDocID) return $currentBockEditorDocID;
        const el = document.querySelector(".layout__wnd--active .protyle:not(.fn__none) .protyle-title[data-node-id]")
            ?? document.querySelector(".protyle:not(.fn__none) .protyle-title[data-node-id]");
        return el?.getAttribute("data-node-id") ?? "";
    }

    function activeDocID() {
        return pinnedBlockID ? pinnedDocID : followDocID();
    }

    function defaultSelect() {
        if (selectedBlockID != "") return;
        for (const b of topBlocks) {
            if (b.type == "s") {
                // 轻通道 content=超级块整体纯文本，首子块文本是其子集——includes 语义与
                // 原 DOM 版（firstElementChild.textContent）等价
                const t = removeInvisibleChars(b.content || "", true);
                if (t.includes("outline")) {
                    mountProtyle(b.id);
                    return;
                }
            }
        }
        mountProtyle(blocks.at(0)?.id);
    }

    async function reloadBlocks(select = true) {
        const docID = activeDocID();
        if (!docID) return;
        const row = await siyuan.getRowByID(docID);
        if (!row.id) return;
        docName = row.content;
        onDocName?.(docName);
        // 期5 方案 A（轻通道）：列表只要顶层元数据——原整树 getBlockDOM（巨书 25~39s/24MB）
        // 换 getChildBlocks 平铺快通道（0.55s 量级、文档真序、自带纯文本 content）
        topBlocks = await siyuan.getChildBlocks(row.id);
        blocks = secsFromChildRows(topBlocks);
        if (select) defaultSelect();
    }

    function closeProtyle() {
        editor?.childNodes?.forEach((e) => e.parentElement?.removeChild(e));
        pob?.p?.destroy();
        pob?.ob?.disconnect();
        pob = null;
    }

    function mountProtyle(blockID: string) {
        if (!blockID) return;
        if (!editor) return;
        selectedBlockID = blockID;
        closeProtyle();
        // 上下布局=auto（自然高）；侧边布局须 0——flex 收缩前提，inline auto 会压死
        // .sideMain 链的 min-height:0（右栏被内容撑破，blockside □2 实锤）
        editor.style.minHeight = sideLayout ? "0" : "auto";
        pob = createProtyle(blockID, getTomatoPluginInstance());
        if (pob && pob.p && pob.ob) {
            editor.appendChild(pob.p.protyle.element);
            // createProtyle 给 element inline min-height:auto（自然高语义），侧边布局同因覆盖为 0
            if (sideLayout) pob.p.protyle.element.style.minHeight = "0";
        }
    }
    function locate() {
        OpenSyFile2(getTomatoPluginInstance(), selectedBlockID);
    }
    function headingIndent(block: Block): number {
        const m = block.subtype?.match(/^h(\d)$/);
        return m ? (Number(m[1]) - 1) * 16 : 0;
    }
</script>

<!-- maxWidth 无单位是故意的历史现状：非法值被忽略=宽度不钳制，保住「自由拉宽的第二视口」；勿「修复」成 200px。
     height/minWidth 布局联动（blockside □2）：侧边布局=显式 70vh（definite 高度是右栏 protyle 自滚
     前提，fbfeat □1）+ minWidth 480 保分栏可用宽；上下布局不传=面板自然高+回放存档 h 的现状语义 -->
<DialogSvelte
    maxWidth="200"
    height={sideLayout ? "70vh" : undefined}
    minWidth={sideLayout ? 480 : undefined}
    show={show && $navSourceBlock}
    title={docName}
    {dm}
    savePositionKey="块编辑器 2025年9月1日22:06:25"
    {posOverride}
    onClose={() => onCollapse?.()}
>
    {#snippet dialogInner()}
        {#snippet secButtons()}
            {#each blocks as block (block.id)}
                <button
                    class="secBtn"
                    class:secOn={selectedBlockID == block.id}
                    style="margin-left: {headingIndent(block)}px"
                    title={block.content}
                    onclick={() => mountProtyle(block.id)}
                    ondblclick={() => {
                        // 双击=折叠钮快捷版：选中该节并收列表让正文最大化（目录侧边化 brainstorm 定稿）；
                        // 单击幂等无害，click/dblclick 并存无需延迟区分；侧边布局不收（列表=侧栏主体，blockside □2）
                        mountProtyle(block.id);
                        if (!sideLayout) {
                            secCollapsed = true;
                            secTouched = true;
                        }
                    }}>{block.content}</button
                >
            {/each}
        {/snippet}
        <div class="sticky-header">
            {#if pinnedBlockID}
                <div class="pinBar">
                    <span class="pinCrumb">{@html icon("iconPin", 12)} {docName}{#if pinnedTitle}<span class="pinCrumbSec"> › {pinnedTitle}</span>{/if}</span>
                    <button
                        aria-label={tomatoI18n.取消钉住}
                        class="b3-button b3-button--text tomato-button b3-tooltips b3-tooltips__sw unpinBtn"
                        onclick={unpin}>{@html icon("iconLock", 12)}</button
                    >
                </div>
            {/if}
            <!-- 工具行 tip 一律 __sw（朝下西南锚）：行贴 dialog-content(overflow:auto) 顶界，
                 朝上弹（__n）气泡顶 17px 必被裁（2026-09-16 群反馈）；__s 居中锚贴右缘溢尾巴 -->
            <div class="btnLine">
                <!-- 节列表收/展（fballfeedback □6）：行首（节列表正上方）；态显操作方向 ▾收/▸展。
                     □8c：无节可收（纯段落文档 secsFromChildRows 空）时禁用置灰防空转——在场不消失防跳动；
                     侧边布局下收起职能被布局切换钮承接，同款禁用置灰（blockside □2） -->
                <button
                    aria-label={secCollapsed ? tomatoI18n.展开节列表 : tomatoI18n.收起节列表}
                    aria-expanded={!secCollapsed}
                    disabled={!blocks.length || sideLayout}
                    class="b3-button b3-button--text btnIcon b3-tooltips b3-tooltips__sw"
                    onclick={toggleSecs}>{@html icon(secCollapsed ? "iconRight" : "iconDown", 14)}</button
                >
                <!-- 布局切换（blockside □2）：上下↔侧边，态显操作方向（与折叠钮同约定）；
                     记忆 localStorage；移动端恒上下无此钮 -->
                {#if !events.isMobile}
                    <button
                        aria-label={sideLayout ? tomatoI18n.切换为上下布局 : tomatoI18n.切换为侧边布局}
                        class="b3-button b3-button--text btnIcon b3-tooltips b3-tooltips__sw"
                        onclick={toggleLayout}>{@html icon(sideLayout ? "iconLayoutBottom" : "iconLayoutRight", 14)}</button
                    >
                {/if}
                <!-- □5 跟随态可钉：钉住当前跟随文档（右键 pinFromMenu 同款 PinState）；钉住态隐藏（pinBar 的 🔓 承接取消）。
                     □8b：改恒渲染+btnHidden 占位——原 {#if} 摘除钮=行首收/展钮随右对齐整体右移 31px 从指针下跑掉 -->
                <button
                    aria-label={tomatoI18n.钉住当前文档}
                    class="b3-button b3-button--text btnIcon b3-tooltips b3-tooltips__sw"
                    class:btnHidden={!!pinnedBlockID}
                    onclick={() => pinBlock(followDocID())}
                    >{@html icon("iconPin", 14)}</button
                >
                <button
                    aria-label={tomatoI18n.定位}
                    class="b3-button b3-button--text btnIcon b3-tooltips b3-tooltips__sw"
                    onclick={locate}
                    >{@html icon("iconFocus", 14)}</button
                >
                <button
                    aria-label={tomatoI18n.刷新}
                    class="b3-button b3-button--text btnIcon b3-tooltips b3-tooltips__sw"
                    onclick={() => reloadBlocks()}
                    >{@html icon("iconRefresh", 14)}
                </button>
                <button
                    aria-label={tomatoI18n.超级块}
                    class="b3-button b3-button--text btnIcon b3-tooltips b3-tooltips__sw"
                    onclick={async () => {
                        let text = "";
                        if (!dm) text = "outline";
                        if (pinnedBlockID) {
                            const id = await appendSuperBlock(pinnedDocID, text);
                            pinnedBlockID = id;
                            pinnedTitle = text;
                            // ➕ 换钉终态=右键钉单块（新 sb≠rootID、正文只看它），自动收起同规（fballfeedback □6；
                            // 侧边布局不收，blockside □2 守卫）
                            if (!secTouched && !sideLayout) secCollapsed = true;
                            await reloadBlocks(false);
                            mountProtyle(id);
                            syncPin();
                        } else {
                            const id = await appendSuperBlock($currentBockEditorDocID, text);
                            mountProtyle(id);
                        }
                    }}
                    >{@html icon("iconAdd", 14)}
                </button>
            </div>
            {#if !sideLayout && !secCollapsed}
                <div class="secList">
                    {@render secButtons()}
                </div>
            {/if}
        </div>
        {#if sideLayout}
            <!-- 侧边布局（blockside □2）：左目录右内容各栏独立滚动；工具行横贯两栏留在头部 -->
            <div class="sideSplit">
                <div class="sideNav" style="flex-basis: {sideRatio * 100}%">
                    <div class="secList sideSecList">
                        {@render secButtons()}
                    </div>
                </div>
                <!-- 比例拖条（blockside □3）：4px 本体+负 margin 扩热区；比例 clamp 15%~50% -->
                <div
                    class="sideDrag"
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={tomatoI18n.拖动调整目录栏宽度}
                    onpointerdown={startSideDrag}
                ></div>
                <div class="qeContent sideMain">
                    <div bind:this={editor}></div>
                </div>
            </div>
        {:else}
            <!-- 期4 Top5：内容区包装容器——h1 压制/底缘渐隐/列表与内容区 12px 区距都挂这里（scoped 防泄全局） -->
            <div class="qeContent">
                <div bind:this={editor}></div>
            </div>
        {/if}
    {/snippet}
</DialogSvelte>

<style>
    /* 期2 Top1（spec §2）：工具行 sprite 化+紧凑右对齐——去 flex:1 均摊，28px 方形热区
       gap 4px；图标色 on-surface、hover 加底变 on-background（标题栏关闭钮同构） */
    .btnLine {
        display: flex;
        width: 100%;
        justify-content: flex-end;
        gap: 4px;
    }
    .btnLine .b3-button {
        flex: 0 0 auto;
        width: 28px;
        height: 28px;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 6px;
        color: var(--b3-theme-on-surface);
    }
    .btnLine .b3-button:hover {
        background: var(--b3-list-hover);
        color: var(--b3-theme-on-background);
    }
    /* □8b：占位防漂移专用——visibility 保盒模型（display:none/fn__none 不占位照样漂移）；
       隐藏态不接事件不进无障碍树，tip/焦点天然关停 */
    .btnLine .btnHidden {
        visibility: hidden;
    }
    .sticky-header {
        position: sticky;
        /* -8px=DialogSvelte dialog-content padding-top（期3 Top3 放宽 5→8）联动补偿：
           滚动时 header 上浮贴面板顶不露缝 */
        top: -8px;
        z-index: 5;
        /* 期3 Top3：表面色统一——与面板同为 background 底（原 surface 灰带+顶缝视觉噪音，
           vision P2-3），同色遮内容滚动遮挡仍有效；宽高布局不动（期2 右缘共线依赖 content 8px） */
        background: var(--b3-theme-background);
        padding: 5px 0 0 0;
        margin: 0;
    }
    .pinBar {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 0 4px 0;
    }
    .pinCrumb {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--b3-font-size-mini, 12px);
        color: var(--b3-theme-on-surface);
    }
    /* □8a：块名摘要段提一档（vision P2-2——on-surface 灰 12px 亮色 3.5:1 贴线；
       on-background 与工具行 hover 提色同款先例，兼拉开文档名/摘要层级） */
    .pinCrumbSec {
        color: var(--b3-theme-on-background);
    }
    .unpinBtn {
        flex: 0 0 auto;
        /* 28px 方形热区：与工具行/标题栏钮同构，右缘共线（期2 vision P1-1） */
        width: 28px;
        height: 28px;
        padding: 0;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    /* 期2 Top2（spec §2）：节列表去描边 list-row 化——未选中透明底无边框 hover 显底；
       选中=primary-lightest 底+左侧 2px 主色指示条；行高 28px 圆角 6px gap 4px */
    .secList {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
        max-height: 30vh;
        overflow-y: auto;
        padding: 2px 0 4px 0;
    }
    .secBtn {
        /* block 而非 flex：text-overflow:ellipsis 对 flex 容器不生效（匿名 flex item
           不吃省略号，长文=行尾硬裁切半个字形），垂直居中改走 line-height */
        display: block;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 28px;
        line-height: 28px;
        /* secList 是 max-height 钳制的 column flex，默认 shrink=1 会把多行按钮整体纵向
           压扁成密排墨块（heading 多时 28px→个位数px，2026-09-07 群反馈实锤） */
        flex-shrink: 0;
        padding: 0 8px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
        font-size: var(--b3-font-size-mini, 12px);
    }
    .secBtn:hover {
        background: var(--b3-list-hover);
    }
    .secOn {
        background: var(--b3-theme-primary-lightest);
        box-shadow: inset 2px 0 0 var(--b3-theme-primary);
        /* 选中文字提一档（期2 vision P2-2）：暗色 12px 文字在 lightest 底上 4.11:1 不足；
           on-background 补对比兼强化选中层级 */
        color: var(--b3-theme-on-background);
    }
    .pinCrumb :global(svg) {
        vertical-align: -1px;
        margin-right: 2px;
    }
    /* 期4 Top5（spec §2）：内容区面板化——列区与内容区 12px 区距；面板内 h1 压到
       1.3em（正文级上下文，scoped 组合选择器只作用于本容器不泄全局编辑器）；
       底缘渐隐提示可滚（同吃「底部切行渐隐」P2） */
    .qeContent {
        position: relative;
        margin-top: 12px;
    }
    .qeContent :global(.protyle-wysiwyg .h1) {
        /* 思源 heading 是 div.h1 类非 <h1> 标签（e2e 实证 42px 默认档），选类不选标签 */
        font-size: 1.3em;
    }
    .qeContent::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 14px;
        background: linear-gradient(to bottom, transparent, var(--b3-theme-background));
        pointer-events: none;
    }
    /* 侧边布局（blockside □2）：左目录右内容两栏独立滚动。height:100% 链的前提=面板
       definite 高（height="70vh" 或存档 px 回放）——面板自然高时本链不成立勿在上下布局复用；
       右栏滚动交给内部 protyle（overflow:hidden + editor 定高，fbfeat □1 无约束被撑全高教训） */
    .sideSplit {
        display: flex;
        height: 100%;
        gap: 8px;
        margin-top: 8px;
        min-height: 0;
    }
    .sideNav {
        /* basis 由模板 inline style 控制（比例拖条，blockside □3）；此处 auto 仅为兜底缺省 */
        flex: 0 0 auto;
        min-width: 0;
        overflow-y: auto;
        padding: 2px 4px 4px 0;
    }
    /* 比例拖条（blockside □3）：4px 视觉条+左右各 2px 负 margin 扩热区到 8px；
       hover/active 显 primary 细条反馈 */
    .sideDrag {
        flex: 0 0 4px;
        margin: 0 -2px;
        z-index: 1;
        cursor: col-resize;
        touch-action: none;
        border-radius: 2px;
        /* blockside vision P2（tailbatch □7）：常显 1px 细线（居中于 4px 热区）——两栏
           边界平时可见，hover 仍换成 4px 主色浅底热区提示可拖 */
        background: linear-gradient(var(--b3-border-color), var(--b3-border-color)) center / 1px 100% no-repeat;
        transition: background-color 0.15s;
    }
    .sideDrag:hover,
    .sideDrag:active {
        background: var(--b3-theme-primary-lighter);
    }
    /* 侧栏列表解除 30vh 钳制（栏内全高滚动，收起语义不适用） */
    .sideSecList {
        max-height: none;
        overflow-y: visible;
        padding: 0;
    }
    .sideMain {
        flex: 1 1 0;
        min-width: 0;
        margin-top: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    .sideMain > div {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
    .sideMain > div > :global(.protyle) {
        flex: 1;
        min-height: 0;
    }
</style>
