<script>
    import { SPACE } from "./libs/gconst";
    import { userID } from "./libs/stores";
    import { taobaoStore } from "./libs/taobaocode";
    import { siyuan, Siyuan } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";

    export let isTomato = true;
    const price = 72;
    const nextPrice = 96;

    async function copyUserID() {
        const msg = { 用户ID: $userID };
        if (isTomato) {
            msg["插件"] = tomatoI18n.购买番茄工具箱VIP版;
        } else {
            msg["插件"] = tomatoI18n.购买渐进学习VIP版;
        }
        const txt = JSON.stringify(msg);
        await navigator.clipboard.writeText(txt);
        await siyuan.pushMsg(txt);
    }
</script>

<div>
    <div class="center">
        {#if Siyuan?.user?.userName}
            {Siyuan?.user?.userName}
        {/if}
    </div>
    <div class="center">
        {#if Siyuan?.user?.userAvatarURL}
            <img
                class="userAvatar"
                src={Siyuan?.user?.userAvatarURL}
                alt="userAvatar"
            />
        {/if}
    </div>
    <div class="item item--block">
        <strong>
            <span class="pluginName">
                {#if isTomato}
                    {tomatoI18n.番茄工具箱}
                {:else}
                    {tomatoI18n.渐进学习}
                {/if}
            </span>
            {tomatoI18n.功能特性}
        </strong>

        <div class="item__money">
            <del style="font-size: small;">￥{nextPrice}</del>
            {"￥" + price + SPACE}
            <span style="font-size: small;">{tomatoI18n.终身}</span>
        </div>
        <strong>{tomatoI18n.将激活配置中有VIP标志的功能}</strong>
        <strong>{tomatoI18n.一次付费终身使用}</strong>
        <strong>{tomatoI18n.离线可用新功能可用}</strong>
        <strong>{tomatoI18n.vip版本上线前打赏的金额可以双倍抵扣}</strong>
        <p class="kbd">{tomatoI18n.广告语(price)}</p>
    </div>

    <div class="center">
        {tomatoI18n.点击复制按钮进入店铺将复制的内容发给客服}
    </div>

    <div class="center">
        {#if $userID}
            <label>
                ID: {$userID}
                <button class="b3-button settingBox" on:click={copyUserID}
                    >{tomatoI18n.复制}
                </button>
            </label>
        {:else}
            <span class="b3-label b3-label__text kbd">
                {tomatoI18n.如果要激活插件请先登录思源本体的账户}
            </span>
        {/if}
        <a
            class="b3-button settingBox"
            href="https://item.taobao.com/item.htm?ft=t&id=914732195167"
            >{tomatoI18n.点击打开商品}</a
        >
    </div>

    <div class="center">
        <img alt="taobao" src={taobaoStore} />
    </div>
    <div class="center">
        <strong> {tomatoI18n.淘宝店二维码}</strong>
    </div>
    <div class="center">
        <strong>{tomatoI18n.可联系客服获取7天试用激活码}</strong>
    </div>
</div>

<style>
    .pluginName {
        color: var(--b3-font-color2);
        font-size: larger;
    }
    .center {
        display: flex;
        align-items: center;
        justify-content: center;
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
    .userAvatar {
        object-fit: contain;
        max-width: 70px;
        max-height: 70px;
    }
    .kbd {
        padding: 2px 4px;
        font:
            100% Consolas,
            "Liberation Mono",
            Menlo,
            Courier,
            monospace,
            var(--b3-font-family);
        line-height: 1;
        color: var(--b3-theme-on-surface);
        vertical-align: middle;
        background-color: var(--b3-theme-surface);
        border: solid 1px var(--b3-theme-surface-lighter);
        border-radius: var(--b3-border-radius);
        box-shadow: inset 0 -1px 0 var(--b3-theme-surface-lighter);
    }
    .settingBox {
        margin: 5px;
    }
</style>
