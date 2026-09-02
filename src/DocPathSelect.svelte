<script lang="ts">
    // 指定文件目标选择（批注收集 spec §5.1）：笔记本 + listDocsByPath 逐级下拉
    // （文件树通道无索引延迟）。选定任一级 = 该文档为目标（listDocsByPath 只返回文档）；
    // 随后自动展开下一级供下钻，空层截断。
    import { writable } from "svelte/store";
    import NotebookSelect from "./NotebookSelect.svelte";
    import { siyuan } from "./libs/utils";
    import { tomatoI18n } from "./tomatoI18n";

    interface Props {
        onPick: (id: string, name: string) => void;
    }
    let { onPick }: Props = $props();

    const notebook = writable("");
    interface Level {
        path: string;
        files: { id: string; name: string }[];
    }
    let levels: Level[] = $state([]);
    let pickedName = $state("");

    $effect(() => {
        const box = $notebook;
        if (!box) return;
        levels = [];
        pickedName = "";
        void loadLevel(box, "/");
    });

    async function loadLevel(box: string, path: string) {
        const ret = await siyuan.listDocsByPath(box, path).catch(() => null);
        const files = ((ret as any)?.files ?? []).map((f: any) => ({ id: f.id, name: f.name }));
        if (files.length > 0) levels = [...levels, { path, files }];
    }

    function childPath(level: Level, name: string) {
        return level.path === "/" ? `/${name}` : `${level.path}/${name}`;
    }

    async function pick(box: string, level: Level, id: string) {
        if (!id) return;
        const f = level.files.find((x) => x.id === id);
        if (!f) return;
        pickedName = f.name;
        onPick(f.id, f.name);
        levels = levels.slice(0, levels.indexOf(level) + 1); // 下钻前截断兄弟级
        await loadLevel(box, childPath(level, f.name));
    }
</script>

<div class="anno-path-select">
    <NotebookSelect bare store={notebook} />
    {#each levels as level, i (level.path)}
        <select
            class="b3-select anno-path-select__level"
            onchange={(e) => void pick($notebook, level, e.currentTarget.value)}
        >
            <option value="">{i === 0 ? tomatoI18n.选择文档 : "…"}</option>
            {#each level.files as f (f.id)}
                <option value={f.id}>{f.name}</option>
            {/each}
        </select>
    {/each}
    {#if pickedName}
        <span class="anno-path-select__picked">《{pickedName}》</span>
    {/if}
</div>

<style>
    .anno-path-select {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    /* 笔记本下拉（NotebookSelect 共享组件）与级联下拉统一全宽，同类控件观感对齐 */
    .anno-path-select :global(select.b3-select) {
        width: 100%;
    }
    .anno-path-select__level {
        width: 100%;
    }
    .anno-path-select__picked {
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        opacity: 0.75;
    }
</style>
