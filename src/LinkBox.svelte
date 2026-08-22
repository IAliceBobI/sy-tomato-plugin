<script lang="ts">
    import { Plugin, Dialog, confirm } from "siyuan";
    import { DestroyManager } from "./libs/destroyer";
    import { tomatoI18n } from "./tomatoI18n";
    import { linkBoxSyncBlockAuto } from "./libs/stores";
    import { getAttribute, siyuan, stringToNumber } from "./libs/utils";
    import { syncFromBlock } from "./LinkBox";
    import type { VerMapCache } from "./libs/syncDecision";
    import { onMount } from "svelte";
    interface Props {
        plugin: Plugin;
        rows: Block[];
        dm: DestroyManager;
        dialog: Dialog;
        cursorPosID: string;
        syncID: string;
        syncDiv: HTMLElement;
        verMap: Map<string, VerMapCache>;
    }

    let props: Props = $props();
    let singleList: Block[] = $state([]);
    function getVersion() {
        return getAttribute(props.syncDiv, "custom-sync-version");
    }
    function getOriginID() {
        return getAttribute(props.syncDiv, "custom-sync-origin-id");
    }
    let oriVer = $state("");
    export function destroy() {}

    onMount(() => {
        const count = stringToNumber(
            getAttribute(props.syncDiv, "custom-sync-block-count"),
        );
        if (count >= 0 && count != props.rows.length) {
            siyuan.batchSetBlockAttrs(
                props.rows.map((row) => {
                    return {
                        id: row.id,
                        attrs: {
                            "custom-sync-block-count": props.rows.length.toString(),
                        },
                    };
                }),
            );
        }
        if (!props.rows.some((row) => row.id === getOriginID())) {
            setAsOrigin();
        }
        // 遗留组无版本行才补 1 自愈。version=0 是传播舞步的过渡态（接收方刚收到克隆，
        // 真实版本还没通过 attrs 对齐），此处重置成 1 会打破版本单调性，与 runDoSync/
        // syncFromBlock 的 verMap 防重交互成「清完 conflict 后静默早退」的复燃假象
        if (!getVersion()) {
            resetVersion();
        }
        const o = props.rows.find((r) => r.id == getOriginID());
        if (o) {
            oriVer = o.data;
        }
    });
    async function resetVersion() {
        props.verMap.delete(props.syncID);
        return siyuan.batchSetBlockAttrs(
            props.rows.map((row) => {
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
        if (getOriginID() != props.cursorPosID) {
            siyuan.batchSetBlockAttrs(
                props.rows.map((row) => {
                    return {
                        id: row.id,
                        attrs: { "custom-sync-origin-id": props.cursorPosID },
                    };
                }),
            );
        }
        props.dm.destroyBy();
    }
    // 冲突裁决（设计 §4.5）：以此行为准跑一轮强制传播，完成后关对话框（pushMsg 提示结果）
    let resolving = $state(false);
    async function resolveFrom(id: string) {
        if (resolving) return;
        resolving = true;
        try {
            await syncFromBlock(id);
            props.dm.destroyBy();
        } finally {
            resolving = false;
        }
    }
    function deleteAll(title: string, exclude = "") {
        confirm(title, "⚠️  " + tomatoI18n.已在x个地方同步(props.rows.length), () => {
            siyuan
                .deleteBlocks(
                    props.rows
                        .filter((row) => row.id != exclude)
                        .map((row) => row.id),
                )
                .then(() => {
                    props.dm.destroyBy();
                });
        });
    }
</script>

<div class="protyle-wysiwyg">
    <div class="space asRow">
        <button
            class="b3-button b3-button--outline tomato-button"
            onclick={() => deleteAll(tomatoI18n.删除其他, props.cursorPosID)}
            >{tomatoI18n.删除其他}</button
        >
        <button
            class="b3-button b3-button--outline tomato-button"
            onclick={() => deleteAll(tomatoI18n.全部删除)}
            >{tomatoI18n.全部删除}</button
        >
    </div>
    <div class="space asRow">
        <button class="b3-button b3-button--outline tomato-button" onclick={setAsOrigin}
            >{tomatoI18n.设为原始块}</button
        >
        <button class="b3-button b3-button--outline tomato-button" onclick={resetVersion}
            >{tomatoI18n.重置版本}</button
        >
    </div>
    <div class="space asRow">
        <button class="b3-button b3-button--outline tomato-button" onclick={findSingle}
            >{tomatoI18n.无复本块}</button
        >
        <label>
            <input
                class="b3-switch"
                type="checkbox"
                bind:checked={$linkBoxSyncBlockAuto}
                onchange={() => linkBoxSyncBlockAuto.write()}
            />
            {tomatoI18n.自动}
        </label>
    </div>
    {#each singleList as { id, content }}
        <div class="space asRow">
            <a href="siyuan://blocks/{id}">[{content.slice(0, 10)}]</a>
        </div>
    {/each}
    {#each props.rows as { id, content, data }}
        <div class="space asRow">
            <div>
                <a href="siyuan://blocks/{id}">{content}</a>
                {#if getOriginID() == id}
                    <svg class="icon"><use xlink:href="#iconStar"></use></svg>
                {/if}
            </div>
            <div class="asRowRight">
                <div
                    class="ver"
                    class:good={oriVer == data}
                    class:wrong={oriVer != data}
                >
                    v{data}
                </div>
                <button
                    class="b3-button b3-button--outline tomato-button"
                    disabled={resolving}
                    onclick={() => resolveFrom(id)}
                    >{tomatoI18n.以此块为准同步}</button
                >
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
    .asRowRight {
        display: flex;
        align-items: center;
        gap: 8px;
    }
</style>
