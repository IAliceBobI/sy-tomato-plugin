<script lang="ts">
    import { confirm, Dock, IProtyle, Protyle } from "siyuan";
    import { onMount } from "svelte";
    import { commentBox, CommentBox刷新文档正引 } from "./CommentBox";
    import {
        deleteBlock,
        getAttribute,
        getCursorElement,
        getSyElement,
        isStringNumber,
        parseIAL,
        removeAttribute,
        removeInvisibleChars,
        siyuan,
        strIncludeAttr,
        uniqueFilter,
    } from "./libs/utils";
    import { closeProtyle, createProtyle } from "./libs/bkUtils";
    import { BlockNodeEnum, SPACE, TOMATO_BK_IGNORE } from "./libs/gconst";
    import {
        commentBoxBackwardRef,
        commentBoxForwardRef,
        commentBoxMaxProtyleHeight,
        commentBoxShowID,
        commentBoxStaticOutlink,
        commentBoxVirtualRef,
    } from "./libs/stores";
    import { tomatoI18n } from "./tomatoI18n";
    import {
        getDocBlocks,
        getDocTracer,
        isReadonly,
        OpenSyFile2,
    } from "./libs/docUtils";
    import { findElementByAttr } from "./libs/listUtils";
    import { zipNways } from "./libs/functional";
    import { events } from "./libs/Events";
    import { lastVerifyResult } from "./libs/user";
    import { getGlobal, setGlobal, sleep } from "stonev5-utils";
    export function destroy() {}

    interface Props {
        dock: Dock;
        isDock?: boolean;
    }

    let { dock, isDock = true }: Props = $props();
    let backLinks: BacklinkSv<Protyle>[] = $state([]);
    let refs: Ref[] = $state([]);
    let stop = false;
    let currentID: string = $state();
    let docID: string = $state();
    let notebookId: string = $state();
    let listID: string = $state();
    let superID: string = $state();
    let quoteID: string = $state();

    const IDPREFIX = "dNMTNxcqNbWsyJoxSzqvfbnplk";
    function getButtonID(backLink: BacklinkSv<Protyle>) {
        return `${IDPREFIX}-${backLink.blockID}-button`;
    }
    function getProtyleID(backLink: BacklinkSv<Protyle>) {
        return `${IDPREFIX}-${backLink.blockID}-protyle`;
    }

    function onCommentBoxMaxProtyleHeightChange() {
        for (const b of backLinks) {
            if (b.protyle?.protyle?.element) {
                b.protyle.protyle.element.style.maxHeight =
                    $commentBoxMaxProtyleHeight + "px";
            }
        }
        document.querySelectorAll(".docContent").forEach((e: HTMLElement) => {
            e.style.maxHeight = $commentBoxMaxProtyleHeight + "px";
        });
    }

    onMount(() => {
        updateStop();
        if (isDock) {
            commentBox.svelteCallback = svelteCallback;
            commentBox.svelteResize = updateStop;
            return () => {
                commentBox.svelteCallback = null;
                commentBox.svelteResize = null;
                release();
            };
        } else {
            commentBox.svelteCallbackTab = svelteCallback;
            commentBox.svelteResizeTab = updateStop;
            return () => {
                commentBox.svelteCallbackTab = null;
                commentBox.svelteResizeTab = null;
                release();
            };
        }
    });

    function release() {
        closeProtyle(...backLinks);
        backLinks = [];
    }

    function updateStop() {
        stop = dock.element.clientWidth < 10 || dock.element.clientHeight < 10;
        if (stop) release();
    }

    function svelteCallback(protyle: IProtyle, force = false) {
        if (stop) return;
        navigator.locks.request(
            "comment svelte 2024-12-19 23:29:21",
            async (lock) => {
                if (lock) {
                    if (stop) return;
                    return _svelteCallback(protyle, force);
                }
            },
        );
    }

    async function _svelteCallback(protyle: IProtyle, force = false) {
        if (getAttribute(protyle.element, TOMATO_BK_IGNORE)) return;
        // if (!(await verifyKeyTomato())) {
        //     if ($commentBoxStaticOutlink) commentBoxStaticOutlink.write(false);
        // }

        if ($commentBoxStaticOutlink) {
            const i = events.getInfo(protyle);
            docID = i.docID;
            return _svelteCallback_doc_lock(force);
        } else {
            return _svelteCallback_block(protyle);
        }
    }

    async function _svelteCallback_doc_lock(force = false) {
        if (force) {
            siyuan.pushMsg(tomatoI18n.刷新);
            _svelteCallback_doc();
        } else {
            navigator.locks.request(
                "_svelteCallback_doc_lock 2025-06-22 11:08:03",
                { ifAvailable: true },
                async (lock) => {
                    if (lock) {
                        await _svelteCallback_doc();
                        await sleep(10 * 1000);
                    }
                },
            );
        }
    }

    async function _svelteCallback_doc() {
        const { div } = await getDocBlocks(docID, "", false, true, 1);
        let idContents: Ref[] = [
            ...div.querySelectorAll(`span[data-type="block-ref"][data-id]`),
        ]
            .reverse()
            .filter(uniqueFilter((span) => getAttribute(span, "data-id")))
            .map((span) => {
                const def_block_id = getAttribute(
                    getSyElement(span),
                    "data-node-id",
                );
                const def_block_root_id = getAttribute(span, "data-id");
                const content = span.textContent;
                return { def_block_root_id, content, def_block_id };
            });
        const rows = await siyuan.getRows(
            idContents.map((i) => i.def_block_root_id),
            "id",
            true,
            ["type='d'"],
            true,
        );
        idContents = zipNways(idContents, rows)
            .filter(([a, b]) => !!a && !!b)
            .map((a) => a[0]);
        await Promise.all(
            idContents.map((ref) =>
                siyuan
                    .copyStdMarkdownWithoutTitle(ref.def_block_root_id)
                    .then((c) => {
                        ref.docContent = removeInvisibleChars(c, true);
                    }),
            ),
        );
        refs = idContents;
    }

    async function removeUnderlines(e: HTMLElement, protyle: IProtyle) {
        const ro = await isReadonly(protyle);
        if (ro == "true") return;
        const id = getAttribute(e, "data-node-id");
        if (getAttribute(e, "custom-tomato-key-comment")) {
            removeAttribute(e, "custom-tomato-key-comment");
            e.querySelectorAll(`span[data-type="text"]`).forEach((e) => {
                const el = e as HTMLElement;
                const str = el.style?.backgroundColor as string;
                const k = "var(--b3-font-background-tomato-key-comment)";
                if (str.includes(k)) {
                    el.style.backgroundColor = "";
                    removeAttribute(el, "data-type");
                }
            });
            await siyuan.updateBlocks([{ id, domStr: e.outerHTML }]);
        }
        if (getAttribute(e, "custom-tomato-comment")) {
            await siyuan.setBlockAttrs(id, {
                "custom-tomato-comment": "",
            });
        }
        removeAttribute(e, "data-inline-comment");
    }

    async function _svelteCallback_block(protyle: IProtyle) {
        const e = getCursorElement();
        if (!e) return;
        const id = getAttribute(e, "data-node-id");
        currentID = id;
        docID = protyle.block.rootID;
        notebookId = protyle.notebookId;

        if ($commentBoxShowID) {
            const e = document.querySelector(
                `div[data-node-id="${currentID}"]`,
            );

            const { id: listID1 } = findElementByAttr(e as any, {
                "data-type": BlockNodeEnum.NODE_LIST,
            });
            listID = listID1;

            const { id: super1 } = findElementByAttr(e as any, {
                "data-type": BlockNodeEnum.NODE_SUPER_BLOCK,
            });
            superID = super1;

            const { id: quo } = findElementByAttr(e as any, {
                "data-type": BlockNodeEnum.NODE_BLOCKQUOTE,
            });
            quoteID = quo;
        }

        const map = new Map<string, Block>();
        const tasks = [];
        const S = "id,type,sort,parent_id,root_id,ial,content";
        // 虚引
        if ($commentBoxVirtualRef) {
            (await getDocTracer()).match(e.textContent).forEach((b) => {
                const cleanTitle = b?.content
                    ?.replaceAll(" ", "")
                    .replaceAll("-", "")
                    .replaceAll(":", "");
                if (cleanTitle) {
                    if (!isStringNumber(cleanTitle)) {
                        b.data = tomatoI18n.虚引;
                        map.set(b.id, b);
                    }
                }
            });
        }
        // 正引
        if ($commentBoxForwardRef) {
            tasks.push(
                siyuan
                    .sql(
                        `select ${S} from blocks where id in (SELECT def_block_id FROM refs WHERE block_id = "${id}")`,
                    )
                    .then((rows) => {
                        for (const row of rows) {
                            row.data = tomatoI18n.正引;
                            map.set(row.id, row);
                        }
                    }),
            );
        }
        // 反引
        if ($commentBoxBackwardRef) {
            tasks.push(
                siyuan
                    .sql(
                        `SELECT ${S} FROM blocks WHERE type='p' and id IN (SELECT block_id FROM refs WHERE def_block_id = "${id}")`,
                    )
                    .then(async (refL1) => {
                        // refL1 不能直接用，需要再向上找父块。
                        if (!(refL1?.length > 0)) {
                            // 如果没有反引，删除下划线
                            await removeUnderlines(e, protyle);
                            return;
                        }
                        for (const l1 of refL1) l1.attrs = parseIAL(l1.ial);

                        const commentBKs = await siyuan
                            .sql(
                                `select ${S} from blocks where id in (${refL1
                                    .filter(
                                        (i) => i.attrs["custom-comment-bk-id"],
                                    )
                                    .map(
                                        (i) =>
                                            `"${i.attrs["custom-comment-bk-id"]}"`,
                                    )
                                    .join(",")})`,
                            )
                            .then((commentBKs) => {
                                commentBKs.forEach((b) => {
                                    b.data = tomatoI18n.反引;
                                    map.set(b.id, b);
                                });
                                return commentBKs;
                            });

                        // refL1 中删除失效的 custom-comment-bk-id
                        for (const l1 of refL1) {
                            const bkid = l1.attrs["custom-comment-bk-id"];
                            if (commentBKs.find((c) => c.id == bkid) == null) {
                                l1.attrs["custom-comment-bk-id"] = null;
                                l1.attrs["custom-comment-bk-id"] = null;
                            }
                        }

                        refL1 = refL1.filter(
                            (i) => !i.attrs["custom-comment-bk-id"],
                        );
                        await siyuan
                            .sql(
                                `select ${S} from blocks where id in (${refL1
                                    .map((i) => `"${i.parent_id}"`)
                                    .join(",")})`,
                            )
                            .then(async (refL2) => {
                                for (const l1 of refL1) {
                                    const l2 = refL2.find(
                                        (l2) => l2.id == l1.parent_id,
                                    );
                                    if (l2) {
                                        l1.parent = l2;
                                    }
                                }
                            });

                        for (const l1 of refL1) {
                            if (l1.parent) {
                                if (
                                    l1.parent.type != "d" &&
                                    l1.parent.type != "h"
                                ) {
                                    l1.parent.data = tomatoI18n.反引;
                                    map.set(l1.parent.id, l1.parent);
                                    continue;
                                }
                            }
                            l1.data = tomatoI18n.反引;
                            map.set(l1.id, l1);
                        }
                    }),
            );
        }

        await Promise.all(tasks);
        const bks = [...map.values()]
            .sort((a, b) => b.sort - a.sort)
            .map((row) => {
                let pob: ReturnType<typeof createProtyle> = {} as any;
                const bk = backLinks.find((b) => b.blockID === row.id);
                if (bk) {
                    // move ob and protyle to new bks
                    pob.ob = bk.ob;
                    bk.ob = null;
                    pob.p = bk.protyle;
                    bk.protyle = null;
                } else {
                    pob = createProtyle(row.id, commentBox.plugin, {
                        // create new ob and protyle
                        title: false,
                        breadcrumb: true,
                        breadcrumbDocName: true,
                    });
                    pob.p.protyle.element.style.maxHeight =
                        $commentBoxMaxProtyleHeight + "px"; // set height
                }
                return {
                    blockID: row.id,
                    protyle: pob.p,
                    ob: pob.ob,
                    row,
                } as BacklinkSv<Protyle>;
            });

        closeProtyle(...backLinks);

        const rows = await siyuan.getRows(
            bks.map((bk) => bk.blockID),
            "ial",
            true,
            [],
            true,
        );

        for (const [r, bk] of zipNways(rows, bks)) {
            if (r?.ial) bk.row.ial = r.ial;
            if (bk.isFold == null) {
                bk.isFold = strIncludeAttr(bk.row.ial, "custom-comment-fold");
            }
        }
        backLinks = sortByFold(bks);
    }

    function sortByFold(backLinks: BacklinkSv<Protyle>[]) {
        backLinks.sort((a, b) => {
            const aa = a.isFold === true ? 1 : 0;
            const bb = b.isFold === true ? 1 : 0;
            return aa - bb;
        });
        return backLinks;
    }

    function doFold(btn: HTMLElement, div: HTMLElement) {
        div.style.display = "none";
        btn.textContent = "⬆️";
    }

    function doUnFold(btn: HTMLElement, div: HTMLElement) {
        div.style.display = "";
        btn.textContent = "⬇️";
    }

    function renderDocContent(ref: Ref) {
        return (node: HTMLElement) => {
            node.style.maxHeight = $commentBoxMaxProtyleHeight + "px";
            node.innerHTML = ref.docContent.replaceAll("\n\n", "\n");
            node.style.fontSize = "large";
        };
    }

    function mountProtyle(backLink: BacklinkSv<Protyle>) {
        return (node: HTMLElement) => {
            node.style.minHeight = "auto";
            node.appendChild(backLink.protyle.protyle.element);

            const protyleDiv = document.getElementById(getProtyleID(backLink));
            const btn = document.getElementById(getButtonID(backLink));

            if (backLink.isFold === true) {
                doFold(btn, protyleDiv);
            } else {
                doUnFold(btn, protyleDiv);
            }
        };
    }

    function toggle(backLink: BacklinkSv<Protyle>) {
        const protyleDiv = document.getElementById(getProtyleID(backLink));
        const btn = document.getElementById(getButtonID(backLink));
        if (backLink.isFold) {
            backLink.isFold = false;
            // 展开
            doUnFold(btn, protyleDiv);
            siyuan.setBlockAttrs(backLink.blockID, {
                "custom-comment-fold": "",
            });
        } else {
            backLink.isFold = true;
            // 折叠
            doFold(btn, protyleDiv);
            siyuan.setBlockAttrs(backLink.blockID, {
                "custom-comment-fold": "1",
            });
        }
    }

    function deleteRef(backLink: BacklinkSv<Protyle>) {
        confirm(
            tomatoI18n.删除,
            backLink.row?.content?.slice(0, 100) ?? "",
            () => {
                deleteBlock(backLink.blockID);
            },
        );
    }

    function locate(blockID: string) {
        OpenSyFile2(commentBox.plugin, blockID);
    }

    function copyRef(backLink: BacklinkSv<Protyle>) {
        navigator.clipboard
            .writeText(`((${backLink.blockID} '${backLink?.row?.content}'))`)
            .then(() => {
                siyuan.pushMsg("copied: " + backLink?.row?.content, 1000);
            });
    }

    function copyText(txt: string) {
        navigator.clipboard.writeText(txt);
        siyuan.pushMsg("copied: " + txt);
        for (const i of document.querySelectorAll(`[data-node-id="${txt}"]`)) {
            console.info(i);
        }
    }
