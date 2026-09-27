<script lang="ts">
    // 设置域组件（二期 14 域 2026-09-05）：速记——拍照闪念（自 ConfClock.svelte 迁入）
    // + 快速笔记（自 ConfMisc.svelte 迁入）两卡（待翻新域）。悬浮球卡已拆出 ConfFloatBall
    // 独立成域（原 ConfFloatingBall 全部回归）。各卡整块迁入（内部一行不动），
    // 共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import NotebookSelect from "./NotebookSelect.svelte";
    import {
        avoiding_cloud_synchronization_conflicts,
        cssFlashThoughts,
        cssFlashThoughtsTask,
        flash_thoughts_2_top,
        flash_thoughts_target_file,
        flashBlockForm,
        flashRelayByTime,
        flashStatTag,
        ideaIntervalMode,
        shorthandRelayEnabled,
        shorthandRelayMobileHinted,
        shorthandRelayPathTpl,
        noteBoxAllKinds,
        noteBoxCheckbox,
        noteBoxMobileSync,
        fastNoteBoxAdd2Flashcard,
        fastNoteBoxCheckbox,
        fastNoteBoxDelAfterCreating,
        fastNoteBoxDisableBK,
        fastNoteBoxDocPrefix,
        storeNoteBox_fastnote,
        quickNoteCheckbox,
        quickNoteOpenMode,
    } from "./libs/stores";
    import { QuickNote速记器全局 } from "./QuickNote";
    import { FastNoteBox创建快速笔记, FastNoteBox打开最后一个笔记, FastNoteBox草稿切换 } from "./FastNoteBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { events } from "./libs/Events";
    import { siyuan } from "./libs/utils";
    import { shouldShowMobileRelayHint } from "./libs/shorthandRelay";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);

    // need-0926-07：移动端开启「官方速记搬运」开关瞬间一次性提示（移动端不自动搬运、整理在
    // 桌面端进行）；防重弹标记 shorthandRelayMobileHinted 走 petal 设置。决策逻辑纯函数
    // shouldShowMobileRelayHint（单测覆盖）。注意标记只 .set 进内存、随面板保存链落盘——不保存
    // 则开关本就未生效，标记与开关同生共死；勿在开关回调里 .write()（整份落盘会夹带面板上
    // 其他未保存的改动）。组件级回调不依赖 NoteBox 面板状态（09-26 ③ 教训：跨面板功能不挂
    // 可早退链）
    function onShorthandRelayToggle() {
        if (shouldShowMobileRelayHint($shorthandRelayEnabled, events.isMobile, shorthandRelayMobileHinted.get())) {
            shorthandRelayMobileHinted.set(true);
            siyuan.pushMsg(tomatoI18n.官方速记搬运移动端提示);
        }
    }
