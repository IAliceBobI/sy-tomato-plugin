<script lang="ts">
    // 设置域组件（二期 14 域 2026-09-05；三期 2026-09-08 增文档别名卡）：编辑器工具
    // （待翻新小功能下沉域）——平铺 5 卡 = 块折叠助手（6 开关原样）/ 多行选择（移动端+
    // 桌面端两卡合一、两行开关，store 与文案原样）/ 列表工具 / 复制为图片 / 文档别名
    // （三期自通用域杂项卡归位）；收拢 1 卡 = 「编辑器行为」（uiclean 2026-09-12：原
    // 「编辑器外观与行为」折叠卡 8 开关中的 6 件纯 CSS 外观件迁外观域 ConfAppearance，
    // 余 2 件行为开关保留、折叠展开为普通两行）。自 ConfEditBlock.svelte 拆出
    // （各卡整块迁入内部一行不动），共享样式见 IndexConf.css。
    import {
        addSelectionBtnsDesktop,
        addSelectionBtnsMobile,
        awaysExitFocusStore,
        foldTypes,
        foldTypesBLOCKQUOTE,
        foldTypesNODE_HEADING,
        foldTypesNODE_LIST,
        foldTypesNODE_TABLE,
        foldTypesNODE_listITEM,
        foldTypesSuperBlock,
        keepLazyLoadStore,
        dont_break_list,
        listBoxCheckbox,
        imgBoxCheckbox,
        imgBoxShowMenu,
        mixBoxPinyin,
    } from "./libs/stores";
    import { ListBox取消勾选当前文档所有已完成的todo任务, ListBox删除当前文档所有已完成的todo任务 } from "./ListBox";
    import { ImgBoxHotKey } from "./ImgBox";
    import {
        MixBox将选择文字加入文档的别名,
        MixBox将选择文字与其拼音加入文档的别名,
    } from "./MixBox";
    import { BlockNodeEnum } from "./libs/gconst";
    import { pushUniq } from "stonev5-utils";
    import { removeFromArr } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    // □4 总开关（三期强化，colocated-compact 偏好=开关+名称合一行）：折叠助手=6 块类型
    // 一键全开/全关（全开=六 store true+foldTypes 填满；全关=六 false+数组清空，与逐项
    // 开关的 pushUniq/removeFromArr 数据一致）；多行选择=桌面/移动两 store 同步置位。
    // 勾选态 $derived 跟随子开关（手动逐项全开时总开关自动点亮）
    const FOLD_TYPES_ALL: Array<[any, string]> = [
        [foldTypesSuperBlock, BlockNodeEnum.NODE_SUPER_BLOCK],
        [foldTypesBLOCKQUOTE, BlockNodeEnum.NODE_BLOCKQUOTE],
        [foldTypesNODE_LIST, BlockNodeEnum.NODE_LIST],
        [foldTypesNODE_listITEM, BlockNodeEnum.NODE_LIST_ITEM],
        [foldTypesNODE_TABLE, BlockNodeEnum.NODE_TABLE],
        [foldTypesNODE_HEADING, BlockNodeEnum.NODE_HEADING],
    ];
    let foldMasterOn = $derived(
        $foldTypesSuperBlock && $foldTypesBLOCKQUOTE && $foldTypesNODE_LIST &&
        $foldTypesNODE_listITEM && $foldTypesNODE_TABLE && $foldTypesNODE_HEADING,
    );
    function toggleFoldMaster(ev: Event) {
        const target = ev.currentTarget as HTMLInputElement;
        const on = target?.checked ?? !foldMasterOn;
        for (const [store] of FOLD_TYPES_ALL) store.set(on);
        foldTypes.set(on ? FOLD_TYPES_ALL.map(([, node]) => node) : []);
    }
    let selectionMasterOn = $derived($addSelectionBtnsMobile && $addSelectionBtnsDesktop);
    function toggleSelectionMaster(ev: Event) {
        const target = ev.currentTarget as HTMLInputElement;
        const on = target?.checked ?? !selectionMasterOn;
        addSelectionBtnsMobile.set(on);
        addSelectionBtnsDesktop.set(on);
    }
</script>

