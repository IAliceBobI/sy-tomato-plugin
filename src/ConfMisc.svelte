<script lang="ts">
    // IndexConf 设置分区：图片遮挡 / 数据库反链 / 杂项 / 文本转引用 / 列表工具 / 人工智能 / 豆包知识库 / 快速笔记。
    // 从 IndexConf.svelte 拆出（2026-08 重构），共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
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
        dbBkBoxCheckbox,
        dbBkBoxHideDatetime,
        dbBkBoxMaxBacklinkSize,
        dbBkBoxRefreshMenu,
        dont_break_list,
        fastNoteBoxAdd2Flashcard,
        fastNoteBoxCheckbox,
        fastNoteBoxDelAfterCreating,
        fastNoteBoxDisableBK,
        fastNoteBoxDocPrefix,
        imgOverlayCheckbox,
        listBoxCheckbox,
        mixBoxCheckbox,
        mixBoxPinyin,
        showDocAttrs,
        storeCopyStdMD,
        storeFillMemoMenu,
        storeInsertXml,
        storeMergeDoc,
        storeMoveDocContentHere,
        storeNoteBox_fastnote,
        storeOpenRefsClick,
        storeOpenRefsMenu,
        storeRefreshStaticBkLnk,
        tag2RefBoxCheckbox,
        tag2RefSearchLnk,
        tag2RefSearchRef,
        tag_to_ref_add_card,
        tag_to_ref_add_pinyin,
    } from "./libs/stores";
    import { cleanDataview } from "./libs/utils";
    import { AIBoxHotkey } from "./AIBox";
    import { CozeSearchBoxHotkey } from "./CozeSearchBox";
    import { DbBkBox刷新数据库反链 } from "./DbBkBox";
    import { FastNoteBox创建快速笔记, FastNoteBox打开最后一个笔记, FastNoteBox草稿切换 } from "./FastNoteBox";
    import { ListBox取消勾选当前文档所有已完成的todo任务, ListBox删除当前文档所有已完成的todo任务 } from "./ListBox";
    import {
        MixBox使内容模糊,
        MixBox内容制表,
        MixBox列出当前文档与子文档中没被引用的文档,
        MixBox删除块以及闪卡,
        MixBox删除所有flag书签,
        MixBox复制文档为标准Markdown,
        MixBox复制文档为纯文本,
        MixBox定位所有引用Menu,
        MixBox将选择文字与其拼音加入文档的别名,
        MixBox将选择文字加入文档的别名,
        MixBox收集当前文档与子文档所有的未完成任务,
        MixBox添加一个flag书签,
        MixBox空格隔开的所有内容都转为引用,
        MixBox跳转到剪贴板中ID的块,
        MixBox锁定内容,
    } from "./MixBox";
    import { Tag2RefBox模糊查找引用Lnk, Tag2RefBox模糊查找引用Ref } from "./Tag2RefBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { helpOpen } from "./helpOpen";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);
