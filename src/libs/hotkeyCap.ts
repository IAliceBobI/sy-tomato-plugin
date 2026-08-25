// 快捷键就地修改（2026-08-24 □5）：键帽点击监听 → 写回内核 keymap 的纯逻辑层。
// 写回协议 spike 实证（2026-08-24）：内核 keydown 分发在每次按键时实时读
// command.customHotkey（app/src/boot/globalEvent/keydown.ts），因此
// 「深拷贝 keymap → 改 plugin.<插件>.<langKey>.custom → POST setKeymap →
//  同步 command.customHotkey」四步走完即免 reload 生效（与官方 keymapUi 一致）。
// 组合键字符串规范序：⌃ ⌥ ⇧ ⌘ + 主键（思源 Constants.KEYCODELIST 口径，主键大写）。
import { fetchSyncPost } from "siyuan";
import { events } from "./Events";
import { Siyuan } from "./globals";
import { toWin } from "./winHotkey";

// 思源 Constants.KEYCODELIST 抄录（仅事件主键归一化所需部分）。
// 必须与 matchHotKey 的比对口径一致（它比对 KEYCODELIST[event.keyCode]），用 e.key 会错位
// （如 Enter→↩、方向键→←↑→↓、字母需大写）。
const KEYCODELIST: Record<number, string> = (() => {
    const t: Record<number, string> = {
        8: "⌫", 9: "⇥", 13: "↩", 19: "Pause", 20: "CapsLock", 27: "Escape", 32: " ",
        33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "←", 38: "↑", 39: "→", 40: "↓",
        44: "PrintScreen", 45: "Insert", 46: "⌦",
        48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9",
        65: "A", 66: "B", 67: "C", 68: "D", 69: "E", 70: "F", 71: "G", 72: "H", 73: "I", 74: "J",
        75: "K", 76: "L", 77: "M", 78: "N", 79: "O", 80: "P", 81: "Q", 82: "R", 83: "S", 84: "T",
        85: "U", 86: "V", 87: "W", 88: "X", 89: "Y", 90: "Z",
        93: "ContextMenu",
        96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7", 104: "8", 105: "9",
        106: "*", 107: "+", 109: "-", 110: ".", 111: "/",
        144: "NumLock", 145: "ScrollLock",
        186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`",
        219: "[", 220: "\\", 221: "]", 222: "'",
    };
    for (let i = 1; i <= 32; i++) t[i + 111] = "F" + i;
    return t;
})();

// 官方保留组合（app/src/util/hotKeyPolicy.ts 同款）：任何插件键位也不允许占用
const RESERVED_KEYMAPS = new Set([
    "⌘A", "⌘X", "⌘C", "⌘V", "⌘-", "⌘=", "⌘0", "⇧⌘V", "⌘/", "⇧↑", "⇧↓", "⇧→", "⇧←", "⇧⇥",
    "⌃D", "⇧⌘→", "⇧⌘←", "⌘Home", "⌘End", "⇧↩", "↩", "PageUp", "PageDown", "⌫", "⌦", "Escape",
]);
const MODIFIER_KEYS = "⌃⌥⇧⌘";
const NON_CHARACTER_KEYS = new Set(["←", "↑", "→", "↓", "⇥", "⌫", "⌦", "↩"]);

/** 单字符主键且无 ⌃/⌥/⌘ 修饰：会拦截正常文字输入，官方 keymap 也禁止 */
export function isDisallowedTextInput(combo: string): boolean {
    let i = 0;
    while (i < combo.length && MODIFIER_KEYS.includes(combo[i])) i++;
    const mods = combo.slice(0, i);
    if (mods.includes("⌃") || mods.includes("⌥") || mods.includes("⌘")) return false;
    const main = combo.slice(i).normalize();
    return Array.from(main).length === 1 && !NON_CHARACTER_KEYS.has(main);
}

export function isReservedCombo(combo: string): boolean {
    return RESERVED_KEYMAPS.has(combo);
}

/** KeyboardEvent → 思源规范序组合键串（⌃⌥⇧⌘+主键）；纯修饰键返回 null（继续等主键） */
export function event2combo(e: KeyboardEvent): string | null {
    const mac = events.isMac;
    let s = "";
    if (mac && e.ctrlKey) s += "⌃";
    if (e.altKey) s += "⌥";
    if (e.shiftKey) s += "⇧";
    if ((mac && e.metaKey) || (!mac && e.ctrlKey)) s += "⌘";
    if (["Shift", "Alt", "Meta", "Control"].includes(e.key) || e.key === "Unidentified") return null;
    const main = KEYCODELIST[e.keyCode] || (e.key.length > 1 ? e.key : e.key.toUpperCase());
    if (!main) return null;
    return s + main;
}

interface KeymapLeaf { default?: string; custom?: string }

/** 叶子判定：{default, custom} 形态即快捷键条目（分组对象没有 custom 字符串） */
function isLeaf(v: any): v is KeymapLeaf {
    return !!v && typeof v === "object" && typeof v.custom === "string";
}

/** 命令的可读名：从已加载插件命令表里取 langText，取不到回落 langKey */
function commandLabel(pluginName: string, langKey: string): string {
    const cmds = (Siyuan as any)?.ws?.app?.plugins?.find?.((p: any) => p.name === pluginName)?.commands;
    const c = cmds?.find?.((cmd: any) => cmd.langKey === langKey);
    return c?.langText || langKey;
}

/**
 * 冲突检测：组合键与内核全局 keymap（官方 general/editor + 全部插件命令）比对，
 * 排除自身条目。返回冲突来源的可读描述列表（空数组 = 无冲突）。
 * getAllHotkeys 复活版：不再写模块级缓存，每次全量遍历（键帽交互低频，实时性优先）。
 */
export function findConflicts(combo: string, selfPlugin: string, selfLangKey: string): string[] {
    const km: any = (Siyuan as any)?.config?.keymap;
    const hits: string[] = [];
    if (!km || !combo) return hits;

    const walk = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        for (const [k, v] of Object.entries(obj)) {
            if (isLeaf(v)) {
                // 官方 keymap 键名是英文标识符，内核 languages 里有现成本地化名
                if (v.custom === combo) hits.push((Siyuan as any)?.languages?.[k] || k);
            } else {
                walk(v);
            }
        }
    };
    walk(km.general);
    walk(km.editor);

    for (const [pname, cmds] of Object.entries<any>(km.plugin || {})) {
        if (!cmds || typeof cmds !== "object") continue;
        for (const [lk, entry] of Object.entries<any>(cmds)) {
            if (!isLeaf(entry)) continue;
            if (pname === selfPlugin && lk === selfLangKey) continue;
            if (entry.custom === combo) hits.push(commandLabel(pname, lk));
        }
    }
    return hits;
}

function splitCombo(combo: string): { mods: string; main: string } {
    let i = 0;
    while (i < combo.length && MODIFIER_KEYS.includes(combo[i])) i++;
    return { mods: combo.slice(0, i), main: combo.slice(i) };
}

/**
 * 推荐最近的可用组合：保留用户按下的主键，按偏好换修饰键（⌘ 系优先），
 * 取第一个「无冲突 + 非保留 + 非裸键」的候选。全占满返回 null。
 */
export function suggestCombo(combo: string, selfPlugin: string, selfLangKey: string): string | null {
    const { main } = splitCombo(combo);
    if (!main) return null;
    const candidates = ["⌘", "⌥⌘", "⇧⌘", "⌃⌘", "⌥", "⌥⇧", "⌃⌥", "⇧", "⌃", "⌃⇧", "⌥⇧⌘"];
    for (const mods of candidates) {
        const c = mods + main;
        if (c === combo) continue;
        if (isReservedCombo(c) || isDisallowedTextInput(c)) continue;
        if (findConflicts(c, selfPlugin, selfLangKey).length) continue;
        return c;
    }
    return null;
}

/**
 * 写回内核 keymap：custom 传 null 即恢复默认（写 entry.default，官方 reset 语义——
 * 内核里 custom:"" 是「禁用」而非回落默认，直接写空串会造成显示与实际键位不符）。
 * custom 传 "" 即删除快捷键（命令不再响应任何键盘组合，customHotkey 为空）。
 * 四步协议见文件头注释；失败（无条目/网络错）返回 false，调用方保持原显示。
 */
export async function setPluginHotkey(pluginName: string, langKey: string, custom: string | null): Promise<boolean> {
    const km: any = (Siyuan as any)?.config?.keymap;
    const entry = km?.plugin?.[pluginName]?.[langKey];
    if (!entry) return false;
    const value = custom === null ? (entry.default || "") : custom;

    const data = JSON.parse(JSON.stringify(km));
    data.plugin[pluginName][langKey].custom = value;
    const resp = await fetchSyncPost("/api/setting/setKeymap", { data });
    if (resp?.code !== 0) return false;

    // 成功后才动前端内存（官方 setKeymapFromDom 同款语义：整体替换 + 命令对象同步）
    (Siyuan as any).config.keymap = data;
    const cmd = (Siyuan as any)?.ws?.app?.plugins
        ?.find?.((p: any) => p.name === pluginName)
        ?.commands?.find?.((c: any) => c.langKey === langKey);
    if (cmd) cmd.customHotkey = value;
    return true;
}

/** 本插件条目的当前 custom；undefined = 条目不存在（回落 w() 兜底链），"" = 已删除 */
export function currentCustom(pluginName: string, langKey: string): string | undefined {
    const v = (Siyuan as any)?.config?.keymap?.plugin?.[pluginName]?.[langKey]?.custom;
    return typeof v === "string" ? v : undefined;
}

/** 键帽显示文本：custom="" 显示未设置占位（w() 对空 custom 会回落默认值，误导删除态） */
export function capDisplay(custom: string, unsetText: string): string {
    return custom === "" ? unsetText : toWin(custom);
}

const RANDOM_MAIN_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

/**
 * 随机一个可用组合：主键随机洗牌、修饰键按「短组合优先」偏好序（单修饰 ⌥/⌃/⌘ 先于
 * 双修饰），跳过保留键/裸键/与内核全局 keymap 冲突的组合；全部占满返回 null。
 */
export function randomFreeCombo(selfPlugin: string, selfLangKey: string): string | null {
    const keys = RANDOM_MAIN_KEYS.map((k) => [Math.random(), k] as const)
        .sort((a, b) => a[0] - b[0])
        .map((p) => p[1]);
    const modPrefs = ["⌥", "⌃", "⌘", "⌥⌘", "⌃⌥", "⌥⇧", "⇧⌘", "⌃⌘", "⌃⇧", "⌥⇧⌘"];
    for (const mods of modPrefs) {
        for (const key of keys) {
            const c = mods + key;
            if (isReservedCombo(c) || isDisallowedTextInput(c)) continue;
            if (findConflicts(c, selfPlugin, selfLangKey).length) continue;
            return c;
        }
    }
    return null;
}
