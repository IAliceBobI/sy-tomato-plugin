<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./destroyer";
    import { Protyle } from "siyuan";
    import { getPlugin, siyuan } from "./utils";

    export let dm: DestroyManager;
    export let docName: string;
    let protyleTarget: HTMLElement;

    onDestroy(() => {
        dm.destroyBy();
    });

    onMount(async () => {
        const docs = await siyuan.getDocRowsByName(docName);
        if (docs.length > 0) {
            const protyle = new Protyle(getPlugin().app, protyleTarget, {
                blockId: docs.at(0).id,
                action: ["cb-get-focus"],
                render: {
                    background: false,
                    title: false,
                    gutter: true,
                    scroll: false,
                    breadcrumb: true,
                    breadcrumbDocName: false,
                },
            });
            dm.add("protyle", () => protyle.destroy());
        }
    });
</script>

<div bind:this={protyleTarget}></div>
