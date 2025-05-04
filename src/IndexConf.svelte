<script lang="ts">
    import TomatoVIP from "./TomatoVIP.svelte";
    import { onDestroy, onMount } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
    import {
        aiBoxCheckbox,
        auto_card_priority,
        avoiding_cloud_synchronization_conflicts,
        backLinkBottomBoxCheckbox,
        back_link_concept_fold,
        back_link_copy,
        back_link_dailynote_off,
        back_link_default_off,
        back_link_embed,
        back_link_goto_bottom_btn,
        back_link_max_size,
        back_link_mention_count,
        back_link_move_here,
        back_link_move_to_dailynote,
        back_link_move_with_backlink,
        back_link_ref,
        back_link_remove_refs,
        back_link_refresh_off,
        back_link_show_floatUI,
        cardBoxCheckbox,
        cardPriorityBoxCheckbox,
        card_priority_slider_hide,
        card_priority_stopBtn_hide,
        cpBoxCheckbox,
        cssFlashThoughts,
        cssHomeEndIconLeft,
        cssRefAsTags,
        cssRefSquareBrackets,
        cssRefStyle,
        cssShowFlashCardBlank,
        cssShowHomeEndIcon,
        cssShowMemo,
        dailyNoteBoxCheckbox,
        dailyNoteCopy,
        dailyNoteCopyAnchorText,
        dailyNoteCopyComment,
        dailyNoteCopyFlashCard,
        dailyNoteCopyInsertPR,
        dailyNoteCopyShowPath,
        dailyNoteCopyUpdateBG,
        dailyNoteCopyUseRef,
        dailyNoteGoToBottom,
        dailyNoteMoveToBottom,
        dbBkBoxCheckbox,
        dbBkBoxHideDatetime,
        dbBkBoxMaxBacklinkSize,
        dont_break_list,
        fastNoteBoxAdd2Flashcard,
        fastNoteBoxCheckbox,
        fastNoteBoxDisableBK,
        flash_thoughts_2_top,
        flash_thoughts_target_file,
        imgBoxCheckbox,
        imgOverlayCheckbox,
        keepLazyLoadStore,
        linkBoxCheckbox,
        linkBoxLnkTitle,
        linkBoxUseLnkOrRef,
        listBoxCheckbox,
        mixBoxCheckbox,
        mixBoxPinyin,
        noteBoxAllKinds,
        noteBoxCheckbox,
        readingAdd2Card,
        readingPointBoxCheckbox,
        readingPointWithEnv,
        readingSaveFile,
        readingTopBar,
        showDocAttrs,
        storeCopyStdMD,
        storeFillMemoMenu,
        storeInsertXml,
        storeMergeDoc,
        storeMoveDocContentHere,
        storeOpenRefsClick,
        storeOpenRefsMenu,
        storeRefreshStaticBkLnk,
        tag2RefBoxCheckbox,
        tag_to_ref_add_card,
        tag_to_ref_add_pinyin,
        tomatoClockCheckbox,
        tomato_clocks,
        tomato_clocks_change_bg,
        tomato_clocks_change_bg_dark,
        tomato_clocks_force_notice,
        tomato_clocks_opacity,
        tomato_clocks_position_right,
        toolbarBoxCheckbox,
        toolbarEN2CHBtn,
        toolbarTidy,
        awaysExitFocusStore,
        graphBoxCheckbox,
        graphMaxPBlocks,
        graphMaxAllBlocks,
        fastNoteBoxDelAfterCreating,
        graphClick2Locate,
        dailyNoteCopySimple,
        cssNattyList,
        cssListBackgound,
        tomato_clocks_force_dialog,
        readingDialog,
        flashThoughtUseDialog,
        linkBoxSyncBlock,
        cardPriorityBoxAutoHide,
        linkBoxSyncHref,
        linkBoxSyncRef,
        linkBoxAttrIconOnHide,
        commentBoxCheckbox,
        commentBoxAddFlashCard,
        commentBoxAddUnderline,
        commentBoxShowID,
        back_link_show_path,
        mixBoxAddAlias,
        cozeSearchBoxCheckbox,
        cozeSearchSpaceID,
        cozeSearchKnowledgeID,
        cozeSearchOauthTokenID,
        cozeSearchAppID,
        storeNoteBox_fastnote,
        cozeSearchDoubaoID,
        userToken,
        cardBoxAddConcepts,
        cardBoxBuildSupCard,
    } from "./libs/stores";
    import { STORAGE_SETTINGS } from "./constants";
    import { tomatoI18n } from "./tomatoI18n";
    import NotebookSelect from "./NotebookSelect.svelte";
    import { cleanDataview, siyuan } from "./libs/utils";
    import { icon } from "./libs/bkUtils";
    import { expStore, resetKey, verifyKeyTomato } from "./libs/user";
    import { SPACE } from "./libs/gconst";
    import BuyTomato from "./BuyTomato.svelte";
    export let dm: DestroyManager;
    export let plugin: BaseTomatoPlugin;
    let buyDIV: HTMLElement;
    let codeValid = false;
    $: codeNotValid = !codeValid;
    onDestroy(() => {
        dm.destroyBy("2");
    });
    onMount(async () => {
        plugin.global.tomato_zZmqus5PtYRi.save = save;
        codeValid = await verifyKeyTomato();
    });
    async function active() {
        resetKey();
        codeValid = await verifyKeyTomato();
        await plugin.saveData(STORAGE_SETTINGS, plugin.settingCfg);
        if (codeValid) {
            window.location.reload();
        }
    }
    async function save() {
        dm.destroyBy();
        await plugin.saveData(STORAGE_SETTINGS, plugin.settingCfg);
        window.location.reload();
    }
    const ICONS_SIZE = 14;
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="settingBox fn_flex fn_flex-column">
    <div class="alert contentCenter">
        <span>
            {tomatoI18n.大部分功能不需要激活}
        </span>
    </div>
    <label>
        {tomatoI18n.激活码}
        <textarea
            class="b3-text-field settingBox activeCode"
            bind:value={$userToken}
            placeholder="1656000000123_22000101_ldID_siyuanTomatoCode_3044022018c8d8bca......"
            spellcheck="false"
        />
    </label>
    <button class="b3-button" on:click={active}>
        {tomatoI18n.激活}
    </button>
    <button
        class="b3-button settingBox"
        on:click={() => {
            if (buyDIV.style.display) buyDIV.style.display = "";
            else buyDIV.style.display = "none";
        }}
    >
        {tomatoI18n.购买}
    </button>
    <TomatoVIP {codeValid}></TomatoVIP>
    <span title={tomatoI18n.过期时间 + ": " + $expStore}>
        {$expStore.replaceAll(" ", "")}
    </span>
    <div bind:this={buyDIV} style="display: none;">
        <BuyTomato></BuyTomato>
    </div>
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$showDocAttrs}
        />
        {tomatoI18n.显示文档属性}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cssRefSquareBrackets}
        />
        {tomatoI18n.引用前后加上括号}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cssRefStyle}
        />
        {tomatoI18n.给引用加上效果}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label class:codeNotValid>
        {tomatoI18n.将指定的引用渲染为标签}
        <TomatoVIP {codeValid}></TomatoVIP><br />
        <textarea
            disabled={codeNotValid}
            class:codeNotValid
            class="b3-text-field settingBox"
            bind:value={$cssRefAsTags}
            placeholder="@,tag,label"
            spellcheck="false"
        />
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cssShowMemo}
        />
        {tomatoI18n.显示备注}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cssNattyList}
        />
        {tomatoI18n.极简无序列表样式}
    </label>
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cssListBackgound}
        />
        {tomatoI18n.给无序列表加上背景色}
    </label>
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cssShowFlashCardBlank}
        />
        {tomatoI18n.鼠标悬浮显示闪卡挖空的内容}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cssShowHomeEndIcon}
        />
        {tomatoI18n.永久显示文档右侧的HomeEnd图标}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cssHomeEndIconLeft}
        />
        {tomatoI18n.HomeEnd图标放到左边}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$keepLazyLoadStore}
        />
        {tomatoI18n.总是保持已经加载的内容}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$awaysExitFocusStore}
        />
        {tomatoI18n.总是退出聚焦}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$tomatoClockCheckbox}
        />
        {tomatoI18n.状态栏番茄钟}
    </label>
    {#if $tomatoClockCheckbox}
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$tomato_clocks_position_right}
            />
            {tomatoI18n.番茄钟在状态栏的右边}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$tomato_clocks_force_dialog}
            />
            {tomatoI18n.禁用强提醒}
        </label>
        <br />
        <label>
            <input
                class="b3-text-field settingBox"
                bind:value={$tomato_clocks}
            />
            {tomatoI18n.番茄钟时长多个间用逗号隔开}
        </label>
        <br />
        <label class:codeNotValid>
            <input
                disabled={codeNotValid}
                class:codeNotValid
                class="b3-text-field settingBox"
                bind:value={$tomato_clocks_force_notice}
            />
            {tomatoI18n.随机视频}
            <TomatoVIP {codeValid}></TomatoVIP>
        </label>
        <br />
        <label class:codeNotValid>
            <input
                disabled={codeNotValid}
                class:codeNotValid
                class="b3-text-field settingBox"
                bind:value={$tomato_clocks_change_bg}
            />
            {tomatoI18n.计时后修改背景明亮模式}
            <TomatoVIP {codeValid}></TomatoVIP>
        </label>
        <br />
        <label class:codeNotValid>
            <input
                disabled={codeNotValid}
                class:codeNotValid
                class="b3-text-field settingBox"
                bind:value={$tomato_clocks_change_bg_dark}
            />
            {tomatoI18n.计时后修改背景黑暗模式}
            <TomatoVIP {codeValid}></TomatoVIP>
        </label>
        <br />
        <label class:codeNotValid>
            <input
                disabled={codeNotValid}
                class:codeNotValid
                class="b3-text-field settingBox"
                bind:value={$tomato_clocks_opacity}
            />
            {tomatoI18n.背景图透明度}
            <TomatoVIP {codeValid}></TomatoVIP>
        </label>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$noteBoxCheckbox}
        />
        {tomatoI18n.拍照闪念收集图片闪念到}
    </label>
    {#if $noteBoxCheckbox}
        <br />
        <label>
            <textarea
                spellcheck="false"
                class="b3-text-field settingBox"
                bind:value={$noteBoxAllKinds}
            />
            {tomatoI18n.自定义图标}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$flashThoughtUseDialog}
            />
            {tomatoI18n.触发快捷键时弹出对话框}
        </label>
        <br />
        <label class:codeNotValid>
            <input
                disabled={codeNotValid}
                class:codeNotValid
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$avoiding_cloud_synchronization_conflicts}
            />
            {tomatoI18n.规避云端同步冲突}
            <TomatoVIP {codeValid}></TomatoVIP>
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$flash_thoughts_2_top}
            />
            {tomatoI18n.闪念插入到Dailynote顶端}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$cssFlashThoughts}
            />
            {tomatoI18n.显示闪念的时间与类型}
        </label>
        <br />
        <label>
            <input
                class="b3-text-field settingBox"
                bind:value={$flash_thoughts_target_file}
            />
            {tomatoI18n.闪念插入到文件}
        </label>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$commentBoxCheckbox}
        />
        {tomatoI18n.批注}
    </label>
    {#if $commentBoxCheckbox}
        <label>
            <br />
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$commentBoxAddFlashCard}
            />
            {tomatoI18n.加入闪卡 + SPACE}
        </label>
        <label>
            <br />
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$commentBoxAddUnderline}
            />
            {tomatoI18n.批注添加下划线}
        </label>
        <label>
            <br />
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$commentBoxShowID}
            />
            {tomatoI18n.显示ID}
        </label>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$graphBoxCheckbox}
        />
        {tomatoI18n.块关系图}
    </label>
    {#if $graphBoxCheckbox}
        <br />
        <label class:codeNotValid>
            <input
                disabled={codeNotValid}
                class:codeNotValid
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$graphClick2Locate}
            />
            {tomatoI18n.左键点击节点跳转到文档}<TomatoVIP {codeValid}
            ></TomatoVIP>
        </label>
        <br />
        <label>
            <input
                class="b3-text-field settingBox"
                bind:value={$graphMaxPBlocks}
            />
            {tomatoI18n.最大连续段落块数量}
        </label>
        <br />
        <label>
            <input
                class="b3-text-field settingBox"
                bind:value={$graphMaxAllBlocks}
            />
            {tomatoI18n.最大节点数量}
        </label>
        <br />
        {tomatoI18n.块关系图帮助}
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$backLinkBottomBoxCheckbox}
        />
        {tomatoI18n.底部反链}
    </label>
    {#if $backLinkBottomBoxCheckbox}
        <br />
        <label>
            <input
                type="number"
                min="0"
                class="b3-text-field settingBox"
                bind:value={$back_link_max_size}
            />
            {tomatoI18n.maxBkDocs最大展开的反链文件数}
        </label>
        <br />
        <label>
            <input
                type="number"
                min="0"
                class="b3-text-field settingBox"
                bind:value={$back_link_mention_count}
            />
            {tomatoI18n.mentionDocs最大展开的提及文件数}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_show_path}
            />
            {tomatoI18n.显示路径}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_move_here}
            />
            <span class="b3-label__text">
                {@html icon("Move", ICONS_SIZE)}</span
            >
            {tomatoI18n.移动到文档}
        </label>
        {#if $back_link_move_here}
            <br />
            <label>
                <input
                    type="checkbox"
                    class="b3-switch settingBox"
                    bind:checked={$back_link_move_with_backlink}
                />
                <span class="b3-label__text">
                    {@html icon("Move", ICONS_SIZE)}</span
                >
                {tomatoI18n.移动内容后添加指向原来位置的链接}
            </label>
        {/if}
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_move_to_dailynote}
            />
            <span class="b3-label__text">
                {@html icon("Calendar", ICONS_SIZE)}</span
            >
            {tomatoI18n.移动到Dailynote}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_remove_refs}
            />
            <span class="b3-label__text">
                {@html icon("Unpin", ICONS_SIZE)}</span
            >
            {tomatoI18n.把指向当前文档的引用删除}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_copy}
            />
            <span class="b3-label__text">
                {@html icon("Copy", ICONS_SIZE)}</span
            >
            {tomatoI18n.复制到文档}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_embed}
            />
            <span class="b3-label__text"> {@html icon("SQL", ICONS_SIZE)}</span>
            {tomatoI18n.嵌入到文档}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_ref}
            />
            <span class="b3-label__text"> {@html icon("Ref", ICONS_SIZE)}</span>
            {tomatoI18n.引用到文档}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_show_floatUI}
            />
            {tomatoI18n.在悬浮窗内显示底部反链}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_default_off}
            />
            {tomatoI18n.defaultBkDisabled底部反链默认关闭}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_dailynote_off}
            />
            {tomatoI18n.DisableDailyNote禁用底部反链}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_refresh_off}
            />
            {tomatoI18n.默认关闭自动刷新}
        </label>
        <br />
        <label class:codeNotValid>
            <input
                type="checkbox"
                disabled={codeNotValid}
                class:codeNotValid
                class="b3-switch settingBox"
                bind:checked={$back_link_goto_bottom_btn}
            />
            {tomatoI18n.在标题下添加跳转到底部的按钮}<TomatoVIP {codeValid}
            ></TomatoVIP>
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$back_link_concept_fold}
            />
            {tomatoI18n.默认折叠概念栏}
        </label>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$toolbarBoxCheckbox}
        />
        {tomatoI18n.开启toolbar按钮}
    </label>
    {#if $toolbarBoxCheckbox}
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$toolbarTidy}
            />
            {tomatoI18n.整理assets下的图片}
        </label>
        <br />
        <label class:codeNotValid>
            <input
                disabled={codeNotValid}
                class:codeNotValid
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$toolbarEN2CHBtn}
            />
            {tomatoI18n.显示语言切换按钮}
            <TomatoVIP {codeValid}></TomatoVIP>
        </label>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$readingPointBoxCheckbox}
        />
        {tomatoI18n.阅读点}
    </label>
    {#if $readingPointBoxCheckbox}
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$readingDialog}
            />
            {tomatoI18n.用对话框的形式打开阅读点}
        </label>
        <label hidden={$readingDialog}>
            <br />
            <input
                class="b3-text-field settingBox"
                bind:value={$readingSaveFile}
                placeholder="doc name"
            />
            {tomatoI18n.阅读点统一保存}
        </label>
        <br />
        <label class:codeNotValid>
            <input
                disabled={codeNotValid}
                class:codeNotValid
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$readingPointWithEnv}
            />
            {tomatoI18n.插入阅读点时记录当前所有打开的页签}
            <TomatoVIP {codeValid}></TomatoVIP>
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$readingTopBar}
            />
            {tomatoI18n.显示topbar}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$readingAdd2Card}
            />
            {tomatoI18n.阅读点加入闪卡}
        </label>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$imgBoxCheckbox}
        />
        {tomatoI18n.复制为图片}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cardBoxCheckbox}
        />
        {tomatoI18n.闪卡工具}
    </label>
    {#if $cardBoxCheckbox}
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$cardBoxBuildSupCard}
            />
            {tomatoI18n.用选中的行创建超级块超级块制卡取消制卡}
        </label>
        {#if $cardBoxBuildSupCard}
            <br />
            <label class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch settingBox"
                    bind:checked={$cardBoxAddConcepts}
                />
                {tomatoI18n.创建超级块时添加相关匹配到的引用}<TomatoVIP
                    {codeValid}
                ></TomatoVIP></label
            >
        {/if}
    {/if}
    <br />
    <label
        ><button
            class="b3-button settingBox"
            on:click={() => {
                siyuan.removeBrokenCards(tomatoI18n);
            }}
            >🗑️
        </button>{tomatoI18n.删除失效的闪卡}</label
    >
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cardPriorityBoxCheckbox}
        />
        {tomatoI18n.闪卡优先级}
    </label>
    {#if $cardPriorityBoxCheckbox}
        <br />
        <label class:codeNotValid>
            <input
                disabled={codeNotValid}
                class:codeNotValid
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$cardPriorityBoxAutoHide}
            />
            {tomatoI18n.自动隐藏}<TomatoVIP {codeValid}></TomatoVIP>
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$auto_card_priority}
            />
            {tomatoI18n.连续2次重来加优先级连续2次简单减优先级}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$card_priority_slider_hide}
            />
            {tomatoI18n.隐藏优先级滑动块}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$card_priority_stopBtn_hide}
            />
            {tomatoI18n.隐藏闪卡暂停按钮}
        </label>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cpBoxCheckbox}
        />
        {tomatoI18n.长内容工具}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$linkBoxSyncBlock}
            on:change={() => {
                if ($linkBoxSyncBlock) $linkBoxCheckbox = true;
            }}
        />
        {tomatoI18n.同步块}
    </label>
    <label hidden={!$linkBoxSyncBlock} class:codeNotValid>
        <br />
        <input
            disabled={codeNotValid}
            class:codeNotValid
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$linkBoxAttrIconOnHide}
        />
        {tomatoI18n.隐藏同步块右上角菜单}<TomatoVIP {codeValid}></TomatoVIP>
    </label>
    <label hidden={!$linkBoxSyncBlock} class:codeNotValid>
        <br />
        <input
            disabled={codeNotValid}
            class:codeNotValid
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$linkBoxSyncHref}
        />
        {tomatoI18n.添加到原始块的链接}<TomatoVIP {codeValid}></TomatoVIP>
    </label>
    <label hidden={!$linkBoxSyncBlock} class:codeNotValid>
        <br />
        <input
            disabled={codeNotValid}
            class:codeNotValid
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$linkBoxSyncRef}
        />
        {tomatoI18n.添加到原始块的引用}<TomatoVIP {codeValid}></TomatoVIP>
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$linkBoxCheckbox}
            on:change={() => {
                if (!$linkBoxCheckbox) $linkBoxSyncBlock = false;
            }}
        />
        {tomatoI18n.双向互链}
    </label>
    {#if $linkBoxCheckbox}
        <br />
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$linkBoxLnkTitle}
        />
        {tomatoI18n.给链接加文字}
        <br />
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$linkBoxUseLnkOrRef}
        />
        {tomatoI18n.使用链接否则用引用}
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$dailyNoteBoxCheckbox}
        />
        {tomatoI18n.移动内容到dailynote}
    </label>
    {#if $dailyNoteBoxCheckbox}
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$dailyNoteGoToBottom}
            />
            {tomatoI18n.打开DailyNote时总是跳到底部}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$dailyNoteMoveToBottom}
            />
            {tomatoI18n.移动到DailyNote时总是移动到底部}
        </label>
        <br />
        <div class="settingBox">
            <NotebookSelect></NotebookSelect>
        </div>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$dailyNoteCopySimple}
                on:change={() => {
                    if ($dailyNoteCopySimple) {
                        $dailyNoteCopy = false;
                    }
                }}
            />
            {tomatoI18n.简单复制到dailynote}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$dailyNoteCopy}
                on:change={() => {
                    if ($dailyNoteCopy) {
                        $dailyNoteCopySimple = false;
                    }
                }}
            />
            {tomatoI18n.复制到dailynote}
        </label>
        {#if $dailyNoteCopy}
            <br />
            <label>
                <input
                    class="b3-text-field settingBox"
                    bind:value={$dailyNoteCopyAnchorText}
                />
                {tomatoI18n.复制到dailynote使用的锚文本}
            </label>
            <br />
            <label>
                <input
                    type="checkbox"
                    class="b3-switch settingBox"
                    bind:checked={$dailyNoteCopyUseRef}
                />
                {tomatoI18n.使用引用来回溯}
            </label>
            <br />
            <label>
                <input
                    type="checkbox"
                    class="b3-switch settingBox"
                    bind:checked={$dailyNoteCopyInsertPR}
                />
                {tomatoI18n.在原文中同时插入阅读点}
            </label>
            <br />
            <label>
                <input
                    type="checkbox"
                    class="b3-switch settingBox"
                    bind:checked={$dailyNoteCopyUpdateBG}
                />
                {tomatoI18n.改变原文的背景}
            </label>
            <br />
            <label>
                <input
                    type="checkbox"
                    class="b3-switch settingBox"
                    bind:checked={$dailyNoteCopyShowPath}
                />
                {tomatoI18n.复制的内容显示原文的路径}
            </label>
            <br />
            <label>
                <input
                    type="checkbox"
                    class="b3-switch settingBox"
                    bind:checked={$dailyNoteCopyComment}
                />
                {tomatoI18n.添加批注}
            </label>
            <br />
            <label>
                <input
                    type="checkbox"
                    class="b3-switch settingBox"
                    bind:checked={$dailyNoteCopyFlashCard}
                />
                {tomatoI18n.加入闪卡}
            </label>
        {/if}
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$imgOverlayCheckbox}
        />
        {tomatoI18n.图片遮挡}
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$dbBkBoxCheckbox}
        />
        {tomatoI18n.数据库充当反链}
    </label>
    {#if $dbBkBoxCheckbox}
        <br />
        <label>
            <input
                type="number"
                min="1"
                class="b3-text-field settingBox"
                bind:value={$dbBkBoxMaxBacklinkSize}
            />
            {tomatoI18n.maxBkDocs最大展开的反链文件数}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$dbBkBoxHideDatetime}
            />
            {tomatoI18n.隐藏修改时间和创建时间}
        </label>
    {/if}
    <br />
    <label
        ><button class="b3-button settingBox" on:click={() => cleanDataview()}
            >🗑️
        </button>{tomatoI18n.删除失效的数据库}</label
    >
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$mixBoxCheckbox}
        />
        {tomatoI18n.杂项文字转引用F3}
    </label>
    {#if $mixBoxCheckbox}
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$storeFillMemoMenu}
            />
            {tomatoI18n.锁定内容}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$storeInsertXml}
            />
            {tomatoI18n.插入空的脑图流程图文件}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$storeRefreshStaticBkLnk}
            />
            {tomatoI18n.刷新静态反链}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$storeMoveDocContentHere}
            />
            {tomatoI18n.把文档内容移动到这里}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$storeMergeDoc}
            />
            {tomatoI18n.合并文档到这里}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$mixBoxPinyin}
            />
            {tomatoI18n.将选择文字与其拼音加入文档的别名}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$mixBoxAddAlias}
            />
            {tomatoI18n.将选择文字加入文档的别名}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$storeOpenRefsMenu}
            />
            {tomatoI18n.定位所有引用}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$storeOpenRefsClick}
            />
            {tomatoI18n.点击引用数打开所有引用}
        </label>
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$storeCopyStdMD}
            />
            {tomatoI18n.复制文档为标准Markdown}
        </label>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$tag2RefBoxCheckbox}
        />
        {tomatoI18n.文本转引用}
    </label>
    {#if $tag2RefBoxCheckbox}
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$tag_to_ref_add_card}
            />{tomatoI18n.添加引用时自动制卡}
        </label>
        <br />
        <label class:codeNotValid>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                disabled={codeNotValid}
                class:codeNotValid
                bind:checked={$tag_to_ref_add_pinyin}
            />{tomatoI18n.给文档添加简拼别名}
            <TomatoVIP {codeValid}></TomatoVIP>
        </label>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$listBoxCheckbox}
        />
        {tomatoI18n.列表工具}
    </label>
    {#if $listBoxCheckbox}
        <br />
        <label>
            <input
                type="checkbox"
                class="b3-switch settingBox"
                bind:checked={$dont_break_list}
            />
            {tomatoI18n.阻止连续回车断开列表}
        </label>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$aiBoxCheckbox}
        />
        {tomatoI18n.人工智能}Alt+Shift+S
    </label>
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$cozeSearchBoxCheckbox}
        />
        coze{tomatoI18n.知识库问答}Ctrl+Shift+S
    </label>
    {#if $cozeSearchBoxCheckbox}
        <br />
        <label>
            <input
                class="b3-text-field settingBox"
                bind:value={$cozeSearchOauthTokenID}
            />
            <a href="https://www.coze.cn/open/oauth/pats"
                >{tomatoI18n.添加令牌}</a
            >
        </label>
        <br />
        <label>
            <input
                class="b3-text-field settingBox"
                bind:value={$cozeSearchSpaceID}
            />
            <a href="https://www.coze.cn/space">{tomatoI18n.添加空间ID}</a>
        </label>
        <br />
        <label>
            <input
                class="b3-text-field settingBox"
                bind:value={$cozeSearchKnowledgeID}
            />
            <a href="https://www.coze.cn/space/{$cozeSearchSpaceID}/library"
                >{tomatoI18n.添加知识库ID}</a
            >
        </label>
        <br />
        <label>
            <input
                class="b3-text-field settingBox"
                bind:value={$cozeSearchAppID}
            />
            <a href="https://www.coze.cn/space/{$cozeSearchSpaceID}/develop"
                >{tomatoI18n.添加智能体ID}</a
            >
        </label>
        <br />
        <label>
            <input
                class="b3-text-field settingBox"
                bind:value={$cozeSearchDoubaoID}
            />
            (opt)doubao chat id
        </label>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <label>
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$fastNoteBoxCheckbox}
        />
        {tomatoI18n.快速笔记}
    </label>
    {#if $fastNoteBoxCheckbox}
        <br />
        <div class="settingBox">
            <NotebookSelect store={storeNoteBox_fastnote}></NotebookSelect>
        </div>
        <br />

        {@html tomatoI18n.快速笔记Doc}
        <br />
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$fastNoteBoxDisableBK}
        />
        {tomatoI18n.禁用底部反链}
        <br />
        <input
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$fastNoteBoxAdd2Flashcard}
        />
        {tomatoI18n.创建文件时制卡}
        <br />
        <input
            disabled={codeNotValid}
            class:codeNotValid
            type="checkbox"
            class="b3-switch settingBox"
            bind:checked={$fastNoteBoxDelAfterCreating}
        />
        {tomatoI18n.删除所选段落}
        <TomatoVIP {codeValid}></TomatoVIP>
    {/if}
    <!-- ----------------------------------- -->
    <hr />
    <button class="b3-button" on:click={save}>{tomatoI18n.保存}</button>
</div>

<style>
    .settingBox {
        margin: 10px;
    }
    textarea {
        width: 70%;
        line-height: 2;
    }
    .activeCode {
        width: 50%;
        line-height: 2;
    }
    .codeNotValid {
        pointer-events: none;
        opacity: 30%;
    }
    .contentCenter {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .alert {
        padding: 2px 4px;
        font:
            /* 75% Consolas, */ "Liberation Mono", Menlo, Courier,
            monospace, var(--b3-font-family);
        line-height: 1;
        color: var(--b3-theme-on-surface);
        vertical-align: middle;
        background-color: var(--b3-theme-surface);
        border: solid 1px var(--b3-theme-surface-lighter);
        border-radius: var(--b3-border-radius);
        box-shadow: inset 0 -1px 0 var(--b3-theme-surface-lighter);
    }
</style>
