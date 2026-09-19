import { events } from "../libs/Events";
import { keyCodeFor } from "../libs/ballKeyCode";
import { shortcut2string } from "../libs/keyboard";
import { kmShortcutLabel } from "../libs/ballKeymap";
import type { BallAction } from "./index";

// 任意键位球（期1 两大修复之二在此生效）：合成 KeyboardEvent 的 keyCode 走
// KEYCODELIST 反向表（libs/ballKeyCode.ts），治 matchHotKey 只认 event.keyCode、
// 表外返回 0 永不匹配的旧洞（F 键坏正则/标点 charCodeAt 全错）。
// 官方快捷键球（期2）与本类型共用执行器，差异只在配置来源。
export const shortcutAction: BallAction = {
    type: "shortcut",
    defaultConfig() {
        return { type: "shortcut", icon: "⌨" };
    },
    async execute(ball: BallItem) {
        const a = ball.action ?? {};
        const code = keyCodeFor(a.key);
        // 宿主必须 document.body（3.8.4 起 windowKeyDown 对非 body 的 event.target 调
        // .closest()——Document 节点没有该方法，dispatch 到 document 会 TypeError 炸断
        // 插件命令派发链，所有快捷键球静默失效；body 走官方换锚分支与真实按键同构）
        document.body.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: a.key?.toUpperCase() ?? "",
                code: a.key?.toUpperCase() ?? "",
                keyCode: code,
                which: code,
                altKey: !!a.altKey,
                shiftKey: !!a.shiftKey,
                ctrlKey: !events.isMac && !!a.ctrlKey,
                metaKey: events.isMac && !!a.ctrlKey,
                view: window,
                bubbles: true,
                cancelable: true,
            }),
        );
    },
    display(ball: BallItem) {
        return ball.icon || shortcut2string(ball.action);
    },
    tooltip(ball: BallItem) {
        // label（用户命名）> action.km 查表（跟随界面语言，□8）> 键位串
        return ball.label || kmShortcutLabel(ball.action) || shortcut2string(ball.action);
    },
};
