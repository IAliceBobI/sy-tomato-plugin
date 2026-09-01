// □14 激活互通互问协议（2026-08-28 拍板：recite 设置面板惰性检测渐进激活态 + 一键解锁）。
// 本文件是两侧共用的纯函数对，无模块状态——recite 跨插件 import 无 bundle 复制陷阱
// （有状态的 userToken 两插件各一份，正是激活态必须走插件实例互问拿字符串的原因）。
// 鲁棒三纪律：绝不静态 import 对方模块状态 / 惰性检测消时序窗 / 全链 ?. + try 静默降级。
// 2026-08-31 从 progressive/src 挪进 tomato 共享库：recite 发布仓只拷 recite+tomato 源码，
// 住渐进侧会让远程构建缺目录炸（v1.1.1 首发实测）；共享代码一律住 tomato（仓库架构约定）。
import { Plugin } from "siyuan";

export const PROG_PLUGIN_NAME = "sy-progressive-plugin";

/**
 * 渐进侧门控（渐进 Plugin 实例的 getProgressiveCode 一行桥接进来）：
 * 仅当本侧验签已通过（paid===true）才返回 token——未激活时 userToken 里可能是
 * FREE_KEY 免费码，语义上不是渐进激活码，绝不外流；未验证（null，启动验证在路上）同不给。
 */
export function neighborCode(paid: boolean | null, token: string): string {
    return paid === true && token ? token : "";
}

/**
 * recite 侧防御取值（Settings 面板打开时调用）：从思源 app 找渐进插件实例，
 * 调它的 getProgressiveCode 拿码。未装 / 旧版无此方法 / 返回空 / 对方抛错，
 * 一律返回空串静默降级，绝不炸调用方。
 */
export function progressiveCodeFromApp(app: { plugins?: Plugin[] } | undefined | null): string {
    try {
        const prog = app?.plugins?.find((p: any) => p?.name === PROG_PLUGIN_NAME) as any;
        const code = prog?.getProgressiveCode?.();
        return typeof code === "string" ? code : "";
    } catch {
        return "";
    }
}
