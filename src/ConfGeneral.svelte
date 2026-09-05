<script lang="ts">
    // 设置域组件（□2 设置页重划）：通用——全局快捷键（原 IndexConf 内联段）/ 右键菜单管理
    // （自 ConfClock.svelte 迁入）/ 杂项（自 ConfMisc.svelte 迁入）。导出工作空间卡已随二期
    // 14 域（2026-09-05）独立成域迁出 ConfExport.svelte。各卡整块迁入（内部一行不动），
    // 共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { tomatoSettingsOpenHK } from ".";
    import { ScheduleCopyID } from "./Schedule";
    import { addFoldCmd折叠, addFoldCmd展开 } from "./fold";
    import { SPACE } from "./libs/gconst";
    import {
        MENU_MANAGE_GROUPS,
        EXPORT_CARD_MENU_ITEMS,
        ANNO_CARD_MENU_ITEMS,
        menuItemSelected,
        nextHiddenKeys,
        type ManagedMenuItem,
    } from "./libs/menuItemRegistry";
    import { menuKeyHidden, menuHiddenKeys } from "./libs/menuManager";
    import {
        hiddenMenuItems,
        mixBoxCheckbox,
        showDocAttrs,
        storeCopyStdMD,
        storeFillMemoMenu,
        storeInsertXml,
        storeRefreshStaticBkLnk,
        storeMoveDocContentHere,
        storeMergeDoc,
        mixBoxPinyin,
        storeOpenRefsMenu,
        storeOpenRefsClick,
    } from "./libs/stores";
    import {
        MixBox使内容模糊,
        MixBox内容制表,
        MixBox列出当前文档与子文档中没被引用的文档,
        MixBox删除块以及闪卡,
        MixBox删除所有flag书签,
        MixBox复制文档为标准Markdown,
        MixBox复制文档为纯文本,
        MixBox定位所有引用Menu,
        MixBox将选择文字与其拼音加入文档的别名,
        MixBox将选择文字加入文档的别名,
        MixBox收集当前文档与子文档所有的未完成任务,
        MixBox添加一个flag书签,
        MixBox空格隔开的所有内容都转为引用,
        MixBox跳转到剪贴板中ID的块,
        MixBox锁定内容,
    } from "./MixBox";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);

    // 右键菜单管理（□4）：checkbox 勾=显示；三层合成判定与隐藏集变更走 menuItemRegistry
    // 共享纯函数（ConfAnno 批注卡/ConfExport 导出卡同用，勿在组件层复制）。toggle 只改
    // 内存，面板关闭由 IndexConf 统一落盘。显示分支连 store/master 一并打开（功能区
    // 总开关关着时勾了也不出现）
    let menuManageTick = $state(0);
    const itemShown = (item: ManagedMenuItem) => menuItemSelected(item, menuKeyHidden);
    function toggleMenuItem(item: ManagedMenuItem, ev: Event) {
        const target = ev.currentTarget as HTMLInputElement;
        const checked = target?.checked ?? !itemShown(item);
        hiddenMenuItems.set(nextHiddenKeys(menuHiddenKeys(), item.key, checked));
        if (checked) {
            item.store?.set(true);
            item.master?.set(true);
        }
        menuManageTick++;
    }
    function showAllMenuItems() {
        hiddenMenuItems.set([]);
        // □3 补全：功能卡常量（导出白/黑名单、批注五项）一并恢复——否则「全部显示」清了
        // 隐藏集却不开它们的 master（总开关），勾选态照旧 false，恢复语义缺口
        // （二期起导出/批注两卡已迁出本组件，恢复仍跨卡引用其常量，语义不变）
        const all = [
            ...MENU_MANAGE_GROUPS.flatMap((g) => g.items),
            ...EXPORT_CARD_MENU_ITEMS,
            ...ANNO_CARD_MENU_ITEMS,
        ];
        for (const it of all) {
            it.store?.set(true);
            it.master?.set(true);
        }
        menuManageTick++;
    }
</script>

    <!-- 快捷键 -->
    <div class="settingBox">
        <div class="section-title">{tomatoI18n.快捷键如有冲突请调整}<ConfHelpIcon token="XyFPdPBbsol477xl5TFcX9Ttn2e" /></div>
        <div>
            {tomatoSettingsOpenHK.langText()}<HotkeyCap hk={tomatoSettingsOpenHK} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            {ScheduleCopyID.langText() + SPACE}<HotkeyCap hk={ScheduleCopyID} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            {addFoldCmd折叠.langText()}<HotkeyCap hk={addFoldCmd折叠} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            {addFoldCmd展开.langText()}<HotkeyCap hk={addFoldCmd展开} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
    </div>
    <!-- 右键菜单管理 -->
    <div class="settingBox">
        <div class="section-title">{tomatoI18n.右键菜单管理}</div>
        <div class="tomato-menu-manage-note">{tomatoI18n.右键菜单管理说明}</div>
        <div class="tomato-menu-manage-toolbar">
            <button
                type="button"
                class="b3-button b3-button--small"
                onclick={showAllMenuItems}>{tomatoI18n.全部显示}</button
            >
        </div>
        {#key menuManageTick}
        {#each MENU_MANAGE_GROUPS as group (group.title())}
            <div class="tomato-menu-manage-group">
                <div class="tomato-menu-manage-group-title">{group.title()}</div>
                {#each group.items as item (item.key)}
                    <label class="fn__flex fn__flex-center tomato-menu-manage-item">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            checked={itemShown(item)}
                            onchange={(ev) => toggleMenuItem(item, ev)}
                        />
                        <span class="fn__space"></span>
                        <span class="tomato-menu-manage-label">{item.label()}</span>
                    </label>
                {/each}
            </div>
        {/each}
        {/key}
    </div>
    <!-- 杂项 -->
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
                {MixBox空格隔开的所有内容都转为引用.langText()}
                <HotkeyCap hk={MixBox空格隔开的所有内容都转为引用} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {MixBox收集当前文档与子文档所有的未完成任务.langText()}
                <HotkeyCap hk={MixBox收集当前文档与子文档所有的未完成任务} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {MixBox列出当前文档与子文档中没被引用的文档.langText()}
                <HotkeyCap hk={MixBox列出当前文档与子文档中没被引用的文档} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {MixBox将选择文字加入文档的别名.langText()}<HotkeyCap hk={MixBox将选择文字加入文档的别名} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {MixBox复制文档为纯文本.langText()}<HotkeyCap hk={MixBox复制文档为纯文本} pluginName="sy-tomato-plugin"></HotkeyCap>
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
                <input type="checkbox" class="b3-switch" bind:checked={$storeRefreshStaticBkLnk} />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.刷新静态反链}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeMoveDocContentHere} />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.把文档内容移动到这里}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeMergeDoc} />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.合并文档到这里}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$mixBoxPinyin} />
                {tomatoI18n.menu添加右键菜单}: {MixBox将选择文字与其拼音加入文档的别名.langText()}<HotkeyCap hk={MixBox将选择文字与其拼音加入文档的别名} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeOpenRefsMenu} />
                {tomatoI18n.menu添加右键菜单}: {MixBox定位所有引用Menu.langText()}<HotkeyCap hk={MixBox定位所有引用Menu} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div class:codeNotValid>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$storeOpenRefsClick}
                    disabled={codeNotValid}
                    class:codeNotValid
                />
                {tomatoI18n.点击引用数打开所有引用}<TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeCopyStdMD} />
                {tomatoI18n.menu添加右键菜单}: {MixBox复制文档为标准Markdown.langText()}<HotkeyCap hk={MixBox复制文档为标准Markdown} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
        {/if}
    </div>
