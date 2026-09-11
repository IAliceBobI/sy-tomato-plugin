<script lang="ts">
    // AI 助手面板（ai-agent □5）：当前文档快照进 system + A 层工具循环（runAgentLoop）
    // + 流式渲染（Lute.Md2HTML+消毒，Copilot 零依赖路线）。纯查询切片：AI 只读不改，
    // 不落盘不写块；单会话内存态（dock 常驻不销毁即不丢），清空钮重置。
    // 历史回灌只带 user/assistant 文本对——工具往返留在当次循环内（每问独立快照重注 system）。
    import { onDestroy, onMount } from "svelte";
    import { confirm, Dialog } from "siyuan";
    import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
    import { OpenAIClient, diagnoseAIAsync } from "./libs/openAI";
    import { siyuan } from "./libs/utils";
    import { events } from "./libs/Events";
    import { debugLog } from "./libs/logUtils";
    import { getTomatoPluginInstance, NewConfiguredLute } from "./libs/globals";
    import { createFrontendToolEnv } from "./agentToolBridge";
    import { createToolCaller } from "./libs/agentTools";
    import { createPanelOnlyTools, needsHumanReview } from "./libs/agentTools/editTools";
    import { agentMaxTurns, agentReviewEdit, agentReviewRunJs, agentKnowledgeDocs, agentSkillDocs, agentHistoryMsgs, agentDocSnapshotLimit } from "./libs/stores";
    import { fetchDocSnapshots, buildKnowledgeSection, buildSkillSection, sqlInList, clampHistoryMsgs, clampDocSnapshotLimit, pickHistoryMsgs } from "./libs/agentContext";
    import {
        AGENT_SCRIPT_DOC_TITLE,
        buildAgentScriptContent,
        findAgentScriptDocID,
    } from "./libs/agentScriptBlock";
    import { runAgentLoop } from "./agentLoop";
    import AgentConfirm from "./AgentConfirm.svelte";
    import { panelSession as ps, switchPanelThread, appendThreadMsg, savePanelDraft, clearCurrentThread, panelThreadKey, type PanelMsg } from "./agentPanelSession.svelte";
    import { newID } from "stonev5-utils";
    import { mount, unmount } from "svelte";
    import { tomatoI18n } from "./tomatoI18n";

    let busy = $state(false);
    let controller: AbortController | null = null;
    let msgsEl: HTMLDivElement | undefined = $state();
    /** 头部跟随指示：当前文档标题（switch-protyle 刷新；空=无打开文档） */
    let docTitle = $state("");

    // ---- 流式渲染节流（agentrev □6）：真源=ps.active.content（每 chunk 追加），视图 150ms
    //      对齐一次——逐 chunk 全量 Md2HTML 会把 DOM 打成幻灯片；首事件同步出一帧防空窗 ----
    let streamView = $state("");
    let streamTimer: number | undefined;
    function startStreamRender() {
        if (streamTimer !== undefined) return;
        streamView = ps.active?.content ?? "";
        streamTimer = window.setInterval(() => {
            if (!ps.active) { stopStreamRender(); return; }
            streamView = ps.active.content;
        }, 150);
    }
    function stopStreamRender() {
        if (streamTimer !== undefined) {
            clearInterval(streamTimer);
            streamTimer = undefined;
        }
        streamView = "";
    }

    // ---- markdown 渲染：Lute Md2HTML + 消毒 + hljs（思源自带全局） ----
    let lute: any = null;
    function renderMD(md: string): string {
        if (!lute) lute = NewConfiguredLute() as any;
        let html = "";
        try {
            html = lute.Md2HTML(md) ?? "";
        } catch {
            return "";
        }
        return sanitizeHTML(html);
    }
    /** AI 输出不可全信（虽经 Lute 转义，兜一层）：剥可执行节点/事件属性/js: 协议 */
    function sanitizeHTML(html: string): string {
        const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
        const root = doc.body.firstElementChild!;
        root.querySelectorAll("script,iframe,object,embed,link,style").forEach(n => n.remove());
        root.querySelectorAll("*").forEach(el => {
            for (const attr of [...el.attributes]) {
                if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
                if ((attr.name === "href" || attr.name === "src") && /^\s*javascript:/i.test(attr.value)) {
                    el.removeAttribute(attr.name);
                }
            }
        });
        return root.innerHTML;
    }

    // ---- 当前文档跟随（头部指示） ----
    function curDocID(): string {
        const el = document.querySelector(".protyle:not(.fn__none) .protyle-title[data-node-id]")
            ?? document.querySelector(".protyle-title[data-node-id]");
        return el?.getAttribute("data-node-id") ?? events.docID ?? "";
    }
    function refreshDocTitle() {
        // 标题元素=.protyle-title__input（contenteditable，非 __text——6809 实测）；空标题=无标题文档回退 id
        const t = document.querySelector(".protyle:not(.fn__none) .protyle-title__input")?.textContent?.trim();
        docTitle = t || curDocID().slice(0, 8) || "";
    }
    const onSwitchProtyle = (_e: string, _d: any) => {
        refreshDocTitle();
        // agentqa □3：文档切换=对话线程切换（localStorage 按文档分线程；同 key 幂等）
        switchPanelThread(curDocID());
    };
    onMount(() => {
        // Events 单例无反订阅面（Map.set 同名覆盖）；dock 常驻生命周期=插件本体，
        // 卸载即整窗重载单例消亡，与 Box 族同语义——无需（也无法）off
        events.addListener("agentpanel", onSwitchProtyle);
        refreshDocTitle();
        switchPanelThread(curDocID());
    });
    onDestroy(() => {
        stopStreamRender();
        clearTimeout(draftTimer);
        savePanelDraft();
        /* 订阅生命周期见 onMount 注释：Events 单例 */
    });

    // 草稿防抖落盘（agentqa □3）：跟线程走，切文档/关窗各自保留；600ms 防按键级写放大
    let draftTimer: number | undefined;
    $effect(() => {
        void ps.draft;
        clearTimeout(draftTimer);
        draftTimer = window.setTimeout(() => savePanelDraft(), 600);
    });

    // 新消息/流式增量自动滚底（用户没往上翻时；简单起见恒滚动——对话区短，AnnoChat 同款）
    $effect(() => {
        void ps.msgs.length; void ps.active?.content; void ps.active?.status;
        if (msgsEl) requestAnimationFrame(() => { msgsEl.scrollTop = msgsEl.scrollHeight; });
    });

    async function ensureCfg() {
        const d = await diagnoseAIAsync();
        if ("reason" in d) {
            confirm(tomatoI18n.未配置AI, tomatoI18n.annoAIGuideFor(d.reason), () => { /* 引导即止 */ });
            return undefined;
        }
        return { apiKey: d.apiKey, baseURL: d.baseURL, model: d.model };
    }

    // ---- □7 知识库预检索（RAG 轻编排）：开关+范围两档，开时 send 前先 search 拼上下文 ----
    let kbOn = $state(false);
    let kbScope = $state<"all" | "box">("all");
    /** 上次预检索的引擎标识（语义/关键词降级提示用），null=没检索 */
    let kbEngineNote = $state<string | null>(null);

    /** 预检索词提炼：优先问句引号内（「」『』“”‘’）——fts 拿整句会分词全失（6809 实锤：
     *  问句直查 0 命中、引号词命中 3 块）；无引号回空串=跳过预检索，检索权交 AI 自主调 search */
    function kbQueryOf(q: string): string {
        const m = q.match(/[「『“‘"]([^」』”’"]+)[」』”’"]/);
        return m?.[1]?.trim() ?? "";
    }

    async function kbSearch(q: string): Promise<string> {
        kbEngineNote = null;
        const query = kbQueryOf(q);
        if (!query) return "";
        try {
            const caller = createGatedCaller(createFrontendToolEnv(getTomatoPluginInstance() as any));
            const input: Record<string, any> = { query, engine: "auto", limit: 5 };
            if (kbScope === "box") {
                const docID = curDocID();
                if (docID) {
                    const rows = await siyuan.sql(`select box from blocks where id='${docID}'`);
                    const box = rows?.[0]?.box;
                    if (box) input.box = box;
                }
            }
            const r = await caller.call("search", input);
            if (!r.success) return "";
            const data = r.data as any;
            const blocks: any[] = data?.blocks ?? [];
            kbEngineNote = data?.engine === "semantic" ? "semantic" : "fts";
            if (!blocks.length) return "";
            return blocks.map((b, i) => `[${i + 1}] ${b.hPath || ""}\n${String(b.content ?? "").slice(0, 300)}`).join("\n\n");
        } catch (e) {
            debugLog("agent_panel", `kbSearch failed: ${e}`, "aiagent");
            return "";
        }
    }

    // ---- □6 人审确认闸（安全铁律：AI 写文档/执行代码前人必须看过）----

    /** 确认弹窗（AIBox ai() 模式：Dialog+mount，resolve 兑现后统一收尾） */
    function openConfirmDialog(props: { kind: "edit" | "run_js"; oldText?: string; newText?: string; code?: string }): Promise<boolean | string> {
        return new Promise(resolveDone => {
            let settled = false;
            const id = newID();
            const dialog = new Dialog({
                title: tomatoI18n.AI助手,
                content: `<div id="${id}"></div>`,
                width: "600px",
                destroyCallback: () => {
                    unmount(comp);
                    if (!settled) resolveDone(false); // 关窗=拒绝（Esc/外点全路径兜底）
                },
            });
            const comp = mount(AgentConfirm, {
                target: dialog.element.querySelector("#" + id),
                props: {
                    ...props,
                    resolve: (v: boolean | string) => {
                        settled = true;
                        dialog.destroy();
                        resolveDone(v);
                    },
                },
            });
        });
    }

    /** run_js 存为命令（固化仓库·命令档）：仓库文档缺则首建，脚本块 append 尾部 */
    async function saveScript(name: string, code: string) {
        try {
            // 语法预校验（6809 实锤：AI 会存「匿名 function 声明」类畸形代码，存了就是坏命令）
            try {
                new Function(`return (async () => {\n${code}\n})()`);
            } catch (e) {
                debugLog("agent_panel", `saveScript syntax rejected: ${e}`, "aiagent");
                await siyuan.pushMsg(tomatoI18n.脚本语法错误, 3000);
                return;
            }
            let docID = await findAgentScriptDocID();
            if (!docID) {
                const notebooks = await siyuan.lsNotebooks(false);
                const notebook = (notebooks ?? []).find((n: any) => !n.closed);
                if (!notebook) { await siyuan.pushMsg(tomatoI18n.脚本保存失败, 2500); return; }
                docID = await siyuan.createDocWithMd(notebook.id, "/" + AGENT_SCRIPT_DOC_TITLE, "");
                await new Promise(r => setTimeout(r, 1200)); // 写后立查索引延迟窗口（群踩坑）
            }
            await siyuan.appendBlock(buildAgentScriptContent({ v: 1, name, code, ts: Date.now() }), docID);
            await siyuan.pushMsg(tomatoI18n.脚本已存, 2500);
        } catch (e) {
            debugLog("agent_panel", `saveScript failed: ${e}`, "aiagent");
            await siyuan.pushMsg(tomatoI18n.脚本保存失败, 2500);
        }
    }

    /** 人审开关判定（agentrev □2，bear ②）：默认全开；关=该类动作免确认直接执行（用户自担） */
    function reviewEnabled(name: string): boolean {
        return name === "edit" ? agentReviewEdit.get() : agentReviewRunJs.get();
    }

    /** 带确认闸的 caller：写类工具（edit/run_js）先人审再真调（设置可关），拒绝=伪造 errorResponse 回灌 AI */
    function createGatedCaller(env: ReturnType<typeof createFrontendToolEnv>) {
        const inner = createToolCaller(env, createPanelOnlyTools(env));
        return {
            tools: inner.tools,
            async call(name: string, input: Record<string, any>) {
                if (needsHumanReview(name) && reviewEnabled(name)) {
                    if (name === "edit") {
                        let oldMarkdown = "";
                        try { oldMarkdown = (await env.readBlockMarkdown?.(String(input.blockID ?? "")))?.markdown ?? ""; } catch { }
                        const ok = await openConfirmDialog({ kind: "edit", oldText: oldMarkdown, newText: String(input.markdown ?? "") });
                        if (ok !== true) return { success: false, error: "用户拒绝了本次修改。请勿原样重试；可换方案或把新内容直接贴在回答里。" };
                        ps.pendingUndo = { blockID: String(input.blockID), oldMarkdown };
                        ps.canUndo = true;
                    } else {
                        const v = await openConfirmDialog({ kind: "run_js", code: String(input.code ?? "") });
                        if (v === false) return { success: false, error: "用户拒绝执行这段代码。请勿原样重试。" };
                        if (typeof v === "string" && v.startsWith("save:")) await saveScript(v.slice(5), String(input.code ?? ""));
                    }
                }
                const t0 = Date.now();
                const r = await inner.call(name, input);
                (r as any)._innerMs = Date.now() - t0; // 工具真实耗时（卡面 ms 用；e2e/ms 展示剔除上方人审等待）
                debugLog("tool", `${name} ${String(input?.action ?? "")} → ${r.success ? "ok" : `err ${r.error ?? ""}`.slice(0, 120)} ${Date.now() - t0}ms`, "aiagent");
                return r;
            },
        };
    }

    /** 会话内撤销最近一次 AI 编辑（API 事务不进 ⌘Z 栈——面板单层回滚兜底） */
    async function undoLastEdit() {
        if (!ps.pendingUndo || busy) return;
        const { blockID, oldMarkdown } = ps.pendingUndo;
        try {
            await siyuan.updateBlock(blockID, oldMarkdown);
            ps.pendingUndo = null;
            ps.canUndo = false;
            await siyuan.pushMsg(tomatoI18n.已撤销修改, 2000);
        } catch (e) {
            debugLog("agent_panel", `undo failed: ${e}`, "aiagent");
        }
    }

    /** 提问时快照当前文档：标题+全文 kramdown（□6 起保留 {: id=…} IAL 行——edit 工具的
     *  blockID 来源；token 代价换编辑能力，qwen 实测可忽略该噪音） */
    async function snapshotDoc(): Promise<{ title: string; text: string; truncated: boolean }> {
        const id = curDocID();
        if (!id) return { title: "", text: "", truncated: false };
        try {
            const { kramdown } = await siyuan.getBlockKramdown(id);
            const text = (kramdown ?? "").trim();
            // agentqa □4：快照长度可配（钳 2000~50000，默认 12000=旧硬编码等价）
            const limit = clampDocSnapshotLimit(agentDocSnapshotLimit.get());
            const truncated = text.length > limit;
            return {
                title: docTitle || id.slice(0, 8),
                text: truncated ? text.slice(0, limit) : text,
                truncated,
            };
        } catch {
            return { title: docTitle, text: "", truncated: false };
        }
    }

    /** agentrev □4 文档快照注入器（领域知识/Skill 同款）：标题批查走 SQL（文档行 content=标题），
     *  全文走 getBlockKramdown（文档 id=整篇含子块） */
    const ctxFetchers = {
        titles: async (ids: string[]): Promise<Record<string, string>> => {
            const rows = await siyuan.sql(`select id, content from blocks where id in (${sqlInList(ids)})`);
            return Object.fromEntries((rows ?? []).map((r: any) => [String(r.id), String(r.content ?? "")]));
        },
        kramdown: async (id: string): Promise<string> => {
            const { kramdown } = await siyuan.getBlockKramdown(id);
            return kramdown ?? "";
        },
    };

    function buildSystem(
        doc: { title: string; text: string; truncated: boolean },
        knowledgeSec = "",
        skillSec = "",
    ): string {
        // 手册按需拉（e2e 实锤：全文注入 system 会把 qwen 注意力带偏——「概括这篇文档」答成
        // 手册主题；改为一行指引进 system，AI 首次调工具前自己调 skills 拉，token 花在刀刃上）
        const parts: string[] = [];
        if (doc.title || doc.text) {
            parts.push(
                `## 用户当前文档（「这篇文档」指它）\n标题：${doc.title}\n` +
                (doc.text ? `正文：\n${doc.text}` : "（正文为空）") +
                (doc.truncated ? "\n（正文超长已截断，仅含前半部分）" : ""),
            );
        } else {
            parts.push("（当前无打开文档——回答通用问题，或先调 search 工具检索）");
        }
        // agentrev □4：领域知识=直接披露全文常驻；Skill=渐进披露只注简介（全文走 skills 工具）
        if (knowledgeSec) parts.push(knowledgeSec);
        if (skillSec) parts.push(skillSec);
        parts.push(
            "你可以调用工具（pomodoro 番茄数据 / search 知识库检索 / skills 工具手册与技能 / coze 知识库问答 / read 读块或文档全文 / edit 修改文档块 / run_js 执行计算）。\n" +
            "首次调用任何工具前，先调 skills 工具拉取使用手册，按手册的参数契约调用；与当前文档无关的问题可直接回答。\n" +
            // agentrev □6 硬约束（□4 记档癖：qwen 被问引用内容时用自有知识猜答不调 read）
            "上文领域知识/当前文档里的 ((id '文字')) 块引用、{: id=\"…\"} 块 id 与 siyuan://blocks/… 链接都不含被引正文。" +
            "硬性要求：当用户问及这些引用/链接指向的内容而上下文中没有其正文时，必须先调 read 工具按 id 拉取原文再回答，禁止凭记忆猜测、编造或概括你未读到的内容。\n" +
            "用户要求改写文档时用 edit 工具（blockID 从正文 {: id=\"…\"} 行取，用户会看到修改预览并确认）；" +
            "需要批量查询/复杂计算时用 run_js。\n" +
            "（本段是给你的操作指引——概括/引用「这篇文档」或领域知识时只依据上面的正文内容，勿把本指引当文档内容。）",
        );
        return parts.join("\n\n");
    }

    /** □7 检索结果段：标注引擎与降级（fts+语义未配=引导文案行） */
    function kbSystemAddon(kbContext: string): string {
        const engineLine = kbEngineNote === "semantic" ? "（语义检索）" : "（关键词检索）";
        let guide = "";
        if (kbEngineNote === "fts") guide = "\n（当前为关键词检索。语义检索更准：思源 设置→AI→配置嵌入模型，一次性成本约几块钱，之后全库自动建库。）";
        return `\n\n## 知识库检索结果${engineLine}\n以下是与用户问题最相关的笔记块，回答知识库问题时优先依据它们（可引用其路径）：\n${kbContext}${guide}`;
    }

    async function send() {
        const q = ps.draft.trim();
        if (!q || busy) return;
        const cfg = await ensureCfg();
        if (!cfg) return;
        // agentrev □4：领域知识（直接披露全文）+Skill（只注简介）随 system 常驻——每问重拉
        // （文档可能被编辑，快照语义与当前文档一致）；读取失败的条目注入段内降级占位不炸发送
        const [doc, knowledgeSnaps, skillSnaps] = await Promise.all([
            snapshotDoc(),
            fetchDocSnapshots(agentKnowledgeDocs.get() ?? [], ctxFetchers),
            fetchDocSnapshots(agentSkillDocs.get() ?? [], ctxFetchers),
        ]);
        const knowledgeSec = buildKnowledgeSection(knowledgeSnaps);
        const skillSec = buildSkillSection(skillSnaps);
        // agentqa □3：发送即捕获线程 key——中途切文档，问答对仍落原线程（后台完成，切回可见）
        const th = panelThreadKey();
        const userMsg: PanelMsg = { role: "user", content: q, docTitle: doc.title };
        appendThreadMsg(th, userMsg);
        ps.draft = "";

        busy = true;
        ps.active = { role: "assistant", content: "", status: "thinking", tools: [], docTitle: doc.title };
        controller = new AbortController();
        const t0 = Date.now();
        try {
            const caller = createGatedCaller(createFrontendToolEnv(getTomatoPluginInstance() as any));
            const client = new OpenAIClient(cfg.apiKey, cfg.baseURL);
            // □7 知识库预检索：开时问句先检索，结果拼 system（确定性供给，不赌模型自觉调工具）
            let kbContext = "";
            if (kbOn) kbContext = await kbSearch(q);
            // 历史只回灌文本对（工具往返留在循环内部），system 每问重注新快照；
            // agentqa □4：滑窗宽度可配（含当问总条数，钳 2~40，默认 8=旧 slice(-8,-1) 等价）
            const history: ChatCompletionMessageParam[] = pickHistoryMsgs(ps.msgs, clampHistoryMsgs(agentHistoryMsgs.get()))
                .map(m => ({ role: m.role, content: m.content } as ChatCompletionMessageParam));
            const messages: ChatCompletionMessageParam[] = [
                { role: "system", content: buildSystem(doc, knowledgeSec, skillSec) + (kbContext ? kbSystemAddon(kbContext) : "") },
                ...history,
                { role: "user", content: q },
            ];
            const r = await runAgentLoop({
                createStream: (ms, tools, signal) => client.createStreamPublic(cfg.model, ms, signal, tools) as any,
                caller,
                tools: caller.tools,
                messages,
                // agentrev □2：轮数上限可配（bear ②「短链最多 4 轮可以配置」）；空/坏值回默认 20，钳 1~30（agentqa □1）
                maxTurns: Math.min(30, Math.max(1, Number(agentMaxTurns.get()) || 20)),
                signal: controller.signal,
                onEvent: e => {
                    if (e.type === "text" || e.type === "reasoning") {
                        // agentrev □6：reasoning_content 分离展示（推理流不混进答案正文），
                        // 正文走节流 markdown 渲染（startStreamRender）
                        if (ps.active) ps.active = e.type === "text"
                            ? { ...ps.active, content: ps.active.content + e.delta, status: "streaming" }
                            : { ...ps.active, reasoning: (ps.active.reasoning ?? "") + e.delta, status: "streaming" };
                        startStreamRender();
                    } else if (e.type === "tool_call") {
                        // 卡面 action 取输入参数的 action 字段（e2e 实锤：result.data 无此字段，旧取法恒落 args 原文截断）
                        let action = "";
                        try {
                            action = String(JSON.parse(e.call.args || "{}")?.action ?? "");
                        } catch { action = ""; }
                        if (ps.active) ps.active = {
                            ...ps.active,
                            tools: [...(ps.active.tools ?? []), {
                                name: e.call.name,
                                action,
                                // ms 优先取工具真实耗时（gated caller 剔除人审等待的 _innerMs——
                                // edit/run_js 卡面不再显示「对话框挂起几分钟」的假耗时）
                                ms: (e.result as any)?._innerMs ?? e.ms,
                                ok: e.result.success,
                            }],
                        };
                    }
                },
            });
            if (r.ok) {
                const finalText = (r.messages?.at(-1)?.content as string) ?? "";
                appendThreadMsg(th, { role: "assistant", content: finalText, tools: ps.active?.tools ?? [], docTitle: doc.title });
                ps.active = null;
                debugLog("agent_panel", `q=${q.length}ch turns=ok tools=${active2count(r.messages)} kb=${knowledgeSnaps.filter(s => s.ok).length} sk=${skillSnaps.filter(s => s.ok).length} ${Date.now() - t0}ms model=${cfg.model}`, "aiagent");
            } else if (controller.signal.aborted) {
                // 用户主动停止：半截内容保留为一条完成消息
                appendThreadMsg(th, { role: "assistant", content: ps.active?.content ?? "", tools: ps.active?.tools ?? [], docTitle: doc.title });
                ps.active = null;
            } else if (r.error === "max_turns") {
                if (ps.active) ps.active = { ...ps.active, status: "error", content: tomatoI18n.工具轮上限 };
            } else {
                // agentrev □6：请求失败/流中断/空响应不再吞掉已流出的半截回答——保留正文，失败说明附尾
                const partial = (ps.active?.content ?? "").trim();
                if (ps.active) ps.active = {
                    ...ps.active,
                    status: "error",
                    content: partial ? `${partial}\n\n---\n${tomatoI18n.部分回答提示}` : tomatoI18n.请求失败,
                };
            }
        } finally {
            busy = false;
            controller = null;
            stopStreamRender();
        }
    }

    function active2count(messages?: ChatCompletionMessageParam[]): number {
        return (messages ?? []).filter(m => m.role === "tool").length;
    }

    /** agentrev □5 提示词命令注入口（mount 返回的 exports，AgentBox 命令回调调用）：
     *  零常驻落点=进会话用户消息（走 send 全链路=当前文档/领域知识上下文照常注入），
     *  面板空闲即自动发送（命令感），忙碌只填入输入框不打断进行中的回答 */
    export function injectPrompt(text: string) {
        const t = text.trim();
        if (!t) return;
        ps.draft = t;
        if (!busy) void send();
    }

    function stop() {
        controller?.abort();
    }

    function clearAll() {
        if (busy) stop();
        clearCurrentThread();
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            void send();
        }
    }
