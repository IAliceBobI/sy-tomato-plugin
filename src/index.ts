import { autoExitFocus } from "./libs/focusUtils";
import { Dialog, ICardData, Setting } from "siyuan";
import { ICONS } from "./icons";
import { linkBox } from "./LinkBox";
import { schedule } from "./Schedule";
import { newID } from "stonev5-utils";
import { openChangelogDialog } from "./libs/changelogDialog";
import { reloadSelfPlugin } from "./libs/pluginReload";
import changelog2025 from "./changelog/2025.json";
import changelog2026 from "./changelog/2026.json";
import { openHelpDialog } from "./libs/helpDialog";
import helpDocs from "./help.json";
import { openHelpMenu } from "./libs/helpMenu";
import { buildSettingsHeader } from "./libs/settingsHeader";
import { readingPointBox } from "./ReadingPointBox";
import { EventType, events } from "./libs/Events";
import { STORAGE_SETTINGS } from "./constants";
import * as utils from "./libs/utils";
import * as tools from "./libs/tools";
import { imgOverlayBox } from "./ImgOverlayBox";
import { dailyNoteBox } from "./DailyNoteBox";
import { openBuyDialog } from "./BuyDialog";
import { cardPriorityBox } from "./CardPriorityBox";
import { siyuan, timeUtil } from "../../sy-tomato-plugin/src/libs/utils";
import { assetsApi } from "./libs/docUtils";
import { mixBox } from "./MixBox";
import { DATA_TYPE, TomatoPluginConfig, TomatoPluginInstance } from "./libs/gconst";
import { tomatoI18n } from "./tomatoI18n";
import IndexConf from "./IndexConf.svelte";
import { destroyPanelTip } from "./libs/panelTip";
import { DestroyManager } from "./libs/destroyer";
import { loadCss } from "./cssStyle";
import { tomatoClock } from "./TomatoClock";
import { toolbarBox } from "./ToolbarBox";
import { cardBox } from "./CardBox";
import { cpBox } from "./CpBox";
import { pairBarBox } from "./PairBarBox";
import { backLinkBottomBox } from "./BackLinkBottomBox";
import { tag2RefBox } from "./Tag2RefBox";
import { spaceRefBox } from "./SpaceRefBox";
import { noteBox } from "./NoteBox";
import { listBox } from "./ListBox";
import { aiBox } from "./AIBox";
import { OpenAIClient, buildMessages, appendChunk, stripThinkTag, getOfficialConfig } from "./libs/openAI";
import { imgBox } from "./ImgBox";
import { fastNoteBox } from "./FastNoteBox";
import * as plugin from "siyuan";
import { addSelectionBtnsDesktop, addSelectionBtnsMobile, aiBoxCheckbox, aiBoxMenuShow, aiBoxPrompts, auto_card_priority, avoiding_cloud_synchronization_conflicts, awaysExitFocusStore, back_link_concept_fold, back_link_copy, back_link_dailynote_off, back_link_default_off, back_link_embed, back_link_goto_bottom_btn, back_link_max_size, back_link_mention_count, back_link_move_here, back_link_move_to_dailynote, back_link_move_with_backlink, back_link_passup_heading, back_link_passup_quote, back_link_passup_super, back_link_protyle_height, back_link_ref, back_link_refresh_off, back_link_remove_refs, bk_refresh_interval_sec, bk_visible_only, back_link_show_path, back_link_follow_width, backLinkBottomBoxCheckbox, bk启用禁用文档的底部反链menu, card_priority_slider_hide, card_priority_stopBtn_hide, cardBoxAddConcepts, cardBoxCheckbox, cardBoxSpradEvenlyPostpone, cardBoxDelayDays, cardBoxSuperCard, cardPriorityBoxAutoHide, cardPriorityBoxCheckbox, cardPriorityBoxPostponeCardMenu, cardPriorityBoxPriorityMenu, cardPriorityBoxSpradDelayMenu, commentBoxAddFlashCard, commentBoxAnnoBg, commentBoxAnnoDraftNotebook, commentBoxAnnoLineType, commentBoxAnnoMarkStyle, commentBoxBackwardRef, commentBoxAnnotations, commentBoxCheckbox, commentBoxForwardRef, commentBoxAnnoUnderlineThickness, commentBoxMaxProtyleHeight, commentBoxMenu, commentBoxAnnoToolbar, commentBoxShowID, commentBoxStaticOutlink, commentBoxPanelSkin, commentBoxAnnoEditorMode, commentBoxAnnoEditorFontSize, commentBoxVirtualRef, cozeSearchAppID, cozeSearchBoxCheckbox, cozeSearchDoubaoID, cozeSearchKnowledgeID, cozeSearchMenuShow, cozeSearchOauthTokenID, cozeSearchSpaceID,  cssFlashThoughts, cssHomeEndIconLeft, cssListBackgound, cssNattyList, cssRefAsTags, cssRefEffect, cssRefSquareBrackets, cssRefStyle, cssShowFlashCardBlank, cssShowHomeEndIcon, cssShowMemo, dailyNoteBoxCheckbox, dailyNoteCopyAnchorText, dailyNoteCopyFlashCard, dailyNoteCopyInsertPR, dailyNoteCopyMenu, dailyNoteCopyShowPath, dailyNoteCopySimple, dailyNoteCopyUpdateBG, dailyNoteCopyUseRef, dailyNoteGoToBottom, dailyNoteGoToBottomMenu, dailyNoteMoveToBottom, dailyNotetopbarleft, dailyNotetopbarright, dbBkBoxCheckbox, dbBkBoxHideDatetime, dbBkBoxMaxBacklinkSize, dbBkBoxRefreshMenu, dont_break_list, fastNoteBoxAdd2Flashcard, fastNoteBoxCheckbox, fastNoteBoxDelAfterCreating, fastNoteBoxDisableBK, flash_thoughts_2_top, flash_thoughts_target_file, flashThoughtUseDialog, graphAddTopbarIcon, graphBoxCheckbox, graphDefaultExpandLevel, graphDefaultLayout, graphHideStructEdges, graphMaxAllBlocks, graphMaxPBlocks, graph定位到图中的节点Menu, graph打开块关系图Menu, imgBoxCheckbox, imgBoxShowMenu, imgOverlayCheckbox, keepLazyLoadStore, linkBoxAttrIconOnHide, linkBoxBilinkMenu,  linkBoxLnkTitle,  linkBoxSyncBlockAuto, linkBoxSyncScanDeep, linkBoxSyncRemapChildID, linkBoxSyncHref, linkBoxSyncRef, linkBoxUseLnkOrRef, pairBarEnabled, pairBarDefaultFunc, pairBarLastFunc, pairBarLastSrcID, pairBarEntryHotkey, pairBarEntryIconMenu, pairBarEntryMenu, pairBarEntryStatus, listBoxCheckbox, mindWireCheckbox, mindWireColorfull, mindWireDocMenu, mindWireDynamicLine, mindWireEnable, mindWireGlobalMenu, mindWireLine, mindWireStarRefOnly, mindWireWordWire, readingFloatBar, readingFloatBallHidden, readingFloatBallPos, mixBoxCheckbox, mixBoxPinyin, noteBoxAllKinds, noteBoxCheckbox, readingAddDeleteMenu, readingAddJumpMenu, readingAddRPmenu, readingPointBoxCheckbox, readingShowAllFolders, readingStatusBar, readingTopBar, showDocAttrs, spaceRefEnabled, spaceRefLinkType, storeCopyStdMD, storeFillMemoMenu, storeInsertXml, storeMergeDoc, storeMoveDocContentHere, storeNoteBox_fastnote, storeNoteBox_keep, storeNoteBox_noteAreaText, storeNoteBox_pin, storeNoteBox_recentText, storeNoteBox_selectedNotebook, storeNoteBox_selectedNoteType, storeOpenRefsClick, storeOpenRefsMenu, storeRefreshStaticBkLnk, tag2RefBoxCheckbox, tag2RefSearchLnk, tag2RefSearchRef, tag_to_ref_add_card, tag_to_ref_add_pinyin, tomato_clocks, tomato_clocks_change_bg, tomato_clocks_change_bg_dark, tomato_clocks_force_dialog, tomato_clocks_force_notice, tomato_clocks_opacity, tomato_clocks_position_right, tomato_clocks_loop, tomato_clocks_break, tomato_clocks_notice, tomato_clocks_focus, tomatoClockCheckbox, toolbarBoxCheckbox, toolbarEN2CHBtn, toolbarlocatedoc, toolbarrefreshVr, toolbarspacerepeat, toolbarTidy, userID, userToken, licenseCloudSynced, annoCollectScope, annoCollectDest, annoCollectTargetDoc, mindWireWidth, cssSuperBlockBorder, cardPrioritySetPriInterval, foldTypes, foldTypesSuperBlock, foldTypesBLOCKQUOTE, foldTypesNODE_LIST, foldTypesNODE_TABLE, foldTypesNODE_HEADING, tomato_clocks_audio, exportPath, exportIntervalSec, exportCleanFiles, markdownExportBoxCheckbox, exportWhiteList, exportBlackList, hiddenMenuItems, markdownExportPics, exportCleanPath, exportIntervalSecOn, exportCleanFilesOn, floatingballEnable, floatingballDocList, floatingballKeyboardList, floatingballBallList, floatingballDocMenu, prefixArticlesEnable, prefixArticlesMenu, dailyNoteMoveLeaveLnk, prefixArticlesSoftLimit, fastNoteBoxDocPrefix, floatingballDocTabMenu, prefixArticlesTagsShow, exportPathWin, cardBoxSettingsShow, cardBoxCardtab, card_refresh_visible_only, foldTypesNODE_listITEM, deleteBlocksMenu, toolbarTidyExt, superRefBoxCheckBox, superRefBoxGlobalFixMenu, superRefBoxGlobalLnkMenu, blockEditorMenu, blockEditorBox, qeFloatBall, exportWL4All, getNavSourceBlock, navSourceBlock, refEffectFromLegacy } from "./libs/stores";
import { dbBkBox } from "./DbBkBox";
import { graphBox } from "./GraphBox";
import { resetKey, verifyKeyTomato, lastVerifyResult } from "./libs/user";
import { commentBox } from "./CommentBox";
import { annotations, applyAnnoVisual } from "./Annotations";
import { initAnnoDraftNotebookDefault } from "./libs/annoDraft";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { cozeSearchBox } from "./CozeSearchBox";
import { addSelectionButton, exportAsOneFile, importMD, initDocNavigator, mergeDocMenuListener } from "./exportFiles";
import { getDocTracer } from "./libs/docUtils";
import { addFoldCmd, addFoldingAttrBarBtns } from "./fold";
import { winHotkey } from "./libs/winHotkey";
import { mindWire } from "./MindWire";
import { markdownExportBox } from "./MarkdownExportBox";
import { loadFloatingBall } from "./FloatingBall";
import { setGlobal } from "stonev5-utils";
import { initPrefixArticles } from "./PrefixArticles";
import { mount, unmount } from "svelte";
import { superRefBox } from "./SuperRefBox";
import { blockEditor } from "./BlockEditor";

