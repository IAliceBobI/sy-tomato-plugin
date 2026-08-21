<script lang="ts">
    // IndexConf 设置分区：同步块 / 双向互链 / DailyNote 工具。
    // 从 IndexConf.svelte 拆出（2026-08 重构），共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import NotebookSelect from "./NotebookSelect.svelte";
    import {
        dailyNoteBoxCheckbox,
        dailyNoteCopyAnchorText,
        dailyNoteCopyComment,
        dailyNoteCopyFlashCard,
        dailyNoteCopyInsertPR,
        dailyNoteCopyMenu,
        dailyNoteCopyShowPath,
        dailyNoteCopySimple,
        dailyNoteCopyUpdateBG,
        dailyNoteCopyUseRef,
        dailyNoteGoToBottom,
        dailyNoteGoToBottomMenu,
        dailyNoteMoveLeaveLnk,
        dailyNoteMoveToBottom,
        dailyNotetopbarleft,
        dailyNotetopbarright,
        linkBoxAttrIconOnHide,
        linkBoxBilinkMenu,
        linkBoxCheckbox,
        linkBoxLnkTitle,
        linkBoxSyncBlock,
        linkBoxSyncHref,
        linkBoxSyncRef,
        linkBoxSyncScanDeep,
        linkBoxSyncRemapChildID,
        linkBoxUseLnkOrRef,
    } from "./libs/stores";
    import {
        LinkBoxbilink,
        LinkBox互相插入引用于下方创建,
        LinkBox互相插入引用于下方选择,
        LinkBox修复双向链接,
        LinkBox关联两个块创建,
        LinkBox关联两个块选择,
        LinkBox删除双向链接,
        LinkBox双向互链创建往返链,
        LinkBox双向互链选择块,
        LinkBox同步块创建,
        LinkBox同步块选择,
        LinkBox嵌入互链创建,
        LinkBox嵌入互链选择,
        LinkBox查看所有同步位置,
        LinkBox链接到块底部,
    } from "./LinkBox";
    import {
        DailyNoteBox上一个日志,
        DailyNoteBox下一个日志,
        DailyNoteBox复制到dailynote,
        DailyNoteBox复制到dailynoteNewFile,
        DailyNoteBox移动内容到dailynote,
    } from "./DailyNoteBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { helpOpen } from "./helpOpen";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);
