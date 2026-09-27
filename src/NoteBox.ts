import { adaptHotkey, Custom, Dialog, IProtyle } from "siyuan";
import { events, EventType } from "./libs/Events";
import { add_ref, coerceIdeaIntervalMode, getContenteditableElement, isMainWin, NewNodeID, planIdeaIntervals, setTimeouts, siyuan, sleep, sqlQuoteStr, timeUtil, } from "./libs/utils";
import NoteBoxSvelte from "./NoteBox.svelte";
import { DATA_NODE_ID, TOMATO_IDEA_QUEUE } from "./libs/gconst";
import { DestroyManager } from "./libs/destroyer";
import { avoiding_cloud_synchronization_conflicts, flash_thoughts_2_top, flash_thoughts_target_file, flashBlockForm, flashRelayByTime, flashStatTag, ideaIntervalMode, noteBoxAllKinds, noteBoxCheckbox, noteBoxMobileSync, storeNoteBox_fastnote, storeNoteBox_pin, storeNoteBox_selectedNotebook, storeNoteBox_selectedNoteType } from "./libs/stores";
import { lifelogAttrs, lifelogStamp, shouldRepinDailyNote, ymdFromCreated } from "./libs/dailyCollect";
import { hhmmFromCreated, planRelayTimeSlots, relayAnchorBlocks } from "./libs/shorthandRelay";
import { debugLog } from "./libs/logUtils";
import { isDailyNoteIal } from "./libs/dailyReview";
import { isPinned, removeStatusBar } from "./libs/ui";
import { createRefDoc, OpenSyFile2 } from "./libs/docUtils";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { domNewLine, md2Divs } from "./libs/sydom";
import { aliasNoteBody, coerceFlashBlockForm, flashAttrs, flashMD, kindChannel, queueLifelogSource, wrapFlashBlocksDOM } from "./libs/flashBlockForm";
import { PLAIN_KIND, kindAliasDeclared } from "./libs/quicknoteCore";
import { newID } from "stonev5-utils";
import { mount, unmount } from "svelte";

const DOCK_TYPE = "dock_NoteBox";
export const TAB_TYPE = "custom_tab_NoteBox";
export const NoteBoxID = "jadfddMPTrpeULuAwloOMWAJEgwyMpBOTxUaDSTHyShpHlJHKu";

function pinWindowEventHandler(_event: PointerEvent) {
    storeNoteBox_pin.save(isPinned());
}

function removeIcons() {
    removeStatusBar();

    // pinWindow
    document.getElementById("pinWindow")?.addEventListener("click", pinWindowEventHandler);
    if (storeNoteBox_pin.get() === true) {
        if (!isPinned()) {
            document.getElementById("pinWindow")?.click();
        }
    }
}

function isNoteBox() {
    return document.getElementById(NoteBoxID) != null;
}

/** need-0926-03：lifelog-content 随编辑同步——原为一次性快照（落块/搬运/合并三时机只写
 *  初始文本），块被再编辑后属性与内容脱节，下游（轻迹等 lifelog 生态）统计不到修改后
 *  内容。监听 ws-main 事务的 update op（800ms 防抖合并窗）：仅对已带
 *  custom-lifelog-content 的块回写 content+updated（getBlockAttrs 判定+文本比对零变化
 *  不写）；setBlockAttrs 广播 action=updateAttrs 非 update，自写不回流=无环。
 *  **注册在主插件 onload 无条件链（index.ts）**——速记块有面板/小窗/移动端队列多通道，
 *  同步是数据维护不随 NoteBox 面板开关走（dev 实测面板关=NoteBox.onload 首行早退，
 *  监听挂那里永不注册）。开关 flashStatTag 关=回快照行为不追写（体内判，热生效） */
export function bindLifelogContentSync(plugin: BaseTomatoPlugin) {
    let pending = new Set<string>();
    let timer: number | undefined;
    plugin.eventBus.on("ws-main", ({ detail }) => {
        if (!flashStatTag.get()) return;
        // 广播体两路形态：data=事务数组（每项含 doOperations，0926 dev 实测）或已解包
        const d = (detail as any)?.data;
        const ops: any[] = Array.isArray(d)
            ? d.flatMap(t => t?.doOperations ?? [])
            : d?.doOperations ?? (detail as any)?.doOperations ?? [];
        const ids = ops.filter(o => o?.action === "update" && o?.id).map(o => o.id);
        if (ids.length === 0) return;
        ids.forEach(i => pending.add(i));
        if (timer) return;
        timer = window.setTimeout(() => {
            timer = undefined;
            const batch = [...pending];
            pending = new Set();
            void syncLifelogBatch(batch);
        }, 800);
    });
}

/** 同步批：逐块查属性筛「速记块」→ 取块 DOM 当前文本（​ 清洗+trim，与落块 trim
 *  同口径）→ 与属性值比对，变了才写 content+updated。单块失败静默不阻断批（对齐
 *  tagLifelogAfterInsert fire-and-forget 语义，debugLog 留痕） */
async function syncLifelogBatch(ids: string[]) {
    if (!flashStatTag.get()) return;
    for (const id of ids) {
        try {
            const attrs = await siyuan.getBlockAttrs(id);
            const old = attrs?.["custom-lifelog-content"];
            if (old === undefined) continue;
            const dom = await siyuan.getBlockDOM(id);
            const div = document.createElement("div");
            div.innerHTML = dom?.dom ?? "";
            const text = (div.textContent ?? "").replace(/​/g, "").trim();
            if (!text || text === old) continue;
            await siyuan.setBlockAttrs(id, {
                "custom-lifelog-content": text,
                "custom-lifelog-updated": lifelogStamp(),
            });
        } catch (e) {
            debugLog("flashlog", `sync fail id=${id}: ${e}`, "dailynote");
        }
    }
}


