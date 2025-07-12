// https://app.quicktype.io/?l=ts

type BlockID = string;

interface GetNotebookConf {
    box: string;
    conf: Conf;
    name: string;
}

interface Conf {
    name: string;
    sort: number;
    icon: string;
    closed: boolean;
    refCreateSavePath: string;
    docCreateSavePath: string;
    dailyNoteSavePath: string;
    dailyNoteTemplatePath: string;
    sortMode: number;
}

interface GetBacklink2 {
    backlinks: Backlink2[];
    backmentions: Backlink2[];
    box: string;
    k: string;
    linkRefsCount: number;
    mentionsCount: number;
    mk: string;
}

interface Backlink2 {
    id: string;
    box: string;
    name: string;
    hPath: string;
    type: BacklinkType;
    nodeType: BlockNodeType;
    subType: BlockNodeSubType;
    depth: number;
    count: number;
    updated: string;
    created: string;
}

interface GetBackmentionDoc {
    backmentions: Backlink[];
}

interface GetBacklinkDoc {
    backlinks: Backlink[];
}

interface Backlink {
    dom: string;
    blockPaths: BlockPath[];
    expand: boolean;
}

interface BlockPath {
    id: string;
    name: string;
    type: BlockNodeType;
    subType: BlockNodeSubType;
    children: BlockPath[];
}

type BacklinkType = "backlink"
type BlockNodeSubType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | ""
type BlockNodeType = "block-ref" | "NodeParagraph" | "NodeHeading" | "NodeDocument" | "NodeTable" | "NodeList" | "NodeListItem" | "NodeCodeBlock" | "NodeMathBlock" | "NodeBlockquote" | "NodeSuperBlock" | "NodeHTMLBlock" | "NodeBlockQueryEmbed" | "NodeAttributeView" | "NodeKramdownBlockIAL" | "NodeIFrame" | "NodeWidget" | "NodeThematicBreak" | "NodeVideo" | "NodeAudio" | "NodeText" | "NodeImage" | "NodeLinkText" | "NodeLinkDest" | "NodeTextMark";

interface GetBlockMarkdownAndContent {
    markdown: string,
    content: string,
    id: string,
}

interface GetChildBlocks {
    id: string;
    type?: string;
    subType?: string;
    data?: any;
}

type Block = {
    alias?: string;
    titles?: Set<string>;
    box?: string;
    content?: string;
    parent_content?: string;
    created?: string;
    fcontent?: string;
    hash?: string;
    hpath?: string;
    ial?: string;
    id?: string;
    length?: number;
    markdown?: string;
    parent_markdown?: string;
    memo?: string;
    name?: string;
    parent_id?: string;
    path?: string;
    root_id?: string;
    sort?: number;
    subtype?: string;
    tag?: string;
    type?: string;
    parent_type?: string;
    updated?: string;
    idx?: number;
    attrs?: AttrType;
    parent?: Block;
    children?: Block[];
    docName?: string;
    div?: HTMLElement;
    // isInList?: boolean;
    data?: any;
    exists?: boolean;
}

type GetBlocksWordCount = {
    reqId: any;
    stat: {
        runeCount: number, wordCount: number, linkCount: number, imageCount: number, refCount: number
    }
}

type GetBlockKramdown = { id: string, kramdown: string }

type DueCard = {
    // {
    //     "deckID": "20230218211946-2kw8jgx",
    //     "cardID": "20250109104922-pco9447",
    //     "blockID": "20250109104921-jjggbpc",
    //     "lapses": 1,
    //     "reps": 6,
    //     "state": 2,
    //     "lastReview": 1751334972653,
    //     "nextDues": {
    //         "1": "5 分钟",
    //         "2": "19 天",
    //         "3": "1 个月 10 天",
    //         "4": "2 个月 30 天"
    //     }
    // }
    deckID: string;
    cardID: string;
    blockID: string;
    state: number;
    lapses: number;
    lastReview: number;
    reps: number;
    nextDues: { "1": string, "2": string, "3": string, "4": string };
}

type GetCardRet = { blocks: GetCardRetBlock[], total: number, pageCount: number };

