// https://app.quicktype.io/?l=ts

type eventCB = (eventType: string, detail: any) => any;
type wsCB = (detail: WsMain) => any;

type Func = (...args: any[]) => any;

type LinkElementAttr = { isThisDoc: boolan }
type LinkItem = { conceptTree: string[], text: string, count: number, id: string, dataNodeIDSet: Set<string>, blockIDs: Set<string>, attrs: LinkElementAttr };
type RefCollector = Map<string, LinkItem>;
type Overlays = { overlays: Overlay[], originWidth: number }
type Overlay = { left: number, top: number, width: number, height: number, angle: number, cID: string };


type TSK = keyof TomatoSettings

type TomatoSettings = {
    cardBoxSuperCard: boolean,
    dailyNotetopbarright: boolean,
    dailyNotetopbarleft: boolean,
    ProgressiveViewAllMenu: boolean,
    ProgressiveJumpMenu: boolean,
    piecesmenu: boolean,
    ProgressiveStart2learn: boolean,
    send2compareNoteEnable: boolean,
    send2removeNoteColor: boolean,
    send2exctractNoteEnable: boolean,
    send2exctract2bottomEnable: boolean,
    PieceMovingUp: boolean,
    PieceMovingDown: boolean,
    digestmenu: boolean,
    PieceSummaryBoxmenu: boolean,
    toolbarlocatedoc: boolean,
    toolbarrefreshVr: boolean,
    toolbarspacerepeat: boolean,
    tag2RefSearchLnk: boolean,
    tag2RefSearchRef: boolean,
    readingAddJumpMenu: boolean,
    readingAddDeleteMenu: boolean,
    dbBkBoxRefreshMenu: boolean,
    readingAddRPmenu: boolean,
    bkenableAndDisablemenu: boolean,
    linkBoxBilinkMenu: boolean,
    graphlocatetographMenu: boolean,
    graphopengraphMenu: boolean,
    graphAddTopbarIcon: boolean,
    dailyNoteCopyMenu: boolean,
    dailyNoteGoToBottomMenu: boolean,
    commentBoxMenu: boolean,
    cardPriorityBoxPriorityMenu: boolean,
    cardPriorityBoxSpradDelayMenu: boolean,
    cardPriorityBoxPostponeCardMenu: boolean,
    cozeSearchMenuShow: boolean,
    imgBoxShowMenu: boolean,
    aiBoxMenuShow: boolean,
    digest2Trace: boolean,
    digest2dailycard: boolean,
    words2dailycard: boolean,
    doubleClick2DigestDesktop: boolean,
    doubleClick2Digest: boolean,
    merg2newBookEnable: boolean,
    makeCardEnable: boolean,
    makeCardHereEnable: boolean,
    send2dailyCardEnable: boolean,
    send2dailyCardNoRefEnable: boolean,
    multilineMarkEnable: boolean,
    getAllPieceNotesEnable: boolean,
    btnSplitByPunctuationsList: boolean,
    btnSplitByPunctuationsListCheck: boolean,
    btnSplitByPunctuations: boolean,
    btnIgnoreBook: boolean,
    btnDeleteExit: boolean,
    btnDelCard: boolean,
    btnSaveCard: boolean,
    btnDeleteNext: boolean,
    btnDeleteBack: boolean,
    btnOpenFlashcardTab: boolean,
    btnNextBook: boolean,
    btnStop: boolean,
    btnFullfilContent: boolean,
    btnCleanOriginText: boolean,
    btnNext: boolean,
    btnPrevious: boolean,
    btnViewContents: boolean,
    cardAppendTime: boolean,
    cardUnderPiece: boolean,
    openCardsOnOpenPiece: boolean,
    hideBtnsInFlashCard: boolean,
    markOriginTextBG: boolean,
    markOriginText: boolean,
    summary2dailynote: boolean,
    pieceNoBacktraceLink: boolean,
    digestNoBacktraceLink: boolean,
    flashcardUseLink: boolean,
    flashcardNotebook: string,
    windowOpenStyle: string,
    flashcardMultipleLnks: boolean,
    flashcardAddRefs: boolean,
    //------------------
    graphClick2Locate: boolean,
    graphMaxAllBlocks: string,
    graphMaxPBlocks: string,
    graphBoxCheckbox: string,
    userToken: string,
    userID: string,
    cssListBackgound: boolean,
    cssNattyList: boolean,
    cssRefStyle: string,
    keepLazyLoadStore: string,
    awaysExitFocusStore: string,
    cssRefAsTags: string,
    showDocAttrs: boolean,
    cssShowHomeEndIcon: boolean,
    cssHomeEndIconLeft: boolean,
    cssRefSquareBrackets: boolean,
    cssShowMemo: boolean,
    cssShowFlashCardBlank: boolean,
    cssFlashThoughts: boolean,
    flashThoughtUseDialog: boolean,
    tomatoClockCheckbox: boolean,
    readingPointBoxCheckbox: boolean,
    readingPointWithEnv: boolean,
    readingTopBar: boolean,
    readingShowAllFolders: boolean,
    readingAdd2Card: boolean,
    readingSaveFile: boolean,
    readingDialog: boolean,
    cardBoxCheckbox: boolean,
    cardBoxAddConcepts: boolean,
    cardBoxSpradEvenlyPostpone: boolean,
    cardRemoveBoxCheckbox: boolean,
    cardAddListBoxCheckbox: boolean,
    cardPriorityBoxCheckbox: boolean,
    cardPriorityBoxAutoHide: boolean,
    card_priority_slider_hide: boolean,
    card_priority_stopBtn_hide: boolean,
    cpBoxCheckbox: boolean,
    linkBoxCheckbox: boolean,
    linkBoxLnkTitle: boolean,
    linkBoxSyncBlock: boolean,
    linkBoxSyncRef: boolean,
    linkBoxSyncHref: boolean,
    linkBoxSyncBlockAuto: boolean,
    linkBoxUseLnkOrRef: boolean,
    dailyNoteBoxCheckbox: boolean,
    dailyNoteGoToBottom: boolean,
    dailyNoteMoveToBottom: boolean,
    dailyNoteCopySimple: boolean,
    dailyNoteCopyAnchorText: boolean,
    dailyNoteCopyUseRef: boolean,
    dailyNoteCopyUpdateBG: boolean,
    dailyNoteCopyInsertPR: boolean,
    dailyNoteCopyShowPath: boolean,
    dailyNoteCopyComment: boolean,
    dailyNoteCopyFlashCard: boolean,
    dbBkBoxCheckbox: boolean,
    dbBkBoxMaxBacklinkSize: number,
    dbBkBoxHideDatetime: boolean,
    imgOverlayCheckbox: boolean,
    imgBoxCheckbox: boolean,
    backLinkBottomBoxCheckbox: boolean,
    mixBoxCheckbox: boolean,
    mixBoxPinyin: boolean,
    mixBoxAddAlias: boolean,
    storeOpenRefsClick: boolean,
    storeCopyStdMD: boolean,
    storeOpenRefsMenu: boolean,
    storeMergeDoc: boolean,
    storeMoveDocContentHere: boolean,
    storeRefreshStaticBkLnk: boolean,
    storeInsertXml: boolean,
    storeFillMemoMenu: boolean,
    writingBoxCheckbox: boolean,
    tag2RefBoxCheckbox: boolean,
    toolbarBoxCheckbox: boolean,
    toolbarEN2CHBtn: boolean,
    toolbarTidy: boolean,
    cmdBlockBoxCheckbox: boolean,
    listBoxCheckbox: boolean,
    noteBoxCheckbox: boolean,
    noteBoxAllKinds: string,
    aiBoxCheckbox: boolean,
    aiBoxPrompts: boolean,
    cozeSearchBoxCheckbox: boolean,
    cozeSearchSpaceID: string,
    cozeSearchKnowledgeID: string,
    cozeSearchOauthTokenID: string,
    cozeSearchAppID: string,
    cozeSearchDoubaoID: string,
    "daily-note-box-id": string,
    "tomato-clocks": string,
    tomato_clocks_force_dialog: boolean,
    "tomato-clocks-force-notice": string,
    "tomato-clocks-change-bg": string,
    "tomato-clocks-change-bg-dark": string,
    tomato_clocks_position_right: string,
    tomato_clocks_opacity: string,
    "back-link-max-size": number,
    "back-link-mention-count": number,
    "back-link-default-off": boolean,
    "back-link-dailynote-off": boolean,
    back_link_refresh_off: boolean,
    back_link_more_btns: boolean,
    back_link_goto_bottom_btn: boolean,
    back_link_concept_fold: boolean,
    back_link_copy: boolean,
    back_link_move_to_dailynote: boolean,
    back_link_remove_refs: boolean,
    back_link_embed: boolean,
    back_link_ref: boolean,
    back_link_move_here: boolean,
    back_link_move_with_backlink: boolean,
    back_link_show_floatUI: boolean,
    back_link_protyle_height: string,
    back_link_show_path: boolean,
    back_link_passup_heading: boolean,
    back_link_passup_quote: boolean,
    back_link_passup_super: boolean,
    "tag-to-ref-add-card": boolean,
    "tag-to-ref-add-pinyin": boolean,
    "auto-card-priority": boolean,
    "dont-break-list": boolean,
    "ai-return-insert-place": number,
    "ernie-bot-4-ak": string,
    "ernie-bot-4-sk": string,
    "avoiding-cloud-synchronization-conflicts": boolean,
    "flash-thoughts-2-top": boolean,
    "flash-thoughts-target-file": string,
    storeNoteBox_selectedNoteType: string,
    storeNoteBox_keep: boolean,
    storeNoteBox_pin: boolean,
    storeNoteBox_recentText: string[],
    storeNoteBox_noteAreaText: string,
    storeNoteBox_selectedNotebook: string,
    fastNoteBoxCheckbox: boolean,
    fastNoteBoxDisableBK: boolean,
    fastNoteBoxAdd2Flashcard: boolean,
    fastNoteBoxDelAfterCreating: boolean,
    commentBoxCheckbox: boolean,
    commentBoxMaxProtyleHeight: number,
    commentBoxForwardRef: boolean,
    commentBoxBackwardRef: boolean,
    commentBoxVirtualRef: boolean,
    commentBoxAddFlashCard: boolean,
    commentBoxAddUnderline: boolean,
    commentBoxShowID: boolean,
    commentBoxStaticOutlink: boolean,
    linkBoxAttrIconOnHide: boolean,
};

