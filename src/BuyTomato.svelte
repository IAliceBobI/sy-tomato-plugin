<script module lang="ts">
    import type { Product } from "./libs/user";
    export type ProductPrice = { current: number; next?: number };
    // 价格单一事实来源：ActivationCard 的未激活态价格条也从此取，避免两处硬编码漂移。
    // 2026-08 三产品化改查表：recite ￥10 终身无划线原价（next 缺省即不渲染原价）。
    // 渐进 □9 终稿（2026-08-29）＝￥72：Pro=皮肤系统+断句+生词 AI+收集/写作对比，单向送仿写全套；
    // 与 Sign 差价档位同值（码面值=入口现价，云端严格相等校验）；「永不降价只增值」故无划线锚。
    export const productPrices: Record<Product, ProductPrice> = {
        tomato: { current: 72, next: 96 },
        progressive: { current: 72 },
        recite: { current: 10 },
    };
</script>

<script lang="ts">
    import { SPACE } from "./libs/gconst";
    import { taobaoTomato, taobaoProgressive, taobaoRecite } from "./libs/taobaocode";
    import { expStore } from "./libs/user";
    import { icon } from "./libs/domUtils";
    import { tomatoI18n } from "./tomatoI18n";
    import DevDeactivate from "./DevDeactivate.svelte";

    interface Props {
        product?: Product;
        // 已购买/已激活态：顶部已购买横幅、隐藏价格区、弱化首购引导（2026-08-24 评审 P0-2）。
        // 命令面板入口由 ActivationCard 之外的调用方传 lastVerifyResult() 判定。
        activated?: boolean;
    }

    let { product = "tomato", activated = false }: Props = $props();

    const price = $derived(productPrices[product].current);
    const nextPrice = $derived(productPrices[product].next);

    // 淘宝 SKU 直达（2026-08-24）：链接与二维码都直达各产品档位 SKU（同一商品 id 三档），
    // 买家扫码/点链接免选档，SKU 清单见 docs/兑换码skuID.txt；二维码与 libs/taobaocode.ts 同源
    const TAOBAO_SKU: Record<Product, string> = {
        tomato: "5784571545242",
        progressive: "5784571545241",
        recite: "6294027335361",
    };
    const TAOBAO_QR: Record<Product, string> = {
        tomato: taobaoTomato,
        progressive: taobaoProgressive,
        recite: taobaoRecite,
    };
    const taobaoURL = $derived(
        "https://item.taobao.com/item.htm?ft=t&id=914732195167&skuId=" + TAOBAO_SKU[product],
    );

    // 价格指引文案（2026-08-25）：扫二维码/点链接虽已直达档位，仍明示「买这个价的码、
    // 收码回设置页粘贴」——买家从店铺别的入口进店时保底不拍错档
    const buyGuide = $derived(
        tomatoI18n.拍下价格档兑换码收码后回设置页粘贴激活.replaceAll("{price}", String(price)),
    );

    // 远未来日期（终身码）按「终身」显示，与 ActivationCard badge 口径一致
    const expDisplay = $derived($expStore.replaceAll(" ", "").slice(0, 4) >= "2099"
        ? tomatoI18n.终身
        : $expStore.replaceAll(" ", ""));

    // 供 BuyDialog.ts 的 DestroyManager 挂卸载：弹框关闭时正确清理 Svelte 实例。
    export function destroy() {}
</script>

