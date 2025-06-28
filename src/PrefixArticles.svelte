<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { getDocTracer, OpenSyFile2 } from "./libs/docUtils";
    import { getTomatoPluginInstance } from "./libs/utils";
    import { events, EventType } from "./libs/Events";
    import { getPrefixDocs } from "./PrefixArticles";
    import { Protyle } from "siyuan";
    import { tomatoI18n } from "./tomatoI18n";

    export let dockElement: HTMLElement = null;
    export let dm: DestroyManager;
    export let isDock = false;
    export let currentDocID: string = "";
    export let currentDocName: string = "";
    export let prefixDocs: ArticlesPrefix[] = [];
    export let missDoc = false;

    onMount(() => {
        if (isDock) {
            initDock();
        } else {
            initDialog();
        }
    });

    function initDialog() {
        if (currentDocID) {
            const btn = document.getElementById(
                `prefixDoc#${isDock}#${currentDocID}`,
            ) as HTMLButtonElement;
            if (btn) {
                btn.scrollIntoView();
            } else {
                getDocTracer().then((tracer) => {
                    tracer.tryGetDocs(currentDocID);
                    missDoc = true;
                });
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
                        missDoc
                    ) {
                        currentDocID = docID;
                        currentDocName = name;
                        missDoc = false;
                        prefixDocs = await getPrefixDocs(docID, name);
                    }
                    initDialog();
                }
            },
        );
    }
</script>

<div>
    <div class="kbd">
        {tomatoI18n.文档数量}：{prefixDocs.length}
    </div>
    {#each prefixDocs as doc, i}
        {#if doc}
            <div>
                <button
                    class="doc-button"
                    id={`prefixDoc#${isDock}#${doc.id}`}
                    class:current-doc={doc.id === currentDocID}
                    class:doc-even={i % 2 === 0}
                    class:doc-odd={i % 2 !== 0}
                    on:click={() => {
                        OpenSyFile2(getTomatoPluginInstance(), doc.id);
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
    <div class="kbd">
        {tomatoI18n.文档数量}：{prefixDocs.length}
    </div>
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
