<script lang="ts">
    const PAGE_SIZE = 15;

    interface Props {
        entries: { tag: string; date: string; body: string }[];
    }

    let { entries = [] }: Props = $props();

    let page = $state(0);
    let totalPages = $derived(Math.max(1, Math.ceil(entries.length / PAGE_SIZE)));
    let pageEntries = $derived(
        entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    );

    export function destroy() {}

    function esc(s: string) {
        return s
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }

    // release notes 只含 ## 标题、- 列表和普通段落，够用即可，不引 markdown 依赖
    function md2html(md: string) {
        const out: string[] = [];
        let list: string[] = [];
        const flush = () => {
            if (list.length) {
                out.push(`<ul>${list.map((i) => `<li>${i}</li>`).join("")}</ul>`);
                list = [];
            }
        };
        for (const raw of md.split("\n")) {
            const line = raw.trim();
            if (!line) {
                flush();
                continue;
            }
            const h = line.match(/^(#{1,4})\s+(.*)$/);
            if (h) {
                flush();
                out.push(`<h${h[1].length + 2}>${esc(h[2])}</h${h[1].length + 2}>`);
            } else if (line.startsWith("- ")) {
                list.push(esc(line.slice(2)));
            } else {
                flush();
                out.push(`<p>${esc(line)}</p>`);
            }
        }
        flush();
        return out.join("");
    }
</script>

<div class="changelog-list">
    {#each pageEntries as e (e.date + e.tag)}
        <section class="changelog-item">
            <header class="changelog-item__head">
                {#if e.tag}<span class="changelog-item__tag">{e.tag}</span>{/if}
                <span class="changelog-item__date">{e.date}</span>
            </header>
            <div class="changelog-item__body">{@html md2html(e.body)}</div>
        </section>
    {/each}
</div>

{#if totalPages > 1}
    <div class="changelog-pager">
        <button
            class="b3-button b3-button--text"
            disabled={page === 0}
            onclick={() => (page = Math.max(0, page - 1))}>‹</button
        >
        <span class="changelog-pager__num">{page + 1} / {totalPages}</span>
        <button
            class="b3-button b3-button--text"
            disabled={page === totalPages - 1}
            onclick={() => (page = Math.min(totalPages - 1, page + 1))}>›</button
        >
    </div>
{/if}

<style>
    .changelog-list {
        max-width: 700px;
        margin: 0 auto;
        padding: 8px 4px 32px;
    }
    .changelog-item {
        border-bottom: 1px solid var(--b3-border-color, #eee);
        padding: 12px 0;
    }
    .changelog-item__head {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 4px;
    }
    .changelog-item__tag {
        font-weight: 600;
        color: var(--b3-theme-primary, #3575f0);
    }
    .changelog-item__date {
        font-size: 12px;
        color: var(--b3-theme-on-surface-light, #999);
    }
    .changelog-item__body :global(h3),
    .changelog-item__body :global(h4),
    .changelog-item__body :global(h5),
    .changelog-item__body :global(h6) {
        margin: 8px 0 2px;
    }
    .changelog-item__body :global(p) {
        margin: 4px 0;
    }
    .changelog-item__body :global(ul) {
        margin: 4px 0;
        padding-left: 20px;
    }
    .changelog-pager {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 6px;
        background: var(--b3-theme-background, #fff);
        border-top: 1px solid var(--b3-border-color, #eee);
    }
    .changelog-pager__num {
        font-size: 12px;
        color: var(--b3-theme-on-surface-light, #999);
        min-width: 48px;
        text-align: center;
    }
</style>
