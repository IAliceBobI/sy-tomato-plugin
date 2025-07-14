import { TOperation, Config } from "siyuan";
import { Siyuan } from "./utils";

export const SPACE = "　";
export const WEB_SPACE = "&nbsp;";
export const WEB_ZERO_SPACE = "\u200B";
export const CUSTOM_RIFF_DECKS = "custom-riff-decks";
export const DATA_NODE_ID = "data-node-id";
export const UPDATED = "updated";
export const DATA_NODE_INDEX = "data-node-index";
export const BLOCK_REF = "block-ref";
export const DATA_ID = "data-id";
export const VIRTUAL_BLOCK_REF = "virtual-block-ref";
export const DATA_TYPE = "data-type";
export const DATA_SUBTYPE = "data-subtype";
export const PROTYLE_WYSIWYG_SELECT = "protyle-wysiwyg--select";
export const IDLen = 20;
export const TOMATO_CONTROL_ELEMENT = "tomato-control-card-priority";
export const TOMATO_CONTROL_SYNC = "tomato-control-sync";
export const TOMATO_BK_IGNORE = "tomato-bk-ignore";
export const TOMATO_BK_STATIC = "custom-tomato-bk-static";
export const STATICLINK = "custom-staticlink";
export const READINGPOINT = "custom-tomato-readingpoint";
export const ClassActive = 'layout__wnd--active';
export const DocAttrShowKey = "tomato-virtual-doc-attr"
export const DATA_AV_ID = "data-av-id"
export const TOMATO_ATTR_BAR = "tomato_attr_bar"
export const COMMENT_SUPERBLOCK_FOLD = "custom-comment-superblock-fold"
export const TomatoPluginInstance = "TomatoPluginInstance 2025-06-14 16:33:26"
export const TomatoPluginConfig = "TomatoPluginConfig 2025-06-22 09:33:00"
export const ProgressivePluginInstance = "ProgressivePluginInstance 2025-06-14 16:33:21"
export const ProgressivePluginConfig = "ProgressivePluginConfig 2025-06-22 09:33:04"

export const settingStyle = (txt: string) => {
    return `<span style="color:var(--b3-font-color11)">${txt}</span>`;
};

export const BlockTypeContent: readonly string[] = [
    "h", "p", "c", "m", "t",
];

export const BlockTypeContainer: readonly string[] = [
    "l", "i", "b", "s", "d",
];

export const BlockTypeNoContent: readonly string[] = [
    "l", "i", "b", "s",
    "html", "query_embed",
    "av", "ial", "iframe",
    "widget", "tb", "video", "audio",
];

// var typeAbbrMap = map[string]string{
// 	// 块级元素
// 	"NodeDocument":         "d",
// 	"NodeHeading":          "h",
// 	"NodeList":             "l",
// 	"NodeListItem":         "i",
// 	"NodeCodeBlock":        "c",
// 	"NodeMathBlock":        "m",
// 	"NodeTable":            "t",
// 	"NodeBlockquote":       "b",
// 	"NodeSuperBlock":       "s",
// 	"NodeParagraph":        "p",
// 	"NodeHTMLBlock":        "html",
// 	"NodeBlockQueryEmbed":  "query_embed",
// 	"NodeAttributeView":    "av",
// 	"NodeKramdownBlockIAL": "ial",
// 	"NodeIFrame":           "iframe",
// 	"NodeWidget":           "widget",
// 	"NodeThematicBreak":    "tb",
// 	"NodeVideo":            "video",
// 	"NodeAudio":            "audio",
// 	// 行级元素
// 	"NodeText":     "text",
// 	"NodeImage":    "img",
// 	"NodeLinkText": "link_text",
// 	"NodeLinkDest": "link_dest",
// 	"NodeTextMark": "textmark",
// }

