<script lang="ts">
    // 批注编辑/创建弹窗：内嵌 Protyle 完整富文本草稿编辑器（草稿块机制，mini-spec「编辑」节）。
    // 链路：开弹窗=建独立草稿块（annoDraft）→ createProtyle 挂载 → Ctrl/Cmd+Enter 保存
    // （草稿 kramdown 剥壳 → onSave 由 Annotations 编排写属性）→ 关闭即删草稿（拍板：即用即删+重开回填）。
    // onSave 返回 false = 写失败 → 弹窗不关、草稿保留（写失败铁律）。
    // □2 创建弹窗统一：create=true 走创建模式（块级「N 个块」注记+闪卡开关，语义并入自退役的 AnnoInput；
    // initialText=""，annoId=预生成 id 透传落库=创建期 AI 对话保存后可续）。
    // □8：编辑器下方「问 AI」工具行 + AnnoChat 对话区（上下分区拍板；视觉稿
    // docs/tomato-annochat-visual-spec.md §7.1——展开编辑器 60vh→32vh、移动端全屏接管）。
    // 编辑器双模式（2026-09-01）：plain=纯文本 textarea 秒开（跳过草稿块+SQL 索引等待+protyle
    // 挂载整条链，问 AI/闪卡/Ctrl+Enter 全保留）；rich=原富文本。弹窗右上切换钮即切即记
    // （commentBoxAnnoEditorMode.write=记住选择），内容双向迁移不丢字。
    import { onDestroy, onMount } from "svelte";
    import { confirm } from "siyuan";
    import { createProtyle } from "./libs/bkUtils";
    import { DestroyManager } from "./libs/destroyer";
    import { deleteDraftBlock, newDraftBlock, readDraftText } from "./libs/annoDraft";
    import { getAIConfig } from "./libs/openAI";
    import { events } from "./libs/Events";
    import { commentBoxAddFlashCard, commentBoxAnnoEditorFontSize, commentBoxAnnoEditorMode } from "./libs/stores";
    import { getTomatoPluginInstance, siyuan } from "./libs/utils";
    import { debugLog } from "./libs/logUtils";
    import { vipVerified } from "./libs/user";
    import { hidePanelTip, showPanelTip } from "./libs/panelTip";
    import { tomatoI18n } from "./tomatoI18n";
    import AnnoChat from "./AnnoChat.svelte";

    interface Props {
        dm: DestroyManager;
        /** 批注条目 id（AI 对话缓存 key；Annotations.openEdit 传入） */
        annoId: string;
        /** 被批注块原文（AI 讨论上下文；剥 IAL 尾行+本条标记链接后的 kramdown） */
        source: string;
        /** 选区级批注的原文快照（上下文展示，不参与保存） */
        selText: string;
        /** 当前批注正文（kramdown），回填草稿块=重开续写 */
        initialText: string;
        /** 气泡「问 AI」入口：挂载后自动展开讨论区（AI 未配置仍走 confirm 引导，□3） */
        autoChat?: boolean;
        /** AI 讨论上下文补强（□3）：文档 hpath + 前后相邻块（空=缺省不出段） */
        docTitle?: string;
        prev?: string;
        next?: string;
        /** 创建模式（□2 统一）：块级注记+闪卡开关出场；annoId=预生成 id 透传落库 */
        create?: boolean;
        /** 块级批注：覆盖的顶层块数（仅创建模式展示） */
        blockCount?: number;
        /** 入口预建的草稿块 promise（rich 提速：与入口取数并行启动；一次性消费，切换自建） */
        draftReady?: Promise<string> | null;
        onSave: (text: string) => Promise<boolean>;
    }
    let { dm, annoId, source, selText, initialText, autoChat = false, docTitle = "", prev = "", next = "", create = false, blockCount = 0, draftReady = null, onSave }: Props = $props();

    type EditorMode = "rich" | "plain";
    let mode = $state<EditorMode>(commentBoxAnnoEditorMode.get() === "plain" ? "plain" : "rich");
    /** plain 模式正文（rich 模式不用）；onMount 快照 initialText（编辑链回填，kramdown 以纯文本形态显示可接受） */
    let plainText = $state("");
    let plainArea: HTMLTextAreaElement | undefined = $state();
    /** 切换守卫：迁移读草稿/建草稿期间防双击重入（disabled 绑定参与渲染须响应式） */
    let switching = $state(false);
    /** 编辑器字号（两模式统一，CSS 变量下传；12~22 clamp，调即 write=记住偏好） */
    let fontSize = $state(Math.min(22, Math.max(12, commentBoxAnnoEditorFontSize.get() || 16)));

    let root: HTMLDivElement | undefined = $state();
    let editor: HTMLDivElement | undefined = $state();
    let loading = $state(true);
    let saving = $state(false);
    let draftID = "";
    /** 可变盒子：草稿清理钩须在 await 之前挂（reasoning P2-2——loading 窗口内关闭弹窗时
     *  dm 已销毁，晚挂的钩永不执行=草稿孤儿；钩读盒子取「挂靠时刻之后才写入」的 id） */
    const draftRef = { id: "" };
    let pob: ReturnType<typeof createProtyle> | null = null;

    // □8 AI 讨论区状态（AnnoChat 常驻挂载，收起仅隐藏——spec §0 收起语义）
    let chatOpen = $state(false);
    let annoChatRef: AnnoChat | undefined = $state();
    let canCompress = $state(false);
    let chatBusy = $state(false);

    onMount(async () => {
        plainText = initialText; // prop 快照放闭包内（svelte state_referenced_locally 基线零告警）
        // Ctrl/Cmd+Enter 捕获在 protyle 之前（protyle 在 wysiwyg 上 bubble 处理键盘）
        root?.addEventListener("keydown", onKeydown, true);
        dm.add("draft", () => {
            closeEditor();
            if (draftRef.id) void deleteDraftBlock(draftRef.id);
        });
        if (mode === "plain") {
            loading = false;
            debugLog("anno_edit", "phase=plain_ready ms=0", "anno");
            requestAnimationFrame(() => plainArea?.focus());
            if (autoChat) void toggleChat();
            return;
        }
        await mountRich(initialText);
    });

    onDestroy(() => {
        root?.removeEventListener("keydown", onKeydown, true);
        closeEditor();
        dm.destroyBy(null); // 全量销毁：dialog 与 draft 两条清理都执行
    });

    /** rich 编辑器就位链：建草稿（或消费入口预建）→ 挂 protyle → 聚焦。onMount 初次与 plain→rich 切换共用 */
    async function mountRich(seed: string) {
        const t0 = Date.now();
        const prebuilt = draftReady;
        if (prebuilt) draftReady = null; // 一次性：切换场景不得复用已消费的 promise
        const id = await (prebuilt ?? newDraftBlock(seed));
        debugLog("anno_edit", `phase=draft_ready ms=${Date.now() - t0} prebuilt=${!!prebuilt}`, "anno");
        if (dm.destroyed) {
            // loading 窗口内弹窗已被关闭：onMount 继续跑，就地补删草稿、不再挂 DOM（reasoning P2-2）
            if (id) void deleteDraftBlock(id);
            return;
        }
        draftID = id;
        draftRef.id = id;
        if (!draftID || !editor) {
            siyuan.pushMsg(tomatoI18n.批注加载失败);
            destroy();
            return;
        }
        pob = createProtyle(draftID, getTomatoPluginInstance());
        editor.appendChild(pob.p.protyle.element);
        // loading 先落：下方聚焦链任何异常都不得卡死保存键（Ctrl+Enter/button 均被 loading 守卫拦）
        loading = false;
        debugLog("anno_edit", `phase=loaded ms=${Date.now() - t0}`, "anno");
        // 尽力聚焦：合成 click 触发 protyle 聚焦链路。必须等 wysiwyg 渲染出首块再点——空壳时
        // 内核 click 处理器读 lastElementChild.getBoundingClientRect 直接抛 TypeError，异常会同步
        // 炸出 onMount（□2 e2e 实锤：创建场景文档侧选区非空必踩，保存键永久失效）；等不到/仍炸
        // 都只丢自动聚焦不阻塞（用户手点兜底），故整体 try/catch
        try {
            const editable = pob.p.protyle.element.querySelector('[contenteditable="true"]');
            for (let i = 0; i < 20 && !dm.destroyed && editable && editable.childElementCount === 0; i++) {
                await new Promise((r) => setTimeout(r, 100));
            }
            if (!dm.destroyed) {
                editable?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            }
        } catch (e) {
            console.warn("[tomato anno] draft focus failed:", e);
        }
        // □3 气泡「问 AI」入口：编辑器就绪后自动展开讨论区（草稿建好再展，视觉一次到位；
        // AI 未配置时 toggleChat 内部走 confirm 引导不展开）
        if (autoChat) void toggleChat();
    }

    function closeEditor() {
        if (!pob) return;
        pob.ob?.disconnect();
        pob.p?.destroy();
        // 切 plain 场景编辑器仍在弹窗 DOM 内须显式摘（关弹窗场景 Dialog 连根拔无需但摘了无害）
        pob.p?.protyle?.element?.remove();
        pob = null;
    }

    /** 编辑器形态切换（分段钮带目标态）：内容双向迁移 + 记住选择（write 落盘，下次开窗直接用上次的形态） */
    async function switchMode(target: EditorMode) {
        if (target === mode || switching || loading || saving) return;
        hidePanelTip(); // 切换后分段高亮已变，悬空旧 tip 会误导
        switching = true;
        try {
            if (mode === "plain") {
                mode = "rich"; // 先切：模板立即落 loading hint
                loading = true;
                debugLog("anno_mode_switch", `to=rich len=${plainText.length}`, "anno");
                await mountRich(plainText.trim() ? plainText : "");
            } else {
                const text = draftID ? await readDraftText(draftID).catch(() => "") : "";
                closeEditor();
                if (draftRef.id) {
                    void deleteDraftBlock(draftRef.id);
                    draftRef.id = "";
                    draftID = "";
                }
                mode = "plain";
                plainText = text;
                loading = false;
                debugLog("anno_mode_switch", `to=plain len=${text.length}`, "anno");
                requestAnimationFrame(() => plainArea?.focus());
            }
            commentBoxAnnoEditorMode.write(mode);
        } finally {
            switching = false;
        }
    }

    /** 字号调节（12~22 clamp；调即落盘=记住偏好；CSS 变量两模式同源，切换不跳变） */
    function bumpFont(delta: number) {
        const next = Math.min(22, Math.max(12, fontSize + delta));
        if (next === fontSize) return;
        fontSize = next;
        commentBoxAnnoEditorFontSize.write(fontSize);
    }

    function onKeydown(ev: KeyboardEvent) {
        if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey) && !ev.isComposing) {
            ev.preventDefault();
            ev.stopPropagation();
            save();
        }
    }

    export async function destroy() {
        dm.destroyBy(null);
    }

    export async function save() {
        if (saving || loading) return;
        saving = true;
        try {
            // readDraftText 在 try 内（reasoning P2-1）：草稿块被误清时炸成 toast，而非保存键静默失效
            const text = mode === "plain" ? plainText : await readDraftText(draftID);
            if (text.trim().length === 0) {
                siyuan.pushMsg(tomatoI18n.批注内容为空);
                return;
            }
            if (await onSave(text)) destroy();
        } catch (e) {
            console.error("[tomato anno] edit save failed:", e);
            siyuan.pushMsg(tomatoI18n.批注写入失败);
        } finally {
            saving = false;
        }
    }

    // ---- □8 AI 讨论区 ----

    /** 展开=首次预检 AI 配置（无→confirm 引导不展开，spec §9.1）；收起=隐藏不卸载。
     *  探测返回时弹窗可能已被关闭（autoChat 跨 loading 窗口/用户手快）：晚归结果就地丢弃，
     *  不再弹孤儿 confirm（reasoning P2-2） */
    async function toggleChat() {
        if (!chatOpen) {
            const cfg = await getAIConfig();
            if (dm.destroyed) return;
            if (!cfg) {
                confirm(tomatoI18n.未配置AI, tomatoI18n.尚未配置AI引导, () => { /* 引导即止 */ });
                return;
            }
            chatOpen = true;
            return;
        }
        chatOpen = false;
    }

    /** 压缩结果追加正文末尾（空行分隔）。plain 模式直改 textarea 值；rich 模式 sb 整体重写
     *  =newDraftBlock 同形态，IAL 带 id 保块 id。草稿块是 temp 工作文件——AI 永不直接写盘
     *  边界画在这里（保存批注才写属性） */
    async function appendDraft(md: string) {
        if (!md.trim()) return;
        if (mode === "plain") {
            plainText = plainText.trim() ? `${plainText}\n\n${md}` : md;
            return;
        }
        if (!draftID) return;
        const old = await readDraftText(draftID).catch(() => "");
        await siyuan.safeUpdateBlock(draftID, `{{{row\n${old}\n\n${md}\n}}}\n{: id="${draftID}"}`);
    }
