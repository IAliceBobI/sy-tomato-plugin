<script lang="ts">
    // 设置域组件（□2 设置页重划）：反链与引用——底部反链 / 文本转引用 / 引用外观三卡
    // （引用括号·效果·渲染为标签，自 ConfEditor 语义归位）+「数据库反链与引用修复」折叠
    // 垫底区（二期 2026-09-05：疑弃/搁置功能收拢，弃时整区删；默认收起、搜索命中自动展开）。
    // 互链与引用选项折叠区系块配对族配置（pairBarEnabled 门控自证），曾按「引用」字面误归
    // 本域，2026-09-03 归位 ConfBlockEdit 块配对卡。
    // 各卡整块迁入（内部一行不动），共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import {
        backLinkBottomBoxCheckbox,
        back_link_concept_fold,
        back_link_copy,
        back_link_dailynote_off,
        back_link_default_off,
        back_link_embed,
        back_link_float,
        back_link_goto_bottom_btn,
        back_link_max_size,
        back_link_mention_count,
        back_link_move_here,
        back_link_move_to_dailynote,
        back_link_move_with_backlink,
        back_link_ref,
        back_link_refresh_off,
        back_link_remove_refs,
        bk_refresh_interval_sec,
        bk_visible_only,
        bk启用禁用文档的底部反链menu,
        dbBkBoxCheckbox,
        dbBkBoxHideDatetime,
        dbBkBoxMaxBacklinkSize,
        dbBkBoxRefreshMenu,
        dbBkBoxMenuTools,
        superRefBoxCheckBox,
        superRefBoxGlobalFixMenu,
        superRefBoxGlobalLnkMenu,
        tag2RefBoxCheckbox,
        tag2RefSearchLnk,
        tag2RefSearchRef,
        spaceRefEnabled,
        spaceRefLinkType,
        tag_to_ref_add_card,
        tag_to_ref_add_pinyin,
        cssRefEffect,
        cssRefAsTags,
        storeRefreshStaticBkLnk,
        storeOpenRefsMenu,
        storeOpenRefsClick,
        refCleanMenu,
    } from "./libs/stores";
    import { cleanDataview, icon } from "./libs/utils";
    import { BK启用禁用文档的底部反链 } from "./BackLinkBottomBox";
    import { DbBkBox刷新数据库反链 } from "./DbBkBox";
    import { SuperRefBox全局修复引用, SuperRefBox全局加固引用 } from "./SuperRefBox";
    import { Tag2RefBox模糊查找引用Lnk, Tag2RefBox模糊查找引用Ref } from "./Tag2RefBox";
    import { MixBox定位所有引用Menu } from "./MixBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { BKFloatToggle, BKFloatBallToggle } from "./BkFloat";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    const ICONS_SIZE = 14;

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);
</script>

    <!-- 底部反链 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$backLinkBottomBoxCheckbox} />
            {tomatoI18n.底部反链}
            <ConfHelpIcon token="SVELdPHKYoGMj1xkmF3cIPg3nZd" />
        </div>
        {#if $backLinkBottomBoxCheckbox}
            <div class="helpText">{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$bk启用禁用文档的底部反链menu} />
                {tomatoI18n.menu添加右键菜单}:
                {BK启用禁用文档的底部反链.langText()}<HotkeyCap hk={BK启用禁用文档的底部反链} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="number" min="0" class="b3-text-field" bind:value={$back_link_max_size} />
                {tomatoI18n.maxBkDocs最大展开的反链文件数}
            </div>

            <div>
                <input type="number" min="0" class="b3-text-field" bind:value={$back_link_mention_count} />
                {tomatoI18n.mentionDocs最大展开的提及文件数}
            </div>

            <!-- 右键菜单项折叠（confgather2 期2 A4，bear 拍板收折叠）：悬浮反链面板右键的六项
                 文档操作（移动到文档/移动到日记/删引用/复制/嵌入/引用）收进折叠——低频菜单项
                 不占平铺位，批注卡「右键菜单项」隐藏集同款先例；搜索命中自动展开。
                 原「移动到文档」softBox 子组拍平为普通行（条件子行随其后） -->
            <details class="settingBox">
                <summary class="section-title">{tomatoI18n.右键菜单项}</summary>
                <div class="softBox">
                    <div>
                        <input type="checkbox" class="b3-switch" bind:checked={$back_link_move_here} />
                        <span class="b3-label__text"> {@html icon("Move", ICONS_SIZE)}</span>
                        {tomatoI18n.移动到文档}
                    </div>
                    {#if $back_link_move_here}
                        <div class="tomato-cond-subrow">
                            <input type="checkbox" class="b3-switch" bind:checked={$back_link_move_with_backlink} />
                            <span class="b3-label__text"> {@html icon("Move", ICONS_SIZE)}</span>
                            {tomatoI18n.移动内容后添加指向原来位置的链接}
                        </div>
                    {/if}

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
                </div>
            </details>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_default_off} />
                {tomatoI18n.defaultBkDisabled底部反链默认关闭}
            </div>

            <!-- □4 悬浮反链（bkfloat 2026-09-17）：桌面端球+面板形态总开关；改动经结构性键整重载生效。
                 键帽随功能走（09-17 bear 拍板：配置按功能归类不按类型集中，开关+名称+键帽一行紧凑形态） -->
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_float} />
                {tomatoI18n.悬浮反链}<HotkeyCap hk={BKFloatToggle} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div class="helpText">{tomatoI18n.悬浮反链说明}</div>
            <!-- 球显隐命令键帽行（confgather2 □2）：命令无独立开关（runtime localStorage 态），
                 文本+键帽形态与命令开关域行同构 -->
            <div>
                {tomatoI18n.显示或隐藏悬浮反链球}<HotkeyCap hk={BKFloatBallToggle} pluginName="sy-tomato-plugin"></HotkeyCap>
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

            <!-- 跳底按钮 2026-09-01 放开（收费边界定稿：便利开关非省力型，收费理由弱） -->
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_goto_bottom_btn} />
                {tomatoI18n.在标题下添加跳转到底部的按钮}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$back_link_concept_fold} />
                {tomatoI18n.默认折叠概念栏}
            </div>
        {/if}
    </div>
    <!-- 文本转引用 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$tag2RefBoxCheckbox} />
            {tomatoI18n.文本转引用}
            <ConfHelpIcon token="OikodVWC1oJK16xUfm9cmpfAnQd" />
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
            <div class="helpText">{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$tag2RefSearchRef} />
                {tomatoI18n.menu添加右键菜单}:{Tag2RefBox模糊查找引用Ref.langText()}<HotkeyCap hk={Tag2RefBox模糊查找引用Ref} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$tag2RefSearchLnk} />
                {tomatoI18n.menu添加右键菜单}:{Tag2RefBox模糊查找引用Lnk.langText()}<HotkeyCap hk={Tag2RefBox模糊查找引用Lnk} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
        {/if}
    </div>
    <!-- 空格转引用（SpaceRefBox） -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" disabled={codeNotValid} class:codeNotValid bind:checked={$spaceRefEnabled} />
            {tomatoI18n.空格转引用}
            <TomatoVIP {codeValid}></TomatoVIP>
            <ConfHelpIcon token="KLVWdKT9qoBGMDxXfi8czVMvnQe" />
        </div>
        {#if $spaceRefEnabled}
            <div class="helpText">{tomatoI18n.空格转引用说明}</div>
            <div>
                {tomatoI18n.空格转引用形态}
                <select
                    class="b3-select"
                    value={$spaceRefLinkType}
                    onchange={(e) => spaceRefLinkType.write(e.currentTarget.value)}
                >
                    <option value="ref">{tomatoI18n.空格转引用块引用}</option>
                    <option value="lnk">{tomatoI18n.空格转引用文档链接}</option>
                </select>
            </div>
        {/if}
    </div>
    <!-- 引用效果（多档化：原「引用前后加上括号」+「给引用加上效果」双开关合并，2026-09-03） -->
    <div class="settingBox">
        <div class="section-title">
            {tomatoI18n.引用效果}
            <ConfHelpIcon token="NVApdj8akoobhjxvAiGct4RDnDb" />
        </div>
        <div class="helpText">{tomatoI18n.引用效果说明}</div>
        <div>
            {tomatoI18n.引用效果样式}
            <select
                class="b3-select"
                value={$cssRefEffect}
                onchange={(e) => cssRefEffect.write(e.currentTarget.value)}
            >
                <option value="none">{tomatoI18n.引用效果无}</option>
                <option value="brackets">{tomatoI18n.引用效果双方括号}</option>
                <option value="icon">{tomatoI18n.引用效果链接图标}</option>
                <option value="shadow">{tomatoI18n.引用效果悬停阴影}</option>
                <option value="highlight">{tomatoI18n.引用效果悬停高亮}</option>
            </select>
        </div>
    </div>
    <!-- 将指定的引用渲染为标签 -->
    <div class="settingBox">
        <div class:codeNotValid>
            {tomatoI18n.将指定的引用渲染为标签}
            <TomatoVIP {codeValid}></TomatoVIP><br />
            <textarea
                disabled={codeNotValid}
                class:codeNotValid
                class="b3-text-field"
                bind:value={$cssRefAsTags}
                placeholder="@,tag,label"
                spellcheck="false"
            ></textarea>
        </div>
    </div>
    <!-- 折叠垫底区：静态反链 + 失效引用清理（confgather2 期3 A5+A6，bear 拍板收折叠：
         低频维护工具合集，形态对齐「数据库反链与引用修复」垫底区先例；静态反链默认关=
         不大受欢迎先收着观察一版〔表 C3 未勾不删〕，两卡整块收进 softBox 内部一行不动） -->
    <details class="settingBox">
        <summary class="section-title">{tomatoI18n.静态反链与失效引用清理}<span class="setting-count">2</span><!-- 计数与下方卡数同步增删（数据库垫底区同款） --></summary>
        <div class="softBox">
            <!-- 静态反链（三期自通用域杂项卡归位：刷新/删除两菜单项同 storeRefreshStaticBkLnk 门控，
                 默认关；定位所有引用/点击引用数两行同批归位本域） -->
            <div class="settingBox">
                <div class="section-title">{tomatoI18n.静态反链}</div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$storeRefreshStaticBkLnk} />
                    {tomatoI18n.menu添加右键菜单}: {tomatoI18n.刷新静态反链} / {tomatoI18n.删除静态反链}
                </div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$storeOpenRefsMenu} />
                    {tomatoI18n.menu添加右键菜单}: {MixBox定位所有引用Menu.langText()}<HotkeyCap hk={MixBox定位所有引用Menu} pluginName="sy-tomato-plugin"></HotkeyCap>
                </div>
                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$storeOpenRefsClick}
                    />
                    {tomatoI18n.点击引用数打开所有引用}
                </div>
            </div>
            <!-- 失效引用清理（vipdoctree □4 2026-09-13）：2026-09-15 起全免费（bear 反馈拍板，
                 原「检查免费/批量动作 Pro」挂法撤销——竞品免费+钓鱼观感） -->
            <div class="settingBox">
                <div class="section-title">{tomatoI18n.失效引用清理}</div>
                <div class="helpText">{tomatoI18n.失效引用清理说明()}</div>
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$refCleanMenu} />
                    {tomatoI18n.menu添加右键菜单}: {tomatoI18n.检查失效引用}
                </div>
            </div>
        </div>
    </details>
    <!-- 折叠垫底区：数据库反链 + 引用修复（二期 2026-09-05 收拢：疑弃/搁置功能垫域底，
         弃时整区删；两卡整块收进 softBox 内部一行不动，summary 沿卡 ConfHelpIcon 原样） -->
    <details class="settingBox">
        <summary class="section-title">{tomatoI18n.数据库反链与引用修复}<span class="setting-count">2</span><!-- 计数与下方卡数同步增删（vision R1 P1-2：与编辑器外观与行为同构） --><ConfHelpIcon token="W4WxdA0Bzo0O7UxwHFFcAHUUnSd" /></summary>
        <div class="softBox">
            <!-- 数据库反链 -->
            <div class="settingBox">
                <div class="section-title">
                    <input type="checkbox" class="b3-switch" bind:checked={$dbBkBoxCheckbox} />
                    {tomatoI18n.数据库充当反链}
                    <ConfHelpIcon token="W4WxdA0Bzo0O7UxwHFFcAHUUnSd" />
                </div>
                {#if $dbBkBoxCheckbox}
                    <div class="helpText">{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
                    <div>
                        <input type="checkbox" class="b3-switch" bind:checked={$dbBkBoxRefreshMenu} />
                        {tomatoI18n.menu添加右键菜单}:
                        {DbBkBox刷新数据库反链.langText()}
                        <HotkeyCap hk={DbBkBox刷新数据库反链} pluginName="sy-tomato-plugin"></HotkeyCap>
                    </div>
                    <!-- featgate □2 死角补口：数据库工具组 1 键管 5 项配套操作（移到下边/
                         清空筛选/按标签过滤/排除标签/聚合勾选）；菜单构建时动态读右键即生效 -->
                    <div>
                        <input type="checkbox" class="b3-switch" bind:checked={$dbBkBoxMenuTools} />
                        {tomatoI18n.menu添加右键菜单}:
                        {tomatoI18n.数据库工具组}
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
            <!-- 修复引用 -->
            <div class="settingBox">
                <div class="section-title">
                    <input type="checkbox" class="b3-switch" bind:checked={$superRefBoxCheckBox} />
                    {tomatoI18n.引用修复工具}
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
        </div>
    </details>
