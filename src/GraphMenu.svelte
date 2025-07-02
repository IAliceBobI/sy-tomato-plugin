<script lang="ts">
    import { run } from 'svelte/legacy';

    import { Node } from "@xyflow/svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { Writable } from "svelte/store";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { Plugin } from "siyuan";

    interface Props {
        onClick: () => void;
        menuOpt: Writable<NodeMenu<Node>>;
        plugin: Plugin;
        dock: { element: HTMLElement; data: any };
    }

    let {
        onClick,
        menuOpt,
        plugin,
        dock
    }: Props = $props();
    dock;
    // const nodes = useNodes();
    // const edges = useEdges();
    let height: number = $state();
    let width: number = $state();
    let top: number = $state();
    let left: number = $state();
    let text: string = $state();
    run(() => {
        top = $menuOpt.y - height;
        left = $menuOpt.x - width;
        if (top + 200 > $menuOpt.canvasHeight) {
            top = $menuOpt.y - height * 2;
        }
        text =
            ($menuOpt?.node?.data?.text as string) ??
            ($menuOpt?.node?.data?.label as string) ??
            "";
    });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:clientHeight={height}
    bind:clientWidth={width}
    style="top: {top}px; left: {left}px;"
    class="context-menu"
    onclick={onClick}
>
    {#if text}
        <p style="margin: 0.5em;" class="font">
            <small>{text?.slice(0, 10)}</small>
        </p>
    {/if}
    <button
        onclick={() => {
            OpenSyFile2(plugin, $menuOpt.node.id);
        }}>{@html tomatoI18n.定位到文档}</button
    >
</div>

<style>
    .font {
        color: var(--b3-font-color9);
    }
    .context-menu {
        background: white;
        border-style: solid;
        box-shadow: 10px 19px 20px rgba(0, 0, 0, 10%);
        position: absolute;
        z-index: 10;
    }

    .context-menu button {
        border: none;
        display: block;
        padding: 0.5em;
        text-align: left;
        width: 100%;
    }

    .context-menu button:hover {
        background: white;
    }
</style>
