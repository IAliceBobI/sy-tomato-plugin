<script lang="ts">
    // □3 批注气泡 + □4 增量：富文本正文（annoTextToHtml 只读子集渲染）与「编辑/问 AI/删除」foot handler。
    // 皮=docs/tomato-anno-visual-spec.md §7；定位=annoDom.popPosition（上方默认/翻下方/视口钳制）。
    // 挂 body 的瞬态浮层，由 Annotations 管理器经 annoPop store 驱动；三个按钮经 props 回调回编排层
    // （多条目共享挂点时点击条目聚焦，foot 按钮作用于聚焦条目，默认首条——spec §4 foot 单对按钮不动布局）。
    import { annoPop } from "./libs/annoPop";
    import { annoTextToHtml } from "./libs/annoKramdown";
    import { popPosition } from "./libs/annoDom";
    import type { TomatoAnnotation } from "./libs/annotationsAttr";
    import { tomatoI18n } from "./tomatoI18n";

    interface Props {
        onEdit: (entry: TomatoAnnotation, anchor: HTMLElement) => void;
        onAsk: (entry: TomatoAnnotation, anchor: HTMLElement) => void;
        onDelete: (entry: TomatoAnnotation, anchor: HTMLElement) => void;
    }
    let { onEdit, onAsk, onDelete }: Props = $props();

    let root: HTMLDivElement | undefined = $state();
    let placed = $state(false);
    let focusedId = $state("");

    /** spec §5：绝对时间 MM-DD HH:mm，跨年补全年份，tabular-nums 由 CSS 管 */
    function fmt(ms: number): string {
        const d = new Date(ms);
        const n = new Date();
        const p = (x: number) => String(x).padStart(2, "0");
        const mdhm = `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
        return d.getFullYear() === n.getFullYear() ? mdhm : `${d.getFullYear()}-${mdhm}`;
    }

    $effect(() => {
        const s = $annoPop;
        placed = false;
        focusedId = s?.entries[0]?.id ?? ""; // 状态重置默认聚焦首条
        if (!s || !root) return;
        // vision P1-1：钳制边界=视口 ∩ 锚点所在 protyle 容器（气泡不越编辑区盖常驻面板/侧栏）
        const pr = s.anchor?.closest?.(".protyle")?.getBoundingClientRect();
        const vl = pr ? Math.max(0, pr.left) : 0;
        const vr = pr ? Math.min(window.innerWidth, pr.right) : window.innerWidth;
        const p = popPosition(
            s.rect,
            { width: root.offsetWidth || 280, height: root.offsetHeight || 90 },
            { left: vl, width: Math.max(160, vr - vl), height: window.innerHeight },
        );
        root.style.left = `${p.left}px`;
        root.style.top = `${p.top}px`;
        root.style.setProperty("--tomato-anno-arrow-x", `${p.arrowLeft}px`);
        root.style.zIndex = String(s.zIndex);
        root.classList.toggle("tomato-anno-pop--flip", p.flip);
        requestAnimationFrame(() => {
            placed = true;
        });
    });

    function focusedEntry(): TomatoAnnotation | undefined {
        return $annoPop?.entries.find((e) => e.id === focusedId) ?? $annoPop?.entries[0];
    }
</script>

{#if $annoPop}
    {#key $annoPop.mode + "|" + $annoPop.entries.map((e) => `${e.id}:${e.time}:${e.text.length}`).join(",")}
        <div
            class="tomato-anno-pop"
            class:tomato-anno-pop--preview={$annoPop.mode === "preview"}
            class:tomato-anno-pop--view={$annoPop.mode === "view"}
            class:is-show={placed}
            role={$annoPop.mode === "view" ? "dialog" : "tooltip"}
            bind:this={root}
        >
            {#if $annoPop.mode === "preview"}
                <ul class="tomato-anno-pop__list">
                    {#each $annoPop.entries as e (e.id)}
                        <li class="tomato-anno-pop__item">
                            <div class="tomato-anno-pop__meta">{fmt(e.time)}</div>
                            <div class="tomato-anno-pop__text">{@html annoTextToHtml(e.text)}</div>
                        </li>
                    {/each}
                </ul>
            {:else}
                <div class="tomato-anno-pop__head">
                    <span class="tomato-anno-pop__label">
                        {tomatoI18n.批注}{#if $annoPop.entries.length > 1}&thinsp;· {$annoPop.entries.length}{/if}
                    </span>
                    <span class="tomato-anno-pop__meta">
                        {fmt(Math.max(...$annoPop.entries.map((e) => e.time)))}
                    </span>
                </div>
                <div class="tomato-anno-pop__body">
                    {#each $annoPop.entries as e (e.id)}
                        <div
                            class="tomato-anno-pop__item"
                            class:is-focused={$annoPop.entries.length > 1 && e.id === focusedId}
                            class:is-selectable={$annoPop.entries.length > 1}
                            role={$annoPop.entries.length > 1 ? "button" : undefined}
                            onclick={() => (focusedId = e.id)}
                        >
                            {#if $annoPop.entries.length > 1}
                                <!-- 单条时 head 已有时间戳，body 不再重复（vision P1-1） -->
                                <div class="tomato-anno-pop__meta">{fmt(e.time)}</div>
                            {/if}
                            <div class="tomato-anno-pop__text">{@html annoTextToHtml(e.text)}</div>
                        </div>
                    {/each}
                </div>
                <div class="tomato-anno-pop__foot">
                    <button class="tomato-anno-btn" type="button"
                        onclick={() => {
                            const e = focusedEntry();
                            if (e && $annoPop) onEdit(e, $annoPop.anchor);
                        }}>{tomatoI18n.编辑}</button>
                    <!-- □3「问 AI」直开讨论区：三层深入口的最短路径（弹窗内工具行保留=双入口） -->
                    <button class="tomato-anno-btn" type="button"
                        onclick={() => {
                            const e = focusedEntry();
                            if (e && $annoPop) onAsk(e, $annoPop.anchor);
                        }}>{tomatoI18n.问AI}</button>
                    <button class="tomato-anno-btn tomato-anno-btn--danger" type="button"
                        onclick={() => {
                            const e = focusedEntry();
                            if (e && $annoPop) onDelete(e, $annoPop.anchor);
                        }}>{tomatoI18n.删除}</button>
                </div>
            {/if}
        </div>
    {/key}
{/if}