<div>
    {#if activated}
        <!-- 已购买横幅：一眼消除「为什么已激活还弹购买窗」的疑问 -->
        <div class="owned-banner">
            <span class="owned-icon">{@html icon("TomatoVIP", 16)}</span>
            <span>{tomatoI18n.已激活}{#if expDisplay} · {expDisplay}{/if}</span>
        </div>
        <div class="center owned-note">{tomatoI18n.您已购买无需重复购买}</div>
        <!-- 开发者调试入口（组件内 isMe 门控 + 冷启动轮询兜底） -->
        <div class="center">
            <DevDeactivate />
        </div>
    {:else}
        <div class="item item--block">
            <div class="item__money">
                {#if nextPrice}<del style="font-size: small;">￥{nextPrice}</del>{/if}
                {"￥" + price + SPACE}
                <span style="font-size: small;">{tomatoI18n.终身}</span>
            </div>
        </div>
    {/if}

    <!-- 淘宝通道（主推）：兑换码，无平台抽成。已激活态转为「复购/赠送」次级入口 -->
    <div class="section">
        <div class="sectionTitle">{activated ? tomatoI18n.复购或赠送 : tomatoI18n.淘宝购买}</div>
        <div class="center">
            <a
                class={"b3-button " + (activated ? "b3-button--outline" : "") + " settingBox buy-cta"}
                href={taobaoURL}
                >{activated ? tomatoI18n.复购或赠送 : tomatoI18n.去淘宝购买}</a
            >
        </div>
        <div class="center">
            <img alt="taobao" class:taobao-small={activated} src={TAOBAO_QR[product]} />
        </div>
        <div class="center">
            <strong> {tomatoI18n.淘宝店二维码}</strong>
        </div>
        {#if !activated}
            <div class="center kbd">{buyGuide}</div>
            <div class="center kbd">{tomatoI18n.可联系客服获取7天试用激活码}</div>
        {/if}
    </div>

    <!-- 爱发电通道 2026-08-31 彻底移除（用户定调：平台扣 6% 太高，打赏直走微信/支付宝收款码，购买走淘宝兑换码） -->
</div>

<style>
    .center {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    /* 已购买横幅：success tint 底 + 图标 + 到期信息，弱分隔不抢视觉 */
    .owned-banner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin-top: 8px;
        padding: 8px 12px;
        border-radius: var(--b3-border-radius);
        background-color: rgba(0, 179, 88, 0.1);
        color: var(--b3-theme-success);
        font-size: 14px;
        font-weight: 500;
    }
    .owned-icon {
        display: inline-flex;
        align-items: center;
    }
    .owned-note {
        margin: 6px 0 2px;
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        opacity: 0.6;
    }
    /* 已激活态二维码缩为小图，不再占据主视觉 */
    img.taobao-small {
        width: 140px;
        margin: 4px 0;
    }
    /* 淘宝主 CTA：未激活态是最终行动点，给足视觉权重（已激活态走 outline 弱化） */
    .buy-cta {
        min-height: 34px;
        margin: 5px auto;
        display: inline-flex;
        align-items: center;
    }
    /* 购买通道区块：间距 + 行距节奏 */
    .section {
        margin-top: 16px;
        padding-top: 4px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    /* 区块标题：两侧细线夹标题的分隔样式 */
    .sectionTitle {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--b3-font-color2);
        font-size: 13px;
        white-space: nowrap;
    }
    .sectionTitle::before,
    .sectionTitle::after {
        content: "";
        flex: 1;
        height: 1px;
        background: var(--b3-theme-surface-lighter);
    }
    .item__money {
        margin: 8px 0;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 32px;
    }
    .item--block {
        display: block;
        flex: auto;
        flex-direction: column;
    }
    .item {
        flex: 1;
        padding: 4px 16px;
        text-align: center;
        font-size: 14px;
        line-height: 24px;
        transition: background-color 0.4s;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: center;
    }
    .kbd {
        padding: 2px 6px;
        font:
            100% Consolas,
            "Liberation Mono",
            Menlo,
            Courier,
            monospace,
            var(--b3-font-family);
        font-size: 13px;
        line-height: 1.4;
        color: var(--b3-theme-on-surface);
        vertical-align: middle;
        background-color: var(--b3-theme-surface);
        border: solid 1px var(--b3-theme-surface-lighter);
        border-radius: var(--b3-border-radius);
        box-shadow: inset 0 -1px 0 var(--b3-theme-surface-lighter);
    }
    img[alt="taobao"] {
        margin: 12px 0;
    }
</style>
