<script lang="ts">
    // 知识库面板（knowledgebox □3）：双区=上「同步管理」+下「知识库问答」。
    // 通道走 libs/knowledgeChannel（智谱首发，□2 拍板；Coze 已下架）：同步=hash 增量闸+
    // adapter uploadDoc 幂等重建；问答=adapter ask（ReAct SSE 流式渲染）。单会话内存态。
    import { onMount } from "svelte";
    import { getTomatoPluginInstance } from "./libs/utils";
    import { createFrontendToolEnv } from "./agentToolBridge";
    import { loadKS, removeFromSync, syncAll, checkChanges, isSyncBusy, type KSyncData, type SyncProgress } from "./libs/knowledgeSync";
    import { createDefaultChannel } from "./libs/knowledgeChannel";
    import { kbTreeMarkRefresh } from "./KnowledgeTreeMark";
    import { renderMD } from "./libs/mdRender";
    import { zhipuApiKey } from "./libs/stores";
    import { tomatoI18n } from "./tomatoI18n";

    let data = $state<KSyncData>({ list: [], state: {} });
    let busy = $state(false);          // 同步/检查进行中
    let progress = $state("");         // 同步进度行
    let askBusy = $state(false);
    let askInput = $state("");
    let msgs = $state<{ role: "user" | "assistant"; text: string }[]>([]);
    let msgsEl: HTMLDivElement | undefined = $state();

    const env = createFrontendToolEnv(getTomatoPluginInstance() as any);
    const channel = createDefaultChannel();

    // 配置就绪随 Key store 响应（vision 二审 P1：mount 时 Key 空 → ready 钉死，填完 Key 仍灰）。
    // 必须走 $store 自动订阅派生——$effect 里裸 .get() 在 Svelte 5 被 untrack 包住不注册依赖
    // （review P1-1 实锤），设置热更只 set store 不重挂面板，effect 永不重跑
    let channelReady = $derived(($zhipuApiKey ?? "").trim() !== "");

    async function refresh() {
        data = await loadKS();
    }

    onMount(refresh);

    async function onSyncAll() {
        if (busy) return;
        busy = true;
        progress = "";
        try {
            const r = await syncAll(env, channel, (p: SyncProgress) => {
                progress = `${p.done}/${p.total} · ${p.title}${p.ok ? "" : ` ✗ ${p.err ?? ""}`}`;
            });
            progress = `${tomatoI18n.同步完成}：${tomatoI18n.更新} ${r.ok} · ${tomatoI18n.跳过} ${r.skip} · ${tomatoI18n.失败} ${r.fail}`;
            data = await loadKS();
            kbTreeMarkRefresh();
        } catch (e: any) {
            progress = `${e?.message ?? e}`;
        } finally {
            busy = false;
        }
    }

    async function onCheck() {
        if (busy) return;
        busy = true;
        progress = "";
        try {
            data = await checkChanges(env);
            kbTreeMarkRefresh();
        } finally {
            busy = false;
        }
    }

    async function onRemove(docID: string) {
        // 同步进行中禁移除（review P1-3：syncAll 循环里 saveKS 会用旧实例整体覆盖落盘，
        // 把刚移除的文档复活回白名单）；autoTimer 后台同步不置面板 busy——补 isSyncBusy（review P0-1）
        if (busy || isSyncBusy()) return;
        data = await removeFromSync([docID]);
        kbTreeMarkRefresh();
    }

    function scrollMsgs() {
        requestAnimationFrame(() => msgsEl?.scrollTo({ top: msgsEl.scrollHeight }));
    }

    async function onAsk() {
        const q = askInput.trim();
        if (!q || askBusy || !channelReady) return;
        askInput = "";
        msgs = [...msgs, { role: "user", text: q }, { role: "assistant", text: "" }];
        askBusy = true;
        scrollMsgs();
        const idx = msgs.length - 1;
        // 流式渲染节流（review P2：每 delta 全量 Md2HTML=O(n²)，长答案卡顿）：200ms 合并一帧
        let pending = "";
        let flushTimer: ReturnType<typeof setTimeout> | undefined;
        const flush = () => {
            flushTimer = undefined;
            if (!pending) return;
            msgs[idx] = { role: "assistant", text: (msgs[idx]?.text ?? "") + pending };
            pending = "";
            msgs = [...msgs];
            scrollMsgs();
        };
        try {
            // 流式：answer 增量实时上屏；返回值=done 全量（剥引用标签），终态覆盖防半截标签
            const answer = await channel.ask(q, delta => {
                pending += delta;
                if (flushTimer === undefined) flushTimer = setTimeout(flush, 200);
            });
            if (flushTimer !== undefined) clearTimeout(flushTimer);
            flush();
            const text = answer.trim() || "（知识库没有回答，换个问法试试）";
            msgs[idx] = { role: "assistant", text };
        } catch (e: any) {
            if (flushTimer !== undefined) clearTimeout(flushTimer);
            flush();
            msgs[idx] = { role: "assistant", text: `✗ ${e?.message ?? e}` };
        } finally {
            msgs = [...msgs];
            askBusy = false;
            scrollMsgs();
        }
    }

    function stateBadge(docID: string): { text: string; cls: string; tip?: string } {
        const s = data.state[docID];
        if (!s) return { text: tomatoI18n.未同步, cls: "none" };
        if (!s.ok) return { text: `${tomatoI18n.同步失败}`, cls: "fail", tip: s.err ?? "" };
        if (s.changed) return { text: tomatoI18n.待同步, cls: "chg" };
        const t = new Date(s.syncedAt);
        const hh = String(t.getHours()).padStart(2, "0");
        const mm = String(t.getMinutes()).padStart(2, "0");
        // ok 态缩短为纯时间（vision P1-2：窄面板行内元素挤标题；颜色语义+tooltip 已表达「已同步」）
        return { text: `${hh}:${mm}`, cls: "ok", tip: `${tomatoI18n.已同步} ${hh}:${mm}` };
    }
