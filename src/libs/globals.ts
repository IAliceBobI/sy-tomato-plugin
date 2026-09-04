// 思源内核注入的全局对象（window.siyuan / window.Lute）与插件实例取用。
// 从原 utils.ts 拆出（2026-08 重构），utils.ts 现为各领域模块的 re-export 桶。
import { Lute } from "siyuan";
import * as gconst from "./gconst";
import { BaseTomatoPlugin } from "./BaseTomatoPlugin";
import { getGlobal } from "stonev5-utils";

export const Siyuan: gconst.SiyuanType = (globalThis as any).siyuan;

export const NewLute: () => Lute = (globalThis as any).Lute.New;

/** 配好行内语法旗标的 Lute（md→DOM 方向专用）。裸 NewLute 的 Md2BlockDOM 不解析
 *  块引用/加粗等行内语法（旗标默认全关）——`((id "…"))`、`**bold**` 全落字面文本
 *  （2026-09-04 批注收集「没转成引用」根因，annodaily 实例 DOM 实锤）。能用
 *  Md2BlockDOM 且输入含用户内容（原文 kramdown/快照/写位）的一律走本工厂；
 *  纯 BlockDOM2* 序列化方向旗标无关，裸 NewLute 即可。旗标集=官方 getLute 全配置
 *  的 md→DOM 关键子集（BlockRef 管引用行，Spin/WYSIWYG/TextMark 管行内 marks，
 *  KramdownIAL 管属性行）；优先复用编辑器共享实例的通道见 annoCollect.luteForCollect。 */
export function NewConfiguredLute(): Lute {
    const lute = NewLute() as unknown as Record<string, (v: boolean) => void> & Lute;
    lute.SetSpin(true);
    lute.SetProtyleWYSIWYG(true);
    lute.SetBlockRef(true);
    lute.SetKramdownIAL(true);
    lute.SetTextMark(true);
    return lute as Lute;
}

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
