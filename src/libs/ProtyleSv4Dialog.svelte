<!-- 专门放到思源 dialog 内的 protyle 组件 -->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./destroyer";
    import { Protyle } from "siyuan";
    import { getTomatoPluginInstance, siyuan } from "./utils";
    import { scrollDocBottomForDoc } from "./ballDocToggle";

    interface Props {
        dm: DestroyManager;
        docName?: string;
        docID?: string;
        openBottom?: boolean;
    }

    let { dm, docName = "", docID = $bindable(""), openBottom = false }: Props = $props();
    let protyleTarget: HTMLElement = $state();

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
            // 滚底（fbfeat □1 落底；□13 禁聚焦拍板后转纯滚动）；openBottom 由调用方
            // 传入（共享组件不读悬浮球域设置）
            if (openBottom) {
                void scrollDocBottomForDoc(protyleTarget, docID, (id) => siyuan.getDocLastID(id));
            }
        }
    });
</script>

<div bind:this={protyleTarget}></div>
