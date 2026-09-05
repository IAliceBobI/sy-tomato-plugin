<script lang="ts">
    // 设置对话框主壳：付费状态条、搜索栏、左侧 14 域导航、sticky footer 保存条 + 14 个域组件
    // （Conf*.svelte，右侧单域渲染）。共享样式在 ./IndexConf.css（.tomato-settings-dialog 作用域）。
    // 2026-08 重构：原 2628 行大文件按功能域拆出 8 个分区子组件；2026-09-03 设置页重划：
    // □1 双栏壳（左导航+右长滚动）→ □2 域组件拆并——旧 10 个 Conf 退役，域组件
    // 单域渲染（点导航=切换渲染域，过渡态锚点表 NAV_ANCHOR 随之退役）→ □3 搜索适配：
    // searchKey 非空=右侧切「全部」聚合视图（全域同屏复用组件实例+域标题行，searchSettings
    // 深收 querySelectorAll(".conf-group") 天然跨域过滤，ui.ts 零改动）+导航高亮命中域
    // （点击=清搜索跳域；inert/淡化过渡态随之退役）；清空回 navActive 域。
    // 二期 14 域（2026-09-05）：主题细分打底+「已翻新大功能在上、待翻新在下」靠顺序表达
    // ——ConfAI/ConfEditBlock 拆退役（→批注/AI 问答、块编辑/阅读/编辑器工具），ConfCapture
    // 拆出悬浮球独立成域，导出工作空间自 ConfGeneral 独立成域（ConfExport），ConfLink 两卡
    // 收折叠垫底区；导航一列不分段、不显式标记翻新状态（旧 navActive id 三枚映射兼容）。
    // 双栏样式挂 .tomato-settings-nav 新作用域类（渐进/recite 根节点同挂 .tomato-settings-dialog，公共类勿动）。
    import "./IndexConf.css";
    import { onDestroy, onMount, tick } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
    import { STORAGE_SETTINGS } from "./constants";
    import { tomatoI18n } from "./tomatoI18n";
    import { saveRestorePagePosition } from "./libs/utils";
    import { reloadSelfPlugin } from "./libs/pluginReload";
    import UpgradeBar from "./UpgradeBar.svelte";
    import { lastVerifyResult } from "./libs/user";
    import { searchSettings } from "./libs/ui";
    import ConfPomodoro from "./ConfPomodoro.svelte";
    import ConfAnno from "./ConfAnno.svelte";
    import ConfLink from "./ConfLink.svelte";
    import ConfVisual from "./ConfVisual.svelte";
    import ConfReader from "./ConfReader.svelte";
    import ConfBlockEdit from "./ConfBlockEdit.svelte";
    import ConfFloatBall from "./ConfFloatBall.svelte";
    import ConfExport from "./ConfExport.svelte";
    import ConfFlashcard from "./ConfFlashcard.svelte";
    import ConfDocs from "./ConfDocs.svelte";
    import ConfEditorTools from "./ConfEditorTools.svelte";
    import ConfCapture from "./ConfCapture.svelte";
    import ConfAIBox from "./ConfAIBox.svelte";
    import ConfGeneral from "./ConfGeneral.svelte";
    interface Props {
        dm: DestroyManager;
        plugin: BaseTomatoPlugin;
        /** header Pro 徽标节点（□3）：激活态回写窗口内由 $effect 接管显隐 */
        proBadge?: HTMLElement;
    }

    let { dm, plugin = $bindable(), proBadge }: Props = $props();
    let settingsDiv: HTMLElement = $state();
    let searchInput: HTMLElement = $state();
    // 初值取 verify 懒缓存（cssStyle 等启动链通常已验证），未验证时 UpgradeBar onMount
    // verify 纠正回写——已激活用户开面板不闪状态条（与渐进面板同款防闪）
    let codeValid = $state(lastVerifyResult() === true);
    // □3：header Pro 徽标随激活态显隐（懒缓存未命中时 UpgradeBar onMount verify 回写纠正）
    $effect(() => {
        if (proBadge) proBadge.style.display = codeValid ? "" : "none";
    });
    let searchKey = $state("");
    const SearchKeyItemKey = "tomato_settings_SearchKeyItemKey_RfrUm9VLS4GehTzg5ygRrNT";
    // 导航 14 域（二期 2026-09-05）：上半 8=已翻新大牌（番茄钟/批注/反链与引用/可视化/阅读/
    // 块编辑/悬浮球/导出工作空间），下半 6=待翻新按受欢迎排（闪卡/文档管理/编辑器工具/速记/
    // AI 问答/通用）；label 为惰性取值（tomatoI18n 依 window 语言动态切，模板每次渲染现取，
    // 勿在模块顶层快照）
    const NAV_DOMAINS: Array<{ id: string; label: () => string }> = [
        { id: "pomodoro", label: () => tomatoI18n.番茄钟 },
        { id: "anno", label: () => tomatoI18n.批注 },
        { id: "link", label: () => tomatoI18n.反链与引用 },
        { id: "visual", label: () => tomatoI18n.可视化 },
        { id: "reader", label: () => tomatoI18n.阅读 },
        { id: "blockedit", label: () => tomatoI18n.块编辑 },
        { id: "floatball", label: () => tomatoI18n.悬浮球 },
        { id: "export", label: () => tomatoI18n.导出工作空间域 },
        { id: "flashcard", label: () => tomatoI18n.闪卡 },
        { id: "docs", label: () => tomatoI18n.文档管理 },
        { id: "editortools", label: () => tomatoI18n.编辑器工具 },
        { id: "capture", label: () => tomatoI18n.速记 },
        { id: "aibox", label: () => tomatoI18n.AI问答 },
        { id: "general", label: () => tomatoI18n.通用 },
    ];
    let navActive = $state("pomodoro");
    const NavKeyItemKey = "tomato_settings_NavKeyItemKey_LE2WBlXRG9LGVH2AA3VwzehW1";
    // 二期存量兼容：一期 9 域 id 与新 id 不同名的三枚映射（其余 6 个旧 id 不变名免映射；
    // 未命中 some 校验落默认番茄钟的既有兜底保留）
    const LEGACY_NAV_MAP: Record<string, string> = {
        editblock: "blockedit",
        capture: "floatball",
        ai: "anno",
    };
    // □3 聚合视图：searchKey 非空=全 14 域聚合渲染，navActive 冻结待清空回位；
    // navHits=各域是否有命中卡（searchSettings 过滤后从 DOM 回读），驱动导航项高亮
    let navHits: Record<string, boolean> = $state({});
    // 输入沿聚合视图进出跳变跟踪（非响应式：只用于进/出沿触发滚顶，逐键过滤不触发）
    let searching = false;
    let navListEl: HTMLElement = $state();
    // 窄屏 tab 条（480 断点横滚形态）：激活项滚入视野（vision R1 P1-1）。宽屏一列
    // 形态无横向溢出，scrollTo 天然无感；只滚 tab 条自身，不用 scrollIntoView——
    // 它会连带滚外层滚动容器把面板内容拽走。除切域（$effect 跟 navActive）外，
    // 跨断点 resize（navActive 不变）由 resize 监听补一滚
    function keepActiveTabVisible() {
        if (!navListEl) return;
        const active = navListEl.querySelector<HTMLElement>(".tomato-nav-item--active");
        if (!active) return;
        navListEl.scrollTo({
            left: Math.max(0, active.offsetLeft - (navListEl.clientWidth - active.offsetWidth) / 2),
        });
    }
    $effect(() => {
        if (navActive) keepActiveTabVisible();
    });
    onDestroy(() => {
        dm.destroyBy("2");
        window.removeEventListener("resize", keepActiveTabVisible);
        localStorage.setItem(SearchKeyItemKey, searchKey);
        localStorage.setItem(NavKeyItemKey, navActive);
    });

    function navGo(id: string) {
        // 搜索态点导航=退出聚合视图清搜索跳该域（「搜索全库找、浏览按域翻」的跳转出口）
        if (searchKey) {
            searchKey = "";
            navHits = {};
            searching = false;
            localStorage.setItem(SearchKeyItemKey, "");
            scrollPanelTop();
        }
        navActive = id;
        localStorage.setItem(NavKeyItemKey, id);
    }

    // 过滤完成后从 DOM 回读各域命中态（section 内有任一可见 settingBox 即命中）——
    // searchSettings 是纯 DOM 过滤不含此语义，必须在它之后取
    function updateNavHits() {
        const hits: Record<string, boolean> = {};
        settingsDiv?.querySelectorAll("section.conf-group[data-domain]").forEach((sec) => {
            const el = sec as HTMLElement;
            const id = el.dataset.domain;
            if (!id) return;
            hits[id] = [...el.querySelectorAll(".settingBox")].some(
                (b) => (b as HTMLElement).style.display !== "none",
            );
        });
        navHits = hits;
    }

    // 进/出聚合视图时面板滚回顶部（真滚动容器 .b3-dialog__body=saveRestorePagePosition 同款定位；
    // 逐键输入不触发——用户在聚合结果里翻看时续输字符不能拽回顶部）
    function scrollPanelTop() {
        (settingsDiv?.closest(".b3-dialog__body") as HTMLElement | null)?.scrollTo({ top: 0 });
    }

    onMount(async () => {
        window.tomato_zZmqus5PtYRi.save = save;
        window.addEventListener("resize", keepActiveTabVisible);
        saveRestorePagePosition(
            "tomato_settings_scrollPosition_YELnPikKNirXyQqzIHNB",
            dm,
            settingsDiv?.parentElement?.parentElement,
            false,
        );
        const savedSearchKey = localStorage.getItem(SearchKeyItemKey);
        if (savedSearchKey) {
            // 持久化搜索词非空=直接进聚合视图（onDestroy 冻存的搜索态原样恢复）
            searchKey = savedSearchKey;
            searching = true;
            await tick();
            if (settingsDiv) {
                searchSettings(settingsDiv, searchKey);
                updateNavHits();
            }
        }
        // 导航位置记忆：恢复上次分区（首开无存储落「番茄钟」默认）。单域渲染无长滚动，
        // 纯状态切换即可——像素级滚动恢复已随长滚动形态退役。旧 id 先过映射再校验
        const savedNav = localStorage.getItem(NavKeyItemKey);
        if (savedNav) {
            const migrated = LEGACY_NAV_MAP[savedNav] ?? savedNav;
            if (NAV_DOMAINS.some((d) => d.id === migrated)) {
                navActive = migrated;
            }
        }
        searchInput.focus();
    });

    async function save() {
        dm.destroyBy();
        await plugin.saveData(STORAGE_SETTINGS, plugin.settingCfg);
        await reloadSelfPlugin();
    }
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<div class="tomato-settings-dialog fn_flex fn_flex-column" bind:this={settingsDiv}>
    <!-- 付费状态条（□1）：未激活一行入口，点击弹统一解锁框；已激活整条不渲染 -->
    <UpgradeBar
        product="tomato"
        bind:codeValid
        onActivated={() => plugin.saveData(STORAGE_SETTINGS, plugin.settingCfg)}
    ></UpgradeBar>
    <!-- search -->
    <div class="settingBox search-bar" data-search>
        <input
            bind:this={searchInput}
            class="b3-text-field"
            placeholder={tomatoI18n.search搜索配置}
            bind:value={searchKey}
            oninput={async () => {
                localStorage.setItem(SearchKeyItemKey, searchKey);
                const entering = !!searchKey && !searching;
                const leaving = !searchKey && searching;
                searching = !!searchKey;
                // 空→非空跳变须等聚合视图挂载再过滤（同分支跳变 tick 只是空冲刷）
                await tick();
                searchSettings(settingsDiv, searchKey);
                if (searchKey) updateNavHits();
                else navHits = {};
                if (entering || leaving) scrollPanelTop();
            }}
        />
    </div>
    <!-- 双栏：左 9 域导航 + 右内容区（浏览态单域渲染 / 搜索态「全部」聚合视图）。
         data-search= searchSettings 候选跳过（容器 textContent 含全库设置文案，不跳则恒命中
         无意义）；样式挂 .tomato-settings-nav 作用域。搜索态导航不再 inert（□3）：命中域
         高亮，点击即清搜索跳该域 -->
    <div class="tomato-settings-nav" data-search>
        <nav class="tomato-nav-list" bind:this={navListEl}>
            {#each NAV_DOMAINS as d (d.id)}
                <button
                    class="tomato-nav-item"
                    class:tomato-nav-item--active={navActive === d.id && !searchKey}
                    class:tomato-nav-item--hit={!!searchKey && navHits[d.id]}
                    onclick={() => navGo(d.id)}
                >{d.label()}</button>
            {/each}
        </nav>
        <div class="tomato-nav-content">
            <!-- 14 域组件渲染抽出 snippet 供两个分支复用（ConfAnno/ConfReader/ConfEditorTools/
                 ConfFloatBall/ConfAIBox 无 VIP 门控行不收 codeValid，其余域原样） -->
            {#snippet domainCards(id: string)}
                {#if id === "pomodoro"}
                    <ConfPomodoro {codeValid}></ConfPomodoro>
                {:else if id === "anno"}
                    <ConfAnno></ConfAnno>
                {:else if id === "link"}
                    <ConfLink {codeValid}></ConfLink>
                {:else if id === "visual"}
                    <ConfVisual {codeValid}></ConfVisual>
                {:else if id === "reader"}
                    <ConfReader></ConfReader>
                {:else if id === "blockedit"}
                    <ConfBlockEdit {codeValid}></ConfBlockEdit>
                {:else if id === "floatball"}
                    <ConfFloatBall></ConfFloatBall>
                {:else if id === "export"}
                    <ConfExport {codeValid}></ConfExport>
                {:else if id === "flashcard"}
                    <ConfFlashcard {codeValid}></ConfFlashcard>
                {:else if id === "docs"}
                    <ConfDocs {codeValid}></ConfDocs>
                {:else if id === "editortools"}
                    <ConfEditorTools></ConfEditorTools>
                {:else if id === "capture"}
                    <ConfCapture {codeValid}></ConfCapture>
                {:else if id === "aibox"}
                    <ConfAIBox></ConfAIBox>
                {:else}
                    <ConfGeneral {codeValid}></ConfGeneral>
                {/if}
            {/snippet}
            {#if searchKey}
                <!-- 聚合视图（□3）：全 14 域同屏+域标题行做域界标，data-domain 供 updateNavHits
                     回读命中态；searchSettings 深收按域过滤、空域整节隐藏 -->
                {#each NAV_DOMAINS as d (d.id)}
                    <section class="conf-group" data-domain={d.id}>
                        <div class="tomato-agg-title">{d.label()}</div>
                        {@render domainCards(d.id)}
                    </section>
                {/each}
            {:else}
                {#each NAV_DOMAINS as d (d.id)}
                    {#if navActive === d.id}
                        <section class="conf-group" data-domain={d.id}>
                            {@render domainCards(d.id)}
                        </section>
                    {/if}
                {/each}
            {/if}
        </div>
    </div>
    <!-- save（□3）：52px sticky footer 收底，主色「保存并关闭」（原面板末位 outline 保存行退役） -->
    <div class="settings-footer">
        <button class="b3-button tomato-save-btn" onclick={save}>{tomatoI18n.保存并关闭}</button>
    </div>
</div>
