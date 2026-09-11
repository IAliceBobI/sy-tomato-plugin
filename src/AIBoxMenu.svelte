<script lang="ts">
    // AIBox 对话框（agentrev □3 翻新）：轻量改写工具——原文+指令单框可编辑、提示词 chips、
    // 主按钮+键帽。健壮三修：①开框热键尾字符泄漏（⌥⇧S 的 s 曾落进输入框）→ focus 延迟 80ms
    // 让伴随 input 落空；②框内重发监听改时间窗卫兵（原「吞首个 keydown」脆弱）；
    // ③新增提示词行内化（input+Enter），Esc 只关新增行不关框（尽力 stopPropagation）。
    import { onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { aiBox, AIBoxHotkey } from "./AIBox";
    import { aiBoxPrompts } from "./libs/stores";
    import { tomatoI18n } from "./tomatoI18n";
    import { setTimeouts } from "./libs/utils";
    import { currentCustom, capDisplay } from "./libs/hotkeyCap";

    interface Props {
        dm: DestroyManager;
        text: string;
        anchorID: string;
    }

    let { dm, text = $bindable(), anchorID }: Props = $props();
    let rootEl: HTMLDivElement = $state();
    let inputArea: HTMLTextAreaElement = $state();
    let newPromptInput: HTMLInputElement = $state();
    let adding = $state(false);
    let newPrompt = $state("");
    const textBK = text;
    const openedAt = Date.now();

    function hkDisplay(): string {
        const c = currentCustom("sy-tomato-plugin", AIBoxHotkey.langKey);
        return c === undefined ? AIBoxHotkey.w() : capDisplay(c, tomatoI18n.未设置快捷键);
    }

    function isSendHotkey(event: KeyboardEvent): boolean {
        const k = event.key.toLowerCase();
        return (
            k === "f10" ||
            (event.altKey && k === "x") ||
            (event.altKey && event.shiftKey && k === "s")
        );
    }

    // 时间窗卫兵：吞掉开框那一记热键（含其伴随事件），防挂上监听即自触发发送
    const handleSendHotkey = (event: KeyboardEvent) => {
        if (Date.now() - openedAt < 300) return;
        if (isSendHotkey(event)) void ai();
    };

    onMount(() => {
        if ($aiBoxPrompts.length === 0) {
            $aiBoxPrompts = tomatoI18n.AIBox默认提示词.slice();
        }
        text = textBK + "\n\n---\n\n";
        dm.setData("run", ai);
        window.addEventListener("keydown", handleSendHotkey);
        dm.add("Key Listener", () =>
            window.removeEventListener("keydown", handleSendHotkey),
        );
        // 开框热键（⌥⇧S/⌥X）的尾字符 input 事件仍在途：同步把焦点抢到对话框根（非编辑
        // 元素，字符自然落空）——否则焦点留在原文编辑器里，字符会被打进文档本身
        // （09-10 e2e 实锤源块尾部多出 "s"）；80ms 后再把焦点交给输入框，光标置尾=直接打指令。
        rootEl?.focus();
        setTimeout(() => {
            inputArea?.focus();
            const len = inputArea?.value.length ?? 0;
            inputArea?.setSelectionRange(len, len);
        }, 80);
        setTimeouts(
            () => {
                if (inputArea?.scrollHeight != null)
                    inputArea.scrollTop = inputArea.scrollHeight;
            },
            150,
            1000,
            300,
        );
    });

    onDestroy(() => {
        dm.destroyBy("2");
    });

    async function clickChip(event: MouseEvent, suffix: string) {
        if (event.shiftKey) {
            const idx = $aiBoxPrompts.findIndex((v) => v === suffix);
            if (idx >= 0) {
                $aiBoxPrompts.splice(idx, 1);
                $aiBoxPrompts = $aiBoxPrompts;
                aiBoxPrompts.write();
            }
        } else {
            // chip 语义=对原文跑该提示词（确定性：每次从原文重拼，防连点累积）
            text = textBK + "\n\n---\n\n" + suffix + "\n";
            await ai();
        }
    }

    async function ai() {
        dm.destroyBy();
        await aiBox.runAI(text, anchorID);
    }

    function addPrompt() {
        const v = newPrompt.trim();
        if (v && !$aiBoxPrompts.includes(v)) {
            $aiBoxPrompts.push(v);
            $aiBoxPrompts = $aiBoxPrompts;
            aiBoxPrompts.write();
        }
        newPrompt = "";
        adding = false;
    }

    function closeAddRow() {
        adding = false;
        newPrompt = "";
    }

    function openAddRow() {
        adding = true;
        setTimeout(() => newPromptInput?.focus(), 0);
    }
</script>

<div class="fn__flex-column aibox-root" tabindex="-1" bind:this={rootEl}>
    <div class="aibox-hint">{tomatoI18n.AIBox说明}</div>
    <textarea
        title="your input"
        class="aibox-text b3-text-field"
        bind:value={text}
        bind:this={inputArea}
    ></textarea>
    <div class="aibox-chips">
        {#each $aiBoxPrompts as item (item)}
            <button
                class="aibox-chip"
                title={item}
                onclick={(event) => clickChip(event, item)}>{item}</button
            >
        {/each}
        {#if !adding}
            <button
                class="aibox-chip aibox-chip--add"
                title={tomatoI18n.AIBox添加提示词}
                onclick={openAddRow}>＋</button
            >
        {/if}
    </div>
    {#if adding}
        <div class="aibox-addrow">
            <input
                class="b3-text-field fn__flex-1"
                placeholder={tomatoI18n.AIBox新提示词占位}
                bind:value={newPrompt}
                bind:this={newPromptInput}
                onkeydown={(event) => {
                    if (event.key === "Enter") addPrompt();
                    else if (event.key === "Escape") {
                        event.stopPropagation();
                        closeAddRow();
                        inputArea?.focus();
                    }
                }}
            />
            <button class="b3-button b3-button--text" onclick={addPrompt}>{tomatoI18n.添加}</button>
            <button class="b3-button b3-button--cancel" onclick={closeAddRow}>{tomatoI18n.取消}</button>
        </div>
    {/if}
    <div class="aibox-foot">
        <button class="b3-button" onclick={ai}>{tomatoI18n.发送}</button>
        <span class="aibox-kbd">{hkDisplay()}</span>
        <span class="aibox-sub">{tomatoI18n.AIBox脚注}</span>
    </div>
</div>

<style>
    .aibox-root {
        gap: 8px;
        /* 对齐对话框标题的水平缩进（.b3-dialog__header padding=9px 24px）：内容五层与标题一条线 */
        padding: 8px 24px 16px;
    }
    .aibox-hint {
        color: var(--b3-theme-on-surface-light);
        font-size: 12px;
        line-height: 18px;
    }
    .aibox-text {
        height: 200px;
        resize: vertical;
        line-height: 1.6;
        font-family: var(--b3-font-family);
    }
    .aibox-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
    }
    .aibox-chip {
        cursor: pointer;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius-b);
        background-color: var(--b3-theme-surface);
        color: var(--b3-theme-on-surface);
        padding: 3px 10px;
        font-size: 12px;
        line-height: 18px;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .aibox-chip:hover {
        border-color: var(--b3-theme-primary);
        color: var(--b3-theme-primary);
    }
    .aibox-chip--add {
        border-style: dashed;
        color: var(--b3-theme-on-surface-light);
        padding: 3px 12px;
    }
    .aibox-chip--add:hover {
        border-color: var(--b3-theme-primary);
        color: var(--b3-theme-primary);
    }
    .aibox-addrow {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .aibox-foot {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
    }
    .aibox-kbd {
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        padding: 1px 6px;
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        white-space: nowrap;
    }
    .aibox-sub {
        color: var(--b3-theme-on-surface-light);
        font-size: 12px;
        line-height: 18px;
        margin-left: auto;
        text-align: right;
    }
</style>
