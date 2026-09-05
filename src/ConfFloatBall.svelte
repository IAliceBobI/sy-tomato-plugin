<script lang="ts">
    // 设置域组件（二期 14 域 2026-09-05）：悬浮球——悬浮球卡（翻新大功能上浮，自旧「速记」
    // 域拆出独立成域，原 ConfFloatingBall 全部）。自 ConfCapture.svelte 拆出
    // （整卡迁入内部一行不动），共享样式见 IndexConf.css。
    import { onMount } from "svelte";
    import {
        floatingballBallList,
        floatingballDocMenu,
        floatingballDocTabMenu,
        floatingballEnable,
    } from "./libs/stores";
    import {
        FloatingBallDocType_autoclose,
        FloatingBallDocType_dialog,
        FloatingBallDocType_float,
        FloatingBallDocType_tab,
        FloatingBallNotVIPLimit,
    } from "./libs/gconst";
    import { FloatingBallTab添加文档, FloatingBall添加文档, getFloatingBall, linkDoc2floatBall, ballOverLimit } from "./FloatingBall";
    import { openBallEditDialog } from "./libs/ballMenu";
    import { siyuan, icon } from "./libs/utils";
    import { openUnlockDialog } from "./unlockDialog";
    import { shortcut2string } from "./libs/keyboard";
    import { newID } from "stonev5-utils";
    import { cascadeOffset } from "./libs/ballGeometry";
    import { flattenKeymap, keymapMatches, kmGroupLabel, kmLabel, parseKeymapShortcut } from "./libs/ballKeymap";
    import { getTomatoPluginInstance } from "./libs/utils";
    import { lastVerifyResult } from "./libs/user";
    import { events } from "./libs/Events";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    let addDocSettings: HTMLElement = $state();
    let addShortcutSettings: HTMLElement = $state();
    let addDoc_docName = $state("");
    let addDoc_docIcon = $state("");
    let addDoc_keyboardIcon = $state("");
    let addDoc_keyboardpreview = $state("");
    let addDoc_keyboardKeyCode = $state("");
    let addDoc_keyboardAlt = $state(false);
    let addDoc_keyboardShift = $state(false);
    let addDoc_keyboardCtrl = $state(false);
    let addDoc_useDialog = $state(FloatingBallDocType_float.id);

    onMount(() => {
        if (addDocSettings?.style?.display) {
            addDocSettings.style.display = "none";
        }
        if (addShortcutSettings?.style?.display) {
            addShortcutSettings.style.display = "none";
        }
        if (addKeymapSettings?.style?.display) {
            addKeymapSettings.style.display = "none";
        }
        if (addCmdSettings?.style?.display) {
            addCmdSettings.style.display = "none";
        }
        if (addUrlSettings?.style?.display) {
            addUrlSettings.style.display = "none";
        }
        loadTypeSources();
    });

    function toggleDiv(div: HTMLElement) {
        if (div.style.display === "none" || div.style.display === "") {
            div.style.display = "block";
        } else {
            div.style.display = "none";
        }
    }

    function showName(name: string, icon: string, docType?: number) {
        let docTypeStr = "";
        switch (docType) {
            case FloatingBallDocType_tab.id:
                docTypeStr = FloatingBallDocType_tab.txt;
                break;
            case FloatingBallDocType_dialog.id:
                docTypeStr = FloatingBallDocType_dialog.txt;
                break;
            case FloatingBallDocType_autoclose.id:
                docTypeStr = FloatingBallDocType_autoclose.txt;
                break;
            case FloatingBallDocType_float.id:
                docTypeStr = FloatingBallDocType_float.txt;
                break;
            default:
        }
        if (docTypeStr) {
            docTypeStr = `(${docTypeStr})`;
        }

        if (name.toLocaleLowerCase() == icon.toLocaleLowerCase()) {
            return name + docTypeStr;
        }
        return `${name}(${icon})${docTypeStr}`;
    }

    function flatingkbchange() {
        addDoc_keyboardpreview = shortcut2string({
            key: addDoc_keyboardKeyCode,
            altKey: addDoc_keyboardAlt,
            ctrlKey: addDoc_keyboardCtrl,
            shiftKey: addDoc_keyboardShift,
        });
    }

    // 期1 统一球列表的展示与增删（新类型球期2 起进列表，展示走注册表）
    let docBallCount = $derived($floatingballBallList.filter((b) => b.type === "doc").length);
    let kbBallCount = $derived($floatingballBallList.filter((b) => b.type !== "doc").length);
    // 期6 显性灰档：非激活超限球（明面不挂载，列表置灰+VIP 徽标+解锁）
    let overLimitIds = $derived(new Set(ballOverLimit()));

    function ballListMark(item: BallItem) {
        return ({ doc: "📄", shortcut: "⌨️", url: "🌐", plugincmd: "⚡" } as Record<string, string>)[item.type] ?? "⚪";
    }

    function ballListName(item: BallItem) {
        if (item.type === "doc") {
            return showName(item.action?.docName ?? "", item.icon ?? "", item.action?.openDocType);
        }
        if (item.type === "url") {
            return (item.label || item.action?.url || "") + (item.action?.openIn === "siyuan" ? "(思源内)" : "");
        }
        if (item.type === "plugincmd") {
            return item.label || item.action?.cmdKey || "";
        }
        return showName(shortcut2string(item.action), item.icon);
    }

    function removeBall(item: BallItem, index: number) {
        getFloatingBall(item)?.destroyBy();
        $floatingballBallList.splice(index, 1);
        $floatingballBallList = $floatingballBallList;
        floatingballBallList.write();
    }

    // 启停开关变更（期5）：checkbox bind 只改内存，此处落盘+按开关挂/摘球
    function ballEnableChanged() {
        floatingballBallList.write();
        remountAllBalls();
    }

    // 列表项编辑（期3 已有的编辑 Dialog 复用：外观三控件+图标/名称+类型基础字段）
    function editBall(item: BallItem) {
        openBallEditDialog(item);
    }

    // 拖拽排序（期5）：列表序=挂载序（loadFloatingBall 按数组序 for of），也决定新球叠瓦
    // 默认位次；已有球自身位置存 item.anchor/offset 不随排序变。drop 后整表重挂。
    let dragIndex = $state(-1);
    function ballDragStart(index: number) {
        dragIndex = index;
    }
    function ballDragOver(e: DragEvent, index: number) {
        e.preventDefault(); // 允许 drop
        if (dragIndex < 0 || dragIndex === index) return;
        const list = $floatingballBallList;
        const [moved] = list.splice(dragIndex, 1);
        list.splice(index, 0, moved);
        dragIndex = index;
        $floatingballBallList = list;
    }
    function ballDragEnd() {
        if (dragIndex < 0) return;
        dragIndex = -1;
        floatingballBallList.write();
        remountAllBalls();
    }
    function remountAllBalls() {
        for (const b of $floatingballBallList) {
            getFloatingBall(b)?.destroyBy();
        }
        for (const b of $floatingballBallList) {
            if ((events.isMobile ? b.enableMobile : b.enable) !== false) {
                getFloatingBall(b);
            }
        }
    }

    // 文档选择器（期5）：即时搜索下拉（名称+路径），选中落 docID 治手输重名/改名断链
    let addDoc_results = $state<{ id: string; name: string; path: string }[]>([]);
    let addDoc_searchTimer: ReturnType<typeof setTimeout> | null = null;
    function addDocSearch() {
        if (addDoc_searchTimer) clearTimeout(addDoc_searchTimer);
        const q = addDoc_docName.trim();
        if (!q) {
            addDoc_results = [];
            return;
        }
        addDoc_searchTimer = setTimeout(async () => {
            // 模糊搜索（getDocRowsByName 是 content 精确匹配不适合即时搜索）；
            // 引号双写转义防 SQL 语法断裂
            const esc = q.replace(/"/g, '""');
            const rows = (await siyuan.sql(
                `select id, content, hpath from blocks where type='d' and content like "%${esc}%" limit 12`,
            )) ?? [];
            addDoc_results = rows.map((r: any) => ({
                id: r.id,
                name: r.content ?? q,
                path: r.hpath ?? "",
            }));
        }, 250);
    }
    function addDocPick(row: { id: string; name: string }) {
        addDoc_docName = row.name;
        addDoc_selectedID = row.id;
        addDoc_docIcon = addDoc_docIcon || row.name;
        addDoc_results = [];
    }
    function bindDocBall() {
        linkDoc2floatBall(addDoc_docName, addDoc_docIcon, addDoc_useDialog, addDoc_selectedID || undefined);
        addDoc_selectedID = "";
        addDoc_results = [];
    }
    let addDoc_selectedID = $state("");

    function addKeyboardBall() {
        if (!addDoc_keyboardKeyCode) return;
        const icon = addDoc_keyboardIcon || addDoc_keyboardpreview;
        addDoc_keyboardKeyCode = addDoc_keyboardKeyCode.toLocaleUpperCase();
        const sig = (a: any) => `${a.key}#${a.altKey}#${a.ctrlKey}#${a.shiftKey}`;
        const newSig = sig({
            key: addDoc_keyboardKeyCode,
            altKey: addDoc_keyboardAlt,
            ctrlKey: addDoc_keyboardCtrl,
            shiftKey: addDoc_keyboardShift,
        });
        const list = $floatingballBallList;
        const idx = list.findIndex((b) => b.type === "shortcut" && sig(b.action ?? {}) === newSig);
        let ball: BallItem;
        if (idx >= 0) {
            // 同键位=重绑：原位更新保 id（球身份/位置不动）
            ball = list[idx];
            ball.icon = icon;
        } else {
            const cascade = cascadeOffset(list.filter((b) => b.type === "shortcut").length);
            ball = {
                id: newID(),
                type: "shortcut",
                action: {
                    key: addDoc_keyboardKeyCode,
                    altKey: addDoc_keyboardAlt,
                    shiftKey: addDoc_keyboardShift,
                    ctrlKey: addDoc_keyboardCtrl,
                },
                icon,
                anchor: 8,
                offsetX: cascade.offsetX,
                offsetY: cascade.offsetY,
                enable: true,
                enableMobile: true,
            };
            list.push(ball);
        }
        $floatingballBallList = list;
        floatingballBallList.write();
        getFloatingBall(ball);
    }

    // 期2 三新类型的添加入口（基础版，期5 选择器精修）
    let addKeymapSettings: HTMLElement = $state();
    let addCmdSettings: HTMLElement = $state();
    let addUrlSettings: HTMLElement = $state();
    let addKeymapFilter = $state("");
    let addUrl_url = $state("");
    let addUrl_openIn = $state("browser");
    let keymapEntries = $state<{ group: string; name: string; hotkey: string }[]>([]);
    let cmdEntries = $state<{ langKey: string; langText: string; icon?: string }[]>([]);

    function loadTypeSources() {
        if (!keymapEntries.length) {
            keymapEntries = flattenKeymap((window as any).siyuan?.config?.keymap);
        }
        cmdEntries = (getTomatoPluginInstance()?.commands ?? []).map((c) => ({
            langKey: c.langKey,
            langText: c.langText,
        }));
    }

    function keymapVisible(e: { group: string; name: string }) {
        return keymapMatches(e, addKeymapFilter);
    }

    // 挂球（□8）：原始键走 action.km（显示时查 languages 跟随界面语言），label
    // 留给用户在编辑 Dialog 命名——不再落 `group.name` 英文快照。
    function addKeymapBall(e: { group: string; name: string; hotkey: string }) {
        const sc = parseKeymapShortcut(e.hotkey);
        if (!sc) return;
        const sig = (a: any) => `${a.key}#${a.altKey}#${a.ctrlKey}#${a.shiftKey}`;
        const list = $floatingballBallList;
        const idx = list.findIndex((b) => b.type === "shortcut" && sig(b.action ?? {}) === sig(sc));
        let ball: BallItem;
        if (idx >= 0) {
            ball = list[idx];
            ball.icon = e.hotkey;
            ball.action = { ...ball.action, ...sc, km: { group: e.group, name: e.name } };
        } else {
            const cascade = cascadeOffset(list.filter((b) => b.type === "shortcut").length);
            ball = {
                id: newID(),
                type: "shortcut",
                action: { ...sc, km: { group: e.group, name: e.name } },
                icon: e.hotkey,
                anchor: 8,
                offsetX: cascade.offsetX,
                offsetY: cascade.offsetY,
                enable: true,
                enableMobile: true,
            };
            list.push(ball);
        }
        $floatingballBallList = list;
        floatingballBallList.write();
        getFloatingBall(ball);
    }

    function addCmdBall(c: { langKey: string; langText: string; icon?: string }) {
        const list = $floatingballBallList;
        const idx = list.findIndex((b) => b.type === "plugincmd" && b.action?.cmdKey === c.langKey);
        let ball: BallItem;
        if (idx >= 0) {
            ball = list[idx];
            ball.label = c.langText;
        } else {
            const cascade = cascadeOffset(list.filter((b) => b.type === "plugincmd").length);
            ball = {
                id: newID(),
                type: "plugincmd",
                action: { cmdKey: c.langKey },
                icon: c.icon || "⚡",
                label: c.langText,
                anchor: 8,
                offsetX: cascade.offsetX,
                offsetY: cascade.offsetY,
                enable: true,
                enableMobile: true,
            };
            list.push(ball);
        }
        $floatingballBallList = list;
        floatingballBallList.write();
        getFloatingBall(ball);
    }

    function addUrlBall() {
        const url = addUrl_url.trim();
        if (!/^https?:\/\//i.test(url)) return;
        const list = $floatingballBallList;
        const idx = list.findIndex((b) => b.type === "url" && b.action?.url === url);
        let ball: BallItem;
        if (idx >= 0) {
            ball = list[idx];
            ball.action.openIn = addUrl_openIn;
        } else {
            const cascade = cascadeOffset(list.filter((b) => b.type === "url").length);
            ball = {
                id: newID(),
                type: "url",
                action: { url, openIn: addUrl_openIn },
                icon: "🌐",
                anchor: 8,
                offsetX: cascade.offsetX,
                offsetY: cascade.offsetY,
                enable: true,
                enableMobile: true,
            };
            list.push(ball);
        }
        $floatingballBallList = list;
        floatingballBallList.write();
        getFloatingBall(ball);
    }
</script>

    <!-- 悬浮球 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$floatingballEnable} />
            {tomatoI18n.悬浮球}
            <ConfHelpIcon token="IFT9drxvSoYKVmxCcqncFOgknXg" />
        </div>
        {#if $floatingballEnable}
            <div class="helpText">{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$floatingballDocMenu} />
                {tomatoI18n.menu添加右键菜单}: {FloatingBall添加文档.langText()}
                <HotkeyCap hk={FloatingBall添加文档} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$floatingballDocTabMenu} />
                {tomatoI18n.menu添加右键菜单}: {FloatingBallTab添加文档.langText()}
                <HotkeyCap hk={FloatingBallTab添加文档} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <!-- 列出球绑定（期1 统一列表：文档/快捷键两堆合一）；□7：超限 ⚠️ 挂 .alert 行内块，
                 外层整体条件渲染避免空行占位 -->
            {#if (docBallCount > FloatingBallNotVIPLimit || kbBallCount > FloatingBallNotVIPLimit) && !lastVerifyResult()}
                <div>
                    {#if docBallCount > FloatingBallNotVIPLimit}
                        <span class="alert space">⚠️{tomatoI18n.非VIP上限为x个(FloatingBallNotVIPLimit, "📄")}</span>
                    {/if}
                    {#if kbBallCount > FloatingBallNotVIPLimit}
                        <span class="alert">⚠️{tomatoI18n.非VIP上限为x个(FloatingBallNotVIPLimit, "⌨️")}</span>
                    {/if}
                </div>
            {/if}
            <!-- 统一球列表（期5 拖拽排序+编辑钮；期6 灰档：非激活超限球置灰+VIP+解锁） -->
            {#each $floatingballBallList as item, index (item.id)}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="fball-item{dragIndex === index ? ' fball-item--dragging' : ''}{overLimitIds.has(item.id) ? ' fball-item--disabled' : ''}"
                    draggable="true"
                    ondragstart={() => {
                        ballDragStart(index);
                    }}
                    ondragover={(e) => {
                        ballDragOver(e, index);
                    }}
                    ondragend={() => {
                        ballDragEnd();
                    }}
                >
                    <span class="fball-drag" title={tomatoI18n.拖拽排序}>{@html icon("Drag", 14)}</span>
                    <span class="fball-ball" aria-hidden="true">{item.icon}</span>
                    <span class="text fball-name" title={ballListName(item)}>{ballListMark(item)}{ballListName(item)}</span>
                    {#if overLimitIds.has(item.id)}
                        <span class="fball-vip">VIP</span>
                        <button
                            class="b3-button b3-button--text fball-unlock"
                            onclick={() => {
                                openUnlockDialog({ product: "tomato" });
                            }}
                            >
                            {@html icon("Lock", 12)}{tomatoI18n.解锁}
                            </button>
                    {:else}
                        <label>
                            <input type="checkbox" class="b3-switch" bind:checked={item.enable} onchange={ballEnableChanged} />{tomatoI18n.桌面端}
                        </label>
                        <label>
                            <input type="checkbox" class="b3-switch" bind:checked={item.enableMobile} onchange={ballEnableChanged} />{tomatoI18n.移动端}
                        </label>
                        <button
                            class="b3-button b3-button--text"
                            aria-label={tomatoI18n.编辑}
                            onclick={() => {
                                editBall(item);
                            }}
                        >
                            {@html icon("Edit", 14)}
                        </button>
                    {/if}
                    <button
                        class="b3-button b3-button--text fball-del"
                        aria-label={tomatoI18n.删除悬浮球}
                        onclick={() => {
                            removeBall(item, index);
                        }}
                    >
                        {@html icon("Trashcan", 14)}
                    </button>
                </div>
            {/each}
            <!-- 添加按钮（□7：flex gap 8px 替 .space+row-gap；vision P2：flex wrap 防「外链」孤行） -->
            <div class="fball-add-row">
                <button
                    class="b3-button b3-button--outline"
                    onclick={() => {
                        toggleDiv(addDocSettings);
                    }}
                    >{@html icon("Add", 13)}{tomatoI18n.文档}
                </button>
                <button
                    class="b3-button b3-button--outline"
                    onclick={() => {
                        toggleDiv(addShortcutSettings);
                    }}
                    >{@html icon("Add", 13)}{tomatoI18n.快捷键}
                </button>
                <button
                    class="b3-button b3-button--outline"
                    onclick={() => {
                        loadTypeSources();
                        toggleDiv(addKeymapSettings);
                    }}
                    >{@html icon("Add", 13)}{tomatoI18n.官方快捷键}
                </button>
                <button
                    class="b3-button b3-button--outline"
                    onclick={() => {
                        loadTypeSources();
                        toggleDiv(addCmdSettings);
                    }}
                    >{@html icon("Add", 13)}{tomatoI18n.插件命令}
                </button>
                <button
                    class="b3-button b3-button--outline"
                    onclick={() => {
                        toggleDiv(addUrlSettings);
                    }}
                    >{@html icon("Add", 13)}{tomatoI18n.外链}
                </button>
            </div>
            <!-- 官方快捷键球配置（期2 基础版：过滤+平铺；期5 选择器精修） -->
            <div class="fball-add-panel" bind:this={addKeymapSettings} style="display: none;">
                <div class="spacetop">
                    <input
                        class="b3-text-field space"
                        placeholder={tomatoI18n.搜索命令或分组名}
                        bind:value={addKeymapFilter}
                    />
                    ({keymapEntries.filter(keymapVisible).length})
                </div>
                <div class="spacetop" style="max-height: 260px; overflow: auto;">
                    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                    {#each keymapEntries as e (e.group + "/" + e.name)}
                        {#if keymapVisible(e)}
                            <div
                                class="b3-list-item b3-list-item--narrow"
                                style="cursor: pointer;"
                                onclick={() => {
                                    addKeymapBall(e);
                                }}
                            >
                                <span class="ft__on-surface">{e.hotkey}</span>
                                <span class="ft__small" style="margin-left: 8px;" title={`${e.group}/${e.name}`}
                                    >{kmGroupLabel(e.group)}.{kmLabel(e.name)}</span
                                >
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
            <!-- 插件命令球配置（期2 基础版） -->
            <div class="fball-add-panel" bind:this={addCmdSettings} style="display: none;">
                <div class="spacetop" style="max-height: 260px; overflow: auto;">
                    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                    {#each cmdEntries as c (c.langKey)}
                        <div
                            class="b3-list-item b3-list-item--narrow"
                            style="cursor: pointer;"
                            onclick={() => {
                                addCmdBall(c);
                            }}
                        >
                            {c.langText}
                        </div>
                    {/each}
                </div>
            </div>
            <!-- 外链球配置（期2 基础版） -->
            <div class="fball-add-panel" bind:this={addUrlSettings} style="display: none;">
                <div class="spacetop">
                    <input
                        class="b3-text-field space"
                        style="width: 70%;"
                        placeholder="https://…"
                        bind:value={addUrl_url}
                    />
                </div>
                <div class="spacetop">
                    <label class="space">
                        <input type="radio" name="addUrl_openIn" value="browser" bind:group={addUrl_openIn} />
                        {tomatoI18n.默认浏览器}
                    </label>
                    <label class="space">
                        <input type="radio" name="addUrl_openIn" value="siyuan" bind:group={addUrl_openIn} />
                        {tomatoI18n.思源内打开}
                    </label>
                </div>
                <button
                    class="b3-button b3-button--outline spacetop"
                    onclick={() => {
                        addUrlBall();
                    }}
                    >{tomatoI18n.绑定外链到悬浮按钮}
                </button>
            </div>
            <!-- 绑定文档配置（期5：选择器替代手输——即时搜索下拉选中落 docID；
                 $$dailynote 快捷钮照旧） -->
            <div class="fball-add-panel" bind:this={addDocSettings} style="display: none;">
                <div class="spacetop">
                    <input
                        placeholder={tomatoI18n.图标emoji或短字}
                        class="b3-text-field space"
                        bind:value={addDoc_docIcon}
                    />
                </div>
                <div class="spacetop" style="position: relative;">
                    <input
                        class="b3-text-field space"
                        placeholder={tomatoI18n.搜索文档名}
                        bind:value={addDoc_docName}
                        oninput={addDocSearch}
                    />
                    {#if addDoc_results.length}
                        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                        <div
                            class="b3-menu"
                            style="position: absolute; z-index: 10; max-height: 240px; overflow: auto; min-width: 60%;"
                        >
                            {#each addDoc_results as row (row.id)}
                                <div
                                    class="b3-menu__item"
                                    style="cursor: pointer;"
                                    onclick={() => {
                                        addDocPick(row);
                                    }}
                                >
                                    <span>{row.name}</span>
                                    <span class="ft__on-surface" style="margin-left: 8px; font-size: 12px;">{row.path}</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
                <div class="spacetop">
                    <label class="space">
                        <input
                            type="radio"
                            name="addDoc_openType"
                            value={FloatingBallDocType_tab.id}
                            bind:group={addDoc_useDialog}
                        />
                        {FloatingBallDocType_tab.txt}
                    </label>
                    <label class="space">
                        <input
                            type="radio"
                            name="addDoc_openType"
                            value={FloatingBallDocType_dialog.id}
                            bind:group={addDoc_useDialog}
                        />
                        {FloatingBallDocType_dialog.txt}
                    </label>
                    <label class="space">
                        <input
                            type="radio"
                            name="addDoc_openType"
                            value={FloatingBallDocType_autoclose.id}
                            bind:group={addDoc_useDialog}
                        />
                        {FloatingBallDocType_autoclose.txt}
                    </label>
                    <label class="space">
                        <input
                            type="radio"
                            name="addDoc_openType"
                            value={FloatingBallDocType_float.id}
                            bind:group={addDoc_useDialog}
                        />
                        {FloatingBallDocType_float.txt}
                    </label>
                </div>
                <button
                    class="b3-button b3-button--outline spacetop"
                    onclick={() => {
                        bindDocBall();
                    }}
                    >{tomatoI18n.绑定文档到悬浮按钮}
                </button>
                <button
                    class="b3-button b3-button--outline spacetop"
                    onclick={() => {
                        addDoc_docName = "$$dailynote";
                        addDoc_docIcon = "🗓️📒";
                    }}
                    >{tomatoI18n.特殊绑定当天日志}
                </button>
            </div>
            <!-- 绑定快捷键配置 -->
            <div class="fball-add-panel" bind:this={addShortcutSettings} style="display: none;">
                <div class="spacetop">
                    <input
                        placeholder={addDoc_keyboardpreview}
                        class="b3-text-field space"
                        bind:value={addDoc_keyboardIcon}
                    />{tomatoI18n.图标}
                </div>
                <div class="spacetop">
                    <input
                        class="b3-text-field space"
                        bind:value={addDoc_keyboardKeyCode}
                        oninput={flatingkbchange}
                    />{tomatoI18n.键}
                </div>
                <div class="spacetop">
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={addDoc_keyboardAlt}
                            onchange={flatingkbchange}
                        />alt
                    </label>
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={addDoc_keyboardShift}
                            onchange={flatingkbchange}
                        />shift
                    </label>
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={addDoc_keyboardCtrl}
                            onchange={flatingkbchange}
                        />{events.isMac ? "cmd" : "ctrl"}
                    </label>
                </div>
                <button
                    class="b3-button b3-button--outline spacetop"
                    onclick={() => {
                        addKeyboardBall();
                    }}
                    >{tomatoI18n.绑定快捷键到悬浮按钮 + addDoc_keyboardpreview}
                </button>
            </div>
        {/if}
    </div>

<style>
    /* ── □7 悬浮球段视觉翻新（方案 A 五件事+预览球降级件；逻辑零改动，仅样式层）──
       间距/承载/内衬壳均组件 scoped，不碰 IndexConf.css（避免共享样式跨插件重建链）。 */
    /* 球行加承载：surface 混色底+6px 圆角（与 settingBox 同档）+行距 6px+hover 加深；
       .settingBox 前缀升特异性压全局 `> div:not(:last-child)` 的 12px 行距 */
    .settingBox .fball-item {
        display: flex;
        align-items: center;
        column-gap: 8px;
        margin-bottom: 6px;
        padding: 6px 8px;
        border-radius: 6px;
        background-color: var(--b3-list-hover, var(--b3-theme-surface-lighter));
        transition: background-color 0.15s;
    }
    .settingBox .fball-item:hover {
        background-color: color-mix(in srgb, var(--b3-theme-on-surface) 6%, var(--b3-theme-surface-lighter));
    }
    .fball-item.fball-item--dragging {
        background: var(--b3-theme-primary-lightest);
    }
    .fball-item:global(.fball-item--disabled) {
        opacity: 0.45;
    }
    /* 预览小球（降级件）：所见即所得渲染 item.icon，料对齐期4 球本体（surface 底+圆形无框）；
       快捷键串类长 icon 靠 overflow 收口 */
    .fball-ball {
        flex: 0 0 24px;
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: var(--b3-theme-surface);
        font-size: 10px;
        line-height: 1;
        overflow: hidden;
    }
    /* 期6 灰档 VIP 徽标（批注收集灰档同款形态）；margin 已被容器 gap 取代 */
    .fball-vip {
        font-size: 10px;
        font-weight: 600;
        color: var(--b3-card-info-color, var(--b3-theme-primary));
        border: 1px solid currentColor;
        border-radius: var(--b3-border-radius);
        padding: 0 4px;
        flex-shrink: 0;
    }
    /* vision 评审 P1：开关标签禁折行（「桌面端」被挤成竖排两行） */
    .fball-item label {
        white-space: nowrap;
        flex-shrink: 0;
    }
    /* vision 评审 P1：名称列单行省略（长名/URL 折行使行高膨胀一倍），全名走 title */
    .fball-item .fball-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .fball-item .fball-drag {
        display: inline-flex;
        flex-shrink: 0;
        cursor: grab;
    }
    /* sprite 图标（@html 注入，无 scoped hash）：fill 跟随文字色，双主题自适应 */
    .fball-item :global(svg),
    .fball-add-row :global(svg) {
        fill: currentColor;
    }
    /* 图标+文字组合钮（解锁/添加）：svg 与文字隔 4px（flex 布局 margin 生效） */
    .fball-unlock :global(svg),
    .fball-add-row :global(svg) {
        margin-right: 4px;
    }
    /* 删除钮 hover 变红：对齐管理书目 tomato-item-del 规格 */
    .fball-item .fball-del:hover {
        color: var(--b3-theme-error);
    }
    /* 添加钮行：flex gap 8px 替 .space+row-gap（防「外链」孤行 wrap） */
    .fball-add-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    /* 五展开表单统一内衬壳：surface-lighter 半透+圆角+内衬（display:none↔block 直切逻辑不动） */
    .fball-add-panel {
        padding: 8px 10px;
        border-radius: 6px;
        background-color: color-mix(in srgb, var(--b3-theme-surface-lighter) 45%, transparent);
    }
    /* 本段 spacetop 归轨 12px（升特异性压全局 5px）；首行不叠壳顶 padding */
    .fball-add-panel .spacetop {
        margin-top: 12px;
    }
    .fball-add-panel > .spacetop:first-child {
        margin-top: 0;
    }
    /* vision 评审 P2：表单 label 禁折行（「悬浮窗float」断行后 float 孤字落行首像幽灵选项，折行只允许发生在 label 之间） */
    .fball-add-panel label {
        white-space: nowrap;
    }
</style>
