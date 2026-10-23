<script lang="ts">
    // 分区标题旁的分篇帮助直达入口（2026-09-02 恢复）：744ac60b 帮助收敛删光了 32 处
    // 「帮助」文字链接、分篇无直达，本组件为其新形态——iconHelp 小图标 + 内核 b3-tooltips
    // 自绘气泡（勿用原生 title），点击 openHelpDialog 插件内弹窗秒开分篇快照（无快照回落飞书）。
    import tomatoHelpDocs from "./help.json";
    import { openHelpDialog, type HelpDoc } from "./libs/helpDialog";
    import { tomatoI18n } from "./tomatoI18n";

    // helpDocs 可选（2026-10-22）：跨插件调用点传自家 help.json 快照（McpPromo 透传链）；
    // 缺省回落 tomato 快照——本插件调用点不传行为不变。注意缺省对 undefined 也生效
    // （Svelte 5 解构默认值语义），显式传 undefined 同样回落。
    let {
        token,
        helpDocs = tomatoHelpDocs,
    }: { token: string; helpDocs?: Record<string, HelpDoc> } = $props();
    // token 是一次性 props（挂载时分篇文档 id 定死不响应变化），模板字符串取初始值是故意的
    // svelte-ignore state_referenced_locally
    const url = `https://my.feishu.cn/docx/${token}?from=from_copylink`;
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
