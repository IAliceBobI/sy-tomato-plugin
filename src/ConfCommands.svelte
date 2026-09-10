<script lang="ts">
    // 命令开关域（featgate □1 2026-09-10，设置第 16 域）：番茄所有走 commandToggles 门控
    // 的命令集中管理——按族分卡数据驱动渲染（注册表=libs/commandGroups.ts，本组件零命令
    // 硬编码）；行形态=开关+命令名+键帽紧凑行（bear 偏好不开大卡不写说明段），族头总开关
    // =全开/全关（与杂项 mixBoxCheckbox 总开关同款语义）。改动经 footer 保存落盘后
    // commandToggles 命中 STRUCTURAL_KEYS → IndexConf save 链 reloadSelfPlugin 自动重载
    // 生效（与族总开关同语义，用户已习惯）。无 VIP 行，不收 codeValid。
    import { onDestroy, onMount } from "svelte";
    import HotkeyCap from "./HotkeyCap.svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { commandToggles } from "./libs/stores";
    import { nextCommandToggles, registeredKeys } from "./libs/cmdGate";
    import { COMMAND_GROUPS, type GatedCommandGroup } from "./libs/commandGroups";
    import { debugLog } from "./libs/logUtils";

    // 本地镜像渲染：$commandToggles[key] 的属性赋值不被 Svelte store 拦截（只拦截整体
    // 赋值），显式 handler 写 store（进内存 cfg 随 footer save 落盘）+镜像驱动勾选态；
    // subscribe 兜保存链/多端热更刷 store 的同步
    let toggles: Record<string, boolean> = $state({ ...commandToggles.get() });
    const unsub = commandToggles.subscribe((v) => { toggles = { ...v }; });
    onDestroy(unsub);

    onMount(() => {
        // □6 对账（dev 门控零噪音）：实际执行过注册的键多于注册表=注册点漏登记（真问题，
        // 反向差集含族关的合法情况不 log，见 cmdGate registeredKeys 注释）。陈旧键清理已
        // 挪 index.ts onload（review P2-B：懒挂载域不保证执行）
        const regKeys = new Set(COMMAND_GROUPS.flatMap(g => g.items.map(i => i.langKey)));
        const runNotInReg = [...registeredKeys].filter(k => !regKeys.has(k));
        if (runNotInReg.length) debugLog("cmdGate", `对账：注册点未进注册表 ${runNotInReg.join(",")}`);
    });

    const isOn = (key: string) => toggles[key] !== false;

    function flip(key: string, on: boolean) {
        const next = nextCommandToggles(commandToggles.get(), key, on);
        commandToggles.set(next);
        toggles = { ...next };
    }

    const groupOn = (g: GatedCommandGroup) => g.items.every((i) => isOn(i.langKey));

    function flipGroup(g: GatedCommandGroup, on: boolean) {
        let next = commandToggles.get();
        for (const i of g.items) next = nextCommandToggles(next, i.langKey, on);
        commandToggles.set(next);
        toggles = { ...next };
    }
</script>

    <!-- 域头：标题+重载生效一行提示（helpText 12px 弱化，不占卡） -->
    <div class="settingBox">
        <div class="section-title">{tomatoI18n.命令开关}</div>
        <div class="helpText">{tomatoI18n.命令开关重载提示}</div>
    </div>
    {#each COMMAND_GROUPS as g (g.id)}
        <div class="settingBox">
            <div class="section-title">
                <input type="checkbox" class="b3-switch" checked={groupOn(g)} onchange={(e) => flipGroup(g, e.currentTarget.checked)} />
                {g.label()}
            </div>
            {#each g.items as item (item.langKey)}
                <div>
                    <input type="checkbox" class="b3-switch" checked={isOn(item.langKey)} onchange={(e) => flip(item.langKey, e.currentTarget.checked)} />
                    {item.label()}
                    {#if item.hk}<HotkeyCap hk={item.hk} pluginName="sy-tomato-plugin"></HotkeyCap>{/if}
                </div>
            {/each}
        </div>
    {/each}

<style>
    /* 命令名含 emoji（🚩书签族）时字体行框膨胀行距不均（实测 28 vs 23px，vision P2-1
       DOM 定案）；unitless 行高随字号缩放，钉平与面板常规行一致 */
    .settingBox > div:not(.section-title) {
        line-height: 1.64;
    }
</style>
