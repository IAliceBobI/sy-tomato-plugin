<script lang="ts">
    // 付费状态条（□1 付费体验改造，2026-08-31）：未激活一行 40px「🔒 免费版 · 解锁全部
    // 功能 [升级 Pro]」，整条可点弹统一 UnlockDialog；已激活整条不渲染（付费区对已激活
    // 用户零打扰，已激活标识由 header 的 Pro 徽标承担，3 期接）。
    // ActivationCard 大卡退役后，其「面板打开时 verify 兜底」职责平移至此：三面板
    // codeValid 初值各自防闪（懒缓存/body class），此处 onMount verify 纠正回写。
    import { onMount } from "svelte";
    import { userToken } from "./libs/stores";
    import { tomatoI18n } from "./tomatoI18n";
    import { verifyFnByProduct, FREE_KEY } from "./libs/user";
    import type { Product } from "./libs/user";
    import { icon } from "./libs/domUtils";
    import { openUnlockDialog } from "./unlockDialog";

    interface Props {
        // 激活成功与否回传父组件：父用它控制锁定态 / 整条显隐（true=已激活，整条不渲染）。
        codeValid: boolean;
        onCodeValid?: (v: boolean) => void;
        // 插件标识：verify 分流参数 + 弹框产品参数
        product: Product;
        // 激活成功后父组件要执行的 saveData（弹框内激活链 await 完才 reload）
        onActivated?: () => void | Promise<void>;
        // 仿写版：弹框顶部显示「一键免费解锁」格（检测渐进激活态）
        neighbor?: boolean;
        getApp?: () => any;
    }

    let {
        codeValid = $bindable(false),
        onCodeValid,
        product,
        onActivated,
        neighbor = false,
        getApp,
    }: Props = $props();

    onMount(async () => {
        // verify 懒缓存命中时同步返回，未验证时此处兜底（原 ActivationCard onMount 同款）
        const v = await verifyFnByProduct(product)();
        codeValid = v;
        onCodeValid?.(v);
        // FREE_KEY 是历史版本 verifyKey 失败时写入的磁盘存量遗物（2026-09-01 □5 起已不再
        // 写入），展示层清空——勿当死代码删，存量用户升级后仍靠它清输入框预填
        if ($userToken === FREE_KEY) userToken.set("");
    });

    function open() {
        openUnlockDialog({ product, onActivated, neighbor, getApp });
    }

    function onKeydown(e: KeyboardEvent) {
        // Space 在非原生 button 上有默认滚动行为，触发的同时须拦掉（reasoning review P2）
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
        }
    }
</script>

{#if !codeValid}
    <div
        class="upgrade-bar"
        role="button"
        tabindex="0"
        aria-label={tomatoI18n.免费版解锁全部功能}
        onclick={open}
        onkeydown={onKeydown}
    >
        <span class="ub-lock">{@html icon("Lock", 14)}</span>
        <span class="ub-text">{tomatoI18n.免费版解锁全部功能}</span>
        <!-- 整条已是键盘站点，内嵌小钮退出 Tab 序（reasoning review P2：避免双站点/读屏念两遍）；
             点击冒泡到容器同为 open，dialogOpened 防重入兜底 -->
        <button class="b3-button b3-button--small ub-btn" tabindex="-1" onclick={open}>
            {tomatoI18n.升级Pro}
        </button>
    </div>
{/if}

<style>
    .upgrade-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 40px;
        padding: 8px 12px;
        margin: 10px 0;
        background: var(--b3-theme-surface-lighter);
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        cursor: pointer;
    }
    /* hover 可供性：整条可点但视觉零反馈会被当成静态说明行（vision P2） */
    .upgrade-bar:hover {
        border-color: var(--b3-theme-primary);
    }
    .ub-lock {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        color: var(--b3-theme-on-surface);
        opacity: 0.75;
    }
    .ub-text {
        font-size: 13px;
        color: var(--b3-theme-on-surface);
    }
    .ub-btn {
        margin-left: auto;
        font-size: 12px;
        padding: 3px 10px;
        flex-shrink: 0;
    }
</style>
