<script lang="ts">
    // □8 批注 AI 讨论区：轻问答起步+快捷邀请角色（形态 1）+压缩成笔记。
    // 纯函数层 libs/annoChat.ts（角色表/消息构造/内存缓存）；流式管线复用 openAI.ts
    // （appendChunk/stripThinkTag/createStreamPublic+AbortController）。
    // 视觉唯一事实源=docs/tomato-annochat-visual-spec.md（DOM 类名/数值按 §9 对照；
    // 实现差异〔props 补 annoId/source、getAnnoText 为 async、压缩按钮嵌套须工具行 div 化〕回写 spec §9）。
    // 常驻挂载不卸载（spec §0 收起语义）：收起仅 .is-closed 隐藏，流式请求与自定义角色保留。
    import { confirm } from "siyuan";
    import { aiBoxPrompts } from "./libs/stores";
    import { DialogText } from "./libs/DialogText";
    import type { DestroyManager } from "./libs/destroyer";
    import {
        ANNO_ROLES,
        buildChatMessages,
        chatHistoryOf,
        compressMessages,
        customRole,
        inviteMessage,
        pushChat,
    } from "./libs/annoChat";
    import type { AnnoChatMsg, AnnoRole } from "./libs/annoChat";
    import { OpenAIClient, appendChunk, getAIConfig, stripThinkTag } from "./libs/openAI";
    import type { StreamState } from "./libs/openAI";
    import { siyuan } from "./libs/utils";
    import { vipVerified } from "./libs/user";
    import { openUnlockDialog } from "./unlockDialog";
    import { tomatoI18n } from "./tomatoI18n";

    interface Props {
        dm: DestroyManager;
        mobile: boolean;
        /** 与 AnnoEdit.chatOpen 同源（仅控制 .is-closed） */
        open: boolean;
        annoId: string;
        /** 被批注块原文（Annotations.openEdit 剥 IAL/标记后的 kramdown） */
        source: string;
        selText: string;
        /** 上下文补强（□3）：文档 hpath + 前后相邻块（空=缺省不出段） */
        docTitle?: string;
        prev?: string;
        next?: string;
        /** 当前批注草稿文本（readDraftText 的 async 包装）——上下文 note 实时取 */
        getAnnoText: () => Promise<string>;
        /** 记录员完成：markdown 落草稿块由 AnnoEdit 实现（AI 永不直接写盘） */
        onCompressed: (markdown: string) => Promise<void>;
        /** ≥1 轮完成对话（存在非记录员 assistant 消息），桥接 AnnoEdit 压缩按钮 */
        canCompress?: boolean;
        /** 流式进行中，桥接 AnnoEdit 压缩按钮禁用 */
        busy?: boolean;
    }
    let {
        dm, mobile, open, annoId, source, selText, docTitle = "", prev = "", next = "",
        getAnnoText, onCompressed,
        canCompress = $bindable(false), busy = $bindable(false),
    }: Props = $props();

    /** 缓存消息快照（活引用不驱动 Svelte，push 后手动 refresh；annoId 弹窗生命周期不变，故意捕获初值） */
    // svelte-ignore state_referenced_locally
    let msgs = $state<AnnoChatMsg[]>([...chatHistoryOf(annoId)]);
    /** 进行中的活动气泡：thinking（首 chunk 未到）→ streaming → done 转正式消息 / error 停留待重试 */
    interface ActiveBubble {
        label: string;
        text: string;
        status: "thinking" | "streaming" | "error";
        retry?: () => void;
    }
    let active = $state<ActiveBubble | null>(null);
    let input = $state("");
    let controller: AbortController | null = null;
    let aborted = false;
    let msgsEl: HTMLDivElement | undefined = $state();

    // 弹窗关闭时中断进行中的流（草稿/编辑器清理由 AnnoEdit 侧负责，这里只管流；
    // dm 是 setup 期一次性挂靠，故意捕获初值）
    // svelte-ignore state_referenced_locally
    dm.add("chat", () => {
        if (controller) {
            aborted = true;
            controller.abort();
        }
    });

    /** aiBoxPrompts 条目 → 自定义角色（拍板：自定义挂 aiBoxPrompts 体系，零新设置项） */
    const customs = $derived(
        ((Array.isArray($aiBoxPrompts) ? $aiBoxPrompts : []) as unknown[])
            .filter((p): p is string => typeof p === "string" && !!p.trim())
            .map((p) => customRole(p)),
    );

    $effect(() => {
        canCompress = msgs.some((m) => m.role === "assistant" && m.roleKey !== "recorder");
    });

    // 新消息/流式增量自动滚到底（用户没往上翻时；简单起见恒滚动——对话区短）
    $effect(() => {
        void msgs.length; void active?.text; void active?.status;
        if (msgsEl) requestAnimationFrame(() => { msgsEl.scrollTop = msgsEl.scrollHeight; });
    });

    function roleName(r: AnnoRole): string {
        return r.i18nKey ? (tomatoI18n as unknown as Record<string, string>)[r.i18nKey] ?? r.name : r.name;
    }
    function refresh() {
        msgs = [...chatHistoryOf(annoId)];
    }
    async function ensureCfg() {
        const cfg = await getAIConfig();
        if (!cfg) confirm(tomatoI18n.未配置AI, tomatoI18n.尚未配置AI引导, () => { /* 引导即止 */ });
        return cfg;
    }

    /** 统一发言链：普通问答（role=null）/角色邀请/记录员压缩（recorder） */
    async function ask(inputText: string, role: AnnoRole | null, recorder = false) {
        busy = true;
        aborted = false;
        const retry = () => void ask(inputText, role, recorder);
        active = { label: recorder ? tomatoI18n.记录员 : role ? roleName(role) : "AI", text: "", status: "thinking" };
        try {
            const note = await getAnnoText().catch(() => "");
            const ctx = { source, sel: selText || undefined, note, docTitle, prev, next };
            const cfg = await ensureCfg();
            if (!cfg) { active = null; return; }
            const client = new OpenAIClient(cfg.apiKey, cfg.baseURL);
            controller = new AbortController();
            const messages = recorder
                ? compressMessages(ctx, chatHistoryOf(annoId))
                : buildChatMessages(ctx, chatHistoryOf(annoId), inputText, role ?? undefined);
            const stream = await client.createStreamPublic(cfg.model, messages, controller.signal);
            if (!stream) {
                if (!aborted) active = { ...active, status: "error", retry };
                return;
            }
            let state: StreamState = { texts: [], reasoning_texts: [], count: 0 };
            let text = "";
            for await (const chunk of stream) {
                const r = appendChunk(state, chunk);
                state = r.state;
                text = r.display;
                active = { ...active, text, status: "streaming" };
            }
            if (!text.trim()) { // 空响应=上游异常收流
                if (!aborted) active = { ...active, status: "error", retry };
                return;
            }
            const finalText = stripThinkTag(text);
            pushChat(annoId, {
                role: "assistant",
                name: recorder ? tomatoI18n.记录员 : role ? roleName(role) : "AI",
                roleKey: recorder ? "recorder" : role?.roleKey ?? "assistant",
                prompt: role?.prompt,
                content: finalText,
                time: Date.now(),
            });
            refresh();
            active = null;
            if (recorder) await onCompressed(finalText);
        } catch (e) {
            // 主动 abort 不算失败（abort() 已 toast）；其余=失败态可重试
            if (!aborted) {
                console.warn("[tomato anno] chat stream failed:", e);
                if (active) active = { ...active, status: "error", retry };
            }
        } finally {
            busy = false;
            controller = null;
        }
    }

    async function send() {
        const t = input.trim();
        if (!t || busy) return;
        pushChat(annoId, { role: "user", content: t, time: Date.now() });
        input = "";
        refresh();
        await ask(t, null);
    }

    /** Pro 门禁（收费边界 2026-09-01 定稿：轻问答免费 / 角色邀请+压缩成笔记 Pro）：
     *  未激活 toast + 统一解锁框；vip 读 store 保激活后即时变绿（pairbar □2 评审转出③同款） */
    async function gatePro(name: string): Promise<boolean> {
        if ($vipVerified === true) return true;
        await siyuan.pushMsg(tomatoI18n.需要Pro(name));
        openUnlockDialog({ product: "tomato" });
        return false;
    }

    async function invite(r: AnnoRole) {
        if (busy) return;
        if (!(await gatePro(roleName(r)))) return;
        const m = inviteMessage(roleName(r), tomatoI18n.邀请角色发言);
        pushChat(annoId, m);
        refresh();
        await ask(m.content, r);
    }

    /** 压缩成笔记（AnnoEdit 工具行按钮经 bind:this 调入） */
    export async function compress() {
        if (busy || !canCompress) return;
        if (!(await gatePro(tomatoI18n.压缩成笔记))) return;
        await ask("", null, true);
    }

    /** ＋自定义：DialogText 单字段输入提示词 → 写 aiBoxPrompts（持久，chip 即刻出现） */
    function newCustom() {
        if (busy) return;
        new DialogText(tomatoI18n.角色提示词, "", async (s) => {
            const t = (s ?? "").trim();
            if (!t) return;
            $aiBoxPrompts.push(t);
            $aiBoxPrompts = $aiBoxPrompts;
            aiBoxPrompts.write();
        });
    }

    /** 删自定义角色=从 aiBoxPrompts 删条目（自定义 chips 即刻消失） */
    function delCustom(r: AnnoRole) {
        const arr = ((Array.isArray($aiBoxPrompts) ? $aiBoxPrompts : []) as unknown[]).filter(
            (p): p is string => typeof p === "string",
        );
        const idx = arr.findIndex((p) => customRole(p).key === r.key);
        if (idx < 0) return;
        arr.splice(idx, 1);
        $aiBoxPrompts = arr;
        aiBoxPrompts.write();
    }

    function abort() {
        if (!busy || !controller) return;
        aborted = true;
        controller.abort();
        active = null;
        busy = false;
        controller = null;
        siyuan.pushMsg(tomatoI18n.已中断, 1500);
    }

    function onTaKeydown(ev: KeyboardEvent) {
        // 流式中 Esc=中断（焦点在输入框时优先于 Dialog 默认 Esc 关闭）
        if (ev.key === "Escape" && busy && controller) {
            ev.preventDefault();
            ev.stopPropagation();
            abort();
            return;
        }
        if (mobile) return; // 移动端 Enter 恒换行，发送只靠按钮（spec §9.4）
        if (ev.key === "Enter" && !ev.shiftKey && !ev.ctrlKey && !ev.metaKey && !ev.isComposing) {
            ev.preventDefault();
            void send();
        }
    }

    /** 连续同角色 assistant 只在组首挂标签（spec §3.3） */
    function showRole(i: number): boolean {
        const m = msgs[i];
        const prev = msgs[i - 1];
        return !(prev?.role === "assistant" && prev.roleKey === m.roleKey);
    }
