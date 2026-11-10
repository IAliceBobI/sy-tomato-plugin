// backForwardChannel.ts —— 官方原生「后退/前进」通道（罗盘角键）：window.siyuan 脏活
// 全圈此处，组件/宿主零直读官方内部结构。三读一触发：
//   triggerBackForward   桌面=点击官方顶栏 #barBack/#barForward（官方 .toolbar 事件委托
//                        按 target.id 分发调 goBack/goForward，topBar.ts:127 同源）；元素
//                        缺失兜底=.toolbar 派发 CustomEvent("click",{detail:barId})（官方
//                        委托认 detail 字符串，topBar.ts:129）；仍缺失 no-op＋debugLog。
//                        手机=window.siyuan.mobile.tabs.goBack()/goForward()
//                        （mobileBottomBar.ts:211 同款调用），try/catch 后 no-op。
//   canBackForward       桌面=读 #bar 元素 classList 是否含 toolbar__item--disabled
//                        （官方初始即带 disabled class，随栈空/非空增删，backForward.ts:266）；
//                        元素缺失兜底=back 看 backStack.length>0、forward 恒 true（官方前进栈
//                        forwardStack 模块私有摸不到，交给官方点击侧自判，误亮点击=no-op）。
//                        手机=tabs.canGoBack()/canGoForward()；tabs 缺失恒 false。
//   backForwardHotkeyTip 读 keymap.general.[goBack|goForward].custom（⌘[/⌘]），缺省空串。
import { debugLog } from "./logUtils";

export type BFDir = "back" | "forward";

const BAR_ID: Record<BFDir, string> = { back: "barBack", forward: "barForward" };

function sy() {
    return (window as any).siyuan;
}

/** 触发官方后退/前进（任何失败静默 no-op＋debugLog，不抛给调用方） */
export function triggerBackForward(dir: BFDir): void {
    try {
        const siyuan = sy();
        if (siyuan?.mobile) {
            const tabs = siyuan.mobile.tabs;
            if (!tabs) {
                debugLog("navcompass", `trigger ${dir}: mobile tabs missing`, "nav");
                return;
            }
            if (dir === "back") tabs.goBack();
            else tabs.goForward();
            return;
        }
        const id = BAR_ID[dir];
        const btn = document.getElementById(id);
        if (btn) {
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            return;
        }
        // 兜底：#bar 元素被顶栏自定义隐藏时官方委托仍认 detail 字符串路径
        const toolbar = document.querySelector(".toolbar");
        if (toolbar) {
            toolbar.dispatchEvent(new CustomEvent("click", { detail: id }));
            return;
        }
        debugLog("navcompass", `trigger ${dir}: no #${id} nor .toolbar`, "nav");
    } catch (err) {
        debugLog("navcompass", `trigger ${dir} unexpected: ${err}`, "nav");
    }
}

/** 官方后退/前进可用性（驱动角键禁用态；读不到一律保守 false/交给官方自判的 true） */
export function canBackForward(dir: BFDir): boolean {
    try {
        const siyuan = sy();
        if (siyuan?.mobile) {
            const tabs = siyuan.mobile.tabs;
            if (!tabs) return false;
            return dir === "back" ? !!tabs.canGoBack?.() : !!tabs.canGoForward?.();
        }
        const btn = document.getElementById(BAR_ID[dir]);
        if (btn) return !btn.classList.contains("toolbar__item--disabled");
        if (dir === "back") return (siyuan?.backStack?.length ?? 0) > 0;
        return true;
    } catch {
        return false;
    }
}

/** 官方后退/前进快捷键提示（title/aria 用，如「后退（⌘[）」；未配置=空串不带括号） */
export function backForwardHotkeyTip(dir: BFDir): string {
    const key = dir === "back" ? "goBack" : "goForward";
    return sy()?.config?.keymap?.general?.[key]?.custom ?? "";
}
