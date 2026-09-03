// 「右键菜单管理」区注册表（□4）：全量列出插件注册的右键菜单项，按功能模块分组。
// checkbox 语义统一为「勾=显示」：有独立开关 store 的项直接绑 store（与各功能区开关
// 双向同步，同一数据两个视图）；无开关项读写 hiddenMenuItems 隐藏集（唯一入口）。
// key 与 menuManager.addIfVisible 用的 key 严格一致（winHotkey langKey 或 m.<模块>.<语义>）。
// 新增菜单项时在此补行；分组标题走 tomatoI18n（无则新增 key）。
import { tomatoI18n } from "../tomatoI18n";
import {
    blockEditorBox, blockEditorMenu, bk启用禁用文档的底部反链menu, cardBoxSuperCard, cardPriorityBoxCheckbox,
    cardPriorityBoxPostponeCardMenu, cardPriorityBoxPriorityMenu, cardPriorityBoxSpradDelayMenu, commentBoxMenu,
    cozeSearchMenuShow, dailyNoteCopyMenu, dailyNoteGoToBottomMenu, dbBkBoxRefreshMenu, deleteBlocksMenu,
    floatingballDocMenu, floatingballDocTabMenu, floatingballEnable, graphBoxCheckbox, graph打开块关系图Menu,
    graph定位到图中的节点Menu, imgBoxShowMenu, linkBoxBilinkMenu, mindWireCheckbox, mindWireDocMenu,
    mindWireGlobalMenu, mixBoxPinyin, pairBarEntryMenu, prefixArticlesMenu, readingAddDeleteMenu,
    readingAddJumpMenu, readingAddRPmenu, storeCopyStdMD, storeFillMemoMenu, storeInsertXml, storeMergeDoc,
    storeMoveDocContentHere, storeOpenRefsMenu, storeRefreshStaticBkLnk, superRefBoxGlobalFixMenu,
    superRefBoxGlobalLnkMenu, tag2RefSearchLnk, tag2RefSearchRef, aiBoxMenuShow,
} from "./stores";
import { DailyNoteBox移动内容到dailynote } from "../DailyNoteBox";
import { CommentBox添加批注 } from "../CommentBox";
import { CardBox用选中的行创建超级块超级块制卡取消制卡 } from "../CardBox";
import { CardPriorityBox分散推迟闪卡 } from "../CardPriorityBox";
import { LinkBoxbilink, LinkBox查看所有同步位置 } from "../LinkBox";
import { SuperRefBox全局加固引用, SuperRefBox全局修复引用 } from "../SuperRefBox";
import { Tag2RefBox模糊查找引用Ref, Tag2RefBox模糊查找引用Lnk } from "../Tag2RefBox";
import { BK启用禁用文档的底部反链 } from "../BackLinkBottomBox";
import { MixBox复制文档为标准Markdown, MixBox定位所有引用Menu, MixBox锁定内容, MixBox将选择文字与其拼音加入文档的别名 } from "../MixBox";
import { CpBox批量删除大量连续内容块 } from "../CpBox";
import { PrefixArticles前缀文档树 } from "../PrefixArticles";
import { BlockEditor打开编辑器 } from "../BlockEditor";
import { ReadingPointBox设置阅读点, ReadingPointBox跳到当前文档的阅读点, ReadingPointBox删除当前文档的阅读点 } from "../ReadingPointBox";
import { AIBoxHotkey } from "../AIBox";
import { DbBkBox刷新数据库反链 } from "../DbBkBox";
import { FloatingBall添加文档, FloatingBallTab添加文档 } from "../FloatingBall";
import { GraphBox定位到图中的节点, GraphBox打开块关系图 } from "../GraphBox";
import { MindWire启用或禁用思维导线, MindWire启用或禁用文档思维导线 } from "../MindWire";
import { PairBar触发 } from "../PairBarBox";

export interface ManagedMenuItem {
    key: string;
    label: () => string;
    /** 有独立开关的项绑它（checkbox 读写 store）；缺省走 hiddenMenuItems 隐藏集 */
    store?: { get(): boolean; set(v: boolean): void };
    /** 功能区总开关层（onload/事件入口整段 return 的那种）：勾选态须合成它，
     * 勾选时一并打开（否则功能区关着时勾了菜单项也不出现，管理区失去恢复入口） */
    master?: { get(): boolean; set(v: boolean): void };
}

