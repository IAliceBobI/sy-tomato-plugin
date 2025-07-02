<script lang="ts">
    import { tomatoI18n } from "./tomatoI18n";
    interface Props {
        callback: Func;
    }

    let { callback }: Props = $props();
</script>

<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<label class:conceptMargin={true}>
    <button
        title={tomatoI18n.立即刷新}
        class:bk_label={true}
        onclick={callback}>👋</button
    >
</label>

<style>
    .conceptMargin {
        margin-left: 6px;
        margin-right: 6px;
    }
    .bk_label {
        border: transparent;
        background-color: transparent;
    }
</style>
