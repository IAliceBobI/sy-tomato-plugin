import { Plugin } from "siyuan";
import "./index.scss";


class Events {
    private _lastBlockID: string;
    public get lastBlockID(): string {
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
    private plugin: Plugin;

    onload(plugin: Plugin) {
        this.plugin = plugin;
        this.plugin.eventBus.on("click-editorcontent", ({ detail }: any) => {
            this.lastBlockID = detail?.event?.srcElement?.parentElement?.getAttribute("data-node-id") ?? this.lastBlockID;
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
        });
        this.plugin.eventBus.on("open-menu-doctree", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
        });
        this.plugin.eventBus.on("loaded-protyle-static", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
        });
        this.plugin.eventBus.on("loaded-protyle-dynamic", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
        });
        this.plugin.eventBus.on("switch-protyle", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
        });
        this.plugin.eventBus.on("destroy-protyle", ({ detail }: any) => {
            this.boxID = detail?.protyle?.notebookId ?? this.boxID;
        });
    }
}

export const events = new Events();
