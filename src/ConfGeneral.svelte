<script lang="ts">
    // 设置域组件（三期 2026-09-08 收纳改组终态）：通用——单卡「快捷键与开关」（原 IndexConf
    // 内联段）。杂项卡 21 项已分家（□2：8 项各回各家/2 项进功能仓库/11 项随杂项独立域）；
    // 右键菜单管理卡已退役（□3：exportFiles 四开关归位文档树工具卡、「全部显示」兜底钮迁
    // 功能仓库域头部）——本组件不再含杂项、VIP 行与菜单管理（codeValid 不收）。共享样式见
    // IndexConf.css。
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { tomatoSettingsOpenHK, tomatoBigReloadHK } from ".";
    import { ScheduleCopyID } from "./Schedule";
    import { addFoldCmd折叠, addFoldCmd展开 } from "./fold";
    import { SPACE } from "./libs/gconst";
    import {
        bigReloadTopbar,
        copyIdCheckbox,
        foldCmdCheckbox,
        toolbarspacerepeat,
        toolbarrefreshVr,
        toolbarlocatedoc,
        toolbarTidy,
        toolbarEN2CHBtn,
    } from "./libs/stores";
    import {
        ToolBarBox间隔重复,
        ToolBarBox刷新虚拟引用,
        ToolBarBox突出定位文档,
        ToolBarBox整理assets下的图片视频音频,
    } from "./ToolbarBox";
</script>

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
        <!-- 大刷新（2026-09-06 seller 迁入）：开关+键帽合一行（用户拍板不分家）——开关=顶栏
             钮显隐（命令/热键恒在），键帽=HotkeyCap 全套改键；保存→插件级重载生效 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$bigReloadTopbar} />
            {tomatoBigReloadHK.langText()}<HotkeyCap hk={tomatoBigReloadHK} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <!-- 工具箱顶栏钮族（2026-09-06 开关归拢救活死键）：开关=钮显隐，命令/热键恒在
             （大刷新同款语义）；四命令原零键帽行，此处顺手补 HotkeyCap 全套改键 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$toolbarspacerepeat} />
            {ToolBarBox间隔重复.langText()}<HotkeyCap hk={ToolBarBox间隔重复} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$toolbarrefreshVr} />
            {ToolBarBox刷新虚拟引用.langText()}<HotkeyCap hk={ToolBarBox刷新虚拟引用} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$toolbarlocatedoc} />
            {ToolBarBox突出定位文档.langText()}<HotkeyCap hk={ToolBarBox突出定位文档} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$toolbarTidy} />
            {ToolBarBox整理assets下的图片视频音频.langText()}<HotkeyCap hk={ToolBarBox整理assets下的图片视频音频} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <!-- 语言切换六钮（中/英/臺/日/西/法）显隐：无命令热键，纯开关行 -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$toolbarEN2CHBtn} />
            {tomatoI18n.语言切换顶栏钮}
        </div>
    </div>
