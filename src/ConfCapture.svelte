<script lang="ts">
    // 设置域组件（□2 设置页重划）：速记——悬浮球（原 ConfFloatingBall 全部）+ 拍照闪念
    // （自 ConfClock.svelte 迁入）+ 快速笔记（自 ConfMisc.svelte 迁入）。
    // 各卡整块迁入（内部一行不动），共享样式见 IndexConf.css。
    import { onMount } from "svelte";
    import TomatoVIP from "./TomatoVIP.svelte";
    import NotebookSelect from "./NotebookSelect.svelte";
    import {
        floatingballDocList,
        floatingballDocMenu,
        floatingballDocTabMenu,
        floatingballEnable,
        floatingballKeyboardList,
        avoiding_cloud_synchronization_conflicts,
        cssFlashThoughts,
        flashThoughtUseDialog,
        flash_thoughts_2_top,
        flash_thoughts_target_file,
        noteBoxAllKinds,
        noteBoxCheckbox,
        fastNoteBoxAdd2Flashcard,
        fastNoteBoxCheckbox,
        fastNoteBoxDelAfterCreating,
        fastNoteBoxDisableBK,
        fastNoteBoxDocPrefix,
        storeNoteBox_fastnote,
    } from "./libs/stores";
    import {
        FloatingBallDocType_autoclose,
        FloatingBallDocType_dialog,
        FloatingBallDocType_float,
        FloatingBallDocType_tab,
        FloatingBallNotVIPLimit,
    } from "./libs/gconst";
    import { FloatingBallTab添加文档, FloatingBall添加文档, linkDoc2floatBall } from "./FloatingBall";
    import { NoteBox拍照闪念全局 } from "./NoteBox";
    import { FastNoteBox创建快速笔记, FastNoteBox打开最后一个笔记, FastNoteBox草稿切换 } from "./FastNoteBox";
    import { shortcut2string } from "./libs/keyboard";
    import { pushReplaceBy } from "stonev5-utils";
    import { lastVerifyResult } from "./libs/user";
    import { events } from "./libs/Events";
    import { tomatoI18n } from "./tomatoI18n";
    import HotkeyCap from "./HotkeyCap.svelte";
    import ConfHelpIcon from "./ConfHelpIcon.svelte";

    let { codeValid }: { codeValid: boolean } = $props();
    let codeNotValid = $derived(!codeValid);

    let addDocSettings: HTMLElement = $state();
    let addShortcutSettings: HTMLElement = $state();
    let addDoc_docName = $state("");
    let addDoc_docIcon = $state("");
    let addDoc_keyboardIcon = $state("");
    let addDoc_keyboardpreview = $state("");
    let addDoc_keyboardKeyCode = $state("");
    let addDoc_keyboardAlt = $state(false);
    let addDoc_keyboardShift = $state(false);
    let addDoc_keyboardCtrl = $state(false);
    let addDoc_useDialog = $state(FloatingBallDocType_float.id);

    onMount(() => {
        if (addDocSettings?.style?.display) {
            addDocSettings.style.display = "none";
        }
        if (addShortcutSettings?.style?.display) {
            addShortcutSettings.style.display = "none";
        }
    });

    function toggleDiv(div: HTMLElement) {
        if (div.style.display === "none" || div.style.display === "") {
            div.style.display = "block";
        } else {
            div.style.display = "none";
        }
    }

    function showName(name: string, icon: string, docType?: number) {
        let docTypeStr = "";
        switch (docType) {
            case FloatingBallDocType_tab.id:
                docTypeStr = FloatingBallDocType_tab.txt;
                break;
            case FloatingBallDocType_dialog.id:
                docTypeStr = FloatingBallDocType_dialog.txt;
                break;
            case FloatingBallDocType_autoclose.id:
                docTypeStr = FloatingBallDocType_autoclose.txt;
                break;
            case FloatingBallDocType_float.id:
                docTypeStr = FloatingBallDocType_float.txt;
                break;
            default:
        }
        if (docTypeStr) {
            docTypeStr = `(${docTypeStr})`;
        }

        if (name.toLocaleLowerCase() == icon.toLocaleLowerCase()) {
            return name + docTypeStr;
        }
        return `${name}(${icon})${docTypeStr}`;
    }

    function flatingkbchange() {
        addDoc_keyboardpreview = shortcut2string({
            key: addDoc_keyboardKeyCode,
            altKey: addDoc_keyboardAlt,
            ctrlKey: addDoc_keyboardCtrl,
            shiftKey: addDoc_keyboardShift,
        });
    }
