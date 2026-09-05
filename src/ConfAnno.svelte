<script lang="ts">
    // 设置域组件（二期 14 域 2026-09-05）：批注——批注卡（翻新大功能上浮，自旧「AI 与
    // 批注」域拆出独立成域）。自 ConfAI.svelte 拆出（整卡迁入内部一行不动），
    // 共享样式见 IndexConf.css。
    import NotebookSelect from "./NotebookSelect.svelte";
    import {
        commentBoxAnnoBg,
        commentBoxAnnoDraftNotebook,
        commentBoxAnnoLineType,
        commentBoxAnnoMarkStyle,
        commentBoxAnnoUnderlineThickness,
        commentBoxCheckbox,
        commentBoxMenu,
        commentBoxAnnoToolbar,
        commentBoxPanelSkin,
        commentBoxShowID,
        hiddenMenuItems,
    } from "./libs/stores";
    import { CommentBox添加批注 } from "./CommentBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { applyAnnoVisual } from "./Annotations";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
    import {
        ANNO_CARD_MENU_ITEMS,
        menuItemSelected,
        nextHiddenKeys,
        type ManagedMenuItem,
    } from "./libs/menuItemRegistry";
    import { menuKeyHidden, menuHiddenKeys } from "./libs/menuManager";

    // 右键菜单项逐项显隐（□3 2026-09-04）：与 ConfGeneral 管理卡同款薄包装——三层合成
    // 判定与隐藏集变更在 menuItemRegistry 共享纯函数，勿在组件层复制；勾任一项自动开
    // 总开关（master）。toggle 只改内存，面板关闭由 IndexConf 统一落盘。
    let menuManageTick = $state(0);
    const itemShown = (item: ManagedMenuItem) => menuItemSelected(item, menuKeyHidden);
    function toggleMenuItem(item: ManagedMenuItem, ev: Event) {
        const target = ev.currentTarget as HTMLInputElement;
        const checked = target?.checked ?? !itemShown(item);
        hiddenMenuItems.set(nextHiddenKeys(menuHiddenKeys(), item.key, checked));
        if (checked) item.master?.set(true);
        menuManageTick++;
    }
