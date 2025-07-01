import { writable, get } from "svelte/store";
import { Plugin } from "siyuan";
import { STORAGE_Prog_SETTINGS, STORAGE_SETTINGS } from "../constants";
import { siyuan } from "./utils";
import { zipNways } from "./functional";
import { events } from "./Events";
import { BaseTomatoPlugin } from "./BaseTomatoPlugin";

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

export const storeNoteBox_recentText = (() => {
    const store = writable([] as string[]);
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
            store.set(s["storeNoteBox_recentText"] ?? []);
            storeNoteBox_noteCount.set(get(store).length);
        },
        save: (e: string, max = 20) => {
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
            store.set(s["storeNoteBox_noteAreaText"] ?? "");
        },
        save: () => {
            if (plugin && settingCfg && get(store) != settingCfg["storeNoteBox_noteAreaText"]) {
                settingCfg["storeNoteBox_noteAreaText"] = get(store);
                plugin.saveData(STORAGE_SETTINGS, settingCfg);
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

export const storeNoteBox_selectedNotebook = notebookStoreFactory();
export const storeNoteBox_fastnote = notebookStoreFactory("storeNoteBox_fastnote");

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
            if (plugin.settingCfg[key] != null) {
                store.set(plugin.settingCfg[key] as T);
            } else {
                store.set(defaultValue);
                plugin.settingCfg[key] = defaultValue as never;
            }
        },
        set(value: T) {
            save(value);
        },
        write(value?: T) {
            if (value == null) {
                value = store.get();
            }
            if (value != null) {
                save(value);
                plugin.saveData(file, plugin.settingCfg);
            }
        }
    };
};

