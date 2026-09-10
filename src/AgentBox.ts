// AI 助手面板（ai-agent □5）：右侧 dock 侧边栏，纯查询切片——当前文档跟随 + 轻工具循环
// （A 层四工具直调，runAgentLoop 编排）+ 流式回复。设计拍板（探查实锤）：AIBox 保留不动
// （它是「选中→改写→插回」编辑流，与本面板查询流不同类）；桌面 only（isMobile 不注册）；
// 快捷键 ⌥⌘H=官方 keymap ⌥⌘ 全字母仅 H/O 空闲且仓内 O 已被三处占用的唯一双空闲键
// （6809 getConf 正则实测 2026-09-10；macOS Hide Others 拦截风险由 e2e 实测兜底）。
import { unmount, mount } from "svelte";
import { newID } from "stonev5-utils";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { aiPanelCheckbox } from "./libs/stores";
import { events } from "./libs/Events";
import { siyuan } from "./libs/utils";
import { parseAgentScriptContent, findAgentScriptDocID } from "./libs/agentScriptBlock";
import { createFrontendToolEnv } from "./agentToolBridge";
import { debugLog } from "./libs/logUtils";
import { tomatoI18n } from "./tomatoI18n";
import AgentPanel from "./AgentPanel.svelte";

// dock type 规范=dock_<Name>（CommentBox/GraphBox 同款）：keymap 键=插件名+type
// （sy-tomato-plugindock_AgentBox）——裸名不带 dock_ 前缀时 hotkey 不进 keymap（6809 实测）
const DOCK_TYPE = "dock_AgentBox";

class AgentBox {
    private plugin: BaseTomatoPlugin;
    svelte: any = null;

    onload(plugin: BaseTomatoPlugin) {
        if (!aiPanelCheckbox.get()) return;
        if (events.isMobile) return;
        this.plugin = plugin;
        this.addDock();
        this.registerScriptCommands();
    }

    /** 固化仓库·命令档（□6）：扫仓库文档的 agent-script 块注册成命令（点名触发零常驻）。
     *  块内容改动须 reload 插件生效（命令注册时机=onload 一次）。 */
    private async registerScriptCommands() {
        try {
            const docID = await findAgentScriptDocID();
            if (!docID) return;
            const rows = await siyuan.sql(
                `select id, content from blocks where root_id='${docID}' and markdown like '%${"sy-tomato-plugin/agent-script"}%'`,
            );
            let n = 0;
            for (const row of rows ?? []) {
                const data = parseAgentScriptContent(row.content ?? "");
                if (!data) continue;
                const blockID = String(row.id);
                this.plugin.addCommand({
                    langKey: `agentScript_${blockID.slice(-8)}`,
                    langText: `${tomatoI18n.AI助手}·${data.name}`,
                    callback: async () => {
                        try {
                            const env = createFrontendToolEnv(this.plugin as any);
                            const { result } = await env.runUserJS!(data.code);
                            await siyuan.pushMsg(String(result).slice(0, 180), 4000);
                        } catch (e) {
                            await siyuan.pushMsg(String(e instanceof Error ? e.message : e).slice(0, 180), 4000);
                        }
                    },
                });
                n++;
            }
            if (n) debugLog("agentbox", `script commands registered: ${n}`, "aiagent");
        } catch (e) {
            debugLog("agentbox", `scan scripts failed: ${e}`, "aiagent");
        }
    }

    private addDock() {
        const title = tomatoI18n.AI助手;
        this.plugin.addDock({
            type: DOCK_TYPE,
            config: {
                position: "RightBottom",
                size: { width: 400, height: 0 },
                icon: "iconSparkles",
                title,
                hotkey: "⌥⌘H",
            },
            data: {},
            resize() { },
            update() { },
            destroy() {
                if (agentBox.svelte) unmount(agentBox.svelte);
            },
            init: (dock) => {
                const eleID = newID();
                dock.element.innerHTML = `<div class="fn__flex-1 fn__flex-column">
                    <div class="block__icons">
                        <div class="block__logo">
                            <svg class="block__logoicon"><use xlink:href="#iconSparkles"></use></svg>${title}
                        </div>
                        <span class="fn__flex-1 fn__space"></span>
                        <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min"><svg><use xlink:href="#iconMin"></use></svg></span>
                    </div>
                    <div id="${eleID}" class="fn__flex-1 fn__flex fn__flex-column"></div>
                </div>`;
                agentBox.svelte = mount(AgentPanel, {
                    target: dock.element.querySelector("#" + eleID),
                    props: {},
                });
            },
        } as any); // addDock.init 的 dock 参数同 GraphBox/CommentBox：1.2.5 类型漏了，运行时仍传
    }
}

export const agentBox = new AgentBox();
