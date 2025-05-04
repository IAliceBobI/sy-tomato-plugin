<script lang="ts">
    import { Plugin, Dialog, confirm } from "siyuan";
    import { DestroyManager } from "./libs/destroyer";
    import { tomatoI18n } from "./tomatoI18n";
    import { linkBoxSyncBlockAuto } from "./libs/stores";
    import { getAttribute, siyuan, stringToNumber } from "./libs/utils";
    import { onMount } from "svelte";
    export let plugin: Plugin;
    export let rows: Block[];
    export let dm: DestroyManager;
    export let dialog: Dialog;
    export let cursorPosID: string;
    export let syncID: string;
    export let syncDiv: HTMLElement;
    export let verMap: Map<string, number>;
    let singleList: Block[] = [];
    syncID;
    dialog;
    plugin;
    let originID = getAttribute(syncDiv, "custom-sync-origin-id");
    const version = getAttribute(syncDiv, "custom-sync-version");
    let oriVer = version;
    onMount(() => {
        const count = stringToNumber(
            getAttribute(syncDiv, "custom-sync-block-count"),
        );
        if (count >= 0 && count != rows.length) {
            siyuan.batchSetBlockAttrs(
                rows.map((row) => {
                    return {
                        id: row.id,
                        attrs: {
                            "custom-sync-block-count": rows.length.toString(),
                        },
                    };
                }),
            );
        }
        if (!rows.some((row) => row.id === originID)) {
            setAsOrigin();
        }
        if (!version || version == "0") {
            resetVersion();
        }
        const o = rows.find((r) => r.id == originID);
        if (o) {
            oriVer = o.data;
        }
    });
    async function resetVersion() {
        verMap.delete(syncID);
        return siyuan.batchSetBlockAttrs(
            rows.map((row) => {
                return {
                    id: row.id,
                    attrs: {
                        "custom-sync-version": "1",
                    },
                };
            }),
        );
    }
    async function findSingle() {
        if (singleList.length > 0) {
            singleList = [];
            return;
        }
        const key: AttrKey = "custom-sync-block-id";
        const rows = await siyuan.sqlAttr(
            `select * from attributes where name="${key}" limit 99999999`,
        );
        const map = new Map<string, Attributes[]>();
        for (const row of rows) {
            const list: Attributes[] = map.get(row.value) ?? [];
            list.push(row);
            map.set(row.value, list);
        }
        const blocks = [...map.values()]
            .filter((v) => v.length === 1)
            .map((l) => l.pop());

        singleList = await siyuan.getRows(blocks.map((b) => b.block_id));
        if (singleList.length == 0) {
            siyuan.pushMsg("not found", 1000);
        }
    }
    async function setAsOrigin() {
        if (originID != cursorPosID) {
            originID = cursorPosID;
            siyuan.batchSetBlockAttrs(
                rows.map((row) => {
                    return {
                        id: row.id,
                        attrs: { "custom-sync-origin-id": cursorPosID },
                    };
                }),
            );
        }
        dm.destroyBy();
    }
    function deleteAll(title: string, exclude = "") {
        confirm(title, "⚠️  " + tomatoI18n.已在x个地方同步(rows.length), () => {
            siyuan
                .deleteBlocks(
                    rows
                        .filter((row) => row.id != exclude)
                        .map((row) => row.id),
                )
                .then(() => {
                    dm.destroyBy();
                });
        });
    }
</script>

<div class="protyle-wysiwyg">
    <div class="space asRow">
        <button
            class="b3-button"
            on:click={() => deleteAll(tomatoI18n.删除其他, cursorPosID)}
            >{tomatoI18n.删除其他}</button
        >
        <button
            class="b3-button"
            on:click={() => deleteAll(tomatoI18n.全部删除)}
            >{tomatoI18n.全部删除}</button
        >
    </div>
    <div class="space asRow">
        <button class="b3-button" on:click={setAsOrigin}
            >{tomatoI18n.设为原始块}</button
        >
        <button class="b3-button" on:click={resetVersion}
            >{tomatoI18n.重置版本}</button
        >
    </div>
    <div class="space asRow">
        <button class="b3-button" on:click={findSingle}
            >{tomatoI18n.无复本块}</button
        >
        <label>
            <input
                class="b3-switch"
                type="checkbox"
                bind:checked={$linkBoxSyncBlockAuto}
                on:change={() => linkBoxSyncBlockAuto.write()}
            />
            {tomatoI18n.自动}
        </label>
    </div>
    {#each singleList as { id, content }}
        <div class="space asRow">
            <a href="siyuan://blocks/{id}">[{content.slice(0, 10)}]</a>
        </div>
    {/each}
    {#each rows as { id, content, data }}
        <div class="space asRow">
            <div>
                <a href="siyuan://blocks/{id}">{content}</a>
                {#if originID == id}
                    <svg class="icon"><use xlink:href="#iconStar"></use></svg>
                {/if}
            </div>
            <div
                class="ver"
                class:good={oriVer == data}
                class:wrong={oriVer != data}
            >
                v{data}
            </div>
        </div>
    {/each}
</div>

<style>
    .wrong {
        color: var(--b3-font-color9);
        background-color: var(--b3-font-background9);
    }
    .good {
        color: var(--b3-theme-on-surface);
        background-color: var(--b3-theme-surface);
    }
    .ver {
        padding: 2px 4px;
        font:
            70% Consolas,
            "Liberation Mono",
            Menlo,
            Courier,
            monospace,
            var(--b3-font-family);
        line-height: 1;
        vertical-align: middle;
        border: solid 1px var(--b3-theme-surface-lighter);
        border-radius: var(--b3-border-radius);
        box-shadow: inset 0 -1px 0 var(--b3-theme-surface-lighter);
    }
    .icon {
        width: 12px;
        height: 12px;
    }
    .space {
        margin-bottom: 10px;
    }
    .asRow {
        display: flex;
        justify-content: space-between;
        align-items: center; /* 可选：垂直居中对齐 */
        width: 100%;
    }
</style>
