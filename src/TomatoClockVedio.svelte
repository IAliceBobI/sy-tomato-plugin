<script lang="ts">
    import { Protyle } from "siyuan";
    import { onDestroy, afterUpdate, onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { TomatoClockID, tomatoClock } from "./TomatoClock";

    export let vedioID: BlockID;
    export let dm: DestroyManager;
    let protyleTarget: HTMLDivElement;

    let handleEscapePress = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            dm?.destroyBy();
        }
    };

    onMount(async () => {
        if (dm) {
            window.addEventListener("keydown", handleEscapePress);
            dm.add("Escape Key Lisener", () =>
                window.removeEventListener("keydown", handleEscapePress),
            );
        }
    });

    afterUpdate(async () => {
        if (vedioID) {
            const protyle = new Protyle(tomatoClock.plugin.app, protyleTarget, {
                blockId: vedioID,
                action: ["cb-get-focus"],
                render: {
                    background: false,
                    title: false,
                    gutter: false,
                    scroll: false,
                    breadcrumb: false,
                    breadcrumbDocName: false,
                },
            });
            dm.add("protyle", () => protyle.destroy());
        }
    });

    onDestroy(() => {
        dm.destroyBy("svelte");
    });
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div id={TomatoClockID}>
    {#if !vedioID}
        <div class="box">
            <div class="prompt">{tomatoClock.plugin.i18n.takeARestPlease}</div>
        </div>
    {:else}
        <div bind:this={protyleTarget}></div>
    {/if}
</div>

<style>
    .prompt {
        font-size: x-large;
    }
    .box {
        display: flex;
        justify-content: center; /* 水平居中 */
        align-items: center; /* 垂直居中 */
        height: 300px;
        width: 300px;
    }
</style>