// 更新日志按年拆分存储（src/changelog/<年>.json，当年文件追加、往年冻结），此处组装倒序全集
const changelog = [...changelog2026, ...changelog2025];

// 开着的设置面板收尾登记：官方 destroyPlugin 清单不含插件 Dialog，重载残留由 onunload
// 主动摘（□2 e2e settings 场景照出，□3 修复）；关窗即摘登记
let settingsPanelCloser: (() => void) | null = null;

function loadStore(plugin: BaseTomatoPlugin) {
    userToken.load(plugin);
    userID.load(plugin);
    licenseCloudSynced.load(plugin);
    navSourceBlock.load(plugin);
    blockEditorBox.load(plugin);
    blockEditorMenu.load(plugin);
    qeFloatBall.load(plugin);
    superRefBoxCheckBox.load(plugin);
    superRefBoxGlobalLnkMenu.load(plugin);
    superRefBoxGlobalFixMenu.load(plugin);
    toolbarTidyExt.load(plugin);
    deleteBlocksMenu.load(plugin);
    foldTypesNODE_listITEM.load(plugin);
    cardBoxSettingsShow.load(plugin);
    cardBoxCardtab.load(plugin);
    card_refresh_visible_only.load(plugin);
    floatingballDocTabMenu.load(plugin);
    prefixArticlesTagsShow.load(plugin);
    fastNoteBoxDocPrefix.load(plugin);
    prefixArticlesSoftLimit.load(plugin);
    dailyNoteMoveLeaveLnk.load(plugin);
    prefixArticlesMenu.load(plugin);
    prefixArticlesEnable.load(plugin);
    floatingballDocMenu.load(plugin);
    floatingballKeyboardList.load(plugin);
    floatingballDocList.load(plugin);
    floatingballBallList.load(plugin);
    floatingballEnable.load(plugin);
    readingFloatBar.load(plugin);
    readingFloatBallHidden.load(plugin);
    readingFloatBallPos.load(plugin);
    mindWireWordWire.load(plugin);
    markdownExportPics.load(plugin);
    exportCleanPath.load(plugin);
    exportCleanFilesOn.load(plugin);
    exportIntervalSecOn.load(plugin);
    exportBlackList.load(plugin);
    exportWL4All.load(plugin);
    exportWhiteList.load(plugin);
    hiddenMenuItems.load(plugin);
    annoCollectScope.load(plugin);
    annoCollectDest.load(plugin);
    annoCollectTargetDoc.load(plugin);
    exportIntervalSec.load(plugin);
    exportCleanFiles.load(plugin);
    exportPath.load(plugin);
    exportPathWin.load(plugin);
    tomato_clocks_audio.load(plugin);
    foldTypesNODE_HEADING.load(plugin);
    foldTypesNODE_TABLE.load(plugin);
    foldTypesBLOCKQUOTE.load(plugin);
    foldTypesNODE_LIST.load(plugin);
    foldTypesSuperBlock.load(plugin);
    cardPrioritySetPriInterval.load(plugin);
    foldTypes.load(plugin);
    mindWireColorfull.load(plugin);
    mindWireWidth.load(plugin);
    cssSuperBlockBorder.load(plugin);
    mindWireLine.load(plugin);
    mindWireDocMenu.load(plugin);
    mindWireGlobalMenu.load(plugin);
    mindWireEnable.load(plugin);
    mindWireStarRefOnly.load(plugin);
    mindWireDynamicLine.load(plugin);
    mindWireCheckbox.load(plugin);
    addSelectionBtnsMobile.load(plugin);
    addSelectionBtnsDesktop.load(plugin);
    cardBoxSuperCard.load(plugin);
    dailyNotetopbarleft.load(plugin);
    dailyNotetopbarright.load(plugin);
    tag2RefSearchRef.load(plugin);
    toolbarlocatedoc.load(plugin);
    toolbarrefreshVr.load(plugin);
    tag2RefSearchLnk.load(plugin);
    toolbarspacerepeat.load(plugin);
    dbBkBoxRefreshMenu.load(plugin);
    readingAddDeleteMenu.load(plugin);
    readingAddJumpMenu.load(plugin);
    readingAddRPmenu.load(plugin);
    bk启用禁用文档的底部反链menu.load(plugin);
    linkBoxBilinkMenu.load(plugin);
    graph定位到图中的节点Menu.load(plugin);
    graph打开块关系图Menu.load(plugin);
    graphAddTopbarIcon.load(plugin);
    dailyNoteCopyMenu.load(plugin);
    dailyNoteGoToBottomMenu.load(plugin);
    aiBoxMenuShow.load(plugin);
    cozeSearchMenuShow.load(plugin);
    imgBoxShowMenu.load(plugin);
    commentBoxMenu.load(plugin);
    commentBoxAnnoToolbar.load(plugin);
    cardPriorityBoxPostponeCardMenu.load(plugin);
    cardPriorityBoxPriorityMenu.load(plugin);
    cardPriorityBoxSpradDelayMenu.load(plugin);
    // 引用效果迁移：cssRefEffect 无存量值时从旧双开关推导（style 开→shadow、括号开→brackets、
    // 双开→shadow 与旧实际渲染一致）；.set 只写内存——未持久化也幂等，每次启动重跑无副作用
    const hasRefEffect = (plugin.settingCfg as any)?.cssRefEffect != null;
    cssRefStyle.load(plugin);
    cssRefSquareBrackets.load(plugin);
    cssRefEffect.load(plugin);
    if (!hasRefEffect) {
        cssRefEffect.set(refEffectFromLegacy(cssRefStyle.get() === true, cssRefSquareBrackets.get() === true));
    }
    showDocAttrs.load(plugin);
    cssNattyList.load(plugin);
    cssListBackgound.load(plugin);
    cssRefAsTags.load(plugin);
    cssShowMemo.load(plugin);
    cssShowFlashCardBlank.load(plugin);
    cssShowHomeEndIcon.load(plugin);
    cssHomeEndIconLeft.load(plugin);
    keepLazyLoadStore.load(plugin);
    awaysExitFocusStore.load(plugin);
    graphBoxCheckbox.load(plugin);
    graphMaxPBlocks.load(plugin);
    graphMaxAllBlocks.load(plugin);
    graphHideStructEdges.load(plugin);
    graphDefaultExpandLevel.load(plugin);
    graphDefaultLayout.load(plugin);
    tomatoClockCheckbox.load(plugin);
    tomato_clocks.load(plugin);
    tomato_clocks_force_dialog.load(plugin);
    tomato_clocks_force_notice.load(plugin);
    tomato_clocks_change_bg.load(plugin);
    tomato_clocks_change_bg_dark.load(plugin);
    tomato_clocks_position_right.load(plugin);
    tomato_clocks_opacity.load(plugin);
    tomato_clocks_loop.load(plugin);
    tomato_clocks_break.load(plugin);
    tomato_clocks_notice.load(plugin);
    tomato_clocks_focus.load(plugin);
    toolbarBoxCheckbox.load(plugin);
    toolbarEN2CHBtn.load(plugin);
    toolbarTidy.load(plugin);
    readingPointBoxCheckbox.load(plugin);
    readingTopBar.load(plugin);
    readingStatusBar.load(plugin);
    readingShowAllFolders.load(plugin);
    cardBoxCheckbox.load(plugin);
    cardBoxAddConcepts.load(plugin);
    cardBoxSpradEvenlyPostpone.load(plugin);
    cardBoxDelayDays.load(plugin);
    cardPriorityBoxCheckbox.load(plugin);
    cardPriorityBoxAutoHide.load(plugin);
    auto_card_priority.load(plugin);
    card_priority_slider_hide.load(plugin);
    card_priority_stopBtn_hide.load(plugin);
    linkBoxAttrIconOnHide.load(plugin);
    linkBoxSyncHref.load(plugin);
    linkBoxSyncRef.load(plugin);
    linkBoxSyncBlockAuto.load(plugin);
    linkBoxSyncScanDeep.load(plugin);
    linkBoxSyncRemapChildID.load(plugin);
    linkBoxLnkTitle.load(plugin);
    linkBoxUseLnkOrRef.load(plugin);
    pairBarEnabled.load(plugin);
    pairBarDefaultFunc.load(plugin);
    pairBarLastFunc.load(plugin);
    pairBarLastSrcID.load(plugin);
    pairBarEntryHotkey.load(plugin);
    pairBarEntryStatus.load(plugin);
    pairBarEntryMenu.load(plugin);
    pairBarEntryIconMenu.load(plugin);
    dailyNoteBoxCheckbox.load(plugin);
    dailyNoteGoToBottom.load(plugin);
    dailyNoteMoveToBottom.load(plugin);
    dailyNoteCopySimple.load(plugin);
    dailyNoteCopyAnchorText.load(plugin);
    dailyNoteCopyUseRef.load(plugin);
    dailyNoteCopyUpdateBG.load(plugin);
    dailyNoteCopyInsertPR.load(plugin);
    dailyNoteCopyShowPath.load(plugin);
    dailyNoteCopyFlashCard.load(plugin);
    markdownExportBoxCheckbox.load(plugin);
    imgOverlayCheckbox.load(plugin);
    backLinkBottomBoxCheckbox.load(plugin);
    back_link_max_size.load(plugin);
    back_link_mention_count.load(plugin);
    back_link_default_off.load(plugin);
    back_link_dailynote_off.load(plugin);
    back_link_refresh_off.load(plugin);
    bk_refresh_interval_sec.load(plugin);
    bk_visible_only.load(plugin);
    back_link_goto_bottom_btn.load(plugin);
    back_link_concept_fold.load(plugin);
    back_link_copy.load(plugin);
    back_link_move_to_dailynote.load(plugin);
    back_link_remove_refs.load(plugin);
    back_link_embed.load(plugin);
    back_link_ref.load(plugin);
    back_link_move_here.load(plugin);
    back_link_move_with_backlink.load(plugin);
    back_link_protyle_height.load(plugin);
    back_link_show_path.load(plugin);
    back_link_follow_width.load(plugin);
    back_link_passup_heading.load(plugin);
    back_link_passup_quote.load(plugin);
    back_link_passup_super.load(plugin);
    imgBoxCheckbox.load(plugin);
    dbBkBoxCheckbox.load(plugin);
    dbBkBoxMaxBacklinkSize.load(plugin);
    dbBkBoxHideDatetime.load(plugin);
    mixBoxCheckbox.load(plugin);
    mixBoxPinyin.load(plugin);
    storeMergeDoc.load(plugin);
    storeMoveDocContentHere.load(plugin);
    storeRefreshStaticBkLnk.load(plugin);
    storeInsertXml.load(plugin);
    storeFillMemoMenu.load(plugin);
    storeOpenRefsMenu.load(plugin);
    storeOpenRefsClick.load(plugin);
    storeCopyStdMD.load(plugin);
    tag2RefBoxCheckbox.load(plugin);
    spaceRefEnabled.load(plugin);
    spaceRefLinkType.load(plugin);
    tag_to_ref_add_card.load(plugin);
    tag_to_ref_add_pinyin.load(plugin);
    noteBoxCheckbox.load(plugin);
    noteBoxAllKinds.load(plugin);
    avoiding_cloud_synchronization_conflicts.load(plugin);
    flash_thoughts_2_top.load(plugin);
    cssFlashThoughts.load(plugin);
    flashThoughtUseDialog.load(plugin);
    flash_thoughts_target_file.load(plugin);
    listBoxCheckbox.load(plugin);
    dont_break_list.load(plugin);
    aiBoxCheckbox.load(plugin);
    aiBoxPrompts.load(plugin);
    cozeSearchBoxCheckbox.load(plugin);
    cozeSearchSpaceID.load(plugin);
    cozeSearchKnowledgeID.load(plugin);
    cozeSearchOauthTokenID.load(plugin);
    cozeSearchAppID.load(plugin);
    cozeSearchDoubaoID.load(plugin);
    fastNoteBoxCheckbox.load(plugin);
    fastNoteBoxDisableBK.load(plugin);
    fastNoteBoxAdd2Flashcard.load(plugin);
    fastNoteBoxDelAfterCreating.load(plugin);
    commentBoxCheckbox.load(plugin);
    commentBoxMaxProtyleHeight.load(plugin);
    commentBoxAnnoUnderlineThickness.load(plugin);
    commentBoxAnnoMarkStyle.load(plugin);
    commentBoxAnnoLineType.load(plugin);
    commentBoxAnnoBg.load(plugin);
    applyAnnoVisual();
    commentBoxForwardRef.load(plugin);
    commentBoxBackwardRef.load(plugin);
    commentBoxVirtualRef.load(plugin);
    commentBoxAnnotations.load(plugin);
    commentBoxAddFlashCard.load(plugin);
    commentBoxShowID.load(plugin);
    commentBoxStaticOutlink.load(plugin);
    commentBoxPanelSkin.load(plugin);
    commentBoxAnnoEditorMode.load(plugin);
    commentBoxAnnoEditorFontSize.load(plugin);

    storeNoteBox_selectedNoteType.load(plugin, plugin.settingCfg);
    storeNoteBox_keep.load(plugin, plugin.settingCfg);
    storeNoteBox_pin.load(plugin, plugin.settingCfg);
    storeNoteBox_recentText.load(plugin, plugin.settingCfg);
    storeNoteBox_noteAreaText.load(plugin, plugin.settingCfg);
    storeNoteBox_selectedNotebook.load(plugin, plugin.settingCfg);
    storeNoteBox_fastnote.load(plugin, plugin.settingCfg);
    commentBoxAnnoDraftNotebook.load(plugin, plugin.settingCfg);
}

