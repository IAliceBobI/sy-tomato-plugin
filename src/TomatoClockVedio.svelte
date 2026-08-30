<script lang="ts">
    import { Protyle } from "siyuan";
    import { onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { TomatoClockID, tomatoClock } from "./TomatoClock";
    import { tomatoI18n } from "./tomatoI18n";

    interface Props {
        vedioID: BlockID;
        dm: DestroyManager;
    }

    let { vedioID, dm }: Props = $props();
    let protyleTarget: HTMLDivElement = $state();

    let handleEscapePress = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            dm?.destroyBy();
        }
    };

    onMount(async () => {
        // 到点声音由 TomatoClock.onPhaseComplete 统一播（□2 收敛：组件不再自带音源，避免双音源打架）
        if (dm) {
            window.addEventListener("keydown", handleEscapePress);
            dm.add("Escape Key Lisener", () =>
                window.removeEventListener("keydown", handleEscapePress),
            );
        }
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
    export function destroy() {
        dm.destroyBy("svelte");
    }
    onDestroy(destroy);
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div id={TomatoClockID}>
    {#if !vedioID}
        <div class="box">
            <div class="prompt">{tomatoI18n.休息一会儿吧}</div>
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
