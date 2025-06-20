<script lang="ts">
    import { afterUpdate, onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./destroyer";

    export let dm: DestroyManager;
    export let defaultValue = "";
    export let description = "";
    export let callback: (s: string) => Promise<void> = async (
        _s: string,
    ) => {};
    export let alwaysConfirm = false; // 关闭时调用callback
    export let useTextArea = false;

    let fired: boolean = false;
    let inputText: string = "";
    let input: HTMLInputElement;
    let area: HTMLTextAreaElement;

    onMount(async () => {});

    afterUpdate(() => {
        if (useTextArea) {
            area.focus();
        } else {
            input.focus();
        }
    });

    onDestroy(() => {
        dm.destroyBy("svelte");
        if (alwaysConfirm) {
            if (!fired) callback(inputText);
        }
    });

    async function btnClick() {
        fired = true;
        await callback(inputText);
        dm.destroyBy();
    }

    function adjustHeight() {
        area.style.height = "auto"; // Reset height to auto
        area.style.height = `${area.scrollHeight}px`; // Set height to scrollHeight
    }
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="protyle-wysiwyg">
    <div>
        <div class="block">
            {description}
        </div>
        {#if useTextArea}
            <textarea
                placeholder={defaultValue}
                bind:this={area}
                class="b3-text-field block area"
                bind:value={inputText}
                on:input={adjustHeight}
                on:keypress={(event) => {
                    if (event instanceof KeyboardEvent) {
                        if (event.key === "Enter") {
                            if (
                                event.shiftKey ||
                                event.ctrlKey ||
                                event.altKey
                            ) {
                                btnClick();
                            }
                        }
                    }
                }}
            ></textarea>
        {:else}
            <input
                bind:this={input}
                on:focus={() => input.select()}
                placeholder={defaultValue}
                type="text"
                class="b3-text-field"
                bind:value={inputText}
                on:keypress={(event) => {
                    if (event instanceof KeyboardEvent) {
                        if (event.key === "Enter") {
                            btnClick();
                        }
                    }
                }}
            />
            <button class="b3-button b3-button--outline" on:click={btnClick}
                >Enter</button
            >
        {/if}
    </div>
</div>

<style>
    .area {
        width: 300px;
        line-height: 2;
        font-size: large;
    }
    .block {
        margin: 10px;
    }
</style>
