<script lang="ts">
    interface Props {
        doc: { title: string; body: string; url: string };
    }

    let { doc }: Props = $props();

    export function destroy() {}

    function esc(s: string) {
        return s
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    }

    // 行内格式: 媒体占位、粗体、行内代码、链接 (帮助正文来自飞书文档, 先 esc 再重建标签)
    function inline(s: string) {
        let h = esc(s);
        h = h.replace(
            /\[图片\]/g,
            '<span class="help-media" title="截图请查看飞书完整帮助">🖼</span>',
        );
        h = h.replace(
            /\[视频\]/g,
            '<span class="help-media" title="视频请查看飞书完整帮助">🎬</span>',
        );
        h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
        h = h.replace(
            /\[([^\]]+)\]\(([^)\s]+)\)/g,
            '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
        );
        return h;
    }

    function md2html(md: string) {
        const out: string[] = [];
        let list: string[] = [];
        let quote: string[] = [];
        let code: string[] | null = null;
        const flushList = () => {
            if (list.length) {
                out.push(`<ul>${list.map((i) => `<li>${i}</li>`).join("")}</ul>`);
                list = [];
            }
        };
        const flushQuote = () => {
            if (quote.length) {
                out.push(`<blockquote>${quote.join("<br>")}</blockquote>`);
                quote = [];
            }
        };
        const flush = () => {
            flushList();
            flushQuote();
        };
        for (const raw of md.split("\n")) {
            const line = raw.trim();
            if (code !== null) {
                if (line.startsWith("```")) {
                    out.push(`<pre><code>${code.join("\n")}</code></pre>`);
                    code = null;
                } else {
                    code.push(esc(line));
                }
                continue;
            }
            if (line.startsWith("```")) {
                flush();
                code = [];
                continue;
            }
            if (!line) {
                flush();
                continue;
            }
            const h = line.match(/^(#{1,4})\s+(.*)$/);
            if (h) {
                flush();
                out.push(`<h${h[1].length + 2}>${inline(h[2])}</h${h[1].length + 2}>`);
                continue;
            }
            const li = line.match(/^(?:[-*]|\d+\.)\s+(.*)$/);
            if (li) {
                flushQuote();
                list.push(inline(li[1]));
                continue;
            }
            if (line.startsWith(">")) {
                flushList();
                quote.push(inline(line.replace(/^>\s?/, "")));
                continue;
            }
            flush();
            out.push(`<p>${inline(line)}</p>`);
        }
        if (code !== null && code.length) {
            out.push(`<pre><code>${code.join("\n")}</code></pre>`);
        }
        flush();
        return out.join("");
    }
</script>

<div class="help-wrap">
    <div class="help-top">
        <span class="help-top__hint">弹窗为文字速览，截图与视频请打开飞书文档查看</span>
        <a
            class="b3-button b3-button--outline"
            href={doc.url}
            target="_blank"
            rel="noreferrer">📖 飞书完整帮助</a
        >
    </div>
    <div class="help-body">{@html md2html(doc.body)}</div>
</div>

<style>
    .help-wrap {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }
    .help-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 4px 8px;
        border-bottom: 1px solid var(--b3-border-color, #eee);
        flex-wrap: wrap;
    }
    .help-top__hint {
        font-size: 12px;
        color: var(--b3-theme-on-surface-light, #999);
    }
    .help-body {
        flex: 1;
        overflow: auto;
        padding: 8px 16px 24px;
        max-width: 700px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
    }
    .help-body :global(h3),
    .help-body :global(h4),
    .help-body :global(h5),
    .help-body :global(h6) {
        margin: 14px 0 4px;
    }
    .help-body :global(p) {
        margin: 6px 0;
    }
    .help-body :global(ul) {
        margin: 6px 0;
        padding-left: 22px;
    }
    .help-body :global(blockquote) {
        margin: 6px 0;
        padding: 2px 10px;
        border-left: 3px solid var(--b3-border-color, #ddd);
        color: var(--b3-theme-on-surface-light, #666);
    }
    .help-body :global(pre) {
        margin: 6px 0;
        padding: 8px 10px;
        border-radius: 4px;
        background: var(--b3-theme-surface, #f5f5f5);
        overflow: auto;
    }
    .help-body :global(code) {
        padding: 1px 4px;
        border-radius: 3px;
        background: var(--b3-theme-surface, #f5f5f5);
    }
    .help-body :global(pre code) {
        padding: 0;
        background: none;
    }
    .help-body :global(.help-media) {
        display: inline-block;
        padding: 0 4px;
        border: 1px dashed var(--b3-border-color, #ccc);
        border-radius: 4px;
        font-size: 12px;
        color: var(--b3-theme-on-surface-light, #999);
    }
</style>