type AttrType = {
    title?: string,
    alias?: string, // comma separated
    memo?: string,
    updated?: string,
    id?: string,
    name?: string,
    bookmark?: string,
    scroll?: string,
    style?: string,
    md?: string,// for 'Writing' plugin
    content?: string,// for 'Writing' plugin
    "custom-tomato-ref-hpath"?: string,
    "tomato-bk-ignore"?: string,
    "data-position"?: string,
    "data-type"?: string,
    "data-subtype"?: string,
    "tomato-data-node-id"?: string,
    "data-id"?: string,
    "protyle-breadcrumb__item"?: string,
    "custom-progmark"?: string,
    "custom-progref"?: string,
    "custom-prog-key-note"?: string,
    "custom-in-piece-ref"?: string,
    "custom-prog-origin-text"?: string,
    "custom-sy-readonly"?: string,
    "custom-tomato-readonly"?: string,
    "custom-riff-decks"?: string,
    "custom-linkboxdoclinkial"?: string,
    "custom-attr-pic-overlay"?: string,
    "custom-tomatomention"?: string,
    "custom-off-tomatobacklink"?: string,
    "custom-card-priority"?: string,
    "custom-card-priority-stop"?: string,
    "custom-card-priority-id"?: string,
    "custom-card-priority-doc-id"?: string,
    "custom-ref-hierarchy"?: string,
    "custom-origin-hpath"?: string,
    "custom-ref-hpath"?: string,
    "custom-pinyin"?: string,
    "custom-category"?: string,
    "custom-paragraph-index"?: string,
    "custom-in-book-index"?: string,
    "custom-tomato-line-blur"?: string,
    "custom-tomato-line-through"?: string,
    "custom-tomato-readingpoint"?: string,
    "custom-tomato-rp-content-hash"?: string,
    "custom-prog-key-no-color"?: string,
    "custom-pdigest-ctime"?: string,//PDIGEST_CTIME
    "custom-pdigest-last-id"?: string,//PDIGEST_LAST_ID
    "custom-pdigest-parent-id"?: string,//PDIGEST_PARENT_ID
    "custom-pdigest-index"?: string,//PDIGEST_INDEX
    "custom-book-writing"?: string,//BOOK_WRITING
    "custom-book-clue"?: string,//BOOK_CLUE
    "custom-book-single-card"?: string,
    "custom-book-prompt"?: string,
    "custom-tomatoClockVedioVersion"?: string,
    "custom-tomatoUpdated"?: string,
    "custom-bkDisabledIDs"?: string,
    "custom-bkColCount"?: string,
    "custom-bkSortBy"?: string,
    "custom-bkSavedQueries"?: string,
    "custom-database-backlink"?: string,
    "custom-database-backlink-avID"?: string,
    "custom-database-backlink-PKID"?: string,
    "custom-database-backlink-ContentID"?: string,
    "custom-database-backlink-mSelectID"?: string,
    "custom-database-backlink-viewID"?: string,
    "custom-database-backlink-updatedID"?: string,
    "custom-database-backlink-createdID"?: string,
    "custom-tomato-idea-time"?: string,
    "custom-tomato-idea-interval"?: string,
    "custom-coze-doc-md5"?: string,
    "custom-coze-knowledge-file-id"?: string,
    "custom-qf-doc-md5"?: string,
    "custom-qf-knowledge-file-id"?: string,
    "custom-qf-file-id"?: string,
    "custom-fastnote"?: string,
    "custom-fastdraft"?: string,
    "custom-lnk-my-id"?: string,
    "custom-lnk-to-ids"?: string,
    "custom-bkMenDocCount"?: string,
    "custom-bkRefDocCount"?: string,
    "custom-graph-isVertical"?: string,
    "custom-super-list"?: string,
    "custom-tomato-reflink"?: string,
    "custom-sync-block-id"?: string,
    "custom-sync-block-count"?: string,
    "custom-sync-version"?: string,
    "custom-sync-origin-id"?: string,
    "custom-sync-item-id"?: string,
    "data-node-id"?: string,
    "tomato-control-card-priority"?: string,
    "custom-prog-words"?: string,
    "custom-super-card-box"?: string,
    "custom-super-card-question"?: string,
    "custom-super-card-answer"?: string,
    "custom-comment-heading"?: string,
    "custom-comment-fold"?: string,
    "custom-comment-bk-id"?: string,
    "custom-lnk-bottom"?: string,
    "fold"?: string,
    "heading-fold"?: string,
    "custom-progmark"?: string,
    "custom-doc-notes"?: string,
    "custom-progref"?: string,
    "custom-prog-piece-previous"?: string,
};

