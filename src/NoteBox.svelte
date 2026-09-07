<!-- @migration-task Error while migrating Svelte code: Can't migrate code with afterUpdate. Please migrate by hand. -->
<script lang="ts">
    import { afterUpdate, tick, onDestroy, onMount } from "svelte";
    import { siyuan } from "./libs/utils";
    import { events } from "./libs/Events";
    import {
        NoteBoxID,
        getTargetID,
        insertIntoDailynote,
        noteBox,
    } from "./NoteBox";
    import {
        storeNoteBox_selectedNoteType,
        storeNoteBox_keep,
        storeNoteBox_noteCount,
        storeNoteBox_recentText,
        storeNoteBox_noteAreaText,
        storeNoteBox_selectedNotebook,
        flashThoughtsBlurClose,
        noteBoxAllKinds,
    } from "./libs/stores";
    import {
        hasPendingPlaceholder,
        imgPlaceholder,
        replacePlaceholder,
        stripPlaceholders,
        uploadAssetChain,
    } from "./libs/assetUpload";
    import { isPinned } from "./libs/ui";
    import { DestroyManager } from "./libs/destroyer";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { tomatoI18n } from "./tomatoI18n";
    import NotebookSelect from "./NotebookSelect.svelte";

    export let sm: DestroyManager = null;
    export let isDialog = false;

    let NoteTypes = ["💡"];
    let inputArea: HTMLTextAreaElement;
    let handleEscapePress = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            sm?.destroyBy();
        }
    };

    // □4 图片 compose 流状态：占位序号 / 在途上传数（失焦关抑制）/ 选图对话框在途
    let uploadSeq = 0;
    let uploading = 0;
    let pickerActive = false;
    let destroyed = false;
    let draftSaveTimer: ReturnType<typeof setTimeout> | null = null;
    // 子窗判定：#pinWindow 是内核给所有浮窗（openWindow）插的工具条元素
    // （boot/onGetConfig.ts isWindow() 分支），主窗/移动端/dialog 均无——比 isMainWin()
    // （依赖文件树 dock 存在性）更硬，且失焦关绝不能在主窗误触发（window.close 会关整个应用）
    const isChildWindow = document.getElementById("pinWindow") != null;

    // □4 失焦自动关（小记 quick-notes 可移植增强）：未 pin、无选图/上传在途时，
    // 落盘草稿后关子窗；草稿已持久化，重开不丢。save await 期间用户切回则放弃关闭
    async function handleWindowBlur() {
        if (destroyed || !flashThoughtsBlurClose.get()) return;
        if (isPinned() || pickerActive || uploading > 0) return;
        await storeNoteBox_noteAreaText.save();
        if (destroyed || document.hasFocus()) return;
        window.close();
    }
    function handleWindowFocus() {
        pickerActive = false;
    }

    onMount(async () => {
        NoteTypes = noteBoxAllKinds
            .get()
            .replaceAll("，", ",")
            .split(",")
            .map((i) => i.trim())
            .filter((i) => !!i);
        if (NoteTypes.length == 0) NoteTypes = ["💡"];
        storeNoteBox_selectedNoteType.init(NoteTypes);
        if (sm) {
            window.addEventListener("keydown", handleEscapePress);
            sm.add("Escape Key Lisener", () =>
                window.removeEventListener("keydown", handleEscapePress),
            );
        }
        if (isChildWindow) {
            window.addEventListener("blur", handleWindowBlur);
            window.addEventListener("focus", handleWindowFocus);
        }
    });

    onDestroy(() => {
        destroyed = true;
        // debounce 在途=最后 ≤800ms 输入还没落盘，关面板前补一次（review P1：否则 Esc 关丢尾字）
        if (draftSaveTimer) {
            clearTimeout(draftSaveTimer);
            draftSaveTimer = null;
            storeNoteBox_noteAreaText.save();
        }
        window.removeEventListener("blur", handleWindowBlur);
        window.removeEventListener("focus", handleWindowFocus);
        sm?.destroyBy("svelte");
    });

    afterUpdate(() => {
        inputArea.focus();
    });

    function adjustHeight() {
        inputArea.style.height = "auto";
        inputArea.style.height = inputArea.scrollHeight + "px";
    }

    // 草稿 debounce 落盘（□4：原仅 blur 落盘，失焦自动关场景下 blur 后紧跟关窗，
    // 关窗瞬间的 saveData 异步写有被窗口销毁掐断的风险，输入期就定期落盘）
    function onInput() {
        adjustHeight();
        if (draftSaveTimer) clearTimeout(draftSaveTimer);
        draftSaveTimer = setTimeout(() => {
            draftSaveTimer = null;
            storeNoteBox_noteAreaText.save();
        }, 800);
    }

    async function save2dailynote(exit = false) {
        const text = $storeNoteBox_noteAreaText.trim();
        if (!text) {
            if (exit) sm?.destroyBy();
            return;
        }
        if (hasPendingPlaceholder(text)) {
            siyuan.pushMsg(tomatoI18n.图片上传中请稍候, 2500);
            return;
        }
        const id = await insertIntoDailynote(text);
        saveText(text, id); // save to history（容器块 id 随行存入，点击跳日记定位）
        await clearText();
        if (!$storeNoteBox_keep) sm?.destroyBy();
    }

    function saveText(text: string, id?: string) {
        storeNoteBox_noteCount.inc();
        storeNoteBox_recentText.save({
            id,
            type: $storeNoteBox_selectedNoteType.trim(),
            text,
        });
    }

    async function clearText() {
        $storeNoteBox_noteAreaText = "";
        storeNoteBox_noteAreaText.save();
        await tick();
        adjustHeight();
    }

    function setAreaValue(v: string) {
        inputArea.value = v;
        $storeNoteBox_noteAreaText = v;
    }

    function insertAtCursor(t: string) {
        const pos = inputArea.selectionStart ?? inputArea.value.length;
        setAreaValue(inputArea.value.slice(0, pos) + t + inputArea.value.slice(pos));
        inputArea.setSelectionRange(pos + t.length, pos + t.length);
        adjustHeight();
    }

    /** □4 图片 compose 流：先插占位锚（物理锚点手法，选图往返光标不丢），上传完成原位替换为
     * markdown；窗口中途被关则清草稿残留占位、图片直插日记兜底不丢图。混合内容保存走
     * doubleSupRows markdown 通道，内核 kramdown 把 ![…](…) 行解析成图片块。 */
    async function insertFilesAtCursor(files: File[]) {
        const media = files.filter((f) => f && /^(image|video|audio)\//.test(f.type));
        if (media.length == 0) return;
        const seqs = media.map(() => ++uploadSeq);
        insertAtCursor(media.map((_f, i) => imgPlaceholder(seqs[i])).join(""));
        uploading += media.length;
        let results: Awaited<ReturnType<typeof uploadAssetChain>> = [];
        try {
            results = await uploadAssetChain(media);
        } finally {
            uploading -= media.length;
        }
        if (destroyed) {
            $storeNoteBox_noteAreaText = stripPlaceholders($storeNoteBox_noteAreaText);
            storeNoteBox_noteAreaText.save();
            for (const r of results) {
                if (r.md) void insertIntoDailynote(r.md, true);
            }
            return;
        }
        let anyFail = false;
        for (let i = 0; i < media.length; i++) {
            if (!results[i]?.md) anyFail = true;
            setAreaValue(
                replacePlaceholder(inputArea.value, seqs[i], results[i]?.md ? `\n${results[i].md}\n` : ""),
            );
        }
        if (anyFail) siyuan.pushMsg(tomatoI18n.图片上传失败, 3000);
        storeNoteBox_noteAreaText.save();
        adjustHeight();
        inputArea.focus();
    }

    function onPickFiles(event: Event) {
        pickerActive = false;
        const inputs = event?.target as HTMLInputElement;
        const files = Array.from(inputs?.files ?? []);
        inputs.value = ""; // 允许紧接着重选同名文件
        if (files.length > 0) void insertFilesAtCursor(files);
    }

    function onPaste(event: ClipboardEvent) {
        const files = Array.from(event.clipboardData?.items ?? [])
            .filter((i) => i.kind === "file" && /^(image|video|audio)\//.test(i.type))
            .map((i) => i.getAsFile())
            .filter((f): f is File => !!f);
        if (files.length > 0) {
            event.preventDefault(); // 媒体文件走上传插入，不落文件名字面文本
            // 混合剪贴板（图+文字，如网页复制）：文字先落光标处，图片占位随后（review P2）
            const text = event.clipboardData?.getData("text/plain")?.trim();
            if (text) insertAtCursor(text);
            void insertFilesAtCursor(files);
        }
    }

    function onDrop(event: DragEvent) {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
            /^(image|video|audio)\//.test(f.type),
        );
        if (files.length > 0) {
            event.preventDefault();
            void insertFilesAtCursor(files);
        }
    }

    function onDragOver(event: DragEvent) {
        if (Array.from(event.dataTransfer?.types ?? []).includes("Files")) {
            event.preventDefault(); // 允许落点
        }
    }

    async function saveExit(exit = false) {
        try {
            inputArea.style.color = "var(--b3-font-color12)";
            inputArea.style.backgroundColor = "var(--b3-font-background12)";
            await save2dailynote(exit);
        } finally {
            inputArea.style.color = "";
            inputArea.style.backgroundColor = "";
        }
    }
</script>

<!-- 
https://learn.svelte.dev/tutorial/if-blocks
-->
<div class="tomatoflexCol" id={NoteBoxID}>
    <div><NotebookSelect></NotebookSelect></div>

    <div class="tomatoflexRow nb-tools">
        <!-- on:pointerdown 先置选图在途旗（物理锚点+失焦关抑制）：文件对话框开窗必先夺焦，
             不抑制则子窗在对话框弹出的瞬间失焦自动关 -->
        <label
            class="nb-ico b3-tooltips b3-tooltips__n"
            aria-label={tomatoI18n.拍照后插入图片}
            on:pointerdown={() => { pickerActive = true; }}
        >
            <svg><use xlink:href="#iconCamera"></use></svg>
            <input
                on:change={onPickFiles}
                on:cancel={() => { pickerActive = false; }}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
            />
        </label>
        <label
            class="nb-ico b3-tooltips b3-tooltips__n"
            aria-label={tomatoI18n.从图库插入图片}
            on:pointerdown={() => { pickerActive = true; }}
        >
            <svg><use xlink:href="#iconImage"></use></svg>
            <input
                on:change={onPickFiles}
                on:cancel={() => { pickerActive = false; }}
                type="file"
                accept="image/*,video/*,audio/*"
                hidden
                multiple
            />
        </label>
        <button
            class="nb-ico b3-tooltips b3-tooltips__n"
            aria-label={tomatoI18n.清理列表清理输入框}
            on:click={() => {
                clearText();
                storeNoteBox_recentText.clean();
            }}><svg><use xlink:href="#iconTrashcan"></use></svg></button>
        <button
            class="nb-ico b3-tooltips b3-tooltips__n"
            aria-label={tomatoI18n.打开日记}
            on:click={async () => {
                const id = await getTargetID(
                    storeNoteBox_selectedNotebook.getOr(),
                );
                if (!id) return;
                OpenSyFile2(noteBox.plugin, id);
            }}><svg><use xlink:href="#iconCalendar"></use></svg></button>
        <button
            class="nb-ico b3-tooltips b3-tooltips__n"
            aria-label={tomatoI18n.同步数据}
            on:click={() => {
                siyuan.performSync(true);
            }}><svg><use xlink:href="#iconCloud"></use></svg></button>
        <label
            class="nb-keep b3-tooltips b3-tooltips__n"
            aria-label={tomatoI18n.连续输入说明}
        >
            <span class="nb-keep__label">{tomatoI18n.连续输入}</span>
            <input
                type="checkbox"
                class="b3-switch fn__flex-center"
                bind:checked={$storeNoteBox_keep}
            />
        </label>
    </div>

    <div class="tomatoflexRow nb-kinds">
        {#each NoteTypes as t}
            <button
                class="nb-chip"
                class:nb-chip--on={$storeNoteBox_selectedNoteType == t}
                on:click={() => {
                    storeNoteBox_selectedNoteType.save(t);
                }}>{t}</button
            >
        {/each}
    </div>

    {#if events.isMobile && isDialog}
        <div class="margin">
            <button
                class="b3-button b3-button--primary nb-save"
                on:click={() => saveExit(true)}>{tomatoI18n.保存}</button
            >
        </div>
    {/if}

    <textarea
        bind:this={inputArea}
        bind:value={$storeNoteBox_noteAreaText}
        class="b3-text-field fn__block large-text"
        on:input={() => {
            onInput();
        }}
        on:blur={() => {
            storeNoteBox_noteAreaText.save();
        }}
        on:paste={onPaste}
        on:drop={onDrop}
        on:dragover={onDragOver}
        placeholder={tomatoI18n.shiftEnter2write + tomatoI18n.小窗可粘贴拖入图片}
        on:keypress={(event) => {
            if (event instanceof KeyboardEvent) {
                if (event.key === "Enter" && event.shiftKey) {
                    event.preventDefault();
                    saveExit();
                }
            }
        }}
    ></textarea>

    {#if events.isMobile && isDialog}
        <div class="margin">
            <button
                class="b3-button b3-button--primary nb-save"
                on:click={() => saveExit(true)}>{tomatoI18n.保存}</button
            >
        </div>
    {/if}

    <div class="tomatoflexCol selectable nb-recent">
        {#each $storeNoteBox_recentText as item, i}
            {#if typeof item === "object" && item.id}
                <div
                    class="nb-recent__row nb-recent__row--link"
                    role="button"
                    tabindex={0}
                    title={tomatoI18n.打开这条在日记中的位置}
                    on:click={() => { OpenSyFile2(noteBox.plugin, item.id); }}
                    on:keydown={(e) => { if (e.key === "Enter") OpenSyFile2(noteBox.plugin, item.id); }}
                >
                    <span class="nb-recent__n">[{$storeNoteBox_noteCount - i}]</span>
                    <span class="nb-recent__type">{item.type}</span>
                    <span class="nb-recent__text">{item.text}</span>
                </div>
            {:else if typeof item === "object"}
                <div class="nb-recent__row">
                    <span class="nb-recent__n">[{$storeNoteBox_noteCount - i}]</span>
                    <span class="nb-recent__type">{item.type}</span>
                    <span class="nb-recent__text">{item.text}</span>
                </div>
            {:else}
                <div class="nb-recent__row">
                    <span class="nb-recent__n">[{$storeNoteBox_noteCount - i}]</span>
                    <span class="nb-recent__text">{item}</span>
                </div>
            {/if}
        {/each}
    </div>
</div>

<style>
    .selectable {
        user-select: text;
    }
    .large-text {
        font-size: large;
        line-height: 2;
    }
    .margin {
        margin: 10px;
    }
    .tomatoflexCol {
        margin: 10px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }
    .tomatoflexRow {
        margin: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-wrap: wrap;
    }
    /* ── □2 工具栏：无边框 icon 钮（编辑器工具栏同款轻样式） ── */
    .nb-tools {
        margin: 0 0 4px;
        justify-content: flex-start;
        align-items: center;
        gap: 4px;
    }
    .nb-ico {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        border: none;
        border-radius: 6px;
        background: none;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
    }
    .nb-ico:hover {
        background: var(--b3-list-hover);
        color: var(--b3-theme-on-background);
    }
    .nb-ico svg {
        width: 16px;
        height: 16px;
    }
    .nb-keep {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
        cursor: pointer;
        font-size: 12px;
        color: var(--b3-theme-on-surface);
    }
    /* ── 分类行：胶囊 chips ── */
    .nb-kinds {
        margin: 0 0 4px;
        justify-content: flex-start;
        gap: 6px;
    }
    .nb-chip {
        border: none;
        background: none;
        border-radius: 999px;
        padding: 2px 12px;
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
    }
    .nb-chip:hover {
        background: var(--b3-list-hover);
    }
    .nb-chip--on {
        background: var(--b3-theme-primary-lightest);
        color: var(--b3-theme-primary);
        font-weight: 500;
    }
    /* ── 移动端保存钮（主操作，通栏） ── */
    .nb-save {
        width: 100%;
    }
    /* ── 近期列表：等宽序号+类型角标+hover 高亮，带块 id 可点击跳日记 ── */
    .nb-recent {
        gap: 2px;
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid var(--b3-border-color);
    }
    .nb-recent__row {
        display: flex;
        align-items: baseline;
        gap: 6px;
        padding: 2px 4px;
        border-radius: 4px;
        font-size: 12px;
    }
    .nb-recent__row--link {
        cursor: pointer;
    }
    .nb-recent__row--link:hover {
        background: var(--b3-list-hover);
    }
    .nb-recent__n {
        font-variant-numeric: tabular-nums;
        color: var(--b3-theme-on-surface);
        opacity: 0.6;
        flex: 0 0 auto;
    }
    .nb-recent__type {
        font-size: 11px;
        color: var(--b3-theme-primary);
        background: var(--b3-theme-primary-lightest);
        border-radius: 4px;
        padding: 0 4px;
        flex: 0 0 auto;
        max-width: 6em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .nb-recent__text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--b3-theme-on-background);
    }
</style>