type GetCardRetBlock = {
    // "box": "20250219094350-3vkl29a",
    box: string;
    // "path": "/20231218022724-v23ym97/20250103135032-mus0zgr/20250701094625-euwt4uo/20250705154201-8z1vngp.sy",
    path: string;
    // "hPath": "/daily card/c2025/c2025-07/c2025-07-05",
    hPath: string;
    // "id": "20250705154201-7lla2gl",
    id: string;
    // "rootID": "20250705154201-8z1vngp",
    rootID: string;
    // "parentID": "20250705154201-8z1vngp",
    parentID: string;
    // "name": "",
    name: string;
    // "alias": "",
    alias: string;
    // "memo": "",
    memo: string;
    // "tag": "",
    tag: string;
    // "content": "bb",
    content: string;
    // "fcontent": "xx",
    fcontent: string;
    // "markdown": "xx",
    markdown: string;
    // "folded": false,
    folded: boolean;
    // "type": "NodeSuperBlock",
    type: string;
    // "subType": "",
    subType: string;
    // "refText": "",
    refText: string;
    // "refs": null,
    refs: null;
    // "defID": "",
    defID: string;
    // "defPath": "",
    defPath: string;
    // "ial": {
    //     "custom-ref-hpath": "",
    //     "custom-riff-decks": "20230218211946-2kw8jgx",
    //     "custom-super-card-box": "1",
    //     "id": "20250705154201-7lla2gl",
    //     "updated": "20250705154615"
    // },
    ial: AttrType;
    // "children": null,
    children: null;
    // "depth": 0,
    depth: number;
    // "count": 0,
    count: number;
    // "sort": 30,
    sort: number;
    // "created": "",
    created: string;
    // "updated": "",
    updated: string;
    // "riffCardID": "20250705154202-21j1g1l",
    riffCardID: string;
    // "riffCard": {
    //     "due": "2025-07-11T15:43:17.0492134+08:00",
    //     "reps": 1,
    //     "lapses": 0,
    //     "state": 2,
    //     "lastReview": "2025-07-05T15:43:17.0492134+08:00"
    // }
    riffCard: RiffCard;
    attrs?: AttrType;
}

type RiffCard = {
    due: string; // "2024-02-28"
    lapses: number  // 遗忘次数
    lastReview: number  // 最后复习时间
    reps: number  // 复习次数
    state: number   // 卡片状态 0：新卡
}

type GetDueCardRet = {
    cards: DueCard[],
    unreviewedCount: number,
    unreviewedNewCardCount: number,
    unreviewedOldCardCount: number,
};

type BreadcrumbPath = {
    id: string;
    name: string;
    type: string;
    subType: string;
    children: any;
};

type Attributes = {
    block_id: string;
    box: string;
    id: string;
    name: string;
    path: string;
    root_id: string;
    type: string;
    value: string;
    exists?: boolean;
}

type Asset = {
    id: string;
    block_id: string;
    root_id: string;
    box: string;
    docpath: string,
    path: string,
    name: string,
    title: string,
    hash: string,
}

type Span = {
    id: string;
    block_id: string;
    root_id: string;
    box: string;
    path: string;
    content: string;
    markdown: string;
    type: string;
    ial: string;
}

type Ref = {
    block_id?: string;
    box?: string;
    content?: string;
    def_block_id?: string;
    def_block_parent_id?: string;
    def_block_path?: string;
    def_block_root_id?: string;
    id?: string;
    markdown?: string;
    path?: string;
    root_id?: string;
    type?: string;
    docContent?: string;
}

type DocTabInitData = {
    action: string;
    blockId: string;
    instance: string;
    mode: string;
    notebookId: string;
    rootId: string;
}

type GetDocInfo = {
    id: string;
    rootID: string;
    name: string;
    refCount: number;
    subFileCount: number;
    refIDs: any[];
    ial: Ial;
    icon: string;
}

type GetBlockInfo = {
    box: string;
    path: string;
    rootChildID: string;
    rootID: string;
    rootIcon: string;
    rootTitle: string;
}

type RetListDocTree = {
    tree: RetListDocTreeDir[]
}

type RetListDocTreeDir = {
    id: string,
    children: RetListDocTreeDir[],
    box?: string, // tomato
    path?: string, // tomato
}

type RetListDocsByPath = {
    box: string;
    files: RetListDocsByPathFile[];
    path: string;
}

type RetListDocsByPathFile = {
    path: string;
    name: string;
    icon: string;
    name1: string;
    alias: string;
    memo: string;
    bookmark: string;
    id: string;
    count: number;
    size: number;
    hSize: string;
    mtime: number;
    ctime: number;
    hMtime: string;
    hCtime: Date;
    sort: number;
    subFileCount: number;
    hidden: boolean;
    newFlashcardCount: number;
    dueFlashcardCount: number;
    flashcardCount: number;
}

type AddRiffCards = {
    created: string;
    id: string;
    name: string;
    size: number;
    updated: string;
}

