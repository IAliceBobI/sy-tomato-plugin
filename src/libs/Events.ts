import { Plugin, getFrontend, Protyle, IProtyle, IEventBusMap, getBackend } from "siyuan";
import { getCursorElement, getID, getNotebookFirstOne, siyuan } from "./utils";
import { collectSelectedBlocks } from "./selection";
import { DATA_NODE_ID } from "./gconst";
import { writableWithGet } from "./stores";

export enum EventType {
    click_editorcontent = "click-editorcontent",
    open_menu_doctree = "open-menu-doctree",
    loaded_protyle_static = "loaded-protyle-static",
    loaded_protyle_dynamic = "loaded-protyle-dynamic",
    switch_protyle = "switch-protyle",
    destroy_protyle = "destroy-protyle",
    ws_main = "ws-main",
    click_flashcard_action = "click-flashcard-action",
    click_blockicon = "click-blockicon",
    click_pdf = "click-pdf",
    click_editortitleicon = "click-editortitleicon",
    open_noneditableblock = "open-noneditableblock",
    open_menu_blockref = "open-menu-blockref",
    open_menu_fileannotationref = "open-menu-fileannotationref",
    open_menu_tag = "open-menu-tag",
    open_menu_link = "open-menu-link",
    open_menu_image = "open-menu-image",
    open_menu_av = "open-menu-av",
    open_menu_content = "open-menu-content",
    open_menu_breadcrumbmore = "open-menu-breadcrumbmore",
    input_search = "input-search",
    paste = "paste",
    open_siyuan_url_plugin = "open-siyuan-url-plugin",
    open_siyuan_url_block = "open-siyuan-url-block",
    sync_start = "sync-start",
    sync_end = "sync-end",
    sync_fail = "sync-fail",
    opened_notebook = "opened-notebook",
    closed_notebook = "closed-notebook",
}

class Events {
    private _title: string;
    public get title(): string {
        return this._title;
    }

    private _docID: string;
    public get docID(): string {
        return this._docID;
    }
    public setDocID(s: string) {
        this._docID = s
    }

    public get lastBlockID(): string {
        return getID(getCursorElement());
    }

    private _boxID: string;
    public get boxID(): string {
        if (this._boxID) return this._boxID;
        return getNotebookFirstOne()?.id ?? "";
    }

    private _protyle: Protyle;
    public get protyle(): Protyle {
        return this._protyle;
    }

    private _isDesktop: boolean;
    public get isDesktop(): boolean {
        return this._isDesktop;
    }

    public get isMac(): boolean {
        const b = getBackend();
        return b == "darwin" || b == "ios";
    }

    public get isWindows(): boolean {
        const b = getBackend();
        return b == "windows";
    }

    private _isBrowser: boolean;
    public get isBrowser(): boolean {
        return this._isBrowser;
    }

    private _isMobile: boolean;
    public get isMobile(): boolean {
        return this._isMobile;
    }

    private _readingPointMap: Map<string, EventsReadingPoint> = new Map();
    public get readingPointMap(): Map<string, EventsReadingPoint> {
        return this._readingPointMap;
    }

    private _wsListeners: Map<string, wsCB> = new Map();
    public addWsListener(name: string, cb: wsCB) { this._wsListeners.set(name, cb); }
    private invokeWs(detail: WsMain) {
        for (const cb of this._wsListeners.values()) {
            cb(detail);
        }
    }

    private _protyleListeners: Map<string, eventCB> = new Map();
    public addListener(name: string, cb: eventCB) { this._protyleListeners.set(name, cb); }
    public addListener_open_menu_doctree(name: string, cb: (detail: IEventBusMap[EventType.open_menu_doctree]) => any) {
        this.addListener(name, (EventType.open_menu_doctree, (eType, detail) => {
            if (eType === EventType.open_menu_doctree) cb(detail)
        }));
    }

    // issue #78: 对 4 个高频 protyle 事件做 per-protyle trailing debounce，
    // 同一 protyle 在 300ms 内多次触发只派发最后一次，避免快速切页签时的事件风暴。
    private static readonly DEBOUNCE_MS = 300;
    private static readonly DEBOUNCE_EVENTS = new Set<string>([
        EventType.click_editorcontent,
        EventType.loaded_protyle_static,
        EventType.loaded_protyle_dynamic,
        EventType.switch_protyle,
    ]);
    private _debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

    private invokeCB(eventType: string, detail: Protyle) {
        // store 更新必须立即同步执行（UI 依赖 events.protyle/docID）
        this.setReadingPointMap(eventType, detail);

        if (Events.DEBOUNCE_EVENTS.has(eventType)) {
            // key 含 eventType + rootID：不同事件类型/不同 protyle 互不干扰
            const rootID = (detail as any)?.protyle?.block?.rootID ?? "";
            const key = eventType + "::" + rootID;
            const old = this._debounceTimers.get(key);
            if (old) clearTimeout(old);
            const t = setTimeout(() => {
                this._debounceTimers.delete(key);
                this._dispatchToListeners(eventType, detail);
            }, Events.DEBOUNCE_MS);
            this._debounceTimers.set(key, t);
        } else {
            // 其他事件（destroy_protyle 等）立即派发
            this._dispatchToListeners(eventType, detail);
        }
    }