export const tomatoSettingsOpenHK = winHotkey("ctrl+;", "tomato settings", "", () => tomatoI18n.番茄工具箱配置)

export default class ThePlugin extends BaseTomatoPlugin {
    constructor(options: any) {
        super(options)
        setGlobal(TomatoPluginInstance, this)
        this.loadStore = loadStore;

        if (window.tomato_zZmqus5PtYRi == null)
            window.tomato_zZmqus5PtYRi = {} as any

        this.clean()

        this.taskCfg = this.loadData(STORAGE_SETTINGS).then(async cfg => {
            this.settingCfg = cfg;
            if (!utils.isObject(this.settingCfg)) {
                this.settingCfg = {} as TomatoSettings;
            }

            window.tomato_zZmqus5PtYRi['cardPriorityBox'] = cardPriorityBox;
            window.tomato_zZmqus5PtYRi.pairBar = pairBarBox;
            window.tomato_zZmqus5PtYRi.utils = utils;
            window.tomato_zZmqus5PtYRi.siyuan = siyuan;
            window.tomato_zZmqus5PtYRi.timeUtil = timeUtil;
            window.tomato_zZmqus5PtYRi.events = events;
            window.tomato_zZmqus5PtYRi.tools = tools;
            window.tomato_zZmqus5PtYRi.plugin = plugin;
            window.tomato_zZmqus5PtYRi.pluginInstance = this;
            window.tomato_zZmqus5PtYRi.pluginID = this.id;
            window.tomato_zZmqus5PtYRi.pluginConfig = this.settingCfg;
            window.tomato_zZmqus5PtYRi.api = {
                assets: assetsApi,
            };
            window.tomato_zZmqus5PtYRi.ai = {
                runAI: (text: string, anchorID: string) => aiBox.runAI(text, anchorID),
                buildMessages,
                createStream: (model: string, messages: any[]) => {
                    const aiCfg = getOfficialConfig();
                    const client = new OpenAIClient(aiCfg.apiKey, aiCfg.baseURL);
                    return client.createStreamPublic(model, messages);
                },
                appendChunk,
                stripThinkTag,
            };
            loadStore(this);
            setGlobal(TomatoPluginConfig, this.settingCfg)
            return this.settingCfg;
        });
        utils.tryFixCfg(this.name, STORAGE_SETTINGS);
    }

