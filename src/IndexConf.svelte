<script lang="ts">
    // 设置对话框主壳：付费状态条、搜索栏、全局快捷键、sticky footer 保存条 + 各功能分区子组件（Conf*.svelte）。
    // 2026-08 重构：原 2628 行大文件按功能域拆出 8 个分区子组件（分区级帮助链接随 □3 帮助收敛
    // 全删，帮助统一走 header 帮助菜单）；共享样式在 ./IndexConf.css（.tomato-settings-dialog 作用域，根节点 class 见模板）。
    import "./IndexConf.css";
    import { onDestroy, onMount, tick } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
    import { STORAGE_SETTINGS } from "./constants";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";
    import { saveRestorePagePosition } from "./libs/utils";
    import UpgradeBar from "./UpgradeBar.svelte";
    import { lastVerifyResult } from "./libs/user";
    import { tomatoSettingsOpenHK } from ".";
    import { ScheduleCopyID } from "./Schedule";
    import { addFoldCmd折叠, addFoldCmd展开 } from "./fold";
    import { SPACE } from "./libs/gconst";
    import { searchSettings } from "./libs/ui";
    import ConfEditor from "./ConfEditor.svelte";
    import ConfFloatingBall from "./ConfFloatingBall.svelte";
    import ConfExport from "./ConfExport.svelte";
    import ConfClock from "./ConfClock.svelte";
    import ConfBacklink from "./ConfBacklink.svelte";
    import ConfCards from "./ConfCards.svelte";
    import ConfBlocks from "./ConfBlocks.svelte";
    import ConfMindWire from "./ConfMindWire.svelte";
    import ConfDailyNote from "./ConfDailyNote.svelte";
    import ConfMisc from "./ConfMisc.svelte";
    interface Props {
        dm: DestroyManager;
        plugin: BaseTomatoPlugin;
        /** header Pro 徽标节点（□3）：激活态回写窗口内由 $effect 接管显隐 */
        proBadge?: HTMLElement;
    }

    let { dm, plugin = $bindable(), proBadge }: Props = $props();
    let settingsDiv: HTMLElement = $state();
    let searchInput: HTMLElement = $state();
    // 初值取 verify 懒缓存（cssStyle 等启动链通常已验证），未验证时 UpgradeBar onMount
    // verify 纠正回写——已激活用户开面板不闪状态条（与渐进面板同款防闪）
    let codeValid = $state(lastVerifyResult() === true);
    // □3：header Pro 徽标随激活态显隐（懒缓存未命中时 UpgradeBar onMount verify 回写纠正）
    $effect(() => {
        if (proBadge) proBadge.style.display = codeValid ? "" : "none";
    });
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
    <!-- 付费状态条（□1）：未激活一行入口，点击弹统一解锁框；已激活整条不渲染 -->
    <UpgradeBar
        product="tomato"
        bind:codeValid
        onActivated={() => plugin.saveData(STORAGE_SETTINGS, plugin.settingCfg)}
    ></UpgradeBar>
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
            <div class="section-title">{tomatoI18n.快捷键如有冲突请调整}<ConfHelpIcon token="XyFPdPBbsol477xl5TFcX9Ttn2e" /></div>
            <div>
                {tomatoSettingsOpenHK.langText()}<HotkeyCap hk={tomatoSettingsOpenHK} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {ScheduleCopyID.langText() + SPACE}<HotkeyCap hk={ScheduleCopyID} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {addFoldCmd折叠.langText()}<HotkeyCap hk={addFoldCmd折叠} pluginName="sy-tomato-plugin"></HotkeyCap>
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
    <section class="conf-group"><ConfBlocks {codeValid}></ConfBlocks></section>
    <section class="conf-group"><ConfMindWire {codeValid}></ConfMindWire></section>
    <section class="conf-group"><ConfDailyNote {codeValid}></ConfDailyNote></section>
    <section class="conf-group"><ConfMisc {codeValid}></ConfMisc></section>
    <!-- save（□3）：52px sticky footer 收底，主色「保存并关闭」（原面板末位 outline 保存行退役） -->
    <div class="settings-footer">
        <button class="b3-button tomato-save-btn" onclick={save}>{tomatoI18n.保存并关闭}</button>
    </div>
</div>
