// skills 工具（A 层，□4）：把插件工具使用文档（SKILL.md）作为工具暴露给 AI 按需拉取，
// 减少试错轮次=省 token（tasknote get_siyuan_skills 同模式）。文档编译期内联（?raw）——
// kernel goja 读不了插件包文件，内联=双门脸同源零运行时 IO；包内 skills/ 文件由
// vite-static-copy 同步分发（静态可见性，用户/浏览器可直接读）。
// 文档事实源=src/agentSkills/SKILL.md，改文档只改它。
// agentrev □4 扩内容源：前端门脸（env 具备 getAgentDocs+readBlockMarkdown）另挂用户 Skill——
// 不带参数返回手册+用户 Skill 清单（名字+简介），name 参数返回该 Skill 全文（运行时读用户
// 选的文档，bear ④ 渐进披露）。kernel 门脸缺此面：skills 保持纯插件手册语义，MCP 能力面不变。
import skillsMd from "../../agentSkills/SKILL.md?raw";
import { objectSchema, successResponse, errorResponse, wrapHandler, type ToolDefinition } from "./common";
import type { ToolEnv } from "./env";
import { briefOf, sqlInList } from "../agentContext";

/** 文档原文（单测/外露用；事实源=src/agentSkills/SKILL.md） */
export const skillsDoc = skillsMd;

/** 该门脸是否具备用户 Skill 面（缺任一能力即整段缺席——能力水线，勿给 AI 永远失败的承诺） */
function hasUserSkillsFace(env?: ToolEnv): boolean {
    return !!env?.getAgentDocs && !!env?.readBlockMarkdown;
}

export interface UserSkillEntry {
    id: string;
    /** 文档标题（SQL 反查，改名即随）；查无=空串 */
    name: string;
}

/** 用户 Skill 条目运行时解析（id→标题）；任何失败都静默回空/降级（Skill 段缺席不炸工具） */
export async function listUserSkills(env?: ToolEnv): Promise<UserSkillEntry[]> {
    if (!hasUserSkillsFace(env)) return [];
    let ids: string[] = [];
    try {
        ids = (await env!.getAgentDocs!()).skills ?? [];
    } catch {
        return [];
    }
    const uniq = [...new Set(ids.filter(Boolean))];
    if (!uniq.length) return [];
    try {
        const rows = await env!.sql(`select id, content from blocks where id in (${sqlInList(uniq)})`);
        const byID = new Map((rows ?? []).map((r: any) => [String(r?.id), String(r?.content ?? "").trim()]));
        return uniq.map(id => ({ id, name: byID.get(id) ?? "" }));
    } catch {
        return uniq.map(id => ({ id, name: "" }));
    }
}

function buildSkillsDescription(env?: ToolEnv): string {
    const base = [
        "番茄插件 AI 工具使用文档（pomodoro/search/coze 的参数契约、常见坑与配置指引）。",
        "首次调用番茄工具前或工具报错拿不准原因时拉取本文档，可减少试错轮次；无参数，返回全量 markdown。",
    ];
    if (hasUserSkillsFace(env)) {
        base.push(
            "另含用户挑选的 Skill：不带参数同时返回插件手册与 Skill 清单（名字+简介）；"
            + "带 name 参数（技能名或文档 id）返回该 Skill 全文，回答技能相关问题前先拉全文。",
        );
    }
    return base.join("");
}

export function createSkillsTool(env?: ToolEnv): ToolDefinition {
    return {
        name: "skills",
        config: objectSchema(buildSkillsDescription(env), {
            name: {
                type: "string",
                description: "技能名（清单里的名字）或文档 id——返回该 Skill 全文；缺省=插件手册+Skill 清单",
            },
        }),
        handler: wrapHandler(async (input) => {
            const name = String(input?.name ?? "").trim();
            if (name) {
                const skills = await listUserSkills(env);
                const hit = skills.find(s => s.name === name) ?? skills.find(s => s.id === name);
                if (!hit) {
                    const available = skills.length
                        ? `可用：${skills.map(s => s.name || s.id).join("、")}`
                        : "当前未配置任何用户 Skill";
                    return errorResponse(`未找到名为「${name.slice(0, 40)}」的 Skill。${available}（skills 不带参数可取手册与 Skill 清单）`);
                }
                const { markdown } = await env!.readBlockMarkdown!(hit.id);
                return successResponse({
                    name: hit.name || hit.id,
                    document: markdown ?? "",
                    hint: "document=该 Skill 全文（markdown）；按它内容作答/执行",
                });
            }
            const data: Record<string, any> = {
                document: skillsMd,
                hint: "document=完整使用文档（markdown）；先读「通用契约」节再按需跳各工具节",
            };
            const skills = await listUserSkills(env);
            if (skills.length) {
                // 简介要读全文提炼：条目数=用户手选的文档数（个位数），逐发可承受
                const briefs = await Promise.all(skills.map(async s => {
                    try {
                        const { markdown } = await env!.readBlockMarkdown!(s.id);
                        return { name: s.name || s.id, brief: briefOf(markdown ?? "") };
                    } catch {
                        return { name: s.name || s.id, brief: "" };
                    }
                }));
                data.skills = briefs;
                data.hint += "；skills=用户 Skill 清单（名字+简介），带 name 参数可拉全文";
            }
            return successResponse(data);
        }),
    };
}