export const FloatingBallNotVIPLimit = 3;
export const FloatingBallDocType_tab = { txt: "页签tab", id: 1 };
export const FloatingBallDocType_dialog = { txt: "对话框dialog", id: 2 };
export const FloatingBallDocType_float = { txt: "悬浮窗float", id: 3 };
export const FloatingBallDocType_autoclose = { txt: "对话框2dialog2", id: 4 };

export enum BlockNodeEnum {
    DATA_HREF = "data-href",
    BLOCK_REF = "block-ref",
    NODE_PARAGRAPH = "NodeParagraph",
    NODE_HEADING = "NodeHeading",
    NODE_DOCUMENT = "NodeDocument",
    NODE_TABLE = "NodeTable",
    NODE_LIST = "NodeList",
    NODE_LIST_ITEM = "NodeListItem",
    NODE_CODE_BLOCK = "NodeCodeBlock",
    NODE_MATH_BLOCK = "NodeMathBlock",
    NODE_BLOCKQUOTE = "NodeBlockquote",
    NODE_SUPER_BLOCK = "NodeSuperBlock",
    NODE_HTML_BLOCK = "NodeHTMLBlock",
    NODE_BLOCK_QUERY_EMBED = "NodeBlockQueryEmbed",
    NODE_ATTRIBUTE_VIEW = "NodeAttributeView",
    NODE_KRAMDOWN_BLOCK_IAL = "NodeKramdownBlockIAL",
    NODE_IFRAME = "NodeIFrame",
    NODE_WIDGET = "NodeWidget",
    NODE_THEMATIC_BREAK = "NodeThematicBreak",
    NODE_VIDEO = "NodeVideo",
    NODE_AUDIO = "NodeAudio",
    NODE_TEXT = "NodeText",
    NODE_IMAGE = "NodeImage",
    NODE_LINK_TEXT = "NodeLinkText",
    NODE_LINK_DEST = "NodeLinkDest",
    NODE_TEXT_MARK = "NodeTextMark",
}

export const MarkKey = "custom-progmark"; // for doc
export const RefIDKey = "custom-progref"; // for content
export const TEMP_CONTENT = "插件管理勿改managedByPluginDoNotModify";
export const MarkBookKey = `book#${TEMP_CONTENT}`;
export const PDIGEST_CTIME = "custom-pdigest-ctime";
export const PDIGEST_LAST_ID = "custom-pdigest-last-id";
export const PDIGEST_INDEX = "custom-pdigest-index";
export const PDIGEST_PARENT_ID = "custom-pdigest-parent-id";
export const BOOK_WRITING = "custom-book-writing";
export const BOOK_CLUE = "custom-book-clue";
export const BOOK_BUTTON = "custom-book-button";
export const IN_PIECE_REF = "custom-in-piece-ref";
export const PROG_ORIGIN_TEXT = "custom-prog-origin-text";
export const PROG_PIECE_PREVIOUS = "custom-prog-piece-previous";
export const REF_HIERARCHY = "custom-ref-hierarchy";
export const ORIGIN_HPATH = "custom-origin-hpath";
export const REF_HPATH = "custom-ref-hpath";
export const PARAGRAPH_INDEX = "custom-paragraph-index";
export const IN_BOOK_INDEX = "custom-in-book-index";
export const CARD_PRIORITY = "custom-card-priority";
export const CARD_PRIORITY_STOP = "custom-card-priority-stop";
export const PROG_KEY_NOTE = "custom-prog-key-note";
export const TOMATO_LINE_THROUGH = "custom-tomato-line-through";
export const LinkBoxDocLinkIAL = "custom-linkboxdoclinkial";
export const SY_READONLY = "custom-sy-readonly";
export const CONTENT_EDITABLE = "contenteditable";
export const TOMATO_IDEA_QUEUE = "custom-tomato-idea-queue";
export const DATABASE_BACKLINK = "custom-database-backlink";
export const DATABASE_BACKLINK_AVID = "custom-database-backlink-avID";
export const DATABASE_BACKLINK_PKID = "custom-database-backlink-PKID";
export const DATABASE_BACKLINK_ContentID = "custom-database-backlink-ContentID";
export const DATABASE_BACKLINK_mSelectID = "custom-database-backlink-mSelectID";
export const DATABASE_BACKLINK_viewID = "custom-database-backlink-viewID";
export const DATABASE_BACKLINK_updatedID = "custom-database-backlink-updatedID" as AttrKey;
export const DATABASE_BACKLINK_createdID = "custom-database-backlink-createdID";
export const FrontEnds = Object.freeze(["all", "desktop", "desktop-window", "mobile", "browser-desktop", "browser-mobile"])

