<script lang="ts">
    import { onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { OpenSyFile2 } from "./libs/docUtils";
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
                    if (docID != currentDocID || name != currentDocName) {
                        currentDocID = docID;
                        currentDocName = name;
                        prefixDocs = await getPrefixDocs(docID, name);
                    }
                    initDialog();
                }
            },
        );
    }
</script>

<div class="protyle-wysiwyg">
    <div class="kbd">
        {tomatoI18n.文档数量}：{prefixDocs.length}
    </div>
    {#each prefixDocs as doc}
        <div>
            <button
                id={`prefixDoc#${isDock}#${doc.id}`}
                class:current-doc={doc.id === currentDocID}
                on:click={() => {
                    OpenSyFile2(getTomatoPluginInstance(), doc.id);
                    if (!isDock) {
                        dm.destroyBy();
                    }
                }}
            >
                {doc.docName}
            </button>
        </div>
    {/each}
    <div class="kbd">
        {tomatoI18n.文档数量}：{prefixDocs.length}
    </div>
</div>

<style>
    .current-doc {
        font-weight: bold;
        color: var(--b3-font-color4);
        cursor: default;
    }
    button {
        border: none;
        background: none;
        padding: 0;
        margin: 0;
        color: inherit;
        font: inherit;
        cursor: pointer;
    }
    button.current-doc {
        cursor: default;
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
