import { autoExitFocus } from "./libs/focusUtils";
import { Dialog, ICardData, Setting } from "siyuan";
import { ICONS } from "./icons";
import { linkBox } from "./LinkBox";
import { schedule } from "./Schedule";
import { newID } from "stonev5-utils/lib/id";
import { readingPointBox } from "./ReadingPointBox";
import { EventType, events } from "./libs/Events";
import { STORAGE_SETTINGS } from "./constants";
import * as utils from "./libs/utils";
import * as tools from "./libs/tools";
import { imgOverlayBox } from "./ImgOverlayBox";
import { dailyNoteBox } from "./DailyNoteBox";
import { cardPriorityBox } from "./CardPriorityBox";
import { siyuan, timeUtil } from "../../sy-tomato-plugin/src/libs/utils";
import { mixBox } from "./MixBox";
import { DATA_TYPE, TomatoPluginConfig, TomatoPluginInstance } from "./libs/gconst";
import { tomatoI18n } from "./tomatoI18n";
import IndexConf from "./IndexConf.svelte";
import { DestroyManager } from "./libs/destroyer";
import { loadCss } from "./cssStyle";
import { tomatoClock } from "./TomatoClock";
import { toolbarBox } from "./ToolbarBox";
import { cardBox } from "./CardBox";
import { cpBox } from "./CpBox";
import { backLinkBottomBox } from "./BackLinkBottomBox";
import { tag2RefBox } from "./Tag2RefBox";
import { noteBox } from "./NoteBox";
import { listBox } from "./ListBox";
import { aiBox } from "./AIBox";
import { imgBox } from "./ImgBox";
import { fastNoteBox } from "./FastNoteBox";
import * as plugin from "siyuan";
import { addSelectionBtnsDesktop, addSelectionBtnsMobile, aiBoxCheckbox, aiBoxMenuShow, aiBoxPrompts, auto_card_priority, avoiding_cloud_synchronization_conflicts, awaysExitFocusStore, back_link_concept_fold, back_link_copy, back_link_dailynote_off, back_link_default_off, back_link_embed, back_link_goto_bottom_btn, back_link_max_size, back_link_mention_count, back_link_more_btns, back_link_move_here, back_link_move_to_dailynote, back_link_move_with_backlink, back_link_passup_heading, back_link_passup_quote, back_link_passup_super, back_link_protyle_height, back_link_ref, back_link_refresh_off, back_link_remove_refs, back_link_show_floatUI, back_link_show_path, backLinkBottomBoxCheckbox, bk启用禁用文档的底部反链menu, card_priority_slider_hide, card_priority_stopBtn_hide, cardBoxAddConcepts, cardBoxCheckbox, cardBoxSpradEvenlyPostpone, cardBoxSuperCard, cardPriorityBoxAutoHide, cardPriorityBoxCheckbox, cardPriorityBoxPostponeCardMenu, cardPriorityBoxPriorityMenu, cardPriorityBoxSpradDelayMenu, commentBoxAddFlashCard, commentBoxAddUnderline, commentBoxBackwardRef, commentBoxCheckbox, commentBoxForwardRef, commentBoxMaxProtyleHeight, commentBoxMenu, commentBoxShowID, commentBoxStaticOutlink, commentBoxVirtualRef, cozeSearchAppID, cozeSearchBoxCheckbox, cozeSearchDoubaoID, cozeSearchKnowledgeID, cozeSearchMenuShow, cozeSearchOauthTokenID, cozeSearchSpaceID, cpBoxCheckbox, cssFlashThoughts, cssHomeEndIconLeft, cssListBackgound, cssNattyList, cssRefAsTags, cssRefSquareBrackets, cssRefStyle, cssShowFlashCardBlank, cssShowHomeEndIcon, cssShowMemo, dailyNoteBoxCheckbox, dailyNoteCopyAnchorText, dailyNoteCopyComment, dailyNoteCopyFlashCard, dailyNoteCopyInsertPR, dailyNoteCopyMenu, dailyNoteCopyShowPath, dailyNoteCopySimple, dailyNoteCopyUpdateBG, dailyNoteCopyUseRef, dailyNoteGoToBottom, dailyNoteGoToBottomMenu, dailyNoteMoveToBottom, dailyNotetopbarleft, dailyNotetopbarright, dbBkBoxCheckbox, dbBkBoxHideDatetime, dbBkBoxMaxBacklinkSize, dbBkBoxRefreshMenu, dont_break_list, fastNoteBoxAdd2Flashcard, fastNoteBoxCheckbox, fastNoteBoxDelAfterCreating, fastNoteBoxDisableBK, flash_thoughts_2_top, flash_thoughts_target_file, flashThoughtUseDialog, graphAddTopbarIcon, graphBoxCheckbox, graphClick2Locate, graphMaxAllBlocks, graphMaxPBlocks, graph定位到图中的节点Menu, graph打开块关系图Menu, hideVIP, imgBoxCheckbox, imgBoxShowMenu, imgOverlayCheckbox, keepLazyLoadStore, linkBoxAttrIconOnHide, linkBoxBilinkMenu, linkBoxCheckbox, linkBoxLnkTitle, linkBoxSyncBlock, linkBoxSyncBlockAuto, linkBoxSyncHref, linkBoxSyncRef, linkBoxUseLnkOrRef, listBoxCheckbox, mindWireCheckbox, mindWireColorfull, mindWireDocMenu, mindWireDynamicLine, mindWireEnable, mindWireGlobalMenu, mindWireLine, mindWireStarRefOnly, mixBoxCheckbox, mixBoxPinyin, noteBoxAllKinds, noteBoxCheckbox, readingAdd2Card, readingAddDeleteMenu, readingAddJumpMenu, readingAddRPmenu, readingDialog, readingPointBoxCheckbox, readingPointWithEnv, readingSaveFile, readingShowAllFolders, readingTopBar, showDocAttrs, storeCopyStdMD, storeFillMemoMenu, storeInsertXml, storeMergeDoc, storeMoveDocContentHere, storeNoteBox_fastnote, storeNoteBox_keep, storeNoteBox_noteAreaText, storeNoteBox_pin, storeNoteBox_recentText, storeNoteBox_selectedNotebook, storeNoteBox_selectedNoteType, storeOpenRefsClick, storeOpenRefsMenu, storeRefreshStaticBkLnk, tag2RefBoxCheckbox, tag2RefSearchLnk, tag2RefSearchRef, tag_to_ref_add_card, tag_to_ref_add_pinyin, tomato_clocks, tomato_clocks_change_bg, tomato_clocks_change_bg_dark, tomato_clocks_force_dialog, tomato_clocks_force_notice, tomato_clocks_opacity, tomato_clocks_position_right, tomatoClockCheckbox, toolbarBoxCheckbox, toolbarEN2CHBtn, toolbarlocatedoc, toolbarrefreshVr, toolbarspacerepeat, toolbarTidy, userID, userToken, mindWireWidth, cssSuperBlockBorder, commentBoxAddTime, commentBoxAddKeepText, cardPrioritySetPriInterval, foldTypes, foldTypesSuperBlock, foldTypesBLOCKQUOTE, foldTypesNODE_LIST, foldTypesNODE_TABLE, foldTypesNODE_HEADING, tomato_clocks_audio, exportPath, exportIntervalSec, exportCleanFiles, markdownExportBoxCheckbox, exportWhiteList, exportBlackList, markdownExportPics, exportIntervalSecOn, exportCleanFilesOn, floatingballEnable, floatingballDocList, floatingballKeyboardList, floatingballDocMenu, prefixArticlesEnable, prefixArticlesMenu, dailyNoteMoveLeaveLnk, readingAdd2DocName, prefixArticlesSoftLimit, fastNoteBoxDocPrefix, commentBoxSaveUnderDoc, floatingballDocTabMenu, prefixArticlesTagsShow, exportPathWin, cardBoxSettingsShow, cardBoxCardtab, foldTypesNODE_listITEM, deleteBlocksMenu, toolbarTidyExt, superRefBoxCheckBox, superRefBoxGlobalFixMenu, superRefBoxGlobalLnkMenu, blockEditorMenu, blockEditorBox, exportWL4All } from "./libs/stores";
import { dbBkBox } from "./DbBkBox";
import { graphBox } from "./GraphBox";
import { resetKey, verifyKeyTomato } from "./libs/user";
import { commentBox } from "./CommentBox";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { cozeSearchBox } from "./CozeSearchBox";
import { addSelectionButton, exportAsOneFile, mergeDocMenuListener } from "./exportFiles";
import { getDocTracer } from "./libs/docUtils";
import { addFoldCmd, addFoldingAttrBarBtns } from "./fold";
import { winHotkey } from "./libs/winHotkey";
import { mindWire } from "./MindWire";
import { markdownExportBox } from "./MarkdownExportBox";
import { loadFloatingBall } from "./FloatingBall";
import { setGlobal } from "stonev5-utils";
import { initPrefixArticles } from "./PrefixArticles";
import { mount } from "svelte";
import { superRefBox } from "./SuperRefBox";
import { blockEditor } from "./BlockEditor";

