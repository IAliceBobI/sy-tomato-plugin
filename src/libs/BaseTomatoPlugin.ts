import { Plugin } from "siyuan";
import { newID } from "stonev5-utils";
import type { ToolCaller } from "./agentTools";

declare global {
    interface Window {
        tomato_zZmqus5PtYRi_doc_tracer: any;
        tomato_zZmqus5PtYRi: {
            pluginInstance: any;
            /** A 层工具前端门脸（ai-agent □1）：与 kernel MCP 同源工具的直调面 */
            agentTools?: ToolCaller;
            pluginID: string;
            pluginConfig: TomatoSettings;
            plugin: any;
            utils: any;
            siyuan: any;
            timeUtil: any;
            events: any;
            tools: any;
            pairBar?: {
                trigger: () => Promise<void>;
                pickFunc: (funcID: string) => Promise<void>;
                backToFuncs: () => void;
                confirm: () => Promise<void>;
                clearBox: (slot: 1 | 2 | 3) => void;
                cancel: () => void;
                setMode: (mode: "move" | "copy" | "delete") => void;
            };
            save?: () => void;
            rmContentEmptyRefs?: () => void;
            api?: {
                assets?: {
                    buildExts: () => string[];
                    scanAssetFiles: (exts?: string[]) => Promise<{ isDir: boolean; isSymlink: boolean; name: string; updated: string }[]>;
                    readSyFiles: (exts?: string[]) => Promise<Map<string, { content: string; modified: boolean }>>;
                    createSnapshot: () => Promise<void>;
                    moveAndReplace: (files: { name: string }[], yearMonth?: string[]) => Promise<{ oldPath: string; newPath: string; success: boolean }[]>;
                    saveModifiedFiles: (syFiles: Map<string, { content: string; modified: boolean }>) => Promise<number>;
                    tidy: () => Promise<void>;
                };
            };
            ai?: {
                runAI: (text: string, anchorID: string) => Promise<any>;
                buildMessages: (text: string) => any[];
                createStream: (model: string, messages: any[]) => Promise<any> | null;
                appendChunk: (state: any, chunk: any) => any;
                stripThinkTag: (html: string) => string;
                diagnose?: () => Promise<{ ok: boolean; reason?: string; apiKey?: string; baseURL?: string; model?: string }>;
            };
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
    /** siyuan383 □3 子类覆写点：设置热更（渐进实现——含全局配置/皮肤/数据文件刷新）；
     *  保存方链路与 onDataChanged 钩子共用。默认空实现（tomato/仿写各自钩子内联，不走此口） */
    async onStorageHotReload(_beforeCfg?: unknown): Promise<void> { /* 子类覆写 */ }
    id = newID();
    taskCfg: Promise<any>;
    settingCfg: TomatoSettings;
    pluginSpec: PluginSpec;
}