</script>

<div class="agent-panel">
    <!-- 头部：文档跟随指示 + 清空 -->
    <div class="agent-panel__doc">
        <svg class="agent-panel__docicon"><use xlink:href="#iconFile"></use></svg>
        <span class="agent-panel__doctitle" title={docTitle}>{tomatoI18n.将随当前文档}{docTitle ? `：${docTitle}` : ""}</span>
        <span class="fn__flex-1"></span>
        {#if kbOn}
            <!-- agentrev □6 收次要位：开关态平铺徽标（默认关零打扰；开着时范围不藏 hover）。
                 渲染在 kb 钮左侧=宽度变化由 fn__flex-1 吸收，右侧按钮组零位移——否则开关/切档
                 徽标宽度变化会推移按钮，鼠标原位点不中第二次（bear 09-11 反馈） -->
            <span class="agent-panel__kbbadge">{kbScope === "all" ? tomatoI18n.全库 : tomatoI18n.当前笔记本}</span>
        {/if}
        <span class="block__icon block__icon--show b3-tooltips b3-tooltips__sw" role="button" tabindex="0"
              aria-label={tomatoI18n.知识库检索 + (kbOn ? " · " + (kbScope === "all" ? tomatoI18n.全库 : tomatoI18n.当前笔记本) : "")}
              class:agent-panel__kb--on={kbOn}
              onclick={() => { if (kbOn && kbScope === "all") { kbScope = "box"; } else if (kbOn) { kbOn = false; kbScope = "all"; } else { kbOn = true; } } }
              onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}>
            <svg><use xlink:href="#iconSearch"></use></svg>
        </span>
        {#if ps.canUndo}
            <span class="block__icon block__icon--show b3-tooltips b3-tooltips__sw" role="button" tabindex="0"
                  aria-label={tomatoI18n.撤销修改} onclick={() => void undoLastEdit()}
                  onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void undoLastEdit(); } }}>
                <svg><use xlink:href="#iconUndo"></use></svg>
            </span>
        {/if}
        <span class="block__icon block__icon--show b3-tooltips b3-tooltips__sw" role="button" tabindex="0"
              aria-label={tomatoI18n.清空} onclick={clearAll}
              onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clearAll(); } }}>
            <svg><use xlink:href="#iconTrashcan"></use></svg>
        </span>
    </div>
    <!-- 消息区 -->
    <div class="agent-panel__msgs fn__flex-1" role="log" aria-live="polite" bind:this={msgsEl}>
        {#if ps.msgs.length === 0 && !ps.active}
            <div class="agent-panel__empty">{tomatoI18n.AI面板空态}</div>
        {/if}
        {#each ps.msgs as m}
            {#if m.role === "user"}
                <div class="agent-panel__msg agent-panel__msg--user">
                    <div class="agent-panel__bubble">{m.content}</div>
                </div>
            {:else}
                <div class="agent-panel__msg agent-panel__msg--ai">
                    {#if m.tools?.length}
                        <div class="agent-panel__tools">
                            {#each m.tools as t}
                                <span class="agent-panel__tool" class:agent-panel__tool--err={!t.ok}>
                                    <svg><use xlink:href="#iconPlugin"></use></svg>{t.name}{t.action ? `·${t.action}` : ""} {t.ms}ms
                                </span>
                            {/each}
                        </div>
                    {/if}
                    <div class="agent-panel__bubble agent-panel__md">{@html renderMD(m.content)}</div>
                </div>
            {/if}
        {/each}
        <!-- 进行中气泡：thinking→streaming（节流 markdown 渲染，完成后转正式消息）；
             reasoning_content 推理流分离展示（agentrev □6，不混进答案正文） -->
        {#if ps.active}
            <div class="agent-panel__msg agent-panel__msg--ai">
                {#if ps.active.tools?.length}
                    <div class="agent-panel__tools">
                        {#each ps.active.tools as t}
                            <span class="agent-panel__tool" class:agent-panel__tool--err={!t.ok}>
                                <svg><use xlink:href="#iconPlugin"></use></svg>{t.name}{t.action ? `·${t.action}` : ""} {t.ms}ms
                            </span>
                        {/each}
                    </div>
                {/if}
                {#if ps.active.status === "thinking"}
                    <div class="agent-panel__bubble agent-panel__thinking">{tomatoI18n.思考中}…</div>
                {:else}
                    {#if ps.active.reasoning}
                        <div class="agent-panel__reasoning"><span class="agent-panel__rlabel">{tomatoI18n.思考过程}</span>{ps.active.reasoning}</div>
                    {/if}
                    <div class="agent-panel__bubble agent-panel__md agent-panel__streaming">{@html renderMD(streamView || ps.active.content)}</div>
                {/if}
            </div>
        {/if}
    </div>
    <!-- 输入区 -->
    {#if kbOn && kbEngineNote === "fts"}
        <div class="agent-panel__kbnote">{tomatoI18n.语义未启用提示}</div>
    {/if}
    <div class="agent-panel__inputrow">
        <textarea class="agent-panel__input b3-text-field" rows="3" placeholder={tomatoI18n.AI面板占位}
                  bind:value={ps.draft} onkeydown={onKeydown} disabled={busy}></textarea>
        {#if busy}
            <button class="b3-button b3-button--outline" onclick={stop}>{tomatoI18n.停止生成}</button>
        {:else}
            <button class="b3-button" onclick={() => void send()} disabled={!ps.draft.trim()}>{tomatoI18n.发送}</button>
        {/if}
    </div>
</div>

<style>
    .agent-panel {
        /* 官方 .fn__flex-column 在本内核 CSS 不含 display:flex（vision 实证）——
           面板高度须自撑（CommentBox .tomato-panel 同款配方），否则 msgs 塌缩输入区漂移；
           flex:1 对接壳层 #eleID（fn__flex column 容器）的拉伸位 */
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0; /* flex 子项防溢出：消息区滚动前提 */
    }
    .agent-panel__doc {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-bottom: 1px solid var(--b3-border-color);
        font-size: 12px;
        color: var(--b3-theme-on-surface);
    }
    .agent-panel__docicon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
    }
    .agent-panel__doctitle {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .agent-panel__msgs {
        overflow-y: auto;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: 0;
    }
    .agent-panel__empty {
        color: var(--b3-theme-on-surface-light);
        font-size: 12px;
        text-align: center;
        padding: 8px;
        margin: auto 0; /* 消息区 flex 列内垂直居中（vision P2：贴顶重心失衡） */
        white-space: pre-line;
    }
    .agent-panel__msg--user {
        display: flex;
        justify-content: flex-end;
    }
    .agent-panel__msg--user .agent-panel__bubble {
        /* 主题色 10% 底（AnnoChat 气泡同款配方：--b3-list-item-hover 在深色下近不可辨，vision 评审 P1）；
           暗色 14% 分支对齐 AnnoChat（深底需更高浓度，vision P2） */
        background: color-mix(in srgb, var(--b3-theme-primary) 10%, transparent);
        border-radius: 8px;
        padding: 6px 10px;
        max-width: 85%;
        white-space: pre-wrap;
        word-break: break-word;
    }
    :global(html[data-theme-mode="dark"]) .agent-panel__msg--user .agent-panel__bubble {
        background: color-mix(in srgb, var(--b3-theme-primary) 14%, transparent);
    }
    .agent-panel__msg--ai .agent-panel__bubble {
        /* surface 亮色下与面板底同值不可辨（AnnoChat 同坑先例）——lighter 提一档；
           inline-block=短回答 hug-content 不恒撑满行宽（vision P2，用户气泡同款不对称修复） */
        display: inline-block;
        max-width: 100%;
        background: var(--b3-theme-surface-lighter);
        border: 1px solid var(--b3-border-color);
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 13px;
        word-break: break-word;
    }
    /* markdown 正文排版走思源协议字号/间距，列表/代码块收紧边距 */
    .agent-panel__md :global(p) { margin: 4px 0; }
    /* ul/ol 无 padding-left 时 outside 圆点悬挂出气泡 padding 盒（vision P1） */
    .agent-panel__md :global(ul), .agent-panel__md :global(ol) { padding-left: 20px; margin: 4px 0; }
    .agent-panel__md :global(li) { margin: 2px 0; }
    .agent-panel__md :global(pre) {
        background: var(--b3-theme-background);
        border-radius: 4px;
        padding: 6px 8px;
        overflow-x: auto;
        margin: 4px 0;
    }
    .agent-panel__md :global(code) { font-size: 12px; }
    .agent-panel__md :global(pre code) { font-family: var(--b3-font-family-code); }
    .agent-panel__reasoning {
        /* 推理流（reasoning_content）分离展示：次级视觉不与答案争层级；限高防长思考流挤爆面板 */
        font-size: 11px;
        color: var(--b3-theme-on-surface-light);
        background: var(--b3-theme-surface);
        border-left: 2px solid var(--b3-border-color);
        border-radius: 0 4px 4px 0;
        padding: 4px 8px;
        margin-bottom: 4px;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 120px;
        overflow-y: auto;
    }
    .agent-panel__rlabel {
        display: block;
        font-weight: 600;
        margin-bottom: 2px;
    }
    /* 流式生成指示（vision P2）：尾随闪烁光标，静态画面下也能看出「还在生成」 */
    .agent-panel__streaming::after {
        content: "▍";
        margin-left: 2px;
        color: var(--b3-theme-primary);
        animation: agentpanel-blink 1s step-end infinite;
    }
    @keyframes agentpanel-blink {
        50% { opacity: 0; }
    }
    .agent-panel__thinking {
        color: var(--b3-theme-on-surface-light);
    }
    .agent-panel__tools {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 4px;
    }
    .agent-panel__tool {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        color: var(--b3-theme-on-surface-light);
        background: var(--b3-theme-surface);
        border: 1px solid var(--b3-border-color);
        border-radius: 4px;
        padding: 2px 6px; /* vision P2：字面贴框，纵向 1→2px */
    }
    .agent-panel__tool svg { width: 11px; height: 11px; }
    .agent-panel__tool--err { color: var(--b3-card-error-color); border-color: var(--b3-card-error-color); }
    .agent-panel__inputrow {
        display: flex;
        gap: 6px;
        padding: 8px;
        border-top: 1px solid var(--b3-border-color);
        align-items: flex-end;
    }
    .agent-panel__kbnote {
        font-size: 11px;
        color: var(--b3-theme-on-surface-light);
        padding: 2px 8px;
        border-top: 1px solid var(--b3-border-color);
    }
    .agent-panel__kb--on {
        color: var(--b3-theme-primary);
    }
    .agent-panel__kbbadge {
        /* kb 开关态平铺徽标（agentrev □6）：实底 primary+白字=官方活动 chip 同构，
           双主题恒 ≈4.6:1（透明底掺色在暗色仅 3.6:1，vision P1）；关=零打扰不渲染 */
        font-size: 11px;
        color: #fff;
        background: var(--b3-theme-primary);
        border-radius: 4px;
        padding: 1px 6px;
        flex-shrink: 0;
        white-space: nowrap;
    }
    .agent-panel__input {
        flex: 1;
        resize: none;
        min-height: 0;
    }
</style>