function loadStore(plugin: BaseTomatoPlugin) {
    userToken.load(plugin);
    userID.load(plugin);
    blockEditorBox.load(plugin);
    blockEditorMenu.load(plugin);
    superRefBoxCheckBox.load(plugin);
    superRefBoxGlobalLnkMenu.load(plugin);
    superRefBoxGlobalFixMenu.load(plugin);
    toolbarTidyExt.load(plugin);
    deleteBlocksMenu.load(plugin);
    foldTypesNODE_listITEM.load(plugin);
    cardBoxSettingsShow.load(plugin);
    cardBoxCardtab.load(plugin);
    floatingballDocTabMenu.load(plugin);
    prefixArticlesTagsShow.load(plugin);
    commentBoxSaveUnderDoc.load(plugin);
    fastNoteBoxDocPrefix.load(plugin);
    prefixArticlesSoftLimit.load(plugin);
    readingAdd2DocName.load(plugin);
    dailyNoteMoveLeaveLnk.load(plugin);
    prefixArticlesMenu.load(plugin);
    prefixArticlesEnable.load(plugin);
    floatingballDocMenu.load(plugin);
    floatingballKeyboardList.load(plugin);
    floatingballDocList.load(plugin);
    floatingballEnable.load(plugin);
    markdownExportPics.load(plugin);
    exportCleanFilesOn.load(plugin);
    exportIntervalSecOn.load(plugin);
    exportBlackList.load(plugin);
    exportWL4All.load(plugin);
    exportWhiteList.load(plugin);
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
    commentBoxAddKeepText.load(plugin);
    foldTypes.load(plugin);
    commentBoxAddTime.load(plugin);
    mindWireColorfull.load(plugin);
    mindWireWidth.load(plugin);
    cssSuperBlockBorder.load(plugin);
    mindWireLine.load(plugin);
    hideVIP.load(plugin);
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
    cardPriorityBoxPostponeCardMenu.load(plugin);
    cardPriorityBoxPriorityMenu.load(plugin);
    cardPriorityBoxSpradDelayMenu.load(plugin);
    cssRefStyle.load(plugin);
    showDocAttrs.load(plugin);
    cssNattyList.load(plugin);
    cssListBackgound.load(plugin);
    cssRefSquareBrackets.load(plugin);
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
    graphClick2Locate.load(plugin);
    tomatoClockCheckbox.load(plugin);
    tomato_clocks.load(plugin);
    tomato_clocks_force_dialog.load(plugin);
    tomato_clocks_force_notice.load(plugin);
    tomato_clocks_change_bg.load(plugin);
    tomato_clocks_change_bg_dark.load(plugin);
    tomato_clocks_position_right.load(plugin);
    tomato_clocks_opacity.load(plugin);
    toolbarBoxCheckbox.load(plugin);
    toolbarEN2CHBtn.load(plugin);
    toolbarTidy.load(plugin);
    readingPointBoxCheckbox.load(plugin);
    readingPointWithEnv.load(plugin);
    readingTopBar.load(plugin);
    readingShowAllFolders.load(plugin);
    readingAdd2Card.load(plugin);
    readingSaveFile.load(plugin);
    readingDialog.load(plugin);
    cardBoxCheckbox.load(plugin);
    cardBoxAddConcepts.load(plugin);
    cardBoxSpradEvenlyPostpone.load(plugin);
    cardPriorityBoxCheckbox.load(plugin);
    cardPriorityBoxAutoHide.load(plugin);
    auto_card_priority.load(plugin);
    card_priority_slider_hide.load(plugin);
    card_priority_stopBtn_hide.load(plugin);
    cpBoxCheckbox.load(plugin);
    linkBoxAttrIconOnHide.load(plugin);
    linkBoxSyncBlock.load(plugin);
    linkBoxSyncHref.load(plugin);
    linkBoxSyncRef.load(plugin);
    linkBoxSyncBlockAuto.load(plugin);
    linkBoxCheckbox.load(plugin);
    linkBoxLnkTitle.load(plugin);
    linkBoxUseLnkOrRef.load(plugin);
    dailyNoteBoxCheckbox.load(plugin);
    dailyNoteGoToBottom.load(plugin);
    dailyNoteMoveToBottom.load(plugin);
    dailyNoteCopySimple.load(plugin);
    dailyNoteCopyAnchorText.load(plugin);
    dailyNoteCopyUseRef.load(plugin);
    dailyNoteCopyUpdateBG.load(plugin);
    dailyNoteCopyInsertPR.load(plugin);
    dailyNoteCopyShowPath.load(plugin);
    dailyNoteCopyComment.load(plugin);
    dailyNoteCopyFlashCard.load(plugin);
    markdownExportBoxCheckbox.load(plugin);
    imgOverlayCheckbox.load(plugin);
    backLinkBottomBoxCheckbox.load(plugin);
    back_link_max_size.load(plugin);
    back_link_mention_count.load(plugin);
    back_link_default_off.load(plugin);
    back_link_dailynote_off.load(plugin);
    back_link_refresh_off.load(plugin);
    back_link_more_btns.load(plugin);
    back_link_goto_bottom_btn.load(plugin);
    back_link_concept_fold.load(plugin);
    back_link_copy.load(plugin);
    back_link_move_to_dailynote.load(plugin);
    back_link_remove_refs.load(plugin);
    back_link_embed.load(plugin);
    back_link_ref.load(plugin);
    back_link_move_here.load(plugin);
    back_link_move_with_backlink.load(plugin);
    back_link_show_floatUI.load(plugin);
    back_link_protyle_height.load(plugin);
    back_link_show_path.load(plugin);
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
    commentBoxForwardRef.load(plugin);
    commentBoxBackwardRef.load(plugin);
    commentBoxVirtualRef.load(plugin);
    commentBoxAddFlashCard.load(plugin);
    commentBoxAddUnderline.load(plugin);
    commentBoxShowID.load(plugin);
    commentBoxStaticOutlink.load(plugin);

    storeNoteBox_selectedNoteType.load(plugin, plugin.settingCfg);
    storeNoteBox_keep.load(plugin, plugin.settingCfg);
    storeNoteBox_pin.load(plugin, plugin.settingCfg);
    storeNoteBox_recentText.load(plugin, plugin.settingCfg);
    storeNoteBox_noteAreaText.load(plugin, plugin.settingCfg);
    storeNoteBox_selectedNotebook.load(plugin, plugin.settingCfg);
    storeNoteBox_fastnote.load(plugin, plugin.settingCfg);
}

