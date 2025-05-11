import { autoExitFocus } from "./libs/focusUtils";
import { Dialog, ICardData, Setting } from "siyuan";
import { ICONS } from "./icons";
import { linkBox } from "./LinkBox";
import { schedule } from "./Schedule";
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
import { DATA_TYPE } from "./libs/gconst";
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
import { aiBoxCheckbox, aiBoxMenuShow, aiBoxPrompts, auto_card_priority, avoiding_cloud_synchronization_conflicts, awaysExitFocusStore, back_link_concept_fold, back_link_copy, back_link_dailynote_off, back_link_default_off, back_link_embed, back_link_goto_bottom_btn, back_link_max_size, back_link_mention_count, back_link_more_btns, back_link_move_here, back_link_move_to_dailynote, back_link_move_with_backlink, back_link_passup_heading, back_link_passup_quote, back_link_passup_super, back_link_protyle_height, back_link_ref, back_link_refresh_off, back_link_remove_refs, back_link_show_floatUI, back_link_show_path, backLinkBottomBoxCheckbox, card_priority_slider_hide, card_priority_stopBtn_hide, cardBoxAddConcepts, cardBoxBuildSupCard, cardBoxCheckbox, cardBoxSpradEvenlyPostpone, cardPriorityBoxAutoHide, cardPriorityBoxCheckbox, cardPriorityBoxPostponeCardMenu, cardPriorityBoxPriorityMenu, cardPriorityBoxSpradDelayMenu, commentBoxAddFlashCard, commentBoxAddUnderline, commentBoxBackwardRef, commentBoxCheckbox, commentBoxForwardRef, commentBoxMaxProtyleHeight, commentBoxMenu, commentBoxShowID, commentBoxStaticOutlink, commentBoxVirtualRef, cozeSearchAppID, cozeSearchBoxCheckbox, cozeSearchDoubaoID, cozeSearchKnowledgeID, cozeSearchMenuShow, cozeSearchOauthTokenID, cozeSearchSpaceID, cpBoxCheckbox, cssFlashThoughts, cssHomeEndIconLeft, cssListBackgound, cssNattyList, cssRefAsTags, cssRefSquareBrackets, cssRefStyle, cssShowFlashCardBlank, cssShowHomeEndIcon, cssShowMemo, dailyNoteBoxCheckbox, dailyNoteCopy, dailyNoteCopyAnchorText, dailyNoteCopyComment, dailyNoteCopyFlashCard, dailyNoteCopyInsertPR, dailyNoteCopyShowPath, dailyNoteCopySimple, dailyNoteCopyUpdateBG, dailyNoteCopyUseRef, dailyNoteGoToBottom, dailyNoteMoveToBottom, dbBkBoxCheckbox, dbBkBoxHideDatetime, dbBkBoxMaxBacklinkSize, dont_break_list, fastNoteBoxAdd2Flashcard, fastNoteBoxCheckbox, fastNoteBoxDelAfterCreating, fastNoteBoxDisableBK, flash_thoughts_2_top, flash_thoughts_target_file, flashThoughtUseDialog, graphBoxCheckbox, graphClick2Locate, graphMaxAllBlocks, graphMaxPBlocks, imgBoxCheckbox, imgBoxShowMenu, imgOverlayCheckbox, keepLazyLoadStore, linkBoxAttrIconOnHide, linkBoxCheckbox, linkBoxLnkTitle, linkBoxSyncBlock, linkBoxSyncBlockAuto, linkBoxSyncHref, linkBoxSyncRef, linkBoxUseLnkOrRef, listBoxCheckbox, mixBoxAddAlias, mixBoxCheckbox, mixBoxPinyin, noteBoxAllKinds, noteBoxCheckbox, readingAdd2Card, readingDialog, readingPointBoxCheckbox, readingPointWithEnv, readingSaveFile, readingShowAllFolders, readingTopBar, showDocAttrs, storeCopyStdMD, storeFillMemoMenu, storeInsertXml, storeMergeDoc, storeMoveDocContentHere, storeNoteBox_fastnote, storeNoteBox_keep, storeNoteBox_noteAreaText, storeNoteBox_pin, storeNoteBox_recentText, storeNoteBox_selectedNotebook, storeNoteBox_selectedNoteType, storeOpenRefsClick, storeOpenRefsMenu, storeRefreshStaticBkLnk, tag2RefBoxCheckbox, tag_to_ref_add_card, tag_to_ref_add_pinyin, tomato_clocks, tomato_clocks_change_bg, tomato_clocks_change_bg_dark, tomato_clocks_force_dialog, tomato_clocks_force_notice, tomato_clocks_opacity, tomato_clocks_position_right, tomatoClockCheckbox, toolbarBoxCheckbox, toolbarEN2CHBtn, toolbarTidy, userID, userToken } from "./libs/stores";
import { dbBkBox } from "./DbBkBox";
import { graphBox } from "./GraphBox";
import { resetKey, verifyKeyTomato } from "./libs/user";
import { commentBox } from "./CommentBox";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { cozeSearchBox } from "./CozeSearchBox";
import { addFoldCmd, initMenuListener, mergeDocMenuListener } from "./exportFiles";
import { getDocTracer } from "./libs/docUtils";

