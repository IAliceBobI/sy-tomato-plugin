<script lang="ts">
    import { IProtyle } from "siyuan";
    import { DestroyManager } from "./libs/destroyer";
    import {
        commentBoxAddFlashCard,
        commentBoxAddTime,
        commentBoxAddUnderline,
    } from "./libs/stores";
    import {
        DomSuperBlockBuilder,
        domNewLine,
        domNewHeading,
    } from "./libs/sydom";
    import {
        getAllText,
        add_ref,
        cloneCleanDiv,
        extendMap,
        getAttribute,
        setAttribute,
        NewNodeID,
        siyuan,
        setTimeouts,
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

    onDestroy(destroy);
    function destroy() {
        dm.destroyBy("svelte");
    }
    onMount(() => {
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
        if (rangeText) {
            const div = domNewLine(rangeText.trim());
            add_ref(div, ids[0], "*", true, false);
            newDivs.push(div);
        } else {
            const new2old = new Map<string, string>();
            const cloned = selected.map((s) => {
                const { new2old: m, div } = cloneCleanDiv(s, true);
                extendMap(new2old, m);
                return div;
            });
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

        const heandingID = NewNodeID();

        const txtLen = txt.length;
        const maxLen = 32;
        txt = txt.slice(0, maxLen);
        if (txtLen > maxLen) {
            txt += "...";
        }
        const h = domNewHeading(txt, "h6", heandingID, true);
        setAttribute(h, "custom-comment-heading", "1");
        builder.append(h);
        builder.append(...newDivs);

        newDivs.forEach((div) => {
            setAttribute(div, "fold", "1");
            setAttribute(div, "heading-fold", "1");
        });

        const { id: docID } = await createDailyNoteTask;
        const tail = await siyuan.getDocLastID(docID);
        ops.push(
            ...siyuan.transInsertBlocksAfter([builder.build().outerHTML], tail),
        );
        await siyuan.transactions(ops);

        if (commentBoxAddFlashCard.get()) {
            siyuan.addRiffCards([builder.id]);
        }

        if (
            commentBoxAddUnderline.get() &&
            (await ro) != "true" &&
            newDivs.length == 1
        ) {
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

        setTimeouts(
            () => {
                newDivs.forEach((div) => {
                    document
                        .querySelectorAll(
                            `div[data-node-id="${getAttribute(div, "data-node-id")}"]`,
                        )
                        .forEach((e) => {
                            e?.parentElement?.removeChild(e);
                        });
                });
            },
            500,
            2000,
            800,
        );
    }
</script>

<div class="container">
    <div>
        <label>
            <input
                type="checkbox"
                class="b3-switch box"
                bind:checked={$commentBoxAddFlashCard}
                on:change={() => commentBoxAddFlashCard.write()}
            />
            {tomatoI18n.加入闪卡}
        </label>
        <label>
            <input
                type="checkbox"
                class="b3-switch box"
                bind:checked={$commentBoxAddTime}
                on:change={() => commentBoxAddTime.write()}
            />
            {tomatoI18n.加入时间}
        </label>
    </div>
    <textarea
        bind:this={textField}
        spellcheck="false"
        class="b3-text-field box"
        bind:value={text}
    />
    <button
        bind:this={btn}
        class="b3-button box"
        on:click={() => {
            saveComment();
            destroy();
        }}>{tomatoI18n.保存}</button
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