export const tomatoSettingsOpenHK = winHotkey("ctrl+;", "tomato settings 2025-5-27 14:02:33", "", () => tomatoI18n.番茄工具箱配置)

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
            window.tomato_zZmqus5PtYRi.utils = utils;
            window.tomato_zZmqus5PtYRi.siyuan = siyuan;
            window.tomato_zZmqus5PtYRi.timeUtil = timeUtil;
            window.tomato_zZmqus5PtYRi.events = events;
            window.tomato_zZmqus5PtYRi.tools = tools;
            window.tomato_zZmqus5PtYRi.plugin = plugin;
            window.tomato_zZmqus5PtYRi.pluginInstance = this;
            window.tomato_zZmqus5PtYRi.pluginID = this.id;
            window.tomato_zZmqus5PtYRi.pluginConfig = this.settingCfg;
            loadStore(this);
            setGlobal(TomatoPluginConfig, this.settingCfg)
            return this.settingCfg;
        });
        utils.tryFixCfg(this.name, STORAGE_SETTINGS);
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
        const getTitle = (version: string) => {
            const help = document.createElement("button") as HTMLButtonElement;
            help.setAttribute('onclick', 'window.location.href = "https://awx9773btw.feishu.cn/docx/IWPcd438yoL3C6xHC0xcOXDKnmh?from=from_copylink"')
            help.classList.add("b3-button")
            help.classList.add("b3-button--text")
            help.textContent = 'Help帮助'

            const log = document.createElement("button") as HTMLButtonElement;
            log.setAttribute('onclick', 'window.location.href = "https://awx9773btw.feishu.cn/docx/KekbdZ6Ozo4LLHxAGsncGTKJnff?from=from_copylink"')
            log.classList.add("b3-button")
            log.classList.add("b3-button--text")
            log.textContent = 'LOG日志'

            const save = document.createElement("button") as HTMLButtonElement;
            save.setAttribute('onclick', 'globalThis.tomato_zZmqus5PtYRi.save()')
            save.classList.add("b3-button")
            save.classList.add("b3-button--outline")
            save.textContent = tomatoI18n.保存并退出;

            const div = document.createElement("div") as HTMLDivElement;
            div.appendChild(document.createTextNode("v" + version + "t"));
            div.appendChild(help);
            div.appendChild(log);
            div.appendChild(save);
            div.style.display = "flex"
            div.style.flexDirection = "row"
            div.style.justifyContent = "space-between"
            div.style.flexWrap = "nowrap"
            div.style.width = "100%"
            return div;
        }

        const dm = new DestroyManager();
        const id = newID();
        const dialog = new Dialog({
            title: getTitle(this.pluginSpec?.version).outerHTML,
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : "700px",
            height: events.isMobile ? "180svw" : "700px",
            destroyCallback: () => {
                dm.destroyBy("1")
            },
            hideCloseIcon: true,
        });
        const d = mount(IndexConf, {
            target: dialog.element.querySelector("#" + id),
            props: {
                plugin: this,
                dm,
            }
        });
        dm.add("1", () => { dialog.destroy() })
        dm.add("2", () => { d.destroy() })
    }

    async onLayoutReady() {
        await this.taskCfg;

        clearInterval(setGlobal("tomato index", setInterval(() => {
            const id = utils.Siyuan?.user?.userId;
            if (id && userID.get() !== id) {
                userID.write(id);
            }
        }, 2000)));

        if (userID.get()) {
            resetKey();
            await verifyKeyTomato();
        }

        awaysExitFocusStore.load(this);
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

        loadFloatingBall();
        addSelectionButton();
        mergeDocMenuListener();
        exportAsOneFile();
        addFoldCmd(this);
        addFoldingAttrBarBtns()
        loadCss();
        await schedule.onload();
        await cardBox.onload(this);
        await cardPriorityBox.onload(this);
        await cpBox.onload(this);
        await linkBox.onload(this);
        await imgOverlayBox.onload(this);
        await backLinkBottomBox.onload(this);
        await mixBox.onload(this);
        await tag2RefBox.onload(this)
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

    onload() {
        this.initCfg();
        this.addIcons(ICONS);
        events.onload(this);
        tomatoI18n.init();

        this.setting = new Setting({
            confirmCallback: () => {
                this.saveData(STORAGE_SETTINGS, this.settingCfg);
                window.location.reload();
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

        this.eventBus.on(EventType.click_blockicon, this.blockIconEventBindThis);
        utils.getPluginSpec(this.name).then(sp => {
            this.pluginSpec = sp
        });

        this.addTopBar({
            icon: "iconSettingsTomato",
            title: tomatoSettingsOpenHK.langText() + tomatoSettingsOpenHK.w(),
            position: "left",
            callback: () => {
                this.openSettings();
            },
        })

        initPrefixArticles();
        tomatoClock.onload(this);
        dailyNoteBox.onload(this);
        toolbarBox.onload(this);
        readingPointBox.onload(this);
        noteBox.onload(this);
        graphBox.onload(this);
        commentBox.onload(this);
    }

    onunload() {
        linkBox.onunload();
        cardPriorityBox.onunload();
        toolbarBox.onunload();
        tag2RefBox.onunload();
        listBox.onunload();
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
