<script lang="ts">
    // 块配对功能优先浮条（R3 □2 V4 换代）：funcs 态=六功能钮面板（VIP 徽标+灰态仅 VIP 档，
    // 上次功能主色高亮 R4）；slots 态按功能框数渲染（两框=[源可多,目标]、三框=搬运[起始,结束,目标]，
    // 删除档框 ③ 纯视图收起）+搬运三档[移动|复制|删除]切换（R5 □2，不跨出场记忆）+✓ 主色确认
    // （框齐才亮，带影响面预览「移动 N 块」；删除档 ✓ 错误色实底）；当前功能图标常驻框区左侧
    // 可点击回 funcs 换功能。⋯菜单/拖动记忆/帮助入口/✕ 收条保留（第一轮落地勿破坏）。
    // 纯 UI——状态与副作用全在 PairBarBox 控制器（pairState 是控制器传入的 store）。
    import { tomatoI18n } from "./tomatoI18n";
    import {
        PAIR_DRAG_MIME,
        PAIR_FUNCS,
        pairBoxCount,
        pairBoxesFilled,
        pairFirstEmpty,
        pairGateErr,
        type PairFuncSpec,
        type PairTransportMode,
    } from "./libs/pairBarState";
    import { vipVerified } from "./libs/user";
    // tooltip 键位行消费的老命令 winHotkey 常量（R5 □3）：langKey→常量映射，与 ⋯ 菜单
    // 速查子菜单同一批常量（PairBarBox.more）=同源不漂移；.w() 调用时现读 keymap
    import {
        LinkBox双向互链选择块,
        LinkBox双向互链创建往返链,
        LinkBox嵌入互链选择,
        LinkBox嵌入互链创建,
        LinkBox关联两个块选择,
        LinkBox关联两个块创建,
        LinkBox互相插入引用于下方选择,
        LinkBox互相插入引用于下方创建,
        LinkBox同步块选择,
        LinkBox同步块创建,
    } from "./LinkBox";
    import {
        CpBox批量删除大量连续内容块,
        CpBox批量移动大量连续内容块,
        CpBox批量复制大量连续内容块,
    } from "./CpBox";

    const HK_BY_LANG = new Map(
        [
            LinkBox双向互链选择块, LinkBox双向互链创建往返链,
            LinkBox嵌入互链选择, LinkBox嵌入互链创建,
            LinkBox关联两个块选择, LinkBox关联两个块创建,
            LinkBox互相插入引用于下方选择, LinkBox互相插入引用于下方创建,
            LinkBox同步块选择, LinkBox同步块创建,
            CpBox批量删除大量连续内容块, CpBox批量移动大量连续内容块, CpBox批量复制大量连续内容块,
        ].map(h => [h.langKey, h])
    );

    let {
        pairState,
        api,
        hotkeyText,
        lastFunc,
    }: {
        pairState: import("svelte/store").Writable<import("./libs/pairBarState").PairState>;
        api: {
            pickFunc(id: string): void; backToFuncs(): void; confirm(): void;
            clearBox(slot: 1 | 2 | 3): void; cancel(): void; setMode(mode: PairTransportMode): void;
            dragStart(): void; dragEnd(): void;
            slotDragOver(e: DragEvent, slot: 1 | 2 | 3): void; slotDrop(e: DragEvent, slot: 1 | 2 | 3): void;
            more(anchor: HTMLElement): void;
            barDragStart(e: { clientX: number; clientY: number }): void;
            barTouchStart(e: TouchEvent): void;
            barResetPos(): void;
        };
        hotkeyText: string;
        /** 上次成功执行的功能（R4：直跳退役后的面板高亮；出场快照，控制器 mount 时传） */
        lastFunc: string;
    } = $props();

    // 门禁上下文（R5 □1 总开关化：功能级开关门禁退役，图标灰态只剩 VIP=嵌入互链）。
    // vip 读 store（□2 评审转出③：模块变量读取非响应式，验证后灰态滞后到重挂）
    let gateCtx = $derived.by(() => ({
        vip: $vipVerified === true,
    }));

    const label = (k: string) => (tomatoI18n as any)[k] as string;

    // ---- funcs 面板 ----

    /** 功能钮灰态：面板态只看 VIP 门禁（R5 总开关化，其余功能恒可用）；点了也有纯函数层兜底 */
    function fnErr(f: PairFuncSpec) {
        return pairGateErr(f, gateCtx);
    }
    function errText(err: string | null, f: PairFuncSpec) {
        if (err === "vipGated") return tomatoI18n.需要Pro(label(f.labelKey));
        if (err === "srcMulti") return tomatoI18n.仅支持单块源(label(f.labelKey));
        if (err === "sameTarget") return tomatoI18n.目标与源相同;
        return label(f.labelKey);
    }

    /** 可用态 tooltip 键位行（R5 □3）：互链族/同步块=[选, 建] 两键、搬运=[移, 复, 删] 三键，
     *  .w() 现读 keymap 与速查同源；灰态/VIP 态不追加（错误提示语义不变） */
    function hkLine(f: PairFuncSpec) {
        if (!f.hkKeys) return "";
        const ks = f.hkKeys.map(k => HK_BY_LANG.get(k)?.w() ?? "").filter(Boolean);
        if (ks.length === 0) return "";
        if (f.id === "transport") return `${tomatoI18n.移动} ${ks[0]} · ${tomatoI18n.复制} ${ks[1]} · ${tomatoI18n.删除} ${ks[2]}`;
        return `${tomatoI18n.选择} ${ks[0]} · ${tomatoI18n.创建} ${ks[1]}`;
    }

    // ---- slots 框区 ----

    /** 数据形态框数（spec.boxes=最大框数）：框 ② 语义分支（结束框 vs 目标框）、
     *  emptyLabel、等目标 hint 均按它——不随删除档视图收起变化 */
    let boxes = $derived(pairBoxCount($pairState.func));
    /** 有效框数：删除档框 ③ 纯视图收起（数据保留，切回 move/copy 自动重显） */
    let box3Visible = $derived(pairBoxCount($pairState.func, $pairState.transportMode) === 3);
    let mode = $derived($pairState.transportMode);
    /** 删除档：无目标框语义（sameTarget 预判/目标通道全不适用） */
    let isDelMode = $derived($pairState.func === "transport" && mode === "delete");
    let filled = $derived(pairBoxesFilled($pairState));
    let nextEmpty = $derived(pairFirstEmpty($pairState));
    let curSpec = $derived(PAIR_FUNCS.find(f => f.id === $pairState.func) ?? PAIR_FUNCS[0]);
    /** ✓ 拦截预判（与 pairConfirm 同判据的 UI 预演；点击仍有纯函数层兜底） */
    let okBlock = $derived.by(() => {
        const gate = pairGateErr(curSpec, gateCtx);
        if (gate) return gate;
        if (!curSpec.multiSrc && $pairState.srcIDs.length > 1) return "srcMulti";
        if (!isDelMode) {
            const t = $pairState.tgtID;
            if (t) {
                const src = boxes === 3 ? [$pairState.srcIDs[0], $pairState.endID] : $pairState.srcIDs;
                if (src.includes(t)) return "sameTarget";
            }
        }
        return null;
    });
    /** ✓ 亮出：框齐 + 无拦截 + 搬运区间已解析（rangeCount null=跨文档/未解析） */
    let canConfirm = $derived(filled && !okBlock && ($pairState.func !== "transport" || $pairState.rangeCount != null));
    /** ✓ 影响面预览：搬运=移动/复制/删除 N 块（区间数），其余=功能名 */
    let impactText = $derived.by(() => {
        if ($pairState.func === "transport") {
            if (mode === "delete") return tomatoI18n.删除块数($pairState.rangeCount);
            return mode === "copy" ? tomatoI18n.复制块数($pairState.rangeCount) : tomatoI18n.移动块数($pairState.rangeCount);
        }
        return label(curSpec.labelKey);
    });
    let okTip = $derived(okBlock ? errText(okBlock, curSpec) : impactText);

    /** 各框空态标签：两框=[源,目标]、三框=[起始,结束,目标] */
    function emptyLabel(slot: 1 | 2 | 3) {
        if (boxes === 3) return slot === 1 ? tomatoI18n.起始框 : slot === 2 ? tomatoI18n.结束框 : tomatoI18n.三号框;
        return slot === 1 ? tomatoI18n.槽一 : tomatoI18n.槽二;
    }

    function onChipDragStart(e: DragEvent) {
        e.dataTransfer?.setData(PAIR_DRAG_MIME, "1"); // Firefox 须 setData 才启动
        if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
        api.dragStart();
    }

    // ✓ 武装期（R5 □2 vision P1-1）：切档（尤其 move→delete）后框 ③ 卸载令浮条收缩、
    // 居中锚定下 ✓ 左移到刚点过的档位原位——机械连点第二击会直达红 ✓ 执行删除（零
    // 弹窗）。切档后短暂武装期内忽略 ✓ 点击；有意两步操作间隔远大于此不受影响。
    let okArmedAt = $state(0);
    function guardOkClick() {
        if (Date.now() - okArmedAt < 350) return;
        api.confirm();
    }

    // 框位拖拽悬停高亮（dragover 无 CSS 伪类，dragenter/leave 计数器法）
    let overSlot = $state<1 | 2 | 3 | null>(null);
    let dragDepth = $state(0);
    function onSlotDragEnter(slot: 1 | 2 | 3) {
        dragDepth++;
        overSlot = slot;
    }
    function onSlotDragLeave() {
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) overSlot = null;
    }
    function onSlotDrop(e: DragEvent, slot: 1 | 2 | 3) {
        dragDepth = 0;
        overSlot = null;
        api.slotDrop(e, slot);
    }
    /** Esc/拖出窗口等取消路径不派发 dragleave，dragend 里同步清悬停态（评审 P2） */
    function onSlotDragEnd() {
        dragDepth = 0;
        overSlot = null;
        api.dragEnd();
    }

    // 背景空白区拖动（体验增强 □2）：title/hint/padding 是手柄，避开 button（click）
    // 与 chip（HTML5 DnD 事件系天然不冲突，语义独立）。preventDefault 掐文本选中起点。
    const isBg = (t: EventTarget | null) =>
        !(t as HTMLElement)?.closest?.("button, .pairbar-chip");
    function onBgMouseDown(e: MouseEvent) {
        if (!isBg(e.target)) return;
        e.preventDefault();
        api.barDragStart(e);
    }
    function onBgTouchStart(e: TouchEvent) {
        if (!isBg(e.target)) return;
        e.preventDefault(); // 元素级可 preventDefault：掐滚动起点（document 级默认 passive）
        api.barTouchStart(e);
    }
    function onBgDblClick(e: MouseEvent) {
        if (!isBg(e.target)) return;
        api.barResetPos();
    }
