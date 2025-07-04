<script lang="ts">
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { getDocTracer, OpenSyFile2 } from "./libs/docUtils";
    import { getTomatoPluginInstance, Siyuan, siyuan } from "./libs/utils";
    import { events, EventType } from "./libs/Events";
    import { getPrefixDocs } from "./PrefixArticles";
    import { Protyle } from "siyuan";
    import { tomatoI18n } from "./tomatoI18n";
    import { setGlobal } from "stonev5-utils";
    import PrefixArticleParts from "./PrefixArticleParts.svelte";
    import { prefixArticlesTagsShow } from "./libs/stores";

    interface Props {
        dockElement?: HTMLElement;
        dm: DestroyManager;
        isDock?: boolean;
        currentDocID?: string;
        currentDocName?: string;
        prefixDocs?: ArticlesPrefix[];
    }

    let {
        dockElement = null,
        dm,
        isDock = false,
        currentDocID = "",
        currentDocName = "",
        prefixDocs = [],
    }: Props = $props();
    export function destroy() {}
    let forceRefresh = false;
    let showPrefixDialog = $state(false);
    let newPrefix = $state("");
    let oldPrefix = $state("");

    onMount(() => {
        if (isDock) {
            initDock();
        } else {
            initDialog();
        }
        clearInterval(
            setGlobal(
                "间隔刷新前缀 2025-07-02 14:19:05",
                setInterval(() => {
                    forceRefresh = true;
                }, 5000),
            ),
        );
    });

    async function initDialog() {
        if (currentDocID) {
            const btn = document.getElementById(
                `prefixDoc#${isDock}#${currentDocID}`,
            ) as HTMLButtonElement;
            if (btn) {
                btn.scrollIntoView({ block: "center", behavior: "auto" });
            } else {
                const tracer = await getDocTracer();
                tracer.tryGetDocs(currentDocID);
                currentDocID = "";
            }
        }
    }

    async function initDock() {
        events.addListener(
            "preffix svelte 2025-06-26 23:13:52",
            (eventType, detail: Protyle) => {
                if (
                    eventType == EventType.loaded_protyle_static ||
                    eventType == EventType.loaded_protyle_dynamic ||
                    eventType == EventType.click_editorcontent ||
                    eventType == EventType.switch_protyle
                ) {
                    clickEvent(detail);
                }
            },
        );
    }

    async function clickEvent(detail: Protyle) {
        const stop =
            dockElement.clientWidth < 10 || dockElement.clientHeight < 10;
        if (stop) return;
        navigator.locks.request(
            "preffix svelte lock 2025-06-26 23:13:52",
            { ifAvailable: true },
            async (lock) => {
                if (lock) {
                    const { docID, name } = events.getInfo(detail.protyle);
                    if (!docID || !name) return;
                    if (
                        docID != currentDocID ||
                        name != currentDocName ||
                        forceRefresh
                    ) {
                        currentDocID = docID;
                        currentDocName = name;
                        forceRefresh = false;

                        {
                            let oldName = currentDocName.replaceAll("丨", "|");
                            if (oldName.includes("|")) {
                                oldName = oldName.split("|").at(0).trim();
                            }
                            if (!oldPrefix) oldPrefix = oldName;
                        }

                        prefixDocs = await getPrefixDocs(docID, name);
                    }
                    await initDialog();
                }
            },
        );
    }

    async function cancel() {
        showPrefixDialog = false;
    }
    async function batchRenamePrefix() {
        showPrefixDialog = false;
        newPrefix = newPrefix.trim();
        oldPrefix = oldPrefix.trim();
        if (!newPrefix || !oldPrefix) return;
        if (!Siyuan.config?.repo?.key) {
            await siyuan.pushMsg(
                tomatoI18n.你还没秘钥插件无法为您创建本地快照,
                0,
            );
            return;
        }
        await siyuan.createSnapshot("tomato-prefix-rename");
        const rows = await siyuan.sql(
            `select id,content,box,path from blocks where type='d' and content like "${oldPrefix}%" limit 999999`,
        );
        for (const row of rows) {
            const title = row.content.replace(oldPrefix, newPrefix);
            await siyuan.renameDoc(row.box, row.path, title);
            await siyuan.pushMsg(`${row.content}  ->  ${title}`);
        }
        siyuan.pushMsg(tomatoI18n.重命名完成);
        siyuan.pushMsg(tomatoI18n.已经创建快照, 1000 * 20);
    }