export enum WsActionTypes {
    transactions = "transactions",
    syncMergeResult = "syncMergeResult",
    readonly = "readonly",
    setConf = "setConf",
    progress = "progress",
    setLocalStorageVal = "setLocalStorageVal",
    rename = "rename",
    unmount = "unmount",
    removeDoc = "removeDoc",
    statusbar = "statusbar",
    downloadProgress = "downloadProgress",
    txerr = "txerr",
    syncing = "syncing",
    backgroundtask = "backgroundtask",
    refreshtheme = "refreshtheme",
    openFileById = "openFileById"
}

export abstract class TomatoI18nABCMAX {
    conf: Config.IConf | {
        appearance: {
            lang: "ar_SA" | "pt_BR"
        }
    };
    init() {
        this.conf = Siyuan.config
    }
    get isEN() {
        return this.conf.appearance.lang == "en_US";
    }
}


export interface TransactionData {
    timestamp: number;
    doOperations: DoOperation[];
    undoOperations: DoOperation[];
}

export interface DoOperation {
    action: TOperation;
    data: any;
    id: string;
    parentID: string;
    previousID: string;
    nextID: string;
    retData: any;
    blockIDs: any;
    deckID: string;
    avID: string;
    srcIDs: any;
    isDetached: boolean;
    name: string;
    type: string;
    format: string;
    keyID: string;
    rowID: string;
    isTwoWay: boolean;
    backRelationKeyID: string;
}

export interface SiyuanType {
    config: Config.IConf;
    user: SiyuanUser;
    dialogs: any[];
    notebooks: SiyuanNotebook[];
    storage: any;
    layout: SiyuanLayout;
    "zIndex": any;
    "transactions": any;
    "reqIds": any;
    "backStack": any;
    "blockPanels": any;
    "ctrlIsPressed": any;
    "altIsPressed": any;
    "ws": any;
    "languages": any;
    "menus": any;
    "emojis": any;
    "shiftIsPressed": any;
    "coordinates": any;
}

interface SiyuanLayout {
    "layout": any;
    "centerLayout": any;
    "leftDock": any;
    "rightDock": any;
    "bottomDock": any;
}

export interface SiyuanNotebook {
    id: string;
    name: string;
    icon: string;
    sort: number;
    sortMode: number;
    closed: boolean;
    newFlashcardCount: number;
    dueFlashcardCount: number;
    flashcardCount: number;
}

interface SiyuanUser {
    userId: string;
    userName: string;
    userAvatarURL: string;
    userHomeBImgURL: string;
    userTitles: SiyuanUserTitle[];
    userIntro: string;
    userNickname: string;
    userCreateTime: string;
    userSiYuanProExpireTime: number;
    userToken: string;
    userTokenExpireTime: string;
    userSiYuanRepoSize: number;
    userSiYuanPointExchangeRepoSize: number;
    userSiYuanAssetSize: number;
    userTrafficUpload: number;
    userTrafficDownload: number;
    userTrafficAPIGet: number;
    userTrafficAPIPut: number;
    userTrafficTime: number;
    userSiYuanSubscriptionPlan: number;
    userSiYuanSubscriptionStatus: number;
    userSiYuanSubscriptionType: number;
    userSiYuanOneTimePayStatus: number;
}

interface SiyuanUserTitle {
    name: string;
    desc: string;
    icon: string;
}