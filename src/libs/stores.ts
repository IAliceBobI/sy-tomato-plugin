import { writable, get } from "svelte/store";
import { Plugin } from "siyuan";
import { STORAGE_Prog_SETTINGS, STORAGE_SETTINGS } from "../constants";
import { siyuan } from "./utils";
import { HISTORY_MSGS_DEFAULT, DOC_SNAPSHOT_DEFAULT } from "./agentContext";
import { zipNways } from "./functional";
import { events } from "./Events";
import { BaseTomatoPlugin } from "./BaseTomatoPlugin";
import { getGlobal, setGlobal } from "stonev5-utils";
import { TomatoPluginConfig } from "./gconst";

/** 设置 store 热更注册表（siyuan383 □3）：各工厂 load() 时自动登记「从新 cfg 重放
 *  读值语义」的回调（重绑捕获引用 + store.set 新值）；storageHotReload 的
 *  syncSettingsFromDisk 替换 plugin.settingCfg 后遍历刷值——响应式 UI 无闪断热更。 */
const settingStoreRegistry = new Map<string, (cfg: TomatoSettings) => void>();
/** keys 省略=全量刷；传入=只刷指定键（热更走 diff 键集，免未变值的多余通知/写盘） */
export function reloadSettingStores(cfg: TomatoSettings, keys?: string[]) {
    if (!cfg) return;
    const entries = keys ? keys.map(k => [k, settingStoreRegistry.get(k)] as const) : settingStoreRegistry;
    for (const [, reloadFrom] of entries) reloadFrom?.(cfg);
}

/** 热更替换 settingCfg 后重绑两处全局引用（review P1-1）：onload 期只在启动赋值一次，
 *  不重绑=PairBarBox 位置记忆/MarkdownExport 增量水位线等 getTomatoPluginConfig()
 *  消费者写孤儿旧对象，随后 write() 落盘新对象=静默丢写。钩子与保存链共用。 */
export function rebindTomatoConfigRefs(plugin: BaseTomatoPlugin) {
    setGlobal(TomatoPluginConfig, plugin.settingCfg);
    const w = window.tomato_zZmqus5PtYRi;
    if (w) w.pluginConfig = plugin.settingCfg;
}

export function writableWithGet<T>(t: T) {
    const store = writable(t);
    return {
        ...store,
        get(process?: (_a: T) => T) {
            if (process != null) return process(get(store));
            return get(store);
        },
    }
}

export const storeNoteBox_selectedNoteType = (() => {
    const store = writableWithGet("");
    let settingCfg: TomatoSettings;
    let plugin: Plugin;
    return {
        ...store,
        init: (types: string[]) => {
            store.update((v) => {
                if (!v && types?.length > 0) return types[0];
                return v;
            });
        },
        load: (p: Plugin, s: TomatoSettings) => {
            plugin = p;
            settingCfg = s;
            settingStoreRegistry.set("storeNoteBox_selectedNoteType", (cfg) => {
                settingCfg = cfg;
                store.set(cfg["storeNoteBox_selectedNoteType"]);
            });
            store.set(s["storeNoteBox_selectedNoteType"]);
        },
        save: (v?: string) => {
            if (v == null) {
                v = get(store);
            } else {
                store.set(v);
            }
            if (plugin && settingCfg && v) {
                settingCfg["storeNoteBox_selectedNoteType"] = v;
                plugin.saveData(STORAGE_SETTINGS, settingCfg);
            }
        }
    };
})();

export const storeNoteBox_keep = (() => {
    const store = writable(false);
    let settingCfg: TomatoSettings;
    let plugin: Plugin;
    store.subscribe((v) => {
        if (plugin && settingCfg) {
            settingCfg["storeNoteBox_keep"] = v;
            plugin.saveData(STORAGE_SETTINGS, settingCfg);
        }
    });
    return {
        ...store,
        load: (p: Plugin, s: TomatoSettings) => {
            plugin = p;
            settingCfg = s;
            settingStoreRegistry.set("storeNoteBox_keep", (cfg) => {
                settingCfg = cfg; // subscribe 即时写盘走此引用，须先重绑再重放
                store.set(cfg["storeNoteBox_keep"] ?? false);
            });
            store.set(s["storeNoteBox_keep"] ?? false);
        },
    };
})();

export const storeNoteBox_pin = (() => {
    const store = writableWithGet(false);
    let settingCfg: TomatoSettings;
    let plugin: Plugin;
    return {
        ...store,
        load: (p: Plugin, s: TomatoSettings) => {
            plugin = p;
            settingCfg = s;
            settingStoreRegistry.set("storeNoteBox_pin", (cfg) => {
                settingCfg = cfg;
                store.set(cfg["storeNoteBox_pin"] ?? false);
            });
            store.set(s["storeNoteBox_pin"] ?? false);
        },
        save: (v: boolean) => {
            store.set(v);
            if (plugin && settingCfg && settingCfg["storeNoteBox_pin"] !== v) {
                settingCfg["storeNoteBox_pin"] = v;
                plugin.saveData(STORAGE_SETTINGS, settingCfg);
            }
        }
    };
})();

export const storeNoteBox_noteCount = (() => {
    const store = writable(0);
    return {
        ...store,
        inc: () => {
            store.update(n => n + 1);
        }
    };
})();

/** 近期条目：新结构带收集容器块 id（点击跳日记定位）+类型角标；老数据=纯文本 string 防御读 */
export interface RecentItem {
    id?: string;   // 收集容器 superblock 块 id（无 id=老数据/图片兜底，点击不跳）
    type: string;  // 收集时的分类（角标显示）
    text: string;  // 正文
}
export const storeNoteBox_recentText = (() => {
    const store = writable([] as (string | RecentItem)[]);
    let settingCfg: TomatoSettings;
    let plugin: Plugin;
    const write = () => {
        if (plugin && settingCfg) {
            settingCfg["storeNoteBox_recentText"] = get(store);
            plugin.saveData(STORAGE_SETTINGS, settingCfg);
        }
    }
    return {
        ...store,
        load: (p: Plugin, s: TomatoSettings) => {
            plugin = p;
            settingCfg = s;
            settingStoreRegistry.set("storeNoteBox_recentText", (cfg) => {
                settingCfg = cfg;
                store.set(cfg["storeNoteBox_recentText"] ?? []);
                storeNoteBox_noteCount.set(get(store).length);
            });
            store.set(s["storeNoteBox_recentText"] ?? []);
            storeNoteBox_noteCount.set(get(store).length);
        },
        save: (e: RecentItem, max = 20) => {
            store.update(list => {
                while (list.length >= max) list.pop();
                list.splice(0, 0, e);
                return list;
            });
            write();
        },
        clean: () => {
            store.set([]);
            write();
        }
    };
})();

export const storeNoteBox_noteAreaText = (() => {
    const store = writable("");
    let settingCfg: TomatoSettings;
    let plugin: Plugin;
    return {
        ...store,
        load: (p: Plugin, s: TomatoSettings) => {
            plugin = p;
            settingCfg = s;
            settingStoreRegistry.set("storeNoteBox_noteAreaText", (cfg) => {
                settingCfg = cfg;
                store.set(cfg["storeNoteBox_noteAreaText"] ?? "");
            });
            store.set(s["storeNoteBox_noteAreaText"] ?? "");
        },
        save: () => {
            if (plugin && settingCfg && get(store) != settingCfg["storeNoteBox_noteAreaText"]) {
                settingCfg["storeNoteBox_noteAreaText"] = get(store);
                return plugin.saveData(STORAGE_SETTINGS, settingCfg);
            }
        },
    };
})();

function notebookStoreFactory(k = "storeNoteBox_selectedNotebook") {
    const store = writableWithGet("");
    let settingCfg: TomatoSettings;
    let plugin: Plugin;
    return {
        ...store,
        load: (p: Plugin, s: TomatoSettings) => {
            plugin = p;
            settingCfg = s;
            settingStoreRegistry.set(k, (cfg) => {
                settingCfg = cfg; // 重绑捕获引用（save 写它），再重放读值
                store.set(cfg[k] ?? "");
            });
            store.set(s[k] ?? "");
        },
        getOr: () => {
            if (!store.get()) {
                return events.boxID
            }
            return store.get()
        },
        save: () => {
            if (plugin && settingCfg) {
                settingCfg[k] = get(store);
                plugin.saveData(STORAGE_SETTINGS, settingCfg);
            }
        },
    };
}

/** 全局「日记落点笔记本」（dailynote-pipeline □1 坐实语义）：所有落当天日记的生产者共用
 *  ——DailyNoteBox（导航/复制/移动）、NoteBox 闪念落账、BackLinkBottom、navUtils、docAction；
 *  getOr() 空时兜底当前笔记本。快速笔记 storeNoteBox_fastnote=独立草稿本语义（非日记管线），
 *  闪念指定文件 flash_thoughts_target_file=落点的文件级覆盖（空=按日新日记/非空=固定文件）。 */
export const storeNoteBox_selectedNotebook = notebookStoreFactory();
export const storeNoteBox_fastnote = notebookStoreFactory("storeNoteBox_fastnote");
/** 批注草稿文档存放笔记本（2026-09-02）：未配置默认跟随系统日记本（annoDraft.initAnnoDraftNotebookDefault 注入） */
export const DRAFT_NOTEBOOK_KEY = "commentBoxAnnoDraftNotebook";
export const commentBoxAnnoDraftNotebook = notebookStoreFactory(DRAFT_NOTEBOOK_KEY);

