<script lang="ts">
    // 设置域组件（□2 设置页重划）：编辑与块——块编辑器（域首卡）+ 块配对工具（原 ConfBlocks 主体：
    // 总开关段+同步块/长内容/高级三折叠区，互链与引用折叠区归反链域）+ 编辑器 CSS 小卡族（自
    // ConfEditor 归位）+ 列表工具 + 复制为图片 + 阅读点。各卡整块迁入（内部一行不动），
    // 共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import {
        deleteBlocksMenu,
        linkBoxAttrIconOnHide,
        linkBoxSyncHref,
        linkBoxSyncRef,
        linkBoxSyncScanDeep,
        linkBoxSyncRemapChildID,
        linkBoxBilinkMenu,
        linkBoxLnkTitle,
        linkBoxUseLnkOrRef,
        pairBarDefaultFunc,
        pairBarEnabled,
        pairBarEntryHotkey,
        pairBarEntryIconMenu,
        pairBarEntryMenu,
        pairBarEntryStatus,
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
        readingAddDeleteMenu,
        readingAddJumpMenu,
        readingAddRPmenu,
        readingFloatBar,
        readingPointBoxCheckbox,
        readingStatusBar,
        readingTopBar,
        blockEditorBox,
        blockEditorMenu,
        qeFloatBall,
    } from "./libs/stores";
    import {
        LinkBox互相插入引用于下方创建,
        LinkBox互相插入引用于下方选择,
        LinkBox修复双向链接,
        LinkBox关联两个块创建,
        LinkBox关联两个块选择,
        LinkBox删除双向链接,
        LinkBox双向互链创建往返链,
        LinkBox双向互链选择块,
        LinkBox同步块创建,
        LinkBox同步块选择,
        LinkBox嵌入互链创建,
        LinkBox嵌入互链选择,
        LinkBox查看所有同步位置,
        LinkBox链接到块底部,
        LinkBoxbilink,
    } from "./LinkBox";
    import { CpBox批量删除大量连续内容块, CpBox批量复制大量连续内容块, CpBox批量移动大量连续内容块 } from "./CpBox";
    import { PAIR_FUNCS } from "./libs/pairBarState";
    import { PairBar触发 } from "./PairBarBox";
    import { ListBox取消勾选当前文档所有已完成的todo任务, ListBox删除当前文档所有已完成的todo任务 } from "./ListBox";
    import { ImgBoxHotKey } from "./ImgBox";
    import {
        ReadingPointBox删除当前文档的阅读点,
        ReadingPointBox查看阅读点,
        ReadingPointBox设置阅读点,
        ReadingPointBox跳到当前文档的阅读点,
    } from "./ReadingPointBox";
    import { BlockEditor打开编辑器 } from "./BlockEditor";
    import { BlockNodeEnum } from "./libs/gconst";
    import { pushUniq } from "stonev5-utils";
    import { removeFromArr } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);

    const pairFuncLabel = (k: string) => (tomatoI18n as any)[k] as string;
</script>

<!-- 块编辑器（钉住式第二视口翻新后为本域首卡） -->
<div class="settingBox">
    <div class="section-title">
        <input type="checkbox" class="b3-switch" bind:checked={$blockEditorBox} />
        块编辑器
        <ConfHelpIcon token="AheDdwG35ol3qWxYPeYc8HennJf" />
    </div>
    {#if $blockEditorBox}
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$blockEditorMenu} />
            {tomatoI18n.menu添加右键菜单 + "：" + BlockEditor打开编辑器.langText()}
            <HotkeyCap hk={BlockEditor打开编辑器} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$qeFloatBall} />
            {tomatoI18n.显示块编辑器悬浮球}
        </div>
    {/if}
</div>

<!-- 块配对工具（R5 □1 总开关化）：总开关联动全部命令注册与浮条出场；子选项收进折叠区
     （原生 details，默认收起，搜索命中 searchSettings 自动展开；互链与引用折叠区归反链域） -->
