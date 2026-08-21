<script lang="ts">
    // IndexConf 设置分区：状态栏番茄钟 / 拍照闪念 / 批注 / 思维导线 / 块关系图。
    // 从 IndexConf.svelte 拆出（2026-08 重构），共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import {
        avoiding_cloud_synchronization_conflicts,
        commentBoxAddUnderline,
        commentBoxCheckbox,
        commentBoxMenu,
        commentBoxSaveUnderDoc,
        commentBoxShowID,
        cssFlashThoughts,
        flashThoughtUseDialog,
        flash_thoughts_2_top,
        flash_thoughts_target_file,
        graphAddTopbarIcon,
        graphBoxCheckbox,
        graphClick2Locate,
        graphHideStructEdges,
        graphMaxAllBlocks,
        graphMaxPBlocks,
        graph定位到图中的节点Menu,
        graph打开块关系图Menu,
        mindWireCheckbox,
        mindWireColorfull,
        mindWireDocMenu,
        mindWireDynamicLine,
        mindWireGlobalMenu,
        mindWireLine,
        mindWireStarRefOnly,
        mindWireWidth,
        noteBoxAllKinds,
        noteBoxCheckbox,
        tomatoClockCheckbox,
        tomato_clocks,
        tomato_clocks_audio,
        tomato_clocks_change_bg,
        tomato_clocks_change_bg_dark,
        tomato_clocks_force_dialog,
        tomato_clocks_force_notice,
        tomato_clocks_opacity,
        tomato_clocks_position_right,
    } from "./libs/stores";
    import { lastVerifyResult } from "./libs/user";
    import { CommentBoxTab批注, CommentBox添加批注到日记 } from "./CommentBox";
    import { MindWire启用或禁用思维导线, MindWire启用或禁用文档思维导线 } from "./MindWire";
    import { GraphBox定位到图中的节点, GraphBox打开块关系图 } from "./GraphBox";
    import { NoteBox拍照闪念全局 } from "./NoteBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { helpOpen } from "./helpOpen";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);
