import { Plugin, getFrontend, Protyle, IProtyle, IEventBusMap, getBackend } from "siyuan";
import { getCursorElement, getID, getNotebookFirstOne, siyuan } from "./utils";
import { DATA_NODE_ID, PROTYLE_WYSIWYG_SELECT } from "./gconst";
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
    private invokeCB(eventType: string, detail: Protyle) {
        this.setReadingPointMap(eventType, detail);
        for (const cb of this._protyleListeners.values()) {
            cb(eventType, detail);
        }
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
            if (detail.cmd === "databaseIndexCommit") return;
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
            return {}
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
            return {}
        }
    }

    private collectInfo(element: HTMLDivElement) {
        const selected: HTMLElement[] = [...element.querySelectorAll(`.${PROTYLE_WYSIWYG_SELECT}`)] as any;
        let cursorOnly = false;
        if (selected.length == 0) {
            cursorOnly = true;
            const e = getCursorElement();
            if (e) selected.push(e);
        }
        let range: Range, rangeText: string;
        try {
            range = document.getSelection()?.getRangeAt(0);
            rangeText = range?.cloneContents()?.textContent ?? "";
        } catch { }
        const ids = selected.map(i => i.getAttribute(DATA_NODE_ID));
        return { selected, ids, rangeText, range, cursorOnly };
    }
}

export const currentBockEditorDocID = writableWithGet<string>("");
export const currentBockEditorDocName = writableWithGet<string>("");
export const currentProtyle = writableWithGet<Protyle>(null);

export const events = new Events();
