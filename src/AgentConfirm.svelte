<script lang="ts">
    // □6 人审确认弹窗（AgentPanel 确认闸的 UI）：edit=行级 diff 预览（红删绿增）；
    // run_js=代码人审+可选「存为命令并运行」（固化仓库入口）。resolve 回布尔/名字，随关窗兑现。
    import { lineDiff } from "./libs/agentTools/agentDiff";
    import { tomatoI18n } from "./tomatoI18n";

    interface Props {
        kind: "edit" | "run_js";
        /** edit：旧块内容 */
        oldText?: string;
        /** edit：新块内容 */
        newText?: string;
        /** run_js：待审代码 */
        code?: string;
        /** 关窗兑现：edit/run_js=boolean（true=放行）；run_js 存命令="save:"+名字 */
        resolve: (v: boolean | string) => void;
    }
    let { kind, oldText = "", newText = "", code = "", resolve }: Props = $props();

    const diff = $derived(lineDiff(oldText, newText));
    let scriptName = $state("");

    function settle(v: boolean | string) {
        resolve(v);
    }
</script>

<div class="agent-confirm">
    {#if kind === "edit"}
        <div class="agent-confirm__title">{tomatoI18n.AI编辑确认}</div>
        <div class="agent-confirm__diff">
            {#each diff as line}
                <div class="agent-confirm__line agent-confirm__line--{line.type}">{line.type === "del" ? "- " : line.type === "add" ? "+ " : "  "}{line.text}</div>
            {/each}
        </div>
        <div class="agent-confirm__btns">
            <button class="b3-button b3-button--outline" onclick={() => settle(false)}>{tomatoI18n.拒绝修改}</button>
            <button class="b3-button" onclick={() => settle(true)}>{tomatoI18n.应用修改}</button>
        </div>
    {:else}
        <div class="agent-confirm__title">{tomatoI18n.AI代码确认}</div>
        <pre class="agent-confirm__code">{code}</pre>
        <div class="agent-confirm__saverow">
            <input class="b3-text-field" placeholder={tomatoI18n.脚本名占位} bind:value={scriptName} />
            <button class="b3-button b3-button--outline agent-confirm__save" onclick={() => settle("save:" + (scriptName.trim() || `脚本 ${new Date().toLocaleString()}`))}>
                {tomatoI18n.存为命令并运行}
            </button>
        </div>
        <div class="agent-confirm__btns">
            <button class="b3-button b3-button--outline" onclick={() => settle(false)}>{tomatoI18n.拒绝运行}</button>
            <button class="b3-button" onclick={() => settle(true)}>{tomatoI18n.运行代码}</button>
        </div>
    {/if}
</div>

<style>
    .agent-confirm {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        min-width: 0;
    }
    .agent-confirm__title {
        font-size: 14px;
        font-weight: bold;
    }
    .agent-confirm__diff, .agent-confirm__code {
        max-height: 50vh;
        overflow: auto;
        font-family: var(--b3-font-family-code);
        font-size: 12px;
        line-height: 1.6;
        /* 凹槽形态：代码/预览区下沉一档与弹窗底分界（vision P2） */
        background: var(--b3-theme-background);
        border: 1px solid var(--b3-border-color);
        border-radius: 4px;
        padding: 6px 8px;
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
    }
    .agent-confirm__line--del {
        background: color-mix(in srgb, var(--b3-card-error-color) 12%, transparent);
        color: var(--b3-card-error-color);
    }
    .agent-confirm__line--add {
        /* 红绿对称（vision P1）：新增=success 双属性，与删除行完全镜像 */
        background: color-mix(in srgb, var(--b3-card-success-color) 12%, transparent);
        color: var(--b3-card-success-color);
    }
    .agent-confirm__line--ctx {
        color: var(--b3-theme-on-surface-light);
    }
    .agent-confirm__saverow {
        display: flex;
        gap: 6px;
    }
    .agent-confirm__saverow input {
        flex: 1;
        min-width: 0;
    }
    .agent-confirm__btns {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }
    /* 存为命令=次级复合动作，降中性灰与否定键区分（vision P2） */
    .agent-confirm__save {
        border-color: var(--b3-border-color);
        color: var(--b3-theme-on-surface);
    }
</style>
