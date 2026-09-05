// □3 批注编排层：创建链路（输入弹窗→写属性→写标记→失败铁律）+ .tomato-anno-block class
// 同步渲染 + hover 轻预览/点击查看气泡管理。
// □4 增量：编辑（气泡→编辑弹窗内嵌 Protyle 草稿）+ 删除（confirm→摘标记+删属性+跨块同步）
// + 草稿清扫接线（onload）。架构契约（handoff □3/□4；视觉规格随 2026-09-03 docs 清理入 git 历史）：
// - 数据先落（batchSetBlockAttrs），标记后写（setInlineMark 逐块）；写失败=toast+弹窗不关+输入保留
// - 选区级=blockSubRanges 拆最近块逐块挂同 href 锚点 span；块级=顶层块属性+左缘色条 class
// - 顺序防丢失：属性先写（kernel 是 source of truth，setInlineMark 重建块 DOM 时带上属性）
// - 删标记必须「先取现 IAL→摘链接后内容+IAL 一起写回」（updateBlock 裸 kramdown 会整段洗块属性，□3 实测）
// - 思源 window.eval 无模块缓存：document 监听+气泡宿主须 globalThis 跨代清理（overlays.ts 三层防线）
import { Dialog, confirm } from "siyuan";
import type { IProtyle } from "siyuan";
import { mount, unmount } from "svelte";
import { newID } from "stonev5-utils";
import { events, EventType } from "./libs/Events";
import { getAttribute, setAttribute, siyuan } from "./libs/utils";
import { debugLog } from "./libs/logUtils";
import { getDoOperations } from "./libs/blockUtils";
import { isReadonly } from "./libs/navUtils";
import { DestroyManager } from "./libs/destroyer";
import {
    commentBoxAddFlashCard,
    commentBoxAnnoBg,
    commentBoxAnnoEditorMode,
    commentBoxAnnoLineType,
    commentBoxAnnoMarkStyle,
    commentBoxAnnoUnderlineThickness,
} from "./libs/stores";
import {
    ANNOTATIONS_ATTR,
    ANNO_HREF_PREFIX,
    ANNO_TEXT_SOFT_LIMIT,
    appendAnnotation,
    clipAnnoSelText,
    findAnnotation,
    isOverLimit,
    makeAnnotation,
    parseAnnotations,
    removeAnnotation,
    updateAnnotation,
} from "./libs/annotationsAttr";
import { annoIdFromHref, blockSubRanges, hasBlockLevelEntry, type BlockSubRange } from "./libs/annoDom";
import { stripAllAnnoLinks, stripAnnoLinks } from "./libs/annoKramdown";
import { newDraftBlock, sweepDraftDoc } from "./libs/annoDraft";
import { clearChat } from "./libs/annoChat";
import { annoPop } from "./libs/annoPop";
import { tomatoI18n } from "./tomatoI18n";
import type { TomatoAnnotation } from "./libs/annotationsAttr";
import AnnoEdit from "./AnnoEdit.svelte";
import AnnoBubble from "./AnnoBubble.svelte";

const BLOCK_CLASS = "tomato-anno-block";
const ANNO_SPAN_SEL = 'span[data-type="a"][data-href^="#tomato-anno-"]';
/** 块级色条 hover 热区宽（spec §2.2：色条 3px + 向左外扩 10px ≈ 14px） */
const HOT_ZONE = 14;
/** 编辑弹窗尺寸/位置记忆 key（思源原生 dialogPosition 存储；data-key 同值挂 dialog 根，□3） */
const ANNO_EDIT_POSITION_ID = "tomato-anno-edit-dialog";
const CLEANUP_REG = "tomatoAnnoCleanup_zZmqus5PtYRi";

// 模块顶层即清一次：reload=新代模块加载时卸掉旧代 document 监听与气泡宿主
{
    const prev = (globalThis as any)[CLEANUP_REG];
    if (typeof prev === "function") {
        (globalThis as any)[CLEANUP_REG] = null;
        prev();
    }
}

function nextZ(): number {
    const s = (globalThis as any).siyuan;
    if (s && typeof s.zIndex === "number") {
        s.zIndex += 1;
        return s.zIndex;
    }
    return 999;
}

class Annotations {
    private previewTimer: ReturnType<typeof setTimeout> | null = null;
    private previewAnchor: HTMLElement | null = null;
    private popMode: "preview" | "view" | null = null;
    private cleanup: (() => void) | null = null;
    /** 写路径串行链（reasoning P1-1）：doSave/doEditSave/doRemove 都是「读旧串→变换→整串覆盖」，
     *  并发交叠会后写者基于旧读复活他方刚删的条目；类级 Promise 链强制互斥 */
    private writeChain: Promise<unknown> = Promise.resolve();
    /** openEdit 进行中标志（reasoning P1-1）：b3-dialog--open 守卫对刚建的弹窗有 50ms 盲区、
     *  且取数链有多个 await——双击「问 AI」/「编辑」会叠出两个弹窗；flag 填补 await 窗口 */
    private editOpening = false;

    private enqueue<T>(job: () => Promise<T>): Promise<T> {
        const run = this.writeChain.catch(() => { /* 前序失败不阻断后序 */ }).then(job);
        this.writeChain = run;
        return run;
    }

