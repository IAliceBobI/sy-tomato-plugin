import { adaptHotkey, Custom, Dialog, IProtyle } from "siyuan";
import { events, EventType } from "./libs/Events";
import { add_ref, convertMinutesToTimeFormat, getContenteditableElement, intervalMinutesBetween, isMainWin, NewNodeID, parseIDTimestamp, setTimeouts, siyuan, sleep, sqlQuoteStr, timeUtil, } from "./libs/utils";
import NoteBoxSvelte from "./NoteBox.svelte";
import { DATA_NODE_ID, TOMATO_IDEA_QUEUE } from "./libs/gconst";
import { DestroyManager } from "./libs/destroyer";
import { avoiding_cloud_synchronization_conflicts, flash_thoughts_2_top, flash_thoughts_target_file, flashBlockForm, flashStatTag, noteBoxCheckbox, noteBoxMobileSync, storeNoteBox_fastnote, storeNoteBox_pin, storeNoteBox_selectedNotebook, storeNoteBox_selectedNoteType } from "./libs/stores";
import { lifelogAttrs, shouldRepinDailyNote, ymdFromCreated } from "./libs/dailyCollect";
import { debugLog } from "./libs/logUtils";
import { isDailyNoteIal } from "./libs/dailyReview";
import { isPinned, removeStatusBar } from "./libs/ui";
import { createRefDoc, OpenSyFile2 } from "./libs/docUtils";
import { tomatoI18n } from "./tomatoI18n";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { domNewLine, md2Divs } from "./libs/sydom";
import { coerceFlashBlockForm, flashAttrs, flashMD, wrapFlashBlocksDOM } from "./libs/flashBlockForm";
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

    private async calcTimeInterval(docID: string) {
        if (!docID) return;
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

        if (timeMap.size == 0) return
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
        for (let i = 1; i < times.length; i++) {
            await this.updateTimeInterval(times[i - 1], times[i])
        }
    }

    private async updateTimeInterval(a: ID_Time, b: ID_Time) {
        // created 全时间戳优先（跨天块如队列搬运块与平面 HH:MM 会错出 20h 级差值）
        const minutes = intervalMinutesBetween(a, b)
        if (minutes == null) return
        const interval = convertMinutesToTimeFormat(minutes)
        const at = parseIDTimestamp(a.created ?? "");
        const bt = parseIDTimestamp(b.created ?? "");
        const aEarlier = (!isNaN(at) && !isNaN(bt))
            ? at < bt
            : (new Date("2020-01-01 " + a.time)).getTime() < (new Date("2020-01-01 " + b.time)).getTime();
        if (aEarlier) {
            if (interval != a.interval) {
                await siyuan.setBlockAttrs(a.id, { "custom-tomato-idea-interval": interval })
            }
        } else {
            if (interval != b.interval) {
                await siyuan.setBlockAttrs(b.id, { "custom-tomato-idea-interval": interval })
            }
        }
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

    private addTab() {
        this.custom; // 压 TS6133：custom 只在 onload 前的类型期被赋值读用
        // □4 窗口统一化（2026-09-07）：「拍照闪念（全局）」命令退役——全局入口收拢到速记器 ⌥J
        // （外部轻窗默认/带出思源面板可配），图片闪念走 Dock 图标/速记器 focus 形态进面板
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
        const ideas = await siyuan.getRows(ideaIDs, "created,markdown,type", false, [/*`box="${box}"`,*/ "markdown is not null", "LENGTH(markdown) > 0"]);
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
        if (flash_thoughts_2_top.get()) {
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
                for (const i of ideas) {
                    if (i.type !== "p") continue;
                    try {
                        await siyuan.setBlockAttrs(i.id, lifelogAttrs({
                            content: (i.markdown ?? "").trim(),
                            type: "闪念",
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
    } else if (["💡", "🏞️", "💪", "💬", "🍴", "📚", "💼"].includes(icon)) {
        const r = flashMD(text, getTime(), form, icon);
        return { md: r.md, id: r.id, twoStep: r.twoStep };
    } else if (icon === "📌") {
        const r = flashMD(text, getTime(), form, icon, true);
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
            await siyuan.setBlockAttrs(itemID, flashAttrs(getTime(), icon));
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
        if (flash_thoughts_2_top.get()) {
            await siyuan.insertBlockAsChildOf(r.md, dayID);
        } else {
            await siyuan.appendBlock(r.md, dayID);
        }
    }
    // flashlog □2：md 支插完回填（预挂 id markdown 通道被认领）；super 形态下钻首个 p
    tagLifelogAfterInsert(lifelogHost, lifelogHost ? undefined : blockID, text, isPic, iconOverride);
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