import { confirm, Dialog, Menu } from "siyuan";
import { events } from "./Events";
import { floatingballBallList } from "./stores";
import { DestroyManager } from "./destroyer";
import { FloatingBall, getFloatingBall } from "../FloatingBall";
import { shortcut2string } from "./keyboard";
import { kmShortcutLabel } from "./ballKeymap";
import { findPluginCommand } from "../actions/pluginCmdAction";
import { actionRegistry } from "../actions";
import { tomatoI18n } from "../tomatoI18n";
import { unbindBall } from "../actions/docAction";
import { debugLog } from "./logUtils";

// 球右键/长按菜单（期3 交互）：编辑（小 Dialog）/停用/删除。文案期6 已 i18n 收口。修饰键删除暗手势同期退役（docAction），
// 删除唯一入口收敛到本菜单。Menu 必须 independent 第三参——非 independent 挂全局
// 单例，click 冒泡到 window 被内核 remove 清空，open 撞空菜单静默不弹（debugging/kernel/ui.md「思源 Menu 单例 vs 插件自建菜单」坑）。
export function openBallMenu(ball: BallItem, x: number, y: number) {
    const menu = new (Menu as any)("tomato-fball-menu", undefined, true) as Menu;
    menu.addItem({
        icon: "iconEdit",
        label: tomatoI18n.编辑,
        click: () => openBallEditDialog(ball),
    });
    const key = events.isMobile ? "enableMobile" : "enable";
    const on = ball[key] !== false;
    menu.addItem({
        icon: on ? "iconPause" : "iconPlay",
        label: on ? tomatoI18n.停用 : tomatoI18n.启用,
        click: () => toggleBallEnable(ball),
    });
    menu.addItem({
        icon: "iconTrashcan",
        label: "删除",
        click: () => {
            confirm(tomatoI18n.删除悬浮球, `「${ballLabel(ball)}」`, () => unbindBall(ball));
        },
    });
    setTimeout(() => menu.open({ x, y }), 0);
}

// 球的显示名（菜单/确认框用）：label > 类型 tooltip 链（shortcut 含 km 查表跟随
// 界面语言，□8；tooltip 各类型均有非空兜底，display 形态被 tooltip 覆盖）
export function ballLabel(ball: BallItem): string {
    return ball.label || String(actionRegistry[ball.type]?.tooltip(ball) ?? "");
}

// 停用=写回+摘明面；启用=写回+重挂。切的是当前平台开关（桌面 enable / 移动 enableMobile）
export function toggleBallEnable(ball: BallItem, force?: boolean) {
    const key = events.isMobile ? "enableMobile" : "enable";
    ball[key] = force ?? ball[key] === false;
    floatingballBallList.write();
    if (ball[key]) {
        getFloatingBall(ball);
    } else {
        ballDm(ball)?.destroyBy();
    }
}

function ballDm(ball: BallItem): DestroyManager | undefined {
    return globalThis[FloatingBall.key(`ball#${ball.id}`)] as DestroyManager | undefined;
}

// 摘球重挂（编辑保存后刷新 display/位置）
export function remountBall(ball: BallItem) {
    ballDm(ball)?.destroyBy();
    if ((events.isMobile ? ball.enableMobile : ball.enable) !== false) {
        getFloatingBall(ball);
    }
}

