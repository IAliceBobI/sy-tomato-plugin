<script lang="ts">
    import { onMount } from "svelte";
    import { BlockNodeEnum, TOMATO_ATTR_BAR } from "./libs/gconst";
    import { getAttribute, getProtylesByID, siyuan } from "./libs/utils";

    interface Props {
        element: HTMLElement;
        attrElement: HTMLElement;
    }

    let { element, attrElement = $bindable() }: Props = $props();
    const ctrlAttr = $state({});
    let id: string;
    let fold: string = $state();
    let dataType: string;

    onMount(() => {
        ctrlAttr[TOMATO_ATTR_BAR] = "1";
        attrElement.style.top = "0";
        attrElement.style.opacity = "1";
        id = getAttribute(element, "data-node-id");
        fold = getAttribute(element, "fold");
        dataType = getAttribute(element, "data-type");
    });

    async function toggleFold() {
        if (fold) {
            await siyuan.setBlockAttrs(id, { fold: "" });
        } else {
            await siyuan.setBlockAttrs(id, { fold: "1" });
        }
        if (dataType == BlockNodeEnum.NODE_HEADING) {
            getProtylesByID(id).forEach((protyle) => protyle.reload(true));
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div {...ctrlAttr} class="container">
    <span class="space btn" onclick={toggleFold}>
        <svg class:foldIcon={fold !== "1"}
            ><use xlink:href="#iconPlay"></use></svg
        >
    </span>
</div>

<style>
    .foldIcon {
        transform: rotate(90deg);
    }
    .container {
        z-index: 10;
    }
    .space {
        margin-right: 10px;
    }
    .btn {
        background-color: var(--b3-font-background2);
    }
    .btn:hover {
        background-color: var(--b3-font-background1);
    }
</style>