</script>

{#if $pairState.phase !== "idle"}
    <!-- 背景=拖动/双击手柄（体验增强 □2）：交互件由 isBg 判定放行，容器自身非焦点件
         （无 tabindex/方向键导航的半吊子 toolbar role 已删——button 天然可聚焦可朗读） -->
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
    <div
        class="tomato-pairbar"
        onmousedown={onBgMouseDown}
        ontouchstart={onBgTouchStart}
        ondblclick={onBgDblClick}
    >
        {#if $pairState.phase === "funcs"}
            <!-- 功能面板（V4）：先选功能，浮条再按功能变框数；出场选区/最近源块已暂存待自动填；
                 上次功能高亮（R4）：直跳退役后 lastFunc 的残留价值，只高亮不抢焦点 -->
            <span class="pairbar-hint">{tomatoI18n.选择功能($pairState.stash)}</span>
            <div class="pairbar-funcs">
                {#each PAIR_FUNCS as f (f.id)}
                    {@const err = fnErr(f)}
                    {@const isLast = f.id === lastFunc && !err}
                    <button
                        class="pairbar-fn b3-tooltips b3-tooltips__s"
                        class:off={!!err}
                        class:last={isLast}
                        aria-disabled={!!err ? "true" : undefined}
                        aria-label={err ? errText(err, f) : `${label(f.labelKey)}${isLast ? ` · ${tomatoI18n.上次使用}` : ""}\n${hkLine(f)}`.trimEnd()}
                        onclick={() => { if (!err) api.pickFunc(f.id); }}
                    >
                        <svg><use xlink:href={"#" + f.icon}></use></svg>
                        <span class="pairbar-fn-name">{label(f.labelKey)}</span>
                        {#if f.vip}<span class="pairbar-vip">Pro</span>{/if}
                    </button>
                {/each}
            </div>
        {:else}
            <!-- 框区（V4）：当前功能图标常驻左侧（点击回功能面板换功能，换后自动重填） -->
            <button
                class="pairbar-curfn b3-tooltips b3-tooltips__s"
                aria-label={tomatoI18n.换功能(label(curSpec.labelKey))}
                onclick={api.backToFuncs}
            >
                <svg><use xlink:href={"#" + curSpec.icon}></use></svg>
            </button>
            <!-- 框 ①：两框=源（可多块，chip 可拖到编辑器块=填目标框）/三框=起始块 -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="pairbar-slot"
                class:focus={$pairState.focusSlot === 1}
                class:over={overSlot === 1}
                ondragover={(e) => api.slotDragOver(e, 1)}
                ondragenter={() => onSlotDragEnter(1)}
                ondragleave={onSlotDragLeave}
                ondrop={(e) => onSlotDrop(e, 1)}
            >
                {#if $pairState.srcIDs.length > 0}
                    <!-- chip=拖拽手柄非按钮（role=button 会误导读屏器）；HTML5 DnD 无键盘替代，
                         键盘流有完整替代通道（快捷键填框），拖拽是纯增强 -->
                    <span
                        class="pairbar-chip"
                        aria-label={$pairState.srcSummary}
                        title={$pairState.srcSummary}
                        draggable="true"
                        ondragstart={onChipDragStart}
                        ondragend={onSlotDragEnd}
                    >{$pairState.srcSummary || "…"}</span>
                    {#if boxes === 2 && $pairState.srcIDs.length > 1}
                        <span class="pairbar-count" title={String($pairState.srcIDs.length)}>+{$pairState.srcIDs.length - 1}</span>
                    {/if}
                    <button class="pairbar-slot-x b3-tooltips b3-tooltips__s" aria-label={tomatoI18n.删除槽块}
                        onclick={() => api.clearBox(1)}>
                        <svg><use xlink:href="#iconClose"></use></svg>
                    </button>
                {:else}
                    <span class="pairbar-slot-empty">{emptyLabel(1)}</span>
                {/if}
            </div>
            <!-- 框 ②：两框=目标 / 三框=结束块 -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="pairbar-slot"
                class:focus={$pairState.focusSlot === 2}
                class:over={overSlot === 2}
                ondragover={(e) => api.slotDragOver(e, 2)}
                ondragenter={() => onSlotDragEnter(2)}
                ondragleave={onSlotDragLeave}
                ondrop={(e) => onSlotDrop(e, 2)}
            >
                {#if boxes === 3}
                    {#if $pairState.endID}
                        <span class="pairbar-chip" aria-label={$pairState.endSummary} title={$pairState.endSummary}>
                            {$pairState.endSummary || "…"}
                        </span>
                        <button class="pairbar-slot-x b3-tooltips b3-tooltips__s" aria-label={tomatoI18n.删除槽块}
                            onclick={() => api.clearBox(2)}>
                            <svg><use xlink:href="#iconClose"></use></svg>
                        </button>
                    {:else}
                        <span class="pairbar-slot-empty">{emptyLabel(2)}</span>
                    {/if}
                {:else if $pairState.tgtID}
                    <span class="pairbar-chip" aria-label={$pairState.tgtSummary} title={$pairState.tgtSummary}>
                        {$pairState.tgtSummary || "…"}
                    </span>
                    <button class="pairbar-slot-x b3-tooltips b3-tooltips__s" aria-label={tomatoI18n.删除槽块}
                        onclick={() => api.clearBox(2)}>
                        <svg><use xlink:href="#iconClose"></use></svg>
                    </button>
                {:else}
                    <span class="pairbar-slot-empty">{emptyLabel(2)}</span>
                {/if}
            </div>
            {#if box3Visible}
                <!-- 框 ③（仅搬运；删除档纯视图收起——数据保留切回自动重显）：目标块 -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="pairbar-slot"
                    class:focus={$pairState.focusSlot === 3}
                    class:over={overSlot === 3}
                    ondragover={(e) => api.slotDragOver(e, 3)}
                    ondragenter={() => onSlotDragEnter(3)}
                    ondragleave={onSlotDragLeave}
                    ondrop={(e) => onSlotDrop(e, 3)}
                >
                    {#if $pairState.tgtID}
                        <span class="pairbar-chip" aria-label={$pairState.tgtSummary} title={$pairState.tgtSummary}>
                            {$pairState.tgtSummary || "…"}
                        </span>
                        <button class="pairbar-slot-x b3-tooltips b3-tooltips__s" aria-label={tomatoI18n.删除槽块}
                            onclick={() => api.clearBox(3)}>
                            <svg><use xlink:href="#iconClose"></use></svg>
                        </button>
                    {:else}
                        <span class="pairbar-slot-empty">{emptyLabel(3)}</span>
                    {/if}
                </div>
            {/if}
            {#if $pairState.func === "transport"}
                <!-- 搬运三档分段控件（R5 □2：[移动|复制|删除]；vision P1 教训沿：单字按钮无
                     供应性易读成说明文字——当前项主色淡底，点已在项=no-op 不翻转；aria-pressed
                     表达当前档。删除档无确认弹窗（思源历史可恢复+用户零弹窗立场），危险信号
                     由 ✓ 钮错误色实底+「删除 N 块」承担；transportMode 不跨出场记忆） -->
                <span class="pairbar-toggle" role="group" aria-label="{tomatoI18n.移动}/{tomatoI18n.复制}/{tomatoI18n.删除}">
                    <button class:cur={mode === "move"} aria-pressed={mode === "move" ? "true" : "false"}
                        onclick={() => { if (mode !== "move") { api.setMode("move"); okArmedAt = Date.now(); } }}>{tomatoI18n.移动}</button>
                    <button class:cur={mode === "copy"} aria-pressed={mode === "copy" ? "true" : "false"}
                        onclick={() => { if (mode !== "copy") { api.setMode("copy"); okArmedAt = Date.now(); } }}>{tomatoI18n.复制}</button>
                    <button class:cur={mode === "delete"} aria-pressed={mode === "delete" ? "true" : "false"}
                        onclick={() => { if (mode !== "delete") { api.setMode("delete"); okArmedAt = Date.now(); } }}>{tomatoI18n.删除}</button>
                </span>
            {/if}
            <!-- ✓ 显式确认（鼠标流通道；键盘流=快捷键框齐即执行）：框齐才亮，带影响面预览。
                 删除档=思源错误色实底（红化轻提示，零弹窗拍板） -->
            <button
                class="pairbar-ok b3-tooltips b3-tooltips__s"
                class:off={!canConfirm}
                class:danger={isDelMode}
                disabled={!canConfirm}
                aria-label={okTip}
                onclick={guardOkClick}
            >
                <svg><use xlink:href="#iconCheck"></use></svg>
                <span class="pairbar-ok-text">{impactText}</span>
            </button>
            {#if !filled}
                <span class="pairbar-hint">
                    {tomatoI18n.填槽提示}
                    {#if nextEmpty === boxes}
                        {tomatoI18n.等目标前段}<span class="pairbar-kbd">{hotkeyText}</span>
                    {/if}
                </span>
            {/if}
        {/if}
        <button class="pairbar-btn b3-tooltips b3-tooltips__s" aria-label={tomatoI18n.更多操作}
            onclick={(e) => api.more(e.currentTarget as HTMLElement)}>
            <svg><use xlink:href="#iconMore"></use></svg>
        </button>
        <button class="pairbar-btn b3-tooltips b3-tooltips__s" aria-label="Esc" onclick={api.cancel}>
            <svg><use xlink:href="#iconClose"></use></svg>
        </button>
    </div>
{/if}

<style>
    /* 常驻浮层安全档 z-index=10（内核弹层计数器首弹窗即 11）；fixed 顶部居中不跟滚动 */
    .tomato-pairbar {
        position: fixed;
        /* 76 = 顶栏 32 + 页签行 42 + 2 呼吸（spec §2-A7）：top:8 会盖页签文字带，
           跨文档接力被阻塞须先 Esc；实测内核构建 CSS 取值 */
        top: 76px;
        left: 50%;
        transform: translateX(-50%);
        /* shrink-to-fit 解锁（二轮 □3 vision P1）：fixed+left:50% 的可用宽只有右半区
           640px，双槽齐内容 ~800px 会被提前折行（DOM 实测 640×93 两行）；max-content
           让宽度按内容走，窄屏仍由 max-width:92vw 兜底折行 */
        width: max-content;
        z-index: 10;
        /* 背景空白区=拖动/双击手柄（体验增强 □2）：button(pointer)/chip(grab) 自带
           cursor 覆盖此值；无记忆时由 CSS 默认居中，拖过由 JS 行内 left/top 接管 */
        cursor: move;
        user-select: none; /* 拖动防选中（浮条文本无选择价值，容器级一劳永逸） */
        -webkit-user-select: none;
        touch-action: none; /* 触摸拖动不走浏览器手势（与 touchstart preventDefault 双保险） */
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
        max-width: 92vw;
        /* 顶边 8px：Pro 徽标 top:0 贴齐按钮盒上缘后距浮条上缘仅 ~1px（R3 □1 零外突结构），补呼吸 */
        padding: 8px 10px;
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        background: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
    }
    /* 框容器（V4）：焦点框=主色描边（待填语义）；拖块悬停=虚线高亮 */
    .pairbar-slot {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 1px 2px;
        border-radius: 5px;
        border: 1px solid transparent;
    }
    .pairbar-slot.focus {
        border-color: var(--b3-theme-primary);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--b3-theme-primary) 35%, transparent);
    }
    .pairbar-slot.over {
        border: 1px dashed var(--b3-theme-primary);
        background: color-mix(in srgb, var(--b3-theme-primary) 8%, transparent);
    }
    .pairbar-slot-empty {
        padding: 2px 8px;
        border-radius: 4px;
        /* 明主题下 border-color 虚线近乎融入白底（vision P2-2），加深一档保持待填语义可辨 */
        border: 1px dashed color-mix(in srgb, var(--b3-theme-on-surface) 25%, transparent);
        background: var(--b3-theme-surface-light);
        opacity: 0.75;
    }
    .pairbar-chip {
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 2px 8px;
        border-radius: 4px;
        background: var(--b3-theme-primary-lightest);
        cursor: grab;
        background-image: radial-gradient(circle,
            color-mix(in srgb, var(--b3-theme-on-surface) 30%, transparent) 1px,
            transparent 1.2px);
        background-size: 4px 4px;
        background-position: left 3px center;
        background-repeat: repeat-y;
    }
    .pairbar-chip:active {
        cursor: grabbing;
    }
    /* 框 1 多块 +N 计数徽标（spec 定案：首块摘要+计数；chip title=首块摘要，列全部
       摘要须状态机加字段，YAGNI 推后——注记勿再按「列全部」理解） */
    .pairbar-count {
        padding: 1px 5px;
        font-size: 10px;
        line-height: 1.2;
        border-radius: 8px;
        color: var(--b3-theme-on-primary);
        background: var(--b3-theme-primary);
    }
    .pairbar-slot-x {
        display: flex;
        align-items: center;
        padding: 2px;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: inherit;
        cursor: pointer;
    }
    .pairbar-slot-x svg {
        width: 12px;
        height: 12px;
    }
    .pairbar-slot-x:hover {
        background: var(--b3-list-hover);
    }
    .pairbar-funcs {
        display: flex;
        align-items: stretch;
        gap: 2px;
    }
    .pairbar-fn {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 4px 6px;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: inherit;
        font-size: 11px;
        cursor: pointer;
    }
    /* 带 Pro 徽标的按钮：负 margin 把按钮（含 padding box）外扩到徽标的贴纸位置、
       padding 等量补偿保内容不动，徽标偏移归零（top:0/right:0，见下）——Chromium 对
       新插入定位子树把负偏移徽标的栅格裁进包含块的 padding box（R3 □1 像素实锤：
       绘制=徽标∩padding box，top -5px/right -4px 外突两段整段不画；border 扩盒
       只扩 border box 无效、translateZ/translate/透明 outline 重绘均无效）。
       徽标零外突=结构性根治，视觉逐像素不变 */
    .pairbar-fn:has(.pairbar-vip) {
        margin: -5px -4px 0 0;
        padding: 9px 10px 4px 6px;
    }
    /* 上次功能高亮（R4 轻量版）：主色淡底+主色文字，视觉语言对齐分段控件 .cur 档；
       写在 :hover 之前让 hover 背景（b3-list-hover）可覆盖（color 主色保持），灰态不加
       （off 已表不可用）——评审 P1：写在 :hover 之后会同特异性压死 hover 反馈 */
    .pairbar-fn.last {
        background: color-mix(in srgb, var(--b3-theme-primary) 10%, transparent);
        color: var(--b3-theme-primary);
    }
    /* 高亮态 11px 主色字对暗底实测 2.66:1，低于常态灰字的 4.84:1（暗色 vision P1）：
       加粗笔画提可读，不动色不与分段控件 .cur 分叉 */
    .pairbar-fn.last .pairbar-fn-name {
        font-weight: 500;
    }
    .pairbar-fn:hover {
        background: var(--b3-list-hover);
    }
    .pairbar-fn.off {
        opacity: 0.5; /* 全仓置灰档统一（codeNotValid/hotkey-cap.unset 同档，spec §2-A1） */
        cursor: not-allowed;
    }
    .pairbar-fn svg {
        width: 16px;
        height: 16px;
    }
    /* 主色实底胶囊徽标 + surface 隔离环（spec §2-A2）：贴纸层次，白字 600 补小字可读。
       零外突结构（R3 □1）：top:0/right:0 贴按钮盒内缘，不越 padding box */
    .pairbar-vip {
        position: absolute;
        top: 0;
        right: 0;
        padding: 1px 4px;
        font-size: 9px;
        line-height: 1;
        font-weight: 600;
        border-radius: 8px;
        color: var(--b3-theme-on-primary);
        background: var(--b3-theme-primary);
        box-shadow: 0 0 0 1px var(--b3-theme-surface);
    }
    /* 当前功能图标（V4 常驻框区左侧）：主色提示「当前功能」，点击回功能面板换功能 */
    .pairbar-curfn {
        display: flex;
        align-items: center;
        padding: 4px;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: var(--b3-theme-primary);
        cursor: pointer;
    }
    .pairbar-curfn:hover {
        background: var(--b3-list-hover);
    }
    .pairbar-curfn svg {
        width: 16px;
        height: 16px;
    }
    .pairbar-btn {
        display: flex;
        align-items: center;
        padding: 4px;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: inherit;
        cursor: pointer;
    }
    .pairbar-btn:hover {
        background: var(--b3-list-hover);
    }
    .pairbar-btn svg {
        width: 16px;
        height: 16px;
    }
    /* 移动/复制分段控件（V4 vision P1 改）：外框组 + 两档钮——当前项主色淡底高亮、
     *  非当前项弱一档，与辅助文案拉开视觉权重 */
    .pairbar-toggle {
        display: inline-flex;
        border: 1px solid var(--b3-border-color);
        border-radius: 4px;
        overflow: hidden;
        background: var(--b3-theme-surface);
    }
    .pairbar-toggle button {
        border: none;
        background: transparent;
        padding: 2px 8px;
        font-size: 11px;
        color: var(--b3-theme-on-surface);
        opacity: 0.68; /* 非当前项弱化一档（与 pairbar-hint 同档语义） */
        cursor: pointer;
    }
    .pairbar-toggle button:hover {
        background: var(--b3-list-hover);
    }
    .pairbar-toggle button.cur {
        background: color-mix(in srgb, var(--b3-theme-primary) 14%, transparent);
        color: var(--b3-theme-primary);
        opacity: 1;
        cursor: default; /* 当前项点击是 no-op，可点指针是假承诺（review P2-4） */
    }
    /* ✓ 确认主钮（V4）：主色实底=框齐待发；disabled=去饱和灰（主色只降半透仍读作
     *  可点的亮主色，加 grayscale 才可辨框未齐——2026-09-01 vision P0-1） */
    .pairbar-ok {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        border: none;
        border-radius: 4px;
        background: var(--b3-theme-primary);
        color: var(--b3-theme-on-primary);
        font-size: 12px;
        cursor: pointer;
        white-space: nowrap;
    }
    .pairbar-ok:not(:disabled):hover {
        background: color-mix(in srgb, var(--b3-theme-primary) 85%, black);
    }
    .pairbar-ok:disabled {
        opacity: 0.5;
        filter: grayscale(1);
        cursor: not-allowed;
    }
    /* 删除档 ✓（R5 □2）：错误色实底=红化轻提示（零弹窗拍板）；hover 须自带变体——
       :not(:disabled):hover 特异性高于 .danger，漏写会被主色 hover 压回。
       color 显式 on-error：不随 on-primary 走——自定义浅主色主题 on-primary 为深色时
       红底深字对比塌（vision P2-2） */
    .pairbar-ok.danger {
        background: var(--b3-theme-error);
        color: var(--b3-theme-on-error);
    }
    .pairbar-ok.danger:not(:disabled):hover {
        background: color-mix(in srgb, var(--b3-theme-error) 85%, black);
    }
    .pairbar-ok svg {
        width: 14px;
        height: 14px;
    }
    .pairbar-hint {
        opacity: 0.75; /* 面板既有弱化档（spec §2-A4）：辅助信息弱化一档，不按正文 AA 硬线卡 */
    }
    /* 填框提示键帽（沿 spec §2-A3）：静态只读键帽——取值对齐 IndexConf .kbd 缩一档 */
    .pairbar-kbd {
        padding: 1px 5px;
        font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
        font-size: 11px;
        line-height: 1.4;
        color: var(--b3-theme-on-surface);
        vertical-align: middle;
        background-color: var(--b3-theme-surface-lighter);
        border: solid 1px var(--b3-theme-surface-lighter);
        border-radius: 4px;
        box-shadow: inset 0 -1px 0 var(--b3-theme-surface-lighter);
        margin: 0 3px;
    }
    /* 拖 chip 悬停目标的接受高亮（目标块在 protyle 内，浮条组件外——:global 出圈）；
       底色 12%（vision □3 P2-4：8% 与同步块固有虚线框同屏时面感不足） */
    :global(.tomato-pairbar-droptarget) {
        outline: 2px dashed var(--b3-theme-primary);
        outline-offset: -2px;
        background: color-mix(in srgb, var(--b3-theme-primary) 12%, transparent);
    }
</style>
