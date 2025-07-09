<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./destroyer";

    interface Props {
        dm: DestroyManager;
        defaultValue?: string;
        description?: string;
        callback?: (s: string) => Promise<void>;
        alwaysConfirm?: boolean; // 关闭时调用callback
        useTextArea?: boolean;
    }

    let {
        dm,
        defaultValue = "",
        description = "",
        callback = async (_s: string) => {},
        alwaysConfirm = false,
        useTextArea = false,
    }: Props = $props();

    let fired: boolean = false;
    let inputText: string = $state("");
    let input: HTMLInputElement = $state();
    let area: HTMLTextAreaElement = $state();

    onMount(async () => {
        if (useTextArea) {
            area.focus();
        } else {
            input.focus();
        }
    });

    export function destroy() {
        dm.destroyBy("svelte");
        if (alwaysConfirm) {
            if (!fired) callback(inputText);
        }
    }

    onDestroy(destroy);

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
                oninput={adjustHeight}
                onkeypress={(event) => {
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
                onfocus={() => input.select()}
                placeholder={defaultValue}
                type="text"
                class="b3-text-field"
                bind:value={inputText}
                onkeypress={(event) => {
                    if (event instanceof KeyboardEvent) {
                        if (event.key === "Enter") {
                            btnClick();
                        }
                    }
                }}
            />
            <button class="b3-button b3-button--outline tomato-button" onclick={btnClick}
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
