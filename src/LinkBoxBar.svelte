<script lang="ts">
    import { Plugin } from "siyuan";
    import {
        DATA_NODE_ID,
        PROTYLE_WYSIWYG_SELECT,
        TOMATO_CONTROL_SYNC,
    } from "./libs/gconst";
    import {
        getAttribute,
        setAttribute,
        sleep,
        stringToNumber,
    } from "./libs/utils";
    import { getRowAndMaxVer, showSyncBlocks, syncAllBlocks } from "./LinkBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { linkBoxSyncBlockAuto } from "./libs/stores";
    import { OpenSyFile2 } from "./libs/docUtils";

    export let plugin: Plugin;
    export let syncBlock: HTMLElement;
    export let verMap: Map<string, number>;
    let saveBtn: HTMLElement;
    let saveBtnDisabled = false;
    const syncID = getAttribute(syncBlock, "custom-sync-block-id");
    const originID = getAttribute(syncBlock, "custom-sync-origin-id");
    const cursorPosID = syncBlock.getAttribute(DATA_NODE_ID);
    let syncVersion = stringToNumber(
        getAttribute(syncBlock, "custom-sync-version"),
    );
    if (!syncVersion) {
        const v = verMap.get(syncID);
        if (v != null) {
            syncVersion = v;
        }
    }

    let syncCount = stringToNumber(
        getAttribute(syncBlock, "custom-sync-block-count"),
    );
    const ctrlAttr = {};
    ctrlAttr[TOMATO_CONTROL_SYNC] = "1";

    function save() {
        if (saveBtnDisabled) return;
        saveBtnDisabled = true;
        const delay = 5;
        saveBtn.textContent = tomatoI18n.延迟x秒后执行(delay);
        setTimeout(async () => {
            try {
                const element: HTMLElement = syncBlock.cloneNode(true) as any;
                element.removeAttribute(PROTYLE_WYSIWYG_SELECT);
                const { rows } = await getRowAndMaxVer("", syncID);
                setAttribute(
                    element,
                    "custom-sync-version",
                    (syncVersion + 1).toString(),
                );
                await syncAllBlocks(element, rows.length.toString(), rows);
            } finally {
                saveBtn.textContent = tomatoI18n.保存;
                saveBtnDisabled = false;
            }
        }, delay * 1000);
    }

    function showAll() {
        showSyncBlocks(null, plugin, syncBlock);
    }

    async function openAll() {
        const { rows } = await getRowAndMaxVer(cursorPosID, syncID);
        for (const row of rows) {
            if (row.block_id != cursorPosID) {
                await OpenSyFile2(plugin, row.block_id);
                await sleep(200);
            }
        }
    }

    async function openOrigin() {
        if (originID) await OpenSyFile2(plugin, originID);
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div {...ctrlAttr}>
    {#if syncVersion}
        <span class="space btn" on:click={openOrigin}>
            {#if cursorPosID === originID}
                <svg><use xlink:href="#iconStar"></use></svg>
            {/if}
            v{syncVersion}
        </span>
    {/if}
    {#if !$linkBoxSyncBlockAuto}
        <span bind:this={saveBtn} class="space btn" on:click={save}
            >{tomatoI18n.保存}</span
        >
    {/if}
    <span bind:this={saveBtn} class="space btn" on:click={openAll}
        >{tomatoI18n.全部打开}</span
    >
    {#if syncCount < 0}
        <span class="space fail" on:click={showAll}
            >{tomatoI18n.同步失败}
        </span>
    {:else}
        <span class="space btn" on:click={showAll}
            >{tomatoI18n.已在x个地方同步(syncCount)}
        </span>
    {/if}
</div>

<style>
    .fail {
        font-size: large;
        color: var(--b3-font-color9);
        background-color: var(--b3-font-background9);
        font-weight: bold;
        text-shadow: 3px 3px 5px var(--b3-font-background10);
    }
    .space {
        margin-right: 10px;
    }
    .btn {
        background-color: var(--b3-font-background2);
    }
    .btn:hover {
        background-color: var(--b3-font-background1);
    }
</style>