    /** 官方划词工具条扩展（MindWire 后本仓第二用）：内核在插件构造（keymap 注册）与工具条
     *  构建/装载（applyPluginToolbar）两路调用，各 Box 恒附项——门禁与显隐交给各自的
     *  selectionchange 同步（MindWire syncWordWireToolbar / CommentBox syncAnnoToolbar） */
    updateProtyleToolbar(toolbar: Array<string | plugin.IMenuItem>): Array<string | plugin.IMenuItem> {
        mindWire.updateProtyleToolbar(toolbar);
        return commentBox.updateProtyleToolbar(toolbar);
    }

    private clean() {
        window.tomato_zZmqus5PtYRi?.pluginInstance?.statusBarIcons?.forEach((e: HTMLElement) => {
            if (e.style) e.style.display = "none"
        });
        window.tomato_zZmqus5PtYRi?.pluginInstance?.topBarIcons?.forEach((e: HTMLElement) => {
            if (e.style) e.style.display = "none"
        });
        setTimeout(() => {
            const all = [...document.querySelectorAll(`div.dock__items > span[data-type^="${this.name}"]`)];
            const types = new Set(all.map(e => e.getAttribute(DATA_TYPE)));
            types.forEach(dt => {
                const dockIcons = [...document.querySelectorAll(`div.dock__items > span[data-type="${dt}"]`)]
                dockIcons.forEach((e: HTMLElement, idx) => {
                    if (e.style) {
                        if (idx == 0) {
                            e.style.display = ""
                        } else {
                            e.style.display = "none"
                            e.parentElement?.removeChild(e);
                        }
                    }
                });
            })
        }, 5000);
    }