</script>

{#snippet count_and_btn()}
    <div class="kbd">
        <span title={tomatoI18n.文档数量}>#{prefixDocs.length}</span>
        <button
            title={tomatoI18n.批量改前缀}
            class="b3-button b3-button--text"
            onclick={() => {
                showPrefixDialog = !showPrefixDialog;
            }}
        >
            {tomatoI18n.改前缀}
        </button>
        <button
            title={tomatoI18n.标题内竖线分割出来的标签}
            class="b3-button b3-button--text"
            onclick={() => {
                prefixArticlesTagsShow.write(!$prefixArticlesTagsShow);
            }}
        >
            Tags
        </button>
    </div>
{/snippet}

<div>
    {@render count_and_btn()}
    <PrefixArticleParts bind:show={$prefixArticlesTagsShow}
    ></PrefixArticleParts>
    <DialogSvelte
        title={tomatoI18n.批量改前缀}
        bind:show={showPrefixDialog}
        savePositionKey="prefix batch modify 2025-07-04 12:06:06"
    >
        {#snippet dialogInner()}
            <div style="margin-bottom:8px;">{tomatoI18n.请输入原前缀}:</div>
            <input
                class="b3-text-field"
                bind:value={oldPrefix}
                maxlength="25"
                style="width:25em;margin-bottom:8px;"
            />
            <div style="margin-bottom:8px;">{tomatoI18n.请输入新前缀}:</div>
            <input
                class="b3-text-field"
                bind:value={newPrefix}
                maxlength="25"
                style="width:25em;margin-bottom:12px;"
            />
            <div style="display:flex;justify-content:flex-end;gap:8px;">
                <button class="b3-button b3-button--outline" onclick={cancel}
                    >{tomatoI18n.取消}</button
                >
                <button
                    class="b3-button b3-button--outline"
                    onclick={batchRenamePrefix}>{tomatoI18n.确定}</button
                >
            </div>
        {/snippet}
    </DialogSvelte>
    {#each prefixDocs as doc, i}
        {#if doc}
            <div>
                <button
                    class="doc-button"
                    id={`prefixDoc#${isDock}#${doc.id}`}
                    class:current-doc={doc.id === currentDocID}
                    class:doc-even={i % 2 === 0}
                    class:doc-odd={i % 2 !== 0}
                    onclick={async () => {
                        if (await siyuan.checkBlockExist(doc.id)) {
                            OpenSyFile2(getTomatoPluginInstance(), doc.id);
                        } else {
                            const tracer = await getDocTracer();
                            tracer.removeDoc(doc.id);
                            currentDocID = "";
                        }
                        if (!isDock) {
                            dm.destroyBy();
                        }
                    }}
                >
                    📄{doc.docName}
                </button>
            </div>
        {/if}
    {/each}
    {@render count_and_btn()}
</div>

<style>
    .doc-even {
        color: var(--b3-font-color2);
        background-color: var(--b3-theme-surface);
    }
    .doc-odd {
        background-color: var(--b3-theme-surface);
        color: var(--b3-font-color4);
    }
    .current-doc {
        font-weight: bold;
        background-color: var(--b3-font-background6);
    }
    .doc-button {
        border: none;
        padding: 0;
        margin-left: 0;
        margin-right: 0;
        margin-top: 8px;
        margin-bottom: 8px;
        font-size: calc(var(--b3-font-size-editor) * 0.7);
        cursor: pointer;
        text-align: left;
        display: block;
        width: 100%;
    }
    .kbd {
        padding: 2px 4px;
        font:
            100% Consolas,
            "Liberation Mono",
            Menlo,
            Courier,
            monospace,
            var(--b3-font-family);
        line-height: 1;
        color: var(--b3-theme-on-surface);
        vertical-align: middle;
        background-color: var(--b3-theme-surface);
    }
</style>