// 编辑小 Dialog（期3 基础版+期4 外观三控件）：公共=图标/名称/大小/透明度/常显标签，
// 类型专属基础字段（doc=文档名+docID 展示、shortcut=键位展示、url=URL+打开方式、
// plugincmd=命令名展示）；完整配置区=设置面板悬浮球段（ConfCapture 期5 复用本入口）。
export function openBallEditDialog(ball: BallItem) {
    const a = ball.action ?? {};
    const typeField: string = (() => {
        switch (ball.type) {
            case "doc":
                return a.docName === "$$dailynote"
                    ? `<label class="ft__on-surface">文档</label>
                    <div class="b3-label__text">${tomatoI18n.当天日记特殊球}</div>`
                    : `<label class="ft__on-surface">${tomatoI18n.文档名}</label>
                    <input class="b3-text-field fn__block" id="fball-docName" value="${esc(a.docName ?? "")}">
                    ${a.docID ? `<div class="ft__on-surface b3-label__text">ID: ${a.docID}</div>` : ""}`;
            case "shortcut": {
                const kb = shortcut2string(a);
                const cmd = kmShortcutLabel(a);
                return `<label class="ft__on-surface">${tomatoI18n.键位重新绑定请先删后加}</label>
                    <div class="b3-label__text">${esc(kb)}${cmd ? ` · ${esc(cmd)}` : ""}</div>`;
            }
            case "url":
                return `<label class="ft__on-surface">URL</label>
                    <input class="b3-text-field fn__block" id="fball-url" value="${esc(a.url ?? "")}">
                    <label class="ft__on-surface">${tomatoI18n.打开方式}</label>
                    <select class="b3-select fn__block" id="fball-openIn">
                        <option value="browser" ${a.openIn !== "siyuan" ? "selected" : ""}>${tomatoI18n.默认浏览器}</option>
                        <option value="siyuan" ${a.openIn === "siyuan" ? "selected" : ""}>${tomatoI18n.思源内打开}</option>
                    </select>`;
            case "plugincmd": {
                const name = findPluginCommand(a.cmdKey)?.langText ?? a.cmdKey ?? "";
                return `<label class="ft__on-surface">${tomatoI18n.命令重新绑定请先删后加}</label>
                    <div class="b3-label__text">${esc(name)}</div>`;
            }
            default:
                return "";
        }
    })();

    const dialog = new Dialog({
        title: `${tomatoI18n.编辑悬浮球} · ${esc(ballLabel(ball)) || ball.type}`,
        content: `
        <div class="b3-dialog__content" style="display:flex;flex-direction:column;gap:8px;padding:16px;">
            <label class="ft__on-surface">${tomatoI18n.图标}</label>
            <input class="b3-text-field fn__block" id="fball-icon" value="${esc(ball.icon ?? "")}">
            <label class="ft__on-surface">${tomatoI18n.名称tooltip与标签用}</label>
            <input class="b3-text-field fn__block" id="fball-label" value="${esc(ball.label ?? "")}">
            <label class="ft__on-surface">${tomatoI18n.大小}</label>
            <select class="b3-select fn__block" id="fball-size">
                <option value="28" ${ballSizeOf(ball) === 28 ? "selected" : ""}>${tomatoI18n.球大小小档}</option>
                <option value="36" ${ballSizeOf(ball) === 36 ? "selected" : ""}>${tomatoI18n.球大小中档}</option>
                <option value="44" ${ballSizeOf(ball) === 44 ? "selected" : ""}>${tomatoI18n.球大小大档}</option>
            </select>
            <label class="ft__on-surface">${tomatoI18n.透明度}: <span id="fball-opacity-val">${ballOpacityOf(ball).toFixed(2)}</span></label>
            <input type="range" min="0.5" max="1" step="0.05" value="${ballOpacityOf(ball)}" class="fn__block" id="fball-opacity">
            <label class="fn__flex" style="align-items:center;gap:8px;">
                <input type="checkbox" class="b3-switch" id="fball-showlabel" ${ball.showLabel ? "checked" : ""}>
                <span class="ft__on-surface">${tomatoI18n.在球下方常显名称标签}</span>
            </label>
            ${typeField}
        </div>
        <div class="b3-dialog__action">
            <button class="b3-button b3-button--cancel">${tomatoI18n.取消}</button>
            <div class="fn__space"></div>
            <button class="b3-button b3-button--text" id="fball-save">${tomatoI18n.保存}</button>
        </div>`,
        width: "400px",
    });
    dialog.element.querySelector(".b3-button--cancel")?.addEventListener("click", () => dialog.destroy());
    const range = dialog.element.querySelector("#fball-opacity") as HTMLInputElement;
    range?.addEventListener("input", () => {
        const v = dialog.element.querySelector("#fball-opacity-val");
        if (v) v.textContent = Number(range.value).toFixed(2);
    });
    dialog.element.querySelector("#fball-save")?.addEventListener("click", () => {
        const val = (id: string) => (dialog.element.querySelector("#" + id) as HTMLInputElement)?.value?.trim() ?? "";
        ball.icon = val("fball-icon");
        ball.label = val("fball-label");
        ball.size = Number((dialog.element.querySelector("#fball-size") as HTMLSelectElement)?.value) || 36;
        ball.opacity = Number(range?.value) || 1;
        ball.showLabel = !!(dialog.element.querySelector("#fball-showlabel") as HTMLInputElement)?.checked;
        if (ball.type === "doc") {
            const n = val("fball-docName");
            if (n) ball.action.docName = n;
        } else if (ball.type === "url") {
            ball.action.url = val("fball-url");
            ball.action.openIn = (dialog.element.querySelector("#fball-openIn") as HTMLSelectElement)?.value ?? "browser";
        }
        floatingballBallList.write();
        remountBall(ball);
        debugLog("fball", `edit saved type=${ball.type} label=${ball.label} icon=${ball.icon} size=${ball.size} opacity=${ball.opacity} showLabel=${ball.showLabel}`, "fball");
        dialog.destroy();
    });
}

// 外观档位收敛（与 FloatingBall.svelte 默认逻辑同源：28/44 之外的值回落中档 36）
function ballSizeOf(ball: BallItem): number {
    return ball.size === 28 || ball.size === 44 ? ball.size : 36;
}
function ballOpacityOf(ball: BallItem): number {
    return Math.min(1, Math.max(0.5, ball.opacity ?? 1));
}

// 用户文本入 HTML（label 走 innerHTML，debugging/kernel/ui.md：用户文本须转义 <>&）
function esc(s: string): string {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