    private blockIconEventBindThis = this.blockIconEvent.bind(this);

    private openSettings() {
        const dm = new DestroyManager();
        const id = newID();
        const dialog = new Dialog({
            title: " ", // 占位保住 header，真实标题按钮组创建后以节点形式挂入
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : "min(700px, 92vw)",
            height: events.isMobile ? "180svw" : "700px",
            destroyCallback: () => {
                dm.destroyBy("1")
                settingsPanelCloser = null;
            },
            hideCloseIcon: true,
        });
        // □3 统一 header：名+版本+Pro 徽标｜帮助菜单单图标钮+关闭钮；Help帮助/更新日志/
        // outline 保存钮退役（帮助收进菜单，保存走 footer「保存并关闭」）
        const header = buildSettingsHeader({
            title: tomatoI18n.番茄工具箱 + " · " + tomatoI18n.设置,
            version: "v" + this.pluginSpec?.version + "t",
            pro: lastVerifyResult() === true,
            onHelp: (e) => openHelpMenu(e, {
                usage: () => openHelpDialog("https://my.feishu.cn/docx/IWPcd438yoL3C6xHC0xcOXDKnmh?from=from_copylink", helpDocs),
                changelog: () => openChangelogDialog(changelog),
            }),
            onClose: () => dialog.destroy(),
        });
        dialog.element.querySelector(".b3-dialog__header")
            .replaceChildren(header.root);
        const d = mount(IndexConf, {
            target: dialog.element.querySelector("#" + id),
            props: {
                plugin: this,
                dm,
                proBadge: header.badge,
            }
        });
        dm.add("1", () => { dialog.destroy() })
        // Svelte 5 mount() 返回组件 exports——unmount 才真卸载 Svelte 树（子组件
        // onDestroy 从此真跑）；tip 摘除挂 dm 链兜底
        dm.add("2", () => { unmount(d) })
        dm.add("tip", destroyPanelTip)
        settingsPanelCloser = () => dm.destroyBy("plugin-unload");
    }

