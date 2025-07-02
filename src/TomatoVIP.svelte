<script lang="ts">
    import { hideVIP } from "./libs/stores";
    import { icon } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    interface Props {
        codeValid: boolean;
    }

    let { codeValid }: Props = $props();
    const ICONS_SIZE = 14;
</script>

{#if codeValid}
    {#if !$hideVIP}
        <span title={tomatoI18n.已经激活} class="b3-label__text">
            {@html icon("TomatoVIP", ICONS_SIZE)}</span
        >
    {/if}
{:else}
    <span title={tomatoI18n.没有激活} class="b3-label__text">
        {@html icon("VIP", ICONS_SIZE)}</span
    >
{/if}
