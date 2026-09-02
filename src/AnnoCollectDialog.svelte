<script lang="ts">
    // 批注收集小窗（spec §5.1）：范围（VIP 灰档）/去向/文件区/执行。radio 恒可选——
    // VIP 拦截统一在 runCollect 执行时（零试用拍板），徽标仅提示。
    import TomatoVIP from "./TomatoVIP.svelte";
    import DocPathSelect from "./DocPathSelect.svelte";
    import { annoCollectScope, annoCollectDest, annoCollectTargetDoc } from "./libs/stores";
    import { runCollect } from "./libs/annoCollect";
    import { lastVerifyResult, isMe } from "./libs/user";
    import { tomatoI18n } from "./tomatoI18n";
    import type { DestroyManager } from "./libs/destroyer";

    interface Props {
        docID: string;
        dm: DestroyManager;
    }
    let { docID, dm }: Props = $props();

    let scope: "doc" | "tree" = $state(annoCollectScope.get() === "tree" ? "tree" : "doc");
    let dest: "clipboard" | "daily" | "file" = $state(
        ["clipboard", "daily", "file"].includes(annoCollectDest.get()) ? (annoCollectDest.get() as any) : "daily",
    );
    let targetDoc = $state(annoCollectTargetDoc.get());
    let running = $state(false);
    const vip = lastVerifyResult() || isMe();

    async function go() {
        if (running) return;
        if (dest === "file" && !targetDoc) return;
        running = true;
        try {
            annoCollectScope.set(scope);
            void annoCollectScope.write();
            annoCollectDest.set(dest);
            void annoCollectDest.write();
            if (dest === "file") {
                annoCollectTargetDoc.set(targetDoc);
                void annoCollectTargetDoc.write();
            }
            await runCollect({ scopeDocID: docID, scope, dest, targetDoc });
            dm.destroyBy("svelte"); // 链外 key：跑全链（含 dialog.destroy）；"1" 会跳过 dialog 关窗
        } finally {
            running = false;
        }
    }
</script>

<div class="anno-collect">
    <div class="anno-collect__section">
        <div class="anno-collect__label">{tomatoI18n.收集范围}</div>
        <label class="anno-collect__option">
            <input type="radio" class="b3-radio" name="anno-collect-scope" value="doc" bind:group={scope} />
            {tomatoI18n.当前文档}
        </label>
        <label class="anno-collect__option">
            <input type="radio" class="b3-radio" name="anno-collect-scope" value="tree" bind:group={scope} />
            {tomatoI18n.含子文档}
            <TomatoVIP codeValid={vip} />
        </label>
    </div>
    <div class="anno-collect__section">
        <div class="anno-collect__label">{tomatoI18n.收集到}</div>
        <label class="anno-collect__option">
            <input type="radio" class="b3-radio" name="anno-collect-dest" value="daily" bind:group={dest} />
            {tomatoI18n.当天日记}
        </label>
        <label class="anno-collect__option">
            <input type="radio" class="b3-radio" name="anno-collect-dest" value="clipboard" bind:group={dest} />
            {tomatoI18n.剪贴板}
        </label>
        <label class="anno-collect__option">
            <input type="radio" class="b3-radio" name="anno-collect-dest" value="file" bind:group={dest} />
            {tomatoI18n.指定文件}
        </label>
    </div>
    {#if dest === "file"}
        <div class="anno-collect__section">
            <div class="anno-collect__label">{tomatoI18n.指定文件}</div>
            <DocPathSelect onPick={(id, _name) => (targetDoc = id)} />
        </div>
    {/if}
    <div class="anno-collect__foot">
        <span class="fn__flex-1"></span>
        <button
            class="b3-button b3-button--text"
            disabled={running || (dest === "file" && !targetDoc)}
            onclick={() => void go()}
        >{tomatoI18n.收集}</button>
    </div>
</div>

<style>
    .anno-collect {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 8px 4px 0;
    }
    .anno-collect__section {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .anno-collect__label {
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        opacity: 0.6;
    }
    .anno-collect__option {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
    }
    .anno-collect__foot {
        display: flex;
        align-items: center;
    }
</style>