</script>

<div class="tomatoflexCol">
    <div>
        <label class="checkboxMargin" title={tomatoI18n.文档正引说明}>
            {tomatoI18n.文档}
            <input
                type="checkbox"
                class="b3-switch"
                bind:checked={$commentBoxStaticOutlink}
                onchange={() => commentBoxStaticOutlink.write()}
            />
        </label>
        {#if $commentBoxStaticOutlink}
            <button
                title={tomatoI18n.刷新文档正引 +
                    SPACE +
                    CommentBox刷新文档正引.w()}
                class="b3-button b3-button--text box font"
                onclick={async () => {
                    await _svelteCallback_doc_lock(true);
                }}>🔄{CommentBox刷新文档正引.w()}</button
            >
        {/if}
        {#if !$commentBoxStaticOutlink}
            <label class="checkboxMargin" title={tomatoI18n.正引}>
                {tomatoI18n.正引}
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$commentBoxForwardRef}
                    onchange={() => commentBoxForwardRef.write()}
                />
            </label>
            <label class="checkboxMargin" title={tomatoI18n.反引}>
                {tomatoI18n.反引}
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$commentBoxBackwardRef}
                    onchange={() => commentBoxBackwardRef.write()}
                />
            </label>
            <label class="checkboxMargin" title={tomatoI18n.虚引}>
                {tomatoI18n.虚引}
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$commentBoxVirtualRef}
                    onchange={() => commentBoxVirtualRef.write()}
                />
            </label>
        {/if}
        <label class="checkboxMargin" title={tomatoI18n.高度}>
            <input
                class="b3-text-field numInput"
                bind:value={$commentBoxMaxProtyleHeight}
                oninput={() => {
                    commentBoxMaxProtyleHeight.write();
                    onCommentBoxMaxProtyleHeightChange();
                }}
            />
        </label>
    </div>

    {#if $commentBoxShowID}
        <div class:hide={!notebookId}>
            <button
                class="b3-button b3-button--text box font"
                onclick={() => copyText(notebookId)}>Box: {notebookId}</button
            >
        </div>
        <div class:hide={!docID}>
            <button
                class="b3-button b3-button--text box font"
                onclick={() => copyText(docID)}>Doc: {docID}</button
            >
        </div>

        <div class:hide={!listID}>
            <button
                class="b3-button b3-button--text box font"
                onclick={() => copyText(listID)}>List: {listID}</button
            >
        </div>
        <div class:hide={!superID}>
            <button
                class="b3-button b3-button--text box font"
                onclick={() => copyText(superID)}>Super: {superID}</button
            >
        </div>
        <div class:hide={!quoteID}>
            <button
                class="b3-button b3-button--text box font"
                onclick={() => copyText(quoteID)}>Quote: {quoteID}</button
            >
        </div>
        <div class:hide={!currentID}>
            <button
                class="b3-button b3-button--text box font"
                onclick={() => copyText(currentID)}>Block: {currentID}</button
            >
        </div>
    {/if}

    {#if $commentBoxStaticOutlink}
        <div class="column">
            {#each refs as ref, index (ref.def_block_root_id)}
                <div class="box">
                    <span style="display: none;">{index}</span>
                    <div>
                        <div>
                            <button
                                title={`${tomatoI18n.vip功能}: ${tomatoI18n.在当前文档中定位}`}
                                class="b3-button b3-button--text horMargin"
                                onclick={() => {
                                    if (lastVerifyResult()) {
                                        locate(ref.def_block_id);
                                    } else {
                                        const key =
                                            "tomato comment locate limit 2025-06-22 10:41:02";
                                        const count =
                                            parseInt(getGlobal(key)) || 0;
                                        setGlobal(key, (count + 1).toString());
                                        if (count < 3) {
                                            locate(ref.def_block_id);
                                        } else {
                                            siyuan.pushMsg(
                                                `${tomatoI18n.vip功能}: ${tomatoI18n.在当前文档中定位}`,
                                            );
                                        }
                                    }
                                }}
                                >🎯
                            </button>
                            <button
                                title={tomatoI18n.定位 + SPACE + ref.content}
                                class="b3-button b3-button--text horMargin"
                                onclick={() => locate(ref.def_block_root_id)}
                                >🔍 {ref.content?.slice(0, 10)}</button
                            >
                        </div>
                        <div
                            class="docContent"
                            {@attach renderDocContent(ref)}
                        ></div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div class="column">
            {#each backLinks as backLink, index (backLink.blockID)}
                <div class="box">
                    <span style="display: none;">{index}</span>
                    <div>
                        <div>
                            <button
                                title={tomatoI18n.定位 +
                                    SPACE +
                                    backLink.row?.content}
                                class="b3-button b3-button--text horMargin"
                                onclick={() => locate(backLink.blockID)}
                                >🔍 {backLink.row?.content?.slice(0, 10) ??
                                    tomatoI18n.定位}</button
                            >
                            <!-- svelte-ignore a11y_consider_explicit_label -->
                            <button
                                title={backLink.row.data +
                                    SPACE +
                                    tomatoI18n.展开与折叠}
                                id={getButtonID(backLink)}
                                class="b3-button b3-button--text horMargin"
                                onclick={() => toggle(backLink)}
                            ></button>
                            <button
                                title={tomatoI18n.复制为引用}
                                class="b3-button b3-button--text horMargin"
                                onclick={() => copyRef(backLink)}>📋</button
                            >
                            <button
                                title={tomatoI18n.删除}
                                class="b3-button b3-button--text horMargin"
                                onclick={() => deleteRef(backLink)}>🗑️</button
                            >
                        </div>
                        <div
                            id={getProtyleID(backLink)}
                            {@attach mountProtyle(backLink)}
                        ></div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .column {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    }
    .font {
        font-size: x-large;
    }
    .hide {
        display: none;
    }
    .horMargin {
        margin-right: 10px;
    }
    .box {
        padding: 5px;
        border: 1px solid var(--b3-font-background5);
        border-radius: 5px;
        margin: 5px 0;
    }
    .checkboxMargin {
        margin: 5px;
    }
    .tomatoflexCol {
        margin: 5px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .numInput {
        width: 60px;
    }
    .docContent {
        white-space: pre-wrap; /* 允许自动换行 */
        user-select: text; /* 允许选中文本 */
        overflow: auto;
        min-height: 10px;
    }
</style>