export const userToken = settingFactory("userToken", "", STORAGE_SETTINGS, null as TSK);
export const userID = settingFactory("userID", "", STORAGE_SETTINGS, null as TSK);
export const exportIntervalSec = settingFactory("exportIntervalSec", "5", STORAGE_SETTINGS, null as TSK);
export const exportIntervalSecOn = settingFactory("exportIntervalSecOn", true, STORAGE_SETTINGS, null as TSK);
export const exportCleanFiles = settingFactory("exportCleanFiles", "60", STORAGE_SETTINGS, null as TSK);
export const exportCleanFilesOn = settingFactory("exportCleanFilesOn", true, STORAGE_SETTINGS, null as TSK);
export const exportPath = settingFactory("exportPath", "", STORAGE_SETTINGS, null as TSK);
export const hideVIP = settingFactory("hideVIP", true, STORAGE_SETTINGS, null as TSK);
export const foldTypes = settingFactory("foldTypes", [], STORAGE_SETTINGS, null as TSK);
export const foldTypesSuperBlock = settingFactory("foldTypesSuperBlock", false, STORAGE_SETTINGS, null as TSK);
export const foldTypesBLOCKQUOTE = settingFactory("foldTypesBLOCKQUOTE", false, STORAGE_SETTINGS, null as TSK);
export const foldTypesNODE_LIST = settingFactory("foldTypesNODE_LIST", false, STORAGE_SETTINGS, null as TSK);
export const foldTypesNODE_TABLE = settingFactory("foldTypesNODE_TABLE", false, STORAGE_SETTINGS, null as TSK);
export const foldTypesNODE_HEADING = settingFactory("foldTypesNODE_HEADING", false, STORAGE_SETTINGS, null as TSK);
export const addSelectionBtnsMobile = settingFactory("addSelectionBtnsMobile", true, STORAGE_SETTINGS, null as TSK);
export const addSelectionBtnsDesktop = settingFactory("addSelectionBtnsDesktop", true, STORAGE_SETTINGS, null as TSK);
export const cssRefStyle = settingFactory("cssRefStyle", false, STORAGE_SETTINGS, null as TSK);
export const exportWhiteList = settingFactory("exportWhiteList", [], STORAGE_SETTINGS, null as TSK);
export const exportBlackList = settingFactory("exportBlackList", [], STORAGE_SETTINGS, null as TSK);
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
export const graphClick2Locate = settingFactory("graphClick2Locate", false, STORAGE_SETTINGS, null as TSK);
export const graphAddTopbarIcon = settingFactory("graphAddTopbarIcon", true, STORAGE_SETTINGS, null as TSK);
export const graph打开块关系图Menu = settingFactory("graphopengraphMenu", true, STORAGE_SETTINGS, null as TSK);
export const graph定位到图中的节点Menu = settingFactory("graphlocatetographMenu", true, STORAGE_SETTINGS, null as TSK);
export const tomatoClockCheckbox = settingFactory("tomatoClockCheckbox", true, STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_audio = settingFactory("tomato_clocks_audio", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", STORAGE_SETTINGS, null as TSK);
export const tomato_clocks = settingFactory("tomato-clocks", "5,10,15,20,25,45", STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_force_dialog = settingFactory("tomato_clocks_force_dialog", true, STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_force_notice = settingFactory("tomato-clocks-force-notice", "", STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_change_bg = settingFactory("tomato-clocks-change-bg", "", STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_change_bg_dark = settingFactory("tomato-clocks-change-bg-dark", "", STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_position_right = settingFactory("tomato_clocks_position_right", true, STORAGE_SETTINGS, null as TSK);
export const tomato_clocks_opacity = settingFactory("tomato_clocks_opacity", "0.16", STORAGE_SETTINGS, null as TSK);
export const toolbarBoxCheckbox = settingFactory("toolbarBoxCheckbox", true, STORAGE_SETTINGS, null as TSK);
export const toolbarEN2CHBtn = settingFactory("toolbarEN2CHBtn", false, STORAGE_SETTINGS, null as TSK);
export const toolbarTidy = settingFactory("toolbarTidy", false, STORAGE_SETTINGS, null as TSK);
export const toolbarspacerepeat = settingFactory("toolbarspacerepeat", true, STORAGE_SETTINGS, null as TSK);
export const toolbarrefreshVr = settingFactory("toolbarrefreshVr", true, STORAGE_SETTINGS, null as TSK);
export const toolbarlocatedoc = settingFactory("toolbarlocatedoc", true, STORAGE_SETTINGS, null as TSK);
export const readingPointBoxCheckbox = settingFactory("readingPointBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const readingPointWithEnv = settingFactory("readingPointWithEnv", false, STORAGE_SETTINGS, null as TSK);
export const readingTopBar = settingFactory("readingTopBar", true, STORAGE_SETTINGS, null as TSK);
export const readingShowAllFolders = settingFactory("readingShowAllFolders", false, STORAGE_SETTINGS, null as TSK);
export const readingAdd2Card = settingFactory("readingAdd2Card", true, STORAGE_SETTINGS, null as TSK);
export const readingAdd2DocName = settingFactory("readingAdd2DocName", "", STORAGE_SETTINGS, null as TSK);
export const readingSaveFile = settingFactory("readingSaveFile", "", STORAGE_SETTINGS, null as TSK);
export const readingDialog = settingFactory("readingDialog", true, STORAGE_SETTINGS, null as TSK);
export const readingAddRPmenu = settingFactory("readingAddRPmenu", true, STORAGE_SETTINGS, null as TSK);
export const readingAddJumpMenu = settingFactory("readingAddJumpMenu", true, STORAGE_SETTINGS, null as TSK);
export const readingAddDeleteMenu = settingFactory("readingAddDeleteMenu", true, STORAGE_SETTINGS, null as TSK);
export const cardBoxCheckbox = settingFactory("cardBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const cardBoxSuperCard = settingFactory("cardBoxSuperCard", false, STORAGE_SETTINGS, null as TSK);
export const cardBoxAddConcepts = settingFactory("cardBoxAddConcepts", false, STORAGE_SETTINGS, null as TSK);
export const cardBoxSpradEvenlyPostpone = settingFactory("cardBoxSpradEvenlyPostpone", true, STORAGE_SETTINGS, null as TSK);
export const cardPriorityBoxCheckbox = settingFactory("cardPriorityBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const cardPrioritySetPriInterval = settingFactory("cardPrioritySetPriInterval", "0", STORAGE_SETTINGS, null as TSK);
export const cardPriorityBoxPostponeCardMenu = settingFactory("cardPriorityBoxPostponeCardMenu", true, STORAGE_SETTINGS, null as TSK);
export const cardPriorityBoxSpradDelayMenu = settingFactory("cardPriorityBoxSpradDelayMenu", true, STORAGE_SETTINGS, null as TSK);
export const cardPriorityBoxPriorityMenu = settingFactory("cardPriorityBoxPriorityMenu", true, STORAGE_SETTINGS, null as TSK);
export const cardPriorityBoxAutoHide = settingFactory("cardPriorityBoxAutoHide", false, STORAGE_SETTINGS, null as TSK);
export const auto_card_priority = settingFactory("auto-card-priority", false, STORAGE_SETTINGS, null as TSK);
export const card_priority_slider_hide = settingFactory("card_priority_slider_hide", false, STORAGE_SETTINGS, null as TSK);
export const card_priority_stopBtn_hide = settingFactory("card_priority_stopBtn_hide", false, STORAGE_SETTINGS, null as TSK);
export const cpBoxCheckbox = settingFactory("cpBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxCheckbox = settingFactory("linkBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxBilinkMenu = settingFactory("linkBoxBilinkMenu", true, STORAGE_SETTINGS, null as TSK);
export const linkBoxAttrIconOnHide = settingFactory("linkBoxAttrIconOnHide", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxSyncBlock = settingFactory("linkBoxSyncBlock", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxSyncHref = settingFactory("linkBoxSyncHref", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxSyncRef = settingFactory("linkBoxSyncRef", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxSyncBlockAuto = settingFactory("linkBoxSyncBlockAuto", true, STORAGE_SETTINGS, null as TSK);
export const linkBoxLnkTitle = settingFactory("linkBoxLnkTitle", false, STORAGE_SETTINGS, null as TSK);
export const linkBoxUseLnkOrRef = settingFactory("linkBoxUseLnkOrRef", false, STORAGE_SETTINGS, null as TSK);
export const dailyNoteBoxCheckbox = settingFactory("dailyNoteBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const dailyNoteGoToBottom = settingFactory("dailyNoteGoToBottom", false, STORAGE_SETTINGS, null as TSK);
export const dailyNoteGoToBottomMenu = settingFactory("dailyNoteGoToBottomMenu", true, STORAGE_SETTINGS, null as TSK);
export const dailyNotetopbarleft = settingFactory("dailyNotetopbarleft", true, STORAGE_SETTINGS, null as TSK);
export const dailyNotetopbarright = settingFactory("dailyNotetopbarright", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteMoveToBottom = settingFactory("dailyNoteMoveToBottom", false, STORAGE_SETTINGS, null as TSK);
export const dailyNoteMoveLeaveLnk = settingFactory("dailyNoteMoveLeaveLnk", false, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopySimple = settingFactory("dailyNoteCopySimple", false, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyMenu = settingFactory("dailyNoteCopyMenu", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyAnchorText = settingFactory("dailyNoteCopyAnchorText", "  *  ", STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyUseRef = settingFactory("dailyNoteCopyUseRef", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyUpdateBG = settingFactory("dailyNoteCopyUpdateBG", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyInsertPR = settingFactory("dailyNoteCopyInsertPR", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyShowPath = settingFactory("dailyNoteCopyShowPath", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyComment = settingFactory("dailyNoteCopyComment", true, STORAGE_SETTINGS, null as TSK);
export const dailyNoteCopyFlashCard = settingFactory("dailyNoteCopyFlashCard", false, STORAGE_SETTINGS, null as TSK);
export const imgOverlayCheckbox = settingFactory("imgOverlayCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const backLinkBottomBoxCheckbox = settingFactory("backLinkBottomBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const bk启用禁用文档的底部反链menu = settingFactory("bkenableAndDisablemenu", true, STORAGE_SETTINGS, null as TSK);
export const back_link_max_size = settingFactory("back-link-max-size", 10, STORAGE_SETTINGS, null as TSK);
export const back_link_mention_count = settingFactory("back-link-mention-count", 2, STORAGE_SETTINGS, null as TSK);
export const back_link_default_off = settingFactory("back-link-default-off", false, STORAGE_SETTINGS, null as TSK);
export const back_link_dailynote_off = settingFactory("back-link-dailynote-off", false, STORAGE_SETTINGS, null as TSK);
export const back_link_refresh_off = settingFactory("back_link_refresh_off", true, STORAGE_SETTINGS, null as TSK);
export const back_link_more_btns = settingFactory("back_link_more_btns", true, STORAGE_SETTINGS, null as TSK);
export const back_link_goto_bottom_btn = settingFactory("back_link_goto_bottom_btn", false, STORAGE_SETTINGS, null as TSK);
export const back_link_concept_fold = settingFactory("back_link_concept_fold", true, STORAGE_SETTINGS, null as TSK);
export const back_link_copy = settingFactory("back_link_copy", false, STORAGE_SETTINGS, null as TSK);
export const back_link_move_to_dailynote = settingFactory("back_link_move_to_dailynote", true, STORAGE_SETTINGS, null as TSK);
export const back_link_remove_refs = settingFactory("back_link_remove_refs", true, STORAGE_SETTINGS, null as TSK);
export const back_link_embed = settingFactory("back_link_embed", false, STORAGE_SETTINGS, null as TSK);
export const back_link_ref = settingFactory("back_link_ref", false, STORAGE_SETTINGS, null as TSK);
export const back_link_move_here = settingFactory("back_link_move_here", true, STORAGE_SETTINGS, null as TSK);
export const back_link_move_with_backlink = settingFactory("back_link_move_with_backlink", false, STORAGE_SETTINGS, null as TSK);
export const back_link_show_floatUI = settingFactory("back_link_show_floatUI", true, STORAGE_SETTINGS, null as TSK);
export const back_link_protyle_height = settingFactory("back_link_protyle_height", "200", STORAGE_SETTINGS, null as TSK);
export const back_link_show_path = settingFactory("back_link_show_path", false, STORAGE_SETTINGS, null as TSK);
export const back_link_passup_heading = settingFactory("back_link_passup_heading", false, STORAGE_SETTINGS, null as TSK);
export const back_link_passup_quote = settingFactory("back_link_passup_quote", true, STORAGE_SETTINGS, null as TSK);
export const back_link_passup_super = settingFactory("back_link_passup_super", true, STORAGE_SETTINGS, null as TSK);
export const imgBoxCheckbox = settingFactory("imgBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const imgBoxShowMenu = settingFactory("imgBoxShowMenu", true, STORAGE_SETTINGS, null as TSK);
export const dbBkBoxCheckbox = settingFactory("dbBkBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const dbBkBoxRefreshMenu = settingFactory("dbBkBoxRefreshMenu", true, STORAGE_SETTINGS, null as TSK);
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
export const tag_to_ref_add_card = settingFactory("tag-to-ref-add-card", false, STORAGE_SETTINGS, null as TSK);
export const tag_to_ref_add_pinyin = settingFactory("tag-to-ref-add-pinyin", false, STORAGE_SETTINGS, null as TSK);
export const noteBoxCheckbox = settingFactory("noteBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const noteBoxAllKinds = settingFactory("noteBoxAllKinds", `📌,💡, 🏞️, 💪, 💬, 🍴, 📚, 💼, 锻炼,看书,学习,干活`, STORAGE_SETTINGS, null as TSK);
export const avoiding_cloud_synchronization_conflicts = settingFactory("avoiding-cloud-synchronization-conflicts", false, STORAGE_SETTINGS, null as TSK);
export const flash_thoughts_2_top = settingFactory("flash-thoughts-2-top", false, STORAGE_SETTINGS, null as TSK);
export const cssFlashThoughts = settingFactory("cssFlashThoughts", false, STORAGE_SETTINGS, null as TSK);
export const cssSuperBlockBorder = settingFactory("cssSuperBlockBorder", false, STORAGE_SETTINGS, null as TSK);
export const flashThoughtUseDialog = settingFactory("flashThoughtUseDialog", false, STORAGE_SETTINGS, null as TSK);
export const flash_thoughts_target_file = settingFactory("flash-thoughts-target-file", "", STORAGE_SETTINGS, null as TSK);
export const listBoxCheckbox = settingFactory("listBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const dont_break_list = settingFactory("dont-break-list", false, STORAGE_SETTINGS, null as TSK);
export const aiBoxCheckbox = settingFactory("aiBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const prefixArticlesEnable = settingFactory("prefixArticlesEnable", false, STORAGE_SETTINGS, null as TSK);
export const prefixArticlesSoftLimit = settingFactory("prefixArticlesSoftLimit", "50", STORAGE_SETTINGS, null as TSK);
export const prefixArticlesMenu = settingFactory("prefixArticlesMenu", true, STORAGE_SETTINGS, null as TSK);
export const markdownExportBoxCheckbox = settingFactory("markdownExportBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const floatingballEnable = settingFactory("floatingballEnable", false, STORAGE_SETTINGS, null as TSK);
export const floatingballDocList = settingFactory("floatingballDocList", [] as FloatingDocItem[], STORAGE_SETTINGS, null as TSK);
export const floatingballDocMenu = settingFactory("floatingballDocMenu", true, STORAGE_SETTINGS, null as TSK);
export const floatingballKeyboardList = settingFactory("floatingballKeyboardList", [] as FloatingKeyboardItem[], STORAGE_SETTINGS, null as TSK);
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
export const aiBoxMenuShow = settingFactory("aiBoxMenuShow", true, STORAGE_SETTINGS, null as TSK);
export const cozeSearchMenuShow = settingFactory("cozeSearchMenuShow", true, STORAGE_SETTINGS, null as TSK);
export const aiBoxPrompts = settingFactory("aiBoxPrompts", [], STORAGE_SETTINGS, null as TSK);
export const cozeSearchBoxCheckbox = settingFactory("cozeSearchBoxCheckbox", false, STORAGE_SETTINGS, null as TSK);
export const cozeSearchSpaceID = settingFactory("cozeSearchSpaceID", "", STORAGE_SETTINGS, null as TSK);
export const cozeSearchDoubaoID = settingFactory("cozeSearchDoubaoID", "", STORAGE_SETTINGS, null as TSK);
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
export const commentBoxMaxProtyleHeight = settingFactory("commentBoxMaxProtyleHeight", 300, STORAGE_SETTINGS, null as TSK);
export const commentBoxForwardRef = settingFactory("commentBoxForwardRef", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxBackwardRef = settingFactory("commentBoxBackwardRef", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxVirtualRef = settingFactory("commentBoxVirtualRef", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxAddFlashCard = settingFactory("commentBoxAddFlashCard", false, STORAGE_SETTINGS, null as TSK);
export const commentBoxAddTime = settingFactory("commentBoxAddTime", false, STORAGE_SETTINGS, null as TSK);
export const commentBoxAddKeepText = settingFactory("commentBoxAddKeepText", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxAddUnderline = settingFactory("commentBoxAddUnderline", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxSaveUnderDoc = settingFactory("commentBoxSaveUnderDoc", true, STORAGE_SETTINGS, null as TSK);
export const commentBoxShowID = settingFactory("commentBoxShowID", false, STORAGE_SETTINGS, null as TSK);
export const commentBoxStaticOutlink = settingFactory("commentBoxStaticOutlink", false, STORAGE_SETTINGS, null as TSK);

// ---------------

export const digestGlobalSigle = settingFactory("digestGlobalSigle", "0", STORAGE_Prog_SETTINGS, null as TSK);
export const digest2Trace = settingFactory("digest2Trace", false, STORAGE_Prog_SETTINGS, null as TSK);
export const digestAddReadingpoint = settingFactory("digestAddReadingpoint", false, STORAGE_Prog_SETTINGS, null as TSK);
export const digest2dailycard = settingFactory("digest2dailycard", false, STORAGE_Prog_SETTINGS, null as TSK);
export const words2dailycard = settingFactory("words2dailycard", false, STORAGE_Prog_SETTINGS, null as TSK);
export const doubleClick2DigestMobile = settingFactory("doubleClick2Digest", true, STORAGE_Prog_SETTINGS, null as TSK);
export const PieceSummaryBoxmenu = settingFactory("PieceSummaryBoxmenu", true, STORAGE_Prog_SETTINGS, null as TSK);
export const digestmenu = settingFactory("digestmenu", true, STORAGE_Prog_SETTINGS, null as TSK);
export const piecesmenu = settingFactory("piecesmenu", true, STORAGE_Prog_SETTINGS, null as TSK);
export const doubleClick2DigestDesktop = settingFactory("doubleClick2DigestDesktop", false, STORAGE_Prog_SETTINGS, null as TSK);
export const add2piecesBtn2lockIcon = settingFactory("add2piecesBtn2lockIcon", false, STORAGE_Prog_SETTINGS, null as TSK);
export const add2digBtn2lockIcon = settingFactory("add2digBtn2lockIcon", false, STORAGE_Prog_SETTINGS, null as TSK);
export const merg2newBookEnable = settingFactory("merg2newBookEnable", true, STORAGE_Prog_SETTINGS, null as TSK);
export const getAllPieceNotesEnable = settingFactory("getAllPieceNotesEnable", true, STORAGE_Prog_SETTINGS, null as TSK);
export const multilineMarkEnable = settingFactory("multilineMarkEnable", true, STORAGE_Prog_SETTINGS, null as TSK);
export const send2removeNoteColor = settingFactory("send2removeNoteColor", true, STORAGE_Prog_SETTINGS, null as TSK);
export const send2dailyCardNoRefEnable = settingFactory("send2dailyCardNoRefEnable", true, STORAGE_Prog_SETTINGS, null as TSK);
export const send2compareNoteEnable = settingFactory("send2compareNoteEnable", true, STORAGE_Prog_SETTINGS, null as TSK);
export const send2exctractNoteEnable = settingFactory("send2exctractNoteEnable", true, STORAGE_Prog_SETTINGS, null as TSK);
export const send2exctract2bottomEnable = settingFactory("send2exctract2bottomEnable", true, STORAGE_Prog_SETTINGS, null as TSK);
export const send2dailyCardEnable = settingFactory("send2dailyCardEnable", true, STORAGE_Prog_SETTINGS, null as TSK);
export const makeCardHereEnable = settingFactory("makeCardHereEnable", true, STORAGE_Prog_SETTINGS, null as TSK);
export const makeCardEnable = settingFactory("makeCardEnable", true, STORAGE_Prog_SETTINGS, null as TSK);
export const windowOpenStyle = settingFactory("windowOpenStyle", "1", STORAGE_Prog_SETTINGS, null as TSK);
export const flashcardNotebook = settingFactory("flashcardNotebook", "", STORAGE_Prog_SETTINGS, null as TSK);
export const flashcardAddRefs = settingFactory("flashcardAddRefs", true, STORAGE_Prog_SETTINGS, null as TSK);
export const flashcardMultipleLnks = settingFactory("flashcardMultipleLnks", true, STORAGE_Prog_SETTINGS, null as TSK);
export const flashcardUseLink = settingFactory("flashcardUseLink", true, STORAGE_Prog_SETTINGS, null as TSK);
export const digestNoBacktraceLink = settingFactory("digestNoBacktraceLink", true, STORAGE_Prog_SETTINGS, null as TSK);
export const pieceNoBacktraceLink = settingFactory("pieceNoBacktraceLink", true, STORAGE_Prog_SETTINGS, null as TSK);
export const summary2dailynote = settingFactory("summary2dailynote", false, STORAGE_Prog_SETTINGS, null as TSK);
export const PieceMovingUp = settingFactory("PieceMovingUp", true, STORAGE_Prog_SETTINGS, null as TSK);
export const ProgressiveStart2learn = settingFactory("ProgressiveStart2learn", true, STORAGE_Prog_SETTINGS, null as TSK);
export const ProgressiveViewAllMenu = settingFactory("ProgressiveViewAllMenu", true, STORAGE_Prog_SETTINGS, null as TSK);
export const ProgressiveJumpMenu = settingFactory("ProgressiveJumpMenu", true, STORAGE_Prog_SETTINGS, null as TSK);
export const PieceMovingDown = settingFactory("PieceMovingDown", true, STORAGE_Prog_SETTINGS, null as TSK);
export const markOriginText = settingFactory("markOriginText", false, STORAGE_Prog_SETTINGS, null as TSK);
export const markOriginTextBG = settingFactory("markOriginTextBG", false, STORAGE_Prog_SETTINGS, null as TSK);
export const hideBtnsInFlashCard = settingFactory("hideBtnsInFlashCard", false, STORAGE_Prog_SETTINGS, null as TSK);
export const openCardsOnOpenPiece = settingFactory("openCardsOnOpenPiece", false, STORAGE_Prog_SETTINGS, null as TSK);
export const cardUnderPiece = settingFactory("cardUnderPiece", false, STORAGE_Prog_SETTINGS, null as TSK);
export const cardAppendTime = settingFactory("cardAppendTime", false, STORAGE_Prog_SETTINGS, null as TSK);
export const btnViewContents = settingFactory("btnViewContents", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnPrevious = settingFactory("btnPrevious", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnNext = settingFactory("btnNext", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnCleanOriginText = settingFactory("btnCleanOriginText", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnFullfilContent = settingFactory("btnFullfilContent", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnStop = settingFactory("btnStop", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnNextBook = settingFactory("btnNextBook", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnOpenFlashcardTab = settingFactory("btnOpenFlashcardTab", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnDeleteBack = settingFactory("btnDeleteBack", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnDeleteNext = settingFactory("btnDeleteNext", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnSaveCard = settingFactory("btnSaveCard", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnDelCard = settingFactory("btnDelCard", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnDeleteExit = settingFactory("btnDeleteExit", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnIgnoreBook = settingFactory("btnIgnoreBook", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnSplitByPunctuations = settingFactory("btnSplitByPunctuations", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnSplitByPunctuationsListCheck = settingFactory("btnSplitByPunctuationsListCheck", true, STORAGE_Prog_SETTINGS, null as TSK);
export const btnSplitByPunctuationsList = settingFactory("btnSplitByPunctuationsList", true, STORAGE_Prog_SETTINGS, null as TSK);