</script>

    <!-- 拍照闪念（□4 设置域归并 2026-09-06：入口→落点→行为三区；落点区与 ConfDocs
         dailynote 卡同一 NotebookSelect/同一 store，呈现统一） -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$noteBoxCheckbox} />
            {tomatoI18n.拍照闪念收集图片闪念到}
            <ConfHelpIcon token="N3LkdvKGhowkTUx1r6OcxCjInec" />
        </div>
        <!-- 速记器（quicknote □2；□4 窗口统一化=全局唯一入口）：开关+名称+键帽合一行；
             触发形态一行（外部轻窗默认/带出思源）。放总开关 if 外=速记器独立于拍照闪念开关
             （保存链落点共享但入口独立） -->
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$quickNoteCheckbox} />
            {QuickNote速记器全局.langText()}
            <HotkeyCap hk={QuickNote速记器全局} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        {#if $quickNoteCheckbox}
            <div>
                {tomatoI18n.速记器触发形态}
                <select class="b3-select" bind:value={$quickNoteOpenMode}>
                    <option value="external">{tomatoI18n.外部轻窗}</option>
                    <option value="focus">{tomatoI18n.带出思源}</option>
                </select>
            </div>
        {/if}
        {#if $noteBoxCheckbox}
            <!-- □4：「拍照闪念（全局）⌥7」「触发快捷键时弹出对话框」「失焦时自动关闭小窗」
                 三行退役——全局入口统一到速记器 ⌥J（形态可配），图片闪念走 Dock 图标/速记器
                 focus 形态进面板；设置可见性与功能可用性一致 -->
            <!-- featgate □2 死角补口：移动端顶栏「同步数据」钮独立开关（注册在 NoteBox
                 onload，改后保存→插件级重载生效）；桌面端无此钮行仍在（跨端设置同构） -->
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$noteBoxMobileSync} />
                {tomatoI18n.移动端同步钮}
            </div>
            <div>
                <textarea spellcheck="false" class="b3-text-field" bind:value={$noteBoxAllKinds}></textarea>
                {tomatoI18n.自定义图标}
                <!-- need-0926-13：声明语法说明行（helpText 弱化，随行参与搜索过滤）——
                     「@别名」后缀不可见则功能不可发现 -->
                <div class="helpText">{tomatoI18n.图标别名后缀说明}</div>
            </div>

            <div>
                {tomatoI18n.日记落点笔记本}
                <NotebookSelect bare></NotebookSelect>
            </div>

            <div>
                <input class="b3-text-field" bind:value={$flash_thoughts_target_file} />
                {tomatoI18n.闪念插入到文件}
            </div>

            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$shorthandRelayEnabled}
                    onchange={onShorthandRelayToggle}
                />
                {tomatoI18n.官方速记搬运}
                <!-- need-0926-07：开关行说明文案（helpText 行内弱化样式，随行参与搜索过滤）——
                     治「开同步后不生效」移动端静默守卫无说明 -->
                <div class="helpText">{tomatoI18n.官方速记搬运说明}</div>
            </div>

            <!-- need-0926-19：官方速记中转路径模板——官方「闪念速记-保存位置」仅移动端有
                 设置入口且写各设备本机 conf（不进同步）→ 桌面端恒空=搬运死路；插件自存同款
                 go 日期模板优先定位中转文档（渲染=libs/shorthandRelay.renderShorthandTemplate
                 受控子集），本机 conf 只作兜底。默认=官方推荐形态日粒度模板。
                 label 上/输入框全宽下行（ConfKnowledge APIKey 行同款）——默认模板 34 字符，
                 行内布局必截断（vision P1 09-26） -->
            <div>
                {tomatoI18n.官方速记中转路径模板}
                <input class="b3-text-field" style="width: 100%" bind:value={$shorthandRelayPathTpl} />
                <div class="helpText">{tomatoI18n.中转路径模板说明}</div>
            </div>

            <!-- need-0926-11：搬运速记按记录时间归位（官方速记搬运+队列闪念合并两链共用）
                 ——搬进日记时按记录时刻锚定首个更晚速记块前，非速记块透明穿越、无更晚锚尾插
                 兜底、不重排存量；默认关=存量恒尾插/头插语义零改动 -->
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$flashRelayByTime} />
                {tomatoI18n.搬运速记按记录时间归位}
                <div class="helpText">{tomatoI18n.按记录时间归位说明}</div>
            </div>

            <!-- □4（fballfb 2026-09-21）：速记/闪念落块形态三态——super=双层超级块/para=裸
                 段落块（默认，bear 09-21 拍板）/list=裸列表项块（解「删内容留壳→删壳报错」）；
                 存量不迁移、改设置只影响此后新落块（含官方速记搬运产块） -->
            <div>
                {tomatoI18n.速记落块形态}
                <select class="b3-select" bind:value={$flashBlockForm}>
                    <option value="super">{tomatoI18n.速记落块形态超级块}</option>
                    <option value="para">{tomatoI18n.速记落块形态段落块}</option>
                    <option value="list">{tomatoI18n.速记落块形态列表项块}</option>
                </select>
            </div>

            <!-- flashlog □6：闪念/官方速记落块附加时间·类型·内容标记，时间记录统计类插件可直接识别 -->
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$flashStatTag} />
                {tomatoI18n.闪念时间记录兼容}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$avoiding_cloud_synchronization_conflicts}
                />
                {tomatoI18n.规避云端同步冲突}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$flash_thoughts_2_top} />
                {tomatoI18n.闪念插入到Dailynote顶端}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cssFlashThoughts} />
                {tomatoI18n.显示闪念的时间与类型}
            </div>
            <!-- need-0926-18：速记间隔计算模式两档（对齐用户参照插件的「时间计算模式」）：
                 start=间隔算「本条到下一条」写在较早条（默认=存量语义）/end=算「上一条到
                 当前」写在较晚条；存量属性不迁移，切换保存后自动重算当天日记（IndexConf
                 save() 挂点）。不挂 cssFlashThoughts 的 if——calc 属性计算与显示开关解耦 -->
            <div>
                {tomatoI18n.速记间隔计算模式}
                <select class="b3-select" bind:value={$ideaIntervalMode}>
                    <option value="start">{tomatoI18n.间隔模式开始}</option>
                    <option value="end">{tomatoI18n.间隔模式结束}</option>
                </select>
                <div class="helpText">{tomatoI18n.间隔模式说明}</div>
            </div>
            <!-- need-0926-12 ⑤：任务项（📌→l/i subtype=t）单独可关时间标识——全局开时才
                 有意义（全局关=零注入本就不显示），故 if 挂在全局开关下 -->
            {#if $cssFlashThoughts}
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$cssFlashThoughtsTask} />
                    {tomatoI18n.任务项显示时间胶囊}
                </div>
            {/if}
        {/if}
    </div>
    <!-- 快速笔记 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$fastNoteBoxCheckbox} />
            {tomatoI18n.快速笔记}
            <ConfHelpIcon token="DNZ1dYORAoHpm7xdPaecyb6Pnrh" />
        </div>
        {#if $fastNoteBoxCheckbox}
            <div>{tomatoI18n.快捷键如有冲突请调整}</div>

            <div>
                {tomatoI18n.创建快速笔记}
                <HotkeyCap hk={FastNoteBox创建快速笔记} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div>
                {tomatoI18n.打开最后一个笔记}
                <HotkeyCap hk={FastNoteBox打开最后一个笔记} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div class:codeNotValid>
                {FastNoteBox草稿切换.langText()}
                <HotkeyCap hk={FastNoteBox草稿切换} pluginName="sy-tomato-plugin"></HotkeyCap><TomatoVIP {codeValid}></TomatoVIP>
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
