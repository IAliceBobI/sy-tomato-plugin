<script lang="ts">
    // 杂项独立域（三期 2026-09-08，15 域终态）：通用域杂项卡 21 项大分家后的留驻 11 项——
    // mixBoxCheckbox 总开关照旧门控（显示文档属性/删块闪卡/制表/模糊/跳剪贴板/flag 书签×2/
    // 收集未完成任务/锁定内容/插入脑图/复制标准 MD），各回各家与进功能仓库的 10 项见
    // ConfLink/ConfDocs/ConfEditorTools/ConfVault。自 ConfGeneral 杂项卡迁入（行内一行不动，
    // 仅迁出 {#if} 归属新卡），共享样式见 IndexConf.css。命名 ConfMiscDomain 避开历史 ConfMisc
    // （一期退役件）防混淆。
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import {
        mixBoxCheckbox,
        showDocAttrs,
        storeCopyStdMD,
        storeFillMemoMenu,
        storeInsertXml,
    } from "./libs/stores";
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
    } from "./MixBox";
</script>

    <!-- 杂项（总开关+11 小功能，自通用域分家迁入） -->
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
