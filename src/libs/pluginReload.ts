// 插件级统一重载通道（插件重载统一战役 □1，2026-09-05）——「改配置生效」的唯一路径：
// 调用方 await saveData()/store.write() 落盘 → reloadSelfPlugin() → 官方 lifecycle
// teardown（await onunload，5s 预算）+ destroyPlugin（官方清顶栏钮/状态栏/dock/页签/
// 插件 CSS/eventBus，app/src/plugin/uninstall.ts）→ 新实例重跑 onload 读新配置。
// 插件侧 location.reload 由此退役（内核级全局态变更除外，如 changeLang 换 UI 语言）。
//
// API 形状（硬契约，勿加字段）：POST /api/petal/setPetalEnabled {packageName, enabled:true}，
// 不传 app——内核 PushReloadPlugin 的 excludeApp 为空 = 广播含本窗口的所有窗口
// （kernel/api/petal.go setPetalEnabled；传 app=定向单窗口，本窗口插件不重载）。
// 对已启用插件幂等：官方 lifecycle 任务队列串行化，重复请求自动排队。
//
// packageName 必须 = 宿主插件目录名：UnlockDialog/UpgradeBar 经相对路径打包进
// progressive/recite 自己的 index.js，激活哪个 product 就重载哪个插件——跨插件共用
// 代码里的调用点一律传 PACKAGE_BY_PRODUCT[product]，勿依赖 tomato 默认值。
//
// 失败兜底 location.reload：内核不可达/非 0 时保住「配置终会生效」的战役前老保证，
// 打点 debugLog；勿改成静默吞错——存了设置毫无反应比闪屏更糟。
import type { Product } from "./user";
import { debugLog } from "./logUtils";

export const TOMATO_PACKAGE_NAME = "sy-tomato-plugin";

export const PACKAGE_BY_PRODUCT: Record<Product, string> = {
    tomato: "sy-tomato-plugin",
    progressive: "sy-progressive-plugin",
    recite: "sy-recite-plugin",
};

export async function reloadSelfPlugin(packageName: string = TOMATO_PACKAGE_NAME): Promise<void> {
    try {
        const resp = await fetch("/api/petal/setPetalEnabled", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ packageName, enabled: true }),
        });
        const json = await resp.json().catch(() => null);
        if (!resp.ok || json?.code !== 0) {
            throw new Error(`HTTP ${resp.status} code=${json?.code} msg=${json?.msg}`);
        }
    } catch (e) {
        debugLog("pluginReload", `重载请求失败（${packageName}），回退整页 reload：${e}`);
        window.location.reload();
    }
}
