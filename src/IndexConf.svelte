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
        commentBoxAddUnderline,
        commentBoxShowID,
        back_link_show_path,
        cozeSearchBoxCheckbox,
        cozeSearchSpaceID,
        cozeSearchKnowledgeID,
        cozeSearchOauthTokenID,
        cozeSearchAppID,
        storeNoteBox_fastnote,
        cozeSearchDoubaoID,
        userToken,
        cardBoxAddConcepts,
        cardBoxSpradEvenlyPostpone,
        aiBoxMenuShow,
        cozeSearchMenuShow,
        imgBoxShowMenu,
        cardPriorityBoxPostponeCardMenu,
        cardPriorityBoxSpradDelayMenu,
        cardPriorityBoxPriorityMenu,
        commentBoxMenu,
        dailyNoteGoToBottomMenu,
        dailyNoteCopyMenu,
        graphAddTopbarIcon,
        graph打开块关系图Menu,
        graph定位到图中的节点Menu,
        linkBoxBilinkMenu,
        bk启用禁用文档的底部反链menu,
        readingAddRPmenu,
        dbBkBoxRefreshMenu,
        readingAddJumpMenu,
        readingAddDeleteMenu,
        tag2RefSearchRef,
        tag2RefSearchLnk,
        toolbarspacerepeat,
        toolbarrefreshVr,
        toolbarlocatedoc,
        dailyNotetopbarleft,
        dailyNotetopbarright,
        cardBoxSuperCard,
        addSelectionBtnsDesktop,
        addSelectionBtnsMobile,
        mindWireCheckbox,
        mindWireDynamicLine,
        mindWireDocMenu,
        mindWireGlobalMenu,
        mindWireStarRefOnly,
        hideVIP,
        mindWireLine,
        mindWireColorfull,
        mindWireWidth,
        cssSuperBlockBorder,
        cardPrioritySetPriInterval,
        foldTypes,
        foldTypesSuperBlock,
        foldTypesNODE_LIST,
        foldTypesBLOCKQUOTE,
        foldTypesNODE_TABLE,
        foldTypesNODE_HEADING,
        tomato_clocks_audio,
        exportPath,
        exportIntervalSec,
        exportCleanFiles,
        markdownExportBoxCheckbox,
        exportWhiteList,
        exportBlackList,
        markdownExportPics,
        exportIntervalSecOn,
        exportCleanFilesOn,
        floatingballEnable,
        floatingballDocList,
        floatingballKeyboardList,
        floatingballDocMenu,
    } from "./libs/stores";
    import { STORAGE_SETTINGS } from "./constants";
    import { tomatoI18n } from "./tomatoI18n";
    import NotebookSelect from "./NotebookSelect.svelte";
    import {
        cleanDataview,
        getHpath,
        icon,
        removeFromArr,
        saveRestorePagePosition,
        siyuan,
    } from "./libs/utils";
    import {
        expStore,
        lastVerifyResult,
        resetKey,
        verifyKeyTomato,
    } from "./libs/user";
    import BuyTomato from "./BuyTomato.svelte";
    import { ImgBoxHotKey } from "./ImgBox";
    import { AIBoxHotkey } from "./AIBox";
    import { CozeSearchBoxHotkey } from "./CozeSearchBox";
    import {
        FastNoteBox创建快速笔记,
        FastNoteBox打开最后一个笔记,
        FastNoteBox草稿切换,
    } from "./FastNoteBox";
    import {
        CardBox取消当前文档内所有闪卡,
        CardBox清理所有失效的闪卡,
        CardBox用选中的行创建超级块超级块制卡取消制卡,
    } from "./CardBox";
    import {
        CardPriorityBox分散推迟闪卡,
        CardPriorityBox修改文档中闪卡优先级,
        CardPriorityBox推迟闪卡,
        CardPriority恢复所有暂停的闪卡,
    } from "./CardPriorityBox";
    import { CommentBoxTab批注, CommentBox添加批注到日记 } from "./CommentBox";
    import {
        CpBox批量删除大量连续内容块,
        CpBox批量复制大量连续内容块,
        CpBox批量移动大量连续内容块,
    } from "./CpBox";
    import {
        DailyNoteBox上一个日志,
        DailyNoteBox下一个日志,
        DailyNoteBox复制到dailynote,
        DailyNoteBox复制到dailynoteNewFile,
        DailyNoteBox移动内容到dailynote,
    } from "./DailyNoteBox";
    import { DbBkBox刷新数据库反链 } from "./DbBkBox";
    import { GraphBox定位到图中的节点, GraphBox打开块关系图 } from "./GraphBox";
    import {
        LinkBoxbilink,
        LinkBox互相插入引用于下方创建,
        LinkBox互相插入引用于下方选择,
        LinkBox修复双向链接,
        LinkBox关联两个块创建,
        LinkBox关联两个块选择,
        LinkBox双向互链创建往返链,
        LinkBox双向互链选择块,
        LinkBox同步块创建,
        LinkBox同步块选择,
        LinkBox嵌入互链创建,
        LinkBox嵌入互链选择,
        LinkBox查看所有同步位置,
        LinkBox链接到块底部,
    } from "./LinkBox";
    import {
        ListBox取消勾选当前文档所有已完成的todo任务,
        ListBox删除当前文档所有已完成的todo任务,
    } from "./ListBox";
    import { tomatoSettingsOpenHK } from ".";
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
    import { NoteBox拍照闪念全局 } from "./NoteBox";
    import { BK启用禁用文档的底部反链 } from "./BackLinkBottomBox";
    import {
        ReadingPointBox删除当前文档的阅读点,
        ReadingPointBox查看阅读点,
        ReadingPointBox设置阅读点,
        ReadingPointBox跳到当前文档的阅读点,
    } from "./ReadingPointBox";
    import { ScheduleCopyID } from "./Schedule";
    import {
        BlockNodeEnum,
        FloatingBallDocType_dialog,
        FloatingBallDocType_float,
        FloatingBallDocType_tab,
        FloatingBallNotVIPLimit,
        SPACE,
    } from "./libs/gconst";
    import {
        Tag2RefBox模糊查找引用Lnk,
        Tag2RefBox模糊查找引用Ref,
    } from "./Tag2RefBox";
    import {
        ToolBarBox刷新虚拟引用,
        ToolBarBox整理assets下的图片视频音频,
        ToolBarBox突出定位文档,
        ToolBarBox间隔重复,
    } from "./ToolbarBox";
    import { addFoldCmd折叠, addFoldCmd展开 } from "./fold";
    import { searchSettings } from "./libs/ui";
    import {
        MindWire启用或禁用思维导线,
        MindWire启用或禁用文档思维导线,
    } from "./MindWire";
    import {
        cleanExportedMds,
        exportMd2Dir,
        MarkdownExport全量导出,
        MarkdownExport增量导出,
        MarkdownExport确保导出符合配置,
    } from "./MarkdownExportBox";
    import { pushReplaceBy, pushUniq } from "stonev5-utils";
    import { events } from "./libs/Events";
    import { shortcut2string } from "./libs/keyboard";
    import { FloatingBall添加文档, linkDoc2floatBall } from "./FloatingBall";
    export let dm: DestroyManager;
    export let plugin: BaseTomatoPlugin;
    let addDocSettings: HTMLElement;
    let addShortcutSettings: HTMLElement;
    let buyDIV: HTMLElement;
    let settingsDiv: HTMLElement;
    let searchInput: HTMLElement;
    let addDoc_docName = "";
    let addDoc_docIcon = "";
    let addDoc_keyboardIcon = "";
    let addDoc_keyboardpreview = "";
    let addDoc_keyboardKeyCode = "";
    let addDoc_keyboardAlt = false;
    let addDoc_keyboardShift = false;
    let addDoc_keyboardCtrl = false;
    let addDoc_useDialog = FloatingBallDocType_float.id;
    let codeValid = false;
    $: codeNotValid = !codeValid;
    const ICONS_SIZE = 14;
    let searchKey = "";
    const SearchKeyItemKey =
        "tomato_settings_SearchKeyItemKey_RfrUm9VLS4GehTzg5ygRrNT";
    onDestroy(() => {
        dm.destroyBy("2");
        localStorage.setItem(SearchKeyItemKey, searchKey);
    });

    onMount(async () => {
        plugin.global.tomato_zZmqus5PtYRi.save = save;
        codeValid = await verifyKeyTomato();
        saveRestorePagePosition(
            "tomato_settings_scrollPosition_YELnPikKNirXyQqzIHNB",
            dm,
            settingsDiv?.parentElement?.parentElement,
            false,
        );
        if (localStorage.getItem(SearchKeyItemKey)) {
            searchKey = localStorage.getItem(SearchKeyItemKey);
            searchSettings(settingsDiv, searchKey);
        }
        searchInput.focus();
        addDocSettings.style.display = "none";
        addShortcutSettings.style.display = "none";
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

    function toggleDiv(div: HTMLElement) {
        if (div.style.display === "none" || div.style.display === "") {
            div.style.display = "block";
        } else {
            div.style.display = "none";
        }
    }

    function showName(name: string, icon: string, docType?: number) {
        let docTypeStr = "";
        switch (docType) {
            case FloatingBallDocType_tab.id:
                docTypeStr = FloatingBallDocType_tab.txt;
                break;
            case FloatingBallDocType_dialog.id:
                docTypeStr = FloatingBallDocType_dialog.txt;
                break;
            case FloatingBallDocType_float.id:
                docTypeStr = FloatingBallDocType_float.txt;
                break;
            default:
        }
        if (docTypeStr) {
            docTypeStr = `(${docTypeStr})`;
        }

        if (name.toLocaleLowerCase() == icon.toLocaleLowerCase()) {
            return name + docTypeStr;
        }
        return `${name}(${icon})${docTypeStr}`;
    }

    function flatingkbchange() {
        addDoc_keyboardpreview = shortcut2string({
            key: addDoc_keyboardKeyCode,
            altKey: addDoc_keyboardAlt,
            ctrlKey: addDoc_keyboardCtrl,
            shiftKey: addDoc_keyboardShift,
        });
    }
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="fn_flex fn_flex-column" bind:this={settingsDiv}>
    {#if codeNotValid || !$hideVIP}
        <div class="alert contentCenter" data-hide>
            <span>
                {tomatoI18n.大部分功能不需要激活}
            </span>
        </div>
        <!-- 激活码 -->
        <div class="settingBox" data-hide>
            <div>
                {tomatoI18n.激活码}
                <textarea
                    class="b3-text-field activeCode"
                    bind:value={$userToken}
                    placeholder="1656000000123_22000101_ldID_siyuanTomatoCode_3044022018c8d8bca......"
                    spellcheck="false"
                />
                <button class="b3-button b3-button--outline" on:click={active}>
                    {tomatoI18n.激活}
                </button>
                <button
                    class="b3-button b3-button--outline"
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
            </div>
        </div>
    {/if}
    <!-- search -->
    <div class="settingBox search-bar" data-search>
        <input
            bind:this={searchInput}
            class="b3-text-field"
            bind:value={searchKey}
            on:input={() => searchSettings(settingsDiv, searchKey)}
        />
        {tomatoI18n.search搜索配置}
    </div>
    <!-- 快捷键 -->
    <div class="settingBox">
        <div>{tomatoI18n.快捷键如有冲突请调整}</div>
        <div>
            {tomatoSettingsOpenHK.langText()}<strong
                >{tomatoSettingsOpenHK.w()}</strong
            >
        </div>
        <div>
            {ScheduleCopyID.langText() + SPACE}<strong
                >{ScheduleCopyID.w()}</strong
            >
        </div>
        <div>
            {addFoldCmd折叠.langText()}<strong>{addFoldCmd折叠.w()}</strong>
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/XyFPdPBbsol477xl5TFcX9Ttn2e?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        <div>
            {addFoldCmd展开.langText()}<strong>{addFoldCmd展开.w()}</strong>
        </div>
        <div class:codeNotValid>
            <input
                type="checkbox"
                disabled={codeNotValid}
                class:codeNotValid
                class="b3-switch"
                bind:checked={$hideVIP}
            />
            {tomatoI18n.隐藏vip图标}<TomatoVIP {codeValid}></TomatoVIP>
        </div>
    </div>
    <!-- 文档树工具 -->
    <div class="settingBox">
        <div>
            {tomatoI18n.文档树工具}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/NXSPd81W4oxUJrxW2XsctewUn5g?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
    </div>
    <!-- 多行选择 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$addSelectionBtnsMobile}
            />
            {tomatoI18n.移动端编辑器右上角添加多行选择按钮}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/Gh0udnFdGoiu8txrgE2c3SQenxf?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
    </div>
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$addSelectionBtnsDesktop}
            />
            {tomatoI18n.桌面端编辑器右上角添加多行选择按钮}
        </div>
    </div>
    <!-- 引用前后加上括号 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cssRefSquareBrackets}
            />
            {tomatoI18n.引用前后加上括号}
        </div>
    </div>
    <!-- 给引用加上效果 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cssRefStyle}
            />
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
            />
        </div>
    </div>
    <!-- 显示备注 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cssShowMemo}
            />
            {tomatoI18n.显示备注}
        </div>
    </div>
    <!-- 给所有超级块加上边框 -->
    <div class="settingBox">
        <input
            type="checkbox"
            class="b3-switch"
            bind:checked={$cssSuperBlockBorder}
        />
        {tomatoI18n.给所有超级块加上边框}
    </div>
    <!-- 极简无序列表样式 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cssNattyList}
            />
            {tomatoI18n.极简无序列表样式}
        </div>
    </div>
    <!-- 给无序列表加上背景色 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cssListBackgound}
            />
            {tomatoI18n.给无序列表加上背景色}
        </div>
    </div>
    <!-- 鼠标悬浮显示闪卡挖空的内容 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cssShowFlashCardBlank}
            />
            {tomatoI18n.鼠标悬浮显示闪卡挖空的内容}
        </div>
    </div>
    <!-- 永久显示文档右侧的HomeEnd图标 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cssShowHomeEndIcon}
            />
            {tomatoI18n.永久显示文档右侧的HomeEnd图标}
        </div>
    </div>
    <!-- HomeEnd图标放到左边 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cssHomeEndIconLeft}
            />
            {tomatoI18n.HomeEnd图标放到左边}
        </div>
    </div>
    <!-- 总是保持已经加载的内容 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$keepLazyLoadStore}
            />
            {tomatoI18n.总是保持已经加载的内容}
        </div>
    </div>
    <!-- 总是退出聚焦 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$awaysExitFocusStore}
            />
            {tomatoI18n.总是退出聚焦}
        </div>
    </div>
    <!-- 折叠助手 -->
    <div class="settingBox">
        <div>
            {tomatoI18n.块折叠助手}： {tomatoI18n.在块的右上角显示折叠图标}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/RqDsdlLkwolnUgxyEmVcDuv8nwd?from=from_copylink"
                >
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
                    on:change={() => {
                        if ($foldTypesSuperBlock) {
                            pushUniq(
                                $foldTypes,
                                BlockNodeEnum.NODE_SUPER_BLOCK,
                            );
                        } else {
                            removeFromArr(
                                $foldTypes,
                                BlockNodeEnum.NODE_SUPER_BLOCK,
                            );
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
                    on:change={() => {
                        if ($foldTypesBLOCKQUOTE) {
                            pushUniq($foldTypes, BlockNodeEnum.NODE_BLOCKQUOTE);
                        } else {
                            removeFromArr(
                                $foldTypes,
                                BlockNodeEnum.NODE_BLOCKQUOTE,
                            );
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
                    on:change={() => {
                        if ($foldTypesNODE_LIST) {
                            pushUniq($foldTypes, BlockNodeEnum.NODE_LIST);
                        } else {
                            removeFromArr($foldTypes, BlockNodeEnum.NODE_LIST);
                        }
                    }}
                />
                {tomatoI18n.列表块}
            </label>
            <!-- 表格 -->
            <label class="space">
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$foldTypesNODE_TABLE}
                    on:change={() => {
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
                    on:change={() => {
                        if ($foldTypesNODE_HEADING) {
                            pushUniq($foldTypes, BlockNodeEnum.NODE_HEADING);
                        } else {
                            removeFromArr(
                                $foldTypes,
                                BlockNodeEnum.NODE_HEADING,
                            );
                        }
                    }}
                />
                {tomatoI18n.标题}
            </label>
        </div>
    </div>
    <!-- 悬浮球 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$floatingballEnable}
            />
            {tomatoI18n.悬浮球}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/IFT9drxvSoYKVmxCcqncFOgknXg?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $floatingballEnable}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$floatingballDocMenu}
                />
                {tomatoI18n.menu添加右键菜单}: {FloatingBall添加文档.langText()}
                <strong>{FloatingBall添加文档.w()}</strong>
            </div>
            <!-- 列出文档绑定 -->
            <div>
                {#if $floatingballDocList.length > FloatingBallNotVIPLimit && !lastVerifyResult()}
                    ⚠️{tomatoI18n.非VIP上限为x个(FloatingBallNotVIPLimit, "📄")}
                {/if}
            </div>
            {#each $floatingballDocList as item, index}
                <div>
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={item.enable}
                        />{tomatoI18n.桌面端}
                    </label>
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={item.enableMobile}
                        />{tomatoI18n.移动端}
                    </label>
                    <button
                        class="b3-button b3-button--text space"
                        on:click={() => {
                            $floatingballDocList.splice(index, 1);
                            $floatingballDocList = $floatingballDocList;
                        }}
                    >
                        🗑️
                    </button>
                    <span class="text space"
                        >📄{showName(
                            item.docName,
                            item.docIcon,
                            item.openDocType,
                        )}
                    </span>
                </div>
            {/each}
            <!-- 列出快捷键绑定 -->
            <div>
                {#if $floatingballKeyboardList.length > FloatingBallNotVIPLimit && !lastVerifyResult()}
                    ⚠️{tomatoI18n.非VIP上限为x个(FloatingBallNotVIPLimit, "⌨️")}
                {/if}
            </div>
            {#each $floatingballKeyboardList as item, index}
                <div>
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={item.enable}
                        />{tomatoI18n.桌面端}
                    </label>
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={item.enableMobile}
                        />{tomatoI18n.移动端}
                    </label>
                    <button
                        class="b3-button b3-button--text space"
                        on:click={() => {
                            $floatingballKeyboardList.splice(index, 1);
                            $floatingballKeyboardList =
                                $floatingballKeyboardList;
                        }}
                    >
                        🗑️
                    </button>
                    <span class="text space"
                        >⌨️{showName(shortcut2string(item), item.keyIcon)}
                    </span>
                </div>
            {/each}
            <!-- 添加按钮 -->
            <div>
                <button
                    class="b3-button b3-button--outline space"
                    on:click={() => {
                        toggleDiv(addDocSettings);
                    }}
                    >➕{tomatoI18n.文档}
                </button>
                <button
                    class="b3-button b3-button--outline space"
                    on:click={() => {
                        toggleDiv(addShortcutSettings);
                    }}
                    >➕{tomatoI18n.快捷键}
                </button>
            </div>
            <!-- 绑定文档配置 -->
            <div bind:this={addDocSettings}>
                <div class="spacetop">
                    <input
                        placeholder={addDoc_docName}
                        class="b3-text-field space"
                        bind:value={addDoc_docIcon}
                    />{tomatoI18n.图标}
                </div>
                <div class="spacetop">
                    <input
                        class="b3-text-field space"
                        bind:value={addDoc_docName}
                    />{tomatoI18n.文档名}
                </div>
                <div class="spacetop">
                    <label class="space">
                        <input
                            type="radio"
                            name="addDoc_openType"
                            value={FloatingBallDocType_tab.id}
                            bind:group={addDoc_useDialog}
                        />
                        {FloatingBallDocType_tab.txt}
                    </label>
                    <label class="space">
                        <input
                            type="radio"
                            name="addDoc_openType"
                            value={FloatingBallDocType_dialog.id}
                            bind:group={addDoc_useDialog}
                        />
                        {FloatingBallDocType_dialog.txt}
                    </label>
                    <label class="space">
                        <input
                            type="radio"
                            name="addDoc_openType"
                            value={FloatingBallDocType_float.id}
                            bind:group={addDoc_useDialog}
                        />
                        {FloatingBallDocType_float.txt}
                    </label>
                </div>
                <button
                    class="b3-button b3-button--outline spacetop"
                    on:click={() => {
                        linkDoc2floatBall(
                            addDoc_docName,
                            addDoc_docIcon,
                            addDoc_useDialog,
                        );
                        $floatingballDocList = $floatingballDocList;
                    }}
                    >{tomatoI18n.绑定文档到悬浮按钮}
                </button>
                <button
                    class="b3-button b3-button--outline spacetop"
                    on:click={() => {
                        addDoc_docName = "$$dailynote";
                        addDoc_docIcon = "🗓️📒";
                    }}
                    >{tomatoI18n.特殊绑定当天日志}
                </button>
            </div>
            <!-- 绑定快捷键配置 -->
            <div bind:this={addShortcutSettings}>
                <div class="spacetop">
                    <input
                        placeholder={addDoc_keyboardpreview}
                        class="b3-text-field space"
                        bind:value={addDoc_keyboardIcon}
                    />{tomatoI18n.图标}
                </div>
                <div class="spacetop">
                    <input
                        class="b3-text-field space"
                        bind:value={addDoc_keyboardKeyCode}
                        on:input={flatingkbchange}
                    />{tomatoI18n.键}
                </div>
                <div class="spacetop">
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={addDoc_keyboardAlt}
                            on:change={flatingkbchange}
                        />alt
                    </label>
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={addDoc_keyboardShift}
                            on:change={flatingkbchange}
                        />shift
                    </label>
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={addDoc_keyboardCtrl}
                            on:change={flatingkbchange}
                        />{events.isMac ? "cmd" : "ctrl"}
                    </label>
                </div>
                <button
                    class="b3-button b3-button--outline spacetop"
                    on:click={() => {
                        if (addDoc_keyboardKeyCode) {
                            let icon = addDoc_keyboardIcon;
                            if (!icon) {
                                icon = addDoc_keyboardpreview;
                            }
                            addDoc_keyboardKeyCode =
                                addDoc_keyboardKeyCode.toLocaleUpperCase();
                            $floatingballKeyboardList = pushReplaceBy(
                                $floatingballKeyboardList,
                                {
                                    enableMobile: true,
                                    enable: true,
                                    keyIcon: icon,
                                    key: addDoc_keyboardKeyCode,
                                    altKey: addDoc_keyboardAlt,
                                    shiftKey: addDoc_keyboardShift,
                                    ctrlKey: addDoc_keyboardCtrl,
                                },
                                (item) =>
                                    `${item.key}#${item.altKey}#${item.ctrlKey}#${item.shiftKey}`,
                            );
                            floatingballKeyboardList.write();
                        }
                    }}
                    >{tomatoI18n.绑定快捷键到悬浮按钮 + addDoc_keyboardpreview}
                </button>
            </div>
        {/if}
    </div>
    <!-- 导出工作空间 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$markdownExportBoxCheckbox}
            />
            {tomatoI18n.导出工作空间}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/UmNxds5JLo4m1qxc7j3cOvh4ncc?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $markdownExportBoxCheckbox}
            <div>
                {#if $exportWhiteList.length === 0}
                    <div>
                        <strong
                            >⚠️{tomatoI18n.白名单为空请先在文档树中右键添加文档}⚠️</strong
                        >
                    </div>
                {:else}
                    {#each $exportWhiteList as item, index}
                        <div>
                            <button
                                class="b3-button b3-button--text space"
                                on:click={() => {
                                    $exportWhiteList.splice(index, 1);
                                    $exportWhiteList = $exportWhiteList;
                                }}
                            >
                                🗑️
                            </button>
                            {#await getHpath(item)}
                                <span class="text">{item} ✅</span>
                            {:then v}
                                <span class="text">{v} ✅</span>
                            {/await}
                        </div>
                    {/each}
                {/if}
            </div>
            <div>
                {#if $exportBlackList.length === 0}
                    <div>
                        {tomatoI18n.黑名单为空可在文档树中右键添加}
                    </div>
                {:else}
                    {#each $exportBlackList as item, index}
                        <div>
                            <button
                                class="b3-button b3-button--text space"
                                on:click={() => {
                                    $exportBlackList.splice(index, 1);
                                    $exportBlackList = $exportBlackList;
                                }}
                            >
                                🗑️
                            </button>
                            {#await getHpath(item)}
                                <span class="text">{item} 🚫</span>
                            {:then v}
                                <span class="text">{v} 🚫</span>
                            {/await}
                        </div>
                    {/each}
                {/if}
            </div>
            <div>
                <input class="b3-text-field space" bind:value={$exportPath} />
                {tomatoI18n.导出工作空间到此文件夹}
            </div>
            <div class:codeNotValid>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$exportIntervalSecOn}
                />
                {#if $exportIntervalSecOn}
                    <input
                        title={tomatoI18n.可以填写小数}
                        class="b3-text-field space"
                        bind:value={$exportIntervalSec}
                    />
                    {tomatoI18n.每x秒执行一次增量导出($exportIntervalSec)}
                {:else}
                    {tomatoI18n.每x秒执行一次增量导出("0")}
                {/if}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div class:codeNotValid>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$exportCleanFilesOn}
                />
                {#if $exportCleanFilesOn}
                    <input
                        title={tomatoI18n.可以填写小数}
                        class="b3-text-field space"
                        bind:value={$exportCleanFiles}
                    />
                    {tomatoI18n.每x分钟确保导出符合配置($exportCleanFiles)}
                {:else}
                    {tomatoI18n.每x分钟确保导出符合配置("0")}
                {/if}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div>
                <label class="space">
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$markdownExportPics}
                    />{tomatoI18n.导出图片}
                </label>
                <button
                    class="b3-button b3-button--outline space"
                    on:click={() => exportMd2Dir(true)}
                    >{MarkdownExport全量导出.langText() +
                        MarkdownExport全量导出.w()}
                </button>
                <button
                    class="b3-button b3-button--outline space"
                    on:click={() => exportMd2Dir()}
                    >{MarkdownExport增量导出.langText() +
                        MarkdownExport增量导出.w()}
                </button>
                <button
                    class="b3-button b3-button--outline space"
                    on:click={() => cleanExportedMds()}
                    >{MarkdownExport确保导出符合配置.langText() +
                        MarkdownExport确保导出符合配置.w()}
                </button>
            </div>
        {/if}
    </div>
    <!-- 状态栏番茄钟 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$tomatoClockCheckbox}
            />
            {tomatoI18n.状态栏番茄钟}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/KmCRdj1s7okXZOxkwsTcbPFXnNh?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $tomatoClockCheckbox}
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$tomato_clocks_position_right}
                />
                {tomatoI18n.番茄钟在状态栏的右边}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$tomato_clocks_force_dialog}
                />
                {tomatoI18n.禁用强提醒}
            </div>

            <div>
                <input class="b3-text-field" bind:value={$tomato_clocks} />
                {tomatoI18n.番茄钟时长多个间用逗号隔开}
            </div>

            <div>
                <input
                    class="b3-text-field"
                    bind:value={$tomato_clocks_audio}
                />
                {tomatoI18n.时间到播放声音}
            </div>

            <div>
                <input
                    class="b3-text-field"
                    bind:value={$tomato_clocks_force_notice}
                />
                {tomatoI18n.随机视频}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    class="b3-text-field"
                    bind:value={$tomato_clocks_change_bg}
                />
                {tomatoI18n.计时后修改背景明亮模式}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    class="b3-text-field"
                    bind:value={$tomato_clocks_change_bg_dark}
                />
                {tomatoI18n.计时后修改背景黑暗模式}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    class="b3-text-field"
                    bind:value={$tomato_clocks_opacity}
                />
                {tomatoI18n.背景图透明度}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>
        {/if}
    </div>
    <!-- 拍照闪念 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$noteBoxCheckbox}
            />
            {tomatoI18n.拍照闪念收集图片闪念到}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/N3LkdvKGhowkTUx1r6OcxCjInec?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $noteBoxCheckbox}
            <div>
                {NoteBox拍照闪念全局.langText()}<strong
                    >{NoteBox拍照闪念全局.w()}</strong
                >
            </div>
            <div>
                <textarea
                    spellcheck="false"
                    class="b3-text-field"
                    bind:value={$noteBoxAllKinds}
                />
                {tomatoI18n.自定义图标}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$flashThoughtUseDialog}
                />
                {tomatoI18n.触发快捷键时弹出对话框}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$avoiding_cloud_synchronization_conflicts}
                />
                {tomatoI18n.规避云端同步冲突}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$flash_thoughts_2_top}
                />
                {tomatoI18n.闪念插入到Dailynote顶端}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cssFlashThoughts}
                />
                {tomatoI18n.显示闪念的时间与类型}
            </div>

            <div>
                <input
                    class="b3-text-field"
                    bind:value={$flash_thoughts_target_file}
                />
                {tomatoI18n.闪念插入到文件}
            </div>
        {/if}
    </div>
    <!-- 批注 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$commentBoxCheckbox}
            />
            {tomatoI18n.批注}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/Svq2dIQpaob0kKx0l38ciftRnXl?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $commentBoxCheckbox}
            <div>
                {tomatoI18n.打开批注页签}
                <strong>{CommentBoxTab批注.w()}</strong>
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$commentBoxMenu}
                />
                {tomatoI18n.menu添加右键菜单}
                <strong>{CommentBox添加批注到日记.w()}</strong>
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$commentBoxAddUnderline}
                />
                {tomatoI18n.批注添加下划线}
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$commentBoxShowID}
                />
                {tomatoI18n.显示ID}
            </div>
        {/if}
    </div>
    <!-- 思维导线 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$mindWireCheckbox}
            />
            {tomatoI18n.思维导线}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/QNArdYNuuoH34qxGHdCcHmE6nic?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $mindWireCheckbox}
            <div>
                {tomatoI18n.思维导线帮助}
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$mindWireGlobalMenu}
                />
                {tomatoI18n.menu添加右键菜单}:
                {MindWire启用或禁用思维导线.langText()}
                <strong>{MindWire启用或禁用思维导线.w()}</strong>
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$mindWireDocMenu}
                />
                {tomatoI18n.menu添加右键菜单}:
                {MindWire启用或禁用文档思维导线.langText()}
                <strong>{MindWire启用或禁用文档思维导线.w()}</strong>
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$mindWireStarRefOnly}
                />
                {tomatoI18n.只关联星号引用}
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$mindWireLine}
                />
                {tomatoI18n.使用实线}<TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$mindWireColorfull}
                />
                {tomatoI18n.使用多种颜色}<TomatoVIP {codeValid}></TomatoVIP>
            </div>
            {#if !($mindWireLine && lastVerifyResult())}
                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$mindWireDynamicLine}
                    />
                    {tomatoI18n.流动线条效果}
                </div>
            {/if}
            <div>
                <input
                    class="b3-text-field"
                    type="number"
                    min="0.1"
                    bind:value={$mindWireWidth}
                />
                {tomatoI18n.线条宽度}
            </div>
        {/if}
    </div>
    <!-- 块关系图 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$graphBoxCheckbox}
            />
            {tomatoI18n.块关系图}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/UIRudM9EQoyri2x4okkcjbGZnug?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $graphBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$graph定位到图中的节点Menu}
                />
                {tomatoI18n.menu添加右键菜单}: {GraphBox定位到图中的节点.langText()}
                <strong>{GraphBox定位到图中的节点.w()}</strong>
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$graph打开块关系图Menu}
                />
                {tomatoI18n.menu添加右键菜单}: {GraphBox打开块关系图.langText()}
                <strong>{GraphBox打开块关系图.w()}</strong>
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$graphAddTopbarIcon}
                />
                {tomatoI18n.添加顶栏图标}
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$graphClick2Locate}
                />
                {tomatoI18n.左键点击节点跳转到文档}<TomatoVIP {codeValid}
                ></TomatoVIP>
            </div>

            <div>
                <input class="b3-text-field" bind:value={$graphMaxPBlocks} />
                {tomatoI18n.最大连续段落块数量}
            </div>

            <div>
                <input class="b3-text-field" bind:value={$graphMaxAllBlocks} />
                {tomatoI18n.最大节点数量}
            </div>
            <div>
                {tomatoI18n.块关系图帮助}
            </div>
        {/if}
    </div>
    <!-- 底部反链 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$backLinkBottomBoxCheckbox}
            />
            {tomatoI18n.底部反链}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/SVELdPHKYoGMj1xkmF3cIPg3nZd?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $backLinkBottomBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$bk启用禁用文档的底部反链menu}
                />
                {tomatoI18n.menu添加右键菜单}:
                {BK启用禁用文档的底部反链.langText()}<strong
                    >{BK启用禁用文档的底部反链.w()}</strong
                >
            </div>
            <div>
                <input
                    type="number"
                    min="0"
                    class="b3-text-field"
                    bind:value={$back_link_max_size}
                />
                {tomatoI18n.maxBkDocs最大展开的反链文件数}
            </div>

            <div>
                <input
                    type="number"
                    min="0"
                    class="b3-text-field"
                    bind:value={$back_link_mention_count}
                />
                {tomatoI18n.mentionDocs最大展开的提及文件数}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$back_link_show_path}
                />
                {tomatoI18n.显示路径}
            </div>

            <div class="softBox">
                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$back_link_move_here}
                    />
                    <span class="b3-label__text">
                        {@html icon("Move", ICONS_SIZE)}</span
                    >
                    {tomatoI18n.移动到文档}
                </div>
                {#if $back_link_move_here}
                    <div>
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={$back_link_move_with_backlink}
                        />
                        <span class="b3-label__text">
                            {@html icon("Move", ICONS_SIZE)}</span
                        >
                        {tomatoI18n.移动内容后添加指向原来位置的链接}
                    </div>
                {/if}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$back_link_move_to_dailynote}
                />
                <span class="b3-label__text">
                    {@html icon("Calendar", ICONS_SIZE)}</span
                >
                {tomatoI18n.移动到Dailynote}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$back_link_remove_refs}
                />
                <span class="b3-label__text">
                    {@html icon("Unpin", ICONS_SIZE)}</span
                >
                {tomatoI18n.把指向当前文档的引用删除}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$back_link_copy}
                />
                <span class="b3-label__text">
                    {@html icon("Copy", ICONS_SIZE)}</span
                >
                {tomatoI18n.复制到文档}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$back_link_embed}
                />
                <span class="b3-label__text">
                    {@html icon("SQL", ICONS_SIZE)}</span
                >
                {tomatoI18n.嵌入到文档}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$back_link_ref}
                />
                <span class="b3-label__text">
                    {@html icon("Ref", ICONS_SIZE)}</span
                >
                {tomatoI18n.引用到文档}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$back_link_show_floatUI}
                />
                {tomatoI18n.在悬浮窗内显示底部反链}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$back_link_default_off}
                />
                {tomatoI18n.defaultBkDisabled底部反链默认关闭}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$back_link_dailynote_off}
                />
                {tomatoI18n.DisableDailyNote禁用底部反链}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$back_link_refresh_off}
                />
                {tomatoI18n.默认关闭自动刷新}
            </div>

            <div class:codeNotValid>
                <input
                    type="checkbox"
                    disabled={codeNotValid}
                    class:codeNotValid
                    class="b3-switch"
                    bind:checked={$back_link_goto_bottom_btn}
                />
                {tomatoI18n.在标题下添加跳转到底部的按钮}<TomatoVIP {codeValid}
                ></TomatoVIP>
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$back_link_concept_fold}
                />
                {tomatoI18n.默认折叠概念栏}
            </div>
        {/if}
    </div>
    <!-- toolbar按钮 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$toolbarBoxCheckbox}
            />
            {tomatoI18n.开启toolbar按钮}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/NDgJd64mmo7c0Wxj42RcNv2Tnaf?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $toolbarBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$toolbarspacerepeat}
                />
                {tomatoI18n.topbar添加图标}：
                {ToolBarBox间隔重复.langText()}<strong
                    >{ToolBarBox间隔重复.w()}</strong
                >
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$toolbarrefreshVr}
                />
                {tomatoI18n.topbar添加图标}：
                {ToolBarBox刷新虚拟引用.langText()}<strong
                    >{ToolBarBox刷新虚拟引用.w()}</strong
                >
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$toolbarlocatedoc}
                />
                {tomatoI18n.topbar添加图标}：
                {ToolBarBox突出定位文档.langText()}<strong
                    >{ToolBarBox突出定位文档.w()}</strong
                >
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$toolbarTidy}
                />
                {tomatoI18n.topbar添加图标}：
                {ToolBarBox整理assets下的图片视频音频.langText()}<strong
                    >{ToolBarBox整理assets下的图片视频音频.w()}</strong
                >
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$toolbarEN2CHBtn}
                />
                {tomatoI18n.显示语言切换按钮}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>
        {/if}
    </div>
    <!-- 阅读点 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$readingPointBoxCheckbox}
            />
            {tomatoI18n.阅读点}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/KQOWdXzT8o05LlxPfJCcBHNEnYc?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $readingPointBoxCheckbox}
            <div>
                {ReadingPointBox查看阅读点.langText()}<strong
                    >{ReadingPointBox查看阅读点.w()}</strong
                >
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$readingAddRPmenu}
                />
                {tomatoI18n.menu添加右键菜单}:{ReadingPointBox设置阅读点.langText()}<strong
                    >{ReadingPointBox设置阅读点.w()}</strong
                >
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$readingAddJumpMenu}
                />
                {tomatoI18n.menu添加右键菜单}:{ReadingPointBox跳到当前文档的阅读点.langText()}<strong
                    >{ReadingPointBox跳到当前文档的阅读点.w()}</strong
                >
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$readingAddDeleteMenu}
                />
                {tomatoI18n.menu添加右键菜单}:{ReadingPointBox删除当前文档的阅读点.langText()}<strong
                    >{ReadingPointBox删除当前文档的阅读点.w()}</strong
                >
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$readingDialog}
                />
                {tomatoI18n.用对话框的形式打开阅读点}
            </div>
            <div hidden={$readingDialog}>
                <input
                    class="b3-text-field"
                    bind:value={$readingSaveFile}
                    placeholder="doc name"
                />
                {tomatoI18n.阅读点统一保存}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$readingPointWithEnv}
                />
                {tomatoI18n.插入阅读点时记录当前所有打开的页签}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$readingTopBar}
                />
                {tomatoI18n.topbar添加图标}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$readingAdd2Card}
                />
                {tomatoI18n.阅读点加入闪卡}
            </div>
        {/if}
    </div>
    <!-- 复制为图片 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$imgBoxCheckbox}
            />
            {tomatoI18n.复制为图片}<strong>{ImgBoxHotKey.w()}</strong>
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/QGx5d437SoArUyxZ6c3cqhmfnnb?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $imgBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$imgBoxShowMenu}
                />
                {tomatoI18n.menu添加右键菜单}
            </div>
        {/if}
    </div>
    <!-- 闪卡工具 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cardBoxCheckbox}
            />
            {tomatoI18n.闪卡工具}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/HJVDdXzrfo3XgMxAwFTc1gyvnHc?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $cardBoxCheckbox}
            <div>
                {tomatoI18n.快捷键如有冲突请调整}
            </div>
            <div>
                {tomatoI18n.取消当前文档内所有闪卡}
                <strong>{CardBox取消当前文档内所有闪卡.w()}</strong>
            </div>
            <div>
                {tomatoI18n.清理所有失效的闪卡}
                <strong>{CardBox清理所有失效的闪卡.w()}</strong>
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cardBoxSuperCard}
                />
                {tomatoI18n.menu添加右键菜单}:
                {tomatoI18n.用选中的行创建超级块超级块制卡取消制卡}<strong
                    >{CardBox用选中的行创建超级块超级块制卡取消制卡.w()}</strong
                >
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cardBoxAddConcepts}
                />
                {tomatoI18n.创建超级块时添加相关匹配到的引用}<TomatoVIP
                    {codeValid}
                ></TomatoVIP>
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cardBoxSpradEvenlyPostpone}
                />
                {tomatoI18n.推迟多个闪卡分散在一段时间内}<TomatoVIP {codeValid}
                ></TomatoVIP>
            </div>
        {/if}
        <div>
            <button
                class="b3-button b3-button--outline"
                on:click={() => {
                    siyuan.removeBrokenCards(tomatoI18n);
                }}
                >🗑️
            </button>{tomatoI18n.删除失效的闪卡}
        </div>
    </div>
    <!-- 闪卡优先级 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cardPriorityBoxCheckbox}
            />
            {tomatoI18n.闪卡优先级}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/KwZJdW9BeoHkiRxVg6jcLUnanqf?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $cardPriorityBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>

            <div>
                {tomatoI18n.恢复所有暂停的闪卡}
                <strong>{CardPriority恢复所有暂停的闪卡.w()}</strong>
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cardPriorityBoxPostponeCardMenu}
                />
                {tomatoI18n.menu添加右键菜单 + "：" + tomatoI18n.推迟闪卡}
                <strong>{CardPriorityBox推迟闪卡.w()}</strong>
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cardPriorityBoxSpradDelayMenu}
                />
                {tomatoI18n.menu添加右键菜单 + "：" + tomatoI18n.分散推迟闪卡}
                <strong>{CardPriorityBox分散推迟闪卡.w()}</strong><TomatoVIP
                    {codeValid}
                ></TomatoVIP>
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cardPriorityBoxPriorityMenu}
                />
                {tomatoI18n.menu添加右键菜单 +
                    "：" +
                    tomatoI18n.修改文档中闪卡优先级}
                <strong>{CardPriorityBox修改文档中闪卡优先级.w()}</strong>
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cardPriorityBoxAutoHide}
                />
                {tomatoI18n.自动隐藏}<TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$auto_card_priority}
                />
                {tomatoI18n.连续2次重来加优先级连续2次简单减优先级}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$card_priority_slider_hide}
                />
                {tomatoI18n.隐藏优先级滑动块}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$card_priority_stopBtn_hide}
                />
                {tomatoI18n.隐藏闪卡暂停按钮}
            </div>

            <div>
                <input
                    class="b3-text-field"
                    bind:value={$cardPrioritySetPriInterval}
                />
                {tomatoI18n.间隔x分钟检查所有闪卡加上默认优先级(
                    $cardPrioritySetPriInterval,
                )}
                {#if !$cardPrioritySetPriInterval || $cardPrioritySetPriInterval == "0"}
                    （{tomatoI18n.不扫描优先级}）
                {/if}
            </div>
        {/if}
    </div>
    <!-- 长内容工具 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cpBoxCheckbox}
            />
            {tomatoI18n.长内容工具}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/Njovdyosyo4pVExpeqOcH3ImnJu?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $cpBoxCheckbox}
            <div>
                {tomatoI18n.批量删除大量连续内容块}
                <strong>{CpBox批量删除大量连续内容块.w()}</strong>
            </div>
            <div class="kbd">
                {@html tomatoI18n.批量删除帮助}
            </div>
            <div>
                {tomatoI18n.批量移动大量连续内容块}
                <strong>{CpBox批量移动大量连续内容块.w()}</strong>
            </div>
            <div>
                {tomatoI18n.批量复制大量连续内容块}
                <strong>{CpBox批量复制大量连续内容块.w()}</strong>
            </div>
            <div class="kbd">
                {@html tomatoI18n.批量移动复制帮助}
            </div>
        {/if}
    </div>
    <!-- 同步块 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$linkBoxSyncBlock}
                on:change={() => {
                    if ($linkBoxSyncBlock) $linkBoxCheckbox = true;
                }}
            />
            {tomatoI18n.同步块}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/NaSudYNaBoeGqZxnyHFc9QQVneb?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $linkBoxSyncBlock}
            <div>
                {LinkBox查看所有同步位置.langText()}
                <strong> {LinkBox查看所有同步位置.w()}</strong>
            </div>
            <div>
                {LinkBox同步块选择.langText()}
                <strong> {LinkBox同步块选择.w()}</strong>
            </div>
            <div>
                {LinkBox同步块创建.langText()}
                <strong> {LinkBox同步块创建.w()}</strong>
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$linkBoxAttrIconOnHide}
                />
                {tomatoI18n.隐藏同步块右上角菜单}<TomatoVIP {codeValid}
                ></TomatoVIP>
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$linkBoxSyncHref}
                />
                {tomatoI18n.添加到原始块的链接}<TomatoVIP {codeValid}
                ></TomatoVIP>
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$linkBoxSyncRef}
                />
                {tomatoI18n.添加到原始块的引用}<TomatoVIP {codeValid}
                ></TomatoVIP>
            </div>
        {/if}
    </div>
    <!-- 双向互链 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$linkBoxCheckbox}
                on:change={() => {
                    if (!$linkBoxCheckbox) $linkBoxSyncBlock = false;
                }}
            />
            {tomatoI18n.双向互链}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/DmGUdmtacol9ANxy0Encl1ownfP?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $linkBoxCheckbox}
            <div class="softBox">
                <div>
                    {LinkBox链接到块底部.langText()}<strong
                        >{LinkBox链接到块底部.w()}</strong
                    >
                </div>
            </div>
            <div class="softBox">
                <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$linkBoxBilinkMenu}
                    />
                    {tomatoI18n.menu添加右键菜单}: {LinkBoxbilink.langText()}
                    <strong>{LinkBoxbilink.w()}</strong>
                </div>
            </div>
            <div class="softBox">
                <div>
                    {LinkBox双向互链选择块.langText()}<strong
                        >{LinkBox双向互链选择块.w()}</strong
                    >
                </div>
                <div>
                    {LinkBox双向互链创建往返链.langText()}<strong
                        >{LinkBox双向互链创建往返链.w()}</strong
                    >
                </div>
                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$linkBoxLnkTitle}
                    />
                    {tomatoI18n.给链接加文字}
                </div>
                <div>
                    {LinkBox修复双向链接.langText()}<strong
                        >{LinkBox修复双向链接.w()}</strong
                    >
                </div>
            </div>
            <div class="softBox">
                <div class:codeNotValid>
                    {LinkBox嵌入互链选择.langText()}<strong
                        >{LinkBox嵌入互链选择.w()}</strong
                    ><TomatoVIP {codeValid}></TomatoVIP>
                </div>
                <div class:codeNotValid>
                    {LinkBox嵌入互链创建.langText()}<strong
                        >{LinkBox嵌入互链创建.w()}</strong
                    ><TomatoVIP {codeValid}></TomatoVIP>
                </div>
            </div>
            <div class="softBox">
                <div>
                    {LinkBox互相插入引用于下方选择.langText()}<strong
                        >{LinkBox互相插入引用于下方选择.w()}</strong
                    >
                </div>
                <div>
                    {LinkBox互相插入引用于下方创建.langText()}<strong
                        >{LinkBox互相插入引用于下方创建.w()}</strong
                    >
                </div>
            </div>
            <div class="softBox">
                <div>
                    {LinkBox关联两个块选择.langText()}<strong
                        >{LinkBox关联两个块选择.w()}</strong
                    >
                </div>
                <div>
                    {LinkBox关联两个块创建.langText()}<strong
                        >{LinkBox关联两个块创建.w()}</strong
                    >
                </div>
                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$linkBoxUseLnkOrRef}
                    />
                    {tomatoI18n.使用链接否则用引用}
                </div>
            </div>
        {/if}
    </div>
    <!-- DailyNote -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$dailyNoteBoxCheckbox}
            />
            {tomatoI18n.dailynote工具}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/MuXadWNNEoSsuExVj7dcZcY1nJb?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $dailyNoteBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dailyNotetopbarleft}
                />
                {tomatoI18n.topbar添加图标}:
                {DailyNoteBox上一个日志.langText()}
                <strong>{DailyNoteBox上一个日志.w()}</strong>
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dailyNotetopbarright}
                />
                {tomatoI18n.topbar添加图标}:
                {DailyNoteBox下一个日志.langText()}
                <strong>{DailyNoteBox下一个日志.w()}</strong>
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dailyNoteGoToBottomMenu}
                />
                {tomatoI18n.menu添加右键菜单}： {DailyNoteBox移动内容到dailynote.langText()}
                <strong>{DailyNoteBox移动内容到dailynote.w()}</strong>
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dailyNoteGoToBottom}
                />
                {tomatoI18n.打开DailyNote时总是跳到底部}<TomatoVIP {codeValid}
                ></TomatoVIP>
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dailyNoteMoveToBottom}
                />
                {tomatoI18n.移动到DailyNote时总是移动到底部}
            </div>

            <div>
                <NotebookSelect></NotebookSelect>
            </div>

            <div>
                {DailyNoteBox复制到dailynote.langText()}
                <strong>{DailyNoteBox复制到dailynote.w()}</strong>
            </div>
            {#if !$dailyNoteCopySimple}
                <div>
                    {DailyNoteBox复制到dailynoteNewFile.langText()}
                    <strong>{DailyNoteBox复制到dailynoteNewFile.w()}</strong>
                </div>
            {/if}
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dailyNoteCopyMenu}
                />
                {tomatoI18n.menu添加右键菜单}： {tomatoI18n.复制到dailynote}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dailyNoteCopySimple}
                />
                {tomatoI18n.简单复制到dailynote}
            </div>

            {#if !$dailyNoteCopySimple}
                <div>
                    <input
                        class="b3-text-field"
                        bind:value={$dailyNoteCopyAnchorText}
                    />
                    {tomatoI18n.复制到dailynote使用的锚文本}
                </div>

                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$dailyNoteCopyUseRef}
                    />
                    {tomatoI18n.使用引用来回溯}
                </div>

                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$dailyNoteCopyInsertPR}
                    />
                    {tomatoI18n.在原文中同时插入阅读点}
                </div>

                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$dailyNoteCopyUpdateBG}
                    />
                    {tomatoI18n.改变原文的背景}
                </div>

                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$dailyNoteCopyShowPath}
                    />
                    {tomatoI18n.复制的内容显示原文的路径}
                </div>

                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$dailyNoteCopyComment}
                    />
                    {tomatoI18n.添加批注}
                </div>

                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$dailyNoteCopyFlashCard}
                    />
                    {tomatoI18n.加入闪卡}
                </div>
            {/if}
        {/if}
    </div>
    <!-- 图片遮挡 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$imgOverlayCheckbox}
            />
            {tomatoI18n.图片遮挡}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/SLSWdFITgo7q4ex4q6ScIuGin2g?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
    </div>
    <!-- 数据库反链 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$dbBkBoxCheckbox}
            />
            {tomatoI18n.数据库充当反链}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/W4WxdA0Bzo0O7UxwHFFcAHUUnSd?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $dbBkBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dbBkBoxRefreshMenu}
                />
                {tomatoI18n.menu添加右键菜单}:
                {DbBkBox刷新数据库反链.langText()}
                <strong>{DbBkBox刷新数据库反链.w()}</strong>
            </div>
            <div>
                <input
                    type="number"
                    min="1"
                    class="b3-text-field"
                    bind:value={$dbBkBoxMaxBacklinkSize}
                />
                {tomatoI18n.maxBkDocs最大展开的反链文件数}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dbBkBoxHideDatetime}
                />
                {tomatoI18n.隐藏修改时间和创建时间}
            </div>
        {/if}
        <div>
            <button
                class="b3-button b3-button--outline"
                on:click={() => cleanDataview()}
                >🗑️
            </button>{tomatoI18n.删除失效的数据库}
        </div>
    </div>
    <!-- 杂项 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$mixBoxCheckbox}
            />
            {tomatoI18n.杂项许多小功能}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/Yw4UdhdaTo25dhxtiPUcPnNzn3c?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $mixBoxCheckbox}
            <!-- 显示文档属性 -->
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$showDocAttrs}
                />
                {tomatoI18n.显示文档属性}
            </div>
            <div>
                {MixBox删除块以及闪卡.langText()}
                <strong>{MixBox删除块以及闪卡.w()}</strong>
            </div>
            <div>
                {MixBox内容制表.langText()}
                <strong>{MixBox内容制表.w()}</strong>
            </div>
            <div>
                {MixBox使内容模糊.langText()}
                <strong>{MixBox使内容模糊.w()}</strong>
            </div>
            <div>
                {MixBox跳转到剪贴板中ID的块.langText()}
                <strong>{MixBox跳转到剪贴板中ID的块.w()}</strong>
            </div>
            <div>
                {MixBox添加一个flag书签.langText()}
                <strong>{MixBox添加一个flag书签.w()}</strong>
            </div>
            <div>
                {MixBox删除所有flag书签.langText()}
                <strong>{MixBox删除所有flag书签.w()}</strong>
            </div>
            <div>
                {MixBox空格隔开的所有内容都转为引用.langText()}
                <strong>{MixBox空格隔开的所有内容都转为引用.w()}</strong>
            </div>
            <div>
                {MixBox收集当前文档与子文档所有的未完成任务.langText()}
                <strong>{MixBox收集当前文档与子文档所有的未完成任务.w()}</strong
                >
            </div>
            <div>
                {MixBox列出当前文档与子文档中没被引用的文档.langText()}
                <strong>{MixBox列出当前文档与子文档中没被引用的文档.w()}</strong
                >
            </div>
            <div>
                {MixBox将选择文字加入文档的别名.langText()}<strong
                    >{MixBox将选择文字加入文档的别名.w()}</strong
                >
            </div>
            <div>
                {MixBox复制文档为纯文本.langText()}<strong
                    >{MixBox复制文档为纯文本.w()}</strong
                >
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$storeFillMemoMenu}
                />
                {tomatoI18n.menu添加右键菜单}: {MixBox锁定内容.langText()}<strong
                    >{MixBox锁定内容.w()}</strong
                >
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$storeInsertXml}
                />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.插入空的脑图流程图文件}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$storeRefreshStaticBkLnk}
                />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.刷新静态反链}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$storeMoveDocContentHere}
                />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.把文档内容移动到这里}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$storeMergeDoc}
                />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.合并文档到这里}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$mixBoxPinyin}
                />
                {tomatoI18n.menu添加右键菜单}: {MixBox将选择文字与其拼音加入文档的别名.langText()}<strong
                    >{MixBox将选择文字与其拼音加入文档的别名.w()}</strong
                >
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$storeOpenRefsMenu}
                />
                {tomatoI18n.menu添加右键菜单}: {MixBox定位所有引用Menu.langText()}<strong
                    >{MixBox定位所有引用Menu.w()}</strong
                >
            </div>

            <div class:codeNotValid>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$storeOpenRefsClick}
                    disabled={codeNotValid}
                    class:codeNotValid
                />
                {tomatoI18n.点击引用数打开所有引用}<TomatoVIP {codeValid}
                ></TomatoVIP>
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$storeCopyStdMD}
                />
                {tomatoI18n.menu添加右键菜单}: {MixBox复制文档为标准Markdown.langText()}<strong
                    >{MixBox复制文档为标准Markdown.w()}</strong
                >
            </div>
        {/if}
    </div>
    <!-- 文本转引用 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$tag2RefBoxCheckbox}
            />
            {tomatoI18n.文本转引用}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/OikodVWC1oJK16xUfm9cmpfAnQd?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $tag2RefBoxCheckbox}
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$tag_to_ref_add_card}
                />{tomatoI18n.添加引用时自动制卡}
            </div>
            <div class:codeNotValid>
                <input
                    type="checkbox"
                    class="b3-switch"
                    disabled={codeNotValid}
                    class:codeNotValid
                    bind:checked={$tag_to_ref_add_pinyin}
                />{tomatoI18n.给文档添加简拼别名}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$tag2RefSearchRef}
                />
                {tomatoI18n.menu添加右键菜单}:{Tag2RefBox模糊查找引用Ref.langText()}<strong
                    >{Tag2RefBox模糊查找引用Ref.w()}</strong
                >
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$tag2RefSearchLnk}
                />
                {tomatoI18n.menu添加右键菜单}:{Tag2RefBox模糊查找引用Lnk.langText()}<strong
                    >{Tag2RefBox模糊查找引用Lnk.w()}</strong
                >
            </div>
        {/if}
    </div>
    <!-- 列表工具 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$listBoxCheckbox}
            />
            {tomatoI18n.列表工具}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/GbeDdl1Bro3laRxlfqrcl10OnTc?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $listBoxCheckbox}
            <div>
                {ListBox取消勾选当前文档所有已完成的todo任务.langText()}
                <strong
                    >{ListBox取消勾选当前文档所有已完成的todo任务.w()}</strong
                >
            </div>
            <div>
                {ListBox删除当前文档所有已完成的todo任务.langText()}
                <strong>{ListBox删除当前文档所有已完成的todo任务.w()}</strong>
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dont_break_list}
                />
                {tomatoI18n.阻止连续回车断开列表}
            </div>
        {/if}
    </div>
    <!-- 人工智能 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$aiBoxCheckbox}
            />
            {AIBoxHotkey.langText()}<strong>{AIBoxHotkey.w()}</strong>
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/Kbuvd9lbhoDWTCxggz9cxQgJnAH?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $aiBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$aiBoxMenuShow}
                />
                {tomatoI18n.menu添加右键菜单}
            </div>
        {/if}
    </div>
    <!-- 豆包知识库 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$cozeSearchBoxCheckbox}
            />
            coze{tomatoI18n.知识库问答}<strong>{CozeSearchBoxHotkey.w()}</strong
            >
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/ENZfd6zfKoTZPqxZxf2c4uWVnow?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $cozeSearchBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>

            <div>
                <input
                    class="b3-text-field"
                    bind:value={$cozeSearchOauthTokenID}
                />
                <a href="https://www.coze.cn/open/oauth/pats"
                    >{tomatoI18n.添加令牌}</a
                >
            </div>
            <div>
                <input class="b3-text-field" bind:value={$cozeSearchSpaceID} />
                <a href="https://www.coze.cn/space">{tomatoI18n.添加空间ID}</a>
            </div>
            <div>
                <input
                    class="b3-text-field"
                    bind:value={$cozeSearchKnowledgeID}
                />
                <a href="https://www.coze.cn/space/{$cozeSearchSpaceID}/library"
                    >{tomatoI18n.添加知识库ID}</a
                >
            </div>
            <div>
                <input class="b3-text-field" bind:value={$cozeSearchAppID} />
                <a href="https://www.coze.cn/space/{$cozeSearchSpaceID}/develop"
                    >{tomatoI18n.添加智能体ID}</a
                >
            </div>
            <div>
                <input class="b3-text-field" bind:value={$cozeSearchDoubaoID} />
                {tomatoI18n.豆包智能体ID}
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cozeSearchMenuShow}
                />
                {tomatoI18n.menu添加右键菜单}
            </div>
        {/if}
    </div>
    <!-- 快速笔记 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$fastNoteBoxCheckbox}
            />
            {tomatoI18n.快速笔记}
            <strong>
                <a
                    href="https://awx9773btw.feishu.cn/docx/DNZ1dYORAoHpm7xdPaecyb6Pnrh?from=from_copylink"
                >
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $fastNoteBoxCheckbox}
            <div>{tomatoI18n.快捷键如有冲突请调整}</div>

            <div>
                {tomatoI18n.创建快速笔记}
                <strong>{FastNoteBox创建快速笔记.w()}</strong>
            </div>

            <div>
                {tomatoI18n.打开最后一个笔记}
                <strong>{FastNoteBox打开最后一个笔记.w()}</strong>
            </div>

            <div class:codeNotValid>
                {FastNoteBox草稿切换.langText()}
                <strong>{FastNoteBox草稿切换.w()}</strong><TomatoVIP {codeValid}
                ></TomatoVIP>
            </div>

            <div>
                <NotebookSelect store={storeNoteBox_fastnote}></NotebookSelect>
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$fastNoteBoxDisableBK}
                />
                {tomatoI18n.禁用底部反链}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$fastNoteBoxAdd2Flashcard}
                />
                {tomatoI18n.创建文件时制卡}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$fastNoteBoxDelAfterCreating}
                />
                {tomatoI18n.删除所选段落}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>
        {/if}
    </div>
    <!-- save -->
    <div class="settingBox">
        <button class="b3-button b3-button--outline" on:click={save}
            >{tomatoI18n.保存}</button
        >
    </div>
</div>

<style>
    .softBox {
        padding: 5px;
        background-color: rgba(200, 230, 255, 0.3);
        border: 1px solid rgba(100, 150, 200, 0.2);
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }
    .search-bar {
        position: sticky;
        top: 0;
        background-color: var(--b3-theme-surface);
        z-index: 10;
    }
    .space {
        margin-right: 10px;
    }
    .spacetop {
        margin-top: 5px;
    }
    .settingBox {
        margin: 10px;
        padding: 10px;
        border-top: 3px dashed var(--b3-theme-on-surface);
    }
    .settingBox > div:not(:last-child) {
        margin-bottom: 5px;
    }
    .settingBox > div:not(:first-child) {
        margin-left: 5%;
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
    .kbd {
        padding: 2px 4px;
        font:
            100% Consolas,
            "Liberation Mono",
            Menlo,
            Courier,
            monospace,
            var(--b3-font-family);
        line-height: 1;
        color: var(--b3-theme-on-surface);
        vertical-align: middle;
        background-color: var(--b3-theme-surface);
        border: solid 1px var(--b3-theme-surface-lighter);
        border-radius: var(--b3-border-radius);
        box-shadow: inset 0 -1px 0 var(--b3-theme-surface-lighter);
    }
</style>
