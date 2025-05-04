<script lang="ts">
    import { Writable } from "svelte/store";
    import { tomatoI18n } from "./tomatoI18n";
    export let autoRefreshChecked: Writable<boolean>;
    let refreshInput: HTMLElement = null;
    $: if ($autoRefreshChecked) {
        if (refreshInput) refreshInput.title = tomatoI18n.刷新中;
    } else {
        if (refreshInput) refreshInput.title = tomatoI18n.不刷新;
    }
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<button
    bind:this={refreshInput}
    class="b3-button b3-button--text"
    on:click={async () => ($autoRefreshChecked = !$autoRefreshChecked)}
>
    {#if !$autoRefreshChecked}
        ⏹️
    {:else}
        🔄
    {/if}</button
>
