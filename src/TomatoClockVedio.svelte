<script lang="ts">
    import { Protyle } from "siyuan";
    import { onDestroy, afterUpdate, onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { TomatoClockID, tomatoClock } from "./TomatoClock";
    import { verifyKeyTomato } from "./libs/user";

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

        if (!(await verifyKeyTomato())) vedioID = "";
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
        <div class="tomato-style__container">
            <p class="tomato-style__centered-text">
                {tomatoClock.plugin.i18n.takeARestPlease}
            </p>
        </div>
    {:else}
        <div bind:this={protyleTarget}></div>
    {/if}
</div>
