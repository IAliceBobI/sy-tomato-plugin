<script lang="ts">
    // 设置域组件（□2 设置页重划；二期 14 域 2026-09-05 重排；三期 2026-09-08 归位收官）：
    // 文档管理——DailyNote（域首卡，受欢迎待翻新）/ 文档树工具（三期收 exportFiles 4 菜单
    // 开关=开关跟功能走，自通用域右键菜单管理卡归位；前缀文档树卡同期迁功能仓库域）/
    // 文档整理（三期自通用域杂项卡归位）。各卡整块迁入（内部一行不动），共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import NotebookSelect from "./NotebookSelect.svelte";
    import {
        dailyNoteBoxCheckbox,
        dailyNoteCopyAnchorText,
        dailyNoteCopyFlashCard,
        dailyNoteCopyFragment,
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
        dailyNoteReviewTopbar,
        dailyNotetopbarleft,
        dailyNotetopbarright,
        storeMergeDoc,
        storeMoveDocContentHere,
        hiddenMenuItems,
    } from "./libs/stores";
    import {
        DailyNoteBox上一个日志,
        DailyNoteBox下一个日志,
        DailyNoteBox复制到dailynote,
        DailyNoteBox复制到dailynoteNewFile,
        DailyNoteBox移动内容到dailynote,
    } from "./DailyNoteBox";
    import {
        MixBox列出当前文档与子文档中没被引用的文档,
    } from "./MixBox";
    import {
        DOCTREE_CARD_MENU_ITEMS,
        menuItemSelected,
        nextHiddenKeys,
        type ManagedMenuItem,
    } from "./libs/menuItemRegistry";
    import { menuKeyHidden, menuHiddenKeys } from "./libs/menuManager";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);

    // 文档树工具卡菜单开关（三期归位）：checkbox 勾=显示；三层合成判定与隐藏集变更走
    // menuItemRegistry 共享纯函数（ConfExport 导出卡/ConfAnno 批注卡同款，勿在组件层复制）。
    // toggle 只改内存，面板关闭由 IndexConf 统一落盘。{#key} tick 防 toggle 后 checkbox 不刷新
    let doctreeMenuTick = $state(0);
    const doctreeItemShown = (item: ManagedMenuItem) => menuItemSelected(item, menuKeyHidden);
    function toggleDoctreeMenuItem(item: ManagedMenuItem, ev: Event) {
        const target = ev.currentTarget as HTMLInputElement;
        const checked = target?.checked ?? !doctreeItemShown(item);
        hiddenMenuItems.set(nextHiddenKeys(menuHiddenKeys(), item.key, checked));
        doctreeMenuTick++;
    }
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
                {tomatoI18n.打开DailyNote时总是跳到底部}<TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteMoveToBottom} />
                {tomatoI18n.移动到DailyNote时总是移动到底部}
            </div>

            <div>
                {tomatoI18n.日记落点笔记本}
                <NotebookSelect bare></NotebookSelect>
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
    <!-- 文档树工具（三期归位：exportFiles 4 菜单开关自通用域右键菜单管理卡迁入——开关跟
         功能走，治理本战役起点诉求；无独立 store 走 hiddenMenuItems 隐藏集，{#key} 同导出卡防
         toggle 后 checkbox 不刷新） -->
    <div class="settingBox">
        <div class="section-title">
            {tomatoI18n.文档树工具}
            <ConfHelpIcon token="NXSPd81W4oxUJrxW2XsctewUn5g" />
        </div>
        {#key doctreeMenuTick}
            {#each DOCTREE_CARD_MENU_ITEMS as item (item.key)}
                <label class="fn__flex fn__flex-center tomato-menu-manage-item">
                    <input
                        type="checkbox"
                        class="b3-switch"
                        checked={doctreeItemShown(item)}
                        onchange={(ev) => toggleDoctreeMenuItem(item, ev)}
                    />
                    <span class="fn__space"></span>
                    <span class="tomato-menu-manage-label">{item.label()}</span>
                </label>
            {/each}
        {/key}
    </div>
    <!-- 文档整理（三期自通用域杂项卡归位：合并/移动两菜单开关+未引用文档列举键帽） -->
    <div class="settingBox">
        <div class="section-title">{tomatoI18n.文档整理}</div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$storeMergeDoc} />
            {tomatoI18n.menu添加右键菜单}: {tomatoI18n.合并文档到这里}
        </div>
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$storeMoveDocContentHere} />
            {tomatoI18n.menu添加右键菜单}: {tomatoI18n.把文档内容移动到这里}
        </div>
        <div>
            {MixBox列出当前文档与子文档中没被引用的文档.langText()}
            <HotkeyCap hk={MixBox列出当前文档与子文档中没被引用的文档} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
    </div>
    <!-- 前缀文档树卡已迁功能仓库域（ConfVault），本域不再渲染 -->

