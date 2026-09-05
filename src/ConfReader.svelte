<script lang="ts">
    // 设置域组件（二期 14 域 2026-09-05）：阅读——阅读点单卡成域（翻新大功能上浮，
    // 番茄钟同款单卡域先例）。自 ConfEditBlock.svelte 拆出（整卡迁入内部一行不动），
    // 共享样式见 IndexConf.css。
    import {
        readingAddDeleteMenu,
        readingAddJumpMenu,
        readingAddRPmenu,
        readingFloatBar,
        readingPointBoxCheckbox,
        readingStatusBar,
        readingTopBar,
    } from "./libs/stores";
    import {
        ReadingPointBox删除当前文档的阅读点,
        ReadingPointBox查看阅读点,
        ReadingPointBox设置阅读点,
        ReadingPointBox跳到当前文档的阅读点,
    } from "./ReadingPointBox";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
</script>

<!-- 阅读点 -->
<div class="settingBox">
    <div class="section-title">
        <input type="checkbox" class="b3-switch" bind:checked={$readingPointBoxCheckbox} />
        {tomatoI18n.阅读点}
        <ConfHelpIcon token="KQOWdXzT8o05LlxPfJCcBHNEnYc" />
    </div>
    {#if $readingPointBoxCheckbox}
        <div>
            {ReadingPointBox查看阅读点.langText()}<HotkeyCap hk={ReadingPointBox查看阅读点} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$readingFloatBar} />
            {tomatoI18n.显示阅读点悬浮球}
        </div>
        <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$readingAddRPmenu} />
            {tomatoI18n.menu添加右键菜单}:{ReadingPointBox设置阅读点.langText()}<HotkeyCap hk={ReadingPointBox设置阅读点} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$readingAddJumpMenu} />
            {tomatoI18n.menu添加右键菜单}:{ReadingPointBox跳到当前文档的阅读点.langText()}<HotkeyCap hk={ReadingPointBox跳到当前文档的阅读点} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$readingAddDeleteMenu} />
            {tomatoI18n.menu添加右键菜单}:{ReadingPointBox删除当前文档的阅读点.langText()}<HotkeyCap hk={ReadingPointBox删除当前文档的阅读点} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$readingStatusBar} />
            {tomatoI18n.状态栏添加阅读点开关钮}
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$readingTopBar} />
            {tomatoI18n.topbar添加图标}
        </div>
    {/if}
</div>
