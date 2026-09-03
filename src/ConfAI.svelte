<script lang="ts">
    // 设置域组件（□2 设置页重划）：AI 与批注——知识库问答（AIBox）/ 豆包知识库（Coze）/ 批注
    // （自 ConfClock.svelte 批注段整块迁入）。各卡内部一行不动，共享样式见 IndexConf.css。
    import NotebookSelect from "./NotebookSelect.svelte";
    import {
        aiBoxCheckbox,
        aiBoxMenuShow,
        cozeSearchAppID,
        cozeSearchBoxCheckbox,
        cozeSearchDoubaoID,
        cozeSearchKnowledgeID,
        cozeSearchMenuShow,
        cozeSearchOauthTokenID,
        cozeSearchSpaceID,
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
    } from "./libs/stores";
    import { AIBoxHotkey } from "./AIBox";
    import { CozeSearchBoxHotkey } from "./CozeSearchBox";
    import { CommentBox添加批注 } from "./CommentBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { applyAnnoVisual } from "./Annotations";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
</script>

    <!-- 人工智能 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$aiBoxCheckbox} />
            {AIBoxHotkey.langText()}<HotkeyCap hk={AIBoxHotkey} pluginName="sy-tomato-plugin"></HotkeyCap>
            <ConfHelpIcon token="Kbuvd9lbhoDWTCxggz9cxQgJnAH" />
        </div>
        {#if $aiBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$aiBoxMenuShow} />
                {tomatoI18n.menu添加右键菜单}
            </div>
        {/if}
    </div>
    <!-- 豆包知识库 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$cozeSearchBoxCheckbox} />
            coze{tomatoI18n.知识库问答}<HotkeyCap hk={CozeSearchBoxHotkey} pluginName="sy-tomato-plugin"></HotkeyCap>
            <ConfHelpIcon token="ENZfd6zfKoTZPqxZxf2c4uWVnow" />
        </div>
        {#if $cozeSearchBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>

            <div>
                <input class="b3-text-field" bind:value={$cozeSearchOauthTokenID} />
                <a href="https://www.coze.cn/open/oauth/pats">{tomatoI18n.添加令牌}</a>
            </div>
            <div>
                <input class="b3-text-field" bind:value={$cozeSearchSpaceID} />
                <a href="https://www.coze.cn/space">{tomatoI18n.添加空间ID}</a>
            </div>
            <div>
                <input class="b3-text-field" bind:value={$cozeSearchKnowledgeID} />
                <a href="https://www.coze.cn/space/{$cozeSearchSpaceID}/library">{tomatoI18n.添加知识库ID}</a>
            </div>
            <div>
                <input class="b3-text-field" bind:value={$cozeSearchAppID} />
                <a href="https://www.coze.cn/space/{$cozeSearchSpaceID}/develop">{tomatoI18n.添加智能体ID}</a>
            </div>
            <div>
                <input class="b3-text-field" bind:value={$cozeSearchDoubaoID} />
                {tomatoI18n.豆包智能体ID}
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cozeSearchMenuShow} />
                {tomatoI18n.menu添加右键菜单}
            </div>
        {/if}
    </div>
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