</script>

<div class="container" class:is-chat-open={chatOpen} class:is-mobile={events.isMobile} bind:this={root}>
    {#if selText}
        <div class="anno-sel-quote">{selText}</div>
    {:else if create && blockCount > 0}
        <div class="anno-sel-quote">{tomatoI18n.块级} · {blockCount} {tomatoI18n.个块}</div>
    {/if}
    <div class="anno-edit-wrap" style="--anno-fs: {fontSize}px">
        <!-- 编辑器工具条（2026-09-01 用户反馈浮钮小/淡/难找→显式工具条）：模式分段+字号调节 -->
        <div class="anno-toolbar">
            <div class="anno-mode-seg" role="group">
                <button
                    class="anno-seg-btn"
                    class:is-active={mode === "rich"}
                    disabled={switching || loading}
                    onclick={() => switchMode("rich")}
                >{tomatoI18n.富文本}</button>
                <button
                    class="anno-seg-btn"
                    class:is-active={mode === "plain"}
                    disabled={switching || loading}
                    onclick={() => switchMode("plain")}
                >{tomatoI18n.纯文本}</button>
            </div>
            <span class="fn__flex-1"></span>
            <button
                class="anno-font-btn"
                aria-label={tomatoI18n.减小字号}
                onmouseenter={(e) => showPanelTip(e.currentTarget)}
                onmouseleave={hidePanelTip}
                disabled={fontSize <= 12}
                onclick={() => bumpFont(-1)}
            >A−</button>
            <span class="anno-font-label">{fontSize}</span>
            <button
                class="anno-font-btn"
                aria-label={tomatoI18n.增大字号}
                onmouseenter={(e) => showPanelTip(e.currentTarget)}
                onmouseleave={hidePanelTip}
                disabled={fontSize >= 22}
                onclick={() => bumpFont(1)}
            >A+</button>
        </div>
        <div class="anno-edit-editor" class:is-loading={loading} bind:this={editor}>
            {#if loading}
                <div class="anno-edit-hint">{tomatoI18n.批注编辑器加载中}</div>
            {:else if mode === "plain"}
                <textarea
                    class="anno-plain-area"
                    bind:this={plainArea}
                    bind:value={plainText}
                    placeholder={tomatoI18n.批注占位}
                ></textarea>
            {/if}
        </div>
    </div>
    <!-- 问 AI 工具行（收起=入口 / 展开=对话区标题行；div 承载——内含压缩 button 不能嵌 button） -->
    <div
        class="anno-ai-bar"
        role="button"
        tabindex="0"
        aria-expanded={chatOpen}
        aria-label={chatOpen ? tomatoI18n.收起AI讨论区 : tomatoI18n.问AI}
        onclick={toggleChat}
        onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void toggleChat();
            }
        }}
    >
        <svg><use xlink:href={chatOpen && events.isMobile ? "#iconBack" : "#iconSparkles"}></use></svg>
        <span class="anno-ai-bar__label">{chatOpen ? tomatoI18n.AI讨论区 : tomatoI18n.问AI}</span>
        <span class="anno-ai-bar__tail">
            {#if chatOpen}
                <button
                    class="anno-ai-compress b3-tooltips b3-tooltips__n"
                    aria-label={tomatoI18n.压缩成笔记说明}
                    disabled={!canCompress || chatBusy}
                    onclick={(e) => {
                        e.stopPropagation();
                        void annoChatRef?.compress();
                    }}
                ><svg><use xlink:href="#iconContract"></use></svg>{tomatoI18n.压缩成笔记}{#if $vipVerified !== true}<span class="anno-ai-compress__pro">Pro</span>{/if}</button>
                {#if !events.isMobile}
                    <svg class="anno-ai-bar__chev"><use xlink:href="#iconUp"></use></svg>
                {/if}
            {:else}
                <svg class="anno-ai-bar__chev"><use xlink:href="#iconDown"></use></svg>
            {/if}
        </span>
    </div>
    <AnnoChat
        bind:this={annoChatRef}
        {dm}
        mobile={events.isMobile}
        open={chatOpen}
        {annoId}
        {source}
        {selText}
        {docTitle}
        {prev}
        {next}
        getAnnoText={async () => (mode === "plain" ? plainText : await readDraftText(draftID))}
        onCompressed={async (md) => {
            await appendDraft(md);
            chatOpen = false; // 压缩完成自动收起，回编辑器过目笔记（设计第 3 段拍板）
        }}
        bind:canCompress
        bind:busy={chatBusy}
    />
    <div class="row">
        {#if create}
            <!-- 闪卡开关（创建语义保留，AnnoInput 并入）：绑定持久设置，保存时 doSave 读值加卡 -->
            <label class="box anno-flash">
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$commentBoxAddFlashCard}
                    onchange={() => commentBoxAddFlashCard.write()}
                />
                {tomatoI18n.闪卡}
            </label>
        {/if}
        <span class="fn__flex-1"></span>
        <button class="b3-button b3-button--cancel box" onclick={destroy}>{tomatoI18n.取消}</button>
        <button class="b3-button b3-button--text box" disabled={saving || loading} onclick={save}>
            {tomatoI18n.保存} (⌘↵)
        </button>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto; /* □3 尺寸记忆：Dialog 固定高时撑满挂载点（挂载点 flex 链见 Annotations.openEdit） */
        /* 起步高度（□3 拍板 ~50vh）：无记忆时草稿文字少也不再又窄又矮 */
        min-height: 50vh;
        /* 弹窗总高兜底（vision P0-1 矮视口溢出）：超限时编辑器/对话区按 flex 协作收缩，
         *  输入行与按钮行永远在画面内；90vh 扣 Dialog 标题栏约 64px */
        max-height: calc(90vh - 64px);
    }
    .anno-sel-quote {
        max-height: 3.2em;
        overflow: hidden;
        font-size: 12px;
        line-height: 1.6;
        color: var(--b3-theme-on-surface-light, #999);
        border-left: 2px solid var(--b3-theme-on-surface-light, #999);
        padding: 2px 8px;
        margin: 4px 0;
        white-space: pre-line;
    }
    /* wrap 承担布局与限高（字号 CSS 变量锚点，两模式同源切换不跳变）；toolbar+editor 连体 */
    .anno-edit-wrap {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto; /* grow（□3）：container 富余高度给编辑器（max-height 60vh 封顶）；矮视口可收缩（min-height 保底），配合 .container max-height（vision P0-1） */
        min-height: 160px;
        max-height: 60vh;
        margin: 4px 2px;
        /* □8 展开对话区时 60vh→32vh 有过渡；两端显式值，max-height 可动画（视觉稿 §7.1） */
        transition: max-height .2s cubic-bezier(0, 0, .2, 1) 0ms;
    }
    .container.is-chat-open .anno-edit-wrap {
        max-height: 32vh; /* 基础态 60vh 不动，仅压缩上限 */
    }
    /* 工具条（框顶连体段）：模式分段+字号调节；钮在非滚动容器内，panelTip fixed 不裁 */
    .anno-toolbar {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 32px;
        padding: 0 6px;
        box-sizing: border-box;
        border: 1px solid var(--b3-border-color);
        border-bottom: none;
        border-radius: var(--b3-border-radius) var(--b3-border-radius) 0 0;
        background: var(--b3-theme-surface-lighter);
    }
    .anno-mode-seg {
        display: inline-flex;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        overflow: hidden;
    }
    .anno-seg-btn {
        min-width: 56px;
        height: 22px;
        padding: 0 10px;
        border: none;
        background: transparent;
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        transition: background .15s, color .15s;
    }
    .anno-seg-btn + .anno-seg-btn { border-left: 1px solid var(--b3-border-color); }
    .anno-seg-btn.is-active {
        background: var(--b3-theme-primary-lightest);
        color: var(--b3-theme-primary);
        font-weight: 500;
    }
    .anno-seg-btn:not(.is-active):not(:disabled):hover { background: var(--b3-list-hover); }
    .anno-seg-btn:disabled { opacity: .38; cursor: default; }
    .anno-font-btn {
        width: 28px;
        height: 24px;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        background: transparent;
        color: var(--b3-theme-on-surface);
        font-size: 13px;
        font-family: inherit;
        cursor: pointer;
        transition: background .15s;
    }
    .anno-font-btn:hover:not(:disabled) { background: var(--b3-list-hover); }
    .anno-font-btn:disabled { opacity: .38; cursor: default; }
    .anno-font-label {
        min-width: 20px;
        text-align: center;
        font-size: 12px;
        color: var(--b3-theme-on-surface-light, #999);
        font-variant-numeric: tabular-nums;
    }
    .anno-edit-editor {
        flex: 1 1 auto; /* 撑满 wrap（grow）；min-height 留 auto——protyle 按内容收缩时不塌底，wrap 的 160px 保底 */
        overflow-y: auto;
        /* 画布底色（vision P1-1）：protyle 按内容收缩撑不满拉伸容器，整框surface 底色融入白区
         *  =「完整编辑器画布」观感；滚动模型不变（容器滚）；上圆角让给连体 toolbar */
        background: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        border-radius: 0 0 var(--b3-border-radius) var(--b3-border-radius);
        /* 顶贴 toolbar（rich 模式 protyle 自带底色，顶 padding 会显白缝破坏连体）；
           plain 的顶距由 textarea 自身 padding-top 4px 提供 */
        padding: 0 8px 4px;
    }
    /* 富文本侧字号同源（protyle 是内核 DOM，须 :global 组合命中；字号档随设置立即生效） */
    .anno-edit-editor :global(.protyle-wysiwyg) {
        font-size: var(--anno-fs, 16px);
    }
    .anno-edit-editor.is-loading {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .anno-edit-hint {
        font-size: 13px;
        color: var(--b3-theme-on-surface-light, #999);
    }
    /* plain 模式 textarea：透明融入 editor 画布（surface 底色/边框由 editor 提供）；
       字号走 --anno-fs 与 rich 同源；顶补 4px 与左右 8px 对称 */
    .anno-plain-area {
        display: block;
        width: 100%;
        min-height: 120px;
        border: none;
        outline: none;
        resize: none;
        background: transparent;
        color: var(--b3-theme-on-surface);
        font-family: inherit;
        font-size: var(--anno-fs, 16px);
        line-height: 1.6;
        padding: 4px 0 0;
    }
    .row {
        display: flex;
        align-items: center;
    }
    .box {
        padding: 4px 8px;
        margin: 4px 2px;
    }
    .anno-flash {
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    /* ---- □8 问 AI 工具行（视觉稿 docs/tomato-annochat-visual-spec.md §7.1） ---- */
    .anno-ai-bar {
        display: flex;
        align-items: center;
        gap: 6px;
        width: calc(100% - 4px);
        min-height: 36px;
        padding: 0 8px;
        margin: 4px 2px;
        box-sizing: border-box;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        background: transparent;
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        cursor: pointer;
        transition: background .15s;
    }
    .anno-ai-bar:hover { background: var(--b3-list-hover); }
    .anno-ai-bar > svg,
    .anno-ai-bar__chev {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
    }
    .anno-ai-bar__label { white-space: nowrap; }
    .anno-ai-bar__tail {
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    /* 压缩成笔记小按钮（≥1 轮对话前置可用，禁用不隐藏） */
    .anno-ai-compress {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 24px;
        padding: 0 8px;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        background: transparent;
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        transition: background .15s, opacity .15s;
    }
    .anno-ai-compress > svg { width: 12px; height: 12px; }
    .anno-ai-compress:hover:not(:disabled) { background: var(--b3-theme-surface-lighter); }
    /* disabled 不用整体 opacity——会把 Pro 徽标一起淡到不可读（vision P1）；只弱化图标与文字，
       徽标在任何状态保持实底可读（门牌语义：disabled 只说明「先对话」，功能归属不变） */
    .anno-ai-compress:disabled { cursor: default; color: var(--b3-theme-on-surface-light); }
    .anno-ai-compress:disabled > svg { opacity: .5; }
    /* 未激活时压缩按钮的 Pro 标（与 AnnoChat chip-pro 同款胶囊；激活即消） */
    .anno-ai-compress__pro {
        padding: 1px 4px;
        font-size: 9px;
        line-height: 1;
        font-weight: 600;
        border-radius: 8px;
        color: var(--b3-theme-on-primary);
        background: var(--b3-theme-primary);
    }

    /* 移动端全屏接管：编辑器/引文/按钮行让位，对话区近满屏（spec §6） */
    .container.is-chat-open.is-mobile .anno-sel-quote,
    .container.is-chat-open.is-mobile .anno-edit-wrap,
    .container.is-chat-open.is-mobile .row { display: none; }
    .container.is-chat-open.is-mobile .anno-ai-bar { min-height: 44px; }
</style>