type AttrKey = keyof AttrType;

type RiffCard = { due: string, reps: number };

type BacklinkSv<T = any> = {
    bk: Backlink;
    bkDiv: HTMLElement;
    id: string;
    attrs: LinkElementAttr;
    isMention: boolean;
    isFold: boolean;
    backlink: Backlink2;
    atBottom: boolean;
    blockID: string;
    parentID?: string;
    parentType?: string;
    edit?: boolean;
    updated: string;
    sortBy: string;
    protyle: T;
    ob: MutationObserver;
    row?: Block; // commentbox用.
};

type EventsReadingPoint = { docID: string, blockID: string, title: string, time: Date };

interface PluginSpec {
    name: string;
    author: string;
    url: string;
    version: string;
    minAppVersion: string;
    backends: string[];
    frontends: string[];
    displayName: Description;
    description: Description;
    readme: Description;
    funding: Funding;
    keywords: string[];
}

interface Description {
    default: string;
    zh_CN: string;
}

interface Funding {
    openCollective: string;
    patreon: string;
    github: string;
    custom: string[];
}

interface TomatoGlobal {
    prog_zZmqus5PtYRi: {
        pluginConfig: TomatoSettings;
        save?: () => void;
    },
    tomato_zZmqus5PtYRi_doc_tracer: any;
    tomato_zZmqus5PtYRi: {
        pluginInstance: any;
        pluginID: string;
        pluginConfig: TomatoSettings;
        plugin: any;
        utils: any;
        siyuan: any;
        timeUtil: any;
        events: any;
        tools: any;
        save?: () => void;
        rmContentEmptyRefs?: () => void;
    };
}

