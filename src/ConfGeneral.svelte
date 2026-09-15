<script lang="ts">
    // 设置域组件（prefixui □3 起）：通用——单卡「快捷键与开关」（原 IndexConf 内联段）+
    // 头部「全部显示」兜底钮（右键菜单管理卡三期退役后隐藏项唯一恢复入口，prefixui □3
    // 自功能仓库域迁回=三期前原籍；功能仓库域随 □3 退役）。杂项卡 21 项已分家；VIP 行
    // 不收（codeValid 不收）。
    // confgather（2026-09-15）：顶栏钮六行（大刷新+四工具钮+语言切换钮）整段裁出独立
    // 「顶栏工具」域 ConfToolbar.svelte（bear 拍板「裁出去一次干净」）。共享样式见 IndexConf.css。
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { tomatoSettingsOpenHK } from "./libs/entryHotkeys";
    import { ScheduleCopyID } from "./Schedule";
    import { addFoldCmd折叠, addFoldCmd展开 } from "./fold";
    import { SPACE } from "./libs/gconst";
    import { copyIdCheckbox, foldCmdCheckbox, hiddenMenuItems } from "./libs/stores";
    import {
        EXPORT_CARD_MENU_ITEMS,
        ANNO_CARD_MENU_ITEMS,
        DOCTREE_CARD_MENU_ITEMS,
    } from "./libs/menuItemRegistry";

    // 右键菜单「全部显示」兜底（prefixui □3 自功能仓库域迁回通用域=三期前原籍；功能仓库退役后
    // 右键菜单管理卡仍是退役态，此钮=隐藏项唯一恢复入口）：清空隐藏集+逐组开 store/master
    // ——跨三组功能卡常量（导出白/黑名单、批注五项、文档树工具四项），漏一组=勾选态假恢复；
    // 含历史被藏项（行删除后无逐项写入路径，清空整个隐藏集故照常覆盖迁移项）
    function showAllMenuItems() {
        hiddenMenuItems.set([]);
        const all = [
            ...EXPORT_CARD_MENU_ITEMS,
            ...ANNO_CARD_MENU_ITEMS,
            ...DOCTREE_CARD_MENU_ITEMS,
        ];
        for (const it of all) {
            it.store?.set(true);
            it.master?.set(true);
        }
    }
</script>

    <!-- 右键菜单「全部显示」兜底（prefixui □3 自功能仓库域头部迁回；隐藏项唯一恢复入口） -->
    <div class="tomato-menu-manage-toolbar">
        <button
            type="button"
            class="b3-button b3-button--small"
            onclick={showAllMenuItems}>{tomatoI18n.全部显示}</button
        >
    </div>

    <!-- 快捷键 -->
    <div class="settingBox">
        <div class="section-title">{tomatoI18n.快捷键与开关}<ConfHelpIcon token="XyFPdPBbsol477xl5TFcX9Ttn2e" /></div>
        <div>
            {tomatoSettingsOpenHK.langText()}<HotkeyCap hk={tomatoSettingsOpenHK} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <!-- 纯命令族（2026-09-06 开关归拢）：开关管命令注册——关=命令面板项+快捷键齐消失；
             折叠/展开一对共用一个开关 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$copyIdCheckbox} />
            {ScheduleCopyID.langText() + SPACE}<HotkeyCap hk={ScheduleCopyID} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$foldCmdCheckbox} />
            {addFoldCmd折叠.langText()}<HotkeyCap hk={addFoldCmd折叠} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$foldCmdCheckbox} />
            {addFoldCmd展开.langText()}<HotkeyCap hk={addFoldCmd展开} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <!-- 打字标点全家（总开关/速记折叠/自定义映射）已迁独立域「打字标点」
             （2026-09-10 punctcfg，bear 提议独立导航项；结构化规则行编辑器见 ConfPunct.svelte） -->
        <!-- 顶栏钮六行（大刷新+四工具钮+语言切换钮）已迁独立域「顶栏工具」
             （2026-09-15 confgather，见 ConfToolbar.svelte） -->
    </div>
