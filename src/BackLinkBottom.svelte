<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import {
        NewLute,
        NewNodeID,
        Siyuan,
        add_href,
        attrNewLine,
        cleanDivOnly,
        getAllContentEditableText,
        getBlockDiv,
        getDocLastElement,
        htmlUnescape,
        icon,
        isValidNumber,
        removeRefs,
        set_href,
        siyuan,
        sleep,
    } from "./libs/utils";
    import {
        getConceptTrees,
        sortDiv,
        doGetBackLinks,
        insertConcepts,
        createProtyle,
        closeProtyle,
    } from "./libs/bkUtils";
    import { Dialog, Protyle } from "siyuan";
    import { BlockNodeEnum, DATA_ID, DATA_NODE_ID } from "./libs/gconst";
    import { BKMaker, showBkConTree } from "./BackLinkBottomBox";
    import { SearchEngine } from "./libs/search";
    import { events } from "./libs/Events";
    import { domBlankLine, domLnk, domNewLine } from "./libs/sydom";
    import { OpenSyFile2 } from "./libs/docUtils";
    import BackLinkBottomAutoRefresh from "./BackLinkBottomAutoRefresh.svelte";
    import BackLinkBottomOnceRefresh from "./BackLinkBottomOnceRefresh.svelte";
    import { writable } from "svelte/store";
    import {
        back_link_concept_fold,
        back_link_copy,
        back_link_embed,
        back_link_max_size,
        back_link_mention_count,
        back_link_more_btns,
        back_link_move_here,
        back_link_move_to_dailynote,
        back_link_move_with_backlink,
        back_link_ref,
        back_link_remove_refs,
        back_link_refresh_off,
        storeAttrManager,
        storeNoteBox_selectedNotebook,
        back_link_protyle_height,
        back_link_show_path,
    } from "./libs/stores";
    import { tomatoI18n } from "./tomatoI18n";
    import { isSortType, SortType } from "./libs/types";
    import { DestroyManager } from "./libs/destroyer";
    import { isMe } from "./libs/user";

    type SavedQuery = { global: string; local: string };
    const QUERYABLE_ELEMENT = "QUERYABLE_ELEMENT";
    const ICONS_SIZE = 12;
    const queryableElementAttr = {};
    const lute = NewLute();

    export let maker: BKMaker;
    export let protyle: Protyle;
    export let attrs: AttrType;
    export let dm: DestroyManager;

    let autoRefreshChecked = writable(!maker.shouldFreeze);
    let maxPage = 1;
    let backLinks: BacklinkSv<Protyle>[] = [];
    let hierarchyConcepts: Block[] = [];
    let linkItems: LinkItem[] = [];
    let linkItemsHierarchy: LinkItem[] = [];
    let block2lnks: Map<string, Set<LinkItem>> = new Map();
    let searchText = "";
    let globalSearchText = "";
    let searchFieldEle: HTMLInputElement;
    let keepHeight: HTMLElement;
    let modeSwitchBtn: HTMLButtonElement;
    let hideThis = false;
    let expandStatus = true;
    let divBorderColor: string;
    let page = 0;
    let searchList: SavedQuery[] = [];
    const BACKLINKBOTTOMID = "backLinkBottomStyle2024831185229";
    $: {
        maker.shouldFreeze = !$autoRefreshChecked;
        if ($autoRefreshChecked) {
            divBorderColor = "rgba(225, 7, 185, 0.05)";
        } else {
            divBorderColor = "";
        }
    }
    $: if ($back_link_more_btns) {
        if (modeSwitchBtn) modeSwitchBtn.textContent = "🍀";
        const e = document.getElementById(BACKLINKBOTTOMID);
        e?.parentElement?.removeChild(e);
    }
    $: if (!$back_link_more_btns) {
        if (modeSwitchBtn) modeSwitchBtn.textContent = "🛠️";
        const e = document.getElementById(BACKLINKBOTTOMID);
        if (!e) {
            let style = document.createElement("style");
            style.id = BACKLINKBOTTOMID;
            style.innerText = `
                [modeHide] {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    $: {
        for (const b of backLinks) {
            if (b.protyle?.protyle?.element) {
                b.protyle.protyle.element.style.maxHeight =
                    $back_link_protyle_height + "px";
            }
        }
    }
    let refDocCount: number = 0;
    let menDocCount: number = 0;

    let protyleDivWidth: string;
    let colCount: string;
    let sortBy = SortType.UpdatedDESC;
    let bkWidth: number;
    const modeHide = { modeHide: "1" };
    $: {
        if (bkWidth < 900 || Number(colCount) == 1) {
            protyleDivWidth = "100%";
        } else if (Number(colCount) > 1) {
            protyleDivWidth = `calc(100% / ${Number(colCount)} - 5 * 5px)`;
        } else {
            let start = 900;
            let count = 2;
            let max = 30;
            while (max-- > 0) {
                if (bkWidth >= start && bkWidth < start + 400) {
                    protyleDivWidth = `calc(100% / ${count} - 5 * 5px)`;
                    break;
                }
                start += 400;
                count++;
            }
        }
    }
    const idsFilter = storeAttrManager();
    onDestroy(() => {});

    $: if (refDocCount < 0) refDocCount = 0;
    $: if (menDocCount < 0) menDocCount = 0;

    function paddingBottom(p = true) {
        if (keepHeight?.style != null) {
            if (p) keepHeight.style.height = "2000px";
            else keepHeight.style.height = "200px";
        }
    }

    onMount(() => {
        // console.time("onMount:" + maker.docName);
        paddingBottom();

        colCount = attrs["custom-bkColCount"] ?? "";
        sortBy = attrs["custom-bkSortBy"] as SortType;
        if (!isSortType(sortBy)) sortBy = SortType.UpdatedDESC;

        refDocCount = Number(attrs["custom-bkRefDocCount"]);
        if (!isValidNumber(refDocCount)) refDocCount = $back_link_max_size;

        menDocCount = Number(attrs["custom-bkMenDocCount"]);
        if (!isValidNumber(menDocCount)) menDocCount = $back_link_mention_count;

        queryableElementAttr[QUERYABLE_ELEMENT] = "1";

        if (events.isMobile) {
            protyleDivWidth = "100%";
        }

        (async () => {
            maker.refreshBK = async () => getBackLinks({ ifAvailable: true });
            await idsFilter
                .loadList(maker.docID, "custom-bkDisabledIDs")
                .then(() => getBackLinks({ mode: "exclusive" }, ON_LOAD));
            // idsFilter.syIDClean(); 先不用了，防止与手机同步时冲突。

            if ($back_link_refresh_off) {
                $autoRefreshChecked = false;
            }

            if ($back_link_concept_fold) {
                expand();
            }
            paddingBottom(false);

            if (attrs["custom-bkSavedQueries"]) {
                try {
                    searchList = JSON.parse(attrs["custom-bkSavedQueries"]);
                } catch (e) {}
            }
        })();
        // console.timeEnd("onMount:" + maker.docName);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === "style") {
                    protyle.protyle.wysiwyg.element.style.paddingBottom = "0px";
                }
            });
        });
        observer.observe(protyle.protyle.wysiwyg.element, {
            attributes: true,
            childList: false,
            characterData: false,
        });
        protyle.protyle.wysiwyg.element.style.paddingBottom = "0px";

        dm.add("svelte clean", () => {
            closeProtyle(...backLinks);
            observer.disconnect();
        });

        return () => {
            dm.destroyBy("from svelte");
        };
    });

    const REFRESH = "refresh";
    const ON_LOAD = "on load";
    const ON_PAGE = "on page";
    async function getBackLinks(
        lockOpt: LockOptions = { ifAvailable: true },
        caller = "",
    ) {
        return navigator.locks.request(
            "2024-9-11 12:00:53 bkrefresh",
            lockOpt,
            async (lock) => {
                if (lock) {
                    if (backLinks.length > 0 && caller === ON_LOAD) {
                        return;
                    }

                    let start = 0;
                    if (caller && caller !== ON_LOAD) {
                        start = new Date().getTime();
                    }
                    const {
                        linkItems: a,
                        backLinks: b,
                        block2lnks: bl,
                        hierarchyConcepts: h,
                        linkItemsHierarchy: hi,
                        maxPage: mp,
                    } = await doGetBackLinks(
                        maker.docID,
                        globalSearchText,
                        sortBy,
                        refDocCount,
                        menDocCount,
                        maker.docName,
                        idsFilter,
                        page,
                    );
                    linkItems = a;
                    linkItemsHierarchy = hi;
                    if (caller == REFRESH) {
                        closeProtyle(...backLinks);
                        paddingBottom();
                        setTimeout(() => {
                            paddingBottom(false);
                        }, 3000);
                    } else if (caller == ON_PAGE) {
                        closeProtyle(...backLinks);
                        paddingBottom();
                    } else {
                        moveProtyle(backLinks, b);
                    }
                    backLinks = b;
                    block2lnks = bl;
                    maxPage = mp;
                    hierarchyConcepts = h;
                    if (start > 0) {
                        const end = new Date().getTime();
                        siyuan.pushMsg(
                            `${caller} ${tomatoI18n.立即刷新}: ${(end - start) / 1000.0}s`,
                            2000,
                        );
                    }
                } else if (caller !== ON_LOAD) {
                    if (isMe()) {
                        siyuan.pushMsg(
                            `${caller} ${tomatoI18n.立即刷新}: in progress`,
                            2000,
                        );
                    }
                }
            },
        );
    }

    function moveProtyle(
        olds: BacklinkSv<Protyle>[],
        news: BacklinkSv<Protyle>[],
    ) {
        for (const o of olds) {
            const n = news.find((n) => n.blockID == o.blockID);
            if (n) {
                n.protyle = o.protyle;
                n.ob = o.ob;
                o.protyle = null;
                o.ob = null;
            }
        }
        closeProtyle(...olds);
    }

    function refreshNow() {
        $autoRefreshChecked = false;
        getBackLinks({ ifAvailable: true }, REFRESH);
    }
    function refreshOnPage() {
        $autoRefreshChecked = false;
        getBackLinks({ ifAvailable: true }, ON_PAGE);
    }

    function priSort(atBottom: boolean, bk: BacklinkSv) {
        bk.atBottom = atBottom;
        backLinks.sort(sortDiv);
        backLinks = backLinks;
    }

    // protyle
    function mountProtyle(node: HTMLElement, backLink: BacklinkSv<Protyle>) {
        node.style.minHeight = "auto";
        node.addEventListener("click", () => {
            $autoRefreshChecked = false;
        });
        if (backLink.protyle == null && backLink.ob == null) {
            let id = backLink.blockID;
            if (backLink.parentID) id = backLink.parentID;
            const pob = createProtyle(id, maker.plugin);
            backLink.ob = pob.ob;
            backLink.protyle = pob.p;
            backLink.protyle.protyle.element.style.maxHeight =
                $back_link_protyle_height + "px"; // set height
        }
        node.appendChild(backLink.protyle.protyle.element);
    }

    async function search() {
        if (searchFieldEle) {
            const calced = (Math.max(searchText.length, 20) + 10) * 8;
            searchFieldEle.style.width = calced + "px";
        }
        if (!searchText.trim()) {
            maker.container
                .querySelectorAll(`[${QUERYABLE_ELEMENT}]`)
                .forEach((e: HTMLElement) => {
                    e.style.display = "";
                });
        } else {
            const se = new SearchEngine(true);
            se.setQuery(searchText);
            maker.container
                .querySelectorAll(`[${QUERYABLE_ELEMENT}]`)
                .forEach((e: HTMLElement) => {
                    const m = se.match(e.textContent);
                    if (!m) {
                        e.style.display = "none";
                    } else {
                        e.style.display = "";
                    }
                });
        }
        go2Top();
    }

    function refClick(id: string) {
        OpenSyFile2(maker.plugin, id);
    }

    function refConceptClick(event: Event, txt: string, id: string) {
        if (event instanceof PointerEvent && txt) {
            txt = txt.split(" ").pop();
            if (event.shiftKey && event.altKey) {
                // or logic
                if (searchText) {
                    searchText += "|" + txt;
                } else {
                    searchText = txt;
                }
            } else if (event.shiftKey) {
                // exclude logic
                if (searchText) {
                    searchText += "  !" + txt;
                } else {
                    searchText = "!" + txt;
                }
            } else if (event.altKey) {
                // reselect
                if (txt == searchText) {
                    searchText = "";
                } else {
                    searchText = txt;
                }
            } else if (event.ctrlKey) {
                // and logic
                if (searchText) {
                    searchText += "  " + txt;
                } else {
                    searchText = txt;
                }
            } else {
                OpenSyFile2(maker.plugin, id);
            }
        }
    }

    async function ref2doc(backLink: BacklinkSv) {
        let id = backLink.blockID;
        if (backLink.parentID) id = backLink.parentID;
        const div = (await getBlockDiv(id)).div;
        const txt = getAllContentEditableText(div);
        if (id && txt) {
            await siyuan.appendBlock(
                `((${id} '${txt}'))\n${attrNewLine()}\n${attrNewLine()}`,
                maker.docID,
            );
            await siyuan.pushMsg(tomatoI18n.createdRef创建引用成功, 2000);
            return id;
        }
    }

    async function embed2doc(backLink: BacklinkSv) {
        let id = backLink.blockID;
        if (backLink.parentID) id = backLink.parentID;
        if (id) {
            await siyuan.appendBlock(
                `{{select * from blocks where id="${id}"}}\n${attrNewLine()}\n${attrNewLine()}`,
                maker.docID,
            );
            await siyuan.pushMsg(tomatoI18n.createdEmb创建嵌入块成功, 2000);
            return id;
        }
    }

    async function move2dailynote(backLink: BacklinkSv) {
        let id = backLink.blockID;
        if (backLink.parentID) id = backLink.parentID;
        if (id) {
            let boxID = storeNoteBox_selectedNotebook.getOr();
            if (!boxID) boxID = events.boxID;
            const { id: docID } = await siyuan.createDailyNote(boxID);
            if (docID) {
                const last = await siyuan.getDocLastID(docID);
                const ops = siyuan.transMoveBlocksAfter([id], last);
                ops.push(
                    ...siyuan.transInsertBlocksAfter(
                        [domNewLine().outerHTML],
                        id,
                    ),
                );
                await siyuan.transactions(ops);
            }
        }
    }

    async function copy2doc(backLink: BacklinkSv) {
        let targetID = backLink.blockID;
        if (backLink.parentID) targetID = backLink.parentID;
        const div = (await getBlockDiv(targetID)).div;
        const { id } = cleanDivOnly(div as any);
        add_href(div, id, " * ");
        const md = lute.BlockDOM2Md(div.outerHTML);
        await siyuan.appendBlock(`${md}\n${attrNewLine()}`, maker.docID);
        await siyuan.pushMsg(tomatoI18n.copyBlock复制块成功, 2000);
        return id;
    }

    async function move2doc(backLink: BacklinkSv) {
        let targetID = backLink.blockID;
        if (backLink.parentID) targetID = backLink.parentID;
        const div = (await getBlockDiv(targetID)).div;
        const txt = getAllContentEditableText(div);
        const id = div.getAttribute(DATA_NODE_ID);
        if (id && txt) {
            const lastID = (
                await siyuan.getTailChildBlocks(maker.docID, 1)
            )?.pop()?.id;
            if (lastID) {
                const lnkID = NewNodeID();
                const ops: IOperation[] = [];
                if ($back_link_move_with_backlink) {
                    ops.push(
                        ...siyuan.transInsertBlocksAfter(
                            [domLnk(lnkID, id, txt)],
                            id,
                        ),
                    );
                }
                ops.push(
                    ...siyuan.transInsertBlocksAfter([domBlankLine()], lastID),
                );
                ops.push(...siyuan.transMoveBlocksAfter([id], lastID));
                if ($back_link_move_with_backlink) {
                    add_href(div, lnkID, "*");
                    div.querySelectorAll(
                        `span[${DATA_ID}="${maker.docID}"]`,
                    ).forEach((e: HTMLElement) => {
                        e.removeAttribute(DATA_ID);
                        set_href(e, maker.docID);
                    });
                    ops.push(
                        ...siyuan.transUpdateBlocks([
                            { id, domStr: div.outerHTML },
                        ]),
                    );
                }
                ops.push(siyuan.transDoUpdateUpdated(id));
                await siyuan.transactions(ops);
                await OpenSyFile2(maker.plugin, id);
                await siyuan.pushMsg(tomatoI18n.movedBlock移动块成功, 2000);
            }
        }
    }

    function expand() {
        expandStatus = !expandStatus;
    }
    function isBottom(backLink: BacklinkSv) {
        return idsFilter.getListString().has(backLink.blockID);
    }
    function modeSwitch() {
        if ($back_link_more_btns) {
            back_link_more_btns.write(false);
        } else {
            back_link_more_btns.write(true);
        }
    }
    function getSearchListIdx(item: SavedQuery) {
        return searchList.findIndex((i) => {
            return i.global == item.global && i.local == item.local;
        });
    }
    async function saveSearchList() {
        await siyuan.setBlockAttrs(maker.docID, {
            "custom-bkSavedQueries": JSON.stringify(searchList),
        });
    }
    async function clickSavedQuery(event: MouseEvent, item: SavedQuery) {
        if (event.ctrlKey || event.altKey) {
            const idx = getSearchListIdx(item);
            if (idx > -1) {
                searchList.splice(idx, 1);
                searchList = searchList;
                await saveSearchList();
            }
        } else {
            if (item.global) {
                globalSearchText = item.global;
                await doGlobalSearch();
            } else {
                globalSearchText = "";
            }
            if (item.local) {
                searchText = item.local;
                setTimeout(() => {
                    search();
                }, 1000);
            } else {
                searchText = "";
            }
        }
    }
    async function doGlobalSearch() {
        $autoRefreshChecked = false;
        page = 0;
        siyuan.pushMsg("search: " + globalSearchText);
        await getBackLinks({ mode: "exclusive" }, "search");
        go2Top();
    }
    function go2Top() {
        getDocLastElement(protyle?.protyle).scrollIntoView();
    }
</script>

<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- ///////////////////////////////////////////////////// -->
<!-- https://learn.svelte.dev/tutorial/if-blocks -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div>
    <div class="search-bar">
        <!-- <hr bind:this={splitHR} {...modeHide} /> -->
        <!-- 简洁模式 -->
        <button
            bind:this={modeSwitchBtn}
            title={tomatoI18n.简洁模式切换}
            class="bk_label"
            on:click={modeSwitch}>🍀</button
        >
        <!-- 跳上去 -->
        <button
            title={tomatoI18n.跳转顶部}
            class="bk_label b3-label__text"
            on:click={() => {
                const titleEle = document.querySelector(
                    `div.protyle-wysiwyg--attr[data-node-id="${maker.docID}"]`,
                );
                titleEle?.scrollIntoView();
            }}
        >
            {@html icon("Up", ICONS_SIZE)}
        </button>
        <!-- 概念栏 -->
        <div class="bk_flex" {...modeHide}>
            <!-- 最大展开的反链文件数 -->
            <label
                class="conceptMargin"
                title={tomatoI18n.maxBkDocs最大展开的反链文件数}
            >
                <input
                    class="b3-text-field numInput"
                    bind:value={refDocCount}
                    on:focus={() => ($autoRefreshChecked = true)}
                    on:input={() => {
                        page = 0;
                        siyuan.setBlockAttrs(maker.docID, {
                            "custom-bkRefDocCount": refDocCount.toString(),
                        });
                    }}
                />
            </label>
            <!-- 最大展开的提及文件数 -->
            <label
                class="conceptMargin"
                title={tomatoI18n.mentionDocs最大展开的提及文件数}
            >
                <input
                    class="b3-text-field numInput"
                    bind:value={menDocCount}
                    on:focus={() => ($autoRefreshChecked = true)}
                    on:input={() => {
                        page = 0;
                        siyuan.setBlockAttrs(maker.docID, {
                            "custom-bkMenDocCount": menDocCount.toString(),
                        });
                    }}
                />
            </label>
            <!-- 分页 -->
            <label class="conceptMargin">
                <button
                    title={tomatoI18n.上一页}
                    class="bk_label"
                    on:click={() => {
                        page = Math.max(0, page - 1);
                        refreshOnPage();
                    }}
                >
                    ⏪</button
                >
                <strong
                    on:click={() => {
                        page = 0;
                        refreshOnPage();
                    }}
                    title={tomatoI18n.回到第一页}>{page + 1}/{maxPage}</strong
                >
                <button
                    title={tomatoI18n.下一页}
                    class="bk_label"
                    on:click={() => {
                        page++;
                        refreshOnPage();
                    }}>⏩</button
                >
            </label>
            <!-- 收缩此双链栏 -->
            <label class="conceptMargin">
                <button
                    title={tomatoI18n.foldRefBar收缩此双链栏}
                    class="bk_label"
                    on:click={() => expand()}
                    >{expandStatus ? "🔥" : "💧"}</button
                >
            </label>
            <!-- 层级概念 -->
            <label class="conceptMargin">
                <button
                    title={tomatoI18n.openConceptForest打开层级概念}
                    class="bk_label"
                    on:click={() => {
                        const roots = getConceptTrees(linkItemsHierarchy);
                        showBkConTree(roots);
                    }}>🌲</button
                >
            </label>
            <!-- 插入相关概念 -->
            <label class="conceptMargin">
                <button
                    title={tomatoI18n.插入相关的层级概念}
                    class="bk_label"
                    on:click={() => {
                        insertConcepts(
                            maker.plugin,
                            maker.docID,
                            hierarchyConcepts,
                        );
                    }}>🔑</button
                >
            </label>
            <!-- 暂时隐藏本文档链接 -->
            <label class="conceptMargin">
                <button
                    title={tomatoI18n.暂时隐藏本文档链接}
                    class="bk_label b3-label__text"
                    on:click={() => (hideThis = !hideThis)}
                >
                    {hideThis ? "🙈" : "👀"}
                </button>
            </label>
            <!-- 创建时间升序 -->
            <label class="conceptMargin">
                <select
                    class="b3-select"
                    bind:value={sortBy}
                    on:focus={() => ($autoRefreshChecked = false)}
                    on:change={() => {
                        getBackLinks({ mode: "exclusive" }, "sort");
                        siyuan.setBlockAttrs(maker.docID, {
                            "custom-bkSortBy": sortBy,
                        });
                    }}
                >
                    <option value={SortType.AlphanumASC}>
                        {tomatoI18n.标题自然数升序}
                    </option>
                    <option value={SortType.AlphanumDESC}>
                        {tomatoI18n.标题自然数降序}
                    </option>
                    <option value={SortType.NameASC}>
                        {tomatoI18n.标题字母升序}
                    </option>
                    <option value={SortType.NameDESC}>
                        {tomatoI18n.标题字母降序}
                    </option>
                    <option value={SortType.CreatedASC}>
                        {tomatoI18n.创建时间升序}
                    </option>
                    <option value={SortType.CreatedDESC}>
                        {tomatoI18n.创建时间降序}
                    </option>
                    <option value={SortType.UpdatedASC}>
                        {tomatoI18n.修改时间升序}
                    </option>
                    <option value={SortType.UpdatedDESC}>
                        {tomatoI18n.修改时间降序}
                    </option>
                </select></label
            >
            <!-- 列数量 -->
            <label
                title={tomatoI18n.列数量留空为自动计算}
                class="conceptMargin"
            >
                <input
                    placeholder="col"
                    class="b3-text-field numInput"
                    bind:value={colCount}
                    on:focus={() => ($autoRefreshChecked = false)}
                    on:input={() =>
                        siyuan.setBlockAttrs(maker.docID, {
                            "custom-bkColCount": colCount,
                        })}
                />
            </label>
            <!-- 高度 -->
            <label title={tomatoI18n.高度} class="conceptMargin">
                <input
                    placeholder="200"
                    class="b3-text-field numInput"
                    bind:value={$back_link_protyle_height}
                    on:input={() => {
                        back_link_protyle_height.write();
                    }}
                />
            </label>
            <!-- 概念 -->
            {#if expandStatus}
                {#each linkItems as { text, id, count, attrs } (id)}
                    {#if /\d{4}-\d{2}-\d{2}/.test(text)}
                        <span></span>
                    {:else if hideThis && attrs.isThisDoc}
                        <span></span>
                    {:else}
                        <button
                            {...{ "tomato-bk-ref": "1" }}
                            {...attrs}
                            title={`[[${text}]]: ${tomatoI18n.conceptBarTitle点击}`}
                            {...attrs}
                            class="bk_label b3-label__text"
                            on:click={(event) =>
                                refConceptClick(event, text, id)}
                            >[[ {text} ]]
                            <span class="bk_ref_count">{count}</span></button
                        >
                    {/if}
                {/each}
            {:else if linkItems.length > 0}
                <!-- 展开此双链栏 -->
                <button
                    title={tomatoI18n.foldRefBar收缩此双链栏}
                    class="bk_label b3-label__text"
                    on:click={() => {
                        expand();
                    }}
                >
                    [[ ··· ]]
                </button>
            {/if}
        </div>
        <!-- 搜索精细过滤 -->
        <div class="bk_flex" {...modeHide}>
            <!-- 搜索 -->
            <label title={tomatoI18n.搜索反链提及}>
                <input
                    class="b3-text-field searchField"
                    placeholder={tomatoI18n.ctrl点击清空enter搜索}
                    on:blur={() => paddingBottom(false)}
                    on:focus={() => paddingBottom()}
                    on:focus={() => ($autoRefreshChecked = false)}
                    bind:value={globalSearchText}
                    on:click={(event) => {
                        if (event.altKey || event.ctrlKey) {
                            globalSearchText = "";
                            doGlobalSearch();
                        }
                    }}
                    on:keypress={(event) => {
                        if (event.key === "Enter") {
                            doGlobalSearch();
                        }
                    }}
                />
            </label>
            <!-- 精细过滤 -->
            <label title={tomatoI18n.过滤下面显示的反链提及}>
                <input
                    bind:this={searchFieldEle}
                    class="b3-text-field searchField"
                    placeholder={tomatoI18n.ctrl点击清空enter搜索}
                    on:click={(event) => {
                        if (event.altKey || event.ctrlKey) {
                            searchText = "";
                            search();
                        }
                    }}
                    on:blur={() => paddingBottom(false)}
                    on:focus={() => paddingBottom()}
                    on:click={() => {
                        $autoRefreshChecked = false;
                    }}
                    on:focus={() => {
                        $autoRefreshChecked = false;
                    }}
                    bind:value={searchText}
                    on:keypress={(event) => {
                        if (event.key === "Enter") {
                            search();
                        }
                    }}
                />
                <button
                    class="bk_label b3-label__text"
                    title={tomatoI18n.点击查看搜索语法}
                    on:click={() =>
                        new Dialog({
                            width: events.isMobile ? "90vw" : "700px",
                            height: events.isMobile ? "180svw" : null,
                            title: tomatoI18n.搜索语法,
                            content: tomatoI18n.SEARCH_HELP,
                        })}>{@html icon("Help", ICONS_SIZE)}</button
                >
            </label>
            <button
                title={tomatoI18n.保存查询条件}
                class="bk_label"
                on:click={() => {
                    if (globalSearchText || searchText) {
                        const item = {
                            global: globalSearchText,
                            local: searchText,
                        };
                        const idx = getSearchListIdx(item);
                        if (idx < 0) {
                            searchList.push(item);
                            searchList = searchList;
                            saveSearchList();
                        }
                    }
                }}
            >
                💾</button
            >
            {#each searchList as i}
                <label title={tomatoI18n.点击查询ctrl点击删除}>
                    <button
                        class="bk_label b3-label__text"
                        on:click={(e) => {
                            clickSavedQuery(e, i);
                        }}
                    >
                        {`${i.global}${i.local ? "#" + i.local : ""}`}</button
                    >
                </label>
            {/each}
        </div>
    </div>
    <!-- 反链、提及 -->
    <div class="bk_protyle" bind:clientWidth={bkWidth}>
        <!-- 遍历每一个反链，渲染出来 -->
        {#each backLinks as backLink, index (backLink.id)}
            {#if hideThis && backLink.attrs.isThisDoc}
                <span></span>
            {:else}
                <!-- 要设置每一个反链与反链之间的框框，以及他们的间隔 -->
                <div
                    id={backLink.id}
                    {...queryableElementAttr}
                    {...backLink.attrs}
                    style="background-color: {divBorderColor}; width: {protyleDivWidth};"
                    class="buttom-bk-borderedDiv borderedDiv"
                >
                    <!-- 序号-->
                    <span
                        class:order-men={backLink.isMention}
                        class:order-ref={!backLink.isMention}
                        class="bk_label b3-label__text">({index + 1})</span
                    >

                    <!-- 路径 -->
                    {#each backLink.bk.blockPaths as blockPath, i (blockPath.id)}
                        <span
                            {...backLink.attrs}
                            title={htmlUnescape(blockPath.name)}
                            class="bk_label b3-label__text"
                        >
                            {#if i == backLink.bk.blockPaths.length - 1}
                                <!-- 向上扩散 -->
                                {#if backLink.parentID}
                                    <button
                                        title={`${tomatoI18n.定位}(${tomatoI18n.引用已向上传递})`}
                                        class:order-men={backLink.isMention}
                                        class:order-ref={!backLink.isMention}
                                        {...backLink.attrs}
                                        class="bk_label b3-label__text"
                                        on:click={() => refClick(blockPath.id)}
                                        >🚀</button
                                    >
                                {:else}
                                    <button
                                        title={tomatoI18n.定位}
                                        class:order-men={backLink.isMention}
                                        class:order-ref={!backLink.isMention}
                                        {...backLink.attrs}
                                        class="bk_label b3-label__text"
                                        on:click={() => refClick(blockPath.id)}
                                        >🔍</button
                                    >
                                {/if}
                            {:else if blockPath.type == BlockNodeEnum.NODE_DOCUMENT}
                                <!-- 路径：文档名 -->
                                <button
                                    class:order-men={backLink.isMention}
                                    class:order-ref={!backLink.isMention}
                                    {...backLink.attrs}
                                    class="bk_label b3-label__text"
                                    title={`[[${blockPath.name}]]: ${tomatoI18n.conceptBarTitle点击}`}
                                    on:click={(event) => {
                                        refConceptClick(
                                            event,
                                            blockPath.name.split("/").pop(),
                                            blockPath.id,
                                        );
                                    }}
                                    >{@html blockPath.name
                                        .split("/")
                                        .pop()}</button
                                >
                            {:else if $back_link_show_path}
                                <button
                                    class:order-men={backLink.isMention}
                                    class:order-ref={!backLink.isMention}
                                    {...backLink.attrs}
                                    class="bk_label b3-label__text"
                                    on:click={() => refClick(blockPath.id)}
                                    >{"[*]"}</button
                                >
                            {/if}
                        </span>
                    {/each}

                    <!-- 内部工具 -->
                    <span {...modeHide}>
                        {#if $back_link_move_here}
                            <button
                                class="gap bk_label b3-button b3-button--text"
                                title={tomatoI18n.移动到文档}
                                on:click={async () => {
                                    $autoRefreshChecked = false;
                                    siyuan.pushMsg("Move");
                                    await move2doc(backLink);
                                }}>{@html icon("Move")}</button
                            >
                        {/if}
                        {#if $back_link_move_to_dailynote}
                            <button
                                class="gap bk_label b3-button b3-button--text"
                                title={tomatoI18n.移动到Dailynote}
                                on:click={async () => {
                                    $autoRefreshChecked = false;
                                    siyuan.pushMsg("Calendar");
                                    await move2dailynote(backLink);
                                }}>{@html icon("Calendar")}</button
                            >
                        {/if}
                        {#if $back_link_remove_refs && !backLink.isMention}
                            <button
                                class="gap bk_label b3-button b3-button--text"
                                title={tomatoI18n.把指向当前文档的引用删除}
                                on:click={async () => {
                                    siyuan.pushMsg("Unpin");
                                    await removeRefs(
                                        backLink.bk.dom,
                                        maker.docID,
                                    );
                                    await sleep(1000);
                                    await getBackLinks(
                                        { mode: "exclusive" },
                                        "unpin",
                                    );
                                }}>{@html icon("Unpin")}</button
                            >
                        {/if}
                        {#if $back_link_copy}
                            <button
                                class="gap bk_label b3-button b3-button--text"
                                title={tomatoI18n.复制到文档}
                                on:click={async () => {
                                    siyuan.pushMsg("Copy");
                                    await copy2doc(backLink);
                                }}>{@html icon("Copy")}</button
                            >
                        {/if}
                        {#if $back_link_embed}
                            <button
                                class="gap bk_label b3-button b3-button--text"
                                title={tomatoI18n.嵌入到文档}
                                on:click={async () => {
                                    siyuan.pushMsg("SQL");
                                    await embed2doc(backLink);
                                }}>{@html icon("SQL")}</button
                            >
                        {/if}
                        {#if $back_link_ref}
                            <button
                                class="gap bk_label b3-button b3-button--text"
                                title={tomatoI18n.引用到文档}
                                on:click={async () => {
                                    siyuan.pushMsg("Ref");
                                    await ref2doc(backLink);
                                }}>{@html icon("Ref")}</button
                            >
                        {/if}
                        {#if isBottom(backLink)}
                            <button
                                class="gap bk_label b3-button b3-button--text"
                                title={tomatoI18n.恢复到原来的位置}
                                on:click={() => {
                                    $autoRefreshChecked = true;
                                    idsFilter.delListString(backLink.blockID);
                                    idsFilter.save();
                                    priSort(false, backLink);
                                    getBackLinks({ mode: "exclusive" }, "pri");
                                }}>⏫</button
                            >
                        {:else}
                            <button
                                class="gap bk_label b3-button b3-button--text"
                                title={tomatoI18n.永久置于底部}
                                on:click={() => {
                                    $autoRefreshChecked = false;
                                    idsFilter.addListString(backLink.blockID);
                                    idsFilter.save();
                                    priSort(true, backLink);
                                }}>⏬</button
                            >
                        {/if}
                        <!-- 滑动到顶部 -->
                        <button
                            title={tomatoI18n.滑动到顶部}
                            class="b3-button b3-button--text"
                            on:click={go2Top}
                        >
                            ⬆️</button
                        >
                        <!-- 自动刷新 -->
                        <BackLinkBottomAutoRefresh {autoRefreshChecked} />
                        <!-- 立即刷新 -->
                        <BackLinkBottomOnceRefresh callback={refreshNow} />
                    </span>

                    <!-- 反链，提及，概念 -->
                    <!-- 概念 -->
                    <span
                        on:click={() => ($autoRefreshChecked = false)}
                        style="font-size: {Siyuan.config.editor.fontSize -
                            6}px;"
                    >
                        {#each [...(block2lnks.get(backLink.blockID) ?? [])] as linkItem}
                            {#if linkItem.id != maker.docID && !backLink.bk.blockPaths.find((v) => v.id == linkItem.id)}
                                <button
                                    title={`[[${linkItem.text}]]: ${tomatoI18n.conceptBarTitle点击}`}
                                    class="bk_label b3-label__text"
                                    on:click={(event) =>
                                        refConceptClick(
                                            event,
                                            linkItem.text,
                                            linkItem.id,
                                        )}>{linkItem.text}</button
                                >
                            {/if}
                        {/each}
                    </span>

                    {#if backLink.edit === true}
                        <!-- 可以编辑 -->
                        <div use:mountProtyle={backLink}></div>
                    {:else}
                        <!-- 不能编辑 -->
                        <div
                            class="protyle-wysiwyg"
                            on:click={() => {
                                $autoRefreshChecked = false;
                                backLink.edit = true;
                            }}
                        >
                            <div
                                style="max-height: {$back_link_protyle_height}px; overflow: auto;"
                            >
                                {@html backLink.bk.dom}
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
        {/each}
    </div>
</div>
<div bind:this={keepHeight}></div>

<style>
    .search-bar {
        position: sticky;
        top: 0px;
        background-color: var(--b3-theme-background);
        z-index: 1;
    }
    /* .modeSwitchBtn {
        margin-left: -20px;
        margin-bottom: -80px;
        float: left;
    }
    .goUpBtn {
        margin-left: -40px;
        margin-bottom: -80px;
        float: left;
    } */
    .numInput {
        width: 50px;
    }
    .order-men {
        color: var(--b3-font-color9);
    }
    .order-ref {
        color: var(--b3-font-color11);
    }
    .searchField {
        width: auto;
    }
    .conceptMargin {
        margin-left: 2px;
        margin-right: 2px;
    }
    .bk_flex {
        /* display: flex; */
        flex-wrap: wrap;
        margin: 5px;
    }
    .bk_protyle {
        /* padding-bottom: 100%; */
        display: flex;
        flex-wrap: wrap;
    }
    .borderedDiv {
        padding: 5px;
        margin: 5px;
    }
    [isThisDoc="true"] {
        color: var(--b3-font-color7);
    }
    .bk_ref_count {
        color: var(--b3-font-color8);
        font-size: smaller;
    }
    .gap {
        margin: auto;
    }
    .bk_label {
        border: transparent;
        background-color: transparent;
    }
    .hide {
        display: none;
    }
    .clickable {
        cursor: pointer;
    }
</style>