export const storeAttrManager = () => {
    const store = writableWithGet({} as AttrType);
    let blockID = "";
    let key: keyof (AttrType);
    const set: Set<string> = new Set();
    let sep: string = ",";
    let cleanTimeKey: keyof (AttrType);
    function join() {
        return [...set.values()].filter(i => !!i).join(sep);
    }
    return {
        ...store,
        loadList: async (
            _blockID: string,
            _key: keyof (AttrType),
            _sep: string = ",",
            _cleanTimeKey: keyof (AttrType) = "custom-tomatoUpdated",
        ) => {
            blockID = _blockID;
            key = _key;
            sep = _sep
            cleanTimeKey = _cleanTimeKey
            const attr = await siyuan.getBlockAttrs(blockID);
            store.set(attr);
            set.clear();
            store.get()[key] = store.get()[key] ?? "";
            store.get()[key].split(sep).filter(i => !!i).forEach(i => set.add(i.trim()))
        },
        save: async () => {
            store.get()[key] = join();
            await siyuan.setBlockAttrs(blockID, newObj(key, store.get()[key]));
        },
        syIDClean: async () => {
            const updated = Number(store.get()[cleanTimeKey]) || 0
            const now = new Date().getTime();
            if (now - updated > 1000 * 60 * 60) {
                const ids = [...set.values()];
                const idExists = await Promise.all(ids.map(i => siyuan.checkBlockExist(i)));
                for (const [id, exists] of zipNways(ids, idExists)) {
                    if (!exists) set.delete(id);
                }
                const nowStr = String(now);
                store.get()[cleanTimeKey] = nowStr;
                store.get()[key] = join();
                await siyuan.setBlockAttrs(blockID, newObj(
                    cleanTimeKey, store.get()[cleanTimeKey],
                    key, store.get()[key]),
                );
            }
        },
        getValue: () => {
            return [...set.values()];
        },
        getListString: () => {
            return set;
        },
        addListString: (...values: string[]) => {
            for (let value of values) {
                value = value.trim()
                if (!set.has(value)) {
                    set.add(value);
                    store.get()[key] = join();
                }
            }
        },
        delListString: (...values: string[]) => {
            for (let value of values) {
                value = value.trim()
                if (set.has(value)) {
                    set.delete(value);
                    store.get()[key] = join();
                }
            }
        },
    };
}

export function newObj<R>(...kv: any): R {
    const a = {} as R;
    for (let i = 0; i + 1 < kv.length; i += 2) {
        a[kv[i]] = kv[i + 1];
    }
    return a;
}

const settingFactory = <T>(key: TSK, defaultValue: T, file: string, _void: TSK) => {
    const store = writableWithGet(defaultValue);
    let plugin: BaseTomatoPlugin;
    function save(value: T) {
        if (plugin && plugin.settingCfg && value != null) {
            store.set(value);
            plugin.settingCfg[key as string] = value;
        }
    }
    return {
        ...store,
        default() {
            return defaultValue;
        },
        key() {
            return key
        },
        loadDefault() {
            save(defaultValue);
        },
        load(p: BaseTomatoPlugin) {
            plugin = p;
            settingStoreRegistry.set(key as string, (cfg) => {
                // 读值语义重放（与下方同款）：null 补默认写回 cfg，防后续搭车写回落旧值
                const v = cfg[key] != null ? cfg[key] : defaultValue;
                store.set(v as T);
                cfg[key] = v as never;
            });
            if (plugin.settingCfg[key] != null) {
                store.set(plugin.settingCfg[key] as T);
            } else {
                store.set(defaultValue);
                plugin.settingCfg[key] = defaultValue as never;
            }
        },
        set(value: T) {
            // 注意：set 写内存 store + settingCfg[key]，不落盘≠会话级——之后任何整文件
            // saveData（其他键的 write()/设置面板保存）都会搭车把它持久化；要确定不落盘
            // 得用会话级裸 store，要确定落盘紧跟 write()（渐进 digSubrankOpen P1-1 教训）
            save(value);
        },
        // 返回落盘 Promise：调用方紧跟 reload/跳转时必须 await，否则 saveData 的
        // 异步写会被 reload 掐断，文件保持旧值（2026-08-24 取消激活白点实测）
        async write(value?: T): Promise<void> {
            if (value == null) {
                value = store.get();
            }
            if (value != null) {
                save(value);
                if (plugin && plugin.settingCfg) {
                    await plugin.saveData(file, plugin.settingCfg);
                }
            }
        }
    };
};

export const userToken = settingFactory("userToken", "", STORAGE_SETTINGS, null as TSK);
export const userID = settingFactory("userID", "", STORAGE_SETTINGS, null as TSK);
// 语义 = 已回填激活码的 md5 指纹（libs/redeem.ts fingerprintOf，spec admin-codes 批次 B1）；
// 升级前老值为布尔——读到的代码走指纹比对自然处理（布尔必然不等 → 触发一次幂等回填）
export const licenseCloudSynced = settingFactory("licenseCloudSynced", "", STORAGE_SETTINGS, null as TSK);
/** 批注收集使用记忆（2026-09-02，不出设置面板行——是记忆不是偏好）：范围/去向/指定文件目标 */
export const annoCollectScope = settingFactory("annoCollectScope", "doc", STORAGE_SETTINGS, null as TSK);
export const annoCollectDest = settingFactory("annoCollectDest", "daily", STORAGE_SETTINGS, null as TSK);
/** 批注自动归档（annoarch □4）：开=批注保存（创建/编辑）后 fire-and-forget 全量重算
 *  归位到各自日记；默认关（收集仍是显式动作） */
export const annoAutoArchive = settingFactory("annoAutoArchive", false, STORAGE_SETTINGS, null as TSK);
export const annoCollectTargetDoc = settingFactory("annoCollectTargetDoc", "", STORAGE_SETTINGS, null as TSK);
export const exportIntervalSec = settingFactory("exportIntervalSec", "5", STORAGE_SETTINGS, null as TSK);
export const exportIntervalSecOn = settingFactory("exportIntervalSecOn", true, STORAGE_SETTINGS, null as TSK);
export const exportCleanFiles = settingFactory("exportCleanFiles", "60", STORAGE_SETTINGS, null as TSK);
export const exportCleanFilesOn = settingFactory("exportCleanFilesOn", true, STORAGE_SETTINGS, null as TSK);
export const exportPath = settingFactory("exportPath", "", STORAGE_SETTINGS, null as TSK);
export const exportPathWin = settingFactory("exportPathWin", "", STORAGE_SETTINGS, null as TSK);
export const foldTypes = settingFactory("foldTypes", [], STORAGE_SETTINGS, null as TSK);
export const foldTypesSuperBlock = settingFactory("foldTypesSuperBlock", false, STORAGE_SETTINGS, null as TSK);
export const foldTypesBLOCKQUOTE = settingFactory("foldTypesBLOCKQUOTE", false, STORAGE_SETTINGS, null as TSK);
export const foldTypesNODE_LIST = settingFactory("foldTypesNODE_LIST", false, STORAGE_SETTINGS, null as TSK);
export const foldTypesNODE_listITEM = settingFactory("foldTypesNODE_listITEM", false, STORAGE_SETTINGS, null as TSK);
export const foldTypesNODE_TABLE = settingFactory("foldTypesNODE_TABLE", false, STORAGE_SETTINGS, null as TSK);
export const foldTypesNODE_HEADING = settingFactory("foldTypesNODE_HEADING", false, STORAGE_SETTINGS, null as TSK);
export const addSelectionBtnsMobile = settingFactory("addSelectionBtnsMobile", true, STORAGE_SETTINGS, null as TSK);
export const addSelectionBtnsDesktop = settingFactory("addSelectionBtnsDesktop", true, STORAGE_SETTINGS, null as TSK);
export const cssRefStyle = settingFactory("cssRefStyle", false, STORAGE_SETTINGS, null as TSK);
// 引用效果多档化（2026-09-03）：cssRefStyle/cssRefSquareBrackets 双开关合并为单枚举
// none/brackets/icon/shadow/highlight；旧开关保留存储仅供迁移读取，面板不再展示
export const cssRefEffect = settingFactory("cssRefEffect", "none", STORAGE_SETTINGS, null as TSK);

/** 旧双开关 → cssRefEffect 迁移映射：style 开启时旧实现里括号被短路静默失效，
 *  故双开与只开 style 同落 shadow，迁移后渲染与迁移前完全一致 */
