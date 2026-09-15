// AI 输出 markdown → 安全 HTML（AgentPanel 首创，knowledgebox □3 起抽公共单一事实源）：
// Lute Md2HTML（NewConfiguredLute 开行内语法旗标——裸 NewLute 不解析行内语法落字面星号）
// + 消毒兜底。解析失败回 ""，调用方自行回退纯文本。
import { NewConfiguredLute } from "./globals";

let lute: any = null;

/** markdown → 消毒后 HTML；失败回 ""（流式半截 md 等场景，调用方回退纯文本展示） */
export function renderMD(md: string): string {
    if (!lute) lute = NewConfiguredLute() as any;
    try {
        return sanitizeHTML(lute.Md2HTML(md) ?? "");
    } catch {
        return "";
    }
}

/** AI 输出不可全信（虽经 Lute 转义，兜一层）：剥可执行节点/事件属性/js: 协议 */
export function sanitizeHTML(html: string): string {
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
