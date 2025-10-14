export function isSortType(value: any): value is SortType {
    return Object.values(SortType).includes(value);
}

export enum SortType {
    NameASC = "0",          // 0：文件名字母升序     
    NameDESC = "1",         // 1：文件名字母降序     
    UpdatedASC = "2",       // 2：文件更新时间升序        
    UpdatedDESC = "3",      // 3：文件更新时间降序        
    AlphanumASC = "4",      // 4：文件名自然数升序        
    AlphanumDESC = "5",     // 5：文件名自然数降序        
    Custom = "6",           // 6：自定义排序     
    RefCountASC = "7",      // 7：引用数升序        
    RefCountDESC = "8",     // 8：引用数降序        
    CreatedASC = "9",       // 9：文件创建时间升序        
    CreatedDESC = "10",     // 10：文件创建时间降序        
    SizeASC = "11",         // 11：文件大小升序     
    SizeDESC = "12",        // 12：文件大小降序        
    SubDocCountASC = "13",  // 13：子文档数升序            
    SubDocCountDESC = "14", // 14：子文档数降序            
    FileTree = "15",        // 15：使用文档树排序规则        
    Unassigned = "256",     // 256：未指定排序规则，按照笔记本优先于文档树获取排序规则        
}

/**
 * Replace type filtering
 */
export interface IUILayoutTabSearchConfigReplaceTypes {
    /**
     * Replace hyperlinks
     * @default false
     */
    aHref?: boolean;
    /**
     * Replace hyperlink anchor text
     * @default true
     */
    aText?: boolean;
    /**
     * Replace hyperlink title
     * @default true
     */
    aTitle?: boolean;
    /**
     * Replace inline code
     * @default false
     */
    code?: boolean;
    /**
     * Replace code blocks
     * @default false
     */
    codeBlock?: boolean;
    /**
     * Replace document title
     * @default true
     */
    docTitle?: boolean;
    /**
     * Replace italic elements
     * @default true
     */
    em?: boolean;
    /**
     * Replace HTML blocks
     * @default false
     */
    htmlBlock?: boolean;
    /**
     * Replace image addresses
     * @default false
     */
    imgSrc?: boolean;
    /**
     * Replace image anchor text
     * @default true
     */
    imgText?: boolean;
    /**
     * Replace image titles
     * @default true
     */
    imgTitle?: boolean;
    /**
     * Replace inline formulas
     * @default false
     */
    inlineMath?: boolean;
    /**
     * Replace inline memos
     * @default true
     */
    inlineMemo?: boolean;
    /**
     * Replace block refs
     * @default false
     */
    blockRef?: boolean;
    /**
     * Replace file annotation refs
     */
    fileAnnotationRef?: boolean;
    /**
     * Replace kdb elements
     * @default true
     */
    kbd?: boolean;
    /**
     * Replace mark elements
     * @default true
     */
    mark?: boolean;
    /**
     * Replace formula blocks
     * @default false
     */
    mathBlock?: boolean;
    /**
     * Replace delete elements
     * @default true
     */
    s?: boolean;
    /**
     * Replace bold elements
     * @default true
     */
    strong?: boolean;
    /**
     * Replace subscript elements
     * @default true
     */
    sub?: boolean;
    /**
     * Replace superscript elements
     * @default true
     */
    sup?: boolean;
    /**
     * Replace tag elements
     * @default true
     */
    tag?: boolean;
    /**
     * Replace rich text elements
     * @default true
     */
    text?: boolean;
    /**
     * Replace underline elements
     * @default true
     */
    u?: boolean;
}

/**
 * Search type filtering
 */
export interface IUILayoutTabSearchConfigTypes {
    /**
     * Search results contain audio blocks
     * @default false
     */
    audioBlock: boolean;
    /**
     * Search results contain blockquote blocks
     * @default false
     */
    blockquote: boolean;
    /**
     * Search results contain code blocks
     * @default false
     */
    codeBlock: boolean;
    /**
     * Search results contain database blocks
     * @default false
     */
    databaseBlock: boolean;
    /**
     * Search results contain document blocks
     * @default false
     */
    document: boolean;
    /**
     * Search results contain embed blocks
     * @default false
     */
    embedBlock: boolean;
    /**
     * Search results contain heading blocks
     * @default false
     */
    heading: boolean;
    /**
     * Search results contain html blocks
     * @default false
     */
    htmlBlock: boolean;
    /**
     * Search results contain iframe blocks
     * @default false
     */
    iframeBlock: boolean;
    /**
     * Search results contain list blocks
     * @default false
     */
    list: boolean;
    /**
     * Search results contain list item blocks
     * @default false
     */
    listItem: boolean;
    /**
     * Search results contain math blocks
     * @default false
     */
    mathBlock: boolean;
    /**
     * Search results contain paragraph blocks
     * @default false
     */
    paragraph: boolean;
    /**
     * Search results contain super blocks
     * @default false
     */
    superBlock: boolean;
    /**
     * Search results contain table blocks
     * @default false
     */
    table: boolean;
    /**
     * Search results contain video blocks
     * @default false
     */
    videoBlock: boolean;
    /**
     * Search results contain widget blocks
     * @default false
     */
    widgetBlock: boolean;
}