class NoteBox {
    plugin: BaseTomatoPlugin;
    private custom: (options: any) => Custom;
    settingCfg: TomatoSettings;
    // private ticker: any;
    // private notebookID: string;
    mobilePinnedDailynoteID: string;
    /** mobilePinnedDailynoteID 的 pin 日（YYYYMMDD）：跨天后 getTargetID 重取当日日记（□1 修「跨天仍落昨日」存量 bug） */
    mobilePinnedYMD: string;
    /** □4 已判非日记的文档负缓存（ial 判定防同文档重复；reload 后失效风险低=间隔不更新可接受） */
    nonDailyNoteIDs = new Set<string>();

    /** □4 时序统一：index.async onload 已 await taskCfg（框架保序），双路竞态消化退役。
     * 注册体保持同步——verify 失败强关云同步冲突规避（Pro 门控）挪 index.onLayoutReady
     * auth 簇：onload 注册链不再被网络往返阻塞（Box 链上后方的 readingPoint/graphBox/
     * commentBox 注册时机回归独立，comment-dock e2e 实锤竞态 2026-09-05） */
    onload(plugin: BaseTomatoPlugin) {
        if (!noteBoxCheckbox.get()) return;

        this.plugin = plugin;
        this.settingCfg = plugin.settingCfg;

        if (!events.isMobile) {
            this.addDock(); // 添加后有 bug，手机端在文档数更新后，无法显示 topbar icons.
        }

        this.addTab();

        // need-0926-18：手动「重算速记间隔」命令——必须官方 addCommand 通道（建 keymap 条目
        // +命令面板+注入 customHotkey 三合一；裸 commands.push 不进面板，在档纪律）。
        // 无默认键（winHotkey 定键纪律：⇧⌘ 字母族多为 Chrome 保留、⌥⌘ 字母已全占，无干净
        // 键位不硬定——用户可经思源键位设置自行绑定）；随速记总开关冷生效（关=不注册）
        this.plugin.addCommand({
            langKey: "recalcIdeaInterval",
            langText: tomatoI18n.重算速记间隔,
            callback: () => {
                void recalcIntervalForCurrentDoc(true);
            },
        });

        if (events.isMobile) {
            this.plugin.addTopBar({
                icon: "iconCamera",
                title: tomatoI18n.拍照闪念,
                position: "left",
                callback: () => {
                    this.showInDialog();
                },
            });
            // featgate □2 死角补口：移动端「同步数据」顶栏钮独立开关（默认开=现状零迁移）；
            // 钮+状态监听一体门控（监听改 syncIcon 图标，钮不在场监听无意义）。onload 注册
            // 读死——改须插件重载（STRUCTURAL_KEYS 已登记）
            if (noteBoxMobileSync.get()) {
                const syncIcon = this.plugin.addTopBar({
                    icon: "iconCloudSucc",
                    title: tomatoI18n.同步数据,
                    position: "left",
                    callback: () => {
                        siyuan.performSync(true);
                    },
                });
                events.addListener("note-box ws 2024-12-15 09:11:501", (eventType, detail) => {
                    if (eventType === EventType.sync_fail) {
                        syncIcon.firstElementChild?.firstElementChild?.setAttribute("xlink:href", "#iconCloudError")
                        // 线性图标三态仅 3~4px 形态差，补状态色保辨识（vision P1：失败态须醒目）
                        syncIcon.style.color = "var(--b3-theme-error)"
                        siyuan.pushMsg(detail.msg, 3000);
                    }
                    if (eventType === EventType.sync_start) {
                        syncIcon.firstElementChild?.firstElementChild?.setAttribute("xlink:href", "#iconCloud")
                        syncIcon.style.color = ""
                    }
                    if (eventType === EventType.sync_end) {
                        syncIcon.firstElementChild?.firstElementChild?.setAttribute("xlink:href", "#iconCloudSucc")
                        syncIcon.style.color = "var(--b3-theme-primary)"
                    }
                });
            }
        }

        events.addListener("tomato-note-box-2024-11-29 10:40:12", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.click_editorcontent
                || eventType == EventType.switch_protyle
            ) {
                navigator.locks.request("tomato-note-box-lock-2024-07-01 17:16:02", { ifAvailable: true }, async (lock) => {
                    if (lock) {
                        try {
                            const protyle: IProtyle = detail?.protyle;
                            const docID = protyle?.block?.rootID;
                            if (!docID) return;
                            // □4 省 SQL：ial 内存判定非日记直接跳（负缓存防同文档重复判定；
                            // reload 后缓存失效风险低——误跳过最坏效果=间隔不更新，可接受）
                            if (!isDailyNoteIal(protyle?.background?.ial as any)) {
                                this.nonDailyNoteIDs.add(docID);
                                return;
                            }
                            this.nonDailyNoteIDs.delete(docID);
                            if (!avoiding_cloud_synchronization_conflicts.get()) {
                                await this.calcTimeInterval(docID)
                            } else {
                                if (!events.isMobile) {
                                    await this.calcTimeInterval(docID)
                                }
                            }
                        } finally {
                            await sleep(5000)
                        }
                    }
                });
            }
        });

        // □4 队列监听注册恒执行、体内运行时判开关（热生效：改设置不再需要重载插件）+
        // 桌面端 sync-end 触发搬运（监听体内同判；事件名同源 shorthandRelay bindShorthandRelay）
        events.addListener("tomato-note-box-file-queue", (eventType, _detail) => {
            if (!avoiding_cloud_synchronization_conflicts.get() || events.isMobile) return;
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.click_editorcontent
                || EventType.switch_protyle
            ) {
                navigator.locks.request("tomato-note-box-file-queue-lock", { ifAvailable: true }, async (lock) => {
                    if (lock) {
                        const boxID = storeNoteBox_fastnote.getOr();
                        this.moveFromQueue(boxID);
                        await sleep(5000)
                    }
                });
            }
        });

        this.plugin.eventBus.on("sync-end", () => {
            if (!avoiding_cloud_synchronization_conflicts.get() || events.isMobile) return;
            navigator.locks.request("tomato-note-box-file-queue-lock", { ifAvailable: true }, async (lock) => {
                if (lock) {
                    const boxID = storeNoteBox_fastnote.getOr();
                    this.moveFromQueue(boxID);
                    await sleep(5000)
                }
            });
        });


        if (!events.isMobile) {
            setTimeouts(() => {
                if (isNoteBox() && !isMainWin()) {
                    removeIcons();
                }
            }, 200, 3000, 300);
        }
    }

    /** □4 间隔重算（need-0926-18 起公开：requestIdeaIntervalCalc/recalcIntervalForCurrentDoc
     *  主动通道与事件链共用）。写入决策收拢纯函数 planIdeaIntervals（libs/strUtils，单测
     *  覆盖）——「间隔计算模式」两档：start=写在较早条（存量语义，默认）/end=写在较晚条；
     *  全量 diff（不在规划 map=清空值）使模式切换后旧位置残留自动清零（空串清值的显示
     *  兜底=cssStyle :not([custom-tomato-idea-interval=""])）。返回写入条数 */
    async calcTimeInterval(docID: string): Promise<number> {
        if (!docID) return 0;
        const [timeMap, intervalMap] = await siyuan
            .sqlAttr(`select name,block_id,value from attributes 
                where (name="custom-tomato-idea-time" or name="custom-tomato-idea-interval") 
                and root_id = "${docID}"`
            )
            .then(rows => {
                const t = new Map(rows.filter(i => i.name == "custom-tomato-idea-time").map(row => [row.block_id, row.value]))
                const i = new Map(rows.filter(i => i.name == "custom-tomato-idea-interval").map(row => [row.block_id, row.value]))
                return [t, i]
            });

        if (timeMap.size == 0) return 0
        const ids = await siyuan.getBlocksIndexes([...timeMap.keys()])
            .then(obj => Object.entries(obj).sort((a, b) => a[1] - b[1]).map(entr => entr[0]))
        const createdMap = new Map((await siyuan.getRows(ids, "created")).map(r => [r.id, r.created]))
        const times = ids
            .map(id => {
                const time = (timeMap.get(id) ?? "").split("⌛")[0]; // for old
                if (!time) return null
                const interval = intervalMap.get(id) ?? "";
                return { id, time, interval, created: createdMap.get(id) } as ID_Time
            })
            .filter(i => !!i)
        const desired = planIdeaIntervals(times, coerceIdeaIntervalMode(ideaIntervalMode.get()))
        let changed = 0
        for (const { id } of times) {
            const want = desired.get(id) ?? ""
            if (want !== (intervalMap.get(id) ?? "")) {
                await siyuan.setBlockAttrs(id, { "custom-tomato-idea-interval": want })
                changed++
            }
        }
        return changed
    }

    private getCloseSvg() {
        for (const e of document.querySelectorAll("span.item__text")) {
            if (e.textContent.startsWith(tomatoI18n.拍照闪念)) {
                // <span class="item__text">拍照闪念(移动端规避云端同步冲突)</span>
                // <span class="item__close"><svg><use xlink:href="#iconClose"></use></svg></span>
                return e.nextElementSibling as HTMLButtonElement;
            }
        }
    }

    private addDock() {
        this.plugin.addDock({
            type: DOCK_TYPE,
            config: {
                position: "LeftBottom",
                size: { width: 200, height: 0 },
                icon: "iconCamera",
                title: tomatoI18n.拍照闪念,
                hotkey: "⌥⌘W",
            },
            data: {
                svelte: null,
            },
            resize() {
            },
            update() {
            },
            destroy() {
            },
            init: (dock) => {
                const eleID = newID();
                let suffix = "";
                if (avoiding_cloud_synchronization_conflicts.get()) {
                    suffix = `(${tomatoI18n.移动端规避云端同步冲突})`;
                }
                if (events.isMobile) {
                    dock.element.innerHTML = `<div class="toolbar toolbar--border toolbar--dark">
                        <svg class="toolbar__icon"><use xlink:href="#iconCamera"></use></svg>
                            <div class="toolbar__text">${tomatoI18n.拍照闪念}${suffix}</div>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                } else {
                    dock.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
                        <div class="block__icons">
                            <div class="block__logo">
                                <svg class="block__logoicon"><use xlink:href="#iconCamera"></use></svg>${tomatoI18n.拍照闪念}${suffix}
                            </div>
                            <span class="fn__flex-1 fn__space"></span>
                            <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}"><svg><use xlink:href="#iconMin"></use></svg></span>
                        </div>
                        <div id="${eleID}"></div>
                    </div>`;
                }
                dock.data.svelte = mount(NoteBoxSvelte, {
                    target: dock.element.querySelector("#" + eleID),
                    props: {}
                }) as any;
            },
        } as any); // addDock.init 的 dock 参数同 GraphBox：1.2.5 类型漏了，运行时仍传
    }

    /** 幂等确保拍照闪念 dock 面板可见（GraphBox.ensureDockVisible 同款，本面板在 leftDock）：
     *  toggleModel 对已激活且面板区可见的面板是收起语义，先判激活态；键必须用
     *  plugin.name+DOCK_TYPE 完整键（DOM data-type/toggleModel/leftDock.data 三处同源）。
     *  need-0926-08：速记器 focus 形态「带出思源」主窗入口改走本通道（原 openTab custom tab
     *  撞 addTab 的 2024-06 主窗守卫恒空壳页签）。面板未注册/插件未就绪=静默无操作 */
    ensureDockVisible() {
        if (!this.plugin) return;
        const layoutDock = (window.siyuan as any).layout?.leftDock;
        if (!layoutDock) return;
        const fullType = this.plugin.name + DOCK_TYPE;
        const item = document.querySelector(`.dock__item[data-type="${fullType}"]`);
        if (!item) return;
        const active = item.classList.contains("dock__item--active");
        if (!active || layoutDock.panelVisible === false) {
            layoutDock.toggleModel(fullType, true);
        }
    }

    private addTab() {
        this.custom; // 压 TS6133：custom 只在 onload 前的类型期被赋值读用
        // □4 窗口统一化（2026-09-07）：「拍照闪念（全局）」命令退役——全局入口收拢到速记器 ⌥J
        // （外部轻窗默认/带出思源面板可配），图片闪念走 Dock 图标/速记器 focus 形态进面板。
        // need-0926-08：速记器 focus 形态主窗入口改走 ensureDockVisible（Dock 通道）——
        // openTab 入口退役；本 tab 注册仅存分离窗（window.html 无 dock 栏，custom tab 是
        // 分离窗里唯一的面板形态，!isMainWin() 守卫勿动=主窗 Dock/分离窗 tab 各司其职）
        this.custom = this.plugin.addTab({
            type: TAB_TYPE,
            init() {
                const id = newID();
                this.element.innerHTML = `<div id="${id}"></div>`;
                this.data.sm = new DestroyManager();
                this.data.sm.add("custom-tab", () => { this.destroy(); });
                if (!isMainWin()) {
                    this.data.sv = mount(NoteBoxSvelte, {
                        target: this.element.querySelector("#" + id),
                        props: { sm: this.data.sm }
                    });
                    this.data.sm.add("svelte", () => { unmount(this.data.sv); });
                }
            },
            beforeDestroy() { },
            destroy() {
                this.data.sm.destroyBy("custom-tab");
                noteBox.getCloseSvg()?.click();
            }
        });
    }

    async showInDialog() {
        const dm = new DestroyManager();
        const id = newID();
        const dialog = new Dialog({
            title: tomatoI18n.拍照闪念,
            content: `<div id="${id}"></div>`,
            width: events.isMobile ? "90vw" : "500px",
            height: events.isMobile ? "150vw" : "500px",
            destroyCallback: () => {
                dm.destroyBy("1")
            },
        });
        const d = mount(NoteBoxSvelte, {
            target: dialog.element.querySelector("#" + id),
            props: {
                sm: dm,
                isDialog: true,
            }
        });
        dm.add("1", () => { dialog.destroy() })
        dm.add("2", () => { unmount(d) })
    }

    private async moveFromQueue(box: string) {
        if (!box) return;
        const rows = await siyuan.sqlAttr(`select * from attributes where name="${TOMATO_IDEA_QUEUE}"`);
        if (rows.length == 0) {
            return;
        }
        const ideaIDs = (await Promise.all(rows.map(row => siyuan.getChildBlocks(row.root_id)))).flat().map(c => c.id);
        const ideas = await siyuan.getRows(ideaIDs, "created,markdown,content,alias,type", false, [/*`box="${box}"`,*/ "markdown is not null", "LENGTH(markdown) > 0"]);
        if (ideas.length == 0) {
            await this.removeQueueDocs(box, rows);
            return;
        }
        ideas.sort((a, b) => {
            return a.created.localeCompare(b.created);
        });
        const dayID = await getTargetID(box);
        if (!dayID) return;

        let ops = [];
        if (flashRelayByTime.get()) {
            // need-0926-11 归位分支：逐条按记录时刻锚定（首个更晚时刻速记块前；非速记块
            // 透明穿越/无更晚锚尾插兜底见 planRelayTimeSlots）；头插开关让位（归位语义自带
            // 位置决策，与 shorthandRelay 同口径）。队列块=手机端落块原块（保 id 保属性，
            // idea-time 已随块带上），tailID=块自身；时刻=created 全时间戳（跨天队列块正确）
            const anchors = await relayAnchorBlocks(dayID);
            const slots = planRelayTimeSlots(anchors, ideas.map(i => ({
                created: i.created,
                ideaTime: hhmmFromCreated(i.created),
                tailID: i.id,
            })));
            for (let i = 0; i < ideas.length; i++) {
                const slot = slots[i];
                if (slot.kind === "head") ops.push(...siyuan.transMoveBlocksAsChild([ideas[i].id], dayID));
                else ops.push(...siyuan.transMoveBlocksAfter([ideas[i].id], slot.anchorID));
            }
            debugLog("shorthand_relay", `time-order queue merge ideas=${ideas.length} anchorBlocks=${anchors.length}`, "dailynote");
        } else if (flash_thoughts_2_top.get()) {
            // 头插分支反向传参=刻意：净契约「传什么序落什么序」（6808 实证 □7），ideas 已按
            // created 升序，reverse 后落序=新→旧，配合前插语义成 feed（最新闪念恒在日记最顶，
            // 批内批间皆全序倒排）；尾插分支则传正序落旧→新时间线——勿删此 reverse（双重反转
            // 家族审计时差点误判，见 docs/checkpoints dailynote □7）
            ops = siyuan.transMoveBlocksAsChild(ideas.map(i => i.id).reverse(), dayID);
        } else {
            const tails = await siyuan.getTailChildBlocks(dayID, 1);
            if (tails.length > 0) {
                const tailID = tails[0].id;
                if (tailID && await siyuan.checkBlockExist(tailID)) {
                    ops = siyuan.transMoveBlocksAfter(ideas.map(i => i.id), tailID);
                }
            }
        }
        if (ops.length > 0) {
            await siyuan.transactions(ops);
            // □4 落点 C：开关开时给搬进日记的队列块补时间记录标记（与 □2/□3 同协议，移动端
            // 闪念经队列合并进日记后才能被统计插件识别）。move 事务保块 id 故可直接回填；
            // date/time 取块 created（记录时刻）非搬运时刻——跨天合并语义；「闪念」是块属性值
            // 非 UI 文案，固定中文不 i18n。单条失败吞错留痕不阻断搬运主链
            if (flashStatTag.get()) {
                // need-0926-10：队列块 idea-type 批查（纯文本块无 alias 无引用锚，唯一
                // 类型源=idea-type 属性——搬运补标照认「纯文本」不落「闪念」兜底；
                // emoji/引用块无此属性零影响；root_id 限队列文档族，rows 非空保证 in 非空）
                const plainTypeOf = new Map(
                    (await siyuan.sqlAttr(
                        `select block_id, value from attributes where name="custom-tomato-idea-type" and root_id in (${rows.map(r => sqlQuoteStr(r.root_id)).join(",")})`
                    )).map(r => [r.block_id, (r.value ?? "").trim()])
                );
                for (const i of ideas) {
                    if (i.type !== "p") continue;
                    try {
                        // need-0926-14：content 改 content 列纯文本源（markdown 列 ((id 'xx'))
                        // 块引用原文会污染 custom-lifelog-content，时迹类插件检测失效）+
                        // type 从 alias/首部引用锚还原手机端所选分类（原恒写死「闪念」）；
                        // need-0926-10：纯文本块经 ideaType 参还原
                        const src = queueLifelogSource(i, plainTypeOf.get(i.id) || undefined);
                        await siyuan.setBlockAttrs(i.id, lifelogAttrs({
                            content: src.content,
                            type: src.type,
                            time: i.created.slice(8, 10) + ":" + i.created.slice(10, 12),
                            date: ymdFromCreated(i.created),
                        }));
                    } catch (e) {
                        debugLog("flashlog", `queue tag fail ${i.id}: ${e}`, "dailynote");
                    }
                }
            }
            // □4 即搬即清：事务 HTTP 恒 code 0（op 级失败只走 ws 回声）——删队列文档前
            // fresh 重扫 getChildBlocks 确认真的搬空，防事务竞态删到未搬空的
            await this.removeQueueDocs(box, rows);
            // need-0926-18：队列合并后主动重算日记间隔（免等下次打开日记；块搬运保 id
            // +补标记刚落，延迟起步等属性索引窗）
            requestIdeaIntervalCalc(dayID);
            setTimeout(() => {
                for (const { id } of ideas.slice().reverse()) {
                    OpenSyFile2(this.plugin, id);
                    break;
                }
            }, 1000);
        }
    }

    /** 删空的队列文档：逐文档 fresh 重扫子块，仅删确认搬空的（attributes 行无 path 列，
     * removeDoc 走 getRowByID 拿真 path——旧代码 row.path 恒 undefined 属存量坏参顺手修）。
     * 「搬空」判定=非空子块数 0：内核 move 事务搬空文档时会自动补一个空段落
     * （6808 实测 x08pbjs 形态），kids.length==0 永不成立 */
    private async removeQueueDocs(box: string, rows: { root_id: string }[]) {
        for (const row of rows) {
            try {
                const kids = await siyuan.getChildBlocks(row.root_id);
                const nonEmpty = kids.filter(k => ((k as any).content ?? "").trim() !== "");
                if (nonEmpty.length > 0) continue;
                const docRow = await siyuan.getRowByID(row.root_id);
                if (docRow?.path) await siyuan.removeDoc(box, docRow.path);
            } catch { /* 删失败留待下次搬运重试 */ }
        }
    }
}

