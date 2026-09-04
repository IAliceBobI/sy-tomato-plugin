// 官方快捷键球配置解析（期2）：window.siyuan.config.keymap 的键位字符串 →
// shortcutAction 四元组。语义对齐思源 hotKey.ts matchHotKey：修饰键=前导连续
// ⌃⌥⇧⌘ 任意序，其余为主键；custom 优先 default。
// 插件 action.ctrlKey=主修饰键语义（mac ⌘ / win Ctrl）：⌘ 与 ⌃ 都并入 ctrlKey；
// 纯 mac Control（⌃ 不带 ⌘）键位合成时会被映射成 ⌘，系 v1 已知边界（思源 keymap
// 中 ⌃-only 绑定极少，且 win 端 ⌃≡⌘ 由内核 matchHotKey 归一）。

export interface KeymapShortcut {
    key: string;
    altKey: boolean;
    shiftKey: boolean;
    ctrlKey: boolean;
}

export function parseKeymapShortcut(s: string): KeymapShortcut | null {
    if (!s) return null;
    let idx = 0;
    while (idx < s.length && "⌃⌥⇧⌘".includes(s[idx])) {
        idx++;
    }
    const key = s.slice(idx);
    if (!key) return null;
    return {
        key,
        altKey: s.includes("⌥"),
        shiftKey: s.includes("⇧"),
        ctrlKey: s.includes("⌘") || s.includes("⌃"),
    };
}

export interface KeymapFlatEntry {
    group: string;
    name: string;
    hotkey: string;
}

// keymap 两级树（general 一层 + editor.<子组> 一层）→ 平铺可搜索列表；
// custom 优先 default，两皆空不入列表
export function flattenKeymap(keymap: any): KeymapFlatEntry[] {
    const out: KeymapFlatEntry[] = [];
    if (!keymap || typeof keymap !== "object") return out;
    const pushGroup = (group: string, node: any) => {
        if (!node || typeof node !== "object") return;
        for (const name of Object.keys(node)) {
            const entry = node[name];
            const hotkey = entry?.custom || entry?.default || "";
            if (hotkey) {
                out.push({ group, name, hotkey });
            }
        }
    };
    pushGroup("general", keymap.general);
    if (keymap.editor && typeof keymap.editor === "object") {
        for (const sub of Object.keys(keymap.editor)) {
            pushGroup(`editor.${sub}`, keymap.editor[sub]);
        }
    }
    return out;
}

// □8 官方快捷键球中文化：keymap 节点键 ≡ 前端 i18n 键，查 window.siyuan.languages
// 取本地化标签（思源自家键位设置页 keymapUi.ts 同源，天然跟随界面语言）。
// languages 注入晚于 loadPlugins，须渲染/显示时刻惰性读 + ?. 回退原始键。
function kmLang(key?: string): string | undefined {
    return (window as any).siyuan?.languages?.[key as string];
}

export function kmLabel(name: string): string {
    return kmLang(name) ?? name;
}

// group 显示名的语言键 ≠ group 原始段（思源 keymapUi.ts 同款别名表）：
// 语言包无 insert/heading 键；list 键存在但值是「无序列表」——直接查 group 名
// 会错误命中而非回退，必须经表映射。
const KM_GROUP_LANG_KEY: Record<string, string> = {
    general: "general",
    "editor.general": "general",
    "editor.insert": "element",
    "editor.heading": "headings",
    "editor.list": "list1",
    "editor.table": "table",
};

export function kmGroupLabel(group: string): string {
    return kmLang(KM_GROUP_LANG_KEY[group]) ?? group;
}

// shortcut action 的 km 落位（挂球来源携带 {group,name} 原始键）→「组.命令」
// 本地化形态；手录键位球无 km 返回空串，调用方回退 shortcut2string。
export function kmShortcutLabel(action: any): string {
    const km = action?.km;
    if (!km?.group || !km?.name) return "";
    return `${kmGroupLabel(km.group)}.${kmLabel(km.name)}`;
}

// 搜索过滤（□8 双匹配）：本地化标签与原始键名都可命中（中文用户搜「表格」、
// 按原始键搜的不漏）；空过滤恒真。
export function keymapMatches(e: { group: string; name: string }, filter: string): boolean {
    const f = filter.trim().toLowerCase();
    if (!f) return true;
    const hay = `${kmGroupLabel(e.group)}.${kmLabel(e.name)}/${e.group}/${e.name}`.toLowerCase();
    return hay.includes(f);
}

// 存量迁移（□8 一次性+幂等）：期2~期6 挂球时把原始键 `group.name` 落进 label，
// □8 起 label 留给用户命名、原始键走 action.km。label 恰为现有 keymap 条目原始
// 键的球转成 km 形态；用户自定义 label / 命令已退役 / 非 shortcut 球一律不动。
export function migrateKmLabelBalls(list: any[], keymap: any): boolean {
    const byLabel = new Map(flattenKeymap(keymap).map((e) => [`${e.group}.${e.name}`, e]));
    let changed = false;
    for (const b of list) {
        if (b?.type !== "shortcut" || !b.label || b.action?.km) continue;
        const e = byLabel.get(b.label);
        if (!e) continue;
        b.action = { ...(b.action ?? {}), km: { group: e.group, name: e.name } };
        delete b.label;
        changed = true;
    }
    return changed;
}
