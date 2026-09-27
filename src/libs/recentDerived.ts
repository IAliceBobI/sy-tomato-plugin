// need-0926-15：拍照闪念「近期列表」改由今日日记实时派生。
// 原列表=recentText（插件设置整文件 last-writer-wins）——多端各自记 20 条互覆（手机端
// 条目被桌面端整文件覆盖=跨端丢条目），且移动端「规避云同步冲突」模式下闪念先落队列
// 文档（搬运不写列表），同步合并前列表先天缺账。真因=列表不是日记的视图。修法：列表=
// 今日日记（getTargetID 语义：按日新日记 / flash_thoughts_target_file 固定文件覆盖）里
// 带 custom-tomato-idea-time 的块实时派生（正文/类型/块 id 跳转，跳转链复用既有
// OpenSyFile2）；recentText 不删、降为离线兜底（查询失败/空——含刚同步完 attributes
// 表 1~4s 索引窗——时退回本机快照）。刷新时机=面板挂载查一次 + 新插入乐观 unshift
// （免等索引窗）+ 手动同步后延迟重查；不做常驻轮询。
// 依赖方向约束：本模块不得 import ../NoteBox（其顶部 import NoteBox.svelte，会成环），
// dayID 由组件层用 getTargetID 解析后传入。
import { writable, get } from "svelte/store";
import { siyuan } from "./utils";
import { debugLog } from "./logUtils";
import { flashTypeFromQueueBlock } from "./flashBlockForm";
import { storeNoteBox_noteCount, storeNoteBox_recentText, RecentItem } from "./stores";

/** 必带识别键（日记管线收集块协议 v1：所有闪念/收集落块形态都挂，calcTimeInterval 同源） */
export const IDEA_TIME_KEY = "custom-tomato-idea-time";
/** 类型还原属性键（宿主或子树任一块命中即取）：老收集块 idea-type（主实例存量实测）/
 *  lifelog 六键 type（flashStatTag 开启用户的速记标记） */
const TYPE_ATTR_KEYS = new Set(["custom-tomato-idea-type", "custom-lifelog-type"]);

/** 列表渲染视图：items=派生条目或兜底 recentText 快照；total=行首编号基数（派生=条数、
 *  兜底=noteCount 累计，保持既有编号语义）；derived=当前是否派生模式 */
export interface RecentView {
    items: (string | RecentItem)[];
    total: number;
    derived: boolean;
}

export const recentView = writable<RecentView>({ items: [], total: 0, derived: false });

/** attributes 表行（select block_id,name,value 投影） */
export interface RecentAttrRow {
    block_id: string;
    name: string;
    value: string;
}

/** blocks 表行（全文档投影；字段语义 2026-09-26 dev 6807 实测三种落块形态核对）。
 *  字段全可选=与 siyuan SQL Block 类型兼容直传（体内逐行判空防御） */
export interface RecentBlockRow {
    id?: string;
    parent_id?: string;
    type?: string;
    content?: string;
    markdown?: string;
    alias?: string;
    created?: string;
}

/** 纯函数：attributes 行 + 全文档块行 → 近期条目（created 倒序=最新在前，截 max）。
 *  正文=宿主链（自身+树序后代）首个「无子且 content 非空」的叶子块——sb/l/i 容器行
 *  content 列是拼合子文本且带缩进前缀空格（实测），叶子 p 最干净；全树无文本叶子
 *  （纯图条目/文本已删）跳过该条不显示。
 *  类型=宿主 alias 列（emoji 分支/队列搬运 IAL 直落）→ 宿主链上 idea-type/lifelog-type
 *  属性（老收集块/速记标记）→ 正文块 markdown 首部引用锚（DOM 通道分类锚，
 *  flashTypeFromQueueBlock 同款还原链）→「闪念」兜底。
 *  timeRows 空（索引窗/今日未记）返回 []——调用方据此走离线兜底 */
