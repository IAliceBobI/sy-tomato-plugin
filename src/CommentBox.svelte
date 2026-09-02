<script lang="ts" module>
    // □7 性能件共享层（reasoning P0-1 根治）：dock/tab 双实例共享失效信号与文档正引缓存。
    // ws 监听必须在模块级只注册一次——Events.addWsListener 是 Map.set 同名覆盖且无 remove API，
    // 实例级注册会让后挂实例覆盖先挂实例的回调，先挂实例（dock）的置脏/清缓存通道就此挂死。
    import { events as eventsShared } from "./libs/Events";

    let wsGen = $state(0); // ws 事务代数：只前进不重置（比较式失效，刷新失败不清脏）
    const docContentCache = new Map<string, string>(); // 目标文档级：def_block_root_id → docContent

    eventsShared.addWsListener("tomato commentbox perf 2026-08-31", () => {
        wsGen++;
        docContentCache.clear();
    });
</script>

<script lang="ts">
    import { confirm, Protyle } from "siyuan";
    import type { IProtyle, Dock } from "siyuan";
    import { onDestroy, onMount } from "svelte";
    import { commentBox, CommentBox刷新文档正引 } from "./CommentBox";
    import { openAnnoCollectDialog } from "./AnnoCollectDialog";
    import {
        deleteBlock,
        getAttribute,
        getCursorElement,
        getSyElement,
        isStringNumber,
        removeInvisibleChars,
        siyuan,
        strIncludeAttr,
        uniqueFilter,
    } from "./libs/utils";
    import { closeProtyle, createProtyle } from "./libs/bkUtils";
    import { BlockNodeEnum, SPACE, TOMATO_BK_IGNORE } from "./libs/gconst";
    import {
        commentBoxAnnotations,
        commentBoxBackwardRef,
        commentBoxForwardRef,
        commentBoxMaxProtyleHeight,
        commentBoxPanelSkin,
        commentBoxShowID,
        commentBoxStaticOutlink,
        commentBoxVirtualRef,
    } from "./libs/stores";
    import { tomatoI18n } from "./tomatoI18n";
    import {
        getDocBlocks,
        getDocTracer,
        OpenSyFile2,
    } from "./libs/docUtils";
    import { findElementByAttr } from "./libs/listUtils";
    import { zipNways } from "./libs/functional";
    import { events } from "./libs/Events";
    import { lastVerifyResult } from "./libs/user";
    import { getGlobal, setGlobal } from "stonev5-utils";
    import { ANNOTATIONS_ATTR } from "./libs/annotationsAttr";
    import { annoTextToHtml } from "./libs/annoKramdown";
    import {
        annoPanelFromRows,
        fmtAnnoTime,
        mapLimit,
        shouldSkipRefresh,
        type AnnoPanelItem,
    } from "./libs/annoPanelList";
    import {
        destroyPanelTip,
        hidePanelTip,
        showPanelTip,
    } from "./libs/panelTip";

    // 面板卸载摘自建 tip 单例（dock/tab 双实例同卸也幂等无害：下次 hover 自动重建）
    onDestroy(destroyPanelTip);
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
    let lastDocID: string = $state();
    let notebookId: string = $state();
    let listID: string = $state();
    let superID: string = $state();
    let quoteID: string = $state();
    let annoItems: AnnoPanelItem[] = $state([]);
    let annoLoaded = $state(false);
    let blockLoaded = $state(false);
    let docLoaded = $state(false);

    // ---- □7 性能件（实例级；共享失效信号 wsGen/缓存 docContentCache 在上方 module 块） ----
    // 光标块短路状态：实例级是有意为之——dock/tab 的 svelteCallback 经同名 navigator.locks
    // 串行执行，若共享 lastRefresh 第二个实例对同块会永远 skip（永久饿死）；失效感知
    // 走共享 wsGen 比较（reasoning P0-1/P1-3：比较式不消费，失败路径与双实例都正确）。
    let lastRefresh: { blockID?: string; docID?: string; gen?: number } | undefined;
    // 文档正引刷新：原 10s 占锁防抖改 500ms trailing debounce（连续触发合并为静默后末次）
    const DOC_THROTTLE_MS = 500;
    const DOC_FETCH_LIMIT = 4;
    let docThrottleTimer: ReturnType<typeof setTimeout> | undefined;

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
        // 滚动即弃 tip 防线已上提 panelTip 模块级单例（□3），组件层不再挂
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
        hidePanelTip(); // dock 折窄隐藏不销毁、无 mouseleave——tip 显着时悬留到用户动鼠标（P2-1 一行了结）
        if (docThrottleTimer != null) {
            clearTimeout(docThrottleTimer);
            docThrottleTimer = undefined;
        }
        if (annoThrottleTimer != null) {
            clearTimeout(annoThrottleTimer);
            annoThrottleTimer = undefined;
        }
        for (const io of lazyObservers) io.disconnect();
        lazyObservers.clear();
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
        hidePanelTip(); // 刷新=卡片/条目/chip 可能整批重建，锚被摘除不派 mouseleave——先弃 tip
        if (getAttribute(protyle.element, TOMATO_BK_IGNORE)) return;

        if ($commentBoxStaticOutlink) {
            const i = events.getInfo(protyle);
            docID = i.docID;
            if (lastDocID != docID) {
                lastDocID = docID;
                return _svelteCallback_doc_throttled(true);
            } else {
                return _svelteCallback_doc_throttled(force);
            }
        } else {
            return _svelteCallback_block(protyle, force);
        }
    }

    function _svelteCallback_doc_throttled(force = false) {
        if (docThrottleTimer != null) {
            clearTimeout(docThrottleTimer);
            docThrottleTimer = undefined;
        }
        if (force) {
            _svelteCallback_doc();
            return;
        }
        docThrottleTimer = setTimeout(() => {
            docThrottleTimer = undefined;
            _svelteCallback_doc();
        }, DOC_THROTTLE_MS);
    }

    async function _svelteCallback_doc() {
        docLoaded = false; // 复位：换文档/刷新失败时旧卡不冒充新文档内容（reasoning P2-1）
        try {
            await __svelteCallback_doc_body();
            docLoaded = true;
        } catch (e) {
            console.error("CommentBox refresh doc refs:", e);
        }
    }

    async function __svelteCallback_doc_body() {
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
        // □7 性能：并发钳制（≤4 路同时导出）+ 目标文档级结果缓存
        await mapLimit(idContents, DOC_FETCH_LIMIT, async (ref) => {
            const cached = docContentCache.get(ref.def_block_root_id);
            if (cached != null) {
                ref.docContent = cached;
                return;
            }
            const c = await siyuan.copyStdMarkdownWithoutTitle(ref.def_block_root_id);
            ref.docContent = removeInvisibleChars(c, true);
            docContentCache.set(ref.def_block_root_id, ref.docContent);
        });
        refs = idContents;
    }

    async function _svelteCallback_block(protyle: IProtyle, force = false) {
        const e = getCursorElement();
        if (!e) return;
        const id = getAttribute(e, "data-node-id");
        docID = protyle.block.rootID; // 提前：id 缺失的早退也更新 docID（供批注分区/ShowID 用）
        if (id == null) return;
        // □7 性能：光标块未变短路（wsGen 比较式失效；force=F9/刷新按钮恒穿透，reasoning P1-2）
        const gen0 = wsGen; // 记进入时代数：尾部成功路径才写 lastRefresh，中途 ws bump 不丢失效信号
        if (!force && shouldSkipRefresh(lastRefresh, { blockID: id, docID, gen: gen0 })) return;
        currentID = id;
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
                        b.refKind = "virtual";
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
                            row.refKind = "forward";
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
                        if (!(refL1?.length > 0)) return;

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
                                    l1.parent.refKind = "backward";
                                    map.set(l1.parent.id, l1.parent);
                                    continue;
                                }
                            }
                            l1.data = tomatoI18n.反引;
                            l1.refKind = "backward";
                            map.set(l1.id, l1);
                        }
                    }),
            );
        }

        await Promise.all(tasks);
        const bks = [...map.values()]
            .sort((a, b) => b.sort - a.sort)
            .map((row) => {
                // □7 性能：不再立即 createProtyle——复用迁移的保留实例，新建的懒到进视口（mountProtyle）。
                // 迁移只读不写：旧数组（当前 $state）上的 bk 绝不能就地置 null——那是 $state 深层写，
                // 会在 await getRows 的间隙触发 @attach effect 重跑、读到 protyle=null 走 io 分支重建实例，
                // 卡内 protyle 因此成对堆叠（2026-09-01「感情卡×3」bug 根因，Loki 打点实证）。
                // 销毁侧改由 closeProtyle 按「保留名单」排除迁移块，旧数组保持原样直到整体替换。
                const bk = backLinks.find((b) => b.blockID === row.id);
                return {
                    blockID: row.id,
                    protyle: bk?.protyle ?? null,
                    ob: bk?.ob ?? null,
                    row,
                } as BacklinkSv<Protyle>;
            });

        const kept = new Set(bks.map((bk) => bk.blockID));
        closeProtyle(...backLinks.filter((bk) => !kept.has(bk.blockID)));

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
        blockLoaded = true;
        lastRefresh = { blockID: id, docID, gen: gen0 }; // 成功才记：中途失败同块可重试（reasoning P1-3 残留）
    }

    function sortByFold(backLinks: BacklinkSv<Protyle>[]) {
        backLinks.sort((a, b) => {
            const aa = a.isFold === true ? 1 : 0;
            const bb = b.isFold === true ? 1 : 0;
            return aa - bb;
        });
        return backLinks;
    }

    // ---- 卡内图片高图修复（spec §7 契约 3）：折叠按钮由 emoji 文本改 svg 注入 ----
    const SVG_UP = '<svg><use xlink:href="#iconUp"></use></svg>';
    const SVG_DOWN = '<svg><use xlink:href="#iconDown"></use></svg>';

    function doFold(btn: HTMLElement, div: HTMLElement) {
        if (div) div.style.display = "none";
        if (btn) {
            btn.innerHTML = SVG_DOWN;
            btn.setAttribute("aria-label", tomatoI18n.展开卡片);
        }
    }

    function doUnFold(btn: HTMLElement, div: HTMLElement) {
        if (div) div.style.display = "";
        if (btn) {
            btn.innerHTML = SVG_UP;
            btn.setAttribute("aria-label", tomatoI18n.收起卡片);
        }
    }

    function renderDocContent(ref: Ref) {
        return (node: HTMLElement) => {
            node.style.maxHeight = $commentBoxMaxProtyleHeight + "px";
            node.innerHTML = ref.docContent.replaceAll("\n\n", "\n");
        };
    }

    // ---- □7 性能：卡片懒加载——进视口才 createProtyle（复用迁移的立即挂载） ----
    const lazyObservers = new Set<IntersectionObserver>();

    function attachNow(node: HTMLElement, backLink: BacklinkSv<Protyle>) {
        const el = backLink.protyle?.protyle?.element;
        if (!el) return;
        node.style.minHeight = "auto";
        // 兜底扫孤儿：本卡 body 里只允许存在当前 protyle 的 element——任何历史残留
        // （上游竞态漏销毁的实例，内核 destroy 不摘 DOM）就地清掉，卡内永不堆叠
        for (const c of [...node.children]) {
            if (c !== el) c.remove();
        }
        node.appendChild(el);

        const protyleDiv = document.getElementById(
            getProtyleID(backLink),
        );
        const btn = document.getElementById(getButtonID(backLink));

        if (backLink.isFold === true) {
            doFold(btn, protyleDiv);
        } else {
            doUnFold(btn, protyleDiv);
        }
    }

    function ensureProtyle(backLink: BacklinkSv<Protyle>, node: HTMLElement) {
        if (backLink.protyle) return;
        const pob = createProtyle(backLink.blockID, commentBox.plugin, {
            title: false,
            breadcrumb: true,
            breadcrumbDocName: true,
        });
        pob.p.protyle.element.style.maxHeight =
            $commentBoxMaxProtyleHeight + "px"; // set height
        backLink.protyle = pob.p;
        backLink.ob = pob.ob;
        attachNow(node, backLink);
    }

    // attach 直持本卡 backLink（each 绑定的 item），闭包即真实配对——严禁 index 反查数组：
    // 数组在 await 间隙/重排的中间态与闭包 index 错位，会把别的卡的 protyle 挂进本卡
    function mountProtyle(backLink: BacklinkSv<Protyle>) {
        return (node: HTMLElement) => {
            if (backLink?.protyle?.protyle?.element) {
                attachNow(node, backLink);
                return;
            }
            const io = new IntersectionObserver(
                (entries, obs) => {
                    if (!entries.some((en) => en.isIntersecting)) return;
                    obs.disconnect();
                    lazyObservers.delete(obs);
                    if (!backLink.protyle) ensureProtyle(backLink, node);
                },
                { root: null, rootMargin: "300px 0px" },
            );
            lazyObservers.add(io);
            io.observe(node);
            return () => {
                io.disconnect();
                lazyObservers.delete(io);
            };
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
    }

    // ---- □7 批注分区：当前文档全部块批注（attributes 表直查 + 纯函数装配） ----
    let annoSeq = 0; // 竞态令牌：docID 快速切换时慢响应不覆盖新响应（reasoning P2-4）
    let annoThrottleTimer: ReturnType<typeof setTimeout> | undefined;

    async function loadAnnos() {
        if (!docID) return;
        const seq = ++annoSeq;
        try {
            const rows = await siyuan.sql(`select a.block_id as id, a.value as v, b.content as c from attributes a
                left join blocks b on b.id = a.block_id
                where a.name = '${ANNOTATIONS_ATTR}'
                and a.block_id in (select id from blocks where root_id = '${docID}') limit 10000`);
            if (seq !== annoSeq) return;
            annoItems = annoPanelFromRows(rows as any);
        } catch (e) {
            console.error("CommentBox loadAnnos:", e);
            if (seq === annoSeq) annoItems = [];
        }
        if (seq === annoSeq) annoLoaded = true;
    }

    // 开关/文档切换立即载入；ws 事务（新加批注等）trailing debounce 200ms 重载（reasoning P2-3）
    $effect(() => {
        void wsGen;
        if ($commentBoxAnnotations && docID) {
            if (annoThrottleTimer != null) clearTimeout(annoThrottleTimer);
            annoThrottleTimer = setTimeout(() => {
                annoThrottleTimer = undefined;
                loadAnnos();
            }, 200);
        }
    });

    function vipLocate(ref: Ref) {
        if (lastVerifyResult()) {
            locate(ref.def_block_id);
        } else {
            const key = "tomato comment locate limit 2025-06-22 10:41:02";
            const count = parseInt(getGlobal(key)) || 0;
            setGlobal(key, (count + 1).toString());
            if (count < 3) {
                locate(ref.def_block_id);
            } else {
                siyuan.pushMsg(
                    `${tomatoI18n.vip功能}: ${tomatoI18n.在当前文档中定位}`,
                );
            }
        }
    }
</script>

<div
    class="tomato-panel"
    data-skin={$commentBoxPanelSkin === "classic" ? undefined : $commentBoxPanelSkin}
    style:--tomato-card-h={$commentBoxMaxProtyleHeight + "px"}
>
    <div class="tomato-toolbar">
        <span class="tomato-toolbar__group tomato-toolbar__group--mode">
            <label
                class="tomato-toolbar__item"
                aria-label={tomatoI18n.文档模式说明}
                onmouseenter={(e) => showPanelTip(e.currentTarget)}
                onmouseleave={hidePanelTip}
            >
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
                    class="tomato-icon-btn"
                    aria-label={tomatoI18n.刷新文档正引 +
                        SPACE +
                        CommentBox刷新文档正引.w()}
                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                    onmouseleave={hidePanelTip}
                    onclick={() => {
                        _svelteCallback_doc_throttled(true);
                    }}><svg><use xlink:href="#iconRefresh"></use></svg></button
                >
            {:else}
                <label
                    class="tomato-toolbar__item"
                    aria-label={tomatoI18n.正引过滤说明}
                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                    onmouseleave={hidePanelTip}
                >
                    {tomatoI18n.正引}
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$commentBoxForwardRef}
                        onchange={() => commentBoxForwardRef.write()}
                    />
                </label>
                <label
                    class="tomato-toolbar__item"
                    aria-label={tomatoI18n.反引过滤说明}
                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                    onmouseleave={hidePanelTip}
                >
                    {tomatoI18n.反引}
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$commentBoxBackwardRef}
                        onchange={() => commentBoxBackwardRef.write()}
                    />
                </label>
                <label
                    class="tomato-toolbar__item"
                    aria-label={tomatoI18n.虚引过滤说明}
                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                    onmouseleave={hidePanelTip}
                >
                    {tomatoI18n.虚引}
                    <input
                        type="checkbox"
                        class="b3-switch"
                        bind:checked={$commentBoxVirtualRef}
                        onchange={() => commentBoxVirtualRef.write()}
                    />
                </label>
            {/if}
        </span>
        <span class="tomato-toolbar__group">
            <label
                class="tomato-toolbar__item"
                aria-label={tomatoI18n.批注分区说明}
                onmouseenter={(e) => showPanelTip(e.currentTarget)}
                onmouseleave={hidePanelTip}
            >
                {tomatoI18n.批注}
                <input
                    type="checkbox"
                    class="b3-switch"
                    bind:checked={$commentBoxAnnotations}
                    onchange={() => commentBoxAnnotations.write()}
                />
            </label>
            <button
                class="tomato-icon-btn"
                aria-label={tomatoI18n.收集批注说明}
                onmouseenter={(e) => showPanelTip(e.currentTarget)}
                onmouseleave={hidePanelTip}
                onclick={() => openAnnoCollectDialog(docID || events.docID)}
            >
                <svg><use xlink:href="#iconDownload"></use></svg>
            </button>
        </span>
        <span class="tomato-toolbar__group">
            <label
                class="tomato-toolbar__item"
                aria-label={tomatoI18n.预览高度说明}
                onmouseenter={(e) => showPanelTip(e.currentTarget)}
                onmouseleave={hidePanelTip}
            >
                <input
                    type="number"
                    min="1"
                    class="b3-text-field tomato-num"
                    bind:value={$commentBoxMaxProtyleHeight}
                    onchange={() => {
                        // 清空时 number 输入 bind 进来的是 null，小数/0/负值/非有限数同非法
                        //——统一回落默认，防 --tomato-card-h 拼出 "nullpx"/"0.5px" 与空值落盘
                        //（min="1" 只钳 spinner，手输小数须在此拦）；落盘在 change（失焦/回车）
                        // 而非 input，消除逐键 write 的乱序中间值
                        const v = $commentBoxMaxProtyleHeight as number | null;
                        if (typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v) || v <= 0) {
                            commentBoxMaxProtyleHeight.set(commentBoxMaxProtyleHeight.default());
                        }
                        commentBoxMaxProtyleHeight.write();
                        onCommentBoxMaxProtyleHeightChange();
                    }}
                />
                <span class="tomato-toolbar__unit">px</span>
            </label>
        </span>
    </div>

    {#if $commentBoxShowID}
        <div class="tomato-ids">
            {#if notebookId}
                <button
                    class="tomato-id-chip"
                    aria-label={`${tomatoI18n.复制} Box id`}
                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                    onmouseleave={hidePanelTip}
                    onclick={() => copyText(notebookId)}
                >
                    <span class="tomato-id-chip__label">Box</span>
                    <span class="tomato-id-chip__value">{notebookId}</span>
                </button>
            {/if}
            {#if docID}
                <button
                    class="tomato-id-chip"
                    aria-label={`${tomatoI18n.复制} Doc id`}
                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                    onmouseleave={hidePanelTip}
                    onclick={() => copyText(docID)}
                >
                    <span class="tomato-id-chip__label">Doc</span>
                    <span class="tomato-id-chip__value">{docID}</span>
                </button>
            {/if}
            {#if listID}
                <button
                    class="tomato-id-chip"
                    aria-label={`${tomatoI18n.复制} List id`}
                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                    onmouseleave={hidePanelTip}
                    onclick={() => copyText(listID)}
                >
                    <span class="tomato-id-chip__label">List</span>
                    <span class="tomato-id-chip__value">{listID}</span>
                </button>
            {/if}
            {#if superID}
                <button
                    class="tomato-id-chip"
                    aria-label={`${tomatoI18n.复制} Super id`}
                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                    onmouseleave={hidePanelTip}
                    onclick={() => copyText(superID)}
                >
                    <span class="tomato-id-chip__label">Super</span>
                    <span class="tomato-id-chip__value">{superID}</span>
                </button>
            {/if}
            {#if quoteID}
                <button
                    class="tomato-id-chip"
                    aria-label={`${tomatoI18n.复制} Quote id`}
                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                    onmouseleave={hidePanelTip}
                    onclick={() => copyText(quoteID)}
                >
                    <span class="tomato-id-chip__label">Quote</span>
                    <span class="tomato-id-chip__value">{quoteID}</span>
                </button>
            {/if}
            {#if currentID}
                <button
                    class="tomato-id-chip"
                    aria-label={`${tomatoI18n.复制} Block id`}
                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                    onmouseleave={hidePanelTip}
                    onclick={() => copyText(currentID)}
                >
                    <span class="tomato-id-chip__label">Block</span>
                    <span class="tomato-id-chip__value">{currentID}</span>
                </button>
            {/if}
        </div>
    {/if}

    {#if $commentBoxStaticOutlink}
        <div class="tomato-grid">
            {#each refs as ref (ref.def_block_root_id)}
                <div class="tomato-card">
                    <div class="tomato-card__head">
                        <span class="tomato-card__title">{ref.content}</span>
                        <button
                            class="tomato-icon-btn"
                            aria-label={`${tomatoI18n.vip功能}: ${tomatoI18n.在当前文档中定位}`}
                            onmouseenter={(e) => showPanelTip(e.currentTarget)}
                            onmouseleave={hidePanelTip}
                            onclick={() => vipLocate(ref)}
                        >
                            <svg><use xlink:href="#iconVIP"></use></svg>
                        </button>
                        <button
                            class="tomato-icon-btn"
                            aria-label={tomatoI18n.定位 + SPACE + ref.content}
                            onmouseenter={(e) => showPanelTip(e.currentTarget)}
                            onmouseleave={hidePanelTip}
                            onclick={() => locate(ref.def_block_root_id)}
                        >
                            <svg><use xlink:href="#iconFocus"></use></svg>
                        </button>
                    </div>
                    <div
                        class="docContent tomato-card__body"
                        {@attach renderDocContent(ref)}
                    ></div>
                </div>
            {/each}
        </div>
        {#if docLoaded && refs.length === 0}
            <div class="tomato-empty">
                <svg><use xlink:href="#iconInbox"></use></svg>
                <span>{tomatoI18n.暂无引用}</span>
            </div>
        {/if}
    {:else}
        <div class="tomato-grid">
            {#each backLinks as backLink (backLink.blockID)}
                <div class="tomato-card">
                    <div class="tomato-card__head">
                        <span
                            class="tomato-badge tomato-badge--{backLink.row.refKind}"
                        >{backLink.row.data}</span>
                        <span class="tomato-card__title"
                            >{backLink.row?.content ?? tomatoI18n.定位}</span
                        >
                        <button
                            class="tomato-icon-btn"
                            aria-label={tomatoI18n.定位 +
                                SPACE +
                                (backLink.row?.content ?? tomatoI18n.定位)}
                            onmouseenter={(e) => showPanelTip(e.currentTarget)}
                            onmouseleave={hidePanelTip}
                            onclick={() => locate(backLink.blockID)}
                        >
                            <svg><use xlink:href="#iconFocus"></use></svg>
                        </button>
                        <!-- svelte-ignore a11y_consider_explicit_label -->
                        <button
                            class="tomato-icon-btn"
                            aria-label={tomatoI18n.收起卡片}
                            id={getButtonID(backLink)}
                            onmouseenter={(e) => showPanelTip(e.currentTarget)}
                            onmouseleave={hidePanelTip}
                            onclick={() => toggle(backLink)}
                        ><!-- 初始即有图标：懒加载卡未进视口时 doUnFold 尚未注入（reasoning P2-5） -->{@html
                                SVG_UP
                            }</button>
                        <button
                            class="tomato-icon-btn tomato-tail"
                            aria-label={tomatoI18n.复制为引用}
                            onmouseenter={(e) => showPanelTip(e.currentTarget)}
                            onmouseleave={hidePanelTip}
                            onclick={() => copyRef(backLink)}
                        >
                            <svg><use xlink:href="#iconCopy"></use></svg>
                        </button>
                        <button
                            class="tomato-icon-btn tomato-icon-btn--danger"
                            aria-label={tomatoI18n.删除}
                            onmouseenter={(e) => showPanelTip(e.currentTarget)}
                            onmouseleave={hidePanelTip}
                            onclick={() => deleteRef(backLink)}
                        >
                            <svg><use xlink:href="#iconTrashcan"></use></svg>
                        </button>
                    </div>
                    <div
                        id={getProtyleID(backLink)}
                        class="tomato-card__body"
                        {@attach mountProtyle(backLink)}
                    ></div>
                </div>
            {/each}
        </div>
        {#if blockLoaded && backLinks.length === 0 && ($commentBoxForwardRef || $commentBoxBackwardRef || $commentBoxVirtualRef)}
            <div class="tomato-empty">
                <svg><use xlink:href="#iconInbox"></use></svg>
                <span>{tomatoI18n.暂无引用}</span>
            </div>
        {/if}
    {/if}

    {#if $commentBoxAnnotations}
        <div class="tomato-anno-list">
            {#each annoItems as item (`${item.hostID}#${item.entry.id}`)}
                <div
                    class="tomato-anno-item"
                    aria-label={tomatoI18n.定位}
                    role="button"
                    tabindex="0"
                    onmouseenter={(e) => showPanelTip(e.currentTarget)}
                    onmouseleave={hidePanelTip}
                    onclick={() => locate(item.hostID)}
                    onkeydown={(e) => {
                        if (e.key === "Enter") locate(item.hostID);
                    }}
                >
                    <div class="tomato-anno-item__meta">
                        {#if item.entry.sel == null}
                            <span class="tomato-badge tomato-badge--anno"
                                >{tomatoI18n.块级}</span
                            >
                        {/if}
                        <span class="tomato-anno-item__time"
                            >{fmtAnnoTime(item.entry.time)}</span
                        >
                    </div>
                    {#if item.entry.sel?.txt}
                        <div class="tomato-anno-item__quote">
                            {item.entry.sel.txt}
                        </div>
                    {/if}
                    <div class="tomato-anno-item__text">
                        {@html annoTextToHtml(item.entry.text)}
                    </div>
                </div>
            {/each}
            {#if annoLoaded && annoItems.length === 0}
                <div class="tomato-empty">
                    <svg><use xlink:href="#iconInbox"></use></svg>
                    <span>{tomatoI18n.暂无批注}</span>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    /* =====================================================================
       番茄 CommentBox 面板 · 视觉层（视觉稿 v1 · 2026-08-31，
       唯一事实源 docs/tomato-commentbox-visual-spec.md）
       颜色全走官方 b3 变量；透明度叠加用 color-mix（变量派生，零硬编码）
       ===================================================================== */

    /* ---- 面板壳：主色一处声明（换批注主色案只改这一行，见 spec §6） ---- */
    .tomato-panel {
        /* 批注主色：b 案 theme-secondary（亮 #ff9200 / 暗 #f3a92f）；a 案改 var(--b3-font-color12) */
        --tomato-anno-color: var(--b3-theme-secondary);
        /* 徽章底色浓度：亮 12%（暗 15%，下方覆盖）——四徽章共享一个旋钮 */
        --tomato-badge-mix: 12%;

        display: flex;
        flex-direction: column;
        gap: 8px;            /* 8=分区间距基数，替代旧 space-between 的不可预测推开 */
        padding: 8px;        /* 8=面板内边距基数，工具栏负边距以此对齐 */
    }

    :global(html[data-theme-mode="dark"]) .tomato-panel {
        --tomato-badge-mix: 15%;   /* 暗底同浓度偏隐，提一档（对齐 anno spec 既有档位） */
    }

    /* ---- 筛选工具栏 ---- */
    .tomato-toolbar {
        position: sticky;                        /* 滚动时筛选常驻 */
        top: 0;
        z-index: 2;                              /* 盖过卡片 hover 层即可 */
        background: var(--b3-theme-background);  /* 不透明底，滚动时不透卡 */
        display: flex;
        flex-wrap: wrap;                         /* 200px 窄板换行不溢出 */
        align-items: stretch;    /* P1-1 修复：三舱同排等高（各舱跟本行最高舱，舱内件仍居中）；
                                    原 center 会露出 5~7px 顶/底边错位——三舱内容件高天然不等
                                    （刷新钮 22/文字+switch 17/输入框 24），stretch 自适应免硬编码 */
        gap: 6px 8px;            /* 行距 6：舱自带 1px 描边，换行两描边间 4px 视觉过近；列距 8 不变 */
        padding: 6px 8px;        /* 6 纵贴密度，8 横与面板对齐 */
        margin: -8px -8px 0;     /* 抵消面板 padding 实现通栏 */
        border-bottom: 1px solid var(--b3-border-color);  /* 官方线条档划界 */
    }

    /* ---- 分组舱（v3：divider 的替代物——分组从 1px 小竖线升级为轮廓清晰的可交互容器） ---- */
    .tomato-toolbar__group {
        display: inline-flex;
        align-items: center;
        gap: 6px;                                  /* 舱内件间：比 item 内文字-switch 的 4px 松一档 */
        padding: 2px 6px;                          /* 舱总高 20px：switch 14 + 4 内衬 + 2 描边 */
        border: 1px solid var(--b3-border-color);  /* 官方线条档=全面板卡片同款边，可感性有保 */
        border-radius: 4px;                        /* 4=小件圆角基数（对齐徽章/图标钮/chip） */
        transition: background 0.15s;
    }

    .tomato-toolbar__group:hover {
        background: var(--b3-list-hover);          /* 热区反馈：整舱=「这组可交互」，对齐批注条目整行 hover 先例 */
    }

    .tomato-toolbar__item {
        display: inline-flex;
        align-items: center;
        gap: 4px;              /* 文字与 switch 的最小可读缝 */
        font-size: 12px;       /* 工具栏降一档：14 基准下的密度档 */
        color: var(--b3-theme-on-background);  /* 控制条是高频交互件，正文色级（次级灰读似说明文字） */
        margin: 0;
    }

    /* ---- 高度单位注记（v3：给裸数字一个语境） ---- */
    .tomato-toolbar__unit {
        font-size: 11px;                   /* 辅文最小档（对齐徽章/时间戳） */
        color: var(--b3-theme-on-surface); /* 注记不是控件，次级色与数字区分 */
        opacity: 0.62;                     /* 对齐时间戳/chip label 既有透明度档 */
        margin-left: -2px;                 /* 贴向数字：输入框自带 padding 2px 4px，-2 视觉成组 */
    }

    .tomato-num {
        width: 48px;                          /* 12px tabular 数字 4 位有富余，给右侧 px 让位 */
        font-variant-numeric: tabular-nums;   /* 数字跳动时宽度不抖 */
        padding: 2px 4px;
        margin: 0;
    }

    /* spinner 兜底隐藏：实测本环境 focus 态已被压制不出箭头，防跨环境（不同
       Chromium/Electron 版本）复活后挤爆 48px 窄框——48px 容不下数字+箭头 */
    .tomato-num::-webkit-inner-spin-button,
    .tomato-num::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* ---- 图标按钮（emoji 全退役的承载件） ---- */
    .tomato-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;                  /* 触达 ≥20px 且贴 dock 密度 */
        height: 22px;
        flex-shrink: 0;               /* 窄板 title 收缩时按钮永不变形 */
        border: none;
        border-radius: 4px;           /* 4=小件圆角基数 */
        background: transparent;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
        padding: 0;
        transition: background 0.15s; /* ≤200ms 约束内 */
    }

    .tomato-icon-btn svg {
        width: 14px;         /* 思源 toolbar__icon 惯例尺寸 */
        height: 14px;
    }

    .tomato-icon-btn:hover {
        background: var(--b3-list-hover);   /* 官方 hover 令牌，亮暗自适应 */
    }

    .tomato-icon-btn--danger:hover {
        color: var(--b3-theme-error);   /* 破坏动作 hover 转语义危险色 */
    }

    .tomato-tail { margin-left: auto; }   /* 复制+删除推右，远离高频定位钮 */

    /* ---- 卡片网格：窄板不溢出的关键一行 ---- */
    .tomato-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(400px, 100%), 1fr));
        /* min(400px,100%)：400=双列设计卡宽，100% 兜住 200–400px 窄板恒单列 */
        gap: 8px;              /* 8=卡片间距基数；替代旧 5px margin 自管间距 */
        align-items: start;    /* 行内卡不等高时不拉伸 */
    }

    /* ---- 卡片壳 ---- */
    .tomato-card {
        border: 1px solid var(--b3-border-color);   /* 替换旧 font-background5 误用当边框 */
        border-radius: var(--b3-border-radius);     /* 6px 官方令牌 */
        padding: 6px 8px 8px;   /* 顶 6（head 自高 22）底 8：呼吸不松 */
        transition: background 0.15s;
    }

    .tomato-card:hover {
        background: var(--b3-theme-surface);   /* hover 浮出一档表面 */
    }

    .tomato-card__head {
        display: flex;
        align-items: center;
        gap: 4px;              /* head 内件最小缝 */
        min-height: 22px;      /* 与图标钮同高压齐 */
    }

    .tomato-card__title {
        flex: 1 1 auto;
        min-width: 0;                    /* flex 子项省略号的必要前提 */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;                 /* 辅助线索降一档，不与正文争 */
        color: var(--b3-theme-on-surface);
    }

    .tomato-card__body { min-height: 10px; }   /* 沿用旧值：空内容卡不塌条 */

    /* ---- 类型徽章 ---- */
    .tomato-badge {
        display: inline-block;
        font-size: 11px;            /* 辅文最小可读档 */
        line-height: 1;             /* 高度全交 padding 控 */
        padding: 3px 6px;           /* 成 17px 小胶囊，居中于 22px head */
        border-radius: 4px;         /* 4=小件圆角基数 */
        font-weight: 500;           /* 11px 上比 400 立得住、比 600 不吵 */
        letter-spacing: 0.02em;     /* 微开字距提辨识 */
        flex-shrink: 0;
        white-space: nowrap;
    }

    .tomato-badge--forward {
        color: var(--b3-theme-primary);   /* 正引=主色蓝 */
        background: color-mix(in srgb, var(--b3-theme-primary) var(--tomato-badge-mix), transparent);
    }

    .tomato-badge--backward {
        color: var(--b3-protyle-inline-blockref-color, var(--b3-font-color10));   /* 反引=编辑器块引用紫，缺定义主题兜底 */
        background: color-mix(in srgb, var(--b3-protyle-inline-blockref-color, var(--b3-font-color10)) var(--tomato-badge-mix), transparent);
    }

    .tomato-badge--virtual {
        color: var(--b3-theme-on-surface);   /* 虚引=中性灰，饱和色会谎报真链接 */
        background: color-mix(in srgb, var(--b3-theme-on-surface) var(--tomato-badge-mix), transparent);
        border: 1px dashed var(--b3-border-color);   /* 虚线框=「未落定」的线型表达 */
        padding: 2px 5px;    /* 有 1px 边框，内减回 3/6 总外形不变 */
    }

    .tomato-badge--anno {
        color: var(--tomato-anno-color);   /* 批注=番茄主色（壳声明处换案） */
        background: color-mix(in srgb, var(--tomato-anno-color) var(--tomato-badge-mix), transparent);
    }

    /* ---- 卡内图片：高图回归修复（选择器含运行时挂载结构，须 :global） ---- */
    .tomato-card__body :global(.protyle) {
        overflow-y: auto;    /* maxHeight 容器必须可滚：永不再裁细缝（兜底，多数卡已不触发） */
    }

    .tomato-card__body :global(span.img) {
        text-align: center;    /* 思源图包在 span.img，居中在其上生效 */
    }

    .tomato-card__body :global(img) {
        max-width: 100%;     /* 不超卡宽 */
        width: auto;         /* 等比缩放三件套之一 */
        height: auto;
        max-height: 180px;   /* 硬兜底：var() 值非法时整条声明失效（invalid-at-computed-time 无 fallback），此行保底 */
        max-height: min(calc(var(--tomato-card-h, 300px) * 0.6), 180px);
        /* 跟随用户高度设置（300 出厂 ×0.6=180 封顶）；px 变量+calc，不赌百分比解析 */
        object-fit: contain; /* 双约束下保比例 */
        display: block;            /* 单图独立成行 */
        margin-inline: auto;       /* 居中；多图并排需求出现时删掉 display:block 两行 */
    }

    /* 文档文本卡（预防约束：白名单当前无图，未来含图不炸版） */
    .docContent {
        white-space: pre-wrap;      /* 沿用现状 */
        user-select: text;          /* 沿用现状 */
        overflow: auto;             /* maxHeight 由 JS 内联写入，行为不变 */
        font-size: 12px;            /* 密度优先：主读内容取 12/1.6 密读档 */
        line-height: 1.6;           /* 长文行高，中文不挤 */
        word-break: break-word;     /* 长 id/URL 不撑卡 */
    }

    .docContent :global(img) {
        max-width: 100%;
        width: auto;
        height: auto;
        max-height: 180px;   /* 硬兜底，同卡内策略 */
        max-height: min(calc(var(--tomato-card-h, 300px) * 0.6), 180px);
        object-fit: contain;
    }

    /* ---- 批注分区 ---- */
    .tomato-anno-list {
        display: flex;
        flex-direction: column;
    }

    .tomato-anno-item {
        padding: 6px 8px;         /* 行式条目，比卡密一档 */
        border-radius: 4px;       /* hover 底成圆角行 */
        cursor: pointer;          /* 整行可点=跳原块 */
        margin-bottom: 4px;       /* 4=行间距基数，配 hover 不用分隔线 */
        transition: background 0.15s;
    }

    .tomato-anno-item:hover {
        background: var(--b3-list-hover);
    }

    .tomato-anno-item__meta {
        display: flex;
        align-items: center;
        gap: 4px;
        min-height: 17px;       /* 与徽章同高 */
    }

    .tomato-anno-item__time {
        margin-left: auto;              /* 时间恒右 */
        font-size: 11px;                /* meta 档 */
        opacity: 0.62;                  /* 沿用 anno spec meta 透明度 */
        font-variant-numeric: tabular-nums;   /* 定宽右齐成列 */
    }

    .tomato-anno-item__quote {
        font-size: 12px;
        color: var(--b3-theme-on-surface);
        padding-left: 6px;              /* 2px 色条与文字的缝 */
        border-left: 2px solid var(--tomato-anno-color);   /* 引文左缘条=主色 */
        /* 编辑器同款虚线：跨面一致的身份标记 */
        text-decoration-line: underline;
        text-decoration-style: dashed;
        text-decoration-color: var(--tomato-anno-color);
        text-decoration-thickness: var(--tomato-anno-underline-width, 2px);   /* 复用下划线粗细设置，缺省 2 */
        text-underline-offset: 3px;           /* anno spec 同款 */
        text-decoration-skip-ink: none;       /* 虚线节奏一致 */
        display: -webkit-box;
        -webkit-line-clamp: 2;          /* 快照是定位线索非正文，两行封顶 */
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 4px;
    }

    .tomato-anno-item__text {
        font-size: 12px;             /* 密读档；不加下划线——下划线只属于 quote */
        line-height: 1.6;
        word-break: break-word;
        color: var(--b3-theme-on-background);
    }

    /* 批注富文本子集（innerHTML 动态注入，须 :global；参数照抄 anno-pop__text 档、字号 12） */
    .tomato-anno-item__text :global(p) { margin: 0 0 4px; }
    .tomato-anno-item__text :global(ul),
    .tomato-anno-item__text :global(ol) { margin: 0 0 4px; padding-left: 18px; }
    .tomato-anno-item__text :global(li) { margin: 2px 0; }
    .tomato-anno-item__text :global(strong) { font-weight: 600; }
    .tomato-anno-item__text :global(code) {
        font-size: 0.92em;
        padding: 1px 4px;
        border-radius: 4px;
        background: var(--b3-theme-surface-lighter);   /* 官方 code 底令牌 */
    }
    .tomato-anno-item__text :global(a) { color: var(--b3-protyle-inline-link-color); }
    .tomato-anno-item__text :global(> :last-child) { margin-bottom: 0; }

    /* ---- ShowID 行 ---- */
    .tomato-ids {
        display: flex;
        flex-wrap: wrap;     /* 六枚 chips 流式换行 */
        gap: 4px;            /* 4=chip 间距基数 */
    }

    .tomato-id-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;      /* 17px 高小件，与徽章同档 */
        border: none;
        border-radius: 4px;
        background: var(--b3-protyle-code-background);   /* 代码底=「这是 id」心智，亮暗自适应 */
        font-family: var(--b3-font-family-code);   /* 等宽是 id 惯用形态 */
        font-size: 11px;
        color: var(--b3-theme-on-surface);
        cursor: pointer;
    }

    .tomato-id-chip__label { opacity: 0.62; }   /* 弱化前缀突出 id 本体 */

    .tomato-id-chip__value {
        max-width: 72px;              /* 22 字符 id 截到 ~10 字符 */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* ---- 空态 ---- */
    .tomato-empty {
        padding: 24px 0;     /* 长面板里给空态呼吸 */
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;            /* 图标与文字一档缝 */
        font-size: 12px;
        color: var(--b3-empty-color);   /* 官方空态色令牌 */
    }

    .tomato-empty svg { width: 20px; height: 20px; opacity: 0.5; }   /* 装饰非交互 */

    /* =====================================================================
       □2 面板皮肤三档（spec §10，2026-08-31）：classic=上方 v1 现状（默认，无属性零命中）；
       差异一律 .tomato-panel[data-skin] 前缀追加，v1 规则一行不动
       ===================================================================== */

    /* ============ 皮肤 candy 糖霜（可爱向） ============ */
    .tomato-panel[data-skin="candy"] .tomato-card {
        border-radius: 12px;
        /* 奶油暖底：6% 批注主色混 surface（≈奶油暖白，浮于面板底）——surface-lighter
           在亮色主题实测比 surface 暗一档（224 vs 246，复核 P2-1 实锤），不能用 */
        background: color-mix(in srgb, var(--tomato-anno-color) 6%, var(--b3-theme-surface));
        box-shadow: 0 1px 3px color-mix(in srgb, black 5%, transparent);
        transition: background 0.15s, box-shadow 0.15s, transform 0.15s, border-color 0.15s;
    }
    .tomato-panel[data-skin="candy"] .tomato-card:hover {
        background: color-mix(in srgb, var(--tomato-anno-color) 8%, var(--b3-theme-surface));
        transform: translateY(-1px);
        box-shadow: 0 3px 10px color-mix(in srgb, black 9%, transparent);
    }
    /* hover 边框染类型色：:has() 渐进增强（思源桌面=Electron Chromium 支持；
       不支持环境仅损失染边一档，底色/阴影/位移反馈不受影响） */
    .tomato-panel[data-skin="candy"] .tomato-card:has(.tomato-badge--forward):hover {
        border-color: color-mix(in srgb, var(--b3-theme-primary) 35%, var(--b3-border-color));
    }
    .tomato-panel[data-skin="candy"] .tomato-card:has(.tomato-badge--backward):hover {
        border-color: color-mix(in srgb, var(--b3-protyle-inline-blockref-color, var(--b3-font-color10)) 35%, var(--b3-border-color));
    }
    .tomato-panel[data-skin="candy"] .tomato-card:has(.tomato-badge--anno):hover {
        border-color: color-mix(in srgb, var(--tomato-anno-color) 35%, var(--b3-border-color));
    }
    /* 徽章糖化：胶囊 + 首位色点 */
    .tomato-panel[data-skin="candy"] .tomato-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border-radius: 999px;
        padding: 3px 7px;
    }
    .tomato-panel[data-skin="candy"] .tomato-badge::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: currentColor;
        flex-shrink: 0;
    }
    .tomato-panel[data-skin="candy"] .tomato-badge--virtual { padding: 2px 6px; }  /* 1px 虚线框内减，手法同 v1 */
    /* 件圆化 */
    .tomato-panel[data-skin="candy"] .tomato-icon-btn { border-radius: 999px; }
    .tomato-panel[data-skin="candy"] .tomato-id-chip { border-radius: 999px; }
    /* 批注条目：果酱 hover */
    .tomato-panel[data-skin="candy"] .tomato-anno-item { border-radius: 8px; }
    .tomato-panel[data-skin="candy"] .tomato-anno-item:hover {
        background: color-mix(in srgb, var(--tomato-anno-color) 7%, transparent);
    }
    /* 空态软圆底（content-box 必须显式回置：主题若全局 border-box，20px 会被 padding 吃掉） */
    .tomato-panel[data-skin="candy"] .tomato-empty svg {
        box-sizing: content-box;
        padding: 10px;
        background: color-mix(in srgb, var(--tomato-anno-color) 10%, transparent);
        border-radius: 999px;
        opacity: 0.8;
    }

    /* ============ 皮肤 paper 纸墨（质感/层次向） ============ */
    /* 浓度旋钮整档提升：一处声明四徽章生效 */
    .tomato-panel[data-skin="paper"] { --tomato-badge-mix: 16%; }
    :global(html[data-theme-mode="dark"]) .tomato-panel[data-skin="paper"] { --tomato-badge-mix: 20%; }

    .tomato-panel[data-skin="paper"] .tomato-card {
        border-radius: 8px;
        background: var(--b3-theme-surface);
        box-shadow:
            0 1px 2px color-mix(in srgb, black 4%, transparent),
            0 2px 8px color-mix(in srgb, black 3%, transparent);
        transition: box-shadow 0.15s, border-color 0.15s;
    }
    .tomato-panel[data-skin="paper"] .tomato-card:hover {
        border-color: color-mix(in srgb, var(--b3-theme-on-surface) 18%, var(--b3-border-color));
        box-shadow:
            0 1px 2px color-mix(in srgb, black 4%, transparent),
            0 4px 12px color-mix(in srgb, black 6%, transparent);
    }
    /* 工具栏质感化：仍通栏 sticky，不动结构（□5 管布局/tooltip，本期只做质感层） */
    .tomato-panel[data-skin="paper"] .tomato-toolbar {
        background: var(--b3-theme-surface);
        box-shadow: 0 1px 2px color-mix(in srgb, black 3%, transparent);
    }
    /* 徽章印刷标签化：描边 + 内减保尺寸 */
    .tomato-panel[data-skin="paper"] .tomato-badge { font-weight: 600; }
    .tomato-panel[data-skin="paper"] .tomato-badge--forward {
        border: 1px solid color-mix(in srgb, var(--b3-theme-primary) 30%, transparent);
        padding: 2px 5px;
    }
    .tomato-panel[data-skin="paper"] .tomato-badge--backward {
        border: 1px solid color-mix(in srgb, var(--b3-protyle-inline-blockref-color, var(--b3-font-color10)) 30%, transparent);
        padding: 2px 5px;
    }
    .tomato-panel[data-skin="paper"] .tomato-badge--anno {
        border: 1px solid color-mix(in srgb, var(--tomato-anno-color) 30%, transparent);
        padding: 2px 5px;
    }
    .tomato-panel[data-skin="paper"] .tomato-badge--virtual {
        border-color: color-mix(in srgb, var(--b3-theme-on-surface) 30%, transparent);  /* 仍 dashed，仅加深 */
    }
    /* 图标排降噪：只收卡 head 内（评审 P2-2——无差别命中会波及工具栏刷新钮，
       弱读似禁用）；danger:hover 须重声明防被本块压掉（特异性同序后胜） */
    .tomato-panel[data-skin="paper"] .tomato-card__head .tomato-icon-btn {
        color: color-mix(in srgb, var(--b3-theme-on-surface) 62%, transparent);
    }
    .tomato-panel[data-skin="paper"] .tomato-card__head .tomato-icon-btn:hover { color: var(--b3-theme-on-surface); }
    .tomato-panel[data-skin="paper"] .tomato-card__head .tomato-icon-btn--danger:hover { color: var(--b3-theme-error); }
    /* ID chip 同一印刷语言 */
    .tomato-panel[data-skin="paper"] .tomato-id-chip {
        border: 1px solid var(--b3-border-color);
        padding: 1px 5px;
    }
    /* 批注区券边 */
    .tomato-panel[data-skin="paper"] .tomato-anno-list {
        border-top: 1px dashed var(--b3-border-color);
        padding-top: 8px;
    }
    .tomato-panel[data-skin="paper"] .tomato-anno-item { border-radius: 6px; }

    /* ============ 皮肤 airy 疏朗（密度/留白向） ============ */
    .tomato-panel[data-skin="airy"] { padding: 12px; gap: 12px; }
    .tomato-panel[data-skin="airy"] .tomato-toolbar {
        padding: 8px 12px;
        margin: -12px -12px 0;   /* 负边距跟随壳 padding 成对改，缺一就错位 */
    }
    .tomato-panel[data-skin="airy"] .tomato-grid { gap: 12px; }
    .tomato-panel[data-skin="airy"] .tomato-card { padding: 10px 12px 12px; }
    .tomato-panel[data-skin="airy"] .tomato-card__head { min-height: 24px; }
    .tomato-panel[data-skin="airy"] .tomato-icon-btn { width: 24px; height: 24px; }
    .tomato-panel[data-skin="airy"] .tomato-card__title { font-size: 13px; }
    .tomato-panel[data-skin="airy"] .docContent { font-size: 13px; line-height: 1.7; }
    .tomato-panel[data-skin="airy"] .tomato-anno-item { padding: 8px 10px; margin-bottom: 6px; border-radius: 6px; }
    .tomato-panel[data-skin="airy"] .tomato-anno-item__quote { font-size: 13px; margin-bottom: 6px; }
    .tomato-panel[data-skin="airy"] .tomato-anno-item__text { font-size: 13px; line-height: 1.7; }
    .tomato-panel[data-skin="airy"] .tomato-empty { padding: 32px 0; }

    /* ============ v3 工具条分组舱 · 三皮肤适配（spec §11.3） ============ */
    /* candy 果酱胶囊舱：「件圆化」语言先例（icon-btn/id-chip 999px）；果酱底对齐
       anno-item hover 7% 档家族，深度红线沿 10.6「15% 底盖字」结论，6% 余量充足 */
    .tomato-panel[data-skin="candy"] .tomato-toolbar__group {
        border-radius: 999px;
        background: color-mix(in srgb, var(--tomato-anno-color) 6%, transparent);
        border-color: color-mix(in srgb, var(--tomato-anno-color) 20%, var(--b3-border-color));
    }
    .tomato-panel[data-skin="candy"] .tomato-toolbar__group:hover {
        background: color-mix(in srgb, var(--tomato-anno-color) 10%, transparent);  /* hover 提浓一档 */
    }
    /* paper 印刷描边舱：静置即「印刷标签」（同卡 hover 边 18% 混入式，10.4 #2）；
       工具条已有 surface+阴影底（10.4 #3），舱不叠底色，层次交给既有明度差 */
    .tomato-panel[data-skin="paper"] .tomato-toolbar__group {
        border-color: color-mix(in srgb, var(--b3-theme-on-surface) 18%, var(--b3-border-color));
    }
    /* airy 舱内衬提档：总高 22px；壳 padding 与工具栏负边距成对契约无接触（§11.6 #4） */
    .tomato-panel[data-skin="airy"] .tomato-toolbar__group {
        padding: 3px 8px;
    }
</style>