    async onLayoutReady() {
        // □4 时序统一：Box 注册已全部前移 async onload（框架保序 onload 完成后才
        // onLayoutReady）；此处再 await 一次为零成本防御，保住本簇的配置前提
        await this.taskCfg;

        if (userID.get()) {
            resetKey();
            await verifyKeyTomato();
        }
        // 轮询里 resetKey+重验对齐 progressive/recite 先例：换账号时防 _isValid 懒缓存
        // 旧账号的失败结果锁死整会话（□5 评审 P2-4；□5 修复后无数据损害，仅 VIP 态滞后）。
        // 注册须在启动验证之后：否则旧 id 的启动验证结果可能晚落进轮询 resetKey 后的缓存
        clearInterval(setGlobal("tomato index", setInterval(() => {
            const id = utils.Siyuan?.user?.userId;
            if (id && userID.get() !== id) {
                userID.write(id).then(async () => {
                    resetKey();
                    await verifyKeyTomato();
                });
            }
        }, 2000)));
        // NoteBox 的 Pro 门控强关（原双路 else 分支存量行为，□4 挪此）：verify 失败强关
        // 云同步冲突规避。放 auth 簇而非 NoteBox.onload——onload 注册链不掺网络往返
        if (!(await verifyKeyTomato())) {
            avoiding_cloud_synchronization_conflicts.set(false);
        }

        loadFloatingBall();
        addSelectionButton();
        mergeDocMenuListener();
        importMD();
        exportAsOneFile();
        addFoldCmd(this);
        addFoldingAttrBarBtns()
        this.uninitNav = initDocNavigator();
    }