interface ID_Time {
    id: string;
    time: string;
    interval: string;
}

type WindowOpenStyle = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "nop" | "front" | "back" | "right" | "bottom" | "move" | "peek"

interface GraphDockData<T> {
    svelte: T;
    setCanvasSize: () => void;
    locateID: (id: string) => Promise<void>;
    changeDoc: (p: IProtyle) => Promise<void>;
}

interface NodeMenu<T> {
    node?: T;
    x?: number;
    y?: number;
    canvasHeight?: number;
    canvasWidth?: number;
}

interface GraphNodeData extends Record<string, unknown> {
    text?: string;
    color?: string;
    // id?: string;
    // docID?: string;
    // plugin?: any;
}

interface WsMain {
    cmd: string;
    reqId: number;
    app: string;
    sid: string;
    pushMode: number;
    callback: string;
    code: number;
    msg: string;
    data: WsMainData;
}

interface WsMainData {
    tasks?: WsMainTask[];
    ids?: string[];
    id?: string;
    box?: string;
    path?: string;
    refText?: string;
    title?: string;
}

interface WsMainTask {
    action: string;
}

type CozeListDoc = {
    code?: number;
    document_infos?: CozeDocumentInfo[];
    msg?: string;
    total?: number;
}

type CozeDocumentInfo = {
    char_count?: number;
    chunk_strategy?: CozeChunkStrategy;
    create_time?: number;
    document_id?: string;
    filter_strategy?: CozeStrategy;
    format_type?: number;
    hit_count?: number;
    index_strategy?: CozeStrategy;
    name?: string;
    parsing_strategy?: CozeParsingStrategy;
    size?: number;
    slice_count?: number;
    source_type?: number;
    status?: number;
    type?: string;
    update_interval?: number;
    update_time?: number;
    update_type?: number;
    web_url?: string;
}

type CozeChunkStrategy = {
    chunk_type?: number;
    max_tokens?: number;
    remove_extra_spaces?: boolean;
    remove_urls_emails?: boolean;
    separator?: string;
}

type CozeStrategy = {
}

type CozeParsingStrategy = {
    image_extraction?: boolean;
    image_ocr?: boolean;
    parsing_type?: number;
    table_extraction?: boolean;
}

type CozeAddDoc = {
    docID?: string,
    docName?: string,
    cozeName?: string,
    docContent?: string,
    md5?: string,
    attrs?: AttrType,
    newAttrs?: AttrType,
    cozeDoc?: CozeDocumentInfo,
    syExists?: boolean,
    done?: boolean,
    updated?: string,
}

type ClubeEvents = {
    content?: string;
    isLocal?: boolean;
    blockID?: string;
}

type ClubeColumn = {
    title: string;
    plots: ClubeEvents[];
    show?: boolean;
    highlight?: boolean;
    new?: boolean;
}

