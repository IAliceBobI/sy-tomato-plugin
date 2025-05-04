<script lang="ts">
    import { afterUpdate, tick, onDestroy, onMount } from "svelte";
    import { NewNodeID, siyuan } from "./libs/utils";
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
        noteBoxAllKinds,
    } from "./libs/stores";
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
    });

    onDestroy(() => {
        sm?.destroyBy("svelte");
    });

    afterUpdate(() => {
        inputArea.focus();
    });

    function adjustHeight() {
        inputArea.style.height = "auto";
        inputArea.style.height = inputArea.scrollHeight + "px";
    }

    async function save2dailynote(exit = false) {
        const text = $storeNoteBox_noteAreaText.trim();
        if (!text) {
            if (exit) sm?.destroyBy();
            return;
        }
        saveText(text); // save to history
        await insertIntoDailynote(text);
        await clearText();
        if (!$storeNoteBox_keep) sm?.destroyBy();
    }

    function saveText(text: string) {
        storeNoteBox_noteCount.inc();
        storeNoteBox_recentText.save(
            $storeNoteBox_selectedNoteType + ": " + text,
        );
    }

    async function clearText() {
        $storeNoteBox_noteAreaText = "";
        storeNoteBox_noteAreaText.save();
        await tick();
        adjustHeight();
    }

    function onImageInsert(event: Event) {
        const inputs = event?.target as HTMLInputElement;
        if (inputs?.files?.length > 0) {
            for (const file of inputs.files) {
                const reader = new FileReader();
                reader.onload = async function (e: ProgressEvent<FileReader>) {
                    if (e.target) {
                        const binaryData = e.target.result;
                        const path = `assets/${NewNodeID()}-${file.name}`;
                        await siyuan.putFile("/data/" + path, binaryData);
                        await insertIntoDailynote(
                            `![${file.name}](${path})`,
                            true,
                        );
                    }
                };
                reader.readAsArrayBuffer(file);
            }
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

    <div class="tomatoflexRow">
        <label class="b3-button">
            📸
            <input
                title={tomatoI18n.拍照后插入图片}
                on:change={onImageInsert}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
            />
        </label>
        <label class="b3-button">
            🖼️
            <input
                title={tomatoI18n.从图库插入图片}
                on:change={onImageInsert}
                type="file"
                accept="image/*,video/*,audio/*"
                hidden
                multiple
            />
        </label>
        <button
            title={tomatoI18n.清理列表清理输入框}
            class="b3-button"
            on:click={() => {
                clearText();
                storeNoteBox_recentText.clean();
            }}>🗑️</button
        >
        <button
            title="open dailynote"
            class="b3-button"
            on:click={async () => {
                const id = await getTargetID(
                    storeNoteBox_selectedNotebook.getOr(),
                );
                if (!id) return;
                OpenSyFile2(noteBox.plugin, id);
            }}>📆</button
        >
        <button
            title={tomatoI18n.同步数据}
            class="b3-button"
            on:click={() => {
                siyuan.performSync(true);
            }}>☁️</button
        >
        <label title={tomatoI18n.连续输入}>
            <input
                type="checkbox"
                class="b3-switch fn__flex-center"
                bind:checked={$storeNoteBox_keep}
            />
            {#if $storeNoteBox_keep}
                ♾️
            {:else}
                1️⃣
            {/if}
        </label>
    </div>

    <div class="tomatoflexRow">
        {#each NoteTypes as t}
            <button
                class="b3-button b3-button--text"
                class:b3-button--outline={$storeNoteBox_selectedNoteType == t}
                on:click={() => {
                    storeNoteBox_selectedNoteType.save(t);
                }}>{t}</button
            >
        {/each}
    </div>

    {#if events.isMobile && isDialog}
        <div class="margin">
            <button class="b3-button" on:click={() => saveExit(true)}
                >{tomatoI18n.保存}</button
            >
        </div>
    {/if}

    <textarea
        bind:this={inputArea}
        bind:value={$storeNoteBox_noteAreaText}
        class="b3-text-field fn__block large-text"
        on:input={() => {
            adjustHeight();
        }}
        on:blur={() => {
            storeNoteBox_noteAreaText.save();
        }}
        placeholder={tomatoI18n.shiftEnter2write}
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
            <button class="b3-button" on:click={() => saveExit(true)}
                >{tomatoI18n.保存}</button
            >
        </div>
    {/if}

    <div class="tomatoflexCol selectable">
        {#each $storeNoteBox_recentText as text, i}
            <div>[{$storeNoteBox_noteCount - i}]{text}</div>
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
        justify-content: space-between;
    }
    .tomatoflexRow {
        margin: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-wrap: wrap;
    }
</style>
