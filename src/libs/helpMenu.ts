// 三插件设置面板统一帮助菜单（□3 header/footer 统一+帮助收敛，2026-08-31）：
// header 单 iconHelp 入口弹 b3-menu：使用说明 / 更新日志 / 开源仓库（仅仿写）/
// 分隔线后「取消激活」（仅开发者 isMe，弱态——原三面板的 DevDeactivate 行收编于此，
// 菜单点击时实时判 isMe，天然规避 user 冷启动未填充）。
// 各插件传 action 回调；label 可覆盖（recite 特有文案走 plugin.i18n，缺省 tomatoI18n）。
// 构造三坑（debugging/kernel/ui.md「思源 Menu 单例 vs 插件自建菜单」）：independent 第三参防
// 单例被同次 click 冒泡清空；open 包 setTimeout 防边缘；iconHTML 的 svg 必须自带
// 尺寸（裸 svg 无 CSS 命中按替换元素默认 300×150 撑爆菜单项）。
import { Menu } from "siyuan";
import { tomatoI18n } from "../tomatoI18n";
import { isMe } from "./user";
import { deactivateDev } from "./devDeactivate";
import { devProPreview, toggleDevProPreview } from "./devProPreview";

const icon = (id: string) =>
    `<svg class="b3-menu__icon" style="width:14px;height:14px"><use xlink:href="#${id}"></use></svg>`;

export interface HelpMenuActions {
    /** 使用说明（Help Dialog 通道） */
    usage: () => void;
    /** 更新日志（changelogDialog 通道） */
    changelog: () => void;
    /** 开源仓库（仅仿写有） */
    repo?: () => void;
    /** 关于（仅仿写：版本+标语名片——hero 名片区退役后的承接位，□4） */
    about?: () => void;
    /** 菜单文案覆盖（缺省 tomatoI18n；取消激活为开发者专用文案，不走 i18n） */
    labels?: Partial<{ usage: string; changelog: string; repo: string; about: string }>;
}

export function openHelpMenu(ev: MouseEvent, a: HelpMenuActions) {
    const menu = new (Menu as any)("tomatoHelpMenu", undefined, true) as Menu;
    menu.addItem({
        iconHTML: icon("iconHelp"),
        label: a.labels?.usage ?? tomatoI18n.使用说明,
        click: a.usage,
    });
    menu.addItem({
        iconHTML: icon("iconHistory"),
        label: a.labels?.changelog ?? tomatoI18n.更新日志,
        click: a.changelog,
    });
    if (a.repo) {
        menu.addItem({
            iconHTML: icon("iconGithub"),
            label: a.labels?.repo ?? tomatoI18n.开源仓库,
            click: a.repo,
        });
    }
    if (a.about) {
        menu.addItem({
            iconHTML: icon("iconInfo"),
            label: a.labels?.about ?? "关于",
            click: a.about,
        });
    }
    if (isMe()) {
        menu.addSeparator();
        // 作者查看模式（devProPreview）：已激活后皇冠/货架 Pro 角标全隐身，toggle 让
        // 付费标记强制回归（只标注不锁功能）；图标二态体现开关，菜单点击即关、
        // 角标经 store 响应式在已开面板即时跟随
        const pv = menu.addItem({
            iconHTML: icon(devProPreview.get() ? "iconEye" : "iconEyeoff"),
            label: "显示付费标记",
            click: () => toggleDevProPreview(),
        });
        pv.style.opacity = "0.55";
        const el = menu.addItem({
            iconHTML: icon("iconClose"),
            label: "取消激活",
            click: () => deactivateDev(),
        });
        el.style.opacity = "0.55";
    }
    // 落点：真实点击用事件坐标；键盘/合成触发（clientX=0）锚定按钮自身（vision P2：
    // 屏中落点让键盘用户找不到菜单），两级兜底后才落屏中
    const rect = (ev.currentTarget as HTMLElement | null)?.getBoundingClientRect();
    const x = rect ? rect.left : ev.clientX > 0 ? ev.clientX : innerWidth / 2;
    const y = rect ? rect.bottom + 4 : ev.clientY > 0 ? ev.clientY : innerHeight / 2;
    setTimeout(() => menu.open({ x, y }), 0);
}
