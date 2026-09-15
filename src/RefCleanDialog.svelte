<script lang="ts">
    // 失效引用清理小窗（vipdoctree □4）：统计行+范围切换（仅本文档/含子文档）
    // +勾选列表（类型徽标+锚文本+失效目标尾 6 位）+全选/反选+两动作按钮。
    // 2026-09-15 转全免费（bear 反馈拍板）：集市同类功能有免费开源竞品，且
    // 「检查免费、修要钱」是钓鱼式切法——检查/列出/批量动作全免费。
    import { detectInvalidRefs, applyRefClean, type RefCleanItem } from "./RefCleanBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { siyuan } from "./libs/siyuanApi";
    import { onMount } from "svelte";

    interface Props {
        docID: string;
    }
    let { docID }: Props = $props();

    let scope: "doc" | "tree" = $state("tree");
    let items = $state<RefCleanItem[]>([]);
    let checked = $state<Record<string, boolean>>({});
    let loading = $state(false);
    let running = $state(false);
    let message = $state("");

    const key = (it: RefCleanItem) => `${it.kind}:${it.defID}:${it.blockID}`;
    const refCount = $derived(items.filter((i) => i.kind === "ref").length);
    const anchorCount = $derived(items.filter((i) => i.kind === "anchor").length);
    const checkedCount = $derived(items.filter((i) => checked[key(i)]).length);
    const allChecked = $derived(items.length > 0 && checkedCount === items.length);

    async function run() {
        if (loading || running) return;
        loading = true;
        message = "";
        try {
            items = await detectInvalidRefs(docID, scope === "tree");
            // 默认全勾（用户痛点=批量清理，逐项取消比逐项勾选低频）
            const next: Record<string, boolean> = {};
            for (const it of items) next[key(it)] = true;
            checked = next;
        } finally {
            loading = false;
        }
    }

    async function act(mode: "totext" | "remove") {
        if (running || loading || checkedCount === 0) return;
        running = true;
        message = "";
        let r: { ok: number; fail: number } | null = null;
        try {
            const picked = items.filter((i) => checked[key(i)]);
            r = await applyRefClean(picked, mode);
            message = tomatoI18n.处理完成(r.ok, r.fail);
            if (r.fail === 0) await siyuan.pushMsg(tomatoI18n.处理完成(r.ok, r.fail));
            // 索引稳定窗：refs/markdown 行 1~4s 才刷新（写后立读坑——updateBlock 后
            // 毫秒级重查连 getBlockKramdown 复核过滤都拿旧值，列表现幽灵项）；
            // busy 态盖住等待，用户无感
            await new Promise((res) => setTimeout(res, 2000));
        } finally {
            running = false;
        }
        if (r) await run();
    }

    function toggleAll() {
        const next: Record<string, boolean> = {};
        if (!allChecked) for (const it of items) next[key(it)] = true;
        checked = next;
    }

    function invert() {
        const next: Record<string, boolean> = {};
        for (const it of items) next[key(it)] = !checked[key(it)];
        checked = next;
    }

    function flip(it: RefCleanItem) {
        checked = { ...checked, [key(it)]: !checked[key(it)] };
    }

    // onMount 自动检测（默认含子文档）；范围切换由 radio handler 重跑——不依赖
    // bind:group 时序，checked+oninput 手动控制（scope 先行更新再 run）
    onMount(() => { void run(); });
</script>

