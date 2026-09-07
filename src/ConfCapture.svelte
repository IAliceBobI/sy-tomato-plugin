<script lang="ts">
    // 设置域组件（二期 14 域 2026-09-05）：速记——拍照闪念（自 ConfClock.svelte 迁入）
    // + 快速笔记（自 ConfMisc.svelte 迁入）两卡（待翻新域）。悬浮球卡已拆出 ConfFloatBall
    // 独立成域（原 ConfFloatingBall 全部回归）。各卡整块迁入（内部一行不动），
    // 共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import NotebookSelect from "./NotebookSelect.svelte";
    import {
        avoiding_cloud_synchronization_conflicts,
        cssFlashThoughts,
        flash_thoughts_2_top,
        flash_thoughts_target_file,
        shorthandRelayEnabled,
        noteBoxAllKinds,
        noteBoxCheckbox,
        fastNoteBoxAdd2Flashcard,
        fastNoteBoxCheckbox,
        fastNoteBoxDelAfterCreating,
        fastNoteBoxDisableBK,
        fastNoteBoxDocPrefix,
        storeNoteBox_fastnote,
        quickNoteCheckbox,
        quickNoteOpenMode,
    } from "./libs/stores";
    import { QuickNote速记器全局 } from "./QuickNote";
    import { FastNoteBox创建快速笔记, FastNoteBox打开最后一个笔记, FastNoteBox草稿切换 } from "./FastNoteBox";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);
</script>

    <!-- 拍照闪念（□4 设置域归并 2026-09-06：入口→落点→行为三区；落点区与 ConfDocs
         dailynote 卡同一 NotebookSelect/同一 store，呈现统一） -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$noteBoxCheckbox} />
            {tomatoI18n.拍照闪念收集图片闪念到}
            <ConfHelpIcon token="N3LkdvKGhowkTUx1r6OcxCjInec" />
        </div>
        <!-- 速记器（quicknote □2；□4 窗口统一化=全局唯一入口）：开关+名称+键帽合一行；
             触发形态一行（外部轻窗默认/带出思源）。放总开关 if 外=速记器独立于拍照闪念开关
             （保存链落点共享但入口独立） -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$quickNoteCheckbox} />
            {QuickNote速记器全局.langText()}
            <HotkeyCap hk={QuickNote速记器全局} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        {#if $quickNoteCheckbox}
            <div>
                {tomatoI18n.速记器触发形态}
                <select class="b3-select" bind:value={$quickNoteOpenMode}>
                    <option value="external">{tomatoI18n.外部轻窗}</option>
                    <option value="focus">{tomatoI18n.带出思源}</option>
                </select>
            </div>
        {/if}
        {#if $noteBoxCheckbox}
            <!-- □4：「拍照闪念（全局）⌥7」「触发快捷键时弹出对话框」「失焦时自动关闭小窗」
                 三行退役——全局入口统一到速记器 ⌥J（形态可配），图片闪念走 Dock 图标/速记器
                 focus 形态进面板；设置可见性与功能可用性一致 -->
            <div>
                <textarea spellcheck="false" class="b3-text-field" bind:value={$noteBoxAllKinds}></textarea>
                {tomatoI18n.自定义图标}
            </div>

            <div>
                {tomatoI18n.日记落点笔记本}
                <NotebookSelect bare></NotebookSelect>
            </div>

            <div>
                <input class="b3-text-field" bind:value={$flash_thoughts_target_file} />
                {tomatoI18n.闪念插入到文件}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$shorthandRelayEnabled} />
                {tomatoI18n.官方速记搬运}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
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
        {/if}
    </div>
    <!-- 快速笔记 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$fastNoteBoxCheckbox} />
            {tomatoI18n.快速笔记}
            <ConfHelpIcon token="DNZ1dYORAoHpm7xdPaecyb6Pnrh" />
        </div>
        {#if $fastNoteBoxCheckbox}
            <div>{tomatoI18n.快捷键如有冲突请调整}</div>

            <div>
                {tomatoI18n.创建快速笔记}
                <HotkeyCap hk={FastNoteBox创建快速笔记} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div>
                {tomatoI18n.打开最后一个笔记}
                <HotkeyCap hk={FastNoteBox打开最后一个笔记} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div class:codeNotValid>
                {FastNoteBox草稿切换.langText()}
                <HotkeyCap hk={FastNoteBox草稿切换} pluginName="sy-tomato-plugin"></HotkeyCap><TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <NotebookSelect store={storeNoteBox_fastnote}></NotebookSelect>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$fastNoteBoxDisableBK} />
                {tomatoI18n.禁用底部反链}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$fastNoteBoxAdd2Flashcard} />
                {tomatoI18n.创建文件时制卡}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$fastNoteBoxDelAfterCreating}
                />
                {tomatoI18n.删除所选段落}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$fastNoteBoxDocPrefix} />
                {tomatoI18n.使用当前文档名字的前缀}
            </div>
        {/if}
    </div>
