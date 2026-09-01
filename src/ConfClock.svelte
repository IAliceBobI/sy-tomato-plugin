<script lang="ts">
    // IndexConf 设置分区：状态栏番茄钟 / 拍照闪念 / 批注 / 思维导线 / 块关系图。
    // 从 IndexConf.svelte 拆出（2026-08 重构），共享样式见 IndexConf.css。
    import TomatoVIP from "./TomatoVIP.svelte";
    import {
        avoiding_cloud_synchronization_conflicts,
        commentBoxAnnoBg,
        commentBoxAnnoLineType,
        commentBoxAnnoMarkStyle,
        commentBoxAnnoUnderlineThickness,
        commentBoxCheckbox,
        commentBoxMenu,
        hiddenMenuItems,
        commentBoxPanelSkin,
        commentBoxShowID,
        cssFlashThoughts,
        flashThoughtUseDialog,
        flash_thoughts_2_top,
        flash_thoughts_target_file,
        graphAddTopbarIcon,
        graphBoxCheckbox,
        graphClick2Locate,
        graphHideStructEdges,
        graphMaxAllBlocks,
        graphMaxPBlocks,
        graph定位到图中的节点Menu,
        graph打开块关系图Menu,
        mindWireCheckbox,
        mindWireColorfull,
        mindWireDocMenu,
        mindWireDynamicLine,
        mindWireGlobalMenu,
        mindWireLine,
        mindWireStarRefOnly,
        mindWireWidth,
        noteBoxAllKinds,
        noteBoxCheckbox,
        tomatoClockCheckbox,
        tomato_clocks,
        tomato_clocks_audio,
        tomato_clocks_break,
        tomato_clocks_focus,
        tomato_clocks_loop,
        tomato_clocks_notice,
        tomato_clocks_change_bg,
        tomato_clocks_change_bg_dark,
        tomato_clocks_force_dialog,
        tomato_clocks_force_notice,
        tomato_clocks_opacity,
        tomato_clocks_position_right,
    } from "./libs/stores";
    import { lastVerifyResult } from "./libs/user";
    import { CommentBoxTab批注, CommentBox添加批注到日记 } from "./CommentBox";
    import { MindWire启用或禁用思维导线, MindWire启用或禁用文档思维导线 } from "./MindWire";
    import { GraphBox定位到图中的节点, GraphBox打开块关系图 } from "./GraphBox";
    import { NoteBox拍照闪念全局 } from "./NoteBox";
    import { tomatoI18n } from "./tomatoI18n";
    import { applyAnnoVisual } from "./Annotations";
    import HotkeyCap from "./HotkeyCap.svelte";
    import { PRESET_CLOCKS, MAX_CLOCKS, parseClocks, clocksToStore } from "./libs/TomatoClockList";
    import {
        AUDIO_PRESETS,
        NOTICE_AUDIO_URL,
        audioOptionOf,
        audioStoreOf,
        isValidAudioUrl,
        uploadAssetName,
        type AudioOptionId,
    } from "./libs/TomatoAudioList";
    import { bgUploadAssetName, isValidBgUrl, opacityPercentOf, opacityToStore } from "./libs/TomatoBg";
    import { onDestroy } from "svelte";
    import { MENU_MANAGE_GROUPS, type ManagedMenuItem } from "./libs/menuItemRegistry";
    import { menuKeyHidden, menuHiddenKeys } from "./libs/menuManager";
    import { siyuan } from "./libs/utils";
    import { tomatoClock } from "./TomatoClock";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);

    // 番茄钟时长 chips（□2）：store 逗号串 ↔ 档位集合；勾选即落盘并即时重挂状态栏图标。
    // 落盘串行化（链式）：毫秒级连续点选时两次整文件 saveData 并发，旧快照后落会覆盖新值
    let clocksWriteChain: Promise<void> = Promise.resolve();
    const selectedClocks = $derived(parseClocks($tomato_clocks));
    const customClocks = $derived(selectedClocks.filter((n) => !PRESET_CLOCKS.includes(n)));
    let chipDraftMinutes: number | null = $state(null);
    const isAddDisabled = $derived(
        selectedClocks.length >= MAX_CLOCKS ||
            !Number.isInteger(chipDraftMinutes) ||
            chipDraftMinutes <= 0 ||
            chipDraftMinutes > 240 || // 自定义上限：再大状态栏 32px 数字图标放不下（1e9 科学计数法也拦在这）
            selectedClocks.includes(chipDraftMinutes),
    );
    function isChipSelected(n: number) {
        return selectedClocks.includes(n);
    }
    function isChipDisabled(n: number) {
        return !isChipSelected(n) && selectedClocks.length >= MAX_CLOCKS;
    }
    function applyClocks(next: number[]) {
        clocksWriteChain = clocksWriteChain.then(() => tomato_clocks.write(clocksToStore(next)));
        tomatoClock.remountStatusIcons();
    }
    function toggleChip(n: number) {
        applyClocks(isChipSelected(n) ? selectedClocks.filter((m) => m !== n) : [...selectedClocks, n]);
    }
    function addCustomClock() {
        if (isAddDisabled) return;
        applyClocks([...selectedClocks, chipDraftMinutes]);
        chipDraftMinutes = null;
    }
    // 位置开关换边也即时重挂（旧文本框时代需 reload；bind 只改内存，落盘+重挂在此闭环）
    function onPositionChange() {
        void tomato_clocks_position_right.write();
        tomatoClock.remountStatusIcons();
    }

    // 右键菜单管理（□4）：checkbox 勾=显示；有独立开关的项绑 store（与各功能区开关同一数据），
    // 无开关项读写 hiddenMenuItems 隐藏集。toggle 只改内存，面板关闭由 IndexConf 统一落盘。
    let menuManageTick = $state(0);
    // checkbox 忠实反映「菜单项当前是否显示」：隐藏集优先 + 有独立开关的还要开关开
    // + 挂 master（功能区总开关）的还要总开关开（三层合成一个视图，master 关时勾了也不出现，
    // 故 toggle 显示分支连 master 一并打开）；toggle 统一走隐藏集——隐藏=加 key，
    // 显示=删 key 且确保开关开（有 store 的项在此开 = 功能区开关同步开，同一数据两个视图）
    function menuItemSelected(item: ManagedMenuItem): boolean {
        if (menuKeyHidden(item.key)) return false;
        if (item.master && !item.master.get()) return false;
        return item.store ? item.store.get() : true;
    }
    function toggleMenuItem(item: ManagedMenuItem, ev: Event) {
        const target = ev.currentTarget as HTMLInputElement;
        const checked = target?.checked ?? !menuItemSelected(item);
        if (checked) {
            hiddenMenuItems.set(menuHiddenKeys().filter((k: string) => k !== item.key));
            item.store?.set(true);
            item.master?.set(true);
        } else {
            const arr = [...menuHiddenKeys()];
            if (!arr.includes(item.key)) arr.push(item.key);
            hiddenMenuItems.set(arr);
        }
        menuManageTick++;
    }
    function showAllMenuItems() {
        hiddenMenuItems.set([]);
        for (const g of MENU_MANAGE_GROUPS) {
            for (const it of g.items) it.store?.set(true);
        }
        menuManageTick++;
    }

    // 提示音选择化（□3）：下拉+试听+自定义展开。存储语义零迁移——选中预置=存打包路径，
    // 默认=存空串；存量非法值（如 Windows 本地路径，Chromium 必拒且静默）回落 custom 并标红引导。
    const audioOption = $derived(audioOptionOf($tomato_clocks_audio));
    // select 显示值走本地 state：切「自定义」只展开输入框不清 store 值（否则 store 驱动的
    // audioOption 仍指旧预置，{#if} 不展开且单向绑定把 select 弹回）；store 写入后由 $effect 收敛同步
    let audioSel: AudioOptionId = $state(audioOptionOf($tomato_clocks_audio));
    $effect(() => {
        // 空串=default 语义，但用户正在 custom 行内编辑清空时不回弹收行
        // （防「全选→删→粘贴」标准动作把编辑中的输入框卸载失焦；输入值恰等于某预置路径
        //  时仍收敛到该预置——那是语义正确，不受此守卫保护）
        if (audioOption === "default" && audioSel === "custom") return;
        audioSel = audioOption;
    });
    const customAudioInvalid = $derived(audioSel === "custom" && !isValidAudioUrl($tomato_clocks_audio));
    const audioOptions = $derived([
        ...AUDIO_PRESETS.map((p) => ({ id: p.id as AudioOptionId, label: audioPresetLabel(p.id) })),
        { id: "custom" as AudioOptionId, label: tomatoI18n.自定义 },
    ]);
    function audioPresetLabel(id: Exclude<AudioOptionId, "custom">): string {
        switch (id) {
            case "default": return tomatoI18n.提示音默认;
            case "bell": return tomatoI18n.提示音清脆铃;
            case "chime": return tomatoI18n.提示音柔和钟;
            case "woodblock": return tomatoI18n.提示音木鱼;
        }
    }
    function onAudioOptionChange(e: Event) {
        const id = (e.currentTarget as HTMLSelectElement).value as AudioOptionId;
        audioSel = id;
        if (id === "custom") return; // 只展开输入框，不清现值（老自定义 URL 原样可改）
        void tomato_clocks_audio.write(audioStoreOf(id));
    }
    function onCustomAudioChange() {
        void tomato_clocks_audio.write(); // bind 已进 store，这里只落盘
    }
    function previewNoticeAudio() {
        // 点击手势栈内 play() 必响（思源桌面端 autoplayPolicy=user-gesture-required，粘性激活即放行）；
        // custom 无效/为空时回落默认音——试听按钮点了总要有声
        let url: string;
        if (audioSel === "custom") {
            const c = $tomato_clocks_audio.trim();
            url = c && isValidAudioUrl(c) ? c : NOTICE_AUDIO_URL;
        } else {
            url = audioStoreOf(audioSel);
        }
        try {
            new Audio(url).play()?.catch?.(() => { });
        } catch { /* 静默：试听失败不弹提示 */ }
    }
    async function onPickAudioFile(e: Event) {
        const input = e.currentTarget as HTMLInputElement;
        const file = input.files?.[0];
        input.value = ""; // 复位以允许再次选择同一文件
        if (!file) return;
        // accept 只是文件选择器建议，可切「所有文件」——非音频在此拦下，
        // 否则错误被推迟到第一次到点播放失败（最差时机）
        if (!file.type.startsWith("audio/")) {
            void siyuan.pushMsg(tomatoI18n.提示音文件类型不支持, 3000);
            return;
        }
        const name = uploadAssetName(file.name);
        try {
            // 直接 fetch 判 code：封装的 siyuan.putFile 成功时也返回 null（data 字段恒 null），
            // 无法区分成败（NoteBox 先例同样不判返回值）
            const fd = new FormData();
            fd.append("path", "/data/assets/" + name);
            fd.append("file", file);
            fd.append("isDir", "false");
            const resp = await fetch("/api/file/putFile", { method: "POST", body: fd });
            const data = await resp.json();
            if (data.code !== 0) throw new Error(data.msg);
            await tomato_clocks_audio.write("/assets/" + name);
        } catch (e) {
            console.error("upload notice audio failed:", e);
            void siyuan.pushMsg(tomatoI18n.提示音上传失败, 3000);
        }
    }

    // 背景图自定义（□4）：明/暗两行各自配图（VS Code 式）——缩略图 + URL 手填（非法标红）+
    // 选文件直传 assets；透明度滑块拖动全屏真预览、松手落盘。行级单层置灰纪律同 □2
    const bgLightEmpty = $derived($tomato_clocks_change_bg.trim() === "");
    const bgDarkEmpty = $derived($tomato_clocks_change_bg_dark.trim() === "");
    const bgLightInvalid = $derived(!bgLightEmpty && !isValidBgUrl($tomato_clocks_change_bg));
    const bgDarkInvalid = $derived(!bgDarkEmpty && !isValidBgUrl($tomato_clocks_change_bg_dark));
    let bgLightThumbBroken = $state(false);
    let bgDarkThumbBroken = $state(false);
    function onBgUrlChange() {
        void tomato_clocks_change_bg.write();
        tomatoClock.refreshBgImg();
    }
    function onBgUrlDarkChange() {
        void tomato_clocks_change_bg_dark.write();
        tomatoClock.refreshBgImg();
    }
    async function onPickBgFile(e: Event, dark: boolean) {
        const input = e.currentTarget as HTMLInputElement;
        const file = input.files?.[0];
        input.value = ""; // 复位以允许再次选择同一文件
        if (!file) return;
        // 类型白名单而非 image/* 前缀：HEIC 等 Chromium 不解码的格式走完上传后只会落「图片失效」，
        // 用户会误以为图坏了——在此拦下并引导（评审 P2-5）
        const BG_MIME_OK = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp", "image/svg+xml"];
        if (!BG_MIME_OK.includes(file.type)) {
            void siyuan.pushMsg(tomatoI18n.背景文件类型不支持, 3000);
            return;
        }
        const name = bgUploadAssetName(file.name);
        try {
            // 直接 fetch 判 code：封装的 siyuan.putFile 成功时也返回 null（data 恒 null）无法区分成败
            const fd = new FormData();
            fd.append("path", "/data/assets/" + name);
            fd.append("file", file);
            fd.append("isDir", "false");
            const resp = await fetch("/api/file/putFile", { method: "POST", body: fd });
            const data = await resp.json();
            if (data.code !== 0) throw new Error(data.msg);
            await (dark ? tomato_clocks_change_bg_dark : tomato_clocks_change_bg).write("/assets/" + name);
            tomatoClock.refreshBgImg();
        } catch (e) {
            console.error("upload bg image failed:", e);
            void siyuan.pushMsg(tomatoI18n.背景上传失败, 3000);
        }
    }

    // 透明度滑块（□4）：值走本地 state（store 保持 "0.16" 小数串零迁移）；拖动写内存+全屏真预览，
    // 松手一次 write 落盘（chips 同款写盘纪律）；store 外部变化经 $effect 收敛回滑块
    let opacityPct = $state(opacityPercentOf($tomato_clocks_opacity));
    $effect(() => {
        opacityPct = opacityPercentOf($tomato_clocks_opacity);
    });
    function onOpacityInput(e: Event) {
        opacityPct = Number((e.currentTarget as HTMLInputElement).value);
        tomatoClock.updateBgPreview((opacityPct / 100).toFixed(2));
    }
    async function onOpacityChange() {
        await tomato_clocks_opacity.write(opacityToStore(opacityPct));
        tomatoClock.endBgPreview();
    }
    // 面板销毁兜底撤预览层（正常路径松手已撤；防极端卸载残挂 body）
    onDestroy(() => tomatoClock.endBgPreview());
