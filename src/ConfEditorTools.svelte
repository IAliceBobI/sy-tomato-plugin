<script lang="ts">
    // 设置域组件（二期 14 域 2026-09-05）：编辑器工具（待翻新小功能下沉域）——平铺 4 卡 =
    // 块折叠助手（6 开关原样）/ 多行选择（移动端+桌面端两卡合一、两行开关，store 与文案
    // 原样）/ 列表工具 / 复制为图片；收拢 1 卡 = 「编辑器外观与行为」折叠卡收 8 个单开关
    // （默认收起、summary 带计数，搜索命中自动展开）。自 ConfEditBlock.svelte 拆出
    // （各卡整块迁入内部一行不动），共享样式见 IndexConf.css。
    import {
        addSelectionBtnsDesktop,
        addSelectionBtnsMobile,
        awaysExitFocusStore,
        cssListBackgound,
        cssNattyList,
        cssShowMemo,
        cssShowHomeEndIcon,
        cssHomeEndIconLeft,
        cssSuperBlockBorder,
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
    } from "./libs/stores";
    import { ListBox取消勾选当前文档所有已完成的todo任务, ListBox删除当前文档所有已完成的todo任务 } from "./ListBox";
    import { ImgBoxHotKey } from "./ImgBox";
    import { BlockNodeEnum } from "./libs/gconst";
    import { pushUniq } from "stonev5-utils";
    import { removeFromArr } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
</script>

<!-- 块折叠助手（折叠图标段，自 ConfEditor.svelte 迁入） -->
<div class="settingBox">
    <div class="section-title">
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
<!-- 多行选择（自 ConfEditor.svelte 迁入；二期两卡合一、两行开关） -->
<div class="settingBox">
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$addSelectionBtnsMobile} />
        {tomatoI18n.移动端编辑器右上角添加多行选择按钮}
        <ConfHelpIcon token="Gh0udnFdGoiu8txrgE2c3SQenxf" />
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
<!-- 编辑器外观与行为（二期收拢：8 个单开关小卡合一张折叠卡垫域底，默认收起；
     搜索命中 searchSettings 自动展开，块配对折叠区同款） -->
<details class="settingBox">
    <summary class="section-title">{tomatoI18n.编辑器外观与行为}<span class="setting-count">8</span><!-- 计数与下方开关行同步增删 --></summary>
    <div class="softBox">
        <!-- 显示备注 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssShowMemo} />
            {tomatoI18n.显示备注}
        </div>
        <!-- 给所有超级块加上边框 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssSuperBlockBorder} />
            {tomatoI18n.给所有超级块加上边框}
        </div>
        <!-- 极简无序列表样式 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssNattyList} />
            {tomatoI18n.极简无序列表样式}
        </div>
        <!-- 给无序列表加上背景色 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssListBackgound} />
            {tomatoI18n.给无序列表加上背景色}
        </div>
        <!-- 永久显示文档右侧的HomeEnd图标 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssShowHomeEndIcon} />
            {tomatoI18n.永久显示文档右侧的HomeEnd图标}
        </div>
        <!-- HomeEnd图标放到左边 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssHomeEndIconLeft} />
            {tomatoI18n.HomeEnd图标放到左边}
        </div>
        <!-- 总是保持已经加载的内容 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$keepLazyLoadStore} />
            {tomatoI18n.总是保持已经加载的内容}
        </div>
        <!-- 总是退出聚焦 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$awaysExitFocusStore} />
            {tomatoI18n.总是退出聚焦}
        </div>
    </div>
</details>

<style>
    /* □2 双栏右栏收窄暴露：折叠助手 6 个开关 label 整组换行（白名单换行点在 label 边界），
     * 防单个 label 的 switch 与文字被拆到两行（vision R1 P1-1；原全宽面板下不触发） */
    .tomato-fold-types label {
        white-space: nowrap;
    }
</style>
