<script lang="ts">
    import { icon } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    interface Props {
        codeValid: boolean;
    }

    let { codeValid }: Props = $props();
    const ICONS_SIZE = 14;
</script>

<!-- 已激活一律不渲染（2026-08-24：配置干净优先，旧 hideVIP 手动开关随任务移除）；未激活提示需购买 -->
{#if !codeValid}
    <span title={tomatoI18n.没有激活} class="b3-label__text">
        {@html icon("VIP", ICONS_SIZE)}</span
    >
{/if}
