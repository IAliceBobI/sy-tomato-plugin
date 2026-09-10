// 行级 LCS diff（ai-agent □6 受控编辑预览）：edit 工具确认弹窗用——旧/新 markdown 逐行对比，
// 红删绿增。纯函数零 DOM 零 Svelte，单测直跑（tests/unit/agentDiff.test.ts）。
// 不引外部 diff 库：块级编辑的行数通常几十行，O(n·m) DP 完全够用且零依赖。

export interface DiffLine {
    type: "ctx" | "del" | "add";
    text: string;
}

/** 行拆分：统一 \n、剥尾部空行差异（末尾换行与否不该算 diff）；空串=零行 */
function toLines(s: string): string[] {
    const t = (s ?? "").replaceAll("\r\n", "\n");
    if (t === "") return [];
    const lines = t.split("\n");
    while (lines.length > 1 && lines.at(-1) === "") lines.pop();
    return lines;
}

export function lineDiff(oldText: string, newText: string): DiffLine[] {
    const a = toLines(oldText);
    const b = toLines(newText);
    const n = a.length;
    const m = b.length;
    // LCS 长度表（(n+1)×(m+1)）
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }
    // 回溯产出 diff 行（del 在 add 前——删除然后新增的阅读序）
    const out: DiffLine[] = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
        if (a[i] === b[j]) {
            out.push({ type: "ctx", text: a[i] });
            i++; j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            out.push({ type: "del", text: a[i] });
            i++;
        } else {
            out.push({ type: "add", text: b[j] });
            j++;
        }
    }
    while (i < n) { out.push({ type: "del", text: a[i] }); i++; }
    while (j < m) { out.push({ type: "add", text: b[j] }); j++; }
    // IAL 属性行（{: id=…}）是块更新必带的实现细节，红绿全强度展示徒增「天书」噪音
    // 诱发直接放行（vision P2）——降为 ctx 灰
    for (const l of out) {
        if (l.type !== "ctx" && /^\{:\s*(id|updated)/.test(l.text.trim())) l.type = "ctx";
    }
    // 全 ctx（含 IAL 降级后无任何增删）=内容未变，回空让 UI 直接跳过预览
    return out.some(l => l.type !== "ctx") ? out : [];
}
