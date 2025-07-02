<!-- 专门放到思源 dialog 内的 protyle 组件 -->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./destroyer";
    import { Protyle } from "siyuan";
    import { getTomatoPluginInstance, siyuan } from "./utils";

    interface Props {
        dm: DestroyManager;
        docName?: string;
        docID?: string;
    }

    let { dm, docName = "", docID = $bindable("") }: Props = $props();
    let protyleTarget: HTMLElement = $state();
    export function destroy() {}

    onDestroy(() => {
        dm.destroyBy();
    });

    onMount(async () => {
        if (!docID) {
            const docs = await siyuan.getDocRowsByName(docName);
            docID = docs?.at(0)?.id;
        }
        if (docID) {
            const protyle = new Protyle(
                getTomatoPluginInstance().app,
                protyleTarget,
                {
                    blockId: docID,
                    action: ["cb-get-focus"],
                    render: {
                        background: false,
                        title: false,
                        gutter: true,
                        scroll: true,
                        breadcrumb: true,
                        breadcrumbDocName: false,
                    },
                },
            );
            dm.add("protyle", () => protyle.destroy());
        }
    });
</script>

<div bind:this={protyleTarget}></div>
