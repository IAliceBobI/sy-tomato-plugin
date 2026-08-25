<script lang="ts">
    // 快捷键键帽（2026-08-24 □5 方案 A）：点击进入监听态，按下新组合即写回内核 keymap，
    // 免 reload 即时生效（写回协议见 libs/hotkeyCap.ts 文件头）。
    // 共享组件：tomato 设置页直接用；progressive 经 ../../sy-tomato-plugin/src/ 相对导入。
    // 交互：Esc=取消监听；Backspace/Delete=删除快捷键（禁用）；监听态旁附
    // 🎲 随机可用组合（短组合优先）/ ✕ 删除 / ↩ 恢复默认 三个快捷芯片；移动端无键盘不可点。
    import { onDestroy, untrack } from "svelte";
    import { events } from "./libs/Events";
    import { tomatoI18n } from "./tomatoI18n";
    import {
        event2combo,
        findConflicts,
        suggestCombo,
        setPluginHotkey,
        isReservedCombo,
        isDisallowedTextInput,
        randomFreeCombo,
        currentCustom,
        capDisplay,
    } from "./libs/hotkeyCap";

    interface HotkeyObj {
        m: string;
        w(): string;
        langKey: string;
    }
    interface Props {
        hk: HotkeyObj;
        pluginName: string;
    }
    let { hk, pluginName }: Props = $props();

    let listening = $state(false);
    // w() 非响应式且对空 custom 会回落默认值，显示统一走 readDisplay（写回成功后重读刷新）
    let display = $state(untrack(() => readDisplay()));
    let hint = $state<{ text: string; suggest?: string } | null>(null);
    let flash = $state("");
    let flashTimer: ReturnType<typeof setTimeout>;
    let wrapEl: HTMLElement | undefined = $state();

    function readDisplay(): string {
        const c = currentCustom(pluginName, hk.langKey);
        if (c === undefined) return hk.w();
        return capDisplay(c, tomatoI18n.未设置快捷键);
    }

    function stopListening() {
        listening = false;
        hint = null;
        window.removeEventListener("keydown", onKeydown, true);
        window.removeEventListener("mousedown", onMousedown, true);
    }

    function startListening() {
        if (events.isMobile) return;
        if (listening) return;
        listening = true;
        hint = null;
        display = readDisplay();
        window.addEventListener("keydown", onKeydown, true);
        window.addEventListener("mousedown", onMousedown, true);
    }

    function onMousedown(e: MouseEvent) {
        if (wrapEl && e.target instanceof Node && !wrapEl.contains(e.target)) stopListening();
    }

    function showFlash(text: string) {
        flash = text;
        clearTimeout(flashTimer);
        flashTimer = setTimeout(() => (flash = ""), 1200);
    }

    function rejectCombo(combo: string): boolean {
        if (isReservedCombo(combo)) {
            hint = { text: tomatoI18n.系统保留快捷键, suggest: suggestCombo(combo, pluginName, hk.langKey) ?? undefined };
            return true;
        }
        if (isDisallowedTextInput(combo)) {
            hint = { text: tomatoI18n.快捷键需要修饰键, suggest: suggestCombo(combo, pluginName, hk.langKey) ?? undefined };
            return true;
        }
        const conflicts = findConflicts(combo, pluginName, hk.langKey);
        if (conflicts.length) {
            hint = {
                text: tomatoI18n.与其冲突的快捷键(conflicts.join("、")),
                suggest: suggestCombo(combo, pluginName, hk.langKey) ?? undefined,
            };
            return true;
        }
        return false;
    }

    async function applyCombo(combo: string) {
        if (rejectCombo(combo)) return;
        if (await setPluginHotkey(pluginName, hk.langKey, combo)) {
            display = readDisplay();
            stopListening();
            showFlash(tomatoI18n.已生效);
        }
    }

    async function deleteHotkey() {
        if (await setPluginHotkey(pluginName, hk.langKey, "")) {
            display = readDisplay();
            stopListening();
            showFlash(tomatoI18n.已删除);
        }
    }

    async function resetDefault() {
        if (await setPluginHotkey(pluginName, hk.langKey, null)) {
            display = readDisplay();
            stopListening();
            showFlash(tomatoI18n.已恢复默认);
        }
    }

    function randomApply() {
        // 10 档修饰键 × 36 个主键全占满才返回 null，实际不可达，静默保持监听态即可
        const combo = randomFreeCombo(pluginName, hk.langKey);
        if (combo) applyCombo(combo);
    }

    function onKeydown(e: KeyboardEvent) {
        // 监听态吞掉一切按键（capture 阶段拦截）：防误触思源全局热键（⌘S/⌘W 等）与页面默认行为
        e.preventDefault();
        e.stopPropagation();
        if (e.key === "Escape") {
            stopListening();
            return;
        }
        if ((e.key === "Backspace" || e.key === "Delete") && !e.altKey && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            deleteHotkey();
            return;
        }
        const combo = event2combo(e);
        if (!combo) return; // 纯修饰键，继续等主键
        applyCombo(combo);
    }

    onDestroy(() => {
        window.removeEventListener("keydown", onKeydown, true);
        window.removeEventListener("mousedown", onMousedown, true);
        clearTimeout(flashTimer);
    });
</script>

<!-- wrap 承载键帽+芯片的点击区域边界（点外面退出监听） -->
<span class="hotkey-wrap" bind:this={wrapEl}>
    <span
        class="kbd hotkey-cap b3-tooltips b3-tooltips__n"
        class:listening
        class:unset={display === tomatoI18n.未设置快捷键}
        role="button"
        tabindex={-1}
        aria-label={tomatoI18n.点击修改快捷键}
        onclick={startListening}
        onkeydown={(e) => e.preventDefault()}>{listening ? tomatoI18n.按下新组合键 : display}</span
    >
    {#if listening}
        <button
            class="hk-chip b3-tooltips b3-tooltips__n"
            aria-label={tomatoI18n.随机可用快捷键}
            onclick={randomApply}>🎲</button
        >
        <button
            class="hk-chip b3-tooltips b3-tooltips__n"
            aria-label={tomatoI18n.删除快捷键}
            onclick={deleteHotkey}>✕</button
        >
        <button
            class="hk-chip b3-tooltips b3-tooltips__n"
            aria-label={tomatoI18n.恢复默认快捷键}
            onclick={resetDefault}>↩</button
        >
    {/if}
    {#if flash}<span class="hk-flash">{flash}</span>{/if}
    {#if hint}
        <span class="hk-hint">
            {hint.text}
            {#if hint.suggest}
                <button class="kbd hk-suggest" onclick={() => applyCombo(hint.suggest)}>{hint.suggest}</button>
            {/if}
        </span>
    {/if}
</span>
