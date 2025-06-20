import { Plugin } from "siyuan";
import { newID } from "stonev5-utils/lib/id";

export class BaseTomatoPlugin extends Plugin {
    constructor(options: any) {
        super(options)
    }
    loadProgStore: (p: BaseTomatoPlugin) => void;
    loadStore: (p: BaseTomatoPlugin) => void;
    id = newID();
    taskCfg: Promise<any>;
    settingCfg: TomatoSettings;
    pluginSpec: PluginSpec;
    readonly global: TomatoGlobal = globalThis as any;
    initCfg() {
        const cfg = this.global?.tomato_zZmqus5PtYRi?.pluginConfig;
        if (cfg != null) {
            console.debug("load cfg from global: pluginID: " + this.id);
            this.settingCfg = cfg;
            if (this.loadStore) this.loadStore(this);
            return true;
        }
    }
}