<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { setTimeouts, siyuan } from "./libs/utils";
    import { OpenAIClient } from "./libs/openAI";
    import { aiBoxPrompts } from "./libs/stores";
    export let dm: DestroyManager;
    export let text: string;
    export let anchorID: string;
    let inputArea: HTMLTextAreaElement;
    let cleaned = false;
    let addNewPromptDiv: HTMLDivElement;
    let newPrompt: string;
    const textBK = text;

    let handleEscapePress = (event: KeyboardEvent) => {
        if (!cleaned) {
            cleaned = true;
            return;
        }
        if (
            event.key.toLowerCase() === "f10" ||
            (event.altKey && event.key.toLowerCase() === "x") ||
            (event.altKey && event.shiftKey && event.key.toLowerCase() === "s")
        ) {
            dm.destroyBy();
            ai();
        }
    };

    onMount(() => {
        if ($aiBoxPrompts.length === 0) {
            $aiBoxPrompts.push("请续写");
            $aiBoxPrompts.push("请做个摘要");
            $aiBoxPrompts.push("用小学生可以理解的方式重写");
            $aiBoxPrompts.push("请进行头脑风暴");
            $aiBoxPrompts.push("请给上文改错修正语法等");
            $aiBoxPrompts.push("请将上面的内容制作为表格");
            $aiBoxPrompts = $aiBoxPrompts;
        }
        addNewPromptDiv.style.display = "none";

        text = textBK + "\n\n---\n\n";
        dm.setData("run", ai);
        window.addEventListener("keydown", handleEscapePress);
        dm.add("Key Lisener", () =>
            window.removeEventListener("keydown", handleEscapePress),
        );
        inputArea.focus();

        setTimeouts(
            () => {
                if (inputArea?.scrollHeight != null)
                    inputArea.scrollTop = inputArea.scrollHeight;
            },
            100,
            1000,
            300,
        );
    });

    onDestroy(() => {
        dm.destroyBy("2");
    });

    async function clickBtn(event: any, suffix: string) {
        const e = event as PointerEvent;
        if (e.shiftKey) {
            const idx = $aiBoxPrompts.findIndex((v) => v === suffix);
            if (idx >= 0) {
                $aiBoxPrompts.splice(idx, 1);
                $aiBoxPrompts = $aiBoxPrompts;
                aiBoxPrompts.write();
            }
        } else {
            text = textBK + "\n\n---\n" + suffix + "\n";
            await ai();
        }
    }

    async function ai() {
        dm.destroyBy();
        await siyuan.pushMsg(text.slice(0, 100), 2000);
        const client = OpenAIClient.getOfficalModel(true);
        await client(text, anchorID);
    }

    function toggleAddNewPromptDiv() {
        if (addNewPromptDiv.style.display == "none") {
            addNewPromptDiv.style.display = null;
        } else {
            addNewPromptDiv.style.display = "none";
        }
    }
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="fn__flex-column">
    <textarea
        title="your input"
        class="margin queryText b3-text-field"
        bind:value={text}
        bind:this={inputArea}
    ></textarea>
    <div class="margin fn__flex-column" bind:this={addNewPromptDiv}>
        <textarea
            title="your input"
            class="margin queryText b3-text-field"
            bind:value={newPrompt}
        ></textarea>
        <button
            class="margin b3-button"
            on:click={() => {
                toggleAddNewPromptDiv();
                $aiBoxPrompts.push(newPrompt);
                $aiBoxPrompts = $aiBoxPrompts;
                aiBoxPrompts.write();
            }}>添加新提示词</button
        >
    </div>
    <div>
        <button
            title="添加新提示词"
            class="margin b3-button"
            on:click={toggleAddNewPromptDiv}>＋</button
        >
        {#each $aiBoxPrompts as item}
            <button
                title="shift点击为删除提示词"
                class="margin b3-button"
                on:click={(event) => clickBtn(event, item)}>{item}</button
            >
        {/each}
    </div>
    <button title="Send" class="margin b3-button" on:click={ai}
        >📡直接发送(Alt+Shift+S 或者 Alt+X 或者 F10)</button
    >
</div>

<style>
    .margin {
        margin: 10px;
    }
    .queryText {
        height: 200px;
    }
</style>
