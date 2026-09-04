import { Dialog } from "siyuan";
import { siyuan } from "../libs/utils";
import { events } from "../libs/Events";
import { tomatoI18n } from "../tomatoI18n";
import type { BallAction } from "./index";

// 外链球（期2）：action={url, openIn:"browser"|"siyuan"}。browser=window.open 新窗口；
// siyuan=Dialog 挂 iframe（700px 档）。X-Frame-Options 拒绝无法从 JS 侧判别
// （Chromium 对被拒帧也派发 load），故走超时兜底：load 事件 6s 未至 → pushMsg 提示
// 并回退 window.open。默认 browser。
const IFRAME_LOAD_TIMEOUT_MS = 6000;

export const urlAction: BallAction = {
    type: "url",
    defaultConfig() {
        return { type: "url", icon: "🌐", action: { url: "", openIn: "browser" } };
    },
    execute(ball: BallItem) {
        const url = String(ball.action?.url ?? "");
        if (!/^https?:\/\//i.test(url)) {
            void siyuan.pushMsg(tomatoI18n.URL须以http开头);
            return;
        }
        if (ball.action?.openIn === "siyuan" && !events.isMobile) {
            openUrlInDialog(url);
        } else {
            window.open(url, "_blank");
        }
    },
    display(ball: BallItem) {
        return ball.icon || "🌐";
    },
    tooltip(ball: BallItem) {
        return ball.label || ball.action?.url || "url";
    },
};

function openUrlInDialog(url: string) {
    const dialog = new Dialog({
        title: url,
        content: `<div class="b3-dialog__iframe" style="display:flex;height:100%;"><iframe src="${url}" style="flex:1;border:none;width:100%;"></iframe></div>`,
        width: events.isMobile ? "90vw" : "700px",
        height: events.isMobile ? "160vw" : "700px",
    });
    dialog.element.style.zIndex = "10";
    const iframe = dialog.element.querySelector("iframe");
    let loaded = false;
    iframe?.addEventListener("load", () => {
        loaded = true;
    });
    // 超时兜底：load 未至大概率被 XFO/CSP 拒，回退系统浏览器
    window.setTimeout(() => {
        if (!loaded) {
            dialog.destroy();
            void siyuan.pushMsg(tomatoI18n.站点拒绝内嵌已改用浏览器打开);
            window.open(url, "_blank");
        }
    }, IFRAME_LOAD_TIMEOUT_MS);
}