    onload(plugin?: { eventBus: { on: (name: string, cb: (e: { detail: { message: string; target: Element } }) => void) => void } }) {
        if (this.cleanup) return; // 防重复装载
        // □4 草稿清扫：清崩溃/中断残留草稿块（只清不建，未用过批注的用户零打扰；容忍重入）
        void sweepDraftDoc();
        // 抑制思源原生链接 tooltip 对批注标记的双浮层（vision P1-2）：
        // before-show-tooltip 官方钩子——target 是批注 span 时把 message 置空即不弹
        if (plugin) {
            plugin.eventBus.on("before-show-tooltip", (e) => {
                const t = e.detail?.target;
                if (t?.closest?.(ANNO_SPAN_SEL)) e.detail.message = "";
            });
        }
        // 渲染时机：文档加载/切换/点击编辑区 → class 同步（扫 DOM 属性，廉价无防抖必要）
        events.addListener("tomato annotations render 2026-08-31 09:00:00", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.switch_protyle
                || eventType == EventType.click_editorcontent
            ) {
                this.syncClasses(detail.protyle);
            } else if (eventType == EventType.destroy_protyle) {
                this.hidePop();
            }
        });
        // ws updateAttrs 触及批注键 → 失效重同步（自己的写入回声幂等；他端同步同款生效）
        events.addWsListener("tomato annotations ws 2026-08-31 09:00:00", (detail) => {
            for (const ops of getDoOperations(detail)) {
                // old 也要查：远端把批注键删空时 new 无此键（reasoning P2-6）
                const d = (ops as any).data;
                const hit = (a: unknown) => typeof a === "object" && a != null && ANNOTATIONS_ATTR in a;
                if (hit(d?.new) || hit(d?.old)) {
                    // 他端删条目后本地残留的孤儿标记就地回收（reasoning P1-2：远端路径）
                    const bid = (ops as any).id;
                    if (typeof bid === "string" && bid) {
                        this.divsById(bid).forEach((div) => {
                            this.sweepOrphanSpans(div);
                            this.syncDiv(div);
                        });
                    }
                    this.syncAll();
                    break;
                }
            }
        });

        const onDocMouseOver = (ev: MouseEvent) => {
            if (events.isMobile) return;
            const t = ev.target as Element;
            if (!t?.closest?.(".protyle-wysiwyg")) return; // 非编辑区短路（reasoning P2-7）
            const anchor = this.anchorFrom(t, ev.clientX);
            if (anchor === this.previewAnchor) return;
            this.cancelPreview();
            if (this.popMode === "preview") this.hidePop("preview");
            this.previewAnchor = anchor;
            if (!anchor) return;
            this.previewTimer = setTimeout(() => {
                this.previewTimer = null;
                this.show(anchor, "preview");
            }, 300);
        };
        const onDocClick = (ev: MouseEvent) => {
            const t = ev.target as Element;
            if (t?.closest?.(".tomato-anno-pop")) return;
            const anchor = this.anchorFrom(t, ev.clientX);
            if (anchor) {
                const entries = this.entriesFor(anchor);
                if (entries.length > 0) {
                    if (anchor.matches(ANNO_SPAN_SEL)) {
                        // 拦截思源锚点链接默认行为（linkMenu/跳转），批注标记只弹查看气泡
                        ev.preventDefault();
                        ev.stopPropagation();
                    }
                    this.cancelPreview();
                    this.show(anchor, "view");
                    return;
                }
                if (anchor.matches(ANNO_SPAN_SEL)) {
                    // 孤儿标记（属性条目已删/嵌套标记被 Lute 吞并的残留）：拦截默认行为防内核「找不到块」
                    ev.preventDefault();
                    ev.stopPropagation();
                }
            }
            this.hidePop("view");
        };
        const onDocKeydown = (ev: KeyboardEvent) => {
            if (ev.key === "Escape") this.hidePop("view");
        };
        const onDocScroll = (ev: Event) => {
            // 气泡自身滚动（长批注 320px 滚动区）与弹窗内滚动不关弹（reasoning P1-1；
            // 弹窗销毁期其内部 protyle 亦发 scroll，无视会误杀刚重开的气泡——e2e 实锤）
            if ((ev.target as Element)?.closest?.(".tomato-anno-pop, .b3-dialog")) return;
            this.cancelPreview();
            this.hidePop();
        };
        document.addEventListener("mouseover", onDocMouseOver);
        document.addEventListener("click", onDocClick, true);
        document.addEventListener("keydown", onDocKeydown, true);
        document.addEventListener("scroll", onDocScroll, true);

        let host: HTMLDivElement | null = null;
        let app: Record<string, unknown> | null = null;
        const ensureBubble = () => {
            if (host) return;
            host = document.createElement("div");
            document.body.appendChild(host);
            app = mount(AnnoBubble, {
                target: host,
                props: {
                    onEdit: (entry: TomatoAnnotation, anchor: HTMLElement) => this.openEdit(entry, anchor),
                    onAsk: (entry: TomatoAnnotation, anchor: HTMLElement) => this.openEdit(entry, anchor, { autoChat: true }),
                    onDelete: (entry: TomatoAnnotation, anchor: HTMLElement) => this.confirmRemove(entry, anchor),
                },
            }) as any;
        };
        this.ensureBubble = ensureBubble;

        this.cleanup = () => {
            this.cancelPreview();
            document.removeEventListener("mouseover", onDocMouseOver);
            document.removeEventListener("click", onDocClick, true);
            document.removeEventListener("keydown", onDocKeydown, true);
            document.removeEventListener("scroll", onDocScroll, true);
            try {
                if (app) unmount(app as any);
            } finally {
                host?.remove();
                host = null;
                app = null;
            }
            annoPop.set(null);
            this.popMode = null;
        };
        (globalThis as any)[CLEANUP_REG] = this.cleanup;
    }

    private ensureBubble: () => void = () => { };

    /** 禁用插件（onunload）路径的清理；reload 路径由模块顶层 CLEANUP_REG 兜（reasoning P1-2） */
    unload() {
        this.cleanup?.();
        this.cleanup = null;
        (globalThis as any)[CLEANUP_REG] = null;
    }

    // ---------- 创建链路（旧 findDivs 的新流程，入口语义不变：右键菜单/⌥⇧F） ----------

    /** 创建链路（入口语义不变：右键菜单/⌥⇧F）。□2 统一：弹窗=AnnoEdit 完整功能面
     *  （内嵌 Protyle 草稿+问 AI，与编辑同一 Dialog 形态/同一份尺寸记忆）；写链 doSave 不变 */
    async create(protyle: IProtyle) {
        const t0 = Date.now(); // debugLog 打点锚：量化创建弹窗各段耗时（debugging/plugin-eng/infra.md「插件运行时调试日志」节）
        if (this.editOpening || document.querySelector(".b3-dialog--open")) return; // 已有弹窗/取数中不重入
        this.editOpening = true;
        try {
            const { selected, rangeText, range } = await events.selectedDivs(protyle);
            debugLog("anno_create", `phase=selected ms=${Date.now() - t0}`, "anno");
            if (!selected || selected.length === 0) return;
            if ((await isReadonly(protyle)) === "true") {
                siyuan.pushMsg(tomatoI18n.文档只读);
                return;
            }
            const isSel = !!rangeText && !!range;
            // 选区 Range 须开弹窗前克隆快照（□2 统一后创建弹窗内嵌 protyle：用户点进草稿会使
            // 文档选区迁移，getRangeAt 返回的是选区持有的活引用、会被 protyle 原地改写——
            // 旧 AnnoInput 是 textarea 不动文档选区从未暴露；快照后 setInlineMark 不受弹窗交互影响）
            const selRange = isSel ? (range as Range).cloneRange() : undefined;
            // AI 上下文取数（□2 统一后创建也有问 AI）：宿主块原文+文档标题+前后邻居，openEdit 同款
            // 并行链（跨块只取首块，完整选区由 sel.txt 在 AnnoChat ctx 兜底）；失败/为空不阻塞创建
            const host = selected[0];
            const fetchSource = async (): Promise<string> => {
                const hostID = getAttribute(host, "data-node-id") ?? "";
                if (!hostID) return "";
                try {
                    const kd = (await siyuan.getBlockKramdown(hostID))?.kramdown ?? "";
                    return stripAllAnnoLinks(kd.replace(/\n\{:[^\n]*\}\s*$/, ""));
                } catch {
                    return "";
                }
            };
            // rich 模式预建草稿与入口取数并行（草稿块 SQL 索引等待是大头，重叠掉 fetchSource
            // 串行段；plain 模式不建——秒开链路建了即删纯浪费）
            const draftP = commentBoxAnnoEditorMode.get() === "plain" ? null : newDraftBlock("");
            const [source, ctxExtra] = await Promise.all([fetchSource(), this.chatContextExtra(host)]);
            debugLog("anno_create", `phase=source_ready ms=${Date.now() - t0}`, "anno");
            // 预生成 annoId 透传落库（makeAnnotation 可选 id）：创建期 AI 对话缓存 key 与落库条目同源，
            // 保存后重开编辑对话可续；重试保存同 id=doSave 先摘再挂（最新 text 落库，reasoning P1-1）
            const annoId = newID();
            const id = newID();
            const dm = new DestroyManager();
            const memo = !events.isMobile;
            const dialog = new Dialog({
                title: tomatoI18n.添加批注,
                content: `<div id="${id}" style="flex:1 1 auto;display:flex;flex-direction:column;min-height:0"></div>`,
                width: events.isMobile ? "90vw" : "720px",
                positionId: memo ? ANNO_EDIT_POSITION_ID : undefined,
                transparent: true,
                destroyCallback() {
                    dm.destroyBy("dialog");
                },
            });
            if (memo) dialog.element.setAttribute("data-key", ANNO_EDIT_POSITION_ID);
            this.editOpening = false; // Dialog 元素已入 DOM（--open 类内核 +50ms 才加，上方 entry 守卫的
            // await 窗口由 flag 兜底；此后的真防线=弹窗已在场拦截点击）
            dm.add("dialog", () => dialog.destroy());
            const svelte = mount(AnnoEdit, {
                target: dialog.element.querySelector("#" + id),
                props: {
                    dm,
                    annoId,
                    source,
                    selText: isSel ? rangeText : "",
                    initialText: "",
                    create: true,
                    blockCount: isSel ? 0 : selected.length,
                    draftReady: draftP,
                    ...ctxExtra,
                    onSave: (text: string) => this.enqueue(() =>
                        this.doSave(protyle, text, isSel ? { txt: clipAnnoSelText(rangeText) } : undefined, selRange, selected, annoId)),
                },
            });
            dm.add("svelte", () => unmount(svelte));
            debugLog("anno_create", `phase=dialog_mounted ms=${Date.now() - t0} mode=${commentBoxAnnoEditorMode.get()}`, "anno");
        } finally {
            this.editOpening = false;
        }
    }

    /** 属性先落（kernel=source of truth）→ 标记后写（setInlineMark 重建块 DOM 时带上属性）；
     *  返回 false=写失败，弹窗不关、输入保留（写失败铁律）。
     *  entryId=创建链预生成 id（□2 统一：AI 对话缓存同源+写失败重试幂等，见 create 注记） */
    private async doSave(
        protyle: IProtyle,
        text: string,
        sel: { txt: string } | undefined,
        range: Range | undefined,
        selected: HTMLElement[],
        entryId?: string,
    ): Promise<boolean> {
        let subs: BlockSubRange[] = [];
        let divs: HTMLElement[];
        if (sel != null && range != null) {
            subs = blockSubRanges(range);
            if (subs.length === 0) {
                siyuan.pushMsg(tomatoI18n.选区不含可标记文本);
                return false;
            }
            divs = subs.map((s) => s.block);
        } else {
            divs = selected;
        }
        // divs 与 ids 成对过滤，防索引错位（reasoning P2-1）
        const pairs = divs
            .map((d) => ({ div: d, id: getAttribute(d, "data-node-id") }))
            .filter((p): p is { div: HTMLElement; id: string } => !!p.id);
        if (pairs.length === 0) return false;
        divs = pairs.map((p) => p.div);
        const ids = pairs.map((p) => p.id);

        // 1. 写属性（读旧串→append→批量落盘）。同 id 先摘再挂（reasoning P1-1）：首次保存
        // 「写成功但读回验证失败」后用户改文重试时，纯 append 幂等会首写赢静默吞掉新 text
        const entry = makeAnnotation({ text, sel, id: entryId });
        let cur: { [id: string]: Record<string, string> } | null = null;
        try {
            cur = await siyuan.batchGetBlockAttrs(ids);
        } catch { /* 静默 null 与异常同路处理 */ }
        if (cur == null) {
            siyuan.pushMsg(tomatoI18n.批注写入失败);
            return false;
        }
        const ops = ids.map((id) => {
            const attr = appendAnnotation(removeAnnotation(cur![id]?.[ANNOTATIONS_ATTR], entry.id), entry);
            return { id, attrs: { [ANNOTATIONS_ATTR]: attr } };
        });
        try {
            await siyuan.batchSetBlockAttrs(ops);
        } catch { /* 读回验证兜住 */ }
        // 写成败用读回验证判定：siyuan.call 对「成功但无 data」的 API（setBlockAttrs 族）也返回 null，
        // 拿返回值判失败会把成功误判成失败（e2e 实锤）；读 kernel 属性才是真相
        let after: { [id: string]: Record<string, string> } | null = null;
        try {
            after = await siyuan.batchGetBlockAttrs(ids);
        } catch { /* 同上 */ }
        const written = after != null && ids.every((id) =>
            after![id] == null // 宿主块已被他端删除：放行（reasoning P2-3）
            || parseAnnotations(after![id]?.[ANNOTATIONS_ATTR]).some((e) => e.id === entry.id));
        if (!written) {
            siyuan.pushMsg(tomatoI18n.批注写入失败);
            return false;
        }
        // 手动刷 DOM 属性（kernel 广播异步，先刷保证视觉即时+标记重建块时确定带属性）
        divs.forEach((div, i) => setAttribute(div, ANNOTATIONS_ATTR, ops[i].attrs[ANNOTATIONS_ATTR]));

        // 2. 写标记（选区级：逐块同 href 锚点 span；□1 Spike 契约）
        let markFail = false;
        if (subs.length > 0) {
            const href = ANNO_HREF_PREFIX + entry.id;
            for (const s of subs) {
                try {
                    protyle.toolbar.range = s.range;
                    protyle.toolbar.setInlineMark(protyle, "a", "range", { type: "a", color: href });
                    (globalThis as any).siyuan?.menus?.menu?.remove();
                } catch {
                    markFail = true;
                }
            }
        }

        // 3. class 同步（块级=色条+全块下划线宿主）
        divs.forEach((div) => this.syncDiv(div));
        // 4. 保留设置项语义：被批注块加卡
        if (commentBoxAddFlashCard.get()) siyuan.addRiffCards(ids);
        // 5. 软限信号（不拦截）
        if (isOverLimit(text)) siyuan.pushMsg(`${tomatoI18n.批注超过软限} ${ANNO_TEXT_SOFT_LIMIT}`);
        if (markFail) siyuan.pushMsg(tomatoI18n.标记写入失败批注已保存);
        return true;
    }

    // ---------- 编辑/删除链路（□4） ----------

    /** 块 id → 当前 DOM 中的块元素全集（反链面板/搜索浮窗会同 id 多副本，全刷才即时，reasoning P2-4；
     *  虚拟滚动未渲染返回空数组，靠内核广播最终一致） */
    private divsById(id: string): HTMLElement[] {
        if (!id) return [];
        return [...document.querySelectorAll(`div[data-node-id="${id}"]`)] as HTMLElement[];
    }

    /** 条目宿主块定位：DOM 全扫（新鲜数据无索引延迟）∪ SQL 兜虚拟滚动未渲染块（老数据索引已就绪） */
    private async holderIdsFor(annoId: string): Promise<string[]> {
        const ids = new Set<string>();
        document.querySelectorAll(`div[${ANNOTATIONS_ATTR}]`).forEach((div) => {
            if (findAnnotation((div as HTMLElement).getAttribute(ANNOTATIONS_ATTR), annoId)) {
                const id = getAttribute(div as HTMLElement, "data-node-id");
                if (id) ids.add(id);
            }
        });
        try {
            // annoId 为 newID() 产物（"ID"+uuid hex，字符集 [0-9a-zA-Z]），无引号/百分号注入面；
            // 不出现在 ial 其他位置（sel 快照含此串概率≈0）
            const rows = await siyuan.sql(
                `select id from blocks where ial like '%custom-tomato-annotations%' and ial like '%${annoId}%' limit 10000`,
            );
            rows?.forEach((r: { id?: string }) => r?.id && ids.add(r.id));
        } catch { /* DOM 侧兜底 */ }
        return [...ids];
    }

    /** 气泡「编辑」/「问 AI」→ 编辑弹窗（内嵌 Protyle 草稿块，mini-spec「编辑」节；重开回填=续写上条）。
     *  autoChat=气泡「问 AI」入口：挂载后自动展开 AI 讨论区（AI 未配置仍走 confirm 引导，□3 拍板） */
    private async openEdit(entry: TomatoAnnotation, anchor: HTMLElement, opts?: { autoChat?: boolean }) {
        if (this.editOpening || document.querySelector(".b3-dialog--open")) return; // 已有弹窗/取数中不重入
        this.editOpening = true;
        try {
            if ((await this.readonlyOf(anchor)) === "true") {
                siyuan.pushMsg(tomatoI18n.文档只读);
                return;
            }
            this.cancelPreview();
            this.hidePop(); // 同步段尽早摘气泡点击面（reasoning P1-1：双击窗口内点击面先消失）
            // 原文与上下文补强并行取数（reasoning P2-1：串行会让「问 AI」到弹窗出现的延迟翻倍）。
            // 原文=宿主块 kramdown 剥 IAL 尾行+全部批注锚点链接（块内标记是 UI 非内容，复评 P2；
            // 失败/为空不阻塞编辑，AI 上下文缺原文时按批注正文讨论）。跨块批注 anchor 只取一-block，
            // 完整选区由 sel.txt 在 AnnoChat ctx 兜底
            const fetchSource = async (): Promise<string> => {
                const hostID = anchor.closest("[data-node-id]")?.getAttribute("data-node-id") ?? "";
                if (!hostID) return "";
                try {
                    const kd = (await siyuan.getBlockKramdown(hostID))?.kramdown ?? "";
                    return stripAllAnnoLinks(kd.replace(/\n\{:[^\n]*\}\s*$/, ""));
                } catch {
                    return "";
                }
            };
            const [source, ctxExtra] = await Promise.all([fetchSource(), this.chatContextExtra(anchor)]);
            const id = newID();
            const dm = new DestroyManager();
            // 尺寸记忆（□3 拍板）：思源原生 dialogPosition 机制——positionId 开弹窗自动恢复记忆的
            // 宽高/位置（视口守卫内核内置），data-key 挂上后 moveResize 拖拽自动写回 storage 持久化
            // （内核 mount.ts 日记弹窗同款先例），插件零自写存储。初始宽 720px 仅无记忆时生效
            const memo = !events.isMobile;
            const dialog = new Dialog({
                title: tomatoI18n.编辑批注,
                content: `<div id="${id}" style="flex:1 1 auto;display:flex;flex-direction:column;min-height:0"></div>`,
                width: events.isMobile ? "90vw" : "720px",
                positionId: memo ? ANNO_EDIT_POSITION_ID : undefined,
                transparent: true,
                destroyCallback() {
                    dm.destroyBy("dialog");
                },
            });
            if (memo) dialog.element.setAttribute("data-key", ANNO_EDIT_POSITION_ID);
            this.editOpening = false; // Dialog 元素已入 DOM（--open 类内核 +50ms 才加，此窗口的
            // 真防线=上方 hidePop 已摘掉气泡点击面，双击第二击无目标可点）
            dm.add("dialog", () => dialog.destroy());
            const svelte = mount(AnnoEdit, {
                target: dialog.element.querySelector("#" + id),
                props: {
                    dm,
                    annoId: entry.id,
                    source,
                    selText: entry.sel?.txt ?? "",
                    initialText: entry.text,
                    autoChat: !!opts?.autoChat,
                    ...ctxExtra,
                    onSave: async (text: string) => {
                        const ok = await this.enqueue(() => this.doEditSave(entry.id, text));
                        if (ok) {
                            // 弹窗销毁链（dialog/protyle/草稿删除）残余事件可能再触发滚动关闭，
                            // 气泡重开延迟到收尾之后（anchor 被内核重渲染替换则放弃）
                            setTimeout(() => {
                                if (anchor.isConnected) this.show(anchor, "view");
                            }, 150);
                        }
                        return ok;
                    },
                },
            });
            dm.add("svelte", () => unmount(svelte));
        } finally {
            this.editOpening = false;
        }
    }

    /** AI 讨论上下文补强取数（□3）：{docTitle, prev, next} 三路并行，任一失败给空串
     *  （contextBlock 缺省不出段）；docTitle 走 hpath，prev/next 走 DOM 兄弟链 */
    private async chatContextExtra(anchor: HTMLElement): Promise<{ docTitle: string; prev: string; next: string }> {
        // 文档标题：.protyle-title 带 data-node-id=文档根 id（readonlyOf 同款定位）→ hpath；
        // 反链面板/搜索浮窗等无 title 的 protyle → 空串缺省
        const docID = anchor.closest(".protyle")?.querySelector(".protyle-title")?.getAttribute("data-node-id") ?? "";
        const titleP = (async (): Promise<string> => {
            if (!docID) return "";
            try {
                return ((await siyuan.getBlockInfo(docID)) as { hpath?: string })?.hpath ?? "";
            } catch {
                return "";
            }
        })();
        // 前后相邻块：兄弟链上找最近带 data-node-id 的节点（跳过 .protyle-attr 等非块兄弟）；
        // 虚拟滚动未渲染则兄弟缺省空串。邻居剥全部批注锚点链接（UI 标记非内容，reasoning P2-3）
        const host = anchor.closest("div[data-node-id]");
        const kramdownOf = async (el: Element | null): Promise<string> => {
            const bid = el?.getAttribute("data-node-id") ?? "";
            if (!bid) return "";
            try {
                const kd = (await siyuan.getBlockKramdown(bid))?.kramdown ?? "";
                return stripAllAnnoLinks(kd.replace(/\n\{:[^\n]*\}\s*$/, ""));
            } catch {
                return "";
            }
        };
        let neighborsP: Promise<[string, string]> = Promise.resolve(["", ""]);
        if (host) {
            let pe = host.previousElementSibling;
            while (pe && !pe.getAttribute("data-node-id")) pe = pe.previousElementSibling;
            let ne = host.nextElementSibling;
            while (ne && !ne.getAttribute("data-node-id")) ne = ne.nextElementSibling;
            neighborsP = Promise.all([kramdownOf(pe), kramdownOf(ne)]);
        }
        const [docTitle, [prev, next]] = await Promise.all([titleP, neighborsP]);
        return { docTitle, prev, next };
    }

    /** 编辑保存：所有宿主块同步 updateAnnotation（time 不隐式刷，□2 契约）→ 读回验证 → 刷新 DOM/气泡 */
    private async doEditSave(annoId: string, text: string): Promise<boolean> {
        const ids = await this.holderIdsFor(annoId);
        if (ids.length === 0) {
            siyuan.pushMsg(tomatoI18n.批注已被删除); // 条目已被他端删除（reasoning P2-7 独立文案，勿误导成网络失败）
            return false;
        }
        let cur: { [id: string]: Record<string, string> } | null = null;
        try {
            cur = await siyuan.batchGetBlockAttrs(ids);
        } catch { /* 静默 null 与异常同路处理 */ }
        if (cur == null) {
            siyuan.pushMsg(tomatoI18n.批注写入失败);
            return false;
        }
        const ops = ids.map((id) => ({
            id,
            attrs: { [ANNOTATIONS_ATTR]: updateAnnotation(cur![id]?.[ANNOTATIONS_ATTR], annoId, { text }) },
        }));
        try {
            await siyuan.batchSetBlockAttrs(ops);
        } catch { /* 读回验证兜住 */ }
        // 写成败用读回验证判定（siyuan.call 对「成功但无 data」的 API 返回 null，e2e 实锤）
        let after: { [id: string]: Record<string, string> } | null = null;
        try {
            after = await siyuan.batchGetBlockAttrs(ids);
        } catch { /* 同上 */ }
        const written = after != null && ids.every((id) =>
            after![id] == null // 宿主块已被他端删除：放行（reasoning P2-3，否则弹窗永远关不掉）
            || parseAnnotations(after![id]?.[ANNOTATIONS_ATTR]).some((e) => e.id === annoId && e.text === text));
        if (!written) {
            siyuan.pushMsg(tomatoI18n.批注写入失败);
            return false;
        }
        // 手动刷 DOM 属性（kernel 广播异步，先刷保证视觉即时；class 同步顺带；多副本全刷 P2-4）
        ids.forEach((id, i) => {
            this.divsById(id).forEach((div) => {
                setAttribute(div, ANNOTATIONS_ATTR, ops[i].attrs[ANNOTATIONS_ATTR]);
                this.syncDiv(div);
            });
        });
        // 气泡重开由 openEdit 的 onSave 包装层延迟驱动（弹窗销毁期事件防误关）
        if (isOverLimit(text)) siyuan.pushMsg(`${tomatoI18n.批注超过软限} ${ANNO_TEXT_SOFT_LIMIT}`);
        return true;
    }

    /** 气泡「删除」→ confirm → doRemove（写链串行化防交叠互洗，reasoning P1-1） */
    private confirmRemove(entry: TomatoAnnotation, _anchor: HTMLElement) {
        confirm(tomatoI18n.确认删除批注, tomatoI18n.删除批注连带标记, () => {
            void this.enqueue(() => this.doRemove(entry));
        });
    }

    /** 解除块内某 href 的锚点 span（原地 unwrap 文本保留）；供删除链与孤儿回收共用（reasoning P1-2 抽取） */
    private unwrapAnnoSpans(div: HTMLElement, href: string) {
        div.querySelectorAll(ANNO_SPAN_SEL).forEach((span) => {
            if (span.getAttribute("data-href") !== href) return;
            const parent = span.parentElement;
            if (!parent) return;
            while (span.firstChild) parent.insertBefore(span.firstChild, span);
            span.remove();
            parent.normalize();
        });
    }

    /** 块内孤儿标记回收：span 的 href 在块属性中无对应条目 → unwrap（摘标记失败/竞态复活/Lute 吞并的残留，
     *  reasoning P1-2；不扫 innerHTML，按 span 集合判，无大文档性能坑） */
    private sweepOrphanSpans(div: HTMLElement) {
        const attr = div.getAttribute(ANNOTATIONS_ATTR);
        div.querySelectorAll(ANNO_SPAN_SEL).forEach((span) => {
            const id = annoIdFromHref(span.getAttribute("data-href") ?? "");
            if (id != null && findAnnotation(attr, id) == null) {
                this.unwrapAnnoSpans(div, ANNO_HREF_PREFIX + id);
            }
        });
    }

    /** 删除单条：摘锚点标记（updateBlock 内容+现 IAL 写回，防洗属性）→ 删属性条目 → DOM 刷新（跨块同步） */
    private async doRemove(entry: TomatoAnnotation) {
        this.hidePop();
        const ids = await this.holderIdsFor(entry.id);
        if (ids.length === 0) return; // 已被他端删除，静默幂等
        const href = ANNO_HREF_PREFIX + entry.id;
        // 1. 摘标记（仅选区级有 span；□3 实测：updateBlock 裸 kramdown 会整段洗块属性——必须带取回的 IAL 写回）
        if (entry.sel != null) {
            for (const id of ids) {
                try {
                    // 乐观锁重读（reasoning P1-1）：写回前复核快照，把「旧快照覆盖用户并发输入」的窗口
                    // 从整个 doRemove 时长压到单次 API 往返内；变了就基于新读重剥（≤3 轮）
                    let kd = (await siyuan.getBlockKramdown(id) as { kramdown?: string })?.kramdown ?? "";
                    for (let attempt = 0; attempt < 3; attempt++) {
                        const next = stripAnnoLinks(kd, entry.id);
                        if (next === kd) break; // 已无该标记（重入/他端已删）
                        const verify = (await siyuan.getBlockKramdown(id) as { kramdown?: string })?.kramdown ?? "";
                        if (verify === kd) {
                            await siyuan.updateBlock(id, next);
                            break;
                        }
                        kd = verify;
                    }
                } catch (e) {
                    // 摘标记失败不阻断属性删除：残留 span 由孤儿回收（sweepOrphanSpans）摘除
                    console.warn("[tomato anno] strip mark failed:", id, e);
                }
            }
        }
        // 2. 删属性条目（读旧→remove→批量落盘；删空="" 即清属性键，块级样式随选择器失效）
        let cur: { [id: string]: Record<string, string> } | null = null;
        try {
            cur = await siyuan.batchGetBlockAttrs(ids);
        } catch { /* 下方读回验证兜住 */ }
        if (cur != null) {
            const ops = ids.map((id) => ({
                id,
                attrs: { [ANNOTATIONS_ATTR]: removeAnnotation(cur![id]?.[ANNOTATIONS_ATTR], entry.id) },
            }));
            try {
                await siyuan.batchSetBlockAttrs(ops);
                // 3. 手动刷 DOM：unwrap 该 href 的 span + 属性（空=移除键）+ class 同步 + 孤儿回收（视觉即时）
                ops.forEach((op) => {
                    this.divsById(op.id).forEach((div) => {
                        this.unwrapAnnoSpans(div, href);
                        this.sweepOrphanSpans(div);
                        const v = op.attrs[ANNOTATIONS_ATTR];
                        if (v === "") div.removeAttribute(ANNOTATIONS_ATTR);
                        else setAttribute(div, ANNOTATIONS_ATTR, v);
                        this.syncDiv(div);
                    });
                });
            } catch { /* 读回验证兜住 */ }
        }
        // 4. 读回验证：存活宿主块已不含该 id（已被他端删除的块放行，reasoning P2-3；失败 toast）
        let after: { [id: string]: Record<string, string> } | null = null;
        try {
            after = await siyuan.batchGetBlockAttrs(ids);
        } catch { /* 同上 */ }
        const gone = after != null && ids.every((id) =>
            after![id] == null
            || !parseAnnotations(after![id]?.[ANNOTATIONS_ATTR]).some((e) => e.id === entry.id));
        if (!gone) siyuan.pushMsg(tomatoI18n.批注删除失败);
        else clearChat(entry.id); // □8 删除成功清 AI 对话缓存（生命周期与批注绑定，拍板）
    }

    /** anchor → 所在文档 rootID（.protyle-title 带 data-node-id=块根 id，思源 title.ts:406）；
     *  判只读用（isReadonly 的等价内联：custom-sy-readonly 挂在文档根） */
    private async readonlyOf(anchor: HTMLElement): Promise<string> {
        const protyleEl = anchor.closest(".protyle");
        const docID = protyleEl?.querySelector(".protyle-title")?.getAttribute("data-node-id") ?? "";
        if (!docID) return "false";
        try {
            const attr = await siyuan.getBlockAttrs(docID);
            return String(attr?.["custom-sy-readonly"] ?? "false");
        } catch {
            return "false";
        }
    }

    // ---------- class 同步渲染 ----------

    private syncDiv(div: HTMLElement) {
        const entries = parseAnnotations(div.getAttribute(ANNOTATIONS_ATTR));
        div.classList.toggle(BLOCK_CLASS, hasBlockLevelEntry(entries));
    }

    private syncClasses(protyle: IProtyle) {
        if (!protyle?.element) return;
        protyle.element.querySelectorAll(`div[${ANNOTATIONS_ATTR}]`).forEach((div) => {
            this.syncDiv(div as HTMLElement);
        });
    }

    private syncAll() {
        document.querySelectorAll(`div[${ANNOTATIONS_ATTR}]`).forEach((div) => {
            this.syncDiv(div as HTMLElement);
        });
    }

    // ---------- 气泡管理 ----------

    /** 命中判定：选区标记 span，或块级色条热区（块左缘 14px 内） */
    private anchorFrom(target: Element | null, clientX: number): HTMLElement | null {
        const t = target as Element | null;
        const span = t?.closest?.(ANNO_SPAN_SEL);
        if (span) return span as HTMLElement;
        const block = t?.closest?.(`.${BLOCK_CLASS}`);
        if (block && clientX <= block.getBoundingClientRect().left + HOT_ZONE) return block as HTMLElement;
        return null;
    }

    private entriesFor(anchor: HTMLElement) {
        if (anchor.matches(ANNO_SPAN_SEL)) {
            const id = annoIdFromHref(anchor.getAttribute("data-href") ?? "");
            const holder = anchor.closest(`div[${ANNOTATIONS_ATTR}]`);
            const e = id != null && holder != null ? findAnnotation(holder.getAttribute(ANNOTATIONS_ATTR), id) : undefined;
            return e ? [e] : [];
        }
        // 块级宿主自身携带属性（closest 含自身）
        const holder = anchor.closest(`div[${ANNOTATIONS_ATTR}]`);
        if (holder == null) return [];
        return parseAnnotations(holder.getAttribute(ANNOTATIONS_ATTR)).filter((e) => e.sel == null);
    }

    private show(anchor: HTMLElement, mode: "preview" | "view") {
        // 预览与查看互斥（spec §3.3）：查看打开期间不再弹预览
        if (mode === "preview" && this.popMode === "view") return;
        const entries = this.entriesFor(anchor);
        if (entries.length === 0) return;
        this.ensureBubble();
        annoPop.set({ mode, entries, rect: anchor.getBoundingClientRect(), zIndex: nextZ(), anchor });
        this.popMode = mode;
    }

    private hidePop(mode?: "preview" | "view") {
        if (this.popMode == null) return;
        if (mode != null && this.popMode !== mode) return;
        annoPop.set(null);
        this.popMode = null;
    }

    private cancelPreview() {
        if (this.previewTimer != null) {
            clearTimeout(this.previewTimer);
            this.previewTimer = null;
        }
        this.previewAnchor = null;
    }
}