export async function getTargetID(box: string) {
    if (!box) box = events.boxID;
    if (!box) return;
    const targetFile = flash_thoughts_target_file.get()?.trim();
    if (targetFile) {
        // 用户配置串含引号会炸 SQL（内核静默 null 落不到提示）——单引号字面量+转义
        const row = await siyuan.sqlOne(`select id from blocks where type='d' and content=${sqlQuoteStr(targetFile)} limit 1`)
        if (row?.id)
            return row.id;
        siyuan.pushMsg(`${tomatoI18n.拍照闪念}：${tomatoI18n.找不到您配置的文件}："${targetFile}"`)
    }
    const note = await siyuan.createDailyNote(box);
    // fballfb □13：selectedNotebook 指向不存在笔记本（克隆 petal 场景）时内核 code -1
    // 被 siyuan.call 吞成 null，裸取 .id 抛 TypeError（pageerror）=面板静默不落块——
    // 判空提示后返回 undefined（getTargetID 本就允许 undefined，docAction execute 同款
    // 兜底先例 fballtail □7）
    if (!note?.id) {
        await siyuan.pushMsg(tomatoI18n.无可用笔记本请先打开, 2500);
        return;
    }
    if (events.isMobile) {
        const { y, M, d } = timeUtil.nowYMDStrPad();
        if (shouldRepinDailyNote(noteBox.mobilePinnedYMD, y + M + d)) {
            noteBox.mobilePinnedDailynoteID = note.id;
            noteBox.mobilePinnedYMD = y + M + d;
        }
        return noteBox.mobilePinnedDailynoteID;
    }
    return note.id;
}