export function refEffectFromLegacy(styleOn: boolean, bracketsOn: boolean): string {
    return styleOn ? "shadow" : bracketsOn ? "brackets" : "none";
}
export const exportWL4All = settingFactory("exportWL4All", false, STORAGE_SETTINGS, null as TSK);
export const exportWhiteList = settingFactory("exportWhiteList", [], STORAGE_SETTINGS, null as TSK);
export const exportBlackList = settingFactory("exportBlackList", [], STORAGE_SETTINGS, null as TSK);
// 右键菜单逐项隐藏（□4）：存「已隐藏菜单项 key 集合」，空=全显示；key 体系=winHotkey langKey 或 m.<模块>.<语义> 前缀
export const hiddenMenuItems = settingFactory("hiddenMenuItems", [], STORAGE_SETTINGS, null as TSK);
// 命令开关（featgate □1 2026-09-10）：命令 langKey→bool 单键 map，缺省=全开（老用户零感知，
// 与 hiddenMenuItems 单键模式同款）；map 恒只存显式关项（nextCommandToggles 再开清键）。
// 消费=gatedAddCommand 条件注册（libs/cmdGate.ts）；改后需插件级重载生效
export const commandToggles = settingFactory("commandToggles", {} as Record<string, boolean>, STORAGE_SETTINGS, null as TSK);
// 默认开启（2026-08-22 用户拍板：干净路径是默认形态，无需选择）；已存储过旧值的用户不受影响。
export const exportCleanPath = settingFactory("exportCleanPath", true, STORAGE_SETTINGS, null as TSK);
export const showDocAttrs = settingFactory("showDocAttrs", false, STORAGE_SETTINGS, null as TSK);
export const cssNattyList = settingFactory("cssNattyList", false, STORAGE_SETTINGS, null as TSK);
export const cssListBackgound = settingFactory("cssListBackgound", false, STORAGE_SETTINGS, null as TSK);
export const cssRefSquareBrackets = settingFactory("cssRefSquareBrackets", false, STORAGE_SETTINGS, null as TSK);
export const cssRefAsTags = settingFactory("cssRefAsTags", "", STORAGE_SETTINGS, null as TSK);
export const cssShowMemo = settingFactory("cssShowMemo", false, STORAGE_SETTINGS, null as TSK);
export const cssShowFlashCardBlank = settingFactory("cssShowFlashCardBlank", false, STORAGE_SETTINGS, null as TSK);
export const cssShowHomeEndIcon = settingFactory("cssShowHomeEndIcon", false, STORAGE_SETTINGS, null as TSK);
export const cssHomeEndIconLeft = settingFactory("cssHomeEndIconLeft", false, STORAGE_SETTINGS, null as TSK);
export const keepLazyLoadStore = settingFactory("keepLazyLoadStore", false, STORAGE_SETTINGS, null as TSK);
export const awaysExitFocusStore = settingFactory("awaysExitFocusStore", false, STORAGE_SETTINGS, null as TSK);
export const graphBoxCheckbox = settingFactory("graphBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const graphMaxPBlocks = settingFactory("graphMaxPBlocks", 20, STORAGE_SETTINGS, null as TSK);
export const graphMaxAllBlocks = settingFactory("graphMaxAllBlocks", 800, STORAGE_SETTINGS, null as TSK);
// graphbox 期1（2026-09-03）：结构边默认显示（树回归）。存量用户已存的 petal 值不受影响（settingFactory 语义）。
export const graphHideStructEdges = settingFactory("graphHideStructEdges", false, STORAGE_SETTINGS, null as TSK);
// graphbox 期2（2026-09-04）：折叠机制默认展开层级（"1"|"2"|"3"|"all"，按标题层级 h1=1；段落链折叠独立于档位）
export const graphDefaultExpandLevel = settingFactory("graphDefaultExpandLevel", "2", STORAGE_SETTINGS, null as TSK);
// graphbox 期7（2026-09-04）：默认布局形态（"lr"|"tb"|"vlr"|"vtb"；文档无 custom-graph-layout 时用，
// 顶栏循环钮写的 per-doc 持久化优先）
export const graphDefaultLayout = settingFactory("graphDefaultLayout", "lr", STORAGE_SETTINGS, null as TSK);
export const graphAddTopbarIcon = settingFactory("graphAddTopbarIcon", true, STORAGE_SETTINGS, null as TSK);
export const graph打开块关系图Menu = settingFactory("graphopengraphMenu", true, STORAGE_SETTINGS, null as TSK);
export const graph定位到图中的节点Menu = settingFactory("graphlocatetographMenu", true, STORAGE_SETTINGS, null as TSK);
export const tomatoClockCheckbox = settingFactory("tomatoClockCheckbox", true, STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_audio = settingFactory("tomato_clocks_audio", "", STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_notice = settingFactory("tomato_clocks_notice", true, STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_focus = settingFactory("tomato_clocks_focus", true, STORAGE_SETTINGS, null as TSK);
export const tomato_clocks = settingFactory("tomato-clocks", "5,10,15,20,25,45", STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_force_dialog = settingFactory("tomato_clocks_force_dialog", true, STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_force_notice = settingFactory("tomato-clocks-force-notice", "", STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_change_bg = settingFactory("tomato-clocks-change-bg", "", STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_change_bg_dark = settingFactory("tomato-clocks-change-bg-dark", "", STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_position_right = settingFactory("tomato_clocks_position_right", true, STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_opacity = settingFactory("tomato_clocks_opacity", "0.16", STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_loop = settingFactory("tomato_clocks_loop", false, STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_break = settingFactory("tomato_clocks_break", "5", STORAGE_SETTINGS, null as TSK);
export const toolbarEN2CHBtn = settingFactory("toolbarEN2CHBtn", false, STORAGE_SETTINGS, null as TSK);
export const toolbarTidy = settingFactory("toolbarTidy", false, STORAGE_SETTINGS, null as TSK);
// 快捷键卡「快捷键与开关」纯命令族开关（2026-09-06 开关归拢）：关=命令面板项+快捷键齐消失（注册门控）
export const copyIdCheckbox = settingFactory("copyIdCheckbox", true, STORAGE_SETTINGS, null as TSK);
export const foldCmdCheckbox = settingFactory("foldCmdCheckbox", true, STORAGE_SETTINGS, null as TSK);
export const toolbarTidyExt = settingFactory("toolbarTidyExt", "doc docx xls xlsx emmx sql", STORAGE_SETTINGS, null as TSK);
export const toolbarspacerepeat = settingFactory("toolbarspacerepeat", true, STORAGE_SETTINGS, null as TSK);
export const toolbarrefreshVr = settingFactory("toolbarrefreshVr", true, STORAGE_SETTINGS, null as TSK);
export const toolbarlocatedoc = settingFactory("toolbarlocatedoc", true, STORAGE_SETTINGS, null as TSK);
// 大刷新（2026-09-06 seller 迁入）：顶栏大刷新钮（整页硬刷新）总开关，默认关——顶栏共享
// 空间零打扰，power-user 自开；独立于 ToolbarBox/MixBox 家族（无 master 门控，维护型工具
// 与内容类小功能不同类）。开关改后保存→插件级重载生效（顶栏注册在 onload）
export const bigReloadTopbar = settingFactory("bigReloadTopbar", false, STORAGE_SETTINGS, null as TSK);
// 打字标点自动整理（2026-09-10 puncttidy 战役 seller 迁入，免费）：普适档=‘’“”配对重排/。。
// →……/句末+“方向纠正；开=onload 挂 wysiwyg observer（注册门控，改开关保存→插件级重载生效）；
// 默认关——公开侧新功能零打扰，bear 与老 seller 用户自开。引擎=libs/punctTidy.ts（seller 双消费）
export const punctTidyEnable = settingFactory("punctTidyEnable", false, STORAGE_SETTINGS, null as TSK);
// 速记折叠扩展规则（puncttidy）：折叠族（··/成对单引号→『、》》/《《→箭头）+『』【】配对+
// 扩展方向修正，默认关；observer 回调实时读→改完保存即时生效（非结构性）
export const punctTidyExtRules = settingFactory("punctTidyExtRules", false, STORAGE_SETTINGS, null as TSK);
// 自定义标点映射（puncttidy □7）：一行一条「源→目标」（源=单字符，如 '→‘ / .→。），默认空=
// 零打扰；observer 回调实时读→保存即时生效（非结构性）。解析/守卫语义=libs/punctTidy.ts
export const punctTidyCustomMap = settingFactory("punctTidyCustomMap", "", STORAGE_SETTINGS, null as TSK);
export const readingPointBoxCheckbox = settingFactory("readingPointBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const readingTopBar = settingFactory("readingTopBar", true, STORAGE_SETTINGS, null as TSK);
// 阅读点翻新（2026-09）：状态栏指示钮（有点点亮点击跳回/无点半暗点击设点）；以下五项随老模型退役
// （readingDialog/readingSaveFile/readingAdd2Card/readingAdd2DocName/readingPointWithEnv，存量 petal 值残留无害）
export const readingStatusBar = settingFactory("readingStatusBar", false, STORAGE_SETTINGS, null as TSK);
export const readingShowAllFolders = settingFactory("readingShowAllFolders", false, STORAGE_SETTINGS, null as TSK);
// rpfloatbar 战役（2026-09-05）入口收敛：悬浮球成主交互面（球↔条双态），状态栏/顶栏钮语义
// 统一为 toggle 球显隐（readingFloatBar 关时回退打开面板）→ readingStatusBar 默认 true→false、
// 三右键菜单开关默认 true→false（存量用户已存的 petal 值不受影响，settingFactory.load 存储值优先）
export const readingAddRPmenu = settingFactory("readingAddRPmenu", false, STORAGE_SETTINGS, null as TSK);
export const readingAddJumpMenu = settingFactory("readingAddJumpMenu", false, STORAGE_SETTINGS, null as TSK);
export const readingAddDeleteMenu = settingFactory("readingAddDeleteMenu", false, STORAGE_SETTINGS, null as TSK);
// 悬浮球主控（关=球整体不出场，顶栏/状态栏点击回退打开面板）；hidden=用户隐藏标记（球菜单/入口 toggle）
export const readingFloatBar = settingFactory("readingFloatBar", true, STORAGE_SETTINGS, null as TSK);
export const readingFloatBallHidden = settingFactory("readingFloatBallHidden", false, STORAGE_SETTINGS, null as TSK);
// 设点入闪卡（readpoint □2-B 复活 2026-09-08）：设点=原文块进闪卡+立即到期（复习卡=「回原文
// 继续读」锚，与渐进复习流联动）；老版同开关名复活，翻新期存量 petal 值残留=正好无缝接回默认偏好
export const readingAdd2Card = settingFactory("readingAdd2Card", true, STORAGE_SETTINGS, null as TSK);
/** 球位置持久化：九宫格锚点(0-8)+像素偏移（ballGeometry 同款语义；anchor=5 中右默认，避让 recite 右下/渐进左下） */
export interface RPBallPos {
    anchor: number; offsetX: number; offsetY: number;
    /** 自由位像素（□4 自由拖动）：存在即优先于锚点模型渲染；拖拽松手写入，旧锚点存量不迁移 */
    x?: number; y?: number;
}
export const readingFloatBallPos = settingFactory("readingFloatBallPos", { anchor: 5, offsetX: 0, offsetY: 0 } as RPBallPos, STORAGE_SETTINGS, null as TSK);
export const cardBoxCheckbox = settingFactory("cardBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const cardBoxCardtab = settingFactory("cardBoxCardtab", false, STORAGE_SETTINGS, null as TSK);
export const card_refresh_visible_only = settingFactory("card_refresh_visible_only", true, STORAGE_SETTINGS, null as TSK);
export const cardBoxSuperCard = settingFactory("cardBoxSuperCard", false, STORAGE_SETTINGS, null as TSK);
export const cardBoxAddConcepts = settingFactory("cardBoxAddConcepts", false, STORAGE_SETTINGS, null as TSK);
export const cardBoxSpradEvenlyPostpone = settingFactory("cardBoxSpradEvenlyPostpone", true, STORAGE_SETTINGS, null as TSK);
export const cardBoxDelayDays = settingFactory("cardBoxDelayDays", 0.1, STORAGE_SETTINGS, null as TSK);
export const cardBoxSettingsShow = settingFactory("cardBoxSettingsShow", false, STORAGE_SETTINGS, null as TSK);
export const cardBoxDeleteNoConfirm = settingFactory("cardBoxDeleteNoConfirm", false, STORAGE_SETTINGS, null as TSK);
export const cardPriorityBoxCheckbox = settingFactory("cardPriorityBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const cardPrioritySetPriInterval = settingFactory("cardPrioritySetPriInterval", "0", STORAGE_SETTINGS, null as TSK);
export const cardPriorityBoxPostponeCardMenu = settingFactory("cardPriorityBoxPostponeCardMenu", true, STORAGE_SETTINGS, null as TSK);
export const deleteBlocksMenu = settingFactory("deleteBlocksMenu", true, STORAGE_SETTINGS, null as TSK);
export const cardPriorityBoxSpradDelayMenu = settingFactory("cardPriorityBoxSpradDelayMenu", true, STORAGE_SETTINGS, null as TSK);
export const cardPriorityBoxPriorityMenu = settingFactory("cardPriorityBoxPriorityMenu", true, STORAGE_SETTINGS, null as TSK);
export const cardPriorityBoxAutoHide = settingFactory("cardPriorityBoxAutoHide", false, STORAGE_SETTINGS, null as TSK);
// 按钮条位置四档（1548 □1 用户拍板四形态做成下拉）：right=内核原生块右上悬空（默认，
// 存量用户零变化）/ left-top=块左上悬空 / block-tail=内容下方贴左（随流占位）/
// block-head=内容上方贴左（块首腾位）。hover 显隐由 cardPriorityBoxAutoHide 正交控制
export const cardPriBarPos = settingFactory("cardPriBarPos", "right", STORAGE_SETTINGS, null as TSK);
export const auto_card_priority = settingFactory("auto-card-priority", false, STORAGE_SETTINGS, null as TSK);
export const card_priority_slider_hide = settingFactory("card_priority_slider_hide", false, STORAGE_SETTINGS, null as TSK);
export const card_priority_stopBtn_hide = settingFactory("card_priority_stopBtn_hide", false, STORAGE_SETTINGS, null as TSK);
export const superRefBoxCheckBox = settingFactory("superRefBoxCheckBox", false, STORAGE_SETTINGS, null as TSK);
export const superRefBoxGlobalLnkMenu = settingFactory("superRefBoxGlobalLnkMenu", true, STORAGE_SETTINGS, null as TSK);
export const blockEditorBox = settingFactory("blockEditorBox", false, STORAGE_SETTINGS, null as TSK);
export const blockEditorMenu = settingFactory("blockEditorMenu", true, STORAGE_SETTINGS, null as TSK);
// □5 块编辑器常驻悬浮球：开=onload 即挂收缩球（toggle 入口统一为球显隐）；默认开
// （提需求者本人要球；参照阅读点 readingFloatBar 默认 true）
export const qeFloatBall = settingFactory("qeFloatBall", true, STORAGE_SETTINGS, null as TSK);
export const superRefBoxGlobalFixMenu = settingFactory("superRefBoxGlobalFixMenu", true, STORAGE_SETTINGS, null as TSK);
// R5 □1 总开关化退役：cpBoxCheckbox/linkBoxCheckbox/linkBoxSyncBlock 三功能开关并入
// pairBarEnabled（老 petal 存量值读不到即忽略，零迁移）
export const linkBoxBilinkMenu = settingFactory("linkBoxBilinkMenu", true, STORAGE_SETTINGS, null as TSK);
export const linkBoxAttrIconOnHide = settingFactory("linkBoxAttrIconOnHide", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxSyncHref = settingFactory("linkBoxSyncHref", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxSyncRef = settingFactory("linkBoxSyncRef", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxSyncBlockAuto = settingFactory("linkBoxSyncBlockAuto", true, STORAGE_SETTINGS, null as TSK);
export const linkBoxSyncScanDeep = settingFactory("linkBoxSyncScanDeep", true, STORAGE_SETTINGS, null as TSK);
export const linkBoxSyncRemapChildID = settingFactory("linkBoxSyncRemapChildID", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxLnkTitle = settingFactory("linkBoxLnkTitle", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxUseLnkOrRef = settingFactory("linkBoxUseLnkOrRef", false, STORAGE_SETTINGS, null as TSK);
// 块配对接力浮条（□2 V1 起）：R5 □1 后总开关管全部注册，浮条灰态只剩 VIP 档（gate 退役）
export const pairBarEnabled = settingFactory("pairBarEnabled", true, STORAGE_SETTINGS, null as TSK);
export const pairBarDefaultFunc = settingFactory("pairBarDefaultFunc", "", STORAGE_SETTINGS, null as TSK);
// 「上次功能」记忆（R4 起直跳退役）：执行成功即写；funcs 面板高亮上次功能用（只高亮不抢焦点）
export const pairBarLastFunc = settingFactory("pairBarLastFunc", "", STORAGE_SETTINGS, null as TSK);
// 「最近用过的块」（R4 预填增强）：执行成功写首源块 id；出场无选区无光标时合成伪 stash
// 预填第一框的兜底源（优先级 stash > 最近块 > 空；跨文档/已删块消费时校验存在性）
export const pairBarLastSrcID = settingFactory("pairBarLastSrcID", "", STORAGE_SETTINGS, null as TSK);
export const pairBarEntryHotkey = settingFactory("pairBarEntryHotkey", true, STORAGE_SETTINGS, null as TSK);
export const pairBarEntryStatus = settingFactory("pairBarEntryStatus", true, STORAGE_SETTINGS, null as TSK);
export const pairBarEntryMenu = settingFactory("pairBarEntryMenu", true, STORAGE_SETTINGS, null as TSK);
export const pairBarEntryIconMenu = settingFactory("pairBarEntryIconMenu", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteBoxCheckbox = settingFactory("dailyNoteBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const dailyNoteGoToBottom = settingFactory("dailyNoteGoToBottom", false, STORAGE_SETTINGS, null as TSK);
export const dailyNoteGoToBottomMenu = settingFactory("dailyNoteGoToBottomMenu", true, STORAGE_SETTINGS, null as TSK);
export const dailyNotetopbarleft = settingFactory("dailyNotetopbarleft", true, STORAGE_SETTINGS, null as TSK);
export const dailyNotetopbarright = settingFactory("dailyNotetopbarright", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteMoveToBottom = settingFactory("dailyNoteMoveToBottom", false, STORAGE_SETTINGS, null as TSK);
export const dailyNoteMoveLeaveLnk = settingFactory("dailyNoteMoveLeaveLnk", false, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopySimple = settingFactory("dailyNoteCopySimple", false, STORAGE_SETTINGS, null as TSK);
// □3 片段级复制（2026-09-06）：开=块内划词时「复制到 dailynote」智能片段级（只复制选中
// 文本+源锚，套收集块协议 v1）；关=维持整块。划词工具条钮门控=本键&&dailyNoteCopyMenu
export const dailyNoteCopyFragment = settingFactory("dailyNoteCopyFragment", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyMenu = settingFactory("dailyNoteCopyMenu", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyAnchorText = settingFactory("dailyNoteCopyAnchorText", "  *  ", STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyUseRef = settingFactory("dailyNoteCopyUseRef", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyUpdateBG = settingFactory("dailyNoteCopyUpdateBG", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyInsertPR = settingFactory("dailyNoteCopyInsertPR", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyShowPath = settingFactory("dailyNoteCopyShowPath", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyFlashCard = settingFactory("dailyNoteCopyFlashCard", false, STORAGE_SETTINGS, null as TSK);
export const imgOverlayCheckbox = settingFactory("imgOverlayCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const backLinkBottomBoxCheckbox = settingFactory("backLinkBottomBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const bk启用禁用文档的底部反链menu = settingFactory("bkenableAndDisablemenu", true, STORAGE_SETTINGS, null as TSK);
export const back_link_max_size = settingFactory("back-link-max-size", 10, STORAGE_SETTINGS, null as TSK);
export const back_link_mention_count = settingFactory("back-link-mention-count", 2, STORAGE_SETTINGS, null as TSK);
export const back_link_default_off = settingFactory("back-link-default-off", false, STORAGE_SETTINGS, null as TSK);
export const back_link_dailynote_off = settingFactory("back-link-dailynote-off", false, STORAGE_SETTINGS, null as TSK);
export const back_link_refresh_off = settingFactory("back_link_refresh_off", true, STORAGE_SETTINGS, null as TSK);
export const bk_refresh_interval_sec = settingFactory("bk_refresh_interval_sec", 15, STORAGE_SETTINGS, null as TSK);
export const bk_visible_only = settingFactory("bk_visible_only", true, STORAGE_SETTINGS, null as TSK);
export const back_link_goto_bottom_btn = settingFactory("back_link_goto_bottom_btn", false, STORAGE_SETTINGS, null as TSK);
export const back_link_concept_fold = settingFactory("back_link_concept_fold", true, STORAGE_SETTINGS, null as TSK);
export const back_link_copy = settingFactory("back_link_copy", false, STORAGE_SETTINGS, null as TSK);
export const back_link_move_to_dailynote = settingFactory("back_link_move_to_dailynote", true, STORAGE_SETTINGS, null as TSK);
export const back_link_remove_refs = settingFactory("back_link_remove_refs", true, STORAGE_SETTINGS, null as TSK);
export const back_link_embed = settingFactory("back_link_embed", false, STORAGE_SETTINGS, null as TSK);
export const back_link_ref = settingFactory("back_link_ref", false, STORAGE_SETTINGS, null as TSK);
export const back_link_move_here = settingFactory("back_link_move_here", true, STORAGE_SETTINGS, null as TSK);
export const back_link_move_with_backlink = settingFactory("back_link_move_with_backlink", false, STORAGE_SETTINGS, null as TSK);
export const back_link_protyle_height = settingFactory("back_link_protyle_height", "200", STORAGE_SETTINGS, null as TSK);
export const back_link_show_path = settingFactory("back_link_show_path", false, STORAGE_SETTINGS, null as TSK);
// □4 面板宽度模式：false=全宽（历史现状），true=跟随编辑器内容盒宽
export const back_link_follow_width = settingFactory("back_link_follow_width", false, STORAGE_SETTINGS, null as TSK);
export const back_link_passup_heading = settingFactory("back_link_passup_heading", false, STORAGE_SETTINGS, null as TSK);
export const back_link_passup_quote = settingFactory("back_link_passup_quote", true, STORAGE_SETTINGS, null as TSK);
export const back_link_passup_super = settingFactory("back_link_passup_super", true, STORAGE_SETTINGS, null as TSK);
export const imgBoxCheckbox = settingFactory("imgBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const imgBoxShowMenu = settingFactory("imgBoxShowMenu", true, STORAGE_SETTINGS, null as TSK);
export const dbBkBoxCheckbox = settingFactory("dbBkBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const dbBkBoxRefreshMenu = settingFactory("dbBkBoxRefreshMenu", true, STORAGE_SETTINGS, null as TSK);
// 数据库菜单工具组（featgate □2 死角补口）：管数据库反链右键的 5 项配套操作（移到下边/
// 清空筛选/按标签过滤/排除标签/聚合勾选）——分组 1 键（逐项太碎，bear 荐分组）；默认开=
// 现状恒显示零迁移。菜单构建时动态读（右键即生效，非结构键）
export const dbBkBoxMenuTools = settingFactory("dbBkBoxMenuTools", true, STORAGE_SETTINGS, null as TSK);
export const dbBkBoxMaxBacklinkSize = settingFactory("dbBkBoxMaxBacklinkSize", 200, STORAGE_SETTINGS, null as TSK);
export const dbBkBoxHideDatetime = settingFactory("dbBkBoxHideDatetime", false, STORAGE_SETTINGS, null as TSK);
export const mixBoxCheckbox = settingFactory("mixBoxCheckbox", true, STORAGE_SETTINGS, null as TSK);
export const mixBoxPinyin = settingFactory("mixBoxPinyin", false, STORAGE_SETTINGS, null as TSK);
export const storeMergeDoc = settingFactory("storeMergeDoc", false, STORAGE_SETTINGS, null as TSK);
export const storeMoveDocContentHere = settingFactory("storeMoveDocContentHere", false, STORAGE_SETTINGS, null as TSK);
export const storeRefreshStaticBkLnk = settingFactory("storeRefreshStaticBkLnk", false, STORAGE_SETTINGS, null as TSK);
export const storeInsertXml = settingFactory("storeInsertXml", false, STORAGE_SETTINGS, null as TSK);
export const storeFillMemoMenu = settingFactory("storeFillMemoMenu", false, STORAGE_SETTINGS, null as TSK);
export const storeOpenRefsMenu = settingFactory("storeOpenRefsMenu", false, STORAGE_SETTINGS, null as TSK);
export const storeOpenRefsClick = settingFactory("storeOpenRefsClick", false, STORAGE_SETTINGS, null as TSK);
export const storeCopyStdMD = settingFactory("storeCopyStdMD", false, STORAGE_SETTINGS, null as TSK);
export const tag2RefBoxCheckbox = settingFactory("tag2RefBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const tag2RefSearchRef = settingFactory("tag2RefSearchRef", true, STORAGE_SETTINGS, null as TSK);
export const tag2RefSearchLnk = settingFactory("tag2RefSearchLnk", true, STORAGE_SETTINGS, null as TSK);
export const spaceRefEnabled = settingFactory("spaceRefEnabled", false, STORAGE_SETTINGS, null as TSK);
export const spaceRefLinkType = settingFactory("spaceRefLinkType", "ref", STORAGE_SETTINGS, null as TSK);
export const tag_to_ref_add_card = settingFactory("tag-to-ref-add-card", false, STORAGE_SETTINGS, null as TSK);
export const tag_to_ref_add_pinyin = settingFactory("tag-to-ref-add-pinyin", false, STORAGE_SETTINGS, null as TSK);
export const noteBoxCheckbox = settingFactory("noteBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
// 移动端顶栏「同步数据」钮（featgate □2 死角补口）：NoteBox onload 注册读死——改须插件
// 重载（STRUCTURAL_KEYS 已登记）；默认开=现状零迁移。与 noteBoxCheckbox 两层叠加
// （总开关关=整个 NoteBox 不挂，此键只在总开时有意义）
export const noteBoxMobileSync = settingFactory("noteBoxMobileSync", true, STORAGE_SETTINGS, null as TSK);
export const noteBoxAllKinds = settingFactory("noteBoxAllKinds", `📌,💡, 🏞️, 💪, 💬, 🍴, 📚, 💼, 锻炼,看书,学习,干活`, STORAGE_SETTINGS, null as TSK);
export const avoiding_cloud_synchronization_conflicts = settingFactory("avoiding-cloud-synchronization-conflicts", false, STORAGE_SETTINGS, null as TSK);
export const flash_thoughts_2_top = settingFactory("flash-thoughts-2-top", false, STORAGE_SETTINGS, null as TSK);
export const cssFlashThoughts = settingFactory("cssFlashThoughts", false, STORAGE_SETTINGS, null as TSK);
export const cssSuperBlockBorder = settingFactory("cssSuperBlockBorder", false, STORAGE_SETTINGS, null as TSK);
export const flashThoughtUseDialog = settingFactory("flashThoughtUseDialog", false, STORAGE_SETTINGS, null as TSK);
// 日记落点的文件级覆盖（□1 语义坐实）：空=每天按内核路径模板创建新日记（内核 v3.4.2+ 自动写
// custom-dailynote-YYYYMMDD 协议属性）；非空=固定文件按文档名直查（不走 createDailyNote，故不带
// 协议属性——固定文件承载多天内容，写属性会污染「一文档一天」的导航/日历语义）
export const flash_thoughts_target_file = settingFactory("flash-thoughts-target-file", "", STORAGE_SETTINGS, null as TSK);
// □2 官方闪念速记吸收（2026-09-06）：sync_end 自动把官方速记中转文档新块搬进日记管线
// （libs/shorthandRelay.ts；仅支持官方 ShorthandSavePath 日期模板模式）；默认关=新功能不惊喜
export const shorthandRelayEnabled = settingFactory("shorthandRelayEnabled", false, STORAGE_SETTINGS, null as TSK);
// □4 全局小窗失焦自动关（2026-09-06，小记 quick-notes 可移植增强）：子窗失焦即落盘草稿并关窗；
// pin 住 / 选图对话框在途 / 上传在途时不关。默认开=对标杆品速记手感（草稿持久化不丢内容）
export const flashThoughtsBlurClose = settingFactory("flashThoughtsBlurClose", true, STORAGE_SETTINGS, null as TSK);
// 速记器总开关（quicknote □2 2026-09-07）：关闭=命令不注册/热键不响应（onload 门控，与拍照闪念
// 同款冷生效——改开关需重载插件）；默认开=战役主功能，用户装完即可用 ⌥J 唤起
export const quickNoteCheckbox = settingFactory("quickNoteCheckbox", true, STORAGE_SETTINGS, null as TSK);
// □4 窗口统一化（2026-09-07）：⌥J 触发形态——external=自建外部轻窗（默认，不抢屏秒开）；
// focus=带出思源主窗前台+打开拍照闪念面板（图片粘贴等全能力，适合本来就要回思源的场景）
export const quickNoteOpenMode = settingFactory("quickNoteOpenMode", "external", STORAGE_SETTINGS, null as TSK);
// qn-actions □2 小窗三可调记忆（2026-09-07）：位置/尺寸/透明度——moved/resized debounce 落盘、
// opacity 即时落盘；下次唤起原地原样弹出，出屏（拔显示器）qnFitRect 回落默认定位且不清记忆
export const quickNoteRect = settingFactory<{ x: number; y: number; width: number; height: number; opacity?: number } | null>(
    "quickNoteRect", null, STORAGE_SETTINGS, null as TSK);
// □5 日记回顾面板（2026-09-06；notebox 战役翻新=日记导航器，转正目标粘滞随转正退役）
// ：顶栏钮开关（默认开）
export const dailyNoteReviewTopbar = settingFactory("dailyNoteReviewTopbar", true, STORAGE_SETTINGS, null as TSK);
export const listBoxCheckbox = settingFactory("listBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const dont_break_list = settingFactory("dont-break-list", false, STORAGE_SETTINGS, null as TSK);
export const aiBoxCheckbox = settingFactory("aiBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
// ai-agent □5 AI 助手面板（右侧 dock）：默认关对齐 Box 族惯例；桌面 only（移动端不注册）
export const aiPanelCheckbox = settingFactory("aiPanelCheckbox", false, STORAGE_SETTINGS, null as TSK);
// agentrev □2 可配置三件（bear ②）：轮数上限（消费端钳 1~30）+人审两开关（默认全开，关=该类动作免确认直接执行）
// agentqa □1：默认 4→20（bear 撞熔断「没执行完」）；settingFactory 语义=用户显式设置过的值不覆盖
export const agentMaxTurns = settingFactory("agentMaxTurns", 20, STORAGE_SETTINGS, null as TSK);
export const agentReviewEdit = settingFactory("agentReviewEdit", true, STORAGE_SETTINGS, null as TSK);
export const agentReviewRunJs = settingFactory("agentReviewRunJs", true, STORAGE_SETTINGS, null as TSK);
// agentrev □4 三件套前两样（bear ③④，□1 拍板：领域知识=直接披露全文常驻/Skill=渐进披露只注简介）：
// 存思源文档 id 数组；标题运行时反查（改名不断链），消费端=AgentPanel system 注入+skills 工具
export const agentKnowledgeDocs = settingFactory("agentKnowledgeDocs", [] as string[], STORAGE_SETTINGS, null as TSK);
export const agentSkillDocs = settingFactory("agentSkillDocs", [] as string[], STORAGE_SETTINGS, null as TSK);
// agentqa □4（bear 拍板 B 可配）：上下文治理两参数——历史滑窗（含当问总条数，消费端钳 2~40）
// +文档快照长度（字符，消费端钳 2000~50000）；默认值=旧代码常量，老用户零感知
export const agentHistoryMsgs = settingFactory("agentHistoryMsgs", HISTORY_MSGS_DEFAULT, STORAGE_SETTINGS, null as TSK);
export const agentDocSnapshotLimit = settingFactory("agentDocSnapshotLimit", DOC_SNAPSHOT_DEFAULT, STORAGE_SETTINGS, null as TSK);
export const prefixArticlesEnable = settingFactory("prefixArticlesEnable", false, STORAGE_SETTINGS, null as TSK);
export const prefixArticlesSoftLimit = settingFactory("prefixArticlesSoftLimit", "50", STORAGE_SETTINGS, null as TSK);
export const prefixArticlesMenu = settingFactory("prefixArticlesMenu", true, STORAGE_SETTINGS, null as TSK);
export const prefixArticlesTagsShow = settingFactory("prefixArticlesTagsShow", false, STORAGE_SETTINGS, null as TSK);
export const markdownExportBoxCheckbox = settingFactory("markdownExportBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const floatingballEnable = settingFactory("floatingballEnable", false, STORAGE_SETTINGS, null as TSK);
export const floatingballDocList = settingFactory("floatingballDocList", [] as FloatingDocItem[], STORAGE_SETTINGS, null as TSK);
export const floatingballDocMenu = settingFactory("floatingballDocMenu", true, STORAGE_SETTINGS, null as TSK);
export const floatingballDocTabMenu = settingFactory("floatingballDocTabMenu", true, STORAGE_SETTINGS, null as TSK);
export const floatingballKeyboardList = settingFactory("floatingballKeyboardList", [] as FloatingKeyboardItem[], STORAGE_SETTINGS, null as TSK);
// 悬浮球翻新期1：统一球列表（旧 doc/keyboard 两列表启动时迁移进来后清空，见 FloatingBall.ts）
export const floatingballBallList = settingFactory("floatingballBallList", [] as BallItem[], STORAGE_SETTINGS, null as TSK);
export const markdownExportPics = settingFactory("markdownExportPics", false, STORAGE_SETTINGS, null as TSK);
export const mindWireCheckbox = settingFactory("mindWireCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const mindWireEnable = settingFactory("mindWireEnable", true, STORAGE_SETTINGS, null as TSK);
export const mindWireGlobalMenu = settingFactory("mindWireGlobalMenu", true, STORAGE_SETTINGS, null as TSK);
export const mindWireDocMenu = settingFactory("mindWireDocMenu", true, STORAGE_SETTINGS, null as TSK);
export const mindWireDynamicLine = settingFactory("mindWireDynamicLine", false, STORAGE_SETTINGS, null as TSK);
export const mindWireWidth = settingFactory("mindWireWidth", 2, STORAGE_SETTINGS, null as TSK);
export const mindWireLine = settingFactory("mindWireLine", false, STORAGE_SETTINGS, null as TSK);
export const mindWireColorfull = settingFactory("mindWireColorfull", false, STORAGE_SETTINGS, null as TSK);
export const mindWireStarRefOnly = settingFactory("mindWireStarRefOnly", true, STORAGE_SETTINGS, null as TSK);
// □2 词级导线（划词连线）总开关（spec §4.8 行 5；设置 UI 行随 □5 ConfMindWire 落地）
export const mindWireWordWire = settingFactory("mindWireWordWire", true, STORAGE_SETTINGS, null as TSK);
export const aiBoxMenuShow = settingFactory("aiBoxMenuShow", true, STORAGE_SETTINGS, null as TSK);
export const aiBoxPrompts = settingFactory("aiBoxPrompts", [], STORAGE_SETTINGS, null as TSK);
export const cozeSearchSpaceID = settingFactory("cozeSearchSpaceID", "", STORAGE_SETTINGS, null as TSK);
export const cozeSearchKnowledgeID = settingFactory("cozeSearchKnowledgeID", "", STORAGE_SETTINGS, null as TSK);
export const cozeSearchOauthTokenID = settingFactory("cozeSearchOauthTokenID", "", STORAGE_SETTINGS, null as TSK);
export const cozeSearchAppID = settingFactory("cozeSearchAppID", "", STORAGE_SETTINGS, null as TSK);
export const fastNoteBoxCheckbox = settingFactory("fastNoteBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const fastNoteBoxDisableBK = settingFactory("fastNoteBoxDisableBK", true, STORAGE_SETTINGS, null as TSK);
export const fastNoteBoxAdd2Flashcard = settingFactory("fastNoteBoxAdd2Flashcard", false, STORAGE_SETTINGS, null as TSK);
export const fastNoteBoxDelAfterCreating = settingFactory("fastNoteBoxDelAfterCreating", false, STORAGE_SETTINGS, null as TSK);
export const fastNoteBoxDocPrefix = settingFactory("fastNoteBoxDocPrefix", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxCheckbox = settingFactory("commentBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const commentBoxMenu = settingFactory("commentBoxMenu", true, STORAGE_SETTINGS, null as TSK);
// 划词工具条批注入口（□4 2026-09-03）：官方划词菜单直加批注钮；默认开，gates 还叠批注总开关
export const commentBoxAnnoToolbar = settingFactory("commentBoxAnnoToolbar", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxMaxProtyleHeight = settingFactory("commentBoxMaxProtyleHeight", 300, STORAGE_SETTINGS, null as TSK);
export const commentBoxAnnoUnderlineThickness = settingFactory("commentBoxAnnoUnderlineThickness", 2, STORAGE_SETTINGS, null as TSK);
// □1 标记形态主档：underline 下划线式（现状）/ marker 马克笔式 / frame 花边框（文字流蝴蝶），
// spec §11（docs/tomato-anno-visual-spec.md）
export const commentBoxAnnoMarkStyle = settingFactory("commentBoxAnnoMarkStyle", "underline", STORAGE_SETTINGS, null as TSK);
// □1 线型（下划线式子维度）：五谱 solid/dashed/dotted/wavy/double + 装饰串 dot-bead/ring-bead
// （后两档走 background 渐变通道替代下划线，spec §11.1.1）
export const commentBoxAnnoLineType = settingFactory("commentBoxAnnoLineType", "dashed", STORAGE_SETTINGS, null as TSK);
// □1 背景微底色开关（下划线式子维度；marker/frame 形态下不生效不显示）
export const commentBoxAnnoBg = settingFactory("commentBoxAnnoBg", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxForwardRef = settingFactory("commentBoxForwardRef", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxBackwardRef = settingFactory("commentBoxBackwardRef", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxVirtualRef = settingFactory("commentBoxVirtualRef", true, STORAGE_SETTINGS, null as TSK);
// □7 面板批注分区开关；□5（2026-09-01）默认值改开——用户推翻 □7「默认关」旧拍板
// （存量已持久化过该键的环境不受影响，settingFactory.load 存储值优先）
export const commentBoxAnnotations = settingFactory("commentBoxAnnotations", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxAddFlashCard = settingFactory("commentBoxAddFlashCard", false, STORAGE_SETTINGS, null as TSK);
// □5 旧批注链设置退役（2026-08-31）：commentBoxAddTime/AddKeepText/AddUnderline/SaveUnderDoc、
// dailyNoteCopyComment 随产物链删除；存量值留在 tomato-settings.json 不迁移不清理
export const commentBoxShowID = settingFactory("commentBoxShowID", false, STORAGE_SETTINGS, null as TSK);
export const commentBoxStaticOutlink = settingFactory("commentBoxStaticOutlink", false, STORAGE_SETTINGS, null as TSK);
// □2 面板皮肤四档：classic 经典（v1 现状，默认零回归）/ candy 糖霜 / paper 纸墨 / airy 疏朗，
// spec §10（docs/tomato-commentbox-visual-spec.md）——面板根 data-skin 分档，多皮肤 CSS 共存
export const commentBoxPanelSkin = settingFactory("commentBoxPanelSkin", "classic", STORAGE_SETTINGS, null as TSK);
// 批注弹窗编辑器形态（2026-09-01）：rich=内嵌 Protyle（默认，现状语义）；plain=纯文本 textarea
// 秒开（跳过草稿块+SQL 索引等待+protyle 挂载整条链）。弹窗内切换钮切换即 write=记住选择。
export const commentBoxAnnoEditorMode = settingFactory("commentBoxAnnoEditorMode", "rich", STORAGE_SETTINGS, null as TSK);
// 批注编辑器字号（px，两模式统一；2026-09-01 用户反馈字体小→可调+记忆）。默认 16=思源正文档，
// 比 Dialog 基准 14 大一档；范围 12~22 由 AnnoEdit 内 clamp。
export const commentBoxAnnoEditorFontSize = settingFactory("commentBoxAnnoEditorFontSize", 16, STORAGE_SETTINGS, null as TSK);

// ---------------

export const digestGlobalSigle = settingFactory("digestGlobalSigle", "0", STORAGE_Prog_SETTINGS, null as TSK);
// □11 退役（2026-08-30，旧持久化值留着无害）：digest2Trace（trace 文档机制退役→路线图浮层）、
// doubleClick2DigestMobile/Desktop + add2piecesBtn2lockIcon + add2digBtn2lockIcon
// （双击摘抄浮钮与锁图标旁两钮退役——摘抄入口统一收进浮条/⌥Z/⇧⌥Z）。
export const digestAddReadingpoint = settingFactory("digestAddReadingpoint", false, STORAGE_Prog_SETTINGS, null as TSK);
/** 期1 □2 退役（2026-09-03）：并入 digestLanding 三档枚举（true→"daily" 迁移见 progressive index.ts loadStore）；
 *  store 留作迁移读源，勿新增使用，旧持久化值留着无害 */
export const digest2dailycard = settingFactory("digest2dailycard", false, STORAGE_Prog_SETTINGS, null as TSK);
// 期1 □2 摘抄落点三档（2026-09-03 群反馈设计定稿）：central=集中归档（书→摘抄总夹/digest-书名，
// 非书→札记匣，默认）/ source=源文档下方（老版行为回归）/ daily=原 digest2dailycard 语义
export const digestLanding = settingFactory("digestLanding", "central", STORAGE_Prog_SETTINGS, null as TSK);
// □3 制卡统一归置（2026-09-01 拍板方案 A）：默认制卡（⌥E/浮条制卡钮）并入当日 daily card
// 文档；存量用户无此 key 读默认 true 即集中（发版 notes 说明），关掉回落 cards 夹旧路线
// （cardUnderPiece 分叉保持原语义）。三档化（2026-09-07）后退役为迁移源（同 digest2dailycard）
export const card2dailycard = settingFactory("card2dailycard", true, STORAGE_Prog_SETTINGS, null as TSK);
// 制卡落点三档（2026-09-07 bear 拍板，与「摘抄落点」对称）：dailycard=当日 daily card 文档
// （原 card2dailycard=true 语义，默认）/ dailynote=当天日记文档尾插 / cards=原 false 回落
// （书下 cards 或源下 cards，cardUnderPiece 分叉保持原语义）；迁移见渐进 index.ts loadStore
export const cardLanding = settingFactory("cardLanding", "dailycard", STORAGE_Prog_SETTINGS, null as TSK);
// v5 火苗档位：每日目标片数（"1"/"3"/"5"，默认 3）——滚筒欠债=Σ max(0, 当日q−当日已读)
export const dailyQuota = settingFactory("dailyQuota", "3", STORAGE_Prog_SETTINGS, null as TSK);
// □3 右键退役默认关（2026-09-01 用户拍板：浮条已覆盖同款能力，右键默认清爽；设置项
// 保留可开回，旧持久化值留着无害——存过 true 的存量用户不受影响）。涉及三开关：
// digestmenu/piecesmenu/ProgressiveJumpMenu；重访调度族无开关恒显示，不在退役面。
export const digestmenu = settingFactory("digestmenu", false, STORAGE_Prog_SETTINGS, null as TSK);
export const piecesmenu = settingFactory("piecesmenu", false, STORAGE_Prog_SETTINGS, null as TSK);
// □7 块图标菜单独立开关（2026-09-01）：□3 三开关原一拖二连带块图标菜单（点块前小圆点
// 弹的菜单）默认关，超出「右键清爽」拍板字面口径；拆独立门默认开（意图型入口不构成
// 右键不清爽），管块图标菜单的渐进两项：跳到分片或回到原文 / 渐进阅读摘抄模式。
export const blockIconMenu = settingFactory("blockIconMenu", true, STORAGE_Prog_SETTINGS, null as TSK);
// 可见性期4 □4 B②：右键菜单四项各自开关（默认全开=拍板 A 不 breaking）。digestmenu
// 存量键默认 false 不动（旧语义兼容）；替代通道——整篇摘抄=快捷键+命令面板，
// 重访调度/复访节奏=浮条 ✧ + 期3 复习计划面板。
export const wholeDigestMenu = settingFactory("wholeDigestMenu", true, STORAGE_Prog_SETTINGS, null as TSK);
// □3 右键制卡开关（2026-09-07 bear 拍板）：默认关——右键菜单加「制卡」项（任意文档可用；
// 快捷键/命令面板本就全局，此开关只管右键入口）
export const cardContextMenu = settingFactory("cardContextMenu", false, STORAGE_Prog_SETTINGS, null as TSK);
export const reviewSchedMenu = settingFactory("reviewSchedMenu", true, STORAGE_Prog_SETTINGS, null as TSK);
export const revisitRhythmMenu = settingFactory("revisitRhythmMenu", true, STORAGE_Prog_SETTINGS, null as TSK);
// v5 □7 设置砍半：words2dailycard/finishPieceCreateAt/PieceSummaryBoxmenu/merg2newBookEnable/
// getAllPieceNotesEnable/multilineMarkEnable/send2* 六件/makeCard* 两件/summary2dailynote/
// PieceMoving*/ProgressiveViewAllMenu 共 18 个显隐与计划流 store 退役（旧持久化值留着无害）。
// 制卡/收集/提取族入口收进浮条 [+] 高级功能菜单 + 命令面板（winHotkey 门禁只查 VIP）
export const windowOpenStyle = settingFactory("windowOpenStyle", "1", STORAGE_Prog_SETTINGS, null as TSK);
export const flashcardNotebook = settingFactory("flashcardNotebook", "", STORAGE_Prog_SETTINGS, null as TSK);
export const flashcardAddRefs = settingFactory("flashcardAddRefs", true, STORAGE_Prog_SETTINGS, null as TSK);
export const flashcardMultipleLnks = settingFactory("flashcardMultipleLnks", true, STORAGE_Prog_SETTINGS, null as TSK);
export const digestNoBacktraceLink = settingFactory("digestNoBacktraceLink", true, STORAGE_Prog_SETTINGS, null as TSK);
export const pieceNoBacktraceLink = settingFactory("pieceNoBacktraceLink", true, STORAGE_Prog_SETTINGS, null as TSK);
export const ProgressiveStart2learn = settingFactory("ProgressiveStart2learn", true, STORAGE_Prog_SETTINGS, null as TSK);
export const ProgressiveJumpMenu = settingFactory("ProgressiveJumpMenu", false, STORAGE_Prog_SETTINGS, null as TSK);
// □8期4 移动端选块三钮开关（2026-09-09 发版前 P1 拍板补）：默认开；关=Progressive.ts
// 事件回调不再挂（已挂钮随切文档/reload 退场，与 tomato「多行选择」同口径——勿 subscribe
// 主动摘钮：data-type 三插件共享，会误摘同装 tomato 挂的钮）
export const mobileSelectBtns = settingFactory("mobileSelectBtns", true, STORAGE_Prog_SETTINGS, null as TSK);
// □12 退役（2026-08-30，旧持久化值留着无害）：markOriginText（制卡/摘抄在原文写 + 链接、
// & 链接与 style 背景落盘）——摘抄标记零触碰统一，原文痕迹唯一机制=digestMarker span 渲染态。
// v5 □12 语义更新：markOriginTextBG 从「写 style 到 .sy」改为「CSS div:has(> .prog-digest-mark)
// 渲染态背景」的总开关（index.ts 订阅挂 body 类 prog-digest-bg-on，span 在则背景在）
export const markOriginTextBG = settingFactory("markOriginTextBG", false, STORAGE_Prog_SETTINGS, null as TSK);
// matfeed □3 入槽胶囊边框（bear 实测「不知道边界」）：sb[custom-prog-material] 细边框总开关
// （index.scss 经 body 类 prog-material-border-on 总闸，markOriginTextBG 同款）；默认开
export const materialCapsuleBorder = settingFactory("materialCapsuleBorder", true, STORAGE_Prog_SETTINGS, null as TSK);
// matfeed □4 写作书素材池位置档（bear「素材池子是不是应该在这本书底下放着」）：true=新建
// digest-书名 夹直接挂书下（槽+素材一棵树），false=摘抄总夹集中档。只决定**新建**落点与
// 管理界面的搬迁钮方向——已有夹按 IAL 原位认回（位置无关），改档不自动搬（显式搬走
// DigestAllDialog 搬迁钮）；阅读书摘抄落点仍由 digestLanding 三档管，两设置互不干涉
export const writingPoolUnderBook = settingFactory("writingPoolUnderBook", true, STORAGE_Prog_SETTINGS, null as TSK);
// 修订痕迹（revtrace □4）：块级「按编辑时间着色」回看视图总开关——纯视图零档案（revTrace.ts：
// 色层=f(块 updated 距今天数)+enrollment 基线，关掉即无痕）；默认关（□6 呈 bear 拍板，荐默认关），
// 命令 toggle 与设置面板同此状态（浮条系统开关 toggleFloatBarSystem 同款 .set() 不落盘，
// 面板 confirm 才写盘；实时清/挂=index.ts 订阅同 markOriginTextBG 挂 body 类同位）
// 范围三档化（revtrace-scope，2026-09-09 拍板）后退役为迁移读源（同 digest2dailycard）：
// store 留盘不动勿新增使用，旧持久化值留着无害
export const revTraceEnabled = settingFactory("revTraceEnabled", false, STORAGE_Prog_SETTINGS, null as TSK);
// 修订痕迹生效范围三档：off=关（清场）/ prog=仅渐进文档（isProgDoc 判定：注册书+渐进锚 IAL，
// 非渐进文档出场零 SQL 零 DOM）/ all=全部文档（旧开关开着的原行为）；默认 off；迁移见渐进
// index.ts loadStore（revTraceScope 无存量 && revTraceEnabled=true → "all"）+ revTraceScopeFromLegacy
export const revTraceScope = settingFactory("revTraceScope", "off", STORAGE_Prog_SETTINGS, null as TSK);
/** 旧布尔开关 → revTraceScope 三档迁移映射（refEffectFromLegacy 同款纯函数挂单测）：
 *  返回 null=不迁移（有存量/老开关本就关），progressive index.ts loadStore 消费 */
export function revTraceScopeFromLegacy(hasScope: boolean, enabled: boolean): "all" | null {
    return !hasScope && enabled ? "all" : null;
}
export const hideBtnsInFlashCard = settingFactory("hideBtnsInFlashCard", true, STORAGE_Prog_SETTINGS, null as TSK);
// □2 片尾收束卡总开关（默认开）：关=不再新建（fullfilContent/newDigestDoc 尾插跳过）+
// 不再补插存量（retrofit 跳过）+ 已建卡渲染为一行细静条（可整块手删，不自动清理）
export const pieceTailCard = settingFactory("pieceTailCard", true, STORAGE_Prog_SETTINGS, null as TSK);
export const openCardsOnOpenPiece = settingFactory("openCardsOnOpenPiece", false, STORAGE_Prog_SETTINGS, null as TSK);
// 阅读曲线接管（1530 期1，实验默认关）：分片卡 due=滚筒节奏投影进官方复习界面，
// 官方评分回流滚筒状态（双入口一账）。关=末次清场（readCurve.clearReadCurve）
export const readCurveTakeover = settingFactory("readCurveTakeover", false, STORAGE_Prog_SETTINGS, null as TSK);
// 巡查频率档（分钟）：0=关/30/60/360；事件触发（推片/翻卡/设置变更）不受此档影响
export const readCurveSweepMins = settingFactory("readCurveSweepMins", 30, STORAGE_Prog_SETTINGS, null as TSK);
// 阅读点接管类开关（1141 期3，默认开）：关=新阅读点卡块不再挂键接管（存量已接管走完曲线）
export const readCurveReadingPoint = settingFactory("readCurveReadingPoint", true, STORAGE_Prog_SETTINGS, null as TSK);
// 「我的文档卡」总开关（1141 期3，默认关）：开=自动收编全库无键有卡文档块（分摊 DIGEST_BUILD_CAP/轮）；
// 关闸不清卡（已收编走完曲线自然毕业）；单卡入口=右键「加入阅读卡」与此开关无关
export const readCurvePlainDocs = settingFactory("readCurvePlainDocs", false, STORAGE_Prog_SETTINGS, null as TSK);
// 分片类开关（1141 期5，默认开）：关=不再建新分片卡（存量分片卡走完每日重现自然毕业）
export const readCurvePiece = settingFactory("readCurvePiece", true, STORAGE_Prog_SETTINGS, null as TSK);
// 素材类开关（1141 期5，默认开）：关=素材不再首推建卡（存量曲线卡走完自然毕业）
export const readCurveMaterial = settingFactory("readCurveMaterial", true, STORAGE_Prog_SETTINGS, null as TSK);
// 摘抄类开关（1141 期5，默认开）：关=不再为无键摘抄建卡（存量走完自然毕业）
export const readCurveDigest = settingFactory("readCurveDigest", true, STORAGE_Prog_SETTINGS, null as TSK);
// 重现族节奏档位（1141 期5）：0=默认 ×2 递增曲线；N∈{1,3,7,14,30}=每 N 天永不毕业
// （只管建卡初始键与首排 due，存量卡不动）
export const readCurveCadMaterial = settingFactory("readCurveCadMaterial", 0, STORAGE_Prog_SETTINGS, null as TSK);
export const readCurveCadDigest = settingFactory("readCurveCadDigest", 0, STORAGE_Prog_SETTINGS, null as TSK);
export const readCurveCadReadingPoint = settingFactory("readCurveCadReadingPoint", 0, STORAGE_Prog_SETTINGS, null as TSK);
export const readCurveCadPlain = settingFactory("readCurveCadPlain", 0, STORAGE_Prog_SETTINGS, null as TSK);
// 写作每日目标档（□9：鸟咨询+bear 拍板方案 A）：1/2/3 片默认 1；达标才变绿督促动笔，
// 不封顶、无惩罚性欠债累加（与阅读侧 dailyQuota 的明确差异——写作无 warn/over 态）
export const writingQuota = settingFactory("writingQuota", 1, STORAGE_Prog_SETTINGS, null as TSK);
export const cardUnderPiece = settingFactory("cardUnderPiece", false, STORAGE_Prog_SETTINGS, null as TSK);
export const cardAppendTime = settingFactory("cardAppendTime", false, STORAGE_Prog_SETTINGS, null as TSK);
export const mobileTopBar = settingFactory("mobileTopBar", true, STORAGE_Prog_SETTINGS, null as TSK);
export const initProgFloatBtnsDisable = settingFactory("initProgFloatBtnsDisable", false, STORAGE_Prog_SETTINGS, null as TSK);
// 片态浮条首行勾选集（设置面板「浮条」区 checkbox 清单，□10 方案 B：勾=站首行大钮，
// 未勾=落平铺区小格）；默认 = v5 编排（□18 增 addBook——已落盘的旧六项存储不回填，
// 由 PIECE_MAIN_POOL 平铺区兜底可见，拖上首行即入清单）
export const floatbarMainBtns = settingFactory(
    "floatbarMainBtns", ["digest", "cards", "swap", "next", "prev", "origin", "addBook"], STORAGE_Prog_SETTINGS, null as TSK);
// 自由态浮条首行清单（群反馈 650189「自由态无法拖动排序」）：与片态各自独立 store——
// 两态可入首行的动作池不同，共用清单会互相投影污染顺序。默认 = free 固有编排两键
// （✂ 摘抄子排 + 📥 加书），低频四项（目录/关联摘抄/路线指引/不再推送）拖上首行即入清单
export const floatbarFreeMainBtns = settingFactory(
    "floatbarFreeMainBtns", ["digest", "addBook"], STORAGE_Prog_SETTINGS, null as TSK);
// 摘抄/书态浮条首行清单（650189 第二轮「片摘处的浮窗也无法拖动排序」v3.6.1，2026-09-10
// 四态机制补全）：独立 store 独立池（与 free 同款），默认 = 各态 common+SCENE 固有编排
// （老用户升级零迁移），平铺区低频项（digest 态 map；书态 目录/本书摘抄/忽略/路线指引）
// 拖上首行即入清单
export const floatbarDigestMainBtns = settingFactory(
    "floatbarDigestMainBtns", ["digest", "cards", "recite", "revisit", "prev", "next", "origin", "tree", "summary"], STORAGE_Prog_SETTINGS, null as TSK);
export const floatbarBookMainBtns = settingFactory(
    "floatbarBookMainBtns", ["digest", "cards", "swap", "continue", "toPiece", "summary", "addBook", "archive"], STORAGE_Prog_SETTINGS, null as TSK);
// □14b 平铺区折叠偏好：持久化（布局偏好非临时状态，重启不再收一次）；默认展开与
// □10 已发布行为兼容
export const floatbarFlatCollapsed = settingFactory(
    "floatbarFlatCollapsed", false, STORAGE_Prog_SETTINGS, null as TSK);
// □2 ✂ 摘抄子排开合持久记忆（2026-09-01 用户反馈推翻 2026-08-31「每次出场重新展开」拍板）：
// 收起/展开跨分片、跨会话记住用户选择；未存过值=开（与已发布的默认展开兼容）
export const digSubrankOpen = settingFactory(
    "digSubrankOpen", true, STORAGE_Prog_SETTINGS, null as TSK);
// 浮条展开偏好（2026-09-02，同族第三块持久记忆——子排/平铺折叠之后轮到浮条本体）：
// 用户最后一次显式意志（点球展开/点 ✕ 收球）跨文档、跨会话记住；三态 null=从未表达
// （出场维持各态出厂默认：片/free 展开、书/摘抄收球，老用户升级零迁移）。free 态
// 上岗即展开不看它（□11 拍板）；移动端 ✕=本会话隐藏、free ✕=下班，均不写它
export const floatbarExpandPref = settingFactory(
    "floatbarExpandPref", null, STORAGE_Prog_SETTINGS, null as TSK);

// ---------------
export const navSourceBlock = settingFactory("navSourceBlock", true, STORAGE_SETTINGS, null as TSK);

export function getNavSourceBlock(): ReturnType<typeof settingFactory> {
    const KEY = "navSourceBlock"
    const n = getGlobal(KEY) as any;
    if (n != null) return n;
    setGlobal(KEY, navSourceBlock)
    return navSourceBlock;
}
