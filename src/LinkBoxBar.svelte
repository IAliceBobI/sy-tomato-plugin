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

    interface Props {
        plugin: Plugin;
        syncBlock: HTMLElement;
        verMap: Map<string, number>;
    }

    let props: Props = $props();
    let saveBtn: HTMLElement = $state();
    let saveBtnDisabled = false;
    let syncCount = $state(0);
    $effect(() => {
        syncCount = stringToNumber(
            getAttribute(props.syncBlock, "custom-sync-block-count"),
        );
    });
    const ctrlAttr = $state({});
    ctrlAttr[TOMATO_CONTROL_SYNC] = "1";

    function getSyncID() {
        return getAttribute(props.syncBlock, "custom-sync-block-id");
    }
    function getOriginID() {
        return getAttribute(props.syncBlock, "custom-sync-origin-id");
    }
    function getCursorPosID() {
        return props.syncBlock.getAttribute(DATA_NODE_ID);
    }
    function getSyncVersion() {
        return stringToNumber(getAttribute(props.syncBlock, "custom-sync-version"));
    }

    function save() {
        if (saveBtnDisabled) return;
        saveBtnDisabled = true;
        const delay = 5;
        saveBtn.textContent = tomatoI18n.延迟x秒后执行(delay);
        setTimeout(async () => {
            try {
                const element: HTMLElement = props.syncBlock.cloneNode(true) as any;
                element.removeAttribute(PROTYLE_WYSIWYG_SELECT);
                const { rows } = await getRowAndMaxVer("", getSyncID());
                setAttribute(
                    element,
                    "custom-sync-version",
                    (getSyncVersion() + 1).toString(),
                );
                await syncAllBlocks(element, rows.length.toString(), rows);
            } finally {
                saveBtn.textContent = tomatoI18n.保存;
                saveBtnDisabled = false;
            }
        }, delay * 1000);
    }

    function showAll() {
        showSyncBlocks(null, props.plugin, props.syncBlock);
    }

    async function openAll() {
        const { rows } = await getRowAndMaxVer(getCursorPosID(), getSyncID());
        for (const row of rows) {
            if (row.block_id != getCursorPosID()) {
                await OpenSyFile2(props.plugin, row.block_id);
                await sleep(200);
            }
        }
    }

    async function openOrigin() {
        const originID = getOriginID();
        if (originID) await OpenSyFile2(props.plugin, originID);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div {...ctrlAttr}>
    {#if getSyncVersion()}
        <span class="space btn" onclick={openOrigin}>
            {#if getCursorPosID() === getOriginID()}
                <svg><use xlink:href="#iconStar"></use></svg>
            {/if}
            v{getSyncVersion()}
        </span>
    {/if}
    {#if !$linkBoxSyncBlockAuto}
        <span bind:this={saveBtn} class="space btn" onclick={save}
            >{tomatoI18n.保存}</span
        >
    {/if}
    <span bind:this={saveBtn} class="space btn" onclick={openAll}
        >{tomatoI18n.全部打开}</span
    >
    {#if syncCount < 0}
        <span class="space fail" onclick={showAll}>{tomatoI18n.同步失败} </span>
    {:else}
        <span class="space btn" onclick={showAll}
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