export const noteBox = new NoteBox();

/** need-0926-18 主动重算防抖表：docID → timer（同文档保存连发合并一次 calc） */
const ideaIntervalCalcTimers = new Map<string, number>();

/** need-0926-18：主动重算通道（保存/官方速记搬运/队列合并后免等下次打开日记）。
 *  延迟起步=等 custom-* 属性 SQL 索引窗（setBlockAttrs 后 attributes 表 1~4s 延迟，
 *  在档坑；早算会漏新块）；防抖合并连发。avoiding+移动端=落点是队列文档非日记
 *  （getTargetDoc 改道），calc 无意义直接跳（与事件链同款门控）。fire-and-forget，
 *  calc 本身幂等（diff 相同值零写入），失败 debugLog 留痕不阻断调用方 */
export function requestIdeaIntervalCalc(docID: string, delayMs = 3000) {
    if (!docID) return;
    if (avoiding_cloud_synchronization_conflicts.get() && events.isMobile) return;
    const prev = ideaIntervalCalcTimers.get(docID);
    if (prev) window.clearTimeout(prev);
    ideaIntervalCalcTimers.set(docID, window.setTimeout(() => {
        ideaIntervalCalcTimers.delete(docID);
        noteBox.calcTimeInterval(docID).catch(e => {
            debugLog("flashlog", `interval calc fail ${docID}: ${e}`, "dailynote");
        });
    }, delayMs));
}