    private _dispatchToListeners(eventType: string, detail: Protyle) {
        for (const cb of this._protyleListeners.values()) {
            // 错误隔离：单个回调抛异常不中断其他回调
            try {
                cb(eventType, detail);
            } catch (e) {
                console.error("[tomato] event listener error:", e);
            }
        }
    }

    /** 清理所有未触发的 debounce timer（插件卸载时调用） */
    clearDebounce() {
        for (const t of this._debounceTimers.values()) {
            clearTimeout(t);
        }
        this._debounceTimers.clear();
    }

    private setReadingPointMap(eventType: string, detail: Protyle) {
        if (eventType != EventType.destroy_protyle) {
            if ((detail as any).event || this.isMobile) {
                this._protyle = detail;
                this._boxID = this.protyle?.protyle?.notebookId ?? "";
                this._title = this.protyle?.protyle?.title?.editElement?.textContent?.trim() ?? "";
                this._docID = this.protyle?.protyle?.block.rootID ?? "";
                if (currentBockEditorDocID.get() != this._docID) {
                    currentBockEditorDocID.set(this._docID);
                    currentBockEditorDocName.set(this._title);
                    currentProtyle.set(this._protyle);
                }
                if (this.docID) {
                    this._readingPointMap.set(this.docID, {
                        docID: this.docID,
                        blockID: this.lastBlockID,
                        title: this.protyle?.protyle?.title?.editElement?.textContent ?? "",
                        time: new Date(),
                    });
                }
            }
        }
    }

    private plugin: Plugin;
    onload(plugin: Plugin) {
        if (!navigator.locks) {
            (navigator as any).locks = {
                request: function (name: string, options: any, callback: any) {
                    return new Promise((resolve) => {
                        const lock = {
                            name: name,
                            mode: (options && options.mode) || "exclusive"
                        };
                        resolve(callback(lock));
                    });
                }
            };
        }

        this.plugin = plugin;

        const frontEnd = getFrontend();
        this._isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        this._isBrowser = frontEnd === "browser-desktop" || frontEnd === "browser-mobile";
        this._isDesktop = frontEnd === "desktop" || frontEnd === "desktop-window";

        this.plugin.eventBus.on(EventType.open_menu_content, ({ detail }: any) => {
            this.invokeCB(EventType.open_menu_content, detail);
        });
        this.plugin.eventBus.on(EventType.click_editorcontent, ({ detail }: any) => {
            this.invokeCB(EventType.click_editorcontent, detail);
        });
        this.plugin.eventBus.on(EventType.open_menu_doctree, ({ detail }: any) => {
            this.invokeCB(EventType.open_menu_doctree, detail);
        });
        this.plugin.eventBus.on(EventType.loaded_protyle_static, ({ detail }: any) => {
            this.invokeCB(EventType.loaded_protyle_static, detail);
        });
        this.plugin.eventBus.on(EventType.destroy_protyle, ({ detail }: any) => {
            this.invokeCB(EventType.destroy_protyle, detail);
        });
        this.plugin.eventBus.on(EventType.loaded_protyle_dynamic, ({ detail }: any) => {
            this.invokeCB(EventType.loaded_protyle_dynamic, detail);
        });
        this.plugin.eventBus.on(EventType.switch_protyle, ({ detail }: any) => {
            this.invokeCB(EventType.switch_protyle, detail);
        });
        this.plugin.eventBus.on(EventType.sync_fail, ({ detail }: any) => {
            this.invokeCB(EventType.sync_fail, detail);
        });
        this.plugin.eventBus.on(EventType.sync_start, ({ detail }: any) => {
            this.invokeCB(EventType.sync_start, detail);
        });
        this.plugin.eventBus.on(EventType.sync_end, ({ detail }: any) => {
            this.invokeCB(EventType.sync_end, detail);
        });
        this.plugin.eventBus.on(EventType.ws_main, ({ detail }: { detail: WsMain }) => {
            if (detail?.cmd == null) return;
            if (detail.cmd === "backgroundtask") return;
            if (detail.cmd === "statusbar") return;
            if (detail.cmd === "reloadPlugin") return;
            // databaseIndexCommit 不再过滤（□13）：它是反链面板的数据失效信号
            // （纯内容编辑对列表级 revision 不可见，官方面板靠它主动失效）
            if (detail.cmd === "syncing") return;
            this.invokeWs(detail);
        });
    }

