<script lang="ts">
    import { onMount } from "svelte";
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
        editor.style.minHeight = "auto";
        pob = createProtyle(blockID, getTomatoPluginInstance());
        if (pob && pob.p && pob.ob) {
            editor.appendChild(pob.p.protyle.element);
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

<!-- maxWidth 无单位是故意的历史现状：非法值被忽略=宽度不钳制，保住「自由拉宽的第二视口」；勿「修复」成 200px -->
<DialogSvelte
    maxWidth="200"
    show={show && $navSourceBlock}
    title={docName}
    {dm}
    savePositionKey="块编辑器 2025年9月1日22:06:25"
    {posOverride}
    onClose={() => onCollapse?.()}
>
    {#snippet dialogInner()}
        <div class="sticky-header">
            {#if pinnedBlockID}
                <div class="pinBar">
                    <span class="pinCrumb">{@html icon("iconPin", 12)} {docName}{pinnedTitle ? ` › ${pinnedTitle}` : ""}</span>
                    <button
                        aria-label={tomatoI18n.取消钉住}
                        class="b3-button b3-button--text tomato-button b3-tooltips b3-tooltips__s unpinBtn"
                        onclick={unpin}>{@html icon("iconLock", 12)}</button
                    >
                </div>
            {/if}
            <div class="btnLine">
                <!-- □5 跟随态可钉：钉住当前跟随文档（右键 pinFromMenu 同款 PinState）；钉住态隐藏（pinBar 的 🔓 承接取消） -->
                {#if !pinnedBlockID}
                    <button
                        aria-label={tomatoI18n.钉住当前文档}
                        class="b3-button b3-button--text btnIcon b3-tooltips b3-tooltips__n"
                        onclick={() => pinBlock(followDocID())}
                        >{@html icon("iconPin", 14)}</button
                    >
                {/if}
                <button
                    aria-label={tomatoI18n.定位}
                    class="b3-button b3-button--text btnIcon b3-tooltips b3-tooltips__n"
                    onclick={locate}
                    >{@html icon("iconFocus", 14)}</button
                >
                <button
                    aria-label={tomatoI18n.刷新}
                    class="b3-button b3-button--text btnIcon b3-tooltips b3-tooltips__n"
                    onclick={() => reloadBlocks()}
                    >{@html icon("iconRefresh", 14)}
                </button>
                <button
                    aria-label={tomatoI18n.超级块}
                    class="b3-button b3-button--text btnIcon b3-tooltips b3-tooltips__n"
                    onclick={async () => {
                        let text = "";
                        if (!dm) text = "outline";
                        if (pinnedBlockID) {
                            const id = await appendSuperBlock(pinnedDocID, text);
                            pinnedBlockID = id;
                            pinnedTitle = text;
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
            <div class="secList">
                {#each blocks as block (block.id)}
                    <button
                        class="secBtn"
                        class:secOn={selectedBlockID == block.id}
                        style="margin-left: {headingIndent(block)}px"
                        onclick={() => mountProtyle(block.id)}>{block.content.slice(0, 15)}</button
                    >
                {/each}
            </div>
        </div>
        <!-- 期4 Top5：内容区包装容器——h1 压制/底缘渐隐/列表与内容区 12px 区距都挂这里（scoped 防泄全局） -->
        <div class="qeContent">
            <div bind:this={editor}></div>
        </div>
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
        display: flex;
        align-items: center;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 28px;
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
</style>
