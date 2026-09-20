// 日记管线收集块协议 v1（dailynote-pipeline 战役 □1，2026-09-06）：
// 日记收集块 = superblock 容器 + custom-tomato-idea-time（必带识别键，HH:MM 收集时刻；
// 消费方：calcTimeInterval 相邻间隔、cssFlashThoughts 时间戳显示）+ custom-tomato-ref-hpath
// （可选，源文档路径）+ alias（可选，类型/图标）。复制块另保留 custom-super-list="1"
// 作视觉标记（CSS 下边框），老块零迁移、读侧零兼容层。

/** 收集块容器属性构造：无源（闪念）不落空 ref-hpath 键——省略即「无源可溯」语义 */
export function collectBlockAttrs(time: string, refHpath?: string): AttrType {
    const attrs: AttrType = { "custom-tomato-idea-time": time };
    if (refHpath) attrs["custom-tomato-ref-hpath"] = refHpath;
    return attrs;
}

/** 移动端当日日记 pin 跨天守卫：从未 pin 或 pin 日已非今日 → 重新取当日日记 */
export function shouldRepinDailyNote(pinnedYMD: string | undefined, nowYMD: string): boolean {
    return pinnedYMD !== nowYMD;
}

// 时间记录格式兼容（flashlog 战役 □1，2026-09-20）：闪念/官方速记落块时给内容段落块
// 附加一组通用时间记录标记，生态内时间记录统计类插件（属性驱动的视图查询：四键齐的
// type='p' 块才可见）即可识别统计。统计始终是对方插件的活，我们只负责格式对得上。
// 值格式契约：time=HH:MM（两位补零无秒）、date=YYYY-MM-DD、created/updated=YYYY-MM-DD HH:MM:SS。
// 前缀为生态默认通用词，全仓唯一字面量点在此，勿散落勿改（对方插件可自定义前缀，我们
// 固定默认与其默认对齐）。
export const LIFELOG_ATTR_PREFIX = "lifelog";

/** 时间记录标记入参：time 需 "HH:MM" 形态（getTime()/hhmmFromCreated 同款产物）；
 *  date 缺省=当天；created/updated 取落块当下时刻（与内容无关，勿用记录时刻） */
export interface LifeTag {
    content: string;
    type: string;
    time: string;
    date?: string;
}

export function lifelogAttrs(tag: LifeTag): AttrType {
    const p2 = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const day = tag.date ?? `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}`;
    const stamp = `${day} ${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}`;
    const key = (k: string) => `custom-${LIFELOG_ATTR_PREFIX}-${k}`;
    return {
        [key("content")]: tag.content,
        [key("type")]: tag.type,
        [key("time")]: tag.time,
        [key("date")]: day,
        [key("created")]: stamp,
        [key("updated")]: stamp,
    };
}

/** 块 id 前 14 位（created）→ "YYYY-MM-DD"；跨天搬运/合并场景 date 须取记录日而非搬运日 */
export function ymdFromCreated(created: string): string {
    if (!created || created.length < 8) return "";
    return `${created.slice(0, 4)}-${created.slice(4, 6)}-${created.slice(6, 8)}`;
}