    private uninitNav: Func;

    async onload() {
        this.addIcons(ICONS);
        events.onload(this);
        tomatoI18n.init();

        this.setting = new Setting({
            confirmCallback: async () => {
                // await 落盘再触发重载：saveData 异步写被抢跑会掐断，文件保持旧值
                await this.saveData(STORAGE_SETTINGS, this.settingCfg);
                await reloadSelfPlugin();
            }
        });

        this.setting.addItem({
            title: tomatoSettingsOpenHK.langText(),
            createActionElement: () => {
                const btnaElement = document.createElement("button");
                btnaElement.className = "b3-button b3-button--outline fn__flex-center fn__size200";
                btnaElement.textContent = "open";
                btnaElement.addEventListener("click", () => {
                    this.openSettings();
                });
                return btnaElement;
            },
        });

        this.addCommand({
            langKey: tomatoSettingsOpenHK.langKey,
            langText: tomatoSettingsOpenHK.langText(),
            hotkey: tomatoSettingsOpenHK.m,
            callback: () => {
                this.openSettings();
            },
        });

        // 购买弹框命令入口（阶段 1.5）：老用户/已激活用户可随时通过命令面板回顾购买页
        this.addCommand({
            langKey: "openTomatoBuyDialog",
            langText: tomatoI18n.打开番茄工具箱购买页,
            callback: async () => {
                // 主动验证而非读懒缓存：冷启动后无人触发过验证时 lastVerifyResult()
                // 是 null，购买页会误按未激活态渲染（含 isMe 取消激活按钮丢失）
                openBuyDialog("tomato", tomatoI18n.购买页, (await verifyKeyTomato()) === true);
            },
        });

        this.eventBus.on(EventType.click_blockicon, this.blockIconEventBindThis);
        utils.getPluginSpec(this.name).then(sp => {
            this.pluginSpec = sp
        });

        this.addTopBar({
            icon: "iconSettings",
            title: tomatoSettingsOpenHK.langText() + tomatoSettingsOpenHK.w(),
            position: "left",
            callback: () => {
                this.openSettings();
            },
        })

        // □4 时序统一：官方框架 await plugin.onload()（2023 年起两代内核均如此，事实源
        // docs/siyuan-plugin-lifecycle-async-loading.md）——配置就绪收进 onload，全部 Box
        // 集中于此顺序注册；onLayoutReady 只剩账号验证簇+布局轻活。各 Box 的「配置已到
        // 走同步/未到走异步」双路竞态消化已全部 flatten 退役（onload 体直接执行）
        await this.taskCfg;
        initPrefixArticles();
        tomatoClock.onload(this);
        dailyNoteBox.onload(this);
        toolbarBox.onload(this);
        noteBox.onload(this);
        readingPointBox.onload(this);
        graphBox.onload(this);
        commentBox.onload(this);

        loadCss();
        getNavSourceBlock()
        awaysExitFocusStore.load(this);
        // 批注草稿存放笔记本默认值注入（未配置→系统日记本，仅内存不落盘；不阻塞启动）
        void initAnnoDraftNotebookDefault(this);
        keepLazyLoadStore.load(this);
        events.addListener("keepload2024-9-20 16:12:30", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.click_editorcontent
                || eventType == EventType.switch_protyle
            ) {
                navigator.locks.request("keeploadlock2024-9-20 16:14:42", { ifAvailable: true }, async (lock) => {
                    if (lock) {
                        const protyle: plugin.IProtyle = detail.protyle;
                        if (keepLazyLoadStore.get()) {
                            if (protyle?.scroll?.keepLazyLoad != null) {
                                protyle.scroll.keepLazyLoad = true
                            }
                        }
                        autoExitFocus();
                    }
                });
            }
        });

        await schedule.onload();
        await cardBox.onload(this);
        await cardPriorityBox.onload(this);
        await cpBox.onload(this);
        await linkBox.onload(this);
        await pairBarBox.onload(this);
        await imgOverlayBox.onload(this);
        await backLinkBottomBox.onload(this);
        await mixBox.onload(this);
        await tag2RefBox.onload(this)
        await spaceRefBox.onload();
        await listBox.onload(this);
        await aiBox.onload(this);
        await mindWire.onload(this);
        await markdownExportBox.onload();
        await cozeSearchBox.onload(this);
        await imgBox.onload(this);
        await fastNoteBox.onload(this);
        await dbBkBox.onload(this);
        await getDocTracer()
        await superRefBox.onload()
        await blockEditor.onload()
    }

    onunload() {
        events.clearDebounce();
        settingsPanelCloser?.();   // 开着的设置面板整链收尾（Dialog+Svelte 树+tip）
        // 卸载即摘底部反链 DOM（面板容器+入口条）；旧实例轮询 interval 依 running()
        // 判活下个 tick 自清（□10 评审 P2：disable 后无 onload，残留=死面板）
        utils.removeBkDomResidue();
        annotations.unload();
        commentBox.onunload();
        tomatoClock.onunload();
        blockEditor.unload();
        readingPointBox.unload();
        mindWire.onunload();
        graphBox.destroy();
        linkBox.onunload();
        pairBarBox.onunload();
        cardPriorityBox.onunload();
        toolbarBox.onunload();
        tag2RefBox.onunload();
        spaceRefBox.onunload();
        listBox.onunload();
        this.uninitNav()
    }

    private blockIconEvent({ detail }: any) {
        cardBox.blockIconEvent(detail);
        readingPointBox.blockIconEvent(detail);
        linkBox.blockIconEvent(detail);
        cardPriorityBox.blockIconEvent(detail);
        imgOverlayBox.blockIconEvent(detail);
        dailyNoteBox.blockIconEvent(detail);
        mixBox.blockIconEvent(detail);
        aiBox.blockIconEvent(detail);
        imgBox.blockIconEvent(detail);
        cozeSearchBox.blockIconEvent(detail);
        dbBkBox.blockIconEvent(detail);
        graphBox.blockIconEvent(detail);
        commentBox.blockIconEvent(detail);
    }

    async updateCards(options: ICardData) {
        return cardPriorityBox.updateCards(options);
    }
}
