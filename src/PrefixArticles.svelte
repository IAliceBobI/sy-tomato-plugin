<script lang="ts">
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    import { onMount, tick } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { getDocTracer, OpenSyFile2, resetDocTracer } from "./libs/docUtils";
    import { reloadSelfPlugin } from "./libs/pluginReload";
    import { getTomatoPluginInstance, Siyuan, siyuan } from "./libs/utils";
    import { sqlQuoteStr } from "./libs/strUtils";
    import { events, EventType } from "./libs/Events";
    import { getPrefixDocs } from "./PrefixArticles";
    import { Protyle } from "siyuan";
    import { tomatoI18n } from "./tomatoI18n";
    import { prefixArticlesTagsShow } from "./libs/stores";

    interface Props {
        dockElement?: HTMLElement;
        dm: DestroyManager;
        isDock?: boolean;
        currentDocID?: string;
        currentDocName?: string;
        prefixDocs?: ArticlesPrefix[];
    }

    let {
        dockElement = null,
        dm,
        isDock = false,
        currentDocID = "",
        currentDocName = "",
        prefixDocs = [],
    }: Props = $props();
    let showPrefixDialog = $state(false);
    let newPrefix = $state("");
    let oldPrefix = $state("");

    onMount(() => {
        if (isDock) {
            initDock();
        } else {
            initDialog();
        }
    });

    async function initDialog() {
        if (currentDocID) {
            // prefixDocs 赋值后 DOM 未刷（Svelte 异步渲染）——直查行必扑空走 else 清掉
            // currentDocID，当前文档高亮/滚动定位双失（旧版同款竞态，高亮形态下显形）
            await tick();
            const btn = document.getElementById(
                `prefixDoc#${isDock}#${currentDocID}`,
            ) as HTMLButtonElement;
            if (btn) {
                btn.scrollIntoView({ block: "center", behavior: "auto" });
            } else {
                const tracer = await getDocTracer();
                tracer.tryGetDocs(currentDocID);
                currentDocID = "";
            }
        }
    }

    async function initDock() {
        events.addListener(
            "preffix svelte 2025-06-26 23:13:52",
            (eventType, detail: Protyle) => {
                if (
                    eventType == EventType.loaded_protyle_static ||
                    eventType == EventType.loaded_protyle_dynamic ||
                    eventType == EventType.click_editorcontent ||
                    eventType == EventType.switch_protyle
                ) {
                    clickEvent(detail);
                }
            },
        );
    }

    async function clickEvent(detail: Protyle) {
        const stop =
            dockElement.clientWidth < 10 || dockElement.clientHeight < 10;
        if (stop) return;
        navigator.locks.request(
            "preffix svelte lock 2025-06-26 23:13:52",
            { ifAvailable: true },
            async (lock) => {
                if (lock) {
                    const { docID, name } = events.getInfo(detail.protyle);
                    if (!docID || !name) return;
                    if (docID != currentDocID || name != currentDocName) {
                        currentDocID = docID;
                        currentDocName = name;
                        {
                            let oldName = currentDocName.replaceAll("丨", "|");
                            if (oldName.includes("|")) {
                                oldName = oldName.split("|").at(0).trim();
                            }
                            if (!oldPrefix) oldPrefix = oldName;
                        }
                        prefixDocs = await getPrefixDocs(docID, name);
                    }
                    await initDialog();
                }
            },
        );
    }

    async function cancel() {
        showPrefixDialog = false;
    }
    async function batchRenamePrefix() {
        showPrefixDialog = false;
        newPrefix = newPrefix.trim();
        oldPrefix = oldPrefix.trim();
        if (!newPrefix || !oldPrefix) return;
        if (!Siyuan.config?.repo?.key) {
            await siyuan.pushMsg(
                tomatoI18n.你还没秘钥插件无法为您创建本地快照,
                0,
            );
            return;
        }
        await siyuan.createSnapshot("tomato-prefix-rename");
        const rows = await siyuan.sql(
            // 用户输入直拼 SQL 掺引号会炸语句（内核静默 null）——like 值整体过 sqlQuoteStr
            `select id,content,box,path from blocks where type='d' and content like ${sqlQuoteStr(oldPrefix + "%")} limit 999999`,
        );
        for (const row of rows) {
            const title = row.content.replace(oldPrefix, newPrefix);
            await siyuan.renameDoc(row.box, row.path, title);
            await siyuan.pushMsg(`${row.content}  ->  ${title}`);
        }
        siyuan.pushMsg(tomatoI18n.重命名完成);
        siyuan.pushMsg(tomatoI18n.已经创建快照, 1000 * 20);
    }

    // 独立挂载后各刷各的（tagsdecouple □1）：面板刷新=重读列表，不再联动 Tags 窗
    async function refresh() {
        prefixDocs = await getPrefixDocs(currentDocID, currentDocName, true);
        await siyuan.pushMsg(tomatoI18n.刷新, 1000);
    }

    // 切换笔记本：重建文档追踪器（闭笔记本后新开的库初始扫描缺文档）+ 插件级重载
    async function switchNotebook() {
        resetDocTracer();
        await reloadSelfPlugin();
    }
