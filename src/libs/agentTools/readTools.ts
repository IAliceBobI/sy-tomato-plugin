// read 只读工具（agentrev □4，bear ③ 拍板「引用文件=渐进披露 AI 自拉」）：按 id 拉块/文档
// 全文——领域知识与当前文档里的 ((id '文字')) 块引用、{: id="…"} 块 id、siyuan://blocks/…
// 链接都不随正文展开，需要被引内容时 AI 用本工具按需拉取（大文档膨胀靠此自然化解）。
// 只读零人审；装配走面板专属（createPanelOnlyTools）——kernel env 不实现 readBlockMarkdown，
// 即使误装配也不生效，MCP 面工具清单不变（红线：对外恒只读且面不扩）。
import { objectSchema, successResponse, errorResponse, wrapHandler, type ToolDefinition } from "./common";
import type { ToolEnv } from "./env";

/** 单次返回上限（字符）：须大于领域知识注入截断（16k）——截断的知识文档能用本工具取到余下部分 */
const READ_CAP = 40000;

export function createReadTool(env: ToolEnv): ToolDefinition | null {
    if (!env.readBlockMarkdown) return null;
    return {
        name: "read",
        config: objectSchema(
            "按 id 读取一个块或一篇文档的全文（markdown）。领域知识、当前文档或检索结果里出现的 "
            + "((id '文字')) 块引用与 siyuan://blocks/… 链接都不含被引正文——需要时用本工具按 id 拉取；"
            + "文档 id=整篇文档（含全部子块），块 id=该块自身。超长自动截断，可带 offset 续读。",
            {
                id: { type: "string", description: "块 id 或文档 id（14 位时间戳-7 位字符形态，非标题）" },
                offset: { type: "number", description: "起始字符偏移（默认 0；截断时从上次的 offset 续读）" },
            },
            ["id"],
        ),
        handler: wrapHandler(async (input) => {
            const id = String(input.id ?? "").trim();
            if (!id) {
                return errorResponse("id 缺失：请提供块 id 或文档 id（14 位时间戳-7 位字符形态，非标题）");
            }
            let offset = Number(input.offset);
            if (!Number.isFinite(offset) || offset < 0) offset = 0;
            const { markdown } = await env.readBlockMarkdown!(id);
            const full = markdown ?? "";
            if (offset >= full.length) {
                return errorResponse(`offset ${offset} 超出全文长度 ${full.length}（从头读不带 offset）`);
            }
            const slice = full.slice(offset, offset + READ_CAP);
            return successResponse({
                markdown: slice,
                offset,
                length: full.length,
                truncated: offset + slice.length < full.length,
                hint: "truncated=true 时带 offset=offset+本次返回长度 续读；文档 id 返回整篇（含子块）",
            });
        }),
    };
}
