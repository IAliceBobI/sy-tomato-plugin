<script lang="ts">
    // 未激活激活/购买卡（阶段 0+1，2026-08 从 IndexConf.svelte / Settings.svelte 抽出）。
    // 两个插件共用：sy-tomato-plugin 直接 import，sy-progressive-plugin 经 ../../sy-tomato-plugin/src/ 跨插件 import。
    // 视觉要点：主 CTA（购买，裸 .b3-button 主色填充）、次级（激活，outline）、弱链接（找回激活码，text）。
    // 已激活 => 整卡不渲染（2026-08-24：已激活隐藏所有 VIP 标志，激活状态/复购/卖家调试
    // 入口都收进命令面板购买页 owned-banner）。
    import { onMount } from "svelte";
    import { userToken, userID, licenseCloudSynced } from "./libs/stores";
    import { tomatoI18n } from "./tomatoI18n";
    import { resetKey, verifyFnByProduct, FREE_KEY } from "./libs/user";
    import type { Product } from "./libs/user";
    import { extractActivationCode, extractRedeemCode, isRedeemCodeShape, recoverFromCloud, redeemCode, redeemErrMsg } from "./libs/redeem";
    import { siyuan } from "./libs/utils";
    import { icon } from "./libs/domUtils";
    import { productPrices } from "./BuyTomato.svelte";
    import { openBuyDialog } from "./BuyDialog";

    interface Props {
        // 激活成功与否，回传父组件：父用它控制 Conf*.svelte 锁定态 / b3-switch disabled / 整卡显隐。
        // 值为 true 时代表"已激活"，false 代表"未激活"。
        codeValid: boolean;
        // 是否把 onCodeValid 当作受控回调（Svelte 5 属性回调绑定）。
        onCodeValid?: (v: boolean) => void;
        // 插件标识：verify / redeem / saveData / 找回 的分流参数。
        // tomato 插件传 "tomato"，progressive 插件传 "progressive"，recite 插件传 "recite"。
        product: Product;
        // 激活成功后父组件要执行的 saveData；组件内只在激活成功时调用一次，await 完成后才 reload。
        onActivated?: () => void | Promise<void>;
        // 是否允许显示主"购买"CTA + 价格区（默认 true；番茄主面板直接露出）。
        showBuy?: boolean;
        // 覆盖默认 verify 函数（父组件已做 verify 时传 undefined，由本组件内部 onMount verify 兜底）。
        verifyFn?: () => Promise<boolean>;
    }

    let {
        codeValid = $bindable(false),
        onCodeValid,
        product,
        onActivated,
        showBuy = true,
        verifyFn,
    }: Props = $props();

    let showCode = $state(false); // 激活码明文显示/隐藏
    let verifying = $state(false); // 防重复激活

    onMount(async () => {
        // 由父承载 verify 时跳过；否则本组件兜底（兼容渐进面板现在把 verify 放 onMount 的情形）
        if (!verifyFn) {
            verifying = true;
            const v = await verifyFnByProduct(product)();
            verifying = false;
            codeValid = v;
            onCodeValid?.(v);
        }
        // FREE_KEY 是 verifyKey 失败时塞进 store 的过期免费码，展示层清空——
        // 否则未激活用户看到预填的长串，粘贴自己的码前还得手动清空（2026-08-24 评审）
        if ($userToken === FREE_KEY) userToken.set("");
    });

    async function activate() {
        if (verifying) return;
        verifying = true;
        // 激活逻辑原样保留：兑换码优先（整串形状 or 全文提取），激活码次之，都无则提示不触网。
        const text = $userToken;
        const redeem = isRedeemCodeShape(text)
            ? text.trim().toUpperCase()
            : extractRedeemCode(text);
        if (redeem) {
            if (!$userID) {
                await siyuan.pushMsg(tomatoI18n.如果要激活插件请先登录思源本体的账户);
                verifying = false;
                return;
            }
            let r: { ec: number; em?: string; code?: string };
            try {
                r = await redeemCode(redeem, $userID, product);
            } catch {
                await siyuan.pushMsg(tomatoI18n.兑换失败请检查网络后重试);
                verifying = false;
                return;
            }
            if (r.ec !== 200 || !r.code) {
                await siyuan.pushMsg(redeemErrMsg(r.em));
                verifying = false;
                return;
            }
            userToken.set(r.code);
            // 兑换码兑换出的码云端 issue() 已落 license，置 flag 让下次找回走分支 1 短路
            licenseCloudSynced.set(true);
            await siyuan.pushMsg(tomatoI18n.兑换成功正在激活);
        } else {
            const activation = extractActivationCode(text);
            if (activation) {
                userToken.set(activation);
            } else {
                await siyuan.pushMsg(tomatoI18n.未识别到兑换码或激活码);
                verifying = false;
                return;
            }
        }
        resetKey();
        const v = await verifyFnByProduct(product)();
        codeValid = v;
        onCodeValid?.(codeValid);
        verifying = false;
        // 无论激活成败都落盘（原面板语义：verify 后总是 saveData，失败的 token 重开面板仍在）
        await onActivated?.();
        if (codeValid) {
            window.location.reload();
        }
    }
