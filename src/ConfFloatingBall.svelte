<script lang="ts">
    // IndexConf 设置分区：悬浮球（文档/快捷键绑定管理，含添加面板的全部本地状态）。
    // 从 IndexConf.svelte 拆出（2026-08 重构），共享样式见 IndexConf.css。
    import { onMount } from "svelte";
    import {
        floatingballDocList,
        floatingballDocMenu,
        floatingballDocTabMenu,
        floatingballEnable,
        floatingballKeyboardList,
    } from "./libs/stores";
    import {
        FloatingBallDocType_autoclose,
        FloatingBallDocType_dialog,
        FloatingBallDocType_float,
        FloatingBallDocType_tab,
        FloatingBallNotVIPLimit,
    } from "./libs/gconst";
    import { FloatingBallTab添加文档, FloatingBall添加文档, linkDoc2floatBall } from "./FloatingBall";
    import { shortcut2string } from "./libs/keyboard";
    import { pushReplaceBy } from "stonev5-utils";
    import { lastVerifyResult } from "./libs/user";
    import { events } from "./libs/Events";
    import { tomatoI18n } from "./tomatoI18n";
    import { helpOpen } from "./helpOpen";

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
        <div>
            <input type="checkbox" class="b3-switch" bind:checked={$floatingballEnable} />
            {tomatoI18n.悬浮球}
            <strong>
                <a href="https://awx9773btw.feishu.cn/docx/IFT9drxvSoYKVmxCcqncFOgknXg?from=from_copylink" onclick={helpOpen}>
                    {tomatoI18n.帮助}</a
                >
            </strong>
        </div>
        {#if $floatingballEnable}
            <div>{tomatoI18n.menu不显示菜单不影响快捷键的使用}</div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$floatingballDocMenu} />
                {tomatoI18n.menu添加右键菜单}: {FloatingBall添加文档.langText()}
                <strong>{FloatingBall添加文档.w()}</strong>
            </div>
            <div>
                <input type="checkbox" class="b3-switch" bind:checked={$floatingballDocTabMenu} />
                {tomatoI18n.menu添加右键菜单}: {FloatingBallTab添加文档.langText()}
                <strong>{FloatingBallTab添加文档.w()}</strong>
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