    public protyleReload(protyle?: Protyle | IProtyle) {
        if (protyle == null) protyle = this.protyle;
        let obj = (protyle as Protyle)?.protyle?.getInstance();
        if (obj == null) obj = (protyle as IProtyle)?.getInstance();
        if (obj?.reload != null) obj?.reload(true);
    }

    public getInfo(protyle?: IProtyle) {
        if (protyle == null) protyle = this?.protyle?.protyle;
        if (protyle == null) return {}
        return {
            blockID: (protyle.breadcrumb as any)?.id,
            breadcrumb: protyle.breadcrumb,
            docID: protyle.block?.rootID,
            notebookId: protyle.notebookId,
            lute: protyle.lute,
            path: protyle.path,
            name: protyle.title?.editElement?.textContent,
            attrs: (protyle.background?.ial ?? {}) as AttrType,
        }
    }

    async isDocReadonly(protyle?: IProtyle, ial?: AttrType) {
        if (!protyle) protyle = this.protyle?.protyle;
        if (!ial) {
            ial = await siyuan.getBlockAttrs(protyle.block.rootID);
        }
        if (ial) {
            return ial["custom-sy-readonly"] === "true";
        }
        return true;
    }

    async selectedDivs(protyle?: IProtyle) {
        if (!protyle) protyle = this.protyle?.protyle;
        let docName = protyle?.title?.editElement?.textContent;
        if (!docName) {
            docName = await siyuan.getDocNameByBlockID(this.lastBlockID);
        }
        const element = protyle?.wysiwyg?.element;
        const docID = protyle?.block?.rootID;
        if (element && docID) {
            let { selected, ids, rangeText, range, cursorOnly } = this.collectInfo(element);
            return { selected, ids, docID, element, rangeText, range, docName, boxID: protyle.notebookId, cursorOnly };
        } else {
            // 早退补默认字段（review P2-4）：解构 {...selected} 的调用方（seller hotMenuTools 五处）
            // 对裸 {} 的 undefined spread 前存即崩，cursorOnly 缺省语义=非块选/拖蓝
            return { selected: [], ids: [], docID: "", element: undefined, rangeText: "", range: undefined, docName, boxID: protyle?.notebookId, cursorOnly: true };
        }
    }

    selectedDivsSync(protyle?: IProtyle) {
        if (!protyle) protyle = this.protyle?.protyle;
        let docName = protyle?.title?.editElement?.textContent;
        const element = protyle?.wysiwyg?.element;
        const docID = protyle?.block?.rootID;
        if (element && docID) {
            let { selected, ids, rangeText, range, cursorOnly } = this.collectInfo(element);
            return { selected, ids, docID, element, rangeText, range, docName, boxID: protyle.notebookId, cursorOnly };
        } else {
            return { selected: [], ids: [], docID: "", element: undefined, rangeText: "", range: undefined, docName, boxID: protyle?.notebookId, cursorOnly: true };
        }
    }

    private collectInfo(element: HTMLDivElement) {
        // □8 期3：三级链委托跨插件共享函数（libs/selection.ts 唯一事实源），此处只剩
        // tomato 侧语义保真映射——共享函数光标级上爬顶层容器是 recite/progressive 顶层流
        // 语义，tomato 消费方（fold 折叠列表项/快速笔记摘块/Tag2Ref 取块文本/PairBar 预填
        // 摘要）契约=最近内层块，cursor 级换回原始 getCursorElement；cursorOnly=光标级+
        // 全空两态（消费方判据「非块选/拖蓝」）；rangeText 走共享函数硬契约（仅拖蓝态，
        // 块选/跨面板的陈旧划词残留不再误当文本——Annotations isSel/划词摘抄消费方更稳）。
        // range 只认活 selection（不引入 toolbar.range 回退链，保持 tomato 现行为）。
        const cursorEl = getCursorElement();
        const sel = document.getSelection();
        const live = sel?.rangeCount ? sel.getRangeAt(0) : undefined;
        const { blocks, level, rangeText, range } = collectSelectedBlocks(element, { range: live, cursorEl });
        const selected = level === "cursor" && cursorEl && element.contains(cursorEl)
            ? [cursorEl as HTMLElement] : blocks;
        const ids = selected.map(i => i.getAttribute(DATA_NODE_ID));
        // range 仅拖蓝级透传（review P2-1 收紧）：共享函数对所有 level 透传活 range，分屏下
        // A 文档块选/光标态 + B 文档活拖蓝时会漏出他面板 range——Annotations isSel 双门
        // 现状无实伤，但非 range 级给 undefined 封死误消费面（recite 侧 toolbar.range
        // 透传语义另有消费方，共享函数本体不动）
        return { selected, ids, rangeText, range: level === "range" ? range : undefined, cursorOnly: level === "cursor" || level === "none" };
    }
}

export const currentBockEditorDocID = writableWithGet<string>("");
export const currentBockEditorDocName = writableWithGet<string>("");
export const currentProtyle = writableWithGet<Protyle>(null);

export const events = new Events();
