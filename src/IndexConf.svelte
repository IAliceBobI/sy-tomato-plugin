<script lang="ts">
    // 设置对话框主壳：付费状态条、搜索栏、左侧 24 域导航、sticky footer 保存条 + 24 个域组件
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
    // 三期收纳（2026-09-08）：AI 问答域退役（ConfAIBox 两卡整卡迁功能仓库域 ConfVault 垫底
    // ——仓库只收设置入口不降功能，翻新一个拎回主域）。
    // 其余收纳已落地：杂项 21 项分家（11 项独立杂项域+8 项各回各家+2 项入仓库已收纳命令卡）、
    // exportFiles 四开关归位文档树工具卡（开关跟功能走）、右键菜单管理卡退役（「全部显示」
    // 兜底钮+前缀文档树卡迁功能仓库）。
    // prefixui □3（2026-09-15）：功能仓库域退役——前缀文档树独立成域（ConfPrefix 占原位）、
    // 「全部显示」兜底钮迁回通用域、已收纳命令卡迁杂项域。
    import "./IndexConf.css";
    import { onDestroy, onMount, tick } from "svelte";
    import { DestroyManager } from "./libs/destroyer";
    import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
    import { STORAGE_SETTINGS } from "./constants";
    import { tomatoI18n } from "./tomatoI18n";
    import { saveRestorePagePosition } from "./libs/utils";
    import { syncSettingsFromDisk } from "./libs/storageHotReload";
    import { rebindTomatoConfigRefs } from "./libs/stores";
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
    import ConfAppearance from "./ConfAppearance.svelte";
    import ConfPunct from "./ConfPunct.svelte";
    import ConfCapture from "./ConfCapture.svelte";
    import ConfGeneral from "./ConfGeneral.svelte";
    import ConfMiscDomain from "./ConfMiscDomain.svelte";
    // prefixui □3（bear 拍板）：功能仓库域退役——前缀文档树独立成域 ConfPrefix（占 vault 原位）；
    // 「全部显示」兜底钮迁回通用域、已收纳命令卡迁杂项域
    import ConfPrefix from "./ConfPrefix.svelte";
    import ConfAgent from "./ConfAgent.svelte";
    // knowledgebox □9（bear 拍板 A1）：知识库域独立成域——功能卡自 ConfVault、通道卡自
    // ConfAgent 迁入收敛一处（「同一功能的东西都在一起」）
    import ConfKnowledge from "./ConfKnowledge.svelte";
    // confgather（2026-09-15，bear 拍板「裁出去一次干净」）：顶栏工具/日记/块配对工具三域
    // 新立——配置按功能聚拢（找配置靠浏览不靠搜索），命令开关域族卡与设置域同名对上家
    import ConfToolbar from "./ConfToolbar.svelte";
    import ConfDailyNote from "./ConfDailyNote.svelte";
    import ConfPairTools from "./ConfPairTools.svelte";
    import ConfCommands from "./ConfCommands.svelte";
    // AI 接入（MCP）引导卡（mcpcopy 2026-09-11；09-12 二期迁入导航「AI 接入」独立域渲染）
    import McpPromo from "./McpPromo.svelte";
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
    // 导航 24 域（二期 2026-09-05 起；featgate □1 +16 命令开关、punctcfg +打字标点域、
    // agentrev 2026-09-10 +AI 助手域、uiclean 2026-09-12 +外观域、knowledgebox □9 2026-09-15
    // +知识库域、confgather 2026-09-15 +顶栏工具/日记/块配对工具三域、prefixui □3 2026-09-15
    // 功能仓库退役+前缀文档树独立域〔confgather 24 域中 vault 换 prefix，总数不变〕）：
    // 上半=已翻新大牌（番茄钟/批注/反链与引用/可视化/阅读点/块编辑/块配对工具/悬浮球/顶栏工具/
    // 导出工作空间/AI 助手/知识库），下半=待翻新按受欢迎排（闪卡/日记/文档管理/编辑器工具/
    // 速记/通用/杂项/前缀文档树）；label 为惰性取值（tomatoI18n 依 window 语言动态切，
    // 模板每次渲染现取，勿在模块顶层快照）
    const NAV_DOMAINS: Array<{ id: string; label: () => string }> = [
        { id: "pomodoro", label: () => tomatoI18n.番茄钟 },
        { id: "anno", label: () => tomatoI18n.批注 },
        { id: "link", label: () => tomatoI18n.反链与引用 },
        { id: "visual", label: () => tomatoI18n.可视化 },
        // uiclean（2026-09-12）：第 5 域「外观」——界面净化 6 开关 + 编辑器外观 6 件
        // 自编辑器工具域迁入（视觉类相邻，紧跟可视化）
        { id: "appearance", label: () => tomatoI18n.外观 },
        // confgather（2026-09-15）：「阅读」更名「阅读点」——域名对齐功能名与命令开关域族名
        { id: "reader", label: () => tomatoI18n.阅读点 },
        { id: "blockedit", label: () => tomatoI18n.块编辑 },
        // confgather（2026-09-15）：块配对工具独立成域（做法丁）——整卡自块编辑域裁出，
        // 命令开关域「互链与引用」+「长内容工具」两族同期合并为「块配对工具」族
        { id: "pairtools", label: () => tomatoI18n.块配对工具 },
        { id: "floatball", label: () => tomatoI18n.悬浮球 },
        // confgather（2026-09-15）：顶栏工具独立成域——顶栏钮六行自通用域裁出，
        // 命令开关域「顶栏工具」族对上家（界面元素相邻，紧跟悬浮球）
        { id: "toolbar", label: () => tomatoI18n.顶栏工具 },
        { id: "export", label: () => tomatoI18n.导出工作空间域 },
        // agentrev □2（2026-09-10）：AI 助手独立成域（bear ① 自功能仓库迁出三卡+轮数/人审
        // 配置落位）；紧跟已翻新大牌组尾
        { id: "agent", label: () => tomatoI18n.AI助手 },
        // knowledgebox □9（2026-09-15）：知识库独立成域（bear 拍板 A1——功能卡自功能仓库+
        // 通道卡自 AI 助手域迁入收敛；「拆域按功能聚合」原则首个落地案例），与 AI 助手作伴
        { id: "knowledge", label: () => tomatoI18n.知识库 },
        { id: "flashcard", label: () => tomatoI18n.闪卡 },
        // confgather（2026-09-15）：日记独立成域——DailyNote 卡自文档管理域首裁出，
        // 命令开关域「日记」族对上家；原居 docs 域首故紧邻其后排位
        { id: "dailynote", label: () => tomatoI18n.日记 },
        { id: "docs", label: () => tomatoI18n.文档管理 },
        { id: "editortools", label: () => tomatoI18n.编辑器工具 },
        // punctcfg（2026-09-10）：第 17 域「打字标点」——标点整理全家（总开关/速记折叠/
        // 结构化映射规则编辑器）自通用域「快捷键与开关」独立成域（bear 提议）
        { id: "punct", label: () => tomatoI18n.打字标点 },
        { id: "capture", label: () => tomatoI18n.速记 },
        { id: "general", label: () => tomatoI18n.通用 },
        { id: "misc", label: () => tomatoI18n.杂项 },
        // prefixui □3（2026-09-15）：前缀文档树独立成域占功能仓库原位（尾部区，杂项之后）——
        // 功能仓库域退役（住户三件：兜底钮→通用域/已收纳命令卡→杂项域/前缀文档树卡→本域）
        { id: "prefix", label: () => tomatoI18n.前缀文档树 },
        // featgate □1（2026-09-10）：第 16 域「命令开关」——commandToggles 逐命令开关
        // 集中管理（数据驱动自 commandGroups.ts），垫底与管理域作伴（管理域非功能域）
        { id: "commands", label: () => tomatoI18n.命令开关 },
        // mcpcopy 二期（2026-09-12）：MCP 引导卡自顶部通栏迁入导航独立域（bear：通栏占空间），
        // 垫底与管理域作伴；卡本体 McpPromo.svelte 不变
        { id: "mcp", label: () => tomatoI18n.AI接入 },
    ];
    let navActive = $state("pomodoro");
    const NavKeyItemKey = "tomato_settings_NavKeyItemKey_LE2WBlXRG9LGVH2AA3VwzehW1";
    // 二期存量兼容：一期 9 域 id 与新 id 不同名的三枚映射（其余 6 个旧 id 不变名免映射；
    // 未命中 some 校验落默认番茄钟的既有兜底保留）；三期 aibox→vault（AI 问答域退役）；
    // prefixui □3：功能仓库域退役，vault（含前代 aibox 链）改挂 prefix（域总数不变）
    const LEGACY_NAV_MAP: Record<string, string> = {
        editblock: "blockedit",
        capture: "floatball",
        ai: "anno",
        aibox: "prefix",
        vault: "prefix",
    };
    // □3 聚合视图：searchKey 非空=全 21 域聚合渲染，navActive 冻结待清空回位；
    // navHits=各域是否有命中卡（searchSettings 过滤后从 DOM 回读），驱动导航项高亮
    let navHits: Record<string, boolean> = $state({});
    // 输入沿聚合视图进出跳变跟踪（非响应式：只用于进/出沿触发滚顶，逐键过滤不触发）
    let searching = false;
    let navListEl: HTMLElement = $state();
    // 激活项滚入视野，但只在出视野的轴上滚（2026-09-16 用户反馈：点击可见项不得重定位
    // ——原版无差别把激活项顶到列首，点完想连点上面的项还得回滚）。纵向（24 域矮弹窗
    // 自滚）最小量贴边滚入：上出顶对齐、下出底对齐（各 8px 余量；下出贴底=上方项全保持
    // 可见，连点上面的项不再被打飞）；横向（窄屏 480 断点 tab 条横滚形态，vision R1
    // P1-1）保持居中入视野。只滚 tab 条/导航列自身，不用 scrollIntoView——它会连带滚
    // 外层滚动容器把面板内容拽走。除切域（$effect 跟 navActive）外，跨断点 resize
    // （navActive 不变）由 resize 监听补一滚
    function keepActiveTabVisible() {
        if (!navListEl) return;
        const active = navListEl.querySelector<HTMLElement>(".tomato-nav-item--active");
        if (!active) return;
        const inView = (pos: number, size: number, scroll: number, client: number) =>
            pos >= scroll && pos + size <= scroll + client;
        // 横轴：出视野才居中滚入（宽屏一列横向无溢出恒 inView，left 不动）
        const left = inView(active.offsetLeft, active.offsetWidth, navListEl.scrollLeft, navListEl.clientWidth)
            ? navListEl.scrollLeft
            : Math.max(0, active.offsetLeft - (navListEl.clientWidth - active.offsetWidth) / 2);
        // 纵轴：可滚且出视野才贴边滚入（横滚 tab 条形态纵向恒等不进）
        let top = navListEl.scrollTop;
        if (navListEl.scrollHeight > navListEl.clientHeight
            && !inView(active.offsetTop, active.offsetHeight, top, navListEl.clientHeight)) {
            top = active.offsetTop < top
                ? Math.max(0, active.offsetTop - 8)
                : active.offsetTop + active.offsetHeight + 8 - navListEl.clientHeight;
        }
        navListEl.scrollTo({ left, top });
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

    // □15 ① IME 合成期门控：受控 value 替代 bind:value——合成期 input（拼音中间态）不进
    // searchKey，聚合视图不误开、全列不闪「无命中」。compositionend 兜底：Chrome 末笔
    // input 先于 compositionend 且 isComposing=true 被上面跳过，上屏值在此同步；Safari
    // 末笔 input isComposing=false 走主路，此处重放同值幂等（搜索态沿检测不双触发）
    async function applySearch(v: string): Promise<void> {
        searchKey = v;
        try {
            localStorage.setItem(SearchKeyItemKey, searchKey);
        } catch { /* 隐私模式等场景静默（四家统一守卫，review P2-3） */ }
        const entering = !!searchKey && !searching;
        const leaving = !searchKey && searching;
        searching = !!searchKey;
        // 空→非空跳变须等聚合视图挂载再过滤（同分支跳变 tick 只是空冲刷）
        await tick();
        searchSettings(settingsDiv, searchKey);
        if (searchKey) updateNavHits();
        else navHits = {};
        if (entering || leaving) scrollPanelTop();
        // 进聚合视图导航列回顶（vision □5 P1）：navActive 冻结不触发 keepActiveTabVisible，
        // 列停在浏览态滚动位置时首命中域高亮滚出视野——聚合无「当前域」概念，整体可见；
        // 离聚合态对称恢复激活项入视野（navActive 值未变 $effect 不重跑）
        if (entering) navListEl?.scrollTo({ top: 0 });
        if (leaving) keepActiveTabVisible();
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
        // □5 annofeed0917：瞬态全默认代的保存闸——读取曾失败且盘上真设置在世时拦截
        // 本次保存（toast 提示重开面板），防内存全默认 cfg 整份覆盖盘上真值
        if (!(await plugin.guardSaveSettings())) return;
        // □3 保存链与 onDataChanged 钩子共用热更通道（落盘对账+diff 刷 store）：
        // 常规键不再整重载（保存后本端也不闪），结构性键命中才 reloadSelfPlugin。
        // oldCfg 用「saveData 前的落盘值」——面板 bind 编辑在保存前已进内存 cfg，
        // 快照内存=diff 恒空结构性漏判（review P0-1）；盘上才是编辑前值
        const diskBefore = await plugin.loadData(STORAGE_SETTINGS);
        await plugin.saveData(STORAGE_SETTINGS, plugin.settingCfg);
        const r = await syncSettingsFromDisk(plugin, undefined, diskBefore);
        if (r.changed.length) rebindTomatoConfigRefs(plugin);
        if (r.structural.length) await reloadSelfPlugin();
    }
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<!-- fn__flex-column（内核工具类，双下划线）：root flex column 是 footer 贴壳底的
     分发前提；2026-09-08 前写作 fn_flex/fn_flex-column（单下划线）=不存在 的死类，
     root 实际 block——P1-2 收尾时实锤 -->
<div class="tomato-settings-dialog fn__flex fn__flex-column" bind:this={settingsDiv}>
    <!-- 付费状态条（□1）：未激活一行入口，点击弹统一解锁框；已激活整条不渲染 -->
    <UpgradeBar
        product="tomato"
        bind:codeValid
        onActivated={async () => {
            // □5 同款保存闸：激活码写入也走整份 saveData，全默认代同险覆盖真值
            if (!(await plugin.guardSaveSettings())) return;
            plugin.saveData(STORAGE_SETTINGS, plugin.settingCfg);
        }}
    ></UpgradeBar>
    <!-- search -->
    <div class="settingBox search-bar" data-search>
        <input
            bind:this={searchInput}
            class="b3-text-field"
            placeholder={tomatoI18n.search搜索配置}
            value={searchKey}
            oninput={(e) => {
                if (e instanceof InputEvent && e.isComposing) return;
                void applySearch(e.currentTarget.value);
            }}
            oncompositionend={(e) => void applySearch(e.currentTarget.value)}
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
            <!-- 20 域组件渲染抽出 snippet 供两个分支复用（ConfAnno/ConfReader/ConfEditorTools/
                 ConfAppearance/ConfFloatBall/ConfMiscDomain/ConfPrefix/ConfAgent/ConfGeneral 无 VIP 门控行不收 codeValid，
                 其余域原样；ConfGeneral 杂项分家后无 VIP 行三期起加入此列） -->
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
                    <ConfBlockEdit></ConfBlockEdit>
                {:else if id === "pairtools"}
                    <ConfPairTools {codeValid}></ConfPairTools>
                {:else if id === "floatball"}
                    <ConfFloatBall></ConfFloatBall>
                {:else if id === "toolbar"}
                    <ConfToolbar></ConfToolbar>
                {:else if id === "export"}
                    <ConfExport {codeValid}></ConfExport>
                {:else if id === "agent"}
                    <ConfAgent></ConfAgent>
                {:else if id === "knowledge"}
                    <ConfKnowledge></ConfKnowledge>
                {:else if id === "flashcard"}
                    <ConfFlashcard {codeValid}></ConfFlashcard>
                {:else if id === "dailynote"}
                    <ConfDailyNote {codeValid}></ConfDailyNote>
                {:else if id === "docs"}
                    <ConfDocs></ConfDocs>
                {:else if id === "editortools"}
                    <ConfEditorTools></ConfEditorTools>
                {:else if id === "appearance"}
                    <ConfAppearance></ConfAppearance>
                {:else if id === "punct"}
                    <ConfPunct></ConfPunct>
                {:else if id === "capture"}
                    <ConfCapture {codeValid}></ConfCapture>
                {:else if id === "misc"}
                    <ConfMiscDomain></ConfMiscDomain>
                {:else if id === "prefix"}
                    <ConfPrefix></ConfPrefix>
                {:else if id === "commands"}
                    <ConfCommands></ConfCommands>
                {:else if id === "mcp"}
                    <McpPromo plugin="tomato"></McpPromo>
                {:else}
                    <ConfGeneral></ConfGeneral>
                {/if}
            {/snippet}
            {#if searchKey}
                <!-- 聚合视图（□3）：全 24 域同屏+域标题行做域界标，data-domain 供 updateNavHits
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
    <!-- save（□3）：52px sticky footer 收底，主色「保存并关闭」（原面板末位 outline 保存行退役）。
         data-search= searchSettings 候选跳过（vision □5 P1：聚合态 footer 文本不含关键词被
         误杀=搜索态唯一保存入口消失；UpgradeBar 同批豁免） -->
    <div class="settings-footer" data-search>
        <button class="b3-button tomato-save-btn" onclick={save}>{tomatoI18n.保存并关闭}</button>
    </div>
</div>