/** need-0926-18 手动「重算速记间隔」命令体/设置保存链挂点：对当前打开文档重算。
 *  编辑器取 events.currentProtyle() 统一通道（插件重载后到首次点击前的空窗里裸取
 *  .protyle=TypeError 静默死，两路皆空=undefined 判空早退）；非日记文档=命令通道给
 *  toast（notify=true）、保存链静默（面板已关再弹提示扰人）。模式切换重算当日=IndexConf
 *  save() 检测 idea-interval-mode 落盘后调本函数（silent） */
export async function recalcIntervalForCurrentDoc(notify: boolean) {
    const protyle = events.currentProtyle();
    const docID = protyle?.block?.rootID;
    if (!docID || !isDailyNoteIal((protyle as any)?.background?.ial as any)) {
        if (notify) siyuan.pushMsg(tomatoI18n.当前文档不是日记);
        return;
    }
    const changed = await noteBox.calcTimeInterval(docID);
    debugLog("flashlog", `interval recalc doc=${docID} changed=${changed}`, "dailynote");
    if (notify) siyuan.pushMsg(tomatoI18n.已重算速记间隔);
}

export function getTime() {
    const d = new Date();
    const time = timeUtil.dateFormatTime(d);
    return time.split(":").slice(0, 2).join(":");
}

