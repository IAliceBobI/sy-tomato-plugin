<script lang="ts">
    // 知识库域（knowledgebox □9，bear 拍板 A1「同一个功能的东西都在一起」）：左导航独立域，
    // 两卡收敛——功能卡自功能仓库域 ConfVault 迁入（总开关/右键菜单+快捷键/自动同步间隔）、
    // 通道卡自 AI 助手域 ConfAgent 迁入（Key/库名/连通测试/费率）。域常驻显示：总开关只管
    // 功能不管域；细节行跟开关走（迁入前形态原样）。
    import {
        knowledgeBoxCheckbox,
        knowledgeMenu,
        knowledgeAutoSyncMin,
        zhipuApiKey,
        zhipuKbName,
    } from "./libs/stores";
    import { KnowledgeBox知识库面板 } from "./KnowledgeBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { createDefaultChannel } from "./libs/knowledgeChannel";
    import HotkeyCap from "./HotkeyCap.svelte";

    let testing = $state(false);
    let testResult = $state("");
    let testOk = $state(false);

    // 测试前显式落盘（bind 只写内存，搭车落盘不等靠）：Key 粘贴完直接点测试的场景重启不丢
    async function onTest() {
        if (testing) return;
        testing = true;
        testResult = "";
        try {
            await zhipuApiKey.write();
            await zhipuKbName.write();
            const r = await createDefaultChannel().test();
            testOk = r.ok;
            testResult = r.message;
        } catch (e: any) {
            testOk = false;
            testResult = e?.message ?? String(e);
        } finally {
            testing = false;
        }
    }
</script>

<!-- 知识库功能卡（自功能仓库域 ConfVault 迁入）：同步管理+问答双区 dock 面板的总开关与入口 -->
<div class="settingBox">
    <div class="section-title">
        <input type="checkbox" class="b3-switch" bind:checked={$knowledgeBoxCheckbox} />
        {tomatoI18n.知识库同步}
    </div>
    {#if $knowledgeBoxCheckbox}
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$knowledgeMenu} />
            {tomatoI18n.menu添加右键菜单}: {tomatoI18n.同步到知识库}
            <HotkeyCap hk={KnowledgeBox知识库面板} pluginName="sy-tomato-plugin"></HotkeyCap>
        </div>
        <div>
            <input class="b3-text-field" style="width:48px" bind:value={$knowledgeAutoSyncMin} />
            {tomatoI18n.自动同步间隔分钟}
        </div>
    {/if}
</div>
<!-- 知识库通道（自 AI 助手域 ConfAgent 迁入，knowledgebox □3 原案）：配置面少而清晰（bear 深夜
     拍板「MCP 一句话配置」铺路=Key 一项+可选库名）；不做注册引导、不引导用户去外部注册——用户
     自己有 Key 直接填；费率透明=卡内说明+「查规则」信息链接（非注册引导） -->
<div class="settingBox">
    <div class="section-title">{tomatoI18n.知识库通道}</div>
    <div>{tomatoI18n.知识库通道说明}</div>
    <div>
        <input class="b3-text-field" style="width: 100%" type="password" placeholder="{tomatoI18n.APIKey}"
            bind:value={$zhipuApiKey} spellcheck="false" autocomplete="off" />
    </div>
    <!-- 前置入口直达（bear 09-15：注册/建 Key 全链跳转便利——链接≠接管链路，注册与充值仍用户自理） -->
    <div class="kb-links">
        <a class="kb-link" href="https://bigmodel.cn/login" target="_blank">{tomatoI18n.注册账户}</a>
        <a class="kb-link" href="https://bigmodel.cn/apikey/platform" target="_blank">{tomatoI18n.创建APIKey}</a>
    </div>
    <div>
        <input class="b3-text-field" style="width: 100%" placeholder="{tomatoI18n.库名可选提示}"
            bind:value={$zhipuKbName} spellcheck="false" />
    </div>
    <div class="fn__flex" style="align-items: center; gap: 8px; flex-wrap: wrap">
        <button class="b3-button b3-button--small" disabled={testing} onclick={onTest}>{tomatoI18n.连通性测试}</button>
        {#if testing}
            <span class="kb-test-result">{tomatoI18n.测试中}</span>
        {:else if testResult}
            <span class="kb-test-result" class:kb-test-ok={testOk} class:kb-test-fail={!testOk}>{testResult}</span>
        {/if}
    </div>
    <div>
        {tomatoI18n.知识库费率说明}
        <a class="kb-price-link" href="https://docs.bigmodel.cn/cn/guide/tools/knowledge/price" target="_blank">{tomatoI18n.查看平台计费规则}</a>
    </div>
    <!-- 控制台直达（bear 09-15）：已同步的库与文件在平台侧可见可管 -->
    <div>
        {tomatoI18n.已同步内容查看说明}
        <a class="kb-price-link" href="https://bigmodel.cn/console/appcenter_v1/knowledge" target="_blank">{tomatoI18n.打开知识库控制台}</a>
    </div>
</div>

<style>
    .kb-test-result { font-size: 12px; color: var(--b3-theme-on-surface-light); word-break: break-all; }
    /* 链接不跨行断裂（vision P1-5：折成两半不可辨识） */
    .kb-price-link { white-space: nowrap; }
    /* 前置入口链接行：12px 小字平铺两链（信息平铺不藏 hover）；亮色 primary 压线加深一档
       （与成功色同款，暗色原值对比充足不动） */
    .kb-links { display: flex; gap: 12px; }
    .kb-link { font-size: 12px; color: var(--b3-theme-primary); }
    :global(html[data-theme-mode="light"]) .kb-link { color: color-mix(in srgb, var(--b3-theme-primary) 85%, black); }
    /* 成功结果 12px 小字：亮色 primary 3.7:1 压线，加深一档（暗色原值对比充足不动） */
    .kb-test-ok { color: var(--b3-theme-primary); }
    :global(html[data-theme-mode="light"]) .kb-test-ok { color: color-mix(in srgb, var(--b3-theme-primary) 85%, black); }
    .kb-test-fail { color: var(--b3-theme-error); }
</style>
