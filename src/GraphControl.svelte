<script lang="ts">
    import { useSvelteFlow } from "@xyflow/svelte";
    import { Plugin } from "siyuan";
    import { onMount } from "svelte";

    const { setCenter, getNodes } = useSvelteFlow();

    export let plugin: Plugin;
    export let dock: { element: HTMLElement; data: any };

    onMount(() => {
        plugin;
        getData().locateID = async (id: string) => {
            if (!id) return;
            const n = getNodes().find((n) => n.id === id);
            if (n) {
                setCenter(n.position.x, n.position.y);
                document
                    .querySelectorAll(`div[data-id="${id}"].svelte-flow__node`)
                    .forEach((e: HTMLElement) => {
                        const tmp = e.style.backgroundColor;
                        e.style.backgroundColor = "var(--b3-font-background1)";
                        setTimeout(() => {
                            e.style.backgroundColor = tmp;
                        }, 200);
                    });
            }
        };
    });

    function getData() {
        return dock.data as unknown as GraphDockData<any>;
    }
</script>
