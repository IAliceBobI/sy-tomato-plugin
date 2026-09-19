// 只读态快捷键兜底桥——纯决策层（readonlyfix □5，2026-09-19）。
// 背景：内核只读态（protyle.disabled）下插件「editorCallback 命令」两路派发皆死——
// ①编辑态活通道=wysiwyg 键盘链 commonHotkey（source "editorShortcut"），只读态焦点落
// body 事件不经过 wysiwyg 监听器、且 wysiwyg/keydown.ts:318 只读守卫吞一切键；
// ②全局 windowKeyDown 的插件分支（source "shortcut"）supportsPluginCommandSource 对
// 带 editorCallback 的命令整体排除（commandAdapter.ts:55）——故兜底只需认「有
// editorCallback 且有键」的命令，与内核零双触发（无 editorCallback 的命令在只读态
// 仍走内核 callback 通道活着，兜底不认）。
// 本文件零 import（单测直入不拉 siyuan 链）；胶水层在 readonlyHotkey.ts。

/** 兜底桥关注的命令形状（Plugin.commands 元素的子集） */
export interface BridgeCommand {
    langKey?: string;
    customHotkey?: string;
    editorCallback?: (protyle: any, ...rest: any[]) => any;
    [k: string]: any;
}

/** bridgeGate 的事件形状（测试可注入裸对象） */
export interface GateEvent {
    isComposing?: boolean;
    target?: { tagName?: string; isContentEditable?: boolean } | EventTarget | null;
}

const MOD_ORDER = "⌃⌥⇧⌘";

/** 组合键串规范化：修饰键前缀重排为 ⌃⌥⇧⌘ 后与 event2combo 输出做字符串比对（event2combo
 *  恒输出规范序，而 customHotkey 存储可能乱序——如执行摘抄注册值 "⇧⌥Z"，裸比对必漏）；
 *  非 mac 且 ⌃ 开头按内核同款换算 ⌃→⌘（先剥 ⌘ 再换，app/src/protyle/util/hotKey.ts
 *  matchHotKey 开头分支）。注意：内核 matchHotKey 对非规范序前缀恒 false、且非 mac "⌃D"
 *  特例恒拒——本桥比内核略宽（乱序/⌃D 也会命中），仅手改 keymap 脏数据可达且方向安全
 *  （只读态多认、编辑态照旧、无双触发；review P2 留档）。重复修饰键去重（防御脏数据）。 */
export function canonCombo(combo: string, isMac: boolean): string {
    let s = combo;
    if (!isMac && s.startsWith("⌃")) {
        s = s.replace("⌘", "").replace("⌃", "⌘");
    }
    const mods: string[] = [];
    let i = 0;
    while (i < s.length && MOD_ORDER.includes(s[i])) {
        if (!mods.includes(s[i])) mods.push(s[i]);
        i++;
    }
    mods.sort((a, b) => MOD_ORDER.indexOf(a) - MOD_ORDER.indexOf(b));
    return mods.join("") + s.slice(i);
}

/** 从命令表挑出与事件组合键匹配的兜底命令：有 editorCallback + 有非空 customHotkey
 *  （customHotkey 允许乱序前缀，canon 后比对）；首个命中胜出（与内核 find 序一致）。
 *  eventCombo 须已是 event2combo 产物（规范序）。
 *  allow（□8 推广粒度）：给了集合=只认 langKey 在集合内的命令（空集合=一个都不兜底，
 *  deny-by-default）——推广到 tomato/recite 时按拍板清单收窄（未审计的写入族命令留在
 *  只读态照旧死）；缺省=不过滤=全量（progressive 现状）。 */
export function pickBridgeCommand(commands: readonly BridgeCommand[], eventCombo: string, isMac: boolean, allow?: ReadonlySet<string>): BridgeCommand | undefined {
    for (const c of commands) {
        if (!c || typeof c.editorCallback !== "function") continue;
        if (allow && !allow.has(c.langKey ?? "")) continue;
        const hk = c.customHotkey;
        if (typeof hk !== "string" || hk === "") continue;
        if (canonCombo(hk, isMac) === eventCombo) return c;
    }
    return undefined;
}

/** 事件闸：IME 组字中/焦点在输入类元素=拦；仅「激活 protyle 处于只读态」放行
 *  （false/undefined 都拦——编辑态内核通道活着，兜底绝不碰）。 */
export function bridgeGate(ev: GateEvent, activeDisabled: boolean | undefined): boolean {
    if (ev.isComposing) return false;
    const t = ev.target as { tagName?: string; isContentEditable?: boolean } | null | undefined;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return false;
    return activeDisabled === true;
}