/** 产出待插 markdown 与容器块 id（id 供近期列表点击跳日记定位；Dom 通道自插无 md）。
 *  iconOverride：外部通道（速记器）固定类型落块用，不传=面板当前选择；
 *  dayID：调用方已解析的落点文档（insertIntoDailynote 必传，省一次 getTargetDoc 往返）。
 *  □4 落块形态三态（flashBlockForm store，libs/flashBlockForm）：super=双层 sb/para=裸段落
 *  （默认，bear 09-21 拍板）/list=裸列表项——裸形态无壳直落（解「删内容留壳→删壳报错」）。md 通道
 *  twoStep 形态（列表/任务双层结构 IAL 挂容器，实测坑 09-21）只产裸 md，属性由
 *  insertIntoDailynote 插完解析 item 本体两步回填 */
async function getContent2insert(text: string, isPic: boolean, iconOverride?: string, dayID?: string): Promise<{ md?: string; id?: string; twoStep?: boolean; lifelogHost?: string }> {
    const boxID = storeNoteBox_selectedNotebook.getOr();
    text = text.trim();
    const icon = (iconOverride ?? storeNoteBox_selectedNoteType.get()).trim();
    const form = coerceFlashBlockForm(flashBlockForm.get());
    if (isPic) {
        return { md: text };
    }
    // need-0926-13：四值分流（kindChannel）——声明反查 kindAliasDeclared 用 chips 同一
    // 设置串（chips 显示名=剥「@别名」后缀名，选中态与分流同名源）
    const channel = kindChannel(icon, kindAliasDeclared(icon, noteBoxAllKinds.get()));
    if (channel === "plain") {
        // need-0926-10：纯文本类型（陆杰 09-26 拍板方案 A）——不建引用不落 alias 的裸
        // 内容块（日记里零类型痕迹），形态随 flashBlockForm 三态与 emoji 分支同构；
        // idea-type 标记+idea-time 照写=近期列表（need-15 第二还原键）/统计/搬运归位
        // 照进照认；显示层免时间胶囊/间隔角标在 cssStyle（flashThoughtsCSS 排除规则）
        const r = flashMD(text, getTime(), form, undefined, false, PLAIN_KIND);
        return { md: r.md, id: r.id, twoStep: r.twoStep };
    } else if (channel === "aliasEmoji") {
        // need-0926-17：内置 8 emoji 集合提取共享常量（原 7 元素数组+📌 单判两分支合一，
        // 行为等价——📌 走 task=true 同旧）；need-0926-13 起用户声明的自定义 emoji（如
        // 「🎯@别名」）同入本通道——正文零标记维持现状口径（陆杰拍板）
        const r = flashMD(text, getTime(), form, icon, icon === "📌");
        return { md: r.md, id: r.id, twoStep: r.twoStep };
    } else if (channel === "aliasText") {
        // need-0926-13 文字别名（「@别名」声明，陆杰 09-26 17:01 拍板）：不建引用文档，
        // 正文「别名名称：内容」前缀（名称按设置字数完整展示不截断）+alias/idea-type
        // 双写——alias=属性行类型标记（emoji 通道同款，近期列表 alias 列优先直读）、
        // idea-type=need-15 派生链第二还原键（历史块 alias 被改时兜底）；md 通道与
        // emoji 分支同构（形态随 flashBlockForm 三态）
        const r = flashMD(aliasNoteBody(icon, text), getTime(), form, icon, false, icon);
        return { md: r.md, id: r.id, twoStep: r.twoStep };
    } else {
        const id = await createRefDoc(boxID, icon);
        // □4 图片 compose：混合内容（含 ![](…)）走 md2Divs（Lute Md2BlockDOM，行内旗标
        // 已配）真渲染图片块——domNewLine 的文本节点通道会把图片语法落成字面文本；
        // 纯文本维持 domNewLine 原样（原文以字面文本入库，不走 markdown 解析）
        const blocks = (() => {
            if (!/!\[[^\]]*\]\([^)]+\)/.test(text)) return [domNewLine(text)];
            const parsed = md2Divs(text);
            return parsed.length > 0 ? parsed : [domNewLine(text)];
        })();
        // add_ref 挂点取首个带 contenteditable 的块（首块可能是图片/hr/代码块，
        // add_ref 对无 contenteditable 元素静默 no-op 会丢分类锚——review P2）；全无则补空段
        let textDiv = blocks.find((b) => getContenteditableElement(b) != null);
        if (!textDiv) {
            textDiv = domNewLine();
            blocks.unshift(textDiv);
        }
        add_ref(textDiv, id, icon, false, false);
        const targetDoc = dayID ?? await getTargetDoc();
        // □4 三态包装：para=多块平铺属性挂内容锚/list=单 li 收块属性挂 li/super=双层 sb（原状）
        const w = wrapFlashBlocksDOM(blocks, textDiv, form, getTime());
        if (flash_thoughts_2_top.get()) {
            // 只能放到这里，不能放到insertIntoDailynote，只能插入到编辑器，刷新消失。
            //
            // 未解之谜！！！
            await siyuan.insertBlocksAsChildOf(w.htmls, targetDoc);
        } else {
            const lastID = await siyuan.getDocLastID(targetDoc);
            await siyuan.insertBlocksAfter(w.htmls, lastID);
        }
        return { id: w.blockID, lifelogHost: w.bare ? textDiv.getAttribute(DATA_NODE_ID) ?? undefined : undefined };
    }
}

