<script lang="ts">
    // IndexConf 设置分区：思维导线（词级划词连线 + 块级引用/互链线共用设置）。
    // 2026-09-02 □5 归位：mindWire 9+1 键自 ConfClock.svelte 迁出为独立分区卡
    // （spec tomato-mindwire-visual-spec.md §4.8；插 ConfBlocks 之后——同为关系类工具）。
    // 线型三档由「使用实线/流动线条效果」两 checkbox 改为 chip 分段控件，存储键零迁移
    // （spec §4.1.3：虚线=line false+dyn false / 流动=line false+dyn true / 实线=line true，Pro）。
    import TomatoVIP from "./TomatoVIP.svelte";
    import {
        mindWireCheckbox,
        mindWireColorfull,
        mindWireDocMenu,
        mindWireDynamicLine,
        mindWireGlobalMenu,
        mindWireLine,
        mindWireStarRefOnly,
        mindWireWidth,
        mindWireWordWire,
    } from "./libs/stores";
    import { siyuan } from "./libs/siyuanApi";
    import { lastVerifyResult } from "./libs/user";
    import { MindWire启用或禁用思维导线, MindWire启用或禁用文档思维导线, MindWire划词连线 } from "./MindWire";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);

    // 线型三档（spec §4.8 行 6）：实线须 Pro 生效才算选中态——非 Pro 存量 line=true 时
    // 渲染端走虚线/流动分支（MindWire.ts 实线判定带 lastVerifyResult），UI 与渲染同口径
    type LineStyle = "dash" | "flow" | "solid";
    let solidEffective = $derived($mindWireLine && lastVerifyResult());
    let lineStyle: LineStyle = $derived(solidEffective ? "solid" : $mindWireDynamicLine ? "flow" : "dash");
    function pickLineStyle(s: LineStyle) {
        if (s === "solid" && !lastVerifyResult()) {
            siyuan.pushMsg(tomatoI18n.Pro功能尾注); // 置灰可点+解释（spec §4.8 行 6 口径）
            return;
        }
        $mindWireLine = s === "solid";
        $mindWireDynamicLine = s === "flow";
    }

    // 关系色板图例（spec §4.8 行 9）：色 token 与 MindWire.ts RELATION_COLOR 同源，仅设置内查色
    let relationLegend = $derived([
        { color: "var(--b3-font-color5)", label: tomatoI18n.关联 },
        { color: "var(--b3-font-color6)", label: tomatoI18n.首尾呼应 },
        { color: "var(--b3-font-color8)", label: tomatoI18n.伏笔 },
        { color: "var(--b3-font-color9)", label: tomatoI18n.比喻 },
        { color: "var(--b3-font-color10)", label: tomatoI18n.对比 },
        { color: "var(--b3-font-color11)", label: tomatoI18n.因果 },
    ]);
</script>

<div class="settingBox">
    <div class="section-title">
        <input type="checkbox" class="b3-switch" bind:checked={$mindWireCheckbox} />
        {tomatoI18n.思维导线}
        <ConfHelpIcon token="QNArdYNuuoH34qxGHdCcHmE6nic" />
    </div>
    {#if $mindWireCheckbox}
        <div>
            {tomatoI18n.思维导线帮助}
        </div>
        <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$mindWireGlobalMenu} />
            {tomatoI18n.menu添加右键菜单}:
            {MindWire启用或禁用思维导线.langText()}
            <HotkeyCap hk={MindWire启用或禁用思维导线} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$mindWireDocMenu} />
            {tomatoI18n.menu添加右键菜单}:
            {MindWire启用或禁用文档思维导线.langText()}
            <HotkeyCap hk={MindWire启用或禁用文档思维导线} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$mindWireStarRefOnly} />
            {tomatoI18n.只关联星号引用}
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$mindWireWordWire} />
            {tomatoI18n.划词连线}
            <HotkeyCap hk={MindWire划词连线} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            {tomatoI18n.线型}
            <div class="tomato-chip-row">
                <button
                    class="tomato-chip"
                    class:tomato-chip--selected={lineStyle === "dash"}
                    onclick={() => pickLineStyle("dash")}>{tomatoI18n.虚线}</button
                >
                <button
                    class="tomato-chip"
                    class:tomato-chip--selected={lineStyle === "flow"}
                    onclick={() => pickLineStyle("flow")}>{tomatoI18n.流动}</button
                >
                <button
                    class="tomato-chip"
                    class:tomato-chip--selected={lineStyle === "solid"}
                    class:tomato-chip--disabled={!codeValid}
                    onclick={() => pickLineStyle("solid")}>{tomatoI18n.实线}<TomatoVIP {codeValid}></TomatoVIP></button
                >
            </div>
        </div>
        <div>
            <input class="b3-text-field" type="number" min="0.1" bind:value={$mindWireWidth} />
            {tomatoI18n.线条宽度}
            <span class="helpText">{tomatoI18n.线宽建议}</span>
        </div>
        <div class:codeNotValid>
            <input
                disabled={codeNotValid}
                type="checkbox"
                class="b3-switch"
                bind:checked={$mindWireColorfull}
            />
            {tomatoI18n.使用多种颜色}<TomatoVIP {codeValid}></TomatoVIP>
            <div class="helpText">{tomatoI18n.关系配色帮助}</div>
            {#if $mindWireColorfull}
                <div class="tomato-mind-wire-legend" aria-label={tomatoI18n.关系配色帮助}>
                    {#each relationLegend as r (r.color)}
                        <span class="tomato-mind-wire-legend-item">
                            <span class="tomato-mind-wire-legend-dot" style="background:{r.color}"></span>
                            {r.label}
                        </span>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    /* 关系色板图例（spec §4.8 行 9）：只读 legend，色 token 与渲染层 RELATION_COLOR 同源 */
    .tomato-mind-wire-legend {
        display: flex;
        flex-wrap: wrap;
        column-gap: 10px;
        row-gap: 4px;
        margin-top: 4px;
    }
    .tomato-mind-wire-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        line-height: 1.5;
        color: var(--b3-theme-on-surface-light, var(--b3-theme-on-surface));
    }
    .tomato-mind-wire-legend-dot {
        flex: none;
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }
    /* 线型 chip 里的 VIP 徽标与档名拉开间距（chip 24px 行高内 14px 徽标贴字会糊） */
    .tomato-chip :global(.tomato-vip-tag) {
        margin-left: 4px;
    }
</style>