</script>

    <!-- 图片遮挡 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$imgOverlayCheckbox} />
            {tomatoI18n.图片遮挡}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/SLSWdFITgo7q4ex4q6ScIuGin2g?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
    </div>
    <!-- 数据库反链 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$dbBkBoxCheckbox} />
            {tomatoI18n.数据库充当反链}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/W4WxdA0Bzo0O7UxwHFFcAHUUnSd?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $dbBkBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dbBkBoxRefreshMenu} />
                {tomatoI18n.menu添加右键菜单}:
                {DbBkBox刷新数据库反链.langText()}
                <strong>{DbBkBox刷新数据库反链.w()}</strong>
            </div>
            <div>
                <input type="number" min="1" class="b3-text-field" bind:value={$dbBkBoxMaxBacklinkSize} />
                {tomatoI18n.maxBkDocs最大展开的反链文件数}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dbBkBoxHideDatetime} />
                {tomatoI18n.隐藏修改时间和创建时间}
            </div>
        {/if}
        <div>
            <button class="b3-button b3-button--outline tomato-button" onclick={() => cleanDataview()}
                >🗑️
            </button>{tomatoI18n.删除失效的数据库}
        </div>
    </div>
    <!-- 杂项 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$mixBoxCheckbox} />
            {tomatoI18n.杂项许多小功能}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/Yw4UdhdaTo25dhxtiPUcPnNzn3c?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $mixBoxCheckbox}
            <!-- 显示文档属性 -->
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$showDocAttrs} />
                {tomatoI18n.显示文档属性}
            </div>
            <div>
                {MixBox删除块以及闪卡.langText()}
                <strong>{MixBox删除块以及闪卡.w()}</strong>
            </div>
            <div>
                {MixBox内容制表.langText()}
                <strong>{MixBox内容制表.w()}</strong>
            </div>
            <div>
                {MixBox使内容模糊.langText()}
                <strong>{MixBox使内容模糊.w()}</strong>
            </div>
            <div>
                {MixBox跳转到剪贴板中ID的块.langText()}
                <strong>{MixBox跳转到剪贴板中ID的块.w()}</strong>
            </div>
            <div>
                {MixBox添加一个flag书签.langText()}
                <strong>{MixBox添加一个flag书签.w()}</strong>
            </div>
            <div>
                {MixBox删除所有flag书签.langText()}
                <strong>{MixBox删除所有flag书签.w()}</strong>
            </div>
            <div>
                {MixBox空格隔开的所有内容都转为引用.langText()}
                <strong>{MixBox空格隔开的所有内容都转为引用.w()}</strong>
            </div>
            <div>
                {MixBox收集当前文档与子文档所有的未完成任务.langText()}
                <strong>{MixBox收集当前文档与子文档所有的未完成任务.w()}</strong>
            </div>
            <div>
                {MixBox列出当前文档与子文档中没被引用的文档.langText()}
                <strong>{MixBox列出当前文档与子文档中没被引用的文档.w()}</strong>
            </div>
            <div>
                {MixBox将选择文字加入文档的别名.langText()}<strong>{MixBox将选择文字加入文档的别名.w()}</strong>
            </div>
            <div>
                {MixBox复制文档为纯文本.langText()}<strong>{MixBox复制文档为纯文本.w()}</strong>
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeFillMemoMenu} />
                {tomatoI18n.menu添加右键菜单}: {MixBox锁定内容.langText()}<strong>{MixBox锁定内容.w()}</strong>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeInsertXml} />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.插入空的脑图流程图文件}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeRefreshStaticBkLnk} />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.刷新静态反链}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeMoveDocContentHere} />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.把文档内容移动到这里}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeMergeDoc} />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.合并文档到这里}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$mixBoxPinyin} />
                {tomatoI18n.menu添加右键菜单}: {MixBox将选择文字与其拼音加入文档的别名.langText()}<strong
                    >{MixBox将选择文字与其拼音加入文档的别名.w()}</strong
                >
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeOpenRefsMenu} />
                {tomatoI18n.menu添加右键菜单}: {MixBox定位所有引用Menu.langText()}<strong
                    >{MixBox定位所有引用Menu.w()}</strong
                >
            </div>

            <div class:codeNotValid>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$storeOpenRefsClick}
                    disabled={codeNotValid}
                    class:codeNotValid
                />
                {tomatoI18n.点击引用数打开所有引用}<TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$storeCopyStdMD} />
                {tomatoI18n.menu添加右键菜单}: {MixBox复制文档为标准Markdown.langText()}<strong
                    >{MixBox复制文档为标准Markdown.w()}</strong
                >
            </div>
        {/if}
    </div>
    <!-- 文本转引用 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$tag2RefBoxCheckbox} />
            {tomatoI18n.文本转引用}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/OikodVWC1oJK16xUfm9cmpfAnQd?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $tag2RefBoxCheckbox}
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$tag_to_ref_add_card}
                />{tomatoI18n.添加引用时自动制卡}
            </div>
            <div class:codeNotValid>
                <input
                    type="checkbox"
                    class="b3-switch"
                    disabled={codeNotValid}
                    class:codeNotValid
                    bind:checked={$tag_to_ref_add_pinyin}
                />{tomatoI18n.给文档添加简拼别名}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$tag2RefSearchRef} />
                {tomatoI18n.menu添加右键菜单}:{Tag2RefBox模糊查找引用Ref.langText()}<strong
                    >{Tag2RefBox模糊查找引用Ref.w()}</strong
                >
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$tag2RefSearchLnk} />
                {tomatoI18n.menu添加右键菜单}:{Tag2RefBox模糊查找引用Lnk.langText()}<strong
                    >{Tag2RefBox模糊查找引用Lnk.w()}</strong
                >
            </div>
        {/if}
    </div>
    <!-- 列表工具 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$listBoxCheckbox} />
            {tomatoI18n.列表工具}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/GbeDdl1Bro3laRxlfqrcl10OnTc?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $listBoxCheckbox}
            <div>
                {ListBox取消勾选当前文档所有已完成的todo任务.langText()}
                <strong>{ListBox取消勾选当前文档所有已完成的todo任务.w()}</strong>
            </div>
            <div>
                {ListBox删除当前文档所有已完成的todo任务.langText()}
                <strong>{ListBox删除当前文档所有已完成的todo任务.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dont_break_list} />
                {tomatoI18n.阻止连续回车断开列表}
            </div>
        {/if}
    </div>
    <!-- 人工智能 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$aiBoxCheckbox} />
            {AIBoxHotkey.langText()}<strong>{AIBoxHotkey.w()}</strong>
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/Kbuvd9lbhoDWTCxggz9cxQgJnAH?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
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
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cozeSearchBoxCheckbox} />
            coze{tomatoI18n.知识库问答}<strong>{CozeSearchBoxHotkey.w()}</strong>
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/ENZfd6zfKoTZPqxZxf2c4uWVnow?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
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
    <!-- 快速笔记 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$fastNoteBoxCheckbox} />
            {tomatoI18n.快速笔记}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/DNZ1dYORAoHpm7xdPaecyb6Pnrh?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $fastNoteBoxCheckbox}
            <div>{tomatoI18n.快捷键如有冲突请调整}</div>

            <div>
                {tomatoI18n.创建快速笔记}
                <strong>{FastNoteBox创建快速笔记.w()}</strong>
            </div>

            <div>
                {tomatoI18n.打开最后一个笔记}
                <strong>{FastNoteBox打开最后一个笔记.w()}</strong>
            </div>

            <div class:codeNotValid>
                {FastNoteBox草稿切换.langText()}
                <strong>{FastNoteBox草稿切换.w()}</strong><TomatoVIP {codeValid}></TomatoVIP>
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