<div class="settingBox">
    <div class="section-title">
        <input type="checkbox" class="b3-switch" bind:checked={$pairBarEnabled} />
        {tomatoI18n.块配对工具}
        <ConfHelpIcon token="TYSCdAHHFoZUhrxy7IdcBri6n1c" />
    </div>
    {#if $pairBarEnabled}
        <div>
            {tomatoI18n.块配对浮条}
            <HotkeyCap hk={PairBar触发} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div class="softBox">
            <div>
                {tomatoI18n.默认功能}
                <select
                    class="b3-select"
                    value={$pairBarDefaultFunc}
                    onchange={(e) => { $pairBarDefaultFunc = e.currentTarget.value; }}
                >
                    <option value="">{tomatoI18n.无默认}</option>
                    {#each PAIR_FUNCS as f (f.id)}
                        <option value={f.id}>{pairFuncLabel(f.labelKey)}</option>
                    {/each}
                </select>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$pairBarEntryHotkey} />
                {tomatoI18n.快捷键入口}
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$pairBarEntryStatus} />
                {tomatoI18n.状态栏入口}
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$pairBarEntryMenu} />
                {tomatoI18n.内容菜单入口}
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$pairBarEntryIconMenu} />
                {tomatoI18n.块图标菜单入口}
            </div>
        </div>
        <!-- 互链与引用选项（LinkBox 族行为开关。老家 ConfBlocks.svelte 折叠区，□2 曾按「引用」
             字面误归 ConfLink 反链域，2026-09-03 归位块配对卡——外层 pairBarEnabled 门控随卡体
             {#if} 天然成立，不再单独挂） -->
        <details class="settingBox">
            <summary class="section-title">{tomatoI18n.互链与引用选项}<ConfHelpIcon token="DmGUdmtacol9ANxy0Encl1ownfP" /></summary>
            <div class="softBox">
                <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$linkBoxBilinkMenu} />
                    {tomatoI18n.menu添加右键菜单}: {LinkBoxbilink.langText()}
                </div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$linkBoxLnkTitle} />
                    {tomatoI18n.给链接加文字}
                </div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$linkBoxUseLnkOrRef} />
                    {tomatoI18n.使用链接否则用引用}
                </div>
            </div>
        </details>
        <!-- 同步块选项（自 ConfLinks.svelte 迁入再入折叠区；VIP 两开关与子选项 store 原样） -->
        <details class="settingBox">
            <summary class="section-title">{tomatoI18n.同步块选项}<ConfHelpIcon token="NaSudYNaBoeGqZxnyHFc9QQVneb" /></summary>
            <div class="softBox">
                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$linkBoxSyncScanDeep}
                    />
                    {tomatoI18n.巡检重算哈希}
                </div>
                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$linkBoxSyncRemapChildID}
                    />
                    {tomatoI18n.子块ID重映射实验}
                </div>
                <div>{tomatoI18n.开启后每个副本的子块使用独立块ID}</div>
                <div class:codeNotValid>
                    <input
                        disabled={codeNotValid}
                        class:codeNotValid
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$linkBoxAttrIconOnHide}
                    />
                    {tomatoI18n.隐藏同步块右上角菜单}<TomatoVIP {codeValid}></TomatoVIP>
                </div>
                <div class:codeNotValid>
                    <input
                        disabled={codeNotValid}
                        class:codeNotValid
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$linkBoxSyncHref}
                    />
                    {tomatoI18n.添加到原始块的链接}<TomatoVIP {codeValid}></TomatoVIP>
                </div>
                <div class:codeNotValid>
                    <input
                        disabled={codeNotValid}
                        class:codeNotValid
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$linkBoxSyncRef}
                    />
                    {tomatoI18n.添加到原始块的引用}<TomatoVIP {codeValid}></TomatoVIP>
                </div>
                <div>
                    {LinkBox查看所有同步位置.langText()}
                    <HotkeyCap hk={LinkBox查看所有同步位置} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    {LinkBox同步块选择.langText()}
                    <HotkeyCap hk={LinkBox同步块选择} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    {LinkBox同步块创建.langText()}
                    <HotkeyCap hk={LinkBox同步块创建} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
            </div>
        </details>
        <!-- 长内容工具选项（自 ConfCards.svelte 迁入再入折叠区，aacc 帮助文案原样） -->
        <details class="settingBox">
            <summary class="section-title">{tomatoI18n.长内容工具选项}<ConfHelpIcon token="Njovdyosyo4pVExpeqOcH3ImnJu" /></summary>
            <div class="softBox">
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$deleteBlocksMenu} />
                    {tomatoI18n.menu添加右键菜单 + "：" + CpBox批量删除大量连续内容块.langText()}
                    <HotkeyCap hk={CpBox批量删除大量连续内容块} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div class="kbd">
                    {@html tomatoI18n.批量删除帮助}
                </div>
                <div>
                    {tomatoI18n.批量移动大量连续内容块}
                    <HotkeyCap hk={CpBox批量移动大量连续内容块} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    {tomatoI18n.批量复制大量连续内容块}
                    <HotkeyCap hk={CpBox批量复制大量连续内容块} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div class="kbd">
                    {@html tomatoI18n.批量移动复制帮助}
                </div>
            </div>
        </details>
        <!-- 高级：单功能快捷键（老 12 命令兼容层，默认收起；行序沿用原 ConfLinks 出现顺序） -->
        <details class="settingBox">
            <summary class="section-title">{tomatoI18n.高级单功能快捷键}<span class="setting-count">12</span><!-- 计数与下方键帽行同步增删 --></summary>
            <div class="softBox">
                <div>{tomatoI18n.快捷键如有冲突请调整}</div>
                <div>
                    {LinkBoxbilink.langText()}
                    <HotkeyCap hk={LinkBoxbilink} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    {LinkBox链接到块底部.langText()}
                    <HotkeyCap hk={LinkBox链接到块底部} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    {LinkBox双向互链选择块.langText()}
                    <HotkeyCap hk={LinkBox双向互链选择块} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    {LinkBox双向互链创建往返链.langText()}
                    <HotkeyCap hk={LinkBox双向互链创建往返链} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    {LinkBox修复双向链接.langText()}
                    <HotkeyCap hk={LinkBox修复双向链接} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    {LinkBox删除双向链接.langText()}
                    <HotkeyCap hk={LinkBox删除双向链接} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div class:codeNotValid>
                    {LinkBox嵌入互链选择.langText()}
                    <HotkeyCap hk={LinkBox嵌入互链选择} pluginName="sy-tomato-plugin"></HotkeyCap><TomatoVIP {codeValid}
                    ></TomatoVIP>
                </div>
                <div class:codeNotValid>
                    {LinkBox嵌入互链创建.langText()}
                    <HotkeyCap hk={LinkBox嵌入互链创建} pluginName="sy-tomato-plugin"></HotkeyCap><TomatoVIP {codeValid}
                    ></TomatoVIP>
                </div>
                <div>
                    {LinkBox互相插入引用于下方选择.langText()}
                    <HotkeyCap hk={LinkBox互相插入引用于下方选择} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    {LinkBox互相插入引用于下方创建.langText()}
                    <HotkeyCap hk={LinkBox互相插入引用于下方创建} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    {LinkBox关联两个块选择.langText()}
                    <HotkeyCap hk={LinkBox关联两个块选择} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    {LinkBox关联两个块创建.langText()}
                    <HotkeyCap hk={LinkBox关联两个块创建} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
            </div>
        </details>
    {/if}
</div>
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
<!-- 多行选择（自 ConfEditor.svelte 迁入） -->
<div class="settingBox">
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$addSelectionBtnsMobile} />
        {tomatoI18n.移动端编辑器右上角添加多行选择按钮}
        <ConfHelpIcon token="Gh0udnFdGoiu8txrgE2c3SQenxf" />
    </div>
</div>
<div class="settingBox">
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$addSelectionBtnsDesktop} />
        {tomatoI18n.桌面端编辑器右上角添加多行选择按钮}
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

<style>
    /* □2 双栏右栏收窄暴露：折叠助手 6 个开关 label 整组换行（白名单换行点在 label 边界），
     * 防单个 label 的 switch 与文字被拆到两行（vision R1 P1-1；原全宽面板下不触发） */
    .tomato-fold-types label {
        white-space: nowrap;
    }
</style>
