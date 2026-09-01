import { events } from "./Events";
import { lastVerifyResult } from "./user";
import { Siyuan } from "./utils";



const officalHotkeys = new Map<string, string>();

getAllHotkeys
function getAllHotkeys(obj: any) {
    const visited = new Set();
    const queue = [{ k: "keymap", v: obj }];
    while (queue.length) {
        const { k, v } = queue.shift();
        if (!v || typeof v !== 'object' || visited.has(v)) continue;
        visited.add(v);
        if (v.custom) {
            officalHotkeys.set(v.custom, k);
        } else {
            for (const [k, va] of Object.entries(v)) {
                if (k == "plugin") continue
                queue.push({ k, v: va });
            }
        }
    }
}

// 键帽/命令面板显示用的平台化（win 显示 Ctrl+X 形态）；HotkeyCap 就地编辑复用（2026-08-24 导出）
export function toWin(k: string) {
    if (events.isMac) {
        return k
    } else {
        return k
            .replaceAll("⌘", "Ctrl+")
            .replaceAll("⇧", "Shift+")
            .replaceAll("⌥", "Alt+")
            .replaceAll("⇥", "Tab")
            .replaceAll("⌫", "Backspace")
            .replaceAll("⌦", "Delete")
            .replaceAll("↩", "Enter");
    }
}

interface Get {
    get(p?: any): boolean,
}

export function winHotkey(m: string, langKey: string, icon?: string, langText?: () => string, vip?: boolean, store?: Get) {
    if (!m) throw Error("null hotkey")
    if (!langKey) throw Error("null langKey")
    m = m.toLocaleUpperCase()
        .replaceAll("CTRL+", "⌘")
        .replaceAll("SHIFT+", "⇧")
        .replaceAll("ALT+", "⌥")
        .replaceAll("TAB", "⇥")
        .replaceAll("BACKSPACE", "⌫")
        .replaceAll("DELETE", "⌦")
        .replaceAll("ENTER", "↩")
        .replaceAll("LEFT", "←")
        .replaceAll("RIGHT", "→")
        .replaceAll("UP", "↑")
        .replaceAll("DOWN", "↓")

    const alt = m.includes("⌥")
    const shift = m.includes("⇧")
    const ctrl = m.includes("⌘")
    m = m.replaceAll("⌥", "").replaceAll("⇧", "").replaceAll("⌘", "")
    if (ctrl) m = "⌘" + m
    if (shift) m = "⇧" + m
    if (alt) m = "⌥" + m

    // v5 □7 恢复重复检测（曾被注释——正是 ⌥⌘F6 双绑漏网的原因）；只查插件内部重复，
    // 官方 keymap 对照（officalHotkeys）保持注释：模块加载时 Siyuan 可能未注入会误报
    // if (officalHotkeys.size == 0) getAllHotkeys(Siyuan?.config?.keymap);
    if (!globalThis.wieyqstvaPUaBkyoBGpsBztqoIZPplSyMWEETBcF) globalThis.wieyqstvaPUaBkyoBGpsBztqoIZPplSyMWEETBcF = new Map<string, string>();
    const hotkeySet: Map<string, string> = globalThis.wieyqstvaPUaBkyoBGpsBztqoIZPplSyMWEETBcF
    // 同条目重注册静默：思源 window.eval 执行插件无模块缓存，重载插件/新前端加载会整轮重跑顶层声明，
    // (m, langKey) 完全一致的重复注册是常态（历史误报刷屏根因）；仅键被不同命令抢占时才告警
    if (hotkeySet.has(m) && hotkeySet.get(m) !== langKey) console.warn("发现重复的hotkey：", m, langKey, "--------", hotkeySet.get(m))
    if (hotkeySet.has(langKey) && hotkeySet.get(langKey) !== m) console.warn("发现重复的langKey：", m, langKey, "--------", hotkeySet.get(langKey))
    // if (officalHotkeys.has(m)) console.warn("发现与官方重复的langKey：", m, langKey, "--------", officalHotkeys.get(m))
    hotkeySet.set(m, langKey);
    hotkeySet.set(langKey, m);

    // w() 兜底链查本仓插件名（keymap 按插件名分命名空间；recite 2026-08-27 迁入 HotkeyCap 后加入；
    // sy-my-plugin 旧名 2026-08-29 退役——langKey 规整时 keymap 已迁回各插件命名空间，seller 同日补入）
    const w = () => {
        const plugins = Siyuan?.config?.keymap?.plugin ?? {};
        for (const name of ["sy-tomato-plugin", "sy-progressive-plugin", "sy-seller-plugin", "sy-recite-plugin"]) {
            const custom = plugins[name]?.[langKey]?.custom;
            if (custom) return toWin(custom);
        }
        const invalid = ["sy-tomato-plugin", "sy-progressive-plugin", "sy-seller-plugin", "sy-recite-plugin"]
            .some(name => !!plugins[name]?.[langKey]?.default);
        return toWin(m) + (invalid ? "🚫" : "");
    }

    const menu = () => {
        let ac = true;
        if (store) {
            ac = store.get()
        }
        if (vip && !lastVerifyResult()) {
            ac = false;
        }
        return ac;
    }
    const cmd = () => {
        let ac = true;
        if (vip && !lastVerifyResult()) {
            ac = false;
        }
        return ac;
    }

    // □30 门禁可视化：vip 标志暴露给渲染层（渐进浮条 Pro 钮打灰档类），单一事实源
    // 仍是本函数第五参；menu() 的 vip 门职责不变（命令/菜单通道照旧拦）
    return { m, w, langKey, icon, langText, menu, cmd, vip: !!vip };
}

