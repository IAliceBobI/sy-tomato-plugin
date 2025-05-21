<script lang="ts">
    import { icon } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    export let codeValid: boolean;
    const ICONS_SIZE = 14;
</script>

{#if codeValid}
    <span title={tomatoI18n.已经激活} class="b3-label__text">
        {@html icon("TomatoVIP", ICONS_SIZE)}</span
    >
{:else}
    <span title={tomatoI18n.没有激活} class="b3-label__text">
        {@html icon("VIP", ICONS_SIZE)}</span
    >
{/if}