// save to dailynote（返回值=收集容器/条目块 id，近期列表点击跳转用；图片兜底通道无容器）。
// iconOverride：速记器等外部通道固定类型（不走面板当前选择），落块与其完全同构
export async function insertIntoDailynote(text: string, isPic = false, iconOverride?: string): Promise<string | undefined> {
    const dayID = await getTargetDoc();
    const r = await getContent2insert(text, isPic, iconOverride, dayID);
    if (!r.md) {
        // flashlog □2：DOM 支容器直插完成即回填（预挂 id 事务通道保留）；□4 bare 形态宿主=内容锚
        tagLifelogAfterInsert(r.lifelogHost, r.lifelogHost ? undefined : r.id, text, isPic, iconOverride);
        // need-0926-18：记完即时重算间隔（免等下次打开日记；延迟起步等属性索引窗）
        requestIdeaIntervalCalc(dayID);
        return r.id;
    }
    let blockID = r.id;
    let lifelogHost = r.id;
    if (r.twoStep) {
        // □4 两步形态：列表/任务双层结构 IAL 内嵌挂容器（实测坑 09-21）——插裸块后解析
        // item 本体补属性。响应首 id=外层容器；getChildBlocks=blocktree 直读 insert 响应
        // 后零等待（在档契约）
        const resp = flash_thoughts_2_top.get()
            ? await siyuan.insertBlockAsChildOf(r.md, dayID)
            : await siyuan.appendBlock(r.md, dayID);
        const cID = firstOpID(resp);
        const itemID = cID ? await firstTypedChild(cID, "i") : undefined;
        if (itemID) {
            const icon = (iconOverride ?? storeNoteBox_selectedNoteType.get()).trim();
            // need-0926-10：纯文本类型不落 alias（零类型痕迹）改挂 idea-type 标记
            // （kindChannel 同款口径）；need-0926-13：文字别名=alias+idea-type 双写
            // （面板 aliasText 分支同构）；emoji 分支 alias 直写照旧
            const ch = kindChannel(icon, kindAliasDeclared(icon, noteBoxAllKinds.get()));
            await siyuan.setBlockAttrs(itemID, ch === "plain"
                ? flashAttrs(getTime(), undefined, PLAIN_KIND)
                : ch === "aliasText"
                    ? flashAttrs(getTime(), icon, icon)
                    : flashAttrs(getTime(), icon));
            // lifelog 宿主=内层 p（生态四键识别面 type='p' 契约），无 p（纯子列表等）退化 item 自身
            lifelogHost = (await firstTypedChild(itemID, "p")) ?? itemID;
            blockID = itemID;
        } else if (cID) {
            // 解析失败兜底：属性挂容器保识别（近期列表定位容器仍有效），留痕不阻断
            await siyuan.setBlockAttrs(cID, flashAttrs(getTime()));
            blockID = cID;
            lifelogHost = cID;
            debugLog("flashlog", `two-step item resolve fail, attrs fallback to container ${cID}`, "dailynote");
        }
    } else {
        const resp = flash_thoughts_2_top.get()
            ? await siyuan.insertBlockAsChildOf(r.md, dayID)
            : await siyuan.appendBlock(r.md, dayID);
        // □16：isPic 兜底通道（失焦关窗在途图直落，唯一 isPic=true 调用点）补挂
        // idea-time——对齐 DOM 通道含图内容形态（主链纯图照挂，仅此兜底链曾漏），近期
        // 列表（recentDerived 按该键派生）与搬运归位照认；普通 md 通道自带 IAL 不经过
        // 此补挂。挂失败不阻断落块（列表缺该条而已，debugLog 留痕）
        if (isPic) {
            const picID = firstOpID(resp);
            if (picID) {
                try {
                    await siyuan.setBlockAttrs(picID, flashAttrs(getTime()));
                } catch (e) {
                    debugLog("flashlog", `pic attrs fail ${picID}: ${e}`, "dailynote");
                }
            }
        }
    }
    // flashlog □2：md 支插完回填（预挂 id markdown 通道被认领）；super 形态下钻首个 p
    tagLifelogAfterInsert(lifelogHost, lifelogHost ? undefined : blockID, text, isPic, iconOverride);
    // need-0926-18：记完即时重算间隔（免等下次打开日记；延迟起步等属性索引窗）
    requestIdeaIntervalCalc(dayID);
    return blockID;
}

