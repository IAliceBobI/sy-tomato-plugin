<script lang="ts">
    // 杂项独立域（三期 2026-09-08，15 域终态）：通用域杂项卡 21 项大分家后的留驻 11 项——
    // mixBoxCheckbox 总开关照旧门控（显示文档属性/删块闪卡/制表/模糊/跳剪贴板/flag 书签×2/
    // 收集未完成任务/锁定内容/插入脑图/复制标准 MD），各回各家的 8 项见
    // ConfLink/ConfDocs/ConfEditorTools。命名 ConfMiscDomain 避开历史 ConfMisc（一期退役件）防混淆。
    // confgather2 期1（2026-09-17 bear 拍板「配置跟功能走」）：右键菜单「全部显示」兜底钮自
    // 通用域头部迁本域头部（菜单管理=杂事）；「已收纳命令」卡退役（与命令开关域 misc 族镜像
    // 重复的第二视图）——空格转引用/复制纯文本两键帽行并入杂项主卡（期3 随低频命令键帽七行
    // 一起收进「更多命令」折叠）。
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import {
        hiddenMenuItems,
        mixBoxCheckbox,
        showDocAttrs,
        storeCopyStdMD,
        storeFillMemoMenu,
        storeInsertXml,
    } from "./libs/stores";
    import {
        EXPORT_CARD_MENU_ITEMS,
        ANNO_CARD_MENU_ITEMS,
        DOCTREE_CARD_MENU_ITEMS,
    } from "./libs/menuItemRegistry";
    import {
        MixBox使内容模糊,
        MixBox内容制表,
        MixBox删除块以及闪卡,
        MixBox删除所有flag书签,
        MixBox复制文档为标准Markdown,
        MixBox收集当前文档与子文档所有的未完成任务,
        MixBox添加一个flag书签,
        MixBox跳转到剪贴板中ID的块,
        MixBox锁定内容,
        MixBox复制文档为纯文本,
        MixBox空格隔开的所有内容都转为引用,
    } from "./MixBox";

    // 右键菜单「全部显示」兜底（prefixui □3 自功能仓库域迁回通用域，confgather2 期1 再迁
    // 杂项域=杂事归位；右键菜单管理卡退役后此钮=隐藏项唯一恢复入口）：清空隐藏集+逐组开
    // store/master——跨三组功能卡常量（导出白/黑名单、批注五项、文档树工具四项），漏一组=
    // 勾选态假恢复；含历史被藏项（行删除后无逐项写入路径，清空整个隐藏集故照常覆盖迁移项）
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

    <!-- 右键菜单「全部显示」兜底（confgather2 期1 自通用域头部迁入：菜单管理=杂事归杂项域） -->
    <div class="tomato-menu-manage-toolbar">
        <button
            type="button"
            class="b3-button b3-button--small b3-button--outline"
            onclick={showAllMenuItems}>{tomatoI18n.全部显示}</button
        >
    </div>

    <!-- 杂项（总开关+11 小功能，自通用域分家迁入；confgather2 期1 已收纳命令两行并入） -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$mixBoxCheckbox} />
            {tomatoI18n.杂项许多小功能}
            <ConfHelpIcon token="Yw4UdhdaTo25dhxtiPUcPnNzn3c" />
        </div>
        {#if $mixBoxCheckbox}
            <!-- 显示文档属性 -->
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$showDocAttrs} />
                {tomatoI18n.显示文档属性}
            </div>
            <!-- 更多命令折叠（confgather2 期3 A8，bear 拍板收折叠）：低频命令键帽七行
                 （删块制卡/制表/模糊/剪贴板跳转/flag 书签×2/收集未完成任务）+期1 B4 并入的
                 已收纳命令两行（空格转引用/复制纯文本，被官方/自家新版替代收纳待翻新）；
                 与命令开关域 misc 族=同数据双视图 -->
            <details class="settingBox">
                <summary class="section-title">{tomatoI18n.更多命令}</summary>
                <div class="softBox">
                    <div>
                        {MixBox删除块以及闪卡.langText()}
                        <HotkeyCap hk={MixBox删除块以及闪卡} pluginName="sy-tomato-plugin"></HotkeyCap>
                    </div>
                    <div>
                        {MixBox内容制表.langText()}
                        <HotkeyCap hk={MixBox内容制表} pluginName="sy-tomato-plugin"></HotkeyCap>
                    </div>
                    <div>
                        {MixBox使内容模糊.langText()}
                        <HotkeyCap hk={MixBox使内容模糊} pluginName="sy-tomato-plugin"></HotkeyCap>
                    </div>
                    <div>
                        {MixBox跳转到剪贴板中ID的块.langText()}
                        <HotkeyCap hk={MixBox跳转到剪贴板中ID的块} pluginName="sy-tomato-plugin"></HotkeyCap>
                    </div>
                    <div>
                        {MixBox添加一个flag书签.langText()}
                        <HotkeyCap hk={MixBox添加一个flag书签} pluginName="sy-tomato-plugin"></HotkeyCap>
                    </div>
                    <div>
                        {MixBox删除所有flag书签.langText()}
                        <HotkeyCap hk={MixBox删除所有flag书签} pluginName="sy-tomato-plugin"></HotkeyCap>
                    </div>
                    <div>
                        {MixBox收集当前文档与子文档所有的未完成任务.langText()}
                        <HotkeyCap hk={MixBox收集当前文档与子文档所有的未完成任务} pluginName="sy-tomato-plugin"></HotkeyCap>
                    </div>
                    <div>
                        {MixBox空格隔开的所有内容都转为引用.langText()}<HotkeyCap hk={MixBox空格隔开的所有内容都转为引用} pluginName="sy-tomato-plugin"></HotkeyCap>
                    </div>
                    <div>
                        {MixBox复制文档为纯文本.langText()}<HotkeyCap hk={MixBox复制文档为纯文本} pluginName="sy-tomato-plugin"></HotkeyCap>
                    </div>
                </div>
            </details>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeFillMemoMenu} />
                {tomatoI18n.menu添加右键菜单}: {MixBox锁定内容.langText()}<HotkeyCap hk={MixBox锁定内容} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeInsertXml} />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.插入空的脑图流程图文件}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeCopyStdMD} />
                {tomatoI18n.menu添加右键菜单}: {MixBox复制文档为标准Markdown.langText()}<HotkeyCap hk={MixBox复制文档为标准Markdown} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
        {/if}
    </div>

<style>
    /* 更多命令折叠 🚩 书签两行：emoji 字形膨胀行框致行距不均（实测 35→40/39px，与面板常规
       行差 4~5px）——ConfCommands.ts 同款钉平先例，但其为 scoped 只管自家行；本折叠行嵌
       .softBox 内（非 .settingBox 直接子代），照抄会落空，选择器下探一层 */
    .settingBox .softBox > div {
        line-height: 1.64;
    }
</style>
