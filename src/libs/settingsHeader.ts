// 三插件设置面板统一 header 构造器（□3，2026-08-31）：左=插件名·设置（15px/600）+
// 版本号（12px）+ Pro 徽标（仅已激活显示），右=帮助菜单单图标钮（#iconHelp 28px 方）
// + 关闭钮（自绘 Dialog 的番茄/渐进有；页签内的仿写不走本构造器，直接用 Svelte 头部
// 挂同名类）。原 header 的 Help帮助/更新日志文字钮与 outline 保存钮全部退役，入口
// 收敛进帮助菜单 / sticky footer。
// Pro 徽标显隐可变（面板内激活成功链 reload 前的 verify 回写窗口）：返回 badge 节点，
// 由挂载的 Svelte 组件 $effect 按 codeValid 更新 display。
import { tomatoI18n } from "../tomatoI18n";

export interface SettingsHeaderSpec {
    /** 「番茄工具箱 · 设置」（调用方拼好 i18n） */
    title: string;
    /** "v5.3.117t"（含插件后缀） */
    version: string;
    /** 初始激活态（lastVerifyResult() === true） */
    pro: boolean;
    /** 帮助图标钮点击（openHelpMenu） */
    onHelp: (e: MouseEvent) => void;
    /** 关闭钮（自绘 Dialog 传 dialog.destroy；页签内不传则无关闭钮） */
    onClose?: () => void;
}

export interface SettingsHeader {
    root: HTMLElement;
    /** Pro 徽标节点（显隐由组件侧 $effect 接管） */
    badge: HTMLElement;
}

export function buildSettingsHeader(spec: SettingsHeaderSpec): SettingsHeader {
    const root = document.createElement("div");
    root.className = "tomato-header";
    root.style.width = "100%";

    const title = document.createElement("span");
    title.className = "tomato-header-title";
    title.textContent = spec.title;
    root.appendChild(title);

    const version = document.createElement("span");
    version.className = "tomato-header-version";
    version.textContent = spec.version;
    root.appendChild(version);

    const badge = document.createElement("span");
    badge.className = "tomato-pro-badge";
    badge.textContent = "Pro";
    if (!spec.pro) badge.style.display = "none";
    root.appendChild(badge);

    const btns = document.createElement("div");
    btns.className = "tomato-header-btns";

    const help = document.createElement("button");
    help.className = "tomato-header-btn b3-tooltips b3-tooltips__n";
    help.setAttribute("aria-label", tomatoI18n.帮助);
    help.innerHTML = '<svg aria-hidden="true"><use xlink:href="#iconHelp"></use></svg>';
    help.addEventListener("click", (e) => spec.onHelp(e));
    btns.appendChild(help);

    if (spec.onClose) {
        const close = document.createElement("button");
        close.className = "tomato-header-btn b3-tooltips b3-tooltips__n";
        close.setAttribute("aria-label", tomatoI18n.关闭);
        close.innerHTML = '<svg aria-hidden="true"><use xlink:href="#iconClose"></use></svg>';
        close.addEventListener("click", () => spec.onClose!());
        btns.appendChild(close);
    }
    root.appendChild(btns);
    return { root, badge };
}
