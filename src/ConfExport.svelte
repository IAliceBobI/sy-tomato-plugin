<script lang="ts">
    // IndexConf 设置分区：导出工作空间 / 块编辑器 / 引用修复工具。
    // 从 IndexConf.svelte 拆出（2026-08 重构），共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import {
        blockEditorBox,
        blockEditorMenu,
        exportBlackList,
        exportCleanFiles,
        exportCleanFilesOn,
        exportIntervalSec,
        exportIntervalSecOn,
        exportPath,
        exportPathWin,
        exportWL4All,
        exportWhiteList,
        markdownExportBoxCheckbox,
        markdownExportPics,
        superRefBoxCheckBox,
        superRefBoxGlobalFixMenu,
        superRefBoxGlobalLnkMenu,
    } from "./libs/stores";
    import { getHpath } from "./libs/utils";
    import { events } from "./libs/Events";
    import {
        cleanExportedMds,
        exportMd2Dir,
        MarkdownExport全量导出,
        MarkdownExport增量导出,
        MarkdownExport确保导出符合配置,
    } from "./MarkdownExportBox";
    import { BlockEditor打开编辑器 } from "./BlockEditor";
    import { SuperRefBox全局修复引用, SuperRefBox全局加固引用 } from "./SuperRefBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { helpOpen } from "./helpOpen";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);
</script>

    <!-- 导出工作空间 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$markdownExportBoxCheckbox} />
            {tomatoI18n.导出工作空间}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/UmNxds5JLo4m1qxc7j3cOvh4ncc?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $markdownExportBoxCheckbox}
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$exportWL4All} />
                {tomatoI18n.导出所有文件}
            </div>
            <div>
                {#if $exportWL4All}
                    <div></div>
                {:else if $exportWhiteList.length === 0}
                    <div class="kbd">
                        <strong>⚠️{tomatoI18n.白名单为空请先在文档树中右键添加文档}⚠️</strong>
                    </div>
                {:else}
                    {#each $exportWhiteList as item, index}
                        <div>
                            <button
                                class="b3-button b3-button--text space"
                                onclick={() => {
                                    $exportWhiteList.splice(index, 1);
                                    $exportWhiteList = $exportWhiteList;
                                }}
                            >
                                🗑️
                            </button>
                            {#await getHpath(item)}
                                <span class="text">{item} ✅</span>
                            {:then v}
                                <span class="text">{v} ✅</span>
                            {/await}
                        </div>
                    {/each}
                {/if}
            </div>
            <div>
                {#if $exportBlackList.length === 0}
                    <div class="kbd">
                        {tomatoI18n.黑名单为空可在文档树中右键添加}
                    </div>
                {:else}
                    {#each $exportBlackList as item, index}
                        <div>
                            <button
                                class="b3-button b3-button--text space"
                                onclick={() => {
                                    $exportBlackList.splice(index, 1);
                                    $exportBlackList = $exportBlackList;
                                }}
                            >
                                🗑️
                            </button>
                            {#await getHpath(item)}
                                <span class="text">{item} 🚫</span>
                            {:then v}
                                <span class="text">{v} 🚫</span>
                            {/await}
                        </div>
                    {/each}
                {/if}
            </div>
            <div>
                {#if events.isWindows}
                    <input class="b3-text-field space" placeholder={$exportPath} bind:value={$exportPathWin} />
                {:else}
                    <input placeholder="D:\\backup" class="b3-text-field space" bind:value={$exportPath} />
                {/if}
                {tomatoI18n.导出工作空间到此文件夹}
            </div>
            <div class:codeNotValid>
                <input type="checkbox" class="b3-switch" bind:checked={$exportIntervalSecOn} />
                {#if $exportIntervalSecOn}
                    <input
                        title={tomatoI18n.可以填写小数}
                        class="b3-text-field space"
                        bind:value={$exportIntervalSec}
                    />
                    {tomatoI18n.每x秒执行一次增量导出($exportIntervalSec)}
                {:else}
                    {tomatoI18n.每x秒执行一次增量导出("0")}
                {/if}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div class:codeNotValid>
                <input type="checkbox" class="b3-switch" bind:checked={$exportCleanFilesOn} />
                {#if $exportCleanFilesOn}
                    <input title={tomatoI18n.可以填写小数} class="b3-text-field space" bind:value={$exportCleanFiles} />
                    {tomatoI18n.每x分钟确保导出符合配置($exportCleanFiles)}
                {:else}
                    {tomatoI18n.每x分钟确保导出符合配置("0")}
                {/if}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div>
                <label class="space">
                    <input type="checkbox" class="b3-switch" bind:checked={$markdownExportPics} />{tomatoI18n.导出图片}
                </label>
                <button class="b3-button b3-button--outline space" onclick={() => exportMd2Dir(true)}
                    >{MarkdownExport全量导出.langText() + MarkdownExport全量导出.w()}
                </button>
                <button class="b3-button b3-button--outline space" onclick={() => exportMd2Dir()}
                    >{MarkdownExport增量导出.langText() + MarkdownExport增量导出.w()}
                </button>
                <button class="b3-button b3-button--outline space" onclick={() => cleanExportedMds()}
                    >{MarkdownExport确保导出符合配置.langText() + MarkdownExport确保导出符合配置.w()}
                </button>
            </div>
        {/if}
    </div>
    <!-- 块编辑器 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$blockEditorBox} />
            块编辑器
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/AheDdwG35ol3qWxYPeYc8HennJf?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $blockEditorBox}
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$blockEditorMenu} />
                {tomatoI18n.menu添加右键菜单 + "：" + BlockEditor打开编辑器.langText()}
                <strong>{BlockEditor打开编辑器.w()}</strong>
            </div>
        {/if}
    </div>
    <!-- 修复引用 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$superRefBoxCheckBox} />
            引用修复工具
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/WTgxdUINHoYXHbxmU87cxs5knfd?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $superRefBoxCheckBox}
            <div>这是一个实验功能，请提前备份好。</div>
            <div>打开或关闭文档时，自动对当前文档中的引用进行加固处理</div>
            <div>经过加固的引用，在原文的ID改变后，可以被修复重新指向新原文。 （原文被删除，但保留拷贝的副本）</div>
            <div>
                经过加固的引用，原文被删除后，可以凭借引用属性上的快照'复活'原文。 （快照可能只有部分， 比如原文是列表）
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$superRefBoxGlobalFixMenu} />
                {tomatoI18n.menu添加右键菜单 + "：" + SuperRefBox全局修复引用.langText()}
                <strong>{SuperRefBox全局修复引用.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$superRefBoxGlobalLnkMenu} />
                {tomatoI18n.menu添加右键菜单 + "：" + SuperRefBox全局加固引用.langText()}
                <strong>{SuperRefBox全局加固引用.w()}</strong>
            </div>
        {/if}
    </div>
