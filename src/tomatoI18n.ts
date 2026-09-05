import { TomatoI18nABC } from "./libs/text1";

export class TomatoI18n extends TomatoI18nABC {

    // 块配对工具 □2 接力浮条 V1 新增键（2026-08-31）：四入口/状态机文案/设置段
    public get 块配对浮条() {
        switch (this.lang) {
            case "zh_CN": return "块配对浮条";
            case "zh_CHT": return "塊配對浮條";
            case "ja_JP": return "ブロックペア浮動バー";
            case "en_US":
            default: return "Block pairing bar";
        }
    }
    // R5 □1 总开关化（2026-09-01）：ConfBlocks 分区标题改名 + 三个子选项折叠区标题
    public get 块配对工具() {
        switch (this.lang) {
            case "zh_CN": return "块配对工具";
            case "zh_CHT": return "塊配對工具";
            case "ja_JP": return "ブロックペアツール";
            case "en_US":
            default: return "Block pairing tools";
        }
    }
    public get 同步块选项() {
        switch (this.lang) {
            case "zh_CN": return "同步块选项";
            case "zh_CHT": return "同步塊選項";
            case "ja_JP": return "同期ブロック設定";
            case "en_US":
            default: return "Sync block options";
        }
    }
    public get 互链与引用选项() {
        switch (this.lang) {
            case "zh_CN": return "互链与引用选项";
            case "zh_CHT": return "互鏈與引用選項";
            case "ja_JP": return "相互リンクと参照設定";
            case "en_US":
            default: return "Bilink & reference options";
        }
    }
    public get 长内容工具选项() {
        switch (this.lang) {
            case "zh_CN": return "长内容工具选项";
            case "zh_CHT": return "長內容工具選項";
            case "ja_JP": return "長文コンテンツツール設定";
            case "en_US":
            default: return "Long content tools";
        }
    }
    public get 默认功能() {
        switch (this.lang) {
            case "zh_CN": return "默认功能";
            case "zh_CHT": return "默認功能";
            case "ja_JP": return "デフォルト機能";
            case "en_US":
            default: return "Default action";
        }
    }
    public get 无默认() {
        switch (this.lang) {
            case "zh_CN": return "无默认（出场先选功能）";
            case "zh_CHT": return "無默認（出場先選功能）";
            case "ja_JP": return "なし（起動時に機能を選択）";
            case "en_US":
            default: return "None (pick an action on open)";
        }
    }
    public get 快捷键入口() {
        switch (this.lang) {
            case "zh_CN": return "快捷键入口";
            case "zh_CHT": return "快捷鍵入口";
            case "ja_JP": return "ショートカット入口";
            case "en_US":
            default: return "Hotkey entry";
        }
    }
    public get 状态栏入口() {
        switch (this.lang) {
            case "zh_CN": return "状态栏按钮入口";
            case "zh_CHT": return "狀態欄按鈕入口";
            case "ja_JP": return "ステータスバー入口";
            case "en_US":
            default: return "Status bar entry";
        }
    }
    public get 内容菜单入口() {
        switch (this.lang) {
            case "zh_CN": return "内容右键菜单入口";
            case "zh_CHT": return "內容右鍵選單入口";
            case "ja_JP": return "コンテキストメニュー入口";
            case "en_US":
            default: return "Content menu entry";
        }
    }
    public get 块图标菜单入口() {
        switch (this.lang) {
            // □11：块图标菜单=左键点块前小圆点唤出，非右键（2026-09-01 勘误去「右键」）
            case "zh_CN": return "块图标菜单入口";
            case "zh_CHT": return "塊圖標選單入口";
            case "ja_JP": return "ブロックアイコンメニュー入口";
            case "en_US":
            default: return "Block icon menu entry";
        }
    }
    public get 嵌入互链() {
        switch (this.lang) {
            case "zh_CN": return "嵌入互链";
            case "zh_CHT": return "嵌入互鏈";
            case "ja_JP": return "埋め込み相互リンク";
            case "en_US":
            default: return "Embed bilink";
        }
    }
    public get 关联两个块() {
        switch (this.lang) {
            case "zh_CN": return "关联两个块";
            case "zh_CHT": return "關聯兩個塊";
            case "ja_JP": return "2 ブロックを関連付け";
            case "en_US":
            default: return "Link two blocks (ref)";
        }
    }
    public get 互相插入引用() {
        switch (this.lang) {
            case "zh_CN": return "互相插入引用";
            case "zh_CHT": return "互相插入引用";
            case "ja_JP": return "相互に参照を挿入";
            case "en_US":
            default: return "Insert refs both ways";
        }
    }
    public get 搬运() {
        switch (this.lang) {
            case "zh_CN": return "搬运";
            case "zh_CHT": return "搬運";
            case "ja_JP": return "ブロック移動";
            case "en_US":
            default: return "Move blocks";
        }
    }
    // target 态键帽提示两段式（spec §2-A3）：键帽 span 嵌中间，接缝由 .pairbar-kbd margin 兜
    public get 等目标前段() {
        switch (this.lang) {
            case "zh_CN": return "在目标块上按";
            case "zh_CHT": return "在目標塊上按";
            case "ja_JP": return "目標ブロックで";
            case "en_US":
            default: return "Press";
        }
    }
    public get 目标与源相同() {
        switch (this.lang) {
            case "zh_CN": return "目标与源相同，请换个目标块";
            case "zh_CHT": return "目標與源相同，請換個目標塊";
            case "ja_JP": return "目標がソースと同じです";
            case "en_US":
            default: return "Target is the same as source";
        }
    }
    public 需要Pro(name: string) {
        switch (this.lang) {
            case "zh_CN": return `「${name}」需要 Pro`;
            case "zh_CHT": return `「${name}」需要 Pro`;
            case "ja_JP": return `「${name}」は Pro が必要です`;
            case "en_US":
            default: return `"${name}" requires Pro`;
        }
    }
    public get 配对完成() {
        switch (this.lang) {
            case "zh_CN": return "配对完成";
            case "zh_CHT": return "配對完成";
            case "ja_JP": return "ペアリング完了";
            case "en_US":
            default: return "Pairing done";
        }
    }
    public get 源块不可用() {
        switch (this.lang) {
            case "zh_CN": return "源块不可用（可能已被删除）";
            case "zh_CHT": return "源塊不可用（可能已被刪除）";
            case "ja_JP": return "ソースブロックが利用できません";
            case "en_US":
            default: return "Source block unavailable";
        }
    }
    public get 目标块不可用() {
        switch (this.lang) {
            case "zh_CN": return "目标块不可用（可能已被删除）";
            case "zh_CHT": return "目標塊不可用（可能已被刪除）";
            case "ja_JP": return "ターゲットブロックが利用できません";
            case "en_US":
            default: return "Target block unavailable";
        }
    }
    public get 请先打开文档() {
        switch (this.lang) {
            case "zh_CN": return "请先打开一个文档";
            case "zh_CHT": return "請先打開一個文檔";
            case "ja_JP": return "先にドキュメントを開いてください";
            case "en_US":
            default: return "Open a document first";
        }
    }

    // 块配对双槽浮条（二轮 □3）：槽标签/填槽提示/删槽/单源限制/目标块不可用
    public get 槽一() {
        switch (this.lang) {
            case "zh_CN": return "① 源块";
            case "zh_CHT": return "① 來源塊";
            case "ja_JP": return "① ソース";
            case "en_US":
            default: return "① Source";
        }
    }
    public get 槽二() {
        switch (this.lang) {
            case "zh_CN": return "② 目标块";
            case "zh_CHT": return "② 目標塊";
            case "ja_JP": return "② 目標";
            case "en_US":
            default: return "② Target";
        }
    }
    public get 填槽提示() {
        switch (this.lang) {
            case "zh_CN": return "点击或拖入块填入高亮槽位";
            case "zh_CHT": return "點擊或拖入塊填入高亮槽位";
            case "ja_JP": return "クリックまたはドラッグで強調スロットにブロックを入れる";
            case "en_US":
            default: return "Click or drop blocks into the highlighted slot";
        }
    }
    public get 删除槽块() {
        switch (this.lang) {
            case "zh_CN": return "删除该槽块";
            case "zh_CHT": return "刪除該槽塊";
            case "ja_JP": return "このスロットのブロックを削除";
            case "en_US":
            default: return "Clear this slot";
        }
    }
    public 仅支持单块源(name: string) {
        switch (this.lang) {
            case "zh_CN": return `「${name}」仅支持单个源块`;
            case "zh_CHT": return `「${name}」僅支援單個來源塊`;
            case "ja_JP": return `「${name}」はソース 1 個のみ対応です`;
            case "en_US":
            default: return `"${name}" supports a single source block only`;
        }
    }

    // 功能优先浮条 V4（R3 □2）：功能面板/三框标签/换功能/✓ 影响面/跨文档拦截
    /** 面板 hint 三态（R4）：无暂存 / 真选区暂存 / 「最近用过的块」伪预填（lastSrc 标记） */
    public 选择功能(stash?: { ids: string[]; lastSrc?: boolean } | null) {
        const has = (stash?.ids?.length ?? 0) > 0;
        switch (this.lang) {
            case "zh_CN": return !has ? "选择功能" : stash?.lastSrc ? "选择功能（上次源块将自动填入）" : "选择功能（当前选区将自动填入）";
            case "zh_CHT": return !has ? "選擇功能" : stash?.lastSrc ? "選擇功能（上次源塊將自動填入）" : "選擇功能（當前選區將自動填入）";
            case "ja_JP": return !has ? "機能を選択" : stash?.lastSrc ? "機能を選択（前回のソースを自動挿入）" : "機能を選択（現在の選択範囲を自動挿入）";
            case "en_US":
            default: return !has ? "Pick an action" : stash?.lastSrc ? "Pick an action (last source will auto-fill)" : "Pick an action (selection will auto-fill)";
        }
    }
    /** funcs 面板高亮上次功能的 tooltip 后缀（R4：直跳退役后 lastFunc 的残留价值） */
    public get 上次使用() {
        switch (this.lang) {
            case "zh_CN": return "上次使用";
            case "zh_CHT": return "上次使用";
            case "ja_JP": return "前回使用";
            case "en_US":
            default: return "Last used";
        }
    }
    // R5 □3 快捷键速查：⋯ 菜单子菜单标题+组名×2（同步块/长内容工具/选择复用基类现有裸键）+tooltip 键位行「创建」动词
    public get 快捷键速查() {
        switch (this.lang) {
            case "zh_CN": return "快捷键速查";
            case "zh_CHT": return "快捷鍵速查";
            case "ja_JP": return "ショートカット一覧";
            case "en_US":
            default: return "Hotkey cheatsheet";
        }
    }
    public get 互链族() {
        switch (this.lang) {
            case "zh_CN": return "互链族";
            case "zh_CHT": return "互鏈族";
            case "ja_JP": return "相互リンク";
            case "en_US":
            default: return "Bilinks";
        }
    }
    public get 创建() {
        switch (this.lang) {
            case "zh_CN": return "创建";
            case "zh_CHT": return "建立";
            case "ja_JP": return "作成";
            case "en_US":
            default: return "Create";
        }
    }
    public 换功能(name: string) {
        switch (this.lang) {
            case "zh_CN": return `更换功能（当前：${name}）`;
            case "zh_CHT": return `更換功能（當前：${name}）`;
            case "ja_JP": return `機能を変更（現在：${name}）`;
            case "en_US":
            default: return `Change action (current: ${name})`;
        }
    }
    public get 起始框() {
        switch (this.lang) {
            case "zh_CN": return "① 起始块";
            case "zh_CHT": return "① 起始塊";
            case "ja_JP": return "① 開始";
            case "en_US":
            default: return "① Start";
        }
    }
    public get 结束框() {
        switch (this.lang) {
            case "zh_CN": return "② 结束块";
            case "zh_CHT": return "② 結束塊";
            case "ja_JP": return "② 終了";
            case "en_US":
            default: return "② End";
        }
    }
    public get 三号框() {
        switch (this.lang) {
            case "zh_CN": return "③ 目标块";
            case "zh_CHT": return "③ 目標塊";
            case "ja_JP": return "③ 目標";
            case "en_US":
            default: return "③ Target";
        }
    }
    public get 起止须同文档() {
        switch (this.lang) {
            case "zh_CN": return "起始块与结束块须在同一文档";
            case "zh_CHT": return "起始塊與結束塊須在同一文件";
            case "ja_JP": return "開始ブロックと終了ブロックは同じドキュメント内にある必要があります";
            case "en_US":
            default: return "Start and end blocks must be in the same document";
        }
    }
    public 移动块数(n: number | null) {
        switch (this.lang) {
            case "zh_CN": return n == null ? "移动" : `移动 ${n} 块`;
            case "zh_CHT": return n == null ? "移動" : `移動 ${n} 塊`;
            case "ja_JP": return n == null ? "移動" : `${n} 個のブロックを移動`;
            case "en_US":
            default: return n == null ? "Move" : `Move ${n} block${n === 1 ? "" : "s"}`;
        }
    }
    public 复制块数(n: number | null) {
        switch (this.lang) {
            case "zh_CN": return n == null ? "复制" : `复制 ${n} 块`;
            case "zh_CHT": return n == null ? "複製" : `複製 ${n} 塊`;
            case "ja_JP": return n == null ? "複製" : `${n} 個のブロックを複製`;
            case "en_US":
            default: return n == null ? "Copy" : `Copy ${n} block${n === 1 ? "" : "s"}`;
        }
    }
    // R5 □2 搬运三档（2026-09-01）：删除档 ✓ 影响面预览 + 执行完成 toast（同源取数）
    public 删除块数(n: number | null) {
        switch (this.lang) {
            case "zh_CN": return n == null ? "删除" : `删除 ${n} 块`;
            case "zh_CHT": return n == null ? "刪除" : `刪除 ${n} 塊`;
            case "ja_JP": return n == null ? "削除" : `${n} 個のブロックを削除`;
            case "en_US":
            default: return n == null ? "Delete" : `Delete ${n} block${n === 1 ? "" : "s"}`;
        }
    }
    public 已删除块数(n: number) {
        switch (this.lang) {
            case "zh_CN": return `已删除 ${n} 块`;
            case "zh_CHT": return `已刪除 ${n} 塊`;
            case "ja_JP": return `${n} 個のブロックを削除しました`;
            case "en_US":
            default: return `Deleted ${n} block${n === 1 ? "" : "s"}`;
        }
    }

    // 块配对工具 □1 配置归拢新增键（2026-08-31）：ConfBlocks 分区底部折叠区标题
    public get 高级单功能快捷键() {
        switch (this.lang) {
            case "zh_CN": return "高级：单功能快捷键";
            case "zh_CHT": return "進階：單功能快捷鍵";
            case "ja_JP": return "上級：単機能ショートカット";
            case "en_US":
            default: return "Advanced: individual hotkeys";
        }
    }

    // 批注草稿存放笔记本（2026-09-02）：默认跟随系统日记本，设置面板知情可选
    public get 批注草稿存放笔记本() {
        switch (this.lang) {
            case "zh_CN": return "批注草稿存放笔记本";
            case "zh_CHT": return "批註草稿存放筆記本";
            case "ja_JP": return "批注下書きの保存ノートブック";
            case "en_US":
            default: return "Annotation draft notebook";
        }
    }
    public get 草稿笔记本自动() {
        switch (this.lang) {
            case "zh_CN": return "自动（跟随日记本）";
            case "zh_CHT": return "自動（跟隨日記本）";
            case "ja_JP": return "自動（日記ノートブック）";
            case "en_US":
            default: return "Auto (daily notes)";
        }
    }
    public get 草稿笔记本自动说明() {
        switch (this.lang) {
            case "zh_CN": return "选择后批注收集「当天日记」也落此本；未选择时跟随日记本；草稿文件为最小干扰默认藏入日记的上一个月份目录，无害、可随时删除";
            case "zh_CHT": return "選擇後批註收集「當天日記」也落此本；未選擇時跟隨日記本；草稿文件為最小干擾預設藏入日記的上一個月份目錄，無害、可隨時刪除";
            case "ja_JP": return "選択すると注釈収集の「今日の日記」もこのノートブックに保存される。未選択の場合は日記ノートブックに従う。下書きファイルは干渉を最小にするため日記の前月ディレクトリに配置される（無害・いつでも削除可能）";
            case "en_US":
            default: return "When set, annotations collected to today's daily note also land in this notebook; follows the daily-note notebook when unset; the harmless draft doc is tucked into the previous month's daily-note folder (minimal intrusion) and safe to delete anytime";
        }
    }

    // □1 标记视觉扩展新增键（2026-08-31，spec §11：形态主档/线型七档/背景开关/底色厚度）
    public get 批注标记形态() {
        switch (this.lang) {
            case "zh_CN": return "标记形态";
            case "zh_CHT": return "標記形態";
            case "ja_JP": return "マーカーの形";
            case "en_US":
            default: return "Annotation style";
        }
    }
    public get 形态下划线式() {
        switch (this.lang) {
            case "zh_CN": return "下划线式";
            case "zh_CHT": return "下劃線式";
            case "ja_JP": return "下線スタイル";
            case "en_US":
            default: return "Underline";
        }
    }
    public get 形态马克笔式() {
        switch (this.lang) {
            case "zh_CN": return "马克笔式";
            case "zh_CHT": return "馬克筆式";
            case "ja_JP": return "マーカー式";
            case "en_US":
            default: return "Marker";
        }
    }
    public get 形态花边框() {
        switch (this.lang) {
            case "zh_CN": return "花边框";
            case "zh_CHT": return "花邊框";
            case "ja_JP": return "花枠";
            case "en_US":
            default: return "Fancy frame";
        }
    }
    public get 批注线型() {
        switch (this.lang) {
            case "zh_CN": return "线型";
            case "zh_CHT": return "線型";
            case "ja_JP": return "線の種類";
            case "en_US":
            default: return "Line style";
        }
    }
    public get 线型实线() {
        switch (this.lang) {
            case "zh_CN": return "实线";
            case "zh_CHT": return "實線";
            case "ja_JP": return "実線";
            case "en_US":
            default: return "Solid";
        }
    }
    public get 线型虚线() {
        switch (this.lang) {
            case "zh_CN": return "虚线";
            case "zh_CHT": return "虛線";
            case "ja_JP": return "破線";
            case "en_US":
            default: return "Dashed";
        }
    }
    public get 线型点线() {
        switch (this.lang) {
            case "zh_CN": return "点线";
            case "zh_CHT": return "點線";
            case "ja_JP": return "点線";
            case "en_US":
            default: return "Dotted";
        }
    }
    public get 线型波浪线() {
        switch (this.lang) {
            case "zh_CN": return "波浪线";
            case "zh_CHT": return "波浪線";
            case "ja_JP": return "波線";
            case "en_US":
            default: return "Wavy";
        }
    }
    public get 线型双线() {
        switch (this.lang) {
            case "zh_CN": return "双线";
            case "zh_CHT": return "雙線";
            case "ja_JP": return "二重線";
            case "en_US":
            default: return "Double";
        }
    }
    public get 线型圆点串() {
        switch (this.lang) {
            case "zh_CN": return "圆点串";
            case "zh_CHT": return "圓點串";
            case "ja_JP": return "ビーズドット";
            case "en_US":
            default: return "Beaded dots";
        }
    }
    public get 线型圆圈串() {
        switch (this.lang) {
            case "zh_CN": return "圆圈串";
            case "zh_CHT": return "圓圈串";
            case "ja_JP": return "ビーズリング";
            case "en_US":
            default: return "Beaded rings";
        }
    }
    public get 批注背景微底色() {
        switch (this.lang) {
            case "zh_CN": return "背景微底色";
            case "zh_CHT": return "背景微底色";
            case "ja_JP": return "薄い背景色";
            case "en_US":
            default: return "Soft background tint";
        }
    }
    public get 批注底色厚度() {
        switch (this.lang) {
            case "zh_CN": return "底色厚度";
            case "zh_CHT": return "底色厚度";
            case "ja_JP": return "マーカーの太さ";
            case "en_US":
            default: return "Highlight thickness";
        }
    }

    // 批注翻新（2026-08-31 □3）新增键
    public get 添加批注() {
        switch (this.lang) {
            case "zh_CN": return "添加批注";
            case "zh_CHT": return "添加批註";
            case "ja_JP": return "注釈を追加";
            case "en_US":
            default: return "Add annotation";
        }
    }
    public get 批注内容为空() {
        switch (this.lang) {
            case "zh_CN": return "批注内容为空";
            case "zh_CHT": return "批註內容為空";
            case "ja_JP": return "注釈が空です";
            case "en_US":
            default: return "Annotation is empty";
        }
    }
    public get 批注写入失败() {
        switch (this.lang) {
            case "zh_CN": return "批注写入失败，请重试";
            case "zh_CHT": return "批註寫入失敗，請重試";
            case "ja_JP": return "注釈の書き込みに失敗しました";
            case "en_US":
            default: return "Failed to save annotation, please retry";
        }
    }
    public get 标记写入失败批注已保存() {
        switch (this.lang) {
            case "zh_CN": return "正文标记写入失败，批注已保存";
            case "zh_CHT": return "正文標記寫入失敗，批註已保存";
            case "ja_JP": return "本文のマーク付けに失敗しましたが、注釈は保存されました";
            case "en_US":
            default: return "Failed to mark text, the annotation itself was saved";
        }
    }
    public get 选区不含可标记文本() {
        switch (this.lang) {
            case "zh_CN": return "选区不含可标记的文本";
            case "zh_CHT": return "選區不含可標記的文本";
            case "ja_JP": return "選択範囲にマーク可能なテキストがありません";
            case "en_US":
            default: return "No markable text in the selection";
        }
    }
    public get 批注超过软限() {
        switch (this.lang) {
            case "zh_CN": return "批注超过";
            case "zh_CHT": return "批註超過";
            case "ja_JP": return "注釈が上限を超えています：";
            case "en_US":
            default: return "Annotation exceeds";
        }
    }

    // 面板翻新（2026-08-31 □7）新增键
    public get 收起卡片() {
        switch (this.lang) {
            case "zh_CN": return "折叠";
            case "zh_CHT": return "折疊";
            case "ja_JP": return "折りたたむ";
            case "en_US":
            default: return "Collapse";
        }
    }
    public get 展开卡片() {
        switch (this.lang) {
            case "zh_CN": return "展开";
            case "zh_CHT": return "展開";
            case "ja_JP": return "展開";
            case "en_US":
            default: return "Expand";
        }
    }
    public get 暂无引用() {
        switch (this.lang) {
            case "zh_CN": return "暂无引用";
            case "zh_CHT": return "暫無引用";
            case "ja_JP": return "参照はありません";
            case "en_US":
            default: return "No references";
        }
    }
    public get 暂无批注() {
        switch (this.lang) {
            case "zh_CN": return "暂无批注";
            case "zh_CHT": return "暫無批註";
            case "ja_JP": return "注釈はありません";
            case "en_US":
            default: return "No annotations";
        }
    }
    // 划词工具条批注入口（□4 2026-09-03）设置开关文案
    public get 划词工具条批注入口() {
        switch (this.lang) {
            case "zh_CN": return "划词工具条入口";
            case "zh_CHT": return "劃詞工具條入口";
            case "ja_JP": return "選択ツールバー入口";
            case "en_US":
            default: return "Text-selection toolbar entry";
        }
    }
    // 批注收集（2026-09-02）新增键：小窗/右键级联/命令/回执
    public get 收集批注() {
        switch (this.lang) {
            case "zh_CN": return "收集批注";
            case "zh_CHT": return "收集批註";
            case "ja_JP": return "注釈を収集";
            case "en_US":
            default: return "Collect annotations";
        }
    }
    public get 打开收集窗口() {
        switch (this.lang) {
            case "zh_CN": return "打开收集窗口…";
            case "zh_CHT": return "打開收集窗口…";
            case "ja_JP": return "収集ウィンドウを開く…";
            case "en_US":
            default: return "Open collect dialog…";
        }
    }
    public get 复制到剪贴板() {
        switch (this.lang) {
            case "zh_CN": return "复制到剪贴板";
            case "zh_CHT": return "複製到剪貼板";
            case "ja_JP": return "クリップボードにコピー";
            case "en_US":
            default: return "Copy to clipboard";
        }
    }
    public get 收集到当天日记() {
        switch (this.lang) {
            case "zh_CN": return "收集到当天日记";
            case "zh_CHT": return "收集到當天日記";
            case "ja_JP": return "今日の日記に収集";
            case "en_US":
            default: return "Collect to today's diary";
        }
    }
    public get 收集到文件() {
        switch (this.lang) {
            case "zh_CN": return "收集到文件";
            case "zh_CHT": return "收集到文件";
            case "ja_JP": return "ファイルに収集";
            case "en_US":
            default: return "Collect to file";
        }
    }
    public get 收集范围() {
        switch (this.lang) {
            case "zh_CN": return "收集范围";
            case "zh_CHT": return "收集範圍";
            case "ja_JP": return "収集範囲";
            case "en_US":
            default: return "Scope";
        }
    }
    public get 当前文档() {
        switch (this.lang) {
            case "zh_CN": return "当前文档";
            case "zh_CHT": return "當前文檔";
            case "ja_JP": return "現在のドキュメント";
            case "en_US":
            default: return "Current document";
        }
    }
    public get 含子文档() {
        switch (this.lang) {
            case "zh_CN": return "含子文档";
            case "zh_CHT": return "含子文檔";
            case "ja_JP": return "子ドキュメントを含む";
            case "en_US":
            default: return "Include sub-docs";
        }
    }
    public get 收集到() {
        switch (this.lang) {
            case "zh_CN": return "收集到";
            case "zh_CHT": return "收集到";
            case "ja_JP": return "収集先";
            case "en_US":
            default: return "Destination";
        }
    }
    public get 剪贴板() {
        switch (this.lang) {
            case "zh_CN": return "剪贴板";
            case "zh_CHT": return "剪貼板";
            case "ja_JP": return "クリップボード";
            case "en_US":
            default: return "Clipboard";
        }
    }
    public get 当天日记() {
        switch (this.lang) {
            case "zh_CN": return "当天日记";
            case "zh_CHT": return "當天日記";
            case "ja_JP": return "今日の日記";
            case "en_US":
            default: return "Today's diary";
        }
    }
    public get 指定文件() {
        switch (this.lang) {
            case "zh_CN": return "指定文件";
            case "zh_CHT": return "指定文件";
            case "ja_JP": return "指定ファイル";
            case "en_US":
            default: return "Specific file";
        }
    }
    public get 选择文档() {
        switch (this.lang) {
            case "zh_CN": return "选择文档…";
            case "zh_CHT": return "選擇文檔…";
            case "ja_JP": return "ドキュメントを選択…";
            case "en_US":
            default: return "Pick a doc…";
        }
    }
    public get 已收集() {
        switch (this.lang) {
            case "zh_CN": return "已收集";
            case "zh_CHT": return "已收集";
            case "ja_JP": return "収集済み";
            case "en_US":
            default: return "Collected";
        }
    }
    public get 条批注() {
        switch (this.lang) {
            case "zh_CN": return "条批注";
            case "zh_CHT": return "條批註";
            case "ja_JP": return "件の注釈";
            case "en_US":
            default: return "annotations";
        }
    }
    public get 未发现批注() {
        switch (this.lang) {
            case "zh_CN": return "未发现批注";
            case "zh_CHT": return "未發現批註";
            case "ja_JP": return "注釈が見つかりません";
            case "en_US":
            default: return "No annotations found";
        }
    }
    public get 未找到日记笔记本() {
        switch (this.lang) {
            case "zh_CN": return "未找到日记笔记本，可改选指定文件";
            case "zh_CHT": return "未找到日記筆記本，可改選指定文件";
            case "ja_JP": return "日記ノートブックが見つかりません。ファイル指定に変更してください";
            case "en_US":
            default: return "No daily-note notebook found; pick a file instead";
        }
    }
    public get 收集目标已失效请重选() {
        switch (this.lang) {
            case "zh_CN": return "收集目标已失效，请重选文件";
            case "zh_CHT": return "收集目標已失效，請重選文件";
            case "ja_JP": return "収集先が無効になりました。選び直してください";
            case "en_US":
            default: return "Target file is gone; re-pick it";
        }
    }
    public get 收集失败() {
        switch (this.lang) {
            case "zh_CN": return "收集失败，请重试";
            case "zh_CHT": return "收集失敗，請重試";
            case "ja_JP": return "収集に失敗しました。再試行してください";
            case "en_US":
            default: return "Collect failed, retry";
        }
    }
    public get 收集批注说明() {
        switch (this.lang) {
            case "zh_CN": return "收集当前文档批注（可含子文档）到日记/文件/剪贴板";
            case "zh_CHT": return "收集當前文檔批註（可含子文檔）到日記/文件/剪貼板";
            case "ja_JP": return "この文書の注釈（子文書含む）を日記/ファイル/クリップボードに収集";
            case "en_US":
            default: return "Collect this doc's annotations (optionally sub-docs) to diary/file/clipboard";
        }
    }
    public get 收集到当天日记说明() {
        switch (this.lang) {
            case "zh_CN": return "一键收集：按上次记忆的范围，直接归档到当天日记（落「批注草稿存放笔记本」所选本，未选时跟随系统日记本）";
            case "zh_CHT": return "一鍵收集：按上次記憶的範圍，直接歸檔到當天日記（落「批註草稿存放筆記本」所選本，未選時跟隨系統日記本）";
            case "ja_JP": return "ワンクリック収集：前回の範囲設定のまま、今日の日記に直接保存（「注釈下書きノートブック」選択ノートブック、未選択時はシステムの日記ノートブック）";
            case "en_US":
            default: return "Quick collect: last-used scope, straight into today's daily note (the annotation-draft notebook, or the system daily notebook when unset)";
        }
    }
    public get 收集到剪贴板说明() {
        switch (this.lang) {
            case "zh_CN": return "一键收集：按上次记忆的范围，复制为 markdown（粘贴回思源自动成活块引用）";
            case "zh_CHT": return "一鍵收集：按上次記憶的範圍，複製為 markdown（粘貼回思源自動成活塊引用）";
            case "ja_JP": return "ワンクリック収集：前回の範囲設定のまま、markdown としてコピー（SiYuan に貼り付けるとブロック参照として復元）";
            case "en_US":
            default: return "Quick collect: last-used scope, copied as markdown (pasting back into SiYuan revives live block refs)";
        }
    }
    public get 文档只读() {
        switch (this.lang) {
            case "zh_CN": return "文档为只读，无法添加批注";
            case "zh_CHT": return "文檔為唯讀，無法添加批註";
            case "ja_JP": return "読み取り専用ドキュメントのため注釈を追加できません";
            case "en_US":
            default: return "Document is readonly, cannot annotate";
        }
    }
    public get 编辑() {
        switch (this.lang) {
            case "zh_CN": return "编辑";
            case "zh_CHT": return "編輯";
            case "ja_JP": return "編集";
            case "en_US":
            default: return "Edit";
        }
    }
    public get 块级() {
        switch (this.lang) {
            case "zh_CN": return "块级批注";
            case "zh_CHT": return "塊級批註";
            case "ja_JP": return "ブロック注釈";
            case "en_US":
            default: return "Block annotation";
        }
    }
    public get 个块() {
        switch (this.lang) {
            case "zh_CN": return "个块";
            case "zh_CHT": return "個塊";
            case "ja_JP": return "ブロック";
            case "en_US":
            default: return "block(s)";
        }
    }
    public get 批注下划线粗细() {
        switch (this.lang) {
            case "zh_CN": return "批注下划线粗细";
            case "zh_CHT": return "批註下劃線粗細";
            case "ja_JP": return "注釈の下線の太さ";
            case "en_US":
            default: return "Annotation underline thickness";
        }
    }
    public get 细() {
        switch (this.lang) {
            case "zh_CN": return "细";
            case "zh_CHT": return "細";
            case "ja_JP": return "細";
            case "en_US":
            default: return "Thin";
        }
    }
    public get 标准() {
        switch (this.lang) {
            case "zh_CN": return "标准";
            case "zh_CHT": return "標準";
            case "ja_JP": return "標準";
            case "en_US":
            default: return "Regular";
        }
    }
    public get 粗() {
        switch (this.lang) {
            case "zh_CN": return "粗";
            case "zh_CHT": return "粗";
            case "ja_JP": return "太";
            case "en_US":
            default: return "Bold";
        }
    }
    // □2 面板皮肤四档（2026-08-31，commentbox spec §10：classic/candy/paper/airy）
    public get 面板皮肤() {
        switch (this.lang) {
            case "zh_CN": return "面板皮肤";
            case "zh_CHT": return "面板皮膚";
            case "ja_JP": return "パネルスキン";
            case "en_US":
            default: return "Panel skin";
        }
    }
    public get 皮肤经典() {
        switch (this.lang) {
            case "zh_CN": return "经典";
            case "zh_CHT": return "經典";
            case "ja_JP": return "クラシック";
            case "en_US":
            default: return "Classic";
        }
    }
    public get 皮肤糖霜() {
        switch (this.lang) {
            case "zh_CN": return "糖霜";
            case "zh_CHT": return "糖霜";
            case "ja_JP": return "シュガー";
            case "en_US":
            default: return "Sugar";
        }
    }
    public get 皮肤纸墨() {
        switch (this.lang) {
            case "zh_CN": return "纸墨";
            case "zh_CHT": return "紙墨";
            case "ja_JP": return "紙墨";
            case "en_US":
            default: return "Paper Ink";
        }
    }
    public get 皮肤疏朗() {
        switch (this.lang) {
            case "zh_CN": return "疏朗";
            case "zh_CHT": return "疏朗";
            case "ja_JP": return "ゆったり";
            case "en_US":
            default: return "Airy";
        }
    }
    // 批注翻新（2026-08-31 □4 编辑/删除）新增键
    public get 编辑批注() {
        switch (this.lang) {
            case "zh_CN": return "编辑批注";
            case "zh_CHT": return "編輯批註";
            case "ja_JP": return "注釈を編集";
            case "en_US":
            default: return "Edit annotation";
        }
    }
    public get 确认删除批注() {
        switch (this.lang) {
            case "zh_CN": return "删除这条批注？";
            case "zh_CHT": return "刪除這條批註？";
            case "ja_JP": return "この注釈を削除しますか？";
            case "en_US":
            default: return "Delete this annotation?";
        }
    }
    public get 删除批注连带标记() {
        switch (this.lang) {
            case "zh_CN": return "正文中的标记将一并移除";
            case "zh_CHT": return "正文中的標記將一併移除";
            case "ja_JP": return "本文中のマークも一緒に削除されます";
            case "en_US":
            default: "Marks in the text will also be removed";
        }
    }
    public get 批注删除失败() {
        switch (this.lang) {
            case "zh_CN": return "批注删除失败，请重试";
            case "zh_CHT": return "批註刪除失敗，請重試";
            case "ja_JP": return "注釈の削除に失敗しました";
            case "en_US":
            default: return "Failed to delete annotation, please retry";
        }
    }
    public get 批注加载失败() {
        switch (this.lang) {
            case "zh_CN": return "批注加载失败，请重试";
            case "zh_CHT": return "批註載入失敗，請重試";
            case "ja_JP": return "注釈の読み込みに失敗しました";
            case "en_US":
            default: return "Failed to load annotation, please retry";
        }
    }
    public get 批注编辑器加载中() {
        switch (this.lang) {
            case "zh_CN": return "正在准备编辑器…";
            case "zh_CHT": return "正在準備編輯器…";
            case "ja_JP": return "エディタを準備しています…";
            case "en_US":
            default: return "Preparing editor…";
        }
    }
    public get 切换为纯文本编辑器() {
        switch (this.lang) {
            case "zh_CN": return "切换为纯文本编辑器（打开更快）";
            case "zh_CHT": return "切換為純文本編輯器（打開更快）";
            case "ja_JP": return "プレーンテキストエディタに切り替え（高速）";
            case "en_US":
            default: return "Switch to plain text editor (faster)";
        }
    }
    public get 切换为富文本编辑器() {
        switch (this.lang) {
            case "zh_CN": return "切换为富文本编辑器";
            case "zh_CHT": return "切換為富文本編輯器";
            case "ja_JP": return "リッチテキストエディタに切り替え";
            case "en_US":
            default: return "Switch to rich text editor";
        }
    }
    public get 批注占位() {
        switch (this.lang) {
            case "zh_CN": return "输入批注内容…";
            case "zh_CHT": return "輸入批註內容…";
            case "ja_JP": return "注釈を入力…";
            case "en_US":
            default: return "Type annotation…";
        }
    }
    public get 富文本() {
        switch (this.lang) {
            case "zh_CN": return "富文本";
            case "zh_CHT": return "富文本";
            case "ja_JP": return "リッチテキスト";
            case "en_US":
            default: return "Rich text";
        }
    }
    public get 纯文本() {
        switch (this.lang) {
            case "zh_CN": return "纯文本";
            case "zh_CHT": return "純文本";
            case "ja_JP": return "プレーンテキスト";
            case "en_US":
            default: return "Plain text";
        }
    }
    public get 增大字号() {
        switch (this.lang) {
            case "zh_CN": return "增大字号（12~22）";
            case "zh_CHT": return "增大字號（12~22）";
            case "ja_JP": return "フォントサイズを大きく（12~22）";
            case "en_US":
            default: return "Increase font size (12-22)";
        }
    }
    public get 减小字号() {
        switch (this.lang) {
            case "zh_CN": return "减小字号（12~22）";
            case "zh_CHT": return "減小字號（12~22）";
            case "ja_JP": return "フォントサイズを小さく（12~22）";
            case "en_US":
            default: return "Decrease font size (12-22)";
        }
    }
    public get 批注已被删除() {
        switch (this.lang) {
            case "zh_CN": return "这条批注已被删除（可能在其他设备）";
            case "zh_CHT": return "這條批註已被刪除（可能在其他設備）";
            case "ja_JP": return "この注釈は削除されました（他のデバイスの可能性）";
            case "en_US":
            default: return "This annotation was deleted (possibly on another device)";
        }
    }

    // 渐进设置页卡片化（2026-08-24）新增的分区标题键。□11（2026-09-01）：区内除右键
    // 三项外还有块图标菜单与移动端菜单开关，标题宽化为「菜单入口」（各条目自说明入口类型）
    public get 菜单入口() {
        switch (this.lang) {
            case "zh_CN": return "菜单入口";
            case "es_ES": return "Entradas de menú";
            case "fr_FR": return "Entrées de menu";
            case "ja_JP": return "メニュー入口";
            case "zh_CHT": return "選單入口";
            case "it_IT": return "Voci di menu";
            case "de_DE": return "Menüeinträge";
            case "he_IL": return "כניסות תפריט";
            case "ru_RU": return "Элементы меню";
            case "pl_PL": return "Elementy menu";
            case "en_US": return "Menu entries";
            default: return "Menu entries";
        }
    }

    public get 基础设置() {
        switch (this.lang) {
            case "zh_CN": return "基础设置";
            case "es_ES": return "Configuración básica";
            case "fr_FR": return "Réglages de base";
            case "ja_JP": return "基本設定";
            case "zh_CHT": return "基礎設定";
            case "it_IT": return "Impostazioni di base";
            case "de_DE": return "Grundeinstellungen";
            case "he_IL": return "הגדרות בסיסיות";
            case "ru_RU": return "Основные настройки";
            case "pl_PL": return "Ustawienia podstawowe";
            case "en_US": return "Basic settings";
            default: return "Basic settings";
        }
    }

    public get 摘抄与制卡() {
        switch (this.lang) {
            case "zh_CN": return "摘抄与制卡";
            case "es_ES": return "Copiado y tarjetas";
            case "fr_FR": return "Copie et cartes";
            case "ja_JP": return "要約とカード作成";
            case "zh_CHT": return "摘抄與制卡";
            case "it_IT": return "Copia e schede";
            case "de_DE": return "Exzerpieren & Karten";
            case "he_IL": return "מיצוי וכרטיסים";
            case "ru_RU": return "Выписки и карточки";
            case "pl_PL": return "Notatki i fiszki";
            case "en_US": return "Digest & cards";
            default: return "Digest & cards";
        }
    }

    public get 移动端浮条固定顶部() {
        switch (this.lang) {
            case "zh_CN": return "移动端浮条固定顶部";
            case "zh_CHT": return "行動端浮條固定頂部";
            default: return "Mobile floatbar pinned to top";
        }
    }

    public get 分片按钮组() {
        switch (this.lang) {
            case "zh_CN": return "分片按钮组";
            case "es_ES": return "Botones de fragmentos";
            case "fr_FR": return "Boutons de fragments";
            case "ja_JP": return "断片ボタン";
            case "zh_CHT": return "分片按鈕組";
            case "it_IT": return "Pulsanti frammento";
            case "de_DE": return "Fragment-Schaltflächen";
            case "he_IL": return "כפתורי קטעים";
            case "ru_RU": return "Кнопки фрагментов";
            case "pl_PL": return "Przyciski fragmentów";
            case "en_US": return "Fragment buttons";
            default: return "Fragment buttons";
        }
    }

    public get 分片都加入闪卡() {
        switch (this.lang) {
            case "zh_CN": return "分片都加入闪卡";
            case "es_ES": return "Añadir todas las fragmentaciones a las tarjetas";
            case "fr_FR": return "Ajouter toutes les partitions aux cartes mémoire";
            case "ja_JP": return "すべての断片をフラッシュカードに追加";
            case "zh_CHT": return "分片都加入閃卡";
            case "it_IT": return "Aggiungi tutte le partizioni alle flashcard";
            case "de_DE": return "Alle Segmente zu Flashcards hinzufügen";
            case "he_IL": return "הוסף את כל הקטעים לכרטיסיות פלאש";
            case "ru_RU": return "Добавить все фрагменты в карточки";
            case "pl_PL": return "Dodaj wszystkie fragmenty do fiszek";
            case "en_US": return "Add all segments to flashcards";
            default: return "Add all segments to flashcards";
        }
    }

    public get 所有() {
        switch (this.lang) {
            case "zh_CN": return "所有";
            case "es_ES": return "Todos";
            case "fr_FR": return "Tous";
            case "ja_JP": return "すべて";
            case "zh_CHT": return "所有";
            case "it_IT": return "Tutti";
            case "de_DE": return "Alle";
            case "he_IL": return "הכול";
            case "ru_RU": return "Все";
            case "pl_PL": return "Wszystkie";
            case "en_US":
            default:
                return "All";
        }
    }
    public get 创建所有分片() {
        switch (this.lang) {
            case "zh_CN": return "创建所有分片";
            case "es_ES": return "Crear todas las fragmentaciones";
            case "fr_FR": return "Créer toutes les fragments";
            case "ja_JP": return "すべてのシャードを作成";
            case "zh_CHT": return "創建所有分片";
            case "it_IT": return "Crea tutte le frammentazioni";
            case "de_DE": return "Alle Shards erstellen";
            case "he_IL": return "צור את כל הפיצולים";
            case "ru_RU": return "Создать все фрагменты";
            case "pl_PL": return "Utwórz wszystkie fragmenty";
            case "en_US":
            default: return "Create all shards";
        }
    }
    public get 立刻创建所有的分片() {
        switch (this.lang) {
            case "zh_CN": return "立刻创建所有的分片（耗时）";
            case "es_ES": return "Crear todas las fragmentaciones de inmediato (tiempo consumido)";
            case "fr_FR": return "Créer immédiatement toutes les fragments (prend du temps)";
            case "ja_JP": return "すべての断片をすぐに作成する（時間がかかります）";
            case "zh_CHT": return "立即創建所有分片（耗時）";
            case "it_IT": return "Crea immediatamente tutte le frammentazioni (richiede tempo)";
            case "de_DE": return "Sofort alle Fragmente erstellen (zeitaufwändig)";
            case "he_IL": return "צור מיד את כל השברים (מצריך זמן)";
            case "ru_RU": return "Создать все фрагменты сразу (занимает время)";
            case "pl_PL": return "Natychmiast utwórz wszystkie fragmenty (czasochłonne)";
            case "ar_SA": return "إنشاء جميع الأجزاء على الفور (يستغرق وقتًا)";
            case "pt_BR": return "Criar todas as fragmentações imediatamente (consome tempo)";
            case "en_US":
            default: return "Create all shards immediately (time-consuming)";
        }
    }

    public get 计划读完本书的天数() {
        switch (this.lang) {
            case "zh_CN": return "计划读完本书的天数，'0'为无计划";
            case "es_ES": return "Días planeados para terminar este libro, '0' significa sin plan";
            case "fr_FR": return "Jours prévus pour terminer ce livre, '0' signifie sans plan";
            case "ja_JP": return "この本を読み終える予定日数、'0'は計画なし";
            case "zh_CHT": return "計劃讀完本書的天數，'0'為無計劃";
            case "it_IT": return "Giorni previsti per finire questo libro, '0' significa nessun piano";
            case "de_DE": return "Geplante Tage zum Abschließen dieses Buches, '0' bedeutet kein Plan";
            case "he_IL": return "ימי התוכנית לסיום הספר הזה, '0' פירושו ללא תוכנית";
            case "ru_RU": return "Запланированное количество дней для прочтения этой книги, '0' означает без плана";
            case "pl_PL": return "Zaplanowane dni na przeczytanie tej książki, '0' oznacza brak planu";
            case "ar_SA": return "أيام المخطط لقراءة هذه الكتابة، '0' يعني بدون خطة";
            case "pt_BR": return "Dias planejados para terminar este livro, '0' significa sem plano";
            case "en_US":
            default: return "Days planned to finish this book, '0' means no plan";
        }
    }

    public get 按文本长度拆分() {
        switch (this.lang) {
            case "zh_CN": return "按文本长度拆分，'0'为不拆分";
            case "es_ES": return "Dividir por longitud de texto, '0' significa no dividir";
            case "fr_FR": return "Diviser par longueur de texte, '0' signifie ne pas diviser";
            case "ja_JP": return "テキスト長で分割、'0'は分割しない";
            case "zh_CHT": return "按文本長度拆分，'0'為不拆分";
            case "it_IT": return "Dividi per lunghezza del testo, '0' significa non dividere";
            case "de_DE": return "Nach Textlänge aufteilen, '0' bedeutet nicht aufteilen";
            case "he_IL": return "לחלק לפי אורך הטקסט, '0' פירושו לא לחלק";
            case "ru_RU": return "Разделить по длине текста, '0' означает не разделять";
            case "pl_PL": return "Podziel według długości tekstu, '0' oznacza nie dzielić";
            case "ar_SA": return "قسم حسب طول النص، '0' يعني عدم القسمة";
            case "pt_BR": return "Dividir por comprimento de texto, '0' significa não dividir";
            case "en_US":
            default: return "Split by text length, '0' means do not split";
        }
    }
    public get 分片数量() {
        switch (this.lang) {
            case "zh_CN": return "分片数量";
            case "es_ES": return "Número de fragmentos";
            case "fr_FR": return "Nombre de fragments";
            case "ja_JP": return "シャード数";
            case "zh_CHT": return "分片數量";
            case "it_IT": return "Numero di frammenti";
            case "de_DE": return "Fragmentanzahl";
            case "he_IL": return "מספר פיסות";
            case "ru_RU": return "Количество фрагментов";
            case "pl_PL": return "Liczba fragmentów";
            case "ar_SA": return "عدد الأجزاء";
            case "pt_BR": return "Número de fragmentos";
            case "en_US":
            default: return "Shard Count";
        }
    }

    public get 计算分片数量() {
        switch (this.lang) {
            case "zh_CN": return "计算分片数量";
            case "es_ES": return "Calcular número de fragmentos";
            case "fr_FR": return "Calculer le nombre de fragments";
            case "ja_JP": return "シャード数を計算";
            case "zh_CHT": return "計算分片數量";
            case "it_IT": return "Calcola il numero di frammenti";
            case "de_DE": return "Fragmentanzahl berechnen";
            case "he_IL": return "לחשב מספר פיסות";
            case "ru_RU": return "Вычислить количество фрагментов";
            case "pl_PL": return "Oblicz liczbę fragmentów";
            case "ar_SA": return "حساب عدد الأجزاء";
            case "pt_BR": return "Calcular número de fragmentos";
            case "en_US":
            default: return "Calculate Shard Count";
        }
    }
    public get 天数() {
        switch (this.lang) {
            case "zh_CN": return "天数";
            case "es_ES": return "Días";
            case "fr_FR": return "Jours";
            case "ja_JP": return "日数";
            case "zh_CHT": return "天數";
            case "it_IT": return "Giorni";
            case "de_DE": return "Tage";
            case "he_IL": return "ימים";
            case "ru_RU": return "Дни";
            case "pl_PL": return "Dni";
            case "ar_SA": return "أيام";
            case "pt_BR": return "Dias";
            case "en_US":
            default: return "Days";
        }
    }
    public get 已经激活() {
        switch (this.lang) {
            case "zh_CN": return "已经激活VIP";
            case "es_ES": return "VIP activado";
            case "fr_FR": return "VIP activé";
            case "ja_JP": return "VIPがアクティブです";
            case "zh_CHT": return "已激活VIP";
            case "it_IT": return "VIP attivato";
            case "de_DE": return "VIP aktiviert";
            case "he_IL": return "VIP הופעל";
            case "ru_RU": return "VIP активирован";
            case "pl_PL": return "VIP aktywowany";
            case "ar_SA": return "تم تنشيط VIP";
            case "pt_BR": return "VIP ativado";
            case "en_US":
            default:
                return "VIP activated";
        }
    }
    public 非VIP最多只能激活x个规划学习天数的书籍(x: number) {
        switch (this.lang) {
            case "zh_CN": return `非VIP最多只能激活${x}个规划学习天数的书籍`;
            case "es_ES": return `Los usuarios no VIP solo pueden activar como máximo ${x} libros con días de estudio programados`;
            case "fr_FR": return `Les utilisateurs non VIP ne peuvent activer qu'un maximum de ${x} livres avec des jours d'étude planifiés`;
            case "ja_JP": return `非VIPユーザーは最大${x}冊の学習日数が計画された書籍をアクティブにできます`;
            case "zh_CHT": return `非VIP最多只能啟用${x}個規劃學習天數的書籍`;
            case "it_IT": return `Gli utenti non VIP possono attivare al massimo ${x} libri con giorni di studio pianificati`;
            case "de_DE": return `Nicht-VIP-Benutzer können maximal ${x} Bücher mit geplanten Lern Tagen aktivieren`;
            case "he_IL": return `משתמשים שאינם VIP יכולים להפעיל לכל היותר ${x} ספרים עם ימי לימוד מתוכננים`;
            case "ru_RU": return `Невозможно активировать более ${x} книг с запланированными днями обучения для не-VIP пользователей`;
            case "pl_PL": return `Użytkownicy nie-VIP mogą aktywować maksymalnie ${x} książek z zaplanowanymi dniami nauki`;
            case "ar_SA": return `لا يمكن للمستخدمين غير الـVIP تنشيط أكثر من ${x} كتابًا مع أيام دراسة محددة`;
            case "pt_BR": return `Usuários não-VIP podem ativar no máximo ${x} livros com dias de estudo planejados`;
            case "en_US":
            default: return `Non-VIP users can activate up to ${x} books with planned study days`;
        }
    }
    public get 计划读书的分片由哪个前端自动创建() {
        switch (this.lang) {
            case "zh_CN": return "计划读书的分片由哪个前端自动创建";
            case "es_ES": return "¿Qué frontend crea automáticamente las particiones de lectura programadas?";
            case "fr_FR": return "Quel frontend crée automatiquement les partitions de lecture planifiées ?";
            case "ja_JP": return "計画された読書のシャードはどのフロントエンドによって自動的に作成されますか？";
            case "zh_CHT": return "計劃讀書的分片由哪個前端自動創建？";
            case "it_IT": return "Quale frontend crea automaticamente le partizioni della lettura programmata?";
            case "de_DE": return "Welches Frontend erstellt automatisch die Partitionen für geplantes Lesen?";
            case "he_IL": return "איזה פרונט-אנד יוצר אוטומטית את פיסות הקריאה המתוכננות?";
            case "ru_RU": return "Какой фронтенд автоматически создает фрагменты запланированного чтения?";
            case "pl_PL": return "Który frontend automatycznie tworzy partycje zaplanowanej czytania?";
            case "ar_SA": return "أي واجهة أمامية تقوم بإنشاء أجزاء القراءة المخطط لها تلقائيًا؟";
            case "pt_BR": return "Qual frontend cria automaticamente as partições de leitura planejadas?";
            case "en_US": return "Which frontend automatically creates the shards for scheduled reading?";
            default: return "Which frontend automatically creates the shards for scheduled reading?";
        }
    }
    public get 复习闪卡时隐藏分片按钮组() {
        switch (this.lang) {
            case "zh_CN": return "复习闪卡时隐藏分片按钮组";
            case "es_ES": return "Ocultar grupo de botones de fragmentos al revisar flashcards";
            case "fr_FR": return "Masquer le groupe de boutons de fractionnement lors de la révision des cartes mémoire";
            case "ja_JP": return "フラッシュカード復習時に分割ボタングループを非表示にする";
            case "zh_CHT": return "複習閃卡時隱藏分片按鈕組";
            case "it_IT": return "Nascondi il gruppo di pulsanti di suddivisione durante la revisione delle flashcard";
            case "de_DE": return "Gruppierung von Fragmentierungsschaltflächen beim Wiederholen von Lernkarten ausblenden";
            case "he_IL": return "הסתר את קבוצת כפתורי החלוקה בזמן סקירת כרטיסיות הלימוד";
            case "ru_RU": return "Скрывать группу кнопок фрагментации при повторении карточек";
            case "pl_PL": return "Ukryj grupę przycisków fragmentacji podczas powtarzania fiszek";
            case "ar_SA": return "إخفاء مجموعة أزرار التجزئة أثناء مراجعة البطاقات التعليمية";
            case "pt_BR": return "Ocultar grupo de botões de fragmentação ao revisar cartões";
            case "en_US":
            default: return "Hide fragment buttons group when reviewing flashcards";
        }
    }
    public get 禁用初始化渐进学习浮动按钮() {
        switch (this.lang) {
            case "zh_CN": return "禁用初始化渐进学习浮动按钮";
            case "es_ES": return "Deshabilitar inicialización de botones flotantes de aprendizaje progresivo";
            case "fr_FR": return "Désactiver l'initialisation des boutons flottants d'apprentissage progressif";
            case "ja_JP": return "段階的学習フローティングボタンの初期化を無効化";
            case "zh_CHT": return "禁用初始化漸進學習浮動按鈕";
            case "it_IT": return "Disabilita inizializzazione pulsanti fluttuanti apprendimento progressivo";
            case "de_DE": return "Initialisierung der schwebenden Buttons für progressives Lernen deaktivieren";
            case "he_IL": return "השבת אתחול כפתורים צפים של למידה הדרגתית";
            case "ru_RU": return "Отключить инициализацию плавающих кнопок прогрессивного обучения";
            case "pl_PL": return "Wyłącz inicjalizację pływających przycisków progresywnego uczenia się";
            case "ar_SA": return "تعطيل تهيئة أزرار التعلم التدريجي العائمة";
            case "pt_BR": return "Desabilitar inicialização de botões flutuantes de aprendizado progressivo";
            case "en_US":
            default: return "Disable initialization of progressive learning floating buttons";
        }
    }
    public get 恢复笔记颜色() {
        switch (this.lang) {
            case "zh_CN": return "恢复笔记颜色";
            case "es_ES": return "Restaurar color de nota";
            case "fr_FR": return "Restaurer la couleur de la note";
            case "ja_JP": return "ノートの色を復元";
            case "zh_CHT": return "恢復筆記顏色";
            case "it_IT": return "Ripristina colore nota";
            case "de_DE": return "Notizfarbe wiederherstellen";
            case "he_IL": return "שחזר צבע הערה";
            case "ru_RU": return "Восстановить цвет заметки";
            case "pl_PL": return "Przywróć kolor notatki";
            case "ar_SA": return "استعادة لون الملاحظة";
            case "pt_BR": return "Restaurar cor da nota";
            case "en_US":
            default: return "Restore note color";
        }
    }
    public get 如果有闪卡可复习自动在后台打开() {
        switch (this.lang) {
            case "zh_CN": return "如果有闪卡可复习，自动在后台打开页签，不打断当前工作";
            case "es_ES": return "Si hay tarjetas flash para repasar, abre automáticamente la pestaña en segundo plano sin interrumpir el trabajo actual";
            case "fr_FR": return "Si des cartes flash sont à réviser, ouvre automatiquement l'onglet en arrière-plan sans interrompre le travail en cours";
            case "ja_JP": return "復習するフラッシュカードがある場合、現在の作業を中断せずにバックグラウンドで自動的にタブを開きます";
            case "zh_CHT": return "如果有閃卡可複習，自動在後台打開頁簽，不打斷當前工作";
            case "it_IT": return "Se ci sono flashcard da revisionare, apre automaticamente il tab in secondo piano senza interrompere il lavoro corrente";
            case "de_DE": return "Wenn es Flashcards zum Wiederholen gibt, wird der Tab automatisch im Hintergrund geöffnet, ohne die aktuelle Arbeit zu stören";
            case "he_IL": return "אם יש קלפי פלאש לשינון, תקבל אוטומטית את הלשונית ברקע ללא הפרעה לעבודת הנוכחית";
            case "ru_RU": return "Если есть флешкарты для повторения, автоматически открывается вкладка в фоновом режиме, не прерывая текущую работу";
            case "pl_PL": return "Jeśli istnieją fiszki do powtórzenia, automatycznie otwiera się zakładka w tle, nie przerywając bieżącej pracy";
            case "ar_SA": return "إذا كانت هناك بطاقات فلاش للتعلم، فسيتم فتح التبويب تلقائيًا في الخلفية دون إعاقة العمل الحالي";
            case "pt_BR": return "Se houver flashcards para revisar, abre automaticamente a guia em segundo plano sem interromper o trabalho atual";
            case "en_US": return "If there are flashcards to review, automatically open the tab in the background without interrupting current work";
            default: return "If there are flashcards to review, automatically open the tab in the background without interrupting current work";
        }
    }
    public get 如果无法拖动() {
        switch (this.lang) {
            case "zh_CN": return "如果无法拖动，请排除问题，切回官方主题、禁用其他插件再试试。";
            case "es_ES": return "Si no se puede arrastrar, por favor elimine el problema, vuelva al tema oficial y desactive otros complementos para probarlo.";
            case "fr_FR": return "Si vous ne pouvez pas faire glisser, veuillez résoudre le problème, revenir au thème officiel et désactiver les autres plugins pour essayer.";
            case "ja_JP": return "ドラッグできない場合は、問題を解消し、公式テーマに戻し、他のプラグインを無効にして試してみてください。";
            case "zh_CHT": return "如果無法拖動，請排除問題，切回官方主題、禁用其他外掛再試試。";
            case "it_IT": return "Se non è possibile trascinare, risolvi il problema, torna al tema ufficiale e disabilita gli altri plugin per provare.";
            case "de_DE": return "Wenn Sie nicht ziehen können, beheben Sie das Problem, wechseln Sie zurück zum offiziellen Thema und deaktivieren Sie andere Plugins, um es zu versuchen.";
            case "he_IL": return "אם לא ניתן לגרור, נא לפתור את הבעיה, לחזור לנושא הרשמי ולבטל פלגינים אחרים ולנסות.";
            case "ru_RU": return "Если не удается перетащить, устраните проблему, вернитесь к официальной теме и отключите другие плагины, чтобы попробовать.";
            case "pl_PL": return "Jeśli nie można przeciągnąć, rozwiąż problem, wróć do oficjalnego motywu i wyłącz inne wtyczki, aby spróbować.";
            case "ar_SA": return "إذا لم يكن بإمكانك السحب، يرجى حل المشكلة، والعودة إلى الموضوع الرسمي، وتعطيل البرامج الإضافية الأخرى للمحاولة.";
            case "pt_BR": return "Se não puder arrastar, resolva o problema, volte ao tema oficial e desative outros plugins para tentar.";
            case "en_US": return "If you can't drag, please fix the problem, switch back to the official theme, disable other plugins and try again.";
            default: return "If you can't drag, please fix the problem, switch back to the official theme, disable other plugins and try again.";
        }
    }

    public get 清理文档内容到子文档() {
        switch (this.lang) {
            case "zh_CN": return "清理文档内容到子文档";
            case "es_ES": return "Limpiar el contenido del documento a subdocumentos";
            case "fr_FR": return "Nettoyer le contenu du document vers des sous-documents";
            case "ja_JP": return "ドキュメント内容をサブドキュメントにクリーンアップ";
            case "zh_CHT": return "清理文檔內容到子文檔";
            case "it_IT": return "Pulisci il contenuto del documento nei sotto-documenti";
            case "de_DE": return "Dokumenteninhalt in Unterdokumente bereinigen";
            case "he_IL": return "נקה את תוכן המסמך למסמכים secundariים";
            case "ru_RU": return "Очистить содержимое документа в поддокументы";
            case "pl_PL": return "Wyczyść zawartość dokumentu do poddokumentów";
            case "ar_SA": return "تنظيف محتوى المستند إلى المستندات الفرعية";
            case "pt_BR": return "Limpar o conteúdo do documento para subdocumentos";
            case "en_US":
            default: return "Clean document content to subdocuments";
        }
    }

    public get 清理文档内容() {
        switch (this.lang) {
            case "zh_CN": return "清理文档内容";
            case "es_ES": return "Limpiar contenido del documento";
            case "fr_FR": return "Nettoyer le contenu du document";
            case "ja_JP": return "ドキュメント内容をクリーンアップ";
            case "zh_CHT": return "清理文檔內容";
            case "it_IT": return "Pulisci il contenuto del documento";
            case "de_DE": return "Dokumenteninhalt bereinigen";
            case "he_IL": return "נקה את תוכן המסמך";
            case "ru_RU": return "Очистить содержимое документа";
            case "pl_PL": return "Wyczyść zawartość dokumentu";
            case "ar_SA": return "تنظيف محتوى المستند";
            case "pt_BR": return "Limpar o conteúdo do documento";
            case "en_US":
            default: return "Clean document content";
        }
    }

    public get 补充文件后缀() {
        switch (this.lang) {
            case "zh_CN": return "补充文件后缀，空格隔开";
            case "es_ES": return "Extensiones de archivo complementarias, separadas por espacios";
            case "fr_FR": return "Extensions de fichiers supplémentaires, séparées par des espaces";
            case "ja_JP": return "補足ファイル拡張子、スペースで区切る";
            case "zh_CHT": return "補充文件後綴，空格隔開";
            case "it_IT": return "Estensioni file supplementari, separate da spazi";
            case "de_DE": return "Zusätzliche Dateierweiterungen, durch Leerzeichen getrennt";
            case "he_IL": return "סיומות קבצים משלימות, מופרדות ברווחים";
            case "ru_RU": return "Дополнительные расширения файлов, разделенные пробелами";
            case "pl_PL": return "Dodatkowe rozszerzenia plików, oddzielone spacjami";
            case "ar_SA": return "لواحق الملفات التكميلية، مفصولة بمسافات";
            case "pt_BR": return "Extensões de arquivo complementares, separadas por espaços";
            case "en_US":
            default: return "Supplementary file extensions, separated by spaces";
        }
    }

    public get 选择组别() {
        switch (this.lang) {
            case "zh_CN": return "选择组别";
            case "es_ES": return "Seleccionar grupo";
            case "fr_FR": return "Sélectionner un groupe";
            case "ja_JP": return "グループを選択";
            case "zh_CHT": return "選擇組別";
            case "it_IT": return "Seleziona gruppo";
            case "de_DE": return "Gruppe auswählen";
            case "he_IL": return "בחר קבוצה";
            case "ru_RU": return "Выбрать группу";
            case "pl_PL": return "Wybierz grupę";
            case "ar_SA": return "اختر مجموعة";
            case "pt_BR": return "Selecionar grupo";
            case "en_US":
            default: return "Select Group";
        }
    }
    public get 当前模式() {
        switch (this.lang) {
            case "zh_CN": return "当前模式";
            case "es_ES": return "Modo actual";
            case "fr_FR": return "Mode actuel";
            case "ja_JP": return "現在のモード";
            case "zh_CHT": return "當前模式";
            case "it_IT": return "Modalità corrente";
            case "de_DE": return "Aktueller Modus";
            case "he_IL": return "מצב נוכחי";
            case "ru_RU": return "Текущий режим";
            case "pl_PL": return "Bieżący tryb";
            case "ar_SA": return "الوضع الحالي";
            case "pt_BR": return "Modo atual";
            case "en_US":
            default: return "Current Mode";
        }
    }
    public get 分组() {
        switch (this.lang) {
            case "zh_CN": return "分组";
            case "es_ES": return "Agrupar";
            case "fr_FR": return "Grouper";
            case "ja_JP": return "グループ化";
            case "zh_CHT": return "分組";
            case "it_IT": return "Raggruppa";
            case "de_DE": return "Gruppieren";
            case "he_IL": return "קבץ";
            case "ru_RU": return "Группировать";
            case "pl_PL": return "Grupuj";
            case "ar_SA": return "تجميع";
            case "pt_BR": return "Agrupar";
            case "en_US":
            default: return "Group";
        }
    }
    public get 不分组() {
        switch (this.lang) {
            case "zh_CN": return "不分组";
            case "es_ES": return "No agrupar";
            case "fr_FR": return "Ne pas grouper";
            case "ja_JP": return "グループ化しない";
            case "zh_CHT": return "不分組";
            case "it_IT": return "Non raggruppare";
            case "de_DE": return "Nicht gruppieren";
            case "he_IL": return "אל תקבץ";
            case "ru_RU": return "Не группировать";
            case "pl_PL": return "Nie grupuj";
            case "ar_SA": return "لا تجمع";
            case "pt_BR": return "Não agrupar";
            case "en_US":
            default: return "Ungrouped";
        }
    }

    public get 全局修复文档引用() {
        switch (this.lang) {
            case "zh_CN": return "全局修复文档引用";
            case "es_ES": return "Reparar referencias de documentos globalmente";
            case "fr_FR": return "Réparer globalement les références de documents";
            case "ja_JP": return "ドキュメント参照をグローバルに修復";
            case "zh_CHT": return "全局修復文檔引用";
            case "it_IT": return "Ripara globalmente i riferimenti ai documenti";
            case "de_DE": return "Dokumentreferenzen global reparieren";
            case "he_IL": return "תקן הפניות מסמך גלובליות";
            case "ru_RU": return "Глобально исправить ссылки на документы";
            case "pl_PL": return "Napraw globalnie odniesienia do dokumentów";
            case "ar_SA": return "إصلاح مراجع المستندات عالميًا";
            case "pt_BR": return "Reparar referências de documentos globalmente";
            case "en_US":
            default: return "Globally repair document references";
        }
    }
    public get 全局加固文档引用() {
        switch (this.lang) {
            case "zh_CN": return "全局加固文档引用";
            case "es_ES": return "Reforzar referencias de documentos globalmente";
            case "fr_FR": return "Renforcer globalement les références de documents";
            case "ja_JP": return "ドキュメント参照をグローバルに強化";
            case "zh_CHT": return "全局加固文檔引用";
            case "it_IT": return "Rafforza globalmente i riferimenti ai documenti";
            case "de_DE": return "Dokumentreferenzen global stärken";
            case "he_IL": return "חיזוק הפניות מסמך גלובליות";
            case "ru_RU": return "Глобально усилить ссылки на документы";
            case "pl_PL": return "Wzmocnij globalnie odniesienia do dokumentów";
            case "ar_SA": return "تعزيز مراجع المستندات عالميًا";
            case "pt_BR": return "Reforçar referências de documentos globalmente";
            case "en_US":
            default: return "Globally reinforce document references";
        }
    }

    public get 删除双向链接() {
        switch (this.lang) {
            case "zh_CN": return "删除双向链接";
            case "es_ES": return "Eliminar enlace bidireccional";
            case "fr_FR": return "Supprimer le lien bidirectionnel";
            case "ja_JP": return "双方向リンクを削除";
            case "zh_CHT": return "刪除雙向連結";
            case "it_IT": return "Elimina collegamento bidirezionale";
            case "de_DE": return "Bidirektionalen Link löschen";
            case "he_IL": return "מחק קישור דו-כיווני";
            case "ru_RU": return "Удалить двунаправленную ссылку";
            case "pl_PL": return "Usuń link dwukierunkowy";
            case "ar_SA": return "حذف الرابط ثنائي الاتجاه";
            case "pt_BR": return "Excluir link bidirecional";
            case "en_US":
            default: return "Delete Bidirectional Link";
        }
    }

    public get 块编辑器() {
        switch (this.lang) {
            case "zh_CN": return "块编辑器";
            case "es_ES": return "Editor de bloques";
            case "fr_FR": return "Éditeur de blocs";
            case "ja_JP": return "ブロックエディター";
            case "zh_CHT": return "塊編輯器";
            case "it_IT": return "Editor di blocchi";
            case "de_DE": return "Block-Editor";
            case "he_IL": return "עורך בלוקים";
            case "ru_RU": return "Редактор блоков";
            case "pl_PL": return "Edytor bloków";
            case "ar_SA": return "محرر الكتل";
            case "pt_BR": return "Editor de blocos";
            case "en_US":
            default: return "Block Editor";
        }
    }

    public get 取消钉住() {
        switch (this.lang) {
            case "zh_CN": return "取消钉住，恢复跟随当前文档";
            case "es_ES": return "Quitar fijado, volver a seguir el documento actual";
            case "fr_FR": return "Détacher et suivre à nouveau le document actuel";
            case "ja_JP": return "ピン留めを解除して現在の文書に追従";
            case "zh_CHT": return "取消釘住，恢復跟隨當前文檔";
            case "it_IT": return "Sblocca e torna a seguire il documento corrente";
            case "de_DE": return "Anheften aufheben und dem aktuellen Dokument wieder folgen";
            case "he_IL": return "בטל נעיצה וחזור לעקוב אחר המסמך הנוכחי";
            case "ru_RU": return "Открепить и снова следовать за текущим документом";
            case "pl_PL": return "Odepnij i wróć do podążania za bieżącym dokumentem";
            case "ar_SA": return "إلغاء التثبيت والعودة لمتابعة المستند الحالي";
            case "pt_BR": return "Desafixar e voltar a seguir o documento atual";
            case "en_US":
            default: return "Unpin and follow the current document again";
        }
    }

    public get 显示块编辑器悬浮球() {
        switch (this.lang) {
            case "zh_CN": return "显示块编辑器悬浮球（常驻收缩球，点击展开编辑器面板）";
            case "zh_CHT": return "顯示塊編輯器懸浮球（常駐收縮球，點擊展開編輯器面板）";
            case "ja_JP": return "ブロックエディタのフローティングボールを表示（常駐ボール、クリックでパネル展開）";
            case "es_ES": return "Mostrar el balón flotante del editor de bloques (balón permanente; clic para desplegar el panel)";
            case "fr_FR": return "Afficher la balle flottante de l'éditeur de blocs (balle permanente ; clic pour déplier le panneau)";
            case "it_IT": return "Mostra la palla flottante dell'editor di blocchi (palla persistente; clic per espandere il pannello)";
            case "de_DE": return "Schwebenden Ball des Block-Editors anzeigen (dauerhafter Ball; Klick klappt das Bedienfeld aus)";
            case "he_IL": return "הצג כדור צף של עורך הבלוקים (כדור קבוע; לחיצה מרחיבה את הפאנל)";
            case "ru_RU": return "Показывать плавающий шар блочного редактора (постоянный шар; клик разворачивает панель)";
            case "pl_PL": return "Pokaż pływającą kulę edytora bloków (stała kula; klik rozwija panel)";
            case "ar_SA": return "إظهار الكرة العائمة لمحرر الكتل (كرة دائمة؛ النقر يوسّع اللوحة)";
            case "pt_BR": return "Mostrar a bola flutuante do editor de blocos (bola permanente; clique expande o painel)";
            case "en_US":
            default: return "Show block editor floating ball (persistent ball; click to expand the panel)";
        }
    }

    public get 钉住当前文档() {
        switch (this.lang) {
            case "zh_CN": return "钉住当前文档";
            case "zh_CHT": return "釘住當前文檔";
            case "ja_JP": return "現在の文書をピン留め";
            case "es_ES": return "Fijar el documento actual";
            case "fr_FR": return "Épingler le document actuel";
            case "it_IT": return "Fissa il documento corrente";
            case "de_DE": return "Aktuelles Dokument anheften";
            case "he_IL": return "נעץ את המסמך הנוכחי";
            case "ru_RU": return "Закрепить текущий документ";
            case "pl_PL": return "Przypnij bieżący dokument";
            case "ar_SA": return "تثبيت المستند الحالي";
            case "pt_BR": return "Fixar o documento atual";
            case "en_US":
            default: return "Pin the current document";
        }
    }

    // 块编辑器二期期1（spec §1.1）：面板收起钮 aria-label——只折叠回球，非关闭
    public get 收起面板() {
        switch (this.lang) {
            case "zh_CN": return "收起面板，折叠为悬浮球";
            case "es_ES": return "Contraer el panel a una bola flotante";
            case "fr_FR": return "Réduire le panneau en balle flottante";
            case "ja_JP": return "パネルを折りたたんでフローティングボールにする";
            case "zh_CHT": return "收起面板，折疊為懸浮球";
            case "it_IT": return "Comprimi il pannello in una sfera flottante";
            case "de_DE": return "Panel zu schwebendem Ball einklappen";
            case "he_IL": return "צמצם את הפאנל לכדור צף";
            case "ru_RU": return "Свернуть панель в плавающий шар";
            case "pl_PL": return "Zwiń panel do pływającej kulki";
            case "ar_SA": return "تصغير اللوحة إلى كرة عائمة";
            case "pt_BR": return "Recolher o painel em uma bola flutuante";
            case "en_US":
            default: return "Collapse panel to floating ball";
        }
    }

    public get 白名单为空请先在文档树中右键添加文档() {
        switch (this.lang) {
            case "zh_CN": return "白名单为空，请在文档树中右键添加文件夹或文档";
            case "es_ES": return "La lista blanca está vacía, haga clic derecho en el árbol de documentos para agregar carpetas o documentos";
            case "fr_FR": return "La liste blanche est vide, faites un clic droit sur l'arbre des documents pour ajouter des dossiers ou des documents";
            case "ja_JP": return "ホワイトリストが空です。ドキュメントツリーで右クリックして、フォルダーまたはドキュメントを追加してください";
            case "zh_CHT": return "白名單為空，請在文件樹中右鍵添加資料夾或文件";
            case "it_IT": return "La whitelist è vuota, fare clic con il tasto destro sull'albero dei documenti per aggiungere cartelle o documenti";
            case "de_DE": return "Die Whitelist ist leer. Klicken Sie mit der rechten Maustaste auf den Dokumentbaum, um Ordner oder Dokumente hinzuzufügen";
            case "he_IL": return "הרשימה הלבנה ריקה, לחץ לחיצה ימנית על עץ המסמכים כדי להוסיף תיקיות או מסמכים";
            case "ru_RU": return "Белый список пуст, щелкните правой кнопкой мыши по дереву документов, чтобы добавить папки или документы";
            case "pl_PL": return "Biała lista jest pusta, kliknij prawym przyciskiem myszy drzewo dokumentów, aby dodać foldery lub dokumenty";
            case "ar_SA": return "القائمة البيضاء فارغة، يرجى النقر بزر الماوس الأيمن على شجرة المستندات لإضافة مجلدات أو مستندات";
            case "pt_BR": return "A lista branca está vazia, clique com o botão direito na árvore de documentos para adicionar pastas ou documentos";
            case "en_US":
            default: return "Whitelist is empty, please right-click in the document tree to add folders or documents";
        }
    }
    public get 黑名单为空可在文档树中右键添加() {
        switch (this.lang) {
            case "zh_CN": return "黑名单为空，可在文档树中右键添加文件夹或文档";
            case "es_ES": return "La lista negra está vacía, haga clic derecho en el árbol de documentos para agregar carpetas o documentos";
            case "fr_FR": return "La liste noire est vide, faites un clic droit sur l'arbre des documents pour ajouter des dossiers ou des documents";
            case "ja_JP": return "ブラックリストが空です。ドキュメントツリーで右クリックして、フォルダーまたはドキュメントを追加してください";
            case "zh_CHT": return "黑名單為空，可在文件樹中右鍵添加資料夾或文件";
            case "it_IT": return "La blacklist è vuota, fare clic con il tasto destro sull'albero dei documenti per aggiungere cartelle o documenti";
            case "de_DE": return "Die Blacklist ist leer, klicken Sie mit der rechten Maustaste auf den Dokumentbaum, um Ordner oder Dokumente hinzuzufügen";
            case "he_IL": return "הרשימה השחורה ריקה, לחץ לחיצה ימנית על עץ המסמכים כדי להוסיף תיקיות או מסמכים";
            case "ru_RU": return "Черный список пуст, щелкните правой кнопкой мыши по дереву документов, чтобы добавить папки или документы";
            case "pl_PL": return "Czarna lista jest pusta, kliknij prawym przyciskiem myszy drzewo dokumentów, aby dodać foldery lub dokumenty";
            case "ar_SA": return "القائمة السوداء فارغة، يرجى النقر بزر الماوس الأيمن على شجرة المستندات لإضافة مجلدات أو مستندات";
            case "pt_BR": return "A lista negra está vazia, clique com o botão direito na árvore de documentos para adicionar pastas ou documentos";
            case "en_US":
            default: return "Blacklist is empty, you can right-click in the document tree to add folders or documents";
        }
    }

    public get 导出所有文件() {
        switch (this.lang) {
            case "zh_CN": return "导出所有文件";
            case "es_ES": return "Exportar todos los archivos";
            case "fr_FR": return "Exporter tous les fichiers";
            case "ja_JP": return "すべてのファイルをエクスポート";
            case "zh_CHT": return "導出所有文件";
            case "it_IT": return "Esporta tutti i file";
            case "de_DE": return "Alle Dateien exportieren";
            case "he_IL": return "ייצא את כל הקבצים";
            case "ru_RU": return "Экспортировать все файлы";
            case "pl_PL": return "Eksportuj wszystkie pliki";
            case "ar_SA": return "تصدير جميع الملفات";
            case "pt_BR": return "Exportar todos os arquivos";
            case "en_US": return "Export all files";
            default: return "Export all files";
        }
    }

    public get 导入markdownOrText() {
        switch (this.lang) {
            case "zh_CN": return "导入markdown或者文本文件";
            case "es_ES": return "Importar archivos markdown o de texto";
            case "fr_FR": return "Importer des fichiers markdown ou texte";
            case "ja_JP": return "Markdownまたはテキストファイルをインポート";
            case "zh_CHT": return "匯入markdown或者文字檔案";
            case "it_IT": return "Importa file markdown o di testo";
            case "de_DE": return "Markdown- oder Textdateien importieren";
            case "he_IL": return "ייבוא קובצי markdown או טקסט";
            case "ru_RU": return "Импорт markdown или текстовых файлов";
            case "pl_PL": return "Importuj pliki markdown lub tekstowe";
            case "ar_SA": return "استيراد ملفات markdown أو النص";
            case "pt_BR": return "Importar arquivos markdown ou de texto";
            case "en_US":
            default: return "Import markdown or text files";
        }
    }

    public get 确认() {
        switch (this.lang) {
            case "zh_CN": return "确认";
            case "es_ES": return "Confirmar";
            case "fr_FR": return "Confirmer";
            case "ja_JP": return "確認";
            case "zh_CHT": return "確認";
            case "it_IT": return "Conferma";
            case "de_DE": return "Bestätigen";
            case "he_IL": return "אישור";
            case "ru_RU": return "Подтвердить";
            case "pl_PL": return "Potwierdź";
            case "ar_SA": return "تأكيد";
            case "pt_BR": return "Confirmar";
            case "en_US":
            default: return "Confirm";
        }
    }

    public get utf8Encoding() {
        switch (this.lang) {
            case "zh_CN": return "文件编码必须是utf8";
            case "es_ES": return "La codificación del archivo debe ser UTF-8";
            case "fr_FR": return "L'encodage du fichier doit être UTF-8";
            case "ja_JP": return "ファイルのエンコーディングはUTF-8である必要があります";
            case "zh_CHT": return "文件編碼必須是utf8";
            case "it_IT": return "La codifica del file deve essere UTF-8";
            case "de_DE": return "Die Dateikodierung muss UTF-8 sein";
            case "he_IL": return "קידוד הקובץ חייב להיות UTF-8";
            case "ru_RU": return "Кодировка файла должна быть UTF-8";
            case "pl_PL": return "Kodowanie pliku musi być UTF-8";
            case "ar_SA": return "يجب أن يكون ترميز الملف UTF-8";
            case "pt_BR": return "A codificação do arquivo deve ser UTF-8";
            case "en_US":
            default: return "File encoding must be UTF-8";
        }
    }

    public get 请填写文件的路径() {
        switch (this.lang) {
            case "zh_CN": return "请填写文件的路径";
            case "es_ES": return "Por favor, rellene la ruta del archivo";
            case "fr_FR": return "Veuillez remplir le chemin du fichier";
            case "ja_JP": return "ファイルのパスを入力してください";
            case "zh_CHT": return "請填寫文件的路徑";
            case "it_IT": return "Per favore, inserisci il percorso del file";
            case "de_DE": return "Bitte geben Sie den Dateipfad ein";
            case "he_IL": return "אנא מלא את נתיב הקובץ";
            case "ru_RU": return "Пожалуйста, заполните путь к файлу";
            case "pl_PL": return "Proszę wypełnić ścieżkę pliku";
            case "ar_SA": return "يرجى ملء مسار الملف";
            case "pt_BR": return "Por favor, preencha o caminho do arquivo";
            case "en_US":
            default: return "Please fill in the file path";
        }
    }

    public get 没有有效的摘抄内容() {
        switch (this.lang) {
            case "zh_CN": return "没有有效的摘抄内容";
            case "es_ES": return "No hay contenido de extracción válido";
            case "fr_FR": return "Aucun contenu d'extraction valide";
            case "ja_JP": return "有効な摘抄コンテンツがありません";
            case "zh_CHT": return "沒有有效的摘抄內容";
            case "it_IT": return "Nessun contenuto di estrazione valido";
            case "de_DE": return "Kein gültiger Extraktionsinhalt";
            case "he_IL": return "אין תוכן חילוץ חוקי";
            case "ru_RU": return "Нет действительного содержимого для извлечения";
            case "pl_PL": return "Brak ważnej zawartości ekstrakcji";
            case "ar_SA": return "لا يوجد محتوى استخراج صالح";
            case "pt_BR": return "Nenhum conteúdo de extração válido";
            case "en_US":
            default: return "No valid extraction content";
        }
    }

    public get docNotFound() {
        switch (this.lang) {
            case "zh_CN": return "无法找到文档";
            case "es_ES": return "Documento no encontrado";
            case "fr_FR": return "Document non trouvé";
            case "ja_JP": return "ドキュメントが見つかりません";
            case "zh_CHT": return "無法找到文檔";
            case "it_IT": return "Documento non trovato";
            case "de_DE": return "Dokument nicht gefunden";
            case "he_IL": return "מסמך לא נמצא";
            case "ru_RU": return "Документ не найден";
            case "pl_PL": return "Nie znaleziono dokumentu";
            case "ar_SA": return "المستند غير موجود";
            case "pt_BR": return "Documento não encontrado";
            case "en_US":
            default: return "Document not found";
        }
    }

    public get 需要开启闪卡优先级功能() {
        switch (this.lang) {
            case "zh_CN": return "需要开启闪卡优先级功能";
            case "es_ES": return "Necesita activar la función de prioridad de tarjetas";
            case "fr_FR": return "Besoin d'activer la fonction de priorité des cartes";
            case "ja_JP": return "フラッシュカードの優先度機能を有効にする必要があります";
            case "zh_CHT": return "需要開啟閃卡優先級功能";
            case "it_IT": return "È necessario abilitare la funzione di priorità delle flashcard";
            case "de_DE": return "Kartenprioritätsfunktion muss aktiviert werden";
            case "he_IL": return "צריך להפעיל את פונקציית עדיפות הכרטיס";
            case "ru_RU": return "Нужно включить функцию приоритета карточек";
            case "pl_PL": return "Trzeba włączyć funkcję priorytetu fiszek";
            case "ar_SA": return "بحاجة إلى تفعيل وظيفة أولوية البطاقة";
            case "pt_BR": return "Precisa ativar a função de prioridade do cartão";
            case "en_US":
            default: return "Need to enable card priority feature";
        }
    }
    public get 已激活() {
        switch (this.lang) {
            case "zh_CN": return "已激活";
            case "es_ES": return "Activado";
            case "fr_FR": return "Activé";
            case "ja_JP": return "有効化済み";
            case "zh_CHT": return "已激活";
            case "it_IT": return "Attivato";
            case "de_DE": return "Aktiviert";
            case "he_IL": return "הופעל";
            case "ru_RU": return "Активировано";
            case "pl_PL": return "Aktywowano";
            case "ar_SA": return "تم التفعيل";
            case "pt_BR": return "Ativado";
            case "en_US":
            default: return "Activated";
        }
    }
    public get 打开番茄工具箱购买页() {
        switch (this.lang) {
            case "zh_CN": return "打开番茄工具箱购买页";
            case "es_ES": return "Abrir la página de compra de la caja de herramientas Pomodoro";
            case "fr_FR": return "Ouvrir la page d'achat de la boîte à outils Pomodoro";
            case "ja_JP": return "トマトツールボックスの購入ページを開く";
            case "zh_CHT": return "打開番茄工具箱購買頁";
            case "it_IT": return "Apri la pagina di acquisto degli strumenti Pomodoro";
            case "de_DE": return "Kaufseite der Pomodoro-Werkzeugkasten öffnen";
            case "he_IL": return "פתח את דף הרכישה של תיבת כלים פומודורו";
            case "ru_RU": return "Открыть страницу покупки помидорного набора инструментов";
            case "pl_PL": return "Otwórz stronę zakupu narzędzi Pomodoro";
            case "ar_SA": return "افتح صفحة شراء صندوق أدوات بومودورو";
            case "pt_BR": return "Abrir a página de compra da caixa de ferramentas Pomodoro";
            case "en_US":
            default: return "Open the Pomodoro toolbox purchase page";
        }
    }
    public get 打开渐进学习购买页() {
        switch (this.lang) {
            case "zh_CN": return "打开渐进学习购买页";
            case "es_ES": return "Abrir la página de compra de aprendizaje progresivo";
            case "fr_FR": return "Ouvrir la page d'achat de l'apprentissage progressif";
            case "ja_JP": return "段階的学習の購入ページを開く";
            case "zh_CHT": return "打開漸進學習購買頁";
            case "it_IT": return "Apri la pagina di acquisto dell'apprendimento progressivo";
            case "de_DE": return "Kaufseite des progressiven Lernens öffnen";
            case "he_IL": return "פתח את דף הרכישה של למידה הדרגתית";
            case "ru_RU": return "Открыть страницу покупки прогрессивного обучения";
            case "pl_PL": return "Otwórz stronę zakupu progresywnego uczenia się";
            case "ar_SA": return "افتح صفحة شراء التعلم التدريجي";
            case "pt_BR": return "Abrir a página de compra do aprendizado progressivo";
            case "en_US":
            default: return "Open the progressive learning purchase page";
        }
    }
    public get 购买页() {
        switch (this.lang) {
            case "zh_CN": return "购买";
            case "es_ES": return "Comprar";
            case "fr_FR": return "Acheter";
            case "ja_JP": return "購入";
            case "zh_CHT": return "購買";
            case "it_IT": return "Acquista";
            case "de_DE": return "Kaufen";
            case "he_IL": return "רכישה";
            case "ru_RU": return "Купить";
            case "pl_PL": return "Kup";
            case "ar_SA": return "شراء";
            case "pt_BR": return "Comprar";
            case "en_US":
            default: return "Purchase";
        }
    }
    public get 复购或赠送() {
        switch (this.lang) {
            case "zh_CN": return "复购 / 赠送";
            case "es_ES": return "Recomprar / Regalar";
            case "fr_FR": return "Racheter / Offrir";
            case "ja_JP": return "再購入 / ギフト";
            case "zh_CHT": return "復購 / 贈送";
            case "it_IT": return "Riacquista / Regala";
            case "de_DE": return "Erneut kaufen / Verschenken";
            case "he_IL": return "רכישה חוזרת / מתנה";
            case "ru_RU": return "Купить снова / Подарить";
            case "pl_PL": return "Kup ponownie / Podaruj";
            case "ar_SA": return "إعادة الشراء / إهداء";
            case "pt_BR": return "Recomprar / Presentear";
            case "en_US":
            default: return "Buy again / Gift";
        }
    }
    public get 您已购买无需重复购买() {
        switch (this.lang) {
            case "zh_CN": return "您已购买，无需重复购买；如遇问题可联系客服。";
            case "es_ES": return "Ya lo ha comprado, no necesita comprar de nuevo; si tiene problemas, contacte con atención al cliente.";
            case "fr_FR": return "Vous avez déjà acheté, inutile de racheter ; en cas de problème, contactez le service client.";
            case "ja_JP": return "購入済みのため、再購入は不要です。問題がある場合はカスタマーサポートまで。";
            case "zh_CHT": return "您已購買，無需重複購買；如遇問題可聯繫客服。";
            case "it_IT": return "Hai già acquistato, non è necessario ricomprare; in caso di problemi contatta l'assistenza.";
            case "de_DE": return "Sie haben bereits gekauft, ein erneuter Kauf ist nicht nötig; bei Problemen wenden Sie sich an den Support.";
            case "he_IL": return "כבר רכשת, אין צורך לרכוש שוב; בבעיות פנה לשירות הלקוחות.";
            case "ru_RU": return "Вы уже купили, повторная покупка не требуется; при проблемах обратитесь в поддержку.";
            case "pl_PL": return "Już kupiłeś, nie musisz kupować ponownie; w razie problemów skontaktuj się z pomocą techniczną.";
            case "ar_SA": return "لقد اشتريت بالفعل، ولا حاجة للشراء مرة أخرى؛ في حال وجود مشاكل تواصل مع خدمة العملاء.";
            case "pt_BR": return "Você já comprou, não precisa comprar novamente; em caso de problemas, contate o suporte.";
            case "en_US":
            default: return "You have already purchased; no need to buy again. Contact support if you have issues.";
        }
    }

    // 快捷键就地修改（2026-08-24 □5）HotkeyCap 组件文案
    public get 点击修改快捷键() {
        switch (this.lang) {
            case "zh_CN": return "点击修改快捷键\nEsc 取消\nBackspace 删除";
            case "zh_CHT": return "點擊修改快捷鍵\nEsc 取消\nBackspace 刪除";
            case "es_ES": return "Clic para cambiar el atajo\nEsc para cancelar\nRetroceso para eliminar";
            case "fr_FR": return "Cliquer pour modifier le raccourci\nÉchap pour annuler\nRetour arrière pour supprimer";
            case "ja_JP": return "クリックでショートカットを変更\nEsc でキャンセル\nBackspace で削除";
            case "it_IT": return "Clicca per modificare\nEsc per annullare\nBackspace per eliminare";
            case "de_DE": return "Klicken zum Ändern\nEsc zum Abbrechen\nRücktaste zum Löschen";
            case "he_IL": return "לחץ לשינוי הקיצור\nEsc לביטול\nBackspace למחיקה";
            case "ru_RU": return "Нажмите, чтобы изменить\nEsc — отмена\nBackspace — удалить";
            case "pl_PL": return "Kliknij, aby zmienić\nEsc — anuluj\nBackspace — usuń";
            case "ar_SA": return "انقر لتغيير الاختصار\nEsc للإلغاء\nBackspace للحذف";
            case "pt_BR": return "Clique para alterar o atalho\nEsc para cancelar\nBackspace para excluir";
            case "en_US":
            default: return "Click to change hotkey\nEsc to cancel\nBackspace to remove";
        }
    }
    public get 按下新组合键() {
        switch (this.lang) {
            case "zh_CN": return "按下新组合键…";
            case "zh_CHT": return "按下新組合鍵…";
            case "es_ES": return "Pulsa la nueva combinación…";
            case "fr_FR": return "Appuyez sur la nouvelle combinaison…";
            case "ja_JP": return "新しい組み合わせを押してください…";
            case "it_IT": return "Premi la nuova combinazione…";
            case "de_DE": return "Neue Kombination drücken…";
            case "he_IL": return "הקש שילוב חדש…";
            case "ru_RU": return "Нажмите новую комбинацию…";
            case "pl_PL": return "Naciśnij nową kombinację…";
            case "ar_SA": return "اضغط التركيبة الجديدة…";
            case "pt_BR": return "Pressione a nova combinação…";
            case "en_US":
            default: return "Press new combination…";
        }
    }
    public 与其冲突的快捷键(x: string) {
        switch (this.lang) {
            case "zh_CN": return `冲突：${x}`;
            case "zh_CHT": return `衝突：${x}`;
            case "es_ES": return `Conflicto con: ${x}`;
            case "fr_FR": return `Conflit avec : ${x}`;
            case "ja_JP": return `競合：${x}`;
            case "it_IT": return `In conflitto con: ${x}`;
            case "de_DE": return `Konflikt mit: ${x}`;
            case "he_IL": return `התנגשות עם: ${x}`;
            case "ru_RU": return `Конфликтует с: ${x}`;
            case "pl_PL": return `Konflikt z: ${x}`;
            case "ar_SA": return `تعارض مع: ${x}`;
            case "pt_BR": return `Conflito com: ${x}`;
            case "en_US":
            default: return `Conflicts with: ${x}`;
        }
    }
    public 建议改用(x: string) {
        switch (this.lang) {
            case "zh_CN": return `建议改用 ${x}`;
            case "zh_CHT": return `建議改用 ${x}`;
            case "es_ES": return `Prueba ${x}`;
            case "fr_FR": return `Essayez ${x}`;
            case "ja_JP": return `${x} を推奨`;
            case "it_IT": return `Prova ${x}`;
            case "de_DE": return `Versuche ${x}`;
            case "he_IL": return `נסה ${x}`;
            case "ru_RU": return `Попробуйте ${x}`;
            case "pl_PL": return `Wypróbuj ${x}`;
            case "ar_SA": return `جرّب ${x}`;
            case "pt_BR": return `Tente ${x}`;
            case "en_US":
            default: return `Try ${x} instead`;
        }
    }
    public get 快捷键需要修饰键() {
        switch (this.lang) {
            case "zh_CN": return "单字符键会拦截输入，需搭配 ⌘/⌥/⌃ 修饰键";
            case "zh_CHT": return "單字元鍵會攔截輸入，需搭配 ⌘/⌥/⌃ 修飾鍵";
            case "es_ES": return "Las teclas simples bloquean la escritura; añade un modificador ⌘/⌥/⌃";
            case "fr_FR": return "Les touches seules bloquent la saisie ; ajoutez un modificateur ⌘/⌥/⌃";
            case "ja_JP": return "単一キーは入力を妨げます。⌘/⌥/⌃ 修飾キーを追加してください";
            case "it_IT": return "I tasti singoli bloccano la digitazione; aggiungi un modificatore ⌘/⌥/⌃";
            case "de_DE": return "Einzelne Tasten blockieren die Eingabe; füge ⌘/⌥/⌃ hinzu";
            case "he_IL": return "מקש בודד חוסם הקלדה; הוסף מקש החלפה ⌘/⌥/⌃";
            case "ru_RU": return "Одиночные клавиши мешают вводу; добавьте модификатор ⌘/⌥/⌃";
            case "pl_PL": return "Pojedyncze klawisze blokują pisanie; dodaj modyfikator ⌘/⌥/⌃";
            case "ar_SA": return "المفاتيح المفردة تعيق الكتابة؛ أضف مفتاح تعديل ⌘/⌥/⌃";
            case "pt_BR": return "Teclas simples bloqueiam a digitação; adicione um modificador ⌘/⌥/⌃";
            case "en_US":
            default: return "Single keys block typing; add a ⌘/⌥/⌃ modifier";
        }
    }
    public get 系统保留快捷键() {
        switch (this.lang) {
            case "zh_CN": return "系统保留快捷键，不可使用";
            case "zh_CHT": return "系統保留快捷鍵，不可使用";
            case "es_ES": return "Reservado por el sistema";
            case "fr_FR": return "Réservé par le système";
            case "ja_JP": return "システム予約のショートカットです";
            case "it_IT": return "Riservato dal sistema";
            case "de_DE": return "Vom System reserviert";
            case "he_IL": return "שמור למערכת";
            case "ru_RU": return "Зарезервировано системой";
            case "pl_PL": return "Zarezerwowane przez system";
            case "ar_SA": return "محجوز للنظام";
            case "pt_BR": return "Reservado pelo sistema";
            case "en_US":
            default: return "Reserved by the system";
        }
    }
    public get 已恢复默认() {
        switch (this.lang) {
            case "zh_CN": return "已恢复默认";
            case "zh_CHT": return "已恢復預設";
            case "es_ES": return "Restablecido";
            case "fr_FR": return "Réinitialisé";
            case "ja_JP": return "デフォルトに戻しました";
            case "it_IT": return "Ripristinato";
            case "de_DE": return "Zurückgesetzt";
            case "he_IL": return "אופס לברירת מחדל";
            case "ru_RU": return "Сброшено";
            case "pl_PL": return "Przywrócono domyślne";
            case "ar_SA": return "تمت الاستعادة";
            case "pt_BR": return "Redefinido";
            case "en_US":
            default: return "Reset to default";
        }
    }
    public get 已生效() {
        switch (this.lang) {
            case "zh_CN": return "已生效";
            case "zh_CHT": return "已生效";
            case "es_ES": return "Guardado";
            case "fr_FR": return "Enregistré";
            case "ja_JP": return "保存しました";
            case "it_IT": return "Salvato";
            case "de_DE": return "Gespeichert";
            case "he_IL": return "נשמר";
            case "ru_RU": return "Сохранено";
            case "pl_PL": return "Zapisano";
            case "ar_SA": return "تم الحفظ";
            case "pt_BR": return "Salvo";
            case "en_US":
            default: return "Saved";
        }
    }
    public get 随机可用快捷键() {
        switch (this.lang) {
            case "zh_CN": return "随机分配一个可用快捷键（优先短组合）";
            case "zh_CHT": return "隨機分配一個可用快捷鍵（優先短組合）";
            case "es_ES": return "Asignar aleatoriamente un atajo disponible (se prefieren cortos)";
            case "fr_FR": return "Attribuer aléatoirement un raccourci libre (courts privilégiés)";
            case "ja_JP": return "空いているショートカットをランダム割り当て（短い組み合わせを優先）";
            case "it_IT": return "Assegna casualmente una combinazione libera (preferite le corte)";
            case "de_DE": return "Zufällig eine freie Kombination zuweisen (kurze bevorzugt)";
            case "he_IL": return "הקצה אקראית קיצור פנוי (עדיפים קצרים)";
            case "ru_RU": return "Случайно назначить свободную комбинацию (короткие в приоритете)";
            case "pl_PL": return "Losowo przypisz wolny skrót (preferowane krótkie)";
            case "ar_SA": return "تعيين اختصار متاح عشوائيًا (تفضيل القصير)";
            case "pt_BR": return "Atribuir aleatoriamente um atalho livre (curtos preferidos)";
            case "en_US":
            default: return "Assign a random free hotkey (short combos preferred)";
        }
    }
    public get 删除快捷键() {
        switch (this.lang) {
            case "zh_CN": return "删除快捷键（不再响应键盘）";
            case "zh_CHT": return "刪除快捷鍵（不再回應鍵盤）";
            case "es_ES": return "Eliminar el atajo (dejará de responder)";
            case "fr_FR": return "Supprimer le raccourci (ne répondra plus)";
            case "ja_JP": return "ショートカットを削除（キーに反応しなくなります）";
            case "it_IT": return "Elimina la combinazione (non risponderà più)";
            case "de_DE": return "Kombination löschen (reagiert nicht mehr)";
            case "he_IL": return "מחק את הקיצור (לא יגיב יותר)";
            case "ru_RU": return "Удалить комбинацию (перестанет срабатывать)";
            case "pl_PL": return "Usuń skrót (przestanie działać)";
            case "ar_SA": return "حذف الاختصار (لن يستجيب)";
            case "pt_BR": return "Excluir o atalho (deixará de responder)";
            case "en_US":
            default: return "Remove the hotkey (stops responding)";
        }
    }
    public get 恢复默认快捷键() {
        switch (this.lang) {
            case "zh_CN": return "恢复默认键位";
            case "zh_CHT": return "恢復預設鍵位";
            case "es_ES": return "Restablecer el atajo predeterminado";
            case "fr_FR": return "Rétablir le raccourci par défaut";
            case "ja_JP": return "デフォルトのキーに戻す";
            case "it_IT": return "Ripristina la combinazione predefinita";
            case "de_DE": return "Standardkombination wiederherstellen";
            case "he_IL": return "שחזר את קיצור ברירת המחדל";
            case "ru_RU": return "Вернуть комбинацию по умолчанию";
            case "pl_PL": return "Przywróć domyślny skrót";
            case "ar_SA": return "استعادة الاختصار الافتراضي";
            case "pt_BR": return "Restaurar o atalho padrão";
            case "en_US":
            default: return "Restore default hotkey";
        }
    }
    public get 未设置快捷键() {
        switch (this.lang) {
            case "zh_CN": return "未设置";
            case "zh_CHT": return "未設定";
            case "es_ES": return "Sin asignar";
            case "fr_FR": return "Non défini";
            case "ja_JP": return "未設定";
            case "it_IT": return "Non impostato";
            case "de_DE": return "Nicht gesetzt";
            case "he_IL": return "לא מוגדר";
            case "ru_RU": return "Не задано";
            case "pl_PL": return "Nieustawione";
            case "ar_SA": return "غير معين";
            case "pt_BR": return "Não definido";
            case "en_US":
            default: return "Not set";
        }
    }
    public get 已删除() {
        switch (this.lang) {
            case "zh_CN": return "已删除";
            case "zh_CHT": return "已刪除";
            case "es_ES": return "Eliminado";
            case "fr_FR": return "Supprimé";
            case "ja_JP": return "削除しました";
            case "it_IT": return "Eliminato";
            case "de_DE": return "Gelöscht";
            case "he_IL": return "נמחק";
            case "ru_RU": return "Удалено";
            case "pl_PL": return "Usunięto";
            case "ar_SA": return "تم الحذف";
            case "pt_BR": return "Excluído";
            case "en_US":
            default: return "Removed";
        }
    }

    // 番茄钟老模块（TomatoClock/NoteBox/ReadingPointBox 等）从 JSON 轨迁入（2026-08-25 i18n 归一为 TS 轨）
    public get 请等待上个操作完成() {
        switch (this.lang) {
            case "zh_CN": return "请等待上个操作完成！";
            case "zh_CHT": return "請等待上個操作完成！";
            case "es_ES": return "¡espere a que finalice la operación anterior!";
            case "fr_FR": return "Veuillez attendre la fin de l'opération précédente !";
            case "ja_JP": return "前の操作が完了するまで待ってください！";
            case "en_US":
            default: return "Please wait for the previous operation to finish!";
        }
    }
    public get 番茄钟() {
        switch (this.lang) {
            case "zh_CN": return "番茄钟";
            case "zh_CHT": return "番茄鐘";
            case "es_ES": return "Temporizador de tomate";
            case "fr_FR": return "Chronomètre à tomates";
            case "ja_JP": return "トマトクロック";
            case "en_US":
            default: return "Tomato Timer";
        }
    }
    public get 添加图片遮挡层() {
        switch (this.lang) {
            case "zh_CN": return "添加图片遮挡层";
            case "zh_CHT": return "添加圖片遮擋層";
            case "es_ES": return "agregar capa de imagen";
            case "fr_FR": return "Ajouter un calque de masquage d'image";
            case "ja_JP": return "画像オーバーレイを追加";
            case "en_US":
            default: return "Add picture overlay";
        }
    }
    public get 休息一会儿吧() {
        switch (this.lang) {
            case "zh_CN": return "😊休息一会儿吧！";
            case "zh_CHT": return "😊休息一下吧！";
            case "es_ES": return "😊 Por favor, descansa un momento!";
            case "fr_FR": return "😊 Prenez une pause !";
            case "ja_JP": return "😊 しばらく休憩しましょう！";
            case "en_US":
            default: return "😊 Take a break!";
        }
    }
    public get 分钟后休息() {
        switch (this.lang) {
            case "zh_CN": return "分钟后休息";
            case "zh_CHT": return "分鐘後休息";
            case "es_ES": return "descansar después de minutos";
            case "fr_FR": return "pause après minutes";
            case "ja_JP": return "分後に休憩";
            case "en_US":
            default: return "Take a break after";
        }
    }
    public get 开始计时() {
        switch (this.lang) {
            case "zh_CN": return "开始计时";
            case "zh_CHT": return "開始計時";
            case "es_ES": return "iniciar cuenta regresiva";
            case "fr_FR": return "Démarrer le compte à rebours";
            case "ja_JP": return "カウントダウン開始";
            case "en_US":
            default: return "Start countdown";
        }
    }
    public get 分钟已到() {
        switch (this.lang) {
            case "zh_CN": return "分钟已到";
            case "zh_CHT": return "分鐘已到";
            case "es_ES": return "minutos terminados";
            case "fr_FR": return "minutes écoulées";
            case "ja_JP": return "分間働いた";
            case "en_US":
            default: return "Minutes up";
        }
    }
    public get 请先点击一个内容块() {
        switch (this.lang) {
            case "zh_CN": return "请先点击一个内容块";
            case "zh_CHT": return "請先點擊一個內容塊";
            case "es_ES": return "por favor, haga clic en un bloque de contenido primero";
            case "fr_FR": return "Veuillez cliquer d'abord sur un bloc de contenu";
            case "ja_JP": return "まず内容ブロックをクリックしてください";
            case "en_US":
            default: return "Please click on a block first";
        }
    }
    public get 取消上次的计时() {
        switch (this.lang) {
            case "zh_CN": return "取消上次的计时";
            case "zh_CHT": return "取消上次的計時";
            case "es_ES": return "cancelar la cuenta regresiva anterior";
            case "fr_FR": return "Annuler le compte à rebours précédent";
            case "ja_JP": return "前回のカウントダウンをキャンセル";
            case "en_US":
            default: return "Cancel last countdown";
        }
    }
    public get 取消计时() {
        switch (this.lang) {
            case "zh_CN": return "取消计时";
            case "zh_CHT": return "取消計時";
            case "es_ES": return "cancelar cuenta regresiva";
            case "fr_FR": return "Annuler le compte à rebours";
            case "ja_JP": return "カウントダウンキャンセル";
            case "en_US":
            default: return "Cancel countdown";
        }
    }
    // 番茄钟 □1（暂停/继续+自动循环+常驻倒计时，2026-08-29）；□5 打磨删括号——
    // 括号内容与下方 helpText（工作结束自动进入休息，休息结束回到工作）逐字重复
    public get 自动循环() {
        switch (this.lang) {
            case "zh_CN": return "工作/休息自动循环";
            case "zh_CHT": return "工作/休息自動循環";
            case "es_ES": return "Ciclo automático trabajo/descanso";
            case "fr_FR": return "Cycle automatique travail/pause";
            case "ja_JP": return "作業/休憩の自動サイクル";
            case "en_US":
            default: return "Auto work/break cycle";
        }
    }
    public get 休息时长分钟() {
        switch (this.lang) {
            case "zh_CN": return "休息时长（分钟）";
            case "zh_CHT": return "休息時長（分鐘）";
            case "es_ES": return "Duración del descanso (minutos)";
            case "fr_FR": return "Durée de la pause (minutes)";
            case "ja_JP": return "休憩時間（分）";
            case "en_US":
            default: return "Break length (minutes)";
        }
    }
    public get 暂停计时() {
        switch (this.lang) {
            case "zh_CN": return "暂停计时";
            case "zh_CHT": return "暫停計時";
            case "es_ES": return "Pausar cuenta regresiva";
            case "fr_FR": return "Mettre en pause";
            case "ja_JP": return "タイマーを一時停止";
            case "en_US":
            default: return "Pause timer";
        }
    }
    public get 继续计时() {
        switch (this.lang) {
            case "zh_CN": return "继续计时";
            case "zh_CHT": return "繼續計時";
            case "es_ES": return "Reanudar cuenta regresiva";
            case "fr_FR": return "Reprendre le compte à rebours";
            case "ja_JP": return "タイマーを再開";
            case "en_US":
            default: return "Resume timer";
        }
    }
    public 进入休息分钟(minute: number) {
        switch (this.lang) {
            case "zh_CN": return `🍅进入休息：${minute} 分钟`;
            case "zh_CHT": return `🍅進入休息：${minute} 分鐘`;
            case "es_ES": return `🍅Comienza el descanso: ${minute} minutos`;
            case "fr_FR": return `🍅Début de la pause : ${minute} minutes`;
            case "ja_JP": return `🍅休憩開始：${minute} 分`;
            case "en_US":
            default: return `🍅Break started: ${minute} minutes`;
        }
    }
    public 休息结束开始工作(minute: number) {
        switch (this.lang) {
            case "zh_CN": return `☕休息结束，开始工作：${minute} 分钟`;
            case "zh_CHT": return `☕休息結束，開始工作：${minute} 分鐘`;
            case "es_ES": return `☕Fin del descanso, vuelve al trabajo: ${minute} minutos`;
            case "fr_FR": return `☕Fin de la pause, au travail : ${minute} minutes`;
            case "ja_JP": return `☕休憩終了、作業開始：${minute} 分`;
            case "en_US":
            default: return `☕Break over, back to work: ${minute} minutes`;
        }
    }
    public 休息N分钟(minute: number) {
        switch (this.lang) {
            case "zh_CN": return `休息 ${minute} 分钟`;
            case "zh_CHT": return `休息 ${minute} 分鐘`;
            case "es_ES": return `Descanso de ${minute} minutos`;
            case "fr_FR": return `Pause de ${minute} minutes`;
            case "ja_JP": return `${minute} 分休憩`;
            case "en_US":
            default: return `${minute}-minute break`;
        }
    }
    public get 点击跳到下一阶段() {
        switch (this.lang) {
            case "zh_CN": return "点击跳到下一阶段（工作↔休息）";
            case "zh_CHT": return "點擊跳到下一階段（工作↔休息）";
            case "es_ES": return "Clic para saltar a la siguiente fase (trabajo↔descanso)";
            case "fr_FR": return "Cliquer pour passer à la phase suivante (travail↔pause)";
            case "ja_JP": return "クリックで次のフェーズへ（作業↔休憩）";
            case "en_US":
            default: return "Click to skip to the next phase (work↔break)";
        }
    }
    public get 专注时长写入文档() {
        switch (this.lang) {
            case "zh_CN": return "专注时长写入文档";
            case "zh_CHT": return "專注時長寫入文檔";
            case "es_ES": return "Escribir los minutos de concentración en el documento";
            case "fr_FR": return "Écrire les minutes de concentration dans le document";
            case "ja_JP": return "集中時間をドキュメントに書き込む";
            case "en_US":
            default: return "Write focus minutes to document";
        }
    }
    public get 到点提示音() {
        switch (this.lang) {
            case "zh_CN": return "到点提示音";
            case "zh_CHT": return "到點提示音";
            case "es_ES": return "Sonido al terminar";
            case "fr_FR": return "Son à la fin";
            case "ja_JP": return "終了時にサウンドを再生";
            case "en_US":
            default: return "Play sound on completion";
        }
    }
    public 今日番茄N个M分钟(pomo: number, min: number) {
        switch (this.lang) {
            case "zh_CN": return `今日 ${pomo} 番茄 · ${min} 分钟`;
            case "zh_CHT": return `今日 ${pomo} 番茄 · ${min} 分鐘`;
            case "es_ES": return `Hoy: ${pomo} pomodoros · ${min} minutos`;
            case "fr_FR": return `Aujourd'hui : ${pomo} pomodoros · ${min} minutes`;
            case "ja_JP": return `今日 ${pomo} ポモドーロ · ${min} 分`;
            case "en_US":
            default: return `Today: ${pomo} pomodoros · ${min} min`;
        }
    }

    // 渐进学习文案从 progressive JSON 轨迁入（2026-08-25 i18n 归一为 TS 轨）
    public get 请等待索引建立() {
        switch (this.lang) {
            case "zh_CN": return "⏳请等待索引的建立……然后再继续操作……";
            case "zh_CHT": return "⏳請等待索引的建立……然後再繼續操作……";
            case "es_ES": return "⏳ espere a que se establezca el índice... luego continúe con la operación...";
            case "fr_FR": return "⏳Veuillez attendre la création de l'index... puis continuez à opérer...";
            case "ja_JP": return "⏳インデックスの構築を待ってから操作を続けてください……";
            case "en_US":
            default: return "⏳ Please Wait for Indexing to Be Established... Then Continue Operating...";
        }
    }
    public get 重新推送本书() {
        switch (this.lang) {
            case "zh_CN": return "重新推送本书";
            case "zh_CHT": return "重新推送本書";
            case "es_ES": return "reenviar este libro";
            case "fr_FR": return "Réenvoi de ce livre";
            case "ja_JP": return "この本のプッシュを再開";
            case "en_US":
            default: return "Re-push This Book";
        }
    }
    public get 已经忽略本书() {
        switch (this.lang) {
            case "zh_CN": return "已经忽略本书";
            case "zh_CHT": return "已經忽略本書";
            case "es_ES": return "ya se ha ignorado este libro";
            case "fr_FR": return "Ce livre a déjà été ignoré";
            case "ja_JP": return "この本は無視されました";
            case "en_US":
            default: return "This Book Has Been Ignored";
        }
    }
    public get 自动制卡() {
        switch (this.lang) {
            case "zh_CN": return "自动制卡";
            case "zh_CHT": return "自動制卡";
            case "es_ES": return "crear tarjeta automáticamente";
            case "fr_FR": return "créer automatiquement une fiche";
            case "ja_JP": return "自動カード作成";
            case "en_US":
            default: return "Auto Make Card";
        }
    }
    public get 已经是最后一页了() {
        switch (this.lang) {
            case "zh_CN": return "已经是最后一页了";
            case "zh_CHT": return "已經是最後一頁了";
            case "es_ES": return "ya es la última página";
            case "fr_FR": return "c'est déjà la dernière page";
            case "ja_JP": return "これが最後のページです";
            case "en_US":
            default: return "This is the Last Page";
        }
    }
    public get 已经是第一页了() {
        switch (this.lang) {
            case "zh_CN": return "已经是第一页了";
            case "zh_CHT": return "已經是第一頁了";
            case "es_ES": return "ya es la primera página";
            case "fr_FR": return "c'est déjà la première page";
            case "ja_JP": return "これが最初のページです";
            case "en_US":
            default: return "This is the First Page";
        }
    }
    public get 按标题拆分() {
        switch (this.lang) {
            case "zh_CN": return "标题级别1~6，b是粗体单独一行，逗号隔开，留空不拆分。";
            case "zh_CHT": return "標題級別1~6，b是粗體單獨一行，逗號隔開，留空不拆分。";
            case "es_ES": return "niveles de título 1~6, b es negrita en una línea separada, separados por comas, dejar en blanco para no dividir.";
            case "fr_FR": return "niveaux de titres 1~6, b pour gras sur une ligne séparée, séparés par des virgules, laisser vide pour ne pas diviser.";
            case "ja_JP": return "見出しレベル1〜6、bは太字で1行、カンマで区切り、空欄は分割しない。";
            case "en_US":
            default: return "Heading Levels 1~6, b for Bold on a Separate Line, Comma Separated, Leave Blank for No Split.";
        }
    }
    public get 渐进学习菜单() {
        switch (this.lang) {
            case "zh_CN": return "渐进学习菜单";
            case "zh_CHT": return "漸進學習菜單";
            case "es_ES": return "menú de aprendizaje progresivo";
            case "fr_FR": return "Menu d'apprentissage progressif";
            case "ja_JP": return "漸進学習メニュー";
            case "en_US":
            default: return "Progressive Reading Menu";
        }
    }
    public get 该分片内容已失效() {
        switch (this.lang) {
            case "zh_CN": return "该分片内容已失效（源块已被删除），已跳过";
            case "zh_CHT": return "該分片內容已失效（源塊已被刪除），已跳過";
            case "es_ES": return "este fragmento no está disponible (bloques de origen eliminados), omitido";
            case "fr_FR": return "cette pièce est indisponible (blocs sources supprimés), ignorée";
            case "ja_JP": return "このシャープは無効です（元ブロックが削除済み）、スキップしました";
            case "en_US":
            default: return "This Piece Is Unavailable (Source Blocks Deleted), Skipped";
        }
    }
    public get 正在为您打开文档片段() {
        switch (this.lang) {
            case "zh_CN": return "正在为您打开文档片段，请耐心等待……";
            case "zh_CHT": return "正在為您打開文檔片段，請耐心等待……";
            case "es_ES": return "abriendo el fragmento del documento para ti, por favor ten paciencia...";
            case "fr_FR": return "Ouverture de la pièce de document pour vous, veuillez patienter...";
            case "ja_JP": return "ドキュメントのシャープを開いています、お待ちください……";
            case "en_US":
            default: return "Opening Document Piece for You, Please Wait...";
        }
    }
    public get 请先打开一个文档() {
        switch (this.lang) {
            case "zh_CN": return "请先打开一个文档";
            case "zh_CHT": return "請先打開一個文檔";
            case "es_ES": return "por favor, abra primero un documento";
            case "fr_FR": return "Veuillez d'abord ouvrir un document";
            case "ja_JP": return "まずドキュメントを開いてください";
            case "en_US":
            default: return "Please Open a Document First";
        }
    }
    public get 取消自动文档制卡() {
        switch (this.lang) {
            case "zh_CN": return "取消自动文档制卡";
            case "zh_CHT": return "取消自動文檔制卡";
            case "es_ES": return "cancelar creación automática de tarjetas de documento";
            case "fr_FR": return "Annuler la création automatique de fiches de document";
            case "ja_JP": return "自動ドキュメントカード作成をキャンセル";
            case "en_US":
            default: return "Cancel Auto Document Card Making";
        }
    }
    public get 自动文档制卡() {
        switch (this.lang) {
            case "zh_CN": return "自动文档制卡";
            case "zh_CHT": return "自動文檔制卡";
            case "es_ES": return "crear tarjetas de documento automáticamente";
            case "fr_FR": return "Création automatique de fiches de document";
            case "ja_JP": return "自動ドキュメントカード作成";
            case "en_US":
            default: return "Auto Document Card Making";
        }
    }
    public get 似乎书本已被删除() {
        switch (this.lang) {
            case "zh_CN": return "似乎{bookID}已经被删除";
            case "zh_CHT": return "似乎{bookID}已經被刪除";
            case "es_ES": return "parece que {bookID} ha sido eliminado";
            case "fr_FR": return "Il semble que {bookID} ait été supprimé";
            case "ja_JP": return "{bookID}は削除された可能性があります";
            case "en_US":
            default: return "It Seems {bookID} Has Been Removed";
        }
    }
    public get 加书失败请重试() {
        switch (this.lang) {
            case "zh_CN": return "加书失败，请重试";
            case "zh_CHT": return "加書失敗，請重試";
            case "es_ES": return "Error al añadir el libro, inténtelo de nuevo";
            case "fr_FR": return "Échec de l'ajout du livre, veuillez réessayer";
            case "ja_JP": return "本の追加に失敗しました。再試行してください";
            case "en_US":
            default: return "Failed to Add the Book, Please Retry";
        }
    }
    public get 找不到文档对应的笔记本() {
        switch (this.lang) {
            case "zh_CN": return "找不到文档对应的笔记本：";
            case "zh_CHT": return "找不到文檔對應的筆記本：";
            case "es_ES": return "no se puede encontrar la libreta correspondiente al documento:";
            case "fr_FR": return "Impossible de trouver le cahier correspondant au document :";
            case "ja_JP": return "対応するノートブックが見つかりません：";
            case "en_US":
            default: return "Cannot Find the Notebook Corresponding to the Document:";
        }
    }
    public get 未找到文档请等待索引() {
        switch (this.lang) {
            case "zh_CN": return "未找到文档，请重新建立索引或者等待索引建立完成";
            case "zh_CHT": return "未找到文檔，請重新建立索引或者等待索引建立完成";
            case "es_ES": return "no se encontró el documento, por favor vuelva a crear el índice o espere a que se complete el índice";
            case "fr_FR": return "Document non trouvé, veuillez recréer l'index ou attendre la fin de la création de l'index";
            case "ja_JP": return "ドキュメントが見つかりませんでした、インデックスを再構築するか、インデックス構築が完了するのを待ってください";
            case "en_US":
            default: return "Document Not Found, Please Rebuild Index or Wait for Indexing to Complete";
        }
    }
    public get 请先将此文档加入渐进学习列表() {
        switch (this.lang) {
            case "zh_CN": return "请先将此文档加入渐进学习列表";
            case "zh_CHT": return "請先將此文檔加入漸進學習列表";
            case "es_ES": return "por favor, agregue primero este documento a la lista de aprendizaje progresivo";
            case "fr_FR": return "Veuillez d'abord ajouter ce document à la liste d'apprentissage progressif";
            case "ja_JP": return "まずこのドキュメントを漸進学習リストに追加してください";
            case "en_US":
            default: return "Please Add This Document to the Progressive Reading List First";
        }
    }
    public get 添加文档到渐进阅读() {
        switch (this.lang) {
            case "zh_CN": return "添加文档/重新添加文档到渐进阅读";
            case "zh_CHT": return "添加文檔/重新添加文檔到漸進閱讀";
            case "es_ES": return "agregar documento/volver a agregar documento al aprendizaje progresivo";
            case "fr_FR": return "Ajouter/réajouter un document à la lecture progressive";
            case "ja_JP": return "ドキュメントを漸進読書に追加/再追加";
            case "en_US":
            default: return "Add/Re-add Document to Progressive Reading";
        }
    }
    public get 删除并下一个() {
        switch (this.lang) {
            case "zh_CN": return "🗑 ➡";
            case "zh_CHT": return "🗑 ➡";
            case "es_ES": return "🗑 ➡";
            case "fr_FR": return "🗑 ➡";
            case "ja_JP": return "🗑 ➡";
            case "en_US":
            default: return "🗑 ➡";
        }
    }
    public get 删除并返回() {
        switch (this.lang) {
            case "zh_CN": return "⬅ 🗑";
            case "zh_CHT": return "⬅ 🗑";
            case "es_ES": return "⬅ 🗑";
            case "fr_FR": return "⬅ 🗑";
            case "ja_JP": return "⬅ 🗑";
            case "en_US":
            default: return "⬅ 🗑";
        }
    }
    public get 您还没添加任何文档() {
        switch (this.lang) {
            case "zh_CN": return "您还没添加任何文档。";
            case "zh_CHT": return "您還沒添加任何文檔。";
            case "es_ES": return "aún no ha agregado ningún documento.";
            case "fr_FR": return "Vous n'avez encore ajouté aucun document.";
            case "ja_JP": return "まだドキュメントを追加していません。";
            case "en_US":
            default: return "You Haven't Added Any Documents Yet.";
        }
    }

    // v5 □4：问题/心得标记（thinkQueue 状态机）与摘抄对话框瘦身
    public get 摘抄并标问题() {
        switch (this.lang) {
            case "zh_CN": return "摘抄并标问题（定期重访直到弄懂）";
            case "es_ES": return "Extraer y marcar como pregunta";
            case "fr_FR": return "Extraire et marquer comme question";
            case "ja_JP": return "摘録して質問としてマーク";
            case "zh_CHT": return "摘抄並標問題";
            case "it_IT": return "Estrai e contrassegna come domanda";
            case "de_DE": return "Extrahieren und als Frage markieren";
            case "he_IL": return "חלץ וסמן כשאלה";
            case "ru_RU": return "Извлечь и пометить как вопрос";
            case "pl_PL": return "Wyodrębnij i oznacz jako pytanie";
            case "ar_SA": return "استخرج وعلّم كسؤال";
            case "pt_BR": return "Extrair e marcar como pergunta";
            case "en_US":
            default: return "Digest & mark as question";
        }
    }

    public get 问题已解决() {
        switch (this.lang) {
            case "zh_CN": return "已解决，转心得";
            case "es_ES": return "Resuelto, convertir en idea";
            case "fr_FR": return "Résolu, transformer en idée";
            case "ja_JP": return "解決、心得に変換";
            case "zh_CHT": return "已解決，轉心得";
            case "it_IT": return "Risolto, converti in idea";
            case "de_DE": return "Gelöst, in Einblick umwandeln";
            case "he_IL": return "נפתר, הפוך לתובנה";
            case "ru_RU": return "Решено, превратить в вывод";
            case "pl_PL": return "Rozwiązane, zamień w przemyślenie";
            case "ar_SA": return "تم الحل، حوّل إلى فكرة";
            case "pt_BR": return "Resolvido, transformar em insight";
            case "en_US":
            default: return "Resolved, turn into insight";
        }
    }

    public get 还没懂稍后再看() {
        switch (this.lang) {
            case "zh_CN": return "还没懂，稍后重访";
            case "es_ES": return "Aún no lo entiendo, revisitar luego";
            case "fr_FR": return "Pas encore compris, revisiter plus tard";
            case "ja_JP": return "まだ分かりません、後で再訪";
            case "zh_CHT": return "還沒懂，稍後重訪";
            case "it_IT": return "Non capito ancora, rivedrai più tardi";
            case "de_DE": return "Noch nicht verstanden, später wiederholen";
            case "he_IL": return "עוד לא הבנתי, אבקר שוב מאוחר יותר";
            case "ru_RU": return "Пока не понял, повторить позже";
            case "pl_PL": return "Jeszcze nie rozumiem, wróć później";
            case "ar_SA": return "لم أفهم بعد، أعد الزيارة لاحقًا";
            case "pt_BR": return "Ainda não entendi, revisitar depois";
            case "en_US":
            default: return "Still not understood, revisit later";
        }
    }

    public get 标为心得() {
        switch (this.lang) {
            case "zh_CN": return "标为心得";
            case "es_ES": return "Marcar como idea";
            case "fr_FR": return "Marquer comme idée";
            case "ja_JP": return "心得としてマーク";
            case "zh_CHT": return "標為心得";
            case "it_IT": return "Contrassegna come idea";
            case "de_DE": return "Als Einblick markieren";
            case "he_IL": return "סמן כתובנה";
            case "ru_RU": return "Пометить как вывод";
            case "pl_PL": return "Oznacz jako przemyślenie";
            case "ar_SA": return "علّم كفكرة";
            case "pt_BR": return "Marcar como insight";
            case "en_US":
            default: return "Mark as insight";
        }
    }

    public get 取消心得标记() {
        switch (this.lang) {
            case "zh_CN": return "取消心得标记";
            case "es_ES": return "Quitar marca de idea";
            case "fr_FR": return "Retirer la marque d'idée";
            case "ja_JP": return "心得マークを解除";
            case "zh_CHT": return "取消心得標記";
            case "it_IT": return "Rimuovi contrassegno idea";
            case "de_DE": return "Einblick-Markierung aufheben";
            case "he_IL": return "הסר סימון תובנה";
            case "ru_RU": return "Снять пометку вывода";
            case "pl_PL": return "Usuń oznaczenie przemyślenia";
            case "ar_SA": return "إزالة علامة الفكرة";
            case "pt_BR": return "Remover marca de insight";
            case "en_US":
            default: return "Unmark insight";
        }
    }

    // 菜单翻新（2026-09-02）：原右键一级「标为心得/取消心得标记」并入「重访调度…」子菜单的
    // 新文案键（心得=reviewQueue done 终态；zh+en 一等，同 □12 重访调度族惯例）
    public get 标为心得不再重访() {
        switch (this.lang) {
            case "zh_CN": return "标为心得（不再重访）";
            case "zh_CHT": return "標為心得（不再重訪）";
            case "en_US":
            default: return "Mark as insight (no more revisit)";
        }
    }

    public get 已标心得不再重访() {
        switch (this.lang) {
            case "zh_CN": return "已标心得（不再重访）";
            case "zh_CHT": return "已標心得（不再重訪）";
            case "en_US":
            default: return "Marked as insight (no more revisit)";
        }
    }

    public get 更多工具() {
        switch (this.lang) {
            case "zh_CN": return "更多工具";
            case "es_ES": return "Más herramientas";
            case "fr_FR": return "Plus d'outils";
            case "ja_JP": return "その他のツール";
            case "zh_CHT": return "更多工具";
            case "it_IT": return "Altri strumenti";
            case "de_DE": return "Weitere Werkzeuge";
            case "he_IL": return "כלים נוספים";
            case "ru_RU": return "Ещё инструменты";
            case "pl_PL": return "Więcej narzędzi";
            case "ar_SA": return "المزيد من الأدوات";
            case "pt_BR": return "Mais ferramentas";
            case "en_US":
            default: return "More tools";
        }
    }

    public get 已推迟重访() {
        switch (this.lang) {
            case "zh_CN": return "已推迟，N 天后重访";
            case "es_ES": return "Aplazado, revisita en N días";
            case "fr_FR": return "Reporté, revoir dans N jours";
            case "ja_JP": return "延期しました、N日後に再訪";
            case "zh_CHT": return "已推遲，N天後重訪";
            case "it_IT": return "Rinviato, rivedrai tra N giorni";
            case "de_DE": return "Verschoben, Wiederholung in N Tagen";
            case "he_IL": return "נדחה, ייבדק שוב בעוד N ימים";
            case "ru_RU": return "Отложено, повтор через N дней";
            case "pl_PL": return "Odroczone, powrót za N dni";
            case "ar_SA": return "تم التأجيل، إعادة زيارة بعد N يومًا";
            case "pt_BR": return "Adiado, revisita em N dias";
            case "en_US":
            default: return "Postponed, revisit in N days";
        }
    }

    // ============ v5 □12 重访调度通用化（zh+en 一等，其余落 en） ============

    public get 重访调度() {
        switch (this.lang) {
            case "zh_CN": return "重访调度…";
            case "zh_CHT": return "重訪調度…";
            case "en_US":
            default: return "Revisit schedule…";
        }
    }

    public get 曲线重访() {
        switch (this.lang) {
            case "zh_CN": return "曲线重访（3·6·12…60 天）";
            case "zh_CHT": return "曲線重訪（3·6·12…60 天）";
            case "en_US":
            default: return "Curve revisit (3·6·12…60d)";
        }
    }

    public 每N天重访(n: number) {
        switch (this.lang) {
            case "zh_CN": return `每 ${n} 天重访`;
            case "zh_CHT": return `每 ${n} 天重訪`;
            case "en_US":
            default: return `Revisit every ${n} days`;
        }
    }

    public get 移除重访调度() {
        switch (this.lang) {
            case "zh_CN": return "移除重访调度";
            case "zh_CHT": return "移除重訪調度";
            case "en_US":
            default: return "Remove revisit schedule";
        }
    }

    public get 推迟到明天() {
        switch (this.lang) {
            case "zh_CN": return "推迟到明天";
            case "zh_CHT": return "推遲到明天";
            case "en_US":
            default: return "Postpone to tomorrow";
        }
    }

    public get 本轮已完成() {
        switch (this.lang) {
            case "zh_CN": return "本轮已完成";
            case "zh_CHT": return "本輪已完成";
            case "en_US":
            default: return "Round done";
        }
    }

    public get 已完成转心得() {
        switch (this.lang) {
            case "zh_CN": return "已完成，转为心得";
            case "zh_CHT": return "已完成，轉為心得";
            case "en_US":
            default: return "Done, marked as insight";
        }
    }

    public 已完成重访(n: number) {
        switch (this.lang) {
            case "zh_CN": return `已完成，${n} 天后重访`;
            case "zh_CHT": return `已完成，${n} 天後重訪`;
            case "en_US":
            default: return `Done, revisit in ${n} days`;
        }
    }

    public get 已设曲线重访() {
        switch (this.lang) {
            case "zh_CN": return "已设曲线重访，3 天后首次重访";
            case "zh_CHT": return "已設曲線重訪，3 天後首次重訪";
            case "en_US":
            default: return "Curve revisit set, first in 3 days";
        }
    }

    public 已设每N天重访(n: number) {
        switch (this.lang) {
            case "zh_CN": return `已设每 ${n} 天重访`;
            case "zh_CHT": return `已設每 ${n} 天重訪`;
            case "en_US":
            default: return `Revisit every ${n} days set`;
        }
    }

    public get 调度已移除() {
        switch (this.lang) {
            case "zh_CN": return "已移除重访调度";
            case "zh_CHT": return "已移除重訪調度";
            case "en_US":
            default: return "Revisit schedule removed";
        }
    }

    public get 重访到期待办() {
        switch (this.lang) {
            case "zh_CN": return "重访到期待办";
            case "zh_CHT": return "重訪到期待辦";
            case "en_US":
            default: return "Due revisits";
        }
    }

    // ============ 期2 复访通道（滚动复习摘抄文档，zh+en 一等，其余落 en） ============

    public get 复访() {
        switch (this.lang) {
            case "zh_CN": return "复访";
            case "zh_CHT": return "複訪";
            case "en_US":
            default: return "Revisit";
        }
    }

    public get tip复访() {
        switch (this.lang) {
            case "zh_CN": return "摘抄并滚动复习：默认 3 天起步逐步拉长，到期出现在 ✧ 待办，永不结业";
            case "zh_CHT": return "摘抄並滾動複習：默認 3 天起步逐步拉長，到期出現在 ✧ 待辦，永不結業";
            case "en_US":
            default: return "Digest with rolling review: starts at 3 days, resurfaces in ✧ todo, never ends";
        }
    }

    public 已加入复访N天后回来(n: number) {
        switch (this.lang) {
            case "zh_CN": return `已加入复访，${n} 天后再来`;
            case "zh_CHT": return `已加入複訪，${n} 天後再來`;
            case "en_US":
            default: return `Added to revisit, back in ${n} days`;
        }
    }

    public 已完成复访N天(n: number) {
        switch (this.lang) {
            case "zh_CN": return `已完成本轮复访，${n} 天后再来`;
            case "zh_CHT": return `已完成本輪複訪，${n} 天後再來`;
            case "en_US":
            default: return `Revisit done, next in ${n} days`;
        }
    }

    public get 不再复访() {
        switch (this.lang) {
            case "zh_CN": return "不再复访（移除调度）";
            case "zh_CHT": return "不再複訪（移除調度）";
            case "en_US":
            default: return "Stop revisiting (remove)";
        }
    }

    public get 复访节奏() {
        switch (this.lang) {
            case "zh_CN": return "复访节奏…";
            case "zh_CHT": return "複訪節奏…";
            case "en_US":
            default: return "Revisit schedule…";
        }
    }

    public 今日还有N条到期摘抄(n: number) {
        switch (this.lang) {
            case "zh_CN": return `今日还有 ${n} 条到期摘抄`;
            case "zh_CHT": return `今日還有 ${n} 條到期摘抄`;
            case "en_US":
            default: return `${n} digest(s) due today`;
        }
    }

    public get 不再推送复访确认() {
        switch (this.lang) {
            case "zh_CN": return "移除该文档所有摘抄的复访调度？";
            case "zh_CHT": return "移除該文檔所有摘抄的複訪調度？";
            case "en_US":
            default: return "Remove revisit schedules of all digests from this document?";
        }
    }

    public get tip不再推送复访() {
        switch (this.lang) {
            case "zh_CN": return "该文档所有摘抄退出滚动复访（与书忽略互不影响）";
            case "zh_CHT": return "該文檔所有摘抄退出滾動複訪（與書忽略互不影響）";
            case "en_US":
            default: return "All digests of this doc exit rolling revisit (book ignore unaffected)";
        }
    }

    public 已移除N条复访(n: number) {
        switch (this.lang) {
            case "zh_CN": return `已移除 ${n} 条复访调度`;
            case "zh_CHT": return `已移除 ${n} 條複訪調度`;
            case "en_US":
            default: return `Removed ${n} revisit schedule(s)`;
        }
    }

    public get 暂无复访摘抄() {
        switch (this.lang) {
            case "zh_CN": return "该文档暂无复访中的摘抄";
            case "zh_CHT": return "該文檔暫無複訪中的摘抄";
            case "en_US":
            default: return "No revisiting digests for this document";
        }
    }

    // □7 摘抄浮条 ✧ 复访动作组（digest 态主排钮+两态菜单）

    public get tip复访管理() {
        switch (this.lang) {
            case "zh_CN": return "本摘抄的滚动复访：加入 / 完成一轮 / 改节奏 / 退出，到期时按钮角亮红点";
            case "zh_CHT": return "本摘抄的滾動複訪：加入 / 完成一輪 / 改節奏 / 退出，到期時按鈕角亮紅點";
            case "en_US":
            default: return "Rolling revisit of this digest: join / finish a round / reschedule / leave; red dot when due";
        }
    }

    public 复访中标题(mode: string, days: number | null) {
        switch (this.lang) {
            case "zh_CN": return `复访中 · ${mode} · ${days == null ? "已到期" : `${days} 天后到期`}`;
            case "zh_CHT": return `複訪中 · ${mode} · ${days == null ? "已到期" : `${days} 天後到期`}`;
            case "en_US":
            default: return `Revisiting · ${mode} · ${days == null ? "due now" : `next in ${days}d`}`;
        }
    }

    // □9 ✧ 待办三段排期视图（已到期/未来 7 天/更远；zh+en 一等，其余落 en）

    public get 复习排期() {
        switch (this.lang) {
            case "zh_CN": return "复习排期";
            case "zh_CHT": return "複習排期";
            case "en_US":
            default: return "Review schedule";
        }
    }

    public 段已到期(n: number) {
        switch (this.lang) {
            case "zh_CN": return `已到期（${n}）`;
            case "zh_CHT": return `已到期（${n}）`;
            case "en_US":
            default: return `Due (${n})`;
        }
    }

    public 段未来7天(n: number) {
        switch (this.lang) {
            case "zh_CN": return `未来 7 天（${n}）`;
            case "zh_CHT": return `未來 7 天（${n}）`;
            case "en_US":
            default: return `Next 7 days (${n})`;
        }
    }

    public 段更远(n: number) {
        switch (this.lang) {
            case "zh_CN": return `更远（${n}）`;
            case "zh_CHT": return `更遠（${n}）`;
            case "en_US":
            default: return `Later (${n})`;
        }
    }

    public N天后(n: number) {
        switch (this.lang) {
            case "zh_CN": return `${n} 天后`;
            case "zh_CHT": return `${n} 天後`;
            case "en_US":
            default: return `in ${n}d`;
        }
    }

    // ============ v5 □16 摘抄工作流深化（zh+en 一等，其余落 en） ============

    public get 整篇摘抄() {
        switch (this.lang) {
            case "zh_CN": return "整篇摘抄";
            case "zh_CHT": return "整篇摘抄";
            case "en_US":
            default: return "Digest whole doc";
        }
    }

    public get 分片已重建() {
        switch (this.lang) {
            case "zh_CN": return "分片已重建";
            case "zh_CHT": return "分片已重建";
            case "en_US":
            default: return "Piece rebuilt";
        }
    }

    public get 已定位到原文块() {
        switch (this.lang) {
            case "zh_CN": return "已定位到原文块";
            case "zh_CHT": return "已定位到原文塊";
            case "en_US":
            default: return "Located the source block in the book";
        }
    }

    public get 已回到分片() {
        switch (this.lang) {
            case "zh_CN": return "已回到分片";
            case "zh_CHT": return "已回到分片";
            case "en_US":
            default: return "Back to the piece";
        }
    }

    public get 已回到原书() {
        switch (this.lang) {
            case "zh_CN": return "已回到原书";
            case "zh_CHT": return "已回到原書";
            case "en_US":
            default: return "Back to the book";
        }
    }

    public get 已回到发起文档() {
        switch (this.lang) {
            case "zh_CN": return "已回到发起文档";
            case "zh_CHT": return "已回到發起文檔";
            case "en_US":
            default: return "Back to the source doc";
        }
    }

    public get 暂无到期重访() {
        switch (this.lang) {
            case "zh_CN": return "暂无到期重访";
            case "zh_CHT": return "暫無到期重訪";
            case "en_US":
            default: return "No due revisits";
        }
    }

    // ============ v5 □5 浮条三态（docs/prog-v5-floatbar-design.md；zh+en 一等，其余落 en） ============

    public get 浮条() {
        switch (this.lang) {
            case "zh_CN": return "浮条";
            case "zh_CHT": return "浮條";
            case "en_US":
            default: return "Float bar";
        }
    }

    public get 收起() {
        switch (this.lang) {
            case "zh_CN": return "收起";
            case "zh_CHT": return "收起";
            case "en_US":
            default: return "Collapse";
        }
    }

    // □14b 平铺区折叠钮 tooltip（单行制：折叠/展开是自解释动作，无用法句无快捷键）
    public get 收起工具区() {
        switch (this.lang) {
            case "zh_CN": return "收起工具区";
            case "zh_CHT": return "收起工具區";
            case "en_US":
            default: return "Collapse the tray";
        }
    }

    public get 展开工具区() {
        switch (this.lang) {
            case "zh_CN": return "展开工具区";
            case "zh_CHT": return "展開工具區";
            case "en_US":
            default: return "Expand the tray";
        }
    }

    public get 浮条主排按钮提示() {
        switch (this.lang) {
            case "zh_CN": return "勾选的按钮站片态浮条首行，未勾的落首行下方平铺区小格（永不消失）；桌面也可在浮条上直接拖拽换位（含低频与高级钮），效果同勾选";
            case "zh_CHT": return "勾選的按鈕站片態浮條首行，未勾的落首行下方平鋪區小格（永不消失）；桌面也可在浮條上直接拖拽換位（含低頻與高級鈕），效果同勾選";
            case "en_US":
            default: return "Checked buttons sit on the first row; unchecked ones become small cells in the flat area below (never lost). On desktop you can also drag buttons directly on the bar, including low-frequency and advanced ones.";
        }
    }

    // □10 平铺区短标签（docs/prog-floatbar-ux-redesign.md □10 视觉规格 i18n 清单 2026-08-29）：
    // 只供格内文字（2-6 字），tooltip 全名走既有长文案 getter，两层互不挤占。
    // zh_CHT 由规格表给定，其余语种回落 en（缺翻译落英文既有哲学）。
    public get 换书() {
        switch (this.lang) {
            case "zh_CN": return "换书";
            case "zh_CHT": return "換書";
            case "en_US":
            default: return "Swap book";
        }
    }
    public get 下片删() {
        switch (this.lang) {
            case "zh_CN": return "下片删";
            case "zh_CHT": return "下片刪";
            case "en_US":
            default: return "Next (del)";
        }
    }
    public get 回看() {
        switch (this.lang) {
            case "zh_CN": return "回看";
            case "zh_CHT": return "回看";
            case "en_US":
            default: return "Re-read";
        }
    }
    public get 上片删() {
        switch (this.lang) {
            case "zh_CN": return "上片删";
            case "zh_CHT": return "上片刪";
            case "en_US":
            default: return "Prev (del)";
        }
    }
    public get 重插() {
        switch (this.lang) {
            case "zh_CN": return "重插";
            case "zh_CHT": return "重插";
            case "en_US":
            default: return "Reinsert";
        }
    }
    public get 删原文() {
        switch (this.lang) {
            case "zh_CN": return "删原文";
            case "zh_CHT": return "刪原文";
            case "en_US":
            default: return "Del original";
        }
    }
    public get 删片退出() {
        switch (this.lang) {
            case "zh_CN": return "删片退出";
            case "zh_CHT": return "刪片退出";
            case "en_US":
            default: return "Del & exit";
        }
    }
    public get 不再推送() {
        switch (this.lang) {
            case "zh_CN": return "不再推送";
            case "zh_CHT": return "不再推送";
            case "en_US":
            default: return "Mute book";
        }
    }
    public get 原地制卡短() {
        switch (this.lang) {
            case "zh_CN": return "原地制卡";
            case "zh_CHT": return "原地製卡";
            case "en_US":
            default: return "Card here";
        }
    }
    public get 制日卡() {
        switch (this.lang) {
            case "zh_CN": return "制日卡";
            case "zh_CHT": return "製日卡";
            case "en_US":
            default: return "Daily card";
        }
    }
    public get 制日卡无引() {
        switch (this.lang) {
            case "zh_CN": return "制日卡无引";
            case "zh_CHT": return "製日卡無引";
            case "en_US":
            default: return "Daily no-ref";
        }
    }
    public get 多行() {
        switch (this.lang) {
            case "zh_CN": return "多行";
            case "zh_CHT": return "多行";
            case "en_US":
            default: return "Multiline";
        }
    }
    public get 收集() {
        switch (this.lang) {
            case "zh_CN": return "收集";
            case "zh_CHT": return "收集";
            case "en_US":
            default: return "Collect";
        }
    }
    public get 移上一片() {
        switch (this.lang) {
            case "zh_CN": return "移上一片";
            case "zh_CHT": return "移上一片";
            case "en_US":
            default: return "Move prev";
        }
    }
    public get 移下一片() {
        switch (this.lang) {
            case "zh_CN": return "移下一片";
            case "zh_CHT": return "移下一片";
            case "en_US":
            default: return "Move next";
        }
    }
    public get 提取全部() {
        switch (this.lang) {
            case "zh_CN": return "提取全部";
            case "zh_CHT": return "提取全部";
            case "en_US":
            default: return "Extract all";
        }
    }
    public get 提取到底() {
        switch (this.lang) {
            case "zh_CN": return "提取到底";
            case "zh_CHT": return "提取到底";
            case "en_US":
            default: return "To bottom";
        }
    }
    public get 去色() {
        switch (this.lang) {
            case "zh_CN": return "去色";
            case "zh_CHT": return "去色";
            case "en_US":
            default: return "Uncolor";
        }
    }
    public get 恢复颜色() {
        switch (this.lang) {
            case "zh_CN": return "恢复颜色";
            case "zh_CHT": return "恢復顏色";
            case "en_US":
            default: return "Recolor";
        }
    }
    public get 合并() {
        switch (this.lang) {
            case "zh_CN": return "合并";
            case "zh_CHT": return "合併";
            case "en_US":
            default: return "Merge";
        }
    }
    /** □10 平铺区高级动作解析不到编辑器时的 toast（reasoning review P2） */
    public get 分片编辑器未就绪() {
        switch (this.lang) {
            case "zh_CN": return "未找到可用编辑器，请先打开分片文档";
            case "zh_CHT": return "未找到可用編輯器，請先打開分片文檔";
            case "en_US":
            default: return "No editor found; open the piece document first";
        }
    }

    public get 分片() {
        switch (this.lang) {
            case "zh_CN": return "分片";
            case "zh_CHT": return "分片";
            case "en_US":
            default: return "Piece";
        }
    }

    public get 摘抄() {
        switch (this.lang) {
            case "zh_CN": return "摘抄";
            case "zh_CHT": return "摘抄";
            case "en_US":
            default: return "Digest";
        }
    }

    /** □2 摘抄文档标题胶囊类型字标（片摘/书摘/札记三态，digestTagKind 判定） */
    public get 片摘() {
        switch (this.lang) {
            case "zh_CN": return "片摘";
            case "zh_CHT": return "片摘";
            case "en_US":
            default: return "Piece";
        }
    }

    public get 书摘() {
        switch (this.lang) {
            case "zh_CN": return "书摘";
            case "zh_CHT": return "書摘";
            case "en_US":
            default: return "Book";
        }
    }

    public get 札记徽章() {
        switch (this.lang) {
            case "zh_CN": return "札记";
            case "zh_CHT": return "札記";
            case "en_US":
            default: return "Note";
        }
    }

    /** 胶囊 hover 来源提示第二行（第一行=类型字标；name=来源文档名） */
    public 摘抄来源提示(name: string) {
        switch (this.lang) {
            case "zh_CN": return `来源：${name}`;
            case "zh_CHT": return `來源：${name}`;
            case "en_US":
            default: return `From: ${name}`;
        }
    }

    /** 多摘列表头部计数（可见性期1 □1 B）：N=去重后的摘抄文档数 */
    public 摘抄列表共(n: number) {
        switch (this.lang) {
            case "zh_CN": return `共 ${n} 条摘抄`;
            case "zh_CHT": return `共 ${n} 條摘抄`;
            case "en_US":
            default: return `${n} digest${n === 1 ? "" : "s"} in total`;
        }
    }

    /** 摘抄态 origin 钮（可见性期1 □1 C 跳分片改名）：四级链通常落片，「回原书」名不副实 */
    public get 回分片() {
        switch (this.lang) {
            case "zh_CN": return "回分片";
            case "zh_CHT": return "回分片";
            case "en_US":
            default: return "Back to piece";
        }
    }

    public get 本书附属卡() {
        switch (this.lang) {
            case "zh_CN": return "本书附属卡·到期 {N}";
            case "zh_CHT": return "本書附屬卡·到期 {N}";
            case "en_US":
            default: return "Book cards · {N} due";
        }
    }

    /** 附属卡（无到期占位）：设置面板按钮池等列名场景，占位版见 本书附属卡 */
    public get 附属卡() {
        switch (this.lang) {
            case "zh_CN": return "本书附属卡";
            case "zh_CHT": return "本書附屬卡";
            case "en_US":
            default: return "Book cards";
        }
    }

    public get 下一片删本片() {
        switch (this.lang) {
            case "zh_CN": return "下一片·删本片";
            case "zh_CHT": return "下一片·刪本片";
            case "en_US":
            default: return "Next piece (delete this)";
        }
    }

    public get 纯回看上一片() {
        switch (this.lang) {
            case "zh_CN": return "纯回看上一片";
            case "zh_CHT": return "純回看上一片";
            case "en_US":
            default: return "Re-read previous piece";
        }
    }

    public get 回原书() {
        switch (this.lang) {
            case "zh_CN": return "回原书";
            case "zh_CHT": return "回原書";
            case "en_US":
            default: return "Back to book";
        }
    }

    public get 继续读() {
        switch (this.lang) {
            case "zh_CN": return "继续读（从断点开片）";
            case "zh_CHT": return "繼續讀（從斷點開片）";
            case "en_US":
            default: return "Continue reading";
        }
    }

    public get 摘抄汇总() {
        switch (this.lang) {
            case "zh_CN": return "摘抄汇总";
            case "zh_CHT": return "摘抄匯總";
            case "en_US":
            default: return "All digests of this book";
        }
    }

    public get 跳到分片() {
        switch (this.lang) {
            case "zh_CN": return "跳到分片";
            case "zh_CHT": return "跳到分片";
            case "en_US":
            default: return "Jump to piece";
        }
    }

    public get 归档本书() {
        switch (this.lang) {
            case "zh_CN": return "归档本书";
            case "zh_CHT": return "歸檔本書";
            case "en_US":
            default: return "Archive this book";
        }
    }

    public get 归档本书确认() {
        switch (this.lang) {
            case "zh_CN": return "归档《{name}》？原书将退出一切推送，摘抄永久留存。";
            case "zh_CHT": return "歸檔《{name}》？原書將退出一一切推送，摘抄永久留存。";
            case "en_US":
            default: return "Archive \"{name}\"? The book stops being served; digests are kept forever.";
        }
    }

    public get 已归档本书() {
        switch (this.lang) {
            case "zh_CN": return "已归档本书";
            case "zh_CHT": return "已歸檔本書";
            case "en_US":
            default: return "Book archived";
        }
    }

    public get 送进仿写() {
        switch (this.lang) {
            case "zh_CN": return "送进仿写";
            case "zh_CHT": return "送進仿寫";
            case "en_US":
            default: return "Send to Recite";
        }
    }

    public get 仿写本片() {
        switch (this.lang) {
            case "zh_CN": return "仿写本片";
            case "zh_CHT": return "仿寫本片";
            case "en_US":
            default: return "Recite this piece";
        }
    }

    public get 摘抄选中内容() {
        switch (this.lang) {
            case "zh_CN": return "摘抄选中内容";
            case "zh_CHT": return "摘抄選中內容";
            case "en_US":
            default: return "Digest selection";
        }
    }

    public get 更多操作() {
        switch (this.lang) {
            case "zh_CN": return "更多操作";
            case "zh_CHT": return "更多操作";
            case "en_US":
            default: return "More";
        }
    }

    public get 留档() {
        switch (this.lang) {
            case "zh_CN": return "留档";
            case "zh_CHT": return "留檔";
            case "en_US":
            default: return "Keep (no schedule)";
        }
    }

    /** 摘抄四态名（可见性期2 □2 A 活状态图标，留档/思考中已有） */
    public get 背诵中() {
        switch (this.lang) {
            case "zh_CN": return "背诵中";
            case "zh_CHT": return "背誦中";
            case "en_US":
            default: return "Reciting";
        }
    }

    public get 复访中() {
        switch (this.lang) {
            case "zh_CN": return "复访中";
            case "zh_CHT": return "複訪中";
            case "en_US":
            default: return "Revisiting";
        }
    }

    /** 复习计划面板行文案（可见性期3 □3）：模式/到期日距离 */
    public 计划每N天(n: number) {
        switch (this.lang) {
            case "zh_CN": return `每 ${n} 天`;
            case "zh_CHT": return `每 ${n} 天`;
            case "en_US":
            default: return `every ${n}d`;
        }
    }

    public 计划曲线N次(n: number) {
        switch (this.lang) {
            case "zh_CN": return `曲线 · 已 ${n} 次`;
            case "zh_CHT": return `曲線 · 已 ${n} 次`;
            case "en_US":
            default: return `curve · ${n} done`;
        }
    }

    public 计划逾期N(n: number) {
        switch (this.lang) {
            case "zh_CN": return `逾期 ${n} 天`;
            case "zh_CHT": return `逾期 ${n} 天`;
            case "en_US":
            default: return `${n}d overdue`;
        }
    }

    public get 计划今天() {
        switch (this.lang) {
            case "zh_CN": return "今天";
            case "zh_CHT": return "今天";
            case "en_US":
            default: return "today";
        }
    }

    public 计划N天后(n: number) {
        switch (this.lang) {
            case "zh_CN": return `${n} 天后`;
            case "zh_CHT": return `${n} 天後`;
            case "en_US":
            default: return `in ${n}d`;
        }
    }

    public get 复习计划() {
        switch (this.lang) {
            case "zh_CN": return "复习计划";
            case "zh_CHT": return "複習計劃";
            case "en_US":
            default: return "Review Plan";
        }
    }

    public get 计划空态标题() {
        switch (this.lang) {
            case "zh_CN": return "还没有任何复习计划";
            case "zh_CHT": return "還沒有任何複習計劃";
            case "en_US":
            default: return "No review schedule yet";
        }
    }

    public get 计划空态说明() {
        switch (this.lang) {
            case "zh_CN": return "摘抄时选 ✧ 复访或 ❓ 思考，摘抄就会按节奏回来找你";
            case "zh_CHT": return "摘抄時選 ✧ 複訪或 ❓ 思考，摘抄就會按節奏回來找你";
            case "en_US":
            default: return "Pick ✧ Revisit or ❓ Think when digesting, and your digests will come back on a rhythm";
        }
    }

    public 计划到期N条(n: number) {
        switch (this.lang) {
            case "zh_CN": return `${n} 条到期`;
            case "zh_CHT": return `${n} 條到期`;
            case "en_US":
            default: return `${n} due`;
        }
    }

    /** 可见性期4 □4 A：cardMode 全局默认三档（书 IAL custom-book-single-card 优先级链不动） */
    public get 摘抄制卡模式() {
        switch (this.lang) {
            case "zh_CN": return "摘抄制卡模式";
            case "zh_CHT": return "摘抄製卡模式";
            case "en_US":
            default: return "Digest card mode";
        }
    }
    public get tip设置制卡模式() {
        switch (this.lang) {
            case "zh_CN": return "全局默认：不入卡（纯留档）/ 只留最新一摘（新摘替换旧卡）/ 每摘皆卡；单本书可在书内单独设置覆盖。附属卡（本书附属卡）只含摘抄卡";
            case "zh_CHT": return "全局默認：不入卡（純留檔）/ 只留最新一摘（新摘替換舊卡）/ 每摘皆卡；單本書可在書內單獨設置覆蓋。附屬卡（本書附屬卡）只含摘抄卡";
            case "en_US":
            default: return "Global default: none (archive only) / latest only (new digest replaces old card) / every digest becomes a card; per-book IAL overrides. Book cards contain digest cards only";
        }
    }
    public get 制卡不入卡() {
        switch (this.lang) {
            case "zh_CN": return "不入卡（纯留档）";
            case "zh_CHT": return "不入卡（純留檔）";
            case "en_US":
            default: return "No cards (archive only)";
        }
    }
    public get 制卡只留最新() {
        switch (this.lang) {
            case "zh_CN": return "只留最新一摘";
            case "zh_CHT": return "只留最新一摘";
            case "en_US":
            default: return "Latest digest only";
        }
    }
    public get 制卡每摘皆卡() {
        switch (this.lang) {
            case "zh_CN": return "每摘皆卡";
            case "zh_CHT": return "每摘皆卡";
            case "en_US":
            default: return "Every digest becomes a card";
        }
    }
    public get menu整篇摘抄() {
        switch (this.lang) {
            case "zh_CN": return "整篇摘抄（整文档一次摘完）";
            case "zh_CHT": return "整篇摘抄（整文檔一次摘完）";
            case "en_US":
            default: return "digest whole document at once";
        }
    }
    public get menu重访调度() {
        switch (this.lang) {
            case "zh_CN": return "重访调度（块级思考曲线/日程）";
            case "zh_CHT": return "重訪調度（塊級思考曲線/日程）";
            case "en_US":
            default: return "block-level think schedule";
        }
    }
    public get menu复访节奏() {
        switch (this.lang) {
            case "zh_CN": return "复访节奏（摘抄文档级滚动复访）";
            case "zh_CHT": return "複訪節奏（摘抄文檔級滾動複訪）";
            case "en_US":
            default: return "digest-level revisit rhythm";
        }
    }

    public get 计划完成() {
        switch (this.lang) {
            case "zh_CN": return "完成";
            case "zh_CHT": return "完成";
            case "en_US":
            default: return "Done";
        }
    }

    public get 计划推迟() {
        switch (this.lang) {
            case "zh_CN": return "推迟";
            case "zh_CHT": return "推遲";
            case "en_US":
            default: return "Later";
        }
    }

    /** 复习计划面板未归书组名（札记匣等无书归属的摘抄） */
    public get 未归书() {
        switch (this.lang) {
            case "zh_CN": return "未归书";
            case "zh_CHT": return "未歸書";
            case "en_US":
            default: return "Unfiled";
        }
    }

    public get 思考() {
        switch (this.lang) {
            case "zh_CN": return "思考";
            case "zh_CHT": return "思考";
            case "en_US":
            default: return "Think";
        }
    }

    public get 背诵() {
        switch (this.lang) {
            case "zh_CN": return "背诵";
            case "zh_CHT": return "背誦";
            case "en_US":
            default: return "Recite";
        }
    }

    public get 单词() {
        switch (this.lang) {
            case "zh_CN": return "单词";
            case "zh_CHT": return "單詞";
            case "en_US":
            default: return "Word";
        }
    }

    public get 仿写() {
        switch (this.lang) {
            case "zh_CN": return "仿写";
            case "zh_CHT": return "仿寫";
            case "en_US":
            default: return "Rewrite";
        }
    }

    public get 多行挑选() {
        switch (this.lang) {
            case "zh_CN": return "多行挑选";
            case "zh_CHT": return "多行挑選";
            case "en_US":
            default: return "Pick lines";
        }
    }

    public get 请先选择要摘抄的块() {
        switch (this.lang) {
            case "zh_CN": return "请先选择要摘抄的块";
            case "zh_CHT": return "請先選擇要摘抄的塊";
            case "en_US":
            default: return "Select blocks to digest first";
        }
    }

    public get 请先选中文本() {
        switch (this.lang) {
            case "zh_CN": return "请先选中文本";
            case "zh_CHT": return "請先選中文本";
            case "en_US":
            default: return "Select text first";
        }
    }

    public get 本书还没有摘抄() {
        switch (this.lang) {
            case "zh_CN": return "本书还没有摘抄";
            case "zh_CHT": return "本書還沒有摘抄";
            case "en_US":
            default: return "No digests for this book yet";
        }
    }

    public get 未找到仿写插件功能() {
        switch (this.lang) {
            case "zh_CN": return "未找到仿写插件功能，请确认 recite 已安装启用";
            case "zh_CHT": return "未找到仿寫插件功能，請確認 recite 已安裝啟用";
            case "en_US":
            default: return "Recite plugin not available";
        }
    }

    public get 渐进学习浮条开关() {
        switch (this.lang) {
            case "zh_CN": return "浮条与悬浮球总开关";
            case "zh_CHT": return "浮條與懸浮球總開關";
            case "en_US":
            default: return "Toggle float bar & ball";
        }
    }

    // v5 □6 状态栏火苗 + 左 Dock 舰队总览（zh+en 一等，缺翻译落英文）
    public get 舰队总览() {
        switch (this.lang) {
            case "zh_CN": return "舰队总览";
            case "zh_CHT": return "艦隊總覽";
            case "en_US":
            default: return "Reading fleet";
        }
    }

    public get 今日阅读() {
        switch (this.lang) {
            case "zh_CN": return "今日阅读";
            case "zh_CHT": return "今日閱讀";
            case "en_US":
            default: return "Today";
        }
    }

    public 火苗提示(read: number, quota: number, debt: number, digestDue = 0) {
        // 期2 复访通道尾行：非阻塞提示（不占 quota 不进欠债），无到期不占行
        const due = digestDue > 0
            ? (this.lang === "zh_CN" ? `\n今日还有 ${digestDue} 条到期摘抄`
                : this.lang === "zh_CHT" ? `\n今日還有 ${digestDue} 條到期摘抄`
                    : `\n${digestDue} digest(s) due today`)
            : "";
        switch (this.lang) {
            case "zh_CN": return `今日已读 ${read}/${quota} · 欠债 ${debt}${due}\n点击直达下一片`;
            case "zh_CHT": return `今日已讀 ${read}/${quota} · 欠債 ${debt}${due}\n點擊直達下一片`;
            case "en_US":
            default: return `Today ${read}/${quota} · debt ${debt}${due}\nClick for next piece`;
        }
    }

    public get 火苗欠债标签() {
        switch (this.lang) {
            case "zh_CN": return "欠";
            case "zh_CHT": return "欠";
            case "en_US":
            default: return "debt";
        }
    }

    public 欠N片(n: number) {
        switch (this.lang) {
            case "zh_CN": return `欠 ${n} 片`;
            case "zh_CHT": return `欠 ${n} 片`;
            case "en_US":
            default: return `${n} owed`;
        }
    }

    public get 每日目标() {
        switch (this.lang) {
            case "zh_CN": return "每日目标片数";
            case "zh_CHT": return "每日目標片數";
            case "en_US":
            default: return "Daily quota";
        }
    }

    public 每日目标N片(n: number) {
        switch (this.lang) {
            case "zh_CN": return `每日目标 ${n} 片`;
            case "zh_CHT": return `每日目標 ${n} 片`;
            case "en_US":
            default: return `Daily quota: ${n}`;
        }
    }

    public get 近14天阅读() {
        switch (this.lang) {
            case "zh_CN": return "近14天阅读";
            case "zh_CHT": return "近14天閱讀";
            case "en_US":
            default: return "Last 14 days";
        }
    }

    public get 开始今日阅读() {
        switch (this.lang) {
            case "zh_CN": return "开始今日阅读";
            case "zh_CHT": return "開始今日閱讀";
            case "en_US":
            default: return "Start today's reading";
        }
    }

    public get 加入第一本书() {
        switch (this.lang) {
            case "zh_CN": return "把当前文档加入渐进阅读";
            case "zh_CHT": return "把當前文檔加入漸進閱讀";
            case "en_US":
            default: return "Add current doc as first book";
        }
    }

    public get 管理书目() {
        switch (this.lang) {
            case "zh_CN": return "管理书目";
            case "zh_CHT": return "管理書目";
            case "en_US":
            default: return "Manage books";
        }
    }

    public get 已读完() {
        switch (this.lang) {
            case "zh_CN": return "已读完";
            case "zh_CHT": return "已讀完";
            case "en_US":
            default: return "Finished";
        }
    }

    public 共N本书(n: number) {
        switch (this.lang) {
            case "zh_CN": return `${n} 本书`;
            case "zh_CHT": return `${n} 本書`;
            case "en_US":
            default: return `${n} ${n === 1 ? "book" : "books"}`;
        }
    }

    public get 书架空空() {
        switch (this.lang) {
            case "zh_CN": return "书架空空，从一本书开始吧";
            case "zh_CHT": return "書架空空，從一本書開始吧";
            case "en_US":
            default: return "Empty shelf — start with a book";
        }
    }

    public get 书架空空说明() {
        switch (this.lang) {
            case "zh_CN": return "把长书切成分片，每日滚筒轮转，读完即删";
            case "zh_CHT": return "把長書切成分片，每日滾筒輪轉，讀完即刪";
            case "en_US":
            default: return "Slice a long book, rotate daily, delete as read";
        }
    }

    public get 加载中() {
        switch (this.lang) {
            case "zh_CN": return "加载中…";
            case "zh_CHT": return "載入中…";
            case "en_US":
            default: return "Loading…";
        }
    }

    public get 搜索书名() {
        switch (this.lang) {
            case "zh_CN": return "搜索书名…";
            case "zh_CHT": return "搜尋書名…";
            case "en_US":
            default: return "Search books…";
        }
    }

    public get 无匹配书目() {
        switch (this.lang) {
            case "zh_CN": return "无匹配书目";
            case "zh_CHT": return "無匹配書目";
            case "en_US":
            default: return "No matching books";
        }
    }

    // ===== 舰队管理 □2：书卡右键菜单+置顶/隐匿（label 自带三档语义短注——Menu item 无 tooltip 字段，
    //  文案风格对齐「路线书归档」说明族：忽略=退出推送/归档=彻底退场/隐匿=照推不显示） =====
    public get 置顶本书() {
        switch (this.lang) {
            case "zh_CN": return "置顶本书";
            case "zh_CHT": return "置頂本書";
            case "en_US":
            default: return "Pin this book";
        }
    }

    public get 取消置顶() {
        switch (this.lang) {
            case "zh_CN": return "取消置顶";
            case "zh_CHT": return "取消置頂";
            case "en_US":
            default: return "Unpin";
        }
    }

    public get 从总览隐匿() {
        switch (this.lang) {
            case "zh_CN": return "从总览隐匿（仍推送）";
            case "zh_CHT": return "從總覽隱匿（仍推送）";
            case "en_US":
            default: return "Hide from fleet (still scheduled)";
        }
    }

    public get 忽略本书菜单() {
        switch (this.lang) {
            case "zh_CN": return "忽略（不再推送）";
            case "zh_CHT": return "忽略（不再推送）";
            case "en_US":
            default: return "Ignore (stop scheduling)";
        }
    }

    public get 归档本书菜单() {
        switch (this.lang) {
            case "zh_CN": return "归档（彻底退场，摘抄留存）";
            case "zh_CHT": return "歸檔（徹底退場，摘抄留存）";
            case "en_US":
            default: return "Archive (done, digests stay)";
        }
    }

    public get 已置顶本书() {
        switch (this.lang) {
            case "zh_CN": return "已置顶本书";
            case "zh_CHT": return "已置頂本書";
            case "en_US":
            default: return "Pinned";
        }
    }

    public get 已取消置顶本书() {
        switch (this.lang) {
            case "zh_CN": return "已取消置顶";
            case "zh_CHT": return "已取消置頂";
            case "en_US":
            default: return "Unpinned";
        }
    }

    public get 已在总览显示() {
        switch (this.lang) {
            case "zh_CN": return "已在总览显示";
            case "zh_CHT": return "已在總覽顯示";
            case "en_US":
            default: return "Shown in fleet again";
        }
    }

    public get 已隐匿此书() {
        switch (this.lang) {
            case "zh_CN": return "已隐匿（总览不显示，仍推送）";
            case "zh_CHT": return "已隱匿（總覽不顯示，仍推送）";
            case "en_US":
            default: return "Hidden (not in fleet, still scheduled)";
        }
    }

    public get 取消隐匿() {
        switch (this.lang) {
            case "zh_CN": return "取消隐匿";
            case "zh_CHT": return "取消隱匿";
            case "en_US":
            default: return "Unhide";
        }
    }

    public get 导流仿写已装() {
        switch (this.lang) {
            case "zh_CN": return "仿写练习（recite）";
            case "zh_CHT": return "仿寫練習（recite）";
            case "en_US":
            default: return "Recite practice";
        }
    }

    public get 导流仿写未装() {
        switch (this.lang) {
            case "zh_CN": return "仿写插件（recite）未安装";
            case "zh_CHT": return "仿寫插件（recite）未安裝";
            case "en_US":
            default: return "Recite plugin not installed";
        }
    }

    // ===== v5 □8 皮肤系统（2026-08-26，QQ 秀三维正交 + 参数微调） =====

    // 皮肤/形态/材质雅名：zh 为键（theme.ts 注册表 zhName），繁化/英译查表兜底原值。
    // 专有雅名不进六语种全翻（i18n 兜底哲学：非英语互混才是 bug，英语兜底可接受）
    private static readonly SKIN_ZH_CHT: Record<string, string> = {
        "青瓷黛蓝": "青瓷黛藍", "琉璃琥珀": "琉璃琥珀", "松烟黛紫": "松煙黛紫",
        "绯樱落霞": "緋櫻落霞", "苍山雾雪": "蒼山霧雪", "墨玉轻雾": "墨玉輕霧",
        "经典泪滴": "經典淚滴", "鹅毛笔羽焰": "鵝毛筆羽焰", "纸灯笼焰": "紙燈籠焰",
        "双芯双焰": "雙芯雙焰", "破浪焰": "破浪焰",
        "素面": "素面", "毛玻璃": "毛玻璃", "宣纸": "宣紙",
    };
    private static readonly SKIN_EN: Record<string, string> = {
        "青瓷黛蓝": "Celadon Azure", "琉璃琥珀": "Glass Amber", "松烟黛紫": "Pine-Smoke Plum",
        "绯樱落霞": "Sakura Sunset", "苍山雾雪": "Misty Mountains", "墨玉轻雾": "Ink Jade Mist",
        "经典泪滴": "Classic Teardrop", "鹅毛笔羽焰": "Quill Plume", "纸灯笼焰": "Paper Lantern",
        "双芯双焰": "Twin Flames", "破浪焰": "Breaking Wave",
        "素面": "Surface", "毛玻璃": "Frosted Glass", "宣纸": "Rice Paper",
    };

    public 皮肤名(zh: string) {
        switch (this.lang) {
            case "zh_CN": return zh;
            case "zh_CHT": return TomatoI18n.SKIN_ZH_CHT[zh] ?? zh;
            default: return TomatoI18n.SKIN_EN[zh] ?? zh;
        }
    }

    public get 皮肤外观() {
        switch (this.lang) {
            case "zh_CN": return "皮肤外观";
            case "zh_CHT": return "皮膚外觀";
            case "en_US":
            default: return "Appearance";
        }
    }

    // □14/□9 终稿口径（2026-08-30）：断句/生词 AI/收集与写作对比进 Pro，不再是「功能全免费」
    // □10 顺手项（vision P2）：「断句」字面可读成断句整体 Pro（与帮助文档 20 节「前两档免费」
    // 张力），收紧为「断句进阶档」
    public get Pro解锁说明() {
        switch (this.lang) {
            case "zh_CN": return "核心阅读流程免费；Pro 一个价解锁皮肤系统（三维混搭、参数微调与未来新皮）、断句进阶档、生词 AI 与收集/写作对比";
            case "zh_CHT": return "核心閱讀流程免費；Pro 一個價解鎖皮膚系統（三維混搭、參數微調與未來新皮）、斷句進階檔、生詞 AI 與收集/寫作對比";
            case "en_US":
            default: return "Core reading flow is free; one Pro purchase unlocks the skin system (3D mix, fine-tuning & future skins), advanced sentence splitting, word AI, and collect/compare tools";
        }
    }

    public get 配色主题() {
        switch (this.lang) {
            case "zh_CN": return "配色主题";
            case "zh_CHT": return "配色主題";
            case "en_US":
            default: return "Color theme";
        }
    }

    public get 火苗形态() {
        switch (this.lang) {
            case "zh_CN": return "火苗形态";
            case "zh_CHT": return "火苗形態";
            case "en_US":
            default: return "Flame shape";
        }
    }

    public get 容器材质() {
        switch (this.lang) {
            case "zh_CN": return "容器材质";
            case "zh_CHT": return "容器材質";
            case "en_US":
            default: return "Panel material";
        }
    }

    public get 参数微调() {
        switch (this.lang) {
            case "zh_CN": return "参数微调（基于选中配色）";
            case "zh_CHT": return "參數微調（基於選中配色）";
            case "en_US":
            default: return "Fine-tune (on selected theme)";
        }
    }

    public get 色相() {
        switch (this.lang) {
            case "zh_CN": return "色相";
            case "zh_CHT": return "色相";
            case "en_US":
            default: return "Hue";
        }
    }

    public get 亮度() {
        switch (this.lang) {
            case "zh_CN": return "亮度";
            case "zh_CHT": return "亮度";
            case "en_US":
            default: return "Brightness";
        }
    }

    // ===== 渐进 □2 设置选择化：新页签下拉选项 + 笔记本选择器（存量值 0-6 原样兼容） =====
    public get 打开方式不打开() {
        switch (this.lang) {
            case "zh_CN": return "不打开";
            case "zh_CHT": return "不開啟";
            case "en_US":
            default: return "Do not open";
        }
    }
    public get 打开方式前台页签() {
        switch (this.lang) {
            case "zh_CN": return "前台页签";
            case "zh_CHT": return "前台頁籤";
            case "en_US":
            default: return "Foreground tab";
        }
    }
    public get 打开方式后台页签() {
        switch (this.lang) {
            case "zh_CN": return "后台页签";
            case "zh_CHT": return "後台頁籤";
            case "en_US":
            default: return "Background tab";
        }
    }
    public get 打开方式右侧分屏() {
        switch (this.lang) {
            case "zh_CN": return "右侧分屏";
            case "zh_CHT": return "右側分割";
            case "en_US":
            default: return "Split right";
        }
    }
    public get 打开方式底部分屏() {
        switch (this.lang) {
            case "zh_CN": return "底部分屏";
            case "zh_CHT": return "底部分割";
            case "en_US":
            default: return "Split bottom";
        }
    }
    public get 打开方式独立窗口() {
        switch (this.lang) {
            case "zh_CN": return "独立窗口";
            case "zh_CHT": return "獨立視窗";
            case "en_US":
            default: return "Separate window";
        }
    }
    public get 打开方式瞄一眼自动返回() {
        switch (this.lang) {
            case "zh_CN": return "瞄一眼（1.5 秒后自动返回原文）";
            case "zh_CHT": return "瞄一眼（1.5 秒後自動返回原文）";
            case "en_US":
            default: return "Peek (auto-return in 1.5s)";
        }
    }
    public get 未设置跟随当前文档() {
        switch (this.lang) {
            case "zh_CN": return "未设置（跟随当前文档）";
            case "zh_CHT": return "未設定（跟隨當前文檔）";
            case "en_US":
            default: return "Not set (follow current document)";
        }
    }
    public get 已失效请重新选择() {
        switch (this.lang) {
            case "zh_CN": return "已失效（请重新选择）";
            case "zh_CHT": return "已失效（請重新選擇）";
            case "en_US":
            default: return "invalid — re-pick";
        }
    }

    public get 自定义名称() {
        switch (this.lang) {
            case "zh_CN": return "自定义名称（显示在主题卡上）";
            case "zh_CHT": return "自定義名稱（顯示在主題卡上）";
            case "en_US":
            default: return "Custom name (shown on theme card)";
        }
    }

    public get 重置微调() {
        switch (this.lang) {
            case "zh_CN": return "重置";
            case "zh_CHT": return "重置";
            case "en_US":
            default: return "Reset";
        }
    }

    public get 皮肤Pro提示() {
        switch (this.lang) {
            case "zh_CN": return "Pro 皮肤需激活解锁（功能不受影响）";
            case "zh_CHT": return "Pro 皮膚需啟用解鎖（功能不受影響）";
            case "en_US":
            default: return "Pro skin requires activation (features unaffected)";
        }
    }

    public get 微调Pro提示() {
        switch (this.lang) {
            case "zh_CN": return "参数微调是 Pro 功能";
            case "zh_CHT": return "參數微調是 Pro 功能";
            case "en_US":
            default: return "Fine-tuning is a Pro feature";
        }
    }

    // ===== □14 收费门恢复（2026-08-30）：断句整体 Pro + 生词 AI（收录免费，AI 拦+引导） =====
    public get 断句Pro提示() {
        switch (this.lang) {
            case "zh_CN": return "断句是 Pro 功能（段落/任务/列表三档），不断句免费；激活后可用";
            case "zh_CHT": return "斷句是 Pro 功能（段落/任務/列表三檔），不斷句免費；啟用後可用";
            case "es_ES": return "La segmentación de frases es una función Pro (párrafo/tarea/lista); sin segmentación es gratis; disponible tras activar";
            case "fr_FR": return "La découpe en phrases est une fonction Pro (paragraphe/tâche/liste) ; sans découpe c'est gratuit ; disponible après activation";
            case "ja_JP": return "文分割は Pro 機能です（段落/タスク/リスト）。分割なしは無料、有効化後に利用できます";
            case "en_US":
            default: return "Sentence splitting is a Pro feature (paragraph/task/list); no-split stays free; unlock by activating";
        }
    }

    public get 生词AIPro提示() {
        switch (this.lang) {
            case "zh_CN": return "生词 AI 翻译/造句是 Pro 功能，生词收录免费";
            case "zh_CHT": return "生詞 AI 翻譯/造句是 Pro 功能，生詞收錄免費";
            case "es_ES": return "La traducción/ejemplos con IA de palabras es Pro; recopilar palabras es gratis";
            case "fr_FR": return "La traduction/exemples IA des mots est Pro ; collecter des mots est gratuit";
            case "ja_JP": return "単語の AI 翻訳・例文は Pro 機能です。単語の収録は無料";
            case "en_US":
            default: return "Word AI translation/examples is a Pro feature; collecting words is free";
        }
    }

    // ===== □30 未激活态门禁可视化（2026-08-30）：浮条 Pro 钮 tooltip 尾注 + 点击引导 toast 共用 =====
    public get Pro功能尾注() {
        switch (this.lang) {
            case "zh_CN": return "Pro 功能，激活后可用";
            case "zh_CHT": return "Pro 功能，啟用後可用";
            case "es_ES": return "Función Pro, disponible tras activar";
            case "fr_FR": return "Fonction Pro, disponible après activation";
            case "ja_JP": return "Pro 機能です。有効化後に利用できます";
            case "en_US":
            default: return "Pro feature, unlock by activating";
        }
    }

    // ===== □19 生词 AI 入口接回（2026-08-30）：子排 wordai 钮名+用法句，门禁文案复用「生词AIPro提示」 =====
    public get 生词AI() {
        switch (this.lang) {
            case "zh_CN": return "生词AI";
            case "zh_CHT": return "生詞AI";
            case "es_ES": return "Palabra IA";
            case "fr_FR": return "Mot IA";
            case "ja_JP": return "単語AI";
            case "en_US":
            default: return "Word AI";
        }
    }

    public get tip生词AI() {
        switch (this.lang) {
            case "zh_CN": return "收录生词，并用思源 AI 翻译造句（AI 解释为 Pro，未激活仅收录）";
            case "zh_CHT": return "收錄生詞，並用思源 AI 翻譯造句（AI 解釋為 Pro，未激活僅收錄）";
            case "es_ES": return "Recopila la palabra y deja que la IA traduzca y cree frases (la IA es Pro; recopilar es gratis)";
            case "fr_FR": return "Collecte le mot et laisse l'IA traduire et créer des phrases (l'IA est Pro ; collecter est gratuit)";
            case "ja_JP": return "単語を収録し、SiYuan AI で翻訳・例文を作成（AI は Pro、収録は無料）";
            case "en_US":
            default: return "Collect the word, then SiYuan AI translates and makes sentences (AI part is Pro; collecting stays free)";
        }
    }

    // ===== 加书弹窗视觉翻新（渐进 □10，2026-08-30）新增键，方案=docs/prog-config-ui-revamp.md =====
    public get 文档统计() {
        switch (this.lang) {
            case "zh_CN": return "文档统计";
            case "zh_CHT": return "文檔統計";
            case "es_ES": return "Estadísticas del documento";
            case "fr_FR": return "Statistiques du document";
            case "ja_JP": return "文書の統計";
            case "en_US":
            default: return "Document stats";
        }
    }
    public get 切分设置() {
        switch (this.lang) {
            case "zh_CN": return "切分设置";
            case "zh_CHT": return "切分設置";
            case "es_ES": return "Ajustes de división";
            case "fr_FR": return "Réglages de découpage";
            case "ja_JP": return "分割設定";
            case "en_US":
            default: return "Split settings";
        }
    }
    public get 分片选项() {
        switch (this.lang) {
            case "zh_CN": return "分片选项";
            case "zh_CHT": return "分片選項";
            case "es_ES": return "Opciones de fragmentos";
            case "fr_FR": return "Options des fragments";
            case "ja_JP": return "断片オプション";
            case "en_US":
            default: return "Fragment options";
        }
    }
    public get 标题级别() {
        switch (this.lang) {
            case "zh_CN": return "标题级别";
            case "zh_CHT": return "標題級別";
            case "es_ES": return "Niveles de título";
            case "fr_FR": return "Niveaux de titres";
            case "ja_JP": return "見出しレベル";
            case "en_US":
            default: return "Heading levels";
        }
    }
    public get 每片字数() {
        switch (this.lang) {
            case "zh_CN": return "每片字数";
            case "zh_CHT": return "每片字數";
            case "es_ES": return "Palabras por fragmento";
            case "fr_FR": return "Mots par fragment";
            case "ja_JP": return "断片あたりの文字数";
            case "en_US":
            default: return "Words per piece";
        }
    }
    public get 为0时不拆分() {
        switch (this.lang) {
            case "zh_CN": return "为 0 时不拆分";
            case "zh_CHT": return "為 0 時不拆分";
            case "es_ES": return "0 significa no dividir por longitud";
            case "fr_FR": return "0 = pas de division par longueur";
            case "ja_JP": return "0 は長さで分割しない";
            case "en_US":
            default: return "0 = no split by length";
        }
    }
    public get 断句方式() {
        switch (this.lang) {
            case "zh_CN": return "断句方式";
            case "zh_CHT": return "斷句方式";
            case "es_ES": return "División de oraciones";
            case "fr_FR": return "Découpage des phrases";
            case "ja_JP": return "文の区切り方";
            case "en_US":
            default: return "Sentence splitting";
        }
    }
    public get 平均每标题块数() {
        switch (this.lang) {
            case "zh_CN": return "平均每标题块数";
            case "zh_CHT": return "平均每標題塊數";
            case "es_ES": return "Bloques por título";
            case "fr_FR": return "Blocs par titre";
            case "ja_JP": return "見出しあたりのブロック数";
            case "en_US":
            default: return "Blocks per heading";
        }
    }
    public get 平均每块字数() {
        switch (this.lang) {
            case "zh_CN": return "平均每块字数";
            case "zh_CHT": return "平均每塊字數";
            case "es_ES": return "Palabras por bloque";
            case "fr_FR": return "Mots par bloc";
            case "ja_JP": return "ブロックあたりの文字数";
            case "en_US":
            default: return "Words per block";
        }
    }
    public get 平均每块文本长度() {
        switch (this.lang) {
            case "zh_CN": return "平均每块文本长度";
            case "zh_CHT": return "平均每塊文本長度";
            case "es_ES": return "Longitud de texto por bloque";
            case "fr_FR": return "Longueur de texte par bloc";
            case "ja_JP": return "ブロックあたりのテキスト長";
            case "en_US":
            default: return "Text length per block";
        }
    }

    // ---- □4 统计步骤增强（2026-08-30）：即时预览三数/超标 legend/滑块/chips（方案=docs/prog-addbook-split-preview.md §8.3） ----
    public get 片长分布() {
        switch (this.lang) {
            case "zh_CN": return "片长分布";
            case "zh_CHT": return "片長分布";
            case "es_ES": return "Distribución de la longitud de los fragmentos";
            case "fr_FR": return "Distribution de la longueur des fragments";
            case "ja_JP": return "断片の文字数分布";
            case "en_US":
            default: return "Piece length distribution";
        }
    }
    public get 最短() {
        switch (this.lang) {
            case "zh_CN": return "最短";
            case "zh_CHT": return "最短";
            case "es_ES": return "Mínimo";
            case "fr_FR": return "Min";
            case "ja_JP": return "最短";
            case "en_US":
            default: return "Min";
        }
    }
    public get 中位() {
        switch (this.lang) {
            case "zh_CN": return "中位";
            case "zh_CHT": return "中位";
            case "es_ES": return "Mediana";
            case "fr_FR": return "Médiane";
            case "ja_JP": return "中央値";
            case "en_US":
            default: return "Median";
        }
    }
    public get 最长() {
        switch (this.lang) {
            case "zh_CN": return "最长";
            case "zh_CHT": return "最長";
            case "es_ES": return "Máximo";
            case "fr_FR": return "Max";
            case "ja_JP": return "最長";
            case "en_US":
            default: return "Max";
        }
    }
    public get 超长分片() {
        switch (this.lang) {
            case "zh_CN": return "超长分片";
            case "zh_CHT": return "超長分片";
            case "es_ES": return "Fragmentos demasiado largos";
            case "fr_FR": return "Fragments trop longs";
            case "ja_JP": return "過大な断片";
            case "en_US":
            default: return "Oversized pieces";
        }
    }
    public get 不限() {
        switch (this.lang) {
            case "zh_CN": return "不限";
            case "zh_CHT": return "不限";
            case "es_ES": return "Sin límite";
            case "fr_FR": return "Sans limite";
            case "ja_JP": return "無制限";
            case "en_US":
            default: return "Unlimited";
        }
    }
    public get 粗体() {
        switch (this.lang) {
            case "zh_CN": return "粗体";
            case "zh_CHT": return "粗體";
            case "es_ES": return "Negrita";
            case "fr_FR": return "Gras";
            case "ja_JP": return "太字";
            case "en_US":
            default: return "Bold";
        }
    }
    public get 点选参与切分的级别() {
        switch (this.lang) {
            case "zh_CN": return "点选参与切分的级别";
            case "zh_CHT": return "點選參與切分的級別";
            case "es_ES": return "Pulsa los niveles que participan en la división";
            case "fr_FR": return "Cliquez les niveaux à inclure dans le découpage";
            case "ja_JP": return "分割に含める見出しレベルを選択";
            case "en_US":
            default: return "Tap levels to include in splitting";
        }
    }
    public get 超出字数强制切段() {
        switch (this.lang) {
            case "zh_CN": return "超出字数强制切段";
            case "zh_CHT": return "超出字數強制切段";
            case "es_ES": return "Los fragmentos que superan el límite se dividen automáticamente";
            case "fr_FR": return "Les fragments au-dessus de la limite sont coupés automatiquement";
            case "ja_JP": return "上限を超えると自動的に分割されます";
            case "en_US":
            default: return "Pieces over the limit are force-split";
        }
    }

    // ===== 加书切分引导文案（2026-08-30 □1：级=边界、字数=兜底的分工表达，纯文案方案） =====

    public get 切分总纲() {
        switch (this.lang) {
            case "zh_CN": return "标题级决定在哪切，每片字数决定切多碎";
            case "zh_CHT": return "標題級決定在哪切，每片字數決定切多碎";
            case "es_ES": return "Los niveles de título deciden dónde cortar; el tamaño del fragmento decide qué tan fino";
            case "fr_FR": return "Les niveaux de titres décident où couper ; la taille du fragment décide la finesse";
            case "ja_JP": return "見出しレベルは「どこで切るか」を、1 片の文字数は「どれだけ細かく切るか」を決めます";
            case "en_US":
            default: return "Heading levels decide where to cut; piece size decides how fine";
        }
    }
    public get 切分级别提示() {
        switch (this.lang) {
            case "zh_CN": return "勾选作为切分边界的标题级，×N 为该级标题总数";
            case "zh_CHT": return "勾選作為切分邊界的標題級，×N 為該級標題總數";
            case "es_ES": return "Marca los niveles de título como fronteras de división; ×N = número total de títulos de ese nivel";
            case "fr_FR": return "Cochez les niveaux de titres comme frontières de découpage ; ×N = nombre total de titres de ce niveau";
            case "ja_JP": return "分割境界にする見出しレベルを選択。×N はそのレベルの見出しの総数です";
            case "en_US":
            default: return "Check heading levels as split boundaries; ×N = total headings of that level";
        }
    }
    public get 切分不限提示() {
        switch (this.lang) {
            case "zh_CN": return "仅按所选标题级切分，未选则整书一片";
            case "zh_CHT": return "僅按所選標題級切分，未選則整書一片";
            case "es_ES": return "Divide solo por los niveles de título seleccionados; sin selección, todo el libro es un fragmento";
            case "fr_FR": return "Découpe uniquement aux niveaux de titres choisis ; sans sélection, tout le livre forme un seul fragment";
            case "ja_JP": return "選択した見出しレベルのみで分割。未選択なら本全体を 1 断片にします";
            case "en_US":
            default: return "Split only at the selected heading levels; with none selected, the whole book is one piece";
        }
    }
    public get 切分字数提示() {
        switch (this.lang) {
            case "zh_CN": return "标题级分组，组内达到每片字数即切";
            case "zh_CHT": return "標題級分組，組內達到每片字數即切";
            case "es_ES": return "Agrupa por niveles de título; corta dentro del grupo al alcanzar el tamaño del fragmento";
            case "fr_FR": return "Groupe par niveaux de titres ; coupe dans le groupe quand la taille du fragment est atteinte";
            case "ja_JP": return "見出しレベルで区切り、各グループ内で上限文字数に達すると更に分割します";
            case "en_US":
            default: return "Group by heading levels; cut within each group once the piece size is reached";
        }
    }
    public get 勾选后以此为切分边界() {
        switch (this.lang) {
            case "zh_CN": return "勾选后以此为切分边界";
            case "zh_CHT": return "勾選後以此為切分邊界";
            case "es_ES": return "Marca para usar esto como frontera de división";
            case "fr_FR": return "Cochez pour utiliser ceci comme frontière de découpage";
            case "ja_JP": return "選択するとここを分割境界にします";
            case "en_US":
            default: return "Check to use this as a split boundary";
        }
    }

    // ===== v5 □9 收尾 i18n（2026-08-27，Dock 档位胶囊 + 数据管理区 + 书卡未分片） =====

    public 档位标签(q: number) {
        switch (this.lang) {
            case "zh_CN": return q <= 1 ? "轻" : q >= 5 ? "冲" : "常";
            case "zh_CHT": return q <= 1 ? "輕" : q >= 5 ? "衝" : "常";
            case "en_US":
            default: return q <= 1 ? "Light" : q >= 5 ? "Burst" : "Steady";
        }
    }

    public get 未分片() {
        switch (this.lang) {
            case "zh_CN": return "未分片";
            case "zh_CHT": return "未分片";
            case "en_US":
            default: return "No pieces";
        }
    }

    public get 数据管理() {
        switch (this.lang) {
            case "zh_CN": return "数据管理";
            case "zh_CHT": return "數據管理";
            case "en_US":
            default: return "Data management";
        }
    }

    public get 归拢老数据() {
        switch (this.lang) {
            case "zh_CN": return "归拢老数据";
            case "zh_CHT": return "歸攏老數據";
            case "en_US":
            default: return "Consolidate legacy data";
        }
    }

    public get progData未创建说明() {
        switch (this.lang) {
            case "zh_CN": return "未创建（首次产生摘抄时自动创建）";
            case "zh_CHT": return "未創建（首次產生摘抄時自動創建）";
            case "en_US":
            default: return "Not created yet (auto-created on first excerpt)";
        }
    }

    public get progData已创建索引中() {
        switch (this.lang) {
            case "zh_CN": return "已创建（位置索引建立中）";
            case "zh_CHT": return "已創建（位置索引建立中）";
            case "en_US":
            default: return "Created (index pending)";
        }
    }

    public get 归拢中() {
        switch (this.lang) {
            case "zh_CN": return "归拢中…";
            case "zh_CHT": return "歸攏中…";
            case "en_US":
            default: return "Consolidating…";
        }
    }

    public get 找不到可用笔记本() {
        switch (this.lang) {
            case "zh_CN": return "找不到可用笔记本";
            case "zh_CHT": return "找不到可用筆記本";
            case "en_US":
            default: return "No available notebook";
        }
    }

    public 归拢结果(moved: number, failed: number, cleaned: number, skipped: number) {
        switch (this.lang) {
            case "zh_CN":
            case "zh_CHT":
                return `归拢 ${moved} 个摘抄夹` +
                    (failed ? `（失败 ${failed}）` : "") +
                    `，清理空分片夹 ${cleaned} 个` +
                    (skipped ? `，日记摘抄 ${skipped} 篇未动` : "");
            case "en_US":
            default:
                return `Consolidated ${moved} excerpt folders` +
                    (failed ? ` (${failed} failed)` : "") +
                    `, cleaned ${cleaned} empty piece dirs` +
                    (skipped ? `, ${skipped} diary excerpts untouched` : "");
        }
    }

    // ===== 书籍状态判定链（2026-08-28，死书/闭笔记本兜底 + 管理页重设计） =====

    public 本书还未分片(name: string) {
        switch (this.lang) {
            case "zh_CN": return `《${name}》还未分片`;
            case "zh_CHT": return `《${name}》還未分片`;
            case "en_US":
            default: return `"${name}" has no pieces yet`;
        }
    }

    public 本书还未分片立即重新分片吗(name: string) {
        switch (this.lang) {
            case "zh_CN": return `《${name}》还未分片，立即重新分片吗？`;
            case "zh_CHT": return `《${name}》還未分片，立即重新分片嗎？`;
            case "en_US":
            default: return `"${name}" has no pieces yet. Re-split now?`;
        }
    }

    public 书在已关闭的笔记本中(name: string) {
        switch (this.lang) {
            case "zh_CN": return `《${name}》在已关闭的笔记本中，打开笔记本后可继续阅读`;
            case "zh_CHT": return `《${name}》在已關閉的筆記本中，打開筆記本後可繼續閱讀`;
            case "en_US":
            default: return `"${name}" is in a closed notebook; reopen it to continue reading`;
        }
    }

    public 书原文档已不存在(name: string, fsUnavailable: boolean) {
        switch (this.lang) {
            case "zh_CN": return fsUnavailable
                ? `《${name}》的原文档找不到（也可能在已关闭的笔记本中）`
                : `《${name}》的原文档已不存在`;
            case "zh_CHT": return fsUnavailable
                ? `《${name}》的原文檔找不到（也可能在已關閉的筆記本中）`
                : `《${name}》的原文檔已不存在`;
            case "en_US":
            default: return fsUnavailable
                ? `"${name}" not found (it may be in a closed notebook)`
                : `"${name}" no longer exists`;
        }
    }

    public 清理该书渐进记录确认(name: string) {
        switch (this.lang) {
            case "zh_CN": return `清理《${name}》的渐进阅读记录？\n只删除记录与分片索引，不影响摘抄、心得、单词等沉淀物，也不删除任何文档。`;
            case "zh_CHT": return `清理《${name}》的漸進閱讀記錄？\n只刪除記錄與分片索引，不影響摘抄、心得、單詞等沉澱物，也不刪除任何文檔。`;
            case "en_US":
            default: return `Remove progressive-reading records of "${name}"?\nOnly the record and piece index are removed; excerpts, notes and vocabulary are untouched, and no document is deleted.`;
        }
    }

    public get 已清理该书记录() {
        switch (this.lang) {
            case "zh_CN": return "已清理该书记录";
            case "zh_CHT": return "已清理該書記錄";
            case "en_US":
            default: return "Records removed";
        }
    }

    public get 笔记本已关闭() {
        switch (this.lang) {
            case "zh_CN": return "笔记本已关闭";
            case "zh_CHT": return "筆記本已關閉";
            case "en_US":
            default: return "Notebook closed";
        }
    }

    public get 打开笔记本后自动恢复阅读() {
        switch (this.lang) {
            case "zh_CN": return "打开笔记本后自动恢复阅读";
            case "zh_CHT": return "打開筆記本後自動恢復閱讀";
            case "en_US":
            default: return "Reading resumes once the notebook is reopened";
        }
    }

    public get 疑似失效() {
        switch (this.lang) {
            case "zh_CN": return "疑似失效";
            case "zh_CHT": return "疑似失效";
            case "en_US":
            default: return "Missing";
        }
    }

    public get 文档已不存在可能已删除或移动() {
        switch (this.lang) {
            case "zh_CN": return "文档已不存在（可能已删除或移动）";
            case "zh_CHT": return "文檔已不存在（可能已刪除或移動）";
            case "en_US":
            default: return "Document not found (deleted or moved)";
        }
    }

    public get 清理记录() {
        switch (this.lang) {
            case "zh_CN": return "清理记录";
            case "zh_CHT": return "清理記錄";
            case "en_US":
            default: return "Remove records";
        }
    }

    public get 分片设置() {
        switch (this.lang) {
            case "zh_CN": return "分片设置";
            case "zh_CHT": return "分片設置";
            case "en_US":
            default: return "Piece settings";
        }
    }

    public get 未分片请先分片后再阅读() {
        switch (this.lang) {
            case "zh_CN": return "未分片——请先分片后再阅读";
            case "zh_CHT": return "未分片——請先分片後再閱讀";
            case "en_US":
            default: return "No pieces yet — split before reading";
        }
    }

    // □11 三行制 tooltip 用法句（docs/prog-floatbar-ux-redesign.md □11.3 清单 2026-08-29，vision-glm 产出）：
    // 42 个 tip 前缀 getter 只供 tooltip 第二行；按钮名复用 □10 短标签与既有长文案 getter。三语种，default 落 en。
    public get tip摘抄() {
        switch (this.lang) {
            case "zh_CN": return "展开子排选去向：摘选中块，或光标所在块";
            case "zh_CHT": return "展開子排選去向：摘選中塊，或游標所在塊";
            case "en_US":
            default: return "Open the destination row: digests selected blocks, or the cursor block";
        }
    }

    public get tip本书附属卡() {
        switch (this.lang) {
            case "zh_CN": return "打开本书摘抄闪卡复习（卡来自 ✂ 摘抄，非分片），胶囊为今日到期数";
            case "zh_CHT": return "打開本書摘抄閃卡複習（卡來自 ✂ 摘抄，非分片），膠囊為今日到期數";
            case "en_US":
            default: return "Review this book's digest flashcards (from ✂ digests, not fragments); badge counts those due today";
        }
    }

    public get tip换书() {
        switch (this.lang) {
            case "zh_CN": return "这本先放着：滚筒轮转，打开下一本书";
            case "zh_CHT": return "這本先放著：滾筒輪轉，打開下一本書";
            case "en_US":
            default: return "Set this book aside; rotation moves on and opens the next";
        }
    }

    public get tip下片删() {
        switch (this.lang) {
            case "zh_CN": return "读完当前片：删除它，打开本书下一分片";
            case "zh_CHT": return "讀完當前片：刪除它，打開本書下一分片";
            case "en_US":
            default: return "Delete this fragment and open the next";
        }
    }

    public get tip回看() {
        switch (this.lang) {
            case "zh_CN": return "跳到上一个分片，不删除任何片";
            case "zh_CHT": return "跳到上一個分片，不刪除任何片";
            case "en_US":
            default: return "Go back to the previous fragment; nothing is deleted";
        }
    }

    public get tip下一个分片() {
        switch (this.lang) {
            case "zh_CN": return "打开下一分片，当前片保留不删";
            case "zh_CHT": return "打開下一分片，當前片保留不刪";
            case "en_US":
            default: return "Open the next fragment; this one is kept";
        }
    }

    public get tip上片删() {
        switch (this.lang) {
            case "zh_CN": return "删除当前分片，跳回上一个分片";
            case "zh_CHT": return "刪除當前分片，跳回上一個分片";
            case "en_US":
            default: return "Delete this fragment and jump back to the previous";
        }
    }

    public get tip关闭分片() {
        switch (this.lang) {
            case "zh_CN": return "退出分片阅读并收起浮条，分片保留";
            case "zh_CHT": return "退出分片閱讀並收起浮條，分片保留";
            case "en_US":
            default: return "Exit fragment reading and hide the bar; the fragment stays";
        }
    }

    public get tip继续读() {
        switch (this.lang) {
            case "zh_CN": return "从上次断点接着读：打开本书下一分片";
            case "zh_CHT": return "從上次斷點接著讀：打開本書下一分片";
            case "en_US":
            default: return "Resume at your last breakpoint and open the next fragment";
        }
    }

    public get tip摘抄汇总() {
        switch (this.lang) {
            case "zh_CN": return "打开本书所有摘抄的汇总文档";
            case "zh_CHT": return "打開本書所有摘抄的彙總文檔";
            case "en_US":
            default: return "Open the document gathering all digests of this book";
        }
    }

    public get tip归档本书() {
        switch (this.lang) {
            case "zh_CN": return "本书移入归档、退出今日轮转，会先弹确认";
            case "zh_CHT": return "本書移入歸檔、退出今日輪轉，會先彈確認";
            case "en_US":
            default: return "Archives this book and skips it in rotation, after confirming";
        }
    }

    public get tip跳到分片() {
        switch (this.lang) {
            case "zh_CN": return "打开选中/光标块所在的分片并定位到该块；分片已删则按它现开一片（继续读＝全局断点，这是就地定位）";
            case "zh_CHT": return "打開選取/游標塊所在的分片並定位到該塊；分片已刪則按它現開一片（繼續讀＝全域斷點，這是就地定位）";
            case "en_US":
            default: return "Open the fragment containing the selected/cursor block and focus it; recreates the fragment if deleted (Resume = global breakpoint, this = in-place)";
        }
    }

    public get tip送进仿写() {
        switch (this.lang) {
            case "zh_CN": return "把这篇摘抄送进仿写练习插件练仿写";
            case "zh_CHT": return "把這篇摘抄送進仿寫練習插件練仿寫";
            case "en_US":
            default: return "Send this digest to the Recite plugin for imitation practice";
        }
    }

    public get tip仿写本片() {
        switch (this.lang) {
            case "zh_CN": return "一键把本片副本送进仿写：打字即批注、可抽取对比；副本永久留存不随删片丢失";
            case "zh_CHT": return "一鍵把本片副本送進仿寫：打字即批註、可抽取對比；副本永久留存不隨刪片丟失";
            case "en_US":
            default: return "Send a permanent copy of this piece to Recite: type to annotate, extract & compare; the copy survives piece deletion";
        }
    }

    public get tip回原书() {
        switch (this.lang) {
            case "zh_CN": return "定位到这条摘抄的原文位置并打开";
            case "zh_CHT": return "定位到這條摘抄的原文位置並打開";
            case "en_US":
            default: return "Jump to and open the source text of this digest";
        }
    }

    /** 摘抄态 origin 钮 tooltip（可见性期1 □1 C）：四级链语义（openOriginFromDigest 实序） */
    public get tip回分片() {
        switch (this.lang) {
            case "zh_CN": return "跳回摘抄来源：原文块在→跳原文；片在→跳片；片删→自动重切同片；兜底→书";
            case "zh_CHT": return "跳回摘抄來源：原文塊在→跳原文；片在→跳片；片刪→自動重切同片；兜底→書";
            case "en_US":
            default: return "Back to the digest's source: source block if alive → piece → auto-rebuild if deleted → book as last resort";
        }
    }

    public get tip片回原书() {
        switch (this.lang) {
            case "zh_CN": return "跳回原书，定位到本片起始处的原文位置";
            case "zh_CHT": return "跳回原書，定位到本片起始處的原文位置";
            case "en_US":
            default: return "Back to the book at this piece's source position";
        }
    }

    public get tip打开目录() {
        switch (this.lang) {
            case "zh_CN": return "打开本书分片目录树，可跳到任意分片";
            case "zh_CHT": return "打開本書分片目錄樹，可跳到任意分片";
            case "en_US":
            default: return "Open the fragment tree and jump to any fragment";
        }
    }

    public get tip重插() {
        switch (this.lang) {
            case "zh_CN": return "清空本片全部内容（含手写笔记）后重插原文，可选断句方式";
            case "zh_CHT": return "清空本片全部內容（含手寫筆記）後重插原文，可選斷句方式";
            case "en_US":
            default: return "Clear this fragment (notes included) and reinsert the original text, optionally re-split";
        }
    }

    // ===== □22 重插翻新（2026-08-30）：清空+可选断句，菜单/确认文案 =====
    /** □1 重插失真（2026-09-01）：no 档升首位且标签从「不断句」换「原样插回」——用户心智
     * 「重插=清空+抹痕迹+按原文原样插回」，断句三档在前易被当成默认档点中，产物结构重写 */
    public get 原样插回() {
        switch (this.lang) {
            case "zh_CN": return "原样插回";
            case "zh_CHT": return "原樣插回";
            case "es_ES": return "Restaurar tal cual";
            case "fr_FR": return "Restaurer tel quel";
            case "ja_JP": return "原文のまま再挿入";
            case "en_US":
            default: return "Restore as-is";
        }
    }

    public get 按书的断句设置() {
        switch (this.lang) {
            case "zh_CN": return "按书的断句设置";
            case "zh_CHT": return "按書的斷句設置";
            case "es_ES": return "Según los ajustes del libro";
            case "fr_FR": return "Selon les réglages du livre";
            case "ja_JP": return "本のフレーズ設定に従う";
            case "en_US":
            default: return "Use the book's split settings";
        }
    }

    public get 重插失败提示() {
        switch (this.lang) {
            case "zh_CN": return "重插中途失败，片内已清空；再点一次重插即可恢复";
            case "zh_CHT": return "重插中途失敗，片內已清空；再點一次重插即可恢復";
            case "es_ES": return "La reinserción falló a mitad de camino y el fragmento quedó vacío; vuelve a pulsar reinsertar para restaurarlo";
            case "fr_FR": return "La réinsertion a échoué en cours de route et le fragment a été vidé ; appuyez à nouveau sur réinsérer pour restaurer";
            case "ja_JP": return "再挿入の途中で失敗し、フラグメントが空になりました。もう一度再挿入を押すと復元できます";
            case "en_US":
            default: return "Reinsert failed midway and the fragment is now empty; press reinsert again to restore";
        }
    }

    public get 重插清空确认标题() {
        switch (this.lang) {
            case "zh_CN": return "清空并重插";
            case "zh_CHT": return "清空並重插";
            case "es_ES": return "Vaciar y reinsertar";
            case "fr_FR": return "Vider et réinsérer";
            case "ja_JP": return "空にして再挿入";
            case "en_US":
            default: return "Clear and reinsert";
        }
    }

    public get 重插清空确认内容() {
        switch (this.lang) {
            case "zh_CN": return "将清空本片全部旧内容（包括你手写的笔记），然后重新插入原文。此操作不可撤销。";
            case "zh_CHT": return "將清空本片全部舊內容（包括你手寫的筆記），然後重新插入原文。此操作不可撤銷。";
            case "es_ES": return "Se vaciará todo el contenido antiguo de este fragmento (tus notas manuscritas incluidas) y se reinsertará el original. No se puede deshacer.";
            case "fr_FR": return "Tout l'ancien contenu de ce fragment sera vidé (notes manuscrites comprises), puis l'original sera réinséré. Irréversible.";
            case "ja_JP": return "このフラグメントの旧内容（手書きノートを含む）をすべて消去し、原文を再挿入します。取り消せません。";
            case "en_US":
            default: return "All old content in this fragment (including your handwritten notes) will be cleared, then the original text reinserted. This cannot be undone.";
        }
    }

    public get tip删原文() {
        switch (this.lang) {
            case "zh_CN": return "删除片内所有原文块，只留自己写的笔记";
            case "zh_CHT": return "刪除片內所有原文塊，只留自己寫的筆記";
            case "en_US":
            default: return "Delete all original blocks, keeping only your notes";
        }
    }

    public get tip删片退出() {
        switch (this.lang) {
            case "zh_CN": return "删除当前分片并退出分片阅读";
            case "zh_CHT": return "刪除當前分片並退出分片閱讀";
            case "en_US":
            default: return "Delete this fragment and exit fragment reading";
        }
    }

    public get tip不再推送() {
        switch (this.lang) {
            case "zh_CN": return "本书不再出片，可在左 Dock 管理书目恢复";
            case "zh_CHT": return "本書不再出片，可在左 Dock 管理書目恢復";
            case "en_US":
            default: return "Mute this book for today; restore it in the left Dock";
        }
    }

    public get tip制卡() {
        switch (this.lang) {
            case "zh_CN": return "选中块制卡；未选中用光标块，拖蓝文字做填空。闪卡每天占用复习时间，只放真正要背的";
            case "zh_CHT": return "選中塊製卡；未選中用游標塊，拖藍文字做填空。閃卡每天佔用複習時間，只放真正要背的";
            case "en_US":
            default: return "Cards from selected/cursor blocks; cloze from selection. Review costs time daily — add sparingly";
        }
    }

    public get tip原地制卡() {
        switch (this.lang) {
            case "zh_CN": return "在选中块（或光标块）后方就地插入闪卡";
            case "zh_CHT": return "在選中塊（或游標塊）後方就地插入閃卡";
            case "en_US":
            default: return "Insert a card in place right after the selected or cursor block";
        }
    }

    public get tip制日卡() {
        switch (this.lang) {
            case "zh_CN": return "选中/光标块制卡，并入当天 dailycard 文档";
            case "zh_CHT": return "選中/游標塊製卡，併入當天 dailycard 文檔";
            case "en_US":
            default: return "Card selected/cursor blocks and merge them into today's dailycard document";
        }
    }

    public get tip制日卡无引() {
        switch (this.lang) {
            case "zh_CN": return "同制日卡，但卡面不带原文引用";
            case "zh_CHT": return "同製日卡，但卡面不帶原文引用";
            case "en_US":
            default: return "Like 制日卡 (daily card), but the card omits the source reference";
        }
    }

    public get tip多行() {
        switch (this.lang) {
            case "zh_CN": return "选中块批量挖空（可再点取消）；拖蓝时只挖选中文字";
            case "zh_CHT": return "選中塊批量挖空（可再點取消）；拖藍時只挖選中文字";
            case "en_US":
            default: return "Cloze selected blocks in bulk (toggle); a text selection clozes only itself";
        }
    }

    public get tip收集() {
        switch (this.lang) {
            case "zh_CN": return "把选中块复制进本书 summary-* 收集文件";
            case "zh_CHT": return "把選中塊複製進本書 summary-* 收集文件";
            case "en_US":
            default: return "Copy selected blocks into this book's summary file";
        }
    }

    public get tip移上一片() {
        switch (this.lang) {
            case "zh_CN": return "把选中块移到上一分片";
            case "zh_CHT": return "把選中塊移到上一分片";
            case "en_US":
            default: return "Move the selected blocks to the previous fragment";
        }
    }

    public get tip移下一片() {
        switch (this.lang) {
            case "zh_CN": return "把选中块移到下一分片";
            case "zh_CHT": return "把選中塊移到下一分片";
            case "en_US":
            default: return "Move the selected blocks to the next fragment";
        }
    }

    public get tip提取全部() {
        switch (this.lang) {
            case "zh_CN": return "把所有分片里的笔记提取到 keys- 文档";
            case "zh_CHT": return "把所有分片裡的筆記提取到 keys- 文檔";
            case "en_US":
            default: return "Extract notes from all fragments into the keys document";
        }
    }

    public get tip提取到底() {
        switch (this.lang) {
            case "zh_CN": return "把本片笔记聚合成一个块，放到文档底部";
            case "zh_CHT": return "把本片筆記聚合成一個塊，放到文檔底部";
            case "en_US":
            default: return "Gather this fragment's notes into one block at the bottom";
        }
    }

    public get tip提取笔记() {
        switch (this.lang) {
            case "zh_CN": return "把本片笔记提取到 keys- 文档";
            case "zh_CHT": return "把本片筆記提取到 keys- 文檔";
            case "en_US":
            default: return "Extract this fragment's notes into the keys document";
        }
    }

    public get tip去色() {
        switch (this.lang) {
            case "zh_CN": return "去掉本片笔记的颜色标记，内容不动";
            case "zh_CHT": return "去掉本片筆記的顏色標記，內容不動";
            case "en_US":
            default: return "Remove color marks on these notes; the text stays intact";
        }
    }

    public get tip恢复颜色() {
        switch (this.lang) {
            case "zh_CN": return "恢复被「去色」去掉的笔记颜色";
            case "zh_CHT": return "恢復被「去色」去掉的筆記顏色";
            case "en_US":
            default: return "Bring back the colors removed by Uncolor";
        }
    }

    public get tip合并() {
        switch (this.lang) {
            case "zh_CN": return "把所有分片合并成一个新文档，得到你的新版书";
            case "zh_CHT": return "把所有分片合併成一個新文檔，得到你的新版書";
            case "en_US":
            default: return "Merge all fragments into a new document of your own";
        }
    }

    public get tip留档() {
        switch (this.lang) {
            case "zh_CN": return "把选中（或光标）块摘进本书 digest- 文件夹";
            case "zh_CHT": return "把選中（或游標）塊摘進本書 digest- 文件夾";
            case "en_US":
            default: return "Digest selected or cursor blocks into this book's digest folder";
        }
    }

    public get tip思考() {
        switch (this.lang) {
            case "zh_CN": return "摘下选中/光标块标为问题：3 天后重访，解决转心得";
            case "zh_CHT": return "摘下選中/游標塊標為問題：3 天後重訪，解決轉心得";
            case "en_US":
            default: return "Digest the block as a question; revisit in 3 days, resolution turns to insight";
        }
    }

    public get tip背诵() {
        switch (this.lang) {
            case "zh_CN": return "摘下选中（或光标）块并加入闪卡复习";
            case "zh_CHT": return "摘下選中（或游標）塊並加入閃卡複習";
            case "en_US":
            default: return "Digest selected or cursor blocks and add them to flashcard review";
        }
    }

    public get tip单词() {
        switch (this.lang) {
            case "zh_CN": return "把选中的单词或短语收进本书单词本";
            case "zh_CHT": return "把選中的單詞或短語收進本書單詞本";
            case "en_US":
            default: return "Add the selected word or phrase to this book's vocabulary";
        }
    }

    public get tip仿写() {
        switch (this.lang) {
            case "zh_CN": return "把当前文档送进仿写练习，开启仿写模式";
            case "zh_CHT": return "把當前文檔送進仿寫練習，開啟仿寫模式";
            case "en_US":
            default: return "Send the current document to Recite as an imitation drill";
        }
    }

    public get tip重访调度() {
        switch (this.lang) {
            case "zh_CN": return "为选中块设置或调整重访提醒的时间与频率";
            case "zh_CHT": return "為選中塊設置或調整重訪提醒的時間與頻率";
            case "en_US":
            default: return "Set or adjust revisit time and frequency for this block";
        }
    }

    public get tip整篇摘抄() {
        switch (this.lang) {
            case "zh_CN": return "把整片或整文一次摘走，无需先选中";
            case "zh_CHT": return "把整片或整文一次摘走，無需先選中";
            case "en_US":
            default: return "Digest the whole document in one go, no selection needed";
        }
    }

    public get tip多行挑选() {
        switch (this.lang) {
            case "zh_CN": return "打开多行选择面板，批量挑块摘抄";
            case "zh_CHT": return "打開多行選擇面板，批量挑塊摘抄";
            case "en_US":
            default: return "Open the line picker and digest blocks in batches";
        }
    }

    public get tip更多操作() {
        switch (this.lang) {
            case "zh_CN": return "打开完整的摘抄去向设置对话框";
            case "zh_CHT": return "打開完整的摘抄去向設置對話框";
            case "en_US":
            default: return "Open the full digest destination dialog";
        }
    }

    // ---- □11 浮条统一落地（2026-08-30）：自由态/浮层族/胶囊 ----
    public get 自由摘抄模式() {
        switch (this.lang) {
            case "zh_CN": return "自由摘抄模式：任意文档唤出浮条摘抄（⌥Z）";
            case "zh_CHT": return "自由摘抄模式：任意文檔喚出浮條摘抄（⌥Z）";
            case "en_US":
            default: return "Free digest mode: summon the float bar in any doc (⌥Z)";
        }
    }
    public get 加书() {
        switch (this.lang) {
            case "zh_CN": return "加书";
            case "zh_CHT": return "加書";
            case "en_US":
            default: return "Add book";
        }
    }
    public get tip加书() {
        switch (this.lang) {
            case "zh_CN": return "把当前文档加入渐进阅读，弹出分片设置；加完本会话内浮条变书态";
            case "zh_CHT": return "把當前文檔加入漸進閱讀，彈出分片設定；加完本會話內浮條變書態";
            case "en_US":
            default: return "Add the current doc to progressive reading via the split dialog; the bar becomes book mode afterwards";
        }
    }
    public get 路线图() {
        switch (this.lang) {
            case "zh_CN": return "路线图";
            case "zh_CHT": return "路線圖";
            case "en_US":
            default: return "Route map";
        }
    }
    public get tip路线图() {
        switch (this.lang) {
            case "zh_CN": return "查看本书全部摘抄树（支路→主干）与批注，点击跳转";
            case "zh_CHT": return "查看本書全部摘抄樹（支路→主幹）與批註，點擊跳轉";
            case "en_US":
            default: return "View the book's full digest tree (branch → trunk) and comments; click to jump";
        }
    }
    public get 路线指引() {
        switch (this.lang) {
            case "zh_CN": return "路线指引";
            case "zh_CHT": return "路線指引";
            case "en_US":
            default: return "Route guide";
        }
    }
    public get tip路线指引() {
        switch (this.lang) {
            case "zh_CN": return "你在这里——看当前文档上能做什么、能去哪";
            case "zh_CHT": return "你在這裡——看當前文檔上能做什麼、能去哪";
            case "en_US":
            default: return "You are here — see what you can do and where you can go from this doc";
        }
    }
    public get 本书摘抄() {
        switch (this.lang) {
            case "zh_CN": return "本书摘抄";
            case "zh_CHT": return "本書摘抄";
            case "en_US":
            default: return "Book digests";
        }
    }
    public get tip本书摘抄() {
        switch (this.lang) {
            case "zh_CN": return "查看本书摘抄清单与当前块所在分片，点击跳转";
            case "zh_CHT": return "查看本書摘抄清單與當前塊所在分片，點擊跳轉";
            case "en_US":
            default: return "View the book's digest list and the piece of the current block; click to jump";
        }
    }
    // free 态 traceUp 语义适配（群反馈 650189）：普通文档无书，「本书摘抄」→「关联摘抄」
    public get 关联摘抄() {
        switch (this.lang) {
            case "zh_CN": return "关联摘抄";
            case "zh_CHT": return "關聯摘抄";
            case "en_US":
            default: return "Linked digests";
        }
    }
    public get tip关联摘抄() {
        switch (this.lang) {
            case "zh_CN": return "查看本文档的关联摘抄清单，点击跳转";
            case "zh_CHT": return "查看本文檔的關聯摘抄清單，點擊跳轉";
            case "en_US":
            default: return "View digests linked to this doc; click to jump";
        }
    }
    public get 本文档的关联摘抄() {
        switch (this.lang) {
            case "zh_CN": return "本文档的关联摘抄";
            case "zh_CHT": return "本文檔的關聯摘抄";
            case "en_US":
            default: return "Digests linked to this doc";
        }
    }
    public get 本文档还没有摘抄() {
        switch (this.lang) {
            case "zh_CN": return "本文档还没有摘抄";
            case "zh_CHT": return "本文檔還沒有摘抄";
            case "en_US":
            default: return "No linked digests for this doc yet";
        }
    }
    public get 本文档摘抄清单() {
        switch (this.lang) {
            case "zh_CN": return "本文档摘抄清单";
            case "zh_CHT": return "本文檔摘抄清單";
            case "en_US":
            default: return "Doc digest list";
        }
    }
    public get tip路径胶囊() {
        switch (this.lang) {
            case "zh_CN": return "来自：点击回分片（原文块在→跳原文；片在→跳片；片删→自动重切同片；兜底→书）";
            case "zh_CHT": return "來自：點擊回分片（原文塊在→跳原文；片在→跳片；片刪→自動重切同片；兜底→書）";
            case "en_US":
            default: return "Came from: click to go back (source block → piece → auto-rebuild if deleted → book as last resort)";
        }
    }
    public get 摘抄树() {
        switch (this.lang) {
            case "zh_CN": return "摘抄树";
            case "zh_CHT": return "摘抄樹";
            case "en_US":
            default: return "Digest tree";
        }
    }
    public get 本书批注() {
        switch (this.lang) {
            case "zh_CN": return "本书批注";
            case "zh_CHT": return "本書批註";
            case "en_US":
            default: return "Book comments";
        }
    }
    public get 本书没有大纲标题() {
        switch (this.lang) {
            case "zh_CN": return "本书没有大纲标题";
            case "zh_CHT": return "本書沒有大綱標題";
            case "en_US":
            default: return "No headings in this book";
        }
    }
    public get 当前块所在分片() {
        switch (this.lang) {
            case "zh_CN": return "当前块所在分片";
            case "zh_CHT": return "當前塊所在分片";
            case "en_US":
            default: return "Piece of the current block";
        }
    }
    public 第N片(n: number) {
        switch (this.lang) {
            case "zh_CN": return `第 ${n} 片`;
            case "zh_CHT": return `第 ${n} 片`;
            case "en_US":
            default: return `Piece ${n}`;
        }
    }
    public get 跳到该分片() {
        switch (this.lang) {
            case "zh_CN": return "跳到该分片";
            case "zh_CHT": return "跳到該分片";
            case "en_US":
            default: return "Jump to this piece";
        }
    }
    public get 移动端菜单显示开始学习() {
        switch (this.lang) {
            case "zh_CN": return "移动端菜单显示";
            case "zh_CHT": return "行動端選單顯示";
            case "en_US":
            default: return "Mobile menu shows";
        }
    }
    public get 该块不在分片索引中() {
        switch (this.lang) {
            case "zh_CN": return "该块不在分片索引中（可能是新加入的内容）";
            case "zh_CHT": return "該塊不在分片索引中（可能是新加入的內容）";
            case "en_US":
            default: return "This block is not in the piece index (may be newly added)";
        }
    }
    public get 本书摘抄清单() {
        switch (this.lang) {
            case "zh_CN": return "本书摘抄清单";
            case "zh_CHT": return "本書摘抄清單";
            case "en_US":
            default: return "Digest list";
        }
    }

    // □29 摘抄清单大界面（浮层超量升级 Dialog）：截断提示/搜索/空结果三键
    public 查看全部N条(n: number) {
        switch (this.lang) {
            case "zh_CN": return `查看全部 ${n} 条`;
            case "zh_CHT": return `查看全部 ${n} 條`;
            case "en_US":
            default: return `View all ${n}`;
        }
    }
    public get 搜索摘抄() {
        switch (this.lang) {
            case "zh_CN": return "搜索摘抄标题…";
            case "zh_CHT": return "搜索摘抄標題…";
            case "en_US":
            default: return "Search digest titles…";
        }
    }
    public get 没有匹配的摘抄() {
        switch (this.lang) {
            case "zh_CN": return "没有匹配的摘抄";
            case "zh_CHT": return "沒有匹配的摘抄";
            case "en_US":
            default: return "No matching digests";
        }
    }

    // 路线指引浮层四态文案（静态路线表，与帮助文档「使用路线图」章同源）
    public get 路线指引书() {
        switch (this.lang) {
            case "zh_CN": return "你在读一本书";
            case "zh_CHT": return "你在讀一本書";
            case "en_US":
            default: return "You are on a book";
        }
    }
    public get 路线书继续读() {
        switch (this.lang) {
            case "zh_CN": return "继续读：从断点切出下一片，进入阅读主循环";
            case "zh_CHT": return "繼續讀：從斷點切出下一片，進入閱讀主循環";
            case "en_US":
            default: return "Continue reading: cut the next piece";
        }
    }
    public get 路线书摘抄() {
        switch (this.lang) {
            case "zh_CN": return "摘抄：选中即摘，留档/思考/背诵/单词/送仿写";
            case "zh_CHT": return "摘抄：選中即摘，留檔/思考/背誦/單詞/送仿寫";
            case "en_US":
            default: return "Digest: keep / think / recite / word / send to recite";
        }
    }
    public get 路线书附属卡() {
        switch (this.lang) {
            case "zh_CN": return "附属卡：复习本书摘抄产生的闪卡";
            case "zh_CHT": return "附屬卡：複習本書摘抄產生的閃卡";
            case "en_US":
            default: return "Attached cards: review this book's flashcards";
        }
    }
    public get 路线书目录() {
        switch (this.lang) {
            case "zh_CN": return "目录：按大纲标题跳到对应分片";
            case "zh_CHT": return "目錄：按大綱標題跳到對應分片";
            case "en_US":
            default: return "Contents: jump to the piece of a heading";
        }
    }
    public get 路线书追溯() {
        switch (this.lang) {
            case "zh_CN": return "本书摘抄：清单+当前块所在分片";
            case "zh_CHT": return "本書摘抄：清單+當前塊所在分片";
            case "en_US":
            default: return "Book digests: list + the piece of the current block";
        }
    }
    public get 路线书归档() {
        switch (this.lang) {
            case "zh_CN": return "归档：读完了，退出推送、摘抄永久留存";
            case "zh_CHT": return "歸檔：讀完了，退出推送、摘抄永久留存";
            case "en_US":
            default: return "Archive: done reading — stop scheduling, digests stay";
        }
    }
    public get 路线指引片() {
        switch (this.lang) {
            case "zh_CN": return "你在一片上";
            case "zh_CHT": return "你在一片上";
            case "en_US":
            default: return "You are on a piece";
        }
    }
    // routemap □2 片态意图分组组头（读完这片/留点什么/去别处）
    public get 路线组读完这片() {
        switch (this.lang) {
            case "zh_CN": return "读完这片";
            case "zh_CHT": return "讀完這片";
            case "en_US":
            default: return "Finish this piece";
        }
    }
    public get 路线片下一片() {
        switch (this.lang) {
            case "zh_CN": return "下一片：删片前进，计入今日阅读（片是一次性餐具）";
            case "zh_CHT": return "下一片：刪片前進，計入今日閱讀（片是一次性餐具）";
            case "en_US":
            default: return "Next: delete this piece and move on, counts as read";
        }
    }
    public get 路线片下一片纯() {
        switch (this.lang) {
            case "zh_CN": return "下一个分片：翻页不删，片留作草稿，同样计数";
            case "zh_CHT": return "下一個分片：翻頁不刪，片留作草稿，同樣計數";
            case "en_US":
            default: return "Page on: keep this piece as draft, also counts";
        }
    }
    public get 路线组留点什么() {
        switch (this.lang) {
            case "zh_CN": return "留点什么";
            case "zh_CHT": return "留點什麼";
            case "en_US":
            default: return "Keep something";
        }
    }
    public get 路线片回看() {
        switch (this.lang) {
            case "zh_CN": return "回看：回上一片，不删也不计数";
            case "zh_CHT": return "回看：回上一片，不刪也不計數";
            case "en_US":
            default: return "Back: previous piece, kept, not counted";
        }
    }
    public get 路线组去别处() {
        switch (this.lang) {
            case "zh_CN": return "去别处";
            case "zh_CHT": return "去別處";
            case "en_US":
            default: return "Go elsewhere";
        }
    }
    public get 路线片摘抄() {
        switch (this.lang) {
            case "zh_CN": return "摘抄：选中即摘，去向同书态";
            case "zh_CHT": return "摘抄：選中即摘，去向同書態";
            case "en_US":
            default: return "Digest: same destinations as on a book";
        }
    }
    public get 路线片原书() {
        switch (this.lang) {
            case "zh_CN": return "原书：跳回原书原文处";
            case "zh_CHT": return "原書：跳回原書原文處";
            case "en_US":
            default: return "Source: jump back to the original text";
        }
    }
    public get 路线片制卡() {
        switch (this.lang) {
            case "zh_CN": return "制卡：做闪卡进复习队列，每天占用复习时间";
            case "zh_CHT": return "製卡：做閃卡進複習隊列，每天佔用複習時間";
            case "en_US":
            default: return "Cards: flashcards enter review queue, costing daily time";
        }
    }
    public get 路线片收集提取() {
        switch (this.lang) {
            case "zh_CN": return "收集与提取：归拢片上笔记到新文档";
            case "zh_CHT": return "收集與提取：歸攏片上筆記到新文檔";
            case "en_US":
            default: return "Collect & extract: gather notes into new docs";
        }
    }
    public get 路线片换书() {
        switch (this.lang) {
            case "zh_CN": return "换书：滚筒跳到下一本书";
            case "zh_CHT": return "換書：滾筒跳到下一本書";
            case "en_US":
            default: return "Swap: roller jumps to the next book";
        }
    }
    public get 路线指引摘抄() {
        switch (this.lang) {
            case "zh_CN": return "你在读一篇摘抄";
            case "zh_CHT": return "你在讀一篇摘抄";
            case "en_US":
            default: return "You are on a digest";
        }
    }
    public get 路线摘抄送仿写() {
        switch (this.lang) {
            case "zh_CN": return "送仿写：把这篇摘抄送进仿写练习";
            case "zh_CHT": return "送仿寫：把這篇摘抄送進仿寫練習";
            case "en_US":
            default: return "Recite: send this digest to recitation practice";
        }
    }
    public get 路线摘抄回原书() {
        switch (this.lang) {
            case "zh_CN": return "回分片：原文块→片→重切→书，自动降级";
            case "zh_CHT": return "回分片：原文塊→片→重切→書，自動降級";
            case "en_US":
            default: return "Back to source: block → piece → rebuild → book, auto fallback";
        }
    }
    public get 路线摘抄路线图() {
        switch (this.lang) {
            case "zh_CN": return "路线图：看全书摘抄树与批注";
            case "zh_CHT": return "路線圖：看全書摘抄樹與批註";
            case "en_US":
            default: return "Route map: the book's digest tree and comments";
        }
    }
    public get 路线摘抄汇总() {
        switch (this.lang) {
            case "zh_CN": return "摘抄汇总：打开本书摘抄文件夹";
            case "zh_CHT": return "摘抄匯總：打開本書摘抄文件夾";
            case "en_US":
            default: return "Summary: open the book's digest folder";
        }
    }
    public get 路线摘抄再摘抄() {
        switch (this.lang) {
            case "zh_CN": return "再摘抄：摘抄上再摘，落札记匣";
            case "zh_CHT": return "再摘抄：摘抄上再摘，落札記匣";
            case "en_US":
            default: return "Re-digest: digest a digest, lands in the note box";
        }
    }
    public get 路线指引自由() {
        switch (this.lang) {
            case "zh_CN": return "你在任意文档上（自由摘抄）";
            case "zh_CHT": return "你在任意文檔上（自由摘抄）";
            case "en_US":
            default: return "You are on any doc (free digest)";
        }
    }
    public get 路线自由摘抄() {
        switch (this.lang) {
            case "zh_CN": return "摘抄：摘当前文档，非书文本落札记匣";
            case "zh_CHT": return "摘抄：摘當前文檔，非書文本落札記匣";
            case "en_US":
            default: return "Digest: digests of non-book text land in the note box";
        }
    }
    public get 路线自由加书() {
        switch (this.lang) {
            case "zh_CN": return "加书：把当前文档加入渐进阅读，开始分片读";
            case "zh_CHT": return "加書：把當前文檔加入漸進閱讀，開始分片讀";
            case "en_US":
            default: return "Add book: register this doc into progressive reading";
        }
    }

    // ---- □18 加书常驻各态浮条：AddBook 知情警告（reasoning review P1）+ 路线指引清单同步（P2）----
    public get 加书警告已注册() {
        switch (this.lang) {
            case "zh_CN": return "⚠ 本书已在渐进阅读中：确认将重置阅读进度，删除现有全部分片并按本次设置重新分片（片内如有手写内容请先转移）";
            case "zh_CHT": return "⚠ 本書已在漸進閱讀中：確認將重置閱讀進度，刪除現有全部分片並按本次設定重新分片（片內如有手寫內容請先轉移）";
            case "en_US":
            default: return "⚠ Already in progressive reading: confirming will reset progress, delete all existing pieces and re-split with current settings (move handwritten notes in pieces first)";
        }
    }
    /** 重划分清旧片期间的反馈（2026-08-31 重划分删旧片，review P2-1） */
    public get 正在重建分片() {
        switch (this.lang) {
            case "zh_CN": return "正在清理旧分片并重建…";
            case "zh_CHT": return "正在清理舊分片並重建…";
            case "en_US":
            default: return "Cleaning old pieces and re-splitting…";
        }
    }
    public get 加书警告已分片() {
        switch (this.lang) {
            case "zh_CN": return "⚠ 本文档是某本书的分片：加书后将作为独立书籍注册，脱离原书的分片序列";
            case "zh_CHT": return "⚠ 本文檔是某本書的分片：加書後將作為獨立書籍註冊，脫離原書的分片序列";
            case "en_US":
            default: return "⚠ This doc is a piece of another book: adding it registers it as an independent book, detached from the original book's piece sequence";
        }
    }
    public get 路线书加书() {
        switch (this.lang) {
            case "zh_CN": return "加书：把其他文档加入渐进阅读（对本书确认会重置进度）";
            case "zh_CHT": return "加書：把其他文檔加入漸進閱讀（對本書確認會重置進度）";
            case "en_US":
            default: return "Add book: register another doc into progressive reading (confirming on this book resets its progress)";
        }
    }
    public get 路线片加书() {
        switch (this.lang) {
            case "zh_CN": return "加书：把本片文档注册为独立书籍继续深读";
            case "zh_CHT": return "加書：把本片文檔註冊為獨立書籍繼續深讀";
            case "en_US":
            default: return "Add book: register this piece as an independent book to read deeper";
        }
    }

    // ---- 路线指引·仿写联动页脚（书态专属）：说明行 + 动作按钮（未装 toast / 已装转发命令）。
    // 三语档跟随路线指引家族（路线书加书等同款），其余语种落英文兜底 ----
    public get 仿写联动() {
        switch (this.lang) {
            case "zh_CN": return "仿写联动";
            case "zh_CHT": return "仿寫聯動";
            case "en_US":
            default: return "Recite integration";
        }
    }
    public get 仿写联动说明() {
        switch (this.lang) {
            case "zh_CN": return "把本书设为仿写练习的原文：设为后在书中打字插入的块即批注，可抽取仿写、对比原文";
            case "zh_CHT": return "把本書設為仿寫練習的原文：設為後在書中打字插入的塊即批註，可抽取仿寫、對比原文";
            case "en_US":
            default: return "Set this book as the recite source: blocks you type in the book become annotations — extract and compare from there";
        }
    }
    public get 设为仿写原文() {
        switch (this.lang) {
            case "zh_CN": return "设为仿写原文";
            case "zh_CHT": return "設為仿寫原文";
            case "en_US":
            default: return "Set as recite source";
        }
    }
    public get 删除仿写模式() {
        switch (this.lang) {
            case "zh_CN": return "删除仿写模式";
            case "zh_CHT": return "刪除仿寫模式";
            case "en_US":
            default: return "Remove practice mode";
        }
    }
    public get 未安装仿写提示() {
        switch (this.lang) {
            case "zh_CN": return "未安装「仿写练习」插件，可在集市安装后使用";
            case "zh_CHT": return "未安裝「仿寫練習」插件，可在集市安裝後使用";
            case "en_US":
            default: return "Recite Practice is not installed. Install it from the marketplace first.";
        }
    }

    public get 仿写插件版本过旧() {
        switch (this.lang) {
            case "zh_CN": return "仿写练习插件版本过旧（无定向练习入口），请升级后重试；刚建的副本已保留";
            case "zh_CHT": return "仿寫練習插件版本過舊（無定向練習入口），請升級後重試；剛建的副本已保留";
            case "en_US":
            default: return "Recite Practice is too old (missing the targeted-practice entry). Please upgrade; the copy just created is kept.";
        }
    }

    public get 摘抄目录未就绪请重试() {
        switch (this.lang) {
            case "zh_CN": return "摘抄目录未就绪（索引建立中），请稍后重试";
            case "zh_CHT": return "摘抄目錄未就緒（索引建立中），請稍後重試";
            case "en_US":
            default: return "The digest folder is not ready (index building). Please retry shortly.";
        }
    }

    // ---- 番茄钟设置面板翻新（2026-08-30 spec 2026-08-29-2259 □2）：短标签 + 帮助行 ----
    public get 番茄钟时长() {
        switch (this.lang) {
            case "zh_CN": return "番茄钟时长";
            case "zh_CHT": return "番茄鐘時長";
            case "es_ES": return "Duración del pomodoro";
            case "fr_FR": return "Durée du pomodoro";
            case "ja_JP": return "ポモドーロの長さ";
            case "en_US":
            default: return "Pomodoro duration";
        }
    }
    public get 番茄钟时长帮助() {
        switch (this.lang) {
            case "zh_CN": return "点选常用时长，或添加自定义分钟数（1~240 分钟）；最多 {max} 档，每档在状态栏占一个图标";
            case "zh_CHT": return "點選常用時長，或添加自訂分鐘數（1~240 分鐘）；最多 {max} 檔，每檔在狀態欄佔一個圖標";
            case "es_ES": return "Seleccione duraciones habituales o añada minutos personalizados (1~240 min); {max} como máximo, cada una ocupa un icono en la barra de estado";
            case "fr_FR": return "Sélectionnez des durées courantes ou ajoutez des minutes personnalisées (1~240 min) ; {max} au maximum, chacune occupe une icône dans la barre d'état";
            case "ja_JP": return "よく使う長さを選択、またはカスタムの分数を追加（1~240分）。最大 {max} 個で、各長さがステータスバーのアイコンを1つ占めます";
            case "en_US":
            default: return "Pick common durations or add custom minutes (1~240 min); up to {max}, each occupies a status bar icon";
        }
    }
    public get 自动循环帮助() {
        switch (this.lang) {
            case "zh_CN": return "工作结束自动进入休息，休息结束回到工作";
            case "zh_CHT": return "工作結束自動進入休息，休息結束回到工作";
            case "es_ES": return "Pasa al descanso automáticamente al terminar el trabajo y vuelve al trabajo al terminar el descanso";
            case "fr_FR": return "Passe automatiquement en pause à la fin du travail et revient au travail à la fin de la pause";
            case "ja_JP": return "作業終了後に自動的に休憩へ移り、休憩終了後に作業へ戻ります";
            case "en_US":
            default: return "Switch to break automatically when work ends, and back to work when break ends";
        }
    }
    public get 随机视频帮助() {
        switch (this.lang) {
            case "zh_CN": return "填思源文档名（不带路径与后缀），到点时从该文档及子文档中随机挑一个视频播放";
            case "zh_CHT": return "填思源文檔名（不帶路徑與後綴），到點時從該文檔及子文檔中隨機挑一個視頻播放";
            case "es_ES": return "Introduzca el nombre de un documento de SiYuan (sin ruta ni extensión); al terminar, se reproducirá un vídeo elegido al azar de ese documento y sus subdocumentos";
            case "fr_FR": return "Saisissez le nom d'un document SiYuan (sans chemin ni extension) ; à la fin, une vidéo sera choisie au hasard parmi ce document et ses sous-documents";
            case "ja_JP": return "思源のドキュメント名（パスと拡張子は不要）を入力。時間になると、そのドキュメントとサブドキュメントから動画を1本ランダムに再生します";
            case "en_US":
            default: return "Enter a SiYuan document name (no path or extension); when time is up, a video is picked at random from that document and its sub-documents";
        }
    }
    public get 明亮模式背景() {
        switch (this.lang) {
            case "zh_CN": return "明亮模式背景";
            case "zh_CHT": return "明亮模式背景";
            case "es_ES": return "Fondo en modo claro";
            case "fr_FR": return "Arrière-plan en mode clair";
            case "ja_JP": return "ライトモードの背景";
            case "en_US":
            default: return "Light mode background";
        }
    }
    public get 明亮模式背景帮助() {
        switch (this.lang) {
            case "zh_CN": return "计时中显示的背景图（浅色主题用）；可用「选择文件」把本地图片存进思源 assets，或直接填 http(s) 链接/站内路径";
            case "zh_CHT": return "計時中顯示的背景圖（淺色主題用）；可用「選擇檔案」把本機圖片存進思源 assets，或直接填 http(s) 連結/站內路徑";
            case "es_ES": return "Imagen de fondo durante la temporización (tema claro); use «Elegir archivo» para guardar una imagen local en assets de SiYuan, o introduzca un enlace http(s) o una ruta interna";
            case "fr_FR": return "Image d'arrière-plan pendant le chronomètre (thème clair) ; utilisez « Choisir un fichier » pour enregistrer une image locale dans les assets de SiYuan, ou saisissez un lien http(s) ou un chemin interne";
            case "ja_JP": return "計時中に表示する背景画像（ライトテーマ用）。「ファイルを選択」でローカル画像を思源の assets に保存するか、http(s) リンクまたは内部パスを直接入力できます";
            case "en_US":
            default: return "Background image shown while timing (for the light theme); use \"Choose file\" to store a local image into SiYuan assets, or enter an http(s) link or an in-app path";
        }
    }
    public get 黑暗模式背景() {
        switch (this.lang) {
            case "zh_CN": return "黑暗模式背景";
            case "zh_CHT": return "黑暗模式背景";
            case "es_ES": return "Fondo en modo oscuro";
            case "fr_FR": return "Arrière-plan en mode sombre";
            case "ja_JP": return "ダークモードの背景";
            case "en_US":
            default: return "Dark mode background";
        }
    }
    public get 黑暗模式背景帮助() {
        switch (this.lang) {
            case "zh_CN": return "计时中显示的背景图（深色主题用），配置方式同上";
            case "zh_CHT": return "計時中顯示的背景圖（深色主題用），設定方式同上";
            case "es_ES": return "Imagen de fondo durante la temporización (tema oscuro); se configura igual que la anterior";
            case "fr_FR": return "Image d'arrière-plan pendant le chronomètre (thème sombre) ; se configure comme la précédente";
            case "ja_JP": return "計時中に表示する背景画像（ダークテーマ用）。設定方法は上と同じ";
            case "en_US":
            default: return "Background image shown while timing (for the dark theme); configured the same way as above";
        }
    }
    public get 背景图透明度帮助() {
        switch (this.lang) {
            case "zh_CN": return "拖动滑块调整计时中背景图的浓淡，拖动时全屏实时预览；0%=全透明（相当于无背景），100%=完全不透明";
            case "zh_CHT": return "拖動滑桿調整計時中背景圖的濃淡，拖動時全螢幕即時預覽；0%=全透明（相當於無背景），100%=完全不透明";
            case "es_ES": return "Arrastre el control deslizante para ajustar la intensidad del fondo durante la temporización, con vista previa en pantalla completa en tiempo real; 0% = totalmente transparente (sin fondo), 100% = totalmente opaco";
            case "fr_FR": return "Faites glisser le curseur pour ajuster l'intensité de l'arrière-plan pendant le chronomètre, avec un aperçu plein écran en temps réel ; 0 % = totalement transparent (aucun fond), 100 % = totalement opaque";
            case "ja_JP": return "スライダーをドラッグして計時中の背景の濃さを調整します。ドラッグ中は全画面でリアルタイムにプレビューされます。0%=完全に透明（背景なし）、100%=完全不透明";
            case "en_US":
            default: return "Drag the slider to adjust the background intensity while timing, with a live full-screen preview while dragging; 0% = fully transparent (no background), 100% = fully opaque";
        }
    }
    public get 添加() {
        switch (this.lang) {
            case "zh_CN": return "添加";
            case "zh_CHT": return "添加";
            case "es_ES": return "Añadir";
            case "fr_FR": return "Ajouter";
            case "ja_JP": return "追加";
            case "en_US":
            default: return "Add";
        }
    }
    public get 自定义分钟数() {
        switch (this.lang) {
            case "zh_CN": return "自定义分钟数";
            case "zh_CHT": return "自訂分鐘數";
            case "es_ES": return "Minutos personalizados";
            case "fr_FR": return "Minutes personnalisées";
            case "ja_JP": return "カスタム分数";
            case "en_US":
            default: return "Custom minutes";
        }
    }
    // ── 提示音选择化（□3）：下拉行短标签/音色名/试听/选文件/校验/toast/帮助 ──
    public get 提示音() {
        switch (this.lang) {
            case "zh_CN": return "提示音";
            case "zh_CHT": return "提示音";
            case "es_ES": return "Sonido de aviso";
            case "fr_FR": return "Son d'alerte";
            case "ja_JP": return "通知音";
            case "en_US":
            default: return "Notice sound";
        }
    }
    public get 提示音帮助() {
        switch (this.lang) {
            case "zh_CN": return "到点时播放的声音；选「自定义」后可填 http(s) 链接，或用「选择文件」把本地音频存进思源 assets";
            case "zh_CHT": return "到點時播放的聲音；選「自訂」後可填 http(s) 連結，或用「選擇檔案」把本地音訊存進思源 assets";
            case "es_ES": return "Sonido que se reproduce al terminar; con «Personalizado» puede introducir un enlace http(s) o usar «Elegir archivo» para guardar el audio local en assets de SiYuan";
            case "fr_FR": return "Son joué à la fin du temps ; avec « Personnalisé », saisissez un lien http(s) ou utilisez « Choisir un fichier » pour enregistrer l'audio local dans les assets de SiYuan";
            case "ja_JP": return "時間になると再生される音。「カスタム」では http(s) リンクを入力するか、「ファイルを選択」でローカル音声を思源の assets に保存できます";
            case "en_US":
            default: return "Sound played when time is up; pick \"Custom\" to enter an http(s) link, or use \"Choose file\" to store a local audio into SiYuan assets";
        }
    }
    public get 提示音默认() {
        switch (this.lang) {
            case "zh_CN": return "默认（双音）";
            case "zh_CHT": return "預設（雙音）";
            case "es_ES": return "Predeterminado (doble tono)";
            case "fr_FR": return "Par défaut (double ton)";
            case "ja_JP": return "デフォルト（2 音）";
            case "en_US":
            default: return "Default (ding-dong)";
        }
    }
    public get 提示音清脆铃() {
        switch (this.lang) {
            case "zh_CN": return "清脆铃";
            case "zh_CHT": return "清脆鈴";
            case "es_ES": return "Campana nítida";
            case "fr_FR": return "Cloche claire";
            case "ja_JP": return "澄んだベル";
            case "en_US":
            default: return "Crisp bell";
        }
    }
    public get 提示音柔和钟() {
        switch (this.lang) {
            case "zh_CN": return "柔和钟声";
            case "zh_CHT": return "柔和鐘聲";
            case "es_ES": return "Campana suave";
            case "fr_FR": return "Carillon doux";
            case "ja_JP": return "柔らかい鐘";
            case "en_US":
            default: return "Soft chime";
        }
    }
    public get 提示音木鱼() {
        switch (this.lang) {
            case "zh_CN": return "木鱼双敲";
            case "zh_CHT": return "木魚雙敲";
            case "es_ES": return "Bloque de madera";
            case "fr_FR": return "Bloc de bois";
            case "ja_JP": return "木魚";
            case "en_US":
            default: return "Woodblock";
        }
    }
    public get 自定义() {
        switch (this.lang) {
            case "zh_CN": return "自定义";
            case "zh_CHT": return "自訂";
            case "es_ES": return "Personalizado";
            case "fr_FR": return "Personnalisé";
            case "ja_JP": return "カスタム";
            case "en_US":
            default: return "Custom";
        }
    }
    public get 试听() {
        switch (this.lang) {
            case "zh_CN": return "试听";
            case "zh_CHT": return "試聽";
            case "es_ES": return "Escuchar";
            case "fr_FR": return "Écouter";
            case "ja_JP": return "試聴";
            case "en_US":
            default: return "Preview";
        }
    }
    public get 选择文件() {
        switch (this.lang) {
            case "zh_CN": return "选择文件…";
            case "zh_CHT": return "選擇檔案…";
            case "es_ES": return "Elegir archivo…";
            case "fr_FR": return "Choisir un fichier…";
            case "ja_JP": return "ファイルを選択…";
            case "en_US":
            default: return "Choose file…";
        }
    }
    public get 提示音地址无效() {
        switch (this.lang) {
            case "zh_CN": return "地址需以 http(s):// 或 / 开头；本地音频请用「选择文件」上传（浏览器安全策略不允许直接引用本机路径）";
            case "zh_CHT": return "位址需以 http(s):// 或 / 開頭；本地音訊請用「選擇檔案」上傳（瀏覽器安全策略不允許直接引用本機路徑）";
            case "es_ES": return "La dirección debe empezar por http(s):// o / ; para audio local use «Elegir archivo» (la política del navegador no permite rutas locales directas)";
            case "fr_FR": return "L'adresse doit commencer par http(s):// ou / ; pour un audio local, utilisez « Choisir un fichier » (le navigateur interdit les chemins locaux directs)";
            case "ja_JP": return "アドレスは http(s):// または / で始まる必要があります。ローカル音声は「ファイルを選択」でアップロードしてください（ブラウザーのセキュリティ上、ローカルパスの直接参照は不可）";
            case "en_US":
            default: return "Address must start with http(s):// or / ; for local audio use \"Choose file\" (browser security forbids direct local paths)";
        }
    }
    public get 提示音播放失败() {
        switch (this.lang) {
            case "zh_CN": return "提示音播放失败，请检查自定义地址";
            case "zh_CHT": return "提示音播放失敗，請檢查自訂位址";
            case "es_ES": return "No se pudo reproducir el aviso; compruebe la dirección personalizada";
            case "fr_FR": return "Échec de lecture du son d'alerte ; vérifiez l'adresse personnalisée";
            case "ja_JP": return "通知音の再生に失敗しました。カスタムアドレスを確認してください";
            case "en_US":
            default: return "Failed to play the notice sound; check the custom address";
        }
    }
    public get 提示音上传失败() {
        switch (this.lang) {
            case "zh_CN": return "音频上传失败，请重试";
            case "zh_CHT": return "音訊上傳失敗，請重試";
            case "es_ES": return "No se pudo subir el audio; inténtelo de nuevo";
            case "fr_FR": return "Échec de l'envoi de l'audio ; réessayez";
            case "ja_JP": return "音声のアップロードに失敗しました。再試行してください";
            case "en_US":
            default: return "Failed to upload the audio; please retry";
        }
    }
    public get 提示音文件类型不支持() {
        switch (this.lang) {
            case "zh_CN": return "请选择音频文件（mp3、wav、ogg、m4a 等）";
            case "zh_CHT": return "請選擇音訊檔案（mp3、wav、ogg、m4a 等）";
            case "es_ES": return "Elija un archivo de audio (mp3, wav, ogg, m4a, …)";
            case "fr_FR": return "Choisissez un fichier audio (mp3, wav, ogg, m4a, …)";
            case "ja_JP": return "音声ファイルを選択してください（mp3、wav、ogg、m4a など）";
            case "en_US":
            default: return "Please choose an audio file (mp3, wav, ogg, m4a, …)";
        }
    }
    // ── 背景图自定义（□4）：空态/占位/校验/toast ──
    public get 背景未设置() {
        switch (this.lang) {
            case "zh_CN": return "未设置";
            case "zh_CHT": return "未設定";
            case "es_ES": return "No fijado";
            case "fr_FR": return "Non défini";
            case "ja_JP": return "未設定";
            case "en_US":
            default: return "Not set";
        }
    }
    public get 背景图片失效() {
        switch (this.lang) {
            case "zh_CN": return "图片失效";
            case "zh_CHT": return "圖片失效";
            case "es_ES": return "Rota";
            case "fr_FR": return "Cassée";
            case "ja_JP": return "読込失敗";
            case "en_US":
            default: return "Broken";
        }
    }
    public get 背景未设置占位() {
        switch (this.lang) {
            case "zh_CN": return "未设置，计时中无背景";
            case "zh_CHT": return "未設定，計時中無背景";
            case "es_ES": return "Sin configurar: no hay fondo durante la temporización";
            case "fr_FR": return "Non défini : aucun arrière-plan pendant le chronomètre";
            case "ja_JP": return "未設定：計時中の背景なし";
            case "en_US":
            default: return "Not set; no background while timing";
        }
    }
    public get 背景地址无效() {
        switch (this.lang) {
            case "zh_CN": return "地址需以 http(s):// 或 / 开头；本地图片请用「选择文件」上传（浏览器安全策略不允许直接引用本机路径）";
            case "zh_CHT": return "地址需以 http(s):// 或 / 開頭；本機圖片請用「選擇檔案」上傳（瀏覽器安全策略不允許直接引用本機路徑）";
            case "es_ES": return "La dirección debe empezar por http(s):// o / ; para imágenes locales use «Elegir archivo» (la política del navegador no permite rutas locales directas)";
            case "fr_FR": return "L'adresse doit commencer par http(s):// ou / ; pour une image locale, utilisez « Choisir un fichier » (le navigateur interdit les chemins locaux directs)";
            case "ja_JP": return "アドレスは http(s):// または / で始める必要があります。ローカル画像は「ファイルを選択」でアップロードしてください（ブラウザのセキュリティポリシーによりローカルパスは直接参照できません）";
            case "en_US":
            default: return "The address must start with http(s):// or / ; use \"Choose file\" to upload a local image (browser security policy blocks local paths)";
        }
    }
    public get 背景文件类型不支持() {
        switch (this.lang) {
            case "zh_CN": return "请选择图片文件（png、jpg、webp、gif 等）";
            case "zh_CHT": return "請選擇圖片檔案（png、jpg、webp、gif 等）";
            case "es_ES": return "Elija un archivo de imagen (png, jpg, webp, gif, …)";
            case "fr_FR": return "Choisissez un fichier image (png, jpg, webp, gif, …)";
            case "ja_JP": return "画像ファイルを選択してください（png、jpg、webp、gif など）";
            case "en_US":
            default: return "Please choose an image file (png, jpg, webp, gif, …)";
        }
    }
    public get 背景上传失败() {
        switch (this.lang) {
            case "zh_CN": return "图片上传失败，请重试";
            case "zh_CHT": return "圖片上傳失敗，請重試";
            case "es_ES": return "No se pudo subir la imagen; inténtelo de nuevo";
            case "fr_FR": return "Échec de l'envoi de l'image ; réessayez";
            case "ja_JP": return "画像のアップロードに失敗しました。再試行してください";
            case "en_US":
            default: return "Failed to upload the image; please retry";
        }
    }

    // ── 导出工作空间设置分区翻新（2026-08-30，spec docs/tomato-export-settings-revamp.md）──
    public get 导出范围() {
        switch (this.lang) {
            case "zh_CN": return "导出范围";
            case "zh_CHT": return "導出範圍";
            case "es_ES": return "Ámbito de exportación";
            case "fr_FR": return "Périmètre d'export";
            case "ja_JP": return "エクスポート範囲";
            case "en_US":
            default: return "Export scope";
        }
    }
    public get 导出目录() {
        switch (this.lang) {
            case "zh_CN": return "导出目录";
            case "zh_CHT": return "導出目錄";
            case "es_ES": return "Carpeta de exportación";
            case "fr_FR": return "Dossier d'export";
            case "ja_JP": return "エクスポート先フォルダー";
            case "en_US":
            default: return "Export folder";
        }
    }
    public get 输出选项() {
        switch (this.lang) {
            case "zh_CN": return "输出选项";
            case "zh_CHT": return "輸出選項";
            case "es_ES": return "Opciones de salida";
            case "fr_FR": return "Options de sortie";
            case "ja_JP": return "出力オプション";
            case "en_US":
            default: return "Output options";
        }
    }
    public get 自动调度() {
        switch (this.lang) {
            case "zh_CN": return "自动调度";
            case "zh_CHT": return "自動調度";
            case "es_ES": return "Automatización";
            case "fr_FR": return "Automatisation";
            case "ja_JP": return "自動実行";
            case "en_US":
            default: return "Automation";
        }
    }
    public get 手动操作() {
        switch (this.lang) {
            case "zh_CN": return "手动操作";
            case "zh_CHT": return "手動操作";
            case "es_ES": return "Acciones manuales";
            case "fr_FR": return "Actions manuelles";
            case "ja_JP": return "手動操作";
            case "en_US":
            default: return "Manual actions";
        }
    }
    public get 白名单() {
        switch (this.lang) {
            case "zh_CN": return "白名单";
            case "zh_CHT": return "白名單";
            case "es_ES": return "Lista blanca";
            case "fr_FR": return "Liste blanche";
            case "ja_JP": return "ホワイトリスト";
            case "en_US":
            default: return "Whitelist";
        }
    }
    public get 黑名单() {
        switch (this.lang) {
            case "zh_CN": return "黑名单";
            case "zh_CHT": return "黑名單";
            case "es_ES": return "Lista negra";
            case "fr_FR": return "Liste noire";
            case "ja_JP": return "ブラックリスト";
            case "en_US":
            default: return "Blacklist";
        }
    }
    public get 从名单中移除() {
        switch (this.lang) {
            case "zh_CN": return "从名单中移除";
            case "zh_CHT": return "從名單中移除";
            case "es_ES": return "Quitar de la lista";
            case "fr_FR": return "Retirer de la liste";
            case "ja_JP": return "リストから削除";
            case "en_US":
            default: return "Remove from list";
        }
    }
    public get 白名单为空时将导出全部文档() {
        switch (this.lang) {
            case "zh_CN": return "白名单为空时将导出全部文档（黑名单除外）";
            case "zh_CHT": return "白名單為空時將導出全部文檔（黑名單除外）";
            case "es_ES": return "Con la lista blanca vacía se exportan todos los documentos (excepto los de la lista negra)";
            case "fr_FR": return "Avec une liste blanche vide, tous les documents sont exportés (sauf ceux de la liste noire)";
            case "ja_JP": return "ホワイトリストが空の場合、すべてのドキュメントがエクスポートされます（ブラックリストを除く）";
            case "en_US":
            default: return "With an empty whitelist, all documents are exported (except blacklisted ones)";
        }
    }
    public 在文档树中右键选择x(x: string) {
        switch (this.lang) {
            case "zh_CN": return `在文档树中右键文档或文件夹，选择「${x}」`;
            case "zh_CHT": return `在文件樹中右鍵文檔或資料夾，選擇「${x}」`;
            case "es_ES": return `Haga clic derecho en un documento o carpeta del árbol de documentos y elija «${x}»`;
            case "fr_FR": return `Cliquez droit sur un document ou un dossier dans le panneau des documents et choisissez « ${x} »`;
            case "ja_JP": return `ドキュメントツリーでドキュメントまたはフォルダーを右クリックし、「${x}」を選択してください`;
            case "en_US":
            default: return `Right-click a document or folder in the doc tree and choose "${x}"`;
        }
    }
    public get 关闭后按白名单过滤黑名单始终生效() {
        switch (this.lang) {
            case "zh_CN": return "关闭后按白名单过滤；黑名单在任何情况下都生效";
            case "zh_CHT": return "關閉後按白名單過濾；黑名單在任何情況下都生效";
            case "es_ES": return "Al desactivarlo se filtra por la lista blanca; la lista negra se aplica siempre";
            case "fr_FR": return "Une fois désactivé, l'export est filtré par la liste blanche ; la liste noire s'applique toujours";
            case "ja_JP": return "オフのときはホワイトリストで絞り込みます。ブラックリストは常に有効です";
            case "en_US":
            default: return "When off, exports are filtered by the whitelist; the blacklist always applies";
        }
    }
    public get 导出目录留空时不执行导出() {
        switch (this.lang) {
            case "zh_CN": return "目录留空时不执行导出";
            case "zh_CHT": return "目錄留空時不執行導出";
            case "es_ES": return "No se exporta nada mientras la carpeta esté vacía";
            case "fr_FR": return "Aucun export tant que le dossier est vide";
            case "ja_JP": return "フォルダーが空の間はエクスポートは行われません";
            case "en_US":
            default: return "Nothing is exported while the folder is empty";
        }
    }
    public get 导出图片帮助() {
        switch (this.lang) {
            case "zh_CN": return "开启后文档内的图片会一并复制到导出目录，Markdown 中的图片链接改为指向本地文件";
            case "zh_CHT": return "開啟後文檔內的圖片會一併複製到導出目錄，Markdown 中的圖片連結改為指向本地檔案";
            case "es_ES": return "Al activarlo, las imágenes de los documentos se copian a la carpeta de exportación y los enlaces de imagen de Markdown apuntan a los archivos locales";
            case "fr_FR": return "Une fois activé, les images des documents sont copiées vers le dossier d'export et les liens d'images Markdown pointent vers les fichiers locaux";
            case "ja_JP": return "オンのとき、ドキュメント内の画像をエクスポート先フォルダーにコピーし、Markdown 内の画像リンクをローカルファイルに差し替えます";
            case "en_US":
            default: return "When on, images inside documents are copied to the export folder and Markdown image links are rewritten to the local files";
        }
    }
    public get 自动增量导出() {
        switch (this.lang) {
            case "zh_CN": return "自动增量导出";
            case "zh_CHT": return "自動增量導出";
            case "es_ES": return "Exportación incremental automática";
            case "fr_FR": return "Exportation incrémentielle automatique";
            case "ja_JP": return "自動増分エクスポート";
            case "en_US":
            default: return "Auto incremental export";
        }
    }
    public get 定时确保导出() {
        switch (this.lang) {
            case "zh_CN": return "定时确保导出";
            case "zh_CHT": return "定時確保導出";
            case "es_ES": return "Comprobación programada de la exportación";
            case "fr_FR": return "Vérification programmée de l'exportation";
            case "ja_JP": return "定時エクスポート確認";
            case "en_US":
            default: return "Scheduled export check";
        }
    }
    public get 增量导出间隔秒() {
        switch (this.lang) {
            case "zh_CN": return "增量导出间隔（秒）";
            case "zh_CHT": return "增量導出間隔（秒）";
            case "es_ES": return "Intervalo (segundos)";
            case "fr_FR": return "Intervalle (secondes)";
            case "ja_JP": return "間隔（秒）";
            case "en_US":
            default: return "Interval (seconds)";
        }
    }
    public get 确保导出间隔分钟() {
        switch (this.lang) {
            case "zh_CN": return "确保导出间隔（分钟）";
            case "zh_CHT": return "確保導出間隔（分鐘）";
            case "es_ES": return "Intervalo (minutos)";
            case "fr_FR": return "Intervalle (minutes)";
            case "ja_JP": return "間隔（分）";
            case "en_US":
            default: return "Interval (minutes)";
        }
    }
    public get 开启后按设定间隔自动执行增量导出() {
        switch (this.lang) {
            case "zh_CN": return "开启后按设定间隔自动执行增量导出";
            case "zh_CHT": return "開啟後按設定間隔自動執行增量導出";
            case "es_ES": return "Al activarlo, la exportación incremental se ejecuta automáticamente con el intervalo indicado";
            case "fr_FR": return "Une fois activé, l'exportation incrémentielle s'exécute automatiquement à l'intervalle défini";
            case "ja_JP": return "オンにすると設定した間隔で増分エクスポートを自動実行します";
            case "en_US":
            default: return "When on, incremental export runs automatically at the set interval";
        }
    }
    public get 开启后按设定间隔确保导出符合配置() {
        switch (this.lang) {
            case "zh_CN": return "开启后按设定间隔确保导出符合配置";
            case "zh_CHT": return "開啟後按設定間隔確保導出符合配置";
            case "es_ES": return "Al activarlo, se comprueba la exportación según la configuración con el intervalo indicado";
            case "fr_FR": return "Une fois activé, la conformité de l'export est vérifiée à l'intervalle défini";
            case "ja_JP": return "オンにすると設定した間隔でエクスポートが設定に準拠しているか確認します";
            case "en_US":
            default: return "When on, the export folder is checked against the configuration at the set interval";
        }
    }
    public get 增量导出最小3秒() {
        switch (this.lang) {
            case "zh_CN": return "最小间隔 3 秒，填写更小的值按 3 秒执行";
            case "zh_CHT": return "最小間隔 3 秒，填寫更小的值按 3 秒執行";
            case "es_ES": return "El intervalo mínimo es de 3 segundos; los valores menores se ejecutan como 3 segundos";
            case "fr_FR": return "L'intervalle minimum est de 3 secondes ; les valeurs inférieures sont ramenées à 3 secondes";
            case "ja_JP": return "最小間隔は 3 秒です。それより小さい値は 3 秒として実行されます";
            case "en_US":
            default: return "Minimum interval is 3 seconds; smaller values run as 3 seconds";
        }
    }
    public get 确保导出最小3分钟() {
        switch (this.lang) {
            case "zh_CN": return "最小间隔 3 分钟，填写更小的值按 3 分钟执行";
            case "zh_CHT": return "最小間隔 3 分鐘，填寫更小的值按 3 分鐘執行";
            case "es_ES": return "El intervalo mínimo es de 3 minutos; los valores menores se ejecutan como 3 minutos";
            case "fr_FR": return "L'intervalle minimum est de 3 minutes ; les valeurs inférieures sont ramenées à 3 minutes";
            case "ja_JP": return "最小間隔は 3 分です。それより小さい値は 3 分として実行されます";
            case "en_US":
            default: return "Minimum interval is 3 minutes; smaller values run as 3 minutes";
        }
    }
    public get 手动操作帮助() {
        switch (this.lang) {
            case "zh_CN": return "全量导出会无视增量进度重新导出；增量导出只导出上次之后有改动的文档；「确保导出符合配置」按当前配置检查并清理导出目录；快捷键可点击旁边的键帽修改";
            case "zh_CHT": return "全量導出會無視增量進度重新導出；增量導出只導出上次之後有改動的文檔；「確保導出符合配置」按當前配置檢查並清理導出目錄；快捷鍵可點擊旁邊的鍵帽修改";
            case "es_ES": return "La exportación completa vuelve a exportarlo todo sin tener en cuenta el progreso incremental; la incremental solo exporta los documentos modificados desde la última ejecución; «Asegurar exportación conforme a la configuración» comprueba y limpia la carpeta de exportación según la configuración actual; haz clic en la tecla de al lado para cambiar el atajo";
            case "fr_FR": return "L'exportation complète réexporte tout sans tenir compte de la progression incrémentielle ; l'incrémentielle n'exporte que les documents modifiés depuis la dernière exécution ; « Assurer la conformité de l'exportation » vérifie et nettoie le dossier d'export selon la configuration actuelle ; cliquez sur la touche voisine pour modifier le raccourci";
            case "ja_JP": return "全量エクスポートは増分の進行状況を無視して再エクスポートします。増分エクスポートは前回以降に変更されたドキュメントのみをエクスポートします。「エクスポートを設定に合わせる」は現在の設定に基づいてエクスポート先を確認・クリーンアップします。ショートカットは隣のキーキャップをクリックして変更できます";
            case "en_US":
            default: return "Full export re-exports everything regardless of incremental progress; incremental export only exports documents changed since the last run; \"Ensure export matches config\" checks and cleans the export folder against the current configuration; click the key cap next to a button to change its shortcut";
        }
    }

    // ---- □23 设置面板解释普查：设置行 hover tip（aria-label + b3-tooltips，三语档跟随
    // 路线指引家族，其余语种落英文兜底）。行为语义已逐一核对消费点（helper.ts /
    // digestUtils.ts / FlashBox.ts / ProgressiveBtn.ts / blockUtils.cleanDiv）----
    public get tip设置相关概念() {
        switch (this.lang) {
            case "zh_CN": return "制卡时在卡片开头附一行「相关概念」块引用，复习时可跳回原文看上下文";
            case "zh_CHT": return "製卡時在卡片開頭附一行「相關概念」塊引用，複習時可跳回原文看上下文";
            case "en_US":
            default: return "When making a card, prepend a \"related concepts\" block-ref line so you can jump back to the context while reviewing";
        }
    }
    public get tip设置回溯链接() {
        switch (this.lang) {
            case "zh_CN": return "制卡时卡片里的回溯锚点用超链接形态；关闭则用块引用形态";
            case "zh_CHT": return "製卡時卡片裡的回溯錨點用超連結形態；關閉則用塊引用形態";
            case "en_US":
            default: return "Backtrace anchors inside cards use hyperlinks; turn off to use block refs instead";
        }
    }
    public get tip设置分片回溯() {
        switch (this.lang) {
            case "zh_CN": return "开启后新建分片不再在片尾附「来自原书」的回溯引用行";
            case "zh_CHT": return "開啟後新建分片不再在片尾附「來自原書」的回溯引用行";
            case "en_US":
            default: return "New pieces no longer get a \"came from the book\" backtrace ref line at the end";
        }
    }
    public get tip设置摘抄回溯() {
        switch (this.lang) {
            case "zh_CN": return "开启后摘抄卡不再附「摘自哪里」的回溯引用行";
            case "zh_CHT": return "開啟後摘抄卡不再附「摘自哪裡」的回溯引用行";
            case "en_US":
            default: return "Digest cards no longer get a \"digested from\" backtrace ref line";
        }
    }
    public get tip设置dailycard() {
        switch (this.lang) {
            case "zh_CN": return "摘抄落进当天日记的 dailycard 目录，默认落 prog-data 书摘抄夹";
            case "zh_CHT": return "摘抄落進當天日記的 dailycard 目錄，默認落 prog-data 書摘抄夾";
            case "en_US":
            default: return "Digest docs go into today's dailycard folder under the daily note; by default they go to the book's digest folder in prog-data";
        }
    }
    public get tip设置制卡daily() {
        switch (this.lang) {
            case "zh_CN": return "默认制卡（⌥E/浮条制卡钮）并入当天 dailycard 文档集中放；关闭后回落 cards 夹（此时「分片内制卡」开关决定书下还是片下）";
            case "zh_CHT": return "默認製卡（⌥E/浮條製卡鈕）併入當天 dailycard 文檔集中放；關閉後回落 cards 夾（此時「分片內製卡」開關決定書下還是片下）";
            case "en_US":
            default: return "Cards made by the default Make-Card entry (⌥E / floatbar button) go into today's dailycard document; turn off to fall back to the cards folder (where the under-piece switch then decides book vs piece)";
        }
    }
    public get tip设置摘抄背景() {
        switch (this.lang) {
            case "zh_CN": return "原书里已摘抄过的块显示背景色作痕迹，只改显示不写正文";
            case "zh_CHT": return "原書裡已摘抄過的塊顯示背景色作痕跡，只改顯示不寫正文";
            case "en_US":
            default: return "Already-digested blocks in the book get a background tint as a trace — display only, nothing is written into the doc";
        }
    }
    public get tip设置阅读点() {
        switch (this.lang) {
            case "zh_CN": return "摘抄后给原文锚点块记一个阅读点，下次续读从这里开始";
            case "zh_CHT": return "摘抄後給原文錨點塊記一個閱讀點，下次續讀從這裡開始";
            case "en_US":
            default: return "After digesting, mark the source block as a reading point; the next session resumes from there";
        }
    }
    public get tip设置制卡时间() {
        switch (this.lang) {
            case "zh_CN": return "卡片末尾追加制卡时间与原文标题路径，便于回溯出处";
            case "zh_CHT": return "卡片末尾追加製卡時間與原文標題路徑，便於回溯出處";
            case "en_US":
            default: return "Append the card time and the source doc's title path to the end of each card for provenance";
        }
    }
    public get tip设置分片卡链接() {
        switch (this.lang) {
            case "zh_CN": return "在分片内制卡时，卡片额外附一条指向所在分片的链接";
            case "zh_CHT": return "在分片內製卡時，卡片額外附一條指向所在分片的連結";
            case "en_US":
            default: return "When making a card inside a piece, also add a link to that piece on the card";
        }
    }
    public get tip设置同步开卡() {
        switch (this.lang) {
            case "zh_CN": return "附属卡=汇集本书全部卡片的文档；开启后打开分片时同步打开它——「制卡并入 dailycard」开启时改为打开当天 dailycard 文档（新卡的汇合处）";
            case "zh_CHT": return "附屬卡=匯集本書全部卡片的文檔；開啟後打開分片時同步打開它——「製卡併入 dailycard」開啟時改為打開當天 dailycard 文檔（新卡的匯合處）";
            case "en_US":
            default: return "\"Attached cards\" is the doc collecting all cards of the book; turn on to open it together with the piece — when merging into dailycard is on, today's dailycard doc opens instead (where new cards land)";
        }
    }
    public get tip设置卡位置() {
        switch (this.lang) {
            case "zh_CN": return "开启后分片内制的卡收进分片的子文档；关闭则收进本书附属卡文档（仅在关闭「制卡并入 dailycard 当天文档」时生效）";
            case "zh_CHT": return "開啟後分片內製的卡收進分片的子文檔；關閉則收進本書附屬卡文檔（僅在關閉「製卡併入 dailycard 當天文檔」時生效）";
            case "en_US":
            default: return "Cards made inside a piece go to a child doc of the piece; turn off to send them to the book's attached-cards doc (only takes effect when merging cards into the dailycard doc is off)";
        }
    }
    public get tip设置复习隐藏() {
        switch (this.lang) {
            case "zh_CN": return "在闪卡复习预览里隐藏渐进浮条，避免遮挡与误触";
            case "zh_CHT": return "在閃卡複習預覽裡隱藏漸進浮條，避免遮擋與誤觸";
            case "en_US":
            default: return "Hide the progressive float bar inside flashcard review previews to avoid occlusion and mis-taps";
        }
    }
    public get tip设置禁用浮条() {
        switch (this.lang) {
            case "zh_CN": return "完全隐藏渐进浮条；快捷键、右键菜单与命令面板不受影响";
            case "zh_CHT": return "完全隱藏漸進浮條；快捷鍵、右鍵菜單與命令面板不受影響";
            case "en_US":
            default: return "Fully hide the progressive float bar; hotkeys, context menus and the command palette are unaffected";
        }
    }
    public get tip设置归拢() {
        switch (this.lang) {
            case "zh_CN": return "把散落在各处的摘抄夹收进 prog-data 的摘抄总夹统一管理";
            case "zh_CHT": return "把散落在各處的摘抄夾收進 prog-data 的摘抄總夾統一管理";
            case "en_US":
            default: return "Gather scattered digest folders into the digest hub under prog-data";
        }
    }
    public get tip设置移动端顶栏() {
        switch (this.lang) {
            case "zh_CN": return "仅移动端生效：浮条固定在页面顶部；关闭后变为可拖拽的悬浮条";
            case "zh_CHT": return "僅移動端生效：浮條固定在頁面頂部；關閉後變為可拖拽的懸浮條";
            case "en_US":
            default: return "Mobile only: pin the float bar to the top of the page; turn off for a draggable floating bar";
        }
    }

    // ===== □1 付费体验改造（2026-08-31）：状态条 + 统一解锁弹框（UpgradeBar / UnlockDialog）=====
    public get 免费版解锁全部功能() {
        switch (this.lang) {
            case "zh_CN": return "免费版 · 解锁全部功能";
            case "zh_CHT": return "免費版 · 解鎖全部功能";
            case "en_US":
            default: return "Free plan · Unlock everything";
        }
    }
    public get 升级Pro() {
        switch (this.lang) {
            case "zh_CN": return "升级 Pro";
            case "zh_CHT": return "升級 Pro";
            case "en_US":
            default: return "Upgrade to Pro";
        }
    }
    public get 解锁Pro() {
        switch (this.lang) {
            case "zh_CN": return "解锁 Pro";
            case "zh_CHT": return "解鎖 Pro";
            case "en_US":
            default: return "Unlock Pro";
        }
    }
    public get 检测到渐进已激活() {
        switch (this.lang) {
            case "zh_CN": return "检测到渐进学习 Pro 已激活";
            case "zh_CHT": return "檢測到漸進學習 Pro 已激活";
            case "en_US":
            default: return "Progressive Learning Pro detected";
        }
    }
    public get 一键免费解锁() {
        switch (this.lang) {
            case "zh_CN": return "一键免费解锁";
            case "zh_CHT": return "一鍵免費解鎖";
            case "en_US":
            default: return "Unlock for free";
        }
    }
    public get 改用激活码或购买() {
        switch (this.lang) {
            case "zh_CN": return "改用激活码或购买";
            case "zh_CHT": return "改用激活碼或購買";
            case "en_US":
            default: return "Use an activation code or buy";
        }
    }
    public get 购买Pro() {
        switch (this.lang) {
            case "zh_CN": return "购买 Pro";
            case "zh_CHT": return "購買 Pro";
            case "en_US":
            default: return "Buy Pro";
        }
    }
    public get 或分隔() {
        switch (this.lang) {
            case "zh_CN": return "或";
            case "zh_CHT": return "或";
            case "en_US":
            default: return "or";
        }
    }
    public get 解锁失败() {
        switch (this.lang) {
            case "zh_CN": return "解锁失败，请稍后重试或改用激活码";
            case "zh_CHT": return "解鎖失敗，請稍後重試或改用激活碼";
            case "en_US":
            default: return "Unlock failed. Try again later or use an activation code";
        }
    }
    public get 点击解锁Pro() {
        switch (this.lang) {
            case "zh_CN": return "点击解锁 Pro";
            case "zh_CHT": return "點擊解鎖 Pro";
            case "en_US":
            default: return "Click to unlock Pro";
        }
    }
    public get 解锁中() {
        switch (this.lang) {
            case "zh_CN": return "解锁中…";
            case "zh_CHT": return "解鎖中…";
            case "en_US":
            default: return "Unlocking…";
        }
    }
    public get 显示或隐藏() {
        switch (this.lang) {
            case "zh_CN": return "显示 / 隐藏激活码";
            case "zh_CHT": return "顯示 / 隱藏激活碼";
            case "en_US":
            default: return "Show / hide activation code";
        }
    }

    // ── □3 header/footer 统一+帮助收敛（2026-08-31）：帮助菜单 / sticky footer ──
    public get 使用说明() {
        switch (this.lang) {
            case "zh_CN": return "使用说明";
            case "zh_CHT": return "使用說明";
            case "ja_JP": return "使い方";
            case "en_US":
            default: return "Usage Guide";
        }
    }
    public get 更新日志() {
        switch (this.lang) {
            case "zh_CN": return "更新日志";
            case "zh_CHT": return "更新日誌";
            case "ja_JP": return "更新履歴";
            case "en_US":
            default: return "Changelog";
        }
    }
    public get 开源仓库() {
        switch (this.lang) {
            case "zh_CN": return "开源仓库";
            case "zh_CHT": return "開源倉庫";
            case "ja_JP": return "ソースコード";
            case "en_US":
            default: return "Source Repository";
        }
    }
    public get 保存并关闭() {
        switch (this.lang) {
            case "zh_CN": return "保存并关闭";
            case "zh_CHT": return "保存並關閉";
            case "ja_JP": return "保存して閉じる";
            case "en_US":
            default: return "Save & Close";
        }
    }
    public get 关闭() {
        switch (this.lang) {
            case "zh_CN": return "关闭";
            case "zh_CHT": return "關閉";
            case "ja_JP": return "閉じる";
            case "en_US":
            default: return "Close";
        }
    }

    // 批注 AI 讨论区（2026-08-31 □8）新增键（i18n 清单=docs/tomato-annochat-visual-spec.md §8；
    // 实现裁剪：未用 spec 的「角色名称」「自定义角色」两键，另补「未配置AI/邀请角色发言/已中断」）
    public get 问AI() {
        switch (this.lang) {
            case "zh_CN": return "问 AI";
            case "zh_CHT": return "問 AI";
            case "ja_JP": return "AI に聞く";
            case "en_US":
            default: return "Ask AI";
        }
    }
    public get AI讨论区() {
        switch (this.lang) {
            case "zh_CN": return "AI 讨论区";
            case "zh_CHT": return "AI 討論區";
            case "ja_JP": return "AI ディスカッション";
            case "en_US":
            default: return "AI discussion";
        }
    }
    public get 收起AI讨论区() {
        switch (this.lang) {
            case "zh_CN": return "收起 AI 讨论区";
            case "zh_CHT": return "收起 AI 討論區";
            case "ja_JP": return "AI ディスカッションを折りたたむ";
            case "en_US":
            default: return "Collapse AI discussion";
        }
    }
    public get AI讨论区空态() {
        switch (this.lang) {
            case "zh_CN": return "就当前批注提问，或用下方角色开始";
            case "zh_CHT": return "就當前批註提問，或用下方角色開始";
            case "ja_JP": return "この注釈について質問するか、下のロールから始めましょう";
            case "en_US":
            default: return "Ask about this annotation, or start with a role below";
        }
    }
    public get 输入消息() {
        switch (this.lang) {
            case "zh_CN": return "输入消息…";
            case "zh_CHT": return "輸入訊息…";
            case "ja_JP": return "メッセージを入力…";
            case "en_US":
            default: return "Type a message…";
        }
    }
    public get 发送提示() {
        switch (this.lang) {
            case "zh_CN": return "发送（Enter 发送，Shift+Enter 换行）";
            case "zh_CHT": return "發送（Enter 發送，Shift+Enter 換行）";
            case "ja_JP": return "送信（Enter で送信、Shift+Enter で改行）";
            case "en_US":
            default: return "Send (Enter to send, Shift+Enter for newline)";
        }
    }
    public get 质疑者() {
        switch (this.lang) {
            case "zh_CN": return "质疑者";
            case "zh_CHT": return "質疑者";
            case "ja_JP": return "懐疑論者";
            case "en_US":
            default: return "Skeptic";
        }
    }
    public get 联系者() {
        switch (this.lang) {
            case "zh_CN": return "联系者";
            case "zh_CHT": return "聯繫者";
            case "ja_JP": return "連結者";
            case "en_US":
            default: return "Connector";
        }
    }
    public get 新建角色() {
        switch (this.lang) {
            case "zh_CN": return "＋自定义";
            case "zh_CHT": return "＋自定義";
            case "ja_JP": return "＋カスタム";
            case "en_US":
            default: return "New role";
        }
    }
    public get 角色提示词() {
        switch (this.lang) {
            case "zh_CN": return "角色提示词";
            case "zh_CHT": return "角色提示詞";
            case "ja_JP": return "ロールのプロンプト";
            case "en_US":
            default: return "Role prompt";
        }
    }
    public get 删除角色() {
        switch (this.lang) {
            case "zh_CN": return "删除角色";
            case "zh_CHT": return "刪除角色";
            case "ja_JP": return "ロールを削除";
            case "en_US":
            default: return "Delete role";
        }
    }
    public get 以角色提问() {
        switch (this.lang) {
            case "zh_CN": return "以「{x}」提问";
            case "zh_CHT": return "以「{x}」提問";
            case "ja_JP": return "「{x}」として質問";
            case "en_US":
            default: return "Ask as \"{x}\"";
        }
    }
    public get 请求失败() {
        switch (this.lang) {
            case "zh_CN": return "请求失败";
            case "zh_CHT": return "請求失敗";
            case "ja_JP": return "リクエスト失敗";
            case "en_US":
            default: return "Request failed";
        }
    }
    public get 重试() {
        switch (this.lang) {
            case "zh_CN": return "重试";
            case "zh_CHT": return "重試";
            case "ja_JP": return "再試行";
            case "en_US":
            default: return "Retry";
        }
    }
    public get 思考中() {
        switch (this.lang) {
            case "zh_CN": return "思考中…";
            case "zh_CHT": return "思考中…";
            case "ja_JP": return "考え中…";
            case "en_US":
            default: return "Thinking…";
        }
    }
    public get 压缩成笔记() {
        switch (this.lang) {
            case "zh_CN": return "压缩成笔记";
            case "zh_CHT": return "壓縮成筆記";
            case "ja_JP": return "ノートに要約";
            case "en_US":
            default: return "Compress into note";
        }
    }
    public get 压缩成笔记说明() {
        switch (this.lang) {
            case "zh_CN": return "把这段讨论整理成一条记录员笔记";
            case "zh_CHT": return "把這段討論整理成一條記錄員筆記";
            case "ja_JP": return "この議論を記録係のノートに整理する";
            case "en_US":
            default: return "Turn this discussion into a recorder note";
        }
    }
    public get 记录员() {
        switch (this.lang) {
            case "zh_CN": return "记录员";
            case "zh_CHT": return "記錄員";
            case "ja_JP": return "記録係";
            case "en_US":
            default: return "Recorder";
        }
    }
    public get 返回编辑器() {
        switch (this.lang) {
            case "zh_CN": return "返回";
            case "zh_CHT": return "返回";
            case "ja_JP": return "戻る";
            case "en_US":
            default: return "Back";
        }
    }
    public get 未配置AI() {
        switch (this.lang) {
            case "zh_CN": return "未配置 AI";
            case "zh_CHT": return "未配置 AI";
            case "ja_JP": return "AI 未設定";
            case "en_US":
            default: return "AI not configured";
        }
    }
    public get 尚未配置AI引导() {
        switch (this.lang) {
            case "zh_CN": return "尚未配置 AI。可先在「设置 - AI」中完成配置";
            case "zh_CHT": return "尚未配置 AI。可先在「設定 - AI」中完成配置";
            case "ja_JP": return "AI が未設定です。「設定 - AI」で先に設定してください";
            case "en_US":
            default: return "AI is not configured yet. Set it up in Settings - AI first";
        }
    }
    public get 邀请角色发言() {
        switch (this.lang) {
            case "zh_CN": return "请{r}对以上讨论发表看法";
            case "zh_CHT": return "請{r}對以上討論發表看法";
            case "ja_JP": return "{r}として上の議論について意見をください";
            case "en_US":
            default: return "{r}, please share your thoughts on the discussion above";
        }
    }
    public get 已中断() {
        switch (this.lang) {
            case "zh_CN": return "已中断";
            case "zh_CHT": return "已中斷";
            case "ja_JP": return "中断しました";
            case "en_US":
            default: return "Aborted";
        }
    }

    // ===== □6 加书 chips 全选/清空轻量钮（2026-09-01）：默认全勾后收窄到单级的反向操作成本。
    // 清空=取消勾选（非清空内容），非拉丁语系按「取消选择」口径译防歧义 =====
    public get 全选() {
        switch (this.lang) {
            case "zh_CN": return "全选";
            case "zh_CHT": return "全選";
            case "es_ES": return "Seleccionar todo";
            case "fr_FR": return "Tout sélectionner";
            case "ja_JP": return "すべて選択";
            case "it_IT": return "Seleziona tutto";
            case "de_DE": return "Alle auswählen";
            case "he_IL": return "בחר הכול";
            case "ru_RU": return "Выбрать всё";
            case "pl_PL": return "Zaznacz wszystko";
            case "en_US":
            default: return "Select all";
        }
    }
    public get 清空() {
        switch (this.lang) {
            case "zh_CN": return "清空";
            case "zh_CHT": return "清空";
            case "es_ES": return "Deseleccionar";
            case "fr_FR": return "Désélectionner";
            case "ja_JP": return "選択解除";
            case "it_IT": return "Deseleziona";
            case "de_DE": return "Auswahl aufheben";
            case "he_IL": return "בטל בחירה";
            case "ru_RU": return "Снять выделение";
            case "pl_PL": return "Wyczyść wybór";
            case "en_US":
            default: return "Clear";
        }
    }

    // ===== 思维导线词级两步流（□3，spec tomato-mindwire-visual-spec.md §6）：zh+en 一等，
    // zh_CHT/ja_JP 随键给，其余语种 default(en) 兜底 =====
    public get 关联起点() {
        switch (this.lang) {
            case "zh_CN": return "关联起点";
            case "zh_CHT": return "關聯起點";
            case "ja_JP": return "関連起点";
            case "en_US":
            default: return "Link start";
        }
    }
    public get 连到() {
        switch (this.lang) {
            case "zh_CN": return "连到";
            case "zh_CHT": return "連到";
            case "ja_JP": return "連接先";
            case "en_US":
            default: return "Connect to";
        }
    }
    public get 已选() {
        switch (this.lang) {
            case "zh_CN": return "已选";
            case "zh_CHT": return "已選";
            case "ja_JP": return "選択済み";
            case "en_US":
            default: return "Picked";
        }
    }
    public get 请选终点() {
        switch (this.lang) {
            case "zh_CN": return "请选终点";
            case "zh_CHT": return "請選終點";
            case "ja_JP": return "終点を選択してください";
            case "en_US":
            default: return "pick the end word";
        }
    }
    public get 起点终点相同() {
        switch (this.lang) {
            case "zh_CN": return "起点与终点是同一个词";
            case "zh_CHT": return "起點與終點是同一個詞";
            case "ja_JP": return "起点と終点が同じ語です";
            case "en_US":
            default: return "Start and end are the same word";
        }
    }
    public get 词级导线仅限本文档() {
        switch (this.lang) {
            case "zh_CN": return "词级导线只能连接同一文档内的词";
            case "zh_CHT": return "詞級導線只能連接同一文檔內的詞";
            case "ja_JP": return "語レベル導線は同一文書内のみ接続できます";
            case "en_US":
            default: return "Word wires connect within one document";
        }
    }
    public get 关联() {
        switch (this.lang) {
            case "zh_CN": return "关联";
            case "zh_CHT": return "關聯";
            case "ja_JP": return "関連";
            case "en_US":
            default: return "Related";
        }
    }
    public get 首尾呼应() {
        switch (this.lang) {
            case "zh_CN": return "首尾呼应";
            case "zh_CHT": return "首尾呼應";
            case "ja_JP": return "首尾呼応";
            case "en_US":
            default: return "Echo (opening & ending)";
        }
    }
    public get 伏笔() {
        switch (this.lang) {
            case "zh_CN": return "伏笔";
            case "zh_CHT": return "伏筆";
            case "ja_JP": return "伏線";
            case "en_US":
            default: return "Foreshadowing";
        }
    }
    public get 比喻() {
        switch (this.lang) {
            case "zh_CN": return "比喻";
            case "zh_CHT": return "比喻";
            case "ja_JP": return "比喩";
            case "en_US":
            default: return "Metaphor";
        }
    }
    public get 对比() {
        switch (this.lang) {
            case "zh_CN": return "对比";
            case "zh_CHT": return "對比";
            case "ja_JP": return "対比";
            case "en_US":
            default: return "Contrast";
        }
    }
    public get 因果() {
        switch (this.lang) {
            case "zh_CN": return "因果";
            case "zh_CHT": return "因果";
            case "ja_JP": return "因果";
            case "en_US":
            default: return "Cause & effect";
        }
    }
    public get 删除导线() {
        switch (this.lang) {
            case "zh_CN": return "删除导线";
            case "zh_CHT": return "刪除導線";
            case "ja_JP": return "導線を削除";
            case "en_US":
            default: return "Delete wire";
        }
    }

    // ===== 思维导线设置分区（□5，spec §4.8/§6，现居 ConfVisual.svelte 可视化域） =====
    public get 划词连线() {
        switch (this.lang) {
            case "zh_CN": return "词级导线（划词连线）";
            case "zh_CHT": return "詞級導線（劃詞連線）";
            case "ja_JP": return "語レベル導線（選択して接続）";
            case "en_US":
            default: return "Word-level wires (select to link)";
        }
    }
    public get 线型() {
        switch (this.lang) {
            case "zh_CN": return "线型";
            case "zh_CHT": return "線型";
            case "ja_JP": return "線種";
            case "en_US":
            default: return "Line style";
        }
    }
    public get 虚线() {
        switch (this.lang) {
            case "zh_CN": return "虚线";
            case "zh_CHT": return "虛線";
            case "ja_JP": return "破線";
            case "en_US":
            default: return "Dashed";
        }
    }
    public get 流动() {
        switch (this.lang) {
            case "zh_CN": return "流动";
            case "zh_CHT": return "流動";
            case "ja_JP": return "流動";
            case "en_US":
            default: return "Flowing";
        }
    }
    public get 实线() {
        switch (this.lang) {
            case "zh_CN": return "实线";
            case "zh_CHT": return "實線";
            case "ja_JP": return "実線";
            case "en_US":
            default: return "Solid";
        }
    }
    public get 线宽建议() {
        switch (this.lang) {
            case "zh_CN": return "建议 1–4";
            case "zh_CHT": return "建議 1–4";
            case "ja_JP": return "1–4 推奨";
            case "en_US":
            default: return "Suggest 1–4";
        }
    }
    public get 关系配色帮助() {
        switch (this.lang) {
            case "zh_CN": return "词级线按关系类型着色：呼应/伏笔/比喻/对比/因果";
            case "zh_CHT": return "詞級線按關係類型著色：呼應/伏線/比喩/對比/因果";
            case "ja_JP": return "語レベルの線は関係タイプで着色します：呼応/伏線/比喩/対比/因果";
            case "en_US":
            default: return "Word wires are colored by relation: echo / foreshadow / metaphor / contrast / cause";
        }
    }
    // 设置页重划 □1（2026-09-03）：左侧导航 9 域文案（「番茄钟」「闪卡」复用既有 key——
    // 闪卡在基类 text11.ts 十语种全档）。域=分区名非功能名，六语种全档；英文从短（窄导航列 148px）
    // 二期 14 域（2026-09-05）：「AI 与批注」「编辑与块」两域拆退役，key 随域退役删；
    // 新域标签见文件尾「设置页重划二期」段
    public get 反链与引用() {
        switch (this.lang) {
            case "zh_CN": return "反链与引用";
            case "zh_CHT": return "反鏈與引用";
            case "es_ES": return "Enlaces y refs.";
            case "fr_FR": return "Rétroliens et réf.";
            case "ja_JP": return "バックリンクと参照";
            case "en_US":
            default: return "Backlinks & refs";
        }
    }
    public get 可视化() {
        switch (this.lang) {
            case "zh_CN": return "可视化";
            case "zh_CHT": return "可視化";
            case "es_ES": return "Visualización";
            case "fr_FR": return "Visualisation";
            case "ja_JP": return "ビジュアル";
            case "en_US":
            default: return "Visualization";
        }
    }
    public get 编辑与块() {
        switch (this.lang) {
            case "zh_CN": return "编辑与块";
            case "zh_CHT": return "編輯與塊";
            case "es_ES": return "Edición y bloques";
            case "fr_FR": return "Édition et blocs";
            case "ja_JP": return "編集とブロック";
            case "en_US":
            default: return "Editing & blocks";
        }
    }
    public get 速记() {
        switch (this.lang) {
            case "zh_CN": return "速记";
            case "zh_CHT": return "速記";
            case "es_ES": return "Captura rápida";
            case "fr_FR": return "Capture rapide";
            case "ja_JP": return "クイックメモ";
            case "en_US":
            default: return "Quick capture";
        }
    }
    public get 文档管理() {
        switch (this.lang) {
            case "zh_CN": return "文档管理";
            case "zh_CHT": return "文檔管理";
            case "es_ES": return "Documentos";
            case "fr_FR": return "Documents";
            case "ja_JP": return "ドキュメント管理";
            case "en_US":
            default: return "Documents";
        }
    }
    public get 通用() {
        switch (this.lang) {
            case "zh_CN": return "通用";
            case "zh_CHT": return "通用";
            case "es_ES": return "General";
            case "fr_FR": return "Général";
            case "ja_JP": return "一般";
            case "en_US":
            default: return "General";
        }
    }
    // 空格转引用（SpaceRefBox，2026-09-03）：@@词+空格静默转引用（@@ 前缀=触发开关，英文误触修复同日补）
    public get 空格转引用() {
        switch (this.lang) {
            case "zh_CN": return "空格转引用";
            case "zh_CHT": return "空格轉引用";
            case "ja_JP": return "スペースで参照化";
            case "en_US":
            default: return "Space to reference";
        }
    }
    public get 空格转引用说明() {
        switch (this.lang) {
            case "zh_CN": return "输入 @@词 再敲一个空格，原地转为引用；没有匹配文档时自动新建空文档再引用；不带 @@ 前缀的普通打字（含英文）永不触发";
            case "zh_CHT": return "輸入 @@詞 再敲一個空格，原地轉為引用；沒有匹配文檔時自動新建空文檔再引用；不帶 @@ 前綴的普通打字（含英文）永不觸發";
            case "ja_JP": return "@@単語 と入力してスペースを打つとその場で参照に変換；該当文書がなければ空文書を新規作成して参照します。@@ プレフィックスなしの通常入力（英語を含む）は変換されません";
            case "en_US":
            default: return "Type @@word then a space to turn it into a reference in place; if no document matches, an empty one is created silently. Plain typing without the @@ prefix never triggers";
        }
    }
    public get 空格转引用形态() {
        switch (this.lang) {
            case "zh_CN": return "产物形态";
            case "zh_CHT": return "產物形態";
            case "ja_JP": return "挿入形式";
            case "en_US":
            default: return "Insert as";
        }
    }
    public get 空格转引用块引用() {
        switch (this.lang) {
            case "zh_CN": return "块引用";
            case "zh_CHT": return "塊引用";
            case "ja_JP": return "ブロック参照";
            case "en_US":
            default: return "Block ref";
        }
    }
    public get 空格转引用文档链接() {
        switch (this.lang) {
            case "zh_CN": return "文档链接";
            case "zh_CHT": return "文檔鏈接";
            case "ja_JP": return "文書リンク";
            case "en_US":
            default: return "Doc link";
        }
    }
    // 引用效果多档化（2026-09-03）：cssRefStyle/cssRefSquareBrackets 双开关合并为单 select 五档
    public get 引用效果() {
        switch (this.lang) {
            case "zh_CN": return "引用效果";
            case "zh_CHT": return "引用效果";
            case "ja_JP": return "参照エフェクト";
            case "es_ES": return "Efecto de referencia";
            case "fr_FR": return "Effet de référence";
            case "it_IT": return "Effetto del riferimento";
            case "en_US":
            default: return "Reference effect";
        }
    }
    public get 引用效果说明() {
        switch (this.lang) {
            case "zh_CN": return "给块引用选一种外观效果；配色跟随当前主题，明暗模式自动适配";
            case "zh_CHT": return "給塊引用選一種外觀效果；配色跟隨當前主題，明暗模式自動適配";
            case "ja_JP": return "ブロック参照の外観エフェクトを選択します。配色は現在のテーマに従い、明暗モードに自動対応します";
            case "es_ES": return "Elija un efecto visual para las referencias de bloque; los colores siguen el tema actual y se adaptan automáticamente al modo claro/oscuro";
            case "fr_FR": return "Choisissez un effet visuel pour les références de bloc ; les couleurs suivent le thème actuel et s'adaptent automatiquement au mode clair/sombre";
            case "it_IT": return "Scegli un effetto visivo per i riferimenti di blocco; i colori seguono il tema attuale e si adattano automaticamente alla modalità chiara/scura";
            case "en_US":
            default: return "Pick a visual effect for block references; colors follow the current theme and adapt to light/dark mode automatically";
        }
    }
    public get 引用效果样式() {
        switch (this.lang) {
            case "zh_CN": return "效果样式";
            case "zh_CHT": return "效果樣式";
            case "ja_JP": return "スタイル";
            case "es_ES": return "Estilo";
            case "fr_FR": return "Style";
            case "it_IT": return "Stile";
            case "en_US":
            default: return "Effect style";
        }
    }
    public get 引用效果无() {
        switch (this.lang) {
            case "zh_CN": return "无（思源默认）";
            case "zh_CHT": return "無（思源默認）";
            case "ja_JP": return "なし（SiYuan 標準）";
            case "es_ES": return "Ninguno (predeterminado de SiYuan)";
            case "fr_FR": return "Aucun (par défaut de SiYuan)";
            case "it_IT": return "Nessuno (predefinito di SiYuan)";
            case "en_US":
            default: return "None (SiYuan default)";
        }
    }
    public get 引用效果双方括号() {
        switch (this.lang) {
            case "zh_CN": return "双方括号 [[ ]]";
            case "zh_CHT": return "雙方括號 [[ ]]";
            case "ja_JP": return "二重括弧 [[ ]]";
            case "es_ES": return "Doble corchete [[ ]]";
            case "fr_FR": return "Doubles crochets [[ ]]";
            case "it_IT": return "Doppie parentesi [[ ]]";
            case "en_US":
            default: return "Double brackets [[ ]]";
        }
    }
    public get 引用效果链接图标() {
        switch (this.lang) {
            case "zh_CN": return "链接图标";
            case "zh_CHT": return "鏈接圖標";
            case "ja_JP": return "リンクアイコン";
            case "es_ES": return "Icono de enlace";
            case "fr_FR": return "Icône de lien";
            case "it_IT": return "Icona collegamento";
            case "en_US":
            default: return "Link icon";
        }
    }
    public get 引用效果悬停阴影() {
        switch (this.lang) {
            case "zh_CN": return "悬停阴影";
            case "zh_CHT": return "懸停陰影";
            case "ja_JP": return "ホバー時の影";
            case "es_ES": return "Sombra al pasar el ratón";
            case "fr_FR": return "Ombre au survol";
            case "it_IT": return "Ombra al passaggio del mouse";
            case "en_US":
            default: return "Hover shadow";
        }
    }
    public get 引用效果悬停高亮() {
        switch (this.lang) {
            case "zh_CN": return "悬停高亮";
            case "zh_CHT": return "懸停高亮";
            case "ja_JP": return "ホバー時のハイライト";
            case "es_ES": return "Resaltado al pasar el ratón";
            case "fr_FR": return "Surlignage au survol";
            case "it_IT": return "Evidenziazione al passaggio del mouse";
            case "en_US":
            default: return "Hover highlight";
        }
    }
    // 期1 □2 摘抄落点三档（2026-09-03 群反馈：MOUQIN 要源文档下方回归 + 650189 要总夹归拢）
    public get 摘抄落点() {
        switch (this.lang) {
            case "zh_CN": return "摘抄落点";
            case "zh_CHT": return "摘抄落點";
            case "en_US":
            default: return "Digest landing";
        }
    }
    public get 落点集中归档() {
        switch (this.lang) {
            case "zh_CN": return "集中归档";
            case "zh_CHT": return "集中歸檔";
            case "en_US":
            default: return "Centralized";
        }
    }
    public get 落点源文档下方() {
        switch (this.lang) {
            case "zh_CN": return "源文档下方";
            case "zh_CHT": return "源文檔下方";
            case "en_US":
            default: return "Under source doc";
        }
    }
    public get 落点日记卡片() {
        switch (this.lang) {
            case "zh_CN": return "日记卡片";
            case "zh_CHT": return "日記卡片";
            case "en_US":
            default: return "Daily card";
        }
    }
    public get tip摘抄落点() {
        switch (this.lang) {
            case "zh_CN": return "摘抄文档的保存位置：\n集中归档=书摘抄进 prog-data/摘抄/digest-书名，非书文本进札记匣（匣内按源文档 digest-源文档名 分夹归集）\n源文档下方=挂在来源书/文档之下（老版行为）\n日记卡片=并入当天日记文档";
            case "zh_CHT": return "摘抄文檔的保存位置：\n集中歸檔=書摘抄進 prog-data/摘抄/digest-書名，非書文本進札記匣（匣內按源文檔 digest-源文檔名 分夾歸集）\n源文檔下方=掛在來源書/文檔之下（老版行為）\n日記卡片=併入當天日記文檔";
            case "en_US":
            default: return "Where digest docs are stored:\nCentralized = book digests into prog-data/摘抄/digest-<book>, free text into the note box (grouped per source doc as digest-<source>)\nUnder source doc = under the source book/doc (legacy behavior)\nDaily card = into today's daily note";
        }
    }
    // graphbox 期1 大文档三档（2026-09-03）：骨架提示/完整加载确认/轮询降级/加载态
    public get 骨架提示() {
        switch (this.lang) {
            case "zh_CN": return "大文档已显示标题骨架（共 %1 块 · 约 %2 字）";
            case "zh_CHT": return "大文檔已顯示標題骨架（共 %1 塊 · 約 %2 字）";
            case "ja_JP": return "大きなドキュメントの見出しスケルトンを表示中（全 %1 ブロック・約 %2 字）";
            case "en_US":
            default: return "Showing heading skeleton for large doc (%1 blocks · ~%2 chars)";
        }
    }
    public get 完整加载() {
        switch (this.lang) {
            case "zh_CN": return "完整加载";
            case "zh_CHT": return "完整載入";
            case "ja_JP": return "完全ロード";
            case "en_US":
            default: return "Load full";
        }
    }
    public get 完整加载确认标题() {
        switch (this.lang) {
            case "zh_CN": return "完整加载大文档？";
            case "zh_CHT": return "完整載入大文檔？";
            case "ja_JP": return "大きなドキュメントを完全ロードしますか？";
            case "en_US":
            default: return "Load full graph?";
        }
    }
    public get 完整加载确认文案() {
        switch (this.lang) {
            case "zh_CN": return "该文档约 %1 块，完整构建预计 10~40 秒，期间占用较大内存。确认继续？";
            case "zh_CHT": return "該文檔約 %1 塊，完整構建預計 10~40 秒，期間佔用較大內存。確認繼續？";
            case "ja_JP": return "このドキュメントは約 %1 ブロックあり、完全構築に 10~40 秒と大きいメモリを要します。続行しますか？";
            case "en_US":
            default: return "This doc has ~%1 blocks. Full build takes 10-40s and lots of memory. Continue?";
        }
    }
    public get 自动刷新已暂停() {
        switch (this.lang) {
            case "zh_CN": return "大文档：自动刷新已暂停";
            case "zh_CHT": return "大文檔：自動刷新已暫停";
            case "ja_JP": return "大きなドキュメント：自動更新は一時停止中";
            case "en_US":
            default: return "Large doc: auto refresh paused";
        }
    }
    // graphbox 期3（2026-09-04）：大图缩放提示（「超级块/引述块」复用基类既有 getter 不重定义）；
    // 期7 改口径：四态形态下「竖排·向右」是窄窗解，不再说「纵向布局」
    public get 图较大建议切换纵向() {
        switch (this.lang) {
            case "zh_CN": return "图较大（已缩至 %1%），可点顶栏按钮试竖排布局";
            case "zh_CHT": return "圖較大（已縮至 %1%），可點頂欄按鈕試豎排佈局";
            case "ja_JP": return "グラフが大きく（%1% まで縮小）、上部ボタンで縦書きレイアウトを試せます";
            case "en_US":
            default: return "Large graph (zoomed to %1%); try vertical-text layout via the topbar button";
        }
    }
    // graphbox 期7（2026-09-04）：布局形态四态（循环钮 aria-label 与设置项共用）
    public get 切换布局形态() {
        switch (this.lang) {
            case "zh_CN": return "切换布局形态（当前：%1）";
            case "zh_CHT": return "切換佈局形態（當前：%1）";
            case "ja_JP": return "レイアウトを切り替え（現在：%1）";
            case "en_US":
            default: return "Switch layout form (now: %1)";
        }
    }
    public get 形态横排向右() {
        switch (this.lang) {
            case "zh_CN": return "横排·向右";
            case "zh_CHT": return "橫排·向右";
            case "ja_JP": return "横書き·右向き";
            case "en_US":
            default: return "Horizontal, right";
        }
    }
    public get 形态横排向下() {
        switch (this.lang) {
            case "zh_CN": return "横排·向下";
            case "zh_CHT": return "橫排·向下";
            case "ja_JP": return "横書き·下向き";
            case "en_US":
            default: return "Horizontal, down";
        }
    }
    public get 形态竖排向右() {
        switch (this.lang) {
            case "zh_CN": return "竖排·向右";
            case "zh_CHT": return "豎排·向右";
            case "ja_JP": return "縦書き·右向き";
            case "en_US":
            default: return "Vertical, right";
        }
    }
    public get 形态竖排向下() {
        switch (this.lang) {
            case "zh_CN": return "竖排·向下";
            case "zh_CHT": return "豎排·向下";
            case "ja_JP": return "縦書き·下向き";
            case "en_US":
            default: return "Vertical, down";
        }
    }
    public get 默认布局形态() {
        switch (this.lang) {
            case "zh_CN": return "默认布局形态";
            case "zh_CHT": return "預設佈局形態";
            case "ja_JP": return "既定レイアウト";
            case "en_US":
            default: return "Default layout form";
        }
    }
    // 「刷新」复用基类既有 getter（ja_JP=リフレッシュ），不重定义
    public get 图加载中() {
        switch (this.lang) {
            case "zh_CN": return "正在构建块关系图…";
            case "zh_CHT": return "正在構建塊關係圖…";
            case "ja_JP": return "ブロック関係図を構築中…";
            case "en_US":
            default: return "Building graph…";
        }
    }
    // graphbox 三期 □2（2026-09-04）：块全集进图后 av/tb 无可读文本的占位 label
    public get 属性视图块() {
        switch (this.lang) {
            case "zh_CN": return "属性视图";
            case "zh_CHT": return "屬性視圖";
            case "ja_JP": return "属性ビュー";
            case "en_US":
            default: return "Attribute view";
        }
    }
    public get 分割线块() {
        switch (this.lang) {
            case "zh_CN": return "分割线";
            case "zh_CHT": return "分割線";
            case "ja_JP": return "区切り線";
            case "en_US":
            default: return "Divider";
        }
    }
    // graphbox 期2 折叠机制（2026-09-04）：默认展开层级/角标 aria-label
    public get 默认展开层级() {
        switch (this.lang) {
            case "zh_CN": return "默认展开层级（按标题层级）";
            case "zh_CHT": return "預設展開層級（按標題層級）";
            case "en_US":
            default: return "Default expand level (by heading)";
        }
    }
    public get 全部展开() {
        switch (this.lang) {
            case "zh_CN": return "全部";
            case "zh_CHT": return "全部";
            case "en_US":
            default: return "All";
        }
    }
    public get 展开此节点() {
        switch (this.lang) {
            case "zh_CN": return "展开此节点";
            case "zh_CHT": return "展開此節點";
            case "en_US":
            default: return "Expand this node";
        }
    }
    public get 折叠此节点() {
        switch (this.lang) {
            case "zh_CN": return "折叠此节点";
            case "zh_CHT": return "折疊此節點";
            case "en_US":
            default: return "Collapse this node";
        }
    }

    // graphbox 期4 交互重构（2026-09-04）：节点/边右键菜单+定位链路 toast
    public get 在编辑器中显示() {
        switch (this.lang) {
            case "zh_CN": return "在编辑器中显示";
            case "zh_CHT": return "在編輯器中顯示";
            case "ja_JP": return "エディターに表示";
            case "en_US":
            default: return "Show in editor";
        }
    }
    public get 打开所在文档() {
        switch (this.lang) {
            case "zh_CN": return "打开所在文档";
            case "zh_CHT": return "開啟所在文檔";
            case "ja_JP": return "所在ドキュメントを開く";
            case "en_US":
            default: return "Open containing doc";
        }
    }
    public get 复制块ID() {
        switch (this.lang) {
            case "zh_CN": return "复制块 ID";
            case "zh_CHT": return "複製塊 ID";
            case "ja_JP": return "ブロック ID をコピー";
            case "en_US":
            default: return "Copy block ID";
        }
    }
    // 「展开全部段落」随期7 ¶×N 重设计（永不多节点化）退役删除
    public get 复制锚文本() {
        switch (this.lang) {
            case "zh_CN": return "复制锚文本";
            case "zh_CHT": return "複製錨文本";
            case "ja_JP": return "アンカーテキストをコピー";
            case "en_US":
            default: return "Copy anchor text";
        }
    }
    public get 删除此引用() {
        switch (this.lang) {
            case "zh_CN": return "删除此引用";
            case "zh_CHT": return "刪除此引用";
            case "ja_JP": return "この参照を削除";
            case "en_US":
            default: return "Delete this reference";
        }
    }
    public get 删除引用确认标题() {
        switch (this.lang) {
            case "zh_CN": return "删除此引用？";
            case "zh_CHT": return "刪除此引用？";
            case "ja_JP": return "この参照を削除しますか？";
            case "en_US":
            default: return "Delete this reference?";
        }
    }
    public get 删除引用确认文案() {
        switch (this.lang) {
            case "zh_CN": return "将删除两个块之间的引用链接，块本身不受影响。确认继续？";
            case "zh_CHT": return "將刪除兩個塊之間的引用鏈接，塊本身不受影響。確認繼續？";
            case "ja_JP": return "2 つのブロック間の参照リンクを削除します。ブロック自体は影響を受けません。続行しますか？";
            case "en_US":
            default: return "This removes the reference link between two blocks; the blocks themselves stay. Continue?";
        }
    }
    public get 定位需先选中块() {
        switch (this.lang) {
            case "zh_CN": return "请先将光标置于要定位的块中";
            case "zh_CHT": return "請先將游標置於要定位的塊中";
            case "ja_JP": return "先にカーソルを対象ブロックへ置いてください";
            case "en_US":
            default: return "Place the cursor in a block first";
        }
    }
    public get 定位dock未就绪() {
        switch (this.lang) {
            case "zh_CN": return "图面板尚未就绪，请稍后重试";
            case "zh_CHT": return "圖面板尚未就緒，請稍後重試";
            case "ja_JP": return "グラフ面板の準備ができていません。後でお試しください";
            case "en_US":
            default: return "Graph panel not ready, retry shortly";
        }
    }
    public get 定位骨架未含此块() {
        switch (this.lang) {
            case "zh_CN": return "大文档处于标题骨架态，未包含此块；可先在图中「完整加载」再定位";
            case "zh_CHT": return "大文檔處於標題骨架態，未包含此塊；可先在圖中「完整載入」再定位";
            case "ja_JP": return "大きなドキュメントは見出しスケルトン表示のため、このブロックが含まれていません。先に「完全ロード」してください";
            case "en_US":
            default: return "Large doc is in heading-skeleton mode and doesn't include this block; try \"Load full\" first";
        }
    }
    public get 定位超上限() {
        switch (this.lang) {
            case "zh_CN": return "图仅显示前 %1 个块，目标块未包含在内";
            case "zh_CHT": return "圖僅顯示前 %1 個塊，目標塊未包含在內";
            case "ja_JP": return "グラフは最初の %1 ブロックのみ表示のため、対象ブロックが含まれていません";
            case "en_US":
            default: return "Graph shows only the first %1 blocks; the target block is not included";
        }
    }
    // graphbox 二期 □2：定位文案三态分家（并入祖先/真找不到），「超上限」只留给真超限
    public get 定位已并入所在节点() {
        switch (this.lang) {
            case "zh_CN": return "目标块未在图中独立展示，已定位到它所在的节点";
            case "zh_CHT": return "目標塊未在圖中獨立展示，已定位到它所在的節點";
            case "ja_JP": return "対象ブロックはグラフに独立表示されていません。所属ノードに定位しました";
            case "en_US":
            default: return "Block is not shown standalone in the graph; located its containing node";
        }
    }
    public get 定位未找到() {
        switch (this.lang) {
            case "zh_CN": return "未在当前文档的图中找到此块（可能已删除或不在本文档中）";
            case "zh_CHT": return "未在當前文檔的圖中找到此塊（可能已刪除或不在本文檔中）";
            case "ja_JP": return "現在のドキュメントのグラフにこのブロックが見つかりません（削除されたか、別のドキュメントの可能性）";
            case "en_US":
            default: return "Block not found in this document's graph (deleted or in another doc?)";
        }
    }
    public get 已复制() {
        switch (this.lang) {
            case "zh_CN": return "已复制";
            case "zh_CHT": return "已複製";
            case "ja_JP": return "コピーしました";
            case "en_US":
            default: return "Copied";
        }
    }

    // ===== 期3 手动分片书（2026-09-04，群反馈 650189 法律类「以手动分片摘录为主」） =====

    public get 手动分片不自动切() {
        switch (this.lang) {
            case "zh_CN": return "手动分片（不自动切）";
            case "zh_CHT": return "手動分片（不自動切）";
            case "en_US":
            default: return "Manual pieces (no auto-split)";
        }
    }

    public get 手动分片() {
        switch (this.lang) {
            case "zh_CN": return "手动分片";
            case "zh_CHT": return "手動分片";
            case "en_US":
            default: return "Manual";
        }
    }

    public get 手动分片书请直接摘抄() {
        switch (this.lang) {
            case "zh_CN": return "手动分片书无自动分片，请直接摘抄（摘抄即片）";
            case "zh_CHT": return "手動分片書無自動分片，請直接摘抄（摘抄即片）";
            case "en_US":
            default: return "Manual-split book has no auto pieces; excerpt directly (each excerpt is a piece)";
        }
    }

    public get 正在清理旧分片() {
        switch (this.lang) {
            case "zh_CN": return "正在清理旧分片…";
            case "zh_CHT": return "正在清理舊分片…";
            case "en_US":
            default: return "Cleaning old pieces…";
        }
    }

    public get 手动书不参与推送请点击书卡打开() {
        switch (this.lang) {
            case "zh_CN": return "没有可推送的自动分片书；手动分片书请点击书卡打开";
            case "zh_CHT": return "沒有可推送的自動分片書；手動分片書請點擊書卡打開";
            case "en_US":
            default: return "No auto-split books to serve; open a manual-split book from its card";
        }
    }

    public get 手动分片模式说明() {
        switch (this.lang) {
            case "zh_CN": return "已开启手动分片：不自动切分，阅读时用浮条摘抄，每次摘抄即一片";
            case "zh_CHT": return "已開啟手動分片：不自動切分，閱讀時用浮條摘抄，每次摘抄即一片";
            case "en_US":
            default: return "Manual mode on: no auto-split. Excerpt via float bar while reading — each excerpt is a piece";
        }
    }

    public get 手动分片说明() {
        switch (this.lang) {
            case "zh_CN": return "勾选后不自动切分，片由你的摘抄产生（适合法律条文等自定义边界）";
            case "zh_CHT": return "勾選後不自動切分，片由你的摘抄產生（適合法律條文等自定義邊界）";
            case "en_US":
            default: return "When checked, no auto-split — pieces come from your excerpts (e.g. legal clauses)";
        }
    }

    public get 手动书说明() {
        switch (this.lang) {
            case "zh_CN": return "手动分片书：片由摘抄产生，点击阅读打开原书";
            case "zh_CHT": return "手動分片書：片由摘抄產生，點擊閱讀打開原書";
            case "en_US":
            default: return "Manual-split book: pieces are your excerpts; \"Read\" opens the original doc";
        }
    }

    public get 手动书设置说明() {
        switch (this.lang) {
            case "zh_CN": return "手动分片书无分片设置；要改回自动分片请点「重新分片」";
            case "zh_CHT": return "手動分片書無分片設置；要改回自動分片請點「重新分片」";
            case "en_US":
            default: return "Manual-split books have no piece settings; use \"Re-split\" to switch back to auto";
        }
    }

    // ---------- 阅读点翻新（readpoint 战役，2026-09-05）：状态栏钮/面板/相对时间 ----------
    public get 最近在读() {
        switch (this.lang) {
            case "zh_CN": return "最近在读";
            case "zh_CHT": return "最近在讀";
            case "ja_JP": return "最近の読書";
            case "es_ES": return "Lecturas recientes";
            case "fr_FR": return "Lectures récentes";
            case "it_IT": return "Letture recenti";
            case "en_US":
            default: return "Recently reading";
        }
    }

    public get 无匹配结果() {
        switch (this.lang) {
            case "zh_CN": return "没有匹配的阅读点";
            case "zh_CHT": return "沒有匹配的閱讀點";
            case "ja_JP": return "一致する読書ポイントがありません";
            case "es_ES": return "Ningún punto de lectura coincide";
            case "fr_FR": return "Aucun point de lecture correspondant";
            case "it_IT": return "Nessun punto di lettura corrispondente";
            case "en_US":
            default: return "No matching reading points";
        }
    }
    public get 当前文档无阅读点() {
        switch (this.lang) {
            case "zh_CN": return "当前文档还没有阅读点";
            case "zh_CHT": return "目前文檔還沒有閱讀點";
            case "ja_JP": return "このドキュメントには読書ポイントがありません";
            case "es_ES": return "Este documento aún no tiene punto de lectura";
            case "fr_FR": return "Ce document n'a pas encore de point de lecture";
            case "it_IT": return "Questo documento non ha ancora un punto di lettura";
            case "en_US":
            default: return "No reading point in this document yet";
        }
    }
    public get 已设置阅读点() {
        switch (this.lang) {
            case "zh_CN": return "已设置阅读点";
            case "zh_CHT": return "已設置閱讀點";
            case "ja_JP": return "読書ポイントを設定しました";
            case "es_ES": return "Punto de lectura establecido";
            case "fr_FR": return "Point de lecture défini";
            case "it_IT": return "Punto di lettura impostato";
            case "en_US":
            default: return "Reading point set";
        }
    }
    public get 已删除阅读点() {
        switch (this.lang) {
            case "zh_CN": return "已删除阅读点";
            case "zh_CHT": return "已刪除閱讀點";
            case "ja_JP": return "読書ポイントを削除しました";
            case "es_ES": return "Punto de lectura eliminado";
            case "fr_FR": return "Point de lecture supprimé";
            case "it_IT": return "Punto di lettura eliminato";
            case "en_US":
            default: return "Reading point removed";
        }
    }
    public get 搜索文档或摘录() {
        switch (this.lang) {
            case "zh_CN": return "搜索文档或摘录…";
            case "zh_CHT": return "搜尋文檔或摘錄…";
            case "ja_JP": return "ドキュメントや抜粋を検索…";
            case "es_ES": return "Buscar documento o extracto…";
            case "fr_FR": return "Rechercher document ou extrait…";
            case "it_IT": return "Cerca documento o estratto…";
            case "en_US":
            default: return "Search docs or excerpts…";
        }
    }
    public get 暂无阅读点() {
        switch (this.lang) {
            case "zh_CN": return "还没有阅读点——阅读时点击状态栏指示钮或按 {hotkey} 记录当前位置";
            case "zh_CHT": return "還沒有閱讀點——閱讀時點擊狀態欄指示鈕或按 {hotkey} 記錄當前位置";
            case "ja_JP": return "読書ポイントがありません——読書中にステータスバーのボタンまたは {hotkey} で現在地を記録";
            case "es_ES": return "Aún no hay puntos de lectura: durante la lectura, pulsa el botón de la barra o {hotkey}";
            case "fr_FR": return "Pas encore de point de lecture : pendant la lecture, cliquez sur le bouton de la barre ou {hotkey}";
            case "it_IT": return "Nessun punto di lettura: durante la lettura, premi il pulsante della barra o {hotkey}";
            case "en_US":
            default: return "No reading points yet — click the status bar button or press {hotkey} while reading";
        }
    }
    public get 旧版() {
        switch (this.lang) {
            case "zh_CN": return "旧版";
            case "zh_CHT": return "舊版";
            case "ja_JP": return "旧版";
            case "es_ES": return "antiguo";
            case "fr_FR": return "ancien";
            case "it_IT": return "vecchio";
            case "en_US":
            default: return "legacy";
        }
    }
    public get 空内容() {
        switch (this.lang) {
            case "zh_CN": return "（空）";
            case "zh_CHT": return "（空）";
            case "ja_JP": return "（空）";
            case "es_ES": return "(vacío)";
            case "fr_FR": return "(vide)";
            case "it_IT": return "(vuoto)";
            case "en_US":
            default: return "(empty)";
        }
    }
    public get 状态栏添加阅读点开关钮() {
        switch (this.lang) {
            case "zh_CN": return "状态栏添加阅读点开关钮（显示/隐藏悬浮球）";
            case "zh_CHT": return "狀態欄添加閱讀點開關鈕（顯示/隱藏懸浮球）";
            case "ja_JP": return "ステータスバーに読書ポイントスイッチを追加（フローティングボールの表示/非表示）";
            case "es_ES": return "Botón de punto de lectura en la barra de estado (mostrar/ocultar el balón flotante)";
            case "fr_FR": return "Bouton point de lecture dans la barre d'état (afficher/masquer la balle flottante)";
            case "it_IT": return "Pulsante punto di lettura nella barra di stato (mostra/nascondi la palla flottante)";
            case "en_US":
            default: return "Add reading point switch to status bar (show/hide the floating ball)";
        }
    }

    // ---------- 悬浮球（rpfloatbar 战役，2026-09-05）：球↔条双态主交互面 ----------
    public get 阅读点悬浮球() {
        switch (this.lang) {
            case "zh_CN": return "阅读点悬浮球";
            case "zh_CHT": return "閱讀點懸浮球";
            case "ja_JP": return "読書ポイントフローティングボール";
            case "es_ES": return "Balón de punto de lectura";
            case "fr_FR": return "Balle de point de lecture";
            case "it_IT": return "Palla punto di lettura";
            case "en_US":
            default: return "Reading point ball";
        }
    }
    public get 显示阅读点悬浮球() {
        switch (this.lang) {
            case "zh_CN": return "显示阅读点悬浮球（收缩成球，点击展开成条维护阅读点）";
            case "zh_CHT": return "顯示閱讀點懸浮球（收縮成球，點擊展開成條維護閱讀點）";
            case "ja_JP": return "読書ポイントフローティングボールを表示（球に収納、クリックでバーを展開）";
            case "es_ES": return "Mostrar el balón de punto de lectura (contraído como balón; clic para expandir la barra)";
            case "fr_FR": return "Afficher la balle de point de lecture (repliée en balle ; cliquez pour déplier la barre)";
            case "it_IT": return "Mostra la palla punto di lettura (richiusa come palla; clic per espandere la barra)";
            case "en_US":
            default: return "Show reading point floating ball (collapsed as a ball; click to expand the bar)";
        }
    }
    public get 隐藏悬浮球() {
        switch (this.lang) {
            case "zh_CN": return "隐藏悬浮球";
            case "zh_CHT": return "隱藏懸浮球";
            case "ja_JP": return "フローティングボールを隠す";
            case "es_ES": return "Ocultar el balón flotante";
            case "fr_FR": return "Masquer la balle flottante";
            case "it_IT": return "Nascondi la palla flottante";
            case "en_US":
            default: return "Hide floating ball";
        }
    }
    public get 显示悬浮球() {
        switch (this.lang) {
            case "zh_CN": return "显示悬浮球";
            case "zh_CHT": return "顯示懸浮球";
            case "ja_JP": return "フローティングボールを表示";
            case "es_ES": return "Mostrar el balón flotante";
            case "fr_FR": return "Afficher la balle flottante";
            case "it_IT": return "Mostra la palla flottante";
            case "en_US":
            default: return "Show floating ball";
        }
    }
    public get 已隐藏悬浮球() {
        switch (this.lang) {
            case "zh_CN": return "已隐藏悬浮球（顶栏/状态栏图标可找回）";
            case "zh_CHT": return "已隱藏懸浮球（頂欄/狀態欄圖標可找回）";
            case "ja_JP": return "フローティングボールを非表示にしました（トップバー/ステータスバーのアイコンで復元）";
            case "es_ES": return "Balón oculto (recupéralo con el icono de la barra superior o de estado)";
            case "fr_FR": return "Balle masquée (retrouvez-la via l'icône de la barre supérieure ou d'état)";
            case "it_IT": return "Palla nascosta (recuperala con l'icona della barra superiore o di stato)";
            case "en_US":
            default: return "Floating ball hidden (recover via the top bar / status bar icon)";
        }
    }
    public get 已显示悬浮球() {
        switch (this.lang) {
            case "zh_CN": return "已显示悬浮球";
            case "zh_CHT": return "已顯示懸浮球";
            case "ja_JP": return "フローティングボールを表示しました";
            case "es_ES": return "Balón mostrado";
            case "fr_FR": return "Balle affichée";
            case "it_IT": return "Palla mostrata";
            case "en_US":
            default: return "Floating ball shown";
        }
    }
    public get 还没有阅读点() {
        switch (this.lang) {
            case "zh_CN": return "还没有阅读点";
            case "zh_CHT": return "還沒有閱讀點";
            case "ja_JP": return "読書ポイントがありません";
            case "es_ES": return "Aún no hay puntos de lectura";
            case "fr_FR": return "Pas encore de point de lecture";
            case "it_IT": return "Nessun punto di lettura";
            case "en_US":
            default: return "No reading points yet";
        }
    }
    public get 刚刚() {
        switch (this.lang) {
            case "zh_CN": return "刚刚";
            case "zh_CHT": return "剛剛";
            case "ja_JP": return "たった今";
            case "es_ES": return "ahora mismo";
            case "fr_FR": return "à l'instant";
            case "it_IT": return "proprio ora";
            case "en_US":
            default: return "just now";
        }
    }
    public X分钟前(n: number) {
        switch (this.lang) {
            case "zh_CN": return `${n} 分钟前`;
            case "zh_CHT": return `${n} 分鐘前`;
            case "ja_JP": return `${n} 分前`;
            case "es_ES": return `hace ${n} min`;
            case "fr_FR": return `il y a ${n} min`;
            case "it_IT": return `${n} min fa`;
            case "en_US":
            default: return `${n} min ago`;
        }
    }
    public X小时前(n: number) {
        switch (this.lang) {
            case "zh_CN": return `${n} 小时前`;
            case "zh_CHT": return `${n} 小時前`;
            case "ja_JP": return `${n} 時間前`;
            case "es_ES": return `hace ${n} h`;
            case "fr_FR": return `il y a ${n} h`;
            case "it_IT": return `${n} h fa`;
            case "en_US":
            default: return `${n}h ago`;
        }
    }
    public X天前(n: number) {
        switch (this.lang) {
            case "zh_CN": return `${n} 天前`;
            case "zh_CHT": return `${n} 天前`;
            case "ja_JP": return `${n} 日前`;
            case "es_ES": return `hace ${n} d`;
            case "fr_FR": return `il y a ${n} j`;
            case "it_IT": return `${n} g fa`;
            case "en_US":
            default: return `${n}d ago`;
        }
    }
    /** 阅读点相对时间：readingPointCore.relativeTime 的分档描述子 → 本地化文案（老点无时间戳返回空串） */
    public 阅读点时间(desc: { kind: string, n?: number, date?: string } | null): string {
        if (!desc) return "";
        switch (desc.kind) {
            case "justNow": return this.刚刚;
            case "minutes": return this.X分钟前(desc.n);
            case "hours": return this.X小时前(desc.n);
            case "days": return this.X天前(desc.n);
            default: return desc.date ?? "";
        }
    }
    // 设置页重划二期 □1（2026-09-05）：14 域导航新域标签（六语种；英文/西语从短——窄导航列
    // 148px，同 □1 九域版纪律）。「批注」「悬浮球」「阅读」复用基类 key（译文已短）；
    // 「导出工作空间域」与基类卡标题 key（libs/text12.ts）同文不同 key：基类 es/fr/ja 译文长
    // （"Exportar espacio de trabajo"）导航列必折行，导航版从短，导出卡标题继续用基类 key
    // （宽卡面无折行问题）。
    public get 块编辑() {
        switch (this.lang) {
            case "zh_CN": return "块编辑";
            case "zh_CHT": return "塊編輯";
            case "es_ES": return "Edición bloques";
            case "fr_FR": return "Édition blocs";
            case "ja_JP": return "ブロック編集";
            case "en_US":
            default: return "Block editing";
        }
    }
    public get 导出工作空间域() {
        switch (this.lang) {
            case "zh_CN": return "导出工作空间";
            case "zh_CHT": return "導出工作空間";
            case "es_ES": return "Exportar";
            case "fr_FR": return "Exporter";
            case "ja_JP": return "エクスポート";
            case "en_US":
            default: return "Export";
        }
    }
    public get 编辑器工具() {
        switch (this.lang) {
            case "zh_CN": return "编辑器工具";
            case "zh_CHT": return "編輯器工具";
            case "es_ES": return "Útiles editor";
            case "fr_FR": return "Outils éditeur";
            case "ja_JP": return "エディタツール";
            case "en_US":
            default: return "Editor tools";
        }
    }
    public get AI问答() {
        switch (this.lang) {
            case "zh_CN": return "AI 问答";
            case "zh_CHT": return "AI 問答";
            case "es_ES": return "IA preguntas";
            case "fr_FR": return "IA questions";
            case "ja_JP": return "AI質問";
            case "en_US":
            default: return "AI Q&A";
        }
    }
    // 编辑器工具域「编辑器外观与行为」折叠卡 summary（非导航，无折行约束）
    public get 编辑器外观与行为() {
        switch (this.lang) {
            case "zh_CN": return "编辑器外观与行为";
            case "zh_CHT": return "編輯器外觀與行為";
            case "es_ES": return "Apariencia y comportamiento del editor";
            case "fr_FR": return "Apparence et comportement de l'éditeur";
            case "ja_JP": return "エディタの外観と動作";
            case "en_US":
            default: return "Editor appearance & behavior";
        }
    }
    // 反链域折叠垫底区 summary（数据库反链+引用修复两卡收拢）
    public get 数据库反链与引用修复() {
        switch (this.lang) {
            case "zh_CN": return "数据库反链与引用修复";
            case "zh_CHT": return "數據庫反鏈與引用修復";
            case "es_ES": return "Retroenlaces BD y reparar refs";
            case "fr_FR": return "Rétroliens BDD et réparation";
            case "ja_JP": return "DBバックリンクと参照修復";
            case "en_US":
            default: return "DB backlinks & ref repair";
        }
    }
}

// public[^get]+\(  查找所有的函数
export const tomatoI18n = new TomatoI18n();