</script>

    <!-- 悬浮球 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$floatingballEnable} />
            {tomatoI18n.悬浮球}
            <ConfHelpIcon token="IFT9drxvSoYKVmxCcqncFOgknXg" />
        </div>
        {#if $floatingballEnable}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$floatingballDocMenu} />
                {tomatoI18n.menu添加右键菜单}: {FloatingBall添加文档.langText()}
                <HotkeyCap hk={FloatingBall添加文档} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$floatingballDocTabMenu} />
                {tomatoI18n.menu添加右键菜单}: {FloatingBallTab添加文档.langText()}
                <HotkeyCap hk={FloatingBallTab添加文档} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>
            <!-- 列出文档绑定 -->
            <div>
                {#if $floatingballDocList.length > FloatingBallNotVIPLimit && !lastVerifyResult()}
                    ⚠️{tomatoI18n.非VIP上限为x个(FloatingBallNotVIPLimit, "📄")}
                {/if}
            </div>
            {#each $floatingballDocList as item, index}
                <div>
                    <label class="space">
                        <input type="checkbox" class="b3-switch" bind:checked={item.enable} />{tomatoI18n.桌面端}
                    </label>
                    <label class="space">
                        <input type="checkbox" class="b3-switch" bind:checked={item.enableMobile} />{tomatoI18n.移动端}
                    </label>
                    <button
                        class="b3-button b3-button--text space"
                        onclick={() => {
                            $floatingballDocList.splice(index, 1);
                            $floatingballDocList = $floatingballDocList;
                        }}
                    >
                        🗑️
                    </button>
                    <span class="text space">📄{showName(item.docName, item.docIcon, item.openDocType)} </span>
                </div>
            {/each}
            <!-- 列出快捷键绑定 -->
            <div>
                {#if $floatingballKeyboardList.length > FloatingBallNotVIPLimit && !lastVerifyResult()}
                    ⚠️{tomatoI18n.非VIP上限为x个(FloatingBallNotVIPLimit, "⌨️")}
                {/if}
            </div>
            {#each $floatingballKeyboardList as item, index}
                <div>
                    <label class="space">
                        <input type="checkbox" class="b3-switch" bind:checked={item.enable} />{tomatoI18n.桌面端}
                    </label>
                    <label class="space">
                        <input type="checkbox" class="b3-switch" bind:checked={item.enableMobile} />{tomatoI18n.移动端}
                    </label>
                    <button
                        class="b3-button b3-button--text space"
                        onclick={() => {
                            $floatingballKeyboardList.splice(index, 1);
                            $floatingballKeyboardList = $floatingballKeyboardList;
                        }}
                    >
                        🗑️
                    </button>
                    <span class="text space">⌨️{showName(shortcut2string(item), item.keyIcon)} </span>
                </div>
            {/each}
            <!-- 添加按钮 -->
            <div>
                <button
                    class="b3-button b3-button--outline space"
                    onclick={() => {
                        toggleDiv(addDocSettings);
                    }}
                    >➕{tomatoI18n.文档}
                </button>
                <button
                    class="b3-button b3-button--outline space"
                    onclick={() => {
                        toggleDiv(addShortcutSettings);
                    }}
                    >➕{tomatoI18n.快捷键}
                </button>
            </div>
            <!-- 绑定文档配置 -->
            <div bind:this={addDocSettings} style="display: none;">
                <div class="spacetop">
                    <input
                        placeholder={addDoc_docName}
                        class="b3-text-field space"
                        bind:value={addDoc_docIcon}
                    />{tomatoI18n.图标}
                </div>
                <div class="spacetop">
                    <input class="b3-text-field space" bind:value={addDoc_docName} />{tomatoI18n.文档名}
                </div>
                <div class="spacetop">
                    <label class="space">
                        <input
                            type="radio"
                            name="addDoc_openType"
                            value={FloatingBallDocType_tab.id}
                            bind:group={addDoc_useDialog}
                        />
                        {FloatingBallDocType_tab.txt}
                    </label>
                    <label class="space">
                        <input
                            type="radio"
                            name="addDoc_openType"
                            value={FloatingBallDocType_dialog.id}
                            bind:group={addDoc_useDialog}
                        />
                        {FloatingBallDocType_dialog.txt}
                    </label>
                    <label class="space">
                        <input
                            type="radio"
                            name="addDoc_openType"
                            value={FloatingBallDocType_autoclose.id}
                            bind:group={addDoc_useDialog}
                        />
                        {FloatingBallDocType_autoclose.txt}
                    </label>
                    <label class="space">
                        <input
                            type="radio"
                            name="addDoc_openType"
                            value={FloatingBallDocType_float.id}
                            bind:group={addDoc_useDialog}
                        />
                        {FloatingBallDocType_float.txt}
                    </label>
                </div>
                <button
                    class="b3-button b3-button--outline spacetop"
                    onclick={() => {
                        linkDoc2floatBall(addDoc_docName, addDoc_docIcon, addDoc_useDialog);
                        $floatingballDocList = $floatingballDocList;
                    }}
                    >{tomatoI18n.绑定文档到悬浮按钮}
                </button>
                <button
                    class="b3-button b3-button--outline spacetop"
                    onclick={() => {
                        addDoc_docName = "$$dailynote";
                        addDoc_docIcon = "🗓️📒";
                    }}
                    >{tomatoI18n.特殊绑定当天日志}
                </button>
            </div>
            <!-- 绑定快捷键配置 -->
            <div bind:this={addShortcutSettings} style="display: none;">
                <div class="spacetop">
                    <input
                        placeholder={addDoc_keyboardpreview}
                        class="b3-text-field space"
                        bind:value={addDoc_keyboardIcon}
                    />{tomatoI18n.图标}
                </div>
                <div class="spacetop">
                    <input
                        class="b3-text-field space"
                        bind:value={addDoc_keyboardKeyCode}
                        oninput={flatingkbchange}
                    />{tomatoI18n.键}
                </div>
                <div class="spacetop">
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={addDoc_keyboardAlt}
                            onchange={flatingkbchange}
                        />alt
                    </label>
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={addDoc_keyboardShift}
                            onchange={flatingkbchange}
                        />shift
                    </label>
                    <label class="space">
                        <input
                            type="checkbox"
                            class="b3-switch"
                            bind:checked={addDoc_keyboardCtrl}
                            onchange={flatingkbchange}
                        />{events.isMac ? "cmd" : "ctrl"}
                    </label>
                </div>
                <button
                    class="b3-button b3-button--outline spacetop"
                    onclick={() => {
                        if (addDoc_keyboardKeyCode) {
                            let icon = addDoc_keyboardIcon;
                            if (!icon) {
                                icon = addDoc_keyboardpreview;
                            }
                            addDoc_keyboardKeyCode = addDoc_keyboardKeyCode.toLocaleUpperCase();
                            $floatingballKeyboardList = pushReplaceBy(
                                $floatingballKeyboardList,
                                {
                                    enableMobile: true,
                                    enable: true,
                                    keyIcon: icon,
                                    key: addDoc_keyboardKeyCode,
                                    altKey: addDoc_keyboardAlt,
                                    shiftKey: addDoc_keyboardShift,
                                    ctrlKey: addDoc_keyboardCtrl,
                                },
                                (item) => `${item.key}#${item.altKey}#${item.ctrlKey}#${item.shiftKey}`,
                            );
                            floatingballKeyboardList.write();
                        }
                    }}
                    >{tomatoI18n.绑定快捷键到悬浮按钮 + addDoc_keyboardpreview}
                </button>
            </div>
        {/if}
    </div>
    <!-- 拍照闪念 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$noteBoxCheckbox} />
            {tomatoI18n.拍照闪念收集图片闪念到}
            <ConfHelpIcon token="N3LkdvKGhowkTUx1r6OcxCjInec" />
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
    <!-- 快速笔记 -->
    <div class="settingBox">
        <div class="section-title">
            <input type="checkbox" class="b3-switch" bind:checked={$fastNoteBoxCheckbox} />
            {tomatoI18n.快速笔记}
            <ConfHelpIcon token="DNZ1dYORAoHpm7xdPaecyb6Pnrh" />
        </div>
        {#if $fastNoteBoxCheckbox}
            <div>{tomatoI18n.快捷键如有冲突请调整}</div>

            <div>
                {tomatoI18n.创建快速笔记}
                <HotkeyCap hk={FastNoteBox创建快速笔记} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div>
                {tomatoI18n.打开最后一个笔记}
                <HotkeyCap hk={FastNoteBox打开最后一个笔记} pluginName="sy-tomato-plugin"></HotkeyCap>
            </div>

            <div class:codeNotValid>
                {FastNoteBox草稿切换.langText()}
                <HotkeyCap hk={FastNoteBox草稿切换} pluginName="sy-tomato-plugin"></HotkeyCap><TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <NotebookSelect store={storeNoteBox_fastnote}></NotebookSelect>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$fastNoteBoxDisableBK} />
                {tomatoI18n.禁用底部反链}
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$fastNoteBoxAdd2Flashcard} />
                {tomatoI18n.创建文件时制卡}
            </div>

            <div class:codeNotValid>
                <input
                    disabled={codeNotValid}
                    class:codeNotValid
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$fastNoteBoxDelAfterCreating}
                />
                {tomatoI18n.删除所选段落}
                <TomatoVIP {codeValid}></TomatoVIP>
            </div>

            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$fastNoteBoxDocPrefix} />
                {tomatoI18n.使用当前文档名字的前缀}
            </div>
        {/if}
    </div>
