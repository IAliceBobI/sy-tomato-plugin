<script lang="ts">
    // 底部反链面板 · 表达层（□4 视觉翻新，spec=docs/tomato-bk-bottom-visual-spec.md 唯一事实源）
    // 机制零改动带：doGetBackLinks 数据流（含 bkState/unchanged 短路）、navigator.locks 锁、
    // idsFilter 置底存储、keepHeight 滚动补偿、MutationObserver、refConceptClick 组合点击、
    // moveProtyle protyle 复用、块属性 key 全集、BKMaker 生命周期。
    import { onMount } from "svelte";
    import {
        NewLute,
        NewNodeID,
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
    import { debugLog } from "./libs/logUtils";
    import {
        sortDiv,
        doGetBackLinks,
        createProtyle,
        closeProtyle,
        conceptChipVisible,
    } from "./libs/bkUtils";
    import { makeBkListState, bkIndexCommitRelated, invalidateBkRevisions } from "./libs/bkRevision";
    import { clearSearchMarksFor, isSearchMarkSupported, setSearchMarksFor, whenContentReady } from "./libs/searchMark";
    import { Dialog, Menu, Protyle } from "siyuan";
    import { BlockNodeEnum, DATA_ID, DATA_NODE_ID } from "./libs/gconst";
    import { BKMaker, registerBkIndexCommitTarget } from "./BackLinkBottomBox";
    import { SearchEngine } from "./libs/search";
    import { applyBkWidthMode } from "./libs/bkWidthMode";
    import { events } from "./libs/Events";
    import { domBlankLine, domLnk, domNewLine } from "./libs/sydom";
    import { OpenSyFile2 } from "./libs/docUtils";
    import { writable } from "svelte/store";
    import {
        back_link_concept_fold,
        back_link_copy,
        back_link_embed,
        back_link_follow_width,
        back_link_max_size,
        back_link_mention_count,
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
    /** 截断态正文 3 行 × 18px line-height（spec §2.3 高度预算） */
    const CLAMP_MAX = "54px";
    const queryableElementAttr = $state({});
    const lute = NewLute();

    interface Props {
        maker: BKMaker;
        protyle: Protyle;
        attrs: AttrType;
        dm: DestroyManager;
    }

    let {
        maker = $bindable(),
        protyle = $bindable(),
        attrs,
        dm,
    }: Props = $props();

    let autoRefreshChecked = writable(!maker.shouldFreeze);
    let maxPage = $state(1);
    let backLinks: BacklinkSv<Protyle>[] = $state([]);
    let linkItems: LinkItem[] = $state([]);
    let searchText = $state("");
    let globalSearchText = $state("");
    let keepHeight: HTMLElement = $state();
    let gridEle: HTMLElement = $state();
    let hideThis = $state(false);
    // □2：计数与 chips 渲染同源（此前计数用全量 length、渲染各自过滤，日期项数了不画）
    let visibleConcepts = $derived(
        linkItems.filter((it) => conceptChipVisible(it, hideThis)),
    );
    let expandStatus = $state(true);
    let page = $state(0);
    let searchList: SavedQuery[] = $state([]);
    let refDocCount: number = $state(0);
    let menDocCount: number = $state(0);
    // □3 knownRevision 状态：组件级跨轮询存活，数据未变时轮询近零开销
    const bkState = makeBkListState();
    let sortBy = $state(SortType.UpdatedDESC);
    // 手动列数覆盖（空=自动，custom-bkColCount 语义与存储零迁移，spec §2.2）
    let colCount: string = $state();
    // □4 宽度模式（全局 store，任一面板切换所有已挂面板同步）：全宽=容器 margin 清空
    // （历史现状）；跟随=margin 对齐 wysiwyg inline padding（内容盒与编辑器文字列对齐）。
    // 移动端不参与（窄屏跟随无意义）。分屏/窗口变化由 onMount 的 style observer 同步。
    let followWidth = $derived(!events.isMobile && $back_link_follow_width);
    $effect(() => {
        if (maker.container) {
            applyBkWidthMode(maker.container, followWidth ? "follow" : "full", protyle.protyle.wysiwyg.element);
        }
    });
    function toggleWidthMode() {
        back_link_follow_width.write(!back_link_follow_width.get());
    }
    const idsFilter = storeAttrManager();

    $effect(() => {
        maker.shouldFreeze = !$autoRefreshChecked;
    });
    $effect(() => {
        for (const b of backLinks) {
            if (b.protyle?.protyle?.element) {
                b.protyle.protyle.element.style.maxHeight =
                    $back_link_protyle_height + "px";
            }
        }
    });
    $effect(() => {
        if (refDocCount < 0) refDocCount = 0;
    });
    $effect(() => {
        if (menDocCount < 0) menDocCount = 0;
    });

    function paddingBottom(p = true) {
        if (keepHeight?.style != null) {
            if (p) keepHeight.style.height = "2000px";
            else keepHeight.style.height = "200px";
        }
    }

    onMount(() => {
        paddingBottom();

        colCount = attrs["custom-bkColCount"] ?? "";
        sortBy = attrs["custom-bkSortBy"] as SortType;
        if (!isSortType(sortBy)) sortBy = SortType.UpdatedDESC;

        refDocCount = Number(attrs["custom-bkRefDocCount"]);
        if (!isValidNumber(refDocCount)) refDocCount = $back_link_max_size;

        menDocCount = Number(attrs["custom-bkMenDocCount"]);
        if (!isValidNumber(menDocCount)) menDocCount = $back_link_mention_count;

        queryableElementAttr[QUERYABLE_ELEMENT] = "1";

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

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === "style") {
                    protyle.protyle.wysiwyg.element.style.paddingBottom = "0px";
                    // □4 内核 setPadding 重写 inline padding（窗口/分屏拖动）：跟随模式的 margin 同步重算
                    // （followWidth 是 $derived 惰性求值，非响应式回调里读到的总是最新值）
                    if (followWidth && maker.container) {
                        applyBkWidthMode(maker.container, "follow", protyle.protyle.wysiwyg.element);
                    }
                }
            });
        });
        observer.observe(protyle.protyle.wysiwyg.element, {
            attributes: true,
            childList: false,
            characterData: false,
        });
        protyle.protyle.wysiwyg.element.style.paddingBottom = "0px";

        // □13 数据失效通道：纯内容编辑对列表级 revision 不可见（unchanged 短路会让
        // 卡片内容永驻缓存），内核索引提交广播是唯一失效信号（官方 markIndexDirty
        // 同款）。来源文档变更（引用块被编辑/增删）自动态即时重查；仅目标文档自身
        // 变更（普通打字也广播）只失效不即时刷——REFRESH 分支整卡重建会闪烁+滚动
        // 归零，下轮轮询自然全量（评审 P1-1）。full=rootIDs 不可信 → 全清（P2-1）。
        const offInvalidate = registerBkIndexCommitTarget(({ rootIDs, full }) => {
            const rel = bkIndexCommitRelated(bkState, maker.docID, rootIDs, full);
            if (rel === false) return;
            invalidateBkRevisions(bkState, full ? undefined : rootIDs);
            if (rel === "src" && $autoRefreshChecked) getBackLinks({ ifAvailable: true }, REFRESH);
        });

        // 列宽变化（分屏拖动/列数覆盖）重测截断溢出：display:none 的卡量高恒 0 须换地方补测
        const gridRO = new ResizeObserver(() => remeasureClamp());
        if (gridEle) gridRO.observe(gridEle);

        dm.add("svelte clean", () => {
            const tmp = backLinks;
            backLinks = [];
            closeProtyle(...tmp);
            observer.disconnect();
            gridRO.disconnect();
            offInvalidate();
            clearSearchMarksFor(bkState); // □3 编辑态马克笔随组件卸载摘槽位（Highlight 协议：卸载即消失；不动别家面板）
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
                    const ret = await doGetBackLinks(
                        maker.docID,
                        globalSearchText,
                        sortBy,
                        refDocCount,
                        menDocCount,
                        idsFilter,
                        page,
                        bkState,
                    );
                    if (ret?.unchanged) {
                        // 列表级 revision 未变：来源/计数全没变，UI 零动作（近零开销轮询）
                        debugLog("bk.get", `unchanged skip caller=${caller}`, "bk");
                        return;
                    }
                    const {
                        linkItems: a,
                        backLinks: b,
                        maxPage: mp,
                    } = ret;
                    linkItems = a;
                    if (caller == REFRESH) {
                        closeProtyle(...backLinks);
                        carryExpanded(backLinks, b);
                        paddingBottom();
                        setTimeout(() => {
                            paddingBottom(false);
                        }, 3000);
                    } else if (caller == ON_PAGE) {
                        closeProtyle(...backLinks);
                        carryExpanded(backLinks, b);
                        paddingBottom();
                    } else {
                        moveProtyle(backLinks, b);
                    }
                    backLinks = b;
                    // □3 数据刷新三分支汇合点：新对象 edit 态自然退出，及时重写槽位
                    // 清掉残留 Range（锚定 detached DOM 的整棵 wysiwyg 树不可 GC，评审 P2）
                    rebuildSearchMarks();
                    // keyed each 对同 id 卡复用 DOM 不重跑 @attach：新对象 clampOverflow
                    // 恒 undefined，必须统一补测（rAF 后 DOM 已 patch，读布局安全）
                    requestAnimationFrame(remeasureClamp);
                    maxPage = mp;
                    debugLog("bk.get", `caller=${caller} docs=${b.length}/${mp + 1}p concepts=${a.length} g="${globalSearchText}" l="${searchText}"`, "bk");
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
                // 展示态随卡走（protyle 复用同款通道）：数据变更轮询不把用户已展开的卡收回去
                n.expanded = o.expanded;
                o.protyle = null;
                o.ob = null;
            }
        }
        closeProtyle(...olds);
    }

    /** REFRESH/ON_PAGE 分支 protyle 整体重建，但仍搬运 expanded 展示态（刷新不收卡） */
    function carryExpanded(
        olds: BacklinkSv<Protyle>[],
        news: BacklinkSv<Protyle>[],
    ) {
        for (const o of olds) {
            const n = news.find((n) => n.blockID == o.blockID);
            if (n) n.expanded = o.expanded;
        }
    }

    async function refreshNow() {
        $autoRefreshChecked = false;
        // □13 手动刷新=强制全量重查（对齐官方 refresh 按钮）：先让内核刷索引队列
        // （刚编辑完可能未提交）。siyuan.call 内部吞异常永不 reject——失败返回 null
        // 静默降级为只清客户端缓存（仍失效+重查，退回旧行为，用户再点一次即可）
        await siyuan.refreshBacklink(maker.docID);
        invalidateBkRevisions(bkState);
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
    /** □3 提及马克笔：编辑态高亮全量重建——收集当前所有编辑态卡写入本组件槽位
     *  （bkState=owner，多面板并存互不踩，评审 P1-1），聚合重建统一注册名。
     *  所有应用/失效路径收敛到 attach 单入口；数据刷新（backLinks=b 后）与
     *  hideThis 隐藏也补调一次，及时清掉 detached DOM 上的残留 Range（P2）。 */
    function rebuildSearchMarks() {
        setSearchMarksFor(bkState, backLinks
            .filter((b) => b.edit === true && b.protyle?.protyle?.wysiwyg)
            .map((b) => ({ root: b.protyle.protyle.wysiwyg.element, keywords: b.keywords ?? [] })));
    }
    function mountProtyle(index: number) {
        return (node: HTMLElement) => {
            node.style.minHeight = "auto";
            node.addEventListener("click", () => {
                $autoRefreshChecked = false;
            });
            const backLink: BacklinkSv<Protyle> = backLinks.at(index);
            if (backLink.protyle == null) {
                let id = backLink.blockID;
                if (backLink.parentID) id = backLink.parentID;
                const pob = createProtyle(id, maker.plugin);
                backLink.ob = pob.ob;
                backLink.protyle = pob.p;
                backLink.protyle.protyle.element.style.maxHeight =
                    $back_link_protyle_height + "px"; // set height
            }
            node.appendChild(backLink.protyle.protyle.element);
            // □3 编辑态马克笔：等内核把 blockId 内容载入 wysiwyg 再建 Range（立即建=零命中）
            if (isSearchMarkSupported() && backLink.keywords?.length) {
                whenContentReady(backLink.protyle?.protyle, rebuildSearchMarks);
            }
        };
    }

    async function search() {
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
        remeasureClamp();
        go2Top();
    }

    /** 显隐/换列后重测截断溢出（display:none 期间量高恒 0，恢复显示须补测） */
    function remeasureClamp() {
        for (const body of maker.container.querySelectorAll<HTMLElement>(
            ".bk-body.clamped",
        )) {
            const inner = body.querySelector<HTMLElement>(".bk-body-inner");
            const card = body.closest<HTMLElement>(".bk-card");
            const bl = card && backLinks.find((b) => b.id === card.id);
            if (bl && inner) {
                bl.clampOverflow = inner.scrollHeight > inner.clientHeight + 4;
            }
        }
    }

    /** 卡片创建时初测：正文是否超 3 行（决定截断态渐隐+提示条是否渲染）；
     *  图片异步加载会推高 scrollHeight，对未就绪的图挂一次性监听补测 */
    function measureClamp(index: number) {
        return (node: HTMLElement) => {
            const measure = () => {
                const bl = backLinks.at(index);
                if (bl)
                    bl.clampOverflow =
                        node.scrollHeight > node.clientHeight + 4;
            };
            measure();
            node.querySelectorAll("img").forEach((img) => {
                if (!img.complete) {
                    img.addEventListener(
                        "load",
                        () => remeasureClamp(),
                        { once: true },
                    );
                }
            });
        };
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
    async function clickSavedQuery(item: SavedQuery) {
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
    async function delSavedQuery(item: SavedQuery) {
        const idx = getSearchListIdx(item);
        if (idx > -1) {
            searchList.splice(idx, 1);
            searchList = searchList;
            await saveSearchList();
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

    // ---------------- 卡头路径解析（spec §4.1/§4.3） ----------------

    function docPathOf(backLink: BacklinkSv) {
        return (
            backLink.bk.blockPaths.find(
                (p) => p.type == BlockNodeEnum.NODE_DOCUMENT,
            ) ?? {
                id: backLink.blockID,
                name: backLink.backlink?.name ?? "",
            }
        );
    }
    /** 中间段（非文档、非末块）：路径段开关开启时渲染为压缩纯文本 */
    function midPathsOf(backLink: BacklinkSv) {
        const paths = backLink.bk.blockPaths;
        return paths
            .slice(0, -1)
            .filter((p) => p.type != BlockNodeEnum.NODE_DOCUMENT);
    }
    function pathTextOf(backLink: BacklinkSv) {
        const mids = midPathsOf(backLink).map((p) =>
            htmlUnescape(p.name ?? "")
                .split("/")
                .pop(),
        );
        return mids.length ? "…" + mids.join("/") + "/" : "";
    }
    function fullPathOf(backLink: BacklinkSv) {
        return backLink.bk.blockPaths
            .map((p) => htmlUnescape(p.name ?? ""))
            .filter(Boolean)
            .join(" / ");
    }
    function locateIDOf(backLink: BacklinkSv) {
        const last = backLink.bk.blockPaths[
            backLink.bk.blockPaths.length - 1
        ];
        return last?.id ?? backLink.blockID;
    }

    // ---------------- ⋯ 偏好菜单 / 卡 ⋯ 菜单（spec §3.2/§3.4） ----------------

    /** independent 第三参防单例被同次 click 冒泡清空（debugging/kernel/ui.md「思源 Menu 单例」坑） */
    function newIndependentMenu(id: string): Menu {
        return new (Menu as any)(id, undefined, true) as Menu;
    }
    function openAt(anchor: HTMLElement, menu: Menu) {
        const rect = anchor.getBoundingClientRect();
        setTimeout(() => menu.open({ x: rect.left, y: rect.bottom + 4 }), 0);
    }
    function menuGroup(menu: Menu, label: string) {
        menu.addItem({
            type: "readonly",
            label,
            bind: (el) => el.classList.add("tomato-bk-menu-group"),
        } as any);
    }
    /** 数字行：input 即时写块属性/store（与旧常驻输入框 oninput 行为一致，仅位置移入菜单） */
    function menuNumRow(
        label: string,
        value: string,
        opt: { onFocus?: () => void; onInput: (v: string) => void },
    ): HTMLElement {
        const row = document.createElement("div");
        row.className = "tomato-bk-menu-row";
        const lab = document.createElement("span");
        lab.className = "tomato-bk-menu-row__label";
        lab.textContent = label;
        const input = document.createElement("input");
        input.type = "text";
        input.className = "b3-text-field tomato-bk-menu-row__input";
        input.value = value;
        if (opt.onFocus) input.addEventListener("focus", opt.onFocus);
        input.addEventListener("input", () => opt.onInput(input.value));
        row.append(lab, input);
        return row;
    }
    function menuSwitchRow(
        label: string,
        checked: boolean,
        onToggle: (v: boolean) => void,
    ): HTMLElement {
        const row = document.createElement("div");
        row.className = "tomato-bk-menu-row";
        const lab = document.createElement("span");
        lab.className = "tomato-bk-menu-row__label";
        lab.textContent = label;
        const input = document.createElement("input");
        input.type = "checkbox";
        input.className = "b3-switch b3-switch--menu";
        input.checked = checked;
        input.addEventListener("change", () => onToggle(input.checked));
        row.append(lab, input);
        return row;
    }

    function openPrefMenu(anchor: HTMLElement) {
        const menu = newIndependentMenu("tomatoBkPrefMenu");
        menu.element.style.minWidth = "240px";
        menuGroup(menu, tomatoI18n.范围);
        menu.addItem({
            element: menuNumRow(
                tomatoI18n.maxBkDocs最大展开的反链文件数,
                String(refDocCount),
                {
                    onFocus: () => ($autoRefreshChecked = true),
                    onInput: (v) => {
                        refDocCount = Number(v) || 0;
                        page = 0;
                        siyuan.setBlockAttrs(maker.docID, {
                            "custom-bkRefDocCount": String(refDocCount),
                        });
                    },
                },
            ),
        });
        menu.addItem({
            element: menuNumRow(
                tomatoI18n.mentionDocs最大展开的提及文件数,
                String(menDocCount),
                {
                    onFocus: () => ($autoRefreshChecked = true),
                    onInput: (v) => {
                        menDocCount = Number(v) || 0;
                        page = 0;
                        siyuan.setBlockAttrs(maker.docID, {
                            "custom-bkMenDocCount": String(menDocCount),
                        });
                    },
                },
            ),
        });
        menuGroup(menu, tomatoI18n.布局);
        menu.addItem({
            element: menuNumRow(tomatoI18n.列数, colCount ?? "", {
                onFocus: () => ($autoRefreshChecked = false),
                onInput: (v) => {
                    colCount = v;
                    siyuan.setBlockAttrs(maker.docID, {
                        "custom-bkColCount": v,
                    });
                    setTimeout(remeasureClamp, 50);
                },
            }),
        });
        menu.addItem({
            element: menuNumRow(
                tomatoI18n.预览高度,
                $back_link_protyle_height,
                {
                    onInput: (v) => {
                        back_link_protyle_height.write(v);
                    },
                },
            ),
        });
        menu.addSeparator();
        menuGroup(menu, tomatoI18n.显示);
        menu.addItem({
            element: menuSwitchRow(
                tomatoI18n.暂时隐藏本文档链接,
                hideThis,
                (v) => {
                    hideThis = v;
                    rebuildSearchMarks(); // □3 被隐藏卡的 protyle 元素摘出 DOM，残留 Range 及时清（同 P2）
                },
            ),
        });
        menu.addItem({
            element: menuSwitchRow(
                tomatoI18n.路径段显示,
                $back_link_show_path,
                (v) => back_link_show_path.write(v),
            ),
        });
        openAt(anchor, menu);
    }

    /** 卡 ⋯ 菜单：9 动作收纳（各动作行为逐字沿用旧常驻按钮，spec §3.4；开关关闭的项不渲染）。
     *  菜单开着期间轮询可能已换新对象数组：闭包捕获的 backLink 过期（置底 priSort 对
     *  数组外旧对象无效且无自愈），各 click 一律按 blockID 现查活对象（reasoning 评审 P1-3） */
    function openCardMenu(anchor: HTMLElement, backLink: BacklinkSv) {
        const menu = newIndependentMenu("tomatoBkCardMenu");
        const live = () =>
            backLinks.find((x) => x.blockID === backLink.blockID) ?? backLink;
        if ($back_link_move_here) {
            menu.addItem({
                icon: "iconMove",
                label: tomatoI18n.移动到文档,
                click: async () => {
                    $autoRefreshChecked = false;
                    siyuan.pushMsg("Move");
                    await move2doc(live());
                },
            });
        }
        if ($back_link_move_to_dailynote) {
            menu.addItem({
                icon: "iconCalendar",
                label: tomatoI18n.移动到Dailynote,
                click: async () => {
                    $autoRefreshChecked = false;
                    siyuan.pushMsg("Calendar");
                    await move2dailynote(live());
                },
            });
        }
        if ($back_link_remove_refs && !backLink.isMention) {
            menu.addItem({
                icon: "iconUnpin",
                label: tomatoI18n.把指向当前文档的引用删除,
                click: async () => {
                    siyuan.pushMsg("Unpin");
                    await removeRefs(live().bk.dom, maker.docID);
                    await sleep(1000);
                    await getBackLinks({ mode: "exclusive" }, "unpin");
                },
            });
        }
        if ($back_link_copy) {
            menu.addItem({
                icon: "iconCopy",
                label: tomatoI18n.复制到文档,
                click: async () => {
                    siyuan.pushMsg("Copy");
                    await copy2doc(live());
                },
            });
        }
        if ($back_link_embed) {
            menu.addItem({
                icon: "iconSQL",
                label: tomatoI18n.嵌入到文档,
                click: async () => {
                    siyuan.pushMsg("SQL");
                    await embed2doc(live());
                },
            });
        }
        if ($back_link_ref) {
            menu.addItem({
                icon: "iconRef",
                label: tomatoI18n.引用到文档,
                click: async () => {
                    siyuan.pushMsg("Ref");
                    await ref2doc(live());
                },
            });
        }
        const bl = live();
        if (isBottom(bl)) {
            menu.addItem({
                icon: "iconRestore",
                label: tomatoI18n.恢复到原来的位置,
                click: () => {
                    $autoRefreshChecked = true;
                    idsFilter.delListString(backLink.blockID);
                    idsFilter.save();
                    priSort(false, bl);
                    getBackLinks({ mode: "exclusive" }, "pri");
                },
            });
        } else {
            menu.addItem({
                icon: "iconDown",
                label: tomatoI18n.永久置于底部,
                click: () => {
                    $autoRefreshChecked = false;
                    idsFilter.addListString(backLink.blockID);
                    idsFilter.save();
                    priSort(true, bl);
                },
            });
        }
        menu.addItem({
            icon: "iconUp",
            label: tomatoI18n.滑动到顶部,
            click: () => go2Top(),
        });
        openAt(anchor, menu);
    }
</script>

<div class="bk-panel">
    <div class="bk-toolbar">
        <!-- 控制行：自动/暂停 + 立即刷新 + 分页 + 排序 + 收缩概念区 + ⋯ 偏好（spec §3.1） -->
        <div class="bk-toolbar-row">
            <!-- tooltip 须挂包裹 span：input 是置换元素不渲染 ::after 伪元素（b3-tooltips 气泡） -->
            <span
                class="bk-toggle-wrap b3-tooltips b3-tooltips__s"
                aria-label={`${tomatoI18n.自动刷新}（${$autoRefreshChecked
                    ? tomatoI18n.刷新中
                    : tomatoI18n.不刷新}）`}
            >
                <input
                    type="checkbox"
                    class="b3-switch bk-toggle"
                    bind:checked={$autoRefreshChecked}
                />
            </span>
            <button
                class="bk-icon-btn b3-tooltips b3-tooltips__s"
                aria-label={tomatoI18n.立即刷新}
                onclick={() => refreshNow()}>{@html icon("Refresh", 14)}</button
            >
            <span class="bk-pager">
                <button
                    class="bk-icon-btn b3-tooltips b3-tooltips__s"
                    aria-label={tomatoI18n.上一页}
                    onclick={() => {
                        page = Math.max(0, page - 1);
                        refreshOnPage();
                    }}>{@html icon("Back", ICONS_SIZE)}</button
                >
                <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
                <strong
                    class="bk-pager-num b3-tooltips b3-tooltips__s"
                    aria-label={tomatoI18n.回到第一页}
                    onclick={() => {
                        page = 0;
                        refreshOnPage();
                    }}>{page + 1}/{maxPage}</strong
                >
                <button
                    class="bk-icon-btn b3-tooltips b3-tooltips__s"
                    aria-label={tomatoI18n.下一页}
                    onclick={() => {
                        page++;
                        refreshOnPage();
                    }}>{@html icon("Forward", ICONS_SIZE)}</button
                >
            </span>
            <select
                class="b3-select bk-sort"
                aria-label={tomatoI18n.排序}
                bind:value={sortBy}
                onfocus={() => ($autoRefreshChecked = false)}
                onchange={() => {
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
            </select>
            {#if !events.isMobile}
                <button
                    class="bk-icon-btn b3-tooltips b3-tooltips__s"
                    aria-label={followWidth ? tomatoI18n.宽度全屏展开 : tomatoI18n.宽度跟随编辑器}
                    onclick={toggleWidthMode}
                >
                    {#if followWidth}{@html icon("Fullscreen", 14)}{:else}{@html icon("FullscreenExit", 14)}{/if}
                </button>
            {/if}
            <button
                class="bk-icon-btn bk-fold b3-tooltips b3-tooltips__s"
                aria-label={tomatoI18n.foldRefBar收缩此双链栏}
                onclick={() => expand()}
            >
                {#if expandStatus}
                    {@html icon("Contract", 14)}
                {:else}
                    <span class="bk-fold-count">{tomatoI18n.概念}·{visibleConcepts.length}</span>
                    {@html icon("Expand", 14)}
                {/if}
            </button>
            <button
                class="bk-icon-btn b3-tooltips b3-tooltips__s"
                aria-label={tomatoI18n.偏好设置}
                onclick={(e) => openPrefMenu(e.currentTarget)}>{@html icon("More", 14)}</button
            >
        </div>
        <!-- 概念行（收缩时整行消失，仅控制行收缩钮带计数） -->
        {#if expandStatus}
            <div class="bk-concepts">
                <!-- key 必须含 text：不同文字的引用可指向同一目标块（锚甲/锚甲2→同文档），
                     仅按 id 会重复 key 抛 each_key_duplicate，同一 flush 批次把卡片区的
                     更新一并打死=整面板冻结（□10-B「毒卡杀面板」真根因） -->
                {#each visibleConcepts as { text, id, count, attrs } (id + "#" + text)}
                    <button
                        {...attrs}
                        class="bk-chip b3-tooltips b3-tooltips__s"
                        aria-label={`${text}\n${tomatoI18n.组合点击提示}`}
                        onclick={(event) =>
                            refConceptClick(event, text, id)}
                    >
                        {text}<span class="bk-chip-count">{count}</span>
                    </button>
                {/each}
            </div>
        {/if}
        <!-- 搜索行：全局重查 + 本地过滤 双框语义（spec §7） -->
        <div class="bk-searchbar">
            <input
                type="text"
                class="b3-text-field bk-search"
                placeholder={tomatoI18n.全局搜索占位}
                aria-label={tomatoI18n.搜索反链提及}
                onblur={() => paddingBottom(false)}
                onfocus={() => {
                    paddingBottom();
                    $autoRefreshChecked = false;
                }}
                bind:value={globalSearchText}
                onclick={(event) => {
                    if (event.altKey || event.ctrlKey) {
                        globalSearchText = "";
                        doGlobalSearch();
                    }
                }}
                onkeypress={(event) => {
                    if (event.key === "Enter") {
                        doGlobalSearch();
                    }
                }}
            />
            <input
                type="text"
                class="b3-text-field bk-search"
                placeholder={tomatoI18n.本地过滤占位}
                aria-label={tomatoI18n.过滤下面显示的反链提及}
                onclick={(event) => {
                    if (event.altKey || event.ctrlKey) {
                        searchText = "";
                        search();
                    }
                    $autoRefreshChecked = false;
                }}
                onblur={() => paddingBottom(false)}
                onfocus={() => {
                    paddingBottom();
                    $autoRefreshChecked = false;
                }}
                bind:value={searchText}
                onkeypress={(event) => {
                    if (event.key === "Enter") {
                        search();
                    }
                }}
            />
            <button
                class="bk-icon-btn b3-tooltips b3-tooltips__s"
                aria-label={tomatoI18n.点击查看搜索语法}
                onclick={() =>
                    new Dialog({
                        width: events.isMobile ? "90vw" : "700px",
                        height: events.isMobile ? "180svw" : null,
                        title: tomatoI18n.搜索语法,
                        content: tomatoI18n.SEARCH_HELP,
                    })}>{@html icon("Help", ICONS_SIZE)}</button
            >
            <button
                class="bk-icon-btn b3-tooltips b3-tooltips__s"
                aria-label={tomatoI18n.保存查询条件}
                onclick={() => {
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
                }}>{@html icon("Add", 14)}</button
            >
            <!-- key 用 JSON 数组而非 "#" 拼接：global/local 均自由文本且 # 是搜索语法活跃字符，
                 前缀错位的两条已存查询会拼出同键抛 each_key_duplicate（同 1047 行机制）；
                 且条目持久化在 custom-bkSavedQueries，中招=该文档面板每次打开即冻 -->
            {#each searchList as i (JSON.stringify([i.global, i.local]))}
                <span class="bk-saved-chip">
                    <button
                        class="bk-chip b3-tooltips b3-tooltips__s"
                        aria-label={tomatoI18n.点击应用查询}
                        onclick={() => clickSavedQuery(i)}
                    >
                        {`${i.global}${i.local ? "#" + i.local : ""}`}
                    </button>
                    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                    <span
                        class="bk-chip-x b3-tooltips b3-tooltips__s"
                        aria-label={tomatoI18n.删除此查询}
                        onclick={(e) => {
                            e.stopPropagation();
                            delSavedQuery(i);
                        }}>{@html icon("Close", ICONS_SIZE)}</span
                    >
                </span>
            {/each}
        </div>
    </div>
    <!-- 卡片网格：auto-fill 自动档 + 手动列数覆盖（spec §2.2；移动端恒 1 列，inline 覆盖不生效） -->
    <div
        class="bk-grid"
        class:mobile={events.isMobile}
        style={!events.isMobile &&
        colCount &&
        Number(colCount) > 0
            ? `grid-template-columns: repeat(${Number(colCount)}, minmax(0, 1fr));`
            : ""}
        bind:this={gridEle}
    >
        {#each backLinks as backLink, index (backLink.id)}
            {#if !(hideThis && backLink.attrs.isThisDoc)}
                <article
                    id={backLink.id}
                    {...queryableElementAttr}
                    {...backLink.attrs}
                    class="bk-card"
                    class:order-ref={!backLink.isMention}
                    class:order-men={backLink.isMention}
                >
                    <!-- 卡头：色点 | 文档名 | 定位 | ⋯（spec §4.1/§4.3） -->
                    <header class="bk-card-head">
                        <i class="bk-dot" aria-hidden="true"></i>
                        {#if isBottom(backLink)}
                            <span
                                class="bk-bottom-mark b3-tooltips b3-tooltips__s"
                                aria-label={tomatoI18n.永久置于底部}
                                >{@html icon("Down", 10)}</span
                            >
                        {/if}
                        {#if $back_link_show_path}
                            {@const pathText = pathTextOf(backLink)}
                            {#if pathText}
                                <span class="bk-path">{pathText}</span>
                            {/if}
                        {/if}
                        <button
                            class="bk-doc-name b3-tooltips b3-tooltips__s"
                            aria-label={`${fullPathOf(backLink)}\n${tomatoI18n.组合点击提示}`}
                            onclick={(event) =>
                                refConceptClick(
                                    event,
                                    docPathOf(backLink).name
                                        ?.split("/")
                                        .pop(),
                                    docPathOf(backLink).id,
                                )}
                        >
                            {docPathOf(backLink).name?.split("/").pop()}
                        </button>
                        <button
                            class="bk-icon-btn b3-tooltips b3-tooltips__s"
                            aria-label={backLink.parentID
                                ? `${tomatoI18n.定位}(${tomatoI18n.引用已向上传递})`
                                : tomatoI18n.定位}
                            onclick={() => refClick(locateIDOf(backLink))}
                        >
                            {@html icon(backLink.parentID ? "Up" : "Focus", 14)}
                        </button>
                        <button
                            class="bk-icon-btn b3-tooltips b3-tooltips__s"
                            aria-label={tomatoI18n.卡片操作}
                            onclick={(e) =>
                                openCardMenu(e.currentTarget, backLink)}
                        >
                            {@html icon("More", 14)}
                        </button>
                    </header>
                    {#if backLink.edit === true}
                        <!-- 编辑态：挂 protyle（机制沿现状） -->
                        <div {@attach mountProtyle(index)}></div>
                    {:else}
                        <!-- 截断态点击=展开；展开态点击=进编辑（spec §4.2） -->
                        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                        <div
                            class="bk-body protyle-wysiwyg"
                            class:clamped={!backLink.expanded}
                            class:overflowing={backLink.clampOverflow}
                            onclick={() => {
                                $autoRefreshChecked = false;
                                // 框选文本结束的 click 不切态（选区非 collapsed 即用户在选字）
                                if (!window.getSelection()?.isCollapsed) {
                                    return;
                                }
                                if (backLink.expanded) {
                                    backLinks.at(index).edit = true;
                                } else {
                                    backLinks.at(index).expanded = true;
                                }
                            }}
                        >
                            <div
                                class="bk-body-inner"
                                style={`max-height: ${backLink.expanded
                                    ? Number($back_link_protyle_height) + "px"
                                    : CLAMP_MAX};`}
                                {@attach measureClamp(index)}
                            >
                                {@html backLink.bk.dom}
                            </div>
                            {#if !backLink.expanded && backLink.clampOverflow}
                                <button
                                    class="bk-hint bk-hint--float"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        $autoRefreshChecked = false;
                                        backLinks.at(index).expanded = true;
                                    }}
                                >
                                    {tomatoI18n.展开全文}
                                    {@html icon("Down", ICONS_SIZE)}
                                </button>
                            {:else if backLink.expanded}
                                <button
                                    class="bk-hint bk-hint--row"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        backLinks.at(index).expanded = false;
                                    }}
                                >
                                    {tomatoI18n.收起}
                                    {@html icon("Up", ICONS_SIZE)}
                                </button>
                            {/if}
                        </div>
                    {/if}
                </article>
            {/if}
        {/each}
    </div>
</div>
<div bind:this={keepHeight}></div>

<style>
    /* ---- 工具栏（sticky 贴顶，spec §3.1） ---- */
    .bk-toolbar {
        position: sticky;
        top: 0;
        /* 10 = 浮层安全档：sticky 头本就该压住滚动内容，同时让 b3-tooltips 气泡
           （z-index 被锁在本 stacking context）不被卡片 protyle 内容盖住 */
        z-index: 10;
        background: var(--b3-theme-background);
        padding: 4px 2px 2px;
    }
    .bk-toolbar-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }
    .bk-toggle-wrap {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        line-height: 1;
    }
    /* 最左元素 + __s 居中锚定 = 气泡左半溢出面板被裁（AGENTS 踩坑索引同款）：
       左缘对齐开关左缘，废除 translateX 居中（hover 态选择器须压过内核 __s 的特异性） */
    .bk-toolbar .bk-toggle-wrap.b3-tooltips::after {
        left: 0;
        right: auto;
        transform: none;
    }
    .bk-toolbar .bk-toggle-wrap.b3-tooltips:hover::after,
    .bk-toolbar .bk-toggle-wrap.b3-tooltips:focus-within::after {
        transform: none;
    }
    .bk-toggle {
        flex-shrink: 0;
        /* spec §3.1 mini toggle 28×16（b3-switch 原生 26×16，放大一档到 spec 值） */
        width: 28px;
        height: 16px;
    }
    .bk-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        min-width: 20px;
        min-height: 20px;
        padding: 1px 3px;
        border: none;
        border-radius: var(--b3-border-radius);
        background: transparent;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
    }
    .bk-icon-btn:hover {
        background: var(--b3-list-hover);
    }
    .bk-icon-btn :global(svg) {
        pointer-events: none;
    }
    .bk-pager {
        display: inline-flex;
        align-items: center;
        gap: 2px;
    }
    .bk-pager-num {
        font-size: 12px;
        font-variant-numeric: tabular-nums;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
        padding: 0 2px;
    }
    .bk-sort {
        font-size: 12px;
        height: 22px;
        max-width: 130px;
        padding: 0 4px;
    }
    .bk-fold-count {
        font-size: 12px;
        color: var(--b3-theme-on-surface-light);
        white-space: nowrap;
    }
    /* ---- 概念行 + 搜索行 ---- */
    .bk-concepts {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin: 4px 0 0;
    }
    .bk-searchbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        margin-top: 4px;
    }
    .bk-search {
        flex: 1 1 160px;
        min-width: 120px;
        max-width: 320px;
        height: 24px;
        font-size: 12px;
    }
    .bk-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        max-width: 200px;
        padding: 1px 6px;
        border: none;
        border-radius: 999px;
        background: var(--b3-theme-surface);
        color: var(--b3-theme-on-surface);
        font-size: 12px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .bk-chip:hover {
        background: var(--b3-list-hover);
    }
    .bk-chip-count {
        font-size: 11px;
        color: var(--b3-theme-on-surface-light);
    }
    .bk-saved-chip {
        display: inline-flex;
        align-items: center;
        gap: 2px;
    }
    .bk-chip-x {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 16px;
        min-height: 16px;
        border-radius: 50%;
        color: var(--b3-theme-on-surface-light);
        cursor: pointer;
    }
    .bk-chip-x:hover {
        color: var(--b3-theme-error);
        background: var(--b3-list-hover);
    }
    .bk-chip-x :global(svg) {
        pointer-events: none;
    }
    /* ---- 卡片网格（spec §2.2：446px 起 2 列） ---- */
    .bk-grid {
        display: grid;
        gap: 6px;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        margin-top: 4px;
    }
    .bk-grid.mobile {
        grid-template-columns: 1fr;
    }
    /* ---- 卡片（spec §2.3/§2.4/§4） ---- */
    .bk-card {
        position: relative;
        /* 卡内 .bk-hint--float 与 sticky 工具栏同 z 档时按树序穿透（vision P1-A）：
           整卡自沉一档，hint 仍压得过卡内渐隐 ::after */
        z-index: 0;
        padding: 5px 8px;
        border: 1px solid var(--b3-border-color);
        border-radius: var(--b3-border-radius);
        background: var(--b3-theme-background);
    }
    .bk-card:hover {
        border-color: color-mix(
            in srgb,
            var(--b3-theme-primary) 35%,
            transparent
        );
    }
    .order-ref {
        --bk-semi: var(--b3-font-color11);
    }
    .order-men {
        --bk-semi: var(--b3-font-color9);
    }
    .bk-card[isThisDoc="true"] {
        --bk-semi: var(--b3-font-color7);
    }
    .bk-card-head {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 20px;
        margin-bottom: 3px;
    }
    .bk-dot {
        flex-shrink: 0;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--bk-semi);
    }
    .bk-bottom-mark {
        flex-shrink: 0;
        display: inline-flex;
        color: var(--b3-theme-on-surface-light);
    }
    .bk-bottom-mark :global(svg) {
        pointer-events: none;
    }
    .bk-path {
        flex-shrink: 1;
        min-width: 0;
        font-size: 12px;
        color: var(--b3-theme-on-surface-light);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .bk-doc-name {
        flex: 1;
        min-width: 0;
        border: none;
        background: transparent;
        padding: 0;
        text-align: left;
        font-size: 12px;
        color: var(--bk-semi);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
    }
    /* ---- 卡片正文三态（spec §4.1/§4.2） ---- */
    .bk-body {
        position: relative;
        /* 抵消 .protyle-wysiwyg 全局 16px/24px padding（不吃 90px 密度预算） */
        padding: 0;
    }
    .bk-body-inner {
        font-size: calc(var(--b3-font-size) - 1px);
        line-height: 18px;
    }
    .bk-body.clamped .bk-body-inner {
        max-height: 54px;
        overflow: hidden;
    }
    .bk-body:not(.clamped) .bk-body-inner {
        overflow: auto;
    }
    /* 渐隐浮叠末行之上，不占高度；仅确有溢出才渲染 */
    .bk-body.clamped.overflowing::after {
        content: "";
        position: absolute;
        inset: auto 0 0 0;
        height: 28px;
        background: linear-gradient(
            transparent,
            var(--b3-theme-background)
        );
        pointer-events: none;
    }
    .bk-hint {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        border: none;
        background: transparent;
        padding: 1px 0;
        font-size: 12px;
        color: var(--b3-theme-primary);
        cursor: pointer;
    }
    .bk-hint :global(svg) {
        pointer-events: none;
    }
    /* 截断态提示条：浮叠于渐隐遮罩之上（绝对定位不吃 90px 预算） */
    .bk-hint--float {
        position: absolute;
        inset: auto 0 0 0;
        height: 20px;
        z-index: 1;
    }
    /* 展开态提示条：正文底下的常驻行（可滚动内容之上，不用遮罩） */
    .bk-hint--row {
        width: 100%;
        margin-top: 2px;
        border-top: 1px solid var(--b3-border-color);
        background: var(--b3-theme-background);
    }
    /* 运行时挂载的 protyle 容器：Svelte scoped 摸不到（spec §12 附录 3） */
    .bk-card :global(.protyle) {
        overflow: auto;
    }
    @media (max-width: 460px) {
        .bk-search {
            flex-basis: 100%;
            max-width: none;
        }
    }
</style>
