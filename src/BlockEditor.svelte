<script lang="ts">
    import { createProtyle } from "./libs/bkUtils";
    import { DestroyManager } from "./libs/destroyer";
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { getDoOperations, getTomatoPluginInstance } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";

    interface Props {
        blockID: string;
        dm: DestroyManager;
    }
    let { blockID, dm }: Props = $props();

    function mountProtyle() {
        return (node: HTMLElement) => {
            node.style.minHeight = "auto";
            const pob = createProtyle(blockID, getTomatoPluginInstance());
            if (pob && pob.p && pob.ob) {
                node.appendChild(pob.p.protyle.element);
                dm.add("close protyle", () => {
                    pob.p.destroy();
                    pob.ob.disconnect();
                });
                pob.p.protyle.ws.ws.addEventListener("message", (ev) => {
                    for (const op of getDoOperations(JSON.parse(ev.data))) {
                        if (op.action == "delete") {
                            if (op.id === blockID) {
                                dm.destroyBy();
                                return;
                            }
                        }
                    }
                });
            }
        };
    }
    function locate() {
        OpenSyFile2(getTomatoPluginInstance(), blockID);
    }
</script>

<DialogSvelte
    maxWidth="200"
    show={true}
    title={tomatoI18n.块编辑器}
    {dm}
    savePositionKey="块编辑器 2025年9月1日22:06:25"
>
    {#snippet dialogInner()}
        <button
            title={tomatoI18n.定位}
            class="b3-button b3-button--text tomato-button"
            onclick={locate}>🎯</button
        >
        <div {@attach mountProtyle()}></div>
    {/snippet}
</DialogSvelte>
