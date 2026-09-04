// keyCodeFor：键名→event.keyCode 反查表（悬浮球翻新期1 两大修复之二）。
// 背景：思源 matchHotKey 只认 event.keyCode（Constants.KEYCODELIST 的 number→显示符映射，
// key/code 不参与），合成 KeyboardEvent 的 keyCode 查不到表就返回 0 = 永不匹配。
// 旧 FloatingBallKeyboardBtn.getKeyCode 的洞：F 键正则字面 `\\d` 永不命中、标点走
// charCodeAt 全错（","=44 应 188）；本表自 /opt/projects/siyuan/app/src/constants.ts
// KEYCODELIST 抄录并取反，同字符主排键优先于小键盘（"0"=48 非 96、"-"=189 非 109）。

// 长名/别名 → KEYCODELIST 显示符（表键统一为显示符形态）
const ALIASES: Record<string, string> = {
    ENTER: "↩",
    ESCAPE: "Escape",
    ESC: "Escape",
    TAB: "⇥",
    BACKSPACE: "⌫",
    DELETE: "⌦",
    DEL: "⌦",
    SPACE: " ",
    CAPSLOCK: "CapsLock",
    CONTEXTMENU: "ContextMenu",
    PRINTSCREEN: "PrintScreen",
    SCROLLLOCK: "ScrollLock",
    PAUSE: "Pause",
    NUMLOCK: "NumLock",
    INSERT: "Insert",
    HOME: "Home",
    END: "End",
    PAGEUP: "PageUp",
    PAGEDOWN: "PageDown",
    ARROWLEFT: "←",
    ARROWUP: "↑",
    ARROWRIGHT: "→",
    ARROWDOWN: "↓",
};

// KEYCODELIST 反向表（显示符 → 主排键码；小键盘同字符项不收，避免 96-111 抢占主排）
const DISPLAY2CODE: Record<string, number> = {
    "⌫": 8, "⇥": 9, "↩": 13, "⇧": 16, "⌃": 17, "⌥": 18,
    Pause: 19, CapsLock: 20, Escape: 27, " ": 32,
    PageUp: 33, PageDown: 34, End: 35, Home: 36,
    "←": 37, "↑": 38, "→": 39, "↓": 40,
    PrintScreen: 44, Insert: 45, "⌦": 46,
    "⌘": 91, ContextMenu: 93,
    NumLock: 144, ScrollLock: 145,
};

// 标点：真实键码（KEYCODELIST 186-222 段；charCodeAt 在这段全错）
const PUNCT2CODE: Record<string, number> = {
    ";": 186, "=": 187, ",": 188, "-": 189, ".": 190, "/": 191,
    "`": 192, "[": 219, "\\": 220, "]": 221, "'": 222,
};

function singleCharKeyCode(ch: string): number {
    const k = ch.toUpperCase();
    if (PUNCT2CODE[k] != null) return PUNCT2CODE[k];
    if (/[A-Z0-9]/.test(k)) return k.charCodeAt(0);
    return DISPLAY2CODE[k] ?? 0;
}

export function keyCodeFor(key: string): number {
    if (!key) return 0;
    // 单字符先于 trim（空格 " " 本身是合法键）
    if (key.length === 1) return singleCharKeyCode(key);
    const k = key.trim().toUpperCase();
    if (!k) return 0;
    // F1~F32（getFunctionKey：112~143；F 键名只此形态，别再走字符路径）
    const f = /^F([1-9]|[12][0-9]|3[0-2])$/.exec(k);
    if (f) return 111 + parseInt(f[1], 10);
    if (k.length === 1) return singleCharKeyCode(k);
    // 多字符：长名别名 → 显示符 → 键码表
    const display = ALIASES[k] ?? k;
    return DISPLAY2CODE[display] ?? 0;
}
