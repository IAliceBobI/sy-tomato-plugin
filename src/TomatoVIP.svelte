<script lang="ts">
    import { icon } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    interface Props {
        codeValid: boolean;
    }

    let { codeValid }: Props = $props();
    const ICONS_SIZE = 14;
</script>

<!-- 已激活一律不渲染（2026-08-24：配置干净优先，旧 hideVIP 手动开关随任务移除）；未激活提示需购买。
     图标用自带 iconTomatoVIP goldenrod 实心徽标（□4 顺手修 P2：本体 #iconVIP 1px 描边在暗色下物理不可见）；
     tooltip 用 b3-tooltips 自绘（原生 title 桌面端 ~1s 延迟且需鼠标静止，感知不到） -->
{#if !codeValid}
    <span class="b3-label__text b3-tooltips b3-tooltips__n" aria-label={tomatoI18n.没有激活}>
        {@html icon("TomatoVIP", ICONS_SIZE)}</span
    >
{/if}
