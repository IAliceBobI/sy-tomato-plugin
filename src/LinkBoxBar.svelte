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
        siyuan,
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
    let syncStatus = $state("");
    $effect(() => {
        syncCount = stringToNumber(
            getAttribute(props.syncBlock, "custom-sync-block-count"),
        );
        // 冲突徽标优先读 custom-sync-status；标记写入由 MutationObserver 触发重挂徽标刷新
        syncStatus = getAttribute(props.syncBlock, "custom-sync-status") ?? "";
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
                const ver = getSyncVersion() + 1;
                setAttribute(element, "custom-sync-version", ver.toString());
                const hNew = await syncAllBlocks(element, rows.length.toString(), rows);
                // 手动保存也要维护编辑基线：写源块自身 (version, hash, count)，
                // 否则基线停在旧哈希，开回自动同步后首个事件会被误判为修改源而重复传播
                const selfID = getCursorPosID();
                if (selfID) {
                    await siyuan.setBlockAttrs(selfID, {
                        "custom-sync-version": ver.toString(),
                        "custom-sync-hash": hNew,
                        "custom-sync-block-count": (rows.length + 1).toString(),
                    });
                }
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
    {#if syncStatus === "conflict"}
        <span class="space fail" onclick={showAll}>⚠️ {tomatoI18n.同步冲突}</span>
    {:else if syncCount < 0}
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