/** 插入响应首 op 块 id（appendBlock/insertBlock data=[{doOperations:[{id}]}]，siyuan.call
 *  已解包；形态不符返 undefined 走兜底） */
function firstOpID(resp: unknown): string | undefined {
    const ops = (resp as { doOperations?: { id?: string }[] }[] | null)?.[0]?.doOperations;
    return Array.isArray(ops) ? ops[0]?.id : undefined;
}

/** 首个指定短型 type 子块 id（getChildBlocks 词表=SQL 短型 'p'/'i'/'l'/'s'） */
async function firstTypedChild(id: string, type: string): Promise<string | undefined> {
    const kids = await siyuan.getChildBlocks(id);
    return (kids ?? []).find(k => k.type === type)?.id;
}

/** flashlog □2+□4：开关开时给闪念内容段落块补时间记录标记（content=闪念全文、
 *  type=所选类型、time=落块时刻）。host=已知宿主块 id（□4 bare 形态=落块时已定：裸段落/
 *  列表项自身或内层 p）；host 空而 drillFrom 给出=super 形态从收集容器下钻。fire-and-forget：
 *  标记失败不阻断落块主链（debugLog 留痕）；图片通道（无容器/无文本语义）与开关关时零行为 */
function tagLifelogAfterInsert(host: string | undefined, drillFrom: string | undefined, text: string, isPic: boolean, iconOverride?: string) {
    if (!flashStatTag.get() || (!host && !drillFrom) || isPic) return;
    const type = (iconOverride ?? storeNoteBox_selectedNoteType.get()).trim();
    void (async () => {
        try {
            const pID = host ?? await firstParaBlock(drillFrom as string);
            if (!pID) return;
            await siyuan.setBlockAttrs(pID, lifelogAttrs({ content: text.trim(), type, time: getTime() }));
        } catch (e) {
            debugLog("flashlog", `tag fail host=${host} drill=${drillFrom}: ${e}`, "dailynote");
        }
    })();
}

/** 收集容器（可能双层 sb）内首个段落块 id：getChildBlocks 只返第一层，须递归下钻；
 *  图/代码块等非段落跳过（首 p=闪念正文所在块）。□4 起 super 形态专用（bare 形态宿主
 *  落块时已定） */
async function firstParaBlock(id: string): Promise<string | undefined> {
    const kids = await siyuan.getChildBlocks(id);
    for (const k of kids) {
        if (k.type === "p") return k.id;
        if (k.type === "s") {
            const inner = await firstParaBlock(k.id);
            if (inner) return inner;
        }
    }
    return undefined;
}

async function getTargetDoc() {
    const boxID = storeNoteBox_selectedNotebook.getOr();
    const id = await getTargetID(boxID);
    if (!id) return;
    if (avoiding_cloud_synchronization_conflicts.get() && events.isMobile) {
        const row = await siyuan.getRowByID(id);
        if (row?.hpath?.length > 0) {
            const qID = NewNodeID();
            const attrs = {};
            attrs[TOMATO_IDEA_QUEUE] = "1";
            return siyuan.createDocWithMd(
                boxID,
                `${row.hpath}/${qID}`,
                "",
                qID,
                attrs,
            );
        }
    }
    return id;
}