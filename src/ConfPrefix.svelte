<script lang="ts">
    // 前缀文档树域（prefixui □3，bear 拍板：功能仓库域退役、前缀文档树独立成域）：卡自
    // ConfVault 整卡裁出（行内一行不动）——总开关/右键菜单+键帽/最大列出数量/帮助图标。
    // 域形态对齐 ConfKnowledge 先例（纯文字域名无图标、两卡以内精简）；导航占 ConfVault
    // 原位（尾部区，杂项之后），navActive 兼容映射 vault→prefix（aibox 同步改挂）。
    import { prefixArticlesEnable, prefixArticlesMenu, prefixArticlesSoftLimit } from "./libs/stores";
    import { PrefixArticles前缀文档树, PrefixArticlesDock } from "./PrefixArticles";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
</script>

    <!-- 前缀文档树（prefixui □3 自功能仓库域 ConfVault 整卡迁入独立成域；翻新方向记档
         ZCode memory tomato-settings-vault-brainstorm） -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$prefixArticlesEnable} />
            {tomatoI18n.前缀文档树}
            <ConfHelpIcon token="WD3Nd8WCxozzE4xXIJucpFBPn9a" />
        </div>
        {#if $prefixArticlesEnable}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$prefixArticlesMenu} />
                {tomatoI18n.menu添加右键菜单}: {PrefixArticles前缀文档树.langText()}
                <HotkeyCap hk={PrefixArticles前缀文档树} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <!-- Dock 面板键帽（gfloatnav 盘点补漏 09-19：⇧⌥F5 打开面板命令一直有键无键帽；
                 行名与 ⇧⌥G 选区命令区分——一个是打开面板一个是处理选区 -->
            <div>
                {tomatoI18n.打开前缀文档树面板}
                <HotkeyCap hk={PrefixArticlesDock} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input class="b3-text-field" bind:value={$prefixArticlesSoftLimit} />
                {tomatoI18n.最大列出的文件数量}
            </div>
        {/if}
    </div>
