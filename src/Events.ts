import { Plugin, getFrontend } from "siyuan";

class Events {
    private static readonly GLOBAL_THIS: Record<string, any> = globalThis;

    private _lastBlockID: string;
    public get lastBlockID(): string {
        const blockID = getCursorBlock();
        if (blockID) {
            this._lastBlockID = blockID;
        }
        return this._lastBlockID;
    }
    private set lastBlockID(value: string) {
        this._lastBlockID = value;
    }

    private _boxID: string;
    public get boxID(): string {
        return this._boxID;
    }
    public set boxID(value: string) {
        this._boxID = value;
    }

    private _protyle: any;
    public get protyle(): any {
        return this._protyle;
    }
    private set protyle(value: any) {
        this._protyle = value;
    }

    private _docID: string;
    public get docID(): string {
        const arr: string[] = this._protyle?.path?.split("/")?.pop()?.split(".")?.slice(0) ?? [];
        if (arr.length > 0) {
            this._docID = arr[0];
        }
        return this._docID;
    }
    private set docID(value: string) {
        this._docID = value;
    }

    private _isMobile: boolean;
    public get isMobile(): boolean {
        return this._isMobile;
    }
    private set isMobile(value: boolean) {
        this._isMobile = value;
    }

    private plugin: Plugin;

    onload(plugin: Plugin) {
        Events.GLOBAL_THIS["events_zZmqus5PtYRi"] = this;

        this.plugin = plugin;
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        this.plugin.eventBus.on("click-editorcontent", ({ detail }: any) => {
            this.lastBlockID = detail?.event?.srcElement?.parentElement?.getAttribute("data-node-id") ?? this.lastBlockID;
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
            this.protyle = detail?.protyle;
        });
        this.plugin.eventBus.on("open-menu-doctree", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
            this.protyle = detail?.protyle;
        });
        this.plugin.eventBus.on("loaded-protyle-static", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
            this.protyle = detail?.protyle;
        });
        this.plugin.eventBus.on("loaded-protyle-dynamic", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
            this.protyle = detail?.protyle;
        });
        this.plugin.eventBus.on("switch-protyle", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
            this.protyle = detail?.protyle;
        });
        this.plugin.eventBus.on("destroy-protyle", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
            this.protyle = detail?.protyle;
        });
    }
}

function getCursorBlock() {
    const selection = document.getSelection();
    const blockID = selection?.focusNode?.parentElement?.parentElement?.getAttribute("data-node-id") ?? "";
    return blockID;
}

export const events = new Events();