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

function toWin(k: string) {
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

    // if (officalHotkeys.size == 0) getAllHotkeys(Siyuan?.config?.keymap);
    // if (!globalThis.wieyqstvaPUaBkyoBGpsBztqoIZPplSyMWEETBcF) globalThis.wieyqstvaPUaBkyoBGpsBztqoIZPplSyMWEETBcF = new Map<string, string>();
    // const hotkeySet: Map<string, string> = globalThis.wieyqstvaPUaBkyoBGpsBztqoIZPplSyMWEETBcF
    // if (hotkeySet.has(m)) console.warn("发现重复的hotkey：", m, langKey, "--------", hotkeySet.get(m))
    // if (hotkeySet.has(langKey)) console.warn("发现重复的langKey：", m, langKey, "--------", hotkeySet.get(langKey))
    // if (officalHotkeys.has(m)) console.warn("发现与官方重复的langKey：", m, langKey, "--------", officalHotkeys.get(m))
    // hotkeySet.set(m, langKey);
    // hotkeySet.set(langKey, m);

    const w = () => {
        const a = Siyuan?.config?.keymap?.plugin?.['sy-tomato-plugin']?.[langKey]?.custom
        if (a) return toWin(a);

        const b = Siyuan?.config?.keymap?.plugin?.['sy-progressive-plugin']?.[langKey]?.custom
        if (b) return toWin(b);

        const c = Siyuan?.config?.keymap?.plugin?.['sy-my-plugin']?.[langKey]?.custom
        if (c) return toWin(c);

        const a1 = Siyuan?.config?.keymap?.plugin?.['sy-tomato-plugin']?.[langKey]?.default
        const b1 = Siyuan?.config?.keymap?.plugin?.['sy-progressive-plugin']?.[langKey]?.default
        const c1 = Siyuan?.config?.keymap?.plugin?.['sy-my-plugin']?.[langKey]?.default
        const invalid = !!a1 || !!b1 || !!c1;

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

    return { m, w, langKey, icon, langText, menu, cmd };
}

