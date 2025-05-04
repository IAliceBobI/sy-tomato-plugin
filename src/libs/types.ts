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


