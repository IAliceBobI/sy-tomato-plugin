// 只读态快捷键兜底桥——胶水层（readonlyfix □5）。纯决策层在 readonlyHotkeyCore.ts
// （根因与「零双触发」论证见彼处文件头）。安装：插件 onload 首段即可（handler LIVE 读
// plugin.commands，命令后注册也照常命中）；卸载：onunload 首行。幂等：重装先卸旧（reload
// 顶代监听器泄漏防线）；globalThis 键按插件名加盐——多插件各自接线互不驱逐（无盐单槽
// 会让后装者静默卸掉先装者的监听器）。□8 推广：tomato/recite 传 langKeys 白名单收窄
// 推广面到拍板清单（progressive 不传=全量，现状不变）。
// 已知边界（review P2 留档）：同窗多桥（t/p/r 三装后）捕获相 stopPropagation 拦不住兄弟
// 桥的捕获监听——用户手工改键造出跨插件同键时两个命令都会触发（默认键全表无撞，
// winHotkey 哨兵会 warn）。不根治改 stopImmediatePropagation：它会在键帽监听态
// （HotkeyCap 后注册的捕获监听）误吞改键按键，代价大于收益。
import type { IProtyle, Plugin } from "siyuan";
import { events } from "./Events";
import { event2combo } from "./hotkeyCap";
import { bridgeGate, pickBridgeCommand } from "./readonlyHotkeyCore";

const bridgeKey = (plugin: Plugin) => `__tomatoReadonlyHotkeyBridge::${plugin.name}`;

/** 安装选项（□8 推广粒度）：langKeys 给了=只兜底这些命令（langKey 比对，收窄推广面到
 *  拍板清单；空数组=一个都不兜底，deny-by-default）；缺省=全量兜底该插件全部「有
 *  editorCallback+有键」命令（progressive 形态）。 */
export interface BridgeOptions {
    langKeys?: readonly string[];
}

/** window 捕获相监听：只读态下事件先于内核到达（内核全局链挂 window 冒泡相），
 *  命中即 preventDefault+stopPropagation 并直调 editorCallback(当前只读 protyle)。
 *  已知边界：按 events.currentProtyle() 派发，多窗全只读时浮窗/反链面板内按键会派给
 *  主 protyle——选区不在其内则命令早退为静默 no-op，无数据错写（review P2 留档）。
 *  editorCallback 只传 protyle 单参（内核 editorShortcut 传双参——现有命令全单参消费，
 *  未来回调用第二参须扩此处，review P2 留档）。 */
export function installReadonlyHotkeyBridge(plugin: Plugin, opts?: BridgeOptions) {
    uninstallReadonlyHotkeyBridge(plugin);
    const allow = opts?.langKeys ? new Set(opts.langKeys) : undefined;
    const fn = (ev: KeyboardEvent) => {
        const protyle = events.currentProtyle();
        if (!bridgeGate(ev, (protyle as { disabled?: boolean } | undefined)?.disabled)) return;
        const combo = event2combo(ev);
        if (!combo) return; // 纯修饰键（等主键）与不可归一主键不认
        const hit = pickBridgeCommand((plugin as unknown as { commands?: readonly any[] }).commands ?? [], combo, events.isMac, allow);
        if (!hit) return;
        ev.preventDefault();
        ev.stopPropagation();
        void hit.editorCallback!(protyle as IProtyle);
    };
    (globalThis as Record<string, unknown>)[bridgeKey(plugin)] = fn;
    window.addEventListener("keydown", fn, true);
}

export function uninstallReadonlyHotkeyBridge(plugin: Plugin) {
    const key = bridgeKey(plugin);
    const prev = (globalThis as Record<string, unknown>)[key];
    if (typeof prev === "function") {
        window.removeEventListener("keydown", prev as EventListener, true);
        delete (globalThis as Record<string, unknown>)[key];
    }
}
