<script lang="ts">
    // IndexConf 设置分区：文档树工具 / 多行选择 / 引用与列表 CSS 外观 / 折叠助手 / 前缀文档树。
    // 从 IndexConf.svelte 拆出（2026-08 重构），共享样式见 IndexConf.css（.tomato-settings-dialog 作用域）。
    import TomatoVIP from "./TomatoVIP.svelte";
    import {
        addSelectionBtnsDesktop,
        addSelectionBtnsMobile,
        awaysExitFocusStore,
        cssHomeEndIconLeft,
        cssListBackgound,
        cssNattyList,
        cssRefAsTags,
        cssRefSquareBrackets,
        cssRefStyle,
        cssShowFlashCardBlank,
        cssShowHomeEndIcon,
        cssShowMemo,
        cssSuperBlockBorder,
        foldTypes,
        foldTypesBLOCKQUOTE,
        foldTypesNODE_HEADING,
        foldTypesNODE_LIST,
        foldTypesNODE_TABLE,
        foldTypesNODE_listITEM,
        foldTypesSuperBlock,
        keepLazyLoadStore,
        prefixArticlesEnable,
        prefixArticlesMenu,
        prefixArticlesSoftLimit,
    } from "./libs/stores";
    import { BlockNodeEnum } from "./libs/gconst";
    import { pushUniq } from "stonev5-utils";
    import { removeFromArr } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    import { PrefixArticles前缀文档树 } from "./PrefixArticles";
    import { helpOpen } from "./helpOpen";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);
</script>

    <!-- 文档树工具 -->
    <div class="settingBox">
        <div>
            {tomatoI18n.文档树工具}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/NXSPd81W4oxUJrxW2XsctewUn5g?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
    </div>
    <!-- 多行选择 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$addSelectionBtnsMobile} />
            {tomatoI18n.移动端编辑器右上角添加多行选择按钮}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/Gh0udnFdGoiu8txrgE2c3SQenxf?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
    </div>
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$addSelectionBtnsDesktop} />
            {tomatoI18n.桌面端编辑器右上角添加多行选择按钮}
        </div>
    </div>
    <!-- 引用前后加上括号 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssRefSquareBrackets} />
            {tomatoI18n.引用前后加上括号}
        </div>
    </div>
    <!-- 给引用加上效果 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssRefStyle} />
            {tomatoI18n.给引用加上效果}
        </div>
    </div>
    <!-- 将指定的引用渲染为标签 -->
    <div class="settingBox">
        <div class:codeNotValid>
            {tomatoI18n.将指定的引用渲染为标签}
            <TomatoVIP {codeValid}></TomatoVIP><br />
            <textarea
                disabled={codeNotValid}
                class:codeNotValid
                class="b3-text-field"
                bind:value={$cssRefAsTags}
                placeholder="@,tag,label"
                spellcheck="false"
            ></textarea>
        </div>
    </div>
    <!-- 显示备注 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssShowMemo} />
            {tomatoI18n.显示备注}
        </div>
    </div>
    <!-- 给所有超级块加上边框 -->
    <div class="settingBox">
        <input type="checkbox" class="b3-switch" bind:checked={$cssSuperBlockBorder} />
        {tomatoI18n.给所有超级块加上边框}
    </div>
    <!-- 极简无序列表样式 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssNattyList} />
            {tomatoI18n.极简无序列表样式}
        </div>
    </div>
    <!-- 给无序列表加上背景色 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssListBackgound} />
            {tomatoI18n.给无序列表加上背景色}
        </div>
    </div>
    <!-- 鼠标悬浮显示闪卡挖空的内容 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssShowFlashCardBlank} />
            {tomatoI18n.鼠标悬浮显示闪卡挖空的内容}
        </div>
    </div>
    <!-- 永久显示文档右侧的HomeEnd图标 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssShowHomeEndIcon} />
            {tomatoI18n.永久显示文档右侧的HomeEnd图标}
        </div>
    </div>
    <!-- HomeEnd图标放到左边 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssHomeEndIconLeft} />
            {tomatoI18n.HomeEnd图标放到左边}
        </div>
    </div>
    <!-- 总是保持已经加载的内容 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$keepLazyLoadStore} />
            {tomatoI18n.总是保持已经加载的内容}
        </div>
    </div>
    <!-- 总是退出聚焦 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$awaysExitFocusStore} />
            {tomatoI18n.总是退出聚焦}
        </div>
    </div>
    <!-- 折叠助手 -->
    <div class="settingBox">
        <div>
            {tomatoI18n.块折叠助手}： {tomatoI18n.在块的右上角显示折叠图标}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/RqDsdlLkwolnUgxyEmVcDuv8nwd?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        <div>
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
    <!-- 前缀文档树 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$prefixArticlesEnable} />
            {tomatoI18n.前缀文档树}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/WD3Nd8WCxozzE4xXIJucpFBPn9a?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $prefixArticlesEnable}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$prefixArticlesMenu} />
                {tomatoI18n.menu添加右键菜单}: {PrefixArticles前缀文档树.langText()}
                <strong>{PrefixArticles前缀文档树.w()}</strong>
            </div>
            <div>
                <input class="b3-text-field" bind:value={$prefixArticlesSoftLimit} />
                {tomatoI18n.最大列出的文件数量}
            </div>
        {/if}
    </div>
