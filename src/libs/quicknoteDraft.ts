// 速记器小窗草稿持久化（qn-robust → lsfix 2026-10-13 家族战役）：草稿原走页面侧
// localStorage（quicknote.html 直写）——思源桌面 Electron 壳每次启动给内核随机端口，
// origin 含端口变=localStorage 换格子清空，跨重启必丢（qeBallPos 同病根）。消费者是
// 独立 BrowserWindow 静态页（零插件加载、CSP 限 inline script）不能 import store，
// 须经 BroadcastChannel "quicknote" 协议中转：页面 input 防抖 300ms post {type:'draft',
// text}（quicknoteCore.qnParseMsg 解析）→ QuickNote.onMsg 调本模块写档；state 消息带
// draft 字段恢复（loadQuickNoteDraft 顺手收编旧档）；done（保存成功）清档。
import { quickNoteDraft } from "./stores";

// 旧档收编源（qn-robust 前的主档，仅 loadQuickNoteDraft 读；小窗与主窗同 origin 同格子）
const LS_DRAFT = "quicknote-draft";

/** 草稿读取（state 推送用）：quickNoteDraft 档优先；空档时收编 localStorage 旧档
 *  （固定端口环境有真值，桌面端随机端口 origin 下恒空）并落新档。收编后移除旧键——
 *  草稿档有「保存成功清空」回 "" 的合法态，不移除则清空后每次重启旧稿复活（qeBall
 *  位置档无此回空态故可留旧键，本键必须移除）。均无→""（无草稿） */
export function loadQuickNoteDraft(): string {
    const v = quickNoteDraft.get();
    if (v) return v;
    let legacy = "";
    try {
        legacy = localStorage.getItem(LS_DRAFT) ?? "";
        if (legacy) localStorage.removeItem(LS_DRAFT);
    } catch { /* localStorage 不可用：退化为无草稿 */ }
    if (legacy) saveQuickNoteDraft(legacy);
    return legacy;
}

/** 草稿落盘（页面 draft 消息/旧档收编/保存成功清稿共用）：set 后紧跟 write 确定性
 *  落盘（settingFactory.set 只写内存不落盘，搭车不可靠——stores.ts 注释）；同值跳过
 *  （页面 300ms 防抖连打至多一写一停，重复 state 推送不触发写盘） */
export function saveQuickNoteDraft(text: string) {
    if (quickNoteDraft.get() === text) return;
    quickNoteDraft.set(text);
    void quickNoteDraft.write();
}