</script>

<div class="kb-panel fn__flex-column">
    <!-- ── 上区：同步管理（区标题省略——dock tab 头已是「知识库同步」，相邻同名重复=□1 vision P2②） ── -->
    <div class="kb-sync fn__flex-column">
        <div class="kb-head">
            <span class="fn__flex-1"></span>
            <!-- 主次权重：立即同步=实心主按钮、检查变更=outline 次按钮（□1 vision P2①；
                 b3-button 基类默认主色实心，显式弱化的是次要动作） -->
            <button class="b3-button b3-button--small b3-button--outline" disabled={busy} onclick={onCheck}
                title={tomatoI18n.检查变更}>{tomatoI18n.检查变更}</button>
            <button class="b3-button b3-button--small" disabled={busy || !channelReady}
                onclick={onSyncAll}>{busy ? tomatoI18n.正在同步 : tomatoI18n.立即同步}</button>
        </div>
        {#if !channelReady}
            <div class="kb-warn">{tomatoI18n.知识库通道未配置}</div>
        {/if}
        <div class="kb-list fn__flex-1">
            {#if data.list.length === 0}
                <div class="kb-empty">{tomatoI18n.同步白名单为空}</div>
            {:else}
                {#each data.list as item (item.docID)}
                    {@const badge = stateBadge(item.docID)}
                    {@const st = data.state[item.docID]}
                    <div class="kb-row">
                        <span class="kb-dot kb-dot--{badge.cls}"></span>
                        <span class="kb-name" title={item.hpath}>{item.title}</span>
                        {#if st && ((st.childCount ?? 0) > 1 || (st.excludedCount ?? 0) > 0)}
                            <!-- 文件夹条目（□8）：childCount=实际同步篇数（含根），排除后自动缩水。
                                 紧凑无空格形态（vision P1-2：dock 窄面板里空格+全宽徽章把标题挤瘪）；
                                 childCount=0 且排除>0=内容全被排除（平台副本已 purge）也展示（review P1-2 配套） -->
                            <span class="kb-folder">
                                <svg class="kb-folder__icon"><use xlink:href="#iconFolder"></use></svg>{st.childCount ?? 0}{tomatoI18n.篇}{#if (st.excludedCount ?? 0) > 0}<span class="kb-folder__excl">·{tomatoI18n.排除}{st.excludedCount}</span>{/if}
                            </span>
                        {/if}
                        <span class="kb-badge kb-badge--{badge.cls}" class:b3-tooltips={!!badge.tip}
                            class:b3-tooltips__nw={!!badge.tip} aria-label={badge.tip ?? undefined}>{badge.text}</span>
                        <span class="kb-icon b3-tooltips b3-tooltips__nw" aria-label={tomatoI18n.移除} class:kb-icon--off={busy}
                            role="button" tabindex="0" onclick={() => onRemove(item.docID)}
                            onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRemove(item.docID); } }}>✕</span>
                    </div>
                {/each}
            {/if}
        </div>
        {#if progress}
            <div class="kb-progress">{progress}</div>
        {/if}
    </div>

    <!-- ── 下区：知识库问答 ── -->
    <div class="kb-ask fn__flex-column">
        <div class="kb-head">
            <span class="kb-title">{tomatoI18n.向知识库提问}</span>
        </div>
        <div class="kb-msgs fn__flex-1" bind:this={msgsEl}>
            {#if msgs.length === 0}
                <div class="kb-empty">{tomatoI18n.问答提示}</div>
            {:else}
                {#each msgs as m, i (i)}
                    {#if m.role === "assistant" && !m.text && askBusy && i === msgs.length - 1}
                        <!-- 流式首增量前的空窗：占位 typing（reasoning 阶段数秒） -->
                        <div class="kb-msg kb-msg--assistant kb-typing">…</div>
                    {:else if m.role === "assistant"}
                        <!-- 回答走 md 渲染（**加粗**/列表/代码），流式半截解析失败回退纯文本 -->
                        <div class="kb-msg kb-msg--assistant kb-md">{@html renderMD(m.text) || m.text}</div>
                    {:else}
                        <div class="kb-msg kb-msg--{m.role}">{m.text}</div>
                    {/if}
                {/each}
            {/if}
        </div>
        <div class="kb-inputrow">
            <textarea class="b3-text-field fn__flex-1" rows="2" bind:value={askInput}
                placeholder={tomatoI18n.向知识库提问}
                onkeydown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); onAsk(); } }}></textarea>
            <button class="b3-button b3-button--small" disabled={askBusy || !channelReady}
                onclick={onAsk}>{tomatoI18n.发送}</button>
        </div>
    </div>
</div>

<style>
    /* dock 高度塌缩家族防御：kb-panel 在 flex-column 挂载点里用 flex:1 接管（height:100%
       在 flex 拉伸容器里不解析，踩坑索引 dock 两连环同款） */
    .kb-panel { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
    /* 上下区 45:55 用 flex-grow 比例分：flex-basis 百分比在 dock 的 block 内容链里
       退化成内容高（容器高度非 definite，实测 147px≈列表内容），grow 比例不依赖 definite */
    .kb-sync { flex: 45 1 0; min-height: 120px; border-bottom: 1px solid var(--b3-border-color); display: flex; flex-direction: column; }
    .kb-ask { flex: 55 1 0; min-height: 0; }
    .kb-head {
        display: flex; align-items: center; gap: 4px;
        padding: 4px 8px; border-bottom: 1px solid var(--b3-border-color);
    }
    .kb-title { font-weight: 500; color: var(--b3-theme-on-background); }
    .kb-warn {
        margin: 4px 8px; padding: 4px 8px; border-radius: var(--b3-border-radius);
        background: color-mix(in srgb, var(--b3-theme-secondary) 12%, transparent);
        color: var(--b3-theme-on-background); font-size: 12px;
    }
    /* 亮色压线 4.4:1 加深一档（vision 二审 P2） */
    :global(html[data-theme-mode="light"]) .kb-warn { color: #5f5f5f; }
    .kb-list { overflow-y: auto; padding: 2px 4px; }
    .kb-empty {
        padding: 12px; text-align: center; font-size: 12px;
        color: var(--b3-theme-on-surface-light); white-space: pre-line;
        margin-block: auto; /* 空态垂直居中：在 kb-msgs（flex 列）里生效；上区 kb-list 非 flex 容器无影响 */
    }
    .kb-row {
        display: flex; align-items: center; gap: 6px;
        padding: 3px 6px; border-radius: var(--b3-border-radius);
    }
    .kb-row:hover { background: var(--b3-list-hover); }
    .kb-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--b3-theme-on-surface-light); }
    .kb-dot--ok { background: var(--b3-theme-primary); }
    .kb-dot--chg { background: var(--b3-theme-secondary); }
    .kb-dot--fail { background: var(--b3-theme-error); }
    .kb-dot--none { background: transparent; border: 1.5px solid var(--b3-theme-on-surface-light); }
    .kb-name {
        flex: 1; min-width: 56px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        font-size: 12px; cursor: default;
    }
    /* 徽章文字与圆点双重色彩编码（vision P1：窄面板里 7px 点不够扫读） */
    .kb-badge { flex: none; font-size: 11px; color: var(--b3-theme-on-surface-light); }
    .kb-badge--ok { color: var(--b3-theme-primary); }
    .kb-badge--chg { color: var(--b3-theme-secondary); }
    .kb-badge--fail { color: var(--b3-theme-error); }
    /* 文件夹条目徽章（□8）：sprite 图标+篇数；排除数同位次级展示 */
    .kb-folder {
        flex: none; display: inline-flex; align-items: center; gap: 2px;
        font-size: 11px; color: var(--b3-theme-on-surface-light);
        padding: 1px 4px; border-radius: var(--b3-border-radius);
        background: color-mix(in srgb, var(--b3-theme-on-surface-light) 10%, transparent);
    }
    .kb-folder__icon { width: 12px; height: 12px; flex: none; }
    /* 排除数中性灰（vision P2：secondary 橙与「待同步」状态橙同排撞色——橙色留给同步状态语义） */
    .kb-folder__excl { color: var(--b3-theme-on-surface-light); }
    :global(html[data-theme-mode="light"]) .kb-folder { color: #6f7377; }
    .kb-icon {
        flex: none; cursor: pointer; font-size: 11px; line-height: 1;
        padding: 7px 7px; margin: -5px -5px -5px 0; border-radius: var(--b3-border-radius);
        color: var(--b3-theme-on-surface-light);
    }
    .kb-icon:hover { color: var(--b3-theme-error); background: var(--b3-list-hover); }
    .kb-icon--off { opacity: 0.4; pointer-events: none; }
    .kb-progress {
        padding: 2px 8px 4px; font-size: 11px;
        color: var(--b3-theme-on-surface-light);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    /* 亮色下 on-surface-light ≈3.0:1 不达标（11px 小字需 4.5），加深一档；暗色原值 ≈8:1 不动 */
    :global(html[data-theme-mode="light"]) .kb-progress { color: #6f7377; }
    .kb-msgs { overflow-y: auto; padding: 6px 8px; display: flex; flex-direction: column; gap: 6px; }
    .kb-msg {
        padding: 5px 8px; border-radius: var(--b3-border-radius); font-size: 12px;
        white-space: pre-wrap; word-break: break-word; line-height: 1.5;
    }
    .kb-msg--user {
        align-self: flex-end; max-width: 85%;
        background: var(--b3-theme-primary-lightest); color: var(--b3-theme-on-background);
    }
    .kb-msg--assistant {
        align-self: flex-start; max-width: 95%;
        background: var(--b3-theme-surface); border: 1px solid var(--b3-border-color);
    }
    .kb-typing { color: var(--b3-theme-on-surface-light); }
    /* markdown 正文排版（AgentPanel agent-panel__md 同款）：列表圆点悬挂/代码块不撑爆 */
    .kb-md :global(p) { margin: 4px 0; }
    .kb-md :global(ul), .kb-md :global(ol) { padding-left: 20px; margin: 4px 0; }
    .kb-md :global(li) { margin: 2px 0; }
    .kb-md :global(pre) {
        background: var(--b3-theme-background); border-radius: 4px;
        padding: 6px 8px; overflow-x: auto; margin: 4px 0;
    }
    .kb-md :global(code) { font-size: 12px; }
    .kb-md :global(pre code) { font-family: var(--b3-font-family-code); }
    .kb-inputrow { display: flex; align-items: flex-end; gap: 4px; padding: 4px 10px 10px; }
    .kb-inputrow textarea { resize: none; font-size: 12px; }
</style>