</script>

<div class="anno-chat" class:is-mobile={mobile} class:is-closed={!open}>
    <div class="anno-chat__msgs" role="log" aria-live="polite" bind:this={msgsEl}>
        {#if msgs.length === 0 && !active}
            <div class="anno-chat__empty">{tomatoI18n.AI讨论区空态}</div>
        {/if}
        {#each msgs as m, i (i)}
            {#if m.role === "assistant" && showRole(i)}
                <div class="anno-chat__role">{m.name ?? "AI"}</div>
            {/if}
            <div
                class="anno-chat__msg"
                class:anno-chat__msg--user={m.role === "user"}
                class:anno-chat__msg--ai={m.role === "assistant"}
            >{m.content}</div>
        {/each}
        {#if active}
            <div class="anno-chat__role">{active.label}</div>
            <div
                class="anno-chat__msg anno-chat__msg--ai"
                class:is-streaming={active.status === "streaming"}
                class:is-error={active.status === "error"}
            >
                {#if active.status === "thinking"}
                    <span class="anno-chat__thinking" aria-label={tomatoI18n.思考中}><i></i><i></i><i></i></span>
                {:else if active.status === "error"}
                    {tomatoI18n.请求失败}
                    {#if active.retry}
                        <button class="anno-chat__retry" onclick={active.retry}>{tomatoI18n.重试}</button>
                    {/if}
                {:else}
                    <span class="anno-chat__text">{active.text}</span>
                {/if}
            </div>
        {/if}
    </div>

    <div class="anno-chat__chips" class:is-busy={busy}>
        {#each ANNO_ROLES as r (r.key)}
            <button
                class="anno-chat__chip b3-tooltips b3-tooltips__n"
                aria-label={tomatoI18n.以角色提问.replace("{x}", roleName(r))}
                onclick={() => void invite(r)}>{roleName(r)}{#if $vipVerified !== true}<span class="anno-chat__chip-pro">Pro</span>{/if}</button>
        {/each}
        {#each customs as r (r.key)}
            <span class="anno-chat__chip b3-tooltips b3-tooltips__n" aria-label={tomatoI18n.以角色提问.replace("{x}", r.name)}>
                <button class="anno-chat__chip-main" onclick={() => void invite(r)}>{r.name}{#if $vipVerified !== true}<span class="anno-chat__chip-pro">Pro</span>{/if}</button>
                <button
                    class="anno-chat__chip-del b3-tooltips b3-tooltips__n"
                    aria-label={tomatoI18n.删除角色}
                    onclick={() => delCustom(r)}>×</button>
            </span>
        {/each}
        <button
            class="anno-chat__chip anno-chat__chip--add b3-tooltips b3-tooltips__n"
            aria-label={tomatoI18n.新建角色}
            onclick={newCustom}>{tomatoI18n.新建角色}</button>
    </div>

    <div class="anno-chat__input">
        <textarea
            class="anno-chat__ta"
            rows="1"
            placeholder={tomatoI18n.输入消息}
            bind:value={input}
            onkeydown={onTaKeydown}
        ></textarea>
        <button
            class="anno-chat__send b3-tooltips b3-tooltips__n"
            aria-label={tomatoI18n.发送提示}
            disabled={busy || !input.trim()}
            onclick={() => void send()}
        ><svg><use xlink:href="#iconSend"></use></svg></button>
    </div>
</div>

<style>
    /* =====================================================================
       批注 AI 讨论区（视觉稿 v1 · 2026-08-31，
       唯一事实源 docs/tomato-annochat-visual-spec.md §7.2）
       颜色全走 b3 变量；color-mix 仅作变量透明度派生；禁 emoji、禁硬编码色
       ===================================================================== */
    .anno-chat {
        /* Dialog 挂 body 下取不到 protyle-wysiwyg 作用域，番茄色壳内自带声明（□6 踩坑） */
        --tomato-anno-color: var(--b3-theme-secondary);
        --tomato-chat-h: clamp(260px, 44vh, 460px);

        display: flex;
        flex-direction: column;
        flex: 1 0 auto;           /* 矮视口与 .container max-height 协作：可缩不可被挤没（vision P0-1） */
        min-height: 200px;
        height: var(--tomato-chat-h);
        margin: 0 2px 4px;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
    }
    .anno-chat.is-closed { display: none; }

    /* ---- 消息流 ---- */
    .anno-chat__msgs {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        overflow-y: auto;
    }
    .anno-chat__msgs::-webkit-scrollbar { width: 6px; }
    .anno-chat__msgs::-webkit-scrollbar-thumb { background: var(--b3-scroll-color); border-radius: 3px; }
    .anno-chat__msgs::-webkit-scrollbar-track { background: transparent; }

    .anno-chat__empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: var(--b3-empty-color);
        text-align: center;
        padding: 0 16px;
    }

    /* ---- 气泡 ---- */
    .anno-chat__msg {
        max-width: 78%;
        padding: 7px 10px;
        border-radius: var(--b3-border-radius-b);
        font-size: 13px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
        color: var(--b3-theme-on-background);
        box-sizing: border-box;
    }
    .anno-chat__msg--user {
        align-self: flex-end;
        border-bottom-right-radius: 4px; /* 锚点角收口 */
        background: color-mix(in srgb, var(--b3-theme-primary) 10%, transparent);
    }
    :global(html[data-theme-mode="dark"]) .anno-chat__msg--user {
        background: color-mix(in srgb, var(--b3-theme-primary) 14%, transparent);
    }
    .anno-chat__msg--ai {
        align-self: flex-start;
        border-bottom-left-radius: 4px;
        /* surface 与弹窗 background 亮色下不可辨（vision P1-2），提一档仍零硬编码 */
        background: var(--b3-theme-surface-lighter);
    }
    .anno-chat__msg--ai + .anno-chat__msg--ai { margin-top: -6px; } /* 同侧连发紧凑 4px（10px gap−6px，spec §3.1） */

    /* 角色名小标签（气泡上方，仅组首） */
    .anno-chat__role {
        display: flex;
        align-items: center;
        gap: 4px;
        align-self: flex-start;
        margin: 0 0 2px 2px;
        font-size: 11px;
        line-height: 1.4;
        color: var(--b3-theme-on-surface-light, #999);
    }
    .anno-chat__role::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 2px;
        background: var(--tomato-anno-color);
        flex-shrink: 0;
    }

    /* 流式：思考中三点 */
    .anno-chat__thinking {
        display: inline-flex;
        gap: 3px;
        padding: 2px 0;
    }
    .anno-chat__thinking i {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--b3-theme-on-surface-light, #999);
        animation: tomatoChatPulse 1.2s ease-in-out infinite;
    }
    .anno-chat__thinking i:nth-child(2) { animation-delay: .2s; }
    .anno-chat__thinking i:nth-child(3) { animation-delay: .4s; }
    @keyframes tomatoChatPulse {
        0%, 100% { opacity: .25; }
        50% { opacity: 1; }
    }

    /* 流式：文本尾光标（纯 CSS） */
    .anno-chat__msg--ai.is-streaming .anno-chat__text::after {
        content: "";
        display: inline-block;
        width: 2px;
        height: 1em;
        margin-left: 2px;
        vertical-align: -0.15em;
        background: var(--b3-theme-on-surface);
        animation: tomatoChatBlink 1s steps(1) infinite;
    }
    @keyframes tomatoChatBlink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
    }

    /* 失败态：红字 + 重试链接 */
    .anno-chat__msg--ai.is-error { color: var(--b3-theme-error); }
    .anno-chat__retry {
        margin-left: 8px;
        padding: 0;
        border: none;
        background: transparent;
        font-size: 12px;
        font-family: inherit;
        color: var(--b3-theme-error);
        text-decoration: underline;
        cursor: pointer;
    }
    .anno-chat__retry:hover { opacity: .8; }

    /* ---- 角色 chips ---- */
    .anno-chat__chips {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        overflow-x: auto;
        transition: opacity .15s;
    }
    .anno-chat__chips.is-busy { opacity: .5; pointer-events: none; }
    .anno-chat__chips::-webkit-scrollbar { height: 4px; }
    .anno-chat__chips::-webkit-scrollbar-thumb { background: var(--b3-scroll-color); border-radius: 2px; }
    .anno-chat__chips::-webkit-scrollbar-track { background: transparent; }

    .anno-chat__chip {
        flex-shrink: 0;
        height: 24px;
        padding: 0 10px;
        border: 1px solid var(--b3-border-color);
        border-radius: 999px;
        background: var(--b3-theme-background);
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        font-family: inherit;
        white-space: nowrap;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        transition: background .15s;
    }
    .anno-chat__chip:hover { background: var(--b3-theme-surface-lighter); }
    .anno-chat__chip:active { background: var(--b3-list-hover); }
    .anno-chat__chip--add { border-style: dashed; }

    /* 自定义 chip=名+删除钮组合（两枚可点元素不能嵌 button，chip 主体用 span 承载） */
    span.anno-chat__chip { padding: 0 4px 0 10px; gap: 2px; }
    .anno-chat__chip-main {
        border: none;
        background: transparent;
        padding: 0;
        font-size: 12px;
        font-family: inherit;
        color: inherit;
        cursor: pointer;
        /* flex 居中：徽标与文字基线对齐在带 × 的 chip 上差 1px（vision P2），与整 chip 同款居中 */
        display: inline-flex;
        align-items: center;
    }
    /* 未激活时角色 chip 的 Pro 标（主色实底胶囊，pairbar-vip 同款观感；激活即消） */
    .anno-chat__chip-pro {
        margin-left: 4px;
        padding: 1px 4px;
        font-size: 9px;
        line-height: 1;
        font-weight: 600;
        border-radius: 8px;
        color: var(--b3-theme-on-primary);
        background: var(--b3-theme-primary);
    }
    .anno-chat__chip-del {
        width: 14px;
        height: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        padding: 0;
        background: transparent;
        color: var(--b3-theme-on-surface-light, #999);
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
    }
    .anno-chat__chip-del:hover { color: var(--b3-theme-error); }

    /* ---- 输入行 ---- */
    .anno-chat__input {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        min-height: 52px;
        padding: 8px 10px;
        box-sizing: border-box;
        border-top: 1px solid var(--b3-border-color);
    }
    .anno-chat__ta {
        flex: 1;
        min-height: 36px;
        max-height: 96px; /* ≈4 行，超出内部滚动 */
        padding: 8px 9px;
        box-sizing: border-box;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        background: transparent;
        color: var(--b3-theme-on-background);
        font-family: inherit;
        font-size: 13px;
        line-height: 1.5;
        resize: none;
        outline: none;
        transition: border-color .15s;
    }
    .anno-chat__ta::placeholder { color: var(--b3-theme-on-surface-light, #999); }
    .anno-chat__ta:focus { border-color: var(--b3-theme-primary); }

    .anno-chat__send {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
        padding: 0;
        transition: background .15s, opacity .15s;
    }
    .anno-chat__send svg { width: 14px; height: 14px; }
    .anno-chat__send:hover:not(:disabled) { background: var(--b3-list-hover); }
    .anno-chat__send:disabled { opacity: .38; cursor: default; }

    /* ---- 移动端全屏态 ---- */
    .anno-chat.is-mobile {
        height: calc(100vh - 128px);
    }
    .anno-chat.is-mobile .anno-chat__msg { max-width: 84%; }
    .anno-chat.is-mobile .anno-chat__chip {
        height: 32px;
        padding: 0 14px;
        font-size: 13px;
    }
    .anno-chat.is-mobile span.anno-chat__chip { padding: 0 4px 0 14px; }
    .anno-chat.is-mobile .anno-chat__chip-del { width: 18px; height: 18px; }
    .anno-chat.is-mobile .anno-chat__send { width: 36px; height: 36px; }
</style>
