<script lang="ts">
    // 设置域组件（□2 设置页重划；二期 14 域 2026-09-05 重排；三期 2026-09-08 归位收官）：
    // 文档管理——文档树工具（三期收 exportFiles 4 菜单开关=开关跟功能走，自通用域右键菜单
    // 管理卡归位；前缀文档树卡同期迁功能仓库域）/ 文档整理（三期自通用域杂项卡归位）。
    // confgather（2026-09-15）：DailyNote 域首卡整卡裁出独立「日记」域 ConfDailyNote.svelte
    //（bear 拍板「裁出去一次干净」，命令开关域「日记」族自此对上家）。各卡整块迁入
    //（内部一行不动），共享样式见 IndexConf.css。
    import {
        storeMergeDoc,
        storeMoveDocContentHere,
        hiddenMenuItems,
        exportFilesMenu,
    } from "./libs/stores";
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

    <!-- DailyNote 卡已裁出独立「日记」域（ConfDailyNote.svelte，2026-09-15 confgather） -->
    <!-- 文档树工具（三期归位：exportFiles 4 菜单开关自通用域右键菜单管理卡迁入——开关跟
         功能走，治理本战役起点诉求；无独立 store 走 hiddenMenuItems 隐藏集，{#key} 同导出卡防
         toggle 后 checkbox 不刷新） -->
    <div class="settingBox">
        <div class="section-title">
            {tomatoI18n.文档树工具}
            <ConfHelpIcon token="NXSPd81W4oxUJrxW2XsctewUn5g" />
        </div>
        <!-- □5 总开关：三件套（合并/导出单文件/导入MD）整体显隐；关=菜单全不出现，
             下方逐项开关仍在（合成判定=总开关 AND 逐项，二者独立通道） -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$exportFilesMenu} />
            {tomatoI18n.文档树批处理菜单}
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
    <!-- 前缀文档树卡现居独立域 ConfPrefix（prefixui □3；三期曾迁功能仓库域，仓库已退役），本域不再渲染 -->

