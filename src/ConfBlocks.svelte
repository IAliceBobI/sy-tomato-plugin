<script lang="ts">
    // IndexConf 设置分区：块配对工具（同步块 / 双向互链 / 长内容工具 + 高级单功能快捷键折叠区）。
    // 2026-08-31 块配对工具战役 □1 归拢：同步块+双向互链自 ConfLinks.svelte（更名 ConfDailyNote）、
    // 长内容工具自 ConfCards.svelte 迁入，设置存储 key 零迁移；老 12 个单功能快捷键键帽自
    // 双向互链段收进底部折叠区（原生 details，默认收起，搜索命中时 searchSettings 自动展开）。
    // 共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import {
        cpBoxCheckbox,
        deleteBlocksMenu,
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
        pairBarDefaultFunc,
        pairBarEnabled,
        pairBarEntryHotkey,
        pairBarEntryIconMenu,
        pairBarEntryMenu,
        pairBarEntryStatus,
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
    import { CpBox批量删除大量连续内容块, CpBox批量复制大量连续内容块, CpBox批量移动大量连续内容块 } from "./CpBox";
    import { PAIR_FUNCS } from "./libs/pairBarState";
    import { PairBar触发 } from "./PairBarBox";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);

    const pairFuncLabel = (k: string) => (tomatoI18n as any)[k] as string;
</script>

    <!-- 接力浮条（□2 V1）：统一 6 个两步式块配对操作的入口；开关正交——图标亮灰跟随各功能总开关 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$pairBarEnabled} />
            {tomatoI18n.接力浮条}
        </div>
        {#if $pairBarEnabled}
            <div>
                {tomatoI18n.块配对浮条}
                <HotkeyCap hk={PairBar触发} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div class="softBox">
                <div>
                    {tomatoI18n.默认功能}
                    <select
                        class="b3-select"
                        value={$pairBarDefaultFunc}
                        onchange={(e) => { $pairBarDefaultFunc = e.currentTarget.value; }}
                    >
                        <option value="">{tomatoI18n.无默认}</option>
                        {#each PAIR_FUNCS as f (f.id)}
                            <option value={f.id}>{pairFuncLabel(f.labelKey)}</option>
                        {/each}
                    </select>
                </div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$pairBarEntryHotkey} />
                    {tomatoI18n.快捷键入口}
                </div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$pairBarEntryStatus} />
                    {tomatoI18n.状态栏入口}
                </div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$pairBarEntryMenu} />
                    {tomatoI18n.内容菜单入口}
                </div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$pairBarEntryIconMenu} />
                    {tomatoI18n.块图标菜单入口}
                </div>
            </div>
        {/if}
    </div>
    <!-- 同步块（自 ConfLinks.svelte 迁入，键帽与开关原样） -->
    <div class="settingBox">
        <div class="section-title">
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$linkBoxSyncBlock}
                onchange={() => {
                    if ($linkBoxSyncBlock) $linkBoxCheckbox = true;
                }}
            />
            {tomatoI18n.同步块}
        </div>
        {#if $linkBoxSyncBlock}
            <div>
                {LinkBox查看所有同步位置.langText()}
                <HotkeyCap hk={LinkBox查看所有同步位置} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {LinkBox同步块选择.langText()}
                <HotkeyCap hk={LinkBox同步块选择} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {LinkBox同步块创建.langText()}
                <HotkeyCap hk={LinkBox同步块创建} pluginName="sy-tomato-plugin"></HotkeyCap>
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
    <!-- 双向互链（自 ConfLinks.svelte 迁入；12 个单功能快捷键键帽收进本分区底部折叠区） -->
    <div class="settingBox">
        <div class="section-title">
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$linkBoxCheckbox}
                onchange={() => {
                    if (!$linkBoxCheckbox) $linkBoxSyncBlock = false;
                }}
            />
            {tomatoI18n.双向互链}
        </div>
        {#if $linkBoxCheckbox}
            <div class="softBox">
                <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$linkBoxBilinkMenu} />
                    {tomatoI18n.menu添加右键菜单}: {LinkBoxbilink.langText()}
                </div>
            </div>
            <div class="softBox">
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$linkBoxLnkTitle} />
                    {tomatoI18n.给链接加文字}
                </div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$linkBoxUseLnkOrRef} />
                    {tomatoI18n.使用链接否则用引用}
                </div>
            </div>
        {/if}
    </div>
    <!-- 长内容工具（自 ConfCards.svelte 迁入，aacc 帮助文案原样） -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$cpBoxCheckbox} />
            {tomatoI18n.长内容工具}
        </div>
        {#if $cpBoxCheckbox}
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$deleteBlocksMenu} />
                {tomatoI18n.menu添加右键菜单 + "：" + CpBox批量删除大量连续内容块.langText()}
                <HotkeyCap hk={CpBox批量删除大量连续内容块} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div class="kbd">
                {@html tomatoI18n.批量删除帮助}
            </div>
            <div>
                {tomatoI18n.批量移动大量连续内容块}
                <HotkeyCap hk={CpBox批量移动大量连续内容块} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {tomatoI18n.批量复制大量连续内容块}
                <HotkeyCap hk={CpBox批量复制大量连续内容块} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div class="kbd">
                {@html tomatoI18n.批量移动复制帮助}
            </div>
        {/if}
    </div>
    <!-- 高级：单功能快捷键（老 12 命令兼容层，默认收起；行序沿用原 ConfLinks 出现顺序） -->
    <details class="settingBox">
        <summary class="section-title">{tomatoI18n.高级单功能快捷键}<span class="setting-count">12</span><!-- 计数与下方键帽行同步增删 --></summary>
        <div class="softBox">
            <div>{tomatoI18n.快捷键如有冲突请调整}</div>
            <div>
                {LinkBoxbilink.langText()}
                <HotkeyCap hk={LinkBoxbilink} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {LinkBox链接到块底部.langText()}
                <HotkeyCap hk={LinkBox链接到块底部} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {LinkBox双向互链选择块.langText()}
                <HotkeyCap hk={LinkBox双向互链选择块} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {LinkBox双向互链创建往返链.langText()}
                <HotkeyCap hk={LinkBox双向互链创建往返链} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {LinkBox修复双向链接.langText()}
                <HotkeyCap hk={LinkBox修复双向链接} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {LinkBox删除双向链接.langText()}
                <HotkeyCap hk={LinkBox删除双向链接} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div class:codeNotValid>
                {LinkBox嵌入互链选择.langText()}
                <HotkeyCap hk={LinkBox嵌入互链选择} pluginName="sy-tomato-plugin"></HotkeyCap><TomatoVIP {codeValid}
                ></TomatoVIP>
            </div>
            <div class:codeNotValid>
                {LinkBox嵌入互链创建.langText()}
                <HotkeyCap hk={LinkBox嵌入互链创建} pluginName="sy-tomato-plugin"></HotkeyCap><TomatoVIP {codeValid}
                ></TomatoVIP>
            </div>
            <div>
                {LinkBox互相插入引用于下方选择.langText()}
                <HotkeyCap hk={LinkBox互相插入引用于下方选择} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {LinkBox互相插入引用于下方创建.langText()}
                <HotkeyCap hk={LinkBox互相插入引用于下方创建} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {LinkBox关联两个块选择.langText()}
                <HotkeyCap hk={LinkBox关联两个块选择} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {LinkBox关联两个块创建.langText()}
                <HotkeyCap hk={LinkBox关联两个块创建} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
        </div>
    </details>
