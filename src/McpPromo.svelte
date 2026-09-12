<script lang="ts">
    // 三插件设置面板共用「AI 接入（MCP）」引导卡（mcpcopy 战役 2026-09-11）：番茄/渐进/仿写
    // 各自设置导航的「AI 接入」独立域内渲染（2026-09-12 二期自 UpgradeBar 后顶部通栏迁入，
    // bear：通栏占空间）——说明 + 一键复制自接线提示词 + 打开接入指南。
    // 跨插件相对导入同 UpgradeBar/IndexConf.css 先例（构建期打进各插件 bundle）；
    // 文案走 tomatoI18n（本文件加键），提示词与指南 URL 走 libs/mcpGuide.ts。
    import { tomatoI18n } from "./tomatoI18n";
    import { copyToClipboard } from "./libs/domUtils";
    import { siyuan } from "./libs/siyuanApi";
    import { MCP_GUIDE_URL, mcpSetupPrompt } from "./libs/mcpGuide";

    async function copyPrompt() {
        const ok = await copyToClipboard(mcpSetupPrompt(tomatoI18n.lang));
        await siyuan.pushMsg(ok ? tomatoI18n.MCP提示词已复制 : tomatoI18n.MCP复制失败请重试, 2500);
    }
    function openGuide() {
        window.open(MCP_GUIDE_URL, "_blank");
    }
</script>

<div class="settingBox mcp-promo">
    <div class="section-title">{tomatoI18n.MCP接入}</div>
    <div class="mcp-desc">{tomatoI18n.MCP接入说明}</div>
    <div class="mcp-actions">
        <button class="b3-button" onclick={copyPrompt}>{tomatoI18n.MCP复制提示词}</button>
        <button class="b3-button" onclick={openGuide}>{tomatoI18n.MCP打开接入指南}</button>
    </div>
</div>

<style>
    .mcp-promo .mcp-desc {
        font-size: 12px;
        line-height: 1.7;
        color: var(--b3-theme-on-surface);
        /* 思源 .b3-dialog__content 自带 word-break:break-all 被整段继承——ZCode/CodeBuddy
           等英文产品名被拦腰断行（vision 09-12 实证）；normal 恢复默认：CJK 字间照常
           断行不溢出，拉丁词整词不拆（同 IndexConf.css .kbd 块 R5 □4 先例） */
        word-break: normal;
    }
    .mcp-promo .mcp-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
    }
</style>
