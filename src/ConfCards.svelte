<script lang="ts">
    // IndexConf 设置分区：闪卡工具 / 闪卡优先级 / 长内容工具。
    // 从 IndexConf.svelte 拆出（2026-08 重构），共享样式见 IndexConf.css。
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
        cpBoxCheckbox,
        deleteBlocksMenu,
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
    import { CpBox批量删除大量连续内容块, CpBox批量复制大量连续内容块, CpBox批量移动大量连续内容块 } from "./CpBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { helpOpen } from "./helpOpen";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);
</script>

    <!-- 闪卡工具 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cardBoxCheckbox} />
            {tomatoI18n.闪卡工具}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/HJVDdXzrfo3XgMxAwFTc1gyvnHc?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $cardBoxCheckbox}
            <div>
                {tomatoI18n.快捷键如有冲突请调整}
            </div>
            <div>
                {tomatoI18n.取消当前文档内所有闪卡}
                <strong>{CardBox取消当前文档内所有闪卡.w()}</strong>
            </div>
            <div>
                {tomatoI18n.清理所有失效的闪卡}
                <strong>{CardBox清理所有失效的闪卡.w()}</strong>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cardBoxSuperCard} />
                {tomatoI18n.menu添加右键菜单}:
                {tomatoI18n.用选中的行创建超级块超级块制卡取消制卡}<strong
                    >{CardBox用选中的行创建超级块超级块制卡取消制卡.w()}</strong
                >
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
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cardPriorityBoxCheckbox} />
            {tomatoI18n.闪卡优先级}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/KwZJdW9BeoHkiRxVg6jcLUnanqf?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $cardPriorityBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>

            <div>
                {tomatoI18n.恢复所有暂停的闪卡}
                <strong>{CardPriority恢复所有暂停的闪卡.w()}</strong>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cardPriorityBoxPostponeCardMenu} />
                {tomatoI18n.menu添加右键菜单 + "：" + tomatoI18n.推迟闪卡}
                <strong>{CardPriorityBox推迟闪卡.w()}</strong>
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
                <strong>{CardPriorityBox分散推迟闪卡.w()}</strong><TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cardPriorityBoxPriorityMenu} />
                {tomatoI18n.menu添加右键菜单 + "：" + tomatoI18n.修改文档中闪卡优先级}
                <strong>{CardPriorityBox修改文档中闪卡优先级.w()}</strong>
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
    <!-- 长内容工具 -->
    <div class="settingBox">
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$cpBoxCheckbox} />
            {tomatoI18n.长内容工具}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/Njovdyosyo4pVExpeqOcH3ImnJu?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $cpBoxCheckbox}
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$deleteBlocksMenu} />
                {tomatoI18n.menu添加右键菜单 + "：" + CpBox批量删除大量连续内容块.langText()}
                <strong>{CpBox批量删除大量连续内容块.w()}</strong>
            </div>

            <div class="kbd">
                {@html tomatoI18n.批量删除帮助}
            </div>
            <div>
                {tomatoI18n.批量移动大量连续内容块}
                <strong>{CpBox批量移动大量连续内容块.w()}</strong>
            </div>
            <div>
                {tomatoI18n.批量复制大量连续内容块}
                <strong>{CpBox批量复制大量连续内容块.w()}</strong>
            </div>
            <div class="kbd">
                {@html tomatoI18n.批量移动复制帮助}
            </div>
        {/if}
    </div>
