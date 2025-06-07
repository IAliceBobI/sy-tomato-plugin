<script lang="ts">
    import { onMount } from "svelte";
    import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
    import { TOMATO_ATTR_BAR } from "./libs/gconst";
    import { getAttribute, siyuan } from "./libs/utils";

    export let plugin: BaseTomatoPlugin;
    export let element: HTMLElement;
    export let attrElement: HTMLElement;
    const ctrlAttr = {};
    let id: string;
    let fold: string;

    onMount(() => {
        ctrlAttr[TOMATO_ATTR_BAR] = "1";
        attrElement.style.top = "0";
        attrElement.style.opacity = "1";
        plugin;
        id = getAttribute(element, "data-node-id");
        fold = getAttribute(element, "fold");
    });

    async function toggleFold() {
        if (fold) {
            await siyuan.setBlockAttrs(id, { fold: "" });
        } else {
            await siyuan.setBlockAttrs(id, { fold: "1" });
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div {...ctrlAttr} class="container">
    <span class="space btn" on:click={toggleFold}>
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
