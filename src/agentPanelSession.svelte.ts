// AI 助手面板会话态（ai-agent □6）：模块级 $state——dock 面板是懒挂载的（收起即销毁
// 组件、展开重 init），组件内 $state 会话在收起/编辑器聚焦后全丢（6809 实锤：edit 应用后
// 面板空如新）。外提到本模块随插件单例存活，与 dock 挂载周期解耦。
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
}
/** 最近一次已应用编辑的回滚快照（会话内单层撤销；更早历史走思源文档历史） */
export interface PanelUndo {
    blockID: string;
    oldMarkdown: string;
}

export const panelSession = $state({
    msgs: [] as PanelMsg[],
    active: null as PanelMsg | null,
    canUndo: false,
    pendingUndo: null as PanelUndo | null,
});

export function resetPanelSession() {
    panelSession.msgs = [];
    panelSession.active = null;
    panelSession.canUndo = false;
    panelSession.pendingUndo = null;
}
