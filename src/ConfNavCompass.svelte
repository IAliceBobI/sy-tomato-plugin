<script lang="ts">
    // 设置域组件（navcompass 2026-10-11）：十字罗盘导航——第四悬浮球（点球变身 D-pad
    // 方向导航文档树）。分端启用（独立默认开，结构性键=保存后整插件重载生效）+方向流派
    // （运行时热切）+桌面四方向键帽（键帽随功能走，09-17 bear 拍板形态：开关+名称+键帽
    // 一行紧凑）。共享样式见 IndexConf.css。
    import { nav_compass_desktop, nav_compass_mobile, nav_compass_scheme, nav_compass_flip } from "./libs/stores";
    import { events } from "./libs/Events";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import { NavCompassUpHK, NavCompassDownHK, NavCompassLeftHK, NavCompassRightHK } from "./NavFloat";
</script>

<div class="settingBox">
    <div class="section-title">{tomatoI18n.十字罗盘}</div>
    <div class="helpText">{tomatoI18n.十字罗盘说明}</div>

    <!-- 分端总开关（spec 拍板 11：独立开关默认都开；结构性键改动保存后重载生效） -->
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$nav_compass_desktop} />
        {tomatoI18n.桌面端启用十字罗盘}
    </div>
    <div>
        <input type="checkbox" class="b3-switch" bind:checked={$nav_compass_mobile} />
        {tomatoI18n.手机端启用十字罗盘}
    </div>

    <!-- 方向流派（spec 拍板 5：默认树形；霸主流派=hierarchyNavigate 习惯的 ←→父子 ↑↓
         前后篇）。运行时逐次读=保存即热切，罗盘开着也即时换映射 -->
    <div>
        <select class="b3-select" style="width: 320px; max-width: 100%" bind:value={$nav_compass_scheme}>
            <option value="tree">{tomatoI18n.树形流派}</option>
            <option value="hegemon">{tomatoI18n.霸主流派}</option>
        </select>
        <span class="b3-label__text">{tomatoI18n.方向流派}</span>
    </div>

    <!-- 翻页模式（navflip 2026-10-11）：翻页轴（霸主流派 ↑↓/树形流派 ←→）行为。默认文件夹序
         前后篇；浏览历史=回退翻看已浏览文档（跨文件夹时间线），已在最新处再翻后向=续读下一篇。
         运行时逐次读=保存即热切，罗盘开着也即时换映射；轨迹 localStorage 持久（上限 200 条） -->
    <div>
        <select class="b3-select" style="width: 320px; max-width: 100%" bind:value={$nav_compass_flip}>
            <option value="sibling">{tomatoI18n.翻页跟随文件夹序}</option>
            <option value="history">{tomatoI18n.翻页跟随浏览历史}</option>
        </select>
        <span class="b3-label__text">{tomatoI18n.翻页模式}</span>
    </div>

    <!-- 桌面快捷键四方向键帽（spec 拍板 10：默认 Ctrl+Alt+方向，可改键；命令开关域
         「十字罗盘」族同名对上） -->
    {#if !events.isMobile}
        <div>
            {tomatoI18n.罗盘向上导航}<HotkeyCap hk={NavCompassUpHK} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            {tomatoI18n.罗盘向下导航}<HotkeyCap hk={NavCompassDownHK} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            {tomatoI18n.罗盘向左导航}<HotkeyCap hk={NavCompassLeftHK} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            {tomatoI18n.罗盘向右导航}<HotkeyCap hk={NavCompassRightHK} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
    {/if}

    <div class="helpText">{tomatoI18n.长按球打开十字罗盘设置}（mobile）</div>
</div>
