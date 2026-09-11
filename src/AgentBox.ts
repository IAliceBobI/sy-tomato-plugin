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
import { parseAgentScriptContent, findAgentScriptDocID, parseAgentPromptContent, findAgentPromptDocID, AGENT_PROMPT_FENCE } from "./libs/agentScriptBlock";
import { createFrontendToolEnv } from "./agentToolBridge";
import { debugLog } from "./libs/logUtils";
import { agentIconSymbolID } from "./agentIcon";
import { tomatoI18n } from "./tomatoI18n";
import AgentPanel from "./AgentPanel.svelte";

// dock type 规范=dock_<Name>（CommentBox/GraphBox 同款）：keymap 键=插件名+type
// （sy-tomato-plugindock_AgentBox）——裸名不带 dock_ 前缀时 hotkey 不进 keymap（6809 实测）
const DOCK_TYPE = "dock_AgentBox";

class AgentBox {
    private plugin: BaseTomatoPlugin;
    svelte: any = null;
    /** agentrev □5：已注册提示词命令的块 id（动态注册去重，重载后 onload 扫描重建） */
    private promptReg = new Set<string>();

    onload(plugin: BaseTomatoPlugin) {
        if (!aiPanelCheckbox.get()) return;
        if (events.isMobile) return;
        this.plugin = plugin;
        this.addDock();
        this.registerScriptCommands();
        void this.registerPromptCommands();
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

    /** agentrev □5 提示词命令（bear ⑤「提示词其实就是 command，不进上下文」）：仓库文档
     *  agent-prompt 块→命令（零常驻：不挂键位不进 system，点名触发现读块注入面板会话）。
     *  回调按块 id 现读——设置卡/笔记里改块内容即时生效，删块=报失效，均免重载插件。 */
    private async registerPromptCommands() {
        try {
            const docID = await findAgentPromptDocID();
            if (!docID) return;
            const rows = await siyuan.sql(
                `select id, content from blocks where root_id='${docID}' and markdown like '%${AGENT_PROMPT_FENCE}%'`,
            );
            let n = 0;
            for (const row of rows ?? []) {
                const data = parseAgentPromptContent(row.content ?? "");
                if (!data) continue;
                this.registerPromptCommand(String(row.id), data.name);
                n++;
            }
            if (n) debugLog("agentbox", `prompt commands registered: ${n}`, "aiagent");
        } catch (e) {
            debugLog("agentbox", `scan prompts failed: ${e}`, "aiagent");
        }
    }

    /** 注册单条提示词命令（公开面：设置卡新增后即时可用；重复 id 幂等跳过；
     *  面板未启用=this.plugin 未设，静默跳过——onload 扫描兜后续） */
    registerPromptCommand(blockID: string, name: string) {
        if (!this.plugin || this.promptReg.has(blockID)) return;
        this.promptReg.add(blockID);
        this.plugin.addCommand({
            langKey: `agentPrompt_${blockID.slice(-8)}`,
            langText: `${tomatoI18n.AI助手}·${name}`,
            callback: () => void this.firePrompt(blockID),
        });
    }

    /** 命令回调：现读块→开面板→注入为用户消息（空闲自动发送） */
    private async firePrompt(blockID: string) {
        try {
            const rows = await siyuan.sql(`select content from blocks where id='${blockID}'`);
            const data = parseAgentPromptContent(rows?.[0]?.content ?? "");
            if (!data) {
                await siyuan.pushMsg(tomatoI18n.提示词已删除, 3000);
                return;
            }
            this.ensureDockVisible();
            // 首开 dock 的 init 挂面板有时序窗口，轮询等 exports（≤2s）
            const t0 = Date.now();
            while (!this.svelte?.injectPrompt && Date.now() - t0 < 2000) {
                await new Promise(r => setTimeout(r, 100));
            }
            if (this.svelte?.injectPrompt) this.svelte.injectPrompt(data.prompt);
            else await siyuan.pushMsg(tomatoI18n.提示词已删除, 3000);
        } catch (e) {
            debugLog("agentbox", `fire prompt failed: ${e}`, "aiagent");
        }
    }

    /** 幂等确保 dock 面板可见（GraphBox.ensureDockVisible 同款，本面板在 rightDock）：
     *  toggleModel 对已激活面板是收起语义，先判激活态；键必须用 plugin.name+DOCK_TYPE 完整键 */
    private ensureDockVisible() {
        const layoutDock = (window.siyuan as any).layout?.rightDock;
        if (!layoutDock) return;
        const fullType = this.plugin.name + DOCK_TYPE;
        const item = document.querySelector(`.dock__item[data-type="${fullType}"]`);
        const active = item?.classList.contains("dock__item--active");
        if (!active || layoutDock.panelVisible === false) {
            layoutDock.toggleModel(fullType, true);
        }
    }

    /** agentqa □2 旧图标迁移：思源把插件 dock 配置持久化在 local.json 的
     *  local-plugin-docks/<插件>/<type>，启动时整体盖掉 addDock 传参（loader.ts addPluginDock），
     *  老用户升级后 dock 钮会钉死 iconSparkles——在 addDock 之前改内存条目（本轮渲染即新图标）
     *  + setLocalStorageVal 落盘（app=自身排除广播回声）。仅认 iconSparkles 旧值，其余值视为
     *  用户态不动；新装用户无条目=天然走新图标，不触发。 */
    private migrateDockIcon() {
        const fullType = this.plugin.name + DOCK_TYPE;
        const all = (window.siyuan as any).storage?.["local-plugin-docks"];
        const entry = all?.[this.plugin.name]?.[fullType];
        if (entry?.icon !== "iconSparkles") return;
        entry.icon = agentIconSymbolID();
        void siyuan.call("/api/storage/setLocalStorageVal", {
            key: "local-plugin-docks",
            val: all,
            app: (window.siyuan as any).appId,
        }).catch((e: unknown) => debugLog("agentbox", `dock icon migrate persist failed: ${e}`, "aiagent"));
    }

    private addDock() {
        this.migrateDockIcon();
        const title = tomatoI18n.AI助手;
        this.plugin.addDock({
            type: DOCK_TYPE,
            config: {
                position: "RightBottom",
                size: { width: 400, height: 0 },
                icon: agentIconSymbolID(),
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
                            <svg class="block__logoicon"><use xlink:href="#${agentIconSymbolID()}"></use></svg>${title}
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