</script>

<div class="pa-panel" class:pa-panel--dialog={!isDock}>
    <div class="pa-head">
        <span class="pa-count" title={tomatoI18n.文档数量}
            >{prefixDocs.length}{tomatoI18n.篇}</span
        >
        <button
            title={tomatoI18n.切换笔记本}
            class="pa-iconbtn"
            onclick={switchNotebook}
        >
            <svg><use xlink:href="#iconNotebook"></use></svg>
        </button>
        <button
            title={tomatoI18n.批量改前缀}
            class="pa-iconbtn"
            onclick={() => {
                showPrefixDialog = !showPrefixDialog;
            }}
        >
            <svg><use xlink:href="#iconEdit"></use></svg>
        </button>
        {#if isDock}
            <!-- Tags 钮只留 dock 面板（review P1-3）：Dialog 分支（⇧⌥G/右键弹窗）开着时独立
                 Tags 窗 z=12 压在官方 Dialog 遮罩（z 自 200 爬升）之下变暗不可点——入口收敛 -->
            <button
                title={tomatoI18n.标题内竖线分割出来的标签}
                class="pa-iconbtn"
                class:pa-iconbtn--on={$prefixArticlesTagsShow}
                onclick={() => {
                    prefixArticlesTagsShow.write(!$prefixArticlesTagsShow);
                }}
            >
                <svg><use xlink:href="#iconTags"></use></svg>
            </button>
        {/if}
        <button
            title={tomatoI18n.刷新}
            class="pa-iconbtn"
            onclick={refresh}
        >
            <svg><use xlink:href="#iconRefresh"></use></svg>
        </button>
    </div>
    {#if prefixDocs.length === 0}
        <div class="pa-empty">{tomatoI18n.暂无相关文档}</div>
    {:else}
        <div class="pa-list">
            {#each prefixDocs as doc (doc.id)}
                {#if doc}
                    <button
                        class="pa-row"
                        id={`prefixDoc#${isDock}#${doc.id}`}
                        class:pa-row--cur={doc.id === currentDocID}
                        onclick={async () => {
                            if (await siyuan.checkBlockExist(doc.id)) {
                                OpenSyFile2(getTomatoPluginInstance(), doc.id);
                            } else {
                                const tracer = await getDocTracer();
                                tracer.removeDoc(doc.id);
                                currentDocID = "";
                            }
                            if (!isDock) {
                                dm.destroyBy();
                            }
                        }}
                    >
                        <svg class="pa-row__icon"><use xlink:href="#iconFile"></use></svg>
                        <span class="pa-row__name">{doc.docName}</span>
                        <span class="pa-row__hit" title={doc.prefix}>{doc.prefix}</span>
                    </button>
                {/if}
            {/each}
        </div>
    {/if}
    <DialogSvelte
        title={tomatoI18n.批量改前缀}
        bind:show={showPrefixDialog}
        savePositionKey="prefix batch modify 2025-07-04 12:06:06"
    >
        {#snippet dialogInner()}
            <div style="margin-bottom:8px;">{tomatoI18n.请输入原前缀}:</div>
            <input
                class="b3-text-field"
                bind:value={oldPrefix}
                maxlength="25"
                style="width:25em;margin-bottom:8px;"
            />
            <div style="margin-bottom:8px;">{tomatoI18n.请输入新前缀}:</div>
            <input
                class="b3-text-field"
                bind:value={newPrefix}
                maxlength="25"
                style="width:25em;margin-bottom:12px;"
            />
            <div style="display:flex;justify-content:flex-end;gap:8px;">
                <button
                    class="b3-button b3-button--outline tomato-button"
                    onclick={cancel}>{tomatoI18n.取消}</button
                >
                <button
                    class="b3-button b3-button--outline tomato-button"
                    onclick={batchRenamePrefix}>{tomatoI18n.确定}</button
                >
            </div>
        {/snippet}
    </DialogSvelte>
</div>

<style>
    /* dock 高度塌缩家族防御（css.md 同款）：dock 挂载点已 flex 化（PrefixArticles.ts init），
       面板 flex:1 接管；⇧⌥G Dialog 分支无 flex 父链=fallback 内容自然高、dialog body 自滚 */
    .pa-panel {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
    .pa-head {
        display: flex;
        align-items: center;
        gap: 2px;
        /* 10px 与列表区（4px 容器+6px 行内 padding）两侧对齐（vision 二轮 P2-1 实测） */
        padding: 4px 10px;
        border-bottom: 1px solid var(--b3-border-color);
        /* Dialog 分支（挂载点无 flex 链）由 b3-dialog__body 滚动：头部吸顶防滚出视野 */
        position: sticky;
        top: 0;
        z-index: 1;
        background: var(--b3-theme-background);
    }
    /* 弹窗 body 是 surface 色一档（非 background）：吸顶头同底才不显异色带（vision 二轮 P1-1） */
    .pa-panel--dialog .pa-head {
        background: var(--b3-theme-surface);
    }
    .pa-count {
        margin-right: auto;
        /* 窄 dock（~150px）下「17篇」曾被挤成两行竖排（□4 vision P1）：可收缩+nowrap+省略，
           计数 chip 先让位（图标钮 flex:none 恒保） */
        flex: 0 1 auto;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 11px;
        color: var(--b3-theme-on-surface-light);
        padding: 1px 6px;
        border-radius: var(--b3-border-radius);
        background: color-mix(in srgb, var(--b3-theme-on-surface-light) 10%, transparent);
    }
    .pa-iconbtn {
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
    .pa-iconbtn svg {
        width: 14px;
        height: 14px;
    }
    .pa-iconbtn:hover {
        background: var(--b3-list-hover);
        color: var(--b3-theme-on-surface);
    }
    /* Tags 窗开着=激活态（主色示开，与按钮热区同 24px） */
    .pa-iconbtn--on,
    .pa-iconbtn--on:hover {
        color: var(--b3-theme-primary);
        background: color-mix(in srgb, var(--b3-theme-primary) 10%, transparent);
    }
    .pa-list {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 4px;
    }
    .pa-row {
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
    .pa-row:hover {
        background: var(--b3-list-hover);
    }
    .pa-row__icon {
        flex: none;
        width: 14px;
        height: 14px;
        color: var(--b3-theme-on-surface-light);
    }
    .pa-row__name {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--b3-theme-on-surface);
    }
    /* 命中原因徽章（想法3）：这篇靠哪个标签/前缀进组 */
    .pa-row__hit {
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
    /* 亮色系统灰 2.85:1 偏低，加深一档（kb-folder 家族同款先例，4.6:1） */
    :global(html[data-theme-mode="light"]) .pa-row__hit,
    :global(html[data-theme-mode="light"]) .pa-count {
        color: #6f7377;
    }
    .pa-row--cur .pa-row__name {
        color: var(--b3-theme-primary);
        font-weight: 600;
    }
    .pa-row--cur .pa-row__icon {
        color: var(--b3-theme-primary);
    }
    .pa-row--cur,
    .pa-row--cur:hover {
        background: color-mix(in srgb, var(--b3-theme-primary) 8%, transparent);
    }
    .pa-empty {
        padding: 12px;
        text-align: center;
        font-size: 12px;
        color: var(--b3-theme-on-surface-light);
    }
</style>
