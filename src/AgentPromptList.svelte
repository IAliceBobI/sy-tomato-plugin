<script lang="ts">
    // agentrev □5 提示词管理列表（ConfAgent 提示词卡）：存储=「AI 助手提示词仓库」文档的
    // agent-prompt 块（零常驻——不进上下文不占设置），每条注册为命令「AI助手·名称」点名触发。
    // 新增即时注册命令免重载（agentBox.registerPromptCommand）；删除=删块（命令残留至重载，
    // 触发时报失效）；改块内容即时生效（命令回调现读块）。
    import { onMount } from "svelte";
    import { siyuan } from "./libs/utils";
    import { debugLog } from "./libs/logUtils";
    import { tomatoI18n } from "./tomatoI18n";
    import { agentBox } from "./AgentBox";
    import {
        AGENT_PROMPT_DOC_TITLE,
        buildAgentPromptContent,
        findAgentPromptDocID,
        parseAgentPromptContent,
    } from "./libs/agentScriptBlock";

    interface PromptEntry {
        id: string;
        name: string;
        prompt: string;
    }

    let entries = $state<PromptEntry[]>([]);
    let newName = $state("");
    let newPrompt = $state("");
    let adding = $state(false);

    async function load() {
        try {
            const docID = await findAgentPromptDocID();
            if (!docID) {
                entries = [];
                return;
            }
            const rows = await siyuan.sql(
                `select id, content from blocks where root_id='${docID}' and markdown like '%agent-prompt%' order by id`,
            );
            const out: PromptEntry[] = [];
            for (const row of rows ?? []) {
                const d = parseAgentPromptContent(String(row.content ?? ""));
                if (d) out.push({ id: String(row.id), name: d.name, prompt: d.prompt });
            }
            entries = out;
        } catch (e) {
            debugLog("agent_conf", `load prompts failed: ${e}`, "aiagent");
        }
    }

    onMount(() => { void load(); });

    async function add() {
        const name = newName.trim();
        const prompt = newPrompt.trim();
        if (!name || !prompt || adding) return;
        adding = true;
        try {
            let docID = await findAgentPromptDocID();
            if (!docID) {
                // 仓库文档缺则首建（saveScript 同款：默认笔记本根+写后立查索引延迟窗口）
                const notebooks = await siyuan.lsNotebooks(false);
                const notebook = (notebooks ?? []).find((n: any) => !n.closed);
                if (!notebook) {
                    await siyuan.pushMsg(tomatoI18n.提示词保存失败, 2500);
                    return;
                }
                docID = await siyuan.createDocWithMd(notebook.id, "/" + AGENT_PROMPT_DOC_TITLE, "");
                await new Promise(r => setTimeout(r, 1200));
            }
            const r = await siyuan.appendBlock(
                buildAgentPromptContent({ v: 1, name, prompt, ts: Date.now() }), docID);
            // md 通道插块真实块 ID 只能从响应 doOperations[0].id 取（bookmark.ts 同款）
            const ops = (Array.isArray(r) ? r?.[0] : r) as any;
            const blockID = ops?.doOperations?.[0]?.id;
            if (blockID) {
                agentBox.registerPromptCommand(String(blockID), name);
                // 乐观入列（append 后立查 SQL 撞索引延迟窗口会假空——响应里已有 id+原文，无需重查）
                entries = [...entries, { id: String(blockID), name, prompt }];
            } else {
                await load();
            }
            newName = "";
            newPrompt = "";
        } catch (e) {
            debugLog("agent_conf", `add prompt failed: ${e}`, "aiagent");
            await siyuan.pushMsg(tomatoI18n.提示词保存失败, 2500);
        } finally {
            adding = false;
        }
    }

    async function remove(id: string) {
        try {
            await siyuan.deleteBlock(id);
            // 乐观出列（删后立查同样撞索引延迟窗口）；命令残留至重载，触发时报失效
            entries = entries.filter(e => e.id !== id);
        } catch (e) {
            debugLog("agent_conf", `remove prompt failed: ${e}`, "aiagent");
        }
    }
</script>

<div class="agentprompts">
    {#if entries.length}
        <div class="agentprompts__list">
            {#each entries as e (e.id)}
                <div class="agentprompts__row">
                    <div class="agentprompts__head">
                        <span class="agentprompts__name" title={e.name}>{e.name}</span>
                        <span class="fn__flex-1"></span>
                        <span class="b3-tooltips b3-tooltips__sw agentprompts__del block__icon block__icon--show"
                              aria-label={tomatoI18n.删除} role="button" tabindex="0"
                              onclick={() => remove(e.id)}
                              onkeydown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); remove(e.id); } }}>
                            <svg><use xlink:href="#iconClose"></use></svg>
                        </span>
                    </div>
                    <div class="agentprompts__text" title={e.prompt}>{e.prompt}</div>
                </div>
            {/each}
        </div>
    {:else}
        <div class="agentprompts__empty">{tomatoI18n.未添加提示词}</div>
    {/if}
    <div class="agentprompts__add">
        <input class="b3-text-field agentprompts__nameinput" placeholder={tomatoI18n.提示词名称占位}
               bind:value={newName} onkeydown={(e) => { if (e.key === "Enter") { e.preventDefault(); void add(); } }} />
        <textarea class="b3-text-field agentprompts__body" rows="2" placeholder={tomatoI18n.提示词内容占位}
                  bind:value={newPrompt} onkeydown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void add(); } }}></textarea>
        <button class="b3-button b3-button--outline agentprompts__btn" disabled={adding || !newName.trim() || !newPrompt.trim()}
                title={tomatoI18n.提示词按钮提示} onclick={() => void add()}>+ {tomatoI18n.添加提示词}</button>
    </div>
</div>

<style>
    .agentprompts {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .agentprompts__list {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .agentprompts__row {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 4px 6px;
        border-radius: var(--b3-border-radius-b, 4px);
        background: var(--b3-theme-surface);
    }
    .agentprompts__head {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 22px;
    }
    .agentprompts__name {
        font-size: 12px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .agentprompts__del {
        width: 24px;
        height: 24px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: -2px 0; /* 24px 命中区（WCAG 2.5.8）不撑高 22px 的标题行 */
    }
    .agentprompts__del svg {
        width: 13px;
        height: 13px;
    }
    .agentprompts__text {
        font-size: 12px;
        color: var(--b3-theme-on-surface-light);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        overflow: hidden;
        overflow-wrap: anywhere;
    }
    .agentprompts__empty {
        font-size: 12px;
        color: var(--b3-theme-on-surface-light);
        padding: 2px 0;
    }
    .agentprompts__add {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .agentprompts__nameinput {
        font-size: 12px;
        width: 100%; /* column flex 下 input 可 stretch，textarea 不可——显式兜齐 */
    }
    .agentprompts__body {
        font-size: 12px;
        width: 100%;
        resize: vertical;
        min-height: 44px;
    }
    .agentprompts__btn {
        align-self: flex-start;
        font-size: 12px;
    }
    .agentprompts__btn:disabled {
        opacity: .7; /* 官方 .38 叠 outline 态仅 1.5:1 近乎隐形——主动作钮可发现性优先（.7≈2.2:1） */
    }
</style>
