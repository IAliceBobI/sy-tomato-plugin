<script lang="ts">
    import DialogSvelte from "./libs/DialogSvelte.svelte";
    import { CardSettingsID } from "./libs/gconst";
    import { tomatoI18n } from "./tomatoI18n";
    import type { Writable } from "svelte/store";
    import { confirm } from "siyuan";
    import { getTomatoPluginInstance, siyuan } from "./libs/utils";
    import { closeAllDialog } from "./libs/keyboard";
    import { locTree, OpenSyFile2 } from "./libs/docUtils";
    import {
        CardBox删除内容块,
        CardBox复习时删除当前闪卡,
        CardBox复习时跳过当前闪卡,
        CardBox定位闪卡,
    } from "./CardBox";
    import {
        CardPriorityBox修改文档中闪卡优先级,
        CardPriorityBox分散推迟闪卡,
        cardPriorityBox,
    } from "./CardPriorityBox";
    import { pressSkip, doStopCards, getIDFromCard, getRestCards, skipThenRemoveCards, durationText } from "./libs/cardUtils";
    import HotkeyCap from "./HotkeyCap.svelte";
    import { lastVerifyResult, verifyKeyTomato } from "./libs/user";
    import {
        cardBoxSettingsShow,
        cardBoxSpradEvenlyPostpone,
        cardBoxDelayDays,
        cardBoxDeleteNoConfirm,
        cardPriorityBoxCheckbox,
    } from "./libs/stores";

    interface Props {
        id: Writable<string>;
        cardPath: Writable<string>;
    }
    let { id, cardPath }: Props = $props();

    // 必须走 $store 自动订阅：$derived 内 .get() 不进依赖收集，设置切换总开关后面板态不刷新
    let priorityEnabled = $derived($cardPriorityBoxCheckbox);

    // 输入按天（cardrenew □1：滚轮小时步进太慢，改回老版本天粒度一步一天）。
    // store cardBoxDelayDays 一直存天，直存直取零换算；按钮文案沿用阶梯化显示——
    // 输入 121 天按钮自动升档「推迟4个月」，仅展示层 ×24 交给 durationText
    let days = $state(cardBoxDelayDays.get() ?? 0.1);

    let showMsg = $state(false);
    // 路径区全文浮层锚点（□6 二轮）：position:fixed 渲染逃出 .dialog-content 的
    // overflow 裁剪（vision P1-1：向上溢出不可滚动到达，超长文本顶部永不可见）；
    // DOM 留在 msg-container 内保持 hover 命中链，坐标 hover 时取一次
    let msgEl = $state<HTMLElement>(undefined);
    let msgPos = $state<{ left: number, width: number, bottom: number }>(undefined);
    let brief = $derived(Array.from($cardPath ?? ""));

    // 动作组（cardrenew □4 用户拍板：快捷键栏与按钮栏合并）——每行=icon+动作名（整行
    // 点击执行）+HotkeyCap 键帽（点击改键，写回内核 keymap 即时生效）。取代原「静态键帽
    // 六对网格+四操作按钮组」双栏分立（用户痛点：把快捷键键帽看成按钮点了没反应）。
    // 动作名沿用 复习快捷键动作名() 同源；优先级行的可用性与原四钮联动一致。
    // 分散推迟行已挪进推迟区第三钮（cardui 反馈轮 □3：用户漏数「三种推迟」——混在动作
    // 列表里形态上不像推迟按钮组一员；键帽显示随行退役，改 title 带动态键位）
    let actions = $derived.by(() => {
        const labels = tomatoI18n.复习快捷键动作名();
        const rows: Array<{
            icon: string, label: string,
            run: () => void, hk?: { m: string, w(): string, langKey: string },
            disabled?: boolean,
        }> = [
            { icon: "#iconTrashcan", label: labels[0], run: deleteCardDeleteContent, hk: CardBox删除内容块 },
            { icon: "#iconClose", label: labels[1], run: deleteCard, hk: CardBox复习时删除当前闪卡 },
            { icon: "#iconForward", label: labels[2], run: async () => { await pressSkip(); }, hk: CardBox复习时跳过当前闪卡 },
            { icon: "#iconSearch", label: labels[4], run: gotoCard, hk: CardBox定位闪卡 },
            { icon: "#iconSort", label: tomatoI18n.闪卡优先级, run: setPri, hk: CardPriorityBox修改文档中闪卡优先级, disabled: !priorityEnabled },
        ];
        return rows;
    });

    async function deleteCard() {
        await skipThenRemoveCards($id);
    }

    async function delayRestCards(spread: boolean) {
        const blocks = await getRestCards();
        await doStopCards(String(days), blocks, spread);
        closeAllDialog();
    }

    async function delayCard() {
        await doStopCards(String(days), [{ ial: { id: $id } }] as any);
        await pressSkip();
    }

    async function setPri() {
        const cardID = await getIDFromCard();
        if (cardID) {
            const blocks = await siyuan
                .getRiffCardsByBlockIDs([cardID])
                .then((r) => {
                    return [...r.values()].flat();
                });
            cardPriorityBox?.updateDocPriorityBatchDialog(blocks);
        }
    }

    async function gotoCard() {
        closeAllDialog();
        OpenSyFile2(getTomatoPluginInstance(), $id);
        locTree($id);
    }

    async function deleteCardDeleteContent() {
        const run = async () => {
            await skipThenRemoveCards($id, true);
        };
        if (cardBoxDeleteNoConfirm.get()) {
            await run();
        } else {
            confirm(tomatoI18n.删除内容块, $cardPath, run);
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- fixed 浮层随视口钉死，锚滚动时即弃（滚动面板内容时关闭；滚浮层自身不关） -->
<svelte:window
    onwheel={(e) => {
        if (showMsg && !(e.target as HTMLElement)?.closest?.('.msg-full')) showMsg = false;
    }}
/>
<DialogSvelte
    maxWidth="280"
    show={$cardBoxSettingsShow}
    title={tomatoI18n.闪卡工具}
    zIndexPlus
    savePositionKey="card box sv 2026-09-07 cardrenew"
>
    {#snippet dialogInner()}
        <div class="tomato-cardui">
            <div class="act-group">
                {#each actions as a (a.label)}
                    <button
                        type="button"
                        class="act-row"
                        class:disabled={a.disabled}
                        title={a.disabled && a.hk === CardPriorityBox修改文档中闪卡优先级 ? tomatoI18n.需要开启闪卡优先级功能 : ""}
                        onclick={(e) => {
                            // 键帽点击只进改键态不执行动作（HotkeyCap 自带交互）
                            if ((e.target as HTMLElement).closest('.hotkey-wrap')) return;
                            if (!a.disabled) a.run();
                        }}
                    >
                        <svg><use xlink:href={a.icon}></use></svg>
                        <span class="act-label">{a.label}</span>
                        {#if a.hk}
                            <HotkeyCap hk={a.hk} pluginName="sy-tomato-plugin" />
                        {/if}
                    </button>
                {/each}
            </div>

            <div class="cardui-group">
                <label class="delay-label">
                    <input
                        title={tomatoI18n.使用鼠标滚轮来调整}
                        min="0"
                        step="1"
                        bind:value={days}
                        type="number"
                        class="b3-text-field"
                        onchange={() => cardBoxDelayDays.write(days)}
                    />
                    {tomatoI18n.天}
                </label>
                <button
                    class="b3-button b3-button--outline tomato-button"
                    onclick={delayCard}><svg><use xlink:href="#iconClock"></use></svg>{tomatoI18n.推迟x时长(durationText(days * 24))}</button
                >
                <button
                    title={tomatoI18n.没处理过的闪卡都被推迟}
                    class="b3-button b3-button--outline tomato-button"
                    onclick={() => delayRestCards(false)}
                    ><svg><use xlink:href="#iconCalendar"></use></svg>{tomatoI18n.推迟余下闪卡x时长(durationText(days * 24))}</button
                >
                {#if $cardBoxSpradEvenlyPostpone}
                    <button
                        title={`${tomatoI18n.把剩余闪卡分散推迟在未来x时长内(durationText(days * 24))} ${CardPriorityBox分散推迟闪卡.w()}`}
                        class="b3-button b3-button--outline tomato-button spread-btn"
                        disabled={!lastVerifyResult()}
                        onclick={async () => { if (await verifyKeyTomato()) await delayRestCards(true); }}
                        ><svg><use xlink:href="#iconRefresh"></use></svg>{tomatoI18n.余下分散到x内(durationText(days * 24))}</button
                    >
                {/if}
            </div>

            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                bind:this={msgEl}
                onmouseenter={() => {
                    const r = msgEl.getBoundingClientRect();
                    msgPos = { left: r.left, width: r.width, bottom: window.innerHeight - r.top };
                    showMsg = true;
                }}
                onmouseleave={() => (showMsg = false)}
                class="msg-container"
            >
                <svg><use xlink:href="#iconInfo"></use></svg>
                <p>{brief.slice(0, 8).join("")}{#if brief.length > 8} ……{/if}</p>
                {#if showMsg && msgPos}
                    <p
                        class="msg-full"
                        style={`left:${msgPos.left}px; width:${msgPos.width}px; bottom:${msgPos.bottom}px;`}
                    >{$cardPath}</p>
                {/if}
            </div>
        </div>
    {/snippet}
</DialogSvelte>
<div id={CardSettingsID}></div>

<style>
    /* cardrenew □4 用户拍板 B 试板：窗底灰化+无边框扁平按钮（官方设置面板风归一）。
       窗体是共享 DialogSvelte，:global+:has 限定只染本面板的窗，不影响其他浮窗 */
    :global(.prefix-dialog:has(.tomato-cardui)) {
        background: var(--b3-theme-surface);
    }
    /* DialogSvelte grabber 默认 background 底，窗体染 surface 后会出现白/灰双 tone——同染 */
    :global(.prefix-dialog:has(.tomato-cardui) .prefix-dialog-grabber) {
        background: var(--b3-theme-surface);
    }
    .tomato-cardui {
        margin: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .cardui-group + .msg-container,
    .act-group + .cardui-group {
        border-top: 1px solid var(--b3-border-color);
        padding-top: 6px;
    }

    /* 动作组（快捷键/按钮合并）：白底行浮在灰窗上，整行可点执行、键帽就地改键 */
    .act-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .act-row {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        /* 整行可点是本行主交互，点击区按行级控件下限 28px 保底 */
        min-height: 28px;
        padding: 3px 6px;
        border: none;
        border-radius: 4px;
        background-color: var(--b3-theme-background);
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        user-select: none;
    }
    .act-row:focus-visible {
        outline: 1px solid var(--b3-theme-primary);
    }
    .act-row:hover {
        background-color: var(--b3-theme-primary-lightest);
    }
    .act-row.disabled {
        opacity: 0.5;
        cursor: default;
    }
    .act-row.disabled:hover {
        background-color: var(--b3-theme-background);
    }
    .act-row svg {
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        color: var(--b3-theme-on-surface);
    }
    .act-row:hover svg {
        color: var(--b3-theme-primary);
    }
    .act-label {
        flex: 1;
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .act-row:hover .act-label {
        color: var(--b3-theme-primary);
    }

    /* HotkeyCap 键帽全套（设置页 IndexConf.css 同款便携版——伴学面板是设置页外首用，
       :global 因组件 DOM 在 scoped 范围外）：.kbd 基础帽+hover/监听/未设三态 */
    :global(.tomato-cardui .hotkey-cap) {
        flex-shrink: 0;
        padding: 1px 5px;
        font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
        font-size: 11px;
        line-height: 1.4;
        color: var(--b3-theme-on-background);
        background-color: var(--b3-theme-surface-lighter);
        border: solid 1px var(--b3-theme-surface-lighter);
        border-radius: 4px;
        cursor: pointer;
        user-select: none;
    }
    :global(.tomato-cardui .hotkey-cap:hover),
    :global(.tomato-cardui .hotkey-cap.listening) {
        border-color: var(--b3-theme-primary);
        color: var(--b3-theme-primary);
    }
    :global(.tomato-cardui .hotkey-cap.unset) {
        color: var(--b3-theme-on-surface);
        opacity: 0.5;
        border-style: dashed;
        font-style: italic;
    }
    :global(.tomato-cardui .hk-chip) {
        padding: 1px 5px;
        font-size: 11px;
        border: 1px solid var(--b3-border-color);
        border-radius: 4px;
        background-color: var(--b3-theme-background);
        cursor: pointer;
    }
    :global(.tomato-cardui .hk-chip:hover) {
        border-color: var(--b3-theme-primary);
    }
    :global(.tomato-cardui .hk-hint) {
        color: var(--b3-card-error-color, var(--b3-theme-error));
        font-size: 12px;
    }
    :global(.tomato-cardui .hk-flash) {
        color: var(--b3-theme-primary);
        font-size: 12px;
    }

    .cardui-group {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;
    }
    .cardui-group button {
        flex: 1 1 auto;
    }
    .cardui-group button svg {
        width: 14px;
        height: 14px;
        vertical-align: -2px;
        margin-right: 2px;
    }
    /* B 试板扁平按钮：去 outline 描边改白底填充，hover 主蓝淡底（面板内覆盖，
       全局 tomato-button 类不动——其他面板不受影响）。b3-button--outline 的描边
       是 box-shadow:inset 非 border（vision 亮色终审实锤），border:none 清不掉须同清 shadow；
       hover 加 :not(:disabled) 守卫——分散推迟钮带 VIP 门控 disabled 态，勿给残钮 hover 反馈 */
    .cardui-group .tomato-button {
        border: none;
        box-shadow: none;
        background-color: var(--b3-theme-background);
    }
    .cardui-group .tomato-button:not(:disabled):hover {
        background-color: var(--b3-theme-primary-lightest);
        box-shadow: none;
        color: var(--b3-theme-primary);
    }
    /* 分散推迟钮独占一行（280px 窄面板放不下三钮并排）：与「余下推迟X」语义
       成对但体量另起，兼给 VIP 门控 disabled 态足够视觉存在感 */
    .cardui-group .spread-btn {
        flex-basis: 100%;
    }
    .delay-label {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: 1 1 100%;
        margin: 0;
    }
    .delay-label input {
        width: 120px;
        margin: 0;
        background-color: var(--b3-theme-background);
    }
    /* spinner 隐藏（cardrenew □4 P1）：原生箭头 ~11px 点不中，交互主打滚轮+手输
       （title 已提示滚轮）；方案抄 CommentBox .tomato-num 先例，防跨环境复活 */
    .delay-label input::-webkit-inner-spin-button,
    .delay-label input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* 路径区：hover 换官方列表 hover 变量（原 rgba(0,0,0,.05) 暗色主题下黑叠黑失效）。
       全文态=绝对定位浮层向上弹出（□6 2026-09-07 用户报障：多行展开参与布局使面板
       变高→hover 区随面板位移→鼠标反复进出=疯狂闪烁；浮层不占布局、面板高度恒定）。
       多行语义保留：路径+卡片文本自然换行禁单行截断（2026-09-07 用户反馈 hover 看
       答案被 nowrap 钉在一行截断）。二轮（vision P1）：position:fixed 逃出
       dialog-content 裁剪；底边贴合触发行无缝衔接（间隙方案败于 overflow:auto
       裁掉盒外 ::after 桥——鼠标穿越 4px 空隙即 mouseleave 蒸发浮层） */
    .msg-container {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 4px;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    .msg-container svg {
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        /* 单行态与文本基线平衡（14px icon vs 12px 文本行框，vision P2-2） */
        margin-top: 2px;
    }
    .msg-container p {
        margin: 0;
    }
    .msg-container:hover {
        background-color: var(--b3-list-hover);
    }
    .msg-full {
        position: fixed;
        /* 思源 base.css 无通配 border-box（vision P2-A）：缺此行则内联 width 为
           content-box，右缘外挂 padding+border 共 14px */
        box-sizing: border-box;
        margin: 0;
        padding: 4px 6px;
        background-color: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        border-radius: 4px;
        /* 紧凑上偏阴影（vision P2-B）：dialog 级大模糊 0 8px 24px 正压下方触发行，
           hover 高亮发闷；阴影上偏落在已被浮层遮住的面板内容上 */
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.12);
        z-index: 10;
        max-height: 40vh;
        overflow: auto;
        overflow-wrap: anywhere;
    }
</style>