</script>

    <!-- 状态栏番茄钟 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$tomatoClockCheckbox} />
            {tomatoI18n.状态栏番茄钟}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/KmCRdj1s7okXZOxkwsTcbPFXnNh?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $tomatoClockCheckbox}
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$tomato_clocks_position_right} />
                {tomatoI18n.番茄钟在状态栏的右边}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$tomato_clocks_force_dialog} />
                {tomatoI18n.禁用强提醒}
            </div>

            <div>
                <input class="b3-text-field" bind:value={$tomato_clocks} />
                {tomatoI18n.番茄钟时长多个间用逗号隔开}
            </div>

            <div>
                <input class="b3-text-field" bind:value={$tomato_clocks_audio} />
                {tomatoI18n.时间到播放声音}
            </div>

            <div>
                <input class="b3-text-field" bind:value={$tomato_clocks_force_notice} />
                {tomatoI18n.随机视频}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    class="b3-text-field"
                    bind:value={$tomato_clocks_change_bg}
                />
                {tomatoI18n.计时后修改背景明亮模式}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    class="b3-text-field"
                    bind:value={$tomato_clocks_change_bg_dark}
                />
                {tomatoI18n.计时后修改背景黑暗模式}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    class="b3-text-field"
                    bind:value={$tomato_clocks_opacity}
                />
                {tomatoI18n.背景图透明度}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>
        {/if}
    </div>
    <!-- 拍照闪念 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$noteBoxCheckbox} />
            {tomatoI18n.拍照闪念收集图片闪念到}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/N3LkdvKGhowkTUx1r6OcxCjInec?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $noteBoxCheckbox}
            <div>
                {NoteBox拍照闪念全局.langText()}<strong>{NoteBox拍照闪念全局.w()}</strong>
            </div>
            <div>
                <textarea spellcheck="false" class="b3-text-field" bind:value={$noteBoxAllKinds}></textarea>
                {tomatoI18n.自定义图标}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$flashThoughtUseDialog} />
                {tomatoI18n.触发快捷键时弹出对话框}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$avoiding_cloud_synchronization_conflicts}
                />
                {tomatoI18n.规避云端同步冲突}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$flash_thoughts_2_top} />
                {tomatoI18n.闪念插入到Dailynote顶端}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cssFlashThoughts} />
                {tomatoI18n.显示闪念的时间与类型}
            </div>

            <div>
                <input class="b3-text-field" bind:value={$flash_thoughts_target_file} />
                {tomatoI18n.闪念插入到文件}
            </div>
        {/if}
    </div>
    <!-- 批注 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$commentBoxCheckbox} />
            {tomatoI18n.批注}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/Svq2dIQpaob0kKx0l38ciftRnXl?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $commentBoxCheckbox}
            <div>
                {tomatoI18n.打开批注页签}
                <strong>{CommentBoxTab批注.w()}</strong>
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$commentBoxMenu} />
                {tomatoI18n.menu添加右键菜单}
                <strong>{CommentBox添加批注到日记.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$commentBoxAddUnderline} />
                {tomatoI18n.批注添加下划线}
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$commentBoxSaveUnderDoc} />
                {tomatoI18n.把批注保存在子文档否则保存在日记中}
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$commentBoxShowID} />
                {tomatoI18n.显示ID}
            </div>
        {/if}
    </div>
    <!-- 思维导线 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$mindWireCheckbox} />
            {tomatoI18n.思维导线}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/QNArdYNuuoH34qxGHdCcHmE6nic?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $mindWireCheckbox}
            <div>
                {tomatoI18n.思维导线帮助}
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$mindWireGlobalMenu} />
                {tomatoI18n.menu添加右键菜单}:
                {MindWire启用或禁用思维导线.langText()}
                <strong>{MindWire启用或禁用思维导线.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$mindWireDocMenu} />
                {tomatoI18n.menu添加右键菜单}:
                {MindWire启用或禁用文档思维导线.langText()}
                <strong>{MindWire启用或禁用文档思维导线.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$mindWireStarRefOnly} />
                {tomatoI18n.只关联星号引用}
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$mindWireLine}
                />
                {tomatoI18n.使用实线}<TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$mindWireColorfull}
                />
                {tomatoI18n.使用多种颜色}<TomatoVIP {codeValid}></TomatoVIP>
            </div>
            {#if !($mindWireLine && lastVerifyResult())}
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$mindWireDynamicLine} />
                    {tomatoI18n.流动线条效果}
                </div>
            {/if}
            <div>
                <input class="b3-text-field" type="number" min="0.1" bind:value={$mindWireWidth} />
                {tomatoI18n.线条宽度}
            </div>
        {/if}
    </div>
    <!-- 块关系图 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$graphBoxCheckbox} />
            {tomatoI18n.块关系图}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/UIRudM9EQoyri2x4okkcjbGZnug?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $graphBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$graph定位到图中的节点Menu} />
                {tomatoI18n.menu添加右键菜单}: {GraphBox定位到图中的节点.langText()}
                <strong>{GraphBox定位到图中的节点.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$graph打开块关系图Menu} />
                {tomatoI18n.menu添加右键菜单}: {GraphBox打开块关系图.langText()}
                <strong>{GraphBox打开块关系图.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$graphAddTopbarIcon} />
                {tomatoI18n.添加顶栏图标}
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$graphClick2Locate}
                />
                {tomatoI18n.左键点击节点跳转到文档}<TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input class="b3-text-field" bind:value={$graphMaxPBlocks} />
                {tomatoI18n.最大连续段落块数量}
            </div>

            <div>
                <input class="b3-text-field" bind:value={$graphMaxAllBlocks} />
                {tomatoI18n.最大节点数量}
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$graphHideStructEdges} />
                隐藏结构连线（仅显示引用形成的连线）
            </div>
            <div>
                {@html tomatoI18n.块关系图帮助}
            </div>
        {/if}
    </div>
