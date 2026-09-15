<script lang="ts">
    import { onMount, tick } from "svelte";
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { DocTracer, getDocTracer, OpenSyFile2, resetDocTracer } from "./libs/docUtils";
    import { reloadSelfPlugin } from "./libs/pluginReload";
    import { getTomatoPluginInstance, siyuan } from "./libs/utils";
    import { events, EventType } from "./libs/Events";
    import { prefixArticlesTagsGroup, prefixArticlesTagsShow } from "./libs/stores";
    import {
        aggregateParts,
        countPartMatches,
        groupDocsByParts,
        type PartAgg,
    } from "./libs/prefixUtils";
    import { getSoftLimit, titleSort } from "./PrefixArticles";
    import { adaptHotkey, type Protyle } from "siyuan";

    // 独立挂载（tagsdecouple □1）：无 props 自持组件——show 直连持久 store（三入口同源），
    // 当前文档跟随链自建（原绑定面板 currentDocID 的供给迁入）；docName 面板绑定值窗内从未消费，随之退役
    let tracer: DocTracer;
    // 当前文档 id：组区行高亮（pp-row--cur）数据源
    let curDocID = $state("");
    let targets: PartAgg[] = $state([]);
    // 选中标签集：单击=整体替换（恒保持选中，再点不清空——□6）；⌘/Ctrl+点=切换进出（组区=交集筛选，同时含所选标签）；
    // 清空唯一入口=组头 × 钮（clearSelection）。移动端无修饰键，tap 自然降级为单选
    let selectedParts: string[] = $state([]);
    let groupListEl: HTMLElement | null = $state(null);
    // 云序（chip 云序=updated 倒序）：已选串展示序与组区徽章首个认领序共用，防「宝宝 + topic」倒挂
    function cloudOrder(parts: string[]): string[] {
        const order = new Map(targets.map((t, i) => [t.part, i]));
        return [...parts].sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
    }
    // 组区=交集（prefixui □5）：文档须同时含全部所选标签；徽章=云序首个命中；
    // total=真实命中数（slice 封顶只影响列表不影响计数）
    let group = $derived.by(() => {
        if (selectedParts.length === 0 || !tracer) return { docs: [] as ArticlesPrefix[], total: 0 };
        const docs = groupDocsByParts(
            tracer.getDocMap().values(),
            cloudOrder(selectedParts),
            titleSort,
        );
        return { docs, total: docs.length };
    });
    let groupDocs = $derived(group.docs.slice(0, getSoftLimit()));
    let groupTotal = $derived(group.total);
    const selDisplay = $derived.by(() => {
        if (selectedParts.length === 0) return "";
        return cloudOrder(selectedParts).join(" + ");
    });
    // adaptHotkey("⌘") 在 Windows 侧返回 "Ctrl+"（带尾随 +），提示文案只要裸键名
    const modKey = adaptHotkey("⌘").replace(/\+$/, "");

    onMount(async () => {
        // 现激活文档初值（Events 单例冷启动恒空——插件重载后收不到 loaded 事件，靠它补初值）
        const info = events.getInfo();
        if (info.docID) curDocID = info.docID;
        // 与面板同款四事件跟随链（面板 initDock 迁入；窗无 dockElement 隐显守卫——独立于面板显隐）
        events.addListener("prefix parts doc follow 2026-09-15 13:30:00", (eventType, detail: Protyle) => {
            if (
                eventType == EventType.loaded_protyle_static ||
                eventType == EventType.loaded_protyle_dynamic ||
                eventType == EventType.click_editorcontent ||
                eventType == EventType.switch_protyle
            ) {
                const { docID } = events.getInfo(detail.protyle);
                if (docID) curDocID = docID;
            }
        });
        tracer = await getDocTracer();
        await readParts();
    });

    async function readParts() {
        if (!tracer) return;
        const aggs = aggregateParts(tracer.getDocMap().values());
        // 徽章口径=组区谓词（matchPart 子串命中），徽章数=点开所见篇数
        const counts = countPartMatches(
            tracer.getDocMap().values(),
            aggs.map((t) => t.part),
        );
        targets = aggs.map((t) => ({ ...t, count: counts.get(t.part) ?? t.count }));
        // 重聚合后陈旧选中项（标签已消失）剔除；filter 恒产新数组=顺手触发组区重算（docMap 非响应式）
        const alive = new Set(targets.map((t) => t.part));
        selectedParts = selectedParts.filter((p) => alive.has(p));
    }

    // 独立挂载后各刷各的（tagsdecouple □1）：窗刷新=重读标签聚合，不再联动面板列表
    async function refresh() {
        await readParts();
        await siyuan.pushMsg(tomatoI18n.刷新, 1000);
    }

    // X 关闭与面板钮同走 write（review P1-1）：set 只改内存，会被后续任意整文件 saveData
    // 搭车落盘（如 DialogSvelte 拖动结束的 userID.write）——关窗是否持久取决于无关操作
    function exit() {
        void prefixArticlesTagsShow.write(false);
    }

    function togglePart(part: string, ev: MouseEvent) {
        if (ev.metaKey || ev.ctrlKey) {
            selectedParts = selectedParts.includes(part)
                ? selectedParts.filter((p) => p !== part)
                : [...selectedParts, part];
        } else {
            // 单击=选中该标签；再点已选中项保持选中不清空（□6 bear 反馈：列表凭空消失=「要多点几下才有」错觉）
            selectedParts = [part];
        }
        // 换组后列表回顶（列表元素复用，滚动位置不会自动重置）
        tick().then(() => {
            if (groupListEl) groupListEl.scrollTop = 0;
        });
    }

    // 清空选择回提示态的唯一入口（□6：取代「再点已选中项」的 toggle-off）
    function clearSelection() {
        selectedParts = [];
    }

    // 点文档=跳转，窗常驻不关；组与选中集维持原状。文档已删=出索引并重聚合
    async function gotoDoc(doc: ArticlesPrefix) {
        if (await siyuan.checkBlockExist(doc.id)) {
            await OpenSyFile2(getTomatoPluginInstance(), doc.id);
        } else {
            tracer.removeDoc(doc.id);
            await readParts();
        }
    }

    // 切换笔记本：重建文档追踪器（闭笔记本后新开的库初始扫描缺文档）+ 插件级重载
    async function switchNotebook() {
        resetDocTracer();
        await reloadSelfPlugin();
    }