type GetDocOutline = {
    id: string;
    box: string;
    name: string;
    hPath: string;
    type: string;
    nodeType: string;
    subType: string;
    blocks: GetDocOutlineBlock[];
    depth: number;
    count: number;
    updated: string;
    created: string;
}

type GetDocOutlineBlock = {
    box: string;
    path: string;
    hPath: string;
    id: string;
    rootID: string;
    parentID: string;
    name: string;
    alias: string;
    memo: string;
    tag: string;
    content: string;
    fcontent: string;
    markdown: string;
    folded: boolean;
    type: string;
    subType: string;
    refText: string;
    refs: any;
    defID: string;
    defPath: string;
    ial: any;
    children: GetDocOutlineBlock[];
    depth: number;
    count: number;
    sort: number;
    created: string;
    updated: string;
    riffCardID: string;
    riffCard: any;
}

type LsNotebook = {
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

type BaiduQFRet = { msg?: string, code?: number, data?: any }

interface RenderAttributeView {
    id: string;
    isMirror: boolean;
    name: string;
    view: RenderAttributeViewPurpleView;
    viewID: string;
    viewType: string;
    views: RenderAttributeViewViewElement[];
}

interface RenderAttributeViewPurpleView {
    id: string;
    icon: string;
    name: string;
    hideAttrViewName: boolean;
    filters: any[];
    sorts: any[];
    columns: RenderAttributeViewColumn[];
    rows: any[];
    rowCount: number;
    pageSize: number;
}

interface RenderAttributeViewColumn {
    id: string;
    name: string;
    type: string;
    icon: string;
    wrap: boolean;
    hidden: boolean;
    pin: boolean;
    width: string;
    calc: any;
    numberFormat: string;
    template: string;
}

interface RenderAttributeViewViewElement {
    hideAttrViewName: boolean;
    icon: string;
    id: string;
    name: string;
    type: string;
}

interface GetAttributeView {
    av: GetAttributeViewAV;
}

interface GetAttributeViewAV {
    spec: number;
    id: string;
    name: string;
    keyValues: GetAttributeViewKeyValue[];
    keyIDs: null;
    viewID: string;
    views: GetAttributeViewView[];
}

interface GetAttributeViewKeyValue {
    key: GetAttributeViewKey;
}

interface GetAttributeViewKey {
    id: string;
    name: string;
    type: string;
    icon: string;
    numberFormat: string;
    template: string;
}

interface GetAttributeViewView {
    id: string;
    icon: string;
    name: string;
    hideAttrViewName: boolean;
    type: string;
    table: GetAttributeViewTable;
}

interface GetAttributeViewTable {
    spec: number;
    id: string;
    columns: GetAttributeViewColumn[];
    rowIds: null;
    filters: any[];
    sorts: any[];
    pageSize: number;
}

interface GetAttributeViewColumn {
    id: string;
    wrap: boolean;
    hidden: boolean;
    pin: boolean;
    width: string;
}

type TOperation =
    "insert"
    | "update"
    | "delete"
    | "move"
    | "foldHeading"
    | "unfoldHeading"
    | "setAttrs"
    | "updateAttrs"
    | "append"
    | "insertAttrViewBlock"
    | "removeAttrViewBlock"
    | "addAttrViewCol"
    | "removeAttrViewCol"
    | "addFlashcards"
    | "removeFlashcards"
    | "updateAttrViewCell"
    | "updateAttrViewCol"
    | "updateAttrViewColTemplate"
    | "sortAttrViewRow"
    | "sortAttrViewCol"
    | "sortAttrViewKey"
    | "setAttrViewColPin"
    | "setAttrViewColHidden"
    | "setAttrViewColWrap"
    | "setAttrViewColWidth"
    | "updateAttrViewColOptions"
    | "removeAttrViewColOption"
    | "updateAttrViewColOption"
    | "setAttrViewName"
    | "doUpdateUpdated"
    | "duplicateAttrViewKey"
    | "setAttrViewColIcon"
    | "setAttrViewFilters"
    | "setAttrViewSorts"
    | "setAttrViewColCalc"
    | "updateAttrViewColNumberFormat"
    | "replaceAttrViewBlock"
    | "addAttrViewView"
    | "setAttrViewViewName"
    | "removeAttrViewView"
    | "setAttrViewViewIcon"
    | "duplicateAttrViewView"
    | "sortAttrViewView"
    | "setAttrViewPageSize"
    | "updateAttrViewColRelation"
    | "moveOutlineHeading"
    | "updateAttrViewColRollup"
    | "hideAttrViewName"
    | "setAttrViewColDate"
    | "unbindAttrViewBlock"

interface IOperation {
    action: TOperation, // move， delete 不需要传 data
    id?: string,
    blockID?: string,
    isTwoWay?: boolean, // 是否双向关联
    backRelationKeyID?: string, // 双向关联的目标关联列 ID
    avID?: string,  // av
    format?: string // updateAttrViewColNumberFormat 专享
    keyID?: string // updateAttrViewCell 专享
    rowID?: string // updateAttrViewCell 专享
    data?: any, // updateAttr 时为  { old: IObject, new: IObject }, updateAttrViewCell 时为 {TAVCol: {content: string}}
    parentID?: string
    previousID?: string
    retData?: any
    nextID?: string // insert 专享
    isDetached?: boolean // insertAttrViewBlock 专享
    ignoreFillFilter?: boolean // insertAttrViewBlock 专享
    srcIDs?: string[] // removeAttrViewBlock 专享
    srcs?: IOperationSrcs[] // insertAttrViewBlock 专享
    name?: string // addAttrViewCol 专享
    type?: TAVCol // addAttrViewCol 专享
    deckID?: string // add/removeFlashcards 专享
    blockIDs?: string[] // add/removeFlashcards 专享
}

interface IOperationSrcs {
    id: string,
    content?: string, // use when isDetached=true
    isDetached: boolean
}

type TAVCol =
    "text"
    | "date"
    | "number"
    | "relation"
    | "rollup"
    | "select"
    | "block"
    | "mSelect"
    | "url"
    | "email"
    | "phone"
    | "mAsset"
    | "template"
    | "created"
    | "updated"
    | "checkbox"
    | "lineNumber"

interface IAVCellSelectValue {
    content: string,
    color: string
}

interface IAVCellAssetValue {
    content: string,
    name: string,
    type: "file" | "image"
}

interface IAVCellValue {
    keyID?: string,
    id?: string,
    type: TAVCol,
    isDetached?: boolean,
    text?: {
        content: string
    },
    number?: {
        content?: number,
        isNotEmpty: boolean,
        format?: string,
        formattedContent?: string
    },
    mSelect?: IAVCellSelectValue[]
    mAsset?: IAVCellAssetValue[]
    block?: {
        content: string,
        id?: string
    }
    url?: {
        content: string
    }
    phone?: {
        content: string
    }
    email?: {
        content: string
    }
    template?: {
        content: string
    },
    checkbox?: {
        checked: boolean
    }
    relation?: IAVCellRelationValue
    rollup?: {
        contents?: IAVCellValue[]
    }
    date?: IAVCellDateValue
    created?: IAVCellDateValue
    updated?: IAVCellDateValue
}

interface IAVCellDateValue {
    content?: number,
    isNotEmpty?: boolean
    content2?: number,
    isNotEmpty2?: boolean
    hasEndDate?: boolean
    formattedContent?: string,
    isNotTime?: boolean // 默认 true
}

interface IAVCellRelationValue {
    blockIDs: string[]
    contents?: IAVCellValue[]
}

type TAVFilterOperator =
    "="
    | "!="
    | ">"
    | ">="
    | "<"
    | "<="
    | "Contains"
    | "Does not contains"
    | "Is empty"
    | "Is not empty"
    | "Starts with"
    | "Ends with"
    | "Is between"
    | "Is relative to today"
    | "Is true"
    | "Is false"

interface IAVFilter {
    column: string,
    operator: TAVFilterOperator,
    value: IAVCellValue,
    relativeDate?: relativeDate
    relativeDate2?: relativeDate
}

interface relativeDate {
    count: number   // 数量
    unit: number    // 单位：0: 天、1: 周、2: 月、3: 年
    direction: number   // 方向：-1: 前、0: 现在、1: 后
}

interface IAVTable extends IAVView {
    columns: IAVColumn[],
    filters: IAVFilter[],
    sorts: IAVSort[],
    rows: IAVRow[],
    rowCount: number,
    pageSize: number,
}

interface IAVView {
    name: string
    id: string
    type: string
    icon: string
    hideAttrViewName: boolean
}

type CalcOperator =
    "" |
    "Count all" |
    "Count values" |
    "Count unique values" |
    "Count empty" |
    "Count not empty" |
    "Percent empty" |
    "Percent not empty" |
    "Sum" |
    "Average" |
    "Median" |
    "Min" |
    "Max" |
    "Range" |
    "Earliest" |
    "Latest" |
    "Checked" |
    "Unchecked" |
    "Percent checked" |
    "Percent unchecked";