// 「命令开关」域注册表（featgate □1 2026-09-10）：按功能族分组列出走 commandToggles
// 门控的命令，ConfCommands.svelte 数据驱动渲染（族头总开关=全开/全关+紧凑行=开关+命令
// 名+键帽）。与 cmdGate.ts 分文件防循环 import：Box 模块只 import cmdGate 机制，本表
// import Box 模块的 winHotkey 常量——langKey/键帽/langText 单一事实源在常量，勿在此复写。
// 迁移纪律（□3~□6 铺量）：命令迁 gatedAddCommand 时同步入表，无键帽命令 hk 缺省；
// 不走 commandToggles 的不进表（设置入口命令=自指死锁豁免；速记搬运=shorthandRelayEnabled
// 联动在速记域）。开关语义：逐条开关与族总开关叠加——族关=命令全不注册（逐条开关无效），
// 族开+某条关=该条不注册。
import { tomatoI18n } from "../tomatoI18n";
import { commandToggles } from "./stores";
import { tomatoBigReloadHK } from "./entryHotkeys";
import {
    ToolBarBox间隔重复,
    ToolBarBox刷新虚拟引用,
    ToolBarBox突出定位文档,
    ToolBarBox整理assets下的图片视频音频,
} from "../ToolbarBox";
import {
    MixBox删除块以及闪卡,
    MixBox内容制表,
    MixBox使内容模糊,
    MixBox跳转到剪贴板中ID的块,
    MixBox添加一个flag书签,
    MixBox删除所有flag书签,
    MixBox空格隔开的所有内容都转为引用,
    MixBox锁定内容,
    MixBox收集当前文档与子文档所有的未完成任务,
    MixBox列出当前文档与子文档中没被引用的文档,
    MixBox将选择文字与其拼音加入文档的别名,
    MixBox将选择文字加入文档的别名,
    MixBox定位所有引用Menu,
    MixBox复制文档为标准Markdown,
    MixBox复制文档为纯文本,
} from "../MixBox";
import {
    CardBox用选中的行创建超级块超级块制卡取消制卡,
    CardBox取消当前文档内所有闪卡,
    CardBox复习时删除当前闪卡,
    CardBox删除内容块,
    CardBox闪卡复习时打开闪卡设置,
    CardBox复习时跳过当前闪卡,
    CardBox清理所有失效的闪卡,
    CardBox定位闪卡,
} from "../CardBox";
import {
    CardPriorityBox修改文档中闪卡优先级,
    CardPriorityBox分散推迟闪卡,
    CardPriorityBox推迟闪卡,
    CardPriority恢复所有暂停的闪卡,
} from "../CardPriorityBox";
import {
    DailyNoteBox上一个日志,
    DailyNoteBox下一个日志,
    DailyNoteBox移动内容到dailynote,
    DailyNoteBox复制到dailynote,
    DailyNoteBox复制到dailynoteNewFile,
} from "../DailyNoteBox";
import {
    ReadingPointBox设置阅读点,
    ReadingPointBox跳到当前文档的阅读点,
    ReadingPointBox删除当前文档的阅读点,
    ReadingPointBox查看阅读点,
    ReadingPointBox显示或隐藏悬浮球,
} from "../ReadingPointBox";
import {
    GraphBox定位到图中的节点,
    GraphBox打开块关系图,
} from "../GraphBox";
import {
    MindWire启用或禁用思维导线,
    MindWire启用或禁用文档思维导线,
    MindWire划词连线,
} from "../MindWire";
import {
    LinkBoxbilink,
    LinkBox链接到块底部,
    LinkBox修复双向链接,
    LinkBox删除双向链接,
    LinkBox双向互链选择块,
    LinkBox双向互链创建往返链,
    LinkBox嵌入互链选择,
    LinkBox嵌入互链创建,
    LinkBox关联两个块选择,
    LinkBox关联两个块创建,
    LinkBox互相插入引用于下方选择,
    LinkBox互相插入引用于下方创建,
    LinkBox查看所有同步位置,
    LinkBox同步块选择,
    LinkBox同步块创建,
} from "../LinkBox";
import {
    CpBox批量删除大量连续内容块,
    CpBox批量移动大量连续内容块,
    CpBox批量复制大量连续内容块,
} from "../CpBox";
import { PairBar触发 } from "../PairBarBox";
import {
    Tag2RefBox模糊查找引用Ref,
    Tag2RefBox模糊查找引用Lnk,
} from "../Tag2RefBox";
import {
    SuperRefBox全局加固引用,
    SuperRefBox全局修复引用,
} from "../SuperRefBox";
import { DbBkBox刷新数据库反链 } from "../DbBkBox";
import { BK启用禁用文档的底部反链 } from "../BackLinkBottomBox";
import {
    CommentBox添加批注,
    CommentBox刷新文档正引,
} from "../CommentBox";
import {
    MarkdownExport全量导出,
    MarkdownExport增量导出,
    MarkdownExport确保导出符合配置,
} from "../MarkdownExportBox";
import { PrefixArticles前缀文档树 } from "../PrefixArticles";
import {
    ListBox取消勾选当前文档所有已完成的todo任务,
    ListBox删除当前文档所有已完成的todo任务,
} from "../ListBox";
import { BlockEditor打开编辑器 } from "../BlockEditor";
import { ImgBoxHotKey } from "../ImgBox";
import {
    FloatingBall添加文档,
    FloatingBallTab添加文档,
} from "../FloatingBall";
import {
    FastNoteBox创建快速笔记,
    FastNoteBox打开最后一个笔记,
    FastNoteBox草稿切换,
} from "../FastNoteBox";

