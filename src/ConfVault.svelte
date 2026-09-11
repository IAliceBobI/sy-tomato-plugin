<script lang="ts">
    // 功能仓库域（三期 2026-09-08）：低优先级功能的设置收纳位——只收设置入口，
    // 功能代码/命令注册/键帽/右键菜单一行不动（降级位置不降级功能）；翻新一个拎回主域。
    // 住户=已收纳命令卡（□2 杂项分家桶1）+ 前缀文档树卡（□3 自 ConfDocs 迁入，翻新方向记档）
    // + 头部「全部显示」兜底钮（□3 自通用域右键菜单管理卡迁入）。
    // agentrev □2（2026-09-10）：人工智能（AIBox）/AI 助手面板/coze 三卡整卡迁出→独立
    // 「AI 助手」域 ConfAgent.svelte（bear ①；coze 收折叠位 bear ⑦）。
    import {
        prefixArticlesEnable,
        prefixArticlesMenu,
        prefixArticlesSoftLimit,
        hiddenMenuItems,
    } from "./libs/stores";
    import { PrefixArticles前缀文档树 } from "./PrefixArticles";
    import {
        MixBox复制文档为纯文本,
        MixBox空格隔开的所有内容都转为引用,
    } from "./MixBox";
    import {
        EXPORT_CARD_MENU_ITEMS,
        ANNO_CARD_MENU_ITEMS,
        DOCTREE_CARD_MENU_ITEMS,
    } from "./libs/menuItemRegistry";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    // 「全部显示」兜底（三期自通用域右键菜单管理卡迁入）：清空隐藏集+逐组开 store/master
    // ——跨三组功能卡常量（导出白/黑名单、批注五项、文档树工具四项），漏一组=勾选态假恢复；
    // 含历史被藏项（行删除后无逐项写入路径，清空整个隐藏集故照常覆盖迁移项）
    function showAllMenuItems() {
        hiddenMenuItems.set([]);
        const all = [
            ...EXPORT_CARD_MENU_ITEMS,
            ...ANNO_CARD_MENU_ITEMS,
            ...DOCTREE_CARD_MENU_ITEMS,
        ];
        for (const it of all) {
            it.store?.set(true);
            it.master?.set(true);
        }
    }
</script>

    <!-- 右键菜单「全部显示」兜底（右键菜单管理卡退役后唯一恢复入口） -->
    <div class="tomato-menu-manage-toolbar">
        <button
            type="button"
            class="b3-button b3-button--small"
            onclick={showAllMenuItems}>{tomatoI18n.全部显示}</button
        >
    </div>
    <!-- 已收纳命令（三期杂项分家桶1：被官方/自家新版替代收纳待翻新，命令与键帽功能照常） -->
    <div class="settingBox">
        <div class="section-title">{tomatoI18n.已收纳命令}</div>
        <div>{tomatoI18n.已收纳命令说明}</div>
        <div>
            {MixBox空格隔开的所有内容都转为引用.langText()}<HotkeyCap hk={MixBox空格隔开的所有内容都转为引用} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            {MixBox复制文档为纯文本.langText()}<HotkeyCap hk={MixBox复制文档为纯文本} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
    </div>
    <!-- 前缀文档树（三期自 ConfDocs 迁入：低优先级收纳待翻新，功能照常活；翻新方向记档
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
            <div>
                <input class="b3-text-field" bind:value={$prefixArticlesSoftLimit} />
                {tomatoI18n.最大列出的文件数量}
            </div>
        {/if}
    </div>