</script>

{#if !codeValid}
    <div class="activation-card" data-hide>
        <!-- 未激活态：主文案 + 价格/购买 + 输入 + 激活 -->
        <div class="act-lead">{tomatoI18n.激活解锁全部功能}</div>
        <div class="act-title">
            <span class="title-icon">{@html icon("Key", 16)}</span>
            <span class="title-text">{tomatoI18n.兑换码或激活码}</span>
        </div>
        {#if showBuy}
            <div class="act-price-row">
                <span class="price-num">￥{productPrices[product].current}</span>
                {#if productPrices[product].next}
                    <span class="price-orig">￥{productPrices[product].next}</span>
                {/if}
                <span class="price-tag">{tomatoI18n.终身}</span>
                <button
                    class="b3-button act-buy"
                    onclick={() => openBuyDialog(product, tomatoI18n.购买页)}
                >
                    {tomatoI18n.购买}
                </button>
            </div>
        {/if}
        <div class="act-input-row">
            <input
                type={showCode ? "text" : "password"}
                class="b3-text-field act-code"
                bind:value={$userToken}
                onfocus={(e) => e.currentTarget.select()}
                placeholder={tomatoI18n.粘贴兑换码或激活码}
                spellcheck="false"
            />
            <button
                class="b3-button b3-button--outline act-toggle"
                onclick={() => (showCode = !showCode)}
            >
                {@html icon("Eye", 16)}
            </button>
        </div>
        <div class="act-actions">
            <button class="b3-button" onclick={activate} disabled={verifying}>
                {tomatoI18n.激活}
            </button>
            <button
                class="b3-button b3-button--text"
                onclick={() => recoverFromCloud(product)}
            >
                {tomatoI18n.找回激活码}
            </button>
        </div>
    </div>
{/if}

<style>
    .activation-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px 16px;
        margin: 10px 0;
        background-color: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
    }
    .act-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 600;
        color: var(--b3-theme-on-surface);
    }
    .act-lead {
        font-size: 13px;
        color: var(--b3-theme-primary);
        font-weight: 500;
    }
    .title-icon {
        display: inline-flex;
        align-items: center;
        color: var(--b3-theme-primary);
    }
    .act-price-row {
        display: flex;
        align-items: baseline;
        gap: 8px;
    }
    .price-num {
        font-size: 24px;
        font-weight: 700;
        color: var(--b3-theme-on-surface);
    }
    .price-orig {
        font-size: 14px;
        color: var(--b3-theme-font-color2, var(--b3-font-color2));
        text-decoration: line-through;
    }
    .price-tag {
        font-size: 12px;
        color: var(--b3-theme-primary);
        background-color: var(--b3-theme-surface-lighter);
        border-radius: var(--b3-border-radius);
        padding: 2px 6px;
    }
    .act-buy {
        margin-left: auto;
    }
    .act-input-row {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .act-code {
        flex: 1;
        min-width: 0;
    }
    .act-toggle {
        flex-shrink: 0;
        color: var(--b3-theme-on-surface);
        opacity: 0.7;
    }
    .act-actions {
        display: flex;
        gap: 8px;
        align-items: center;
    }
</style>
