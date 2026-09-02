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
        exportCleanPath,
        superRefBoxCheckBox,
        superRefBoxGlobalFixMenu,
        superRefBoxGlobalLnkMenu,
    } from "./libs/stores";
    import { getHpath, icon } from "./libs/utils";
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
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
    import { onDestroy } from "svelte";
    import { destroyPanelTip, hidePanelTip, showPanelTip } from "./libs/panelTip";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);

    // □3 迁 panelTip：设置弹窗 b3-dialog__body 同为 ov:auto 滚动容器，b3-tooltips__n 纯 CSS
    // 气泡贴顶/贴缘即裁；滚动即弃防线已上提 panelTip 模块级单例（勿在组件层再挂）。
    // 注意收尾现状：Svelte 5 mount() 返回 exports，d.destroy() 是 IndexConf export 的空函数，
    // 本组件 onDestroy 实际不触发——tip 摘除由 openSettings 的 dm.add("tip") 兜底；此处
    // onDestroy 留作 unmount 链修复后的自动生效位（同款死代码先例=CommentBox export destroy）
    onDestroy(destroyPanelTip);
</script>

    <!-- 导出工作空间（2026-08 翻新 spec：docs/tomato-export-settings-revamp.md）。
         组序 = 范围 → 目录 → 输出选项 → 自动调度 → 手动操作；store/VIP 门控/添加通道零变化 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$markdownExportBoxCheckbox} />
            {tomatoI18n.导出工作空间}
            <ConfHelpIcon token="UmNxds5JLo4m1qxc7j3cOvh4ncc" />
        </div>
        {#if $markdownExportBoxCheckbox}
            <!-- ① 导出范围 -->
            <div class="tomato-group-title">{tomatoI18n.导出范围}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$exportWL4All} />
                {tomatoI18n.导出所有文件}
                <div class="helpText">{tomatoI18n.关闭后按白名单过滤黑名单始终生效}</div>
            </div>
            {#if !$exportWL4All}
                <!-- 开关关闭才参与白名单过滤（MarkdownExportBox._exportMd2Dir 语义），开启时整块隐藏 -->
                {#if $exportWhiteList.length === 0}
                    <div class="tomato-empty">
                        <span class="tomato-empty-icon">{@html icon("FilesRoot", 20)}</span>
                        <div class="tomato-empty-body">
                            <div class="tomato-empty-title">{tomatoI18n.白名单为空请先在文档树中右键添加文档}</div>
                            <div class="tomato-empty-hint"
                                >{tomatoI18n.在文档树中右键选择x(tomatoI18n.添加到导出工作空间的白名单)}</div
                            >
                            <div class="tomato-empty-hint">{tomatoI18n.白名单为空时将导出全部文档}</div>
                        </div>
                    </div>
                {:else}
                    <div class="tomato-list">
                        <div class="tomato-list-caption">{tomatoI18n.白名单}</div>
                        {#each $exportWhiteList as item, index (item)}
                            <div class="tomato-list-item">
                                <button
                                    type="button"
                                    class="b3-button b3-button--text tomato-item-del"
                                    aria-label={tomatoI18n.从名单中移除}
                                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                                    onmouseleave={hidePanelTip}
                                    onclick={() => {
                                        $exportWhiteList.splice(index, 1);
                                        $exportWhiteList = $exportWhiteList;
                                        hidePanelTip(); // 摘行无 mouseleave，锚没了 tip 会悬空
                                    }}
                                >
                                    {@html icon("Trashcan", 14)}
                                </button>
                                <span class="tomato-item-badge tomato-item-badge--wl">{@html icon("Check", 12)}</span>
                                {#await getHpath(item)}
                                    <span class="tomato-item-path tomato-item-path--pending">{item}</span>
                                {:then v}
                                    <span class="tomato-item-path">{v}</span>
                                {/await}
                            </div>
                        {/each}
                    </div>
                {/if}
            {/if}
            <!-- 黑名单任何模式都生效（无白名单那样的 if 包裹） -->
            {#if $exportBlackList.length === 0}
                <div class="tomato-empty">
                    <span class="tomato-empty-icon">{@html icon("Eyeoff", 20)}</span>
                    <div class="tomato-empty-body">
                        <div class="tomato-empty-title">{tomatoI18n.黑名单为空可在文档树中右键添加}</div>
                        <div class="tomato-empty-hint"
                            >{tomatoI18n.在文档树中右键选择x(tomatoI18n.添加到导出工作空间的黑名单)}</div
                        >
                    </div>
                </div>
            {:else}
                <div class="tomato-list">
                    <div class="tomato-list-caption">{tomatoI18n.黑名单}</div>
                    {#each $exportBlackList as item, index (item)}
                        <div class="tomato-list-item">
                            <button
                                type="button"
                                class="b3-button b3-button--text tomato-item-del"
                                aria-label={tomatoI18n.从名单中移除}
                                onmouseenter={(e) => showPanelTip(e.currentTarget)}
                                onmouseleave={hidePanelTip}
                                onclick={() => {
                                    $exportBlackList.splice(index, 1);
                                    $exportBlackList = $exportBlackList;
                                    hidePanelTip(); // 摘行无 mouseleave，锚没了 tip 会悬空
                                }}
                            >
                                {@html icon("Trashcan", 14)}
                            </button>
                            <span class="tomato-item-badge tomato-item-badge--bl">{@html icon("Close", 12)}</span>
                            {#await getHpath(item)}
                                <span class="tomato-item-path tomato-item-path--pending">{item}</span>
                            {:then v}
                                <span class="tomato-item-path">{v}</span>
                            {/await}
                        </div>
                    {/each}
                </div>
            {/if}

            <!-- ② 导出目录（placeholder 修正：Windows 显示 Windows 风格示例、其他平台显示 POSIX 风格示例；
                 旧代码两分支互换且 Windows 误挂 $exportPath，见 spec §3.2 行为修正） -->
            <div class="tomato-group-title">{tomatoI18n.导出目录}</div>
            <div class="tomato-input-row">
                {#if events.isWindows}
                    <input
                        class="b3-text-field"
                        placeholder="D:\\backup"
                        aria-label={tomatoI18n.导出工作空间到此文件夹}
                        bind:value={$exportPathWin}
                    />
                {:else}
                    <input
                        class="b3-text-field"
                        placeholder="/path/to/backup"
                        aria-label={tomatoI18n.导出工作空间到此文件夹}
                        bind:value={$exportPath}
                    />
                {/if}
                <span class="tomato-row-label">{tomatoI18n.导出工作空间到此文件夹}</span>
                <div class="helpText">{tomatoI18n.导出目录留空时不执行导出}</div>
            </div>

            <!-- ③ 输出选项 -->
            <div class="tomato-group-title">{tomatoI18n.输出选项}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$markdownExportPics} />
                {tomatoI18n.导出图片}
                <div class="helpText">{tomatoI18n.导出图片帮助}</div>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$exportCleanPath} />
                {tomatoI18n.导出路径去掉块ID后缀}
                {#if $exportCleanPath}
                    <div class="helpText">{tomatoI18n.切换本开关后执行一次确保导出符合配置即可自动迁移}</div>
                    <div class="helpText">{tomatoI18n.导出目录由插件管理手动放入的文件会被清理删除}</div>
                {/if}
            </div>

            <!-- ④ 自动调度（两定时器同构；关闭态收敛成一行灰字，数字输入框仅开启态出现） -->
            <div class="tomato-group-title">{tomatoI18n.自动调度}</div>
            <div class="tomato-input-row" class:codeNotValid>
                <input type="checkbox" class="b3-switch" bind:checked={$exportIntervalSecOn} />
                <span class="tomato-row-label">{tomatoI18n.自动增量导出}</span>
                <TomatoVIP {codeValid}></TomatoVIP>
                {#if $exportIntervalSecOn}
                    <input
                        class="b3-text-field tomato-timer-input"
                        aria-label={tomatoI18n.可以填写小数}
                        onmouseenter={(e) => showPanelTip(e.currentTarget)}
                        onmouseleave={hidePanelTip}
                        bind:value={$exportIntervalSec}
                    />
                    <span class="tomato-row-label">{tomatoI18n.增量导出间隔秒}</span>
                    <div class="helpText">{tomatoI18n.增量导出最小3秒}</div>
                {:else}
                    <span class="tomato-timer-off">{tomatoI18n.开启后按设定间隔自动执行增量导出}</span>
                {/if}
            </div>
            <div class="tomato-input-row" class:codeNotValid>
                <input type="checkbox" class="b3-switch" bind:checked={$exportCleanFilesOn} />
                <span class="tomato-row-label">{tomatoI18n.定时确保导出}</span>
                <TomatoVIP {codeValid}></TomatoVIP>
                {#if $exportCleanFilesOn}
                    <input
                        class="b3-text-field tomato-timer-input"
                        aria-label={tomatoI18n.可以填写小数}
                        onmouseenter={(e) => showPanelTip(e.currentTarget)}
                        onmouseleave={hidePanelTip}
                        bind:value={$exportCleanFiles}
                    />
                    <span class="tomato-row-label">{tomatoI18n.确保导出间隔分钟}</span>
                    <div class="helpText">{tomatoI18n.确保导出最小3分钟}</div>
                {:else}
                    <span class="tomato-timer-off">{tomatoI18n.开启后按设定间隔确保导出符合配置}</span>
                {/if}
            </div>

            <!-- ⑤ 手动操作（回调/快捷键零变化；按钮+键帽两段式——键帽是 HotkeyCap 可点击改键，
                 绝不能嵌进 button 内：点击冒泡会误触发导出，2026-08-30 修假可供性） -->
            <div class="tomato-group-title">{tomatoI18n.手动操作}</div>
            <div class="tomato-action-row">
                <span class="tomato-action-pair">
                    <button type="button" class="b3-button b3-button--outline" onclick={() => exportMd2Dir(true)}>
                        {MarkdownExport全量导出.langText()}
                    </button>
                    <HotkeyCap hk={MarkdownExport全量导出} pluginName="sy-tomato-plugin"></HotkeyCap>
                </span>
                <span class="tomato-action-pair">
                    <button type="button" class="b3-button b3-button--outline" onclick={() => exportMd2Dir()}>
                        {MarkdownExport增量导出.langText()}
                    </button>
                    <HotkeyCap hk={MarkdownExport增量导出} pluginName="sy-tomato-plugin"></HotkeyCap>
                </span>
                <span class="tomato-action-pair">
                    <button type="button" class="b3-button b3-button--outline" onclick={() => cleanExportedMds()}>
                        {MarkdownExport确保导出符合配置.langText()}
                    </button>
                    <HotkeyCap hk={MarkdownExport确保导出符合配置} pluginName="sy-tomato-plugin"></HotkeyCap>
                </span>
                <div class="helpText">{tomatoI18n.手动操作帮助}</div>
            </div>
        {/if}
    </div>
    <!-- 块编辑器 -->
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
        {/if}
    </div>
    <!-- 修复引用 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$superRefBoxCheckBox} />
            引用修复工具
            <ConfHelpIcon token="WTgxdUINHoYXHbxmU87cxs5knfd" />
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
                <HotkeyCap hk={SuperRefBox全局修复引用} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$superRefBoxGlobalLnkMenu} />
                {tomatoI18n.menu添加右键菜单 + "：" + SuperRefBox全局加固引用.langText()}
                <HotkeyCap hk={SuperRefBox全局加固引用} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
        {/if}
    </div>