/** HotkeyCap 的最小契约（winHotkey 返回超集，结构兼容） */
export interface GatedHK {
    m: string;
    w(): string;
    langKey: string;
}

export interface GatedCommandItem {
    /** 命令 langKey=commandToggles 键=keymap 持久化锚（与注册点严格一致） */
    langKey: string;
    label: () => string;
    /** winHotkey 常量（键帽显示+点击改键）；无快捷键命令缺省 */
    hk?: GatedHK;
}

export interface GatedCommandGroup {
    id: string;
    label: () => string;
    items: GatedCommandItem[];
}

/** 陈旧键清理（featgate □6 review P2-B 挪 onload 期）：petal 残留的退役命令键（不在
 *  注册表=命令已不存在）挂载即清，防未来 langKey 复用被静默禁用——不依赖用户访问
 *  「命令开关」域（ConfCommands 懒挂载）。set 进内存 cfg 随下次保存落盘（幂等）。 */
export function pruneStaleCommandToggles() {
    const cur = commandToggles.get();
    const regKeys = new Set(COMMAND_GROUPS.flatMap(g => g.items.map(i => i.langKey)));
    const stale = Object.keys(cur).filter(k => cur[k] === false && !regKeys.has(k));
    if (stale.length) {
        const next = { ...cur };
        for (const k of stale) delete next[k];
        commandToggles.set(next);
    }
    return stale;
}