<!-- 块折叠助手（折叠图标段，自 ConfEditor.svelte 迁入；□4 补总开关=6 块类型一键） -->
<div class="settingBox">
    <div class="section-title">
        <input type="checkbox" class="b3-switch" checked={foldMasterOn} onchange={toggleFoldMaster} />
        {tomatoI18n.块折叠助手}: {tomatoI18n.在块的右上角显示折叠图标}
        <ConfHelpIcon token="RqDsdlLkwolnUgxyEmVcDuv8nwd" />
    </div>
    <div class="tomato-fold-types">
        <!-- 超级块 -->
        <label class="space">
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$foldTypesSuperBlock}
                onchange={() => {
                    if ($foldTypesSuperBlock) {
                        pushUniq($foldTypes, BlockNodeEnum.NODE_SUPER_BLOCK);
                    } else {
                        removeFromArr($foldTypes, BlockNodeEnum.NODE_SUPER_BLOCK);
                    }
                }}
            />
            {tomatoI18n.超级块}
        </label>
        <!-- 引述块 -->
        <label class="space">
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$foldTypesBLOCKQUOTE}
                onchange={() => {
                    if ($foldTypesBLOCKQUOTE) {
                        pushUniq($foldTypes, BlockNodeEnum.NODE_BLOCKQUOTE);
                    } else {
                        removeFromArr($foldTypes, BlockNodeEnum.NODE_BLOCKQUOTE);
                    }
                }}
            />
            {tomatoI18n.引述块}
        </label>
        <!-- 列表块 -->
        <label class="space">
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$foldTypesNODE_LIST}
                onchange={() => {
                    if ($foldTypesNODE_LIST) {
                        pushUniq($foldTypes, BlockNodeEnum.NODE_LIST);
                    } else {
                        removeFromArr($foldTypes, BlockNodeEnum.NODE_LIST);
                    }
                }}
            />
            {tomatoI18n.列表块}
        </label>
        <!-- 列表项 -->
        <label class="space">
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$foldTypesNODE_listITEM}
                onchange={() => {
                    if ($foldTypesNODE_listITEM) {
                        pushUniq($foldTypes, BlockNodeEnum.NODE_LIST_ITEM);
                    } else {
                        removeFromArr($foldTypes, BlockNodeEnum.NODE_LIST_ITEM);
                    }
                }}
            />
            {tomatoI18n.列表项}
        </label>
        <!-- 表格 -->
        <label class="space">
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$foldTypesNODE_TABLE}
                onchange={() => {
                    if ($foldTypesNODE_TABLE) {
                        pushUniq($foldTypes, BlockNodeEnum.NODE_TABLE);
                    } else {
                        removeFromArr($foldTypes, BlockNodeEnum.NODE_TABLE);
                    }
                }}
            />
            {tomatoI18n.表格}
        </label>
        <!-- 标题块 -->
        <label class="space">
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$foldTypesNODE_HEADING}
                onchange={() => {
                    if ($foldTypesNODE_HEADING) {
                        pushUniq($foldTypes, BlockNodeEnum.NODE_HEADING);
                    } else {
                        removeFromArr($foldTypes, BlockNodeEnum.NODE_HEADING);
                    }
                }}
            />
            {tomatoI18n.标题}
        </label>
    </div>
</div>
<!-- 多行选择（自 ConfEditor.svelte 迁入；二期两卡合一、两行开关；□4 补总开关=桌面/移动一键） -->
<div class="settingBox">
    <div class="section-title">
        <input type="checkbox" class="b3-switch" checked={selectionMasterOn} onchange={toggleSelectionMaster} />
        {tomatoI18n.多行选择}
        <ConfHelpIcon token="Gh0udnFdGoiu8txrgE2c3SQenxf" />
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$addSelectionBtnsMobile} />
        {tomatoI18n.移动端编辑器右上角添加多行选择按钮}
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$addSelectionBtnsDesktop} />
        {tomatoI18n.桌面端编辑器右上角添加多行选择按钮}
    </div>
</div>
<!-- 列表工具 -->
<div class="settingBox">
    <div class="section-title">
        <input type="checkbox" class="b3-switch" bind:checked={$listBoxCheckbox} />
        {tomatoI18n.列表工具}
        <ConfHelpIcon token="GbeDdl1Bro3laRxlfqrcl10OnTc" />
    </div>
    {#if $listBoxCheckbox}
        <div>
            {ListBox取消勾选当前文档所有已完成的todo任务.langText()}
            <HotkeyCap hk={ListBox取消勾选当前文档所有已完成的todo任务} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            {ListBox删除当前文档所有已完成的todo任务.langText()}
            <HotkeyCap hk={ListBox删除当前文档所有已完成的todo任务} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$dont_break_list} />
            {tomatoI18n.阻止连续回车断开列表}
        </div>
    {/if}
</div>
<!-- 复制为图片 -->
<div class="settingBox">
    <div class="section-title">
        <input type="checkbox" class="b3-switch" bind:checked={$imgBoxCheckbox} />
        {tomatoI18n.复制为图片}<HotkeyCap hk={ImgBoxHotKey} pluginName="sy-tomato-plugin"></HotkeyCap>
        <ConfHelpIcon token="QGx5d437SoArUyxZ6c3cqhmfnnb" />
    </div>
    {#if $imgBoxCheckbox}
        <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$imgBoxShowMenu} />
            {tomatoI18n.menu添加右键菜单}
        </div>
    {/if}
</div>
<!-- 文档别名（三期自通用域杂项卡归位：选字加入别名键帽+拼音开关） -->
<div class="settingBox">
    <div class="section-title">{tomatoI18n.文档别名}</div>
    <div>
        {MixBox将选择文字加入文档的别名.langText()}<HotkeyCap hk={MixBox将选择文字加入文档的别名} pluginName="sy-tomato-plugin"></HotkeyCap>
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$mixBoxPinyin} />
        {tomatoI18n.menu添加右键菜单}: {MixBox将选择文字与其拼音加入文档的别名.langText()}<HotkeyCap hk={MixBox将选择文字与其拼音加入文档的别名} pluginName="sy-tomato-plugin"></HotkeyCap>
    </div>
</div>
<!-- 编辑器行为（uiclean 2026-09-12：原「编辑器外观与行为」折叠卡的 6 件纯 CSS 外观开关
     迁外观域 ConfAppearance，本卡留 2 件行为开关、折叠展开为普通两行） -->
<div class="settingBox">
    <div class="section-title">{tomatoI18n.编辑器行为}</div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$keepLazyLoadStore} />
        {tomatoI18n.总是保持已经加载的内容}
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$awaysExitFocusStore} />
        {tomatoI18n.总是退出聚焦}
    </div>
</div>

<style>
    /* □2 双栏右栏收窄暴露：折叠助手 6 个开关 label 整组换行（白名单换行点在 label 边界），
     * 防单个 label 的 switch 与文字被拆到两行（vision R1 P1-1；原全宽面板下不触发） */
    .tomato-fold-types label {
        white-space: nowrap;
    }
</style>
