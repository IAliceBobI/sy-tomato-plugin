<script lang="ts">
    // 设置对话框主壳：VIP/激活码、搜索栏、全局快捷键、保存按钮 + 各功能分区子组件（Conf*.svelte）。
    // 2026-08 重构：原 2628 行大文件按功能域拆出 8 个分区子组件；helpOpen 提到 ./helpOpen.ts；
    // 共享样式在 ./IndexConf.css（.tomato-settings-dialog 作用域，根节点 class 见模板）。
    import "./IndexConf.css";
    import { onDestroy, onMount, tick } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
    import { STORAGE_SETTINGS } from "./constants";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import { saveRestorePagePosition } from "./libs/utils";
    import ActivationCard from "./ActivationCard.svelte";
    import DevDeactivate from "./DevDeactivate.svelte";
    import { tomatoSettingsOpenHK } from ".";
    import { ScheduleCopyID } from "./Schedule";
    import { addFoldCmd折叠, addFoldCmd展开 } from "./fold";
    import { SPACE } from "./libs/gconst";
    import { searchSettings } from "./libs/ui";
    import { helpOpen } from "./helpOpen";
    import ConfEditor from "./ConfEditor.svelte";
    import ConfFloatingBall from "./ConfFloatingBall.svelte";
    import ConfExport from "./ConfExport.svelte";
    import ConfClock from "./ConfClock.svelte";
    import ConfBacklink from "./ConfBacklink.svelte";
    import ConfCards from "./ConfCards.svelte";
    import ConfLinks from "./ConfLinks.svelte";
    import ConfMisc from "./ConfMisc.svelte";
    interface Props {
        dm: DestroyManager;
        plugin: BaseTomatoPlugin;
    }

    let { dm, plugin = $bindable() }: Props = $props();
    let settingsDiv: HTMLElement = $state();
    let searchInput: HTMLElement = $state();
    let codeValid = $state(false);
    let searchKey = $state("");
    const SearchKeyItemKey = "tomato_settings_SearchKeyItemKey_RfrUm9VLS4GehTzg5ygRrNT";
    onDestroy(() => {
        dm.destroyBy("2");
        localStorage.setItem(SearchKeyItemKey, searchKey);
    });
    export function destroy() {}

    onMount(async () => {
        window.tomato_zZmqus5PtYRi.save = save;
        saveRestorePagePosition(
            "tomato_settings_scrollPosition_YELnPikKNirXyQqzIHNB",
            dm,
            settingsDiv?.parentElement?.parentElement,
            false,
        );
        const savedSearchKey = localStorage.getItem(SearchKeyItemKey);
        if (savedSearchKey) {
            searchKey = savedSearchKey;
            await tick();
            if (settingsDiv) {
                searchSettings(settingsDiv, searchKey);
            }
        }
        searchInput.focus();
    });

    async function save() {
        dm.destroyBy();
        await plugin.saveData(STORAGE_SETTINGS, plugin.settingCfg);
        window.location.reload();
    }
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="tomato-settings-dialog fn_flex fn_flex-column" bind:this={settingsDiv}>
    <!-- 激活/购买共享卡（阶段 0+1）：verify 收进组件，结果经 bind:codeValid 回传 -->
    <ActivationCard
        product="tomato"
        bind:codeValid
        showBuy={true}
        onActivated={() => plugin.saveData(STORAGE_SETTINGS, plugin.settingCfg)}
    ></ActivationCard>
    <!-- 开发者（isMe）专属取消激活入口：已激活后激活卡整卡隐藏，此处是唯一退出通道，
         普通用户不可见（2026-08-24 B 方案） -->
    {#if codeValid}
        <div class="settingBox dev-row">
            <DevDeactivate />
        </div>
    {/if}
    <!-- search -->
    <div class="settingBox search-bar" data-search>
        <input
            bind:this={searchInput}
            class="b3-text-field"
            placeholder={tomatoI18n.search搜索配置}
            bind:value={searchKey}
            oninput={() => {
                localStorage.setItem(SearchKeyItemKey, searchKey);
                searchSettings(settingsDiv, searchKey);
            }}
        />
    </div>
    <!-- 快捷键 -->
    <section class="conf-group">
        <div class="settingBox">
            <div class="section-title">{tomatoI18n.快捷键如有冲突请调整}</div>
            <div>
                {tomatoSettingsOpenHK.langText()}<HotkeyCap hk={tomatoSettingsOpenHK} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {ScheduleCopyID.langText() + SPACE}<HotkeyCap hk={ScheduleCopyID} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {addFoldCmd折叠.langText()}<HotkeyCap hk={addFoldCmd折叠} pluginName="sy-tomato-plugin"></HotkeyCap>
                <strong>
                    <a href="https://awx9773btw.feishu.cn/docx/XyFPdPBbsol477xl5TFcX9Ttn2e?from=from_copylink" onclick={helpOpen}>
                        {tomatoI18n.帮助}</a
                    >
                </strong>
            </div>
            <div>
                {addFoldCmd展开.langText()}<HotkeyCap hk={addFoldCmd展开} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
        </div>
    </section>
    <section class="conf-group"><ConfEditor {codeValid}></ConfEditor></section>
    <section class="conf-group"><ConfFloatingBall></ConfFloatingBall></section>
    <section class="conf-group"><ConfExport {codeValid}></ConfExport></section>
    <section class="conf-group"><ConfClock {codeValid}></ConfClock></section>
    <section class="conf-group"><ConfBacklink {codeValid}></ConfBacklink></section>
    <section class="conf-group"><ConfCards {codeValid}></ConfCards></section>
    <section class="conf-group"><ConfLinks {codeValid}></ConfLinks></section>
    <section class="conf-group"><ConfMisc {codeValid}></ConfMisc></section>
    <!-- save -->
    <div class="settingBox save-row">
        <button class="b3-button b3-button--outline tomato-button" onclick={save}>{tomatoI18n.保存}</button>
    </div>
</div>
