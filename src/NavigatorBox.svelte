<script lang="ts">
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { currentBockEditorDocID, currentBockEditorDocName, currentProtyle, events } from "./libs/Events";
    import { navSourceBlock } from "./libs/stores";
    import { closeTabByTitle, getOpenedEditors, getTomatoPluginInstance, siyuan } from "./libs/utils";

    let currentDocID = $state("");
    let show = $state(false);
    let page = $state(0);
    let bookID = $state("");
    $effect(() => {
        if (currentDocID != $currentBockEditorDocID) {
            currentDocID = $currentBockEditorDocID;
            const { attrs } = events.getInfo($currentProtyle?.protyle);
            const bookInfo = attrs["custom-book-writing"];
            if (bookInfo) {
                show = true;
                const parts = bookInfo.split("#");
                bookID = parts.at(0);
                page = parseInt(parts.at(-1)) || 0;
            } else {
                show = false;
            }
        }
    });

    async function goto(delta: number) {
        if (!bookID) return;
        delta = Math.max(delta, 0);
        const bookMark = `${bookID}#page#${delta.toString().padStart(6, "0")}`;
        const rows = await siyuan.sqlAttr(
            `select block_id from attributes where name="custom-book-writing" and value="${bookMark}"`,
        );
        const id = rows?.at(0)?.block_id;
        if (id) {
            await OpenSyFile2(getTomatoPluginInstance(), id);
            page = delta;
            const attrs = getOpenedEditors()
                .filter((i) => i.ial)
                .filter((i) => i.ial["custom-book-writing"])
                .filter((i) => i.ial.id != id)
                .map((i) => i.ial);
            closeTabByTitle(attrs, "");
            setTimeout(() => {
                const p = getOpenedEditors().find((i) => {
                    const { docID } = events.getInfo(i.protyle?.protyle);
                    return docID == id;
                });
                if (p) {
                    $currentProtyle = p.protyle;
                    $currentBockEditorDocName = p.ial?.title ?? "";
                    $currentBockEditorDocID = id;
                }
            }, 300);
        }
    }
</script>

<DialogSvelte
    minWidth={100}
    minHeight={100}
    show={show && $navSourceBlock}
    title={$currentBockEditorDocName}
    savePositionKey="上下遍历2025年9月30日22:09:20"
>
    {#snippet dialogInner()}
        <button class="b3-button b3-button--text" onclick={() => goto(page - 1)}> 👈👈 </button>
        <button class="b3-button b3-button--text" onclick={() => goto(page + 1)}> 👉👉 </button>
    {/snippet}
</DialogSvelte>