export function deriveRecentEntries(attrRows: RecentAttrRow[], blockRows: RecentBlockRow[], max = 20): RecentItem[] {
    const timeOf = new Map<string, string>();
    const aliasAttr = new Map<string, string>();
    const typeAttr = new Map<string, string>();
    for (const r of attrRows ?? []) {
        if (!r?.block_id || !r.name) continue;
        if (r.name === IDEA_TIME_KEY) {
            // 老值带 ⌛ 间隔后缀（calcTimeInterval 同款清洗口径）
            const t = (r.value ?? "").split("⌛")[0].trim();
            if (t) timeOf.set(r.block_id, t);
        } else if (r.name === "alias") {
            aliasAttr.set(r.block_id, (r.value ?? "").trim());
        } else if (TYPE_ATTR_KEYS.has(r.name)) {
            typeAttr.set(r.block_id, (r.value ?? "").trim());
        }
    }
    if (timeOf.size === 0) return [];

    const byID = new Map<string, RecentBlockRow>();
    const kidsOf = new Map<string, RecentBlockRow[]>();
    for (const b of blockRows ?? []) {
        if (!b?.id) continue;
        byID.set(b.id, b);
        if (b.parent_id) {
            const arr = kidsOf.get(b.parent_id);
            if (arr) arr.push(b);
            else kidsOf.set(b.parent_id, [b]);
        }
    }
    const chainCache = new Map<string, RecentBlockRow[]>();
    const chainOf = (id: string): RecentBlockRow[] => {
        const cached = chainCache.get(id);
        if (cached) return cached;
        const out: RecentBlockRow[] = [];
        const walk = (bid: string) => {
            for (const k of kidsOf.get(bid) ?? []) {
                out.push(k);
                walk(k.id);
            }
        };
        walk(id);
        chainCache.set(id, out);
        return out;
    };

    const tagged: (RecentItem & { created: string; time: string })[] = [];
    for (const [id, time] of timeOf) {
        const host = byID.get(id);
        if (!host) continue; // 块已删 / attributes 与 blocks 两表索引漂移：跳过不炸
        const chain = [host, ...chainOf(id)];
        let text = "";
        let textRow: RecentBlockRow | undefined;
        for (const b of chain) {
            if ((kidsOf.get(b.id) ?? []).length > 0) continue; // 容器行 content 带缩进前缀，只取叶子
            const c = (b.content ?? "").trim();
            if (c) {
                text = c;
                textRow = b;
                break;
            }
        }
        if (!textRow) continue; // 子树无文本（纯图/文本已删）：列表无可示内容，跳过

        const alias = (host.alias ?? "").trim() || aliasAttr.get(host.id) || "";
        const attrType = chain.map(b => typeAttr.get(b.id)).find(v => !!v) ?? "";
        const type = alias || attrType || flashTypeFromQueueBlock(textRow.markdown ?? "", "") || "闪念";
        tagged.push({ id: host.id, type, text, created: host.created ?? "", time });
    }
    tagged.sort((a, b) =>
        b.created.localeCompare(a.created) ||
        b.time.localeCompare(a.time) ||
        b.id.localeCompare(a.id));
    return tagged.slice(0, max).map(({ id, type, text }) => ({ id, type, text }));
}

/** 兜底视图：recentText 本机快照（查询失败/今日为空时的离线垫底——旧 last-writer-wins
 *  语义仅在此路径残存，跨端完整性由派生主路径保证） */
export function showFallbackRecent() {
    const items = [...get(storeNoteBox_recentText)];
    recentView.set({
        items,
        total: Math.max(get(storeNoteBox_noteCount), items.length),
        derived: false,
    });
}

/** 查询+派生+写视图（fire-and-forget 语义，组件层 void 调用）。返回 true=派生模式已
 *  就位；false=dayID 空/查询失败/今日无闪念块（含 attributes 索引窗），已回落兜底 */
export async function refreshRecentFromDiary(dayID: string, max = 20): Promise<boolean> {
    if (!dayID) {
        showFallbackRecent();
        return false;
    }
    try {
        const attrRows = await siyuan.sqlAttr(
            `select block_id, name, value from attributes where root_id="${dayID}" and name in ("${IDEA_TIME_KEY}", "alias", "custom-tomato-idea-type", "custom-lifelog-type")`
        );
        const blockRows = await siyuan.sql(
            `select id, parent_id, type, content, markdown, alias, created from blocks where root_id="${dayID}"`
        );
        const items = deriveRecentEntries(attrRows ?? [], blockRows ?? [], max);
        if (items.length === 0) {
            showFallbackRecent();
            return false;
        }
        recentView.set({ items, total: items.length, derived: true });
        return true;
    } catch (e) {
        debugLog("flashlog", `recent derive fail doc=${dayID}: ${e}`, "dailynote");
        showFallbackRecent();
        return false;
    }
}

/** 新插入后的乐观更新：立即 unshift 本机新条目——刚插的块 attributes 1~4s 才进索引
 *  （在档坑），乐观更新免等索引窗，下次面板挂载重查自然修正。两种模式都适用：
 *  派生=头部即时可见；兜底=与 recentText.save（splice(0,0,e) 同语义）同值 */
export function prependRecentItem(item: RecentItem, max = 20) {
    recentView.update(v => ({
        items: [item, ...v.items].slice(0, max),
        total: v.total + 1,
        derived: v.derived,
    }));
}
