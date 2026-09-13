<script lang="ts">
    // 外观域组件（uiclean 2026-09-12 新域，导航第 5 位视觉类相邻）：平铺 2 卡 =
    // 界面净化（6 开关默认全关，自 seller 写死 CSS 迁移改造，CSS 注入见 cssStyle.ts
    // load_uiClean）+ 编辑器外观（6 件纯 CSS 开关自 ConfEditorTools「编辑器外观与行为」
    // 折叠卡迁入，store 与 CSS 注入通道原样、读写同一 storage 键=老用户已开开关无缝衔接）。
    // 无 VIP 门控行。共享样式见 IndexConf.css。
    import {
        cssHomeEndIconLeft,
        cssListBackgound,
        cssNattyList,
        cssShowHomeEndIcon,
        cssShowMemo,
        cssSuperBlockBorder,
        uiCleanDocTreeBadge,
        uiCleanDocTreeCompact,
        uiCleanEmptyHelp,
        uiCleanTabBarBtns,
        uiCleanTabClose,
        uiCleanTopbarStatus,
    } from "./libs/stores";
    import { tomatoI18n } from "./tomatoI18n";
</script>

<!-- 界面净化（6 开关默认全关=原生界面，开=藏） -->
<div class="settingBox">
    <div class="section-title">{tomatoI18n.界面净化}</div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$uiCleanTabClose} />
        {tomatoI18n.隐藏页签上的关闭按钮}
    </div>
    <div class="helpText">{tomatoI18n.净化提示页签关闭钮}</div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$uiCleanTabBarBtns} />
        {tomatoI18n.隐藏页签栏的新建与切换按钮}
    </div>
    <div class="helpText">{tomatoI18n.净化提示页签新建钮}</div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$uiCleanTopbarStatus} />
        {tomatoI18n.隐藏顶栏收件箱与状态栏帮助}
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$uiCleanEmptyHelp} />
        {tomatoI18n.隐藏空白页引导内容}
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$uiCleanDocTreeBadge} />
        {tomatoI18n.文件树隐藏引用计数与文档图标}
    </div>
    <div class="helpText">{tomatoI18n.净化提示文档图标}</div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$uiCleanDocTreeCompact} />
        {tomatoI18n.文件树紧凑模式}
    </div>
    <div class="helpText">{tomatoI18n.净化提示紧凑模式}</div>
</div>

<!-- 编辑器外观（自编辑器工具域「编辑器外观与行为」折叠卡迁入 6 件纯 CSS 开关，行原样） -->
<div class="settingBox">
    <div class="section-title">{tomatoI18n.编辑器外观}</div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$cssShowMemo} />
        {tomatoI18n.显示备注}
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$cssSuperBlockBorder} />
        {tomatoI18n.给所有超级块加上边框}
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$cssNattyList} />
        {tomatoI18n.极简无序列表样式}
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$cssListBackgound} />
        {tomatoI18n.给无序列表加上背景色}
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$cssShowHomeEndIcon} />
        {tomatoI18n.永久显示文档右侧的HomeEnd图标}
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$cssHomeEndIconLeft} />
        {tomatoI18n.HomeEnd图标放到左边}
    </div>
</div>
