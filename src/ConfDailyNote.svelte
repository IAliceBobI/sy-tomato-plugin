<script lang="ts">
    // 日记域（confgather 2026-09-15，bear 拍板「裁出去一次干净」）：DailyNote 卡整卡自
    // 「文档管理」域域首裁出独立成域——命令开关域「日记」族自此对上家；卡内一行不动
    // （受欢迎待翻新）。共享样式见 IndexConf.css。
    import NotebookSelect from "./NotebookSelect.svelte";
    import DocPathSelect from "./DocPathSelect.svelte";
    import {
        dailyNoteBoxCheckbox,
        dailyNoteCopyAnchorMode,
        dailyNoteCopyAnchorText,
        dailyNoteCopyFlashMenu,
        dailyNoteCopyFragment,
        dailyNoteCopyFragmentPlain,
        dailyNoteCopyInsertPR,
        dailyNoteCopyMenu,
        dailyNoteCopyShowPath,
        dailyNoteCopySimple,
        dailyNoteCopyTarget,
        dailyNoteCopyTargetDoc,
        dailyNoteCopyUpdateBG,
        dailyNoteGoToBottom,
        dailyNoteGoToBottomMenu,
        dailyNoteMoveLeaveLnk,
        dailyNoteMoveToBottom,
        dailyNoteReviewTopbar,
        dailyNotetopbarleft,
        dailyNotetopbarright,
    } from "./libs/stores";
    import {
        DailyNoteBox上一个日志,
        DailyNoteBox下一个日志,
        DailyNoteBox复制到dailynote,
        DailyNoteBox复制到dailynoteNewFile,
        DailyNoteBox复制到dailynote闪卡,
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
            {tomatoI18n.topbar添加图标}: {DailyNoteBox上一个日志.langText()}
            <HotkeyCap hk={DailyNoteBox上一个日志} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$dailyNotetopbarright} />
            {tomatoI18n.topbar添加图标}: {DailyNoteBox下一个日志.langText()}
            <HotkeyCap hk={DailyNoteBox下一个日志} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteReviewTopbar} />
            {tomatoI18n.topbar添加图标}: {tomatoI18n.回顾日记}
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteGoToBottomMenu} />
            {tomatoI18n.menu添加右键菜单}: {DailyNoteBox移动内容到dailynote.langText()}
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
            {tomatoI18n.打开DailyNote时总是跳到底部}
        </div>

        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteMoveToBottom} />
            {tomatoI18n.移动到DailyNote时总是移动到底部}
        </div>

        <div>
            {tomatoI18n.日记落点笔记本}
            <NotebookSelect bare></NotebookSelect>
        </div>

        <!-- A1 复制收集落点三档（陆杰 2026-10-11）：仅「复制到 dailynote」链生效，移动
             内容/快记 NewFile 本就是日记/快记语义不接三档；fixed 档目标失效即清+提示重选 -->
        <div>
            {tomatoI18n.复制收集落点}
            <select class="b3-select" bind:value={$dailyNoteCopyTarget}>
                <option value="daily">{tomatoI18n.落点当日日记}</option>
                <option value="fixed">{tomatoI18n.落点固定文档}</option>
                <option value="source">{tomatoI18n.落点来源子文档}</option>
            </select>
            {#if $dailyNoteCopyTarget === "fixed"}
                <DocPathSelect onPick={(id) => dailyNoteCopyTargetDoc.set(id)} />
            {/if}
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
            {tomatoI18n.menu添加右键菜单}: {tomatoI18n.复制到dailynote}
        </div>

        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopySimple} />
            {tomatoI18n.简单复制到dailynote}
        </div>

        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyFragment} />
            {tomatoI18n.划词复制选中片段}
        </div>

        <!-- A2 划词片段纯净档：片段级（勿与块级「简单复制」混淆），挂划词开关下 -->
        {#if $dailyNoteCopyFragment}
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyFragmentPlain} />
                {tomatoI18n.划词片段纯净落块}
                <div class="helpText">{tomatoI18n.划词片段纯净落块说明}</div>
            </div>
        {/if}

        {#if !$dailyNoteCopySimple}
            <div>
                <input class="b3-text-field" bind:value={$dailyNoteCopyAnchorText} />
                {tomatoI18n.复制到dailynote使用的锚文本}
            </div>

            <!-- A3 锚三态：旧布尔「使用引用来回溯」迁移而来（true→ref/false→href），旧键留盘不再展示 -->
            <div>
                {tomatoI18n.复制锚形态}
                <select class="b3-select" bind:value={$dailyNoteCopyAnchorMode}>
                    <option value="ref">{tomatoI18n.锚形态引用}</option>
                    <option value="href">{tomatoI18n.锚形态超链接}</option>
                    <option value="none">{tomatoI18n.锚形态不挂锚}</option>
                </select>
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

            <!-- 2026-10-04 双菜单：老「加入闪卡」行为开关退役——恒定制卡变体自带菜单开关 -->
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyFlashMenu} />
                {tomatoI18n.menu添加右键菜单}: {DailyNoteBox复制到dailynote闪卡.langText()}
                <HotkeyCap hk={DailyNoteBox复制到dailynote闪卡} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
        {/if}
    {/if}
</div>
