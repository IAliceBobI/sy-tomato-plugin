import { Plugin } from "siyuan";
import { newID } from "stonev5-utils/lib/id";

declare global {
    interface Window {
        prog_zZmqus5PtYRi: {
            timeUtil: any;
            siyuan: any;
            pluginConfig: TomatoSettings;
            save?: () => void;
        },
        tomato_zZmqus5PtYRi_doc_tracer: any;
        tomato_zZmqus5PtYRi: {
            pluginInstance: any;
            pluginID: string;
            pluginConfig: TomatoSettings;
            plugin: any;
            utils: any;
            siyuan: any;
            timeUtil: any;
            events: any;
            tools: any;
            save?: () => void;
            rmContentEmptyRefs?: () => void;
        };
    }
}

export class BaseTomatoPlugin extends Plugin {
    getDocks(): SyDock {
        return (this as any).docks
    }
    getTopBarIcons(): HTMLElement[] {
        return (this as any).topBarIcons
    }
    constructor(options: any) {
        super(options)
    }
    loadProgStore: (p: BaseTomatoPlugin) => void;
    loadStore: (p: BaseTomatoPlugin) => void;
    id = newID();
    taskCfg: Promise<any>;
    settingCfg: TomatoSettings;
    pluginSpec: PluginSpec;
    initCfg() {
        const cfg = window.tomato_zZmqus5PtYRi?.pluginConfig;
        if (cfg != null) {
            console.debug("load cfg from global: pluginID: " + this.id);
            this.settingCfg = cfg;
            if (this.loadStore) this.loadStore(this);
            return true;
        }
    }
}