</script>

    <!-- 同步块 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$linkBoxSyncBlock}
                onchange={() => {
                    if ($linkBoxSyncBlock) $linkBoxCheckbox = true;
                }}
            />
            {tomatoI18n.同步块}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/NaSudYNaBoeGqZxnyHFc9QQVneb?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $linkBoxSyncBlock}
            <div>
                {LinkBox查看所有同步位置.langText()}
                <strong> {LinkBox查看所有同步位置.w()}</strong>
            </div>
            <div>
                {LinkBox同步块选择.langText()}
                <strong> {LinkBox同步块选择.w()}</strong>
            </div>
            <div>
                {LinkBox同步块创建.langText()}
                <strong> {LinkBox同步块创建.w()}</strong>
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$linkBoxAttrIconOnHide}
                />
                {tomatoI18n.隐藏同步块右上角菜单}<TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$linkBoxSyncScanDeep}
                />
                {tomatoI18n.巡检重算哈希}
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$linkBoxSyncRemapChildID}
                />
                {tomatoI18n.子块ID重映射实验}
            </div>
            <div>{tomatoI18n.开启后每个副本的子块使用独立块ID}</div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$linkBoxSyncHref}
                />
                {tomatoI18n.添加到原始块的链接}<TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$linkBoxSyncRef}
                />
                {tomatoI18n.添加到原始块的引用}<TomatoVIP {codeValid}></TomatoVIP>
            </div>
        {/if}
    </div>
    <!-- 双向互链 -->
    <div class="settingBox">
        <div>
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$linkBoxCheckbox}
                onchange={() => {
                    if (!$linkBoxCheckbox) $linkBoxSyncBlock = false;
                }}
            />
            {tomatoI18n.双向互链}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/DmGUdmtacol9ANxy0Encl1ownfP?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $linkBoxCheckbox}
            <div class="softBox">
                <div>
                    {LinkBox链接到块底部.langText()}<strong>{LinkBox链接到块底部.w()}</strong>
                </div>
            </div>
            <div class="softBox">
                <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$linkBoxBilinkMenu} />
                    {tomatoI18n.menu添加右键菜单}: {LinkBoxbilink.langText()}
                    <strong>{LinkBoxbilink.w()}</strong>
                </div>
            </div>
            <div class="softBox">
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$linkBoxLnkTitle} />
                    {tomatoI18n.给链接加文字}
                </div>
                <div>
                    {LinkBox双向互链选择块.langText()}<strong>{LinkBox双向互链选择块.w()}</strong>
                </div>
                <div>
                    {LinkBox双向互链创建往返链.langText()}<strong>{LinkBox双向互链创建往返链.w()}</strong>
                </div>
                <div>
                    {LinkBox修复双向链接.langText()}<strong>{LinkBox修复双向链接.w()}</strong>
                </div>
                <div>
                    {LinkBox删除双向链接.langText()}<strong>{LinkBox删除双向链接.w()}</strong>
                </div>
            </div>
            <div class="softBox">
                <div class:codeNotValid>
                    {LinkBox嵌入互链选择.langText()}<strong>{LinkBox嵌入互链选择.w()}</strong><TomatoVIP {codeValid}
                    ></TomatoVIP>
                </div>
                <div class:codeNotValid>
                    {LinkBox嵌入互链创建.langText()}<strong>{LinkBox嵌入互链创建.w()}</strong><TomatoVIP {codeValid}
                    ></TomatoVIP>
                </div>
            </div>
            <div class="softBox">
                <div>
                    {LinkBox互相插入引用于下方选择.langText()}<strong>{LinkBox互相插入引用于下方选择.w()}</strong>
                </div>
                <div>
                    {LinkBox互相插入引用于下方创建.langText()}<strong>{LinkBox互相插入引用于下方创建.w()}</strong>
                </div>
            </div>
            <div class="softBox">
                <div>
                    {LinkBox关联两个块选择.langText()}<strong>{LinkBox关联两个块选择.w()}</strong>
                </div>
                <div>
                    {LinkBox关联两个块创建.langText()}<strong>{LinkBox关联两个块创建.w()}</strong>
                </div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$linkBoxUseLnkOrRef} />
                    {tomatoI18n.使用链接否则用引用}
                </div>
            </div>
        {/if}
    </div>
    <!-- DailyNote -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteBoxCheckbox} />
            {tomatoI18n.dailynote工具}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/MuXadWNNEoSsuExVj7dcZcY1nJb?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $dailyNoteBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNotetopbarleft} />
                {tomatoI18n.topbar添加图标}:
                {DailyNoteBox上一个日志.langText()}
                <strong>{DailyNoteBox上一个日志.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNotetopbarright} />
                {tomatoI18n.topbar添加图标}:
                {DailyNoteBox下一个日志.langText()}
                <strong>{DailyNoteBox下一个日志.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteGoToBottomMenu} />
                {tomatoI18n.menu添加右键菜单}： {DailyNoteBox移动内容到dailynote.langText()}
                <strong>{DailyNoteBox移动内容到dailynote.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteMoveLeaveLnk} />
                {tomatoI18n.移动内容到dailynote后原文改为链接}
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$dailyNoteGoToBottom}
                />
                {tomatoI18n.打开DailyNote时总是跳到底部}<TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteMoveToBottom} />
                {tomatoI18n.移动到DailyNote时总是移动到底部}
            </div>

            <div>
                <NotebookSelect></NotebookSelect>
            </div>

            <div>
                {DailyNoteBox复制到dailynote.langText()}
                <strong>{DailyNoteBox复制到dailynote.w()}</strong>
            </div>
            {#if !$dailyNoteCopySimple}
                <div>
                    {DailyNoteBox复制到dailynoteNewFile.langText()}
                    <strong>{DailyNoteBox复制到dailynoteNewFile.w()}</strong>
                </div>
            {/if}
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyMenu} />
                {tomatoI18n.menu添加右键菜单}： {tomatoI18n.复制到dailynote}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopySimple} />
                {tomatoI18n.简单复制到dailynote}
            </div>

            {#if !$dailyNoteCopySimple}
                <div>
                    <input class="b3-text-field" bind:value={$dailyNoteCopyAnchorText} />
                    {tomatoI18n.复制到dailynote使用的锚文本}
                </div>

                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyUseRef} />
                    {tomatoI18n.使用引用来回溯}
                </div>

                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyInsertPR} />
                    {tomatoI18n.在原文中同时插入阅读点}
                </div>

                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyUpdateBG} />
                    {tomatoI18n.改变原文的背景}
                </div>

                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyShowPath} />
                    {tomatoI18n.复制的内容显示原文的路径}
                </div>

                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyComment} />
                    {tomatoI18n.添加批注}
                </div>

                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$dailyNoteCopyFlashCard} />
                    {tomatoI18n.加入闪卡}
                </div>
            {/if}
        {/if}
    </div>
