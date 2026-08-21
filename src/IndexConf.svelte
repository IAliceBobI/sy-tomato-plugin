<script lang="ts">
    // 设置对话框主壳：VIP/激活码、搜索栏、全局快捷键、保存按钮 + 各功能分区子组件（Conf*.svelte）。
    // 2026-08 重构：原 2628 行大文件按功能域拆出 8 个分区子组件；helpOpen 提到 ./helpOpen.ts；
    // 共享样式在 ./IndexConf.css（.tomato-settings-dialog 作用域，根节点 class 见模板）。
    import "./IndexConf.css";
    import TomatoVIP from "./TomatoVIP.svelte";
    import { onDestroy, onMount, tick } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
    import { hideVIP, userToken } from "./libs/stores";
    import { STORAGE_SETTINGS } from "./constants";
    import { tomatoI18n } from "./tomatoI18n";
    import BuyTomato from "./BuyTomato.svelte";
    import { saveRestorePagePosition } from "./libs/utils";
    import { expStore, resetKey, verifyKeyTomato } from "./libs/user";
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
    let buyDIV: HTMLElement = $state();
    let settingsDiv: HTMLElement = $state();
    let searchInput: HTMLElement = $state();
    let codeValid = $state(false);
    let codeNotValid = $derived(!codeValid);
    let searchKey = $state("");
    const SearchKeyItemKey = "tomato_settings_SearchKeyItemKey_RfrUm9VLS4GehTzg5ygRrNT";
    onDestroy(() => {
        dm.destroyBy("2");
        localStorage.setItem(SearchKeyItemKey, searchKey);
    });
    export function destroy() {}

    onMount(async () => {
        window.tomato_zZmqus5PtYRi.save = save;
        codeValid = await verifyKeyTomato();
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

    async function active() {
        resetKey();
        codeValid = await verifyKeyTomato();
        await plugin.saveData(STORAGE_SETTINGS, plugin.settingCfg);
        if (codeValid) {
            window.location.reload();
        }
    }
    async function save() {
        dm.destroyBy();
        await plugin.saveData(STORAGE_SETTINGS, plugin.settingCfg);
        window.location.reload();
    }
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="tomato-settings-dialog fn_flex fn_flex-column" bind:this={settingsDiv}>
    {#if codeNotValid || !$hideVIP}
        <div class="alert contentCenter" data-hide>
            <span>
                {tomatoI18n.大部分功能不需要激活}
            </span>
        </div>
        <!-- 激活码 -->
        <div class="settingBox" data-hide>
            <div>
                {tomatoI18n.激活码}
                <textarea
                    class="b3-text-field activeCode"
                    bind:value={$userToken}
                    placeholder="1656000000123_22000101_ldID_siyuanTomatoCode_3044022018c8d8bca......"
                    spellcheck="false"
                ></textarea>
                <button class="b3-button b3-button--outline tomato-button" onclick={active}>
                    {tomatoI18n.激活}
                </button>
                <button
                    class="b3-button b3-button--outline tomato-button"
                    onclick={() => {
                        if (buyDIV.style.display) buyDIV.style.display = "";
                        else buyDIV.style.display = "none";
                    }}
                >
                    {tomatoI18n.购买}
                </button>
                <TomatoVIP {codeValid}></TomatoVIP>
                <span title={tomatoI18n.过期时间 + ": " + $expStore}>
                    {$expStore.replaceAll(" ", "")}
                </span>
                <div bind:this={buyDIV} style="display: none;">
                    <BuyTomato></BuyTomato>
                </div>
            </div>
        </div>
    {/if}
    <!-- search -->
    <div class="settingBox search-bar" data-search>
        <input
            bind:this={searchInput}
            class="b3-text-field"
            bind:value={searchKey}
            oninput={() => {
                localStorage.setItem(SearchKeyItemKey, searchKey);
                searchSettings(settingsDiv, searchKey);
            }}
        />
        {tomatoI18n.search搜索配置}
    </div>
    <!-- 快捷键 -->
    <div class="settingBox">
        <div>{tomatoI18n.快捷键如有冲突请调整}</div>
        <div>
            {tomatoSettingsOpenHK.langText()}<strong>{tomatoSettingsOpenHK.w()}</strong>
        </div>
        <div>
            {ScheduleCopyID.langText() + SPACE}<strong>{ScheduleCopyID.w()}</strong>
        </div>
        <div>
            {addFoldCmd折叠.langText()}<strong>{addFoldCmd折叠.w()}</strong>
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/XyFPdPBbsol477xl5TFcX9Ttn2e?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        <div>
            {addFoldCmd展开.langText()}<strong>{addFoldCmd展开.w()}</strong>
        </div>
        <div class:codeNotValid>
            <input
                type="checkbox"
                disabled={codeNotValid}
                class:codeNotValid
                class="b3-switch"
                bind:checked={$hideVIP}
            />
            {tomatoI18n.隐藏vip图标}<TomatoVIP {codeValid}></TomatoVIP>
        </div>
    </div>
    <ConfEditor {codeValid}></ConfEditor>
    <ConfFloatingBall></ConfFloatingBall>
    <ConfExport {codeValid}></ConfExport>
    <ConfClock {codeValid}></ConfClock>
    <ConfBacklink {codeValid}></ConfBacklink>
    <ConfCards {codeValid}></ConfCards>
    <ConfLinks {codeValid}></ConfLinks>
    <ConfMisc {codeValid}></ConfMisc>
    <!-- save -->
    <div class="settingBox">
        <button class="b3-button b3-button--outline tomato-button" onclick={save}>{tomatoI18n.保存}</button>
    </div>
</div>
