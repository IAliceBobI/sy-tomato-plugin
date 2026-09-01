<script lang="ts">
    // 统一解锁弹框（□1 付费体验改造，2026-08-31）：价格区 + 购买 Pro CTA + 激活码输入，
    // 替代 ActivationCard 在「解锁」场景的角色（大卡退役，入口收敛为状态条/灰档/锁卡点击）。
    // 激活链自 ActivationCard.activate() 字节级平移（兑换码/激活码识别→verify→父侧落盘→
    // backfillCloudOnce→reload），语义勿动；邻居解锁=本地粘贴激活码路径同款（原 recite
    // Settings 的 unlockFromNeighbor 平移，验证链一致）。
    import { onMount } from "svelte";
    import { userToken, userID, licenseCloudSynced } from "./libs/stores";
    import { tomatoI18n } from "./tomatoI18n";
    import { resetKey, verifyFnByProduct, FREE_KEY } from "./libs/user";
    import type { Product } from "./libs/user";
    import { backfillCloudOnce, extractActivationCode, extractRedeemCode, fingerprintOf, isRedeemCodeShape, recoverFromCloud, redeemCode, redeemErrMsg } from "./libs/redeem";
    import { siyuan } from "./libs/utils";
    import { icon } from "./libs/domUtils";
    import { productPrices } from "./BuyTomato.svelte";
    import { openBuyDialog } from "./BuyDialog";
    import { progressiveCodeFromApp } from "./libs/neighbor";

    interface Props {
        // 插件标识：verify / redeem / 找回 的分流参数（tomato / progressive / recite）
        product: Product;
        // 激活成功后父侧落盘（saveData）；await 完才 reload（reload 掐断在途请求）。
        // 组件内已叠加 userToken.write() 等价落盘（三插件启动链都跑过 userToken.load），
        // 未传也不丢激活（TomatoVIP 灰档入口不经过面板接线，reasoning review P0-1）
        onActivated?: () => void | Promise<void>;
        // 仿写版专属：弹框打开时惰性检测渐进激活态（progressiveCodeFromApp 纯函数互问，
        // 未装/未激活/抛错一律静默降级为通用版直渲）。仅 recite 可传——邻居解锁拿渐进码
        // 走 verifyKeyRecite 的 cross 通道，其他产品验不过必失败（契约勿破）
        neighbor?: boolean;
        getApp?: () => any;
    }

    let { product, onActivated, neighbor = false, getApp }: Props = $props();

    let showCode = $state(false); // 激活码明文显示/隐藏
    let verifying = $state(false); // 防重复激活
    let neighborCode = $state("");
    let showGeneric = $state(true); // 邻居格在场时默认折叠通用区，点「改用激活码或购买」展开

    const hasNeighbor = $derived(!!neighborCode);

    // 供 unlockDialog.ts 的 DestroyManager 挂卸载：弹框关闭时正确清理 Svelte 实例。
    export function destroy() {}

    onMount(() => {
        if (neighbor) {
            neighborCode = progressiveCodeFromApp(getApp?.());
            if (neighborCode) showGeneric = false;
        }
        // FREE_KEY 是历史版本 verifyKey 失败时写入的磁盘存量遗物（2026-09-01 □5 起已不再
        // 写入），展示层清空——勿当死代码删，否则未激活用户看到预填的长串，粘贴自己的码前
        // 还得手动清空（2026-08-24 评审）
        if ($userToken === FREE_KEY) userToken.set("");
    });

    function onBuy() {
        openBuyDialog(product, tomatoI18n.购买页);
    }

    // 邻居一键解锁（仅仿写版渲染）：本地粘贴激活码路径的字节级同路——
    // set 码→清懒缓存→cross 通道验签→落盘（write+onActivated 双保险）→云端回填（await 完才 reload）→reload
    async function unlockFromNeighbor() {
        if (verifying || !neighborCode) return;
        verifying = true;
        userToken.set(neighborCode);
        resetKey();
        const v = await verifyFnByProduct(product)();
        if (v) {
            await userToken.write();
            await onActivated?.();
            await backfillCloudOnce(product);
            window.location.reload();
        } else {
            await siyuan.pushMsg(tomatoI18n.解锁失败);
            verifying = false;
        }
    }

    async function activate() {
        if (verifying) return;
        verifying = true;
        // 兑换码优先（整串形状 or 全文提取），激活码次之，都无则提示不触网
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
            // 兑换码兑换出的码云端 issue() 已落 license，写指纹让下次找回走分支 1 短路
            licenseCloudSynced.set(fingerprintOf(userToken.get()));
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
        verifying = false;
        // 无论激活成败都落盘（原面板语义：verify 后总是 saveData，失败的 token 重开弹框仍在）；
        // write 与 onActivated 等价双保险——灰档等不经面板接线的入口没传 onActivated 也不丢激活
        await userToken.write();
        await onActivated?.();
        if (v) {
            // 本地粘贴激活码路径顺手回填一次云端（spec 批次 B2；兑换码路径云端 issue
            // 已落 license 不走）——必须 await 完才 reload，reload 会掐断在途请求
            if (!redeem) await backfillCloudOnce(product);
            window.location.reload();
        }
    }
