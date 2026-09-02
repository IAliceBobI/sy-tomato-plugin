<script lang="ts">
    // 分区标题旁的分篇帮助直达入口（2026-09-02 恢复）：744ac60b 帮助收敛删光了 32 处
    // 「帮助」文字链接、分篇无直达，本组件为其新形态——iconHelp 小图标 + 内核 b3-tooltips
    // 自绘气泡（勿用原生 title），点击 openHelpDialog 插件内弹窗秒开分篇快照（无快照回落飞书）。
    import helpDocs from "./help.json";
    import { openHelpDialog } from "./libs/helpDialog";
    import { tomatoI18n } from "./tomatoI18n";

    let { token }: { token: string } = $props();
    // token 是一次性 props（挂载时分篇文档 id 定死不响应变化），模板字符串取初始值是故意的
    // svelte-ignore state_referenced_locally
    const url = `https://awx9773btw.feishu.cn/docx/${token}?from=from_copylink`;
    const open = () => openHelpDialog(url, helpDocs);
</script>

<span
    class="b3-tooltips b3-tooltips__n conf-help-icon"
    aria-label={tomatoI18n.帮助}
    role="button"
    tabindex="0"
    onclick={open}
    onkeydown={(e: KeyboardEvent) => e.key === "Enter" && open()}
>
    <svg aria-hidden="true"><use xlink:href="#iconHelp"></use></svg>
</span>

<style>
    .conf-help-icon {
        display: inline-flex;
        align-items: center;
        margin-left: 6px;
        cursor: pointer;
        color: var(--b3-theme-on-surface-light, var(--b3-theme-on-surface));
    }
    .conf-help-icon:hover {
        color: var(--b3-theme-primary);
    }
    .conf-help-icon svg {
        width: 14px;
        height: 14px;
    }
</style>