</script>

    <!-- 批注 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$commentBoxCheckbox} />
            {tomatoI18n.批注}
            <ConfHelpIcon token="Svq2dIQpaob0kKx0l38ciftRnXl" />
        </div>
        {#if $commentBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$commentBoxMenu} />
                {tomatoI18n.menu添加右键菜单}
                <HotkeyCap hk={CommentBox添加批注} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <!-- 右键菜单项逐项显隐（□3）：数据源 ANNO_CARD_MENU_ITEMS，样式沿用管理卡同款
                 （IndexConf.css 共享）；收集四项已是命令（无默认键，思源键位设置可自绑），
                 file 项的「有目标记忆才显示」是数据前提，开关只管用户意图 -->
            <div class="tomato-group-title">{tomatoI18n.右键菜单项}</div>
            {#key menuManageTick}
                {#each ANNO_CARD_MENU_ITEMS as item (item.key)}
                    <label class="fn__flex fn__flex-center tomato-menu-manage-item">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            checked={itemShown(item)}
                            onchange={(ev) => toggleMenuItem(item, ev)}
                        />
                        <span class="fn__space"></span>
                        <span class="tomato-menu-manage-label">{item.label()}</span>
                    </label>
                {/each}
            {/key}
            <div class="helpText">{tomatoI18n.收集到文件项说明}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$commentBoxAnnoToolbar} />
                {tomatoI18n.划词工具条批注入口}
                <HotkeyCap hk={CommentBox添加批注} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {tomatoI18n.批注草稿存放笔记本}
                <NotebookSelect
                    bare
                    store={commentBoxAnnoDraftNotebook}
                    emptyLabel={() => tomatoI18n.草稿笔记本自动}
                    emptyTitle={() => tomatoI18n.草稿笔记本自动说明}
                ></NotebookSelect>
            </div>
            <div>{tomatoI18n.草稿笔记本自动说明}</div>
            <div>
                {tomatoI18n.批注标记形态}
                <select
                    class="b3-select"
                    value={$commentBoxAnnoMarkStyle}
                    onchange={(e) => {
                        commentBoxAnnoMarkStyle.write(e.currentTarget.value);
                        applyAnnoVisual();
                    }}
                >
                    <option value="underline">{tomatoI18n.形态下划线式}</option>
                    <option value="marker">{tomatoI18n.形态马克笔式}</option>
                    <option value="frame">{tomatoI18n.形态花边框}</option>
                </select>
            </div>
            {#if $commentBoxAnnoMarkStyle === "underline"}
                <div>
                    {tomatoI18n.批注线型}
                    <select
                        class="b3-select"
                        value={$commentBoxAnnoLineType}
                        onchange={(e) => {
                            const v = e.currentTarget.value;
                            // 圆圈串细档环宽不足半像素退化成实心点（spec §11.1.1）：自动升标准档
                            if (v === "ring-bead" && commentBoxAnnoUnderlineThickness.get() === 1) {
                                commentBoxAnnoUnderlineThickness.write(2);
                            }
                            commentBoxAnnoLineType.write(v);
                            applyAnnoVisual();
                        }}
                    >
                        <option value="solid">{tomatoI18n.线型实线}</option>
                        <option value="dashed">{tomatoI18n.线型虚线}</option>
                        <option value="dotted">{tomatoI18n.线型点线}</option>
                        <option value="wavy">{tomatoI18n.线型波浪线}</option>
                        <option value="double">{tomatoI18n.线型双线}</option>
                        <option value="dot-bead">{tomatoI18n.线型圆点串}</option>
                        <option
                            value="ring-bead"
                            disabled={$commentBoxAnnoUnderlineThickness === 1}
                        >{tomatoI18n.线型圆圈串}</option>
                    </select>
                </div>
                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        checked={$commentBoxAnnoBg}
                        onchange={(e) => {
                            commentBoxAnnoBg.write(e.currentTarget.checked);
                            applyAnnoVisual();
                        }}
                    />
                    {tomatoI18n.批注背景微底色}
                </div>
            {/if}
            {#if $commentBoxAnnoMarkStyle !== "frame"}
                <div>
                    {$commentBoxAnnoMarkStyle === "marker" ? tomatoI18n.批注底色厚度 : tomatoI18n.批注下划线粗细}
                    <select
                        class="b3-select"
                        value={String($commentBoxAnnoUnderlineThickness)}
                        onchange={(e) => {
                            const v = Number(e.currentTarget.value);
                            commentBoxAnnoUnderlineThickness.write(v);
                            applyAnnoVisual();
                        }}
                    >
                        <option
                            value="1"
                            disabled={$commentBoxAnnoMarkStyle === "underline" && $commentBoxAnnoLineType === "ring-bead"}
                        >{tomatoI18n.细}</option>
                        <option value="2">{tomatoI18n.标准}</option>
                        <option value="3">{tomatoI18n.粗}</option>
                    </select>
                </div>
            {/if}
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$commentBoxShowID} />
                {tomatoI18n.显示ID}
            </div>
            <div>
                {tomatoI18n.面板皮肤}
                <select
                    class="b3-select"
                    value={$commentBoxPanelSkin}
                    onchange={(e) => {
                        commentBoxPanelSkin.write(e.currentTarget.value);
                    }}
                >
                    <option value="classic">{tomatoI18n.皮肤经典}</option>
                    <option value="candy">{tomatoI18n.皮肤糖霜}</option>
                    <option value="paper">{tomatoI18n.皮肤纸墨}</option>
                    <option value="airy">{tomatoI18n.皮肤疏朗}</option>
                </select>
            </div>
        {/if}
    </div>

<style>
    /* 终审 P2-c：AI 批注卡各下拉宽度随最宽 option 浮动（笔记本宽/线型窄），统一 min-width 对齐 */
    select.b3-select {
        min-width: 88px;
    }
</style>