</script>

<div class="unlock-dialog">
    {#if hasNeighbor}
        <!-- 仿写版邻居格：渐进已激活 → 一键免费解锁置顶（防误购的关键提示压过价格区） -->
        <div class="ud-neighbor">
            <span class="ud-neighbor-check">{@html icon("Check", 16)}</span>
            <span class="ud-neighbor-text">{tomatoI18n.检测到渐进已激活}</span>
        </div>
        <button class="b3-button ud-full" disabled={verifying} onclick={unlockFromNeighbor}>
            {verifying ? tomatoI18n.解锁中 : tomatoI18n.一键免费解锁}
        </button>
        <button
            class="b3-button b3-button--text ud-collapse"
            aria-expanded={showGeneric}
            onclick={() => (showGeneric = !showGeneric)}
        >
            {tomatoI18n.改用激活码或购买}
            <span class="ud-collapse-arrow" class:ud-collapse-arrow--open={showGeneric}
                >{@html icon("Down", 12)}</span
            >
        </button>
    {/if}
    {#if showGeneric}
        <div class="ud-price-row">
            <span class="price-num">￥{productPrices[product].current}</span>
            {#if productPrices[product].next}
                <span class="price-orig">￥{productPrices[product].next}</span>
            {/if}
            <span class="price-tag">{tomatoI18n.终身}</span>
        </div>
        <button class="b3-button ud-full ud-buy" onclick={onBuy}>
            {tomatoI18n.购买Pro}
        </button>
        <div class="ud-divider"><span>{tomatoI18n.或分隔}</span></div>
        <div class="ud-input-row">
            <input
                type={showCode ? "text" : "password"}
                class="b3-text-field ud-code"
                bind:value={$userToken}
                onfocus={(e) => e.currentTarget.select()}
                placeholder={tomatoI18n.粘贴兑换码或激活码}
                spellcheck="false"
            />
            <button
                class="b3-button b3-button--outline ud-toggle"
                aria-label={tomatoI18n.显示或隐藏}
                onclick={() => (showCode = !showCode)}
            >
                {@html icon("Eye", 16)}
            </button>
        </div>
        <div class="ud-actions">
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
    {/if}
</div>

<style>
    .unlock-dialog {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 4px 0 8px;
    }
    /* 邻居格：success tint 底 + 勾图标 + 半粗文案，视觉压过下方价格区 */
    .ud-neighbor {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: var(--b3-border-radius);
        background-color: rgba(0, 179, 88, 0.1);
        color: var(--b3-theme-success);
        font-size: 13px;
        font-weight: 500;
    }
    .ud-neighbor-check {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
    }
    .ud-neighbor-text {
        color: var(--b3-theme-on-surface);
    }
    .ud-collapse {
        align-self: center;
        font-size: 13px;
    }
    .ud-collapse-arrow {
        display: inline-flex;
        align-items: center;
        margin-left: 2px;
        transition: transform 0.15s;
        opacity: 0.7;
    }
    .ud-collapse-arrow--open {
        transform: rotate(180deg);
    }
    .ud-price-row {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 4px 2px 0;
    }
    .price-num {
        font-size: 24px;
        font-weight: 600;
        color: var(--b3-theme-on-surface);
    }
    .price-orig {
        font-size: 12px;
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
    /* 主 CTA 全宽：360px 窄弹框里给足行动点权重 */
    .ud-full {
        width: 100%;
    }
    .ud-buy {
        font-weight: 600;
    }
    /* 「或」分隔线：两侧细线夹小字；上下多让 2px，CTA→分隔线→输入框节奏松一档（vision P2） */
    .ud-divider {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 2px 0;
        color: var(--b3-theme-font-color3, var(--b3-font-color3));
        font-size: 12px;
    }
    .ud-divider::before,
    .ud-divider::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--b3-border-color);
    }
    .ud-input-row {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .ud-code {
        flex: 1;
        min-width: 0;
    }
    .ud-toggle {
        flex-shrink: 0;
        color: var(--b3-theme-on-surface);
        opacity: 0.7;
    }
    .ud-actions {
        display: flex;
        gap: 8px;
        align-items: center;
    }
</style>
