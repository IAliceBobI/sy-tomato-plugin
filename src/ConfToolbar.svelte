<script lang="ts">
    // 顶栏工具域（confgather 2026-09-15，bear 拍板「裁出去一次干净」）：番茄在思源顶栏上的
    // 全部按钮显隐——大刷新钮+四工具钮（间隔重复/刷新虚拟引用/突出定位文档/整理素材）+
    // 语言切换钮，自通用域「快捷键与开关」卡整行裁出独立成域；命令开关域「顶栏工具」族自此
    // 对上家（大刷新命令同期自 general 族挪入 toolbar 族）。共享样式见 IndexConf.css。
    import HotkeyCap from "./HotkeyCap.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { tomatoBigReloadHK } from "./libs/entryHotkeys";
    import {
        bigReloadTopbar,
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

<div class="settingBox">
    <div class="section-title">{tomatoI18n.顶栏工具}</div>
    <!-- 大刷新（2026-09-06 seller 迁入语义原样）：开关+键帽合一行（用户拍板不分家）——
         开关=顶栏钮显隐（命令/热键恒在），键帽=HotkeyCap 全套改键；保存→插件级重载生效 -->
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$bigReloadTopbar} />
        {tomatoBigReloadHK.langText()}<HotkeyCap hk={tomatoBigReloadHK} pluginName="sy-tomato-plugin"></HotkeyCap>
    </div>
    <!-- 工具箱顶栏钮族（2026-09-06 开关归拢救活死键语义原样）：开关=钮显隐，命令/热键恒在
         （大刷新同款语义） -->
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
