<script lang="ts">
    // IndexConf 设置分区：底部反链 / toolbar 按钮 / 阅读点 / 复制为图片。
    // 从 IndexConf.svelte 拆出（2026-08 重构），共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import {
        backLinkBottomBoxCheckbox,
        back_link_concept_fold,
        back_link_copy,
        back_link_dailynote_off,
        back_link_default_off,
        back_link_embed,
        back_link_goto_bottom_btn,
        back_link_max_size,
        back_link_mention_count,
        back_link_move_here,
        back_link_move_to_dailynote,
        back_link_move_with_backlink,
        back_link_ref,
        back_link_refresh_off,
        back_link_remove_refs,
        back_link_show_floatUI,
        back_link_show_path,
        bk_refresh_interval_sec,
        bk_visible_only,
        bk启用禁用文档的底部反链menu,
        imgBoxCheckbox,
        imgBoxShowMenu,
        readingAdd2Card,
        readingAdd2DocName,
        readingAddDeleteMenu,
        readingAddJumpMenu,
        readingAddRPmenu,
        readingDialog,
        readingPointBoxCheckbox,
        readingPointWithEnv,
        readingSaveFile,
        readingTopBar,
        toolbarBoxCheckbox,
        toolbarEN2CHBtn,
        toolbarTidy,
        toolbarTidyExt,
        toolbarlocatedoc,
        toolbarrefreshVr,
        toolbarspacerepeat,
    } from "./libs/stores";
    import { icon } from "./libs/utils";
    import { BK启用禁用文档的底部反链 } from "./BackLinkBottomBox";
    import { ImgBoxHotKey } from "./ImgBox";
    import {
        ReadingPointBox删除当前文档的阅读点,
        ReadingPointBox查看阅读点,
        ReadingPointBox设置阅读点,
        ReadingPointBox跳到当前文档的阅读点,
    } from "./ReadingPointBox";
    import {
        ToolBarBox刷新虚拟引用,
        ToolBarBox整理assets下的图片视频音频,
        ToolBarBox突出定位文档,
        ToolBarBox间隔重复,
    } from "./ToolbarBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { helpOpen } from "./helpOpen";

    const ICONS_SIZE = 14;

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);
</script>

    <!-- 底部反链 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$backLinkBottomBoxCheckbox} />
            {tomatoI18n.底部反链}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/SVELdPHKYoGMj1xkmF3cIPg3nZd?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $backLinkBottomBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$bk启用禁用文档的底部反链menu} />
                {tomatoI18n.menu添加右键菜单}:
                {BK启用禁用文档的底部反链.langText()}<strong>{BK启用禁用文档的底部反链.w()}</strong>
            </div>
            <div>
                <input type="number" min="0" class="b3-text-field" bind:value={$back_link_max_size} />
                {tomatoI18n.maxBkDocs最大展开的反链文件数}
            </div>

            <div>
                <input type="number" min="0" class="b3-text-field" bind:value={$back_link_mention_count} />
                {tomatoI18n.mentionDocs最大展开的提及文件数}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_show_path} />
                {tomatoI18n.显示路径}
            </div>

            <div class="softBox">
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$back_link_move_here} />
                    <span class="b3-label__text"> {@html icon("Move", ICONS_SIZE)}</span>
                    {tomatoI18n.移动到文档}
                </div>
                {#if $back_link_move_here}
                    <div>
                        <input type="checkbox" class="b3-switch" bind:checked={$back_link_move_with_backlink} />
                        <span class="b3-label__text"> {@html icon("Move", ICONS_SIZE)}</span>
                        {tomatoI18n.移动内容后添加指向原来位置的链接}
                    </div>
                {/if}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_move_to_dailynote} />
                <span class="b3-label__text"> {@html icon("Calendar", ICONS_SIZE)}</span>
                {tomatoI18n.移动到Dailynote}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_remove_refs} />
                <span class="b3-label__text"> {@html icon("Unpin", ICONS_SIZE)}</span>
                {tomatoI18n.把指向当前文档的引用删除}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_copy} />
                <span class="b3-label__text"> {@html icon("Copy", ICONS_SIZE)}</span>
                {tomatoI18n.复制到文档}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_embed} />
                <span class="b3-label__text"> {@html icon("SQL", ICONS_SIZE)}</span>
                {tomatoI18n.嵌入到文档}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_ref} />
                <span class="b3-label__text"> {@html icon("Ref", ICONS_SIZE)}</span>
                {tomatoI18n.引用到文档}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_show_floatUI} />
                {tomatoI18n.在悬浮窗内显示底部反链}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_default_off} />
                {tomatoI18n.defaultBkDisabled底部反链默认关闭}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_dailynote_off} />
                {tomatoI18n.DisableDailyNote禁用底部反链}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_refresh_off} />
                {tomatoI18n.默认关闭自动刷新}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$bk_visible_only}
                    onchange={() => bk_visible_only.write($bk_visible_only)}
                />
                {tomatoI18n.仅可见页签刷新底部反链}
            </div>

            <div>
                <input
                    type="number"
                    min="2"
                    class="b3-text-field space"
                    bind:value={$bk_refresh_interval_sec}
                    onchange={() => bk_refresh_interval_sec.write(Math.max(2, Number($bk_refresh_interval_sec) || 15))}
                />
                {tomatoI18n.底部反链刷新间隔秒数($bk_refresh_interval_sec)}
            </div>

            <div class:codeNotValid>
                <input
                    type="checkbox"
                    disabled={codeNotValid}
                    class:codeNotValid
                    class="b3-switch"
                    bind:checked={$back_link_goto_bottom_btn}
                />
                {tomatoI18n.在标题下添加跳转到底部的按钮}<TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_concept_fold} />
                {tomatoI18n.默认折叠概念栏}
            </div>
        {/if}
    </div>
    <!-- toolbar按钮 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$toolbarBoxCheckbox} />
            {tomatoI18n.开启toolbar按钮}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/NDgJd64mmo7c0Wxj42RcNv2Tnaf?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $toolbarBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$toolbarspacerepeat} />
                {tomatoI18n.topbar添加图标}：
                {ToolBarBox间隔重复.langText()}<strong>{ToolBarBox间隔重复.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$toolbarrefreshVr} />
                {tomatoI18n.topbar添加图标}：
                {ToolBarBox刷新虚拟引用.langText()}<strong>{ToolBarBox刷新虚拟引用.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$toolbarlocatedoc} />
                {tomatoI18n.topbar添加图标}：
                {ToolBarBox突出定位文档.langText()}<strong>{ToolBarBox突出定位文档.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$toolbarTidy} />
                {tomatoI18n.topbar添加图标}：
                {ToolBarBox整理assets下的图片视频音频.langText()}<strong
                    >{ToolBarBox整理assets下的图片视频音频.w()}</strong
                >
            </div>
            <div>
                <textarea
                    class="b3-text-field"
                    placeholder="doc docx xls xlsx emmx sql"
                    bind:value={$toolbarTidyExt}
                    spellcheck="false"
                ></textarea>
                {tomatoI18n.补充文件后缀}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$toolbarEN2CHBtn}
                />
                {tomatoI18n.显示语言切换按钮}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>
        {/if}
    </div>
    <!-- 阅读点 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$readingPointBoxCheckbox} />
            {tomatoI18n.阅读点}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/KQOWdXzT8o05LlxPfJCcBHNEnYc?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $readingPointBoxCheckbox}
            <div>
                {ReadingPointBox查看阅读点.langText()}<strong>{ReadingPointBox查看阅读点.w()}</strong>
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$readingAddRPmenu} />
                {tomatoI18n.menu添加右键菜单}:{ReadingPointBox设置阅读点.langText()}<strong
                    >{ReadingPointBox设置阅读点.w()}</strong
                >
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$readingAddJumpMenu} />
                {tomatoI18n.menu添加右键菜单}:{ReadingPointBox跳到当前文档的阅读点.langText()}<strong
                    >{ReadingPointBox跳到当前文档的阅读点.w()}</strong
                >
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$readingAddDeleteMenu} />
                {tomatoI18n.menu添加右键菜单}:{ReadingPointBox删除当前文档的阅读点.langText()}<strong
                    >{ReadingPointBox删除当前文档的阅读点.w()}</strong
                >
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$readingDialog} />
                {tomatoI18n.用对话框的形式打开阅读点}
            </div>
            <div hidden={$readingDialog}>
                <input class="b3-text-field" bind:value={$readingSaveFile} placeholder="doc name" />
                {tomatoI18n.阅读点统一保存}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$readingPointWithEnv}
                />
                {tomatoI18n.插入阅读点时记录当前所有打开的页签}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$readingTopBar} />
                {tomatoI18n.topbar添加图标}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$readingAdd2Card} />
                {tomatoI18n.阅读点加入闪卡}
            </div>

            <div>
                <input class="b3-text-field" bind:value={$readingAdd2DocName} />
                {tomatoI18n.阅读点保存到指定文档}
            </div>
        {/if}
    </div>
    <!-- 复制为图片 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$imgBoxCheckbox} />
            {tomatoI18n.复制为图片}<strong>{ImgBoxHotKey.w()}</strong>
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/QGx5d437SoArUyxZ6c3cqhmfnnb?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $imgBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$imgBoxShowMenu} />
                {tomatoI18n.menu添加右键菜单}
            </div>
        {/if}
    </div>
