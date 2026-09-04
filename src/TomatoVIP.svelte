<script lang="ts">
    import { icon } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    import { openUnlockDialog } from "./unlockDialog";
    import { devProPreview } from "./libs/devProPreview";
    interface Props {
        codeValid: boolean;
    }

    let { codeValid }: Props = $props();
    const ICONS_SIZE = 14;
</script>

<!-- 已激活一律不渲染（2026-08-24：配置干净优先，旧 hideVIP 手动开关随任务移除）；未激活点击
     弹统一解锁框（□1 灰档统一：tomato 各分区付费开关旁的本标签是灰档点击入口之一）。
     作者查看模式例外：devProPreview 开启时已激活也渲染（标注收费项，只标注不锁功能）。
     图标用自带 iconTomatoVIP goldenrod 实心徽标（□4 顺手修 P2：本体 #iconVIP 1px 描边在暗色下物理不可见）；
     tooltip 用 b3-tooltips 自绘（原生 title 桌面端 ~1s 延迟且需鼠标静止，感知不到） -->
{#if !codeValid || $devProPreview}
    <span
        class="b3-label__text b3-tooltips b3-tooltips__n tomato-vip-tag"
        role="button"
        tabindex="0"
        aria-label={tomatoI18n.点击解锁Pro}
        onclick={() => openUnlockDialog({ product: "tomato" })}
        onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openUnlockDialog({ product: "tomato" });
            }
        }}
        >{@html icon("TomatoVIP", ICONS_SIZE)}</span
    >
{/if}

<style>
    .tomato-vip-tag {
        cursor: pointer;
        vertical-align: middle;
        display: inline-flex;
        align-items: center;
    }
</style>