export interface MenuManageGroup {
    title: () => string;
    items: ManagedMenuItem[];
}

export const MENU_MANAGE_GROUPS: MenuManageGroup[] = [
    {
        title: () => tomatoI18n.日记,
        items: [
            { key: "moveBlock2today", label: () => DailyNoteBox移动内容到dailynote.langText(), store: dailyNoteGoToBottomMenu },
            { key: "DailyNoteBox复制到dailynote", label: () => tomatoI18n.复制到dailynote, store: dailyNoteCopyMenu },
            { key: "DailyNoteBox复制到dailynoteNewFile", label: () => tomatoI18n.复制到dailynoteNewFile, store: dailyNoteCopyMenu },
        ],
    },
    {
        title: () => tomatoI18n.批注,
        items: [
            { key: "comment box", label: () => CommentBox添加批注.langText(), store: commentBoxMenu },
        ],
    },
    {
        title: () => tomatoI18n.闪卡,
        items: [
            { key: "addFlashCard", label: () => CardBox用选中的行创建超级块超级块制卡取消制卡.langText(), store: cardBoxSuperCard },
            { key: "m.cardPriority.setPri", label: () => tomatoI18n.为闪卡设置优先级, master: cardPriorityBoxCheckbox },
            { key: "m.cardPriority.stop", label: () => tomatoI18n.推迟与取消推迟, master: cardPriorityBoxCheckbox },
            { key: "cardPrioritySet", label: () => tomatoI18n.修改文档中闪卡优先级, store: cardPriorityBoxPriorityMenu },
            { key: "delay all cards", label: () => tomatoI18n.推迟闪卡, store: cardPriorityBoxPostponeCardMenu },
            { key: "delay all cards spread on x days", label: () => CardPriorityBox分散推迟闪卡.langText(), store: cardPriorityBoxSpradDelayMenu },
        ],
    },
    {
        title: () => tomatoI18n.互链与引用,
        items: [
            { key: "bilink", label: () => LinkBoxbilink.langText(), store: linkBoxBilinkMenu },
            { key: "list refs show all place", label: () => LinkBox查看所有同步位置.langText() },
            { key: "SuperRefBox全局加固引用", label: () => SuperRefBox全局加固引用.langText(), store: superRefBoxGlobalLnkMenu },
            { key: "SuperRefBox修复文档引用", label: () => SuperRefBox全局修复引用.langText(), store: superRefBoxGlobalFixMenu },
            { key: "模糊查找引用Ref", label: () => Tag2RefBox模糊查找引用Ref.langText(), store: tag2RefSearchRef },
            { key: "模糊查找引用Lnk", label: () => Tag2RefBox模糊查找引用Lnk.langText(), store: tag2RefSearchLnk },
            { key: "BK启用禁用文档的底部反链", label: () => BK启用禁用文档的底部反链.langText(), store: bk启用禁用文档的底部反链menu },
        ],
    },
    {
        title: () => tomatoI18n.文档整理,
        items: [
            { key: "复制文档为标准Markdown", label: () => MixBox复制文档为标准Markdown.langText(), store: storeCopyStdMD },
            { key: "定位所有引用Menu", label: () => MixBox定位所有引用Menu.langText(), store: storeOpenRefsMenu },
            { key: "锁定内容", label: () => MixBox锁定内容.langText(), store: storeFillMemoMenu },
            { key: "将选择文字与其拼音加入文档的别名", label: () => MixBox将选择文字与其拼音加入文档的别名.langText(), store: mixBoxPinyin },
            { key: "m.mixBox.moveDocHere", label: () => tomatoI18n.把文档内容移动到这里, store: storeMoveDocContentHere },
            { key: "m.mixBox.mergeDoc", label: () => tomatoI18n.合并文档到这里, store: storeMergeDoc },
            { key: "m.mixBox.refreshStaticBk", label: () => tomatoI18n.刷新静态反链, store: storeRefreshStaticBkLnk },
            { key: "m.mixBox.delStaticBk", label: () => tomatoI18n.删除静态反链, store: storeRefreshStaticBkLnk },
            { key: "m.mixBox.insertXml", label: () => tomatoI18n.插入空的脑图流程图文件, store: storeInsertXml },
            { key: "deleteBlocks", label: () => CpBox批量删除大量连续内容块.langText(), store: deleteBlocksMenu },
            { key: "m.cpBox.clean2SubDoc", label: () => tomatoI18n.清理文档内容到子文档, master: deleteBlocksMenu },
            { key: "m.cpBox.cleanAll", label: () => tomatoI18n.清理文档内容, master: deleteBlocksMenu },
            { key: "前缀文档树", label: () => PrefixArticles前缀文档树.langText(), store: prefixArticlesMenu },
            { key: "BlockEditor打开编辑器", label: () => BlockEditor打开编辑器.langText(), store: blockEditorMenu, master: blockEditorBox },
        ],
    },
    {
        title: () => tomatoI18n.阅读点.replace(/[:：]$/, ""),
        items: [
            { key: "addBookmark", label: () => ReadingPointBox设置阅读点.langText(), store: readingAddRPmenu },
            { key: "gotoBookmark", label: () => ReadingPointBox跳到当前文档的阅读点.langText(), store: readingAddJumpMenu },
            { key: "deleteBookmark", label: () => ReadingPointBox删除当前文档的阅读点.langText(), store: readingAddDeleteMenu },
        ],
    },
    {
        title: () => tomatoI18n.图片,
        items: [
            { key: "m.imgBox.copyAsImage", label: () => tomatoI18n.复制为图片, store: imgBoxShowMenu },
            { key: "m.imgOverlay.add", label: () => tomatoI18n.添加图片遮挡层 },
        ],
    },
    {
        title: () => tomatoI18n.智能问答,
        items: [
            { key: "人工智能", label: () => AIBoxHotkey.langText(), store: aiBoxMenuShow },
            { key: "coze", label: () => "coze" + tomatoI18n.知识库问答, store: cozeSearchMenuShow },
        ],
    },
    {
        title: () => tomatoI18n.数据库反链,
        items: [
            { key: "dbbkrefresh", label: () => DbBkBox刷新数据库反链.langText(), store: dbBkBoxRefreshMenu },
            { key: "m.dbBk.moveDown", label: () => tomatoI18n.将选中的内容移到下边 },
        ],
    },
    {
        title: () => tomatoI18n.导出,
        items: [
            { key: "m.export.whiteList", label: () => tomatoI18n.添加到导出工作空间的白名单 },
            { key: "m.export.blackList", label: () => tomatoI18n.添加到导出工作空间的黑名单 },
            { key: "m.exportFiles.mergeMove", label: () => tomatoI18n.合并为单个文件 + " · " + tomatoI18n.移动 },
            { key: "m.exportFiles.mergeCopy", label: () => tomatoI18n.合并为单个文件 + " · " + tomatoI18n.复制 },
            { key: "m.exportFiles.exportAll", label: () => tomatoI18n.导出所有文档到单个文件 },
            { key: "m.exportFiles.importMD", label: () => tomatoI18n.导入markdownOrText },
        ],
    },
    {
        title: () => tomatoI18n.悬浮球,
        items: [
            { key: "绑定文档到悬浮按钮", label: () => FloatingBall添加文档.langText(), store: floatingballDocMenu, master: floatingballEnable },
            { key: "FloatingBallTab添加文档", label: () => FloatingBallTab添加文档.langText(), store: floatingballDocTabMenu, master: floatingballEnable },
        ],
    },
    {
        title: () => tomatoI18n.思维导线,
        items: [
            { key: "MindWire global", label: () => MindWire启用或禁用思维导线.langText(), store: mindWireGlobalMenu, master: mindWireCheckbox },
            { key: "MindWire doc", label: () => MindWire启用或禁用文档思维导线.langText(), store: mindWireDocMenu, master: mindWireCheckbox },
        ],
    },
    {
        title: () => tomatoI18n.块关系图,
        items: [
            { key: "graphLocateNode", label: () => GraphBox定位到图中的节点.langText(), store: graph定位到图中的节点Menu, master: graphBoxCheckbox },
            { key: "graphLocateNode open", label: () => GraphBox打开块关系图.langText(), store: graph打开块关系图Menu, master: graphBoxCheckbox },
        ],
    },
    {
        title: () => PairBar触发.langText(),
        items: [
            { key: "pairBarTrigger", label: () => PairBar触发.langText(), store: pairBarEntryMenu },
        ],
    },
];