// 试点两组（featgate □1）；后续杂项/闪卡/日记/阅读点/可视化/块编辑互链/小族按期追加
export const COMMAND_GROUPS: GatedCommandGroup[] = [
    {
        id: "general",
        label: () => tomatoI18n.通用,
        items: [
            { langKey: "openTomatoBuyDialog", label: () => tomatoI18n.打开番茄工具箱购买页 },
            { langKey: tomatoBigReloadHK.langKey, label: () => tomatoBigReloadHK.langText(), hk: tomatoBigReloadHK },
        ],
    },
    {
        id: "toolbar",
        label: () => tomatoI18n.顶栏工具,
        items: [
            { langKey: ToolBarBox整理assets下的图片视频音频.langKey, label: () => ToolBarBox整理assets下的图片视频音频.langText(), hk: ToolBarBox整理assets下的图片视频音频 },
            { langKey: ToolBarBox间隔重复.langKey, label: () => ToolBarBox间隔重复.langText(), hk: ToolBarBox间隔重复 },
            { langKey: ToolBarBox刷新虚拟引用.langKey, label: () => ToolBarBox刷新虚拟引用.langText(), hk: ToolBarBox刷新虚拟引用 },
            { langKey: ToolBarBox突出定位文档.langKey, label: () => ToolBarBox突出定位文档.langText(), hk: ToolBarBox突出定位文档 },
        ],
    },
    // 杂项组（featgate □3）：MixBox 15 条全量迁入；与杂项域（ConfMiscDomain）行共存——
    // 彼处=命令展示+键帽改键，此处=逐条开关（集中管理拍板）
    {
        id: "misc",
        label: () => tomatoI18n.杂项,
        items: [
            { langKey: MixBox删除块以及闪卡.langKey, label: () => MixBox删除块以及闪卡.langText(), hk: MixBox删除块以及闪卡 },
            { langKey: MixBox内容制表.langKey, label: () => MixBox内容制表.langText(), hk: MixBox内容制表 },
            { langKey: MixBox使内容模糊.langKey, label: () => MixBox使内容模糊.langText(), hk: MixBox使内容模糊 },
            { langKey: MixBox跳转到剪贴板中ID的块.langKey, label: () => MixBox跳转到剪贴板中ID的块.langText(), hk: MixBox跳转到剪贴板中ID的块 },
            { langKey: MixBox添加一个flag书签.langKey, label: () => MixBox添加一个flag书签.langText(), hk: MixBox添加一个flag书签 },
            { langKey: MixBox删除所有flag书签.langKey, label: () => MixBox删除所有flag书签.langText(), hk: MixBox删除所有flag书签 },
            { langKey: MixBox空格隔开的所有内容都转为引用.langKey, label: () => MixBox空格隔开的所有内容都转为引用.langText(), hk: MixBox空格隔开的所有内容都转为引用 },
            { langKey: MixBox锁定内容.langKey, label: () => MixBox锁定内容.langText(), hk: MixBox锁定内容 },
            { langKey: MixBox收集当前文档与子文档所有的未完成任务.langKey, label: () => MixBox收集当前文档与子文档所有的未完成任务.langText(), hk: MixBox收集当前文档与子文档所有的未完成任务 },
            { langKey: MixBox列出当前文档与子文档中没被引用的文档.langKey, label: () => MixBox列出当前文档与子文档中没被引用的文档.langText(), hk: MixBox列出当前文档与子文档中没被引用的文档 },
            { langKey: MixBox将选择文字与其拼音加入文档的别名.langKey, label: () => MixBox将选择文字与其拼音加入文档的别名.langText(), hk: MixBox将选择文字与其拼音加入文档的别名 },
            { langKey: MixBox将选择文字加入文档的别名.langKey, label: () => MixBox将选择文字加入文档的别名.langText(), hk: MixBox将选择文字加入文档的别名 },
            { langKey: MixBox定位所有引用Menu.langKey, label: () => MixBox定位所有引用Menu.langText(), hk: MixBox定位所有引用Menu },
            { langKey: MixBox复制文档为标准Markdown.langKey, label: () => MixBox复制文档为标准Markdown.langText(), hk: MixBox复制文档为标准Markdown },
            { langKey: MixBox复制文档为纯文本.langKey, label: () => MixBox复制文档为纯文本.langText(), hk: MixBox复制文档为纯文本 },
        ],
    },
    // 闪卡组（featgate □4）：CardBox 8+CardPriorityBox 5；字面量 langKey 命令闪卡组
    // 一条（resume doc cards 无默认键）+日记组一条（dailyNoteReview）label 直取同 i18n
    // 键；分散推迟的 vip 门在回调内保留。两参 winHotkey 常量（无 langText 回调）label
    // 一律 i18n 直写勿调 .langText()——运行时崩且 Svelte 5 生产包静默（□4 实锤，
    // e2e 行数断言为正式防线；铺量期第二次应验→ConfCommands 消费端加 fail-soft）
    {
        id: "flashcard",
        label: () => tomatoI18n.闪卡,
        items: [
            { langKey: CardBox用选中的行创建超级块超级块制卡取消制卡.langKey, label: () => CardBox用选中的行创建超级块超级块制卡取消制卡.langText(), hk: CardBox用选中的行创建超级块超级块制卡取消制卡 },
            { langKey: CardBox取消当前文档内所有闪卡.langKey, label: () => CardBox取消当前文档内所有闪卡.langText(), hk: CardBox取消当前文档内所有闪卡 },
            { langKey: CardBox复习时删除当前闪卡.langKey, label: () => CardBox复习时删除当前闪卡.langText(), hk: CardBox复习时删除当前闪卡 },
            { langKey: CardBox删除内容块.langKey, label: () => CardBox删除内容块.langText(), hk: CardBox删除内容块 },
            { langKey: CardBox闪卡复习时打开闪卡设置.langKey, label: () => CardBox闪卡复习时打开闪卡设置.langText(), hk: CardBox闪卡复习时打开闪卡设置 },
            { langKey: CardBox复习时跳过当前闪卡.langKey, label: () => CardBox复习时跳过当前闪卡.langText(), hk: CardBox复习时跳过当前闪卡 },
            { langKey: CardBox清理所有失效的闪卡.langKey, label: () => CardBox清理所有失效的闪卡.langText(), hk: CardBox清理所有失效的闪卡 },
            { langKey: CardBox定位闪卡.langKey, label: () => CardBox定位闪卡.langText(), hk: CardBox定位闪卡 },
            // 下列三条 winHotkey 为两参形态（无 langText 回调——原注册点即直写 i18n），
            // label 直取 i18n 勿调 .langText()（ConfFlashcard 先例同款）
            { langKey: CardPriorityBox修改文档中闪卡优先级.langKey, label: () => tomatoI18n.修改文档中闪卡优先级, hk: CardPriorityBox修改文档中闪卡优先级 },
            { langKey: CardPriorityBox分散推迟闪卡.langKey, label: () => CardPriorityBox分散推迟闪卡.langText(), hk: CardPriorityBox分散推迟闪卡 },
            { langKey: CardPriorityBox推迟闪卡.langKey, label: () => tomatoI18n.推迟闪卡, hk: CardPriorityBox推迟闪卡 },
            { langKey: CardPriority恢复所有暂停的闪卡.langKey, label: () => tomatoI18n.恢复所有暂停的闪卡, hk: CardPriority恢复所有暂停的闪卡 },
            { langKey: "resume doc cards", label: () => tomatoI18n.恢复文档暂停闪卡 },
        ],
    },
    // 日记组（featgate □4）：6 条；复制到新文件保留 !dailyNoteCopySimple 条件叠加
    // （两道 gate 并存：族内开关+既有形态开关）；dailyNoteReview 无默认键
    {
        id: "dailynote",
        label: () => tomatoI18n.日记,
        items: [
            { langKey: "dailyNoteReview", label: () => tomatoI18n.回顾日记 },
            { langKey: DailyNoteBox上一个日志.langKey, label: () => DailyNoteBox上一个日志.langText(), hk: DailyNoteBox上一个日志 },
            { langKey: DailyNoteBox下一个日志.langKey, label: () => DailyNoteBox下一个日志.langText(), hk: DailyNoteBox下一个日志 },
            { langKey: DailyNoteBox移动内容到dailynote.langKey, label: () => DailyNoteBox移动内容到dailynote.langText(), hk: DailyNoteBox移动内容到dailynote },
            { langKey: DailyNoteBox复制到dailynote.langKey, label: () => DailyNoteBox复制到dailynote.langText(), hk: DailyNoteBox复制到dailynote },
            { langKey: DailyNoteBox复制到dailynoteNewFile.langKey, label: () => DailyNoteBox复制到dailynoteNewFile.langText(), hk: DailyNoteBox复制到dailynoteNewFile },
        ],
    },
    // 阅读点组（featgate □5）：5 条
    {
        id: "readingpoint",
        label: () => tomatoI18n.阅读点,
        items: [
            { langKey: ReadingPointBox设置阅读点.langKey, label: () => ReadingPointBox设置阅读点.langText(), hk: ReadingPointBox设置阅读点 },
            { langKey: ReadingPointBox跳到当前文档的阅读点.langKey, label: () => ReadingPointBox跳到当前文档的阅读点.langText(), hk: ReadingPointBox跳到当前文档的阅读点 },
            { langKey: ReadingPointBox删除当前文档的阅读点.langKey, label: () => ReadingPointBox删除当前文档的阅读点.langText(), hk: ReadingPointBox删除当前文档的阅读点 },
            { langKey: ReadingPointBox查看阅读点.langKey, label: () => ReadingPointBox查看阅读点.langText(), hk: ReadingPointBox查看阅读点 },
            { langKey: ReadingPointBox显示或隐藏悬浮球.langKey, label: () => ReadingPointBox显示或隐藏悬浮球.langText(), hk: ReadingPointBox显示或隐藏悬浮球 },
        ],
    },
    // 可视化组（featgate □5）：块关系图 2+思维导线 3
    {
        id: "visual",
        label: () => tomatoI18n.可视化,
        items: [
            { langKey: GraphBox定位到图中的节点.langKey, label: () => GraphBox定位到图中的节点.langText(), hk: GraphBox定位到图中的节点 },
            { langKey: GraphBox打开块关系图.langKey, label: () => GraphBox打开块关系图.langText(), hk: GraphBox打开块关系图 },
            { langKey: MindWire启用或禁用思维导线.langKey, label: () => MindWire启用或禁用思维导线.langText(), hk: MindWire启用或禁用思维导线 },
            { langKey: MindWire启用或禁用文档思维导线.langKey, label: () => MindWire启用或禁用文档思维导线.langText(), hk: MindWire启用或禁用文档思维导线 },
            { langKey: MindWire划词连线.langKey, label: () => MindWire划词连线.langText(), hk: MindWire划词连线 },
        ],
    },
    // 互链与引用组（featgate □5）：LinkBox 单功能 4+互链族 8+同步块 3（注册经
    // addPairCmd 包装，cmdOn 门控=命令+速查项齐走）
    {
        id: "bilink",
        label: () => tomatoI18n.互链与引用,
        items: [
            { langKey: LinkBoxbilink.langKey, label: () => LinkBoxbilink.langText(), hk: LinkBoxbilink },
            { langKey: LinkBox链接到块底部.langKey, label: () => LinkBox链接到块底部.langText(), hk: LinkBox链接到块底部 },
            { langKey: LinkBox修复双向链接.langKey, label: () => LinkBox修复双向链接.langText(), hk: LinkBox修复双向链接 },
            { langKey: LinkBox删除双向链接.langKey, label: () => LinkBox删除双向链接.langText(), hk: LinkBox删除双向链接 },
            { langKey: LinkBox双向互链选择块.langKey, label: () => LinkBox双向互链选择块.langText(), hk: LinkBox双向互链选择块 },
            { langKey: LinkBox双向互链创建往返链.langKey, label: () => LinkBox双向互链创建往返链.langText(), hk: LinkBox双向互链创建往返链 },
            { langKey: LinkBox嵌入互链选择.langKey, label: () => LinkBox嵌入互链选择.langText(), hk: LinkBox嵌入互链选择 },
            { langKey: LinkBox嵌入互链创建.langKey, label: () => LinkBox嵌入互链创建.langText(), hk: LinkBox嵌入互链创建 },
            { langKey: LinkBox关联两个块选择.langKey, label: () => LinkBox关联两个块选择.langText(), hk: LinkBox关联两个块选择 },
            { langKey: LinkBox关联两个块创建.langKey, label: () => LinkBox关联两个块创建.langText(), hk: LinkBox关联两个块创建 },
            { langKey: LinkBox互相插入引用于下方选择.langKey, label: () => LinkBox互相插入引用于下方选择.langText(), hk: LinkBox互相插入引用于下方选择 },
            { langKey: LinkBox互相插入引用于下方创建.langKey, label: () => LinkBox互相插入引用于下方创建.langText(), hk: LinkBox互相插入引用于下方创建 },
            { langKey: LinkBox查看所有同步位置.langKey, label: () => LinkBox查看所有同步位置.langText(), hk: LinkBox查看所有同步位置 },
            { langKey: LinkBox同步块选择.langKey, label: () => LinkBox同步块选择.langText(), hk: LinkBox同步块选择 },
            { langKey: LinkBox同步块创建.langKey, label: () => LinkBox同步块创建.langText(), hk: LinkBox同步块创建 },
        ],
    },
    // 长内容工具组（featgate □5）：CpBox 3+PairBar 触发 1（块配对总开关族内）；PairBar
    // 触发保留回调级 pairBarEntryHotkey 行为门（双 gate 并存：注册级管命令面板可见性）
    {
        id: "longcontent",
        label: () => tomatoI18n.长内容工具,
        items: [
            { langKey: CpBox批量删除大量连续内容块.langKey, label: () => CpBox批量删除大量连续内容块.langText(), hk: CpBox批量删除大量连续内容块 },
            { langKey: CpBox批量移动大量连续内容块.langKey, label: () => tomatoI18n.批量移动大量连续内容块, hk: CpBox批量移动大量连续内容块 },
            { langKey: CpBox批量复制大量连续内容块.langKey, label: () => tomatoI18n.批量复制大量连续内容块, hk: CpBox批量复制大量连续内容块 },
            { langKey: PairBar触发.langKey, label: () => PairBar触发.langText(), hk: PairBar触发 },
        ],
    },
    // ── □6 小族收尾（组名全复用域导航键）──
    // 反链与引用组：标签转引用 2+超级引用 2+数据库刷新 1+底部反链启停 1（后两条=□6 审计
    // 新发现：菜单侧有 gate 但命令恒注册；langText 直写两参常量 ImgBox 同款纪律见下）
    {
        id: "linktools",
        label: () => tomatoI18n.反链与引用,
        items: [
            { langKey: Tag2RefBox模糊查找引用Ref.langKey, label: () => Tag2RefBox模糊查找引用Ref.langText(), hk: Tag2RefBox模糊查找引用Ref },
            { langKey: Tag2RefBox模糊查找引用Lnk.langKey, label: () => Tag2RefBox模糊查找引用Lnk.langText(), hk: Tag2RefBox模糊查找引用Lnk },
            { langKey: SuperRefBox全局加固引用.langKey, label: () => SuperRefBox全局加固引用.langText(), hk: SuperRefBox全局加固引用 },
            { langKey: SuperRefBox全局修复引用.langKey, label: () => SuperRefBox全局修复引用.langText(), hk: SuperRefBox全局修复引用 },
            { langKey: DbBkBox刷新数据库反链.langKey, label: () => DbBkBox刷新数据库反链.langText(), hk: DbBkBox刷新数据库反链 },
            { langKey: BK启用禁用文档的底部反链.langKey, label: () => BK启用禁用文档的底部反链.langText(), hk: BK启用禁用文档的底部反链 },
        ],
    },
    // 批注组：2 常量+4 字面量收集命令（右键菜单项另有 hiddenMenuItems 通道——本组管
    // 命令面板入口；两通道并存各自语义，langKey 同名不冲突）
    {
        id: "anno",
        label: () => tomatoI18n.批注,
        items: [
            { langKey: CommentBox添加批注.langKey, label: () => CommentBox添加批注.langText(), hk: CommentBox添加批注 },
            { langKey: CommentBox刷新文档正引.langKey, label: () => CommentBox刷新文档正引.langText(), hk: CommentBox刷新文档正引 },
            { langKey: "anno collect", label: () => tomatoI18n.收集批注 },
            { langKey: "anno collect clipboard", label: () => `${tomatoI18n.收集批注} → ${tomatoI18n.剪贴板}` },
            { langKey: "anno collect daily", label: () => `${tomatoI18n.收集批注} → ${tomatoI18n.当天日记}` },
            { langKey: "anno collect file", label: () => `${tomatoI18n.收集批注} → ${tomatoI18n.收集到文件}` },
        ],
    },
    {
        id: "export",
        label: () => tomatoI18n.导出工作空间域,
        items: [
            { langKey: MarkdownExport全量导出.langKey, label: () => MarkdownExport全量导出.langText(), hk: MarkdownExport全量导出 },
            { langKey: MarkdownExport增量导出.langKey, label: () => MarkdownExport增量导出.langText(), hk: MarkdownExport增量导出 },
            { langKey: MarkdownExport确保导出符合配置.langKey, label: () => MarkdownExport确保导出符合配置.langText(), hk: MarkdownExport确保导出符合配置 },
        ],
    },
    {
        id: "docs",
        label: () => tomatoI18n.文档管理,
        items: [
            { langKey: PrefixArticles前缀文档树.langKey, label: () => PrefixArticles前缀文档树.langText(), hk: PrefixArticles前缀文档树 },
            { langKey: ListBox取消勾选当前文档所有已完成的todo任务.langKey, label: () => ListBox取消勾选当前文档所有已完成的todo任务.langText(), hk: ListBox取消勾选当前文档所有已完成的todo任务 },
            { langKey: ListBox删除当前文档所有已完成的todo任务.langKey, label: () => ListBox删除当前文档所有已完成的todo任务.langText(), hk: ListBox删除当前文档所有已完成的todo任务 },
        ],
    },
    {
        id: "editortools",
        label: () => tomatoI18n.编辑器工具,
        items: [
            // ImgBoxHotKey 两参常量：label 直写 i18n（与注册点一致，勿调 .langText()）
            { langKey: ImgBoxHotKey.langKey, label: () => tomatoI18n.复制为图片, hk: ImgBoxHotKey },
            { langKey: BlockEditor打开编辑器.langKey, label: () => BlockEditor打开编辑器.langText(), hk: BlockEditor打开编辑器 },
        ],
    },
    {
        id: "floatball",
        label: () => tomatoI18n.悬浮球,
        items: [
            { langKey: FloatingBall添加文档.langKey, label: () => FloatingBall添加文档.langText(), hk: FloatingBall添加文档 },
            { langKey: FloatingBallTab添加文档.langKey, label: () => FloatingBallTab添加文档.langText(), hk: FloatingBallTab添加文档 },
        ],
    },
    // 快速笔记组：前两条两参常量 label 直写 i18n（与注册点一致）
    {
        id: "fastnote",
        label: () => tomatoI18n.速记,
        items: [
            { langKey: FastNoteBox创建快速笔记.langKey, label: () => tomatoI18n.创建快速笔记, hk: FastNoteBox创建快速笔记 },
            { langKey: FastNoteBox打开最后一个笔记.langKey, label: () => tomatoI18n.打开最后一个笔记, hk: FastNoteBox打开最后一个笔记 },
            { langKey: FastNoteBox草稿切换.langKey, label: () => FastNoteBox草稿切换.langText(), hk: FastNoteBox草稿切换 },
        ],
    },
];
