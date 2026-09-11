// AI 助手面板会话态（ai-agent □6）：模块级 $state——dock 面板是懒挂载的（收起即销毁
// 组件、展开重 init），组件内 $state 会话在收起/编辑器聚焦后全丢（6809 实锤：edit 应用后
// 面板空如新）。外提到本模块随插件单例存活，与 dock 挂载周期解耦。
// agentqa □3：会话按文档分线程持久化 localStorage（纯逻辑在 agentThreadStore，本层只接线）
// ——面板挂载/文档切换换线程，完成消息即写即存，draft 跟线程走；瞬态（active/undo）不跨线程。
export interface PanelToolView {
    name: string;
    action: string;
    ms: number;
    ok: boolean;
}
export interface PanelMsg {
    role: "user" | "assistant";
    content: string;
    tools?: PanelToolView[];
    status?: "thinking" | "streaming" | "error";
    docTitle?: string;
    /** 推理流（reasoning_content 模型分离输出）：仅进行中气泡展示，完成消息不落 */
    reasoning?: string;
}
/** 最近一次已应用编辑的回滚快照（会话内单层撤销；更早历史走思源文档历史） */
export interface PanelUndo {
    blockID: string;
    oldMarkdown: string;
}

import { debugLog } from "./libs/logUtils";
import {
    loadThreads, saveThreads, threadKeyOf, msgToStored, trimThreadMsgs,
    type StoredThread, type StoredMsg,
} from "./agentThreadStore";

export const panelSession = $state({
    msgs: [] as PanelMsg[],
    active: null as PanelMsg | null,
    canUndo: false,
    pendingUndo: null as PanelUndo | null,
    /** 输入框草稿（agentrev □6 外提：dock 懒挂载收起即销毁组件，草稿随会话单例存活） */
    draft: "",
});

// ---- 线程持久化接线（agentqa □3） ----
const threads: Record<string, StoredThread> = loadThreads(typeof localStorage !== "undefined" ? localStorage : undefined);
/** 当前线程 key（null=尚未挂载换线；面板 onMount 首个 switchPanelThread 之前） */
let curKey: string | null = null;

export function panelThreadKey(): string | null {
    return curKey;
}

function persist() {
    if (!saveThreads(typeof localStorage !== "undefined" ? localStorage : undefined, threads)) {
        debugLog("agent_panel", "threads persist failed (quota?)", "aiagent");
    }
}

/** 换线程（面板挂载+文档切换调用；同 key 幂等）：旧线程存 msgs+draft，新线程回灌；
 *  active/undo 是瞬态，不跨线程携带。 */
export function switchPanelThread(docID: string) {
    const key = threadKeyOf(docID);
    if (key === curKey) return;
    if (curKey != null) {
        // 空线程（无消息无草稿）不落盘；既有的同步清掉——防启动期 _global 空壳累积
        const stored = trimThreadMsgs(ps_stored());
        if (stored.length || panelSession.draft) {
            threads[curKey] = { msgs: stored, draft: panelSession.draft, used: Date.now() };
        } else {
            delete threads[curKey];
        }
        persist();
    }
    curKey = key;
    const t = threads[key];
    if (t) {
        t.used = Date.now();
        panelSession.msgs = t.msgs.map(storedToPanel);
        panelSession.draft = t.draft ?? "";
    } else {
        panelSession.msgs = [];
        panelSession.draft = "";
    }
    panelSession.active = null;
    panelSession.canUndo = false;
    panelSession.pendingUndo = null;
}

function ps_stored(): StoredMsg[] {
    return panelSession.msgs.map(msgToStored).filter((m): m is StoredMsg => m != null);
}
function storedToPanel(m: StoredMsg): PanelMsg {
    return { role: m.role, content: m.content, docTitle: m.docTitle };
}

/** 完成消息入列+落盘。th=发送时捕获的线程 key（send 全程用同一个，防中途切文档串台）：
 *  th 仍是当前线程→进 ps.msgs 显示；已切走→只落后台线程，切回可见。 */
export function appendThreadMsg(th: string | null, msg: PanelMsg) {
    if (th == null) {
        panelSession.msgs = [...panelSession.msgs, msg];
        return;
    }
    const t = threads[th] ?? (threads[th] = { msgs: [], used: Date.now() });
    const s = msgToStored(msg);
    if (s) t.msgs = trimThreadMsgs([...t.msgs, s]);
    t.used = Date.now();
    persist();
    if (th === curKey) panelSession.msgs = [...panelSession.msgs, msg];
}

/** 草稿落盘（组件 600ms 防抖/线程切换/整页卸载/pagehide 调用） */
export function savePanelDraft() {
    if (curKey == null) return;
    const t = threads[curKey];
    if (t) {
        t.draft = panelSession.draft;
        t.used = Date.now();
        persist();
    } else if (panelSession.draft) {
        threads[curKey] = { msgs: [], draft: panelSession.draft, used: Date.now() };
        persist();
    }
}

/** 清空钮：只清当前线程（bear 预期内语义；全清不做——队列式默认） */
export function clearCurrentThread() {
    if (curKey != null) {
        delete threads[curKey];
        persist();
    }
    panelSession.msgs = [];
    panelSession.active = null;
    panelSession.canUndo = false;
    panelSession.pendingUndo = null;
    panelSession.draft = "";
}

// 整页卸载兜底：pagehide 在 reload/关窗都触发，草稿不丢
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("pagehide", () => savePanelDraft());
}