</script>

<DialogSvelte
    bind:show={$prefixArticlesTagsShow}
    title={tomatoI18n.标签}
    savePositionKey="prefix parts 2025-07-04 10:48:44"
    onClose={exit}
    minWidth={240}
    minHeight={220}
    width={events.isMobile ? "90vw" : "300px"}
    height={$prefixArticlesTagsGroup ? (events.isMobile ? "70vh" : "460px") : "auto"}
>
    {#snippet dialogInner()}
        <div class="pp-body">
            <div class="pp-head">
                <!-- 组区开关（tagsdecouple □3）：关=窗只剩 chip 云纯标签浏览（列表需求归侧边栏）；两态 title 平铺当前动作 -->
                <button
                    class="pp-iconbtn"
                    class:pp-iconbtn--on={$prefixArticlesTagsGroup}
                    title={$prefixArticlesTagsGroup ? tomatoI18n.隐藏文档列表 : tomatoI18n.显示文档列表}
                    onclick={() => prefixArticlesTagsGroup.write(!$prefixArticlesTagsGroup)}
                >
                    <svg><use xlink:href="#iconList"></use></svg>
                </button>
                <button
                    title={tomatoI18n.切换笔记本}
                    class="pp-iconbtn"
                    onclick={switchNotebook}
                >
                    <svg><use xlink:href="#iconNotebook"></use></svg>
                </button>
                <button title={tomatoI18n.刷新} class="pp-iconbtn" onclick={refresh}>
                    <svg><use xlink:href="#iconRefresh"></use></svg>
                </button>
            </div>
            {#if targets.length === 0}
                <div class="pp-empty">{tomatoI18n.暂无相关文档}</div>
            {:else}
                <div class="pp-cloud" class:pp-cloud--solo={!$prefixArticlesTagsGroup}>
                    {#each targets as t (t.part)}
                        <button
                            class="pp-chip"
                            class:pp-chip--on={selectedParts.includes(t.part)}
                            title={t.part}
                            onclick={(ev) => togglePart(t.part, ev)}
                        >
                            <span class="pp-chip__name">{t.part}</span>
                            <span class="pp-chip__count">{t.count}</span>
                        </button>
                    {/each}
                </div>
                <!-- 组区开关（tagsdecouple □3）：关=只有 chip 云，选中态保留（重开组区直接回显筛选） -->
                {#if $prefixArticlesTagsGroup}
                    {#if selectedParts.length === 0}
                        <div class="pp-hint">
                            <div class="pp-hint__main">{tomatoI18n.点击标签查看这组文档}</div>
                            {#if !events.isMobile}
                                <!-- 移动端无修饰键（tap 自然降级单选）：多选提示不渲染（□4 vision P1） -->
                                <div class="pp-hint__sub">
                                    {tomatoI18n.按住此键点击标签可多选.replace("{k}", modKey)}
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <div class="pp-group">
                            <div class="pp-grouphead">
                                <span class="pp-gcount" title={tomatoI18n.文档数量}
                                    >{groupTotal > groupDocs.length
                                        ? `${groupDocs.length}+`
                                        : groupTotal}{tomatoI18n.篇}</span
                                >
                                <span class="pp-gsel" title={selDisplay}>{selDisplay}</span>
                                <button
                                    class="pp-clearbtn"
                                    title={tomatoI18n.清除选择}
                                    onclick={clearSelection}
                                >
                                    <svg><use xlink:href="#iconClose"></use></svg>
                                </button>
                            </div>
                            <div class="pp-list" bind:this={groupListEl}>
                                {#if groupTotal === 0}
                                    <!-- 空交集：多选筛选无同时命中文档（单选正常态不进——chip 徽章计数
                                         同谓词兜底；targets 陈旧竞态窗口可作单选降级提示，优雅不炸） -->
                                    <div class="pp-nogroup">{tomatoI18n.没有同时含这些标签的文档}</div>
                                {:else}
                                    {#each groupDocs as doc (doc.id)}
                                        <button
                                            class="pp-row"
                                            class:pp-row--cur={doc.id === curDocID}
                                            onclick={() => gotoDoc(doc)}
                                        >
                                            <svg class="pp-row__icon"><use xlink:href="#iconFile"></use></svg>
                                            <span class="pp-row__name">{doc.docName}</span>
                                            <span class="pp-row__hit" title={doc.prefix}>{doc.prefix}</span>
                                        </button>
                                    {/each}
                                {/if}
                            </div>
                        </div>
                    {/if}
                {/if}
            {/if}
        </div>
    {/snippet}
</DialogSvelte>

<style>
    .pp-body {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
    }
    .pp-head {
        display: flex;
        justify-content: flex-end;
        gap: 2px;
        padding: 0 4px 6px;
        border-bottom: 1px solid var(--b3-border-color);
    }
    .pp-iconbtn {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        border-radius: var(--b3-border-radius);
        background: transparent;
        color: var(--b3-theme-on-surface-light);
        cursor: pointer;
    }
    .pp-iconbtn svg {
        width: 14px;
        height: 14px;
    }
    .pp-iconbtn:hover {
        background: var(--b3-list-hover);
        color: var(--b3-theme-on-surface);
    }
    /* 组区开关激活态（列表显示中）：主色示态——chip--on/状态栏钮点亮同语言 */
    .pp-iconbtn--on,
    .pp-iconbtn--on:hover {
        background: color-mix(in srgb, var(--b3-theme-primary) 12%, transparent);
        color: var(--b3-theme-primary);
    }
    /* chip 云：可滚，定高窗内占 30% 上限（□6 收紧：视觉重心让给组区）、内容少随内容收缩 */
    .pp-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: flex-start;
        align-content: flex-start;
        overflow-y: auto;
        max-height: 30%;
        min-height: 0;
        padding: 6px 4px;
        border-bottom: 1px solid var(--b3-border-color);
        box-sizing: border-box;
    }
    /* 精简态（组区关，tagsdecouple □3）：云独占窗体——flex 撑满 + 30% 上限换 60vh 绝对封顶
       （窗 height:auto 收矮后 30% 百分比随矮窗缩水失去滚动价值；60vh 防 auto 高被巨量 chip 撑破视口） */
    .pp-cloud--solo {
        flex: 1 1 auto;
        max-height: 60vh;
        /* 精简态云=窗体唯一内容区，底部悬空分隔线随组区一起退役 */
        border-bottom: none;
    }
    .pp-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        max-width: 100%;
        box-sizing: border-box;
        padding: 2px 8px;
        border: none;
        border-radius: var(--b3-border-radius);
        background: color-mix(in srgb, var(--b3-theme-on-surface-light) 10%, transparent);
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        line-height: 1.4;
        cursor: pointer;
    }
    .pp-chip:hover {
        background: var(--b3-list-hover);
    }
    /* 选中 chip：主色示选（与 dock 面板 Tags 钮激活态同语言） */
    .pp-chip--on,
    .pp-chip--on:hover {
        background: color-mix(in srgb, var(--b3-theme-primary) 12%, transparent);
        color: var(--b3-theme-primary);
    }
    .pp-chip__name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 14em;
    }
    .pp-chip__count {
        flex: none;
        font-size: 10px;
        line-height: 1.4;
        color: var(--b3-theme-on-surface-light);
        background: color-mix(in srgb, var(--b3-theme-on-surface-light) 10%, transparent);
        padding: 0 4px;
        border-radius: var(--b3-border-radius);
    }
    .pp-chip--on .pp-chip__count {
        color: var(--b3-theme-primary);
        background: color-mix(in srgb, var(--b3-theme-primary) 12%, transparent);
    }
    /* 空选态提示：主行正文色+次行弱化（层级差不止字号一档） */
    .pp-hint {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 12px;
        text-align: center;
        font-size: 12px;
    }
    .pp-hint__main {
        color: var(--b3-theme-on-surface);
    }
    .pp-hint__sub {
        font-size: 11px;
        color: var(--b3-theme-on-surface-light);
    }
    .pp-group {
        flex: 1 1 auto;
        /* □6：组区保底高度（矮窗/少结果时列表仍是视觉重心，minHeight 220 窗内不溢出） */
        min-height: 120px;
        display: flex;
        flex-direction: column;
        padding-top: 4px;
    }
    .pp-grouphead {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 2px 6px 6px;
    }
    /* 清除选择钮：pp-iconbtn 同语言的小号变体（组头行内）；触摸端无 hover/title，
       伪元素外扩命中区到 ~28px（视觉不变），× 是移动端唯一清空入口（□6） */
    .pp-clearbtn {
        position: relative;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        padding: 0;
        border: none;
        border-radius: var(--b3-border-radius);
        background: transparent;
        color: var(--b3-theme-on-surface-light);
        cursor: pointer;
    }
    .pp-clearbtn::after {
        content: "";
        position: absolute;
        inset: -5px;
    }
    .pp-clearbtn svg {
        width: 12px;
        height: 12px;
    }
    .pp-clearbtn:hover {
        background: var(--b3-list-hover);
        color: var(--b3-theme-on-surface);
    }
    .pp-gcount {
        flex: none;
        font-size: 11px;
        color: var(--b3-theme-on-surface-light);
        padding: 1px 6px;
        border-radius: var(--b3-border-radius);
        background: color-mix(in srgb, var(--b3-theme-on-surface-light) 10%, transparent);
    }
    /* 当前筛选=哪些标签的交集（平铺不藏 hover，title 只作截断兜底） */
    .pp-gsel {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
        color: var(--b3-theme-on-surface-light);
    }
    .pp-list {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 0 4px 4px;
    }
    /* 空交集提示：组头保留（示所选与 0 篇），列表位居中弱化 */
    .pp-nogroup {
        padding: 12px;
        text-align: center;
        font-size: 12px;
        color: var(--b3-theme-on-surface-light);
    }
    .pp-row {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        box-sizing: border-box;
        padding: 4px 6px;
        margin: 0;
        border: none;
        border-radius: var(--b3-border-radius);
        background: transparent;
        font-size: 12px;
        line-height: 1.4;
        text-align: left;
        cursor: pointer;
    }
    .pp-row:hover {
        background: var(--b3-list-hover);
    }
    .pp-row__icon {
        flex: none;
        width: 14px;
        height: 14px;
        color: var(--b3-theme-on-surface-light);
    }
    .pp-row__name {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--b3-theme-on-surface);
    }
    /* 命中原因徽章：这篇靠哪个选中标签进组 */
    .pp-row__hit {
        flex: none;
        max-width: 42%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
        color: var(--b3-theme-on-surface-light);
        padding: 0 4px;
        border-radius: var(--b3-border-radius);
        background: color-mix(in srgb, var(--b3-theme-on-surface-light) 10%, transparent);
    }
    .pp-empty {
        padding: 12px;
        text-align: center;
        font-size: 12px;
        color: var(--b3-theme-on-surface-light);
    }
    .pp-row--cur .pp-row__name {
        color: var(--b3-theme-primary);
        font-weight: 600;
    }
    .pp-row--cur .pp-row__icon {
        color: var(--b3-theme-primary);
    }
    .pp-row--cur,
    .pp-row--cur:hover {
        background: color-mix(in srgb, var(--b3-theme-primary) 8%, transparent);
    }
    /* 亮色系统灰 2.85:1 偏低，加深一档（□1 pa-count/__hit 同款先例 #6f7377） */
    :global(html[data-theme-mode="light"]) .pp-gcount,
    :global(html[data-theme-mode="light"]) .pp-gsel,
    :global(html[data-theme-mode="light"]) .pp-chip__count,
    :global(html[data-theme-mode="light"]) .pp-row__hit,
    :global(html[data-theme-mode="light"]) .pp-hint__sub,
    :global(html[data-theme-mode="light"]) .pp-nogroup,
    :global(html[data-theme-mode="light"]) .pp-clearbtn,
    :global(html[data-theme-mode="light"]) .pp-iconbtn {
        color: #6f7377;
    }
    /* 亮色激活态：主色须赢过上一条加深清单（(0,2,1) 压 scoped 单类 (0,2,0)）——同 global
       形态平特异性、靠声明顺序后置取胜 */
    :global(html[data-theme-mode="light"]) .pp-iconbtn--on {
        color: var(--b3-theme-primary);
    }
</style>