</script>

    <!-- 状态栏番茄钟：13 行结构（spec 2026-08-29-2259）：计时 6 行 → 提示 4 行 → 氛围 3 行 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$tomatoClockCheckbox} />
            {tomatoI18n.状态栏番茄钟}
        </div>
        {#if $tomatoClockCheckbox}
            <div>
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$tomato_clocks_position_right}
                    onchange={onPositionChange}
                />
                {tomatoI18n.番茄钟在状态栏的右边}
            </div>

            <!-- 番茄钟时长：chips 形态（□2 整行重造，勾选即生效） -->
            <div class="tomato-chip-row">
                {#each PRESET_CLOCKS as n (n)}
                    <button
                        type="button"
                        class="tomato-chip"
                        class:tomato-chip--selected={isChipSelected(n)}
                        class:tomato-chip--disabled={isChipDisabled(n)}
                        disabled={isChipDisabled(n)}
                        aria-pressed={isChipSelected(n)}
                        onclick={() => toggleChip(n)}
                    >{n}</button>
                {/each}
                <!-- 已选的非预设值（自定义档）追加在预设之后 -->
                {#each customClocks as n (n)}
                    <button
                        type="button"
                        class="tomato-chip"
                        class:tomato-chip--selected={isChipSelected(n)}
                        aria-pressed={isChipSelected(n)}
                        onclick={() => toggleChip(n)}
                    >{n}</button>
                {/each}
                <input
                    class="b3-text-field tomato-chip-input"
                    type="number"
                    min="1"
                    step="1"
                    placeholder={tomatoI18n.自定义分钟数}
                    aria-label={tomatoI18n.自定义分钟数}
                    bind:value={chipDraftMinutes}
                />
                <button
                    type="button"
                    class="b3-button b3-button--outline tomato-chip-add"
                    disabled={isAddDisabled}
                    onclick={addCustomClock}
                >{tomatoI18n.添加}</button>
                <span class="tomato-row-label">{tomatoI18n.番茄钟时长}</span>
                <div class="helpText">{tomatoI18n.番茄钟时长帮助.replaceAll("{max}", String(MAX_CLOCKS))}</div>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$tomato_clocks_loop} />
                {tomatoI18n.自动循环}
                <div class="helpText">{tomatoI18n.自动循环帮助}</div>
            </div>

            {#if $tomato_clocks_loop}
                <div class="tomato-input-row">
                    <input class="b3-text-field" type="number" min="1" bind:value={$tomato_clocks_break} />
                    <span class="tomato-row-label">{tomatoI18n.休息时长分钟}</span>
                </div>
            {/if}

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$tomato_clocks_focus} />
                {tomatoI18n.专注时长写入文档}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$tomato_clocks_force_dialog} />
                {tomatoI18n.禁用强提醒}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$tomato_clocks_notice} />
                {tomatoI18n.到点提示音}
            </div>

            <!-- 提示音选择化（□3 整行重造）：下拉（默认+预置+自定义）+ 试听；自定义时下行展开输入+选文件上传 assets -->
            <div class="tomato-input-row">
                <select class="b3-select tomato-audio-select" value={audioSel} onchange={onAudioOptionChange}>
                    {#each audioOptions as opt (opt.id)}
                        <option value={opt.id}>{opt.label}</option>
                    {/each}
                </select>
                <button type="button" class="b3-button b3-button--small tomato-audio-preview" onclick={previewNoticeAudio}>
                    {tomatoI18n.试听}
                </button>
                <span class="tomato-row-label">{tomatoI18n.提示音}</span>
                <div class="helpText">{tomatoI18n.提示音帮助}</div>
            </div>
            {#if audioSel === "custom"}
                <div class="tomato-input-row">
                    <input
                        class="b3-text-field"
                        class:tomato-audio-invalid={customAudioInvalid}
                        bind:value={$tomato_clocks_audio}
                        onchange={onCustomAudioChange}
                    />
                    <label class="b3-button b3-button--small tomato-audio-file-btn">
                        {tomatoI18n.选择文件}
                        <input
                            type="file"
                            accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
                            class="tomato-audio-file-input"
                            onchange={onPickAudioFile}
                        />
                    </label>
                    {#if customAudioInvalid}
                        <div class="helpText tomato-audio-invalid-hint">{tomatoI18n.提示音地址无效}</div>
                    {/if}
                </div>
            {/if}

            <div class="tomato-input-row">
                <input class="b3-text-field" bind:value={$tomato_clocks_force_notice} />
                <span class="tomato-row-label">{tomatoI18n.随机视频}</span>
                <div class="helpText">{tomatoI18n.随机视频帮助}</div>
            </div>

            <!-- 背景图自定义（□4 整行重造）：明/暗各自配图——缩略图+手填 URL（非法标红）+选文件直传 assets -->
            <div class="tomato-input-row" class:codeNotValid>
                <span
                    class="tomato-bg-thumb"
                    class:tomato-bg-thumb--empty={bgLightEmpty}
                    class:tomato-bg-thumb--broken={bgLightThumbBroken}
                >
                    {#if bgLightEmpty}
                        {tomatoI18n.背景未设置}
                    {:else if bgLightInvalid}
                        <!-- 非法地址只走输入框标红+提示行；缩略图保持空框，坏链态不随键入闪烁（评审 P2-6） -->
                    {:else}
                        <img
                            class="tomato-bg-thumb-img"
                            src={$tomato_clocks_change_bg}
                            alt=""
                            onerror={() => (bgLightThumbBroken = true)}
                            onload={() => (bgLightThumbBroken = false)}
                        />
                        {#if bgLightThumbBroken}<span class="tomato-bg-thumb-broken-text">{tomatoI18n.背景图片失效}</span>{/if}
                    {/if}
                </span>
                <input
                    disabled={codeNotValid}
                    class="b3-text-field"
                    class:tomato-bg-invalid={bgLightInvalid}
                    placeholder={tomatoI18n.背景未设置占位}
                    bind:value={$tomato_clocks_change_bg}
                    onchange={onBgUrlChange}
                />
                <label class="b3-button b3-button--small tomato-bg-file-btn">
                    {tomatoI18n.选择文件}
                    <input
                        type="file"
                        accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp,.svg"
                        class="tomato-bg-file-input"
                        onchange={(e) => onPickBgFile(e, false)}
                    />
                </label>
                <span class="tomato-row-label">{tomatoI18n.明亮模式背景}</span>
                <TomatoVIP {codeValid}></TomatoVIP>
                {#if bgLightInvalid}
                    <div class="helpText tomato-bg-invalid-hint">{tomatoI18n.背景地址无效}</div>
                {/if}
                <div class="helpText">{tomatoI18n.明亮模式背景帮助}</div>
            </div>

            <div class="tomato-input-row" class:codeNotValid>
                <span
                    class="tomato-bg-thumb"
                    class:tomato-bg-thumb--empty={bgDarkEmpty}
                    class:tomato-bg-thumb--broken={bgDarkThumbBroken}
                >
                    {#if bgDarkEmpty}
                        {tomatoI18n.背景未设置}
                    {:else if bgDarkInvalid}
                        <!-- 同明色行：非法地址不闪坏链态 -->
                    {:else}
                        <img
                            class="tomato-bg-thumb-img"
                            src={$tomato_clocks_change_bg_dark}
                            alt=""
                            onerror={() => (bgDarkThumbBroken = true)}
                            onload={() => (bgDarkThumbBroken = false)}
                        />
                        {#if bgDarkThumbBroken}<span class="tomato-bg-thumb-broken-text">{tomatoI18n.背景图片失效}</span>{/if}
                    {/if}
                </span>
                <input
                    disabled={codeNotValid}
                    class="b3-text-field"
                    class:tomato-bg-invalid={bgDarkInvalid}
                    placeholder={tomatoI18n.背景未设置占位}
                    bind:value={$tomato_clocks_change_bg_dark}
                    onchange={onBgUrlDarkChange}
                />
                <label class="b3-button b3-button--small tomato-bg-file-btn">
                    {tomatoI18n.选择文件}
                    <input
                        type="file"
                        accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp,.svg"
                        class="tomato-bg-file-input"
                        onchange={(e) => onPickBgFile(e, true)}
                    />
                </label>
                <span class="tomato-row-label">{tomatoI18n.黑暗模式背景}</span>
                <TomatoVIP {codeValid}></TomatoVIP>
                {#if bgDarkInvalid}
                    <div class="helpText tomato-bg-invalid-hint">{tomatoI18n.背景地址无效}</div>
                {/if}
                <div class="helpText">{tomatoI18n.黑暗模式背景帮助}</div>
            </div>

            <!-- 透明度滑块（□4）：拖动全屏真预览跟手，松手落盘；行内实时百分比标签 -->
            <div class="tomato-input-row" class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class="b3-slider tomato-bg-opacity-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={opacityPct}
                    oninput={onOpacityInput}
                    onchange={onOpacityChange}
                />
                <span class="tomato-bg-opacity-value">{opacityPct}%</span>
                <span class="tomato-row-label">{tomatoI18n.背景图透明度}</span>
                <TomatoVIP {codeValid}></TomatoVIP>
                <div class="helpText">{tomatoI18n.背景图透明度帮助}</div>
            </div>
        {/if}
    </div>
    <!-- 拍照闪念 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$noteBoxCheckbox} />
            {tomatoI18n.拍照闪念收集图片闪念到}
        </div>
        {#if $noteBoxCheckbox}
            <div>
                {NoteBox拍照闪念全局.langText()}<HotkeyCap hk={NoteBox拍照闪念全局} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <textarea spellcheck="false" class="b3-text-field" bind:value={$noteBoxAllKinds}></textarea>
                {tomatoI18n.自定义图标}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$flashThoughtUseDialog} />
                {tomatoI18n.触发快捷键时弹出对话框}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$avoiding_cloud_synchronization_conflicts}
                />
                {tomatoI18n.规避云端同步冲突}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$flash_thoughts_2_top} />
                {tomatoI18n.闪念插入到Dailynote顶端}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$cssFlashThoughts} />
                {tomatoI18n.显示闪念的时间与类型}
            </div>

            <div>
                <input class="b3-text-field" bind:value={$flash_thoughts_target_file} />
                {tomatoI18n.闪念插入到文件}
            </div>
        {/if}
    </div>
    <!-- 批注 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$commentBoxCheckbox} />
            {tomatoI18n.批注}
        </div>
        {#if $commentBoxCheckbox}
            <div>
                {tomatoI18n.打开批注页签}
                <HotkeyCap hk={CommentBoxTab批注} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$commentBoxMenu} />
                {tomatoI18n.menu添加右键菜单}
                <HotkeyCap hk={CommentBox添加批注到日记} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                {tomatoI18n.批注标记形态}
                <select
                    class="b3-select"
                    value={$commentBoxAnnoMarkStyle}
                    onchange={(e) => {
                        commentBoxAnnoMarkStyle.write(e.currentTarget.value);
                        applyAnnoVisual();
                    }}
                >
                    <option value="underline">{tomatoI18n.形态下划线式}</option>
                    <option value="marker">{tomatoI18n.形态马克笔式}</option>
                    <option value="frame">{tomatoI18n.形态花边框}</option>
                </select>
            </div>
            {#if $commentBoxAnnoMarkStyle === "underline"}
                <div>
                    {tomatoI18n.批注线型}
                    <select
                        class="b3-select"
                        value={$commentBoxAnnoLineType}
                        onchange={(e) => {
                            const v = e.currentTarget.value;
                            // 圆圈串细档环宽不足半像素退化成实心点（spec §11.1.1）：自动升标准档
                            if (v === "ring-bead" && commentBoxAnnoUnderlineThickness.get() === 1) {
                                commentBoxAnnoUnderlineThickness.write(2);
                            }
                            commentBoxAnnoLineType.write(v);
                            applyAnnoVisual();
                        }}
                    >
                        <option value="solid">{tomatoI18n.线型实线}</option>
                        <option value="dashed">{tomatoI18n.线型虚线}</option>
                        <option value="dotted">{tomatoI18n.线型点线}</option>
                        <option value="wavy">{tomatoI18n.线型波浪线}</option>
                        <option value="double">{tomatoI18n.线型双线}</option>
                        <option value="dot-bead">{tomatoI18n.线型圆点串}</option>
                        <option
                            value="ring-bead"
                            disabled={$commentBoxAnnoUnderlineThickness === 1}
                        >{tomatoI18n.线型圆圈串}</option>
                    </select>
                </div>
                <div>
                    <input
                        type="checkbox"
                        class="b3-switch"
                        checked={$commentBoxAnnoBg}
                        onchange={(e) => {
                            commentBoxAnnoBg.write(e.currentTarget.checked);
                            applyAnnoVisual();
                        }}
                    />
                    {tomatoI18n.批注背景微底色}
                </div>
            {/if}
            {#if $commentBoxAnnoMarkStyle !== "frame"}
                <div>
                    {$commentBoxAnnoMarkStyle === "marker" ? tomatoI18n.批注底色厚度 : tomatoI18n.批注下划线粗细}
                    <select
                        class="b3-select"
                        value={String($commentBoxAnnoUnderlineThickness)}
                        onchange={(e) => {
                            const v = Number(e.currentTarget.value);
                            commentBoxAnnoUnderlineThickness.write(v);
                            applyAnnoVisual();
                        }}
                    >
                        <option
                            value="1"
                            disabled={$commentBoxAnnoMarkStyle === "underline" && $commentBoxAnnoLineType === "ring-bead"}
                        >{tomatoI18n.细}</option>
                        <option value="2">{tomatoI18n.标准}</option>
                        <option value="3">{tomatoI18n.粗}</option>
                    </select>
                </div>
            {/if}
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$commentBoxShowID} />
                {tomatoI18n.显示ID}
            </div>
            <div>
                {tomatoI18n.面板皮肤}
                <select
                    class="b3-select"
                    value={$commentBoxPanelSkin}
                    onchange={(e) => {
                        commentBoxPanelSkin.write(e.currentTarget.value);
                    }}
                >
                    <option value="classic">{tomatoI18n.皮肤经典}</option>
                    <option value="candy">{tomatoI18n.皮肤糖霜}</option>
                    <option value="paper">{tomatoI18n.皮肤纸墨}</option>
                    <option value="airy">{tomatoI18n.皮肤疏朗}</option>
                </select>
            </div>
        {/if}
    </div>
    <!-- 思维导线 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$mindWireCheckbox} />
            {tomatoI18n.思维导线}
        </div>
        {#if $mindWireCheckbox}
            <div>
                {tomatoI18n.思维导线帮助}
            </div>
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$mindWireGlobalMenu} />
                {tomatoI18n.menu添加右键菜单}:
                {MindWire启用或禁用思维导线.langText()}
                <HotkeyCap hk={MindWire启用或禁用思维导线} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$mindWireDocMenu} />
                {tomatoI18n.menu添加右键菜单}:
                {MindWire启用或禁用文档思维导线.langText()}
                <HotkeyCap hk={MindWire启用或禁用文档思维导线} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$mindWireStarRefOnly} />
                {tomatoI18n.只关联星号引用}
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$mindWireLine}
                />
                {tomatoI18n.使用实线}<TomatoVIP {codeValid}></TomatoVIP>
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$mindWireColorfull}
                />
                {tomatoI18n.使用多种颜色}<TomatoVIP {codeValid}></TomatoVIP>
            </div>
            {#if !($mindWireLine && lastVerifyResult())}
                <div>
                    <input type="checkbox" class="b3-switch" bind:checked={$mindWireDynamicLine} />
                    {tomatoI18n.流动线条效果}
                </div>
            {/if}
            <div>
                <input class="b3-text-field" type="number" min="0.1" bind:value={$mindWireWidth} />
                {tomatoI18n.线条宽度}
            </div>
        {/if}
    </div>
    <!-- 块关系图 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$graphBoxCheckbox} />
            {tomatoI18n.块关系图}
        </div>
        {#if $graphBoxCheckbox}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$graph定位到图中的节点Menu} />
                {tomatoI18n.menu添加右键菜单}: {GraphBox定位到图中的节点.langText()}
                <HotkeyCap hk={GraphBox定位到图中的节点} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$graph打开块关系图Menu} />
                {tomatoI18n.menu添加右键菜单}: {GraphBox打开块关系图.langText()}
                <HotkeyCap hk={GraphBox打开块关系图} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$graphAddTopbarIcon} />
                {tomatoI18n.添加顶栏图标}
            </div>
            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$graphClick2Locate}
                />
                {tomatoI18n.左键点击节点跳转到文档}<TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input class="b3-text-field" bind:value={$graphMaxPBlocks} />
                {tomatoI18n.最大连续段落块数量}
            </div>

            <div>
                <input class="b3-text-field" bind:value={$graphMaxAllBlocks} />
                {tomatoI18n.最大节点数量}
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$graphHideStructEdges} />
                隐藏结构连线（仅显示引用形成的连线）
            </div>
            <div>
                {@html tomatoI18n.块关系图帮助}
            </div>
        {/if}
    </div>

    <div class="settingBox">
        <div class="section-title">{tomatoI18n.右键菜单管理}</div>
        <div class="tomato-menu-manage-note">{tomatoI18n.右键菜单管理说明}</div>
        <div class="tomato-menu-manage-toolbar">
            <button
                type="button"
                class="b3-button b3-button--small"
                onclick={showAllMenuItems}>{tomatoI18n.全部显示}</button
            >
        </div>
        {#key menuManageTick}
        {#each MENU_MANAGE_GROUPS as group (group.title())}
            <div class="tomato-menu-manage-group">
                <div class="tomato-menu-manage-group-title">{group.title()}</div>
                {#each group.items as item (item.key)}
                    <label class="fn__flex fn__flex-center tomato-menu-manage-item">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            checked={menuItemSelected(item)}
                            onchange={(ev) => toggleMenuItem(item, ev)}
                        />
                        <span class="fn__space"></span>
                        <span class="tomato-menu-manage-label">{item.label()}</span>
                    </label>
                {/each}
            </div>
        {/each}
        {/key}
    </div>
