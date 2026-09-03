<script lang="ts">
    // 设置域组件（□2 设置页重划）：闪卡——闪卡工具 / 闪卡优先级（原 ConfCards 全部）+
    // 图片遮挡 + 鼠标悬浮显示闪卡挖空的内容（两卡顺势归位闪卡域）。
    // 各卡整块迁入（内部一行不动），共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import {
        auto_card_priority,
        cardBoxAddConcepts,
        cardBoxCardtab,
        cardBoxCheckbox,
        cardBoxSpradEvenlyPostpone,
        cardBoxSuperCard,
        cardPriorityBoxAutoHide,
        cardPriorityBoxCheckbox,
        cardPriorityBoxPostponeCardMenu,
        cardPriorityBoxPriorityMenu,
        cardPriorityBoxSpradDelayMenu,
        cardPrioritySetPriInterval,
        card_priority_slider_hide,
        card_priority_stopBtn_hide,
        card_refresh_visible_only,
        imgOverlayCheckbox,
        cssShowFlashCardBlank,
    } from "./libs/stores";
    import { siyuan } from "./libs/utils";
    import {
        CardBox取消当前文档内所有闪卡,
        CardBox清理所有失效的闪卡,
        CardBox用选中的行创建超级块超级块制卡取消制卡,
    } from "./CardBox";
    import {
        CardPriority恢复所有暂停的闪卡,
        CardPriorityBox分散推迟闪卡,
        CardPriorityBox推迟闪卡,
        CardPriorityBox修改文档中闪卡优先级,
    } from "./CardPriorityBox";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);
</script>

    <!-- 闪卡工具 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$cardBoxCheckbox} />
            {tomatoI18n.闪卡工具}
            <ConfHelpIcon token="HJVDdXzrfo3XgMxAwFTc1gyvnHc" />
        </div>
        {#if $cardBoxCheckbox}
            <div>
                {tomatoI18n.快捷键如有冲突请调整}
            </div>
            <div>
                {tomatoI18n.取消当前文档内所有闪卡}
                <HotkeyCap hk={CardBox取消当前文档内所有闪卡} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {tomatoI18n.清理所有失效的闪卡}
                <HotkeyCap hk={CardBox清理所有失效的闪卡} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cardBoxSuperCard} />
                {tomatoI18n.menu添加右键菜单}: {tomatoI18n.用选中的行创建超级块超级块制卡取消制卡}<HotkeyCap hk={CardBox用选中的行创建超级块超级块制卡取消制卡} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cardBoxCardtab} />
                {tomatoI18n.如果有闪卡可复习自动在后台打开}
            </div>
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$card_refresh_visible_only}
                    onchange={() => card_refresh_visible_only.write($card_refresh_visible_only)}
                />
                {tomatoI18n.仅可见时检查闪卡待复习}
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cardBoxAddConcepts} />
                {tomatoI18n.创建闪卡时添加所有虚拟引用到第一行}<TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cardBoxSpradEvenlyPostpone}
                />
                {tomatoI18n.推迟多个闪卡分散在一段时间内}<TomatoVIP {codeValid}></TomatoVIP>
            </div>
        {/if}
        <div>
            <button
                class="b3-button b3-button--outline tomato-button"
                onclick={() => {
                    siyuan.removeBrokenCards(tomatoI18n);
                }}
                >🗑️
            </button>{tomatoI18n.删除失效的闪卡}
        </div>
    </div>
    <!-- 闪卡优先级 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$cardPriorityBoxCheckbox} />
            {tomatoI18n.闪卡优先级}
            <ConfHelpIcon token="KwZJdW9BeoHkiRxVg6jcLUnanqf" />
        </div>
        {#if $cardPriorityBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>

            <div>
                {tomatoI18n.恢复所有暂停的闪卡}
                <HotkeyCap hk={CardPriority恢复所有暂停的闪卡} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cardPriorityBoxPostponeCardMenu} />
                {tomatoI18n.menu添加右键菜单 + "：" + tomatoI18n.推迟闪卡}
                <HotkeyCap hk={CardPriorityBox推迟闪卡} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cardPriorityBoxSpradDelayMenu}
                />
                {tomatoI18n.menu添加右键菜单 + "：" + tomatoI18n.分散推迟闪卡}
                <HotkeyCap hk={CardPriorityBox分散推迟闪卡} pluginName="sy-tomato-plugin"></HotkeyCap><TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cardPriorityBoxPriorityMenu} />
                {tomatoI18n.menu添加右键菜单 + "：" + tomatoI18n.修改文档中闪卡优先级}
                <HotkeyCap hk={CardPriorityBox修改文档中闪卡优先级} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$cardPriorityBoxAutoHide}
                />
                {tomatoI18n.自动隐藏}<TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$auto_card_priority} />
                {tomatoI18n.连续2次重来加优先级连续2次简单减优先级}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$card_priority_slider_hide} />
                {tomatoI18n.隐藏优先级滑动块}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$card_priority_stopBtn_hide} />
                {tomatoI18n.隐藏闪卡暂停按钮}
            </div>

            <div>
                <input class="b3-text-field" bind:value={$cardPrioritySetPriInterval} />
                {tomatoI18n.间隔x分钟检查所有闪卡加上默认优先级($cardPrioritySetPriInterval)}
                {#if !$cardPrioritySetPriInterval || $cardPrioritySetPriInterval == "0"}
                    （{tomatoI18n.不扫描优先级}）
                {/if}
            </div>
        {/if}
    </div>
    <!-- 图片遮挡（自 ConfMisc.svelte 顺势归位闪卡域） -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$imgOverlayCheckbox} />
            {tomatoI18n.图片遮挡}
            <ConfHelpIcon token="SLSWdFITgo7q4ex4q6ScIuGin2g" />
        </div>
    </div>
    <!-- 鼠标悬浮显示闪卡挖空的内容（自 ConfEditor.svelte 顺势归位闪卡域） -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cssShowFlashCardBlank} />
            {tomatoI18n.鼠标悬浮显示闪卡挖空的内容}
        </div>
    </div>