export const annotations = new Annotations();

/** 设置项→CSS：批注标记视觉注入（□1 形态/线型/粗细/背景开关统一入口，spec §11.6 契约表）。
 *  index.ts 装载与设置面板 onChange 调用；脏值一律回落缺省档。
 *  单位约定：--tomato-anno-underline-width 注纯数字（1/2/3），CSS 侧 calc(*1px) 展开；
 *  背景开关关态挂 html 属性而非覆盖 --tomato-anno-bg 变量（变量定义在 .protyle-wysiwyg，
 *  html 层同名变量会被更近定义赢，属性分支无此问题），且仅下划线式挂（marker/frame 下开关不生效） */
export function applyAnnoVisual() {
    const html = document.documentElement;
    const style = ["underline", "marker", "frame"].includes(commentBoxAnnoMarkStyle.get())
        ? commentBoxAnnoMarkStyle.get() : "underline";
    const line = ["solid", "dashed", "dotted", "wavy", "double", "dot-bead", "ring-bead"].includes(commentBoxAnnoLineType.get())
        ? commentBoxAnnoLineType.get() : "dashed";
    const tn = Number(commentBoxAnnoUnderlineThickness.get());
    const thick = tn === 1 || tn === 3 ? tn : 2;
    if (style === "underline") html.removeAttribute("data-tomato-anno-style");
    else html.setAttribute("data-tomato-anno-style", style);
    // 装饰串线型走 data-tomato-anno-underline 属性（background 通道替代下划线，选区级专属）；
    // 激活时 style 变量回落 dashed——块级标记跟随的是线型变量（拍板），自动回落虚线
    const deco = line === "dot-bead" || line === "ring-bead";
    html.style.setProperty("--tomato-anno-underline-style", deco ? "dashed" : line);
    if (deco) html.setAttribute("data-tomato-anno-underline", line);
    else html.removeAttribute("data-tomato-anno-underline");
    html.style.setProperty("--tomato-anno-underline-width", String(thick));
    // 偏移联动：wavy+粗3 波峰咬字须提到 4px（spec §11.1），其余 3px
    html.style.setProperty("--tomato-anno-underline-offset", line === "wavy" && thick === 3 ? "4px" : "3px");
    if (style === "underline" && !commentBoxAnnoBg.get()) html.setAttribute("data-tomato-anno-bg", "off");
    else html.removeAttribute("data-tomato-anno-bg");
}