<div class="ref-clean">
    <div class="ref-clean__bar">
        <span class="ref-clean__stat">
            {tomatoI18n.失效块引用} <b>{refCount}</b> · {tomatoI18n.失效锚点链接} <b>{anchorCount}</b>
        </span>
        <label class="ref-clean__scope">
            <input type="radio" class="b3-radio" name="ref-clean-scope" checked={scope === "doc"}
                oninput={() => { scope = "doc"; void run(); }} />
            {tomatoI18n.当前文档}
        </label>
        <label class="ref-clean__scope">
            <input type="radio" class="b3-radio" name="ref-clean-scope" checked={scope === "tree"}
                oninput={() => { scope = "tree"; void run(); }} />
            {tomatoI18n.含子文档}
        </label>
    </div>
    {#if loading}
        <div class="ref-clean__hint">{tomatoI18n.正在检查}</div>
    {:else if items.length === 0}
        <div class="ref-clean__hint">{tomatoI18n.未发现失效引用或锚点链接}</div>
    {:else}
        <div class="ref-clean__list">
            {#each items as it (key(it))}
                <label class="ref-clean__item" class:ref-clean__item--off={!checked[key(it)]}>
                    <input type="checkbox" class="b3-checkbox" checked={checked[key(it)]} onchange={() => flip(it)} />
                    <span class="ref-clean__kind" class:ref-clean__kind--anchor={it.kind === "anchor"}>{it.kind === "ref" ? tomatoI18n.失效块引用 : tomatoI18n.失效锚点链接}</span>
                    {#if it.text}<span class="ref-clean__text">{it.text}</span>{/if}
                    <span class="fn__flex-1"></span>
                    <code class="ref-clean__id" title={it.defID || ""}>{it.defID ? it.defID.slice(-6) : "—"}</code>
                </label>
            {/each}
        </div>
    {/if}
    {#if message}
        <div class="ref-clean__msg">{message}</div>
    {/if}
    <div class="ref-clean__foot">
        <button class="b3-button b3-button--text" disabled={loading || running || items.length === 0} onclick={toggleAll}>
            {allChecked ? tomatoI18n.取消全选 : tomatoI18n.全选}
        </button>
        <button class="b3-button b3-button--text" disabled={loading || running || items.length === 0} onclick={invert}>
            {tomatoI18n.反选}
        </button>
        <span class="fn__flex-1"></span>
        <button
            class="b3-button b3-button--outline"
            disabled={loading || running || checkedCount === 0}
            onclick={() => void act("totext")}
        >{tomatoI18n.转成文本}{checkedCount > 0 ? ` (${checkedCount})` : ""}</button>
        <button
            class="b3-button b3-button--remove"
            disabled={loading || running || checkedCount === 0}
            onclick={() => void act("remove")}
        >{tomatoI18n.删除}{checkedCount > 0 ? ` (${checkedCount})` : ""}</button>
    </div>
</div>

<style>
    .ref-clean {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 8px 12px 0;
    }
    .ref-clean__bar {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
    }
    .ref-clean__stat {
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        opacity: 0.85;
    }
    .ref-clean__stat b {
        font-weight: 600;
    }
    .ref-clean__scope {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        cursor: pointer;
    }
    .ref-clean__hint {
        font-size: 13px;
        color: var(--b3-theme-on-surface);
        opacity: 0.7;
        padding: 8px 0;
    }
    .ref-clean__list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        max-height: 42vh;
        overflow: auto;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        padding: 4px 8px;
    }
    .ref-clean__item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        padding: 3px 0;
        cursor: pointer;
        min-width: 0;
    }
    .ref-clean__item--off .ref-clean__text,
    .ref-clean__item--off .ref-clean__kind,
    .ref-clean__item--off .ref-clean__id {
        opacity: 0.45;
    }
    .ref-clean__kind {
        flex-shrink: 0;
        font-size: 11px;
        line-height: 18px;
        padding: 0 6px;
        border-radius: 4px;
        color: var(--b3-theme-primary);
        background: var(--b3-theme-primary-lightest);
    }
    .ref-clean__kind--anchor {
        color: var(--b3-theme-on-surface);
        background: var(--b3-theme-surface-lighter);
    }
    .ref-clean__text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
    }
    .ref-clean__id {
        flex-shrink: 0;
        font-size: 11px;
        font-family: var(--b3-font-family-code);
        color: var(--b3-theme-on-surface);
        opacity: 0.7;
    }
    .ref-clean__msg {
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        opacity: 0.8;
    }
    .ref-clean__foot {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-top: 8px;
        margin-bottom: -4px;
    }
</style>
