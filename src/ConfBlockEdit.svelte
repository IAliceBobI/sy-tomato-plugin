<script lang="ts">
    // 设置域组件（二期 14 域 2026-09-05）：块编辑——块编辑器（钉住式第二视口翻新后大功能
    // 上浮）。confgather（2026-09-15）：块配对工具卡整卡裁出独立「块配对工具」域
    // ConfPairTools.svelte（bear 拍板做法丁——一个引擎一个总开关，域族同名）。
    // 共享样式见 IndexConf.css。
    import {
        blockEditorBox,
        blockEditorMenu,
        qeFloatBall,
    } from "./libs/stores";
    import { BlockEditor打开编辑器 } from "./BlockEditor";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
</script>

<!-- 块编辑器（钉住式第二视口翻新后为本域首卡） -->
<div class="settingBox">
    <div class="section-title">
        <input type="checkbox" class="b3-switch" bind:checked={$blockEditorBox} />
        块编辑器
        <ConfHelpIcon token="AheDdwG35ol3qWxYPeYc8HennJf" />
    </div>
    {#if $blockEditorBox}
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$blockEditorMenu} />
            {tomatoI18n.menu添加右键菜单 + "：" + BlockEditor打开编辑器.langText()}
            <HotkeyCap hk={BlockEditor打开编辑器} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$qeFloatBall} />
            {tomatoI18n.显示块编辑器悬浮球}
        </div>
    {/if}
</div>

<!-- 块配对工具卡已裁出独立「块配对工具」域（ConfPairTools.svelte，2026-09-15 confgather） -->
