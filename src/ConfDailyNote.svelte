<script lang="ts">
    // IndexConf 设置分区：DailyNote 工具。
    // 从 IndexConf.svelte 拆出（2026-08 重构），共享样式见 IndexConf.css。
    // 2026-08-31 块配对工具 □1 归拢：同步块/双向互链两段迁 ConfBlocks.svelte，
    // 本组件更名自 ConfLinks.svelte。
    import TomatoVIP from "./TomatoVIP.svelte";
    import NotebookSelect from "./NotebookSelect.svelte";
    import {
        dailyNoteBoxCheckbox,
        dailyNoteCopyAnchorText,
        dailyNoteCopyFlashCard,
        dailyNoteCopyInsertPR,
        dailyNoteCopyMenu,
        dailyNoteCopyShowPath,
        dailyNoteCopySimple,
        dailyNoteCopyUpdateBG,
        dailyNoteCopyUseRef,
        dailyNoteGoToBottom,
        dailyNoteGoToBottomMenu,
        dailyNoteMoveLeaveLnk,
        dailyNoteMoveToBottom,
        dailyNotetopbarleft,
        dailyNotetopbarright,
    } from "./libs/stores";
    import {
        DailyNoteBox上一个日志,
        DailyNoteBox下一个日志,
        DailyNoteBox复制到dailynote,
        DailyNoteBox复制到dailynoteNewFile,
        DailyNoteBox移动内容到dailynote,
    } from "./DailyNoteBox";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);
</script>

    <!-- DailyNote -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteBoxCheckbox} />
            {tomatoI18n.dailynote工具}
            <ConfHelpIcon token="MuXadWNNEoSsuExVj7dcZcY1nJb" />
        </div>
        {#if $dailyNoteBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNotetopbarleft} />
                {tomatoI18n.topbar添加图标}:
                {DailyNoteBox上一个日志.langText()}
                <HotkeyCap hk={DailyNoteBox上一个日志} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNotetopbarright} />
                {tomatoI18n.topbar添加图标}:
                {DailyNoteBox下一个日志.langText()}
                <HotkeyCap hk={DailyNoteBox下一个日志} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteGoToBottomMenu} />
                {tomatoI18n.menu添加右键菜单}： {DailyNoteBox移动内容到dailynote.langText()}
                <HotkeyCap hk={DailyNoteBox移动内容到dailynote} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteMoveLeaveLnk} />
                {tomatoI18n.移动内容到dailynote后原文改为链接}
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dailyNoteGoToBottom}
                />
                {tomatoI18n.打开DailyNote时总是跳到底部}<TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteMoveToBottom} />
                {tomatoI18n.移动到DailyNote时总是移动到底部}
            </div>

            <div>
                <NotebookSelect></NotebookSelect>
            </div>

            <div>
                {DailyNoteBox复制到dailynote.langText()}
                <HotkeyCap hk={DailyNoteBox复制到dailynote} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            {#if !$dailyNoteCopySimple}
                <div>
                    {DailyNoteBox复制到dailynoteNewFile.langText()}
                    <HotkeyCap hk={DailyNoteBox复制到dailynoteNewFile} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
            {/if}
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyMenu} />
                {tomatoI18n.menu添加右键菜单}： {tomatoI18n.复制到dailynote}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopySimple} />
                {tomatoI18n.简单复制到dailynote}
            </div>

            {#if !$dailyNoteCopySimple}
                <div>
                    <input class="b3-text-field" bind:value={$dailyNoteCopyAnchorText} />
                    {tomatoI18n.复制到dailynote使用的锚文本}
                </div>

                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyUseRef} />
                    {tomatoI18n.使用引用来回溯}
                </div>

                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyInsertPR} />
                    {tomatoI18n.在原文中同时插入阅读点}
                </div>

                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyUpdateBG} />
                    {tomatoI18n.改变原文的背景}
                </div>

                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyShowPath} />
                    {tomatoI18n.复制的内容显示原文的路径}
                </div>

                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyFlashCard} />
                    {tomatoI18n.加入闪卡}
                </div>
            {/if}
        {/if}
    </div>
