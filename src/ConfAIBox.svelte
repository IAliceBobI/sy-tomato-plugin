<script lang="ts">
    // 设置域组件（二期 14 域 2026-09-05）：AI 问答——人工智能（AIBox）+ coze 知识库问答
    // 两卡（待翻新域，往后做）。自 ConfAI.svelte 拆出（整卡迁入内部一行不动），
    // 共享样式见 IndexConf.css。
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
    } from "./libs/stores";
    import { AIBoxHotkey } from "./AIBox";
    import { CozeSearchBoxHotkey } from "./CozeSearchBox";
    import { tomatoI18n } from "./tomatoI18n";
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
