<script lang="ts">
    import { IProtyle } from "siyuan";
    import { DestroyManager } from "./libs/destroyer";
    import {
        commentBoxAddFlashCard,
        commentBoxAddKeepText,
        commentBoxAddTime,
        commentBoxAddUnderline,
    } from "./libs/stores";
    import {
        DomSuperBlockBuilder,
        domNewLine,
        DomListBuilder,
    } from "./libs/sydom";
    import {
        getAllText,
        add_ref,
        cloneCleanDiv,
        extendMap,
        getAttribute,
        setAttribute,
        siyuan,
        getContextPath,
        timeUtil,
    } from "./libs/utils";
    import { onDestroy, onMount } from "svelte";
    import { tomatoI18n } from "./tomatoI18n";
    import { SPACE } from "./libs/gconst";

    export let dm: DestroyManager;
    export let protyle: IProtyle;
    export let boxID: string;
    export let ro: Promise<string>;
    export let ids: string[];
    export let selected: HTMLElement[];
    export let rangeText: string;
    export let range: Range;
    const ops: IOperation[] = [];
    const newDivs: HTMLElement[] = [];
    let text = "";
    let textField: HTMLTextAreaElement;
    let btn: HTMLButtonElement;
    const key = "tomato comment text key 2025-6-5 21:37:27";

    onDestroy(destroy);
    function destroy() {
        if (commentBoxAddKeepText.get()) {
            localStorage.setItem(key, text);
        }
        dm.destroyBy("svelte");
    }
    onMount(() => {
        if (commentBoxAddKeepText.get()) {
            text = localStorage.getItem(key) ?? "";
        }

        dm.setData("resizeCallback", (element: HTMLElement) => {
            if (!element) return;
            let height = element.clientHeight;
            height = height - (btn.clientHeight * 4 + 10);
            textField.style.height = height + "px";
        });
        textField.focus();
    });

    async function saveComment() {
        const createDailyNoteTask = siyuan.createDailyNote(boxID);
        const rpath = getContextPath(ids[0]).then((a) => {
            if (commentBoxAddTime.get()) {
                return timeUtil.nowStr() + SPACE + a.getPathStr();
            }
            return a.getPathStr();
        });

        const builder = new DomSuperBlockBuilder();
        let txt = getAllText(selected, "");
        // if (rangeText) {
        //     const div = domNewLine(rangeText.trim());
        //     add_ref(div, ids[0], "*", true, false);
        //     newDivs.push(div);
        // } else
        {
            const new2old = new Map<string, string>();
            const cloned = selected.map((s) => {
                const { new2old: m, div } = cloneCleanDiv(s, true);
                extendMap(new2old, m);
                return div;
            });
            if (rangeText) {
                newDivs.push(domNewLine("👉" + rangeText.trim() + "👈"));
            }
            newDivs.push(...cloned);
            cloned
                .map((div) => {
                    const all: HTMLElement[] = [
                        ...div.querySelectorAll(
                            `div[data-node-id][data-type="NodeParagraph"]`,
                        ),
                    ] as any;
                    if (all.length == 0) return [div];
                    return all;
                })
                .flat()
                .forEach((div) => {
                    add_ref(
                        div,
                        new2old.get(getAttribute(div, "data-node-id")),
                        "*",
                        true,
                        true,
                    );
                    setAttribute(div, "custom-comment-bk-id", builder.id);
                    div.style.backgroundColor = "";
                });
        }

        builder.setAttr("custom-lnk-bottom", "1");
        builder.setAttr("custom-tomato-ref-hpath", await rpath);
        text.trim()
            .split("\n")
            .forEach((l) => builder.append(domNewLine(l)));

        const txtLen = txt.length;
        const maxLen = 32;
        txt = txt.slice(0, maxLen);
        if (txtLen > maxLen) {
            txt += "...";
        }

        const list = new DomListBuilder();
        const sublist = list.newList(domNewLine(txt));
        sublist.append(...newDivs);
        builder.append(list.container);
        list.container.firstElementChild.setAttribute("fold", "1");
        list.container.firstElementChild.setAttribute(
            "custom-comment-heading",
            "1",
        );

        const { id: docID } = await createDailyNoteTask;
        const tail = await siyuan.getDocLastID(docID);
        ops.push(
            ...siyuan.transInsertBlocksAfter([builder.build().outerHTML], tail),
        );
        await siyuan.transactions(ops);

        if (commentBoxAddFlashCard.get()) {
            siyuan.addRiffCards([builder.id]);
        }

        if (commentBoxAddUnderline.get() && (await ro) != "true" && rangeText) {
            const hasUnderline = (e: HTMLElement) => {
                if (e?.tagName === "SPAN") {
                    if (getAttribute(e, "data-type") === "u") {
                        return true;
                    }
                }
            };
            try {
                const a = range?.startContainer?.parentElement;
                const b = range?.endContainer?.parentElement;
                protyle.toolbar.setInlineMark(protyle, "u", "range");
                if (hasUnderline(a) || hasUnderline(b)) {
                    protyle.toolbar.setInlineMark(protyle, "u", "range");
                }
            } catch (e) {}
        }
    }
</script>

<div class="container">
    <div>
        <label title={tomatoI18n.加入闪卡}>
            <input
                type="checkbox"
                class="b3-switch box"
                bind:checked={$commentBoxAddFlashCard}
                on:change={() => commentBoxAddFlashCard.write()}
            />
            {tomatoI18n.闪卡}
        </label>
        <label title={tomatoI18n.加入时间}>
            <input
                type="checkbox"
                class="b3-switch box"
                bind:checked={$commentBoxAddTime}
                on:change={() => commentBoxAddTime.write()}
            />
            {tomatoI18n.时间}
        </label>
        <label title={tomatoI18n.记忆上次的输入}>
            <input
                type="checkbox"
                class="b3-switch box"
                bind:checked={$commentBoxAddKeepText}
                on:change={() => commentBoxAddKeepText.write()}
            />
            {tomatoI18n.记忆}
        </label>
        <button
            title={tomatoI18n.清空}
            bind:this={btn}
            class="b3-button b3-button--text box"
            on:click={() => {
                text = "";
            }}>🗑️</button
        >
    </div>
    <textarea
        bind:this={textField}
        spellcheck="false"
        class="b3-text-field box"
        bind:value={text}
        on:keypress={(event) => {
            if (event instanceof KeyboardEvent) {
                if (event.key === "Enter") {
                    if (event.shiftKey || event.ctrlKey || event.altKey) {
                        saveComment();
                        destroy();
                    }
                }
            }
        }}
    />
    <button
        bind:this={btn}
        class="b3-button box"
        on:click={() => {
            saveComment();
            destroy();
        }}>Shift + Enter {tomatoI18n.保存}</button
    >
</div>

<style>
    textarea {
        min-width: 300px;
        width: auto;
        height: 200px;
        line-height: 2;
        font-size: x-large;
    }
    .container {
        display: flex;
        flex-direction: column;
    }
    .box {
        padding: 5px;
        margin: 5px;
    }
</style>
