<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { FloatingBallHelper } from "./libs/FloatingBallHelper";
    import { ClickHelper } from "./libs/ClickHelper";
    import { SPACE } from "./libs/gconst";
    import { events } from "./libs/Events";
    import { shortcut2string } from "./libs/keyboard";

    export let dm: DestroyManager;
    export let key: string;
    export let shortcut: FloatingKeyboardItem;
    let div: HTMLElement;
    let btnHelper = new ClickHelper();
    export function destroy() {}
    onMount(() => {
        new FloatingBallHelper(key, div, dm);
    });

    function getKeyCode(key: string): number {
        key = key.toUpperCase();
        if (/^f\\d{1,2}$/i.test(key)) {
            // F1~F12
            return 111 + parseInt(key.slice(1), 10);
        }
        if (key.length === 1) {
            return key.charCodeAt(0);
        }
        const special: Record<string, number> = {
            ENTER: 13,
            ESCAPE: 27,
            TAB: 9,
            BACKSPACE: 8,
            DELETE: 46,
            INSERT: 45,
            HOME: 36,
            END: 35,
            PAGEUP: 33,
            PAGEDOWN: 34,
            ARROWLEFT: 37,
            ARROWUP: 38,
            ARROWRIGHT: 39,
            ARROWDOWN: 40,
            SPACE: 32,
            CAPSLOCK: 20,
            CONTEXTMENU: 93,
            PRINTSCREEN: 44,
            SCROLLLOCK: 145,
            PAUSE: 19,
            NUMLOCK: 144,
        };
        return special[key] ?? 0;
    }

    async function toggleOpen(_event: MouseEvent) {
        document.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: shortcut.key.toUpperCase(),
                code: shortcut.key.toUpperCase(),
                keyCode: getKeyCode(shortcut.key),
                which: getKeyCode(shortcut.key),
                altKey: shortcut.altKey,
                shiftKey: shortcut.shiftKey,
                ctrlKey: !events.isMac && shortcut.ctrlKey,
                metaKey: events.isMac && shortcut.ctrlKey,
                view: window,
                bubbles: true,
                cancelable: true,
            }),
        );
    }
</script>

<div class="floating-button" bind:this={div}>
    {#if events.isMobile}
        {SPACE.repeat(2)}
    {/if}
    <button
        on:mousedown={(event) => {
            btnHelper.handleMouseDown(event);
        }}
        on:mouseup={(event) => {
            btnHelper.handleMouseUp(event, toggleOpen);
        }}
        title={shortcut2string(shortcut)}
        class="b3-button b3-button--outline"
    >
        {shortcut.keyIcon}
    </button>
    {#if events.isMobile}
        {SPACE.repeat(2)}
    {/if}
</div>

<style>
    .floating-button {
        z-index: 12;
        position: fixed;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
</style>
