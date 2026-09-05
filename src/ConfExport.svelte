<script lang="ts">
    // 设置域组件（二期 14 域 2026-09-05）：导出工作空间——独立成域（v5.3.116 翻新态
    // 整卡自 ConfGeneral.svelte 迁出，大功能上浮上半区第 8 位；单功能翻新状态不被
    // 同域邻居拖累）。整卡迁入内部一行不动，共享样式见 IndexConf.css。
    import { onDestroy } from "svelte";
    import TomatoVIP from "./TomatoVIP.svelte";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import {
        EXPORT_CARD_MENU_ITEMS,
        menuItemSelected,
        nextHiddenKeys,
        type ManagedMenuItem,
    } from "./libs/menuItemRegistry";
    import { menuKeyHidden, menuHiddenKeys } from "./libs/menuManager";
    import {
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
        hiddenMenuItems,
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
    import { destroyPanelTip, hidePanelTip, showPanelTip } from "./libs/panelTip";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);

    // 白/黑名单右键菜单入口薄包装（随卡自 ConfGeneral 迁入）：三层合成判定与隐藏集
    // 变更走 menuItemRegistry 共享纯函数（勿在组件层复制）。toggle 只改内存，面板关闭
    // 由 IndexConf 统一落盘；ConfGeneral 管理卡「全部显示」的补全语义仍跨卡引用本组常量。
    let menuManageTick = $state(0);
    const itemShown = (item: ManagedMenuItem) => menuItemSelected(item, menuKeyHidden);
    function toggleMenuItem(item: ManagedMenuItem, ev: Event) {
        const target = ev.currentTarget as HTMLInputElement;
        const checked = target?.checked ?? !itemShown(item);
        hiddenMenuItems.set(nextHiddenKeys(menuHiddenKeys(), item.key, checked));
        if (checked) {
            item.store?.set(true);
            item.master?.set(true);
        }
        menuManageTick++;
    }

    // □3 迁 panelTip：设置弹窗 b3-dialog__body 同为 ov:auto 滚动容器，b3-tooltips__n 纯 CSS
    // 气泡贴顶/贴缘即裁；滚动即弃防线已上提 panelTip 模块级单例（勿在组件层再挂）。
    // 收尾：面板卸载走 openSettings dm 链的 unmount（□3 正轨化）——本 onDestroy 与 dm.add("tip")
    // 兜底双保险（destroyPanelTip 幂等）
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

            <!-- 白/黑名单右键菜单入口（2026-09-03 归位：自右键菜单管理卡迁入，语义严格属于导出
                 工作空间且运行时注册本就受本卡总开关门控，开关行随 {#if} 卡体隐藏两边一致）。
                 文档树右键命令的显隐开关，行式沿杂项卡「添加右键菜单:」前缀防读成名单过滤功能开关；
                 无独立 store 走 hiddenMenuItems 隐藏集，{#key} 同管理卡防 toggle 后 checkbox 不刷新 -->
            {#key menuManageTick}
                {#each EXPORT_CARD_MENU_ITEMS as item (item.key)}
                    <div>
                        <input
                            type="checkbox"
                            class="b3-switch"
                            checked={itemShown(item)}
                            onchange={(ev) => toggleMenuItem(item, ev)}
                        />
                        {tomatoI18n.menu添加右键菜单}: {item.label()}
                    </div>
                {/each}
            {/key}

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