function loadStore(plugin: BaseTomatoPlugin) {
    userToken.load(plugin);
    userID.load(plugin);
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
    cardBoxBuildSupCard.load(plugin);
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
    dailyNoteCopy.load(plugin);
    dailyNoteCopyAnchorText.load(plugin);
    dailyNoteCopyUseRef.load(plugin);
    dailyNoteCopyUpdateBG.load(plugin);
    dailyNoteCopyInsertPR.load(plugin);
    dailyNoteCopyShowPath.load(plugin);
    dailyNoteCopyComment.load(plugin);
    dailyNoteCopyFlashCard.load(plugin);
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
    mixBoxAddAlias.load(plugin);
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

export default class ThePlugin extends BaseTomatoPlugin {
    constructor(options: any) {
        super(options)
        this.loadStore = loadStore;

        if (this.global.tomato_zZmqus5PtYRi == null)
            this.global.tomato_zZmqus5PtYRi = {} as any

        this.clean()

        this.taskCfg = this.loadData(STORAGE_SETTINGS).then(async cfg => {
            this.settingCfg = cfg;
            if (!utils.isObject(this.settingCfg)) {
                this.settingCfg = {} as TomatoSettings;
            }

            this.global.tomato_zZmqus5PtYRi.utils = utils;
            this.global.tomato_zZmqus5PtYRi.siyuan = siyuan;
            this.global.tomato_zZmqus5PtYRi.timeUtil = timeUtil;
            this.global.tomato_zZmqus5PtYRi.events = events;
            this.global.tomato_zZmqus5PtYRi.tools = tools;
            this.global.tomato_zZmqus5PtYRi.plugin = plugin;
            this.global.tomato_zZmqus5PtYRi.pluginInstance = this;
            this.global.tomato_zZmqus5PtYRi.pluginID = this.id;
            this.global.tomato_zZmqus5PtYRi.pluginConfig = this.settingCfg;
            loadStore(this);
            return this.settingCfg;
        });
        utils.tryFixCfg(this.name, STORAGE_SETTINGS);
    }

    private clean() {
        this.global.tomato_zZmqus5PtYRi?.pluginInstance?.statusBarIcons?.forEach((e: HTMLElement) => {
            if (e.style) e.style.display = "none"
        });
        this.global.tomato_zZmqus5PtYRi?.pluginInstance?.topBarIcons?.forEach((e: HTMLElement) => {
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
        const id = utils.newID();
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
        const d = new IndexConf({
            target: dialog.element.querySelector("#" + id),
            props: {
                plugin: this,
                dm,
            }
        });
        dm.add("1", () => { dialog.destroy() })
        dm.add("2", () => { d.$destroy() })
    }

    async onLayoutReady() {
        await this.taskCfg;

        setInterval(() => {
            const id = utils.Siyuan?.user?.userId;
            if (id && userID.get() !== id) {
                userID.write(id);
            }
        }, 2000);

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
                        console.debug("events.addListener pluginID: ", this.id)
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

        mergeDocMenuListener();
        initMenuListener();
        addFoldCmd(this);
        loadCss();
        await schedule.onload(this);
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
        await cozeSearchBox.onload(this);
        await imgBox.onload(this);
        await fastNoteBox.onload(this);
        await dbBkBox.onload(this);
        await getDocTracer()
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
            title: tomatoI18n.番茄工具箱配置,
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

        this.eventBus.on(EventType.click_blockicon, this.blockIconEventBindThis);
        utils.getPluginSpec(this.name).then(sp => {
            this.pluginSpec = sp
        });

        this.addTopBar({
            icon: "iconSettingsTomato",
            title: tomatoI18n.番茄工具箱配置,
            position: "left",
            callback: () => {
                this.openSettings();
            },
        })

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
        commentBox.onunload();
    }

    private blockIconEvent({ detail }: any) {
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
