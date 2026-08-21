// 思源内核注入的全局对象（window.siyuan / window.Lute）与插件实例取用。
// 从原 utils.ts 拆出（2026-08 重构），utils.ts 现为各领域模块的 re-export 桶。
import { Lute } from "siyuan";
import * as gconst from "./gconst";
import { BaseTomatoPlugin } from "./BaseTomatoPlugin";
import { getGlobal } from "stonev5-utils";

export const Siyuan: gconst.SiyuanType = (globalThis as any).siyuan;

export const NewLute: () => Lute = (globalThis as any).Lute.New;

export const NewNodeID: () => string = (globalThis as any).Lute.NewNodeID;

export const BlockDOM2Content: (html: string) => string = (globalThis as any).Lute.BlockDOM2Content;

export function getTomatoPluginInstance(): BaseTomatoPlugin {
    return getGlobal(gconst.TomatoPluginInstance)
}

export function getTomatoPluginConfig(): TomatoSettings {
    return getGlobal(gconst.TomatoPluginConfig)
}

export function getProgressivePluginInstance(): BaseTomatoPlugin {
    return getGlobal(gconst.ProgressivePluginInstance)
}

export function getProgressivePluginConfig(): TomatoSettings {
    return getGlobal(gconst.ProgressivePluginConfig)
}

export function osFs() {
    return require('fs/promises') as typeof import('fs/promises');
}

export function osFsSync() {
    return require('fs') as typeof import('fs');
}

export function osPath() {
    return require('path') as typeof import('path');
}
