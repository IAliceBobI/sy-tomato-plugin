<script lang="ts">
    // 多插件设置面板共用「AI 接入（MCP）」引导卡骨架（mcpcopy 战役 2026-09-11）：番茄/渐进/
    // 仿写各自设置导航的「AI 接入」独立域内渲染（2026-09-12 二期自 UpgradeBar 后顶部通栏迁入，
    // bear：通栏占空间）——说明 + 一键复制自接线提示词 + 打开接入指南。
    // 2026-09-14 按 plugin prop 分化：说明文案与提示词第 4 步只讲当前插件的事（此前三插件
    // 同一份混文案+番茄特化提示词，归属错误）。跨插件相对导入同 UpgradeBar/IndexConf.css
    // 先例（构建期打进各插件 bundle）；文案走 tomatoI18n（本文件加键），提示词与指南 URL
    // 走 libs/mcpGuide.ts。
    import { tomatoI18n } from "./tomatoI18n";
    import { copyToClipboard } from "./libs/domUtils";
    import { siyuan } from "./libs/siyuanApi";
    import { MCP_GUIDE_URL, mcpSetupPrompt, type McpPluginKind } from "./libs/mcpGuide";

    interface Props {
        /** 面板归属插件：决定说明文案与提示词第 4 步讲谁（缺省番茄，兼容不传的旧调用点） */
        plugin?: McpPluginKind;
    }
    let { plugin = "tomato" }: Props = $props();

    const desc = $derived(
        plugin === "progressive" ? tomatoI18n.MCP接入说明渐进
        : plugin === "recite" ? tomatoI18n.MCP接入说明仿写
        : plugin === "project" ? tomatoI18n.MCP接入说明项目
        : tomatoI18n.MCP接入说明番茄);

    async function copyPrompt() {
        const ok = await copyToClipboard(mcpSetupPrompt(tomatoI18n.lang, plugin));
        await siyuan.pushMsg(ok ? tomatoI18n.MCP提示词已复制 : tomatoI18n.MCP复制失败请重试, 2500);
    }
    function openGuide() {
        window.open(MCP_GUIDE_URL, "_blank");
    }
</script>

<div class="settingBox mcp-promo">
    <div class="section-title">{tomatoI18n.MCP接入}</div>
    <div class="mcp-desc">{desc}</div>
    <!-- 手动接线地址说明（09-14 bear 反馈：URL 从哪来得说清，不能只让用户贴） -->
    <div class="mcp-url">{tomatoI18n.MCP接线地址说明}</div>
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
    .mcp-promo .mcp-url {
        font-size: 12px;
        line-height: 1.7;
        color: var(--b3-theme-on-surface); /* 操作说明行 AA 对比，与 desc 同标准 */
        margin-top: 4px;
        word-break: normal; /* URL 拉丁串不拦腰断行（同上裁决） */
    }
    .mcp-promo .mcp-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
    }
</style>
